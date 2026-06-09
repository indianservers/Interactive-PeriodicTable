import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, BadgeCheck, BarChart3, BookOpen, Brain, Boxes, Calculator, Download,
  FlaskConical, GraduationCap, Languages, Mic2, Orbit, Printer, RadioTower,
  ShieldAlert, Sparkles, Trophy, Zap, Atom, GitCompare, Waves, Search,
  CheckCircle, ChevronLeft, ChevronRight, Lightbulb, Target, SlidersHorizontal,
} from 'lucide-react';
import { elements } from '../data/elements.js';
import { ALL_MOLECULES } from '../data/molecules.js';
import {
  abundanceRows, balanceEquation, buildIonicFormula, classifyBond, crystalLattices,
  buildElectrochemicalCell, calculateReactionEnthalpy,
  electronConfigParts, electrolysisProducts, elementEnrichment, ionData, lewisAssessment,
  halfReactions, likelyIsotopes, molarMass, normalizeFormulaText, parseFormula, reactionLibrary, standardFormationEnthalpies, strongAcidStrongBaseTitration,
  vseprFromDomains,
} from '../utils/chemistryTools.js';
import { getCategoryInfo } from '../data/categories.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getSyllabusTagsForLab, syllabusTrackMap, syllabusTracks } from '../data/syllabus.js';

const lazyLabTools = {
  titration: lazy(() => import('../labTools/TitrationTool.jsx')),
  'ph-meter': lazy(() => import('../labTools/PhMeterTool.jsx')),
  'gas-law': lazy(() => import('../labTools/GasLawTool.jsx')),
  'molar-mass': lazy(() => import('../labTools/MolarMassTool.jsx')),
  'formula-builder': lazy(() => import('../labTools/MolarMassTool.jsx')),
  hess: lazy(() => import('../labTools/HessTool.jsx')),
  'electrochemical-cell': lazy(() => import('../labTools/ElectrochemicalCellTool.jsx')),
};

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

const AVOGADRO = 6.022e23;

const unitCellData = {
  'Simple Cubic': { atoms: 1, packing: 52.4, coordination: 6, voids: 'Cubic voids; tetrahedral/octahedral void language is mainly used for close packing.', points: [[20,20],[80,20],[20,80],[80,80]], z: 1 },
  BCC: { atoms: 2, packing: 68, coordination: 8, voids: 'Distorted tetrahedral and octahedral interstitial sites.', points: [[20,20],[80,20],[20,80],[80,80],[50,50]], z: 2 },
  FCC: { atoms: 4, packing: 74, coordination: 12, voids: 'Octahedral voids = N; tetrahedral voids = 2N for N close-packed atoms.', points: [[20,20],[80,20],[20,80],[80,80],[50,20],[20,50],[80,50],[50,80]], z: 4 },
  HCP: { atoms: 6, packing: 74, coordination: 12, voids: 'Octahedral voids = N; tetrahedral voids = 2N in close-packed ABAB layers.', points: [[28,24],[72,24],[50,44],[28,64],[72,64],[50,84]], z: 6 },
};

const UnitCellSvg = ({ type }) => {
  const data = unitCellData[type] || unitCellData.FCC;
  return (
    <svg viewBox="0 0 100 100" className="w-full h-56 rounded-xl bg-black/20 border border-white/10">
      <rect x="20" y="20" width="60" height="60" fill="none" stroke="#64748b" strokeWidth="2" />
      <path d="M20 20 L36 10 H96 L80 20 M80 20 L96 10 V70 L80 80 M20 80 L36 70 H96" fill="none" stroke="#475569" strokeWidth="1.5" />
      {data.points.map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r={index > 3 ? 6 : 7} fill={index > 3 ? '#38bdf8' : '#a78bfa'} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      <text x="8" y="94" fill="#94a3b8" fontSize="7">{type}</text>
    </svg>
  );
};

const CrystalGrid = ({ mode, compound }) => {
  const missing = mode === 'schottky' ? new Set(['2-2', '3-3']) : new Set();
  const displaced = mode === 'frenkel' ? '2-2' : null;
  return (
    <svg viewBox="0 0 160 120" className="w-full h-36 rounded-xl bg-black/20 border border-white/10">
      {Array.from({ length: 5 }, (_, row) => Array.from({ length: 6 }, (_, col) => {
        const id = `${row}-${col}`;
        const ion = compound === 'ionic' ? ((row + col) % 2 === 0 ? 'Na+' : 'Cl-') : 'M';
        const isMissing = missing.has(id) || (mode === 'frenkel' && id === displaced);
        if (isMissing) return <circle key={id} cx={18 + col * 24} cy={16 + row * 21} r="7" fill="none" stroke="#ef4444" strokeDasharray="2 2" />;
        return (
          <g key={id}>
            <circle cx={18 + col * 24} cy={16 + row * 21} r="7" fill={ion === 'Cl-' ? '#34d399' : '#60a5fa'} opacity={compound === 'metal' ? 0.85 : 1} />
            <text x={18 + col * 24} y={18 + row * 21} textAnchor="middle" fontSize="5" fill="#020617" fontWeight="700">{ion}</text>
          </g>
        );
      }))}
      {mode === 'frenkel' && <circle cx="114" cy="58" r="6" fill="#60a5fa" stroke="#fbbf24" strokeWidth="2" />}
      <text x="8" y="114" fill="#94a3b8" fontSize="7">{mode === 'perfect' ? 'Perfect crystal' : mode === 'schottky' ? 'Schottky defect' : 'Frenkel defect'}</text>
    </svg>
  );
};

const SiliconDopingSvg = ({ type }) => (
  <svg viewBox="0 0 220 110" className="w-full h-36 rounded-xl bg-black/20 border border-white/10">
    {Array.from({ length: 4 }, (_, row) => Array.from({ length: 6 }, (_, col) => {
      const dopant = row === 1 && col === 3;
      return (
        <g key={`${row}-${col}`}>
          <circle cx={22 + col * 35} cy={20 + row * 24} r="9" fill={dopant ? (type === 'n' ? '#22c55e' : '#f472b6') : '#38bdf8'} />
          <text x={22 + col * 35} y={23 + row * 24} textAnchor="middle" fontSize="7" fill="#020617" fontWeight="900">{dopant ? (type === 'n' ? 'P' : 'B') : 'Si'}</text>
        </g>
      );
    }))}
    <text x="10" y="104" fill="#cbd5e1" fontSize="8">{type === 'n' ? 'n-type: Group 15 dopant adds extra electron' : 'p-type: Group 13 dopant creates a hole'}</text>
  </svg>
);

const IsothermPlot = ({ freundlichK, freundlichN, langmuirA, langmuirB }) => {
  const fPoints = Array.from({ length: 20 }, (_, i) => {
    const p = 0.1 + i * 0.5;
    const y = freundlichK * (p ** (1 / freundlichN));
    return `${12 + i * 11},${92 - Math.min(78, y * 18)}`;
  }).join(' ');
  const lPoints = Array.from({ length: 20 }, (_, i) => {
    const p = 0.1 + i * 0.5;
    const y = (langmuirA * p) / (1 + langmuirB * p);
    return `${12 + i * 11},${92 - Math.min(78, y * 18)}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 240 110" className="w-full h-56 rounded-xl bg-black/20 border border-white/10">
      <line x1="12" y1="92" x2="225" y2="92" stroke="#64748b" />
      <line x1="12" y1="10" x2="12" y2="92" stroke="#64748b" />
      <polyline points={fPoints} fill="none" stroke="#38bdf8" strokeWidth="3" />
      <polyline points={lPoints} fill="none" stroke="#f59e0b" strokeWidth="3" />
      <text x="160" y="18" fill="#38bdf8" fontSize="8">Freundlich</text>
      <text x="160" y="31" fill="#f59e0b" fontSize="8">Langmuir</text>
      <text x="104" y="106" fill="#94a3b8" fontSize="8">Pressure P</text>
      <text x="18" y="18" fill="#94a3b8" fontSize="8">x/m</text>
    </svg>
  );
};

const indicatorColor = (indicator, pH) => {
  const item = indicators[indicator];
  if (pH < item.low) return item.acid;
  if (pH > item.high) return item.base;
  return item.mid;
};

const difficultyStyles = {
  Beginner: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Intermediate: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Advanced: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
};

const typeStyles = {
  Simulation: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/25',
  Calculator: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  Visualizer: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  Practice: 'bg-pink-500/15 text-pink-300 border-pink-500/25',
  Reference: 'bg-slate-500/15 text-slate-300 border-slate-500/25',
};

const BadgePill = ({ children, className = '', style }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`} style={style}>
    {children}
  </span>
);

const newLabToolIds = new Set([
  'unit-cell', 'crystal-defects', 'adsorption', 'named-reactions', 'functional-tests', 'isomerism',
  'reactivity-series', 'quantum-numbers', 'gibbs', 'environmental-chem', 'cft', 'metallurgy',
  'salt-analysis', 'pblock-advanced', 'drug-functional-groups', 'adme-ionization', 'isotonicity',
  'clinical-buffers', 'pharma-analysis', 'radiopharma', 'enzyme-kinetics', 'amino-acid-pi',
  'protein-structure', 'carbohydrate-lab', 'lipid-membrane', 'nucleic-acid-lab',
  'vitamin-coenzyme-map', 'metabolism-atp', 'drug-class-studio', 'drug-metabolism-lab',
  'dosage-form-lab', 'antacid-analgesic-antimicrobial', 'pharma-buffer-lab', 'electrolyte-panel',
  'hemoglobin-oxygen', 'diagnostic-color-tests', 'clinical-metabolites', 'toxicology-chelation',
]);

const experimentBestFor = (item) => {
  if (item.type === 'Calculator') return 'Fast numerical practice';
  if (item.type === 'Practice') return 'Exam-style revision';
  if (item.type === 'Reference') return 'Quick theory lookup';
  if (item.type === 'Visualizer') return 'Concept visualization';
  return 'Interactive learning';
};

const estimatedMinutes = (item) => {
  if (item.difficulty === 'Beginner') return 3;
  if (item.difficulty === 'Intermediate') return 5;
  return item.type === 'Reference' ? 7 : 8;
};

const organicTracks = ['Class 11', 'Class 12', 'JEE Advanced'];

const namedReactionData = [
  { name: 'Aldol Condensation', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: '2 R-CHO -> beta-hydroxy aldehyde -> alpha,beta-unsaturated aldehyde', conditions: 'Dilute NaOH or Ba(OH)2, warm after aldol addition', mechanism: 'Enolate addition followed by dehydration' },
  { name: 'Cannizzaro Reaction', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: '2 HCHO + OH- -> HCOO- + CH3OH', conditions: 'Conc. NaOH/KOH; aldehyde without alpha-H', mechanism: 'Disproportionation via hydride transfer' },
  { name: 'Friedel-Crafts Acylation', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'Ar-H + RCOCl -> Ar-COR + HCl', conditions: 'Anhydrous AlCl3, dry solvent', mechanism: 'Electrophilic aromatic substitution, acylium ion' },
  { name: 'Friedel-Crafts Alkylation', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'Ar-H + R-Cl -> Ar-R + HCl', conditions: 'Anhydrous AlCl3; alkyl halide', mechanism: 'Electrophilic aromatic substitution, carbocation-like electrophile' },
  { name: 'Williamson Ether Synthesis', category: 'Organic', level: ['Class 12', 'JEE Main'], equation: 'R-O-Na+ + R-X -> R-O-R + NaX', conditions: 'Dry ether; primary alkyl halide preferred', mechanism: 'SN2 substitution' },
  { name: 'Wurtz Reaction', category: 'Organic', level: ['Class 11', 'JEE Main'], equation: '2 R-X + 2 Na -> R-R + 2 NaX', conditions: 'Dry ether; sodium metal', mechanism: 'Radical coupling of alkyl halides' },
  { name: 'Sandmeyer Reaction', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'Ar-N2+Cl- + CuCl -> Ar-Cl + N2', conditions: 'CuCl/CuBr/CuCN, cold diazonium salt', mechanism: 'Diazonium replacement' },
  { name: 'Gattermann Reaction', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'Ar-N2+Cl- + HX/Cu -> Ar-X + N2', conditions: 'HCl or HBr with copper powder', mechanism: 'Diazonium halogenation' },
  { name: 'Reimer-Tiemann Reaction', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'Phenol + CHCl3 + NaOH -> salicylaldehyde', conditions: 'CHCl3, aq. NaOH, heat; acid workup', mechanism: 'Electrophilic substitution by dichlorocarbene' },
  { name: 'Kolbe Reaction', category: 'Organic', level: ['Class 12', 'JEE Main'], equation: 'Sodium phenoxide + CO2 -> salicylic acid', conditions: 'CO2, pressure, 400 K; acidification', mechanism: 'Carboxylation of phenoxide' },
  { name: 'Hell-Volhard-Zelinsky', category: 'Organic', level: ['Class 12', 'JEE Advanced'], equation: 'RCH2COOH + Br2 -> RCHBrCOOH', conditions: 'Br2/Cl2 with red P or PBr3', mechanism: 'Alpha-halogenation through acyl halide/enol' },
  { name: 'Diels-Alder Reaction', category: 'Organic', level: ['JEE Advanced'], equation: 'Conjugated diene + dienophile -> cyclohexene derivative', conditions: 'Heat; electron-rich diene and electron-poor dienophile', mechanism: 'Concerted [4+2] cycloaddition' },
  { name: 'Haber Process', category: 'Industrial', level: ['Class 11', 'JEE Main'], equation: 'N2 + 3 H2 <=> 2 NH3', conditions: 'Fe catalyst, 450 C, 150-250 atm, K2O/Al2O3 promoters', mechanism: 'Heterogeneous catalytic equilibrium' },
  { name: 'Ostwald Process', category: 'Industrial', level: ['Class 12', 'JEE Main'], equation: 'NH3 -> NO -> NO2 -> HNO3', conditions: 'Pt/Rh gauze, about 800 C, oxidation and absorption', mechanism: 'Catalytic oxidation sequence' },
  { name: 'Contact Process', category: 'Industrial', level: ['Class 12', 'JEE Main'], equation: '2 SO2 + O2 <=> 2 SO3 -> H2SO4', conditions: 'V2O5, 720 K, 1-2 atm; absorb SO3 in H2SO4', mechanism: 'Catalytic oxidation and absorption' },
  { name: 'Solvay Process', category: 'Industrial', level: ['Class 11', 'JEE Main'], equation: 'NaCl + NH3 + CO2 + H2O -> NaHCO3 -> Na2CO3', conditions: 'Brine saturated with NH3 and CO2; calcination', mechanism: 'Precipitation and thermal decomposition' },
  { name: 'Bessemer Process', category: 'Inorganic', level: ['Class 12', 'JEE Main'], equation: 'Molten pig iron + O2 -> steel + oxides', conditions: 'Air blown through molten iron in converter', mechanism: 'Oxidative removal of C, Si, Mn impurities' },
];

const functionalTestData = [
  { name: "Tollens' test", detects: 'Aldehydes and reducing sugars', reagents: 'Ammoniacal AgNO3', positive: 'Bright silver mirror or black Ag deposit', negative: 'No silver mirror', example: 'Glucose or ethanal' },
  { name: "Fehling's test", detects: 'Aliphatic aldehydes and reducing sugars', reagents: 'Fehling A + Fehling B, warm', positive: 'Brick-red Cu2O precipitate', negative: 'Solution remains blue', example: 'Ethanal' },
  { name: 'Lucas test', detects: 'Alcohol class: 3 deg, 2 deg, 1 deg', reagents: 'Conc. HCl + anhydrous ZnCl2', positive: 'Turbidity: immediate for 3 deg, minutes for 2 deg, slow/none for 1 deg', negative: 'No turbidity at room temperature', example: 'tert-Butyl alcohol' },
  { name: 'Iodoform test', detects: 'CH3CO- group or CH3CH(OH)- alcohols', reagents: 'I2/NaOH', positive: 'Yellow CHI3 precipitate with antiseptic smell', negative: 'No yellow precipitate', example: 'Ethanol or acetone' },
  { name: "Baeyer's test", detects: 'Unsaturation in alkenes/alkynes', reagents: 'Cold dilute alkaline KMnO4', positive: 'Purple KMnO4 decolorizes with brown MnO2', negative: 'Purple color persists', example: 'Ethene' },
  { name: 'Hinsberg test', detects: 'Primary, secondary, tertiary amines', reagents: 'Benzenesulfonyl chloride + NaOH', positive: 'Primary soluble then precipitates on acidification; secondary insoluble sulfonamide', negative: 'Tertiary amine does not form sulfonamide', example: 'Aniline' },
  { name: '2,4-DNP test', detects: 'Aldehydes and ketones', reagents: '2,4-dinitrophenylhydrazine reagent', positive: 'Orange/yellow crystalline precipitate', negative: 'No precipitate', example: 'Propanone' },
  { name: 'Victor Meyer test', detects: 'Primary, secondary, tertiary alcohols', reagents: 'PI3, AgNO2, HNO2, alkali', positive: 'Red for primary, blue for secondary, colorless for tertiary', negative: 'No diagnostic color if conversion fails', example: 'Ethanol' },
  { name: 'Sodium bicarbonate test', detects: 'Carboxylic acids', reagents: 'NaHCO3 solution', positive: 'Brisk CO2 effervescence', negative: 'No effervescence', example: 'Acetic acid' },
  { name: 'Litmus/pH test', detects: 'Acids vs phenols', reagents: 'Blue litmus or pH paper', positive: 'Carboxylic acids turn blue litmus red strongly; phenols weakly acidic', negative: 'Neutral compounds show little change', example: 'Benzoic acid vs phenol' },
];

const functionalQuizData = [
  { compound: 'Ethanal', answer: "Tollens' test", expected: 'Silver mirror; Fehling also gives brick-red ppt.' },
  { compound: 'Acetone', answer: '2,4-DNP test', expected: 'Orange precipitate; iodoform is also positive for methyl ketone.' },
  { compound: 'Ethene', answer: "Baeyer's test", expected: 'Cold alkaline KMnO4 decolorizes.' },
  { compound: 'Acetic acid', answer: 'Sodium bicarbonate test', expected: 'CO2 effervescence.' },
  { compound: 'tert-Butyl alcohol', answer: 'Lucas test', expected: 'Immediate turbidity.' },
];

const structuralIsomerData = {
  C4H10: [
    { type: 'Chain', name: 'Butane', formula: 'CH3-CH2-CH2-CH3', points: [[16, 58], [58, 34], [100, 58], [142, 34]] },
    { type: 'Chain', name: '2-methylpropane', formula: '(CH3)3CH', points: [[30, 62], [74, 38], [118, 62], [74, 84]] },
  ],
  C3H6O: [
    { type: 'Functional', name: 'Propanal', formula: 'CH3-CH2-CHO', points: [[18, 62], [66, 38], [114, 62]], suffix: 'CHO' },
    { type: 'Functional', name: 'Propanone', formula: 'CH3-CO-CH3', points: [[18, 62], [72, 38], [126, 62]], suffix: 'C=O' },
  ],
  C2H6O: [
    { type: 'Functional', name: 'Ethanol', formula: 'CH3-CH2-OH', points: [[24, 62], [80, 38], [136, 62]], suffix: 'OH' },
    { type: 'Functional', name: 'Methoxymethane', formula: 'CH3-O-CH3', points: [[28, 62], [82, 38], [136, 62]], suffix: 'O' },
  ],
  C4H8: [
    { type: 'Position', name: 'But-1-ene', formula: 'CH2=CH-CH2-CH3', points: [[16, 58], [58, 34], [100, 58], [142, 34]], suffix: 'C=C at C1' },
    { type: 'Position', name: 'But-2-ene', formula: 'CH3-CH=CH-CH3', points: [[16, 34], [58, 58], [100, 58], [142, 34]], suffix: 'C=C at C2' },
    { type: 'Chain', name: '2-methylpropene', formula: '(CH3)2C=CH2', points: [[34, 58], [80, 34], [126, 58], [80, 84]], suffix: 'branched alkene' },
  ],
};

const BondLineSketch = ({ item, label }) => (
  <svg viewBox="0 0 160 110" className="w-full h-32 rounded-xl bg-black/20 border border-white/10">
    <polyline points={item.points.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke="#e2e8f0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    {item.points.map(([x, y], index) => <circle key={index} cx={x} cy={y} r="3" fill="#38bdf8" />)}
    {item.suffix && <text x="80" y="92" textAnchor="middle" fill="#a5f3fc" fontSize="9">{item.suffix}</text>}
    <text x="10" y="18" fill="#94a3b8" fontSize="8">{label || item.formula}</text>
  </svg>
);

const StereoSketches = () => (
  <div className="grid lg:grid-cols-3 gap-3">
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">Geometric: cis/trans but-2-ene</p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        <line x1="54" y1="42" x2="98" y2="62" stroke="#e2e8f0" strokeWidth="3" />
        <line x1="98" y1="62" x2="142" y2="62" stroke="#e2e8f0" strokeWidth="5" />
        <line x1="142" y1="62" x2="186" y2="42" stroke="#e2e8f0" strokeWidth="3" />
        <text x="44" y="36" fill="#a5f3fc" fontSize="10">CH3</text><text x="176" y="36" fill="#a5f3fc" fontSize="10">CH3</text>
        <text x="94" y="94" fill="#94a3b8" fontSize="9">cis: same side</text>
      </svg>
      <p className="text-[11px] text-gray-400 mt-2">E/Z uses CIP priority: higher-priority groups same side = Z, opposite side = E.</p>
    </div>
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">Optical isomerism</p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        <line x1="110" y1="15" x2="110" y2="105" stroke="#64748b" strokeDasharray="4 4" />
        {[58, 162].map((cx, i) => (
          <g key={cx}>
            <circle cx={cx} cy="60" r="10" fill="#38bdf8" />
            <line x1={cx} y1="60" x2={cx - (i ? -24 : 24)} y2="32" stroke="#e2e8f0" strokeWidth="2" />
            <line x1={cx} y1="60" x2={cx + (i ? -24 : 24)} y2="88" stroke="#e2e8f0" strokeWidth="2" />
            <text x={cx - 42} y="30" fill="#a5f3fc" fontSize="8">A</text><text x={cx + 34} y="92" fill="#f0abfc" fontSize="8">B</text>
          </g>
        ))}
        <text x="64" y="112" textAnchor="middle" fill="#94a3b8" fontSize="8">enantiomers</text>
        <text x="162" y="112" textAnchor="middle" fill="#94a3b8" fontSize="8">mirror image</text>
      </svg>
      <p className="text-[11px] text-gray-400 mt-2">Diastereomers are stereoisomers that are not mirror images; meso forms are achiral due to internal symmetry.</p>
    </div>
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">Conformational: Newman projections</p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        {[58, 162].map((cx, i) => (
          <g key={cx}>
            <circle cx={cx} cy="60" r="18" fill="none" stroke="#38bdf8" strokeWidth="2" />
            {[270, 30, 150].map((deg, j) => {
              const rad = (deg + (i ? 0 : 60)) * Math.PI / 180;
              return <line key={j} x1={cx} y1="60" x2={cx + Math.cos(rad) * 34} y2={60 + Math.sin(rad) * 34} stroke="#e2e8f0" strokeWidth="2" />;
            })}
            <circle cx={cx} cy="60" r="4" fill="#fbbf24" />
            <text x={cx} y="110" textAnchor="middle" fill="#94a3b8" fontSize="8">{i ? 'eclipsed' : 'staggered'}</text>
          </g>
        ))}
      </svg>
    </div>
  </div>
);

const reactivityMetals = [
  { symbol: 'K', name: 'Potassium', rank: 14, color: '#ef4444' },
  { symbol: 'Na', name: 'Sodium', rank: 13, color: '#f97316' },
  { symbol: 'Ca', name: 'Calcium', rank: 12, color: '#f59e0b' },
  { symbol: 'Mg', name: 'Magnesium', rank: 11, color: '#eab308' },
  { symbol: 'Al', name: 'Aluminium', rank: 10, color: '#84cc16' },
  { symbol: 'Zn', name: 'Zinc', rank: 9, color: '#22c55e' },
  { symbol: 'Fe', name: 'Iron', rank: 8, color: '#10b981' },
  { symbol: 'Ni', name: 'Nickel', rank: 7, color: '#14b8a6' },
  { symbol: 'Sn', name: 'Tin', rank: 6, color: '#06b6d4' },
  { symbol: 'Pb', name: 'Lead', rank: 5, color: '#3b82f6' },
  { symbol: 'H', name: 'Hydrogen', rank: 4, color: '#6366f1' },
  { symbol: 'Cu', name: 'Copper', rank: 3, color: '#8b5cf6' },
  { symbol: 'Ag', name: 'Silver', rank: 2, color: '#a855f7' },
  { symbol: 'Au', name: 'Gold', rank: 1, color: '#ec4899' },
];

const saltSolutions = [
  { metal: 'Zn', salt: 'ZnSO4', color: '#bfdbfe' },
  { metal: 'Fe', salt: 'FeSO4', color: '#bbf7d0' },
  { metal: 'Cu', salt: 'CuSO4', color: '#38bdf8' },
  { metal: 'Ag', salt: 'AgNO3', color: '#e5e7eb' },
  { metal: 'Pb', salt: 'Pb(NO3)2', color: '#fef3c7' },
];

const reactionMediumNotes = {
  water: 'K, Na, and Ca react with cold water to form hydroxides and hydrogen gas; Mg reacts slowly with hot water/steam.',
  acid: 'Metals above hydrogen displace H2 from dilute acids.',
  hcl: 'Dilute HCl reacts with metals above hydrogen to form metal chlorides and H2.',
};

const quantumOrbitalLetters = ['s', 'p', 'd', 'f'];
const PLANCK = 6.626e-34;
const ELECTRON_VOLT = 1.602e-19;
const GAS_R = 8.314;

const gibbsSignTable = [
  { h: '-', s: '+', when: 'Spontaneous at all temperatures', note: 'Exothermic and entropy increases.' },
  { h: '-', s: '-', when: 'Spontaneous at low temperature', note: 'Heat release wins when T is small.' },
  { h: '+', s: '+', when: 'Spontaneous at high temperature', note: 'Entropy term wins when T is large.' },
  { h: '+', s: '-', when: 'Non-spontaneous at all temperatures', note: 'Endothermic and entropy decreases.' },
];

const GibbsPlot = ({ dH, dS, temp }) => {
  const points = Array.from({ length: 12 }, (_, i) => {
    const t = 200 + i * (1300 / 11);
    const g = dH - t * (dS / 1000);
    return { t, g };
  });
  const minG = Math.min(...points.map(p => p.g), 0);
  const maxG = Math.max(...points.map(p => p.g), 0);
  const span = Math.max(1, maxG - minG);
  const line = points.map(p => {
    const x = 24 + ((p.t - 200) / 1300) * 212;
    const y = 116 - ((p.g - minG) / span) * 86;
    return `${x},${y}`;
  }).join(' ');
  const zeroY = 116 - ((0 - minG) / span) * 86;
  const tempX = 24 + ((temp - 200) / 1300) * 212;
  return (
    <svg viewBox="0 0 260 140" className="w-full h-56 rounded-xl bg-black/20 border border-white/10">
      <line x1="24" y1="116" x2="240" y2="116" stroke="#475569" />
      <line x1="24" y1="24" x2="24" y2="116" stroke="#475569" />
      <line x1="24" y1={zeroY} x2="240" y2={zeroY} stroke="#f59e0b" strokeDasharray="4 4" />
      <polyline points={line} fill="none" stroke="#38bdf8" strokeWidth="3" />
      <line x1={tempX} y1="24" x2={tempX} y2="116" stroke="#a78bfa" strokeWidth="2" />
      <text x="26" y="18" fill="#94a3b8" fontSize="8">Delta G</text>
      <text x="202" y="132" fill="#94a3b8" fontSize="8">T (K)</text>
      <text x={Math.min(205, tempX + 4)} y="36" fill="#c4b5fd" fontSize="8">{temp} K</text>
    </svg>
  );
};

const AtmosphereSketch = () => (
  <svg viewBox="0 0 260 150" className="w-full h-48 rounded-xl bg-black/20 border border-white/10">
    {[
      ['Troposphere', 105, '#22c55e', 'weather, dust, water vapor'],
      ['Stratosphere', 70, '#38bdf8', 'ozone layer'],
      ['Mesosphere', 38, '#818cf8', 'meteors burn'],
      ['Thermosphere', 14, '#f472b6', 'ionosphere'],
    ].map(([label, y, color, note]) => (
      <g key={label}>
        <rect x="22" y={y} width="216" height="28" rx="6" fill={color} opacity="0.18" stroke={color} />
        <text x="34" y={y + 12} fill="#f8fafc" fontSize="9" fontWeight="700">{label}</text>
        <text x="34" y={y + 23} fill="#cbd5e1" fontSize="7">{note}</text>
      </g>
    ))}
  </svg>
);

const cftGeometryData = {
  Octahedral: {
    levels: [{ label: 't2g', count: 3, energy: -0.4 }, { label: 'eg', count: 2, energy: 0.6 }],
    note: 't2g lower, eg upper; gap is Delta o.',
  },
  Tetrahedral: {
    levels: [{ label: 'e', count: 2, energy: -0.6 }, { label: 't2', count: 3, energy: 0.4 }],
    note: 'e lower, t2 upper; Delta t is about 4/9 Delta o.',
  },
  'Square Planar': {
    levels: [{ label: 'dxy', count: 1, energy: -0.6 }, { label: 'dz2', count: 1, energy: -0.2 }, { label: 'dxz, dyz', count: 2, energy: 0.2 }, { label: 'dx2-y2', count: 1, energy: 1.0 }],
    note: 'Square planar splitting places dx2-y2 highest.',
  },
};

const fillCftLevels = (geometry, electrons, field) => {
  const data = cftGeometryData[geometry];
  const boxes = data.levels.flatMap(level => Array.from({ length: level.count }, (_, index) => ({ ...level, id: `${level.label}-${index}`, electrons: 0 })));
  const ordered = boxes.map((box, index) => index);
  const addSingle = (indices) => {
    for (const index of indices) {
      if (electrons <= 0) return;
      if (boxes[index].electrons === 0) {
        boxes[index].electrons = 1;
        electrons -= 1;
      }
    }
  };
  const addPairs = (indices) => {
    for (const index of indices) {
      if (electrons <= 0) return;
      if (boxes[index].electrons === 1) {
        boxes[index].electrons = 2;
        electrons -= 1;
      }
    }
  };
  if (field === 'weak' && geometry === 'Octahedral') {
    addSingle(ordered);
    addPairs(ordered);
  } else {
    data.levels.forEach(level => {
      const indices = ordered.filter(index => boxes[index].label === level.label);
      addSingle(indices);
      addPairs(indices);
    });
  }
  const unpaired = boxes.filter(box => box.electrons === 1).length;
  const cfse = boxes.reduce((sum, box) => sum + box.electrons * box.energy, 0);
  const pairs = boxes.filter(box => box.electrons === 2).length;
  return { boxes, unpaired, cfse, pairs };
};

const CftDiagram = ({ geometry, filled }) => {
  const data = cftGeometryData[geometry];
  return (
    <svg viewBox="0 0 300 190" className="w-full h-64 rounded-xl bg-black/20 border border-white/10">
      <line x1="30" y1="160" x2="30" y2="25" stroke="#64748b" />
      <text x="12" y="30" fill="#94a3b8" fontSize="8" transform="rotate(-90 12 30)">energy</text>
      {data.levels.map((level, levelIndex) => {
        const y = 135 - ((level.energy + 0.8) / 2) * 90;
        const levelBoxes = filled.boxes.filter(box => box.label === level.label);
        return (
          <g key={level.label}>
            <text x="48" y={y + 4} fill="#cbd5e1" fontSize="10">{level.label}</text>
            {levelBoxes.map((box, index) => (
              <g key={box.id}>
                <line x1={95 + index * 35} y1={y} x2={122 + index * 35} y2={y} stroke={levelIndex ? '#f472b6' : '#38bdf8'} strokeWidth="3" />
                {box.electrons >= 1 && <text x={99 + index * 35} y={y - 5} fill="#f8fafc" fontSize="14">up</text>}
                {box.electrons === 2 && <text x={111 + index * 35} y={y - 5} fill="#f8fafc" fontSize="14">dn</text>}
              </g>
            ))}
          </g>
        );
      })}
      <path d="M248 70 V125" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arrow)" markerStart="url(#arrow)" />
      <text x="254" y="100" fill="#fde68a" fontSize="9">{geometry === 'Tetrahedral' ? 'Delta t' : 'Delta o'}</text>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#fbbf24" />
        </marker>
      </defs>
    </svg>
  );
};

