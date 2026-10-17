import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const frames=[],context=vm.createContext({postMessage:x=>frames.push(x),setTimeout:()=>0,clearTimeout:()=>{}});vm.runInContext(readFileSync('src/modules/physical-chemistry/md.worker.js','utf8'),context);
const send=data=>context.onmessage({data});
send({type:'reset',temperature:300,volume:3.2,rate:0,realGas:false,molarMass:.039948});const ar=frames.at(-1);send({type:'volume',volume:1.6});const compressed=frames.at(-1);assert.equal(compressed.volume,1.6);assert.ok(Math.abs(compressed.pressure/ar.pressure-2)<1e-10);assert.equal(compressed.positions.length,324);assert.ok(compressed.positions.every(Number.isFinite));send({type:'volume',volume:-4});assert.equal(frames.at(-1).volume,1.2);send({type:'volume',volume:30});assert.equal(frames.at(-1).volume,3.2);
send({type:'reset',temperature:300,volume:3.2,rate:0,realGas:false,molarMass:.0201797});const ne=frames.at(-1);assert.ok(Math.abs(ne.speed[0]/ar.speed[0]-Math.sqrt(.039948/.0201797))<1e-6);
console.log('PASS: worker volume changes positions and pressure, volume clamps, Ar/Ne speed scaling, finite coordinates.');
