import { useMemo, useState } from 'react';
import {
  Atom, BadgeCheck, BarChart3, Box, Brain, CheckCircle2, Factory, FlaskConical,
  GraduationCap, Layers3, Microscope, Orbit, Radiation, Sparkles, Trees, Wand2,
} from 'lucide-react';
import {
  advancedVisualDomains,
  advancedVisualModules,
  advancedVisualStats,
  getAdvancedVisualModules,
} from '../data/advancedVisualChemistry.js';

const domainIcons = {
  mechanisms: Wand2,
  analytical: Microscope,
  industrial: Factory,
  materials: Box,
  environment: Trees,
  nuclear: Radiation,
};

const Preview = ({ domain }) => {
  if (domain === 'industrial') {
    return (
      <svg viewBox="0 0 380 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        <rect x="34" y="110" width="60" height="58" rx="10" fill="#38bdf855" stroke="#67e8f9" strokeWidth="3" />
        <rect x="160" y="70" width="70" height="98" rx="14" fill="#f59e0b55" stroke="#fcd34d" strokeWidth="3" />
        <rect x="290" y="104" width="50" height="64" rx="10" fill="#22c55e55" stroke="#86efac" strokeWidth="3" />
        <path d="M94 138 H160 M230 118 H290" stroke="#e2e8f0" strokeWidth="5" markerEnd="url(#flow)" />
        <defs><marker id="flow" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#e2e8f0" /></marker></defs>
        <text x="38" y="191" fill="#cbd5e1" fontSize="13">Reactants</text>
        <text x="162" y="191" fill="#cbd5e1" fontSize="13">Catalyst/process</text>
        <text x="286" y="191" fill="#cbd5e1" fontSize="13">Product</text>
      </svg>
    );
  }

  if (domain === 'nuclear') {
    return (
      <svg viewBox="0 0 380 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        {Array.from({ length: 20 }, (_, index) => (
          <circle key={index} cx={120 + (index % 5) * 18} cy={74 + Math.floor(index / 5) * 18} r="8" fill={index % 2 ? '#38bdf8' : '#fb7185'} />
        ))}
        <path d="M226 104 H292" stroke="#facc15" strokeWidth="5" markerEnd="url(#decay)" />
        <defs><marker id="decay" markerWidth="9" markerHeight="9" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#facc15" /></marker></defs>
        <circle cx="320" cy="104" r="28" fill="#a78bfa" />
        <text x="42" y="184" fill="#cbd5e1" fontSize="13">Nucleus decay, isotope change and half-life curve</text>
      </svg>
    );
  }

  if (domain === 'analytical') {
    return (
      <svg viewBox="0 0 380 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        <line x1="34" y1="168" x2="338" y2="168" stroke="#64748b" />
        <line x1="34" y1="38" x2="34" y2="168" stroke="#64748b" />
        {[62, 112, 172, 248, 304].map((x, index) => (
          <rect key={x} x={x} y={70 + index * 10} width="14" height={98 - index * 13} fill={['#38bdf8', '#22c55e', '#facc15', '#fb7185', '#a78bfa'][index]} />
        ))}
        <polyline points="36,160 72,150 118,128 168,112 216,84 292,52 336,46" fill="none" stroke="#f8fafc" strokeWidth="3" />
        <text x="62" y="190" fill="#cbd5e1" fontSize="13">Spectrum + calibration + chromatogram preview</text>
      </svg>
    );
  }

  if (domain === 'environment') {
    return (
      <svg viewBox="0 0 380 210" className="h-64 w-full rounded-2xl border border-white/10 bg-black/20">
        <circle cx="86" cy="78" r="28" fill="#facc15" />
        <path d="M34 150 C94 106 118 186 180 138 S286 112 344 150" fill="none" stroke="#38bdf8" strokeWidth="5" />
        {['NOx', 'SO2', 'O3', 'CO2'].map((label, index) => (
          <g key={label}>
            <circle cx={158 + index * 44} cy={74 + (index % 2) * 30} r="20" fill="#14b8a655" stroke="#5eead4" />
            <text x={158 + index * 44} y={79 + (index % 2) * 30} textAnchor="middle" fontSize="12" fill="#ccfbf1" fontWeight="900">{label}</text>
          </g>
        ))}
        <text x="70" y="190" fill="#cbd5e1" fontSize="13">Air, water and pollutant transformation model</text>
      </svg>
    );
  }

  return (
    <div className="relative h-64 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      {Array.from({ length: 18 }, (_, index) => (
        <span
          key={index}
          className="absolute grid h-9 w-9 place-items-center rounded-full border border-cyan-200/20 bg-cyan-300/20 text-xs font-black text-cyan-50"
          style={{ left: `${8 + (index % 6) * 14}%`, top: `${14 + Math.floor(index / 6) * 25}%` }}
        >
          {index % 4 === 0 ? 'C' : index % 4 === 1 ? 'O' : index % 4 === 2 ? 'N' : 'H'}
        </span>
      ))}
      <div className="absolute bottom-4 left-4 rounded-xl border border-white/10 bg-black/45 px-3 py-2 text-xs font-bold text-gray-200">3D molecule/material preview</div>
    </div>
  );
};

