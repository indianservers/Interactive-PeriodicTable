import {readFile,writeFile,mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {parseProtein,distance,displayPosition,mutationEstimate,category} from '../src/pages/proteinStudioData.js';
const pdb=await readFile('public/assets/proteins/1MBN.pdb','utf8'),data=parseProtein(pdb);
assert.equal(data.sequence.length,153);assert.equal(data.residues.map(r=>r.letter).join(''),data.sequence);
assert.deepEqual(data.residues.map(r=>r.resi),Array.from({length:153},(_,i)=>i+1));
assert.equal(data.helices.length,8);assert(data.helices.every(h=>h.start>=1&&h.end<=153&&h.end>h.start));
assert.equal(data.atoms.filter(a=>a.elem==='FE').length,1);assert(data.atoms.filter(a=>a.resn==='HEM').length>40);
assert.equal(data.residues[28].resn,'LEU');assert.equal(data.residues.filter(r=>r.resn==='CYS').length,0);
assert.deepEqual(Object.fromEntries(Object.entries(data.interactions).map(([key,rows])=>[key,rows.length])),{h:24,ionic:6,disulfide:0,hydrophobic:38});
for(const [key,rows] of Object.entries(data.interactions))for(const row of rows){assert.equal(row.d,distance(row.a,row.b));assert(data.atoms.includes(row.a)&&data.atoms.includes(row.b));assert(row.d>=2.4&&row.d<=6);if(key==='h')assert(['NO','ON'].includes(row.a.elem+row.b.elem));if(key==='hydrophobic')assert.equal(category(data.residues[row.a.resi-1].letter)[0],'Hydrophobic');}
for(const atom of data.atoms){assert.deepEqual(displayPosition(atom,200,data),{x:atom.x,y:atom.y,z:atom.z});for(const time of [0,65,135])assert(Object.values(displayPosition(atom,time,data)).every(Number.isFinite));}
assert.equal(mutationEstimate('L','A',29).value,1.8);assert.equal(mutationEstimate('L','L',29).value,0);
assert.throws(()=>parseProtein(''),'empty PDB fails explicitly');
const report={passed:true,sha256:createHash('sha256').update(pdb).digest('hex'),source:'https://files.rcsb.org/download/1MBN.pdb',residues:153,helices:8,atoms:data.atoms.length,hemeAtoms:data.atoms.filter(a=>a.resn==='HEM').length,contacts:Object.fromEntries(Object.entries(data.interactions).map(([key,rows])=>[key,rows.length])),caveat:data.caveat};
await mkdir('docs/protein-studio-review',{recursive:true});await writeFile('docs/protein-studio-review/data-verification.json',JSON.stringify(report,null,2));console.log(report);
