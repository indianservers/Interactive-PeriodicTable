import { useMemo, useState } from 'react';
import {
  Binary, ClipboardList, Compass, Eye, FileQuestion, GitCompare,
  Orbit, Radar, ScanSearch, Shapes, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import {
  chiralityNotes,
  conformationComparisons,
  lessonPresets,
  orbitalSets,
  pointGroupComparisons,
  spectroscopyRules,
} from '../data/teachingExtensions.js';
import {
  assessmentQuestions,
  operationMismatchHeatmap,
  perturbMoleculeSymmetry,
  proposeDiscoveryElement,
  salcSeed,
} from '../utils/teachingExtensionUtils.js';
import {
  decisionTreeQuestions,
  getOpticalActivityCriteria,
  getPointGroupAssignmentSteps,
  getPointGroupSignature,
  inferPointGroupFromSelections,
  pointGroupFamilies,
  pointGroupSignatures,
} from '../utils/pointGroupRules.js';

const featureTabs = [
  { id: 'salc', label: 'SALCs', icon: Sparkles },
  { id: 'orbital', label: 'Orbital Overlay', icon: Orbit },
  { id: 'trainer', label: 'Point Group Finder', icon: Compass },
  { id: 'discover', label: 'Discovery Quiz', icon: ScanSearch },
  { id: 'heatmap', label: 'Difference Heatmap', icon: Radar },
  { id: 'chirality', label: 'Optical Activity', icon: Shapes },
  { id: 'spectroscopy', label: 'Selection Rules', icon: Eye },
  { id: 'perturb', label: 'Perturbation', icon: SlidersHorizontal },
  { id: 'compare', label: 'Comparison Cards', icon: GitCompare },
  { id: 'lessons', label: 'Lessons', icon: ClipboardList },
  { id: 'assessment', label: 'Handouts', icon: FileQuestion },
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
  const [answers, setAnswers] = useState({
    linear: false,
    highSymmetry: '',
    principalAxis: '',
    perpendicularC2: false,
    sigmaH: false,
    sigmaV: false,
    inversion: false,
  });
  const predicted = inferPointGroupFromSelections(answers);
  const signature = getPointGroupSignature(predicted);
  const setAnswer = (key, value) => setAnswers(current => ({ ...current, [key]: value }));
  const useCurrentMolecule = () => {
    const rotations = molecule.symmetryElements.filter(element => element.type === 'Cn');
    const highest = rotations.reduce((best, element) => (element.order > best.order ? element : best), { order: 0 });
    setAnswers({
      linear: molecule.geometry.toLowerCase().includes('linear'),
      highSymmetry: molecule.pointGroup === 'Td' ? 'tetrahedral' : molecule.pointGroup === 'Oh' ? 'octahedral' : molecule.pointGroup === 'Ih' ? 'icosahedral' : '',
      principalAxis: highest.order ? `C${highest.order}` : '',
      perpendicularC2: rotations.length > 1 && rotations.some(element => element.order === 2),
      sigmaH: molecule.symmetryElements.some(element => element.id?.includes('sigma-h') || element.label.toLowerCase().includes('sigma h')),
      sigmaV: molecule.symmetryElements.some(element => element.id?.includes('sigma-v') || element.label.toLowerCase().includes('sigma v')),
      inversion: molecule.symmetryElements.some(element => element.type === 'i'),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Interactive Point Group Finder</p>
          <h3 className="text-lg font-black text-white">Answer the flowchart questions</h3>
          <p className="mt-1 text-xs leading-5 text-gray-400">Use this before revealing the molecule answer, then compare the predicted group with the assigned point group.</p>
        </div>
        <button onClick={useCurrentMolecule} className="btn-secondary text-xs">Fill From Current Molecule</button>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Linear molecule?
          <select value={String(answers.linear)} onChange={event => setAnswer('linear', event.target.value === 'true')} className="input mt-2 text-xs">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          High-symmetry family
          <select value={answers.highSymmetry} onChange={event => setAnswer('highSymmetry', event.target.value)} className="input mt-2 text-xs">
            <option value="">None</option>
            <option value="tetrahedral">Tetrahedral</option>
            <option value="octahedral">Octahedral</option>
            <option value="icosahedral">Icosahedral</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Principal axis
          <select value={answers.principalAxis} onChange={event => setAnswer('principalAxis', event.target.value)} className="input mt-2 text-xs">
            <option value="">None</option>
            <option value="C2">C2</option>
            <option value="C3">C3</option>
            <option value="C4">C4</option>
            <option value="C5">C5</option>
            <option value="C6">C6</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Perpendicular C2 axes?
          <select value={String(answers.perpendicularC2)} onChange={event => setAnswer('perpendicularC2', event.target.value === 'true')} className="input mt-2 text-xs">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Horizontal plane sigma h?
          <select value={String(answers.sigmaH)} onChange={event => setAnswer('sigmaH', event.target.value === 'true')} className="input mt-2 text-xs">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Vertical planes sigma v?
          <select value={String(answers.sigmaV)} onChange={event => setAnswer('sigmaV', event.target.value === 'true')} className="input mt-2 text-xs">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <label className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">
          Inversion centre?
          <select value={String(answers.inversion)} onChange={event => setAnswer('inversion', event.target.value === 'true')} className="input mt-2 text-xs">
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </label>
        <div className={`rounded-lg border p-3 ${predicted === molecule.pointGroup ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-amber-400/25 bg-amber-400/10'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Predicted point group</p>
          <p className="mt-1 text-2xl font-black text-white">{predicted}</p>
          <p className="mt-1 text-[11px] leading-4 text-gray-300">{signature?.signature || 'Continue refining the flowchart answers.'}</p>
        </div>
      </div>
    </div>
  );
}

function DiscoveryView({ molecule }) {
  const challenges = useMemo(() => ([
    ...molecule.symmetryElements.filter(element => element.type !== 'E').map(element => ({ ...element, expected: true })),
    ...(molecule.distractorElements || []).map(element => ({ ...element, expected: false })),
  ]), [molecule]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [guess, setGuess] = useState(null);
  const [type, setType] = useState('Cn');
  const challenge = challenges[challengeIndex % Math.max(challenges.length, 1)];
  const proposal = useMemo(() => proposeDiscoveryElement(type, molecule), [type, molecule]);
  const submitGuess = (value) => setGuess({ value, correct: value === challenge?.expected });
  const nextChallenge = () => {
    setChallengeIndex(index => index + 1);
    setGuess(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Symmetry Element Discovery Quiz</p>
        <h3 className="text-lg font-black text-white">Decide whether the proposed element is valid</h3>
      </div>
      {challenge ? (
        <div className={`rounded-xl border p-3 ${guess ? (guess.correct ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-rose-400/25 bg-rose-400/10') : 'border-white/10 bg-white/[0.035]'}`}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">{challenge.label}</p>
              <p className="mt-1 text-xs leading-5 text-gray-300">{challenge.description}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => submitGuess(true)} className="btn-secondary text-xs">Valid</button>
              <button onClick={() => submitGuess(false)} className="btn-secondary text-xs">Invalid</button>
              <button onClick={nextChallenge} className="btn-primary text-xs">Next</button>
            </div>
          </div>
          {guess && (
            <p className="mt-2 text-xs font-semibold text-white">
              {guess.correct ? 'Correct.' : 'Not quite.'} This element is {challenge.expected ? 'valid' : 'not valid'} for {molecule.name}.
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-400">No challenge elements are available for this molecule.</p>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Quick proposal helper</p>
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
  const criteria = getOpticalActivityCriteria(molecule);
  const [prediction, setPrediction] = useState('');
  const submitted = prediction !== '';
  const predictedActive = prediction === 'active';
  const predictionCorrect = submitted && predictedActive === criteria.isPotentiallyOpticallyActive;

  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Optical Activity from Symmetry</p>
        <h3 className="text-lg font-black text-white">{criteria.verdict}</h3>
        <p className="mt-2 text-xs leading-5 text-gray-400">{criteria.reason}</p>
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.035] p-3">
          <p className="text-xs font-bold text-white">Prediction mode</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setPrediction('active')} className={`rounded-lg border px-3 py-2 text-xs font-bold ${prediction === 'active' ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-100' : 'border-white/10 text-gray-300'}`}>
              Optically active
            </button>
            <button onClick={() => setPrediction('inactive')} className={`rounded-lg border px-3 py-2 text-xs font-bold ${prediction === 'inactive' ? 'border-rose-400/35 bg-rose-400/10 text-rose-100' : 'border-white/10 text-gray-300'}`}>
              Optically inactive
            </button>
          </div>
          {submitted && (
            <p className={`mt-2 text-xs font-semibold ${predictionCorrect ? 'text-emerald-100' : 'text-rose-100'}`}>
              {predictionCorrect ? 'Correct.' : 'Review the improper symmetry rule.'} {criteria.verdict}
            </p>
          )}
        </div>
        {criteria.blockingElements.length > 0 && (
          <div className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/10 p-3">
            <p className="text-xs font-bold text-rose-100">Symmetry elements that rule out optical activity</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {criteria.blockingElements.map(element => <Badge key={element} tone="rose">{element}</Badge>)}
            </div>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {criteria.checklist.map(note => <div key={note} className="rounded-lg border border-white/10 bg-white/[0.035] p-3 text-xs text-gray-300">{note}</div>)}
        <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-50">{chiralityNotes.chiralRule}</div>
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
  const [selectedPair, setSelectedPair] = useState(pointGroupComparisons[0].pair);
  const selectedComparison = pointGroupComparisons.find(item => item.pair === selectedPair) || pointGroupComparisons[0];
  const comparison = conformationComparisons[molecule.id] || conformationComparisons.ferrocene;
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Point Group Comparison Cards</p>
        <h3 className="text-lg font-black text-white">{selectedComparison.pair}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {pointGroupComparisons.map(item => (
          <button key={item.pair} onClick={() => setSelectedPair(item.pair)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${selectedPair === item.pair ? 'border-cyan-400/35 bg-cyan-400/10 text-cyan-100' : 'border-white/10 text-gray-400'}`}>
            {item.pair}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs leading-5 text-cyan-50">{selectedComparison.left}</div>
        <div className="rounded-xl border border-violet-400/20 bg-violet-400/10 p-3 text-xs leading-5 text-violet-50">{selectedComparison.right}</div>
      </div>
      <p className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-3 text-xs leading-5 text-amber-50">{selectedComparison.clue}</p>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Current molecule conformation note</p>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-gray-300">{comparison.left}</div>
          <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-xs leading-5 text-gray-300">{comparison.right}</div>
        </div>
        <p className="mt-2 text-xs leading-5 text-gray-400">{comparison.teachingPoint}</p>
      </div>
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
  const assignmentSteps = getPointGroupAssignmentSteps(molecule);
  const opticalCriteria = getOpticalActivityCriteria(molecule);
  const exportQuiz = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=820,height=680');
    if (!win) return;
    win.document.write(`<html><head><title>${molecule.name} assessment</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}li{margin:14px 0}.key{margin-top:32px;border-top:1px solid #ddd;padding-top:16px}</style></head><body><h1>${molecule.name} Molecular Symmetry Quiz</h1><ol>${questions.map(q => `<li>${q}</li>`).join('')}</ol><div class="key"><h2>Instructor Key</h2><p>Point group: <strong>${molecule.pointGroup}</strong></p><ol>${molecule.pointGroupReasoning.map(step => `<li>${step}</li>`).join('')}</ol></div></body></html>`);
    win.document.close();
    win.print();
  };
  const exportFlowchart = () => {
    const win = window.open('', '_blank', 'noopener,noreferrer,width=980,height=760');
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Point group assignment flowchart</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
            h1 { margin-bottom: 4px; }
            h2 { margin-top: 28px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
            li { margin: 8px 0; }
            table { border-collapse: collapse; width: 100%; margin-top: 12px; font-size: 13px; }
            td, th { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
            .card { border: 1px solid #d1d5db; border-radius: 10px; padding: 12px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <h1>Point Group Assignment Flowchart</h1>
          <p>Current example: <strong>${molecule.name}</strong> (${molecule.formula}) -> <strong>${molecule.pointGroup}</strong></p>
          <h2>Steps</h2>
          <ol>${decisionTreeQuestions.map(step => `<li>${step}</li>`).join('')}</ol>
          <h2>Worked Current Example</h2>
          ${assignmentSteps.map(step => `<div class="card"><strong>${step.title}:</strong> ${step.result}<br><span>${step.detail}</span></div>`).join('')}
          <h2>Common Point-Group Signatures</h2>
          <table><tr><th>Point group</th><th>Symmetry signature</th><th>Example clue</th></tr>${pointGroupSignatures.map(row => `<tr><td>${row.group}</td><td>${row.signature}</td><td>${row.example}</td></tr>`).join('')}</table>
          <h2>Families</h2>
          <table><tr><th>Family</th><th>Groups</th><th>Criteria</th></tr>${pointGroupFamilies.map(row => `<tr><td>${row.family}</td><td>${row.groups.join(', ')}</td><td>${row.criteria}</td></tr>`).join('')}</table>
          <h2>Optical Activity Criterion</h2>
          <p>${opticalCriteria.verdict}</p>
          <ul>${opticalCriteria.checklist.map(item => `<li>${item}</li>`).join('')}</ul>
        </body>
      </html>
    `);
    win.document.close();
    win.print();
  };
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Printable Flowchart and Assessment</p>
          <h3 className="text-lg font-black text-white">Handout generator for {molecule.name}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportFlowchart} className="btn-secondary text-xs">Export Flowchart PDF</button>
          <button onClick={exportQuiz} className="btn-primary text-xs">Export Quiz PDF</button>
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {assignmentSteps.map(step => (
          <div key={step.title} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <p className="text-xs font-bold text-white">{step.title}</p>
            <p className="mt-1 text-[11px] font-semibold text-cyan-100">{step.result}</p>
            <p className="mt-1 text-[11px] leading-4 text-gray-500">{step.detail}</p>
          </div>
        ))}
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
