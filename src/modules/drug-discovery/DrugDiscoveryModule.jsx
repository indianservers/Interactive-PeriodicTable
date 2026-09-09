import { useMemo, useState } from 'react';
import {
  Activity, Atom, BadgeCheck, BarChart3, Beaker, BookOpen, Boxes, Brain,
  ChevronRight, Database, Dna, Download, ExternalLink, FlaskConical,
  GitCompare, Link2, Microscope, Orbit, Pill, Search, ShieldAlert, Sparkles,
  Target, TestTube2,
} from 'lucide-react';

const targetLibrary = [
  {
    id: 'egfr',
    name: 'EGFR kinase',
    area: 'Oncology',
    disease: 'Cancer signaling',
    uniprot: 'P00533',
    chemblTarget: 'CHEMBL203',
    pdb: '1M17',
    ligands: ['gefitinib', 'erlotinib', 'osimertinib'],
    pathway: 'Receptor tyrosine kinase signaling',
    biology: 'Cell growth, survival signaling, and resistance mutations in epithelial tumors.',
    clinicalNeed: 'Subtype-selective kinase inhibition with resistance monitoring.',
    assay: 'Kinase inhibition, phospho-EGFR cell assay, mutation selectivity panel.',
    biomarkers: ['EGFR exon 19', 'L858R', 'T790M', 'pEGFR'],
    modality: 'Small-molecule kinase inhibitor',
    evidence: 92,
    developability: 72,
    stageGate: 'Advance with mutation-aware selectivity package',
    risk: 'Resistance mutations and off-target kinase activity',
  },
  {
    id: 'hmgcr',
    name: 'HMG-CoA reductase',
    area: 'Cardiovascular',
    disease: 'Hypercholesterolemia',
    uniprot: 'P04035',
    chemblTarget: 'CHEMBL402',
    pdb: '1HW9',
    ligands: ['atorvastatin', 'simvastatin', 'rosuvastatin'],
    pathway: 'Cholesterol biosynthesis',
    biology: 'Rate-limiting enzyme in mevalonate pathway and LDL cholesterol reduction.',
    clinicalNeed: 'High LDL-C lowering with hepatic exposure and low muscle toxicity.',
    assay: 'Enzyme inhibition, hepatocyte uptake, lipid panel response model.',
    biomarkers: ['LDL-C', 'ApoB', 'ALT/AST', 'CK'],
    modality: 'Small-molecule enzyme inhibitor',
    evidence: 96,
    developability: 84,
    stageGate: 'Benchmark against statin exposure and safety window',
    risk: 'Lipophilicity, hepatic exposure, muscle toxicity signal',
  },
  {
    id: 'ace',
    name: 'Angiotensin-converting enzyme',
    area: 'Cardiovascular',
    disease: 'Hypertension',
    uniprot: 'P12821',
    chemblTarget: 'CHEMBL1808',
    pdb: '1O8A',
    ligands: ['captopril', 'enalapril', 'lisinopril'],
    pathway: 'Renin-angiotensin system',
    biology: 'Converts angiotensin I to angiotensin II and shapes vascular tone.',
    clinicalNeed: 'Blood pressure control with renal and electrolyte monitoring.',
    assay: 'ACE fluorogenic substrate assay, zinc-binding selectivity, BP model.',
    biomarkers: ['BP', 'creatinine', 'potassium', 'urine albumin'],
    modality: 'Small-molecule metalloprotease inhibitor',
    evidence: 90,
    developability: 78,
    stageGate: 'Optimize metal binding and renal safety monitoring',
    risk: 'Metal binding, cough risk, renal monitoring',
  },
  {
    id: 'hbb',
    name: 'Hemoglobin beta',
    area: 'Hematology',
    disease: 'Oxygen transport and hemoglobinopathy',
    uniprot: 'P68871',
    chemblTarget: 'CHEMBL2096972',
    pdb: '1A3N',
    ligands: ['oxygen', 'carbon monoxide', 'voxelotor'],
    pathway: 'Cooperative oxygen binding',
    biology: 'Beta-globin oxygen transport, allostery, and sickle hemoglobin polymerization.',
    clinicalNeed: 'Improve oxygen delivery and reduce sickling or toxic ligand binding.',
    assay: 'Oxygen affinity, hemolysis model, polymerization and RBC morphology.',
    biomarkers: ['HbS', 'SpO2', 'reticulocytes', 'bilirubin'],
    modality: 'Allosteric small-molecule modulator',
    evidence: 82,
    developability: 64,
    stageGate: 'Hold for functional oxygen affinity and hemolysis balance',
    risk: 'Heme iron state, hypoxia, CO poisoning',
  },
  {
    id: 'dpp4',
    name: 'DPP-4',
    area: 'Metabolic',
    disease: 'Type 2 diabetes',
    uniprot: 'P27487',
    chemblTarget: 'CHEMBL284',
    pdb: '2ON6',
    ligands: ['sitagliptin', 'linagliptin', 'vildagliptin'],
    pathway: 'Incretin hormone regulation',
    biology: 'Cleaves GLP-1 and GIP, reducing incretin-driven insulin release.',
    clinicalNeed: 'Glycemic control with low hypoglycemia risk and renal dose awareness.',
    assay: 'DPP-4 enzyme assay, GLP-1 stabilization, glucose response model.',
    biomarkers: ['HbA1c', 'fasting glucose', 'GLP-1', 'eGFR'],
    modality: 'Small-molecule enzyme inhibitor',
    evidence: 88,
    developability: 80,
    stageGate: 'Advance with renal dosing and selectivity against DPP family',
    risk: 'DPP-family selectivity and renal exposure',
  },
  {
    id: 'ptgs2',
    name: 'COX-2 / PTGS2',
    area: 'Inflammation',
    disease: 'Pain and inflammatory signaling',
    uniprot: 'P35354',
    chemblTarget: 'CHEMBL230',
    pdb: '5F19',
    ligands: ['celecoxib', 'rofecoxib', 'etoricoxib'],
    pathway: 'Prostaglandin biosynthesis',
    biology: 'Inflammation-induced cyclooxygenase that produces prostaglandin mediators.',
    clinicalNeed: 'Anti-inflammatory effect while managing GI, renal, and CV risk.',
    assay: 'COX-1/COX-2 selectivity assay, PGE2 cell assay, platelet sparing readout.',
    biomarkers: ['PGE2', 'CRP', 'renal markers', 'BP'],
    modality: 'Small-molecule anti-inflammatory inhibitor',
    evidence: 86,
    developability: 69,
    stageGate: 'Optimize selectivity with cardiovascular risk screen',
    risk: 'COX-1 selectivity tradeoff and cardiovascular liability',
  },
  {
    id: 'bace1',
    name: 'BACE1 beta-secretase',
    area: 'CNS',
    disease: "Alzheimer's disease biology",
    uniprot: 'P56817',
    chemblTarget: 'CHEMBL4822',
    pdb: '2ZHV',
    ligands: ['verubecestat', 'lanabecestat', 'elenbecestat'],
    pathway: 'Amyloid precursor protein processing',
    biology: 'Aspartyl protease that initiates beta-amyloid peptide generation.',
    clinicalNeed: 'Brain-penetrant modulation with cognition and safety protection.',
    assay: 'BACE1 enzyme assay, Abeta lowering, CNS penetration and selectivity panel.',
    biomarkers: ['Abeta42', 'tau', 'CSF exposure', 'cognition'],
    modality: 'CNS small-molecule protease inhibitor',
    evidence: 76,
    developability: 48,
    stageGate: 'Hold until translational safety and CNS benefit are clear',
    risk: 'CNS exposure, cognition signal, and translational uncertainty',
  },
  {
    id: 'inha',
    name: 'InhA enoyl-ACP reductase',
    area: 'Infectious Disease',
    disease: 'Tuberculosis cell-wall synthesis',
    uniprot: 'P9WGR1',
    chemblTarget: 'CHEMBL1849',
    pdb: '1ENY',
    ligands: ['isoniazid', 'ethionamide', 'triclosan'],
    pathway: 'Mycolic acid biosynthesis',
    biology: 'Fatty-acid reductase required for mycobacterial cell-wall construction.',
    clinicalNeed: 'Active against resistant TB with clear MIC and resistance marker tracking.',
    assay: 'MIC panel, InhA enzyme assay, macrophage infection model.',
    biomarkers: ['MIC', 'katG', 'inhA promoter', 'culture conversion'],
    modality: 'Antibacterial enzyme inhibitor',
    evidence: 84,
    developability: 57,
    stageGate: 'Advance only with resistance and intracellular activity package',
    risk: 'Resistance mutations, activation dependency, intracellular penetration',
  },
];

const diseaseAreas = [
  ['All', 'Complete target portfolio', '#38bdf8'],
  ['Oncology', 'Kinase and tumor signaling', '#fb7185'],
  ['Cardiovascular', 'Lipids, BP, vascular biology', '#22c55e'],
  ['Metabolic', 'Glucose and endocrine chemistry', '#f59e0b'],
  ['Inflammation', 'Prostaglandins and immune mediators', '#a78bfa'],
  ['CNS', 'Brain exposure and neurobiology', '#60a5fa'],
  ['Infectious Disease', 'Pathogen targets and resistance', '#14b8a6'],
  ['Hematology', 'Oxygen transport and blood chemistry', '#f472b6'],
];

const industryPhases = [
  ['1', 'Discovery Intelligence', 'Targets, disease biology, evidence, assays, and live datasets', 'done'],
  ['2', 'Molecule Explorer', 'Lead compounds, analogs, properties, and SAR/QSAR', 'done'],
  ['3', 'Tablet Formula Explorer', 'API, excipients, dosage forms, and formula logic', 'done'],
  ['4', 'Pharma QC Lab', 'HPLC, dissolution, assay, stability, and release checks', 'done'],
  ['5', 'Pipeline Simulator', 'Decision gates, candidate comparison, and readiness scoring', 'done'],
  ['6', 'Dossier Explorer', 'CMC, clinical chemistry, regulatory evidence, and data provenance', 'done'],
  ['7', 'RWE and Pharmacovigilance', 'label monitoring, safety signals, real-world evidence, and lifecycle actions', 'done'],
  ['8', 'Manufacturing Scale-Up', 'process robustness, tech transfer, PAT, packaging, and supply continuity', 'done'],
  ['9', 'Market Access and Lifecycle', 'launch readiness, access strategy, distribution, field signals, and lifecycle planning', 'active'],
];

const phase2Metrics = [
  ['Hit quality', 'potency, assay confidence, novelty', '#38bdf8'],
  ['Lead-likeness', 'MW, LogP, TPSA, HBD/HBA, rotatable burden', '#22c55e'],
  ['Selectivity', 'target family, off-target chemistry, safety margin', '#a78bfa'],
  ['Developability', 'solubility, synthesis risk, salt/form potential', '#f59e0b'],
];

const analogDesignMoves = [
  ['H', 'baseline scaffold', 'reference potency and property balance'],
  ['F', 'block metabolism', 'small electron-withdrawing change'],
  ['OMe', 'tune polarity', 'HBA and lipophilicity shift'],
  ['CONH2', 'add polarity', 'TPSA and solubility improvement'],
  ['NMe2', 'basic handle', 'salt formation and permeability tradeoff'],
];

const evidenceRows = [
  ['Disease linkage', 88, 'Genetic, clinical, pathway, and literature support'],
  ['Assay readiness', 74, 'Biochemical and cellular assays available for screening'],
  ['Structure readiness', 82, 'AlphaFold and PDB coverage for pocket inspection'],
  ['Chemistry tractability', 70, 'Ligandable site, analog history, and property space'],
  ['Clinical translation', 66, 'Biomarker availability and patient-stratification logic'],
];

const discoveryStages = [
  ['Target ID', Target, 'Choose a disease-linked protein, pathway, biomarker, or pathogen target.'],
  ['Structure', Dna, 'Pull AlphaFold and PDB links, then inspect confidence, domains, pockets, and ligands.'],
  ['Screening', Search, 'Run hit-finding logic: HTS, fragment hits, natural products, literature, or focused libraries.'],
  ['Hit Triage', BadgeCheck, 'Filter potency, selectivity, assay quality, PAINS-like risk, and novelty.'],
  ['SAR/QSAR', GitCompare, 'Compare substituent changes, lipophilicity, HBD/HBA, TPSA, and potency trend.'],
  ['Docking', Orbit, 'Map ligand fit to pocket, H-bonds, salt bridges, sterics, and chiral fit.'],
  ['ADME/Tox', ShieldAlert, 'Balance solubility, permeability, clearance, CYP risk, hERG, and toxicity signals.'],
  ['Synthesis', Beaker, 'Plan intermediates, route risk, protecting groups, yield, scale, and green chemistry.'],
  ['Analysis', TestTube2, 'Validate identity, purity, assay, HPLC/LC-MS, dissolution, stability, and impurities.'],
  ['Clinical/Reg', BookOpen, 'Connect biomarkers, clinical chemistry panels, pharmacopoeia, and documentation.'],
];

const sarSeries = [
  ['Lead A', 'H', 2.1, 61, 1.8, 4.2],
  ['4-F analog', 'F', 2.8, 61, 2.4, 5.8],
  ['4-OMe analog', 'OMe', 3.0, 70, 2.0, 6.4],
  ['amide analog', 'CONH2', 1.7, 92, 3.1, 5.1],
  ['basic amine', 'NMe2', 2.5, 48, 1.1, 6.9],
];

const ligandProfiles = {
  gefitinib: { className: 'EGFR TKI', role: 'first-generation lead', potency: 86, selectivity: 68, solubility: 45, risk: 'CYP and resistance mutation exposure' },
  erlotinib: { className: 'EGFR TKI', role: 'clinical comparator', potency: 82, selectivity: 62, solubility: 42, risk: 'rash, diarrhea, resistance' },
  osimertinib: { className: 'EGFR TKI', role: 'resistance-aware analog', potency: 94, selectivity: 78, solubility: 56, risk: 'QT and CNS exposure balance' },
  atorvastatin: { className: 'statin', role: 'high-potency lipid lead', potency: 88, selectivity: 74, solubility: 52, risk: 'hepatic uptake and muscle signal' },
  simvastatin: { className: 'statin lactone', role: 'prodrug comparator', potency: 76, selectivity: 66, solubility: 38, risk: 'CYP3A4 interaction' },
  rosuvastatin: { className: 'hydrophilic statin', role: 'polar analog', potency: 90, selectivity: 82, solubility: 72, risk: 'transporter and renal handling' },
  captopril: { className: 'ACE inhibitor', role: 'thiol lead', potency: 80, selectivity: 62, solubility: 78, risk: 'thiol taste and rash liability' },
  enalapril: { className: 'ACE inhibitor prodrug', role: 'prodrug analog', potency: 76, selectivity: 70, solubility: 66, risk: 'renal dosing' },
  lisinopril: { className: 'ACE inhibitor', role: 'polar analog', potency: 74, selectivity: 72, solubility: 84, risk: 'oral absorption tradeoff' },
  oxygen: { className: 'small ligand', role: 'physiology reference', potency: 55, selectivity: 52, solubility: 64, risk: 'binding state context' },
  'carbon monoxide': { className: 'toxic ligand', role: 'safety comparator', potency: 92, selectivity: 40, solubility: 62, risk: 'heme displacement toxicity' },
  voxelotor: { className: 'hemoglobin modulator', role: 'allosteric analog', potency: 82, selectivity: 70, solubility: 50, risk: 'oxygen affinity balance' },
  sitagliptin: { className: 'DPP-4 inhibitor', role: 'balanced clinical lead', potency: 84, selectivity: 82, solubility: 78, risk: 'renal dosing' },
  linagliptin: { className: 'DPP-4 inhibitor', role: 'nonrenal comparator', potency: 88, selectivity: 84, solubility: 48, risk: 'biliary clearance and interactions' },
  vildagliptin: { className: 'DPP-4 inhibitor', role: 'polar analog', potency: 78, selectivity: 70, solubility: 82, risk: 'hepatic monitoring' },
  celecoxib: { className: 'COX-2 inhibitor', role: 'selective anti-inflammatory', potency: 86, selectivity: 82, solubility: 34, risk: 'CV risk and low solubility' },
  rofecoxib: { className: 'COX-2 inhibitor', role: 'risk comparator', potency: 84, selectivity: 86, solubility: 32, risk: 'cardiovascular liability' },
  etoricoxib: { className: 'COX-2 inhibitor', role: 'selectivity analog', potency: 82, selectivity: 88, solubility: 40, risk: 'BP and CV signal' },
  verubecestat: { className: 'BACE1 inhibitor', role: 'CNS comparator', potency: 82, selectivity: 68, solubility: 38, risk: 'CNS safety translation' },
  lanabecestat: { className: 'BACE1 inhibitor', role: 'CNS analog', potency: 80, selectivity: 64, solubility: 42, risk: 'cognition and benefit risk' },
  elenbecestat: { className: 'BACE1 inhibitor', role: 'clinical analog', potency: 78, selectivity: 66, solubility: 44, risk: 'CNS tolerability' },
  isoniazid: { className: 'anti-TB prodrug', role: 'front-line comparator', potency: 78, selectivity: 58, solubility: 88, risk: 'activation and hepatotoxicity' },
  ethionamide: { className: 'anti-TB prodrug', role: 'resistance comparator', potency: 70, selectivity: 54, solubility: 52, risk: 'GI and hepatic toxicity' },
  triclosan: { className: 'InhA inhibitor', role: 'tool compound', potency: 64, selectivity: 42, solubility: 24, risk: 'non-druglike antiseptic profile' },
};

