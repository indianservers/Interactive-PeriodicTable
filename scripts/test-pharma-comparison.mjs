import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { comparePublished, comparisonScopes, fitPublishedStability, reportedMeanSd, synthesisMassComparison } from '../src/modules/pharma-lab/simulation/publishedComparison.js';
const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const datasets={...JSON.parse(read('src/modules/pharma-lab/data/publishedExperiments.json')),...JSON.parse(read('src/modules/pharma-lab/data/remainingPublishedExperiments.json'))};
const identity=JSON.parse(read('src/modules/pharma-lab/data/verifiedCompoundIdentities.json')).compounds.find(c=>c.CID===1983);

test('every evidence lab has a scope check; ten incompatible model families produce no numerical pairing',()=>{
 assert.deepEqual(Object.keys(comparisonScopes).sort(),Object.keys(datasets).sort());
 let blocked=0;
 for(const [lab,data] of Object.entries(datasets)){
  const result=comparePublished(lab,data,{identity});
  assert.equal(result.sourceUrl,data.sourceUrl);assert.equal(result.sourceSha256,data.sourceSha256);assert.equal(result.independentValidation,false);
  if(!['stability','api-synthesis'].includes(lab)){blocked++;assert.equal(result.kind,'unmatched');assert.deepEqual(result.results,[]);assert(result.reason.length>50);assert(!('rmse' in result));assert(!('differenceGrams' in result));}
 }
 assert.equal(blocked,10);
});

test('study-specific stability fits keep groups, units, observations and source SD separate',()=>{
 const serialized=JSON.stringify(datasets.stability),rates=[];
 for(let group=0;group<4;group++){
  const result=fitPublishedStability(datasets.stability,group);rates.push(result.kPerMonth);
  assert.equal(result.temperatureC,group%2?40:30);assert.equal(result.rhPercent,75);
  assert.equal(result.baseline,103.27);assert.equal(result.fittedMonthlyMeans,3);
  assert.deepEqual(result.results.map(p=>p.month),[0,1,2,3]);
  assert.equal(result.results[0].sd,.08);assert(result.kPerMonth>0);assert(result.rmse>0);
  for(const p of result.results){assert.equal(p.calculated,result.baseline*Math.exp(-result.kPerMonth*p.month));assert.equal(p.difference,p.calculated-p.mean);assert(Number.isFinite(p.sd));}
  assert.equal(result.results.at(-1).reported,datasets.stability.groups[0].rows[group][6]);
  assert.equal(result.independentValidation,false);
 }
 assert.equal(new Set(rates).size,4);assert.equal(JSON.stringify(datasets.stability),serialized);
});

test('log-least-squares rate minimizes the stated training loss, not a fabricated accuracy score',()=>{
 const r=fitPublishedStability(datasets.stability,1);
 const loss=k=>r.results.slice(1).reduce((sum,p)=>sum+(Math.log(p.mean/r.baseline)+k*p.month)**2,0);
 assert(loss(r.kPerMonth)<loss(r.kPerMonth+.01));assert(loss(r.kPerMonth)<loss(r.kPerMonth-.01));
 const expected=Math.sqrt(r.results.slice(1).reduce((sum,p)=>sum+(p.calculated-p.mean)**2,0)/3);
 assert.equal(r.rmse,expected);
 assert.equal(r.results.at(-1).mean,89.44);
});

test('two-week data are not silently converted to fractional calendar months',()=>{
 const copy=structuredClone(datasets.stability);copy.groups[0].rows[1][3]='Not used for monthly fit';
 assert.deepEqual(fitPublishedStability(copy,1),fitPublishedStability(datasets.stability,1));
});

test('unknown protocols, wrong groups and missing uncertainty are rejected',()=>{
 assert.throws(()=>fitPublishedStability(datasets.hplc));
 for(const group of [-1,4,.5,NaN])assert.throws(()=>fitPublishedStability(datasets.stability,group));
 const copy=structuredClone(datasets.stability);copy.groups[0].rows[0][4]='102.37';assert.throws(()=>fitPublishedStability(copy,0),/mean ± SD/);
 assert.throws(()=>reportedMeanSd('Not reported'));assert.throws(()=>reportedMeanSd('100 ± unknown'));
 assert.throws(()=>comparePublished('unknown',datasets.stability));
});

test('synthesis comparison checks reported amount and mass without claiming reactor/yield validation',()=>{
 const before=JSON.stringify(datasets['api-synthesis']);const r=synthesisMassComparison(datasets['api-synthesis'],identity);
 assert.equal(r.amountMmol,6.6);assert.equal(r.reportedGrams,.99);assert.equal(r.molarMass,151.16);
 assert(Math.abs(r.calculatedGrams-.997656)<1e-12);assert(Math.abs(r.differenceGrams-.007656)<1e-12);
 assert.equal(r.independentValidation,false);assert(r.method.includes('not an independent yield or reactor prediction'));
 assert.equal(JSON.stringify(datasets['api-synthesis']),before);
 assert.throws(()=>synthesisMassComparison(datasets['api-synthesis'],{...identity,CID:3672}));
});

test('comparison view is reachable in all twelve labs and exports retain provenance',()=>{
 const switchSource=read('src/modules/pharma-lab/components/PublishedExperiment.jsx');assert(switchSource.includes("onChange('comparison')"));
 const shell=read('src/modules/pharma-lab/components/PharmaLabShell.jsx');assert(shell.includes("evidenceMode === 'comparison'"));assert(shell.includes('<ExperimentComparison'));
 for(const file of ['HplcPage.jsx','DissolutionPage.jsx','StabilityPage.jsx'])assert(read('src/modules/pharma-lab/'+file).includes('dataView === "comparison" ? <ExperimentComparison'));
 const view=read('src/modules/pharma-lab/components/ExperimentComparison.jsx');assert(view.includes('setGroup(Number(e.target.value));clear();'));assert(view.includes('publishedDataset:dataset'));assert(view.includes('independentValidation:false'));assert(view.includes('dataset.licenseUrl'));
 assert(read('src/modules/pharma-lab/labReports.js').includes('data-comparison-kind'));
});
