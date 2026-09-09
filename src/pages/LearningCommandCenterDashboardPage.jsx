import { useMemo, useState } from "react";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  GraduationCap,
  Home,
  Play,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { learnerProfiles } from "../data/learningCommandCenter.js";

const queue = [
  { id: "a", label: "Group A", learners: "5 learners", topic: "moles-to-particles conversion", tone: "rose", action: "Launch visual intervention", detail: "Particle Model: From Moles to Particles" },
  { id: "b", label: "Group B", learners: "4 learners", topic: "balancing equations & mole ratios", tone: "amber", action: "Assign activity", detail: "Balance It: Particle View" },
  { id: "c", label: "Group C", learners: "2 learners", topic: "limiting reactant (mixed understanding)", tone: "sky", action: "Launch poll", detail: "Which reactant is limiting?" },
];

const itemCards = [
  ["Q1", "Identify product", "2 H₂ + O₂ → ?", "78% correct", "rose"],
  ["Q2", "Mole ratio", "N₂ + 3 H₂ → 2 NH₃", "64% correct", "slate"],
  ["Q3", "Moles to particles", "How many particles in 0.50 mol CO₂?", "32% correct", "slate"],
  ["Q4", "Limiting reactant", "Which reactant is limiting?", "57% correct", "slate"],
];

const navItems = [
  [Home, "Classroom"], [Play, "Live Lesson"], [Users, "Students"], [Sparkles, "Concept Map"],
  [ClipboardList, "Assessments"], [Beaker, "Simulations"], [BookOpen, "Resources"], [BarChart3, "Reports"],
];

const MoleculeThumb = ({ accent = "#f97316" }) => (
  <svg viewBox="0 0 130 80" className="h-full w-full" aria-label="reacting molecules">
    <defs><radialGradient id={`m-${accent}`}><stop stopColor="#fff" stopOpacity=".9"/><stop offset="1" stopColor={accent}/></radialGradient></defs>
    <g stroke="#b9c8dd" strokeWidth="6" strokeLinecap="round"><path d="M18 23 37 36M45 36 63 25M78 48 98 61M104 61 119 45"/></g>
    {[[18,23,"#dbe6f2"],[37,36,"#c6d3e5"],[63,25,"#e7eef9"],[78,48,"#f05225"],[98,61,accent],[119,45,"#f05225"]].map(([cx,cy,c],i)=><circle key={i} cx={cx} cy={cy} r={i%3===0?10:9} fill={`url(#m-${accent})`} stroke={c} strokeWidth="2"/>)}
  </svg>
);

const UnderstandingMap = ({ active, onSelect }) => (
  <svg viewBox="0 0 640 360" className="h-full min-h-[330px] w-full" role="img" aria-label="Class understanding map">
    <defs>
      <filter id="glow"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="core"><stop stopColor="#ffe79d"/><stop offset="1" stopColor="#f59e0b"/></radialGradient>
    </defs>
    <g stroke="#536a91" strokeWidth="2" opacity=".8"><path d="M320 178 150 84M320 178 487 88M320 178 188 290M320 178 480 286M320 178 505 176"/></g>
    {[[150,84,"Ionic Bonding","#818cf8"],[487,88,"Acids & Bases","#34d399"],[188,290,"Energetics","#8b5cf6"],[480,286,"Mole Ratios","#fb7185"],[505,176,"Stoichiometry","#fb4f42"]].map(([x,y,label,color],i)=><g key={label} onClick={()=>onSelect(i)} className="cursor-pointer"><circle cx={x} cy={y} r={active===i?34:28} fill={color} opacity=".85" filter="url(#glow)"/><circle cx={x} cy={y} r="13" fill="#fff" opacity=".12"/><text x={x+(i===1?42:-45)} y={y+4} textAnchor={i===1?"start":"end"} fill="#e8eefb" fontSize="16" fontWeight="700">{label}</text></g>)}
    <circle cx="320" cy="178" r="39" fill="url(#core)" filter="url(#glow)"/><text x="320" y="184" textAnchor="middle" fill="#3b2600" fontSize="18" fontWeight="900">Stoich.</text>
    <g fill="#9bb0d4" opacity=".85">{Array.from({length:16},(_,i)=><circle key={i} cx={90+(i*83)%480} cy={36+(i*47)%280} r="3"/>)}</g>
  </svg>
);

