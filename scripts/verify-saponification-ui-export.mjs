import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {parseSapNotebook,sapFit,sapOrderPair} from '../src/modules/core-simulations/saponificationModel.js';
const root='docs/chemistry-91-audit/',raw=JSON.parse(await readFile(root+'saponification-ui-notebook.json','utf8')),n=parseSapNotebook(raw),[header,...rows]=(await readFile(root+'saponification-ui-notebook.csv','utf8')).trim().split(/\r?\n/).map(l=>l.split(','));assert.equal(rows.length,n.records.length);let checks=0;
for(let i=0;i<rows.length;i++){
 const r=n.records[i],v=r.values,[a,b]=r.state.calibration,g=r.state.reading.signal,slope=(b.kappa-a.kappa)/(b.signal-a.signal),kappa=a.kappa+slope*(g-a.signal),factor=1+.02*(v.temperature-25),OH=v.baseStock/2,E=v.esterStock/2,extent=((50.1+198.5)*factor*OH-kappa)/((198.5-40.9)*factor),row=Object.fromEntries(header.map((key,j)=>[key,rows[i][j]]));
 const expected={run:r.run,observed_time_s:r.state.reading.time,raw_conductance_mS:g,temperature_C:v.temperature,initial_ester_M:E,initial_OH_M:OH,calibrated_kappa_mS_cm:kappa,inferred_ester_M:E-extent,inferred_OH_M:OH-extent,inferred_extent_M:extent};
 for(const [key,value]of Object.entries(expected)){assert.ok(Math.abs(Number(row[key])-value)<1e-12,`${i}: ${key}`);checks++;}assert.equal(row.included,String(r.included));
}
const fit=sapFit(n.records,1),coarse=sapFit(n.records,4),report={records:n.records.length,numericColumnsChecked:checks,equalReactantBestOrder:fit.best,estimatedK:fit.models[2].k,partialOrderE:sapOrderPair(n.records,1,2,'E').order,partialOrderOH:sapOrderPair(n.records,1,3,'B').order,coarseResolutionLimited:coarse.resolutionLimited};assert.equal(report.equalReactantBestOrder,2);assert.ok(Math.abs(report.estimatedK-.11)<.001);assert.equal(report.coarseResolutionLimited,true);
const forged=structuredClone(raw);forged.records[0].state.reading.signal+=.01;assert.throws(()=>parseSapNotebook(forged));await writeFile(root+'saponification-forged-notebook.json',JSON.stringify(forged));await writeFile(root+'saponification-export-check.json',JSON.stringify(report,null,2));console.log(report);
