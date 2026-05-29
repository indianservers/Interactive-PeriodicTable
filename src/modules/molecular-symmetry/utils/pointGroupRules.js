import { pointGroups } from '../data/moleculeData.js';

export const decisionTreeQuestions = [
  'Draw or inspect the real 3D geometry.',
  'List all symmetry elements you can justify.',
  'Check for special high-symmetry families.',
  'Find the principal proper rotation axis Cn.',
  'Check for n C2 axes perpendicular to Cn.',
  'Check for sigma h, sigma v, sigma d, inversion, and Sn.',
  'Use the classification family to assign the point group.',
  'Test optical activity from improper symmetry elements.',
];

export const pointGroupFamilies = [
  {
    family: 'Low symmetry',
    groups: ['C1', 'Cs', 'Ci'],
    criteria: 'No proper rotation axis beyond E. Cs has one mirror plane; Ci has only inversion.',
  },
  {
    family: 'Cyclic groups',
    groups: ['Cn', 'Cnv', 'Cnh'],
    criteria: 'One principal Cn axis. Add v for vertical planes, h for a horizontal plane.',
  },
  {
    family: 'Dihedral groups',
    groups: ['Dn', 'Dnh', 'Dnd'],
    criteria: 'A principal Cn axis plus n perpendicular C2 axes. Add h or d from the mirror-plane type.',
  },
  {
    family: 'Improper-axis groups',
    groups: ['Sn'],
    criteria: 'An improper rotation axis is the defining element when no higher cyclic or dihedral family fits.',
  },
  {
    family: 'Linear groups',
    groups: ['C infinity v', 'D infinity h'],
    criteria: 'Linear molecules. Heteronuclear linear molecules are C infinity v; centrosymmetric linear molecules are D infinity h.',
  },
  {
    family: 'Cubic and icosahedral groups',
    groups: ['Td', 'Oh', 'Ih'],
    criteria: 'Very high symmetry: tetrahedral, octahedral/cubic, or icosahedral/dodecahedral frameworks.',
  },
];

export const pointGroupSignatures = [
  { group: 'C1', signature: 'Only E', example: 'No symmetry beyond identity.' },
  { group: 'Cs', signature: 'E + one sigma plane', example: 'One mirror plane, no rotation axis.' },
  { group: 'Ci', signature: 'E + inversion i', example: 'Inversion centre, no mirror plane or proper rotation axis.' },
  { group: 'C2', signature: 'E + one C2 axis', example: 'Hydrogen peroxide skew teaching model.' },
  { group: 'C2v', signature: 'E + C2 + two sigma v planes', example: 'Water: C2 axis plus two vertical mirror planes.' },
  { group: 'C3v', signature: 'E + C3 + three sigma v planes', example: 'Ammonia: pyramidal AB3 geometry.' },
  { group: 'D3h', signature: 'C3 + three perpendicular C2 axes + sigma h', example: 'BF3: trigonal planar AB3 geometry.' },
  { group: 'D4h', signature: 'C4 + perpendicular C2 axes + sigma h + i', example: 'XeF4: square planar geometry.' },
  { group: 'D6h', signature: 'C6 + perpendicular C2 axes + sigma h + i', example: 'Benzene: planar hexagonal framework.' },
  { group: 'Td', signature: 'Tetrahedral high symmetry with C3, C2, S4, sigma d', example: 'Methane or tetrahedron framework.' },
  { group: 'Oh', signature: 'Octahedral high symmetry with C4, C3, C2, i, sigma, Sn', example: 'Octahedron framework.' },
  { group: 'Ih', signature: 'Icosahedral high symmetry with C5, C3, C2, i, sigma, Sn', example: 'Icosahedron and dodecahedron frameworks.' },
];

export function getPointGroupSignature(pointGroup = '') {
  return pointGroupSignatures.find(item => item.group === pointGroup)
    || pointGroupSignatures.find(item => pointGroup.startsWith(item.group))
    || null;
}

export function classifyPointGroupFamily(pointGroup = '') {
  if (['C1', 'Cs', 'Ci'].includes(pointGroup)) return 'Low symmetry';
  if (pointGroup === 'Td' || pointGroup === 'Oh' || pointGroup === 'Ih') return 'Cubic and icosahedral groups';
  if (pointGroup.includes('∞') || pointGroup.includes('infinity')) return 'Linear groups';
  if (/^S\d+/.test(pointGroup)) return 'Improper-axis groups';
  if (/^D/.test(pointGroup)) return 'Dihedral groups';
  if (/^C/.test(pointGroup)) return 'Cyclic groups';
  return 'Classified by listed symmetry elements';
}

export function summarizeSymmetryInventory(molecule) {
  const elements = molecule?.symmetryElements || [];
  const properRotations = elements.filter(element => element.type === 'Cn');
  const highestOrder = properRotations.reduce((best, element) => Math.max(best, element.order || 1), 1);
  return {
    hasProperRotation: properRotations.length > 0,
    highestOrder,
    hasMirrorPlane: elements.some(element => element.type === 'sigma'),
    hasInversion: elements.some(element => element.type === 'i'),
    hasImproperAxis: elements.some(element => element.type === 'Sn'),
    hasPerpendicularC2: properRotations.length > 1 && properRotations.some(element => element.order === 2 && !element.id?.includes('-z')),
    family: classifyPointGroupFamily(molecule?.pointGroup),
  };
}