const metallurgyData = {
  Al: [
    { title: 'Ore', detail: 'Bauxite: Al2O3.xH2O', equation: 'Al ore with Fe2O3 and SiO2 impurities', purpose: 'Source of aluminium.' },
    { title: 'Crushing', detail: 'Powdered bauxite', equation: 'Mechanical size reduction', purpose: 'Increase surface area.' },
    { title: 'Bayer leaching', detail: 'Hot concentrated NaOH', equation: 'Al2O3 + 2NaOH + 3H2O -> 2Na[Al(OH)4]', purpose: 'Dissolve alumina selectively.' },
    { title: 'Hall-Heroult', detail: 'Electrolysis of alumina in molten cryolite', equation: '2Al2O3 + 3C -> 4Al + 3CO2', purpose: 'Reduce Al3+ to Al.' },
    { title: 'Refining', detail: 'Electrolytic refining when high purity is needed', equation: 'Al3+ + 3e- -> Al', purpose: 'Improve purity.' },
  ],
  Fe: [
    { title: 'Ore', detail: 'Haematite: Fe2O3', equation: 'Fe2O3 with gangue', purpose: 'Iron source.' },
    { title: 'Concentration', detail: 'Gravity/magnetic separation', equation: 'Remove lighter gangue', purpose: 'Enrich ore.' },
    { title: 'Blast furnace zones', detail: 'Hot air, coke, limestone', equation: 'C + O2 -> CO2; C + CO2 -> 2CO', purpose: 'Generate reducing CO.' },
    { title: 'Reduction', detail: 'Upper/middle furnace', equation: 'Fe2O3 + 3CO -> 2Fe + 3CO2', purpose: 'Reduce oxide to iron.' },
    { title: 'Slag formation', detail: 'Limestone flux', equation: 'CaCO3 -> CaO + CO2; CaO + SiO2 -> CaSiO3', purpose: 'Remove silica impurity.' },
  ],
  Cu: [
    { title: 'Ore', detail: 'Copper pyrites / sulphide ore', equation: 'CuFeS2 or Cu2S', purpose: 'Copper source.' },
    { title: 'Froth flotation', detail: 'Sulphide ore concentration', equation: 'Pine oil froth carries sulphide particles', purpose: 'Separate sulphide from gangue.' },
    { title: 'Roasting', detail: 'Partial oxidation', equation: '2Cu2S + 3O2 -> 2Cu2O + 2SO2', purpose: 'Convert sulphide partly to oxide.' },
    { title: 'Bessemerisation', detail: 'Self-reduction', equation: '2Cu2O + Cu2S -> 6Cu + SO2', purpose: 'Produce blister copper.' },
    { title: 'Refining', detail: 'Electrolytic refining', equation: 'Cu2+ + 2e- -> Cu', purpose: 'Get pure copper.' },
  ],
  Zn: [
    { title: 'Ore', detail: 'Zinc blende: ZnS', equation: 'ZnS ore', purpose: 'Zinc source.' },
    { title: 'Froth flotation', detail: 'Concentrates sulphide ore', equation: 'Sulphide particles attach to froth', purpose: 'Remove gangue.' },
    { title: 'Roasting', detail: 'Convert sulphide to oxide', equation: '2ZnS + 3O2 -> 2ZnO + 2SO2', purpose: 'Make reducible oxide.' },
    { title: 'Reduction', detail: 'Coke, high temperature', equation: 'ZnO + C -> Zn + CO', purpose: 'Obtain zinc vapour.' },
    { title: 'Refining', detail: 'Distillation/electrolytic refining', equation: 'Condense Zn vapour', purpose: 'Purify zinc.' },
  ],
  Pb: [
    { title: 'Ore', detail: 'Galena: PbS', equation: 'PbS ore', purpose: 'Lead source.' },
    { title: 'Froth flotation', detail: 'Sulphide concentration', equation: 'Froth carries PbS', purpose: 'Enrich ore.' },
    { title: 'Roasting', detail: 'PbS partly oxidized', equation: '2PbS + 3O2 -> 2PbO + 2SO2', purpose: 'Make oxide/sulphate mix.' },
    { title: 'Self-reduction', detail: 'Smelting', equation: 'PbS + 2PbO -> 3Pb + SO2', purpose: 'Produce lead.' },
    { title: 'Refining', detail: 'Electrolytic refining', equation: 'Pb2+ + 2e- -> Pb', purpose: 'Remove impurities.' },
  ],
  Na: [
    { title: 'Ore', detail: 'Fused NaCl', equation: 'Downs cell feed', purpose: 'Sodium source.' },
    { title: 'Drying', detail: 'Remove moisture', equation: 'Avoid water reduction', purpose: 'Prevent side reactions.' },
    { title: 'Electrolysis', detail: 'Downs process', equation: '2NaCl(l) -> 2Na + Cl2', purpose: 'Extract highly reactive sodium.' },
    { title: 'Collection', detail: 'Na and Cl2 kept separate', equation: 'Na forms at cathode', purpose: 'Avoid recombination.' },
    { title: 'Storage', detail: 'Store under kerosene', equation: 'Na reacts with air/water', purpose: 'Protect metal.' },
  ],
  Mg: [
    { title: 'Ore', detail: 'Carnallite / magnesite / sea water', equation: 'MgCl2 prepared', purpose: 'Magnesium source.' },
    { title: 'Concentration', detail: 'Convert to anhydrous MgCl2', equation: 'MgCl2.xH2O -> MgCl2', purpose: 'Prepare electrolyte.' },
    { title: 'Electrolysis', detail: 'Molten MgCl2', equation: 'MgCl2(l) -> Mg + Cl2', purpose: 'Reduce Mg2+.' },
    { title: 'Refining', detail: 'Distillation under inert atmosphere', equation: 'Physical purification', purpose: 'Remove volatile impurities.' },
    { title: 'Special methods', detail: 'Pidgeon process also used', equation: '2MgO + Si -> 2Mg + SiO2', purpose: 'Thermal reduction route.' },
  ],
};

const saltAnalysisGroups = [
  ['Group I (dilute HCl)', 'Pb2+, Ag+, Hg2 2+', 'White/yellow chloride precipitates'],
  ['Group II (H2S in HCl)', 'Cu2+, Pb2+, As3+', 'Colored sulphide precipitates'],
  ['Group III (NH4OH + NH4Cl)', 'Fe3+, Al3+, Cr3+', 'Hydroxide precipitates'],
  ['Group IV (H2S in NH4OH)', 'Ni2+, Co2+, Mn2+, Zn2+', 'Sulphide precipitates in basic medium'],
  ['Group V ((NH4)2CO3)', 'Ba2+, Sr2+, Ca2+', 'Carbonate precipitates'],
  ['Group VI (no group reagent)', 'Mg2+, Na+, K+, NH4+', 'Special confirmatory tests'],
];

const anionTests = [
  ['CO3 2-', 'Dilute HCl', 'CO2 effervescence; lime water turns milky'],
  ['SO4 2-', 'BaCl2 after acidifying', 'White BaSO4 precipitate'],
  ['Cl-', 'AgNO3', 'White curdy AgCl precipitate'],
  ['Br-', 'AgNO3', 'Pale yellow AgBr precipitate'],
  ['I-', 'AgNO3 / starch-iodine', 'Yellow AgI; blue starch-iodine complex'],
  ['NO3-', 'Brown ring test', 'Brown ring at junction'],
  ['PO4 3-', 'Ammonium molybdate', 'Canary yellow precipitate'],
  ['S2-', 'Lead acetate paper', 'Black PbS stain'],
];

const saltSamples = {
  NaCl: ['Flame test: intense yellow confirms Na+.', 'Add dilute HNO3, then AgNO3: white curdy ppt of AgCl.', 'Confirm AgCl dissolves in NH4OH.'],
  CuSO4: ['Blue solution suggests Cu2+.', 'Pass H2S in acidic medium: black CuS ppt.', 'Add BaCl2 after acidifying: white BaSO4 confirms sulphate.'],
  NH4NO3: ['Warm with NaOH: ammonia smell; moist red litmus turns blue.', 'Brown ring test confirms nitrate.', 'No permanent flame color expected.'],
  BaCO3: ['Dilute HCl gives brisk CO2; lime water turns milky.', 'Ba2+ gives apple green flame.', 'Add (NH4)2CO3 in group V gives white carbonate ppt.'],
};

const flameReference = [
  ['Na', 'yellow'], ['K', 'lilac'], ['Ca', 'brick red'], ['Ba', 'apple green'], ['Cu', 'blue-green'], ['Sr', 'crimson'],
];

const pBlockData = {
  'Group 15': [
    ['Oxyacids of nitrogen', 'HNO2 is nitrous acid; HNO3 is nitric acid with N in +5 oxidation state and strong oxidizing behavior.'],
    ['Oxyacids of phosphorus', 'H3PO4 basicity 3; H3PO3 basicity 2 and reducing due to P-H bond; H4P2O7 is pyrophosphoric acid.'],
    ['Allotropes of phosphorus', 'White P4 is reactive and poisonous; red phosphorus is polymeric and safer; black phosphorus is layered and most stable.'],
  ],
  'Group 16': [
    ['Allotropes of sulphur', 'Rhombic sulphur is stable at room temperature; monoclinic above 369 K; plastic sulphur is chain-like.'],
    ['Oxyacids of sulphur', 'H2SO4, H2SO3, H2S2O3, and H2S2O7 (oleum) differ in S oxidation state and S-S/peroxo-like linkages.'],
    ['SO3 and H2SO4 behavior', 'SO3 is trigonal planar. Concentrated H2SO4 acts as dehydrating and oxidizing agent; dilute acid mainly acidifies.'],
  ],
  'Group 17': [
    ['Interhalogens', "Types XX', XX'3, XX'5, XX'7 form when a larger halogen combines with smaller, more electronegative halogens."],
    ['Oxoacids of chlorine', 'Acid strength increases as HOCl < HClO2 < HClO3 < HClO4 due to stronger -I effect and resonance stabilization.'],
    ['Fluorine anomaly', 'Fluorine has no positive oxidation state because it is the most electronegative element and lacks d orbitals.'],
  ],
  'Group 18': [
    ['XeF2', 'Linear, AX2E3 by VSEPR.'],
    ['XeF4', 'Square planar, AX4E2 with lone pairs opposite.'],
    ['XeF6 and XeO3', 'XeF6 is distorted octahedral due to one lone pair; XeO3 is pyramidal and explosive when dry.'],
  ],
};

const pharmaMedicalReference = {
  'drug-functional-groups': {
    result: 'High-yield drug motifs: acids, bases, amides, esters, alcohols, aromatics, and halogens.',
    columns: ['Group', 'Pharma meaning', 'Medical example'],
    rows: [
      ['Carboxylic acid', 'Often acidic and ionized at blood pH; improves salt formation and water solubility.', 'NSAIDs, amino acids, bile acids'],
      ['Amine', 'Often basic; changes membrane crossing, receptor binding, and salt formation.', 'Antihistamines, local anesthetics'],
      ['Amide', 'Stable polar linkage; common in peptides and many drug scaffolds.', 'Paracetamol, penicillins'],
      ['Ester', 'Can act as a prodrug or be hydrolyzed by esterases.', 'Aspirin, ester local anesthetics'],
      ['Aromatic ring', 'Adds shape, pi interactions, and hydrophobic binding.', 'Many analgesic and antimicrobial drugs'],
      ['Halogen', 'Can tune lipophilicity, metabolic stability, and binding.', 'Fluorinated steroids and antibiotics'],
    ],
  },
  'adme-ionization': {
    result: 'ADME links structure to absorption, distribution, metabolism, and excretion.',
    columns: ['Concept', 'Chemistry rule', 'Pharma impact'],
    rows: [
      ['pH versus pKa', 'Weak acids ionize when pH is above pKa; weak bases ionize when pH is below pKa.', 'Charge changes solubility and membrane crossing.'],
      ['Lipophilicity', 'Nonpolar surfaces favor membranes; polar groups favor water.', 'Too lipophilic can reduce solubility; too polar can reduce absorption.'],
      ['Hydrogen bonding', 'Donors and acceptors improve binding and water interaction.', 'Excess hydrogen bonding may lower permeability.'],
      ['Metabolism', 'Oxidation, reduction, hydrolysis, and conjugation alter functional groups.', 'Can activate prodrugs or clear active drugs.'],
      ['Excretion', 'Ionized and polar compounds are cleared more easily in urine or bile.', 'pH can influence renal trapping for weak acids/bases.'],
    ],
  },
  isotonicity: {
    result: 'Isotonic preparations are designed to avoid strong water movement across cell membranes.',
    columns: ['Term', 'Chemistry meaning', 'Medical relevance'],
    rows: [
      ['Hypotonic', 'Lower effective solute concentration than body fluid.', 'Cells can swell as water enters.'],
      ['Isotonic', 'Similar osmotic pressure to body fluid.', 'Preferred for many IV and ophthalmic solutions.'],
      ['Hypertonic', 'Higher effective solute concentration than body fluid.', 'Cells can shrink as water leaves.'],
      ['Osmotic pressure', 'Pi = iMRT for dilute solutions.', 'Connects concentration to membrane water flow.'],
      ['Normal saline', '0.9 percent NaCl is close to physiological tonicity.', 'Common fluid for clinical use.'],
    ],
  },
  'clinical-buffers': {
    result: 'Clinical buffer chemistry keeps body fluids near functional pH ranges.',
    columns: ['Buffer system', 'Chemistry role', 'Medical connection'],
    rows: [
      ['Bicarbonate', 'H2CO3/HCO3- pair responds to CO2 and acid load.', 'Major blood buffer linked to respiration.'],
      ['Phosphate', 'H2PO4-/HPO4^2- pair buffers near intracellular and renal pH.', 'Important in cells and urine.'],
      ['Proteins', 'Ionizable amino acid side chains accept or donate protons.', 'Hemoglobin contributes to blood buffering.'],
      ['Acidosis', 'Blood pH falls below normal range.', 'Can reflect metabolic or respiratory imbalance.'],
      ['Alkalosis', 'Blood pH rises above normal range.', 'Can reflect CO2 loss or metabolic disturbance.'],
    ],
  },
  'pharma-analysis': {
    result: 'Pharmaceutical QC proves identity, strength, purity, and performance.',
    columns: ['Method', 'What it checks', 'Typical use'],
    rows: [
      ['Titration assay', 'Amount of acid, base, oxidant, reductant, or complexing ion.', 'Aspirin, antacids, iodine, peroxide assays'],
      ['Chromatography', 'Separation and quantification of active ingredient and impurities.', 'HPLC purity and content uniformity'],
      ['Spectroscopy', 'Identity and concentration from light absorption or emission.', 'UV-visible assay, IR identity check'],
      ['Dissolution testing', 'How quickly a dosage form releases drug.', 'Tablet and capsule performance'],
      ['Limit tests', 'Trace impurity control.', 'Heavy metals, chloride, sulfate, residual impurities'],
    ],
  },
  radiopharma: {
    result: 'Radiopharmaceutical design balances half-life, emission, targeting, and safe clearance.',
    columns: ['Isotope', 'Main use', 'Chemistry reason'],
    rows: [
      ['Tc-99m', 'SPECT imaging tracer.', 'Gamma emission and short half-life suit diagnostics.'],
      ['F-18', 'PET imaging tracer.', 'Small fluorine label fits biomolecules such as glucose analogs.'],
      ['I-131', 'Thyroid imaging and therapy.', 'Iodide targets thyroid tissue; beta and gamma emissions are useful clinically.'],
      ['Co-60', 'Radiotherapy source.', 'Strong gamma emission for external beam treatment.'],
      ['Lu-177', 'Targeted radionuclide therapy.', 'Beta emission plus ligand targeting for selected tumors.'],
    ],
  },
  'enzyme-kinetics': {
    result: 'Enzyme rate rises with substrate, then approaches Vmax; inhibitors reshape the curve.',
    columns: ['Control', 'Visual signal', 'Lab connection'],
    rows: [
      ['Substrate', 'More substrate fills more active sites until saturation.', 'Michaelis-Menten kinetics'],
      ['Competitive inhibitor', 'Competes at active site; apparent Km increases.', 'Drug-enzyme competition'],
      ['Noncompetitive inhibitor', 'Lowers active enzyme fraction; Vmax falls.', 'Allosteric inhibition'],
      ['Temperature', 'Moderate heat speeds collisions; high heat denatures protein.', 'Fever, sterilization, assays'],
      ['pH', 'Ionization changes active-site binding.', 'Pepsin, trypsin, clinical enzymes'],
    ],
  },
  'amino-acid-pi': {
    result: 'Amino acids shift charge with pH: cationic below pI, zwitterionic near pI, anionic above pI.',
    columns: ['pH region', 'Dominant form', 'Visualization cue'],
    rows: [
      ['Low pH', 'NH3+ and COOH; net positive.', 'Migrates toward cathode'],
      ['Near pI', 'NH3+ and COO-; net zero.', 'Lowest solubility in electric field'],
      ['High pH', 'NH2 and COO-; net negative.', 'Migrates toward anode'],
      ['Peptide bond', 'COOH plus NH2 condense to amide linkage.', 'Protein backbone formation'],
      ['Side chain', 'Acidic/basic/polar/nonpolar groups tune behavior.', 'Protein folding and binding'],
    ],
  },
  'protein-structure': {
    result: 'Protein behavior depends on primary sequence, folding forces, and denaturation conditions.',
    columns: ['Level', 'Visual structure', 'Lab/medical link'],
    rows: [
      ['Primary', 'Amino acid chain order.', 'Mutation changes sequence'],
      ['Secondary', 'Alpha helix and beta sheet hydrogen bonding.', 'Keratin, silk, enzymes'],
      ['Tertiary', 'Hydrophobic packing, ionic links, disulfides.', 'Enzyme active sites'],
      ['Quaternary', 'Multiple subunits assemble.', 'Hemoglobin tetramer'],
      ['Denaturation', 'Heat, pH, solvents disrupt folding.', 'Fever, sterilization, protein tests'],
    ],
  },
  'carbohydrate-lab': {
    result: 'Carbohydrates cycle between open-chain and ring forms; reducing sugars give diagnostic color changes.',
    columns: ['Sugar idea', 'Visual cue', 'Test/lab link'],
    rows: [
      ['Glucose ring', 'Six-membered ring with many OH groups.', 'High water solubility'],
      ['Fructose', 'Ketose that can isomerize under test conditions.', 'Positive reducing sugar tests'],
      ['Sucrose', 'Nonreducing disaccharide linkage.', 'No free anomeric carbon'],
      ['Starch', 'Coiled glucose polymer.', 'Blue-black iodine complex'],
      ['Cellulose', 'Straight beta-glucose polymer.', 'Fiber and plant cell walls'],
    ],
  },
  'lipid-membrane': {
    result: 'Lipids self-assemble: polar heads face water and nonpolar tails hide inside membranes or micelles.',
    columns: ['Structure', 'Visual assembly', 'Medical/pharma link'],
    rows: [
      ['Fatty acid', 'Long nonpolar tail plus polar acid head.', 'Energy storage and soaps'],
      ['Triglyceride', 'Three fatty acids esterified to glycerol.', 'Fats, oils, digestion'],
      ['Phospholipid', 'Two tails plus phosphate head.', 'Cell membrane bilayer'],
      ['Micelle', 'Tails inward, heads outward.', 'Soap, bile salts, drug solubilization'],
      ['Emulsion', 'Dispersed oil droplets stabilized by surfactant.', 'Creams, suspensions, lipid formulations'],
    ],
  },
  'nucleic-acid-lab': {
    result: 'DNA/RNA recognition uses base pairing, hydrogen bonding, sugar chemistry, and phosphate charge.',
    columns: ['Unit', 'Visual cue', 'Bio/medical link'],
    rows: [
      ['Nucleotide', 'Base plus sugar plus phosphate.', 'DNA/RNA monomer'],
      ['A-T/U pair', 'Two hydrogen bonds.', 'Genetic coding'],
      ['G-C pair', 'Three hydrogen bonds.', 'Higher thermal stability'],
      ['Backbone', 'Charged phosphate-sugar chain.', 'Electrophoresis migration'],
      ['RNA difference', 'Ribose OH and uracil.', 'mRNA, tRNA, ribozymes'],
    ],
  },
  'vitamin-coenzyme-map': {
    result: 'Vitamins and minerals often work as coenzymes, redox carriers, cofactors, or structural ions.',
    columns: ['Nutrient', 'Chemical role', 'Medical connection'],
    rows: [
      ['B vitamins', 'Coenzyme fragments for metabolism.', 'Energy pathways, anemia links'],
      ['Vitamin C', 'Redox antioxidant and collagen support.', 'Scurvy, wound healing'],
      ['Vitamin D/Ca', 'Calcium-phosphate regulation.', 'Bone chemistry'],
      ['Iron', 'Redox metal in heme.', 'Oxygen transport, anemia'],
      ['Zinc/Mg', 'Enzyme cofactors and Lewis acid centers.', 'Immunity, ATP enzymes'],
    ],
  },
  'metabolism-atp': {
    result: 'Metabolism moves carbon, nitrogen, electrons, and phosphate energy through linked pathways.',
    columns: ['Pathway board', 'Chemical transformation', 'Medical link'],
    rows: [
      ['Glycolysis', 'Glucose fragments into pyruvate with ATP/NADH production.', 'Blood glucose and energy'],
      ['Citric acid cycle', 'Acetyl carbon oxidized to CO2.', 'Central metabolism'],
      ['ATP hydrolysis', 'Phosphate transfer powers unfavorable steps.', 'Bioenergetics'],
      ['Urea cycle', 'Excess nitrogen converted to urea.', 'Liver and kidney chemistry'],
      ['Oxidative phosphorylation', 'Proton gradient drives ATP synthase.', 'Mitochondrial function'],
    ],
  },
  'drug-class-studio': {
    result: 'Drug classes can be compared by target, functional group pattern, and chemical handling.',
    columns: ['Class', 'Core chemistry', 'Visual lab anchor'],
    rows: [
      ['Analgesics', 'Aromatics, amides, acids, phenols.', 'Pain/fever medicine motifs'],
      ['Antacids', 'Weak bases neutralize gastric acid.', 'Neutralization and buffers'],
      ['Antimicrobials', 'Heterocycles, beta-lactams, sulfonamides, quinolones.', 'Selective toxicity'],
      ['Antihistamines', 'Basic amines plus aromatic groups.', 'Receptor-binding shape'],
      ['Local anesthetics', 'Aromatic-lipophilic group, linker, amine.', 'Ionization controls onset'],
    ],
  },
  'drug-metabolism-lab': {
    result: 'Drug metabolism changes polarity through phase I functionalization and phase II conjugation.',
    columns: ['Metabolic step', 'Chemical change', 'Pharma consequence'],
    rows: [
      ['Oxidation', 'Adds or exposes OH, C=O, N-oxide, or epoxide.', 'Often CYP-mediated'],
      ['Reduction', 'Reduces nitro, azo, carbonyl, or disulfide groups.', 'Low oxygen tissues, gut flora'],
      ['Hydrolysis', 'Breaks esters, amides, lactams.', 'Prodrug activation or clearance'],
      ['Glucuronidation', 'Adds glucuronic acid.', 'Increases water solubility'],
      ['Sulfation/acetylation', 'Conjugates polar or amine groups.', 'Clearance and genetic variation'],
    ],
  },
  'dosage-form-lab': {
    result: 'Dosage forms are chemical delivery systems: solution, suspension, emulsion, tablet, capsule, or syrup.',
    columns: ['Form', 'Visual behavior', 'Chemistry control'],
    rows: [
      ['Solution', 'Clear single phase.', 'Solubility, pH, preservative'],
      ['Suspension', 'Solid particles dispersed in liquid.', 'Wetting, viscosity, sedimentation'],
      ['Emulsion', 'Oil and water droplets stabilized.', 'Surfactant and droplet size'],
      ['Tablet', 'Compressed powder matrix.', 'Binder, disintegrant, dissolution'],
      ['Syrup', 'Concentrated sugar solution.', 'Osmotic preservation and taste masking'],
    ],
  },
  'antacid-analgesic-antimicrobial': {
    result: 'Common medicine groups connect directly to acid-base, organic, and microbial chemistry.',
    columns: ['Medicine group', 'Main chemistry', 'Lab visualization'],
    rows: [
      ['Antacid', 'Carbonates/hydroxides neutralize HCl.', 'CO2 bubbles or pH rise'],
      ['Aspirin-like analgesic', 'Aromatic acid/ester chemistry.', 'Hydrolysis and titration'],
      ['Paracetamol-like analgesic', 'Phenol plus amide motif.', 'Functional group map'],
      ['Sulfa drugs', 'Sulfonamide mimicry.', 'Competitive biochemical blocking'],
      ['Disinfectants', 'Oxidants or membrane disruptors.', 'Protein/lipid damage'],
    ],
  },
  'pharma-buffer-lab': {
    result: 'Pharmaceutical buffers choose pH for stability, comfort, solubility, and compatibility.',
    columns: ['Buffer decision', 'Chemistry control', 'Formulation link'],
    rows: [
      ['Target pH', 'Close to pKa for useful buffer capacity.', 'Eye drops, injections, oral liquids'],
      ['Capacity', 'More conjugate pair resists pH change.', 'Shelf stability'],
      ['Compatibility', 'Avoid precipitation or degradation.', 'Drug salt and excipients'],
      ['Comfort', 'Physiological pH reduces irritation.', 'Ophthalmic and injectable products'],
      ['Preservation', 'pH affects microbial growth and preservative ionization.', 'Multi-dose containers'],
    ],
  },
  'electrolyte-panel': {
    result: 'Clinical electrolyte panels visualize charged ions that control nerves, heart rhythm, water balance, and bone.',
    columns: ['Ion', 'Chemical role', 'Clinical signal'],
    rows: [
      ['Na+', 'Major extracellular cation.', 'Water balance and osmolarity'],
      ['K+', 'Major intracellular cation.', 'Nerve and heart excitability'],
      ['Ca2+', 'Bone mineral, signaling, clotting.', 'Tetany, bone, cardiac effects'],
      ['Mg2+', 'ATP enzyme cofactor.', 'Neuromuscular and enzyme function'],
      ['Cl-/HCO3-', 'Charge balance and acid-base control.', 'Blood gas and metabolic balance'],
    ],
  },
  'hemoglobin-oxygen': {
    result: 'Hemoglobin binds oxygen cooperatively; pH, CO2, CO, and 2,3-BPG shift oxygen release.',
    columns: ['Factor', 'Curve effect', 'Medical chemistry link'],
    rows: [
      ['O2 pressure', 'Higher pressure loads heme sites.', 'Lungs versus tissues'],
      ['Cooperativity', 'One O2 increases affinity for the next.', 'Sigmoid binding curve'],
      ['Low pH/CO2', 'Right shift releases O2 to tissues.', 'Bohr effect'],
      ['Carbon monoxide', 'Binds heme strongly and blocks O2 transport.', 'CO poisoning'],
      ['Iron state', 'Fe2+ binds O2; Fe3+ methemoglobin cannot carry well.', 'Oxidative stress'],
    ],
  },
  'diagnostic-color-tests': {
    result: 'Diagnostic reagent tests convert analyte chemistry into visible color, precipitate, or intensity.',
    columns: ['Analyte', 'Visual test idea', 'Chemistry signal'],
    rows: [
      ['Glucose', 'Oxidase/peroxidase color or reducing test.', 'Redox chemistry'],
      ['Protein', 'Biuret violet complex.', 'Peptide bonds coordinate Cu2+'],
      ['Ketone bodies', 'Nitroprusside purple complex.', 'Diabetes/fasting urine test'],
      ['Bilirubin', 'Diazo color formation.', 'Liver/bile chemistry'],
      ['Chloride', 'AgCl precipitate/titration.', 'Electrolyte and salt analysis'],
    ],
  },
  'clinical-metabolites': {
    result: 'Clinical metabolites are small molecules whose concentration reflects metabolism and organ function.',
    columns: ['Marker', 'Chemical identity', 'Clinical chemistry use'],
    rows: [
      ['Glucose', 'Reducing carbohydrate fuel.', 'Diabetes monitoring'],
      ['Urea', 'Neutral nitrogen waste.', 'Protein metabolism and kidney function'],
      ['Creatinine', 'Creatine breakdown product.', 'Renal filtration estimate'],
      ['Cholesterol', 'Sterol lipid.', 'Membranes, hormones, lipid panel'],
      ['Uric acid', 'Purine oxidation product.', 'Gout and kidney stones'],
    ],
  },
  'toxicology-chelation': {
    result: 'Toxicology connects binding strength, redox chemistry, enzyme poisoning, and chelation.',
    columns: ['Toxin', 'Chemical damage', 'Treatment concept'],
    rows: [
      ['Lead', 'Binds sulfhydryl groups and disrupts heme enzymes.', 'Chelation with suitable ligands'],
      ['Mercury', 'Soft metal binds sulfur-rich proteins.', 'Avoid exposure; chelation in selected cases'],
      ['Cyanide', 'Binds cytochrome oxidase iron.', 'Antidote chemistry redirects or oxidizes target'],
      ['Carbon monoxide', 'Binds hemoglobin Fe2+ strongly.', 'Oxygen therapy shifts binding equilibrium'],
      ['Arsenic', 'Disrupts enzyme thiols and phosphate chemistry.', 'Chelation and exposure control'],
    ],
  },
};

