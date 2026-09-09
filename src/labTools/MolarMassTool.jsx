import { LabToolFrame, ControlLabel } from './LabToolFrame.jsx';
import { commonPolyatomicIons, normalizeFormulaText } from '../utils/chemistryTools.js';
import { useMemo, useState } from 'react';

export default function MolarMassTool({ title, formulaInput, setFormulaInput, formulaSuggestions, parsed, mass }) {
  const [ionQuery, setIonQuery] = useState('');
  const ionRows = useMemo(() => {
    const q = ionQuery.trim().toLowerCase();
    return commonPolyatomicIons.filter(ion =>
      !q ||
      ion.name.toLowerCase().includes(q) ||
      ion.formula.toLowerCase().includes(q) ||
      ion.examples.join(' ').toLowerCase().includes(q)
    );
  }, [ionQuery]);

  return (
    <LabToolFrame title={title} result={`Molar mass = ${mass.toFixed(3)} g/mol`}>
      <ControlLabel>Formula</ControlLabel>
      <input value={formulaInput} onChange={e => setFormulaInput(e.target.value)} className="input text-sm mb-3" />
      {formulaSuggestions.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {formulaSuggestions.map(molecule => (
            <button
              key={molecule.name}
              onClick={() => setFormulaInput(normalizeFormulaText(molecule.formula))}
              className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100"
            >
              {molecule.name} ({normalizeFormulaText(molecule.formula)})
            </button>
          ))}
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500 uppercase">Atoms</p><p className="text-sm text-gray-200 font-mono mt-1">{Object.entries(parsed).map(([s, n]) => `${s}:${n}`).join('  ') || 'None'}</p></div>
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500 uppercase">Molar mass</p><p className="text-2xl font-black text-white">{mass.toFixed(3)}</p></div>
      </div>
      <div className="mt-4 rounded-2xl bg-white/[0.035] border border-white/10 p-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
          <div>
            <p className="text-xs font-bold text-white">Polyatomic Ion Quick Reference</p>
            <p className="text-[10px] text-gray-500">Search by ion, charge, or common compound.</p>
          </div>
          <input
            value={ionQuery}
            onChange={event => setIonQuery(event.target.value)}
            placeholder="Search sulfate, NO3, ammonium..."
            className="input text-xs sm:ml-auto sm:max-w-xs"
          />
        </div>
        <div className="max-h-64 overflow-y-auto scrollbar-thin rounded-xl border border-white/10">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-950/95 text-gray-500">
              <tr>
                <th className="text-left p-2">Ion</th>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Charge</th>
                <th className="text-left p-2">Examples</th>
              </tr>
            </thead>
            <tbody>
              {ionRows.map(ion => (
                <tr key={ion.formula} className="border-t border-white/5 text-gray-300">
                  <td className="p-2 font-mono text-cyan-200">{ion.formula}</td>
                  <td className="p-2">{ion.name}</td>
                  <td className="p-2 font-mono">{ion.charge}</td>
                  <td className="p-2 font-mono text-gray-400">{ion.examples.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </LabToolFrame>
  );
}
