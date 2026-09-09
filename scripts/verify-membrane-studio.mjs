import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const moduleRoot=process.env.PLAYWRIGHT_MODULE_ROOT;
const {chromium}=createRequire(moduleRoot+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[],warnings=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text());if(message.type()==='warning')warnings.push(message.text());});
  await page.goto('http://127.0.0.1:5175/#visuals/bio/membranes');
  await page.waitForTimeout(1800);
  await mkdir('docs/membrane-studio-review',{recursive:true});
  await page.screenshot({path:`docs/membrane-studio-review/${process.env.MEMBRANE_BEFORE?'before-1920':'after-1920'}.png`});
  if(process.env.MEMBRANE_TEST){
    assert.equal(await page.locator('[data-bio-page="membrane"]').count(),1);
    const button=name=>page.getByRole('button',{name,exact:true}),checkbox=name=>page.getByRole('checkbox',{name,exact:true});
    assert.equal(await button('Teaching schematic').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('svg[aria-label="Procedural membrane and transport scene"]').count(),1);
    await checkbox('Show water molecules').uncheck();assert.equal(await page.locator('[aria-label="Water molecules"]').count(),0);await checkbox('Show water molecules').check();
    await button('Osmosis').click();assert.match(await page.locator('aside').last().innerText(),/Osmosis/);await button('Active Transport').click();
    await button('3').click();assert.match(await page.getByText(/Step 3 of 6/).innerText(),/Step 3/);await button('1').click();
    await button('Snapshot').click();assert.equal(await page.getByText('Snapshot captured',{exact:true}).innerText(),'Snapshot captured');
    await button('Molecular structure').click();await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});assert.equal(await page.locator('.molstar-viewer').getAttribute('data-engine'),'Mol*');assert.match(await page.locator('.molstar-viewer-badge').innerText(),/PDB 4HQJ/);assert.equal(await page.locator('[data-membrane-plane="approximate"]').count(),1);await page.waitForTimeout(350);await page.screenshot({path:'docs/membrane-studio-review/molecular-4HQJ-1920.png'});
    const canvas=page.locator('.molstar-viewer-host canvas').first(),initial=await canvas.screenshot();await button('Atoms').click();await page.waitForTimeout(450);assert(!initial.equals(await canvas.screenshot()),'Atoms representation changes Mol* scene');
    const withPlane=await page.locator('[data-membrane-view="molecular"]').screenshot();await button('Membrane plane').click();assert.equal(await page.locator('[data-membrane-plane="approximate"]').count(),0);assert(!withPlane.equals(await page.locator('[data-membrane-view="molecular"]').screenshot()),'membrane plane overlay toggles');await button('Membrane plane').click();
    const beforeChain=await canvas.screenshot();await button('A · α transporter').click();await page.waitForTimeout(500);assert(!beforeChain.equals(await canvas.screenshot()),'chain focus changes camera');const beforeLigand=await canvas.screenshot();await button('ADP').click();await page.waitForTimeout(500);assert(!beforeLigand.equals(await canvas.screenshot()),'ligand focus changes camera');
    const beforeStep=await canvas.screenshot();await button('3').click();await page.waitForTimeout(500);assert(!beforeStep.equals(await canvas.screenshot()),'pump lesson step synchronizes molecular focus');await button('Reset').click();
    await button('Teaching schematic').click();assert.equal(await page.locator('svg[aria-label="Procedural membrane and transport scene"]').count(),1);
    const layouts=[];for(const [width,height] of [[1920,1080],[1024,768],[390,844]]){await page.setViewportSize({width,height});await page.waitForTimeout(300);const layout=await page.evaluate(()=>({width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight}));assert.equal(layout.scrollWidth,width,'no horizontal overflow at '+width);layouts.push(layout);await page.screenshot({path:`docs/membrane-studio-review/layout-${width}.png`,fullPage:width<1200});}
    assert.deepEqual(errors,[]);
    await writeFile('docs/membrane-studio-review/verification.json',JSON.stringify({passed:true,layouts,errors,warnings},null,2));
    console.log('ALL MEMBRANE STRUCTURE STUDIO CHECKS PASSED');
  }
}finally{await browser.close();}