const LAB_EXPERIMENTS = [
  { id: 'titration', title: 'Titration Simulator', tab: 'Solutions', type: 'Simulation', difficulty: 'Beginner', icon: Waves, topic: 'pH', teaches: 'How acid and base neutralize each other.', steps: ['Move the NaOH drops slider.', 'Watch the color and pH change.', 'Find the point where the solution becomes neutral.'], tryThis: 'Set drops near the middle and notice the fast pH jump.', result: 'A sharp pH change marks the equivalence region.', safety: 'Real titrations use goggles and careful handling.', realWorld: 'Used to test medicine, water, and food acidity.' },
  { id: 'electrolysis', title: 'Electrolysis Cell', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: Zap, topic: 'Redox', teaches: 'How electricity drives chemical changes.', steps: ['Choose an electrolyte.', 'Identify cathode and anode products.', 'Compare different solutions.'], tryThis: 'Switch from CuSO4 to NaCl(aq).', result: 'Different ions produce different gases or metals.', safety: 'Electrolysis can produce gases; use ventilation in real labs.', realWorld: 'Used in electroplating and metal extraction.' },
  { id: 'distillation', title: 'Distillation Apparatus', tab: 'Solutions', type: 'Simulation', difficulty: 'Beginner', icon: FlaskConical, topic: 'Separation', teaches: 'How boiling points separate liquids.', steps: ['Increase heat slowly.', 'Watch vapor move to the condenser.', 'Collect the condensed liquid.'], tryThis: 'Raise heat above 78 percent.', result: 'More volatile liquid vaporizes first.', safety: 'Never seal heated glassware.', realWorld: 'Used for purifying solvents and water.' },
  { id: 'chromatography', title: 'Chromatography', tab: 'Solutions', type: 'Simulation', difficulty: 'Beginner', icon: BarChart3, topic: 'Separation', teaches: 'How mixtures split into colored bands.', steps: ['Move the run time slider.', 'Watch colors travel different distances.', 'Compare the final band positions.'], tryThis: 'Run the slider to 100 percent.', result: 'Substances separate because they move at different speeds.', safety: 'Use safe solvents in classroom demos.', realWorld: 'Used in forensics and quality testing.' },
  { id: 'spectroscopy', title: 'Spectroscopy Viewer', tab: 'Atoms', type: 'Visualizer', difficulty: 'Intermediate', icon: RadioTower, topic: 'Light', teaches: 'Each element has a unique light fingerprint.', steps: ['Choose an element.', 'Look at the bright emission lines.', 'Compare line positions.'], tryThis: 'Compare hydrogen and sodium.', result: 'Line positions identify elements.', safety: 'Avoid looking directly into bright discharge lamps.', realWorld: 'Used to study stars and unknown samples.' },
  { id: 'ph-meter', title: 'pH Meter', tab: 'Solutions', type: 'Simulation', difficulty: 'Beginner', icon: Activity, topic: 'Acids', teaches: 'pH tells whether a solution is acidic, neutral, or basic.', steps: ['Choose a solution.', 'Read the pH value.', 'Use the bar to classify it.'], tryThis: 'Compare vinegar, water, and ammonia.', result: 'Low pH is acidic; high pH is basic.', safety: 'Do not taste unknown solutions.', realWorld: 'Used in pools, soil, and drinking water tests.' },
  { id: 'electrochemical-cell', title: 'Electrochemical Cell', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: Zap, topic: 'Cells', teaches: 'How metal pairs create voltage.', steps: ['Pick two metals.', 'Read the voltage.', 'Change one metal and compare.'], tryThis: 'Try Zn and Cu.', result: 'A bigger potential difference gives more voltage.', safety: 'Real cells can leak corrosive electrolytes.', realWorld: 'The idea behind batteries.' },
  { id: 'equilibrium', title: 'Le Chatelier Equilibrium', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: GitCompare, topic: 'Equilibrium', teaches: 'Systems respond to stress by shifting direction.', steps: ['Change reactant level.', 'Change temperature.', 'Read the predicted shift.'], tryThis: 'Increase reactant level above 1.', result: 'Adding reactant often shifts toward products.', safety: 'Equilibrium demos may use irritating gases.', realWorld: 'Important in industrial chemical production.' },
  { id: 'osmosis', title: 'Osmosis Demo', tab: 'Solutions', type: 'Simulation', difficulty: 'Beginner', icon: Waves, topic: 'Membranes', teaches: 'Water moves toward higher solute concentration.', steps: ['Set left concentration.', 'Set right concentration.', 'Observe water flow direction.'], tryThis: 'Make the right side more concentrated.', result: 'Water flows toward the side with more solute.', safety: 'Use clean materials in biology demos.', realWorld: 'Explains cells swelling or shrinking.' },
  { id: 'flame-test', title: 'Flame Test', tab: 'Atoms', type: 'Simulation', difficulty: 'Beginner', icon: Sparkles, topic: 'Emission', teaches: 'Metal ions can color a flame.', steps: ['Choose a metal ion.', 'Observe the flame color.', 'Compare colors.'], tryThis: 'Compare Na and Cu.', result: 'Excited electrons release colored light.', safety: 'Real flame tests require teacher supervision.', realWorld: 'Used for quick ion identification.' },
  { id: 'molar-mass', title: 'Molar Mass Calculator', tab: 'Basics', type: 'Calculator', difficulty: 'Beginner', icon: Calculator, topic: 'Formulas', teaches: 'How formula mass is calculated from atoms.', steps: ['Enter a formula.', 'Read atom counts.', 'Read total molar mass.'], tryThis: 'Try H2O or Ca(OH)2.', result: 'Molar mass is the sum of atomic masses.', realWorld: 'Needed for measuring chemicals accurately.' },
  { id: 'stoichiometry', title: 'Stoichiometry Solver', tab: 'Reactions', type: 'Calculator', difficulty: 'Intermediate', icon: Calculator, topic: 'Moles', teaches: 'Balanced equations connect reactant and product amounts.', steps: ['Enter an equation.', 'Enter starting moles.', 'Use coefficients to reason about amounts.'], tryThis: 'Try N2 + H2 -> NH3.', result: 'Coefficients act like mole ratios.', realWorld: 'Used to plan reactions and reduce waste.' },
  { id: 'dilution', title: 'Molarity / Dilution Calculator', tab: 'Solutions', type: 'Calculator', difficulty: 'Beginner', icon: Calculator, topic: 'Concentration', teaches: 'How dilution changes volume and concentration.', steps: ['Enter C1, V1, and C2.', 'Read the required V2.', 'Compare concentrated vs dilute.'], tryThis: 'Make C2 smaller than C1.', result: 'Diluting lowers concentration and increases volume.', safety: 'Always add acid to water in real prep.', realWorld: 'Used to prepare lab solutions.' },
  { id: 'weak-acid-ph', title: 'pH / pOH Calculator', tab: 'Solutions', type: 'Calculator', difficulty: 'Intermediate', icon: Calculator, topic: 'Acids', teaches: 'How weak acid strength affects pH.', steps: ['Enter Ka.', 'Read pH and pOH.', 'Compare stronger and weaker acids.'], tryThis: 'Increase Ka.', result: 'Larger Ka means stronger acid and lower pH.', realWorld: 'Used for buffers and acid-base chemistry.' },
  { id: 'gas-law', title: 'Ideal Gas Law Calculator', tab: 'Basics', type: 'Calculator', difficulty: 'Beginner', icon: Calculator, topic: 'Gases', teaches: 'Pressure, volume, temperature, and moles are linked.', steps: ['Enter P, V, and T.', 'Read moles.', 'Change temperature and compare.'], tryThis: 'Use 1 atm, 22.4 L, 273.15 K.', result: 'Those values are about 1 mole of ideal gas.', realWorld: 'Used in balloons, cylinders, and engines.' },
  { id: 'empirical-formula', title: 'Empirical Formula Finder', tab: 'Basics', type: 'Calculator', difficulty: 'Intermediate', icon: Calculator, topic: 'Composition', teaches: 'Percent composition can reveal atom ratios.', steps: ['Enter element symbols.', 'Enter percentages.', 'Read the simplest formula.'], tryThis: 'Use C 40, H 6.7, O 53.3.', result: 'The result is the simplest whole-number ratio.', realWorld: 'Used in compound analysis.' },
  { id: 'oxidation', title: 'Oxidation State Finder', tab: 'Reactions', type: 'Calculator', difficulty: 'Intermediate', icon: Calculator, topic: 'Redox', teaches: 'Atoms can be assigned oxidation numbers.', steps: ['Enter a formula.', 'Read common oxidation guesses.', 'Use them to identify redox changes.'], tryThis: 'Try H2SO4.', result: 'O is usually -2 and H is usually +1.', realWorld: 'Used for balancing redox equations.' },
  { id: 'electron-config-tool', title: 'Electron Configuration Builder', tab: 'Atoms', type: 'Calculator', difficulty: 'Intermediate', icon: Atom, topic: 'Electrons', teaches: 'Electron configuration shows orbital filling.', steps: ['Enter atomic number.', 'Read the configuration.', 'Notice shell and orbital order.'], tryThis: 'Try atomic number 8.', result: 'Electrons fill lower energy orbitals first.', realWorld: 'Explains bonding and periodic trends.' },
  { id: 'hess', title: "Reaction Enthalpy (Hess's Law)", tab: 'Reactions', type: 'Calculator', difficulty: 'Advanced', icon: Activity, topic: 'Energy', teaches: 'Reaction enthalpies can be added.', steps: ['Enter two enthalpy values.', 'Add them to get total change.', 'Decide if heat is released or absorbed.'], tryThis: 'Use -286 and 44.', result: 'Negative total means exothermic.', realWorld: 'Used in thermochemistry.' },
  { id: 'colligative', title: 'Colligative Properties Calculator', tab: 'Solutions', type: 'Calculator', difficulty: 'Advanced', icon: Waves, topic: 'Solutions', teaches: 'Solutes change boiling and freezing points.', steps: ['Set molality.', 'Read boiling elevation.', 'Read freezing depression.'], tryThis: 'Increase molality.', result: 'More solute causes bigger temperature shifts.', realWorld: 'Explains antifreeze and salted roads.' },
  { id: 'adsorption', title: 'Adsorption Isotherms Lab', tab: 'Solutions', type: 'Visualizer', difficulty: 'Advanced', icon: Activity, topic: 'Surface Chemistry', teaches: 'Adsorption isotherms connect surface loading to pressure.', steps: ['Adjust Freundlich constants.', 'Adjust Langmuir constants.', 'Compare physisorption and chemisorption.'], tryThis: 'Increase b in Langmuir and watch saturation arrive earlier.', result: 'Freundlich is empirical; Langmuir approaches monolayer saturation.', realWorld: 'Used in catalysis, charcoal adsorption, and colloid chemistry.' },
  { id: 'orbital-shape', title: 'Orbital Shape Viewer', tab: 'Atoms', type: 'Visualizer', difficulty: 'Intermediate', icon: Orbit, topic: 'Orbitals', teaches: 'Orbitals have different shapes.', steps: ['Choose s, p, d, or f.', 'Observe lobe count.', 'Read the note.'], tryThis: 'Compare s and p.', result: 'Orbital shape affects bonding direction.', realWorld: 'Core idea in molecular structure.' },
  { id: 'crystal-structure', title: 'Crystal Structure Viewer', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: Boxes, topic: 'Solids', teaches: 'Solids arrange particles in repeating patterns.', steps: ['Pick a structure.', 'Change lattice size.', 'Observe repeating units.'], tryThis: 'Increase lattice size.', result: 'Crystal properties depend on arrangement.', realWorld: 'Important in salts, metals, and minerals.' },
  { id: 'unit-cell', title: 'Unit Cell Calculator', tab: 'Basics', type: 'Calculator', difficulty: 'Advanced', icon: Boxes, topic: 'Solid State', teaches: 'Unit cell type controls Z, packing efficiency, coordination number, and density.', steps: ['Choose a unit cell.', 'Enter edge length and molar mass.', 'Calculate Z or density.'], tryThis: 'Compare BCC and FCC with the same edge length.', result: 'Density follows rho = ZM / (Na x a^3).', realWorld: 'Used to identify crystalline solids from X-ray density data.' },
  { id: 'crystal-defects', title: 'Crystal Defects Visualizer', tab: 'Basics', type: 'Visualizer', difficulty: 'Advanced', icon: ShieldAlert, topic: 'Solid State', teaches: 'Crystal defects change density, conductivity, and ionic movement.', steps: ['Toggle ionic or metal crystal.', 'Compare perfect, Schottky, and Frenkel grids.', 'Review n-type and p-type doping.'], tryThis: 'Switch from ionic to metal lattice and compare missing sites.', result: 'Schottky lowers density; Frenkel usually keeps density nearly unchanged.', realWorld: 'Explains semiconductors, AgCl defects, and NaCl vacancies.' },
  { id: 'named-reactions', title: 'Named Reactions Reference', tab: 'Advanced', type: 'Reference', difficulty: 'Advanced', icon: BookOpen, topic: 'Organic', teaches: 'Named reactions connect reagents, conditions, and mechanism patterns.', steps: ['Search a reaction.', 'Filter by category or exam level.', 'Read reactants, conditions, and mechanism type.'], tryThis: 'Filter JEE Advanced and Organic together.', result: 'High-yield reactions become easier to compare before practice.', realWorld: 'Useful for synthesis planning and board/JEE revision.' },
  { id: 'functional-tests', title: 'Functional Group Test Reference', tab: 'Advanced', type: 'Practice', difficulty: 'Advanced', icon: BadgeCheck, topic: 'Organic Tests', teaches: 'Qualitative tests identify functional groups from visible observations.', steps: ['Pick a test.', 'Read reagents and observations.', 'Try the reverse quiz.'], tryThis: 'Select iodoform, then answer the acetone quiz.', result: 'A positive result links compound class to a visible color or precipitate.', safety: 'Many qualitative reagents are corrosive or toxic in real labs.', realWorld: 'Used in practical organic analysis.' },
  { id: 'isomerism', title: 'Isomerism Explorer', tab: 'Advanced', type: 'Visualizer', difficulty: 'Advanced', icon: GitCompare, topic: 'Isomerism', teaches: 'Isomers share formula but differ in connectivity, geometry, or coordination arrangement.', steps: ['Enter a formula.', 'Review structural isomers.', 'Compare stereochemical and coordination examples.'], tryThis: 'Try C4H10, C2H6O, C3H6O, or C4H8.', result: 'Structural, stereo, and coordination isomerism use different comparison rules.', realWorld: 'Explains drug activity, organic products, and coordination chemistry questions.' },
  { id: 'reactivity-series', title: 'Reactivity Series & Displacement Simulator', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: Zap, topic: 'Reactivity', teaches: 'A more reactive metal displaces a less reactive metal from its salt solution.', steps: ['Pick a metal and salt solution.', 'Check if displacement happens.', 'Compare water and acid reactions.'], tryThis: 'Try Cu with ZnSO4 and then Zn with CuSO4.', result: 'Metals above another metal in the series can displace it.', safety: 'Reactive metals and acids require teacher supervision.', realWorld: 'Explains extraction, corrosion, and displacement reactions.' },
  { id: 'quantum-numbers', title: 'Quantum Numbers Explorer', tab: 'Atoms', type: 'Calculator', difficulty: 'Advanced', icon: Atom, topic: 'Quantum', teaches: 'Quantum numbers describe electron shells, subshells, orbitals, and spin.', steps: ['Set n, l, ml, and ms.', 'Check validity.', 'Use wavelength, uncertainty, and photoelectric calculators.'], tryThis: 'Set n=3 and l=2 to see a 3d orbital.', result: 'Only combinations obeying l < n and -l <= ml <= l are allowed.', realWorld: 'Foundation for atomic structure and spectra.' },
  { id: 'gibbs', title: 'Gibbs Free Energy & Thermodynamic Spontaneity', tab: 'Reactions', type: 'Calculator', difficulty: 'Advanced', icon: Activity, topic: 'Thermodynamics', teaches: 'Delta G combines enthalpy, entropy, and temperature to predict spontaneity.', steps: ['Enter Delta H and Delta S.', 'Change temperature.', 'Read Delta G and K.'], tryThis: 'Use positive Delta H and positive Delta S, then raise T.', result: 'A reaction is spontaneous when Delta G is negative.', realWorld: 'Used to predict reaction feasibility and equilibrium.' },
  { id: 'environmental-chem', title: 'Environmental Chemistry', tab: 'Advanced', type: 'Reference', difficulty: 'Intermediate', icon: Waves, topic: 'Environment', teaches: 'Atmospheric chemistry, pollution, water quality, and smog depend on reaction pathways.', steps: ['Switch tabs.', 'Review key equations.', 'Connect pollutants to effects.'], tryThis: 'Compare photochemical and classical smog.', result: 'Environmental chemistry links molecular reactions to real-world health and climate effects.', realWorld: 'Useful for Class 11 environmental chemistry and NEET revision.' },
  { id: 'drug-functional-groups', title: 'Drug Functional Groups Map', tab: 'Advanced', type: 'Reference', difficulty: 'Intermediate', icon: BadgeCheck, topic: 'Medicinal Chemistry', teaches: 'Functional groups control solubility, binding, stability, and metabolism in drug molecules.', steps: ['Compare acids, bases, amides, esters, and aromatics.', 'Connect each group to pKa or hydrogen bonding.', 'Predict how the group changes absorption or metabolism.'], tryThis: 'Search amine, carboxylic acid, ester, or amide.', result: 'Drug-like molecules balance polarity, shape, and ionization.', realWorld: 'Used in medicinal chemistry, pharmacy, and pharmacology.' },
  { id: 'adme-ionization', title: 'ADME, pKa and Ionization Guide', tab: 'Advanced', type: 'Reference', difficulty: 'Advanced', icon: Activity, topic: 'Pharmacokinetics', teaches: 'Absorption, distribution, metabolism, and excretion depend strongly on charge, polarity, and pH.', steps: ['Identify acidic or basic groups.', 'Compare pH with pKa.', 'Estimate whether the molecule is mostly ionized.'], tryThis: 'Compare a weak acid at stomach pH and blood pH.', result: 'Ionized forms are usually more water soluble; neutral forms cross membranes more easily.', realWorld: 'Used to reason about drug absorption and dosing.' },
  { id: 'isotonicity', title: 'Isotonicity and Osmotic Pressure', tab: 'Solutions', type: 'Calculator', difficulty: 'Advanced', icon: Calculator, topic: 'Pharma Solutions', teaches: 'Osmotic pressure explains why injections and eye drops must match body-fluid tonicity.', steps: ['Review molarity and van Hoff factor.', 'Compare hypotonic, isotonic, and hypertonic solutions.', 'Link osmotic pressure to cell swelling or shrinking.'], tryThis: 'Compare normal saline with pure water.', result: 'Body-compatible solutions are designed near physiological osmolarity.', realWorld: 'Used in IV fluids, ophthalmic preparations, and medical labs.' },
  { id: 'clinical-buffers', title: 'Blood Buffers and Clinical pH', tab: 'Solutions', type: 'Reference', difficulty: 'Intermediate', icon: ShieldAlert, topic: 'Clinical Chemistry', teaches: 'Bicarbonate, phosphate, and protein buffers help keep blood pH in a narrow range.', steps: ['Review buffer pair and pKa.', 'Connect acid/base addition to pH resistance.', 'Relate pH change to acidosis or alkalosis.'], tryThis: 'Compare bicarbonate buffer with pure water.', result: 'Clinical pH is controlled by chemistry plus breathing and kidney regulation.', realWorld: 'Used in blood chemistry, physiology, and medical diagnostics.' },
  { id: 'pharma-analysis', title: 'Pharmaceutical Assay and QC Tests', tab: 'Advanced', type: 'Practice', difficulty: 'Advanced', icon: FlaskConical, topic: 'Pharma Analysis', teaches: 'Medicine quality checks use titration, chromatography, spectroscopy, dissolution, and impurity testing.', steps: ['Match the assay type to the sample.', 'Identify what property is measured.', 'Choose the chemistry tool that confirms quality.'], tryThis: 'Map aspirin assay to acid-base titration and HPLC impurity checks.', result: 'Pharmaceutical QC combines quantitative and instrumental analysis.', safety: 'Real assays follow pharmacopoeial methods and validated procedures.', realWorld: 'Used in pharmacy labs, manufacturing, and regulatory testing.' },
  { id: 'radiopharma', title: 'Radiopharmaceutical Isotopes', tab: 'Atoms', type: 'Reference', difficulty: 'Intermediate', icon: RadioTower, topic: 'Nuclear Medicine', teaches: 'Medical tracers use isotope half-life, decay type, and tissue targeting chemistry.', steps: ['Compare half-life and decay emission.', 'Connect isotope choice to imaging or therapy.', 'Review shielding and dose safety.'], tryThis: 'Compare Tc-99m, I-131, F-18, and Co-60.', result: 'Useful medical isotopes balance detectable radiation with safe biological clearance.', safety: 'Radioisotopes require trained handling and strict dose controls.', realWorld: 'Used in PET, SPECT, thyroid therapy, and radiotherapy.' },
  { id: 'enzyme-kinetics', title: 'Enzyme Kinetics Visual Lab', tab: 'Advanced', type: 'Simulation', difficulty: 'Advanced', icon: Activity, topic: 'Biochemistry', teaches: 'Substrate level, inhibitors, temperature, and pH change enzyme rate curves.', steps: ['Move through substrate and inhibitor stages.', 'Compare curve shape.', 'Connect Km and Vmax to assay behavior.'], tryThis: 'Compare competitive and noncompetitive inhibition.', result: 'Enzyme graphs show active-site saturation and inhibition patterns.', realWorld: 'Used in diagnostics, drug discovery, and enzyme assays.' },
  { id: 'amino-acid-pi', title: 'Amino Acid pI and Zwitterion Lab', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: GitCompare, topic: 'Biochemistry', teaches: 'Amino acids change net charge with pH and form peptide bonds.', steps: ['Scan low pH, pI, and high pH.', 'Watch charge symbols shift.', 'Connect charge to electrophoresis.'], tryThis: 'Place the stage near pI and inspect net charge.', result: 'Amino acid ionization controls solubility, migration, and peptide formation.', realWorld: 'Used in protein purification and formulation.' },
  { id: 'protein-structure', title: 'Protein Folding and Denaturation Studio', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: Boxes, topic: 'Biochemistry', teaches: 'Protein levels of structure build from sequence to folded function.', steps: ['Move from primary to quaternary structure.', 'Inspect denaturation stage.', 'Connect folding forces to function.'], tryThis: 'Move to denaturation and compare shape loss.', result: 'Protein function depends on folded 3D chemistry.', realWorld: 'Used in enzyme function, fever effects, and lab tests.' },
  { id: 'carbohydrate-lab', title: 'Carbohydrate Ring and Reducing Sugar Lab', tab: 'Molecules', type: 'Practice', difficulty: 'Intermediate', icon: BadgeCheck, topic: 'Biochemistry', teaches: 'Sugar ring/open-chain chemistry explains reducing tests and polysaccharides.', steps: ['Compare glucose, fructose, sucrose, starch, and cellulose.', 'Watch ring and polymer cues.', 'Connect structures to tests.'], tryThis: 'Compare sucrose with glucose.', result: 'Free anomeric carbon and polymer shape control carbohydrate tests.', realWorld: 'Used in nutrition, diagnostics, and pharmacy excipients.' },
  { id: 'lipid-membrane', title: 'Lipid Membrane and Micelle Visualizer', tab: 'Molecules', type: 'Simulation', difficulty: 'Intermediate', icon: Waves, topic: 'Biochemistry', teaches: 'Lipids arrange into bilayers, micelles, emulsions, and membranes.', steps: ['Compare lipid assemblies.', 'Watch hydrophilic heads and hydrophobic tails.', 'Connect to solubilization.'], tryThis: 'Move from phospholipid to micelle.', result: 'Amphiphiles self-assemble to minimize tail-water contact.', realWorld: 'Used in cells, bile salts, creams, and drug delivery.' },
  { id: 'nucleic-acid-lab', title: 'DNA/RNA Base Pairing Visualizer', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: GitCompare, topic: 'Biochemistry', teaches: 'Base pairing, phosphate charge, and sugar differences organize DNA and RNA.', steps: ['Compare A-T/U and G-C pairing.', 'Watch hydrogen-bond counts.', 'Connect backbone charge to migration.'], tryThis: 'Compare G-C with A-T.', result: 'Hydrogen bonding and phosphate chemistry make genetic structure readable.', realWorld: 'Used in genetics, PCR, sequencing, and diagnostics.' },
  { id: 'vitamin-coenzyme-map', title: 'Vitamins, Coenzymes and Minerals Map', tab: 'Advanced', type: 'Reference', difficulty: 'Intermediate', icon: BookOpen, topic: 'Biochemistry', teaches: 'Micronutrients act as coenzymes, redox carriers, cofactors, and structural ions.', steps: ['Compare nutrient roles.', 'Map nutrient to chemical job.', 'Connect deficiency to chemistry.'], tryThis: 'Compare iron, vitamin C, and B vitamins.', result: 'Small cofactors make large biological pathways work.', realWorld: 'Used in nutrition, clinical chemistry, and pharmacology.' },
  { id: 'metabolism-atp', title: 'Metabolism, ATP and Urea Cycle Board', tab: 'Advanced', type: 'Visualizer', difficulty: 'Advanced', icon: Activity, topic: 'Metabolism', teaches: 'Metabolic boards track carbon, nitrogen, electrons, and phosphate energy.', steps: ['Move through glycolysis, ATP, and urea cycle stages.', 'Watch pathway flow.', 'Connect outputs to clinical markers.'], tryThis: 'Move to urea cycle and read nitrogen flow.', result: 'Metabolism is chemical accounting across linked pathways.', realWorld: 'Used in physiology, liver/kidney chemistry, and bioenergetics.' },
  { id: 'drug-class-studio', title: 'Drug Class Chemistry Studio', tab: 'Advanced', type: 'Reference', difficulty: 'Intermediate', icon: BadgeCheck, topic: 'Medicinal Chemistry', teaches: 'Drug classes share recognizable functional group and target patterns.', steps: ['Compare analgesics, antacids, antimicrobials, antihistamines, and anesthetics.', 'Read group motifs.', 'Connect chemistry to use.'], tryThis: 'Compare local anesthetics with antihistamines.', result: 'Drug class behavior follows structure, charge, and target fit.', realWorld: 'Used in pharmacy, pharmacology, and medicinal chemistry.' },
  { id: 'drug-metabolism-lab', title: 'Drug Metabolism Reaction Lab', tab: 'Advanced', type: 'Visualizer', difficulty: 'Advanced', icon: ChevronRight, topic: 'Pharmacokinetics', teaches: 'Drug metabolism changes polarity through functionalization and conjugation.', steps: ['Step through phase I and phase II transformations.', 'Watch polarity rise.', 'Connect chemistry to clearance.'], tryThis: 'Compare oxidation with glucuronidation.', result: 'Metabolism usually makes molecules easier to eliminate.', realWorld: 'Used in prodrugs, interactions, and dose design.' },
  { id: 'dosage-form-lab', title: 'Dosage Form Chemistry Lab', tab: 'Solutions', type: 'Simulation', difficulty: 'Intermediate', icon: FlaskConical, topic: 'Pharma Solutions', teaches: 'Dosage forms are controlled chemical delivery systems.', steps: ['Compare solution, suspension, emulsion, tablet, and syrup.', 'Watch phase behavior.', 'Connect formulation choices to release.'], tryThis: 'Compare suspension with solution.', result: 'Solubility, particle size, viscosity, and surfactants control delivery.', realWorld: 'Used in compounding and pharmaceutical manufacturing.' },
  { id: 'antacid-analgesic-antimicrobial', title: 'Antacid, Analgesic and Antimicrobial Lab', tab: 'Advanced', type: 'Practice', difficulty: 'Intermediate', icon: ShieldAlert, topic: 'Medicines', teaches: 'Common medicines connect to neutralization, organic motifs, and microbial targets.', steps: ['Compare medicine groups.', 'Watch pH or motif changes.', 'Connect chemistry to action.'], tryThis: 'Compare antacid neutralization with sulfa competition.', result: 'Medicine action often starts with a simple chemical principle.', realWorld: 'Used in NEET, pharmacy, and medical chemistry foundations.' },
  { id: 'pharma-buffer-lab', title: 'Pharmaceutical Buffer Formulation Lab', tab: 'Solutions', type: 'Simulation', difficulty: 'Advanced', icon: ShieldAlert, topic: 'Pharma Buffers', teaches: 'Formulation pH controls stability, comfort, solubility, and compatibility.', steps: ['Choose target buffer stage.', 'Compare capacity and comfort.', 'Connect pH to dosage form.'], tryThis: 'Compare comfort with shelf stability.', result: 'A good buffer balances chemical stability with body compatibility.', realWorld: 'Used in injections, eye drops, oral liquids, and biologics.' },
  { id: 'electrolyte-panel', title: 'Clinical Electrolyte Panel Visualizer', tab: 'Solutions', type: 'Visualizer', difficulty: 'Intermediate', icon: BarChart3, topic: 'Clinical Chemistry', teaches: 'Electrolytes control water balance, nerves, muscles, heart rhythm, and acid-base chemistry.', steps: ['Compare Na, K, Ca, Mg, Cl, and bicarbonate.', 'Watch ion bars.', 'Connect charge to body systems.'], tryThis: 'Compare sodium with potassium.', result: 'Ion concentration and charge create body-fluid chemistry.', realWorld: 'Used in hospital chemistry panels and physiology.' },
  { id: 'hemoglobin-oxygen', title: 'Hemoglobin and Oxygen Binding Lab', tab: 'Advanced', type: 'Visualizer', difficulty: 'Advanced', icon: Activity, topic: 'Medical Chemistry', teaches: 'Hemoglobin oxygen loading changes with pressure, pH, CO2, CO, and iron state.', steps: ['Move through curve factors.', 'Watch oxygen occupancy.', 'Connect curve shift to tissues.'], tryThis: 'Compare low pH with carbon monoxide.', result: 'Binding equilibria decide oxygen delivery.', realWorld: 'Used in respiratory physiology and CO poisoning.' },
  { id: 'diagnostic-color-tests', title: 'Diagnostic Reagent Color Lab', tab: 'Advanced', type: 'Practice', difficulty: 'Intermediate', icon: Sparkles, topic: 'Diagnostics', teaches: 'Diagnostic reagents turn analyte chemistry into visible color, precipitate, or intensity.', steps: ['Compare glucose, protein, ketones, bilirubin, and chloride.', 'Watch color panels.', 'Connect analyte to reagent chemistry.'], tryThis: 'Compare glucose redox with biuret protein complex.', result: 'Color tests convert molecular chemistry into measurable signals.', realWorld: 'Used in clinical labs, urine tests, and point-of-care testing.' },
  { id: 'clinical-metabolites', title: 'Glucose, Urea, Creatinine and Cholesterol Lab', tab: 'Advanced', type: 'Visualizer', difficulty: 'Intermediate', icon: BarChart3, topic: 'Clinical Chemistry', teaches: 'Small metabolites reflect fuel use, nitrogen waste, kidney function, lipid balance, and purine chemistry.', steps: ['Compare marker bars.', 'Read the chemical identity.', 'Connect marker to organ function.'], tryThis: 'Compare glucose with creatinine.', result: 'Clinical markers are small molecules measured by analytical chemistry.', realWorld: 'Used in blood tests and medical diagnostics.' },
  { id: 'toxicology-chelation', title: 'Toxicology and Chelation Visualizer', tab: 'Advanced', type: 'Reference', difficulty: 'Advanced', icon: ShieldAlert, topic: 'Toxicology', teaches: 'Toxins harm by binding metals/proteins, blocking enzymes, or shifting equilibria; chelation can trap some metals.', steps: ['Compare toxin binding targets.', 'Watch ligand capture.', 'Connect chemistry to treatment concept.'], tryThis: 'Compare lead chelation with CO poisoning.', result: 'Toxicity often comes from strong binding at the wrong biochemical site.', safety: 'Toxicology topics are conceptual; real exposure needs medical care.', realWorld: 'Used in poisoning, occupational health, and coordination chemistry.' },
  { id: 'cft', title: 'Crystal Field Theory Visualizer', tab: 'Advanced', type: 'Visualizer', difficulty: 'Advanced', icon: Orbit, topic: 'Coordination', teaches: 'Ligand geometry splits d orbitals, changing color, CFSE, and magnetism.', steps: ['Choose geometry.', 'Set d-electron count.', 'Compare strong and weak field filling.'], tryThis: 'Try d6 octahedral in strong and weak field modes.', result: 'Splitting and pairing decide unpaired electrons and magnetic moment.', realWorld: 'Explains transition metal complex color and spin state.' },
  { id: 'metallurgy', title: 'Metallurgy & Extraction Flowchart', tab: 'Advanced', type: 'Reference', difficulty: 'Advanced', icon: Boxes, topic: 'Metallurgy', teaches: 'Ore extraction follows concentration, reduction, and refining logic.', steps: ['Select a metal.', 'Click each extraction step.', 'Review equations and Ellingham idea.'], tryThis: 'Compare Al electrolysis with Fe blast furnace reduction.', result: 'Reduction route depends on metal reactivity and oxide stability.', realWorld: 'Core industrial chemistry for metals.' },
  { id: 'salt-analysis', title: 'Qualitative Salt Analysis Guide', tab: 'Advanced', type: 'Practice', difficulty: 'Advanced', icon: BadgeCheck, topic: 'Salt Analysis', teaches: 'Systematic cation and anion tests identify unknown salts.', steps: ['Review cation groups.', 'Review anion tests.', 'Pick a sample salt for test sequence.'], tryThis: 'Choose CuSO4 and follow both ion confirmations.', result: 'Group reagents narrow ions before confirmatory tests.', safety: 'Qualitative analysis reagents can be toxic, acidic, or release gases.', realWorld: 'Used in practical exams and analytical chemistry.' },
  { id: 'pblock-advanced', title: 'p-Block Groups 15-18 Reference', tab: 'Advanced', type: 'Reference', difficulty: 'Advanced', icon: BookOpen, topic: 'p-Block', teaches: 'Groups 15 to 18 show key oxyacids, allotropes, interhalogens, and xenon structures.', steps: ['Open a group tab.', 'Review structures and trends.', 'Connect VSEPR to noble gas compounds.'], tryThis: 'Compare chlorine oxoacid strength across oxidation states.', result: 'p-block trends often depend on oxidation state, bonding, and size effects.', realWorld: 'High-yield JEE Advanced inorganic reference.' },
  { id: 'hybridization', title: 'Hybridization Animator', tab: 'Molecules', type: 'Visualizer', difficulty: 'Advanced', icon: Orbit, topic: 'Bonding', teaches: 'Hybrid orbitals explain common shapes.', steps: ['Choose a hybridization.', 'Observe orbital count.', 'Connect it to geometry.'], tryThis: 'Compare sp2 and sp3.', result: 'Hybridization predicts bond directions.', realWorld: 'Used in organic chemistry.' },
  { id: 'vsepr', title: 'VSEPR Shape Builder', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: Boxes, topic: 'Shapes', teaches: 'Electron domains determine molecular shape.', steps: ['Set bonded atoms.', 'Set lone pairs.', 'Read the shape and angle.'], tryThis: 'Use 2 bonds and 2 lone pairs.', result: 'Lone pairs bend molecular shapes.', realWorld: 'Explains water shape and polarity.' },
  { id: 'bond-polarity', title: 'Bond Polarity Visualizer', tab: 'Molecules', type: 'Visualizer', difficulty: 'Beginner', icon: GitCompare, topic: 'Bonds', teaches: 'Electronegativity difference affects bond type.', steps: ['Choose two elements.', 'Read bond prediction.', 'Compare similar and different atoms.'], tryThis: 'Compare H-Cl and Na-Cl.', result: 'Large difference tends toward ionic character.', realWorld: 'Helps predict solubility and reactivity.' },
  { id: 'mechanism', title: 'Reaction Mechanism Player', tab: 'Reactions', type: 'Visualizer', difficulty: 'Advanced', icon: ChevronRight, topic: 'Organic', teaches: 'Reactions happen in steps.', steps: ['Choose a mechanism.', 'Move through steps.', 'Read each event.'], tryThis: 'Compare SN1 and SN2.', result: 'Mechanism controls product and rate.', realWorld: 'Used in synthesis planning.' },
  { id: 'imf', title: 'Intermolecular Forces Demo', tab: 'Molecules', type: 'Visualizer', difficulty: 'Intermediate', icon: Waves, topic: 'Forces', teaches: 'Attractions between molecules affect properties.', steps: ['Choose a force type.', 'Observe relative strength.', 'Connect to boiling point.'], tryThis: 'Select hydrogen bonding.', result: 'Stronger forces usually mean higher boiling points.', realWorld: 'Explains water behavior.' },
  { id: 'nuclear-decay', title: 'Nuclear Decay Simulator', tab: 'Atoms', type: 'Visualizer', difficulty: 'Intermediate', icon: RadioTower, topic: 'Nuclear', teaches: 'Radioactive nuclei change over time.', steps: ['Choose decay mode.', 'Adjust half-lives.', 'Watch remaining parent material.'], tryThis: 'Move to 4 half-lives.', result: 'Each half-life halves the remaining sample.', safety: 'Real radioactive materials need strict controls.', realWorld: 'Used in dating and medicine.' },
  { id: 'phase-diagram', title: 'Phase Diagram Explorer', tab: 'Basics', type: 'Visualizer', difficulty: 'Intermediate', icon: BarChart3, topic: 'States', teaches: 'Temperature and pressure determine phase.', steps: ['Change temperature.', 'Change pressure.', 'Read the phase.'], tryThis: 'Raise pressure and temperature.', result: 'Matter can become solid, liquid, gas, or supercritical.', realWorld: 'Used in weather and industrial processes.' },
  { id: 'mo-diagram', title: 'Molecular Orbital Diagram', tab: 'Molecules', type: 'Visualizer', difficulty: 'Advanced', icon: Orbit, topic: 'Orbitals', teaches: 'Molecular orbitals explain bond order and magnetism.', steps: ['Choose a molecule.', 'Read bond order.', 'Check magnetic behavior.'], tryThis: 'Choose O2.', result: 'O2 is paramagnetic in MO theory.', realWorld: 'Explains observations Lewis structures miss.' },
  { id: 'rate-lab', title: 'Reaction Rate Lab', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: Activity, topic: 'Kinetics', teaches: 'Temperature and concentration affect reaction speed.', steps: ['Change temperature.', 'Change concentration.', 'Watch curve steepness.'], tryThis: 'Increase both sliders.', result: 'Higher temperature and concentration usually increase rate.', safety: 'Fast reactions can heat or foam.', realWorld: 'Used in food, medicine, and manufacturing.' },
  { id: 'calorimetry', title: 'Calorimetry Experiment', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: FlaskConical, topic: 'Heat', teaches: 'Heat transfer changes final temperature.', steps: ['Set metal temperature.', 'Set metal mass.', 'Read final water temperature.'], tryThis: 'Increase metal mass.', result: 'More hot metal transfers more heat.', safety: 'Hot metals and water can burn.', realWorld: 'Used to measure specific heat.' },
  { id: 'solubility', title: 'Solubility Lab', tab: 'Solutions', type: 'Simulation', difficulty: 'Intermediate', icon: FlaskConical, topic: 'Ksp', teaches: 'Precipitates form when ion product exceeds Ksp.', steps: ['Choose a salt.', 'Add solute.', 'Watch precipitate status.'], tryThis: 'Increase salt added.', result: 'When Q > Ksp, precipitate forms.', safety: 'Some salts are toxic in real labs.', realWorld: 'Used in water treatment and analysis.' },
  { id: 'indicator', title: 'Indicator Color Table', tab: 'Solutions', type: 'Reference', difficulty: 'Beginner', icon: Sparkles, topic: 'pH', teaches: 'Indicators change color over pH ranges.', steps: ['Pick an indicator.', 'Set pH.', 'Observe color.'], tryThis: 'Move pH across 7.', result: 'Each indicator has its own transition range.', safety: 'Indicators can stain skin and clothing.', realWorld: 'Used in titrations and quick pH tests.' },
  { id: 'corrosion', title: 'Galvanic Series / Corrosion Demo', tab: 'Reactions', type: 'Simulation', difficulty: 'Intermediate', icon: ShieldAlert, topic: 'Corrosion', teaches: 'Some metals corrode preferentially.', steps: ['Pick two metals.', 'Compare potentials.', 'Identify which corrodes.'], tryThis: 'Try Zn and Cu.', result: 'The more easily oxidized metal corrodes.', safety: 'Corrosion products may be hazardous.', realWorld: 'Used in sacrificial anodes.' },
  { id: 'soap', title: 'Soap Making (Saponification)', tab: 'Advanced', type: 'Simulation', difficulty: 'Advanced', icon: FlaskConical, topic: 'Organic', teaches: 'Fats react with base to make soap.', steps: ['Move reaction progress.', 'Observe product formation.', 'Connect to ester hydrolysis.'], tryThis: 'Set progress near 100 percent.', result: 'More progress means more soap product.', safety: 'Real lye is caustic.', realWorld: 'Used to manufacture soap.' },
  { id: 'fermentation', title: 'Fermentation Simulator', tab: 'Advanced', type: 'Simulation', difficulty: 'Beginner', icon: Activity, topic: 'Biochemistry', teaches: 'Yeast activity depends strongly on temperature.', steps: ['Change temperature.', 'Watch activity.', 'Find the best range.'], tryThis: 'Set temperature near 32 C.', result: 'Activity drops when too cold or too hot.', safety: 'Use clean containers for real fermentation.', realWorld: 'Used in bread and beverages.' },
  { id: 'polymer', title: 'Polymer Builder', tab: 'Advanced', type: 'Simulation', difficulty: 'Intermediate', icon: Boxes, topic: 'Polymers', teaches: 'Polymers are chains of repeating units.', steps: ['Change chain length.', 'Observe repeating units.', 'Connect length to material properties.'], tryThis: 'Increase polymer length.', result: 'Longer chains often make tougher materials.', realWorld: 'Used in plastics and fibers.' },
  { id: 'buffer', title: 'Buffer Solution Lab', tab: 'Solutions', type: 'Simulation', difficulty: 'Advanced', icon: ShieldAlert, topic: 'Buffers', teaches: 'Buffers resist pH change.', steps: ['Add acid or base.', 'Compare buffer vs pure water.', 'Read pH response.'], tryThis: 'Add small acid amount.', result: 'Buffer pH changes less than pure water.', safety: 'Buffers still need proper chemical handling.', realWorld: 'Important in blood and biology labs.' },
  { id: 'recrystallization', title: 'Recrystallization Visualizer', tab: 'Solutions', type: 'Visualizer', difficulty: 'Intermediate', icon: Sparkles, topic: 'Purification', teaches: 'Solubility changes with temperature.', steps: ['Set temperature.', 'Watch supersaturation.', 'Predict crystal formation.'], tryThis: 'Lower temperature.', result: 'Cooling can form crystals from solution.', safety: 'Hot solvents can be flammable.', realWorld: 'Used to purify solids.' },
  { id: 'bohr', title: 'Bohr Controls and Ion Formation', tab: 'Atoms', type: 'Visualizer', difficulty: 'Beginner', icon: Atom, topic: 'Atoms', teaches: 'Shell electrons help predict common ions.', steps: ['Choose an element.', 'Count shell electrons.', 'Read likely ion pattern.'], tryThis: 'Compare Na and Cl.', result: 'Outer electrons guide simple ion formation.', realWorld: 'Helps explain ionic compounds.' },
  { id: 'timeline', title: 'Element Discovery Timeline', tab: 'Atoms', type: 'Reference', difficulty: 'Beginner', icon: RadioTower, topic: 'History', teaches: 'Elements were discovered across centuries.', steps: ['Scroll the timeline.', 'Pick an element.', 'Read discoverer and year.'], tryThis: 'Select an ancient element and a modern element.', result: 'Discovery history reflects available tools.', realWorld: 'Connects chemistry to human discovery.' },
  { id: 'element-pack', title: 'Element Information Pack', tab: 'Atoms', type: 'Reference', difficulty: 'Beginner', icon: BookOpen, topic: 'Elements', teaches: 'One element has uses, safety notes, occurrence, and extraction.', steps: ['Choose an element.', 'Read each information tile.', 'Connect properties to uses.'], tryThis: 'Choose carbon or oxygen.', result: 'Properties explain where and how elements are used.', safety: 'Check safety before handling real substances.', realWorld: 'Useful for assignments and lab prep.' },
  { id: 'isotopes', title: 'Isotope Explorer and Half-Life Chart', tab: 'Atoms', type: 'Visualizer', difficulty: 'Intermediate', icon: RadioTower, topic: 'Isotopes', teaches: 'Isotopes differ by neutron count.', steps: ['Choose an element with isotope data.', 'Read neutron counts.', 'Compare half-lives.'], tryThis: 'Choose C or U.', result: 'Same element can have stable and radioactive isotopes.', safety: 'Radioisotopes require trained handling.', realWorld: 'Used in dating and medical tracers.' },
  { id: 'formula-builder', title: 'Formula Builder and Molar Mass', tab: 'Basics', type: 'Calculator', difficulty: 'Beginner', icon: Calculator, topic: 'Formulas', teaches: 'Formulas tell atom counts and mass.', steps: ['Enter formula.', 'Read parsed atoms.', 'Read molar mass.'], tryThis: 'Try Ca(OH)2.', result: 'Parentheses multiply grouped atoms.', realWorld: 'Used before every measured reaction.' },
  { id: 'bond-predictor', title: 'Bond Predictor', tab: 'Molecules', type: 'Practice', difficulty: 'Beginner', icon: GitCompare, topic: 'Bonds', teaches: 'Element pairs can suggest bond type.', steps: ['Enter two symbols.', 'Read prediction.', 'Change one element and compare.'], tryThis: 'Try Na and Cl.', result: 'Metal plus nonmetal often forms ionic compounds.', realWorld: 'Helps predict properties of compounds.' },
  { id: 'equation-balancer', title: 'Equation Balancer', tab: 'Reactions', type: 'Practice', difficulty: 'Intermediate', icon: FlaskConical, topic: 'Equations', teaches: 'Atoms must be conserved in reactions.', steps: ['Enter an equation.', 'Read balanced output.', 'Check each element count.'], tryThis: 'Try CH4 + O2 -> CO2 + H2O.', result: 'Balanced equations preserve atoms.', realWorld: 'Required for stoichiometry.' },
  { id: 'abundance', title: 'Abundance and Comparison Charts', tab: 'Atoms', type: 'Visualizer', difficulty: 'Beginner', icon: BarChart3, topic: 'Data', teaches: 'Element data can be compared visually.', steps: ['Choose an element.', 'Pick a second element.', 'Compare properties.'], tryThis: 'Compare C and O.', result: 'Charts make property differences easier to see.', realWorld: 'Useful for studying trends.' },
  { id: 'trend-graph', title: 'Trend Graph and Animated Arrows', tab: 'Atoms', type: 'Visualizer', difficulty: 'Intermediate', icon: Activity, topic: 'Trends', teaches: 'Properties change across periods.', steps: ['Choose an element.', 'Look at its period graph.', 'Notice left-to-right patterns.'], tryThis: 'Choose a period 2 element.', result: 'Electronegativity tends to increase across a period.', realWorld: 'Helps predict reactivity.' },
  { id: 'safety-valency', title: 'Lab Safety, VSEPR, Lewis, Valency', tab: 'Basics', type: 'Practice', difficulty: 'Beginner', icon: ShieldAlert, topic: 'Safety', teaches: 'Basic safety and structure rules support lab work.', steps: ['Read valency clue.', 'Check Lewis note.', 'Review safety reminder.'], tryThis: 'Choose oxygen.', result: 'Simple rules build first predictions.', safety: 'Always label, ventilate, and use PPE.', realWorld: 'Used before any experiment.' },
  { id: 'concept-helper', title: 'Concept Helper', tab: 'Basics', type: 'Practice', difficulty: 'Beginner', icon: Brain, topic: 'Revision', teaches: 'Use built-in explanations for common chemistry ideas.', steps: ['Type a short concept question.', 'Read the rule-based explanation.', 'Compare the answer with your notes.'], tryThis: 'Ask about electronegativity.', result: 'Short explanations connect facts to causes.', realWorld: 'Useful for revision.' },
  { id: 'molecule-links', title: 'Molecule Links, Crystal Lattice, Reactions, Functional Groups', tab: 'Molecules', type: 'Reference', difficulty: 'Advanced', icon: BadgeCheck, topic: 'Connections', teaches: 'Element choices connect to molecules and structures.', steps: ['Choose an element.', 'Review related molecules.', 'Read the reaction/functional group prompts.'], tryThis: 'Choose carbon.', result: 'Elements participate in many molecule families.', realWorld: 'Useful for organic and materials chemistry.' },
];

