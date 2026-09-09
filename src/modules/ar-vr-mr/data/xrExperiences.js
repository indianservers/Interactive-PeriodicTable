const atom = (id, element, color, position, radius = 0.2) => ({ id, element, color, position, radius });

const ringAtoms = (prefix, count, radius, element, color, atomRadius = 0.2) => (
  Array.from({ length: count }, (_, index) => {
    const angle = (Math.PI * 2 * index) / count;
    return atom(`${prefix}${index + 1}`, element, color, [
      Number((Math.cos(angle) * radius).toFixed(3)),
      Number((Math.sin(angle) * radius).toFixed(3)),
      0,
    ], atomRadius);
  })
);

const ringBonds = (prefix, count) => (
  Array.from({ length: count }, (_, index) => [`${prefix}${index + 1}`, `${prefix}${(index + 1) % count + 1}`])
);

const latticeAtoms = () => {
  const atoms = [];
  for (let y = 0; y < 3; y += 1) {
    for (let x = 0; x < 4; x += 1) {
      const even = (x + y) % 2 === 0;
      atoms.push(atom(
        `${even ? 'Na' : 'Cl'}-${x}-${y}`,
        even ? 'Na+' : 'Cl-',
        even ? '#38bdf8' : '#22c55e',
        [(x - 1.5) * 0.72, y * 0.56 - 0.52, -0.4],
        even ? 0.2 : 0.27
      ));
    }
  }
  return atoms;
};

const chainAtoms = (count, prefix, element, color, y = 0) => (
  Array.from({ length: count }, (_, index) => atom(`${prefix}${index + 1}`, element, color, [
    (index - (count - 1) / 2) * 0.42,
    y + Math.sin(index * 0.9) * 0.12,
    Math.cos(index * 0.9) * 0.16,
  ], 0.16))
);

const chainBonds = (count, prefix) => (
  Array.from({ length: count - 1 }, (_, index) => [`${prefix}${index + 1}`, `${prefix}${index + 2}`])
);

const benzeneCarbons = ringAtoms('C', 6, 0.86, 'C', '#94a3b8', 0.22);
const benzeneHydrogens = ringAtoms('H', 6, 1.34, 'H', '#e5e7eb', 0.13);

export const xrModes = [
  {
    id: 'ar',
    label: 'AR',
    session: 'immersive-ar',
    title: 'Augmented Reality',
    description: 'Place chemistry objects on a real surface when WebXR AR is available.',
  },
  {
    id: 'vr',
    label: 'VR',
    session: 'immersive-vr',
    title: 'Virtual Reality',
    description: 'Open a full immersive chemistry scene on a compatible headset.',
  },
  {
    id: 'mr',
    label: 'MR',
    session: 'immersive-ar',
    title: 'Mixed Reality',
    description: 'Use AR passthrough-style placement with learning overlays and room-scale chemistry prompts.',
  },
];

export const xrConceptFilters = ['All', 'AR', 'VR', 'MR', 'Foundations', 'Organic', 'Lab', 'Advanced'];

