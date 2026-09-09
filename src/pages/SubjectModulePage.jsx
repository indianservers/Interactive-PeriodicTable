import { useMemo, useState } from 'react';
import {
  Activity, Atom, BadgeCheck, BarChart3, BookOpen, Boxes, Brain, ChevronRight,
  FlaskConical, GitCompare, Orbit, Pill, Route, Search, Sigma, Sparkles,
  TestTube2, Waves, Zap,
} from 'lucide-react';
import { MiniMolecule3D } from '../components/visualizers/MiniMolecule3D.jsx';

const moduleMeta = {
  'organic-reaction-visualizer': {
    title: 'Organic Chemistry Reaction Visualizer',
    eyebrow: 'Mechanisms, named reactions, arrows, energy',
    icon: Route,
    accent: '#22c55e',
  },
  'spectroscopy-interpreter': {
    title: 'Spectroscopy Interpreter',
    eyebrow: 'NMR, IR, mass spec, reverse practice',
    icon: BarChart3,
    accent: '#38bdf8',
  },
  'biochemistry-module': {
    title: 'Biochemistry Module',
    eyebrow: 'Amino acids, proteins, pathways, enzymes, DNA, membranes',
    icon: Brain,
    accent: '#a78bfa',
  },
  'inorganic-deep-module': {
    title: 'Inorganic Chemistry Deep Module',
    eyebrow: 'd/f-block, coordination, CFT, metallurgy, salt analysis',
    icon: Atom,
    accent: '#f59e0b',
  },
  'physical-simulators': {
    title: 'Physical Chemistry Simulators',
    eyebrow: 'Thermo, kinetics, electrochem, phase, colligative, solids',
    icon: Activity,
    accent: '#14b8a6',
  },
  'iupac-nomenclature': {
    title: 'IUPAC Nomenclature Practice Tool',
    eyebrow: 'Structure to name, name to structure, stereo and coordination',
    icon: BookOpen,
    accent: '#fb7185',
  },
  'retrosynthesis-planner': {
    title: 'Retrosynthesis and Synthesis Planner',
    eyebrow: 'Disconnections, reagents, forward prediction',
    icon: GitCompare,
    accent: '#f97316',
  },
};

const namedReactionNames = [
  'SN1 solvolysis', 'SN2 substitution', 'E1 dehydration', 'E2 dehydrohalogenation',
  'Friedel-Crafts alkylation', 'Friedel-Crafts acylation', 'Nitration of benzene',
  'Sulfonation', 'Halogenation of benzene', 'Aldol condensation', 'Cannizzaro',
  'Claisen condensation', 'Grignard addition', 'Wittig olefination', 'Diels-Alder',
  'Williamson ether synthesis', 'Wurtz reaction', 'Kolbe-Schmitt', 'Reimer-Tiemann',
  'Sandmeyer', 'Gattermann', 'Hell-Volhard-Zelinsky', 'Hofmann rearrangement',
  'Beckmann rearrangement', 'Pinacol rearrangement', 'Baeyer-Villiger oxidation',
  'Clemmensen reduction', 'Wolff-Kishner reduction', 'Birch reduction',
  'Ozonolysis', 'Hydroboration oxidation', 'Markovnikov hydration',
  'Anti-Markovnikov peroxide addition', 'Gabriel phthalimide synthesis',
  'Strecker synthesis', 'Fischer esterification', 'Transesterification',
  'Saponification', 'Acetal formation', 'Diazotization', 'Azo coupling',
  'Michael addition', 'Robinson annulation', 'Mannich reaction', 'Perkin reaction',
  'Hunsdiecker', 'Finkelstein', 'Swarts', 'Rosenmund reduction', 'Etard oxidation',
  'Stephen reduction', 'Tollens oxidation', 'Iodoform reaction',
];

const mechanisms = {
  sn1: {
    label: 'SN1',
    steps: ['Leaving group departs', 'Planar carbocation forms', 'Nucleophile attacks either face', 'Deprotonation gives substitution product'],
    arrows: ['C-LG bond electrons move to leaving group', 'Nu lone pair attacks carbocation', 'Base removes H'],
    energy: [18, 76, 48, 62, 26],
    note: 'Favored by tertiary substrate, polar protic solvent, weak nucleophile. Racemization is common.',
  },
  sn2: {
    label: 'SN2',
    steps: ['Backside approach', 'Concerted C-Nu formation and C-LG breaking', 'Walden inversion product'],
    arrows: ['Nu lone pair attacks antibonding C-LG orbital', 'C-LG bond breaks in the same step'],
    energy: [18, 72, 22],
    note: 'Favored by methyl/primary substrate, strong nucleophile, polar aprotic solvent.',
  },
  e1: {
    label: 'E1',
    steps: ['Leaving group departs', 'Carbocation forms', 'Base removes beta-H', 'Alkene forms'],
    arrows: ['C-LG bond breaks', 'C-H bond electrons form pi bond'],
    energy: [20, 70, 44, 55, 24],
    note: 'Competes with SN1; heat and weak base favor elimination.',
  },
  e2: {
    label: 'E2',
    steps: ['Anti-periplanar beta-H aligns', 'Base removes beta-H', 'Pi bond forms as leaving group exits'],
    arrows: ['Base-H bond forms', 'C-H electrons form C=C', 'C-LG electrons leave'],
    energy: [20, 74, 25],
    note: 'Concerted, stereospecific, favored by strong base.',
  },
  eas: {
    label: 'Electrophilic aromatic substitution',
    steps: ['Electrophile generated', 'Aromatic pi electrons attack', 'Sigma complex forms', 'Deprotonation restores aromaticity'],
    arrows: ['Arene pi bond attacks E+', 'C-H bond electrons restore ring pi bond'],
    energy: [16, 58, 78, 36],
    note: 'Substituents control activation and ortho/meta/para direction.',
  },
  aldol: {
    label: 'Aldol condensation',
    steps: ['Base forms enolate', 'Enolate attacks carbonyl', 'Beta-hydroxy carbonyl forms', 'Dehydration gives enone'],
    arrows: ['Alpha C-H electrons form enolate', 'Enolate attacks C=O', 'E1cb elimination'],
    energy: [18, 46, 34, 52, 28],
    note: 'Forms C-C bonds; dehydration is favored by heat.',
  },
  grignard: {
    label: 'Grignard addition',
    steps: ['RMgX behaves as carbanion equivalent', 'Carbonyl attack', 'Alkoxide forms', 'Acid workup gives alcohol'],
    arrows: ['C-Mg bond attacks carbonyl carbon', 'C=O pi electrons move to oxygen', 'O- protonates'],
    energy: [16, 50, 30, 24],
    note: 'Water destroys Grignard reagents; dry ether is essential.',
  },
};

