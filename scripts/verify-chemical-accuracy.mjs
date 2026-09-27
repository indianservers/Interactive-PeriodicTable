import { stabilityFor } from "../src/data/lightNuclides.js";
import assert from 'node:assert/strict';
import { standards, spectrum, linearRegression, unknownFromAbsorbance, UNKNOWN_MEAN, CALIBRATION_INTERCEPT } from '../src/modules/core-simulations/beerLambertModel.js';
import { solveSolution, acetateBuffer, strongAcidTitration } from '../src/modules/core-simulations/acidBaseModel.js';
import { molecularPartition } from '../src/modules/core-simulations/statisticalThermodynamicsModel.js';
import { aromaticPrepYield } from '../src/modules/core-simulations/aromaticPrepModel.js';
import { unknownResult, linearRegression as polarFit } from '../src/modules/core-simulations/polarographyModel.js';
import { recrystallisation } from '../src/modules/core-simulations/distillationModel.js';
import { bedVolume, COMPONENTS } from '../src/modules/core-simulations/chromatographyModel.js';
import { salinityClass } from '../src/modules/core-simulations/soilAnalysisModel.js';
import { BIOCHEMISTRY_VIRTUAL_LABS, defaultValuesForLab } from '../src/data/biochemistryVirtualLabs.js';
import { calculateLab } from '../src/data/biochemistryCalculations.js';
import { syllabusInteractives, syllabusConcepts } from '../src/modules/core-simulations/syllabusInteractiveModel.js';
import { MODELS, initialInputs, solve } from '../src/modules/physical-chemistry/workspaceModels.js';

const near = (actual, expected, tolerance = 1e-9) => assert(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
const noInvalid = (result, label) => assert(!/NaN|Infinity|undefined/.test(JSON.stringify(result)), label);
near(spectrum(620, 4e-5, 2) - CALIBRATION_INTERCEPT, 2 * (spectrum(620, 4e-5, 1) - CALIBRATION_INTERCEPT));
assert(spectrum(500) < spectrum(620));
near(spectrum(500, 0), CALIBRATION_INTERCEPT);
assert.deepEqual(standards().slice(1).map(row => row.concentration), [1e-5, 2e-5, 4e-5, 6e-5, 8e-5]);
for (const rows of [[], standards().slice(0, 1), standards().map(row => ({...row, included:false}))]) assert.equal(linearRegression(rows).valid, false);
const fit = linearRegression(standards());
near(unknownFromAbsorbance(UNKNOWN_MEAN, fit, 20).original, 2 * unknownFromAbsorbance(UNKNOWN_MEAN, fit, 10).original);
assert.equal(unknownFromAbsorbance(0, fit).valid, false);
near(strongAcidTitration({baseVolume:25}).pH, 7);
assert(strongAcidTitration({baseVolume:24.999999}).pH < 7);
assert(strongAcidTitration({baseVolume:25.000001}).pH > 7);
for (const id of ['hcl','acetic','naoh','ammonia']) {
  for (const c of [1e-6, .1, 2]) {
    const result=solveSolution(id,c);
    near(result.h * result.oh, 1e-14, 1e-25);
    near(result.pH, -Math.log10(result.h));
    assert(result.ionisation >= 0 && result.ionisation <= 1);
  }
}
const exhausted = acetateBuffer({addedAcidMmol:50});
assert(exhausted.pH > 2 && exhausted.pH < 4);
assert(acetateBuffer({addedAcidMmol:60}).pH < exhausted.pH);
const baseOnly = acetateBuffer({addedBaseMmol:50});
assert(baseOnly.pH > 8 && baseOnly.pH < 11);
const q0=molecularPartition('N2',300,1,false), qz=molecularPartition('N2',300,1,true);
near(qz.total / q0.total, qz.zeroPointFactor);
near(qz.total / (qz.qTrans*qz.qRot*qz.qVib*qz.qElec), 1);
for (const substrate of ['phenol','aniline','acetanilide']) {
  const input={experiment:'bromination',substrate,equivalents:.5,temperature:25,minutes:12,alkali:8};
  assert(aromaticPrepYield(input).conversion <= 100 * .5 / (substrate==='acetanilide'?1:3));
  near(aromaticPrepYield({...input,minutes:0}).recovered,0);
}
const polar=unknownResult(), pf=polarFit();
near(polar.diluted,(polar.mean-pf.intercept)/pf.slope);
const crystals=recrystallisation();
near(crystals.recovery,crystals.recovered/5*100);
assert(recrystallisation({hotSolventMl:10}).recovered <= .55);
near(bedVolume(20,180),Math.PI*18);
assert.match(salinityClass(1.17),/ECe class not determined/);

const bio=(id,changes={})=>calculateLab(id,{...defaultValuesForLab(BIOCHEMISTRY_VIRTUAL_LABS.find(lab=>lab.id===id)),...changes},'Albumin');
const cuts=bio('restriction-mapping',{siteA:1200,siteB:1200});
assert.equal(cuts.metrics.find(row=>row.label==='Cut sites').value,'1');
assert.deepEqual(cuts.visual.fragments,[5000]);
assert.match(bio('restriction-mapping',{plasmid:2000,siteB:3400}).summary,/inside/);
assert.match(bio('pipetting-dilution',{v1:1000,v2:10}).summary,/Final volume/);
assert.match(bio('chromatography',{soluteDistance:9,frontDistance:1}).summary,/cannot exceed 1/);
assert(Number(bio('buffer-preparation',{acid:.01,base:.01,addition:20}).metrics[0].value)>11);
for (const lab of BIOCHEMISTRY_VIRTUAL_LABS) {
  const defaults=defaultValuesForLab(lab);
  noInvalid(calculateLab(lab.id,defaults,'Albumin'),`${lab.id}: default`);
  for(const control of lab.controls.filter(control=>control.type==='range')) for(const value of [control.min,control.max]) noInvalid(calculateLab(lab.id,{...defaults,[control.key]:value},'Albumin'),`${lab.id}: ${control.key}=${value}`);
}
for (const lab of [...syllabusInteractives,...syllabusConcepts]) {
  const defaults=Object.fromEntries(lab.controls.map(control=>[control.key,control.value]));
  noInvalid(lab.compute(defaults),lab.id);
  for(const control of lab.controls) for(const value of [control.min,control.max]) noInvalid(lab.compute({...defaults,[control.key]:value}),`${lab.id}: ${control.key}=${value}`);
}
const soda=syllabusInteractives.find(lab=>lab.id==='baking-soda-bicarbonate');
assert.match(soda.compute(Object.fromEntries(soda.controls.map(c=>[c.key,c.value]))).primary,/100.01/);
for (const slug of Object.keys(MODELS)) noInvalid(solve(slug,initialInputs(slug)),slug);
console.log(`PASS: chemistry regression cases; ${BIOCHEMISTRY_VIRTUAL_LABS.length} biochemistry and ${syllabusInteractives.length+syllabusConcepts.length} syllabus models checked at defaults and individual control limits; ${Object.keys(MODELS).length} physical workspaces checked.`);

assert.equal(stabilityFor(1,2)[0],"Unstable");
assert.equal(stabilityFor(6,8)[0],"Unstable");
assert.equal(stabilityFor(8,10)[0],"Stable");

for(let i=1;i<COMPONENTS.length;i++) assert(COMPONENTS[i].baseRf < COMPONENTS[i-1].baseRf && COMPONENTS[i].retention > COMPONENTS[i-1].retention, "TLC and column retention order must agree");
