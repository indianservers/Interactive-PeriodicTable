export const CARBOHYDRATE_GROUPS = {
  Monosaccharides: ['D-Glucose', 'D-Fructose', 'D-Galactose', 'D-Mannose', 'D-Ribose', 'D-Xylose'],
  Disaccharides: ['Sucrose', 'Lactose', 'Maltose', 'Cellobiose', 'Trehalose'],
  Polysaccharides: ['Starch', 'Glycogen', 'Cellulose', 'Chitin'],
};

const compound = (name, slug, formula, molarMass, classification, extra = {}) => ({
  name, slug, formula, molarMass, classification,
  source: `/assets/carbohydrate-studio/structures/${slug}.sdf`,
  sourceType: 'sdf',
  ...extra,
});

export const CARBOHYDRATES = {
  'D-Glucose': compound('D-Glucose', 'd-glucose', 'C₆H₁₂O₆', 180.16, 'Monosaccharide · aldohexose', {
    cid: 5793, ring: 'α-D-glucopyranose', ringSize: 6, anomericCarbon: 'C1', reducing: true,
    fischer: ['right', 'left', 'right', 'right'], stereocenters: [['C1', 'α (hemiacetal)', '—'], ['C2', 'OH right', 'R'], ['C3', 'OH left', 'S'], ['C4', 'OH right', 'R'], ['C5', 'OH right', 'R']],
    rotation: 52.7, sweetness: 0.7, solubility: [47, 91, 113, 151, 202, 280], melting: 'Decomposes at 146 °C', role: 'Primary blood sugar and central cellular fuel.', reactions: ['Oxidation', 'Reduction', 'Fermentation'],
  }),
  'D-Fructose': compound('D-Fructose', 'd-fructose', 'C₆H₁₂O₆', 180.16, 'Monosaccharide · ketohexose', {
    cid: 2723872, ring: 'β-D-fructofuranose', ringSize: 5, anomericCarbon: 'C2', reducing: true,
    fischer: ['carbonyl', 'left', 'right', 'right'], stereocenters: [['C2', 'β (hemiketal)', '—'], ['C3', 'OH left', 'S'], ['C4', 'OH right', 'R'], ['C5', 'OH right', 'R']],
    rotation: -92.4, sweetness: 1.7, solubility: [79, 132, 155, 190, 240, 320], melting: 'Decomposes at 103 °C', role: 'Fruit sugar; enters glycolysis after phosphorylation.', reactions: ['Reduction', 'Fermentation'],
  }),
  'D-Galactose': compound('D-Galactose', 'd-galactose', 'C₆H₁₂O₆', 180.16, 'Monosaccharide · aldohexose', {
    cid: 6036, ring: 'α-D-galactopyranose', ringSize: 6, anomericCarbon: 'C1', reducing: true,
    fischer: ['right', 'left', 'left', 'right'], stereocenters: [['C1', 'α (hemiacetal)', '—'], ['C2', 'OH right', 'R'], ['C3', 'OH left', 'S'], ['C4', 'OH left', 'S'], ['C5', 'OH right', 'R']],
    rotation: 80.2, sweetness: 0.3, solubility: [32, 48, 68, 91, 119, 158], melting: 'Decomposes near 168 °C', role: 'Constituent of lactose and glycolipids.', reactions: ['Oxidation', 'Reduction'],
  }),
  'D-Mannose': compound('D-Mannose', 'd-mannose', 'C₆H₁₂O₆', 180.16, 'Monosaccharide · aldohexose', {
    cid: 18950, ring: 'α-D-mannopyranose', ringSize: 6, anomericCarbon: 'C1', reducing: true,
    fischer: ['left', 'left', 'right', 'right'], stereocenters: [['C1', 'α (hemiacetal)', '—'], ['C2', 'OH left', 'S'], ['C3', 'OH left', 'S'], ['C4', 'OH right', 'R'], ['C5', 'OH right', 'R']],
    rotation: 14.2, sweetness: 0.6, solubility: [39, 55, 72, 98, 133, 181], melting: 'Decomposes near 132 °C', role: 'Important in protein glycosylation.', reactions: ['Oxidation', 'Reduction'],
  }),
  'D-Ribose': compound('D-Ribose', 'd-ribose', 'C₅H₁₀O₅', 150.13, 'Monosaccharide · aldopentose', {
    cid: 10975657, ring: 'β-D-ribofuranose', ringSize: 5, anomericCarbon: 'C1', reducing: true,
    fischer: ['right', 'right', 'right'], stereocenters: [['C1', 'β (hemiacetal)', '—'], ['C2', 'OH right', 'R'], ['C3', 'OH right', 'R'], ['C4', 'OH right', 'R']],
    rotation: -23.7, sweetness: 0.4, solubility: [55, 78, 108, 143, 188, 245], melting: 'Decomposes near 95 °C', role: 'Sugar component of RNA, ATP and NAD⁺.', reactions: ['Oxidation', 'Reduction'],
  }),
  'D-Xylose': compound('D-Xylose', 'd-xylose', 'C₅H₁₀O₅', 150.13, 'Monosaccharide · aldopentose', {
    cid: 135191, ring: 'α-D-xylopyranose', ringSize: 6, anomericCarbon: 'C1', reducing: true,
    fischer: ['right', 'left', 'right'], stereocenters: [['C1', 'α (hemiacetal)', '—'], ['C2', 'OH right', 'R'], ['C3', 'OH left', 'S'], ['C4', 'OH right', 'R']],
    rotation: 18.8, sweetness: 0.7, solubility: [36, 51, 70, 97, 136, 190], melting: 'Melts near 145 °C', role: 'Major component of plant hemicellulose.', reactions: ['Oxidation', 'Reduction', 'Fermentation'],
  }),
  Sucrose: compound('Sucrose', 'sucrose', 'C₁₂H₂₂O₁₁', 342.30, 'Disaccharide', {
    cid: 5988, ring: 'α-D-glucopyranosyl-(1→2)-β-D-fructofuranoside', ringSize: 6, anomericCarbon: 'C1 and C2', reducing: false, linkage: 'α(1→2)β',
    fischer: ['right', 'left', 'right', 'right'], stereocenters: [['Glucose C1', 'α (acetal)', '—'], ['Glucose C2', 'OH right', 'R'], ['Glucose C3', 'OH left', 'S'], ['Glucose C4', 'OH right', 'R'], ['Glucose C5', 'OH right', 'R'], ['Fructose C2', 'β (ketal)', '—'], ['Fructose C3', 'OH left', 'S'], ['Fructose C4', 'OH right', 'R'], ['Fructose C5', 'OH right', 'R']],
    rotation: 66.5, sweetness: 1, solubility: [179, 211, 238, 287, 362, 487], melting: 'Decomposes near 186 °C', role: 'Principal transport sugar in plants and common table sugar.', reactions: ['Hydrolysis'],
  }),
  Lactose: compound('Lactose', 'lactose', 'C₁₂H₂₂O₁₁', 342.30, 'Disaccharide', { cid: 6134, ring: 'β-D-galactopyranosyl-(1→4)-D-glucose', ringSize: 6, anomericCarbon: 'Glucose C1', reducing: true, linkage: 'β(1→4)', rotation: 52.3, sweetness: 0.16, solubility: [12, 18, 27, 41, 63, 102], melting: 'Decomposes near 202 °C', role: 'Milk sugar; hydrolysed by lactase.', reactions: ['Hydrolysis'], stereocenters: [['Galactose C1', 'β linkage', '—'], ['Glucose C1', 'free hemiacetal', '—']] }),
  Maltose: compound('Maltose', 'maltose', 'C₁₂H₂₂O₁₁', 342.30, 'Disaccharide', { cid: 439186, ring: 'α-D-glucopyranosyl-(1→4)-D-glucose', ringSize: 6, anomericCarbon: 'Terminal C1', reducing: true, linkage: 'α(1→4)', rotation: 137.0, sweetness: 0.33, solubility: [55, 74, 105, 148, 213, 330], melting: 'Decomposes near 160 °C', role: 'Intermediate in starch digestion.', reactions: ['Hydrolysis', 'Fermentation'], stereocenters: [['Glucose C1', 'α linkage', '—'], ['Terminal C1', 'free hemiacetal', '—']] }),
  Cellobiose: compound('Cellobiose', 'cellobiose', 'C₁₂H₂₂O₁₁', 342.30, 'Disaccharide', { cid: 439178, ring: 'β-D-glucopyranosyl-(1→4)-D-glucose', ringSize: 6, anomericCarbon: 'Terminal C1', reducing: true, linkage: 'β(1→4)', rotation: 34.6, sweetness: 0.2, solubility: [8, 13, 20, 32, 50, 80], melting: 'Decomposes near 225 °C', role: 'Repeating disaccharide unit produced from cellulose.', reactions: ['Hydrolysis'], stereocenters: [['Glucose C1', 'β linkage', '—'], ['Terminal C1', 'free hemiacetal', '—']] }),
  Trehalose: compound('Trehalose', 'trehalose', 'C₁₂H₂₂O₁₁', 342.30, 'Disaccharide', { cid: 7427, ring: 'α-D-glucopyranosyl-(1↔1)-α-D-glucopyranoside', ringSize: 6, anomericCarbon: 'Both C1 atoms', reducing: false, linkage: 'α,α(1↔1)', rotation: 197.0, sweetness: 0.45, solubility: [45, 58, 76, 104, 151, 231], melting: 'Decomposes near 203 °C', role: 'Protective sugar in fungi, insects and desiccation-tolerant organisms.', reactions: ['Hydrolysis'], stereocenters: [['Glucose A C1', 'α acetal', '—'], ['Glucose B C1', 'α acetal', '—']] }),
  Starch: compound('Starch', 'starch', '(C₆H₁₀O₅)ₙ', null, 'Polysaccharide · α-glucan', { cid: 123966, sourceNote: 'Maltotetraose segment', ring: 'α(1→4) amylose with α(1→6) branches in amylopectin', ringSize: 6, anomericCarbon: 'Polymer linkage C1', reducing: true, linkage: 'α(1→4), α(1→6)', rotation: null, sweetness: 0, solubility: [0, 0, 1, 5, 18, 35], melting: 'Gelatinizes; decomposes on strong heating', role: 'Plant glucose storage polymer.', reactions: ['Hydrolysis'], stereocenters: [['Repeat C1', 'α glycosidic', '—']] }),
  Glycogen: compound('Glycogen', 'glycogen', '(C₆H₁₀O₅)ₙ', null, 'Polysaccharide · branched α-glucan', { cid: 439177, sourceNote: 'Validated glucan segment', ring: 'α(1→4) chains with frequent α(1→6) branches', ringSize: 6, anomericCarbon: 'Polymer linkage C1', reducing: true, linkage: 'α(1→4), α(1→6)', rotation: null, sweetness: 0, solubility: [1, 2, 3, 5, 8, 12], melting: 'Decomposes on heating', role: 'Rapidly mobilized glucose store in animals and fungi.', reactions: ['Hydrolysis'], stereocenters: [['Repeat C1', 'α glycosidic', '—']] }),
  Cellulose: compound('Cellulose', 'cellulose', '(C₆H₁₀O₅)ₙ', null, 'Polysaccharide · β-glucan', { cid: 170125, sourceNote: 'Cellotetraose segment', ring: 'Linear β(1→4)-linked D-glucose', ringSize: 6, anomericCarbon: 'Polymer linkage C1', reducing: true, linkage: 'β(1→4)', rotation: null, sweetness: 0, solubility: [0, 0, 0, 0, 0, 0], melting: 'Decomposes above 260 °C', role: 'Structural fibre of plant cell walls.', reactions: ['Hydrolysis'], stereocenters: [['Repeat C1', 'β glycosidic', '—']] }),
  Chitin: compound('Chitin', 'chitin', '(C₈H₁₃O₅N)ₙ', null, 'Polysaccharide · amino sugar polymer', { cid: 3080615, sourceNote: 'Chitotetraose segment', ring: 'β(1→4)-linked N-acetyl-D-glucosamine', ringSize: 6, anomericCarbon: 'Polymer linkage C1', reducing: true, linkage: 'β(1→4)', rotation: null, sweetness: 0, solubility: [0, 0, 0, 0, 0, 0], melting: 'Decomposes above 300 °C', role: 'Structural material in arthropod exoskeletons and fungal walls.', reactions: ['Hydrolysis'], stereocenters: [['Repeat C1', 'β glycosidic', '—']] }),
};

export const COMPOUND_NAMES = Object.keys(CARBOHYDRATES);

export const STUDIO_ROUTES = [
  ['Structure', '/carbohydrate-structure-studio'],
  ['Reactions', '/carbohydrate-structure-studio/reactions'],
  ['Properties', '/carbohydrate-structure-studio/properties'],
  ['Biology', '/carbohydrate-structure-studio/biology'],
  ['Quizzes', '/carbohydrate-structure-studio/quizzes'],
];

export const BUILT_DISACCHARIDES = {
  'D-Glucose|D-Fructose|α(1→2)β': 'Sucrose',
  'D-Galactose|D-Glucose|β(1→4)': 'Lactose',
  'D-Glucose|D-Glucose|α(1→4)': 'Maltose',
  'D-Glucose|D-Glucose|β(1→4)': 'Cellobiose',
  'D-Glucose|D-Glucose|α,α(1↔1)': 'Trehalose',
};
