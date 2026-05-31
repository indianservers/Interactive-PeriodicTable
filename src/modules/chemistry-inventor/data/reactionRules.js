export const reactionRules = [
  { id: 'neutralization', title: 'Acid + base -> salt + water', reactants: ['acid', 'base'], observation: 'Temperature may rise slightly; indicator colour moves toward neutral.', grades: [7, 10] },
  { id: 'chloride-test', title: 'Chloride ion + silver nitrate', reactants: ['chloride', 'silver-nitrate'], observation: 'White precipitate of silver chloride.', equation: 'AgNO3 + NaCl -> AgCl + NaNO3', grades: [10] },
  { id: 'sulphate-test', title: 'Sulphate ion + barium chloride', reactants: ['sulphate', 'barium-chloride'], observation: 'White precipitate of barium sulphate.', equation: 'BaCl2 + Na2SO4 -> BaSO4 + 2NaCl', grades: [10] },
  { id: 'carbonate-test', title: 'Carbonate + acid', reactants: ['carbonate', 'acid'], observation: 'Effervescence; carbon dioxide turns limewater milky.', equation: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2', grades: [10] },
  { id: 'acid-metal', title: 'Metal + dilute acid', reactants: ['metal', 'acid'], observation: 'Bubbles of hydrogen gas may form.', equation: 'Zn + 2HCl -> ZnCl2 + H2', grades: [8, 10] },
  { id: 'co2-limewater-test', title: 'Carbon dioxide + limewater', reactants: ['carbon-dioxide', 'limewater'], observation: 'Limewater turns milky.', equation: 'Ca(OH)2 + CO2 -> CaCO3 + H2O', grades: [8, 10] },
  { id: 'indicator-test', title: 'Indicator colour change', reactants: ['indicator', 'acid-or-base'], observation: 'Indicator colour changes depending on pH.', grades: [7, 8, 10] },
  { id: 'conductivity', title: 'Ionic solution conducts electricity', reactants: ['salt-solution'], observation: 'Conceptual bulb glows because ions carry charge.', grades: [10] },
];
