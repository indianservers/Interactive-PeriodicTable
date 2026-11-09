import assert from 'node:assert/strict';
import { prepareReaction, calculateStoichiometry } from '../src/utils/drawCalculations.js';
const reaction = prepareReaction('H2 + O2 -> H2O');
assert.deepEqual(reaction.coefficients, [2, 1, 2]);
const result = calculateStoichiometry(reaction, ['4', '32']);
assert.deepEqual(result.limiting, ['H2']);
assert.ok(Math.abs(result.products[0].grams - 35.744) < .02);
assert.ok(result.remaining[1] > 0);
const zero = calculateStoichiometry(reaction, ['0', '1'], 'mol');
assert.equal(zero.products[0].mol, 0);
assert.equal(zero.remaining[1], 1);
assert.throws(() => calculateStoichiometry(reaction, ['', '1']));
assert.throws(() => calculateStoichiometry(reaction, ['-1', '1']));
for (const invalid of ['Xx + O2 -> XxO2', 'H2 -> O2', 'H2 + -> H2O', 'Ca(OH -> CaO', '2H2 + O2 -> H2O']) assert.throws(() => prepareReaction(invalid), invalid);
assert.deepEqual(prepareReaction('Ca(OH)2 + HCl -> CaCl2 + H2O').coefficients, [1, 2, 1, 2]);
console.log('PASS: stoichiometric balancing, limiting reactants, yields, leftovers, zero amounts and invalid inputs.');
import initRDKit from '@rdkit/rdkit';
import { parseMolfile, structureMolfile } from '../src/utils/structureDrawing.js';
const rd = await initRDKit();
for (const [smiles, expected] of [['CC(O)C(=O)O', '(?)'], ['C[C@H](O)C(=O)O', '(S)'], ['C[C@@H](O)C(=O)O', '(R)']]) {
  const molecule = rd.get_mol(smiles);
  molecule.set_new_coords();
  const restored = rd.get_mol(structureMolfile(parseMolfile(molecule.get_molblock())));
  assert.equal(JSON.parse(restored.get_stereo_tags()).CIP_atoms[0][1], expected);
  molecule.delete(); restored.delete();
}
console.log('PASS: unspecified, R and S centers retain their stereo labels after canvas round trip.');

for (const [equation, coefficients] of [
  ['C2H6 + O2 -> CO2 + H2O', [2, 7, 4, 6]],
  ['Al + HCl -> AlCl3 + H2', [2, 6, 2, 3]],
  ['C6H12O6 + O2 -> CO2 + H2O', [1, 6, 6, 6]],
]) assert.deepEqual(prepareReaction(equation).coefficients, coefficients);
console.log('PASS: fractional coefficient ratios balance exactly for combustion and metal-acid reactions.');
