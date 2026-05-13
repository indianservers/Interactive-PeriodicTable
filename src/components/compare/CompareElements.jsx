import { useState, useMemo } from 'react';
import { Search, ArrowLeftRight, X } from 'lucide-react';
import { elements } from '../../data/elements.js';
import { getCategoryInfo } from '../../data/categories.js';
import { formatValue, formatTemperature, formatDensity } from '../../utils/formatters.js';
import { ElectronShellDiagram } from '../visualizers/ElectronShellDiagram.jsx';

const SearchableElementPicker = ({ selected, onSelect, placeholder, exclude }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return elements
      .filter(e => e.atomicNumber !== exclude?.atomicNumber)
      .filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.symbol.toLowerCase().includes(q) ||
        String(e.atomicNumber).includes(q)
      )
      .slice(0, 8);
  }, [query, exclude]);

  const pick = (el) => { onSelect(el); setQuery(''); setOpen(false); };

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-2 p-3 glass rounded-xl border border-white/10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: `${getCategoryInfo(selected.category).color}20`, color: getCategoryInfo(selected.category).color }}>
            {selected.symbol}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{selected.name}</p>
            <p className="text-xs text-gray-400">#{selected.atomicNumber} · {selected.category}</p>
          </div>
          <button onClick={() => onSelect(null)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="input pl-9 text-sm"
          />
          {open && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
              {results.map(el => (
                <button key={el.atomicNumber} onClick={() => pick(el)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors">
                  <span className="text-sm font-bold w-8 text-center" style={{ color: getCategoryInfo(el.category).color }}>
                    {el.symbol}
                  </span>
                  <span className="text-sm text-gray-200">{el.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">#{el.atomicNumber}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompareField = ({ label, valA, valB, unit = '' }) => {
  const fmtA = valA !== null && valA !== undefined ? `${valA}${unit ? ' ' + unit : ''}` : '—';
  const fmtB = valB !== null && valB !== undefined ? `${valB}${unit ? ' ' + unit : ''}` : '—';

  const numA = typeof valA === 'number' ? valA : null;
  const numB = typeof valB === 'number' ? valB : null;
  const higherA = numA !== null && numB !== null && numA > numB;
  const higherB = numA !== null && numB !== null && numB > numA;
  const maxVal = numA !== null && numB !== null ? Math.max(numA, numB) : null;
  const pctA = maxVal ? Math.round((numA / maxVal) * 100) : null;
  const pctB = maxVal ? Math.round((numB / maxVal) * 100) : null;

  return (
    <div className="py-2 border-b border-white/5 last:border-0">
      <p className="text-[9px] text-gray-600 uppercase tracking-widest mb-1 text-center">{label}</p>
      <div className="grid grid-cols-[1fr_1fr] gap-2">
        {/* A side */}
        <div className="text-right">
          <span className={`text-xs font-medium ${higherA ? 'text-green-400' : 'text-gray-300'}`}>{fmtA}</span>
          {pctA !== null && (
            <div className="mt-1 flex justify-end">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden" style={{ width: '100%' }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pctA}%`,
                    background: higherA ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.2)',
                    marginLeft: 'auto',
                    float: 'right',
                  }}
                />
              </div>
            </div>
          )}
        </div>
        {/* B side */}
        <div className="text-left">
          <span className={`text-xs font-medium ${higherB ? 'text-green-400' : 'text-gray-300'}`}>{fmtB}</span>
          {pctB !== null && (
            <div className="mt-1">
              <div className="h-1 rounded-full bg-white/10 overflow-hidden w-full">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pctB}%`,
                    background: higherB ? 'linear-gradient(90deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.2)',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CompareElements = ({ initialElement, onClose }) => {
  const [elementA, setElementA] = useState(initialElement || null);
  const [elementB, setElementB] = useState(null);

  const insights = useMemo(() => {
    if (!elementA || !elementB) return [];
    const msgs = [];
    if (elementA.group !== null && elementB.group !== null) {
      if (elementA.group === elementB.group) msgs.push(`Both are in Group ${elementA.group}.`);
      else msgs.push(`${elementA.name} is in Group ${elementA.group}, ${elementB.name} is in Group ${elementB.group}.`);
    }
    if (elementA.period === elementB.period) msgs.push(`Both are in Period ${elementA.period}.`);
    if (elementA.category === elementB.category) msgs.push(`Both are classified as ${elementA.category}.`);
    if (elementA.electronegativity !== null && elementB.electronegativity !== null) {
      const higher = elementA.electronegativity > elementB.electronegativity ? elementA.name : elementB.name;
      msgs.push(`${higher} has higher electronegativity.`);
    }
    if (elementA.atomicRadius !== null && elementB.atomicRadius !== null) {
      const larger = elementA.atomicRadius > elementB.atomicRadius ? elementA.name : elementB.name;
      msgs.push(`${larger} has a larger atomic radius.`);
    }
    if (elementA.ionizationEnergy !== null && elementB.ionizationEnergy !== null) {
      const higher = elementA.ionizationEnergy > elementB.ionizationEnergy ? elementA.name : elementB.name;
      msgs.push(`${higher} has higher first ionization energy.`);
    }
    return msgs;
  }, [elementA, elementB]);

  return (
    <div className="h-full flex flex-col">
      {/* Pickers */}
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        <SearchableElementPicker selected={elementA} onSelect={setElementA} placeholder="Search element A…" exclude={elementB} />
        <ArrowLeftRight size={16} className="text-gray-500" />
        <SearchableElementPicker selected={elementB} onSelect={setElementB} placeholder="Search element B…" exclude={elementA} />
      </div>

      {elementA && elementB ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4">
          {/* Atom diagrams */}
          <div className="grid grid-cols-2 gap-3">
            {[elementA, elementB].map(el => (
              <div key={el.atomicNumber} className="glass rounded-xl p-3 text-center">
                <div className="w-24 h-24 mx-auto"><ElectronShellDiagram element={el} /></div>
                <p className="text-sm font-bold mt-1" style={{ color: getCategoryInfo(el.category).color }}>{el.symbol}</p>
                <p className="text-xs text-gray-400">{el.name}</p>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="glass rounded-xl p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 mb-2">
              <p className="text-xs font-bold text-right pr-2" style={{ color: getCategoryInfo(elementA.category).color }}>{elementA.symbol}</p>
              <p className="text-[10px] text-gray-500 text-center">vs</p>
              <p className="text-xs font-bold pl-2" style={{ color: getCategoryInfo(elementB.category).color }}>{elementB.symbol}</p>
            </div>
            <CompareField label="Atomic Number" valA={elementA.atomicNumber} valB={elementB.atomicNumber} />
            <CompareField label="Atomic Mass (u)" valA={elementA.atomicMass} valB={elementB.atomicMass} />
            <CompareField label="Period" valA={elementA.period} valB={elementB.period} />
            <CompareField label="Group" valA={elementA.group} valB={elementB.group} />
            <CompareField label="Electronegativity" valA={elementA.electronegativity} valB={elementB.electronegativity} />
            <CompareField label="Atomic Radius (pm)" valA={elementA.atomicRadius} valB={elementB.atomicRadius} />
            <CompareField label="Ionization (kJ/mol)" valA={elementA.ionizationEnergy} valB={elementB.ionizationEnergy} />
            <CompareField label="Melting Point (K)" valA={elementA.meltingPoint} valB={elementB.meltingPoint} />
            <CompareField label="Boiling Point (K)" valA={elementA.boilingPoint} valB={elementB.boilingPoint} />
          </div>

          {/* Auto insights */}
          {insights.length > 0 && (
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-300 mb-2">Key Insights</p>
              <ul className="space-y-1.5">
                {insights.map((msg, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>{msg}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Select two elements to compare their properties.
        </div>
      )}
    </div>
  );
};
export default CompareElements;
