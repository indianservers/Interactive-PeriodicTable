import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=process.env.PLAYWRIGHT_MODULE_ROOT;if(!root)throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const{chromium}=createRequire(root+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await mkdir('docs/coordination-chemistry-review',{recursive:true});
 await page.goto('http://127.0.0.1:5175/#visuals/inorganic/coordination');
 const waitReady=async label=>{await page.locator('.coord-status span').filter({hasText:label}).waitFor({timeout:60000});await page.locator('.coord-status b').filter({hasText:'Mol* coordinates ready'}).waitFor({timeout:60000});};
 await waitReady('Octahedral');
 assert.match(await page.locator('.coord-status').innerText(),/Octahedral/);
 const canvas=page.locator('.molstar-viewer-host canvas').first(),oct=await canvas.screenshot();
 for(const name of ['Tetrahedral','Square Planar','Trigonal Bipyramidal','Distorted','Chelate','Bridging Ligands']){
   await page.getByRole('button',{name,exact:true}).click();
   await waitReady(name);
   assert.match(await page.locator('.coord-status').innerText(),new RegExp(name));
 }
 assert(!oct.equals(await canvas.screenshot()));
 await page.getByLabel('Metal selection').selectOption('Pt');
 await waitReady('Pt');
 assert.equal(await page.locator('input[value^="Pt "]').count(),1);
 await page.getByRole('button',{name:'Space filling',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Space filling',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByTitle('Measure atom distance').click();
 assert.equal(await page.getByTitle('Measure atom distance').getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:/Δ-\[M\(en\)₃\]/}).click();
 await waitReady('Chelate');
 assert.match(await page.locator('.coord-status').innerText(),/Chelate/);
 assert.equal(await page.locator('input[type=file][accept*=".sdf"]').count(),1);
 await page.getByLabel('Metal selection').selectOption('Co');await page.getByRole('button',{name:'Octahedral',exact:true}).click();await page.getByRole('button',{name:'Ball & stick',exact:true}).click();await waitReady('Octahedral');
 await page.screenshot({path:'docs/coordination-chemistry-review/after-molstar-1920.png',fullPage:true});
 const layouts=[];for(const[width,height]of[[1920,1080],[1024,768],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(250);const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));assert.equal(result.scrollWidth,width);layouts.push(result);await page.screenshot({path:`docs/coordination-chemistry-review/layout-${width}.png`,fullPage:width<1200});}
 assert.deepEqual(errors,[]);await writeFile('docs/coordination-chemistry-review/verification.json',JSON.stringify({passed:true,layouts,errors},null,2));console.log('ALL COORDINATION CHEMISTRY CHECKS PASSED');
}finally{await browser.close();}
