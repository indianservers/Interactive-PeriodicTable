const C = '#94a3b8';
const H = '#e2e8f0';
const O = '#ef4444';

const mk = (id, element, position, color, radius) => ({ id, element, position, color, radius });
const bond = (from, to, type = 'covalent') => ({ from, to, type });
const label = (text, target, targetBond) => (targetBond ? { text, targetBond } : { text, target });

const SUB = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const sub = value => String(value).split('').map(ch => SUB[Number(ch)] ?? ch).join('');
const formula = parts => parts.map(([symbol, count]) => `${symbol}${count > 1 ? sub(count) : ''}`).join('');

const carbonRoots = {
  1: 'meth', 2: 'eth', 3: 'prop', 4: 'but', 5: 'pent', 6: 'hex', 7: 'hept', 8: 'oct',
  9: 'non', 10: 'dec', 11: 'undec', 12: 'dodec', 13: 'tridec', 14: 'tetradec',
  15: 'pentadec', 16: 'hexadec', 17: 'heptadec', 18: 'octadec', 19: 'nonadec',
  20: 'eicos', 21: 'heneicos', 22: 'docos', 23: 'tricos', 24: 'tetracos',
};

const title = text => text.replace(/\b\w/g, letter => letter.toUpperCase());

const chainPosition = (index, total) => [
  (index - (total - 1) / 2) * 1.46,
  index % 2 === 0 ? 0.26 : -0.26,
  index % 3 === 0 ? 0.18 : index % 3 === 1 ? -0.18 : 0,
];

const hydrogenOffsets = [
  [0, 1.05, 0.58],
  [0, -1.05, 0.58],
  [0, 0.58, -1.05],
  [0, -0.58, -1.05],
];

function addHydrogens(atoms, bonds, carbonId, carbonPosition, count, prefix) {
  hydrogenOffsets.slice(0, count).forEach((offset, index) => {
    const hId = `${prefix}H${index + 1}`;
    atoms.push(mk(hId, 'H', [
      carbonPosition[0] + offset[0],
      carbonPosition[1] + offset[1],
      carbonPosition[2] + offset[2],
    ], H, 0.29));
    bonds.push(bond(carbonId, hId));
  });
}

function makeCarbonSkeleton(n, options = {}) {
  const atoms = [];
  const bonds = [];
  const positions = Array.from({ length: n }, (_, index) => chainPosition(index, n));
  const bondOrders = Array.from({ length: n - 1 }, (_, index) => options.multipleBond?.index === index ? options.multipleBond.order : 1);
  const extraValence = Array(n).fill(0);

  positions.forEach((position, index) => {
    atoms.push(mk(`C${index + 1}`, 'C', position, C, 0.47));
  });

  for (let index = 0; index < n - 1; index += 1) {
    bonds.push(bond(`C${index + 1}`, `C${index + 2}`));
  }

  return { atoms, bonds, positions, bondOrders, extraValence };
}

function finishHydrocarbon(model, name, formulaText, labels) {
  const { atoms, bonds, positions, bondOrders, extraValence } = model;
  positions.forEach((position, index) => {
    const leftOrder = index > 0 ? bondOrders[index - 1] : 0;
    const rightOrder = index < bondOrders.length ? bondOrders[index] : 0;
    const hydrogenCount = Math.max(0, 4 - leftOrder - rightOrder - extraValence[index]);
    addHydrogens(atoms, bonds, `C${index + 1}`, position, hydrogenCount, `C${index + 1}`);
  });
  return {
    name,
    formula: formulaText,
    atoms,
    bonds,
    labels,
  };
}

const makeAlkane = n => {
  const root = carbonRoots[n];
  return finishHydrocarbon(
    makeCarbonSkeleton(n),
    title(`${root}ane`),
    formula([['C', n], ['H', 2 * n + 2]]),
    [label('Saturated hydrocarbon chain', 'C1'), label('C-C single bonds', null, ['C1', 'C2'])]
  );
};

