import { createRequire } from "node:module";
import { mkdir, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";
const require = createRequire(process.env.ORGANIC_QA_MODULE_ROOT ? process.env.ORGANIC_QA_MODULE_ROOT + "/package.json" : import.meta.url);
const { chromium } = require("playwright");
const browser = await chromium.launch({headless:true,executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe",args:["--enable-webgl","--use-angle=swiftshader"]});
const page=await browser.newPage({viewport:{width:1672,height:941},deviceScaleFactor:1});
const errors=[];page.on("pageerror",e=>errors.push(e.message));page.on("console",m=>{if(m.type()==="error")errors.push(m.text());});
const dir="docs/organic-ui-review";await mkdir(dir,{recursive:true});
const measurements=[];
try{
 for(const [width,height] of [[1672,941],[1366,768],[1536,864],[1920,1080],[820,1180],[390,844]]){
  await page.setViewportSize({width,height});await page.goto("http://localhost:2411/#visuals/organic");
  await page.locator(".on-node").first().waitFor();await page.waitForTimeout(700);
  const metrics=await page.evaluate(()=>{
   const rect=s=>{const r=document.querySelector(s)?.getBoundingClientRect();return r?{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom,right:r.right}:null;};
   return {width:innerWidth,height:innerHeight,scrollWidth:document.documentElement.scrollWidth,scrollHeight:document.documentElement.scrollHeight,canvas:rect(".on-canvas"),stage:rect(".on-network"),stepper:rect(".on-stepper"),nodes:[...document.querySelectorAll(".on-node")].map(e=>{const r=e.getBoundingClientRect();return {name:e.getAttribute("aria-label"),x:r.x,y:r.y,right:r.right,bottom:r.bottom};}),pathLengths:[...document.querySelectorAll(".on-edges g>path")].map(e=>e.getTotalLength())};
  });
  assert.equal(metrics.scrollWidth,width,"horizontal overflow at "+width);assert.equal(metrics.scrollHeight,height,"vertical overflow at "+width);
  assert(metrics.pathLengths.every(l=>l>0),"missing SVG paths");
  assert(metrics.nodes.every(n=>n.y>=metrics.stage.y-1&&n.bottom<=metrics.stage.bottom+1),"node cropped at "+width);
  assert(metrics.nodes.every(n=>n.x>=metrics.stage.x-1&&n.right<=metrics.stage.right+1),"node clipped horizontally at "+width);
  await page.screenshot({path:dir+"/organic-"+width+".png"});
  measurements.push(metrics);
 }
 await page.getByRole("button",{name:"Filters",exact:true}).click();
 assert.equal(await page.locator(".on-filters:visible").count(),1);
 assert.equal(await page.locator(".on-inspector").count(),0);
 await page.getByRole("button",{name:"Collapse filters",exact:true}).click();
 await page.getByRole("button",{name:"Reaction details",exact:true}).click();
 assert.equal(await page.locator(".on-inspector:visible").count(),1);
 assert.equal(await page.locator(".on-filters").count(),0);
 await page.screenshot({path:dir+"/organic-mobile-details.png"});
 await page.getByRole("button",{name:"Close inspector",exact:true}).click();
 await page.setViewportSize({width:1672,height:941});await page.reload();await page.locator(".on-node").first().waitFor();
 for(const [name,title] of [["Ethene","Dehydration to Ethene"],["Ethanoic acid","Further Oxidation to Ethanoic Acid"],["Ethyl ethanoate","Esterification to Ethyl Ethanoate"],["Ethanal","Oxidation to Ethanal"]]){
  await page.getByRole("button",{name:"Select "+name+" pathway",exact:true}).click();
  assert.equal(await page.locator(".on-inspector-heading h2").innerText(),title);
 }
 await page.getByRole("button",{name:"Oxidation",exact:true}).click();assert.equal(await page.locator(".on-node").count(),2);
 await page.getByRole("button",{name:"Clear filters",exact:true}).click();
 await page.getByRole("textbox",{name:"Search molecules, reactions, reagents",exact:true}).fill("oxidation of ethanol");assert.equal(await page.locator(".on-node").count(),2);
 await page.getByRole("textbox",{name:"Search molecules, reactions, reagents",exact:true}).fill("C4H8O2");assert.equal(await page.locator(".on-node").count(),1);
 await page.getByRole("button",{name:"Clear filters",exact:true}).click();
 await page.getByRole("radio",{name:"Alkenes",exact:true}).check();assert.equal(await page.locator(".on-node").count(),3);
 await page.getByRole("radio",{name:"Alcohols",exact:true}).check();
 await page.getByRole("button",{name:"Clear filters",exact:true}).click();
 await page.getByRole("button",{name:"2D",exact:true}).click();assert.equal(await page.locator(".on-molecule canvas").count(),0);
 await page.getByRole("button",{name:"3D",exact:true}).click();await page.locator(".on-molecule canvas").waitFor();
 await page.getByRole("button",{name:"Labels",exact:true}).click();await page.waitForTimeout(100);assert.equal(await page.locator(".organic-atom-label:visible").count(),9);
 await page.getByRole("button",{name:"Fit molecule and network",exact:true}).click();
 await page.getByRole("button",{name:"Zoom in network",exact:true}).click();
 assert.match(await page.locator(".on-network-transform").getAttribute("style"),/scale\(1\.1\)/);
 await page.getByRole("button",{name:"Fit molecule and network",exact:true}).click();
 const model=page.locator(".on-molecule canvas"), before=await model.screenshot();
 const box=await model.boundingBox();
 await page.mouse.move(box.x+box.width*.5,box.y+box.height*.5);await page.mouse.down();
 await page.mouse.move(box.x+box.width*.75,box.y+box.height*.62,{steps:12});await page.mouse.up();await page.waitForTimeout(400);
 assert.notDeepEqual(await model.screenshot(),before,"drag must rotate molecule");
 const rotated=await model.screenshot();await page.mouse.wheel(0,-150);await page.waitForTimeout(300);
 assert.notDeepEqual(await model.screenshot(),rotated,"wheel must zoom molecule");
 await page.getByRole("button",{name:"Fit molecule and network",exact:true}).click();
 let atomSelected=false;
 for(const x of [.35,.45,.55,.65,.75]){
  for(const y of [.35,.45,.55,.65]){
   await page.mouse.move(box.x+box.width*x,box.y+box.height*y);
   if(await page.locator(".on-hover-atom").count()){await page.mouse.click(box.x+box.width*x,box.y+box.height*y);atomSelected=true;break;}
  }
  if(atomSelected)break;
 }
 assert(atomSelected,"atom hover and click must be usable");assert.equal(await page.locator(".on-atom-info").count(),1);
 await page.locator(".on-atom-info").click();
 await page.getByRole("button",{name:"Collapse filters",exact:true}).click();assert.equal(await page.locator(".on-filters").count(),0);await page.getByRole("button",{name:"Open filters",exact:true}).click();
 await page.getByRole("button",{name:"Close inspector",exact:true}).click();assert.equal(await page.locator(".on-inspector").count(),0);await page.getByRole("button",{name:"Open inspector",exact:true}).click();
 for(const tab of ["Mechanism","Energy","Safety","Overview"]){await page.getByRole("tab",{name:tab,exact:true}).click();assert.equal(await page.getByRole("tabpanel",{name:tab,exact:true}).count(),1);}
 await page.getByRole("button",{name:"Play pathway",exact:true}).click();await page.waitForTimeout(2700);assert.match(await page.locator(".on-step[aria-current]").innerText(),/Conditions/);
 await page.getByRole("button",{name:"Pause pathway",exact:true}).click();const frozen=await page.locator(".on-step[aria-current]").innerText();await page.waitForTimeout(2600);assert.equal(await page.locator(".on-step[aria-current]").innerText(),frozen);
 await page.getByRole("button",{name:"Reset pathway",exact:true}).click();
 await page.getByRole("button",{name:"Labels",exact:true}).click();
 await page.screenshot({path:dir+"/organic-desktop.png"});
 for(const [button,destination] of [["Home","#dashboard"],["Learn","#syllabus"],["Resources","#library"],["My Lab","#favorites"]]){
  await page.getByRole("button",{name:button,exact:true}).click();await page.waitForTimeout(350);
  assert.equal(new URL(page.url()).hash,destination);
  await page.goto("http://localhost:2411/#visuals/organic");await page.locator(".on-node").first().waitFor();
 }
 assert.deepEqual(errors,[]);
 await writeFile(dir+"/verification.json",JSON.stringify({passed:true,measurements,errors},null,2));
 console.log(JSON.stringify({passed:true,sizes:measurements.length,errors}));
}finally{await writeFile(dir+"/layout-measurements.json",JSON.stringify({measurements,errors},null,2));await browser.close();}
