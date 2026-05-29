export const lessonPresets = [
  {
    id: 'c2v-water',
    title: 'C2v lesson: water as the first full point group',
    molecules: ['water'],
    prompts: ['Find the C2 axis.', 'Compare the two vertical mirror planes.', 'Build Gamma for atom sites.'],
  },
  {
    id: 'c3v-d3h',
    title: 'C3v vs D3h: pyramidal and planar AB3',
    molecules: ['ammonia', 'bf3'],
    prompts: ['Identify the missing sigma h in NH3.', 'Compare C3 rotations in NH3 and BF3.', 'Explain why BF3 has perpendicular C2 axes.'],
  },
  {
    id: 'centrosymmetry',
    title: 'Centrosymmetry and mutual exclusion',
    molecules: ['co2', 'ethene', 'benzene'],
    prompts: ['Locate inversion centres.', 'Predict IR/Raman exclusivity.', 'Use g/u labels in the character table.'],
  },
  {
    id: 'improper-axis',
    title: 'Improper rotations without fear',
    molecules: ['methane', 'allene', 'ferrocene'],
    prompts: ['Separate Cn from Sn.', 'Describe the reflection plane after rotation.', 'Connect Sn to chirality tests.'],
  },
];

export const conformationComparisons = {
  ferrocene: {
    title: 'Ferrocene: staggered D5d vs eclipsed D5h',
    left: 'Staggered rings: inversion centre and S10 axis; taught as D5d.',
    right: 'Eclipsed rings: horizontal mirror plane appears; taught as D5h.',
    teachingPoint: 'The metal sandwich framework is similar, but ring registry changes the symmetry operations.',
  },
  'hydrogen-peroxide': {
    title: 'Hydrogen peroxide: skew C2 vs planar C2h',
    left: 'Skew conformer: only C2 remains in the starter model.',
    right: 'Planar idealization: mirror/inversion elements can appear, changing the point group.',
    teachingPoint: 'Conformation is part of the symmetry problem, not an afterthought.',
  },
  allene: {
    title: 'Allene: perpendicular D2d vs planar misconception',
    left: 'Real allene has perpendicular terminal CH2 planes and S4 symmetry.',
    right: 'A planar drawing falsely suggests D2h-like elements.',
    teachingPoint: 'A flat textbook sketch can create symmetry elements that are not physically present.',
  },
};

export const pointGroupComparisons = [
  {
    pair: 'C2v vs C2h',
    left: 'C2v: one C2 axis and vertical mirror planes that contain the principal axis. No inversion centre is required.',
    right: 'C2h: one C2 axis, a horizontal mirror plane perpendicular to that axis, and an inversion centre.',
    clue: 'Ask whether the mirror planes contain the C2 axis or lie perpendicular to it.',
  },
  {
    pair: 'C3v vs D3h',
    left: 'C3v: one C3 axis and three vertical mirror planes, but no perpendicular C2 axes and no sigma h.',
    right: 'D3h: C3 plus three perpendicular C2 axes and a horizontal mirror plane.',
    clue: 'NH3 is C3v; planar BF3 is D3h.',
  },
  {
    pair: 'C4v vs D4h',
    left: 'C4v: C4 axis with vertical mirror planes, common for square pyramidal shapes.',
    right: 'D4h: C4 axis, perpendicular C2 axes, sigma h, and often inversion.',
    clue: 'Square planar XeF4 is D4h, not just C4v.',
  },
  {
    pair: 'Td vs Oh',
    left: 'Td: tetrahedral high symmetry with C3 axes and S4 axes, but no inversion centre.',
    right: 'Oh: octahedral/cubic high symmetry with C4, C3, C2, mirror planes, and inversion.',
    clue: 'Look for four-coordinate tetrahedral versus six-coordinate octahedral frameworks.',
  },
  {
    pair: 'D5d vs D5h',
    left: 'D5d: staggered five-fold sandwich geometry with inversion and S10.',
    right: 'D5h: eclipsed five-fold sandwich geometry with a horizontal mirror plane.',
    clue: 'Same formula can change point group when conformation changes.',
  },
];

export const spectroscopyRules = [
  { label: 'IR active', rule: 'A mode is IR active if it transforms like x, y, or z.', color: 'cyan' },
  { label: 'Raman active', rule: 'A mode is Raman active if it transforms like quadratic functions: x2, y2, z2, xy, xz, yz.', color: 'violet' },
  { label: 'Mutual exclusion', rule: 'Centrosymmetric molecules often have separate g Raman-active and u IR-active modes.', color: 'amber' },
  { label: 'Dipole moment', rule: 'A permanent dipole is allowed only if a totally symmetric component of x, y, or z survives.', color: 'emerald' },
];

export const chiralityNotes = {
  chiralRule: 'A molecule can be optically active only when it is chiral; by point-group symmetry this requires absence of every improper operation Sn, including mirror planes and inversion centres.',
  examples: [
    'Skew substituted allene can become chiral when terminal substituent pairs differ.',
    'Ordinary methane is achiral because Td includes improper operations.',
    'A molecule with an inversion centre is always achiral.',
  ],
};

export const orbitalSets = [
  { id: 'p-orbitals', label: 'p orbitals', orbitals: ['px', 'py', 'pz'], note: 'Track sign changes under mirror planes and rotations.' },
  { id: 'd-orbitals', label: 'd orbitals', orbitals: ['dz2', 'dx2-y2', 'dxy', 'dxz', 'dyz'], note: 'Useful for ligand field and metal complex symmetry.' },
  { id: 'sigma-ligands', label: 'sigma ligand orbitals', orbitals: ['sigma1', 'sigma2', 'sigma3', 'sigma4'], note: 'Start here for SALC construction.' },
];
