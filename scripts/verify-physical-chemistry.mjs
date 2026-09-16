import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { MODELS, initialInputs, solve } from '../src/modules/physical-chemistry/workspaceModels.js';

const moduleRoot=process.env.PLAYWRIGHT_MODULE_ROOT;
if(!moduleRoot) throw new Error('PLAYWRIGHT_MODULE_ROOT is required');
const {chromium}=createRequire(moduleRoot+'/package.json')('playwright');
const slugs=['molecular-dynamics',...Object.keys(MODELS)];
const report={passed:false,sequence:[],errors:[],warnings:[],modelChecks:[]};
for(const slug of Object.keys(MODELS)){
 const result=solve(slug,initialInputs(slug),0);
 assert(result.rows.length>=4,`${slug}: derived rows`);assert(result.plots.length>=3,`${slug}: plots`);
 const encoded=JSON.stringify(result);assert(!/NaN|Infinity|null/.test(encoded),`${slug}: finite model output`);
 report.modelChecks.push({slug,rows:result.rows.length,plots:result.plots.length,equations:result.equations.length});
}
const equilibrium=solve('chemical-equilibrium',initialInputs('chemical-equilibrium'));
assert(Math.abs(Number(equilibrium.rows[2][1])-.25)<1e-4,'equilibrium mass-action quotient equals Kc');
const populations=solve('statistical-thermodynamics',initialInputs('statistical-thermodynamics')).populations;
assert(Math.abs(populations.reduce((a,b)=>a+b,0)-1)<1e-12,'Boltzmann probabilities normalize to one');
assert(solve('thermodynamics',initialInputs('thermodynamics')).rows[0][1].startsWith('50.00'),'Carnot efficiency matches 1 - Tc/Th');
assert(!solve('solutions-colligative-properties',initialInputs('solutions-colligative-properties')).rows.some(([,v])=>String(v).startsWith('-')),'colligative shifts and pressure are non-negative');
assert(Number.parseFloat(solve('transport-phenomena',initialInputs('transport-phenomena')).rows[0][1])>0,'Stokes-Einstein diffusion coefficient is positive');
await mkdir('docs/physical-chemistry-rebuild/screenshots',{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1672,height:941}});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());if(m.type()==='warning')report.warnings.push(m.text())});
 for(let index=0;index<slugs.length;index++){
  const slug=slugs[index];console.log(`checking ${String(index+1).padStart(2,'0')} ${slug}`);if(index===0)await page.goto(`http://127.0.0.1:${process.env.PHYSICAL_PORT||5175}/#modules/physical/${slug}`,{waitUntil:'domcontentloaded',timeout:60000});else await page.getByLabel('Workspace').selectOption(slug);await page.waitForFunction(next=>document.querySelector('select[aria-label="Workspace"]')?.value===next,slug,{timeout:60000});await page.locator('.pcs-workhead h1').waitFor({state:'visible',timeout:60000});await page.waitForTimeout(slug==='molecular-dynamics'?900:220);
  const title=await page.locator('.pcs-workhead h1').innerText({timeout:60000});assert(title.length>3,`${slug}: title`);
  const plots=await page.locator('.pcs-plot').count();assert(plots>=3,`${slug}: plot count`);
  const text=await page.locator('.pcs-main').innerText();assert(!/NaN|Infinity|undefined/.test(text),`${slug}: rendered values finite`);
  const run=page.getByRole('button',{name:'Run',exact:true}),pause=page.getByRole('button',{name:'Pause',exact:true}),reset=page.getByRole('button',{name:'Reset',exact:true});await run.click();await page.waitForTimeout(180);assert.equal(await run.getAttribute('aria-pressed'),'true');await pause.click();
  const first=page.locator('.pcs-controls input[type=range]').first();if(await first.count()){const before=await first.inputValue(),min=Number(await first.getAttribute('min')),max=Number(await first.getAttribute('max')),step=Number(await first.getAttribute('step'))||1,next=Math.round((min+(max-min)*.67)/step)*step;await first.fill(String(Number(next.toPrecision(12))));assert.notEqual(await first.inputValue(),before);await reset.click()}
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));assert.equal(layout.scrollWidth,layout.width,`${slug}: desktop overflow`);
  await page.screenshot({path:`docs/physical-chemistry-rebuild/screenshots/${String(index+1).padStart(2,'0')}-${slug}-1672.png`,fullPage:true});
  report.sequence.push({index:index+1,slug,title,plots,layout});
 }
 for(const slug of slugs){await page.setViewportSize({width:390,height:844});await page.goto(`http://127.0.0.1:${process.env.PHYSICAL_PORT||5175}/#modules/physical/${slug}`,{waitUntil:'domcontentloaded'});await page.waitForTimeout(80);const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));assert.equal(layout.scrollWidth,390,`${slug}: mobile overflow`)}
 assert.deepEqual(report.errors,[],'browser console errors');report.passed=true;await writeFile('docs/physical-chemistry-rebuild/verification.json',JSON.stringify(report,null,2));console.log(`PASS: ${slugs.length} workspaces validated in strict sequence; desktop/mobile overflow, controls, reset, plots and finite outputs checked.`);
}finally{await browser.close()}
