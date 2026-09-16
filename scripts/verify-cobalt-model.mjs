import assert from 'node:assert/strict';
import {octahedral,tetrahedral,equilibrium,absorbance} from '../src/components/inorganic/cobaltModel.js';
assert.equal(octahedral.length,6);assert.equal(tetrahedral.length,4);
for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)assert(Math.abs(tetrahedral[i].reduce((n,x,k)=>n+x*tetrahedral[j][k],0)+1/3)<1e-12);
for(const temp of [0,25,60,100]){let previous=-1;for(const chloride of [.001,.05,.5,1,2]){const state=equilibrium(chloride,temp);assert(state.blue>=previous);assert(Math.abs(state.blue+state.pink-1)<1e-12);previous=state.blue;}}
assert(equilibrium(1,60).blue>equilibrium(1,25).blue);
assert(absorbance(510,0).mixture>absorbance(685,0).mixture);
assert(absorbance(685,1).mixture>absorbance(510,1).mixture);
console.log('PASS: geometry, 109.47° tetrahedral angles, chloride/temperature monotonicity, normalized fractions, absorption ordering');
