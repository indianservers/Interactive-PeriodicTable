import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {studioEntries,labEntries} from '../src/data/experienceDirectory.js';
const result=await build({stdin:{contents:`import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import Directory from './src/components/ExperienceDirectory.jsx';export const studios=renderToStaticMarkup(<Directory/>);export const labs=renderToStaticMarkup(<Directory kind="labs"/>);export const pharma=renderToStaticMarkup(<Directory query="Pharmaceutical Chemistry Lab"/>);`,resolveDir:process.cwd(),loader:'jsx'},bundle:true,write:false,platform:'node',format:'cjs',jsx:'automatic',loader:{'.css':'empty'},logLevel:'silent'});
const out={exports:{}};new Function('require','module','exports',result.outputFiles[0].text)(createRequire(import.meta.url),out,out.exports);
assert.equal((out.exports.studios.match(/<a /g)||[]).length,studioEntries.length);
assert.equal((out.exports.labs.match(/<a /g)||[]).length,labEntries.length);
assert((out.exports.pharma.match(/<a /g)||[]).length>=1);
for(const html of [out.exports.studios,out.exports.labs,out.exports.pharma])assert(html.includes('href="#/visuals/pharma"'));
assert(out.exports.labs.includes('href="#/lab/titration"'));
console.log(`PASS: React renders all ${studioEntries.length} studio links and ${labEntries.length} lab links; pharmaceutical search returns its real route; titration remains directly linked.`);

