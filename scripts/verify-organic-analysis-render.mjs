import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.organic-analysis-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/OrganicAnalysisLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,heading] of [['experiment','Prepare selected portion'],['theory','Functional groups need orthogonal evidence'],['procedure','Investigate the virtual unknown'],['data','Controlled evidence'],['assessment','Identify Unknown']]){
  globalThis.location=new URL(`http://localhost/#/simulations/organic-qualitative-analysis?screen=${screen}`);const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(heading),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('0.102 mol/L'));assert.ok(!html.includes('titreCurve'));
 }
 console.log('PASS: five dedicated organic-analysis sections render; no generic concentration result or invented titration plot. Browser apparatus/control checks are separate.');
}finally{await unlink(file).catch(()=>{});}
