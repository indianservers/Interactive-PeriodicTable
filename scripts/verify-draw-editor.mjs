import assert from 'node:assert/strict';
import initRDKit from '@rdkit/rdkit';
import { canonicalSmiles } from '../src/utils/drawResearch.js';
import { emptyStructure, parseMolfile, structureMolfile } from '../src/utils/structureDrawing.js';
import { connectedAtoms, atomsInRegion, transformFragment, snapBondPoint, structureIssues } from '../src/utils/drawEditorTools.js';
import { analyzeReactionMolecule, reactionBalance, reactionYields, mappingIssues, validateReaction } from '../src/utils/drawReaction.js';
import { validateDrawWorkspace } from '../src/utils/drawWorkspace.js';
const rd = await initRDKit();
function drawing(smiles) {const mol=rd.get_mol(smiles); assert.ok(mol);mol.set_new_coords();const result=parseMolfile(mol.get_molblock());mol.delete();return result;}
function canonical(model) {const mol=rd.get_mol(structureMolfile(model));assert.ok(mol);const value=mol.get_smiles();mol.delete();return value;}
const chiral=drawing('C[C@H](O)C(=O)O'), ids=chiral.atoms.map(a=>a.id);
for(const operation of ['rotate','flip-horizontal','flip-vertical']) assert.equal(canonical(transformFragment(chiral,ids,operation)),canonical(chiral), `${operation} preserves absolute configuration`);
const copied=transformFragment(chiral,ids,'duplicate');
assert.equal(new Set(copied.atoms.map(a=>a.id)).size,ids.length*2);
assert.equal(copied.bonds.length,chiral.bonds.length*2);
assert.equal(canonical(copied).split('.').length,2);
assert.equal(canonical(transformFragment(copied,ids,'delete')),canonical(chiral));
assert.deepEqual(connectedAtoms(copied,1),connectedAtoms(chiral,1));
assert.throws(()=>transformFragment(chiral,[1],'rotate'),/whole connected/);
const square={atoms:[{id:1,x:10,y:10},{id:2,x:50,y:50},{id:3,x:100,y:100}],bonds:[]};
assert.deepEqual(atomsInRegion(square,[{x:0,y:0},{x:60,y:60}],true),[1,2]);
assert.deepEqual(atomsInRegion(square,[{x:0,y:0},{x:60,y:0},{x:60,y:60},{x:0,y:60}]),[1,2]);
const snapped=snapBondPoint({x:0,y:0},{x:80,y:38});assert.ok(Math.abs(Math.atan2(snapped.y,snapped.x)-Math.PI/6)<1e-8);
const bad=drawing('CC');bad.bonds[0].order=3;bad.bonds.push({a:1,b:2,order:2});
assert.equal(structureIssues(bad).filter(i=>i.severity==='error').length,2);
assert.ok(structureIssues(drawing('CC(O)C(=O)O'),{CIP_atoms:[[1,'(?)']],CIP_bonds:[]}).some(i=>i.atomIds[0]===2&&i.severity==='warning'));
assert.equal(structureIssues(drawing('[NH4+]')).length,0);
assert.ok(structureIssues(drawing('CC'),null,true).some(i=>!i.atomIds.length));
const docs=[{id:1,title:'Hydrogen',name:'Hydrogen',model:drawing('[H][H]')},{id:2,title:'Oxygen',name:'Oxygen',model:drawing('O=O')},{id:3,title:'Water',name:'Water',model:drawing('O')}];
const analyses=Object.fromEntries(docs.map(d=>[d.id,analyzeReactionMolecule(rd,d.model)]));
assert.equal(analyses[1].formula,'H2');assert.equal(analyses[2].formula,'O2');assert.equal(analyses[3].formula,'H2O');
const participants=docs.map((d,i)=>({id:i+1,documentId:d.id,role:i===2?'product':'reactant',coefficient:1,amount:i===0?'2':'2',unit:'mol',maps:{}}));
const balanced=reactionBalance(participants,analyses);assert.deepEqual(balanced,{1:2,2:1,3:2});
const yields=reactionYields(participants,analyses,balanced);assert.deepEqual(yields.limiting,[1]);assert.equal(yields.rows[1].mol,1);assert.equal(yields.rows[2].mol,2);
assert.ok(Math.abs(yields.rows[2].mass*2-36.03)<.01);
assert.throws(()=>reactionBalance(participants,analyses,false),/conserve/);
assert.deepEqual(reactionBalance(participants.map(p=>({...p,coefficient:balanced[p.id]})),analyses,false),balanced);
assert.throws(()=>reactionYields(participants.map(p=>({...p,amount:''})),analyses,balanced),/nonnegative/);
const mapped=participants.map(p=>({...p,maps:p.id===2?{1:7}:p.id===3?{1:7}:{}}));assert.deepEqual(mappingIssues(mapped,docs),[]);
assert.ok(mappingIssues(mapped.map(p=>p.id===1?{...p,maps:{1:7}}:p.id===2?{...p,maps:{}}:p),docs).some(s=>s.includes('same element')));
assert.ok(mappingIssues(mapped.map(p=>p.id===2?{...p,maps:{1:7,2:7}}:p),docs).some(s=>s.includes('more than once')));
assert.ok(mappingIssues(mapped.map(p=>p.id===3?{...p,maps:{99:7}}:p),docs).some(s=>s.includes('no longer exists')));
const reaction={participants:mapped,conditions:'Ignition',arrow:'forward'};
const workspace=validateDrawWorkspace({version:1,activeDocumentId:1,documents:docs,reaction,settings:{snap:false}});
assert.deepEqual(workspace.reaction,reaction);assert.equal(workspace.settings.snap,false);
assert.throws(()=>validateReaction({...reaction,participants:[{...mapped[0],documentId:99}]},new Set([1,2,3])));
assert.throws(()=>validateReaction({...reaction,participants:[{...mapped[0],maps:{1:'bad'}}]},new Set([1,2,3])));
// Source edits drive fresh formulas and prevent using an obsolete balanced reaction.
const changed={...analyses,3:analyzeReactionMolecule(rd,drawing('OO'))};assert.equal(changed[3].formula,'H2O2');assert.deepEqual(reactionBalance(participants,changed),{1:1,2:1,3:1});
assert.deepEqual(validateReaction(undefined,new Set()),{participants:[],conditions:'',arrow:'forward'});
console.log('PASS: fragment transforms preserve chirality; selection, duplication, deletion, snapping and atom issues; connected reaction formulas, balancing, yields, source edits, map errors and workspace persistence.');

assert.equal(validateReaction({...reaction,balancing:'manual'},new Set([1,2,3])).balancing,'manual');
assert.throws(()=>validateReaction({...reaction,balancing:'unsupported'},new Set([1,2,3])));

assert.equal(canonicalSmiles(rd,structureMolfile(drawing('[H][H]'))),'[H][H]');
assert.equal(canonicalSmiles(rd,structureMolfile(drawing('[2H]O'))),'[2H]O');
