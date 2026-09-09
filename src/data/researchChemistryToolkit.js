export const researchDomains = [
  { id: 'data-fitting', label: 'Data Fitting', focus: 'CSV import, regression, residuals, uncertainty and model choice', route: 'research-toolkit', color: '#38bdf8' },
  { id: 'eln', label: 'Research Notebook', focus: 'Hypothesis, method, provenance, observations, risks and reproducibility', route: 'research-toolkit', color: '#22c55e' },
  { id: 'cheminformatics', label: 'Cheminformatics', focus: 'Descriptors, SAR, similarity, filters and assay triage', route: 'drug-discovery', color: '#a78bfa' },
  { id: 'computational', label: 'Computational Bridge', focus: 'Conformer, charge, orbital, docking and validation workflow planning', route: 'molecule', color: '#f59e0b' },
  { id: 'literature', label: 'Literature Evidence', focus: 'Search logs, claim matrices, citation-ready evidence and contradiction tracking', route: 'research-toolkit', color: '#e11d48' },
];

export const researchWorkflowTemplates = [
  {
    id: 'kinetics-fitting',
    domain: 'data-fitting',
    title: 'Kinetics Model Fitting',
    level: 'UG Research / MSc',
    route: 'physical-simulators',
    goal: 'Fit concentration-time data to zero, first and second order forms, inspect residuals, and justify model choice.',
    inputs: ['time', 'concentration', 'temperature', 'replicate id', 'blank corrected signal'],
    outputs: ['rate constant', 'fit equation', 'R2', 'residual comment', 'model rejection note'],
    checks: ['Axis units recorded', 'Replicates not averaged too early', 'Residuals randomly scattered', 'Temperature in kelvin'],
  },
  {
    id: 'calibration-validation',
    domain: 'data-fitting',
    title: 'Analytical Calibration Validation',
    level: 'BSc / MSc Analytical',
    route: 'lab',
    goal: 'Build calibration curves with blank correction, LOD/LOQ, recovery, precision and matrix-interference checks.',
    inputs: ['standard concentration', 'instrument response', 'blank response', 'sample response', 'spike recovery'],
    outputs: ['slope/intercept', 'unknown concentration', 'LOD/LOQ', 'RSD', 'recovery decision'],
    checks: ['Blank correction applied', 'Range is linear', 'Outliers documented', 'Matrix spike inside acceptance window'],
  },
  {
    id: 'nonlinear-binding-fit',
    domain: 'data-fitting',
    title: 'Nonlinear Binding / Michaelis-Menten Fit',
    level: 'MSc / PhD',
    route: 'research-toolkit',
    goal: 'Compare linearized and nonlinear model choices for saturation, adsorption, enzyme and binding datasets without hiding error structure.',
    inputs: ['substrate or ligand concentration', 'response', 'replicate id', 'initial parameter guesses', 'weighting rule'],
    outputs: ['Km, Kd or Vmax', 'confidence interval note', 'residual pattern', 'model comparison note', 'rejected model'],
    checks: ['Do not transform away error structure', 'Inspect residuals at low and high concentration', 'Report bounds and initial guesses', 'Validate with an independent replicate'],
  },
  {
    id: 'spectra-unknown-eln',
    domain: 'eln',
    title: 'Unknown Compound ELN Entry',
    level: 'UG Research / MSc Organic',
    route: 'spectroscopy-interpreter',
    goal: 'Record formula, spectra, rejected alternatives, assignments and final identity with provenance.',
    inputs: ['sample id', 'formula', 'IR peaks', 'NMR shifts', 'MS fragments', 'instrument/date'],
    outputs: ['DBE', 'peak assignment table', 'structure claim', 'confidence level', 'next confirmation test'],
    checks: ['Every major peak assigned', 'Alternative structures rejected', 'Raw file name captured', 'Operator and instrument logged'],
  },
  {
    id: 'sar-triage',
    domain: 'cheminformatics',
    title: 'SAR and Compound Triage',
    level: 'MSc / PhD',
    route: 'drug-discovery',
    goal: 'Compare analogues by descriptors, potency, selectivity, ADME risk and synthetic feasibility.',
    inputs: ['SMILES', 'target', 'assay result', 'logP', 'TPSA', 'HBD/HBA', 'toxicity flag'],
    outputs: ['lead-like decision', 'SAR hypothesis', 'next analogue', 'liability note', 'assay priority'],
    checks: ['Same assay format compared', 'Activity units normalized', 'PAINS/reactive alerts reviewed', 'Solubility risk considered'],
  },
  {
    id: 'comp-chem-protocol',
    domain: 'computational',
    title: 'Computational Chemistry Protocol',
    level: 'MSc / PhD',
    route: 'molecule',
    goal: 'Plan a reproducible conformer, charge, orbital or docking workflow with validation checkpoints.',
    inputs: ['structure source', 'protonation state', 'method/basis', 'solvent model', 'constraints', 'software version'],
    outputs: ['optimized geometry', 'energy comparison', 'orbital/charge map', 'validation note', 'reproducibility bundle'],
    checks: ['Initial structure provenance', 'Correct protonation/tautomer', 'Convergence checked', 'Method limitations stated'],
  },
  {
    id: 'literature-claim-matrix',
    domain: 'literature',
    title: 'Literature Claim Matrix',
    level: 'MSc / PhD',
    route: 'research-toolkit',
    goal: 'Turn papers into a traceable claim, evidence, limitation and next-experiment map.',
    inputs: ['citation', 'DOI', 'method', 'sample or context', 'key result', 'stated limitation'],
    outputs: ['claim matrix', 'evidence strength', 'contradiction note', 'citation-ready summary', 'next experiment'],
    checks: ['Primary source preferred', 'Method is comparable to your experiment', 'Limitation captured beside every claim', 'No unsupported generalization'],
  },
];

