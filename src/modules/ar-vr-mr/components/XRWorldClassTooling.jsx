import {
  Atom, Blocks, BookOpenCheck, CheckCircle2, ClipboardList,
  Copy, Database, GraduationCap, Handshake, Layers3, Lock, Network,
  Plus, RadioTower, RefreshCw, ShieldCheck, Users, Wand2, X,
} from 'lucide-react';

const atomPalette = [
  ['C', '#94a3b8', 4],
  ['H', '#e5e7eb', 1],
  ['O', '#ef4444', 2],
  ['N', '#38bdf8', 3],
  ['Cl', '#22c55e', 1],
  ['Na', '#f59e0b', 1],
  ['S', '#facc15', 2],
  ['P', '#a78bfa', 3],
];

const commonMolecules = [
  { name: 'Water', formula: 'H2O', atoms: ['O', 'H', 'H'], geometry: 'Bent' },
  { name: 'Methane', formula: 'CH4', atoms: ['C', 'H', 'H', 'H', 'H'], geometry: 'Tetrahedral' },
  { name: 'Ammonia', formula: 'NH3', atoms: ['N', 'H', 'H', 'H'], geometry: 'Trigonal pyramidal' },
  { name: 'Ethanol', formula: 'C2H6O', atoms: ['C', 'C', 'O', 'H', 'H', 'H', 'H', 'H', 'H'], geometry: 'Flexible chain' },
];

const readinessRows = [
  ['AR hit-test UX', 'Surface controls, readiness scoring, reticle, anchor toggles', 'Strong base'],
  ['Chemistry builder', 'Atom palette, formula tracking, valence guardrails, style presets', 'Implemented shell'],
  ['Teacher mode', 'Lesson lock, pacing, broadcast step, roster state', 'Implemented shell'],
  ['Collaboration', 'Room code, roles, shared pointer mode, participant state', 'Implemented shell'],
  ['Molecular data', 'PubChem/PDB/local queue and validation workflow', 'Implemented shell'],
  ['Assessment exports', 'Snapshots, reports, quiz state, classroom summary', 'Strong base'],
];

const formulaFromAtoms = (atoms) => atoms.reduce((counts, item) => {
  counts[item.symbol] = (counts[item.symbol] || 0) + 1;
  return counts;
}, {});

const formatFormula = (atoms) => {
  const counts = formulaFromAtoms(atoms);
  const order = ['C', 'H', ...Object.keys(counts).filter(key => !['C', 'H'].includes(key)).sort()];
  return order
    .filter(symbol => counts[symbol])
    .map(symbol => `${symbol}${counts[symbol] > 1 ? counts[symbol] : ''}`)
    .join('') || 'Empty';
};

const valenceWarnings = (atoms, bonds) => {
  const counts = Object.fromEntries(atoms.map(item => [item.id, 0]));
  bonds.forEach(bond => {
    counts[bond.from] = (counts[bond.from] || 0) + bond.order;
    counts[bond.to] = (counts[bond.to] || 0) + bond.order;
  });

  return atoms
    .map(item => {
      const maxValence = atomPalette.find(([symbol]) => symbol === item.symbol)?.[2] || 4;
      return counts[item.id] > maxValence ? `${item.label} exceeds common valence (${counts[item.id]}/${maxValence})` : null;
    })
    .filter(Boolean);
};

