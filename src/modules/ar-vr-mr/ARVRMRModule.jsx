import { useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck, Box, Eye, EyeOff, FlaskConical, GraduationCap, Info, Orbit, Pause, Play,
  RotateCcw, ScanLine, SlidersHorizontal, Sparkles,
} from 'lucide-react';
import { XRChemistryScene } from './components/XRChemistryScene.jsx';
import {
  XRChallengePanel,
  XRChemistryInspector,
  XRLaunchChecklist,
  XRLessonStepper,
  XRTeacherPrompt,
} from './components/XRPhaseOnePanels.jsx';
import {
  createDefaultSimulationState,
  flagshipConceptIds,
  XRInteractionWorkbench,
} from './components/XRInteractionWorkbench.jsx';
import { XRARExperiencePanel } from './components/XRARExperiencePanel.jsx';
import { XRConceptInfographics } from './components/XRConceptInfographics.jsx';
import {
  createDefaultWorldClassState,
  XRWorldClassTooling,
} from './components/XRWorldClassTooling.jsx';
import {
  getConceptCompletion,
  XRExportPanel,
  XRMasteryDashboard,
  XRMiniAssessment,
} from './components/XRPhaseThreePanels.jsx';
import { xrConceptFilters, xrConceptStats, xrExperiences, xrModes } from './data/xrExperiences.js';
import { getWebXRSupport, supportMessageForMode } from './utils/webxrSupport.js';

const progressStorageKey = 'cu-xr-mastery-progress';

const modeIconMap = {
  ar: ScanLine,
  vr: Eye,
  mr: Box,
};

const foundationPrinciples = [
  ['Reusable engine', 'One Three.js/WebXR scene base powers every concept before custom effects are layered in.', Orbit],
  ['Short wow moments', 'Each concept is a focused immersive learning moment, not a full app conversion.', Sparkles],
  ['Device honest', 'The module shows support status and still gives a desktop preview when XR hardware is unavailable.', BadgeCheck],
];

const readinessColor = (value) => {
  if (value >= 80) return '#22c55e';
  if (value >= 65) return '#38bdf8';
  if (value >= 50) return '#f59e0b';
  return '#fb7185';
};

const matchesFilter = (experience, filter) => (
  filter === 'All'
  || experience.mode === filter
  || experience.category === filter
);

const MetricCard = ({ label, value, detail }) => (
  <div className="rounded-xl border border-white/10 bg-black/20 p-3">
    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</p>
    <p className="mt-2 text-2xl font-black text-white">{value}</p>
    <p className="mt-1 text-xs text-gray-400">{detail}</p>
  </div>
);

const readStoredProgress = () => {
  try {
    return JSON.parse(localStorage.getItem(progressStorageKey) || '{}');
  } catch {
    return {};
  }
};

