import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import katex from 'katex';
import { createSetup, randomizeSetup, minimizeSetup, equilibrateSetup, setupEnergy, setupTemperature } from '../src/modules/core-simulations/mdSetup.js';
import { mechanismState, mechanismMol } from '../src/utils/mechanismStates.js';
import { reactionOutcome } from '../src/modules/core-simulations/reactionLeftoversModel.js';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

let checks=0;
for(const density of [.3,.8,1.2]) {
  const initial=createSetup(108,density,42), prepared=randomizeSetup(initial,120,42), minimized=minimizeSetup(prepared);
  assert.deepEqual(randomizeSetup(initial,120,42),prepared,'Seeded velocities must be reproducible');
  assert.notDeepEqual(randomizeSetup(initial,120,43).velocities,prepared.velocities);
  assert(Math.abs(setupTemperature(prepared)-120)<1e-8);
  for(let k=0;k<3;k++)assert(Math.abs(prepared.velocities.reduce((n,v)=>n+v[k],0))<1e-8,'No center-of-mass drift');
  assert(setupEnergy(minimized).energy<=setupEnergy(prepared).energy);
  const final=equilibrateSetup(minimized,120);
  assert.notDeepEqual(final.positions,minimized.positions,'Equilibration must move the particles');
  assert.equal(final.steps,100);assert(Math.abs(setupTemperature(final)-120)<1e-8);
  assert(final.positions.flat().every(v=>Number.isFinite(v)&&v>=0&&v<final.length));checks++;
}
const start=mechanismState('sn2',0), end=mechanismState('sn2',3);
assert.equal(start.atoms.filter(a=>a[0]==='C').length,4,'SN2 substrate must contain all four carbons');
assert(start.bonds.some(([a,b])=>a===0&&b===1));
assert(!end.bonds.some(([a,b])=>a===0&&b===1),'No C–Br product bond');
assert(end.bonds.some(([a,b])=>a===0&&b===2),'C–O product bond');
assert(start.atoms[3][1]<0&&end.atoms[3][1]>0,'Spectator groups invert through the reaction plane');
for(const id of ['sn2','sn1','e2'])for(let stage=0;stage<4;stage++) {
  const {atoms,bonds}=mechanismState(id,stage);
  assert.equal(new Set(bonds.map(([a,b])=>[a,b].sort((x,y)=>x-y).join('-'))).size,bonds.length,'No duplicate bonds');
  assert(bonds.every(([a,b])=>a!==b&&a<atoms.length&&b<atoms.length));
  assert(atoms.every(a=>a.slice(1).every(Number.isFinite)));assert.match(mechanismMol(id,stage).data,/V2000/);checks++;
}
assert.equal(mechanismState('e2',3).bonds.find(([a,b])=>a===0&&b===1)[2],2);
assert(!mechanismState('e2',3).bonds.some(([a,b])=>a===1&&b===3));
const outcome=reactionOutcome('methane',{'CH₄':5,'O₂':8});assert.equal(outcome.limiting,'O₂');assert.equal(outcome.products['CO₂'],4);assert.equal(outcome.products['H₂O'],8);assert.equal(outcome.leftovers['CH₄'],1);
const crystal=readFileSync('src/pages/CrystalTargetPage.jsx','utf8');
const tex=crystal.match(/String\.raw`([^`]+)`/)[1].replace('${properties.density.toFixed(2)}','2.16');
const rendered=katex.renderToString(tex,{throwOnError:true});assert(!rendered.includes('katex-error'));assert(rendered.includes('cm'));
console.log(`PASS: ${checks} dynamics and mechanism cases; seeded velocities, conserved momentum, temperature, energy minimization, integrated motion, periodic bounds, SN2 inversion/connectivity, E2 bond changes, limiting-reagent answer and crystal TeX.`);
const storage=new Map();globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
for(const [file,expected,absent] of [
  ['src/pages/SaltAnalysisTargetPage.jsx','Ba²⁺ suspected — confirmation required','Ba²⁺ confirmed by sulfate test'],
  ['src/modules/chemistry-solver/ChemistrySolverTargetPage.jsx','20.0 mL',null],
  ['src/pages/OrganicReactionTargetPage.jsx','Benzaldehyde + acetophenone','Prediction pending'],
  ['src/pages/IupacTargetPage.jsx','Alkane example',null],
  ['src/components/common/FormulaSheet.jsx','Chemistry Formula Sheet',null],
]) {
  const bundle=resolve(`.intern-render-${process.pid}.mjs`);
  try {
    const result=await build({entryPoints:[file],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
    await writeFile(bundle,result.outputFiles[0].text);
    const {default:Page}=await import(`${pathToFileURL(bundle)}?case=${encodeURIComponent(file)}`);
    const html=renderToStaticMarkup(React.createElement(Page,{onClose:()=>{},onNavigate:()=>{}}));
    assert(html.includes(expected),`${file} must render ${expected}`);
    if(absent)assert(!html.includes(absent),`${file} must not render ${absent}`);
  }finally{await unlink(bundle).catch(()=>{});}
}
console.log('PASS: five rendered regression cases: unconfirmed salt, visible 20.0 mL titration answer, explicit crossed-aldol partner, functional-group example, and real formula reference.');
