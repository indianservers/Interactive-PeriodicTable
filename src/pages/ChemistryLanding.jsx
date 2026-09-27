import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Atom, BookOpen, Boxes, ChevronLeft, ChevronRight, Dna, FlaskConical, GraduationCap, Microscope, Orbit, Pause, Pill, Play, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { chemistryCategories } from '../data/homeLibrary.js';
import { discoveryEntries as libraryEntries, subjectGuides, findExperience } from '../data/discoveryCatalog.js';
import { searchExperiences, suggestQuery } from '../utils/searchExperiences.js';
import { useDiscoveryState } from '../hooks/useDiscoveryState.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import SearchBox from '../components/discovery/SearchBox.jsx';
import ExperienceCard from '../components/discovery/ExperienceCard.jsx';
import ExperiencePreview from '../components/discovery/ExperiencePreview.jsx';
import LearningHub from '../components/discovery/LearningHub.jsx';
import { elements } from '../data/elements.js';
import '../components/discovery/discovery.css';
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

function AtomArtwork({ paused, onToggle, onExplore }) {
  const [number,setNumber]=useState(6);
  const element=elements.find(item=>item.atomicNumber===number);
  return <div className={`cl-atom-art ${paused ? 'is-paused' : ''}`}>
    <div className="cl-art-grid" />
    <span className="cl-art-label"><i /> A WORLD BEYOND THE VISIBLE</span>
    <svg viewBox="0 0 520 440" role="img" aria-label={`Simplified electron shells for ${element.name}: ${number} electrons`}>
      <defs>
        <radialGradient id="cl-core"><stop stopColor="#eaffc8"/><stop offset=".35" stopColor="#a9f0a3"/><stop offset="1" stopColor="#367b60"/></radialGradient>
        <radialGradient id="cl-halo"><stop stopColor="#a9f0a3" stopOpacity=".16"/><stop offset="1" stopColor="#a9f0a3" stopOpacity="0"/></radialGradient>
        <filter id="cl-glow"><feGaussianBlur stdDeviation="4"/></filter>
      </defs>
      <circle cx="260" cy="220" r="195" fill="url(#cl-halo)"/>
      <g fill="none" stroke="#a9f0a3" strokeOpacity=".12"><circle cx="260" cy="220" r="188" strokeDasharray="2 10"/><path d="M30 220h460M260 15v410"/></g>
      {element.shells.map((count, shell) => {
        const rx = 108 + shell * 38, ry = 48 + shell * 18;
        return <g key={shell} transform={`rotate(${shell * 55 - 25} 260 220)`}>
          <ellipse cx="260" cy="220" rx={rx} ry={ry} fill="none" stroke="#a9ccb7" strokeWidth="1.2" strokeOpacity=".6"/>
          {Array.from({length:count},(_,electron)=><g key={electron} className="cl-electron" style={{'--electron-position':`${electron/count*100}%`,offsetPath:`path('M ${260+rx} 220 A ${rx} ${ry} 0 1 1 ${260-rx} 220 A ${rx} ${ry} 0 1 1 ${260+rx} 220')`,animationDelay:`${-(electron/count)*(10+shell*3)}s`,animationDuration:`${10+shell*3}s`}}><circle r="9" fill="#d0ffb8" opacity=".45" filter="url(#cl-glow)"/><circle r="4" fill="#e6ffcf"/></g>)}
        </g>;
      })}
      <g className="cl-nucleus">{Array.from({length:Math.round(element.atomicMass)},(_,index)=>{
        const angle=index*2.4, radius=number===1?0:Math.sqrt(index)*6;
        return <circle key={index} cx={260+Math.cos(angle)*radius} cy={220+Math.sin(angle)*radius} r={number===1?16:11} fill={index<number?'url(#cl-core)':'#62987b'} stroke="#c9f5b0" strokeOpacity=".25"/>;
      })}</g>
      <g fill="#b5c4b8" fontSize="10" fontFamily="monospace"><text x="397" y="106">e⁻</text><text x="87" y="322">e⁻</text><text x="283" y="262">THE ATOM</text></g>
    </svg>
    <div className="cl-art-bottom"><span>Everything starts with a little curiosity.<small>Simplified shell model · not to scale</small></span><button type="button" onClick={onToggle} aria-label={paused ? 'Play atom animation' : 'Pause atom animation'}>{paused ? <Play size={16}/> : <Pause size={16}/>}</button></div>
    <div className="cl-floating-element"><small>{number}</small><strong>{element.symbol}</strong><span>{element.name}</span></div>
    <div className="dx-atom-controls"><label>Explore an element<select aria-label="Hero element" value={number} onChange={event=>setNumber(Number(event.target.value))}>{[1,6,8,11].map(n=><option key={n} value={n}>{elements.find(item=>item.atomicNumber===n).name}</option>)}</select></label><p>{number} protons · {number} electrons in a neutral atom<br/>Electron shells: {element.shells.join(' · ')}</p><button onClick={()=>onExplore(element)}>Open {element.name} explorer <ArrowUpRight size={15}/></button></div>
  </div>;
}

