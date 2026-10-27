import assert from 'node:assert/strict';
import initRDKit from '@rdkit/rdkit';
import {ORGANIC_CASES,ORGANIC_TESTS,ORGANIC_ROLES,organicAssay,prepareOrganicTube,startOrganicAssay,advanceOrganicTube,organicTubeComplete,recordOrganicTube,controlledOrganicEvidence,organicCandidates,evaluateOrganicIdentification,parseOrganicNotebook,parseOrganicWorkspace,organicNotebookCsv,organicCase,organicTest} from '../src/modules/core-simulations/organicAnalysisModel.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},ok=b=>{assert.ok(b);checks++;},reject=fn=>{assert.throws(fn);checks++;};
// Independently enumerated response patterns: seven tests in the order below.
const tests=['bicarbonate','base','acid','dnph','tollens','ferric','hydrolysis'];
const reference={A:[1,1,0,0,0,0,0],B:[0,1,0,0,0,1,0],C:[0,0,1,0,0,0,0],D:[0,0,0,1,1,0,0],E:[0,0,0,1,0,0,0],F:[0,0,0,0,0,0,1]};
const condition=t=>t==='tollens'?40:t==='hydrolysis'?85:25;
const recordsFor=(id,test)=>ORGANIC_ROLES.map(role=>({caseId:id,role,test,temperature:condition(test),fresh:true}));
for(const id of Object.keys(reference)){
 for(const [j,test] of tests.entries()){
  const r={caseId:id,role:'unknown',test,temperature:condition(test),fresh:true},out=organicAssay(r);ok(out.valid);eq(out.positive,!!reference[id][j]);
  eq(organicAssay({...r,role:'control'}).positive,true);eq(organicAssay({...r,role:'blank'}).positive,false);
  for(const temperature of [20,25,30,35,40,50,80,85,90]){const a=organicAssay({...r,temperature}),s=ORGANIC_TESTS[test];eq(a.valid,temperature>=s.min&&temperature<=s.max);if(!a.valid){eq(a.positive,false);eq(a.effect,'none');}}
  const portion=prepareOrganicTube(id,'unknown'),started=startOrganicAssay(portion,r);eq(portion.assay,null);reject(()=>recordOrganicTube(started));reject(()=>startOrganicAssay(started,r));
  let stepped=started;for(let k=0;k<60;k++)stepped=advanceOrganicTube(stepped,.5);const full=advanceOrganicTube(started,60);eq(stepped,full);ok(organicTubeComplete(full));eq(recordOrganicTube(full),r);eq(advanceOrganicTube(full,3600),full);
  eq(controlledOrganicEvidence([r],id).length,0);eq(organicCandidates([r],id).length,6);
  const complete=recordsFor(id,test);eq(controlledOrganicEvidence(complete,id).length,1);ok(organicCandidates(complete,id).some(c=>c.id===id));
  eq(controlledOrganicEvidence(complete.slice(0,2),id).length,0);eq(controlledOrganicEvidence(complete.filter(c=>c.role!=='control'),id).length,0);
 }
 const all=tests.flatMap(t=>recordsFor(id,t));eq(organicCandidates(all,id).map(c=>c.id),[id]);ok(evaluateOrganicIdentification(id,id,all).complete);
 for(const other of ORGANIC_CASES.filter(c=>c.id!==id))eq(evaluateOrganicIdentification(id,other.id,all).complete,false);
 const required=organicCase(id).required.flatMap(t=>recordsFor(id,t));ok(evaluateOrganicIdentification(id,id,required).complete);eq(evaluateOrganicIdentification(id,id,required.slice(1)).complete,false);
 eq(controlledOrganicEvidence(all.filter(r=>r.role==='unknown').concat(all.filter(r=>r.role!=='unknown').map(r=>({...r,caseId:id==='A'?'B':'A'}))),id).length,0);
}
for(const role of ORGANIC_ROLES){const bad=organicAssay({caseId:'D',role,test:'tollens',temperature:40,fresh:false});eq(bad.valid,false);eq(bad.positive,false);}
const stale=recordsFor('D','tollens').map(r=>r.role==='control'?{...r,fresh:false}:r);eq(controlledOrganicEvidence(stale,'D').length,0);
for(const bad of [{caseId:'Z'},{role:'fake'},{test:'__proto__'},{temperature:NaN},{temperature:91},{fresh:1}])reject(()=>organicAssay(bad));
for(const bad of [-1,3601,NaN])reject(()=>advanceOrganicTube(null,bad));reject(()=>organicCase('__proto__'));reject(()=>organicTest('constructor'));
const notebook={schema:1,lab:'organic-qualitative-analysis',records:recordsFor('D','dnph'),notes:'DNPH alone does not distinguish the two carbonyl references. "Compare" Tollens.\nSecond line.'};eq(parseOrganicNotebook(JSON.stringify(notebook)),notebook);
for(const bad of [{...notebook,schema:2},{...notebook,lab:'salt'},{...notebook,records:[{}]},{...notebook,records:[{...notebook.records[0],fresh:undefined}]},{...notebook,records:Array(2001).fill(notebook.records[0])},{...notebook,notes:'a'.repeat(100001)}])reject(()=>parseOrganicNotebook(bad));
const csv=organicNotebookCsv(notebook.records);ok(csv.includes('"temperature_C"'));ok(csv.includes('"control"'));ok(csv.includes('"Positive')===false);eq(csv.split('\n').length,4);
const loaded=advanceOrganicTube(startOrganicAssay(prepareOrganicTube('D','unknown'),notebook.records[0]),20),workspace={schema:1,caseId:'D',tubes:[loaded,null,null],selected:0,test:'dnph',temperature:25,fresh:true,speed:1,notebook};eq(parseOrganicWorkspace(JSON.stringify(workspace)),workspace);
for(const bad of [{...workspace,selected:3},{...workspace,speed:10},{...workspace,tubes:[]},{...workspace,tubes:[{...loaded,caseId:'A'},null,null]},{...workspace,tubes:[{...loaded,elapsed:21},null,null]},{...workspace,tubes:[{...prepareOrganicTube('D','unknown'),settled:true},null,null]}])reject(()=>parseOrganicWorkspace(bad));
const forged=structuredClone(workspace);forged.tubes[0].assay.positive=false;eq(parseOrganicWorkspace(forged).tubes[0].assay.positive,true); // Recompute, never trust derived input.
// Atom and charge conservation for each assigned reaction (coordination is not
// assigned a fixed species formula). Independent formal formula dictionaries.
const formula={acid:{C:7,H:6,O:2},bicarb:{C:1,H:1,O:3,q:-1},benzoate:{C:7,H:5,O:2,q:-1},co2:{C:1,O:2},water:{H:2,O:1},oh:{H:1,O:1,q:-1},phenol:{C:6,H:6,O:1},phenolate:{C:6,H:5,O:1,q:-1},aniline:{C:6,H:7,N:1},proton:{H:1,q:1},anilinium:{C:6,H:8,N:1,q:1},aldehyde:{C:7,H:6,O:1},ketone:{C:8,H:8,O:1},dnph:{C:6,H:6,N:4,O:4},aldHydrazone:{C:13,H:10,N:4,O:4},ketHydrazone:{C:14,H:12,N:4,O:4},silverComplex:{Ag:1,N:2,H:6,q:1},silver:{Ag:1},ammonia:{N:1,H:3},amide:{C:7,H:7,N:1,O:1}};
const balanced=[[{acid:1,bicarb:1},{benzoate:1,co2:1,water:1}],[{acid:1,oh:1},{benzoate:1,water:1}],[{phenol:1,oh:1},{phenolate:1,water:1}],[{aniline:1,proton:1},{anilinium:1}],[{aldehyde:1,dnph:1},{aldHydrazone:1,water:1}],[{ketone:1,dnph:1},{ketHydrazone:1,water:1}],[{aldehyde:1,silverComplex:2,oh:3},{benzoate:1,silver:2,ammonia:4,water:2}],[{amide:1,oh:1},{benzoate:1,ammonia:1}]];
const total=(side,element)=>Object.entries(side).reduce((n,[s,c])=>n+c*(formula[s][element]||0),0);for(const [left,right] of balanced)for(const atom of ['C','H','N','O','Ag','q'])eq(total(left,atom),total(right,atom));
const rdkit=await initRDKit();const weights={A:122.123,B:94.113,C:93.129,D:106.124,E:120.151,F:121.139};for(const c of ORGANIC_CASES){const mol=rdkit.get_mol(c.smiles);ok(mol?.is_valid());const d=JSON.parse(mol.get_descriptors());ok(Math.abs(d.amw-weights[c.id])<.001);ok(mol.get_svg(300,180).includes('<svg'));
 const graph=JSON.parse(mol.get_json()),counts={},symbols={1:'H',6:'C',7:'N',8:'O'};let charge=0;
 for(const atom of graph.molecules[0].atoms){const a={...graph.defaults.atom,...atom},symbol=symbols[a.z];counts[symbol]=(counts[symbol]||0)+1;if(a.impHs)counts.H=(counts.H||0)+a.impHs;charge+=a.chg;}
 const expectedFormula=Object.fromEntries([...c.formula.matchAll(/([A-Z][a-z]*)(\d*)/g)].map(m=>[m[1],Number(m[2]||1)]));eq(counts,expectedFormula);eq(charge,0);mol.delete();}
console.log(`PASS: ${checks} organic-analysis response, control/blank/case-isolation, timing, evidence, persistence/import, balanced-equation and actual RDKit graph assertions. Categorical reference panel; full experimental validation remains separate.`);
