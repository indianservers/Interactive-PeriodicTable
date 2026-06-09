export const learnerProfiles = [
  { id: 'school', label: 'School Student', focus: 'Grade 6-10 foundations, visual experiments, viva and worksheets', route: 'school-mastery', color: '#22c55e' },
  { id: 'senior', label: 'Senior Student', focus: 'Class 11-12 formulas, mechanisms, numericals and board revision', route: 'senior-core', color: '#38bdf8' },
  { id: 'entrance', label: 'Entrance Aspirant', focus: 'NEET/JEE timed sets, mistake notebook and mixed drills', route: 'practice-tutor', color: '#f59e0b' },
  { id: 'teacher', label: 'Teacher / Lab Mentor', focus: 'Assignments, worksheets, lab reports and classroom visual demos', route: 'learning-command', color: '#a78bfa' },
];

export const learningPathTemplates = [
  {
    id: 'grade10-board',
    title: 'Grade 10 Board Chemistry Sprint',
    audience: 'Class 10 / AP SSC / CBSE / IGCSE Bridge',
    duration: '21 days',
    route: 'school-mastery',
    milestones: ['Reactions and equations', 'Acids, bases and salts', 'Carbon compounds', 'Periodic classification', 'Practice and viva'],
    evidence: ['Chapter score >= 80%', '2 lab reports', '1 timed mock', 'Mistake notebook closed'],
  },
  {
    id: 'class12-physical',
    title: 'Class 12 Physical Chemistry Numericals',
    audience: 'AP Inter 2 / CBSE 12 / IB DP Bridge',
    duration: '18 days',
    route: 'senior-core',
    milestones: ['Solutions', 'Electrochemistry', 'Kinetics', 'Surface chemistry', 'Mixed numerical mock'],
    evidence: ['Formula sheet mastered', 'Graph interpretation set', 'Timed numerical drill >= 75%'],
  },
  {
    id: 'organic-mechanism',
    title: 'Organic Mechanism Visual Path',
    audience: 'Class 11-12 / UG Bridge',
    duration: '14 days',
    route: 'advanced-visuals',
    milestones: ['GOC stability', 'SN1/SN2', 'E1/E2', 'EAS', 'Carbonyl and named reactions'],
    evidence: ['Mechanism redraw', 'Reagent map', '3D stereochemistry check'],
  },
  {
    id: 'teacher-lab',
    title: 'Teacher Lab Demonstration Pack',
    audience: 'Classroom / Practical Lab',
    duration: '1 week',
    route: 'chemistry-inventor',
    milestones: ['Select demo', 'Assign pre-lab', 'Run virtual lab', 'Collect report', 'Review viva'],
    evidence: ['Printable worksheet', 'Observation table', 'Rubric score', 'Safety checklist'],
  },
];

export const teacherAssignmentTemplates = [
  {
    id: 'acid-base-lab',
    title: 'Acids, Bases and Salts Practical',
    classBand: 'Grade 7-10',
    route: 'school-mastery',
    deliverables: ['Pre-lab prediction', 'Indicator color table', 'pH observation sheet', '3 viva answers'],
    rubric: ['Correct setup', 'Observation accuracy', 'Inference quality', 'Safety language'],
  },
  {
    id: 'electrochem-mock',
    title: 'Electrochemistry Visual Mock',
    classBand: 'Class 12',
    route: 'senior-core',
    deliverables: ['Cell diagram', 'Nernst calculation', 'Ion/electron flow explanation', 'Error correction'],
    rubric: ['Formula choice', 'Substitution', 'Sign convention', 'Concept explanation'],
  },
  {
    id: 'mechanism-board',
    title: 'Organic Mechanism Board',
    classBand: 'Class 11-12 / UG Bridge',
    route: 'advanced-visuals',
    deliverables: ['Curved arrows', 'Intermediate stability note', 'Energy profile', '3D stereochemical outcome'],
    rubric: ['Arrow logic', 'Intermediate reasoning', 'Product prediction', 'Stereochemistry'],
  },
];

export const printableArtifacts = [
  { id: 'worksheet', title: 'Chapter Worksheet', detail: 'MCQ, assertion-reason, numericals, diagrams and short-answer prompts.', route: 'practice-tutor' },
  { id: 'lab-report', title: 'Lab Report Template', detail: 'Aim, apparatus, chemicals, procedure, observations, inference, safety and viva.', route: 'chemistry-inventor' },
  { id: 'formula-sheet', title: 'Formula and Reaction Sheet', detail: 'Physical formulae, organic reagents, inorganic trend cues and common tests.', route: 'senior-core' },
  { id: 'revision-plan', title: 'Revision Plan', detail: 'Daily milestones, weak-area loop, visual task, mock and recovery checklist.', route: 'learning-command' },
];

export const readinessChecklist = [
  { id: 'offline', title: 'Offline/PWA polish', status: 'Planned', detail: 'Cache core pages, icons, data modules and last-opened study path.' },
  { id: 'search', title: 'Universal search index', status: 'Ready for build', detail: 'Index pages, modules, chapters, formulae, reactions, tools and visual tasks.' },
  { id: 'accessibility', title: 'Accessibility pass', status: 'In progress', detail: 'Keyboard navigation, contrast, reduced motion and readable compact cards.' },
  { id: 'performance', title: 'Performance code-splitting', status: 'Needed', detail: 'Split large route pages and heavy Three.js modules into lazy chunks.' },
  { id: 'teacher', title: 'Teacher classroom mode', status: 'Ready for build', detail: 'Assignments, rubrics, printable worksheets and demo playlists.' },
  { id: 'progress', title: 'Student progress tracking', status: 'Ready for build', detail: 'Track chapter completion, mistakes, flashcards, mocks and visual tasks.' },
];

export const commandCenterStats = {
  profiles: learnerProfiles.length,
  paths: learningPathTemplates.length,
  assignments: teacherAssignmentTemplates.length,
  artifacts: printableArtifacts.length,
  readiness: readinessChecklist.length,
};
