import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.nitration-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/NitrationLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,expected] of [['experiment','Initialize reactor'],['theory','Electrophile formation'],['procedure','Virtual controlled-feed investigation'],['data','Current material balance'],['assessment','Does pausing feed immediately stop reaction heat?']]){
  globalThis.location=new URL(`http://localhost/#/simulations/nitrobenzene-nitration?screen=${screen}`);
  const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(expected),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('24.8 mL'));
 }
 console.log('PASS: five nitration sections render with their domain-specific content; browser behavior and WebGL remain separate acceptance gates.');
}finally{await unlink(file).catch(()=>{});}
