import { useEffect, useState } from "react";
import { Atom, BarChart3, FlaskConical, Search, Settings2 } from "lucide-react";
const halogens = [
  ["F₂", "Fluorine", "Gas (pale yellow)", "+2.87", "Cl⁻"],
  ["Cl₂", "Chlorine", "Gas (greenish yellow)", "+1.36", "Br⁻"],
  ["Br₂", "Bromine", "Liquid (red-brown)", "+1.07", "I⁻"],
  ["I₂", "Iodine", "Solid (grey-black)", "+0.54", null],
];
export default function PBlockTargetPage() {
  const [h, setH] = useState(1);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("Molecular");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setT((value) => (value >= 100 ? 0 : value + 2)),
      120,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  const groupLabels = [
    "B",
    "Al",
    "Ga",
    "In",
    "Tl",
    "Nh",
    "C",
    "Si",
    "Ge",
    "Sn",
    "Pb",
    "Fl",
    "N",
    "P",
    "As",
    "Sb",
    "Bi",
    "Mc",
    "O",
    "S",
    "Se",
    "Te",
    "Po",
    "Lv",
    "F",
    "Cl",
    "Br",
    "I",
    "At",
    "Ts",
  ];
  const tileMatches = (index) =>
    !query.trim() ||
    groupLabels[index % groupLabels.length]
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const [
    halogenFormula,
    halogenName,
    halogenState,
    halogenPotential,
    displacementIon,
  ] = halogens[h];
  const halogenSymbol = halogenFormula.replace("₂", "");
  const displacementSymbol = displacementIon?.replace("⁻", "");
  const displacementText = displacementIon
    ? `${halogenFormula} + 2${displacementIon} → 2${halogenSymbol}⁻ + ${displacementSymbol}₂`
    : "Iodine is the weakest halogen oxidant in this series.";
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[65px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Atom size={35} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">p-Block Chemistry Explorer</h1>
          <p className="text-xs text-slate-400">
            Explore trends. Visualize structures. Understand reactivity.
          </p>
        </div>
        <label className="ml-auto flex items-center gap-2 rounded border border-white/20 px-3 py-2 text-xs">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 bg-transparent outline-none"
            placeholder="Search elements, compounds, or reactions..."
          />
        </label>
        <button onClick={() => announce("Visuals selected")}>Visuals</button>
        <button onClick={() => announce("Data selected")}>Data</button>
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-65px)] grid-cols-[1fr_1.1fr_340px] grid-rows-[1fr_390px] gap-2 p-2">
        <main className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="text-xl font-bold">The p-Block (Groups 13–18)</h2>
          <div className="mt-4 grid h-64 grid-cols-6 items-end gap-1">
            {Array.from({ length: 42 }, (_, i) => (
              <button
                key={i}
                onClick={() => announce(`Element tile ${i + 1} selected`)}
                style={{
                  height: `${[32, 42, 52, 62, 72, 82][i % 6]}%`,
                  opacity: tileMatches(i) ? 1 : 0.2,
                }}
                className="rounded border border-slate-500/60 bg-gradient-to-t from-slate-700 to-slate-500 text-[10px] hover:border-cyan-300"
              >
                {groupLabels[i % groupLabels.length]}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <p className="text-blue-300">
              Atomic radius (↓)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-blue-300 to-blue-700" />
            </p>
            <p className="text-yellow-300">
              Ionization energy (↑)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-yellow-300 to-yellow-700" />
            </p>
            <p className="text-emerald-300">
              Reactivity (non-metals) (↓)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-emerald-300 to-emerald-700" />
            </p>
          </div>
        </main>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="text-xl font-bold">Group 17 · Halogens</h2>
          <p className="text-cyan-300">
            {halogenName} · E° = {halogenPotential} V · {halogenState}
          </p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {halogens.map(([f, n, d], i) => (
              <button
                key={f}
                onClick={() => setH(i)}
                className={`rounded border p-3 text-center ${h === i ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
              >
                <div className="mx-auto h-28 w-12 rounded-t-full bg-gradient-to-b from-slate-300/70 to-slate-600/60" />
                <b>{f}</b>
                <br />
                <span className="text-xs">{n}</span>
                <br />
                <span className="text-[10px] text-slate-400">{d}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded border border-white/10 p-3 text-xs">
            ↓ Reactivity decreases down the group
            <br />
            Common oxidation states: −1, +1, +3, +5, +7
          </div>
        </section>
        <aside className="row-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Key Features</h2>
          {[
            ["↓", "Reactivity decreases down the group"],
            ["⚗", "Common oxidation states: −1, +1, +3, +5, +7"],
            ["△", "Form acidic oxides and oxyacids"],
            ["⇄", "Displacement reactions"],
          ].map(([a, b]) => (
            <div key={b} className="mt-5 flex gap-3 text-xs">
              <span className="text-2xl text-emerald-300">{a}</span>
              <span>
                {b}
                <br />
                <span className="text-slate-400">
                  Weaker X–X bonds, larger atoms, lower oxidizing power.
                </span>
              </span>
            </div>
          ))}
          <div className="mt-5 rounded border border-cyan-300/30 p-3 text-sm italic">
            Halogens are powerful oxidizing agents that form salts,
            interhalogens and oxyacids.
          </div>
          <h2 className="mt-6 font-bold">Compare Oxidation States</h2>
          {[
            "+7 HClO₄",
            "+5 HClO₃",
            "+3 HClO₂",
            "+1 HOCl",
            "0 Cl₂",
            "−1 Cl⁻",
          ].map((x) => (
            <div key={x} className="border-b border-white/10 py-2 text-xs">
              {x}
            </div>
          ))}
        </aside>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">Redox Perspective</h3>
          <p className="mt-3 text-lg">
            {halogenFormula} + 2e⁻ → 2{halogenSymbol}⁻　 E° ={" "}
            {halogenPotential} V
          </p>
          <p className="mt-2 text-lg">Selected oxidant: {halogenName}</p>
          <div className="mt-4 rounded border border-cyan-300/30 p-3 text-xs">
            {displacementText}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex justify-between">
            <h3 className="font-bold">Displacement Reaction</h3>
            <button
              onClick={() => {
                setRunning((v) => !v);
                announce(running ? "Reaction paused" : "Reaction running");
              }}
              className="rounded bg-blue-500 px-3 py-2 text-xs"
            >
              {running ? "Pause" : "Run displacement reaction"}
            </button>
          </div>
          <p className="mt-2 text-cyan-300">
            {displacementIon
              ? `${halogenName} displaces ${displacementIon} from solution`
              : "No weaker halogen remains to displace."}
          </p>
          <div className="mt-8 text-center text-5xl text-lime-300">
            ● ●　→　● ●
          </div>
          <p className="mt-2 text-center text-xs text-cyan-200">
            {view === "Equation"
              ? displacementText
              : view === "Ionic"
                ? "Ions exchange in aqueous solution"
                : "Molecular collision view"}
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={t}
            onChange={(e) => setT(+e.target.value)}
            className="mt-5 w-full accent-cyan-300"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setView("Molecular")}
              className={`flex-1 rounded p-2 text-xs ${view === "Molecular" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Molecular view
            </button>
            <button
              onClick={() => setView("Ionic")}
              className={`flex-1 rounded p-2 text-xs ${view === "Ionic" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Ionic view
            </button>
            <button
              onClick={() => setView("Equation")}
              className={`flex-1 rounded p-2 text-xs ${view === "Equation" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Σ Show equation
            </button>
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
