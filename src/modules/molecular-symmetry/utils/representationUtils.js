import { validateSymmetryOperation } from './symmetryOperations.js';

const dot = (a, b) => a.reduce((sum, value, index) => sum + value * b[index], 0);

function operationToken(element) {
  if (!element) return '';
  if (element.type === 'E') return 'E';
  if (element.type === 'Cn') return `C${element.order}`;
  if (element.type === 'Sn') return `S${element.order}`;
  if (element.type === 'sigma') return `sigma ${element.label || ''}`.toLowerCase();
  if (element.type === 'i') return 'i';
  return element.type;
}

export function representativeForClass(molecule, classInfo) {
  if (classInfo.label === 'E') return molecule.symmetryElements.find(element => element.type === 'E') || null;
  const tokens = classInfo.match || [];
  return molecule.symmetryElements.find(element => {
    const haystack = `${operationToken(element)} ${element.id} ${element.label}`.toLowerCase();
    return tokens.every(token => haystack.includes(String(token).toLowerCase()));
  }) || null;
}

function unorderedBondKey(from, to) {
  return [from, to].sort().join(':');
}

function transformedTrace(element) {
  if (!element || element.type === 'E') return 3;
  if (element.type === 'i') return -3;
  if (element.type === 'sigma') return 1;
  if (element.type === 'Cn') return 1 + 2 * Math.cos((2 * Math.PI) / (element.order || 1));
  if (element.type === 'Sn') return 2 * Math.cos((2 * Math.PI) / (element.order || 1)) - 1;
  return 0;
}

export function estimateReducibleCharacters(molecule, characterTable, basisType = 'atomSites') {
  const originalBonds = new Set(molecule.bonds.map(bond => unorderedBondKey(bond.from, bond.to)));
  return characterTable.classes.map(classInfo => {
    const element = representativeForClass(molecule, classInfo);
    if (!element) return 0;
    const result = validateSymmetryOperation(molecule, element);
    if (!result.valid) return 0;

    if (basisType === 'atomSites') {
      return result.mapping.filter(item => item.unchanged).length;
    }

    if (basisType === 'sigmaBonds') {
      const map = Object.fromEntries(result.mapping.map(item => [item.from, item.to]));
      return molecule.bonds.filter(bond => originalBonds.has(unorderedBondKey(map[bond.from], map[bond.to])) && unorderedBondKey(bond.from, bond.to) === unorderedBondKey(map[bond.from], map[bond.to])).length;
    }

    if (basisType === 'cartesian3N') {
      return result.mapping.filter(item => item.unchanged).length * transformedTrace(element);
    }

    return 0;
  }).map(value => Number(value.toFixed(3)));
}

export function decomposeReducibleRepresentation(characters, characterTable) {
  const h = characterTable.order || 1;
  return characterTable.irreps.map(irrep => {
    const weighted = characters.map((character, index) => character * irrep.chars[index] * characterTable.classes[index].size);
    const coefficient = weighted.reduce((sum, value) => sum + value, 0) / h;
    return {
      label: irrep.label,
      coefficient: Math.abs(coefficient) < 0.001 ? 0 : Number(coefficient.toFixed(3)),
      basis: irrep.basis,
      contribution: weighted.map(value => Number(value.toFixed(3))),
    };
  });
}

export function formatDecomposition(parts) {
  const visible = parts.filter(part => Math.abs(part.coefficient) > 0.001);
  if (visible.length === 0) return 'No irreducible components from the current characters.';
  return visible.map(part => `${part.coefficient === 1 ? '' : `${part.coefficient} `}${part.label}`).join(' + ');
}

export function classifyVibrationalActivity(decomposition) {
  return decomposition
    .filter(part => part.coefficient > 0)
    .map(part => {
      const basis = part.basis || '';
      const irActive = /(^|[^R])\b[xyz]\b|[,( ]x[,) ]|[,( ]y[,) ]|[,( ]z[,) ]/.test(basis.replace(/x2|y2|z2|xy|xz|yz/g, ''));
      const ramanActive = /x2|y2|z2|xy|xz|yz/.test(basis);
      return {
        ...part,
        irActive,
        ramanActive,
        activity: irActive && ramanActive ? 'IR and Raman' : irActive ? 'IR active' : ramanActive ? 'Raman active' : 'silent or rotational',
      };
    });
}

export function vibrationalRepresentation(molecule, characterTable) {
  const gamma3N = estimateReducibleCharacters(molecule, characterTable, 'cartesian3N');
  const translations = characterTable.classes.map((_, index) => {
    const classLabel = characterTable.classes[index].label;
    const matchingIrreps = characterTable.irreps.filter(irrep => /\b[xyz]\b|\(x, y\)|\(x, y, z\)/.test(irrep.basis || ''));
    return matchingIrreps.reduce((sum, irrep) => sum + irrep.chars[index], 0);
  });
  const rotations = characterTable.classes.map((_, index) => {
    const matchingIrreps = characterTable.irreps.filter(irrep => /\bR[xyz]\b|\(Rx, Ry\)|\(Rx, Ry, Rz\)/.test(irrep.basis || ''));
    return matchingIrreps.reduce((sum, irrep) => sum + irrep.chars[index], 0);
  });
  const gammaVib = gamma3N.map((value, index) => Number((value - translations[index] - rotations[index]).toFixed(3)));
  const decomposition = decomposeReducibleRepresentation(gammaVib, characterTable);
  return { gamma3N, translations, rotations, gammaVib, decomposition, activity: classifyVibrationalActivity(decomposition) };
}

export function innerProduct(rowA, rowB, characterTable) {
  return dot(rowA.map((value, index) => value * characterTable.classes[index].size), rowB) / characterTable.order;
}
