import { Copy, SlidersHorizontal, Trash2 } from 'lucide-react';
import { stateOptions, unitOptions } from '../data/studioModes.js';

const fieldClass = 'input h-9 rounded-xl px-3 py-1 text-xs';

export function PropertiesInspector({
  activeComponent,
  grade,
  projectCount,
  onUpdate,
  onDuplicate,
  onDelete,
}) {
  const update = patch => activeComponent && onUpdate(activeComponent.id, patch);

  return (
    <aside className="flex min-h-0 flex-col border-l border-white/10 bg-slate-950/70">
      <div className="border-b border-white/10 p-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-cyan-200" />
          <h2 className="text-sm font-black text-white">Properties</h2>
        </div>
        <p className="mt-1 text-xs text-gray-500">Edit selected object settings.</p>
      </div>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Project</p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between gap-3"><span className="text-gray-500">Grade</span><span className="font-bold text-gray-200">{grade}</span></div>
            <div className="flex justify-between gap-3"><span className="text-gray-500">Saved</span><span className="font-bold text-gray-200">{projectCount}</span></div>
          </div>
        </div>

        {!activeComponent ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-4 text-center">
            <p className="text-sm font-bold text-white">No object selected</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500">Select a canvas object to rename it, edit quantities, set safety notes, or duplicate/delete it.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-100">Selected</p>
              <input
                value={activeComponent.displayName}
                onChange={event => update({ displayName: event.target.value })}
                className={`${fieldClass} mt-3`}
                aria-label="Display name"
              />
              <div className="mt-2 flex gap-2">
                <button onClick={() => onDuplicate(activeComponent.id)} className="btn-secondary inline-flex h-8 flex-1 items-center justify-center gap-1.5 px-2 text-xs" type="button">
                  <Copy size={13} /> Duplicate
                </button>
                <button onClick={() => onDelete(activeComponent.id)} className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-400/25 bg-rose-500/10 px-2 text-xs font-bold text-rose-100 hover:bg-rose-500/15" type="button">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Basic</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <label className="text-xs text-gray-500">Quantity
                  <input type="number" value={activeComponent.quantity} onChange={event => update({ quantity: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs text-gray-500">Unit
                  <select value={activeComponent.unit} onChange={event => update({ unit: event.target.value })} className={`${fieldClass} mt-1`}>
                    {unitOptions.map(unit => <option key={unit}>{unit}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">State
                  <select value={activeComponent.state} onChange={event => update({ state: event.target.value })} className={`${fieldClass} mt-1`}>
                    {stateOptions.map(state => <option key={state}>{state}</option>)}
                  </select>
                </label>
                <label className="text-xs text-gray-500">Rotation
                  <input type="number" value={activeComponent.rotation} onChange={event => update({ rotation: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs text-gray-500">Width
                  <input type="number" value={activeComponent.width} onChange={event => update({ width: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
                </label>
                <label className="text-xs text-gray-500">Height
                  <input type="number" value={activeComponent.height} onChange={event => update({ height: Number(event.target.value) })} className={`${fieldClass} mt-1`} />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Chemistry</p>
              <div className="mt-3 space-y-2">
                <label className="block text-xs text-gray-500">Concentration
                  <input value={activeComponent.concentration} onChange={event => update({ concentration: event.target.value })} className={`${fieldClass} mt-1`} />
                </label>
                <label className="block text-xs text-gray-500">Apparatus Capacity
                  <input value={activeComponent.capacity} onChange={event => update({ capacity: event.target.value })} className={`${fieldClass} mt-1`} />
                </label>
                <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-gray-300">
                  Heating allowed
                  <input type="checkbox" checked={activeComponent.heatingAllowed} onChange={event => update({ heatingAllowed: event.target.checked })} />
                </label>
              </div>
            </div>

            {activeComponent.componentType === 'apparatus' && (
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Contained Chemicals</p>
                <textarea
                  value={(activeComponent.containedChemicals || []).join(', ')}
                  onChange={event => update({ containedChemicals: event.target.value.split(',').map(item => item.trim()).filter(Boolean) })}
                  className="input mt-3 min-h-20 resize-none rounded-xl text-xs"
                  placeholder="water, sodium chloride"
                />
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Safety Note</p>
              <textarea
                value={activeComponent.safetyNote}
                onChange={event => update({ safetyNote: event.target.value })}
                className="input mt-3 min-h-24 resize-none rounded-xl text-xs"
              />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Possible Actions</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {(activeComponent.possibleActions || []).map(action => (
                  <span key={action} className="rounded-lg bg-cyan-300/10 px-2 py-1 text-[11px] font-bold text-cyan-100">{action}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
