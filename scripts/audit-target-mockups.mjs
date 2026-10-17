import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const root='C:/Indian Servers/temp/Chemistry web/TargetUI',out='docs/target-mockup-audit';
const primary=JSON.parse(fs.readFileSync(`${root}/metadata.json`,'utf8')).map(x=>({key:`primary-${String(x.index).padStart(3,'0')}`,family:'primary',title:x.pageId,reference:`${root}/${x.filename}`,route:x.index===7?'#/lab/titration':x.route}));
const studios=JSON.parse(fs.readFileSync('docs/studio-routing-qa/visual-scores.json','utf8')).map(x=>({key:`studio-${x.family}-${x.tab.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`,family:x.family,title:x.tab,reference:x.target,route:new URL(x.url).hash}));
const vl=JSON.parse(fs.readFileSync('docs/chemistry-vl-mockup-rebuild/verification.json','utf8'));
const labs=vl.simulators.flatMap(l=>l.screens.map(s=>({key:`lab-${l.slug}-${s.id}`,family:'virtual-labs',title:`${l.title} / ${s.id}`,reference:path.join(vl.referenceRoot,l.referenceFolder,s.file),route:s.route.includes('undefined')?s.route.replace('undefined','#/simulations/'+l.slug):s.route})));
const inventory=[...primary,...studios,...labs];fs.mkdirSync(out,{recursive:true});fs.writeFileSync(`${out}/inventory.json`,JSON.stringify(inventory,null,2));
const selection=process.argv[2],phase=process.argv[3] || 'before';
const selected=inventory.filter(x=>selection==='uncaptured'?!fs.existsSync(`${out}/${phase}/${x.key}.png`):!selection||selection==='all'||x.family===selection||x.key.includes(selection));
const require=createRequire('C:/Users/saisa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');const{chromium}=require('playwright');
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[];let next=0;
fs.mkdirSync(`${out}/${phase}`,{recursive:true});
try{async function worker(){let page=await browser.newPage({viewport:{width:1672,height:941}}),count=0;while(next<selected.length){const entry=selected[next++];try{
 const url=new URL(entry.route,'http://127.0.0.1:5189/').href;
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!document.querySelector('.dx-loading')&&[...document.querySelectorAll('h1,h2')].some(n=>!/^Loading/i.test(n.textContent.trim())),{},{timeout:60000});
 await page.waitForTimeout(1200);
 if(await page.locator('.molstar-viewer[data-ready=false]').count())await page.waitForFunction(()=>!document.querySelector('.molstar-viewer[data-ready=false]'),{},{timeout:45000}).catch(()=>{});
 if(await page.locator('.molstar-viewer').count())await page.waitForTimeout(2200);
 await page.addStyleTag({content:'.global-search-trigger,.dx-experience-toolbar,[role=status]{visibility:hidden!important}'});
 const image=`${out}/${phase}/${entry.key}.png`;await page.screenshot({path:image});
 results.push({...entry,image,loadingViewers:await page.locator('.molstar-viewer[data-ready=false]').count(),error:await page.locator('.dx-load-error').count()>0,headings:await page.locator('h1,h2').allTextContents()});
 }catch(error){results.push({...entry,error:error.message});}if(++count%12===0){await page.close();page=await browser.newPage({viewport:{width:1672,height:941}});}if(results.length%15===0){console.log(`${phase}: ${results.length}/${selected.length}`);fs.writeFileSync(`${out}/${phase}/captures-${selection||'all'}.json`,JSON.stringify(results,null,2));}}
 await page.close();}await Promise.all([worker(),worker()]);}finally{await browser.close();fs.writeFileSync(`${out}/${phase}/captures-${selection||'all'}.json`,JSON.stringify(results,null,2));}
console.log(`${phase}: saved ${results.length} comparisons`);