const xrExperienceSeeds = [
  {
    id: 'atom-walkthrough',
    title: 'Walk Inside an Atom',
    formula: 'Bohr + Orbital Cloud',
    mode: 'VR',
    category: 'Foundations',
    level: 'Grade 8 to advanced',
    phase: 'Foundation',
    readiness: 72,
    wow: 'Scale from nucleus view to probability-cloud view while shell paths surround the learner.',
    objective: 'Connect nucleus, shells, orbitals, and electron probability without pretending electrons are tiny planets.',
    prompt: 'Stand at the nucleus, expand scale, then compare shell paths with the diffuse orbital cloud.',
    sceneType: 'atom',
    effects: ['orbitals', 'scale-shift'],
    atoms: [
      atom('p1', 'p+', '#f43f5e', [-0.08, 0, 0], 0.18),
      atom('n1', 'n', '#94a3b8', [0.1, 0.04, 0], 0.18),
      atom('p2', 'p+', '#f43f5e', [0.04, -0.1, 0.06], 0.18),
      atom('e1', 'e-', '#38bdf8', [0.75, 0, 0], 0.08),
      atom('e2', 'e-', '#38bdf8', [-0.75, 0, 0], 0.08),
      atom('e3', 'e-', '#a78bfa', [0, 0.78, 0.32], 0.08),
    ],
    bonds: [],
  },
  {
    id: 'ar-periodic-table',
    title: 'AR Periodic Table on Desk',
    formula: '118 elements',
    mode: 'AR',
    category: 'Foundations',
    level: 'All learners',
    phase: 'Design Spec',
    readiness: 48,
    wow: 'A table-sized periodic grid sits on the desk, then an element expands into a 3D atom and trend beacon.',
    objective: 'Make periodic trends spatial and memorable through room-scale comparison.',
    prompt: 'Place the table, select a group, then expand one element into an atom preview.',
    sceneType: 'periodic-grid',
    effects: ['trend-glow'],
    atoms: [
      atom('Li', 'Li', '#f59e0b', [-0.9, 0, 0], 0.2),
      atom('Na', 'Na', '#f97316', [-0.3, 0, 0], 0.24),
      atom('K', 'K', '#ef4444', [0.35, 0, 0], 0.3),
      atom('Rb', 'Rb', '#ec4899', [1.05, 0, 0], 0.34),
    ],
    bonds: [],
  },
  {
    id: 'ionic-lattice',
    title: 'MR Ionic Crystal Builder',
    formula: 'NaCl',
    mode: 'MR',
    category: 'Foundations',
    level: 'Ionic bonding',
    phase: 'Playable Base',
    readiness: 82,
    wow: 'Ions snap into a lattice and coordination numbers appear as learners move around it.',
    objective: 'Compare charge balance, packing, and nearest-neighbor coordination in a room-scale lattice.',
    prompt: 'Move around the lattice, change scale, and inspect alternating ion positions.',
    sceneType: 'lattice',
    effects: ['unit-cell', 'snap-grid'],
    atoms: latticeAtoms(),
    bonds: [],
  },
  {
    id: 'vsepr-room',
    title: 'VR Molecular Geometry Room',
    formula: 'VSEPR',
    mode: 'VR',
    category: 'Foundations',
    level: 'Molecular shape',
    phase: 'Foundation',
    readiness: 76,
    wow: 'Lone pairs visibly push bonds until shapes settle into linear, trigonal, tetrahedral, and octahedral forms.',
    objective: 'Turn VSEPR from memorized shapes into visible electron-pair repulsion.',
    prompt: 'Select lone pairs, then watch bond angles relax into the correct geometry.',
    sceneType: 'vsepr',
    effects: ['angle-arcs', 'lone-pair-force'],
    atoms: [
      atom('A', 'A', '#a78bfa', [0, 0, 0], 0.26),
      atom('X1', 'X', '#38bdf8', [0.8, 0.55, 0], 0.16),
      atom('X2', 'X', '#38bdf8', [-0.8, 0.55, 0], 0.16),
      atom('X3', 'X', '#38bdf8', [0, -0.85, 0.42], 0.16),
      atom('LP1', 'LP', '#f59e0b', [0, 0.25, -0.86], 0.12),
    ],
    bonds: [['A', 'X1'], ['A', 'X2'], ['A', 'X3']],
  },
  {
    id: 'mechanism-player',
    title: 'AR Reaction Mechanism Player',
    formula: 'Curved arrows',
    mode: 'AR',
    category: 'Organic',
    level: 'Organic mechanisms',
    phase: 'Design Spec',
    readiness: 58,
    wow: 'Curved arrows become animated electron pairs that learners can pause and drag.',
    objective: 'Show bond making and bond breaking as electron movement rather than symbolic arrows only.',
    prompt: 'Step through nucleophile attack, bond formation, and leaving-group departure.',
    sceneType: 'reaction',
    effects: ['electron-flow', 'stepper'],
    atoms: [
      atom('Nu', 'Nu:', '#22c55e', [-1.05, 0, 0], 0.2),
      atom('C', 'C', '#94a3b8', [0, 0, 0], 0.24),
      atom('Br', 'Br', '#a78bfa', [0.9, 0, 0], 0.23),
      atom('H1', 'H', '#e5e7eb', [0, 0.7, 0], 0.12),
      atom('H2', 'H', '#e5e7eb', [0, -0.7, 0], 0.12),
    ],
    bonds: [['C', 'Br'], ['C', 'H1'], ['C', 'H2']],
  },
  {
    id: 'benzene-vr',
    title: 'VR Benzene Aromaticity Tunnel',
    formula: 'C6H6',
    mode: 'VR',
    category: 'Organic',
    level: 'Aromaticity',
    phase: 'Playable Base',
    readiness: 84,
    wow: 'A glowing pi-cloud hovers above and below benzene while resonance forms merge into one delocalized system.',
    objective: 'Understand planarity, cyclic conjugation, and bond equivalence in aromatic compounds.',
    prompt: 'Orbit the ring, then inspect the pi-cloud above and below the carbon plane.',
    sceneType: 'aromatic-ring',
    effects: ['pi-cloud', 'resonance-morph'],
    atoms: [...benzeneCarbons, ...benzeneHydrogens],
    bonds: [...ringBonds('C', 6), ...Array.from({ length: 6 }, (_, index) => [`C${index + 1}`, `H${index + 1}`])],
  },
  {
    id: 'acid-base-transfer',
    title: 'MR Acid-Base Proton Transfer',
    formula: 'HA + B -> A- + BH+',
    mode: 'MR',
    category: 'Lab',
    level: 'Acids and bases',
    phase: 'Foundation',
    readiness: 68,
    wow: 'A proton jumps between molecules and a pH color field changes in the room.',
    objective: 'Visualize Bronsted acid-base chemistry and conjugate pairs.',
    prompt: 'Trigger proton transfer, then compare the acid/base and conjugate acid/base labels.',
    sceneType: 'acid-base',
    effects: ['proton-hop', 'ph-field'],
    atoms: [
      atom('A', 'A-', '#38bdf8', [-0.75, 0, 0], 0.25),
      atom('H', 'H+', '#f8fafc', [-0.2, 0.05, 0], 0.11),
      atom('B', 'B:', '#22c55e', [0.75, 0, 0], 0.25),
    ],
    bonds: [['A', 'H']],
  },
  {
    id: 'titration-overlay',
    title: 'AR Titration Lab Overlay',
    formula: 'Endpoint',
    mode: 'AR',
    category: 'Lab',
    level: 'Analytical chemistry',
    phase: 'Design Spec',
    readiness: 56,
    wow: 'A virtual burette, flask, endpoint color change, and live pH curve align on a real table.',
    objective: 'Connect volume added, pH curve, equivalence point, and indicator color.',
    prompt: 'Advance the burette drop count and watch the endpoint and graph respond.',
    sceneType: 'titration',
    effects: ['endpoint-color', 'curve-sync'],
    atoms: [
      atom('Acid', 'H+', '#f97316', [-0.45, -0.1, 0], 0.18),
      atom('Base', 'OH-', '#38bdf8', [0.45, -0.1, 0], 0.18),
      atom('Water', 'H2O', '#22c55e', [0, 0.42, 0], 0.22),
    ],
    bonds: [['Acid', 'Water'], ['Base', 'Water']],
  },
  {
    id: 'electrochemical-cell',
    title: 'VR Electrochemical Cell',
    formula: 'Zn | Cu',
    mode: 'VR',
    category: 'Lab',
    level: 'Redox chemistry',
    phase: 'Foundation',
    readiness: 74,
    wow: 'Learners stand between half-cells while electrons flow through wire and ions cross the salt bridge.',
    objective: 'Make oxidation, reduction, electron flow, salt bridge migration, and voltage intuitive.',
    prompt: 'Follow electrons from zinc to copper, then inspect ion migration in the salt bridge.',
    sceneType: 'electrochem',
    effects: ['electron-stream', 'salt-bridge'],
    atoms: [
      atom('Zn', 'Zn', '#94a3b8', [-0.95, 0, 0], 0.28),
      atom('Zn2', 'Zn2+', '#38bdf8', [-0.45, -0.35, 0], 0.18),
      atom('Cu2', 'Cu2+', '#22c55e', [0.45, -0.35, 0], 0.18),
      atom('Cu', 'Cu', '#f97316', [0.95, 0, 0], 0.28),
    ],
    bonds: [['Zn', 'Zn2'], ['Zn2', 'Cu2'], ['Cu2', 'Cu']],
  },
  {
    id: 'flame-test',
    title: 'AR Flame Test Visualizer',
    formula: 'Metal ions',
    mode: 'AR',
    category: 'Lab',
    level: 'Qualitative analysis',
    phase: 'Design Spec',
    readiness: 54,
    wow: 'Safe colored flames appear on the desk with spectral lines above each metal ion.',
    objective: 'Connect flame color to electronic transitions and emission spectra.',
    prompt: 'Switch metal ions and compare the flame color with its spectrum.',
    sceneType: 'spectrum',
    effects: ['emission-lines', 'flame-color'],
    atoms: [
      atom('Li', 'Li+', '#ef4444', [-0.75, 0, 0], 0.2),
      atom('Na', 'Na+', '#facc15', [0, 0, 0], 0.2),
      atom('K', 'K+', '#a78bfa', [0.75, 0, 0], 0.2),
    ],
    bonds: [],
  },
  {
    id: 'orbital-gallery',
    title: 'VR Orbitals Gallery',
    formula: 's p d f',
    mode: 'VR',
    category: 'Advanced',
    level: 'Atomic structure',
    phase: 'Foundation',
    readiness: 70,
    wow: 'Giant glowing orbital shapes surround the learner with nodal planes they can toggle.',
    objective: 'Turn orbital names into spatial probability shapes and nodal structure.',
    prompt: 'Move from s to p to d, then identify nodal planes and lobe orientation.',
    sceneType: 'orbitals',
    effects: ['orbital-lobes', 'nodal-plane'],
    atoms: [
      atom('s', 's', '#38bdf8', [-0.9, 0, 0], 0.28),
      atom('px', 'p', '#a78bfa', [0, 0, 0], 0.22),
      atom('d', 'd', '#22c55e', [0.9, 0, 0], 0.24),
    ],
    bonds: [],
  },
  {
    id: 'polymer-builder',
    title: 'MR Polymer Chain Builder',
    formula: '[-CH2-CH2-]n',
    mode: 'MR',
    category: 'Organic',
    level: 'Polymers',
    phase: 'Foundation',
    readiness: 66,
    wow: 'Monomers snap into long chains, then stretching, heating, and crosslinking change behavior.',
    objective: 'Relate monomer structure, chain length, crosslinks, and polymer properties.',
    prompt: 'Add monomers, stretch the chain, then compare flexible and crosslinked states.',
    sceneType: 'polymer',
    effects: ['snap-chain', 'crosslink'],
    atoms: chainAtoms(9, 'P', 'CH2', '#38bdf8', 0),
    bonds: chainBonds(9, 'P'),
  },
  {
    id: 'drug-docking',
    title: 'AR Drug-Receptor Docking',
    formula: 'Ligand + pocket',
    mode: 'AR',
    category: 'Advanced',
    level: 'Medicinal chemistry',
    phase: 'Foundation',
    readiness: 78,
    wow: 'A ligand snaps into a protein pocket and interaction scores appear beside H-bonds.',
    objective: 'Explain binding pockets, steric fit, H-bonds, hydrophobic contact, and docking score limits.',
    prompt: 'Rotate the ligand into the pocket, then inspect which interactions stabilize binding.',
    sceneType: 'docking',
    effects: ['binding-pocket', 'hbond-score'],
    atoms: [
      atom('Pocket1', 'P', '#334155', [-0.85, 0.24, 0], 0.3),
      atom('Pocket2', 'P', '#475569', [-0.5, -0.34, 0], 0.27),
      atom('N', 'N', '#38bdf8', [0.2, 0, 0], 0.19),
      atom('O', 'O', '#ef4444', [0.62, 0.22, 0], 0.18),
      atom('C', 'C', '#94a3b8', [0.58, -0.24, 0], 0.2),
    ],
    bonds: [['N', 'O'], ['N', 'C'], ['Pocket1', 'N'], ['Pocket2', 'C']],
  },
  {
    id: 'gas-laws-chamber',
    title: 'VR Gas Laws Chamber',
    formula: 'PV = nRT',
    mode: 'VR',
    category: 'Foundations',
    level: 'Physical chemistry',
    phase: 'Foundation',
    readiness: 69,
    wow: 'Learners stand inside a particle container and watch pressure, temperature, and volume change together.',
    objective: 'Build intuition for kinetic molecular theory and gas laws.',
    prompt: 'Compress the chamber, raise temperature, then compare particle speed and wall collisions.',
    sceneType: 'gas',
    effects: ['particle-motion', 'volume-box'],
    atoms: Array.from({ length: 12 }, (_, index) => atom(`G${index + 1}`, 'gas', '#38bdf8', [
      ((index % 4) - 1.5) * 0.42,
      (Math.floor(index / 4) - 1) * 0.35,
      Math.sin(index) * 0.4,
    ], 0.11)),
    bonds: [],
  },
  {
    id: 'crystal-defects',
    title: 'MR Crystal Defect Explorer',
    formula: 'Vacancy / interstitial',
    mode: 'MR',
    category: 'Advanced',
    level: 'Solid state',
    phase: 'Foundation',
    readiness: 73,
    wow: 'Learners remove or move atoms in a room-scale lattice and see defect labels plus property changes.',
    objective: 'Understand vacancies, interstitials, Frenkel defects, Schottky defects, and conductivity implications.',
    prompt: 'Remove one lattice site, add an interstitial, then compare defect types.',
    sceneType: 'defects',
    effects: ['vacancy-highlight', 'property-meter'],
    atoms: [
      ...latticeAtoms().filter(item => item.id !== 'Na-1-1'),
      atom('interstitial', 'i', '#f59e0b', [0.12, 0.1, 0.42], 0.14),
    ],
    bonds: [],
  },
];

