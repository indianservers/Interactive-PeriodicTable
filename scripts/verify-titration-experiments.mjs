import assert from 'node:assert/strict';
import { TITRATION_EXPERIMENTS, titrationDefaults, titrationState, carbonatePH, carbonateSpecies, sampleConcentration, mixtureFromTitres, standardisePermanganate } from '../src/modules/core-simulations/titrationExperimentModel.js';
let assertions=0;
const referenceEndpoints=[20,25,25,18.4,0.1*25/(6*0.016667),25,25,25,25];
const close=(a,b,t=1e-8)=>{assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);assertions++;};
for(const id of Object.keys(TITRATION_EXPERIMENTS)){
 const defaults=titrationDefaults(id),start=titrationState(id,defaults);
 assert.ok(start.endpoint>0&&start.endpoint<50);assertions++;
 close(start.endpoint,referenceEndpoints[Object.keys(TITRATION_EXPERIMENTS).indexOf(id)]);
 const eq=titrationState(id,{...defaults,delivered:start.endpoint});
 close(eq.extent,1);close(eq.remaining,0);
 if(id!=='antacid-alkali'&&id!=='carbonate-bicarbonate-mixture')close(eq.found,defaults.analyte);
 if(id==='antacid-alkali'){close(eq.found,3.16);close(eq.ph,7);}
 if(id==='copper-iodometry'){close(start.iodineMoles,defaults.analyte*defaults.aliquot/2000);close(eq.iodineMoles,0);}
 if(start.ph!==null){assert.ok(start.ph>=0&&start.ph<=14);assert.ok(Number.isFinite(eq.ph));assertions+=2;}
 for(const delivered of [0,.05,10,25,49.95,50]){
  const r=titrationState(id,{...defaults,delivered});
  assert.ok(Object.values(r).filter(x=>typeof x==='number').every(Number.isFinite));assertions++;
  assert.ok(r.remaining>=0&&r.extent>=0&&r.extent<=1);assertions++;
 }
 for(const bad of [-1,51,NaN,Infinity]){assert.throws(()=>titrationState(id,{...defaults,delivered:bad}),RangeError);assertions++;}
 assert.throws(()=>titrationState(id,{...defaults,concentration:0}),RangeError);assertions++;
 const again=titrationState(id,titrationDefaults(id));assert.deepEqual(start,again);assertions++;
}
close(standardisePermanganate(.05,25,25),.02);
assert.throws(()=>standardisePermanganate(.05,25,0),RangeError);assertions++;
const mixture=mixtureFromTitres(.1,10,25);close(mixture.carbonate,1);close(mixture.bicarbonate,.5);
assert.throws(()=>mixtureFromTitres(.1,15,25),RangeError);assertions++;
close(carbonatePH(.001,0,.001,.035),(6.35+10.33)/2,.05);
// Acid addition lowers carbonate pH throughout the titration; no discontinuous fake curve.
const curve=Array.from({length:501},(_,i)=>carbonatePH(.001,0,.1*(i/10)/1000,(25+i/10)/1000));
assert.ok(curve.every((p,i)=>!i||p<=curve[i-1]+1e-8));assertions++;
for(const id of ['washing-soda-carbonate','baking-soda-bicarbonate']){
 const d=titrationDefaults(id),base=titrationState(id,d);
 close(sampleConcentration(id,d),d.analyte);
 close(titrationState(id,{...d,sampleMass:d.sampleMass*2}).endpoint,base.endpoint*2);
 close(titrationState(id,{...d,sampleAssay:d.sampleAssay/2}).endpoint,base.endpoint/2);
 const eq=titrationState(id,{...d,delivered:base.endpoint});close(eq.assay,d.sampleAssay);
 for(const sampleMass of [0,-1,NaN,Infinity]){assert.throws(()=>sampleConcentration(id,{...d,sampleMass}),RangeError);assertions++;}
 for(const sampleAssay of [0,-1,100.01,NaN,Infinity]){assert.throws(()=>sampleConcentration(id,{...d,sampleAssay}),RangeError);assertions++;}
}
for(const ph of [1,3,6.35,8.34,10.33,13]){
 const species=carbonateSpecies(.0015,ph);close(Object.values(species).reduce((a,b)=>a+b,0),.0015,1e-15);
}
for(const id of ['washing-soda-carbonate','baking-soda-bicarbonate','carbonate-bicarbonate-mixture']){
 const d=titrationDefaults(id),n=sampleConcentration(id,d)*d.aliquot/1000,nb=id==='carbonate-bicarbonate-mixture'?d.bicarbonate*d.aliquot/1000:0;
 for(const delivered of [0,10,25,50]){
  const r=titrationState(id,{...d,delivered}),h=10**-r.ph,v=r.totalVolume/1000;
  close(Object.values(r.species).reduce((a,b)=>a+b,0),n+nb,1e-15);
  const sodium=id==='baking-soda-bicarbonate'?n:2*n+nb;
  close(h*v+sodium,1e-14/h*v+r.species['HCO₃⁻']+2*r.species['CO₃²⁻']+d.concentration*delivered/1000,1e-12);
 }
}
for(const id of ['iron-dichromate','iron-permanganate']){
 const d=titrationDefaults(id),r=titrationState(id,{...d,delivered:12.5});
 close(r.species['Fe²⁺']+r.species['Fe³⁺'],.0025);close(r.species['Fe³⁺'],d.concentration*12.5/1000*TITRATION_EXPERIMENTS[id].ratio);
}
console.log(`PASS: ${Object.keys(TITRATION_EXPERIMENTS).length} individual titration models, ${assertions} scientific and boundary assertions.`);
