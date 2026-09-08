import { useMemo, useState } from 'react';
import { Atom, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { elements } from '../../data/elements.js';
import { Metric, ResetButton, SimPanel, Stepper } from './SimulationShell.jsx';

const shellCaps = [2, 8, 8, 18];
const particleStyles = { proton: ['+', '#ef334c'], neutron: ['', '#1469dd'], electron: ['−', '#ffd447'] };
const presets = [{ name: 'Hydrogen', p: 1, n: 0, e: 1 }, { name: 'Carbon-12', p: 6, n: 6, e: 6 }, { name: 'Oxygen-16', p: 8, n: 8, e: 8 }, { name: 'Sodium ion', p: 11, n: 12, e: 10 }, { name: 'Chloride ion', p: 17, n: 18, e: 18 }];
const electronShells = count => { let left = count; return shellCaps.map(cap => { const n = Math.min(cap, left); left -= n; return n; }); };
const stabilityFor = (p, n) => { if (!p) return ['No nucleus', 'unstable']; if (p === 1 && n <= 2) return ['Stable', 'stable']; const ratio = n / p; return (p <= 20 ? ratio >= .85 && ratio <= 1.3 : ratio >= 1.2 && ratio <= 1.65) ? ['Likely stable', 'stable'] : ['Unstable', 'unstable']; };

function Particle({ type, size = 42, style, draggable = false, onDragStart }) {
  const [symbol, color] = particleStyles[type];
  return <span draggable={draggable} onDragStart={onDragStart} className={`atom-particle ${type}`} style={{ '--particle': color, width: size, height: size, ...style }}>{symbol}</span>;
}

export default function AtomBuilderPage() {
  const [counts, setCounts] = useState({ p: 6, n: 6, e: 6 });
  const [view, setView] = useState('Atom');
  const element = elements.find(item => item.atomicNumber === counts.p);
  const shells = electronShells(counts.e), charge = counts.p - counts.e, mass = counts.p + counts.n;
  const [stability, stabilityClass] = stabilityFor(counts.p, counts.n);
  const update = (key, value) => setCounts(prev => ({ ...prev, [key]: value }));
  const addDropped = (event, target) => { event.preventDefault(); const type = event.dataTransfer.getData('particle'); const key = type === 'proton' ? 'p' : type === 'neutron' ? 'n' : 'e'; if ((target === 'nucleus' && type !== 'electron') || (target === 'shell' && type === 'electron')) update(key, counts[key] + 1); };
  const nucleus = useMemo(() => Array.from({ length: Math.min(36, counts.p + counts.n) }, (_, index) => index < counts.p ? 'proton' : 'neutron').sort((a, b) => (a === b ? 0 : a === 'proton' ? (counts.p % 2 ? -1 : 1) : -1)), [counts.p, counts.n]);
  const symbol = element?.symbol || '?';
  const ionText = !element ? 'Not an element' : charge === 0 ? 'Neutral atom' : charge > 0 ? `${charge}+ cation` : `${Math.abs(charge)}− anion`;
  const reset = () => setCounts({ p: 6, n: 6, e: 6 });

  return <div className="science-sim atom-builder">
    <header className="sim-header"><div><div className="sim-title"><Atom className="inline mr-3 text-cyan-300" size={43}/>Build an Atom</div><p className="sim-subtitle">Explore · build · discover — assemble particles and watch identity, charge and stability update.</p></div><div className="sim-tabs">{['Atom','Symbol','Nucleus'].map(tab => <button key={tab} className={view === tab ? 'active' : ''} onClick={() => setView(tab)}>{tab}</button>)}</div></header>
    <div className="sim-grid atom-layout">
      <SimPanel className="particle-tray"><h2 className="sim-panel-title">Particle Tray</h2><p className="sim-panel-subtitle">Drag particles into the atom</p>
        {['proton','neutron','electron'].map((type, i) => <div className="tray-card" key={type}><Particle type={type} size={58} draggable onDragStart={e => e.dataTransfer.setData('particle', type)}/><div><strong>{type[0].toUpperCase()+type.slice(1)}s</strong><small>{i === 0 ? '+1 charge' : i === 1 ? '0 charge' : '−1 charge'}</small></div><b>{counts[i === 0 ? 'p' : i === 1 ? 'n' : 'e']}</b></div>)}
        <div className="atom-tip"><Info size={25}/><span><strong>Tip</strong>Drag nucleons to the center and electrons onto a shell. You can also use the controls.</span></div>
      </SimPanel>
      <SimPanel className="atom-stage" onDragOver={e => e.preventDefault()}>
        {view === 'Symbol' ? <div className="nuclide-symbol"><sup>{mass}</sup><strong>{symbol}</strong><sub>{counts.p}</sub><em>{charge === 0 ? '' : charge > 0 ? `${charge}+` : `${Math.abs(charge)}−`}</em><p>{element?.name || 'Add protons'}</p></div> : <div className={`shell-zone ${view === 'Nucleus' ? 'nucleus-only' : ''}`} onDrop={e => addDropped(e, 'shell')}>
          {view === 'Atom' && shells.map((amount, shellIndex) => amount > 0 || shellIndex < 2 ? <div className="electron-shell" key={shellIndex} style={{ width: 190 + shellIndex * 120, height: 190 + shellIndex * 120 }}>{Array.from({ length: amount }, (_, i) => { const angle = (i / amount) * Math.PI * 2 - Math.PI/2, radius = 92 + shellIndex * 60; return <Particle key={i} type="electron" size={32} style={{ left:`calc(50% + ${Math.cos(angle)*radius}px - 16px)`,top:`calc(50% + ${Math.sin(angle)*radius}px - 16px)` }}/>; })}<span className="shell-cap">{amount}/{shellCaps[shellIndex]}</span></div> : null)}
          <div className="nucleus" onDrop={e => { e.stopPropagation(); addDropped(e, 'nucleus'); }} onDragOver={e => e.preventDefault()}>{nucleus.map((type,i) => { const angle=i*2.4, radius=Math.min(72,13*Math.sqrt(i)); return <Particle key={i} type={type} size={view === 'Nucleus' ? 54 : 40} style={{ left:`calc(50% + ${Math.cos(angle)*radius}px - ${view === 'Nucleus'?27:20}px)`,top:`calc(50% + ${Math.sin(angle)*radius}px - ${view === 'Nucleus'?27:20}px)` }}/>; })}</div>
        </div>}
      </SimPanel>
      <aside className="atom-side"><SimPanel><h2 className="sim-panel-title">Atom Controls</h2><p className="sim-panel-subtitle">Adjust the number of each particle</p><Stepper label="Protons" value={counts.p} color="#ef334c" onChange={v=>update('p',v)} max={18}/><Stepper label="Neutrons" value={counts.n} color="#1469dd" onChange={v=>update('n',v)} max={24}/><Stepper label="Electrons" value={counts.e} color="#ffd447" onChange={v=>update('e',v)} max={20}/><ResetButton onClick={reset} label="Reset Atom"/></SimPanel>
        <SimPanel className="atom-info"><h2 className="sim-panel-title">Atom Information</h2>{[['Element',element?.name||'—'],['Atomic number',counts.p],['Mass number',mass],['Net charge',charge],['Ion state',ionText],['Stability',stability]].map(([k,v])=><div key={k}><span>{k}</span><strong className={k==='Stability'?stabilityClass:''}>{v}</strong></div>)}</SimPanel>
        <SimPanel className="preset-row"><label>Useful presets</label><select className="sim-select" value="" onChange={e=>{const x=presets[Number(e.target.value)];if(x)setCounts({p:x.p,n:x.n,e:x.e})}}><option value="">Choose an atom…</option>{presets.map((x,i)=><option value={i} key={x.name}>{x.name}</option>)}</select></SimPanel>
      </aside>
    </div>
    <div className="atom-metrics sim-grid"><Metric label="Element" value={element?.name||'Unknown'} accent="#80ddff" icon={<Atom/>}/><Metric label="Isotope" value={`${mass}${symbol}`} accent="#e9d5ff" icon={<Sparkles/>}/><Metric label="Electron configuration" value={shells.filter(Boolean).join(' · ')||'—'} accent="#fde68a"/><Metric label="Stability" value={stability} accent={stabilityClass==='stable'?'#86efac':'#fb7185'} icon={<ShieldCheck/>}/></div>
  </div>;
}
