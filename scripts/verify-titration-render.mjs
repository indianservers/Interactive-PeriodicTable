// Server rendering checks are deliberately separate from pending browser interaction tests.
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { writeFile, unlink } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { TITRATION_EXPERIMENTS } from '../src/modules/core-simulations/titrationExperimentModel.js';
const bundle=resolve(`.chemistry91-render-${process.pid}.mjs`);
const storage=new Map();
globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>storage.set(key,value)};
let checks=0;
try{
 const result=await build({entryPoints:['src/modules/core-simulations/TitrationExperimentLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(bundle,result.outputFiles[0].text);
 const {default:Lab}=await import(pathToFileURL(bundle));
 for(const [id,spec] of Object.entries(TITRATION_EXPERIMENTS)){
  for(const screen of ['experiment','theory','procedure','data','assessment']){
   globalThis.location=new URL(`http://localhost:5189/#/simulations/${id}?screen=${screen}`);
   const html=renderToStaticMarkup(React.createElement(Lab,{experimentId:id}));
   assert.ok(html.includes(spec.name));assert.ok(html.includes('Experiment sections'));
   if(screen==='experiment'){assert.ok(html.includes('Sample mass percentage')===['carbonate','bicarbonate'].includes(spec.type));assert.ok(html.includes('Dispensing speed'));}
   if(screen==='data'){assert.ok(html.includes('Observation notebook'));assert.ok(html.includes('0.0204 mL'));}
   checks++;
  }
 }
 console.log(`PASS: ${checks} server-rendered titration sections across all nine routes. Browser controls and WebGL still require separate verification.`);
}finally{await unlink(bundle).catch(()=>{});}
