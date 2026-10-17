import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {comparisonGraphData} from '../src/modules/pharma-lab/simulation/comparisonGraph.js';
import {compareStudyPreset} from '../src/modules/pharma-lab/simulation/studyPresetModels.js';
import {fitPublishedStability,synthesisMassComparison} from '../src/modules/pharma-lab/simulation/publishedComparison.js';
const read=name=>JSON.parse(fs.readFileSync(new URL('../src/modules/pharma-lab/data/'+name,import.meta.url)));
test('All 21 presets graph the same observations and fitted results without mutation',()=>{
 for(const presets of Object.values(read('studyModelPresets.json')))for(const p of presets){const r=compareStudyPreset(p),before=JSON.stringify(r.results),g=comparisonGraphData(r.results);assert.equal(JSON.stringify(r.results),before);assert.equal(g.points.length,p.observations.length);assert.equal(g.hasModel,true);for(const v of g.points){assert.ok(g.yDomain[0]<=v.y-(v.sd??0));assert.ok(g.yDomain[1]>=v.y+(v.sd??0));assert.ok(g.yDomain[0]<=v.calculated&&g.yDomain[1]>=v.calculated);}}
});
test('Missing uncertainty remains absent; real SD determines error-bar extent',()=>{
 const pk=comparisonGraphData(read('studyModelPresets.json').adme[0].observations);assert.equal(pk.hasSd,false);assert.equal(pk.hasModel,false);
 const g=comparisonGraphData([{x:1,y:101.14,sd:.54,calculated:99}]);assert.equal(g.hasSd,true);assert.ok(g.yDomain[1]>101.68);assert.equal(g.points[0].y,101.14);assert.ok(g.xDomain[0]<1&&g.xDomain[1]>1);
 assert.throws(()=>comparisonGraphData([{x:1,y:2,sd:-1}]),/nonnegative/);
});
test('All stability groups preserve reported SD and synthesis remains a single quantity check',()=>{
 const d=read('publishedExperiments.json');for(let i=0;i<4;i++){const r=fitPublishedStability(d.stability,i),g=comparisonGraphData(r.results.map(p=>({...p,x:p.month,y:p.mean})));assert.equal(g.points.length,4);assert.equal(g.hasSd,true);}
 const remaining=read('remainingPublishedExperiments.json'),identity=read('verifiedCompoundIdentities.json').compounds.find(p=>p.CID===1983),r=synthesisMassComparison(remaining['api-synthesis'],identity),g=comparisonGraphData([{x:r.amountMmol,y:r.reportedGrams,calculated:r.calculatedGrams}]);assert.equal(g.points.length,1);assert.equal(g.hasSd,false);
});
