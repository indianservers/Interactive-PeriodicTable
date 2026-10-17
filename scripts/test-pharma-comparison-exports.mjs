import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {comparisonCsv,comparisonSvg,exportFilename} from '../src/modules/pharma-lab/simulation/comparisonExports.js';
import {compareStudyPreset} from '../src/modules/pharma-lab/simulation/studyPresetModels.js';
const presets=JSON.parse(fs.readFileSync(new URL('../src/modules/pharma-lab/data/studyModelPresets.json',import.meta.url)));
test('CSV exports all 21 presets with exact measured/calculated values, SD and provenance',()=>{
 for(const ps of Object.values(presets))for(const p of ps){const r=compareStudyPreset(p),csv=comparisonCsv({points:r.results,title:p.name,xLabel:p.xLabel,yLabel:p.yLabel,sources:p.sources,modelLabel:'Fitted simulation · calculated',context:p});assert.ok(csv.startsWith('\uFEFF'));assert.ok(csv.includes('reported_sd'));assert.ok(csv.includes('not independent validation'));for(const v of r.results){assert.ok(csv.includes(`"${v.y}"`));assert.ok(csv.includes(`"${v.calculated}"`));if(v.sd!=null)assert.ok(csv.includes(`"${v.sd}"`));}for(const s of p.sources)assert.ok(csv.includes(s.sourceUrl));}
});
test('CSV retains missing SD/calculation as empty and escapes commas, quotes, newlines',()=>{
 const csv=comparisonCsv({points:[{x:1,y:2,sd:null,label:'Compound, "acid"\nform'}],title:'Study',sources:[],modelLabel:'Calculated'});
 assert.ok(csv.includes('"Compound, ""acid""\nform"'));assert.ok(csv.includes('"Not run"'));assert.ok(csv.includes('SD not reported'));
});
test('Standalone SVG embeds styles, source links, labels and escaped metadata with full protocol',()=>{
 const image=comparisonSvg({plotMarkup:'<g class="graph-error-bar"><line x1="1" y1="2" x2="1" y2="3"/></g>',title:'A & B <study>',sources:[{title:'Primary source',sourceUrl:'https://example.org/source?a=1&b=2',doi:'10.1234/test',license:'CC BY'}],modelLabel:'Fitted simulation',hasModel:true,hasSd:true,context:{protocol:'Study conditions '.repeat(60)}});
 assert.ok(image.svg.includes('<style>'));assert.ok(image.svg.includes('graph-error-bar'));assert.ok(image.svg.includes('A &amp; B &lt;study&gt;'));assert.ok(image.svg.includes('href="https://example.org/source?a=1&amp;b=2"'));assert.ok(image.svg.includes('±1 reported SD'));assert.ok(image.svg.includes('not independent validation'));assert.ok(image.height>600);
 assert.equal(exportFilename('Study / 1: release'),'Study-1-release');
});
