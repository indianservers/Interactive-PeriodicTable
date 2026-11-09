import { elements } from '../data/elements.js';
import { structureMolfile } from './structureDrawing.js';
import { prepareReaction } from './drawCalculations.js';

export const emptyReaction = () => ({ participants: [], conditions: '', arrow: 'forward' });
export function validateReaction(value, documentIds) {
  if (value == null) return emptyReaction();
  if (!Array.isArray(value.participants) || value.participants.length > 30 || typeof value.conditions !== 'string' || value.conditions.length > 2000 || !['forward', 'equilibrium'].includes(value.arrow)) throw Error('Invalid reaction workspace.');
  const ids = new Set();
  const participants = value.participants.map(p => {
    if (!Number.isInteger(p.id) || ids.has(p.id) || !documentIds.has(p.documentId) || !['reactant', 'product'].includes(p.role) || !Number.isInteger(p.coefficient) || p.coefficient < 1 || p.coefficient > 1000000 || typeof p.amount !== 'string' || p.amount.length > 50 || !['g', 'mol'].includes(p.unit)) throw Error('Invalid reaction participant.');
    ids.add(p.id);
    const maps = {};
    if (p.maps && (typeof p.maps !== 'object' || Array.isArray(p.maps) || Object.keys(p.maps).length > 500)) throw Error('Invalid atom maps.');
    for (const [atomId, label] of Object.entries(p.maps || {})) {
      if (!/^\d+$/.test(atomId) || !Number.isInteger(label) || label < 1 || label > 999) throw Error('Invalid atom mapping number.');
      maps[atomId] = label;
    }
    return { id: p.id, documentId: p.documentId, role: p.role, coefficient: p.coefficient, amount: p.amount, unit: p.unit, maps };
  });
  if (value.balancing !== undefined && !['auto','manual'].includes(value.balancing)) throw Error('Invalid balancing mode.');
  return { participants, conditions: value.conditions, arrow: value.arrow, ...(value.balancing ? {balancing:value.balancing} : {}) };
}
export function analyzeReactionMolecule(rd, model) {
  let mol;
  try {
    if (!model?.atoms.length) throw Error('This document has no atoms.');
    mol = rd.get_mol(structureMolfile(model));
    if (!mol) throw Error('Fix structure errors in this document.');
    const graph = JSON.parse(mol.get_json()), defaults = graph.defaults.atom, counts = {};
    for (const atom of graph.molecules[0].atoms) {
      const symbol = elements.find(e => e.atomicNumber === (atom.z ?? defaults.z))?.symbol;
      if (!symbol) throw Error('Unsupported atom.');
      counts[symbol] = (counts[symbol] || 0) + 1;
      counts.H = (counts.H || 0) + (atom.impHs ?? defaults.impHs ?? 0);
    }
    const keys = Object.keys(counts).filter(k => counts[k] > 0).sort((a,b) => counts.C ? (a === 'C' ? -1 : b === 'C' ? 1 : a === 'H' ? -1 : b === 'H' ? 1 : a.localeCompare(b)) : a.localeCompare(b));
    const formula = keys.map(k => k + (counts[k] > 1 ? counts[k] : '')).join('');
    return { formula, counts, mass: JSON.parse(mol.get_descriptors()).amw, charge: model.atoms.reduce((n,a) => n + (a.charge || 0),0), smiles: mol.get_smiles() };
  } finally { mol?.delete(); }
}
export function reactionBalance(participants, analyses, automatic = true) {
  const left = participants.filter(p => p.role === 'reactant'), right = participants.filter(p => p.role === 'product');
  if (!left.length || !right.length) throw Error('Add at least one drawn reactant and one drawn product.');
  const ordered = [...left, ...right];
  if (ordered.some(p => !analyses[p.documentId]?.formula)) throw Error('Every participant must have a valid drawn structure.');
  let coefficients;
  if (automatic) {
    const equation = `${left.map(p => analyses[p.documentId].formula).join(' + ')} -> ${right.map(p => analyses[p.documentId].formula).join(' + ')}`;
    coefficients = prepareReaction(equation).coefficients;
  } else coefficients = ordered.map(p => p.coefficient);
  const totals = {};
  let charge = 0;
  ordered.forEach((p, i) => {
    const factor = coefficients[i] * (p.role === 'reactant' ? 1 : -1), info = analyses[p.documentId];
    for (const [s,n] of Object.entries(info.counts)) totals[s] = (totals[s] || 0) + n * factor;
    charge += info.charge * factor;
  });
  if (Object.values(totals).some(n => Math.abs(n) > 1e-8) || charge !== 0) throw Error('Entered coefficients do not conserve atoms and charge. Adjust them or use Auto balance.');
  return Object.fromEntries(ordered.map((p,i) => [p.id, coefficients[i]]));
}
export function reactionYields(participants, analyses, coefficients) {
  const reactants = participants.filter(p => p.role === 'reactant');
  const extents = reactants.map(p => {
    if (p.amount.trim() === '' || !Number.isFinite(Number(p.amount)) || Number(p.amount) < 0) throw Error('Enter a nonnegative amount for each reactant.');
    const moles = Number(p.amount) / (p.unit === 'g' ? analyses[p.documentId].mass : 1);
    return moles / coefficients[p.id];
  });
  const extent = Math.min(...extents);
  return { limiting: reactants.filter((p,i) => Math.abs(extents[i] - extent) < 1e-10).map(p => p.id), rows: participants.map(p => ({ id:p.id, mol: p.role === 'product' ? extent * coefficients[p.id] : Math.max(0,Number(p.amount) / (p.unit === 'g' ? analyses[p.documentId].mass : 1) - extent * coefficients[p.id]), mass: analyses[p.documentId].mass })) };
}
export function mappingIssues(participants, documents) {
  const seen = new Map(), issues = [];
  for (const p of participants) for (const [atomId, label] of Object.entries(p.maps || {})) {
    const atom = documents.find(d => d.id === p.documentId)?.model?.atoms.find(a => a.id === Number(atomId));
    if (!atom) { issues.push(`Map ${label}: source atom no longer exists. Clear or reassign it.`); continue; }
    const record = seen.get(label) || {};
    if (record[p.role]) issues.push(`Map ${label}: used more than once on the ${p.role} side.`);
    record[p.role] = `${atom.element}:${atom.isotope || 0}`; seen.set(label,record);
  }
  for (const [label, pair] of seen) {
    if (!pair.reactant || !pair.product) issues.push(`Map ${label}: assign a matching atom on the other side.`);
    else if (pair.reactant !== pair.product) issues.push(`Map ${label}: mapped atoms must have the same element and isotope.`);
  }
  return issues;
}
