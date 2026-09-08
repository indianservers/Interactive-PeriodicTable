import { useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  Boxes,
  FlaskConical,
  Library,
  Settings,
} from "lucide-react";
const ligands = [
  ["NH₃", "ammine", "neutral, σ-donor"],
  ["H₂O", "aqua", "neutral, σ-donor"],
  ["CN⁻", "cyano", "strong field, σ/π-acceptor"],
  ["Cl⁻", "chloro", "weak field, σ-donor"],
  ["en", "ethylenediamine", "bidentate, σ-donor"],
];
export default function CoordinationTargetPage() {
  const [ligand, setLigand] = useState(0);
  const [geometry, setGeometry] = useState("Octahedral");
  const [spin, setSpin] = useState("Low-spin");
  const [tab, setTab] = useState("Isomers & Stereochemistry");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const visibleLigands = ligands
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    );
  const selectedLigand = ligands[ligand];
  const coordinationNumber =
    geometry === "Square Planar" ? 4 : geometry === "Tetrahedral" ? 4 : 6;
  const ligandCount =
    selectedLigand[0] === "en"
      ? Math.ceil(coordinationNumber / 2)
      : coordinationNumber;
  const magneticMoment = spin === "Low-spin" ? "0.0" : "4.90";
  const solutionColor =
    selectedLigand[0] === "CN⁻"
      ? "Pale yellow"
      : selectedLigand[0] === "Cl⁻"
        ? "Green-yellow"
        : selectedLigand[0] === "NH₃"
          ? "Yellow-orange"
          : "Violet";
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[62px] items-center gap-4 border-b border-white/10 bg-[#0a1b2b] px-5">
        <Atom size={38} className="text-cyan-300" />
        <div>
          <h1 className="text-xl font-black">Coordination Chemistry Studio</h1>
          <p className="text-xs text-slate-400">
            Build 1.0　•　Explore　•　Visualize　•　Learn
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto w-80 rounded border border-white/20 bg-slate-950 p-2 text-xs"
          placeholder="Search complexes, ligands, or concepts..."
        />
        {["Models", "Settings", "Help"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " opened")}
            className="text-xs"
          >
            {x}
          </button>
        ))}
      </header>
      <div className="grid h-[calc(100vh-62px)] grid-cols-[170px_330px_1fr_380px] grid-rows-[1fr_205px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col gap-2 border-r border-white/10 bg-[#081b2c] p-3">
          {[
            [FlaskConical, "Builder"],
            [Boxes, "Visualize"],
            [Atom, "Ligands"],
            [BarChart3, "Electronic Structure"],
            [Atom, "Isomers"],
            [BarChart3, "Thermodynamics"],
            [BarChart3, "Spectroscopy"],
            [BookOpen, "Library"],
          ].map(([I, x], i) => (
            <button
              key={x}
              onClick={() => announce(x + " selected")}
              className={`flex items-center gap-3 rounded px-2 py-3 text-xs ${i === 0 ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300"}`}
            >
              <I size={19} />
              {x}
            </button>
          ))}
        </aside>
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Ligand Library</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ligands..."
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          />
          {visibleLigands.map(({ item: [a, b, c], index: i }) => (
            <button
              key={a}
              onClick={() => {
                setLigand(i);
                announce(a + " placed");
              }}
              className={`mt-2 flex w-full gap-3 rounded border p-3 text-left ${i === ligand ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600">
                ●
              </span>
              <span>
                <b>{a}</b>
                <br />
                <span className="text-xs text-slate-400">
                  {b}
                  <br />
                  {c}
                </span>
              </span>
            </button>
          ))}
        </aside>
        <section className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#102d48] to-[#071522] p-3">
          <h2 className="text-center text-3xl font-black">
            [Co({selectedLigand[0]})<sub>{ligandCount}</sub>]<sup>3+</sup>
          </h2>
          <p className="text-center text-cyan-300">
            {geometry} · d⁶ · {selectedLigand[1]}
          </p>
          <div className="mt-4 grid h-[390px] place-items-center">
            <div className="relative grid h-56 w-56 place-items-center rounded-full border-4 border-purple-300/70 bg-purple-500/60 text-3xl shadow-[0_0_55px_#8b5cf6]">
              Co
              {Array.from({ length: ligandCount }, (_, i) => (
                <span
                  key={i}
                  className="absolute text-3xl text-blue-400"
                  style={{
                    transform: `rotate(${i * (360 / ligandCount)}deg) translateY(-115px)`,
                  }}
                >
                  ●
                </span>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {["Octahedral", "Tetrahedral", "Square Planar"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setGeometry(x);
                  announce(x + " geometry selected");
                }}
                className={`flex-1 rounded border px-3 py-2 text-xs ${geometry === x ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
              >
                {x}
              </button>
            ))}
            <button
              onClick={() => announce("Space filling view")}
              className="rounded border border-white/20 px-3 py-2 text-xs"
            >
              Space Filling
            </button>
          </div>
        </section>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Complex Properties</h2>
          {[
            ["Metal", "Co (Cobalt)"],
            ["Oxidation state", "+3"],
            ["Coordination number", "6"],
            ["d-electron count", "d⁶"],
            ["Selected ligand", selectedLigand[0]],
            ["Coordination number", String(coordinationNumber)],
          ].map(([a, b]) => (
            <label key={a} className="mt-3 block text-xs">
              {a}
              <input
                readOnly
                value={b}
                className="mt-1 w-full rounded border border-white/20 bg-slate-950 p-2"
              />
            </label>
          ))}
          <h3 className="mt-5 font-bold">
            Spin state ({geometry.toLowerCase()})
          </h3>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSpin("Low-spin")}
              className={`flex-1 rounded border p-2 text-xs ${spin === "Low-spin" ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
            >
              Low-spin
            </button>
            <button
              onClick={() => setSpin("High-spin")}
              className={`flex-1 rounded border p-2 text-xs ${spin === "High-spin" ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
            >
              High-spin
            </button>
          </div>
          <div className="mt-4 h-36 rounded border border-white/10 p-3 text-center text-sm">
            e<sub>g</sub>　────　────
            <br />
            <br />t<sub>2g</sub>　↑↓　↑↓　↑↓
            <p className="mt-3 text-xs text-slate-400">
              Magnetic moment　{magneticMoment} μ<sub>B</sub>
            </p>
          </div>
          <p className="mt-4 text-xs text-cyan-200">
            Predicted color (solution): {solutionColor}
          </p>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex border-b border-white/10">
            {[
              "Isomers & Stereochemistry",
              "Formation & Stability",
              "Spectral Properties",
              "Notes",
            ].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`px-4 py-2 text-xs ${tab === x ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {[
              "cis / trans (MA₄B₂ type)",
              "fac / mer (MA₃B₃ type)",
              "Optical Isomers (Δ / Λ)",
            ].map((x) => (
              <div key={x} className="rounded border border-white/10 p-4">
                <b>{x}</b>
                <div className="my-4 text-center text-2xl text-blue-300">
                  ✣　✣
                </div>
                <p className="text-slate-400">Stereoisomer structures</p>
              </div>
            ))}
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