export const AdvancedVisualChemistryPage = ({ onNavigate }) => {
  const [activeDomain, setActiveDomain] = useState('mechanisms');
  const [activeModuleId, setActiveModuleId] = useState('mechanism-theater');
  const modules = useMemo(() => getAdvancedVisualModules(activeDomain), [activeDomain]);
  const activeModule = modules.find(module => module.id === activeModuleId) || modules[0] || advancedVisualModules[0];

  const selectDomain = (domainId) => {
    const next = getAdvancedVisualModules(domainId);
    setActiveDomain(domainId);
    setActiveModuleId(next[0]?.id || activeModuleId);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950/45 to-emerald-950/35 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <GraduationCap size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Advanced Visual Chemistry</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              High-impact visual modules for mechanisms, analytical chemistry, industry, materials, environment, nuclear chemistry and bio-medicinal structures.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-white">{advancedVisualStats.modules}</p>
              <p className="text-[10px] text-gray-500">modules</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-cyan-100">{advancedVisualStats.concepts}</p>
              <p className="text-[10px] text-gray-500">concepts</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-emerald-100">{advancedVisualStats.visualTasks}</p>
              <p className="text-[10px] text-gray-500">tasks</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2">
              <p className="text-lg font-black text-amber-100">{advancedVisualStats.roadmapItems}</p>
              <p className="text-[10px] text-gray-500">next builds</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[285px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Orbit size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Advanced Domains</h3>
          </div>
          <div className="space-y-2">
            {advancedVisualDomains.map(domain => {
              const Icon = domainIcons[domain.id] || Sparkles;
              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={() => selectDomain(domain.id)}
                  className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-black transition-colors ${
                    activeDomain === domain.id ? 'border-white/20 bg-white/[0.09] text-white' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Icon size={15} style={{ color: domain.color }} />
                  {domain.label}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{activeDomain}</p>
                <h3 className="mt-1 text-lg font-black text-white">Advanced module stack</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {modules.map(module => (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => setActiveModuleId(module.id)}
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${
                      activeModule.id === module.id ? 'border-cyan-300/40 bg-cyan-300/15 text-cyan-50' : 'border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {module.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.95fr]">
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">{activeModule.level}</span>
                    <span className="rounded-full border border-white/10 bg-black/15 px-2 py-0.5 text-[10px] font-bold text-gray-300">{activeModule.domain}</span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{activeModule.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">{activeModule.summary}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onNavigate?.(activeModule.twoDRoute)} className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15">
                    <Box size={14} /> 2D
                  </button>
                  <button type="button" onClick={() => onNavigate?.(activeModule.threeDRoute)} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15">
                    <Layers3 size={14} /> 3D
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <Brain size={14} className="text-cyan-200" />
                    <p className="text-xs font-black text-white">Concepts</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeModule.concepts.map(concept => (
                      <span key={concept} className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-bold text-gray-300">{concept}</span>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <BadgeCheck size={14} className="text-amber-200" />
                    <p className="text-xs font-black text-white">Build Next</p>
                  </div>
                  <div className="space-y-1.5">
                    {activeModule.buildNext.map(item => (
                      <p key={item} className="rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] font-bold text-gray-300">{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">Visual System Preview</h3>
              </div>
              <Preview domain={activeModule.domain} />
            </div>
          </section>

          <section className="glass rounded-2xl p-4">
            <div className="mb-3 flex items-center gap-2">
              <Layers3 size={16} className="text-emerald-300" />
              <h3 className="text-sm font-bold text-white">Visual Tasks</h3>
            </div>
            <div className="grid gap-2 lg:grid-cols-3">
              {activeModule.visualTasks.map(task => (
                <p key={task} className="flex gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2 text-xs text-gray-300">
                  <CheckCircle2 size={13} className="mt-0.5 shrink-0 text-emerald-300" />{task}
                </p>
              ))}
            </div>
          </section>
        </main>
      </section>
    </div>
  );
};

export default AdvancedVisualChemistryPage;
