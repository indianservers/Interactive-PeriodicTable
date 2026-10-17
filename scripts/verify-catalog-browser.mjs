import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import { globalPageEntries } from '../src/data/globalSearch.js';
import { studioEntries,labEntries } from '../src/data/experienceDirectory.js';
import { syllabusInteractiveIds } from '../src/modules/core-simulations/syllabusInteractiveModel.js';
import { resolveAppRoute } from '../src/utils/studioRouting.js';
const require=createRequire(`${process.env.PLAYWRIGHT_MODULE_ROOT || 'C:/Users/saisa/.cache/codex-runtimes/codex-primary-runtime/dependencies/node'}/package.json`);
const {chromium}=require('playwright');
const app=fs.readFileSync('src/App.jsx','utf8');
const aliases=runInNewContext('('+app.match(/const hashPageMap = (\{[\s\S]*?\n\});/)[1]+')');
Object.assign(aliases,Object.fromEntries(syllabusInteractiveIds.map(id=>[`simulations/${id}`,id])));
const base=process.env.CHEMISTRY_AUDIT_URL || 'http://127.0.0.1:5189/';
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const results=[], errors=[];
const out='docs/mockup-coverage-audit';fs.mkdirSync(out,{recursive:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.goto(`${base}#/lab`,{waitUntil:'domcontentloaded'});
  await page.getByRole('searchbox',{name:'Search labs'}).waitFor();
  for(const [route,entries,label] of [['lab',labEntries,'Search labs'],['modules',studioEntries,'Search studios']]) {
    await page.goto(`${base}#/${route}`,{waitUntil:'domcontentloaded'});
    await page.getByRole('searchbox',{name:label}).waitFor();
    const links=await page.locator('.experience-directory-grid>a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
    for(const entry of entries)assert(links.includes(`#/${entry.path}`),`Missing rendered directory link: ${entry.path}`);
  }
  await page.goto(`${base}#/table`,{waitUntil:'domcontentloaded'});
  await page.getByRole('textbox',{name:'Search app navigation'}).fill('nucleotide builder');
  await page.getByRole('navigation').getByRole('button',{name:'Nucleotide Builder',exact:true}).click();
  await page.waitForURL('**/visuals/bio/nucleic-acids/nucleotide-builder');
  // A molecule hit must open its actual coordinates, including navigation within the same viewer.
  for(const name of ['Water','Aspirin']) {
    await page.getByRole('button',{name:'Search all chemistry',exact:true}).click();
    await page.getByRole('textbox',{name:'Search pages, studios, labs, elements and molecules'}).fill(name);
    await page.getByRole('dialog').getByRole('button').filter({has:page.locator('small',{hasText:/^Molecule$/})}).filter({has:page.locator('strong',{hasText:new RegExp(`^${name}$`)})}).click();
    await page.locator('.ms-stage h1').filter({hasText:new RegExp(`^${name}$`)}).waitFor();
    assert((await page.locator('.ms-canvas canvas').count())>0);
  }
  for(const [path,label] of [['questions','Solved Questions'],['bookmarks','Saved Solutions'],['practice','Simulations']]) {
    await page.goto(`${base}#/chemistry-solver/${path}`,{waitUntil:'domcontentloaded'});
    await page.locator('.cs-side-workspace').getByRole('heading',{name:label,exact:true}).waitFor();
  }
  await page.close();
  let next=0,done=0;
  async function worker() {
    let p=await browser.newPage({viewport:{width:1440,height:1000}}),count=0;
    while(next<globalPageEntries.length) {
      const entry=globalPageEntries[next++],url=new URL(`#/${entry.id}`,base).href;
      const expected=resolveAppRoute(new URL(url),aliases),start=Date.now();
      try {
        await p.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
        await p.waitForFunction(expected=>{
          if(document.querySelector('[data-app-page]')?.getAttribute('data-app-page')!==expected)return false;
          if(document.querySelector('.dx-load-error'))throw Error('Experience failed to load');
          if(document.querySelector('.dx-loading,[aria-busy="true"].loading-progress'))return false;
          return [...document.querySelectorAll('main h1,main h2,main h3')].some(n=>!/^Loading|^Opening/i.test(n.textContent.trim()));
        },expected,{timeout:60000});
        if(entry.id.startsWith('modules/physical/'))assert.equal(await p.getByRole('combobox',{name:'Workspace',exact:true}).inputValue(),entry.id.split('/').at(-1));
        const subject=new URLSearchParams(entry.id.split('?')[1] || '').get('subject');
        if(subject)assert.equal(await p.getByRole('combobox',{name:'labs subject'}).inputValue(),subject);
        results.push({route:entry.id,page:expected,title:entry.label,headings:await p.locator('h1,h2').allTextContents(),ms:Date.now()-start,passed:true});
      }catch(error){errors.push({route:entry.id,error:error.message});console.log('FAIL '+entry.id+': '+error.message.slice(0,120));}
      done++;if(done%20===0)console.log(`${done}/${globalPageEntries.length} routes checked`);
      if(++count%15===0){await p.close();p=await browser.newPage({viewport:{width:1440,height:1000}});}
    }
    await p.close();
  }
  await Promise.all([worker(),worker()]);
  fs.writeFileSync(`${out}/catalog-browser-audit.json`,JSON.stringify({base,studios:studioEntries.length,labs:labEntries.length,results,errors},null,2));
  assert.equal(errors.length,0,JSON.stringify(errors));
  console.log(`PASS: all ${results.length} destinations render; both browse lists contain every registered link; sidebar navigation and exact molecule selection work.`);
}finally{await browser.close();}