const propertyRules = [
  ['MW', 'MolecularWeight', value => value <= 500, '500 or less'],
  ['LogP', 'XLogP', value => value <= 5, '5 or less'],
  ['TPSA', 'TPSA', value => value <= 140, '140 or less'],
  ['HBD', 'HBondDonorCount', value => value <= 5, '5 or less'],
  ['HBA', 'HBondAcceptorCount', value => value <= 10, '10 or less'],
];

const dosageForms = [
  {
    id: 'immediate',
    name: 'Immediate-release tablet',
    purpose: 'Fast disintegration and API release for conventional oral dosing.',
    process: ['dispense', 'sieve', 'blend', 'lubricate', 'compress', 'pack'],
    controls: ['weight variation', 'disintegration', 'assay', 'dissolution'],
    risk: 'Blend uniformity and moisture sensitivity',
    release: 88,
  },
  {
    id: 'sustained',
    name: 'Sustained-release tablet',
    purpose: 'Controlled API release using matrix polymers or membrane control.',
    process: ['granulate', 'polymer blend', 'dry', 'compress', 'coat', 'release test'],
    controls: ['release profile', 'hardness', 'polymer level', 'stability'],
    risk: 'Dose dumping, alcohol effect, polymer variability',
    release: 54,
  },
  {
    id: 'enteric',
    name: 'Enteric-coated tablet',
    purpose: 'Protect acid-labile API or protect stomach from local irritation.',
    process: ['core compress', 'seal coat', 'enteric coat', 'cure', 'acid test', 'buffer release'],
    controls: ['acid resistance', 'buffer dissolution', 'coat weight', 'defects'],
    risk: 'Coating cracks and delayed release drift',
    release: 36,
  },
  {
    id: 'dispersible',
    name: 'Dispersible tablet',
    purpose: 'Rapid dispersion in water for pediatric, geriatric, or swallowing-limited use.',
    process: ['dry blend', 'superdisintegrant', 'flavor blend', 'compress', 'dispersion test', 'pack'],
    controls: ['dispersion time', 'taste', 'uniformity', 'friability'],
    risk: 'Taste masking, friability, and moisture uptake',
    release: 92,
  },
  {
    id: 'effervescent',
    name: 'Effervescent tablet',
    purpose: 'Acid-base effervescence for solution dosing and palatability.',
    process: ['low humidity blend', 'acid/base addition', 'lubricate', 'compress', 'desiccant pack', 'CO2 test'],
    controls: ['water content', 'effervescence time', 'assay', 'package integrity'],
    risk: 'Humidity-driven reaction and packaging failure',
    release: 96,
  },
];

const formulaTemplates = {
  immediate: [
    ['API', 'active ingredient', 42, '#38bdf8'],
    ['Microcrystalline cellulose', 'diluent / compressibility', 28, '#22c55e'],
    ['Lactose monohydrate', 'diluent', 16, '#a78bfa'],
    ['Povidone K30', 'binder', 5, '#f59e0b'],
    ['Croscarmellose sodium', 'disintegrant', 5, '#fb7185'],
    ['Magnesium stearate', 'lubricant', 1.5, '#94a3b8'],
    ['Colloidal silica', 'glidant', 0.5, '#14b8a6'],
  ],
  sustained: [
    ['API', 'active ingredient', 35, '#38bdf8'],
    ['HPMC K100M', 'matrix polymer', 30, '#22c55e'],
    ['MCC', 'diluent', 18, '#a78bfa'],
    ['Povidone', 'binder', 5, '#f59e0b'],
    ['Ethylcellulose', 'release modifier', 8, '#fb7185'],
    ['Magnesium stearate', 'lubricant', 1.5, '#94a3b8'],
    ['Talc', 'anti-adherent', 2.5, '#14b8a6'],
  ],
  enteric: [
    ['API core', 'active ingredient', 38, '#38bdf8'],
    ['MCC / lactose', 'core diluent', 27, '#22c55e'],
    ['Povidone', 'binder', 5, '#f59e0b'],
    ['Crospovidone', 'core disintegrant', 4, '#fb7185'],
    ['HPMC seal coat', 'moisture barrier', 6, '#a78bfa'],
    ['Methacrylic acid copolymer', 'enteric polymer', 16, '#14b8a6'],
    ['Triethyl citrate', 'plasticizer', 4, '#94a3b8'],
  ],
  dispersible: [
    ['API', 'active ingredient', 32, '#38bdf8'],
    ['Mannitol', 'mouthfeel diluent', 28, '#22c55e'],
    ['MCC', 'compressibility', 15, '#a78bfa'],
    ['Crospovidone', 'superdisintegrant', 10, '#fb7185'],
    ['Aspartame / flavor', 'taste masking', 5, '#f59e0b'],
    ['Sodium starch glycolate', 'wicking aid', 7, '#14b8a6'],
    ['Magnesium stearate', 'lubricant', 1.5, '#94a3b8'],
  ],
  effervescent: [
    ['API', 'active ingredient', 18, '#38bdf8'],
    ['Citric acid', 'acid source', 24, '#fb7185'],
    ['Sodium bicarbonate', 'base / CO2 source', 32, '#22c55e'],
    ['Sorbitol / mannitol', 'diluent', 14, '#a78bfa'],
    ['PEG 6000', 'lubricant', 4, '#f59e0b'],
    ['Flavor / sweetener', 'palatability', 4, '#14b8a6'],
    ['Desiccant packaging allowance', 'moisture control', 4, '#94a3b8'],
  ],
};

const qcTests = [
  ['Assay', 'API content by HPLC', 98.7, [95, 105], '#22c55e'],
  ['Content uniformity', 'unit dose variation', 96.4, [85, 115], '#38bdf8'],
  ['Dissolution', 'release at specification time', 82.5, [75, 100], '#a78bfa'],
  ['Disintegration', 'time-based dosage-form break-up', 91.2, [80, 100], '#14b8a6'],
  ['Hardness', 'mechanical strength window', 68.0, [55, 85], '#f59e0b'],
  ['Friability', 'mass loss after tumbling', 0.42, [0, 1], '#22c55e'],
  ['Related substances', 'total impurity profile', 0.68, [0, 1.5], '#fb7185'],
  ['Water content', 'moisture by KF or LOD', 2.1, [0, 3], '#60a5fa'],
];

const dissolutionProfiles = {
  immediate: [18, 48, 72, 88, 94, 98],
  sustained: [8, 18, 32, 48, 66, 82],
  enteric: [2, 4, 8, 42, 76, 92],
  dispersible: [42, 78, 92, 97, 99, 100],
  effervescent: [55, 88, 96, 99, 100, 100],
};

const stabilityConditions = [
  ['25C / 60% RH', 'long-term', 96, '#22c55e'],
  ['30C / 65% RH', 'intermediate', 90, '#38bdf8'],
  ['40C / 75% RH', 'accelerated', 78, '#f59e0b'],
  ['photostability', 'ICH light stress', 84, '#a78bfa'],
  ['acid/base stress', 'forced degradation', 64, '#fb7185'],
];

const gateDefinitions = [
  ['Target validation', 'biology, pathway, biomarker and structure confidence', '#38bdf8'],
  ['Hit-to-lead', 'potency, selectivity, SAR clarity and liability triage', '#a78bfa'],
  ['Preclinical readiness', 'ADME, safety margin, synthetic access and stability', '#22c55e'],
  ['Formulation readiness', 'dosage form, excipient fit, release control and manufacturability', '#f59e0b'],
  ['CMC / clinical package', 'QC release, stability, documentation and clinical chemistry monitoring', '#fb7185'],
];

const comparatorCandidates = [
  { id: 'balanced', name: 'Balanced oral candidate', potency: 82, safety: 74, formulation: 78, qc: 86, cost: 68, timeline: 72 },
  { id: 'potent', name: 'High-potency analog', potency: 94, safety: 58, formulation: 62, qc: 76, cost: 54, timeline: 64 },
  { id: 'manufacturable', name: 'Manufacturing-friendly analog', potency: 72, safety: 78, formulation: 90, qc: 92, cost: 84, timeline: 82 },
  { id: 'controlled', name: 'Controlled-release program', potency: 78, safety: 70, formulation: 68, qc: 74, cost: 48, timeline: 56 },
];

const milestonePlan = [
  ['T0', 'Target package', 'biology, disease link, assay and structure evidence', 'target'],
  ['M3', 'Hit triage', 'potency, selectivity, PAINS and novelty decision', 'lead'],
  ['M6', 'Lead optimization', 'SAR, ADME, safety margin and synthetic route', 'preclinical'],
  ['M9', 'Prototype formula', 'dosage form, excipients, release and manufacturability', 'formulation'],
  ['M12', 'CMC gate', 'QC release, stability, specs and batch documentation', 'cmc'],
];

const pipelineRiskRegister = [
  ['Biology risk', 'weak translation or biomarker uncertainty', 'target', '#38bdf8'],
  ['Chemistry risk', 'potency/selectivity or property liability', 'lead', '#a78bfa'],
  ['Safety risk', 'ADME, hERG, CYP, organ toxicity signal', 'preclinical', '#22c55e'],
  ['Formulation risk', 'release drift, excipient incompatibility, scale-up', 'formulation', '#f59e0b'],
  ['CMC risk', 'impurity, stability, assay, dissolution or documentation', 'cmc', '#fb7185'],
];

const dossierModules = [
  ['Module 1', 'Administrative', 'application form, labeling, regional forms', 78, '#38bdf8'],
  ['Module 2', 'Quality summaries', 'QOS, nonclinical overview, clinical overview', 84, '#22c55e'],
  ['Module 3', 'CMC quality', 'drug substance, drug product, controls, stability', 88, '#f59e0b'],
  ['Module 4', 'Nonclinical', 'pharmacology, toxicology, ADME package', 70, '#a78bfa'],
  ['Module 5', 'Clinical', 'protocols, efficacy, safety, clinical chemistry', 64, '#fb7185'],
];

const regulatoryLinks = [
  ['ICH Q8', 'pharmaceutical development', 'https://database.ich.org/sites/default/files/Q8%28R2%29%20Guideline.pdf'],
  ['ICH Q9', 'quality risk management', 'https://database.ich.org/sites/default/files/ICH_Q9%28R1%29_Guideline_Step4_2023_0126.pdf'],
  ['ICH Q10', 'pharmaceutical quality system', 'https://database.ich.org/sites/default/files/Q10%20Guideline.pdf'],
  ['ICH M4', 'common technical document', 'https://database.ich.org/sites/default/files/M4_R4__Guideline.pdf'],
  ['FDA Orange Book', 'approved drug products', 'https://www.accessdata.fda.gov/scripts/cder/ob/'],
  ['DailyMed', 'drug labeling', 'https://dailymed.nlm.nih.gov/dailymed/'],
];

const dossierRiskRegister = [
  ['Scientific', 'target translation or biomarker mismatch', 62, '#38bdf8'],
  ['Safety', 'off-target, hERG, hepatic, renal, or CNS signal', 58, '#fb7185'],
  ['CMC', 'impurity, polymorph, stability, or dissolution drift', 72, '#f59e0b'],
  ['Manufacturing', 'scale-up, blend uniformity, coating, or moisture risk', 68, '#a78bfa'],
  ['Regulatory', 'missing validation, documentation, or comparability package', 54, '#22c55e'],
];

const rweDataStreams = [
  ['EHR / labs', 'ALT, AST, creatinine, HbA1c, lipids, CBC, electrolytes', 82, '#38bdf8'],
  ['Claims', 'persistence, switching, hospitalization, comedication', 74, '#22c55e'],
  ['Registries', 'disease severity, outcomes, longitudinal safety', 69, '#a78bfa'],
  ['Spontaneous reports', 'serious adverse events and disproportionality signals', 58, '#fb7185'],
  ['Wearables / PRO', 'adherence, symptoms, activity, patient-reported outcomes', 64, '#f59e0b'],
];

const pharmacovigilanceSignals = [
  ['Hepatic', 'ALT/AST/bilirubin rise', 38, '#f59e0b'],
  ['Renal', 'eGFR decline, creatinine, potassium', 31, '#38bdf8'],
  ['Cardiac', 'QT, BP, MACE, troponin', 44, '#fb7185'],
  ['Hematology', 'CBC, hemolysis, coagulation', 28, '#a78bfa'],
  ['GI tolerance', 'nausea, diarrhea, discontinuation', 52, '#22c55e'],
  ['Medication errors', 'dose, interaction, duplication, adherence', 35, '#14b8a6'],
];

const lifecycleActions = [
  ['Label update', 'new warning, interaction, dose adjustment, monitoring language'],
  ['Risk minimization', 'prescriber guide, restricted use, pregnancy or renal caution'],
  ['Post-approval study', 'registry, pragmatic trial, comparative effectiveness'],
  ['Manufacturing change', 'scale, site, formulation, stability comparability'],
  ['Indication expansion', 'new population, combination, pediatric or geriatric use'],
];

const endpointLibrary = [
  ['Oncology', 'ORR / PFS / ctDNA / RECIST', 'tumor response and molecular resistance'],
  ['Cardiovascular', 'LDL-C / BP / MACE / renal markers', 'risk reduction and organ safety'],
  ['Metabolic', 'HbA1c / fasting glucose / weight / eGFR', 'glycemic efficacy and renal dosing'],
  ['Inflammation', 'pain score / CRP / rescue-med use', 'symptom control and inflammatory chemistry'],
  ['CNS', 'cognitive scale / CSF biomarker / function', 'brain exposure and clinical translation'],
  ['Infectious Disease', 'MIC / culture conversion / relapse', 'microbial clearance and resistance'],
  ['Hematology', 'Hb / SpO2 / hemolysis markers', 'oxygen delivery and blood chemistry'],
];

const postMarketSignals = [
  ['GI intolerance', 'nausea, diarrhea, dyspepsia', 34, '#f59e0b'],
  ['Hepatic signal', 'ALT, AST, bilirubin drift', 28, '#fb7185'],
  ['Renal signal', 'creatinine, eGFR, electrolytes', 22, '#38bdf8'],
  ['Cardiac signal', 'QT, BP, lipids, troponin', 31, '#a78bfa'],
  ['Hypersensitivity', 'rash, edema, immune reaction', 18, '#f472b6'],
  ['CNS signal', 'sleep, cognition, dizziness', 24, '#60a5fa'],
  ['Efficacy loss', 'biomarker escape or resistance', 42, '#14b8a6'],
  ['Product quality', 'complaints, dissolution, stability', 16, '#22c55e'],
];