const spectroscopySamples = {
  ethanol: {
    name: 'Ethanol', formula: 'CH3CH2OH',
    nmr: [{ x: 1.2, h: 62, label: 't, 3H' }, { x: 3.65, h: 78, label: 'q, 2H' }, { x: 2.1, h: 34, label: 'br, OH' }],
    c13: [{ x: 18, h: 68, label: 'CH3' }, { x: 58, h: 86, label: 'CH2-O' }],
    ir: [{ x: 3350, h: 78, label: 'O-H broad' }, { x: 2950, h: 45, label: 'C-H' }, { x: 1050, h: 66, label: 'C-O' }],
    ms: [{ x: 31, h: 90, label: 'CH2OH+' }, { x: 45, h: 58, label: 'M-1' }, { x: 46, h: 42, label: 'M+' }],
    uv: [{ x: 205, h: 42, label: 'sigma region' }],
    cosy: [{ x: 1.2, h: 60, label: 'CH3-CH2' }, { x: 3.65, h: 78, label: 'CH2-CH3' }, { x: 2.1, h: 30, label: 'OH weak' }],
    clues: ['Broad O-H stretch', 'Ethyl triplet/quartet pair', 'm/z 31 alcohol fragment', '13C shows two carbon environments', 'COSY connects the ethyl CH3 and CH2 signals'],
  },
  acetophenone: {
    name: 'Acetophenone', formula: 'C6H5COCH3',
    nmr: [{ x: 2.6, h: 70, label: 's, 3H' }, { x: 7.45, h: 54, label: 'Ar-H' }, { x: 7.9, h: 68, label: 'Ar-H' }],
    c13: [{ x: 26, h: 58, label: 'COCH3' }, { x: 128, h: 54, label: 'Ar C' }, { x: 137, h: 48, label: 'ipso C' }, { x: 198, h: 92, label: 'C=O' }],
    ir: [{ x: 1685, h: 82, label: 'C=O' }, { x: 3050, h: 42, label: 'aryl C-H' }, { x: 1600, h: 44, label: 'aryl C=C' }],
    ms: [{ x: 43, h: 70, label: 'COCH3+' }, { x: 77, h: 55, label: 'Ph+' }, { x: 105, h: 92, label: 'benzoyl' }, { x: 120, h: 36, label: 'M+' }],
    uv: [{ x: 245, h: 66, label: 'aryl pi-pi*' }, { x: 278, h: 44, label: 'n-pi*' }],
    cosy: [{ x: 7.45, h: 64, label: 'Ar ortho/meta' }, { x: 7.9, h: 72, label: 'Ar neighbors' }],
    clues: ['Conjugated ketone carbonyl', 'Aromatic multiplet', 'Strong benzoyl fragment', '13C carbonyl near 198 ppm', 'UV band supports aromatic conjugation'],
  },
  ethylAcetate: {
    name: 'Ethyl acetate', formula: 'CH3COOCH2CH3',
    nmr: [{ x: 1.25, h: 58, label: 't, 3H' }, { x: 2.05, h: 60, label: 's, 3H' }, { x: 4.12, h: 78, label: 'q, 2H' }],
    c13: [{ x: 14, h: 54, label: 'CH3CH2' }, { x: 21, h: 62, label: 'COCH3' }, { x: 60, h: 78, label: 'OCH2' }, { x: 171, h: 88, label: 'ester C=O' }],
    ir: [{ x: 1740, h: 88, label: 'ester C=O' }, { x: 1250, h: 70, label: 'C-O' }, { x: 2980, h: 44, label: 'C-H' }],
    ms: [{ x: 43, h: 90, label: 'acylium' }, { x: 61, h: 50, label: 'rearr.' }, { x: 88, h: 35, label: 'M+' }],
    uv: [{ x: 210, h: 38, label: 'weak carbonyl' }],
    cosy: [{ x: 1.25, h: 60, label: 'Et CH3-CH2' }, { x: 4.12, h: 80, label: 'OCH2-CH3' }],
    clues: ['Ester carbonyl near 1740 cm-1', 'Ethoxy quartet/triplet', 'Acetyl methyl singlet', '13C separates ester C=O from OCH2', 'No strong visible chromophore'],
  },
  benzaldehyde: {
    name: 'Benzaldehyde', formula: 'C6H5CHO',
    nmr: [{ x: 9.95, h: 82, label: 's, 1H CHO' }, { x: 7.55, h: 58, label: 'Ar-H' }, { x: 7.85, h: 68, label: 'Ar-H' }],
    c13: [{ x: 128, h: 56, label: 'Ar C' }, { x: 134, h: 48, label: 'ipso C' }, { x: 192, h: 90, label: 'CHO C=O' }],
    ir: [{ x: 1700, h: 84, label: 'aryl C=O' }, { x: 2820, h: 42, label: 'CHO C-H' }, { x: 2720, h: 36, label: 'CHO C-H' }],
    ms: [{ x: 77, h: 52, label: 'Ph+' }, { x: 105, h: 100, label: 'PhCO+' }, { x: 106, h: 42, label: 'M+' }],
    uv: [{ x: 250, h: 70, label: 'aryl pi-pi*' }, { x: 285, h: 48, label: 'n-pi*' }],
    cosy: [{ x: 7.55, h: 60, label: 'Ar network' }, { x: 7.85, h: 72, label: 'Ar ortho' }, { x: 9.95, h: 30, label: 'CHO weak' }],
    clues: ['Aldehyde proton near 10 ppm', 'Aldehyde C-H doublet region in IR', '13C aldehyde carbonyl near 192 ppm', 'Benzoyl fragment at m/z 105', 'UV supports aromatic carbonyl conjugation'],
  },
};

