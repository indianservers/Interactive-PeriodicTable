import { useState } from "react";
import {
  ArrowRight,
  Atom,
  BookOpen,
  FlaskConical,
  Search,
  Sparkles,
} from "lucide-react";
const modules = [
  ["Organic Reactions", "#22d3ee", 78],
  ["Spectroscopy", "#fbbf24", 62],
  ["Biochemistry", "#f472b6", 71],
  ["Inorganic Chemistry", "#a3e635", 65],
  ["Physical Simulators", "#60a5fa", 38],
  ["IUPAC Nomenclature", "#34d399", 49],
  ["Retrosynthesis", "#c084fc", 56],
];
function ChemistryCore() {
  return (
    <svg
      viewBox="0 0 220 150"
      className="h-28 w-40"
      aria-label="Central chemistry molecular model"
    >
      <ellipse
        cx="110"
        cy="75"
        rx="90"
        ry="27"
        fill="none"
        stroke="#38bdf8"
        strokeOpacity=".35"
      />
      <ellipse
        cx="110"
        cy="75"
        rx="90"
        ry="27"
        fill="none"
        stroke="#22d3ee"
        strokeOpacity=".35"
        transform="rotate(60 110 75)"
      />
      <ellipse
        cx="110"
        cy="75"
        rx="90"
        ry="27"
        fill="none"
        stroke="#818cf8"
        strokeOpacity=".35"
        transform="rotate(-60 110 75)"
      />
      <line x1="110" y1="75" x2="74" y2="45" stroke="#cbd5e1" strokeWidth="5" />
      <line
        x1="110"
        y1="75"
        x2="150"
        y2="48"
        stroke="#cbd5e1"
        strokeWidth="5"
      />
      <line
        x1="110"
        y1="75"
        x2="149"
        y2="108"
        stroke="#cbd5e1"
        strokeWidth="5"
      />
      <line
        x1="110"
        y1="75"
        x2="74"
        y2="109"
        stroke="#cbd5e1"
        strokeWidth="5"
      />
      <circle
        cx="110"
        cy="75"
        r="20"
        fill="#a855f7"
        stroke="#e9d5ff"
        strokeWidth="3"
      />
      <circle cx="74" cy="45" r="13" fill="#60a5fa" />
      <circle cx="150" cy="48" r="13" fill="#f472b6" />
      <circle cx="149" cy="108" r="13" fill="#a3e635" />
      <circle cx="74" cy="109" r="13" fill="#fbbf24" />
    </svg>
  );
}
export default function ModulesHubTargetPage({ onNavigate }) {
  const [selected, setSelected] = useState("Spectroscopy");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [prerequisites, setPrerequisites] = useState([
    true,
    true,
    false,
    false,
  ]);
  const [mastery, setMastery] = useState(0);
  const announce = (x) => setNotice(x);
  const visibleModules = modules.filter(([name]) =>
    name.toLowerCase().includes(query.toLowerCase()),
  );
  const moduleRoutes = {
    "Organic Reactions": "organic-reactions",
    Spectroscopy: "spectroscopy",
    Biochemistry: "biochemistry",
    "Inorganic Chemistry": "inorganic",
    "Physical Simulators": "physical",
    "IUPAC Nomenclature": "iupac",
    Retrosynthesis: "retrosynthesis",
  };
  const selectedModule =
    modules.find(([name]) => name === selected) || modules[1];
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <Atom className="text-cyan-300" size={31} />
        <div>
          <h1 className="text-xl font-black">ChemLab</h1>
          <p className="text-xs text-slate-400">
            Explore　Practice　Understand
          </p>
        </div>
        <label className="ml-auto flex w-96 items-center gap-2 rounded-full border border-white/15 bg-slate-950/40 px-4 py-2 text-xs text-slate-400">
          <Search size={15} />
          <input
            placeholder="Search reactions, molecules, concepts..."
            className="w-full bg-transparent outline-none"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <span className="text-xs text-amber-300">🔥 12 day streak</span>
        <span className="text-xs text-cyan-200">67% overall mastery</span>
        <span className="rounded-full bg-blue-500/20 px-3 py-2 text-xs">
          Alex Chen
        </span>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[185px_1fr_400px] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0a1e31] p-3">
          {[
            "Home",
            "Modules",
            "Practice",
            "Molecules",
            "Simulations",
            "Notebook",
            "Library",
            "Achievements",
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
          <p className="mt-16 border-t border-white/10 pt-4 text-center text-xs italic text-slate-500">
            A deeper understanding
            <br />
            of a more colorful world.
          </p>
        </aside>
        <main className="relative overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_50%_48%,rgba(34,211,238,.14),transparent_35%),#071725] p-6">
          <h2 className="text-3xl font-black">Chemistry Modules</h2>
          <p className="text-xl text-slate-400">
            Deep practice, visual reasoning
          </p>
          <div className="absolute left-1/2 top-1/2 grid h-64 w-64 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-cyan-300/30 shadow-[0_0_60px_rgba(34,211,238,.22)]">
            <div className="text-center">
              <ChemistryCore />
              <p className="mt-2 text-xs tracking-[.35em] text-cyan-200">
                CHEMISTRY
              </p>
              <small className="text-slate-500">
                A smaller world
                <br />a brighter tomorrow
              </small>
            </div>
          </div>
          {visibleModules.map(([name, color, progress], i) => {
            const angle =
              (i / Math.max(visibleModules.length, 1)) * Math.PI * 2 -
              Math.PI / 2;
            const x = 50 + Math.cos(angle) * 39;
            const y = 50 + Math.sin(angle) * 38;
            return (
              <button
                key={name}
                onClick={() => {
                  setSelected(name);
                  announce(`${name} selected`);
                }}
                className={`absolute w-40 -translate-x-1/2 -translate-y-1/2 text-center ${selected === name ? "scale-105" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div
                  className="mx-auto grid h-28 w-28 place-items-center rounded-full border-2 bg-slate-900/90 shadow-[0_0_25px_rgba(34,211,238,.2)]"
                  style={{ borderColor: color }}
                >
                  <FlaskConical style={{ color }} size={31} />
                </div>
                <b className="mt-2 block text-sm">{name}</b>
                <small style={{ color }}>{progress}% complete</small>
                <div className="mt-1 h-1 rounded bg-slate-700">
                  <div
                    className="h-1 rounded"
                    style={{ width: `${progress}%`, backgroundColor: color }}
                  />
                </div>
              </button>
            );
          })}
          {visibleModules.length === 0 && (
            <div className="absolute inset-x-8 bottom-8 rounded border border-amber-300/20 bg-amber-300/10 p-3 text-center text-xs text-amber-100">
              No modules match “{query}”. Clear the search to restore the module
              map.
            </div>
          )}
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-xl font-bold text-cyan-200">
            <Sparkles className="mr-1 inline" size={18} />
            Recommended next
          </h2>
          <div className="mt-4 rounded border border-white/10 p-4">
            <span className="rounded bg-blue-500/20 px-2 py-1 text-[10px] text-cyan-200">
              PRACTICE
            </span>
            <h3 className="mt-3 text-xl font-bold">
              {selected === "Spectroscopy"
                ? "Spectroscopy Interpreter"
                : selected}
            </h3>
            <p className="text-sm text-slate-400">
              {selected === "Spectroscopy"
                ? "Turn spectra into structures"
                : `${selectedModule[2]}% complete · continue your next learning step`}
            </p>
            <div className="mt-4 rounded bg-slate-950/50 p-3 text-xs">
              {selected === "Spectroscopy"
                ? "Identify the molecule from the ¹H NMR spectrum (ethyl acetate)."
                : `Recommended focus: build confidence in ${selected.toLowerCase()} concepts.`}
              <div className="mt-3 h-24 border-b border-l border-cyan-300/60">
                <div className="ml-1 h-full w-full bg-[linear-gradient(90deg,transparent_22%,#67e8f9_22.5%,transparent_23%,transparent_58%,#a78bfa_58.5%,transparent_59%,transparent_78%,#fbbf24_78.5%,transparent_79%)]" />
              </div>
            </div>
            <button
              onClick={() => {
                const route = moduleRoutes[selected] || "spectroscopy";
                window.location.hash = `#modules/${route}`;
                announce(`${selected} module launched`);
              }}
              className="mt-3 w-full rounded bg-blue-500 px-3 py-3 font-bold"
            >
              Begin module <ArrowRight size={15} className="ml-1 inline" />
            </button>
          </div>
          <section className="mt-4 rounded border border-white/10 p-4">
            <h3 className="font-bold">Prerequisites</h3>
            {[
              "Basic NMR principles",
              "Chemical shift and splitting",
              "Interpreting integration",
              "Common functional group ranges",
            ].map((x, i) => (
              <label key={x} className="mt-3 flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={prerequisites[i]}
                  onChange={() =>
                    setPrerequisites((items) =>
                      items.map((value, index) =>
                        index === i ? !value : value,
                      ),
                    )
                  }
                />
                {x}
              </label>
            ))}
          </section>
          <section className="mt-4 rounded border border-white/10 p-4">
            <h3 className="font-bold">Mastery route</h3>
            <div className="mt-4 flex items-center justify-between text-xs text-cyan-200">
              {[
                "Basics",
                "Interpretation",
                "Assignments",
                "Real-world spectra",
              ].map((x, i) => (
                <button
                  key={x}
                  onClick={() => {
                    setMastery(i);
                    announce(`${x} mastery step selected`);
                  }}
                  className={`text-center ${mastery === i ? "text-white" : "text-cyan-200"}`}
                >
                  <i
                    className={`mx-auto mb-1 grid h-7 w-7 place-items-center rounded-full border not-italic ${mastery === i ? "border-cyan-300 bg-cyan-300/20" : "border-cyan-300"}`}
                  >
                    {i + 1}
                  </i>
                  {x}
                </button>
              ))}
            </div>
          </section>
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
