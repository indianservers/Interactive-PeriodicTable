import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';
import {studioEntries, labEntries, directoryHref} from '../src/data/experienceDirectory.js';
import {libraryEntries} from '../src/data/homeLibrary.js';
import {syllabusInteractiveIds} from '../src/modules/core-simulations/syllabusInteractiveModel.js';
import {BIOCHEMISTRY_VIRTUAL_LABS} from '../src/data/biochemistryVirtualLabs.js';
import {resolveAppRoute} from '../src/utils/studioRouting.js';
const app=await readFile(new URL('../src/App.jsx',import.meta.url),'utf8');
const aliases=runInNewContext('('+app.match(/const hashPageMap = (\{[\s\S]*?\n\});/)[1]+')');
Object.assign(aliases,Object.fromEntries(syllabusInteractiveIds.map(id=>[`simulations/${id}`,id])));
const cases=new Set([...app.matchAll(/case "([^"]+)":/g)].map(match=>match[1]));
const bio=new Set(BIOCHEMISTRY_VIRTUAL_LABS.map(lab=>`biochemistry-labs/${lab.id}`));
for(const entries of [studioEntries,labEntries]) {
 assert.equal(new Set(entries.map(entry=>entry.id)).size,entries.length);
 for(const entry of entries) {
  assert(entry.title && entry.description && entry.path,entry.id+' has complete directory content');
  assert(!entry.upcoming,entry.id+' is implemented');
  const page=resolveAppRoute(new URL('http://localhost/'+directoryHref(entry)),aliases);
  assert(cases.has(page)||syllabusInteractiveIds.includes(page)||bio.has(page),`${entry.id}: ${entry.path} resolves to unimplemented ${page}`);
 }
 assert(entries.some(entry=>entry.id==='pharma-visuals'&&entry.title==='Pharmaceutical Chemistry Lab'));
}
for(const entry of libraryEntries.filter(entry=>!entry.upcoming)) {
 assert([...studioEntries,...labEntries].some(item=>item.id===entry.id)||['virtual-labs','lab','physical-chemistry-vl','organic-chemistry-vl','inorganic-chemistry-vl','advanced-analytical-chemistry-vl'].includes(entry.id),'Missing available experience: '+entry.id);
}
assert.match(app,/case "virtual-labs":\s*case "lab":\s*return <VirtualLabsHomePage/);
assert.equal(aliases['lab/titration'],'titration-lab');
assert.match(app,/case "subject-modules":\s*return <ModulesHubTargetPage onNavigate=\{navigate\}/);
for(const file of ['DashboardPage','ChemistryLanding']) assert((await readFile(new URL(`../src/pages/${file}.jsx`,import.meta.url),'utf8')).includes('<ExperienceDirectory'));
console.log(`PASS: ${studioEntries.length} studios and ${labEntries.length} labs; every directory link resolves to an implemented route, every active catalog entry is covered, and pharma appears in both directories.`);
