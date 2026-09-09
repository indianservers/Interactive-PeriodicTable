import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const moduleRoot = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!moduleRoot) throw new Error("Set PLAYWRIGHT_MODULE_ROOT to a Node module root containing Playwright.");
const { chromium } = createRequire(moduleRoot + "/package.json")("playwright");
const base = process.env.DD_BASE_URL || "http://127.0.0.1:5173";
const reviewDir = "docs/drug-discovery-review";
await mkdir(reviewDir, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--enable-webgl", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });

const routes = [
  ["home", "Discovery Command Center"],
  ["workspace", "COX-2 · Mefenamic acid"],
  ["targets", "Cyclooxygenase-2 (COX-2) · PTGS2"],
  ["screening", "COX-2 evidence-screening campaign"],
  ["design", "Molecular Design Studio"],
  ["adme", "ADME & Pharmacokinetics"],
  ["team", "Discovery Team"],
  ["safety", "Safety & Toxicology · Mefenamic acid"],
  ["notebooks", "COX-2 evidence review"],
  ["analytics", "Discovery Analytics"],
];

try {
  for (const [route, heading] of routes) {
    await page.goto(`${base}/#/drug-discovery/${route}`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: heading }).waitFor({ timeout: 90000 });
    await page.waitForTimeout(1800);
    const viewer = page.locator(".molstar-viewer").first();
    if (await viewer.count()) await viewer.locator("[data-ready=true], .molstar-viewer-badge").first().waitFor({ timeout: 90000 }).catch(() => viewer.waitFor());
    assert.match(await page.locator("body").innerText(), /COX-2|Drug Discovery/i);
    await page.screenshot({ path: `${reviewDir}/${route}-1672.png`, fullPage: true });
  }

  await page.goto(`${base}/#/drug-discovery/design`, { waitUntil: "domcontentloaded" });
  await page.getByRole("heading", { name: "Molecular Design Studio" }).waitFor();
  await page.getByRole("button", { name: /Create validated analog/i }).click();
  await page.getByText(/Valid RDKit graph/).waitFor({ timeout: 90000 });

  await page.goto(`${base}/#/drug-discovery/analytics`, { waitUntil: "domcontentloaded" });
  await page.getByText(/RDKit 2025\.03\.4/).waitFor();
  assert.equal(await page.locator(".dds-umap .dds-big-chart circle").count(), 8);

  for (const [width, height] of [[1024, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    assert((await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 1, `No horizontal overflow at ${width}px`);
    await page.screenshot({ path: `${reviewDir}/responsive-${width}.png`, fullPage: true });
  }

  const actionableErrors = errors.filter((entry) => !/favicon|Failed to parse URL/i.test(entry));
  assert.deepEqual(actionableErrors, [], `Browser errors: ${actionableErrors.join("\n")}`);
  await writeFile(`${reviewDir}/browser-verification.json`, JSON.stringify({ routes: routes.map(([route]) => route), responsive: [1672, 1024, 390], rdkit: "passed", analytics: "passed", consoleErrors: actionableErrors }, null, 2));
  console.log("ALL TEN DRUG DISCOVERY PAGES PASSED BROWSER VERIFICATION");
} catch (error) {
  await page.screenshot({ path: `${reviewDir}/failure.png`, fullPage: true }).catch(() => {});
  await writeFile(`${reviewDir}/failure.txt`, `${error.stack || error}\n\nBrowser errors:\n${errors.join("\n")}`).catch(() => {});
  throw error;
} finally {
  await browser.close();
}
