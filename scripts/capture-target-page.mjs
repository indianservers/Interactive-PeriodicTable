import { writeFile } from "node:fs/promises";

const [url, output, widthArg = "1672", heightArg = "941", portArg = "9224"] = process.argv.slice(2);
if (!url || !output) {
  throw new Error("Usage: node scripts/capture-target-page.mjs <url> <output> [width] [height] [port]");
}

const width = Number(widthArg);
const height = Number(heightArg);
const targets = await fetch(`http://127.0.0.1:${portArg}/json/list`).then((response) => response.json());
const requested = new URL(url);
const target = targets.find((item) => item.type === "page" && item.url === url)
  ?? targets.find((item) => item.type === "page" && item.url.startsWith(`${requested.origin}/`))
  ?? targets.find((item) => item.type === "page");
if (!target) throw new Error("No debuggable page target found");

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});

let sequence = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id || !pending.has(message.id)) return;
  const { resolve, reject } = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) reject(new Error(message.error.message));
  else resolve(message.result);
});

function command(method, params = {}) {
  const id = ++sequence;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

await command("Page.enable");
await command("Page.bringToFront");
await command("Runtime.enable");
await command("Network.enable");
await command("Network.setBypassServiceWorker", { bypass: true });
await command("Network.setCacheDisabled", { cacheDisabled: true });
await command("Emulation.setDeviceMetricsOverride", {
  width,
  height,
  deviceScaleFactor: 1,
  mobile: false,
});
await command("Page.navigate", { url });

const deadline = Date.now() + 15000;
while (Date.now() < deadline) {
  const state = await command("Runtime.evaluate", {
    expression: `JSON.stringify({ready:document.readyState,loading:!!document.querySelector('.loading-overlay,.app-loading,.loading-screen,[data-loading="true"]') || !document.querySelector('h1,h2'),title:document.title})`,
    returnByValue: true,
  });
  const value = JSON.parse(state.result.value || "{}");
  if (value.ready === "complete" && !value.loading) break;
  await new Promise((resolve) => setTimeout(resolve, 250));
}
// Let the route-ready toast/progress affordance finish before capturing the
// reference state; it is a transient navigation signal, not page content.
await new Promise((resolve) => setTimeout(resolve, 2200));
// Route-progress status is a transient application affordance, not part of
// the target page's default visual state. Remove only the fixed route loader
// before the deterministic screenshot is taken.
await command("Runtime.evaluate", {
  expression: `Array.from(document.querySelectorAll('[role="status"]')).forEach((el) => { if (/^(LOADING|OPENING|READY):/.test((el.innerText || '').trim())) el.style.display = 'none'; })`,
});

const metricsResult = await command("Runtime.evaluate", {
  expression: `JSON.stringify({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight})`,
  returnByValue: true,
});
const metrics = JSON.parse(metricsResult.result.value);
const capture = await command("Page.captureScreenshot", {
  format: "png",
  captureBeyondViewport: false,
  fromSurface: true,
});
await writeFile(output, Buffer.from(capture.data, "base64"));
socket.close();
process.stdout.write(`${JSON.stringify(metrics)}\n`);
