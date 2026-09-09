import { CircleHelp, FileText, FlaskConical, FolderOpen, Play, Plus, RotateCcw, Save, SkipForward } from 'lucide-react';
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
    <div className="border-b border-white/10 bg-slate-950/90 px-3 py-2">
      <div className="flex flex-col gap-2 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
            <FlaskConical size={17} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-black text-white">Chemistry Inventor Studio</h1>
            <p className="truncate text-[11px] text-gray-500">Build, run, explain, and report school chemistry experiments.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <input
            value={projectName}
            onChange={event => onProjectNameChange(event.target.value)}
            className="input h-8 w-48 rounded-lg py-1 text-xs"
            placeholder="Project name"
          />
          <select value={grade} onChange={event => onGradeChange(event.target.value)} className="input h-8 w-28 rounded-lg py-1 text-xs">
            {gradeOptions.map(option => <option key={option}>{option}</option>)}
          </select>
          <select value={activeMode} onChange={event => onModeChange(event.target.value)} className="input h-8 w-40 rounded-lg py-1 text-xs">
            {studioModes.map(mode => <option key={mode.id} value={mode.id}>{mode.title}</option>)}
          </select>
          <select value={selectedProjectId} onChange={event => onLoad(event.target.value)} className="input h-8 w-44 rounded-lg py-1 text-xs" title="Load saved project">
            <option value="">Load project...</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <button onClick={onNew} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <Plus size={14} /> New
        </button>
        <button onClick={onSave} className="btn-primary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <Save size={14} /> Save
        </button>
        <button onClick={() => selectedProjectId && onLoad(selectedProjectId)} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <FolderOpen size={14} /> Load
        </button>
        <button onClick={onReset} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <RotateCcw size={14} /> Reset
        </button>
        <span className="mx-1 hidden h-6 w-px bg-white/10 sm:block" />
        <button onClick={onRunSimulation} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <Play size={14} /> Run
        </button>
        <button onClick={onRunStep} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <SkipForward size={14} /> Step
        </button>
        <button onClick={onGenerateReport} className="btn-secondary inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs" type="button">
          <FileText size={14} /> Report
        </button>
        <button onClick={onHelp} className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2.5 text-xs font-bold text-gray-400 hover:text-white" type="button">
          <CircleHelp size={14} /> Help
        </button>
      </div>
    </div>
  );
}
