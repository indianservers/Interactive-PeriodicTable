import assert from 'node:assert/strict';
import {crystalStructures,latticeAtoms,derived,planeData,diffraction} from '../src/components/crystal/crystalStructures.js';
for(const s of crystalStructures){
 const atoms=latticeAtoms(s,1);assert(atoms.every(a=>a.position.every(Number.isFinite)));assert.equal(new Set(atoms.map(a=>a.id)).size,atoms.length);
 const weighted=atoms.reduce((sum,a)=>sum+a.f.reduce((w,v)=>w*(v===0||v===1?.5:1),1),0);assert(Math.abs(weighted-s.basis.length)<1e-8,s.id+' boundary ownership');
 assert(derived(s).density>0);assert(planeData(s,[1,1,1]).d>0);assert.equal(planeData(s,[0,0,0]),null);assert(diffraction(s).length>0);
}
const nacl=crystalStructures[0];assert.equal(latticeAtoms(nacl,4).length,729);assert(Math.abs(derived(nacl).perFormula-44.851536)<1e-5);assert(Math.abs(derived(nacl).density-2.16)<.02);
assert(Math.abs(planeData(nacl,[1,1,1]).d-5.64/Math.sqrt(3))<1e-10);
for(const hkl of ['111','200','220','311','222'])assert(diffraction(nacl).some(p=>p.hkl.join('')===hkl));
assert(Math.abs(diffraction(nacl).find(p=>p.hkl.join('')==='200').angle-31.70)<.05);
assert(Math.abs(planeData(crystalStructures[5],[0,0,2]).d-3.354)<1e-10);
console.log('PASS: six cells, weighted basis counts, unique periodic sites, density, cubic/hexagonal d spacings, NaCl Bragg peaks');
console.log(diffraction(nacl).map(p=>({hkl:p.hkl.join(''),angle:p.angle,intensity:p.intensity})));
