import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root=process.env.PLAYWRIGHT_MODULE_ROOT;
if(!root) throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const {chromium}=createRequire(`${root}/package.json`)('playwright');
const base=process.env.CHEMISTRY_VL_URL||'http://127.0.0.1:5174/?screen=home#/simulations/flame-photometry';
const out='docs/chemistry-vl-mockup-rebuild/screenshots/flame-photometry';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const errors=[],layouts=[],screens=[];
try{
  const page=await browser.newPage({viewport:{width:1672,height:941}});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Start Experiment'}).click();
  await page.getByLabel('Target concentration').fill('8');
  assert.match(await page.locator('.fp-panel').last().innerText(),/V₁ = \(8 × 100\) \/ 1000 = 0\.800 mL/);
  await page.getByRole('button',{name:'Add Standard'}).click();
  await page.getByRole('button',{name:'Continue'}).click();
  await page.getByLabel('LPG fuel flow').fill('0.70');
  assert.match(await page.locator('.fp-panel').last().innerText(),/Adjust fuel and air/);
  await page.getByRole('button',{name:'Auto-optimize'}).click();
  assert.match(await page.locator('.fp-panel').last().innerText(),/98\.7%[\s\S]*Optimal flame/);
  await page.getByRole('button',{name:'Save conditions'}).click();
  await page.getByRole('button',{name:'Continue'}).click();
  await page.getByRole('radio').nth(1).check();
  assert.match(await page.locator('.fp-panel').last().innerText(),/Peak Analysis \(Potassium\)[\s\S]*766\.5 nm/);
  await page.getByRole('button',{name:'Run spectrum'}).click();
  assert.match(await page.locator('.fp-panel').last().innerText(),/Optimal wavelength/);
  await page.getByRole('button',{name:'Continue'}).click();
  assert.match(await page.locator('.fp-panel').last().innerText(),/Original concentration[\s\S]*100\.0 ± 0\.8 mg\/L/);
  await page.getByRole('button',{name:'Accept result'}).click();
  assert.match(await page.locator('.fp-panel').last().innerText(),/Result Accepted/);
  await page.getByRole('button',{name:'Continue'}).click();
  for(const label of ['Atomize and excite analyte','589.0 nm','Proportional to concentration']) await page.getByLabel(label).check();
  assert.match(await page.locator('.fp-panel').last().innerText(),/Score:\s*3\/3/);
  for(const id of ['home','standards','flame','spectrum','calibration','report']){
    await page.goto(base.replace('screen=home',`screen=${id}`),{waitUntil:'networkidle'});
    await page.locator('[role="status"]').evaluateAll(nodes=>nodes.forEach(n=>n.style.display='none'));
    await page.screenshot({path:`${out}/${id}-1672.png`,fullPage:true});screens.push({id,passed:true});
  }
  for(const[width,height]of[[1440,900],[1024,768],[768,1024],[390,844]]){
    await page.setViewportSize({width,height});await page.goto(base.replace('screen=home','screen=spectrum'),{waitUntil:'networkidle'});
    await page.locator('[role="status"]').evaluateAll(nodes=>nodes.forEach(n=>n.style.display='none'));
    const metric=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,overflow:document.documentElement.scrollWidth>innerWidth+1}));
    assert.equal(metric.overflow,false);layouts.push(metric);await page.screenshot({path:`${out}/spectrum-${width}.png`,fullPage:true});
  }
  assert.deepEqual(errors,[]);
  await writeFile(`${out}/verification.json`,JSON.stringify({simulator:'flame-photometry',passed:true,screens,layouts,consoleErrors:errors},null,2));
  console.log('ALL FLAME PHOTOMETRY CHECKS PASSED');
}finally{await browser.close()}
