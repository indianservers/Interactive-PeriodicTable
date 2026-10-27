import assert from 'node:assert/strict';
import {BENZOIC_DEFAULTS as D,BENZOIC_MW as M,benzoicInitial,advanceBenzoic,benzoicResult,benzoicEquilibrium,addBenzoicOxidant,quenchBenzoicOxidant,clarifyBenzoic,acidifyBenzoic,collectBenzoic,validateBenzoic} from '../src/modules/core-simulations/benzoicPreparationModel.js';
let checks=0;const near=(a,b,t=1e-8)=>{assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);checks++;},yes=(v,m)=>{assert.ok(v,m);checks++;};
// Independent stoichiometric reference: 3 RCH2Cl + 4 MnO4- + 2 OH-
// -> 3 RCOO- + 4 MnO2 + 3 Cl- + 4 H2O (R = phenyl).
near(3*M.benzylChloride+4*M.permanganate+2*M.hydroxide,3*M.benzoate+4*M.manganeseDioxide+3*M.chloride+4*M.water,1e-10);
// Independent reference inventories, element order C,H,O,Cl,Mn,K,Na,S.
const atoms={benzylChloride:[7,7,0,1,0,0,0,0],benzylAlcohol:[7,8,1,0,0,0,0,0],benzoate:[7,5,2,0,0,0,0,0],benzoicAcid:[7,6,2,0,0,0,0,0],permanganate:[0,0,4,0,1,0,0,0],manganeseDioxide:[0,0,2,0,1,0,0,0],hydroxide:[0,1,1,0,0,0,0,0],hydrogen:[0,1,0,0,0,0,0,0],chloride:[0,0,0,1,0,0,0,0],potassium:[0,0,0,0,0,1,0,0],sodium:[0,0,0,0,0,0,1,0],sulfate:[0,0,4,0,0,0,0,1],water:[0,2,1,0,0,0,0,0]};
function balance(s,v){
 const r=benzoicResult(s,v),n=v.mass/126.583,mm=v.permanganate/158.032344,water=v.volume*.9982/18.015,ss=1.5*s.quench*n,acid=s.acidAdded*n;
 const expected=[7*n,7*n+v.base*n+2*water+acid,4*mm+v.base*n+water+3*ss,n+acid,mm,v.base*n+mm,2*ss,ss];
 for(let e=0;e<8;e++)near(Object.entries(r.amounts).reduce((a,[name,mol])=>a+atoms[name][e]*mol,0),expected[e],2e-8);
 near(Object.values(r.masses).reduce((a,b)=>a+b,0),r.initialMass,2e-7);near(r.charge,0,1e-9);
 yes(Object.values(r.amounts).every(x=>x>=-1e-12),'Nonnegative material amounts');yes(r.yieldPercent<=100+1e-7,'Dry isolated yield respects stoichiometric bound');return r;
}
let s={...benzoicInitial(),phase:'hydrolysis',heater:true};
for(let i=0;i<10;i++){s=advanceBenzoic(s,D,1);balance(s,D);}
yes(s.hydrolysis>0&&s.oxidation===0,'Hydrolysis occurs before oxidant enters the vessel');
s=addBenzoicOxidant(s,D);for(let i=0;i<60;i++){s=advanceBenzoic(s,D,1);balance(s,D);}
yes(s.oxidation>.99,'Default illustrative reaction progresses');
s=quenchBenzoicOxidant(s,D);let r=balance(s,D);near(r.amounts.permanganate,0);near(r.amounts.manganeseDioxide,D.permanganate/158.032344);
s=clarifyBenzoic(s,D);balance(s,D);s=acidifyBenzoic(s,D);r=balance(s,D);yes(r.equilibrium.pH<3,'Excess acid protonates benzoate');
const hotCrystals=r.crystals;s=advanceBenzoic(s,D,20);r=balance(s,D);yes(r.crystals>hotCrystals,'Cooling increases crystals at specified solubility');
s=collectBenzoic(s,D);r=balance(s,D);near(r.collected,r.crystals*D.recovery);const collected=r.collected,wet=r.wetWater;s=advanceBenzoic(s,D,9);r=balance(s,D);near(r.collected,collected);near(r.wetWater,wet*Math.exp(-3));
// Analytic dilute weak-acid and saturated acid references (Kw retained below).
const ka=6.3e-5,kw=1e-14,weak=benzoicEquilibrium(.001,0,.028),H=(-ka+Math.sqrt(ka*ka+4*ka*.001))/2;
near(weak.H,H,1e-9);near(weak.solid,0);near(weak.ha+weak.a,.001,1e-12);near(weak.residual,0,1e-12);
const sat=benzoicEquilibrium(.1,-.01,.028),Hs=(.01+Math.sqrt(.0001+4*(ka*.028+kw)))/2;
near(sat.H,Hs,1e-12);near(sat.ha,.028,1e-12);near(sat.solid,.1-.028-ka*.028/Hs,1e-12);
// Restrict oxidant and base independently; all workup additions remain tracked.
for(const base of [.2,1.5,3])for(const permanganate of [.2,5,10])for(const acid of [.1,3,6]){
 const v={...D,base,permanganate,acid};let t={...benzoicInitial(),phase:'hydrolysis',heater:true};t=addBenzoicOxidant(t,v);t=advanceBenzoic(t,v,120);balance(t,v);t=quenchBenzoicOxidant(t,v);balance(t,v);t=clarifyBenzoic(t,v);t=acidifyBenzoic(t,v);t=advanceBenzoic(t,v,30);const q=balance(t,v);
 near(q.theoretical,Math.min(v.mass/126.583,.75*v.permanganate/158.032344,1.5*base*v.mass/126.583)*122.123,1e-10);
 if(acid===.1)near(q.crystals,0,1e-9);
}
const start=addBenzoicOxidant({...benzoicInitial(),phase:'hydrolysis',heater:true},D),whole=advanceBenzoic(start,D,20);let split=start;for(let i=0;i<200;i++)split=advanceBenzoic(split,D,.1);near(whole.hydrolysis,split.hydrolysis,2e-6);near(whole.oxidation,split.oxidation,2e-6);near(whole.temperature,split.temperature,1e-8);
for(const fn of [addBenzoicOxidant,quenchBenzoicOxidant,clarifyBenzoic,acidifyBenzoic,collectBenzoic]){assert.throws(()=>fn(benzoicInitial(),D));checks++;}
for(const [key,value] of [['mass',0],['acid',NaN],['volume',Infinity],['recovery',1.1],['setpoint',101]]){assert.throws(()=>validateBenzoic({...D,[key]:value}));checks++;}
for(const dt of [-1,Infinity,121]){assert.throws(()=>advanceBenzoic(start,D,dt));checks++;}
assert.throws(()=>validateBenzoic(D,{...start,oxidation:1,hydrolysis:0}));checks++;
assert.throws(()=>validateBenzoic(D,{...start,quench:10}));checks++;
for(const bad of [{...benzoicInitial(),phase:'hydrolysis',oxidation:.1,hydrolysis:.2},{...benzoicInitial(),collectedMass:1},{...s,collectedMass:100},{...s,retainedWater:1000}]){assert.throws(()=>validateBenzoic(D,bad));checks++;}
console.log(`PASS: ${checks} benzoic preparation assertions: eight-element and charge/mass balance through every stage, 4:3 permanganate stoichiometry, acid/solubility reference equilibria, cooling, collection, drying, limits and invalid transitions. Model remains illustrative; no route/browser completion is inferred.`);
