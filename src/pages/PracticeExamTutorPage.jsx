import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Eraser,
  FlaskConical,
  Home,
  Lightbulb,
  Pencil,
  Play,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  Users,
} from "lucide-react";
import {
  getPracticeSets,
  practiceTracks,
  practiceQuestionSets,
} from "../data/practiceExamTutor.js";

const periodic = [
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
  "Ga",
  "Ge",
  "As",
  "Se",
  "Br",
  "Kr",
  "Rb",
  "Sr",
  "Y",
  "Zr",
  "Nb",
  "Mo",
  "Tc",
  "Ru",
  "Rh",
  "Pd",
  "Ag",
  "Cd",
  "In",
  "Sn",
  "Sb",
  "Te",
  "I",
  "Xe",
];
const tools = [
  [Pencil, "select", "Select"],
  [Pencil, "bond", "Bond"],
  [Sparkles, "lone", "Lone Pair"],
  [Eraser, "erase", "Erase"],
  [ChevronRight, "resonance", "Resonance Arrow"],
];
const periodicGroups = {
  All: periodic,
  Metals: [
    "Li", "Be", "Na", "Mg", "Al", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Cs", "Ba",
  ],
  Nonmetals: [
    "H", "C", "N", "O", "F", "P", "S", "Cl", "Se", "Br", "I",
  ],
  "Noble Gases": ["He", "Ne", "Ar", "Kr", "Xe"],
};

