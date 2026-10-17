import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {compareStudyPreset,fitStudyModel,predictWithinStudy} from '../src/modules/pharma-lab/simulation/studyPresetModels.js';
const presets=JSON.parse(fs.readFileSync(new URL('../src/modules/pharma-lab/data/studyModelPresets.json',import.meta.url)));
test('All ten previously unmatched labs have sourced finite study-local comparisons',()=>{
  assert.equal(Object.keys(presets).length,10);
  for(const ps of Object.values(presets))for(const p of ps){
    assert.ok(p.sources.every(s=>s.sourceUrl.startsWith('https://')));
    const before=JSON.stringify(p),r=compareStudyPreset(p);
    assert.equal(JSON.stringify(p),before);assert.equal(r.independentValidation,false);
    assert.ok(Number.isFinite(r.trainingRmse));assert.ok(Number.isFinite(r.leaveOneOutRmse));
    assert.equal(r.results.length,p.observations.length);
    assert.throws(()=>predictWithinStudy(p,r.domain[0]-1),/Outside/);
  }
});
test('Leave-one-out really refits without the held observation and flags endpoint extrapolation',()=>{
  const p=presets.hplc[0],r=compareStudyPreset(p),held=r.results[0];
  const expected=fitStudyModel(p.model,p.observations.slice(1)).predict(held.x);
  assert.equal(held.heldOut,expected);assert.equal(held.foldExtrapolation,true);
  assert.notEqual(held.heldOut,held.calculated);
  assert.equal(r.results[2].foldExtrapolation,false);
});
test('Censored PK and animal controls are not invented zero observations',()=>{
  assert.equal(presets.adme[0].observations.length,13);
  assert.equal(presets.adme[0].excluded.length,2);
  assert.ok(presets.adme[0].observations.every(p=>p.x>0&&p.x<24&&p.sd===null));
  assert.equal(presets.adme[0].observations.find(p=>p.x===4).y,2110);
  assert.equal(presets.adme[0].observations.find(p=>p.x===3).y,1520);
  assert.equal(presets.toxicology[0].observations[0].x,4);
  assert.equal(presets.toxicology[0].excluded.length,1);
});
test('Correct acid-form identity and published over-100 release values survive fitting',()=>{
  const acid=presets['medicinal-chemistry'][0].observations.find(p=>p.label==='Simvastatin acid');
  assert.equal(acid.CID,64718);assert.equal(acid.x,104);
  const p=presets.dissolution[0],r=compareStudyPreset(p);
  assert.equal(p.observations.at(-1).y,101.14);
  assert.ok(r.results.every(p=>p.calculated>=0&&p.calculated<=100));
  assert.ok(r.trainingRmse>0);
});
test('Citrate volumes retain the actual table columns and sum to 100 mL',()=>{
  for(const p of presets.buffers[0].observations){
    const v=p.mixtureVolumesMl;
    assert.ok(Math.abs(v.hcl+v.citrate+v.water-100)<.002);
  }
  assert.deepEqual(presets.buffers[0].observations[0].mixtureVolumesMl,{hcl:41.3,citrate:46.809,water:11.891});
});
test('Independent synthetic identities verify numerical solvers, never enter published datasets',()=>{
  const line=fitStudyModel('linear',[{x:1,y:5},{x:2,y:8},{x:3,y:11}]);
  assert.equal(line.parameters.slope,3);assert.equal(line.parameters.intercept,2);
  const points=[.2,.5,1,2,4,8].map(x=>({x,y:5000*(Math.exp(-.2*x)-Math.exp(-4*x))}));
  const fit=fitStudyModel('bateman',points);
  assert.ok(Math.abs(fit.parameters.kaPerHour-4)<.01);
  assert.ok(Math.abs(fit.parameters.kePerHour-.2)<.001);
});
