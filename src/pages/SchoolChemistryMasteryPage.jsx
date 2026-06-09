import { useMemo, useState } from 'react';
import {
  BadgeCheck, Box, Brain, CheckCircle2, ClipboardList,
  FlaskConical, GraduationCap, Layers3, ListChecks, Microscope, Route,
} from 'lucide-react';
import {
  getSchoolMasteryByGrade,
  schoolMasteryChapters,
  schoolMasteryGrades,
  schoolMasteryStats,
} from '../data/schoolChemistryMastery.js';

const difficultyStyle = {
  Foundation: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  Exam: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
};

const VisualPreview = ({ unit }) => {
  if (unit === 'acidBase') {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="grid grid-cols-7 gap-1">
          {['1', '3', '5', '7', '9', '11', '14'].map((pH, index) => (
            <div key={pH} className="space-y-2 text-center">
              <div className="h-20 rounded-xl border border-white/10" style={{ background: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#38bdf8', '#6366f1', '#8b5cf6'][index] }} />
              <span className="text-[10px] font-black text-gray-400">pH {pH}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (unit === 'separation') {
    return (
      <svg viewBox="0 0 360 180" className="h-56 w-full rounded-2xl border border-white/10 bg-black/20">
        <path d="M58 24h78l-28 58v46l-22 18-22-18V82z" fill="#38bdf833" stroke="#67e8f9" strokeWidth="3" />
        <path d="M64 84h44" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
        <path d="M86 146c30 18 70 18 100 0" stroke="#38bdf8" strokeWidth="4" fill="none" />
        <rect x="178" y="90" width="118" height="56" rx="18" fill="#22c55e22" stroke="#86efac" strokeWidth="3" />
        <path d="M218 52c32 0 62 14 62 34" stroke="#a78bfa" strokeWidth="5" fill="none" />
        <circle cx="96" cy="102" r="5" fill="#fbbf24" />
        <circle cx="202" cy="118" r="5" fill="#38bdf8" />
        <circle cx="250" cy="118" r="5" fill="#38bdf8" />
        <text x="42" y="170" fill="#cbd5e1" fontSize="13">Filter</text>
        <text x="190" y="170" fill="#cbd5e1" fontSize="13">Collect filtrate</text>
        <text x="242" y="48" fill="#cbd5e1" fontSize="13">Evaporate</text>
      </svg>
    );
  }

  if (unit === 'organicBasics') {
    return (
      <svg viewBox="0 0 360 180" className="h-56 w-full rounded-2xl border border-white/10 bg-black/20">
        {[[74, 90], [138, 90], [202, 90], [266, 90]].map(([x, y], index) => (
          <g key={index}>
            <circle cx={x} cy={y} r="22" fill="#38bdf8" />
            <text x={x} y={y + 5} textAnchor="middle" fontSize="16" fill="#020617" fontWeight="900">C</text>
            {index < 3 && <line x1={x + 23} y1={y} x2={x + 41} y2={y} stroke="#e2e8f0" strokeWidth="5" />}
            <circle cx={x} cy={y - 42} r="10" fill="#f8fafc" />
            <circle cx={x} cy={y + 42} r="10" fill="#f8fafc" />
          </g>
        ))}
        <text x="52" y="160" fill="#cbd5e1" fontSize="13">Carbon chain, covalent bonds, functional group recognition</text>
      </svg>
    );
  }

  if (unit === 'periodic') {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="grid grid-cols-8 gap-1">
          {Array.from({ length: 32 }, (_, index) => (
            <div
              key={index}
              className="h-10 rounded-lg border border-white/10"
              style={{ background: `hsl(${190 + index * 3} 75% ${32 + (index % 4) * 7}%)` }}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-gray-400">
          <span>Atomic size</span><span>Ionization energy</span><span>Electronegativity</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-56 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      {Array.from({ length: 30 }, (_, index) => (
        <span
          key={index}
          className="absolute grid h-7 w-7 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/20 text-[10px] font-black text-cyan-50"
          style={{ left: `${8 + (index % 10) * 9}%`, top: `${12 + Math.floor(index / 10) * 27}%` }}
        >
          {index % 3 === 0 ? 'O' : index % 3 === 1 ? 'H' : 'C'}
        </span>
      ))}
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-bold text-gray-200">Particle model preview</div>
    </div>
  );
};

export const SchoolChemistryMasteryPage = ({ onNavigate }) => {
  const [activeGrade, setActiveGrade] = useState(10);
  const [activeChapterId, setActiveChapterId] = useState('g10-reactions');
  const chapters = useMemo(() => getSchoolMasteryByGrade(activeGrade), [activeGrade]);
  const activeChapter = chapters.find(chapter => chapter.id === activeChapterId) || chapters[0] || schoolMasteryChapters[0];
  const activeGradeMeta = schoolMasteryGrades.find(item => item.grade === activeGrade) || schoolMasteryGrades[4];

  const selectGrade = (grade) => {
    const nextChapters = getSchoolMasteryByGrade(grade);
    setActiveGrade(grade);
    setActiveChapterId(nextChapters[0]?.id || activeChapterId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/50 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">School Chemistry Mastery</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              Grade 6-10 chemistry chapters with experiments, practice prompts, viva, revision, and direct 2D/3D visual routes.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-white">{schoolMasteryStats.chapters}</p>
              <p className="text-[10px] text-gray-500">chapters</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-cyan-100">{schoolMasteryStats.experiments}</p>
              <p className="text-[10px] text-gray-500">experiments</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-emerald-100">{schoolMasteryStats.practicePrompts}</p>
              <p className="text-[10px] text-gray-500">practice</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-amber-100">{schoolMasteryStats.vivaQuestions}</p>
              <p className="text-[10px] text-gray-500">viva</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Route size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Grade Path</h3>
          </div>
          <div className="space-y-2">
            {schoolMasteryGrades.map(grade => (
              <button
                key={grade.grade}
                type="button"
                onClick={() => selectGrade(grade.grade)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  activeGrade === grade.grade ? 'border-cyan-300/40 bg-cyan-300/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.065]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: grade.color }} />
                  <span className="text-sm font-black text-white">{grade.label}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{grade.focus}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{activeGradeMeta.label}</p>
                <h3 className="mt-1 text-lg font-black text-white">{activeGradeMeta.focus}</h3>
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
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${difficultyStyle[activeChapter.difficulty] || difficultyStyle.Exam}`}>
                      {activeChapter.difficulty}
                    </span>
                    {activeChapter.boardTags.map(tag => (
                      <span key={tag} className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300">{tag}</span>
                    ))}
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{activeChapter.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{activeChapter.masteryGoal}</p>
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
                    <p className="text-xs font-black text-white">Concepts</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeChapter.concepts.map(concept => (
                      <span key={concept} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-gray-300">{concept}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <ListChecks size={14} className="text-emerald-200" />
                    <p className="text-xs font-black text-white">Revision Sheet</p>
                  </div>
                  <div className="space-y-1.5">
                    {activeChapter.revision.map(item => (
                      <p key={item} className="flex gap-2 text-xs text-gray-400"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Microscope size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Interactive Preview</h3>
              </div>
              <VisualPreview unit={activeChapter.unit} />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FlaskConical size={16} className="text-cyan-300" />
                  <h3 className="text-sm font-bold text-white">Experiments</h3>
                </div>
                <span className="text-xs text-gray-500">{activeChapter.experiments.length} activities</span>
              </div>
              <div className="grid gap-2">
                {activeChapter.experiments.map(experiment => (
                  <div key={experiment.title} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-sm font-black text-white">{experiment.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{experiment.setup}</p>
                    <p className="mt-2 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold text-emerald-100">{experiment.result}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ClipboardList size={16} className="text-cyan-300" />
                  <h3 className="text-sm font-bold text-white">Practice</h3>
                </div>
                <div className="space-y-2">
                  {activeChapter.practice.map((question, index) => (
                    <div key={question} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-gray-300">
                      <span className="mr-2 font-black text-cyan-200">Q{index + 1}</span>{question}
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="mb-3 flex items-center gap-2">
                  <BadgeCheck size={16} className="text-amber-300" />
                  <h3 className="text-sm font-bold text-white">Viva</h3>
                </div>
                <div className="space-y-2">
                  {activeChapter.viva.map(question => (
                    <p key={question} className="rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-50">{question}</p>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </section>
    </div>
  );
};

export default SchoolChemistryMasteryPage;
