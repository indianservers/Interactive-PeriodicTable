import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:2411/#visuals/bio/proteins');
 await page.locator('.ps-viewport .ps-molecule[data-ready=true]').waitFor({timeout:120000});
 await page.getByRole('button',{name:'Gallery',exact:true}).click({timeout:120000});
 await page.getByRole('button',{name:'Explore AlphaFold prediction',exact:true}).click();
 await page.locator('.ps-af-view[data-ready=true]').waitFor({timeout:60000});
 assert.match(await page.locator('.ps-af-explorer').innerText(),/154 residues/);
 const canvas=page.locator('.ps-af-view canvas');const initial=await canvas.screenshot();
 await page.getByLabel('AlphaFold coloring').selectOption('spectrum');
 await page.waitForTimeout(300);assert(!initial.equals(await canvas.screenshot()),'Coloring must update real rendered model');
 await page.getByRole('button',{name:'Atomic sticks',exact:true}).click();
 assert.equal(await page.getByRole('button',{name:'Atomic sticks',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Fit prediction',exact:true}).click();
 await page.screenshot({path:'docs/protein-studio-review/alphafold.png'});
 await page.getByRole('button',{name:'Close dialog',exact:true}).click();
 assert.equal(await page.locator('.ps-af-view').count(),0);
 assert.deepEqual(errors,[]);
 console.log('PASS: live AlphaFold fetch, 154 residues, WebGL render, confidence/rainbow, sticks, fit, close; no page errors');
}finally{await browser.close();}
