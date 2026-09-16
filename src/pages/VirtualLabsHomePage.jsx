import { useMemo, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, CheckCircle2, Clock3, FlaskConical, Home, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { BIOCHEMISTRY_VIRTUAL_LABS } from "../data/biochemistryVirtualLabs.js";
import { completedVirtualLabs, completedVirtualLabScreens } from "../data/completedVirtualLabs.js";
import { upcomingExperiences } from "../data/upcomingExperiences.js";
import { virtualLabCoverage } from "../data/virtualLabCoverage.js";
import { syllabusInteractives, syllabusConcepts } from "../modules/core-simulations/syllabusInteractiveModel.js";

const statusLabel = { all: "All experiments", active: "In progress", completed: "Completed", upcoming: "Upcoming" };

export default function VirtualLabsHomePage({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("All");
  const [status, setStatus] = useState("all");
  const labs = useMemo(() => [
    ...virtualLabCoverage.map((lab, index) => ({
      ...lab,
      subject: ["Physical", "Organic", "Inorganic", "Analytical"][index],
      duration: [35, 40, 45, 50][index],
      difficulty: ["Foundation", "Intermediate", "Intermediate", "Advanced"][index],
      route: lab.experiments[0]?.[2] || "virtual-labs",
    })),
    {
      id: "college-practicals-vl",
      subject: "Analytical",
      title: "College Chemistry Practicals",
      experiments: [...syllabusInteractives, ...syllabusConcepts].map((item) => [item.title, "covered", item.id]),
      duration: 45,
      difficulty: "Foundation to advanced",
      route: "virtual-labs",
    },
    {
      id: "biochemistry-vl",
      subject: "Biochemistry",
      title: "Biochemistry Virtual Lab",
      experiments: BIOCHEMISTRY_VIRTUAL_LABS.map((lab) => [lab.title, "covered"]),
      duration: 40,
      difficulty: "Foundation to advanced",
      route: "biochemistry-module",
    },
  ], []);
  const planned = upcomingExperiences.filter((item) => item.kind === "Virtual Lab");
  const matches = (text) => text.toLowerCase().includes(query.toLowerCase());
  const visibleLabs = labs.filter((lab) => (subject === "All" || lab.subject === subject) && matches(`${lab.title} ${lab.subject} ${lab.experiments.map(([name]) => name).join(" ")}`));
  const visiblePlanned = planned.filter((item) => (subject === "All" || item.title.startsWith(subject)) && matches(`${item.title} ${item.description}`));
  const visibleCompleted = completedVirtualLabs.filter((lab) => (subject === "All" || lab.subject === subject) && matches(`${lab.title} ${lab.subject} ${lab.description}`));
  const experimentCount = labs.reduce((total, lab) => total + lab.experiments.length, 0);

  return (
    <div className="min-h-screen bg-[#061526] px-4 py-6 text-slate-100 md:px-8">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-white/10 pb-5">
        <button onClick={() => onNavigate("dashboard")} className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><Home size={16} /> Main Home</button>
        <span className="text-xs font-bold text-cyan-200">Virtual Labs home</span>
      </header>
      <main className="mx-auto max-w-7xl py-8">
        <section className="rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-cyan-400/10 to-white/[.02] p-6 md:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-3 text-cyan-300"><FlaskConical size={28} /><span className="text-xs font-black uppercase tracking-[.24em]">Chemistry Universe</span></div>
              <h1 className="mt-4 text-4xl font-black md:text-6xl">Virtual Laboratories</h1>
              <p className="mt-3 max-w-3xl text-lg text-slate-300">Run guided experiments, collect evidence, explain results and build laboratory confidence.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center md:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><b className="block text-2xl text-cyan-200">{labs.length}</b><small className="text-[10px] text-slate-400">Lab collections</small></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><b className="block text-2xl text-cyan-200">{experimentCount}</b><small className="text-[10px] text-slate-400">Experiments</small></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><b className="block text-2xl text-emerald-200">{completedVirtualLabs.length}</b><small className="text-[10px] text-slate-400">Interactive labs</small></div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3"><b className="block text-2xl text-emerald-200">{completedVirtualLabScreens}</b><small className="text-[10px] text-slate-400">Guided screens</small></div>
            </div>
          </div>
          <button onClick={() => onNavigate("biochemistry-module")} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-slate-950">Open Biochemistry VL <ArrowUpRight size={16} /></button>
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#0b2034] p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <label className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 text-sm text-slate-400"><Search size={16} /><input aria-label="Search virtual labs" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search experiments, subjects or techniques…" className="w-full bg-transparent py-3 text-white outline-none" /></label>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <SlidersHorizontal size={15} />
              <select aria-label="Subject filter" value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-lg border border-white/10 bg-[#102a42] px-3 py-2 text-white">{["All", "Physical", "Organic", "Inorganic", "Analytical", "Biochemistry"].map((item) => <option key={item}>{item}</option>)}</select>
              <select aria-label="Lab status filter" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-lg border border-white/10 bg-[#102a42] px-3 py-2 text-white">{Object.entries(statusLabel).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select>
            </div>
          </div>
        </section>

        {status !== "upcoming" && <section id="completed-virtual-labs" className="mt-7">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">READY TO LAUNCH</span><h2 className="mt-1 text-2xl font-black">Interactive virtual labs</h2><p className="mt-1 text-xs text-slate-400">Direct access to every rebuilt simulator, with complete guided workflows and assessments.</p></div><span className="text-xs text-slate-500">{visibleCompleted.length} shown</span></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCompleted.map((lab) => <article key={lab.id} className="flex min-h-44 flex-col rounded-2xl border border-emerald-300/15 bg-gradient-to-br from-emerald-300/[.07] to-[#0b2034] p-4 transition hover:-translate-y-0.5 hover:border-emerald-300/40">
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{lab.subject} chemistry</p><h3 className="mt-1 font-black text-white">{lab.title}</h3></div><CheckCircle2 size={18} className="shrink-0 text-emerald-300"/></div>
              <p className="mt-2 flex-1 text-xs leading-5 text-slate-400">{lab.description}</p>
              <div className="mt-4 flex items-center justify-between"><span className="text-[10px] font-bold text-slate-500">{lab.screens} guided screens</span><button onClick={() => onNavigate(lab.route)} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-300 px-3 py-2 text-xs font-black text-slate-950">Launch lab <ArrowUpRight size={13}/></button></div>
            </article>)}
          </div>
          {!visibleCompleted.length && <div className="rounded-2xl border border-white/10 bg-[#0b2034] p-8 text-center text-sm text-slate-400">No completed virtual labs match these filters.</div>}
        </section>}

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between"><div><span className="text-[10px] font-black uppercase tracking-widest text-cyan-300">LAB CATALOG</span><h2 className="mt-1 text-2xl font-black">Choose an experiment collection</h2></div><span className="text-xs text-slate-500">{visibleLabs.length + (status === "upcoming" ? visiblePlanned.length : 0)} shown</span></div>
          <div className="grid gap-5 md:grid-cols-2">
            {status !== "upcoming" && visibleLabs.map((lab) => (
              <article key={lab.id} className="rounded-2xl border border-white/10 bg-[#0b2034] p-5 transition hover:border-cyan-300/30">
                <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">{lab.subject} · Lab collection</p><h3 className="mt-1 text-xl font-black">{lab.title}</h3></div><CheckCircle2 size={20} className="text-emerald-300" /></div>
                <p className="mt-3 text-sm text-slate-400">{lab.experiments.length} experiments with procedures, observations and calculations.</p>
                <div className="mt-4 flex flex-wrap gap-2 text-[10px] text-slate-300"><span className="rounded-full border border-white/10 px-2 py-1"><Clock3 size={11} className="mr-1 inline" />{lab.duration} min each</span><span className="rounded-full border border-white/10 px-2 py-1">{lab.difficulty}</span><span className="rounded-full border border-emerald-300/20 px-2 py-1 text-emerald-200">Available</span></div>
                <div className="mt-4 flex flex-wrap gap-1.5">{lab.experiments.slice(0, 6).map(([name, , route]) => <button key={name} onClick={() => onNavigate(route || lab.route)} className="rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-[10px] text-slate-300 hover:border-cyan-300/50">{name}</button>)}</div>
                <div className="mt-5 flex items-center justify-between"><button onClick={() => onNavigate(lab.route)} className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950">Open first experiment <ArrowUpRight size={13} /></button><span className="text-[10px] font-bold text-slate-500">Tap a title to launch</span></div>
              </article>
            ))}
            {status !== "completed" && visiblePlanned.map((item) => <article key={item.id} className="rounded-2xl border border-amber-300/20 bg-amber-300/[.04] p-5"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-widest text-amber-200">Planned collection</p><h3 className="mt-1 text-xl font-black">{item.title}</h3></div><Sparkles size={20} className="text-amber-300" /></div><p className="mt-3 text-sm text-slate-400">{item.description}</p><span className="mt-4 inline-block rounded-full border border-amber-300/25 px-2 py-1 text-[10px] font-bold uppercase text-amber-200">Upcoming</span></article>)}
          </div>
          {!visibleLabs.length && !visiblePlanned.length && <div className="rounded-2xl border border-white/10 bg-[#0b2034] p-10 text-center text-sm text-slate-400">No virtual labs match these filters.</div>}
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#0b2034] p-4"><BookOpen className="text-cyan-300" size={20} /><h3 className="mt-3 font-black">Guided workflow</h3><p className="mt-1 text-xs leading-5 text-slate-400">Objective, model, safety, procedure, observation, calculation, result and assessment.</p></div>
          <div className="rounded-2xl border border-white/10 bg-[#0b2034] p-4"><FlaskConical className="text-emerald-300" size={20} /><h3 className="mt-3 font-black">Evidence notebook</h3><p className="mt-1 text-xs leading-5 text-slate-400">Record repeated trials, parameters, interpretations and exportable observations.</p></div>
          <div className="rounded-2xl border border-white/10 bg-[#0b2034] p-4"><CheckCircle2 className="text-amber-300" size={20} /><h3 className="mt-3 font-black">Assessment ready</h3><p className="mt-1 text-xs leading-5 text-slate-400">Predict, observe, explain and repeat with randomised values.</p></div>
        </section>
        <button onClick={() => onNavigate("dashboard")} className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white"><ArrowLeft size={14} /> Back to main home</button>
      </main>
    </div>
  );
}
