import { elements } from '../data/elements.js';

const masses = Object.fromEntries(elements.map(el => [el.symbol, el.atomicMass || el.atomicNumber]));

const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
const lcm = (a, b) => Math.abs(a * b) / gcd(a, b);

export const ionData = {
  Na: { charge: 1, name: 'sodium' }, K: { charge: 1, name: 'potassium' }, Ag: { charge: 1, name: 'silver' },
  Mg: { charge: 2, name: 'magnesium' }, Ca: { charge: 2, name: 'calcium' }, Ba: { charge: 2, name: 'barium' }, Zn: { charge: 2, name: 'zinc' }, Cu: { charge: 2, name: 'copper(II)' },
  Al: { charge: 3, name: 'aluminium' }, Fe: { charge: 3, name: 'iron(III)' },
  F: { charge: -1, name: 'fluoride' }, Cl: { charge: -1, name: 'chloride' }, Br: { charge: -1, name: 'bromide' }, I: { charge: -1, name: 'iodide' },
  O: { charge: -2, name: 'oxide' }, S: { charge: -2, name: 'sulfide' }, N: { charge: -3, name: 'nitride' }, P: { charge: -3, name: 'phosphide' },
  OH: { charge: -1, name: 'hydroxide', polyatomic: true }, NO3: { charge: -1, name: 'nitrate', polyatomic: true }, SO4: { charge: -2, name: 'sulfate', polyatomic: true },
  CO3: { charge: -2, name: 'carbonate', polyatomic: true }, PO4: { charge: -3, name: 'phosphate', polyatomic: true }, NH4: { charge: 1, name: 'ammonium', polyatomic: true },
};

export const realIsotopeData = {
  H: [{ label: 'H-1', abundance: '99.985%', halfLife: 'stable' }, { label: 'H-2', abundance: '0.015%', halfLife: 'stable' }, { label: 'H-3', abundance: 'trace', halfLife: '12.32 years', decay: 'beta-' }],
  C: [{ label: 'C-12', abundance: '98.93%', halfLife: 'stable' }, { label: 'C-13', abundance: '1.07%', halfLife: 'stable' }, { label: 'C-14', abundance: 'trace', halfLife: '5730 years', decay: 'beta-' }],
  N: [{ label: 'N-14', abundance: '99.636%', halfLife: 'stable' }, { label: 'N-15', abundance: '0.364%', halfLife: 'stable' }],
  O: [{ label: 'O-16', abundance: '99.757%', halfLife: 'stable' }, { label: 'O-17', abundance: '0.038%', halfLife: 'stable' }, { label: 'O-18', abundance: '0.205%', halfLife: 'stable' }],
  Na: [{ label: 'Na-23', abundance: '100%', halfLife: 'stable' }, { label: 'Na-22', abundance: 'synthetic', halfLife: '2.602 years', decay: 'beta+' }],
  Mg: [{ label: 'Mg-24', abundance: '78.99%', halfLife: 'stable' }, { label: 'Mg-25', abundance: '10.00%', halfLife: 'stable' }, { label: 'Mg-26', abundance: '11.01%', halfLife: 'stable' }],
  Al: [{ label: 'Al-27', abundance: '100%', halfLife: 'stable' }, { label: 'Al-26', abundance: 'trace', halfLife: '717,000 years', decay: 'beta+' }],
  Si: [{ label: 'Si-28', abundance: '92.23%', halfLife: 'stable' }, { label: 'Si-29', abundance: '4.67%', halfLife: 'stable' }, { label: 'Si-30', abundance: '3.10%', halfLife: 'stable' }],
  Cl: [{ label: 'Cl-35', abundance: '75.78%', halfLife: 'stable' }, { label: 'Cl-37', abundance: '24.22%', halfLife: 'stable' }, { label: 'Cl-36', abundance: 'trace', halfLife: '301,000 years', decay: 'beta-' }],
  K: [{ label: 'K-39', abundance: '93.26%', halfLife: 'stable' }, { label: 'K-40', abundance: '0.0117%', halfLife: '1.248 billion years', decay: 'beta-/EC' }, { label: 'K-41', abundance: '6.73%', halfLife: 'stable' }],
  Ca: [{ label: 'Ca-40', abundance: '96.94%', halfLife: 'stable' }, { label: 'Ca-42', abundance: '0.647%', halfLife: 'stable' }, { label: 'Ca-44', abundance: '2.086%', halfLife: 'stable' }, { label: 'Ca-48', abundance: '0.187%', halfLife: 'very long-lived' }],
  Fe: [{ label: 'Fe-54', abundance: '5.845%', halfLife: 'stable' }, { label: 'Fe-56', abundance: '91.754%', halfLife: 'stable' }, { label: 'Fe-57', abundance: '2.119%', halfLife: 'stable' }, { label: 'Fe-58', abundance: '0.282%', halfLife: 'stable' }],
  Cu: [{ label: 'Cu-63', abundance: '69.15%', halfLife: 'stable' }, { label: 'Cu-65', abundance: '30.85%', halfLife: 'stable' }],
  Br: [{ label: 'Br-79', abundance: '50.69%', halfLife: 'stable' }, { label: 'Br-81', abundance: '49.31%', halfLife: 'stable' }],
  I: [{ label: 'I-127', abundance: '100%', halfLife: 'stable' }, { label: 'I-131', abundance: 'synthetic', halfLife: '8.02 days', decay: 'beta-' }],
  U: [{ label: 'U-234', abundance: '0.0055%', halfLife: '245,500 years', decay: 'alpha' }, { label: 'U-235', abundance: '0.720%', halfLife: '703.8 million years', decay: 'alpha' }, { label: 'U-238', abundance: '99.274%', halfLife: '4.468 billion years', decay: 'alpha' }],
};

