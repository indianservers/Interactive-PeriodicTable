import {createRequire} from "node:module";
import assert from "node:assert/strict";
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT ? process.env.ORGANIC_QA_MODULE_ROOT+"/package.json" : import.meta.url)("playwright");
const browser=await chromium.launch({headless:true,ignoreDefaultArgs:["--hide-scrollbars"],executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"});
try {
const page=await browser.newPage({viewport:{width:1536,height:675}});
await page.goto("http://localhost:2411/#visuals/organic");await page.locator(".on-canvas").waitFor();
for(const size of [[1536,675],[390,667]]){
 await page.setViewportSize({width:size[0],height:size[1]});
 for(const selector of [".on-filter-body",".on-inspector-scroll",".on-canvas"]){
  if(size[0]<600){if(selector===".on-filter-body")await page.getByRole("button",{name:"Filters",exact:true}).click();if(selector===".on-inspector-scroll")await page.getByRole("button",{name:"Reaction details",exact:true}).click();}
  const element=page.locator(selector);
  await element.evaluate(e=>{e.scrollTop=0;});
  const before=await element.evaluate(e=>({top:e.scrollTop,height:e.clientHeight,scroll:e.scrollHeight,overflow:getComputedStyle(e).overflowY}));
  const rect=await element.boundingBox();await page.mouse.move(rect.x+rect.width*.8,rect.y+rect.height*.6);await page.mouse.wheel(0,600);await page.waitForTimeout(300);
  const after=await element.evaluate(e=>e.scrollTop);
  assert(before.scroll>before.height,"test must exercise overflowing content");
  assert(after>0,"wheel must scroll "+selector);
  await element.evaluate(e=>{e.scrollTop=0;});
  await element.focus();await page.keyboard.press("PageDown");await page.waitForTimeout(300);
  assert(await element.evaluate(e=>e.scrollTop)>0,"keyboard must scroll "+selector);
  await element.evaluate(e=>{e.scrollTop=0;});
  const thumbHeight=before.height*before.height/before.scroll;
  await page.waitForTimeout(400);
  await page.mouse.move(rect.x+rect.width-6,rect.y+thumbHeight/2);
  await page.mouse.down();await page.mouse.move(rect.x+rect.width-6,rect.y+before.height-10,{steps:10});await page.mouse.up();await page.waitForTimeout(200);
  const dragged=await element.evaluate(e=>e.scrollTop);
  assert(dragged>0,"scrollbar drag must scroll "+selector);
  console.log({size,selector,wheel:after,scrollbarDrag:dragged,keyboard:"passed"});
  if(size[0]<600){if(selector===".on-filter-body")await page.getByRole("button",{name:"Collapse filters",exact:true}).click();if(selector===".on-inspector-scroll")await page.getByRole("button",{name:"Close inspector",exact:true}).click();}
 }
}
} finally {
 await browser.close();
}
