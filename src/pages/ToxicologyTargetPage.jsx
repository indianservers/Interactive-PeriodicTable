import { useState } from "react";
import { Activity, ShieldCheck, RotateCcw } from "lucide-react";
export default function ToxicologyTargetPage() {
  const [dose, setDose] = useState(10);
  const [tab, setTab] = useState("Pathways");
  const [notice, setNotice] = useState("");
  const [nac, setNac] = useState(false);
  const announce = (x) => setNotice(x);
  const risk = nac ? "Low" : dose > 12 ? "High" : dose > 7 ? "Moderate" : "Low";
  const cypFraction = nac ? 12 : dose > 12 ? 32 : dose > 7 ? 24 : 16;
  const glucuronidation = 56 - Math.round(cypFraction / 4);
  const sulfation = 100 - cypFraction - glucuronidation;
  const alt = nac ? 105 : Math.round(380 + dose * 87);
  const ast = nac ? 92 : Math.round(300 + dose * 68);
  const tabSummary = {
    Pathways: "Biotransformation routes and reactive metabolite formation",
    "Cellular View": "Glutathione depletion, oxidative stress, and hepatocyte injury",
    "Molecular Structures": "Acetaminophen, NAPQI, and glutathione interaction",
    "Clinical Timeline": "Dose → metabolism → biomarkers → intervention",
  }[tab];
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[68px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <Activity className="text-blue-300" size={34} />
        <div>
          <h1 className="text-2xl font-black">Molecular Toxicology Studio</h1>
          <p className="text-sm text-slate-400">
            Explore molecular mechanisms. Build understanding. Safer decisions.
          </p>
        </div>
        <div className="ml-auto flex gap-6 text-xs text-slate-400">
          <button onClick={() => announce("Model mode selected")}>
            ⚙ Model
          </button>
          <button onClick={() => announce("Compound library opened")}>
            Library
          </button>
          <span className="text-emerald-300">● Hepatotoxicity Module</span>
        </div>
      </header>
      <div className="grid h-[calc(100vh-68px)] grid-cols-[230px_275px_1fr_400px] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0a1e31] p-3">
          {[
            "Toxicology Studio",
            "Compounds",
            "Organs & Systems",
            "Simulations",
            "Case Explorer",
            "Molecular Viewer",
            "Learning Center",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => announce(`${x} selected`)}
              className={`mb-2 w-full rounded px-3 py-3 text-left text-sm ${i === 0 ? "border-l-2 border-cyan-300 bg-blue-500/15 text-cyan-200" : "text-slate-300"}`}
            >
              {x}
            </button>
          ))}
          <div className="mt-16 rounded border border-white/10 p-3 text-xs text-slate-400">
            Hepatotoxicity
            <br />
            <span className="text-cyan-200">● Active model</span>
          </div>
        </aside>
        <aside className="rounded border border-white/10 bg-[#0b2135] p-4">
          <h2 className="font-bold text-cyan-200">Simulate dose response</h2>
          <label className="mt-5 block text-sm">
            Acetaminophen dose{" "}
            <output className="float-right rounded border px-2">
              {dose} g
            </output>
            <input
              type="range"
              min="0"
              max="15"
              step=".5"
              value={dose}
              onChange={(e) => setDose(+e.target.value)}
              className="mt-3 w-full accent-blue-400"
            />
          </label>
          <h3 className="mt-6 font-bold">Body factors</h3>
          {[
            ["Body weight", "70 kg"],
            ["Age", "30 years"],
            ["Alcohol use", "None"],
            ["Enzyme activity", "Normal"],
            ["Nutritional status", "Normal"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="mt-3 rounded border border-white/10 p-2 text-xs"
            >
              {a}
              <span className="float-right text-cyan-200">{b}</span>
            </div>
          ))}
          <button
            onClick={() => {
              setDose(10);
              setNac(false);
              setTab("Pathways");
              announce("Dose reset to default");
            }}
            className="mt-5 text-xs text-cyan-300"
          >
            <RotateCcw size={14} className="mr-1 inline" />
            Reset to default
          </button>
        </aside>
        <main className="rounded border border-white/10 bg-gradient-to-br from-[#17384b] to-[#071522] p-3">
          <div className="flex rounded border border-white/10">
            {[
              "Pathways",
              "Cellular View",
              "Molecular Structures",
              "Clinical Timeline",
            ].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`flex-1 px-3 py-3 text-sm ${tab === x ? "border-b-2 border-cyan-300 bg-blue-500/20" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="relative mt-3 h-[580px] overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(157,78,90,.55),transparent_55%),linear-gradient(135deg,#253c48,#14202f)]">
            <div className="absolute left-4 right-4 top-4 rounded border border-cyan-300/20 bg-slate-950/45 px-3 py-2 text-center text-xs text-cyan-100">
              {tabSummary}
            </div>
            <div className="absolute left-[38%] top-[13%] rounded border border-cyan-300/50 bg-slate-900/80 p-3 text-center">
              Acetaminophen
              <br />
              <span className="text-xs text-cyan-200">C₈H₉NO₂</span>
            </div>
            <div className="absolute left-[22%] top-[44%] rounded border border-blue-300 bg-blue-500/20 p-3 text-center">
              Glucuronidation
              <br />
              <small>~50–60%</small>
            </div>
            <div className="absolute left-[67%] top-[44%] rounded border border-amber-300 bg-amber-500/20 p-3 text-center">
              CYP450 → NAPQI
              <br />
              <small>reactive metabolite</small>
            </div>
            <div className="absolute left-[42%] top-[70%] rounded border border-red-300 bg-red-500/20 p-3 text-center">
              Protein binding
              <br />
              <small>oxidative stress → injury</small>
            </div>
            <div className="absolute left-[13%] top-[33%] text-5xl text-blue-300">
              ↓
            </div>
            <div className="absolute left-[62%] top-[33%] text-5xl text-amber-300">
              ↓
            </div>
            <div className="absolute left-[49%] top-[61%] text-5xl text-red-300">
              ↓
            </div>
          </div>
        </main>
        <aside className="space-y-3 overflow-auto">
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold text-cyan-200">Dose metabolism flow</h2>
            <div className="mt-4 h-48 rounded bg-gradient-to-r from-blue-400/50 via-green-400/40 to-amber-300/50 p-5 text-center text-sm">
              Acetaminophen dose ({dose} g)
              <br />
              <span className="text-cyan-200">
                Glucuronidation {glucuronidation}%
              </span>
              <br />
              <span className="text-green-300">Sulfation {sulfation}%</span>
              <br />
              <span className="text-amber-300">
                CYP450 → NAPQI {cypFraction}%
              </span>
            </div>
          </section>
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold">Biomarkers & risk</h2>
            {[
              ["Plasma acetaminophen", "12 µg/mL"],
              ["ALT (liver enzyme)", `${alt.toLocaleString()} U/L`],
              ["AST", `${ast.toLocaleString()} U/L`],
              ["Bilirubin", "2.1 mg/dL"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="mt-2 flex justify-between border-b border-white/10 py-2 text-xs"
              >
                <span>{a}</span>
                <b>{b}</b>
              </div>
            ))}
            <div
              className={`mt-4 rounded border p-3 text-center ${risk === "High" ? "border-red-400 bg-red-500/10 text-red-300" : risk === "Moderate" ? "border-amber-300/40 text-amber-200" : "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"}`}
            >
              Liver injury risk
              <br />
              <strong className="text-2xl">{risk}</strong>
            </div>
          </section>
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold text-emerald-300">
              <ShieldCheck className="mr-1 inline" size={17} />
              Antidote: N-acetylcysteine
            </h2>
            <button
              onClick={() => {
                setNac((v) => !v);
                announce(nac ? "Antidote removed" : "NAC mechanism shown");
              }}
              className="mt-3 w-full rounded bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200"
            >
              {nac ? "Hide mechanism" : "Show mechanism"}
            </button>
            {nac && (
              <p className="mt-3 text-xs text-slate-300">
                Replenishes glutathione and directly conjugates NAPQI.
              </p>
            )}
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
