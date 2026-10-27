import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parseClockNotebook,clockRecipe,clockSpecies,clockEstimate,clockPartialOrder,fitClockArrhenius} from '../src/modules/core-simulations/persulfateClockModel.js';
const root='docs/chemistry-91-audit/',raw=JSON.parse(await readFile(root+'iodine-clock-ui-notebook.json','utf8')),n=parseClockNotebook(raw);
const [header,...lines]=(await readFile(root+'iodine-clock-ui-notebook.csv','utf8')).trim().split(/\r?\n/).map(l=>l.split(','));
assert.equal(lines.length,n.records.length);let checks=0;
for(let i=0;i<lines.length;i++){
 const r=n.records[i],v=r.values,s=clockSpecies(v,r.state.time),recipe=clockRecipe(v),e=clockEstimate(r),row=Object.fromEntries(header.map((k,j)=>[k,lines[i][j]]));
 const expected={run:r.run,temperature_C:v.temperature,reaction_clock_s:r.state.time,P0_M:recipe.P,I0_M:recipe.I,thio0_M:recipe.S,P_M:s.P,I_M:s.I,thio_M:s.thio,sulfate_M:s.sulfate,tetrathionate_M:s.tetra,iodine_equiv_M:s.iodine};
 if(r.type==='event')Object.assign(expected,{observed_onset_s:r.observedTime,assumed_model_k_L_mol_s:e.k,initial_rate_proxy_M_s:e.initialRateProxy});
 for(const [key,value] of Object.entries(expected)){assert.ok(Math.abs(Number(row[key])-value)<1e-12,`${i}: ${key}`);checks++;}
 assert.equal(row.kind,r.type);assert.equal(row.include_temperature_fit,String(r.included));assert.equal(row.subtract_dead_time,'true');
 assert.ok(Math.abs(s.charge)<1e-12);assert.ok(Math.abs(s.mass-s.initialMass)<1e-12);
}
const events=n.records.filter(r=>r.type==='event'),base=events.find(r=>r.run===1),p=events.find(r=>r.run===2),iodide=events.find(r=>r.run===3);
const report={records:n.records.length,numericColumnsChecked:checks,partialOrderP:clockPartialOrder(base,p,'P').order,partialOrderI:clockPartialOrder(base,iodide,'I').order,correctedEa:fitClockArrhenius(n.records).activationEnergy,uncorrectedEa:fitClockArrhenius(n.records,false).activationEnergy};
assert.ok(Math.abs(report.partialOrderP-1)<.01);assert.ok(Math.abs(report.partialOrderI-1)<.01);assert.ok(Math.abs(report.correctedEa-50000)<100);
const forged=structuredClone(raw);forged.records.find(r=>r.type==='event').observedTime+=1;assert.throws(()=>parseClockNotebook(forged));await writeFile(root+'iodine-clock-forged-notebook.json',JSON.stringify(forged));
await writeFile(root+'iodine-clock-export-check.json',JSON.stringify(report,null,2));console.log(report);
