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

const kspData = {
  NaCl: { ksp: 36, ions: 2, molarSolubility: 6.1 },
  AgCl: { ksp: 1.8e-10, ions: 2, molarSolubility: 1.34e-5 },
  CaF2: { ksp: 3.9e-11, ions: 3, molarSolubility: 2.14e-4 },
  BaSO4: { ksp: 1.1e-10, ions: 2, molarSolubility: 1.05e-5 },
  PbI2: { ksp: 7.9e-9, ions: 3, molarSolubility: 1.25e-3 },
};

const reductionPotentials = {
  Mg: -2.37, Al: -1.66, Zn: -0.76, Fe: -0.44, Ni: -0.25, Sn: -0.14, Pb: -0.13,
  H: 0, Cu: 0.34, Ag: 0.8,
};

const indicators = {
  Litmus: { low: 4.5, high: 8.3, acid: '#ef4444', base: '#3b82f6', mid: '#8b5cf6' },
  Phenolphthalein: { low: 8.2, high: 10, acid: '#f8fafc', base: '#ec4899', mid: '#f9a8d4' },
  'Methyl orange': { low: 3.1, high: 4.4, acid: '#ef4444', base: '#f59e0b', mid: '#fb923c' },
  'Bromothymol blue': { low: 6, high: 7.6, acid: '#facc15', base: '#2563eb', mid: '#22c55e' },
};

const indicatorColor = (indicator, pH) => {
  const item = indicators[indicator];
  if (pH < item.low) return item.acid;
  if (pH > item.high) return item.base;
  return item.mid;
};

const LabCard = ({ title, children }) => (
  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
    <h4 className="text-sm font-bold text-white mb-3">{title}</h4>
    {children}
  </div>
);

const orbitalMeta = {
  s: { lobes: 1, note: 'Spherical orbital with no angular node.' },
  p: { lobes: 2, note: 'Two opposite lobes with one nodal plane.' },
  d: { lobes: 4, note: 'Mostly cloverleaf shapes with two angular nodes.' },
  f: { lobes: 8, note: 'Complex multi-lobed shapes used in f-block chemistry.' },
};

const moData = {
  H2: { electrons: 2, order: 1, magnetic: 'diamagnetic', fill: ['sigma 1s ↑↓'] },
  N2: { electrons: 10, order: 3, magnetic: 'diamagnetic', fill: ['sigma 2s ↑↓', 'sigma* 2s ↑↓', 'pi 2p ↑↓ ↑↓', 'sigma 2p ↑↓'] },
  O2: { electrons: 12, order: 2, magnetic: 'paramagnetic', fill: ['sigma 2s ↑↓', 'sigma* 2s ↑↓', 'sigma 2p ↑↓', 'pi 2p ↑↓ ↑↓', 'pi* 2p ↑ ↑'] },
};

const mechanismData = {
  SN1: ['Leaving group departs', 'Carbocation forms', 'Nucleophile attacks', 'Product forms'],
  SN2: ['Nucleophile approaches backside', 'C-Nu bond forms as C-LG breaks', 'Transition state', 'Inverted product forms'],
  E2: ['Base removes beta-H', 'C-H and C-LG bonds break', 'C=C pi bond forms', 'Alkene product forms'],
};

const phaseAt = (temp, pressure) => {
  if (pressure > 150 && temp > 374) return 'supercritical fluid';
  if (temp < 0) return pressure < 0.006 ? 'vapor' : 'solid';
  if (temp > 100 && pressure <= 1) return 'gas';
  if (pressure < 0.006) return 'gas';
  return 'liquid';
};

const flameColors = {
  Li: '#dc2626', Na: '#facc15', K: '#a855f7', Ca: '#fb923c', Sr: '#ef4444',
  Ba: '#22c55e', Cu: '#14b8a6', Cs: '#3b82f6',
};

const spectrumLines = {
  H: [410, 434, 486, 656], He: [447, 501, 587, 668], Li: [460, 610, 671],
  Na: [589], K: [404, 766], Ca: [423, 616, 643], Cu: [510, 578],
};

const wavelengthColor = (nm) => {
  if (nm < 450) return '#6366f1';
  if (nm < 495) return '#06b6d4';
  if (nm < 570) return '#22c55e';
  if (nm < 590) return '#eab308';
  if (nm < 620) return '#f97316';
  return '#ef4444';
};

const empiricalFormula = (rows) => {
  const moles = rows
    .map(row => ({ ...row, moles: Number(row.percent || 0) / (elements.find(e => e.symbol === row.symbol)?.atomicMass || 1) }))
    .filter(row => row.symbol && row.moles > 0);
  const min = Math.min(...moles.map(row => row.moles));
  return moles.map(row => `${row.symbol}${Math.round(row.moles / min) > 1 ? Math.round(row.moles / min) : ''}`).join('');
};

