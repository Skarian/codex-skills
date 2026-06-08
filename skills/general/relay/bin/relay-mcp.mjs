#!/usr/bin/env node
import readline from "node:readline";
import { ensureRelayService } from "../src/service.mjs";
import { RelayStore, relayRoot } from "../src/store.mjs";
import { waitForEvents } from "../src/wait.mjs";

const PROTOCOL_VERSION = "2025-11-25";
const CLIENT = "agent";
const RELAY_EVENTS = ["relay.message", "relay.closed"];
const TOOL = {
  name: "relay",
  description: "Wait on the open Relay app, or send an opaque reply and wait again.",
  inputSchema: {
    type: "object",
    description: "Use {} to wait. Use any non-empty object as the opaque reply payload.",
    additionalProperties: true,
  },
};

function write(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function ok(id, value) {
  write({ jsonrpc: "2.0", id, result: value });
}

function fail(id, code, message) {
  write({ jsonrpc: "2.0", id, error: { code, message } });
}

function toolResult(value) {
  return {
    content: [{ type: "text", text: JSON.stringify(value) }],
    structuredContent: value,
  };
}

function isEmptyObject(value) {
  return !value || Object.keys(value).length === 0;
}

const root = relayRoot();
let service;
try {
  service = await ensureRelayService({ root });
} catch (error) {
  console.error(`Relay startup failed: ${error.message}`);
  process.exit(1);
}
const store = new RelayStore({ root });
const waits = new Map();

function currentRelay() {
  const relay = store.findClientRelay(CLIENT);
  if (!relay) {
    throw new Error("No app has opened a Relay yet.");
  }
  return relay;
}

function submitReply(input, relay) {
  const cursor = store.ackThrough({ relayId: relay.relayId, client: CLIENT });
  const pendingEvent = store.pollEvents({
    relayId: relay.relayId,
    client: CLIENT,
    cursor,
    limit: 1,
    types: RELAY_EVENTS,
  })[0];
  if (pendingEvent?.type === "relay.closed") {
    return cursor;
  }
  const pendingSeq = store.agentPendingSeq({ relayId: relay.relayId });
  if (isEmptyObject(input)) {
    if (pendingSeq) {
      throw new Error("Relay is waiting for a reply to the delivered app message.");
    }
    return cursor;
  }
  if (!pendingSeq) {
    throw new Error("Relay has no delivered app message to reply to.");
  }
  store.replyToRelay({
    relayId: relay.relayId,
    payload: input,
    ackThrough: pendingSeq,
  });
  return pendingSeq;
}

function formatEvent(relay, event) {
  const payload = event.payload;
  if (event.type === "relay.closed") {
    const envelope = payload && typeof payload === "object" ? payload : {};
    return {
      status: "closed",
      appName: relay.appName,
      reason: envelope.reason || "closed",
      payload: Object.hasOwn(envelope, "payload") ? envelope.payload : {},
    };
  }
  return {
    status: "message",
    appName: relay.appName,
    payload,
  };
}

async function callRelay(id, input) {
  const relay = currentRelay();
  const owner = `${process.pid}:${id}`;
  store.acquireWait({ relayId: relay.relayId, owner, pid: process.pid });
  const controller = new AbortController();
  waits.set(id, controller);
  try {
    const cursor = submitReply(input, relay);
    const waited = await waitForEvents(store, {
      relayId: relay.relayId,
      client: CLIENT,
      cursor,
      types: RELAY_EVENTS,
      signal: controller.signal,
    });
    const event = waited.events[0];
    if (event.type === "relay.message" || event.type === "relay.closed") {
      store.ackEvents({ relayId: relay.relayId, client: CLIENT, through: event.seq });
    }
    ok(id, toolResult(formatEvent(relay, event)));
  } finally {
    waits.delete(id);
    store.releaseWait({ owner });
  }
}

async function handleRequest(message) {
  const { id, method, params = {} } = message;
  try {
    if (method === "initialize") {
      ok(id, {
        protocolVersion: params.protocolVersion || PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "relay", version: "0.1.0" },
      });
    } else if (method === "tools/list") {
      ok(id, { tools: [TOOL] });
    } else if (method === "tools/call" && params.name === TOOL.name) {
      await callRelay(id, params.arguments || {});
    } else if (method === "ping") {
      ok(id, {});
    } else {
      fail(id, -32601, `Method not found: ${method}`);
    }
  } catch (error) {
    fail(id, -32000, error.message);
  }
}

function handleNotification(message) {
  if (message.method === "notifications/cancelled") {
    waits.get(message.params?.requestId)?.abort();
  }
}

const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on("line", (line) => {
  if (!line.trim()) return;
  try {
    const message = JSON.parse(line);
    if (Object.hasOwn(message, "id")) void handleRequest(message);
    else handleNotification(message);
  } catch (error) {
    fail(null, -32700, error.message);
  }
});

rl.on("close", () => {
  for (const controller of waits.values()) controller.abort();
  store.close();
  void service.close();
});
