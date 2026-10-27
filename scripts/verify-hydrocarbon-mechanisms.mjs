import assert from 'node:assert/strict';
import * as M from '../src/modules/core-simulations/hydrocarbonMechanismsModel.js';
let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},close=(a,b,tol=1e-8)=>{assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checks++;};
const valence={H:1,C:4,O:6,Br:7},Z={H:1,C:6,O:8,Br:35,Mn:25,Zn:30};
const bondMap=f=>new Map(f.bonds.map(b=>[[b.a,b.b].sort((a,b)=>a-b).join('-'),b.order]));
const nonbond=f=>new Map(f.atoms.filter(a=>Object.hasOwn(valence,a.element)).map(a=>[a.id,valence[a.element]-a.charge-a.h-f.bonds.filter(b=>b.a===a.id||b.b===a.id).reduce((n,b)=>n+b.order,0)]));
for(const [key,meta]of Object.entries(M.HC_CASES)){
 const frames=M.HC_STRUCTURES[key];eq(meta.stages.length,frames.length);
 const initial=M.hcLedger(frames[0]);
 for(const [j,f]of frames.entries()){
  eq(M.hcLedger(f),initial);
  eq(f.components.flatMap(c=>c.ids).sort((a,b)=>a-b),f.atoms.map(a=>a.id).sort((a,b)=>a-b));
  for(const c of f.components)eq(f.atoms.filter(a=>c.ids.includes(a.id)).reduce((n,a)=>n+a.charge,0),c.charge);
  eq(f.atoms.map(a=>[a.id,a.element]).sort((a,b)=>a[0]-b[0]),frames[0].atoms.map(a=>[a.id,a.element]).sort((a,b)=>a[0]-b[0]));
  const fullCounts={};for(const a of f.three.atoms){fullCounts[a.element]=(fullCounts[a.element]||0)+1;a.p.forEach(x=>{assert.ok(Number.isFinite(x));checks++;});}
  eq(Object.fromEntries(Object.entries(fullCounts).sort()),Object.fromEntries(Object.entries(initial.counts).sort()));
  eq(f.three.atoms.reduce((n,a)=>n+Z[a.element],0)-f.three.atoms.reduce((n,a)=>n+a.charge,0),initial.electrons);
  for(const[i,a]of f.three.atoms.entries()){
   const order=f.three.bonds.filter(b=>b.a===i||b.b===i).reduce((n,b)=>n+b.order,0);
   if(a.element==='C')eq(order+a.charge+a.radicals,4);
   if(a.element==='O')eq(order-a.charge+a.radicals,2);
   if(a.element==='Br')eq(order-a.charge+a.radicals,1);
   if(a.element==='H')eq(order,1);
  }
  for(const b of f.three.bonds){assert.ok(b.a!==b.b&&f.three.atoms[b.a]&&f.three.atoms[b.b]);checks++;const a=f.three.atoms[b.a].p,c=f.three.atoms[b.b].p;assert.ok(Math.hypot(...a.map((x,i)=>x-c[i]))>.4);checks++;}
  if(j===frames.length-1)continue;
  const arrows=meta.stages[j][2];if(!arrows.length)continue; // Declared net metal workup, not elementary arrows.
  const next=frames[j+1],predicted=bondMap(f),NB=nonbond(f);
  for(const ar of arrows){eq(ar.electrons,key==='radical'?1:2);for(const [endpoint,sign]of [[ar.from,-1],[ar.to,1]]){
   if(Array.isArray(endpoint)){endpoint.forEach(id=>assert.ok(f.atoms.some(a=>a.id===id)));const k=[...endpoint].sort((a,b)=>a-b).join('-');if(sign<0)assert.ok(predicted.get(k)>0);predicted.set(k,(predicted.get(k)||0)+sign*ar.electrons/2);}
   else{assert.ok(NB.has(endpoint));NB.set(endpoint,NB.get(endpoint)+sign*ar.electrons);}
  }}
  const target=bondMap(next);for(const k of new Set([...predicted.keys(),...target.keys()]))close(predicted.get(k)||0,target.get(k)||0);
  const nNB=nonbond(next);for(const [id,n]of NB)close(n,nNB.get(id));
 }
 for(const speed of [.25,.5,1,2,4])for(const duration of [1,3,8]){
  let v={...M.HC_DEFAULTS,reaction:key,speed,stageSeconds:duration};
  for(let i=0;i<100;i++)v=M.hcAdvance(v,.01);
  close(v.timeline,Math.min(frames.length-1,speed/duration));
  eq(M.hcAdvance(v,3600).timeline,frames.length-1);
  for(const t of [0,.3,frames.length-1]){const values=M.hcValues({...v,timeline:t}),record=M.hcRecord(1,values),book={...M.hcNotebook(),records:[record]};eq(M.hcParse(JSON.stringify(book)),book);}
 }
}
eq(M.hcLedger(M.HC_STRUCTURES.ionic[0]).formula,'C3H7Br');eq(M.hcLedger(M.HC_STRUCTURES.radical[0]).electrons,95);
eq(M.HC_STRUCTURES.e2[1].bonds.find(b=>b.order===2).stereo,'STEREOE');
for(const key of ['e2','e2terminal']){
 const a=M.HC_STRUCTURES[key][0].three.atoms,idx=id=>a.find(x=>x.id===id).p;
 const sub=(a,b)=>a.map((x,i)=>x-b[i]),dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>a.map(x=>x/Math.hypot(...a));
 const beta=key==='e2'?3:1,b=unit(sub(idx(2),idx(beta))),left=sub(idx(8),idx(beta)),right=sub(idx(5),idx(2)),u=unit(left.map((x,i)=>x-b[i]*dot(left,b))),v=unit(right.map((x,i)=>x-b[i]*dot(right,b)));
 close(dot(u,v),-1,1e-6);
}
for(const reaction of ['__proto__','constructor','',null,[]])assert.throws(()=>M.hcValues({...M.HC_DEFAULTS,reaction}));
for(const [key,value]of [['timeline',NaN],['timeline',-1],['timeline',3],['speed',0],['stageSeconds',.5],['arrowWidth',1.1],['showMaps',1],['azimuth',361],['threeStyle','bad']])assert.throws(()=>M.hcValues({...M.HC_DEFAULTS,[key]:value}));
const book={...M.hcNotebook(),records:[M.hcRecord(1,M.HC_DEFAULTS)]},bad=structuredClone(book);bad.records[0].reading.electrons++;assert.throws(()=>M.hcParse(bad));assert.throws(()=>M.hcParse({...book,records:[...book.records,...book.records]}));assert.throws(()=>M.hcAdvance(M.HC_DEFAULTS,-1));
const reordered=structuredClone(book);reordered.records[0].reading=Object.fromEntries(Object.entries(reordered.records[0].reading).reverse());eq(M.hcParse(reordered),book);
console.log(`PASS: ${checks} counted mapped-atom/formula/charge/electron, 3D connectivity, pair/fishhook bond+nonbonding-electron reconstruction, E2 anti geometry, playback and notebook checks over eight pathways/22 stages.`);
