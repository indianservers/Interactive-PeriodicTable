import { Activity, BookOpenCheck, ClipboardList, Eye, FlaskConical, HelpCircle, Save, Sigma, Sparkles, TriangleAlert } from 'lucide-react';
import { useMemo, useState } from 'react';
import { learningContent, reactionLearningContent } from '../data/learningContent.js';
import { getGradeLevel } from '../data/gradeConceptMap.js';

const tabs = [
  { id: 'observation', label: 'Observation', icon: Eye },
  { id: 'equation', label: 'Equation', icon: Sigma },
  { id: 'particles', label: 'Particles', icon: Sparkles },
  { id: 'why', label: 'Why It Happened', icon: Activity },
  { id: 'mistakes', label: 'Common Mistakes', icon: TriangleAlert },
  { id: 'viva', label: 'Viva Questions', icon: HelpCircle },
  { id: 'outcomes', label: 'Learning Outcomes', icon: BookOpenCheck },
];

const fallbackMistakes = ['Wrong sequence', 'Wrong indicator', 'Heating unsafe apparatus', 'Confusing gas tests', 'Not using filter paper', 'Assuming all mixtures react'];

const fallbackViva = [
  ['What did you observe?', 'Describe the visible evidence: colour change, bubbles, precipitate, residue, crystals, gas, or temperature change.'],
  ['Which safety rule matters most?', 'Use dilute chemicals, safe heating, correct apparatus, and teacher supervision for gas or flame tests.'],
  ['What conclusion can you write?', 'Connect the observation to the reaction or separation method used.'],
];

function getVivaPairs(template) {
  const questions = template?.vivaQuestions?.length ? template.vivaQuestions : fallbackViva.map(([question]) => question);
  return questions.slice(0, 5).map((question, index) => [
    question,
    fallbackViva[index]?.[1] || template?.explanation || 'Use the observation and equation to justify your answer.',
  ]);
}

function ParticleVisual({ reactionId, cards }) {
  const visibleCards = cards?.length ? cards : (reactionLearningContent[reactionId]?.particles || ['particles', 'change', 'observation']);
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
      {visibleCards.slice(0, 5).map((card, index) => (
        <div key={`${card}-${index}`} className="contents">
          <div className="min-h-24 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-slate-950 text-xs font-black text-cyan-100">
              {String(card).split(' ').map(part => part[0]).join('').slice(0, 3)}
            </div>
            <p className="mt-2 text-xs font-bold text-gray-100">{card}</p>
          </div>
          {index < Math.min(visibleCards.length, 5) - 1 && (
            <div className="hidden items-center justify-center text-xl font-black text-cyan-200 md:flex">→</div>
          )}
        </div>
      ))}
    </div>
  );
}

