import { useState } from "react";
import {
  Beaker,
  BookOpen,
  Boxes,
  ChevronRight,
  FlaskConical,
  Home,
  Library,
  Search,
  Settings2,
} from "lucide-react";

const elements = [
  "H",
  "He",
  "Li",
  "Be",
  "B",
  "C",
  "N",
  "O",
  "F",
  "Ne",
  "Na",
  "Mg",
  "Al",
  "Si",
  "P",
  "S",
  "Cl",
  "Ar",
  "K",
  "Ca",
  "Sc",
  "Ti",
  "V",
  "Cr",
  "Mn",
  "Fe",
  "Co",
  "Ni",
  "Cu",
  "Zn",
  "Ag",
  "Au",
  "Pt",
  "Hg",
];
const metalProfiles = {
  Cu: {
    name: "copper",
    defaultOx: "+2",
    d: 9,
    color: "Blue",
    field: "orange-red",
  },
  Co: { name: "cobalt", defaultOx: "+2", d: 7, color: "Pink", field: "green" },
  Fe: {
    name: "iron",
    defaultOx: "+3",
    d: 5,
    color: "Yellow-brown",
    field: "green-violet",
  },
  Ni: { name: "nickel", defaultOx: "+2", d: 8, color: "Green", field: "red" },
  Zn: {
    name: "zinc",
    defaultOx: "+2",
    d: 10,
    color: "Colourless",
    field: "not applicable",
  },
};
export default function InorganicTargetPage() {
  const [tab, setTab] = useState("3D Structure");
  const [el, setEl] = useState("Cu");
  const [ox, setOx] = useState("+2");
  const [env, setEnv] = useState("Aqueous solution");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const visibleElements = elements.filter((symbol) =>
    symbol.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const profile = metalProfiles[el] || {
    name: el,
    defaultOx: ox,
    d: "—",
    color: "Variable",
    field: "variable",
  };
  const fieldColor =
    el === "Cu"
      ? "#278bff"
      : el === "Co"
        ? "#c05cff"
        : el === "Fe"
          ? "#f97316"
          : "#38bdf8";
  const dElectrons = profile.d;
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071622] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[56px] items-center gap-4 border-b border-white/10 bg-[#091b2a] px-5">
        <FlaskConical size={30} className="text-cyan-300" />
        <h1 className="text-xl font-black text-cyan-200">
          Inorganic Chemistry Visual Lab
        </h1>
        <p className="text-xs text-slate-400">
          Explore structure. Understand properties. Connect the elements.
        </p>
        <label className="ml-auto flex items-center gap-2 rounded border border-white/15 px-3 py-2 text-xs text-slate-400">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-36 bg-transparent outline-none"
            placeholder="Search elements..."
          />
        </label>
        {["Notes", "Simulations", "Library"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " opened")}
            className="text-xs"
          >
            <BookOpen size={14} className="mr-1 inline" />
            {x}
          </button>
        ))}
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-56px)] grid-cols-[305px_1fr_278px] gap-2 p-2">
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1d2c] p-3">
          <nav>
            {[
              [Home, "Home"],
              [Boxes, "Periodic Table"],
              [FlaskConical, "Coordination Compounds"],
              [Boxes, "Crystal Structures"],
              [Beaker, "Qualitative Analysis"],
              [Library, "Metallurgy"],
              [Boxes, "p-Block Chemistry"],
              [Boxes, "Solid-state Defects"],
            ].map(([I, x], i) => (
              <button
                key={x}
                onClick={() => announce(x + " selected")}
                className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-3 text-left text-xs ${i === 2 ? "border border-cyan-300 bg-cyan-300/15 text-cyan-100" : "text-slate-300"}`}
              >
                <I size={17} />
                {x}
              </button>
            ))}
          </nav>
          <h3 className="mt-4 border-t border-white/10 pt-4 text-xs font-bold text-cyan-200">
            Elements
          </h3>
          <div className="mt-2 grid grid-cols-9 gap-1">
            {visibleElements.map((x) => (
              <button
                key={x}
                onClick={() => {
                  setEl(x);
                  setOx(metalProfiles[x]?.defaultOx || "+2");
                  announce(x + " selected");
                }}
                className={`h-6 rounded border text-[10px] ${x === el ? "border-cyan-300 bg-cyan-400/20 text-cyan-100" : "border-white/20"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <button
            onClick={() => announce("Element explorer opened")}
            className="mt-5 w-full rounded border border-cyan-300/50 px-3 py-3 text-xs text-cyan-200"
          >
            <Search size={15} className="mr-2 inline" />
            Element Explorer
          </button>
        </aside>
        <main className="overflow-hidden rounded-lg border border-white/10 bg-[#091b2b] p-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black text-cyan-200">
                Coordination Compounds
              </h2>
              <p className="text-lg text-cyan-300">Structure creates colour</p>
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                [{el}(H₂O)₆]<sup>2+</sup>
              </h2>
              <p className="text-xs text-slate-400">
                Hexaaqua{profile.name}({ox.replace("+", "")}) ion
              </p>
              <div className="mt-2 flex gap-1 text-[10px]">
                <span className="rounded border border-white/20 px-2 py-1">
                  d{dElectrons}
                </span>
                <span className="rounded border border-white/20 px-2 py-1">
                  Octahedral
                </span>
                <span className="rounded border border-amber-300/50 px-2 py-1 text-amber-200">
                  {dElectrons === 10 || dElectrons === "—"
                    ? "Diamagnetic"
                    : "Paramagnetic"}
                </span>
                <span className="rounded border border-cyan-300/50 px-2 py-1 text-cyan-200">
                  {profile.color} solution
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 flex border-b border-white/10">
            {[
              "3D Structure",
              "Electronic Structure",
              "Spectra & Colour",
              "Properties",
              "Compare Complexes",
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
          <div className="mt-2 grid h-[490px] grid-cols-[1.1fr_1fr] gap-2">
            <section className="relative overflow-hidden rounded border border-white/10 bg-gradient-to-br from-[#103958] to-[#071725] p-4">
              <div className="absolute left-4 top-4 rounded bg-slate-900/70 p-3 text-xs">
                ◉ Ball & Stick
                <br />◌ Space Filling
                <br />◇ Polyhedra
                <br />☑ Show Hydrogens
                <br />◉ Rotate
              </div>
              <div className="grid h-full place-items-center">
                <div
                  className="relative grid h-64 w-64 place-items-center rounded-full border-4 text-3xl font-bold"
                  style={{
                    background: fieldColor,
                    borderColor: fieldColor,
                    boxShadow: `0 0 55px ${fieldColor}`,
                  }}
                >
                  {el}
                  <span className="absolute -top-12 text-5xl text-red-400">
                    ●
                  </span>
                  <span className="absolute -bottom-12 text-5xl text-red-400">
                    ●
                  </span>
                  <span className="absolute -left-12 text-5xl text-red-400">
                    ●
                  </span>
                  <span className="absolute -right-12 text-5xl text-red-400">
                    ●
                  </span>
                </div>
              </div>
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-sm">
                [{el}(H₂O)₆]<sup>2+</sup> (aq)
                <br />
                <span className="text-xs text-slate-400">
                  Octahedral geometry (O<sub>h</sub>)
                </span>
              </p>
            </section>
            <section className="grid grid-rows-2 gap-2">
              <div className="rounded border border-white/10 bg-black/10 p-3">
                <h3 className="font-bold text-cyan-200">
                  Crystal field splitting
                </h3>
                <div className="mt-4 flex items-center justify-center gap-10 text-sm">
                  <div className="space-y-7">
                    <div>
                      e<sub>g</sub> ↑ ↑
                    </div>
                    <div>
                      t<sub>2g</sub> ↑↓ ↑↓ ↑↓
                    </div>
                  </div>
                  <div className="text-3xl text-cyan-300">
                    Δ<sub>o</sub>
                  </div>
                </div>
                <p className="mt-3 text-xs text-amber-300">
                  Absorbs {profile.field} light
                </p>
              </div>
              <div className="rounded border border-white/10 bg-black/10 p-3">
                <h3 className="font-bold">
                  Absorption spectrum (aqueous solution)
                </h3>
                <div className="mt-5 h-20 rounded bg-gradient-to-r from-red-500/30 via-orange-300 to-blue-500/50">
                  <div className="mx-auto h-full w-1 rounded bg-orange-300 shadow-[0_0_15px_#fb923c]" />
                </div>
                <p className="text-center text-xs text-slate-400">
                  400&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;600&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;800
                  nm
                </p>
              </div>
            </section>
          </div>
          <section className="mt-2 rounded border border-white/10 p-3">
            <h3 className="font-bold text-cyan-200">
              Solution environment & reactions
            </h3>
            <div className="mt-2 flex gap-2">
              {[
                "Aqueous solution",
                "Ligand substitution",
                "pH effect",
                "Redox behaviour",
              ].map((x) => (
                <button
                  key={x}
                  onClick={() => {
                    setEnv(x);
                    announce(x + " selected");
                  }}
                  className={`rounded px-3 py-2 text-xs ${env === x ? "bg-cyan-300/20 text-cyan-200" : "border border-white/10"}`}
                >
                  {x}
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm">
              [{el}(H₂O)₆]<sup>{ox}</sup> (aq) + 4Cl⁻ (aq) ⇌ [{el}Cl₄]
              <sup>2−</sup> (aq) + 6H₂O (l)
            </p>
          </section>
        </main>
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1d2c] p-3">
          <h2 className="font-bold text-cyan-200">Learning Pathway</h2>
          {[
            "Coordination compounds",
            "Crystal structures",
            "Qualitative analysis",
            "Metallurgy",
            "p-Block chemistry",
            "Solid-state defects",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => announce(x + " selected")}
              className="flex w-full items-center gap-2 border-b border-white/10 py-3 text-left text-xs"
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full ${i === 0 ? "bg-cyan-300 text-slate-900" : "border border-white/20"}`}
              >
                {i + 1}
              </span>
              {x}
            </button>
          ))}
          <h3 className="mt-5 font-bold">Oxidation state & environment</h3>
          {[
            ["Metal centre", el],
            ["Oxidation state", ox],
            ["Coordination number", "6"],
            ["Ligand", "H₂O (weak field)"],
            ["Geometry", "Octahedral (Oₕ)"],
          ].map(([a, b], i) => (
            <label key={a} className="mt-3 block text-xs">
              {a}
              <select
                value={i === 1 ? ox : b}
                onChange={(e) => {
                  if (i === 1) setOx(e.target.value);
                  announce(a + " updated");
                }}
                className="mt-1 w-full rounded border border-white/20 bg-slate-950 p-2"
              >
                <option>{b}</option>
                {i === 1 && (
                  <>
                    <option>+1</option>
                    <option>+3</option>
                  </>
                )}
              </select>
            </label>
          ))}
          <button
            onClick={() => announce("Coordination studio opened")}
            className="mt-5 w-full rounded bg-indigo-500 px-3 py-3 text-xs font-bold"
          >
            Enter coordination studio{" "}
            <ChevronRight size={14} className="inline" />
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
