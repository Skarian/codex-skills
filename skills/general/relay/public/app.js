const $ = (id) => document.getElementById(id);
let after = 0;
let relay = null;
let replies = [];

async function api(path, body) {
  const hasBody = arguments.length > 1;
  const res = await fetch(path, {
    method: hasBody ? "POST" : "GET",
    headers: hasBody ? { "Content-Type": "application/json" } : undefined,
    body: hasBody ? JSON.stringify(body) : undefined,
  });
  const value = await res.json();
  if (!res.ok) throw new Error(value.error || `HTTP ${res.status}`);
  return value;
}

function payload() {
  const text = $("payload").value.trim();
  return text ? JSON.parse(text) : {};
}

function render(message = "Ready.") {
  $("status").textContent = message;
  $("relay").textContent = relay ? JSON.stringify({ ...relay, after }, null, 2) : "No relay";
  $("replies").textContent = replies.length ? JSON.stringify(replies, null, 2) : "No replies";
}

async function refresh() {
  const { relays } = await api("/api/relays");
  relay = relays.find((item) => item.status === "open") || relays[0] || null;
  render();
}

async function openRelay() {
  const result = await api("/api/relay/open", {
    appName: $("app-name").value.trim(),
    payload: { source: "smoke-page" },
  });
  relay = result.relay;
  after = result.after;
  render(result.created ? "Opened." : "Reused.");
}

async function send() {
  const result = await api("/api/relay/send", payload());
  render(`Sent ${result.event.seq}.`);
}

async function receive() {
  render("Waiting for an agent reply or close...");
  const result = await api("/api/relay/receive", { after });
  if (result.items.length) {
    after = result.nextAfter;
    replies.push(...result.items);
    await api("/api/relay/received", { through: after });
  }
  render(`Received ${result.items.length}.`);
}

async function closeRelay() {
  await api("/api/relay/close", { reason: "smoke-page-closed", payload: { source: "smoke-page" } });
  relay = null;
  render("Closed.");
}

for (const [id, fn] of Object.entries({ open: openRelay, send, receive, close: closeRelay })) {
  $(id).addEventListener("click", () => fn().catch((error) => render(error.message)));
}

refresh().catch((error) => render(error.message));