const downloadBlob = (filename, content, type = 'application/json') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const ARVRMRModule = ({ reducedMotion = false }) => {
  const [activeMode, setActiveMode] = useState('ar');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeExperienceId, setActiveExperienceId] = useState('ar-periodic-table');
  const [support, setSupport] = useState({ secureContext: true, hasNavigatorXR: false, ar: false, vr: false });
  const [scale, setScale] = useState(1);
  const [stage, setStage] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [lessonStep, setLessonStep] = useState(0);
  const [challengeProgress, setChallengeProgress] = useState({});
  const [simulation, setSimulation] = useState(() => createDefaultSimulationState());
  const [masteryProgress, setMasteryProgress] = useState(() => readStoredProgress());
  const [assessmentAnswers, setAssessmentAnswers] = useState({});
  const [quizResults, setQuizResults] = useState({});
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [worldClassState, setWorldClassState] = useState(() => createDefaultWorldClassState());
  const [arPlacement, setArPlacement] = useState({
    surfaceScale: 1,
    height: 0.2,
    rotationY: 0,
    overlayDensity: 70,
    placementMode: true,
    anchorLocked: true,
    showReticle: true,
    showOcclusionPlane: true,
    lightingBoost: true,
    status: 'desktop-preview',
    statusDetail: 'Desktop preview active until an AR session starts.',
    placedAt: null,
    desktopPosition: [0, 0.52, -2.25],
    placedPosition: null,
    placedQuaternion: null,
  });

  useEffect(() => {
    let alive = true;
    getWebXRSupport().then(result => {
      if (alive) setSupport(result);
    });
    return () => {
      alive = false;
    };
  }, []);

  const filteredExperiences = useMemo(
    () => xrExperiences.filter(experience => matchesFilter(experience, activeFilter)),
    [activeFilter]
  );

  const activeExperience = useMemo(
    () => xrExperiences.find(item => item.id === activeExperienceId) || xrExperiences[0],
    [activeExperienceId]
  );

  const flagshipExperiences = useMemo(
    () => flagshipConceptIds.map(id => xrExperiences.find(item => item.id === id)).filter(Boolean),
    []
  );

  useEffect(() => {
    if (!filteredExperiences.some(item => item.id === activeExperienceId) && filteredExperiences[0]) {
      setActiveExperienceId(filteredExperiences[0].id);
    }
  }, [activeExperienceId, filteredExperiences]);

  useEffect(() => {
    const mode = activeExperience.mode.toLowerCase();
    setActiveMode(mode === 'vr' ? 'vr' : mode === 'mr' ? 'mr' : 'ar');
    setSelectedAtom(null);
    setLessonStep(0);
    setStage(1);
    setSimulation(createDefaultSimulationState());
  }, [activeExperience]);

  const selectedMode = xrModes.find(item => item.id === activeMode) || xrModes[0];
  const supportText = supportMessageForMode(support, activeMode);
  const activeReadinessColor = readinessColor(activeExperience.readiness);
  const activeQuizResult = quizResults[activeExperience.id] || null;
  const activeAnswers = assessmentAnswers[activeExperience.id] || {};
  const activeCompletion = getConceptCompletion({
    experience: activeExperience,
    lessonStep,
    challengeAnswered: Boolean(challengeProgress[activeExperience.id]),
    quizResult: activeQuizResult,
  });

  useEffect(() => {
    const nextProgress = {
      ...masteryProgress,
      [activeExperience.id]: {
        completion: Math.max(masteryProgress[activeExperience.id]?.completion || 0, activeCompletion),
        lastVisited: new Date().toISOString(),
        quizScore: activeQuizResult?.score ?? masteryProgress[activeExperience.id]?.quizScore ?? null,
        mode: activeExperience.mode,
      },
    };
    setMasteryProgress(nextProgress);
    localStorage.setItem(progressStorageKey, JSON.stringify(nextProgress));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeExperience.id, activeCompletion, activeQuizResult?.score]);

  const resetSceneControls = () => {
    setScale(1);
    setStage(1);
    setLessonStep(0);
    setShowLabels(true);
    setAutoRotate(true);
    setSelectedAtom(null);
  };

  const handleARPlacementChange = (patch) => {
    setArPlacement(current => {
      const next = { ...current, ...patch };
      if ('anchorLocked' in patch) {
        if (!patch.anchorLocked && current.status === 'locked') next.status = 'placed';
        if (patch.anchorLocked && current.status === 'placed') next.status = 'locked';
      }
      return next;
    });
  };

  const handleLessonStepChange = (nextStep) => {
    const boundedStep = Math.max(0, Math.min(activeExperience.lessonSteps.length - 1, nextStep));
    setLessonStep(boundedStep);
    setStage(Math.min(2, boundedStep));
    setShowLabels(boundedStep >= 1);
    if (boundedStep >= 2) setAutoRotate(false);
  };

  const handleChallengeAnswer = (understood) => {
    setChallengeProgress(progress => ({
      ...progress,
      [activeExperience.id]: understood,
    }));
  };

  const handleAssessmentAnswer = (questionIndex, optionIndex) => {
    setAssessmentAnswers(allAnswers => ({
      ...allAnswers,
      [activeExperience.id]: {
        ...(allAnswers[activeExperience.id] || {}),
        [questionIndex]: optionIndex,
      },
    }));
  };

  const handleSubmitAssessment = () => {
    const answers = assessmentAnswers[activeExperience.id] || {};
    const score = activeExperience.assessment.reduce((total, [, , correctIndex], index) => (
      answers[index] === correctIndex ? total + 1 : total
    ), 0);
    setQuizResults(results => ({
      ...results,
      [activeExperience.id]: {
        score,
        total: activeExperience.assessment.length,
        passed: score === activeExperience.assessment.length,
      },
    }));
  };

  const handleResetAssessment = () => {
    setAssessmentAnswers(allAnswers => ({ ...allAnswers, [activeExperience.id]: {} }));
    setQuizResults(results => {
      const next = { ...results };
      delete next[activeExperience.id];
      return next;
    });
  };

  const buildSessionReport = () => ({
    generatedAt: new Date().toISOString(),
    concept: {
      id: activeExperience.id,
      title: activeExperience.title,
      mode: activeExperience.mode,
      category: activeExperience.category,
      sceneType: activeExperience.sceneType,
    },
    controls: {
      scale,
      stage,
      showLabels,
      autoRotate,
      simulation,
      arPlacement,
      builder: worldClassState.builder,
      teacher: worldClassState.teacher,
      collaboration: worldClassState.collaboration,
      dataImport: worldClassState.dataImport,
    },
    learning: {
      lessonStep,
      completion: activeCompletion,
      challengeUnderstood: Boolean(challengeProgress[activeExperience.id]),
      quiz: activeQuizResult,
      selectedObject: selectedAtom,
    },
  });

  const handleDownloadPng = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${activeExperience.id}-xr-snapshot.png`;
    link.click();
  };

  const handleDownloadReport = () => {
    downloadBlob(`${activeExperience.id}-xr-report.json`, JSON.stringify(buildSessionReport(), null, 2));
  };

  const handleCopySummary = async () => {
    const report = buildSessionReport();
    const summary = `${report.concept.title} (${report.concept.mode}) - completion ${report.learning.completion}% - scene ${report.concept.sceneType}`;
    await navigator.clipboard?.writeText(summary).catch(() => null);
    setCopiedSummary(true);
    window.setTimeout(() => setCopiedSummary(false), 1200);
  };

  return (
    <div className="page-transition mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/20">
        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-black text-cyan-100">
                <Sparkles size={14} /> New Module
              </span>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                15 wow XR concepts
              </span>
              <span className="rounded-full border border-violet-400/25 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-100">
                Mastery polish
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">Immersive Chemistry XR Studio</h2>
            <p className="mt-3 max-w-4xl text-sm leading-relaxed text-gray-300">
              A focused AR/VR/MR module for world-class chemistry moments. The base now separates concept data, WebXR support,
              reusable Three.js scene primitives, desktop preview, and immersive launch controls.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MetricCard label="Concepts" value={xrConceptStats.total} detail="Curated immersive lessons" />
              <MetricCard label="Playable base" value={xrConceptStats.playable} detail="Scene seeds already interactive" />
              <MetricCard label="Foundation specs" value={xrConceptStats.foundation + xrConceptStats.designSpec} detail="Ready for guided lessons" />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Device readiness</p>
            <div className="mt-3 space-y-2">
              {[
                ['Secure context', support.secureContext],
                ['WebXR API', support.hasNavigatorXR],
                ['AR sessions', support.ar],
                ['VR sessions', support.vr],
              ].map(([label, ready]) => (
                <div key={label} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-sm">
                  <span className="text-gray-300">{label}</span>
                  <span className={ready ? 'text-emerald-300' : 'text-amber-300'}>{ready ? 'Ready' : 'Check'}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-xs text-cyan-100">{supportText}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {xrModes.map(mode => {
          const Icon = modeIconMap[mode.id] || Box;
          const active = activeMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                setActiveMode(mode.id);
                setActiveFilter(mode.label);
              }}
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active ? 'border-cyan-300/40 bg-cyan-400/15' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.06]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <Icon size={20} className={active ? 'text-cyan-200' : 'text-gray-400'} />
                {active && <BadgeCheck size={18} className="text-emerald-300" />}
              </div>
              <h3 className="mt-3 text-lg font-black text-white">{mode.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">{mode.description}</p>
            </button>
          );
        })}
      </section>

      <XRARExperiencePanel
        support={support}
        activeExperience={activeExperience}
        experiences={xrExperiences}
        arPlacement={arPlacement}
        onPlacementChange={handleARPlacementChange}
        onSelectExperience={(id) => {
          setActiveExperienceId(id);
          setActiveFilter('AR');
        }}
      />

      <XRConceptInfographics
        experiences={xrExperiences}
        activeExperienceId={activeExperience.id}
        onSelectExperience={(id) => {
          setActiveExperienceId(id);
          const nextExperience = xrExperiences.find(item => item.id === id);
          if (nextExperience) setActiveFilter(nextExperience.mode);
        }}
      />

      <XRMasteryDashboard
        experiences={xrExperiences}
        progress={{
          ...masteryProgress,
          [activeExperience.id]: {
            ...(masteryProgress[activeExperience.id] || {}),
            completion: activeCompletion,
          },
        }}
        activeExperienceId={activeExperience.id}
      />

      <section className="grid gap-4 xl:grid-cols-[350px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Concept registry</p>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">
                {filteredExperiences.length} shown
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {xrConceptFilters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition-colors ${
                    activeFilter === filter
                      ? 'border-cyan-300/35 bg-cyan-400/15 text-cyan-100'
                      : 'border-white/10 bg-black/20 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="mt-3 max-h-[620px] space-y-2 overflow-y-auto pr-1">
              {filteredExperiences.map((experience, index) => (
                <button
                  key={experience.id}
                  onClick={() => setActiveExperienceId(experience.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    activeExperienceId === experience.id
                      ? 'border-indigo-400/35 bg-indigo-500/15'
                      : 'border-white/10 bg-black/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-black text-white">{index + 1}. {experience.title}</p>
                      <p className="mt-1 text-xs font-mono text-gray-500">{experience.formula}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200">{experience.mode}</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-gray-400">{experience.wow}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-100">
                      {experience.lessonSteps.length} steps
                    </span>
                    <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] font-bold text-violet-100">
                      checkpoint
                    </span>
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-bold text-cyan-100">
                      metadata
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${experience.readiness}%`, background: readinessColor(experience.readiness) }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">{experience.phase}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
              <Info size={14} /> Active concept
            </p>
            <h3 className="mt-3 text-lg font-black text-white">{activeExperience.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-300">{activeExperience.objective}</p>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="flex justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-gray-500">Learning layer</span>
                <span className="font-bold text-gray-200">{activeExperience.phase}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-gray-500">Scene type</span>
                <span className="font-bold text-gray-200">{activeExperience.sceneType}</span>
              </div>
              <div className="flex justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                <span className="text-gray-500">Readiness</span>
                <span className="font-bold" style={{ color: activeReadinessColor }}>{activeExperience.readiness}%</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <XRInteractionWorkbench
            experience={activeExperience}
            simulation={simulation}
            onSimulationChange={setSimulation}
            flagshipExperiences={flagshipExperiences}
            onSelectFlagship={setActiveExperienceId}
          />

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="mb-4 grid gap-3 lg:grid-cols-[1fr_310px]">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">World-class base</p>
                <h3 className="mt-1 text-2xl font-black text-white">{activeExperience.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-300">{activeExperience.prompt}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500">
                  <SlidersHorizontal size={14} /> Scene controls
                </p>
                <div className="mt-3 space-y-3">
                  <label className="block">
                    <span className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Scale</span>
                      <span>{scale.toFixed(1)}x</span>
                    </span>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.1"
                      value={scale}
                      onChange={event => setScale(Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </label>
                  <label className="block">
                    <span className="flex justify-between text-xs font-bold text-gray-400">
                      <span>Effect stage</span>
                      <span>{stage + 1}/3</span>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="1"
                      value={stage}
                      onChange={event => setStage(Number(event.target.value))}
                      className="mt-2 w-full"
                    />
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => setShowLabels(value => !value)} className="btn-secondary flex items-center justify-center gap-1.5 px-2 py-2 text-xs">
                      {showLabels ? <Eye size={14} /> : <EyeOff size={14} />} Labels
                    </button>
                    <button onClick={() => setAutoRotate(value => !value)} className="btn-secondary flex items-center justify-center gap-1.5 px-2 py-2 text-xs">
                      {autoRotate ? <Pause size={14} /> : <Play size={14} />} Spin
                    </button>
                    <button onClick={resetSceneControls} className="btn-secondary flex items-center justify-center gap-1.5 px-2 py-2 text-xs">
                      <RotateCcw size={14} /> Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <XRChemistryScene
              experience={activeExperience}
              mode={activeMode}
              reducedMotion={reducedMotion}
              scale={scale}
              stage={stage}
              showLabels={showLabels}
              autoRotate={autoRotate}
              selectedId={selectedAtom?.id || null}
              simulation={simulation}
              arPlacement={arPlacement}
              onARPlacementChange={handleARPlacementChange}
              onSelectObject={setSelectedAtom}
            />

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Active mode</p>
                <p className="mt-2 text-lg font-black text-white">{selectedMode.label}</p>
                <p className="mt-1 text-xs text-gray-400">{selectedMode.description}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Interaction seed</p>
                <p className="mt-2 text-lg font-black text-white">{activeExperience.atoms.length} objects</p>
                <p className="mt-1 text-xs text-gray-400">{activeExperience.effects.join(', ')}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Selected object</p>
                {selectedAtom ? (
                  <>
                    <p className="mt-2 text-lg font-black text-white">{selectedAtom.element}</p>
                    <p className="mt-1 text-xs font-mono text-gray-400">{selectedAtom.id}</p>
                  </>
                ) : (
                  <>
                    <p className="mt-2 text-lg font-black text-white">None</p>
                    <p className="mt-1 text-xs text-gray-400">Tap atoms in the preview to inspect them.</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <XRLessonStepper
            experience={activeExperience}
            activeStep={lessonStep}
            onStepChange={handleLessonStepChange}
          />

          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <XRChemistryInspector experience={activeExperience} selectedAtom={selectedAtom} />
            <XRLaunchChecklist experience={activeExperience} support={support} mode={activeMode} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
            <XRChallengePanel
              experience={activeExperience}
              challengeAnswered={Boolean(challengeProgress[activeExperience.id])}
              onAnswer={handleChallengeAnswer}
            />
            <XRTeacherPrompt experience={activeExperience} />
          </div>

          <XRMiniAssessment
            experience={activeExperience}
            selectedAnswers={activeAnswers}
            onAnswer={handleAssessmentAnswer}
            quizResult={activeQuizResult}
            onSubmit={handleSubmitAssessment}
            onReset={handleResetAssessment}
          />

          <XRExportPanel
            experience={activeExperience}
            onDownloadPng={handleDownloadPng}
            onDownloadReport={handleDownloadReport}
            onCopySummary={handleCopySummary}
            copied={copiedSummary}
          />

          <XRWorldClassTooling
            state={worldClassState}
            onStateChange={setWorldClassState}
          />

          <section className="grid gap-3 md:grid-cols-3">
            {foundationPrinciples.map(([title, detail, Icon]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <Icon size={18} className="text-cyan-300" />
                <h3 className="mt-3 text-base font-black text-white">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-400">{detail}</p>
              </div>
            ))}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Build order</p>
                <h3 className="mt-1 text-lg font-black text-white">Foundation before spectacle</h3>
              </div>
              <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-100">
                New module only
              </span>
            </div>
            <div className="mt-4 grid gap-2 md:grid-cols-5">
              {['Concept registry', 'Scene base', 'Selection model', 'XR launch', 'Custom effects'].map((stepName, index) => (
                <div key={stepName} className="rounded-xl border border-white/10 bg-black/20 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-xs font-black text-cyan-100">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-sm font-black text-white">{stepName}</p>
                  <p className="mt-1 text-xs text-gray-500">{index < 4 ? 'Base ready' : 'Next layer'}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
      </section>
    </div>
  );
};

export default ARVRMRModule;
