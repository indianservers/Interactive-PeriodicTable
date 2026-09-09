import { useState } from "react";
import {
  Beaker,
  Check,
  FlaskConical,
  Settings,
  ShieldAlert,
} from "lucide-react";

const tests = [
  ["Bromine water", "Tests for alkenes (C=C)", "orange", "Alkene"],
  [
    "2,4-DNP (Brady's reagent)",
    "Tests for carbonyls (aldehydes/ketones)",
    "gold",
    "Carbonyl",
  ],
  ["Tollens’ test", "Tests for aldehydes", "silver", "Aldehyde"],
  [
    "Fehling’s solution",
    "Tests for aldehydes (esp. aliphatic)",
    "blue",
    "Aldehyde",
  ],
  [
    "Sodium bicarbonate",
    "Tests for carboxylic acids",
    "clear",
    "Carboxylic acid",
  ],
  ["Ferric chloride", "Tests for phenols", "brown", "Phenol"],
];
export default function FunctionalTestsTargetPage() {
  const [selected, setSelected] = useState(2);
  const [colour, setColour] = useState("Silver mirror");
  const [precipitate, setPrecipitate] = useState("Yes (silver)");
  const [gas, setGas] = useState("No");
  const [notes, setNotes] = useState(
    "Shiny silver mirror formed on inner glass surface.",
  );
  const [recorded, setRecorded] = useState(false);
  const [notice, setNotice] = useState("");
  const test = tests[selected];
  const announce = (x) => setNotice(x);
  const selectTest = (index) => {
    setSelected(index);
    setColour(
      index === 2
        ? "Silver mirror"
        : index === 3
          ? "Brick-red precipitate"
          : "No change",
    );
    setPrecipitate(
      index === 2 ? "Yes (silver)" : index === 3 ? "Yes (red)" : "No",
    );
    setGas("No");
    setRecorded(false);
    announce(`${tests[index][0]} selected`);
  };
  return (
    <div
      className="h-[calc(100vh-70px)] overflow-hidden bg-[#061426] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[76px] items-center gap-4 border-b border-white/10 bg-[#07172a] px-7">
        <FlaskConical className="text-sky-300" size={36} />
        <div>
          <h1 className="text-2xl font-black">Functional Group Test Lab</h1>
          <p className="text-sm text-slate-400">
            Identify　·　Observe　·　Reason　·　Confirm
          </p>
        </div>
        <div className="ml-auto text-right text-xs text-slate-400">
          Organic Chemistry in Action
          <br />
          <b>Real Tests. Real Evidence.</b>
        </div>
        <Settings size={21} />
      </header>
      <div className="grid min-h-[calc(100vh-76px)] grid-cols-[70px_270px_1fr_330px] gap-2 p-2">
        <nav className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-[#07172a] py-3" aria-label="Functional group lab navigation">
          {[
            ["Lab", <FlaskConical size={20} />],
            ["Unknown", <Beaker size={20} />],
            ["Tests", <FlaskConical size={20} />],
            ["Reference", <Check size={20} />],
            ["Safety", <ShieldAlert size={20} />],
            ["Settings", <Settings size={20} />],
          ].map(([label, icon], index) => (
            <button
              key={label}
              aria-label={label}
              onClick={() => announce(`${label} view selected`)}
              className={`flex w-14 flex-col items-center gap-1 rounded-lg px-1 py-3 text-[10px] ${index === 0 ? "bg-sky-500/20 text-sky-200" : "text-slate-400 hover:bg-white/5"}`}
            >
              {icon}
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <aside className="rounded-xl border border-white/10 bg-[#0a1c31] p-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Unknown sample A</h2>
            <span>✎</span>
          </div>
          <div className="mt-3 rounded-lg border border-white/10 bg-slate-950/70 p-4 text-center text-5xl">
            🧪
          </div>
          <dl className="mt-3 space-y-2 text-xs">
            <div className="flex justify-between">
              <dt>Sample ID</dt>
              <dd>A</dd>
            </div>
            <div className="flex justify-between">
              <dt>Physical state</dt>
              <dd>Liquid</dd>
            </div>
            <div className="flex justify-between">
              <dt>Colour</dt>
              <dd>Colourless</dd>
            </div>
            <div className="flex justify-between">
              <dt>Solubility (H₂O)</dt>
              <dd>Slightly soluble</dd>
            </div>
          </dl>
          <div className="mt-4 rounded-lg border border-white/10 p-3 text-xs text-slate-300">
            Unknown organic compound
            <br />
            <span className="text-slate-400">
              Use the tests below to infer the functional group(s).
            </span>
          </div>
          <h3 className="mt-5 font-bold">Select a test</h3>
          {tests.map((x, i) => (
            <button
              key={x[0]}
              onClick={() => selectTest(i)}
              className={
                "mt-2 w-full rounded-lg border p-3 text-left " +
                (selected === i
                  ? "border-sky-400 bg-sky-500/15"
                  : "border-white/10 bg-slate-900/50")
              }
            >
              <b className="text-sm">
                {i + 1}. {x[0]}
              </b>
              <small className="mt-1 block text-slate-400">{x[1]}</small>
            </button>
          ))}
        </aside>
        <main className="min-w-0 space-y-2">
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-black">{test[0]}</h2>
                <p className="text-slate-400">{test[1]}</p>
              </div>
              <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-4 py-2 text-xs text-emerald-200">
                Running
              </span>
            </div>
            <div
              className="mt-3 grid h-[480px] grid-cols-6 items-end gap-5 rounded-lg border border-white/10 bg-[linear-gradient(180deg,rgba(7,23,42,.48),rgba(2,8,23,.82)),url('/assets/dashboard/titration-lab.png')] bg-cover bg-center p-10"
              aria-label="Interactive test tube rack"
            >
              {tests.map((x, i) => (
                <button
                  key={x[0]}
                  onClick={() => selectTest(i)}
                  className={
                    "relative h-[280px] rounded-b-2xl border-2 " +
                    (selected === i
                      ? "border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,.35) ]"
                      : "border-slate-500")
                  }
                >
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-center text-xs">
                    {i + 1}
                    <br />
                    {x[0].split(" ")[0]}
                  </span>
                  <span
                    style={{ height: `${30 + i * 8}%` }}
                    className={
                      "absolute bottom-0 left-1 right-1 rounded-b-xl " +
                      (x[2] === "silver"
                        ? "bg-slate-200/70"
                        : x[2] === "blue"
                          ? "bg-blue-500/70"
                          : x[2] === "gold"
                            ? "bg-yellow-400/60"
                            : x[2] === "brown"
                              ? "bg-red-900/70"
                              : x[2] === "orange"
                                ? "bg-orange-500/70"
                                : "bg-slate-400/30")
                    }
                  />
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h3 className="font-black">Molecular explanation</h3>
            <p className="mt-2 text-sm text-slate-300">
              The sample response is interpreted from the visible test result.
              Positive {test[3]} evidence supports the functional-group
              hypothesis while controls rule out alternatives.
            </p>
            <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-3 text-sm">
              {test[0]} + unknown sample → observable evidence →
              functional-group inference
            </div>
          </section>
        </main>
        <aside className="space-y-2">
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="text-lg font-black">Record observation</h2>
            {[
              [
                "Colour change",
                colour,
                setColour,
                ["Silver mirror", "Brick-red precipitate", "No change"],
              ],
              [
                "Precipitate",
                precipitate,
                setPrecipitate,
                ["Yes (silver)", "Yes (red)", "No"],
              ],
              ["Gas evolution", gas, setGas, ["No", "Yes (CO₂)"]],
            ].map(([label, value, setter, options]) => (
              <label key={label} className="mt-3 block text-xs text-slate-300">
                {label}
                <select
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  className="mt-1 w-full rounded border border-white/20 bg-slate-950 p-2"
                >
                  {options.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </label>
            ))}
            <label className="mt-3 block text-xs">
              Notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 h-20 w-full rounded border border-white/20 bg-slate-950 p-2"
              />
            </label>
            <button
              onClick={() => {
                setRecorded(true);
                announce("Observation recorded");
              }}
              className="mt-3 w-full rounded-lg bg-emerald-500 py-3 font-bold"
            >
              <Check size={17} className="mr-1 inline" /> Record observation
            </button>
            {recorded && (
              <div className="mt-3 rounded-lg border border-emerald-300/40 bg-emerald-400/10 p-3 text-sm text-emerald-100">
                <div className="flex items-center gap-2 font-black">
                  <Check size={18} /> {colour} observed
                </div>
                <p className="mt-1 text-xs text-emerald-100/75">
                  {precipitate === "No" ? "No precipitate" : `${precipitate} precipitate recorded`} · Gas: {gas}
                </p>
              </div>
            )}
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="text-lg font-black">Infer functional group</h2>
            {[
              "Aldehyde likely",
              "Carbonyl possible",
              "Not yet performed",
              "Other candidates",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => announce(x + " inference selected")}
                className={
                  "mt-2 flex w-full items-center gap-2 rounded-lg border p-2 text-left text-xs " +
                  (i === 0
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-white/10")
                }
              >
                <span className="h-5 w-5 rounded-full border border-slate-400 text-center">
                  {i === 0 ? "✓" : i + 1}
                </span>
                {x}
              </button>
            ))}
            <div className="mt-4 rounded-lg border border-amber-300/40 bg-amber-300/10 p-3">
              <b>Likely functional group:</b>
              <br />
              <span className="text-lg font-black">{test[3]}</span>
            </div>
          </section>
          <section className="rounded-xl border border-white/10 bg-[#0a1c31] p-4">
            <h2 className="flex items-center gap-2 font-black">
              <ShieldAlert size={18} className="text-amber-300" /> Safety & PPE
            </h2>
            <p className="mt-2 text-xs text-slate-400">
              Wear lab coat, safety goggles, nitrile gloves, and work in a
              ventilated area. Dispose of silver waste appropriately.
            </p>
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
