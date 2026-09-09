import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Play,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

const mechanisms = [
  {
    id: "sn2",
    title: "SN₂ · Backside attack",
    subtitle: "Concerted substitution with inversion of configuration",
    equation: "OH⁻ + CH₃Br → CH₃OH + Br⁻",
    species: [
      ["Hydroxide (nucleophile)", "OH⁻ · strong nucleophile"],
      ["Methyl bromide (electrophile)", "CH₃Br · good leaving group"],
      ["Methanol (product)", "CH₃OH · inverted configuration"],
      ["Bromide (leaving group)", "Br⁻ · stable anion"],
    ],
    features: [
      "Bimolecular / concerted",
      "Backside attack",
      "Inversion of configuration",
      "Single transition state",
      "No intermediates",
    ],
    stages: [
      "Nucleophile approaches",
      "Transition state",
      "Bond breaking/forming",
      "Products (inverted)",
    ],
    notes: [
      "Backside attack by hydroxide on the electrophilic carbon.",
      "Trigonal-bipyramidal transition state with partial bonds to both O and Br.",
      "C–O bond forms as C–Br bond breaks (concerted).",
      "Inversion of configuration (Walden inversion).",
    ],
  },
  {
    id: "sn1",
    title: "SN₁ · Carbocation pathway",
    subtitle: "Stepwise substitution through a planar carbocation",
    equation: "(CH₃)₃CBr + H₂O → (CH₃)₃COH + HBr",
    species: [
      ["Water (nucleophile)", "H₂O · neutral nucleophile"],
      ["tert-Butyl bromide (substrate)", "(CH₃)₃CBr · tertiary halide"],
      ["tert-Butanol (product)", "(CH₃)₃COH · racemic product"],
      ["Hydrobromic acid", "HBr · conjugate acid"],
    ],
    features: [
      "Unimolecular / stepwise",
      "Carbocation intermediate",
      "Planar attack from either face",
      "Rate-determining ionization",
      "Possible racemization",
    ],
    stages: [
      "Leaving group departs",
      "Carbocation forms",
      "Nucleophile attacks",
      "Deprotonation",
    ],
    notes: [
      "Ionization gives the rate-determining carbocation.",
      "The planar intermediate can be attacked from either face.",
      "Water forms a protonated alcohol intermediate.",
      "Base removes the proton to yield the alcohol.",
    ],
  },
  {
    id: "e2",
    title: "E2 · Concerted elimination",
    subtitle: "Anti-periplanar proton removal and leaving-group loss",
    equation: "CH₃CH₂Br + OH⁻ → CH₂=CH₂ + H₂O + Br⁻",
    species: [
      ["Hydroxide (base)", "OH⁻ · strong base"],
      ["Bromoethane (substrate)", "CH₃CH₂Br · beta hydrogen"],
      ["Ethene (alkene product)", "CH₂=CH₂ · π bond forms"],
      ["Bromide (leaving group)", "Br⁻ · stable anion"],
    ],
    features: [
      "Bimolecular / concerted",
      "Anti-periplanar geometry",
      "Strong base removes β-H",
      "Single transition state",
      "No carbocation intermediate",
    ],
    stages: [
      "Base approaches",
      "Anti transition state",
      "C–H/C–Br break",
      "Alkene forms",
    ],
    notes: [
      "A strong base removes a beta hydrogen.",
      "The beta C–H and C–Br bonds align anti-periplanar.",
      "Bond changes happen in one concerted step.",
      "The alkene product and bromide are released.",
    ],
  },
];
function MechanismSvg({ stage, arrows = true }) {
  const bond = stage === 1 ? "#a78bfa" : stage === 2 ? "#f59e0b" : "#7dd3fc";
  return (
    <svg
      viewBox="0 0 220 120"
      className="h-24 w-40"
      role="img"
      aria-label="Molecular mechanism stage"
    >
      <line
        x1="108"
        y1="60"
        x2={stage === 0 ? 52 : 42}
        y2="60"
        stroke={bond}
        strokeWidth="6"
        strokeDasharray={stage === 1 ? "5 5" : "0"}
      />
      <line
        x1="108"
        y1="60"
        x2={stage === 2 ? 174 : 168}
        y2="60"
        stroke={bond}
        strokeWidth="6"
        strokeDasharray={stage === 1 ? "5 5" : "0"}
      />
      <circle
        cx="108"
        cy="60"
        r="24"
        fill="#303741"
        stroke="#e2e8f0"
        strokeWidth="2"
      />
      <text x="108" y="65" fill="#fff" textAnchor="middle" fontSize="13">
        C
      </text>
      <circle
        cx={stage === 0 ? 34 : 28}
        cy="60"
        r="18"
        fill="#ef2529"
        stroke="#fecaca"
        strokeWidth="2"
      />
      <text
        x={stage === 0 ? 34 : 28}
        y="65"
        fill="#fff"
        textAnchor="middle"
        fontSize="11"
      >
        O
      </text>
      <circle
        cx={stage === 2 ? 186 : 192}
        cy="60"
        r="18"
        fill="#a66b2b"
        stroke="#fde68a"
        strokeWidth="2"
      />
      <text
        x={stage === 2 ? 186 : 192}
        y="65"
        fill="#fff"
        textAnchor="middle"
        fontSize="10"
      >
        Br
      </text>
      <circle cx="108" cy="22" r="12" fill="#e2e8f0" />
      <line
        x1="108"
        y1="46"
        x2="108"
        y2="22"
        stroke="#cbd5e1"
        strokeWidth="4"
      />
      {arrows && (
        <path
          d={
            stage === 0
              ? "M25 38Q48 10 72 38"
              : stage === 2
                ? "M145 29Q170 8 190 34"
                : "M37 92Q105 112 181 92"
          }
          fill="none"
          stroke="#38bdf8"
          strokeWidth="3"
          markerEnd="url(#mArrow)"
        />
      )}
      <defs>
        <marker
          id="mArrow"
          markerWidth="7"
          markerHeight="7"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0 0L6 3L0 6Z" fill="#38bdf8" />
        </marker>
      </defs>
    </svg>
  );
}

