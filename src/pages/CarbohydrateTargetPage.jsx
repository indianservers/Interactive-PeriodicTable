import { useEffect, useMemo, useState } from "react";
import { CircleHelp, Dna, Link2, Play, Settings2 } from "lucide-react";
import "./biochemistryPages.css";

const groups = {
  Monosaccharides: [
    "D-Glucose",
    "D-Fructose",
    "D-Galactose",
    "D-Mannose",
    "D-Ribose",
    "D-Xylose",
  ],
  Disaccharides: ["Sucrose", "Lactose", "Maltose", "Cellobiose"],
  Polysaccharides: [
    "Starch",
    "Glycogen",
    "Cellulose",
    "Chitin",
    "Hyaluronic acid",
  ],
};
const profiles = {
  "D-Glucose": {
    formula: "C₆H₁₂O₆",
    ring: "α-D-glucopyranose",
    reducing: true,
    stereos: [
      ["C2", "OH right", "R"],
      ["C3", "OH left", "S"],
      ["C4", "OH right", "R"],
      ["C5", "OH right", "R"],
      ["C1 (anomeric)", "—", "—"],
    ],
  },
  "D-Fructose": {
    formula: "C₆H₁₂O₆",
    ring: "β-D-fructofuranose",
    reducing: true,
    stereos: [
      ["C3", "OH left", "S"],
      ["C4", "OH right", "R"],
      ["C5", "OH right", "R"],
      ["C2 (anomeric)", "—", "—"],
    ],
  },
  "D-Galactose": {
    formula: "C₆H₁₂O₆",
    ring: "α-D-galactopyranose",
    reducing: true,
    stereos: [
      ["C2", "OH right", "R"],
      ["C3", "OH left", "S"],
      ["C4", "OH left", "S"],
      ["C5", "OH right", "R"],
    ],
  },
  "D-Mannose": {
    formula: "C₆H₁₂O₆",
    ring: "α-D-mannopyranose",
    reducing: true,
    stereos: [
      ["C2", "OH left", "S"],
      ["C3", "OH left", "S"],
      ["C4", "OH right", "R"],
      ["C5", "OH right", "R"],
    ],
  },
  "D-Ribose": {
    formula: "C₅H₁₀O₅",
    ring: "β-D-ribofuranose",
    reducing: true,
    stereos: [
      ["C2", "OH right", "R"],
      ["C3", "OH right", "R"],
      ["C4", "OH right", "R"],
    ],
  },
  "D-Xylose": {
    formula: "C₅H₁₀O₅",
    ring: "α-D-xylopyranose",
    reducing: true,
    stereos: [
      ["C2", "OH right", "R"],
      ["C3", "OH left", "S"],
      ["C4", "OH right", "R"],
    ],
  },
  Sucrose: {
    formula: "C₁₂H₂₂O₁₁",
    ring: "α-D-glucopyranosyl-(1→2)-β-D-fructofuranoside",
    reducing: false,
    stereos: [
      ["Glucose C1", "acetal", "—"],
      ["Fructose C2", "ketal", "—"],
    ],
  },
  Lactose: {
    formula: "C₁₂H₂₂O₁₁",
    ring: "β-D-galactopyranosyl-(1→4)-D-glucose",
    reducing: true,
    stereos: [
      ["Gal C1", "β linkage", "—"],
      ["Glc C1", "free", "—"],
    ],
  },
  Maltose: {
    formula: "C₁₂H₂₂O₁₁",
    ring: "α-D-glucopyranosyl-(1→4)-D-glucose",
    reducing: true,
    stereos: [
      ["Glc C1", "α linkage", "—"],
      ["Glc C1'", "free", "—"],
    ],
  },
  Cellobiose: {
    formula: "C₁₂H₂₂O₁₁",
    ring: "β-D-glucopyranosyl-(1→4)-D-glucose",
    reducing: true,
    stereos: [
      ["Glc C1", "β linkage", "—"],
      ["Glc C1'", "free", "—"],
    ],
  },
  Starch: {
    formula: "(C₆H₁₀O₅)ₙ",
    ring: "α(1→4) amylose + α(1→6) amylopectin",
    reducing: true,
    stereos: [["Anomeric", "α glycosidic", "—"]],
  },
  Glycogen: {
    formula: "(C₆H₁₀O₅)ₙ",
    ring: "α(1→4), α(1→6) highly branched",
    reducing: true,
    stereos: [["Anomeric", "α glycosidic", "—"]],
  },
  Cellulose: {
    formula: "(C₆H₁₀O₅)ₙ",
    ring: "β(1→4) glucan",
    reducing: true,
    stereos: [["Anomeric", "β glycosidic", "—"]],
  },
  Chitin: {
    formula: "(C₈H₁₃O₅N)ₙ",
    ring: "β(1→4) N-acetylglucosamine",
    reducing: true,
    stereos: [["Anomeric", "β glycosidic", "—"]],
  },
  "Hyaluronic acid": {
    formula: "(C₁₄H₂₁NO₁₁)ₙ",
    ring: "β(1→3), β(1→4) repeating disaccharide",
    reducing: true,
    stereos: [["Anomeric", "β glycosidic", "—"]],
  },
};

