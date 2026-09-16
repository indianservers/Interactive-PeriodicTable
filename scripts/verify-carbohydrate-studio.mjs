import { createRequire } from 'node:module';
import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const moduleRoot = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!moduleRoot) throw new Error('Set PLAYWRIGHT_MODULE_ROOT.');
const { chromium } = createRequire(moduleRoot + '/package.json')('playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-webgl', '--use-angle=swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [], warnings = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); if (message.type() === 'warning') warnings.push(message.text()); });
  await mkdir('docs/carbohydrate-studio-review', { recursive: true });
  await copyFile('docs/target-ui-verification/captures/053-carbohydrates-before.png', 'docs/carbohydrate-studio-review/before-1920.png');
  await page.goto('http://127.0.0.1:5175/#visuals/bio/carbohydrates');
  await page.locator('.cs-viewer[data-status="ready"]').waitFor({ timeout: 60000 });
  assert.equal(await page.locator('.cs-viewer').getAttribute('data-engine'), 'Mol*');
  assert.equal(await page.locator('.molstar-viewer').getAttribute('data-engine'), 'Mol*');
  assert.match(await page.locator('.cs-source-badge').innerText(), /MOL\* · PUBCHEM CID 5988/);
  await page.screenshot({ path: 'docs/carbohydrate-studio-review/after-1920.png' });
  const canvas = page.locator('.molstar-viewer-host canvas').first();
  const initial = await canvas.screenshot();
  await page.getByRole('button', { name: 'Space filling', exact: true }).click();
  await page.waitForTimeout(450);
  assert(!initial.equals(await canvas.screenshot()), 'space-filling representation changes the Mol* scene');
  await page.getByRole('button', { name: 'Ball & stick', exact: true }).click();
  await page.getByRole('checkbox', { name: 'H atoms', exact: true }).uncheck();
  await page.locator('.cs-viewer[data-status="ready"]').waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Select carbon C4', exact: true }).click();
  assert.equal(await page.locator('.cs-viewer').getAttribute('data-selected-carbon'), '4');
  assert.match(await page.locator('.molstar-viewer').getAttribute('data-selected'), /^\d+$/);
  await page.getByRole('checkbox', { name: 'Atom labels', exact: true }).check();
  assert.equal(await page.locator('.cs-atom-readout').count(), 1);
  await page.locator('.cs-compound-item', { hasText: 'D-Fructose' }).click();
  await page.locator('.cs-viewer[data-status="ready"]').waitFor({ timeout: 60000 });
  assert.match(await page.locator('.cs-source-badge').innerText(), /2723872/);
  await page.locator('.cs-compound-item', { hasText: 'Sucrose' }).click();
  await page.locator('.cs-viewer[data-status="ready"]').waitFor({ timeout: 60000 });
  await page.getByRole('button', { name: 'Glycosidic bond', exact: true }).click();
  await page.getByRole('button', { name: 'Build glycosidic bond', exact: true }).click();
  assert.match(await page.locator('.cs-build-result').innerText(), /Sucrose/);
  const layouts = [];
  for (const [width, height] of [[1920, 1080], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
    assert.equal(layout.scrollWidth, width, 'no horizontal overflow at ' + width);
    layouts.push(layout);
    await page.screenshot({ path: `docs/carbohydrate-studio-review/layout-${width}.png`, fullPage: width < 1200 });
  }
  assert.deepEqual(errors, []);
  await writeFile('docs/carbohydrate-studio-review/verification.json', JSON.stringify({ passed: true, layouts, errors, warnings }, null, 2));
  console.log('ALL CARBOHYDRATE STRUCTURE STUDIO CHECKS PASSED');
} finally { await browser.close(); }
