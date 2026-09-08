import { useState } from "react";
import {
  Beaker,
  BookOpen,
  Check,
  ChevronRight,
  FlaskConical,
  Home,
  RotateCcw,
  Search,
  Settings,
  SlidersHorizontal,
} from "lucide-react";

const nodes = [
  ["Alkene", "C=C", "alkene"],
  ["Alkane", "C–C", "alkane"],
  ["Haloalkane", "C–X", "haloalkane"],
  ["Aldehyde", "–CHO", "aldehyde"],
  ["Ketone", "C=O", "ketone"],
  ["Aromatic", "Ar", "aromatic"],
  ["Amine", "–NH₂", "amine"],
  ["Carboxylic acid", "–COOH", "acid"],
  ["Ester", "–COOR", "ester"],
];
const route = [
  "Hydrocarbons",
  "Functional groups",
  "Alcohols",
  "Carbonyl compounds",
  "Carboxylic acids and esters",
  "Amines",
  "Aromatic chemistry",
  "Synthesis and analysis",
];
const nodeDetails = {
  Alcohols: {
    formula: "Ethanol (C₂H₆O)",
    group: "alcohol (–OH)",
    boiling: "78.4 °C",
    use: "Solvent, fuel, and oxidation/esterification model.",
  },
  Alkene: {
    formula: "Ethene (C₂H₄)",
    group: "alkene (C=C)",
    boiling: "−103.7 °C",
    use: "Polymer feedstock and addition-reaction model.",
  },
  Alkane: {
    formula: "Ethane (C₂H₆)",
    group: "alkane (C–C)",
    boiling: "−88.6 °C",
    use: "Fuel and radical-substitution reference.",
  },
  Haloalkane: {
    formula: "Bromomethane (CH₃Br)",
    group: "haloalkane (C–Br)",
    boiling: "3.6 °C",
    use: "Substrate for SN1/SN2 substitution.",
  },
  Aldehyde: {
    formula: "Ethanal (CH₃CHO)",
    group: "aldehyde (–CHO)",
    boiling: "20.2 °C",
    use: "Oxidation intermediate and carbonyl example.",
  },
  Ketone: {
    formula: "Propanone (CH₃COCH₃)",
    group: "ketone (C=O)",
    boiling: "56.1 °C",
    use: "Solvent and nucleophilic-addition example.",
  },
  Aromatic: {
    formula: "Benzene (C₆H₆)",
    group: "aromatic ring",
    boiling: "80.1 °C",
    use: "Electrophilic aromatic-substitution model.",
  },
  Amine: {
    formula: "Methylamine (CH₃NH₂)",
    group: "amine (–NH₂)",
    boiling: "−6.3 °C",
    use: "Basic nucleophile and salt formation.",
  },
  "Carboxylic acid": {
    formula: "Acetic acid (CH₃COOH)",
    group: "carboxylic acid (–COOH)",
    boiling: "118.1 °C",
    use: "Acid-base and esterification model.",
  },
  Ester: {
    formula: "Ethyl acetate (CH₃COOCH₂CH₃)",
    group: "ester (–COOR)",
    boiling: "77.1 °C",
    use: "Fragrance, solvent, and hydrolysis example.",
  },
};