export const LearningCommandCenterDashboardPage = ({ onNavigate }) => {
  const [activeNav, setActiveNav] = useState("Classroom");
  const [activeHotspot, setActiveHotspot] = useState(4);
  const [running, setRunning] = useState(true);
  const [notice, setNotice] = useState("");
  const [profile, setProfile] = useState(learnerProfiles.find((x) => x.id === "teacher") || learnerProfiles[0]);
  const [queueFocus, setQueueFocus] = useState("a");
  const activeQueue = useMemo(() => queue.find((x) => x.id === queueFocus) || queue[0], [queueFocus]);
  const announce = (message) => setNotice(message);
  return (
    <div className="min-h-[calc(100vh-70px)] overflow-hidden bg-[#061526] text-slate-100">
      <header className="flex h-[74px] items-center gap-5 border-b border-white/10 bg-[#07192b] px-6">
        <div className="flex items-center gap-3 border-r border-white/10 pr-5"><Beaker size={34} className="text-sky-400"/><div><b className="text-lg text-cyan-100">ChemLearn</b><small className="block text-[9px] font-bold uppercase tracking-[.18em] text-sky-300/70">Real chemistry<br/>brighter minds</small></div></div>
        <div><h1 className="text-2xl font-black tracking-tight">Chemistry Learning Command Center</h1><p className="text-[10px] uppercase tracking-[.35em] text-sky-200/65">Real students · real thinking · a more chemical tomorrow</p></div>
        <div className="ml-auto flex items-center gap-6 text-xs"><button onClick={()=>announce("Live class controls opened")} className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-emerald-100">● Live class · Stoichiometry</button><span className="text-slate-400">Tue, Apr 15, 2025<br/><b className="text-slate-200">Period 3 · 28 learners</b></span><button onClick={()=>announce("Settings opened")} aria-label="Settings"><Settings size={22}/></button><span className="text-xl italic text-sky-300">Curiosity<br/>reacts here.</span></div>
      </header>
      <div className="grid min-h-[calc(100vh-144px)] grid-cols-[178px_1fr]">
        <aside className="border-r border-white/10 bg-[#071b2d] p-3">
          <nav className="space-y-1" aria-label="Classroom navigation">{navItems.map(([Icon,label])=><button key={label} onClick={()=>{setActiveNav(label);announce(`${label} selected`)}} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm ${activeNav===label?"border-l-4 border-sky-400 bg-sky-500/25 text-white":"text-slate-300 hover:bg-white/5"}`}><Icon size={18}/>{label}</button>)}</nav>
          <div className="mt-20 text-center text-[10px] uppercase tracking-[.3em] text-sky-300/70">same elements<br/>brighter people</div>
        </aside>
        <main className="min-w-0 overflow-auto p-3">
          <div className="grid gap-3 xl:grid-cols-[1.02fr_1.5fr_1.12fr]">
            <div className="space-y-3">
              <section className="rounded-xl border border-white/10 bg-[#0b2034] p-3"><div className="flex justify-between"><h2 className="text-lg font-black">Current Lesson</h2><span className="rounded bg-red-500/25 px-2 py-1 text-xs text-red-200">● Live</span></div><h3 className="mt-4 text-lg font-bold">Stoichiometry: From Equations<br/>to the Real World</h3><div className="mt-6 flex justify-between text-[11px] text-slate-300">{["Warm Up\n8 min","Explore\nSimulation\n12 min","Class\nDiscussion\n10 min","Check for\nUnderstanding\n5 min"].map((x,i)=><div key={x} className={i===1?"text-sky-200":""}><span className={`mx-auto mb-2 block h-5 w-5 rounded-full border-2 ${i===0?"border-emerald-300 bg-emerald-400":"border-slate-500 bg-slate-700"}`}/>{x.split("\n").map(y=><span key={y} className="block">{y}</span>)}</div>)}</div></section>
              <section className="rounded-xl border border-white/10 bg-[#0b2034] p-3"><div className="flex justify-between"><h2 className="text-lg font-black">Live Simulation</h2><span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">● {running?"Running":"Paused"}</span></div><div className="mt-3 grid grid-cols-[1fr_1.12fr] gap-3"><div className="rounded-lg border border-white/15 bg-[#102942] p-2"><MoleculeThumb/><button onClick={()=>onNavigate?.("molecule")} className="mt-2 w-full rounded border border-sky-300/50 px-2 py-2 text-xs text-sky-100">Open Simulation ↗</button></div><div className="text-xs"><b>Reacting Molecules</b><p className="mt-2 text-base">2 H₂ + O₂ → 2 H₂O</p><p className="mt-2 text-slate-400">Adjust the amounts and watch particles react in real time.</p><button onClick={()=>{setRunning(!running);announce(running?"Simulation paused":"Simulation running")}} className="mt-4 rounded border border-white/15 px-3 py-2">{running?"Pause":"Resume"}</button></div></div></section>
            </div>
            <section className="rounded-xl border border-white/10 bg-[#0a1f34] p-3"><div className="flex items-start justify-between"><h2 className="text-lg font-black">Class Understanding Map <CircleHelp size={14} className="ml-2 inline text-slate-400"/></h2><span className="text-right text-xs text-slate-400">Bigger nodes = stronger understanding<br/>Brighter halos = more learner evidence</span></div><div className="mt-1 h-[350px]"><UnderstandingMap active={activeHotspot} onSelect={(i)=>{setActiveHotspot(i);announce("Understanding hotspot selected")}}/></div><div className="flex gap-4 rounded-lg border border-white/10 bg-black/15 p-2 text-xs"><span className="text-emerald-200">● Strong understanding</span><span className="text-amber-200">● Developing understanding</span><span className="text-rose-200">● Widespread misconception</span></div><p className="mt-2 text-right text-xs italic text-slate-400">“See what they know. Find where to go next.”</p></section>
            <section className="rounded-xl border border-white/10 bg-[#0b2034] p-3"><div className="flex justify-between"><h2 className="text-lg font-black">Intervention Queue</h2><span className="text-xs text-slate-400">👥 3 groups · 11 learners</span></div><div className="mt-2 space-y-2">{queue.map((item)=><button key={item.id} onClick={()=>{setQueueFocus(item.id);announce(`${item.label} selected`)}} className={`w-full rounded-xl border p-3 text-left ${queueFocus===item.id?"border-sky-300/60 bg-sky-400/10":"border-white/10 bg-black/10"}`}><div className="flex items-center justify-between"><span className="font-bold">{item.label} <small className="font-normal text-slate-400">{item.learners}</small></span><span className={`rounded border px-2 py-1 text-[10px] ${item.tone==="rose"?"border-red-300/50 text-red-200":item.tone==="amber"?"border-amber-300/50 text-amber-200":"border-sky-300/50 text-sky-200"}`}>{item.tone==="rose"?"High priority":item.tone==="amber"?"Developing":"Monitor"}</span></div><p className="mt-1 text-xs text-slate-400">{item.topic}</p>{queueFocus===item.id&&<div className="mt-2 rounded-lg border border-white/10 bg-[#102a42] p-2"><p className="text-xs font-bold text-red-200">Recommended (3 min)</p><p className="text-sm">{item.detail}</p><button onClick={(e)=>{e.stopPropagation();announce(`${item.action} launched`)}} className="mt-2 rounded bg-blue-500 px-3 py-2 text-xs font-bold">▶ {item.action}</button></div>}</button>)}</div></section>
          </div>
          <section className="mt-3 rounded-xl border border-white/10 bg-[#0b2034] p-3"><div className="flex justify-between"><div className="flex items-center gap-3"><h2 className="text-lg font-black">Item Analysis</h2><span className="text-xs text-slate-400">Evidence from 28 learners ⓘ</span></div><button onClick={()=>announce("Question-type filter opened")} className="rounded border border-white/15 px-3 py-2 text-xs">All question types⌄</button></div><div className="mt-3 grid gap-3 xl:grid-cols-[1.25fr_1fr]"><div className="grid grid-cols-2 gap-2 lg:grid-cols-4">{itemCards.map(([id,title,formula,score,tone])=><button key={id} onClick={()=>announce(`${id} item selected`)} className="rounded-lg border border-white/10 bg-[#102940] p-2 text-left hover:border-sky-300/50"><p className="text-xs font-bold text-slate-300">{id} <span className="font-normal">{title}</span></p><div className="my-3 h-16 rounded bg-[#1b3852]"><MoleculeThumb accent={tone==="rose"?"#ef4444":"#d5dde9"}/></div><p className="text-xs">{formula}</p><b className={`mt-2 block text-sm ${score.startsWith("32")?"text-red-300":"text-emerald-300"}`}>{score}</b></button>)}</div><div className="rounded-lg border border-white/10 bg-[#0b1a2b] p-3"><h3 className="text-sm font-bold">Learner Confidence vs. Correctness</h3><svg viewBox="0 0 460 180" className="mt-2 h-40 w-full"><path d="M45 18V145H430" stroke="#8ca0be"/><path d="M45 65H430M45 105H430M150 18V145M255 18V145M360 18V145" stroke="#334c6a" strokeDasharray="3 4"/>{Array.from({length:28},(_,i)=><circle key={i} cx={70+(i*71)%345} cy={34+(i*59)%100} r="3.5" fill={i%4===0?"#f87171":i%3===0?"#fbbf24":"#34d399"}/>)}</svg><div className="flex justify-between text-[10px] text-slate-400"><span>Incorrect</span><span>Correct</span></div></div></div></section>
        </main>
      </div>
      {notice&&<div role="status" className="fixed bottom-4 right-5 rounded-full border border-sky-300/40 bg-[#0b223d] px-4 py-2 text-xs text-sky-100">{notice}</div>}
    </div>
  );
};

export default LearningCommandCenterDashboardPage;
