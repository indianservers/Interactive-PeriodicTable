import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=process.env.PLAYWRIGHT_MODULE_ROOT;if(!root)throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const {chromium}=createRequire(root+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.addInitScript(()=>localStorage.setItem('cu-symmetry-tour-seen','true'));
 await mkdir('docs/molecular-symmetry-review',{recursive:true});
 await page.goto('http://127.0.0.1:5175/#molecular-symmetry');
 await page.waitForTimeout(900);
 assert.equal(await page.locator('.sym-viewer canvas').count(),1);
 await page.getByRole('button',{name:/Apply C2 Operation/}).click();
 await page.waitForTimeout(250);
 assert.match(await page.locator('.sym-verdict').innerText(),/Equivalent positions verified/);
 await page.getByRole('button',{name:'Mol* geometry',exact:true}).click();
 await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});
 assert.equal(await page.locator('.molstar-viewer').getAttribute('data-engine'),'Mol*');
 const canvas=page.locator('.molstar-viewer-host canvas').first(),water=await canvas.screenshot();
 await page.locator('.sym-molecule-select').selectOption('methane');
 await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});await page.waitForTimeout(400);
 assert(!water.equals(await canvas.screenshot()));
 await page.locator('.sym-viewer-tools select').selectOption('space-fill');await page.waitForTimeout(350);
 await page.screenshot({path:'docs/molecular-symmetry-review/after-molstar-1920.png',fullPage:true});
 await page.getByRole('button',{name:'Symmetry overlay',exact:true}).click();
 assert.equal(await page.locator('.sym-viewer canvas').count(),1);
 const layouts=[];for(const[width,height]of[[1920,1080],[1024,768],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(250);const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));assert.equal(result.scrollWidth,width);layouts.push(result);await page.screenshot({path:`docs/molecular-symmetry-review/layout-${width}.png`,fullPage:width<1200});}
 assert.deepEqual(errors,[]);await writeFile('docs/molecular-symmetry-review/verification.json',JSON.stringify({passed:true,layouts,errors},null,2));console.log('ALL MOLECULAR SYMMETRY CHECKS PASSED');
}finally{await browser.close();}
