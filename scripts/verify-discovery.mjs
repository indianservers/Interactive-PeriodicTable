import { completedVirtualLabs } from '../src/data/completedVirtualLabs.js';
import { BIOCHEMISTRY_VIRTUAL_LABS } from '../src/data/biochemistryVirtualLabs.js';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { discoveryEntries, learningPaths, findExperience } from '../src/data/discoveryCatalog.js';
import { searchExperiences, suggestQuery } from '../src/utils/searchExperiences.js';

assert.equal(searchExperiences(discoveryEntries,{query:'Periodic Table'})[0].id,'table');
assert(searchExperiences(discoveryEntries,{query:'atoms'}).some(entry=>entry.id==='atom-builder'));
assert.equal(suggestQuery(discoveryEntries,'stochiometry'),'stoichiometry');
assert.equal(suggestQuery(discoveryEntries,'spectroscpy'),'spectroscopy');
assert(searchExperiences(discoveryEntries,{query:'NaCl'}).some(entry=>entry.id==='inorganic-salt-analysis'));
assert(searchExperiences(discoveryEntries,{query:'sodium chloride'}).some(entry=>entry.id==='inorganic-crystals'));
assert(searchExperiences(discoveryEntries,{query:'organic'}).every(entry=>!entry.title.startsWith('Inorganic')));
assert.equal(searchExperiences(discoveryEntries,{query:'nothing-matches-xyz123'}).length,0);
assert.doesNotThrow(()=>searchExperiences(discoveryEntries,{query:'[.*('}));
assert.deepEqual(searchExperiences(discoveryEntries,{saved:true,favorites:['table']}).map(entry=>entry.id),['table']);
assert(searchExperiences(discoveryEntries,{category:'organic',subgroup:'Reactions & synthesis',level:'Intermediate'}).every(entry=>entry.category==='organic'&&entry.subgroup==='Reactions & synthesis'&&entry.level==='Intermediate'));
assert.equal(searchExperiences(discoveryEntries,{availability:'all'}).length,discoveryEntries.length);
assert(searchExperiences(discoveryEntries).every(entry=>!entry.upcoming));
const sorted=searchExperiences(discoveryEntries,{sort:'newest'}).map(entry=>entry.addedAt||'');
assert.deepEqual(sorted,[...sorted].sort().reverse());
for(const path of learningPaths)for(const id of path.steps)assert(findExperience(id)&&!findExperience(id).upcoming,`Missing path step ${id}`);
for(const entry of discoveryEntries){
  assert(entry.objective&&entry.type&&entry.level);
  for(const id of entry.prerequisites)assert(findExperience(id),`Missing prerequisite ${id}`);
  if(!entry.upcoming)assert(/^\d{4}-\d{2}-\d{2}$/.test(entry.addedAt),`Missing catalog date ${entry.id}`);
}
console.log('PASS: search ranking, plurals, typos, chemical aliases, filters, bookmarks, dates and learning-path integrity.');

const manifestPath=new URL('../dist/.vite/manifest.json',import.meta.url);
if(existsSync(manifestPath)){
  const manifest=JSON.parse(readFileSync(manifestPath,'utf8'));
  const visited=new Set();
  const walk=id=>{if(visited.has(id))return;visited.add(id);for(const dependency of manifest[id]?.imports||[])walk(dependency);};
  walk('index.html');
  const files=[...visited].map(id=>manifest[id]?.file).filter(Boolean);
  assert(files.every(file=>!/(ketcher|plotly|molstar|3Dmol|StructureDrawPage)/i.test(file)),`Viewer eagerly loaded: ${files.join(', ')}`);
  const bytes=files.reduce((sum,file)=>sum+statSync(new URL(`../dist/${file}`,import.meta.url)).size,0);
  console.log(`PASS: ${files.length} initial JavaScript bundle(s), ${(bytes/1024).toFixed(0)} KiB; heavy viewers deferred.`);
}

assert(findExperience('virtual-labs'), 'Virtual lab directory must be discoverable');
for (const lab of completedVirtualLabs) assert(findExperience(lab.id), `Missing core lab: ${lab.id}`);
for (const lab of BIOCHEMISTRY_VIRTUAL_LABS) {
  const entry = findExperience(`biochemistry-labs/${lab.id}`);
  assert(entry && !entry.upcoming, `Missing biochemistry lab: ${lab.id}`);
  assert.equal(entry.path, `biochemistry-labs/${lab.id}`);
  assert.equal(entry.type, 'Simulation');
  assert(searchExperiences(discoveryEntries, {query: lab.title}).some(item => item.id === entry.id));
}
assert.equal(new Set(discoveryEntries.map(entry => entry.id)).size, discoveryEntries.length, 'Duplicate catalog identifiers');
console.log(`PASS: ${completedVirtualLabs.length} core labs and ${BIOCHEMISTRY_VIRTUAL_LABS.length} biochemistry labs have searchable catalog links.`);
