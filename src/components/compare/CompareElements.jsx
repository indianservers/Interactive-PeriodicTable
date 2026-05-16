import { useState, useMemo } from 'react';
import { Search, ArrowLeftRight, X, Info, Atom, Thermometer, TrendingUp, History, Sparkles, Layers } from 'lucide-react';
import { elements } from '../../data/elements.js';
import { getCategoryInfo } from '../../data/categories.js';
import { formatValue, formatTemperature, formatDensity, formatYear } from '../../utils/formatters.js';
import { ElectronShellDiagram } from '../visualizers/ElectronShellDiagram.jsx';

const unavailable = 'Data not available';

const formatArray = (value) => {
  if (!value || value.length === 0) return unavailable;
  return value.join(', ');
};

const formatShells = (value) => {
  if (!value || value.length === 0) return unavailable;
  return value.join(' - ');
};

const compareText = (a, b) => {
  if (a === b && a !== null && a !== undefined) return 'Same';
  return null;
};

const comparisonGroups = [
  {
    title: 'Identity',
    icon: Info,
    fields: [
      ['Name', el => el.name],
      ['Symbol', el => el.symbol],
      ['Atomic Number', el => el.atomicNumber],
      ['Atomic Mass', el => formatValue(el.atomicMass, 'u'), el => el.atomicMass],
      ['Category', el => el.category],
      ['Phase at STP', el => el.phase],
    ],
  },
  {
    title: 'Periodic Table Position',
    icon: Layers,
    fields: [
      ['Group', el => formatValue(el.group), el => el.group],
      ['Period', el => el.period, el => el.period],
      ['Block', el => `${el.block}-block`],
      ['Table X Position', el => el.xpos, el => el.xpos],
      ['Table Y Position', el => el.ypos, el => el.ypos],
    ],
  },
  {
    title: 'Electron Structure',
    icon: Atom,
    fields: [
      ['Electron Configuration', el => el.electronConfiguration],
      ['Shell Distribution', el => formatShells(el.shells)],
      ['Shell Count', el => el.shells?.length ?? unavailable, el => el.shells?.length],
      ['Valence Electrons', el => el.shells?.at(-1) ?? unavailable, el => el.shells?.at(-1)],
      ['Total Shell Electrons', el => el.shells?.reduce((sum, n) => sum + n, 0) ?? unavailable, el => el.shells?.reduce((sum, n) => sum + n, 0)],
    ],
  },
  {
    title: 'Physical Properties',
    icon: Thermometer,
    fields: [
      ['Density', el => formatDensity(el.density), el => el.density],
      ['Melting Point', el => formatTemperature(el.meltingPoint), el => el.meltingPoint],
      ['Boiling Point', el => formatTemperature(el.boilingPoint), el => el.boilingPoint],
    ],
  },
  {
    title: 'Periodic Properties',
    icon: TrendingUp,
    fields: [
      ['Electronegativity', el => formatValue(el.electronegativity), el => el.electronegativity],
      ['Ionization Energy', el => formatValue(el.ionizationEnergy, 'kJ/mol'), el => el.ionizationEnergy],
      ['Atomic Radius', el => formatValue(el.atomicRadius, 'pm'), el => el.atomicRadius],
    ],
  },
  {
    title: 'Discovery',
    icon: History,
    fields: [
      ['Discovered By', el => el.discoveredBy || unavailable],
      ['Year Discovered', el => formatYear(el.yearDiscovered), el => el.yearDiscovered],
    ],
  },
  {
    title: 'Uses and Notes',
    icon: Sparkles,
    fields: [
      ['Common Uses', el => formatArray(el.commonUses)],
      ['Summary', el => el.summary || unavailable],
    ],
  },
];

