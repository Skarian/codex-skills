import path from "node:path";
import { startRelayServer } from "./server.mjs";
import { relayRoot } from "./store.mjs";
import {
  DEFAULT_RELAY_PORT,
  readRelayHealth,
  relayUrl,
} from "./relay-client.mjs";
export { DEFAULT_RELAY_PORT, discoverRelayUrl, readRelayHealth, relayUrl } from "./relay-client.mjs";

async function relayPortConflict({ port, cause }) {
  const url = relayUrl(port);
  let detail = "";
  try {
    const health = await readRelayHealth(url);
    const owner = [
      health.pid ? `pid ${health.pid}` : null,
      health.root ? `root ${health.root}` : null,
    ].filter(Boolean).join(", ");
    detail = owner ? ` Existing Relay: ${owner}.` : " Existing Relay responded on the port.";
  } catch {
    detail = " The port is not serving a healthy Relay endpoint.";
  }
  const error = new Error(
    `Relay HTTP port ${port} is already in use.${detail} Stop the other process and restart the MCP host.`,
  );
  error.code = "EADDRINUSE";
  error.cause = cause;
  return error;
}

export async function ensureRelayService({
  root = relayRoot(),
  port = process.env.RELAY_PORT || DEFAULT_RELAY_PORT,
} = {}) {
  const resolvedRoot = path.resolve(root);
  const resolvedPort = Number(port);
  try {
    const service = await startRelayServer({ root: resolvedRoot, port: resolvedPort });
    return { ...service, owner: true };
  } catch (error) {
    if (error.code !== "EADDRINUSE") {
      throw error;
    }
    throw await relayPortConflict({ port: resolvedPort, cause: error });
  }
}
