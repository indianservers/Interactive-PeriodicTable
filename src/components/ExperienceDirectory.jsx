import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Search } from 'lucide-react';
import { directoryHref, studioEntries, labEntries } from '../data/experienceDirectory.js';
import './experienceDirectory.css';

const routeSubject=()=>typeof window==='undefined'?'All':new URLSearchParams(window.location.hash.split('?')[1] || '').get('subject') || 'All';
export default function ExperienceDirectory({ kind = 'studios', onNavigate, query: externalQuery }) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState(()=>kind==='labs'?routeSubject():'All');
  useEffect(()=>{const sync=()=>{setSubject(kind==='labs'?routeSubject():'All');setQuery('');};window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);};},[kind]);
  const entries = kind === 'labs' ? labEntries : studioEntries;
  const search = externalQuery ?? query;
  const subjects = [...new Set(entries.map(entry => entry.subject || entry.categoryTitle))].sort();
  const visible = useMemo(() => entries.filter(entry =>
    (subject === 'All' || (entry.subject || entry.categoryTitle) === subject) &&
    search.trim().toLowerCase().split(/\s+/).every(word => `${entry.title} ${entry.description || ''} ${entry.subject || entry.categoryTitle} ${entry.id} ${entry.path}`.toLowerCase().includes(word))
  ), [entries, subject, search]);
  return <section className="experience-directory" aria-labelledby={`${kind}-directory-title`}>
    <div className="experience-directory-heading"><div><span>EXPLORE CHEMISTRY</span><h2 id={`${kind}-directory-title`}>{kind === 'labs' ? 'All laboratories' : 'All studios & tools'}</h2><p>{kind === 'labs' ? 'Choose an implemented laboratory or experiment to open it directly.' : 'Browse every available studio, explorer, learning module and chemistry tool.'}</p></div><strong>{visible.length} of {entries.length}</strong></div>
    <div className="experience-directory-filters">
      {externalQuery === undefined && <label><Search size={18}/><input type="search" aria-label={`Search ${kind}`} placeholder={`Search ${kind}, topics or techniques…`} value={query} onChange={event => setQuery(event.target.value)}/></label>}
      <select aria-label={`${kind} subject`} value={subject} onChange={event => setSubject(event.target.value)}><option>All</option>{subjects.map(item => <option key={item}>{item}</option>)}</select>
    </div>
    <div className="experience-directory-grid">{visible.map(entry => <a key={entry.id} href={directoryHref(entry)} onClick={event => {
      if (onNavigate && event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); onNavigate(entry.path); }
    }}><small>{entry.subject || entry.categoryTitle}</small><h3>{entry.title}</h3><p>{entry.description}</p><span>Open {kind === 'labs' ? 'lab' : 'studio'} <ArrowUpRight size={16}/></span></a>)}</div>
    {!visible.length && <p role="status">No matches. Try another topic or choose All subjects.</p>}
  </section>;
}
