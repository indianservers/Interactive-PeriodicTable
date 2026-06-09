export const practiceTracks = [
  { id: 'school', label: 'Grade 6-10', focus: 'School mastery, practical viva and board-style science questions', color: '#22c55e' },
  { id: 'senior', label: 'Class 11-12', focus: 'Board, AP Inter, CBSE, IGCSE extension and IB DP chemistry practice', color: '#38bdf8' },
  { id: 'entrance', label: 'NEET / JEE Bridge', focus: 'Timed numericals, organic mechanisms, assertion-reason and mixed concept drills', color: '#f59e0b' },
];

export const practiceModes = [
  { id: 'adaptive', label: 'Adaptive Drill', detail: 'Short practice set that shifts toward weak areas.' },
  { id: 'mock', label: 'Timed Mock', detail: 'Exam-style paper with marks, time and review route.' },
  { id: 'mistakes', label: 'Mistake Notebook', detail: 'Common errors with remediation and visual links.' },
  { id: 'flashcards', label: 'Flashcards', detail: 'Formulae, reactions, tests and definitions.' },
  { id: 'tutor', label: 'Tutor Coach', detail: 'Step-by-step explanation prompts and next actions.' },
];

export const practiceQuestionSets = [
  {
    id: 'school-reactions',
    track: 'school',
    domain: 'School Chemistry',
    title: 'Reactions, Acids and Carbon Compounds',
    mode: 'adaptive',
    time: 12,
    marks: 20,
    route2d: 'balancer',
    route3d: 'chemistry-inventor',
    questions: [
      { type: 'MCQ', prompt: 'Which observation confirms a gas-evolution reaction?', answer: 'Bubbling with a product gas test', skill: 'Observation' },
      { type: 'Assertion-Reason', prompt: 'Rancidity is prevented by nitrogen flushing because oxidation slows without oxygen.', answer: 'Both true and reason explains assertion', skill: 'Daily-life chemistry' },
      { type: 'Viva', prompt: 'Why is plaster of Paris stored in moisture-proof containers?', answer: 'It reacts with water and hardens to gypsum', skill: 'Important salts' },
      { type: 'Numerical', prompt: 'Balance Fe + H2O -> Fe3O4 + H2.', answer: '3Fe + 4H2O -> Fe3O4 + 4H2', skill: 'Equation balancing' },
    ],
  },
  {
    id: 'senior-physical',
    track: 'senior',
    domain: 'Physical Chemistry',
    title: 'Mole, Thermodynamics, Equilibrium and Electrochemistry',
    mode: 'mock',
    time: 35,
    marks: 60,
    route2d: 'lab',
    route3d: 'physical-simulators',
    questions: [
      { type: 'Numerical', prompt: 'Find osmotic pressure of 0.1 M glucose at 300 K.', answer: 'pi = CRT = 0.1 x 0.0821 x 300 atm', skill: 'Colligative properties' },
      { type: 'Graph', prompt: 'Identify reaction order from a straight line ln[A] vs time.', answer: 'First order', skill: 'Kinetics graph' },
      { type: 'Reasoning', prompt: 'Increasing pressure favors which side in N2 + 3H2 <=> 2NH3?', answer: 'Product side because gas moles decrease', skill: 'Equilibrium' },
      { type: 'Numerical', prompt: 'Calculate Ecell if Ecathode = 0.34 V and Eanode = -0.76 V.', answer: '1.10 V', skill: 'Electrochemistry' },
    ],
  },
  {
    id: 'senior-organic',
    track: 'senior',
    domain: 'Organic Chemistry',
    title: 'GOC, Mechanisms and Functional Groups',
    mode: 'adaptive',
    time: 25,
    marks: 40,
    route2d: 'organic-named-reactions',
    route3d: 'organic-reaction-visualizer',
    questions: [
      { type: 'Product', prompt: 'Predict product of 2-bromobutane with alcoholic KOH.', answer: 'Major alkene by elimination', skill: 'E1/E2' },
      { type: 'Mechanism', prompt: 'Why does SN2 invert configuration?', answer: 'Backside attack displaces leaving group in one concerted step', skill: 'Stereochemistry' },
      { type: 'Test', prompt: 'Which test distinguishes aldehyde from ketone?', answer: "Tollens' or Fehling's test", skill: 'Functional tests' },
      { type: 'Reasoning', prompt: 'Why does phenol show ortho/para substitution?', answer: 'Oxygen donates electron density by resonance', skill: 'EAS directing effect' },
    ],
  },
  {
    id: 'entrance-mixed',
    track: 'entrance',
    domain: 'Mixed Entrance Drill',
    title: 'JEE/NEET Mixed Chemistry Sprint',
    mode: 'mock',
    time: 45,
    marks: 80,
    route2d: 'chemistry-solver',
    route3d: 'advanced-visuals',
    questions: [
      { type: 'Numerical', prompt: 'Use Nernst equation to compare two concentration cells.', answer: 'Apply E = 0.0591/n log(Ccathode/Canode)', skill: 'Electrochemistry' },
      { type: 'Organic', prompt: 'Rank carbocation stability with resonance and hyperconjugation.', answer: 'Resonance-stabilized > tertiary > secondary > primary', skill: 'GOC' },
      { type: 'Inorganic', prompt: 'Predict magnetic moment for d5 high-spin complex.', answer: 'sqrt(35) BM approximately 5.92 BM', skill: 'Coordination' },
      { type: 'Physical', prompt: 'Half-life independent of initial concentration indicates which order?', answer: 'First order', skill: 'Kinetics' },
    ],
  },
];