const stableRoomCode = () => `XR-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const SectionHeading = ({ icon: Icon, eyebrow, title, detail }) => (
  <div>
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
      <Icon size={14} /> {eyebrow}
    </p>
    <h3 className="mt-2 text-xl font-black text-white">{title}</h3>
    {detail && <p className="mt-1 text-sm leading-relaxed text-gray-400">{detail}</p>}
  </div>
);

const ToggleButton = ({ active, icon: Icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={`flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
      active
        ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100'
        : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
    }`}
  >
    <Icon size={14} /> {children}
  </button>
);

export const createDefaultWorldClassState = () => ({
  builder: {
    atoms: [
      { id: 'a1', symbol: 'C', label: 'C1', color: '#94a3b8' },
      { id: 'a2', symbol: 'O', label: 'O1', color: '#ef4444' },
      { id: 'a3', symbol: 'H', label: 'H1', color: '#e5e7eb' },
    ],
    bonds: [
      { from: 'a1', to: 'a2', order: 1 },
      { from: 'a2', to: 'a3', order: 1 },
    ],
    selectedStyle: 'Ball-stick',
    buildMode: 'Guided',
    showValence: true,
  },
  teacher: {
    roomCode: stableRoomCode(),
    lessonLocked: true,
    broadcastStep: true,
    pacing: 2,
    studentCount: 18,
    focusMode: 'Checkpoint',
  },
  collaboration: {
    roomId: stableRoomCode(),
    role: 'Instructor',
    pointerMode: 'Laser',
    voiceReady: false,
    sharedState: 'Synced',
    participants: ['Teacher', 'Asha', 'Ravi', 'Maya'],
  },
  dataImport: {
    source: 'PubChem',
    query: 'caffeine',
    queue: [
      { id: 'CID-2519', name: 'Caffeine', formula: 'C8H10N4O2', status: 'Validated' },
    ],
    validation: 'Ready for preview',
  },
});

const XRMoleculeBuilderPanel = ({ state, onChange }) => {
  const warnings = valenceWarnings(state.atoms, state.bonds);
  const formula = formatFormula(state.atoms);

  const addAtom = ([symbol, color]) => {
    const count = state.atoms.filter(item => item.symbol === symbol).length + 1;
    const nextAtom = {
      id: `${symbol}-${Date.now()}`,
      symbol,
      label: `${symbol}${count}`,
      color,
    };
    const lastAtom = state.atoms[state.atoms.length - 1];
    onChange({
      ...state,
      atoms: [...state.atoms, nextAtom],
      bonds: lastAtom ? [...state.bonds, { from: lastAtom.id, to: nextAtom.id, order: 1 }] : state.bonds,
    });
  };

  const removeAtom = (id) => onChange({
    ...state,
    atoms: state.atoms.filter(item => item.id !== id),
    bonds: state.bonds.filter(item => item.from !== id && item.to !== id),
  });

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeading
          icon={Atom}
          eyebrow="Molecule builder"
          title="Build, validate, then launch"
          detail="A guided authoring base for chemistry objects before they become AR/MR/VR scenes."
        />
        <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
          <p className="text-2xl font-black text-white">{formula}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Live formula</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_280px]">
        <div>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
            {atomPalette.map(item => (
              <button
                key={item[0]}
                onClick={() => addAtom(item)}
                className="rounded-xl border border-white/10 bg-black/20 p-3 text-center transition-colors hover:bg-white/[0.06]"
              >
                <span className="mx-auto grid h-9 w-9 place-items-center rounded-full text-sm font-black text-white" style={{ background: item[1] }}>
                  {item[0]}
                </span>
                <span className="mt-2 block text-[10px] font-bold text-gray-500">valence {item[2]}</span>
              </button>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {['Ball-stick', 'Space-fill', 'Electron cloud'].map(style => (
              <ToggleButton
                key={style}
                active={state.selectedStyle === style}
                icon={Layers3}
                onClick={() => onChange({ ...state, selectedStyle: style })}
              >
                {style}
              </ToggleButton>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {state.atoms.map(item => (
              <span key={item.id} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-gray-200">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                {item.label}
                <button onClick={() => removeAtom(item.id)} aria-label={`Remove ${item.label}`} className="text-gray-500 hover:text-rose-200">
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <ShieldCheck size={14} /> Valence guard
            </p>
            <div className="mt-3 space-y-2">
              {(warnings.length ? warnings : ['All current bonds are within simple valence guardrails.']).map(item => (
                <p key={item} className={`rounded-lg border px-3 py-2 text-xs ${warnings.length ? 'border-amber-400/25 bg-amber-400/10 text-amber-100' : 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'}`}>
                  {item}
                </p>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Bond count</p>
            <p className="mt-2 text-2xl font-black text-white">{state.bonds.length}</p>
            <p className="mt-1 text-xs text-gray-500">Auto-linked chain for rapid classroom sketching.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const XRTeacherClassroomPanel = ({ state, onChange }) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
    <SectionHeading
      icon={GraduationCap}
      eyebrow="Teacher console"
      title="Control the room without leaving the scene"
      detail="The base for synchronous lessons, guided checkpoints, pacing, and classroom broadcast."
    />
    <div className="mt-4 grid gap-3 lg:grid-cols-4">
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Room code</p>
        <p className="mt-2 font-mono text-2xl font-black text-white">{state.roomCode}</p>
      </div>
      <label className="rounded-xl border border-white/10 bg-black/20 p-3 lg:col-span-2">
        <span className="flex justify-between text-xs font-bold text-gray-300">
          <span>Pacing</span>
          <span className="text-cyan-200">Level {state.pacing}</span>
        </span>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={state.pacing}
          onChange={event => onChange({ ...state, pacing: Number(event.target.value) })}
          className="mt-3 w-full"
        />
      </label>
      <div className="rounded-xl border border-white/10 bg-black/20 p-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Students</p>
        <p className="mt-2 text-2xl font-black text-white">{state.studentCount}</p>
      </div>
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-4">
      <ToggleButton active={state.lessonLocked} icon={Lock} onClick={() => onChange({ ...state, lessonLocked: !state.lessonLocked })}>Lock lesson</ToggleButton>
      <ToggleButton active={state.broadcastStep} icon={RadioTower} onClick={() => onChange({ ...state, broadcastStep: !state.broadcastStep })}>Broadcast step</ToggleButton>
      {['Explore', 'Checkpoint'].map(mode => (
        <ToggleButton key={mode} active={state.focusMode === mode} icon={BookOpenCheck} onClick={() => onChange({ ...state, focusMode: mode })}>{mode}</ToggleButton>
      ))}
    </div>
  </section>
);