export const crystalLattices = {
  'Sodium chloride': {
    type: 'rock-salt cubic ionic',
    formula: 'NaCl',
    note: 'NaCl adopts a rock-salt lattice: two interpenetrating face-centered cubic ion arrays with 6:6 coordination.',
    species: [{ label: 'Na+', color: '#a78bfa' }, { label: 'Cl-', color: '#4ade80' }],
    points: Array.from({ length: 64 }, (_, i) => {
      const x = i % 4, y = Math.floor(i / 4) % 4, z = Math.floor(i / 16);
      return { x, y, z, species: (x + y + z) % 2 };
    }),
  },
  Diamond: {
    type: 'diamond cubic covalent network',
    formula: 'C',
    note: 'Diamond is a tetrahedral sp3 carbon network; each carbon bonds to four neighboring carbons.',
    species: [{ label: 'C', color: '#cbd5e1' }],
    points: [[0,0,0],[1,1,0],[1,0,1],[0,1,1],[0.5,0.5,0.5],[1.5,1.5,0.5],[1.5,0.5,1.5],[0.5,1.5,1.5]].map(([x,y,z]) => ({ x, y, z, species: 0 })),
  },
  Graphite: {
    type: 'hexagonal layered covalent solid',
    formula: 'C',
    note: 'Graphite contains sp2 carbon sheets; weak forces between sheets let layers slide.',
    species: [{ label: 'C', color: '#94a3b8' }],
    points: Array.from({ length: 36 }, (_, i) => {
      const row = Math.floor(i / 6), col = i % 6;
      return { x: col + (row % 2) * 0.5, y: row * 0.86, z: Math.floor(row / 3) * 0.8, species: 0 };
    }),
  },
  Ice: {
    type: 'hexagonal molecular crystal',
    formula: 'H2O',
    note: 'Common ice Ih is an open hydrogen-bonded molecular lattice.',
    species: [{ label: 'O', color: '#38bdf8' }, { label: 'H', color: '#e2e8f0' }],
    points: Array.from({ length: 30 }, (_, i) => ({ x: i % 5, y: Math.floor(i / 5), z: (i % 2) * 0.55, species: i % 3 === 0 ? 0 : 1 })),
  },
  Quartz: {
    type: 'silicon dioxide network solid',
    formula: 'SiO2',
    note: 'Quartz is a continuous SiO2 framework of linked SiO4 tetrahedra.',
    species: [{ label: 'Si', color: '#f97316' }, { label: 'O', color: '#ef4444' }],
    points: Array.from({ length: 42 }, (_, i) => ({ x: i % 7, y: Math.floor(i / 7), z: (i % 3) * 0.38, species: i % 3 === 0 ? 0 : 1 })),
  },
};

