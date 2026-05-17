/* ─── Molecule Library ──────────────────────────────────────────────────────
   58 molecules across 4 categories / 12 subcategories.
   Coordinates are approximate Bohr-model representations (Å-scale) suitable
   for educational 3D visualization. Not crystallographic data.
────────────────────────────────────────────────────────────────────────────── */

import { EXPANDED_REAL_MOLECULES, EXPANDED_REAL_MOLECULE_LIBRARY } from './generatedMolecules.js';

const mk = (id, el, pos, color, radius, charge) =>
  ({ id, element: el, position: pos, color, radius, ...(charge ? { charge } : {}) });

const bond = (from, to, type = 'covalent') => ({ from, to, type });
const lbl  = (text, target, targetBond) =>
  targetBond ? { text, targetBond } : { text, target };

/* shared element colors */
const C = '#94a3b8', H = '#e2e8f0', O = '#ef4444', N = '#3b82f6',
      S = '#facc15', P = '#f97316', F = '#22c55e', Cl = '#4ade80',
      Br = '#fb923c', Na = '#a855f7', K = '#8b5cf6', Ca = '#ec4899',
      Mg = '#14b8a6', Fe = '#f59e0b', B2 = '#e879f9', I2 = '#a78bfa';

/* ─── helpers for common geometries ───────────────────────────────────────── */
// tetrahedral H positions around a center
const tetH = (cx, cy, cz, bl = 1.09) => [
  [cx + bl*0.577, cy + bl*0.577, cz + bl*0.577],
  [cx - bl*0.577, cy - bl*0.577, cz + bl*0.577],
  [cx - bl*0.577, cy + bl*0.577, cz - bl*0.577],
  [cx + bl*0.577, cy - bl*0.577, cz - bl*0.577],
];
// sp3 CH3 group H's along +x from carbon cx
const ch3H = (cx, cy, cz, dir = 1) => [
  [cx + dir*0.39, cy + 1.02, cz],
  [cx + dir*0.39, cy - 0.51, cz + 0.88],
  [cx + dir*0.39, cy - 0.51, cz - 0.88],
];
// benzene ring carbons & hydrogens
const benzRing = (cx=0, cy=0, rC=1.40, rH=2.48) =>
  Array.from({length:6}, (_,i) => {
    const a = (i * Math.PI) / 3;
    return { C: [cx+rC*Math.cos(a), cy+rC*Math.sin(a), 0],
             H: [cx+rH*Math.cos(a), cy+rH*Math.sin(a), 0] };
  });

/* ══════════════════════════════════════════════════════════════════════════════
   ORGANIC CHEMISTRY
══════════════════════════════════════════════════════════════════════════════ */

/* ── Alkanes ─────────────────────────────────────────────────────────────── */
const methane = {
  name:'Methane', formula:'CH₄',
  atoms:[
    mk('C','C',[0,0,0],C,0.50),
    ...tetH(0,0,0).map((p,i)=>mk(`H${i+1}`,'H',p,H,0.31)),
  ],
  bonds:[['C','H1'],['C','H2'],['C','H3'],['C','H4']].map(([f,t])=>bond(f,t)),
  labels:[lbl('Carbon','C'),lbl('Tetrahedral','H1')],
};

