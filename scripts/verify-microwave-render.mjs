import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.microwave-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/MicrowaveReactionLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,expected] of [['experiment','Load matched charges'],['theory','Thermal acceleration, without an automatic microwave bonus'],['procedure','Virtual heating comparison'],['data','Material and sensible-energy ledgers'],['assessment','What does a fair thermal comparison require?']]){
  globalThis.location=new URL(`http://localhost/#/simulations/microwave-aspirin?screen=${screen}`);
  const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(expected),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('86.4 %'));assert.ok(!html.includes('55% conversion'));
 }
 console.log('PASS: five dedicated microwave/thermal sections render. Real browser, 3D and responsive checks remain separate gates.');
}finally{await unlink(file).catch(()=>{});}