const oxidationGuess = (formula) => {
  const counts = parseFormula(formula);
  return Object.keys(counts).map(symbol => {
    const value = symbol === 'O' ? -2 : symbol === 'H' ? 1 : ionData[symbol]?.charge ?? 0;
    return `${symbol}: ${value > 0 ? '+' : ''}${value}`;
  }).join(' · ');
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
  const [rateTemp, setRateTemp] = useState(35);
  const [rateConc, setRateConc] = useState(1.2);
  const [metalTemp, setMetalTemp] = useState(95);
  const [metalMass, setMetalMass] = useState(50);
  const [salt, setSalt] = useState('AgCl');
  const [saltAdded, setSaltAdded] = useState(0.001);
  const [solutionPh, setSolutionPh] = useState(7);
  const [indicator, setIndicator] = useState('Bromothymol blue');
  const [metalA, setMetalA] = useState('Zn');
  const [metalB, setMetalB] = useState('Cu');
  const [sapProgress, setSapProgress] = useState(45);
  const [yeastTemp, setYeastTemp] = useState(32);
  const [polymerLength, setPolymerLength] = useState(8);
  const [bufferAdded, setBufferAdded] = useState(2);
  const [recrystTemp, setRecrystTemp] = useState(35);
  const [orbitalType, setOrbitalType] = useState('p');
  const [structureType, setStructureType] = useState('NaCl');
  const [hybridMix, setHybridMix] = useState(55);
  const [polarityA, setPolarityA] = useState('H');
  const [polarityB, setPolarityB] = useState('Cl');
  const [mechanism, setMechanism] = useState('SN2');
  const [mechanismStep, setMechanismStep] = useState(1);
  const [imfType, setImfType] = useState('hydrogen bonding');
  const [decayMode, setDecayMode] = useState('alpha');
  const [phaseTemp, setPhaseTemp] = useState(25);
  const [phasePressure, setPhasePressure] = useState(1);
  const [moMolecule, setMoMolecule] = useState('O2');
  const [simTitrationDrops, setSimTitrationDrops] = useState(25);
  const [distillHeat, setDistillHeat] = useState(55);
  const [chromTime, setChromTime] = useState(35);
  const [probeSolution, setProbeSolution] = useState('water');
  const [eqReactant, setEqReactant] = useState(1);
  const [eqTemp, setEqTemp] = useState(25);
  const [osmosisLeft, setOsmosisLeft] = useState(0.2);
  const [osmosisRight, setOsmosisRight] = useState(1.0);
  const [flameElement, setFlameElement] = useState('Na');
  const [stoichEquation, setStoichEquation] = useState('N2 + H2 -> NH3');
  const [stoichMoles, setStoichMoles] = useState(2);
  const [c1, setC1] = useState(1);
  const [v1, setV1] = useState(25);
  const [c2, setC2] = useState(0.1);
  const [ka, setKa] = useState(1.8e-5);
  const [gasP, setGasP] = useState(1);
  const [gasV, setGasV] = useState(22.4);
  const [gasT, setGasT] = useState(273.15);
  const [empRows, setEmpRows] = useState([{ symbol: 'C', percent: 40 }, { symbol: 'H', percent: 6.7 }, { symbol: 'O', percent: 53.3 }]);
  const [oxidFormula, setOxidFormula] = useState('H2SO4');
  const [configAtomicNumber, setConfigAtomicNumber] = useState(8);
  const [hessA, setHessA] = useState(-286);
  const [hessB, setHessB] = useState(44);
  const [molality, setMolality] = useState(1);
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
  const rateK = rateConc * Math.exp((rateTemp - 25) / 18);
  const ratePoints = Array.from({ length: 12 }, (_, i) => {
    const t = i / 2;
    return { x: 10 + i * 20, y: 82 - 65 * (1 - Math.exp(-rateK * t / 8)) };
  });
  const waterMass = 100;
  const metalSpecificHeat = 0.385;
  const finalTemp = ((metalMass * metalSpecificHeat * metalTemp) + (waterMass * 4.184 * 22)) / ((metalMass * metalSpecificHeat) + (waterMass * 4.184));
  const selectedSalt = kspData[salt];
  const ionConcentration = saltAdded / 0.1;
  const ionProduct = selectedSalt.ions === 2 ? ionConcentration ** 2 : 4 * ionConcentration ** 3;
  const precipitates = ionProduct > selectedSalt.ksp;
  const corrosion = reductionPotentials[metalA] < reductionPotentials[metalB] ? metalA : metalB;
  const cellVoltage = Math.abs(reductionPotentials[metalA] - reductionPotentials[metalB]);
  const yeastActivity = Math.max(0, 100 - Math.abs(yeastTemp - 32) * 4);
  const bufferPh = 4.76 + Math.log10(Math.max(0.01, (0.1 - bufferAdded / 100) / (0.1 + bufferAdded / 100)));
  const pureWaterPh = Math.max(1, Math.min(14, bufferAdded >= 0 ? 7 - bufferAdded * 1.7 : 7 - bufferAdded * 2.2));
  const solubilityAtTemp = 12 + recrystTemp * 0.9;
  const supersaturation = Math.max(0, 80 - solubilityAtTemp);
  const orbital = orbitalMeta[orbitalType];
  const polarity = classifyBond(polarityA, polarityB);
  const mechanismSteps = mechanismData[mechanism];
  const phase = phaseAt(phaseTemp, phasePressure);
  const mo = moData[moMolecule];
  const simTitration = strongAcidStrongBaseTitration(0.1, 25, 0.1, simTitrationDrops * 0.05);
  const probePh = { water: 7, vinegar: 2.8, ammonia: 11.2, cola: 2.5, soap: 10.5 }[probeSolution];
  const eqShift = eqReactant > 1 ? 'shifts toward products' : eqReactant < 1 ? 'shifts toward reactants' : eqTemp > 40 ? 'temperature shift depends on reaction heat' : 'near equilibrium';
  const osmoticFlow = osmosisRight > osmosisLeft ? 'water flows right' : osmosisRight < osmosisLeft ? 'water flows left' : 'no net flow';
  const stoichBalanced = balanceEquation(stoichEquation);
  const dilutionV2 = (c1 * v1) / Math.max(0.0001, c2);
  const weakAcidPh = -Math.log10(Math.sqrt(ka * 0.1));
  const gasN = (gasP * gasV) / (0.082057 * gasT);
  const configElement = elements.find(e => e.atomicNumber === Number(configAtomicNumber)) || elements[7];
  const configFill = electronConfigParts(configElement.electronConfiguration);
  const deltaH = Number(hessA) + Number(hessB);
  const boilingElevation = 0.512 * molality;
  const freezingDepression = 1.86 * molality;

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

      <Section icon={Zap} title="Interactive Simulations">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <LabCard title="Titration Simulator">
            <label className="text-[10px] text-gray-500">NaOH drops: {simTitrationDrops}<input type="range" min="0" max="1000" value={simTitrationDrops} onChange={e => setSimTitrationDrops(Number(e.target.value))} className="w-full" /></label>
            <div className="mt-3 h-24 rounded-xl border border-white/10 flex items-end overflow-hidden bg-white/[0.04]">
              <div className="w-full" style={{ height: `${Math.min(100, 25 + simTitrationDrops / 10)}%`, background: simTitration.pH < 7 ? '#ef4444' : simTitration.pH < 9 ? '#22c55e' : '#ec4899' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">pH meter: {simTitration.pH.toFixed(2)} · {simTitration.region}</p>
          </LabCard>

          <LabCard title="Electrolysis Cell">
            <select value={electrolyte} onChange={e => setElectrolyte(e.target.value)} className="input text-xs mb-3">{['CuSO4', 'NaCl(aq)', 'H2O + acid'].map(e => <option key={e}>{e}</option>)}</select>
            <div className="h-24 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
              <span className="absolute left-8 top-3 bottom-3 w-3 rounded bg-slate-300" /><span className="absolute right-8 top-3 bottom-3 w-3 rounded bg-slate-300" />
              {Array.from({ length: 16 }, (_, i) => <span key={i} className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-pulse" style={{ left: `${18 + (i % 8) * 8}%`, top: `${20 + Math.floor(i / 8) * 35}%` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">{electrolysis.cathode}; {electrolysis.anode}</p>
          </LabCard>

          <LabCard title="Distillation Apparatus">
            <label className="text-[10px] text-gray-500">Heating: {distillHeat}%<input type="range" min="0" max="100" value={distillHeat} onChange={e => setDistillHeat(Number(e.target.value))} className="w-full" /></label>
            <div className="h-28 rounded-xl bg-black/20 border border-white/10 relative mt-3">
              <span className="absolute left-8 bottom-4 w-14 h-16 rounded-b-3xl border border-cyan-300/30 bg-cyan-500/10" />
              <span className="absolute left-20 top-10 right-16 h-2 bg-slate-400 rounded" />
              <span className="absolute right-8 bottom-4 w-10 h-12 rounded-b-xl border border-white/20 bg-white/[0.04]" />
              {distillHeat > 45 && <span className="absolute left-24 top-8 right-14 border-t border-dashed border-cyan-300 animate-pulse" />}
            </div>
            <p className="text-xs text-gray-500 mt-2">{distillHeat > 78 ? 'Ethanol-rich vapor condenses into collector.' : 'Heat below boiling range; little vapor collected.'}</p>
          </LabCard>

          <LabCard title="Chromatography">
            <label className="text-[10px] text-gray-500">Run time: {chromTime}%<input type="range" min="0" max="100" value={chromTime} onChange={e => setChromTime(Number(e.target.value))} className="w-full" /></label>
            <div className="h-28 rounded-xl bg-yellow-50/90 border border-white/10 relative mt-3">
              {['#ef4444', '#22c55e', '#3b82f6'].map((color, i) => <span key={color} className="absolute left-1/2 -translate-x-1/2 w-20 h-3 rounded-full" style={{ background: color, bottom: `${12 + chromTime * (0.25 + i * 0.12)}%` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Bands separate by attraction to stationary phase vs solvent.</p>
          </LabCard>

          <LabCard title="Spectroscopy Viewer">
            <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)} className="input text-xs mb-3">{['H', 'He', 'Li', 'Na', 'K', 'Ca', 'Cu'].map(s => <option key={s}>{s}</option>)}</select>
            <div className="h-20 rounded-xl bg-gradient-to-r from-violet-700 via-green-500 to-red-600 border border-white/10 relative overflow-hidden">
              {(spectrumLines[selectedSymbol] || [486, 656]).map(nm => <span key={nm} className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_white]" style={{ left: `${((nm - 380) / 370) * 100}%` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Visible emission lines for {selectedSymbol}.</p>
          </LabCard>

          <LabCard title="pH Meter">
            <select value={probeSolution} onChange={e => setProbeSolution(e.target.value)} className="input text-xs mb-3">{['water', 'vinegar', 'ammonia', 'cola', 'soap'].map(s => <option key={s}>{s}</option>)}</select>
            <div className="text-4xl font-black text-white">pH {probePh.toFixed(1)}</div>
            <MiniBar label="acid to base" value={(probePh / 14) * 100} color={probePh < 7 ? '#ef4444' : probePh > 7 ? '#3b82f6' : '#22c55e'} />
          </LabCard>

          <LabCard title="Electrochemical Cell">
            <div className="flex gap-2 mb-3">{[metalA, metalB].map((m, i) => <select key={i} value={m} onChange={e => i ? setMetalB(e.target.value) : setMetalA(e.target.value)} className="input text-xs">{Object.keys(reductionPotentials).map(x => <option key={x}>{x}</option>)}</select>)}</div>
            <div className="h-24 rounded-xl bg-black/20 border border-white/10 flex items-center justify-around">
              <span className="px-3 py-6 rounded-xl bg-white/[0.06]">{metalA}</span><span className="text-cyan-300 font-mono">{cellVoltage.toFixed(2)} V</span><span className="px-3 py-6 rounded-xl bg-white/[0.06]">{metalB}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Salt bridge maintains charge; electrons flow from lower E deg metal.</p>
          </LabCard>

          <LabCard title="Le Chatelier Equilibrium">
            <label className="text-[10px] text-gray-500">Reactant level {eqReactant.toFixed(1)}x<input type="range" min="0.2" max="3" step="0.1" value={eqReactant} onChange={e => setEqReactant(Number(e.target.value))} className="w-full" /></label>
            <label className="text-[10px] text-gray-500">Temperature {eqTemp} C<input type="range" min="0" max="100" value={eqTemp} onChange={e => setEqTemp(Number(e.target.value))} className="w-full" /></label>
            <p className="text-xs text-gray-500 mt-2">N2O4 ⇌ 2NO2: system {eqShift}.</p>
          </LabCard>

          <LabCard title="Osmosis Demo">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500"><label>Left {osmosisLeft} M<input type="range" min="0" max="2" step="0.1" value={osmosisLeft} onChange={e => setOsmosisLeft(Number(e.target.value))} /></label><label>Right {osmosisRight} M<input type="range" min="0" max="2" step="0.1" value={osmosisRight} onChange={e => setOsmosisRight(Number(e.target.value))} /></label></div>
            <div className="h-20 rounded-xl bg-blue-500/10 border border-blue-400/20 mt-3 grid grid-cols-2 divide-x divide-dashed divide-white/30"><div className="flex items-center justify-center">H2O</div><div className="flex items-center justify-center">{osmosisRight > osmosisLeft ? '← solute' : 'solute →'}</div></div>
            <p className="text-xs text-gray-500 mt-2">{osmoticFlow} toward higher solute concentration.</p>
          </LabCard>

          <LabCard title="Flame Test">
            <select value={flameElement} onChange={e => setFlameElement(e.target.value)} className="input text-xs mb-3">{Object.keys(flameColors).map(s => <option key={s}>{s}</option>)}</select>
            <div className="h-28 rounded-xl bg-black border border-white/10 flex items-end justify-center overflow-hidden">
              <div className="w-24 h-24 rounded-t-full blur-sm" style={{ background: flameColors[flameElement], boxShadow: `0 0 40px ${flameColors[flameElement]}` }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">{flameElement} characteristic flame color.</p>
          </LabCard>
        </div>
      </Section>

      <Section icon={Calculator} title="Calculators & Tools">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <LabCard title="Molar Mass Calculator">
            <input value={formulaInput} onChange={e => setFormulaInput(e.target.value)} className="input text-xs mb-2" />
            <p className="text-2xl font-black text-white">{mass.toFixed(3)} g/mol</p>
            <p className="text-xs text-gray-500">{Object.entries(parsed).map(([s, n]) => `${s} x ${n}`).join(' · ')}</p>
          </LabCard>

          <LabCard title="Stoichiometry Solver">
            <input value={stoichEquation} onChange={e => setStoichEquation(e.target.value)} className="input text-xs mb-2" />
            <input type="number" value={stoichMoles} onChange={e => setStoichMoles(Number(e.target.value))} className="input text-xs mb-2" />
            <p className="text-xs text-gray-300">{stoichBalanced.ok ? stoichBalanced.balanced : stoichBalanced.error}</p>
            <p className="text-xs text-gray-500 mt-1">Starting amount: {stoichMoles} mol of first reactant.</p>
          </LabCard>

          <LabCard title="Molarity / Dilution Calculator">
            <div className="grid grid-cols-3 gap-2"><input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="input text-xs" /><input type="number" value={v1} onChange={e => setV1(Number(e.target.value))} className="input text-xs" /><input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="input text-xs" /></div>
            <p className="text-2xl font-black text-white mt-3">V2 = {dilutionV2.toFixed(2)} mL</p>
            <p className="text-xs text-gray-500">C1V1 = C2V2</p>
          </LabCard>

          <LabCard title="pH / pOH Calculator">
            <input type="number" value={ka} onChange={e => setKa(Number(e.target.value))} className="input text-xs mb-2" />
            <p className="text-xl font-black text-white">pH {weakAcidPh.toFixed(2)} · pOH {(14 - weakAcidPh).toFixed(2)}</p>
            <p className="text-xs text-gray-500">Weak acid approximation for 0.100 M acid.</p>
          </LabCard>

          <LabCard title="Ideal Gas Law Calculator">
            <div className="grid grid-cols-3 gap-2"><input type="number" value={gasP} onChange={e => setGasP(Number(e.target.value))} className="input text-xs" /><input type="number" value={gasV} onChange={e => setGasV(Number(e.target.value))} className="input text-xs" /><input type="number" value={gasT} onChange={e => setGasT(Number(e.target.value))} className="input text-xs" /></div>
            <p className="text-2xl font-black text-white mt-3">n = {gasN.toFixed(3)} mol</p>
            <p className="text-xs text-gray-500">PV = nRT, R = 0.082057 L atm mol-1 K-1</p>
          </LabCard>

          <LabCard title="Empirical Formula Finder">
            {empRows.map((row, i) => <div key={i} className="grid grid-cols-2 gap-2 mb-1"><input value={row.symbol} onChange={e => setEmpRows(rows => rows.map((r, idx) => idx === i ? { ...r, symbol: e.target.value } : r))} className="input text-xs" /><input type="number" value={row.percent} onChange={e => setEmpRows(rows => rows.map((r, idx) => idx === i ? { ...r, percent: Number(e.target.value) } : r))} className="input text-xs" /></div>)}
            <p className="text-2xl font-black text-white mt-2">{empiricalFormula(empRows)}</p>
          </LabCard>

          <LabCard title="Oxidation State Finder">
            <input value={oxidFormula} onChange={e => setOxidFormula(e.target.value)} className="input text-xs mb-2" />
            <p className="text-sm text-gray-200">{oxidationGuess(oxidFormula)}</p>
            <p className="text-xs text-gray-500 mt-2">Applies common rules for O, H, and known ion charges.</p>
          </LabCard>

          <LabCard title="Electron Configuration Builder">
            <input type="number" min="1" max="118" value={configAtomicNumber} onChange={e => setConfigAtomicNumber(Number(e.target.value))} className="input text-xs mb-2" />
            <p className="text-sm text-gray-200 font-mono">{configElement.name}: {configElement.electronConfiguration}</p>
            <div className="flex flex-wrap gap-1 mt-2">{configFill.map(part => <span key={part.raw} className="px-2 py-1 rounded bg-white/[0.06] text-xs">{part.raw}</span>)}</div>
          </LabCard>

          <LabCard title="Reaction Enthalpy (Hess's Law)">
            <div className="grid grid-cols-2 gap-2"><input type="number" value={hessA} onChange={e => setHessA(Number(e.target.value))} className="input text-xs" /><input type="number" value={hessB} onChange={e => setHessB(Number(e.target.value))} className="input text-xs" /></div>
            <p className="text-2xl font-black text-white mt-3">ΔH = {deltaH.toFixed(1)} kJ</p>
            <p className="text-xs text-gray-500">Sum reaction enthalpies after matching target reaction.</p>
          </LabCard>

          <LabCard title="Colligative Properties Calculator">
            <label className="text-[10px] text-gray-500">Molality {molality} m<input type="range" min="0" max="5" step="0.1" value={molality} onChange={e => setMolality(Number(e.target.value))} className="w-full" /></label>
            <p className="text-sm text-gray-200 mt-2">ΔTb = {boilingElevation.toFixed(2)} C · ΔTf = {freezingDepression.toFixed(2)} C</p>
            <p className="text-xs text-gray-500">Water constants: Kb 0.512, Kf 1.86.</p>
          </LabCard>
        </div>
      </Section>

      <Section icon={Orbit} title="Visualizers & Explorers">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <LabCard title="Orbital Shape Viewer">
            <select value={orbitalType} onChange={e => setOrbitalType(e.target.value)} className="input text-xs mb-3">
              {Object.keys(orbitalMeta).map(type => <option key={type}>{type}</option>)}
            </select>
            <div className="h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
              {Array.from({ length: orbital.lobes }, (_, i) => {
                const angle = (360 / orbital.lobes) * i;
                return (
                  <span
                    key={i}
                    className="absolute w-16 h-10 rounded-[50%] opacity-80"
                    style={{
                      background: i % 2 ? '#ef4444' : '#38bdf8',
                      transform: `rotate(${angle}deg) translateX(${orbitalType === 's' ? 0 : 24}px)`,
                    }}
                  />
                );
              })}
              <span className="absolute w-4 h-4 rounded-full bg-white" />
            </div>
            <p className="text-xs text-gray-500 mt-2">{orbitalType} orbital: {orbital.note} Blue/red show opposite wavefunction phase.</p>
          </LabCard>

          <LabCard title="Crystal Structure Viewer">
            <select value={structureType} onChange={e => setStructureType(e.target.value)} className="input text-xs mb-3">
              {['NaCl', 'diamond', 'HCP', 'FCC'].map(type => <option key={type}>{type}</option>)}
            </select>
            <div className="h-32 rounded-xl bg-black/20 border border-white/10 grid grid-cols-4 gap-1 p-4">
              {Array.from({ length: structureType === 'HCP' ? 18 : 16 }, (_, i) => (
                <span key={i} className="rounded-full border border-white/15" style={{
                  background: structureType === 'NaCl' && i % 2 ? '#4ade80' : '#94a3b8',
                  transform: structureType === 'HCP' ? `translateX(${(Math.floor(i / 4) % 2) * 10}px)` : structureType === 'FCC' && [0, 3, 12, 15, 5, 6, 9, 10].includes(i) ? 'scale(1.15)' : 'scale(0.85)',
                }} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Compare cubic, diamond, close-packed, and ionic unit-cell patterns.</p>
          </LabCard>

          <LabCard title="Hybridization Animator">
            <select value={hybrid} onChange={e => setHybrid(e.target.value)} className="input text-xs mb-2">
              {['sp', 'sp2', 'sp3', 'dsp2', 'sp3d'].map(h => <option key={h}>{h}</option>)}
            </select>
            <input type="range" min="0" max="100" value={hybridMix} onChange={e => setHybridMix(Number(e.target.value))} className="w-full mb-3" />
            <div className="h-28 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-1">
              {Array.from({ length: hybrid === 'sp' ? 2 : hybrid === 'sp2' ? 3 : hybrid === 'sp3' ? 4 : 5 }, (_, i) => (
                <span key={i} className="w-8 rounded-[50%] bg-gradient-to-b from-cyan-300 to-violet-500" style={{ height: `${36 + hybridMix / 3}px`, transform: `rotate(${i * 35 - hybridMix / 8}deg)` }} />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Mix amount {hybridMix}% shows atomic orbitals combining into directed hybrids.</p>
          </LabCard>

          <LabCard title="VSEPR Shape Builder">
            <div className="grid grid-cols-2 gap-2 mb-3 text-[10px] text-gray-500">
              <label>Bonded atoms<input type="number" min="1" max="6" value={bondedAtoms} onChange={e => setBondedAtoms(Number(e.target.value))} className="input text-xs mt-1" /></label>
              <label>Lone pairs<input type="number" min="0" max="3" value={lonePairs} onChange={e => setLonePairs(Number(e.target.value))} className="input text-xs mt-1" /></label>
            </div>
            <svg viewBox="0 0 100 80" className="w-full h-28 rounded-xl bg-black/20 border border-white/10">
              {geometry.points.slice(1).map((p, i) => <line key={i} x1="50" y1="40" x2={p[0]} y2={p[1] * 0.8} stroke="#38bdf8" />)}
              {geometry.points.map((p, i) => <circle key={i} cx={p[0]} cy={p[1] * 0.8} r={i ? 4 : 7} fill={i ? '#e2e8f0' : '#f59e0b'} />)}
            </svg>
            <p className="text-xs text-gray-500 mt-2">AX{bondedAtoms}E{lonePairs}: {vsepr.shape}, {vsepr.angle}.</p>
          </LabCard>

          <LabCard title="Bond Polarity Visualizer">
            <div className="flex gap-2 mb-3">
              <input value={polarityA} onChange={e => setPolarityA(e.target.value)} className="input text-xs" />
              <input value={polarityB} onChange={e => setPolarityB(e.target.value)} className="input text-xs" />
            </div>
            <svg viewBox="0 0 220 80" className="w-full h-28 rounded-xl bg-black/20 border border-white/10">
              <circle cx="55" cy="40" r="18" fill="#94a3b8" />
              <circle cx="165" cy="40" r="18" fill="#38bdf8" />
              <line x1="73" y1="40" x2="147" y2="40" stroke="#e2e8f0" strokeWidth="4" />
              <line x1="90" y1="22" x2="145" y2="22" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrow)" />
              <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" /></marker></defs>
              <text x="50" y="45" fontSize="11" fill="#fff">{polarityA}</text>
              <text x="160" y="45" fontSize="11" fill="#fff">{polarityB}</text>
            </svg>
            <p className="text-xs text-gray-500 mt-2">{polarity.type}. Delta EN {polarity.delta?.toFixed?.(2) ?? 'n/a'}; arrow points toward the more electronegative atom.</p>
          </LabCard>

          <LabCard title="Reaction Mechanism Player">
            <div className="flex gap-2 mb-3">
              <select value={mechanism} onChange={e => { setMechanism(e.target.value); setMechanismStep(0); }} className="input text-xs">
                {Object.keys(mechanismData).map(m => <option key={m}>{m}</option>)}
              </select>
              <input type="range" min="0" max={mechanismSteps.length - 1} value={mechanismStep} onChange={e => setMechanismStep(Number(e.target.value))} />
            </div>
            <div className="h-28 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
              <span className="text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">Nu: {'->'} C - LG</span>
              <span className="mx-2 text-cyan-300 text-2xl">↷</span>
              <span className="text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">Product</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{mechanism}: {mechanismSteps[mechanismStep]}</p>
          </LabCard>

          <LabCard title="Intermolecular Forces Demo">
            <select value={imfType} onChange={e => setImfType(e.target.value)} className="input text-xs mb-3">
              {['London dispersion', 'dipole-dipole', 'hydrogen bonding'].map(type => <option key={type}>{type}</option>)}
            </select>
            <div className="h-28 rounded-xl bg-black/20 border border-white/10 relative overflow-hidden">
              {Array.from({ length: 6 }, (_, i) => <span key={i} className="absolute w-12 h-6 rounded-full bg-cyan-400/30 border border-cyan-300/30" style={{ left: `${10 + (i % 3) * 28}%`, top: `${20 + Math.floor(i / 3) * 38}%` }} />)}
              {Array.from({ length: imfType === 'hydrogen bonding' ? 5 : imfType === 'dipole-dipole' ? 3 : 2 }, (_, i) => <span key={i} className="absolute border-t border-dashed border-yellow-300 w-16" style={{ left: `${20 + i * 12}%`, top: `${42 + (i % 2) * 20}%` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">{imfType} controls boiling point, viscosity, and solubility trends.</p>
          </LabCard>

          <LabCard title="Nuclear Decay Simulator">
            <select value={decayMode} onChange={e => setDecayMode(e.target.value)} className="input text-xs mb-2">
              {['alpha', 'beta-', 'gamma'].map(mode => <option key={mode}>{mode}</option>)}
            </select>
            <input type="range" min="0" max="8" value={decayHalfLives} onChange={e => setDecayHalfLives(Number(e.target.value))} className="w-full" />
            <div className="h-20 rounded-xl bg-black/20 border border-white/10 mt-3 flex items-center justify-center gap-3">
              <span className="w-12 h-12 rounded-full bg-red-400/60 flex items-center justify-center text-xs text-white">Parent</span>
              <span className="text-yellow-300">{decayMode === 'alpha' ? 'α' : decayMode === 'beta-' ? 'β-' : 'γ'}</span>
              <span className="w-12 h-12 rounded-full bg-green-400/50 flex items-center justify-center text-xs text-white">Daughter</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">{decayRemaining.toFixed(2)}% parent remains after {decayHalfLives} half-lives.</p>
          </LabCard>

          <LabCard title="Phase Diagram Explorer">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
              <label>Temp {phaseTemp} C<input type="range" min="-50" max="450" value={phaseTemp} onChange={e => setPhaseTemp(Number(e.target.value))} className="w-full" /></label>
              <label>Pressure {phasePressure} atm<input type="range" min="0.001" max="220" step="0.1" value={phasePressure} onChange={e => setPhasePressure(Number(e.target.value))} className="w-full" /></label>
            </div>
            <svg viewBox="0 0 220 120" className="w-full h-32 rounded-xl bg-black/20 border border-white/10">
              <path d="M20 95 C70 65, 85 45, 110 20" stroke="#38bdf8" fill="none" />
              <path d="M45 100 C78 75, 130 70, 190 25" stroke="#f59e0b" fill="none" />
              <circle cx={20 + Math.min(190, (phaseTemp + 50) * 0.38)} cy={105 - Math.min(95, Math.log10(phasePressure + 1) * 40)} r="5" fill="#22c55e" />
              <text x="25" y="112" fontSize="8" fill="#64748b">triple</text><text x="168" y="22" fontSize="8" fill="#64748b">critical</text>
            </svg>
            <p className="text-xs text-gray-500 mt-2">At {phaseTemp} C and {phasePressure} atm: {phase}.</p>
          </LabCard>

          <LabCard title="Molecular Orbital Diagram">
            <select value={moMolecule} onChange={e => setMoMolecule(e.target.value)} className="input text-xs mb-3">
              {Object.keys(moData).map(m => <option key={m}>{m}</option>)}
            </select>
            <div className="space-y-1">
              {mo.fill.map((row, i) => <div key={row} className="flex items-center gap-2 text-xs"><span className="w-20 text-gray-500">level {i + 1}</span><span className="flex-1 rounded-lg bg-white/[0.05] border border-white/10 px-2 py-1 text-gray-200 font-mono">{row}</span></div>)}
            </div>
            <p className="text-xs text-gray-500 mt-2">{moMolecule}: bond order {mo.order}, {mo.magnetic}, {mo.electrons} valence electrons.</p>
          </LabCard>
        </div>
      </Section>

      <Section icon={FlaskConical} title="Virtual Lab Experiments">
        <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <LabCard title="Reaction Rate Lab">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
              <label>Temperature: {rateTemp} C<input type="range" min="5" max="80" value={rateTemp} onChange={e => setRateTemp(Number(e.target.value))} className="w-full" /></label>
              <label>Concentration: {rateConc.toFixed(1)} M<input type="range" min="0.2" max="3" step="0.1" value={rateConc} onChange={e => setRateConc(Number(e.target.value))} className="w-full" /></label>
            </div>
            <svg viewBox="0 0 250 90" className="w-full h-28 rounded-xl bg-black/20 border border-white/10">
              <polyline fill="none" stroke="#38bdf8" strokeWidth="3" points={ratePoints.map(p => `${p.x},${p.y}`).join(' ')} />
              <text x="8" y="84" fontSize="8" fill="#64748b">product vs time; k={rateK.toFixed(2)}</text>
            </svg>
          </LabCard>

          <LabCard title="Calorimetry Experiment">
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
              <label>Metal temp: {metalTemp} C<input type="range" min="30" max="150" value={metalTemp} onChange={e => setMetalTemp(Number(e.target.value))} className="w-full" /></label>
              <label>Metal mass: {metalMass} g<input type="range" min="10" max="200" value={metalMass} onChange={e => setMetalMass(Number(e.target.value))} className="w-full" /></label>
            </div>
            <div className="h-28 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-end justify-center overflow-hidden">
              <div className="w-28 rounded-t-3xl transition-all" style={{ height: `${Math.min(100, finalTemp * 1.8)}%`, background: finalTemp > 35 ? '#ef4444' : '#38bdf8' }} />
            </div>
            <p className="text-xs text-gray-500 mt-2">Final equilibrium temperature: {finalTemp.toFixed(2)} C using q metal + q water = 0.</p>
          </LabCard>

          <LabCard title="Solubility Lab">
            <div className="flex gap-2 mb-3">
              <select value={salt} onChange={e => setSalt(e.target.value)} className="input text-xs">{Object.keys(kspData).map(s => <option key={s}>{s}</option>)}</select>
              <input type="number" step="0.0005" value={saltAdded} onChange={e => setSaltAdded(Number(e.target.value))} className="input text-xs" />
            </div>
            <MiniBar label={`Q = ${ionProduct.toExponential(2)}`} value={Math.min(100, (ionProduct / selectedSalt.ksp) * 30)} color={precipitates ? '#ef4444' : '#22c55e'} />
            <p className="text-xs text-gray-500 mt-2">Ksp {selectedSalt.ksp.toExponential(2)}. {precipitates ? 'Precipitate forms.' : 'Solution remains unsaturated/saturated.'}</p>
          </LabCard>

          <LabCard title="Indicator Color Table">
            <div className="flex gap-2 mb-3">
              <select value={indicator} onChange={e => setIndicator(e.target.value)} className="input text-xs">{Object.keys(indicators).map(i => <option key={i}>{i}</option>)}</select>
              <label className="text-[10px] text-gray-500 flex-1">pH {solutionPh}<input type="range" min="0" max="14" step="0.1" value={solutionPh} onChange={e => setSolutionPh(Number(e.target.value))} className="w-full" /></label>
            </div>
            <div className="h-24 rounded-xl border border-white/10 flex items-center justify-center text-sm font-bold" style={{ background: indicatorColor(indicator, solutionPh), color: solutionPh > 4 && solutionPh < 10 ? '#111827' : '#fff' }}>{indicator}</div>
            <p className="text-xs text-gray-500 mt-2">Transition range: pH {indicators[indicator].low}-{indicators[indicator].high}.</p>
          </LabCard>

          <LabCard title="Galvanic Series / Corrosion Demo">
            <div className="flex gap-2 mb-3">
              {[
                [metalA, setMetalA],
                [metalB, setMetalB],
              ].map(([value, setter], i) => <select key={i} value={value} onChange={e => setter(e.target.value)} className="input text-xs">{Object.keys(reductionPotentials).map(m => <option key={m}>{m}</option>)}</select>)}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              {[metalA, metalB].map(m => <div key={m} className={`rounded-xl p-3 border ${m === corrosion ? 'border-red-400/40 bg-red-500/10' : 'border-green-400/30 bg-green-500/10'}`}><p className="text-xl font-black text-white">{m}</p><p className="text-[10px] text-gray-500">E deg {reductionPotentials[m]} V</p></div>)}
            </div>
            <p className="text-xs text-gray-500 mt-2">{corrosion} corrodes first. Cell voltage about {cellVoltage.toFixed(2)} V.</p>
          </LabCard>

          <LabCard title="Soap Making (Saponification)">
            <input type="range" min="0" max="100" value={sapProgress} onChange={e => setSapProgress(Number(e.target.value))} className="w-full mb-3" />
            <div className="h-24 rounded-xl bg-black/20 border border-white/10 relative overflow-hidden">
              {Array.from({ length: 14 }, (_, i) => <span key={i} className="absolute h-2 rounded-full bg-emerald-300" style={{ width: `${20 + sapProgress / 5}px`, left: `${8 + (i % 7) * 13}%`, top: `${20 + Math.floor(i / 7) * 35}%`, transform: `rotate(${i * 23}deg)` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Triglyceride + 3NaOH {'->'} glycerol + 3 soap salts. Micelles grow as progress reaches {sapProgress}%.</p>
          </LabCard>

          <LabCard title="Fermentation Simulator">
            <label className="text-[10px] text-gray-500">Yeast temperature: {yeastTemp} C<input type="range" min="5" max="55" value={yeastTemp} onChange={e => setYeastTemp(Number(e.target.value))} className="w-full" /></label>
            <MiniBar label="Yeast activity" value={yeastActivity} color="#f59e0b" />
            <div className="mt-3 flex flex-wrap gap-1">{Array.from({ length: Math.round(yeastActivity / 8) }, (_, i) => <span key={i} className="w-3 h-3 rounded-full bg-slate-200 animate-pulse" />)}</div>
            <p className="text-xs text-gray-500 mt-2">C6H12O6 {'->'} 2C2H5OH + 2CO2. Activity peaks near 30-35 C.</p>
          </LabCard>

          <LabCard title="Polymer Builder">
            <label className="text-[10px] text-gray-500">Monomers: {polymerLength}<input type="range" min="2" max="24" value={polymerLength} onChange={e => setPolymerLength(Number(e.target.value))} className="w-full" /></label>
            <div className="flex flex-wrap gap-1 mt-3">
              {Array.from({ length: polymerLength }, (_, i) => <span key={i} className="px-2 py-1 rounded-lg bg-violet-500/20 border border-violet-400/20 text-xs text-violet-100">CH2</span>)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Addition polymerization links alkene monomers into a growing carbon chain.</p>
          </LabCard>

          <LabCard title="Buffer Solution Lab">
            <label className="text-[10px] text-gray-500">Acid/base added: {bufferAdded.toFixed(1)} mmol<input type="range" min="-5" max="5" step="0.1" value={bufferAdded} onChange={e => setBufferAdded(Number(e.target.value))} className="w-full" /></label>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10"><p className="text-[10px] text-gray-500">Acetate buffer</p><p className="text-xl font-black text-white">pH {bufferPh.toFixed(2)}</p></div>
              <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10"><p className="text-[10px] text-gray-500">Pure water</p><p className="text-xl font-black text-white">pH {pureWaterPh.toFixed(2)}</p></div>
            </div>
          </LabCard>

          <LabCard title="Recrystallization Visualizer">
            <label className="text-[10px] text-gray-500">Cooling temperature: {recrystTemp} C<input type="range" min="0" max="90" value={recrystTemp} onChange={e => setRecrystTemp(Number(e.target.value))} className="w-full" /></label>
            <div className="h-28 rounded-xl bg-cyan-500/10 border border-cyan-400/20 relative overflow-hidden mt-3">
              {Array.from({ length: Math.round(supersaturation / 5) }, (_, i) => <span key={i} className="absolute w-3 h-3 rotate-45 bg-cyan-200" style={{ left: `${8 + (i % 8) * 11}%`, top: `${20 + Math.floor(i / 8) * 22}%` }} />)}
            </div>
            <p className="text-xs text-gray-500 mt-2">Supersaturation index {supersaturation.toFixed(1)}. Crystals form as solubility drops on cooling.</p>
          </LabCard>
        </div>
      </Section>

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
