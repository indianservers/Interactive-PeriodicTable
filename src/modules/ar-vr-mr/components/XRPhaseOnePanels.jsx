import {
  AlertTriangle, BadgeCheck, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, GraduationCap, ListChecks, Target,
} from 'lucide-react';

export const XRLessonStepper = ({ experience, activeStep, onStepChange }) => {
  const steps = experience.lessonSteps || [];
  const current = steps[activeStep] || steps[0];
  const progress = steps.length ? Math.round(((activeStep + 1) / steps.length) * 100) : 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-300">
            <BookOpen size={14} /> Guided lesson
          </p>
          <h3 className="mt-1 text-lg font-black text-white">{current?.[0] || 'Lesson'}</h3>
        </div>
        <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100">
          {progress}% complete
        </span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">{current?.[1]}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {steps.map(([title], index) => (
          <button
            key={title}
            onClick={() => onStepChange(index)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              activeStep === index
                ? 'border-cyan-300/40 bg-cyan-400/15'
                : index < activeStep
                  ? 'border-emerald-400/25 bg-emerald-400/10'
                  : 'border-white/10 bg-black/20 hover:bg-white/[0.05]'
            }`}
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-xs font-black text-white">
              {index < activeStep ? <CheckCircle2 size={14} className="text-emerald-300" /> : index + 1}
            </span>
            <p className="mt-2 text-xs font-black text-white">{title}</p>
          </button>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          onClick={() => onStepChange(Math.max(0, activeStep - 1))}
          className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs"
          disabled={activeStep === 0}
        >
          <ChevronLeft size={14} /> Previous
        </button>
        <button
          onClick={() => onStepChange(Math.min(steps.length - 1, activeStep + 1))}
          className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs"
          disabled={activeStep >= steps.length - 1}
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};

export const XRChemistryInspector = ({ experience, selectedAtom }) => {
  const chemistry = experience.chemistry;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
        <Target size={14} /> Chemistry inspector
      </p>
      <h3 className="mt-3 text-lg font-black text-white">{chemistry.corePrinciple}</h3>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {chemistry.chemistryTags.map(tag => (
          <span key={tag} className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs font-bold text-cyan-100">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Selected object</p>
          {selectedAtom ? (
            <>
              <p className="mt-2 text-xl font-black text-white">{selectedAtom.element}</p>
              <p className="mt-1 text-xs font-mono text-gray-400">{selectedAtom.id}</p>
              <p className="mt-1 text-xs text-gray-500">Radius seed: {selectedAtom.radius}</p>
            </>
          ) : (
            <p className="mt-2 text-sm text-gray-400">Tap an atom or object in the preview to inspect it.</p>
          )}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 p-3">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Measure next</p>
          <div className="mt-2 space-y-1.5">
            {chemistry.measurable.map(item => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-400/10 p-3">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-100">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          {chemistry.accuracyNotes}
        </p>
      </div>
    </div>
  );
};

export const XRLaunchChecklist = ({ experience, support, mode }) => {
  const hasModeSupport = mode === 'vr' ? support.vr : support.ar;
  const checklist = [
    ...experience.launchChecklist,
    {
      id: 'hardware',
      label: 'XR hardware path',
      detail: hasModeSupport ? 'Compatible immersive session detected.' : 'Use desktop preview now; headset/device support can be added later.',
      required: false,
      ready: hasModeSupport,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
        <ClipboardCheck size={14} /> Launch checklist
      </p>
      <div className="mt-3 space-y-2">
        {checklist.map(item => (
          <div key={item.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${
              item.ready
                ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                : 'border-amber-400/25 bg-amber-400/10 text-amber-200'
            }`}>
              {item.ready ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
            </div>
            <div>
              <p className="text-sm font-black text-white">{item.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const XRChallengePanel = ({ experience, challengeAnswered, onAnswer }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          <ListChecks size={14} /> Checkpoint
        </p>
        <h3 className="mt-2 text-lg font-black text-white">{experience.checkpoint.prompt}</h3>
      </div>
      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${
        challengeAnswered
          ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100'
          : 'border-amber-400/25 bg-amber-400/10 text-amber-100'
      }`}>
        {challengeAnswered ? 'Marked understood' : 'Open'}
      </span>
    </div>
    <p className="mt-3 text-sm leading-relaxed text-gray-300">{experience.checkpoint.answerHint}</p>
    <div className="mt-4 flex flex-wrap gap-2">
      <button onClick={() => onAnswer(true)} className="btn-primary flex items-center gap-2 px-3 py-2 text-xs">
        <BadgeCheck size={14} /> I can explain it
      </button>
      <button onClick={() => onAnswer(false)} className="btn-secondary flex items-center gap-2 px-3 py-2 text-xs">
        Review again
      </button>
    </div>
  </div>
);

export const XRTeacherPrompt = ({ experience }) => (
  <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
      <GraduationCap size={14} /> Teacher mode seed
    </p>
    <p className="mt-3 text-sm leading-relaxed text-gray-300">{experience.teacherPrompt}</p>
  </div>
);
