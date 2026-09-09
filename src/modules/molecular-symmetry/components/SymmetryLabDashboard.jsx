import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Compass, Eye, EyeOff,
  GripVertical, Hand, HelpCircle, Lightbulb, ListFilter, Maximize2, Minimize2,
  Pause, Play, Rotate3D, RotateCcw, Search, SkipForward, ZoomIn,
} from 'lucide-react';
import { moleculeLibrary } from '../data/moleculeData.js';
import MoleculeViewer3D from './MoleculeViewer3D.jsx';
import './symmetryLabDashboard.css';
import './symmetryLabFit.css';

const angleByGeometry = {
  Bent: '104.5°',
  'Trigonal pyramidal': '107°',
  Tetrahedral: '109.5°',
  'Trigonal planar': '120°',
  'Square planar': '90°',
  Linear: '180°',
  Planar: '120°',
};

function elementSymbol(element) {
  if (!element) return '—';
  if (element.type === 'Cn') return `C${element.order}`;
  if (element.type === 'Sn') return `S${element.order}`;
  if (element.type === 'sigma') return element.id?.includes('bisect') ? 'σᵥ′' : 'σᵥ';
  return element.type;
}

const mappingColors = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185'];

function operationDescription(element, power = 1) {
  if (!element) return 'Choose a symmetry operation';
  if (element.type === 'E') return 'Identity — every atom remains fixed';
  if (element.type === 'Cn') return `${Math.round((360 / (element.order || 1)) * power)}° rotation around the ${elementSymbol(element)} axis`;
  if (element.type === 'Sn') return `${Math.round((360 / (element.order || 1)) * power)}° rotation followed by reflection`;
  if (element.type === 'sigma') return `Reflection through the ${element.label.replace(/^\S+\s*/, '') || 'mirror plane'}`;
  if (element.type === 'i') return 'Inversion through the molecular centre';
  return element.description || element.label;
}

function loadLabStats() {
  try {
    return JSON.parse(localStorage.getItem('cu-symmetry-lab-stats')) || { visited: [], elements: [], verified: [] };
  } catch {
    return { visited: [], elements: [], verified: [] };
  }
}

function MoleculeGlyph({ molecule, compact = false }) {
  const coords = useMemo(() => {
    const raw = molecule.atoms.map(atom => ({
      ...atom,
      x: atom.position[0],
      y: atom.position[1] + atom.position[2] * 0.3,
    }));
    const max = Math.max(1, ...raw.flatMap(atom => [Math.abs(atom.x), Math.abs(atom.y)]));
    return Object.fromEntries(raw.map(atom => [atom.id, { ...atom, x: 50 + atom.x / max * 31, y: 50 - atom.y / max * 29 }]));
  }, [molecule]);

  return <svg className={compact ? 'sym-glyph compact' : 'sym-glyph'} viewBox="0 0 100 100" aria-hidden="true">
    {molecule.bonds.map((bond, index) => <line key={index} x1={coords[bond.from]?.x} y1={coords[bond.from]?.y} x2={coords[bond.to]?.x} y2={coords[bond.to]?.y} />)}
    {molecule.atoms.map(atom => <g key={atom.id}><circle cx={coords[atom.id]?.x} cy={coords[atom.id]?.y} r={compact ? 8 : 10} fill={atom.color} /><circle className="shine" cx={(coords[atom.id]?.x || 0) - 3} cy={(coords[atom.id]?.y || 0) - 3} r="2.2" /></g>)}
  </svg>;
}

function MappingCard({ result }) {
  const rows = result?.mapping || [];
  return <section className="sym-card sym-mapping">
    <div className="sym-card-heading"><h3><ArrowRight size={17}/> Atom Mapping</h3><span><HelpCircle size={13}/> Why?</span></div>
    <div className="sym-map-list">
      {rows.length ? rows.slice(0, 5).map((row, index) => <div key={row.from} style={{ '--map-color': mappingColors[index % mappingColors.length] }}><i className="sym-map-dot"/><b>{row.from}</b><ArrowRight size={14}/><b>{row.to || '—'}</b><CheckCircle2 size={16} className={row.valid ? 'valid' : 'invalid'}/></div>) : <p>Apply the selected operation to verify equivalent positions.</p>}
    </div>
    <div className={`sym-verdict ${result?.valid ? 'valid' : ''}`}><CheckCircle2 size={20}/><div><b>{result?.valid ? 'Equivalent positions verified' : 'Ready to verify'}</b><span>{result?.valid ? 'The molecule is indistinguishable after the operation.' : 'Run the operation to calculate atom mappings.'}</span></div></div>
  </section>;
}

