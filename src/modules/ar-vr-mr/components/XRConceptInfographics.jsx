import {
  Atom, BadgeCheck, BookOpenCheck, Box, Brain, ChevronRight, Compass, FlaskConical,
  GraduationCap, Layers3, Microscope, Orbit, ScanLine, Sparkles, Target, Zap,
} from 'lucide-react';

const infographicIds = [
  'atom-walkthrough',
  'ar-periodic-table',
  'ionic-lattice',
  'vsepr-room',
  'mechanism-player',
];

const infographicDetails = {
  'atom-walkthrough': {
    icon: Atom,
    accent: '#38bdf8',
    headline: 'From nucleus scale to orbital probability',
    story: 'Learners begin at a dense nucleus, expand outward through shell scaffolds, then fade into the orbital-cloud model so the misconception of fixed electron tracks is corrected.',
    bigIdea: 'Electrons are represented by probability density, while circular shells are only an introductory scaffold.',
    wowMoment: 'The learner stands inside the atom and watches the familiar shell model dissolve into a glowing probability cloud.',
    visualMetaphor: ['Nucleus core', 'Shell scaffold', 'Cloud reveal', 'Misconception check'],
    chemistryWins: ['nuclear charge', 'electron shells', 'orbital probability', 'relative scale'],
    learnerActions: ['Pinch scale from nucleus to cloud', 'Toggle shell scaffold', 'Select an electron marker', 'Compare model limits'],
    dataCallouts: [
      ['Scale gap', 'nucleus vs atom'],
      ['Model shift', 'Bohr -> orbital'],
      ['Checkpoint', 'scaffold vs reality'],
    ],
    teacherMove: 'Ask students to name which part is useful but not literal, then justify why probability language is more accurate.',
  },
  'ar-periodic-table': {
    icon: ScanLine,
    accent: '#f59e0b',
    headline: 'Turn periodic trends into a desk-scale map',
    story: 'A compact element strip expands into an AR table. Group trends become spatial arrows, selected elements inflate into atoms, and exceptions are called out instead of hidden.',
    bigIdea: 'Periodic trends are patterns with direction and exceptions, best learned through comparison.',
    wowMoment: 'A table-sized trend arrow floats over alkali metals while each element pulses by atomic radius.',
    visualMetaphor: ['Desk anchor', 'Group highlight', 'Trend arrow', 'Element expand'],
    chemistryWins: ['atomic radius', 'reactivity', 'group trends', 'periodic law'],
    learnerActions: ['Place on surface', 'Select a group', 'Expand one element', 'Compare trend direction'],
    dataCallouts: [
      ['Trend', 'radius increases down'],
      ['Mode', 'AR surface'],
      ['Risk', 'show exceptions'],
    ],
    teacherMove: 'Have students predict trend direction before revealing the arrow, then ask where the simple rule may fail.',
  },
  'ionic-lattice': {
    icon: Box,
    accent: '#22c55e',
    headline: 'Make ionic packing visible in mixed reality',
    story: 'Alternating ions snap into a charge-balanced NaCl lattice, with nearest-neighbor counts and unit-cell boundaries visible from multiple walking angles.',
    bigIdea: 'Ionic solids are repeating charge-balanced arrays, not isolated molecule pairs.',
    wowMoment: 'Students walk around the lattice and see coordination number update as ions are selected.',
    visualMetaphor: ['Ion snap', 'Charge alternation', 'Unit cell', 'Coordination count'],
    chemistryWins: ['ionic bonding', 'coordination number', 'unit cell', 'charge balance'],
    learnerActions: ['Select Na+ or Cl-', 'Count neighbors', 'Reveal unit cell', 'Scale to room model'],
    dataCallouts: [
      ['Formula', 'NaCl'],
      ['Structure', 'repeating lattice'],
      ['Check', 'nearest neighbors'],
    ],
    teacherMove: 'Ask why the formula is NaCl even though the visible structure contains many ions.',
  },
  'vsepr-room': {
    icon: Orbit,
    accent: '#a78bfa',
    headline: 'See electron domains push molecular shape',
    story: 'Bonding domains and lone pairs become visible force objects. Learners adjust domains and watch geometry relax into stable VSEPR shapes.',
    bigIdea: 'Molecular shape comes from electron-domain repulsion, with lone pairs exerting stronger repulsion than bonding pairs.',
    wowMoment: 'Lone pairs glow and push bonds apart until the angle arc settles into the final geometry.',
    visualMetaphor: ['Central atom', 'Bond domains', 'Lone-pair force', 'Angle settle'],
    chemistryWins: ['VSEPR', 'bond angle', 'lone pair', 'electron domain'],
    learnerActions: ['Toggle lone pairs', 'Read angle arcs', 'Compare shapes', 'Explain repulsion'],
    dataCallouts: [
      ['Shape', 'domains -> geometry'],
      ['Force', 'LP > BP'],
      ['Skill', 'predict angles'],
    ],
    teacherMove: 'Ask students to predict how adding one lone pair changes the visible bond angle before running the animation.',
  },
  'mechanism-player': {
    icon: Zap,
    accent: '#fb7185',
    headline: 'Animate electron flow, not just curved arrows',
    story: 'Curved arrows become moving electron pairs. The mechanism can pause at nucleophile attack, transition state, bond formation, and leaving-group departure.',
    bigIdea: 'Organic mechanisms describe electron movement from electron-rich sources to electron-poor destinations.',
    wowMoment: 'The arrow turns into a glowing electron stream that learners can pause and inspect at each bond-changing step.',
    visualMetaphor: ['Electron source', 'Arrow path', 'Bond change', 'Leaving group'],
    chemistryWins: ['nucleophile', 'leaving group', 'curved arrows', 'transition state'],
    learnerActions: ['Find electron source', 'Advance mechanism step', 'Pause transition state', 'Validate arrow direction'],
    dataCallouts: [
      ['Rule', 'start at electrons'],
      ['Step', 'bond make/break'],
      ['Check', 'arrow validity'],
    ],
    teacherMove: 'Show an invalid arrow and ask students to explain why the arrow cannot begin at an electron-poor site.',
  },
};