export default function OrganicVisualsTargetPage({ onNavigate }) {
  const [selected, setSelected] = useState("Alcohols");
  const [syllabus, setSyllabus] = useState("A-level (AQA)");
  const [checked, setChecked] = useState(["Alcohols"]);
  const [reactionFilters, setReactionFilters] = useState([]);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Properties");
  const [step, setStep] = useState(2);
  const [toggles, setToggles] = useState({
    arrows: true,
    intermediates: true,
    conditions: true,
    animation: true,
  });
  const [notice, setNotice] = useState("");
  const announce = (message) => setNotice(message);
  const detail = nodeDetails[selected] || nodeDetails.Alcohols;
  const filteredNodes = nodes.filter(
    ([name, formula]) =>
      !search.trim() ||
      `${name} ${formula}`.toLowerCase().includes(search.trim().toLowerCase()),
  );
  const toggle = (key) =>
    setToggles((state) => ({ ...state, [key]: !state[key] }));
  return (
    <div
      className="h-[calc(100vh-70px)] overflow-hidden bg-[#061426] text-slate-100"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-5 border-b border-white/10 bg-[#07172a] px-6">
        <FlaskConical className="text-cyan-300" size={32} />
        <div className="min-w-[350px]">
          <h1 className="text-[24px] font-black">
            Organic Chemistry Visual Lab
          </h1>
          <p className="text-sm text-slate-400">
            Navigate reactions by structure
          </p>
        </div>
        <label className="ml-auto flex w-[430px] items-center gap-2 rounded-lg border border-sky-300/20 bg-slate-900/80 px-3 py-2 text-slate-400">
          <Search size={16} />
          <input
            value={search}
            className="w-full bg-transparent text-xs outline-none"
            placeholder="Search molecules, reactions, reagents..."
            onChange={(e) => {
              setSearch(e.target.value);
              announce(
                e.target.value
                  ? "Searching " + e.target.value
                  : "Search cleared",
              );
            }}
          />
        </label>
        {["Learn", "Practice", "Resources", "My Lab"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " selected")}
            className="px-2 text-xs font-bold text-slate-300"
          >
            {x}
          </button>
        ))}
        <span className="rounded-full bg-indigo-400 px-3 py-2 text-xs font-black">
          JS
        </span>
      </header>
      <div className="grid min-h-[calc(100vh-64px)] grid-cols-[78px_240px_1fr_340px] grid-rows-[1fr_180px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col items-center gap-4 border-r border-white/10 bg-[#081a30] py-5">
          {[
            [Home, "Explore"],
            [BookOpen, "Syllabus"],
            [Beaker, "Reactions"],
            [Settings, "Mechanisms"],
          ].map(([I, x], i) => (
            <button
              key={x}
              onClick={() => announce(x + " section selected")}
              className={
                "flex w-full flex-col items-center gap-1 py-3 text-[10px] " +
                (i === 0 ? "bg-sky-500/20 text-sky-300" : "text-slate-300")
              }
            >
              <I size={21} />
              {x}
            </button>
          ))}
        </aside>
        <aside className="row-span-2 overflow-y-auto rounded-xl border border-white/10 bg-[#0a1c31] p-3">
          <h2 className="text-lg font-black">Filter by syllabus</h2>
          <select
            value={syllabus}
            onChange={(e) => {
              setSyllabus(e.target.value);
              announce(e.target.value + " syllabus selected");
            }}
            className="mt-3 w-full rounded-lg border border-white/20 bg-slate-950 px-2 py-2 text-sm"
          >
            <option>A-level (AQA)</option>
            <option>IB Chemistry</option>
            <option>CBSE Class 12</option>
          </select>
          <div className="mt-3 space-y-2">
            {[
              "Alkanes",
              "Alkenes",
              "Haloalkanes",
              "Alcohols",
              "Carbonyl compounds",
              "Carboxylic acids",
              "Esters",
              "Amines",
              "Aromatic compounds",
            ].map((x) => (
              <label key={x} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked.includes(x)}
                  onChange={() =>
                    setChecked((a) =>
                      a.includes(x) ? a.filter((v) => v !== x) : [...a, x],
                    )
                  }
                />
                {x}
              </label>
            ))}
          </div>
          <hr className="my-4 border-white/10" />
          <h3 className="font-bold">Filter by reaction type</h3>
          {[
            "Oxidation",
            "Reduction",
            "Substitution",
            "Addition",
            "Elimination",
            "Esterification",
            "Hydrolysis",
          ].map((x) => (
            <button
              key={x}
              onClick={() => {
                setReactionFilters((items) =>
                  items.includes(x)
                    ? items.filter((item) => item !== x)
                    : [...items, x],
                );
                announce(
                  x +
                    " reaction filter " +
                    (reactionFilters.includes(x) ? "cleared" : "selected"),
                );
              }}
              className={
                "mt-2 flex w-full items-center gap-2 text-left text-xs " +
                (reactionFilters.includes(x)
                  ? "text-cyan-200"
                  : "text-slate-300")
              }
            >
              <span
                className={
                  "h-3 w-3 rounded border " +
                  (reactionFilters.includes(x)
                    ? "border-cyan-300 bg-cyan-300"
                    : "border-cyan-300/50")
                }
              />
              {x}
            </button>
          ))}
          <button
            onClick={() => {
              setChecked(["Alcohols"]);
              setReactionFilters([]);
              setSearch("");
              announce("Filters reset");
            }}
            className="mt-5 flex items-center gap-2 rounded border border-white/20 px-3 py-2 text-xs"
          >
            <RotateCcw size={13} /> Reset filters
          </button>
        </aside>
        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0a1c31] via-[#091a2d] to-[#102b43] p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black">Reaction Map</h2>
              <p className="text-sm text-slate-400">
                Functional groups and their connections{" "}
                {reactionFilters.length
                  ? `· ${reactionFilters.join(", ")}`
                  : ""}
              </p>
            </div>
            <SlidersHorizontal size={18} className="text-slate-400" />
          </div>
          <svg
            className="absolute inset-5 h-[calc(100%-28px)] w-[calc(100%-40px)]"
            viewBox="0 0 700 570"
            aria-label="Organic reaction map"
          >
            {[
              [160, 170, 350, 110, "#62f4b1", "Reduction"],
              [350, 110, 540, 175, "#ffd166", "Substitution"],
              [350, 110, 350, 300, "#61a8ff", "Oxidation"],
              [350, 300, 530, 360, "#ff7aa8", "Esterification"],
              [350, 300, 190, 410, "#c17cff", "Elimination"],
              [350, 300, 350, 490, "#64e8f2", "Reduction"],
            ]
              .filter(
                ([, , , , , label]) =>
                  !reactionFilters.length || reactionFilters.includes(label),
              )
              .map(([x1, y1, x2, y2, c, label], i) => (
                <g key={i}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={c}
                    strokeWidth="3"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2 - 7}
                    fill={c}
                    fontSize="12"
                  >
                    {label}
                  </text>
                </g>
              ))}
          </svg>
          <div className="relative z-10 mt-8 grid h-[500px] grid-cols-3 grid-rows-3 items-center justify-items-center">
            {filteredNodes.map(([name, formula, id], i) => (
              <button
                key={id}
                onClick={() => {
                  setSelected(name);
                  announce(name + " selected");
                }}
                className={
                  "flex h-28 w-28 flex-col items-center justify-center rounded-full border-2 bg-slate-950/70 shadow-[0_0_35px_rgba(59,130,246,.28)] " +
                  (selected === name
                    ? "border-cyan-300 ring-4 ring-cyan-300/20"
                    : "border-sky-300/40")
                }
                style={{ gridColumn: (i % 3) + 1, gridRow: (i % 3) + 1 }}
              >
                <span className="text-lg font-black">{formula}</span>
                <span className="mt-1 text-xs">{name}</span>
              </button>
            ))}
          </div>
        </section>
        <aside className="overflow-y-auto rounded-xl border border-white/10 bg-[#0a1c31] p-4">
          <h2 className="text-2xl font-black">{selected}</h2>
          <p className="text-sm text-cyan-300">{detail.formula}</p>
          <div className="mt-4 rounded-lg border border-white/10 bg-black/20 p-3 text-center text-5xl">
            🧪
          </div>
          <div className="mt-3 flex border-b border-white/10">
            {["Properties", "Spectra", "Uses"].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={
                  "flex-1 py-2 text-xs " +
                  (tab === x
                    ? "border-b-2 border-cyan-300 text-cyan-200"
                    : "text-slate-400")
                }
              >
                {x}
              </button>
            ))}
          </div>
          {tab === "Properties" ? (
            <div className="mt-3 space-y-2 text-xs">
              {[
                ["IUPAC name", selected.toLowerCase()],
                ["Functional group", detail.group],
                ["Boiling point", detail.boiling],
                ["Learning note", detail.use],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="flex justify-between gap-3 border-b border-white/10 py-2"
                >
                  <span className="text-slate-400">{a}</span>
                  <b className="text-right">{b}</b>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-300">
              {tab === "Spectra"
                ? `${detail.group} has a diagnostic IR and NMR signature.`
                : detail.use}
            </p>
          )}
          <h3 className="mt-5 font-bold">Possible transformations</h3>
          {[
            "Oxidation to aldehyde",
            "Further oxidation to carboxylic acid",
            "Dehydration to alkene",
            "Substitution to haloalkane",
            "Conversion to ester",
          ].map((x) => (
            <button
              key={x}
              onClick={() => announce(x + " selected")}
              className="mt-2 flex w-full items-center gap-2 rounded border border-white/10 px-2 py-2 text-left text-xs"
            >
              <span className="rounded-full bg-rose-400 px-1">↗</span>
              {x}
            </button>
          ))}
        </aside>
        <section className="col-span-2 rounded-xl border border-white/10 bg-[#0a1c31] p-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black">Mechanism preview</h3>
              <p className="text-xs text-slate-400">
                Oxidation of a primary alcohol to an aldehyde (acidified
                dichromate)
              </p>
            </div>
            <button
              onClick={() => onNavigate?.("organic-mechanisms")}
              className="rounded-lg bg-blue-500 px-4 py-2 text-xs font-bold"
            >
              Open mechanism <ChevronRight size={14} className="inline" />
            </button>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              "Nucleophilic attack on Cr(VI)",
              "Proton transfer",
              "Elimination to give aldehyde",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setStep(i);
                  announce("Mechanism step " + (i + 1) + " selected");
                }}
                className={
                  "rounded-lg border p-3 text-left text-xs " +
                  (step === i
                    ? "border-cyan-300 bg-cyan-300/10"
                    : "border-white/10")
                }
              >
                <b>{i + 1}</b>
                <p className="mt-6">{x}</p>
              </button>
            ))}
          </div>
        </section>
        <aside className="row-span-1 rounded-xl border border-white/10 bg-[#0a1c31] p-4">
          <h3 className="font-black">Your learning route</h3>
          {route.map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setStep(i);
                announce(x + " route step selected");
              }}
              className="flex w-full items-center gap-2 border-b border-white/5 py-2 text-left text-xs"
            >
              <span
                className={
                  "h-5 w-5 rounded-full text-center " +
                  (i < 2
                    ? "bg-emerald-400 text-slate-900"
                    : "border border-slate-500")
                }
              >
                {i < 2 ? <Check size={14} className="m-auto" /> : i + 1}
              </span>
              {x}
            </button>
          ))}
        </aside>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/40 bg-slate-950/95 px-4 py-2 text-xs text-cyan-100"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
