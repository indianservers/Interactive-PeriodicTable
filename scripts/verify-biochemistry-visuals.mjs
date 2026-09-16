import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const moduleRoot = process.env.PLAYWRIGHT_MODULE_ROOT;
if (!moduleRoot) throw new Error('Set PLAYWRIGHT_MODULE_ROOT.');
const { chromium } = createRequire(moduleRoot + '/package.json')('playwright');
const browser = await chromium.launch({ headless:true, executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe', args:['--enable-webgl','--use-angle=swiftshader'] });
try {
  const page = await browser.newPage({ viewport:{width:1920,height:1080} }), errors=[], warnings=[];
  page.on('pageerror', error=>errors.push(error.message));
  page.on('console', message=>{if(message.type()==='error')errors.push(message.text());if(message.type()==='warning')warnings.push(message.text());});
  await page.goto('http://127.0.0.1:5175/#visuals/bio');
  await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});
  assert.match(await page.locator('.molstar-viewer-badge').innerText(),/PDB 1MBN/);
  await page.screenshot({path:'docs/biochemistry-visuals-review/after-1920.png'});
  const canvas=page.locator('.molstar-viewer-host canvas').first(),initial=await canvas.screenshot();
  await page.getByRole('button',{name:'Surface',exact:true}).click();await page.waitForTimeout(450);assert(!initial.equals(await canvas.screenshot()),'preview representation changes');
  const previews=[['Membranes','PDB 4HQJ'],['Carbohydrates','D-GLUCOSE'],['Nucleic acids','PDB 1BNA'],['Metabolism','PDB 1C96'],['Proteins','PDB 1MBN']];
  for(const [name,badge] of previews){await page.locator('aside').first().getByRole('button',{name,exact:true}).click();await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});assert.match((await page.locator('.molstar-viewer-badge').innerText()).toUpperCase(),new RegExp(badge));}
  const search=page.getByPlaceholder('Search structures, pathways, or concepts...');await search.fill('DNA');assert.equal(await page.locator('.bio-hub-cards article').count(),1);await search.fill('');
  await page.getByRole('button',{name:'Function',exact:true}).click();assert.match(await page.locator('.bio-hub-layout>section').innerText(),/Function/);
  const layouts=[];for(const [width,height] of [[1920,1080],[1024,768],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(300);const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));assert.equal(layout.scrollWidth,width,'no horizontal overflow at '+width);layouts.push(layout);await page.screenshot({path:`docs/biochemistry-visuals-review/layout-${width}.png`,fullPage:width<1200});}
  assert.deepEqual(errors,[]);await writeFile('docs/biochemistry-visuals-review/verification.json',JSON.stringify({passed:true,layouts,errors,warnings},null,2));console.log('ALL BIOCHEMISTRY VISUALS CHECKS PASSED');
} finally { await browser.close(); }
