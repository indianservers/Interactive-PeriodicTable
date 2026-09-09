import { ChevronDown, GripVertical, Pause, Play, Plus, RotateCcw, SkipForward, Sparkles, Trash2 } from 'lucide-react';
import { logicBlockTypes } from '../data/logicBlockLibrary.js';

const toneClass = {
  cyan: 'border-cyan-300/30 bg-cyan-300/10',
  slate: 'border-slate-300/20 bg-slate-300/10',
  purple: 'border-purple-300/25 bg-purple-300/10',
  emerald: 'border-emerald-300/25 bg-emerald-300/10',
  pink: 'border-pink-300/25 bg-pink-300/10',
  amber: 'border-amber-300/25 bg-amber-300/10',
  orange: 'border-orange-300/25 bg-orange-300/10',
  sky: 'border-sky-300/25 bg-sky-300/10',
  teal: 'border-teal-300/25 bg-teal-300/10',
  rose: 'border-rose-300/25 bg-rose-300/10',
  blue: 'border-blue-300/25 bg-blue-300/10',
  indigo: 'border-indigo-300/25 bg-indigo-300/10',
  violet: 'border-violet-300/25 bg-violet-300/10',
  green: 'border-green-300/25 bg-green-300/10',
};

const emptyOption = label => <option value="">{label}</option>;

