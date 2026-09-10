import { useMemo, useState } from 'react';
import {
  Atom, BarChart3, CheckCircle2, ChevronRight, FlaskConical,
  GitCompareArrows, GripVertical, Info, Layers3, Maximize2, Minimize2,
  Minus, Plus, Redo2, RotateCcw, ShieldCheck, Sparkles, Target,
  Undo2, X, Zap,
} from 'lucide-react';
import { elements } from '../../data/elements.js';
import { SimPanel } from './SimulationShell.jsx';
import './nuclearChart.css';
import './nuclearChartResponsive.css';
import './atomBuilder.css';

const DEFAULT_COUNTS = { p: 6, n: 6, e: 6 };
const shellCaps = [2, 8, 8, 18];
const particleMeta = {
  proton: { key: 'p', label: 'Protons', charge: '+1 charge', symbol: '+', color: '#f43f5e', pattern: 'striped', max: 18 },
  neutron: { key: 'n', label: 'Neutrons', charge: '0 charge', symbol: 'N', color: '#2786f5', pattern: 'dotted', max: 24 },
  electron: { key: 'e', label: 'Electrons', charge: '−1 charge', symbol: '−', color: '#f6c945', pattern: 'ringed', max: 20 },
};
const particleTypes = Object.keys(particleMeta);
const presets = [
  { name: 'Hydrogen', short: 'H', p: 1, n: 0, e: 1 },
  { name: 'Carbon-12', short: 'C', p: 6, n: 6, e: 6 },
  { name: 'Oxygen-16', short: 'O', p: 8, n: 8, e: 8 },
  { name: 'Sodium ion', short: 'Na⁺', p: 11, n: 12, e: 10 },
  { name: 'Chloride ion', short: 'Cl⁻', p: 17, n: 18, e: 18 },
];
const challenges = [
  { name: 'Neutral oxygen', hint: 'Build oxygen with no net charge.', target: { p: 8, n: 8, e: 8 } },
  { name: 'Sodium ion', hint: 'Create Na⁺ with a full outer shell.', target: { p: 11, n: 12, e: 10 } },
  { name: 'Carbon isotope', hint: 'Build carbon-14 for isotope study.', target: { p: 6, n: 8, e: 6 } },
];

const electronShells = count => {
  let remaining = count;
  return shellCaps.map(capacity => {
    const amount = Math.min(capacity, remaining);
    remaining -= amount;
    return amount;
  });
};
const stabilityFor = (protons, neutrons) => {
  if (!protons) return ['No nucleus', 'unstable'];
  if (protons === 1 && neutrons <= 2) return ['Stable', 'stable'];
  const ratio = neutrons / protons;
  return ratio >= 0.85 && ratio <= 1.3 ? ['Likely stable', 'stable'] : ['Unstable', 'unstable'];
};
const elementFor = protonCount => elements.find(item => item.atomicNumber === protonCount);
const sameCounts = (left, right) => left.p === right.p && left.n === right.n && left.e === right.e;

function Particle({ type, size = 42, style, draggable = false, onDragStart, onDragEnd, className = '' }) {
  const meta = particleMeta[type];
  return <span aria-hidden="true" draggable={draggable} onDragStart={onDragStart} onDragEnd={onDragEnd} className={`atom-particle ${type} ${meta.pattern} ${className}`} style={{ '--particle': meta.color, width: size, height: size, ...style }}>{meta.symbol}</span>;
}

const chartPoints = Array.from({ length: 18 }, (_, z) => {
  const protonNumber = z + 1;
  return Array.from({ length: 13 }, (_, offset) => {
    const neutronNumber = Math.max(0, protonNumber - 2 + offset);
    const [, state] = stabilityFor(protonNumber, neutronNumber);
    return { z: protonNumber, n: neutronNumber, state };
  });
}).flat().filter((point, index, points) => points.findIndex(item => item.z === point.z && item.n === point.n) === index);

