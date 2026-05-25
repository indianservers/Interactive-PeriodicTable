import { pointGroups } from '../data/moleculeData.js';

export const decisionTreeQuestions = [
  'Is the molecule linear?',
  'Does it have very high tetrahedral or octahedral symmetry?',
  'What is the highest-order proper rotation axis?',
  'Are there C2 axes perpendicular to the principal axis?',
  'Is there a horizontal mirror plane?',
  'Are vertical or dihedral mirror planes present?',
  'Is there an inversion centre?',
  'Is there an improper rotation axis?',
  'Choose the point group that satisfies all observed elements.',
];

export function inferPointGroupFromSelections(selections = {}) {
  if (selections.highSymmetry === 'tetrahedral') return 'Td';
  if (selections.highSymmetry === 'octahedral') return 'Oh';
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