const XRCollaborationPanel = ({ state, onChange }) => {
  const copyRoom = async () => {
    await navigator.clipboard?.writeText(state.roomId).catch(() => null);
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <SectionHeading
        icon={Handshake}
        eyebrow="Collaboration"
        title="Shared XR chemistry room"
        detail="A multiuser-ready scaffold for shared pointers, roles, voice readiness, and synchronized state."
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-[240px_1fr]">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Room</p>
          <p className="mt-2 font-mono text-2xl font-black text-white">{state.roomId}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button onClick={copyRoom} className="btn-secondary flex items-center justify-center gap-2 px-2 py-2 text-xs">
              <Copy size={14} /> Copy
            </button>
            <button onClick={() => onChange({ ...state, roomId: stableRoomCode() })} className="btn-secondary flex items-center justify-center gap-2 px-2 py-2 text-xs">
              <RefreshCw size={14} /> New
            </button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Role</p>
            <select
              value={state.role}
              onChange={event => onChange({ ...state, role: event.target.value })}
              className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
            >
              {['Instructor', 'Lab partner', 'Observer'].map(role => <option key={role}>{role}</option>)}
            </select>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Pointer</p>
            <select
              value={state.pointerMode}
              onChange={event => onChange({ ...state, pointerMode: event.target.value })}
              className="mt-3 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
            >
              {['Laser', 'Atom select', 'Annotation'].map(mode => <option key={mode}>{mode}</option>)}
            </select>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Sync</p>
            <p className="mt-2 text-2xl font-black text-emerald-200">{state.sharedState}</p>
            <button onClick={() => onChange({ ...state, voiceReady: !state.voiceReady })} className="mt-2 w-full btn-secondary flex items-center justify-center gap-2 px-2 py-2 text-xs">
              <RadioTower size={14} /> {state.voiceReady ? 'Voice ready' : 'Voice muted'}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {state.participants.map(name => (
          <span key={name} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-xs font-bold text-gray-200">
            <Users size={12} className="text-cyan-300" /> {name}
          </span>
        ))}
      </div>
    </section>
  );
};

