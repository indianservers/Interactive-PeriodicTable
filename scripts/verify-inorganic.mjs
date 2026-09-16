import {createRequire} from 'node:module';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:2411/#visuals/inorganic');await page.waitForTimeout(2500);
 await mkdir('docs/inorganic-review',{recursive:true});
 if(!process.env.INORGANIC_BASELINE){
  await page.locator('.cobalt-vessel .cobalt-scene[data-ready=true]').first().waitFor({timeout:60000});
  await page.getByRole('button',{name:'Pause motion',exact:true}).click();
  if(process.env.INORGANIC_GENERATE){
  await page.getByRole('tab',{name:'Playground',exact:true}).click();
  await mkdir('public/assets/inorganic',{recursive:true});
  for(const name of ['Pink','Violet','Blue']){
   await page.getByRole('button',{name:name+' state',exact:true}).click();await page.waitForFunction(expected=>Math.abs(Number(document.querySelector('.cobalt-vessel .cobalt-scene').dataset.fraction)-expected)<.01,{Pink:0,Violet:.5,Blue:.974}[name],{timeout:60000});
   const box=await page.locator('.cobalt-vessel canvas').first().boundingBox();
   await page.screenshot({path:'docs/inorganic-review/cobalt-'+name.toLowerCase()+'.png',clip:{x:box.x+box.width*.16,y:box.y+box.height*.43,width:box.width*.68,height:box.height*.50}});
  }
  await page.getByRole('button',{name:'Reset',exact:true}).click();
  await page.getByRole('tab',{name:'Investigation',exact:true}).click();await page.waitForTimeout(1800);
  }
  await page.waitForTimeout(2000);
 }
 await page.screenshot({path:`docs/inorganic-review/${process.env.INORGANIC_BASELINE?'before':'after'}.png`});
 if(process.env.INORGANIC_TEST){
  const b=name=>page.getByRole('button',{name,exact:true});
  await b('Add HCl (Cl⁻)').click();assert.equal(await page.locator('#cobalt-chloride').inputValue(),'0.75');
  await b('Add H₂O (dilute)').click();assert.equal(await page.locator('#cobalt-chloride').inputValue(),'0.375');
  await b('Heat solution').click();assert.equal(await page.locator('#cobalt-temperature').inputValue(),'35');
  await page.locator('#cobalt-chloride').fill('2');await page.locator('#cobalt-temperature').fill('60');
  await page.waitForFunction(()=>Number(document.querySelector('.cobalt-vessel .cobalt-scene').dataset.fraction)>.96,null,{timeout:60000});
  assert(Number(await page.locator('.cobalt-live .cobalt-scene').getAttribute('data-progress'))>.96);
  await b('Compare spectra').click();assert.equal(await b('Compare spectra').getAttribute('aria-pressed'),'false');await b('Compare spectra').click();
  await page.locator('.cobalt-spectrum svg').hover();assert.match(await page.locator('.cobalt-spectrum small').innerText(),/nm · A =/);
  await page.getByLabel('Substitution progress').fill('0.5');assert.match(await page.locator('.cobalt-live').innerText(),/water leaves/);
  await b('Reset substitution').click();await b('Play substitution').click();await page.waitForTimeout(700);await b('Pause substitution').click();
  const frozen=await page.getByLabel('Substitution progress').inputValue();await page.waitForTimeout(300);assert.equal(await page.getByLabel('Substitution progress').inputValue(),frozen);
  await b('Pause motion').click();
  await page.getByRole('tab',{name:'Conclusions',exact:true}).click();await b('＋ New').click();await page.getByLabel('Notebook note').fill('Heating favours the blue complex.');await b('Save note').click();assert.match(await page.locator('.cobalt-observations').innerText(),/Heating favours/);
  await b('Calculators').click();assert.equal(await page.getByRole('tab',{name:'Calculations',exact:true}).getAttribute('aria-selected'),'true');
  await b('Pink').click();assert.equal(await page.locator('#cobalt-chloride').inputValue(),'0.05');
  await b('Violet').click();assert.equal(await page.locator('#cobalt-chloride').inputValue(),'1.136');
  await b('Blue').click();assert.equal(await page.locator('#cobalt-temperature').inputValue(),'60');
  for(const name of ['Resources','Settings']){await b(name).click();assert(await page.locator('dialog').isVisible());await b('Close dialog').click();}
  await b('Reset').click();
  const layouts=[];
  for(const [width,height] of [[1920,1080],[1440,900],[1366,768],[1024,768],[390,844]]){
   await page.setViewportSize({width,height});await page.waitForTimeout(500);
   if(width<1150){await page.locator('.cobalt-live').scrollIntoViewIfNeeded();await page.waitForTimeout(600);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(300);}
   const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));assert.equal(layout.scrollWidth,width,'No horizontal overflow');layouts.push(layout);
   await page.screenshot({path:'docs/inorganic-review/layout-'+width+'.png',fullPage:width<1150});
  }
  await b('Toggle navigation').click();assert(await page.locator('.cobalt-nav').isVisible());await b('Coordination Chemistry').click();assert(!(await page.locator('.cobalt-nav').isVisible()));
  await b('Notes').click();assert(await page.locator('.cobalt-notebook').isVisible());await b('Close notebook').click();assert(!(await page.locator('.cobalt-notebook').isVisible()));
  assert.deepEqual(errors,[]);await writeFile('docs/inorganic-review/verification.json',JSON.stringify({passed:true,layouts,errors},null,2));console.log('PASS: controls, linked scene, spectra, substitution playback, notes, presets, dialogs and responsive layouts');
 }
 console.log({errors});
 if(process.env.INORGANIC_GENERATE)for(const name of ['pink','violet','blue'])await copyFile('docs/inorganic-review/cobalt-'+name+'.png','public/assets/inorganic/cobalt-'+name+'.png');
}finally{await browser.close();}
