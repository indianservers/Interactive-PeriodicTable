import { chemistryCategories, libraryEntries } from '../data/homeLibrary.js';
import { Layers, FlaskConical, Grid2X2, Network } from 'lucide-react';
export default function HomeStatistics() {
 const stats = [
  [libraryEntries.length, 'Tools & experiences', Layers],
  [chemistryCategories.length, 'Categories', Grid2X2],
  [chemistryCategories.reduce((n,c)=>n+c.groups.length,0), 'Subcategories', Network],
  [libraryEntries.filter(e=>e.category==='simulators').length, 'Simulators & labs', FlaskConical],
 ];
 return <section className="home-statistics" aria-label="Chemistry library statistics">{stats.map(([count,label,Icon])=><div key={label}><Icon size={15} aria-hidden="true"/><strong>{count}</strong><span>{label}</span></div>)}</section>;
}
