import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';

export function SymmetryOperationControls({
  selectedElement,
  isPlaying,
  progress,
  speed,
  operationPower = 1,
  onOperationPowerChange,
  onApply,
  onPause,
  onStep,
  onReset,
  onSpeedChange,
}) {
  return (
    <section className="glass rounded-xl p-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Operation Timeline</p>
          <p className="mt-1 truncate text-sm text-white">{selectedElement ? selectedElement.label : 'Select a symmetry element'}</p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(selectedElement?.type === 'Cn' || selectedElement?.type === 'Sn') && (
            <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
              Power
              <select
                value={operationPower}
                onChange={event => onOperationPowerChange?.(Number(event.target.value))}
                className="rounded-md border border-white/10 bg-slate-950 px-2 py-1 text-xs text-white"
              >
                {Array.from({ length: selectedElement.order || 1 }, (_, index) => index + 1).map(power => (
                  <option key={power} value={power}>
                    {selectedElement.type === 'Cn' ? `C${selectedElement.order}` : `S${selectedElement.order}`}^{power}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button onClick={onApply} disabled={!selectedElement} className="btn-primary inline-flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-40">
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            Apply Operation
          </button>
          <button onClick={onPause} className="btn-secondary inline-flex items-center gap-2">
            <Pause size={15} />
            Pause
          </button>
          <button onClick={onStep} disabled={!selectedElement} className="btn-secondary inline-flex items-center gap-2 disabled:opacity-40">
            <SkipForward size={15} />
            Step
          </button>
          <button onClick={onReset} className="btn-secondary inline-flex items-center gap-2">
            <RotateCcw size={15} />
            Reset
          </button>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
            Speed
            <input
              type="range"
              min="0.4"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={event => onSpeedChange(Number(event.target.value))}
              className="w-24 accent-cyan-400"
            />
          </label>
        </div>
      </div>
    </section>
  );
}

export default SymmetryOperationControls;