const XRDataImportPanel = ({ state, onChange }) => {
  const addCommonMolecule = (molecule) => onChange({
    ...state,
    query: molecule.name.toLowerCase(),
    queue: [
      ...state.queue,
      {
        id: `${molecule.formula}-${state.queue.length + 1}`,
        name: molecule.name,
        formula: molecule.formula,
        status: molecule.geometry,
      },
    ],
    validation: `${molecule.name} queued for XR preview`,
  });

  const addQuery = () => {
    const cleanQuery = state.query.trim() || 'custom molecule';
    onChange({
      ...state,
      queue: [
        ...state.queue,
        {
          id: `${state.source}-${Date.now()}`,
          name: cleanQuery,
          formula: state.source === 'PDB' ? 'Protein/Ligand' : 'Needs lookup',
          status: 'Queued',
        },
      ],
      validation: `${cleanQuery} added from ${state.source}`,
    });
  };

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <SectionHeading
        icon={Database}
        eyebrow="Molecular data"
        title="Import-ready chemistry pipeline"
        detail="A frontend workflow for PubChem, PDB, and local molecule sources before live API adapters are attached."
      />
      <div className="mt-4 grid gap-3 lg:grid-cols-[160px_1fr_auto]">
        <select
          value={state.source}
          onChange={event => onChange({ ...state, source: event.target.value })}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm font-bold text-white"
        >
          {['PubChem', 'PDB', 'Local file'].map(source => <option key={source}>{source}</option>)}
        </select>
        <input
          value={state.query}
          onChange={event => onChange({ ...state, query: event.target.value })}
          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white outline-none focus:border-cyan-300/40"
          placeholder="Search by name, CID, PDB ID, or formula"
        />
        <button onClick={addQuery} className="btn-primary flex items-center justify-center gap-2 px-4 py-2 text-sm">
          <Plus size={15} /> Queue
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {commonMolecules.map(item => (
          <button
            key={item.name}
            onClick={() => addCommonMolecule(item)}
            className="rounded-xl border border-white/10 bg-black/20 p-3 text-left transition-colors hover:bg-white/[0.06]"
          >
            <p className="text-sm font-black text-white">{item.name}</p>
            <p className="mt-1 font-mono text-xs text-cyan-200">{item.formula}</p>
            <p className="mt-1 text-xs text-gray-500">{item.geometry}</p>
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2">
        {state.queue.map(item => (
          <div key={item.id} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black text-white">{item.name}</p>
              <p className="font-mono text-xs text-gray-500">{item.id}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs font-bold text-cyan-100">{item.formula}</span>
              <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-xs font-bold text-emerald-100">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-xs font-bold text-emerald-100">{state.validation}</p>
    </section>
  );
};

const XRProductionReadinessPanel = () => (
  <section className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
    <SectionHeading
      icon={ClipboardList}
      eyebrow="World-class readiness"
      title="Gap-to-capability matrix"
      detail="The module now has product surfaces for the major gaps seen in top immersive chemistry tools."
    />
    <div className="mt-4 grid gap-2 lg:grid-cols-2">
      {readinessRows.map(([area, capability, status]) => (
        <div key={area} className="rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="flex items-start gap-3">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
              <CheckCircle2 size={15} />
            </div>
            <div>
              <p className="text-sm font-black text-white">{area}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{capability}</p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-cyan-300">{status}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export const XRWorldClassTooling = ({ state, onStateChange }) => {
  const updateSlice = (key, value) => onStateChange({ ...state, [key]: value });

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <SectionHeading
            icon={Wand2}
            eyebrow="Creator toolkit"
            title="Author, teach, collaborate, import"
            detail="These are the core product systems that turn a nice XR demo into a serious chemistry learning tool."
          />
          <div className="grid grid-cols-2 gap-2">
            {[
              ['Builder', state.builder.atoms.length, Blocks],
              ['Learners', state.teacher.studentCount, Users],
              ['Queue', state.dataImport.queue.length, Database],
              ['Synced', state.collaboration.sharedState, Network],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <Icon size={15} className="text-cyan-200" />
                <p className="mt-2 text-lg font-black text-white">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <XRMoleculeBuilderPanel state={state.builder} onChange={value => updateSlice('builder', value)} />

      <div className="grid gap-4 xl:grid-cols-2">
        <XRTeacherClassroomPanel state={state.teacher} onChange={value => updateSlice('teacher', value)} />
        <XRCollaborationPanel state={state.collaboration} onChange={value => updateSlice('collaboration', value)} />
      </div>

      <XRDataImportPanel state={state.dataImport} onChange={value => updateSlice('dataImport', value)} />
      <XRProductionReadinessPanel />
    </div>
  );
};

export default XRWorldClassTooling;