export default function SymmetryLabDashboard({
  molecule, moleculeId, onMoleculeChange, mode, onModeChange, selectedElement,
  onElementChange, operationResult, previewResult, progress, isPlaying, speed,
  operationPower, onOperationPowerChange, onApply, onPause, onStep, onReset,
  onSpeedChange, onProgressChange, showLabels, onToggleLabels, showElements, onToggleElements,
  showGhost, onToggleGhost, bondStyle, onBondStyleChange, viewerRef, completedCount = 0,
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [groupBy, setGroupBy] = useState('none');
  const [tool, setTool] = useState('Rotate');
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [libraryCollapsed, setLibraryCollapsed] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [density, setDensity] = useState('auto');
  const [compareMode, setCompareMode] = useState('side');
  const [hoveredElement, setHoveredElement] = useState(null);
  const [libraryWidth, setLibraryWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(390);
  const [labStats, setLabStats] = useState(loadLabStats);
  const dragRef = useRef(null);
  const filtered = moleculeLibrary.filter(item => {
    const matchesSearch = `${item.name} ${item.formula} ${item.geometry}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (filter === 'All' || item.difficulty === filter);
  }).sort((a, b) => sortBy === 'pointGroup' ? a.pointGroup.localeCompare(b.pointGroup) || a.name.localeCompare(b.name) : sortBy === 'difficulty' ? a.difficulty.localeCompare(b.difficulty) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  const groupedMolecules = useMemo(() => {
    if (groupBy === 'none') return [{ label: '', items: filtered }];
    const keyFor = item => groupBy === 'pointGroup' ? item.pointGroup : item.geometry;
    return Object.entries(Object.groupBy ? Object.groupBy(filtered, keyFor) : filtered.reduce((acc, item) => { const key = keyFor(item); (acc[key] ||= []).push(item); return acc; }, {})).map(([label, items]) => ({ label, items }));
  }, [filtered, groupBy]);
  const elements = molecule.symmetryElements.slice(0, 4);
  const result = operationResult || previewResult;
  const explored = Math.max(labStats.visited.length, completedCount, 1);
  const guideSteps = [
    ['Choose a molecule', 'Search or group the library, then select a structure to investigate.'],
    ['Find an element', 'Hover to preview an axis or plane; click the card or the object in the viewer to select it.'],
    ['Run the operation', 'Apply the operation, scrub the timeline, and compare equivalent atomic positions.'],
    ['Check your reasoning', 'Use the live explanation, color-matched atom mapping, and mastery summary.'],
  ];

  useEffect(() => {
    if (!localStorage.getItem('cu-symmetry-tour-seen')) {
      setGuideOpen(true);
      localStorage.setItem('cu-symmetry-tour-seen', 'true');
    }
  }, []);

  useEffect(() => {
    const next = {
      ...labStats,
      visited: Array.from(new Set([...(labStats.visited || []), molecule.id])),
      elements: Array.from(new Set([...(labStats.elements || []), selectedElement?.type].filter(Boolean))),
      verified: operationResult?.valid ? Array.from(new Set([...(labStats.verified || []), `${molecule.id}:${selectedElement?.id}`])) : labStats.verified || [],
    };
    if (JSON.stringify(next) !== JSON.stringify(labStats)) {
      setLabStats(next);
      localStorage.setItem('cu-symmetry-lab-stats', JSON.stringify(next));
    }
  }, [molecule.id, selectedElement?.id, selectedElement?.type, operationResult?.valid]);

  useEffect(() => {
    const move = event => {
      if (!dragRef.current) return;
      if (dragRef.current.side === 'left') setLibraryWidth(Math.max(220, Math.min(420, dragRef.current.startWidth + event.clientX - dragRef.current.startX)));
      else setRightWidth(Math.max(300, Math.min(470, dragRef.current.startWidth - event.clientX + dragRef.current.startX)));
    };
    const stop = () => { dragRef.current = null; };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', stop); };
  }, []);

  const startResize = (side, event) => {
    dragRef.current = { side, startX: event.clientX, startWidth: side === 'left' ? libraryWidth : rightWidth };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const notice = !operationResult
    ? `Previewing ${operationDescription(hoveredElement || selectedElement, operationPower)}. Apply it when you are ready.`
    : progress < 0.35
      ? 'Watch the atoms leave their starting positions; the translucent structure marks the original geometry.'
      : progress < 0.85
        ? 'Track atoms with matching colors as they approach symmetry-equivalent sites.'
        : result?.valid
          ? 'Equivalent positions are restored: the transformed molecule is indistinguishable from the original.'
          : 'The final positions are not equivalent, so this candidate is not a symmetry element.';

  return <div className={`sym-lab-page sym-density-${density} ${focusMode ? 'sym-focus-mode' : ''}`} style={{ '--sym-library-width': libraryCollapsed ? '64px' : `${libraryWidth}px`, '--sym-right-width': `${rightWidth}px` }}>
    <header className="sym-lab-header">
      <div><div className="sym-crumb">Chemistry <span>/</span> Molecular Symmetry</div><h1>Molecular Symmetry Lab</h1></div>
      <div className="sym-header-actions">
        <div className="sym-mode-tabs">{['Learn','Practice','Challenge'].map(item => <button key={item} className={mode === item ? 'active' : ''} onClick={() => onModeChange(item)}>{item}</button>)}</div>
        <button className="sym-header-btn" onClick={onReset}><RotateCcw size={17}/>Reset</button>
        <button className="sym-header-btn" onClick={() => { setGuideOpen(true); setGuideStep(0); }}><HelpCircle size={17}/>Guide</button>
        <button className="sym-header-btn sym-icon-btn" onClick={() => setDensity(value => value === 'compact' ? 'comfortable' : 'compact')} title="Toggle interface density" aria-label="Toggle interface density"><ListFilter size={17}/></button>
        <button className="sym-header-btn sym-icon-btn" onClick={() => setFocusMode(value => !value)} title="Toggle viewer focus mode" aria-label="Toggle viewer focus mode">{focusMode?<Minimize2 size={17}/>:<Maximize2 size={17}/>}</button>
        <div className="sym-progress"><span>{explored}/{moleculeLibrary.length} molecules · {labStats.elements.length}/5 element types · {labStats.verified.length} verified</span><div>{moleculeLibrary.slice(0, 5).map((_, index) => <i key={index} className={index < Math.min(5, explored) ? 'done' : ''}/>)}</div></div>
      </div>
    </header>

    {guideOpen && <div className="sym-guide sym-tour" role="dialog" aria-label="Molecular symmetry guided tour"><Lightbulb size={18}/><div><small>Step {guideStep + 1} of {guideSteps.length}</small><b>{guideSteps[guideStep][0]}</b><span>{guideSteps[guideStep][1]}</span></div><nav><button disabled={guideStep===0} onClick={() => setGuideStep(value => value - 1)}><ChevronLeft size={15}/>Back</button>{guideStep < guideSteps.length - 1 ? <button onClick={() => setGuideStep(value => value + 1)}>Next<ChevronRight size={15}/></button> : <button onClick={() => setGuideOpen(false)}>Start exploring</button>}</nav></div>}

    <div className="sym-lab-grid">
      <aside className={`sym-card sym-library ${libraryCollapsed ? 'collapsed' : ''}`}>
        <button className="sym-library-toggle" onClick={() => setLibraryCollapsed(value => !value)} aria-label={libraryCollapsed ? 'Expand molecule library' : 'Collapse molecule library'} title={libraryCollapsed ? 'Expand molecule library' : 'Collapse molecule library'}>{libraryCollapsed?<ChevronRight size={18}/>:<ChevronLeft size={18}/>}</button>
        {libraryCollapsed ? <span className="sym-library-vertical">Molecules</span> : <>
        <h2>Molecule Library</h2>
        <label className="sym-search"><Search size={17}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search name, formula, geometry or point group" /></label>
        <div className="sym-filters">{['All','Basic','Intermediate'].map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item}</button>)}</div>
        <div className="sym-library-organize"><select value={sortBy} onChange={event => setSortBy(event.target.value)} aria-label="Sort molecules"><option value="name">Sort: Name</option><option value="pointGroup">Sort: Point group</option><option value="difficulty">Sort: Difficulty</option></select><select value={groupBy} onChange={event => setGroupBy(event.target.value)} aria-label="Group molecules"><option value="none">No groups</option><option value="pointGroup">Group: Point group</option><option value="geometry">Group: Geometry</option></select></div>
        <div className="sym-molecule-list">{groupedMolecules.map(group => <div className="sym-molecule-group" key={group.label || 'all'}>{group.label && <h3>{group.label}</h3>}{group.items.map(item => <button key={item.id} className={moleculeId === item.id ? 'active' : ''} onClick={() => onMoleculeChange(item.id)}><MoleculeGlyph molecule={item} compact/><div><b>{item.name}</b><span>{item.formula} · {item.geometry}</span></div><em>{item.pointGroup}</em></button>)}</div>)}</div>
        </>}
      </aside>

      <button className="sym-resize-handle sym-resize-left" onPointerDown={event => startResize('left', event)} aria-label="Resize molecule library"><GripVertical size={15}/></button>

      <main className="sym-center">
        <section className="sym-card sym-viewer-card">
          <select className="sym-molecule-select" value={moleculeId} onChange={event => onMoleculeChange(event.target.value)}>{moleculeLibrary.map(item => <option key={item.id} value={item.id}>{item.name} ({item.formula})</option>)}</select>
          <MoleculeViewer3D ref={viewerRef} molecule={molecule} selectedElement={hoveredElement || selectedElement} operationResult={operationResult} progress={progress} showLabels={showLabels} showElements={showElements} showGhost={showGhost} bondStyle={bondStyle} height="100%" className="sym-viewer" onElementSelect={elementId => onElementChange(molecule.symmetryElements.find(item => item.id === elementId))} />
          <div className="sym-orientation" aria-label="Camera orientation"><Compass size={15}/>{[['X','right'],['Y','top'],['Z','front']].map(([axis, view]) => <button key={axis} onClick={() => viewerRef.current?.setView(view)} title={`${view} view`}>{axis}</button>)}<button onClick={() => viewerRef.current?.resetCamera()} title="Reset isometric view">3D</button></div>
          <div className="sym-viewer-tools">
            {[[Rotate3D,'Rotate'],[Hand,'Pan'],[ZoomIn,'Zoom']].map(([Icon,label]) => <button key={label} className={tool===label?'active':''} onClick={() => setTool(label)}><Icon size={17}/>{label}</button>)}
            <button className={showLabels?'active':''} onClick={onToggleLabels}>{showLabels?<Eye size={17}/>:<EyeOff size={17}/>}Labels</button>
            <button className={showGhost?'active':''} onClick={onToggleGhost}><Eye size={17}/>Ghost</button>
            <select value={bondStyle} onChange={event => onBondStyleChange(event.target.value)}><option value="ball-stick">Ball and stick</option><option value="space-fill">Space fill</option><option value="wireframe">Wireframe</option></select>
          </div>
        </section>

        <section className="sym-card sym-operation">
          <div className="sym-operation-row">
            <label><span>Operation</span><select value={selectedElement?.id || ''} onChange={event => onElementChange(molecule.symmetryElements.find(item => item.id === event.target.value))}>{molecule.symmetryElements.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
            {(selectedElement?.type === 'Cn' || selectedElement?.type === 'Sn') && <label className="sym-power"><span>Power</span><select value={operationPower} onChange={event => onOperationPowerChange(Number(event.target.value))}>{Array.from({length:selectedElement.order || 1},(_,index)=><option key={index+1} value={index+1}>{elementSymbol(selectedElement)}^{index+1}</option>)}</select></label>}
            <button className="sym-apply" onClick={onApply}><Play size={18}/>Apply {elementSymbol(selectedElement)} Operation</button>
            <button onClick={onPause}><Pause size={17}/>{isPlaying?'Pause':'Paused'}</button><button onClick={onStep}><SkipForward size={17}/>Step</button><button onClick={onReset}><RotateCcw size={17}/>Reset</button>
          </div>
          <p className="sym-operation-readable">{operationDescription(selectedElement, operationPower)}</p>
          <div className="sym-sliders"><div className="sym-speed"><span>Animation speed</span><small>Slow</small><input aria-label="Animation speed" type="range" min="0.4" max="2.5" step="0.1" value={speed} onChange={event => onSpeedChange(Number(event.target.value))}/><small>Fast</small></div><div className="sym-timeline"><span>Operation timeline</span><input aria-label="Operation timeline" type="range" min="0" max="1" step="0.01" value={progress} onChange={event => onProgressChange(Number(event.target.value))}/><b>{Math.round(progress*100)}%</b></div></div>
          <div className="sym-compare-tabs" aria-label="Comparison view">{[['side','Side by side'],['overlay','Overlay'],['difference','Differences']].map(([value,label])=><button key={value} className={compareMode===value?'active':''} onClick={()=>setCompareMode(value)}>{label}</button>)}</div>
          <div className={`sym-compare mode-${compareMode}`}>{compareMode === 'difference' ? <div className="sym-difference"><span>Atoms affected</span><strong>{(result?.mapping || []).filter(row=>!row.unchanged).map(row=>row.from).join(', ') || 'Apply an operation to inspect changes'}</strong></div> : <><div><span>Before operation</span><MoleculeGlyph molecule={molecule}/></div>{compareMode==='side'&&<ArrowRight className="compare-arrow"/>}<div><span>After {elementSymbol(selectedElement)} operation</span><MoleculeGlyph molecule={molecule}/></div></>}</div>
        </section>
      </main>

      <button className="sym-resize-handle sym-resize-right" onPointerDown={event => startResize('right', event)} aria-label="Resize insight panel"><GripVertical size={15}/></button>
      <aside className="sym-right">
        <section className="sym-card sym-summary"><div><h2>{molecule.name}</h2><p>{molecule.formula} · {molecule.geometry}</p></div><strong>{molecule.pointGroup}</strong><MoleculeGlyph molecule={molecule}/><div className="sym-summary-metrics"><span>Point group<b>{molecule.pointGroup}</b></span><span>Bond angle<b>{angleByGeometry[molecule.geometry] || 'Varies'}</b></span></div></section>
        <section className="sym-card sym-elements"><div className="sym-card-heading"><h3>Symmetry Elements</h3><button onClick={onToggleElements} aria-label={showElements?'Hide symmetry elements':'Show symmetry elements'}>{showElements?<Eye size={16}/>:<EyeOff size={16}/>}</button></div><div>{elements.map(element => <button key={element.id} onMouseEnter={()=>setHoveredElement(element)} onMouseLeave={()=>setHoveredElement(null)} onFocus={()=>setHoveredElement(element)} onBlur={()=>setHoveredElement(null)} onClick={() => onElementChange(element)} className={selectedElement?.id===element.id?'active':''} aria-pressed={selectedElement?.id===element.id}><b>{elementSymbol(element)}</b><span>{element.label.replace(/^\S+\s*/, '') || 'Identity'}</span>{selectedElement?.id===element.id&&<em>Active</em>}</button>)}</div><div className="sym-element-legend"><span><i className="axis"/>Rotation axis</span><span><i className="plane"/>Mirror plane</span><span><i className="ghost"/>Original position</span><span><i className="mapped"/>Mapped atoms</span></div></section>
        <section className="sym-card sym-notice" aria-live="polite"><h3><Lightbulb size={18}/>What to notice</h3><p>{notice}</p></section>
        <MappingCard result={result}/>
      </aside>
    </div>
  </div>;
}
