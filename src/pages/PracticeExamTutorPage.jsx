import { useMemo, useState } from 'react';
import {
  BadgeCheck, BarChart3, Box, CheckCircle2, Clock, ClipboardList,
  GraduationCap, Layers3, ListChecks, MessageSquareText, Sparkles, Target, Trophy,
} from 'lucide-react';
import {
  flashcardDecks,
  getPracticeSets,
  mistakePatterns,
  practiceModes,
  practiceQuestionSets,
  practiceStats,
  practiceTracks,
  tutorPrompts,
} from '../data/practiceExamTutor.js';

const modeStyles = {
  adaptive: 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100',
  mock: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  mistakes: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
  flashcards: 'border-violet-300/25 bg-violet-300/10 text-violet-100',
  tutor: 'border-pink-300/25 bg-pink-300/10 text-pink-100',
};

const ScorePreview = ({ set }) => (
  <svg viewBox="0 0 380 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
    <line x1="34" y1="164" x2="336" y2="164" stroke="#64748b" />
    <line x1="34" y1="34" x2="34" y2="164" stroke="#64748b" />
    {set.questions.map((question, index) => (
      <g key={question.prompt}>
        <rect x={64 + index * 70} y={68 + index * 14} width="34" height={96 - index * 12} rx="8" fill={['#38bdf8', '#22c55e', '#facc15', '#fb7185'][index % 4]} opacity="0.75" />
        <text x={81 + index * 70} y="184" textAnchor="middle" fill="#cbd5e1" fontSize="11">{question.skill.split(' ')[0]}</text>
      </g>
    ))}
    <path d="M54 54 C108 32 162 48 212 74 S296 108 330 72" fill="none" stroke="#f8fafc" strokeWidth="3" />
    <text x="72" y="202" fill="#94a3b8" fontSize="12">Adaptive score and weak-area preview</text>
  </svg>
);

export const PracticeExamTutorPage = ({ onNavigate }) => {
  const [activeTrack, setActiveTrack] = useState('senior');
  const [activeMode, setActiveMode] = useState('adaptive');
  const [activeSetId, setActiveSetId] = useState('senior-organic');
  const sets = useMemo(() => getPracticeSets(activeTrack), [activeTrack]);
  const activeSet = sets.find(set => set.id === activeSetId) || sets[0] || practiceQuestionSets[0];
  const activeDeck = activeTrack === 'school'
    ? flashcardDecks.find(deck => deck.id === 'school-safety')
    : activeTrack === 'research' && activeSet.domain.includes('Cheminformatics')
      ? flashcardDecks.find(deck => deck.id === 'cheminformatics')
      : activeTrack === 'research'
        ? flashcardDecks.find(deck => deck.id === 'research-methods')
    : activeTrack === 'college' && activeSet.domain.includes('Inorganic')
      ? flashcardDecks.find(deck => deck.id === 'coordination-cft')
      : activeTrack === 'college' && activeSet.domain.includes('Organic')
        ? flashcardDecks.find(deck => deck.id === 'organic-tests')
        : activeTrack === 'college'
          ? flashcardDecks.find(deck => deck.id === 'analytical-qc')
          : activeTrack === 'senior' && activeSet.title.includes('Spectroscopy')
            ? flashcardDecks.find(deck => deck.id === 'spectroscopy')
            : activeTrack === 'entrance'
              ? flashcardDecks.find(deck => deck.id === 'inorganic')
              : flashcardDecks.find(deck => deck.id === 'formulae');

  const selectTrack = (trackId) => {
    const next = getPracticeSets(trackId);
    setActiveTrack(trackId);
    setActiveSetId(next[0]?.id || activeSetId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-violet-950/45 to-cyan-950/35 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Practice, Exams and Tutor</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              Adaptive drills, timed mocks, mistake notebooks, formula flashcards and tutor-style remediation connected to visual chemistry modules.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-white">{practiceStats.sets}</p>
              <p className="text-[10px] text-gray-500">sets</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-cyan-100">{practiceStats.questions}</p>
              <p className="text-[10px] text-gray-500">questions</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-amber-100">{practiceStats.mistakes}</p>
              <p className="text-[10px] text-gray-500">mistakes</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-emerald-100">{practiceStats.flashcards}</p>
              <p className="text-[10px] text-gray-500">cards</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[285px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Target size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Practice Track</h3>
          </div>
          <div className="space-y-2">
            {practiceTracks.map(track => (
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
              <Sparkles size={16} className="text-emerald-300" />
              <h3 className="text-sm font-bold text-white">Mode</h3>
            </div>
            <div className="space-y-2">
              {practiceModes.map(mode => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setActiveMode(mode.id)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition-colors ${
                    activeMode === mode.id ? modeStyles[mode.id] : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span className="block text-sm font-black">{mode.label}</span>
                  <span className="mt-0.5 block text-[11px] opacity-75">{mode.detail}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{activeSet.domain}</p>
                <h3 className="mt-1 text-lg font-black text-white">{activeSet.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sets.map(set => (
                  <button
                    key={set.id}
                    type="button"
                    onClick={() => setActiveSetId(set.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                      activeSet.id === set.id ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {set.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${modeStyles[activeSet.mode] || modeStyles.adaptive}`}>{activeSet.mode}</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300"><Clock size={11} />{activeSet.time} min</span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300"><Trophy size={11} />{activeSet.marks} marks</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">Exam Set</h3>
                  <p className="mt-2 text-sm text-gray-400">Each prompt links to a concept, a remediation path, and a 2D/3D visual route.</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onNavigate?.(activeSet.route2d)} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15">
                    <Box size={14} /> 2D
                  </button>
                  <button type="button" onClick={() => onNavigate?.(activeSet.route3d)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15">
                    <Layers3 size={14} /> 3D
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {activeSet.questions.map((question, index) => (
                  <div key={question.prompt} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[10px] font-black text-cyan-100">Q{index + 1}</span>
                      <span className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] font-bold text-gray-300">{question.type}</span>
                      <span className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] font-bold text-emerald-100">{question.skill}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-white">{question.prompt}</p>
                    <p className="mt-2 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-2 py-1 text-[11px] font-semibold text-emerald-100">{question.answer}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Adaptive Score Preview</h3>
              </div>
              <ScorePreview set={activeSet} />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-3">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-amber-300" />
                <h3 className="text-sm font-bold text-white">Mistake Notebook</h3>
              </div>
              <div className="space-y-2">
                {mistakePatterns.slice(0, 6).map(mistake => (
                  <button key={mistake.id} type="button" onClick={() => onNavigate?.(mistake.route)} className="w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-left hover:bg-white/[0.065]">
                    <p className="text-sm font-black text-white">{mistake.title}</p>
                    <p className="mt-1 text-xs text-gray-500">{mistake.symptom}</p>
                    <p className="mt-2 text-[11px] font-semibold text-amber-100">{mistake.fix}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">{activeDeck.title}</h3>
              </div>
              <div className="space-y-2">
                {activeDeck.cards.map(card => (
                  <p key={card} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-gray-300">
                    <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />{card}
                  </p>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <MessageSquareText size={16} className="text-pink-300" />
                <h3 className="text-sm font-bold text-white">Tutor Coach</h3>
              </div>
              <div className="space-y-2">
                {tutorPrompts.map(prompt => (
                  <div key={prompt.id} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                    <p className="text-sm font-black text-white">{prompt.title}</p>
                    <p className="mt-1 text-xs text-gray-400">{prompt.prompt}</p>
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

export default PracticeExamTutorPage;
