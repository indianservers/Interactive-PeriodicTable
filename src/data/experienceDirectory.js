import { libraryEntries } from './homeLibrary.js';
import { completedVirtualLabs } from './completedVirtualLabs.js';
import { BIOCHEMISTRY_VIRTUAL_LABS } from './biochemistryVirtualLabs.js';

// The directory reuses implemented experiences, rather than a separate mock list.
const available = libraryEntries.filter(entry => !entry.upcoming);
const unique = entries => [...new Map(entries.map(entry => [entry.id, entry])).values()];
const collectionIds = new Set(['virtual-labs', 'lab', 'physical-chemistry-vl', 'organic-chemistry-vl', 'inorganic-chemistry-vl', 'advanced-analytical-chemistry-vl']);
const subjects = new Map(completedVirtualLabs.map(lab=>[lab.id,lab.subject]));
export const studioEntries = unique(available.filter(entry =>
  !collectionIds.has(entry.id) &&
  entry.category !== 'bsc-cbcs' && !entry.id.startsWith('biochemistry-labs/')
));
export const labEntries = unique([
  { id: 'symmetry-operations', title: 'Symmetry Operations Lab', description: 'MOLSYM: explore identity, rotation, reflection, inversion and improper rotation with live molecules and atom mapping.', subject: 'Molecular symmetry', path: 'molecular-symmetry/operations' },
  ...available.filter(entry => ['symmetry', 'symmetry-point-groups', 'symmetry-practice', 'symmetry-teaching'].includes(entry.id)).map(entry => ({ ...entry, subject: 'Molecular symmetry' })),
  ...completedVirtualLabs.map(lab => ({ ...lab, path: available.find(entry => entry.id === lab.id)?.path || lab.route })),
  ...available.filter(entry => ['simulators', 'bsc-cbcs'].includes(entry.category) && !collectionIds.has(entry.id) && entry.id!=='physical-chemistry').map(entry => ({ ...entry, subject: entry.subject || subjects.get(entry.id) || 'Physical' })),
  ...available.filter(entry=>entry.kind==='Workspace' && entry.category==='biochemistry'),
  ...BIOCHEMISTRY_VIRTUAL_LABS.map(lab => ({ ...lab, description: lab.objective, id: `biochemistry-labs/${lab.id}`, path: `biochemistry-labs/${lab.id}`, subject: 'Biochemistry' })),
  ...available.filter(entry => entry.category === 'pharma').map(entry => ({ ...entry, subject: 'Pharmaceutical' })),
  ...available.filter(entry => ['organic','inorganic','biochemistry'].includes(entry.category) && !collectionIds.has(entry.id) && !['organic-chemistry','inorganic-chemistry'].includes(entry.id)).map(entry=>({...entry,subject:entry.subject || ({organic:'Organic',inorganic:'Inorganic',biochemistry:'Biochemistry'})[entry.category]})),
  { id: 'titration-lab', title: 'Acid–Base Titration Bench', description: 'Run the guided HCl–NaOH titration exercise and record observations.', subject: 'Analytical', path: 'lab/titration' },
]);
export function directoryHref(entry) { return `#/${entry.path}`; }
