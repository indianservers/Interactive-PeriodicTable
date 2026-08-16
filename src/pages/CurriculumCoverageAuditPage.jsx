import { useMemo, useState } from 'react';
import {
  AlertTriangle, BadgeCheck, BarChart3, BookOpen, Box, CheckCircle2,
  ClipboardList, Filter, GraduationCap, Layers3, Route, Sparkles, Target,
} from 'lucide-react';
import {
  boardCoverageStats,
  boardFilters,
  boardReadinessMatrix,
  contentEnhancementPlan,
  curriculumStrands,
  gradeBandFilters,
  launchContentQualityGates,
  multilingualGlossary,
  misconceptionDiagnostics,
  priorityGapBacklog,
} from '../data/curriculumCoverageAudit.js';

const readinessClass = {
  Ready: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  Basic: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  'In progress': 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  Planned: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
  'Not needed': 'border-slate-300/20 bg-slate-300/10 text-slate-200',
};

const gradeLabel = {
  all: 'All grades',
  middle: 'Grades 6-8',
  'grade9-10': 'Grades 9-10',
  'grade11-12': 'Grades 11-12',
  'ug-bridge': 'UG bridge',
  research: 'Research / PhD',
};

const Gauge = ({ value }) => {
  const circumference = 2 * Math.PI * 38;
  const offset = circumference - (value / 100) * circumference;
  return (
    <svg viewBox="0 0 100 100" className="h-28 w-28">
      <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#38bdf8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        strokeWidth="10"
        transform="rotate(-90 50 50)"
      />
      <text x="50" y="54" textAnchor="middle" fill="#f8fafc" fontSize="20" fontWeight="900">{value}%</text>
    </svg>
  );
};

const CoveragePreview = ({ strands }) => (
  <svg viewBox="0 0 520 190" className="h-56 w-full rounded-2xl border border-white/10 bg-black/20">
    <line x1="36" y1="150" x2="486" y2="150" stroke="#475569" strokeWidth="2" />
    <line x1="36" y1="32" x2="36" y2="150" stroke="#475569" strokeWidth="2" />
    {strands.slice(0, 9).map((strand, index) => {
      const height = Math.max(24, strand.coverage * 1.08);
      const x = 54 + index * 48;
      const y = 150 - height;
      const fill = strand.coverage >= 90 ? '#22c55e' : strand.coverage >= 84 ? '#38bdf8' : '#f59e0b';
      return (
        <g key={strand.id}>
          <rect x={x} y={y} width="24" height={height} rx="6" fill={`${fill}88`} stroke={fill} />
          <text x={x + 12} y={y - 7} textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="800">{strand.coverage}</text>
          <text x={x + 12} y="171" textAnchor="middle" fill="#94a3b8" fontSize="9">{index + 1}</text>
        </g>
      );
    })}
    <text x="38" y="24" fill="#cbd5e1" fontSize="12">Filtered curriculum coverage by strand</text>
  </svg>
);

