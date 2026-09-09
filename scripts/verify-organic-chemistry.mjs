import assert from 'node:assert/strict';
import {molecules,expandMolecule} from '../src/pages/organicMolecules.js';
import {topics,networks,pathways,reactionTypes,matchingPathways} from '../src/pages/organicNetworkData.js';

function inventory(formula) {
 const out={charge:formula.endsWith('+')?1:formula.endsWith('-')?-1:0};
 for(const [,element,count] of formula.matchAll(/([A-Z][a-z]?)(\d*)/g))out[element]=(out[element]||0)+Number(count||1);
 return out;
}
const sum=formulas=>formulas.reduce((out,f)=>{for(const [k,v] of Object.entries(inventory(f)))out[k]=(out[k]||0)+v;return out;},{});
const normalized=value=>Object.fromEntries(Object.entries(value).sort(([a],[b])=>a.localeCompare(b)));
const same=(a,b,message)=>assert.deepEqual(normalized(a),normalized(b),message);
const valences={C:4,O:2,H:1,N:3,Cl:1,Br:1};
for(const [id,m] of Object.entries(molecules)){
 const graph=expandMolecule(m),counts={charge:m.charge||0};
 graph.atoms.forEach(([element])=>counts[element]=(counts[element]||0)+1);
 same(counts,{...inventory(m.molecular),charge:m.charge||0},id+' model formula');
 same(inventory(m.formula.normalize('NFKC').replace(/−/g,'-')),counts,id+' displayed formula');
 m.atoms.forEach(([element,x,y,z,h,charge=0],i)=>{
  const bondOrder=m.bonds.filter(b=>b[0]===i||b[1]===i).reduce((n,b)=>n+b[2],0);
  assert.equal(h+bondOrder,valences[element]+charge,id+' valence at atom '+i);
 });
 assert.equal(m.atoms.reduce((n,a)=>n+(a[5]||0),0),m.charge||0,id+' formal charge');
 for(const [a,b,order] of graph.bonds){assert(a!==b&&graph.atoms[a]&&graph.atoms[b]);assert([1,2,3].includes(order));}
 if(m.aromatic)assert(m.atoms.slice(0,6).every(a=>a[3]===0),id+' planar ring');
}
const expected={Alkanes:['chlorination'],Alkenes:['hydration','hydrogenation','hydrobromination'],Haloalkanes:['halo-hydrolysis','halo-elimination','ammonolysis'],Alcohols:['oxidation','elimination','acid','ester'],'Carbonyl compounds':['carbonyl-reduction','carbonyl-oxidation'],'Carboxylic acids':['acid-esterification'],Esters:['ester-acid-hydrolysis','ester-base-hydrolysis'],Amines:['amine-protonation'],'Aromatic compounds':['nitration']};
assert.equal(new Set(pathways.map(p=>p.id)).size,pathways.length);
for(const p of pathways){
 same(sum(p.reactants),sum(p.products),p.id+' balanced atoms and charge');
 assert.equal(p.source,networks[p.topic].source);
 assert(p.reactants.includes(molecules[p.source].molecular),p.id+' source is a reactant');
 assert(p.products.includes(molecules[p.product].molecular+(p.charge>0?'+':p.charge<0?'-':'')),p.id+' product matches graph');
 assert(p.types.every(t=>reactionTypes.includes(t)));
 const sides=p.equation.normalize('NFKC').replace(/[−⁻]/g,'-').split(/[→⇌]/);
 const parseSide=side=>side.trim().split(/\s+\+\s+/).flatMap(term=>{const match=term.match(/^(\d+)?(.*)$/);return Array(Number(match[1]||1)).fill(match[2].replace(/[\[\]=]/g,'').trim());});
 same(sum(parseSide(sides[0])),sum(p.reactants),p.id+' displayed reactants');
 same(sum(parseSide(sides[1])),sum(p.products),p.id+' displayed products');
}
let combinations=0;
for(const topic of topics){
 assert.deepEqual(matchingPathways('',topic).map(p=>p.id),expected[topic],topic+' own reactions');
 // All 256 subsets: alternatives within type, intersection with the topic.
 for(let mask=0;mask<2**reactionTypes.length;mask++){
  const types=reactionTypes.filter((_,i)=>mask&(1<<i));
  const results=matchingPathways('',topic,types);
  const wanted=pathways.filter(p=>expected[topic].includes(p.id)&&(!types.length||p.types.some(t=>types.includes(t))));
  assert.deepEqual(results.map(p=>p.id),wanted.map(p=>p.id));combinations++;
 }
 assert.equal(matchingPathways('nonexistent molecule',topic).length,0);
}
assert.deepEqual(matchingPathways('oxidation of ethanol','Alcohols').map(p=>p.id),['oxidation','acid']);
assert.deepEqual(matchingPathways('C₄H₈O₂','Alcohols').map(p=>p.id),['ester']);
assert.deepEqual(matchingPathways('NaBH4','Carbonyl compounds').map(p=>p.id),['carbonyl-reduction']);
assert.deepEqual(matchingPathways('potassium dichromate','Alcohols').map(p=>p.id),['oxidation','acid']);
assert.deepEqual(matchingPathways('sodium borohydride','Carbonyl compounds').map(p=>p.id),['carbonyl-reduction']);
assert.deepEqual(matchingPathways('acetaldehyde','Alcohols').map(p=>p.id),['oxidation']);
const angle=(a,b)=>Math.acos(a.reduce((n,v,i)=>n+v*b[i],0)/Math.hypot(...a)/Math.hypot(...b))*180/Math.PI;
for(const [id,wanted] of [['methane',109.4712206],['ethene',120]]){
 const graph=expandMolecule(molecules[id]);
 const adjacent=graph.bonds.filter(b=>b[0]===0||b[1]===0).map(b=>graph.atoms[b[0]===0?b[1]:b[0]].slice(1).map((v,i)=>v-graph.atoms[0][i+1]));
 for(let i=0;i<adjacent.length;i++)for(let j=i+1;j<adjacent.length;j++)assert(Math.abs(angle(adjacent[i],adjacent[j])-wanted)<.001,id+' teaching geometry');
}
console.log(JSON.stringify({passed:true,molecules:Object.keys(molecules).length,pathways:pathways.length,topics:topics.length,filterCombinations:combinations}));
