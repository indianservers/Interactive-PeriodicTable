// Named, implemented destinations shared by the library, directories and search.
const workspace = (category, subject, prefix, rows) => rows.map(([slug,title]) => ({
  id:`${prefix}/${slug}`, path:`${prefix}/${slug}`, title, category, subject,
  description:`Open the ${title} workspace.`, kind:'Workspace',
}));
export const additionalExperiences = [
  ...workspace('simulators','Physical','modules/physical',[
    ['molecular-dynamics','Molecular Dynamics workspace'],['real-gas-laws','Real Gas Laws workspace'],['thermodynamics','Carnot Cycle Laboratory'],['statistical-thermodynamics','Boltzmann Population Explorer'],['chemical-kinetics','Chemical Kinetics'],['chemical-equilibrium','Chemical Equilibrium'],['phase-equilibrium','Phase Equilibrium'],['solutions-colligative-properties','Solutions & Colligative Properties'],['electrochemistry','Electrochemistry'],['quantum-chemistry','Quantum Chemistry'],['molecular-spectroscopy','Molecular Spectroscopy'],['surface-chemistry','Surface Chemistry'],['photochemistry','Photochemistry'],['transport-phenomena','Transport Phenomena'],
  ]),
  ...workspace('pharma','Pharmaceutical','drug-discovery',[
    ['home','Drug Discovery Home'],['targets','Drug Targets'],['screening','Virtual Screening'],['design','Molecular Design'],['adme','Drug Discovery ADME & PK'],['team','Discovery Team'],['safety','Safety & Toxicity'],['notebooks','Discovery Notebooks'],['analytics','Data & Analytics'],
  ]),
  ...workspace('biochemistry','Biochemistry','visuals/bio/carbohydrates',[
    ['reactions','Carbohydrates: Reactions'],['biology','Carbohydrates: Biology'],['quizzes','Carbohydrates: Quizzes'],['properties','Carbohydrates: Properties'],
  ]),
  ...workspace('biochemistry','Biochemistry','visuals/bio/nucleic-acids',[
    ['molecules','Nucleic Acids: Molecules'],['sequences','Nucleic Acids: Sequences'],['nucleotide-builder','Nucleotide Builder'],['replication','DNA Replication'],['transcription','RNA Transcription'],['comparative','Nucleic Acids: Comparative View'],['learn','Nucleic Acids: Learn'],['gallery','Nucleic Acids: 3D Gallery'],['quizzes','Nucleic Acids: Quizzes'],
  ]),
  ...[
    ['dashboard','Dashboard','dashboard','explore'],['table','Periodic Table','table','explore'],['trends','Periodic Trends','trends','explore'],['compare','Compare Elements','compare','explore'],['atom','Atom Visualizer','atom','explore'],['settings','Settings','settings','learn'],['library','Chemistry Library','library','explore'],
    ['physical-chemistry','Physical Chemistry subject home','physical-chemistry','simulators'],['organic-chemistry','Organic Chemistry subject home','organic-chemistry','organic'],['inorganic-chemistry','Inorganic Chemistry subject home','inorganic-chemistry','inorganic'],['analytical-chemistry','Analytical Chemistry subject home','analytical-chemistry','analytical'],
    ['pharma-studio','Pharmaceutical Lab Home','visuals/pharma/lab','pharma'],['titration-lab','Acid–Base Titration Bench','lab/titration','analytical'],
    ['chemistry-solver-questions','Chemistry Solver Questions','chemistry-solver/questions','learn'],['chemistry-solver-bookmarks','Chemistry Solver Bookmarks','chemistry-solver/bookmarks','learn'],['chemistry-solver-practice','Chemistry Solver Practice','chemistry-solver/practice','learn'],
  ].map(([id,title,path,category])=>({id,title,path,category,description:`Open ${title}.`})),
];
