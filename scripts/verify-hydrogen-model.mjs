import assert from 'node:assert/strict';
import {radialWave,hydrogenPlots} from '../src/modules/physical-chemistry/hydrogenModel.js';
import {initialInputs,solve} from '../src/modules/physical-chemistry/workspaceModels.js';
let states=0;
for(let n=1;n<=6;n++)for(let l=0;l<=Math.min(2,n-1);l++){
 const max=20*n*n,steps=16000,dr=max/steps;let integral=0;
 for(let i=0;i<steps;i++){const r=(i+.5)*dr;integral+=r*r*radialWave(n,l,r)**2*dr;}
 assert.ok(Math.abs(integral-1)<.00001,`Normalization n=${n} l=${l}: ${integral}`);
 const p=hydrogenPlots(n,l);assert.ok(p.radial.every(v=>Number.isFinite(v.y)&&v.y>=0));states++;
}
assert.equal(radialWave(2,0,2),0,'2s radial node at 2 a0');
assert.ok(Math.abs(radialWave(1,0,0)-2)<1e-10);
for(const [mode,ir,raman] of [[1,'Inactive','Active'],[2,'Active','Inactive'],[3,'Active','Inactive']]){
 const result=solve('molecular-spectroscopy',{...initialInputs('molecular-spectroscopy'),mode});
 const rows=Object.fromEntries(result.rows);assert.equal(rows['IR activity'],ir);assert.equal(rows['Raman activity'],raman);
}
console.log(`PASS: ${states} hydrogen states normalized, 2s radial node, and all CO2 IR/Raman selection rules.`);
