// Benchmark coverage for the Chemical Sciences Virtual Labs catalogue.
// Status describes the closest in-app experience, not a claim that the
// Amrita implementation is reproduced verbatim.
export const virtualLabCoverage = [
  { id: 'physical-chemistry-vl', category: 'elements', title: 'Physical Chemistry Virtual Lab', sourceUrl: 'https://vlab.amrita.edu/?sub=2&brch=190', experiments: [
    ['Spectrophotometry', 'partial'], ['Cryoscopy', 'covered'], ['Ebullioscopy', 'covered'], ['EMF Measurement', 'covered'], ['Determination of Viscosity of Organic Solvents', 'covered'], ['Adsorption Isotherm', 'covered'], ['Verification of Tafel Equation', 'partial'], ['Viscosity-Average Molecular Weight of Polymer', 'partial'], ['Calorimetry – Water Equivalent Calorimetry', 'covered'], ['Calorimetry – Heat of Neutralization', 'partial'],
  ] },
  { id: 'organic-chemistry-vl', category: 'organic', title: 'Organic Chemistry Virtual Lab', sourceUrl: 'https://vlab.amrita.edu/?sub=2&brch=191', experiments: [
    ['Detection of Functional Groups', 'covered'], ['Detection of Elements: Lassaigne’s Test', 'partial'], ['Separation of Compounds Using Column Chromatography', 'partial'], ['Purification by Fractional Distillation/Crystallisation', 'partial'], ['Purification by Steam Distillation/Crystallisation', 'partial'], ['Laser Flash Photometer', 'covered'], ['Organic Preparations – Allylation of Isatin', 'partial'], ['Estimation of Aspirin', 'covered'], ['Estimation of Glucose', 'covered'], ['Calculation of λmax Using Woodward–Fieser Rules', 'covered'],
  ] },
  { id: 'inorganic-chemistry-vl', category: 'inorganic', title: 'Inorganic Chemistry Virtual Lab', sourceUrl: 'https://vlab.amrita.edu/?sub=2&brch=193', experiments: [
    ['Water Analysis – Physical Parameters', 'covered'], ['Water Analysis – Chemical Parameters', 'covered'], ['Acid–Base Titration', 'covered'], ['Gravimetric Estimation of Barium', 'covered'], ['Gravimetric Estimation of Nickel', 'covered'], ['Crystal Field Theory', 'covered'], ['Group Theory', 'covered'], ['Alloy Analysis (Brass)', 'covered'], ['Soil Analysis – Specific Conductivity', 'covered'], ['Soil Analysis – Soil pH', 'covered'],
  ] },
  { id: 'advanced-analytical-chemistry-vl', category: 'analytical', title: 'Advanced Analytical Chemistry Virtual Lab', sourceUrl: 'https://vlab.amrita.edu/?sub=2&brch=294', experiments: [
    ['Soil Analysis – Available Organic Carbon', 'covered'], ['Soil Analysis – Available Nitrogen (Kjeldahl)', 'covered'], ['Soil Analysis – Available Phosphorus (Bray)', 'covered'], ['Electrogravimetric Estimation of Metals', 'partial'], ['Estimation of Phosphate Content in Soft Drinks', 'covered'], ['Flame Photometry', 'covered'], ['Polarography – Unknown Cadmium Concentration', 'covered'], ['Polarography – Unknown Vitamin C Concentration', 'covered'],
  ] },
];

export const virtualLabExperimentCount = virtualLabCoverage.reduce((n, lab) => n + lab.experiments.length, 0);
export const virtualLabStatusCounts = virtualLabCoverage.reduce((counts, lab) => {
  lab.experiments.forEach(([, status]) => { counts[status] = (counts[status] || 0) + 1; });
  return counts;
}, { covered: 0, partial: 0, gap: 0 });
