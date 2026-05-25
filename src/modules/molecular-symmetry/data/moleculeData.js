const CPK = {
  H: { color: '#f8fafc', radius: 0.22 },
  C: { color: '#64748b', radius: 0.34 },
  N: { color: '#3b82f6', radius: 0.36 },
  O: { color: '#ef4444', radius: 0.36 },
  B: { color: '#f59e0b', radius: 0.38 },
  F: { color: '#22c55e', radius: 0.34 },
  Fe: { color: '#f97316', radius: 0.52 },
};

const atom = (id, element, position) => ({
  id,
  element,
  position,
  color: CPK[element]?.color || '#94a3b8',
  radius: CPK[element]?.radius || 0.32,
});

const bond = (from, to, order = 1) => ({ from, to, order });

const E = {
  id: 'E',
  label: 'E',
  type: 'E',
  description: 'Identity leaves every atom exactly where it is. It is present in every molecule.',
};

export const symmetryTheoryCards = {
  E: {
    title: 'Identity E',
    body: 'The identity operation means doing nothing to the molecule. Every molecule has E, and every atom maps to itself.',
  },
  Cn: {
    title: 'Proper Rotation Cn',
    body: 'A proper rotation Cn rotates the molecule by 360/n degrees around an axis. If equivalent atoms occupy indistinguishable positions after rotation, the operation is valid.',
  },
  sigma: {
    title: 'Mirror Plane sigma',
    body: 'A mirror plane reflects one side of the molecule into the other. Atoms on the plane remain unchanged; atoms off the plane exchange with equivalent atoms.',
  },
  i: {
    title: 'Centre of Inversion i',
    body: 'A centre of inversion exists when each atom at (x, y, z) has an equivalent atom at (-x, -y, -z).',
  },
  Sn: {
    title: 'Improper Rotation Sn',
    body: 'An improper rotation is a Cn rotation followed by reflection in the plane perpendicular to that axis.',
  },
};

export const pointGroups = [
  'C1', 'Cs', 'Ci', 'C2', 'C2v', 'C3v', 'C4v', 'D2h',
  'D3h', 'D4h', 'D6h', 'Td', 'Oh', 'D2d', 'D5d', 'D5h',
];

