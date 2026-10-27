import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.hydrolysis-render-${process.pid}.mjs`);globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{const bundle=await build({entryPoints:['src/modules/core-simulations/MethylHydrolysisLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});await writeFile(file,bundle.outputFiles[0].text);const {default:Lab,validateHydrolysisWorkspace}=await import(pathToFileURL(file));
 for(const [screen,heading]of [['experiment','Draw reaction aliquot'],['theory','Reaction, sampling and rate law'],['procedure','Virtual experiment workflow'],['data','Recorded run'],['assessment','Explain the acid blank']]){globalThis.location=new URL(`http://localhost/#/simulations/methyl-acetate-hydrolysis?screen=${screen}`);const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(heading),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('0.984 AU'));}
 assert.throws(()=>validateHydrolysisWorkspace({}));console.log('PASS: five dedicated hydrolysis sections render, invalid workspace rejected; browser and full fidelity gates remain separate.');
}finally{await unlink(file).catch(()=>{});}