const ethane = {
  name:'Ethane', formula:'C₂H₆',
  atoms:[
    mk('C1','C',[-0.77,0,0],C,0.48), mk('C2','C',[0.77,0,0],C,0.48),
    mk('H1a','H',[-1.16,1.02,0],H,0.30), mk('H1b','H',[-1.16,-0.51,0.88],H,0.30), mk('H1c','H',[-1.16,-0.51,-0.88],H,0.30),
    mk('H2a','H',[1.16,1.02,0],H,0.30),  mk('H2b','H',[1.16,-0.51,0.88],H,0.30),  mk('H2c','H',[1.16,-0.51,-0.88],H,0.30),
  ],
  bonds:[bond('C1','C2'),...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b','H2c'].map(h=>bond('C2',h))],
  labels:[lbl('C–C single bond',null,['C1','C2']),lbl('sp³ Carbon','C1')],
};

const propane = {
  name:'Propane', formula:'C₃H₈',
  atoms:[
    mk('C1','C',[-1.54,0,0],C,0.48), mk('C2','C',[0,0.37,0],C,0.48), mk('C3','C',[1.54,0,0],C,0.48),
    mk('H1a','H',[-1.93,1.02,0],H,0.29),mk('H1b','H',[-1.93,-0.51,0.88],H,0.29),mk('H1c','H',[-1.93,-0.51,-0.88],H,0.29),
    mk('H2a','H',[0,1.46,0.63],H,0.29), mk('H2b','H',[0,1.46,-0.63],H,0.29),
    mk('H3a','H',[1.93,1.02,0],H,0.29), mk('H3b','H',[1.93,-0.51,0.88],H,0.29),mk('H3c','H',[1.93,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','C3'),...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b'].map(h=>bond('C2',h)),...['H3a','H3b','H3c'].map(h=>bond('C3',h))],
  labels:[lbl('Propane – linear alkane','C2')],
};

const butane = {
  name:'Butane', formula:'C₄H₁₀',
  atoms:[
    mk('C1','C',[-2.31,0,0],C,0.48),mk('C2','C',[-0.77,0.37,0],C,0.48),
    mk('C3','C',[0.77,-0.37,0],C,0.48),mk('C4','C',[2.31,0,0],C,0.48),
    mk('H1a','H',[-2.70,1.02,0],H,0.29),mk('H1b','H',[-2.70,-0.51,0.88],H,0.29),mk('H1c','H',[-2.70,-0.51,-0.88],H,0.29),
    mk('H2a','H',[-0.77,1.46,0.63],H,0.29),mk('H2b','H',[-0.77,1.46,-0.63],H,0.29),
    mk('H3a','H',[0.77,-1.46,0.63],H,0.29),mk('H3b','H',[0.77,-1.46,-0.63],H,0.29),
    mk('H4a','H',[2.70,1.02,0],H,0.29),mk('H4b','H',[2.70,-0.51,0.88],H,0.29),mk('H4c','H',[2.70,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','C3'),bond('C3','C4'),
    ...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b'].map(h=>bond('C2',h)),
    ...['H3a','H3b'].map(h=>bond('C3',h)),...['H4a','H4b','H4c'].map(h=>bond('C4',h))],
  labels:[lbl('Anti-conformation','C2')],
};

const isobutane = {
  name:'Isobutane', formula:'C₄H₁₀',
  atoms:[
    mk('CC','C',[0,0,0],C,0.48),
    mk('C1','C',[1.54,0,0],C,0.48),mk('C2','C',[-0.77,1.33,0],C,0.48),mk('C3','C',[-0.77,-1.33,0],C,0.48),
    mk('HC','H',[0,0,1.09],H,0.29),
    mk('H1a','H',[1.93,1.02,0],H,0.29),mk('H1b','H',[1.93,-0.51,0.88],H,0.29),mk('H1c','H',[1.93,-0.51,-0.88],H,0.29),
    mk('H2a','H',[-0.38,2.35,0.5],H,0.29),mk('H2b','H',[-1.7,1.5,0.5],H,0.29),mk('H2c','H',[-1.7,1.5,-0.5],H,0.29),
    mk('H3a','H',[-0.38,-2.35,0.5],H,0.29),mk('H3b','H',[-1.7,-1.5,0.5],H,0.29),mk('H3c','H',[-1.7,-1.5,-0.5],H,0.29),
  ],
  bonds:[bond('CC','C1'),bond('CC','C2'),bond('CC','C3'),bond('CC','HC'),
    ...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b','H2c'].map(h=>bond('C2',h)),...['H3a','H3b','H3c'].map(h=>bond('C3',h))],
  labels:[lbl('Branched alkane','CC')],
};

/* ── Alkenes & Alkynes ───────────────────────────────────────────────────── */
const ethylene = {
  name:'Ethylene', formula:'C₂H₄',
  atoms:[
    mk('C1','C',[-0.67,0,0],C,0.48),mk('C2','C',[0.67,0,0],C,0.48),
    mk('H1','H',[-1.25,0.93,0],H,0.30),mk('H2','H',[-1.25,-0.93,0],H,0.30),
    mk('H3','H',[1.25,0.93,0],H,0.30),mk('H4','H',[1.25,-0.93,0],H,0.30),
  ],
  bonds:[bond('C1','C2'),bond('C1','H1'),bond('C1','H2'),bond('C2','H3'),bond('C2','H4')],
  labels:[lbl('C=C Double Bond',null,['C1','C2']),lbl('sp² Carbon','C1')],
};

const propene = {
  name:'Propene', formula:'C₃H₆',
  atoms:[
    mk('C1','C',[-1.34,0,0],C,0.48),mk('C2','C',[0,0.15,0],C,0.48),mk('C3','C',[1.54,-0.2,0],C,0.48),
    mk('H1a','H',[-1.93,0.93,0],H,0.30),mk('H1b','H',[-1.93,-0.93,0],H,0.30),
    mk('H2','H',[0.2,1.22,0.35],H,0.30),
    mk('H3a','H',[1.93,0.82,0.4],H,0.29),mk('H3b','H',[1.93,-1.22,0.3],H,0.29),mk('H3c','H',[1.93,-0.2,-1.05],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','C3'),...['H1a','H1b'].map(h=>bond('C1',h)),bond('C2','H2'),...['H3a','H3b','H3c'].map(h=>bond('C3',h))],
  labels:[lbl('Double Bond',null,['C1','C2']),lbl('Methyl group','C3')],
};

const acetylene = {
  name:'Acetylene', formula:'C₂H₂',
  atoms:[
    mk('C1','C',[-0.60,0,0],C,0.48),mk('C2','C',[0.60,0,0],C,0.48),
    mk('H1','H',[-1.69,0,0],H,0.30),mk('H2','H',[1.69,0,0],H,0.30),
  ],
  bonds:[bond('C1','C2'),bond('C1','H1'),bond('C2','H2')],
  labels:[lbl('C≡C Triple Bond',null,['C1','C2']),lbl('Linear / sp Carbon','C1')],
};

/* ── Alcohols ────────────────────────────────────────────────────────────── */
const methanol = {
  name:'Methanol', formula:'CH₃OH',
  atoms:[
    mk('C','C',[-0.75,0,0],C,0.48),mk('O','O',[0.68,0,0],O,0.56),
    mk('HO','H',[1.12,0.88,0],H,0.30),
    mk('H1','H',[-1.14,1.02,0],H,0.30),mk('H2','H',[-1.14,-0.51,0.88],H,0.30),mk('H3','H',[-1.14,-0.51,-0.88],H,0.30),
  ],
  bonds:[bond('C','O'),bond('O','HO'),bond('C','H1'),bond('C','H2'),bond('C','H3')],
  labels:[lbl('Hydroxyl (–OH)','O'),lbl('Methyl (–CH₃)','C')],
};

const ethanol = {
  name:'Ethanol', formula:'C₂H₅OH',
  atoms:[
    mk('C1','C',[-1.23,0,0],C,0.48),mk('C2','C',[0.38,0.75,0],C,0.48),
    mk('O','O',[1.55,-0.2,0],O,0.56),mk('HO','H',[2.38,0.42,0],H,0.30),
    mk('H1a','H',[-1.7,1.0,0],H,0.29),mk('H1b','H',[-1.7,-0.5,0.9],H,0.29),mk('H1c','H',[-1.7,-0.5,-0.9],H,0.29),
    mk('H2a','H',[0.5,1.4,0.85],H,0.29),mk('H2b','H',[0.5,1.4,-0.85],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','O'),bond('O','HO'),...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b'].map(h=>bond('C2',h))],
  labels:[lbl('–OH Group','O'),lbl('Ethyl group','C1')],
};

const isopropanol = {
  name:'Isopropanol', formula:'C₃H₇OH',
  atoms:[
    mk('CC','C',[0,0,0],C,0.48),mk('C1','C',[-1.54,0,0],C,0.48),mk('C2','C',[1.54,0,0],C,0.48),
    mk('O','O',[0,1.43,0],O,0.56),mk('HO','H',[0,2.36,0],H,0.30),mk('HC','H',[0,0,-1.09],H,0.30),
    mk('H1a','H',[-1.93,1.02,0],H,0.29),mk('H1b','H',[-1.93,-0.51,0.88],H,0.29),mk('H1c','H',[-1.93,-0.51,-0.88],H,0.29),
    mk('H2a','H',[1.93,1.02,0],H,0.29),mk('H2b','H',[1.93,-0.51,0.88],H,0.29),mk('H2c','H',[1.93,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('CC','C1'),bond('CC','C2'),bond('CC','O'),bond('O','HO'),bond('CC','HC'),
    ...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b','H2c'].map(h=>bond('C2',h))],
  labels:[lbl('Secondary alcohol','CC'),lbl('–OH','O')],
};

/* ── Carbonyl Compounds ──────────────────────────────────────────────────── */
const formaldehyde = {
  name:'Formaldehyde', formula:'CH₂O',
  atoms:[
    mk('C','C',[0,0,0],C,0.48),mk('O','O',[0,1.22,0],O,0.56),
    mk('H1','H',[-0.94,-0.35,0],H,0.30),mk('H2','H',[0.94,-0.35,0],H,0.30),
  ],
  bonds:[bond('C','O'),bond('C','H1'),bond('C','H2')],
  labels:[lbl('C=O Carbonyl','O'),lbl('Planar sp²','C')],
};

const acetaldehyde = {
  name:'Acetaldehyde', formula:'C₂H₄O',
  atoms:[
    mk('C1','C',[-0.77,0,0],C,0.48),mk('C2','C',[0.77,0,0],C,0.48),
    mk('O','O',[0.77,1.22,0],O,0.56),mk('H2','H',[1.77,-0.55,0],H,0.30),
    mk('H1a','H',[-1.16,1.02,0],H,0.29),mk('H1b','H',[-1.16,-0.51,0.88],H,0.29),mk('H1c','H',[-1.16,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','O'),bond('C2','H2'),...['H1a','H1b','H1c'].map(h=>bond('C1',h))],
  labels:[lbl('Aldehyde (–CHO)','C2'),lbl('Methyl group','C1')],
};

const acetone = {
  name:'Acetone', formula:'C₃H₆O',
  atoms:[
    mk('CC','C',[0,0,0],C,0.48),mk('O','O',[0,1.22,0],O,0.56),
    mk('C1','C',[-1.54,-0.37,0],C,0.48),mk('C2','C',[1.54,-0.37,0],C,0.48),
    mk('H1a','H',[-1.93,0.55,0.5],H,0.29),mk('H1b','H',[-1.93,0.55,-0.5],H,0.29),mk('H1c','H',[-2.0,-1.4,0],H,0.29),
    mk('H2a','H',[1.93,0.55,0.5],H,0.29), mk('H2b','H',[1.93,0.55,-0.5],H,0.29), mk('H2c','H',[2.0,-1.4,0],H,0.29),
  ],
  bonds:[bond('CC','O'),bond('CC','C1'),bond('CC','C2'),
    ...['H1a','H1b','H1c'].map(h=>bond('C1',h)),...['H2a','H2b','H2c'].map(h=>bond('C2',h))],
  labels:[lbl('Ketone C=O','O'),lbl('Symmetric molecule','CC')],
};

const formicAcid = {
  name:'Formic Acid', formula:'HCOOH',
  atoms:[
    mk('C','C',[0,0,0],C,0.48),mk('O1','O',[0,1.22,0],O,0.56),mk('O2','O',[1.35,-0.3,0],O,0.56),
    mk('HO','H',[2.28,0.2,0],H,0.30),mk('HC','H',[-0.95,-0.55,0],H,0.30),
  ],
  bonds:[bond('C','O1'),bond('C','O2'),bond('O2','HO'),bond('C','HC')],
  labels:[lbl('C=O','O1'),lbl('–OH','O2'),lbl('Carboxyl group','C')],
};

const aceticAcid = {
  name:'Acetic Acid', formula:'CH₃COOH',
  atoms:[
    mk('C1','C',[-1.49,0,0],C,0.48),mk('C2','C',[0,0,0],C,0.48),
    mk('O1','O',[0.55,1.13,0],O,0.56),mk('O2','O',[0.75,-1.0,0],O,0.56),mk('HO','H',[1.69,-1.4,0],H,0.30),
    mk('H1a','H',[-1.88,1.02,0],H,0.29),mk('H1b','H',[-1.88,-0.51,0.88],H,0.29),mk('H1c','H',[-1.88,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','O1'),bond('C2','O2'),bond('O2','HO'),...['H1a','H1b','H1c'].map(h=>bond('C1',h))],
  labels:[lbl('Carboxyl (–COOH)','C2'),lbl('Methyl group','C1')],
};

/* ── Nitrogen Compounds ──────────────────────────────────────────────────── */
const methylamine = {
  name:'Methylamine', formula:'CH₅N',
  atoms:[
    mk('C','C',[-0.74,0,0],C,0.48),mk('N','N',[0.74,0,0],N,0.52),
    mk('HNa','H',[1.2,0.9,0.3],H,0.30),mk('HNb','H',[1.2,0.9,-0.3],H,0.30),
    mk('H1','H',[-1.13,1.02,0],H,0.29),mk('H2','H',[-1.13,-0.51,0.88],H,0.29),mk('H3','H',[-1.13,-0.51,-0.88],H,0.29),
  ],
  bonds:[bond('C','N'),bond('N','HNa'),bond('N','HNb'),bond('C','H1'),bond('C','H2'),bond('C','H3')],
  labels:[lbl('Amine group (–NH₂)','N'),lbl('Methyl','C')],
};

const urea = {
  name:'Urea', formula:'CH₄N₂O',
  atoms:[
    mk('C','C',[0,0,0],C,0.48),mk('O','O',[0,1.22,0],O,0.56),
    mk('N1','N',[-1.33,-0.4,0],N,0.52),mk('N2','N',[1.33,-0.4,0],N,0.52),
    mk('H1a','H',[-1.8,-1.3,0.35],H,0.30),mk('H1b','H',[-1.8,-1.3,-0.35],H,0.30),
    mk('H2a','H',[1.8,-1.3,0.35],H,0.30), mk('H2b','H',[1.8,-1.3,-0.35],H,0.30),
  ],
  bonds:[bond('C','O'),bond('C','N1'),bond('C','N2'),bond('N1','H1a'),bond('N1','H1b'),bond('N2','H2a'),bond('N2','H2b')],
  labels:[lbl('C=O','O'),lbl('Two NH₂ groups','N1')],
};

const glycine = {
  name:'Glycine', formula:'C₂H₅NO₂',
  atoms:[
    mk('N','N',[-2.0,0,0],N,0.52),mk('Ca','C',[-0.74,0,0],C,0.48),
    mk('Cc','C',[0.74,0.35,0],C,0.48),mk('O1','O',[0.9,1.57,0],O,0.56),
    mk('O2','O',[1.85,-0.5,0],O,0.56),mk('HO','H',[2.75,-0.1,0],H,0.30),
    mk('HNa','H',[-2.5,0.9,0.3],H,0.30),mk('HNb','H',[-2.5,0.9,-0.3],H,0.30),mk('HNc','H',[-2.5,-0.8,0],H,0.30),
    mk('HCa','H',[-0.74,1.09,0.63],H,0.30),mk('HCb','H',[-0.74,1.09,-0.63],H,0.30),
  ],
  bonds:[bond('N','Ca'),bond('Ca','Cc'),bond('Cc','O1'),bond('Cc','O2'),bond('O2','HO'),
    bond('N','HNa'),bond('N','HNb'),bond('N','HNc'),bond('Ca','HCa'),bond('Ca','HCb')],
  labels:[lbl('Amino group','N'),lbl('Carboxyl group','Cc'),lbl('α-carbon','Ca')],
};

/* ── Aromatics ───────────────────────────────────────────────────────────── */
const benzeneRing = benzRing();
const benzene = {
  name:'Benzene', formula:'C₆H₆',
  atoms:[
    ...benzeneRing.map(({C:p},i)=>mk(`C${i+1}`,'C',p,'#94a3b8',0.45)),
    ...benzeneRing.map(({H:p},i)=>mk(`H${i+1}`,'H',p,H,0.28)),
  ],
  bonds:[
    ...Array.from({length:6},(_,i)=>bond(`C${i+1}`,`C${(i+1)%6+1}`)),
    ...Array.from({length:6},(_,i)=>bond(`C${i+1}`,`H${i+1}`)),
  ],
  labels:[lbl('Aromatic ring','C1'),lbl('Delocalized π electrons','C4')],
};

const toluene = {
  name:'Toluene', formula:'C₇H₈',
  atoms:[
    ...benzeneRing.map(({C:p},i)=>mk(`C${i+1}`,'C',p,'#94a3b8',0.45)),
    ...benzeneRing.slice(1).map(({H:p},i)=>mk(`H${i+2}`,'H',p,H,0.28)),
    mk('Cme','C',[2.53,0,0],C,0.46),
    mk('HM1','H',[3.17,0.5,0.5],H,0.29),mk('HM2','H',[3.17,0.5,-0.5],H,0.29),mk('HM3','H',[3.17,-1.0,0],H,0.29),
  ],
  bonds:[
    ...Array.from({length:6},(_,i)=>bond(`C${i+1}`,`C${(i+1)%6+1}`)),
    ...Array.from({length:5},(_,i)=>bond(`C${i+2}`,`H${i+2}`)),
    bond('C1','Cme'),bond('Cme','HM1'),bond('Cme','HM2'),bond('Cme','HM3'),
  ],
  labels:[lbl('Methyl group','Cme'),lbl('Aromatic ring','C1')],
};

const phenol = {
  name:'Phenol', formula:'C₆H₆O',
  atoms:[
    ...benzeneRing.map(({C:p},i)=>mk(`C${i+1}`,'C',p,'#94a3b8',0.45)),
    ...benzeneRing.slice(1).map(({H:p},i)=>mk(`H${i+2}`,'H',p,H,0.28)),
    mk('O','O',[2.48,0,0],O,0.56),mk('HO','H',[3.4,0,0],H,0.30),
  ],
  bonds:[
    ...Array.from({length:6},(_,i)=>bond(`C${i+1}`,`C${(i+1)%6+1}`)),
    ...Array.from({length:5},(_,i)=>bond(`C${i+2}`,`H${i+2}`)),
    bond('C1','O'),bond('O','HO'),
  ],
  labels:[lbl('Hydroxyl group','O'),lbl('Aromatic ring','C1')],
};

const aniline = {
  name:'Aniline', formula:'C₆H₇N',
  atoms:[
    ...benzeneRing.map(({C:p},i)=>mk(`C${i+1}`,'C',p,'#94a3b8',0.45)),
    ...benzeneRing.slice(1).map(({H:p},i)=>mk(`H${i+2}`,'H',p,H,0.28)),
    mk('N','N',[2.48,0,0],N,0.52),
    mk('HNa','H',[2.95,0.85,0.35],H,0.30),mk('HNb','H',[2.95,0.85,-0.35],H,0.30),
  ],
  bonds:[
    ...Array.from({length:6},(_,i)=>bond(`C${i+1}`,`C${(i+1)%6+1}`)),
    ...Array.from({length:5},(_,i)=>bond(`C${i+2}`,`H${i+2}`)),
    bond('C1','N'),bond('N','HNa'),bond('N','HNb'),
  ],
  labels:[lbl('Amino group (–NH₂)','N'),lbl('Aromatic ring','C1')],
};

/* ── Cyclic Hydrocarbons ─────────────────────────────────────────────────── */
const cyclohexane = {
  name:'Cyclohexane', formula:'C₆H₁₂',
  atoms:[
    // chair conformation
    mk('C1','C',[1.33,0,0.25],C,0.46),  mk('C2','C',[0.67,1.15,-0.25],C,0.46),
    mk('C3','C',[-0.67,1.15,0.25],C,0.46),mk('C4','C',[-1.33,0,-0.25],C,0.46),
    mk('C5','C',[-0.67,-1.15,0.25],C,0.46),mk('C6','C',[0.67,-1.15,-0.25],C,0.46),
    // axial H's
    mk('H1a','H',[1.33,0,1.34],H,0.29),mk('H2a','H',[0.67,1.15,-1.34],H,0.29),
    mk('H3a','H',[-0.67,1.15,1.34],H,0.29),mk('H4a','H',[-1.33,0,-1.34],H,0.29),
    mk('H5a','H',[-0.67,-1.15,1.34],H,0.29),mk('H6a','H',[0.67,-1.15,-1.34],H,0.29),
    // equatorial H's (simplified outward)
    mk('H1e','H',[2.40,0,0.1],H,0.29),  mk('H2e','H',[1.2,2.07,-0.1],H,0.29),
    mk('H3e','H',[-1.2,2.07,0.1],H,0.29),mk('H4e','H',[-2.40,0,-0.1],H,0.29),
    mk('H5e','H',[-1.2,-2.07,0.1],H,0.29),mk('H6e','H',[1.2,-2.07,-0.1],H,0.29),
  ],
  bonds:[bond('C1','C2'),bond('C2','C3'),bond('C3','C4'),bond('C4','C5'),bond('C5','C6'),bond('C6','C1'),
    ...['H1a','H1e'].map(h=>bond('C1',h)),...['H2a','H2e'].map(h=>bond('C2',h)),
    ...['H3a','H3e'].map(h=>bond('C3',h)),...['H4a','H4e'].map(h=>bond('C4',h)),
    ...['H5a','H5e'].map(h=>bond('C5',h)),...['H6a','H6e'].map(h=>bond('C6',h))],
  labels:[lbl('Chair conformation','C1'),lbl('Axial H','H1a'),lbl('Equatorial H','H1e')],
};

const cyclopentane = {
  name:'Cyclopentane', formula:'C₅H₁₀',
  atoms:[
    ...Array.from({length:5},(_,i)=>mk(`C${i+1}`,'C',[
      1.0*Math.cos(i*Math.PI*2/5), 1.0*Math.sin(i*Math.PI*2/5), i%2===0?0.15:-0.15
    ],C,0.46)),
    ...Array.from({length:5},(_,i)=>mk(`H${i+1}a`,'H',[
      2.1*Math.cos(i*Math.PI*2/5), 2.1*Math.sin(i*Math.PI*2/5), 0.9
    ],H,0.29)),
    ...Array.from({length:5},(_,i)=>mk(`H${i+1}b`,'H',[
      2.1*Math.cos(i*Math.PI*2/5), 2.1*Math.sin(i*Math.PI*2/5), -0.9
    ],H,0.29)),
  ],
  bonds:[
    ...Array.from({length:5},(_,i)=>bond(`C${i+1}`,`C${(i+1)%5+1}`)),
    ...Array.from({length:5},(_,i)=>bond(`C${i+1}`,`H${i+1}a`)),
    ...Array.from({length:5},(_,i)=>bond(`C${i+1}`,`H${i+1}b`)),
  ],
  labels:[lbl('Cyclopentane ring','C1')],
};

/* ══════════════════════════════════════════════════════════════════════════════
   INORGANIC CHEMISTRY
══════════════════════════════════════════════════════════════════════════════ */

/* ── Diatomics ───────────────────────────────────────────────────────────── */
const hydrogen  = { name:'Hydrogen',  formula:'H₂',  atoms:[mk('H1','H',[-0.37,0,0],H,0.31),mk('H2','H',[0.37,0,0],H,0.31)], bonds:[bond('H1','H2')], labels:[lbl('H–H bond',null,['H1','H2'])] };
const oxygen    = { name:'Oxygen',    formula:'O₂',  atoms:[mk('O1','O',[-0.61,0,0],O,0.56),mk('O2','O',[0.61,0,0],O,0.56)], bonds:[bond('O1','O2')], labels:[lbl('O=O double bond',null,['O1','O2'])] };
const nitrogen  = { name:'Nitrogen',  formula:'N₂',  atoms:[mk('N1','N',[-0.55,0,0],N,0.52),mk('N2','N',[0.55,0,0],N,0.52)], bonds:[bond('N1','N2')], labels:[lbl('N≡N triple bond',null,['N1','N2'])] };
const fluorine  = { name:'Fluorine',  formula:'F₂',  atoms:[mk('F1','F',[-0.71,0,0],F,0.50),mk('F2','F',[0.71,0,0],F,0.50)], bonds:[bond('F1','F2')], labels:[lbl('F–F weak bond',null,['F1','F2'])] };
const chlorine  = { name:'Chlorine',  formula:'Cl₂', atoms:[mk('Cl1','Cl',[-0.99,0,0],Cl,0.66),mk('Cl2','Cl',[0.99,0,0],Cl,0.66)], bonds:[bond('Cl1','Cl2')], labels:[lbl('Cl–Cl bond',null,['Cl1','Cl2'])] };
const hf        = { name:'Hydrogen Fluoride', formula:'HF', atoms:[mk('H','H',[-0.92,0,0],H,0.31),mk('F','F',[0,0,0],F,0.56)], bonds:[bond('H','F')], labels:[lbl('Polar H–F bond',null,['H','F']),lbl('Most electronegative','F')] };
const hcl       = { name:'Hydrogen Chloride', formula:'HCl',atoms:[mk('H','H',[-1.27,0,0],H,0.31),mk('Cl','Cl',[0,0,0],Cl,0.66)], bonds:[bond('H','Cl')], labels:[lbl('H–Cl polar bond',null,['H','Cl'])] };
const hbr       = { name:'Hydrogen Bromide',  formula:'HBr',atoms:[mk('H','H',[-1.41,0,0],H,0.31),mk('Br','Br',[0,0,0],Br,0.73)], bonds:[bond('H','Br')], labels:[lbl('H–Br bond',null,['H','Br'])] };

/* ── Oxides & Water ──────────────────────────────────────────────────────── */
const water = {
  name:'Water', formula:'H₂O',
  atoms:[mk('O','O',[0,0,0],O,0.60),mk('H1','H',[0.96,0.77,0],H,0.31),mk('H2','H',[-0.96,0.77,0],H,0.31)],
  bonds:[bond('O','H1'),bond('O','H2')],
  labels:[lbl('Bent molecule (104.5°)','O'),lbl('Polar bond',null,['O','H1'])],
};

const h2o2 = {
  name:'Hydrogen Peroxide', formula:'H₂O₂',
  atoms:[mk('O1','O',[0.72,0,0],O,0.56),mk('O2','O',[-0.72,0,0],O,0.56),mk('H1','H',[1.4,0.96,0],H,0.30),mk('H2','H',[-1.4,-0.96,0],H,0.30)],
  bonds:[bond('O1','O2'),bond('O1','H1'),bond('O2','H2')],
  labels:[lbl('O–O single bond',null,['O1','O2'])],
};

const co2 = {
  name:'Carbon Dioxide', formula:'CO₂',
  atoms:[mk('C','C',[0,0,0],C,0.50),mk('O1','O',[-1.3,0,0],O,0.56),mk('O2','O',[1.3,0,0],O,0.56)],
  bonds:[bond('C','O1'),bond('C','O2')],
  labels:[lbl('C=O Double Bond',null,['C','O1']),lbl('Linear molecule','C')],
};

const co = {
  name:'Carbon Monoxide', formula:'CO',
  atoms:[mk('C','C',[-0.56,0,0],C,0.50),mk('O','O',[0.56,0,0],O,0.56)],
  bonds:[bond('C','O')],
  labels:[lbl('C≡O Triple Bond',null,['C','O']),lbl('Toxic gas','C')],
};

const so2 = {
  name:'Sulfur Dioxide', formula:'SO₂',
  atoms:[mk('S','S',[0,0,0],S,0.70),mk('O1','O',[-1.29,-0.68,0],O,0.56),mk('O2','O',[1.29,-0.68,0],O,0.56)],
  bonds:[bond('S','O1'),bond('S','O2')],
  labels:[lbl('Bent (119°)','S'),lbl('Acid rain precursor','O1')],
};

const so3 = {
  name:'Sulfur Trioxide', formula:'SO₃',
  atoms:[mk('S','S',[0,0,0],S,0.70),mk('O1','O',[0,1.43,0],O,0.56),mk('O2','O',[-1.24,-0.72,0],O,0.56),mk('O3','O',[1.24,-0.72,0],O,0.56)],
  bonds:[bond('S','O1'),bond('S','O2'),bond('S','O3')],
  labels:[lbl('Trigonal planar','S')],
};

const no2 = {
  name:'Nitrogen Dioxide', formula:'NO₂',
  atoms:[mk('N','N',[0,0,0],N,0.52),mk('O1','O',[-1.2,-0.6,0],O,0.56),mk('O2','O',[1.2,-0.6,0],O,0.56)],
  bonds:[bond('N','O1'),bond('N','O2')],
  labels:[lbl('Bent (134°)','N'),lbl('Brown smog component','O1')],
};

const no = {
  name:'Nitric Oxide', formula:'NO',
  atoms:[mk('N','N',[-0.54,0,0],N,0.52),mk('O','O',[0.54,0,0],O,0.56)],
  bonds:[bond('N','O')],
  labels:[lbl('Free radical / signaling molecule',null,['N','O'])],
};

/* ── Acids ───────────────────────────────────────────────────────────────── */
const h2so4 = {
  name:'Sulfuric Acid', formula:'H₂SO₄',
  atoms:[
    mk('S','S',[0,0,0],S,0.75),mk('O1','O',[0,1.45,0],O,0.56),mk('O2','O',[0,-1.45,0],O,0.56),
    mk('O3','O',[1.45,0,0],O,0.56),mk('O4','O',[-1.45,0,0],O,0.56),
    mk('H1','H',[2.38,0.42,0],H,0.30),mk('H2','H',[-2.38,0.42,0],H,0.30),
  ],
  bonds:[bond('S','O1'),bond('S','O2'),bond('S','O3'),bond('S','O4'),bond('O3','H1'),bond('O4','H2')],
  labels:[lbl('Tetrahedral S center','S'),lbl('–OH groups','O3')],
};

const hno3 = {
  name:'Nitric Acid', formula:'HNO₃',
  atoms:[
    mk('N','N',[0,0,0],N,0.52),mk('O1','O',[0,1.22,0],O,0.56),
    mk('O2','O',[-1.2,-0.55,0],O,0.56),mk('O3','O',[1.2,-0.55,0],O,0.56),mk('H','H',[-2.12,-0.1,0],H,0.30),
  ],
  bonds:[bond('N','O1'),bond('N','O2'),bond('N','O3'),bond('O2','H')],
  labels:[lbl('N=O','O1'),lbl('–OH group','O2'),lbl('Strong acid','N')],
};

const h3po4 = {
  name:'Phosphoric Acid', formula:'H₃PO₄',
  atoms:[
    mk('P','P',[0,0,0],P,0.75),mk('O1','O',[0,1.49,0],O,0.56),
    mk('O2','O',[-1.26,-0.4,0.7],O,0.56),mk('O3','O',[1.26,-0.4,0.7],O,0.56),mk('O4','O',[0,-0.4,-1.45],O,0.56),
    mk('H2','H',[-1.72,-1.1,1.2],H,0.30),mk('H3','H',[1.72,-1.1,1.2],H,0.30),mk('H4','H',[0,-1.3,-2.0],H,0.30),
  ],
  bonds:[bond('P','O1'),bond('P','O2'),bond('P','O3'),bond('P','O4'),bond('O2','H2'),bond('O3','H3'),bond('O4','H4')],
  labels:[lbl('Tetrahedral P','P'),lbl('P=O','O1'),lbl('3 × –OH groups','O2')],
};

const carbonicAcid = {
  name:'Carbonic Acid', formula:'H₂CO₃',
  atoms:[
    mk('C','C',[0,0,0],C,0.48),mk('O1','O',[0,1.22,0],O,0.56),
    mk('O2','O',[-1.24,-0.52,0],O,0.56),mk('O3','O',[1.24,-0.52,0],O,0.56),
    mk('H2','H',[-2.16,-0.1,0],H,0.30),mk('H3','H',[2.16,-0.1,0],H,0.30),
  ],
  bonds:[bond('C','O1'),bond('C','O2'),bond('C','O3'),bond('O2','H2'),bond('O3','H3')],
  labels:[lbl('C=O','O1'),lbl('Weak acid in blood/rain','C')],
};

/* ── Salts & Bases ───────────────────────────────────────────────────────── */
const nacl = {
  name:'Sodium Chloride', formula:'NaCl',
  atoms:[mk('Na','Na',[-1.3,0,0],Na,0.80,'+'),mk('Cl','Cl',[1.3,0,0],Cl,0.75,'−')],
  bonds:[bond('Na','Cl','ionic-dashed')],
  labels:[lbl('Na⁺ cation','Na'),lbl('Cl⁻ anion','Cl'),lbl('Ionic Bond',null,['Na','Cl'])],
};

const nabh4 = {
  name:'Sodium Borohydride', formula:'NaBH₄',
  atoms:[
    mk('Na','Na',[-2.6,0.8,0],Na,0.9,'+'),mk('B','B',[0,0,0],B2,0.65,'−'),
    mk('H1','H',[0,1.25,0],H,0.35),mk('H2','H',[1.18,-0.6,0.3],H,0.35),
    mk('H3','H',[-1.18,-0.6,0.3],H,0.35),mk('H4','H',[0,-0.5,-1.2],H,0.35),
  ],
  bonds:[bond('B','H1'),bond('B','H2'),bond('B','H3'),bond('B','H4'),bond('Na','B','ionic-dashed')],
  labels:[lbl('Na⁺ cation','Na'),lbl('BH₄⁻ anion','B'),lbl('Ionic Bond',null,['Na','B'])],
};

const naoh = {
  name:'Sodium Hydroxide', formula:'NaOH',
  atoms:[mk('Na','Na',[-2.0,0,0],Na,0.80,'+'),mk('O','O',[0,0,0],O,0.56),mk('H','H',[0.96,0,0],H,0.30)],
  bonds:[bond('Na','O','ionic-dashed'),bond('O','H')],
  labels:[lbl('Na⁺ Ion','Na'),lbl('Hydroxide (OH⁻)','O'),lbl('Ionic Bond',null,['Na','O'])],
};

const koh = {
  name:'Potassium Hydroxide', formula:'KOH',
  atoms:[mk('K','K',[-2.2,0,0],K,0.90,'+'),mk('O','O',[0,0,0],O,0.56),mk('H','H',[0.96,0,0],H,0.30)],
  bonds:[bond('K','O','ionic-dashed'),bond('O','H')],
  labels:[lbl('K⁺ Ion','K'),lbl('OH⁻ Group','O'),lbl('Ionic Bond',null,['K','O'])],
};

const nh4cl = {
  name:'Ammonium Chloride', formula:'NH₄Cl',
  atoms:[
    mk('N','N',[0,0,0],N,0.52,'+'),
    ...tetH(0,0,0,0.90).map((p,i)=>mk(`H${i+1}`,'H',p,H,0.30)),
    mk('Cl','Cl',[-3.5,0,0],Cl,0.75,'−'),
  ],
  bonds:[...['H1','H2','H3','H4'].map(h=>bond('N',h)),bond('N','Cl','ionic-dashed')],
  labels:[lbl('NH₄⁺ cation','N'),lbl('Cl⁻ anion','Cl'),lbl('Ionic Bond',null,['N','Cl'])],
};

const cacl2 = {
  name:'Calcium Chloride', formula:'CaCl₂',
  atoms:[mk('Ca','Ca',[0,0,0],Ca,0.95,'+'),mk('Cl1','Cl',[-2.4,0,0],Cl,0.75,'−'),mk('Cl2','Cl',[2.4,0,0],Cl,0.75,'−')],
  bonds:[bond('Ca','Cl1','ionic-dashed'),bond('Ca','Cl2','ionic-dashed')],
  labels:[lbl('Ca²⁺','Ca'),lbl('Cl⁻','Cl1')],
};

/* ══════════════════════════════════════════════════════════════════════════════
   ATMOSPHERIC CHEMISTRY
══════════════════════════════════════════════════════════════════════════════ */
const ozone = {
  name:'Ozone', formula:'O₃',
  atoms:[mk('O1','O',[0,0,0],O,0.60),mk('O2','O',[-1.28,-0.5,0],O,0.56),mk('O3','O',[1.28,-0.5,0],O,0.56)],
  bonds:[bond('O1','O2'),bond('O1','O3')],
  labels:[lbl('Bent (117°)','O1'),lbl('UV shield in stratosphere','O2')],
};

const n2o = {
  name:'Nitrous Oxide', formula:'N₂O',
  atoms:[mk('N1','N',[-0.55,0,0],N,0.52),mk('N2','N',[0.55,0,0],N,0.52),mk('O','O',[1.68,0,0],O,0.56)],
  bonds:[bond('N1','N2'),bond('N2','O')],
  labels:[lbl('Linear N–N–O','N2'),lbl('Laughing gas','N1')],
};

const ammonia = {
  name:'Ammonia', formula:'NH₃',
  atoms:[
    mk('N','N',[0,0.2,0],N,0.56),
    mk('H1','H',[1.02,-0.4,0.59],H,0.31),mk('H2','H',[-1.02,-0.4,0.59],H,0.31),mk('H3','H',[0,-0.4,-1.17],H,0.31),
  ],
  bonds:[bond('N','H1'),bond('N','H2'),bond('N','H3')],
  labels:[lbl('Trigonal pyramidal','N'),lbl('Lone pair on N','N')],
};

/* ── Reactive Species ────────────────────────────────────────────────────── */
const ozone2 = ozone; // duplicate for reactive section (will deduplicate in lib)
const hydroxyl = {
  name:'Hydroxyl Radical', formula:'·OH',
  atoms:[mk('O','O',[0,0,0],O,0.56),mk('H','H',[0.96,0,0],H,0.30)],
  bonds:[bond('O','H')],
  labels:[lbl('Reactive radical','O'),lbl('Atmospheric oxidant','H')],
};

/* ══════════════════════════════════════════════════════════════════════════════
   BIOCHEMISTRY
══════════════════════════════════════════════════════════════════════════════ */
const alanine = {
  name:'Alanine', formula:'C₃H₇NO₂',
  atoms:[
    mk('N','N',[-2.0,0,0],N,0.52),mk('Ca','C',[-0.74,0,0],C,0.48),
    mk('Cb','C',[-0.74,-1.43,0.5],C,0.46),mk('Cc','C',[0.74,0.35,0],C,0.48),
    mk('O1','O',[0.9,1.57,0],O,0.56),mk('O2','O',[1.85,-0.5,0],O,0.56),mk('HO','H',[2.75,-0.1,0],H,0.30),
    mk('HNa','H',[-2.5,0.9,0.3],H,0.30),mk('HNb','H',[-2.5,0.9,-0.3],H,0.30),mk('HNc','H',[-2.5,-0.8,0],H,0.30),
    mk('HCa','H',[-0.74,1.09,0.63],H,0.30),
    mk('HCb1','H',[-0.74,-2.52,0.5],H,0.29),mk('HCb2','H',[-1.7,-1.2,1.2],H,0.29),mk('HCb3','H',[0.22,-1.2,1.2],H,0.29),
  ],
  bonds:[bond('N','Ca'),bond('Ca','Cb'),bond('Ca','Cc'),bond('Cc','O1'),bond('Cc','O2'),bond('O2','HO'),
    bond('N','HNa'),bond('N','HNb'),bond('N','HNc'),bond('Ca','HCa'),
    bond('Cb','HCb1'),bond('Cb','HCb2'),bond('Cb','HCb3')],
  labels:[lbl('Amino group (–NH₃⁺)','N'),lbl('Carboxyl (–COOH)','Cc'),lbl('α-Carbon','Ca'),lbl('Methyl side chain','Cb')],
};

const adenine = {
  name:'Adenine', formula:'C₅H₅N₅',
  atoms:[
    mk('N1','N',[-1.4,1.2,0],N,0.52),mk('C2','C',[0,1.5,0],C,0.46),mk('N3','N',[1.1,0.6,0],N,0.52),
    mk('C4','C',[0.8,-0.7,0],C,0.46),mk('C5','C',[-0.4,-0.7,0],C,0.46),mk('C6','C',[-1.4,0.1,0],C,0.46),
    mk('N6','N',[-2.7,-0.3,0],N,0.52),mk('N7','N',[1.8,-1.5,0],N,0.52),
    mk('C8','C',[1.4,-2.5,0],C,0.46),mk('N9','N',[0.1,-2.0,0],N,0.52),
    mk('H2','H',[0.3,2.55,0],H,0.28),mk('H8','H',[2.1,-3.3,0],H,0.28),
    mk('H6a','H',[-3.1,0.6,0.35],H,0.28),mk('H6b','H',[-3.1,0.6,-0.35],H,0.28),
  ],
  bonds:[bond('N1','C2'),bond('C2','N3'),bond('N3','C4'),bond('C4','C5'),bond('C5','C6'),bond('C6','N1'),
    bond('C4','N9'),bond('C5','N7'),bond('N7','C8'),bond('C8','N9'),
    bond('C6','N6'),bond('C2','H2'),bond('C8','H8'),bond('N6','H6a'),bond('N6','H6b')],
  labels:[lbl('Purine base','C5'),lbl('Amino group','N6'),lbl('DNA/RNA base','N9')],
};

const glucose = {
  name:'Glucose (Pyranose)', formula:'C₆H₁₂O₆',
  atoms:[
    // 6-membered pyranose ring (5C + 1O)
    mk('C1','C',[1.4,0,0],C,0.46),mk('O_r','O',[0.7,1.21,0],O,0.50),
    mk('C2','C',[-0.7,1.21,0],C,0.46),mk('C3','C',[-1.4,0,0],C,0.46),
    mk('C4','C',[-0.7,-1.21,0],C,0.46),mk('C5','C',[0.7,-1.21,0],C,0.46),
    // C6 exocyclic
    mk('C6','C',[1.4,-2.3,0],C,0.46),
    // OH groups on each carbon
    mk('O1','O',[2.8,0,0.5],O,0.50),mk('H1','H',[3.2,0.5,0.9],H,0.28),
    mk('O2','O',[-0.7,2.5,0],O,0.50),mk('H2','H',[-0.7,3.4,0],H,0.28),
    mk('O3','O',[-2.8,0,0.5],O,0.50),mk('H3','H',[-3.2,0.5,0.9],H,0.28),
    mk('O4','O',[-0.7,-2.5,0],O,0.50),mk('H4','H',[-0.7,-3.4,0],H,0.28),
    mk('O6','O',[2.8,-2.3,0],O,0.50),mk('H6','H',[3.2,-1.8,0],H,0.28),
    // ring CH's
    mk('HC1','H',[1.4,0,-1.09],H,0.28),mk('HC2','H',[-0.7,1.21,-1.09],H,0.28),
    mk('HC3','H',[-1.4,0,-1.09],H,0.28),mk('HC4','H',[-0.7,-1.21,-1.09],H,0.28),
    mk('HC5','H',[0.7,-1.21,-1.09],H,0.28),
  ],
  bonds:[bond('C1','O_r'),bond('O_r','C2'),bond('C2','C3'),bond('C3','C4'),bond('C4','C5'),bond('C5','C1'),
    bond('C5','C6'),bond('C1','O1'),bond('O1','H1'),bond('C2','O2'),bond('O2','H2'),
    bond('C3','O3'),bond('O3','H3'),bond('C4','O4'),bond('O4','H4'),
    bond('C6','O6'),bond('O6','H6'),
    bond('C1','HC1'),bond('C2','HC2'),bond('C3','HC3'),bond('C4','HC4'),bond('C5','HC5')],
  labels:[lbl('Pyranose ring','C1'),lbl('Multiple –OH groups','O2'),lbl('C6 exocyclic carbon','C6')],
};

/* ══════════════════════════════════════════════════════════════════════════════
   LIBRARY EXPORT
══════════════════════════════════════════════════════════════════════════════ */
const sketchMolecule = (name, iupacName, formula, atomSymbols, links, note) => ({
  name,
  iupacName,
  formula,
  atoms: atomSymbols.map((symbol, index) => {
    const palette = { C, H, O, N, S, P, F, Cl, Br, I: I2 };
    const angle = (index / Math.max(1, atomSymbols.length)) * Math.PI * 2;
    const ringLike = atomSymbols.length >= 6;
    const pos = ringLike
      ? [Math.cos(angle) * 1.9, Math.sin(angle) * 1.35, (index % 2) * 0.18]
      : [index * 1.15 - atomSymbols.length * 0.55, Math.sin(index) * 0.45, 0];
    return mk(`${symbol}${index + 1}`, symbol, pos, palette[symbol] || '#94a3b8', symbol === 'H' ? 0.28 : 0.46);
  }),
  bonds: links.map(([from, to]) => bond(`${atomSymbols[from]}${from + 1}`, `${atomSymbols[to]}${to + 1}`)),
  labels: [lbl(note || iupacName, `${atomSymbols[0]}1`)],
});

Object.assign(ethylene, { iupacName: 'ethene' });
Object.assign(ethanol, { iupacName: 'ethanol' });
Object.assign(benzene, { iupacName: 'benzene', bondingModel: 'Kekule / delocalized aromatic ring' });
Object.assign(aceticAcid, { iupacName: 'ethanoic acid' });
Object.assign(glucose, { iupacName: 'D-glucose' });

const class1112Molecules = [
  sketchMolecule('Aspirin', '2-acetoxybenzoic acid', 'C9H8O4', ['C','C','C','C','C','C','O','O','C','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,8],[8,9],[2,10]], 'Aromatic ester and carboxylic acid'),
  sketchMolecule('Salicylic Acid', '2-hydroxybenzoic acid', 'C7H6O3', ['C','C','C','C','C','C','O','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[2,7],[7,8]], 'Phenolic acid'),
  sketchMolecule('Benzoic Acid', 'benzenecarboxylic acid', 'C7H6O2', ['C','C','C','C','C','C','C','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[6,8]], 'Aromatic carboxylic acid'),
  sketchMolecule('Nitrobenzene', 'nitrobenzene', 'C6H5NO2', ['C','C','C','C','C','C','N','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7],[6,8]], 'Aromatic nitro compound'),
  sketchMolecule('Chlorobenzene', 'chlorobenzene', 'C6H5Cl', ['C','C','C','C','C','C','Cl'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6]], 'Aryl halide'),
  sketchMolecule('Bromobenzene', 'bromobenzene', 'C6H5Br', ['C','C','C','C','C','C','Br'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6]], 'Aryl bromide'),
  sketchMolecule('Ethyl Acetate', 'ethyl ethanoate', 'C4H8O2', ['C','C','O','O','C','C'], [[0,1],[1,2],[1,3],[3,4],[4,5]], 'Ester linkage'),
  sketchMolecule('Methyl Acetate', 'methyl ethanoate', 'C3H6O2', ['C','C','O','O','C'], [[0,1],[1,2],[1,3],[3,4]], 'Simple ester'),
  sketchMolecule('Diethyl Ether', 'ethoxyethane', 'C4H10O', ['C','C','O','C','C'], [[0,1],[1,2],[2,3],[3,4]], 'Ether functional group'),
  sketchMolecule('Dimethyl Ether', 'methoxymethane', 'C2H6O', ['C','O','C'], [[0,1],[1,2]], 'Small ether'),
  sketchMolecule('Acetyl Chloride', 'ethanoyl chloride', 'C2H3ClO', ['C','C','O','Cl'], [[0,1],[1,2],[1,3]], 'Acid chloride'),
  sketchMolecule('Acetamide', 'ethanamide', 'C2H5NO', ['C','C','O','N'], [[0,1],[1,2],[1,3]], 'Amide group'),
  sketchMolecule('Acetonitrile', 'ethanenitrile', 'C2H3N', ['C','C','N'], [[0,1],[1,2]], 'Nitrile group'),
  sketchMolecule('Nitromethane', 'nitromethane', 'CH3NO2', ['C','N','O','O'], [[0,1],[1,2],[1,3]], 'Nitroalkane'),
  sketchMolecule('Glycerol', 'propane-1,2,3-triol', 'C3H8O3', ['C','C','C','O','O','O'], [[0,1],[1,2],[0,3],[1,4],[2,5]], 'Trihydric alcohol'),
  sketchMolecule('Lactic Acid', '2-hydroxypropanoic acid', 'C3H6O3', ['C','C','C','O','O','O'], [[0,1],[1,2],[1,3],[2,4],[2,5]], 'Hydroxy acid'),
  sketchMolecule('Oxalic Acid', 'ethanedioic acid', 'C2H2O4', ['O','C','O','C','O','O'], [[0,1],[1,2],[1,3],[3,4],[3,5]], 'Dicarboxylic acid'),
  sketchMolecule('Citric Acid', '2-hydroxypropane-1,2,3-tricarboxylic acid', 'C6H8O7', ['C','C','C','C','O','O','O','O','O','O'], [[0,1],[1,2],[1,3],[0,4],[0,5],[1,6],[2,7],[2,8],[3,9]], 'Triprotic organic acid'),
  sketchMolecule('Fructose', 'D-fructose', 'C6H12O6', ['C','C','C','C','C','C','O','O','O','O','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[0,6],[1,7],[2,8],[3,9],[4,10],[5,11]], 'Ketose sugar'),
  sketchMolecule('Sucrose', 'beta-D-fructofuranosyl alpha-D-glucopyranoside', 'C12H22O11', ['C','C','C','C','C','O','C','C','C','C','C','O','O','O','O'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[1,12],[7,13],[10,14]], 'Disaccharide glycosidic link'),
  sketchMolecule('Styrene', 'ethenylbenzene', 'C8H8', ['C','C','C','C','C','C','C','C'], [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[6,7]], 'Vinyl aromatic monomer'),
  sketchMolecule('Vinyl Chloride', 'chloroethene', 'C2H3Cl', ['C','C','Cl'], [[0,1],[1,2]], 'Haloalkene monomer'),
];

const BASE_MOLECULE_LIBRARY = {
  'Organic Chemistry': {
    color: '#22c55e',
    description: 'Carbon-based compounds',
    subcategories: {
      'Alkanes': {
        description: 'Saturated C–H chains (CₙH₂ₙ₊₂)',
        molecules: [methane, ethane, propane, butane, isobutane],
      },
      'Alkenes & Alkynes': {
        description: 'C=C double bonds and C≡C triple bonds',
        molecules: [ethylene, propene, acetylene],
      },
      'Alcohols': {
        description: '–OH functional group attached to carbon',
        molecules: [methanol, ethanol, isopropanol],
      },
      'Carbonyl Compounds': {
        description: 'Aldehydes, ketones, and carboxylic acids',
        molecules: [formaldehyde, acetaldehyde, acetone, formicAcid, aceticAcid],
      },
      'Nitrogen Compounds': {
        description: 'Amines, amides, and amino acids',
        molecules: [methylamine, urea, glycine],
      },
      'Aromatics': {
        description: 'Benzene ring compounds',
        molecules: [benzene, toluene, phenol, aniline],
      },
      'Cyclic Hydrocarbons': {
        description: 'Ring structures without aromaticity',
        molecules: [cyclohexane, cyclopentane],
      },
      'Class 11-12 Essentials': {
        description: 'High-yield organic molecules with IUPAC names for school and entrance exam practice',
        molecules: [ethanol, benzene, aceticAcid, glucose, ethylene, ...class1112Molecules],
      },
    },
  },
  'Inorganic Chemistry': {
    color: '#3b82f6',
    description: 'Non-carbon and metal compounds',
    subcategories: {
      'Diatomic Molecules': {
        description: 'Two-atom molecules of pure elements',
        molecules: [hydrogen, oxygen, nitrogen, fluorine, chlorine, hf, hcl, hbr],
      },
      'Oxides & Water': {
        description: 'Oxygen-containing inorganic compounds',
        molecules: [water, h2o2, co2, co, so2, so3, no2, no],
      },
      'Acids': {
        description: 'Proton-donating inorganic acids',
        molecules: [h2so4, hno3, h3po4, carbonicAcid],
      },
      'Salts & Bases': {
        description: 'Ionic compounds and hydroxide bases',
        molecules: [nacl, nabh4, naoh, koh, nh4cl, cacl2],
      },
    },
  },
  'Atmospheric Chemistry': {
    color: '#06b6d4',
    description: 'Molecules relevant to Earth\'s atmosphere',
    subcategories: {
      'Greenhouse Gases': {
        description: 'Gases that trap heat in the atmosphere',
        molecules: [co2, methane, n2o, ozone],
      },
      'Reactive Species': {
        description: 'Short-lived reactive atmospheric molecules',
        molecules: [no, no2, so2, hydroxyl, ammonia],
      },
    },
  },
  'Biochemistry': {
    color: '#f59e0b',
    description: 'Molecules of life',
    subcategories: {
      'Amino Acids': {
        description: 'Building blocks of proteins',
        molecules: [glycine, alanine],
      },
      'Biomolecules': {
        description: 'Sugars, nucleobases, and other biomolecules',
        molecules: [glucose, adenine, urea],
      },
    },
  },
};

const curatedMoleculeSets = {
  organicBasics: [methane, ethane, propane, butane, ethylene, acetylene, benzene, ethanol],
  functionalGroups: [methanol, ethanol, isopropanol, formaldehyde, acetaldehyde, acetone, aceticAcid, methylamine],
  environment: [water, co2, co, ozone, no, no2, so2, ammonia],
  ionsAndAcids: [nacl, naoh, koh, nh4cl, h2so4, hno3, h3po4, carbonicAcid],
  lifeChemistry: [glycine, alanine, glucose, adenine, urea, aceticAcid, water, co2],
  smallMolecules: [hydrogen, oxygen, nitrogen, fluorine, chlorine, hf, hcl, hbr],
};

const pickMolecules = (setName, start = 0, count = 4) => {
  const set = curatedMoleculeSets[setName] || ALL_SEED_MOLECULES;
  return Array.from({ length: count }, (_, i) => set[(start + i) % set.length]);
};

const makeLearningCategory = (color, description, entries) => ({
  color,
  description,
  subcategories: Object.fromEntries(entries.map((entry, index) => [
    entry.name,
    {
      description: entry.description,
      learningGoal: entry.goal,
      keyIdea: entry.idea,
      difficulty: entry.difficulty || ['Beginner', 'Core', 'Applied', 'Challenge'][index % 4],
      molecules: pickMolecules(entry.set, entry.start ?? index, entry.count ?? 4),
    },
  ])),
});

const ALL_SEED_MOLECULES = [
  methane, ethane, propane, butane, isobutane, ethylene, propene, acetylene,
  methanol, ethanol, isopropanol, formaldehyde, acetaldehyde, acetone,
  formicAcid, aceticAcid, methylamine, urea, glycine, benzene, toluene,
  phenol, aniline, cyclohexane, cyclopentane, hydrogen, oxygen, nitrogen,
  fluorine, chlorine, hf, hcl, hbr, water, h2o2, co2, co, so2, so3, no2,
  no, h2so4, hno3, h3po4, carbonicAcid, nacl, nabh4, naoh, koh, nh4cl,
  cacl2, ozone, n2o, ammonia, hydroxyl, alanine, adenine, glucose,
  ...class1112Molecules,
  ...EXPANDED_REAL_MOLECULES,
];

const LEARNING_COLLECTIONS = {
  'Bonding Patterns Lab': makeLearningCategory('#22d3ee', 'Learn how atoms connect: single, double, triple, ionic, polar, and network-like patterns.', [
    { name: 'Single Covalent Bonds', set: 'organicBasics', description: 'Spot sigma bonds in alkanes and simple molecules.', goal: 'Recognize stable single-bond frameworks.', idea: 'Single bonds rotate and usually create flexible shapes.' },
    { name: 'Double Bond Geometry', set: 'organicBasics', start: 3, description: 'Compare restricted rotation near C=C and C=O bonds.', goal: 'Link double bonds to planar regions.', idea: 'Pi bonding locks atoms into flatter arrangements.' },
    { name: 'Triple Bond Linearity', set: 'smallMolecules', description: 'Explore short, strong triple bonds in small molecules.', goal: 'Notice why triple bonds make straight fragments.', idea: 'sp hybrid orbitals point in opposite directions.' },
    { name: 'Polar Covalent Bonds', set: 'functionalGroups', start: 2, description: 'Find bonds with uneven electron sharing.', goal: 'Predict partial positive and negative ends.', idea: 'Electronegativity differences create bond dipoles.' },
    { name: 'Ionic Attractions', set: 'ionsAndAcids', description: 'See cation-anion attractions in salts and bases.', goal: 'Separate ionic attraction from covalent sharing.', idea: 'Ions are held by electrostatic force.' },
    { name: 'Hydrogen Bond Donors', set: 'lifeChemistry', description: 'Find O-H and N-H groups that can donate hydrogen bonds.', goal: 'Identify donors in water, alcohols, acids, and amines.', idea: 'A donor needs H attached to O, N, or F.' },
    { name: 'Hydrogen Bond Acceptors', set: 'functionalGroups', start: 4, description: 'Find electron-rich atoms that accept hydrogen bonds.', goal: 'Identify acceptors like oxygen and nitrogen.', idea: 'Lone pairs make good acceptor sites.' },
    { name: 'Aromatic Bonding', set: 'organicBasics', start: 5, description: 'Compare benzene-style delocalized bonding with ordinary bonds.', goal: 'Recognize ring stability from delocalization.', idea: 'Aromatic rings spread pi electrons around the ring.' },
    { name: 'Metal Salt Contacts', set: 'ionsAndAcids', start: 1, description: 'Explore metal ions paired with molecular anions.', goal: 'Read charges and ionic partners.', idea: 'Charge balance controls formulas.' },
    { name: 'Radical Bonds', set: 'environment', start: 5, description: 'Meet species that react because of unpaired electrons.', goal: 'Understand why radicals are short-lived.', idea: 'Unpaired electrons make molecules eager to react.' },
  ]),
  'Shape and Geometry Studio': makeLearningCategory('#a78bfa', 'Connect 3D shape to electron domains, bond angles, and rotation.', [
    { name: 'Linear Molecules', set: 'smallMolecules', description: 'Study straight two-atom and three-atom arrangements.', goal: 'Identify 180 degree geometry.', idea: 'Two electron domains often point apart.' },
    { name: 'Bent Molecules', set: 'environment', start: 0, description: 'Compare water, ozone, sulfur dioxide, and nitrogen dioxide.', goal: 'See lone-pair bending effects.', idea: 'Lone pairs compress bond angles.' },
    { name: 'Trigonal Planar Centers', set: 'functionalGroups', start: 3, description: 'Find flat carbonyl and related centers.', goal: 'Read planar sp2 regions.', idea: 'Three electron domains arrange around 120 degrees.' },
    { name: 'Tetrahedral Centers', set: 'organicBasics', description: 'Explore sp3 carbon in methane and alkanes.', goal: 'Visualize four bonds around one center.', idea: 'Tetrahedral geometry reduces electron-pair repulsion.' },
    { name: 'Pyramidal Nitrogen', set: 'environment', start: 6, description: 'Compare ammonia and amines.', goal: 'Connect lone pairs to pyramidal shape.', idea: 'Nitrogen often has three bonds plus one lone pair.' },
    { name: 'Ring Conformations', set: 'organicBasics', start: 6, description: 'Explore cyclic hydrocarbons and ring shape.', goal: 'See why rings are not always flat.', idea: 'Rings bend to reduce strain.' },
    { name: 'Planar Aromatic Rings', set: 'organicBasics', start: 5, description: 'Study flat conjugated rings.', goal: 'Recognize aromatic planarity.', idea: 'Flatness helps p orbitals overlap.' },
    { name: 'Tetrahedral Oxoanions', set: 'ionsAndAcids', start: 4, description: 'Explore sulfate and phosphate style centers.', goal: 'Find tetrahedral atom environments beyond carbon.', idea: 'Central atoms can bind several oxygens in 3D.' },
    { name: 'Molecular Symmetry', set: 'functionalGroups', start: 5, description: 'Look for mirror-like and repeated parts.', goal: 'Use symmetry to simplify structures.', idea: 'Symmetry often predicts similar bonds.' },
    { name: 'Large Biomolecule Shapes', set: 'lifeChemistry', start: 2, description: 'Inspect sugars and nucleobases as shaped frameworks.', goal: 'Connect shape to biological recognition.', idea: 'Biology reads 3D shape and polar patterns.' },
  ]),
  'Organic Functional Groups': makeLearningCategory('#34d399', 'Practice the main groups that give organic molecules their behavior.', [
    { name: 'Alkanes', set: 'organicBasics', description: 'Saturated hydrocarbons with only single bonds.', goal: 'Name simple carbon chains.', idea: 'Alkanes are relatively nonpolar and flexible.' },
    { name: 'Alkenes', set: 'organicBasics', start: 3, description: 'Hydrocarbons with carbon-carbon double bonds.', goal: 'Find C=C reactivity sites.', idea: 'Double bonds are electron-rich and less rotatable.' },
    { name: 'Alkynes', set: 'organicBasics', start: 4, description: 'Hydrocarbons with carbon-carbon triple bonds.', goal: 'Recognize linear unsaturation.', idea: 'Triple bonds are short, strong, and linear.' },
    { name: 'Alcohols', set: 'functionalGroups', description: 'Molecules containing the O-H group.', goal: 'Find alcohol polarity.', idea: 'Alcohols can donate and accept hydrogen bonds.' },
    { name: 'Aldehydes', set: 'functionalGroups', start: 3, description: 'Carbonyls at the end of carbon chains.', goal: 'Identify the CHO group.', idea: 'Aldehyde carbonyl carbons are reactive electrophiles.' },
    { name: 'Ketones', set: 'functionalGroups', start: 4, description: 'Carbonyls between carbons.', goal: 'Distinguish ketones from aldehydes.', idea: 'Ketones contain C=O inside the carbon skeleton.' },
    { name: 'Carboxylic Acids', set: 'functionalGroups', start: 5, description: 'Acidic COOH groups in organic compounds.', goal: 'Connect structure to acidity.', idea: 'Resonance stabilizes carboxylate ions.' },
    { name: 'Amines', set: 'functionalGroups', start: 7, description: 'Nitrogen groups related to ammonia.', goal: 'Spot basic nitrogen centers.', idea: 'Lone pairs on nitrogen can accept protons.' },
    { name: 'Aromatics', set: 'organicBasics', start: 5, description: 'Benzene-like stable rings.', goal: 'Recognize aromatic frameworks.', idea: 'Delocalized pi systems resist ordinary addition.' },
    { name: 'Cycloalkanes', set: 'organicBasics', start: 6, description: 'Non-aromatic carbon rings.', goal: 'Compare ring strain and flexibility.', idea: 'Ring size changes stability and shape.' },
  ]),
  'Inorganic Explorer': makeLearningCategory('#60a5fa', 'Build confidence with gases, oxides, acids, salts, and simple inorganic formulas.', [
    { name: 'Elemental Diatomics', set: 'smallMolecules', description: 'Elements that commonly exist as pairs.', goal: 'Remember H2, N2, O2, F2, and Cl2.', idea: 'Several nonmetals are stable as diatomic molecules.' },
    { name: 'Hydrogen Halides', set: 'smallMolecules', start: 5, description: 'Hydrogen bonded to halogens.', goal: 'Compare polar bonds in HF, HCl, and HBr.', idea: 'Bond polarity changes down the halogen group.' },
    { name: 'Water and Peroxides', set: 'environment', start: 0, description: 'Oxygen-hydrogen compounds with different O-O bonding.', goal: 'Distinguish water from peroxide.', idea: 'An O-O single bond changes reactivity sharply.' },
    { name: 'Carbon Oxides', set: 'environment', start: 1, description: 'CO and CO2 with very different behavior.', goal: 'Compare formula, shape, and toxicity.', idea: 'Small formula changes can transform properties.' },
    { name: 'Sulfur Oxides', set: 'environment', start: 4, description: 'Sulfur dioxide and sulfur trioxide patterns.', goal: 'Link oxides to acid rain chemistry.', idea: 'Nonmetal oxides can form acids in water.' },
    { name: 'Nitrogen Oxides', set: 'environment', start: 5, description: 'NO, NO2, and N2O in air chemistry.', goal: 'Connect bonding to atmospheric roles.', idea: 'Nitrogen oxides drive smog and greenhouse effects.' },
    { name: 'Mineral Acids', set: 'ionsAndAcids', start: 4, description: 'Sulfuric, nitric, phosphoric, and carbonic acids.', goal: 'Find acidic hydrogens on oxygen.', idea: 'O-H bonds in oxyacids release protons.' },
    { name: 'Hydroxide Bases', set: 'ionsAndAcids', start: 1, description: 'Metal hydroxides as strong bases.', goal: 'Identify hydroxide ions.', idea: 'OH- readily accepts protons.' },
    { name: 'Simple Salts', set: 'ionsAndAcids', description: 'Common ionic compounds.', goal: 'Read formula from ion charges.', idea: 'Neutral salts balance positive and negative charges.' },
    { name: 'Complex Hydrides', set: 'ionsAndAcids', start: 2, description: 'Hydride-rich reducing agents and related ions.', goal: 'See hydride as hydrogen with negative character.', idea: 'Hydrides can transfer H- in reactions.' },
  ]),
  'Biochemistry Pathways': makeLearningCategory('#fbbf24', 'Use molecule shapes to understand life chemistry.', [
    { name: 'Amino Acid Backbone', set: 'lifeChemistry', description: 'Amino group, alpha carbon, and carboxyl group.', goal: 'Find the shared amino acid pattern.', idea: 'Amino acids combine into proteins.' },
    { name: 'Side Chain Comparison', set: 'lifeChemistry', start: 1, description: 'Compare glycine and alanine side chains.', goal: 'See how one group changes behavior.', idea: 'Side chains tune protein properties.' },
    { name: 'Carbohydrate Rings', set: 'lifeChemistry', start: 2, description: 'Explore glucose as a ring with many OH groups.', goal: 'Connect sugar structure to solubility.', idea: 'Many O-H groups make sugars water friendly.' },
    { name: 'Nucleobases', set: 'lifeChemistry', start: 3, description: 'Inspect adenine as a nitrogen-rich base.', goal: 'Recognize base-pairing sites.', idea: 'Hydrogen bonding patterns encode genetic pairing.' },
    { name: 'Urea Cycle Molecules', set: 'lifeChemistry', start: 4, description: 'Urea as a small nitrogen waste molecule.', goal: 'See amide-like bonding.', idea: 'Urea safely carries excess nitrogen.' },
    { name: 'Metabolic Small Molecules', set: 'lifeChemistry', start: 5, description: 'Water, carbon dioxide, acids, and simple organics.', goal: 'Connect familiar molecules to metabolism.', idea: 'Metabolism moves carbon, hydrogen, oxygen, and nitrogen.' },
    { name: 'Protein Building Blocks', set: 'lifeChemistry', description: 'Start from amino acids and functional groups.', goal: 'Predict peptide-forming groups.', idea: 'Amino and carboxyl groups react to make peptides.' },
    { name: 'Cellular Solvents', set: 'environment', description: 'Water and polar molecules in living systems.', goal: 'Explain why water is a powerful solvent.', idea: 'Polarity and hydrogen bonding organize cells.' },
    { name: 'Energy Molecule Motifs', set: 'ionsAndAcids', start: 6, description: 'Phosphate and acid motifs used in energy transfer.', goal: 'Recognize phosphate-rich chemistry.', idea: 'Phosphate groups store and transfer energy.' },
    { name: 'Biological Recognition', set: 'lifeChemistry', start: 2, description: 'Shape, polarity, and hydrogen bonding together.', goal: 'Predict why molecules fit specific partners.', idea: 'Molecules recognize patterns, not just formulas.' },
  ]),
  'Environmental Chemistry': makeLearningCategory('#2dd4bf', 'Connect structures to atmosphere, water, climate, pollution, and remediation.', [
    { name: 'Greenhouse Gases', set: 'environment', start: 1, description: 'CO2, methane, nitrous oxide, and ozone.', goal: 'Compare greenhouse-relevant structures.', idea: 'Vibrational modes help molecules absorb infrared light.' },
    { name: 'Smog Chemistry', set: 'environment', start: 4, description: 'Nitrogen oxides and ozone formation.', goal: 'Link radicals and oxides to smog.', idea: 'Sunlight drives reactive cycles in air.' },
    { name: 'Acid Rain Precursors', set: 'environment', start: 4, description: 'Sulfur and nitrogen oxides that form acids.', goal: 'Trace oxide to acid formation.', idea: 'SO2 and NO2 can become acidic species in water.' },
    { name: 'Stratospheric Ozone', set: 'environment', start: 3, description: 'Ozone as UV shield and reactive molecule.', goal: 'Separate good ozone from ground-level ozone.', idea: 'Location changes environmental meaning.' },
    { name: 'Indoor Air Molecules', set: 'functionalGroups', start: 3, description: 'Carbonyls, CO2, and volatile organics.', goal: 'Recognize common indoor air compounds.', idea: 'Small volatile molecules move easily into air.' },
    { name: 'Water Quality Ions', set: 'ionsAndAcids', description: 'Salts, acids, bases, and dissolved ions.', goal: 'Connect ions to pH and conductivity.', idea: 'Dissolved ions make water chemically active.' },
    { name: 'Oxidants in Air', set: 'environment', start: 3, description: 'Ozone, hydroxyl radical, and nitrogen oxides.', goal: 'Understand atmospheric cleanup chemistry.', idea: 'Oxidants break down many pollutants.' },
    { name: 'Combustion Products', set: 'environment', start: 1, description: 'Carbon oxides, nitrogen oxides, and water.', goal: 'Identify molecules made by burning fuels.', idea: 'Combustion rearranges fuel atoms with oxygen.' },
    { name: 'Climate Feedback Molecules', set: 'environment', start: 0, description: 'Water, CO2, methane, and N2O.', goal: 'Compare natural and human-linked climate gases.', idea: 'Abundance and lifetime both matter.' },
    { name: 'Remediation Chemistry', set: 'functionalGroups', description: 'Use polarity and reactivity to think about cleanup.', goal: 'Choose what dissolves, reacts, or persists.', idea: 'Structure guides treatment strategy.' },
  ]),
  'Reaction Readiness': makeLearningCategory('#fb7185', 'Learn which sites are likely to react and why.', [
    { name: 'Electron Rich Sites', set: 'functionalGroups', description: 'Find atoms with lone pairs or pi bonds.', goal: 'Identify nucleophilic regions.', idea: 'Electron-rich sites attack electron-poor sites.' },
    { name: 'Electron Poor Sites', set: 'functionalGroups', start: 3, description: 'Find carbonyl carbons and polarized centers.', goal: 'Identify electrophilic atoms.', idea: 'Partial positive atoms attract electron density.' },
    { name: 'Acidic Hydrogens', set: 'ionsAndAcids', start: 4, description: 'Find H atoms that can leave as H+.', goal: 'Connect O-H bonds to acidity.', idea: 'Conjugate-base stability increases acidity.' },
    { name: 'Basic Lone Pairs', set: 'functionalGroups', start: 7, description: 'Find atoms that can accept H+.', goal: 'Identify basic nitrogen and oxygen sites.', idea: 'Available lone pairs can bind protons.' },
    { name: 'Oxidation Targets', set: 'organicBasics', description: 'Compare hydrocarbons and alcohols.', goal: 'Predict where oxidation may occur.', idea: 'C-H and O-H environments influence oxidation.' },
    { name: 'Reduction Targets', set: 'functionalGroups', start: 3, description: 'Carbonyls and hydrides in reduction chemistry.', goal: 'Spot reducible C=O groups.', idea: 'Carbonyls often accept hydride or electrons.' },
    { name: 'Leaving Groups', set: 'smallMolecules', start: 5, description: 'Halide-containing molecules as reaction examples.', goal: 'Understand bond breaking to halides.', idea: 'Stable anions make better leaving groups.' },
    { name: 'Radical Reactivity', set: 'environment', start: 5, description: 'Unpaired electron species and chain reactions.', goal: 'Recognize radical-prone chemistry.', idea: 'Radicals often react fast and propagate chains.' },
    { name: 'Resonance Stabilization', set: 'organicBasics', start: 5, description: 'Aromatic and carboxyl systems.', goal: 'See electron delocalization.', idea: 'Delocalization lowers energy.' },
    { name: 'Steric Crowding', set: 'organicBasics', start: 2, description: 'Bulky shapes that block reactions.', goal: 'Connect 3D size to reaction speed.', idea: 'Crowded atoms are harder to approach.' },
  ]),
  'Everyday Chemistry': makeLearningCategory('#f97316', 'Connect molecules to common materials, food, cleaning, medicine, and energy.', [
    { name: 'Cooking and Food', set: 'lifeChemistry', start: 2, description: 'Sugars, acids, water, and aroma molecules.', goal: 'Recognize chemistry in food.', idea: 'Flavor and texture come from structure.' },
    { name: 'Cleaning Chemistry', set: 'ionsAndAcids', start: 1, description: 'Bases, acids, water, and salts in cleaning.', goal: 'Match cleaners to chemical roles.', idea: 'pH and polarity control cleaning action.' },
    { name: 'Fuel Molecules', set: 'organicBasics', description: 'Hydrocarbons as energy-rich fuels.', goal: 'Connect C-H bonds to combustion.', idea: 'Oxidizing C-H bonds releases energy.' },
    { name: 'Breathing Chemistry', set: 'environment', start: 1, description: 'Oxygen, carbon dioxide, and water.', goal: 'Track gases in respiration.', idea: 'Cells exchange O2 and CO2 continuously.' },
    { name: 'Beverage Acids', set: 'ionsAndAcids', start: 6, description: 'Carbonic and other acids in drinks.', goal: 'Understand fizz and acidity.', idea: 'Dissolved CO2 forms carbonic acid.' },
    { name: 'Disinfectants and Oxidants', set: 'environment', start: 0, description: 'Oxidizing molecules used for sterilization.', goal: 'Connect oxidation to disinfection.', idea: 'Oxidants damage biological molecules.' },
    { name: 'Fragrance Functional Groups', set: 'functionalGroups', description: 'Alcohols, carbonyls, and aromatics in scents.', goal: 'Relate volatility to smell.', idea: 'Small molecules that evaporate can reach smell receptors.' },
    { name: 'Battery and Salt Ions', set: 'ionsAndAcids', description: 'Ions as charge carriers.', goal: 'Link ions to conductivity.', idea: 'Moving ions help carry charge.' },
    { name: 'Medicine Building Blocks', set: 'functionalGroups', start: 5, description: 'Aromatics, amines, acids, and polar groups.', goal: 'Spot medicinal chemistry motifs.', idea: 'Drug-like molecules balance shape and polarity.' },
    { name: 'Household Gases', set: 'environment', start: 1, description: 'CO2, CO, ammonia, and nitrogen oxides.', goal: 'Know useful and hazardous gases.', idea: 'Dose, location, and reactivity determine risk.' },
  ]),
  'Formula Reading Practice': makeLearningCategory('#c084fc', 'Turn symbols and subscripts into structural expectations.', [
    { name: 'Counting Atoms', set: 'organicBasics', description: 'Practice reading formula subscripts.', goal: 'Translate formula to atom counts.', idea: 'Subscripts tell how many of each atom appear.' },
    { name: 'Hydrocarbon Formulas', set: 'organicBasics', start: 1, description: 'Compare alkane, alkene, and alkyne formulas.', goal: 'Infer saturation from H count.', idea: 'Fewer hydrogens often means rings or multiple bonds.' },
    { name: 'Oxygenated Formulas', set: 'functionalGroups', description: 'Spot alcohols, carbonyls, and acids from oxygen count.', goal: 'Use formula clues carefully.', idea: 'Formula narrows possibilities but does not prove structure.' },
    { name: 'Nitrogen in Formulas', set: 'lifeChemistry', description: 'Read amines, amides, amino acids, and bases.', goal: 'Watch how nitrogen changes properties.', idea: 'Nitrogen often adds basicity or hydrogen bonding.' },
    { name: 'Ionic Formula Balance', set: 'ionsAndAcids', description: 'Use charge balance for salts.', goal: 'Predict neutral formulas.', idea: 'Total positive and negative charge must cancel.' },
    { name: 'Acid Formula Patterns', set: 'ionsAndAcids', start: 4, description: 'Recognize H at the front of acid formulas.', goal: 'Find likely acidic hydrogens.', idea: 'Acid formulas often show transferable H atoms.' },
    { name: 'Diatomic Symbols', set: 'smallMolecules', description: 'Remember common element pairs.', goal: 'Avoid writing isolated atoms for diatomics.', idea: 'Some elements naturally appear as X2 molecules.' },
    { name: 'Empirical vs Molecular', set: 'functionalGroups', start: 3, description: 'See that formulas can hide different structures.', goal: 'Separate atom ratio from exact molecule.', idea: 'Same formula can have different structures.' },
    { name: 'Organic Shorthand', set: 'organicBasics', start: 2, description: 'Read CH3, CH2, OH, and COOH fragments.', goal: 'Break formulas into groups.', idea: 'Functional fragments are learning anchors.' },
    { name: 'Biochemical Formulas', set: 'lifeChemistry', start: 2, description: 'Read larger formulas without panic.', goal: 'Group atoms by function.', idea: 'Large molecules are made from repeated familiar motifs.' },
  ]),
  'Beginner Guided Lessons': makeLearningCategory('#84cc16', 'Short, friendly lessons for first-time learners.', [
    { name: 'What Is an Atom?', set: 'smallMolecules', description: 'Start with atoms as colored spheres in molecules.', goal: 'Connect element symbols to atoms.', idea: 'Each sphere is one atom of an element.' },
    { name: 'What Is a Bond?', set: 'organicBasics', description: 'Use simple molecules to see atoms connected.', goal: 'Understand bonds as connections.', idea: 'Bonds hold atoms together in stable patterns.' },
    { name: 'Why Molecules Have Shapes', set: 'environment', description: 'Compare straight and bent molecules.', goal: 'See that molecules are 3D, not flat formulas.', idea: 'Electron pairs arrange themselves in space.' },
    { name: 'Reading Element Colors', set: 'functionalGroups', description: 'Use color to identify atom types quickly.', goal: 'Match colors to C, H, O, N, and more.', idea: 'Visual patterns make chemistry easier to remember.' },
    { name: 'Common Molecules Around You', set: 'environment', start: 0, description: 'Water, oxygen, carbon dioxide, and ammonia.', goal: 'Recognize daily chemistry.', idea: 'Chemistry is ordinary matter described carefully.' },
    { name: 'First Organic Molecules', set: 'organicBasics', description: 'Methane through simple hydrocarbons.', goal: 'Understand carbon chains.', idea: 'Carbon makes many structures because it forms four bonds.' },
    { name: 'First Acids and Bases', set: 'ionsAndAcids', start: 4, description: 'Acids donate H+ and bases accept H+.', goal: 'Connect formula to acid-base behavior.', idea: 'Proton transfer is a central chemistry pattern.' },
    { name: 'First Biomolecules', set: 'lifeChemistry', description: 'Amino acids, sugars, and nucleobases.', goal: 'See chemistry inside living things.', idea: 'Life uses ordinary atoms in extraordinary arrangements.' },
    { name: 'Safe Lab Thinking', set: 'environment', start: 1, description: 'Toxic, reactive, acidic, and basic examples.', goal: 'Respect properties from structure.', idea: 'Structure helps predict hazards.' },
    { name: 'Molecule Detective', set: 'functionalGroups', start: 2, description: 'Use color, formula, and shape clues together.', goal: 'Practice identifying unknown molecules.', idea: 'Chemists combine many clues, one step at a time.' },
  ]),
  'Advanced Concept Map': makeLearningCategory('#38bdf8', 'A compact map for deeper reasoning about structure and properties.', [
    { name: 'Hybridization Clues', set: 'organicBasics', start: 2, description: 'sp3, sp2, and sp centers from geometry.', goal: 'Infer hybridization visually.', idea: 'Shape reveals orbital arrangement.' },
    { name: 'Dipole Moments', set: 'functionalGroups', start: 3, description: 'Use bond polarity and shape together.', goal: 'Predict whether dipoles cancel.', idea: 'Molecular polarity depends on vector sum.' },
    { name: 'Formal Charge Thinking', set: 'ionsAndAcids', description: 'Reason about charged atoms in ions.', goal: 'Track charge placement.', idea: 'Formal charge is a bookkeeping tool.' },
    { name: 'Resonance Networks', set: 'organicBasics', start: 5, description: 'Aromatic and oxyanion resonance examples.', goal: 'Find delocalized electrons.', idea: 'Resonance spreads electron density.' },
    { name: 'Intermolecular Forces', set: 'functionalGroups', description: 'Compare dispersion, dipoles, and hydrogen bonds.', goal: 'Predict boiling and solubility trends.', idea: 'Molecules attract through several force types.' },
    { name: 'Structure-Property Links', set: 'environment', start: 1, description: 'Shape, polarity, mass, and reactivity together.', goal: 'Explain properties from structure.', idea: 'No single feature explains everything.' },
    { name: 'Acid Strength Factors', set: 'ionsAndAcids', start: 4, description: 'Electronegativity, resonance, and atom size.', goal: 'Compare likely acid strengths.', idea: 'Stable conjugate bases make stronger acids.' },
    { name: 'Nucleophile Strength', set: 'functionalGroups', start: 7, description: 'Lone pair availability and charge effects.', goal: 'Judge electron-pair donation.', idea: 'Availability matters as much as possession.' },
    { name: 'Reaction Mechanism Sites', set: 'functionalGroups', start: 3, description: 'Map where bonds break and form.', goal: 'Predict arrows in a simple mechanism.', idea: 'Mechanisms follow electron flow.' },
    { name: 'Spectroscopy Hints', set: 'functionalGroups', description: 'Functional groups as spectral clues.', goal: 'Link bonds to observed signals.', idea: 'Different bonds absorb different energies.' },
  ]),
};

export const MOLECULE_LIBRARY = {
  ...BASE_MOLECULE_LIBRARY,
  ...EXPANDED_REAL_MOLECULE_LIBRARY,
  ...LEARNING_COLLECTIONS,
};

/* flat list for search */
export const ALL_MOLECULES = Object.values(MOLECULE_LIBRARY).flatMap(cat =>
  Object.values(cat.subcategories).flatMap(sub => sub.molecules)
).filter((m, i, arr) => arr.findIndex(x => x.name === m.name) === i);

export default MOLECULE_LIBRARY;
