import { dissolutionProfile } from './simulation/dissolutionModel.js';

// A teaching formulation, not a marketed product specification.
export const homeFormula = [
  { name: 'Paracetamol (API)', role: 'Active ingredient', mg: 500, color: '#3889ff' },
  { name: 'Microcrystalline cellulose', role: 'Filler', mg: 200, color: '#e0e4f6' },
  { name: 'Povidone (PVP)', role: 'Binder', mg: 50, color: '#ad80ff' },
  { name: 'Croscarmellose sodium', role: 'Disintegrant', mg: 40, color: '#f7b950' },
  { name: 'Magnesium stearate', role: 'Lubricant', mg: 10, color: '#83ef94' },
  { name: 'Lactose monohydrate', role: 'Additional filler', mg: 200, color: '#b7d2df' },
];
export const tabletWeight = homeFormula.reduce((total, item) => total + item.mg, 0);
const profile = dissolutionProfile({ pH: 6.8, rpm: 50, temperature: 37 });
const releaseRate = -Math.log(1 - profile[1].y / 100) / profile[1].x;
export const releaseAt = time => Math.min(99.6, Math.max(0, 100 * (1 - Math.exp(-releaseRate * Math.max(0, time)))));
export const releaseTime = percent => -Math.log(1 - percent / 100) / releaseRate;
export const dashboardJourney = [
  ['Target & Discovery', 'Identify and validate', 'medicinal-chemistry'],
  ['Formulation', 'Design and develop', 'tablet-formulation'],
  ['Absorption', 'Into systemic circulation', 'adme'],
  ['Distribution', 'Reach target tissues', 'adme'],
  ['Metabolism', 'Biotransformation', 'adme'],
  ['Quality Control', 'Ensure identity, purity', 'hplc'],
  ['Toxicology', 'Assess safety', 'toxicology'],
  ['Patient', 'Better health outcomes', 'adme'],
];
export const dashboardModules = [
  { title: 'Explore ADME', route: 'adme', art: 3, description: 'Absorption, distribution, metabolism and excretion', detail: 'Visualize how the body handles your molecule.' },
  { title: 'Dosage Forms', route: 'dosage', art: 1, description: 'Solid, liquid, semi-solid and novel delivery systems', detail: 'Compare formulations and properties.' },
  { title: 'Quality Control', route: 'qc', art: 5, description: 'Analytical methods and specifications', detail: 'Explore identity, purity, potency and consistency.' },
  { title: 'Buffers', route: 'buffers', art: 10, description: 'Buffer systems in pharmaceutical science', detail: 'Design and calculate buffer solutions.' },
  { title: 'Toxicology', route: 'toxicology', art: 11, description: 'Safety evaluation and risk assessment', detail: 'From in vitro to in vivo, explore safety.' },
];
