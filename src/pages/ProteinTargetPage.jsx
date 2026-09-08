import { useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  CircleDot,
  Dna,
  Home,
  Play,
  Settings2,
} from "lucide-react";
export default function ProteinTargetPage() {
  const [view, setView] = useState("Cartoon");
  const [animate, setAnimate] = useState(false);
  const [time, setTime] = useState(200);
  const [bonds, setBonds] = useState({
    h: true,
    ionic: true,
    disulfide: false,
    hydrophobic: true,
  });
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [mutationFrom, setMutationFrom] = useState("Leu");
  const [mutationSite, setMutationSite] = useState("L29");
  const [mutationTo, setMutationTo] = useState("Ala");
  const mutationImpact =
    mutationFrom === mutationTo
      ? "neutral"
      : mutationTo === "Ala"
        ? "destabilizing"
        : "context-dependent";
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!animate) return undefined;
    const timer = window.setInterval(
      () => setTime((value) => (value >= 200 ? 0 : value + 4)),
      140,
    );
    return () => window.clearInterval(timer);
  }, [animate]);
  const foldingStage =
    time < 50
      ? "Unfolded chain"
      : time < 110
        ? "Secondary structure"
        : time < 170
          ? "Tertiary structure"
          : "Native state";
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[62px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Dna size={36} className="text-cyan-300" />
        <h1 className="text-2xl font-black">Protein Folding Studio</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto w-[500px] rounded border border-white/15 bg-slate-900/60 p-2 text-xs"
          placeholder="Search proteins, PDB IDs, or mutations..."
        />
        {["Gallery", "Tools", "Learn", "Help"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " opened")}
            className="text-xs"
          >
            {x}
          </button>
        ))}
        <Settings2 size={18} />
      </header>
      <div className="grid h-[calc(100vh-62px)] grid-cols-[310px_1fr_385px] grid-rows-[1fr_225px] gap-2 p-2">
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="text-2xl font-bold">
            Myoglobin <span className="text-slate-400">· 153 residues</span>
          </h2>
          <p className="text-sm text-slate-400">
            Oxygen storage protein from sperm whale
          </p>
          <div className="mt-3 rounded border border-white/10 p-3">
            <h3 className="font-bold">
              Primary Structure{" "}
              <span className="float-right text-xs text-slate-400">
                153 residues
              </span>
            </h3>
            <pre className="mt-3 text-xs leading-6 text-cyan-200">
              1　MGLSDGEWQLVLHVWAKVEAD
              <br />
              21 VAHGQEVLIRLFTGHPETLE
              <br />
              41 KFDRFKHLKTEAEMKASEDLK
              <br />
              61 HGTVVLTALGA ILKKKGHHEA
              <br />
              81 ELKPLAQS HAT K H K I P I K
            </pre>
          </div>
          <div className="mt-4 space-y-2 text-xs">
            <p>🟡 Hydrophobic　A V I L M F W Y</p>
            <p>🔵 Polar　　　 S T N Q</p>
            <p>🔴 Acidic　　　D E</p>
            <p>🔷 Basic　　　 K R H</p>
          </div>
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-br from-[#102d48] to-[#081522] p-3">
          <div className="flex justify-end gap-2">
            {["Surface", "Cartoon", "Sticks"].map((x) => (
              <button
                key={x}
                onClick={() => setView(x)}
                className={`rounded border px-4 py-2 text-xs ${view === x ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
              >
                {x}
              </button>
            ))}
            <button
              onClick={() => announce("Labels toggled")}
              className="rounded border border-white/20 px-4 py-2 text-xs"
            >
              Labels
            </button>
          </div>
          <div className="grid h-[470px] place-items-center">
            <div className="relative text-center">
              <div
                className={`text-[210px] leading-none text-gradient ${animate ? "animate-pulse" : ""}`}
                style={{ color: view === "Surface" ? "#335070" : "#2dd4bf" }}
              >
                ✤
              </div>
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 text-sm text-white">
                Heme group
                <br />
                (Fe²⁺)
              </div>
              <p className="mt-3 text-sm">Myoglobin · α-helical monomer</p>
            </div>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Molecular Interactions</h2>
          {[
            ["h", "Hydrogen bonds", "24"],
            ["ionic", "Ionic interactions", "6"],
            ["disulfide", "Disulfide bonds", "0"],
            ["hydrophobic", "Hydrophobic contacts", "38"],
          ].map(([k, x, n]) => (
            <button
              key={k}
              onClick={() => setBonds((b) => ({ ...b, [k]: !b[k] }))}
              className="mt-4 flex w-full items-center justify-between text-xs"
            >
              <span
                className={`h-5 w-9 rounded-full p-0.5 ${bonds[k] ? "bg-cyan-400" : "bg-slate-600"}`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white transition ${bonds[k] ? "translate-x-4" : ""}`}
                />
              </span>
              {x}
              <b>{bonds[k] ? n : "0"}</b>
            </button>
          ))}
          <h2 className="mt-5 font-bold">Interaction Details</h2>
          <div className="mt-2 rounded border border-white/10 p-3 text-xs leading-7">
            1　🔵 H-bond　SER92 – HIS64　2.8 Å<br />
            2　🔵 H-bond　THR67 – ASP60　2.9 Å<br />
            3　🟣 Ionic　LYS45 – ASP102　3.1 Å<br />
            4　🟡 Hydrophobic　LEU29 – VAL68　3.6 Å
          </div>
          <h2 className="mt-5 font-bold">Energy Landscape</h2>
          <div className="mt-2 h-24 rounded border border-cyan-300/30 bg-gradient-to-b from-fuchsia-500/30 via-cyan-300/20 to-emerald-500/30 text-center pt-10">
            ΔGfold = {mutationImpact === "destabilizing" ? "−38.4" : "−42.1"}{" "}
            kcal/mol
          </div>
          <h2 className="mt-5 font-bold">Mutation Analysis</h2>
          <div className="mt-2 grid grid-cols-3 gap-1">
            <select
              value={mutationFrom}
              onChange={(e) => setMutationFrom(e.target.value)}
              className="rounded bg-slate-950 p-2 text-xs"
            >
              <option>Leu</option>
            </select>
            <select
              value={mutationSite}
              onChange={(e) => setMutationSite(e.target.value)}
              className="rounded bg-slate-950 p-2 text-xs"
            >
              <option>L29</option>
            </select>
            <select
              value={mutationTo}
              onChange={(e) => setMutationTo(e.target.value)}
              className="rounded bg-slate-950 p-2 text-xs"
            >
              <option>Ala</option>
            </select>
          </div>
          <button
            onClick={() =>
              announce(
                `${mutationSite} ${mutationFrom}→${mutationTo}: ${mutationImpact}`,
              )
            }
            className="mt-3 w-full rounded bg-indigo-500 px-3 py-2 text-xs"
          >
            Predict
          </button>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">
              Folding Timeline · {foldingStage}
              {query ? ` · Searching “${query}”` : ""}
            </h3>
            <button
              onClick={() => setAnimate((v) => !v)}
              className="rounded bg-blue-500 px-4 py-2 text-xs"
            >
              <Play size={14} className="mr-1 inline" />
              {animate ? "Stop folding" : "Animate folding"}
            </button>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={time}
            onChange={(e) => setTime(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <div className="mt-3 flex justify-between text-center text-xs text-slate-300">
            <span>
              Unfolded chain
              <br />
              (t = 0 ns)
            </span>
            <span>
              Secondary structure
              <br />
              (α-helices form)
            </span>
            <span>
              Tertiary structure
              <br />
              (packing)
            </span>
            <span>
              Native state
              <br />
              (Myoglobin)
            </span>
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
