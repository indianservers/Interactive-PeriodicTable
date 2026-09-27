import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Atom, BookOpen, Boxes, ChevronLeft, ChevronRight, Dna, FlaskConical, GraduationCap, Microscope, Orbit, Pause, Pill, Play, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { chemistryCategories, libraryEntries } from '../data/homeLibrary.js';
import { searchExperiences } from '../utils/searchExperiences.js';
import './chemistryLanding.css';

const subjectOrder = ['elements', 'simulators', 'organic', 'inorganic', 'biochemistry', 'analytical', 'pharma', 'explore', 'learn', 'bsc-cbcs'];
const subjects = subjectOrder.map(id => chemistryCategories.find(category => category.id === id)).filter(Boolean);
const icons = { elements: Atom, simulators: FlaskConical, organic: Orbit, inorganic: Boxes, biochemistry: Dna, analytical: Microscope, pharma: Pill, explore: Sparkles, learn: BookOpen, 'bsc-cbcs': GraduationCap };
const featured = [
  { id: 'table', label: 'THE BUILDING BLOCKS', title: 'Meet the elements.', description: 'Discover the patterns behind all 118 elements.', className: 'elements', action: 'Explore the periodic table' },
  { id: 'atom-builder', label: 'LEARN BY MAKING', title: 'Small particles. Big ideas.', description: 'Build an atom, one proton, neutron and electron at a time.', className: 'atom', action: 'Build your first atom' },
  { id: 'molecule', label: 'A NEW PERSPECTIVE', title: 'Chemistry, in every dimension.', description: 'Get closer to the structures that shape our world.', className: 'molecule', action: 'Open the 3D explorer' },
];
const PAGE_SIZE = 9;

function AtomArtwork({ paused, onToggle }) {
  return <div className={`cl-atom-art ${paused ? 'is-paused' : ''}`}>
    <div className="cl-art-grid" />
    <span className="cl-art-label"><i /> A WORLD BEYOND THE VISIBLE</span>
    <svg viewBox="0 0 520 440" role="img" aria-label="Decorative animated atom with orbiting electrons">
      <defs>
        <radialGradient id="cl-core"><stop stopColor="#eaffc8"/><stop offset=".35" stopColor="#a9f0a3"/><stop offset="1" stopColor="#367b60"/></radialGradient>
        <radialGradient id="cl-halo"><stop stopColor="#a9f0a3" stopOpacity=".16"/><stop offset="1" stopColor="#a9f0a3" stopOpacity="0"/></radialGradient>
        <filter id="cl-glow"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <circle cx="260" cy="220" r="195" fill="url(#cl-halo)"/>
      <g fill="none" stroke="#a9f0a3" strokeOpacity=".12"><circle cx="260" cy="220" r="188" strokeDasharray="2 10"/><path d="M30 220h460M260 15v410"/></g>
      {[0, 60, 120].map((angle, index) => <g key={angle} transform={`rotate(${angle} 260 220)`}>
        <ellipse cx="260" cy="220" rx="180" ry="67" fill="none" stroke={index === 1 ? '#d9e6c8' : '#8bbaa8'} strokeWidth="1.2" strokeOpacity=".6"/>
        <g className="cl-electron" style={{ animationDelay: `${index * -2.6}s`, animationDuration: `${9 + index * 2}s` }}>
          <circle r="10" fill="#d0ffb8" opacity=".45" filter="url(#cl-glow)"/><circle r="4.5" fill="#e6ffcf"/>
        </g>
      </g>)}
      <g className="cl-nucleus">
        {[[-14,-10,18],[12,-13,19],[1,12,20],[-18,12,13],[21,9,14],[0,-1,15]].map(([x,y,r], index) => <circle key={index} cx={260+x} cy={220+y} r={r} fill="url(#cl-core)" stroke="#c9f5b0" strokeOpacity=".22"/>)}
      </g>
      <g fill="#b5c4b8" fontSize="10" fontFamily="monospace"><text x="397" y="106">e⁻</text><text x="87" y="322">e⁻</text><text x="283" y="262">THE ATOM</text></g>
    </svg>
    <div className="cl-art-bottom"><span>Everything starts with a little curiosity.<small>Illustrative atomic model</small></span><button type="button" onClick={onToggle} aria-label={paused ? 'Play atom animation' : 'Pause atom animation'}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button></div>
    <div className="cl-floating-element"><small>6</small><strong>C</strong><span>Carbon</span></div>
  </div>;
}