export function SimulationPanel({ report, projects, outputLog, simulationResult, procedureTimeline = [], selectedTemplate, grade }) {
  const [activeTab, setActiveTab] = useState('observation');
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const gradeLevel = getGradeLevel(grade);
  const vivaPairs = useMemo(() => getVivaPairs(selectedTemplate), [selectedTemplate]);
  const commonMistakes = simulationResult?.commonMistakes?.length
    ? simulationResult.commonMistakes
    : selectedTemplate?.commonMistakes || fallbackMistakes;
  const outcomes = selectedTemplate?.learningOutcomes?.length
    ? selectedTemplate.learningOutcomes
    : [simulationResult?.learningTakeaway || 'Connect the setup, observation, and explanation.', ...learningContent.assessmentLanguage.slice(0, 2)];

  const noResult = !simulationResult;

  return (
    <section className="grid gap-3 border-t border-white/10 bg-slate-950/85 p-3 xl:grid-cols-[minmax(0,1.45fr)_0.75fr]">
      <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Activity size={15} className="text-emerald-200" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Learning Output</p>
            </div>
            <p className="mt-2 text-sm font-bold text-white">{noResult ? report.status : simulationResult.title}</p>
            <p className="mt-1 text-xs text-gray-400">{noResult ? report.summary : simulationResult.learningTakeaway}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${activeTab === id ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-black/10 text-gray-400 hover:text-white'}`}
                type="button"
              >
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 min-h-64 rounded-2xl border border-white/10 bg-slate-950/55 p-4">
          {noResult ? (
            <div className="flex h-52 flex-col items-center justify-center text-center">
              <p className="text-sm font-black text-white">Run a simulation or logic sequence</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-gray-500">The explanation tabs will fill with observation, equations, particle cards, common mistakes, viva questions, and learning outcomes.</p>
            </div>
          ) : (
            <>
              {activeTab === 'observation' && (
                <Panel title="What You See">
                  <p className="text-base font-bold text-white">{simulationResult.observation}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {simulationResult.validationMessages.map(message => (
                      <span key={message} className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[11px] font-bold text-amber-100">{message}</span>
                    ))}
                    {simulationResult.safetyWarnings.map(message => (
                      <span key={message} className="rounded-lg border border-rose-300/20 bg-rose-300/10 px-2 py-1 text-[11px] font-bold text-rose-100">{message}</span>
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === 'equation' && (
                <Panel title={gradeLevel <= 8 ? 'Word Equation First' : 'Equation View'}>
                  <div className="space-y-3">
                    <EquationCard label="Word Equation" value={simulationResult.wordEquation} />
                    <EquationCard label="Balanced Chemical Equation" value={simulationResult.balancedEquation || 'Not required for this lower-grade or physical-process activity.'} />
                    {simulationResult.ionicExplanation && <EquationCard label="Simple Ionic Idea" value={simulationResult.ionicExplanation} />}
                  </div>
                </Panel>
              )}

              {activeTab === 'particles' && (
                <Panel title="Particle-Level Model">
                  <ParticleVisual reactionId={simulationResult.reactionId} cards={simulationResult.particleCards} />
                  <p className="mt-4 text-sm leading-relaxed text-gray-300">{simulationResult.particleExplanation}</p>
                </Panel>
              )}

              {activeTab === 'why' && (
                <Panel title="Why It Happened">
                  <div className="space-y-2">
                    {simulationResult.whyItHappened.slice(0, 6).map(line => (
                      <p key={line} className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm text-gray-200">{line}</p>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <ExplanationCard title="Student Explanation" text={simulationResult.studentExplanation} />
                    <ExplanationCard title="Teacher Note" text={simulationResult.teacherExplanation} />
                  </div>
                </Panel>
              )}

              {activeTab === 'mistakes' && (
                <Panel title="Common Mistakes To Avoid">
                  <div className="grid gap-2 md:grid-cols-2">
                    {commonMistakes.map(mistake => (
                      <p key={mistake} className="rounded-xl border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-sm text-amber-50">{mistake}</p>
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === 'viva' && (
                <Panel title="Viva Questions">
                  <div className="space-y-2">
                    {vivaPairs.map(([question, answer], index) => (
                      <div key={question} className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-bold text-white">{index + 1}. {question}</p>
                          <button onClick={() => setRevealedAnswers(previous => ({ ...previous, [index]: !previous[index] }))} className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-300/10" type="button">
                            {revealedAnswers[index] ? 'Hide' : 'Reveal'}
                          </button>
                        </div>
                        {revealedAnswers[index] && <p className="mt-2 text-sm leading-relaxed text-gray-300">{answer}</p>}
                      </div>
                    ))}
                  </div>
                </Panel>
              )}

              {activeTab === 'outcomes' && (
                <Panel title="Learning Outcomes">
                  <div className="grid gap-2 md:grid-cols-2">
                    {outcomes.map(outcome => (
                      <p key={outcome} className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-sm text-emerald-50">{outcome}</p>
                    ))}
                  </div>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <div className="flex items-center gap-2">
            <ClipboardList size={15} className="text-cyan-200" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-500">Timeline</p>
          </div>
          <div className="mt-2 max-h-72 space-y-1 overflow-y-auto text-xs">
            {procedureTimeline.length > 0 ? procedureTimeline.slice().reverse().map(entry => (
              <div key={entry.id} className={`rounded-lg border px-2 py-1 ${entry.valid ? 'border-emerald-300/15 bg-emerald-300/5' : 'border-amber-300/20 bg-amber-300/10'}`}>
                <p className="font-bold text-gray-200">Step {entry.stepNumber}: {entry.action}</p>
                <p className="text-gray-400">{entry.observation || entry.warning}</p>
                {entry.warning && <p className="text-amber-100">Warning: {entry.warning}</p>}
                <p className="text-gray-500">{entry.explanation}</p>
              </div>
            )) : outputLog.map(entry => (
              <p key={entry.id} className="rounded-lg bg-black/15 px-2 py-1 text-gray-300">
                <span className="font-mono text-gray-500">{entry.time}</span> {entry.text}
              </p>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-2">
              <FlaskConical size={15} className="text-cyan-200" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Concepts</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {report.concepts.map(concept => (
                <span key={concept} className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[11px] font-bold text-cyan-100">{concept}</span>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center gap-2">
              <Save size={15} className="text-amber-200" />
              <p className="text-xs font-black uppercase tracking-widest text-gray-500">Saved Work</p>
            </div>
            <p className="mt-2 text-xs text-gray-400">{projects.length} browser-saved project{projects.length === 1 ? '' : 's'} available.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Panel({ title, children }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-gray-500">{title}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function EquationCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <p className="mt-2 font-mono text-sm font-bold text-cyan-50">{value}</p>
    </div>
  );
}

function ExplanationCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-gray-300">{text}</p>
    </div>
  );
}
