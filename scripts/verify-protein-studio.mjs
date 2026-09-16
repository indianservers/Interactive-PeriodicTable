import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT?process.env.ORGANIC_QA_MODULE_ROOT+'/package.json':import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
const dir='docs/protein-studio-review';await mkdir(dir,{recursive:true});
try{
 await page.goto('http://localhost:2411/#/visuals/bio/proteins');
 await page.locator('.ps-viewport .ps-molecule[data-ready=true]').waitFor({timeout:60000});
 await page.waitForTimeout(3500);
 console.log('surface',await page.locator('.ps-viewport .ps-webgl').getAttribute('data-surface'));
 const before=await page.locator('.ps-viewport canvas').screenshot();await page.getByRole('button',{name:'Surface',exact:true}).click();await page.waitForTimeout(300);console.log('surface changes pixels',!before.equals(await page.locator('.ps-viewport canvas').screenshot()));await page.getByRole('button',{name:'Surface',exact:true}).click();await page.waitForTimeout(1500);
 await page.screenshot({path:dir+'/desktop-1920.png'});
 console.log(await page.locator('.ps-view-state').allTextContents());
 console.log(JSON.stringify({errors,sequence:await page.locator('.ps-sequence-row button').count(),canvas:await page.locator('canvas').count(),layout:await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,panels:[...document.querySelectorAll('.ps-panel')].map(e=>{const r=e.getBoundingClientRect();return {id:e.id,x:r.x,y:r.y,w:r.width,h:r.height,bottom:r.bottom,scroll:e.scrollHeight,client:e.clientHeight};})}))}));
 await writeFile(dir+'/initial-errors.json',JSON.stringify(errors));
 if(process.env.PROTEIN_SCREENSHOT_ONLY)process.exitCode=0;
 else {
 const button=name=>page.getByRole('button',{name,exact:true});
 const canvas=page.locator('.ps-viewport canvas');
 for(const name of ['Surface','Cartoon','Sticks','Labels']){
  const a=await canvas.screenshot();await button(name).click();await page.waitForTimeout(300);
  assert(!a.equals(await canvas.screenshot()),name+' must change molecular pixels');await button(name).click();await page.waitForTimeout(500);
 }
 for(const name of ['Hydrogen bonds','Ionic interactions','Hydrophobic contacts']){
  const a=await canvas.screenshot();await button(name).click();await page.waitForTimeout(200);assert(!a.equals(await canvas.screenshot()),name+' must change the scene');await button(name).click();await page.waitForTimeout(350);
 }
 await button('Disulfide bonds').click();assert.match(await page.getByRole('status').innerText(),/no cysteine/);await button('Disulfide bonds').click();await button('Dismiss notification').click();
 await button('LEU 29').hover();assert.equal(await page.locator('.ps-view-bottom>span').innerText(),'LEU 29');
 await button('LEU 29').click();assert.equal(await page.locator('.ps-viewport .ps-molecule').getAttribute('data-selected'),'29');
 await button('Introduce mutation').click();assert.equal(await page.locator('.ps-comparison').count(),1);
 await button('Predict').click();assert.match(await page.locator('.ps-mutation-result').innerText(),/\+1.8 kcal\/mol/);
 await page.getByLabel('Mutant amino acid',{exact:true}).selectOption('L');await button('Predict').click();assert.match(await page.locator('.ps-mutation-result').innerText(),/0.0 kcal\/mol/);
 await page.getByLabel('Wild-type amino acid',{exact:true}).selectOption('H');assert.match(await page.getByLabel('Residue position',{exact:true}).locator('option:checked').innerText(),/^H/);
 await page.getByLabel('Residue position',{exact:true}).selectOption('153');assert.equal(await page.getByLabel('Wild-type amino acid',{exact:true}).inputValue(),'G');
 await page.getByLabel('Search proteins, PDB IDs, or mutations').fill('L29A');await button('Search').click();assert.equal(await page.getByLabel('Residue position',{exact:true}).inputValue(),'29');assert.equal(await page.getByLabel('Mutant amino acid',{exact:true}).inputValue(),'A');
 await page.getByLabel('Search proteins, PDB IDs, or mutations').fill('L900A');await button('Search').click();assert.match(await page.getByRole('status').innerText(),/No matching residue/);
 await button('Dismiss notification').click();
 const axis=await page.locator('[data-axis=x]').getAttribute('x2'),rotBefore=await canvas.screenshot();await button('Rotate left').click();assert.notEqual(await page.locator('[data-axis=x]').getAttribute('x2'),axis);assert(!rotBefore.equals(await canvas.screenshot()));
 for(const name of ['Pan right','Zoom in','Zoom out','Reset camera'])await button(name).click();
 await button('Fullscreen molecular viewport').click();assert(await page.evaluate(()=>!!document.fullscreenElement));await button('Fullscreen molecular viewport').click();
 const marker=await page.locator('[data-energy-marker]').getAttribute('cy');
 for(const [name,time] of [['Unfolded chain',0],['Secondary structure',65],['Tertiary structure',135],['Native state',200]]){await button('Show '+name).click();assert.equal(await page.getByLabel('Folding progress').inputValue(),String(time));assert.equal(await page.locator('.ps-viewport .ps-molecule').getAttribute('data-time'),String(time));}
 await page.getByLabel('Folding progress').fill('90');assert.notEqual(await page.locator('[data-energy-marker]').getAttribute('cy'),marker);
 await button('Animate folding').click();await page.waitForTimeout(400);await button('Pause folding').click();const frozen=await page.getByLabel('Folding progress').inputValue();await page.waitForTimeout(300);assert.equal(await page.getByLabel('Folding progress').inputValue(),frozen);
 await button('Show Native state').click();
 await page.locator('.ps-energy-chart').hover();assert.equal(await page.locator('.ps-chart-tooltip').count(),1);
 for(const name of ['Gallery','Tools','Learn','Help']){await button(name).click();assert(await page.locator('dialog').isVisible());await button('Close dialog').click();}
 await button('Tools').click();const download=page.waitForEvent('download');await button('Export molecular viewport PNG').click();assert.equal((await download).suggestedFilename(),'1MBN-myoglobin.png');await button('Close dialog').click();
 const pdbDownload=page.waitForEvent('download');await page.getByRole('link',{name:'Download',exact:true}).click();assert.equal((await pdbDownload).suggestedFilename(),'1MBN.pdb');
 await button('Share').click();assert(await page.getByRole('status').count()||await page.locator('dialog').isVisible());if(await page.locator('dialog').isVisible())await button('Close dialog').click();
 await button('Reset').click();if(await button('Dismiss notification').count())await button('Dismiss notification').click();
 const layouts=[];
 for(const [width,height] of [[1920,1080],[1440,900],[1024,900],[390,844]]){
  await page.setViewportSize({width,height});await page.waitForTimeout(400);
  const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,essential:[...document.querySelectorAll('#ps-mutation,#ps-folding')].map(e=>e.getBoundingClientRect().bottom)}));
  assert.equal(layout.scrollWidth,width,'horizontal overflow');if(width>=1440){assert.equal(layout.scrollHeight,height,'desktop vertical overflow');assert(layout.essential.every(b=>b<=height),'essential panels fit');}
  layouts.push(layout);await page.screenshot({path:dir+'/layout-'+width+'.png',fullPage:width<1440});
 }
 const sequenceToggle=page.locator('#ps-sequence .ps-panel-toggle');await sequenceToggle.click();assert(!(await page.locator('#ps-sequence .ps-panel-body').isVisible()));await sequenceToggle.click();assert(await page.locator('#ps-sequence .ps-panel-body').isVisible());
 for(const id of ['interactions','energy','mutation','folding']){const toggle=page.locator('#ps-'+id+' .ps-panel-toggle');await toggle.click();assert(!(await page.locator('#ps-'+id+' .ps-panel-body').isVisible()));await toggle.click();}
 assert.deepEqual(errors,[]);
 await writeFile(dir+'/browser-verification.json',JSON.stringify({passed:true,layouts,errors,controls:'representations, contacts, selection, mutation, search, camera, fullscreen, animation, chart, dialogs, downloads, responsive accordions'},null,2));
 console.log('ALL PROTEIN STUDIO CHECKS PASSED');
 }
}catch(e){console.log({errors,states:await page.locator('.ps-view-state').allTextContents()});await page.screenshot({path:dir+'/failure.png'});throw e;}finally{await browser.close();}
