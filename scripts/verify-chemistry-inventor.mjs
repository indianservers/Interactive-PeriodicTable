import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!root) throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const { chromium } = createRequire(root + '/package.json')('playwright');
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--enable-webgl', '--use-angle=swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await mkdir('docs/chemistry-inventor-review', { recursive: true });
  await page.goto('http://127.0.0.1:5175/#chemistry-inventor');
  const initialLogS = await page.locator('.ci-table tbody tr').first().locator('td').nth(1).innerText();
  await page.getByRole('button', { name: /Hydroxyl/ }).click();
  assert.notEqual(await page.locator('.ci-table tbody tr').first().locator('td').nth(1).innerText(), initialLogS);
  assert.equal(await page.locator('.ci-molecule').count(), 1);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.locator('.ci-inspection[data-ready=true] .molstar-viewer[data-ready=true]').waitFor({ timeout: 60000 });
  assert.match(await page.locator('.ci-inspection-note').innerText(), /PubChem CID 7344/);
  await page.getByRole('button', { name: 'Space filling', exact: true }).last().click();
  assert.equal(await page.locator('.ci-inspection-tools button.active').innerText(), 'Space filling');
  assert.equal(await page.locator('input[type=file][accept*=".sdf"]').count(), 1);
  await page.screenshot({ path: 'docs/chemistry-inventor-review/after-molstar-1920.png', fullPage: true });
  const layouts = [];
  for (const [width, height] of [[1920, 1080], [1024, 768], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(250);
    const result = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth, height: innerHeight, scrollHeight: document.documentElement.scrollHeight }));
    assert.equal(result.scrollWidth, width);
    layouts.push(result);
    await page.screenshot({ path: `docs/chemistry-inventor-review/layout-${width}.png`, fullPage: width < 1200 });
  }
  await page.getByRole('button', { name: '2D', exact: true }).click();
  assert.equal(await page.locator('.ci-molecule').count(), 1);
  await page.getByRole('button', { name: /Run Simulation/ }).click();
  assert.match(await page.getByRole('button', { name: /Simulation complete/ }).innerText(), /complete/);
  assert.deepEqual(errors, []);
  await writeFile('docs/chemistry-inventor-review/verification.json', JSON.stringify({ passed: true, layouts, errors }, null, 2));
  console.log('ALL CHEMISTRY INVENTOR CHECKS PASSED');
} finally {
  await browser.close();
}
