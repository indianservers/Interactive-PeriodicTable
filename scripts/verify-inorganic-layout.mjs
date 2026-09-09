import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const {chromium}=createRequire(process.env.ORGANIC_QA_MODULE_ROOT+'/package.json')('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--enable-webgl','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1366,height:768}});
 await page.goto('http://localhost:2411/#visuals/inorganic');await page.locator('.cobalt-vessel .cobalt-scene[data-ready=true]').first().waitFor({timeout:60000});
 await page.getByRole('button',{name:'Pause motion',exact:true}).click();await page.waitForTimeout(800);
 const control=await page.locator('.cobalt-controls').boundingBox(),lower=await page.locator('.cobalt-lower').boundingBox();assert(control.y+control.height<=lower.y,'Controls must not overlap scientific panels');
 await page.screenshot({path:'docs/inorganic-review/layout-1366.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('.cobalt-live').scrollIntoViewIfNeeded();await page.waitForTimeout(1200);await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 assert((await page.locator('.cobalt-header').boundingBox()).height<130);
 await page.screenshot({path:'docs/inorganic-review/layout-390.png',fullPage:true});
 console.log('PASS: no control/panel overlap at 1366, compact mobile header, no horizontal overflow');
}finally{await browser.close();}