const makeAlkene = n => {
  const root = carbonRoots[n];
  return finishHydrocarbon(
    makeCarbonSkeleton(n, { multipleBond: { index: 0, order: 2 } }),
    title(`${root}-1-ene`),
    formula([['C', n], ['H', 2 * n]]),
    [label('C=C double bond', null, ['C1', 'C2']), label('Unsaturated chain', 'C2')]
  );
};

const makeAlkyne = n => {
  const root = carbonRoots[n];
  return finishHydrocarbon(
    makeCarbonSkeleton(n, { multipleBond: { index: 0, order: 3 } }),
    title(`${root}-1-yne`),
    formula([['C', n], ['H', 2 * n - 2]]),
    [label('C≡C triple bond', null, ['C1', 'C2']), label('Linear alkyne end', 'C1')]
  );
};

const attachAlcohol = (model, carbonIndex = 0) => {
  const { atoms, bonds, positions, extraValence } = model;
  const cId = `C${carbonIndex + 1}`;
  const cPos = positions[carbonIndex];
  const oId = 'O1';
  const hId = 'HO1';
  const oPos = [cPos[0], cPos[1] + 1.22, cPos[2] - 0.34];
  atoms.push(mk(oId, 'O', oPos, O, 0.54));
  atoms.push(mk(hId, 'H', [oPos[0] + 0.62, oPos[1] + 0.62, oPos[2]], H, 0.29));
  bonds.push(bond(cId, oId), bond(oId, hId));
  extraValence[carbonIndex] += 1;
};

const makeAlcohol = n => {
  const model = makeCarbonSkeleton(n);
  attachAlcohol(model, 0);
  return finishHydrocarbon(
    model,
    title(`${carbonRoots[n]}an-1-ol`),
    formula([['C', n], ['H', 2 * n + 2], ['O', 1]]),
    [label('Primary alcohol group', 'O1'), label('Hydrogen bond donor', 'HO1')]
  );
};

const attachCarbonylOxygen = (model, carbonIndex, id = 'O1') => {
  const { atoms, bonds, positions, extraValence } = model;
  const cId = `C${carbonIndex + 1}`;
  const cPos = positions[carbonIndex];
  const direction = carbonIndex === 0 ? -1 : 1;
  const oPos = [cPos[0] + direction * 0.15, cPos[1] + 1.18, cPos[2] + 0.2];
  atoms.push(mk(id, 'O', oPos, O, 0.54));
  bonds.push(bond(cId, id));
  extraValence[carbonIndex] += 2;
};

const makeAldehyde = n => {
  const model = makeCarbonSkeleton(n);
  attachCarbonylOxygen(model, 0);
  return finishHydrocarbon(
    model,
    title(`${carbonRoots[n]}anal`),
    formula([['C', n], ['H', 2 * n], ['O', 1]]),
    [label('Aldehyde carbonyl', 'C1'), label('C=O group', 'O1')]
  );
};

const makeKetone = n => {
  const model = makeCarbonSkeleton(n);
  attachCarbonylOxygen(model, 1);
  return finishHydrocarbon(
    model,
    title(`${carbonRoots[n]}an-2-one`),
    formula([['C', n], ['H', 2 * n], ['O', 1]]),
    [label('Ketone carbonyl', 'C2'), label('C=O group', 'O1')]
  );
};

const makeCarboxylicAcid = n => {
  const model = makeCarbonSkeleton(n);
  attachCarbonylOxygen(model, 0, 'O1');
  const { atoms, bonds, positions, extraValence } = model;
  const cPos = positions[0];
  const o2 = [cPos[0] - 0.86, cPos[1] - 1.0, cPos[2] - 0.2];
  atoms.push(mk('O2', 'O', o2, O, 0.54));
  atoms.push(mk('HO2', 'H', [o2[0] - 0.72, o2[1] - 0.42, o2[2]], H, 0.29));
  bonds.push(bond('C1', 'O2'), bond('O2', 'HO2'));
  extraValence[0] += 1;
  return finishHydrocarbon(
    model,
    title(`${carbonRoots[n]}anoic acid`),
    formula([['C', n], ['H', 2 * n], ['O', 2]]),
    [label('Carboxylic acid group', 'C1'), label('Acidic O-H', 'HO2')]
  );
};