const sceneMetadata = {
  atom: {
    corePrinciple: 'Atomic structure, nucleus scale, shells, and probability clouds.',
    chemistryTags: ['nucleus', 'electron shells', 'orbital probability', 'scale'],
    measurable: ['electron shell count', 'nuclear charge', 'relative scale'],
    accuracyNotes: 'Use shell paths as learning scaffolds, then reveal that orbitals represent probability density.',
  },
  'periodic-grid': {
    corePrinciple: 'Periodic trends become visible when elements are compared spatially.',
    chemistryTags: ['atomic radius', 'reactivity', 'group trends', 'periodic law'],
    measurable: ['trend direction', 'group comparison', 'selected element'],
    accuracyNotes: 'Trend overlays should show direction and exceptions instead of implying perfectly linear behavior.',
  },
  lattice: {
    corePrinciple: 'Ionic solids form repeating charge-balanced arrays.',
    chemistryTags: ['ionic bonding', 'coordination number', 'unit cell', 'charge balance'],
    measurable: ['coordination number', 'nearest neighbors', 'unit-cell boundary'],
    accuracyNotes: 'The preview is a teaching lattice seed; final MR mode should support multiple lattice types.',
  },
  vsepr: {
    corePrinciple: 'Electron domains repel and determine molecular geometry.',
    chemistryTags: ['VSEPR', 'bond angle', 'lone pair', 'electron domain'],
    measurable: ['bond angle', 'domain count', 'shape family'],
    accuracyNotes: 'Lone pair repulsion must visually dominate bonding pair repulsion in later animation phases.',
  },
  reaction: {
    corePrinciple: 'Organic mechanisms are electron-flow stories.',
    chemistryTags: ['nucleophile', 'leaving group', 'curved arrows', 'transition state'],
    measurable: ['electron source', 'electron sink', 'bond changed'],
    accuracyNotes: 'Curved arrows must begin at electron density and terminate at an atom or bond.',
  },
  'aromatic-ring': {
    corePrinciple: 'Aromatic stability comes from planar cyclic delocalization.',
    chemistryTags: ['aromaticity', 'pi cloud', 'resonance', 'planarity'],
    measurable: ['ring atoms', 'pi-cloud position', 'bond equivalence'],
    accuracyNotes: 'Show delocalization as one cloud, not rapidly switching localized double bonds only.',
  },
  'acid-base': {
    corePrinciple: 'Bronsted acid-base reactions transfer protons and create conjugate pairs.',
    chemistryTags: ['acid', 'base', 'proton transfer', 'conjugate pair'],
    measurable: ['proton donor', 'proton acceptor', 'pH direction'],
    accuracyNotes: 'The proton transfer arrow should distinguish proton motion from electron-pair motion.',
  },
  titration: {
    corePrinciple: 'Equivalence point connects stoichiometry, pH curve, and indicator range.',
    chemistryTags: ['endpoint', 'equivalence point', 'indicator', 'pH curve'],
    measurable: ['volume added', 'pH', 'endpoint color'],
    accuracyNotes: 'Endpoint and equivalence point are related but not always identical.',
  },
  electrochem: {
    corePrinciple: 'Redox cells separate oxidation and reduction while electrons flow through an external path.',
    chemistryTags: ['oxidation', 'reduction', 'salt bridge', 'cell potential'],
    measurable: ['anode', 'cathode', 'electron flow', 'ion migration'],
    accuracyNotes: 'Electrons move through the wire; ions move through solution and salt bridge.',
  },
  spectrum: {
    corePrinciple: 'Flame colors arise from electronic transitions and emission wavelengths.',
    chemistryTags: ['emission spectrum', 'excited state', 'metal ion', 'wavelength'],
    measurable: ['ion selected', 'flame color', 'spectral line'],
    accuracyNotes: 'Use spectral lines beside color so learners do not reduce analysis to flame color alone.',
  },
  orbitals: {
    corePrinciple: 'Orbitals are 3D probability distributions with nodes and orientation.',
    chemistryTags: ['orbital', 'node', 'quantum number', 'orientation'],
    measurable: ['orbital type', 'node count', 'lobe direction'],
    accuracyNotes: 'Avoid presenting orbital lobes as hard surfaces; they are probability boundary surfaces.',
  },
  polymer: {
    corePrinciple: 'Polymer properties emerge from monomer identity, chain length, and crosslinking.',
    chemistryTags: ['monomer', 'polymerization', 'crosslink', 'chain length'],
    measurable: ['repeat units', 'chain flexibility', 'crosslink count'],
    accuracyNotes: 'Final interaction should separate addition polymerization from condensation polymerization.',
  },
  docking: {
    corePrinciple: 'Binding depends on shape complementarity and non-covalent interactions.',
    chemistryTags: ['binding pocket', 'H-bond', 'hydrophobic contact', 'docking score'],
    measurable: ['contact count', 'fit score', 'interaction type'],
    accuracyNotes: 'Docking score is a hypothesis aid, not proof of biological activity.',
  },
  gas: {
    corePrinciple: 'Gas pressure emerges from particle collisions and temperature-dependent kinetic energy.',
    chemistryTags: ['kinetic theory', 'pressure', 'temperature', 'volume'],
    measurable: ['particle speed', 'container volume', 'collision rate'],
    accuracyNotes: 'Particles are scaled-up teaching markers, not literal molecular sizes.',
  },
  defects: {
    corePrinciple: 'Crystal defects alter structure and properties.',
    chemistryTags: ['vacancy', 'interstitial', 'Frenkel defect', 'Schottky defect'],
    measurable: ['defect type', 'missing ion', 'interstitial position'],
    accuracyNotes: 'Charge balance must be tracked when showing paired ionic defects.',
  },
};

