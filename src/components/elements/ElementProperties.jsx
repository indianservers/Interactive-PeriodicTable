import { useMemo, useState } from 'react';
import { Copy } from 'lucide-react';
import { elements } from '../../data/elements.js';
import { formatValue, formatTemperature, formatDensity, formatYear } from '../../utils/formatters.js';

const inferOxidationStates = (element) => {
  const symbolMap = {
    H: [1, -1], O: [-2, -1], F: [-1], Cl: [-1, 1, 3, 5, 7], Br: [-1, 1, 3, 5], I: [-1, 1, 5, 7],
    N: [-3, 3, 5], P: [-3, 3, 5], S: [-2, 4, 6], C: [-4, 2, 4], Si: [-4, 4],
    Fe: [2, 3], Cu: [1, 2], Sn: [2, 4], Pb: [2, 4], Hg: [1, 2], Cr: [2, 3, 6], Mn: [2, 4, 7],
    Co: [2, 3], Ni: [2, 3], Ag: [1], Zn: [2], Al: [3],
  };
  if (symbolMap[element.symbol]) return symbolMap[element.symbol];
  if (element.group === 1) return [1];
  if (element.group === 2) return [2];
  if (element.group === 13) return [3];
  if (element.group === 14) return [4, -4];
  if (element.group === 15) return [-3, 3, 5];
  if (element.group === 16) return [-2, 4, 6];
  if (element.group === 17) return [-1, 1, 5, 7];
  if (element.group === 18) return [0];
  if (element.category === 'transition metal') return [2, 3];
  if (element.category === 'lanthanide' || element.category === 'actinide') return [3];
  return [];
};

const percentile = (element, key) => {
  const value = Number(element[key]);
  if (!Number.isFinite(value)) return null;
  const values = elements.map(el => Number(el[key])).filter(Number.isFinite).sort((a, b) => a - b);
  const lower = values.filter(v => v <= value).length;
  return Math.round((lower / values.length) * 100);
};

const ComparisonBar = ({ element, label, field, value, unit }) => {
  const pct = percentile(element, field);
  if (pct === null) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-gray-300">{label}</span>
        <span className="text-gray-400">{value} {unit}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/30">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-gray-500">Higher than {Math.max(0, pct - 1)}% of elements with data.</p>
    </div>
  );
};

const CopyableRow = ({ label, value, onCopy }) => (
  <button onClick={() => onCopy(label, value)} disabled={!value} className="property-row w-full text-left transition-colors hover:bg-white/[0.03] disabled:cursor-default disabled:hover:bg-transparent">
    <span className="flex items-center gap-1.5 text-xs text-gray-500">{label}{value && <Copy size={11} />}</span>
    <span className="text-xs text-gray-200 text-right max-w-[55%]">{value || 'Data not available'}</span>
  </button>
);

export const ElementProperties = ({ element }) => {
  const [copied, setCopied] = useState('');
  const oxidationStates = useMemo(() => inferOxidationStates(element), [element]);
  const copyValue = async (label, value) => {
    if (!value || !navigator.clipboard) return;
    await navigator.clipboard.writeText(String(value));
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1200);
  };

  return (
    <div className="space-y-0">
      {copied && (
        <div className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200">
          Copied {copied}
        </div>
      )}

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">At a Glance</p>
      <div className="mb-4 space-y-2">
        <ComparisonBar element={element} label="Electronegativity" field="electronegativity" value={element.electronegativity ?? 'n/a'} unit="Pauling" />
        <ComparisonBar element={element} label="Atomic radius" field="atomicRadius" value={element.atomicRadius ?? 'n/a'} unit="pm" />
        <ComparisonBar element={element} label="Ionization energy" field="ionizationEnergy" value={element.ionizationEnergy ?? 'n/a'} unit="kJ/mol" />
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Atomic Structure</p>
      <CopyableRow label="Atomic Mass" value={element.atomicMass ? `${element.atomicMass} u` : null} onCopy={copyValue} />
      <CopyableRow label="Electron Config." value={element.electronConfiguration} onCopy={copyValue} />
      <CopyableRow label="Shell Distribution" value={element.shells ? `[${element.shells.join(', ')}]` : null} onCopy={copyValue} />
      <CopyableRow label="Block" value={element.block ? `${element.block}-block` : null} onCopy={copyValue} />

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Chemical Properties</p>
      <div className="property-row">
        <span className="text-xs text-gray-500">Oxidation States</span>
        <span className="flex max-w-[60%] flex-wrap justify-end gap-1">
          {oxidationStates.length ? oxidationStates.map(state => (
            <span key={state} className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${state < 0 ? 'bg-red-500/15 text-red-200' : state === 0 ? 'bg-gray-500/15 text-gray-200' : 'bg-blue-500/15 text-blue-200'}`}>
              {state > 0 ? `+${state}` : state}
            </span>
          )) : <span className="text-xs text-gray-400">Data not available</span>}
        </span>
      </div>
      <CopyableRow label="Electronegativity" value={element.electronegativity !== null ? formatValue(element.electronegativity, '(Pauling)') : null} onCopy={copyValue} />
      <CopyableRow label="Ionization Energy" value={element.ionizationEnergy !== null ? formatValue(element.ionizationEnergy, 'kJ/mol') : null} onCopy={copyValue} />

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Physical Properties</p>
      <CopyableRow label="Phase (STP)" value={element.phase} onCopy={copyValue} />
      <CopyableRow label="Density" value={element.density !== null && element.density !== undefined ? formatDensity(element.density) : null} onCopy={copyValue} />
      <CopyableRow label="Melting Point" value={element.meltingPoint !== null ? formatTemperature(element.meltingPoint) : null} onCopy={copyValue} />
      <CopyableRow label="Boiling Point" value={element.boilingPoint !== null ? formatTemperature(element.boilingPoint) : null} onCopy={copyValue} />
      <CopyableRow label="Atomic Radius" value={element.atomicRadius !== null ? formatValue(element.atomicRadius, 'pm') : null} onCopy={copyValue} />

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4 mb-2">Discovery</p>
      <CopyableRow label="Discovered By" value={element.discoveredBy} onCopy={copyValue} />
      <CopyableRow label="Year Discovered" value={formatYear(element.yearDiscovered)} onCopy={copyValue} />
    </div>
  );
};
export default ElementProperties;
