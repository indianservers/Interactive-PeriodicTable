import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
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
  await page.goto('http://127.0.0.1:5175/#visuals/bio/metabolism');
  await page.waitForTimeout(1400);
  await mkdir('docs/metabolism-studio-review', { recursive: true });
  await page.screenshot({ path: 'docs/metabolism-studio-review/after-1920.png' });
  assert.equal(await page.locator('[data-bio-page="metabolism"]').count(), 1);
  assert.equal(await page.locator('svg[aria-label="Metabolism pathway map"]').count(), 1);
  assert.equal(await page.locator('svg[aria-label="Aconitase molecular step"]').count(), 1);
  await page.getByRole('button', { name: 'Anaerobic (glycolysis only)', exact: true }).click();
  assert.match(await page.locator('aside').last().innerText(), /Anaerobic yield/);
  await page.getByRole('button', { name: 'Aerobic respiration', exact: true }).click();
  await page.getByRole('button', { name: 'Run Simulation', exact: true }).click();
  await page.waitForTimeout(1050);
  assert.match(await page.getByRole('button', { name: 'Pause', exact: true }).innerText(), /Pause/);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Experimental structure', exact: true }).click();
  await page.locator('.molstar-viewer[data-ready=true]').waitFor({ timeout: 60000 });
  assert.equal(await page.locator('.molstar-viewer').getAttribute('data-engine'), 'Mol*');
  assert.match(await page.locator('.molstar-viewer-badge').innerText(), /PDB 1C96/);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'docs/metabolism-studio-review/molecular-1C96-1920.png' });
  const canvas = page.locator('.molstar-viewer-host canvas').first();
  const initial = await canvas.screenshot();
  await page.getByRole('button', { name: 'Surface', exact: true }).click();
  await page.waitForTimeout(500);
  assert(!initial.equals(await canvas.screenshot()), 'surface representation changes the structure');
  const beforeCluster = await canvas.screenshot();
  await page.getByRole('button', { name: '[4Fe–4S]', exact: true }).click();
  await page.waitForTimeout(500);
  assert(!beforeCluster.equals(await canvas.screenshot()), 'cluster focus changes the camera');
  const beforeStep = await canvas.screenshot();
  await page.getByRole('button', { name: '2', exact: true }).click();
  await page.waitForTimeout(500);
  assert(!beforeStep.equals(await canvas.screenshot()), 'lesson step synchronizes active-site focus');
  await page.getByRole('button', { name: 'Reaction diagram', exact: true }).click();
  assert.equal(await page.locator('svg[aria-label="Aconitase molecular step"]').count(), 1);
  const layouts = [];
  for (const [width, height] of [[1920, 1080], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(300);
    const layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
    assert.equal(layout.scrollWidth, width, 'no horizontal overflow at ' + width);
    layouts.push(layout);
    await page.screenshot({ path: `docs/metabolism-studio-review/layout-${width}.png`, fullPage: width < 1200 });
  }
  assert.deepEqual(errors, []);
  await writeFile('docs/metabolism-studio-review/verification.json', JSON.stringify({ passed: true, layouts, errors, warnings }, null, 2));
  console.log('ALL METABOLISM STUDIO CHECKS PASSED');
} finally {
  await browser.close();
}