export function LogicBlocksPanel({
  blocks,
  canvasObjects,
  currentStep,
  paused,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onReorderBlocks,
  onRunAll,
  onRunStep,
  onPause,
  onResetSteps,
  onExplainStep,
}) {
  const apparatus = canvasObjects.filter(object => object.componentType === 'apparatus');
  const chemicals = canvasObjects.filter(object => object.componentType === 'chemical');
  const indicators = canvasObjects.filter(object => object.componentType === 'indicator');
  const definitionByType = Object.fromEntries(logicBlockTypes.map(block => [block.type, block]));

  const handleDragStart = (event, index) => {
    event.dataTransfer.setData('text/plain', String(index));
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (event, index) => {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isInteger(fromIndex)) onReorderBlocks(fromIndex, index);
  };

  const renderFields = block => {
    const update = patch => onUpdateBlock(block.id, patch);
    const targetSelect = (
      <label className="text-[11px] font-bold text-gray-500">Target
        <select value={block.targetId} onChange={event => update({ targetId: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs">
          {emptyOption('Select container')}
          {apparatus.map(object => <option key={object.id} value={object.id}>{object.displayName}</option>)}
        </select>
      </label>
    );

    return (
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {block.type === 'select-apparatus' && (
          <label className="text-[11px] font-bold text-gray-500">Apparatus
            <select value={block.apparatusId} onChange={event => update({ apparatusId: event.target.value, targetId: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs">
              {emptyOption('Select apparatus')}
              {apparatus.map(object => <option key={object.id} value={object.id}>{object.displayName}</option>)}
            </select>
          </label>
        )}
        {block.type === 'add-chemical' && (
          <>
            <label className="text-[11px] font-bold text-gray-500">Chemical
              <select value={block.chemicalId} onChange={event => update({ chemicalId: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs">
                {emptyOption('Select chemical')}
                {chemicals.map(object => <option key={object.id} value={object.id}>{object.displayName}</option>)}
              </select>
            </label>
            <label className="text-[11px] font-bold text-gray-500">Quantity
              <input type="number" value={block.quantity} onChange={event => update({ quantity: Number(event.target.value) })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs" />
            </label>
            <label className="text-[11px] font-bold text-gray-500">Unit
              <input value={block.unit} onChange={event => update({ unit: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs" />
            </label>
            {targetSelect}
          </>
        )}
        {block.type === 'add-indicator' && (
          <>
            <label className="text-[11px] font-bold text-gray-500">Indicator
              <select value={block.indicatorId} onChange={event => update({ indicatorId: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs">
                {emptyOption('Select indicator')}
                {indicators.map(object => <option key={object.id} value={object.id}>{object.displayName}</option>)}
              </select>
            </label>
            {targetSelect}
          </>
        )}
        {['measure-volume', 'mix-contents', 'heat-container', 'cool-container', 'filter-mixture', 'evaporate-solution', 'measure-ph', 'measure-temperature'].includes(block.type) && targetSelect}
        {block.type === 'test-gas' && (
          <>
            <label className="text-[11px] font-bold text-gray-500">Gas
              <select value={block.gasType} onChange={event => update({ gasType: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs">
                {['hydrogen', 'oxygen', 'carbon-dioxide'].map(gas => <option key={gas} value={gas}>{gas}</option>)}
              </select>
            </label>
            {targetSelect}
          </>
        )}
        {block.type === 'record-observation' && (
          <label className="text-[11px] font-bold text-gray-500 md:col-span-3">Observation
            <input value={block.note} onChange={event => update({ note: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs" placeholder="Record what changed" />
          </label>
        )}
        {block.type === 'ask-question' && (
          <label className="text-[11px] font-bold text-gray-500 md:col-span-3">Question
            <input value={block.question} onChange={event => update({ question: event.target.value })} className="input mt-1 h-8 rounded-lg px-2 py-1 text-xs" />
          </label>
        )}
      </div>
    );
  };

  return (
    <section className="border-t border-white/10 bg-slate-950/90">
      <div className="flex flex-col gap-3 border-b border-white/10 p-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-cyan-200" />
            <h2 className="text-sm font-black text-white">Logic Blocks</h2>
            <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-0.5 text-[10px] font-bold text-gray-400">MIT-style procedure</span>
          </div>
          <p className="mt-1 text-xs text-gray-500">Blocks run from top to bottom and write each result into the timeline.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select onChange={event => event.target.value && onAddBlock(event.target.value)} value="" className="input h-9 w-56 rounded-xl py-1 text-xs">
            <option value="">Add block...</option>
            {logicBlockTypes.map(block => <option key={block.type} value={block.type}>{block.label}</option>)}
          </select>
          <button onClick={onRunAll} className="btn-primary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button"><Play size={14} /> Run All</button>
          <button onClick={onRunStep} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button"><SkipForward size={14} /> Run Step</button>
          <button onClick={onPause} className={`btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs ${paused ? 'text-amber-200' : ''}`} type="button"><Pause size={14} /> Pause</button>
          <button onClick={onResetSteps} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button"><RotateCcw size={14} /> Reset Steps</button>
          <button onClick={onExplainStep} className="btn-secondary inline-flex h-9 items-center gap-2 px-3 text-xs" type="button"><ChevronDown size={14} /> Explain Current Step</button>
        </div>
      </div>
      <div className="max-h-[440px] space-y-2 overflow-y-auto p-3">
        {blocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.025] p-4 text-center text-sm text-gray-500">Add blocks to build an experiment procedure.</div>
        ) : blocks.map((block, index) => {
          const definition = definitionByType[block.type] || logicBlockTypes[0];
          return (
            <div
              key={block.id}
              draggable
              onDragStart={event => handleDragStart(event, index)}
              onDragOver={event => event.preventDefault()}
              onDrop={event => handleDrop(event, index)}
              className={`rounded-2xl border p-3 ${toneClass[definition.tone] || toneClass.slate} ${currentStep === index ? 'ring-2 ring-cyan-300/40' : ''}`}
            >
              <div className="flex items-center gap-2">
                <GripVertical size={15} className="text-gray-500" />
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/20 text-xs font-black text-white">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{definition.label}</p>
                  <p className="text-[11px] text-gray-500">Drag to reorder</p>
                </div>
                <button onClick={() => onDeleteBlock(block.id)} className="rounded-lg p-1.5 text-rose-300 hover:bg-rose-500/10" type="button" title="Delete block">
                  <Trash2 size={14} />
                </button>
              </div>
              {renderFields(block)}
            </div>
          );
        })}
      </div>
    </section>
  );
}