const aminoAcids = [
  ['Glycine', 'Gly', 'G', 'nonpolar', 2.34, 9.60, null, 'small flexible linker'],
  ['Alanine', 'Ala', 'A', 'nonpolar', 2.34, 9.69, null, 'hydrophobic helix former'],
  ['Valine', 'Val', 'V', 'nonpolar', 2.32, 9.62, null, 'branched hydrophobic core'],
  ['Leucine', 'Leu', 'L', 'nonpolar', 2.36, 9.60, null, 'protein core packing'],
  ['Isoleucine', 'Ile', 'I', 'nonpolar', 2.36, 9.68, null, 'beta-branched hydrophobe'],
  ['Methionine', 'Met', 'M', 'nonpolar sulfur', 2.28, 9.21, null, 'start residue and thioether'],
  ['Phenylalanine', 'Phe', 'F', 'aromatic', 1.83, 9.13, null, 'pi stacking'],
  ['Tyrosine', 'Tyr', 'Y', 'aromatic polar', 2.20, 9.11, 10.1, 'phenolic phosphorylation'],
  ['Tryptophan', 'Trp', 'W', 'aromatic', 2.38, 9.39, null, 'UV absorbance'],
  ['Serine', 'Ser', 'S', 'polar', 2.21, 9.15, null, 'H bonding and phosphorylation'],
  ['Threonine', 'Thr', 'T', 'polar', 2.09, 9.10, null, 'H bonding side chain'],
  ['Cysteine', 'Cys', 'C', 'polar sulfur', 1.96, 10.28, 8.3, 'disulfide bonds'],
  ['Asparagine', 'Asn', 'N', 'polar amide', 2.02, 8.80, null, 'H bonding amide'],
  ['Glutamine', 'Gln', 'Q', 'polar amide', 2.17, 9.13, null, 'nitrogen transport'],
  ['Aspartate', 'Asp', 'D', 'acidic', 1.88, 9.60, 3.9, 'negative at pH 7'],
  ['Glutamate', 'Glu', 'E', 'acidic', 2.19, 9.67, 4.2, 'negative at pH 7'],
  ['Lysine', 'Lys', 'K', 'basic', 2.18, 8.95, 10.5, 'positive side chain'],
  ['Arginine', 'Arg', 'R', 'basic', 2.17, 9.04, 12.5, 'guanidinium salt bridges'],
  ['Histidine', 'His', 'H', 'basic aromatic', 1.82, 9.17, 6.0, 'enzyme acid/base catalysis'],
  ['Proline', 'Pro', 'P', 'cyclic imino', 1.99, 10.60, null, 'turns and kinks'],
].map(([name, three, one, group, pKa1, pKa2, sideChainPka, role]) => ({ name, three, one, group, pKa1, pKa2, sideChainPka, role }));

const pathwaySteps = {
  glycolysis: ['Glucose', 'G6P', 'F6P', 'F1,6BP', 'G3P', '1,3BPG', '3PG', '2PG', 'PEP', 'Pyruvate'],
  tca: ['Acetyl-CoA', 'Citrate', 'Isocitrate', 'alpha-KG', 'Succinyl-CoA', 'Succinate', 'Fumarate', 'Malate', 'Oxaloacetate'],
  etc: ['NADH', 'Complex I', 'Q', 'Complex III', 'cyt c', 'Complex IV', 'O2 to H2O', 'ATP synthase'],
  dogma: ['DNA', 'mRNA', 'Ribosome', 'Polypeptide', 'Folded protein', 'Function'],
};

const dBlockElements = [
  ['Ti', 4, ['+3', '+4'], 'violet Ti(III), colorless Ti(IV)', 'd1/d0 contrast'],
  ['V', 5, ['+2', '+3', '+4', '+5'], 'purple, green, blue, yellow series', 'multiple redox colors'],
  ['Cr', 6, ['+2', '+3', '+6'], 'green Cr(III), orange dichromate', 'chromate/dichromate pH'],
  ['Mn', 7, ['+2', '+4', '+7'], 'pink Mn(II), purple permanganate', 'strong oxidant at +7'],
  ['Fe', 8, ['+2', '+3'], 'pale green Fe(II), yellow/brown Fe(III)', 'spin state and ligand effects'],
  ['Co', 9, ['+2', '+3'], 'pink/blue Co(II), inert Co(III)', 'coordination isomerism'],
  ['Ni', 10, ['+2'], 'green Ni(II)', 'square planar vs octahedral'],
  ['Cu', 11, ['+1', '+2'], 'blue Cu(II)', 'Jahn-Teller distortion'],
];

const physicalSystems = {
  phase: { title: 'Phase Diagram', controls: ['temperature', 'pressure'], formula: 'phase = f(T, P)', takeaway: 'Crossing a boundary changes state; high T and P can reach supercritical fluid.' },
  thermo: { title: 'Thermodynamics Sandbox', controls: ['deltaH', 'deltaS', 'temperature'], formula: 'Delta G = Delta H - T Delta S', takeaway: 'Negative Delta G predicts spontaneity under the chosen conditions.' },
  kinetics: { title: 'Chemical Kinetics', controls: ['k', 'order', 'temperature'], formula: 'k = A e^(-Ea/RT)', takeaway: 'Temperature changes rate exponentially through the Arrhenius relation.' },
  electrochem: { title: 'Electrochemistry Lab', controls: ['Ecell', 'n', 'Q'], formula: 'E = E0 - (0.0592/n) log Q', takeaway: 'Cell voltage falls as products accumulate.' },
  colligative: { title: 'Colligative Properties', controls: ['molality', 'i factor'], formula: 'Delta Tb = i Kb m; pi = iMRT', takeaway: 'Particle count matters more than particle identity.' },
  solid: { title: 'Solid State Viewer', controls: ['unit cell', 'edge length'], formula: 'density = ZM / (NA a^3)', takeaway: 'BCC, FCC and HCP differ in packing, Z and coordination number.' },
};

const nomenclatureCards = [
  { structure: 'CH3-CH2-CH2-CH3', name: 'butane', rule: 'Longest four-carbon chain; suffix -ane.' },
  { structure: 'CH3-CH(OH)-CH3', name: 'propan-2-ol', rule: 'OH gets lowest locant and alcohol suffix.' },
  { structure: 'CH3-CH=CH-CH3', name: 'but-2-ene', rule: 'Double bond gets locant 2; add E/Z when geometry is known.' },
  { structure: '[Co(NH3)5Cl]Cl2', name: 'pentaamminechloridocobalt(III) chloride', rule: 'Name ligands alphabetically, then metal oxidation state.' },
  { structure: 'BrCH2-CH(CH3)-COOH', name: '3-bromo-2-methylpropanoic acid', rule: 'Carboxylic acid carbon is C1.' },
];

