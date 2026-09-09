import { Search } from 'lucide-react';
import { moleculeLibrary } from '../data/moleculeData.js';

export function MoleculeSelector({ selectedId, onSelect }) {
  return (
    <section className="glass rounded-xl p-3">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <Search size={16} className="text-cyan-300" />
        Molecule Library
      </div>
      <div className="space-y-2">
        {moleculeLibrary.map(molecule => (
          <button
            key={molecule.id}
            onClick={() => onSelect(molecule.id)}
            className={`w-full rounded-lg border p-2.5 text-left transition-colors ${
              selectedId === molecule.id
                ? 'border-cyan-400/40 bg-cyan-400/10'
                : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-sm font-semibold text-white">{molecule.name}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-cyan-100">{molecule.pointGroup}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">{molecule.formula} - {molecule.geometry}</p>
            <p className="mt-1 text-[10px] uppercase tracking-widest text-gray-600">{molecule.difficulty}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default MoleculeSelector;
