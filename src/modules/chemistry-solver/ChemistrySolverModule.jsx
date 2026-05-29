import { useMemo, useState } from 'react';
import {
  Atom, Beaker, Bookmark, BookmarkCheck, ChevronDown, ChevronLeft, ChevronRight,
  ChevronUp, Clock, Download, Filter, FlaskConical, Lightbulb, Printer,
  Search, Shuffle, Sparkles, Target, Timer, Wand2,
} from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { chemistrySolverQuestions, getCategoryById, getQuestionById, solverCategories } from './data/questionBank.js';
import {
  buildPrintableSolution,
  difficultyOptions,
  examLevelOptions,
  filterQuestions,
  getQuestionCountsByCategory,
  getQuestionCountsBySubCategory,
  getSubCategories,
} from './utils/solverFilters.js';

const pillTone = {
  Easy: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100',
  Medium: 'border-amber-400/25 bg-amber-400/10 text-amber-100',
  Hard: 'border-rose-400/25 bg-rose-400/10 text-rose-100',
};

const CATEGORY_GROUPS = [
  {
    label: 'Physical Chemistry',
    icon: Atom,
    accent: 'cyan',
    border: 'border-cyan-400/25',
    bg: 'bg-cyan-400/10',
    text: 'text-cyan-300',
    bar: 'bg-cyan-400',
    ids: [
      'atomic-structure', 'periodic-table-periodicity', 'chemical-bonding',
      'states-of-matter', 'thermodynamics-thermochemistry', 'chemical-equilibrium',
      'ionic-equilibrium', 'redox-electrochemistry', 'chemical-kinetics', 'solutions',
    ],
  },
  {
    label: 'Organic Chemistry',
    icon: FlaskConical,
    accent: 'violet',
    border: 'border-violet-400/25',
    bg: 'bg-violet-400/10',
    text: 'text-violet-300',
    bar: 'bg-violet-400',
    ids: ['organic-chemistry-basics', 'hydrocarbons-functional-groups'],
  },
  {
    label: 'Inorganic Chemistry',
    icon: Beaker,
    accent: 'emerald',
    border: 'border-emerald-400/25',
    bg: 'bg-emerald-400/10',
    text: 'text-emerald-300',
    bar: 'bg-emerald-400',
    ids: ['inorganic-chemistry'],
  },
  {
    label: 'Analytical Chemistry',
    icon: Target,
    accent: 'amber',
    border: 'border-amber-400/25',
    bg: 'bg-amber-400/10',
    text: 'text-amber-300',
    bar: 'bg-amber-400',
    ids: ['analytical-practical-chemistry'],
  },
];

function exportSolution(question) {
  const win = window.open('', '_blank', 'noopener,noreferrer,width=900,height=760');
  if (!win) return;
  win.document.write(buildPrintableSolution(question));
  win.document.close();
  win.focus();
  win.print();
}

