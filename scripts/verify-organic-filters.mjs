import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {topics,networks,pathways,reactionTypes} from '../src/pages/organicNetworkData.js';
import {molecules,expandMolecule} from '../src/pages/organicMolecules.js';
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT?process.env.ORGANIC_QA_MODULE_ROOT+'/package.json':import.meta.url)('playwright');
const browser=await chromium.launch({headless:true,ignoreDefaultArgs:['--hide-scrollbars'],executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
const dir='docs/organic-ui-review/filters';await mkdir(dir,{recursive:true});
const page=await browser.newPage({viewport:{width:1672,height:941}}),errors=[],checks=[];
page.on('pageerror',e=>errors.push(e.message));
const button=name=>page.getByRole('button',{name,exact:true});
const search=()=>page.getByRole('textbox',{name:'Search molecules, reactions, reagents',exact:true});
async function verifyVisible(expected){
 assert.deepEqual(await page.locator('.on-node').evaluateAll(nodes=>nodes.map(n=>n.dataset.pathway)),expected.map(p=>p.id));
 assert.equal(await page.locator('.on-edges>g').count(),expected.length);
 if(expected.length){
  const selected=await page.locator('.on-node[aria-pressed=true]').getAttribute('data-pathway');
  const p=expected.find(p=>p.id===selected);assert(p,'selection must belong to filtered results');
  assert.equal(await page.locator('.on-inspector-heading h2').innerText(),p.title);
  assert.equal(await page.locator('.on-equation').innerText(),p.equation);
 }else{
  assert.equal(await page.locator('.on-equation').count(),0,'no stale equation');
  assert.equal(await page.locator('.on-stepper').count(),0,'no stale animation controls');
  assert.equal(await page.locator('.on-no-selection').count(),1);
 }
}
try{
 await page.goto('http://localhost:2411/#visuals/organic');await page.locator('.on-node').first().waitFor();
 if(!process.env.ORGANIC_QA_LAYOUT_ONLY){
 for(const topic of topics){
  await page.getByRole('radio',{name:topic,exact:true}).check();
  const expected=pathways.filter(p=>p.topic===topic),source=networks[topic].source;
  await verifyVisible(expected);
  assert.equal(await page.locator('.on-canvas-heading h2').innerText(),networks[topic].title);
  assert.equal(await page.locator('.on-source-card>span').innerText(),molecules[source].name);
  await page.locator(`.on-molecule canvas[data-molecule="${source}"]`).waitFor();
  assert.equal(Number(await page.locator('.on-molecule canvas').getAttribute('data-atom-count')),expandMolecule(molecules[source]).atoms.length);
  assert.deepEqual(JSON.parse(await page.locator('.on-molecule canvas').getAttribute('data-bond-orders')),expandMolecule(molecules[source]).bonds.map(b=>b[2]));
  await button('2D').click();assert.equal(await page.locator('.on-molecule svg').getAttribute('data-molecule'),source);
  await button('3D').click();await page.locator('.on-molecule canvas').waitFor();
  for(const p of expected){
   await page.locator(`[data-pathway="${p.id}"]`).click();
   assert.equal(await page.locator('.on-inspector-heading h2').innerText(),p.title);
   assert.equal(await page.locator(`[data-pathway="${p.id}"] svg`).getAttribute('data-molecule'),p.product);
   await page.getByRole('tab',{name:'Mechanism',exact:true}).click();
   assert.deepEqual(await page.locator('.on-mechanism-structures svg[data-molecule]').evaluateAll(es=>es.map(e=>e.dataset.molecule)),[source,p.product]);
   await button('Next').click();assert((await page.locator('.on-mechanism').innerText()).includes(p.note));
   await page.getByRole('tab',{name:'Safety',exact:true}).click();assert((await page.getByRole('tabpanel').innerText()).includes('Educational simulation only'));
   await page.getByRole('tab',{name:'Overview',exact:true}).click();
  }
  for(const type of reactionTypes){
   const matches=expected.filter(p=>p.types.includes(type));
   assert.equal(await button(type).isDisabled(),!matches.length,topic+' '+type+' availability');
   assert.equal(Number(await button(type).locator('small').innerText()),matches.length,topic+' '+type+' count');
   if(matches.length){await button(type).click();await verifyVisible(matches);await button(type).click();await verifyVisible(expected);}
  }
  await search().fill('not-a-real-molecule');await verifyVisible([]);
  await page.locator('.on-clear').click();await verifyVisible(expected);
  await page.locator('.on-filter-body').evaluate(e=>e.scrollTop=0);
  await page.locator('.on-inspector-scroll').evaluate(e=>e.scrollTop=0);
  await page.waitForTimeout(150);
  await page.screenshot({path:dir+'/'+source+'.png'});
  checks.push({topic,source,pathways:expected.map(p=>p.id),passed:true});
 }
 // Search intersects with type, types are OR alternatives, and changing topic clears stale filters.
 await page.getByRole('radio',{name:'Alcohols',exact:true}).check();
 await search().fill('potassium dichromate');await verifyVisible(pathways.filter(p=>['oxidation','acid'].includes(p.id)));
 await search().fill('acetaldehyde');await verifyVisible(pathways.filter(p=>p.id==='oxidation'));
 await search().fill('');
 await button('Oxidation').click();await button('Elimination').click();
 await verifyVisible(pathways.filter(p=>['oxidation','acid','elimination'].includes(p.id)));
 await search().fill('ethanal');await verifyVisible(pathways.filter(p=>p.id==='oxidation'));
 await search().fill('ethyl ethanoate');await verifyVisible([]);
 await page.getByRole('radio',{name:'Esters',exact:true}).check();await verifyVisible(pathways.filter(p=>p.topic==='Esters'));
 assert.equal(await search().inputValue(),'');
 assert.equal(await page.locator('.on-type-chips [aria-pressed=true]').count(),0);
 // Topic finder filters choices, never silently changes the currently displayed topic.
 await page.getByRole('textbox',{name:'Search topics',exact:true}).fill('amine');
 assert.equal(await page.getByRole('radio').count(),1);
 assert.equal(await page.locator('.on-canvas-heading h2').innerText(),networks.Esters.title);
 await page.getByRole('radio',{name:'Amines',exact:true}).check();await verifyVisible(pathways.filter(p=>p.topic==='Amines'));
 await page.locator('.on-clear').click();assert.equal(await page.getByRole('radio').count(),9);
 // Mobile: select a topic, close filters, open reaction inspector, verify the same state.
 await page.setViewportSize({width:390,height:667});
 await button('Filters').click();await page.getByRole('radio',{name:'Aromatic compounds',exact:true}).check();
 await button('Collapse filters').click();
 assert.equal(await page.locator('.on-source-card>span').innerText(),'Benzene');
 await page.screenshot({path:dir+'/mobile-benzene.png'});
 await button('Reaction details').click();await verifyVisible(pathways.filter(p=>p.id==='nitration'));
 await page.screenshot({path:dir+'/mobile-details.png'});
 }
 // Verify the complete network content, including labels, fits its scrollable stage.
 for(const [width,height] of [[1366,768],[390,667]]){
  await page.setViewportSize({width,height});
  await page.goto('http://localhost:2411/#visuals/organic');await page.locator('.on-node').first().waitFor();
  for(const topic of topics){
   if(width<600)await button('Filters').click();
   await page.getByRole('radio',{name:topic,exact:true}).check();
   if(width<600)await button('Collapse filters').click();
   await page.screenshot({path:dir+'/'+networks[topic].source+'-'+width+'.png'});
   const boxes=await page.evaluate(()=>{
    const rect=e=>{const r=e.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,label:e.getAttribute('aria-label')};};
    return {stage:rect(document.querySelector('.on-network')),nodes:[...document.querySelectorAll('.on-node')].map(rect),labels:[...document.querySelectorAll('.on-edge-label')].map(rect)};
   });
   const overlap=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2;
   for(const node of boxes.nodes){assert(node.left>=boxes.stage.left-1&&node.right<=boxes.stage.right+1&&node.top>=boxes.stage.top-1&&node.bottom<=boxes.stage.bottom+1,topic+' cropped node at '+width);}
   for(const label of boxes.labels){assert(!boxes.nodes.some(n=>overlap(n,label)),topic+' label covers a node at '+width+': '+label.label);}
   for(let i=0;i<boxes.labels.length;i++)assert(!boxes.labels.slice(i+1).some(l=>overlap(l,boxes.labels[i])),topic+' overlapping labels at '+width);
   await page.locator('.on-canvas').evaluate(e=>e.scrollTop=0);
   await page.screenshot({path:dir+'/'+networks[topic].source+'-'+width+'.png'});
  }
 }
 assert.deepEqual(errors,[]);
 await writeFile(dir+'/verification.json',JSON.stringify({passed:true,checks,errors},null,2));
 console.log(JSON.stringify({passed:true,topics:checks.length,pathways:pathways.length,errors}));
}finally{await browser.close();}
