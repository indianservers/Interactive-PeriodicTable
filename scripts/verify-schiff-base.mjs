import assert from 'node:assert/strict';
import initRDKit from '@rdkit/rdkit';
import {SCHIFF_DEFAULTS as D,SCHIFF_MW as M,SCHIFF_ATOMS as A,schiffInitial,chargeSchiff,advanceSchiff,schiffResult,schiffConstants,coolSchiff,collectSchiff,validateSchiff,parseSchiffNotebook} from '../src/modules/core-simulations/schiffBaseModel.js';
let assertions=0;const near=(a,b,t=1e-9)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);assertions++;},ok=b=>{assert.ok(b);assertions++;};
function ledger(s,v){const r=schiffResult(s,v),tot={...r.amounts};tot.imine+=s.collected;tot.water+=s.removedWater;tot.ethanol+=(s.wetSolvent+s.evaporated)/M.ethanol;
 near(r.totalMass,r.initialMass,1e-8);for(const z of ['C','H','O','N']){const actual=Object.entries(tot).reduce((n,[k,m])=>n+m*(A[k][z]||0),0),initial=Object.keys(A).reduce((n,k)=>n+v[k]/M[k]*(A[k][z]||0),0);near(actual,initial,1e-9);}for(const n of Object.values(tot))ok(n>=-1e-12);return r;}
near(M.aldehyde+M.amine,M.imine+M.water);near(M.imine,181.238);
for(const z of ['C','H','O','N'])near((A.aldehyde[z]||0)+(A.amine[z]||0),(A.imine[z]||0)+(A.water[z]||0));
let v={...D},s=chargeSchiff(schiffInitial(),v);ledger(s,v);s.heater=true;
for(let i=0;i<20;i++){s=advanceSchiff(s,v,5);ledger(s,v);}ok(s.extent>0);ok(schiffResult(s,v).waterGenerated>0);near(schiffResult(s,v).waterGenerated,s.extent*M.water);
const c=schiffConstants(40,v);near(c.K,D.K);near(schiffConstants(20,v).solubility,D.solubility);near(schiffConstants(40,{...v,catalyst:2}).k,c.k*2);near(schiffConstants(40,{...v,catalyst:2}).K,c.K);
let noCatalyst=advanceSchiff(chargeSchiff(schiffInitial(),{...D,catalyst:0}),{...D,catalyst:0},120);near(noCatalyst.extent,0);near(noCatalyst.removedWater,0);
// Hydrolysis from product and water, including disappearance of initial solid.
const rev={...D,aldehyde:.5,amine:.5,imine:3,water:2,K:.2,solubility:.2,catalyst:3};let rs=chargeSchiff(schiffInitial(),rev);rs=advanceSchiff(rs,rev,120);ok(rs.extent<0);ledger(rs,rev);
// Independently computed equilibrium with all product dissolved.
const eq={...D,aldehyde:.5,amine:.5,imine:0,water:.2,volume:80,solubility:.2,dissolutionEnthalpy:0,activation:0,enthalpy:0,kRef:.3,catalyst:3,K:1};let es=chargeSchiff(schiffInitial(),eq);for(let i=0;i<20;i++)es=advanceSchiff(es,eq,120);const aa=eq.aldehyde/M.aldehyde,bb=eq.amine/M.amine,ww=eq.water/M.water;near(es.extent,aa*bb/(aa+bb+ww),1e-9);ledger(es,eq);
// Example selective water receiver shifts equilibrium; water is not destroyed.
const trapV={...D,activation:0,enthalpy:0,dissolutionEnthalpy:0,kRef:.3,catalyst:3,solubility:.2};let closed=chargeSchiff(schiffInitial(),trapV),trapped={...closed,trap:true};for(let i=0;i<8;i++){closed=advanceSchiff(closed,trapV,120);trapped=advanceSchiff(trapped,trapV,120);ledger(trapped,trapV);}ok(trapped.extent>closed.extent);ok(trapped.removedWater>0);
s=coolSchiff(s,v);s=advanceSchiff(s,v,30);ok(s.temperature<25);const before=schiffResult(s,v);s=collectSchiff(s,v);near(s.collected,before.solid*v.recovery);ledger(s,v);const wet=s.wetSolvent,product=s.collected;s=advanceSchiff(s,v,12);ok(s.wetSolvent<wet);near(s.collected,product);ledger(s,v);near(s.wetSolvent,wet*Math.exp(-4),1e-10);
// External update size: same bounded internal integration and exact thermal flow.
let one={...chargeSchiff(schiffInitial(),D),heater:true,trap:true},many={...one};one=advanceSchiff(one,D,10);for(let i=0;i<100;i++)many=advanceSchiff(many,D,.1);near(one.extent,many.extent,1e-10);near(one.removedWater,many.removedWater,1e-10);near(one.temperature,many.temperature,1e-9);
for(const catalyst of [0,1,3])for(const water of [0,2])for(const K of [.2,20])for(const solubility of [.001,.2]){const x={...D,catalyst,water,K,solubility,kRef:.3,activation:70},start={...chargeSchiff(schiffInitial(),x),heater:true,trap:true};const y=advanceSchiff(start,x,120),r=ledger(y,x);ok(r.formed<=r.theoretical+1e-8);ok(r.solid>=0);}
for(const bad of [NaN,Infinity,-1]){assert.throws(()=>advanceSchiff(s,D,bad));assertions++;assert.throws(()=>validateSchiff({...D,aldehyde:bad}));assertions++;}
for(const bad of [{...schiffInitial(),phase:'missing'},{...schiffInitial(),extent:.1},{...s,removedWater:20},{...s,collected:20},{...s,wetSolvent:50},{...s,temperature:90}]){assert.throws(()=>validateSchiff(D,bad));assertions++;}
assert.throws(()=>collectSchiff(chargeSchiff(schiffInitial(),D),D));assertions++;
const hot=advanceSchiff({...chargeSchiff(schiffInitial(),D),heater:true},D,24);near(schiffResult(hot,D).solid,0);ok(hot.temperature>50);
let at25=coolSchiff(hot,{...D,coolTo:25});at25=advanceSchiff(at25,{...D,coolTo:25},120);ok(at25.temperature>=25);ok(collectSchiff(at25,{...D,coolTo:25}).collected>0);
const rd=await initRDKit(),mol=rd.get_mol('c1ccccc1/C=N/c2ccccc2');ok(!!mol);try{const j=JSON.parse(mol.get_json()),d=j.defaults.atom,c={C:0,H:0,N:0};for(const a of j.molecules[0].atoms){const z=a.z??d.z;if(z===6)c.C++;if(z===7)c.N++;if(z===1)c.H++;c.H+=a.impHs??d.impHs??0;}near(c.C,13);near(c.H,11);near(c.N,1);near(JSON.parse(mol.get_descriptors()).amw,M.imine,.002);}finally{mol.delete();}
const notebook={schema:1,records:[{state:s,values:D}],notes:'Scientific observations'};
ok(parseSchiffNotebook(notebook).records.length===1);
for(const bad of [{...notebook,records:[{values:D}]},{...notebook,records:[{state:null,values:D}]},{...notebook,notes:5},{...notebook,schema:2},{...notebook,records:new Array(2001)},{...notebook,records:[{state:{...s,collected:20},values:D}]}]){assert.throws(()=>parseSchiffNotebook(bad));assertions++;}
console.log(`PASS: ${assertions} Schiff-base assertions: balanced condensation, C/H/N/O and mass ledgers, reversible equilibrium, water capture, precipitation/isolation, drying, limits and timestep consistency. Example parameters are not experimental calibration.`);
