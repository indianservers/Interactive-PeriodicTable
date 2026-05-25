import { useMemo, useState } from 'react';
import {
  Binary, ClipboardList, Compass, Eye, FileQuestion, GitCompare,
  Orbit, Radar, ScanSearch, Shapes, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { chiralityNotes, conformationComparisons, lessonPresets, orbitalSets, spectroscopyRules } from '../data/teachingExtensions.js';
import {
  assessmentQuestions,
  operationMismatchHeatmap,
  perturbMoleculeSymmetry,
  proposeDiscoveryElement,
  salcSeed,
} from '../utils/teachingExtensionUtils.js';

const featureTabs = [
  { id: 'salc', label: 'SALCs', icon: Sparkles },
  { id: 'orbital', label: 'Orbital Overlay', icon: Orbit },
  { id: 'trainer', label: 'Flowchart Trainer', icon: Compass },
  { id: 'discover', label: 'Discovery Mode', icon: ScanSearch },
  { id: 'heatmap', label: 'Difference Heatmap', icon: Radar },
  { id: 'chirality', label: 'Chirality', icon: Shapes },
  { id: 'spectroscopy', label: 'Selection Rules', icon: Eye },
  { id: 'perturb', label: 'Perturbation', icon: SlidersHorizontal },
  { id: 'compare', label: 'Conformations', icon: GitCompare },
  { id: 'lessons', label: 'Lessons', icon: ClipboardList },
  { id: 'assessment', label: 'Assessment', icon: FileQuestion },
];

function Badge({ children, tone = 'cyan' }) {
  const tones = {
    cyan: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-100',
    amber: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
    rose: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
    emerald: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
    violet: 'border-violet-400/25 bg-violet-400/10 text-violet-100',
  };
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tones[tone] || tones.cyan}`}>{children}</span>;
}

function SalcView({ molecule }) {
  const seed = useMemo(() => salcSeed(molecule), [molecule]);
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">SALC Builder</p>
        <h3 className="text-lg font-black text-white">Start from equivalent ligand orbitals</h3>
        <p className="mt-1 text-xs leading-5 text-gray-400">The first classroom step is to choose an equivalent atom set, assign one orbital to each site, then form normalized sums and sign-changing combinations.</p>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs font-bold text-white">Basis set</p>
          <div className="mt-2 flex flex-wrap gap-2">{seed.basis.map(id => <Badge key={id}>{id}</Badge>)}</div>
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-slate-950/50 p-3">
        <p className="text-xs font-bold text-white">Totally symmetric seed SALC</p>
        <p className="mt-2 rounded-lg bg-black/25 p-3 font-mono text-sm text-cyan-100">{seed.normalization} ({seed.totallySymmetric || 'no equivalent set'})</p>
        <p className="mt-3 text-xs leading-5 text-gray-400">Next lesson extension: project this seed through each irrep using the character table row.</p>
      </div>
    </div>
  );
}

function OrbitalOverlayView() {
  const [selected, setSelected] = useState(orbitalSets[0].id);
  const set = orbitalSets.find(item => item.id === selected) || orbitalSets[0];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Orbital Symmetry Overlay</p>
        <h3 className="text-lg font-black text-white">Track signs and degeneracies</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {orbitalSets.map(item => (
          <button key={item.id} onClick={() => setSelected(item.id)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${selected === item.id ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-gray-400'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {set.orbitals.map((orbital, index) => (
          <div key={orbital} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10">
              <span className="font-mono text-sm font-black text-cyan-100">{orbital}</span>
            </div>
            <p className="mt-2 text-[11px] text-gray-500">{index % 2 === 0 ? 'positive lobe shown first' : 'phase-inverted partner'}</p>
          </div>
        ))}
      </div>
      <p className="text-xs leading-5 text-gray-400">{set.note}</p>
    </div>
  );
}

function TrainerView({ molecule }) {
  const [step, setStep] = useState(0);
  const prompts = [
    ['Linear?', molecule.geometry.toLowerCase().includes('linear') ? 'Yes' : 'No'],
    ['Principal axis?', molecule.symmetryElements.find(e => e.type === 'Cn')?.label || 'None beyond E'],
    ['Mirror planes?', molecule.symmetryElements.some(e => e.type === 'sigma') ? 'Present' : 'Absent'],
    ['Inversion centre?', molecule.symmetryElements.some(e => e.type === 'i') ? 'Present' : 'Absent'],
    ['Improper axis?', molecule.symmetryElements.some(e => e.type === 'Sn') ? 'Present' : 'Absent'],
    ['Point group', molecule.pointGroup],
  ];
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Point Group Flowchart Trainer</p>
        <h3 className="text-lg font-black text-white">{prompts[step][0]}</h3>
        <p className="mt-1 text-sm text-cyan-100">{prompts[step][1]}</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {prompts.map((item, index) => (
          <button key={item[0]} onClick={() => setStep(index)} className={`rounded-lg border p-3 text-left ${step === index ? 'border-cyan-400/35 bg-cyan-400/10' : 'border-white/10 bg-white/[0.035]'}`}>
            <p className="text-xs font-bold text-white">{index + 1}. {item[0]}</p>
            <p className="mt-1 text-[11px] text-gray-500">{index <= step ? item[1] : 'Reveal in sequence'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function DiscoveryView({ molecule }) {
  const [type, setType] = useState('Cn');
  const proposal = useMemo(() => proposeDiscoveryElement(type, molecule), [type, molecule]);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Symmetry Element Discovery Mode</p>
        <h3 className="text-lg font-black text-white">Propose an element, then validate</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {['Cn', 'sigma', 'i', 'Sn'].map(item => (
          <button key={item} onClick={() => setType(item)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${type === item ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-gray-400'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className={`rounded-xl border p-3 ${proposal.valid ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-rose-400/25 bg-rose-400/10'}`}>
        <p className="text-sm font-bold text-white">{proposal.valid ? 'Valid proposal' : 'No matching element'}</p>
        <p className="mt-1 text-xs leading-5 text-gray-300">{proposal.message}</p>
      </div>
    </div>
  );
}