export function ChemistryLanding({ onNavigate, onViewAtom, recentPages=[] }) {
  const {state,setField,reset}=useDiscoveryState();
  const {query,category,subgroup,availability,expanded,browsing,page,type,level,saved,sort}=state;
  const setQuery=value=>setField('query',value),setCategory=value=>setField('category',value),setSubgroup=value=>setField('subgroup',value),setAvailability=value=>setField('availability',value),setExpanded=value=>setField('expanded',value),setBrowsing=value=>setField('browsing',value),setPage=value=>setField('page',value);
  const [favorites,setFavorites]=useLocalStorage('cu-favorite-pages',[]);
  const [motion,setMotion]=useLocalStorage('cu-reduced-motion',false);
  const [contrast,setContrast]=useLocalStorage('cu-high-contrast',false);
  const [preview,setPreview]=useState(null);
  const [shareMessage,setShareMessage]=useState('');
  const [sticky,setSticky]=useState(false);
  const [filtersOpen,setFiltersOpen]=useState(()=>window.matchMedia('(min-width: 761px)').matches);
  useEffect(()=>{const media=window.matchMedia('(min-width: 761px)');const sync=()=>setFiltersOpen(media.matches);media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
  const heroSearch=useRef(null);
  const stickySearch=useRef(null);
  const [paused, setPaused] = useState(false);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const selected = subjectGuides[category];
  const searching = query.trim().length > 0;
  const showResults = searching || browsing || category !== 'all' || saved;
  const results = searchExperiences(libraryEntries, { query, category, subgroup, availability, type, level, saved, favorites, sort });
  const correction=suggestQuery(libraryEntries,query);
  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const availableCount = libraryEntries.filter(entry => !entry.upcoming).length;

  useEffect(() => {
    const shortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); (sticky?stickySearch:searchRef).current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [sticky]);
  useEffect(()=>{if(!heroSearch.current){setSticky(true);return;}const observer=new IntersectionObserver(([entry])=>setSticky(!entry.isIntersecting));observer.observe(heroSearch.current);return()=>observer.disconnect();},[category]);

  const choose = id => { setCategory(id); setSubgroup('all'); setPage(1); setBrowsing(true); };
  const updateSearch = value => { setQuery(value); setPage(1); };
  const clearFilters = reset;
  const launch=entry=>{setPreview(null);onNavigate(entry.id);};
  const toggleSaved=id=>setFavorites(previous=>previous.includes(id)?previous.filter(value=>value!==id):[...previous,id]);
  const submitSearch=()=>{setBrowsing(true);requestAnimationFrame(()=>resultsRef.current?.focus());};
  const share=async()=>{try{await navigator.clipboard.writeText(location.href);setShareMessage('Link copied');}catch{setShareMessage('Copy this address from your browser to share this collection.');}};
  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ block: 'start' });
  const browse = (id = 'all') => { setQuery(''); setAvailability('available'); choose(id); requestAnimationFrame(() => scrollTo('cl-discover')); };
  const openEntry = (event, entry) => {
    if (!event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey && event.button === 0) {
      event.preventDefault(); onNavigate(entry.id);
    }
  };

  return <div className={`chemistry-landing ${contrast?'dx-high-contrast':''}`}>
    <a className="cl-skip" href="#cl-discover" onClick={event => { event.preventDefault(); document.getElementById('cl-discover-title')?.focus(); }}>Skip to chemistry experiences</a>
    <header className="cl-header">
      <a className="cl-brand" href="#/dashboard" aria-label="Chemistry Universe home" onClick={event => { event.preventDefault(); clearFilters(); setBrowsing(false); requestAnimationFrame(()=>window.scrollTo({top:0})); }}><span><Atom size={25}/></span><b>chemistry<span>universe</span></b></a>
      <nav aria-label="Main navigation"><button onClick={() => {reset();setBrowsing(false);requestAnimationFrame(()=>scrollTo('cl-discover'));}}>Explore subjects</button><button onClick={() => onNavigate('virtual-labs')}>Virtual labs</button><button onClick={() => browse('learn')}>Learn & practice</button></nav>
      <button className="cl-header-cta" onClick={() => browse()}>Find your next discovery <ArrowUpRight size={16}/></button>
    </header>
    {sticky&&<div className="dx-sticky-search"><SearchBox query={query} onChange={updateSearch} onSubmit={submitSearch} onCategory={choose} inputRef={stickySearch} label="Sticky chemistry search"/><button onClick={()=>{reset();setBrowsing(false);window.scrollTo({top:0});}}>Home</button></div>}

    <div className="cl-main">
      {!selected&&<section className="cl-hero" aria-labelledby="cl-title">
        <div className="cl-hero-copy"><div className="cl-eyebrow"><span/> THE INTERACTIVE CHEMISTRY UNIVERSE</div>
          <h1 id="cl-title">Less memorizing.<br/>More <em>discovering.</em></h1>
          <p>See the invisible. Experiment with the possible.<br className="cl-desktop-break"/> A whole world of chemistry, ready for you to explore.</p>
          <div ref={heroSearch}><SearchBox query={query} onChange={updateSearch} onSubmit={submitSearch} onCategory={choose} inputRef={searchRef}/></div>
          <div className="cl-suggestions"><span>Try exploring</span>{['Atoms', 'Reactions', 'Spectroscopy'].map(term => <button key={term} onClick={() => { updateSearch(term); searchRef.current?.focus(); }}>{term}<ArrowUpRight size={12}/></button>)}</div>
          <div className="cl-hero-stats"><span><b>{availableCount}</b> interactive experiences</span><i/><span><b>{subjects.length}</b> paths to discovery</span></div>
        </div>
        <AtomArtwork paused={paused||motion} onToggle={() => {if(paused||motion){setPaused(false);setMotion(false);}else setPaused(true);}} onExplore={element=>onViewAtom?.(element)}/>
      </section>}
      {selected&&<section className="dx-subject-hero"><button className="cl-text-button" onClick={()=>{reset();setBrowsing(false);}}>All subjects /</button><span className="cl-eyebrow">SUBJECT GUIDE</span><h1>{selected.title}</h1><p>{selected.introduction}</p><h2>Recommended starting points</h2><div className="dx-subject-starts">{selected.startingPoints.map(id=>{const entry=findExperience(id);return <button key={id} onClick={()=>setPreview(entry)}>{entry.title}<ArrowUpRight size={16}/></button>;})}</div></section>}

      {!searching && !selected && <section className="cl-featured" aria-labelledby="cl-featured-title">
        <div className="cl-section-heading"><div><span className="cl-eyebrow">A LITTLE CURIOSITY GOES A LONG WAY</span><h2 id="cl-featured-title">Great places to begin.</h2></div><span className="cl-section-note">Pick something. Change something. Learn something.</span></div>
        <div className="cl-featured-grid">{featured.map((item, index) => {
          const entry = libraryEntries.find(entry => entry.id === item.id);
          return <a className={`cl-feature-card cl-feature-${item.className}`} key={item.id} href={`#/${entry.path}`} onClick={event => openEntry(event, entry)}>
            <div className="cl-feature-art" aria-hidden="true">{index === 0 ? <div className="cl-element-tiles">{[['1','H','Hydrogen'],['6','C','Carbon'],['8','O','Oxygen']].map(([n,s,name]) => <div key={n}><small>{n}</small><b>{s}</b><span>{name}</span></div>)}</div> : index === 1 ? <div className="cl-mini-atom"><Atom strokeWidth={.65}/><i/></div> : <div className="cl-molecule-art"><i/><i/><i/><i/><i/><span/><span/><span/></div>}<span className="cl-feature-number">0{index + 1} / EXPLORE</span></div>
            <div className="cl-feature-copy"><span className="cl-eyebrow">{item.label}</span><h3>{item.title}</h3><p>{item.description}</p><span className="cl-feature-action">{item.action}<ArrowUpRight size={18}/></span></div>
          </a>;
        })}</div>
      </section>}
      {!searching&&!selected&&<LearningHub recentPages={recentPages} favorites={favorites} onLaunch={launch} onBrowse={()=>{reset();setField('saved',true);requestAnimationFrame(()=>scrollTo('cl-discover'));}}/>}

      <section className="cl-discover" id="cl-discover" aria-labelledby="cl-discover-title">
        <div className="cl-section-heading"><div><span className="cl-eyebrow">FOLLOW YOUR CURIOSITY</span><h2 id="cl-discover-title" tabIndex={-1}>{searching ? 'Your next discovery awaits.' : selected ? `Explore ${selected.title.toLowerCase()}.` : 'One universe. Many ways in.'}</h2></div><button className="cl-text-button" onClick={() => { clearFilters(); setBrowsing(!showResults); }}>{showResults ? 'Back to subjects' : 'Browse all experiences'}<ArrowRight size={17}/></button></div>
        {!searching && !selected && <>
          <p className="cl-section-description">Choose a subject, then find your corner of chemistry.</p>
          <div className="cl-subjects">{(expanded ? subjects : subjects.slice(0, 6)).map(subject => {
            const Icon = icons[subject.id];
            const count = libraryEntries.filter(entry => entry.category === subject.id && !entry.upcoming).length;
            return <button key={subject.id} className={`cl-subject ${category === subject.id ? 'is-selected' : ''}`} style={{ '--subject-color': subject.color }} aria-pressed={category === subject.id} onClick={() => { choose(subject.id); requestAnimationFrame(() => document.querySelector('.dx-subject-hero')?.scrollIntoView()); }}><span className="cl-subject-icon"><Icon size={25} strokeWidth={1.4}/></span><span><b>{subject.title}</b><small>{subject.description}</small><em>{subject.groups.length} {subject.groups.length === 1 ? 'collection' : 'collections'} · {count} experiences</em></span><ArrowUpRight size={19}/></button>;
          })}</div>
          <button className="cl-more-subjects" aria-expanded={expanded} onClick={() => setExpanded(value => !value)}>{expanded ? 'Show fewer subjects' : 'More to explore: pharma, research, study & college practicals'}<ChevronRight size={16} className={expanded ? 'is-expanded' : ''}/></button>
        </>}

        {showResults && <div className="cl-browser">
          <details className="dx-filter-disclosure" open={filtersOpen} onToggle={event=>setFiltersOpen(event.currentTarget.open)}><summary>Refine results · subject, type & level</summary>
          <div className="dx-extra-filters"><label>Experience type<select value={type} onChange={event=>setField('type',event.target.value)}><option value="all">All types</option>{['Simulation','Reference','Visualization','Practice'].map(value=><option key={value}>{value}</option>)}</select></label><label>Suggested level<select value={level} onChange={event=>setField('level',event.target.value)}><option value="all">All levels</option>{['Beginner','Intermediate','Advanced'].map(value=><option key={value}>{value}</option>)}</select></label><label>Sort by<select value={sort} onChange={event=>setField('sort',event.target.value)}><option value="relevance">Relevance</option><option value="newest">Recently added</option></select></label><button aria-pressed={saved} onClick={()=>setField('saved',!saved)}>Saved only</button><button onClick={share}>Share collection</button><span role="status">{shareMessage}</span></div>
          <div className="cl-filter-bar"><div><SlidersHorizontal size={17}/><label className="cl-visually-hidden" htmlFor="cl-category">Subject</label><select id="cl-category" value={category} onChange={event => choose(event.target.value)}><option value="all">All subjects</option>{subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.title}</option>)}</select></div><label>Show<select aria-label="Availability" value={availability} onChange={event => { setAvailability(event.target.value); setPage(1); }}><option value="available">Ready to explore</option><option value="all">Including upcoming</option></select></label></div>
          {selected && <div className="cl-subgroups" aria-label="Subcategories"><button aria-pressed={subgroup === 'all'} onClick={() => { setSubgroup('all'); setPage(1); }}>All {selected.title.toLowerCase()}</button>{selected.groups.map(group => <button key={group.name} aria-pressed={subgroup === group.name} onClick={() => { setSubgroup(group.name); setPage(1); }}>{group.name}</button>)}</div>}
          </details>
          <div className="dx-filter-chips" aria-label="Active filters">{[['query',query,query],['category',category,selected?.title],['subgroup',subgroup,subgroup],['type',type,type],['level',level,level],['availability',availability,availability==='all'?'Including upcoming':''],['saved',saved,saved?'Saved only':'']].filter(([field,value,label])=>label&&value!==''&&value!=='all'&&field!=='availability'||field==='availability'&&value==='all').map(([field,value,label])=><button key={field} aria-label={`Remove ${label} filter`} onClick={()=>{setField(field,field==='query'?'':field==='saved'?false:field==='availability'?'available':'all');if(field==='category')setSubgroup('all');}}>{label}<X size={13}/></button>)}</div>
          {correction&&<p className="dx-correction">Did you mean <button onClick={()=>updateSearch(correction)}>{correction}</button>?</p>}
          <h3 className="cl-results-heading" ref={resultsRef} tabIndex={-1}><span role="status" aria-live="polite">{results.length} {results.length === 1 ? 'experience' : 'experiences'}{searching ? ` for “${query.trim()}”` : selected ? ` in ${selected.title}` : ' to explore'}</span><small>{results.length > 0 && `${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, results.length)} of ${results.length}`}</small></h3>
          {results.length ? <div className="cl-results">{visibleResults.map(entry=><ExperienceCard key={entry.category+'-'+entry.id} entry={entry} query={query} saved={favorites.includes(entry.id)} onSave={toggleSaved} onOpen={openEntry} onPreview={setPreview}/>)}</div> : <div className="cl-empty"><Search size={32}/><h4>No discoveries here just yet.</h4><p>Try a broader term, a suggested spelling, or reset your filters.</p><button onClick={clearFilters}>Reset search & filters <ArrowRight size={16}/></button></div>}
          {pageCount > 1 && <nav className="cl-pagination" aria-label="Search result pages"><button disabled={currentPage === 1} onClick={() => { setPage(currentPage - 1); resultsRef.current?.focus(); }}><ChevronLeft size={16}/> Previous</button><span>Page {currentPage} of {pageCount}</span><button disabled={currentPage === pageCount} onClick={() => { setPage(currentPage + 1); resultsRef.current?.focus(); }}>Next <ChevronRight size={16}/></button></nav>}
        </div>}
      </section>

      {!searching && <section className="cl-learning"><div className="cl-learning-symbol" aria-hidden="true"><FlaskConical size={70} strokeWidth={.8}/><Sparkles size={28}/></div><div><span className="cl-eyebrow">YOUR NEXT “AHA!” MOMENT</span><h2>Don't just read about it.<br/>See what happens.</h2><p>Change the conditions. Test an idea. Turn a concept into something you understand.</p></div><button onClick={() => browse('simulators')}>Find an experiment <ArrowUpRight size={18}/></button></section>}
    </div>
    {preview&&<ExperiencePreview entry={preview} onClose={()=>setPreview(null)} onLaunch={launch}/>}
    <section className="dx-accessibility" aria-label="Accessibility preferences"><button aria-pressed={motion} onClick={()=>setMotion(value=>!value)}>{motion?'Enable motion':'Reduce motion'}</button><button aria-pressed={contrast} onClick={()=>setContrast(value=>!value)}>{contrast?'Standard contrast':'High contrast'}</button><span>Keyboard: Ctrl/Cmd K to search · ↑ ↓ to select · Enter to explore</span></section>
    <footer className="cl-footer"><div><Atom size={20}/><b>Chemistry Universe</b><span>Made for curious minds.</span></div><span>Explore. Experiment. Understand.</span><button onClick={() => onNavigate('settings')}>Preferences <ArrowUpRight size={13}/></button></footer>
  </div>;
}
