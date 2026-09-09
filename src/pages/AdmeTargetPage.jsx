import { useState } from "react";
import {
  Activity,
  Beaker,
  Play,
  Settings2,
  FlaskConical,
  BookOpen,
  BarChart3,
  Scale,
  Home,
  SlidersHorizontal,
} from "lucide-react";
export default function AdmeTargetPage() {
  const [dose, setDose] = useState(100);
  const [ph, setPh] = useState(7.4);
  const [logp, setLogp] = useState(2.1);
  const [solubility, setSolubility] = useState(0.5);
  const [release, setRelease] = useState("Immediate release");
  const [patient, setPatient] = useState("Healthy adult (70 kg)");
  const [firstPass, setFirstPass] = useState(true);
  const [transporters, setTransporters] = useState(true);
  const [renal, setRenal] = useState(true);
  const [time, setTime] = useState(8.2);
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const unionizedFraction = 1 / (1 + 10 ** (ph - 7.4));
  const bioavailability = Math.max(
    8,
    Math.min(
      92,
      Math.round(
        42 +
          solubility * 18 +
          logp * 6 -
          (1 - unionizedFraction) * 10 -
          (firstPass ? 12 : 0) -
          (transporters ? 6 : 0),
      ),
    ),
  );
  const cmax = Math.round(((dose * bioavailability) / 100) * 4.7);
  const tmax = release === "Extended release" ? 4.4 : 2.6;
  const halfLife = Math.max(
    2.5,
    Number(
      (
        8.4 +
        logp * 0.9 -
        (renal ? 1.2 : 0) +
        (patient.startsWith("Pediatric") ? 1.1 : 0)
      ).toFixed(1),
    ),
  );
  const auc = Math.round(cmax * halfLife * 1.06);
  const resetSimulation = () => {
    setDose(100);
    setPh(7.4);
    setLogp(2.1);
    setSolubility(0.5);
    setRelease("Immediate release");
    setPatient("Healthy adult (70 kg)");
    setFirstPass(true);
    setTransporters(true);
    setRenal(true);
    setTime(8.2);
    setRunning(false);
    announce("ADME simulation reset");
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[65px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Activity size={37} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black text-cyan-200">
            ADME Journey Simulator
          </h1>
          <p className="text-sm text-slate-400">
            Absorption · Distribution · Metabolism · Excretion
          </p>
        </div>
        <p className="ml-auto text-xs text-slate-400">
          From pill to patient · A molecular journey
        </p>
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-65px)] grid-cols-[82px_300px_1fr_380px] grid-rows-[1fr_115px] gap-2 p-2">
        <nav
          className="row-span-2 flex flex-col items-center gap-5 rounded-lg border border-white/10 bg-[#081c2d] py-5 text-[10px] text-slate-400"
          aria-label="ADME navigation"
        >
          {[
            ["Simulate", Play],
            ["Molecules", FlaskConical],
            ["Physiology", Activity],
            ["Results", BarChart3],
            ["Compare", Scale],
            ["Library", BookOpen],
            ["Settings", SlidersHorizontal],
          ].map(([label, Icon]) => (
            <button
              key={label}
              onClick={() => announce(`${label} selected`)}
              className={`flex w-full flex-col items-center gap-1 px-1 py-2 ${label === "Simulate" ? "border-l-2 border-cyan-300 bg-cyan-300/10 text-cyan-200" : "hover:text-cyan-200"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">1. Drug & Formulation</h2>
          {[
            ["Oral dose", dose, setDose, "mg"],
            ["pKa (acid)", ph, setPh, ""],
            ["logP (lipophilicity)", logp, setLogp, ""],
          ].map(([x, v, set, u]) => (
            <label key={x} className="mt-5 block text-xs">
              {x}
              <output className="float-right rounded border border-white/20 px-2 py-1">
                {v}
                {u}
              </output>
              <input
                type="range"
                min="0"
                max={x === "Oral dose" ? 500 : x.startsWith("pKa") ? 14 : 6}
                step="0.1"
                value={v}
                onChange={(e) => set(+e.target.value)}
                className="mt-2 w-full accent-cyan-300"
              />
            </label>
          ))}
          <label className="mt-5 block text-xs">
            Aqueous solubility{" "}
            <output className="float-right">{solubility.toFixed(2)} mg/mL</output>
            <input
              type="range"
              min="0"
              max="2"
              step=".1"
              value={solubility}
              onChange={(e) => setSolubility(+e.target.value)}
              className="mt-2 w-full accent-cyan-300"
            />
          </label>
          <select
            value={release}
            onChange={(e) => setRelease(e.target.value)}
            className="mt-4 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Immediate release</option>
            <option>Extended release</option>
          </select>
          <h2 className="mt-6 border-t border-white/10 pt-4 font-bold">
            2. Simulation Options
          </h2>
          <select
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Healthy adult (70 kg)</option>
            <option>Pediatric (30 kg)</option>
          </select>
          {[
            ["First-pass metabolism", firstPass, setFirstPass],
            ["Transporters (e.g., P-gp)", transporters, setTransporters],
            ["Renal excretion", renal, setRenal],
          ].map(([x, checked, setChecked]) => (
            <label key={x} className="mt-4 flex justify-between text-xs">
              {x}
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
              />
            </label>
          ))}
          <button
            onClick={() => {
              setRunning((v) => !v);
              announce(running ? "Simulation paused" : "Simulation running");
            }}
            className="mt-6 w-full rounded bg-blue-500 px-3 py-3 font-bold"
          >
            <Play size={15} className="mr-1 inline" />
            {running ? "Pause" : "Run Simulation"}
          </button>
          <button
            onClick={resetSimulation}
            className="mt-2 w-full rounded border border-white/20 px-3 py-2 text-xs"
          >
            Reset simulation
          </button>
        </aside>
        <main className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#143d58] to-[#111a30] p-3">
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-[290px] text-cyan-300/20">♙</div>
          </div>
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="rounded border border-cyan-300/30 bg-slate-950/50 p-3 text-sm">
              Oral dose <b>{dose} mg</b>　→　Stomach: tablet dissolves
              <br />
              Intestine: {bioavailability}% absorption to portal vein　→　Liver
              metabolism (CYP450)
              <br />
              Kidneys: excretion in urine
            </div>
            <div className="mx-auto text-center text-7xl text-amber-300">
              ● → ● → ● → ●
            </div>
            <div className="rounded border border-white/10 bg-slate-950/60 p-3 text-xs">
              Molecular journey · One molecule, a big story.
            </div>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Plasma Concentration–Time Profile</h2>
          <div className="mt-4 h-44 rounded border border-cyan-300/30 bg-gradient-to-t from-cyan-400/40 to-transparent">
            <div className="ml-12 h-full w-1/2 rounded-full border-t-4 border-cyan-300" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div>
              Cmax
              <br />
              <b>{cmax} ng/mL</b>
            </div>
            <div>
              Tmax
              <br />
              <b>{tmax} h</b>
            </div>
            <div>
              Half-life (t½)
              <br />
              <b>{halfLife} h</b>
            </div>
            <div>
              AUC₀–∞
              <br />
              <b>{auc.toLocaleString()} ng·h/mL</b>
            </div>
            <div>
              Bioavailability (F)
              <br />
              <b className="text-emerald-300">{bioavailability}%</b>
            </div>
          </div>
          <h2 className="mt-5 font-bold">Tissue Distribution (at 4 hours)</h2>
          {[
            ["Plasma", 180],
            ["Liver", 420],
            ["Kidney", 310],
            ["Lung", 95],
            ["Brain", 28],
            ["Muscle", 62],
            ["Adipose", 48],
          ].map(([x, v]) => (
            <div key={x} className="mt-2 flex items-center gap-2 text-xs">
              <span className="w-14">{x}</span>
              <div
                className="h-3 rounded bg-blue-400"
                style={{ width: v / 2 }}
              />
              <b>{v}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Key Parameters</h2>
          <div className="mt-2 rounded border border-white/10 p-3 text-xs leading-6">
            Oral dose　{dose} mg
            <br />
            Bioavailability　{bioavailability}%
            <br />
            Unionized fraction　{Math.round(unionizedFraction * 100)}%
            <br />
            Clearance　12.5 L/h
            <br />
            Volume of distribution　75 L<br />
            Half-life　{halfLife} h
          </div>
        </aside>
        <section className="col-start-2 col-span-2 flex items-center gap-4 rounded-lg border border-white/10 bg-[#0a1e31] p-4 text-xs">
          <b>Molecular Journey (animation timeline)</b>
          <input
            type="range"
            min="0"
            max="72"
            value={time}
            onChange={(e) => setTime(+e.target.value)}
            className="flex-1 accent-cyan-300"
          />
          <span>{time} h</span>
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