const realWorldEvidenceSources = [
  ['EHR labs', 'ALT, AST, creatinine, HbA1c, lipids, CBC', 82, '#38bdf8'],
  ['Claims data', 'adherence, hospitalization, comedication, cost', 74, '#22c55e'],
  ['Registries', 'subgroup outcomes and disease progression', 68, '#a78bfa'],
  ['Spontaneous reports', 'rare adverse event signal detection', 56, '#fb7185'],
  ['Patient reported outcomes', 'tolerability, symptoms, quality of life', 64, '#f59e0b'],
  ['Batch complaints', 'field quality and product performance', 72, '#14b8a6'],
];

const postMarketLifecycleActions = [
  ['Label refinement', 'update warnings, monitoring, dosing, or contraindication language', 'label'],
  ['Risk minimization', 'education, medication guide, monitoring plan, restricted use', 'safety'],
  ['Formulation improvement', 'stability, release profile, strength, packaging, excipient adjustment', 'quality'],
  ['Indication expansion', 'new population, biomarker subgroup, combination, or line of therapy', 'efficacy'],
  ['Comparative effectiveness', 'real-world benefit-risk versus standard of care', 'rwe'],
];

const scaleUpBatches = [
  ['Lab batch', '1 kg', 'proof of process', 82, '#38bdf8'],
  ['Engineering batch', '10 kg', 'equipment fit and IPC ranges', 76, '#a78bfa'],
  ['Pilot batch', '50 kg', 'blend, compression, coating, dissolution trend', 71, '#f59e0b'],
  ['Exhibit batch', '150 kg', 'registration stability and validation evidence', 86, '#22c55e'],
  ['Commercial batch', '500 kg', 'routine control strategy and release cadence', 79, '#14b8a6'],
];

const processParameters = [
  ['Blend time', 'content uniformity risk', 78, '#38bdf8'],
  ['Granulation endpoint', 'particle size and moisture', 66, '#f59e0b'],
  ['Drying LOD', 'stability and compression behavior', 72, '#60a5fa'],
  ['Compression force', 'hardness, friability, dissolution', 84, '#22c55e'],
  ['Coating weight gain', 'release, moisture, appearance', 62, '#a78bfa'],
  ['Packaging RH control', 'shelf life and field quality', 70, '#fb7185'],
];

const techTransferChecklist = [
  ['Master batch record', 'materials, process steps, IPCs, deviations', 88, '#22c55e'],
  ['Analytical transfer', 'method equivalence, system suitability, robustness', 76, '#38bdf8'],
  ['Equipment mapping', 'scale, shear, heat, compression dwell time', 68, '#f59e0b'],
  ['Cleaning validation', 'residue limits and swab/rinse strategy', 82, '#a78bfa'],
  ['Supplier qualification', 'API, excipient, packaging, change controls', 73, '#14b8a6'],
  ['Continued process verification', 'trend review, CPP/CQA monitoring', 64, '#fb7185'],
];

const supplyContinuityRisks = [
  ['API source', 'dual sourcing, impurity profile, route dependency', 74, '#38bdf8'],
  ['Critical excipient', 'grade equivalence, compendial status, vendor change', 66, '#a78bfa'],
  ['Packaging', 'moisture barrier, desiccant, child resistance, serialization', 72, '#22c55e'],
  ['Cold / humidity chain', 'warehouse RH, transport excursions, field complaints', 58, '#f59e0b'],
  ['Demand surge', 'capacity buffer, campaign planning, inventory policy', 61, '#fb7185'],
];

const marketAccessStrategies = {
  Oncology: ['Precision oncology launch', 'companion diagnostics, mutation testing, specialist pathway', 82, '#fb7185'],
  Cardiovascular: ['Population risk launch', 'payer outcomes, adherence, lipid/BP monitoring, broad access', 86, '#22c55e'],
  Metabolic: ['Chronic care launch', 'primary care workflow, renal dosing, persistence, HbA1c evidence', 80, '#f59e0b'],
  Inflammation: ['Step-therapy launch', 'GI/CV risk positioning, rescue medication, formulary tiering', 74, '#a78bfa'],
  CNS: ['Specialist evidence launch', 'cognition endpoints, caregiver outcomes, safety monitoring', 62, '#60a5fa'],
  'Infectious Disease': ['Stewardship launch', 'susceptibility testing, resistance surveillance, access control', 76, '#14b8a6'],
  Hematology: ['Rare-care launch', 'registry follow-up, hemolysis markers, specialty distribution', 78, '#f472b6'],
};

const launchReadinessDomains = [
  ['Value evidence', 'clinical benefit, comparator, budget impact, subgroup story', 'target', '#38bdf8'],
  ['Access operations', 'payer dossier, formulary, reimbursement, patient support', 'formulation', '#22c55e'],
  ['Medical launch', 'KOL education, field medical, evidence response package', 'preclinical', '#a78bfa'],
  ['Supply launch', 'inventory, serialization, release cadence, shortage prevention', 'cmc', '#f59e0b'],
  ['Lifecycle evidence', 'RWE plan, indication expansion, safety commitments', 'lead', '#fb7185'],
];

const accessEvidencePack = [
  ['Comparator value', 'active comparator, indirect treatment comparison, standard-of-care map', 78, '#38bdf8'],
  ['Budget impact', 'eligible population, persistence, monitoring burden, offsets', 72, '#22c55e'],
  ['Patient support', 'adherence, affordability, education, lab follow-up reminders', 84, '#f59e0b'],
  ['Medical information', 'label questions, drug interaction scripts, evidence response', 76, '#a78bfa'],
  ['Field quality', 'complaints, cold/humidity excursions, batch traceability', 68, '#fb7185'],
];

const launchChannelPlan = [
  ['Specialty pharmacy', 'prior authorization, adherence, cold-chain or high-touch support', 74, '#38bdf8'],
  ['Hospital formulary', 'P&T dossier, inpatient protocols, pharmacy education', 69, '#a78bfa'],
  ['Retail distribution', 'inventory depth, substitution rules, counseling, refill continuity', 82, '#22c55e'],
  ['Diagnostic network', 'biomarker testing, lab turnaround, result interpretation', 66, '#f59e0b'],
  ['Patient registry', 'outcomes, safety, persistence, subgroup follow-up', 78, '#14b8a6'],
];

const lifecycleExpansionOptions = [
  ['New indication', 'same target biology in adjacent disease or line of therapy', 72, '#38bdf8'],
  ['Combination regimen', 'mechanism pairing, interaction review, dose adjustment', 64, '#a78bfa'],
  ['Pediatric / geriatric', 'age-appropriate strength, palatability, renal/hepatic monitoring', 58, '#f59e0b'],
  ['New strength', 'dose optimization, adherence, pack size, label clarity', 84, '#22c55e'],
  ['Formulation switch', 'modified release, dispersible option, stability or taste improvement', 76, '#fb7185'],
];

const analyticalPanels = [
  ['HPLC assay', 'API peak area', 92, '#22c55e'],
  ['LC-MS identity', 'm/z match', 84, '#38bdf8'],
  ['Impurity limit', 'related substances', 31, '#f59e0b'],
  ['Dissolution', 'release at 30 min', 76, '#a78bfa'],
  ['Stability', 'degradation stress', 44, '#fb7185'],
];

const biophysicalMethods = [
  ['ITC', 'binding energetics', 'Kd, stoichiometry, enthalpy/entropy'],
  ['DSC/TGA', 'thermal stability', 'melting/degradation profile'],
  ['CD/ORD', 'secondary structure', 'protein/nucleic-acid conformational change'],
  ['Fluorescence', 'binding or environment', 'quenching, FRET, ligand interaction'],
  ['UV-vis', 'chromophore and binding', 'Job plot, complex formation, heme state'],
];

const clinicalPanels = [
  ['LFT', 'ALT/AST/bilirubin/albumin', 'hepatic metabolism and toxicity'],
  ['KFT', 'urea/creatinine/eGFR/electrolytes', 'renal clearance and dose adjustment'],
  ['ABG', 'pH/CO2/HCO3-/O2', 'respiratory and metabolic acid-base state'],
  ['Thyroid', 'TSH/T3/T4', 'iodine and endocrine chemistry'],
  ['Cardiac', 'troponin/CK-MB/lipids', 'risk, injury, and lipid chemistry'],
];

const databaseLinks = [
  ['AlphaFold DB', 'Predicted protein structures and confidence', 'https://alphafold.ebi.ac.uk/'],
  ['ChEMBL', 'Bioactivity, targets, mechanisms, molecules', 'https://www.ebi.ac.uk/chembl/'],
  ['PubChem', 'Compound properties, PNG/SDF, assay records', 'https://pubchem.ncbi.nlm.nih.gov/'],
  ['RCSB PDB', 'Experimental protein structures and bound ligands', 'https://www.rcsb.org/'],
  ['UniProt', 'Protein sequence, function, isoforms, disease links', 'https://www.uniprot.org/'],
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const Panel = ({ title, icon: Icon = Boxes, children, className = '' }) => (
  <section className={`rounded-2xl border border-white/10 bg-white/[0.035] p-4 ${className}`}>
    <div className="mb-3 flex items-center gap-2">
      <Icon size={16} className="text-cyan-300" />
      <h3 className="text-sm font-black text-white">{title}</h3>
    </div>
    {children}
  </section>
);

const PillBadge = ({ children, color = '#38bdf8' }) => (
  <span className="inline-flex items-center rounded-full border bg-black/20 px-2 py-0.5 text-[10px] font-bold" style={{ color, borderColor: `${color}66` }}>
    {children}
  </span>
);

const fetchJson = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
};

const alphaFoldUrl = (uniprot) => `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(uniprot)}`;
const chemblTargetUrl = (target) => `https://www.ebi.ac.uk/chembl/api/data/target/${encodeURIComponent(target)}.json`;
const chemblActivityUrl = (target) => `https://www.ebi.ac.uk/chembl/api/data/activity.json?target_chembl_id=${encodeURIComponent(target)}&limit=20`;
const pubChemUrl = (name) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/property/MolecularFormula,MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,CanonicalSMILES/JSON`;
const pubChemPngUrl = (name) => `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name)}/PNG?image_size=large`;
const rcsbEntryUrl = (pdb) => `https://data.rcsb.org/rest/v1/core/entry/${encodeURIComponent(pdb)}`;

const MiniBar = ({ label, value, color = '#22c55e' }) => (
  <div>
    <div className="mb-1 flex justify-between text-[10px] text-gray-500">
      <span>{label}</span>
      <span>{Math.round(value)}%</span>
    </div>
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div className="h-full rounded-full" style={{ width: `${clamp(value, 0, 100)}%`, background: color }} />
    </div>
  </div>
);

const PhaseRoadmap = () => (
  <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
    {industryPhases.map(([number, title, detail, state]) => (
      <div
        key={title}
        className={`rounded-2xl border p-3 ${
          state === 'active'
            ? 'border-cyan-400/35 bg-cyan-400/10'
            : state === 'done'
              ? 'border-emerald-400/25 bg-emerald-400/10'
            : 'border-white/10 bg-white/[0.035]'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black ${
            state === 'active' ? 'bg-cyan-300 text-slate-950' : state === 'done' ? 'bg-emerald-300 text-slate-950' : 'bg-white/10 text-gray-300'
          }`}>
            {number}
          </span>
          <p className="text-sm font-black text-white">{title}</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-gray-500">{detail}</p>
      </div>
    ))}
  </div>
);