export const reactionLibrary = {
  water: {
    equation: 'H2 + O2 -> H2O',
    steps: ['Separate H-H and O=O reactants', 'Collision and activation', 'O-H bonds begin forming', 'Water molecules form', 'Balanced: 2H2 + O2 -> 2H2O'],
    species: ['H2', 'O2', 'H2O'],
  },
  combustion: {
    equation: 'CH4 + O2 -> CO2 + H2O',
    steps: ['Methane and oxygen mix', 'C-H and O=O bonds break', 'C=O and O-H bonds form', 'Heat is released', 'Balanced: CH4 + 2O2 -> CO2 + 2H2O'],
    species: ['CH4', 'O2', 'CO2', 'H2O'],
  },
  neutralization: {
    equation: 'HCl + NaOH -> NaCl + H2O',
    steps: ['Acid and base dissociate', 'H+ meets OH-', 'Water forms', 'Spectator ions remain', 'Balanced: HCl + NaOH -> NaCl + H2O'],
    species: ['HCl', 'NaOH', 'NaCl', 'H2O'],
  },
};

export const parseFormula = (input) => {
  const formula = input.replace(/\s+/g, '');
  const stack = [{}];
  const tokenRe = /([A-Z][a-z]?|\(|\)|\d+)/g;
  const tokens = formula.match(tokenRe) || [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token === '(') stack.push({});
    else if (token === ')') {
      const group = stack.pop();
      const mult = /^\d+$/.test(tokens[i + 1] || '') ? Number(tokens[++i]) : 1;
      Object.entries(group).forEach(([symbol, count]) => {
        stack[stack.length - 1][symbol] = (stack[stack.length - 1][symbol] || 0) + count * mult;
      });
    } else if (/^[A-Z][a-z]?$/.test(token)) {
      const mult = /^\d+$/.test(tokens[i + 1] || '') ? Number(tokens[++i]) : 1;
      stack[stack.length - 1][token] = (stack[stack.length - 1][token] || 0) + mult;
    }
  }
  return stack[0];
};

const parseSide = side => side.split('+').map(s => s.trim()).filter(Boolean);

export const balanceEquation = (input) => {
  const [leftRaw, rightRaw] = input.replace(/→/g, '->').split('->').map(s => s?.trim());
  if (!leftRaw || !rightRaw) return { ok: false, error: 'Use an equation like H2 + O2 -> H2O.' };
  const left = parseSide(leftRaw);
  const right = parseSide(rightRaw);
  const compounds = [...left, ...right];
  const atoms = [...new Set(compounds.flatMap(comp => Object.keys(parseFormula(comp))))];
  const rows = atoms.map(atom => compounds.map((comp, i) => (i < left.length ? 1 : -1) * (parseFormula(comp)[atom] || 0)));
  const matrix = rows.map(row => row.slice(0, -1));
  const rhs = rows.map(row => -row[row.length - 1]);

  const n = matrix.length, m = matrix[0]?.length || 0;
  const a = matrix.map((row, i) => [...row.map(Number), rhs[i]]);
  let pivotRow = 0;
  for (let col = 0; col < m && pivotRow < n; col += 1) {
    let best = pivotRow;
    for (let r = pivotRow + 1; r < n; r += 1) if (Math.abs(a[r][col]) > Math.abs(a[best][col])) best = r;
    if (Math.abs(a[best][col]) < 1e-9) continue;
    [a[pivotRow], a[best]] = [a[best], a[pivotRow]];
    const div = a[pivotRow][col];
    for (let c = col; c <= m; c += 1) a[pivotRow][c] /= div;
    for (let r = 0; r < n; r += 1) {
      if (r === pivotRow) continue;
      const factor = a[r][col];
      for (let c = col; c <= m; c += 1) a[r][c] -= factor * a[pivotRow][c];
    }
    pivotRow += 1;
  }

  const solution = Array(m).fill(0);
  for (let r = 0; r < n; r += 1) {
    const lead = a[r].findIndex(v => Math.abs(v) > 1e-8);
    if (lead >= 0 && lead < m) solution[lead] = a[r][m];
  }
  const coeffsFloat = [...solution, 1].map(v => Math.abs(v) < 1e-8 ? 0 : v);
  const scale = 1000;
  const ints = coeffsFloat.map(v => Math.round(v * scale));
  const common = ints.reduce((g, v) => gcd(g, v), Math.abs(ints[0]) || scale);
  let coeffs = ints.map(v => Math.abs(v / common));
  const common2 = coeffs.reduce((g, v) => gcd(g, Math.round(v)), Math.round(coeffs[0]) || 1);
  coeffs = coeffs.map(v => Math.round(v / common2));
  if (coeffs.some(v => !Number.isFinite(v) || v <= 0)) return { ok: false, error: 'Could not balance this equation with the local solver.' };
  const format = (comp, coeff) => `${coeff === 1 ? '' : coeff}${comp}`;
  return {
    ok: true,
    left,
    right,
    coefficients: coeffs,
    balanced: `${left.map((c, i) => format(c, coeffs[i])).join(' + ')} -> ${right.map((c, i) => format(c, coeffs[i + left.length])).join(' + ')}`,
  };
};

