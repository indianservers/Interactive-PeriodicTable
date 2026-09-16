import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root=process.env.PLAYWRIGHT_MODULE_ROOT;
if(!root) throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const {chromium}=createRequire(`${root}/package.json`)('playwright');
const base=process.env.CHEMISTRY_VL_URL||'http://127.0.0.1:5174/?screen=home#/simulations/chromatography-separation';
const out='docs/chemistry-vl-mockup-rebuild/screenshots/chromatography-separation';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],layouts=[],screens=[];
try {
  const page=await browser.newPage({viewport:{width:1672,height:941}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Start Experiment'}).click();
  await page.getByLabel('60:40').check();
  assert.match(await page.getByRole('heading',{name:'Calculate Rf Values'}).locator('..').innerText(),/0\.35[\s\S]*0\.64[\s\S]*0\.86/);
  await page.getByLabel('70:30').check();
  await page.getByRole('button',{name:'Save Method'}).click();
  await page.getByRole('button',{name:'Continue'}).click();
  await page.getByRole('button',{name:'Auto-pack Column'}).click();
  assert.match(await page.locator('.ch-panel').last().innerText(),/Column ready/);
  await page.getByRole('button',{name:'Continue'}).click();
  for(let i=0;i<3;i++) await page.getByRole('button',{name:'Advance 10 mL'}).click();
  assert.match(await page.locator('.ch-panel').last().innerText(),/24 \/ 24[\s\S]*Elution complete/);
  await page.getByRole('button',{name:'Continue'}).click();
  assert.match(await page.locator('.ch-panel').last().innerText(),/Purity\s*98\.6 %[\s\S]*Recovery\s*96\.4 %/);
  await page.getByRole('button',{name:'Accept Pools'}).click();
  await page.getByRole('button',{name:'Continue'}).click();
  for(const label of ['Increases elution strength','Improves resolution','Same pure component and acceptable boundaries']) await page.getByLabel(label).check();
  assert.match(await page.locator('.ch-panel').last().innerText(),/Score:\s*3\/3/);
  for(const [id] of [['home'],['tlc'],['column'],['elution'],['analysis'],['report']]) {
    await page.goto(base.replace('screen=home',`screen=${id}`),{waitUntil:'networkidle'});
    await page.locator('[role="status"]').evaluateAll(nodes=>nodes.forEach(n=>n.style.display='none'));
    await page.screenshot({path:`${out}/${id}-1672.png`,fullPage:true});
    screens.push({id,passed:true});
  }
  for(const [width,height] of [[1440,900],[1024,768],[768,1024],[390,844]]) {
    await page.setViewportSize({width,height});
    await page.goto(base.replace('screen=home','screen=analysis'),{waitUntil:'networkidle'});
    await page.locator('[role="status"]').evaluateAll(nodes=>nodes.forEach(n=>n.style.display='none'));
    const metric=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}));
    assert.equal(metric.overflow,false);
    layouts.push(metric);
    await page.screenshot({path:`${out}/analysis-${width}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/verification.json`,JSON.stringify({simulator:'chromatography-separation',passed:true,screens,layouts,consoleErrors:errors},null,2));
  console.log('ALL CHROMATOGRAPHY LAB CHECKS PASSED');
} finally { await browser.close(); }