const labTabs = ['Start Here', 'Basics', 'Atoms', 'Molecules', 'Reactions', 'Solutions', 'Advanced'];
const labFocusTopics = [
  { id: 'all', label: 'All', desc: 'Show every matching experiment' },
  { id: 'beginner', label: 'Start Here', desc: 'Only beginner-friendly labs' },
  { id: 'matter', label: 'Matter', desc: 'States, mixtures, separation, phase' },
  { id: 'atoms', label: 'Atoms', desc: 'Shells, spectra, isotopes, orbitals' },
  { id: 'bonding', label: 'Bonding', desc: 'Bonds, shapes, polarity, molecules' },
  { id: 'reactions', label: 'Reactions', desc: 'Equations, redox, rates, heat' },
  { id: 'solutions', label: 'Solutions', desc: 'pH, concentration, solubility, buffers' },
  { id: 'inorganic', label: 'Inorganic', desc: 'p-block, coordination, CFT, metallurgy, salt analysis, crystals' },
  { id: 'organic', label: 'Organic', desc: 'Mechanisms, polymers, biomolecules' },
  { id: 'bio', label: 'Bio', desc: 'Enzymes, proteins, sugars, lipids, DNA, metabolism' },
  { id: 'pharma', label: 'Pharma', desc: 'Drug groups, ADME, dosage forms, assays, buffers' },
  { id: 'medical', label: 'Medical', desc: 'Clinical, isotope, electrolyte and toxicology chemistry' },
];
const labTypes = ['All', 'Simulation', 'Calculator', 'Visualizer', 'Practice', 'Reference'];
const labDifficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const experimentMetaByTitle = Object.fromEntries(LAB_EXPERIMENTS.map(item => [item.title, item]));

const prerequisiteMap = {
  titration: 'Know pH, neutralization, and indicators first.',
  stoichiometry: 'Know mole concept and balanced equations first.',
  vsepr: 'Know valence electrons and Lewis structures first.',
  hybridization: 'Know sigma bonds, pi bonds, and VSEPR first.',
  'weak-acid-ph': 'Know pH and acid dissociation first.',
  electrolysis: 'Know oxidation, reduction, anode, and cathode first.',
  'electrochemical-cell': 'Know redox potential and electron flow first.',
  colligative: 'Know molality and solution concentration first.',
  mechanism: 'Know nucleophiles, leaving groups, and bond breaking first.',
  'enzyme-kinetics': 'Know enzymes as catalysts, active sites, substrate, product, and reaction rate.',
  'amino-acid-pi': 'Know acids, bases, zwitterions, and alpha-amino acid functional groups.',
  'protein-structure': 'Know peptide bonds, hydrogen bonding, hydrophobic interactions, and disulfide links.',
  'carbohydrate-lab': 'Know ring/open-chain sugar forms, glycosidic bonds, and reducing tests.',
  'lipid-membrane': 'Know polar heads, nonpolar tails, amphiphiles, and hydrophobic effect.',
  'nucleic-acid-lab': 'Know nucleotide parts: base, sugar, and phosphate.',
  'vitamin-coenzyme-map': 'Know vitamins as small organic helpers and minerals as inorganic cofactors.',
  'metabolism-atp': 'Know oxidation-reduction, ATP phosphate transfer, and carbon/nitrogen flow.',
  'drug-functional-groups': 'Know organic functional groups, polarity, hydrogen bonding, and acid-base behavior.',
  'adme-ionization': 'Know pH, pKa, ionization, polarity, and membrane crossing basics.',
  isotonicity: 'Know molarity, osmotic pressure, van Hoff factor, and semipermeable membranes.',
  'clinical-buffers': 'Know weak acid/conjugate base buffers and Henderson-Hasselbalch idea.',
  'drug-class-studio': 'Know organic motifs such as acids, amides, amines, aromatics, and heterocycles.',
  'drug-metabolism-lab': 'Know oxidation, reduction, hydrolysis, and conjugation reactions.',
  'dosage-form-lab': 'Know solution, suspension, emulsion, solubility, viscosity, and surfactants.',
  'antacid-analgesic-antimicrobial': 'Know neutralization, functional groups, and selective toxicity idea.',
  'pharma-buffer-lab': 'Know buffer capacity, target pH, pKa, and compatibility.',
  'pharma-analysis': 'Know titration, chromatography, spectroscopy, and impurity testing basics.',
  radiopharma: 'Know isotopes, half-life, decay type, tracer targeting, and radiation safety.',
  'electrolyte-panel': 'Know ions, charge balance, osmolarity, and body-fluid compartments.',
  'hemoglobin-oxygen': 'Know equilibrium, cooperative binding, heme iron, pH, and CO2 effects.',
  'diagnostic-color-tests': 'Know redox tests, complex formation, precipitation, and absorbance.',
  'clinical-metabolites': 'Know small biomolecules and analytical concentration measurements.',
  'toxicology-chelation': 'Know coordination, ligand binding, enzyme inhibition, and redox toxicity.',
};

const commonMistakes = {
  titration: 'Do not assume pH changes evenly; near equivalence it can jump very quickly.',
  'molar-mass': 'Remember that atoms inside parentheses are multiplied by the subscript outside.',
  stoichiometry: 'Always balance the equation before using mole ratios.',
  dilution: 'Use the same volume units on both sides of C1V1 = C2V2.',
  vsepr: 'Count lone pairs as electron domains even though they are not atoms.',
  'bond-polarity': 'A polar bond does not always mean the whole molecule is polar.',
  equilibrium: 'A catalyst changes speed, not the equilibrium position.',
  colligative: 'Use molality, not molarity, for boiling and freezing point calculations.',
  electrolysis: 'Do not mix up electrode sign conventions for electrolytic and galvanic cells.',
  'enzyme-kinetics': 'Do not assume rate rises forever; active sites saturate near Vmax.',
  'amino-acid-pi': 'Do not treat every amino acid as neutral at all pH values; net charge changes with pH.',
  'protein-structure': 'Do not confuse denaturation with peptide-bond hydrolysis; unfolding can occur without breaking the backbone.',
  'carbohydrate-lab': 'Do not assume every disaccharide is reducing; sucrose lacks a free anomeric carbon.',
  'lipid-membrane': 'Do not draw lipid tails facing water in a stable bilayer or micelle.',
  'nucleic-acid-lab': 'Do not forget phosphate makes nucleic acid backbones negatively charged.',
  'vitamin-coenzyme-map': 'Do not memorize vitamins only as names; link each one to a chemical role.',
  'metabolism-atp': 'Do not treat ATP as stored heat; it drives reactions through coupled phosphate transfer.',
  'drug-functional-groups': 'Do not decide drug behavior from one group only; shape, charge, and polarity act together.',
  'adme-ionization': 'Do not assume neutral is always better; solubility and permeability must be balanced.',
  isotonicity: 'Do not confuse percent concentration with osmolarity; ion dissociation changes particle count.',
  'clinical-buffers': 'Do not treat blood pH as a single test-tube buffer; lungs and kidneys also regulate it.',
  'drug-class-studio': 'Do not assume all drugs in a class have identical functional groups or metabolism.',
  'drug-metabolism-lab': 'Do not assume metabolism always inactivates a drug; prodrugs can be activated.',
  'dosage-form-lab': 'Do not call a cloudy suspension a solution; phase behavior matters.',
  'antacid-analgesic-antimicrobial': 'Do not mix symptom relief chemistry with antimicrobial target chemistry.',
  'pharma-buffer-lab': 'Do not maximize buffer strength blindly; comfort and compatibility can suffer.',
  'pharma-analysis': 'Do not use one assay to prove everything; identity, purity, strength, and release are different checks.',
  radiopharma: 'Do not pick an isotope by radiation type alone; half-life, targeting, and clearance matter.',
  'electrolyte-panel': 'Do not compare ions only by charge; compartment and concentration range matter.',
  'hemoglobin-oxygen': 'Do not confuse oxygen binding with oxidation of iron to Fe3+.',
  'diagnostic-color-tests': 'Do not read color intensity without controls, calibration, and timing.',
  'clinical-metabolites': 'Do not interpret a marker without sample type, units, and context.',
  'toxicology-chelation': 'Do not assume every poison is treated by chelation; mechanism decides treatment concept.',
};

const formulaNotes = {
  'molar-mass': 'Molar mass = sum of each atomic mass x atom count.',
  'formula-builder': 'Molar mass = sum of each atomic mass x atom count.',
  stoichiometry: 'Balanced equation coefficients give mole ratios.',
  dilution: 'C1V1 = C2V2.',
  'weak-acid-ph': '[H+] approximately equals sqrt(Ka x C) for a weak acid.',
  'gas-law': 'PV = nRT.',
  hess: 'Delta H total = sum of adjusted reaction enthalpies.',
  colligative: 'Delta Tb = Kb x m and Delta Tf = Kf x m.',
  'rate-lab': 'Rate generally increases with concentration and temperature.',
  calorimetry: 'q = m c Delta T.',
  solubility: 'Precipitation is predicted by comparing Q with Ksp.',
  'enzyme-kinetics': 'Michaelis-Menten: v = Vmax[S] / (Km + [S]).',
  'amino-acid-pi': 'For simple neutral amino acids, pI is roughly (pKa1 + pKa2) / 2.',
  'protein-structure': 'Protein stability is a balance of hydrogen bonding, ionic links, hydrophobic packing, and disulfides.',
  'carbohydrate-lab': 'Reducing sugars have a free anomeric carbon that can open to a carbonyl form.',
  'lipid-membrane': 'Amphiphiles assemble with polar heads toward water and nonpolar tails away from water.',
  'nucleic-acid-lab': 'A pairs with T/U by 2 H-bonds; G pairs with C by 3 H-bonds.',
  'vitamin-coenzyme-map': 'Coenzymes transfer electrons, acyl groups, one-carbon units, or phosphate-linked energy.',
  'metabolism-atp': 'ATP hydrolysis and redox carriers couple unfavorable steps to favorable chemistry.',
  'drug-functional-groups': 'Drug-like behavior depends on pKa, logP, H-bond donors/acceptors, and molecular shape.',
  'adme-ionization': 'Weak acid ionized fraction rises above pKa; weak base ionized fraction rises below pKa.',
  isotonicity: 'Osmotic pressure: Pi = iMRT; osmolarity counts dissolved particles.',
  'clinical-buffers': 'Henderson-Hasselbalch: pH = pKa + log(base/acid).',
  'drug-class-studio': 'SAR compares how structure changes affect potency, selectivity, and safety.',
  'drug-metabolism-lab': 'Phase I adds/exposes groups; Phase II conjugates polar groups for clearance.',
  'dosage-form-lab': 'Release depends on solubility, particle size, dissolution, viscosity, and matrix breakup.',
  'antacid-analgesic-antimicrobial': 'Antacids neutralize acid; analgesics affect biochemical targets; antimicrobials block microbial chemistry.',
  'pharma-buffer-lab': 'Useful buffer range is usually near pKa +/- 1 pH unit.',
  'pharma-analysis': 'Assay proves amount; chromatography separates impurities; dissolution tests release.',
  radiopharma: 'Remaining activity follows A = A0 / 2^n after n half-lives.',
  'electrolyte-panel': 'Electroneutrality and osmolarity link ions to water balance.',
  'hemoglobin-oxygen': 'Bohr effect: lower pH and higher CO2 shift oxygen release toward tissues.',
  'diagnostic-color-tests': 'Many color tests use redox change, complex formation, precipitation, or enzymatic color generation.',
  'clinical-metabolites': 'Clinical chemistry converts concentration changes into metabolic and organ-function signals.',
  'toxicology-chelation': 'Chelators bind metal ions through multiple donor atoms to improve removal or reduce binding to enzymes.',
};

const miniQuiz = {
  titration: { q: 'What marks the equivalence region?', a: 'A sharp pH change as acid and base neutralize.' },
  'molar-mass': { q: 'Why do parentheses matter in formulas?', a: 'They multiply every atom inside the group.' },
  stoichiometry: { q: 'What must be done before mole-ratio calculations?', a: 'Balance the chemical equation.' },
  vsepr: { q: 'What determines molecular shape in VSEPR?', a: 'Bonding pairs and lone-pair electron domains.' },
  electrolysis: { q: 'What drives a non-spontaneous reaction in electrolysis?', a: 'External electrical energy.' },
  'enzyme-kinetics': { q: 'Why does the enzyme rate curve level off?', a: 'Active sites become saturated, so rate approaches Vmax.' },
  'amino-acid-pi': { q: 'What happens to net amino acid charge near pI?', a: 'The net charge is close to zero, often as a zwitterion.' },
  'protein-structure': { q: 'What changes during denaturation?', a: 'The folded structure is disrupted while peptide bonds may remain intact.' },
  'carbohydrate-lab': { q: 'What makes a sugar reducing?', a: 'A free anomeric carbon that can open to a carbonyl form.' },
  'lipid-membrane': { q: 'Why do micelles form in water?', a: 'Polar heads face water while nonpolar tails hide inside.' },
  'nucleic-acid-lab': { q: 'Which base pair has more hydrogen bonds, A-T or G-C?', a: 'G-C has three hydrogen bonds; A-T has two.' },
  'metabolism-atp': { q: 'What does ATP transfer in many biochemical reactions?', a: 'A phosphate-linked energy unit that couples reactions.' },
  'adme-ionization': { q: 'Why does pKa matter in drug absorption?', a: 'It predicts ionization, which affects solubility and membrane crossing.' },
  isotonicity: { q: 'Why does NaCl count more particles than glucose?', a: 'NaCl dissociates into ions, increasing osmotic particle count.' },
  'clinical-buffers': { q: 'What is the main blood buffer pair?', a: 'Carbonic acid/bicarbonate, linked to CO2 handling.' },
  radiopharma: { q: 'Why is half-life important for medical isotopes?', a: 'It balances useful detection or therapy with safe clearance.' },
  'electrolyte-panel': { q: 'Which ion is the major extracellular cation?', a: 'Sodium ion, Na+.' },
  'hemoglobin-oxygen': { q: 'What does low pH do to oxygen release?', a: 'It shifts hemoglobin toward releasing oxygen in tissues.' },
  'toxicology-chelation': { q: 'What is chelation?', a: 'Binding a metal ion with a ligand that has multiple donor atoms.' },
};

const appliedChemistryRoadmaps = {
  bio: {
    title: 'Biochemistry Strength Map',
    accent: '#22c55e',
    strands: [
      ['Biomolecule structure', 'Amino acids, proteins, carbohydrates, lipids, nucleic acids'],
      ['Biochemical forces', 'Hydrogen bonding, ionization, hydrophobic effect, redox and phosphate transfer'],
      ['Lab visuals', 'Enzyme curves, folding, reducing sugars, membranes, base pairing, metabolism board'],
    ],
  },
  pharma: {
    title: 'Pharmaceutical Chemistry Strength Map',
    accent: '#14b8a6',
    strands: [
      ['Drug structure', 'Functional groups, SAR, pKa, lipophilicity, hydrogen bonding'],
      ['Formulation chemistry', 'Buffers, isotonicity, dosage forms, solubility, stability, excipients'],
      ['Quality control', 'Assay, chromatography, spectroscopy, dissolution, impurities and limits'],
    ],
  },
  medical: {
    title: 'Medical and Clinical Chemistry Strength Map',
    accent: '#fb7185',
    strands: [
      ['Body-fluid chemistry', 'Electrolytes, buffers, osmolarity, blood pH, oxygen binding'],
      ['Diagnostics', 'Glucose, urea, creatinine, cholesterol, color tests, radiotracers'],
      ['Toxicology', 'Heavy metals, CO, cyanide, enzyme poisoning, chelation and isotope safety'],
    ],
  },
};

const LabCard = ({ title, children }) => {
  const meta = experimentMetaByTitle[title];
  const Icon = meta?.icon || FlaskConical;
  const syllabusTags = meta ? getSyllabusTagsForLab(meta.id) : { tracks: [] };
  return (
  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
    <div className="flex items-start gap-3 mb-3">
      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
        <Icon size={17} className="text-cyan-300" />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-white">{title}</h4>
        {meta && (
          <div className="mt-1 flex flex-wrap gap-1">
            <BadgePill className={difficultyStyles[meta.difficulty]}>{meta.difficulty}</BadgePill>
            <BadgePill className={typeStyles[meta.type]}>{meta.type}</BadgePill>
            <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">{estimatedMinutes(meta)} min</BadgePill>
            <BadgePill className="bg-white/[0.04] text-gray-300 border-white/10">{meta.topic}</BadgePill>
            {syllabusTags.tracks.slice(0, 4).map(trackId => (
              <BadgePill
                key={trackId}
                className="bg-black/15 text-gray-300 border-white/10"
                style={{ borderColor: `${syllabusTrackMap[trackId]?.color || '#64748b'}66`, color: syllabusTrackMap[trackId]?.color }}
              >
                {syllabusTrackMap[trackId]?.label}
              </BadgePill>
            ))}
          </div>
        )}
      </div>
    </div>
    {meta && (
      <div className="mb-3 rounded-xl bg-black/15 border border-white/10 p-3">
        <p className="text-xs text-gray-300"><span className="text-cyan-300 font-semibold">Learn:</span> {meta.teaches}</p>
        {meta.safety && <p className="text-[11px] text-amber-300 mt-1"><span className="font-semibold">Safety:</span> {meta.safety}</p>}
      </div>
    )}
    {children}
  </div>
  );
};

