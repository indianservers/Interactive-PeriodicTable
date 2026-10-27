import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.peroxide-render-${process.pid}.mjs`);globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{const bundle=await build({entryPoints:['src/modules/core-simulations/PeroxideKineticsLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,heading] of [['experiment','Load peroxide'],['theory','From peroxide to a rate constant'],['procedure','Virtual gas-collection investigation'],['data','Rate estimate from recorded data'],['assessment','What does a near-linear logarithmic plot establish?']]){globalThis.location=new URL(`http://localhost/#/simulations/h2o2-kinetics?screen=${screen}`);const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(heading),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('540 nm'));assert.ok(!html.includes('1.24 AU'));}
 console.log('PASS: five dedicated peroxide-kinetics sections render; no unrelated spectral controls or prefilled experimental series. Browser apparatus, control and responsive gates remain separate.');
}finally{await unlink(file).catch(()=>{});}