const retrosynthesisTargets = {
  aspirin: {
    target: 'Aspirin',
    disconnections: ['Break aryl ester C-O bond', 'Use salicylic acid as phenol nucleophile', 'Acetylate with acetic anhydride'],
    forward: ['Salicylic acid', 'Acetic anhydride', 'H+ catalyst', 'Aspirin + acetic acid'],
    risk: 'Avoid water until workup; hydrolysis reduces yield.',
  },
  tertButanol: {
    target: 'tert-Butanol',
    disconnections: ['Disconnect C-O bond to tertiary carbocation equivalent', 'Use acetone plus methyl Grignard', 'Acid workup'],
    forward: ['Acetone', 'CH3MgBr dry ether', 'H3O+ workup', 'tert-Butanol'],
    risk: 'Grignard reagent is quenched by water or alcohols.',
  },
  ethylBenzoate: {
    target: 'Ethyl benzoate',
    disconnections: ['Break ester C-O bond', 'Use benzoic acid and ethanol', 'Fischer esterification'],
    forward: ['Benzoic acid', 'Ethanol excess', 'H2SO4 heat', 'Ethyl benzoate'],
    risk: 'Remove water or use excess alcohol to shift equilibrium.',
  },
};

export function SubjectModulePage({ moduleId }) {
  const meta = moduleMeta[moduleId] || moduleMeta['organic-reaction-visualizer'];
  const Icon = meta.icon;

  return (
    <main className="mx-auto max-w-7xl space-y-4 p-3 md:p-5">
      <section className="rounded-xl border border-white/10 bg-slate-950/80 p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]" style={{ color: meta.accent }}>
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{meta.eyebrow}</p>
              <h1 className="truncate text-xl font-black text-white">{meta.title}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Visualizer', 'Practice', 'UG Ready', 'Exam Map'].map(tag => (
              <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-gray-300">{tag}</span>
            ))}
          </div>
        </div>
      </section>
      {moduleId === 'organic-reaction-visualizer' && <OrganicReactionVisualizer />}
      {moduleId === 'spectroscopy-interpreter' && <SpectroscopyInterpreter />}
      {moduleId === 'biochemistry-module' && <BiochemistryModule />}
      {moduleId === 'inorganic-deep-module' && <InorganicDeepModule />}
      {moduleId === 'physical-simulators' && <PhysicalSimulators />}
      {moduleId === 'iupac-nomenclature' && <NomenclaturePractice />}
      {moduleId === 'retrosynthesis-planner' && <RetrosynthesisPlanner />}
    </main>
  );
}