const SearchableElementPicker = ({ selected, onSelect, placeholder, exclude }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const source = elements.filter(e => e.atomicNumber !== exclude?.atomicNumber);
    if (!q) return source;
    return source.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.symbol.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.phase.toLowerCase().includes(q) ||
      e.block.toLowerCase().includes(q) ||
      String(e.atomicNumber).includes(q)
    );
  }, [query, exclude]);

  const pick = (el) => {
    onSelect(el);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="relative">
      {selected ? (
        <div className="flex items-center gap-2 p-3 glass rounded-xl border border-white/10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg"
            style={{ backgroundColor: `${getCategoryInfo(selected.category).color}20`, color: getCategoryInfo(selected.category).color }}
          >
            {selected.symbol}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{selected.name}</p>
            <p className="text-xs text-gray-400">#{selected.atomicNumber} - {selected.category}</p>
          </div>
          <button onClick={() => onSelect(null)} className="p-1 rounded-lg hover:bg-white/10 text-gray-400" aria-label={`Clear ${selected.name}`}>
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
          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-gray-900 border border-white/10 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto scrollbar-thin">
              {results.length > 0 ? results.map(el => (
                <button
                  key={el.atomicNumber}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => pick(el)}
                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-white/5 transition-colors"
                >
                  <span className="text-sm font-bold w-8 text-center" style={{ color: getCategoryInfo(el.category).color }}>
                    {el.symbol}
                  </span>
                  <span className="text-sm text-gray-200">{el.name}</span>
                  <span className="text-[10px] text-gray-500 truncate">{el.category}</span>
                  <span className="text-xs text-gray-500 ml-auto">#{el.atomicNumber}</span>
                </button>
              )) : (
                <p className="px-3 py-4 text-sm text-gray-500 text-center">No matching elements.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const CompareField = ({ label, elementA, elementB, getDisplay, getNumeric }) => {
  const displayA = getDisplay(elementA);
  const displayB = getDisplay(elementB);
  const rawA = getNumeric ? getNumeric(elementA) : null;
  const rawB = getNumeric ? getNumeric(elementB) : null;
  const numA = typeof rawA === 'number' ? rawA : null;
  const numB = typeof rawB === 'number' ? rawB : null;
  const higherA = numA !== null && numB !== null && numA > numB;
  const higherB = numA !== null && numB !== null && numB > numA;
  const maxVal = numA !== null && numB !== null ? Math.max(Math.abs(numA), Math.abs(numB)) : null;
  const pctA = maxVal ? Math.round((Math.abs(numA) / maxVal) * 100) : null;
  const pctB = maxVal ? Math.round((Math.abs(numB) / maxVal) * 100) : null;
  const sameText = compareText(displayA, displayB);

  return (
    <div className="py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{label}</p>
        {sameText && <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">{sameText}</span>}
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <p className={`text-xs leading-relaxed break-words ${higherA ? 'text-green-300 font-semibold' : 'text-gray-300'}`}>{displayA}</p>
          {pctA !== null && (
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-indigo-400" style={{ width: `${pctA}%`, opacity: higherA ? 1 : 0.45 }} />
            </div>
          )}
        </div>
        <div>
          <p className={`text-xs leading-relaxed break-words ${higherB ? 'text-green-300 font-semibold' : 'text-gray-300'}`}>{displayB}</p>
          {pctB !== null && (
            <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-violet-400" style={{ width: `${pctB}%`, opacity: higherB ? 1 : 0.45 }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ComparisonGroup = ({ group, elementA, elementB }) => {
  const Icon = group.icon;
  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className="text-cyan-300" />
        <h3 className="text-sm font-bold text-white">{group.title}</h3>
      </div>
      {group.fields.map(([label, getDisplay, getNumeric]) => (
        <CompareField
          key={`${group.title}-${label}`}
          label={label}
          elementA={elementA}
          elementB={elementB}
          getDisplay={getDisplay}
          getNumeric={getNumeric}
        />
      ))}
    </div>
  );
};

export const CompareElements = ({ initialElement }) => {
  const [elementA, setElementA] = useState(initialElement || null);
  const [elementB, setElementB] = useState(null);

  const insights = useMemo(() => {
    if (!elementA || !elementB) return [];
    const msgs = [];
    if (elementA.group !== null && elementB.group !== null) {
      if (elementA.group === elementB.group) msgs.push(`Both are in Group ${elementA.group}.`);
      else msgs.push(`${elementA.name} is in Group ${elementA.group}, while ${elementB.name} is in Group ${elementB.group}.`);
    }
    if (elementA.period === elementB.period) msgs.push(`Both are in Period ${elementA.period}.`);
    if (elementA.block === elementB.block) msgs.push(`Both are ${elementA.block}-block elements.`);
    if (elementA.category === elementB.category) msgs.push(`Both are classified as ${elementA.category}.`);
    if (elementA.phase === elementB.phase) msgs.push(`Both are ${elementA.phase.toLowerCase()} at standard conditions.`);
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
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        <SearchableElementPicker selected={elementA} onSelect={setElementA} placeholder="Search any element for A" exclude={elementB} />
        <ArrowLeftRight size={16} className="text-gray-500" />
        <SearchableElementPicker selected={elementB} onSelect={setElementB} placeholder="Search any element for B" exclude={elementA} />
      </div>

      {elementA && elementB ? (
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-1">
          <div className="grid grid-cols-2 gap-3">
            {[elementA, elementB].map(el => (
              <div key={el.atomicNumber} className="glass rounded-xl p-3 text-center">
                <div className="w-24 h-24 mx-auto"><ElectronShellDiagram element={el} /></div>
                <p className="text-sm font-bold mt-1" style={{ color: getCategoryInfo(el.category).color }}>{el.symbol}</p>
                <p className="text-xs text-gray-400">{el.name}</p>
                <p className="text-[10px] text-gray-500 mt-1">#{el.atomicNumber} - {el.category}</p>
              </div>
            ))}
          </div>

          {insights.length > 0 && (
            <div className="glass rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-300 mb-2">Key Insights</p>
              <ul className="space-y-1.5">
                {insights.map((msg, i) => (
                  <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">-</span>{msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass rounded-xl p-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2">
              <p className="text-xs font-bold text-right pr-2" style={{ color: getCategoryInfo(elementA.category).color }}>{elementA.name}</p>
              <p className="text-[10px] text-gray-500 text-center">vs</p>
              <p className="text-xs font-bold pl-2" style={{ color: getCategoryInfo(elementB.category).color }}>{elementB.name}</p>
            </div>
            <p className="text-[10px] text-gray-600 text-center mt-1">Showing every available comparison field from the local element dataset.</p>
          </div>

          {comparisonGroups.map(group => (
            <ComparisonGroup key={group.title} group={group} elementA={elementA} elementB={elementB} />
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
          Select two elements to compare all available properties.
        </div>
      )}
    </div>
  );
};

export default CompareElements;
