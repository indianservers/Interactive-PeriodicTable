import { libraryEntries, chemistryCategories } from './homeLibrary.js';
import { catalogDates } from './catalogDates.js';

export const learningPaths = [
  { id: 'foundations', title: 'From atoms to molecules', level: 'Beginner', interest: 'elements', description: 'Build an atom, discover periodic patterns, then explore bonding and shape.', steps: ['atom-builder', 'table', 'trends', 'molecule-polarity', 'molecule'] },
  { id: 'reactions', title: 'Make sense of reactions', level: 'Beginner', interest: 'organic', description: 'Start with balanced equations and quantities before following electron movement.', steps: ['balancer', 'reaction-leftovers', 'acid-base-solutions', 'organic-mechanisms'] },
  { id: 'analysis', title: 'Think like an analytical chemist', level: 'Intermediate', interest: 'analytical', description: 'Connect concentration, absorbance, separation and identification.', steps: ['beer-lambert-law', 'chromatography-separation', 'spectroscopy-interpreter'] },
  { id: 'life', title: 'The chemistry of life', level: 'Intermediate', interest: 'biochemistry', description: 'Explore molecular structures before investigating proteins and genetic material.', steps: ['molecule', 'bio-carbohydrates', 'bio-proteins', 'bio-nucleic-acids'] },
  { id: 'research', title: 'From structure to discovery', level: 'Advanced', interest: 'pharma', description: 'Create structures, inspect targets and explore drug discovery workflows.', steps: ['structure-draw', 'symmetry', 'drug-discovery', 'research-toolkit'] },
];

const aliases = {
  'inorganic-salt-analysis': ['salt', 'NaCl', 'sodium chloride', 'ions', 'qualitative analysis'],
  'inorganic-crystals': ['salt', 'NaCl', 'sodium chloride', 'lattice', 'unit cell'],
  'reaction-leftovers': ['stoichiometry', 'limiting reagent', 'moles'],
  'balancer': ['stoichiometry', 'chemical equation', 'balance reactions'],
  'acid-base-solutions': ['pH', 'HCl', 'NaOH', 'hydrochloric acid', 'sodium hydroxide'],
  'molecule': ['H2O', 'water', 'CO2', 'carbon dioxide', 'molecular structure'],
  'spectroscopy-interpreter': ['NMR', 'IR', 'infrared', 'spectra'],
  'beer-lambert-law': ['UV', 'visible', 'absorbance', 'concentration'],
};
const foundationIds = new Set(['atom-builder','table','atom','trends','compare','balancer','reaction-leftovers','gas-properties','states-matter','molecule-polarity','acid-base-solutions','molecules-light','school-mastery','syllabus']);
const advancedIds = new Set(['drug-discovery','research-toolkit','advanced-visuals','retrosynthesis-planner','statistical-thermodynamics','tafel-plot','molecular-dynamics','symmetry-teaching']);
const referenceIds = new Set(['table','trends','compare','syllabus','inorganic-pblock','organic-named-reactions','subject-modules','coverage-audit','favorites','study-tools','learning-command']);
const practiceIds = new Set(['quiz','practice-tutor','symmetry-practice','school-mastery','senior-core','iupac-nomenclature']);
const categoryPrerequisites = { organic:['reaction-leftovers','molecule'], inorganic:['table','molecule-polarity'], biochemistry:['molecule'], pharma:['organic-mechanisms'], analytical:['reaction-leftovers'], explore:['atom-builder'], 'bsc-cbcs':['balancer'], simulators:['atom-builder'] };
const prerequisites = { 'beer-lambert-law':['reaction-leftovers'], 'chromatography-separation':['molecule-polarity'], 'drug-discovery':['structure-draw','bio-proteins'], 'molecular-dynamics':['gas-properties'], 'statistical-thermodynamics':['thermodynamics'], 'spectroscopy-interpreter':['molecules-light','beer-lambert-law'], 'retrosynthesis-planner':['organic-mechanisms'], 'tafel-plot':['balancer'] };
// Suggested levels: foundations have no prerequisite; intermediate activities use
// one prior topic; advanced activities combine theory, modelling or research tools.
export const discoveryEntries = libraryEntries.map(entry => {
  const level = foundationIds.has(entry.id) ? 'Beginner' : advancedIds.has(entry.id) ? 'Advanced' : 'Intermediate';
  const type = referenceIds.has(entry.id) ? 'Reference' : practiceIds.has(entry.id) ? 'Practice' : /simulations\/|physical-chemistry\/|lab|simulator/i.test(`${entry.path} ${entry.title} ${entry.kind || ''}`) ? 'Simulation' : 'Visualization';
  return { ...entry, level, type, aliases: [...(entry.aliases || []), ...(aliases[entry.id] || [])], objective: entry.description.replace(/\.$/, '') + '.', prerequisites: level === 'Beginner' ? [] : (prerequisites[entry.id] || categoryPrerequisites[entry.category] || ['table']).filter(id => id !== entry.id), addedAt: catalogDates[entry.id] || null };
});
export const findExperience = id => discoveryEntries.find(entry => entry.id === id);
export const subjectGuides = Object.fromEntries(chemistryCategories.map(subject => [subject.id, {
  ...subject,
  introduction: `${subject.description} Explore ${subject.groups.map(group => group.name.toLowerCase()).join(', ')} through focused activities.`,
  startingPoints: discoveryEntries.filter(entry => entry.category === subject.id && !entry.upcoming).sort((a,b) => ['Beginner','Intermediate','Advanced'].indexOf(a.level) - ['Beginner','Intermediate','Advanced'].indexOf(b.level)).slice(0,3).map(entry => entry.id),
}]));