function downloadSolution(question) {
  const lines = [
    question.title, '',
    `Question: ${question.question}`,
    `Difficulty: ${question.difficulty}`,
    `Exam level: ${question.examLevel}`,
    `Estimated time: ${question.estimatedTime}`, '',
    'Concept', question.concept, '',
    'Given Data', ...question.givenData.map(i => `- ${i}`), '',
    'Formulae', ...question.formulae.map(i => `- ${i}`), '',
    'Steps', ...question.steps.map((s, n) => `${n + 1}. ${s}`), '',
    `Final Answer: ${question.finalAnswer}`, '',
    'Explanation', question.explanation, '',
    'Common Mistakes', ...question.commonMistakes.map(i => `- ${i}`), '',
    'Practice Extensions', ...question.practiceExtensions.map(i => `- ${i}`),
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${question.id}-solution.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function SectionList({ title, items, ordered = false }) {
  const ListTag = ordered ? 'ol' : 'ul';
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <h3 className="text-sm font-black text-white">{title}</h3>
      <ListTag className={`mt-2 space-y-1 pl-5 text-xs leading-5 text-gray-300 ${ordered ? 'list-decimal' : 'list-disc'}`}>
        {items.map(item => <li key={item}>{item}</li>)}
      </ListTag>
    </section>
  );
}

function SolutionView({ question, bookmarked, onToggleBookmark }) {
  return (
    <article className="space-y-3">
      <section className="glass rounded-xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${pillTone[question.difficulty] || pillTone.Medium}`}>{question.difficulty}</span>
              <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-100">{question.examLevel}</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-gray-300"><Timer size={11} />{question.estimatedTime}</span>
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{question.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-300">{question.question}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={onToggleBookmark} className="btn-secondary inline-flex items-center gap-2 text-xs">
              {bookmarked ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
              {bookmarked ? 'Saved' : 'Save'}
            </button>
            <button onClick={() => downloadSolution(question)} className="btn-secondary inline-flex items-center gap-2 text-xs"><Download size={14} />TXT</button>
            <button onClick={() => exportSolution(question)} className="btn-primary inline-flex items-center gap-2 text-xs"><Printer size={14} />Print</button>
          </div>
        </div>
      </section>

      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <section className="rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4">
            <div className="flex items-center gap-2">
              <Lightbulb size={18} className="text-indigo-200" />
              <h3 className="text-sm font-black text-white">Concept Explanation</h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-indigo-50">{question.concept}</p>
          </section>
          <SectionList title="Given Data" items={question.givenData} />
          <SectionList title="Formula Used" items={question.formulae} />
          <SectionList title="Step-by-step Solution" items={question.steps} ordered />
          <section className="rounded-xl border border-emerald-400/25 bg-emerald-400/10 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">Final Answer</p>
            <p className="mt-2 text-lg font-black text-white">{question.finalAnswer}</p>
            <p className="mt-2 text-sm leading-6 text-emerald-50">{question.explanation}</p>
          </section>
        </div>
        <aside className="space-y-3">
          <SectionList title="Common Mistakes" items={question.commonMistakes} />
          <SectionList title="Related Concepts" items={question.relatedConcepts} />
          <SectionList title="Practice Questions" items={question.practiceExtensions} />
          <section className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
            <h3 className="text-sm font-black text-white">Tags</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {question.tags.map(tag => <span key={tag} className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold text-cyan-100">{tag}</span>)}
            </div>
          </section>
        </aside>
      </div>
    </article>
  );
}

function CategoryGroup({ group, categoryId, countsByCategory, recent, onSelectCategory, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const Icon = group.icon;

  const groupCategories = CATEGORY_GROUPS
    .find(g => g.label === group.label)?.ids
    .map(id => solverCategories.find(c => c.id === id))
    .filter(Boolean) || [];

  const groupTotal = groupCategories.reduce((s, c) => s + (countsByCategory[c.id] || 0), 0);
  const groupViewed = groupCategories.reduce((s, c) => {
    return s + recent.filter(id => getQuestionById(id)?.category === c.id).length;
  }, 0);

  return (
    <div className={`overflow-hidden rounded-xl border ${open ? group.border : 'border-white/10'} transition-colors`}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors ${open ? group.bg : 'hover:bg-white/[0.04]'}`}
      >
        <Icon size={15} className={group.text} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-xs font-black ${open ? group.text : 'text-gray-300'}`}>{group.label}</span>
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${open ? `${group.border} text-gray-200` : 'border-white/10 text-gray-600'}`}>{groupTotal}</span>
              {open ? <ChevronUp size={13} className={group.text} /> : <ChevronDown size={13} className="text-gray-500" />}
            </div>
          </div>
          {groupTotal > 0 && groupViewed > 0 && (
            <div className="mt-1 h-0.5 w-full overflow-hidden rounded-full bg-white/5">
              <div className={`h-full rounded-full ${group.bar} opacity-50 transition-all`} style={{ width: `${Math.min(100, (groupViewed / groupTotal) * 100)}%` }} />
            </div>
          )}
        </div>
      </button>

      {open && (
        <div className="space-y-1 border-t border-white/5 bg-white/[0.015] p-2">
          {groupCategories.map(cat => {
            const count = countsByCategory[cat.id] || 0;
            const viewed = recent.filter(id => getQuestionById(id)?.category === cat.id).length;
            const isActive = cat.id === categoryId;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full rounded-lg border p-2.5 text-left transition-colors ${isActive ? `${group.border} ${group.bg}` : 'border-transparent hover:border-white/10 hover:bg-white/[0.05]'}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[12px] font-bold ${isActive ? 'text-white' : 'text-gray-300'}`}>{cat.name}</span>
                  <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${count > 0 ? 'border-white/10 text-gray-400' : 'border-white/5 text-gray-700'}`}>{count}</span>
                </div>
                {count > 0 && (
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${isActive ? group.bar : 'bg-white/20'}`}
                      style={{ width: viewed > 0 ? `${Math.min(100, (viewed / count) * 100)}%` : '0%' }}
                    />
                  </div>
                )}
                {count === 0 && (
                  <p className="mt-0.5 text-[10px] text-gray-600">No questions yet</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ChemistrySolverModule() {
  const firstQuestion = chemistrySolverQuestions[0];
  const countsByCategory = useMemo(() => getQuestionCountsByCategory(), []);
  const [categoryId, setCategoryId] = useState(firstQuestion.category);
  const [subCategory, setSubCategory] = useState('');
  const [query, setQuery] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [examLevel, setExamLevel] = useState('All');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [bookmarks, setBookmarks] = useLocalStorage('chemistry-solver-bookmarks', []);
  const [recent, setRecent] = useLocalStorage('chemistry-solver-recent', []);
  const [selectedQuestionId, setSelectedQuestionId] = useState(firstQuestion.id);

  const isGlobalSearch = query.trim().length > 0;
  const category = getCategoryById(categoryId);
  const subCategories = getSubCategories(categoryId);
  const countsBySubCategory = useMemo(() => getQuestionCountsBySubCategory(categoryId), [categoryId]);
  const selectedQuestion = getQuestionById(selectedQuestionId);

  const filteredQuestions = useMemo(() => filterQuestions({
    categoryId,
    subCategory,
    query,
    difficulty,
    bookmarkedIds: bookmarks,
    showBookmarkedOnly: showBookmarked,
    examLevel,
  }), [categoryId, subCategory, query, difficulty, bookmarks, showBookmarked, examLevel]);

  const selectedIndex = filteredQuestions.findIndex(q => q.id === selectedQuestionId);
  const prevQuestion = selectedIndex > 0 ? filteredQuestions[selectedIndex - 1] : null;
  const nextQuestion = selectedIndex < filteredQuestions.length - 1 ? filteredQuestions[selectedIndex + 1] : null;

  const totalViewed = new Set(recent).size;
  const totalQuestions = chemistrySolverQuestions.length;
  const overallProgress = totalQuestions > 0 ? Math.min(100, (totalViewed / totalQuestions) * 100) : 0;

  const selectQuestion = (questionId) => {
    setSelectedQuestionId(questionId);
    setRecent(items => [questionId, ...items.filter(id => id !== questionId)].slice(0, 20));
  };

  const selectCategory = (nextCategoryId) => {
    setCategoryId(nextCategoryId);
    setSubCategory('');
    setQuery('');
    const first = chemistrySolverQuestions.find(q => q.category === nextCategoryId);
    if (first) selectQuestion(first.id);
  };

  const toggleBookmark = (questionId) => {
    setBookmarks(items => items.includes(questionId) ? items.filter(id => id !== questionId) : [questionId, ...items]);
  };

  const pickRandom = () => {
    if (filteredQuestions.length === 0) return;
    const pool = filteredQuestions.filter(q => q.id !== selectedQuestionId);
    const pick = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : filteredQuestions[0];
    selectQuestion(pick.id);
  };

  return (
    <div className="page-transition min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-3">

        {/* Header */}
        <header className="glass rounded-xl p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Wand2 size={22} className="text-cyan-300" />
                <h1 className="text-2xl font-black tracking-tight text-white">Chemistry Solver</h1>
              </div>
              <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-400">
                Step-by-step chemistry solutions with formulas, common mistakes, bookmarks, and printable exports.
              </p>
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">Overall progress — {totalViewed} of {totalQuestions} questions viewed</span>
                  <span className="text-[11px] font-bold text-cyan-400">{Math.round(overallProgress)}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Categories</p>
                <p className="text-xl font-black text-white">{solverCategories.length}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Sub-topics</p>
                <p className="text-xl font-black text-white">{solverCategories.reduce((s, c) => s + c.subCategories.length, 0)}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Questions</p>
                <p className="text-xl font-black text-white">{totalQuestions}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Bookmarked</p>
                <p className="text-xl font-black text-white">{bookmarks.length}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="grid gap-3 xl:grid-cols-[290px_360px_minmax(0,1fr)]">

          {/* Left panel — category groups */}
          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div className="glass max-h-[calc(100vh-7rem)] overflow-y-auto rounded-xl p-3">
              <div className="mb-3 flex items-center gap-2">
                <Target size={15} className="text-cyan-300" />
                <h2 className="text-sm font-black text-white">Topics</h2>
                <span className="ml-auto text-[10px] text-gray-600">{totalViewed}/{totalQuestions} viewed</span>
              </div>
              <div className="space-y-2">
                {CATEGORY_GROUPS.map((group, i) => (
                  <CategoryGroup
                    key={group.label}
                    group={group}
                    categoryId={categoryId}
                    countsByCategory={countsByCategory}
                    recent={recent}
                    onSelectCategory={selectCategory}
                    defaultOpen={i === 0}
                  />
                ))}
              </div>
            </div>
          </aside>

          {/* Middle panel — filters + question list */}
          <aside className="space-y-3">
            <section className="glass rounded-xl p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Filter size={14} className="text-cyan-300" />
                  <h2 className="text-sm font-black text-white">Filters</h2>
                </div>
                <button
                  onClick={() => setShowBookmarked(v => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-colors ${showBookmarked ? 'border-amber-400/40 bg-amber-400/15 text-amber-200' : 'border-white/10 text-gray-500 hover:text-gray-300'}`}
                >
                  <BookmarkCheck size={11} />
                  Bookmarked
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div className="relative">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="input pl-9 text-sm"
                    placeholder="Search questions, formulas, tags..."
                  />
                </div>
                {isGlobalSearch && (
                  <p className="flex items-center gap-1 text-[11px] text-cyan-400/80">
                    <Search size={10} />Searching all {totalQuestions} questions
                  </p>
                )}
                {!isGlobalSearch && (
                  <select value={subCategory} onChange={e => setSubCategory(e.target.value)} className="input text-xs">
                    <option value="">All sub-topics in {category.name}</option>
                    {subCategories.map(s => <option key={s} value={s}>{s} ({countsBySubCategory[s] || 0})</option>)}
                  </select>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input text-xs">
                    {difficultyOptions.map(d => <option key={d} value={d}>{d} difficulty</option>)}
                  </select>
                  <select value={examLevel} onChange={e => setExamLevel(e.target.value)} className="input text-xs">
                    {examLevelOptions.map(l => <option key={l} value={l}>{l === 'All' ? 'All levels' : l}</option>)}
                  </select>
                </div>
              </div>
            </section>

            <section className="glass rounded-xl p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="text-sm font-black text-white">Questions</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-500">{filteredQuestions.length} found</span>
                  <button
                    onClick={pickRandom}
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[10px] font-bold text-gray-400 hover:bg-white/10 hover:text-gray-200"
                  >
                    <Shuffle size={10} />
                    Random
                  </button>
                </div>
              </div>
              <div className="max-h-[440px] space-y-1.5 overflow-y-auto pr-1">
                {filteredQuestions.map(question => (
                  <button
                    key={question.id}
                    onClick={() => selectQuestion(question.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${question.id === selectedQuestionId ? 'border-indigo-400/45 bg-indigo-400/10' : 'border-white/10 bg-white/[0.025] hover:bg-white/[0.06]'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[13px] font-bold leading-tight text-white">{question.title}</p>
                      <div className="flex shrink-0 items-center gap-1">
                        {bookmarks.includes(question.id) && <BookmarkCheck size={12} className="text-amber-300" />}
                        <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold ${pillTone[question.difficulty]}`}>{question.difficulty[0]}</span>
                      </div>
                    </div>
                    {isGlobalSearch && (
                      <p className="mt-0.5 text-[10px] font-semibold text-cyan-400/80">{getCategoryById(question.category).name}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-gray-500">{question.subCategory}</p>
                  </button>
                ))}
                {filteredQuestions.length === 0 && (
                  <div className="rounded-lg border border-white/10 bg-white/[0.025] p-5 text-center">
                    <p className="text-sm font-bold text-gray-400">
                      {!isGlobalSearch && (countsByCategory[categoryId] || 0) === 0
                        ? `${category.name} has no questions yet.`
                        : 'No questions match these filters.'}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-600">Try clearing filters or searching all categories.</p>
                  </div>
                )}
              </div>
            </section>

            <section className="glass rounded-xl p-3">
              <div className="mb-2 flex items-center gap-2">
                <Clock size={13} className="text-cyan-300" />
                <h2 className="text-sm font-black text-white">Recently Viewed</h2>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.length > 0 ? recent.slice(0, 8).map(id => {
                  const item = getQuestionById(id);
                  return (
                    <button
                      key={id}
                      onClick={() => selectQuestion(id)}
                      className="max-w-[150px] truncate rounded-full border border-white/10 bg-white/[0.025] px-2 py-1 text-[10px] font-bold text-gray-300 hover:bg-white/10"
                    >
                      {item.title}
                    </button>
                  );
                }) : <p className="text-[11px] text-gray-600">Open a question to build history.</p>}
              </div>
            </section>
          </aside>

          {/* Right panel — solution view */}
          <section className="min-w-0 space-y-3">
            <SolutionView
              question={selectedQuestion}
              bookmarked={bookmarks.includes(selectedQuestion.id)}
              onToggleBookmark={() => toggleBookmark(selectedQuestion.id)}
            />

            {/* Prev / Next navigation */}
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => prevQuestion && selectQuestion(prevQuestion.id)}
                disabled={!prevQuestion}
                className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft size={14} className="shrink-0" />
                <span className="truncate">{prevQuestion?.title ?? 'Previous'}</span>
              </button>
              <span className="shrink-0 text-[11px] font-bold text-gray-600">
                {selectedIndex >= 0 ? `${selectedIndex + 1} / ${filteredQuestions.length}` : '—'}
              </span>
              <button
                onClick={() => nextQuestion && selectQuestion(nextQuestion.id)}
                disabled={!nextQuestion}
                className="flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-bold text-gray-300 transition-colors hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-30"
              >
                <span className="truncate">{nextQuestion?.title ?? 'Next'}</span>
                <ChevronRight size={14} className="shrink-0" />
              </button>
            </div>

            <section className="rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
              <div className="flex items-start gap-2">
                <Sparkles size={15} className="mt-0.5 shrink-0 text-amber-200" />
                <p className="text-xs leading-5 text-amber-50">
                  Works offline — all solutions are cached locally. Install via your browser's address bar to add a desktop shortcut.
                </p>
              </div>
            </section>
          </section>
        </main>
      </div>
    </div>
  );
}

export default ChemistrySolverModule;
