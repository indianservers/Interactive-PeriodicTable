import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Flame, HelpCircle, Layers, Trophy } from 'lucide-react';
import { QuizMode } from '../components/quiz/QuizMode.jsx';
import { elements } from '../data/elements.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const todayIndex = () => Math.floor(Date.now() / 86400000) % elements.length;

const countdownToTomorrow = () => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setHours(24, 0, 0, 0);
  const ms = Math.max(0, tomorrow - now);
  const hours = String(Math.floor(ms / 3600000)).padStart(2, '0');
  const minutes = String(Math.floor((ms % 3600000) / 60000)).padStart(2, '0');
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const Flashcards = () => {
  const [index, setIndex] = useState(todayIndex());
  const [flipped, setFlipped] = useState(false);
  const el = elements[index];
  const previous = () => { setIndex((index + elements.length - 1) % elements.length); setFlipped(false); };
  const next = () => { setIndex((index + 1) % elements.length); setFlipped(false); };
  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (event.key === ' ') { event.preventDefault(); setFlipped(f => !f); }
      if (event.key === 'ArrowLeft') previous();
      if (event.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index]);
  return (
    <div className="glass rounded-2xl p-5 text-center">
      <button onClick={() => setFlipped(f => !f)} className="w-full min-h-56 rounded-2xl bg-white/[0.05] border border-white/10 flex flex-col items-center justify-center">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">{flipped ? 'Element' : 'Symbol'}</p>
        <p className="text-6xl font-black text-white mt-2">{flipped ? el.name : el.symbol}</p>
        <p className="text-sm text-gray-500 mt-3">{flipped ? `#${el.atomicNumber} · ${el.category}` : 'Tap to reveal'}</p>
      </button>
      <div className="flex gap-2 mt-4">
        <button onClick={previous} className="btn-secondary flex-1">Previous</button>
        <button onClick={next} className="btn-primary flex-1">Next</button>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] text-gray-500">
        <span className="rounded-lg border border-white/10 px-2 py-1">Space flip</span>
        <span className="rounded-lg border border-white/10 px-2 py-1">Left previous</span>
        <span className="rounded-lg border border-white/10 px-2 py-1">Right next</span>
      </div>
    </div>
  );
};

const GuessElement = () => {
  const target = useMemo(() => elements[(todayIndex() * 7 + 13) % elements.length], []);
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const ok = guess.trim().toLowerCase() === target.name.toLowerCase() || guess.trim().toLowerCase() === target.symbol.toLowerCase();
  return (
    <div className="glass rounded-2xl p-5">
      <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-widest">Clues</p>
        <p className="text-sm text-gray-300 mt-2">Atomic number {target.atomicNumber}. Period {target.period}. Category: {target.category}. Phase: {target.phase}.</p>
        <p className="text-xs text-gray-500 mt-2">{target.summary}</p>
      </div>
      <div className="flex gap-2">
        <input value={guess} onChange={e => setGuess(e.target.value)} placeholder="Element name or symbol" className="input text-sm" />
        <button onClick={() => setSubmitted(true)} className="btn-primary">Guess</button>
      </div>
      {submitted && <p className={`mt-3 text-sm ${ok ? 'text-green-400' : 'text-red-400'}`}>{ok ? 'Correct!' : `Answer: ${target.name} (${target.symbol})`}</p>}
    </div>
  );
};

const DailyChallenge = () => {
  const el = elements[todayIndex()];
  const [countdown, setCountdown] = useState(countdownToTomorrow());
  useEffect(() => {
    const id = window.setInterval(() => setCountdown(countdownToTomorrow()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="glass rounded-2xl p-5">
      <p className="mb-3 text-center font-mono text-xs text-gray-500">Next daily element in {countdown}</p>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-2xl font-black text-white">{el.symbol}</div>
        <div>
          <p className="text-lg font-bold text-white">{el.name}</p>
          <p className="text-sm text-gray-400">Daily challenge: learn its group, uses, electron configuration, and one safety fact.</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-3 gap-2 mt-4 text-xs">
        <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10">Config: {el.electronConfiguration}</div>
        <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10">Uses: {el.commonUses?.slice(0, 2).join(', ')}</div>
        <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10">Discovered: {el.yearDiscovered || 'Ancient'}</div>
      </div>
    </div>
  );
};

export const QuizPage = () => {
  const [mode, setMode] = useState('quiz');
  const [level, setLevel] = useState('beginner');
  const [streak] = useLocalStorage('cu-quiz-streak', { count: 0, best: 0, lastDate: null });
  const [quizHistory] = useLocalStorage('cu-quiz-history', []);

  const tabs = [
    ['quiz', 'Quiz', BookOpen],
    ['daily', 'Daily', CalendarDays],
    ['flashcards', 'Flashcards', Layers],
    ['guess', 'Guess', HelpCircle],
  ];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Trophy size={20} className="text-yellow-300" />
              <h2 className="text-xl font-black">Quiz and Games</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1">Levels, daily challenge, streaks, flashcards, and guess-the-element practice.</p>
          </div>
          <div className="rounded-xl bg-white/[0.05] border border-white/10 px-3 py-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-300" />
              <span className="text-sm text-gray-300">Streak {streak.count} - Best {streak.best}</span>
            </div>
            <div className="mt-2 grid grid-cols-12 gap-1">
              {Array.from({ length: 84 }, (_, i) => {
                const date = new Date(Date.now() - (83 - i) * 86400000).toISOString().slice(0, 10);
                const practiced = quizHistory.some(h => h.date?.slice(0, 10) === date);
                return <span key={date} className={`h-2 w-2 rounded-sm ${practiced ? 'bg-emerald-400' : 'bg-white/10'}`} title={date} />;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(([id, label, Icon]) => (
          <button key={id} onClick={() => setMode(id)} className={`px-3 py-2 rounded-xl text-sm border flex items-center gap-2 ${mode === id ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-200' : 'glass text-gray-400 border-white/10'}`}>
            <Icon size={14} /> {label}
          </button>
        ))}
        {mode === 'quiz' && (
          <select value={level} onChange={e => setLevel(e.target.value)} className="input w-44 text-sm ml-auto">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        )}
      </div>

      {mode === 'quiz' && <QuizMode level={level} />}
      {mode === 'daily' && <DailyChallenge />}
      {mode === 'flashcards' && <Flashcards />}
      {mode === 'guess' && <GuessElement />}
    </div>
  );
};

export default QuizPage;
