import assert from 'node:assert/strict';
import * as M from '../src/modules/core-simulations/saponificationModel.js';
let checks=0;const near=(a,b,t=1e-10)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);checks++;};
function prep(v){let s=M.sapBegin(M.sapInitial());s=M.sapReference(s,v,'low');s=M.sapReference(s,v,'high');s=M.sapCharge(s,'E');s=M.sapCharge(s,'B');return M.sapMix(s);}
function records(v,run,times){let s=prep(v);return times.map(t=>{s=M.sapAdvance(s,v,t-2-s.time);s=M.sapAcquire(s);s=M.sapAdvance(s,v,2);return M.sapRecord(run,v,s);});}
for(const esterStock of [.01,.04,.08])for(const baseStock of [.01,.04,.08])for(const temperature of [15,25,35])for(const cell of [.8,1.2]){
 const v=M.sapValues({...M.SAP_DEFAULTS,esterStock,baseStock,temperature,cell}),r=M.sapRecipe(v);let prior=0;
 for(const t of [0,2,22,120,480,1800,3600]){const z=M.sapSpecies(v,t);near(z.charge,0);near(z.mass,z.initialMass);near(z.C,4*r.E);near(z.H,8*r.E+r.B);near(z.O,2*r.E+r.B);assert.ok(z.x>=prior&&z.E>=0&&z.B>=0);prior=z.x;checks++;}
 const s=prep(v),cal=M.sapCalibration(s);assert.ok(cal.valid);near(M.sapInventory(s).total,400);assert.ok(Math.abs(cal.slope-v.cell/v.gain)<.01);checks++;
}
// Independent RK4: not another copy of the analytic extent expression.
for(const [a,b]of [[.02,.02],[.01,.04],[.04,.01]]){let x=0;const dt=.1,k=.11,rate=x=>k*(a-x)*(b-x);for(let i=0;i<4800;i++){const p=rate(x),q=rate(x+dt*p/2),r=rate(x+dt*q/2),s=rate(x+dt*r);x+=dt*(p+2*q+2*r+s)/6;}near(M.sapExtent(a,b,k,480),x,1e-11);}
const v=M.sapValues(M.SAP_DEFAULTS),times=[2,12,22,62,122,242,482],base=records(v,1,times),fit=M.sapFit(base,1);assert.equal(fit.best,2);near(fit.models[2].k,.11,5e-4);checks++;
// Inference must not read the generator rate after a measurement exists.
for(const r of base){const inferred=M.sapConcentration(r),truth=M.sapSpecies(r.values,r.state.reading.time).B;assert.ok(truth>=inferred.bRange[0]-1e-12&&truth<=inferred.bRange[1]+1e-12);checks++;}
const changed=base.map(r=>({...r,values:{...r.values,k25:.29,Ea:69000}}));near(M.sapFit(changed,1).models[2].k,fit.models[2].k);
const doubleE=records({...v,esterStock:.08},2,times),doubleB=records({...v,baseStock:.08},3,times),all=[...base,...doubleE,...doubleB];
near(M.sapOrderPair(all,1,2,'E').order,1,.1);near(M.sapOrderPair(all,1,3,'B').order,1,.1);assert.ok(M.sapFit(doubleE,2).unequal);assert.equal(fit.resolutionLimited,false);const coarse=M.sapValues({...v,esterStock:.015,baseStock:.015,temperature:15.5,cell:.81,gain:.905,offset:-.029,resolution:.01,k25:.055,Ea:21000});assert.equal(M.sapFit(records(coarse,5,[3,15,27,89,151,273,515]),5).resolutionLimited,true);near(M.sapFit(doubleE,2).models[0].k,.11,.001);
const biased=M.sapValues({...v,gain:.91,offset:-.025,cell:1.19,resolution:.0001}),br=records(biased,4,times);near(M.sapFit(br,4).models[2].k,.11,.0001);
const n={...M.sapNotebook(),records:all,notes:'Measured regression'};assert.equal(M.parseSapNotebook(JSON.stringify(n)).records.length,21);assert.ok(M.sapCsv(n).includes('raw_conductance_mS'));
const dup=structuredClone(n);dup.records.push(dup.records[0]);assert.throws(()=>M.parseSapNotebook(dup));const tampered=structuredClone(n);tampered.records[0].state.reading.signal+=.01;assert.throws(()=>M.parseSapNotebook(tampered));const wrongRef=structuredClone(n);wrongRef.records[0].state.calibration[0].signal+=.001;assert.throws(()=>M.parseSapNotebook(wrongRef));
assert.throws(()=>M.sapMix(M.sapInitial()));assert.throws(()=>M.sapValues({...v,k25:NaN}));assert.throws(()=>M.sapValues({...v,resolution:0}));assert.throws(()=>M.sapRecord(1,v,prep(v)));
let s=prep(v);s=M.sapAcquire(s);const once=M.sapAdvance(s,v,10),twice=M.sapAdvance(M.sapAdvance(s,v,1),v,9);assert.deepEqual(once,twice);near(once.reading.time,2);assert.ok(once.time>once.reading.time);
console.log(`PASS: ${checks} counted saponification balances, boundaries, inference, calibration and timing checks; independent RK4, early-order pairs, quantized data fits and invalid-notebook guards pass.`);
