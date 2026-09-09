import { CheckCircle2, Eye, EyeOff } from 'lucide-react';

const typeColor = {
  E: 'text-slate-200 border-slate-400/20 bg-slate-400/10',
  Cn: 'text-blue-200 border-blue-400/25 bg-blue-400/10',
  sigma: 'text-cyan-200 border-cyan-400/25 bg-cyan-400/10',
  i: 'text-amber-200 border-amber-400/25 bg-amber-400/10',
  Sn: 'text-violet-200 border-violet-400/25 bg-violet-400/10',
};

export function SymmetryElementPanel({
  molecule,
  selectedElementId,
  onSelectElement,
  showAnswers = true,
  showElements,
  onToggleElements,
}) {
  const elements = showAnswers
    ? molecule.symmetryElements
    : [...molecule.symmetryElements.slice(0, 1), ...molecule.distractorElements];

  return (
    <section className="glass rounded-xl p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-white">Symmetry Elements</h3>
          <p className="text-xs text-gray-500">{showAnswers ? 'Verified for this molecule' : 'Practice candidates'}</p>
        </div>
        <button
          onClick={onToggleElements}
          className="rounded-lg border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
          title="Show or hide 3D symmetry markers"
        >
          {showElements ? <Eye size={15} /> : <EyeOff size={15} />}
        </button>
      </div>
      <div className="space-y-2">
        {elements.map(element => (
          <button
            key={element.id}
            onClick={() => onSelectElement(element)}
            className={`w-full rounded-lg border p-2 text-left transition-colors ${
              selectedElementId === element.id
                ? 'border-indigo-300/50 bg-indigo-400/15'
                : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`rounded-md border px-2 py-0.5 text-[10px] font-black ${typeColor[element.type] || typeColor.E}`}>
                {element.type === 'Cn' ? `C${element.order}` : element.type === 'Sn' ? `S${element.order}` : element.type}
              </span>
              <span className="text-xs font-bold text-gray-100">{element.label}</span>
              {showAnswers && <CheckCircle2 size={13} className="ml-auto text-emerald-300" />}
            </div>
            <p className="mt-1 text-[11px] leading-4 text-gray-400">{element.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default SymmetryElementPanel;