const Bench = ({ title, children, result }) => {
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const resultText = typeof result === 'string' ? result : '';
  const approximate = /\d/.test(resultText);
  const statusClass = /no |invalid|error|non-spontaneous|illegal/i.test(resultText)
    ? 'bg-amber-500/10 border-amber-500/20 text-amber-100'
    : /correct|spontaneous|forms|complete|allowed|occurs|negative|positive/i.test(resultText)
      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100'
      : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100';
  const copyResult = () => {
    if (!resultText || !navigator.clipboard) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  useEffect(() => {
    if (!resultText) return;
    setFlash(true);
    const timeout = window.setTimeout(() => setFlash(false), 650);
    return () => window.clearTimeout(timeout);
  }, [resultText]);
  return (
  <div data-active-lab className="rounded-2xl bg-black/20 border border-white/10 p-4">
    <div className="flex items-center gap-2 mb-3">
      <FlaskConical size={16} className="text-emerald-300" />
      <h4 className="text-sm font-black text-white">{title}</h4>
      <span className="ml-auto text-[10px] text-emerald-300 border border-emerald-500/25 bg-emerald-500/10 rounded-full px-2 py-0.5">
        Live Lab
      </span>
    </div>
    {children}
    {result && (
      <div className={`mt-4 rounded-xl border p-3 text-sm transition-shadow ${statusClass} ${flash ? 'ring-2 ring-cyan-300/40 shadow-lg shadow-cyan-500/10' : ''}`}>
        <div className="flex items-start gap-2">
          <span className="flex-1">{result}</span>
          {approximate && <BadgePill className="bg-white/[0.08] text-gray-200 border-white/15">Approximate</BadgePill>}
          {resultText && (
            <button type="button" onClick={copyResult} className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] text-gray-200 hover:text-white" title="Copy result">
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    )}
  </div>
  );
};

const ControlLabel = ({ children }) => (
  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">{children}</label>
);

const ElementSearchInput = ({ value, onChange, allowedSymbols, className = '', placeholder = 'Search Elements' }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const selectedElement = elements.find(el => el.symbol === value);
  const availableElements = useMemo(() => {
    const allowed = allowedSymbols ? new Set(allowedSymbols) : null;
    return elements.filter(el => !allowed || allowed.has(el.symbol));
  }, [allowedSymbols]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? availableElements.filter(el =>
          el.name.toLowerCase().includes(q) ||
          el.symbol.toLowerCase().includes(q) ||
          String(el.atomicNumber).includes(q) ||
          el.category.toLowerCase().includes(q)
        )
      : availableElements;
    return matches.slice(0, 8);
  }, [availableElements, query]);

  useEffect(() => {
    if (selectedElement) setQuery(`${selectedElement.name} (${selectedElement.symbol})`);
  }, [selectedElement]);

  const selectElement = (symbol) => {
    const next = elements.find(el => el.symbol === symbol);
    if (!next) return;
    onChange(symbol);
    setQuery(`${next.name} (${next.symbol})`);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={e => {
          if (e.key === 'Enter' && suggestions[0]) {
            e.preventDefault();
            selectElement(suggestions[0].symbol);
          }
        }}
        placeholder={placeholder}
        className="input text-sm pl-9"
      />
      {open && (
        <div className="absolute z-40 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-gray-950 shadow-2xl">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
            Available elements
          </div>
          {suggestions.length > 0 ? suggestions.map(el => (
            <button
              type="button"
              key={el.symbol}
              onMouseDown={e => e.preventDefault()}
              onClick={() => selectElement(el.symbol)}
              className="w-full px-3 py-2 text-left hover:bg-white/[0.06] flex items-center gap-3"
            >
              <span className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 flex items-center justify-center text-sm font-black">
                {el.symbol}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-white truncate">{el.name}</span>
                <span className="block text-[11px] text-gray-500 truncate">#{el.atomicNumber} - {el.category}</span>
              </span>
            </button>
          )) : (
            <div className="px-3 py-3 text-xs text-gray-500">No available element matches this search.</div>
          )}
        </div>
      )}
    </div>
  );
};

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

export const ChemistryLabPage = ({ initialFocusTopic = 'all', initialExperimentId = '' }) => {
  const labSearchRef = useRef(null);
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
  const [anodeHalf, setAnodeHalf] = useState('Zn');
  const [cathodeHalf, setCathodeHalf] = useState('Cu');
  const [cellMode, setCellMode] = useState('galvanic');
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
  const [hessEquation, setHessEquation] = useState('CH4 + O2 -> CO2 + H2O');
  const [molality, setMolality] = useState(1);
  const [unitCellType, setUnitCellType] = useState('FCC');
  const [unitCellA, setUnitCellA] = useState(400);
  const [unitCellDensity, setUnitCellDensity] = useState(8.96);
  const [unitCellMolarMass, setUnitCellMolarMass] = useState(63.55);
  const [unitCellZInput, setUnitCellZInput] = useState(4);
  const [defectCrystalType, setDefectCrystalType] = useState('ionic');
  const [dopingType, setDopingType] = useState('n');
  const [freundlichK, setFreundlichK] = useState(1.2);
  const [freundlichN, setFreundlichN] = useState(2);
  const [langmuirA, setLangmuirA] = useState(4);
  const [langmuirB, setLangmuirB] = useState(0.8);
  const [adsorptionMode, setAdsorptionMode] = useState('physisorption');
  const [namedReactionSearch, setNamedReactionSearch] = useState('');
  const [namedReactionCategory, setNamedReactionCategory] = useState('All');
  const [namedReactionTrack, setNamedReactionTrack] = useState('All');
  const [selectedFunctionalTest, setSelectedFunctionalTest] = useState(functionalTestData[0].name);
  const [functionalQuizIndex, setFunctionalQuizIndex] = useState(0);
  const [functionalQuizAnswer, setFunctionalQuizAnswer] = useState('');
  const [isomerFormula, setIsomerFormula] = useState('C4H10');
  const [reactivityMetal, setReactivityMetal] = useState('Zn');
  const [reactivitySalt, setReactivitySalt] = useState('CuSO4');
  const [reactivityMode, setReactivityMode] = useState('salt');
  const [quantumN, setQuantumN] = useState(2);
  const [quantumL, setQuantumL] = useState(1);
  const [quantumMl, setQuantumMl] = useState(0);
  const [quantumMs, setQuantumMs] = useState('1/2');
  const [deBroglieMass, setDeBroglieMass] = useState(9.11e-31);
  const [deBroglieVelocity, setDeBroglieVelocity] = useState(2.2e6);
  const [uncertaintyDx, setUncertaintyDx] = useState(1e-10);
  const [photoFrequency, setPhotoFrequency] = useState(8e14);
  const [photoWorkFunction, setPhotoWorkFunction] = useState(2.3);
  const [gibbsDeltaH, setGibbsDeltaH] = useState(-40);
  const [gibbsDeltaS, setGibbsDeltaS] = useState(-80);
  const [gibbsTemp, setGibbsTemp] = useState(298);
  const [kirchhoffH1, setKirchhoffH1] = useState(-100);
  const [kirchhoffT1, setKirchhoffT1] = useState(298);
  const [kirchhoffT2, setKirchhoffT2] = useState(500);
  const [kirchhoffCp, setKirchhoffCp] = useState(24);
  const [environmentTab, setEnvironmentTab] = useState('Atmosphere');
  const [cftGeometry, setCftGeometry] = useState('Octahedral');
  const [cftElectrons, setCftElectrons] = useState(6);
  const [cftField, setCftField] = useState('strong');
  const [cftDelta, setCftDelta] = useState(2.1);
  const [metallurgyMetal, setMetallurgyMetal] = useState('Fe');
  const [metallurgyStep, setMetallurgyStep] = useState(0);
  const [saltAnalysisSample, setSaltAnalysisSample] = useState('NaCl');
  const [pblockGroup, setPblockGroup] = useState('Group 15');
  const [bioMedicalStage, setBioMedicalStage] = useState(0);
  const [language, setLanguage] = useLocalStorage('cu-language', 'en');
  const [teacherMode, setTeacherMode] = useLocalStorage('cu-teacher-mode', false);
  const [savedFilters, setSavedFilters] = useLocalStorage('cu-saved-filters', []);
  const [achievements, setAchievements] = useLocalStorage('cu-achievements', ['Explorer']);
  const [conceptQuestion, setConceptQuestion] = useState('Why does electronegativity increase across a period?');
  const [guidedMode, setGuidedMode] = useLocalStorage('cu-lab-guided-mode', true);
  const [learningMode, setLearningMode] = useLocalStorage('cu-lab-learning-mode', true);
  const [completedExperiments, setCompletedExperiments] = useLocalStorage('cu-lab-completed', []);
  const [activeLabTab, setActiveLabTab] = useState('Start Here');
  const [activeFocusTopic, setActiveFocusTopic] = useState(initialFocusTopic || 'all');
  const [labSearch, setLabSearch] = useState('');
  const [showLabSearchSuggestions, setShowLabSearchSuggestions] = useState(false);
  const [labTypeFilter, setLabTypeFilter] = useState('All');
  const [labDifficultyFilter, setLabDifficultyFilter] = useState('All');
  const [activeExperimentId, setActiveExperimentId] = useState(initialExperimentId || 'titration');
  const [showAdvancedLab, setShowAdvancedLab] = useState(false);
  const [focusLab, setFocusLab] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [studentPractice, setStudentPractice] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [activeSyllabusFilter, setActiveSyllabusFilter] = useState('all');
  const [completedSteps, setCompletedSteps] = useLocalStorage('cu-lab-step-checks', {});
  const [labNotes, setLabNotes] = useLocalStorage('cu-lab-notes', {});
  const [compareSnapshots, setCompareSnapshots] = useLocalStorage('cu-lab-compare-snapshots', {});
  const [bookmarkedLabs, setBookmarkedLabs] = useLocalStorage('cu-lab-bookmarks', []);
  const [recentLabIds, setRecentLabIds] = useLocalStorage('cu-lab-recent', []);
  const [lastExampleChips, setLastExampleChips] = useLocalStorage('cu-lab-last-examples', []);
  const [showTheoryDetails, setShowTheoryDetails] = useLocalStorage('cu-lab-theory-open', true);
  const [showFormulaDetails, setShowFormulaDetails] = useLocalStorage('cu-lab-formula-open', true);
  const [copiedLabAction, setCopiedLabAction] = useState('');
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

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
  const formulaSuggestions = useMemo(() => {
    const query = normalizeFormulaText(formulaInput).toLowerCase();
    if (!query) return [];
    return ALL_MOLECULES
      .filter(molecule => normalizeFormulaText(molecule.formula).toLowerCase().startsWith(query))
      .slice(0, 6);
  }, [formulaInput]);
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
  const electrochemicalCell = buildElectrochemicalCell(anodeHalf, cathodeHalf, cellMode);
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
  const hessResult = calculateReactionEnthalpy(hessEquation);
  const boilingElevation = 0.512 * molality;
  const freezingDepression = 1.86 * molality;
  const selectedUnitCell = unitCellData[unitCellType];
  const unitCellAcm = unitCellA * 1e-10;
  const unitCellCalculatedZ = (unitCellDensity * AVOGADRO * (unitCellAcm ** 3)) / Math.max(0.0001, unitCellMolarMass);
  const unitCellCalculatedDensity = (unitCellZInput * unitCellMolarMass) / (AVOGADRO * Math.max(1e-30, unitCellAcm ** 3));
  const goldNumberExample = 10 / 0.2;
  const filteredNamedReactions = namedReactionData.filter(reaction => {
    const query = namedReactionSearch.trim().toLowerCase();
    const matchesQuery = !query || [reaction.name, reaction.equation, reaction.conditions, reaction.mechanism].join(' ').toLowerCase().includes(query);
    const matchesCategory = namedReactionCategory === 'All' || reaction.category === namedReactionCategory;
    const matchesTrack = namedReactionTrack === 'All' || reaction.level.includes(namedReactionTrack);
    return matchesQuery && matchesCategory && matchesTrack;
  });
  const selectedTest = functionalTestData.find(test => test.name === selectedFunctionalTest) || functionalTestData[0];
  const activeFunctionalQuiz = functionalQuizData[functionalQuizIndex % functionalQuizData.length];
  const functionalQuizCorrect = functionalQuizAnswer && functionalQuizAnswer === activeFunctionalQuiz.answer;
  const structuralIsomers = structuralIsomerData[isomerFormula.replace(/\s/g, '')] || [];
  const selectedReactivityMetal = reactivityMetals.find(metal => metal.symbol === reactivityMetal) || reactivityMetals[5];
  const selectedSaltSolution = saltSolutions.find(solution => solution.salt === reactivitySalt) || saltSolutions[2];
  const saltMetal = reactivityMetals.find(metal => metal.symbol === selectedSaltSolution.metal) || reactivityMetals[11];
  const displacementHappens = selectedReactivityMetal.rank > saltMetal.rank;
  const acidReactionHappens = selectedReactivityMetal.rank > (reactivityMetals.find(metal => metal.symbol === 'H')?.rank || 4);
  const waterReactionHappens = ['K', 'Na', 'Ca'].includes(reactivityMetal);
  const reactivityEquation = reactivityMode === 'salt'
    ? displacementHappens
      ? `${reactivityMetal} + ${reactivitySalt} -> ${selectedReactivityMetal.symbol} salt + ${selectedSaltSolution.metal}`
      : `${reactivityMetal} + ${reactivitySalt} -> no reaction`
    : reactivityMode === 'water'
      ? waterReactionHappens ? `${reactivityMetal} + H2O -> ${reactivityMetal}OH / hydroxide + H2` : `${reactivityMetal} + cold water -> no vigorous reaction`
      : acidReactionHappens ? `${reactivityMetal} + dilute HCl -> ${reactivityMetal}Cl salt + H2` : `${reactivityMetal} + dilute HCl -> no reaction`;
  const quantumValid = quantumL >= 0 && quantumL < quantumN && quantumMl >= -quantumL && quantumMl <= quantumL;
  const quantumOrbital = `${quantumN}${quantumOrbitalLetters[quantumL] || '?'}`;
  const subshellCapacity = 2 * (2 * quantumL + 1);
  const deBroglieLambda = PLANCK / Math.max(1e-40, deBroglieMass * deBroglieVelocity);
  const minMomentumUncertainty = PLANCK / (4 * Math.PI * Math.max(1e-30, uncertaintyDx));
  const photoEnergyEv = (PLANCK * photoFrequency) / ELECTRON_VOLT;
  const photoKE = photoEnergyEv - photoWorkFunction;
  const gibbsValue = gibbsDeltaH - gibbsTemp * (gibbsDeltaS / 1000);
  const gibbsK = Math.exp((-gibbsValue * 1000) / (GAS_R * gibbsTemp));
  const gibbsCrossover = gibbsDeltaS === 0 ? null : gibbsDeltaH / (gibbsDeltaS / 1000);
  const kirchhoffH2 = kirchhoffH1 + (kirchhoffCp / 1000) * (kirchhoffT2 - kirchhoffT1);
  const cftFilled = fillCftLevels(cftGeometry, cftElectrons, cftField);
  const cftMoment = Math.sqrt(cftFilled.unpaired * (cftFilled.unpaired + 2));
  const cftWavelength = 1240 / Math.max(0.1, cftDelta);
  const cftAbsorbed = cftWavelength < 450 ? 'violet-blue' : cftWavelength < 500 ? 'blue-green' : cftWavelength < 570 ? 'green-yellow' : cftWavelength < 620 ? 'orange' : 'red';
  const cftComplement = cftWavelength < 450 ? '#facc15' : cftWavelength < 500 ? '#ef4444' : cftWavelength < 570 ? '#a855f7' : cftWavelength < 620 ? '#2563eb' : '#14b8a6';
  const selectedMetallurgy = metallurgyData[metallurgyMetal] || metallurgyData.Fe;
  const activeMetallurgyStep = selectedMetallurgy[metallurgyStep] || selectedMetallurgy[0];

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

  const conceptAnswer = conceptQuestion.toLowerCase().includes('electronegativity')
    ? 'Across a period, nuclear charge rises while shielding changes only modestly, so atoms pull bonding electrons more strongly.'
    : conceptQuestion.toLowerCase().includes('isotope')
    ? 'Isotopes are atoms of the same element with the same proton count but different neutron counts, so their masses differ.'
    : 'Use atomic number for protons, shell data for Bohr-style structure, and category/phase to predict broad behavior.';

  const recommendedPath = LAB_EXPERIMENTS.filter(item => ['titration', 'molar-mass', 'bohr', 'bond-predictor', 'equation-balancer', 'ph-meter'].includes(item.id));
  const labSearchSuggestions = useMemo(() => {
    const query = labSearch.trim().toLowerCase();
    const matches = LAB_EXPERIMENTS
      .filter(item => {
        if (!query) return true;
        return [item.title, item.topic, item.type, item.difficulty, item.teaches].join(' ').toLowerCase().includes(query);
      })
      .slice(0, 8);
    const topics = [...new Set(LAB_EXPERIMENTS.map(item => item.topic))]
      .filter(topic => !query || topic.toLowerCase().includes(query))
      .slice(0, 4);
    return { matches, topics };
  }, [labSearch]);
  const visibleExperiments = LAB_EXPERIMENTS.filter(item => {
    const query = labSearch.trim().toLowerCase();
    const itemTags = getSyllabusTagsForLab(item.id);
    const focusMap = {
      beginner: item.difficulty === 'Beginner',
      matter: itemTags.units.some(unit => ['matter', 'practical'].includes(unit)),
      atoms: itemTags.units.some(unit => ['atoms', 'periodic', 'inorganic'].includes(unit)),
      bonding: itemTags.units.some(unit => ['bonding', 'coordination'].includes(unit)),
      reactions: itemTags.units.some(unit => ['reactions', 'thermo', 'equilibrium', 'electrochem', 'kinetics'].includes(unit)),
      solutions: itemTags.units.some(unit => ['acidBase', 'solutions'].includes(unit)),
      inorganic: itemTags.units.some(unit => ['inorganic', 'coordination', 'periodic', 'atoms'].includes(unit)) || ['salt-analysis', 'pblock-advanced', 'cft', 'metallurgy', 'unit-cell', 'crystal-defects', 'crystal-structure', 'reactivity-series', 'molecule-links'].includes(item.id),
      organic: itemTags.units.some(unit => ['organicBasics', 'organicAdvanced', 'biomolecules'].includes(unit)),
      bio: itemTags.units.includes('biomolecules') || ['enzyme-kinetics', 'amino-acid-pi', 'protein-structure', 'carbohydrate-lab', 'lipid-membrane', 'nucleic-acid-lab', 'vitamin-coenzyme-map', 'metabolism-atp'].includes(item.id),
      pharma: itemTags.units.includes('pharmaceutical') || itemTags.tracks.includes('pharma'),
      medical: itemTags.units.some(unit => ['biomolecules', 'pharmaceutical', 'clinical'].includes(unit)),
      all: true,
    };
    const matchesSearch = !query || [item.title, item.topic, item.type, item.difficulty, item.teaches].join(' ').toLowerCase().includes(query);
    const matchesFocus = activeFocusTopic ? (focusMap[activeFocusTopic] ?? true) : false;
    const matchesTab = activeLabTab === 'Start Here' || item.tab === activeLabTab;
    const matchesType = labTypeFilter === 'All' || item.type === labTypeFilter;
    const matchesDifficulty = labDifficultyFilter === 'All' || item.difficulty === labDifficultyFilter;
    const matchesSyllabus = activeSyllabusFilter === 'all' || itemTags.tracks.includes(activeSyllabusFilter);
    return matchesSearch && matchesFocus && matchesTab && matchesType && matchesDifficulty && matchesSyllabus;
  });
  const activeExperiment = LAB_EXPERIMENTS.find(item => item.id === activeExperimentId) || LAB_EXPERIMENTS[0];
  const ActiveExperimentIcon = activeExperiment.icon;
  const activeSyllabusTags = getSyllabusTagsForLab(activeExperiment.id);
  const activeStepsDone = completedSteps[activeExperiment.id] || [];
  const categoryCompleteCount = activeFocusTopic
    ? visibleExperiments.filter(item => completedExperiments.includes(item.id)).length
    : 0;
  const categoryProgress = visibleExperiments.length ? Math.round((categoryCompleteCount / visibleExperiments.length) * 100) : 0;
  const activeExperimentIndex = LAB_EXPERIMENTS.findIndex(item => item.id === activeExperiment.id);
  const completedCount = LAB_EXPERIMENTS.filter(item => completedExperiments.includes(item.id)).length;
  const progressPercent = Math.round((completedCount / LAB_EXPERIMENTS.length) * 100);
  const isActiveComplete = completedExperiments.includes(activeExperiment.id);
  const recentExperiments = recentLabIds
    .map(id => LAB_EXPERIMENTS.find(item => item.id === id))
    .filter(Boolean)
    .slice(0, 6);
  const bookmarkedExperiments = bookmarkedLabs
    .map(id => LAB_EXPERIMENTS.find(item => item.id === id))
    .filter(Boolean)
    .slice(0, 6);
  const relatedExperiments = LAB_EXPERIMENTS
    .filter(item => item.id !== activeExperiment.id && (item.topic === activeExperiment.topic || item.tab === activeExperiment.tab || item.type === activeExperiment.type))
    .slice(0, 4);
  const filtersActive = Boolean(labSearch || labTypeFilter !== 'All' || labDifficultyFilter !== 'All' || activeSyllabusFilter !== 'all' || (activeFocusTopic && activeFocusTopic !== 'all') || activeLabTab !== 'Start Here');
  const validationMessage = (() => {
    if ((activeExperiment.id === 'molar-mass' || activeExperiment.id === 'formula-builder') && (!formulaInput.trim() || Object.keys(parsed).length === 0)) return 'Enter a valid chemical formula such as H2O or Ca(OH)2.';
    if (activeExperiment.id === 'stoichiometry' && !stoichBalanced.ok) return stoichBalanced.error || 'Enter a valid equation using -> between reactants and products.';
    if (activeExperiment.id === 'gas-law' && (gasP <= 0 || gasV <= 0 || gasT <= 0)) return 'P, V, and T must all be positive.';
    if (activeExperiment.id === 'unit-cell' && (unitCellA <= 0 || unitCellMolarMass <= 0)) return 'Edge length and molar mass must be positive.';
    if (activeExperiment.id === 'quantum-numbers' && !quantumValid) return 'Quantum numbers must satisfy l < n and -l <= ml <= l.';
    if (activeExperiment.id === 'gibbs' && gibbsTemp <= 0) return 'Temperature must be greater than 0 K.';
    return '';
  })();
  useEffect(() => {
    setRecentLabIds(ids => [activeExperiment.id, ...ids.filter(id => id !== activeExperiment.id)].slice(0, 8));
  }, [activeExperiment.id, setRecentLabIds]);
  useEffect(() => {
    const nextFocus = initialFocusTopic || 'all';
    setActiveFocusTopic(nextFocus);
    setActiveLabTab('Start Here');
    const requestedExperiment = initialExperimentId
      ? LAB_EXPERIMENTS.find(item => item.id === initialExperimentId)
      : null;
    if (requestedExperiment) {
      setActiveExperimentId(requestedExperiment.id);
      setActiveLabTab(requestedExperiment.tab);
      return;
    }
    if (nextFocus !== 'all') {
      const nextExperiment = LAB_EXPERIMENTS.find(item => {
        const itemTags = getSyllabusTagsForLab(item.id);
        if (nextFocus === 'inorganic') {
          return itemTags.units.some(unit => ['inorganic', 'coordination', 'periodic', 'atoms'].includes(unit))
            || ['salt-analysis', 'pblock-advanced', 'cft', 'metallurgy', 'unit-cell', 'crystal-defects', 'crystal-structure', 'reactivity-series', 'molecule-links'].includes(item.id);
        }
        if (nextFocus === 'organic') return itemTags.units.some(unit => ['organicBasics', 'organicAdvanced', 'biomolecules'].includes(unit));
        if (nextFocus === 'bio') return itemTags.units.includes('biomolecules');
        if (nextFocus === 'pharma') return itemTags.units.includes('pharmaceutical') || itemTags.tracks.includes('pharma');
        return false;
      });
      if (nextExperiment) setActiveExperimentId(nextExperiment.id);
    }
  }, [initialExperimentId, initialFocusTopic]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      event.preventDefault();
      labSearchRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
  const markActiveComplete = () => {
    setCompletedExperiments(items => items.includes(activeExperiment.id) ? items : [...items, activeExperiment.id]);
  };
  const resetGuidedProgress = () => setCompletedExperiments([]);
  const resetActiveExperiment = () => {
    setExperimentStarted(false);
    setShowQuizAnswer(false);
    setCompletedSteps(items => ({ ...items, [activeExperiment.id]: [] }));
  };
  const clearLabFilters = () => {
    setLabSearch('');
    setLabTypeFilter('All');
    setLabDifficultyFilter('All');
    setActiveSyllabusFilter('all');
    setActiveFocusTopic('all');
    setActiveLabTab('Start Here');
  };
  const toggleBookmark = (id) => {
    setBookmarkedLabs(ids => ids.includes(id) ? ids.filter(item => item !== id) : [id, ...ids].slice(0, 12));
  };
  const toggleStepDone = (stepIndex) => {
    setCompletedSteps(items => {
      const current = items[activeExperiment.id] || [];
      const next = current.includes(stepIndex)
        ? current.filter(index => index !== stepIndex)
        : [...current, stepIndex];
      return { ...items, [activeExperiment.id]: next };
    });
  };
  const activeResultText = () => {
    if (activeExperiment.id === 'titration') return `pH ${simTitration.pH.toFixed(2)} - ${simTitration.region}`;
    if (activeExperiment.id === 'ph-meter') return `${probeSolution}: pH ${probePh.toFixed(1)}`;
    if (activeExperiment.id === 'molar-mass' || activeExperiment.id === 'formula-builder') return `${formulaInput}: ${mass.toFixed(3)} g/mol`;
    if (activeExperiment.id === 'stoichiometry') return stoichBalanced.ok ? stoichBalanced.balanced : stoichBalanced.error;
    if (activeExperiment.id === 'dilution') return `V2 = ${dilutionV2.toFixed(2)} mL`;
    if (activeExperiment.id === 'gas-law') return `n = ${gasN.toFixed(3)} mol`;
    if (activeExperiment.id === 'vsepr') return `${vsepr.shape}, ${geometry.angle}`;
    if (activeExperiment.id === 'rate-lab') return `Rate factor ${rateK.toFixed(2)}`;
    if (activeExperiment.id === 'solubility') return precipitates ? 'Precipitate forms' : 'No precipitate yet';
    return activeExperiment.result;
  };
  const saveSnapshot = (slot) => {
    setCompareSnapshots(items => ({
      ...items,
      [activeExperiment.id]: {
        ...(items[activeExperiment.id] || {}),
        [slot]: {
          result: activeResultText(),
          savedAt: new Date().toLocaleString(),
        },
      },
    }));
  };
  const exportActiveResult = () => {
    const payload = {
      experiment: activeExperiment.title,
      result: activeResultText(),
      notes: labNotes[activeExperiment.id] || '',
      syllabus: activeSyllabusTags.tracks.map(id => syllabusTrackMap[id]?.label).filter(Boolean),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeExperiment.id}-lab-result.json`;
    a.click();
    URL.revokeObjectURL(url);
    showCopiedFeedback('Result exported');
  };
  const showCopiedFeedback = (message) => {
    setCopiedLabAction(message);
    window.setTimeout(() => setCopiedLabAction(''), 1600);
  };
  const shareActiveSetup = () => {
    const url = `${window.location.origin}${window.location.pathname}#lab=${activeExperiment.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showCopiedFeedback('Share link copied');
    }
  };
  const exportActiveVisualization = () => {
    const svg = document.querySelector('[data-active-lab] svg');
    if (!svg) {
      showCopiedFeedback('No visualization to export');
      return;
    }
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeExperiment.id}-visualization.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showCopiedFeedback('Visualization exported');
  };
  const openActiveFullscreen = () => {
    const target = document.querySelector('[data-active-lab] svg') || document.querySelector('[data-active-lab]');
    if (target?.requestFullscreen) target.requestFullscreen();
    else showCopiedFeedback('Fullscreen unavailable');
  };
  const clearCompareSnapshots = () => {
    setCompareSnapshots(items => ({ ...items, [activeExperiment.id]: {} }));
    showCopiedFeedback('Saved graph snapshots cleared');
  };
  const applyActivePreset = (preset) => {
    if (activeExperiment.id === 'titration') setSimTitrationDrops(preset === 'acidic' ? 10 : preset === 'neutral' ? 500 : 900);
    else if (activeExperiment.id === 'ph-meter') setProbeSolution(preset === 'acidic' ? 'vinegar' : preset === 'basic' ? 'ammonia' : 'water');
    else if (activeExperiment.id === 'rate-lab') {
      setRateTemp(preset === 'fast' ? 75 : 20);
      setRateConc(preset === 'fast' ? 2.6 : 0.4);
    } else if (activeExperiment.id === 'solubility') setSaltAdded(preset === 'fast' ? 0.009 : 0.001);
  };
  const applyExampleValues = () => {
    const id = activeExperiment.id;
    if (id === 'molar-mass' || id === 'formula-builder') setFormulaInput('H2SO4');
    else if (id === 'stoichiometry') setStoichEquation('N2 + H2 -> NH3');
    else if (id === 'gas-law') { setGasP(1); setGasV(22.4); setGasT(273.15); }
    else if (id === 'weak-acid-ph') setKa(1.8e-5);
    else if (id === 'unit-cell') { setUnitCellType('FCC'); setUnitCellA(361); setUnitCellDensity(8.96); setUnitCellMolarMass(63.55); setUnitCellZInput(4); }
    else if (id === 'quantum-numbers') { setQuantumN(3); setQuantumL(2); setQuantumMl(0); setQuantumMs('1/2'); }
    else if (id === 'gibbs') { setGibbsDeltaH(40); setGibbsDeltaS(120); setGibbsTemp(500); }
    else if (id === 'cft') { setCftGeometry('Octahedral'); setCftElectrons(6); setCftField('strong'); }
    else applyActivePreset('neutral');
    const label = `${activeExperiment.title}: example`;
    setLastExampleChips(items => [label, ...items.filter(item => item !== label)].slice(0, 6));
  };
  const tryRandomExample = () => {
    const options = [
      () => { setActiveExperimentId('molar-mass'); setFormulaInput(['H2O', 'Ca(OH)2', 'Al2(SO4)3', 'C6H12O6'][Math.floor(Math.random() * 4)]); },
      () => { setActiveExperimentId('gas-law'); setGasP(Number((0.8 + Math.random() * 2).toFixed(2))); setGasV(Number((5 + Math.random() * 25).toFixed(1))); setGasT(Math.round(250 + Math.random() * 250)); },
      () => { setActiveExperimentId('gibbs'); setGibbsDeltaH(Math.round(-80 + Math.random() * 180)); setGibbsDeltaS(Math.round(-120 + Math.random() * 260)); setGibbsTemp(Math.round(250 + Math.random() * 900)); },
      () => { setActiveExperimentId('quantum-numbers'); const n = 1 + Math.floor(Math.random() * 4); const l = Math.floor(Math.random() * n); setQuantumN(n); setQuantumL(l); setQuantumMl(Math.floor(Math.random() * (2 * l + 1)) - l); },
    ];
    options[Math.floor(Math.random() * options.length)]();
    setActiveFocusTopic('all');
    setActiveLabTab('Start Here');
    setExperimentStarted(true);
    setLastExampleChips(items => ['Random example', ...items.filter(item => item !== 'Random example')].slice(0, 6));
  };
  const moveExperiment = (direction) => {
    const nextIndex = (activeExperimentIndex + direction + LAB_EXPERIMENTS.length) % LAB_EXPERIMENTS.length;
    setActiveExperimentId(LAB_EXPERIMENTS[nextIndex].id);
    setActiveLabTab(LAB_EXPERIMENTS[nextIndex].tab);
  };
  const selectFocusTopic = (topicId) => {
    setActiveFocusTopic(topicId);
    setActiveLabTab('Start Here');
    const nextExperiment = LAB_EXPERIMENTS.find(item => {
      const itemTags = getSyllabusTagsForLab(item.id);
      if (topicId === 'all') return true;
      if (topicId === 'beginner') return item.difficulty === 'Beginner';
      const topicUnits = {
        matter: ['matter', 'practical'],
        atoms: ['atoms', 'periodic', 'inorganic'],
        bonding: ['bonding', 'coordination'],
        reactions: ['reactions', 'thermo', 'equilibrium', 'electrochem', 'kinetics'],
        solutions: ['acidBase', 'solutions'],
        inorganic: ['inorganic', 'coordination', 'periodic', 'atoms'],
        organic: ['organicBasics', 'organicAdvanced', 'biomolecules'],
        bio: ['biomolecules'],
        pharma: ['pharmaceutical'],
        medical: ['biomolecules', 'pharmaceutical', 'clinical'],
      }[topicId] || [];
      return itemTags.units.some(unit => topicUnits.includes(unit))
        || (topicId === 'inorganic' && ['salt-analysis', 'pblock-advanced', 'cft', 'metallurgy', 'unit-cell', 'crystal-defects', 'crystal-structure', 'reactivity-series', 'molecule-links'].includes(item.id));
    });
    if (nextExperiment) setActiveExperimentId(nextExperiment.id);
    setExperimentStarted(false);
  };
  const activeFocusInfo = labFocusTopics.find(topic => topic.id === activeFocusTopic);
  const activeRoadmap = appliedChemistryRoadmaps[activeFocusTopic];
  const showFullLab = !guidedMode || showAdvancedLab;
  const renderGuidedWorkbench = () => {
    const LazyTool = lazyLabTools[activeExperiment.id];
    if (LazyTool) {
      const lazyToolProps = {
        activeExperiment,
        title: activeExperiment.title,
        simTitration,
        simTitrationDrops,
        setSimTitrationDrops,
        probeSolution,
        setProbeSolution,
        probePh,
        gasP,
        gasV,
        gasT,
        setGasP,
        setGasV,
        setGasT,
        gasN,
        formulaInput,
        setFormulaInput,
        formulaSuggestions,
        parsed,
        mass,
        hessEquation,
        setHessEquation,
        hessResult,
        corrosion,
        anodeHalf,
        cathodeHalf,
        setAnodeHalf,
        setCathodeHalf,
        cellMode,
        setCellMode,
        electrochemicalCell,
      };
      return (
        <Suspense fallback={
          <Bench title={activeExperiment.title} result="Loading tool module...">
            <div className="space-y-3">
              <div className="h-8 rounded-xl bg-white/[0.06] animate-pulse" />
              <div className="grid sm:grid-cols-3 gap-2">
                <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          </Bench>
        }>
          <LazyTool {...lazyToolProps} />
        </Suspense>
      );
    }
    switch (activeExperiment.id) {
      case 'titration':
        return (
          <Bench title="Titration Simulator" result={`pH ${simTitration.pH.toFixed(2)} - ${simTitration.region}`}>
            <ControlLabel>NaOH drops: {simTitrationDrops}</ControlLabel>
            <input type="range" min="0" max="1000" value={simTitrationDrops} onChange={e => setSimTitrationDrops(Number(e.target.value))} className="w-full" />
            <div className="mt-4 h-36 rounded-xl border border-white/10 flex items-end overflow-hidden bg-white/[0.04]">
              <div className="w-full transition-all" style={{ height: `${Math.min(100, 25 + simTitrationDrops / 10)}%`, background: simTitration.pH < 7 ? '#ef4444' : simTitration.pH < 9 ? '#22c55e' : '#ec4899' }} />
            </div>
          </Bench>
        );
      case 'electrolysis':
        return (
          <Bench title="Electrolysis Cell" result={`${electrolysis.cathode}; ${electrolysis.anode}`}>
            <ControlLabel>Electrolyte</ControlLabel>
            <select value={electrolyte} onChange={e => setElectrolyte(e.target.value)} className="input text-sm mb-4">{['CuSO4', 'NaCl(aq)', 'H2O + acid'].map(e => <option key={e}>{e}</option>)}</select>
            <div className="h-40 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
              <span className="absolute left-12 top-5 bottom-5 w-4 rounded bg-slate-300" />
              <span className="absolute right-12 top-5 bottom-5 w-4 rounded bg-slate-300" />
              {Array.from({ length: 24 }, (_, i) => <span key={i} className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-pulse" style={{ left: `${15 + (i % 8) * 9}%`, top: `${20 + Math.floor(i / 8) * 22}%` }} />)}
            </div>
          </Bench>
        );
      case 'distillation':
        return (
          <Bench title="Distillation Apparatus" result={distillHeat > 78 ? 'Ethanol-rich vapor condenses into the collector.' : 'Heat is still below the strong boiling range.'}>
            <ControlLabel>Heating: {distillHeat}%</ControlLabel>
            <input type="range" min="0" max="100" value={distillHeat} onChange={e => setDistillHeat(Number(e.target.value))} className="w-full" />
            <div className="h-40 rounded-xl bg-black/20 border border-white/10 relative mt-4">
              <span className="absolute left-10 bottom-6 w-20 h-20 rounded-b-3xl border border-cyan-300/30 bg-cyan-500/10" />
              <span className="absolute left-28 top-16 right-24 h-3 bg-slate-400 rounded" />
              <span className="absolute right-12 bottom-6 w-14 h-16 rounded-b-xl border border-white/20 bg-white/[0.04]" />
              {distillHeat > 45 && <span className="absolute left-32 top-14 right-20 border-t border-dashed border-cyan-300 animate-pulse" />}
            </div>
          </Bench>
        );
      case 'chromatography':
        return (
          <Bench title="Chromatography" result="Bands separate because each substance has a different attraction to the paper and solvent.">
            <ControlLabel>Run time: {chromTime}%</ControlLabel>
            <input type="range" min="0" max="100" value={chromTime} onChange={e => setChromTime(Number(e.target.value))} className="w-full" />
            <div className="h-44 rounded-xl bg-yellow-50/90 border border-white/10 relative mt-4">
              {['#ef4444', '#22c55e', '#3b82f6'].map((color, i) => <span key={color} className="absolute left-1/2 -translate-x-1/2 w-28 h-3 rounded-full" style={{ background: color, bottom: `${12 + chromTime * (0.25 + i * 0.12)}%` }} />)}
              <span className="absolute left-8 right-8 bottom-5 border-t border-gray-500/40" />
            </div>
          </Bench>
        );
      case 'spectroscopy':
        return (
          <Bench title="Spectroscopy Viewer" result={`Visible emission lines for ${selectedSymbol}.`}>
            <ControlLabel>Element</ControlLabel>
            <ElementSearchInput value={selectedSymbol} onChange={setSelectedSymbol} allowedSymbols={['H', 'He', 'Li', 'Na', 'K', 'Ca', 'Cu']} className="mb-4" />
            <div className="h-28 rounded-xl bg-gradient-to-r from-violet-700 via-green-500 to-red-600 border border-white/10 relative overflow-hidden">
              {(spectrumLines[selectedSymbol] || [486, 656]).map(nm => <span key={nm} className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_white]" style={{ left: `${((nm - 380) / 370) * 100}%` }} />)}
            </div>
          </Bench>
        );
      case 'ph-meter':
        return (
          <Bench title="pH Meter" result={`${probeSolution} is ${probePh < 7 ? 'acidic' : probePh > 7 ? 'basic' : 'neutral'}.`}>
            <ControlLabel>Test solution</ControlLabel>
            <select value={probeSolution} onChange={e => setProbeSolution(e.target.value)} className="input text-sm mb-4">{['water', 'vinegar', 'ammonia', 'cola', 'soap'].map(s => <option key={s}>{s}</option>)}</select>
            <div className="text-5xl font-black text-white">pH {probePh.toFixed(1)}</div>
            <MiniBar label="acid to base" value={(probePh / 14) * 100} color={probePh < 7 ? '#ef4444' : probePh > 7 ? '#3b82f6' : '#22c55e'} />
          </Bench>
        );
      case 'electrochemical-cell':
      case 'corrosion':
        return (
          <Bench title={activeExperiment.title} result={activeExperiment.id === 'corrosion' ? `${corrosion} corrodes preferentially in this pair.` : `EMF is ${electrochemicalCell.emf.toFixed(2)} V.`}>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div><ControlLabel>Anode oxidation partner</ControlLabel><select value={anodeHalf} onChange={e => setAnodeHalf(e.target.value)} className="input text-sm">{Object.keys(halfReactions).map(x => <option key={x}>{x}</option>)}</select></div>
              <div><ControlLabel>Cathode reduction</ControlLabel><select value={cathodeHalf} onChange={e => setCathodeHalf(e.target.value)} className="input text-sm">{Object.keys(halfReactions).map(x => <option key={x}>{x}</option>)}</select></div>
            </div>
            <select value={cellMode} onChange={e => setCellMode(e.target.value)} className="input text-sm mb-4">
              <option value="galvanic">Galvanic</option>
              <option value="electrolytic">Electrolytic</option>
            </select>
            <div className="h-36 rounded-xl bg-black/20 border border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
              <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">{anodeHalf}<br /><span className="text-[10px] text-gray-500">anode</span></span>
              <span className="text-cyan-300 font-mono text-xl">{electrochemicalCell.emf.toFixed(2)} V</span>
              <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">{cathodeHalf}<br /><span className="text-[10px] text-gray-500">cathode</span></span>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">Anode: {electrochemicalCell.anode.species}</div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">Cathode: {electrochemicalCell.cathode.species}</div>
            </div>
            <p className="mt-2 text-xs text-gray-400">Cell diagram: <span className="font-mono text-gray-200">{electrochemicalCell.cellDiagram}</span></p>
            <p className={`mt-1 text-xs ${electrochemicalCell.spontaneous ? 'text-emerald-300' : 'text-amber-300'}`}>{electrochemicalCell.spontaneous ? 'Spontaneous under selected mode.' : 'Requires external energy in selected mode.'}</p>
          </Bench>
        );
      case 'equilibrium':
        return (
          <Bench title="Le Chatelier Equilibrium" result={`The system ${eqShift}.`}>
            <ControlLabel>Reactant level {eqReactant.toFixed(1)}x</ControlLabel>
            <input type="range" min="0.2" max="3" step="0.1" value={eqReactant} onChange={e => setEqReactant(Number(e.target.value))} className="w-full mb-3" />
            <ControlLabel>Temperature {eqTemp} C</ControlLabel>
            <input type="range" min="0" max="100" value={eqTemp} onChange={e => setEqTemp(Number(e.target.value))} className="w-full" />
            <div className="mt-4 text-center text-xl text-white font-mono">N2O4 ⇌ 2NO2</div>
          </Bench>
        );
      case 'osmosis':
        return (
          <Bench title="Osmosis Demo" result={osmoticFlow}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><ControlLabel>Left {osmosisLeft} M</ControlLabel><input type="range" min="0" max="2" step="0.1" value={osmosisLeft} onChange={e => setOsmosisLeft(Number(e.target.value))} className="w-full" /></div>
              <div><ControlLabel>Right {osmosisRight} M</ControlLabel><input type="range" min="0" max="2" step="0.1" value={osmosisRight} onChange={e => setOsmosisRight(Number(e.target.value))} className="w-full" /></div>
            </div>
            <div className="h-28 rounded-xl bg-blue-500/10 border border-blue-400/20 mt-4 grid grid-cols-2 divide-x divide-dashed divide-white/30">
              <div className="flex items-center justify-center text-gray-200">Left solution</div>
              <div className="flex items-center justify-center text-gray-200">Right solution</div>
            </div>
          </Bench>
        );
      case 'flame-test':
        return (
          <Bench title="Flame Test" result={`${flameElement} produces its characteristic flame color.`}>
            <ControlLabel>Metal ion</ControlLabel>
            <ElementSearchInput value={flameElement} onChange={setFlameElement} allowedSymbols={Object.keys(flameColors)} className="mb-4" placeholder="Search available metal ions" />
            <div className="h-40 rounded-xl bg-black border border-white/10 flex items-end justify-center overflow-hidden">
              <div className="w-32 h-32 rounded-t-full blur-sm" style={{ background: flameColors[flameElement], boxShadow: `0 0 50px ${flameColors[flameElement]}` }} />
            </div>
          </Bench>
        );
      case 'molar-mass':
      case 'formula-builder':
        return (
          <Bench title={activeExperiment.title} result={`Molar mass = ${mass.toFixed(3)} g/mol`}>
            <ControlLabel>Formula</ControlLabel>
            <input value={formulaInput} onChange={e => setFormulaInput(e.target.value)} className="input text-sm mb-3" />
            {formulaSuggestions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {formulaSuggestions.map(molecule => (
                  <button
                    key={molecule.name}
                    onClick={() => setFormulaInput(normalizeFormulaText(molecule.formula))}
                    className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100"
                  >
                    {molecule.name} ({normalizeFormulaText(molecule.formula)})
                  </button>
                ))}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500 uppercase">Atoms</p><p className="text-sm text-gray-200 font-mono mt-1">{Object.entries(parsed).map(([s, n]) => `${s}:${n}`).join('  ') || 'None'}</p></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500 uppercase">Molar mass</p><p className="text-2xl font-black text-white">{mass.toFixed(3)}</p></div>
            </div>
          </Bench>
        );
      case 'stoichiometry':
        return (
          <Bench title="Stoichiometry Solver" result={stoichBalanced.ok ? stoichBalanced.balanced : stoichBalanced.error}>
            <ControlLabel>Equation</ControlLabel>
            <input value={stoichEquation} onChange={e => setStoichEquation(e.target.value)} className="input text-sm mb-3" />
            <ControlLabel>Starting moles</ControlLabel>
            <input type="number" value={stoichMoles} onChange={e => setStoichMoles(Number(e.target.value))} className="input text-sm" />
          </Bench>
        );
      case 'dilution':
        return (
          <Bench title="Molarity / Dilution Calculator" result={`Required final volume V2 = ${dilutionV2.toFixed(2)} mL`}>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><ControlLabel>C1</ControlLabel><input type="number" value={c1} onChange={e => setC1(Number(e.target.value))} className="input text-sm" /></div>
              <div><ControlLabel>V1</ControlLabel><input type="number" value={v1} onChange={e => setV1(Number(e.target.value))} className="input text-sm" /></div>
              <div><ControlLabel>C2</ControlLabel><input type="number" value={c2} onChange={e => setC2(Number(e.target.value))} className="input text-sm" /></div>
            </div>
          </Bench>
        );
      case 'weak-acid-ph':
        return (
          <Bench title="pH / pOH Calculator" result={`pH ${weakAcidPh.toFixed(2)}; pOH ${(14 - weakAcidPh).toFixed(2)}`}>
            <ControlLabel>Ka</ControlLabel>
            <input type="number" value={ka} onChange={e => setKa(Number(e.target.value))} className="input text-sm" />
          </Bench>
        );
      case 'gas-law':
        return (
          <Bench title="Ideal Gas Law Calculator" result={`n = ${gasN.toFixed(3)} mol`}>
            <div className="grid sm:grid-cols-3 gap-3">
              <div><ControlLabel>P atm</ControlLabel><input type="number" value={gasP} onChange={e => setGasP(Number(e.target.value))} className="input text-sm" /></div>
              <div><ControlLabel>V L</ControlLabel><input type="number" value={gasV} onChange={e => setGasV(Number(e.target.value))} className="input text-sm" /></div>
              <div><ControlLabel>T K</ControlLabel><input type="number" value={gasT} onChange={e => setGasT(Number(e.target.value))} className="input text-sm" /></div>
            </div>
          </Bench>
        );
      case 'empirical-formula':
        return (
          <Bench title="Empirical Formula Finder" result={`Empirical formula: ${empiricalFormula(empRows)}`}>
            {empRows.map((row, i) => <div key={i} className="grid grid-cols-2 gap-2 mb-2"><input value={row.symbol} onChange={e => setEmpRows(rows => rows.map((r, idx) => idx === i ? { ...r, symbol: e.target.value } : r))} className="input text-sm" /><input type="number" value={row.percent} onChange={e => setEmpRows(rows => rows.map((r, idx) => idx === i ? { ...r, percent: Number(e.target.value) } : r))} className="input text-sm" /></div>)}
          </Bench>
        );
      case 'oxidation':
        return (
          <Bench title="Oxidation State Finder" result={oxidationGuess(oxidFormula)}>
            <ControlLabel>Formula</ControlLabel>
            <input value={oxidFormula} onChange={e => setOxidFormula(e.target.value)} className="input text-sm" />
          </Bench>
        );
      case 'electron-config-tool':
        return (
          <Bench title="Electron Configuration Builder" result={`${configElement.name}: ${configElement.electronConfiguration}`}>
            <ControlLabel>Atomic number</ControlLabel>
            <input type="number" min="1" max="118" value={configAtomicNumber} onChange={e => setConfigAtomicNumber(Number(e.target.value))} className="input text-sm mb-3" />
            <div className="flex flex-wrap gap-1">{configFill.map(part => <span key={part.raw} className="px-2 py-1 rounded bg-white/[0.06] text-xs">{part.raw}</span>)}</div>
          </Bench>
        );
      case 'hess':
        return (
          <Bench title="Reaction Enthalpy" result={hessResult.ok ? `Delta H = ${hessResult.deltaH.toFixed(1)} kJ` : hessResult.error}>
            <ControlLabel>Balanced or unbalanced equation</ControlLabel>
            <input value={hessEquation} onChange={e => setHessEquation(e.target.value)} className="input text-sm font-mono mb-3" />
            {hessResult.ok ? (
              <>
                <p className="text-xs text-gray-300 mb-3">Balanced: <span className="font-mono text-cyan-200">{hessResult.balanced}</span></p>
                <div className="grid sm:grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Reactants</p><p className="text-lg font-black text-white">{hessResult.reactants.toFixed(1)}</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Products</p><p className="text-lg font-black text-white">{hessResult.products.toFixed(1)}</p></div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3"><p className="text-[10px] text-cyan-300">Delta H</p><p className="text-lg font-black text-white">{hessResult.deltaH.toFixed(1)} kJ</p></div>
                </div>
                <svg viewBox="0 0 260 120" className="w-full h-40 rounded-xl bg-black/20 border border-white/10">
                  <line x1="30" y1={hessResult.deltaH < 0 ? 35 : 85} x2="105" y2={hessResult.deltaH < 0 ? 35 : 85} stroke="#38bdf8" strokeWidth="4" />
                  <line x1="155" y1={hessResult.deltaH < 0 ? 85 : 35} x2="230" y2={hessResult.deltaH < 0 ? 85 : 35} stroke="#34d399" strokeWidth="4" />
                  <path d={`M105 ${hessResult.deltaH < 0 ? 35 : 85} C125 15, 135 15, 155 ${hessResult.deltaH < 0 ? 85 : 35}`} fill="none" stroke="#f59e0b" strokeWidth="3" />
                  <text x="30" y="108" fill="#94a3b8" fontSize="10">Reactants</text>
                  <text x="170" y="108" fill="#94a3b8" fontSize="10">Products</text>
                </svg>
              </>
            ) : (
              <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-xs text-amber-100">
                {hessResult.error}. Loaded values include {Object.keys(standardFormationEnthalpies).slice(0, 10).join(', ')} and more.
              </div>
            )}
          </Bench>
        );
      case 'colligative':
        return (
          <Bench title="Colligative Properties" result={`Boiling elevation ${boilingElevation.toFixed(2)} C; freezing depression ${freezingDepression.toFixed(2)} C`}>
            <ControlLabel>Molality {molality} m</ControlLabel>
            <input type="range" min="0" max="5" step="0.1" value={molality} onChange={e => setMolality(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'adsorption':
        return (
          <Bench title="Adsorption Isotherms Lab" result={`Freundlich: x/m = ${freundlichK.toFixed(1)}P^(1/${freundlichN.toFixed(1)}); Langmuir: x/m = ${langmuirA.toFixed(1)}P/(1+${langmuirB.toFixed(1)}P)`}>
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
              <div>
                <IsothermPlot freundlichK={freundlichK} freundlichN={freundlichN} langmuirA={langmuirA} langmuirB={langmuirB} />
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div><ControlLabel>Freundlich k {freundlichK.toFixed(1)}</ControlLabel><input type="range" min="0.2" max="4" step="0.1" value={freundlichK} onChange={e => setFreundlichK(Number(e.target.value))} className="w-full" /></div>
                  <div><ControlLabel>Freundlich n {freundlichN.toFixed(1)}</ControlLabel><input type="range" min="1" max="5" step="0.1" value={freundlichN} onChange={e => setFreundlichN(Number(e.target.value))} className="w-full" /></div>
                  <div><ControlLabel>Langmuir a {langmuirA.toFixed(1)}</ControlLabel><input type="range" min="0.5" max="8" step="0.1" value={langmuirA} onChange={e => setLangmuirA(Number(e.target.value))} className="w-full" /></div>
                  <div><ControlLabel>Langmuir b {langmuirB.toFixed(1)}</ControlLabel><input type="range" min="0.1" max="3" step="0.1" value={langmuirB} onChange={e => setLangmuirB(Number(e.target.value))} className="w-full" /></div>
                </div>
              </div>
              <div className="space-y-3">
                <select value={adsorptionMode} onChange={e => setAdsorptionMode(e.target.value)} className="input text-sm">
                  <option value="physisorption">Physisorption</option>
                  <option value="chemisorption">Chemisorption</option>
                </select>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  {adsorptionMode === 'physisorption'
                    ? 'Physisorption: weak van der Waals forces, low heat of adsorption, reversible, multilayer possible, favored at low temperature.'
                    : 'Chemisorption: chemical bond formation, high heat of adsorption, often specific and monolayer, may need activation energy.'}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3"><p className="font-bold text-cyan-200">Lyophilic colloids</p><p className="text-gray-400 mt-1">Solvent loving; starch, gelatin, gum. More stable.</p></div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3"><p className="font-bold text-amber-200">Lyophobic colloids</p><p className="text-gray-400 mt-1">Solvent hating; gold sol, sulfur sol. Easily coagulated.</p></div>
                </div>
                <svg viewBox="0 0 220 70" className="w-full h-24 rounded-xl bg-black/20 border border-white/10">
                  <line x1="12" y1="35" x2="208" y2="35" stroke="#38bdf8" strokeWidth="3" opacity="0.8" />
                  {Array.from({ length: 18 }, (_, i) => <circle key={i} cx={22 + i * 10} cy={28 + (i % 4) * 4} r="2" fill="#fbbf24" />)}
                  <text x="14" y="62" fill="#94a3b8" fontSize="8">Tyndall effect: light path visible due to scattering by colloidal particles</text>
                </svg>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  <p><span className="text-cyan-300 font-semibold">Hardy-Schulze rule:</span> higher counter-ion valency causes stronger coagulation.</p>
                  <p className="mt-1"><span className="text-emerald-300 font-semibold">Gold number:</span> mg of protective colloid needed to prevent coagulation of 10 mL gold sol by 1 mL 10% NaCl. Example: 10 mg / 0.2 mg = protection ratio {goldNumberExample.toFixed(0)}.</p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'orbital-shape':
        return (
          <Bench title="Orbital Shape Viewer" result={orbital.note}>
            <ControlLabel>Orbital</ControlLabel>
            <select value={orbitalType} onChange={e => setOrbitalType(e.target.value)} className="input text-sm mb-4">{Object.keys(orbitalMeta).map(type => <option key={type}>{type}</option>)}</select>
            <div className="h-40 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
              {Array.from({ length: orbital.lobes }, (_, i) => <span key={i} className="absolute w-20 h-12 rounded-[50%] opacity-80" style={{ background: i % 2 ? '#ef4444' : '#38bdf8', transform: `rotate(${(360 / orbital.lobes) * i}deg) translateX(${orbitalType === 's' ? 0 : 32}px)` }} />)}
              <span className="absolute w-5 h-5 rounded-full bg-white" />
            </div>
          </Bench>
        );
      case 'hybridization':
        return (
          <Bench title="Hybridization Animator" result={`${hybrid} hybrid orbitals are shown in the model.`}>
            <ControlLabel>Hybridization</ControlLabel>
            <select value={hybrid} onChange={e => setHybrid(e.target.value)} className="input text-sm mb-4">{['sp', 'sp2', 'sp3', 'dsp2', 'sp3d'].map(h => <option key={h}>{h}</option>)}</select>
            <div className="h-44 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-2">
              {Array.from({ length: hybrid === 'sp' ? 2 : hybrid === 'sp2' ? 3 : hybrid === 'sp3' ? 4 : 5 }, (_, i) => <span key={i} className="w-12 h-20 rounded-[50%] bg-gradient-to-b from-pink-400 to-indigo-500 opacity-75" style={{ transform: `rotate(${i * (180 / (hybrid === 'sp' ? 1 : 4))}deg)` }} />)}
            </div>
          </Bench>
        );
      case 'vsepr':
        return (
          <Bench title="VSEPR Shape Builder" result={`${vsepr.shape}; angle ${geometry.angle}`}>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div><ControlLabel>Bonded atoms: {bondedAtoms}</ControlLabel><input type="range" min="1" max="6" value={bondedAtoms} onChange={e => setBondedAtoms(Number(e.target.value))} className="w-full" /></div>
              <div><ControlLabel>Lone pairs: {lonePairs}</ControlLabel><input type="range" min="0" max="3" value={lonePairs} onChange={e => setLonePairs(Number(e.target.value))} className="w-full" /></div>
            </div>
            <svg viewBox="0 0 100 100" className="w-full h-44 rounded-xl bg-black/20 border border-white/10">
              {geometry.points.slice(1).map((point, i) => <line key={i} x1={geometry.points[0][0]} y1={geometry.points[0][1]} x2={point[0]} y2={point[1]} stroke="#94a3b8" strokeWidth="2" />)}
              {geometry.points.map((point, i) => <circle key={i} cx={point[0]} cy={point[1]} r={i === 0 ? 7 : 5} fill={i === 0 ? '#38bdf8' : '#a78bfa'} />)}
            </svg>
          </Bench>
        );
      case 'bond-polarity':
      case 'bond-predictor':
        return (
          <Bench title={activeExperiment.title} result={`${polarity.type}: ${polarity.note}`}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div><ControlLabel>Element A</ControlLabel><ElementSearchInput value={polarityA} onChange={setPolarityA} /></div>
              <div><ControlLabel>Element B</ControlLabel><ElementSearchInput value={polarityB} onChange={setPolarityB} /></div>
            </div>
          </Bench>
        );
      case 'mechanism':
        return (
          <Bench title="Reaction Mechanism Player" result={mechanismSteps[Math.min(mechanismStep - 1, mechanismSteps.length - 1)]}>
            <ControlLabel>Mechanism</ControlLabel>
            <select value={mechanism} onChange={e => setMechanism(e.target.value)} className="input text-sm mb-3">{Object.keys(mechanismData).map(m => <option key={m}>{m}</option>)}</select>
            <ControlLabel>Step {mechanismStep}</ControlLabel>
            <input type="range" min="1" max={mechanismSteps.length} value={mechanismStep} onChange={e => setMechanismStep(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'imf':
        return (
          <Bench title="Intermolecular Forces Demo" result={`${imfType} affects melting point, boiling point, and solubility.`}>
            <ControlLabel>Force type</ControlLabel>
            <select value={imfType} onChange={e => setImfType(e.target.value)} className="input text-sm">{['London dispersion', 'dipole-dipole', 'hydrogen bonding', 'ion-dipole'].map(type => <option key={type}>{type}</option>)}</select>
          </Bench>
        );
      case 'nuclear-decay':
      case 'isotopes':
        return (
          <Bench title={activeExperiment.title} result={`${decayRemaining.toFixed(2)}% parent isotope remains.`}>
            <ControlLabel>Half-lives elapsed: {decayHalfLives}</ControlLabel>
            <input type="range" min="0" max="8" value={decayHalfLives} onChange={e => setDecayHalfLives(Number(e.target.value))} className="w-full" />
            <MiniBar label="parent isotope remaining" value={decayRemaining} color="#f87171" />
          </Bench>
        );
      case 'phase-diagram':
        return (
          <Bench title="Phase Diagram Explorer" result={`Predicted phase: ${phase}`}>
            <ControlLabel>Temperature {phaseTemp} C</ControlLabel>
            <input type="range" min="-50" max="450" value={phaseTemp} onChange={e => setPhaseTemp(Number(e.target.value))} className="w-full mb-3" />
            <ControlLabel>Pressure {phasePressure} atm</ControlLabel>
            <input type="range" min="0" max="250" value={phasePressure} onChange={e => setPhasePressure(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'mo-diagram':
        return (
          <Bench title="Molecular Orbital Diagram" result={`Bond order ${mo.order}; ${mo.magnetic}.`}>
            <ControlLabel>Molecule</ControlLabel>
            <select value={moMolecule} onChange={e => setMoMolecule(e.target.value)} className="input text-sm mb-3">{Object.keys(moData).map(m => <option key={m}>{m}</option>)}</select>
            <div className="space-y-1">{mo.fill.map(row => <div key={row} className="rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-xs font-mono text-gray-200">{row}</div>)}</div>
          </Bench>
        );
      case 'rate-lab':
        return (
          <Bench title="Reaction Rate Lab" result={`Rate factor ${rateK.toFixed(2)} from current temperature and concentration.`}>
            <ControlLabel>Temperature {rateTemp} C</ControlLabel><input type="range" min="0" max="100" value={rateTemp} onChange={e => setRateTemp(Number(e.target.value))} className="w-full mb-3" />
            <ControlLabel>Concentration {rateConc.toFixed(1)} M</ControlLabel><input type="range" min="0.1" max="3" step="0.1" value={rateConc} onChange={e => setRateConc(Number(e.target.value))} className="w-full" />
            <svg viewBox="0 0 260 90" className="w-full h-32 mt-4 rounded-xl bg-black/20 border border-white/10"><polyline fill="none" stroke="#22c55e" strokeWidth="3" points={ratePoints.map(p => `${p.x},${p.y}`).join(' ')} /></svg>
          </Bench>
        );
      case 'calorimetry':
        return (
          <Bench title="Calorimetry Experiment" result={`Final temperature: ${finalTemp.toFixed(2)} C`}>
            <ControlLabel>Metal temperature {metalTemp} C</ControlLabel><input type="range" min="25" max="200" value={metalTemp} onChange={e => setMetalTemp(Number(e.target.value))} className="w-full mb-3" />
            <ControlLabel>Metal mass {metalMass} g</ControlLabel><input type="range" min="5" max="200" value={metalMass} onChange={e => setMetalMass(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'solubility':
        return (
          <Bench title="Solubility Lab" result={precipitates ? 'Precipitate forms because Q is greater than Ksp.' : 'No precipitate yet; Q is below Ksp.'}>
            <ControlLabel>Salt</ControlLabel><select value={salt} onChange={e => setSalt(e.target.value)} className="input text-sm mb-3">{Object.keys(kspData).map(s => <option key={s}>{s}</option>)}</select>
            <ControlLabel>Salt added {saltAdded} mol</ControlLabel><input type="range" min="0" max="0.01" step="0.0005" value={saltAdded} onChange={e => setSaltAdded(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'indicator':
        return (
          <Bench title="Indicator Color Table" result={`${indicator} at pH ${solutionPh}`}>
            <ControlLabel>Indicator</ControlLabel><select value={indicator} onChange={e => setIndicator(e.target.value)} className="input text-sm mb-3">{Object.keys(indicators).map(i => <option key={i}>{i}</option>)}</select>
            <ControlLabel>pH {solutionPh}</ControlLabel><input type="range" min="0" max="14" step="0.1" value={solutionPh} onChange={e => setSolutionPh(Number(e.target.value))} className="w-full" />
            <div className="h-24 rounded-xl border border-white/10 mt-4" style={{ background: indicatorColor(indicator, solutionPh) }} />
          </Bench>
        );
      case 'soap':
        return (
          <Bench title="Soap Making" result={`Saponification progress: ${sapProgress}%`}>
            <ControlLabel>Reaction progress {sapProgress}%</ControlLabel><input type="range" min="0" max="100" value={sapProgress} onChange={e => setSapProgress(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'fermentation':
        return (
          <Bench title="Fermentation Simulator" result={`Yeast activity: ${yeastActivity.toFixed(0)}%`}>
            <ControlLabel>Temperature {yeastTemp} C</ControlLabel><input type="range" min="0" max="60" value={yeastTemp} onChange={e => setYeastTemp(Number(e.target.value))} className="w-full" />
            <MiniBar label="yeast activity" value={yeastActivity} color="#f59e0b" />
          </Bench>
        );
      case 'polymer':
        return (
          <Bench title="Polymer Builder" result={`${polymerLength} repeating units in the chain.`}>
            <ControlLabel>Chain length {polymerLength}</ControlLabel><input type="range" min="2" max="20" value={polymerLength} onChange={e => setPolymerLength(Number(e.target.value))} className="w-full" />
            <div className="flex flex-wrap gap-1 mt-4">{Array.from({ length: polymerLength }, (_, i) => <span key={i} className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-300/30" />)}</div>
          </Bench>
        );
      case 'buffer':
        return (
          <Bench title="Buffer Solution Lab" result={`Buffer pH ${bufferPh.toFixed(2)} vs pure water pH ${pureWaterPh.toFixed(2)}`}>
            <ControlLabel>Acid/base added {bufferAdded}</ControlLabel><input type="range" min="-5" max="5" step="0.1" value={bufferAdded} onChange={e => setBufferAdded(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'recrystallization':
        return (
          <Bench title="Recrystallization Visualizer" result={`Supersaturation: ${supersaturation.toFixed(1)}%`}>
            <ControlLabel>Temperature {recrystTemp} C</ControlLabel><input type="range" min="0" max="100" value={recrystTemp} onChange={e => setRecrystTemp(Number(e.target.value))} className="w-full" />
          </Bench>
        );
      case 'bohr':
      case 'timeline':
      case 'element-pack':
      case 'abundance':
      case 'trend-graph':
      case 'safety-valency':
      case 'molecule-links':
        return (
          <Bench title={activeExperiment.title} result={`Current element: ${selected.name} (${selected.symbol})`}>
            <ControlLabel>Element</ControlLabel>
            <ElementSearchInput value={selectedSymbol} onChange={setSelectedSymbol} className="mb-4" />
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Shells</p><p className="text-lg font-black text-white">{selected.shells?.join('-')}</p></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Category</p><p className="text-sm text-gray-200">{selected.category}</p></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Discovered</p><p className="text-sm text-gray-200">{selected.yearDiscovered || 'Ancient'}</p></div>
            </div>
            <p className="text-xs text-gray-400 mt-3">{selected.summary}</p>
          </Bench>
        );
      case 'concept-helper':
        return (
          <Bench title="Concept Helper" result={conceptAnswer}>
            <ControlLabel>Question</ControlLabel>
            <textarea value={conceptQuestion} onChange={e => setConceptQuestion(e.target.value)} className="input min-h-24 text-sm" />
          </Bench>
        );
      case 'unit-cell':
        return (
          <Bench title="Unit Cell Calculator" result={`For ${unitCellType}: Z(theory) = ${selectedUnitCell.z}, calculated Z = ${unitCellCalculatedZ.toFixed(2)}, calculated density = ${unitCellCalculatedDensity.toFixed(3)} g/cm3`}>
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div>
                <ControlLabel>Unit cell type</ControlLabel>
                <select value={unitCellType} onChange={e => { const next = e.target.value; setUnitCellType(next); setUnitCellZInput(unitCellData[next].z); }} className="input text-sm mb-3">
                  {Object.keys(unitCellData).map(type => <option key={type}>{type}</option>)}
                </select>
                <UnitCellSvg type={unitCellType} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Atoms / cell</p><p className="text-2xl font-black text-white">{selectedUnitCell.atoms}</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Packing</p><p className="text-2xl font-black text-white">{selectedUnitCell.packing}%</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Coordination</p><p className="text-2xl font-black text-white">{selectedUnitCell.coordination}</p></div>
                </div>
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-sm text-cyan-50">Void types: {selectedUnitCell.voids}</div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-center font-mono text-sm text-gray-200">rho = ZM / (Na x a^3)</div>
                <div className="grid sm:grid-cols-4 gap-2">
                  <div><ControlLabel>a (pm)</ControlLabel><input type="number" value={unitCellA} onChange={e => setUnitCellA(Number(e.target.value))} className="input text-sm" /></div>
                  <div><ControlLabel>density</ControlLabel><input type="number" value={unitCellDensity} onChange={e => setUnitCellDensity(Number(e.target.value))} className="input text-sm" /></div>
                  <div><ControlLabel>M (g/mol)</ControlLabel><input type="number" value={unitCellMolarMass} onChange={e => setUnitCellMolarMass(Number(e.target.value))} className="input text-sm" /></div>
                  <div><ControlLabel>Z</ControlLabel><input type="number" value={unitCellZInput} onChange={e => setUnitCellZInput(Number(e.target.value))} className="input text-sm" /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3"><p className="text-[10px] text-emerald-300">Find Z from rho, a, M</p><p className="text-xl font-black text-white">{unitCellCalculatedZ.toFixed(2)}</p></div>
                  <div className="rounded-xl bg-violet-500/10 border border-violet-400/20 p-3"><p className="text-[10px] text-violet-300">Find density from Z, a, M</p><p className="text-xl font-black text-white">{unitCellCalculatedDensity.toFixed(3)} g/cm3</p></div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'named-reactions':
        return (
          <Bench title="Named Reactions Reference" result={`${filteredNamedReactions.length} reaction${filteredNamedReactions.length === 1 ? '' : 's'} match the current filters.`}>
            <div className="grid lg:grid-cols-[1fr_170px_190px] gap-2 mb-4">
              <div>
                <ControlLabel>Search reaction, reagent, product, or mechanism</ControlLabel>
                <input value={namedReactionSearch} onChange={e => setNamedReactionSearch(e.target.value)} className="input text-sm" placeholder="Try Sandmeyer, AlCl3, diazonium, catalyst..." />
              </div>
              <div>
                <ControlLabel>Category</ControlLabel>
                <div className="flex flex-wrap gap-1">
                  {['All', 'Organic', 'Inorganic', 'Industrial'].map(category => (
                    <button key={category} onClick={() => setNamedReactionCategory(category)} className={`btn-secondary text-[11px] px-2 py-1 ${namedReactionCategory === category ? 'bg-cyan-500/20 text-cyan-200' : ''}`}>{category}</button>
                  ))}
                </div>
              </div>
              <div>
                <ControlLabel>Exam level</ControlLabel>
                <div className="flex flex-wrap gap-1">
                  {['All', ...organicTracks].map(track => (
                    <button key={track} onClick={() => setNamedReactionTrack(track)} className={`btn-secondary text-[11px] px-2 py-1 ${namedReactionTrack === track ? 'bg-violet-500/20 text-violet-200' : ''}`}>{track}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredNamedReactions.map(reaction => (
                <article key={reaction.name} className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-black text-white">{reaction.name}</h5>
                    <BadgePill className={reaction.category === 'Organic' ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' : reaction.category === 'Industrial' ? 'bg-amber-500/15 text-amber-300 border-amber-500/25' : 'bg-blue-500/15 text-blue-300 border-blue-500/25'}>{reaction.category}</BadgePill>
                  </div>
                  <p className="mt-3 rounded-lg bg-black/20 border border-white/10 p-2 text-xs font-mono text-cyan-100">{reaction.equation}</p>
                  <div className="mt-3 space-y-2 text-xs text-gray-300">
                    <p><span className="text-gray-500">Conditions:</span> {reaction.conditions}</p>
                    <p><span className="text-gray-500">Mechanism:</span> {reaction.mechanism}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {reaction.level.map(level => <BadgePill key={level} className="bg-black/15 text-gray-300 border-white/10">{level}</BadgePill>)}
                  </div>
                </article>
              ))}
            </div>
          </Bench>
        );
      case 'reactivity-series':
        return (
          <Bench title="Reactivity Series & Displacement Simulator" result={reactivityEquation}>
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-xs font-bold text-white mb-3">Most reactive to least reactive</p>
                <div className="space-y-1">
                  {reactivityMetals.map(metal => (
                    <button
                      key={metal.symbol}
                      onClick={() => setReactivityMetal(metal.symbol)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs border ${reactivityMetal === metal.symbol ? 'bg-white/10 border-white/25 text-white' : 'border-white/10 text-gray-300 hover:bg-white/[0.05]'}`}
                    >
                      <span className="w-8 h-7 rounded-md flex items-center justify-center font-black text-slate-950" style={{ background: metal.color }}>{metal.symbol}</span>
                      <span>{metal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div><ControlLabel>Metal strip</ControlLabel><select value={reactivityMetal} onChange={e => setReactivityMetal(e.target.value)} className="input text-sm">{reactivityMetals.filter(m => m.symbol !== 'H').map(m => <option key={m.symbol}>{m.symbol}</option>)}</select></div>
                  <div><ControlLabel>Salt solution</ControlLabel><select value={reactivitySalt} onChange={e => setReactivitySalt(e.target.value)} className="input text-sm">{saltSolutions.map(solution => <option key={solution.salt}>{solution.salt}</option>)}</select></div>
                  <div><ControlLabel>Reaction mode</ControlLabel><select value={reactivityMode} onChange={e => setReactivityMode(e.target.value)} className="input text-sm"><option value="salt">Displacement</option><option value="water">With water</option><option value="hcl">Dilute HCl</option><option value="acid">Dilute acid</option></select></div>
                </div>
                <div className="grid md:grid-cols-[1fr_1.1fr] gap-3">
                  <svg viewBox="0 0 240 170" className="w-full h-56 rounded-xl bg-black/20 border border-white/10">
                    <rect x="62" y="48" width="116" height="90" rx="14" fill={reactivityMode === 'salt' ? selectedSaltSolution.color : (reactivityMode === 'water' ? '#bae6fd' : '#fde68a')} opacity="0.75" stroke="#e2e8f0" />
                    <rect x="102" y="22" width="22" height="102" rx="8" fill={selectedReactivityMetal.color} />
                    {(reactivityMode === 'salt' ? displacementHappens : reactivityMode === 'water' ? waterReactionHappens : acidReactionHappens) && Array.from({ length: 12 }, (_, i) => <circle key={i} cx={76 + (i % 6) * 18} cy={66 + Math.floor(i / 6) * 24} r={3 + (i % 3)} fill="#f8fafc" opacity="0.85" />)}
                    <text x="120" y="154" textAnchor="middle" fill="#cbd5e1" fontSize="9">{reactivityMode === 'salt' ? (displacementHappens ? 'displacement occurs' : 'no displacement') : reactionMediumNotes[reactivityMode]}</text>
                  </svg>
                  <div className="space-y-3">
                    <div className={`rounded-xl border p-4 ${reactivityMode === 'salt' ? (displacementHappens ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100' : 'bg-amber-500/10 border-amber-500/25 text-amber-100') : 'bg-cyan-500/10 border-cyan-500/25 text-cyan-100'}`}>
                      <p className="text-sm font-black">{reactivityMode === 'salt' ? (displacementHappens ? 'Displacement happens' : 'No displacement') : 'Medium rule'}</p>
                      <p className="text-xs mt-1">{reactivityMode === 'salt' ? `${reactivityMetal} is ${displacementHappens ? 'above' : 'below'} ${selectedSaltSolution.metal} in the series.` : reactionMediumNotes[reactivityMode]}</p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                      <p><span className="text-cyan-300 font-semibold">Class 10 key:</span> Cu cannot displace Zn from ZnSO4 because copper is below zinc in the reactivity series.</p>
                      <p className="mt-2"><span className="text-amber-300 font-semibold">Corrosion:</span> iron forms tiny electrochemical cells with water and oxygen, producing hydrated iron(III) oxide. Gold is too unreactive to oxidize under normal conditions.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'quantum-numbers':
        return (
          <Bench title="Quantum Numbers Explorer" result={quantumValid ? `${quantumOrbital} orbital, ml = ${quantumMl}, ms = ${quantumMs}; subshell capacity = ${subshellCapacity} electrons.` : 'Illegal combination: l must be 0 to n-1, and ml must be from -l to +l.'}>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4 space-y-3">
                <div><ControlLabel>n principal quantum number: {quantumN}</ControlLabel><input type="range" min="1" max="4" value={quantumN} onChange={e => { const next = Number(e.target.value); setQuantumN(next); setQuantumL(l => Math.min(l, next - 1)); }} className="w-full" /></div>
                <div><ControlLabel>l azimuthal quantum number: {quantumL}</ControlLabel><input type="range" min="0" max={Math.max(0, quantumN - 1)} value={quantumL} onChange={e => { const next = Number(e.target.value); setQuantumL(next); setQuantumMl(ml => Math.max(-next, Math.min(next, ml))); }} className="w-full" /></div>
                <div><ControlLabel>ml magnetic quantum number: {quantumMl}</ControlLabel><input type="range" min={-quantumL} max={quantumL} value={quantumMl} onChange={e => setQuantumMl(Number(e.target.value))} className="w-full" /></div>
                <div><ControlLabel>ms spin quantum number</ControlLabel><select value={quantumMs} onChange={e => setQuantumMs(e.target.value)} className="input text-sm"><option value="1/2">+1/2</option><option value="-1/2">-1/2</option></select></div>
                <div className={`rounded-xl border p-3 text-sm ${quantumValid ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100' : 'bg-red-500/10 border-red-500/25 text-red-100'}`}>
                  <p className="font-black">{quantumValid ? 'Allowed quantum state' : 'Invalid quantum state'}</p>
                  <p className="text-xs mt-1">Orbital name: {quantumOrbital}. Allowed electrons in subshell = 2(2l+1) = {subshellCapacity}.</p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">de Broglie wavelength: lambda = h / mv</p>
                  <div className="grid sm:grid-cols-2 gap-2"><input type="number" value={deBroglieMass} onChange={e => setDeBroglieMass(Number(e.target.value))} className="input text-sm" /><input type="number" value={deBroglieVelocity} onChange={e => setDeBroglieVelocity(Number(e.target.value))} className="input text-sm" /></div>
                  <p className="text-xs text-cyan-100 mt-2">lambda = {deBroglieLambda.toExponential(3)} m</p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">Heisenberg: minimum dp = h / (4 pi dx)</p>
                  <input type="number" value={uncertaintyDx} onChange={e => setUncertaintyDx(Number(e.target.value))} className="input text-sm" />
                  <p className="text-xs text-cyan-100 mt-2">minimum dp = {minMomentumUncertainty.toExponential(3)} kg m/s</p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">Photoelectric effect: KE = h nu - phi</p>
                  <div className="grid sm:grid-cols-2 gap-2"><input type="number" value={photoFrequency} onChange={e => setPhotoFrequency(Number(e.target.value))} className="input text-sm" /><input type="number" value={photoWorkFunction} onChange={e => setPhotoWorkFunction(Number(e.target.value))} className="input text-sm" /></div>
                  <p className={`text-xs mt-2 ${photoKE >= 0 ? 'text-emerald-100' : 'text-amber-100'}`}>KE = {Math.max(0, photoKE).toFixed(3)} eV {photoKE < 0 ? '(no emission)' : ''}</p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'gibbs':
        return (
          <Bench title="Gibbs Free Energy & Thermodynamic Spontaneity" result={`Delta G = ${gibbsValue.toFixed(2)} kJ/mol, so the reaction is ${gibbsValue < 0 ? 'spontaneous' : 'non-spontaneous'} at ${gibbsTemp} K. K = ${gibbsK.toExponential(2)}.`}>
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div className="space-y-3">
                <div><ControlLabel>Delta H (kJ/mol)</ControlLabel><input type="number" value={gibbsDeltaH} onChange={e => setGibbsDeltaH(Number(e.target.value))} className="input text-sm" /></div>
                <div><ControlLabel>Delta S (J/mol K)</ControlLabel><input type="number" value={gibbsDeltaS} onChange={e => setGibbsDeltaS(Number(e.target.value))} className="input text-sm" /></div>
                <div><ControlLabel>Temperature {gibbsTemp} K</ControlLabel><input type="range" min="200" max="1500" value={gibbsTemp} onChange={e => setGibbsTemp(Number(e.target.value))} className="w-full" /></div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">Delta G = Delta H - T Delta S. Delta G standard = -RT ln K. {gibbsCrossover && gibbsCrossover > 0 ? `Crossover T = ${gibbsCrossover.toFixed(1)} K.` : 'No positive crossover temperature for these signs.'}</div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">Kirchhoff law: Delta H2 = Delta H1 + Delta Cp(T2 - T1)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" value={kirchhoffH1} onChange={e => setKirchhoffH1(Number(e.target.value))} className="input text-sm" />
                    <input type="number" value={kirchhoffCp} onChange={e => setKirchhoffCp(Number(e.target.value))} className="input text-sm" />
                    <input type="number" value={kirchhoffT1} onChange={e => setKirchhoffT1(Number(e.target.value))} className="input text-sm" />
                    <input type="number" value={kirchhoffT2} onChange={e => setKirchhoffT2(Number(e.target.value))} className="input text-sm" />
                  </div>
                  <p className="text-xs text-cyan-100 mt-2">Delta H at T2 = {kirchhoffH2.toFixed(2)} kJ/mol</p>
                </div>
              </div>
              <div className="space-y-3">
                <GibbsPlot dH={gibbsDeltaH} dS={gibbsDeltaS} temp={gibbsTemp} />
                <div className="grid sm:grid-cols-2 gap-2">
                  {gibbsSignTable.map(row => (
                    <div key={`${row.h}${row.s}`} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs">
                      <p className="font-black text-white">Delta H {row.h}, Delta S {row.s}</p>
                      <p className="text-cyan-100 mt-1">{row.when}</p>
                      <p className="text-gray-500 mt-1">{row.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'environmental-chem':
        return (
          <Bench title="Environmental Chemistry" result="Atmospheric composition, pollution pathways, water quality, and smog chemistry summarized for Class 11 revision.">
            <div className="flex flex-wrap gap-2 mb-4">
              {['Atmosphere', 'Pollution', 'Water', 'Smog'].map(tab => (
                <button key={tab} onClick={() => setEnvironmentTab(tab)} className={`btn-secondary text-xs ${environmentTab === tab ? 'bg-emerald-500/20 text-emerald-200' : ''}`}>{tab}</button>
              ))}
            </div>
            {environmentTab === 'Atmosphere' && (
              <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-4">
                <AtmosphereSketch />
                <div className="grid gap-3 text-xs">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Composition</p><p className="text-gray-400 mt-1">Dry air is about 78% N2, 21% O2, 0.93% Ar, and about 0.04% CO2, with variable water vapor.</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Ozone layer</p><p className="text-gray-400 mt-1">{'O2 + UV -> O + O; O + O2 -> O3. Ozone absorbs harmful UV radiation in the stratosphere.'}</p></div>
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3"><p className="font-bold text-red-100">CFC destruction chain</p><p className="text-red-100/80 mt-1">{'CCl2F2 + UV -> Cl radical; Cl + O3 -> ClO + O2; ClO + O -> Cl + O2. Chlorine is regenerated.'}</p></div>
                </div>
              </div>
            )}
            {environmentTab === 'Pollution' && (
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                {['CO2: GWP 1', 'CH4: GWP about 28', 'N2O: GWP about 265', 'CFCs: very high GWP'].map(item => <div key={item} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-200">{item}</div>)}
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-100">{'Acid rain: SO2 + H2O -> H2SO3; NOx oxidizes and hydrates to HNO3.'}</div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-amber-100">{'Marble damage: CaCO3 + H2SO4 -> CaSO4 + CO2 + H2O.'}</div>
              </div>
            )}
            {environmentTab === 'Water' && (
              <div className="grid md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-cyan-100"><p className="font-bold">BOD</p><p className="mt-1">Biochemical oxygen demand is oxygen used by microbes to decompose organic matter in water. High BOD means more pollution.</p></div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300"><p className="font-bold text-white">Hardness</p><p className="mt-1">Temporary hardness: bicarbonates of Ca/Mg. Permanent hardness: chlorides and sulfates of Ca/Mg.</p></div>
                {['Boiling removes temporary hardness.', 'Lime treatment precipitates CaCO3/Mg(OH)2.', 'Ion exchange swaps Ca2+/Mg2+ for Na+ or H+.', 'Zeolite softening exchanges hard-water ions.'].map(item => <div key={item} className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300">{item}</div>)}
              </div>
            )}
            {environmentTab === 'Smog' && (
              <div className="grid md:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Classical smog</p><p className="text-gray-400 mt-1">Cool, humid, reducing smog from smoke, fog, SO2, and particulates.</p></div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Photochemical smog</p><p className="text-gray-400 mt-1">Warm, sunny, oxidizing smog from NOx and hydrocarbons; contains O3 and PAN.</p></div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3"><p className="font-bold text-violet-100">PAN formation</p><p className="text-violet-100/80 mt-1">Hydrocarbon radicals + O2 + NO2 form peroxyacetyl nitrate, an eye-irritating oxidant.</p></div>
              </div>
            )}
          </Bench>
        );
      case 'cft':
        return (
          <Bench title="Crystal Field Theory Visualizer" result={`d${cftElectrons} ${cftGeometry.toLowerCase()} ${cftField}-field: CFSE = ${cftFilled.cfse.toFixed(1)} Delta units + ${cftFilled.pairs}P; unpaired = ${cftFilled.unpaired}; mu = ${cftMoment.toFixed(2)} BM.`}>
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <ControlLabel>Geometry</ControlLabel>
                    <select value={cftGeometry} onChange={e => setCftGeometry(e.target.value)} className="input text-sm">
                      {Object.keys(cftGeometryData).map(geometry => <option key={geometry}>{geometry}</option>)}
                    </select>
                  </div>
                  <div>
                    <ControlLabel>Ligand field</ControlLabel>
                    <select value={cftField} onChange={e => setCftField(e.target.value)} className="input text-sm">
                      <option value="strong">Strong field</option>
                      <option value="weak">Weak field</option>
                    </select>
                  </div>
                </div>
                <div><ControlLabel>d-electrons: d{cftElectrons}</ControlLabel><input type="range" min="0" max="10" value={cftElectrons} onChange={e => setCftElectrons(Number(e.target.value))} className="w-full" /></div>
                <div><ControlLabel>Delta energy: {cftDelta.toFixed(1)} eV</ControlLabel><input type="range" min="0.8" max="4" step="0.1" value={cftDelta} onChange={e => setCftDelta(Number(e.target.value))} className="w-full" /></div>
                <CftDiagram geometry={cftGeometry} filled={cftFilled} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">CFSE</p><p className="text-xl font-black text-white">{cftFilled.cfse.toFixed(1)}Delta + {cftFilled.pairs}P</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Unpaired</p><p className="text-xl font-black text-white">{cftFilled.unpaired}</p></div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Moment</p><p className="text-xl font-black text-white">{cftMoment.toFixed(2)} BM</p></div>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                  <p className="font-mono text-cyan-100">mu = sqrt(n(n+2)) BM</p>
                  <p className="mt-2">{cftGeometryData[cftGeometry].note}</p>
                  <p className="mt-2">{'Spectrochemical series: I- < Br- < Cl- < F- < OH- < H2O < NH3 < en < CN- < CO'}</p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <p className="text-xs text-gray-400">Color prediction</p>
                  <div className="mt-2 h-16 rounded-xl border border-white/10" style={{ background: cftComplement }} />
                  <p className="text-xs text-gray-300 mt-2">Absorbed wavelength about {cftWavelength.toFixed(0)} nm ({cftAbsorbed}); displayed patch is the approximate complementary color.</p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'metallurgy':
        return (
          <Bench title="Metallurgy & Extraction Flowchart" result={`${metallurgyMetal}: ${activeMetallurgyStep.title} - ${activeMetallurgyStep.purpose}`}>
            <div className="grid lg:grid-cols-[240px_1fr] gap-4">
              <div>
                <ControlLabel>Metal</ControlLabel>
                <select value={metallurgyMetal} onChange={e => { setMetallurgyMetal(e.target.value); setMetallurgyStep(0); }} className="input text-sm mb-3">
                  {Object.keys(metallurgyData).map(metal => <option key={metal}>{metal}</option>)}
                </select>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                  <p className="font-bold text-white mb-2">Special refining methods</p>
                  <p>Van Arkel method: Ti/Zr + I2 forms volatile iodide, decomposed on hot filament for pure metal.</p>
                  <p className="mt-2">Zone refining: used for Si, Ge, Ga; impurities concentrate in molten zone.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-5 gap-2">
                  {selectedMetallurgy.map((step, index) => (
                    <button
                      key={step.title}
                      onClick={() => setMetallurgyStep(index)}
                      className={`rounded-xl border p-3 text-left transition-colors ${metallurgyStep === index ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-100' : 'bg-white/[0.035] border-white/10 text-gray-300 hover:bg-white/[0.06]'}`}
                    >
                      <span className="block text-[10px] text-gray-500">Step {index + 1}</span>
                      <span className="block text-xs font-black">{step.title}</span>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                  <h5 className="text-lg font-black text-white">{activeMetallurgyStep.title}</h5>
                  <p className="text-sm text-gray-300 mt-1">{activeMetallurgyStep.detail}</p>
                  <p className="mt-3 rounded-lg bg-black/20 border border-white/10 p-3 text-xs font-mono text-cyan-100">{activeMetallurgyStep.equation}</p>
                  <p className="text-xs text-gray-400 mt-2"><span className="text-emerald-300 font-semibold">Purpose:</span> {activeMetallurgyStep.purpose}</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-100">
                  <p className="font-bold">Ellingham concept</p>
                  <p className="mt-1">A metal can reduce an oxide if its oxide formation line lies lower at that temperature. Approximate oxide stability: Al2O3 and MgO very stable, ZnO/FeO moderate, Cu2O less stable and easier to reduce.</p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'salt-analysis':
        return (
          <Bench title="Qualitative Salt Analysis Guide" result={`${saltAnalysisSample}: ${saltSamples[saltAnalysisSample][0]}`}>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <h5 className="text-sm font-black text-white mb-3">Cation Analysis</h5>
                <div className="space-y-2">
                  {saltAnalysisGroups.map(([group, ions, observation]) => (
                    <div key={group} className="rounded-lg bg-black/20 border border-white/10 p-3 text-xs">
                      <p className="font-bold text-cyan-100">{group}</p>
                      <p className="text-gray-300 mt-1">{ions}</p>
                      <p className="text-gray-500 mt-1">{observation}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <h5 className="text-sm font-black text-white mb-3">Anion Analysis</h5>
                <div className="space-y-2">
                  {anionTests.map(([ion, reagent, observation]) => (
                    <div key={ion} className="rounded-lg bg-black/20 border border-white/10 p-3 text-xs">
                      <p className="font-bold text-violet-100">{ion}</p>
                      <p className="text-gray-300 mt-1">{reagent}</p>
                      <p className="text-gray-500 mt-1">{observation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 grid lg:grid-cols-[260px_1fr] gap-4">
              <div>
                <ControlLabel>Pick a salt</ControlLabel>
                <select value={saltAnalysisSample} onChange={e => setSaltAnalysisSample(e.target.value)} className="input text-sm">
                  {Object.keys(saltSamples).map(sample => <option key={sample}>{sample}</option>)}
                </select>
                <div className="mt-3 rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-xs font-bold text-white mb-2">Flame colors</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
                    {flameReference.map(([ion, color]) => <span key={ion}>{ion}: {color}</span>)}
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <h5 className="text-sm font-black text-white">Step-by-step sequence</h5>
                <ol className="mt-3 space-y-2 text-sm text-emerald-50">
                  {saltSamples[saltAnalysisSample].map((step, index) => <li key={step}>{index + 1}. {step}</li>)}
                </ol>
              </div>
            </div>
          </Bench>
        );
      case 'pblock-advanced':
        return (
          <Bench title="p-Block Groups 15-18 Reference" result={`${pblockGroup}: ${pBlockData[pblockGroup][0][1]}`}>
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(pBlockData).map(group => (
                <button key={group} onClick={() => setPblockGroup(group)} className={`btn-secondary text-xs ${pblockGroup === group ? 'bg-cyan-500/20 text-cyan-200' : ''}`}>{group}</button>
              ))}
            </div>
            <div className="grid lg:grid-cols-[1fr_280px] gap-4">
              <div className="grid md:grid-cols-2 gap-3">
                {pBlockData[pblockGroup].map(([title, detail]) => (
                  <article key={title} className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                    <h5 className="text-sm font-black text-white">{title}</h5>
                    <p className="text-xs text-gray-300 mt-2">{detail}</p>
                  </article>
                ))}
              </div>
              <svg viewBox="0 0 220 180" className="w-full h-56 rounded-xl bg-black/20 border border-white/10">
                {pblockGroup === 'Group 18' ? (
                  <>
                    <line x1="35" y1="50" x2="95" y2="50" stroke="#38bdf8" strokeWidth="3" /><text x="20" y="54" fill="#cbd5e1" fontSize="10">F-Xe-F</text>
                    <rect x="70" y="88" width="54" height="54" fill="none" stroke="#a78bfa" strokeWidth="3" /><text x="76" y="119" fill="#cbd5e1" fontSize="10">XeF4</text>
                    <circle cx="165" cy="98" r="24" fill="none" stroke="#f472b6" strokeWidth="3" /><text x="148" y="102" fill="#cbd5e1" fontSize="10">XeF6</text>
                  </>
                ) : (
                  <>
                    <circle cx="110" cy="82" r="26" fill="none" stroke="#38bdf8" strokeWidth="3" />
                    {[0, 60, 120, 180, 240, 300].map(angle => {
                      const rad = angle * Math.PI / 180;
                      return <line key={angle} x1="110" y1="82" x2={110 + Math.cos(rad) * 52} y2={82 + Math.sin(rad) * 52} stroke="#e2e8f0" strokeWidth="2" />;
                    })}
                    <text x="70" y="155" fill="#94a3b8" fontSize="9">schematic oxyacid / allotrope bonding</text>
                  </>
                )}
              </svg>
            </div>
          </Bench>
        );
      case 'drug-functional-groups':
      case 'adme-ionization':
      case 'isotonicity':
      case 'clinical-buffers':
      case 'pharma-analysis':
      case 'radiopharma':
      case 'enzyme-kinetics':
      case 'amino-acid-pi':
      case 'protein-structure':
      case 'carbohydrate-lab':
      case 'lipid-membrane':
      case 'nucleic-acid-lab':
      case 'vitamin-coenzyme-map':
      case 'metabolism-atp':
      case 'drug-class-studio':
      case 'drug-metabolism-lab':
      case 'dosage-form-lab':
      case 'antacid-analgesic-antimicrobial':
      case 'pharma-buffer-lab':
      case 'electrolyte-panel':
      case 'hemoglobin-oxygen':
      case 'diagnostic-color-tests':
      case 'clinical-metabolites':
      case 'toxicology-chelation': {
        const reference = pharmaMedicalReference[activeExperiment.id];
        const activeStageIndex = Math.min(bioMedicalStage, reference.rows.length - 1);
        const activeRow = reference.rows[activeStageIndex] || reference.rows[0];
        const stagePercent = reference.rows.length > 1 ? (activeStageIndex / (reference.rows.length - 1)) * 100 : 0;
        const signal = 35 + ((activeStageIndex * 17) % 55);
        const isBarLab = ['electrolyte-panel', 'clinical-metabolites', 'diagnostic-color-tests', 'pharma-analysis'].includes(activeExperiment.id);
        const isCurveLab = ['enzyme-kinetics', 'hemoglobin-oxygen', 'adme-ionization', 'drug-metabolism-lab'].includes(activeExperiment.id);
        const isMembraneLab = ['lipid-membrane', 'isotonicity', 'dosage-form-lab'].includes(activeExperiment.id);
        const isMoleculeLab = ['nucleic-acid-lab', 'protein-structure', 'amino-acid-pi', 'carbohydrate-lab'].includes(activeExperiment.id);
        const isToxicology = activeExperiment.id === 'toxicology-chelation';
        const activeColor = isToxicology ? '#fb7185' : isBarLab ? '#f59e0b' : isMembraneLab ? '#38bdf8' : isMoleculeLab ? '#a78bfa' : '#22c55e';
        const activeShort = String(activeRow[0]).slice(0, 22);
        return (
          <Bench title={activeExperiment.title} result={reference.result}>
            <div className="space-y-4">
              <div className="grid lg:grid-cols-[1fr_280px] gap-4">
                <div className="rounded-xl bg-black/20 border border-white/10 p-4 overflow-hidden">
                  <svg viewBox="0 0 520 260" className="w-full h-72 rounded-xl bg-slate-950/70 border border-white/10">
                    <defs>
                      <linearGradient id="bioMedicalGlow" x1="0" x2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fb7185" />
                      </linearGradient>
                      <radialGradient id="bioMedicalPulse" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={activeColor} stopOpacity="0.65" />
                        <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <rect x="18" y="18" width="484" height="224" rx="18" fill="#020617" stroke="#1e293b" />
                    <rect x="34" y="34" width="452" height="26" rx="13" fill="#0f172a" stroke="#243244" />
                    <circle cx="50" cy="47" r="5" fill={activeColor} />
                    <text x="62" y="51" fill="#e2e8f0" fontSize="12" fontWeight="700">{activeShort}</text>
                    {isCurveLab && (
                      <>
                        {[92, 128, 164, 200].map(y => <line key={y} x1="62" y1={y} x2="462" y2={y} stroke="#1f2937" strokeDasharray="4 7" />)}
                        {[142, 222, 302, 382].map(x => <line key={x} x1={x} y1="74" x2={x} y2="204" stroke="#1f2937" strokeDasharray="4 7" />)}
                        <line x1="62" y1="204" x2="462" y2="204" stroke="#64748b" strokeWidth="2" />
                        <line x1="62" y1="204" x2="62" y2="72" stroke="#64748b" strokeWidth="2" />
                        <path d={`M70 198 C 145 ${150 - activeStageIndex * 7}, 215 ${98 - activeStageIndex * 5}, 455 ${80 + activeStageIndex * 9}`} fill="none" stroke="url(#bioMedicalGlow)" strokeWidth="6" strokeLinecap="round" />
                        <path d={`M70 198 C 135 180, 220 ${125 + activeStageIndex * 8}, 455 ${118 + activeStageIndex * 7}`} fill="none" stroke="#a78bfa" strokeWidth="3" strokeDasharray="8 8" strokeLinecap="round" />
                        <text x="70" y="82" fill="#94a3b8" fontSize="11">rate / occupancy</text>
                        <text x="332" y="226" fill="#94a3b8" fontSize="11">substrate, O2 pressure, or time</text>
                        <circle cx={95 + stagePercent * 3.55} cy={198 - signal} r="24" fill="url(#bioMedicalPulse)" />
                        <circle cx={95 + stagePercent * 3.55} cy={198 - signal} r="10" fill="#22c55e" stroke="#bbf7d0" strokeWidth="3" />
                        <g transform="translate(388 92)">
                          <rect x="0" y="0" width="82" height="58" rx="16" fill="#0f172a" stroke="#334155" />
                          <path d="M18 34 C24 14, 56 14, 64 34 C58 50, 24 50, 18 34Z" fill="#16a34a33" stroke="#22c55e" strokeWidth="2" />
                          <circle cx={42 + (activeStageIndex % 2) * 10} cy="34" r="7" fill={activeColor} />
                          <text x="14" y="14" fill="#94a3b8" fontSize="9">active site</text>
                        </g>
                      </>
                    )}
                    {isBarLab && (
                      <>
                        <line x1="58" y1="210" x2="468" y2="210" stroke="#64748b" strokeWidth="2" />
                        {reference.rows.map((row, index) => {
                          const height = 42 + ((index * 23 + activeStageIndex * 15) % 112);
                          const active = index === activeStageIndex;
                          return (
                            <g key={row[0]}>
                              <rect x={68 + index * 76} y="82" width="54" height="130" rx="18" fill="#0f172a" stroke={active ? activeColor : '#475569'} strokeWidth="2" />
                              <rect x={74 + index * 76} y={210 - height} width="42" height={height} rx="10" fill={active ? `${activeColor}cc` : '#334155'} />
                              <rect
                                x={76 + index * 76}
                                y={210 - height}
                                width="38"
                                height={height}
                                rx="8"
                                fill={active ? '#22c55e99' : '#334155'}
                                stroke={active ? '#bbf7d0' : '#64748b'}
                                strokeWidth="2"
                              />
                              <rect x={72 + index * 76} y="66" width="46" height="22" rx="8" fill={active ? '#f59e0b' : '#0f172a'} stroke="#475569" />
                              <text x={76 + index * 76} y="230" fill="#cbd5e1" fontSize="10">{row[0].slice(0, 8)}</text>
                            </g>
                          );
                        })}
                        <text x="68" y="76" fill="#94a3b8" fontSize="11">test tubes: color intensity and concentration signal</text>
                      </>
                    )}
                    {isMembraneLab && (
                      <>
                        <rect x="46" y="70" width="428" height="130" rx="26" fill="#0f172a" stroke="#334155" />
                        <text x="64" y="88" fill="#94a3b8" fontSize="11">aqueous side A</text>
                        <text x="370" y="190" fill="#94a3b8" fontSize="11">aqueous side B</text>
                        {Array.from({ length: 14 }, (_, i) => (
                          <g key={i} transform={`translate(${76 + i * 28}, 94)`}>
                            <circle cx="0" cy="0" r="8" fill="#38bdf8" />
                            <line x1="-4" y1="8" x2="-12" y2="48" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                            <line x1="4" y1="8" x2="12" y2="48" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                            <circle cx="0" cy="86" r="8" fill="#38bdf8" />
                            <line x1="-4" y1="78" x2="-12" y2="38" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                            <line x1="4" y1="78" x2="12" y2="38" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
                          </g>
                        ))}
                        {Array.from({ length: 18 }, (_, i) => (
                          <circle key={i} cx={72 + (i * 29) % 410} cy={78 + ((i * 37 + activeStageIndex * 9) % 116)} r="3" fill={i % 3 ? '#bae6fd' : '#fb7185'} opacity="0.8" />
                        ))}
                        <path d={`M116 132 C 190 ${110 - activeStageIndex * 6}, 265 ${164 + activeStageIndex * 3}, 398 132`} fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="7 7" />
                        <circle cx={125 + stagePercent * 2.6} cy="132" r={18 + activeStageIndex * 3} fill="#fb718533" stroke="#fb7185" strokeWidth="3" />
                        <text x="66" y="224" fill="#94a3b8" fontSize="11">bilayer, osmotic movement, droplets, micelles, and formulation particles</text>
                      </>
                    )}
                    {isMoleculeLab && (
                      <>
                        <path d={`M58 ${150 - activeStageIndex * 9} C 110 65, 172 205, 228 110 S 350 62, 462 ${150 + activeStageIndex * 5}`} fill="none" stroke="url(#bioMedicalGlow)" strokeWidth="9" strokeLinecap="round" />
                        <path d={`M58 ${164 - activeStageIndex * 7} C 110 78, 172 218, 228 124 S 350 76, 462 ${164 + activeStageIndex * 4}`} fill="none" stroke="#38bdf8" strokeWidth={activeExperiment.id === 'nucleic-acid-lab' ? 5 : 0} strokeLinecap="round" opacity="0.8" />
                        {Array.from({ length: 8 }, (_, i) => (
                          <g key={i}>
                            {activeExperiment.id === 'nucleic-acid-lab' && <line x1={72 + i * 55} y1={118 + (i % 2 ? 36 : -22)} x2={72 + i * 55} y2={132 + (i % 2 ? 36 : -22)} stroke="#c4b5fd" strokeWidth="3" strokeDasharray="4 4" />}
                            <circle cx={72 + i * 55} cy={118 + (i % 2 ? 36 : -22)} r="15" fill={i <= activeStageIndex + 2 ? '#22c55e' : '#475569'} stroke="#e2e8f0" strokeWidth="2" />
                            <text x={67 + i * 55} y={123 + (i % 2 ? 36 : -22)} fill="#020617" fontSize="10" fontWeight="900">{['A', 'T', 'G', 'C', 'OH', 'N', 'P', 'S'][i]}</text>
                          </g>
                        ))}
                        <g transform="translate(360 78)">
                          <rect x="0" y="0" width="92" height="54" rx="14" fill="#0f172a" stroke="#334155" />
                          <text x="12" y="20" fill="#94a3b8" fontSize="9">contacts</text>
                          <circle cx="22" cy="36" r="6" fill="#22d3ee" />
                          <circle cx="46" cy="36" r="6" fill="#f59e0b" />
                          <circle cx="70" cy="36" r="6" fill="#fb7185" />
                        </g>
                        <text x="70" y="224" fill="#94a3b8" fontSize="11">sequence, rings, base pairs, folding contacts, and ionizable groups</text>
                      </>
                    )}
                    {isToxicology && (
                      <>
                        <path d="M86 128 C118 68, 198 66, 228 128 C198 190, 118 188, 86 128Z" fill="#7f1d1d66" stroke="#f87171" strokeWidth="4" />
                        <text x="132" y="133" fill="#fecaca" fontSize="17" fontWeight="900">toxin</text>
                        <circle cx="340" cy="130" r="58" fill="none" stroke="#22d3ee" strokeWidth="6" strokeDasharray="12 8" />
                        {[0, 60, 120, 180, 240, 300].map(angle => {
                          const rad = angle * Math.PI / 180;
                          return <circle key={angle} cx={340 + Math.cos(rad) * 58} cy={130 + Math.sin(rad) * 58} r="9" fill="#34d399" />;
                        })}
                        <circle cx="340" cy="130" r="18" fill="#f59e0b" stroke="#fde68a" strokeWidth="3" />
                        <path d="M230 130 C252 106, 272 106, 294 130 C272 154, 252 154, 230 130Z" fill="#0f172a" stroke="#cbd5e1" strokeWidth="3" />
                        <text x="244" y="134" fill="#e2e8f0" fontSize="10">bind</text>
                        <text x="74" y="224" fill="#94a3b8" fontSize="11">enzyme/heme binding site vs chelator pocket with multiple donor atoms</text>
                      </>
                    )}
                    {!isCurveLab && !isBarLab && !isMembraneLab && !isMoleculeLab && !isToxicology && (
                      <>
                        {reference.rows.map((row, index) => {
                          const x = 70 + index * (380 / Math.max(1, reference.rows.length - 1));
                          const active = index === Math.min(bioMedicalStage, reference.rows.length - 1);
                          return (
                            <g key={row[0]}>
                              {index > 0 && <line x1={70 + (index - 1) * (380 / Math.max(1, reference.rows.length - 1))} y1="130" x2={x} y2="130" stroke="#334155" strokeWidth="4" />}
                              <circle cx={x} cy="130" r={active ? 25 : 18} fill={active ? '#22c55e' : '#1e293b'} stroke={active ? '#bbf7d0' : '#64748b'} strokeWidth="3" />
                              <text x={x - 18} y="176" fill="#cbd5e1" fontSize="10">{row[0].slice(0, 14)}</text>
                            </g>
                          );
                        })}
                        <rect x="72" y="54" width={110 + stagePercent * 2.9} height="18" rx="9" fill="url(#bioMedicalGlow)" />
                        <text x="76" y="48" fill="#94a3b8" fontSize="12">progressive visual map</text>
                      </>
                    )}
                  </svg>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <p className="text-xs font-bold text-emerald-200">Active stage</p>
                    <p className="text-lg font-black text-white mt-1">{activeRow[0]}</p>
                    <p className="text-sm text-emerald-50 mt-2">{activeRow[1]}</p>
                    <p className="text-xs text-emerald-100/75 mt-2">{activeRow[2]}</p>
                  </div>
                  <div>
                    <ControlLabel>Visualization stage: {activeStageIndex + 1}/{reference.rows.length}</ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, reference.rows.length - 1)}
                      value={Math.min(bioMedicalStage, reference.rows.length - 1)}
                      onChange={e => setBioMedicalStage(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">assay signal</p>
                      <p className="text-2xl font-black text-white">{signal}%</p>
                      <MiniBar label="relative response" value={signal} color="#22d3ee" />
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">polarity / charge</p>
                      <p className="text-2xl font-black text-white">{Math.round(100 - signal / 1.4)}%</p>
                      <MiniBar label="chemical shift" value={100 - signal / 1.4} color="#fb7185" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.035] border border-white/10 overflow-hidden">
                <div className="grid grid-cols-[0.8fr_1.1fr_1.1fr] gap-px bg-white/10 text-xs">
                  {reference.columns.map(column => (
                    <div key={column} className="bg-slate-950/80 px-3 py-2 font-bold text-cyan-100">{column}</div>
                  ))}
                  {reference.rows.flatMap((row, rowIndex) => row.map((cell, index) => (
                    <div
                      key={`${row[0]}-${index}`}
                      className={`px-3 py-2 ${rowIndex === activeStageIndex ? 'bg-cyan-500/15 text-cyan-50' : 'bg-slate-950/55 text-gray-300'}`}
                    >
                      {cell}
                    </div>
                  )))}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {reference.rows.map((row, index) => (
                  <button
                    key={row[0]}
                    onClick={() => setBioMedicalStage(index)}
                    className={`text-left rounded-xl border p-3 transition-colors ${index === Math.min(bioMedicalStage, reference.rows.length - 1) ? 'bg-cyan-500/15 border-cyan-500/30' : 'bg-white/[0.035] border-white/10 hover:bg-white/[0.06]'}`}
                  >
                    <p className="text-sm font-bold text-white">{row[0]}</p>
                    <p className="text-xs text-gray-400 mt-1">{row[1]}</p>
                    <p className="text-[11px] text-cyan-300 mt-2">{row[2]}</p>
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <p className="text-xs font-bold text-violet-200">Visual lab mode</p>
                  <p className="text-sm text-violet-50 mt-2">
                    Use the stage control to scan structures, curves, tests, formulations, ions, or pathway steps without switching into question-answer practice.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-xs font-bold text-amber-200">Bridge concepts</p>
                  <p className="text-sm text-amber-50 mt-2">
                    Connect each visual to organic functional groups, buffers, solutions, isotopes, kinetics, coordination, and analytical chemistry.
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      }
      case 'functional-tests':
        return (
          <Bench title="Functional Group Test Reference" result={functionalQuizAnswer ? (functionalQuizCorrect ? `Correct: ${activeFunctionalQuiz.expected}` : `Review: best pick is ${activeFunctionalQuiz.answer}. ${activeFunctionalQuiz.expected}`) : 'Pick a test or try the reverse quiz.'}>
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-2 max-h-[520px] overflow-y-auto">
                {functionalTestData.map(test => (
                  <button
                    key={test.name}
                    onClick={() => setSelectedFunctionalTest(test.name)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs mb-1 transition-colors ${selectedFunctionalTest === test.name ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/25' : 'text-gray-400 hover:bg-white/[0.05]'}`}
                  >
                    <span className="block font-bold">{test.name}</span>
                    <span className="block text-[10px] text-gray-500 truncate">{test.detects}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <h5 className="text-lg font-black text-white">{selectedTest.name}</h5>
                    <BadgePill className="bg-pink-500/15 text-pink-300 border-pink-500/25">qualitative analysis</BadgePill>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3"><p className="text-gray-500">Detects</p><p className="text-white font-semibold mt-1">{selectedTest.detects}</p></div>
                    <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3"><p className="text-gray-500">Reagents</p><p className="text-white font-semibold mt-1">{selectedTest.reagents}</p></div>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3"><p className="text-emerald-300">Positive result</p><p className="text-emerald-50 font-semibold mt-1">{selectedTest.positive}</p></div>
                    <div className="rounded-lg bg-slate-500/10 border border-slate-500/20 p-3"><p className="text-gray-400">Negative result</p><p className="text-gray-100 font-semibold mt-1">{selectedTest.negative}</p></div>
                  </div>
                  <p className="mt-3 text-xs text-gray-300"><span className="text-cyan-300 font-semibold">Example:</span> {selectedTest.example}</p>
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h5 className="text-sm font-black text-white">Which test? Reverse quiz</h5>
                    <button onClick={() => { setFunctionalQuizIndex(i => (i + 1) % functionalQuizData.length); setFunctionalQuizAnswer(''); }} className="btn-secondary text-xs">Next compound</button>
                  </div>
                  <p className="text-sm text-gray-300">Compound: <span className="text-white font-black">{activeFunctionalQuiz.compound}</span></p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    <select value={functionalQuizAnswer} onChange={e => setFunctionalQuizAnswer(e.target.value)} className="input text-sm">
                      <option value="">Choose the best test</option>
                      {functionalTestData.map(test => <option key={test.name} value={test.name}>{test.name}</option>)}
                    </select>
                    <div className={`rounded-lg border p-3 text-xs ${functionalQuizAnswer ? (functionalQuizCorrect ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-100' : 'bg-amber-500/10 border-amber-500/25 text-amber-100') : 'bg-black/20 border-white/10 text-gray-400'}`}>
                      {functionalQuizAnswer ? (functionalQuizCorrect ? activeFunctionalQuiz.expected : `Expected: ${activeFunctionalQuiz.answer}. ${activeFunctionalQuiz.expected}`) : 'Select an answer to check the expected observation.'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'isomerism':
        return (
          <Bench title="Isomerism Explorer" result={structuralIsomers.length ? `${isomerFormula} has ${structuralIsomers.length} listed structural isomer examples in this explorer.` : 'Try C4H10, C2H6O, C3H6O, or C4H8 for structural drawings.'}>
            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <div className="grid md:grid-cols-[220px_1fr] gap-3 items-end">
                  <div>
                    <ControlLabel>Molecular formula</ControlLabel>
                    <input value={isomerFormula} onChange={e => setIsomerFormula(e.target.value)} className="input text-sm" placeholder="C4H10" />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(structuralIsomerData).map(formula => (
                      <button key={formula} onClick={() => setIsomerFormula(formula)} className={`btn-secondary text-xs ${isomerFormula.replace(/\s/g, '') === formula ? 'bg-cyan-500/20 text-cyan-200' : ''}`}>{formula}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {structuralIsomers.length ? structuralIsomers.map(isomer => (
                    <div key={isomer.name} className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <BondLineSketch item={isomer} />
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-sm font-black text-white">{isomer.name}</p>
                        <BadgePill className="bg-blue-500/15 text-blue-300 border-blue-500/25">{isomer.type}</BadgePill>
                      </div>
                      <p className="text-xs font-mono text-cyan-100 mt-1">{isomer.formula}</p>
                    </div>
                  )) : (
                    <div className="md:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-100">No built-in structural set for this formula yet.</div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BadgePill className="bg-violet-500/15 text-violet-300 border-violet-500/25">Section B</BadgePill>
                  <h5 className="text-sm font-black text-white">Stereoisomers</h5>
                </div>
                <StereoSketches />
              </div>

              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">Section C</BadgePill>
                  <h5 className="text-sm font-black text-white">Coordination compound isomerism</h5>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3"><p className="font-bold text-white">Geometric square planar</p><p className="text-gray-400 mt-1">[MA2B2] gives cis/trans arrangements depending on whether identical ligands are adjacent or opposite.</p></div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3"><p className="font-bold text-white">Geometric octahedral</p><p className="text-gray-400 mt-1">[MA2B4] gives cis/trans; [MA3B3] can show facial/meridional forms.</p></div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3"><p className="font-bold text-white">Optical complexes</p><p className="text-gray-400 mt-1">Tris-bidentate complexes like [M(en)3]3+ form non-superimposable delta/lambda mirror images.</p></div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3"><p className="font-bold text-white">Ionization/linkage</p><p className="text-gray-400 mt-1">[Co(NH3)5Br]SO4 vs [Co(NH3)5SO4]Br; NO2- can bind through N as nitro or O as nitrito.</p></div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case 'crystal-defects':
        return (
          <Bench title="Crystal Defects Visualizer" result={defectCrystalType === 'ionic' ? 'Ionic solids commonly show Schottky and Frenkel defects.' : 'Metal crystals mainly show vacancies, interstitials, and substitutional impurities.'}>
            <div className="flex flex-wrap gap-2 mb-3">
              <button onClick={() => setDefectCrystalType('ionic')} className={`btn-secondary text-xs ${defectCrystalType === 'ionic' ? 'bg-indigo-500/20 text-indigo-200' : ''}`}>Ionic compound</button>
              <button onClick={() => setDefectCrystalType('metal')} className={`btn-secondary text-xs ${defectCrystalType === 'metal' ? 'bg-indigo-500/20 text-indigo-200' : ''}`}>Metal crystal</button>
            </div>
            <div className="grid lg:grid-cols-3 gap-3">
              <CrystalGrid mode="perfect" compound={defectCrystalType} />
              <CrystalGrid mode="schottky" compound={defectCrystalType} />
              <CrystalGrid mode="frenkel" compound={defectCrystalType} />
            </div>
            <div className="grid md:grid-cols-3 gap-2 mt-4 text-xs">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Schottky defect</p><p className="text-gray-400 mt-1">Missing cation-anion pairs; density decreases. Common in NaCl, KCl, CsCl, AgBr.</p></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Frenkel defect</p><p className="text-gray-400 mt-1">Small ion leaves lattice site for interstitial; density nearly unchanged. AgCl, AgBr, AgI, ZnS.</p></div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="font-bold text-white">Conductivity</p><p className="text-gray-400 mt-1">Defects increase ionic movement; doping creates electronic conductivity in semiconductors.</p></div>
            </div>
            <div className="mt-4 grid lg:grid-cols-[1fr_0.8fr] gap-3">
              <div>
                <div className="flex gap-2 mb-2">
                  <button onClick={() => setDopingType('n')} className={`btn-secondary text-xs ${dopingType === 'n' ? 'bg-emerald-500/20 text-emerald-200' : ''}`}>n-type</button>
                  <button onClick={() => setDopingType('p')} className={`btn-secondary text-xs ${dopingType === 'p' ? 'bg-pink-500/20 text-pink-200' : ''}`}>p-type</button>
                </div>
                <SiliconDopingSvg type={dopingType} />
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                <p><span className="text-emerald-300 font-semibold">n-type:</span> Si doped with P/As/Sb gives extra electrons.</p>
                <p className="mt-2"><span className="text-pink-300 font-semibold">p-type:</span> Si doped with B/Al/Ga creates electron holes.</p>
                <p className="mt-2">Class 12 link: imperfections explain color, density change, and semiconductor behavior.</p>
              </div>
            </div>
          </Bench>
        );
      case 'crystal-structure':
      default:
        return (
          <Bench title={activeExperiment.title} result="Use the controls below to change the model and observe the result.">
            <div className="grid sm:grid-cols-2 gap-3">
              <div><ControlLabel>Structure</ControlLabel><select value={structureType} onChange={e => setStructureType(e.target.value)} className="input text-sm">{['NaCl', 'CsCl', 'diamond', 'graphite'].map(type => <option key={type}>{type}</option>)}</select></div>
              <div><ControlLabel>Lattice size {latticeSize}</ControlLabel><input type="range" min="2" max="7" value={latticeSize} onChange={e => setLatticeSize(Number(e.target.value))} className="w-full" /></div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 max-w-xs">
              {Array.from({ length: latticeSize * latticeSize }, (_, i) => <span key={i} className="aspect-square rounded-full border border-white/10" style={{ background: i % 2 ? '#38bdf8' : '#a78bfa' }} />)}
            </div>
          </Bench>
        );
    }
  };

  return (
    <div className={`p-4 md:p-6 max-w-7xl mx-auto space-y-4 ${teacherMode ? 'text-[1.08rem]' : ''}`}>
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Chemistry Lab</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Timeline, isotopes, orbitals, formula tools, safety notes, charts, exports, classroom tools, and rule-based chemistry explanations in one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ElementSearchInput value={selectedSymbol} onChange={setSelectedSymbol} className="w-56" />
            <button onClick={tryRandomExample} className="btn-secondary flex items-center gap-2 text-sm"><Sparkles size={14} /> Random</button>
            <button onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')} className="btn-secondary flex items-center gap-2 text-sm">
              <Languages size={14} /> {language === 'en' ? 'English' : 'Hindi'}
            </button>
            <button onClick={speak} className="btn-secondary flex items-center gap-2 text-sm"><Mic2 size={14} /> Pronounce</button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border-white/10 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-300" />
              <h3 className="text-base font-bold text-white">Guided Chemistry Lab</h3>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Pick one experiment at a time, follow simple steps, and use labels to understand what each tool is for.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setGuidedMode(v => !v)} className={`btn-secondary flex items-center gap-2 text-sm ${guidedMode ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/25' : ''}`}>
              <Target size={14} /> Guided Mode
            </button>
            <button onClick={() => setLearningMode(v => !v)} className={`btn-secondary flex items-center gap-2 text-sm ${learningMode ? 'bg-cyan-500/15 text-cyan-200 border-cyan-500/25' : ''}`}>
              <Lightbulb size={14} /> Learning Mode
            </button>
            <button onClick={() => setTeacherMode(!teacherMode)} className={`btn-secondary flex items-center gap-2 text-sm ${teacherMode ? 'bg-amber-500/15 text-amber-200 border-amber-500/25' : ''}`}>
              <GraduationCap size={14} /> Large Text
            </button>
            <button onClick={() => setShowAdvancedLab(v => !v)} className="btn-secondary flex items-center gap-2 text-sm">
              <SlidersHorizontal size={14} /> {showFullLab ? 'Hide Advanced' : 'Show Advanced'}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_260px] gap-4">
          <div className="space-y-3">
            {(recentExperiments.length > 0 || bookmarkedExperiments.length > 0) && (
              <div className="grid lg:grid-cols-2 gap-3">
                {recentExperiments.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-white">Recently Used</p>
                      <span className="text-[10px] text-gray-500">quick jump</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recentExperiments.map(item => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} onClick={() => { setActiveExperimentId(item.id); setActiveLabTab(item.tab); setActiveFocusTopic('all'); setExperimentStarted(true); }} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-gray-300 hover:text-white">
                            <Icon size={11} className="text-cyan-300" /> {item.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {bookmarkedExperiments.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-white">Bookmarked Tools</p>
                      <span className="text-[10px] text-gray-500">{bookmarkedExperiments.length} saved</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bookmarkedExperiments.map(item => {
                        const Icon = item.icon;
                        return (
                          <button key={item.id} onClick={() => { setActiveExperimentId(item.id); setActiveLabTab(item.tab); setActiveFocusTopic('all'); setExperimentStarted(true); }} className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-100 hover:text-white">
                            <Icon size={11} /> {item.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {lastExampleChips.length > 0 && (
              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-black text-white">Last Used Examples</p>
                  <button onClick={() => setLastExampleChips([])} className="text-[10px] text-gray-500 hover:text-gray-300">Clear all</button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lastExampleChips.map(chip => (
                    <span key={chip} className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-gray-300">{chip}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {labFocusTopics.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => selectFocusTopic(topic.id)}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    activeFocusTopic === topic.id
                      ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-100'
                      : 'bg-white/[0.035] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="block text-sm font-bold">{topic.label}</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">{topic.desc}</span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {labTabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveLabTab(tab)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    activeLabTab === tab
                      ? 'bg-indigo-600/25 border-indigo-500/40 text-indigo-100'
                      : 'bg-white/[0.035] border-white/10 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-[1fr_170px_170px_180px_auto] gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  ref={labSearchRef}
                  value={labSearch}
                  onChange={e => { setLabSearch(e.target.value); setShowLabSearchSuggestions(true); }}
                  onFocus={() => setShowLabSearchSuggestions(true)}
                  onBlur={() => window.setTimeout(() => setShowLabSearchSuggestions(false), 120)}
                  placeholder="Try pH, CFT, salt analysis, Gibbs..."
                  className="input text-sm pl-9"
                  title="Press / to search"
                />
                {showLabSearchSuggestions && (
                  <div className="absolute z-30 mt-2 w-full rounded-xl border border-white/10 bg-gray-950 shadow-2xl overflow-hidden">
                    {labSearchSuggestions.topics.length > 0 && (
                      <div className="border-b border-white/10 p-2">
                        <p className="px-1 pb-1 text-[10px] uppercase tracking-widest text-gray-500">Suggested words</p>
                        <div className="flex flex-wrap gap-1">
                          {labSearchSuggestions.topics.map(topic => (
                            <button
                              type="button"
                              key={topic}
                              onMouseDown={e => e.preventDefault()}
                              onClick={() => { setLabSearch(topic); setShowLabSearchSuggestions(false); }}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-300 hover:text-white"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {labSearchSuggestions.matches.length > 0 ? labSearchSuggestions.matches.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setLabSearch(item.title);
                          setActiveExperimentId(item.id);
                          setActiveLabTab(item.tab);
                          setActiveFocusTopic('all');
                          setShowLabSearchSuggestions(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-white/[0.06]"
                      >
                        <span className="block text-sm font-semibold text-white">{item.title}</span>
                        <span className="block text-[11px] text-gray-500">{item.topic} - {item.type} - {item.difficulty}</span>
                      </button>
                    )) : (
                      <div className="px-3 py-3 text-xs text-gray-500">No matching lab suggestion.</div>
                    )}
                  </div>
                )}
              </div>
              <select value={labTypeFilter} onChange={e => setLabTypeFilter(e.target.value)} className="input text-sm">
                {labTypes.map(type => <option key={type}>{type}</option>)}
              </select>
              <select value={labDifficultyFilter} onChange={e => setLabDifficultyFilter(e.target.value)} className="input text-sm">
                {labDifficulties.map(level => <option key={level}>{level}</option>)}
              </select>
              <select value={activeSyllabusFilter} onChange={e => setActiveSyllabusFilter(e.target.value)} className="input text-sm">
                <option value="all">All syllabus</option>
                {syllabusTracks.map(track => <option key={track.id} value={track.id}>{track.label}</option>)}
              </select>
              <button onClick={clearLabFilters} disabled={!filtersActive} className="btn-secondary text-xs disabled:opacity-40">Clear filters</button>
            </div>

            {activeLabTab === 'Start Here' && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2 text-emerald-200 font-bold text-sm">
                  <GraduationCap size={16} />
                  Recommended beginner path
                </div>
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {recommendedPath.map((item, index) => {
                    const Icon = item.icon;
                    const done = completedExperiments.includes(item.id);
                    return (
                      <button key={item.id} onClick={() => { setActiveExperimentId(item.id); setActiveLabTab(item.tab); }} className="text-left rounded-xl bg-black/15 border border-white/10 p-3 hover:bg-white/[0.06] transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-200">{index + 1}</span>
                          <Icon size={15} className="text-emerald-300" />
                          {done && <CheckCircle size={14} className="ml-auto text-emerald-300" />}
                        </div>
                        <p className="text-xs font-bold text-white mt-2">{item.title}</p>
                        <p className="text-[11px] text-gray-400 mt-1">{item.teaches}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeFocusTopic ? (
              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-center">
                <FlaskConical size={30} className="text-cyan-300 mx-auto" />
                <p className="text-base font-bold text-white mt-3">Choose a chemistry area to begin</p>
                <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">
                  Experiments stay hidden until you select a category. This keeps the lab focused for students.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <p className="text-sm font-bold text-emerald-100">{activeFocusInfo?.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{activeFocusInfo?.desc}</p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>{visibleExperiments.length} related experiments</span>
                      <span>{categoryCompleteCount}/{visibleExperiments.length} done</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-400" style={{ width: `${categoryProgress}%` }} />
                    </div>
                  </div>
                </div>

                {activeRoadmap && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-black text-white">{activeRoadmap.title}</p>
                        <p className="text-xs text-gray-500 mt-1">Structure, lab method, and medical use stay linked while you move through tools.</p>
                      </div>
                      <BadgePill className="bg-black/15 text-gray-200 border-white/10" style={{ borderColor: `${activeRoadmap.accent}66`, color: activeRoadmap.accent }}>applied track</BadgePill>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {activeRoadmap.strands.map(([title, detail], index) => (
                        <div key={title} className="rounded-xl bg-black/20 border border-white/10 p-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: `${activeRoadmap.accent}22`, color: activeRoadmap.accent, border: `1px solid ${activeRoadmap.accent}55` }}>{index + 1}</span>
                            <p className="text-xs font-bold text-white">{title}</p>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">{detail}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                  {visibleExperiments.map(item => {
                    const Icon = item.icon;
                    const active = activeExperiment.id === item.id;
                    const done = completedExperiments.includes(item.id);
                    return (
                      <button
                    key={item.id}
                        onClick={() => { setActiveExperimentId(item.id); setExperimentStarted(false); setShowQuizAnswer(false); }}
                        className={`text-left rounded-2xl border p-3 transition-colors ${
                          active ? 'bg-indigo-600/20 border-indigo-500/40' : 'bg-white/[0.035] border-white/10 hover:bg-white/[0.065]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                            <Icon size={17} className="text-cyan-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">{item.title}</p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {newLabToolIds.has(item.id) && <BadgePill className="bg-amber-500/15 text-amber-300 border-amber-500/25">New</BadgePill>}
                              <BadgePill className={difficultyStyles[item.difficulty]}>{item.difficulty}</BadgePill>
                              <BadgePill className={typeStyles[item.type]}>{item.type}</BadgePill>
                              <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">{estimatedMinutes(item)} min</BadgePill>
                            </div>
                          </div>
                          {done && <CheckCircle size={15} className="text-emerald-300 flex-shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">{item.teaches}</p>
                        <p className="text-[10px] text-cyan-300 mt-2">Best for: {experimentBestFor(item)}</p>
                      </button>
                    );
                  })}
                </div>

                {visibleExperiments.length === 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-center">
                    <p className="text-sm font-semibold text-gray-300">No experiment matches this focus.</p>
                    <p className="text-xs text-gray-500 mt-1">Try clearing search or switching to All.</p>
                    <button onClick={clearLabFilters} className="btn-secondary text-xs mt-3">Clear filters</button>
                  </div>
                )}

                <div className={focusLab ? 'fixed inset-4 z-50 overflow-y-auto rounded-2xl bg-gray-950 border border-white/15 p-4 shadow-2xl' : ''}>
                  {focusLab && (
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-bold text-white">Focus Lab: {activeExperiment.title}</p>
                      <button onClick={() => setFocusLab(false)} className="btn-secondary text-sm">Close Focus</button>
                    </div>
                  )}
                  {!experimentStarted ? (
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-center">
                      <p className="text-sm font-bold text-white">Ready to begin {activeExperiment.title}?</p>
                      <p className="text-xs text-gray-500 mt-1">Read the experiment details, then start the live lab bench.</p>
                      <button onClick={() => setExperimentStarted(true)} className="btn-primary mt-4" title="Start the selected lab tool">Start Experiment</button>
                    </div>
                  ) : (
                    renderGuidedWorkbench()
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 h-fit lg:sticky lg:top-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <ActiveExperimentIcon size={20} className="text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`${teacherMode ? 'text-base' : 'text-sm'} font-black text-white`}>{activeExperiment.title}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {newLabToolIds.has(activeExperiment.id) && <BadgePill className="bg-amber-500/15 text-amber-300 border-amber-500/25">New</BadgePill>}
                  <BadgePill className={difficultyStyles[activeExperiment.difficulty]}>{activeExperiment.difficulty}</BadgePill>
                  <BadgePill className={typeStyles[activeExperiment.type]}>{activeExperiment.type}</BadgePill>
                  {activeExperiment.type === 'Visualizer' && <BadgePill className="bg-blue-500/15 text-blue-300 border-blue-500/25">Visual</BadgePill>}
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">{estimatedMinutes(activeExperiment)} min</BadgePill>
                  <BadgePill className="bg-white/[0.04] text-gray-300 border-white/10">{activeExperiment.topic}</BadgePill>
                  {activeSyllabusTags.tracks.map(trackId => (
                    <BadgePill
                      key={trackId}
                      className="bg-black/15 border-white/10"
                      style={{ borderColor: `${syllabusTrackMap[trackId]?.color || '#64748b'}66`, color: syllabusTrackMap[trackId]?.color }}
                    >
                      {syllabusTrackMap[trackId]?.label}
                    </BadgePill>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-cyan-300">Best for: {experimentBestFor(activeExperiment)}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Guided progress</span>
                <span>{completedCount}/{LAB_EXPERIMENTS.length} complete</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {copiedLabAction && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-100">
                  {copiedLabAction}
                </div>
              )}
              {validationMessage && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-100">
                  <span className="font-semibold">Check input:</span> {validationMessage}
                </div>
              )}
              <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                <button onClick={() => setShowTheoryDetails(v => !v)} className="w-full flex items-center justify-between gap-2 text-left">
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">About Experiment</span>
                  <span className="text-[10px] text-gray-500">{showTheoryDetails ? 'Collapse' : 'Expand'}</span>
                </button>
                {showTheoryDetails && (
                  <>
                    <p className="text-sm text-gray-300 mt-1">{activeExperiment.teaches}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="text-cyan-300 font-semibold">Prerequisite:</span> {prerequisiteMap[activeExperiment.id] || 'No special prerequisite. Start with the visible controls and observe the result.'}
                    </p>
                  </>
                )}
              </div>
              {learningMode && !studentPractice && (
                <>
                  <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">What To Do</p>
                    <ol className="mt-2 space-y-1">
                      {activeExperiment.steps.map((step, index) => (
                        <li key={step} className="text-xs text-gray-300 flex gap-2 items-start">
                          <button onClick={() => toggleStepDone(index)} className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 ${activeStepsDone.includes(index) ? 'bg-emerald-500/25 text-emerald-200' : 'bg-cyan-500/15 text-cyan-200'}`}>
                            {activeStepsDone.includes(index) ? '✓' : index + 1}
                          </button>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[10px] text-gray-500">Step {Math.min(activeStepsDone.length + 1, activeExperiment.steps.length)} of {activeExperiment.steps.length}</p>
                  </div>
                  <div className="rounded-xl bg-black/15 border border-white/10 p-3 space-y-2 text-xs">
                    <p className="text-gray-300"><span className="text-cyan-300 font-semibold">Try this:</span> {activeExperiment.tryThis}</p>
                    <p className="text-gray-300"><span className="text-emerald-300 font-semibold" title="Core rule or formula behind this tool">How it works:</span> {activeExperiment.result}</p>
                    <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-2 text-violet-100"><span className="text-violet-300 font-semibold">Real-world use:</span> {activeExperiment.realWorld}</div>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-2 text-amber-100"><span className="text-amber-300 font-semibold" title="A common exam or lab error">Common mistake:</span> {commonMistakes[activeExperiment.id] || 'Changing too many controls at once makes observations harder to explain.'}</div>
                    {formulaNotes[activeExperiment.id] && showFormulaDetails && (
                      <p className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-blue-100" title="Formula card">
                        <span className="text-blue-300 font-semibold">Formula note:</span> {formulaNotes[activeExperiment.id]}
                      </p>
                    )}
                    {formulaNotes[activeExperiment.id] && (
                      <button onClick={() => setShowFormulaDetails(v => !v)} className="text-[10px] text-blue-300 hover:text-blue-100">
                        {showFormulaDetails ? 'Hide formula' : 'Show formula'}
                      </button>
                    )}
                    {activeExperiment.safety && <p className="text-amber-300"><span className="font-semibold">Safety:</span> {activeExperiment.safety}</p>}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => toggleBookmark(activeExperiment.id)} className={`btn-secondary text-xs ${bookmarkedLabs.includes(activeExperiment.id) ? 'bg-amber-500/15 text-amber-200 border-amber-500/25' : ''}`}>
                {bookmarkedLabs.includes(activeExperiment.id) ? 'Bookmarked' : 'Bookmark'}
              </button>
              <button onClick={applyExampleValues} className="btn-secondary text-xs">Example Values</button>
              <button onClick={tryRandomExample} className="btn-secondary text-xs">Try Random</button>
              <button onClick={shareActiveSetup} className="btn-secondary text-xs">Share Setup</button>
              <button onClick={openActiveFullscreen} className="btn-secondary text-xs" disabled={!experimentStarted} title={experimentStarted ? 'Open the current lab visualization in fullscreen' : 'Start the experiment first'}>Fullscreen</button>
              <button onClick={exportActiveVisualization} className="btn-secondary text-xs" disabled={!experimentStarted} title={experimentStarted ? 'Export the first SVG visualization' : 'Start the experiment first'}>Export Image</button>
              <button onClick={() => setFocusLab(true)} className="btn-secondary text-xs">Focus Lab</button>
              <button onClick={() => setTeacherMode(!teacherMode)} className="btn-secondary text-xs">{teacherMode ? 'Teacher Demo On' : 'Teacher Demo'}</button>
              <button onClick={() => setStudentPractice(v => !v)} className={`btn-secondary text-xs ${studentPractice ? 'bg-pink-500/15 text-pink-200 border-pink-500/25' : ''}`}>{studentPractice ? 'Practice Mode On' : 'Practice Mode'}</button>
              <button onClick={() => setShowManual(v => !v)} className="btn-secondary text-xs">Lab Manual</button>
            </div>

            {studentPractice && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Mini Quiz</p>
                <p className="text-xs text-gray-300 mt-2">{miniQuiz[activeExperiment.id]?.q || `What did changing the controls teach you about ${activeExperiment.topic}?`}</p>
                <button onClick={() => setShowQuizAnswer(v => !v)} className="btn-secondary text-xs mt-2">{showQuizAnswer ? 'Hide Answer' : 'Show Answer'}</button>
                {showQuizAnswer && <p className="text-xs text-emerald-200 mt-2">{miniQuiz[activeExperiment.id]?.a || activeExperiment.result}</p>}
              </div>
            )}

            {showManual && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3 space-y-2 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Lab Manual</p>
                <p><span className="text-cyan-300 font-semibold">Aim:</span> {activeExperiment.teaches}</p>
                <p><span className="text-cyan-300 font-semibold">Apparatus:</span> Interactive controls, observation panel, result display.</p>
                <p><span className="text-cyan-300 font-semibold">Theory:</span> {activeExperiment.result}</p>
                <p><span className="text-cyan-300 font-semibold">Procedure:</span> {activeExperiment.steps.join(' ')}</p>
                <p><span className="text-cyan-300 font-semibold">Viva:</span> {miniQuiz[activeExperiment.id]?.q || 'Explain the result in one sentence.'}</p>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Lab Notebook</p>
              <textarea
                value={labNotes[activeExperiment.id] || ''}
                onChange={e => setLabNotes(items => ({ ...items, [activeExperiment.id]: e.target.value }))}
                className="input min-h-20 text-sm"
                placeholder="Write observations, measurements, and conclusion..."
              />
            </div>

            <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Observe - Measure - Conclude</p>
              <p className="text-xs text-gray-300"><span className="text-cyan-300 font-semibold">Observe:</span> {activeExperiment.tryThis}</p>
              <p className="text-xs text-gray-300"><span className="text-emerald-300 font-semibold">Measure:</span> {activeResultText()}</p>
              <p className="text-xs text-gray-300"><span className="text-violet-300 font-semibold">Conclude:</span> {activeExperiment.result}</p>
            </div>

            {activeExperiment.type === 'Visualizer' && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Visualization Legend</p>
                <div className="flex flex-wrap gap-1">
                  <BadgePill className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25">x-axis / horizontal</BadgePill>
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">y-axis / vertical</BadgePill>
                  <BadgePill className="bg-violet-500/15 text-violet-300 border-violet-500/25">z-axis / depth</BadgePill>
                  <BadgePill className="bg-white/[0.08] text-gray-200 border-white/15">high-contrast grid</BadgePill>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => applyActivePreset('acidic')} className="btn-secondary text-xs">Acidic</button>
              <button onClick={() => applyActivePreset('neutral')} className="btn-secondary text-xs">Neutral</button>
              <button onClick={() => applyActivePreset('basic')} className="btn-secondary text-xs">Basic/Fast</button>
              <button onClick={resetActiveExperiment} className="btn-secondary text-xs">Reset Experiment</button>
              <button onClick={() => saveSnapshot('A')} className="btn-secondary text-xs">Save A</button>
              <button onClick={() => saveSnapshot('B')} className="btn-secondary text-xs">Save B</button>
              <button onClick={() => window.print()} className="btn-secondary text-xs">Print Worksheet</button>
              <button onClick={exportActiveResult} className="btn-secondary text-xs">Export Result</button>
              <button onClick={clearCompareSnapshots} className="btn-secondary text-xs">Clear all graphs</button>
              <button onClick={() => moveExperiment(-1)} className="btn-secondary text-sm flex items-center justify-center gap-1">
                <ChevronLeft size={14} /> Previous
              </button>
              <button onClick={() => moveExperiment(1)} className="btn-secondary text-sm flex items-center justify-center gap-1">
                Next <ChevronRight size={14} />
              </button>
              <button onClick={markActiveComplete} className={`col-span-2 btn-primary text-sm flex items-center justify-center gap-2 ${isActiveComplete ? 'opacity-80' : ''}`}>
                <CheckCircle size={15} /> {isActiveComplete ? 'Completed' : 'Mark Complete'}
              </button>
              <button onClick={resetGuidedProgress} className="col-span-2 text-xs text-gray-500 hover:text-gray-300 py-1">
                Reset guided progress
              </button>
            </div>

            {relatedExperiments.length > 0 && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">Related tools</p>
                <div className="space-y-1">
                  {relatedExperiments.map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.id} onClick={() => { setActiveExperimentId(item.id); setActiveLabTab(item.tab); setActiveFocusTopic('all'); setExperimentStarted(true); }} className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-gray-300 hover:bg-white/[0.05] hover:text-white">
                        <Icon size={13} className="text-cyan-300" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {compareSnapshots[activeExperiment.id] && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {['A', 'B'].map(slot => (
                  <div key={slot} className="rounded-xl bg-white/[0.035] border border-white/10 p-2">
                    <p className="text-gray-500">Snapshot {slot}</p>
                    <p className="text-gray-200 mt-1">{compareSnapshots[activeExperiment.id]?.[slot]?.result || 'Not saved'}</p>
                    {compareSnapshots[activeExperiment.id]?.[slot]?.savedAt && <p className="text-[10px] text-gray-600 mt-1">{compareSnapshots[activeExperiment.id][slot].savedAt}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFullLab && (
      <>
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
            <ElementSearchInput value={selectedSymbol} onChange={setSelectedSymbol} allowedSymbols={['H', 'He', 'Li', 'Na', 'K', 'Ca', 'Cu']} className="mb-3" />
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
            <ElementSearchInput value={flameElement} onChange={setFlameElement} allowedSymbols={Object.keys(flameColors)} className="mb-3" placeholder="Search available metal ions" />
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
              <ElementSearchInput value={polarityA} onChange={setPolarityA} />
              <ElementSearchInput value={polarityB} onChange={setPolarityB} />
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

        <Section icon={Download} title="Print, Export, Offline">
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => window.print()} className="btn-secondary text-xs flex items-center gap-1 justify-center"><Printer size={13} /> Print/PDF</button>
            <button onClick={exportJson} className="btn-secondary text-xs flex items-center gap-1 justify-center"><Download size={13} /> Export</button>
          </div>
          <p className="text-xs text-gray-500 mt-3">The app runs from local datasets, can print through the browser, exports the selected element pack as JSON, and caches assets through the service worker.</p>
        </Section>

        <Section icon={Brain} title="Concept Helper">
          <textarea value={conceptQuestion} onChange={e => setConceptQuestion(e.target.value)} className="input min-h-20 text-sm" />
          <div className="mt-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-100">{conceptAnswer}</div>
          <p className="text-[10px] text-gray-600 mt-2">Rule-based helper for a small set of built-in chemistry explanations.</p>
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
      </>
      )}
    </div>
  );
};

export default ChemistryLabPage;
