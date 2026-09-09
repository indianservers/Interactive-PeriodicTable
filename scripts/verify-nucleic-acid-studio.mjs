import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";

const moduleRoot = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!moduleRoot) throw new Error("Set PLAYWRIGHT_MODULE_ROOT to a Node module root containing Playwright.");
const { chromium } = createRequire(moduleRoot + "/package.json")("playwright");
const base = process.env.NAE_BASE_URL || "http://127.0.0.1:5175";
const reviewDir = "docs/nucleic-acid-review";
await mkdir(reviewDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  args: ["--enable-webgl", "--use-angle=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.addInitScript(() => {
  localStorage.removeItem("nae-sidebar-collapsed");
  localStorage.setItem("nae-settings", JSON.stringify({ showAxes: true, rememberPanels: true, reducedMotion: false }));
});
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});

const waitForViewer = async (selector) => {
  await page.locator(selector + "[data-ready=true]").first().waitFor({ timeout: 90000 });
};
const openWorkspace = async (route) => {
  const path = route ? "/nucleic-acid-explorer/" + route : "/#/visuals/bio/nucleic-acids";
  await page.goto(base + path, { waitUntil: "domcontentloaded" });
  await page.locator(".nae-app").waitFor({ timeout: 30000 });
};

try {
  await openWorkspace("");
  await waitForViewer(".nae-main-viewer .molstar-viewer");
  await page.waitForTimeout(900);
  assert.equal(await page.locator(".nae-main-viewer canvas").count(), 1);
  assert.match(await page.locator(".molstar-viewer-badge").first().innerText(), /1BNA/);
  assert.equal(await page.locator(".nae-sequence-strip button").count(), 12);

  const canvas = page.locator(".nae-main-viewer canvas");
  const canvasBox = await canvas.boundingBox();
  await canvas.click({ position: { x: canvasBox.width * 0.5, y: canvasBox.height * 0.5 } });
  await page.waitForFunction(() => document.querySelectorAll(".nae-inspector-body dd")[2]?.textContent?.trim() !== "—");
  assert.notEqual((await page.locator(".nae-inspector-body dd").nth(2).innerText()).trim(), "—");
  await page.locator('.nae-main-viewer button[title="Reset camera"]').click();
  await page.waitForTimeout(300);
  await page.locator('.nae-main-viewer button[title="Fullscreen"]').click();
  await page.waitForFunction(() => Boolean(document.fullscreenElement));
  await page.evaluate(() => document.exitFullscreen());
  await page.waitForFunction(() => !document.fullscreenElement);
  for (const pair of [
    ["Licorice", "Licorice"],
    ["Backbone", "Backbone"],
    ["Cartoon", "Cartoon"],
    ["Surface", "Surface"],
    ["Space filling", "Spacefill"],
    ["Ball & stick", "BallAndStick"],
  ]) {
    const before = await canvas.screenshot();
    await page.getByLabel("Representation").selectOption(pair[0]);
    await page.locator(".nae-main-viewer .molstar-viewer[data-representations=" + pair[1] + "]").waitFor();
    await page.waitForTimeout(700);
    assert(!before.equals(await canvas.screenshot()), pair[0] + " must change molecular pixels");
  }

  await page.getByLabel("Helical form").selectOption("A");
  await page.locator(".nae-main-viewer .molstar-viewer-badge", { hasText: "1ANA" }).waitFor({ timeout: 90000 });
  assert.equal(await page.locator(".nae-sequence-strip button").count(), 4);
  await page.getByLabel("Helical form").selectOption("Z");
  await page.locator(".nae-main-viewer .molstar-viewer-badge", { hasText: "4OCB" }).waitFor({ timeout: 90000 });
  assert.equal(await page.locator(".nae-sequence-strip button").count(), 12);
  await page.getByRole("button", { name: "RNA", exact: true }).click();
  await page.locator(".nae-main-viewer .molstar-viewer-badge", { hasText: "2KOC" }).waitFor({ timeout: 90000 });
  assert.equal(await page.locator(".nae-sequence-strip button").count(), 14);
  await page.getByRole("button", { name: "Structure", exact: true }).click();
  assert.match(await page.locator(".nae-inspector-body").innerText(), /Solution NMR/);
  await page.getByRole("button", { name: "Measurements", exact: true }).click();
  await page.getByRole("button", { name: "Clear measurements" }).click();
  await page.getByTitle("Settings").click();
  await page.getByText("Reduced motion").click();
  await page.getByTitle("Settings").click();
  const sidebarToggle = page.locator(".nae-collapse");
  const sidebarBefore = await sidebarToggle.innerText();
  await sidebarToggle.click();
  const sidebarAfter = await sidebarToggle.innerText();
  assert.notEqual(sidebarAfter, sidebarBefore);
  if (await page.locator(".nae-body").evaluate((element) => element.classList.contains("sidebar-collapsed"))) await sidebarToggle.click();
  await page.getByRole("button", { name: "DNA", exact: true }).click();
  await page.getByLabel("Helical form").selectOption("B");
  await page.getByLabel("Representation").selectOption("Ball & stick");
  await page.getByRole("button", { name: "Residue Inspector", exact: true }).click();
  await page.locator(".nae-sequence-strip button").nth(3).click();
  await page.locator(".nae-main-viewer .molstar-viewer-badge", { hasText: "1BNA" }).waitFor({ timeout: 90000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: reviewDir + "/home-after-1920.png" });

  await page.getByPlaceholder(/Search PDB IDs/).fill("1EHZ");
  await page.getByPlaceholder(/Search PDB IDs/).press("Enter");
  await page.getByRole("heading", { name: "Molecules", exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, "/nucleic-acid-explorer/molecules");
  assert.equal(await page.getByPlaceholder(/PDB ID, title/).inputValue(), "1EHZ");
  await page.getByPlaceholder(/PDB ID, title/).fill("1BNA");
  assert.equal(await page.locator(".nae-data-table button.nae-table-row").count(), 1);
  const invalidUpload = page.locator('input[type="file"][accept*=".pdb"]');
  await invalidUpload.setInputFiles({ name: "invalid.xyz", mimeType: "text/plain", buffer: Buffer.from("not coordinates") });
  await page.getByText(/Unsupported file/).waitFor();

  await openWorkspace("nucleotide-builder");
  await waitForViewer(".nae-builder-view .molstar-viewer");
  await page.getByRole("button", { name: /Guanine/ }).first().click();
  assert.match(await page.locator(".nae-builder-inspector").innerText(), /dGMP/);
  await page.getByRole("button", { name: "Ribose", exact: true }).click();
  await waitForViewer(".nae-builder-view .molstar-viewer");
  assert.match(await page.locator(".nae-builder-inspector").innerText(), /GMP/);
  await page.getByRole("button", { name: /Form 3′→5′/ }).click();
  assert.match(await page.locator(".nae-builder-inspector").innerText(), /Phosphodiester formed|O3′ available/);
  for (const tab of ["Templates", "Validation", "Atom numbering", "Bond table", "2D chemical structure"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
  }
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Redo", exact: true }).click();

  await openWorkspace("sequences");
  const editor = page.getByLabel("Nucleotide sequence editor");
  await editor.fill("ATGAAATAAGAATTC");
  await page.getByRole("button", { name: /Validate/ }).click();
  assert.match(await page.locator(".nae-valid-inline").innerText(), /valid/i);
  for (const tab of ["Transform", "ORFs", "Sites", "Analysis"]) {
    await page.getByRole("button", { name: tab, exact: true }).click();
  }
  await page.getByLabel("Sequence zoom").fill("90");
  await page.getByLabel("Selected region start").fill("2");
  await page.getByLabel("Selected region end").fill("8");
  const fastaDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: /Export FASTA/ }).click();
  assert.equal((await fastaDownload).suggestedFilename(), "sequence.fasta");

  await openWorkspace("replication");
  await waitForViewer(".nae-enzyme-view .molstar-viewer");
  const forkBefore = await page.locator('input[type="range"]').first().inputValue();
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await page.waitForTimeout(650);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  assert.notEqual(await page.locator('input[type="range"]').first().inputValue(), forkBefore);
  await page.getByRole("button", { name: /Hide labels/ }).click();
  await page.getByRole("button", { name: /Show labels/ }).click();
  await page.getByRole("button", { name: /Hide molecular detail/ }).click();
  await page.getByRole("button", { name: /Show molecular detail/ }).click();
  await page.getByRole("button", { name: "Reset", exact: true }).click();

  await openWorkspace("transcription");
  await waitForViewer(".nae-transcription-view .molstar-viewer");
  await page.getByRole("button", { name: "Initiation", exact: true }).click();
  await page.getByRole("button", { name: /Introduce A→G/ }).click();
  await page.getByRole("button", { name: "Tracks", exact: true }).click();
  assert.match(await page.locator(".nae-mechanism-inspector").innerText(), /Growing RNA/);

  await openWorkspace("comparative");
  await page.locator(".nae-compare-view .molstar-viewer[data-ready=true]").nth(1).waitFor({ timeout: 90000 });
  assert.equal(await page.locator(".nae-compare-view canvas").count(), 2);
  await page.getByLabel("Comparison mode").selectOption("DNA vs RNA");
  await page.locator(".nae-compare-view .molstar-viewer-badge", { hasText: "2KOC" }).waitFor({ timeout: 90000 });
  await page.getByRole("button", { name: /Align phosphate traces/ }).click();
  await page.getByRole("button", { name: "Measurements", exact: true }).click();
  await page.getByText(/RMSD/).waitFor();

  await openWorkspace("gallery");
  await waitForViewer(".nae-gallery-view .molstar-viewer");
  await page.getByRole("button", { name: /Save to collection/ }).click();
  assert(await page.getByRole("button", { name: /Remove from collection/ }).isVisible());
  await page.getByRole("button", { name: /Open in viewer/ }).click();
  await page.getByRole("heading", { name: "Molecules", exact: true }).waitFor();
  assert.equal(new URL(page.url()).pathname, "/nucleic-acid-explorer/molecules");

  await openWorkspace("learn");
  await waitForViewer(".nae-lesson-view .molstar-viewer");
  await page.getByRole("button", { name: /Next/ }).click();
  await page.getByRole("button", { name: "Structure details", exact: true }).click();
  assert.match(await page.locator(".nae-lesson-explain").innerText(), /EXPERIMENTAL EVIDENCE/);

  await openWorkspace("quizzes");
  await waitForViewer(".nae-quiz-view .molstar-viewer");
  await page.getByRole("button", { name: /Guanine/ }).click();
  await page.getByRole("button", { name: "Submit answer", exact: true }).click();
  assert.match(await page.locator(".nae-feedback").innerText(), /Correct/);
  await page.getByRole("button", { name: "Next question", exact: true }).click();

  const layouts = [];
  for (const size of [[1920, 1080], [1024, 900], [390, 844]]) {
    await page.setViewportSize({ width: size[0], height: size[1] });
    await openWorkspace("");
    await page.waitForTimeout(500);
    const layout = await page.evaluate(() => ({
      width: innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      mainWidth: document.querySelector(".nae-workspace")?.getBoundingClientRect().width,
    }));
    assert.equal(layout.scrollWidth, size[0], "horizontal overflow at " + size[0]);
    assert(layout.mainWidth > 0, "workspace must remain visible");
    layouts.push(layout);
    await page.screenshot({ path: reviewDir + "/layout-" + size[0] + ".png", fullPage: true });
  }

  assert.deepEqual(errors, []);
  const result = {
    passed: true,
    errors,
    layouts,
    controls: "home representations/forms/modes/inspector/settings/sidebar; catalogue search/upload; builder chemistry/tabs/history; sequence analysis/export; replication; transcription; dual-view comparison/alignment; gallery collection/open; lesson; quiz",
  };
  await writeFile(reviewDir + "/browser-verification.json", JSON.stringify(result, null, 2));
  console.log("ALL NUCLEIC-ACID STUDIO CHECKS PASSED");
} catch (error) {
  await page.screenshot({ path: reviewDir + "/failure.png", fullPage: true });
  await writeFile(reviewDir + "/browser-errors.json", JSON.stringify(errors, null, 2));
  throw error;
} finally {
  await browser.close();
}
