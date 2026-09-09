import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Atom, BookOpen, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, FlaskConical,
  Link2, Maximize2, Menu, MousePointer2, Pause, Play, RotateCcw, Search, Settings2,
  Shapes, X, ZoomIn,
} from 'lucide-react';
import CarbohydrateViewer from './CarbohydrateViewer.jsx';
import { BUILT_DISACCHARIDES, CARBOHYDRATES, CARBOHYDRATE_GROUPS, COMPOUND_NAMES, STUDIO_ROUTES } from './carbohydrateData.js';
import { BiologyPage, PropertiesPage, QuizPage, ReactionPage } from './LabPages.jsx';
import './carbohydrateStudio.css';

const monoNames = CARBOHYDRATE_GROUPS.Monosaccharides;

function IconButton({ label, children, onClick, className = '' }) {
  return <button className={`cs-icon-button ${className}`} type="button" onClick={onClick} title={label} aria-label={label}>{children}</button>;
}

function StudioHeader({ route, navigate, openLibrary, openInspector }) {
  return <header className="cs-header">
    <div className="cs-brand"><div className="cs-brand-mark"><Atom /></div><div><h1>Carbohydrate Structure Studio</h1><p>Visualize · Explore · Build · Understand</p></div></div>
    <button className="cs-mobile-trigger" onClick={openLibrary}><Menu /> Compounds</button>
    <nav aria-label="Studio pages">{STUDIO_ROUTES.map(([label, path]) => <button key={path} className={route === path ? 'is-active' : ''} onClick={() => navigate(path)}>{label}</button>)}</nav>
    <div className="cs-header-actions"><IconButton label="Search compounds" onClick={openLibrary}><Search /></IconButton><IconButton label="Open inspector" onClick={openInspector}><Settings2 /></IconButton><span className="cs-avatar">CS</span></div>
  </header>;
}

function CompoundLibrary({ selected, onSelect, open, onClose }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(() => new Set(Object.keys(CARBOHYDRATE_GROUPS)));
  const toggle = group => setExpanded(current => { const next = new Set(current); next.has(group) ? next.delete(group) : next.add(group); return next; });
  return <aside className={`cs-library ${open ? 'is-open' : ''}`}>
    <div className="cs-panel-title"><strong>Compound Library</strong><IconButton label="Close compound library" onClick={onClose}><ChevronLeft /></IconButton></div>
    <label className="cs-search"><Search /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search carbohydrates…" /></label>
    <div className="cs-library-scroll">{Object.entries(CARBOHYDRATE_GROUPS).map(([group, items]) => {
      const filtered = items.filter(item => item.toLowerCase().includes(query.toLowerCase()));
      if (!filtered.length) return null;
      return <section key={group}><button className="cs-group-title" onClick={() => toggle(group)}><span>{group} <em>({items.length})</em></span><ChevronDown className={expanded.has(group) ? 'is-open' : ''} /></button>
        {expanded.has(group) && <div>{filtered.map(item => <button key={item} className={`cs-compound-item ${selected === item ? 'is-selected' : ''}`} onClick={() => { onSelect(item); onClose(); }}><Shapes /><span>{item}</span><small>{CARBOHYDRATES[item].formula}</small><ChevronRight /></button>)}</div>}
      </section>;
    })}</div>
  </aside>;
}