export const CurriculumCoverageAuditPage = ({ onNavigate }) => {
  const [activeBoard, setActiveBoard] = useState('all');
  const [activeGradeBand, setActiveGradeBand] = useState('all');
  const [activeStrandId, setActiveStrandId] = useState('organic-core');

  const filteredStrands = useMemo(() => curriculumStrands.filter(strand => {
    const boardMatch = activeBoard === 'all' || strand.boards.includes(activeBoard);
    const gradeMatch = activeGradeBand === 'all' || strand.gradeBand === activeGradeBand || strand.gradeBand === 'all';
    return boardMatch && gradeMatch;
  }), [activeBoard, activeGradeBand]);

  const activeStrand = filteredStrands.find(strand => strand.id === activeStrandId) || filteredStrands[0] || curriculumStrands[0];
  const averageCoverage = Math.round(filteredStrands.reduce((total, strand) => total + strand.coverage, 0) / Math.max(filteredStrands.length, 1));
  const activeBoardLabel = boardFilters.find(board => board.id === activeBoard)?.label || 'All Boards';

  const selectBoard = (boardId) => {
    setActiveBoard(boardId);
    const first = curriculumStrands.find(strand => boardId === 'all' || strand.boards.includes(boardId));
    setActiveStrandId(first?.id || activeStrandId);
  };

  const selectGradeBand = (gradeBandId) => {
    setActiveGradeBand(gradeBandId);
    const first = curriculumStrands.find(strand => (
      (activeBoard === 'all' || strand.boards.includes(activeBoard)) &&
      (gradeBandId === 'all' || strand.gradeBand === gradeBandId || strand.gradeBand === 'all')
    ));
    setActiveStrandId(first?.id || activeStrandId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-indigo-950/40 to-cyan-950/35 p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <ClipboardList size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Curriculum Map</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              AP State, CBSE, IGCSE and IB Chemistry from grades 6-12, mapped to interactive 2D, 3D, lab, practice and teacher-ready learning paths.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 text-center">
            {[
              ['boards', boardCoverageStats.boards],
              ['bands', boardCoverageStats.gradeBands],
              ['strands', boardCoverageStats.strands],
              ['units', boardCoverageStats.mappedUnits],
              ['gaps', boardCoverageStats.priorityGaps],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
                <p className="text-lg font-black text-white">{value}</p>
                <p className="text-[10px] text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[310px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Filter size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Board and Grade Filters</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {boardFilters.map(board => (
              <button
                key={board.id}
                type="button"
                onClick={() => selectBoard(board.id)}
                className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                  activeBoard === board.id ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                }`}
              >
                {board.short}
              </button>
            ))}
          </div>
          <div className="mt-4 space-y-2">
            {gradeBandFilters.map(band => (
              <button
                key={band.id}
                type="button"
                onClick={() => selectGradeBand(band.id)}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-black transition-colors ${
                  activeGradeBand === band.id ? 'border-emerald-300/35 bg-emerald-300/12 text-emerald-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                }`}
              >
                <GraduationCap size={14} /> {band.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-center">
            <Gauge value={averageCoverage} />
            <p className="text-xs font-black uppercase tracking-widest text-cyan-200">{activeBoardLabel}</p>
            <p className="mt-1 text-xs text-gray-500">{gradeLabel[activeGradeBand]} average coverage</p>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{filteredStrands.length} matching strands</p>
                  <h3 className="mt-1 text-lg font-black text-white">Coverage Map</h3>
                </div>
                <button type="button" onClick={() => onNavigate?.('learning-command')} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15">
                  <Route size={14} /> Plan Learning Path
                </button>
              </div>
              <div className="mt-4">
                <CoveragePreview strands={filteredStrands} />
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Board Readiness</h3>
              </div>
              <div className="space-y-2">
                {boardReadinessMatrix.map(board => (
                  <div key={board.board} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{board.board}</p>
                      <span className="text-sm font-black text-cyan-100">{board.coverage}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300" style={{ width: `${board.coverage}%` }} />
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Needs: {board.needs.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.8fr_1fr]">
            <div className="glass max-h-[520px] overflow-y-auto rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Strands</h3>
              </div>
              <div className="space-y-2">
                {filteredStrands.map(strand => (
                  <button
                    key={strand.id}
                    type="button"
                    onClick={() => setActiveStrandId(strand.id)}
                    className={`w-full rounded-xl border p-3 text-left transition-colors ${
                      activeStrand.id === strand.id ? 'border-cyan-300/40 bg-cyan-300/12' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.065]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-white">{strand.title}</p>
                      <span className="shrink-0 text-xs font-black text-cyan-100">{strand.coverage}%</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{gradeLabel[strand.gradeBand] || 'Cross-grade'} | {strand.boards.length} board maps</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">{activeStrand.coverage}% covered</span>
                    <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300">{gradeLabel[activeStrand.gradeBand] || 'Cross-grade'}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{activeStrand.title}</h3>
                </div>
                <button type="button" onClick={() => onNavigate?.(activeStrand.route)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15">
                  <Route size={14} /> Open Module
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles size={14} className="text-cyan-200" />
                    <p className="text-xs font-black text-white">Interactive Coverage</p>
                  </div>
                  <div className="space-y-1.5">
                    {activeStrand.interactive.map(item => (
                      <p key={item} className="flex gap-2 text-xs text-gray-300"><CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-200" />
                    <p className="text-xs font-black text-white">Missing Pieces</p>
                  </div>
                  <div className="space-y-1.5">
                    {activeStrand.missing.map(item => (
                      <p key={item} className="rounded-lg border border-amber-300/10 bg-amber-300/5 px-2 py-1 text-[11px] font-bold text-amber-100">{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <div className={`rounded-xl border px-3 py-2 text-xs font-black ${readinessClass[activeStrand.twoD] || readinessClass.Planned}`}>
                  <Box size={14} className="mb-1" /> 2D: {activeStrand.twoD}
                </div>
                <div className={`rounded-xl border px-3 py-2 text-xs font-black ${readinessClass[activeStrand.threeD] || readinessClass.Planned}`}>
                  <Layers3 size={14} className="mb-1" /> 3D: {activeStrand.threeD}
                </div>
                <div className="rounded-xl border border-violet-300/20 bg-violet-300/10 px-3 py-2 text-xs font-black text-violet-100">
                  <Target size={14} className="mb-1" /> Next: queued
                </div>
              </div>
              <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm text-gray-300">{activeStrand.nextBuild}</p>
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <BadgeCheck size={16} className="text-amber-300" />
              <h3 className="text-sm font-bold text-white">Priority Gap Backlog</h3>
            </div>
            <div className="grid gap-3 lg:grid-cols-5">
              {priorityGapBacklog.map(gap => (
                <button key={gap.id} type="button" onClick={() => onNavigate?.(gap.route)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]">
                  <p className="text-sm font-black text-white">{gap.title}</p>
                  <p className="mt-1 text-[11px] font-bold text-cyan-200">{gap.board} | {gap.impact}</p>
                  <p className="mt-2 text-xs text-gray-500">{gap.tasks.slice(0, 2).join(', ')}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Suggested Content Enhancements</h3>
              </div>
              <div className="grid gap-2">
                {contentEnhancementPlan.map(item => (
                  <button key={item.id} type="button" onClick={() => onNavigate?.(item.route)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{item.title}</p>
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2 py-0.5 text-[10px] font-black text-amber-100">{item.priority}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.why}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {item.additions.map(addition => <span key={addition} className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] font-bold text-gray-300">{addition}</span>)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Target size={16} className="text-emerald-300" />
                <h3 className="text-sm font-bold text-white">Launch Quality Gates</h3>
              </div>
              <div className="space-y-2">
                {launchContentQualityGates.map(gate => (
                  <div key={gate.gate} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{gate.gate}</p>
                      <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">{gate.ready}</span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Must add: {gate.mustHave.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-300" />
                <h3 className="text-sm font-bold text-white">Misconception Diagnostics</h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {misconceptionDiagnostics.map(item => (
                  <button key={item.id} type="button" onClick={() => onNavigate?.(item.route)} className="rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]">
                    <p className="text-sm font-black text-white">{item.concept}</p>
                    <p className="mt-1 text-xs font-semibold text-amber-100">{item.misconception}</p>
                    <p className="mt-2 text-xs text-gray-500">{item.correction}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Telugu / Hindi / English Starter Glossary</h3>
              </div>
              <div className="space-y-2">
                {multilingualGlossary.map(term => (
                  <div key={term.en} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-black text-white">{term.en}</p>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-2 py-0.5 text-[11px] font-black text-cyan-100">{term.te}</span>
                        <span className="rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-0.5 text-[11px] font-black text-emerald-100">{term.hi}</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{term.simple}</p>
                    <p className="mt-1 text-[11px] font-semibold text-emerald-100">{term.example}</p>
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

export default CurriculumCoverageAuditPage;
