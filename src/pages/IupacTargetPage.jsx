import { useState } from "react";
import { CheckCircle2, FlaskConical, RotateCcw, Search } from "lucide-react";
const groups = [
  "Carboxylic acid",
  "Anhydride",
  "Ester",
  "Acyl halide",
  "Amide",
  "Nitrile",
  "Aldehyde",
  "Ketone",
  "Alcohol",
  "Thiol",
  "Amine",
  "Alkene",
  "Alkyne",
  "Alkane",
];
function CarbonChainScene() {
  const points = [
    [48, 128],
    [104, 92],
    [160, 128],
    [216, 92],
    [272, 128],
    [328, 92],
  ];
  return (
    <svg
      viewBox="0 0 380 220"
      className="h-full w-full"
      role="img"
      aria-label="Numbered six-carbon parent chain"
    >
      <defs>
        <filter id="chainGlow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      {points.slice(0, -1).map(([x, y], i) => (
        <line
          key={i}
          x1={x}
          y1={y}
          x2={points[i + 1][0]}
          y2={points[i + 1][1]}
          stroke="#22d3ee"
          strokeWidth="9"
          opacity=".35"
          filter="url(#chainGlow)"
        />
      ))}
      {points.slice(0, -1).map(([x, y], i) => (
        <line
          key={`b${i}`}
          x1={x}
          y1={y}
          x2={points[i + 1][0]}
          y2={points[i + 1][1]}
          stroke="#cbd5e1"
          strokeWidth="7"
        />
      ))}
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={x}
            cy={y}
            r="17"
            fill="#334155"
            stroke="#22d3ee"
            strokeWidth="3"
          />
          <text x={x} y={y + 5} fill="#fff" fontSize="12" textAnchor="middle">
            C
          </text>
          <text
            x={x}
            y={y + 31}
            fill="#22d3ee"
            fontSize="11"
            textAnchor="middle"
          >
            {i + 1}
          </text>
        </g>
      ))}
      <line x1="104" y1="92" x2="78" y2="42" stroke="#cbd5e1" strokeWidth="5" />
      <circle cx="72" cy="31" r="12" fill="#e2e8f0" />
      <text x="42" y="24" fill="#cbd5e1" fontSize="10">
        CH₃
      </text>
      <line
        x1="160"
        y1="128"
        x2="145"
        y2="185"
        stroke="#cbd5e1"
        strokeWidth="5"
      />
      <circle cx="140" cy="198" r="12" fill="#e2e8f0" />
      <text x="108" y="216" fill="#cbd5e1" fontSize="10">
        CH₂CH₃
      </text>
      <line
        x1="216"
        y1="92"
        x2="216"
        y2="37"
        stroke="#cbd5e1"
        strokeWidth="5"
      />
      <circle cx="216" cy="25" r="12" fill="#e2e8f0" />
      <text x="224" y="18" fill="#cbd5e1" fontSize="10">
        CH₃
      </text>
    </svg>
  );
}
export default function IupacTargetPage({ onNavigate }) {
  const [parent, setParent] = useState("hexane");
  const [locantA, setLocantA] = useState("3");
  const [substituentA, setSubstituentA] = useState("ethyl");
  const [locantB, setLocantB] = useState("2");
  const [substituentB, setSubstituentB] = useState("methyl");
  const [ok, setOk] = useState(true);
  const [view, setView] = useState("Ball & Stick");
  const [guideTab, setGuideTab] = useState("Rules");
  const [selectedGroup, setSelectedGroup] = useState("Alkane");
  const [stereo, setStereo] = useState("");
  const [notice, setNotice] = useState("");
  const announce = (x) => setNotice(x);
  const composedName = `${locantA}-${substituentA}-${locantB}-${substituentB}${parent}`;
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-5">
        <FlaskConical size={29} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">
            IUPAC <span className="text-cyan-300">Nomenclature Studio</span>
          </h1>
          <p className="text-xs text-slate-400">
            Build names. Visualize structures. Master organic chemistry.
          </p>
        </div>
        <nav className="ml-auto flex gap-6 text-sm">
          <button className="border-b-2 border-cyan-300 px-3 py-4 text-cyan-200">
            Learn
          </button>
          <button onClick={() => announce("Practice mode selected")}>
            Practice
          </button>
          <button onClick={() => announce("Quiz mode selected")}>Quiz</button>
          <button onClick={() => announce("Settings opened")}>⚙</button>
          <span className="rounded-full bg-blue-500/20 px-3 py-2 text-xs">
            LS　Learner
          </span>
        </nav>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[180px_235px_1fr_365px] gap-2 p-2">
        <aside className="rounded border border-white/10 bg-[#081b2d] p-3">
          {[
            "Home",
            "Nomenclature",
            "Stereochemistry",
            "Functional Groups",
            "Practice",
            "Molecule Library",
            "Settings",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => (x === "Home" ? onNavigate?.("dashboard") : announce(`${x} selected`))}
              className={`mb-1 w-full rounded px-3 py-3 text-left text-sm ${i === 1 ? "border-l-2 border-cyan-300 bg-blue-500/15 text-cyan-200" : "text-slate-300"}`}
            >
              {x}
            </button>
          ))}
          <div className="mt-14 rounded border border-white/10 p-4 text-center text-xs text-slate-500">
            Chemistry
            <br />
            <b className="text-cyan-200">Builds Brighter Minds</b>
          </div>
        </aside>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2135] p-3">
          <h2 className="font-bold">Functional Group Priority</h2>
          <p className="text-[10px] text-slate-400">
            Higher priority takes suffix, others are prefixes.
          </p>
          {groups.map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setSelectedGroup(x);
                announce(`${x} selected`);
              }}
              className={`mt-1 flex w-full items-center gap-2 border-b border-white/5 py-2 text-left text-xs ${selectedGroup === x ? "bg-cyan-300/10 text-cyan-100" : ""}`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400/20 text-cyan-200">
                {i + 1}
              </span>
              <span>
                {x}
                <small className="block text-slate-500">
                  {
                    [
                      "—COOH",
                      "(RCO)₂O",
                      "—COOR",
                      "—COX",
                      "—CONH₂",
                      "—C≡N",
                      "—CHO",
                      "> C=O",
                      "—OH",
                      "—SH",
                      "—NH₂",
                      "C=C",
                      "C≡C",
                      "C–C",
                    ][i]
                  }
                </small>
              </span>
            </button>
          ))}
        </aside>
        <main className="min-w-0 overflow-auto">
          <section className="rounded border border-white/10 bg-[#0b2135] p-3">
            <div className="grid grid-cols-[1.1fr_1fr] gap-2">
              <div>
                <h2 className="text-2xl font-black text-cyan-200">
                  Find the parent chain
                </h2>
                <p className="text-sm text-slate-400">
                  Click the longest continuous chain of carbons.
                </p>
                <div className="relative mt-4 grid h-72 place-items-center rounded border border-white/10 bg-gradient-to-br from-[#192f48] to-[#071523]">
                  <CarbonChainScene />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  2D Structure{" "}
                  <span className="text-cyan-300">(synchronized)</span>
                </h2>
                <div className="mt-3 grid h-72 place-items-center rounded border border-white/10 bg-[#081727]">
                  <div className="relative h-36 w-72 text-cyan-100">
                    <div className="absolute left-8 top-1/2 h-1 w-52 -translate-y-1/2 rotate-[-12deg] bg-cyan-300" />
                    <div className="absolute left-24 top-9 text-lg">CH₃</div>
                    <div className="absolute left-0 top-1/2">H₃C</div>
                    <div className="absolute right-0 top-1/2">CH₃</div>
                    <div className="absolute left-28 bottom-1 text-sm">
                      CH₂CH₃
                    </div>
                    <div className="absolute left-28 top-[48%] text-cyan-300">
                      1　2　3　4　5　6
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setView("Ball & Stick")}
                className={`rounded border px-3 py-2 text-xs ${view === "Ball & Stick" ? "border-cyan-300 text-cyan-200" : "border-white/10"}`}
              >
                Ball & Stick
              </button>
              <button
                onClick={() => setView("Space Filling")}
                className={`rounded border px-3 py-2 text-xs ${view === "Space Filling" ? "border-cyan-300 text-cyan-200" : "border-white/10"}`}
              >
                Space Filling
              </button>
              <button
                onClick={() => {
                  setView("Ball & Stick");
                  announce("View reset");
                }}
                className="ml-auto rounded border border-white/10 px-3 py-2 text-xs"
              >
                <RotateCcw size={14} className="mr-1 inline" />
                Reset View
              </button>
            </div>
          </section>
          <section className="mt-2 rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="text-xl font-bold">Name the Molecule</h2>
            <p className="text-xs text-slate-400">
              Build the IUPAC name using the correct locants and substituents.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                className="w-16 rounded border border-white/15 bg-slate-950 p-3 text-center"
                value={locantA}
                onChange={(e) =>
                  setLocantA(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
              />
              <select
                value={substituentA}
                onChange={(e) => setSubstituentA(e.target.value)}
                className="rounded border border-white/15 bg-slate-950 p-3"
              >
                <option value="ethyl">ethyl</option>
                <option value="methyl">methyl</option>
              </select>
              <input
                className="w-16 rounded border border-white/15 bg-slate-950 p-3 text-center"
                value={locantB}
                onChange={(e) =>
                  setLocantB(e.target.value.replace(/\D/g, "").slice(0, 2))
                }
              />
              <select
                value={substituentB}
                onChange={(e) => setSubstituentB(e.target.value)}
                className="rounded border border-white/15 bg-slate-950 p-3"
              >
                <option value="methyl">methyl</option>
                <option value="ethyl">ethyl</option>
              </select>
              <select
                value={parent}
                onChange={(e) => setParent(e.target.value)}
                className="rounded border border-white/15 bg-slate-950 p-3"
              >
                <option>hexane</option>
                <option>pentane</option>
                <option>heptane</option>
              </select>
              <button
                onClick={() => {
                  const correct = composedName === "3-ethyl-2-methylhexane";
                  setOk(correct);
                  announce(
                    correct ? "Correct name" : `Checked ${composedName}`,
                  );
                }}
                className="rounded bg-blue-500 px-4 font-bold"
              >
                Check name
              </button>
            </div>
            {ok && (
              <div className="mt-4 rounded border border-emerald-400/60 bg-emerald-400/10 p-3 text-emerald-300">
                <CheckCircle2 size={17} className="mr-2 inline" />
                {composedName} — Correct!
              </div>
            )}
            {!ok && (
              <div className="mt-4 rounded border border-amber-300/50 bg-amber-300/10 p-3 text-xs text-amber-100">
                Current name: <b>{composedName}</b>. Check the parent chain and
                locants, then try again.
              </div>
            )}
          </section>
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2135] p-4">
          <h2 className="text-lg font-bold">Naming Guide & Checklist</h2>
          <div className="mt-3 flex rounded border border-white/10">
            <button
              onClick={() => setGuideTab("Rules")}
              className={`flex-1 border-b-2 p-2 text-xs ${guideTab === "Rules" ? "border-cyan-300 text-cyan-200" : "border-transparent text-slate-400"}`}
            >
              Rules
            </button>
            <button
              onClick={() => {
                setGuideTab("Feedback");
                announce("Feedback tab selected");
              }}
              className={`flex-1 p-2 text-xs ${guideTab === "Feedback" ? "text-cyan-200" : "text-slate-400"}`}
            >
              Feedback
            </button>
            <button
              onClick={() => {
                setGuideTab("IUPAC Tips");
                announce("IUPAC tips selected");
              }}
              className={`flex-1 p-2 text-xs ${guideTab === "IUPAC Tips" ? "text-cyan-200" : "text-slate-400"}`}
            >
              IUPAC Tips
            </button>
          </div>
          {guideTab !== "Rules" && (
            <div className="mt-3 rounded border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-100">
              {guideTab === "Feedback"
                ? "Your current structure assignment is consistent with the selected parent and functional group."
                : "Tip: prioritize the principal characteristic group, then choose the longest chain and lowest locants."}
            </div>
          )}
          {guideTab === "Rules" &&
            [
              "Find the parent chain",
              "Number for lowest locants",
              "Identify substituents",
              "List substituents alphabetically",
              "Assemble the name",
            ].map((x, i) => (
              <div
                key={x}
                className="mt-2 flex items-center gap-2 rounded border border-white/10 p-3 text-xs"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/70">
                  {i + 1}
                </span>
                <span>
                  {x}
                  <small className="block text-slate-400">
                    {
                      [
                        "Longest continuous chain = 6 carbons",
                        "Substituents at C-2 and C-3",
                        "Ethyl at C-3, Methyl at C-2",
                        "Ignoring di-, tri-, etc.",
                        "Use locants and hyphens",
                      ][i]
                    }
                  </small>
                </span>
                <CheckCircle2 size={16} className="ml-auto text-emerald-300" />
              </div>
            ))}
          <div className="mt-3 rounded border border-emerald-400/60 bg-emerald-400/10 p-4 text-emerald-300">
            <CheckCircle2 size={20} className="mr-2 inline" />
            Correct!
            <p className="mt-1 text-xs">The name matches the structure.</p>
          </div>
          <h3 className="mt-5 font-bold">
            IUPAC Naming Rules (Quick Reference)
          </h3>
          <ul className="mt-2 space-y-2 text-xs text-slate-400">
            <li>
              • Choose the longest chain containing the highest priority group.
            </li>
            <li>• Number to give the lowest set of locants.</li>
            <li>• List substituents alphabetically.</li>
            <li>• Use commas and hyphens correctly.</li>
          </ul>
          <div className="mt-4 rounded border border-white/10 p-3 text-xs">
            <b>Stereochemistry</b>
            <p className="mt-2 text-slate-400">
              Assign R/S configuration using CIP priority.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  setStereo("R");
                  announce("R configuration selected");
                }}
                className={`rounded border px-4 py-2 ${stereo === "R" ? "border-cyan-300 bg-cyan-300/10" : "border-white/15"}`}
              >
                R
              </button>
              <button
                onClick={() => {
                  setStereo("S");
                  announce("S configuration selected");
                }}
                className={`rounded border px-4 py-2 ${stereo === "S" ? "border-cyan-300 bg-cyan-300/10" : "border-white/15"}`}
              >
                S
              </button>
              <button
                onClick={() => {
                  setStereo("");
                  setOk(false);
                  announce("Stereochemistry cleared");
                }}
                className="rounded border border-white/15 px-4 py-2"
              >
                Clear
              </button>
            </div>
          </div>
        </aside>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/30 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