function NuclearChart({ protons, neutrons, onSelect }) {
  const maxNeutrons = 30;
  return <section className="nuclear-chart nuclear-chart-expanded" aria-label="Nuclear Chart (Z vs N)">
    <div className="nuclear-chart-heading"><div><h2>Nuclear Chart <span>(Z vs N)</span></h2><p>Choose a square to load its proton and neutron balance.</p></div><div className="nuclear-legend"><span><i className="stable" />Likely stable</span><span><i className="radioactive" />Unstable</span></div></div>
    <div className="nuclear-plot"><div className="nuclear-axis-y">Protons (Z)</div><div className="nuclear-grid-lines" aria-hidden="true" />
      {chartPoints.map(point => <button type="button" key={`${point.z}-${point.n}`} className={`nuclear-point ${point.state === 'stable' ? 'stable' : 'radioactive'} ${point.z === protons && point.n === neutrons ? 'selected' : ''}`} style={{ left: `${(point.n / maxNeutrons) * 100}%`, bottom: `${((point.z - 1) / 17) * 100}%` }} onClick={() => onSelect(point.z, point.n)} aria-label={`Select nuclide with ${point.z} protons and ${point.n} neutrons, ${point.state}`} title={`Z ${point.z} · N ${point.n}`} />)}
      <div className="nuclear-axis-x">Neutrons (N)</div><div className="nuclear-ticks-x">{[0, 5, 10, 15, 20, 25, 30].map(value => <span key={value} style={{ left: `${(value / maxNeutrons) * 100}%` }}>{value}</span>)}</div><div className="nuclear-ticks-y">{[1, 4, 8, 12, 16, 18].map(value => <span key={value} style={{ bottom: `${((value - 1) / 17) * 100}%` }}>{value}</span>)}</div>
    </div>
  </section>;
}

function ParticleStepper({ type, value, onChange }) {
  const meta = particleMeta[type];
  return <div className="particle-stepper"><Particle type={type} size={34} /><span><strong>{meta.label}</strong><small>{meta.charge}</small></span><button type="button" onClick={() => onChange(value - 1)} disabled={value <= 0} aria-label={`Remove ${meta.label}`}><Minus size={16} /></button><output aria-label={`${meta.label} count`}>{value}</output><button type="button" onClick={() => onChange(value + 1)} disabled={value >= meta.max} aria-label={`Add ${meta.label}`}><Plus size={16} /></button></div>;
}

function SummaryCard({ icon, label, value, tone }) {
  return <div className="atom-summary-card" style={{ '--summary-tone': tone }}>{icon}<span>{label}</span><strong>{value}</strong></div>;
}

