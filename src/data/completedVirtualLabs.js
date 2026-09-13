import { syllabusCompletedLabs } from "../modules/core-simulations/syllabusInteractiveModel.js";

// Canonical direct-launch catalogue for the mockup-driven virtual laboratories.
// Keep routes aligned with App.jsx and the verification inventory.
const coreVirtualLabs = [
  {id:"acid-base-solutions",title:"Acid–Base Solutions",subject:"Physical",route:"acid-base-solutions",description:"Explore equilibria, buffers, titration and conductivity.",screens:6},
  {id:"beer-lambert-law",title:"Beer–Lambert Laboratory",subject:"Analytical",route:"beer-lambert-law",description:"Prepare standards, calibrate absorbance and determine an unknown.",screens:7},
  {id:"benzoylation-aniline-phenol",title:"Benzoylation of Aniline and Phenol",subject:"Organic",route:"benzoylation-aniline-phenol",description:"Schotten–Baumann benzoylation to benzanilide and phenyl benzoate.",screens:6},
  {id:"bromination-phenol-aniline",title:"Bromination of Phenol and Aniline",subject:"Organic",route:"bromination-phenol-aniline",description:"Compare aqueous bromination of phenol, aniline and protected aniline.",screens:6},
  {id:"chromatography-separation",title:"Chromatography Separation",subject:"Organic",route:"chromatography-separation",description:"Develop TLC conditions, run a column and analyse fractions.",screens:6},
  {id:"distillation-crystallisation",title:"Distillation & Crystallisation",subject:"Organic",route:"distillation-crystallisation",description:"Separate liquids and purify products by crystallisation.",screens:6},
  {id:"flame-photometry",title:"Flame Photometry",subject:"Analytical",route:"flame-photometry",description:"Optimise a flame, measure emission and quantify an unknown.",screens:6},
  {id:"gravimetric-precipitation",title:"Gravimetric Precipitation",subject:"Analytical",route:"gravimetric-precipitation",description:"Precipitate, digest, filter and determine analyte mass.",screens:6},
  {id:"molecular-dynamics",title:"Molecular Dynamics",subject:"Physical",route:"molecular-dynamics",description:"Build an argon system and analyse structure and transport.",screens:6},
  {id:"molecule-polarity",title:"Molecule Polarity",subject:"Physical",route:"molecule-polarity",description:"Combine bond dipoles, geometry and electric-field response.",screens:6},
  {id:"molecules-light",title:"Molecules & Light",subject:"Physical",route:"molecules-light",description:"Connect radiation energy to molecular transitions and spectra.",screens:6},
  {id:"neutralisation-calorimetry",title:"Neutralisation Calorimetry",subject:"Physical",route:"neutralisation-calorimetry",description:"Calibrate a calorimeter and measure reaction enthalpy.",screens:6},
  {id:"polarography-concentration",title:"Polarography Concentration",subject:"Analytical",route:"polarography-concentration",description:"Record polarograms and determine an unknown concentration.",screens:6},
  {id:"reaction-leftovers",title:"Reactants, Products & Leftovers",subject:"Physical",route:"reaction-leftovers",description:"Investigate limiting reactants, yield and atom conservation.",screens:6},
  {id:"real-gas-laws",title:"Real Gas Laws",subject:"Physical",route:"real-gas-laws",description:"Compare equations of state and critical behaviour.",screens:6},
  {id:"soil-ph-conductivity",title:"Soil pH & Conductivity",subject:"Analytical",route:"soil-ph-conductivity",description:"Calibrate sensors and interpret soil acidity and salinity.",screens:6},
  {id:"states-matter",title:"States of Matter",subject:"Physical",route:"states-matter",description:"Explore particles, heating curves and phase diagrams.",screens:6},
  {id:"statistical-thermodynamics",title:"Statistical Thermodynamics",subject:"Physical",route:"statistical-thermodynamics",description:"Count microstates and derive properties from partition functions.",screens:6},
  {id:"tafel-plot",title:"Tafel Plot & Corrosion",subject:"Physical",route:"tafel-plot",description:"Measure polarization and calculate corrosion kinetics.",screens:6},
  {id:"thermodynamics",title:"Thermodynamics",subject:"Physical",route:"thermodynamics",description:"Balance energy and analyse entropy and Gibbs spontaneity.",screens:6},
  {id:"viscosity-poiseuille",title:"Viscosity & Poiseuille",subject:"Physical",route:"viscosity-poiseuille",description:"Measure capillary flow and determine polymer molecular weight.",screens:6},
];

export const completedVirtualLabs = [...coreVirtualLabs, ...syllabusCompletedLabs];

export const completedVirtualLabScreens = completedVirtualLabs.reduce((sum,lab)=>sum+lab.screens,0);