const defaultSteps = [
  ['Observe', 'Inspect the structure and identify the main chemistry objects.'],
  ['Reveal', 'Turn on labels, vectors, or effects to expose the hidden concept.'],
  ['Manipulate', 'Adjust scale or stage and watch which chemistry relationship changes.'],
  ['Check', 'Answer the checkpoint before moving to full XR mode.'],
];

const sceneSteps = {
  reaction: [
    ['Locate', 'Find the electron-rich source and electron-poor destination.'],
    ['Flow', 'Advance the electron-flow stage and compare bond breaking with bond making.'],
    ['Explain', 'Name the nucleophile, leaving group, and changed bond.'],
    ['Challenge', 'Predict which arrow would be chemically invalid.'],
  ],
  electrochem: [
    ['Separate', 'Identify the two half-cells and the salt bridge.'],
    ['Trace', 'Follow electron flow from anode to cathode.'],
    ['Balance', 'Connect ion migration with charge neutrality.'],
    ['Challenge', 'Predict voltage direction after changing concentration.'],
  ],
  docking: [
    ['Inspect', 'Rotate the ligand and locate the pocket boundary.'],
    ['Fit', 'Compare shape complementarity and possible H-bonds.'],
    ['Score', 'Read interaction hints without treating score as proof.'],
    ['Challenge', 'Choose the modification that improves fit without increasing risk.'],
  ],
};

