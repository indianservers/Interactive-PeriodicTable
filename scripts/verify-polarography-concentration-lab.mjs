import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error("Set PLAYWRIGHT_MODULE_ROOT.");
const { chromium } = createRequire(`${root}/package.json`)("playwright"),
  base =
    process.env.CHEMISTRY_VL_URL ||
    "http://127.0.0.1:5174/?screen=home#/simulations/polarography-concentration",
  out =
    "docs/chemistry-vl-mockup-rebuild/screenshots/polarography-concentration";
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
  assert.match(
    await page.locator(".standards").innerText(),
    /S3[\s\S]*6[\s\S]*3\.00[\s\S]*V₁ = \(6 × 50\.00\) \/ 100 = 3\.00 mL/,
  );
  await page.getByRole("button", { name: /Validate setup/ }).click();
  assert.match(
    await page.locator(".params").innerText(),
    /Setup valid and safe/,
  );
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click({ force: true });
  assert.match(
    await page
      .getByRole("heading", { name: "Measurement Status" })
      .locator("..")
      .innerText(),
    /0\.47 mg L⁻¹[\s\S]*-0\.21 μA/,
  );
  await page.getByRole("button", { name: "Save baseline" }).click();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click({ force: true });
  await page.getByRole("button", { name: "Finish Scan" }).click();
  assert.match(
    await page
      .getByRole("heading", { name: "Measurement Status" })
      .locator("..")
      .innerText(),
    /17\.9 μA[\s\S]*−0\.742 V[\s\S]*scan complete/,
  );
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click({ force: true });
  assert.match(
    await page
      .getByRole("heading", { name: "Result for Unknown" })
      .locator("..")
      .innerText(),
    /14\.6 μA[\s\S]*4\.89 ± 0\.06 mg\/L[\s\S]*24\.45 ± 0\.30 mg\/L/,
  );
  await page.getByRole("button", { name: "Add to notebook" }).click();
  await page
    .getByRole("button", { name: "Continue", exact: true })
    .click({ force: true });
  for (const x of [
    "Deaeration prevents an interfering reduction wave",
    "E½ identifies the electroactive species",
    "Diffusion current is proportional to concentration",
  ])
    await page.getByRole("button", { name: x }).click();
  assert.match(await page.locator(".quiz").innerText(), /Score: 3\/3/);
  for (const id of [
    "home",
    "setup",
    "deaeration",
    "scan",
    "calibration",
    "report",
  ]) {
    await page.goto(base.replace("screen=home", `screen=${id}`), {
      waitUntil: "networkidle",
    });
    await page
      .locator('[role="status"],button[aria-label="Pause animations"]')
      .evaluateAll((n) => n.forEach((x) => (x.style.display = "none")));
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
    await page.goto(base.replace("screen=home", "screen=scan"), {
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
    await page.screenshot({ path: `${out}/scan-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(
    `${out}/verification.json`,
    JSON.stringify(
      {
        simulator: "polarography-concentration",
        passed: true,
        screens,
        layouts,
        consoleErrors: errors,
      },
      null,
      2,
    ),
  );
  console.log("ALL POLAROGRAPHY CONCENTRATION CHECKS PASSED");
} finally {
  await browser.close();
}