const DiseaseAreaStrip = ({ selectedArea, onSelectArea }) => (
  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
    {diseaseAreas.map(([name, detail, color]) => {
      const active = selectedArea === name;
      return (
        <button
          key={name}
          onClick={() => onSelectArea(name)}
          className={`rounded-2xl border p-3 text-left transition-colors ${
            active ? 'bg-white/[0.08]' : 'bg-white/[0.03] hover:bg-white/[0.055]'
          }`}
          style={{ borderColor: active ? `${color}88` : 'rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-black text-white">{name}</p>
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          </div>
          <p className="mt-1 text-xs text-gray-500">{detail}</p>
        </button>
      );
    })}
  </div>
);

const TargetIntelligenceCard = ({ target, active, onSelect }) => (
  <button
    onClick={onSelect}
    className={`w-full rounded-2xl border p-3 text-left transition-colors ${
      active ? 'border-cyan-500/45 bg-cyan-500/15' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'
    }`}
  >
    <div className="flex items-start justify-between gap-3">
      <span>
        <span className="block text-sm font-black text-white">{target.name}</span>
        <span className="mt-1 block text-xs text-gray-500">{target.disease}</span>
      </span>
      <PillBadge color={active ? '#67e8f9' : '#94a3b8'}>{target.area}</PillBadge>
    </div>
    <div className="mt-3 space-y-2">
      <MiniBar label="evidence" value={target.evidence} color="#38bdf8" />
      <MiniBar label="developability" value={target.developability} color="#22c55e" />
    </div>
    <div className="mt-3 flex flex-wrap gap-1">
      <PillBadge>{target.uniprot}</PillBadge>
      <PillBadge color="#a78bfa">{target.chemblTarget}</PillBadge>
      <PillBadge color="#f59e0b">{target.pdb}</PillBadge>
    </div>
  </button>
);

const EvidenceMatrix = ({ target }) => (
  <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Target Evidence</p>
      <h3 className="mt-1 text-xl font-black text-white">{target.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{target.biology}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {[
          ['Disease area', target.area],
          ['Modality', target.modality],
          ['Clinical need', target.clinicalNeed],
          ['Decision gate', target.stageGate],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-gray-100">{value}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Readiness Matrix</p>
      <div className="mt-4 space-y-3">
        {evidenceRows.map(([label, base, detail], index) => {
          const adjusted = clamp((base + target.evidence + target.developability) / 3 - index * 2, 0, 100);
          return (
            <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <MiniBar label={label} value={adjusted} color={['#38bdf8', '#22c55e', '#a78bfa', '#f59e0b', '#fb7185'][index]} />
              <p className="mt-2 text-[11px] text-gray-500">{detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const PathwayAssayMap = ({ target }) => (
  <svg viewBox="0 0 980 360" className="h-[28rem] w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <rect x="24" y="24" width="932" height="312" rx="28" fill="#020617" stroke="#1e293b" />
    <text x="48" y="60" fill="#e2e8f0" fontSize="18" fontWeight="900">Disease to Target Intelligence Map</text>
    <text x="48" y="82" fill="#94a3b8" fontSize="12">{target.area} | {target.pathway}</text>
    {[
      ['Disease biology', target.disease, 94, 170, '#fb7185'],
      ['Protein target', target.name, 294, 170, '#38bdf8'],
      ['Assay model', target.assay, 512, 170, '#22c55e'],
      ['Lead context', target.ligands.join(', '), 742, 170, '#f59e0b'],
    ].map(([label, value, x, y, color], index) => (
      <g key={label}>
        {index > 0 && <path d={`M${x - 88} ${y} C${x - 54} ${y - 54}, ${x - 34} ${y - 54}, ${x - 4} ${y}`} fill="none" stroke="#334155" strokeWidth="4" />}
        <rect x={x - 70} y={y - 58} width="150" height="116" rx="20" fill={`${color}1f`} stroke={color} strokeWidth="3" />
        <text x={x - 50} y={y - 20} fill={color} fontSize="12" fontWeight="900">{label}</text>
        <foreignObject x={x - 54} y={y - 8} width="112" height="52">
          <div className="flex h-full items-center justify-center text-center text-[11px] font-semibold leading-tight text-slate-100">{value}</div>
        </foreignObject>
      </g>
    ))}
    <g>
      <text x="72" y="300" fill="#cbd5e1" fontSize="13" fontWeight="800">Biomarkers</text>
      {target.biomarkers.map((marker, index) => (
        <g key={marker}>
          <rect x={160 + index * 118} y="282" width="96" height="30" rx="15" fill="#111827" stroke="#475569" />
          <text x={176 + index * 118} y="302" fill="#e2e8f0" fontSize="11" fontWeight="700">{marker}</text>
        </g>
      ))}
    </g>
  </svg>
);

const PipelineSvg = ({ stage }) => (
  <svg viewBox="0 0 900 250" className="h-72 w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <defs>
      <linearGradient id="pipelineDrugGradient" x1="0" x2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="55%" stopColor="#22c55e" />
        <stop offset="100%" stopColor="#fb7185" />
      </linearGradient>
    </defs>
    <rect x="24" y="24" width="852" height="202" rx="24" fill="#020617" stroke="#1e293b" />
    <line x1="78" y1="126" x2="820" y2="126" stroke="#243244" strokeWidth="8" strokeLinecap="round" />
    <line x1="78" y1="126" x2={78 + stage * 82} y2="126" stroke="url(#pipelineDrugGradient)" strokeWidth="8" strokeLinecap="round" />
    {discoveryStages.map(([label, Icon], index) => {
      const active = index === stage;
      const done = index < stage;
      const x = 78 + index * 82;
      return (
        <g key={label}>
          <circle cx={x} cy="126" r={active ? 25 : 18} fill={active ? '#22c55e' : done ? '#0e7490' : '#1e293b'} stroke={active ? '#bbf7d0' : '#64748b'} strokeWidth="3" />
          <text x={x - 27} y={index % 2 ? 178 : 76} fill={active ? '#e2e8f0' : '#94a3b8'} fontSize="12" fontWeight={active ? '800' : '600'}>{label}</text>
          <foreignObject x={x - 9} y="117" width="18" height="18">
            <Icon size={18} className="text-white" />
          </foreignObject>
        </g>
      );
    })}
  </svg>
);

const StructureScene = ({ target, alphaFoldData, pdbData }) => {
  const alpha = Array.isArray(alphaFoldData) ? alphaFoldData[0] : null;
  const confidence = alpha?.globalMetricValue || alpha?.confidenceScore || 82;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
      <svg viewBox="0 0 520 300" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
        <rect x="18" y="18" width="484" height="264" rx="22" fill="#020617" stroke="#1e293b" />
        <text x="34" y="48" fill="#e2e8f0" fontSize="16" fontWeight="900">{target.name}</text>
        <text x="34" y="68" fill="#94a3b8" fontSize="11">{target.uniprot} | {target.pdb} | {target.pathway}</text>
        <path d="M76 166 C116 70, 190 240, 238 132 S358 68, 430 170" fill="none" stroke="#22d3ee" strokeWidth="10" strokeLinecap="round" />
        <path d="M88 186 C148 108, 198 226, 286 112 S378 88, 442 188" fill="none" stroke="#a78bfa" strokeWidth="6" strokeLinecap="round" opacity="0.75" />
        {Array.from({ length: 11 }, (_, i) => (
          <circle key={i} cx={76 + i * 39} cy={158 + Math.sin(i * 1.4) * 54} r={i % 3 === 0 ? 11 : 7} fill={i % 2 ? '#22c55e' : '#f59e0b'} stroke="#e2e8f0" strokeWidth="2" />
        ))}
        <ellipse cx="332" cy="154" rx="58" ry="36" fill="#fb718522" stroke="#fb7185" strokeWidth="3" strokeDasharray="8 7" />
        <text x="304" y="158" fill="#fecdd3" fontSize="12" fontWeight="800">pocket</text>
        <rect x="64" y="230" width="360" height="16" rx="8" fill="#1e293b" />
        <rect x="64" y="230" width={3.6 * clamp(confidence, 0, 100)} height="16" rx="8" fill="url(#pipelineDrugGradient)" />
        <text x="64" y="265" fill="#94a3b8" fontSize="12">AlphaFold confidence / structure confidence proxy: {Math.round(confidence)}%</text>
      </svg>
      <div className="space-y-3">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-bold text-cyan-200">AlphaFold DB</p>
          <p className="mt-1 text-sm text-gray-300">{alpha?.uniprotDescription || 'Predicted structure links load from AlphaFold DB when online.'}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a className="btn-secondary text-xs" href={`https://alphafold.ebi.ac.uk/entry/${target.uniprot}`} target="_blank" rel="noreferrer">Open AlphaFold <ExternalLink size={12} /></a>
            {alpha?.pdbUrl && <a className="btn-secondary text-xs" href={alpha.pdbUrl} target="_blank" rel="noreferrer">PDB file <Download size={12} /></a>}
            {alpha?.cifUrl && <a className="btn-secondary text-xs" href={alpha.cifUrl} target="_blank" rel="noreferrer">mmCIF <Download size={12} /></a>}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-bold text-violet-200">RCSB PDB</p>
          <p className="mt-1 text-sm text-gray-300">{pdbData?.struct?.title || `Experimental structure reference: ${target.pdb}`}</p>
          <a className="btn-secondary mt-2 text-xs" href={`https://www.rcsb.org/structure/${target.pdb}`} target="_blank" rel="noreferrer">Open RCSB <ExternalLink size={12} /></a>
        </div>
      </div>
    </div>
  );
};

const SarChart = ({ ligand }) => (
  <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
    <svg viewBox="0 0 620 310" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="22" y="22" width="576" height="266" rx="22" fill="#020617" stroke="#1e293b" />
      <text x="42" y="52" fill="#e2e8f0" fontSize="16" fontWeight="900">SAR/QSAR lead optimization</text>
      <line x1="72" y1="245" x2="550" y2="245" stroke="#64748b" />
      <line x1="72" y1="245" x2="72" y2="76" stroke="#64748b" />
      {sarSeries.map(([name, substituent, logp, tpsa, ro5, potency], index) => {
        const x = 98 + index * 102;
        const y = 245 - potency * 22;
        return (
          <g key={name}>
            <line x1={x} y1="245" x2={x} y2={y} stroke="#334155" strokeWidth="8" strokeLinecap="round" />
            <circle cx={x} cy={y} r="18" fill={index === 4 ? '#22c55e' : '#0e7490'} stroke="#bae6fd" strokeWidth="3" />
            <text x={x - 8} y={y + 5} fill="#020617" fontSize="12" fontWeight="900">{substituent.slice(0, 2)}</text>
            <text x={x - 32} y="268" fill="#cbd5e1" fontSize="11">{name}</text>
          </g>
        );
      })}
      <path d="M98 153 L200 117 L302 104 L404 132 L506 93" fill="none" stroke="#22c55e" strokeWidth="4" />
      <text x="78" y="72" fill="#94a3b8" fontSize="12">potency score</text>
      <text x="360" y="286" fill="#94a3b8" fontSize="12">substituent changes</text>
    </svg>
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-bold text-cyan-200">Live compound lookup</p>
      <p className="mt-1 text-sm text-gray-300">Selected ligand: <span className="font-bold text-white">{ligand}</span></p>
      <img src={pubChemPngUrl(ligand)} alt={`${ligand} structure from PubChem`} className="mx-auto mt-3 h-40 rounded-xl border border-white/10 bg-white p-2" />
      <p className="mt-3 text-xs text-gray-500">The structure image is loaded from PubChem PUG-REST when online.</p>
    </div>
  </div>
);

const LeadScoreRadar = ({ profile }) => {
  const points = [
    ['potency', profile.potency, 250, 58],
    ['selectivity', profile.selectivity, 396, 142],
    ['solubility', profile.solubility, 330, 276],
    ['safety', 100 - clamp(profile.potency - profile.selectivity + 30, 0, 80), 170, 276],
    ['developability', Math.round((profile.selectivity + profile.solubility) / 2), 104, 142],
  ];
  const polygon = points.map(([, value, x, y]) => {
    const cx = 250;
    const cy = 180;
    const scale = clamp(value, 0, 100) / 100;
    return `${cx + (x - cx) * scale},${cy + (y - cy) * scale}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 500 340" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="18" y="18" width="464" height="304" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="36" y="50" fill="#e2e8f0" fontSize="16" fontWeight="900">Lead decision radar</text>
      {[0.35, 0.7, 1].map((scale) => (
        <polygon
          key={scale}
          points={points.map(([, , x, y]) => `${250 + (x - 250) * scale},${180 + (y - 180) * scale}`).join(' ')}
          fill="none"
          stroke="#334155"
          strokeWidth="2"
        />
      ))}
      {points.map(([label, value, x, y]) => (
        <g key={label}>
          <line x1="250" y1="180" x2={x} y2={y} stroke="#1e293b" strokeWidth="2" />
          <circle cx={x} cy={y} r="4" fill="#64748b" />
          <text x={x - 38} y={y + (y < 100 ? -10 : 24)} fill="#cbd5e1" fontSize="11" fontWeight="700">{label}</text>
          <text x={x - 9} y={y + (y < 100 ? 5 : 38)} fill="#94a3b8" fontSize="10">{Math.round(value)}</text>
        </g>
      ))}
      <polygon points={polygon} fill="#22d3ee44" stroke="#22d3ee" strokeWidth="4" />
      <circle cx="250" cy="180" r="5" fill="#22c55e" />
    </svg>
  );
};

const DrugLikenessRules = ({ props }) => (
  <div className="grid gap-2 sm:grid-cols-5">
    {propertyRules.map(([label, key, test, limit]) => {
      const raw = props?.[key];
      const value = Number(raw);
      const known = Number.isFinite(value);
      const pass = known && test(value);
      return (
        <div key={label} className={`rounded-xl border p-3 ${pass ? 'border-emerald-400/25 bg-emerald-400/10' : known ? 'border-amber-400/25 bg-amber-400/10' : 'border-white/10 bg-white/[0.035]'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
          <p className="mt-1 text-lg font-black text-white">{known ? Math.round(value * 10) / 10 : '--'}</p>
          <p className={`mt-1 text-[10px] font-bold ${pass ? 'text-emerald-200' : known ? 'text-amber-200' : 'text-gray-500'}`}>
            {known ? pass ? 'passes' : 'review' : 'load data'}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">{limit}</p>
        </div>
      );
    })}
  </div>
);

const MoleculeLeadExplorer = ({ target, selectedLigand, onSelectLigand, pubChemProps }) => {
  const profile = ligandProfiles[selectedLigand] || { className: 'lead analog', role: 'candidate', potency: 65, selectivity: 60, solubility: 55, risk: 'requires data review' };
  return (
    <div className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-3">
        {target.ligands.map((ligand) => {
          const ligandProfile = ligandProfiles[ligand] || profile;
          const active = ligand === selectedLigand;
          return (
            <button
              key={ligand}
              onClick={() => onSelectLigand(ligand)}
              className={`rounded-2xl border p-3 text-left transition-colors ${active ? 'border-emerald-400/40 bg-emerald-400/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-black capitalize text-white">{ligand}</span>
                  <span className="mt-1 block text-xs text-gray-500">{ligandProfile.role}</span>
                </span>
                <PillBadge color={active ? '#86efac' : '#94a3b8'}>{ligandProfile.className}</PillBadge>
              </div>
              <div className="mt-3 space-y-2">
                <MiniBar label="potency" value={ligandProfile.potency} color="#38bdf8" />
                <MiniBar label="selectivity" value={ligandProfile.selectivity} color="#a78bfa" />
                <MiniBar label="solubility" value={ligandProfile.solubility} color="#22c55e" />
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Selected molecule</p>
          <h3 className="mt-1 text-xl font-black capitalize text-white">{selectedLigand}</h3>
          <p className="mt-1 text-sm text-gray-400">{profile.className} | {profile.role}</p>
          <img src={pubChemPngUrl(selectedLigand)} alt={`${selectedLigand} structure from PubChem`} className="mx-auto mt-4 h-48 rounded-xl border border-white/10 bg-white p-3" />
          <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-gray-300">{profile.risk}</p>
        </div>
        <div className="space-y-4">
          <DrugLikenessRules props={pubChemProps} />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              ['Formula', pubChemProps?.MolecularFormula || 'load live PubChem'],
              ['Molecular weight', pubChemProps?.MolecularWeight || 'load live PubChem'],
              ['Canonical SMILES', pubChemProps?.CanonicalSMILES || 'load live PubChem'],
              ['Target fit', `${target.name} / ${target.modality}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-100">{value}</p>
              </div>
            ))}
          </div>
          <LeadScoreRadar profile={profile} />
        </div>
      </div>
    </div>
  );
};

const FormulaCompositionChart = ({ formula }) => {
  let offset = 0;
  return (
    <svg viewBox="0 0 760 330" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="20" y="20" width="720" height="290" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="42" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">Tablet formula composition</text>
      <g transform="translate(48 86)">
        <rect x="0" y="0" width="660" height="38" rx="19" fill="#111827" stroke="#334155" />
        {formula.map(([name, , pct, color]) => {
          const width = Math.max(10, pct * 6.6);
          const segment = (
            <rect key={name} x={offset} y="0" width={width} height="38" rx="17" fill={color} opacity="0.9" />
          );
          offset += width;
          return segment;
        })}
      </g>
      <g transform="translate(48 154)">
        {formula.map(([name, role, pct, color], index) => {
          const x = (index % 2) * 340;
          const y = Math.floor(index / 2) * 48;
          return (
            <g key={name} transform={`translate(${x} ${y})`}>
              <rect x="0" y="0" width="308" height="38" rx="12" fill="#0f172a" stroke="#1e293b" />
              <circle cx="18" cy="19" r="7" fill={color} />
              <text x="34" y="16" fill="#e2e8f0" fontSize="12" fontWeight="800">{name}</text>
              <text x="34" y="30" fill="#94a3b8" fontSize="10">{role}</text>
              <text x="264" y="24" fill={color} fontSize="12" fontWeight="900">{pct}%</text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};

const ManufacturingFlow = ({ form }) => (
  <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
    {form.process.map((stepName, index) => (
      <div key={`${form.id}-${stepName}`} className="relative rounded-2xl border border-white/10 bg-black/20 p-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-xs font-black text-cyan-100">{index + 1}</span>
          <p className="text-sm font-black capitalize text-white">{stepName}</p>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          {index === 0 ? 'material identity and quantity check' : index === form.process.length - 1 ? 'batch record and release evidence' : 'in-process control checkpoint'}
        </p>
      </div>
    ))}
  </div>
);

const TabletCrossSection = ({ form, formula, apiName }) => {
  const polymer = form.id === 'sustained' || form.id === 'enteric';
  const effervescent = form.id === 'effervescent';
  return (
    <svg viewBox="0 0 620 360" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="20" y="20" width="580" height="320" rx="26" fill="#020617" stroke="#1e293b" />
      <text x="42" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">{form.name}</text>
      <text x="42" y="76" fill="#94a3b8" fontSize="12">API: {apiName}</text>
      <ellipse cx="300" cy="178" rx="198" ry="84" fill="#e2e8f0" opacity="0.08" stroke="#64748b" strokeWidth="4" />
      {polymer && <ellipse cx="300" cy="178" rx="214" ry="98" fill="none" stroke={form.id === 'enteric' ? '#14b8a6' : '#22c55e'} strokeWidth="12" />}
      {effervescent && Array.from({ length: 16 }, (_, i) => (
        <circle key={i} cx={145 + (i % 8) * 42} cy={132 + Math.floor(i / 8) * 76 + Math.sin(i) * 10} r={5 + (i % 3)} fill="#38bdf8" opacity="0.75" />
      ))}
      {formula.slice(0, 6).map(([name, , , color], index) => (
        <g key={name}>
          <circle cx={170 + (index % 3) * 112} cy={150 + Math.floor(index / 3) * 58} r={18 + index * 2} fill={color} opacity="0.8" stroke="#f8fafc" strokeWidth="2" />
          <text x={154 + (index % 3) * 112} y={155 + Math.floor(index / 3) * 58} fill="#020617" fontSize="10" fontWeight="900">{index === 0 ? 'API' : index + 1}</text>
        </g>
      ))}
      <line x1="92" y1="292" x2="528" y2="292" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      <line x1="92" y1="292" x2={92 + form.release * 4.36} y2="292" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" />
      <text x="92" y="318" fill="#94a3b8" fontSize="12">expected release speed: {form.release}%</text>
    </svg>
  );
};

const TabletFormulaExplorer = ({ selectedFormId, onSelectForm, selectedLigand }) => {
  const form = dosageForms.find(item => item.id === selectedFormId) || dosageForms[0];
  const formula = formulaTemplates[form.id] || formulaTemplates.immediate;
  const apiLoad = formula[0]?.[2] || 0;
  const excipientLoad = Math.max(0, 100 - apiLoad);
  return (
    <div className="space-y-4">
      <div className="grid gap-2 md:grid-cols-5">
        {dosageForms.map(item => (
          <button
            key={item.id}
            onClick={() => onSelectForm(item.id)}
            className={`rounded-2xl border p-3 text-left transition-colors ${item.id === form.id ? 'border-cyan-400/40 bg-cyan-400/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
          >
            <p className="text-sm font-black text-white">{item.name}</p>
            <p className="mt-1 line-clamp-3 text-xs text-gray-500">{item.purpose}</p>
          </button>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <FormulaCompositionChart formula={formula} />
          <ManufacturingFlow form={form} />
        </div>
        <div className="space-y-4">
          <TabletCrossSection form={form} formula={formula} apiName={selectedLigand} />
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Formulation control logic</p>
            <div className="mt-3 space-y-3">
              <MiniBar label="API load" value={apiLoad} color="#38bdf8" />
              <MiniBar label="excipient system" value={excipientLoad} color="#22c55e" />
              <MiniBar label="release speed" value={form.release} color="#f59e0b" />
            </div>
            <p className="mt-4 rounded-xl border border-white/10 bg-slate-950/70 p-3 text-xs text-gray-300">{form.risk}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {form.controls.map(control => <PillBadge key={control} color="#fbbf24">{control}</PillBadge>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const qcStatus = (value, [low, high], inverted = false) => {
  const pass = inverted ? value <= high : value >= low && value <= high;
  if (pass) return ['Pass', '#22c55e'];
  const near = inverted ? value <= high * 1.35 : value >= low * 0.9 && value <= high * 1.08;
  return near ? ['Review', '#f59e0b'] : ['Reject', '#fb7185'];
};

const ChromatogramPanel = ({ selectedLigand }) => {
  const peaks = [
    ['imp A', 92, 194, 26, '#f59e0b'],
    [selectedLigand, 250, 88, 138, '#22c55e'],
    ['imp B', 396, 212, 34, '#fb7185'],
    ['degradant', 506, 226, 22, '#a78bfa'],
  ];
  return (
    <svg viewBox="0 0 680 340" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="20" y="20" width="640" height="300" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="42" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">HPLC / LC-MS chromatogram</text>
      <text x="42" y="76" fill="#94a3b8" fontSize="12">identity, assay, impurity profile, and retention-time tracking</text>
      <line x1="64" y1="270" x2="610" y2="270" stroke="#475569" strokeWidth="2" />
      <line x1="64" y1="84" x2="64" y2="270" stroke="#475569" strokeWidth="2" />
      <path d="M64 270 C88 268, 94 232, 102 270 C168 270, 216 268, 236 270 C242 232, 246 106, 258 270 C330 270, 382 268, 402 270 C408 244, 414 226, 422 270 C472 270, 502 268, 510 270 C516 252, 522 238, 530 270 C566 271, 590 270, 610 270" fill="none" stroke="#38bdf8" strokeWidth="4" />
      {peaks.map(([name, x, y, height, color]) => (
        <g key={name}>
          <line x1={x} y1="270" x2={x} y2={y} stroke={color} strokeWidth="3" strokeDasharray="5 6" />
          <circle cx={x} cy={y} r="5" fill={color} />
          <text x={x - 32} y={y - 12} fill={color} fontSize="11" fontWeight="800">{name}</text>
          <text x={x - 14} y="292" fill="#94a3b8" fontSize="10">{height}%</text>
        </g>
      ))}
      <text x="520" y="304" fill="#94a3b8" fontSize="11">retention time</text>
    </svg>
  );
};

const DissolutionCurve = ({ formId }) => {
  const values = dissolutionProfiles[formId] || dissolutionProfiles.immediate;
  const points = values.map((value, index) => `${80 + index * 96},${270 - value * 1.9}`).join(' ');
  return (
    <svg viewBox="0 0 680 340" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="20" y="20" width="640" height="300" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="42" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">Dissolution release profile</text>
      <text x="42" y="76" fill="#94a3b8" fontSize="12">5, 10, 15, 30, 45, 60 minute checkpoints</text>
      {[25, 50, 75, 100].map(value => (
        <g key={value}>
          <line x1="76" y1={270 - value * 1.9} x2="598" y2={270 - value * 1.9} stroke="#1e293b" />
          <text x="44" y={274 - value * 1.9} fill="#64748b" fontSize="10">{value}%</text>
        </g>
      ))}
      <line x1="76" y1="270" x2="598" y2="270" stroke="#475569" strokeWidth="2" />
      <line x1="76" y1="80" x2="76" y2="270" stroke="#475569" strokeWidth="2" />
      <polyline points={points} fill="none" stroke="#22c55e" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => (
        <g key={`${value}-${index}`}>
          <circle cx={80 + index * 96} cy={270 - value * 1.9} r="7" fill="#22c55e" stroke="#bbf7d0" strokeWidth="2" />
          <text x={68 + index * 96} y="294" fill="#94a3b8" fontSize="10">{[5, 10, 15, 30, 45, 60][index]}m</text>
        </g>
      ))}
    </svg>
  );
};

const QcReleaseDashboard = ({ formId, selectedLigand }) => {
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const formAdjustment = form.id === 'effervescent' ? 0.12 : form.id === 'sustained' ? 0.18 : form.id === 'enteric' ? 0.15 : 0;
  const adjustedTests = qcTests.map(([name, method, value, range, color]) => {
    const adjusted = name === 'Dissolution' ? clamp(value - formAdjustment * 40, 0, 120) : name === 'Friability' ? clamp(value + formAdjustment, 0, 5) : value;
    return [name, method, adjusted, range, color];
  });
  const failed = adjustedTests.filter(([name, , value, range]) => {
    const [state] = qcStatus(value, range, name === 'Friability' || name === 'Related substances' || name === 'Water content');
    return state === 'Reject';
  }).length;
  const review = adjustedTests.filter(([name, , value, range]) => {
    const [state] = qcStatus(value, range, name === 'Friability' || name === 'Related substances' || name === 'Water content');
    return state === 'Review';
  }).length;
  const releaseState = failed ? ['Reject batch', '#fb7185'] : review ? ['QA review', '#f59e0b'] : ['Release ready', '#22c55e'];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ChromatogramPanel selectedLigand={selectedLigand} />
        <DissolutionCurve formId={form.id} />
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {adjustedTests.map(([name, method, value, range, color]) => {
          const inverted = name === 'Friability' || name === 'Related substances' || name === 'Water content';
          const [state, stateColor] = qcStatus(value, range, inverted);
          const denominator = inverted ? Math.max(range[1], value) : range[1];
          const score = clamp((value / denominator) * 100, 0, 100);
          return (
            <div key={name} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-start justify-between gap-2">
                <span>
                  <span className="block text-sm font-black text-white">{name}</span>
                  <span className="mt-1 block text-[11px] text-gray-500">{method}</span>
                </span>
                <PillBadge color={stateColor}>{state}</PillBadge>
              </div>
              <div className="mt-3">
                <MiniBar label={`${Math.round(value * 100) / 100}`} value={score} color={color} />
              </div>
              <p className="mt-2 text-[10px] text-gray-500">spec: {range[0]} to {range[1]}</p>
            </div>
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Batch release decision</p>
          <h3 className="mt-2 text-2xl font-black" style={{ color: releaseState[1] }}>{releaseState[0]}</h3>
          <p className="mt-2 text-sm text-gray-300">{form.name} | API: {selectedLigand}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <p className="text-xl font-black text-emerald-200">{adjustedTests.length - failed - review}</p>
              <p className="text-[10px] text-gray-500">pass</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <p className="text-xl font-black text-amber-200">{review}</p>
              <p className="text-[10px] text-gray-500">review</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
              <p className="text-xl font-black text-rose-200">{failed}</p>
              <p className="text-[10px] text-gray-500">reject</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {stabilityConditions.map(([condition, detail, value, color]) => (
            <div key={condition} className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <p className="text-sm font-black text-white">{condition}</p>
              <p className="mt-1 text-[11px] text-gray-500">{detail}</p>
              <div className="mt-4 h-28 rounded-xl border border-white/10 bg-slate-950/80 p-2">
                <div className="flex h-full items-end justify-center">
                  <div className="w-10 rounded-t-lg" style={{ height: `${value}%`, background: color }} />
                </div>
              </div>
              <MiniBar label="remaining assay" value={value} color={color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const calculatePipelineScores = (target, ligand, formId, comparatorId) => {
  const profile = ligandProfiles[ligand] || ligandProfiles.gefitinib;
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const comparator = comparatorCandidates.find(item => item.id === comparatorId) || comparatorCandidates[0];
  const qcBase = form.id === 'immediate' || form.id === 'dispersible' ? 88 : form.id === 'effervescent' ? 78 : form.id === 'enteric' ? 74 : 70;
  const scores = {
    target: Math.round(target.evidence * 0.62 + target.developability * 0.38),
    lead: Math.round(profile.potency * 0.42 + profile.selectivity * 0.36 + profile.solubility * 0.22),
    preclinical: Math.round(profile.selectivity * 0.34 + profile.solubility * 0.24 + comparator.safety * 0.42),
    formulation: Math.round(form.release * 0.36 + comparator.formulation * 0.44 + profile.solubility * 0.2),
    cmc: Math.round(qcBase * 0.46 + comparator.qc * 0.38 + comparator.timeline * 0.16),
  };
  const overall = Math.round(Object.values(scores).reduce((sum, value) => sum + value, 0) / Object.values(scores).length);
  const decision = overall >= 82 ? ['Advance', '#22c55e', 'Candidate is ready for the next industry gate.'] :
    overall >= 70 ? ['Optimize', '#38bdf8', 'Core idea is strong; tune liabilities before advancing.'] :
      overall >= 58 ? ['Hold', '#f59e0b', 'Resolve translational, formulation, or QC blockers first.'] :
        ['Reject', '#fb7185', 'Program risk is too high for the current package.'];
  return { scores, overall, decision, comparator, form, profile };
};

const GateDecisionLanes = ({ scores }) => (
  <div className="grid gap-3 lg:grid-cols-5">
    {gateDefinitions.map(([label, detail, color], index) => {
      const score = Object.values(scores)[index];
      const state = score >= 82 ? 'advance' : score >= 70 ? 'optimize' : score >= 58 ? 'hold' : 'reject';
      return (
        <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-slate-950" style={{ background: color }}>{index + 1}</span>
            <PillBadge color={score >= 70 ? '#86efac' : score >= 58 ? '#fbbf24' : '#fda4af'}>{state}</PillBadge>
          </div>
          <p className="mt-3 text-sm font-black text-white">{label}</p>
          <p className="mt-1 min-h-10 text-xs text-gray-500">{detail}</p>
          <MiniBar label="gate score" value={score} color={color} />
        </div>
      );
    })}
  </div>
);

const PipelineReadinessGauge = ({ overall, decision }) => {
  const angle = -140 + (overall / 100) * 280;
  const x = 250 + Math.cos((angle * Math.PI) / 180) * 118;
  const y = 210 + Math.sin((angle * Math.PI) / 180) * 118;
  return (
    <svg viewBox="0 0 500 320" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="18" y="18" width="464" height="284" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="36" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">Program readiness gauge</text>
      <path d="M110 212 A140 140 0 0 1 390 212" fill="none" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
      <path d="M110 212 A140 140 0 0 1 202 82" fill="none" stroke="#fb7185" strokeWidth="24" strokeLinecap="round" />
      <path d="M202 82 A140 140 0 0 1 310 82" fill="none" stroke="#f59e0b" strokeWidth="24" strokeLinecap="round" />
      <path d="M310 82 A140 140 0 0 1 390 212" fill="none" stroke="#22c55e" strokeWidth="24" strokeLinecap="round" />
      <line x1="250" y1="210" x2={x} y2={y} stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
      <circle cx="250" cy="210" r="12" fill="#22d3ee" stroke="#bae6fd" strokeWidth="3" />
      <text x="220" y="204" fill="#e2e8f0" fontSize="42" fontWeight="900">{overall}</text>
      <text x="206" y="244" fill={decision[1]} fontSize="22" fontWeight="900">{decision[0]}</text>
      <text x="56" y="278" fill="#94a3b8" fontSize="12">reject</text>
      <text x="232" y="278" fill="#94a3b8" fontSize="12">optimize</text>
      <text x="398" y="278" fill="#94a3b8" fontSize="12">advance</text>
    </svg>
  );
};

const CandidateComparisonBoard = ({ selectedComparatorId, onSelectComparator, currentScores }) => (
  <div className="grid gap-3 xl:grid-cols-4">
    {comparatorCandidates.map(candidate => {
      const active = candidate.id === selectedComparatorId;
      const blended = Math.round((candidate.potency + candidate.safety + candidate.formulation + candidate.qc + candidate.cost + candidate.timeline) / 6);
      return (
        <button
          key={candidate.id}
          onClick={() => onSelectComparator(candidate.id)}
          className={`rounded-2xl border p-3 text-left transition-colors ${active ? 'border-cyan-400/40 bg-cyan-400/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-black text-white">{candidate.name}</p>
            <PillBadge color={active ? '#67e8f9' : '#94a3b8'}>{blended}</PillBadge>
          </div>
          <div className="mt-3 space-y-2">
            <MiniBar label="potency" value={candidate.potency} color="#38bdf8" />
            <MiniBar label="safety" value={candidate.safety} color="#22c55e" />
            <MiniBar label="formulation" value={candidate.formulation} color="#f59e0b" />
            <MiniBar label="QC" value={candidate.qc} color="#a78bfa" />
          </div>
          {active && <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-2 text-xs text-cyan-100">Compared with live selection score: {currentScores.overall}</p>}
        </button>
      );
    })}
  </div>
);

const MilestoneTimeline = ({ scores }) => (
  <svg viewBox="0 0 980 300" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <rect x="22" y="22" width="936" height="256" rx="24" fill="#020617" stroke="#1e293b" />
    <text x="44" y="56" fill="#e2e8f0" fontSize="16" fontWeight="900">Industry milestone plan</text>
    <text x="44" y="78" fill="#94a3b8" fontSize="12">stage-gate timeline from discovery evidence to CMC package</text>
    <line x1="92" y1="156" x2="888" y2="156" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
    {milestonePlan.map(([time, title, detail, key], index) => {
      const score = scores[key];
      const x = 92 + index * 199;
      const color = score >= 82 ? '#22c55e' : score >= 70 ? '#38bdf8' : score >= 58 ? '#f59e0b' : '#fb7185';
      return (
        <g key={title}>
          <circle cx={x} cy="156" r={score >= 70 ? 24 : 20} fill={`${color}33`} stroke={color} strokeWidth="4" />
          <text x={x - 16} y="162" fill="#e2e8f0" fontSize="13" fontWeight="900">{time}</text>
          <text x={x - 54} y={index % 2 ? 218 : 112} fill="#f8fafc" fontSize="13" fontWeight="900">{title}</text>
          <foreignObject x={x - 72} y={index % 2 ? 224 : 82} width="144" height="42">
            <div className="text-center text-[10px] leading-tight text-slate-400">{detail}</div>
          </foreignObject>
          <text x={x - 10} y="188" fill={color} fontSize="11" fontWeight="900">{score}</text>
        </g>
      );
    })}
  </svg>
);

const RiskRegisterBoard = ({ scores }) => (
  <div className="grid gap-3 md:grid-cols-5">
    {pipelineRiskRegister.map(([risk, detail, key, color]) => {
      const score = scores[key];
      const riskLevel = clamp(105 - score, 0, 100);
      const state = riskLevel <= 24 ? 'controlled' : riskLevel <= 38 ? 'watch' : riskLevel <= 54 ? 'mitigate' : 'critical';
      return (
        <div key={risk} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-black text-white">{risk}</p>
            <PillBadge color={riskLevel <= 38 ? '#86efac' : riskLevel <= 54 ? '#fbbf24' : '#fda4af'}>{state}</PillBadge>
          </div>
          <p className="mt-2 min-h-10 text-xs text-gray-500">{detail}</p>
          <MiniBar label="risk load" value={riskLevel} color={color} />
        </div>
      );
    })}
  </div>
);

const PortfolioWaterfall = ({ result }) => {
  const rows = [
    ['Target evidence', result.scores.target, '#38bdf8'],
    ['Lead package', result.scores.lead, '#a78bfa'],
    ['Preclinical', result.scores.preclinical, '#22c55e'],
    ['Formulation', result.scores.formulation, '#f59e0b'],
    ['CMC / QC', result.scores.cmc, '#fb7185'],
  ];
  return (
    <svg viewBox="0 0 760 360" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="22" y="22" width="716" height="316" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="42" y="56" fill="#e2e8f0" fontSize="16" fontWeight="900">Portfolio readiness waterfall</text>
      <line x1="86" y1="286" x2="690" y2="286" stroke="#475569" />
      <line x1="86" y1="286" x2="86" y2="84" stroke="#475569" />
      {rows.map(([label, value, color], index) => {
        const x = 118 + index * 126;
        const height = value * 1.82;
        const y = 286 - height;
        return (
          <g key={label}>
            <rect x={x} y={y} width="64" height={height} rx="12" fill={color} opacity="0.85" />
            <text x={x + 18} y={y - 10} fill={color} fontSize="12" fontWeight="900">{value}</text>
            <foreignObject x={x - 30} y="294" width="124" height="42">
              <div className="text-center text-[10px] font-bold leading-tight text-slate-400">{label}</div>
            </foreignObject>
          </g>
        );
      })}
      <line x1="96" y1={286 - result.overall * 1.82} x2="682" y2={286 - result.overall * 1.82} stroke="#e2e8f0" strokeDasharray="8 8" strokeWidth="3" />
      <text x="594" y={278 - result.overall * 1.82} fill="#e2e8f0" fontSize="12" fontWeight="900">overall {result.overall}</text>
    </svg>
  );
};

const IndustryPipelineSimulator = ({ target, ligand, formId, comparatorId, onComparatorChange }) => {
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  const scoreRows = [
    ['Potency / target fit', result.profile.potency, '#38bdf8'],
    ['Safety margin', result.comparator.safety, '#22c55e'],
    ['Formulation fit', result.scores.formulation, '#f59e0b'],
    ['QC readiness', result.scores.cmc, '#a78bfa'],
    ['Timeline confidence', result.comparator.timeline, '#14b8a6'],
    ['Cost / manufacturability', result.comparator.cost, '#fb7185'],
  ];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <PipelineReadinessGauge overall={result.overall} decision={result.decision} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Integrated program decision</p>
          <h3 className="mt-2 text-3xl font-black" style={{ color: result.decision[1] }}>{result.decision[0]}</h3>
          <p className="mt-2 text-sm text-gray-300">{result.decision[2]}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Target', `${target.name} / ${target.area}`],
              ['Lead', `${ligand} / ${result.profile.className}`],
              ['Formulation', result.form.name],
              ['Comparator model', result.comparator.name],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
                <p className="mt-1 text-sm font-semibold text-gray-100">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {scoreRows.map(([label, value, color]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <MiniBar label={label} value={value} color={color} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <GateDecisionLanes scores={result.scores} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <MilestoneTimeline scores={result.scores} />
        <PortfolioWaterfall result={result} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-rose-200">Risk register</p>
            <h3 className="text-lg font-black text-white">Program blockers and mitigation load</h3>
          </div>
          <p className="text-xs text-gray-500">Risk level is calculated from the active target, molecule, formulation, QC, cost, and timeline assumptions.</p>
        </div>
        <RiskRegisterBoard scores={result.scores} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Candidate comparison</p>
            <h3 className="text-lg font-black text-white">Choose a program strategy</h3>
          </div>
          <p className="text-xs text-gray-500">Each strategy changes safety, formulation, QC, cost, and timeline assumptions.</p>
        </div>
        <CandidateComparisonBoard selectedComparatorId={comparatorId} onSelectComparator={onComparatorChange} currentScores={result} />
      </div>
    </div>
  );
};

const DossierReadinessMatrix = ({ target, ligand, formId, comparatorId }) => {
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  return (
    <div className="grid gap-3 xl:grid-cols-5">
      {dossierModules.map(([module, title, detail, base, color], index) => {
        const linkedScore = [result.scores.target, result.scores.lead, result.scores.cmc, result.scores.preclinical, result.scores.formulation][index];
        const score = Math.round(base * 0.45 + linkedScore * 0.55);
        const state = score >= 82 ? 'ready' : score >= 70 ? 'draft' : score >= 58 ? 'gap' : 'blocker';
        return (
          <div key={module} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-2">
              <span>
                <span className="block text-xs font-black uppercase tracking-widest" style={{ color }}>{module}</span>
                <span className="mt-1 block text-sm font-black text-white">{title}</span>
              </span>
              <PillBadge color={score >= 70 ? '#86efac' : score >= 58 ? '#fbbf24' : '#fda4af'}>{state}</PillBadge>
            </div>
            <p className="mt-2 min-h-10 text-xs text-gray-500">{detail}</p>
            <MiniBar label="readiness" value={score} color={color} />
          </div>
        );
      })}
    </div>
  );
};

const RegulatoryEvidenceLinks = ({ target, ligand }) => (
  <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Live scientific provenance</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {[
          ['AlphaFold', `protein prediction ${target.uniprot}`, `https://alphafold.ebi.ac.uk/entry/${target.uniprot}`],
          ['UniProt', `protein biology ${target.uniprot}`, `https://www.uniprot.org/uniprotkb/${target.uniprot}/entry`],
          ['ChEMBL', `target bioactivity ${target.chemblTarget}`, `https://www.ebi.ac.uk/chembl/target_report_card/${target.chemblTarget}/`],
          ['PubChem', `compound record ${ligand}`, `https://pubchem.ncbi.nlm.nih.gov/#query=${encodeURIComponent(ligand)}`],
          ['RCSB PDB', `experimental structure ${target.pdb}`, `https://www.rcsb.org/structure/${target.pdb}`],
        ].map(([name, detail, url]) => (
          <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-white/[0.05]">
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-black text-white">{name}</span>
                <span className="mt-1 block text-xs text-gray-500">{detail}</span>
              </span>
              <ExternalLink size={14} className="text-cyan-300" />
            </span>
          </a>
        ))}
      </div>
    </div>
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Regulatory references</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {regulatoryLinks.map(([name, detail, url]) => (
          <a key={name} href={url} target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-white/[0.05]">
            <span className="flex items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-black text-white">{name}</span>
                <span className="mt-1 block text-xs text-gray-500">{detail}</span>
              </span>
              <ExternalLink size={14} className="text-emerald-300" />
            </span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const DossierSummarySheet = ({ target, ligand, formId, comparatorId }) => {
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const profile = ligandProfiles[ligand] || ligandProfiles.gefitinib;
  const summaryRows = [
    ['Target product profile', `${target.area} program for ${target.disease}`],
    ['Drug substance focus', `${ligand}, ${profile.className}, ${profile.role}`],
    ['Drug product concept', `${form.name} with ${form.controls.join(', ')}`],
    ['Critical quality attributes', 'assay, impurities, dissolution, content uniformity, stability'],
    ['Clinical chemistry monitoring', target.biomarkers.join(', ')],
    ['Current gate decision', `${result.decision[0]} at ${result.overall}/100 readiness`],
  ];
  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Development summary</p>
        <div className="mt-3 divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/20">
          {summaryRows.map(([label, value]) => (
            <div key={label} className="grid gap-2 p-3 md:grid-cols-[190px_1fr]">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
              <p className="text-sm font-semibold text-gray-100">{value}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-rose-200">Risk control register</p>
        <div className="mt-3 space-y-2">
          {dossierRiskRegister.map(([risk, detail, value, color]) => (
            <div key={risk} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-black text-white">{risk}</span>
                  <span className="mt-1 block text-[11px] text-gray-500">{detail}</span>
                </span>
                <span className="text-sm font-black" style={{ color }}>{value}</span>
              </div>
              <MiniBar label="control maturity" value={value} color={color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DossierExplorer = ({ target, ligand, formId, comparatorId }) => (
  <div className="space-y-4">
    <DossierReadinessMatrix target={target} ligand={ligand} formId={formId} comparatorId={comparatorId} />
    <RegulatoryEvidenceLinks target={target} ligand={ligand} />
    <DossierSummarySheet target={target} ligand={ligand} formId={formId} comparatorId={comparatorId} />
  </div>
);

const SignalTimeline = ({ target }) => {
  const endpoints = endpointLibrary.find(([area]) => area === target.area) || endpointLibrary[0];
  return (
    <svg viewBox="0 0 820 320" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="20" y="20" width="780" height="280" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="42" y="56" fill="#e2e8f0" fontSize="17" fontWeight="900">Clinical and real-world evidence timeline</text>
      <text x="42" y="78" fill="#94a3b8" fontSize="12">{endpoints[1]} | {endpoints[2]}</text>
      <line x1="86" y1="172" x2="724" y2="172" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
      {[
        ['Trial start', 108, 132, '#38bdf8'],
        ['Dose lock', 250, 202, '#a78bfa'],
        ['Primary endpoint', 402, 132, '#22c55e'],
        ['Approval', 548, 202, '#f59e0b'],
        ['RWE signal review', 692, 132, '#fb7185'],
      ].map(([label, x, y, color], index) => (
        <g key={label}>
          <circle cx={x} cy="172" r="20" fill={color} stroke="#e2e8f0" strokeWidth="3" />
          <line x1={x} y1="172" x2={x} y2={y + (y < 172 ? 18 : -18)} stroke={color} strokeWidth="3" />
          <rect x={x - 58} y={y - 18} width="116" height="36" rx="12" fill="#0f172a" stroke={color} />
          <text x={x - 44} y={y + 5} fill="#e2e8f0" fontSize="11" fontWeight="800">{label}</text>
          <text x={x - 10} y="228" fill="#94a3b8" fontSize="10">M{index * 6}</text>
        </g>
      ))}
      <text x="56" y="270" fill="#94a3b8" fontSize="12">continuous monitoring: adverse events, lab shifts, adherence, comparative effectiveness</text>
    </svg>
  );
};

const ClinicalSafetyExplorer = ({ target, ligand, formId, comparatorId }) => {
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const benefit = Math.round((result.scores.target + result.scores.lead + result.comparator.potency) / 3);
  const risk = Math.round(pharmacovigilanceSignals.reduce((sum, [, , value]) => sum + value, 0) / pharmacovigilanceSignals.length);
  const confidence = Math.round((result.overall + rweDataStreams.reduce((sum, [, , value]) => sum + value, 0) / rweDataStreams.length) / 2);
  const benefitRisk = benefit - risk + Math.round(confidence / 5);
  const decision = benefitRisk >= 70 ? ['Expand use', '#22c55e'] : benefitRisk >= 55 ? ['Monitor closely', '#38bdf8'] : benefitRisk >= 42 ? ['Restrict / update label', '#f59e0b'] : ['Escalate safety action', '#fb7185'];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <SignalTimeline target={target} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Benefit-risk decision</p>
          <h3 className="mt-2 text-2xl font-black" style={{ color: decision[1] }}>{decision[0]}</h3>
          <p className="mt-2 text-sm text-gray-300">{ligand} in {form.name}</p>
          <div className="mt-4 space-y-3">
            <MiniBar label="clinical benefit" value={benefit} color="#22c55e" />
            <MiniBar label="safety signal pressure" value={risk} color="#fb7185" />
            <MiniBar label="RWE confidence" value={confidence} color="#38bdf8" />
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-gray-300">
            Use this layer to monitor post-approval risk, label changes, comparative effectiveness, adherence, and population-specific safety.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Real-world data streams</p>
          <div className="mt-3 space-y-2">
            {rweDataStreams.map(([stream, detail, value, color]) => (
              <div key={stream} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-black text-white">{stream}</span>
                    <span className="mt-1 block text-[11px] text-gray-500">{detail}</span>
                  </span>
                  <span className="text-sm font-black" style={{ color }}>{value}</span>
                </div>
                <MiniBar label="data maturity" value={value} color={color} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-200">Safety signal board</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {pharmacovigilanceSignals.map(([signal, detail, value, color]) => {
              const state = value >= 50 ? 'watch' : value >= 38 ? 'trend' : 'stable';
              return (
                <div key={signal} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-black text-white">{signal}</p>
                    <PillBadge color={value >= 50 ? '#fda4af' : value >= 38 ? '#fbbf24' : '#86efac'}>{state}</PillBadge>
                  </div>
                  <p className="mt-1 min-h-8 text-[11px] text-gray-500">{detail}</p>
                  <MiniBar label="signal strength" value={value} color={color} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {lifecycleActions.map(([action, detail], index) => (
          <div key={action} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-400/25 bg-cyan-400/10 text-xs font-black text-cyan-100">{index + 1}</span>
            <p className="mt-3 text-sm font-black text-white">{action}</p>
            <p className="mt-1 text-xs text-gray-500">{detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScaleUpLadder = ({ form }) => (
  <svg viewBox="0 0 920 360" className="h-96 w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <rect x="22" y="22" width="876" height="316" rx="26" fill="#020617" stroke="#1e293b" />
    <text x="46" y="58" fill="#e2e8f0" fontSize="17" fontWeight="900">Scale-up batch ladder</text>
    <text x="46" y="80" fill="#94a3b8" fontSize="12">{form.name} | process: {form.process.join(' -> ')}</text>
    <line x1="90" y1="252" x2="820" y2="252" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
    {scaleUpBatches.map(([name, scale, purpose, readiness, color], index) => {
      const x = 104 + index * 176;
      const height = readiness * 1.55;
      return (
        <g key={name}>
          <rect x={x - 38} y={252 - height} width="76" height={height} rx="16" fill={`${color}aa`} stroke={color} strokeWidth="3" />
          <circle cx={x} cy="252" r="18" fill={color} stroke="#f8fafc" strokeWidth="3" />
          <text x={x - 20} y={246 - height} fill={color} fontSize="12" fontWeight="900">{readiness}</text>
          <text x={x - 42} y="292" fill="#e2e8f0" fontSize="12" fontWeight="900">{name}</text>
          <text x={x - 20} y="310" fill="#94a3b8" fontSize="11">{scale}</text>
          <foreignObject x={x - 64} y={186 - height} width="128" height="40">
            <div className="text-center text-[10px] leading-tight text-slate-400">{purpose}</div>
          </foreignObject>
        </g>
      );
    })}
  </svg>
);

const ProcessParameterBoard = ({ form }) => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {processParameters.map(([parameter, cqa, base, color], index) => {
      const formShift = form.id === 'effervescent' && parameter.includes('Packaging') ? 16 :
        form.id === 'enteric' && parameter.includes('Coating') ? 18 :
          form.id === 'sustained' && parameter.includes('Granulation') ? 10 : 0;
      const control = clamp(base + formShift - index, 0, 100);
      const state = control >= 80 ? 'validated' : control >= 68 ? 'define range' : 'tighten CPP';
      return (
        <div key={parameter} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-start justify-between gap-3">
            <span>
              <span className="block text-sm font-black text-white">{parameter}</span>
              <span className="mt-1 block text-xs text-gray-500">{cqa}</span>
            </span>
            <PillBadge color={control >= 80 ? '#86efac' : control >= 68 ? '#fbbf24' : '#fda4af'}>{state}</PillBadge>
          </div>
          <MiniBar label="control confidence" value={control} color={color} />
        </div>
      );
    })}
  </div>
);

const TechTransferBoard = () => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
    {techTransferChecklist.map(([item, detail, value, color]) => (
      <div key={item} className="rounded-2xl border border-white/10 bg-black/20 p-3">
        <p className="text-sm font-black text-white">{item}</p>
        <p className="mt-2 min-h-10 text-xs text-gray-500">{detail}</p>
        <MiniBar label="transfer readiness" value={value} color={color} />
      </div>
    ))}
  </div>
);

const SupplyContinuityPanel = ({ target, ligand, form }) => {
  const supplyScores = [
    ['API supply security', target.area === 'Infectious Disease' ? 72 : 82, '#38bdf8'],
    ['Excipient availability', form.id === 'effervescent' ? 64 : 86, '#22c55e'],
    ['Packaging resilience', form.id === 'effervescent' || form.id === 'enteric' ? 58 : 78, '#f59e0b'],
    ['Cold / humidity control', ligand.length > 10 ? 66 : 76, '#a78bfa'],
    ['Batch release cadence', 80, '#14b8a6'],
  ];
  const average = Math.round(supplyScores.reduce((sum, [, value]) => sum + value, 0) / supplyScores.length);
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Supply continuity</p>
      <h3 className="mt-2 text-2xl font-black text-white">{average}/100 network readiness</h3>
      <p className="mt-2 text-sm text-gray-400">Maps API, excipient, packaging, environment, and release cadence risks before commercial launch.</p>
      <div className="mt-4 space-y-3">
        {supplyScores.map(([label, value, color]) => (
          <MiniBar key={label} label={label} value={value} color={color} />
        ))}
      </div>
    </div>
  );
};

const ManufacturingScaleUpExplorer = ({ target, ligand, formId }) => {
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <ScaleUpLadder form={form} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Tech transfer summary</p>
          <h3 className="mt-2 text-2xl font-black capitalize text-white">{ligand} commercial process</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-300">
            Manufacturing scale-up turns the development formula into a reproducible commercial process: scale-up batches,
            critical process parameters, analytical transfer, packaging, and supply continuity.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {form.controls.map(control => <PillBadge key={control} color="#fbbf24">{control}</PillBadge>)}
          </div>
        </div>
      </div>
      <ProcessParameterBoard form={form} />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <TechTransferBoard />
        <SupplyContinuityPanel target={target} ligand={ligand} form={form} />
      </div>
    </div>
  );
};

const DockingScene = ({ target }) => (
  <svg viewBox="0 0 760 340" className="h-96 w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <rect x="24" y="24" width="712" height="292" rx="26" fill="#020617" stroke="#1e293b" />
    <text x="44" y="56" fill="#e2e8f0" fontSize="16" fontWeight="900">Docking and receptor chemistry: {target.name}</text>
    <path d="M88 184 C116 76, 224 78, 262 144 C312 86, 430 92, 458 172 C502 122, 620 142, 664 226 C556 284, 388 252, 282 276 C178 298, 84 252, 88 184Z" fill="#0f172a" stroke="#334155" strokeWidth="3" />
    <ellipse cx="390" cy="176" rx="116" ry="62" fill="#0e749033" stroke="#22d3ee" strokeWidth="4" />
    <g transform="translate(334 148)">
      <line x1="0" y1="28" x2="38" y2="8" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
      <line x1="38" y1="8" x2="86" y2="28" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
      <line x1="86" y1="28" x2="112" y2="56" stroke="#f59e0b" strokeWidth="6" strokeLinecap="round" />
      <circle cx="0" cy="28" r="12" fill="#22c55e" stroke="#bbf7d0" strokeWidth="3" />
      <circle cx="86" cy="28" r="12" fill="#fb7185" stroke="#fecdd3" strokeWidth="3" />
      <circle cx="112" cy="56" r="10" fill="#a78bfa" stroke="#ddd6fe" strokeWidth="3" />
    </g>
    <line x1="333" y1="176" x2="286" y2="126" stroke="#e2e8f0" strokeDasharray="6 6" strokeWidth="2" />
    <line x1="420" y1="176" x2="500" y2="122" stroke="#e2e8f0" strokeDasharray="6 6" strokeWidth="2" />
    <line x1="448" y1="204" x2="548" y2="232" stroke="#e2e8f0" strokeDasharray="6 6" strokeWidth="2" />
    {[
      ['H-bond donor', 245, 118, '#22d3ee'],
      ['salt bridge', 512, 118, '#fb7185'],
      ['hydrophobic wall', 530, 236, '#f59e0b'],
      ['chiral fit', 270, 248, '#a78bfa'],
    ].map(([label, x, y, color]) => (
      <g key={label}>
        <circle cx={x} cy={y} r="18" fill={`${color}33`} stroke={color} strokeWidth="3" />
        <text x={x - 38} y={y + 38} fill="#cbd5e1" fontSize="12">{label}</text>
      </g>
    ))}
  </svg>
);

const AnalysisGrid = () => (
  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
    {analyticalPanels.map(([name, metric, value, color]) => (
      <div key={name} className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-sm font-bold text-white">{name}</p>
        <p className="text-[11px] text-gray-500">{metric}</p>
        <div className="mt-3 h-28 rounded-xl border border-white/10 bg-slate-950/80 p-2">
          <div className="flex h-full items-end justify-center">
            <div className="w-10 rounded-t-lg" style={{ height: `${value}%`, background: color }} />
          </div>
        </div>
        <MiniBar label="signal" value={value} color={color} />
      </div>
    ))}
  </div>
);

const BatchScaleLadder = ({ form }) => (
  <svg viewBox="0 0 920 360" className="h-96 w-full rounded-2xl border border-white/10 bg-slate-950/70">
    <rect x="22" y="22" width="876" height="316" rx="26" fill="#020617" stroke="#1e293b" />
    <text x="46" y="58" fill="#e2e8f0" fontSize="16" fontWeight="900">Batch scale-up ladder</text>
    <text x="46" y="80" fill="#94a3b8" fontSize="12">{form.name}: lab to commercial control strategy</text>
    <line x1="100" y1="198" x2="804" y2="198" stroke="#334155" strokeWidth="8" strokeLinecap="round" />
    {scaleUpBatches.map(([name, size, purpose, readiness, color], index) => {
      const x = 102 + index * 176;
      const y = 238 - readiness * 1.45;
      return (
        <g key={name}>
          <rect x={x - 56} y={y - 18} width="112" height={readiness * 1.45 + 18} rx="16" fill={`${color}22`} stroke={color} strokeWidth="3" />
          <circle cx={x} cy={y} r="18" fill={color} stroke="#f8fafc" strokeWidth="3" />
          <text x={x - 38} y="270" fill="#e2e8f0" fontSize="12" fontWeight="900">{name}</text>
          <text x={x - 18} y="288" fill="#94a3b8" fontSize="11">{size}</text>
          <foreignObject x={x - 62} y="298" width="124" height="34">
            <div className="text-center text-[10px] leading-tight text-slate-400">{purpose}</div>
          </foreignObject>
        </g>
      );
    })}
  </svg>
);

const ScaleUpExplorer = ({ target, ligand, formId, comparatorId }) => {
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  const processRobustness = Math.round(processParameters.reduce((sum, [, , value]) => sum + value, 0) / processParameters.length);
  const transferReadiness = Math.round(techTransferChecklist.reduce((sum, [, , value]) => sum + value, 0) / techTransferChecklist.length);
  const supplyReadiness = Math.round(supplyContinuityRisks.reduce((sum, [, , value]) => sum + value, 0) / supplyContinuityRisks.length);
  const launchScore = Math.round(result.scores.cmc * 0.28 + result.scores.formulation * 0.24 + processRobustness * 0.2 + transferReadiness * 0.16 + supplyReadiness * 0.12);
  const decision = launchScore >= 82 ? ['Commercial ready', '#22c55e'] : launchScore >= 70 ? ['Validation campaign', '#38bdf8'] : launchScore >= 58 ? ['Engineering hold', '#f59e0b'] : ['Scale-up blocker', '#fb7185'];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <BatchScaleLadder form={form} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Manufacturing launch decision</p>
          <h3 className="mt-2 text-2xl font-black" style={{ color: decision[1] }}>{decision[0]}</h3>
          <p className="mt-2 text-sm text-gray-300">{ligand} | {form.name}</p>
          <div className="mt-4 space-y-3">
            <MiniBar label="launch readiness" value={launchScore} color={decision[1]} />
            <MiniBar label="process robustness" value={processRobustness} color="#38bdf8" />
            <MiniBar label="tech transfer" value={transferReadiness} color="#22c55e" />
            <MiniBar label="supply continuity" value={supplyReadiness} color="#f59e0b" />
          </div>
          <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-gray-300">
            This check tests whether the formulation can survive scale, site transfer, packaging, validation, and routine commercial release.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">CPP / CQA control map</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {processParameters.map(([param, detail, value, color]) => (
              <div key={param} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm font-black text-white">{param}</p>
                <p className="mt-1 min-h-8 text-[11px] text-gray-500">{detail}</p>
                <MiniBar label="control strength" value={value} color={color} />
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Tech transfer readiness</p>
          <div className="mt-3 space-y-2">
            {techTransferChecklist.map(([item, detail, value, color]) => (
              <div key={item} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <div className="flex items-start justify-between gap-3">
                  <span>
                    <span className="block text-sm font-black text-white">{item}</span>
                    <span className="mt-1 block text-[11px] text-gray-500">{detail}</span>
                  </span>
                  <PillBadge color={value >= 80 ? '#86efac' : value >= 68 ? '#fbbf24' : '#fda4af'}>{value >= 80 ? 'ready' : value >= 68 ? 'draft' : 'gap'}</PillBadge>
                </div>
                <MiniBar label="readiness" value={value} color={color} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {supplyContinuityRisks.map(([risk, detail, value, color]) => (
          <div key={risk} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm font-black text-white">{risk}</p>
            <p className="mt-1 min-h-10 text-xs text-gray-500">{detail}</p>
            <MiniBar label="continuity" value={value} color={color} />
          </div>
        ))}
      </div>
    </div>
  );
};

const LaunchReadinessRadar = ({ domains, launchScore }) => {
  const center = 250;
  const points = domains.map(([, , score], index) => {
    const angle = -90 + index * (360 / domains.length);
    const radius = score * 1.35;
    const x = center + Math.cos((angle * Math.PI) / 180) * radius;
    const y = 180 + Math.sin((angle * Math.PI) / 180) * radius;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 500 360" className="h-80 w-full rounded-2xl border border-white/10 bg-slate-950/70">
      <rect x="18" y="18" width="464" height="324" rx="24" fill="#020617" stroke="#1e293b" />
      <text x="36" y="54" fill="#e2e8f0" fontSize="16" fontWeight="900">Launch readiness radar</text>
      {[35, 70, 105].map(radius => (
        <circle key={radius} cx={center} cy="180" r={radius} fill="none" stroke="#1e293b" strokeWidth="2" />
      ))}
      {domains.map(([label, , score, color], index) => {
        const angle = -90 + index * (360 / domains.length);
        const x = center + Math.cos((angle * Math.PI) / 180) * 124;
        const y = 180 + Math.sin((angle * Math.PI) / 180) * 124;
        const lx = center + Math.cos((angle * Math.PI) / 180) * 156;
        const ly = 180 + Math.sin((angle * Math.PI) / 180) * 156;
        return (
          <g key={label}>
            <line x1={center} y1="180" x2={x} y2={y} stroke="#334155" />
            <circle cx={x} cy={y} r="5" fill={color} />
            <text x={lx - 42} y={ly} fill="#cbd5e1" fontSize="11" fontWeight="800">{label}</text>
            <text x={x - 8} y={y - 9} fill={color} fontSize="10" fontWeight="900">{score}</text>
          </g>
        );
      })}
      <polygon points={points} fill="#22c55e33" stroke="#22c55e" strokeWidth="4" />
      <text x="210" y="190" fill="#e2e8f0" fontSize="38" fontWeight="900">{launchScore}</text>
      <text x="196" y="218" fill="#94a3b8" fontSize="12">launch score</text>
    </svg>
  );
};

const AccessEvidenceBoard = ({ target, form, strategy }) => {
  const formBoost = form.id === 'dispersible' ? 8 : form.id === 'effervescent' ? 3 : form.id === 'sustained' ? -5 : 0;
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      {accessEvidencePack.map(([label, detail, base, color], index) => {
        const score = clamp(Math.round(base + formBoost + (strategy[2] - 76) * 0.24 - index), 0, 100);
        const state = score >= 82 ? 'ready' : score >= 70 ? 'build' : score >= 58 ? 'gap' : 'blocker';
        return (
          <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
            <div className="flex items-start justify-between gap-2">
              <span>
                <span className="block text-sm font-black text-white">{label}</span>
                <span className="mt-1 block text-xs text-gray-500">{detail}</span>
              </span>
              <PillBadge color={score >= 70 ? '#86efac' : score >= 58 ? '#fbbf24' : '#fda4af'}>{state}</PillBadge>
            </div>
            <MiniBar label={`${target.area} fit`} value={score} color={color} />
          </div>
        );
      })}
    </div>
  );
};

const LaunchChannelMap = ({ launchScore }) => (
  <div className="grid gap-3 md:grid-cols-5">
    {launchChannelPlan.map(([channel, detail, base, color], index) => {
      const score = clamp(Math.round(base * 0.58 + launchScore * 0.42 - index), 0, 100);
      return (
        <div key={channel} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm font-black text-white">{channel}</p>
          <p className="mt-1 min-h-12 text-xs text-gray-500">{detail}</p>
          <MiniBar label="channel readiness" value={score} color={color} />
        </div>
      );
    })}
  </div>
);

const LifecycleOptionBoard = ({ result, target }) => (
  <div className="grid gap-3 md:grid-cols-5">
    {lifecycleExpansionOptions.map(([option, detail, base, color], index) => {
      const biologyBoost = target.evidence >= 88 && option === 'New indication' ? 8 : target.area === 'CNS' ? -5 : 0;
      const score = clamp(Math.round(base * 0.5 + result.scores.lead * 0.28 + result.scores.formulation * 0.22 + biologyBoost - index), 0, 100);
      const priority = score >= 82 ? 'priority' : score >= 70 ? 'planned' : score >= 58 ? 'watch' : 'defer';
      return (
        <div key={option} className="rounded-2xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-black text-white">{option}</p>
            <PillBadge color={score >= 70 ? '#86efac' : score >= 58 ? '#fbbf24' : '#fda4af'}>{priority}</PillBadge>
          </div>
          <p className="mt-2 min-h-12 text-xs text-gray-500">{detail}</p>
          <MiniBar label="opportunity" value={score} color={color} />
        </div>
      );
    })}
  </div>
);

const MarketAccessLifecycleExplorer = ({ target, ligand, formId, comparatorId }) => {
  const form = dosageForms.find(item => item.id === formId) || dosageForms[0];
  const result = calculatePipelineScores(target, ligand, formId, comparatorId);
  const strategy = marketAccessStrategies[target.area] || marketAccessStrategies.Cardiovascular;
  const domainScores = launchReadinessDomains.map(([label, detail, key, color], index) => {
    const score = clamp(Math.round((result.scores[key] || result.overall) * 0.62 + strategy[2] * 0.28 + form.release * 0.1 - index * 2), 0, 100);
    return [label, detail, score, color];
  });
  const launchScore = Math.round(domainScores.reduce((sum, [, , score]) => sum + score, 0) / domainScores.length);
  const decision = launchScore >= 84 ? ['Launch ready', '#22c55e'] : launchScore >= 72 ? ['Access build', '#38bdf8'] : launchScore >= 60 ? ['Evidence gap', '#f59e0b'] : ['Launch hold', '#fb7185'];
  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <LaunchReadinessRadar domains={domainScores} launchScore={launchScore} />
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Market access decision</p>
          <h3 className="mt-2 text-3xl font-black" style={{ color: decision[1] }}>{decision[0]}</h3>
          <p className="mt-2 text-sm text-gray-300">{ligand} | {strategy[0]}</p>
          <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-gray-300">{strategy[1]}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {domainScores.map(([label, detail, score, color]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <MiniBar label={label} value={score} color={color} />
                <p className="mt-2 text-[11px] text-gray-500">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AccessEvidenceBoard target={target} form={form} strategy={strategy} />
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-200">Distribution and evidence operations</p>
            <h3 className="text-lg font-black text-white">Launch channel map</h3>
          </div>
          <p className="text-xs text-gray-500">Scores blend launch readiness with channel-specific complexity.</p>
        </div>
        <LaunchChannelMap launchScore={launchScore} />
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Lifecycle strategy</p>
            <h3 className="text-lg font-black text-white">Post-launch growth and risk actions</h3>
          </div>
          <p className="text-xs text-gray-500">Lifecycle strategy closes the loop from approval into access, field evidence, and lifecycle decisions.</p>
        </div>
        <LifecycleOptionBoard result={result} target={target} />
      </div>
    </div>
  );
};

export default function DrugDiscoveryModule() {
  const [selectedTargetId, setSelectedTargetId] = useState('egfr');
  const [selectedArea, setSelectedArea] = useState('All');
  const [selectedLigand, setSelectedLigand] = useState('gefitinib');
  const [selectedFormId, setSelectedFormId] = useState('immediate');
  const [selectedComparatorId, setSelectedComparatorId] = useState('balanced');
  const [stage, setStage] = useState(0);
  const [datasetStatus, setDatasetStatus] = useState('');
  const [alphaFoldData, setAlphaFoldData] = useState(null);
  const [chemblTarget, setChemblTarget] = useState(null);
  const [chemblActivities, setChemblActivities] = useState(null);
  const [pubChemData, setPubChemData] = useState(null);
  const [pdbData, setPdbData] = useState(null);

  const target = targetLibrary.find(item => item.id === selectedTargetId) || targetLibrary[0];
  const filteredTargets = useMemo(
    () => selectedArea === 'All' ? targetLibrary : targetLibrary.filter(item => item.area === selectedArea),
    [selectedArea]
  );
  const activeStage = discoveryStages[stage];
  const primaryLigand = target.ligands.includes(selectedLigand) ? selectedLigand : target.ligands[0];
  const resetDatasets = () => {
    setAlphaFoldData(null);
    setChemblTarget(null);
    setChemblActivities(null);
    setPubChemData(null);
    setPdbData(null);
    setDatasetStatus('');
  };

  const loadTargetDatasets = async () => {
    setDatasetStatus('Fetching AlphaFold, ChEMBL, PubChem, and RCSB data...');
    try {
      const [alpha, chembl, activities, pubchem, pdb] = await Promise.allSettled([
        fetchJson(alphaFoldUrl(target.uniprot)),
        fetchJson(chemblTargetUrl(target.chemblTarget)),
        fetchJson(chemblActivityUrl(target.chemblTarget)),
        fetchJson(pubChemUrl(primaryLigand)),
        fetchJson(rcsbEntryUrl(target.pdb)),
      ]);
      if (alpha.status === 'fulfilled') setAlphaFoldData(alpha.value);
      if (chembl.status === 'fulfilled') setChemblTarget(chembl.value);
      if (activities.status === 'fulfilled') setChemblActivities(activities.value.activities || []);
      if (pubchem.status === 'fulfilled') setPubChemData(pubchem.value);
      if (pdb.status === 'fulfilled') setPdbData(pdb.value);
      const failed = [alpha, chembl, activities, pubchem, pdb].filter(item => item.status === 'rejected').length;
      setDatasetStatus(failed ? `Loaded available datasets; ${failed} source${failed === 1 ? '' : 's'} unavailable.` : 'Live datasets loaded.');
    } catch (error) {
      setDatasetStatus(`Dataset fetch failed: ${error.message}`);
    }
  };

  const pubChemProps = pubChemData?.PropertyTable?.Properties?.[0];
  const potencyValues = useMemo(() => {
    const values = (chemblActivities || [])
      .map(item => Number(item.pchembl_value))
      .filter(value => Number.isFinite(value))
      .slice(0, 12);
    return values.length ? values : [4.2, 5.8, 6.4, 5.1, 6.9, 7.2, 4.8];
  }, [chemblActivities]);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                <Pill size={14} /> Lifecycle Strategy
              </span>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">Market Access and Lifecycle</span>
            </div>
            <h2 className="mt-4 text-2xl font-black leading-tight text-white md:text-4xl">Industry Drug Discovery Explorer</h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-300">
              The module now extends manufacturing scale-up into market access and lifecycle planning with launch readiness,
              payer evidence, distribution channels, post-launch monitoring, and expansion strategy scoring.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={loadTargetDatasets} className="btn-primary flex items-center gap-2 text-sm">
                <Database size={15} /> Load Live Datasets
              </button>
              <a href={alphaFoldUrl(target.uniprot)} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-2 text-sm">
                AlphaFold API <ExternalLink size={14} />
              </a>
              <a href={chemblTargetUrl(target.chemblTarget)} target="_blank" rel="noreferrer" className="btn-secondary flex items-center gap-2 text-sm">
                ChEMBL Target <ExternalLink size={14} />
              </a>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Current target</p>
            <h3 className="mt-2 text-xl font-black text-white">{target.name}</h3>
            <p className="mt-1 text-sm text-gray-400">{target.disease}</p>
            <div className="mt-4 space-y-3">
              <MiniBar label="target evidence" value={target.evidence} color="#38bdf8" />
              <MiniBar label="developability" value={target.developability} color="#22c55e" />
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              <PillBadge>{target.uniprot}</PillBadge>
              <PillBadge color="#a78bfa">{target.chemblTarget}</PillBadge>
              <PillBadge color="#f59e0b">{target.pdb}</PillBadge>
            </div>
            {datasetStatus && <p className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-cyan-100">{datasetStatus}</p>}
          </div>
        </div>
      </div>

      <Panel title="Industry Development Roadmap" icon={Sparkles}>
        <PhaseRoadmap />
      </Panel>

      <Panel title="Disease Area Portfolio" icon={Microscope}>
        <DiseaseAreaStrip
          selectedArea={selectedArea}
          onSelectArea={(area) => {
            setSelectedArea(area);
            const nextTarget = area === 'All' ? targetLibrary[0] : targetLibrary.find(item => item.area === area);
            if (nextTarget) {
              setSelectedTargetId(nextTarget.id);
              setSelectedLigand(nextTarget.ligands[0]);
              resetDatasets();
            }
          }}
        />
      </Panel>

      <Panel title="Target Intelligence" icon={Target}>
        <EvidenceMatrix target={target} />
      </Panel>

      <Panel title="Disease, Pathway, Assay and Lead Context" icon={Activity}>
        <PathwayAssayMap target={target} />
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <Panel title="Target Portfolio" icon={Target}>
            <div className="space-y-2">
              {filteredTargets.map(item => (
                <TargetIntelligenceCard
                  key={item.id}
                  target={item}
                  active={item.id === target.id}
                  onSelect={() => {
                    setSelectedTargetId(item.id);
                    setSelectedLigand(item.ligands[0]);
                    resetDatasets();
                  }}
                />
              ))}
            </div>
          </Panel>

          <Panel title="Dataset Connectors" icon={Link2}>
            <div className="space-y-2">
              {databaseLinks.map(([name, detail, url]) => (
                <a key={name} href={url} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-2 rounded-xl border border-white/10 bg-black/20 p-3 hover:bg-white/[0.05]">
                  <span>
                    <span className="block text-sm font-bold text-white">{name}</span>
                    <span className="block text-xs text-gray-500">{detail}</span>
                  </span>
                  <ExternalLink size={13} className="mt-1 flex-shrink-0 text-cyan-300" />
                </a>
              ))}
            </div>
            {datasetStatus && <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-cyan-100">{datasetStatus}</p>}
          </Panel>
        </aside>

        <main className="space-y-4 min-w-0">
          <Panel title="Discovery Pipeline" icon={RouteIcon}>
            <PipelineSvg stage={stage} />
            <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px]">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
                {discoveryStages.map(([label, Icon, detail], index) => (
                  <button
                    key={label}
                    onClick={() => setStage(index)}
                    className={`rounded-xl border p-2 text-left transition-colors ${stage === index ? 'border-emerald-500/35 bg-emerald-500/15' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'}`}
                  >
                    <Icon size={14} className="text-cyan-300" />
                    <p className="mt-1 text-xs font-bold text-white">{label}</p>
                    <p className="mt-1 line-clamp-2 text-[10px] text-gray-500">{detail}</p>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold text-emerald-200">Active step</p>
                <p className="mt-1 text-lg font-black text-white">{activeStage[0]}</p>
                <p className="mt-2 text-xs text-gray-300">{activeStage[2]}</p>
              </div>
            </div>
          </Panel>

          <Panel title="Target Structure Workspace" icon={Dna}>
            <StructureScene target={target} alphaFoldData={alphaFoldData} pdbData={pdbData} />
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="ChEMBL Bioactivity Snapshot" icon={Activity}>
              <p className="text-sm text-gray-300">
                {chemblTarget?.pref_name || target.name} bioactivity values are shown as pChEMBL-style potency bars when loaded.
              </p>
              <div className="mt-4 grid grid-cols-7 items-end gap-2">
                {potencyValues.slice(0, 7).map((value, index) => (
                  <div key={`${value}-${index}`} className="text-center">
                    <div className="mx-auto flex h-40 items-end rounded-xl border border-white/10 bg-black/20 p-1">
                      <div className="w-8 rounded-t-lg bg-emerald-400" style={{ height: `${clamp(value * 12, 10, 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">{value.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            </Panel>
          <Panel title="PubChem Compound Snapshot" icon={Atom}>
              <div className="grid gap-3 sm:grid-cols-[150px_1fr]">
                <img src={pubChemPngUrl(primaryLigand)} alt={`${primaryLigand} from PubChem`} className="h-36 rounded-xl border border-white/10 bg-white p-2" />
                <div className="space-y-2">
                  <p className="text-sm font-black capitalize text-white">{primaryLigand}</p>
                  {[
                    ['Formula', pubChemProps?.MolecularFormula || 'load dataset'],
                    ['MW', pubChemProps?.MolecularWeight || 'load dataset'],
                    ['XLogP', pubChemProps?.XLogP ?? 'load dataset'],
                    ['TPSA', pubChemProps?.TPSA ?? 'load dataset'],
                    ['HBD/HBA', pubChemProps ? `${pubChemProps.HBondDonorCount}/${pubChemProps.HBondAcceptorCount}` : 'load dataset'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-semibold text-gray-200">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </div>

          <Panel title="Molecule and Lead Explorer" icon={Pill}>
            <MoleculeLeadExplorer
              target={target}
              selectedLigand={primaryLigand}
              onSelectLigand={(ligand) => {
                setSelectedLigand(ligand);
                setPubChemData(null);
                setDatasetStatus(`Selected ${ligand}. Load live datasets to refresh PubChem properties.`);
              }}
              pubChemProps={pubChemProps}
            />
          </Panel>

          <Panel title="Tablet Formula Explorer" icon={Beaker}>
            <TabletFormulaExplorer
              selectedFormId={selectedFormId}
              onSelectForm={setSelectedFormId}
              selectedLigand={primaryLigand}
            />
          </Panel>

          <Panel title="Pharma QC Lab" icon={TestTube2}>
            <QcReleaseDashboard formId={selectedFormId} selectedLigand={primaryLigand} />
          </Panel>

          <Panel title="Industry Pipeline Simulator" icon={BadgeCheck}>
            <IndustryPipelineSimulator
              target={target}
              ligand={primaryLigand}
              formId={selectedFormId}
              comparatorId={selectedComparatorId}
              onComparatorChange={setSelectedComparatorId}
            />
          </Panel>

          <Panel title="Dossier Explorer" icon={BookOpen}>
            <DossierExplorer
              target={target}
              ligand={primaryLigand}
              formId={selectedFormId}
              comparatorId={selectedComparatorId}
            />
          </Panel>

          <Panel title="RWE and Pharmacovigilance" icon={Activity}>
            <ClinicalSafetyExplorer
              target={target}
              ligand={primaryLigand}
              formId={selectedFormId}
              comparatorId={selectedComparatorId}
            />
          </Panel>

          <Panel title="Manufacturing Scale-Up and Tech Transfer" icon={Boxes}>
            <ScaleUpExplorer
              target={target}
              ligand={primaryLigand}
              formId={selectedFormId}
              comparatorId={selectedComparatorId}
            />
          </Panel>

          <Panel title="Market Access and Lifecycle Strategy" icon={BarChart3}>
            <MarketAccessLifecycleExplorer
              target={target}
              ligand={primaryLigand}
              formId={selectedFormId}
              comparatorId={selectedComparatorId}
            />
          </Panel>

          <Panel title="SAR, QSAR and Drug-Likeness Studio" icon={GitCompare}>
            <SarChart ligand={primaryLigand} />
          </Panel>

          <Panel title="Docking, Receptor Chemistry and Chiral Fit" icon={Orbit}>
            <DockingScene target={target} />
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="ADME/Tox Decision Board" icon={ShieldAlert}>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Solubility', 68, '#38bdf8'],
                  ['Permeability', 74, '#22c55e'],
                  ['Metabolic stability', 52, '#f59e0b'],
                  ['hERG / safety margin', 36, '#fb7185'],
                  ['CYP interaction risk', 44, '#a78bfa'],
                  ['Therapeutic index idea', 63, '#14b8a6'],
                ].map(([label, value, color]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <MiniBar label={label} value={value} color={color} />
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Antibiotic Resistance Lab" icon={Microscope}>
              <svg viewBox="0 0 480 250" className="h-64 w-full rounded-xl border border-white/10 bg-slate-950/70">
                <rect x="20" y="20" width="440" height="210" rx="22" fill="#020617" stroke="#1e293b" />
                <text x="42" y="50" fill="#e2e8f0" fontSize="15" fontWeight="900">beta-lactamase and MIC logic</text>
                <circle cx="126" cy="130" r="54" fill="#22c55e22" stroke="#22c55e" strokeWidth="4" />
                <text x="96" y="134" fill="#bbf7d0" fontSize="12" fontWeight="900">bacteria</text>
                <path d="M222 130 L300 130" stroke="#e2e8f0" strokeWidth="4" strokeDasharray="8 8" />
                <path d="M292 118 L320 130 L292 142Z" fill="#e2e8f0" />
                <rect x="338" y="94" width="82" height="72" rx="16" fill="#7f1d1d66" stroke="#fb7185" strokeWidth="4" />
                <text x="349" y="123" fill="#fecdd3" fontSize="11">enzyme</text>
                <text x="348" y="140" fill="#fecdd3" fontSize="11">resistance</text>
                <circle cx="224" cy="130" r="22" fill="#f59e0b" stroke="#fde68a" strokeWidth="3" />
                <text x="208" y="206" fill="#94a3b8" fontSize="12">antibiotic pressure, target change, enzyme degradation, efflux</text>
              </svg>
            </Panel>
          </div>

          <Panel title="Synthesis, Analysis and Pharmacopoeial Validation" icon={FlaskConical}>
            <div className="mb-4 grid gap-3 md:grid-cols-4">
              {['Retrosynthesis', 'Intermediate', 'Purification', 'Validated assay'].map((stepName, index) => (
                <div key={stepName} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-xs font-black text-cyan-200">{index + 1}</span>
                    <p className="text-sm font-bold text-white">{stepName}</p>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Route risk, yield, scale, green chemistry, impurity control.</p>
                </div>
              ))}
            </div>
            <AnalysisGrid />
          </Panel>

          <div className="grid gap-4 xl:grid-cols-2">
            <Panel title="Biophysical Binding Methods" icon={BarChart3}>
              <div className="space-y-2">
                {biophysicalMethods.map(([method, signalName, output], index) => (
                  <div key={method} className="grid grid-cols-[82px_1fr] gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
                    <p className="text-sm font-black text-cyan-200">{method}</p>
                    <div>
                      <p className="text-sm font-bold text-white">{signalName}</p>
                      <p className="text-xs text-gray-500">{output}</p>
                      <MiniBar label="method fit" value={48 + index * 9} color={['#22d3ee', '#22c55e', '#a78bfa', '#f59e0b', '#fb7185'][index]} />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Clinical Chemistry Interpreter" icon={Brain}>
              <div className="space-y-2">
                {clinicalPanels.map(([panel, analytes, meaning]) => (
                  <div key={panel} className="rounded-xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-white">{panel}</p>
                      <PillBadge color="#fb7185">clinical</PillBadge>
                    </div>
                    <p className="mt-1 text-xs text-gray-300">{analytes}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{meaning}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </main>
      </div>
    </div>
  );
}

function RouteIcon(props) {
  return <ChevronRight {...props} />;
}