function FischerProjection({ compound, selectedCarbon, onSelectCarbon, progress, mode }) {
  const mono = compound.name.startsWith('D-') ? compound : CARBOHYDRATES['D-Glucose'];
  const sides = mono.fischer || ['right', 'left', 'right', 'right'];
  const rows = sides.length;
  const topLabel = sides[0] === 'carbonyl' ? 'CH₂OH' : 'CHO';
  return <svg viewBox="0 0 230 330" className={`cs-projection cs-fischer ${mode === 'Ring closure' ? 'is-closing' : ''}`} aria-label={`Interactive Fischer projection for ${compound.name}`}>
    <text x="115" y="30" textAnchor="middle" className="cs-proj-main">{topLabel}</text>
    <line x1="115" y1="42" x2="115" y2="285" />
    {sides.map((side, index) => {
      const carbon = index + 2;
      const y = 78 + index * (190 / Math.max(3, rows - 1));
      const active = selectedCarbon === carbon;
      if (side === 'carbonyl') return <g key={carbon} onMouseEnter={() => onSelectCarbon(carbon)}><line x1="115" y1={y} x2="162" y2={y} /><line x1="115" y1={y + 5} x2="162" y2={y + 5} /><text x="177" y={y + 7} className="cs-proj-main">O</text><circle cx="115" cy={y} r="18" className={active ? 'is-active' : ''} onClick={() => onSelectCarbon(carbon)} /></g>;
      const ohRight = side === 'right';
      return <g key={carbon} onMouseEnter={() => onSelectCarbon(carbon)}>
        <line x1="65" y1={y} x2="165" y2={y} /><circle cx="115" cy={y} r="18" className={active ? 'is-active' : ''} onClick={() => onSelectCarbon(carbon)} />
        <text x="50" y={y + 7} textAnchor="end" className={ohRight ? 'cs-proj-main' : 'cs-proj-oh'}>{ohRight ? 'H' : 'HO'}</text>
        <text x="180" y={y + 7} className={ohRight ? 'cs-proj-oh' : 'cs-proj-main'}>{ohRight ? 'OH' : 'H'}</text>
        <text x="105" y={y - 10} textAnchor="end" className="cs-carbon-number">{carbon}</text>
      </g>;
    })}
    <text x="115" y="316" textAnchor="middle" className="cs-proj-main">CH₂OH</text>
    {mode === 'Ring closure' && <path className="cs-ring-arrow" style={{ strokeDashoffset: 180 - progress * 1.8 }} d="M190 278 C218 225 214 117 159 77" />}
  </svg>;
}

function HaworthProjection({ compound, selectedCarbon, onSelectCarbon, anomer = 'α', second = false }) {
  const six = compound.ringSize !== 5;
  const points = six ? [[55,145],[91,75],[171,75],[213,145],[172,214],[91,214]] : [[66,150],[112,80],[190,112],[183,202],[92,212]];
  return <svg viewBox="0 0 270 280" className="cs-projection cs-haworth" aria-label={`Interactive Haworth projection for ${compound.name}`}>
    <polyline points={points.map(p => p.join(',')).join(' ')} />
    <text x={six ? 132 : 151} y={six ? 68 : 86} className="cs-proj-main">O</text>
    {points.map(([x,y], i) => { const carbon = i + 1; const active = selectedCarbon === carbon; return <g key={carbon}><circle cx={x} cy={y} r="20" className={active ? 'is-active' : ''} onMouseEnter={() => onSelectCarbon(carbon)} onClick={() => onSelectCarbon(carbon)} /><text x={x} y={y + 5} textAnchor="middle" className="cs-carbon-number">{carbon}</text>{i < points.length - 1 && <text x={x + (i % 2 ? 20 : -28)} y={y + (i % 2 ? 38 : -24)} className={second ? 'cs-proj-pink' : 'cs-proj-oh'}>{i % 2 ? 'OH' : 'HO'}</text>}</g>; })}
    <text x="45" y="64" className="cs-proj-main">CH₂OH</text>
    <text x="208" y="166" className={anomer === 'α' ? 'cs-proj-yellow' : 'cs-proj-oh'}>{anomer}-OH</text>
  </svg>;
}

function RepresentationCard({ title, subtitle, children, onExpand }) {
  const cardRef = useRef(null);
  return <section ref={cardRef} className="cs-representation-card"><div className="cs-card-heading"><div><h3>{title}</h3><p>{subtitle}</p></div><IconButton label={`Expand ${title}`} onClick={onExpand || (() => cardRef.current?.requestFullscreen?.())}><Maximize2 /></IconButton></div>{children}</section>;
}

