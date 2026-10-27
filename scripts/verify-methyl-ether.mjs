import assert from 'node:assert/strict';
import initRDKit from '@rdkit/rdkit';
import {ETHER_DEFAULTS as D,ETHER_MW as M,etherInitial,etherSpeciation,etherResult,advanceEther,addEtherElectrophile,workupEther,collectEther,validateEther} from '../src/modules/core-simulations/methylEtherModel.js';
let checks=0;const near=(a,b,t=1e-8)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);checks++;},yes=(x,m)=>{assert.ok(x,m);checks++;};
// Independent element inventory, ordered C/H/O/I/Na.
const atoms={naphthol:[10,8,1,0,0],naphthoxide:[10,7,1,0,0],ether:[11,10,1,0,0],methylIodide:[1,3,0,1,0],methanol:[1,4,1,0,0],iodide:[0,0,0,1,0],sodium:[0,0,0,0,1],hydroxide:[0,1,1,0,0],hydrogen:[0,1,0,0,0],water:[0,2,1,0,0]};
function balance(s,v){const r=etherResult(s,v),n=v.mass/144.173,m=n*v.electrophile,B=n*v.base,W=(v.volume*.9982+(['workup','collected'].includes(s.phase)?v.dilution:0))/18.015,expected=[10*n+m,8*n+3*m+B+2*W,n+B+W,m,B];
 for(let e=0;e<5;e++)near(Object.entries(r.amounts).reduce((a,[k,x])=>a+atoms[k][e]*x,0),expected[e],2e-8);
 near(Object.values(r.masses).reduce((a,b)=>a+b,0),r.initialMass,1e-7);near(r.charge,0,1e-9);yes(Object.values(r.amounts).every(x=>x>=-1e-10),'Nonnegative species');yes(r.yieldPercent<=100+1e-7,'Ether-component yield bounded');near(s.ether+s.hydrolysis+r.amounts.methylIodide,m,1e-10);return r;
}
near(M.naphthoxide+M.methylIodide,M.ether+M.iodide,1e-10);near(M.methylIodide+M.hydroxide,M.methanol+M.iodide,1e-10);
const weak=etherSpeciation(.01,0,9.5),Ka=10**-9.5,H=(-Ka+Math.sqrt(Ka*Ka+4*Ka*.01))/2;near(weak.H,H,2e-8);near(weak.neutral+weak.ion,.01,1e-10);near(weak.residual,0,1e-10);
const saturated=etherSpeciation(.1,0,9.5,.001);yes(saturated.solid>0,'Neutral precursor can precipitate');near(saturated.neutral,.001);near(saturated.residual,0,1e-10);
let s={...etherInitial(),phase:'activated',heater:true};balance(s,D);s=advanceEther(s,D,5);near(s.ether,0);s=addEtherElectrophile(s,D);
for(let i=0;i<60;i++){s=advanceEther(s,D,1);balance(s,D);}
yes(s.ether>0&&s.hydrolysis>0,'Competing paths both consume methyl reagent');s=workupEther(s,D);let r=balance(s,D),hot=r.etherCrystals;s=advanceEther(s,D,12);r=balance(s,D);yes(r.etherCrystals>=hot,'Cooling and remaining reaction increase available ether crystals');s=collectEther(s,D);r=balance(s,D);const dry=r.collected,wet=r.wetWater;s=advanceEther(s,D,9);r=balance(s,D);near(r.collected,dry);near(r.wetWater,wet*Math.exp(-3));
// No hydroxide-path rate yields no methanol; increasing the competing rate
// under strong-base conditions lowers ether selectivity at fixed time.
const start={...etherInitial(),phase:'reaction',heater:true};const clean=advanceEther(start,{...D,kHydrolysis:0},20);near(clean.hydrolysis,0);
const slow=advanceEther(start,{...D,base:3,kHydrolysis:.01},10),fast=advanceEther(start,{...D,base:3,kHydrolysis:.5},10);yes(etherResult(fast,{...D,base:3,kHydrolysis:.5}).selectivity<etherResult(slow,{...D,base:3,kHydrolysis:.01}).selectivity,'Competing hydrolysis lowers selectivity');
let low=advanceEther(start,{...D,base:0},30);low=workupEther(low,{...D,base:0});low=advanceEther(low,{...D,base:0},10);r=balance(low,{...D,base:0});yes(r.naphtholCrystals>r.etherCrystals,'Low-base workup can give mostly unreacted precursor');
for(const base of [0,.5,1.1,3])for(const electrophile of [.1,1.1,2])for(const kHydrolysis of [0,.05,.5]){const v={...D,base,electrophile,kHydrolysis};let t=advanceEther(start,v,80);balance(t,v);t=workupEther(t,v);t=advanceEther(t,v,12);let q=balance(t,v);if(q.etherCrystals+q.naphtholCrystals>1e-9){t=collectEther(t,v);balance(t,v);}}
yes(etherResult({...etherInitial(),phase:'activated'},{...D,base:0}).naphtholCrystals>0,'Low-base precursor can be solid before workup');yes(etherResult(slow,{...D,base:3,kHydrolysis:.01}).etherCrystals>0,'Insoluble ether can precipitate during reaction');
const whole=advanceEther(start,D,10);let split=start;for(let i=0;i<100;i++)split=advanceEther(split,D,.1);near(whole.ether,split.ether,2e-6);near(whole.hydrolysis,split.hydrolysis,2e-6);near(whole.temperature,split.temperature,1e-8);
for(const fn of [addEtherElectrophile,workupEther,collectEther]){assert.throws(()=>fn(etherInitial(),D));checks++;}
for(const bad of [{...start,ether:1},{...start,hydrolysis:1},{...start,collectedEther:1},{...s,collectedEther:100},{...s,retainedWater:1000}]){assert.throws(()=>validateEther(D,bad));checks++;}
for(const [k,v] of [['mass',0],['base',NaN],['volume',Infinity],['recovery',2]]){assert.throws(()=>validateEther({...D,[k]:v}));checks++;}
for(const dt of [-1,Infinity,121]){assert.throws(()=>advanceEther(start,D,dt));checks++;}
// Actual product graph, independent of the apparatus/kinetic implementation.
const rd=await initRDKit(),mol=rd.get_mol('COc1ccc2ccccc2c1');yes(!!mol,'Product SMILES parses');try{const j=JSON.parse(mol.get_json()),defaults=j.defaults.atom;let C=0,O=0,Hc=0;for(const a of j.molecules[0].atoms){const z=a.z??defaults.z;if(z===6)C++;if(z===8)O++;if(z===1)Hc++;Hc+=a.impHs??defaults.impHs??0;}near(C,11);near(O,1);near(Hc,10);near(JSON.parse(mol.get_descriptors()).amw,158.2,.002);}finally{mol.delete();}
console.log(`PASS: ${checks} methyl-ether assertions: five-element/mass/charge balance, competing paths, precursor impurity, collection/drying, timestep and limits; RDKit verifies C11H10O and molecular weight. Numerical parameters remain illustrative.`);
