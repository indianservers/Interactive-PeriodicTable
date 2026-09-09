import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {resolve} from 'node:path';
const moduleRoot=process.env.PLAYWRIGHT_MODULE_ROOT||process.env.ORGANIC_QA_MODULE_ROOT;
const {chromium}=createRequire(moduleRoot+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],warnings=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 await page.goto('http://127.0.0.1:5175/#visuals/inorganic/crystals');await page.waitForTimeout(2000);await mkdir('docs/crystal-review',{recursive:true});
 await page.locator('.crystal-stage .crystal-canvas[data-ready=true]').waitFor({timeout:60000});await page.getByRole('checkbox',{name:'Auto-rotate',exact:true}).uncheck();await page.waitForTimeout(500);
 if(process.env.CRYSTAL_BEFORE)await page.getByRole('button',{name:'CIF Inspect',exact:true}).evaluate(el=>el.style.display='none');
 await page.screenshot({path:'docs/crystal-review/'+(process.env.CRYSTAL_BEFORE?'before':'after')+'.png'});
 if(process.env.CRYSTAL_TEST){
  const b=name=>page.getByRole('button',{name,exact:true}),c=name=>page.getByRole('checkbox',{name,exact:true}),canvas=page.locator('.crystal-stage canvas'),root=page.locator('.crystal-stage .crystal-canvas');
  for(const name of ['Show unit cell','Show coordination polyhedra','Label ions']){const before=await canvas.screenshot();await b(name).click();await page.waitForTimeout(180);assert(!before.equals(await canvas.screenshot()),name+' changes rendered scene');await b(name).click();}
  const count=Number(await root.getAttribute('data-rendered-atoms'));await b('Add vacancy defect').click();assert.equal(Number(await root.getAttribute('data-vacancies')),1);assert.equal(Number(await root.getAttribute('data-rendered-atoms')),count-1);
  await page.getByLabel('Defect concentration',{exact:true}).fill('5');assert(Number(await root.getAttribute('data-vacancies'))>1);
  await c('Add interstitial').check();await c('Add interstitial').uncheck();await c('Vacancy defects').uncheck();
  const atoms=await root.getAttribute('data-atoms');await page.getByLabel('Repeat cells',{exact:true}).fill('2');assert.notEqual(await root.getAttribute('data-atoms'),atoms);
  for(const mode of ['Ball & stick','Space-filling','Solid']){await b(mode).click();assert.equal(await b(mode).getAttribute('aria-pressed'),'true');}
  for(const view of ['2D View','3D View']){await b(view).click();assert.equal(await b(view).getAttribute('aria-pressed'),'true');}
  await page.getByLabel('Miller h').fill('2');assert.match(await page.locator('.crystal-miller h3').innerText(),/2 1 1/);assert.match(await page.locator('.crystal-spacing').innerText(),/2.30/);
  for(const name of ['Show plane','Show atoms in plane','Shade one side','Clip with plane','Context cutaway']){await c(name).click();await c(name).click();}
  for(const axis of ['h','k','l'])await page.getByLabel('Miller '+axis).fill('0');assert.match(await page.locator('.crystal-spacing').innerText(),/does not define/);for(const axis of ['h','k','l'])await page.getByLabel('Miller '+axis).fill('1');
  await page.locator('.crystal-xrd svg').hover();assert.match(await page.locator('.crystal-chart-note').innerText(),/2θ =/);
  for(const name of ['Cesium chloride','Zinc blende','Fluorite','Diamond','Graphite','Rock salt']){await b(name).click();assert.match(await page.locator('.crystal-title h2').innerText(),new RegExp(name));assert(await page.locator('.katex').count());}
  await page.getByLabel('Search structures').fill('carbon');assert.equal(await page.locator('.crystal-library-list button').count(),2);await page.getByLabel('Search structures').fill('unobtainium');assert.match(await page.locator('.crystal-library').innerText(),/No matching/);await page.getByLabel('Search structures').fill('');
  await b('Tools').click();const download=page.waitForEvent('download');await b('Export lattice PNG').click();assert.equal((await download).suggestedFilename(),'nacl-lattice.png');await b('Close crystal dialog').click();
  await b('Learn').click();assert(await page.locator('dialog').isVisible());await b('Close crystal dialog').click();await b('Crystal settings').click();await page.getByLabel('Enable automatic rotation').check();await page.getByLabel('Enable automatic rotation').uncheck();await b('Close crystal dialog').click();await b('Reset camera').click();
  await b('CIF Inspect').click();await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});assert.equal(await page.locator('.molstar-viewer').getAttribute('data-engine'),'Mol*');assert.match(await page.locator('.crystal-title').innerText(),/COD 9008678/);assert.equal(await b('Unit cell').getAttribute('aria-pressed'),'true');
  const cifTools=page.locator('.crystal-cif-tools'),molCanvas=page.locator('.crystal-stage .molstar-viewer-host canvas').first();const cifBefore=await molCanvas.screenshot();await cifTools.getByRole('button',{name:'Ball & stick',exact:true}).click();await page.waitForTimeout(350);assert(!cifBefore.equals(await molCanvas.screenshot()),'Mol* crystal representation changes');const withCell=await molCanvas.screenshot();await cifTools.getByRole('button',{name:'Unit cell',exact:true}).click();await page.waitForTimeout(250);assert(!withCell.equals(await molCanvas.screenshot()),'Mol* unit-cell visibility changes');await cifTools.getByRole('button',{name:'Unit cell',exact:true}).click();await cifTools.getByRole('button',{name:'Reset',exact:true}).click();
  await page.locator('input[type=file]').setInputFiles(resolve('public/assets/crystals/cod/9008678-nacl.cif'));await page.locator('.crystal-title').getByText(/9008678-nacl\.cif/).waitFor({timeout:10000});await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});assert.match(await page.locator('.crystal-title').innerText(),/9008678-nacl\.cif/);await page.screenshot({path:'docs/crystal-review/cif-inspect-1920.png'});await b('3D View').click();await page.locator('.crystal-stage .crystal-canvas[data-ready=true]').waitFor({timeout:60000});
  await page.getByLabel('Repeat cells',{exact:true}).fill('4');const layouts=[];
  for(const [width,height] of [[1920,1080],[1440,900],[1024,768],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(400);const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));assert.equal(layout.scrollWidth,width);if(width>=1440)assert.equal(layout.scrollHeight,height);const clipped=await page.locator('.crystal-controls').evaluate(el=>el.scrollHeight>el.clientHeight+1);assert.equal(clipped,false,'controls must not clip at '+width);layouts.push(layout);await page.screenshot({path:'docs/crystal-review/layout-'+width+'.png',fullPage:width<1440});}
  assert.deepEqual(errors,[]);await writeFile('docs/crystal-review/verification.json',JSON.stringify({passed:true,layouts,errors,warnings},null,2));console.log('PASS: library, modes, cell/polyhedra/labels, vacancies, clipping, Miller inputs, XRD hover, export and responsive layouts');
 }
 console.log({errors,warnings});
}finally{await browser.close();}
