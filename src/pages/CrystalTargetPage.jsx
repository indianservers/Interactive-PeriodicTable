import { useState } from "react";
import { Box, CircleDot, Eye, Home, Settings2, Sparkles } from "lucide-react";
const structures = [
  ["NaCl", "Rock salt", "Face-centered cubic (FCC)"],
  ["CsCl", "Cesium chloride", "Primitive cubic"],
  ["ZnS", "Zinc blende", "FCC"],
  ["CaF₂", "Fluorite", "FCC"],
];
export default function CrystalTargetPage() {
  const [s, setS] = useState(0);
  const [cell, setCell] = useState(true);
  const [poly, setPoly] = useState(false);
  const [defect, setDefect] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const [name, type, unit] = structures[s];
  const visibleStructures = structures
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    );
  const structureProps =
    {
      NaCl: [
        "Fm-3m (No. 225)",
        "6:6",
        "4",
        "5.64 Å",
        "0.67 (67%)",
        "2.17 g cm⁻³",
      ],
      CsCl: [
        "Pm-3m (No. 221)",
        "8:8",
        "1",
        "4.12 Å",
        "0.68 (68%)",
        "3.99 g cm⁻³",
      ],
      ZnS: [
        "F-43m (No. 216)",
        "4:4",
        "4",
        "5.41 Å",
        "0.34 (34%)",
        "4.09 g cm⁻³",
      ],
      "CaF₂": [
        "Fm-3m (No. 225)",
        "8:4",
        "4",
        "5.46 Å",
        "0.67 (67%)",
        "3.18 g cm⁻³",
      ],
    }[name] || [];
  const structureMeta = {
    NaCl: {
      formula: "NaCl",
      cation: "Na⁺ (sodium)",
      anion: "Cl⁻ (chloride)",
      molar: "58.44 g mol⁻¹",
      d111: "3.26 Å",
    },
    CsCl: {
      formula: "CsCl",
      cation: "Cs⁺ (cesium)",
      anion: "Cl⁻ (chloride)",
      molar: "168.36 g mol⁻¹",
      d111: "2.38 Å",
    },
    ZnS: {
      formula: "ZnS",
      cation: "Zn²⁺ (zinc)",
      anion: "S²⁻ (sulfide)",
      molar: "97.46 g mol⁻¹",
      d111: "3.12 Å",
    },
    "CaF₂": {
      formula: "CaF₂",
      cation: "Ca²⁺ (calcium)",
      anion: "F⁻ (fluoride)",
      molar: "78.07 g mol⁻¹",
      d111: "3.15 Å",
    },
  }[name];
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[58px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Box className="text-cyan-300" size={32} />
        <h1 className="text-2xl font-black">Crystal Lattice Explorer</h1>
        <p className="text-xs text-slate-400">
          Visualize · Analyze · Understand · Build Materials
        </p>
        <nav className="ml-auto flex gap-4 text-xs">
          <button className="rounded border border-cyan-300/50 px-3 py-2 text-cyan-200">
            ▣ 3D View
          </button>
          <button onClick={() => announce("2D view selected")}>2D View</button>
          <button onClick={() => announce("Properties selected")}>
            Properties
          </button>
          <button onClick={() => announce("Diffraction selected")}>
            Diffraction
          </button>
          <Settings2 size={17} />
        </nav>
      </header>
      <div className="grid h-[calc(100vh-58px)] grid-cols-[240px_1fr_315px] grid-rows-[1fr_250px] gap-2 p-2">
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Structure Library</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search structures..."
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          />
          {visibleStructures.map(({ item: [a, b, c], index: i }) => (
            <button
              key={a}
              onClick={() => {
                setS(i);
                announce(a + " loaded");
              }}
              className={`mt-2 w-full rounded border p-3 text-left ${s === i ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <div className="grid grid-cols-[45px_1fr] items-center gap-2">
                <span className="grid h-10 place-items-center rounded bg-emerald-400/40">
                  ✣
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
              </div>
            </button>
          ))}
          <div className="mt-5 space-y-2 text-xs">
            {[
              "Home",
              "Structures",
              "Visualize",
              "Simulate",
              "Properties",
              "Diffraction",
              "Defects",
              "Tools",
              "Learn",
            ].map((x) => (
              <button
                key={x}
                onClick={() => announce(x + " opened")}
                className="block w-full py-2 text-left text-slate-300"
              >
                <Home size={14} className="mr-2 inline" />
                {x}
              </button>
            ))}
          </div>
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-br from-[#123b54] to-[#081522] p-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-black">
                {name} · {type}
              </h2>
              <p className="text-sm text-slate-400">
                {structureMeta.formula} | {unit}
              </p>
            </div>
            <div className="text-xs text-slate-300">
              🟣 {structureMeta.cation}
              <br />
              🟢 {structureMeta.anion}
            </div>
          </div>
          <div className="mt-4 grid h-[365px] place-items-center">
            <div className="relative grid h-64 w-64 place-items-center rounded border border-white/70 bg-white/5 text-3xl">
              {name}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 p-3">
                {Array.from({ length: 16 }, (_, i) => (
                  <span
                    key={i}
                    className={`grid place-items-center text-base ${i % 2 ? "text-lime-300" : "text-purple-300"}`}
                  >
                    ●
                  </span>
                ))}
              </div>
              {cell && (
                <div className="absolute inset-[-20px] border border-white/70" />
              )}
            </div>
          </div>
          <div className="flex gap-2">
            {[
              ["Show unit cell", cell, setCell],
              ["Show coordination polyhedra", poly, setPoly],
              ["Add vacancy defect", defect, setDefect],
              ["Label ions", false, () => announce("Ion labels toggled")],
            ].map(([x, v, set]) => (
              <button
                key={x}
                onClick={() => {
                  set(!v);
                  announce(x + " toggled");
                }}
                className={`rounded border px-4 py-2 text-xs ${v ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
              >
                {x}
              </button>
            ))}
          </div>
        </main>
        <aside className="row-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Structure Information</h2>
          {[
            ["Crystal system", "Cubic"],
            ["Space group", structureProps[0]],
            ["Unit cell type", unit],
            ["Coordination", structureProps[1]],
            ["Formula units (Z)", structureProps[2]],
            ["Lattice parameter a", structureProps[3]],
            ["Chemical formula", name],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span className="text-slate-400">{a}</span>
              <b>{b}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Derived Properties</h2>
          {[
            ["Packing fraction", structureProps[4]],
            ["Theoretical density", structureProps[5]],
            ["Molar mass", structureMeta.molar],
            ["Volume per formula unit", "95.1 Å³"],
          ].map(([a, b]) => (
            <div key={a} className="flex justify-between py-2 text-xs">
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
        </aside>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">Miller Plane (111)</h3>
          <div className="mt-3 grid place-items-center text-6xl text-emerald-300">
            ▧
          </div>
          <p className="text-center text-xs text-slate-400">
            Interplanar spacing d₁₁₁ {structureMeta.d111}
          </p>
        </section>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">X-ray Diffraction (Simulated)</h3>
          <div className="mt-5 flex h-28 items-end justify-around border-b border-l border-cyan-300/40">
            {["(111)", "(200)", "(220)", "(311)", "(222)"].map((x, i) => (
              <div key={x} className="text-center text-[10px] text-cyan-200">
                <div
                  className="mx-auto w-1 bg-white"
                  style={{ height: [90, 55, 38, 50, 28][i] }}
                />
                {x}
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
