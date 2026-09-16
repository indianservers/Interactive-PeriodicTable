import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright"),
  base =
    process.env.CHEMISTRY_VL_URL ||
    "http://127.0.0.1:5174/?screen=home#/simulations/soil-ph-conductivity",
  out = "docs/chemistry-vl-mockup-rebuild/screenshots/soil-ph-conductivity";
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
    .evaluate((button) => (button.style.display = "none"));
  await page.getByRole("button", { name: /Start Experiment/ }).click();
  assert.match(
    await page.locator(".soil-sampling").innerText(),
    /20\.0 mL|50\.0 mL/,
  );
  await page.getByRole("button", { name: /Start Shaking/ }).click();
  assert.match(await page.locator(".soil-sampling").innerText(), /180 rpm/);
  await page.getByRole("button", { name: /Continue/ }).click();
  assert.match(
    await page.locator(".soil-cal").innerText(),
    /58\.4 mV\/pH[\s\S]*1\.002 cm⁻¹/,
  );
  await page.getByRole("button", { name: /Save Calibration/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  assert.match(
    await page.locator(".soil-measure").innerText(),
    /6\.43[\s\S]*1\.17[\s\S]*749 mg\/L[\s\S]*Slightly acidic[\s\S]*Moderately saline/,
  );
  await page.getByRole("button", { name: /Record/ }).click();
  await page.getByRole("button", { name: /Continue/ }).click();
  assert.match(
    await page.locator(".soil-field").innerText(),
    /pH[\s\S]*7\.21 ± 0\.67[\s\S]*EC[\s\S]*1\.29 ± 1\.03[\s\S]*827 mg\/L/,
  );
  await page.getByRole("button", { name: /Continue/ }).click();
  for (const a of [
    "Reduces local spatial bias",
    "Avoid contamination and static damage",
    "Total soluble-ion conductivity",
  ])
    await page.getByRole("button", { name: a, exact: true }).click();
  assert.match(
    await page.locator(".soil-report").innerText(),
    /Knowledge Check[\s\S]*3 \/ 3/,
  );
  for (const id of [
    "home",
    "sampling-extraction",
    "sensor-calibration",
    "measurements",
    "field-interpretation",
    "report-assessment",
  ]) {
    await page.goto(base.replace("screen=home", `screen=${id}`), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((ns) => ns.forEach((n) => (n.style.display = "none")));
    await page.screenshot({ path: `${out}/${id}-1672.png`, fullPage: false });
    screens.push({ id, passed: true });
  }
  for (const [width, height] of [
    [1440, 900],
    [1024, 768],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto(base.replace("screen=home", "screen=measurements"), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((ns) => ns.forEach((n) => (n.style.display = "none")));
    const m = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }));
    assert.equal(m.overflow, false);
    layouts.push(m);
    await page.screenshot({
      path: `${out}/measurements-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "soil-ph-conductivity",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL SOIL PH CONDUCTIVITY CHECKS PASSED");
} finally {
  await browser.close();
}