const challengeByScene = {
  atom: 'Which visual is a scaffold rather than a literal electron path?',
  'periodic-grid': 'Which direction does atomic radius increase across the visible trend?',
  lattice: 'Select one ion and count its nearest opposite-charge neighbors.',
  vsepr: 'Which object represents a lone pair domain?',
  reaction: 'Where should the electron-flow arrow start?',
  'aromatic-ring': 'What makes the ring aromatic instead of just cyclic?',
  'acid-base': 'Which particle is transferred from acid to base?',
  titration: 'What visible event marks the endpoint?',
  electrochem: 'Which side releases electrons into the external circuit?',
  spectrum: 'Why are spectrum lines more reliable than color alone?',
  orbitals: 'What does a node represent?',
  polymer: 'What changes when chains become crosslinked?',
  docking: 'Why is a docking score not the same as clinical activity?',
  gas: 'What particle behavior increases pressure?',
  defects: 'Which defect is a missing lattice particle?',
};

const assessmentByScene = {
  atom: [
    ['Which part of the model is only a learning scaffold?', ['Electron shell path', 'Nucleus', 'Proton'], 0],
    ['What does an orbital cloud represent?', ['Probability density', 'A hard shell', 'A fixed circular orbit'], 0],
  ],
  'periodic-grid': [
    ['What should an AR trend overlay help compare?', ['Periodic properties', 'Only color names', 'Lab glassware'], 0],
    ['Why show exceptions in trends?', ['Real trends are not perfectly linear', 'To hide the pattern', 'Because atoms have no patterns'], 0],
  ],
  lattice: [
    ['What holds an ionic lattice together?', ['Opposite-charge attraction', 'Shared electron pairs only', 'Random packing'], 0],
    ['What should coordination number count?', ['Nearest opposite-charge neighbors', 'Only atoms in a row', 'Only electrons'], 0],
  ],
  vsepr: [
    ['What controls VSEPR shape?', ['Electron-domain repulsion', 'Atomic color', 'Molar mass only'], 0],
    ['Which domain usually repels more strongly?', ['Lone pair', 'Bonding pair', 'Label text'], 0],
  ],
  reaction: [
    ['Where should a curved arrow start?', ['Electron density', 'A positive charge with no electrons', 'Anywhere on screen'], 0],
    ['What does the mechanism player emphasize?', ['Electron flow', 'Memorized product only', 'Element trend only'], 0],
  ],
  'aromatic-ring': [
    ['What makes benzene aromatic?', ['Planar cyclic delocalization', 'Only six hydrogens', 'Any carbon ring'], 0],
    ['Where is the pi cloud shown?', ['Above and below the ring', 'Only inside nuclei', 'Only on hydrogens'], 0],
  ],
  'acid-base': [
    ['What moves in a Bronsted acid-base reaction?', ['A proton', 'A neutron', 'A crystal unit cell'], 0],
    ['What pair forms after transfer?', ['Conjugate acid/base pair', 'Metal lattice', 'Polymer chain'], 0],
  ],
  titration: [
    ['What is tracked during titration?', ['Volume and pH change', 'Only flame color', 'Only atomic radius'], 0],
    ['Endpoint is best understood with:', ['Indicator plus pH curve context', 'Random color', 'No stoichiometry'], 0],
  ],
  electrochem: [
    ['Where do electrons travel?', ['External circuit', 'Salt bridge', 'Through labels'], 0],
    ['What does the salt bridge help maintain?', ['Charge balance', 'Aromaticity', 'Boiling point'], 0],
  ],
  spectrum: [
    ['Flame color comes from:', ['Electronic transitions', 'Nuclear fusion in class', 'Mass only'], 0],
    ['Why show spectral lines?', ['They are more specific than color alone', 'They replace all chemistry', 'They are random'], 0],
  ],
  orbitals: [
    ['An orbital is best described as:', ['Probability distribution', 'Planetary wire', 'Fixed electron pipe'], 0],
    ['A node is a region of:', ['Zero probability', 'Maximum nuclear mass', 'Liquid indicator'], 0],
  ],
  polymer: [
    ['Crosslinking usually changes:', ['Flexibility and strength', 'Atomic number', 'pH endpoint only'], 0],
    ['A polymer is built from:', ['Repeating units', 'Only salt bridges', 'Only photons'], 0],
  ],
  docking: [
    ['Docking score should be treated as:', ['A hypothesis aid', 'Proof of clinical success', 'A pH value'], 0],
    ['Good binding often depends on:', ['Shape and interactions', 'Label color only', 'Periodic group number only'], 0],
  ],
  gas: [
    ['Gas pressure is linked to:', ['Particle collisions', 'Aromatic pi clouds', 'Ionic charge only'], 0],
    ['Increasing temperature generally increases:', ['Particle kinetic energy', 'Nuclear charge', 'Crystal vacancies only'], 0],
  ],
  defects: [
    ['A vacancy defect means:', ['A missing lattice particle', 'Extra proton transfer', 'A curved arrow'], 0],
    ['Defects can change:', ['Material properties', 'Only font size', 'Only app theme'], 0],
  ],
};