function HeatmapView({ operationResult }) {
  const rows = operationMismatchHeatmap(operationResult);
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Before/After Difference Heatmap</p>
        <h3 className="text-lg font-black text-white">Nearest equivalent atom error</h3>
        <p className="mt-1 text-xs text-gray-400">Apply an invalid practice operation to see which atoms fail to land on an equivalent site.</p>
      </div>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-500">No operation has been applied yet.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map(row => (
            <div key={row.atom} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-black text-white">{row.atom}</span>
                <Badge tone={row.severity === 'matched' ? 'emerald' : row.severity === 'large' ? 'rose' : 'amber'}>{row.severity}</Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">to {row.target}, delta {row.distance}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ChiralityView({ molecule }) {
  const hasImproper = molecule.symmetryElements.some(e => e.type === 'Sn' || e.type === 'sigma' || e.type === 'i');
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Stereochemistry and Chirality</p>
        <h3 className="text-lg font-black text-white">{hasImproper ? 'Achiral by listed symmetry elements' : 'Potentially chiral by symmetry test'}</h3>
        <p className="mt-2 text-xs leading-5 text-gray-400">{chiralityNotes.chiralRule}</p>
      </div>
      <div className="space-y-2">
        {chiralityNotes.examples.map(note => <div key={note} className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">{note}</div>)}
      </div>
    </div>
  );
}

function SpectroscopyView({ molecule }) {
  const centrosymmetric = molecule.symmetryElements.some(e => e.type === 'i');
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Spectroscopy Selection Rules</p>
        <h3 className="text-lg font-black text-white">{centrosymmetric ? 'Centrosymmetric molecule: mutual exclusion is likely' : 'Non-centrosymmetric molecule: IR/Raman overlap can occur'}</h3>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {spectroscopyRules.map(rule => (
          <div key={rule.label} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <Badge tone={rule.color}>{rule.label}</Badge>
            <p className="mt-2 text-xs leading-5 text-gray-300">{rule.rule}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PerturbationView({ molecule }) {
  const [axis, setAxis] = useState('x');
  const rows = useMemo(() => perturbMoleculeSymmetry(molecule, axis), [molecule, axis]);
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Molecule Perturbation Tool</p>
          <h3 className="text-lg font-black text-white">Predict symmetry lowering</h3>
        </div>
        <select value={axis} onChange={event => setAxis(event.target.value)} className="input max-w-36 text-xs">
          <option value="x">Distort x</option>
          <option value="y">Distort y</option>
          <option value="z">Distort z</option>
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map(row => (
          <div key={row.id} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs font-bold text-white">{row.label}</p>
            <p className="mt-1 text-[11px] text-gray-500">Before: {row.before ? 'valid' : 'invalid'} | After distortion: {row.after ? 'valid' : 'lost'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonView({ molecule }) {
  const comparison = conformationComparisons[molecule.id] || conformationComparisons.ferrocene;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Compare Two Conformations</p>
        <h3 className="text-lg font-black text-white">{comparison.title}</h3>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-50">{comparison.left}</div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-xs leading-5 text-violet-50">{comparison.right}</div>
      </div>
      <p className="text-xs leading-5 text-gray-400">{comparison.teachingPoint}</p>
    </div>
  );
}

function LessonsView({ onSelectMolecule }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {lessonPresets.map(lesson => (
        <div key={lesson.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-sm font-black text-white">{lesson.title}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {lesson.molecules.map(id => <button key={id} onClick={() => onSelectMolecule?.(id)} className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] font-bold text-cyan-100">{id}</button>)}
          </div>
          <ul className="mt-3 space-y-1 text-xs leading-5 text-gray-400">{lesson.prompts.map(prompt => <li key={prompt}>- {prompt}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function AssessmentView({ molecule }) {
  const questions = assessmentQuestions(molecule);
  const exportQuiz = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=680');
    if (!win) return;
    win.document.write(`<html><head><title>${molecule.name} assessment</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}li{margin:14px 0}.key{margin-top:32px;border-top:1px solid #ddd;padding-top:16px}</style></head><body><h1>${molecule.name} Molecular Symmetry Quiz</h1><ol>${questions.map(q => `<li>${q}</li>`).join('')}</ol><div class="key"><h2>Instructor Key</h2><p>Point group: <strong>${molecule.pointGroup}</strong></p><ol>${molecule.pointGroupReasoning.map(step => `<li>${step}</li>`).join('')}</ol></div></body></html>`);
    win.document.close();
    win.print();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Assessment Export</p>
          <h3 className="text-lg font-black text-white">Quiz generator for {molecule.name}</h3>
        </div>
        <button onClick={exportQuiz} className="btn-primary text-xs">Export Quiz PDF</button>
      </div>
      <ol className="space-y-2">{questions.map((question, index) => <li key={question} className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">{index + 1}. {question}</li>)}</ol>
    </div>
  );
}

export function ClassroomExtensions({ molecule, operationResult, onSelectMolecule }) {
  const [activeTab, setActiveTab] = useState('salc');
  return (
    <section className="glass rounded-xl p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Classroom Extensions</p>
          <h2 className="text-base font-black text-white">SALCs, orbitals, discovery, spectroscopy, and assessment</h2>
        </div>
        <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
          {featureTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${activeTab === tab.id ? 'border-amber-400/40 bg-amber-400/15 text-amber-100' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-white'}`}>
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        {activeTab === 'salc' && <SalcView molecule={molecule} />}
        {activeTab === 'orbital' && <OrbitalOverlayView />}
        {activeTab === 'trainer' && <TrainerView molecule={molecule} />}
        {activeTab === 'discover' && <DiscoveryView molecule={molecule} />}
        {activeTab === 'heatmap' && <HeatmapView operationResult={operationResult} />}
        {activeTab === 'chirality' && <ChiralityView molecule={molecule} />}
        {activeTab === 'spectroscopy' && <SpectroscopyView molecule={molecule} />}
        {activeTab === 'perturb' && <PerturbationView molecule={molecule} />}
        {activeTab === 'compare' && <ComparisonView molecule={molecule} />}
        {activeTab === 'lessons' && <LessonsView onSelectMolecule={onSelectMolecule} />}
        {activeTab === 'assessment' && <AssessmentView molecule={molecule} />}
      </div>
    </section>
  );
}

export default ClassroomExtensions;
