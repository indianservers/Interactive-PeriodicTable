import assert from 'node:assert/strict';
import { searchGlobal, globalPageEntries } from '../src/data/globalSearch.js';
import { libraryEntries } from '../src/data/homeLibrary.js';
import { labEntries } from '../src/data/experienceDirectory.js';
for(const entry of [...libraryEntries.filter(x=>!x.upcoming),...labEntries]) {
  assert(globalPageEntries.some(x=>x.id===(entry.path||entry.id)),`Missing search route: ${entry.id}`);
}
for(const [query,path] of [
  ['symmetry operations','molecular-symmetry/operations'],['benzoylation','simulations/benzoylation-aniline-phenol'],['enzyme kinetics','biochemistry-labs/enzyme-kinetics'],['quantum chemistry','modules/physical/quantum-chemistry'],['medicinal chemistry','visuals/pharma/medicinal-chemistry'],['nucleotide builder','visuals/bio/nucleic-acids/nucleotide-builder'],['virtual screening','drug-discovery/screening'],['carbonate washing soda','simulations/washing-soda-carbonate'],
]) assert(searchGlobal(query).some(x=>x.id===path),query);
assert(searchGlobal('oxygen').some(x=>x.element?.symbol==='O'));
assert(searchGlobal('water').some(x=>x.type==='Molecule'));
assert(searchGlobal('titration').some(x=>x.type==='Tool'));
assert.equal(searchGlobal('zzzzunmatchable').length,0);
assert(labEntries.some(x=>x.title==='Symmetry Operations Lab'));
console.log(`PASS: ${globalPageEntries.length} searchable destinations cover every active library and lab entry, nested workspaces, elements, molecules and tools.`);
