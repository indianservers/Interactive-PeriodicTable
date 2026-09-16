// Coverage for the Chemical Sciences virtual lab catalogue.
// Status describes the closest in-app experience.
export const virtualLabCoverage = [
  { id: 'physical-chemistry-vl', category: 'elements', title: 'Physical Chemistry Virtual Lab', experiments: [
    ['Spectrophotometry', 'covered', 'beer-lambert-law'],
    ['Cryoscopy', 'covered', 'modules/physical/solutions-colligative-properties'],
    ['Ebullioscopy', 'covered', 'modules/physical/solutions-colligative-properties'],
    ['EMF Measurement', 'covered', 'modules/physical/electrochemistry'],
    ['Determination of Viscosity of Organic Solvents', 'covered', 'viscosity-poiseuille'],
    ['Adsorption Isotherm', 'covered', 'colloids-adsorption'],
    ['Verification of Tafel Equation', 'covered', 'tafel-plot'],
    ['Viscosity-Average Molecular Weight of Polymer', 'covered', 'viscosity-poiseuille'],
    ['Calorimetry – Water Equivalent Calorimetry', 'covered', 'neutralisation-calorimetry'],
    ['Calorimetry – Heat of Neutralization', 'covered', 'neutralisation-calorimetry'],
  ] },
  { id: 'organic-chemistry-vl', category: 'organic', title: 'Organic Chemistry Virtual Lab', experiments: [
    ['Detection of Functional Groups', 'covered', 'organic-qualitative-analysis'],
    ['Detection of Elements: Lassaigne’s Test', 'covered', 'organic-qualitative-analysis'],
    ['Separation of Compounds Using Column Chromatography', 'covered', 'chromatography-separation'],
    ['Purification by Fractional Distillation/Crystallisation', 'covered', 'distillation-crystallisation'],
    ['Purification by Steam Distillation/Crystallisation', 'covered', 'distillation-crystallisation'],
    ['Laser Flash Photometer', 'covered', 'molecules-light'],
    ['Organic Preparations – Allylation of Isatin', 'covered', 'isatin-allylation'],
    ['Bromination of Phenol and Aniline', 'covered', 'bromination-phenol-aniline'],
    ['Benzoylation of Aniline and Phenol', 'covered', 'benzoylation-aniline-phenol'],
    ['Estimation of Aspirin', 'covered', 'aspirin-acetylation'],
    ['Estimation of Glucose', 'covered', 'carbohydrates-glucose-fructose'],
    ['Calculation of λmax Using Woodward–Fieser Rules', 'covered', 'nmr-mass-ir-uv-practice'],
  ] },
  { id: 'inorganic-chemistry-vl', category: 'inorganic', title: 'Inorganic Chemistry Virtual Lab', experiments: [
    ['Water Analysis – Physical Parameters', 'covered', 'soil-ph-conductivity'],
    ['Water Analysis – Chemical Parameters', 'covered', 'soil-ph-conductivity'],
    ['Acid–Base Titration', 'covered', 'acid-base-solutions'],
    ['Gravimetric Estimation of Barium', 'covered', 'gravimetric-precipitation'],
    ['Gravimetric Estimation of Nickel', 'covered', 'gravimetric-precipitation'],
    ['Crystal Field Theory', 'covered', 'coordination-vbt-cft'],
    ['Group Theory', 'covered', 'symmetry'],
    ['Alloy Analysis (Brass)', 'covered', 'gravimetric-precipitation'],
    ['Soil Analysis – Specific Conductivity', 'covered', 'soil-ph-conductivity'],
    ['Soil Analysis – Soil pH', 'covered', 'soil-ph-conductivity'],
  ] },
  { id: 'advanced-analytical-chemistry-vl', category: 'analytical', title: 'Advanced Analytical Chemistry Virtual Lab', experiments: [
    ['Soil Analysis – Available Organic Carbon', 'covered', 'soil-ph-conductivity'],
    ['Soil Analysis – Available Nitrogen (Kjeldahl)', 'covered', 'soil-ph-conductivity'],
    ['Soil Analysis – Available Phosphorus (Bray)', 'covered', 'soil-ph-conductivity'],
    ['Electrogravimetric Estimation of Metals', 'covered', 'electrogravimetric-metals'],
    ['Estimation of Phosphate Content in Soft Drinks', 'covered', 'colorimetry-kmno4-cuso4'],
    ['Flame Photometry', 'covered', 'flame-photometry'],
    ['Polarography – Unknown Cadmium Concentration', 'covered', 'polarography-concentration'],
    ['Polarography – Unknown Vitamin C Concentration', 'covered', 'polarography-concentration'],
  ] },
];

export const virtualLabExperimentCount = virtualLabCoverage.reduce((n, lab) => n + lab.experiments.length, 0);
export const virtualLabStatusCounts = virtualLabCoverage.reduce((counts, lab) => {
  lab.experiments.forEach(([, status]) => { counts[status] = (counts[status] || 0) + 1; });
  return counts;
}, { covered: 0, partial: 0, gap: 0 });
