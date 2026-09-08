import { useState } from "react";
import {
  BarChart3,
  Beaker,
  Boxes,
  ChevronRight,
  CircleHelp,
  GitCompare,
  Library,
  Moon,
  Settings2,
  Sun,
} from "lucide-react";

const monomers = [
  [
    "Ethene",
    "C₂H₄",
    "Vinyl group",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Propene",
    "C₃H₆",
    "Alkene",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Styrene",
    "C₈H₈",
    "Aromatic vinyl",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Vinyl chloride",
    "C₂H₃Cl",
    "Chloroalkene",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Lactic acid",
    "C₃H₆O₃",
    "Hydroxy acid",
    "Condensation",
    "Step-growth polyesterification",
    "Water released",
  ],
];
export default function PolymerTargetPage() {
  const [selected, setSelected] = useState(0);
  const [n, setN] = useState(120);
  const [branch, setBranch] = useState(0);
  const [cross, setCross] = useState(0);
  const [tacticity, setTacticity] = useState("Atactic");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("Molecular");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const name =
    selected === 0 ? "Polyethylene" : `${monomers[selected][0]} polymer`;
  const polymerization = monomers[selected][3];
  const mechanismLabel = monomers[selected][4];
  const byproduct = monomers[selected][5];
  const visibleMonomers = monomers
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        !query.trim() ||
        item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    );
  const density = Math.max(
    0.72,
    0.92 +
      branch * 0.003 +
      cross * 0.008 +
      (tacticity === "Isotactic"
        ? 0.04
        : tacticity === "Syndiotactic"
          ? 0.02
          : 0),
  );
  const flexibility = Math.max(5, Math.round(100 - branch * 0.8 - cross * 2));
  const glassTransition =
    selected === 2 ? 100 : selected === 3 ? 80 : selected === 4 ? 75 : -125;
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091a2b] px-5">
        <Boxes className="text-cyan-300" size={34} />
        <div>
          <h1 className="text-[24px] font-black">Polymer Builder</h1>
          <p className="text-xs text-slate-400">From monomer to material</p>
        </div>
        <nav className="ml-auto flex items-center gap-6 text-xs">
          <button className="border-b-2 border-cyan-300 py-4 text-cyan-200">
            Simulation
          </button>
          <button onClick={() => announce("Properties selected")}>
            Properties
          </button>
          <button onClick={() => announce("Compare selected")}>Compare</button>
          <button onClick={() => announce("Export started")}>Export</button>
          <select
            value={selected}
            onChange={(e) => {
              const next = Number(e.target.value);
              setSelected(next);
              announce(`${monomers[next][0]} selected`);
            }}
            className="rounded border border-white/20 bg-[#0c2237] p-2"
          >
            {monomers.map(([m], index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
          <Sun size={16} />
          <Moon size={16} />
          <span className="rounded-full bg-indigo-400 px-3 py-2 font-bold">
            LS
          </span>
        </nav>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[72px_245px_1fr_345px] grid-rows-[1fr_205px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col items-center gap-5 border-r border-white/10 bg-[#081c2e] py-5 text-[10px]">
          {[
            [Boxes, "Builder"],
            [Beaker, "Monomers"],
            [BarChart3, "Simulations"],
            [GitCompare, "Properties"],
            [Library, "Compare"],
            [Library, "Library"],
          ].map(([I, x], i) => (
            <button
              key={x}
              onClick={() => announce(x + " opened")}
              className={`flex w-full flex-col items-center gap-1 py-2 ${i === 0 ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300"}`}
            >
              <I size={20} />
              {x}
            </button>
          ))}
        </aside>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Monomer Library</h2>
          <input
            value={query}
            placeholder="Search monomers..."
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
            onChange={(e) => setQuery(e.target.value)}
          />
          {visibleMonomers.map(({ item: [m, f, d], index: i }) => (
            <button
              key={m}
              onClick={() => {
                setSelected(i);
                announce(m + " loaded");
              }}
              className={`mt-2 w-full rounded-lg border p-3 text-left ${i === selected ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-700">
                  {i === 0 ? "C=C" : "●"}
                </span>
                <span>
                  <b className="text-sm">{m}</b>
                  <br />
                  <span className="text-xs text-slate-400">
                    {f}
                    <br />
                    {d}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </aside>
        <section className="rounded-lg border border-white/10 bg-[#091c2d] p-3">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-slate-400">
                {mechanismLabel} polymerization of{" "}
                {monomers[selected][0].toLowerCase()}
              </p>
            </div>
            <div className="flex rounded border border-white/20 text-xs">
              {["Molecular", "Polymer", "Material"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-4 py-2 ${viewMode === mode ? "bg-cyan-300/15 text-cyan-200" : ""}`}
                >
                  {mode === "Molecular" ? "⚙" : mode === "Polymer" ? "♧" : "◈"}{" "}
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 grid h-56 grid-cols-3 rounded-lg bg-black/25 p-4">
            <div>
              <h3 className="font-bold text-amber-300">
                1.{" "}
                {polymerization === "Addition"
                  ? "Initiator"
                  : "Functional-group activation"}
              </h3>
              <p className="text-xs text-slate-400">
                {polymerization === "Addition"
                  ? "Radical initiates chain"
                  : "Reactive end groups couple"}
              </p>
              <div className="mt-12 text-center text-4xl text-orange-300">
                ●→●
              </div>
            </div>
            <div className="border-x border-white/10 px-5">
              <h3 className="font-bold text-emerald-300">
                2.{" "}
                {polymerization === "Addition" ? "Propagation" : "Step growth"}
              </h3>
              <p className="text-xs text-emerald-300">
                {polymerization === "Addition"
                  ? "Propagate chain"
                  : "Build polyester links"}
              </p>
              <div className="mt-12 text-center text-4xl text-emerald-300">
                ●—●—●—●
              </div>
            </div>
            <div className="px-5">
              <h3 className="font-bold text-fuchsia-300">
                3. {polymerization === "Addition" ? "Termination" : "Byproduct"}
              </h3>
              <p className="text-xs text-fuchsia-300">
                {polymerization === "Addition"
                  ? "Two radicals combine"
                  : byproduct}
              </p>
              <div className="mt-12 text-center text-4xl text-slate-300">
                ●—●—●
              </div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border border-white/10 p-3">
              Molecular chain (n = 10)
              <div className="mt-5 text-center text-2xl">●—●—●—●—●</div>
            </div>
            <div className="rounded border border-white/10 p-3">
              Tangled polymer (n = {n})
              <div className="mt-5 text-center text-2xl">╲●╱●╲●╱●╲</div>
            </div>
            <div className="rounded border border-white/10 p-3">
              Material (semi-crystalline)
              <div className="mt-5 h-12 rounded bg-slate-500/30" />
            </div>
          </div>
        </section>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Polymerization Controls</h2>
          <label className="mt-4 block text-xs">
            Degree of polymerization (n)
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {n}
            </output>
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">
            Branching (long-chain)
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {branch}%
            </output>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={branch}
            onChange={(e) => setBranch(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">
            Cross-link density
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {cross}%
            </output>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={cross}
            onChange={(e) => setCross(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">Tacticity</label>
          <select
            value={tacticity}
            onChange={(e) => setTacticity(e.target.value)}
            className="mt-2 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Atactic</option>
            <option>Isotactic</option>
            <option>Syndiotactic</option>
          </select>
          <h2 className="mt-6 font-bold">Predicted Properties</h2>
          {[
            ["Density", `${density.toFixed(2)} g/cm³`],
            ["Flexibility", `${flexibility}%`],
            ["Tg (glass transition)", `${glassTransition} °C`],
            ["Recyclability", cross > 12 ? "Moderate" : "High"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span className="text-slate-400">{a}</span>
              <b className="text-emerald-300">{b}</b>
            </div>
          ))}
          <div className="mt-4 rounded border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs">
            ♧ Sustainable by design
            <br />
            <span className="text-slate-400">
              Adjust structure to explore how molecular design affects
              performance and end-of-life.
            </span>
          </div>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">
            Addition vs Condensation Polymerization{" "}
            <CircleHelp size={14} className="inline text-slate-400" />
          </h3>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border border-white/10 p-3">
              <b className="text-cyan-300">Addition Polymerization</b>
              <div className="my-3 text-center text-lg">C=C → [—C—C—]ₙ</div>
              <p>
                • No small molecule byproduct
                <br />• Fast chain-growth
                <br />• Common for vinyl monomers
              </p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b className="text-fuchsia-300">Condensation Polymerization</b>
              <div className="my-3 text-center text-lg">
                ●—● → [—●—●—]ₙ + H₂O
              </div>
              <p>
                • Releases small molecule
                <br />• Step-growth mechanism
                <br />• Common for polyesters
              </p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b>Key Differences</b>
              <p className="mt-3 leading-6">
                Monomers: vinyl vs bifunctional
                <br />
                Mechanism: chain-growth vs step-growth
                <br />
                Byproduct: none vs small molecule
              </p>
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
