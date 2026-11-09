import { elements } from '../data/elements.js';

export function connectedAtoms(model, start) {
  const found = new Set([start]), queue = [start];
  while (queue.length) {
    const id = queue.shift();
    for (const bond of model.bonds) {
      const other = bond.a === id ? bond.b : bond.b === id ? bond.a : null;
      if (other !== null && !found.has(other)) { found.add(other); queue.push(other); }
    }
  }
  return [...found];
}
export function atomsInRegion(model, points, rectangle = false) {
  if (points.length < 2) return [];
  const first = points[0], last = points.at(-1);
  return model.atoms.filter(atom => {
    if (rectangle) return atom.x >= Math.min(first.x, last.x) && atom.x <= Math.max(first.x, last.x) && atom.y >= Math.min(first.y, last.y) && atom.y <= Math.max(first.y, last.y);
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const a = points[i], b = points[j];
      if ((a.y > atom.y) !== (b.y > atom.y) && atom.x < (b.x - a.x) * (atom.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
    }
    return inside;
  }).map(a => a.id);
}
export function transformFragment(model, ids, operation) {
  const chosen = new Set(ids), atoms = model.atoms.filter(a => chosen.has(a.id));
  if (!atoms.length) return model;
  if (operation === 'delete') return { ...model, atoms: model.atoms.filter(a => !chosen.has(a.id)), bonds: model.bonds.filter(b => !chosen.has(b.a) && !chosen.has(b.b)) };
  if (operation === 'duplicate') {
    let nextId = Math.max(0, ...model.atoms.map(a => a.id));
    const remap = new Map(atoms.map(a => [a.id, ++nextId]));
    return { ...model, atoms: [...model.atoms, ...atoms.map(a => ({ ...a, id: remap.get(a.id), x: a.x + 45, y: a.y + 45 }))], bonds: [...model.bonds, ...model.bonds.filter(b => chosen.has(b.a) && chosen.has(b.b)).map(b => ({ ...b, a: remap.get(b.a), b: remap.get(b.b) }))] };
  }
  if (model.bonds.some(b => chosen.has(b.a) !== chosen.has(b.b))) throw Error('Select the whole connected fragment before rotating or flipping, to preserve stereochemistry.');
  const cx = atoms.reduce((sum, a) => sum + a.x, 0) / atoms.length, cy = atoms.reduce((sum, a) => sum + a.y, 0) / atoms.length;
  const mirror = operation === 'flip-horizontal' || operation === 'flip-vertical';
  return { ...model, atoms: model.atoms.map(a => {
    if (!chosen.has(a.id)) return a;
    const x = a.x - cx, y = a.y - cy;
    if (operation === 'flip-horizontal') return { ...a, x: cx - x };
    if (operation === 'flip-vertical') return { ...a, y: cy - y };
    const angle = Math.PI / 6;
    return { ...a, x: cx + x * Math.cos(angle) - y * Math.sin(angle), y: cy + x * Math.sin(angle) + y * Math.cos(angle) };
  }), bonds: model.bonds.map(b => mirror && chosen.has(b.a) && [1, 6].includes(b.stereo) ? { ...b, stereo: b.stereo === 1 ? 6 : 1 } : b) };
}
export function snapBondPoint(origin, target, enabled = true) {
  if (!origin || !enabled) return target;
  const angle = Math.round(Math.atan2(target.y - origin.y, target.x - origin.x) / (Math.PI / 6)) * Math.PI / 6;
  const length = Math.max(35, Math.hypot(target.x - origin.x, target.y - origin.y));
  return { x: origin.x + Math.cos(angle) * length, y: origin.y + Math.sin(angle) * length };
}
export function structureIssues(model, stereo, invalid = false) {
  const issues = [];
  for (const atom of model.atoms) {
    const charge = atom.charge || 0;
    const valence = model.bonds.filter(b => b.a === atom.id || b.b === atom.id).reduce((n, b) => n + (b.order === 4 ? 1.5 : b.order), 0);
    const max = { H: 1, C: charge ? 3 : 4, N: charge > 0 ? 4 : charge < 0 ? 2 : 3, O: charge > 0 ? 3 : charge < 0 ? 1 : 2, B: charge < 0 ? 4 : 3, F: 1, Cl: 7, Br: 7, I: 7, Si: 4, P: 5, S: 6 }[atom.element];
    if (!elements.some(e => e.symbol === atom.element)) issues.push({ atomIds: [atom.id], severity: 'error', message: `Atom ${atom.id}: unknown element. Choose a valid element.` });
    if (max && valence > max) issues.push({ atomIds: [atom.id], severity: 'error', message: `Atom ${atom.id} (${atom.element}): bond order sum ${valence} exceeds ${max} for charge ${charge}. Reduce a bond order, remove an extra bond, or correct the formal charge.` });
    if (Math.abs(charge) > 2) issues.push({ atomIds: [atom.id], severity: 'warning', message: `Atom ${atom.id}: formal charge ${charge > 0 ? '+' : ''}${charge} is unusual. Check the intended ion and charge.` });
    if (['F', 'Cl', 'Br', 'I'].includes(atom.element) && valence > 1 && valence <= (max || 1)) issues.push({ atomIds: [atom.id], severity: 'warning', message: `Atom ${atom.id}: polyvalent ${atom.element}. Check charge and intended hypervalent structure.` });
  }
  for (const [index, tag] of stereo?.CIP_atoms || []) if (tag === '(?)' && model.atoms[index]) issues.push({ atomIds: [model.atoms[index].id], severity: 'warning', message: `Atom ${model.atoms[index].id}: stereochemistry is unspecified. Set a wedge/dashed bond if an individual stereoisomer is intended.` });
  if (invalid && !issues.some(i => i.severity === 'error')) issues.push({ atomIds: [], severity: 'error', message: 'RDKit could not validate this structure. Check aromatic bond patterns, formal charges, and stereobond assignments; the offending atom could not be localized.' });
  return issues;
}
