import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw new Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(root + "/package.json")("playwright");
const base = process.env.RESEARCH_BASE_URL || "http://127.0.0.1:5175";
const reviewDir = "docs/research-toolkit-review";
await mkdir(reviewDir, { recursive: true });
const caffeine = await readFile("public/assets/research-toolkit/caffeine-2519.sdf", "utf8");
assert.match(caffeine, /^2519/m); assert.match(caffeine, /V2000/); assert.match(caffeine, /> <PUBCHEM_COMPOUND_CID>/);

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--enable-webgl", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
const ready = () => page.locator(".molstar-viewer[data-ready=true]").waitFor({ timeout: 90000 });

try {
  await page.goto(`${base}/#/research-toolkit`, { waitUntil: "domcontentloaded" });
  await ready();
  assert.equal(await page.locator(".molstar-viewer canvas").count(), 1);
  assert.match(await page.locator(".molstar-viewer-badge").innerText(), /CAFFEINE · CID 2519/);
  assert.match(await page.getByText("COORDINATE-BACKED").innerText(), /COORDINATE-BACKED/);
  assert.match(await page.getByText("RCSB PDB").locator("..")?.innerText().catch(() => ""), /Not applicable/);

  for (const style of ["Licorice", "Spacefill", "Ball & stick"]) {
    await page.getByRole("button", { name: style, exact: true }).click();
    await page.waitForTimeout(300);
  }
  assert.match(await page.locator(".molstar-viewer").getAttribute("data-representations"), /BallAndStick/);
  await page.getByRole("button", { name: "Measure", exact: true }).click();
  assert.match(await page.getByText(/Select 2 atom\(s\)/).innerText(), /Select 2 atom/);
  await page.getByRole("button", { name: "Measure", exact: true }).click();
  await page.getByRole("button", { name: "Reset structure camera" }).click();

  await page.getByRole("button", { name: /Myoglobin PDB coordinate sample/ }).click();
  await ready();
  assert.match(await page.locator(".molstar-viewer-badge").innerText(), /1MBN/);
  assert.match(await page.locator(".molstar-viewer").getAttribute("data-representations"), /Cartoon/);
  await page.getByRole("button", { name: /Caffeine PubChem 3D conformer/ }).click();
  await ready();

  const search = page.getByPlaceholder("Search local samples or enter a PDB ID");
  await search.fill("1BNA"); await search.press("Enter"); await ready();
  assert.match(await page.locator("h1").filter({ hasText: "B-DNA" }).innerText(), /B-DNA/);
  await search.fill("Caffeine"); await search.press("Enter"); await ready();

  const upload = page.locator('input[type="file"]');
  await upload.setInputFiles({ name: "bad.xyz", mimeType: "text/plain", buffer: Buffer.from("bad") });
  assert.match(await page.locator('.fixed[role="status"]').innerText(), /Unsupported format/);
  await page.getByRole("button", { name: "Dismiss notice" }).click({ force: true });
  await upload.setInputFiles({ name: "caffeine.sdf", mimeType: "chemical/x-mdl-sdfile", buffer: Buffer.from(caffeine) });
  await ready();
  assert.match(await page.locator('.fixed[role="status"]').innerText(), /Loaded caffeine\.sdf/);
  await page.getByRole("button", { name: "Dismiss notice" }).click({ force: true });

  await page.getByRole("button", { name: "¹H NMR" }).click();
  assert.match(await page.getByText("¹H NMR · teaching trace").innerText(), /teaching trace/);
  await page.getByLabel("Mass of caffeine g").fill("2.00");
  assert.match(await page.getByText(/2\.00 g =/).innerText(), /10\.2992 mmol/);
  await page.getByRole("button", { name: "Add to notebook" }).click();
  assert.match(await page.locator("textarea").inputValue(), /PubChem CID 2519/);
  await page.getByRole("button", { name: "Structure Search", exact: true }).click();
  assert.match(await page.getByRole("button", { name: "Structure Search", exact: true }).getAttribute("class"), /border-l-4/);
  await page.getByRole("button", { name: "Coordinates", exact: true }).click();

  for (const [width, height] of [[1920, 1080], [1024, 900], [390, 844]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(250);
    assert.equal((await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 1, true, `No horizontal overflow at ${width}px`);
    await page.screenshot({ path: `${reviewDir}/layout-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${base}/#/home`, { waitUntil: "domcontentloaded" });
  await page.goto(`${base}/#/research-toolkit`, { waitUntil: "domcontentloaded" }); await ready(); await page.waitForTimeout(400);
  await page.screenshot({ path: `${reviewDir}/after-1920.png`, fullPage: true });
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  await writeFile(`${reviewDir}/browser-verification.json`, JSON.stringify({ route: "/research-toolkit", default: "PubChem CID 2519", formats: ["PDB", "mmCIF/CIF", "MOL", "SDF"], controls: "passed", responsive: [1920, 1024, 390], consoleErrors: errors }, null, 2));
  console.log("ALL RESEARCH TOOLKIT CHECKS PASSED");
} catch (error) {
  await page.screenshot({ path: `${reviewDir}/failure.png`, fullPage: true }).catch(() => {});
  await writeFile(`${reviewDir}/failure.txt`, `${error.stack || error}\n\n${errors.join("\n")}`).catch(() => {});
  throw error;
} finally { await browser.close(); }