function RingProjection({ alpha }) {
  return (
    <svg
      viewBox="0 0 260 250"
      className="mx-auto h-[230px] w-full max-w-[270px]"
      aria-label="Haworth ring projection"
    >
      <path
        d="M48 125 L92 48 L190 48 L232 125 L190 202 L92 202 Z"
        fill="rgba(13,66,91,.28)"
        stroke="#38d9ff"
        strokeWidth="3"
      />
      <text x="135" y="105" fill="#e5f5ff" fontSize="26" textAnchor="middle">
        O
      </text>
      <text x="93" y="34" fill="#d5ecff" fontSize="16" textAnchor="middle">
        6
      </text>
      <text x="239" y="131" fill="#d5ecff" fontSize="16">
        1
      </text>
      <text x="190" y="225" fill="#d5ecff" fontSize="16">
        2
      </text>
      <text x="88" y="225" fill="#d5ecff" fontSize="16">
        3
      </text>
      <text x="28" y="131" fill="#d5ecff" fontSize="16">
        4
      </text>
      <text x="59" y="63" fill="#d5ecff" fontSize="16">
        5
      </text>
      <text x="204" y="84" fill="#42ff93" fontSize="18" fontWeight="700">
        OH
      </text>
      <text x="182" y="184" fill="#ffc530" fontSize="17">
        OH
      </text>
      <text x="71" y="184" fill="#42d8ff" fontSize="17">
        OH
      </text>
      <text x="40" y="84" fill="#ff54df" fontSize="17">
        HO
      </text>
      <text x="90" y="20" fill="#f4f8ff" fontSize="17">
        CH₂OH
      </text>
      <text x="243" y="110" fill={alpha ? "#42ff93" : "#ffc530"} fontSize="17">
        OH
      </text>
    </svg>
  );
}
function ChairProjection({ running, view }) {
  return (
    <div data-bio-page="carbohydrate"
      className={`relative mx-auto h-[230px] w-full max-w-[270px] transition-transform duration-700 ${running ? "scale-[1.03]" : ""}`}
    >
      <svg
        viewBox="0 0 280 240"
        className={`h-full w-full ${view === "Space filling" ? "drop-shadow-[0_0_16px_rgba(56,217,255,.45)]" : ""}`}
        aria-label="3D chair conformation"
      >
        <path
          d="M58 153 L91 75 L165 57 L224 105 L193 183 L117 198 Z"
          fill="rgba(31,122,150,.22)"
          stroke="#38d9ff"
          strokeWidth="3"
        />
        <path
          d="M91 75 L117 198 M165 57 L193 183 M224 105 L193 183"
          stroke="#bed7e8"
          strokeWidth="8"
          opacity=".85"
        />
        {[
          [58, 153, "C4", "#ff4ad8"],
          [91, 75, "C5", "#58d9ff"],
          [165, 57, "C6", "#ff4b48"],
          [224, 105, "C1", "#4dff91"],
          [193, 183, "C2", "#ffc735"],
          [117, 198, "C3", "#34d9ff"],
        ].map(([x, y, label, c]) => (
          <g key={label}>
            <circle
              cx={x}
              cy={y}
              r={view === "Space filling" ? 18 : 12}
              fill={c}
              stroke="#e8f7ff"
              strokeWidth="2"
            />
            <text
              x={x}
              y={y + 5}
              fill="#071522"
              fontSize="11"
              textAnchor="middle"
              fontWeight="700"
            >
              {label}
            </text>
          </g>
        ))}
        <circle cx="242" cy="70" r="10" fill="#ff4b48" />
        <circle cx="72" cy="205" r="9" fill="#ff4b48" />
        <circle cx="223" cy="161" r="9" fill="#ff4b48" />
      </svg>
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-cyan-200">
        α-D-glucopyranose ⁴C₁ chair
      </span>
    </div>
  );
}