function StructureInspector({ compound, builder, setBuilder, onBuild, buildResult, open, onClose }) {
  return <aside className={`cs-inspector ${open ? 'is-open' : ''}`}>
    <div className="cs-panel-title"><strong>Stereocenters</strong><CircleHelp /><IconButton label="Close inspector" onClick={onClose}><X /></IconButton></div>
    <div className="cs-stereo-table"><div className="cs-table-head"><span>Carbon</span><span>Configuration</span><span>R / S</span></div>{compound.stereocenters.map(row => <div key={row[0]}><span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span></div>)}</div>
    <section className="cs-inspector-section"><h3>Reducing-sugar status <CircleHelp /></h3><div className={`cs-status-card ${compound.reducing ? 'is-positive' : 'is-negative'}`}><strong>{compound.reducing ? 'Reducing carbohydrate' : 'Non-reducing disaccharide'}</strong><p>{compound.reducing ? 'A free anomeric centre can equilibrate with an open-chain carbonyl form.' : 'Both anomeric carbons are locked in the glycosidic bond.'}</p></div></section>
    <section className="cs-inspector-section"><h3>Glycosidic bond builder <CircleHelp /></h3><div className="cs-form-grid">
      <label>Monomer 1 (donor)<select value={builder.donor} onChange={e => setBuilder({...builder, donor:e.target.value})}>{monoNames.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Anomeric carbon<select value={builder.donorCarbon} onChange={e => setBuilder({...builder, donorCarbon:e.target.value})}><option>C1 (α)</option><option>C1 (β)</option><option>C2 (β)</option></select></label>
      <label>Monomer 2 (acceptor)<select value={builder.acceptor} onChange={e => setBuilder({...builder, acceptor:e.target.value})}>{monoNames.map(n => <option key={n}>{n}</option>)}</select></label>
      <label>Link to carbon<select value={builder.acceptorCarbon} onChange={e => setBuilder({...builder, acceptorCarbon:e.target.value})}><option>C2</option><option>C4</option><option>C6</option><option>C1</option></select></label>
      <label className="cs-span-2">Linkage type<select value={builder.linkage} onChange={e => setBuilder({...builder, linkage:e.target.value})}><option>α(1→2)β</option><option>α(1→4)</option><option>β(1→4)</option><option>α,α(1↔1)</option><option>α(1→6)</option></select></label>
    </div><button className="cs-primary" onClick={onBuild}><Link2 /> Build glycosidic bond</button>{buildResult && <div className="cs-build-result"><strong>{buildResult.name}</strong><span>{buildResult.detail}</span></div>}</section>
  </aside>;
}

function StructurePage({ selectedName, setSelectedName, inspectorOpen, setInspectorOpen }) {
  const compound = CARBOHYDRATES[selectedName];
  const viewerRef = useRef(null);
  const [mode, setMode] = useState('Open chain');
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [anomer, setAnomer] = useState('α');
  const [representation, setRepresentation] = useState('Ball & stick');
  const [hydrogens, setHydrogens] = useState(true);
  const [labels, setLabels] = useState(false);
  const [carbonLabels, setCarbonLabels] = useState(true);
  const [selectedCarbon, setSelectedCarbon] = useState(1);
  const [builder, setBuilder] = useState({ donor:'D-Glucose', donorCarbon:'C1 (α)', acceptor:'D-Fructose', acceptorCarbon:'C2', linkage:'α(1→2)β' });
  const [buildResult, setBuildResult] = useState(null);
  useEffect(() => { if (!playing) return; const timer = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 1), 55); return () => clearInterval(timer); }, [playing]);
  useEffect(() => { setSelectedCarbon(1); }, [selectedName]);
  const buildBond = () => {
    const product = BUILT_DISACCHARIDES[`${builder.donor}|${builder.acceptor}|${builder.linkage}`];
    if (product) { setSelectedName(product); setBuildResult({ name: product, detail: `${builder.donor} ${builder.linkage} ${builder.acceptor} · validated product structure loaded` }); }
    else setBuildResult({ name: 'Custom linkage model', detail: `${builder.donor} ${builder.linkage} ${builder.acceptor} · connectivity specification generated` });
  };
  const modes = ['Open chain', 'Ring closure', 'Anomers', 'Glycosidic bond'];
  return <><main className="cs-main cs-structure-page">
    <div className="cs-structure-title"><div><p className="cs-breadcrumb">{compound.classification.split(' · ')[0]} <ChevronRight /> <b>{compound.name}</b></p><h2>{compound.name}</h2><p>{compound.formula} · {compound.ring}</p></div><span className={`cs-reducing-pill ${compound.reducing ? '' : 'is-non'}`}>{compound.reducing ? 'Reducing carbohydrate' : 'Non-reducing disaccharide'}</span></div>
    <div className="cs-mode-row"><div className="cs-tabs">{modes.map(item => <button key={item} className={mode === item ? 'is-active' : ''} onClick={() => setMode(item)}>{item === 'Open chain' ? <MousePointer2 /> : item === 'Glycosidic bond' ? <Link2 /> : <Shapes />}{item}</button>)}</div><div className="cs-stage-steps">{['Fischer','Haworth','3D Model','Complete'].map((s,i) => <span key={s} className={progress >= i * 30 ? 'is-active' : ''}><b>{i+1}</b>{s}</span>)}</div></div>
    <div className="cs-representations">
      <RepresentationCard title="Fischer" subtitle="Open-chain representation"><FischerProjection compound={compound} selectedCarbon={selectedCarbon} onSelectCarbon={setSelectedCarbon} progress={progress} mode={mode} /><strong className="cs-rep-caption">{compound.name}</strong></RepresentationCard>
      <RepresentationCard title="Haworth" subtitle="Cyclic form and glycosidic linkage"><div className={compound.classification === 'Disaccharide' ? 'cs-double-haworth' : ''}><HaworthProjection compound={compound} selectedCarbon={selectedCarbon} onSelectCarbon={setSelectedCarbon} anomer={anomer} />{compound.classification === 'Disaccharide' && <><div className="cs-glyco-link">{compound.linkage}</div><HaworthProjection compound={CARBOHYDRATES['D-Fructose']} selectedCarbon={selectedCarbon} onSelectCarbon={setSelectedCarbon} anomer="β" second /></>}</div><strong className="cs-rep-caption">{anomer}-{compound.ring}</strong></RepresentationCard>
      <RepresentationCard title="3D Conformation" subtitle="Interactive validated ball-and-stick model"><CarbohydrateViewer ref={viewerRef} compound={compound} representation={representation} hydrogens={hydrogens} labels={labels} carbonLabels={carbonLabels} selectedCarbon={selectedCarbon} onSelectCarbon={setSelectedCarbon} /><div className="cs-view-controls"><button onClick={() => viewerRef.current?.rotate()}><MousePointer2 /> Rotate</button><button onClick={() => viewerRef.current?.zoom(1.2)}><ZoomIn /> Zoom</button><button onClick={() => viewerRef.current?.reset()}><RotateCcw /> Reset</button><button onClick={() => viewerRef.current?.fullscreen()}><Maximize2 /></button></div><div className="cs-segmented"><button className={representation === 'Ball & stick' ? 'is-active' : ''} onClick={() => setRepresentation('Ball & stick')}>Ball & stick</button><button className={representation === 'Space filling' ? 'is-active' : ''} onClick={() => setRepresentation('Space filling')}>Space filling</button></div><div className="cs-toggle-row"><label><input type="checkbox" checked={hydrogens} onChange={e => setHydrogens(e.target.checked)} /> H atoms</label><label><input type="checkbox" checked={labels} onChange={e => setLabels(e.target.checked)} /> Atom labels</label><label><input type="checkbox" checked={carbonLabels} onChange={e => setCarbonLabels(e.target.checked)} /> Carbon labels</label></div></RepresentationCard>
    </div>
    <div className="cs-animation-bar"><IconButton label={playing ? 'Pause ring animation' : 'Play ring animation'} onClick={() => setPlaying(v => !v)} className="cs-play">{playing ? <Pause /> : <Play />}</IconButton><input type="range" min="0" max="100" value={progress} onChange={e => setProgress(+e.target.value)} aria-label="Ring closure animation progress" /><span>{progress}%</span><button onClick={() => { setProgress(0); setPlaying(false); }}><RotateCcw /> Restart</button><div className="cs-anomer-select"><button className={anomer === 'α' ? 'is-active' : ''} onClick={() => setAnomer('α')}>α</button><button className={anomer === 'β' ? 'is-active' : ''} onClick={() => setAnomer('β')}>β</button></div></div>
    <section className="cs-comparison"><div className="cs-comparison-heading"><BookOpen /><div><h3>Starch vs Cellulose <span>— same building block, different linkage</span></h3><p>Linkage geometry changes three-dimensional shape and biological function.</p></div></div><div className="cs-comparison-grid"><article><h4>Starch <b>α(1→4)</b></h4><div className="cs-polymer-line is-alpha">α α α α</div><p>Curved, helical chains compact into plant energy stores. Human amylases can hydrolyse the α linkage.</p></article><article><h4>Cellulose <b>β(1→4)</b></h4><div className="cs-polymer-line is-beta">β  β  β  β</div><p>Straight chains hydrogen-bond into strong fibres. Humans lack cellulase, so cellulose acts as dietary fibre.</p></article></div></section>
  </main><StructureInspector compound={compound} builder={builder} setBuilder={setBuilder} onBuild={buildBond} buildResult={buildResult} open={inspectorOpen} onClose={() => setInspectorOpen(false)} /></>;
}

