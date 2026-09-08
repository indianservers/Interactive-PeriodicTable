import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Beaker,
  BookOpen,
  Check,
  ChevronRight,
  Play,
  Search,
  Settings2,
  Sparkles,
} from "lucide-react";

const substrates = [
  "Acetaldehyde (self-condensation)",
  "Propanal",
  "Acetone",
  "Benzaldehyde",
];
const steps = [
  "Enolate formation",
  "Nucleophilic addition",
  "Proton transfer",
  "Dehydration",
];
const productProfiles = {
  "Acetaldehyde (self-condensation)": {
    name: "Crotonaldehyde",
    formula: "C₄H₆O",
    mass: "70.09",
    features: [
      "α,β-Unsaturated aldehyde",
      "Conjugated system (more stable)",
      "Typically E (trans) major product",
    ],
  },
  Propanal: {
    name: "2-methyl-2-pentenal",
    formula: "C₆H₁₀O",
    mass: "98.15",
    features: [
      "α,β-Unsaturated aldehyde",
      "Crossed aldol regioisomers possible",
      "E (trans) alkene favored",
    ],
  },
  Acetone: {
    name: "Diacetone alcohol",
    formula: "C₆H₁₂O₂",
    mass: "116.16",
    features: [
      "β-Hydroxy ketone",
      "Self-aldol addition product",
      "Dehydration requires stronger heating",
    ],
  },
  Benzaldehyde: {
    name: "Chalcone-like aldol product",
    formula: "C₁₅H₁₂O",
    mass: "208.26",
    features: [
      "Conjugated enone",
      "Aromatic crossed aldol product",
      "E (trans) major product",
    ],
  },
};
function MoleculeSvg({ kind, trace }) {
  const atoms =
    kind === "enolate"
      ? [
          [48, 72, "C", "#9baabd"],
          [90, 48, "O", "#ef5555"],
          [108, 91, "C", "#9baabd"],
          [30, 106, "H", "#eaf5ff"],
        ]
      : kind === "product"
        ? [
            [45, 89, "C", "#9baabd"],
            [85, 89, "C", "#9baabd"],
            [125, 65, "O", "#ef5555"],
            [165, 89, "C", "#9baabd"],
            [202, 62, "O", "#ef5555"],
            [179, 120, "H", "#eaf5ff"],
          ]
        : [
            [52, 90, "C", "#9baabd"],
            [94, 66, "O", "#ef5555"],
            [132, 90, "C", "#9baabd"],
            [52, 130, "H", "#eaf5ff"],
          ];
  return (
    <svg
      viewBox="0 0 240 160"
      className="mx-auto h-[150px] w-full"
      aria-label="Molecular mechanism structure"
    >
      <g stroke="#d8e6f2" strokeWidth="6" opacity=".9">
        {atoms.slice(1).map(([x, y], i) => (
          <line key={i} x1={atoms[0][0]} y1={atoms[0][1]} x2={x} y2={y} />
        ))}
      </g>
      {kind === "product" && (
        <line
          x1="83"
          y1="87"
          x2="128"
          y2="65"
          stroke="#d8e6f2"
          strokeWidth="4"
        />
      )}
      {atoms.map(([x, y, label, color]) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r={label === "H" ? 13 : 18}
            fill={color}
            stroke="#f4fbff"
            strokeWidth="2"
          />
          <text
            x={x}
            y={y + 5}
            textAnchor="middle"
            fill="#142032"
            fontSize="11"
            fontWeight="700"
          >
            {label}
          </text>
        </g>
      ))}
      {trace && (
        <path
          d="M175 30 Q205 50 180 76"
          fill="none"
          stroke="#40c7ff"
          strokeWidth="3"
          markerEnd="url(#flow)"
        />
      )}
      <defs>
        <marker
          id="flow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 L0 6 L7 3Z" fill="#40c7ff" />
        </marker>
      </defs>
    </svg>
  );
}
export default function OrganicReactionTargetPage() {
  const [step, setStep] = useState(1);
  const [substrate, setSubstrate] = useState(substrates[0]);
  const [base, setBase] = useState("NaOH");
  const [temp, setTemp] = useState(25);
  const [trace, setTrace] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState("Mechanism");
  const [solvent, setSolvent] = useState("Ethanol (EtOH)");
  const [selectivity, setSelectivity] = useState(
    "Self-condensation (acetaldehyde)",
  );
  const [stereoisomers, setStereoisomers] = useState(true);
  const [predicted, setPredicted] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const mechanism = useMemo(() => steps[step - 1], [step]);
  const product =
    productProfiles[substrate] ||
    productProfiles["Acetaldehyde (self-condensation)"];
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(
      () => setStep((value) => (value >= steps.length ? 1 : value + 1)),
      800,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-5">
        <div className="grid h-9 w-9 place-items-center rounded-lg border border-cyan-300/50 bg-blue-500/20">
          <Beaker size={21} className="text-cyan-300" />
        </div>
        <div>
          <h1 className="text-xl font-black">Organic Reaction Visualizer</h1>
          <p className="text-xs text-slate-400">
            Explore mechanisms. See the motion. Build intuition.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <label className="flex w-80 items-center gap-2 rounded border border-white/15 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
            <Search size={15} />
            <input
              className="w-full bg-transparent outline-none"
              placeholder="Search reactions, substrates or reagents..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            onClick={() => announce("Molecule library opened")}
            className="text-xs"
          >
            Molecules
          </button>
          <button
            onClick={() => announce("Learn panel opened")}
            className="text-xs"
          >
            Learn
          </button>
          <Settings2 size={17} />
        </div>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[235px_1fr_292px] gap-3 p-3">
        <aside className="overflow-auto rounded border border-white/10 bg-[#0a1e31] p-3">
          <nav>
            {[
              "Home",
              "Reaction Library",
              "My Mechanisms",
              "Saved",
              "Settings",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => announce(`${x} selected`)}
                className={`mb-1 w-full rounded px-3 py-3 text-left text-sm ${i === 1 ? "border-l-2 border-cyan-300 bg-blue-500/15 text-cyan-200" : "text-slate-300"}`}
              >
                {x}
              </button>
            ))}
          </nav>
          <h3 className="mt-5 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[.2em] text-slate-500">
            Reaction categories
          </h3>
          {[
            "Substitution",
            "Addition",
            "Elimination",
            "Oxidation",
            "Reduction",
            "Carbon–Carbon Formation",
            "Pericyclic",
            "Rearrangement",
          ].map((x) => (
            <button
              key={x}
              onClick={() => announce(`${x} category selected`)}
              className={`mt-1 block w-full rounded px-3 py-2 text-left text-xs ${x.includes("Carbon") ? "bg-blue-500/20 text-cyan-200" : "text-slate-400"}`}
            >
              {x}
            </button>
          ))}
          <div className="mt-6 rounded border border-white/10 p-3 text-xs text-slate-500">
            Recently viewed
            <br />
            <b className="text-cyan-200">Aldol condensation</b>
            <br />
            Claisen condensation
            <br />
            Grignard addition
          </div>
        </aside>
        <main className="min-w-0 overflow-auto">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black">Aldol condensation</h2>
              <p className="mt-1 text-sm text-slate-400">
                Two molecules of acetaldehyde undergo enolate formation,
                nucleophilic addition and dehydration to give an α,β-unsaturated
                aldehyde.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTrace((v) => !v);
                  announce(
                    trace
                      ? "Electron tracing hidden"
                      : "Electron tracing shown",
                  );
                }}
                className={`rounded border px-3 py-2 text-xs ${trace ? "border-cyan-300 bg-cyan-300/10 text-cyan-200" : "border-white/15"}`}
              >
                ↗ Trace electron flow
              </button>
              <button
                onClick={() => {
                  setPredicted(true);
                  announce("Product prediction complete");
                }}
                className="rounded bg-blue-600 px-3 py-2 text-xs font-bold"
              >
                Predict product
              </button>
            </div>
          </div>
          <div className="mt-3 flex rounded border border-white/10 bg-[#0b2135]">
            {[
              "Mechanism",
              "3D View",
              "Energy Profile",
              "Reaction Coordinates",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setView(x);
                  announce(`${x} view selected`);
                }}
                className={`px-5 py-3 text-sm ${view === x ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          {view !== "Mechanism" && (
            <div className="mt-2 rounded border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-100">
              {view} view selected for {substrate}.{" "}
              {trace
                ? "Electron flow overlays are enabled."
                : "Enable electron tracing for arrow annotations."}
            </div>
          )}
          <section className="mt-0 min-h-[264px] rounded border border-white/10 bg-[#0b2135] p-4">
            <div className="grid grid-cols-3 gap-4">
              {[
                "Acetaldehyde",
                "Enolate (resonance stabilized)",
                "Crotonaldehyde",
              ].map((label, i) => (
                <div key={label} className="relative text-center">
                  <h3 className="text-left text-sm font-bold text-cyan-200">
                    {i + 1}.{" "}
                    {i === 0
                      ? "Enolate formation"
                      : i === 1
                        ? "Nucleophilic addition"
                        : "Dehydration (E1cb)"}
                  </h3>
                  <div className="mx-auto mt-1 grid h-40 place-items-center">
                    <MoleculeSvg
                      kind={
                        i === 1 ? "enolate" : i === 2 ? "product" : "substrate"
                      }
                      trace={trace}
                    />
                  </div>
                  <p className="text-xs text-slate-300">{label}</p>
                  {i < 2 && (
                    <ArrowRight className="absolute -right-5 top-24 text-slate-400" />
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-xs text-slate-400">
              {mechanism}:{" "}
              {step === 1
                ? "Base deprotonates α-carbon"
                : step === 2
                  ? "Enolate attacks carbonyl carbon"
                  : step === 3
                    ? "Aldolate intermediate transfers a proton"
                    : "Elimination of water gives enone"}
            </p>
            {query && (
              <p className="mt-2 rounded border border-cyan-300/20 bg-cyan-300/10 p-2 text-xs text-cyan-100">
                Search filter: {query} · showing mechanism controls for the
                current reaction.
              </p>
            )}
          </section>
          <section className="mt-2 min-h-[262px] rounded border border-white/10 bg-[#0b2135] p-4">
            <h3 className="font-bold text-cyan-200">Reaction Energy Profile</h3>
            <div className="relative mt-3 h-48 border-b border-l border-slate-500">
              <svg viewBox="0 0 900 150" className="h-full w-full">
                <path
                  d="M0 120 C80 116 100 28 170 45 S245 125 320 105 S400 48 470 67 S540 125 610 105 S700 18 770 40 S835 125 900 112"
                  fill="none"
                  stroke="#4cc9f0"
                  strokeWidth="3"
                  strokeDasharray="8 5"
                />
                <circle cx="170" cy="45" r="5" fill="#fbbf24" />
                <circle cx="470" cy="67" r="5" fill="#fbbf24" />
                <circle cx="770" cy="40" r="5" fill="#fbbf24" />
              </svg>
              <span className="absolute bottom-1 left-1/2 text-xs text-slate-400">
                Reaction coordinate →
              </span>
            </div>
          </section>
          <section className="mt-2 rounded border border-white/10 bg-[#0b2135] p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-cyan-200">Mechanism Timeline</h3>
              <button
                onClick={() => setPlaying((v) => !v)}
                className="rounded bg-blue-500 px-3 py-2 text-xs font-bold"
              >
                <Play size={13} className="mr-1 inline" />
                {playing ? "Pause" : "Play"}
              </button>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {steps.map((x, i) => (
                <button
                  key={x}
                  onClick={() => setStep(i + 1)}
                  className={`rounded border p-3 text-left text-xs ${step === i + 1 ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-slate-700">
                    {i + 1}
                  </span>
                  <b className="mt-2 block">{x}</b>
                  <small className="text-slate-500">
                    {i === 0
                      ? "Deprotonation"
                      : i === 1
                        ? "C–C bond formation"
                        : i === 2
                          ? "Aldolate intermediate"
                          : "Elimination of water"}
                  </small>
                </button>
              ))}
            </div>
          </section>
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-lg font-bold">Reaction Conditions</h2>
          <label className="mt-4 block text-xs">
            Base
            <select
              value={base}
              onChange={(e) => setBase(e.target.value)}
              className="mt-2 w-full rounded border border-white/15 bg-slate-900 p-2"
            >
              <option>NaOH</option>
              <option>OH⁻</option>
              <option>EtONa</option>
            </select>
          </label>
          <label className="mt-4 block text-xs">
            Solvent
            <select
              value={solvent}
              onChange={(e) => {
                setSolvent(e.target.value);
                announce("Solvent changed");
              }}
              className="mt-2 w-full rounded border border-white/15 bg-slate-900 p-2"
            >
              <option>Ethanol (EtOH)</option>
              <option>Water</option>
              <option>THF</option>
            </select>
          </label>
          <label className="mt-4 block text-xs">
            Temperature <output className="float-right">{temp} °C</output>
            <input
              type="range"
              min="-78"
              max="150"
              value={temp}
              onChange={(e) => setTemp(+e.target.value)}
              className="mt-2 w-full accent-cyan-300"
            />
          </label>
          <h2 className="mt-6 border-t border-white/10 pt-4 text-lg font-bold">
            Selectivity
          </h2>
          <select
            value={selectivity}
            onChange={(e) => {
              setSelectivity(e.target.value);
              announce("Regioselectivity changed");
            }}
            className="mt-3 w-full rounded border border-white/15 bg-slate-900 p-2 text-xs"
          >
            <option>Self-condensation (acetaldehyde)</option>
            <option>Crossed aldol</option>
          </select>
          <label className="mt-4 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={stereoisomers}
              onChange={() => setStereoisomers((value) => !value)}
            />{" "}
            Show stereoisomers
          </label>
          <section className="mt-5 rounded border border-white/10 p-3">
            <h3 className="font-bold">Product Information</h3>
            <p className="mt-3 text-sm text-cyan-200">
              {predicted ? product.name : "Prediction pending"}
            </p>
            <p className="text-xs text-slate-400">
              {product.formula} · M = {product.mass} g/mol
            </p>
            <ul className="mt-3 space-y-2 text-xs text-slate-300">
              {product.features.map((feature) => (
                <li key={feature}>• {feature}</li>
              ))}
              <li>
                •{" "}
                {temp < 10
                  ? "Low temperature favours controlled addition"
                  : temp > 80
                    ? "Higher temperature favours dehydration"
                    : "Moderate temperature supports both steps"}
              </li>
            </ul>
          </section>
          <section className="mt-4 rounded border border-white/10 p-3">
            <h3 className="font-bold">Change substrate</h3>
            {substrates.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setSubstrate(x);
                  announce(`${x} selected`);
                }}
                className={`mt-2 w-full rounded border p-2 text-left text-xs ${substrate === x ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
              >
                {substrate === x && (
                  <Check size={13} className="mr-1 inline text-emerald-300" />
                )}
                {x}
              </button>
            ))}
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
