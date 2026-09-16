import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright");
const base =
  process.env.CHEMISTRY_VL_URL ||
  "http://127.0.0.1:5174/?screen=home#/simulations/reaction-leftovers";
const out =
  "docs/chemistry-vl-mockup-rebuild/screenshots/reactants-products-leftovers";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const errors = [],
  layouts = [],
  screens = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1672, height: 941 },
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start Simulation" }).click();
  await page.getByRole("button", { name: "Run Reaction" }).click();
  assert.match(
    await page.locator(".rx-result-grid").innerText(),
    /Limiting reactant[\s\S]*H₂[\s\S]*Reaction batches[\s\S]*3[\s\S]*H₂O formed[\s\S]*6/,
  );
  await page.getByRole("button", { name: "Analyse Results" }).click();
  assert.match(
    await page.locator(".rx-page").innerText(),
    /4\.00 mol batches[\s\S]*Limiting reactant:[\s\S]*H₂[\s\S]*136\.3 g[\s\S]*92\.9%/,
  );
  await page.getByRole("button", { name: "Start Challenge" }).click();
  await page.getByRole("button", { name: "Check Answer" }).click();
  assert.match(
    await page.locator(".rx-challenge").innerText(),
    /Correct![\s\S]*Oxygen is limiting[\s\S]*4 CO₂ and 8 H₂O[\s\S]*1 CH₄/,
  );
  await page.getByRole("button", { name: "View Report" }).click();
  for (const answer of ["H₂", "1 H₂ and 1 O₂", "Conservation of mass"])
    await page.getByRole("button", { name: answer, exact: true }).click();
  assert.match(
    await page.locator(".rx-report").innerText(),
    /Knowledge Check — Score: 3 \/ 3/,
  );
  for (const id of [
    "home",
    "build",
    "outcome",
    "yield",
    "challenge",
    "report",
  ]) {
    await page.goto(base.replace("screen=home", `screen=${id}`), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((nodes) =>
        nodes.forEach((node) => (node.style.display = "none")),
      );
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
    await page.goto(base.replace("screen=home", "screen=build"), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((nodes) =>
        nodes.forEach((node) => (node.style.display = "none")),
      );
    const measurement = await page.evaluate(() => ({
      width: innerWidth,
      height: innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
    }));
    assert.equal(measurement.overflow, false);
    layouts.push(measurement);
    await page.screenshot({
      path: `${out}/build-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "reactants-products-leftovers",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL REACTANTS PRODUCTS LEFTOVERS CHECKS PASSED");
} finally {
  await browser.close();
}
