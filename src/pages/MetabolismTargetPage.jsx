import { useEffect, useState } from "react";
import { Activity, Dna, Play, RotateCcw, Settings2 } from "lucide-react";

function PathwayMap({ aerobic, glucose, running }) {
  const node = (x, y, label, detail, color, width = 180) => (
    <g>
      <rect
        x={x - width / 2}
        y={y - 30}
        width={width}
        height="60"
        rx="9"
        fill={`${color}22`}
        stroke={color}
        strokeWidth="2"
      />
      <text
        x={x}
        y={y - 7}
        textAnchor="middle"
        fill={color}
        fontSize="14"
        fontWeight="700"
      >
        {label}
      </text>
      <text x={x} y={y + 13} textAnchor="middle" fill="#d9ecff" fontSize="10">
        {detail}
      </text>
    </g>
  );
  return (
    <svg
      viewBox="0 0 620 540"
      className={running ? "animate-pulse" : ""}
      aria-label="Metabolism pathway map"
    >
      <defs>
        <radialGradient id="mito">
          <stop stopColor="#a96b9e" stopOpacity=".75" />
          <stop offset="1" stopColor="#162d48" stopOpacity=".2" />
        </radialGradient>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L7,3 z" fill="#63c7ff" />
        </marker>
      </defs>
      <rect width="620" height="540" rx="12" fill="url(#mito)" />
      <text x="310" y="28" fill="#dff4ff" fontSize="16" textAnchor="middle">
        Cytosol → Mitochondrial matrix
      </text>
      <path
        d="M300 95 V135 M300 200 V245 M300 315 V370 M300 440 V480"
        stroke="#63c7ff"
        strokeWidth="3"
        markerEnd="url(#arrow)"
      />
      {node(
        300,
        70,
        "Glucose (C₆)",
        `${glucose.toFixed(1)} mM input`,
        "#dbeeff",
        170,
      )}
      {node(300, 170, "Glycolysis", "2 ATP · 2 NADH", "#49d7ff", 200)}
      {node(300, 280, "Pyruvate oxidation", "2 NADH · 2 CO₂", "#ffc13b", 220)}
      <ellipse
        cx="300"
        cy="400"
        rx="114"
        ry="56"
        fill="#4a2e8c44"
        stroke="#9c6dff"
        strokeWidth="3"
      />
      <text
        x="300"
        y="394"
        fill="#eadfff"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
      >
        Citric acid cycle
      </text>
      <text x="300" y="414" fill="#c4b8ff" textAnchor="middle" fontSize="11">
        6 NADH · 2 FADH₂ · 2 ATP
      </text>
      {node(
        300,
        510,
        "Electron transport chain",
        aerobic ? "~26–28 ATP" : "ETC paused",
        "#43e89c",
        270,
      )}
      <text x="520" y="118" fill="#70d5ff" fontSize="15">
        O₂ ↓
      </text>
      <text x="488" y="490" fill="#8bdfff" fontSize="12">
        H₂O
      </text>
    </svg>
  );
}
function MoleculeStep({ step }) {
  const labels = [
    ["Citrate", "C₆", "#4c9aff"],
    ["Isocitrate", "C₆", "#f0b632"],
  ];
  const label = labels[(step - 1) % 2];
  return (
    <svg
      viewBox="0 0 650 270"
      className="h-full w-full"
      aria-label="Aconitase molecular step"
    >
      <defs>
        <radialGradient id="enzyme">
          <stop stopColor="#a58ce8" />
          <stop offset="1" stopColor="#362a62" />
        </radialGradient>
      </defs>
      <rect
        width="650"
        height="270"
        rx="10"
        fill="url(#enzyme)"
        opacity=".65"
      />
      <text x="24" y="30" fill="#edf8ff" fontSize="16">
        Aconitase enzyme pocket
      </text>
      <path
        d="M70 160 C120 80 180 220 240 130 S350 80 420 150 S520 100 590 150"
        fill="none"
        stroke="#bcd9ea"
        strokeWidth="8"
        opacity=".8"
      />
      <g transform="translate(80 135)">
        <circle r="16" fill="#ef5555" />
        <circle cx="35" cy="-22" r="13" fill="#8fa2b8" />
        <circle cx="70" cy="8" r="13" fill="#8fa2b8" />
        <circle cx="102" cy="-25" r="16" fill="#ef5555" />
        <path
          d="M15 -4 L25 -15 M48 -13 L59 -1 M82 -5 L92 -15"
          stroke="#eaf5ff"
          strokeWidth="6"
        />
        <text x="70" y="65" fill="#fff" textAnchor="middle" fontSize="14">
          {label[0]} ({label[1]})
        </text>
      </g>
      <path
        d="M270 135 H370"
        stroke="#67c9ff"
        strokeWidth="4"
        markerEnd="url(#arrow)"
      />
      <g transform="translate(470 135)">
        <circle r="16" fill="#ef5555" />
        <circle cx="35" cy="-22" r="13" fill="#8fa2b8" />
        <circle cx="70" cy="8" r="13" fill="#8fa2b8" />
        <circle cx="102" cy="-25" r="16" fill="#ef5555" />
        <path
          d="M15 -4 L25 -15 M48 -13 L59 -1 M82 -5 L92 -15"
          stroke="#eaf5ff"
          strokeWidth="6"
        />
        <text x="70" y="65" fill="#fff" textAnchor="middle" fontSize="14">
          {labels[step % 2][0]} ({labels[step % 2][1]})
        </text>
      </g>
      <text x="325" y="72" fill="#ffc53d" fontSize="12" textAnchor="middle">
        Fe–S cluster [4Fe–4S]
      </text>
    </svg>
  );
}
export default function MetabolismTargetPage() {
  const [mode, setMode] = useState("Aerobic respiration");
  const [step, setStep] = useState(2);
  const [oxygen, setOxygen] = useState(100);
  const [glucose, setGlucose] = useState(1);
  const [running, setRunning] = useState(false);
  const [carbon, setCarbon] = useState("Trace carbon 1");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setStep((value) => (value >= 8 ? 1 : value + 1)),
      900,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  const aerobicMode = mode.startsWith("Aerobic");
  // Without molecular oxygen the electron-transport chain cannot operate,
  // even when the aerobic mode is selected; only glycolysis contributes ATP.
  const isAerobic = aerobicMode && oxygen > 0;
  const atpTotal = isAerobic
    ? Math.round(30 * glucose * (0.45 + oxygen / 200))
    : Math.round(2 * glucose);
  const nadhTotal = isAerobic
    ? Math.round(10 * glucose)
    : Math.round(2 * glucose);
  const co2Released = isAerobic
    ? Math.round(6 * glucose)
    : Math.round(0 * glucose);
  const resetSimulation = () => {
    setMode("Aerobic respiration");
    setStep(2);
    setOxygen(100);
    setGlucose(1);
    setRunning(false);
    setCarbon("Trace carbon 1");
    announce("Simulation reset");
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[68px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-6">
        <Activity size={36} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Metabolism Pathway Simulator</h1>
          <p className="text-sm text-cyan-200">
            Track every carbon and electron
          </p>
        </div>
        <div className="ml-auto flex rounded border border-white/20 text-xs">
          <button
            onClick={() => {
              setMode("Aerobic respiration");
              announce("Aerobic respiration selected");
            }}
            className={`px-4 py-2 ${isAerobic ? "bg-cyan-300/15 text-cyan-200" : ""}`}
          >
            Aerobic respiration
          </button>
          <button
            onClick={() => {
              setMode("Anaerobic");
              announce("Anaerobic glycolysis selected");
            }}
            className={`px-4 py-2 ${!isAerobic ? "bg-amber-300/15 text-amber-200" : ""}`}
          >
            Anaerobic (glycolysis only)
          </button>
          <button
            onClick={() => announce("Compare mode selected")}
            className="px-4 py-2"
          >
            Compare modes
          </button>
        </div>
        <Settings2 size={18} />
      </header>
      <div
        className="grid h-[calc(100vh-68px)] grid-rows-[1fr_110px] gap-2 p-2"
        style={{
          gridTemplateColumns: "154px minmax(0, 1.05fr) minmax(0, 1fr) 320px",
        }}
      >
        <aside className="row-span-2 overflow-hidden border-r border-white/10 bg-[#081c2d] p-2">
          {[
            "Pathway Map",
            "Molecules",
            "Enzymes",
            "Simulations",
            "Graphs",
            "Cellular View",
            "Quiz",
            "Resources",
          ].map((item, index) => (
            <button
              key={item}
              onClick={() => announce(`${item} selected`)}
              className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-3 text-left text-xs ${index === 0 ? "bg-blue-500/25 text-blue-200" : "text-slate-300 hover:bg-white/10"}`}
            >
              <span className="text-cyan-300">
                {index === 0 ? "⌘" : index === 3 ? "♧" : "◌"}
              </span>
              {item}
            </button>
          ))}
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-br from-[#15344e] to-[#0a1725] p-4">
          <h2 className="font-bold">Pathway Map</h2>
          <div className="mt-4 h-[calc(100%-38px)]">
            <PathwayMap
              aerobic={isAerobic}
              glucose={glucose}
              running={running}
            />
          </div>
          {/* legacy pathway markup replaced by the target-aligned SVG map */}
          <div className="hidden">
            <div className="text-xl">Glucose (C₆)</div>
            <div className="mx-auto w-56 rounded border border-cyan-300/50 bg-cyan-300/10 p-3 text-left text-xs">
              <b className="text-cyan-200">Glycolysis</b>
              <br />
              Glucose → 2 Pyruvate
              <br />
              <b>2 ATP　2 NADH · {glucose.toFixed(1)} mM input</b>
            </div>
            <div className={`text-2xl ${isAerobic ? "" : "opacity-30"}`}>↓</div>
            <div
              className={`mx-auto w-56 rounded border border-amber-300/50 bg-amber-300/10 p-3 text-left text-xs ${isAerobic ? "" : "opacity-40"}`}
            >
              <b className="text-amber-200">Pyruvate oxidation</b>
              <br />2 Pyruvate → 2 Acetyl-CoA
              <br />
              <b>2 NADH　2 CO₂</b>
            </div>
            <div className={`text-2xl ${isAerobic ? "" : "opacity-30"}`}>↓</div>
            <div
              className={`mx-auto w-64 rounded-full border border-violet-300/60 bg-violet-300/10 p-5 text-xs ${isAerobic ? "" : "opacity-40"}`}
            >
              <b>Citric acid cycle</b>
              <br />2 Acetyl-CoA → 4 CO₂
              <br />
              <b>6 NADH　2 FADH₂　2 ATP</b>
            </div>
            <div className={`text-2xl ${isAerobic ? "" : "opacity-30"}`}>↓</div>
            <div
              className={`mx-auto w-60 rounded border border-emerald-300/50 bg-emerald-300/10 p-3 text-xs ${isAerobic ? "" : "opacity-40"}`}
            >
              <b>Electron transport chain</b>
              <br />
              NADH/FADH₂ → ATP
              <br />
              <b>{isAerobic ? "~26–28 ATP" : "ETC paused in anaerobic mode"}</b>
            </div>
          </div>
        </main>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Citric Acid Cycle – Aconitase Step
              </h2>
              <p className="text-sm text-cyan-200">
                Citrate → Isocitrate (isomerization)
              </p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs ${step === i ? "bg-cyan-300 text-slate-900" : "border border-white/20"}`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 h-64 rounded border border-cyan-300/30 bg-gradient-to-br from-indigo-900/60 to-purple-800/40">
            <MoleculeStep step={step} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border border-white/10 p-3">
              <b>Citrate (C₆)</b>
              <p className="mt-3 text-cyan-200">C₆H₈O₇ · citrate</p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b>Isocitrate (C₆)</b>
              <p className="mt-3 text-amber-200">C₆H₈O₇ · isocitrate</p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b>Energy carriers</b>
              <p className="mt-3">
                NAD⁺　FAD
                <br />
                Not used in this step
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            Aconitase catalyzes the reversible isomerization via a cis-aconitate
            intermediate.
          </p>
        </section>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Live Energy & Carbon Balance</h2>
          {[
            ["☀", "ATP (total)", atpTotal],
            ["🔵", "NADH", nadhTotal],
            ["🟣", "FADH₂", isAerobic ? Math.round(2 * glucose) : 0],
            [
              "⚫",
              "CO₂ (carbons released)",
              `${co2Released} / ${Math.round(6 * glucose)}`,
            ],
            [
              "©",
              "Carbons in pathway",
              `${Math.round((isAerobic ? 0 : 2) * glucose)} / ${Math.round(6 * glucose)}`,
            ],
          ].map((r) => (
            <div
              key={r[1]}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span>
                {r[0]}　{r[1]}
              </span>
              <b className="text-cyan-200">{r[2]}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Carbon Tracking</h2>
          <select
            value={carbon}
            onChange={(e) => setCarbon(e.target.value)}
            className="mt-2 w-full rounded bg-slate-950 p-2 text-xs"
          >
            <option>Trace carbon 1</option>
            <option>Trace carbon 2</option>
          </select>
          <p className="mt-3 text-xs leading-6">
            🔵 Current position:{" "}
            {isAerobic ? "Isocitrate (C₆)" : "Pyruvate (C₃)"}
            <br />◉ Path traveled:
            <br />
            Glucose → Pyruvate
            {isAerobic ? " → Acetyl-CoA → Citrate → Isocitrate" : ""}
            <br />
            🟢 Final fate: {isAerobic ? "CO₂ (C1)" : "Lactate (C3)"} · {carbon}
          </p>
          <h2 className="mt-5 font-bold">Simulation Outputs</h2>
          <div className="mt-2 rounded border border-cyan-300/30 bg-gradient-to-t from-amber-300/40 to-transparent p-3 text-xs">
            <p className="text-slate-300">
              {isAerobic ? "Aerobic yield" : "Anaerobic yield"}
            </p>
            <p className="mt-2 text-2xl font-black text-amber-200">
              {atpTotal} ATP
            </p>
            <p className="text-slate-400">
              O₂ {oxygen}% · glucose {glucose.toFixed(1)} mM
            </p>
          </div>
        </aside>
        <section className="col-span-2 flex items-center gap-8 rounded-lg border border-white/10 bg-[#0a1e31] p-4 text-xs">
          <label>
            O₂ availability　{oxygen}%
            <input
              type="range"
              min="0"
              max="100"
              value={oxygen}
              onChange={(e) => setOxygen(+e.target.value)}
              className="ml-3 w-40 accent-cyan-300"
            />
          </label>
          <label>
            Glucose input　{glucose.toFixed(1)} mM
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={glucose}
              onChange={(e) => setGlucose(+e.target.value)}
              className="ml-3 w-40 accent-cyan-300"
            />
          </label>
          <button
            onClick={() => {
              setRunning((v) => !v);
              announce(running ? "Simulation paused" : "Simulation running");
            }}
            className="ml-auto rounded bg-emerald-500 px-5 py-3 text-sm font-bold"
          >
            <Play size={15} className="mr-1 inline" />
            {running ? "Pause" : "Run Simulation"}
          </button>
          <button
            onClick={resetSimulation}
            className="rounded border border-white/20 px-4 py-3"
          >
            <RotateCcw size={14} className="inline" /> Reset
          </button>
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
