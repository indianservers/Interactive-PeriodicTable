import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright"),
  base =
    process.env.CHEMISTRY_VL_URL ||
    "http://127.0.0.1:5174/?screen=overview#/physical-chemistry/real-gas-laws",
  out = "docs/chemistry-vl-mockup-rebuild/screenshots/real-gas-laws";
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
  await page.getByRole("button", { name: /Start CO₂ Experiment/ }).click();
  assert.match(
    await page.locator(".rg-pvt").innerText(),
    /Ideal 4\.989[\s\S]*van der Waals 3\.994[\s\S]*Peng–Robinson 3\.820[\s\S]*Z = 0\.766/,
  );
  await page.getByRole("button", { name: /Continue to Z Analysis/ }).click();
  assert.match(
    await page.locator(".rg-analysis").innerText(),
    /Compressibility Factor Z vs\. Pressure[\s\S]*Molar volume[\s\S]*0\.394/,
  );
  await page.getByRole("button", { name: "Critical Behavior" }).click();
  await page.getByRole("button", { name: "Approach Critical" }).click();
  assert.match(
    await page.locator(".rg-critical").innerText(),
    /304\.13 K[\s\S]*7\.377 MPa[\s\S]*Tr = 1\.000[\s\S]*Pr = 1\.000/,
  );
  await page.getByRole("button", { name: "Joule–Thomson Exp." }).click();
  await page.getByRole("button", { name: "Run Expansion" }).click();
  assert.match(
    await page.locator(".rg-jt").innerText(),
    /-25\.5 K[\s\S]*274\.5 K[\s\S]*2\.83 K\/MPa[\s\S]*Expansion complete/,
  );
  await page.getByRole("button", { name: "Report", exact: true }).click();
  for (const answer of [
    "Intermolecular attractions",
    "Phases become indistinguishable",
    "The gas cools on expansion",
  ])
    await page.getByRole("button", { name: answer, exact: true }).click();
  assert.match(
    await page.locator(".rg-main").innerText(),
    /Knowledge Check 3 \/ 3/,
  );
  for (const id of [
    "overview",
    "pvt-explorer",
    "compressibility",
    "critical-behavior",
    "joule-thomson",
    "report-assessment",
  ]) {
    await page.goto(base.replace("screen=overview", `screen=${id}`), {
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
    await page.goto(base.replace("screen=overview", "screen=pvt-explorer"), {
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
      path: `${out}/pvt-explorer-${width}.png`,
      fullPage: true,
    });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "real-gas-laws",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL REAL GAS LAWS CHECKS PASSED");
} finally {
  await browser.close();
}
