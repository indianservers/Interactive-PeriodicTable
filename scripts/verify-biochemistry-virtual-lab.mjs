import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw new Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(root + "/package.json")("playwright");
const base = process.env.BIO_BASE_URL || "http://127.0.0.1:5175";
const reviewDir = "docs/biochemistry-lab-review";
await mkdir(reviewDir, { recursive: true });
const cif = await readFile("public/assets/biochemistry/structures/1HEW.cif", "utf8");
assert.match(cif, /^data_1HEW/m); assert.match(cif, /'X-RAY DIFFRACTION'/); assert.match(cif, /_refine\.ls_d_res_high\s+1\.75/); assert.match(cif, /TRI-N-ACETYLCHITOTRIOSE/);

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--enable-webgl", "--use-angle=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
await page.addInitScript(() => localStorage.removeItem("biochemistry-vl-notes"));
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
const ready = () => page.locator(".molstar-viewer[data-ready=true]").waitFor({ timeout: 90000 });

try {
  await page.goto(`${base}/#/modules/biochemistry`, { waitUntil: "domcontentloaded" });
  await page.locator(".biovl-page").waitFor(); await ready();
  assert.equal(await page.locator(".biovl-catalog nav > button").count(), 25);
  assert.match(await page.locator(".biovl-structure-meta").innerText(), /PDB 1HEW.*1\.75 Å/s);
  assert.equal(await page.locator(".bio-protein-model").count(), 0);
  assert.equal(await page.locator(".biovl-structure-view canvas").count(), 1);

  for (const style of ["Cartoon", "Atoms", "Surface"]) {
    await page.getByRole("button", { name: style, exact: true }).click(); await page.waitForTimeout(350);
  }
  assert.match(await page.locator(".molstar-viewer").getAttribute("data-representations"), /Surface/);
  const beforeFocus = await page.locator(".biovl-structure-view canvas").screenshot();
  await page.getByRole("button", { name: "Focus inhibitor" }).click(); await page.waitForTimeout(500);
  const afterFocus = await page.locator(".biovl-structure-view canvas").screenshot();
  assert.notDeepEqual(beforeFocus, afterFocus);
  await page.getByRole("button", { name: "Next", exact: true }).click(); await page.waitForTimeout(400);
  assert.equal(await page.locator(".molstar-viewer").getAttribute("data-selected"), "35");

  await page.getByRole("button", { name: /03 Protein Structure Explorer/ }).click(); await ready();
  assert.equal(await page.locator(".bio-protein-model").count(), 0);
  assert.match(await page.locator(".biovl-structure-inspector").innerText(), /experimental fold/i);
  await page.getByRole("button", { name: /04 Amino Acid Identification Lab/ }).click();
  assert.equal(await page.locator(".molstar-viewer").count(), 0);
  assert.equal(await page.locator(".bio-test-well").count(), 1);
  await page.getByRole("button", { name: /01 Enzyme Kinetics Simulator/ }).click(); await ready();

  await page.locator('.biovl-safety-check input[type="checkbox"]').check();
  await page.getByRole("button", { name: "Run experiment", exact: true }).click();
  await page.getByRole("status").filter({ hasText: /Experiment completed and recorded/ }).waitFor({ timeout: 5000 });
  assert.equal(await page.getByRole("button", { name: "CSV", exact: true }).isEnabled(), true);
  assert.match(await page.locator(".biovl-history").innerText(), /Initial rate/);
  await page.getByRole("button", { name: "Hypothesis", exact: true }).click();
  await page.locator(".biovl-notebook textarea").fill("Higher substrate should increase initial rate toward Vmax.");
  await page.getByLabel("Vmax/2").check(); await page.getByRole("button", { name: "Check answer" }).click();
  assert.match(await page.locator(".biovl-quiz-card").innerText(), /Correct\./);

  const search = page.getByPlaceholder("Search labs, methods, or concepts");
  await search.fill("PCR");
  assert.equal(await page.locator(".biovl-catalog nav > button").count(), 1);
  await page.getByRole("button", { name: "Clear" }).click();
  assert.equal(await page.locator(".biovl-catalog nav > button").count(), 25);
  await page.getByRole("button", { name: "Molecular biology", exact: true }).click();
  assert.equal(await page.locator(".biovl-catalog nav > button").count(), 4);
  await page.getByRole("button", { name: "All", exact: true }).click();

  for (const [width, height] of [[1920, 1080], [1024, 900], [390, 844]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(250);
    assert.equal((await page.evaluate(() => document.documentElement.scrollWidth)) <= width + 1, true, `No horizontal overflow at ${width}px`);
    await page.screenshot({ path: `${reviewDir}/layout-${width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto(`${base}/#/home`, { waitUntil: "domcontentloaded" });
  await page.goto(`${base}/#/modules/biochemistry`, { waitUntil: "domcontentloaded" }); await ready(); await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Hypothesis", exact: true }).click();
  assert.match(await page.locator(".biovl-notebook textarea").inputValue(), /Higher substrate/);
  await page.screenshot({ path: `${reviewDir}/after-1920.png`, fullPage: true });
  assert.deepEqual(errors, [], `Browser errors: ${errors.join("\n")}`);
  await writeFile(`${reviewDir}/browser-verification.json`, JSON.stringify({ route: "/modules/biochemistry", structure: "1HEW", structuralLabs: 6, labsPreserved: 25, controls: "passed", responsive: [1920, 1024, 390], consoleErrors: errors }, null, 2));
  console.log("ALL BIOCHEMISTRY VIRTUAL LAB CHECKS PASSED");
} catch (error) {
  await page.screenshot({ path: `${reviewDir}/failure.png`, fullPage: true }).catch(() => {});
  await writeFile(`${reviewDir}/failure.txt`, `${error.stack || error}\n\n${errors.join("\n")}`).catch(() => {});
  throw error;
} finally { await browser.close(); }