export default function AtomBuilderPage() {
  const [counts, setCounts] = useState(DEFAULT_COUNTS);
  const [view, setView] = useState('Atom');
  const [infoTab, setInfoTab] = useState('Atom Info');
  const [notes, setNotes] = useState('');
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [feedback, setFeedback] = useState('Carbon-12 is ready. Change a particle to begin exploring.');
  const [dragType, setDragType] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [chartOpen, setChartOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [comparePreset, setComparePreset] = useState(presets[2]);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [mobilePanel, setMobilePanel] = useState(null);

  const element = elementFor(counts.p);
  const shells = electronShells(counts.e);
  const charge = counts.p - counts.e;
  const mass = counts.p + counts.n;
  const [stability, stabilityClass] = stabilityFor(counts.p, counts.n);
  const symbol = element?.symbol || '?';
  const ionText = !element ? 'Not an element' : charge === 0 ? 'Neutral atom' : charge > 0 ? `${charge}+ cation` : `${Math.abs(charge)}− anion`;
  const challenge = challenges[activeChallenge];
  const challengeComplete = sameCounts(counts, challenge.target);
  const nucleus = useMemo(() => Array.from({ length: Math.min(42, counts.p + counts.n) }, (_, index) => index < counts.p ? 'proton' : 'neutron').sort((a, b) => (a === b ? 0 : a === 'proton' ? (counts.p % 2 ? -1 : 1) : -1)), [counts.p, counts.n]);

  const describeChange = (before, after, reason) => {
    if (reason) return reason;
    const beforeElement = elementFor(before.p)?.name || 'an unknown element';
    const afterElement = elementFor(after.p)?.name || 'an unknown element';
    if (before.p !== after.p) return `Atomic number changed: ${beforeElement} → ${afterElement}.`;
    if (before.e !== after.e) { const nextCharge = after.p - after.e; return nextCharge === 0 ? `${afterElement} is now electrically neutral.` : `Net charge changed to ${nextCharge > 0 ? `${nextCharge}+` : `${Math.abs(nextCharge)}−`}.`; }
    if (before.n !== after.n) return `Mass number changed from ${before.p + before.n} to ${after.p + after.n}; you created a new isotope.`;
    return 'Atom updated.';
  };
  const commitCounts = (nextValue, reason) => {
    const next = typeof nextValue === 'function' ? nextValue(counts) : nextValue;
    if (sameCounts(counts, next)) return;
    setUndoStack(stack => [...stack.slice(-29), counts]); setRedoStack([]); setCounts(next);
    setFeedback(describeChange(counts, next, reason)); setAnimationKey(key => key + 1);
  };
  const updateParticle = (key, value) => {
    const type = particleTypes.find(item => particleMeta[item].key === key); const meta = particleMeta[type];
    commitCounts({ ...counts, [key]: Math.max(0, Math.min(meta.max, value)) });
  };
  const undo = () => { if (!undoStack.length) return; const previous = undoStack.at(-1); setUndoStack(stack => stack.slice(0, -1)); setRedoStack(stack => [...stack, counts]); setCounts(previous); setFeedback('Undid the last atom change.'); setAnimationKey(key => key + 1); };
  const redo = () => { if (!redoStack.length) return; const next = redoStack.at(-1); setRedoStack(stack => stack.slice(0, -1)); setUndoStack(stack => [...stack, counts]); setCounts(next); setFeedback('Restored the atom change.'); setAnimationKey(key => key + 1); };
  const selectPreset = preset => commitCounts({ p: preset.p, n: preset.n, e: preset.e }, `${preset.name} loaded: ${preset.p} protons, ${preset.n} neutrons and ${preset.e} electrons.`);
  const beginDrag = (event, type) => { event.dataTransfer.effectAllowed = 'copy'; event.dataTransfer.setData('particle', type); setDragType(type); setFeedback(`${particleMeta[type].label.slice(0, -1)} selected. Drop it on the ${type === 'electron' ? 'electron shell' : 'nucleus'}.`); };
  const endDrag = () => { setDragType(null); setDropTarget(null); };
  const handleDragOver = (event, target) => { event.preventDefault(); event.dataTransfer.dropEffect = 'copy'; setDropTarget(target); };
  const addDropped = (event, target) => { event.preventDefault(); event.stopPropagation(); const type = event.dataTransfer.getData('particle') || dragType; const valid = (target === 'nucleus' && type !== 'electron') || (target === 'shell' && type === 'electron'); if (valid && type) { const meta = particleMeta[type]; updateParticle(meta.key, counts[meta.key] + 1); } else setFeedback(type === 'electron' ? 'Electrons belong on a shell.' : 'Protons and neutrons belong in the nucleus.'); endDrag(); };
  const reset = () => commitCounts(DEFAULT_COUNTS, 'Reset complete: Carbon-12 restored with 6 protons, 6 neutrons and 6 electrons.');
  const ratio = counts.p ? counts.n / counts.p : 0;
  const stabilityHelp = stabilityClass === 'stable' ? 'The neutron-to-proton balance is inside the stable learning range.' : !counts.p ? 'Add a proton to create a nucleus and define an element.' : ratio < 0.85 ? `This nucleus is proton-rich. Try adding ${Math.max(1, Math.ceil(counts.p * 0.85 - counts.n))} neutron(s).` : `This nucleus is neutron-rich. Try removing ${Math.max(1, Math.ceil(counts.n - counts.p * 1.3))} neutron(s).`;
  const decayMode = stabilityClass === 'stable' ? 'No decay predicted' : ratio > 1.3 ? 'Beta minus (β−)' : 'Beta plus (β+)';
  const daughterProtons = stabilityClass === 'stable' ? counts.p : ratio > 1.3 ? counts.p + 1 : Math.max(0, counts.p - 1);
  const daughter = elementFor(daughterProtons);

  return <div className={`science-sim atom-builder-v2 ${focusMode ? 'atom-focus-mode' : ''}`}>
    <header className="atom-builder-header"><div className="atom-heading"><Atom size={34} /><div><h1>Build an Atom</h1><p>Assemble particles and watch identity, charge and stability respond.</p></div></div><div className="atom-header-actions"><button type="button" onClick={() => setChartOpen(true)}><BarChart3 size={17} /> Nuclear chart</button><button type="button" aria-pressed={focusMode} onClick={() => setFocusMode(value => !value)}>{focusMode ? <Minimize2 size={17} /> : <Maximize2 size={17} />}{focusMode ? 'Exit focus' : 'Focus mode'}</button></div></header>

    <div className="atom-workspace">
      <aside className={`atom-build-rail ${mobilePanel === 'build' ? 'mobile-open' : ''}`}><div className="mobile-sheet-handle" /><div className="rail-heading"><div><h2>Build tools</h2><p>Drag or use the steppers</p></div><button type="button" className="mobile-sheet-close" onClick={() => setMobilePanel(null)} aria-label="Close build tools"><X size={18} /></button></div>
        <div className="particle-tray-v2">{particleTypes.map(type => { const meta = particleMeta[type]; return <div key={type} className={`tray-card-v2 ${dragType === type ? 'dragging' : ''}`} draggable role="button" tabIndex={0} aria-label={`Drag ${type} to atom`} onDragStart={event => beginDrag(event, type)} onDragEnd={endDrag} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') updateParticle(meta.key, counts[meta.key] + 1); }}><GripVertical className="drag-grip" size={17} /><Particle type={type} size={46} /><span><strong>{meta.label}</strong><small>{meta.charge}</small></span><em>Drag me</em></div>; })}</div>
        <div className="particle-controls-v2"><h3>Particle controls</h3>{particleTypes.map(type => <ParticleStepper key={type} type={type} value={counts[particleMeta[type].key]} onChange={value => updateParticle(particleMeta[type].key, value)} />)}</div>
        <div className="history-controls"><button type="button" onClick={undo} disabled={!undoStack.length} aria-label="Undo atom change"><Undo2 size={16} /> Undo</button><button type="button" onClick={redo} disabled={!redoStack.length} aria-label="Redo atom change"><Redo2 size={16} /> Redo</button><button type="button" onClick={reset} disabled={sameCounts(counts, DEFAULT_COUNTS)} title="Restore Carbon-12: 6 protons, 6 neutrons and 6 electrons"><RotateCcw size={16} /> Reset</button></div>
      </aside>

      <main className="atom-center-column"><div className="atom-stage-toolbar"><div className="atom-view-tabs" role="group" aria-label="Atom display">{['Atom', 'Symbol', 'Nucleus'].map(tab => <button type="button" key={tab} aria-pressed={view === tab} className={view === tab ? 'active' : ''} onClick={() => setView(tab)}>{tab}</button>)}</div><div className={`challenge-pill ${challengeComplete ? 'complete' : ''}`}><Target size={16} /><span><small>Current challenge</small><strong>{challengeComplete ? 'Complete!' : challenge.name}</strong></span></div></div>
        <SimPanel className={`atom-stage-v2 ${dragType ? 'is-dragging' : ''}`}><div className="atom-stage-title"><strong>{element?.name || 'Build your atom'}{element && `-${mass}`}</strong><span>{counts.p} protons · {counts.n} neutrons · {counts.e} electrons</span></div><div className="atom-view-frame" key={view}>
          {view === 'Symbol' ? <div className="nuclide-symbol-v2" aria-label={`${element?.name || 'Unknown'}, mass ${mass}, atomic number ${counts.p}`}><div><sup>{mass}</sup><strong>{symbol}</strong><sub>{counts.p}</sub><em>{charge === 0 ? '0' : charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`}</em></div><p>{element?.name || 'Add protons'}</p><span>{ionText}</span></div> : <div className={`shell-zone-v2 ${view === 'Nucleus' ? 'nucleus-only' : ''} ${dragType === 'electron' ? 'valid-drop' : dragType ? 'invalid-drop' : ''} ${dropTarget === 'shell' ? 'drop-hover' : ''}`} onDragOver={event => handleDragOver(event, 'shell')} onDrop={event => addDropped(event, 'shell')}>
            {view === 'Atom' && shells.map((amount, shellIndex) => (amount > 0 || shellIndex < 2) && <div className="electron-shell-v2" key={shellIndex} style={{ '--shell-size': `${220 + shellIndex * 142}px` }}>{Array.from({ length: amount }, (_, index) => { const angle = (index / amount) * Math.PI * 2 - Math.PI / 2; const radius = 106 + shellIndex * 71; return <Particle key={`${animationKey}-${shellIndex}-${index}`} type="electron" size={30} className="particle-enter" style={{ left: `calc(50% + ${Math.cos(angle) * radius}px - 15px)`, top: `calc(50% + ${Math.sin(angle) * radius}px - 15px)`, '--enter-delay': `${index * 24}ms` }} />; })}<span className="shell-cap-v2"><strong>{amount}</strong> of {shellCaps[shellIndex]} electrons</span></div>)}
            <div className={`nucleus-v2 ${dragType && dragType !== 'electron' ? 'valid-drop' : dragType ? 'invalid-drop' : ''} ${dropTarget === 'nucleus' ? 'drop-hover' : ''}`} onDragOver={event => handleDragOver(event, 'nucleus')} onDrop={event => addDropped(event, 'nucleus')}>{nucleus.map((type, index) => { const angle = index * 2.4; const radius = Math.min(view === 'Nucleus' ? 106 : 72, (view === 'Nucleus' ? 18 : 13) * Math.sqrt(index)); const size = view === 'Nucleus' ? 58 : 40; return <Particle key={`${animationKey}-${type}-${index}`} type={type} size={size} className="particle-enter" style={{ left: `calc(50% + ${Math.cos(angle) * radius}px - ${size / 2}px)`, top: `calc(50% + ${Math.sin(angle) * radius}px - ${size / 2}px)`, '--enter-delay': `${index * 18}ms` }} />; })}{dragType && dragType !== 'electron' && <Particle type={dragType} size={view === 'Nucleus' ? 58 : 40} className="particle-ghost" />}{dragType && <span className="drop-label">{dragType === 'electron' ? 'Nucleons only' : 'Drop in nucleus'}</span>}</div>
            {dragType === 'electron' && <Particle type="electron" size={34} className="electron-ghost particle-ghost" />}{dragType && <span className="shell-drop-label">{dragType === 'electron' ? 'Drop on a shell' : 'Electrons only on shells'}</span>}
          </div>}
        </div><div className="atom-feedback" role="status" aria-live="polite"><Zap size={15} /><span>{feedback}</span></div></SimPanel>
        <section className="challenge-bar" aria-label="Guided challenges"><div><Target size={18} /><span><strong>{challenge.name}</strong><small>{challengeComplete ? 'Well done — challenge complete.' : challenge.hint}</small></span></div><div className="challenge-options">{challenges.map((item, index) => <button type="button" key={item.name} className={activeChallenge === index ? 'active' : ''} onClick={() => setActiveChallenge(index)} aria-label={`Choose challenge: ${item.name}`}>{challengeComplete && activeChallenge === index ? <CheckCircle2 size={15} /> : index + 1}</button>)}</div></section>
      </main>

      <aside className={`atom-insight-rail ${mobilePanel === 'info' ? 'mobile-open' : ''}`}><div className="mobile-sheet-handle" /><div className="rail-heading"><div><h2>Live insights</h2><p>Updates as you build</p></div><button type="button" className="mobile-sheet-close" onClick={() => setMobilePanel(null)} aria-label="Close insights"><X size={18} /></button></div>
        <SimPanel className="atom-info-v2"><div className="atom-info-tabs-v2">{['Atom Info', 'Isotope & Decay', 'Properties', 'Notes'].map(tab => <button type="button" key={tab} aria-pressed={infoTab === tab} className={infoTab === tab ? 'active' : ''} onClick={() => setInfoTab(tab)}>{tab}</button>)}</div>
          {infoTab === 'Atom Info' && <div className="atom-info-body-v2"><div className="identity-block"><span>{symbol}</span><div><h2>{element?.name || 'Unknown atom'}</h2><p>{ionText}</p></div></div>{[['Atomic number', counts.p], ['Mass number', mass], ['Net charge', charge], ['Stability', stability]].map(([key, value]) => <div className="info-row" key={key}><span>{key}</span><strong className={key === 'Stability' ? stabilityClass : ''}>{value}</strong></div>)}<div className={`stability-explanation ${stabilityClass}`}><ShieldCheck size={18} /><p>{stabilityHelp}</p></div></div>}
          {infoTab === 'Isotope & Decay' && <div className="atom-info-body-v2"><h2>{symbol}-{mass} decay pathway</h2><p className="info-copy">A visual learning estimate based on neutron-to-proton balance.</p><div className="decay-timeline"><div className="timeline-node"><span>{symbol}</span><small>Parent<br />{counts.p}p · {counts.n}n</small></div><div className="timeline-path"><ChevronRight /><strong>{decayMode}</strong><small>{stabilityClass === 'stable' ? 'No emission' : ratio > 1.3 ? 'electron + antineutrino' : 'positron + neutrino'}</small></div><div className="timeline-node daughter"><span>{daughter?.symbol || symbol}</span><small>Daughter<br />{stabilityClass === 'stable' ? 'unchanged' : `${daughterProtons}p · ${counts.n + (ratio > 1.3 ? -1 : 1)}n`}</small></div></div><div className="half-life-card"><span>Half-life</span><strong>{stabilityClass === 'stable' ? 'Stable' : 'Varies by isotope'}</strong></div></div>}
          {infoTab === 'Properties' && <div className="atom-info-body-v2"><h2>Calculated properties</h2>{[['Electron configuration', shells.filter(Boolean).join(' · ') || '—'], ['Valence electrons', shells.filter(Boolean).at(-1) || 0], ['Charge balance', charge === 0 ? 'Neutral' : charge > 0 ? 'Electron deficient' : 'Electron rich'], ['Nucleus particles', counts.p + counts.n], ['N : Z ratio', counts.p ? ratio.toFixed(2) : '—']].map(([key, value]) => <div className="info-row" key={key}><span>{key}</span><strong>{value}</strong></div>)}</div>}
          {infoTab === 'Notes' && <div className="atom-info-body-v2"><h2>Learning notes</h2><textarea className="atom-notes-v2" value={notes} onChange={event => setNotes(event.target.value)} placeholder="Record an observation about this atom…" /><p className="info-copy">Notes remain available while you experiment.</p></div>}
        </SimPanel>
        <section className="preset-panel"><div className="panel-label"><FlaskConical size={16} /><span>Quick presets</span></div><div className="preset-chips">{presets.map(preset => <button type="button" key={preset.name} className={sameCounts(counts, preset) ? 'active' : ''} onClick={() => selectPreset(preset)}><strong>{preset.short}</strong><span>{preset.name}</span></button>)}</div></section>
        <section className="compare-panel"><button type="button" className="compare-toggle" aria-expanded={compareOpen} onClick={() => setCompareOpen(value => !value)}><GitCompareArrows size={17} /><span>Compare atoms</span><ChevronRight className={compareOpen ? 'open' : ''} size={17} /></button>{compareOpen && <div className="compare-body"><div className="compare-targets">{presets.map(preset => <button type="button" key={preset.name} className={comparePreset.name === preset.name ? 'active' : ''} onClick={() => setComparePreset(preset)}>{preset.short}</button>)}</div><div className="compare-cards"><div><small>Current</small><strong>{symbol}-{mass}</strong><span>{charge === 0 ? 'Neutral' : ionText}</span></div><GitCompareArrows size={18} /><div><small>Reference</small><strong>{comparePreset.short}</strong><span>{comparePreset.p}p · {comparePreset.n}n · {comparePreset.e}e</span></div></div></div>}</section>
      </aside>
    </div>

    <section className="atom-summary-grid" aria-label="Atom summary"><SummaryCard icon={<Atom />} label="Element" value={element?.name || 'Unknown'} tone="#49d7ff" /><SummaryCard icon={<Sparkles />} label="Isotope" value={`${mass}${symbol}`} tone="#c3a6ff" /><SummaryCard icon={<Layers3 />} label="Electron configuration" value={shells.filter(Boolean).join(' · ') || '—'} tone="#ffd66b" /><SummaryCard icon={<ShieldCheck />} label="Stability" value={stability} tone={stabilityClass === 'stable' ? '#62e7a4' : '#fb7185'} /></section>
    <nav className="atom-mobile-dock" aria-label="Atom Builder panels"><button type="button" aria-pressed={mobilePanel === 'build'} onClick={() => setMobilePanel(mobilePanel === 'build' ? null : 'build')}><Plus size={18} />Particles</button><button type="button" aria-pressed={mobilePanel === 'info'} onClick={() => setMobilePanel(mobilePanel === 'info' ? null : 'info')}><Info size={18} />Insights</button><button type="button" onClick={() => setChartOpen(true)}><BarChart3 size={18} />Chart</button></nav>
    {mobilePanel && <button type="button" className="mobile-sheet-backdrop" aria-label="Close panel" onClick={() => setMobilePanel(null)} />}
    {chartOpen && <div className="atom-modal-backdrop" role="presentation" onMouseDown={event => { if (event.currentTarget === event.target) setChartOpen(false); }}><div className="atom-chart-modal" role="dialog" aria-modal="true" aria-labelledby="nuclear-chart-title"><div className="modal-heading"><div><span>Isotope explorer</span><h2 id="nuclear-chart-title">Nuclear Chart</h2></div><button type="button" onClick={() => setChartOpen(false)} aria-label="Close nuclear chart"><X size={21} /></button></div><NuclearChart protons={counts.p} neutrons={counts.n} onSelect={(p, n) => { commitCounts({ ...counts, p, n }, `Loaded ${elementFor(p)?.name || 'element'}-${p + n} from the nuclear chart.`); setChartOpen(false); }} /></div></div>}
  </div>;
}
