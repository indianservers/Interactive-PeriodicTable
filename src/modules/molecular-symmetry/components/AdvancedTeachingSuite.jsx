import { useEffect, useMemo, useState } from 'react';
import { Activity, Calculator, Grid3X3, Waves } from 'lucide-react';
import { getCharacterTable } from '../data/characterTables.js';
import {
  classifyVibrationalActivity,
  decomposeReducibleRepresentation,
  estimateReducibleCharacters,
  formatDecomposition,
  representativeForClass,
  vibrationalRepresentation,
} from '../utils/representationUtils.js';

const tabs = [
  { id: 'table', label: 'Character Table', icon: Grid3X3 },
  { id: 'reducible', label: 'Reducible Builder', icon: Calculator },
  { id: 'decompose', label: 'Irrep Decomposition', icon: Activity },
  { id: 'vibrations', label: 'Vibrational Modes', icon: Waves },
];

const basisOptions = [
  { id: 'atomSites', label: 'Atom site basis', description: 'Counts atoms left in place by each class representative.' },
  { id: 'sigmaBonds', label: 'Sigma bond basis', description: 'Counts bonds that transform into themselves.' },
  { id: 'cartesian3N', label: '3N displacement basis', description: 'Uses unchanged atoms times the Cartesian transformation trace.' },
];

const NumberInput = ({ value, onChange, label }) => (
  <label className="block">
    <span className="sr-only">{label}</span>
    <input
      type="number"
      step="0.1"
      value={value}
      onChange={event => onChange(Number(event.target.value))}
      className="w-16 rounded-md border border-white/10 bg-slate-950/70 px-2 py-1 text-center text-xs text-white"
      aria-label={label}
    />
  </label>
);

