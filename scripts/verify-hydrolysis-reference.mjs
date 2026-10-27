import assert from 'node:assert/strict';
import { syllabusInteractiveById } from '../src/modules/core-simulations/syllabusInteractiveModel.js';

const spec = syllabusInteractiveById['methyl-acetate-hydrolysis'];
let cases = 0;
for (const kobs of [.01, .045, .2]) for (const tinf of [20, 32, 45]) for (const time of [0, 2, 8]) {
  const result = spec.compute({ kobs, tinf, time });
  assert.equal(result.chart.length, 41);
  assert.deepEqual(result.chart[0], { x: 0, y: 8 });
  for (let i = 1; i < result.chart.length; i++) {
    const p = result.chart[i];
    assert.ok(Number.isFinite(p.x) && Number.isFinite(p.y));
    assert.ok(p.y >= result.chart[i - 1].y && p.y < tinf);
    const inferred = Math.log((tinf - 8) / (tinf - p.y)) / p.x;
    assert.ok(Math.abs(inferred - kobs) < 1e-12);
  }
  assert.ok(Math.abs(result.chart.at(-1).y - (8 + (tinf - 8) * (1 - Math.exp(-8 * kobs)))) < 1e-12);
  assert.equal(result.xLabel, 'Reaction time (h)');
  assert.equal(result.yLabel, 'Model titre (mL)');
  cases++;
}
console.log(`PASS: ${cases} hydrolysis reference combinations: plot-point contract, catalyst blank, monotonicity, limiting titre and independently recovered input rate. This does not validate a sampling/titration workflow.`);
