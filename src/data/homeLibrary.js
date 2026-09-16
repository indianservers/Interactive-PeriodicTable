import { upcomingExperiences } from "./upcomingExperiences.js";
import { syllabusInteractives, syllabusConcepts } from "../modules/core-simulations/syllabusInteractiveModel.js";

// Home library: existing entries point to App routes; upcoming entries are
// displayed as planned, non-navigable scaffolds.
const group = (name, entries) => ({
  name,
  entries: entries.map(([id, title, description, path, meta = {}]) => ({
    id,
    title,
    description,
    path: path || id,
    ...meta,
  })),
});
const baseChemistryCategories = [
  {
    id: "bsc-cbcs",
    title: "B.Sc CBCS 2026–27",
    icon: "simulation",
    color: "#7ee0a3",
    description: "RBVRR / Osmania practicals and theory interactives.",
    groups: [
      group(
        "College practicals",
        syllabusInteractives.map((item) => [
          item.id,
          item.title,
          item.description,
          `simulations/${item.id}`,
        ]),
      ),
      group(
        "Theory simulations",
        syllabusConcepts.map((item) => [
          item.id,
          item.title,
          item.description,
          `simulations/${item.id}`,
        ]),
      ),
    ],
  },
  {
    id: "simulators",
    title: "Simulators & labs",
    icon: "simulation",
    color: "#45d8ff",
    description: "Change a variable. See chemistry happen.",
    groups: [
      group("Physical chemistry", [
        [
          "physical-simulators",
          "Physical Chemistry Simulators",
          "Argon dynamics, gas compression and thermodynamic charts",
          "modules/physical",
        ],
        [
          "molecular-dynamics",
          "Molecular Dynamics Laboratory",
          "Build and run an argon simulation, analyse transport, and map phase behaviour",
          "physical-chemistry/molecular-dynamics",
        ],
        [
          "real-gas-laws",
          "Real Gas Laws Studio",
          "Compare equations of state, critical behavior, and Joule–Thomson expansion",
          "physical-chemistry/real-gas-laws",
        ],
        [
          "statistical-thermodynamics",
          "Statistical Thermodynamics Laboratory",
          "Count microstates, calculate molecular partition functions, and derive thermodynamic properties",
          "physical-chemistry/statistical-thermodynamics",
        ],
        [
          "thermodynamics",
          "Thermodynamics Laboratory",
          "Balance heat and work, follow P–V paths, and analyze entropy and Gibbs energy",
          "physical-chemistry/thermodynamics",
        ],
        [
          "viscosity-poiseuille",
          "Viscosity & Poiseuille Laboratory",
          "Measure capillary flow, model temperature dependence, and determine polymer molecular weight",
          "physical-chemistry/viscosity-poiseuille",
        ],
        [
          "tafel-plot",
          "Tafel Plot & Corrosion Laboratory",
          "Build a three-electrode cell, record polarization, and determine corrosion kinetics",
          "simulations/tafel-plot",
        ],
        [
          "gas-properties",
          "Gas Properties",
          "Explore pressure, volume and temperature",
          "simulations/gas-properties",
        ],
        [
          "states-matter",
          "States of Matter",
          "Compare solids, liquids and gases",
          "simulations/states-matter",
        ],
        [
          "beer-lambert-law",
          "Beer–Lambert Laboratory",
          "Prepare standards, measure absorbance and determine an unknown",
          "simulations/beer-lambert-law",
        ],
        [
          "neutralisation-calorimetry",
          "Neutralisation Calorimetry",
          "Calibrate a coffee-cup calorimeter and measure reaction enthalpy",
          "simulations/neutralisation-calorimetry",
        ],
        [
          "physical-chemistry-vl",
          "Physical Chemistry Virtual Lab",
          "10 benchmark experiments: spectroscopy, colligative properties, EMF, adsorption and calorimetry",
          "lab",
        ],
      ]),
      group("Reactions & solutions", [
        [
          "acid-base-solutions",
          "Acid–Base Solutions",
          "Explore pH, acids, bases and conductivity",
          "simulations/acid-base-solutions",
        ],
        [
          "reaction-leftovers",
          "Reactants & Leftovers",
          "Explore limiting reactants and stoichiometry",
          "simulations/reaction-leftovers",
        ],
        ["lab", "Virtual Lab", "Set up and run virtual chemistry experiments"],
      ]),
      group("Atoms & interactions", [
        [
          "atom-builder",
          "Build an Atom",
          "Assemble protons, neutrons and electrons",
          "simulations/atom-builder",
        ],
        [
          "molecule-polarity",
          "Molecule Polarity",
          "Investigate bonds, dipoles and molecular shape",
          "simulations/molecule-polarity",
        ],
        [
          "molecules-light",
          "Molecules & Light",
          "Explore how molecules interact with radiation",
          "simulations/molecules-light",
        ],
      ]),
    ],
  },
  {
    id: "elements",
    title: "Elements & foundations",
    icon: "periodic",
    color: "#a695ff",
    description: "Start with atoms, elements and their patterns.",
    groups: [
      group("Periodic table", [
        [
          "table",
          "Periodic Table",
          "Browse all 118 elements and their properties",
        ],
        [
          "trends",
          "Periodic Trends",
          "Explore how properties change across the table",
        ],
        [
          "compare",
          "Compare Elements",
          "Compare element properties side by side",
        ],
      ]),
      group("Atomic structure", [
        [
          "atom",
          "Atomic Explorer",
          "Inspect atomic structure and electron arrangements",
        ],
      ]),
    ],
  },
  {
    id: "organic",
    title: "Organic chemistry",
    icon: "organic",
    color: "#e28cff",
    description: "Follow mechanisms. Build carbon chemistry.",
    groups: [
      group("Reactions & synthesis", [
        [
          "organic-reaction-visualizer",
          "Organic Reaction Visualizer",
          "Explore organic transformations",
          "modules/organic-reactions",
        ],
        [
          "chromatography-separation",
          "Chromatography Separation Laboratory",
          "Optimize TLC, pack a silica column, collect and analyze fractions",
          "simulations/chromatography-separation",
        ],
        [
          "distillation-crystallisation",
          "Distillation & Crystallisation Laboratory",
          "Run fractional and steam distillation, then purify a crystalline product",
          "simulations/distillation-crystallisation",
        ],
        [
          "bromination-phenol-aniline",
          "Bromination of Phenol and Aniline",
          "Run aqueous bromination of phenol, aniline and protected aniline",
          "simulations/bromination-phenol-aniline",
        ],
        [
          "benzoylation-aniline-phenol",
          "Benzoylation of Aniline and Phenol",
          "Schotten–Baumann benzoylation to benzanilide and phenyl benzoate",
          "simulations/benzoylation-aniline-phenol",
        ],
        [
          "organic-mechanisms",
          "Mechanism Player",
          "Follow electron movement step by step",
          "visuals/organic/mechanisms",
        ],
        [
          "organic-named-reactions",
          "Named Reactions",
          "Explore the classic transformations",
          "visuals/organic/named-reactions",
        ],
        [
          "retrosynthesis-planner",
          "Retrosynthesis Planner",
          "Work backwards from a target molecule",
          "modules/retrosynthesis",
        ],
      ]),
      group("Structure & identification", [
        [
          "organic-visuals",
          "Organic Visuals",
          "Explore organic structures and concepts",
          "visuals/organic",
        ],
        [
          "organic-isomerism",
          "Isomerism Explorer",
          "Compare structural and stereochemical isomers",
          "visuals/organic/isomerism",
        ],
        [
          "iupac-nomenclature",
          "IUPAC Nomenclature",
          "Practice naming organic compounds",
          "modules/iupac",
        ],
        [
          "organic-functional-tests",
          "Functional Group Tests",
          "Identify organic functional groups",
          "visuals/organic/functional-tests",
        ],
        [
          "organic-polymers",
          "Polymer Builder",
          "Explore monomers and polymerization",
          "visuals/organic/polymers",
        ],
        [
          "organic-chemistry-vl",
          "Organic Chemistry Virtual Lab",
          "10 benchmark experiments: functional groups, separations, preparations, estimations and λmax",
          "lab",
        ],
      ]),
    ],
  },
  {
    id: "inorganic",
    title: "Inorganic chemistry",
    icon: "crystal",
    color: "#6baaff",
    description: "Discover complexes, crystals and materials.",
    groups: [
      group("Coordination & materials", [
        [
          "inorganic-deep-module",
          "Inorganic Chemistry Module",
          "Explore inorganic structures and bonding",
          "modules/inorganic",
        ],
        [
          "inorganic-coordination",
          "Coordination & CFT",
          "Visualize complexes and crystal field splitting",
          "visuals/inorganic/coordination",
        ],
        [
          "inorganic-crystals",
          "Crystal Structures",
          "Inspect unit cells and crystal arrangements",
          "visuals/inorganic/crystals",
        ],
      ]),
      group("Elements & analysis", [
        [
          "inorganic-visuals",
          "Inorganic Visuals",
          "Browse inorganic chemistry visual lessons",
          "visuals/inorganic",
        ],
        [
          "inorganic-salt-analysis",
          "Salt Analysis",
          "Explore qualitative analysis of salts",
          "visuals/inorganic/salt-analysis",
        ],
        [
          "inorganic-metallurgy",
          "Metallurgy",
          "Follow metal extraction processes",
          "visuals/inorganic/metallurgy",
        ],
        [
          "inorganic-pblock",
          "p-Block Reference",
          "Explore p-block elements and compounds",
          "visuals/inorganic/p-block",
        ],
        [
          "inorganic-chemistry-vl",
          "Inorganic Chemistry Virtual Lab",
          "10 benchmark experiments: water, titration, gravimetry, CFT, group theory, alloy and soil analysis",
          "lab",
        ],
      ]),
    ],
  },
  {
    id: "biochemistry",
    title: "Biochemistry",
    icon: "dna",
    color: "#61e2b3",
    description: "Explore the molecules and processes of life.",
    groups: [
      group("Biomolecules", [
        [
          "biochemistry-module",
          "Biochemistry Module",
          "Study the chemistry of living systems",
          "modules/biochemistry",
        ],
        [
          "bio-visuals",
          "Biochemistry Visuals",
          "Explore biological molecules in context",
          "visuals/bio",
        ],
        [
          "bio-proteins",
          "Proteins & Enzymes",
          "Explore folding, structure and catalysis",
          "visuals/bio/proteins",
        ],
        [
          "bio-carbohydrates",
          "Carbohydrates",
          "Inspect sugars and carbohydrate structures",
          "visuals/bio/carbohydrates",
        ],
      ]),
      group("Cells & energy", [
        [
          "bio-membranes",
          "Lipids & Membranes",
          "Explore membranes and lipid assemblies",
          "visuals/bio/membranes",
        ],
        [
          "bio-nucleic-acids",
          "DNA & RNA",
          "Explore nucleic acids and their structures",
          "visuals/bio/nucleic-acids",
        ],
        [
          "bio-metabolism",
          "Metabolism & ATP",
          "Follow pathways and energy transfer",
          "visuals/bio/metabolism",
        ],
      ]),
    ],
  },
  {
    id: "pharma",
    title: "Pharmaceutical chemistry",
    icon: "drug",
    color: "#ffc782",
    description: "Connect molecular design with medicines.",
    groups: [
      group("Discovery & delivery", [
        [
          "drug-discovery",
          "Drug Discovery",
          "Explore molecular design and drug candidates",
        ],
        [
          "pharma-visuals",
          "Pharma Visuals",
          "Browse pharmaceutical chemistry concepts",
          "visuals/pharma",
        ],
        [
          "pharma-adme",
          "ADME & Ionization",
          "Explore absorption, distribution and metabolism",
          "visuals/pharma/adme",
        ],
        [
          "pharma-dosage",
          "Dosage Forms",
          "Explore formulations and drug delivery",
          "visuals/pharma/dosage",
        ],
      ]),
      group("Analysis & safety", [
        [
          "pharma-qc",
          "Assay & Quality Control",
          "Explore pharmaceutical analysis",
          "visuals/pharma/qc",
        ],
        [
          "pharma-buffers",
          "Pharmaceutical Buffers",
          "Explore buffer systems and formulation pH",
          "visuals/pharma/buffers",
        ],
        [
          "pharma-toxicology",
          "Toxicology & Chelation",
          "Study toxicity and chelation concepts",
          "visuals/pharma/toxicology",
        ],
      ]),
    ],
  },
  {
    id: "analytical",
    title: "Analytical chemistry",
    icon: "research",
    color: "#f4b860",
    description: "Measure, separate and identify chemical substances.",
    groups: [
      group("Advanced analysis", [
        [
          "flame-photometry",
          "Flame Photometry Laboratory",
          "Prepare standards, optimize a flame, resolve emission lines and determine an unknown",
          "simulations/flame-photometry",
        ],
        [
          "gravimetric-precipitation",
          "Gravimetric Precipitation Laboratory",
          "Precipitate sulfate, digest, filter, wash and determine it by constant mass",
          "simulations/gravimetric-precipitation",
        ],
        [
          "polarography-concentration",
          "Polarography Concentration Laboratory",
          "Record diffusion waves and determine cadmium by calibration",
          "simulations/polarography-concentration",
        ],
        [
          "soil-ph-conductivity",
          "Soil pH & Conductivity Laboratory",
          "Prepare soil extracts, calibrate sensors, and interpret field variability",
          "simulations/soil-ph-conductivity",
        ],
        [
          "advanced-analytical-chemistry-vl",
          "Advanced Analytical Chemistry Virtual Lab",
          "8 benchmark experiments: soil analysis, electrogravimetry, phosphate, flame photometry and polarography",
          "lab",
        ],
      ]),
    ],
  },
  {
    id: "explore",
    title: "3D, tools & research",
    icon: "orbital",
    color: "#59def1",
    description: "Visualize, create, solve and investigate.",
    groups: [
      group("3D & symmetry", [
        [
          "molecule",
          "3D Molecule Explorer",
          "Rotate and inspect molecular structures",
        ],
        [
          "symmetry",
          "Molecular Symmetry",
          "Visualize symmetry and point groups",
          "molecular-symmetry",
        ],
        [
          "symmetry-operations",
          "Symmetry Operations",
          "Explore rotations, reflections and inversion",
          "molecular-symmetry/operations",
        ],
        [
          "symmetry-point-groups",
          "Point Groups",
          "Classify molecular symmetry",
          "molecular-symmetry/point-groups",
        ],
        [
          "ar-vr-mr",
          "Immersive Chemistry",
          "Explore chemistry in AR, VR and MR",
        ],
      ]),
      group("Create & solve", [
        [
          "chemistry-inventor",
          "Chemistry Inventor",
          "Build and explore chemistry ideas",
        ],
        [
          "structure-draw",
          "Structure Draw",
          "Draw molecules and reactions in Ketcher",
          "draw",
        ],
        [
          "chemistry-solver",
          "Chemistry Solver",
          "Explore chemical problems and solutions",
        ],
        ["balancer", "Equation Balancer", "Balance chemical equations"],
      ]),
      group("Visuals & research", [
        [
          "chemistry-visuals",
          "Chemistry Visual Library",
          "Browse visual experiments across chemistry",
          "visuals",
        ],
        [
          "advanced-visuals",
          "Advanced Visual Chemistry",
          "Explore advanced chemistry visualizations",
        ],
        [
          "spectroscopy-interpreter",
          "Spectroscopy Interpreter",
          "Inspect spectra and molecular signals",
          "modules/spectroscopy",
        ],
        [
          "research-toolkit",
          "Research Toolkit",
          "Explore data analysis and research workflows",
        ],
      ]),
    ],
  },
  {
    id: "learn",
    title: "Learn & practice",
    icon: "learn",
    color: "#9daeff",
    description: "Find your level. Build lasting understanding.",
    groups: [
      group("Courses & curriculum", [
        [
          "syllabus",
          "Learning Paths",
          "Follow a structured chemistry learning path",
        ],
        [
          "school-mastery",
          "School Chemistry",
          "Build foundations with school-level topics",
        ],
        [
          "senior-core",
          "Senior Chemistry",
          "Explore senior chemistry concepts",
        ],
        [
          "subject-modules",
          "Subject Modules",
          "Browse deeper subject-based workspaces",
          "modules",
        ],
        [
          "coverage-audit",
          "Curriculum Map",
          "Review topic and curriculum coverage",
        ],
      ]),
      group("Practice & resources", [
        ["quiz", "Challenge Lab", "Test your chemistry knowledge"],
        [
          "practice-tutor",
          "Practice, Exams & Tutor",
          "Practice questions and prepare for exams",
        ],
        [
          "symmetry-practice",
          "Symmetry Practice",
          "Practice point groups and symmetry",
          "molecular-symmetry/practice",
        ],
        [
          "symmetry-teaching",
          "Symmetry Teaching",
          "Explore symmetry teaching resources",
          "molecular-symmetry/teaching",
        ],
        ["study-tools", "Study Toolkit", "Use learning and revision resources"],
        ["favorites", "Saved Chemistry", "Return to saved chemistry resources"],
        [
          "learning-command",
          "Learning Command Center",
          "Plan and review your learning",
        ],
      ]),
    ],
  },
];
export const chemistryCategories = baseChemistryCategories.map((category) => {
  const planned = upcomingExperiences.filter(
    (item) => item.category === category.id,
  );
  const plannedGroups = [...new Set(planned.map((item) => item.subgroup))].map(
    (subgroup) =>
      group(
        subgroup,
        planned
          .filter((item) => item.subgroup === subgroup)
          .map((item) => [
            item.id,
            item.title,
            item.description,
            item.path,
            { upcoming: true, kind: item.kind },
          ]),
      ),
  );
  return { ...category, groups: [...category.groups, ...plannedGroups] };
});
export const libraryEntries = chemistryCategories.flatMap((c) =>
  c.groups.flatMap((g) =>
    g.entries.map((e) => ({
      ...e,
      category: c.id,
      categoryTitle: c.title,
      subgroup: g.name,
      icon: c.icon,
      color: c.color,
    })),
  ),
);
