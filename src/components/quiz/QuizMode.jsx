import { useState, useCallback, useRef, useEffect } from 'react';
import { Trophy, RotateCcw, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { elements } from '../../data/elements.js';
import { generateQuiz, generateQuizQuestion } from '../../utils/quizHelpers.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import { quizTypes } from '../../data/quizQuestions.js';

const levelSettings = {
  beginner: { count: 8, time: 20, label: 'Beginner' },
  intermediate: { count: 10, time: 15, label: 'Intermediate' },
  advanced: { count: 12, time: 10, label: 'Advanced' },
};

const dayKey = () => new Date().toISOString().slice(0, 10);

export const QuizMode = ({ level = 'beginner' }) => {
  const settings = levelSettings[level] || levelSettings.beginner;
  const [bestScore, setBestScore] = useLocalStorage('cu-quiz-best', 0);
  const [quizHistory, setQuizHistory] = useLocalStorage('cu-quiz-history', []);
  const [streak, setStreak] = useLocalStorage('cu-quiz-streak', { count: 0, best: 0, lastDate: null });
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedType, setSelectedType] = useState('mixed');
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef(null);

  const startQuiz = useCallback(() => {
    const types = selectedType === 'mixed'
      ? null
      : [selectedType];
    const questions = types
      ? Array.from({ length: settings.count }, () => generateQuizQuestion(elements, types[0]))
      : generateQuiz(elements, settings.count);
    setQuiz(questions);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }, [selectedType, settings.count]);

  const startMixed = useCallback(() => {
    const questions = generateQuiz(elements, settings.count);
    setQuiz(questions);
    setCurrentQ(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  }, [settings.count]);

  const handleAnswer = (option) => {
    if (selected !== null) return;
    setSelected(option);
    const correct = option === quiz[currentQ].answer;
    if (correct) setScore(s => s + 1);
  };

  const next = () => {
    if (currentQ + 1 >= quiz.length) {
      const finalScore = score + (selected === quiz[currentQ].answer ? 1 : 0);
      if (finalScore > bestScore) setBestScore(finalScore);
      const today = dayKey();
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      setStreak(s => {
        const nextCount = s.lastDate === today ? s.count : s.lastDate === yesterday ? s.count + 1 : 1;
        return { count: nextCount, best: Math.max(s.best || 0, nextCount), lastDate: today };
      });
      setQuizHistory(h => [{ score: finalScore, date: new Date().toISOString(), total: quiz.length, level: settings.label }, ...h].slice(0, 10));
      setFinished(true);
    } else {
      setCurrentQ(q => q + 1);
      setSelected(null);
    }
  };

  useEffect(() => {
    if (!quiz || finished || selected !== null) return;
    setTimeLeft(settings.time);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer('__timeout__');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQ, quiz, finished, settings.time]);

  if (!quiz) {
    return (
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="text-center">
          <div className="text-4xl mb-2">🧪</div>
          <h3 className="text-xl font-bold text-white mb-1">Quiz Mode</h3>
          <p className="text-gray-400 text-sm">Test your periodic table knowledge · {settings.label}</p>
          {bestScore > 0 && (
            <p className="text-indigo-400 text-sm mt-1">Best score: {bestScore} · streak {streak.count}</p>
          )}
        </div>

        <div className="w-full max-w-sm">
          <p className="text-xs text-gray-400 mb-2">Select quiz type</p>
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="input text-sm mb-4 w-full"
          >
            <option value="mixed">Mixed (Recommended)</option>
            {quizTypes.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <button onClick={startQuiz} className="btn-primary w-full py-3 text-base">
            Start {settings.label} Quiz ({settings.count} Questions)
          </button>
        </div>

        {quizHistory.length > 0 && (
          <div className="w-full max-w-sm">
            <p className="text-xs text-gray-400 mb-2">Recent scores</p>
            <div className="space-y-1">
              {quizHistory.slice(0, 5).map((h, i) => (
                <div key={i} className="flex justify-between text-xs glass rounded-lg px-3 py-2">
                  <span className="text-gray-400">{new Date(h.date).toLocaleDateString()}</span>
                  <span className={h.score >= 8 ? 'text-green-400' : h.score >= 5 ? 'text-yellow-400' : 'text-red-400'}>
                    {h.score}/{h.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (finished) {
    const final = score;
    const pct = Math.round((final / quiz.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-8 text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <Trophy size={36} className="text-indigo-400" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">{final}/{quiz.length}</h3>
          <p className="text-gray-400">{pct}% correct</p>
          {final === bestScore && final > 0 && (
            <p className="text-yellow-400 text-sm mt-1">⭐ New best score!</p>
          )}
          <p className="text-sm mt-2 text-gray-400">
            {pct >= 80 ? '🎉 Excellent! You really know your elements.' :
             pct >= 60 ? '👍 Good work! Keep practicing.' :
             '📚 Keep studying — you\'ll get there!'}
          </p>
        </div>
        <button onClick={startMixed} className="btn-primary flex items-center gap-2">
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  const q = quiz[currentQ];
  const isAnswered = selected !== null;
  const isCorrect = selected === q.answer;

  return (
    <div className="flex flex-col gap-4 max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Question {currentQ + 1} of {quiz.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">{score} correct</span>
          {!isAnswered && (
            <span className={`font-mono font-bold text-sm tabular-nums ${
              timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-yellow-400' : 'text-gray-300'
            }`}>
              {timeLeft}s
            </span>
          )}
        </div>
      </div>
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${(currentQ / quiz.length) * 100}%`,
            background: score / Math.max(currentQ, 1) >= 0.7
              ? 'linear-gradient(90deg, #22c55e, #4ade80)'
              : score / Math.max(currentQ, 1) >= 0.4
              ? 'linear-gradient(90deg, #eab308, #facc15)'
              : 'linear-gradient(90deg, #ef4444, #f87171)',
          }}
        />
      </div>

      {/* Question */}
      <div className="glass rounded-2xl p-5">
        <p className="text-base font-semibold text-white leading-snug">{q.question}</p>
        {q.context && (
          <p className="text-xs text-gray-400 mt-2">{q.context}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => {
          const letters = ['A', 'B', 'C', 'D'];
          let cls = 'glass border border-white/10 text-gray-200 hover:border-white/25 hover:bg-white/5';
          if (isAnswered) {
            if (opt === q.answer) cls = 'bg-green-500/20 border border-green-500/50 text-green-200';
            else if (opt === selected) cls = 'bg-red-500/20 border border-red-500/50 text-red-200';
            else cls = 'opacity-35 border border-white/5 text-gray-500';
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              disabled={isAnswered}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${cls}`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 ${
                isAnswered && opt === q.answer ? 'bg-green-500/30 text-green-300' :
                isAnswered && opt === selected ? 'bg-red-500/30 text-red-300' :
                'bg-white/10 text-gray-400'
              }`}>{letters[i]}</span>
              <span className="flex-1 text-left">{opt}</span>
              {isAnswered && opt === q.answer && <CheckCircle size={16} className="text-green-400 flex-shrink-0" />}
              {isAnswered && opt === selected && opt !== q.answer && <XCircle size={16} className="text-red-400 flex-shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Next */}
      {isAnswered && (
        <div className="flex flex-col gap-2">
          <div className={`text-center text-sm font-medium py-2 rounded-xl ${isCorrect ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
            {isCorrect ? '✓ Correct!' : `✗ The answer was: ${q.answer}`}
          </div>
          <button onClick={next} className="btn-primary flex items-center justify-center gap-2">
            {currentQ + 1 < quiz.length ? 'Next Question' : 'See Results'}
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};
export default QuizMode;
