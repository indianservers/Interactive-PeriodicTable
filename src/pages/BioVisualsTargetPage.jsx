import { useState } from "react";
import {
  BookOpen,
  CircleDot,
  Dna,
  Home,
  Menu,
  Play,
  Settings2,
  Sparkles,
} from "lucide-react";
import "./biochemistryPages.css";
const topics = [
  "Proteins",
  "Membranes",
  "Carbohydrates",
  "Nucleic acids",
  "Metabolism",
];
const topicData = {
  Proteins: {
    entity: "Hemoglobin",
    subtitle: "Tetrameric oxygen transporter",
    action: "oxygen binding",
    metric: "Oxygen saturation",
  },
  Membranes: {
    entity: "Lipid bilayer",
    subtitle: "Selective transport barrier",
    action: "transport flux",
    metric: "Transport readiness",
  },
  Carbohydrates: {
    entity: "Glucose",
    subtitle: "Energy and structural polymer building block",
    action: "ring/open-chain state",
    metric: "Reducing-end activity",
  },
  "Nucleic acids": {
    entity: "DNA / RNA",
    subtitle: "Information chemistry and base pairing",
    action: "base-pair state",
    metric: "Pairing stability",
  },
  Metabolism: {
    entity: "ATP",
    subtitle: "Coupled energy-transfer currency",
    action: "energy coupling",
    metric: "Pathway activation",
  },
};
export default function BioVisualsTargetPage({ onNavigate }) {
  const [topic, setTopic] = useState("Proteins");
  const [bound, setBound] = useState(false);
  const [tab, setTab] = useState("Structure");
  const [route, setRoute] = useState(1);
  const [oxygen, setOxygen] = useState(45);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const topicSummary =
    {
      Proteins: "Hemoglobin · tetrameric oxygen transporter",
      Membranes: "Lipid bilayer · selective transport",
      Carbohydrates: "Glucose · energy and structural polymers",
      "Nucleic acids": "DNA/RNA · information chemistry",
      Metabolism: "ATP · coupled energy pathways",
    }[topic] || "Connected biological chemistry";
  const activeTopic = topicData[topic] || topicData.Proteins;
  const effectiveOxygen = bound ? Math.max(oxygen, 80) : Math.min(oxygen, 55);
  const activeMetric =
    topic === "Proteins"
      ? `${effectiveOxygen}%`
      : bound
        ? "Active"
        : "Baseline";
  return (
    <div data-bio-page="overview"
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Dna size={38} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Biochemistry Visual Lab</h1>
          <p className="text-xs text-slate-400">Chemistry of living systems</p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto w-[430px] rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs"
          placeholder="Search molecules, pathways, or concepts..."
        />
        {["Explore", "Learn", "Simulate", "Resources"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " selected")}
            className="text-xs"
          >
            {x}
          </button>
        ))}
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[185px_1fr_325px] grid-rows-[1fr_145px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col gap-1 border-r border-white/10 bg-[#081c2d] p-3">
          {[
            [Home, "Home"],
            [Dna, "Proteins"],
            [CircleDot, "Membranes"],
            [Sparkles, "Carbohydrates"],
            [Dna, "Nucleic acids"],
            [CircleDot, "Metabolism"],
          ].map(([I, x]) => (
            <button
              key={x}
              onClick={() => {
                if (x === "Home") {
                  onNavigate?.("dashboard");
                  return;
                }
                setTopic(x);
                announce(x + " selected");
              }}
              className={`flex items-center gap-3 rounded px-3 py-3 text-left text-xs ${topic === x ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300"}`}
            >
              <I size={19} />
              {x}
            </button>
          ))}
          <div className="mt-auto border-t border-white/10 pt-4 text-xs text-slate-500">
            Science
            <br />
            Connects Life
          </div>
        </aside>
        <main className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#0a2842] via-[#091b2d] to-[#11143a] p-3">
          <h2 className="relative z-10 text-lg font-bold text-cyan-200">
            Explore molecular scale · {topic}
          </h2>
          <p className="relative z-10 mt-1 text-xs text-slate-400">
            {topicSummary}
            {query ? ` · Searching “${query}”` : ""}
          </p>
          <div className="relative z-10 mt-3 grid grid-cols-3 gap-2 text-center text-xs text-slate-400">
            <span>
              Atom
              <br />◉
            </span>
            <span className="text-cyan-200">
              Molecule
              <br />
              ●—●
            </span>
            <span>
              Organelle
              <br />◉
            </span>
          </div>
          <div className="absolute right-4 top-12 text-center">
            <div className="text-7xl text-indigo-300">✤</div>
            <b className="text-cyan-200">Protein folding</b>
            <p className="text-xs text-slate-400">Structure enables function</p>
          </div>
          <div className="absolute left-5 top-32 z-10 w-72 rounded-xl border border-cyan-300/60 bg-slate-950/70 p-4 shadow-[0_0_30px_rgba(34,211,238,.25)] backdrop-blur-sm">
            <h2 className="text-xl font-bold">{activeTopic.entity}</h2>
            <p className="text-xs text-slate-400">{activeTopic.subtitle}</p>
            <div className="my-5 text-center text-7xl text-blue-400">✤</div>
            <div className="flex justify-between text-xs">
              <span>🔵 Structure</span>
              <span>🔴 Function</span>
              <span>🟡 Context</span>
            </div>
            <button
              onClick={() => {
                setBound((v) => !v);
                announce(bound ? "Oxygen released" : "Oxygen bound");
              }}
              className="mt-4 w-full rounded-full bg-blue-500 px-3 py-3 text-sm font-bold"
            >
              <Play size={15} className="mr-2 inline" />
              {bound
                ? `Release ${activeTopic.action}`
                : `Activate ${activeTopic.action}`}
            </button>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-8xl text-purple-300">
            ◉
          </div>
          <div className="absolute bottom-14 right-10 text-center text-5xl text-cyan-300">
            🧬
            <br />
            <span className="text-xs">Nucleic acids</span>
          </div>
          <div className="absolute bottom-8 left-1/2 ml-28 text-center text-5xl text-amber-300">
            ✤<br />
            <span className="text-xs">Metabolism</span>
          </div>
          <div className="absolute right-4 top-56 text-center text-5xl text-amber-200">
            ⬡<br />
            <span className="text-xs">Carbohydrates</span>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold text-cyan-200">Learning route</h2>
          {[
            "Proteins and their functions",
            "Membranes and transport",
            "Carbohydrates in biology",
            "Nucleic acids and information",
            "Metabolism and energy",
            "Systems integration",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setRoute(i + 1);
                announce(x + " selected");
              }}
              className={`flex w-full items-center gap-3 border-b border-white/10 py-3 text-left text-xs ${route === i + 1 ? "text-cyan-200" : "text-slate-300"}`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${route === i + 1 ? "bg-cyan-300 text-slate-900" : "border border-white/20"}`}
              >
                {i + 1}
              </span>
              {x}
            </button>
          ))}
          <h2 className="mt-5 font-bold">Biological context</h2>
          <div className="mt-2 h-20 rounded bg-gradient-to-r from-red-900 to-red-300" />
          <h3 className="mt-3 font-bold">Oxygen transport in blood</h3>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Hemoglobin in red blood cells binds oxygen in the lungs and releases
            it in tissues, enabling aerobic metabolism across the body.
          </p>
          <div className="mt-4 rounded border border-white/10 p-3 text-xs">
            <b>Key points</b>
            <br />• Tetramer (α₂β₂)
            <br />• Each heme binds one O₂
            <br />• Cooperative binding (allostery)
            <br />• Regulated by pH, CO₂ and 2,3-BPG
          </div>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex border-b border-white/10">
            {["Structure", "Function", "Dynamics", "Sequence", "Related"].map(
              (x) => (
                <button
                  key={x}
                  onClick={() => setTab(x)}
                  className={`px-5 py-2 text-xs ${tab === x ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400"}`}
                >
                  {x}
                </button>
              ),
            )}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <div>
              <b>{activeTopic.entity}</b>
              <br />
              <span className="text-slate-400">
                {activeTopic.metric}　•　{activeTopic.subtitle}
              </span>
            </div>
            <div className="w-64">
              <label>
                {activeTopic.metric}　{activeMetric}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={oxygen}
                onChange={(e) => setOxygen(+e.target.value)}
                className="w-full accent-cyan-300"
              />
            </div>
            <div className="h-14 w-28 border-b border-l border-cyan-300/50">
              <div className="mt-7 h-1 w-full bg-cyan-300" />
            </div>
          </div>
        </section>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/40 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
