import assert from 'node:assert/strict';
import {SALT_CASES,SALT_IONS,SALT_TESTS,saltCase,saltInventory,saltReaction,confirmSaltTest,evaluateSaltIdentification} from '../src/modules/core-simulations/saltAnalysisModel.js';
let checks=0;const near=(a,b)=>{assert.ok(Math.abs(a-b)<1e-12,`${a} != ${b}`);checks++;};
const expected=[['chloride','sulfate','copper','sodium'],['chloride','iron','nitrate','sodium'],['chloride','sulfate','nickel','sodium'],['chloride','barium','nitrate','sodium'],['carbonate','nitrate','sodium','potassium']];
for(let seed=1;seed<=5;seed++){
 const sample=saltCase(seed);assert.equal(sample,SALT_CASES[seed-1]);checks++;
 const inventory=saltInventory(seed,.01,1);near(Object.entries(inventory).reduce((q,[ion,n])=>q+n*SALT_IONS[ion].charge,0),0);
 const evidence=[];
 for(const [test,spec] of Object.entries(SALT_TESTS)){
  const input={seed,concentration:.01,volume:1,test,condition:spec.condition,reagentVolume:.5};
  const result=saltReaction(input);assert.equal(result.valid,true);assert.equal(result.positive,expected[seed-1].includes(test));checks+=2;
  assert.deepEqual(result,saltReaction(input));checks++;
  if(result.positive){
   const confirmed=test==='chloride'?confirmSaltTest(result,'ammonia'):test==='carbonate'?confirmSaltTest(result,'limewater'):test==='copper'?confirmSaltTest(result,'complex'):result;
   evidence.push(confirmed);
  }
  for(const condition of ['untreated','acidic','ammoniacal'].filter(c=>c!==spec.condition)){
   const invalid=saltReaction({...input,condition});assert.equal(invalid.valid,false);assert.equal(invalid.positive,false);checks+=2;
  }
  for(const concentration of [.002,.025])for(const volume of [.5,2.5])for(const reagentVolume of [.05,1]){
   const r=saltReaction({...input,concentration,volume,reagentVolume});
   const finite=v=>typeof v==='number'?Number.isFinite(v):v&&typeof v==='object'?Object.values(v).every(finite):true;assert.ok(finite(r));checks++;
   if(r.valid){assert.ok(r.reactedMoles>=0&&r.reactedMoles<=r.analyteMoles+1e-15);assert.ok(r.precipitateMassMg>=0);checks+=2;}
  }
 }
 const claim=Object.keys(sample.ions);assert.equal(evaluateSaltIdentification(seed,claim,evidence).complete,true);assert.equal(evaluateSaltIdentification(seed,claim,[]).complete,false);assert.equal(evaluateSaltIdentification(seed,['Cu'],evidence).correct,false);checks+=3;
}
const chloride=saltReaction({seed:2,concentration:.01,volume:.5,test:'chloride',condition:'acidic'});near(chloride.precipitateMassMg,2.1498);
const limited=saltReaction({seed:2,concentration:.025,volume:2.5,test:'chloride',condition:'acidic',reagentVolume:.05});near(limited.reactedMoles,.1*.05/1000);
const gas=saltReaction({seed:5,concentration:.01,volume:1,test:'carbonate',condition:'untreated'});near(gas.gasMoles,.00001);
const emission=saltReaction({seed:5,concentration:.01,volume:1,test:'potassium',condition:'untreated'});assert.equal(emission.color,SALT_CASES[4].color);assert.ok(emission.emissionColor);checks+=2;
const invalidCu=saltReaction({seed:1,concentration:.025,volume:2.5,test:'copper',condition:'ammoniacal',reagentVolume:.05});assert.equal(invalidCu.valid,false);checks++;
for(const seed of [0,-1,1.2,10000,NaN]){assert.throws(()=>saltCase(seed),RangeError);checks++;}
for(const concentration of [0,.001,.026,NaN,Infinity]){assert.throws(()=>saltInventory(1,concentration,1),RangeError);checks++;}
for(const volume of [0,.49,2.51,NaN,Infinity]){assert.throws(()=>saltInventory(1,.01,volume),RangeError);checks++;}
assert.throws(()=>confirmSaltTest(chloride,'limewater'),RangeError);checks++;
console.log(`PASS: five electroneutral salt cases, all ten tests, confirmation/evidence scoring, reagent limits and boundaries; ${checks} assertions.`);