export const EXPANDED_ALKANES = Array.from({ length: 20 }, (_, index) => makeAlkane(index + 5));
export const EXPANDED_ALKENES = Array.from({ length: 20 }, (_, index) => makeAlkene(index + 4));
export const EXPANDED_ALKYNES = Array.from({ length: 20 }, (_, index) => makeAlkyne(index + 4));
export const EXPANDED_ALCOHOLS = Array.from({ length: 20 }, (_, index) => makeAlcohol(index + 4));
export const EXPANDED_CARBOXYLIC_ACIDS = Array.from({ length: 10 }, (_, index) => makeCarboxylicAcid(index + 3));
export const EXPANDED_ALDEHYDES = Array.from({ length: 5 }, (_, index) => makeAldehyde(index + 3));
export const EXPANDED_KETONES = Array.from({ length: 5 }, (_, index) => makeKetone(index + 4));

export const EXPANDED_REAL_MOLECULES = [
  ...EXPANDED_ALKANES,
  ...EXPANDED_ALKENES,
  ...EXPANDED_ALKYNES,
  ...EXPANDED_ALCOHOLS,
  ...EXPANDED_CARBOXYLIC_ACIDS,
  ...EXPANDED_ALDEHYDES,
  ...EXPANDED_KETONES,
];

export const EXPANDED_REAL_MOLECULE_LIBRARY = {
  'Expanded Real 3D Models': {
    color: '#10b981',
    description: '100 additional real organic compounds with approximate 3D educational coordinates.',
    subcategories: {
      'Long-Chain Alkanes': {
        description: 'Straight-chain saturated hydrocarbons from pentane through tetracosane.',
        learningGoal: 'Compare carbon-chain length, flexibility, and formula growth.',
        keyIdea: 'Each extra CH2 unit extends the chain while preserving single-bond geometry.',
        molecules: EXPANDED_ALKANES,
      },
      'Terminal Alkenes': {
        description: 'Real 1-alkenes with a terminal carbon-carbon double bond.',
        learningGoal: 'Find the reactive C=C site at the end of each chain.',
        keyIdea: 'A double bond lowers hydrogen count and creates a planar unsaturated region.',
        molecules: EXPANDED_ALKENES,
      },
      'Terminal Alkynes': {
        description: 'Real 1-alkynes with a terminal carbon-carbon triple bond.',
        learningGoal: 'Recognize linear alkyne geometry and reduced hydrogen count.',
        keyIdea: 'A triple bond uses three shared electron pairs and creates a straight end.',
        molecules: EXPANDED_ALKYNES,
      },
      'Primary Alcohols': {
        description: 'Straight-chain 1-alcohols from butan-1-ol through tetracosan-1-ol.',
        learningGoal: 'Connect the O-H group to polarity and hydrogen bonding.',
        keyIdea: 'A hydrocarbon chain becomes more polar when an alcohol group is attached.',
        molecules: EXPANDED_ALCOHOLS,
      },
      'Carboxylic Acids': {
        description: 'Straight-chain saturated carboxylic acids from propanoic acid through dodecanoic acid.',
        learningGoal: 'Identify the COOH group and acidic hydrogen.',
        keyIdea: 'The carboxyl group combines carbonyl and hydroxyl behavior.',
        molecules: EXPANDED_CARBOXYLIC_ACIDS,
      },
      'Aldehydes': {
        description: 'Terminal carbonyl compounds from propanal through heptanal.',
        learningGoal: 'Spot an aldehyde carbonyl at the end of a carbon chain.',
        keyIdea: 'Aldehydes keep one hydrogen attached to the carbonyl carbon.',
        molecules: EXPANDED_ALDEHYDES,
      },
      'Ketones': {
        description: '2-ketones from butan-2-one through octan-2-one.',
        learningGoal: 'Distinguish internal ketone carbonyls from aldehydes.',
        keyIdea: 'Ketones place C=O inside the carbon skeleton rather than at the end.',
        molecules: EXPANDED_KETONES,
      },
    },
  },
};

export default EXPANDED_REAL_MOLECULE_LIBRARY;
