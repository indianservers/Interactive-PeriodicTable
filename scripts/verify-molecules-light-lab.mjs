import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright"),
  base =
    process.env.CHEMISTRY_VL_URL ||
    "http://127.0.0.1:5174/?screen=home#/simulations/molecules-light",
  out = "docs/chemistry-vl-mockup-rebuild/screenshots/molecules-light";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  }),
  errors = [],
  layouts = [],
  screens = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1672, height: 941 },
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Pause animations" })
    .evaluate((x) => (x.style.display = "none"));
  assert.match(
    await page
      .getByRole("heading", { name: "Key Concept" })
      .locator("..")
      .innerText(),
    /7\.04 × 10¹³ Hz[\s\S]*0\.291 eV[\s\S]*2347 cm⁻¹/,
  );
  await page.getByRole("button", { name: "Start Exploring Light" }).click();
  await page.getByRole("button", { name: "Fire Photon" }).click();
  assert.match(
    await page.locator(".chamber").innerText(),
    /ABSORPTION DETECTED/,
  );
  await page.getByRole("button", { name: "Continue" }).click({ force: true });
  await page.getByRole("button", { name: "Play Beam" }).click();
  await page.getByRole("button", { name: "Record Observation" }).click();
  assert.match(
    await page
      .getByRole("heading", { name: "Simulation Controls" })
      .locator("..")
      .innerText(),
    /Observation recorded/,
  );
  await page.getByRole("button", { name: "Continue" }).click({ force: true });
  await page.getByRole("button", { name: "Run Full Scan" }).click();
  assert.match(
    await page.locator(".scan-chart").innerText(),
    /2 peaks identified/,
  );
  assert.match(
    await page.locator(".peak-table").innerText(),
    /2349 cm⁻¹[\s\S]*667 cm⁻¹[\s\S]*Absorbance[\s\S]*1\.00/,
  );
  await page.getByRole("button", { name: "Continue" }).click({ force: true });
  await page.getByRole("button", { name: "Compare Animation" }).click();
  assert.equal(
    await page.locator(".radiation-cards .ml2-molecule.active").count(),
    4,
  );
  await page.getByRole("button", { name: "Continue" }).click({ force: true });
  for (const name of [
    "500 nm photon: 2.48 eV",
    "IR active: changing dipole moment",
    "UV can reach dissociative states",
  ])
    await page.getByRole("button", { name }).click();
  assert.match(
    await page
      .getByRole("heading", { name: "Knowledge Check" })
      .locator("..")
      .innerText(),
    /3 \/ 3 correct/,
  );
  for (const id of [
    "home",
    "source",
    "response",
    "scan",
    "compare",
    "report",
  ]) {
    await page.goto(base.replace("screen=home", `screen=${id}`), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((n) => n.forEach((x) => (x.style.display = "none")));
    await page.screenshot({ path: `${out}/${id}-1672.png`, fullPage: true });
    screens.push({ id, passed: true });
  }
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base.replace("screen=home", "screen=response"), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((n) => n.forEach((x) => (x.style.display = "none")));
    const m = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }));
    assert.equal(m.overflow, false);
    layouts.push(m);
    await page.screenshot({
      path: `${out}/response-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "molecules-light",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL MOLECULES & LIGHT CHECKS PASSED");
} finally {
  await browser.close();
}
