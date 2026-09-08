import { useState } from "react";
import {
  Beaker,
  CheckCircle2,
  Circle,
  FlaskConical,
  HelpCircle,
  NotebookPen,
  Settings,
} from "lucide-react";
const reagents = [
  "HCl (2 M)",
  "NaOH (2 M)",
  "NH₃(aq) (2 M)",
  "H₂SO₄ (1 M)",
  "AgNO₃ (0.1 M)",
];
const reagentEvidence = {
  "HCl (2 M)": { observation: "No visible precipitate; acidified sample remains clear.", equation: "Ba²⁺ + 2Cl⁻ → no precipitate", confidence: 72 },
  "NaOH (2 M)": { observation: "White hydroxide precipitate formed.", equation: "Ba²⁺ + 2OH⁻ → Ba(OH)₂(aq)", confidence: 78 },
  "NH₃(aq) (2 M)": { observation: "No characteristic group-V precipitate.", equation: "Ba²⁺ + 2NH₃ + 2H₂O ⇌ Ba(OH)₂ + 2NH₄⁺", confidence: 80 },
  "H₂SO₄ (1 M)": { observation: "Dense white precipitate formed; insoluble in excess acid.", equation: "Ba²⁺(aq) + SO₄²⁻(aq) → BaSO₄(s)", confidence: 96 },
  "AgNO₃ (0.1 M)": { observation: "No halide precipitate expected from the confirmed sulfate sample.", equation: "Ag⁺ + SO₄²⁻ → soluble sulfate species", confidence: 88 },
};
export default function SaltAnalysisTargetPage() {
  const [reagent, setReagent] = useState(3);
  const [logs, setLogs] = useState([
    "10:12　Unknown salt B: white crystalline solid.",
    "10:14　Flame test: apple-green flame suggests Ba²⁺.",
  ]);
  const [step, setStep] = useState("Group V");
  const [notice, setNotice] = useState("");
  const [lastEvidence, setLastEvidence] = useState(reagentEvidence[reagents[3]]);
  const add = () => {
    const evidence = reagentEvidence[reagents[reagent]];
    setLastEvidence(evidence);
    setLogs((l) => [
      ...l,
      `10:24　Added ${reagents[reagent]}: ${evidence.observation}`,
    ]);
    setNotice(`${reagents[reagent]} added`);
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <FlaskConical className="text-cyan-300" size={33} />
        <div>
          <h1 className="text-2xl font-black">Qualitative Salt Analysis Lab</h1>
          <p className="text-xs text-slate-400">
            Systematic identification of cations and anions in unknown salts
          </p>
        </div>
        <div className="ml-auto rounded border border-violet-400/50 bg-violet-400/10 px-5 py-2">
          <b className="text-violet-200">◉ Unknown salt B</b>
          <br />
          <span className="text-xs text-slate-400">
            Solid sample　•　Code: B　•　Mass: ~0.5 g
          </span>
        </div>
        <button onClick={() => setNotice("Lab notes opened")}>
          <NotebookPen size={18} />
        </button>
        <Settings size={18} />
        <HelpCircle size={18} />
      </header>
      <div className="grid h-[calc(100vh-70px)] grid-cols-[285px_1fr_390px] grid-rows-[1fr_245px] gap-2 p-2">
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Qualitative Analysis Scheme</h2>
          {[
            [
              "1. Preliminary Tests",
              ["Appearance, solubility, pH", "Flame test"],
            ],
            [
              "2. Cation Group Tests",
              [
                "Group I (Ag⁺, Pb²⁺, Hg₂²⁺)",
                "Group II (Cu²⁺, Cd²⁺, Bi³⁺)",
                "Group III (Fe³⁺, Al³⁺, Cr³⁺)",
                "Group IV (Zn²⁺, Mn²⁺, Ni²⁺, Co²⁺)",
                "Group V (Ba²⁺, Sr²⁺, Ca²⁺)",
              ],
            ],
            [
              "3. Anion Tests",
              [
                "Carbonate (CO₃²⁻)",
                "Sulfate (SO₄²⁻)",
                "Chloride (Cl⁻)",
                "Bromide (Br⁻)",
                "Iodide (I⁻)",
                "Nitrate (NO₃⁻)",
              ],
            ],
          ].map(([h, items], i) => (
            <div key={h} className="mt-3 rounded border border-white/10 p-3">
              <h3 className="font-bold text-cyan-200">{h}</h3>
              {items.map((x) => (
                <button
                  key={x}
                  onClick={() => setStep(x)}
                  className={`mt-2 flex w-full items-center gap-2 text-left text-xs ${step === x ? "text-cyan-200" : "text-slate-300"}`}
                >
                  {step === x ? (
                    <Circle size={13} className="text-cyan-300" />
                  ) : (
                    <CheckCircle2
                      size={13}
                      className={i < 2 ? "text-emerald-400" : "text-slate-500"}
                    />
                  )}{" "}
                  {x}
                </button>
              ))}
            </div>
          ))}
        </aside>
        <main className="rounded-lg border border-white/10 bg-[#112a3a] p-3">
          <div className="relative grid h-[485px] place-items-center overflow-hidden rounded bg-gradient-to-b from-[#19384b] to-[#081722]">
            <div className="absolute left-5 top-5 rounded border border-cyan-300/50 bg-slate-950/80 p-3">
              <b>Unknown salt B</b>
              <br />
              <span className="text-xs text-slate-400">
                White crystalline solid
              </span>
            </div>
            <div className="text-center">
              <div className="text-[120px] text-emerald-400 drop-shadow-[0_0_35px_#4ade80]">
                ▲
              </div>
              <p className="text-emerald-300">Apple-green flame</p>
              <div className="mt-12 flex gap-5 text-5xl text-slate-300">
                ▥　▥　▥　▥
              </div>
              <div className="mt-2 text-xs text-slate-300">
                HCl　 NaOH　 NH₃　 H₂SO₄
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-slate-950/90 px-5 py-2 text-center text-sm">
              Unknown salt B　•　Ba²⁺ confirmed
            </div>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold text-cyan-200">Reagent Controls</h2>
          <div className="mt-3 grid grid-cols-5 gap-1">
            {reagents.map((x, i) => (
              <button
                key={x}
                onClick={() => setReagent(i)}
                className={`rounded border p-2 text-[10px] ${i === reagent ? "border-cyan-300 bg-cyan-300/15" : "border-white/10"}`}
              >
                ⚗<br />
                {x}
              </button>
            ))}
          </div>
          <button
            onClick={add}
            className="mt-3 w-full rounded bg-blue-500 px-3 py-3 text-sm font-bold"
          >
            💧 Add reagent
          </button>
          <h2 className="mt-5 font-bold">Observations Notebook</h2>
          <div className="mt-2 h-48 overflow-y-auto rounded border border-white/10 p-3 text-xs leading-6">
            {logs.map((x) => (
              <div key={x}>{x}</div>
            ))}
          </div>
          <h2 className="mt-4 font-bold">Ionic Equation</h2>
          <div className="mt-2 rounded border border-white/10 p-4 text-center text-lg">
            {lastEvidence.equation}
            <p className="text-xs text-slate-400">{lastEvidence.observation}</p>
          </div>
          <h2 className="mt-4 font-bold">Hazards & Safety</h2>
          <div className="mt-2 rounded border border-amber-300/30 bg-amber-300/10 p-3 text-xs">
            ⚠ H₂SO₄ · Corrosive
            <br />⚠ HCl · Irritant
            <br />
            🧤 Wear goggles, gloves and lab coat.
          </div>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold text-cyan-200">Inference from Evidence</h3>
          <div className="mt-3 flex items-center gap-4">
            <CheckCircle2 size={45} className="text-emerald-400" />
            <div>
              <b className="text-xl text-emerald-300">{lastEvidence.confidence >= 90 ? "Ba²⁺ confirmed" : "Evidence in progress"}</b>
              <p className="text-xs text-slate-400">Confidence: {lastEvidence.confidence}%　•　Apple-green flame and reagent evidence</p>
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
