import { useEffect, useState } from "react";
import {
  Activity,
  Beaker,
  CheckCircle2,
  FlaskConical,
  Home,
  Play,
  Settings2,
} from "lucide-react";
const journey = [
  "Target & Discovery",
  "Formulation",
  "Absorption",
  "Distribution",
  "Metabolism",
  "Quality Control",
  "Toxicology",
  "Patient",
];
export default function PharmaVisualsTargetPage({ onNavigate }) {
  const [running, setRunning] = useState(false);
  const [dissolve, setDissolve] = useState(0);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setDissolve((value) => (value >= 100 ? 0 : value + 2)),
      120,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-6">
        <FlaskConical size={38} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Pharmaceutical Chemistry Lab</h1>
          <p className="text-sm text-slate-400">From molecule to medicine</p>
        </div>
        <input
          className="ml-auto w-[380px] rounded border border-white/15 bg-slate-900/60 p-2 text-xs"
          placeholder="Search compounds, targets, formulations..."
        />
        <button onClick={() => announce("Notifications opened")}>◉</button>
        <span className="rounded-full bg-blue-500 px-3 py-2">SL</span>
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-70px)] grid-cols-[1fr_310px] grid-rows-[225px_1fr_185px] gap-2 p-2">
        <main className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-lg font-bold">The medicine journey</h2>
          <p className="text-xs text-slate-400">
            An integrated view from target to patient
          </p>
          <div className="mt-4 flex items-center justify-between">
            {journey.map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setStep(i + 1);
                  announce(x + " selected");
                }}
                className={`text-center ${step === i + 1 ? "text-cyan-200" : "text-slate-400"}`}
              >
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-full border-2 ${step === i + 1 ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
                >
                  {i + 1}
                </div>
                <b className="mt-2 block text-[11px]">{x}</b>
              </button>
            ))}
          </div>
        </main>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-xl font-bold">Tablet formulation</h2>
          <p className="text-xs text-slate-400">
            Explore composition and behavior of a real-world medicine
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded border border-white/10 p-3 text-xs">
              <b>Paracetamol 500 mg Tablet</b>
              <p className="mt-3 text-cyan-200">
                ● Paracetamol (API)　500 mg (50.0%)
              </p>
              <p className="text-slate-300">
                ● Microcrystalline cellulose　20.0%
              </p>
              <p className="text-violet-300">● Povidone (PVP)　5.0%</p>
              <p className="text-amber-300">● Croscarmellose sodium　4.0%</p>
              <p className="text-emerald-300">● Magnesium stearate　1.0%</p>
            </div>
            <div className="grid place-items-center text-center">
              <div className="text-8xl text-blue-300">◉</div>
              <p className="text-xs">Tablet coat · API · filler · binder</p>
            </div>
          </div>
          <div className="mt-4 rounded border border-cyan-300/30 p-3">
            <div className="flex items-center justify-between">
              <b>Dissolution test (USP II)</b>
              <button
                onClick={() => setRunning((v) => !v)}
                className="rounded bg-blue-500 px-3 py-2 text-xs"
              >
                <Play size={14} className="mr-1 inline" />
                {running ? "Pause" : "Simulate dissolution"}
              </button>
            </div>
            <div className="mt-3 h-20 rounded bg-gradient-to-t from-cyan-400/50 to-transparent" />
            <input
              type="range"
              min="0"
              max="100"
              value={dissolve}
              onChange={(e) => setDissolve(+e.target.value)}
              className="w-full accent-cyan-300"
            />
            <p className="text-xs">
              Dissolved: {dissolve}%　T₅₀ 12.4 min　T₉₀ 28.6 min
            </p>
          </div>
        </section>
        <aside className="row-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Formulation metrics</h2>
          {[
            ["Tablet weight", "1,000 mg"],
            ["API content", "500 mg (50.0%)"],
            ["Hardness", "8.2 kP"],
            ["Friability", "0.18%"],
            ["Disintegration time", "4.6 min"],
            ["Dissolution (Q,45 min)", "92%"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Safety & quality checks</h2>
          {[
            "Identity (HPLC)",
            "Assay",
            "Related substances",
            "Uniformity of dosage units",
            "Microbial limits",
            "Residual solvents",
            "Heavy metals",
            "Stability (accelerated)",
          ].map((x) => (
            <div key={x} className="flex justify-between py-2 text-xs">
              <span>{x}</span>
              <span className="text-emerald-300">✓ Pass</span>
            </div>
          ))}
        </aside>
        <section className="col-span-2 grid grid-cols-5 gap-2">
          {[
            ["Explore ADME", "Absorption, distribution, metabolism and excretion", "visuals/pharma/adme"],
            ["Dosage Forms", "Solid, liquid, semi-solid and novel delivery systems", "visuals/pharma/dosage"],
            ["Quality Control", "Analytical methods and specifications", "visuals/pharma/qc"],
            ["Buffers", "pH 7.4 · Design and calculate buffer solutions", "visuals/pharma/buffers"],
            ["Toxicology", "Safety evaluation and risk assessment", "visuals/pharma/toxicology"],
          ].map(([x, d, route]) => (
            <a
              key={x}
              href={`#${route}`}
              onClick={() => {
                announce(x + " opened");
              }}
              className="rounded-lg border border-white/10 bg-[#0a1e31] p-4 text-left"
            >
              <b className="text-cyan-200">{x}</b>
              <p className="mt-3 text-xs text-slate-400">{d}</p>
              <ChevronRightIcon />
            </a>
          ))}
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
function ChevronRightIcon() {
  return <span className="float-right text-cyan-300">→</span>;
}