export default function CarbohydrateTargetPage() {
  const [sugar, setSugar] = useState("D-Glucose");
  const [tab, setTab] = useState("Ring closure");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(50);
  const [anomer, setAnomer] = useState("α");
  const [view, setView] = useState("Ball & stick");
  const [hydrogens, setHydrogens] = useState(true);
  const [monomer1, setMonomer1] = useState("D-Glucose");
  const [monomer2, setMonomer2] = useState("D-Glucose");
  const [linkage, setLinkage] = useState("β (1→4)");
  const [built, setBuilt] = useState(false);
  const [notice, setNotice] = useState("");
  const profile = profiles[sugar] || profiles["D-Glucose"];
  const announce = (message) => setNotice(message);
  const builtText = useMemo(
    () => `${monomer1} + ${monomer2} · ${linkage} linkage`,
    [linkage, monomer1, monomer2],
  );
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setProgress((value) => (value >= 100 ? 0 : value + 1)),
      90,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-5 border-b border-white/10 bg-[#071b2b] px-6">
        <Dna size={39} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black tracking-tight">
            Carbohydrate Structure Studio
          </h1>
          <p className="text-sm text-slate-400">
            Visualize · Explore · Build · Understand
          </p>
        </div>
        <nav className="ml-auto flex items-center gap-3 text-xs">
          {["Structure", "Reactions", "Properties", "Biology", "Quizzes"].map(
            (item) => (
              <button
                key={item}
                onClick={() => announce(`${item} view selected`)}
                className={`rounded px-4 py-2 ${item === "Structure" ? "border border-cyan-300 bg-cyan-300/15 text-cyan-200" : "text-slate-300 hover:bg-white/10"}`}
              >
                {item}
              </button>
            ),
          )}
          <Settings2 size={19} className="ml-3 text-slate-300" />
        </nav>
      </header>
      <div
        className="grid h-[calc(100vh-70px)] gap-2 p-2"
        style={{ gridTemplateColumns: "230px minmax(0, 1fr) 338px" }}
      >
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#081d2e] p-3">
          {Object.entries(groups).map(([heading, items]) => (
            <section
              key={heading}
              className="mb-4 border-b border-white/10 pb-3 last:border-0"
            >
              <h2 className="mb-2 flex items-center justify-between font-bold text-cyan-200">
                {heading}
                <span className="text-xs text-slate-400">⌃</span>
              </h2>
              {items.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setSugar(item);
                    setBuilt(false);
                    announce(`${item} selected`);
                  }}
                  className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-2 text-left text-xs ${item === sugar ? "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/30" : "text-slate-300 hover:bg-white/10"}`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full border border-cyan-200/70">
                    ⬡
                  </span>
                  {item}
                </button>
              ))}
            </section>
          ))}
          <div className="space-y-3 pt-2 text-xs">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={hydrogens}
                onChange={(event) => setHydrogens(event.target.checked)}
                className="accent-cyan-300"
              />
              Show hydrogens{" "}
              <span className="ml-auto h-4 w-8 rounded-full bg-cyan-400/80 p-0.5">
                <span
                  className={`block h-3 w-3 rounded-full bg-white transition-transform ${hydrogens ? "translate-x-4" : ""}`}
                />
              </span>
            </label>
            {["Ball & stick", "Space filling", "Sticks", "Standard colors"].map(
              (item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 text-slate-300"
                >
                  <input
                    type="radio"
                    name="carb-view"
                    checked={view === item}
                    onChange={() => setView(item)}
                    className="accent-cyan-300"
                  />
                  {item}
                </label>
              ),
            )}
          </div>
        </aside>
        <main className="min-w-0 rounded-lg border border-white/10 bg-[#081d2e] p-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold">{sugar}</h2>
              <p className="text-sm text-slate-400">
                {profile.formula} · {profile.ring}
              </p>
            </div>
            <span className="rounded-full border border-cyan-300/40 px-3 py-1 text-xs text-cyan-200">
              {anomer}-anomer
            </span>
          </div>
          <div className="mt-2 flex border-b border-white/10">
            {["Ring closure", "α and β anomers", "Build glycosidic bond"].map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setTab(item);
                    announce(`${item} selected`);
                  }}
                  className={`px-5 py-3 text-xs ${tab === item ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400 hover:text-white"}`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
          <div className="mt-3 grid h-[393px] grid-cols-3 items-center gap-1 text-center">
            <div>
              <h3 className="font-bold">Fischer projection</h3>
              <svg
                viewBox="0 0 210 260"
                className="mx-auto mt-1 h-[255px] w-full"
              >
                <path
                  d="M105 34 V230 M62 76 H148 M62 132 H148 M62 188 H148"
                  stroke="#e7f6ff"
                  strokeWidth="3"
                />
                {[
                  [105, 24, "CHO"],
                  [44, 76, "H"],
                  [164, 76, "OH"],
                  [42, 132, "HO"],
                  [164, 132, "H"],
                  [42, 188, "H"],
                  [164, 188, "OH"],
                  [105, 245, "CH₂OH"],
                ].map(([x, y, label]) => (
                  <text
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    fill={
                      label === "OH"
                        ? "#42d9ff"
                        : label === "HO"
                          ? "#ff58db"
                          : "#f5fbff"
                    }
                    fontSize="18"
                    textAnchor="middle"
                  >
                    {label}
                  </text>
                ))}
              </svg>
            </div>
            <div className="border-x border-white/10">
              <h3 className="font-bold">Haworth projection</h3>
              <RingProjection alpha={anomer === "α"} />
              <p className="text-sm text-cyan-200">
                {anomer}-{sugar}
              </p>
            </div>
            <div>
              <h3 className="font-bold">3D chair conformation</h3>
              <ChairProjection running={running} view={view} />
              <p className="text-xs text-slate-400">
                {hydrogens ? "Hydrogens shown" : "Hydrogens hidden"} · {view}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 border-y border-white/10 py-2">
            <button
              aria-label={running ? "Pause animation" : "Play animation"}
              onClick={() => setRunning((value) => !value)}
              className="grid h-12 w-12 place-items-center rounded-full border border-cyan-300/50 bg-cyan-300/10 text-cyan-200"
            >
              <Play size={19} className={running ? "rotate-90" : ""} />
            </button>
            <input
              aria-label="Ring closure progress"
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(event) => setProgress(+event.target.value)}
              className="flex-1 accent-cyan-300"
            />
            <span className="w-12 text-right text-xs text-cyan-200">
              {progress}%
            </span>
            <div className="flex gap-3 text-xs text-slate-300">
              <label>
                <input
                  type="radio"
                  name="anomer"
                  checked={anomer === "α"}
                  onChange={() => setAnomer("α")}
                  className="mr-1 accent-cyan-300"
                />
                Ring closure
              </label>
              <label>
                <input
                  type="radio"
                  name="anomer"
                  checked={anomer === "β"}
                  onChange={() => setAnomer("β")}
                  className="mr-1 accent-cyan-300"
                />
                α ↔ β
              </label>
            </div>
          </div>
          <section className="mt-3 rounded border border-white/10 p-3">
            <h3 className="font-bold">
              Cellulose vs Starch{" "}
              <span className="font-normal text-slate-400">
                — structural and functional comparison
              </span>
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-emerald-300/50 bg-emerald-300/5 p-3">
                <b className="text-lg text-emerald-300">Cellulose</b>
                <p className="mt-2">
                  β(1→4) linkage · extended unbranched chains · structural cell
                  walls
                </p>
                <p className="mt-2 text-slate-400">
                  High tensile strength · insoluble in water
                </p>
              </div>
              <div className="rounded border border-amber-300/50 bg-amber-300/5 p-3">
                <b className="text-lg text-amber-300">Starch</b>
                <p className="mt-2">
                  α(1→4) and α(1→6) linkages · helical and branched · energy
                  storage
                </p>
                <p className="mt-2 text-slate-400">
                  More soluble · compact granules
                </p>
              </div>
            </div>
          </section>
        </main>
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#081d2e] p-4">
          <h2 className="flex items-center gap-2 font-bold">
            Stereocenter assignments{" "}
            <CircleHelp size={14} className="text-slate-400" />
          </h2>
          <div className="mt-3 rounded border border-white/10 text-xs">
            <div className="grid grid-cols-3 border-b border-white/10 p-2 font-bold">
              <span>Carbon</span>
              <span>Configuration</span>
              <span>R / S</span>
            </div>
            {profile.stereos.map(([carbon, config, rs]) => (
              <div
                key={carbon}
                className="grid grid-cols-3 border-b border-white/10 p-2"
              >
                <span>{carbon}</span>
                <span>{config}</span>
                <span className="text-cyan-200">{rs}</span>
              </div>
            ))}
          </div>
          <h2 className="mt-5 font-bold">
            Reducing-sugar test{" "}
            <CircleHelp size={14} className="ml-1 inline text-slate-400" />
          </h2>
          <div
            className={`mt-2 rounded border p-3 text-xs ${profile.reducing ? "border-emerald-300/40 bg-emerald-300/10" : "border-amber-300/40 bg-amber-300/10"}`}
          >
            <span className="text-lg">{profile.reducing ? "✓" : "!"}</span>{" "}
            <b>
              {sugar} is{" "}
              {profile.reducing ? "a reducing sugar" : "non-reducing"}.
            </b>
            <p className="mt-2 text-slate-300">
              {profile.reducing
                ? "The anomeric carbon can open to a carbonyl form and reduce Benedict’s reagent."
                : "Both anomeric centers are involved in the glycosidic bond, so no free carbonyl is available."}
            </p>
          </div>
          <h2 className="mt-5 font-bold text-cyan-200">
            Build glycosidic bond{" "}
            <CircleHelp size={14} className="ml-1 inline text-slate-400" />
          </h2>
          <label className="mt-2 block text-xs text-slate-400">
            Monomer 1
            <select
              value={monomer1}
              onChange={(event) => {
                setMonomer1(event.target.value);
                setBuilt(false);
              }}
              className="mt-1 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs text-white"
            >
              {Object.keys(profiles)
                .slice(0, 6)
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </label>
          <label className="mt-2 block text-xs text-slate-400">
            Monomer 2
            <select
              value={monomer2}
              onChange={(event) => {
                setMonomer2(event.target.value);
                setBuilt(false);
              }}
              className="mt-1 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs text-white"
            >
              {Object.keys(profiles)
                .slice(0, 6)
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </label>
          <label className="mt-2 block text-xs text-slate-400">
            Linkage
            <select
              value={linkage}
              onChange={(event) => {
                setLinkage(event.target.value);
                setBuilt(false);
              }}
              className="mt-1 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs text-white"
            >
              <option>β (1→4)</option>
              <option>α (1→4)</option>
              <option>α (1→6)</option>
            </select>
          </label>
          <button
            onClick={() => {
              setBuilt(true);
              announce("Glycosidic bond built");
            }}
            className="mt-3 w-full rounded bg-blue-500 px-3 py-3 text-xs font-bold hover:bg-blue-400"
          >
            <Link2 size={15} className="mr-1 inline" />
            Build glycosidic bond
          </button>
          {built && (
            <div className="mt-2 rounded border border-emerald-300/40 bg-emerald-300/10 p-2 text-xs text-emerald-200">
              Bond built ✓<br />
              <span className="text-slate-300">{builtText}</span>
            </div>
          )}
        </aside>
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