const launchChecklistFor = (experience) => [
  {
    id: 'preview',
    label: 'Desktop preview renders',
    detail: 'Scene has objects, labels, and effect primitives before headset launch.',
    required: true,
    ready: experience.atoms.length > 0,
  },
  {
    id: 'mode',
    label: `${experience.mode} mode selected`,
    detail: `Launch uses ${experience.mode === 'VR' ? 'immersive-vr' : 'immersive-ar'} where supported.`,
    required: true,
    ready: true,
  },
  {
    id: 'lesson',
    label: 'Guided lesson available',
    detail: 'Concept has a stepper, checkpoint, and teacher prompt.',
    required: true,
    ready: true,
  },
  {
    id: 'accuracy',
    label: 'Chemistry accuracy notes attached',
    detail: 'Inspector shows assumptions and constraints for the model.',
    required: true,
    ready: Boolean(sceneMetadata[experience.sceneType]),
  },
];

export const xrExperiences = xrExperienceSeeds.map((experience) => {
  const metadata = sceneMetadata[experience.sceneType] || sceneMetadata.atom;
  return {
    ...experience,
    lessonSteps: sceneSteps[experience.sceneType] || defaultSteps,
    chemistry: metadata,
    launchChecklist: launchChecklistFor(experience),
    checkpoint: {
      prompt: challengeByScene[experience.sceneType] || 'What chemistry relationship changed after the interaction?',
      answerHint: metadata.corePrinciple,
    },
    assessment: assessmentByScene[experience.sceneType] || assessmentByScene.atom,
    teacherPrompt: `Ask students to explain ${metadata.chemistryTags.slice(0, 3).join(', ')} using the visible model.`,
  };
});

export const xrConceptStats = {
  total: xrExperiences.length,
  playable: xrExperiences.filter(item => item.phase === 'Playable Base').length,
  foundation: xrExperiences.filter(item => item.phase === 'Foundation').length,
  designSpec: xrExperiences.filter(item => item.phase === 'Design Spec').length,
};