export const molarMass = (formula) => {
  const counts = parseFormula(formula);
  return Object.entries(counts).reduce((sum, [symbol, count]) => sum + (masses[symbol] || 0) * count, 0);
};

export const classifyBond = (a, b) => {
  const e1 = elements.find(el => el.symbol.toLowerCase() === a.toLowerCase());
  const e2 = elements.find(el => el.symbol.toLowerCase() === b.toLowerCase());
  if (!e1 || !e2) return { type: 'Unknown', delta: null, note: 'Enter valid element symbols.' };
  if (e1.category.includes('metal') && !e2.category.includes('metal')) return { type: 'Ionic likely', delta: null, note: 'Metal plus nonmetal often forms ionic compounds.' };
  const delta = Math.abs((e1.electronegativity || 0) - (e2.electronegativity || 0));
  if (delta >= 1.7) return { type: 'Ionic/polar ionic', delta, note: 'Large electronegativity difference.' };
  if (delta >= 0.4) return { type: 'Polar covalent', delta, note: 'Electrons are shared unequally.' };
  return { type: 'Nonpolar covalent', delta, note: 'Electrons are shared fairly evenly.' };
};

export const electronConfigParts = (config = '') =>
  config
    .replace(/\[[^\]]+\]/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(part => {
      const match = part.match(/(\d)([spdf])(.+)/);
      const superscriptMap = { '⁰': 0, '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9 };
      const electrons = match ? String(match[3]).split('').reduce((n, ch) => n * 10 + (superscriptMap[ch] ?? Number(ch) ?? 0), 0) : 0;
      return match ? { n: match[1], orbital: match[2], electrons, raw: part } : { raw: part, electrons: 0 };
    });

export const likelyIsotopes = (el) => (realIsotopeData[el.symbol] || []).map(iso => {
  const massNumber = Number(iso.label.split('-')[1]);
  return {
    ...iso,
    protons: el.atomicNumber,
    neutrons: Number.isFinite(massNumber) ? massNumber - el.atomicNumber : null,
  };
});

export const buildIonicFormula = (cation, anion) => {
  const c = ionData[cation];
  const a = ionData[anion];
  if (!c || !a || c.charge <= 0 || a.charge >= 0) return { formula: '', note: 'Choose one cation and one anion.' };
  const cAbs = Math.abs(c.charge), aAbs = Math.abs(a.charge);
  const cCount = aAbs / gcd(cAbs, aAbs);
  const aCount = cAbs / gcd(cAbs, aAbs);
  const part = (symbol, count, poly) => `${poly && count > 1 ? `(${symbol})` : symbol}${count > 1 ? count : ''}`;
  return {
    formula: `${part(cation, cCount, c.polyatomic)}${part(anion, aCount, a.polyatomic)}`,
    note: `${c.name} (${c.charge > 0 ? '+' : ''}${c.charge}) + ${a.name} (${a.charge}) balances at ${cCount}:${aCount}.`,
  };
};

export const electrolysisProducts = (electrolyte) => ({
  CuSO4: { cathode: 'Cu2+ + 2e- -> Cu(s)', anode: '2H2O -> O2 + 4H+ + 4e-', note: 'Copper plates at the cathode; oxygen evolves at an inert anode.' },
  'NaCl(aq)': { cathode: '2H2O + 2e- -> H2 + 2OH-', anode: '2Cl- -> Cl2 + 2e-', note: 'Brine electrolysis produces hydrogen, chlorine, and sodium hydroxide solution.' },
  'H2O + acid': { cathode: '2H+ + 2e- -> H2', anode: '2H2O -> O2 + 4H+ + 4e-', note: 'Acidified water yields hydrogen and oxygen gases in a 2:1 mole ratio.' },
}[electrolyte] || { cathode: 'No rule loaded', anode: 'No rule loaded', note: 'Choose a supported electrolyte.' });

export const strongAcidStrongBaseTitration = (acidM = 0.1, acidMl = 25, baseM = 0.1, baseMl = 0) => {
  const acidMol = acidM * acidMl / 1000;
  const baseMol = baseM * baseMl / 1000;
  const totalL = (acidMl + baseMl) / 1000;
  const excess = acidMol - baseMol;
  if (Math.abs(excess) < 1e-10) return { pH: 7, region: 'equivalence point', acidMol, baseMol };
  if (excess > 0) return { pH: -Math.log10(excess / totalL), region: 'acid excess', acidMol, baseMol };
  const poh = -Math.log10(Math.abs(excess) / totalL);
  return { pH: 14 - poh, region: 'base excess', acidMol, baseMol };
};

export const lewisAssessment = (symbol) => {
  const el = elements.find(e => e.symbol === symbol);
  const valence = el?.shells?.at(-1) || 0;
  const target = symbol === 'H' ? 2 : 8;
  return {
    valence,
    lonePairsIfUnbonded: Math.floor(valence / 2),
    electronsNeededForOctet: Math.max(0, target - valence),
    note: valence >= 4 ? 'Can often share electrons to complete an octet.' : 'Often forms bonds by sharing or gaining electrons.',
  };
};

export const vseprFromDomains = (bondedAtoms, lonePairs) => {
  const domains = Number(bondedAtoms) + Number(lonePairs);
  if (domains === 2) return { shape: 'linear', angle: '180 deg' };
  if (domains === 3 && lonePairs === 0) return { shape: 'trigonal planar', angle: '120 deg' };
  if (domains === 3 && lonePairs === 1) return { shape: 'bent', angle: '<120 deg' };
  if (domains === 4 && lonePairs === 0) return { shape: 'tetrahedral', angle: '109.5 deg' };
  if (domains === 4 && lonePairs === 1) return { shape: 'pyramidal', angle: '~107 deg' };
  if (domains === 4 && lonePairs === 2) return { shape: 'bent', angle: '~104.5 deg' };
  if (domains === 6) return { shape: 'octahedral', angle: '90 deg' };
  return { shape: 'expanded/other', angle: 'depends on domains' };
};

export const elementEnrichment = (el) => {
  const category = el.category || '';
  const metal = category.includes('metal') || category.includes('lanthanide') || category.includes('actinide');
  const gas = el.phase === 'Gas';
  return {
    safety: gas
      ? 'Use ventilation; compressed gases require secure cylinders and leak checks.'
      : metal
      ? 'Avoid dust inhalation; many metals require gloves, eye protection, and dry storage.'
      : 'Avoid ingestion and dust inhalation; use standard lab PPE and labeled containers.',
    occurrence: category.includes('noble gas')
      ? 'Found in trace amounts in air and recovered by fractional distillation.'
      : metal
      ? 'Commonly occurs in minerals, ores, oxides, sulfides, or silicates.'
      : 'Occurs in air, water, minerals, organic matter, or molecular compounds depending on reactivity.',
    extraction: gas
      ? 'Often separated from air or produced by chemical/electrolytic methods.'
      : metal
      ? 'Usually extracted by roasting, reduction, electrolysis, or refining of ores.'
      : 'Prepared by purification, distillation, electrolysis, or reaction of precursor compounds.',
    crystal: category.includes('noble gas') ? 'monatomic gas; solid forms weak molecular crystals' : metal ? 'metallic lattice, often cubic or close-packed' : 'molecular, covalent network, or layered solid depending on allotrope',
  };
};

export const abundanceRows = (el) => {
  const base = Math.max(0.01, 100 / Math.sqrt(el.atomicNumber));
  return [
    ['Universe', base * (el.atomicNumber <= 2 ? 500 : 1)],
    ['Earth crust', base * (el.category.includes('metal') ? 2.2 : 0.6)],
    ['Ocean', base * (['H', 'O', 'Na', 'Cl', 'Mg', 'S'].includes(el.symbol) ? 8 : 0.18)],
    ['Human body', base * (['H', 'C', 'N', 'O', 'P', 'S', 'Ca'].includes(el.symbol) ? 12 : 0.08)],
  ];
};