function ComingPage({ name }) { return <main className="cs-main cs-coming"><FlaskConical /><h2>{name}</h2><p>This laboratory is being assembled in the next implementation stage.</p></main>; }

export default function CarbohydrateStudio() {
  const routeFromLocation = () => {
    const path = window.location.pathname.replace(/\/$/, '');
    return STUDIO_ROUTES.some(([, route]) => route === path) ? path || STUDIO_ROUTES[0][1] : STUDIO_ROUTES[0][1];
  };
  const [route, setRoute] = useState(routeFromLocation);
  const [selectedName, setSelectedName] = useState('Sucrose');
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  useEffect(() => { const fn = () => setRoute(routeFromLocation()); window.addEventListener('popstate', fn); return () => window.removeEventListener('popstate', fn); }, []);
  const navigate = path => { window.history.pushState({}, '', path); setRoute(path); window.scrollTo(0, 0); };
  const pageName = STUDIO_ROUTES.find(([,path]) => path === route)?.[0] || 'Structure';
  useEffect(() => {
    if (pageName === 'Biology') setSelectedName('Starch');
    else if (pageName === 'Properties' || pageName === 'Quizzes') setSelectedName('D-Glucose');
    else setSelectedName('Sucrose');
  }, [pageName]);
  return <div className="cs-app">
    <StudioHeader route={route} navigate={navigate} openLibrary={() => setLibraryOpen(true)} openInspector={() => setInspectorOpen(true)} />
    <div className="cs-shell"><CompoundLibrary selected={selectedName} onSelect={setSelectedName} open={libraryOpen} onClose={() => setLibraryOpen(false)} />
      {pageName === 'Structure' && <StructurePage selectedName={selectedName} setSelectedName={setSelectedName} inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />}
      {pageName === 'Reactions' && <ReactionPage inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />}
      {pageName === 'Properties' && <PropertiesPage inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />}
      {pageName === 'Biology' && <BiologyPage selectedName={selectedName} inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />}
      {pageName === 'Quizzes' && <QuizPage selectedName={selectedName} inspectorOpen={inspectorOpen} setInspectorOpen={setInspectorOpen} />}
    </div>
    {(libraryOpen || inspectorOpen) && <button className="cs-drawer-scrim" aria-label="Close drawers" onClick={() => { setLibraryOpen(false); setInspectorOpen(false); }} />}
  </div>;
}
