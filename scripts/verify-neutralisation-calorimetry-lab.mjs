import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright"),
  base =
    process.env.CHEMISTRY_VL_URL ||
    "http://127.0.0.1:5174/?screen=home#/simulations/neutralisation-calorimetry",
  out =
    "docs/chemistry-vl-mockup-rebuild/screenshots/neutralisation-calorimetry";
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
  await page.getByRole("button", { name: "Start Experiment" }).click();
  for (const x of [
    "Lab coat",
    "Safety glasses",
    "Nitrile gloves",
    "Closed-toe shoes",
    "Hair tied back",
  ])
    await page.getByLabel(x).check();
  await page.getByRole("button", { name: /Confirm Setup/ }).click();
  assert.match(await page.locator(".ppe").innerText(), /Setup confirmed/);
  await page.getByRole("button", { name: "Continue", exact: true }).click({ force: true });
  assert.match(
    await page.locator(".cal-result").innerText(),
    /Ccal = 35\.0 J K⁻¹/,
  );
  await page.getByRole("button", { name: /Accept Ccal/ }).click();
  assert.match(
    await page.locator(".cal-inputs").innerText(),
    /Calibration accepted/,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click({ force: true });
  await page.getByRole("button", { name: "Stop Run" }).click();
  assert.equal(await page.getByLabel("Reaction progress").inputValue(), "100");
  assert.match(
    await page
      .getByRole("heading", { name: "Controls" })
      .locator("..")
      .innerText(),
    /cooling curve captured/,
  );
  await page.getByRole("button", { name: "Continue", exact: true }).click({ force: true });
  assert.match(
    await page.locator(".workflow").innerText(),
    /2\.642 kJ[\s\S]*0\.221 kJ[\s\S]*−2\.863 kJ[\s\S]*0\.0500 mol[\s\S]*-57\.3 kJ mol⁻¹/,
  );
  await page.getByRole("button", { name: "Save Analysis" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click({ force: true });
  for (const x of [
    "ΔH is negative because heat is released",
    "Extrapolate to correct for heat loss",
    "Ccal accounts for calorimeter heat",
  ])
    await page.getByRole("button", { name: x }).click();
  assert.match(await page.locator(".knowledge").innerText(), /Score: 3\/3/);
  for (const id of [
    "home",
    "setup",
    "calibration",
    "reaction",
    "analysis",
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
    await page.goto(base.replace("screen=home", "screen=analysis"), {
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
      path: `${out}/analysis-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "neutralisation-calorimetry",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL NEUTRALISATION CALORIMETRY CHECKS PASSED");
} finally {
  await browser.close();
}
