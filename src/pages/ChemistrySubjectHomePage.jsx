import { ArrowLeft, ArrowUpRight, BookOpen, FlaskConical, Home, Rocket, Sparkles } from 'lucide-react';
import { chemistryCategories, libraryEntries } from '../data/homeLibrary.js';

const subjectConfig = {
  'physical-chemistry': { category: 'simulators', title: 'Physical Chemistry', subtitle: 'Understand matter through motion, energy, equilibrium and measurement.', accent: '#45d8ff', icon: FlaskConical, intro: 'Explore simulations and laboratory experiences that connect microscopic models with measurable physical properties.' },
  'organic-chemistry': { category: 'organic', title: 'Organic Chemistry', subtitle: 'Build structures. Follow mechanisms. Design transformations.', accent: '#e28cff', icon: Sparkles, intro: 'Move from functional groups and isomerism to mechanisms, synthesis, polymers and spectroscopy.' },
  'inorganic-chemistry': { category: 'inorganic', title: 'Inorganic Chemistry', subtitle: 'Explore elements, complexes, crystals and materials.', accent: '#6baaff', icon: FlaskConical, intro: 'Study coordination chemistry, crystal structures, salt analysis, metallurgy and periodic trends.' },
  'analytical-chemistry': { category: 'analytical', title: 'Analytical Chemistry', subtitle: 'Measure, separate, identify and explain chemical evidence.', accent: '#f4b860', icon: FlaskConical, intro: 'Use laboratory workflows and planned instrumentation experiences to turn samples into defensible results.' },
};

export default function ChemistrySubjectHomePage({ page, onNavigate }) {
  const config = subjectConfig[page] || subjectConfig['physical-chemistry'];
  const Icon = config.icon;
  const category = chemistryCategories.find(item => item.id === config.category);
  const entries = libraryEntries.filter(item => item.category === config.category);
  const groups = [...new Set(entries.map(item => item.subgroup))];
  return <div className="min-h-screen bg-[#061526] px-4 py-6 text-slate-100 md:px-8">
    <header className="mx-auto flex max-w-7xl items-center justify-between gap-4 border-b border-white/10 pb-5">
      <button onClick={() => onNavigate('dashboard')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><Home size={16}/> Main Home</button>
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400"><span className="h-2 w-2 rounded-full" style={{ background: config.accent }}/> Subject home</div>
    </header>
    <main className="mx-auto max-w-7xl py-8">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[.08] to-white/[.02] p-6 md:p-10" style={{ boxShadow: `0 0 80px ${config.accent}12` }}>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div className="max-w-3xl"><div className="mb-4 flex items-center gap-3" style={{ color: config.accent }}><Icon size={26}/><span className="text-xs font-black uppercase tracking-[.24em]">Chemistry Universe · {category?.title}</span></div><h1 className="text-4xl font-black tracking-tight md:text-6xl">{config.title}</h1><p className="mt-3 text-lg text-slate-300">{config.subtitle}</p><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-400">{config.intro}</p></div><div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-right"><b className="block text-3xl" style={{ color: config.accent }}>{entries.length}</b><span className="text-xs text-slate-400">experiences</span><b className="mt-3 block text-xl text-white">{groups.length}</b><span className="text-xs text-slate-400">learning areas</span></div></div>
      </section>
      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Subject navigation"><button onClick={() => onNavigate('dashboard')} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"><ArrowLeft size={14} className="mr-1 inline"/> Main Home</button>{Object.entries(subjectConfig).filter(([id]) => id !== page).map(([id, item]) => <button key={id} onClick={() => onNavigate(id)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-slate-300 hover:bg-white/10">{item.title}</button>)}<button onClick={() => onNavigate('virtual-labs')} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-3 py-2 text-xs font-bold text-cyan-100">Virtual Labs</button></nav>
      <div className="mt-8 grid gap-5 md:grid-cols-2">{groups.map(group => <section key={group} className="rounded-2xl border border-white/10 bg-[#0b2034] p-5"><div className="mb-4 flex items-center justify-between"><div><span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.accent }}>{config.title}</span><h2 className="mt-1 text-xl font-black">{group}</h2></div><BookOpen size={19} style={{ color: config.accent }}/></div><div className="space-y-2">{entries.filter(item => item.subgroup === group).map(item => <button key={item.id} disabled={item.upcoming} onClick={() => !item.upcoming && onNavigate(item.id)} className={`flex w-full items-start justify-between gap-4 rounded-xl border p-3 text-left transition ${item.upcoming ? 'cursor-default border-amber-300/15 bg-amber-300/[.04]' : 'border-white/10 bg-white/[.035] hover:border-cyan-300/30 hover:bg-white/[.07]'}`}><span><b className="block text-sm text-white">{item.title} {item.upcoming && <em className="ml-2 rounded-full border border-amber-300/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-200">Upcoming</em>}</b><small className="mt-1 block text-xs leading-5 text-slate-400">{item.description}</small></span>{item.upcoming ? <Rocket size={16} className="shrink-0 text-amber-300"/> : <ArrowUpRight size={16} className="shrink-0 text-cyan-300"/>}</button>)}</div></section>)}</div>
    </main>
  </div>;
}