export default function OrganicMechanismTargetPage({ onNavigate }) {
  const initialToggles = {
    arrows: true,
    charges: true,
    energy: true,
    stereo: true,
    slow: false,
  };
  const [mechanismId, setMechanismId] = useState("sn2");
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [toggles, setToggles] = useState(initialToggles);
  const mechanism =
    mechanisms.find((item) => item.id === mechanismId) || mechanisms[0];
  const transitionPeak =
    mechanism.id === "sn1" ? 62 : mechanism.id === "e2" ? 78 : 92;
  const toggle = (key) =>
    setToggles((state) => ({ ...state, [key]: !state[key] }));
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(
      () =>
        setStage((value) =>
          value >= mechanism.stages.length - 1 ? 0 : value + 1,
        ),
      toggles.slow ? 1400 : 700,
    );
    return () => window.clearInterval(timer);
  }, [playing, mechanism.stages.length, toggles.slow]);
  return (
    <div
      className="min-h-screen bg-[#061426] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-5 border-b border-white/10 bg-[#07172a] px-6">
        <FlaskConical className="text-cyan-300" size={32} />
        <div>
          <h1 className="text-2xl font-black">Organic Mechanism Player</h1>
          <p className="text-sm text-slate-400">
            Explore. Visualize. Understand.
          </p>
        </div>
        <div className="ml-auto flex gap-5 text-xs">
          <button onClick={() => toggle("menu")}>👜 Mechanisms⌄</button>
          <button onClick={() => toggle("view")}>◈ 3D View</button>
          <button onClick={() => toggle("settings")}>
            <Settings size={15} className="mr-1 inline" />
            Settings
          </button>
          <button onClick={() => toggle("dark")}>☼ ◐</button>
        </div>
      </header>
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-[110px_245px_1fr] gap-2 p-2">
        <aside className="rounded-xl border border-white/10 bg-[#0a1c31] p-2">
          {mechanisms.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setMechanismId(item.id);
                setStage(0);
              }}
              className={
                "mb-1 w-full rounded-lg px-2 py-4 text-left text-xs " +
                (mechanismId === item.id
                  ? "bg-sky-500/25 text-sky-200"
                  : "text-slate-300")
              }
            >
              {item.id.toUpperCase()}
              <small className="mt-1 block text-slate-400">
                {item.id === "sn2"
                  ? "Backside attack"
                  : item.id === "sn1"
                    ? "Carbocation"
                    : "Elimination"}
              </small>
            </button>
          ))}
        </aside>
        <aside className="rounded-xl border border-white/10 bg-[#0a1c31] p-3">
          <h2 className="font-black">Species & Reagents</h2>
          {mechanism.species.map(([name, description], i) => (
            <button
              key={name}
              onClick={() => setStage(Math.min(i, 3))}
              className="mt-2 w-full rounded-lg border border-white/10 bg-slate-900/60 p-3 text-left"
            >
              <b className="text-sm">{name}</b>
              <p className="mt-1 text-xs text-slate-400">{description}</p>
            </button>
          ))}
          <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm text-cyan-100">
            Overall reaction
            <br />
            <b>{mechanism.equation}</b>
          </div>
        </aside>
        <main className="min-w-0 space-y-2">
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black">{mechanism.title}</h2>
                <p className="text-slate-400">{mechanism.subtitle}</p>
              </div>
              <p className="text-xl font-bold text-cyan-300">
                {mechanism.equation}
              </p>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {mechanism.stages.map((x, i) => (
                <button
                  key={x}
                  onClick={() => setStage(i)}
                  className={
                    "rounded-xl border p-3 text-left " +
                    (stage === i
                      ? "border-cyan-300 bg-cyan-300/10"
                      : "border-white/10 bg-black/20")
                  }
                >
                  <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-sky-500 font-black">
                    {i + 1}
                  </span>
                  <b className="mt-2 block text-sm">{x}</b>
                  <p className="mt-5 text-xs text-slate-400">
                    {mechanism.notes[i]}
                  </p>
                  <div className="mx-auto mt-5 flex h-24 w-32 items-center justify-center rounded-xl bg-slate-950/70">
                    <MechanismSvg stage={i} arrows={toggles.arrows} />
                    {toggles.charges && (
                      <small className="absolute ml-28 text-xs text-cyan-200">
                        δ
                      </small>
                    )}
                  </div>
                  {toggles.stereo && (
                    <small className="mt-2 block text-center text-emerald-200">
                      {i === 3 ? "inversion shown" : "stereochemistry tracked"}
                    </small>
                  )}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-3">
            <div className="flex items-center gap-4">
              <b>Scrub electron flow</b>
              <button
                onClick={() => setPlaying(!playing)}
                className="grid h-9 w-9 place-items-center rounded-full bg-sky-500"
              >
                {playing ? <span>Ⅱ</span> : <Play size={15} />}
              </button>
              <input
                className="flex-1"
                type="range"
                min="0"
                max="3"
                step="1"
                value={stage}
                onChange={(e) => setStage(+e.target.value)}
              />
              <span>{stage + 1} / 4</span>
              <button onClick={() => setStage(Math.max(0, stage - 1))}>
                <ChevronLeft />
              </button>
              <button onClick={() => setStage(Math.min(3, stage + 1))}>
                <ChevronRight />
              </button>
            </div>
          </section>
          <section className="grid grid-cols-[1.3fr_.7fr] gap-2">
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black">
                  Reaction energy profile ({mechanism.id.toUpperCase()})
                </h3>
                <SlidersHorizontal size={16} />
              </div>
              {toggles.energy ? (
                <svg
                  viewBox="0 0 520 190"
                  className="mt-3 h-52 w-full rounded-lg bg-slate-950/50"
                >
                  <path
                    d={`M30 150 C100 150 120 ${150 - transitionPeak} 250 ${150 - transitionPeak} S350 150 490 145`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="4"
                  />
                  <line x1="30" y1="150" x2="490" y2="150" stroke="#64748b" />
                  <line
                    x1="250"
                    y1={150 - transitionPeak}
                    x2="250"
                    y2="150"
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                  />
                  <text x="200" y="30" fill="#f0abfc">
                    Transition state · {transitionPeak} kJ mol⁻¹
                  </text>
                  <text x="48" y="170" fill="#94a3b8">
                    Reactants
                  </text>
                  <text x="420" y="170" fill="#94a3b8">
                    Products
                  </text>
                </svg>
              ) : (
                <p className="mt-3 grid h-52 place-items-center rounded-lg bg-slate-950/50 text-sm text-slate-400">
                  Energy profile hidden — enable it below.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <h3 className="font-black">Key features</h3>
              {mechanism.features.map((x) => (
                <p key={x} className="mt-3 text-sm text-emerald-200">
                  ✓　{x}
                </p>
              ))}
            </div>
          </section>
          <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1 rounded-xl border border-white/10 bg-[#0a1c31] p-3">
            {[
              ["arrows", "Show electron pushing arrows"],
              ["charges", "Show partial charges (δ)"],
              ["energy", "Show energy profile"],
              ["stereo", "Show stereochemistry"],
              ["slow", "Slow motion"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => toggle(key)}
                className={
                  "rounded-lg border px-2 py-3 text-xs " +
                  (toggles[key]
                    ? "border-sky-300 bg-sky-300/10"
                    : "border-white/10")
                }
              >
                {toggles[key] ? "●" : "○"} {label}
              </button>
            ))}
            <button
              onClick={() => {
                setStage(0);
                setPlaying(false);
                setToggles(initialToggles);
              }}
              className="rounded-lg border border-white/10 px-2 py-3 text-xs text-slate-300 hover:border-cyan-300/50"
            >
              ↺ Reset player
            </button>
          </section>
        </main>
      </div>
      {noticePlaceholder(mechanism, stage)}
      <button
        className="fixed bottom-4 right-5 rounded-full border border-sky-300/40 bg-slate-950 px-4 py-2 text-xs"
        onClick={() => onNavigate?.("organic-visuals")}
      >
        Back to reaction map
      </button>
    </div>
  );
}

const noticePlaceholder = () => null;