export const mistakePatterns = [
  { id: 'unit-conversion', title: 'Unit conversion slips', symptom: 'Wrong answer despite correct formula', fix: 'Write units below every substituted value, then cancel before calculating.', route: 'school-mastery' },
  { id: 'sign-convention', title: 'Thermodynamic sign confusion', symptom: 'Delta H, w or Delta G sign reversed', fix: 'Mark system perspective first; heat absorbed and work on system are positive in chemistry convention.', route: 'senior-core' },
  { id: 'organic-reagent', title: 'Reagent-product mismatch', symptom: 'Correct functional group but wrong product', fix: 'Classify reagent as oxidant, reductant, nucleophile, electrophile, acid/base or dehydrating agent.', route: 'organic-reaction-visualizer' },
  { id: 'inorganic-trend', title: 'Trend exception missed', symptom: 'Periodic trend answer ignores anomaly', fix: 'Check first-element anomaly, d/f contraction, inert pair effect and diagonal relationship.', route: 'senior-core' },
  { id: 'graph-reading', title: 'Graph axis mistake', symptom: 'Correct concept but wrong graph conclusion', fix: 'Read axis labels before deciding slope/intercept; write the linear equation form.', route: 'physical-simulators' },
];

export const flashcardDecks = [
  {
    id: 'formulae',
    title: 'Formulae',
    cards: ['n = m/M', 'Delta G = Delta H - T Delta S', 'E = E deg - 0.0591/n log Q', 't1/2 = 0.693/k', 'pH = -log[H+]'],
  },
  {
    id: 'organic-tests',
    title: 'Organic Tests',
    cards: ["Tollens' test: aldehyde", 'Lucas test: alcohol class', 'Iodoform: CH3CO- or CH3CH(OH)-', '2,4-DNP: carbonyl', 'Baeyer: unsaturation'],
  },
  {
    id: 'inorganic',
    title: 'Inorganic Cues',
    cards: ['d-d transitions give color', 'Lanthanide contraction affects size', 'High spin has more unpaired electrons', 'Amphoteric oxides react with acid and base', 'Inert pair effect rises down p-block'],
  },
];

export const tutorPrompts = [
  { id: 'explain', title: 'Explain Stepwise', prompt: 'Break this problem into known data, formula, substitution, calculation and final check.' },
  { id: 'visual', title: 'Visual Hint', prompt: 'Show which 2D or 3D visual can make this concept easier.' },
  { id: 'mistake', title: 'Find Mistake', prompt: 'Compare the attempted answer with the rule and identify the first wrong step.' },
  { id: 'exam', title: 'Exam Shortcut', prompt: 'Give the fastest reliable board/entrance method and one trap to avoid.' },
];

export const practiceStats = {
  sets: practiceQuestionSets.length,
  questions: practiceQuestionSets.reduce((total, set) => total + set.questions.length, 0),
  mistakes: mistakePatterns.length,
  flashcards: flashcardDecks.reduce((total, deck) => total + deck.cards.length, 0),
};

export const getPracticeSets = (track = 'senior') => practiceQuestionSets.filter(set => set.track === track);