export function ChemistryLanding({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [subgroup, setSubgroup] = useState('all');
  const [availability, setAvailability] = useState('available');
  const [expanded, setExpanded] = useState(false);
  const [browsing, setBrowsing] = useState(false);
  const [page, setPage] = useState(1);
  const [paused, setPaused] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const selected = subjects.find(subject => subject.id === category);
  const searching = query.trim().length > 0;
  const showResults = searching || browsing || category !== 'all';
  const results = searchExperiences(libraryEntries, { query, category, subgroup, availability });
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const availableCount = libraryEntries.filter(entry => !entry.upcoming).length;

  useEffect(() => {
    const shortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, []);

  const choose = id => { setCategory(id); setSubgroup('all'); setPage(1); setBrowsing(true); };
  const updateSearch = value => { setQuery(value); setCategory('all'); setSubgroup('all'); setPage(1); };
  const clearFilters = () => { setQuery(''); setCategory('all'); setSubgroup('all'); setAvailability('available'); setPage(1); };
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ block: 'start' });
  const browse = (id = 'all') => { setQuery(''); setAvailability('available'); choose(id); requestAnimationFrame(() => scrollTo('cl-discover')); };
  const openEntry = (event, entry) => {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); onNavigate(entry.id);
    }
  };

  return <div className="chemistry-landing">
    <a className="cl-skip" href="#cl-discover" onClick={event => { event.preventDefault(); document.getElementById('cl-discover-title')?.focus(); }}>Skip to chemistry experiences</a>
    <header className="cl-header">
      <a className="cl-brand" href="#/dashboard" aria-label="Chemistry Universe home" onClick={event => { event.preventDefault(); clearFilters(); setBrowsing(false); document.getElementById('cl-title')?.scrollIntoView(); }}><span><Atom size={25}/></span><b>chemistry<span>universe</span></b></a>
      <nav aria-label="Main navigation"><button onClick={() => scrollTo('cl-discover')}>Explore subjects</button><button onClick={() => browse('simulators')}>Virtual labs</button><button onClick={() => browse('learn')}>Learn & practice</button></nav>
      <button className="cl-header-cta" onClick={() => browse()}>Find your next discovery <ArrowUpRight size={16}/></button>
    </header>

    <div className="cl-main">
      <section className="cl-hero" aria-labelledby="cl-title">
        <div className="cl-hero-copy"><div className="cl-eyebrow"><span/> THE INTERACTIVE CHEMISTRY UNIVERSE</div>
          <h1 id="cl-title">Less memorizing.<br/>More <em>discovering.</em></h1>
          <p>See the invisible. Experiment with the possible.<br className="cl-desktop-break"/> A whole world of chemistry, ready for you to explore.</p>
          <form className="cl-search" role="search" onSubmit={event => { event.preventDefault(); setBrowsing(true); requestAnimationFrame(() => resultsRef.current?.focus()); }}>
            <Search size={21}/><input ref={searchRef} type="search" aria-label="Search all chemistry experiences" placeholder="What are you curious about?" value={query} onChange={event => updateSearch(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') updateSearch(''); }}/>
            {query ? <button type="button" aria-label="Clear search" onClick={() => { updateSearch(''); searchRef.current?.focus(); }}><X size={18}/></button> : <kbd>Ctrl K</kbd>}
            <button type="submit" className="cl-search-go" aria-label="Show search results"><ArrowRight size={20}/></button>
          </form>
          <div className="cl-suggestions"><span>Try exploring</span>{['Atoms', 'Reactions', 'Spectroscopy'].map(term => <button key={term} onClick={() => { updateSearch(term); searchRef.current?.focus(); }}>{term}<ArrowUpRight size={12}/></button>)}</div>
          <div className="cl-hero-stats"><span><b>{availableCount}</b> interactive experiences</span><i/><span><b>{subjects.length}</b> paths to discovery</span></div>
        </div>
        <AtomArtwork paused={paused} onToggle={() => setPaused(value => !value)}/>
      </section>

      {!searching && <section className="cl-featured" aria-labelledby="cl-featured-title">
        <div className="cl-section-heading"><div><span className="cl-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2 id="cl-featured-title">Great places to begin.</h2></div><span className="cl-section-note">Pick something. Change something. Learn something.</span></div>
        <div className="cl-featured-grid">{featured.map((item, index) => {
          const entry = libraryEntries.find(entry => entry.id === item.id);
          return <a className={`cl-feature-card cl-feature-${item.className}`} key={item.id} href={`#/${entry.path}`} onClick={event => openEntry(event, entry)}>
            <div className="cl-feature-art" aria-hidden="true">{index === 0 ? <div className="cl-element-tiles">{[['1','H','Hydrogen'],['6','C','Carbon'],['8','O','Oxygen']].map(([n,s,name]) => <div key={n}><small>{n}</small><b>{s}</b><span>{name}</span></div>)}</div> : index === 1 ? <div className="cl-mini-atom"><Atom strokeWidth={.65}/><i/></div> : <div className="cl-molecule-art"><i/><i/><i/><i/><i/><span/><span/><span/></div>}<span className="cl-feature-number">0{index + 1} / EXPLORE</span></div>
            <div className="cl-feature-copy"><span className="cl-eyebrow">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p><span className="cl-feature-action">{item.action}<ArrowUpRight size={18}/></span></div>
          </a>;
        })}</div>
      </section>}

      <section className="cl-discover" id="cl-discover" aria-labelledby="cl-discover-title">
        <div className="cl-section-heading"><div><span className="cl-eyebrow">FOLLOW YOUR CURIOSITY</span><h2 id="cl-discover-title" tabIndex={-1}>{searching ? 'Your next discovery awaits.' : 'One universe. Many ways in.'}</h2></div><button className="cl-text-button" onClick={() => { clearFilters(); setBrowsing(!showResults); }}>{showResults ? 'Back to subjects' : 'Browse all experiences'}<ArrowRight size={17}/></button></div>
        {!searching && <>
          <p className="cl-section-description">Choose a subject, then find your corner of chemistry.</p>
          <div className="cl-subjects">{(expanded ? subjects : subjects.slice(0, 6)).map(subject => {
            const Icon = icons[subject.id];
            const count = libraryEntries.filter(entry => entry.category === subject.id && !entry.upcoming).length;
            return <button key={subject.id} className={`cl-subject ${category === subject.id ? 'is-selected' : ''}`} style={{ '--subject-color': subject.color }} aria-pressed={category === subject.id} onClick={() => { choose(subject.id); requestAnimationFrame(() => resultsRef.current?.focus()); }}><span className="cl-subject-icon"><Icon size={25} strokeWidth={1.4}/></span><span><b>{subject.title}</b><small>{subject.description}</small><em>{subject.groups.length} {subject.groups.length === 1 ? 'collection' : 'collections'} · {count} experiences</em></span><ArrowUpRight size={19}/></button>;
          })}</div>
          <button className="cl-more-subjects" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer subjects' : 'More to explore: pharma, research, study & college practicals'}<ChevronRight size={16} className={expanded ? 'is-expanded' : ''}/></button>
        </>}

        {showResults && <div className="cl-browser">
          <div className="cl-filter-bar"><div><SlidersHorizontal size={17}/><label className="cl-visually-hidden" htmlFor="cl-category">Subject</label><select id="cl-category" value={category} onChange={event => choose(event.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}</select></div><label>Show<select aria-label="Availability" value={availability} onChange={event => { setAvailability(event.target.value); setPage(1); }}><option value="available">Ready to explore</option><option value="all">Including upcoming</option></select></label></div>
          {selected && <div className="cl-subgroups" aria-label="Subcategories"><button aria-pressed={subgroup === 'all'} onClick={() => { setSubgroup('all'); setPage(1); }}>All {selected.title.toLowerCase()}</button>{selected.groups.map(group => <button key={group.name} aria-pressed={subgroup === group.name} onClick={() => { setSubgroup(group.name); setPage(1); }}>{group.name}</button>)}</div>}
          <h3 className="cl-results-heading" ref={resultsRef} tabIndex={-1}><span role="status" aria-live="polite">{results.length} {results.length === 1 ? 'experience' : 'experiences'}{searching ? ` for “${query.trim()}”` : selected ? ` in ${selected.title}` : ' to explore'}</span><small>{results.length > 0 && `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, results.length)} of ${results.length}`}</small></h3>
          {results.length ? <div className="cl-results">{visibleResults.map(entry => {
            const Icon = icons[entry.category] || Atom;
            const content = <><span className="cl-result-meta"><Icon size={17}/>{entry.categoryTitle}</span><h4>{entry.title}</h4><p>{entry.description}</p><span className="cl-result-bottom"><small>{entry.subgroup}</small>{entry.upcoming ? <em>Upcoming</em> : <ArrowUpRight size={17}/>}</span></>;
            return entry.upcoming ? <article className="cl-result is-upcoming" key={`${entry.category}-${entry.id}`}>{content}</article> : <a className="cl-result" key={`${entry.category}-${entry.id}`} href={`#/${entry.path}`} onClick={event => openEntry(event, entry)}>{content}</a>;
          })}</div> : <div className="cl-empty"><Search size={32}/><h4>No discoveries here just yet.</h4><p>Try a broader term like “atom” or “reaction”, or reset your filters.</p><button onClick={clearFilters}>Reset search & filters <ArrowRight size={16}/></button></div>}
          {pageCount > 1 && <nav className="cl-pagination" aria-label="Search result pages"><button disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); resultsRef.current?.focus(); }}><ChevronLeft size={16}/> Previous</button><span>Page {currentPage} of {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); resultsRef.current?.focus(); }}>Next <ChevronRight size={16}/></button></nav>}
        </div>}
      </section>

      {!searching && <section className="cl-learning"><div className="cl-learning-symbol" aria-hidden="true"><FlaskConical size={70} strokeWidth={.8}/><Sparkles size={28}/></div><div><span className="cl-eyebrow">YOUR NEXT “AHA!” MOMENT</span><h2>Don't just read about it.<br/>See what happens.</h2><p>Change the conditions. Test an idea. Turn a concept into something you understand.</p></div><button onClick={() => browse('simulators')}>Find an experiment <ArrowUpRight size={18}/></button></section>}
    </div>
    <footer className="cl-footer"><div><Atom size={20}/><b>Chemistry Universe</b><span>Made for curious minds.</span></div><span>Explore. Experiment. Understand.</span><button onClick={() => onNavigate('settings')}>Preferences <ArrowUpRight size={13}/></button></footer>
  </div>;
}
