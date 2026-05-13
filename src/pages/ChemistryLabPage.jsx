import { useMemo, useState } from 'react';
import {
  Activity, BadgeCheck, BarChart3, BookOpen, Brain, Boxes, Calculator, Download,
  FlaskConical, GraduationCap, Languages, Mic2, Orbit, Printer, RadioTower,
  ShieldAlert, Sparkles, Trophy, Zap, Atom, GitCompare, Waves,
} from 'lucide-react';
import { elements } from '../data/elements.js';
import { ALL_MOLECULES } from '../data/molecules.js';
import {
  abundanceRows, balanceEquation, buildIonicFormula, classifyBond, crystalLattices,
  electronConfigParts, electrolysisProducts, elementEnrichment, ionData, lewisAssessment,
  likelyIsotopes, molarMass, parseFormula, reactionLibrary, strongAcidStrongBaseTitration,
  vseprFromDomains,
} from '../utils/chemistryTools.js';
import { getCategoryInfo } from '../data/categories.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const Section = ({ icon: Icon, title, children, className = '' }) => (
  <section className={`glass rounded-2xl p-4 border-white/10 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-cyan-300" />
      <h3 className="text-sm font-bold text-white">{title}</h3>
    </div>
    {children}
  </section>
);

const MiniBar = ({ label, value, color = '#38bdf8' }) => (
  <div>
    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
      <span>{label}</span><span>{value.toFixed(2)}</span>
    </div>
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  </div>
);

const configToBoxes = (part) => {
  const capacities = { s: 1, p: 3, d: 5, f: 7 };
  const boxes = capacities[part.orbital] || 1;
  const arrows = Array.from({ length: boxes }, (_, i) => {
    const first = i < part.electrons;
    const second = i + boxes < part.electrons;
    return `${first ? '↑' : ''}${second ? '↓' : ''}`;
  });
  return arrows;
};

const geometryData = {
  linear: { angle: '180 deg', points: [[50, 50], [18, 50], [82, 50]] },
  bent: { angle: '104-120 deg', points: [[50, 50], [26, 28], [74, 28]] },
  'trigonal planar': { angle: '120 deg', points: [[50, 50], [50, 15], [20, 72], [80, 72]] },
  tetrahedral: { angle: '109.5 deg', points: [[50, 50], [50, 14], [18, 64], [82, 64], [50, 86]] },
  pyramidal: { angle: '107 deg', points: [[50, 46], [22, 70], [78, 70], [50, 82]] },
  octahedral: { angle: '90 deg', points: [[50, 50], [50, 12], [50, 88], [12, 50], [88, 50], [30, 30], [70, 70]] },
};

export const ChemistryLabPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('C');
  const [secondSymbol, setSecondSymbol] = useState('O');
  const [formulaInput, setFormulaInput] = useState('Ca(OH)2');
  const [bondA, setBondA] = useState('Na');
  const [bondB, setBondB] = useState('Cl');
  const [lattice, setLattice] = useState('Sodium chloride');
  const [latticeSize, setLatticeSize] = useState(4);
  const [reactionKey, setReactionKey] = useState('water');
  const [reactionStep, setReactionStep] = useState(1);
  const [lewisElement, setLewisElement] = useState('O');
  const [bondedAtoms, setBondedAtoms] = useState(4);
  const [lonePairs, setLonePairs] = useState(0);
  const [hybrid, setHybrid] = useState('sp3');
  const [trendMetric, setTrendMetric] = useState('electronegativity');
  const [decayHalfLives, setDecayHalfLives] = useState(1);
  const [cation, setCation] = useState('Ca');
  const [anion, setAnion] = useState('Cl');
  const [electrolyte, setElectrolyte] = useState('CuSO4');
  const [titrationMl, setTitrationMl] = useState(25);
  const [equationInput, setEquationInput] = useState('CH4 + O2 -> CO2 + H2O');
  const [language, setLanguage] = useLocalStorage('cu-language', 'en');
  const [teacherMode, setTeacherMode] = useLocalStorage('cu-teacher-mode', false);
  const [savedFilters, setSavedFilters] = useLocalStorage('cu-saved-filters', []);
  const [achievements, setAchievements] = useLocalStorage('cu-achievements', ['Explorer']);
  const [aiQuestion, setAiQuestion] = useState('Why does electronegativity increase across a period?');

  const selected = elements.find(el => el.symbol === selectedSymbol) || elements[5];
  const second = elements.find(el => el.symbol === secondSymbol) || elements[7];
  const cat = getCategoryInfo(selected.category);
  const enriched = elementEnrichment(selected);
  const isotopes = likelyIsotopes(selected);
  const configParts = electronConfigParts(selected.electronConfiguration);
  const parsed = parseFormula(formulaInput);
  const mass = molarMass(formulaInput);
  const bondPrediction = classifyBond(bondA, bondB);
  const selectedMolecules = ALL_MOLECULES.filter(m => m.atoms.some(a => a.element === selected.symbol)).slice(0, 8);
  const lewis = elements.find(el => el.symbol === lewisElement) || elements[7];
  const lewisDots = lewis.shells?.at(-1) || 0;
  const compound = buildIonicFormula(cation, anion);
  const decayRemaining = 100 / (2 ** decayHalfLives);
  const titration = strongAcidStrongBaseTitration(0.1, 25, 0.1, titrationMl);
  const ph = titration.pH;
  const latticeInfo = crystalLattices[lattice];
  const vsepr = vseprFromDomains(bondedAtoms, lonePairs);
  const geometry = geometryData[vsepr.shape] || geometryData.linear;
  const lewisInfo = lewisAssessment(lewisElement);
  const balanced = balanceEquation(equationInput);
  const electrolysis = electrolysisProducts(electrolyte);
  const reaction = reactionLibrary[reactionKey];

  const timeline = useMemo(() => elements
    .filter(el => el.yearDiscovered)
    .sort((a, b) => a.yearDiscovered - b.yearDiscovered)
    .filter((_, i) => i % 4 === 0)
    .slice(0, 24), []);

  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(`${selected.name}. ${selected.summary}`));
    setAchievements(a => a.includes('Audio Learner') ? a : [...a, 'Audio Learner']);
  };

  const saveCurrentFilter = () => {
    const filter = `${selected.category} / Period ${selected.period}`;
    setSavedFilters(filters => filters.includes(filter) ? filters : [filter, ...filters].slice(0, 6));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify({ selected, isotopes, enriched, mass, parsed }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selected.symbol}-chemistry-lab.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const aiAnswer = aiQuestion.toLowerCase().includes('electronegativity')
    ? 'Across a period, nuclear charge rises while shielding changes only modestly, so atoms pull bonding electrons more strongly.'
    : aiQuestion.toLowerCase().includes('isotope')
    ? 'Isotopes are atoms of the same element with the same proton count but different neutron counts, so their masses differ.'
    : 'Use atomic number for protons, shell data for Bohr-style structure, and category/phase to predict broad behavior.';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Chemistry Lab</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Timeline, isotopes, orbitals, formula tools, safety notes, charts, exports, classroom tools, and local AI-style chemistry help in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="input w-44 text-sm">
              {elements.map(el => <option key={el.symbol} value={el.symbol}>{el.name} ({el.symbol})</option>)}
            </select>
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="btn-secondary flex items-center gap-2 text-sm">
              <Languages size={14} /> {language === 'en' ? 'English' : 'Hindi'}
            </button>
            <button onClick={speak} className="btn-secondary flex items-center gap-2 text-sm"><Mic2 size={14} /> Pronounce</button>
          </div>
        </div>
      </div>

      <Section icon={Sparkles} title="10 Interactive Chemistry Simulators">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Boxes size={15} className="text-emerald-300" /><h4 className="text-sm font-bold text-white">3D Crystal Lattice Explorer</h4></div>
            <div className="flex gap-2 mb-3">
              <select value={lattice} onChange={e => setLattice(e.target.value)} className="input text-xs">
                {Object.keys(crystalLattices).map(name => <option key={name}>{name}</option>)}
              </select>
              <input type="range" min="2" max="6" value={latticeSize} onChange={e => setLatticeSize(Number(e.target.value))} />
            </div>
            <div className="relative h-44 mx-auto rounded-xl bg-black/20 border border-white/10 overflow-hidden">
              {latticeInfo.points.slice(0, latticeSize * latticeSize * 3).map((p, i) => (
                <span
                  key={i}
                  title={latticeInfo.species[p.species]?.label}
                  className="absolute w-4 h-4 rounded-full border border-white/15 shadow-lg"
                  style={{
                    background: latticeInfo.species[p.species]?.color,
                    left: `${12 + p.x * (72 / Math.max(1, latticeSize))}%`,
                    top: `${12 + p.y * (72 / Math.max(1, latticeSize))}%`,
                    transform: `translate(${p.z * 10}px, ${p.z * -6}px)`,
                    opacity: 0.58 + (p.z % 2) * 0.18,
                  }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">{latticeInfo.formula} · {latticeInfo.type}: {latticeInfo.note}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Activity size={15} className="text-orange-300" /><h4 className="text-sm font-bold text-white">Chemical Reaction Animator</h4></div>
            <div className="flex gap-2 mb-2">
              <select value={reactionKey} onChange={e => { setReactionKey(e.target.value); setReactionStep(0); }} className="input text-xs">
                {Object.keys(reactionLibrary).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
              <input type="range" min="0" max={reaction.steps.length - 1} value={reactionStep} onChange={e => setReactionStep(Number(e.target.value))} className="w-full" />
            </div>
            <div className="h-28 relative rounded-xl bg-black/20 border border-white/10 mt-3 overflow-hidden">
              {reaction.species.map((txt, i) => (
                <span key={txt} className="absolute px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-xs text-cyan-100 transition-all" style={{ left: `${12 + i * 28 + reactionStep * (i === 2 ? 8 : -2)}%`, top: `${25 + Math.abs(2 - reactionStep) * (i + 1) * 4}%`, opacity: reactionStep < 3 && i === 2 ? 0.25 : 1 }}>
                  {txt}
                </span>
              ))}
              <div className="absolute bottom-3 left-4 right-4 h-1 rounded bg-white/10"><div className="h-full rounded bg-orange-400" style={{ width: `${(reactionStep / (reaction.steps.length - 1)) * 100}%` }} /></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{reaction.equation} · {reaction.steps[reactionStep]}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Atom size={15} className="text-violet-300" /><h4 className="text-sm font-bold text-white">Lewis Structure Builder</h4></div>
            <select value={lewisElement} onChange={e => setLewisElement(e.target.value)} className="input text-xs mb-3">
              {['C', 'N', 'O', 'F', 'Cl', 'S', 'P'].map(s => <option key={s}>{s}</option>)}
            </select>
            <div className="relative h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
              <span className="text-4xl font-black text-white">{lewis.symbol}</span>
              {Array.from({ length: lewisDots }, (_, i) => {
                const angle = (Math.PI * 2 * i) / Math.max(1, lewisDots);
                return <span key={i} className="absolute w-2 h-2 rounded-full bg-cyan-300" style={{ transform: `translate(${Math.cos(angle) * 48}px, ${Math.sin(angle) * 48}px)` }} />;
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">{lewisDots} valence dots · needs {lewisInfo.electronsNeededForOctet} e- for octet · {lewisInfo.note}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><GitCompare size={15} className="text-sky-300" /><h4 className="text-sm font-bold text-white">VSEPR Shape Simulator</h4></div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <label className="text-[10px] text-gray-500">Bonded atoms
                <input type="number" min="1" max="6" value={bondedAtoms} onChange={e => setBondedAtoms(Number(e.target.value))} className="input text-xs mt-1" />
              </label>
              <label className="text-[10px] text-gray-500">Lone pairs
                <input type="number" min="0" max="3" value={lonePairs} onChange={e => setLonePairs(Number(e.target.value))} className="input text-xs mt-1" />
              </label>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-32 rounded-xl bg-black/20 border border-white/10">
              {geometry.points.slice(1).map((p, i) => <line key={i} x1="50" y1="50" x2={p[0]} y2={p[1]} stroke="#38bdf8" strokeWidth="2" />)}
              {geometry.points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === 0 ? 7 : 5} fill={i === 0 ? '#f59e0b' : '#e2e8f0'} />)}
            </svg>
            <p className="text-xs text-gray-500 mt-2">AX{bondedAtoms}E{lonePairs}: {vsepr.shape}, typical angle {vsepr.angle}.</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Orbit size={15} className="text-pink-300" /><h4 className="text-sm font-bold text-white">Orbital Hybridization Viewer</h4></div>
            <select value={hybrid} onChange={e => setHybrid(e.target.value)} className="input text-xs mb-3">
              {['sp', 'sp2', 'sp3', 'dsp2', 'sp3d'].map(h => <option key={h}>{h}</option>)}
            </select>
            <div className="h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-2">
              {Array.from({ length: hybrid === 'sp' ? 2 : hybrid === 'sp2' ? 3 : hybrid === 'sp3' ? 4 : 5 }, (_, i) => (
                <span key={i} className="w-10 h-16 rounded-[50%] bg-gradient-to-b from-pink-400 to-indigo-500 opacity-75" style={{ transform: `rotate(${i * (180 / (hybrid === 'sp' ? 1 : 4))}deg)` }} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{hybrid} orbitals explain sigma bonds, pi bonds, and bond angles.</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><BarChart3 size={15} className="text-lime-300" /><h4 className="text-sm font-bold text-white">Periodic Trend Playground</h4></div>
            <select value={trendMetric} onChange={e => setTrendMetric(e.target.value)} className="input text-xs mb-3">
              {['electronegativity', 'atomicRadius', 'ionizationEnergy'].map(metric => <option key={metric}>{metric}</option>)}
            </select>
            <svg viewBox="0 0 260 90" className="w-full h-32 rounded-xl bg-black/20 border border-white/10">
              <polyline fill="none" stroke="#a3e635" strokeWidth="3" points={elements.filter(e => e.period === selected.period && e[trendMetric]).map((e, i) => `${12 + i * 22},${82 - Math.min(70, (e[trendMetric] / (trendMetric === 'atomicRadius' ? 4 : trendMetric === 'ionizationEnergy' ? 35 : 0.06)))}`).join(' ')} />
            </svg>
            <p className="text-xs text-gray-500 mt-2">Animated trend arrows help compare values across period {selected.period}.</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><RadioTower size={15} className="text-red-300" /><h4 className="text-sm font-bold text-white">Isotope and Decay Simulator</h4></div>
            <input type="range" min="0" max="8" value={decayHalfLives} onChange={e => setDecayHalfLives(Number(e.target.value))} className="w-full" />
            <div className="mt-3">
              <MiniBar label={`${decayHalfLives} half-lives elapsed`} value={decayRemaining} color="#f87171" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{decayRemaining.toFixed(2)}% parent isotope remains; daughter product grows over time.</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Calculator size={15} className="text-amber-300" /><h4 className="text-sm font-bold text-white">Compound Formula Builder</h4></div>
            <div className="flex gap-2 mb-3">
              <select value={cation} onChange={e => setCation(e.target.value)} className="input text-xs">{['Na', 'K', 'Mg', 'Ca', 'Al', 'Zn', 'Fe'].map(s => <option key={s}>{s}</option>)}</select>
              <select value={anion} onChange={e => setAnion(e.target.value)} className="input text-xs">{['Cl', 'F', 'O', 'S', 'N', 'P'].map(s => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="text-3xl font-black text-white">{compound.formula}</div>
            <p className="text-xs text-gray-500 mt-2">{compound.note}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Zap size={15} className="text-blue-300" /><h4 className="text-sm font-bold text-white">Electrolysis and Redox Lab</h4></div>
            <select value={electrolyte} onChange={e => setElectrolyte(e.target.value)} className="input text-xs mb-3">
              {['CuSO4', 'NaCl(aq)', 'H2O + acid'].map(e => <option key={e}>{e}</option>)}
            </select>
            <div className="h-32 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
              <div className="absolute left-8 top-4 bottom-4 w-3 bg-slate-300 rounded" />
              <div className="absolute right-8 top-4 bottom-4 w-3 bg-slate-300 rounded" />
              {Array.from({ length: 12 }, (_, i) => <span key={i} className="absolute text-[10px] text-blue-200 animate-pulse" style={{ left: `${20 + (i % 6) * 10}%`, top: `${25 + Math.floor(i / 6) * 35}%` }}>e-</span>)}
            </div>
            <p className="text-xs text-gray-400 mt-2">Cathode: {electrolysis.cathode}</p>
            <p className="text-xs text-gray-400">Anode: {electrolysis.anode}</p>
            <p className="text-xs text-gray-500 mt-1">{electrolysis.note}</p>
          </div>

          <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
            <div className="flex items-center gap-2 mb-2"><Waves size={15} className="text-fuchsia-300" /><h4 className="text-sm font-bold text-white">pH Titration Simulator</h4></div>
            <input type="range" min="0" max="50" value={titrationMl} onChange={e => setTitrationMl(Number(e.target.value))} className="w-full" />
            <div className="grid grid-cols-[72px_1fr] gap-3 mt-3">
              <div className="h-28 rounded-b-3xl rounded-t-lg border border-white/15 flex items-end overflow-hidden bg-white/[0.04]">
                <div className="w-full transition-all" style={{ height: `${30 + titrationMl}%`, background: ph < 4 ? '#ef4444' : ph < 8 ? '#22c55e' : '#a855f7' }} />
              </div>
              <div className="space-y-2">
                <MiniBar label={`${titrationMl} mL titrant`} value={titrationMl * 2} color="#e879f9" />
                <MiniBar label={`pH ${ph.toFixed(2)}`} value={(ph / 14) * 100} color={ph < 4 ? '#ef4444' : ph < 8 ? '#22c55e' : '#a855f7'} />
                <p className="text-xs text-gray-500">0.100 M HCl, 25.00 mL titrated with 0.100 M NaOH: {titration.region}.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-4">
        <Section icon={RadioTower} title="Element Discovery Timeline">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
            {timeline.map(el => {
              const info = getCategoryInfo(el.category);
              const active = selected.atomicNumber === el.atomicNumber;
              return (
                <button
                  key={el.atomicNumber}
                  onClick={() => setSelectedSymbol(el.symbol)}
                  className={`w-full text-left rounded-xl border p-2.5 transition-colors ${
                    active
                      ? 'bg-white/[0.09] border-white/25'
                      : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black border"
                      style={{ color: info.color, borderColor: `${info.color}55`, background: `${info.color}16` }}>
                      {el.symbol}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-gray-200 truncate">{el.name}</span>
                      <span className="block text-[10px] text-gray-500 truncate">{el.discoveredBy}</span>
                    </span>
                    <span className="text-[10px] font-mono text-gray-400">{el.yearDiscovered}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Section>

        <Section icon={BookOpen} title="Element Information Pack">
          <div className="grid sm:grid-cols-2 gap-2 text-xs">
            {[
              ['Common uses', selected.commonUses?.join(', ') || 'Reference uses unavailable'],
              ['Safety', enriched.safety],
              ['Occurrence', enriched.occurrence],
              ['Extraction', enriched.extraction],
              ['Crystal structure', enriched.crystal],
              ['Formula link', `${selected.symbol} appears in ${selectedMolecules.length} molecule models`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-gray-500 text-[10px] uppercase tracking-widest">{label}</p>
                <p className="text-gray-300 mt-1">{language === 'hi' && label === 'Safety' ? `सुरक्षा: ${value}` : value}</p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Section icon={Activity} title="Isotope Explorer and Half-Life Chart">
          <div className="space-y-2">
            {isotopes.length > 0 ? isotopes.map((iso, i) => (
              <div key={iso.label} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <div className="flex justify-between text-sm"><span className="font-bold text-white">{iso.label}</span><span className="text-gray-500">{iso.halfLife}</span></div>
                <MiniBar label={`${iso.neutrons ?? 'unknown'} neutrons · ${iso.abundance}`} value={iso.neutrons ? Math.min(100, iso.neutrons * 2) : 10} color={i === 0 ? cat.color : '#64748b'} />
                {iso.decay && <p className="text-[10px] text-gray-500 mt-1">Decay mode: {iso.decay}</p>}
              </div>
            )) : (
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-400">
                No curated isotope records are loaded for {selected.name}. Select H, C, O, Na, Cl, K, Ca, Fe, I, or U to see real isotope data.
              </div>
            )}
            <p className="text-[10px] text-gray-600">Uses curated stable/radioactive isotope records where available; no synthetic estimates are shown.</p>
          </div>
        </Section>

        <Section icon={Orbit} title="Electron Configuration Builder">
          <p className="text-xs text-gray-400 mb-2">{selected.electronConfiguration}</p>
          <div className="flex flex-wrap gap-1.5">
            {configParts.map(part => (
              <span key={part.raw} className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-200">{part.raw}</span>
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {configParts.slice(-4).map(part => (
              <div key={`${part.raw}-boxes`} className="flex items-center gap-2 text-xs">
                <span className="w-10 text-gray-500 font-mono">{part.n}{part.orbital}</span>
                {configToBoxes(part).map((box, i) => (
                  <span key={i} className="w-8 h-7 rounded border border-white/15 bg-white/[0.04] flex items-center justify-center text-cyan-200">{box}</span>
                ))}
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Zap} title="Bohr Controls and Ion Formation">
          <div className="grid grid-cols-2 gap-2">
            {selected.shells?.map((count, i) => (
              <div key={i} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center">
                <p className="text-lg font-black text-white">{count}</p>
                <p className="text-[10px] text-gray-500">shell n={i + 1}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">Likely ion: {selected.group <= 2 ? `+${selected.group}` : selected.group >= 16 && selected.group <= 17 ? `${selected.group - 18}` : 'variable'} based on group pattern.</p>
        </Section>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        <Section icon={Calculator} title="Formula Builder and Molar Mass" className="lg:col-span-2">
          <input value={formulaInput} onChange={e => setFormulaInput(e.target.value)} className="input text-sm mb-3" />
          <div className="grid sm:grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Atoms</p>
              <p className="text-sm text-gray-200 font-mono mt-1">{Object.entries(parsed).map(([s, n]) => `${s}:${n}`).join('  ') || 'None'}</p>
            </div>
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Molar mass</p>
              <p className="text-xl font-black text-white mt-1">{mass.toFixed(3)} g/mol</p>
            </div>
          </div>
        </Section>

        <Section icon={Boxes} title="Bond Predictor">
          <div className="flex gap-2 mb-2">
            <input value={bondA} onChange={e => setBondA(e.target.value)} className="input text-sm" />
            <input value={bondB} onChange={e => setBondB(e.target.value)} className="input text-sm" />
          </div>
          <p className="text-sm font-bold text-white">{bondPrediction.type}</p>
          <p className="text-xs text-gray-500">{bondPrediction.note}</p>
        </Section>

        <Section icon={FlaskConical} title="Equation Balancer">
          <input value={equationInput} onChange={e => setEquationInput(e.target.value)} className="input text-xs mb-2" />
          {balanced.ok ? (
            <p className="text-sm font-mono text-gray-200">{balanced.balanced}</p>
          ) : (
            <p className="text-sm text-red-300">{balanced.error}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">Balances equations by conserving each element across reactants and products.</p>
          {false && (<>
          <p className="text-sm font-mono text-gray-200">2H₂ + O₂ → 2H₂O</p>
          <p className="text-xs text-gray-500 mt-2">Starter balancer with common reaction pattern examples. Full symbolic balancing can be expanded from this panel.</p>
          </>)}
        </Section>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Section icon={BarChart3} title="Abundance and Comparison Charts">
          <div className="space-y-2">
            {abundanceRows(selected).map(([label, value]) => <MiniBar key={label} label={label} value={Math.min(100, value)} color={cat.color} />)}
          </div>
          <div className="mt-3 flex gap-2">
            <select value={secondSymbol} onChange={e => setSecondSymbol(e.target.value)} className="input text-xs">
              {elements.map(el => <option key={el.symbol} value={el.symbol}>{el.symbol}</option>)}
            </select>
            <span className="text-xs text-gray-400 self-center">{selected.symbol} vs {second.symbol}: EN {selected.electronegativity ?? 'n/a'} / {second.electronegativity ?? 'n/a'}</span>
          </div>
        </Section>

        <Section icon={Activity} title="Trend Graph and Animated Arrows">
          <svg viewBox="0 0 240 90" className="w-full h-28">
            <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={elements.filter(e => e.period === selected.period && e.electronegativity).map((e, i) => `${i * 22 + 10},${80 - e.electronegativity * 16}`).join(' ')} />
            <text x="8" y="86" fontSize="8" fill="#64748b">Period {selected.period} electronegativity</text>
          </svg>
          <div className="flex gap-1 text-[10px] text-cyan-300 animate-pulse">left → right: radius tends down, electronegativity tends up</div>
        </Section>

        <Section icon={ShieldAlert} title="Lab Safety, VSEPR, Lewis, Valency">
          <div className="space-y-2 text-xs text-gray-300">
            <p>Valency trainer: {selected.group ? `Group ${selected.group} suggests common valence patterns.` : 'f-block variable valency.'}</p>
            <p>Lewis practice: draw valence dots from outer shell count {selected.shells?.at(-1) ?? 'n/a'}.</p>
            <p>VSEPR trainer: count electron domains, then choose linear, trigonal planar, tetrahedral, bent, or pyramidal.</p>
            <p>Safety mini lesson: label, ventilate, wear PPE, and check incompatibilities.</p>
          </div>
        </Section>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Section icon={Trophy} title="Achievements, Classroom, Progress">
          <div className="flex flex-wrap gap-2 mb-3">
            {achievements.map(a => <span key={a} className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">{a}</span>)}
          </div>
          <button onClick={() => setTeacherMode(!teacherMode)} className="btn-secondary text-sm w-full mb-2">{teacherMode ? 'Teacher mode on' : 'Teacher mode off'}</button>
          <button onClick={saveCurrentFilter} className="btn-secondary text-sm w-full">Save current study filter</button>
          <div className="mt-2 text-[10px] text-gray-500">{savedFilters.join(' · ') || 'No saved filters yet'}</div>
        </Section>

        <Section icon={Download} title="Print, PNG/PDF Export, Offline, Sync">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => window.print()} className="btn-secondary text-xs flex items-center gap-1 justify-center"><Printer size={13} /> Print/PDF</button>
            <button onClick={exportJson} className="btn-secondary text-xs flex items-center gap-1 justify-center"><Download size={13} /> Export</button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Offline/PWA ready UI: local data works without a backend. Backend sync is represented by local progress state until an API is connected.</p>
        </Section>

        <Section icon={Brain} title="AI Tutor Chat">
          <textarea value={aiQuestion} onChange={e => setAiQuestion(e.target.value)} className="input min-h-20 text-sm" />
          <div className="mt-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-100">{aiAnswer}</div>
        </Section>
      </div>

      <Section icon={BadgeCheck} title="Molecule Links, Crystal Lattice, Reactions, Functional Groups">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <p className="text-xs text-gray-500 mb-2">Molecules containing {selected.symbol}</p>
            <div className="flex flex-wrap gap-1.5">{selectedMolecules.map(m => <span key={m.name} className="px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-300">{m.name}</span>)}</div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {Array.from({ length: 27 }, (_, i) => <span key={i} className="aspect-square rounded-full border border-white/10" style={{ background: i % 2 ? cat.color : '#94a3b8', opacity: 0.45 + (i % 3) * 0.15 }} />)}
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <p>Reaction path: reactants → activated complex → products.</p>
            <p>Functional group practice: identify alcohol, carbonyl, acid, amine, aromatic, and halide patterns.</p>
            <p>Decay chain viewer: radioactive elements show parent → daughter → stable endpoint as a lesson flow.</p>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ChemistryLabPage;