const InfographicDiagram = ({ detail }) => (
  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/25 p-4">
    <div className="absolute inset-x-8 top-1/2 h-px bg-white/10" />
    <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
      {detail.visualMetaphor.map((step, index) => (
        <div key={step} className="rounded-xl border border-white/10 bg-slate-950/80 p-3">
          <div className="flex items-center justify-between">
            <span
              className="grid h-9 w-9 place-items-center rounded-full border text-xs font-black text-white"
              style={{ borderColor: `${detail.accent}66`, background: `${detail.accent}24` }}
            >
              {index + 1}
            </span>
            {index < detail.visualMetaphor.length - 1 && <ChevronRight size={16} className="hidden text-gray-500 sm:block" />}
          </div>
          <p className="mt-3 text-sm font-black text-white">{step}</p>
        </div>
      ))}
    </div>
  </div>
);

const Callout = ({ label, value, accent }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
    <p className="mt-2 text-sm font-black text-white" style={{ color: accent }}>{value}</p>
  </div>
);

const BulletList = ({ icon: Icon, title, items }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
      <Icon size={14} /> {title}
    </p>
    <div className="mt-3 flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-bold text-gray-200">
          {item}
        </span>
      ))}
    </div>
  </div>
);

export const XRConceptInfographics = ({ experiences, activeExperienceId, onSelectExperience }) => {
  const concepts = infographicIds
    .map(id => experiences.find(item => item.id === id))
    .filter(Boolean);
  const active = concepts.find(item => item.id === activeExperienceId) || concepts[0];
  const detail = infographicDetails[active.id];
  const Icon = detail.icon;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
            <Sparkles size={14} /> Infographics batch 1
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">Detailed concept infographics</h3>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-400">
            First five world-class learning infographics, built as responsive interactive panels so the remaining concepts can be added in batches.
          </p>
        </div>
        <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
          5 of {experiences.length} concepts
        </span>
      </div>

      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {concepts.map(item => {
          const itemDetail = infographicDetails[item.id];
          const ItemIcon = itemDetail.icon;
          const selected = item.id === active.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectExperience?.(item.id)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                selected ? 'border-cyan-300/35 bg-cyan-400/15' : 'border-white/10 bg-black/20 hover:bg-white/[0.06]'
              }`}
            >
              <ItemIcon size={17} style={{ color: itemDetail.accent }} />
              <p className="mt-2 text-sm font-black text-white">{item.title}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">{item.mode} - {item.formula}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_330px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <Icon size={15} style={{ color: detail.accent }} /> {active.mode} concept infographic
                </p>
                <h4 className="mt-2 text-2xl font-black text-white">{detail.headline}</h4>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{detail.story}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-right">
                <p className="text-2xl font-black" style={{ color: detail.accent }}>{active.readiness}%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Readiness</p>
              </div>
            </div>
            <div className="mt-4">
              <InfographicDiagram detail={detail} />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {detail.dataCallouts.map(([label, value]) => (
              <Callout key={label} label={label} value={value} accent={detail.accent} />
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <BulletList icon={Microscope} title="Chemistry focus" items={detail.chemistryWins} />
            <BulletList icon={Compass} title="Learner actions" items={detail.learnerActions} />
          </div>
        </div>

        <aside className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <Brain size={14} /> Big idea
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-200">{detail.bigIdea}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <Zap size={14} /> Wow moment
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-200">{detail.wowMoment}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <GraduationCap size={14} /> Teacher move
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-200">{detail.teacherMove}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              [Target, active.category],
              [Layers3, active.sceneType],
              [BookOpenCheck, `${active.lessonSteps.length} steps`],
              [BadgeCheck, active.phase],
            ].map(([MetaIcon, value]) => (
              <div key={value} className="rounded-xl border border-white/10 bg-black/20 p-3">
                <MetaIcon size={15} className="text-cyan-300" />
                <p className="mt-2 text-xs font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <FlaskConical size={14} /> Accuracy note
            </p>
            <p className="mt-3 text-xs leading-relaxed text-gray-400">{active.chemistry.accuracyNotes}</p>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default XRConceptInfographics;
