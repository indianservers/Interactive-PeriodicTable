import "./labResponsive.css";
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
  "Benzaldehyde + acetophenone",
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
      "Self-condensation of propanal",
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
      "Addition endpoint shown; heating can yield mesityl oxide",
    ],
  },
  "Benzaldehyde + acetophenone": {
    name: "Chalcone",
    formula: "C₁₅H₁₂O",
    mass: "208.26",
    features: [
      "Conjugated enone",
      "Benzaldehyde is the electrophile; acetophenone supplies the enolate",
      "E (trans) major product",
    ],
  },
};
const pathwayFormulae = {
 "Acetaldehyde (self-condensation)": ["CH₃–CHO", "⁻CH₂–CHO + CH₃–CHO", "CH₃–CH(OH)–CH₂–CHO", "CH₃–CH=CH–CHO + H₂O"],
 Propanal: ["CH₃CH₂–CHO", "CH₃–CH⁻–CHO + CH₃CH₂CHO", "CH₃CH₂–CH(OH)–CH(CH₃)–CHO", "CH₃CH₂–CH=C(CH₃)–CHO + H₂O"],
 Acetone: ["CH₃–CO–CH₃", "CH₃–CO–CH₂⁻ + CH₃COCH₃", "CH₃COCH₂–C(OH)(CH₃)₂", "Diacetone alcohol (addition product)"],
 "Benzaldehyde + acetophenone": ["Ph–CHO + Ph–CO–CH₃", "Ph–CO–CH₂⁻ + Ph–CHO", "Ph–CO–CH₂–CH(OH)–Ph", "Ph–CO–CH=CH–Ph + H₂O"],
};
function MoleculeSvg({ substrate, stageIndex, trace }) {
 return <svg viewBox="0 0 360 160" className="mx-auto h-[150px] w-full" role="img" aria-label={`Step ${stageIndex+1} condensed structure: ${pathwayFormulae[substrate][stageIndex]}`}><rect x="4" y="4" width="352" height="152" rx="12" fill="#071827" stroke="#34566b"/><text x="180" y="65" textAnchor="middle" fill="#d9f5ff" fontSize="13" textLength={pathwayFormulae[substrate][stageIndex].length>28?330:undefined} lengthAdjust="spacingAndGlyphs">{pathwayFormulae[substrate][stageIndex]}</text><text x="180" y="100" textAnchor="middle" fill="#67d9eb" fontSize="12">{steps[stageIndex]}</text>{trace&&<text x="180" y="130" textAnchor="middle" fill="#d5b8ff" fontSize="10">Enolate carbon attacks the carbonyl carbon</text>}</svg>;
}
export default function OrganicReactionTargetPage({ onNavigate }) {
  const [step, setStep] = useState(1);
  const [substrate, setSubstrate] = useState(substrates[0]);
  const [base, setBase] = useState("NaOH");
  const [temp, setTemp] = useState(25);
  const [trace, setTrace] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState("Mechanism");
  const [solvent, setSolvent] = useState("Ethanol (EtOH)");
  const [selectivity, setSelectivity] = useState(
    "Self-condensation",
  );
  const [stereoisomers, setStereoisomers] = useState(true);
  const [predicted, setPredicted] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const activeSteps = substrate === "Acetone" ? [...steps.slice(0,3), "Aldol addition endpoint"] : steps;
  const mechanism = activeSteps[step-1];
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
      className="reaction-visualizer min-h-screen overflow-hidden bg-[#061522] text-slate-100"
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
              onClick={() => (x === "Home" ? onNavigate?.("dashboard") : announce(`${x} selected`))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                substrate,
                "Enolate (resonance stabilized)",
                "Aldol addition / proton transfer",
                product.name,
              ].map((label, i) => (
                <div key={label} className="relative text-center">
                  <h3 className="text-left text-sm font-bold text-cyan-200">
                    {i + 1}.{" "}
                    {activeSteps[i]}
                  </h3>
                  <div className="mx-auto mt-1 grid h-40 place-items-center">
                    <MoleculeSvg
                      substrate={substrate}
                      stageIndex={i}
                      trace={trace}
                    />
                  </div>
                  <p className="text-xs text-slate-300">{label}</p>
                  {i < 3 && (
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
              {activeSteps.map((x, i) => (
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
            <option>Self-condensation</option>
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
              {product.name}
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
                  setSelectivity(x === "Benzaldehyde + acetophenone" ? "Crossed aldol" : "Self-condensation");
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
