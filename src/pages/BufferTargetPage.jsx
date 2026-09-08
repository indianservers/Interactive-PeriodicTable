import { useState } from "react";
import { Beaker, CheckCircle2, Save, FlaskConical } from "lucide-react";
export default function BufferTargetPage() {
  const [ph, setPh] = useState(5);
  const [vol, setVol] = useState(500);
  const [ratio, setRatio] = useState(0.58);
  const [challenge, setChallenge] = useState(false);
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const capacity = Math.max(
    8,
    Math.round(18 + vol / 80 - Math.abs(ph - 4.76) * 2),
  );
  const ionicStrength = Math.max(
    20,
    Math.round(100 * (vol / 500) * (1 + ratio / 2)),
  );
  const setTargetPh = (value) => {
    setPh(value);
    setRatio(Math.max(0.1, Math.min(2, 10 ** (value - 4.76))));
  };
  const setComponentRatio = (value) => {
    setRatio(value);
    setPh(Math.max(3, Math.min(8, 4.76 + Math.log10(value))));
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <FlaskConical className="text-blue-300" size={31} />
        <div>
          <h1 className="text-2xl font-black">
            Pharmaceutical Buffer Formulator
          </h1>
          <p className="text-sm text-slate-400">
            Design　·　Visualize　·　Validate　·　Formulate
          </p>
        </div>
        <div className="ml-auto text-xs text-slate-400">
          pH in control. Medicines go further.
        </div>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[410px_1fr_520px] gap-3 p-3">
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2135] p-4">
          <h2 className="text-3xl font-black text-blue-100">Acetate buffer</h2>
          <p className="text-sm text-slate-400">
            Mildly acidic buffer for pharmaceutical formulations
          </p>
          <section className="mt-4 rounded border border-white/10 p-3">
            <h3 className="font-bold">Target parameters</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {[
                ["Target pH", ph, setTargetPh, 3, 8],
                ["Final volume", vol, setVol, 100, 1000],
              ].map(([label, value, set, min, max]) => (
                <label key={label} className="text-xs">
                  {label}
                  <output className="float-right rounded border border-white/20 px-2">
                    {value}
                  </output>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={label.includes("pH") ? 0.01 : 10}
                    value={value}
                    onChange={(e) => set(+e.target.value)}
                    className="mt-2 w-full accent-cyan-300"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-white/10 p-3">
                Buffer capacity
                <br />
                <b>{capacity} mM/pH</b>
              </div>
              <div className="rounded border border-white/10 p-3">
                Ionic strength
                <br />
                <b>{ionicStrength} mM</b>
              </div>
            </div>
          </section>
          <h3 className="mt-4 font-bold">Components (stock solutions)</h3>
          {[
            ["CH₃COOH", "Acetic acid", "1.0 M"],
            ["CH₃COONa", "Sodium acetate", "1.0 M"],
          ].map(([a, b, c], i) => (
            <div key={a} className="mt-2 rounded border border-white/10 p-3">
              <b className={i ? "text-violet-300" : "text-amber-300"}>{a}</b>　
              {b}
              <div className="mt-2 text-xs text-slate-400">
                Stock concentration{" "}
                <span className="float-right rounded border border-white/20 px-2">
                  {c}
                </span>
              </div>
            </div>
          ))}
          <div className="mt-4 rounded border border-violet-300/40 p-4 text-center text-xl font-black">
            <span className="text-amber-300">HA</span> :{" "}
            <span className="text-violet-300">A⁻</span> = {ratio.toFixed(2)} : 1
          </div>
        </aside>
        <main className="rounded border border-white/10 bg-gradient-to-br from-[#173b52] to-[#071522] p-4">
          <div className="grid h-full place-items-center">
            <div className="text-center">
              <div className="relative mx-auto h-80 w-64 rounded-b-[45%] border-8 border-slate-300/60 bg-cyan-100/10 shadow-[inset_0_-80px_40px_rgba(34,211,238,.22)]">
                <div className="absolute bottom-8 left-8 right-8 h-40 rounded-b-[45%] bg-cyan-300/25" />
                <div className="absolute left-1/2 top-[-100px] h-48 w-8 -translate-x-1/2 rounded bg-slate-300/70" />
                <div className="absolute left-1/2 top-[-125px] -translate-x-1/2 rounded border border-emerald-300 bg-slate-900 px-3 py-2 text-center text-xs">
                  pH
                  <br />
                  <b className="text-2xl text-emerald-300">{ph.toFixed(2)}</b>
                </div>
              </div>
              <p className="mt-3 text-sm text-cyan-200">
                {vol} mL acetate buffer · I = {ionicStrength} mM
              </p>
            </div>
          </div>
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2135] p-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">
              Henderson–Hasselbalch Equation
            </h2>
            <button onClick={() => announce("Formulation saved")}>
              <Save size={17} />
            </button>
          </div>
          <div className="mt-4 rounded border border-white/10 p-5 text-center text-xl">
            pH = pKₐ + log <span className="text-violet-300">[A⁻]</span>/
            <span className="text-amber-300">[HA]</span>
            <div className="mt-4 flex items-center gap-3">
              <input
                type="range"
                min=".1"
                max="2"
                step=".01"
                value={ratio}
                onChange={(e) => setComponentRatio(+e.target.value)}
                className="w-full accent-violet-300"
              />
              <b className="text-violet-300">{ratio.toFixed(2)}:1</b>
            </div>
          </div>
          <h3 className="mt-4 font-bold">
            Species distribution (acetic acid, pKₐ = 4.76)
          </h3>
          <div className="mt-2 h-44 rounded border border-white/10 bg-[linear-gradient(transparent_49%,rgba(255,255,255,.14)_50%,transparent_51%)]">
            <div className="h-full w-full rounded bg-gradient-to-r from-amber-300/50 via-transparent to-violet-400/60" />
          </div>
          <div className="mt-3 rounded border border-white/10 p-3 text-sm">
            At pH {ph.toFixed(2)}:{" "}
            <span className="text-amber-300">
              HA = {(100 / (1 + Math.pow(10, ph - 4.76))).toFixed(1)}%
            </span>
            　
            <span className="text-violet-300">
              A⁻ = {(100 - 100 / (1 + Math.pow(10, ph - 4.76))).toFixed(1)}%
            </span>
          </div>
          <section className="mt-4 rounded border border-white/10 p-4">
            <h3 className="font-bold">Challenge buffer</h3>
            <p className="text-xs text-slate-400">
              Test resistance to pH change (add strong acid or base)
            </p>
            <button
              onClick={() => {
                setChallenge((v) => !v);
                announce(
                  challenge ? "Challenge reset" : "HCl challenge applied",
                );
              }}
              className="mt-3 rounded bg-blue-500 px-4 py-2 font-bold"
            >
              {challenge ? "Reset challenge" : "Apply HCl"}
            </button>
            <span className="ml-4 text-emerald-300">
              pH after challenge {(ph - (challenge ? 0.04 : 0)).toFixed(2)} ✓
            </span>
          </section>
          <div className="mt-4 rounded border border-emerald-400/30 p-3 text-emerald-300">
            <CheckCircle2 size={15} className="mr-1 inline" /> All formulation
            criteria met
          </div>
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
