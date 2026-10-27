import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.azo-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/AzoCouplingLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,expected] of [['experiment','Charge virtual stocks'],['theory','Diazotisation, coupling and competing loss'],['procedure','Virtual azo-dye investigation'],['data','Closed species ledger'],['assessment','Where does β-naphthol form the new azo bond?']]){
  globalThis.location=new URL(`http://localhost/#/simulations/azo-coupling-naphthol?screen=${screen}`);
  const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(expected),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('7.26 pH'));assert.ok(!html.includes('20% azo dye'));
 }
 console.log('PASS: five dedicated azo-coupling sections render. WebGL, browser actions and responsive checks remain separate gates.');
}finally{await unlink(file).catch(()=>{});}
