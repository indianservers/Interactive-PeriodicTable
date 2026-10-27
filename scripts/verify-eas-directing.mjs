import assert from 'node:assert/strict';
import * as M from '../src/modules/core-simulations/easDirectingModel.js';
let checks=0,frames=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;},ok=x=>{assert.ok(x);checks++;},throws=f=>{assert.throws(f);checks++;};
const Z={H:1,C:6,N:7,O:8,F:9,Cl:17,Br:35},V={H:1,C:4,N:5,O:6,F:7,Cl:7,Br:7};
for(const [group,channels]of Object.entries(M.EAS_STRUCTURES))for(const [pos,fs]of Object.entries(channels)){
 const attack=+pos,initial=M.easLedger(fs[0]),baseIds=fs[0].atoms.map(a=>[a.id,a.element]).sort((a,b)=>a[0]-b[0]),n=(id,j)=>(id-1+j)%6+1;
 eq(fs.length,['oh','nh2','ome','cl','br'].includes(group)&&attack!==3?6:5);
 eq(fs.slice(1,4).map(f=>f.chargeAt),[n(attack,1),n(attack,3),n(attack,5)]);
 eq(M.easComparison(group,attack).ipso,attack!==3);
 for(const f of fs){frames++;eq(M.easLedger(f),initial);eq(f.atoms.map(a=>[a.id,a.element]).sort((a,b)=>a[0]-b[0]),baseIds);eq(f.atoms.reduce((n,a)=>n+a.charge,0),initial.charge);
  const counts={};for(const a of f.three.atoms){counts[a.element]=(counts[a.element]??0)+1;a.p.forEach(x=>ok(Number.isFinite(x)));}
  eq(counts,f.ledger.counts);eq(f.three.atoms.reduce((n,a)=>n+Z[a.element]-a.charge,0),initial.electrons);
  for(const b of f.three.bonds){const a=f.three.atoms[b.a],c=f.three.atoms[b.b],d=Math.hypot(...a.p.map((x,i)=>x-c.p[i]));ok(d>.6&&d<2.8);}
  eq(f.components.flatMap(c=>c.ids).sort((a,b)=>a-b),f.atoms.map(a=>a.id).sort((a,b)=>a-b));
  for(const a of f.atoms){const order=f.bonds.filter(b=>b.a===a.id||b.b===a.id).reduce((n,b)=>n+b.order,0)+a.h,nonbond=V[a.element]-a.charge-order;ok(Number.isInteger(nonbond)&&nonbond>=0&&nonbond%2===0);if(a.element==='C')eq(order,a.charge===1?3:4);if(a.element==='H')eq(order,a.charge===1?0:1);if(a.element==='N')eq(order,a.charge===1?4:3);if(a.element==='O')eq(order,a.charge===1?3:a.charge===-1?1:2);}
  const carbon=f.atoms.find(a=>a.id===attack),ringOrders=f.bonds.filter(b=>b.a<=6&&b.b<=6).map(b=>b.order);eq(carbon.charge,0);eq(ringOrders.filter(x=>x===2).length,f.kind==='sigma'?2:3);
  const hbond=f.bonds.find(b=>b.a===31||b.b===31),brbond=f.bonds.find(b=>b.a===30||b.b===30);eq(Boolean(hbond),f.kind!=='product');eq(Boolean(brbond),f.kind!=='reactant');
  if(f.kind==='sigma'){eq(f.three.atoms.map(a=>a.p),fs[1].three.atoms.map(a=>a.p));eq(f.atoms.find(a=>a.id===31).charge,0);}
 }
 // Attack consumes exactly one aromatic π pair and electrophile charge; deprotonation restores that bond.
 const bondMap=f=>new Map(f.bonds.map(b=>[[b.a,b.b].sort((a,b)=>a-b).join('-'),b.order]));
 const before=bondMap(fs[0]),sigma=bondMap(fs[1]),product=bondMap(fs.at(-1)),k=[attack,n(attack,1)].sort((a,b)=>a-b).join('-');eq(before.get(k),2);eq(sigma.get(k),1);eq(product.get(k),2);
 for(const [key,value]of before)if(key!==k&&!key.includes('31'))eq(sigma.get(key),value);
 for(let i=0;i<fs.length;i++){const v={...M.EAS_DEFAULTS,group,attack,timeline:i===0?0:i===fs.length-1?2:1,contributor:i===0||i===fs.length-1?0:i-1},r=M.easRecord(i+1,v);eq(M.easAt(v).frame.title,fs[i].title);eq(M.easParse({...M.easNotebook(),records:[r]}).records[0],r);}
 for(let i=0;i<fs.length-2;i++){const flow=M.easResonanceFlow(group,attack,i),a=fs[1+i],b=fs[1+flow.target],orders=bondMap(a),nonbond=f=>new Map(f.atoms.map(atom=>[atom.id,V[atom.element]-atom.charge-atom.h-f.bonds.filter(x=>x.a===atom.id||x.b===atom.id).reduce((n,x)=>n+x.order,0)])),nb=nonbond(a),key=e=>[...e].sort((a,b)=>a-b).join('-');orders.set(key(flow.from),orders.get(key(flow.from))-1);if(Array.isArray(flow.to))orders.set(key(flow.to),(orders.get(key(flow.to))??0)+1);else nb.set(flow.to,nb.get(flow.to)+2);eq([...orders].filter(([,n])=>n).sort(),[...bondMap(b)].sort());eq(nb,nonbond(b));}
}
eq(M.easComparison('cl',4).activity,'Deactivating');eq(M.easComparison('cl',4).favored,true);eq(M.easComparison('nh3',3).favored,true);eq(M.easComparison('nh2',3).favored,false);
for(const speed of [.25,.5,1,2,4]){const v={...M.EAS_DEFAULTS,timeline:0,speed};let split=v;for(let i=0;i<10;i++)split=M.easAdvance(split,.05);ok(Math.abs(split.timeline-M.easAdvance(v,.5).timeline)<1e-9);eq(M.easAdvance(v,3600).timeline,2);ok(M.easAdvance(v,.01).timeline>0);}
for(const dt of [.013371,.10023451,.19995375]){const v=M.easAdvance({...M.EAS_DEFAULTS,timeline:0,stageSeconds:3.5},dt);ok(M.easRecord(1,v).values.timeline>0);ok(M.easValues({...v,speed:4}).timeline>0);}
for(const patch of [{group:'__proto__'},{attack:5},{timeline:NaN},{timeline:2.1},{contributor:6},{speed:0},{showMaps:'true'},{diagramScale:103},{azimuth:-1},{stageSeconds:2.2},{threeStyle:'fake'}])throws(()=>M.easValues({...M.EAS_DEFAULTS,...patch}));
throws(()=>M.easAdvance(M.EAS_DEFAULTS,-1));throws(()=>M.easAdvance(M.EAS_DEFAULTS,3601));throws(()=>M.easRecord(0,M.EAS_DEFAULTS));
const r=M.easRecord(1,M.EAS_DEFAULTS),book={...M.easNotebook(),records:[r],notes:'commas, quotes" and\nnewlines'};eq(M.easParse(JSON.stringify(book)),book);throws(()=>M.easParse({...book,records:[r,r]}));throws(()=>M.easParse({...book,records:[{...r,reading:{...r.reading,electrons:999}}]}));eq(M.easParse({...book,records:[{...r,reading:Object.fromEntries(Object.entries(r.reading).reverse())}]}),book);ok(M.easCsv(book).includes('"84"'));
console.log(`PASS:${checks} counted EAS conservation, Lewis valence, resonance topology/nuclear-coordinate, directing-class, attack/deprotonation, clock and notebook checks;36 channels/${frames} graphs.`);
