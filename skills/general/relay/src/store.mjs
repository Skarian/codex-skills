import { mkdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export function relayRoot() {
  return path.resolve(process.env.RELAY_DATA_DIR || path.join(os.homedir(), ".skills", "relay"));
}

export function relayDbPath(root = relayRoot()) {
  return path.join(root, "relay.sqlite");
}

export function nowIso() {
  return new Date().toISOString();
}

export function timestampId(prefix) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}-${Math.random().toString(16).slice(2, 8)}`;
}

function parseJson(value) {
  return value === null || value === undefined ? null : JSON.parse(value);
}

function stringifyJson(value) {
  return JSON.stringify(value ?? null);
}

function hasColumn(db, table, column) {
  return db.prepare(`PRAGMA table_info(${table})`).all().some((row) => row.name === column);
}

function sideColumn(side) {
  if (side === "app") return "app_received_seq";
  if (side === "agent") return "agent_delivered_seq";
  throw new Error("side must be app or agent");
}

function rowToRelay(row) {
  if (!row) return null;
  return {
    relayId: row.id,
    appName: row.app_name,
    status: row.status,
    payload: parseJson(row.payload_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    closedAt: row.closed_at || null,
  };
}

function rowToMessage(row) {
  if (!row) return null;
  const payload = parseJson(row.payload_json);
  return {
    seq: row.seq,
    eventId: row.event_id,
    relayId: row.relay_id,
    type: `relay.${row.kind === "message" ? "message" : row.kind}`,
    payload: row.kind === "reply"
      ? { inReplyTo: row.in_reply_to ?? null, payload }
      : payload,
    createdAt: row.created_at,
  };
}

export class RelayStore {
  constructor({ root = relayRoot() } = {}) {
    this.root = path.resolve(root);
    mkdirSync(this.root, { recursive: true });
    this.dbPath = relayDbPath(this.root);
    this.db = new DatabaseSync(this.dbPath);
    this.db.exec("PRAGMA journal_mode = WAL");
    this.db.exec("PRAGMA foreign_keys = ON");
    this.#migrate();
  }

  close() {
    this.db.close();
  }

  #migrate() {
    if (!hasColumn(this.db, "relays", "agent_delivered_seq")) {
      this.db.exec(`
        DROP TABLE IF EXISTS acks;
        DROP TABLE IF EXISTS events;
        DROP TABLE IF EXISTS messages;
        DROP TABLE IF EXISTS relays;
        DROP TABLE IF EXISTS waiter;
        DROP TABLE IF EXISTS waiters;
      `);
    }
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS relays (
        id TEXT PRIMARY KEY,
        app_name TEXT NOT NULL,
        status TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        app_received_seq INTEGER NOT NULL DEFAULT 0,
        agent_delivered_seq INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        closed_at TEXT
      );

      CREATE TABLE IF NOT EXISTS messages (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL UNIQUE,
        relay_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        in_reply_to INTEGER,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (relay_id) REFERENCES relays(id)
      );

      CREATE TABLE IF NOT EXISTS waiter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        relay_id TEXT NOT NULL,
        owner TEXT NOT NULL,
        pid INTEGER NOT NULL,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS service_runtime (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        url TEXT NOT NULL,
        host TEXT NOT NULL,
        port INTEGER NOT NULL,
        pid INTEGER,
        root TEXT NOT NULL,
        db_path TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS relays_open_app
        ON relays(app_name, status, created_at);
      CREATE INDEX IF NOT EXISTS messages_relay_kind
        ON messages(relay_id, kind, seq);
    `);
  }

  createRelay({ appName, payload = {} }) {
    if (typeof appName !== "string" || !appName.trim()) {
      throw new Error("appName is required");
    }
    const normalizedAppName = appName.trim();
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.findOpenRelay();
      if (existing) {
        if (existing.appName !== normalizedAppName) {
          const error = new Error(`Relay already open for app: ${existing.appName}`);
          error.status = 409;
          throw error;
        }
        const after = this.ackThrough({ relayId: existing.relayId, client: "app" });
        this.db.exec("COMMIT");
        return { relay: existing, created: false, after };
      }
      const id = timestampId("relay");
      const at = nowIso();
      this.db.prepare(`
        INSERT INTO relays
          (id, app_name, status, payload_json, created_at, updated_at, closed_at)
        VALUES (?, ?, 'open', ?, ?, ?, NULL)
      `).run(id, normalizedAppName, stringifyJson(payload), at, at);
      const relay = this.getRelay(id);
      this.db.exec("COMMIT");
      return { relay, created: true, after: 0 };
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }

  getRelay(relayId) {
    return rowToRelay(this.db.prepare("SELECT * FROM relays WHERE id = ?").get(relayId));
  }

  findOpenRelay() {
    return rowToRelay(this.db.prepare(`
      SELECT * FROM relays
      WHERE status = 'open'
      ORDER BY created_at DESC
      LIMIT 1
    `).get());
  }

  findClientRelay(client = "agent") {
    const open = this.findOpenRelay();
    if (open) return open;
    const column = sideColumn(client);
    const kinds = client === "app" ? "'reply', 'closed'" : "'message', 'closed'";
    return rowToRelay(this.db.prepare(`
      SELECT r.* FROM relays r
      WHERE EXISTS (
        SELECT 1 FROM messages m
        WHERE m.relay_id = r.id
          AND m.kind IN (${kinds})
          AND m.seq > r.${column}
      )
      ORDER BY r.updated_at DESC, r.created_at DESC
      LIMIT 1
    `).get());
  }

  listRelays({ appName = null, status = null } = {}) {
    const clauses = [];
    const params = [];
    if (appName) {
      clauses.push("app_name = ?");
      params.push(appName);
    }
    if (status) {
      clauses.push("status = ?");
      params.push(status);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    return this.db.prepare(`SELECT * FROM relays ${where} ORDER BY created_at DESC`).all(...params).map(rowToRelay);
  }

  resolveRelay({ relayId = null } = {}) {
    const relay = relayId ? this.getRelay(relayId) : this.findOpenRelay();
    if (!relay) throw new Error(relayId ? `Unknown relay: ${relayId}` : "No open relay");
    return relay;
  }

  sendToAgent({ relayId = null, payload = {} }) {
    const relay = this.resolveRelay({ relayId });
    if (relay.status !== "open") throw new Error(`Relay is not open: ${relay.relayId}`);
    return { relay, event: this.#append({ relayId: relay.relayId, kind: "message", payload }) };
  }

  replyToRelay({ relayId, payload = {}, ackThrough = null }) {
    const relay = this.resolveRelay({ relayId });
    if (relay.status !== "open") throw new Error(`Relay is not open: ${relay.relayId}`);
    const inReplyTo = ackThrough === null ? null : Number(ackThrough);
    const existing = inReplyTo === null ? null : this.db.prepare(`
      SELECT * FROM messages
      WHERE relay_id = ? AND kind = 'reply' AND in_reply_to = ?
      LIMIT 1
    `).get(relay.relayId, inReplyTo);
    const event = existing ? rowToMessage(existing) : this.#append({
      relayId: relay.relayId,
      kind: "reply",
      inReplyTo,
      payload,
    });
    const ack = inReplyTo === null ? null : this.ackEvents({ relayId: relay.relayId, client: "agent", through: inReplyTo });
    return { relay, event, ack };
  }

  closeRelay({ relayId, reason = "closed", payload = {} } = {}) {
    const relay = this.resolveRelay({ relayId });
    if (relay.status !== "open") return { relay, event: null };
    const at = nowIso();
    this.db.prepare(`
      UPDATE relays
      SET status = 'closed', updated_at = ?, closed_at = ?
      WHERE id = ?
    `).run(at, at, relay.relayId);
    const updated = this.getRelay(relay.relayId);
    return {
      relay: updated,
      event: this.#append({ relayId: updated.relayId, kind: "closed", payload: { reason, payload } }),
    };
  }

  latestSeq({ relayId }) {
    const row = this.db.prepare("SELECT COALESCE(MAX(seq), 0) AS seq FROM messages WHERE relay_id = ?").get(relayId);
    return Number(row?.seq || 0);
  }

  ackEvents({ relayId, client, through }) {
    const column = sideColumn(client);
    const current = this.ackThrough({ relayId, client });
    const next = Math.max(current, Number(through || 0));
    const at = nowIso();
    this.db.prepare(`UPDATE relays SET ${column} = ?, updated_at = ? WHERE id = ?`).run(next, at, relayId);
    return { relayId, client, through: next, updatedAt: at };
  }

  ackThrough({ relayId, client }) {
    const column = sideColumn(client);
    const row = this.db.prepare(`SELECT ${column} AS seq FROM relays WHERE id = ?`).get(relayId);
    return Number(row?.seq || 0);
  }

  pollEvents({ relayId, client, cursor = 0, limit = 50, types = null }) {
    const ack = this.ackThrough({ relayId, client });
    const lowerBound = Math.max(Number(cursor || 0), ack);
    const allowed = client === "app" ? ["reply", "closed"] : ["message", "closed"];
    const wanted = types
      ? types.map((type) => String(type).replace(/^relay\./, "")).filter((type) => allowed.includes(type))
      : allowed;
    if (!wanted.length) return [];
    const rows = this.db.prepare(`
      SELECT * FROM messages
      WHERE relay_id = ?
        AND seq > ?
        AND kind IN (${wanted.map(() => "?").join(", ")})
      ORDER BY seq ASC
      LIMIT ?
    `).all(relayId, lowerBound, ...wanted, Number(limit || 50));
    return rows.map(rowToMessage);
  }

  agentPendingSeq({ relayId }) {
    const delivered = this.ackThrough({ relayId, client: "agent" });
    if (!delivered) return 0;
    const row = this.db.prepare("SELECT kind FROM messages WHERE relay_id = ? AND seq = ?").get(relayId, delivered);
    if (row?.kind !== "message") return 0;
    const replied = this.db.prepare(`
      SELECT 1 FROM messages
      WHERE relay_id = ? AND kind = 'reply' AND in_reply_to = ?
      LIMIT 1
    `).get(relayId, delivered);
    return replied ? 0 : delivered;
  }

  acquireWait({ relayId, owner, pid }) {
    const existing = this.db.prepare("SELECT * FROM waiter WHERE id = 1").get();
    if (existing) {
      try {
        process.kill(Number(existing.pid), 0);
        throw new Error("Relay already has an active agent waiter");
      } catch (error) {
        if (error.message.startsWith("Relay already")) throw error;
        if (error.code !== "ESRCH") throw new Error("Relay already has an active agent waiter");
      }
    }
    this.db.prepare("REPLACE INTO waiter (id, relay_id, owner, pid, created_at) VALUES (1, ?, ?, ?, ?)")
      .run(relayId, owner, Number(pid), nowIso());
  }

  releaseWait({ owner }) {
    this.db.prepare("DELETE FROM waiter WHERE id = 1 AND owner = ?").run(owner);
  }

  #append({ relayId, kind, payload, inReplyTo = null }) {
    const eventId = timestampId("event");
    const at = nowIso();
    this.db.prepare(`
      INSERT INTO messages (event_id, relay_id, kind, in_reply_to, payload_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(eventId, relayId, kind, inReplyTo, stringifyJson(payload), at);
    return rowToMessage(this.db.prepare("SELECT * FROM messages WHERE event_id = ?").get(eventId));
  }
}
