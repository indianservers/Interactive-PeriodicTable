import { useEffect, useState } from "react";
import {
  Beaker,
  BookOpen,
  CheckCircle2,
  FlaskConical,
  Play,
  Search,
} from "lucide-react";
const lessons = ["Molecular forces", "Proteins", "Enzymes", "Metabolism"];
function EnzymeScene({ stage }) {
  const substrateX =
    stage === 0 ? 408 : stage === 1 ? 344 : stage === 2 ? 300 : 430;
  return (
    <svg
      viewBox="0 0 720 350"
      className="h-full w-full"
      role="img"
      aria-label="Interactive enzyme active site"
    >
      <defs>
        <radialGradient id="enzymeGlow">
          <stop stopColor="#60a5fa" stopOpacity=".5" />
          <stop offset="1" stopColor="#0b1730" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="protein" x1="0" x2="1" y1="0" y2="1">
          <stop stopColor="#5b9cf6" />
          <stop offset=".48" stopColor="#274b9c" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="soft">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6Z" fill="#fbbf24" />
        </marker>
      </defs>
      <rect width="720" height="350" fill="url(#enzymeGlow)" />
      <ellipse
        cx="352"
        cy="178"
        rx="250"
        ry="140"
        fill="#172e64"
        opacity=".55"
        filter="url(#soft)"
      />
      <path
        d="M98 193C74 120 139 57 232 69c46-61 151-61 190 0 85-23 171 32 164 111 67 43 27 123-47 122-52 48-141 43-182 0-85 29-170-17-159-77-66-20-86-89 0-132Z"
        fill="url(#protein)"
        stroke="#79b8ff"
        strokeWidth="3"
        opacity=".95"
      />
      <path
        d="M246 120c36-31 98-28 129 8 19 23 19 48 2 65-22 23-59 17-80 40-25 28-72 10-77-24-3-23 4-67 26-89Z"
        fill="#0a1228"
        stroke="#d8b4ff"
        strokeWidth="4"
        opacity=".96"
      />
      <path
        d="M281 160c22-10 48-9 69 4"
        fill="none"
        stroke="#f0abfc"
        strokeWidth="3"
        strokeDasharray="6 5"
      />
      {Array.from({ length: 18 }, (_, i) => (
        <circle
          key={i}
          cx={145 + ((i * 47) % 380)}
          cy={95 + ((i * 71) % 165)}
          r={i % 4 === 0 ? 5 : 3}
          fill={i % 3 === 0 ? "#bae6fd" : "#93c5fd"}
          opacity=".8"
        />
      ))}
      <g
        transform={`translate(${substrateX} ${stage === 1 ? 136 : 112})`}
        className="transition-transform"
      >
        <circle r="20" fill="#f59e0b" stroke="#fde68a" strokeWidth="3" />
        <circle
          cx="25"
          cy="-12"
          r="13"
          fill="#ef4444"
          stroke="#fecaca"
          strokeWidth="2"
        />
        <circle
          cx="24"
          cy="15"
          r="13"
          fill="#22c55e"
          stroke="#bbf7d0"
          strokeWidth="2"
        />
        <path
          d="M-15 0h-25"
          stroke="#fbbf24"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />
      </g>
      <text x="24" y="326" fill="#cbd5e1" fontSize="13">
        Enzyme active site
      </text>
      <text x="566" y="326" fill="#cbd5e1" fontSize="13">
        Substrate → product
      </text>
    </svg>
  );
}
export default function BiochemistryTargetPage() {
  const [s, setS] = useState(2.4),
    [temp, setTemp] = useState(37),
    [ph, setPh] = useState(7.4),
    [stage, setStage] = useState(0),
    [run, setRun] = useState(false),
    [tab, setTab] = useState("Hypothesis"),
    [inhibitor, setInhibitor] = useState("None"),
    [chartMode, setChartMode] = useState("Michaelis–Menten"),
    [seriesProgress, setSeriesProgress] = useState(0),
    [evidence, setEvidence] = useState({}),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (!run) return undefined;
    const timer = window.setInterval(
      () => setSeriesProgress((value) => (value >= 100 ? 0 : value + 5)),
      180,
    );
    return () => window.clearInterval(timer);
  }, [run]);
  const rate = Math.round(
    ((120 * s) / (2.4 + s)) *
      Math.max(0.2, 1 - Math.abs(temp - 37) / 80) *
      Math.max(0.3, 1 - Math.abs(ph - 7.4) / 8) *
      (inhibitor === "None"
        ? 1
        : inhibitor === "Competitive inhibitor"
          ? 0.72
          : 0.55),
  );
  const msg = (x) => setNotice(x);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071727] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[62px] items-center gap-4 border-b border-white/10 bg-[#0b1e30] px-5">
        <FlaskConical className="text-cyan-300" />
        <div>
          <h1 className="text-xl font-black">Biochemistry Module</h1>
          <p className="text-xs text-slate-400">Explore molecular life</p>
        </div>
        <label className="ml-auto flex w-96 gap-2 rounded border border-white/15 px-3 py-2 text-xs text-slate-400">
          <Search size={14} />
          <input
            placeholder="Search concepts, molecules, or labs..."
            className="w-full bg-transparent outline-none"
          />
        </label>
        <span className="text-xs text-blue-300">⚗ Lab</span>
        <span className="text-xs">▤ Notebook</span>
        <span className="text-xs">▣ Resources</span>
        <span className="rounded-full bg-blue-500 px-3 py-2 text-xs">ST</span>
      </header>
      <div className="grid h-[calc(100vh-62px)] grid-cols-[240px_1fr_345px] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0b2134] p-4">
          <h3 className="mb-3 text-sm font-bold">Lesson Sequence</h3>
          {lessons.map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setStage(i);
                msg(`${x} lesson selected`);
              }}
              className={`relative mb-3 flex w-full gap-3 rounded p-3 text-left ${stage === i ? "border-l-2 border-blue-400 bg-blue-500/15" : ""}`}
            >
              <span
                className={`grid h-7 w-7 place-items-center rounded-full ${stage === i ? "bg-indigo-500" : "bg-slate-700"}`}
              >
                {i + 1}
              </span>
              <span className="text-xs">
                <b>{x}</b>
                <small className="mt-1 block text-slate-400">
                  {
                    [
                      "Noncovalent interactions",
                      "Structure, folding and function",
                      "How enzymes control reaction rate",
                      "Enzyme networks in cells",
                    ][i]
                  }
                </small>
              </span>
              {i < 2 && (
                <CheckCircle2 size={14} className="ml-auto text-emerald-300" />
              )}
            </button>
          ))}
          {[
            "Interactive Lab",
            "Concept Check",
            "Practice Problems",
            "Key Terms",
            "Further Reading",
          ].map((x) => (
            <button
              key={x}
              onClick={() => msg(`${x} opened`)}
              className="flex w-full gap-3 border-t border-white/5 px-2 py-3 text-left text-xs text-slate-300"
            >
              {x}
            </button>
          ))}
          <div className="mt-8 rounded border border-blue-300/30 bg-blue-500/10 p-4 text-xs text-blue-100">
            Small changes.
            <br />
            <b>Big reactions.</b>
          </div>
        </aside>
        <main className="min-w-0 overflow-auto">
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-[.25em] text-blue-300">
              ENZYMES　›　ENZYME KINETICS LAB
            </p>
            <h2 className="text-3xl font-black">Enzyme Kinetics Lab</h2>
            <p className="text-sm text-blue-200">
              How enzymes control reaction rate
            </p>
            <p className="text-xs text-slate-400">
              Explore how substrate concentration, temperature, pH and
              inhibitors affect enzyme activity.
            </p>
          </div>
          <section className="grid grid-cols-[1fr_250px] gap-3">
            <div className="rounded border border-white/10 bg-gradient-to-br from-[#17375b] via-[#15264b] to-[#101a34] p-3">
              <div className="flex gap-2">
                {[
                  "Substrate binding",
                  "Induced fit",
                  "Transition state stabilization",
                  "Product release",
                ].map((x, i) => (
                  <button
                    key={x}
                    onClick={() => setStage(i)}
                    className={`flex-1 rounded border px-2 py-2 text-[10px] ${stage === i ? "border-blue-300 bg-blue-500/30" : "border-white/10"}`}
                  >
                    {i + 1}　{x}
                  </button>
                ))}
              </div>
              <div className="relative mt-2 grid h-[350px] place-items-center overflow-hidden rounded bg-[linear-gradient(135deg,#152c47,#080f1c)]">
                <EnzymeScene stage={stage} />
                <span className="absolute bottom-3 left-3 text-xs text-slate-300">
                  Substrate (glucose)　　Active site · {stage + 1}/4
                </span>
                <span className="absolute bottom-3 right-3 max-w-48 text-right text-xs text-slate-300">
                  Induced fit brings catalytic residues into optimal position.
                </span>
              </div>
            </div>
            <div className="rounded border border-white/10 bg-[#0b2134] p-3">
              <h3 className="font-bold">Experimental Controls</h3>
              {[
                ["Substrate concentration [S]", s, 0.1, 50, setS, "mM"],
                ["Temperature", temp, 0, 60, setTemp, "°C"],
                ["pH", ph, 4, 10, setPh, ""],
              ].map(([l, v, min, max, set, u]) => (
                <label key={l} className="mt-5 block text-xs">
                  {l}
                  <output className="float-right text-blue-200">
                    {v} {u}
                  </output>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={max - min > 10 ? 0.1 : 0.1}
                    value={v}
                    onChange={(e) => set(+e.target.value)}
                    className="mt-2 w-full accent-blue-400"
                  />
                </label>
              ))}
              <select
                value={inhibitor}
                onChange={(e) => setInhibitor(e.target.value)}
                className="mt-5 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs"
                aria-label="Inhibitor type"
              >
                <option value="None">Inhibitor type · None</option>
                <option>Competitive inhibitor</option>
                <option>Noncompetitive inhibitor</option>
              </select>
              <button
                onClick={() => {
                  if (run) setSeriesProgress(0);
                  setRun(!run);
                  msg(run ? "Series paused" : "Concentration series running");
                }}
                className="mt-5 w-full rounded bg-indigo-500 px-3 py-3 text-xs font-bold"
              >
                <Play size={14} className="mr-1 inline" />
                {run ? "Pause series" : "Run concentration series"}
              </button>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-800" aria-label="Concentration series progress">
                <div className="h-full rounded-full bg-cyan-300 transition-[width]" style={{ width: `${seriesProgress}%` }} />
              </div>
              <p className="mt-1 text-right text-[10px] text-slate-400">Series progress {seriesProgress}%</p>
            </div>
          </section>
          <section className="mt-3 rounded border border-white/10 bg-[#0b2134] p-3">
            <div className="flex justify-between">
              <h3 className="font-bold">
                Reaction rate vs substrate concentration
              </h3>
              <div>
                <button
                  onClick={() => setChartMode("Michaelis–Menten")}
                  className={`rounded border px-3 py-1 text-xs ${chartMode === "Michaelis–Menten" ? "border-blue-400" : "border-white/10 text-slate-400"}`}
                >
                  Michaelis–Menten
                </button>
                <button
                  onClick={() => setChartMode("Lineweaver–Burk")}
                  className={`px-3 py-1 text-xs ${chartMode === "Lineweaver–Burk" ? "text-blue-200" : "text-slate-400"}`}
                >
                  Lineweaver–Burk
                </button>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-[1fr_280px] gap-3">
              <div className="relative h-40 rounded border border-white/10 bg-[linear-gradient(rgba(148,163,184,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,.16)_1px,transparent_1px)] bg-[size:60px_32px]">
                <svg viewBox="0 0 500 150" className="h-full w-full">
                  <path
                    d={
                      chartMode === "Michaelis–Menten"
                        ? "M5 145 C35 85 70 62 115 45 S220 24 490 18"
                        : "M20 135 L470 25"
                    }
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="3"
                  />
                  <path d="M10 140 L490 140" stroke="#94a3b8" />
                  <path d="M10 10 L10 140" stroke="#94a3b8" />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <g key={i}>
                      <text x="2" y={140 - i * 30} fill="#94a3b8" fontSize="8">
                        {i * 30}
                      </text>
                      <text
                        x={25 + i * 110}
                        y="148"
                        fill="#94a3b8"
                        fontSize="8"
                      >
                        {i * 2}
                      </text>
                    </g>
                  ))}
                  {[35, 70, 105, 140, 180, 225, 275, 330, 390, 450].map(
                    (x, i) => (
                      <circle
                        key={x}
                        cx={x}
                        cy={
                          chartMode === "Michaelis–Menten"
                            ? 140 - (112 * (x / 500)) / (0.25 + x / 500)
                            : 136 - x / 5.2
                        }
                        r="3.5"
                        fill="#fbbf24"
                        stroke="#fff7ed"
                        strokeWidth="1"
                      />
                    ),
                  )}
                  <text x="205" y="147" fill="#cbd5e1" fontSize="9">
                    [S] (mM)
                  </text>
                  <text
                    x="-105"
                    y="9"
                    transform="rotate(-90)"
                    fill="#cbd5e1"
                    fontSize="9"
                  >
                    rate (µmol min⁻¹)
                  </text>
                  <text x="18" y="18" fill="#e2e8f0" fontSize="10">
                    {chartMode}
                  </text>
                </svg>
              </div>
              <div>
                <div className="rounded border border-emerald-300/50 p-3 text-xs">
                  <span className="text-emerald-300">Vmax</span>
                  <b className="ml-3 text-lg">
                    {Math.round(
                      120 *
                        (inhibitor === "None"
                          ? 1
                          : inhibitor === "Competitive inhibitor"
                            ? 0.72
                            : 0.55),
                    )}{" "}
                    µmol min⁻¹
                  </b>
                </div>
                <div className="mt-2 rounded border border-purple-300/50 p-3 text-xs">
                  <span className="text-purple-300">Km</span>
                  <b className="ml-3 text-lg">
                    {inhibitor === "Competitive inhibitor" ? "3.3" : "2.4"} mM
                  </b>
                </div>
                <p className="mt-3 text-xs text-slate-400">
                  {chartMode} · rate responds to substrate, temperature, pH, and
                  inhibitor choice.
                </p>
              </div>
            </div>
          </section>
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2134] p-4">
          <h2 className="text-lg font-bold">My Lab Notebook</h2>
          <div className="mt-3 flex border-b border-white/10">
            {["Hypothesis", "Evidence", "Conclusions"].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`flex-1 border-b-2 px-2 py-2 text-xs ${tab === x ? "border-blue-400 text-blue-300" : "border-transparent"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <section className="mt-4 rounded border border-white/10 p-4">
            <h3 className="font-bold">1. Form a hypothesis</h3>
            <p className="mt-2 text-xs text-slate-400">
              How will each factor affect the reaction rate?
            </p>
            <textarea
              placeholder="Type your hypothesis here..."
              className="mt-3 h-20 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs"
            />
            <h3 className="mt-5 font-bold">2. Collect evidence</h3>
            {[
              "Run a concentration series",
              "Test at different temperatures",
              "Test different pH values",
              "Add a competitive inhibitor",
              "Compare Michaelis–Menten plots",
            ].map((x) => (
              <label key={x} className="mt-3 flex gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(evidence[x])}
                  onChange={() => {
                    setEvidence((state) => ({ ...state, [x]: !state[x] }));
                    msg(`${x} ${evidence[x] ? "unchecked" : "checked"}`);
                  }}
                />
                {x}
              </label>
            ))}
            <h3 className="mt-5 font-bold">3. Analyze and conclude</h3>
            <textarea
              placeholder="Type your analysis here..."
              className="mt-3 h-20 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs"
            />
            <div className="mt-4 rounded border border-amber-300/30 bg-amber-300/10 p-3 text-xs">
              Current rate: <b>{rate} µmol min⁻¹</b>
              <br />
              Guiding question: Why does the enzyme lower activation energy?
            </div>
          </section>
        </aside>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/30 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