function OrganicReactionVisualizer() {
  const [mechanism, setMechanism] = useState('sn2');
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState('');
  const active = mechanisms[mechanism];
  const organic3dVariant = mechanism === 'eas' ? 'eas' : mechanism === 'aldol' ? 'e2' : mechanism;
  const filteredNames = namedReactionNames.filter(name => name.toLowerCase().includes(query.toLowerCase())).slice(0, 18);

  return (
    <div className="grid gap-3 xl:grid-cols-[310px_minmax(0,1fr)_330px]">
      <Panel title="Mechanism Library" icon={BookOpen}>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(mechanisms).map(([id, item]) => (
            <button key={id} onClick={() => { setMechanism(id); setStep(1); }} className={`rounded-lg border p-2 text-left text-xs ${mechanism === id ? 'border-emerald-300/40 bg-emerald-300/15 text-emerald-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-white'}`}>
              <span className="block font-black">{item.label}</span>
              <span className="text-[10px]">{item.steps.length} steps</span>
            </button>
          ))}
        </div>
        <div className="mt-3">
          <label className="text-xs font-bold text-gray-500">Step {step} of {active.steps.length}</label>
          <input className="mt-2 w-full" type="range" min="1" max={active.steps.length} value={step} onChange={event => setStep(Number(event.target.value))} />
        </div>
      </Panel>
      <Panel title={`${active.label} Curved Arrow View`} icon={Route}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <MechanismSvg active={active} step={step} />
          <MiniMolecule3D
            scene="organic"
            variant={organic3dVariant}
            title={`${active.label} 3D motion`}
            note="Animated attack, leaving group movement, or sigma-complex geometry"
            height={300}
          />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <InfoCard title="Current event" text={active.steps[step - 1]} />
          <InfoCard title="Curved arrow meaning" text={active.arrows[Math.min(step - 1, active.arrows.length - 1)]} />
        </div>
      </Panel>
      <Panel title="50+ Named Reactions" icon={Search}>
        <input value={query} onChange={event => setQuery(event.target.value)} className="input h-9 rounded-lg text-xs" placeholder="Search named reaction" />
        <div className="mt-3 max-h-80 space-y-1 overflow-y-auto">
          {filteredNames.map((name, index) => (
            <div key={name} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-2 py-1.5 text-xs text-gray-300">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-300/10 text-[10px] font-black text-emerald-100">{index + 1}</span>
              {name}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function SpectroscopyInterpreter() {
  const [sampleId, setSampleId] = useState('ethanol');
  const [mode, setMode] = useState('nmr');
  const [answer, setAnswer] = useState('');
  const sample = spectroscopySamples[sampleId];
  const peaks = sample[mode];
  const correct = answer.trim().toLowerCase() === sample.name.toLowerCase();

  return (
    <div className="grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
      <Panel title="Input or Practice Molecule" icon={FlaskConical}>
        <select value={sampleId} onChange={event => setSampleId(event.target.value)} className="input h-9 rounded-lg text-xs">
          {Object.entries(spectroscopySamples).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['nmr', 'c13', 'ir', 'ms', 'uv', 'cosy'].map(type => (
            <button key={type} onClick={() => setMode(type)} className={`rounded-lg border px-2 py-2 text-xs font-black uppercase ${mode === type ? 'border-sky-300/40 bg-sky-300/15 text-sky-50' : 'border-white/10 bg-white/[0.035] text-gray-400'}`}>{type}</button>
          ))}
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-black/15 p-3">
          <p className="text-xs font-black text-white">{sample.name}</p>
          <p className="mt-1 font-mono text-sm text-sky-100">{sample.formula}</p>
        </div>
        <div className="mt-3">
          <label className="text-xs font-bold text-gray-500">Reverse mode answer</label>
          <input value={answer} onChange={event => setAnswer(event.target.value)} className="input mt-1 h-9 rounded-lg text-xs" placeholder="Identify compound" />
          {answer && <p className={`mt-2 rounded-lg px-2 py-1 text-xs ${correct ? 'bg-emerald-300/10 text-emerald-100' : 'bg-amber-300/10 text-amber-100'}`}>{correct ? 'Correct spectrum assignment.' : 'Check formula, key peaks, and integration.'}</p>}
        </div>
      </Panel>
      <Panel title={`${mode.toUpperCase()} Spectrum`} icon={BarChart3}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <SpectrumSvg peaks={peaks} mode={mode} />
          <MiniMolecule3D
            scene="spectroscopy"
            variant={mode}
            title={`${sample.name} peak assignment`}
            note={mode === 'nmr' ? 'Highlighted H environments' : mode === 'c13' ? 'Highlighted carbon environments' : mode === 'cosy' ? 'Correlated proton neighborhoods' : mode === 'ir' ? 'Highlighted vibrating bonds' : mode === 'uv' ? 'Chromophore evidence' : 'Animated fragment path'}
            height={320}
          />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {sample.clues.map(clue => <InfoCard key={clue} title="Peak clue" text={clue} />)}
        </div>
      </Panel>
    </div>
  );
}

function BiochemistryModule() {
  const [amino, setAmino] = useState('Histidine');
  const [pathway, setPathway] = useState('glycolysis');
  const [substrate, setSubstrate] = useState(4);
  const [km, setKm] = useState(2);
  const selected = aminoAcids.find(item => item.name === amino) || aminoAcids[0];
  const vmax = 100;
  const velocity = (vmax * substrate) / (km + substrate);

  return (
    <div className="grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
      <Panel title="20 Amino Acid Explorer" icon={Brain}>
        <select value={amino} onChange={event => setAmino(event.target.value)} className="input h-9 rounded-lg text-xs">
          {aminoAcids.map(item => <option key={item.name}>{item.name}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Metric label="Code" value={`${selected.three} / ${selected.one}`} />
          <Metric label="Class" value={selected.group} />
          <Metric label="pKa COOH" value={selected.pKa1} />
          <Metric label="pKa NH3+" value={selected.pKa2} />
          <Metric label="Side pKa" value={selected.sideChainPka || 'none'} />
          <Metric label="Role" value={selected.role} />
        </div>
      </Panel>
      <div className="grid gap-3">
        <Panel title="Protein Folding: Primary to Quaternary" icon={Boxes}>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
            <ProteinSvg />
            <MiniMolecule3D
              scene="bio"
              variant="protein"
              title="Protein folding 3D"
              note="Backbone coil with folding shell"
              height={180}
            />
          </div>
        </Panel>
        <Panel title="Metabolic Pathways and Enzyme Kinetics" icon={Activity}>
          <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
            <div>
              <select value={pathway} onChange={event => setPathway(event.target.value)} className="input h-9 rounded-lg text-xs">
                {Object.keys(pathwaySteps).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
              <FlowSvg steps={pathwaySteps[pathway]} />
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <MiniMolecule3D scene="bio" variant="dna" title="DNA/RNA helix viewer" note="Central dogma structure cue" height={220} />
                <MiniMolecule3D scene="bio" variant="membrane" title="Lipid bilayer and micelle viewer" note="Polar heads and hydrophobic tails" height={220} />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500">Substrate {substrate} mM</label>
              <input type="range" min="0.2" max="12" step="0.2" value={substrate} onChange={event => setSubstrate(Number(event.target.value))} className="w-full" />
              <label className="mt-3 block text-xs font-bold text-gray-500">Km {km} mM</label>
              <input type="range" min="0.5" max="8" step="0.1" value={km} onChange={event => setKm(Number(event.target.value))} className="w-full" />
              <KineticsSvg km={km} substrate={substrate} velocity={velocity} />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function InorganicDeepModule() {
  const [element, setElement] = useState('Fe');
  const [geometry, setGeometry] = useState('Octahedral');
  const [electrons, setElectrons] = useState(6);
  const [analysisGroup, setAnalysisGroup] = useState('Group II');
  const selected = dBlockElements.find(item => item[0] === element) || dBlockElements[4];

  return (
    <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Panel title="d-block / f-block Chemistry" icon={Atom}>
        <select value={element} onChange={event => setElement(event.target.value)} className="input h-9 rounded-lg text-xs">
          {dBlockElements.map(item => <option key={item[0]}>{item[0]}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Metric label="Atomic d count" value={`d${selected[1] - 2}`} />
          <Metric label="Oxidation states" value={selected[2].join(', ')} />
          <Metric label="Color cue" value={selected[3]} />
          <Metric label="High-yield idea" value={selected[4]} />
        </div>
      </Panel>
      <div className="grid gap-3">
        <Panel title="Coordination Builder and Crystal Field Theory" icon={Orbit}>
          <div className="grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <select value={geometry} onChange={event => setGeometry(event.target.value)} className="input h-9 rounded-lg text-xs">
                {['Octahedral', 'Tetrahedral', 'Square planar'].map(item => <option key={item}>{item}</option>)}
              </select>
              <label className="text-xs font-bold text-gray-500">d electrons: {electrons}</label>
              <input type="range" min="0" max="10" value={electrons} onChange={event => setElectrons(Number(event.target.value))} className="w-full" />
              <InfoCard title="Naming pattern" text="[Metal(ligands)] charge: list ligands alphabetically, then metal with oxidation state." />
            </div>
            <CftSvg geometry={geometry} electrons={electrons} />
            <MiniMolecule3D
              scene="coordination"
              variant={geometry}
              title={`${geometry} coordination 3D`}
              note="Ligand geometry with d-orbital lobes around metal"
              height={260}
            />
          </div>
        </Panel>
        <Panel title="Metallurgy and Qualitative Salt Analysis" icon={TestTube2}>
          <div className="grid gap-3 lg:grid-cols-2">
            <FlowSvg steps={['Ore', 'Concentration', 'Roasting/Calcination', 'Reduction', 'Refining', 'Pure metal']} />
            <div>
              <select value={analysisGroup} onChange={event => setAnalysisGroup(event.target.value)} className="input h-9 rounded-lg text-xs">
                {['Group I', 'Group II', 'Group III', 'Group IV', 'Group V', 'Anion tests'].map(item => <option key={item}>{item}</option>)}
              </select>
              <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-gray-300">
                {analysisGroup}: add group reagent, observe precipitate color, dissolve/confirm with selective reagent, then write ionic equation.
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function PhysicalSimulators() {
  const [system, setSystem] = useState('thermo');
  const [a, setA] = useState(40);
  const [b, setB] = useState(25);
  const selected = physicalSystems[system];
  const physical3dVariant = system === 'solid' ? 'crystal' : system === 'electrochem' ? 'electrochem' : 'particles';
  const computed = useMemo(() => {
    if (system === 'thermo') return `${(a - 298 * (b / 1000)).toFixed(2)} kJ/mol`;
    if (system === 'kinetics') return `t1/2 ${(0.693 / Math.max(0.01, a / 100)).toFixed(2)} s`;
    if (system === 'electrochem') return `${(1.1 - 0.0592 / 2 * Math.log10(Math.max(0.01, b / 10))).toFixed(3)} V`;
    if (system === 'colligative') return `Delta Tb ${(0.512 * a / 20 * b / 20).toFixed(2)} C`;
    if (system === 'solid') return a > 60 ? 'FCC/HCP close packing 74%' : 'BCC packing 68%';
    return a > 55 && b > 55 ? 'supercritical region' : a > 55 ? 'gas region' : 'liquid/solid boundary';
  }, [a, b, system]);

  return (
    <div className="grid gap-3 xl:grid-cols-[320px_minmax(0,1fr)]">
      <Panel title="Simulator Selector" icon={Activity}>
        <div className="space-y-2">
          {Object.entries(physicalSystems).map(([id, item]) => (
            <button key={id} onClick={() => setSystem(id)} className={`w-full rounded-lg border p-2 text-left text-xs ${system === id ? 'border-teal-300/40 bg-teal-300/15 text-teal-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-white'}`}>
              <span className="block font-black">{item.title}</span>
              <span>{item.formula}</span>
            </button>
          ))}
        </div>
      </Panel>
      <Panel title={selected.title} icon={Sigma}>
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_300px_320px]">
          <PhysicalSvg system={system} a={a} b={b} />
          <div>
            <label className="text-xs font-bold text-gray-500">{selected.controls[0]}: {a}</label>
            <input type="range" min="1" max="100" value={a} onChange={event => setA(Number(event.target.value))} className="w-full" />
            <label className="mt-3 block text-xs font-bold text-gray-500">{selected.controls[1]}: {b}</label>
            <input type="range" min="1" max="100" value={b} onChange={event => setB(Number(event.target.value))} className="w-full" />
            <InfoCard title="Calculated output" text={computed} />
            <InfoCard title="Interpretation" text={selected.takeaway} />
          </div>
          <MiniMolecule3D
            scene="physical"
            variant={physical3dVariant}
            title={`${selected.title} 3D model`}
            note={system === 'solid' ? 'Unit-cell packing and void cue' : system === 'electrochem' ? 'Electron and ion flow' : 'Particle motion and phase behavior'}
            height={280}
          />
        </div>
      </Panel>
    </div>
  );
}

function NomenclaturePractice() {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const card = nomenclatureCards[index % nomenclatureCards.length];
  const correct = answer.trim().toLowerCase() === card.name.toLowerCase();
  const nomenclature3dVariant = card.name.includes('but-2-ene') ? 'ez' : card.name.includes('cobalt') ? 'coordination' : card.name.includes('bromo') ? 'rs' : 'ring';

  return (
    <div className="grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
      <Panel title="Structure to Name" icon={BookOpen}>
        <div className="rounded-xl border border-white/10 bg-black/15 p-4 font-mono text-lg text-cyan-50">{card.structure}</div>
        <input value={answer} onChange={event => setAnswer(event.target.value)} className="input mt-3 h-9 rounded-lg text-xs" placeholder="Type IUPAC name" />
        {answer && <p className={`mt-2 rounded-lg px-2 py-1 text-xs ${correct ? 'bg-emerald-300/10 text-emerald-100' : 'bg-amber-300/10 text-amber-100'}`}>{correct ? 'Correct name.' : `Expected: ${card.name}`}</p>}
        <button onClick={() => { setIndex(index + 1); setAnswer(''); }} className="btn-primary mt-3 inline-flex h-9 items-center gap-2 px-3 text-xs"><ChevronRight size={14} /> Next structure</button>
      </Panel>
      <Panel title="Rule Breakdown and Reverse Mode" icon={BadgeCheck}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <StructureSvg label={card.name} />
          <MiniMolecule3D
            scene="nomenclature"
            variant={nomenclature3dVariant}
            title="3D nomenclature viewer"
            note="R/S, E/Z, ring conformation, or coordination geometry cue"
            height={260}
          />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <InfoCard title="Parent selection" text="Choose the longest chain or principal coordination entity." />
          <InfoCard title="Priority and numbering" text="Lowest locants go to principal functional group, multiple bonds, then substituents." />
          <InfoCard title="This example" text={card.rule} />
        </div>
      </Panel>
    </div>
  );
}

function RetrosynthesisPlanner() {
  const [targetId, setTargetId] = useState('aspirin');
  const [mode, setMode] = useState('retro');
  const target = retrosynthesisTargets[targetId];

  return (
    <div className="grid gap-3 xl:grid-cols-[330px_minmax(0,1fr)]">
      <Panel title="Target Molecule" icon={Pill}>
        <select value={targetId} onChange={event => setTargetId(event.target.value)} className="input h-9 rounded-lg text-xs">
          {Object.entries(retrosynthesisTargets).map(([id, item]) => <option key={id} value={id}>{item.target}</option>)}
        </select>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {['retro', 'forward'].map(item => (
            <button key={item} onClick={() => setMode(item)} className={`rounded-lg border px-2 py-2 text-xs font-black ${mode === item ? 'border-orange-300/40 bg-orange-300/15 text-orange-50' : 'border-white/10 bg-white/[0.035] text-gray-400'}`}>{item === 'retro' ? 'Retrosynthesis' : 'Forward'}</button>
          ))}
        </div>
        <InfoCard title="Planning caution" text={target.risk} />
      </Panel>
      <Panel title={mode === 'retro' ? 'Disconnection Strategy' : 'Forward Synthesis Prediction'} icon={GitCompare}>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
          <FlowSvg steps={mode === 'retro' ? [target.target, ...target.disconnections] : target.forward} />
          <MiniMolecule3D
            scene="retrosynthesis"
            variant={mode === 'retro' ? 'disconnect' : 'forward'}
            title={`${target.target} 3D planning view`}
            note={mode === 'retro' ? 'Highlighted disconnected bond' : 'Animated reagent approach'}
            height={260}
          />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {(mode === 'retro' ? target.disconnections : target.forward).slice(0, 3).map((text, index) => (
            <InfoCard key={text} title={`Step ${index + 1}`} text={text} />
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <section className="rounded-xl border border-white/10 bg-slate-950/75 p-3">
      <div className="mb-3 flex items-center gap-2">
        <Icon size={16} className="text-cyan-200" />
        <h2 className="text-sm font-black text-white">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InfoCard({ title, text }) {
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-gray-300">{text}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.035] p-2">
      <p className="text-[10px] font-black uppercase text-gray-500">{label}</p>
      <p className="mt-1 text-xs font-bold text-gray-100">{value}</p>
    </div>
  );
}

function MechanismSvg({ active, step }) {
  return (
    <svg viewBox="0 0 720 300" className="h-72 w-full rounded-xl border border-white/10 bg-black/20">
      <defs>
        <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#22d3ee" /></marker>
      </defs>
      <text x="28" y="34" fill="#e2e8f0" fontSize="18" fontWeight="800">{active.label}</text>
      <text x="28" y="58" fill="#94a3b8" fontSize="12">Curved arrows show electron-pair movement, not atom movement.</text>
      <circle cx="170" cy="145" r="42" fill="#1e293b" stroke="#22c55e" />
      <text x="170" y="151" textAnchor="middle" fill="#dcfce7" fontSize="15" fontWeight="800">C</text>
      <circle cx="86" cy="145" r="28" fill="#0f172a" stroke="#38bdf8" />
      <text x="86" y="151" textAnchor="middle" fill="#e0f2fe" fontSize="13" fontWeight="800">Nu:</text>
      <circle cx="260" cy="145" r="28" fill="#0f172a" stroke="#fb7185" />
      <text x="260" y="151" textAnchor="middle" fill="#ffe4e6" fontSize="13" fontWeight="800">LG</text>
      <path d="M112 132 C135 96, 176 96, 198 127" fill="none" stroke="#22d3ee" strokeWidth={step >= 1 ? 4 : 1.5} markerEnd="url(#arrowHead)" opacity={step >= 1 ? 1 : 0.35} />
      <path d="M218 145 C245 118, 280 118, 306 146" fill="none" stroke="#fb7185" strokeWidth={step >= 2 ? 4 : 1.5} markerEnd="url(#arrowHead)" opacity={step >= 2 ? 1 : 0.35} />
      <EnergyDiagram values={active.energy} x={360} y={70} w={310} h={150} step={step} />
      {active.steps.map((label, index) => (
        <g key={label}>
          <circle cx={70 + index * 150} cy="260" r="13" fill={step === index + 1 ? '#22c55e' : '#334155'} />
          <text x={70 + index * 150} y="264" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800">{index + 1}</text>
          <text x={90 + index * 150} y="264" fill="#cbd5e1" fontSize="11">{label.slice(0, 18)}</text>
        </g>
      ))}
    </svg>
  );
}

function EnergyDiagram({ values, x, y, w, h, step }) {
  const points = values.map((value, index) => `${x + (index / (values.length - 1)) * w},${y + h - (value / 100) * h}`).join(' ');
  return (
    <g>
      <text x={x} y={y - 12} fill="#94a3b8" fontSize="12">Energy diagram</text>
      <polyline points={points} fill="none" stroke="#facc15" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((value, index) => (
        <circle key={index} cx={x + (index / (values.length - 1)) * w} cy={y + h - (value / 100) * h} r={step === index + 1 ? 6 : 3} fill={step === index + 1 ? '#22d3ee' : '#facc15'} />
      ))}
    </g>
  );
}

function SpectrumSvg({ peaks, mode }) {
  const maxX = mode === 'ir' ? 4000 : mode === 'nmr' ? 10 : mode === 'c13' ? 220 : mode === 'uv' ? 400 : mode === 'cosy' ? 10 : 140;
  const axisLabel = mode === 'nmr' ? 'delta ppm' : mode === 'c13' ? '13C ppm' : mode === 'ir' ? 'wavenumber cm-1' : mode === 'uv' ? 'wavelength nm' : mode === 'cosy' ? '1H correlation ppm' : 'm/z';
  return (
    <svg viewBox="0 0 780 320" className="h-80 w-full rounded-xl border border-white/10 bg-black/20">
      <line x1="50" y1="260" x2="740" y2="260" stroke="#475569" />
      <line x1="50" y1="30" x2="50" y2="260" stroke="#475569" />
      <text x="50" y="290" fill="#94a3b8" fontSize="12">{axisLabel}</text>
      {peaks.map(peak => {
        const px = 50 + (mode === 'ir' ? (1 - peak.x / maxX) : peak.x / maxX) * 690;
        const y = 260 - peak.h * 2.1;
        return (
          <g key={`${peak.x}-${peak.label}`}>
            <line x1={px} y1="260" x2={px} y2={y} stroke="#38bdf8" strokeWidth="5" />
            <text x={px + 6} y={Math.max(26, y - 6)} fill="#e0f2fe" fontSize="11">{peak.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ProteinSvg() {
  return (
    <svg viewBox="0 0 760 180" className="h-44 w-full rounded-xl border border-white/10 bg-black/20">
      {['Primary sequence', 'Alpha helix', 'Folded domain', 'Quaternary complex'].map((label, index) => (
        <g key={label} transform={`translate(${35 + index * 180},28)`}>
          <rect width="145" height="110" rx="14" fill="#111827" stroke="#334155" />
          <path d={index < 2 ? 'M20 65 C45 20, 75 110, 120 55' : 'M22 70 C35 20, 88 30, 70 76 C110 56, 128 105, 72 98 C38 118, 20 96, 22 70'} fill="none" stroke={['#22c55e', '#38bdf8', '#a78bfa', '#f59e0b'][index]} strokeWidth="5" />
          <text x="72" y="96" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="800">{label}</text>
        </g>
      ))}
    </svg>
  );
}

function FlowSvg({ steps }) {
  return (
    <div className="mt-3 flex gap-2 overflow-x-auto rounded-xl border border-white/10 bg-black/15 p-3">
      {steps.map((label, index) => (
        <div key={`${label}-${index}`} className="flex items-center gap-2">
          <div className="min-w-28 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-center text-xs font-bold text-cyan-50">{label}</div>
          {index < steps.length - 1 && <ChevronRight size={16} className="text-gray-500" />}
        </div>
      ))}
    </div>
  );
}

function KineticsSvg({ km, substrate, velocity }) {
  const pts = Array.from({ length: 16 }, (_, i) => {
    const s = i * 0.8;
    const v = (100 * s) / (km + s);
    return `${38 + i * 15},${130 - v}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 280 160" className="mt-3 h-40 w-full rounded-xl border border-white/10 bg-black/20">
      <line x1="35" y1="135" x2="250" y2="135" stroke="#475569" />
      <line x1="35" y1="20" x2="35" y2="135" stroke="#475569" />
      <polyline points={pts} fill="none" stroke="#a78bfa" strokeWidth="4" />
      <circle cx={38 + (substrate / 0.8) * 15} cy={130 - velocity} r="5" fill="#22d3ee" />
      <text x="48" y="28" fill="#e2e8f0" fontSize="11">v = {velocity.toFixed(1)}</text>
    </svg>
  );
}

function CftSvg({ geometry, electrons }) {
  const upper = geometry === 'Octahedral' ? ['eg'] : ['t2'];
  const lower = geometry === 'Octahedral' ? ['t2g'] : ['e'];
  return (
    <svg viewBox="0 0 620 250" className="h-64 w-full rounded-xl border border-white/10 bg-black/20">
      <text x="28" y="34" fill="#e2e8f0" fontSize="16" fontWeight="800">{geometry} splitting</text>
      <line x1="80" y1="180" x2="250" y2="180" stroke="#38bdf8" strokeWidth="4" />
      <line x1="80" y1="95" x2="250" y2="95" stroke="#f59e0b" strokeWidth="4" />
      <text x="260" y="99" fill="#fcd34d" fontSize="13">{upper.join(', ')}</text>
      <text x="260" y="184" fill="#bae6fd" fontSize="13">{lower.join(', ')}</text>
      {Array.from({ length: electrons }).map((_, index) => {
        const high = index >= (geometry === 'Octahedral' ? 6 : 4);
        const px = 92 + (index % 6) * 24;
        const py = high ? 84 : 169;
        return <text key={index} x={px} y={py} fill="#fff" fontSize="20">↑</text>;
      })}
      <CoordinationSvg x={390} y={42} geometry={geometry} />
    </svg>
  );
}

function CoordinationSvg({ x, y, geometry }) {
  const ligands = geometry === 'Tetrahedral'
    ? [[0, -52], [50, 28], [-50, 28], [0, 55]]
    : geometry === 'Square planar'
    ? [[0, -58], [58, 0], [0, 58], [-58, 0]]
    : [[0, -62], [62, 0], [0, 62], [-62, 0], [38, -38], [-38, 38]];
  return (
    <g transform={`translate(${x + 75},${y + 80})`}>
      <circle r="24" fill="#f59e0b" />
      <text textAnchor="middle" y="5" fill="#111827" fontWeight="900">M</text>
      {ligands.map(([lx, ly], index) => (
        <g key={index}>
          <line x1="0" y1="0" x2={lx} y2={ly} stroke="#64748b" />
          <circle cx={lx} cy={ly} r="16" fill="#1e293b" stroke="#a7f3d0" />
          <text x={lx} y={ly + 4} textAnchor="middle" fill="#d1fae5" fontSize="10">L</text>
        </g>
      ))}
    </g>
  );
}

function PhysicalSvg({ system, a, b }) {
  const pts = Array.from({ length: 14 }, (_, i) => `${45 + i * 45},${230 - (Math.sin(i / 2) * 30 + i * 7 + a / 4)}`).join(' ');
  return (
    <svg viewBox="0 0 700 290" className="h-72 w-full rounded-xl border border-white/10 bg-black/20">
      <text x="28" y="34" fill="#e2e8f0" fontSize="16" fontWeight="800">{system} model</text>
      <line x1="45" y1="240" x2="650" y2="240" stroke="#475569" />
      <line x1="45" y1="50" x2="45" y2="240" stroke="#475569" />
      <polyline points={pts} fill="none" stroke="#14b8a6" strokeWidth="4" />
      <circle cx={80 + a * 5} cy={235 - b * 1.6} r="8" fill="#facc15" />
      <text x="88" y={229 - b * 1.6} fill="#fef3c7" fontSize="12">current state</text>
    </svg>
  );
}

function StructureSvg({ label }) {
  return (
    <svg viewBox="0 0 720 250" className="h-64 w-full rounded-xl border border-white/10 bg-black/20">
      <text x="28" y="36" fill="#e2e8f0" fontSize="16" fontWeight="800">{label}</text>
      <g transform="translate(120,130)" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round">
        <line x1="0" y1="0" x2="80" y2="-45" />
        <line x1="80" y1="-45" x2="160" y2="0" />
        <line x1="160" y1="0" x2="240" y2="-45" />
        <circle cx="265" cy="-58" r="20" fill="#ef4444" stroke="none" />
        <text x="265" y="-53" textAnchor="middle" fill="#fff" fontWeight="900">O</text>
      </g>
      <text x="420" y="118" fill="#94a3b8" fontSize="13">Name parser highlights parent, suffix, substituents and locants.</text>
    </svg>
  );
}

export default SubjectModulePage;
