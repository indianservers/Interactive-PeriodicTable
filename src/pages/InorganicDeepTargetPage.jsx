import { useState } from "react";
import {
  Beaker,
  BookOpen,
  FlaskConical,
  Home,
  RotateCcw,
  Thermometer,
  Waves,
} from "lucide-react";

const nav = [
  "Home",
  "Coordination Chemistry",
  "Solid State Chemistry",
  "p-Block Chemistry",
  "Transition Metals",
  "Qualitative Analysis",
  "Resources",
  "Simulations",
  "Literature",
  "Settings",
];
const tabDescriptions = {
  Investigation: "Adjust chloride, temperature, dilution and heat to observe Le Châtelier’s principle.",
  Theory: "Compare coordination geometry, ligand-field strength and colour with the equilibrium model.",
  Data: "Read the live composition fractions and wavelength-dependent UV–Vis response.",
  Playground: "Try extreme conditions and reset the experiment when you are ready to compare states.",
};
function CoordinationMolecule({ chloride = false }) {
  const ligand = chloride ? "#22c55e" : "#f87171";
  return (
    <svg
      viewBox="0 0 220 180"
      className="h-44 w-56"
      aria-label={
        chloride
          ? "Tetrahedral cobalt chloride complex"
          : "Octahedral hydrated cobalt complex"
      }
    >
      <defs>
        <filter id={chloride ? "glowGreen" : "glowPink"}>
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <circle
        cx="110"
        cy="90"
        r="28"
        fill="#a855f7"
        filter={`url(#${chloride ? "glowGreen" : "glowPink"})`}
        opacity=".55"
      />
      <circle
        cx="110"
        cy="90"
        r="21"
        fill="#a855f7"
        stroke="#e9d5ff"
        strokeWidth="2"
      />
      {(chloride
        ? [
            [110, 24],
            [49, 125],
            [171, 125],
            [110, 156],
          ]
        : [
            [110, 18],
            [110, 162],
            [38, 90],
            [182, 90],
            [58, 42],
            [162, 138],
          ]
      ).map(([x, y], i) => (
        <g key={i}>
          <line
            x1="110"
            y1="90"
            x2={x}
            y2={y}
            stroke={ligand}
            strokeWidth="7"
            opacity=".85"
          />
          <circle
            cx={x}
            cy={y}
            r="13"
            fill={ligand}
            stroke="#f8fafc"
            strokeWidth="2"
          />
          <circle cx={x - 4} cy={y - 4} r="3" fill="#fff" opacity=".7" />
        </g>
      ))}
      <text x="102" y="95" fill="#fff" fontSize="10" textAnchor="middle">
        Co
      </text>
    </svg>
  );
}
function BeakerScene({ chloride = false, fraction = 50 }) {
  return (
    <div className="relative grid h-[305px] place-items-center overflow-hidden rounded bg-[radial-gradient(circle_at_50%_30%,rgba(96,165,250,.2),transparent_48%),linear-gradient(180deg,#102840,#071827)]">
      <CoordinationMolecule chloride={chloride} />
      <div
        className={`absolute bottom-7 h-36 w-48 rounded-b-[28%] border-2 ${chloride ? "border-blue-300/70 bg-blue-600/55" : "border-pink-300/70 bg-pink-500/45"}`}
      >
        <div className="absolute inset-x-2 top-6 h-1 border-t border-white/60" />
        {Array.from({ length: 12 }, (_, i) => (
          <span
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full ${chloride ? "bg-blue-200" : "bg-pink-200"}`}
            style={{
              left: `${12 + ((i * 29) % 75)}%`,
              top: `${25 + ((i * 37) % 60)}%`,
              opacity: 0.35 + (i % 3) * 0.2,
            }}
          />
        ))}
        <div className="absolute right-3 top-3 flex h-24 flex-col justify-between text-[9px] text-white/80">
          <span>50</span>
          <span>40</span>
          <span>30</span>
          <span>20</span>
          <span>10</span>
        </div>
      </div>
      <span className="absolute bottom-2 text-[10px] text-slate-300">
        {chloride ? "[CoCl₄]²⁻ · aqueous blue" : "[Co(H₂O)₆]²⁺ · aqueous pink"}
      </span>
      <span className="absolute right-3 top-3 rounded bg-slate-950/70 px-2 py-1 text-[10px] text-slate-300">
        {fraction.toFixed(0)}%
      </span>
    </div>
  );
}
export default function InorganicDeepTargetPage() {
  const [chloride, setChloride] = useState(2),
    [temp, setTemp] = useState(25),
    [heat, setHeat] = useState(false),
    [hcl, setHcl] = useState(true),
    [water, setWater] = useState(false),
    [tab, setTab] = useState("Investigation"),
    [noteTab, setNoteTab] = useState("Observations"),
    [newObservation, setNewObservation] = useState(false),
    [notice, setNotice] = useState("");
  const blue = Math.min(
    100,
    Math.max(
      10,
      chloride * 35 +
        (temp - 25) * 0.35 +
        (hcl ? 18 : 0) +
        (heat ? 15 : 0) -
        (water ? 20 : 0),
    ),
  );
  const pink = 100 - blue;
  const msg = (x) => setNotice(x);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071827] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-4 border-b border-white/10 bg-[#0b1e31] px-6">
        <FlaskConical className="text-blue-300" size={30} />
        <div>
          <h1 className="text-xl font-black">Inorganic Chemistry Deep Lab</h1>
          <p className="text-xs text-slate-400">
            Explore structure. Understand reactivity. See the invisible.
          </p>
        </div>
        <div className="ml-auto flex gap-7 text-xs text-slate-300">
          <span className="text-emerald-300">● Lab Mode</span>
          <span>▣ Calculators</span>
          <span>▦ Periodic Table</span>
          <span>▤ Notes</span>
          <span className="rounded-full bg-blue-500/70 px-3 py-2">JS</span>
        </div>
      </header>
      <div className="grid h-[calc(100vh-70px)] grid-cols-[205px_1fr_365px]">
        <aside className="border-r border-white/10 bg-[#0b2034] p-3">
          {nav.map((x, i) => (
            <button
              key={x}
              onClick={() => msg(`${x} selected`)}
              className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-3 text-left text-sm ${i === 1 ? "border-l-2 border-blue-400 bg-blue-500/15 text-blue-200" : "text-slate-300"}`}
            >
              <span>
                {i === 0 ? (
                  <Home size={17} />
                ) : i === 1 ? (
                  <Waves size={17} />
                ) : i === 6 ? (
                  <BookOpen size={17} />
                ) : (
                  <Beaker size={17} />
                )}
              </span>
              {x}
            </button>
          ))}
          <div className="mt-8 border-t border-white/10 pt-7 text-xs italic text-slate-500">
            “Inorganic chemistry connects the elemental to the essential.”
            <br />
            <br />— G. Wilkinson
          </div>
        </aside>
        <main className="min-w-0 overflow-auto p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black">Cobalt equilibrium</h2>
              <p className="text-lg text-blue-200">[Co(H₂O)₆]²⁺ ⇄ [CoCl₄]²⁻</p>
              <p className="text-sm text-slate-400">
                Ligand substitution, colour change and Le Châtelier’s principle
                in action.
              </p>
            </div>
            <div className="flex rounded border border-white/10">
              {["Investigation", "Theory", "Data", "Playground"].map((x) => (
                <button
                  key={x}
                  onClick={() => {
                    setTab(x);
                    msg(`${x} tab selected`);
                  }}
                  className={`px-4 py-3 text-xs ${tab === x ? "border-b-2 border-blue-400 text-blue-300" : "text-slate-400"}`}
                >
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3 rounded border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-xs text-blue-100">
            <b>{tab}:</b> {tabDescriptions[tab]}
          </div>
          <section className="mt-3 grid grid-cols-[1fr_310px_1fr] gap-3">
            <div className="rounded border border-pink-300/20 bg-gradient-to-b from-pink-500/10 to-slate-950 p-3">
              <BeakerScene fraction={pink} />
              <h3 className="text-center text-lg font-bold">[Co(H₂O)₆]²⁺</h3>
              <p className="text-center text-xs text-pink-200">
                (aq, pink) · Octahedral Co(II)
              </p>
            </div>
            <div className="rounded border border-white/10 bg-[#0b2134] p-4">
              <h3 className="font-bold text-blue-200">Shift equilibrium</h3>
              <label className="mt-5 block text-xs">
                [Cl⁻] concentration (M)
                <output className="float-right rounded border border-white/15 px-2">
                  {chloride.toFixed(2)}
                </output>
                <input
                  type="range"
                  min="0.001"
                  max="2"
                  step=".001"
                  value={chloride}
                  onChange={(e) => setChloride(+e.target.value)}
                  className="mt-2 w-full accent-blue-400"
                />
              </label>
              <label className="mt-6 block text-xs">
                Temperature (°C)
                <output className="float-right rounded border border-white/15 px-2">
                  {temp}
                </output>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={temp}
                  onChange={(e) => setTemp(+e.target.value)}
                  className="mt-2 w-full accent-amber-300"
                />
              </label>
              {[
                ["Add HCl (Cl⁻)", hcl, setHcl],
                ["Add H₂O (dilute)", water, setWater],
                ["Heat solution", heat, setHeat],
              ].map(([x, v, s]) => (
                <button
                  key={x}
                  onClick={() => s(!v)}
                  className="mt-4 flex w-full items-center gap-3 text-left text-xs"
                >
                  <span
                    className={`h-5 w-9 rounded-full p-1 ${v ? "bg-blue-500" : "bg-slate-700"}`}
                  >
                    <span
                      className={`block h-3 w-3 rounded-full bg-white transition ${v ? "translate-x-4" : ""}`}
                    />
                  </span>
                  {x}
                </button>
              ))}
              <button
                onClick={() => {
                  setChloride(2);
                  setTemp(25);
                  setHcl(true);
                  setWater(false);
                  setHeat(false);
                  msg("Equilibrium reset");
                }}
                className="mt-6 w-full rounded border border-white/15 px-3 py-2 text-xs"
              >
                <RotateCcw size={14} className="mr-1 inline" />
                Reset
              </button>
            </div>
            <div className="rounded border border-blue-300/20 bg-gradient-to-b from-blue-500/10 to-slate-950 p-3">
              <BeakerScene chloride fraction={blue} />
              <h3 className="text-center text-lg font-bold">[CoCl₄]²⁻</h3>
              <p className="text-center text-xs text-blue-200">
                (aq, blue) · Tetrahedral Co(II)
              </p>
            </div>
          </section>
          <section className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded border border-white/10 bg-[#0b2134] p-3">
              <h3 className="font-bold">Crystal-field splitting</h3>
              <div className="mt-5 h-28 border-b border-dashed border-slate-500">
                <div className="mt-10 flex justify-around text-pink-300">
                  ↑↓ ↑ ↑↓ ↑
                </div>
              </div>
              <p className="mt-2 text-xs text-pink-200">
                Smaller Δ₀ (weaker field)
                <br />
                Longer wavelength absorbed
              </p>
            </div>
            <div className="rounded border border-white/10 bg-[#0b2134] p-3">
              <h3 className="font-bold">UV-Vis spectra</h3>
              <svg
                viewBox="0 0 300 130"
                className="mt-4 h-32 w-full rounded bg-slate-950/70"
                aria-label="UV-Vis absorbance spectra"
              >
                {[25, 55, 85, 115].map((y) => (
                  <line
                    key={y}
                    x1="32"
                    x2="286"
                    y1={y}
                    y2={y}
                    stroke="#334155"
                    strokeWidth="1"
                  />
                ))}
                {[32, 95, 158, 222, 286].map((x) => (
                  <line
                    key={x}
                    x1={x}
                    x2={x}
                    y1="12"
                    y2="115"
                    stroke="#334155"
                    strokeWidth="1"
                  />
                ))}
                <path
                  d="M32 110 C52 100 68 40 92 34 S121 83 146 101 S207 108 286 110"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  opacity={Math.max(0.25, blue / 100)}
                />
                <path
                  d="M32 110 C85 110 108 108 135 92 S166 38 190 52 S213 99 286 110"
                  fill="none"
                  stroke="#ec4899"
                  strokeWidth="3"
                  opacity={Math.max(0.25, pink / 100)}
                />
                <text x="38" y="125" fill="#94a3b8" fontSize="9">
                  400
                </text>
                <text x="145" y="125" fill="#94a3b8" fontSize="9">
                  600
                </text>
                <text x="260" y="125" fill="#94a3b8" fontSize="9">
                  800 nm
                </text>
                <text x="40" y="18" fill="#60a5fa" fontSize="9">
                  [CoCl₄]²⁻
                </text>
                <text x="194" y="18" fill="#f472b6" fontSize="9">
                  [Co(H₂O)₆]²⁺
                </text>
              </svg>
              <div className="mt-2 h-2 rounded bg-gradient-to-r from-blue-700 via-green-400 to-pink-500" />
              <p className="mt-2 text-xs text-slate-400">
                Higher energy (blue) → lower energy (red)
              </p>
            </div>
            <div className="rounded border border-white/10 bg-[#0b2134] p-3">
              <h3 className="font-bold">Live molecular view</h3>
              <div className="mt-3 grid h-32 place-items-center rounded bg-slate-950">
                <span className="h-16 w-16 rounded-full bg-purple-500 shadow-[0_0_28px_#c084fc]" />
              </div>
              <div className="mt-3 h-2 rounded bg-slate-700">
                <div
                  className="h-2 rounded bg-blue-400"
                  style={{ width: `${blue}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Ligand substitution in progress · {blue.toFixed(0)}%
              </p>
            </div>
          </section>
        </main>
        <aside className="overflow-auto border-l border-white/10 bg-[#0b2034] p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Evidence Notebook</h2>
            <button
              onClick={() => {
                setNewObservation((value) => !value);
                setNoteTab("Observations");
                msg(
                  newObservation
                    ? "Observation editor closed"
                    : "New observation started",
                );
              }}
              className="rounded bg-blue-500 px-3 py-2 text-xs"
            >
              + New
            </button>
          </div>
          {newObservation && (
            <textarea
              aria-label="New observation"
              placeholder="Record what changed and why…"
              className="mt-3 h-20 w-full rounded border border-blue-300/30 bg-slate-950 p-2 text-xs"
            />
          )}
          <div className="mt-4 flex border-b border-white/10">
            {["Observations", "Calculations", "Conclusions"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setNoteTab(x);
                  msg(`${x} opened`);
                }}
                className={`flex-1 border-b-2 px-2 py-3 text-xs ${noteTab === x ? "border-blue-400 text-blue-200" : "border-transparent text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          {noteTab === "Observations" &&
            [
              [
                "14:22",
                "Added concentrated HCl (↑ [Cl⁻]).",
                "Solution turned deep blue.",
              ],
              [
                "14:18",
                "Heated to 60 °C.",
                "Equilibrium shifted to the right (bluer).",
              ],
              ["14:15", "Diluted with water.", "Solution turned pink."],
              [
                "14:10",
                "Initial solution in water.",
                "Pale pink [Co(H₂O)₆]²⁺ dominant.",
              ],
            ].map((x) => (
              <div key={x[0]} className="border-b border-white/10 py-4 text-xs">
                <span className="text-slate-500">{x[0]}</span>
                <p className="mt-1 text-slate-300">{x[1]}</p>
                <p className="text-slate-400">{x[2]}</p>
              </div>
            ))}
          {noteTab === "Calculations" && (
            <div className="mt-4 rounded border border-white/10 bg-slate-950/40 p-4 text-xs text-slate-300">
              <p>Q = [Cl⁻]⁴ / equilibrium response</p>
              <p className="mt-2 text-blue-200">
                Blue fraction: {blue.toFixed(1)}% · Pink fraction:{" "}
                {pink.toFixed(1)}%
              </p>
              <p className="mt-2 text-slate-400">
                Temperature and ligand concentration shift the observed
                distribution.
              </p>
            </div>
          )}
          {noteTab === "Conclusions" && (
            <div className="mt-4 rounded border border-emerald-300/30 bg-emerald-300/10 p-4 text-xs text-emerald-100">
              {blue > 60
                ? "Conditions favour the tetrahedral chloride complex."
                : "Conditions favour the hydrated octahedral complex."}
            </div>
          )}
          <section className="mt-4 rounded border border-blue-400/50 bg-blue-500/10 p-4">
            <h3 className="font-bold text-blue-200">
              Le Châtelier’s explanation
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Increasing [Cl⁻] or temperature favours formation of [CoCl₄]²⁻
              (blue). Decreasing [Cl⁻] or lowering temperature favours
              [Co(H₂O)₆]²⁺ (pink).
            </p>
          </section>
        </aside>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-blue-300/30 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
