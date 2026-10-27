import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.schiff-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/SchiffBaseLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,expected] of [['experiment','Charge condensation vessel'],['theory','Reversible condensation and solid equilibrium'],['procedure','Virtual condensation investigation'],['data','Closed material ledger'],['assessment','What changes equilibrium conversion in this model?']]){
  globalThis.location=new URL(`http://localhost/#/simulations/benzylidene-aniline?screen=${screen}`);
  const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(expected),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('0.984 AU'));assert.ok(!html.includes('35% Schiff base'));
 }
 console.log('PASS: five dedicated Schiff-base sections render. Browser behavior and WebGL are separate gates.');
}finally{await unlink(file).catch(()=>{});}