export const PracticeExamTutorPage = ({ onNavigate }) => {
  const [track, setTrack] = useState("senior");
  const [tool, setTool] = useState("select");
  const [atom, setAtom] = useState(0);
  const [hint, setHint] = useState(false);
  const [checked, setChecked] = useState(false);
  const [scratch, setScratch] = useState(
    "N : 5\nO : 6 × 3 = 18\nCharge : + 1\n\n24 valence electrons",
  );
  const [question, setQuestion] = useState(0);
  const [periodicFilter, setPeriodicFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const sets = useMemo(() => getPracticeSets(track), [track]);
  const set = sets[0] || practiceQuestionSets[0];
  const say = (x) => setNotice(x);
  return (
    <div
      className="min-h-screen bg-[#061426] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[76px] items-center gap-6 border-b border-white/10 bg-[#07172b] px-7">
        <FlaskConical className="text-sky-400" size={38} />
        <div className="min-w-[330px]">
          <h1 className="text-[25px] font-black">Adaptive Chemistry Tutor</h1>
          <p className="text-sm text-slate-400">
            Think deeper. Build understanding. You’ve got this.
          </p>
        </div>
        <label className="ml-auto flex w-[385px] items-center gap-3 rounded-xl border border-sky-300/15 bg-slate-900/70 px-4 py-2 text-slate-400">
          <Search size={17} />
          <input
            className="w-full bg-transparent text-sm outline-none"
            placeholder="Search concepts, elements, or questions..."
            onChange={(e) =>
              say(e.target.value ? "Searching for " + e.target.value : "")
            }
          />
        </label>
        <button
          onClick={() => say("Theme settings opened")}
          className="rounded-full p-2"
        >
          <Settings size={21} />
        </button>
        <span className="text-2xl">🔥</span>
        <div className="border-l border-white/10 pl-4">
          <b>Learning Streak</b>
          <small className="block text-slate-400">7 days</small>
        </div>
        <div className="rounded-full bg-sky-500 px-3 py-2 font-black">JS</div>
      </header>
      <div className="grid min-h-[calc(100vh-76px)] grid-cols-[168px_1fr]">
        <aside className="border-r border-white/10 bg-[#081a30] p-3">
          {[
            [Home, "Learn"],
            [BookOpen, "Practice"],
            [Target, "Mastery Path"],
            [FlaskConical, "Periodic Table"],
            [Users, "Resources"],
            [Settings, "Settings"],
          ].map(([Icon, label], i) => (
            <button
              key={label}
              onClick={() => say(label + " selected")}
              className={
                "mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm " +
                (i === 0 ? "bg-blue-500/25 text-sky-300" : "text-slate-300")
              }
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
          <div className="mt-5 border-t border-white/10 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Practice track
            </p>
            {practiceTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTrack(t.id);
                  say(t.label + " track selected");
                }}
                className={
                  "mb-1 w-full rounded px-2 py-1 text-left text-xs " +
                  (track === t.id
                    ? "bg-sky-500/20 text-sky-200"
                    : "text-slate-400")
                }
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mt-8 px-3 text-xs italic text-slate-400">
            “A calmer mind solves more problems.”
            <span className="mt-3 block not-italic text-sky-500">
              CHEMISTRY
              <br />
              WITHOUT LIMITS
            </span>
          </div>
        </aside>
        <main className="grid h-[calc(100vh-76px)] min-w-0 grid-cols-[minmax(580px,1fr)_330px] grid-rows-[minmax(0,1fr)_205px] gap-3 overflow-hidden p-3">
          <section className="min-h-0 min-w-0 overflow-hidden">
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black">Build the nitrate ion</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Construct a Lewis structure for NO₃⁻. Use the electron
                    pairs, bonds, and resonance arrows.
                  </p>
                </div>
                <div className="flex gap-2">
                  {["Lewis Structures", "Formal Charge", "Resonance"].map(
                    (x) => (
                      <button
                        key={x}
                        onClick={() => say(x + " mode selected")}
                        className="rounded-lg border border-sky-400/50 px-3 py-2 text-xs font-bold text-sky-200"
                      >
                        {x}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="mt-4 grid grid-cols-[84px_1fr_330px] gap-3">
                <div className="space-y-2">
                  {tools.map(([Icon, id, label]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setTool(id);
                        say(label + " tool active");
                      }}
                      className={
                        "flex h-[74px] w-full flex-col items-center justify-center gap-1 rounded-lg border text-[11px] " +
                        (tool === id
                          ? "border-sky-400 bg-sky-500/15 text-sky-200"
                          : "border-white/10 bg-slate-900/60 text-slate-300")
                      }
                    >
                      <Icon size={22} />
                      {label}
                    </button>
                  ))}
                </div>
                <div className="min-w-0">
                  <div
                    className="relative min-h-[440px] rounded-lg border border-white/10 bg-[#061426]"
                    style={{
                      backgroundImage:
                        "radial-gradient(#25405a 1px,transparent 1px)",
                      backgroundSize: "14px 14px",
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative h-[260px] w-[380px]">
                        <b className="absolute left-1/2 top-5 -translate-x-1/2 text-5xl">
                          O
                        </b>
                        <b className="absolute left-1/2 top-[90px] -translate-x-1/2 text-5xl">
                          N
                        </b>
                        <b className="absolute bottom-3 left-10 text-5xl">O</b>
                        <b className="absolute bottom-3 right-10 text-5xl">O</b>
                        <i className="absolute left-1/2 top-[72px] h-16 -translate-x-1/2 border-l-4 border-slate-200" />
                        <i className="absolute left-[128px] top-[135px] h-20 -rotate-[55deg] border-l-4 border-slate-200" />
                        <i className="absolute right-[128px] top-[135px] h-20 rotate-[55deg] border-l-4 border-slate-200" />
                        <b className="absolute -right-8 top-0 text-2xl">−</b>
                        {[0, 1, 2].map((i) => (
                          <button
                            key={i}
                            onClick={() => setAtom(i)}
                            aria-label={"oxygen atom " + (i + 1)}
                            className={
                              "absolute h-3 w-3 rounded-full bg-sky-300 " +
                              (atom === i ? "ring-4 ring-sky-400/40" : "")
                            }
                            style={
                              i === 0
                                ? { left: "49%", top: "20%" }
                                : i === 1
                                  ? { left: "38%", top: "77%" }
                                  : { left: "61%", top: "77%" }
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-0 right-0 border-t border-white/10 pt-2 text-center text-xs text-slate-400">
                      Click atoms to select · {tool} tool active · formal charge
                      −1
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-slate-950/50 p-2">
                    {[0, 1, 2].map((index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setAtom(index);
                          say(`Resonance structure ${index + 1} selected`);
                        }}
                        className={`rounded border p-2 text-[10px] ${atom === index ? "border-sky-400 bg-sky-500/15" : "border-white/10"}`}
                      >
                        <span className="block text-lg text-slate-200">
                          [O=N–O]⁻
                        </span>
                        <span className="text-slate-400">
                          Resonance {index + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900/70 p-4">
                  <h3 className="text-lg font-black">🦉 Your Tutor</h3>
                  <div className="mt-4 rounded-xl border border-sky-300/20 bg-sky-500/10 p-4 text-sm">
                    How many valence electrons do you have in total?
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-300">
                    Think about the atoms in NO₃⁻ and the charge. What
                    contributes to the total?
                  </p>
                  <div className="mt-5 space-y-2">
                    {[
                      "Guiding questions",
                      "Not sure? Try a smaller step",
                      "I’m stuck",
                    ].map((x) => (
                      <button
                        key={x}
                        onClick={() => {
                          setHint(true);
                          say("Tutor guidance opened");
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-white/10 px-3 py-3 text-left text-sm"
                      >
                        {x}
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {hint && (
                <div className="mt-2 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                  Hint: sum N (5) + three oxygen atoms (18), then account for
                  the −1 charge.
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-black">Periodic Table</h3>
                  <div className="flex gap-1">
                    {Object.keys(periodicGroups).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => {
                          setPeriodicFilter(filter);
                          say(`${filter} elements shown`);
                        }}
                        className={`rounded border px-2 py-1 text-[10px] ${
                          periodicFilter === filter
                            ? "border-sky-400 bg-sky-500/20 text-sky-200"
                            : "border-white/10 text-slate-400"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-8 gap-1">
                  {periodicGroups[periodicFilter].map((x, i) => (
                    <button
                      key={x + i}
                      onClick={() => say(x + " selected")}
                      className="rounded border border-sky-300/20 bg-sky-500/15 p-1 text-[10px]"
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black">Scratchpad</h3>
                  <button
                    onClick={() => setScratch("")}
                    className="rounded border border-violet-400/50 px-3 py-1 text-xs"
                  >
                    <Trash2 size={13} className="inline" /> Clear
                  </button>
                </div>
                <textarea
                  value={scratch}
                  onChange={(e) => setScratch(e.target.value)}
                  className="mt-3 h-[142px] w-full rounded-lg border border-white/10 bg-slate-950/60 p-3 font-mono text-sm text-violet-200 outline-none"
                />
              </div>
            </div>
          </section>
          <aside className="min-h-0 space-y-3 overflow-hidden">
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <h3 className="text-lg font-black">🧬 Your Knowledge Model</h3>
              {[
                ["Valence electrons", "Strong", "w-4/5", "bg-emerald-400"],
                ["Formal charge", "Developing", "w-2/5", "bg-blue-400"],
                ["Resonance", "Needs review", "w-1/4", "bg-violet-500"],
              ].map(([x, s, w, c]) => (
                <div key={x} className="mt-4">
                  <div className="flex justify-between text-sm">
                    <span>{x}</span>
                    <b className="text-emerald-300">{s}</b>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-800">
                    <div className={"h-2 rounded-full " + w + " " + c} />
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <div className="flex justify-between">
                <h3 className="text-lg font-black">🌱 Mastery Path</h3>
                <span className="text-sm text-slate-400">3 / 6</span>
              </div>
              {[
                "Lewis structures",
                "Valence electrons",
                "Formal charge",
                "Resonance structures",
                "Polyatomic ions",
                "Structure and properties",
              ].map((x, i) => (
                <button
                  key={x}
                  onClick={() => say(x + " lesson selected")}
                  className="flex w-full items-center gap-3 border-b border-white/5 py-3 text-left text-sm"
                >
                  <span
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full " +
                      (i < 2 ? "bg-emerald-500" : "bg-slate-800")
                    }
                  >
                    {i < 2 ? "✓" : i + 1}
                  </span>
                  <span>
                    {x}
                    <small className="block text-slate-400">
                      {i < 2 ? "Complete" : i === 2 ? "In progress" : "Locked"}
                    </small>
                  </span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <h3 className="font-black">Actions</h3>
              <button
                onClick={() => {
                  setChecked(true);
                  say("Reasoning checked");
                }}
                className="mt-3 w-full rounded-lg bg-emerald-500 py-3 font-bold"
              >
                {checked ? "✓ Reasoning checked" : "✓ Check my reasoning"}
              </button>
              <button
                onClick={() => {
                  setHint(true);
                  say("Visual hint shown");
                }}
                className="mt-2 w-full rounded-lg bg-violet-600 py-3 font-bold"
              >
                <Lightbulb size={18} className="mr-2 inline" />
                Show a visual hint
              </button>
              <button
                onClick={() => say("Tutor explanation playing")}
                className="mt-2 w-full rounded-lg border border-white/10 py-3"
              >
                <Play size={18} className="mr-2 inline" />
                Explain aloud
              </button>
            </div>
          </aside>
          <section className="col-span-2 min-h-0 grid grid-cols-[1fr_330px] gap-3 overflow-hidden">
            <div className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black">Next Question</h3>
                <button
                  onClick={() => {
                    setQuestion((question + 1) % set.questions.length);
                    say("Next question loaded");
                  }}
                  className="text-sky-300"
                >
                  <ChevronRight />
                </button>
              </div>
              <p className="mt-3 font-semibold">
                {set.questions[question]?.prompt ||
                  "Build the sulfate ion SO₄²⁻."}
              </p>
              <button
                onClick={() => onNavigate?.(set.route2d)}
                className="mt-3 rounded-lg border border-sky-300/25 px-3 py-2 text-xs text-sky-200"
              >
                Open visual route
              </button>
            </div>
            <div className="rounded-xl border border-violet-300/30 bg-violet-500/10 p-4">
              <b>Keep going!</b>
              <p className="mt-1 text-xs text-slate-300">
                You’re building real skills.
              </p>
            </div>
          </section>
        </main>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-sky-300/40 bg-[#0b223d] px-4 py-2 text-xs text-sky-100"
        >
          {notice}
        </div>
      )}
    </div>
  );
};
export default PracticeExamTutorPage;
