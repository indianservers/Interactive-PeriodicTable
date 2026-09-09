import { validateSymmetryOperation } from './symmetryOperations.js';

export function operationMismatchHeatmap(result) {
  if (!result?.mapping) return [];
  return result.mapping.map(item => ({
    atom: item.from,
    target: item.to,
    distance: item.distance,
    severity: item.valid ? 'matched' : item.distance > 1 ? 'large' : 'small',
  }));
}

export function perturbMoleculeSymmetry(molecule, axis = 'x', amount = 0.18) {
  const index = { x: 0, y: 1, z: 2 }[axis] ?? 0;
  const perturbed = {
    ...molecule,
    atoms: molecule.atoms.map((atom, atomIndex) => ({
      ...atom,
      position: atom.position.map((value, valueIndex) => (
        valueIndex === index && atomIndex % 2 === 0 ? value + amount : value
      )),
    })),
  };
  return molecule.symmetryElements.map(element => ({
    id: element.id,
    label: element.label,
    before: validateSymmetryOperation(molecule, element).valid,
    after: validateSymmetryOperation(perturbed, element).valid,
  }));
}

export function proposeDiscoveryElement(type, molecule) {
  const candidates = molecule.symmetryElements.filter(element => element.type === type);
  const first = candidates[0];
  if (!first) {
    return { valid: false, message: `No ${type} element is listed for ${molecule.name}.` };
  }
  const result = validateSymmetryOperation(molecule, first);
  return {
    valid: result.valid,
    message: result.valid
      ? `${first.label} is a valid manually proposed element for ${molecule.name}.`
      : `${first.label} does not validate against the current coordinates.`,
    element: first,
  };
}

export function salcSeed(molecule) {
  const equivalentGroups = molecule.atoms.reduce((acc, atom) => {
    acc[atom.element] = acc[atom.element] || [];
    acc[atom.element].push(atom.id);
    return acc;
  }, {});
  const largest = Object.values(equivalentGroups).sort((a, b) => b.length - a.length)[0] || [];
  const normalized = largest.length ? `1/sqrt(${largest.length})` : '1';
  return {
    basis: largest,
    totallySymmetric: largest.map(id => `+${id}`).join(' '),
    normalization: normalized,
  };
}

export function assessmentQuestions(molecule) {
  return [
    `Identify the principal symmetry axis of ${molecule.name}.`,
    `List all mirror planes represented in the Molecular Symmetry Visualizer for ${molecule.formula}.`,
    `Does ${molecule.name} have an inversion centre? Justify using atom mapping.`,
    `Determine the point group of ${molecule.name} and write the decision-tree reasoning.`,
    `Choose one operation and write the full atom mapping after the operation.`,
  ];
}
