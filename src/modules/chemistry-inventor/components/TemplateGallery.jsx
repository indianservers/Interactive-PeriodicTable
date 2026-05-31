import { BookOpenCheck, CheckCircle2, GraduationCap, Lightbulb, Presentation, ShieldCheck, Target } from 'lucide-react';
import { experimentTemplates } from '../data/experimentTemplates.js';
import { gradeConceptMap, getGradeLevel } from '../data/gradeConceptMap.js';
import { challengeGoals } from '../engines/guidedValidationEngine.js';

const categoryLabels = {
  correctApparatus: 'Apparatus',
  correctChemicals: 'Chemicals',
  correctSequence: 'Sequence',
  correctObservations: 'Observations',
  safetyAwareness: 'Safety',
  vivaQuestions: 'Viva',
};

export function TemplateGallery({
  grade,
  activeMode,
  selectedTemplate,
  validation,
  vivaAnswers,
  onLoadTemplate,
  onSelectTemplate,
  onTeacherDemo,
  onToggleViva,
}) {
  if (!['guided', 'challenge', 'teacher-demo'].includes(activeMode)) return null;

  const gradeLevel = getGradeLevel(grade);
  const templates = experimentTemplates.filter(template => template.grade <= gradeLevel);
  const conceptInfo = gradeConceptMap[gradeLevel];
  const goals = challengeGoals.filter(goal => goal.grade <= gradeLevel);
  const hideDetails = activeMode === 'challenge';

  return (
    <section className="border-b border-white/10 bg-slate-950/80 p-3">
      <div className="mb-3 flex flex-col gap-2 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {activeMode === 'challenge' ? <Target size={16} className="text-pink-200" /> : <BookOpenCheck size={16} className="text-cyan-200" />}
            <h2 className="text-sm font-black text-white">
              {activeMode === 'challenge' ? 'Challenge Mode Goals' : activeMode === 'teacher-demo' ? 'Teacher Demo Templates' : 'Guided Experiment Mode'}
            </h2>
          </div>
          <p className="mt-1 text-xs text-gray-500">{conceptInfo?.title} - {templates.length} grade-filtered templates.</p>
        </div>
        <div className="flex max-w-2xl flex-wrap gap-1.5">
          {conceptInfo?.concepts.slice(0, 7).map(concept => (
            <span key={concept} className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[11px] font-bold text-cyan-100">{concept}</span>
          ))}
        </div>
      </div>

      {activeMode === 'challenge' && (
        <div className="mb-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          {goals.map(goal => (
            <button
              key={goal.id}
              onClick={() => {
                const template = templates.find(item => item.title === goal.templateHint) || templates[0];
                if (template) onSelectTemplate(template);
              }}
              className="rounded-2xl border border-pink-300/20 bg-pink-300/10 p-3 text-left hover:bg-pink-300/15"
              type="button"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-100">Challenge</span>
              <span className="mt-1 block text-xs font-bold text-white">{goal.title}</span>
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2">
        {templates.map(template => {
          const active = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`min-w-72 rounded-2xl border p-3 text-left transition ${active ? 'border-cyan-300/45 bg-cyan-300/10' : 'border-white/10 bg-white/[0.035] hover:border-cyan-300/30 hover:bg-cyan-300/10'}`}
              type="button"
            >
              <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Grade {template.grade}</span>
              <span className="mt-1 block text-sm font-black text-white">{template.title}</span>
              <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-400">{hideDetails ? 'Complete the goal using your own setup. Fewer hints are shown in Challenge Mode.' : template.aim}</span>
              <span className="mt-2 block text-[11px] font-bold text-gray-500">{template.requiredApparatus.length} apparatus - {template.requiredChemicals.length} chemicals</span>
            </button>
          );
        })}
      </div>

      {selectedTemplate && (
        <div className="grid gap-3 pt-2 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">Selected Experiment</p>
                <h3 className="mt-1 text-base font-black text-white">{selectedTemplate.title}</h3>
                <p className="mt-1 text-sm text-gray-300">{hideDetails ? 'Challenge mode hides some procedural help. Use the score and feedback to improve.' : selectedTemplate.aim}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onLoadTemplate(selectedTemplate)} className="btn-primary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
                  <GraduationCap size={14} /> Load Guided
                </button>
                <button onClick={() => onTeacherDemo(selectedTemplate)} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
                  <Presentation size={14} /> Teacher Demo
                </button>
              </div>
            </div>

            {!hideDetails && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoList title="Required Apparatus" items={selectedTemplate.requiredApparatus} />
                <InfoList title="Required Chemicals" items={selectedTemplate.requiredChemicals} />
                <InfoList title="Learning Outcomes" items={selectedTemplate.learningOutcomes} />
                <InfoList title="Expected Observations" items={selectedTemplate.expectedObservations} />
              </div>
            )}

            <div className="mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-200" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Task Checklist</p>
              </div>
              <div className="mt-2 grid gap-1.5 md:grid-cols-2">
                {validation.checklist.map(item => (
                  <div key={item.id} className={`rounded-xl border px-3 py-2 text-xs ${item.done ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-white/10 bg-black/15 text-gray-400'}`}>
                    {item.done ? 'Done: ' : 'Next: '}{item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Validation Score</p>
                  <p className="mt-1 text-3xl font-black text-white">{validation.score}%</p>
                </div>
                <ShieldCheck size={30} className="text-emerald-200" />
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.entries(validation.categories).map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-white/10 bg-black/15 p-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{categoryLabels[key] || key}</p>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-cyan-300" style={{ width: `${value}%` }} />
                    </div>
                    <p className="mt-1 text-xs font-bold text-gray-200">{value}%</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="flex items-center gap-2">
                <Lightbulb size={15} className="text-amber-200" />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">{activeMode === 'challenge' ? 'Limited Hints' : 'Hints and Feedback'}</p>
              </div>
              <div className="mt-2 space-y-1.5">
                {[...validation.hints.slice(0, activeMode === 'challenge' ? 2 : 6), ...validation.messages.slice(0, 4)].map(message => (
                  <p key={message} className="rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2 text-xs text-amber-50">{message}</p>
                ))}
              </div>
            </div>

            {!hideDetails && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Viva Questions</p>
                <div className="mt-2 space-y-1.5">
                  {selectedTemplate.vivaQuestions.map((question, index) => (
                    <label key={question} className="flex items-start gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-gray-300">
                      <input type="checkbox" checked={Boolean(vivaAnswers[index])} onChange={() => onToggleViva(index)} />
                      <span>{question}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function InfoList({ title, items }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map(item => (
          <span key={item} className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[11px] font-bold text-gray-300">
            {String(item).replace(/-/g, ' ')}
          </span>
        ))}
      </div>
    </div>
  );
}
