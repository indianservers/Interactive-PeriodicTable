import { useState } from "react";
import {
  BarChart3,
  Beaker,
  Boxes,
  Flame,
  Gauge,
  Settings2,
  Zap,
} from "lucide-react";
export default function MetallurgyTargetPage() {
  const [ore, setOre] = useState(62);
  const [coke, setCoke] = useState(28);
  const [lime, setLime] = useState(10);
  const [temp, setTemp] = useState(1200);
  const [oreType, setOreType] = useState("Hematite (Fe₂O₃)");
  const [running, setRunning] = useState(true);
  const [notice, setNotice] = useState("");
  const total = ore + coke + lime;
  const normalizedFeed = total || 1;
  const ironYield = Math.min(98, Math.max(45, 78 + (temp - 1000) * 0.018 - Math.abs((ore / normalizedFeed) * 100 - 62) * 0.22));
  const hotMetal = Math.round((ore / normalizedFeed) * 300 * (ironYield / 100));
  const announce = (x) => setNotice(x);
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[68px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Boxes size={37} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Metallurgy Process Simulator</h1>
          <p className="text-sm text-slate-400">
            Iron extraction · Blast furnace
          </p>
        </div>
        <div className="ml-auto flex items-center gap-5 text-xs">
          <label>
            Operating mode
            <select className="ml-2 rounded border border-white/20 bg-slate-950 p-2">
              <option>Blast furnace</option>
              <option>Electric arc furnace</option>
            </select>
          </label>
          <span>
            Throughput
            <br />
            <b>3,000 t/day</b>
          </span>
          <span className="text-orange-300">
            Hot blast temperature
            <br />
            <b>{temp.toLocaleString()} °C</b>
          </span>
          <span className="text-emerald-300">
            ● {running ? "Simulation running" : "Paused"}
          </span>
          <button
            onClick={() => setRunning((v) => !v)}
            className="rounded border border-cyan-300/50 px-3 py-2"
          >
            {running ? "Ⅱ" : "▶"}
          </button>
        </div>
      </header>
      <div className="grid h-[calc(100vh-68px)] grid-cols-[300px_1fr_430px] grid-rows-[1fr_210px] gap-2 p-2">
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold text-cyan-200">Feed composition (wt%)</h2>
          {[
            ["Iron ore (Fe₂O₃)", ore, setOre],
            ["Coke (C)", coke, setCoke],
            ["Limestone (CaCO₃)", lime, setLime],
          ].map(([x, v, set]) => (
            <label key={x} className="mt-4 block text-xs">
              {x}
              <output className="float-right rounded border border-white/20 px-2 py-1">
                {v.toFixed(1)}
              </output>
              <input
                type="range"
                min="0"
                max="100"
                value={v}
                onChange={(e) => set(+e.target.value)}
                className="mt-2 w-full accent-cyan-300"
              />
            </label>
          ))}
          <h2 className="mt-6 border-t border-white/10 pt-4 font-bold">
            Ore details
          </h2>
          <select value={oreType} onChange={(e) => setOreType(e.target.value)} className="mt-2 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs">
            <option>Hematite (Fe₂O₃)</option>
            <option>Magnetite (Fe₃O₄)</option>
          </select>
          <label className="mt-4 block text-xs">Hot blast temperature (°C)<output className="float-right rounded border border-white/20 px-2 py-1">{temp}</output><input type="range" min="800" max="1800" value={temp} onChange={(e) => setTemp(+e.target.value)} className="mt-2 w-full accent-orange-300" /></label>
          {[
            ["Fe content", "69.9 %"],
            ["Gangue (SiO₂ + Al₂O₃)", "6.1 %"],
            ["Moisture", "2.0 %"],
          ].map(([a, b]) => (
            <div key={a} className="flex justify-between py-2 text-xs">
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Operating parameters</h2>
          {[
            ["Hot blast temperature (°C)", temp],
            ["Blast flow (Nm³/h)", "180,000"],
            ["Top pressure (bar)", "1.8"],
          ].map(([a, b], i) => (
            <div key={a} className="flex justify-between py-2 text-xs">
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-b from-[#14364a] via-[#351c16] to-[#10131a] p-3">
          <div className="relative grid h-full place-items-center">
            <div className="absolute top-3 text-center">
              <b>Ore + Coke + Limestone</b>
              <br />
              <span className="text-xs text-cyan-300">↓</span>
            </div>
            <div className="relative h-[450px] w-72 rounded-[45%_45%_10%_10%] border-4 border-orange-200/60 bg-gradient-to-b from-slate-600/60 via-orange-500/60 to-orange-200/80 shadow-[0_0_55px_#f97316]">
              <div className="absolute inset-x-4 top-12 text-center text-xs">
                Burden (ore, coke, limestone)
              </div>
              <div className="absolute inset-x-10 top-44 rounded-full border-2 border-orange-300 bg-orange-500/50 p-4 text-center text-xs">
                Reduction zone
              </div>
              <div className="absolute inset-x-8 bottom-24 rounded-full border-t-4 border-yellow-200 py-2 text-center text-xs">
                Molten iron
              </div>
              <div className="absolute bottom-4 inset-x-16 text-center text-xs text-slate-300">
                Slag
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-black/50 px-5 py-2 text-xs text-orange-200">
              Temperature profile　200 → 2,000 °C
            </div>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Key reactions (simplified)</h2>
          {[
            ["C + O₂ → CO₂", "ΔH = −393 kJ/mol"],
            ["CO₂ + C → 2CO", "ΔH = +172 kJ/mol"],
            ["Fe₂O₃ + 3CO → 2Fe + 3CO₂", "ΔH = −24 kJ/mol"],
            ["CaCO₃ → CaO + CO₂", "ΔH = +178 kJ/mol"],
          ].map(([a, b], i) => (
            <div
              key={a}
              className="mt-2 rounded border border-white/10 p-3 text-xs"
            >
              <b>
                {i + 1}　{a}
              </b>
              <span className="float-right text-slate-400">{b}</span>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Process results (per hour)</h2>
          {[
            ["Hot metal (molten iron)", `${hotMetal} t/h`],
            ["Slag", "62 t/h"],
            ["Top gas", "320,000 Nm³/h"],
            ["CO₂ (in top gas)", "22.4 %"],
            ["N₂ (in top gas)", "77.1 %"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-2 text-xs"
            >
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
          <div className="mt-5 rounded border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs">
            <b>Yield & efficiency</b>
            <br />
            Iron yield (from {oreType})　{ironYield.toFixed(1)} %<br />
            Thermal efficiency　{Math.min(88, 45 + temp / 30).toFixed(1)} %
          </div>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">Material flow (t/h)</h3>
          <div className="mt-5 flex items-center justify-between text-sm">
            <div>
              Iron ore
              <br />
              <b>{Math.round(ore * 9)} t</b>
              <br />
              <br />
              Coke
              <br />
              <b>{Math.round(coke * 9)} t</b>
            </div>
            <div className="rounded border border-cyan-300/40 bg-slate-500/30 px-6 py-6">
              Blast Furnace
            </div>
            <div className="text-orange-300">
              Hot metal
              <br />
              <b>182 t</b>
              <br />
              <br />
              Slag
              <br />
              <b>62 t</b>
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
