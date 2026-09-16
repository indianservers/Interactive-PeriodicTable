import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw new Error('Set PLAYWRIGHT_MODULE_ROOT.');
const { chromium } = createRequire(`${root}/package.json`)('playwright');
const base = process.env.CHEMISTRY_VL_URL || 'http://127.0.0.1:5174/?screen=home#/simulations/acid-base-solutions';
const output = 'docs/chemistry-vl-mockup-rebuild/screenshots/acid-base-solutions';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const errors = [], layouts = [], screens = [];
try {
  const page = await browser.newPage({ viewport: { width: 1672, height: 941 } });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Enter Lab' }).click();
  assert.match(await page.locator('.ab2-progress').innerText(), /20%/);
  await page.getByLabel('Solute').selectOption('naoh');
  await page.getByLabel(/Concentration/).fill('0.01');
  assert.match(await page.locator('.ab2-results').innerText(), /pH\s*12\.00/);
  await page.getByRole('button', { name: 'Record Trial' }).click();
  await page.getByRole('button', { name: 'Titration', exact: true }).click();
  assert.match(await page.locator('.ab2-results').innerText(), /Current pH\s*7\.00/);
  await page.getByRole('button', { name: /Add 1\.00 mL/ }).click();
  assert.match(await page.locator('.ab2-results').innerText(), /Current pH\s*11\.29/);
  await page.getByRole('button', { name: 'Buffer', exact: true }).click();
  assert.match(await page.locator('.ab2-results').innerText(), /Predicted pH\s*4\.74/);
  await page.getByRole('button', { name: '+ HCl' }).click();
  assert.match(await page.locator('.ab2-results').innerText(), /ΔpH = -0\.02/);
  await page.getByRole('button', { name: 'Report', exact: true }).click();
  await page.getByLabel(/very large dissociation/).check();
  assert.match(await page.locator('.ab2-assessment').innerText(), /Correct/);
  for (const [id] of [['home'],['solutions'],['measurements'],['titration'],['buffer'],['report']]) {
    await page.goto(base.replace('screen=home', `screen=${id}`), { waitUntil: 'networkidle' });
    await page.locator('[role="status"]').evaluateAll(nodes => nodes.forEach(node => node.style.display = 'none'));
    await page.screenshot({ path: `${output}/${id}-1672.png`, fullPage: true });
    screens.push({ id, route: `?screen=${id}#/simulations/acid-base-solutions`, passed: true });
  }
  for (const [width,height] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base.replace('screen=home','screen=solutions'), { waitUntil: 'networkidle' });
    await page.locator('[role="status"]').evaluateAll(nodes => nodes.forEach(node => node.style.display = 'none'));
    const metric = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
    assert.equal(metric.overflow, false);
    layouts.push(metric);
    await page.screenshot({ path: `${output}/solutions-${width}.png`, fullPage: true });
  }
  assert.deepEqual(errors, []);
  const verification = { simulator: 'acid-base-solutions', passed: true, screens, layouts, scientificChecks: ['strong/weak equilibrium','strong acid-base titration','Henderson-Hasselbalch buffer'], consoleErrors: errors };
  await writeFile(`${output}/verification.json`, JSON.stringify(verification, null, 2));
  console.log('ALL ACID-BASE LAB CHECKS PASSED');
} finally { await browser.close(); }
