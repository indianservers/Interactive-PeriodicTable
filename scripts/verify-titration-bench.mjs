import assert from 'node:assert/strict';
import {titrationState} from '../src/utils/titrationModel.js';
assert.ok(titrationState(0).ph>12);assert.ok(Math.abs(titrationState(23.4).ph-7)<1e-8);assert.ok(titrationState(40).ph<2);
assert.equal(titrationState(0).indicator,'Pink');assert.equal(titrationState(23.4).indicator,'Colourless');assert.ok(Math.abs(titrationState(23.4).estimatedBaseM-.0936)<1e-12);
let previous=14;for(let i=0;i<=4000;i++){const state=titrationState(i/100);assert.ok(Number.isFinite(state.ph)&&state.ph<=previous+1e-10);assert.ok(state.pinkFraction>=0&&state.pinkFraction<=1);previous=state.ph;}
assert.ok(Math.abs(titrationState(0).equivalenceMl-23.4)<1e-12);
console.log('PASS: descending acid-into-base curve, neutral equivalence, indicator endpoint, concentration balance and 4001 finite states.');