export const nonlinearModelGuides = [
  {
    model: 'Michaelis-Menten',
    equation: 'v = Vmax[S] / (Km + [S])',
    use: 'Enzyme saturation, catalytic rate comparisons and inhibitor pre-screening.',
    watch: 'Lineweaver-Burk plots distort errors; use them as teaching views, not final evidence.',
  },
  {
    model: 'Langmuir adsorption',
    equation: 'q = qmax K C / (1 + K C)',
    use: 'Surface coverage, adsorption capacity and single-site adsorption assumptions.',
    watch: 'Poor fit at high concentration can indicate multilayer adsorption or heterogeneous sites.',
  },
  {
    model: 'First-order decay',
    equation: 'A = A0 e^(-kt)',
    use: 'Radioactive decay, decomposition kinetics and concentration-time datasets.',
    watch: 'Check baseline correction before interpreting a small residual as mechanistic evidence.',
  },
  {
    model: 'Dose response',
    equation: 'response = bottom + (top - bottom) / (1 + 10^((logEC50 - x)nH))',
    use: 'Bioassay, toxicity, receptor binding and materials response curves.',
    watch: 'Replicate design matters; a beautiful curve with sparse middle points is fragile.',
  },
];

export const literatureWorkflowChecklist = [
  { step: 'Search', detail: 'Define keywords, databases, inclusion/exclusion rules and date range before reading deeply.', output: 'Search log' },
  { step: 'Screen', detail: 'Separate review articles, primary experiments, methods papers and contradictory findings.', output: 'Paper type map' },
  { step: 'Extract', detail: 'Capture claim, method, sample, key data, limitation and DOI in one row.', output: 'Claim matrix' },
  { step: 'Compare', detail: 'Mark where methods differ enough that results should not be pooled casually.', output: 'Compatibility note' },
  { step: 'Synthesize', detail: 'Write the strongest supported claim plus a limitation and next experiment.', output: 'Citation-ready paragraph' },
];

export const researchNotebookSections = [
  { id: 'question', title: 'Research Question', prompt: 'What exact chemical claim is being tested, and what result would falsify it?' },
  { id: 'provenance', title: 'Sample and Data Provenance', prompt: 'Record source, batch, instrument, operator, date, file names and processing version.' },
  { id: 'method', title: 'Method and Parameters', prompt: 'Capture conditions, reagents, calibration, software, assumptions and deviations.' },
  { id: 'results', title: 'Results and Residuals', prompt: 'Report raw observation, processed value, uncertainty, residuals and rejected data with reason.' },
  { id: 'interpretation', title: 'Interpretation', prompt: 'Connect result to mechanism, structure, thermodynamics, kinetics or assay hypothesis.' },
  { id: 'reproducibility', title: 'Reproducibility Pack', prompt: 'List data files, code/settings, version, controls, safety notes and next replication step.' },
];

export const researchReadinessChecks = [
  { id: 'fitting', title: 'CSV/fitting workflow', status: 'Active', detail: 'Linear fitting, residuals and provenance fields are available in the research toolkit.' },
  { id: 'eln', title: 'ELN structure', status: 'Active', detail: 'Notebook sections cover hypothesis, method, provenance, interpretation and reproducibility.' },
  { id: 'cheminfo', title: 'Cheminformatics bridge', status: 'Active', detail: 'Drug discovery workflows now connect descriptors, SAR, assay triage and liability checks.' },
  { id: 'nonlinear', title: 'Nonlinear model guidance', status: 'Active', detail: 'Michaelis-Menten, Langmuir, decay and dose-response guides now support research-level model choice.' },
  { id: 'literature', title: 'Literature evidence workflow', status: 'Active', detail: 'Claim matrices, search logs and contradiction notes are now part of the research lane.' },
  { id: 'true-import', title: 'File import/export automation', status: 'Needed', detail: 'Current tools support local interactive work; robust file import/export and validated analysis engines remain future improvements.' },
];

export const researchToolkitStats = {
  domains: researchDomains.length,
  workflows: researchWorkflowTemplates.length,
  notebookSections: researchNotebookSections.length,
  checks: researchReadinessChecks.length,
};
