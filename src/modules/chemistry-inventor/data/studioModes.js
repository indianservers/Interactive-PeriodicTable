import {
  Activity, Beaker, BookOpenCheck, ClipboardList, Eye, FlaskConical, Gauge,
  Presentation, Ruler, Sparkles, TestTube2, Wrench,
} from 'lucide-react';
import { actionBlockLibrary } from './actionBlockLibrary.js';
import { apparatusLibrary } from './apparatusLibrary.js';
import { chemicalLibrary } from './chemicalLibrary.js';
import { indicatorLibrary } from './indicatorLibrary.js';
import { measurementLibrary } from './measurementLibrary.js';

export const gradeOptions = ['Class 7', 'Class 8', 'Class 9', 'Class 10'];
export const unitOptions = ['none', 'mL', 'L', 'g', 'mg', 'drops', 'mol/L', '%', 'C', 'seconds', 'pieces', 'jar', 'piece'];
export const stateOptions = ['solid', 'liquid', 'gas', 'aqueous', 'indicator', 'apparatus', 'block', 'tool'];

export const studioModes = [
  { id: 'guided', title: 'Guided Mode', description: 'Follow a structured school experiment with hints and checkpoints.', icon: BookOpenCheck, accent: '#22d3ee' },
  { id: 'free-build', title: 'Free Build Mode', description: 'Drag apparatus, chemicals, labels, and sensors into a custom setup.', icon: Wrench, accent: '#a78bfa' },
  { id: 'challenge', title: 'Challenge Mode', description: 'Solve a chemistry goal with fewer hints and validation feedback.', icon: Sparkles, accent: '#f472b6' },
  { id: 'teacher-demo', title: 'Teacher Demo Mode', description: 'Present a clean classroom simulation with larger labels and outputs.', icon: Presentation, accent: '#f59e0b' },
];

const apparatusItem = item => ({
  id: item.id,
  label: item.name,
  visual: item.icon,
  componentType: 'apparatus',
  state: 'apparatus',
  quantity: item.defaultProperties.quantity,
  unit: item.defaultProperties.unit,
  concentration: '',
  capacity: item.defaultProperties.capacity,
  heatingAllowed: item.canHeat,
  safetyNote: item.safetyNote,
  possibleActions: item.allowedActions,
  allowedContents: item.allowedContents,
  containedChemicals: [],
  gradeLevel: item.gradeLevel,
  width: 104,
  height: 72,
  color: '#22d3ee',
});

const chemicalItem = item => ({
  id: item.id,
  label: item.name,
  visual: item.formula,
  componentType: 'chemical',
  state: item.state,
  quantity: item.defaultQuantity,
  unit: item.defaultUnit,
  concentration: item.approxPH ? `pH ${item.approxPH}` : '',
  capacity: '',
  heatingAllowed: false,
  safetyNote: item.safetyNote,
  possibleActions: ['Measure', 'Pour', 'Mix', 'Observe'],
  supportedReactions: item.supportedReactions,
  gradeLevel: item.gradeLevel,
  width: 120,
  height: 62,
  color: item.type === 'acid' ? '#f472b6' : item.type === 'base' ? '#34d399' : item.type === 'gas' ? '#38bdf8' : '#a78bfa',
});

const indicatorItem = item => ({
  id: item.id,
  label: item.name,
  visual: item.name.split(' ').map(part => part[0]).join('').slice(0, 4),
  componentType: 'indicator',
  state: 'indicator',
  quantity: 2,
  unit: 'drops',
  concentration: item.pHRange,
  capacity: '',
  heatingAllowed: false,
  safetyNote: item.usageNote,
  possibleActions: ['Dip', 'Add drops', 'Compare colour'],
  gradeLevel: item.gradeLevel,
  width: 118,
  height: 58,
  color: '#f472b6',
});

const measurementItem = item => ({
  id: item.id,
  label: item.name,
  visual: item.unit,
  componentType: 'measurement',
  state: 'tool',
  quantity: 1,
  unit: item.unit,
  concentration: '',
  capacity: '',
  heatingAllowed: false,
  safetyNote: item.description,
  possibleActions: ['Measure', 'Record', 'Compare'],
  gradeLevel: item.gradeLevel,
  width: 132,
  height: 58,
  color: '#34d399',
});

const actionItem = item => ({
  id: item.id,
  label: item.name,
  visual: item.name,
  componentType: 'action',
  state: 'block',
  quantity: 1,
  unit: 'none',
  concentration: '',
  capacity: '',
  heatingAllowed: item.id === 'heat' || item.id === 'evaporate',
  safetyNote: item.description,
  possibleActions: [item.description],
  gradeLevel: item.gradeLevel,
  width: 138,
  height: 54,
  color: '#fb923c',
});

const observationItems = [
  ['colour-change', 'Colour Change', 'Colour'],
  ['gas-evolution', 'Gas Evolution', 'Bubbles'],
  ['precipitate-formation', 'Precipitate Formation', 'Ppt'],
  ['temperature-change', 'Temperature Change', 'Temp'],
  ['ph-change', 'pH Change', 'pH'],
  ['write-conclusion', 'Write Conclusion', 'Result'],
].map(([id, label, visual]) => ({
  id, label, visual, componentType: 'observation', state: 'block', quantity: 1, unit: 'none', concentration: '', capacity: '', heatingAllowed: false,
  safetyNote: 'Record observation and connect it to the conclusion.',
  possibleActions: ['Observe', 'Annotate', 'Explain'],
  gradeLevel: 7,
  width: 138,
  height: 54,
  color: '#38bdf8',
}));

export const paletteGroups = [
  { id: 'apparatus', title: 'Apparatus', icon: Beaker, items: apparatusLibrary.map(apparatusItem) },
  { id: 'chemicals', title: 'Chemicals', icon: Sparkles, items: chemicalLibrary.map(chemicalItem) },
  { id: 'indicators', title: 'Indicators', icon: Eye, items: indicatorLibrary.map(indicatorItem) },
  { id: 'measurement-tools', title: 'Measurement Tools', icon: Gauge, items: measurementLibrary.map(measurementItem) },
  { id: 'action-blocks', title: 'Action Blocks', icon: Activity, items: actionBlockLibrary.map(actionItem) },
  { id: 'observation-blocks', title: 'Observation Blocks', icon: ClipboardList, items: observationItems },
];

export const starterComponents = [];

export const paletteIconMap = {
  apparatus: Beaker,
  chemicals: TestTube2,
  indicators: Eye,
  'measurement-tools': Ruler,
  'action-blocks': Activity,
  'observation-blocks': ClipboardList,
};
