import { balanceEquation, molarMass, parseFormula } from './chemistryTools.js';
import { elements } from '../data/elements.js';

export function prepareReaction(equation) {
  const sides = equation.replaceAll('→', '->').split('->');
  if (sides.length !== 2) throw Error('Separate reactants and products with ->.');
  const formulas = sides.flatMap(side => side.split('+').map(s => s.trim()));
  for (const formula of formulas) {
    if (!formula || !/^(?:[A-Z][a-z]?\d*|\(|\)\d*)+$/.test(formula)) throw Error('Use neutral formulas without coefficients, charges or state labels.');
    let depth = 0;
    for (const c of formula) {
      if (c === '(') depth++;
      if (c === ')' && --depth < 0) throw Error('Unmatched parentheses.');
    }
    if (depth || /\(\)|(?:^|[^0-9])0/.test(formula)) throw Error('Invalid formula.');
    if (Object.keys(parseFormula(formula)).some(s => !elements.some(e => e.symbol === s))) throw Error('Unknown element in formula.');
  }
  const result = balanceEquation(equation);
  if (!result.ok) throw Error(result.error);
  const totals = side => side.reduce((out, formula, position) => {
    const index = side === result.left ? position : result.left.length + position;
    for (const [s, n] of Object.entries(parseFormula(formula))) out[s] = (out[s] || 0) + n * result.coefficients[index];
    return out;
  }, {});
  const left = totals(result.left), right = totals(result.right);
  if (Object.keys({...left, ...right}).some(s => left[s] !== right[s])) throw Error('This equation could not be balanced.');
  return result;
}

export function calculateStoichiometry(reaction, amounts, unit = 'g') {
  const moles = reaction.left.map((f, i) => {
    if (amounts[i] === '' || amounts[i] == null || !Number.isFinite(Number(amounts[i])) || Number(amounts[i]) < 0) throw Error('Enter a nonnegative amount for every reactant.');
    return Number(amounts[i]) / (unit === 'g' ? molarMass(f) : 1);
  });
  const extents = moles.map((n, i) => n / reaction.coefficients[i]);
  const extent = Math.min(...extents);
  return {
    limiting: reaction.left.filter((_, i) => Math.abs(extents[i] - extent) < 1e-10),
    remaining: moles.map((n, i) => Math.max(0, n - extent * reaction.coefficients[i])),
    products: reaction.right.map((formula, i) => {
      const mol = extent * reaction.coefficients[reaction.left.length + i];
      return { formula, mol, grams: mol * molarMass(formula) };
    }),
  };
}
