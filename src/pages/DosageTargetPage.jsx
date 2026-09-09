import { useState } from "react";
import { Beaker, CheckCircle2, Play, Settings2 } from "lucide-react";
const forms = [
  "Tablet",
  "Capsule",
  "Suspension",
  "Emulsion",
  "Transdermal Patch",
];
export default function DosageTargetPage() {
  const [form, setForm] = useState("Tablet");
  const [polymer, setPolymer] = useState(35);
  const [particle, setParticle] = useState(120);
  const [force, setForce] = useState(12);
  const [coat, setCoat] = useState(80);
  const [view, setView] = useState("3D View");
  const [running, setRunning] = useState(false);
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const releaseAt8h = Math.max(
    35,
    Math.min(
      98,
      Math.round(
        88 -
          polymer * 0.22 +
          coat * 0.08 +
          particle * 0.02 -
          force * 0.45 +
          (form === "Capsule" ? 6 : form === "Transdermal Patch" ? -18 : 0),
      ),
    ),
  );
  const releaseAt12h = Math.max(
    releaseAt8h,
    Math.min(99, releaseAt8h + (form === "Transdermal Patch" ? 8 : 14)),
  );
  const releaseMode =
    form === "Transdermal Patch"
      ? "Controlled"
      : form === "Suspension" || form === "Emulsion"
        ? "Immediate-release"
        : "Extended-release";
  const resetDesigner = () => {
    setForm("Tablet");
    setPolymer(35);
    setParticle(120);
    setForce(12);
    setCoat(80);
    setView("3D View");
    setRunning(false);
    announce("Dosage designer reset");
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[65px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Beaker size={36} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Dosage Form Designer</h1>
          <p className="text-sm text-slate-400">
            Design. Simulate. Optimize. Better Medicines.
          </p>
        </div>
        <input
          className="ml-auto w-64 rounded border border-white/15 bg-slate-900/60 p-2 text-xs"
          placeholder="Search formulations..."
        />
        <button onClick={() => announce("Projects opened")}>Projects</button>
        <button onClick={() => announce("Library opened")}>Library</button>
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-65px)] grid-cols-[320px_1fr_365px] grid-rows-[1fr_190px] gap-2 p-2">
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Select Dosage Form</h2>
          {forms.map((x) => (
            <button
              key={x}
              onClick={() => {
                setForm(x);
                announce(x + " selected");
              }}
              className={`mt-2 w-full rounded border p-4 text-left text-sm ${form === x ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              ◉　{x}
            </button>
          ))}
          <h2 className="mt-6 border-t border-white/10 pt-4 font-bold">
            Formulation Parameters
          </h2>
          {[
            ["Polymer (%)", polymer, setPolymer, 0, 100],
            ["Particle size (µm)", particle, setParticle, 10, 500],
            ["Compression force (kN)", force, setForce, 2, 30],
            ["Coating thickness (µm)", coat, setCoat, 0, 200],
          ].map(([x, v, set, min, max]) => (
            <label key={x} className="mt-4 block text-xs">
              {x}
              <output className="float-right rounded border border-white/20 px-2 py-1">
                {v}
              </output>
              <input
                type="range"
                min={min}
                max={max}
                value={v}
                onChange={(e) => set(+e.target.value)}
                className="mt-2 w-full accent-cyan-300"
              />
            </label>
          ))}
          <div className="mt-5 rounded border border-white/10 p-3 text-xs">
            Active ingredient
            <br />
            <b>Metoprolol succinate　100 mg</b>
            <br />
            <br />
            Polymer (example)
            <br />
            <b>HPMC (K100M)</b>
          </div>
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-br from-[#152f49] to-[#0a1725] p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {releaseMode} {form.toLowerCase()}
              </h2>
              <p className="text-sm text-slate-400">
                Multilayer matrix system for controlled drug release
              </p>
            </div>
            <div className="flex rounded border border-white/20 text-xs">
              {["3D View", "Cross-section", "Components"].map((label) => (
              <button
                key={label}
                onClick={() => {
                  setView(label);
                  announce(`${label} selected`);
                }}
                className={`px-4 py-2 ${view === label ? "bg-blue-500/30 text-cyan-100" : ""}`}
              >
                {label}
              </button>
              ))}
            </div>
          </div>
          <div className="grid h-[430px] place-items-center">
            <div className="relative text-center">
              <div className="text-[190px] text-slate-300/70">◉</div>
              <p className="text-xs text-cyan-200">
                {view} · {" "}
                Film coating · drug-loaded matrix · inner core
              </p>
            </div>
          </div>
          <section className="rounded border border-white/10 p-3">
            <h3 className="font-bold">
              Immediate vs. Sustained Release (Simulation)
            </h3>
            <div className="mt-3 h-20 rounded bg-gradient-to-r from-cyan-300/20 to-transparent" />
            <p className="text-xs text-cyan-200">
              ER: {releaseAt8h}% at 8 h　~{releaseAt12h}% at 12 h
            </p>
          </section>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Release Profile</h2>
          <h3 className="mt-3 text-xl text-cyan-200">
            Dissolution {releaseAt8h}% at 8 h
          </h3>
          <div className="mt-3 h-48 rounded border border-cyan-300/30 bg-gradient-to-t from-cyan-400/40 to-transparent" />
          <h2 className="mt-5 font-bold">Tablet Quality Attributes</h2>
          {[
            [
              "Disintegration time",
              `${Math.max(12, Math.round(82 - force * 2.1))} min`,
            ],
            ["Hardness", `${(8 + force * 0.36).toFixed(1)} kP`],
            [
              "Friability",
              `${Math.max(0.12, 0.52 - force * 0.018).toFixed(2)}%`,
            ],
            [
              "Content uniformity",
              `${Math.max(94, Math.min(99.8, 97.4 + coat * 0.02)).toFixed(1)}%`,
            ],
          ].map(([a, b]) => (
            <div
              key={a}
              className="mt-2 rounded border border-white/10 p-3 text-xs"
            >
              <span>{a}</span>
              <br />
              <b className="text-cyan-200">{b}</b>
              <CheckCircle2
                size={14}
                className="float-right text-emerald-300"
              />
            </div>
          ))}
          <button
            onClick={() => {
              setRunning((v) => !v);
              announce(
                running
                  ? "Formulation test paused"
                  : "Formulation test running",
              );
            }}
            className="mt-5 w-full rounded bg-cyan-400 px-4 py-3 font-bold text-slate-900"
          >
            <Play size={15} className="mr-1 inline" />
            {running ? "Pause test" : "Run formulation test"}
          </button>
          <button
            onClick={resetDesigner}
            className="mt-2 w-full rounded border border-white/20 px-4 py-2 text-xs"
          >
            Reset designer
          </button>
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
