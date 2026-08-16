import { useMemo, useState } from 'react';
import {
  Atom, BadgeCheck, BarChart3, BookOpen, Box, Brain, Calculator, CheckCircle2,
  FlaskConical, GraduationCap, Layers3, ListChecks, Orbit, Sigma, Sparkles, Target,
} from 'lucide-react';
import {
  getSeniorCoreChapters,
  phase2Readiness,
  phase2SeniorPacks,
  seniorCoreChapters,
  seniorCoreDomains,
  seniorCoreStats,
  seniorCoreTracks,
} from '../data/seniorChemistryCore.js';

const domainIcons = {
  physical: BarChart3,
  organic: FlaskConical,
  inorganic: Atom,
  analytical: Calculator,
};

const domainStyles = {
  physical: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  organic: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  inorganic: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
  analytical: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
};

const readinessStyles = {
  Active: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  Needed: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
};

const SeniorVisualPreview = ({ domain }) => {
  if (domain === 'organic') {
    return (
      <svg viewBox="0 0 360 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        <circle cx="74" cy="104" r="24" fill="#38bdf8" />
        <circle cx="166" cy="104" r="24" fill="#22c55e" />
        <circle cx="258" cy="104" r="24" fill="#f97316" />
        <line x1="98" y1="104" x2="142" y2="104" stroke="#e2e8f0" strokeWidth="5" />
        <line x1="190" y1="104" x2="234" y2="104" stroke="#e2e8f0" strokeWidth="5" />
        <path d="M96 66 C140 28 198 28 240 66" fill="none" stroke="#facc15" strokeWidth="4" markerEnd="url(#arrow)" />
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#facc15" />
          </marker>
        </defs>
        <text x="64" y="110" fontSize="15" fill="#020617" fontWeight="900">Nu</text>
        <text x="159" y="110" fontSize="15" fill="#020617" fontWeight="900">C</text>
        <text x="251" y="110" fontSize="15" fill="#020617" fontWeight="900">LG</text>
        <text x="42" y="180" fill="#cbd5e1" fontSize="13">Mechanism + stereochemical movement preview</text>
      </svg>
    );
  }

  if (domain === 'inorganic') {
    return (
      <svg viewBox="0 0 360 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        <circle cx="180" cy="105" r="24" fill="#a78bfa" />
        <text x="180" y="111" textAnchor="middle" fontSize="16" fill="#020617" fontWeight="900">M</text>
        {[[180,38], [180,172], [90,105], [270,105], [118,55], [242,155]].map(([x, y], index) => (
          <g key={index}>
            <line x1="180" y1="105" x2={x} y2={y} stroke="#94a3b8" strokeWidth="3" />
            <circle cx={x} cy={y} r="16" fill="#38bdf8" />
            <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fill="#020617" fontWeight="900">L</text>
          </g>
        ))}
        <path d="M54 34h78v12H54zM54 58h126v12H54zM54 82h170v12H54z" fill="#22c55e99" />
        <text x="36" y="190" fill="#cbd5e1" fontSize="13">Geometry + CFT splitting + color/magnetism preview</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 360 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
      <polyline points="30,168 84,150 138,124 192,82 246,56 316,34" fill="none" stroke="#38bdf8" strokeWidth="5" />
      <polyline points="30,170 84,166 138,156 192,132 246,92 316,48" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="8 8" />
      {[[84,150], [138,124], [192,82], [246,56]].map(([x, y], index) => (
        <circle key={index} cx={x} cy={y} r="7" fill="#facc15" />
      ))}
      <line x1="30" y1="170" x2="330" y2="170" stroke="#64748b" />
      <line x1="30" y1="28" x2="30" y2="170" stroke="#64748b" />
      <text x="122" y="196" fill="#cbd5e1" fontSize="13">Graph, formula and particle model preview</text>
      <text x="238" y="84" fill="#38bdf8" fontSize="11">Arrhenius</text>
      <text x="238" y="105" fill="#22c55e" fontSize="11">Concentration</text>
    </svg>
  );
};

export const SeniorChemistryCorePage = ({ onNavigate }) => {
  const [activeTrack, setActiveTrack] = useState('class12');
  const [activeDomain, setActiveDomain] = useState('physical');
  const [activeChapterId, setActiveChapterId] = useState('solutions-electrochem');
  const chapters = useMemo(() => getSeniorCoreChapters({ track: activeTrack, domain: activeDomain }), [activeTrack, activeDomain]);
  const visibleDomains = useMemo(() => (
    seniorCoreDomains.filter(domain => getSeniorCoreChapters({ track: activeTrack, domain: domain.id }).length > 0)
  ), [activeTrack]);
  const activeChapter = chapters.find(chapter => chapter.id === activeChapterId) || chapters[0] || seniorCoreChapters[0];
  const activeTrackMeta = seniorCoreTracks.find(track => track.id === activeTrack) || seniorCoreTracks[1];

  const selectTrack = (trackId) => {
    const nextDomain = getSeniorCoreChapters({ track: trackId, domain: activeDomain }).length
      ? activeDomain
      : seniorCoreDomains.find(domain => getSeniorCoreChapters({ track: trackId, domain: domain.id }).length)?.id || 'physical';
    const next = getSeniorCoreChapters({ track: trackId, domain: nextDomain });
    setActiveTrack(trackId);
    setActiveDomain(nextDomain);
    setActiveChapterId(next[0]?.id || activeChapterId);
  };

  const selectDomain = (domainId) => {
    const next = getSeniorCoreChapters({ track: activeTrack, domain: domainId });
    setActiveDomain(domainId);
    setActiveChapterId(next[0]?.id || activeChapterId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950/50 to-cyan-950/40 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Senior Chemistry Core</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              Class 11-12 chemistry with physical numericals, organic mechanisms, inorganic reasoning, formula sheets, exam traps, and 2D/3D tools.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-5">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-white">{seniorCoreStats.chapters}</p>
              <p className="text-[10px] text-gray-500">chapters</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-cyan-100">{seniorCoreStats.formulae}</p>
              <p className="text-[10px] text-gray-500">formulae</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-emerald-100">{seniorCoreStats.visualTasks}</p>
              <p className="text-[10px] text-gray-500">visual tasks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-amber-100">{seniorCoreStats.practice}</p>
              <p className="text-[10px] text-gray-500">practice</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-violet-100">{seniorCoreStats.packs}</p>
              <p className="text-[10px] text-gray-500">study packs</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[285px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Senior Track</h3>
          </div>
          <div className="space-y-2">
            {seniorCoreTracks.map(track => (
              <button
                key={track.id}
                type="button"
                onClick={() => selectTrack(track.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  activeTrack === track.id ? 'border-cyan-300/40 bg-cyan-300/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.065]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: track.color }} />
                  <span className="text-sm font-black text-white">{track.label}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{track.focus}</p>
              </button>
            ))}
          </div>

          <div className="mt-5">
            <div className="mb-3 flex items-center gap-2">
              <Orbit size={16} className="text-emerald-300" />
              <h3 className="text-sm font-bold text-white">Domain</h3>
            </div>
            <div className="space-y-2">
              {visibleDomains.map(domain => {
                const Icon = domainIcons[domain.id] || Sigma;
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => selectDomain(domain.id)}
                    className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition-colors ${
                      activeDomain === domain.id ? 'border-white/20 bg-white/[0.09] text-white' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <Icon size={15} style={{ color: domain.color }} />
                    {domain.label}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{activeTrackMeta.label}</p>
                <h3 className="mt-1 text-lg font-black text-white">{activeTrackMeta.focus}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {chapters.map(chapter => (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => setActiveChapterId(chapter.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                      activeChapter.id === chapter.id ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {chapter.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${domainStyles[activeChapter.domain] || domainStyles.physical}`}>
                      {activeChapter.level}
                    </span>
                    <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300">{activeChapter.domain}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{activeChapter.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{activeChapter.goal}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onNavigate?.(activeChapter.twoDRoute)} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15">
                    <Box size={14} /> 2D
                  </button>
                  <button type="button" onClick={() => onNavigate?.(activeChapter.threeDRoute)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15">
                    <Layers3 size={14} /> 3D
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Brain size={14} className="text-cyan-200" />
                    <p className="text-xs font-black text-white">Concept Map</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChapter.concepts.map(concept => (
                      <span key={concept} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-gray-300">{concept}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Calculator size={14} className="text-emerald-200" />
                    <p className="text-xs font-black text-white">Formula / Rule Sheet</p>
                  </div>
                  <div className="space-y-1.5">
                    {activeChapter.formulae.map(item => (
                      <p key={item} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-bold text-gray-300">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">2D/3D Preview</h3>
              </div>
              <SeniorVisualPreview domain={activeChapter.domain} />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Layers3 size={16} className="text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Visual Tasks</h3>
              </div>
              <div className="space-y-2">
                {activeChapter.visualTasks.map(task => (
                  <p key={task} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-gray-300">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />{task}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Practice</h3>
              </div>
              <div className="space-y-2">
                {activeChapter.practice.map((question, index) => (
                  <p key={question} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-gray-300">
                    <span className="mr-2 font-black text-cyan-200">Q{index + 1}</span>{question}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BadgeCheck size={16} className="text-amber-300" />
                <h3 className="text-sm font-bold text-white">Exam Traps</h3>
              </div>
              <div className="space-y-2">
                {activeChapter.examFocus.map(item => (
                  <p key={item} className="rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-50">{item}</p>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardIcon />
                <h3 className="text-sm font-bold text-white">Senior / UG Study Packs</h3>
              </div>
              <div className="grid gap-2">
                {phase2SeniorPacks.map(pack => (
                  <button key={pack.id} type="button" onClick={() => onNavigate?.(pack.route)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{pack.title}</p>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">{pack.band}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {pack.includes.map(item => <span key={item} className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] font-bold text-gray-300">{item}</span>)}
                    </div>
                    <div className="mt-2 space-y-1">
                      {pack.evidence.map(item => <p key={item} className="flex gap-2 text-[11px] font-semibold text-emerald-100"><CheckCircle2 size={12} className="mt-0.5 shrink-0" />{item}</p>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks size={16} className="text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Learning Readiness</h3>
              </div>
              <div className="space-y-2">
                {phase2Readiness.map(item => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${readinessStyles[item.status] || readinessStyles.Needed}`}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
};

const ClipboardIcon = () => <BookOpen size={16} className="text-cyan-300" />;

export default SeniorChemistryCorePage;