function CharacterTableView({ molecule, characterTable, selectedElement }) {
  const selectedClass = characterTable.classes.find(classInfo => {
    const representative = representativeForClass(molecule, classInfo);
    return representative?.id === selectedElement?.id;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Character Table Companion</p>
          <h3 className="text-lg font-black text-white">{characterTable.pointGroup}</h3>
          <p className="mt-1 text-xs text-gray-400">{characterTable.notes}</p>
        </div>
        {selectedClass && (
          <div className="rounded-lg border border-cyan-400/25 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
            Selected operation belongs to class <strong>{selectedClass.label}</strong>
          </div>
        )}
      </div>
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[680px] text-left text-xs">
          <thead className="bg-white/[0.05] text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="sticky left-0 bg-slate-950/95 px-3 py-2">Irrep</th>
              {characterTable.classes.map(classInfo => (
                <th key={classInfo.label} className={`px-3 py-2 text-center ${selectedClass?.label === classInfo.label ? 'bg-cyan-400/15 text-cyan-100' : ''}`}>
                  {classInfo.label}
                  <span className="ml-1 text-gray-600">({classInfo.size})</span>
                </th>
              ))}
              <th className="px-3 py-2">Common basis</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {characterTable.irreps.map(irrep => (
              <tr key={irrep.label} className="text-gray-300">
                <td className="sticky left-0 bg-slate-950/95 px-3 py-2 font-black text-white">{irrep.label}</td>
                {irrep.chars.map((character, index) => (
                  <td key={`${irrep.label}-${characterTable.classes[index].label}`} className={`px-3 py-2 text-center font-mono ${selectedClass?.label === characterTable.classes[index].label ? 'bg-cyan-400/10 text-cyan-100' : ''}`}>
                    {Number(character.toFixed ? character.toFixed(3).replace(/\.000$/, '') : character)}
                  </td>
                ))}
                <td className="px-3 py-2 text-gray-400">{irrep.basis || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReducibleBuilderView({ molecule, characterTable, characters, setCharacters, basisType, setBasisType }) {
  const autoCharacters = useMemo(() => estimateReducibleCharacters(molecule, characterTable, basisType), [molecule, characterTable, basisType]);
  const applyAuto = () => setCharacters(autoCharacters);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reducible Representation Builder</p>
          <h3 className="text-lg font-black text-white">Build Gamma from a molecular basis</h3>
          <p className="mt-1 text-xs text-gray-400">Choose a basis, inspect the automatically estimated characters, then edit any class value for a classroom exercise.</p>
        </div>
        <button onClick={applyAuto} className="btn-primary text-xs">Use estimated Gamma</button>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        {basisOptions.map(option => (
          <button
            key={option.id}
            onClick={() => {
              setBasisType(option.id);
              setCharacters(estimateReducibleCharacters(molecule, characterTable, option.id));
            }}
            className={`rounded-lg border p-3 text-left transition-colors ${basisType === option.id ? 'border-cyan-400/40 bg-cyan-400/10' : 'border-white/10 bg-white/[0.035] hover:bg-white/[0.07]'}`}
          >
            <p className="text-xs font-bold text-white">{option.label}</p>
            <p className="mt-1 text-[11px] leading-4 text-gray-500">{option.description}</p>
          </button>
        ))}
      </div>
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-xs">
          <thead className="bg-white/[0.05] text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Class</th>
              {characterTable.classes.map(classInfo => <th key={classInfo.label} className="px-3 py-2 text-center">{classInfo.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            <tr>
              <td className="px-3 py-2 font-bold text-gray-300">Gamma</td>
              {characters.map((value, index) => (
                <td key={characterTable.classes[index].label} className="px-3 py-2 text-center">
                  <NumberInput
                    value={value}
                    label={`Gamma character for ${characterTable.classes[index].label}`}
                    onChange={next => setCharacters(current => current.map((item, itemIndex) => itemIndex === index ? next : item))}
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="px-3 py-2 font-bold text-gray-500">Auto estimate</td>
              {autoCharacters.map((value, index) => (
                <td key={characterTable.classes[index].label} className="px-3 py-2 text-center font-mono text-gray-500">{value}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DecompositionView({ characterTable, characters }) {
  const decomposition = useMemo(() => decomposeReducibleRepresentation(characters, characterTable), [characters, characterTable]);
  const formula = formatDecomposition(decomposition);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Irreducible Representation Decomposition</p>
        <h3 className="text-lg font-black text-white">Gamma = {formula}</h3>
        <p className="mt-1 text-xs text-gray-400">Coefficients use ai = 1/h sum over classes ni chi(Gamma) chi(irrep).</p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {decomposition.map(part => (
          <div key={part.label} className={`rounded-lg border p-3 ${part.coefficient > 0 ? 'border-emerald-400/25 bg-emerald-400/10' : 'border-white/10 bg-white/[0.025]'}`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">{part.label}</span>
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs font-mono text-gray-200">{part.coefficient}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-gray-500">{part.basis || 'No common basis listed'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VibrationalModesView({ molecule, characterTable }) {
  const vib = useMemo(() => vibrationalRepresentation(molecule, characterTable), [molecule, characterTable]);
  const activity = classifyVibrationalActivity(vib.decomposition);

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Vibrational Mode Symmetry</p>
        <h3 className="text-lg font-black text-white">Gamma vib = {formatDecomposition(vib.decomposition)}</h3>
        <p className="mt-1 text-xs text-gray-400">Estimated from Gamma 3N minus translations and rotations. Use this as a teaching bridge to full normal-mode analysis.</p>
      </div>
      <div className="overflow-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[620px] text-xs">
          <thead className="bg-white/[0.05] text-[10px] uppercase tracking-widest text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Representation</th>
              {characterTable.classes.map(classInfo => <th key={classInfo.label} className="px-3 py-2 text-center">{classInfo.label}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-gray-300">
            {[
              ['Gamma 3N', vib.gamma3N],
              ['Translations', vib.translations],
              ['Rotations', vib.rotations],
              ['Gamma vib', vib.gammaVib],
            ].map(([label, row]) => (
              <tr key={label}>
                <td className="px-3 py-2 font-bold">{label}</td>
                {row.map((value, index) => <td key={`${label}-${index}`} className="px-3 py-2 text-center font-mono">{Number(value.toFixed ? value.toFixed(3).replace(/\.000$/, '') : value)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        {activity.map(part => (
          <div key={part.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white">{part.coefficient} {part.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${part.irActive ? 'bg-cyan-400/15 text-cyan-100' : part.ramanActive ? 'bg-violet-400/15 text-violet-100' : 'bg-white/10 text-gray-300'}`}>
                {part.activity}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-gray-500">Basis: {part.basis || 'not listed'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdvancedTeachingSuite({ molecule, selectedElement }) {
  const [activeTab, setActiveTab] = useState('table');
  const [basisType, setBasisType] = useState('atomSites');
  const characterTable = useMemo(() => getCharacterTable(molecule.pointGroup), [molecule.pointGroup]);
  const [characters, setCharacters] = useState(() => estimateReducibleCharacters(molecule, characterTable, 'atomSites'));

  useEffect(() => {
    setBasisType('atomSites');
    setCharacters(estimateReducibleCharacters(molecule, characterTable, 'atomSites'));
  }, [molecule, characterTable]);

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">Advanced Teaching Suite</p>
          <h2 className="text-base font-black text-white">Character tables, representations, and vibrational symmetry</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${activeTab === tab.id ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-100' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-white'}`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-4">
        {activeTab === 'table' && <CharacterTableView molecule={molecule} characterTable={characterTable} selectedElement={selectedElement} />}
        {activeTab === 'reducible' && (
          <ReducibleBuilderView
            molecule={molecule}
            characterTable={characterTable}
            characters={characters}
            setCharacters={setCharacters}
            basisType={basisType}
            setBasisType={setBasisType}
          />
        )}
        {activeTab === 'decompose' && <DecompositionView characterTable={characterTable} characters={characters} />}
        {activeTab === 'vibrations' && <VibrationalModesView molecule={molecule} characterTable={characterTable} />}
      </div>
    </section>
  );
}

export default AdvancedTeachingSuite;
