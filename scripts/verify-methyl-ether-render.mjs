import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {writeFile,unlink} from 'node:fs/promises';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const file=resolve(`.methyl-ether-render-${process.pid}.mjs`);
globalThis.localStorage={getItem:()=>null,setItem:()=>{}};
try{
 const bundle=await build({entryPoints:['src/modules/core-simulations/MethylEtherLab.jsx'],bundle:true,write:false,platform:'node',format:'esm',packages:'external',jsx:'automatic',loader:{'.css':'empty'}});
 await writeFile(file,bundle.outputFiles[0].text);const {default:Lab}=await import(pathToFileURL(file));
 for(const [screen,expected] of [['experiment','Activate virtual precursor'],['theory','Naphthoxide attacks methyl carbon'],['procedure','Virtual methylation investigation'],['data','Material inventory'],['assessment','Which bond is formed in the Williamson methylation?']]){
  globalThis.location=new URL(`http://localhost/#/simulations/naphthyl-methyl-ether?screen=${screen}`);
  const html=renderToStaticMarkup(React.createElement(Lab));assert.ok(html.includes(expected),screen);assert.ok(html.includes('Experiment sections'));assert.ok(!html.includes('24.8 mL'));
 }
 console.log('PASS: five methyl-ether sections render with their domain-specific content; browser behavior and WebGL remain separate acceptance gates.');
}finally{await unlink(file).catch(()=>{});}
