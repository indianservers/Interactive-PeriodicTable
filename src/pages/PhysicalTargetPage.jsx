import PhysicalChemistryStudio from '../modules/physical-chemistry/PhysicalChemistryStudio.jsx';
import { completedVirtualLabs } from '../data/completedVirtualLabs.js';
import './physicalTargetLinks.css';

export default function PhysicalTargetPage({ onNavigate }) {
  const labs = completedVirtualLabs.filter(lab => lab.subject === 'Physical');
  return <div className="physical-target-page">
    <nav className="physical-target-links" aria-label="Interactive physical chemistry laboratories">
      <button className="all-labs" onClick={() => onNavigate?.('virtual-labs')}>Interactive labs</button>
      {labs.map(lab => <button key={lab.id} onClick={() => onNavigate?.(lab.route)}>{lab.title}</button>)}
    </nav>
    <PhysicalChemistryStudio onNavigate={onNavigate} />
  </div>;
}
