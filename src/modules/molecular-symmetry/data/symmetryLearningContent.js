export const symmetryOperationLessons = [
  {
    id: 'symmetry-definition',
    title: 'Symmetry',
    definition: 'Symmetry means a molecule can be operated on and still appear unchanged because every atom reaches an equivalent position.',
    example: 'After a valid symmetry operation on water, the two hydrogen atoms may exchange, but the molecule is still water in the same configuration.',
  },
  {
    id: 'identity',
    title: 'Identity operation E',
    definition: 'Identity means doing nothing. The molecule remains exactly as it was.',
    example: 'Every molecule has E, including CH4, H2O, NH3, and even a completely unsymmetrical molecule.',
  },
  {
    id: 'proper-rotation',
    title: 'Proper rotational axis Cn',
    definition: 'A proper rotational axis Cn rotates the molecule by 360/n degrees around an axis and gives an indistinguishable configuration.',
    example: 'Water has a C2 axis: rotate 180 degrees through oxygen and the two hydrogens exchange positions.',
  },
  {
    id: 'reflections',
    title: 'Reflection planes sigma',
    definition: 'A reflection plane is a mirror plane. Atoms on the plane remain fixed; atoms away from the plane reflect to equivalent atoms.',
    example: 'sigma v contains the principal axis. sigma h is perpendicular to the principal axis. sigma d bisects two C2 axes or bonds in high-symmetry molecules.',
  },
  {
    id: 'improper-rotation',
    title: 'Improper rotational axis Sn',
    definition: 'An improper rotational axis means a proper Cn rotation followed by reflection in the plane perpendicular to that axis gives the original configuration.',
    example: 'Methane has S4 axes. For S4, rotate CH4 by 90 degrees about the axis through opposite edge midpoints, then reflect in the perpendicular plane. The final tetrahedral arrangement is identical to the original.',
    focus: true,
  },
  {
    id: 'inversion',
    title: 'Centre of inversion i',
    definition: 'A centre of inversion exists when each atom at position (x, y, z) has an equivalent atom at (-x, -y, -z).',
    example: 'Square-planar XeF4 has an inversion centre at xenon. Methane does not have an inversion centre.',
  },
];

export const reflectionTypes = [
  {
    type: 'sigma v',
    name: 'Vertical mirror plane',
    test: 'Plane contains the principal Cn axis.',
    example: 'Water has two sigma v planes containing its C2 axis.',
  },
  {
    type: 'sigma h',
    name: 'Horizontal mirror plane',
    test: 'Plane is perpendicular to the principal Cn axis.',
    example: 'BF3 has sigma h because the whole molecule lies in the plane perpendicular to the C3 axis.',
  },
  {
    type: 'sigma d',
    name: 'Dihedral mirror plane',
    test: 'Plane contains the principal axis and bisects angles between C2 axes or equivalent bonds.',
    example: 'Methane has sigma d planes in the Td point group.',
  },
];

export const pointGroupClassificationLessons = [
  {
    family: 'Low symmetry',
    groups: 'C1, Cs, Ci',
    rule: 'Use when there is no proper rotational axis beyond E. Cs has one mirror plane; Ci has only inversion.',
  },
  {
    family: 'Cyclic groups',
    groups: 'Cn, Cnv, Cnh',
    rule: 'Use when there is one principal Cn axis and no full set of n perpendicular C2 axes.',
  },
  {
    family: 'Dihedral groups',
    groups: 'Dn, Dnh, Dnd',
    rule: 'Use when the molecule has a principal Cn axis plus n C2 axes perpendicular to it.',
  },
  {
    family: 'Improper-axis groups',
    groups: 'Sn',
    rule: 'Use when an Sn axis is the defining symmetry element and ordinary Cn/Dn classification does not fit.',
  },
  {
    family: 'High-symmetry groups',
    groups: 'Td, Oh, Ih',
    rule: 'Use for tetrahedral, octahedral/cubic, and icosahedral/dodecahedral frameworks.',
  },
  {
    family: 'Linear groups',
    groups: 'C infinity v, D infinity h',
    rule: 'Use for linear molecules; heteronuclear linear molecules are C infinity v and centrosymmetric linear molecules are D infinity h.',
  },
];

export const pointGroupFlowchart = [
  'Draw the real 3D geometry, not only a flat formula.',
  'Check whether the molecule is linear.',
  'Look for special high-symmetry shapes: tetrahedral, octahedral, or icosahedral.',
  'Find the highest-order proper rotational axis Cn.',
  'Ask whether n C2 axes are perpendicular to the principal Cn axis.',
  'Check mirror planes: sigma h, sigma v, and sigma d.',
  'Check centre of inversion i.',
  'Check improper rotational axes Sn.',
  'Match the collected symmetry elements with the point-group family.',
  'Use the point group to predict dipole moment, optical activity, and IR activity.',
];

export const methaneDescentSeries = [
  {
    moleculeId: 'methane',
    formula: 'CH4',
    pointGroup: 'Td',
    symmetry: 'Highest in this substitution series',
    dipole: 'No permanent dipole',
    optical: 'Achiral by improper symmetry',
    note: 'All four H atoms are equivalent. Bond dipoles cancel in the tetrahedral arrangement.',
  },
  {
    moleculeId: 'methyl-chloride',
    formula: 'CH3Cl',
    pointGroup: 'C3v',
    symmetry: 'Descent from Td to C3v',
    dipole: 'Polar along the C-Cl axis',
    optical: 'Achiral because mirror planes remain',
    note: 'One H is replaced by Cl. A C3 axis remains, but tetrahedral equivalence is lost.',
  },
  {
    moleculeId: 'dichloromethane',
    formula: 'CH2Cl2',
    pointGroup: 'C2v',
    symmetry: 'Further descent from C3v to C2v',
    dipole: 'Polar',
    optical: 'Achiral because mirror planes remain',
    note: 'Two H atoms and two Cl atoms create a lower-symmetry tetrahedral derivative.',
  },
  {
    moleculeId: 'chloroform',
    formula: 'CHCl3',
    pointGroup: 'C3v',
    symmetry: 'Ascent relative to CH2Cl2 because three Cl atoms become equivalent',
    dipole: 'Polar along the C-H/CCl3 axis',
    optical: 'Achiral because mirror planes remain',
    note: 'Three equivalent Cl atoms restore a C3 axis, but Td symmetry is not recovered.',
  },
];

export const predictionPrompts = [
  {
    id: 'pointGroup',
    label: 'Point group',
    question: 'Predict the point group for the selected molecule.',
  },
  {
    id: 'dipole',
    label: 'Dipole moment',
    question: 'Predict whether the molecule has a permanent dipole moment.',
  },
  {
    id: 'optical',
    label: 'Optical activity',
    question: 'Predict whether the molecule is symmetry-allowed to be optically active.',
  },
  {
    id: 'vibration',
    label: 'Vibrational modes',
    question: 'Predict the number of fundamental vibrational modes from 3N-6 or 3N-5.',
  },
];
