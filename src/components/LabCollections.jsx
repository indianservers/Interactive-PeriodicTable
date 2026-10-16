import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { completedVirtualLabs } from '../data/completedVirtualLabs.js';
import { BIOCHEMISTRY_VIRTUAL_LABS } from '../data/biochemistryVirtualLabs.js';
import './labCollections.css';

const collections = [
  { title: 'Physical chemistry', subject: 'Physical', description: 'Heat, motion and the chemistry of change.', position: '15%', color: '#87d7d2' },
  { title: 'Organic chemistry', subject: 'Organic', description: 'Separate, synthesize and discover new structures.', position: '50%', color: '#e4bd87' },
  { title: 'Analytical chemistry', subject: 'Analytical', description: 'Turn precise measurements into discoveries.', position: '85%', color: '#b8c6ef' },
  { title: 'Inorganic chemistry', subject: 'Inorganic', description: 'Explore ions, coordination and colorful reactions.', position: '30%', color: '#a9d59c' },
  { title: 'Biochemistry', subject: 'Biochemistry', description: 'Investigate the molecular machinery of life.', position: '100%', color: '#d5add9' },
];
export default function LabCollections({ onNavigate }) {
  return <section className="lab-collections" aria-labelledby="lab-collections-title">
    <div className="lab-collection-heading"><div><span>THE EXPERIMENT STARTS HERE</span><h2 id="lab-collections-title">Simulators &amp; labs</h2><p>A little theory. A real sense of discovery. Open a collection and step inside.</p></div><button onClick={() => onNavigate('virtual-labs')}>All virtual labs <ArrowUpRight size={17}/></button></div>
    <div className="lab-collection-grid">{collections.map(collection => {
      const labs = collection.subject === 'Biochemistry' ? BIOCHEMISTRY_VIRTUAL_LABS.map(lab => ({ ...lab, route: `biochemistry-labs/${lab.id}` })) : completedVirtualLabs.filter(lab => lab.subject === collection.subject);
      return <details className="lab-collection-card" key={collection.subject} style={{ '--lab-color': collection.color }}>
        <summary><div className="lab-collection-image"><img src="/assets/labs/chemistry-bench.png" alt="Glass laboratory apparatus and solutions on a chemistry workbench" loading="lazy" style={{ objectPosition: collection.position }}/><span className="lab-collection-tag">{String(labs.length).padStart(2, '0')} EXPERIMENTS</span></div><div className="lab-collection-copy"><span className="lab-collection-kicker">EXPLORE · EXPERIMENT · UNDERSTAND</span><h3>{collection.title}</h3><p>{collection.description}</p><span className="lab-collection-expand">Explore experiments <ChevronDown size={18}/></span></div></summary>
        <div className="lab-collection-links">{labs.map(lab => <button key={lab.id} onClick={() => onNavigate(lab.route)}>{lab.title}<ArrowUpRight size={15}/></button>)}{!labs.length && <button onClick={() => onNavigate('virtual-labs')}>Browse the laboratory catalog <ArrowUpRight size={15}/></button>}</div>
      </details>;
    })}</div>
  </section>;
}
