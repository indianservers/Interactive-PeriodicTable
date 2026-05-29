import { Crosshair, FlipHorizontal2, Move3D, Rotate3D } from 'lucide-react';

const operationTypes = [
  {
    type: 'Cn',
    title: 'Operate Rotational Axis',
    icon: Rotate3D,
    tone: 'blue',
    description: 'Choose a Cn axis and rotate the molecule by 360/n degrees or by a higher power Cn^m.',
  },
  {
    type: 'sigma',
    title: 'Operate Plane of Symmetry',
    icon: FlipHorizontal2,
    tone: 'cyan',
    description: 'Reflect atoms through a mirror plane. Atoms on the plane remain fixed; off-plane atoms exchange.',
  },
  {
    type: 'i',
    title: 'Operate Centre of Inversion',
    icon: Crosshair,
    tone: 'amber',
    description: 'Invert every atom through the molecular centre: (x, y, z) becomes (-x, -y, -z).',
  },
  {
    type: 'Sn',
    title: 'Operate Improper Rotational Axis',
    icon: Move3D,
    tone: 'violet',
    description: 'Step 1: perform proper Cn rotation. Step 2: reflect in the perpendicular plane. Together they must give the original configuration.',
  },
];

const toneClasses = {
  blue: 'border-blue-400/30 bg-blue-400/10 text-blue-100',
  cyan: 'border-cyan-400/30 bg-cyan-400/10 text-cyan-100',
  amber: 'border-amber-400/30 bg-amber-400/10 text-amber-100',
  violet: 'border-violet-400/30 bg-violet-400/10 text-violet-100',
};

const teachingExamples = {
  Cn: { moleculeId: 'water', elementId: 'C2-z', label: 'H2O C2 axis' },
  sigma: { moleculeId: 'water', elementId: 'sigma-mol', label: 'H2O mirror plane' },
  i: { moleculeId: 'xef4', elementId: 'i', label: 'XeF4 inversion centre' },
  Sn: { moleculeId: 'methane', elementId: 'S4-x', label: 'CH4 S4 axis' },
};

function operationSymbol(element) {
  if (!element) return '';
  if (element.type === 'Cn') return `C${element.order}`;
  if (element.type === 'Sn') return `S${element.order}`;
  if (element.type === 'sigma') return 'sigma';
  if (element.type === 'i') return 'i';
  return element.type;
}

export function SymmetryOperationLab({
  molecule,
  selectedElement,
  operationResult,
  onSelectElement,
  onSelectMolecule,
  onApplyOperation,
  onSetOperationPower,
}) {
  const selectFirstOfType = (type) => {
    const element = molecule.symmetryElements.find(item => item.type === type);
    if (element) {
      onSelectElement?.(element);
      onSetOperationPower?.(1);
    }
  };

  const loadTeachingExample = (type) => {
    const example = teachingExamples[type];
    if (!example) return;
    onSelectMolecule?.(example.moleculeId);
    onSetOperationPower?.(1);
  };

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Student Operation Lab</p>
          <h2 className="text-base font-black text-white">Operate axis, plane, centre, and improper rotational axis</h2>
          <p className="mt-1 text-xs text-gray-400">Built from the lecture definition: operate a line, plane, or point and test whether the molecule is indistinguishable.</p>
        </div>
        <button
          onClick={onApplyOperation}
          disabled={!selectedElement}
          className="btn-primary inline-flex items-center gap-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
        >
          Operate {operationSymbol(selectedElement) || 'Element'}
        </button>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {operationTypes.map(item => {
          const Icon = item.icon;
          const available = molecule.symmetryElements.some(element => element.type === item.type);
          const active = selectedElement?.type === item.type;
          return (
            <div
              key={item.type}
              onClick={() => selectFirstOfType(item.type)}
              className={`rounded-xl border p-3 text-left transition-colors ${
                active ? toneClasses[item.tone] : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
              } ${available ? 'cursor-pointer' : 'opacity-75'}`}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if ((event.key === 'Enter' || event.key === ' ') && available) {
                  event.preventDefault();
                  selectFirstOfType(item.type);
                }
              }}
            >
              <div className="flex items-center gap-2">
                <Icon size={16} className={active ? '' : 'text-cyan-300'} />
                <span className="text-xs font-black text-white">{item.title}</span>
              </div>
              <p className="mt-2 text-[11px] leading-4 text-gray-400">{item.description}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                  {available ? 'available for this molecule' : 'not present'}
                </p>
                {!available && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      loadTeachingExample(item.type);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        loadTeachingExample(item.type);
                      }
                    }}
                    className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-200 hover:bg-white/10"
                  >
                    Load example
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Selected operation</p>
          <p className="mt-1 text-sm font-black text-white">{selectedElement?.label || 'None selected'}</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Element type</p>
          <p className="mt-1 text-sm font-black text-white">{selectedElement ? operationSymbol(selectedElement) : '-'}</p>
        </div>
        <div className={`rounded-lg border p-3 ${operationResult?.valid ? 'border-emerald-400/25 bg-emerald-400/10' : operationResult ? 'border-rose-400/25 bg-rose-400/10' : 'border-white/10 bg-slate-950/45'}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Result</p>
          <p className="mt-1 text-sm font-black text-white">{operationResult ? (operationResult.valid ? 'Indistinguishable' : 'Not a symmetry operation') : 'Operate to test'}</p>
        </div>
      </div>

      {selectedElement?.type === 'Sn' && (
        <div className="mt-3 rounded-lg border border-violet-400/25 bg-violet-400/10 p-3 text-xs text-violet-50">
          <p className="font-black">Improper rotational axis S{selectedElement.order}</p>
          <p className="mt-1 leading-5 text-violet-100/90">
            First perform the proper C{selectedElement.order} rotation by {Math.round(360 / (selectedElement.order || 1))} degrees, then reflect in the plane perpendicular to that same axis. If rotation followed by reflection leads to the original configuration, S{selectedElement.order} is present.
          </p>
        </div>
      )}
    </section>
  );
}

export default SymmetryOperationLab;
