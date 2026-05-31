import { CircleHelp, FileText, FolderOpen, Play, Plus, RotateCcw, Save, SkipForward } from 'lucide-react';
import { gradeOptions, studioModes } from '../data/studioModes.js';

export function TopStudioToolbar({
  grade,
  activeMode,
  projectName,
  projects,
  selectedProjectId,
  onGradeChange,
  onModeChange,
  onProjectNameChange,
  onNew,
  onSave,
  onLoad,
  onReset,
  onRunSimulation,
  onRunStep,
  onGenerateReport,
  onHelp,
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 bg-slate-950/85 px-4 py-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-100">
              Chemistry Inventor Studio
            </span>
            <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold text-emerald-100">
              Local Browser Builder
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">MIT App Inventor-style workspace for school chemistry experiments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={projectName}
            onChange={event => onProjectNameChange(event.target.value)}
            className="input h-9 w-52 rounded-xl py-1 text-xs"
            placeholder="Project name"
          />
          <select value={grade} onChange={event => onGradeChange(event.target.value)} className="input h-9 w-32 rounded-xl py-1 text-xs">
            {gradeOptions.map(option => <option key={option}>{option}</option>)}
          </select>
          <select value={activeMode} onChange={event => onModeChange(event.target.value)} className="input h-9 w-44 rounded-xl py-1 text-xs">
            {studioModes.map(mode => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
          </select>
          <select value={selectedProjectId} onChange={event => onLoad(event.target.value)} className="input h-9 w-48 rounded-xl py-1 text-xs" title="Load saved project">
            <option value="">Load project...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={onNew} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <Plus size={14} /> New
        </button>
        <button onClick={onSave} className="btn-primary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <Save size={14} /> Save
        </button>
        <button onClick={() => selectedProjectId && onLoad(selectedProjectId)} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <FolderOpen size={14} /> Load
        </button>
        <button onClick={onReset} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <RotateCcw size={14} /> Reset
        </button>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <button onClick={onRunSimulation} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <Play size={14} /> Run Simulation
        </button>
        <button onClick={onRunStep} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <SkipForward size={14} /> Run Step
        </button>
        <button onClick={onGenerateReport} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button">
          <FileText size={14} /> Generate Report
        </button>
        <button onClick={onHelp} className="ml-auto inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-gray-400 hover:text-white" type="button">
          <CircleHelp size={14} /> Help
        </button>
      </div>
    </div>
  );
}
