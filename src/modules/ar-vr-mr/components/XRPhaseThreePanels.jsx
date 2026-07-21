import {
  Award, BarChart3, Camera, CheckCircle2, Download, FileText, Gauge, RotateCcw,
  ShieldCheck, Trophy,
} from 'lucide-react';

export const getConceptCompletion = ({ experience, lessonStep, challengeAnswered, quizResult }) => {
  const lesson = experience.lessonSteps?.length
    ? ((lessonStep + 1) / experience.lessonSteps.length) * 40
    : 0;
  const challenge = challengeAnswered ? 25 : 0;
  const quiz = quizResult?.passed ? 25 : quizResult?.score ? 12 : 0;
  const interaction = 10;
  return Math.min(100, Math.round(lesson + challenge + quiz + interaction));
};

export const XRMasteryDashboard = ({ experiences, progress, activeExperienceId }) => {
  const values = experiences.map(experience => progress[experience.id]?.completion || 0);
  const average = values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
  const completed = values.filter(value => value >= 80).length;
  const active = progress[activeExperienceId]?.completion || 0;

  return (
    <section className="rounded-2xl border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/20">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
            <Trophy size={14} /> Phase 3 mastery layer
          </p>
          <h3 className="mt-2 text-2xl font-black text-white">XR Learning Command</h3>
          <p className="mt-1 text-sm text-gray-400">Persistent progress, concept mastery, export, and assessment readiness.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ['Average', `${average}%`, Gauge],
            ['Mastered', `${completed}/${experiences.length}`, Award],
            ['Active', `${active}%`, ShieldCheck],
          ].map(([label, value, Icon]) => (
            <div key={label} className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <Icon size={16} className="mx-auto text-cyan-300" />
              <p className="mt-2 text-xl font-black text-white">{value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-5">
        {experiences.slice(0, 15).map(experience => {
          const completion = progress[experience.id]?.completion || 0;
          return (
            <div
              key={experience.id}
              className={`rounded-xl border p-3 ${
                activeExperienceId === experience.id
                  ? 'border-cyan-300/35 bg-cyan-400/15'
                  : 'border-white/10 bg-black/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black text-gray-500">{experience.mode}</span>
                {completion >= 80 && <CheckCircle2 size={14} className="text-emerald-300" />}
              </div>
              <p className="mt-2 line-clamp-2 text-xs font-black text-white">{experience.title}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-emerald-300"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-1 text-[10px] font-bold text-gray-500">{completion}%</p>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const XRMiniAssessment = ({ experience, selectedAnswers, onAnswer, quizResult, onSubmit, onReset }) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          <BarChart3 size={14} /> Mini assessment
        </p>
        <h3 className="mt-2 text-lg font-black text-white">{experience.title} checkpoint quiz</h3>
      </div>
      {quizResult && (
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
          quizResult.passed
            ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
            : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
        }`}>
          {quizResult.score}/{experience.assessment.length}
        </span>
      )}
    </div>
    <div className="mt-4 grid gap-3 xl:grid-cols-2">
      {experience.assessment.map(([question, options, correctIndex], questionIndex) => (
        <div key={question} className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-sm font-black text-white">{questionIndex + 1}. {question}</p>
          <div className="mt-3 space-y-2">
            {options.map((option, optionIndex) => {
              const selected = selectedAnswers[questionIndex] === optionIndex;
              const showCorrect = quizResult && optionIndex === correctIndex;
              const showWrong = quizResult && selected && optionIndex !== correctIndex;
              return (
                <button
                  key={option}
                  onClick={() => onAnswer(questionIndex, optionIndex)}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${
                    showCorrect
                      ? 'border-emerald-400/35 bg-emerald-400/10 text-emerald-100'
                      : showWrong
                        ? 'border-rose-400/35 bg-rose-400/10 text-rose-100'
                        : selected
                          ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100'
                          : 'border-white/10 bg-white/[0.035] text-gray-300 hover:bg-white/[0.07]'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={onSubmit} className="btn-primary flex items-center gap-2 px-3 py-2 text-xs">
        <CheckCircle2 size={14} /> Grade assessment
      </button>
      <button onClick={onReset} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs">
        <RotateCcw size={14} /> Reset answers
      </button>
    </div>
  </section>
);

export const XRExportPanel = ({ experience, onDownloadPng, onDownloadReport, onCopySummary, copied }) => (
  <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          <FileText size={14} /> Studio export
        </p>
        <h3 className="mt-2 text-lg font-black text-white">Capture and share this XR lesson state</h3>
      </div>
      <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
        {experience.mode} ready report
      </span>
    </div>
    <div className="mt-4 grid gap-2 md:grid-cols-3">
      <button onClick={onDownloadPng} className="btn-secondary flex items-center justify-center gap-2 px-3 py-2 text-xs">
        <Camera size={14} /> PNG snapshot
      </button>
      <button onClick={onDownloadReport} className="btn-secondary flex items-center justify-center gap-2 px-3 py-2 text-xs">
        <Download size={14} /> JSON report
      </button>
      <button onClick={onCopySummary} className="btn-secondary flex items-center justify-center gap-2 px-3 py-2 text-xs">
        <FileText size={14} /> {copied ? 'Copied' : 'Copy summary'}
      </button>
    </div>
  </section>
);
