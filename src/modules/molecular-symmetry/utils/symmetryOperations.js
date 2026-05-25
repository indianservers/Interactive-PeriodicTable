const EPSILON = 1e-9;

export const toVector = (value = [0, 0, 0]) => ({
  x: Number(value[0]) || 0,
  y: Number(value[1]) || 0,
  z: Number(value[2]) || 0,
});

export const toArray = ({ x, y, z }) => [x, y, z];

export function normalize(vector) {
  const v = toVector(vector);
  const length = Math.hypot(v.x, v.y, v.z) || 1;
  return { x: v.x / length, y: v.y / length, z: v.z / length };
}

export function rotatePointAroundAxis(point, axis, angleRadians) {
  const p = toVector(point);
  const u = normalize(axis);
  const cos = Math.cos(angleRadians);
  const sin = Math.sin(angleRadians);
  const dot = u.x * p.x + u.y * p.y + u.z * p.z;
  return [
    p.x * cos + (u.y * p.z - u.z * p.y) * sin + u.x * dot * (1 - cos),
    p.y * cos + (u.z * p.x - u.x * p.z) * sin + u.y * dot * (1 - cos),
    p.z * cos + (u.x * p.y - u.y * p.x) * sin + u.z * dot * (1 - cos),
  ];
}

export function reflectPointAcrossPlane(point, planeNormal = [0, 0, 1], planePoint = [0, 0, 0]) {
  const p = toVector(point);
  const n = normalize(planeNormal);
  const q = toVector(planePoint);
  const dx = p.x - q.x;
  const dy = p.y - q.y;
  const dz = p.z - q.z;
  const distance = dx * n.x + dy * n.y + dz * n.z;
  return [
    p.x - 2 * distance * n.x,
    p.y - 2 * distance * n.y,
    p.z - 2 * distance * n.z,
  ];
}

export function invertPoint(point, center = [0, 0, 0]) {
  const p = toVector(point);
  const c = toVector(center);
  return [2 * c.x - p.x, 2 * c.y - p.y, 2 * c.z - p.z];
}

export function applyImproperRotation(point, axis = [0, 0, 1], order = 2, center = [0, 0, 0]) {
  const c = toVector(center);
  const shifted = [
    point[0] - c.x,
    point[1] - c.y,
    point[2] - c.z,
  ];
  const rotated = rotatePointAroundAxis(shifted, axis, (2 * Math.PI) / order);
  const reflected = reflectPointAcrossPlane(rotated, axis, [0, 0, 0]);
  return [reflected[0] + c.x, reflected[1] + c.y, reflected[2] + c.z];
}

export function compareCoordinates(pointA, pointB, tolerance = 0.15) {
  return Math.hypot(
    pointA[0] - pointB[0],
    pointA[1] - pointB[1],
    pointA[2] - pointB[2],
  ) <= tolerance + EPSILON;
}

export function transformPoint(point, symmetryElement) {
  if (!symmetryElement) return point;
  const power = Math.max(1, Number(symmetryElement.power || 1));
  if (symmetryElement.type === 'E') return [...point];
  if (symmetryElement.type === 'Cn') {
    return rotatePointAroundAxis(point, symmetryElement.axis || [0, 0, 1], (2 * Math.PI * power) / (symmetryElement.order || 1));
  }
  if (symmetryElement.type === 'sigma') {
    return reflectPointAcrossPlane(point, symmetryElement.planeNormal || [0, 0, 1], symmetryElement.planePoint || [0, 0, 0]);
  }
  if (symmetryElement.type === 'i') {
    return invertPoint(point, symmetryElement.center || [0, 0, 0]);
  }
  if (symmetryElement.type === 'Sn') {
    let result = [...point];
    for (let step = 0; step < power; step += 1) {
      result = applyImproperRotation(result, symmetryElement.axis || [0, 0, 1], symmetryElement.order || 2, symmetryElement.center || [0, 0, 0]);
    }
    return result;
  }
  return [...point];
}

export function applySymmetryOperation(molecule, symmetryElement) {
  return molecule.atoms.map(atom => ({
    ...atom,
    originalPosition: atom.position,
    position: transformPoint(atom.position, symmetryElement),
  }));
}

export function findAtomMapping(transformedAtoms, originalAtoms, tolerance = 0.15) {
  const used = new Set();
  const mapping = [];
  let valid = true;

  transformedAtoms.forEach(transformed => {
    let bestIndex = -1;
    let bestDistance = Infinity;

    originalAtoms.forEach((original, index) => {
      if (used.has(index) || original.element !== transformed.element) return;
      const distance = Math.hypot(
        transformed.position[0] - original.position[0],
        transformed.position[1] - original.position[1],
        transformed.position[2] - original.position[2],
      );
      if (distance < bestDistance) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    const matched = bestIndex >= 0 && bestDistance <= tolerance;
    if (matched) used.add(bestIndex);
    else valid = false;

    mapping.push({
      from: transformed.id,
      to: matched ? originalAtoms[bestIndex].id : 'no match',
      element: transformed.element,
      distance: Number(bestDistance === Infinity ? 999 : bestDistance.toFixed(3)),
      unchanged: matched && transformed.id === originalAtoms[bestIndex].id && compareCoordinates(transformed.position, originalAtoms[bestIndex].position, tolerance),
      valid: matched,
    });
  });

  return {
    valid: valid && used.size === transformedAtoms.length,
    mapping,
    unchangedAtoms: mapping.filter(item => item.unchanged).map(item => item.from),
    swappedAtoms: mapping.filter(item => item.valid && !item.unchanged).map(item => item.from),
  };
}

export function validateSymmetryOperation(molecule, symmetryElement, tolerance = 0.15) {
  const transformedAtoms = applySymmetryOperation(molecule, symmetryElement);
  const result = findAtomMapping(transformedAtoms, molecule.atoms, tolerance);
  const operation = symmetryElement?.label || 'selected operation';
  return {
    ...result,
    transformedAtoms,
    explanation: result.valid
      ? `The molecule is indistinguishable after ${operation}. Therefore, this is a valid symmetry operation.`
      : `The molecule does not match its original configuration after ${operation}. Therefore, this operation is not valid for this molecule.`,
  };
}

export function interpolateAtoms(originalAtoms, transformedAtoms, progress) {
  const byId = Object.fromEntries(transformedAtoms.map(atom => [atom.id, atom]));
  return originalAtoms.map(atom => {
    const target = byId[atom.id]?.position || atom.position;
    return {
      ...atom,
      position: [
        atom.position[0] + (target[0] - atom.position[0]) * progress,
        atom.position[1] + (target[1] - atom.position[1]) * progress,
        atom.position[2] + (target[2] - atom.position[2]) * progress,
      ],
    };
  });
}
