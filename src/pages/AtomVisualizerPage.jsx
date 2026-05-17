import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { elements } from '../data/elements.js';
import { ElectronShellDiagram } from '../components/visualizers/ElectronShellDiagram.jsx';
import { OrbitalFillingDiagram } from '../components/visualizers/OrbitalFillingDiagram.jsx';
import { getCategoryInfo } from '../data/categories.js';
import { formatValue } from '../utils/formatters.js';

export const AtomVisualizerPage = ({ initialElement, reducedMotion }) => {
  const [selected, setSelected] = useState(initialElement || elements[0]);
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query) return elements.slice(0, 20);
    const q = query.toLowerCase();
    return elements.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.symbol.toLowerCase().includes(q) ||
      String(e.atomicNumber).includes(q)
    ).slice(0, 20);
  }, [query]);

  const catInfo = getCategoryInfo(selected.category);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Atom Shell Visualizer</h2>
        <p className="text-sm text-gray-400">Bohr-style educational electron shell diagrams for all 118 elements.</p>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-4">
        {/* Sidebar search */}
        <div className="glass rounded-2xl p-3 space-y-2 max-h-[70vh] flex flex-col">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search element…"
              className="input pl-9 text-sm"
            />
          </div>
          <div className="overflow-y-auto scrollbar-thin flex-1 space-y-0.5">
            {results.map(el => (
              <button
                key={el.atomicNumber}
                onClick={() => setSelected(el)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${
                  selected?.atomicNumber === el.atomicNumber
                    ? 'bg-indigo-500/20 text-indigo-200'
                    : 'hover:bg-white/5 text-gray-300'
                }`}
              >
                <span className="w-7 text-center font-bold text-xs" style={{ color: getCategoryInfo(el.category).color }}>{el.symbol}</span>
                <span className="flex-1 text-left text-xs">{el.name}</span>
                <span className="text-gray-600 text-[10px]">{el.shells?.join('-')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main visualizer */}
        <div className="space-y-4 min-w-0">
        <div className="glass rounded-2xl p-6 flex flex-col items-center gap-4">
          <div
            className="w-full max-w-xs aspect-square mx-auto"
            style={{ filter: `drop-shadow(0 0 30px ${catInfo.color}40)` }}
          >
            <ElectronShellDiagram element={selected} reducedMotion={reducedMotion} />
          </div>

          <div className="text-center">
            <h3 className="text-2xl font-black" style={{ color: catInfo.color }}>{selected.name}</h3>
            <p className="text-gray-400 text-sm">{selected.symbol} · Atomic Number {selected.atomicNumber}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-2 text-sm">
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-500">Electron Config.</p>
              <p className="text-gray-200 font-mono text-xs mt-1">{selected.electronConfiguration}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-500">Shell Distribution</p>
              <p className="text-gray-200 font-mono text-xs mt-1">{selected.shells?.join(' - ')}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-500">Total Electrons</p>
              <p className="text-gray-200 font-bold mt-1">{selected.shells?.reduce((a, b) => a + b, 0)}</p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-xs text-gray-500">Category</p>
              <p className="text-xs mt-1" style={{ color: catInfo.color }}>{selected.category}</p>
            </div>
          </div>

          <p className="text-[10px] text-gray-600 text-center">
            This is a simplified Bohr-style educational model, not an exact quantum-mechanical representation.
          </p>
        </div>
        <OrbitalFillingDiagram element={selected} reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  );
};
export default AtomVisualizerPage;
