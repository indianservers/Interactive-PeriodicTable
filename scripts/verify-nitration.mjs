import assert from 'node:assert/strict';
import {NITRATION_DEFAULTS as D,NITRATION_MW as M,nitrationInitial,advanceNitration,nitrationFeed,nitrationResult,validateNitration,nitrationRate} from '../src/modules/core-simulations/nitrationModel.js';
let checks=0;const near=(a,b,t=1e-8)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);checks++;},yes=(v,msg)=>{assert.ok(v,msg);checks++;};
// Independent atom inventories: C/H/N/O for each species.
const atoms={benzene:[6,6,0,0],nitricReactor:[0,1,1,3],nitricReservoir:[0,1,1,3],nitrobenzene:[6,5,1,2],water:[0,2,0,1]};
const material=(s,v)=>{const r=nitrationResult(s,v);for(let e=0;e<4;e++)near(Object.entries(r.amount).reduce((a,[name,n])=>a+atoms[name][e]*n,0),[6,6+v.acid,v.acid,3*v.acid][e],1e-8);near(Object.values(r.mass).reduce((a,b)=>a+b,0),r.initialMass,1e-8);near(r.energyResidual,0,1e-8);yes(s.extent<=Math.min(1,s.fed)+1e-10,'Extent bounded by both reactants');};
near(M.benzene+M.nitric,M.nitrobenzene+M.water,1e-12);
near(nitrationRate(40,D),D.k40);yes(nitrationRate(50,D)>nitrationRate(20,D),'Arrhenius temperature response');
const empty=nitrationInitial();assert.deepEqual(advanceNitration(empty,D,10),empty);checks++;
assert.throws(()=>nitrationFeed(empty,D));checks++;
let s={...nitrationInitial(),phase:'reaction',feeding:true};
for(let i=0;i<80;i++){s=advanceNitration(s,D,.5);material(s,D);}
near(s.fed,D.acid);yes(!s.feeding,'Empty reservoir stops feed');yes(!s.tripped,'Default cooling avoids training trip');
// Constant k, sealed reagent charge: exact bimolecular integrated rate law.
const v={...D,activation:0,cooling:0,adiabaticRise:10};let a={...nitrationInitial(),phase:'reaction',fed:.7};
a=advanceNitration(a,v,3);const q=Math.exp(-.3*v.k40*3),expected=.7*(1-q)/(1-.7*q);near(a.extent,expected,1e-10);near(a.temperature,20+10*a.extent,1e-9);material(a,v);
// Equal-reactant limit avoids cancellation.
a=advanceNitration({...nitrationInitial(),phase:'reaction',fed:1},v,2);near(a.extent,.8/1.8,1e-9);
// Pure lumped cooling has exact exponential solution.
a=advanceNitration({...nitrationInitial(),phase:'reaction',temperature:40,heat:20,peak:40},D,4);near(a.temperature,20+20*Math.exp(-D.cooling*4),1e-9);material(a,D);
const hot={...D,feed:.5,cooling:0};let h={...nitrationInitial(),phase:'reaction',feeding:true};h=advanceNitration(h,hot,20);yes(h.tripped&&!h.feeding,'Thermal interlock latches off feed');const fed=h.fed,x=h.extent;h=advanceNitration(h,hot,10);near(h.fed,fed);yes(h.extent>x,'Residual reagent reacts after feed trip');assert.throws(()=>nitrationFeed(h,hot));checks++;material(h,hot);
// Partitioning external time steps must preserve the thermal/material trajectory.
const start={...nitrationInitial(),phase:'reaction',feeding:true};const once=advanceNitration(start,D,10);let split=start;for(let i=0;i<100;i++)split=advanceNitration(split,D,.1);near(once.extent,split.extent,5e-5);near(once.temperature,split.temperature,.005);material(split,D);
for(const acid of [.1,.5,1,2])for(const cooling of [0,.5,2])for(const feed of [.01,.12,.5]){const p={...D,acid,cooling,feed};const end=advanceNitration({...nitrationInitial(),phase:'reaction',feeding:true},p,60);material(end,p);yes(nitrationResult(end,p).yieldPercent<=100+1e-8,'Theoretical yield bound');}
const frozen={...h,phase:'stopped'};assert.deepEqual(advanceNitration(frozen,hot,3),frozen);checks++;
for(const [k,val] of [['feed',NaN],['acid',0],['cooling',-1],['activity',4],['bath',Infinity]]){assert.throws(()=>validateNitration({...D,[k]:val}));checks++;}
for(const dt of [-1,NaN,61]){assert.throws(()=>advanceNitration(start,D,dt));checks++;}
assert.throws(()=>validateNitration(D,{...start,extent:1,fed:0}));checks++;
console.log(`PASS: ${checks} nitration assertions: independent C/H/N/O and mass inventories, exact rate/cooling references, thermal energy closure, feed trip, residual reaction, time-step consistency, limits and invalid inputs. Kinetic and thermal coefficients remain illustrative.`);