export function getPointGroupAssignmentSteps(molecule) {
  const inventory = summarizeSymmetryInventory(molecule);
  const linear = molecule.geometry.toLowerCase().includes('linear');
  const specialGroup = ['Td', 'Oh', 'Ih'].includes(molecule.pointGroup);
  const principalAxis = inventory.highestOrder > 1 ? `C${inventory.highestOrder}` : 'none';
  return [
    {
      title: 'Start from geometry',
      result: linear ? 'Linear molecule path' : `${molecule.geometry} is non-linear`,
      detail: 'Use the real 3D shape before counting symmetry. A flat sketch can add false elements.',
    },
    {
      title: 'Collect symmetry elements',
      result: molecule.symmetryElements.map(element => element.label).join(', '),
      detail: 'Only keep elements that map every atom onto an equivalent atom.',
    },
    {
      title: 'Classify the family',
      result: specialGroup ? `${molecule.pointGroup} high-symmetry family` : inventory.family,
      detail: 'High-symmetry families are recognized before ordinary Cn/Dn branching.',
    },
    {
      title: 'Choose principal axis',
      result: principalAxis,
      detail: 'The highest-order proper rotation axis is the principal axis for most non-linear groups.',
    },
    {
      title: 'Check perpendicular C2 axes',
      result: inventory.hasPerpendicularC2 ? 'Present: use a D-family branch when not high-symmetry' : 'Absent: use a C-family branch when not high-symmetry',
      detail: 'Dn groups require n C2 axes perpendicular to the principal Cn axis.',
    },
    {
      title: 'Add planes, inversion, and Sn',
      result: [
        inventory.hasMirrorPlane ? 'mirror plane present' : 'no mirror plane listed',
        inventory.hasInversion ? 'inversion present' : 'no inversion centre',
        inventory.hasImproperAxis ? 'improper axis present' : 'no improper axis listed',
      ].join('; '),
      detail: 'These suffixes distinguish Cnv/Cnh and Dnh/Dnd, and they also control chirality.',
    },
    {
      title: 'Assign point group',
      result: molecule.pointGroup,
      detail: molecule.pointGroupReasoning.at(-1) || `The matching symmetry-element set is ${molecule.pointGroup}.`,
    },
  ];
}

export function getOpticalActivityCriteria(molecule) {
  const elements = molecule?.symmetryElements || [];
  const improperElements = elements.filter(element => element.type === 'Sn' || element.type === 'sigma' || element.type === 'i');
  const hasImproperSymmetry = improperElements.length > 0;
  return {
    isPotentiallyOpticallyActive: !hasImproperSymmetry,
    verdict: hasImproperSymmetry ? 'Achiral by symmetry; optically inactive as a pure symmetry class.' : 'Potentially chiral; optical activity is symmetry-allowed.',
    reason: hasImproperSymmetry
      ? 'A mirror plane, inversion centre, or improper rotation Sn makes the molecule superposable on its mirror image.'
      : 'No improper symmetry element is listed, so chirality is possible if the molecular constitution is not otherwise identical to its mirror image.',
    blockingElements: improperElements.map(element => element.label),
    checklist: [
      'If sigma is present, the molecule is achiral.',
      'If inversion i is present, the molecule is achiral.',
      'If any Sn is present, including S1 as sigma or S2 as inversion, the molecule is achiral.',
      'Only groups lacking all improper operations can be optically active.',
    ],
  };
}

export function inferPointGroupFromSelections(selections = {}) {
  if (selections.highSymmetry === 'tetrahedral') return 'Td';
  if (selections.highSymmetry === 'octahedral') return 'Oh';
  if (selections.highSymmetry === 'icosahedral') return 'Ih';
  if (selections.linear && selections.inversion) return 'D2h';
  if (selections.linear) return 'C∞v';
  if (selections.principalAxis === 'C6' && selections.perpendicularC2 && selections.sigmaH) return 'D6h';
  if (selections.principalAxis === 'C3' && selections.perpendicularC2 && selections.sigmaH) return 'D3h';
  if (selections.principalAxis === 'C2' && selections.perpendicularC2 && selections.sigmaH && selections.inversion) return 'D2h';
  if (selections.principalAxis === 'C3' && selections.sigmaV) return 'C3v';
  if (selections.principalAxis === 'C2' && selections.sigmaV) return 'C2v';
  if (selections.principalAxis === 'C2') return 'C2';
  if (selections.sigmaH || selections.sigmaV) return 'Cs';
  if (selections.inversion) return 'Ci';
  return 'C1';
}

export function getPointGroupOptions(correctPointGroup) {
  const nearby = pointGroups.filter(group => group !== correctPointGroup).slice(0, 5);
  return [correctPointGroup, ...nearby].sort();
}
