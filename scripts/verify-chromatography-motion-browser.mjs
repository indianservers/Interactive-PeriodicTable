import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(`${process.env.PLAYWRIGHT_MODULE_ROOT}/package.json`)('playwright');
const out='docs/chemistry-vl-mockup-rebuild/motion-verification/chromatography';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1672,height:941}}),errors=[],frames=[];page.on('pageerror',e=>errors.push(e.message));
const state=()=>page.locator('[data-motion]').evaluate(el=>JSON.parse(el.dataset.motion));
async function capture(action,label){const wasPaused=(await state()).paused;if(!wasPaused)await page.getByRole('button',{name:'Pause motion',exact:true}).click();const s=await state();assert(Math.abs(s.tubeVolume+s.pipetteVolume+s.plateVolume-1000)<1e-7);const path=`${out}/${action}-${label}.png`;await page.screenshot({path});frames.push({action,label,path,state:s});if(!wasPaused)await page.getByRole('button',{name:'Resume motion',exact:true}).click();}
try{
 await page.goto(process.env.CHEMISTRY_VL_URL||'http://127.0.0.1:5174/?screen=tlc#/simulations/chromatography-separation',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Prepare sample · live apparatus'}).click();await page.locator('.chm-scene canvas').waitFor();
 for(const [action,button,duration] of [['shake','Shake sample',7000],['aspirate','Aspirate 2 µL',3000],['dispense','Dispense onto plate',3000],['place','Place in chamber',1800],['develop','Develop plate',8500],['inspect','Remove and inspect',1800]]){
  await capture(action,'initial');await page.getByRole('button',{name:button,exact:true}).click();
  for(const label of ['early','middle','maximum','settling','final']){await page.waitForTimeout(duration/5);await capture(action,label);}
 }
 assert.equal((await state()).phase,'inspected');await page.getByRole('button',{name:'UV 254 nm',exact:true}).click();await capture('uv','final');assert((await state()).uv);
 await page.getByRole('button',{name:'Close preparation'}).click();await page.getByRole('button',{name:'Prepare sample · live apparatus'}).click();assert.equal((await state()).phase,'inspected');
 await page.getByRole('button',{name:'Reset preparation'}).click();await capture('reset','final');assert.equal((await state()).tubeVolume,1000);
 await page.getByRole('button',{name:'Close preparation'}).click();assert.equal(await page.locator('.chm-scene canvas').count(),0);assert.deepEqual(errors,[]);
 await writeFile(`${out}/browser-verification.json`,JSON.stringify({passed:true,errors,frames,limitations:['Geometric containment and visual quality require review of the captured frames.','Column motion and integration with the main experiment are not yet covered.']},null,2));
 console.log('Motion browser sequence passed; 38 frames saved.');
}finally{await browser.close();}
