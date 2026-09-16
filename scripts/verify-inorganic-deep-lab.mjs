import {createRequire} from 'node:module';
import {mkdir,copyFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';

const root=process.env.PLAYWRIGHT_MODULE_ROOT;
if(!root) throw Error('Set PLAYWRIGHT_MODULE_ROOT.');
const {chromium}=createRequire(root+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
  const page=await browser.newPage({viewport:{width:1920,height:1080}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('console',message=>{if(message.type()==='error')errors.push(message.text())});
  await mkdir('docs/inorganic-deep-lab-review',{recursive:true});
  try{await copyFile('docs/target-ui-verification/captures/065-inorganic.png','docs/inorganic-deep-lab-review/before-1920.png');}catch{}
  await page.goto('http://127.0.0.1:5175/#modules/inorganic');
  await page.waitForTimeout(800);
  const chloride=page.locator('#cobalt-chloride');
  const initial=Number(await chloride.inputValue());
  await page.getByRole('button',{name:'Add HCl (Cl⁻)',exact:true}).click();
  assert(Number(await chloride.inputValue())>initial);
  await page.getByRole('tab',{name:'Theory',exact:true}).click();
  await page.getByText('Ligand exchange changes geometry and colour.').waitFor();
  await page.getByRole('tab',{name:'Investigation',exact:true}).click();
  await page.getByRole('button',{name:'Mol* complexes',exact:true}).click();
  await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});
  assert.match(await page.locator('.molstar-viewer').getAttribute('data-engine'),/Mol\*/);
  const canvas=page.locator('.molstar-viewer-host canvas').first();
  const aqua=await canvas.screenshot();
  await page.getByRole('button',{name:'Tetrahedral chloride',exact:true}).click();
  await page.locator('.molstar-viewer[data-ready=true]').waitFor({timeout:60000});
  await page.waitForTimeout(500);
  assert(!aqua.equals(await canvas.screenshot()));
  await page.getByRole('button',{name:'Space filling',exact:true}).click();
  await page.waitForTimeout(400);
  await page.screenshot({path:'docs/inorganic-deep-lab-review/after-molstar-1920.png',fullPage:true});
  await page.getByRole('button',{name:'Teaching pathway',exact:true}).click();
  await page.getByRole('button',{name:'Play substitution',exact:true}).click();
  await page.waitForTimeout(250);
  assert.equal(await page.locator('input[aria-label="Substitution progress"]').count(),1);
  const layouts=[];
  for(const [width,height] of [[1920,1080],[1024,768],[390,844]]){
    await page.setViewportSize({width,height});
    await page.waitForTimeout(250);
    const result=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:innerHeight,scrollHeight:document.documentElement.scrollHeight}));
    assert.equal(result.scrollWidth,width);
    layouts.push(result);
    await page.screenshot({path:`docs/inorganic-deep-lab-review/layout-${width}.png`,fullPage:width<1200});
  }
  assert.deepEqual(errors,[]);
  await writeFile('docs/inorganic-deep-lab-review/verification.json',JSON.stringify({passed:true,layouts,errors},null,2));
  console.log('ALL INORGANIC DEEP LAB CHECKS PASSED');
}finally{await browser.close();}