export const moleculeLibrary = [
  {
    id: 'water',
    name: 'Water',
    formula: 'H2O',
    geometry: 'Bent',
    pointGroup: 'C2v',
    difficulty: 'Basic',
    notes: 'The molecule has a C2 axis through oxygen and two vertical mirror planes.',
    atoms: [
      atom('O', 'O', [0, 0, 0]),
      atom('H1', 'H', [0.78, 0.58, 0]),
      atom('H2', 'H', [-0.78, 0.58, 0]),
    ],
    bonds: [bond('O', 'H1'), bond('O', 'H2')],
    symmetryElements: [
      E,
      { id: 'C2-z', label: 'C2 principal axis', type: 'Cn', order: 2, axis: [0, 1, 0], description: 'A 180 degree rotation through oxygen swaps H1 and H2.' },
      { id: 'sigma-mol', label: 'sigma v molecular plane', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'The molecular plane contains O, H1, and H2.' },
      { id: 'sigma-bisect', label: 'sigma v bisecting plane', type: 'sigma', planeNormal: [1, 0, 0], planePoint: [0, 0, 0], description: 'This vertical plane bisects the H-O-H angle and swaps the hydrogens.' },
    ],
    distractorElements: [
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'Water does not have an inversion centre.' },
      { id: 'C3-test', label: 'C3 test axis', type: 'Cn', order: 3, axis: [0, 1, 0], description: 'A 120 degree rotation is not valid for bent water.' },
    ],
    pointGroupReasoning: [
      'Is the molecule linear? No.',
      'Is there a principal rotation axis? Yes, C2 through oxygen.',
      'Are there vertical mirror planes containing the principal axis? Yes, two sigma v planes.',
      'Therefore the point group is C2v.',
    ],
    commonMistakes: [
      'Mistaking the molecular plane for a horizontal plane. In C2v water, both mirror planes are vertical relative to the principal axis.',
      'Looking for an inversion centre at oxygen; inversion would require an atom opposite each hydrogen.',
    ],
  },
  {
    id: 'ammonia',
    name: 'Ammonia',
    formula: 'NH3',
    geometry: 'Trigonal pyramidal',
    pointGroup: 'C3v',
    difficulty: 'Basic',
    notes: 'A C3 axis passes through nitrogen and the centre of the H3 triangle; three vertical planes contain one N-H bond each.',
    atoms: [
      atom('N', 'N', [0, 0.78, 0]),
      atom('H1', 'H', [1.02, -0.28, 0]),
      atom('H2', 'H', [-0.51, -0.28, 0.88]),
      atom('H3', 'H', [-0.51, -0.28, -0.88]),
    ],
    bonds: [bond('N', 'H1'), bond('N', 'H2'), bond('N', 'H3')],
    symmetryElements: [
      E,
      { id: 'C3-y', label: 'C3 principal axis', type: 'Cn', order: 3, axis: [0, 1, 0], description: 'A 120 degree rotation cycles the three hydrogen atoms.' },
      { id: 'sv-H1', label: 'sigma v through H1', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'This plane contains N and H1 and swaps H2 with H3.' },
      { id: 'sv-H2', label: 'sigma v through H2', type: 'sigma', planeNormal: [0.866, 0, 0.5], planePoint: [0, 0, 0], description: 'A second vertical plane containing one N-H bond.' },
      { id: 'sv-H3', label: 'sigma v through H3', type: 'sigma', planeNormal: [-0.866, 0, 0.5], planePoint: [0, 0, 0], description: 'A third vertical plane containing one N-H bond.' },
    ],
    distractorElements: [
      { id: 'sigma-h-test', label: 'sigma h test', type: 'sigma', planeNormal: [0, 1, 0], planePoint: [0, 0, 0], description: 'Reflecting through the H3 plane would move N below the plane.' },
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'Ammonia is polar and has no inversion centre.' },
    ],
    pointGroupReasoning: [
      'The molecule is not linear.',
      'The highest-order rotation axis is C3.',
      'There are three vertical mirror planes.',
      'There is no horizontal mirror plane and no inversion centre.',
      'Therefore the point group is C3v.',
    ],
    commonMistakes: [
      'Treating NH3 as planar like BF3.',
      'Assigning D3h by forgetting the lone-pair pyramidal geometry.',
    ],
  },
  {
    id: 'methane',
    name: 'Methane',
    formula: 'CH4',
    geometry: 'Tetrahedral',
    pointGroup: 'Td',
    difficulty: 'Intermediate',
    notes: 'Tetrahedral molecules have multiple C3 axes through C-H bonds and S4 axes through opposite edges.',
    atoms: [
      atom('C', 'C', [0, 0, 0]),
      atom('H1', 'H', [1, 1, 1]),
      atom('H2', 'H', [-1, -1, 1]),
      atom('H3', 'H', [-1, 1, -1]),
      atom('H4', 'H', [1, -1, -1]),
    ],
    bonds: [bond('C', 'H1'), bond('C', 'H2'), bond('C', 'H3'), bond('C', 'H4')],
    symmetryElements: [
      E,
      { id: 'C3-H1', label: 'C3 through C-H1', type: 'Cn', order: 3, axis: [1, 1, 1], description: 'Rotation about a C-H bond cycles the other three hydrogens.' },
      { id: 'C2-x', label: 'C2 through opposite edges', type: 'Cn', order: 2, axis: [1, 0, 0], description: 'A 180 degree rotation swaps two pairs of hydrogens.' },
      { id: 'sigma-d', label: 'sigma d plane', type: 'sigma', planeNormal: [1, -1, 0], planePoint: [0, 0, 0], description: 'A dihedral plane contains two C-H bonds and bisects the opposite pair.' },
      { id: 'S4-x', label: 'S4 axis', type: 'Sn', order: 4, axis: [1, 0, 0], description: 'An S4 operation is characteristic of Td symmetry.' },
    ],
    distractorElements: [
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'Td molecules lack inversion symmetry.' },
    ],
    pointGroupReasoning: [
      'The molecule is not linear.',
      'It has four C3 axes and high tetrahedral symmetry.',
      'It has S4 axes and sigma d planes but no inversion centre.',
      'Therefore the point group is Td.',
    ],
    commonMistakes: [
      'Assigning Oh because the molecule feels highly symmetric.',
      'Looking for a horizontal plane in a tetrahedron.',
    ],
  },
  {
    id: 'bf3',
    name: 'Boron trifluoride',
    formula: 'BF3',
    geometry: 'Trigonal planar',
    pointGroup: 'D3h',
    difficulty: 'Intermediate',
    notes: 'Planar trigonal BF3 has a C3 axis perpendicular to the molecular plane and a horizontal mirror plane.',
    atoms: [
      atom('B', 'B', [0, 0, 0]),
      atom('F1', 'F', [1.45, 0, 0]),
      atom('F2', 'F', [-0.725, 1.256, 0]),
      atom('F3', 'F', [-0.725, -1.256, 0]),
    ],
    bonds: [bond('B', 'F1'), bond('B', 'F2'), bond('B', 'F3')],
    symmetryElements: [
      E,
      { id: 'C3-z', label: 'C3 principal axis', type: 'Cn', order: 3, axis: [0, 0, 1], description: 'Rotation perpendicular to the molecular plane cycles the fluorines.' },
      { id: 'C2-F1', label: 'C2 axis in plane', type: 'Cn', order: 2, axis: [1, 0, 0], description: 'A C2 axis lies along each B-F bond.' },
      { id: 'sigma-h', label: 'sigma h molecular plane', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'The whole molecule lies in the horizontal mirror plane.' },
      { id: 'sigma-v', label: 'sigma v through B-F1', type: 'sigma', planeNormal: [0, 1, 0], planePoint: [0, 0, 0], description: 'A vertical plane contains one B-F bond and swaps the other fluorines.' },
      { id: 'S3-z', label: 'S3 axis', type: 'Sn', order: 3, axis: [0, 0, 1], description: 'C3 followed by reflection in the molecular plane is also valid.' },
    ],
    distractorElements: [
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'A trigonal planar AB3 molecule has no inversion centre.' },
    ],
    pointGroupReasoning: [
      'The molecule is planar and has a principal C3 axis.',
      'There are three C2 axes perpendicular to the C3 axis.',
      'A horizontal mirror plane is present.',
      'Therefore the point group is D3h.',
    ],
    commonMistakes: ['Confusing planar BF3 with pyramidal NH3.', 'Missing the three in-plane C2 axes.'],
  },
  {
    id: 'co2',
    name: 'Carbon dioxide',
    formula: 'CO2',
    geometry: 'Linear',
    pointGroup: 'D2h',
    difficulty: 'Basic',
    notes: 'The true point group is D infinity h. This teaching model uses D2h operations that are easy to visualize.',
    atoms: [atom('O1', 'O', [-1.2, 0, 0]), atom('C', 'C', [0, 0, 0]), atom('O2', 'O', [1.2, 0, 0])],
    bonds: [bond('O1', 'C', 2), bond('C', 'O2', 2)],
    symmetryElements: [
      E,
      { id: 'C2-x', label: 'C2 molecular axis', type: 'Cn', order: 2, axis: [1, 0, 0], description: 'Rotation about the O-C-O axis leaves the linear molecule unchanged.' },
      { id: 'C2-y', label: 'C2 perpendicular axis', type: 'Cn', order: 2, axis: [0, 1, 0], description: 'This swaps the two oxygens.' },
      { id: 'sigma-xy', label: 'sigma plane xy', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'A plane containing the molecular axis.' },
      { id: 'sigma-yz', label: 'sigma h midpoint plane', type: 'sigma', planeNormal: [1, 0, 0], planePoint: [0, 0, 0], description: 'A plane through carbon perpendicular to the molecular axis swaps O1 and O2.' },
      { id: 'i', label: 'inversion centre', type: 'i', description: 'Carbon is the inversion centre.' },
    ],
    distractorElements: [{ id: 'C3-test', label: 'C3 test axis', type: 'Cn', order: 3, axis: [0, 1, 0], description: 'This D2h teaching model does not include a perpendicular C3 operation.' }],
    pointGroupReasoning: [
      'The molecule is linear and centrosymmetric.',
      'The complete ideal group is D infinity h.',
      'For finite teaching operations, C2 axes, mirror planes, and inversion match D2h.',
      'Therefore use D2h as the simplified classroom point group.',
    ],
    commonMistakes: ['Forgetting the inversion centre at carbon.', 'Treating the simplified D2h model as the full linear molecule group.'],
  },
  {
    id: 'benzene',
    name: 'Benzene',
    formula: 'C6H6',
    geometry: 'Planar hexagonal',
    pointGroup: 'D6h',
    difficulty: 'Advanced',
    notes: 'Benzene combines a C6 axis, horizontal mirror plane, inversion centre, and many C2 axes.',
    atoms: [
      ...Array.from({ length: 6 }, (_, i) => {
        const a = i * Math.PI / 3;
        return atom(`C${i + 1}`, 'C', [Math.cos(a), Math.sin(a), 0]);
      }),
      ...Array.from({ length: 6 }, (_, i) => {
        const a = i * Math.PI / 3;
        return atom(`H${i + 1}`, 'H', [1.55 * Math.cos(a), 1.55 * Math.sin(a), 0]);
      }),
    ],
    bonds: [
      ...Array.from({ length: 6 }, (_, i) => bond(`C${i + 1}`, `C${(i + 1) % 6 + 1}`, i % 2 ? 1 : 2)),
      ...Array.from({ length: 6 }, (_, i) => bond(`C${i + 1}`, `H${i + 1}`)),
    ],
    symmetryElements: [
      E,
      { id: 'C6-z', label: 'C6 principal axis', type: 'Cn', order: 6, axis: [0, 0, 1], description: 'A 60 degree rotation cycles every carbon and hydrogen.' },
      { id: 'C2-x', label: 'C2 in-plane axis', type: 'Cn', order: 2, axis: [1, 0, 0], description: 'One of six C2 axes in the molecular plane.' },
      { id: 'sigma-h', label: 'sigma h molecular plane', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'All atoms lie in this mirror plane.' },
      { id: 'sigma-v', label: 'sigma v through opposite atoms', type: 'sigma', planeNormal: [0, 1, 0], planePoint: [0, 0, 0], description: 'A vertical plane through opposite C-H bonds.' },
      { id: 'i', label: 'inversion centre', type: 'i', description: 'The ring centre is an inversion centre.' },
      { id: 'S6-z', label: 'S6 axis', type: 'Sn', order: 6, axis: [0, 0, 1], description: 'C6 rotation followed by reflection through the molecular plane.' },
    ],
    distractorElements: [{ id: 'C5-test', label: 'C5 test axis', type: 'Cn', order: 5, axis: [0, 0, 1], description: 'A hexagon is not invariant under 72 degree rotation.' }],
    pointGroupReasoning: [
      'The molecule is planar and has a C6 principal axis.',
      'There are six C2 axes perpendicular to C6.',
      'A horizontal mirror plane and inversion centre are present.',
      'Therefore the point group is D6h.',
    ],
    commonMistakes: ['Counting only one mirror plane.', 'Missing the inversion centre at the ring centre.'],
  },
  {
    id: 'ethene',
    name: 'Ethene',
    formula: 'C2H4',
    geometry: 'Planar',
    pointGroup: 'D2h',
    difficulty: 'Intermediate',
    notes: 'Ethene is planar with three mutually perpendicular C2 axes and an inversion centre.',
    atoms: [
      atom('C1', 'C', [-0.67, 0, 0]),
      atom('C2', 'C', [0.67, 0, 0]),
      atom('H1', 'H', [-1.18, 0.92, 0]),
      atom('H2', 'H', [-1.18, -0.92, 0]),
      atom('H3', 'H', [1.18, 0.92, 0]),
      atom('H4', 'H', [1.18, -0.92, 0]),
    ],
    bonds: [bond('C1', 'C2', 2), bond('C1', 'H1'), bond('C1', 'H2'), bond('C2', 'H3'), bond('C2', 'H4')],
    symmetryElements: [
      E,
      { id: 'C2-x', label: 'C2 along C=C', type: 'Cn', order: 2, axis: [1, 0, 0], description: 'Rotation about the double bond swaps hydrogens above and below the plane.' },
      { id: 'C2-y', label: 'C2 perpendicular in plane', type: 'Cn', order: 2, axis: [0, 1, 0], description: 'This swaps the two CH2 ends.' },
      { id: 'sigma-h', label: 'sigma h molecular plane', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'The molecule is planar.' },
      { id: 'sigma-yz', label: 'sigma v central plane', type: 'sigma', planeNormal: [1, 0, 0], planePoint: [0, 0, 0], description: 'Plane through the midpoint of C=C.' },
      { id: 'i', label: 'inversion centre', type: 'i', description: 'The midpoint of the C=C bond is an inversion centre.' },
    ],
    distractorElements: [{ id: 'C3-test', label: 'C3 test axis', type: 'Cn', order: 3, axis: [0, 0, 1], description: 'Ethene is not trigonal around the whole molecule.' }],
    pointGroupReasoning: [
      'Ethene has three perpendicular C2 axes.',
      'It has a horizontal mirror plane and inversion centre.',
      'These operations define D2h.',
    ],
    commonMistakes: ['Using local trigonal planar carbon geometry to assign a molecular C3 axis.', 'Missing the centre of inversion at the bond midpoint.'],
  },
  {
    id: 'hydrogen-peroxide',
    name: 'Hydrogen peroxide',
    formula: 'H2O2',
    geometry: 'Non-planar conformer',
    pointGroup: 'C2',
    difficulty: 'Intermediate',
    notes: 'The skew conformer retains only a C2 axis through the O-O bond midpoint.',
    atoms: [
      atom('O1', 'O', [-0.72, 0, 0]),
      atom('O2', 'O', [0.72, 0, 0]),
      atom('H1', 'H', [-1.05, 0.55, 0.72]),
      atom('H2', 'H', [1.05, 0.55, -0.72]),
    ],
    bonds: [bond('O1', 'O2'), bond('O1', 'H1'), bond('O2', 'H2')],
    symmetryElements: [
      E,
      { id: 'C2-skew', label: 'C2 axis through O-O midpoint', type: 'Cn', order: 2, axis: [0, 1, 0], description: 'The 180 degree rotation swaps the two O-H groups in the skew conformer.' },
    ],
    distractorElements: [
      { id: 'sigma-test', label: 'mirror plane test', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'The non-planar conformer has no mirror plane.' },
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'The hydrogens do not invert to equivalent positions.' },
    ],
    pointGroupReasoning: [
      'The molecule is non-linear and non-planar.',
      'A C2 axis passes through the O-O midpoint.',
      'No mirror plane or inversion centre remains in this conformer.',
      'Therefore the point group is C2.',
    ],
    commonMistakes: ['Drawing peroxide as planar and assigning C2h.', 'Using a static textbook sketch without considering conformation.'],
  },
  {
    id: 'allene',
    name: 'Allene',
    formula: 'C3H4',
    geometry: 'Cumulated diene',
    pointGroup: 'D2d',
    difficulty: 'Advanced',
    notes: 'The terminal CH2 groups are perpendicular, giving S4 and dihedral mirror symmetry.',
    atoms: [
      atom('C1', 'C', [-1.15, 0, 0]),
      atom('C2', 'C', [0, 0, 0]),
      atom('C3', 'C', [1.15, 0, 0]),
      atom('H1', 'H', [-1.55, 0.82, 0]),
      atom('H2', 'H', [-1.55, -0.82, 0]),
      atom('H3', 'H', [1.55, 0, 0.82]),
      atom('H4', 'H', [1.55, 0, -0.82]),
    ],
    bonds: [bond('C1', 'C2', 2), bond('C2', 'C3', 2), bond('C1', 'H1'), bond('C1', 'H2'), bond('C3', 'H3'), bond('C3', 'H4')],
    symmetryElements: [
      E,
      { id: 'C2-yz', label: 'C2 diagonal axis', type: 'Cn', order: 2, axis: [0, 1, 1], description: 'One C2 axis swaps terminal carbons and pairs of hydrogens.' },
      { id: 'C2-y-z', label: 'C2 perpendicular diagonal axis', type: 'Cn', order: 2, axis: [0, 1, -1], description: 'A second C2 axis perpendicular to the molecular axis.' },
      { id: 'S4-x', label: 'S4 molecular axis', type: 'Sn', order: 4, axis: [1, 0, 0], description: 'S4 about the C=C=C axis maps the perpendicular terminal groups.' },
      { id: 'sigma-d', label: 'sigma d plane', type: 'sigma', planeNormal: [0, 1, 0], planePoint: [0, 0, 0], description: 'A dihedral plane bisects one terminal hydrogen pair and leaves the perpendicular pair in the plane.' },
    ],
    distractorElements: [
      { id: 'i-test', label: 'inversion centre test', type: 'i', description: 'Allene in D2d has no inversion centre.' },
      { id: 'sigma-h-test', label: 'sigma h test', type: 'sigma', planeNormal: [1, 0, 0], planePoint: [0, 0, 0], description: 'A plane perpendicular to the chain is not a mirror plane.' },
    ],
    pointGroupReasoning: [
      'The terminal CH2 planes are perpendicular.',
      'There are C2 axes perpendicular to the principal molecular axis.',
      'An S4 axis lies along the C=C=C chain.',
      'Dihedral mirror planes are present but no inversion centre.',
      'Therefore the point group is D2d.',
    ],
    commonMistakes: ['Drawing allene as planar.', 'Assigning D2h by incorrectly adding an inversion centre.'],
  },
  {
    id: 'ferrocene',
    name: 'Ferrocene simplified model',
    formula: 'Fe(C5H5)2',
    geometry: 'Sandwich complex',
    pointGroup: 'D5d / D5h',
    difficulty: 'Advanced',
    notes: 'Use the staggered model for D5d and the eclipsed comparison to discuss D5h.',
    atoms: [
      atom('Fe', 'Fe', [0, 0, 0]),
      ...Array.from({ length: 5 }, (_, i) => {
        const a = i * 2 * Math.PI / 5;
        return atom(`Ctop${i + 1}`, 'C', [1.25 * Math.cos(a), 1.25 * Math.sin(a), 0.78]);
      }),
      ...Array.from({ length: 5 }, (_, i) => {
        const a = i * 2 * Math.PI / 5 + Math.PI / 5;
        return atom(`Cbot${i + 1}`, 'C', [1.25 * Math.cos(a), 1.25 * Math.sin(a), -0.78]);
      }),
    ],
    bonds: [
      ...Array.from({ length: 5 }, (_, i) => bond(`Ctop${i + 1}`, `Ctop${(i + 1) % 5 + 1}`)),
      ...Array.from({ length: 5 }, (_, i) => bond(`Cbot${i + 1}`, `Cbot${(i + 1) % 5 + 1}`)),
      ...Array.from({ length: 5 }, (_, i) => bond('Fe', `Ctop${i + 1}`)),
      ...Array.from({ length: 5 }, (_, i) => bond('Fe', `Cbot${i + 1}`)),
    ],
    symmetryElements: [
      E,
      { id: 'C5-z', label: 'C5 sandwich axis', type: 'Cn', order: 5, axis: [0, 0, 1], description: 'Rotation around the Fe-ring axis cycles each cyclopentadienyl ring.' },
      { id: 'C2-edge', label: 'C2 perpendicular axis', type: 'Cn', order: 2, axis: [0.951, 0.309, 0], description: 'A perpendicular C2 axis interchanges the rings in the staggered model.' },
      { id: 'i', label: 'inversion centre', type: 'i', description: 'The staggered model has an inversion centre at iron.' },
      { id: 'S10-z', label: 'S10 axis', type: 'Sn', order: 10, axis: [0, 0, 1], description: 'Improper rotation helps distinguish the staggered D5d description.' },
    ],
    distractorElements: [
      { id: 'sigma-h-test', label: 'sigma h eclipsed comparison', type: 'sigma', planeNormal: [0, 0, 1], planePoint: [0, 0, 0], description: 'This becomes valid in the eclipsed D5h teaching comparison, not this staggered coordinate set.' },
    ],
    pointGroupReasoning: [
      'The simplified staggered sandwich has a C5 principal axis.',
      'Perpendicular C2 axes and an inversion centre are present.',
      'The staggered form is taught as D5d; the eclipsed comparison has sigma h and is D5h.',
      'Therefore this coordinate set demonstrates D5d with a D5h contrast.',
    ],
    commonMistakes: ['Ignoring ring conformation.', 'Using D5h and D5d interchangeably without stating eclipsed versus staggered.'],
  },
];

export const getMoleculeById = (id) => moleculeLibrary.find(molecule => molecule.id === id) || moleculeLibrary[0];
