import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runInNewContext } from 'node:vm';
import { libraryEntries } from '../src/data/homeLibrary.js';
import { studioEntries,labEntries } from '../src/data/experienceDirectory.js';
import { globalPageEntries,searchGlobal } from '../src/data/globalSearch.js';
import { additionalExperiences } from '../src/data/additionalExperiences.js';
import { syllabusInteractiveIds } from '../src/modules/core-simulations/syllabusInteractiveModel.js';
import { resolveAppRoute,appRouteUrl } from '../src/utils/studioRouting.js';
import { ALL_MOLECULES } from '../src/data/molecules.js';
import { moleculeModel,requestedMolecule } from '../src/utils/moleculeSearch.js';
const app=fs.readFileSync('src/App.jsx','utf8');
const aliases=runInNewContext('('+app.match(/const hashPageMap = (\{[\s\S]*?\n\});/)[1]+')');
Object.assign(aliases,Object.fromEntries(syllabusInteractiveIds.map(id=>[`simulations/${id}`,id])));
const cases=new Set([...app.matchAll(/case "([^"]+)":/g)].map(x=>x[1]));
const active=libraryEntries.filter(x=>!x.upcoming);
for(const id of cases) {
  if(id.endsWith('-legacy')||id==='lab')continue;
  assert(active.some(x=>x.id===id),`Implemented page missing from in-app library: ${id}`);
}
const collectionIds=new Set(['virtual-labs','lab','physical-chemistry-vl','organic-chemistry-vl','inorganic-chemistry-vl','advanced-analytical-chemistry-vl']);
for(const entry of active) {
  if(collectionIds.has(entry.id))continue;
  assert([...studioEntries,...labEntries].some(x=>x.id===entry.id),`Missing browse destination: ${entry.id}`);
  assert(globalPageEntries.some(x=>x.id===entry.path),`Missing global destination: ${entry.id}`);
  assert(searchGlobal(entry.title).some(x=>x.id===entry.path),`Title not searchable: ${entry.title}`);
}
for(const entry of [...studioEntries,...labEntries]) {
  const route=resolveAppRoute(new URL(`http://localhost/#/${entry.path}`),aliases);
  assert(cases.has(route)||syllabusInteractiveIds.includes(route)||route.startsWith('biochemistry-labs/'),`Unimplemented browse link: ${entry.path}`);
}
const nestedSources={
  'modules/physical/':'src/modules/physical-chemistry/PhysicalChemistryStudio.jsx',
  'drug-discovery/':'src/modules/drug-discovery/drugDiscoveryData.js',
  'visuals/bio/nucleic-acids/':'src/modules/nucleic-acid-explorer/NucleicAcidExplorer.jsx',
  'visuals/bio/carbohydrates/':'src/modules/carbohydrate-studio/carbohydrateData.js',
};
for(const entry of additionalExperiences)for(const [prefix,file] of Object.entries(nestedSources))if(entry.path.startsWith(prefix)) {
  const slug=entry.path.slice(prefix.length),source=fs.readFileSync(file,'utf8');
  assert(source.includes(`'${slug}'`)||source.includes(`"${slug}"`)||source.includes(`/carbohydrate-structure-studio/${slug}`),`Nested route would fall back: ${entry.path}`);
  assert(studioEntries.some(x=>x.path===entry.path),`Nested workspace absent from studio list: ${entry.path}`);
}
const subjects=new Set(['Physical','Organic','Inorganic','Analytical','Biochemistry','Pharmaceutical','Molecular symmetry']);
for(const entry of labEntries)assert(subjects.has(entry.subject),`Lab missing from homepage subject collections: ${entry.id}`);
for(const molecule of ALL_MOLECULES) {
  const result=searchGlobal(molecule.name).find(x=>x.type==='Molecule'&&x.label===molecule.name);
  const url=appRouteUrl(new URL('http://localhost/'),result.id);
  assert.equal(resolveAppRoute(url,aliases),'molecule');
  assert.equal(requestedMolecule(url,ALL_MOLECULES),molecule);
  const model=moleculeModel(molecule);
  assert(model.atoms.length>0);
  for(const bond of model.bonds)assert(bond.every(i=>Number.isInteger(i)&&i>=0&&i<model.atoms.length));
}
for(const result of searchGlobal(''))assert.notEqual(result.id,'undefined');
for(const subject of ['Physical','Organic','Inorganic','Analytical']) {
  const entry=active.find(x=>x.path===`lab?subject=${subject}`);
  assert(entry,`Missing subject collection deep link: ${subject}`);
  assert.equal(resolveAppRoute(appRouteUrl(new URL('http://localhost/'),entry.path),aliases),'lab');
}
for(const file of fs.readdirSync('src',{recursive:true}).filter(x=>/\.jsx$/.test(x))) {
  const source=fs.readFileSync(`src/${file}`,'utf8');
  for(const match of source.matchAll(/(?:href=["']#\/([^"']+)["']|onNavigate\??\.?(?:\()\s*["']([^"']+)["'])/g)) {
    const path=match[1] || match[2];if(path.includes('$'))continue;
    const page=resolveAppRoute(new URL(`http://localhost/#/${path}`),aliases);
    assert(cases.has(page)||syllabusInteractiveIds.includes(page)||page.startsWith('biochemistry-labs/'),`Broken in-app navigation in ${file}: ${path}`);
  }
}
console.log(`PASS: ${cases.size-2} active route cases, ${studioEntries.length} studio entries, ${labEntries.length} lab entries, all nested workspace routes, all subject collections, and ${ALL_MOLECULES.length} molecule deep links.`);
