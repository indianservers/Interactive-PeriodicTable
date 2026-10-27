import assert from 'node:assert/strict';
import {ESTER_DEFAULTS as D,ESTER_MW as M,esterInitial,esterResult,advanceEster,coolEster,settleEster,drainEster,collectEster,validateEster,esterConstants,reversibleEsterStep} from '../src/modules/core-simulations/esterificationModel.js';
let checks=0;const near=(a,b,t=1e-8)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);checks++;},yes=(x,m)=>{assert.ok(x,m);checks++;};
const atoms={acid:[2,4,2],alcohol:[4,10,1],ester:[6,12,2],water:[0,2,1]};
function balance(s,v){const r=esterResult(s,v),wash=r.separated?v.wash:0,initial={acid:v.acid/M.acid,alcohol:v.alcohol/M.alcohol,ester:v.ester/M.ester,water:(v.water+wash)/M.water};
 for(let e=0;e<3;e++)near(Object.entries(r.amounts).reduce((a,[k,n])=>a+atoms[k][e]*n,0),Object.entries(initial).reduce((a,[k,n])=>a+atoms[k][e]*n,0),1e-8);
 near(r.mass,r.expectedMass,1e-8);yes(Object.values(r.amounts).every(x=>x>=-1e-10),'Nonnegative species');
 if(r.separated){for(const k of Object.keys(M))near(r.funnel[k]+r.waste[k]+r.product[k],r.amounts[k]);near(r.funnelMass+r.wasteMass+r.productMass,r.expectedMass);}
 yes(r.recoveryPercent<=100+1e-7,'Ester recovery respects material bound');return r;
}
near(M.acid+M.alcohol,M.ester+M.water,1e-10);
near(reversibleEsterStep(1,1,0,0,4,1e6),2/3,1e-12);
near(reversibleEsterStep(1,1,0,0,1,1e6),.5,1e-12);
near(reversibleEsterStep(0,0,1,1,4,1e6),-1/3,1e-12);
near(reversibleEsterStep(1,1,0,0,4,0),0);
// K=1 linear ODE has exact solution z=.5(1-exp(-2t)).
near(reversibleEsterStep(1,1,0,0,1,1.7),.5*(1-Math.exp(-3.4)),1e-12);
// Equilibrium is independent of catalyst, while finite-time conversion changes.
const start={...esterInitial(),phase:'reaction',heater:true};let s=start;
for(let i=0;i<30;i++){s=advanceEster(s,D,1);balance(s,D);}
const fast=advanceEster(start,{...D,catalyst:3},5),slow=advanceEster(start,{...D,catalyst:.2},5),off=advanceEster(start,{...D,catalyst:0},5);
yes(fast.extent>slow.extent,'Catalyst changes approach rate');near(off.extent,0);near(esterConstants(70,{...D,catalyst:3}).K,esterConstants(70,{...D,catalyst:.2}).K);near(esterConstants(70,D).K,D.Keq);near(esterConstants(70,D).k,D.kRef);
const eqBase=esterResult(start,D).equilibriumEster,eqWet=esterResult(start,{...D,water:8}).equilibriumEster,eqExcess=esterResult(start,{...D,alcohol:20}).equilibriumEster;
yes(eqWet<eqBase,'Initial water suppresses ester formation');yes(eqExcess>eqBase,'Excess alcohol favours ester formation');
s=coolEster(s,D);assert.throws(()=>settleEster(s,D));checks++;s=advanceEster(s,D,8);balance(s,D);s=settleEster(s,D);let r=balance(s,D);
near(r.upper.ester/r.lower.ester,D.partition*D.organicVolume/D.wash,1e-10);near(r.upper.acid/r.lower.acid,.2*D.organicVolume/D.wash,1e-10);
s=drainEster(s,D);s=advanceEster(s,D,.5);r=balance(s,D);near(s.drained,.25);near(r.waste.ester,r.lower.ester*.25);near(s.collected,0);
s=advanceEster(s,D,120);near(s.drained,1);yes(s.phase==='upperReady','Lower drainage completes exactly');s=collectEster(s,D);s=advanceEster(s,D,120);r=balance(s,D);yes(s.phase==='collected','Upper collection completes');near(r.collectedEster,r.upper.ester*M.ester);near(r.funnelMass,0);yes(r.productMass>r.collectedEster,'Collected layer includes other species');
for(const acid of [1,6,15])for(const alcohol of [1,7.4,25])for(const water of [0,8])for(const ester of [0,10]){
 const v={...D,acid,alcohol,water,ester};let t=advanceEster(start,v,60);balance(t,v);t=coolEster(t,v);t=advanceEster(t,v,10);t=settleEster(t,v);balance(t,v);t=drainEster(t,v);t=advanceEster(t,v,2);balance(t,v);t=collectEster(t,v);t=advanceEster(t,v,2);balance(t,v);
}
const a=advanceEster(start,D,10);let b=start;for(let i=0;i<100;i++)b=advanceEster(b,D,.1);near(a.extent,b.extent,3e-7);near(a.temperature,b.temperature,1e-8);
for(const fn of [coolEster,settleEster,drainEster,collectEster]){assert.throws(()=>fn(esterInitial(),D));checks++;}
for(const [k,x] of [['acid',0],['catalyst',-1],['partition',NaN],['Keq',0],['water',Infinity]]){assert.throws(()=>validateEster({...D,[k]:x}));checks++;}
for(const bad of [{...start,extent:1},{...start,extent:-1},{...start,drained:1},{...start,collected:.2}]){assert.throws(()=>validateEster(D,bad));checks++;}
for(const dt of [-1,Infinity,121]){assert.throws(()=>advanceEster(start,D,dt));checks++;}
console.log(`PASS: ${checks} esterification assertions: independent C/H/O and mass conservation; exact reversible-rate references; catalyst/equilibrium distinction; water/excess-alcohol response; partition and receiver ledgers; transfer gates, timestep consistency and invalid inputs. Model parameters remain illustrative.`);
