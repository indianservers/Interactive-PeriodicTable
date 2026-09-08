import { useEffect, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  FlaskConical,
  Play,
  RotateCcw,
  Search,
  Star,
  Zap,
} from "lucide-react";

const reactions = [
  {
    name: "Diels–Alder",
    type: "[4+2] cycloaddition",
    formula: "1,3-butadiene + ethene → cyclohexene",
    mechanism: "Concerted, pericyclic",
    cue: "Diene + dienophile → 6π in a ring",
    conditions: "Heat, inert solvent; often endo favored",
    interaction: ["Diene", "HOMO (π)", "Dienophile", "LUMO (π*)", "⬡"],
    stereochemistry:
      "Concerted suprafacial addition; endo selectivity is often observed.",
  },
  {
    name: "Aldol Condensation",
    type: "C–C formation",
    formula: "2 R–CHO → β-hydroxy carbonyl → α,β-unsaturated carbonyl",
    mechanism: "Enolate addition then dehydration",
    cue: "Build a carbon–carbon bond with an enolate",
    conditions: "Dilute base, warm after addition",
    interaction: ["Enolate", "HOMO (π)", "Carbonyl", "LUMO (π*)", "β-OH"],
    stereochemistry:
      "Regioselective C–C formation followed by dehydration to an α,β-unsaturated carbonyl.",
  },
  {
    name: "Cannizzaro",
    type: "Disproportionation",
    formula: "2 R–CHO → R–COO⁻ + R–CH₂OH",
    mechanism: "Hydride transfer",
    cue: "Aldehyde without α-hydrogen",
    conditions: "Concentrated NaOH or KOH",
    interaction: [
      "Hydride donor",
      "C–H σ",
      "Aldehyde",
      "C=O π*",
      "R–COO⁻ + R–CH₂OH",
    ],
    stereochemistry:
      "Disproportionation; no pericyclic stereochemical outcome is implied.",
  },
  {
    name: "Friedel–Crafts Acylation",
    type: "Aromatic substitution",
    formula: "Ar–H + RCOCl → Ar–COR + HCl",
    mechanism: "Acylium electrophile; EAS",
    cue: "Install an acyl group without rearrangement",
    conditions: "Anhydrous AlCl₃, dry solvent",
    interaction: ["Arene", "π system", "Acylium", "LUMO", "Ar–COR"],
    stereochemistry:
      "Electrophilic aromatic substitution restores aromaticity after acyl-group installation.",
  },
  {
    name: "Grignard Addition",
    type: "C–C formation",
    formula: "RMgX + C=O → alcohol after H₃O⁺",
    mechanism: "Nucleophilic carbonyl addition",
    cue: "Carbon nucleophile adds to electrophilic carbon",
    conditions: "Dry ether; aqueous workup",
    interaction: ["Grignard carbon", "C–Mg σ", "Carbonyl", "C=O π*", "C–OH"],
    stereochemistry:
      "Addition creates an alcohol; a new stereocentre can form at a prochiral carbonyl carbon.",
  },
];
export default function NamedReactionsTargetPage() {
  const [index, setIndex] = useState(0);
  const [tab, setTab] = useState("Overview");
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(50);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const reaction = reactions[index];
  const say = (x) => setNotice(x);
  const filteredReactions = reactions.filter((item) =>
    `${item.name} ${item.type} ${item.formula} ${item.conditions}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(
      () => setPosition((value) => (value >= 100 ? 0 : value + 5)),
      180,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  return (
    <div
      className="min-h-screen bg-[#061426] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-5 border-b border-white/10 bg-[#07172a] px-6">
        <FlaskConical className="text-cyan-300" size={32} />
        <div>
          <h1 className="text-2xl font-black">Named Reactions Atlas</h1>
          <p className="text-sm text-slate-400">
            Explore. Visualize. Remember. Apply.
          </p>
        </div>
        <label className="ml-auto flex w-[420px] items-center gap-2 rounded-lg border border-white/15 bg-slate-900/70 px-3 py-2">
          <Search size={16} />
          <input
            value={query}
            className="w-full bg-transparent text-xs outline-none"
            placeholder="Search reactions, reagents, or transformations..."
            onChange={(e) => {
              setQuery(e.target.value);
              say(
                e.target.value
                  ? "Searching " + e.target.value
                  : "Search cleared",
              );
            }}
          />
        </label>
        <button
          onClick={() => say("Mechanism library opened")}
          className="text-xs"
        >
          Mechanism Library
        </button>
        <button onClick={() => say("My library opened")} className="text-xs">
          My Library
        </button>
      </header>
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-[235px_1fr_345px] gap-2 p-2">
        <aside className="rounded-xl border border-white/10 bg-[#0a1c31] p-3">
          <nav>
            {[
              "Home",
              "Reactions",
              "Pathways",
              "Learning",
              "Quizzes",
              "Favourites",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => say(x + " selected")}
                className={
                  "flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm " +
                  (i === 1 ? "bg-blue-500/20 text-sky-300" : "text-slate-300")
                }
              >
                {i === 1 ? <FlaskConical size={17} /> : <BookOpen size={17} />}{" "}
                {x}
              </button>
            ))}
          </nav>
          <hr className="my-4 border-white/10" />
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Popular reactions
          </p>
          {filteredReactions.length ? (
            filteredReactions.map((r) => {
              const i = reactions.indexOf(r);
              return (
                <button
                  key={r.name}
                  onClick={() => {
                    setIndex(i);
                    setTab("Overview");
                  }}
                  className={
                    "mb-1 w-full rounded-lg px-3 py-2 text-left text-xs " +
                    (index === i
                      ? "bg-sky-500/20 text-sky-200"
                      : "text-slate-300")
                  }
                >
                  {r.name}
                  <small className="block text-slate-500">{r.type}</small>
                </button>
              );
            })
          ) : (
            <p className="px-2 py-3 text-xs text-slate-500">
              No matching reactions.
            </p>
          )}
        </aside>
        <main className="min-w-0 space-y-2">
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-black">
                  {reaction.name} Reaction
                </h2>
                <p className="text-lg text-cyan-300">{reaction.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPlaying(!playing);
                    say(
                      playing
                        ? "Animation paused"
                        : "Orbital overlap animation playing",
                    );
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold"
                >
                  <Play size={15} className="mr-2 inline" />
                  {playing ? "Pause" : "Animate orbital overlap"}
                </button>
                <button
                  onClick={() => say("Variants compared")}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm"
                >
                  ⇄ Compare variants
                </button>
                <button
                  onClick={() => say("Reaction saved")}
                  className="rounded-lg border border-white/15 p-2"
                >
                  <Star size={17} />
                </button>
              </div>
            </div>
            <div className="mt-3 flex border-b border-white/10">
              {[
                "Overview",
                "Mechanism",
                "3D Animation",
                "Examples",
                "Scope",
                "Variants",
                "Quiz",
              ].map((x) => (
                <button
                  key={x}
                  onClick={() => setTab(x)}
                  className={
                    "px-4 py-2 text-sm " +
                    (tab === x
                      ? "border-b-2 border-cyan-300 text-cyan-200"
                      : "text-slate-400")
                  }
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs text-slate-400">
                Frontier orbital interaction
              </p>
              <div className="flex items-center justify-around py-8 text-center">
                <div>
                  <div className="text-6xl text-indigo-300">◉　◉</div>
                  <b>{reaction.interaction[0]}</b>
                  <small className="block text-indigo-300">
                    {reaction.interaction[1]}
                  </small>
                </div>
                <span className="text-4xl">＋</span>
                <div>
                  <div className="text-6xl text-orange-300">◉　◉</div>
                  <b>{reaction.interaction[2]}</b>
                  <small className="block text-orange-300">
                    {reaction.interaction[3]}
                  </small>
                </div>
                <span className="text-4xl">→</span>
                <div className="rounded-full border-4 border-emerald-300/70 p-8 text-3xl text-emerald-300">
                  {reaction.interaction[4]}
                </div>
                <b>Product</b>
              </div>
              <p className="text-center font-semibold text-cyan-100">
                {reaction.formula}
              </p>
              <p className="mt-2 text-center text-sm text-slate-400">
                {tab === "Mechanism"
                  ? reaction.mechanism
                  : tab === "Quiz"
                    ? "Which orbital interaction controls the reaction? " +
                      reaction.cue
                    : reaction.cue}
              </p>
            </div>
            <div className="mt-3 flex items-center gap-3 rounded-lg border border-white/10 p-3">
              <button
                onClick={() => setPlaying(!playing)}
                className="grid h-9 w-9 place-items-center rounded-full bg-blue-500"
              >
                <Play size={15} />
              </button>
              <input
                className="flex-1"
                type="range"
                min="0"
                max="100"
                value={position}
                onChange={(e) => setPosition(+e.target.value)}
              />
              <span className="text-xs">t = {(position / 100).toFixed(2)}</span>
              <button
                onClick={() => {
                  setPosition(50);
                  setPlaying(false);
                }}
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </section>
          <section className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <h3 className="font-black">Representative example</h3>
              <p className="mt-4 text-sm text-slate-300">{reaction.formula}</p>
              <p className="mt-4 text-xs text-slate-400">
                {reaction.conditions}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <h3 className="font-black">Stereochemical outcome</h3>
              <p className="mt-4 text-sm text-slate-300">
                {reaction.stereochemistry}
              </p>
            </div>
            <div className="rounded-xl border border-amber-300/30 bg-amber-300/10 p-4">
              <h3 className="font-black text-amber-100">Memory cue</h3>
              <p className="mt-4 text-sm text-amber-100">“{reaction.cue}”</p>
            </div>
          </section>
        </main>
        <aside className="space-y-2">
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="text-lg font-black">Key Information</h2>
            {[
              ["Name", reaction.name],
              ["Type", reaction.type],
              ["Mechanism", reaction.mechanism],
              ["Electrons", "6 π electrons / concerted motion"],
              ["Stereochemistry", "Stereospecific where applicable"],
              [
                "Regiochemistry",
                "Predictable from orbital and electronic effects",
              ],
            ].map(([a, b]) => (
              <div
                key={a}
                className="flex justify-between gap-3 border-b border-white/10 py-2 text-xs"
              >
                <span className="text-slate-400">{a}</span>
                <b className="text-right">{b}</b>
              </div>
            ))}
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="text-lg font-black">Typical Conditions</h2>
            <p className="mt-3 text-sm text-slate-300">{reaction.conditions}</p>
            <div className="mt-4 flex items-center gap-2 text-emerald-200">
              <Zap size={17} />
              Reaction evidence linked to conditions.
            </div>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="text-lg font-black">Scope & Limitations</h2>
            {[
              "Electron-rich partners react more readily",
              "Stereochemistry can be predictable",
              "Steric/electronic mismatch reduces rate",
              "Heat may reverse some transformations",
            ].map((x, i) => (
              <p key={x} className="mt-2 text-xs text-slate-300">
                {i < 2 ? "✓" : "⚠"}　{x}
              </p>
            ))}
          </section>
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
