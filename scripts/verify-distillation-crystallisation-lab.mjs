import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const { chromium } = createRequire(`${root}/package.json`)('playwright');
const base = process.env.CHEMISTRY_VL_URL || 'http://127.0.0.1:5174/?screen=home#/simulations/distillation-crystallisation';
const out = 'docs/chemistry-vl-mockup-rebuild/screenshots/distillation-crystallisation';
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [], layouts = [], screens = [];
try {
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Start Experiment' }).click();
  await page.getByLabel('Ethanol mol percent').fill('45');
  assert.match(await page.locator('.dc-panel').first().innerText(), /Ethanol\s*45\.0%[\s\S]*Water\s*55\.0%/);
  await page.getByRole('button', { name: 'Validate setup' }).click();
  assert.match(await page.locator('.dc-panel').last().innerText(), /Apparatus ready/);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Heating mantle power').fill('55');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  assert.match(await page.locator('.dc-panel').last().innerText(), /Stable main fraction collection/);
  await page.getByRole('button', { name: 'Save run' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Steam run time').fill('40');
  await page.getByRole('button', { name: 'Separate oil' }).click();
  assert.match(await page.locator('.dc-panel').last().innerText(), /Filter and collect oil/);
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Analyze melting point' }).click();
  assert.match(await page.locator('.dc-panel').last().innerText(), /Recovery[\s\S]*97\.3%[\s\S]*Purity[\s\S]*99\.1%[\s\S]*High-purity product obtained/);
  await page.getByRole('button', { name: 'Continue' }).click();
  for (const label of ['Repeated vapour–liquid equilibration', 'Combined vapour pressures reach atmospheric pressure', 'Fewer, larger, purer crystals form']) await page.getByLabel(label).check();
  assert.match(await page.locator('.dc-panel').last().innerText(), /Score:\s*3\/3/);
  for (const id of ['home','setup','fractional','steam','crystals','report']) {
    await page.goto(base.replace('screen=home', `screen=${id}`), { waitUntil: 'networkidle' });
    await page.locator('[role="status"]').evaluateAll(nodes => nodes.forEach(n => n.style.display = 'none'));
    await page.screenshot({ path: `${out}/${id}-1672.png`, fullPage: true });
    screens.push({ id, passed: true });
  }
  for (const [width,height] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base.replace('screen=home','screen=crystals'), { waitUntil: 'networkidle' });
    await page.locator('[role="status"]').evaluateAll(nodes => nodes.forEach(n => n.style.display = 'none'));
    const metric = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
    assert.equal(metric.overflow, false);
    layouts.push(metric);
    await page.screenshot({ path: `${out}/crystals-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  await writeFile(`${out}/verification.json`, JSON.stringify({ simulator: 'distillation-crystallisation', passed: true, screens, layouts, consoleErrors: errors }, null, 2));
  console.log('ALL DISTILLATION & CRYSTALLISATION CHECKS PASSED');
} finally {
  await browser.close();
}
