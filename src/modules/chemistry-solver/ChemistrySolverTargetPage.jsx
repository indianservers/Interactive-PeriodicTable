import { useMemo, useState } from "react";
import {
  Atom,
  Beaker,
  BookOpen,
  Calculator,
  Check,
  FileText,
  FlaskConical,
  Lightbulb,
  Network,
  RotateCcw,
  Save,
  Sun,
  TestTube2,
} from "lucide-react";
import { useLocalStorage } from "../../hooks/useLocalStorage.js";
import "./ChemistrySolverTargetPage.css";

const topics = [
  "Stoichiometry",
  "Solutions",
  "Thermochemistry",
  "Equilibrium",
  "Electrochemistry",
];

const topicProblems = {
  Stoichiometry: { title: "Combustion stoichiometry", question: "How many moles of oxygen are required to completely burn 2.00 mol of methane?", equation: "CH₄ + 2 O₂ → CO₂ + 2 H₂O", steps: ["Balance the combustion equation.", "Read the 1:2 mole ratio for CH₄:O₂.", "2.00 mol CH₄ × 2 mol O₂ / 1 mol CH₄ = 4.00 mol O₂."], answer: "4.00 mol O₂" },
  Thermochemistry: { title: "Heating liquid water", question: "How much heat is needed to warm 100 g of water from 20.0 °C to 35.0 °C?", equation: "q = mcΔT", steps: ["Calculate ΔT = 35.0 − 20.0 = 15.0 °C.", "Use c = 4.184 J g⁻¹ °C⁻¹.", "q = 100 g × 4.184 J g⁻¹ °C⁻¹ × 15.0 °C."], answer: "6.28 kJ" },
  Equilibrium: { title: "Equilibrium concentration", question: "For N₂O₄ ⇌ 2 NO₂, find Kc when [NO₂] = 0.30 M and [N₂O₄] = 0.20 M.", equation: "Kc = [NO₂]² / [N₂O₄]", steps: ["Write the equilibrium expression from the balanced equation.", "Substitute the equilibrium concentrations.", "Kc = (0.30)² / 0.20 = 0.45."], answer: "Kc = 0.45" },
  Electrochemistry: { title: "Standard cell potential", question: "Find E°cell for a Zn|Zn²⁺ || Cu²⁺|Cu galvanic cell.", equation: "E°cell = E°cathode − E°anode", steps: ["Cu²⁺/Cu is the cathode: +0.34 V.", "Zn²⁺/Zn is the anode: −0.76 V.", "E°cell = 0.34 − (−0.76) = 1.10 V."], answer: "E°cell = 1.10 V" },
};

const sidePages = [[FileText, "New Problem"], [BookOpen, "My Notebook"], [Network, "Molecular Models"], [FileText, "Reference Data"], [Calculator, "Calculators"], [TestTube2, "Simulations"], [Save, "Saved Solutions"]];

function TopicProblem({ topic, onVisualize, onSave, saved }) {
  const problem = topicProblems[topic];
  return <main className="cs-topic-workspace">
    <article className="cs-problem cs-topic-problem"><span className="cs-kicker">{topic}</span><h2>{problem.title}</h2><p>{problem.question}</p></article>
    <article className="cs-solution cs-topic-solution"><h2>Step-by-Step Solution</h2><div className="cs-equation">{problem.equation}</div><ol>{problem.steps.map((step) => <li key={step}><b>{step}</b></li>)}</ol><div className="cs-answer">Answer <strong>{problem.answer}</strong><Check /></div><footer><button onClick={onSave}><Save /> {saved ? "Saved" : "Save solution"}</button><button onClick={onVisualize}><Network /> Open visualization</button></footer></article>
    <aside className="cs-topic-visual" aria-label={`${topic} model`}><Atom /><span>{problem.equation}</span><strong>{problem.answer}</strong><p>The model and result update with the selected chemistry topic.</p></aside>
  </main>;
}

function SideWorkspace({ page, note, setNote, saved, onOpenTopic, onReturn }) {
  const content = {
    "My Notebook": <><h2>My Notebook</h2><p>Keep working notes beside the solver. Notes are retained while this page is open.</p><textarea aria-label="Chemistry notebook" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Record observations, formulae, or questions…" /></>,
    "Molecular Models": <><h2>Molecular Models</h2><p>Select a model to open the matching problem and molecular explanation.</p><div className="cs-card-grid">{[["HCl + NaOH", "Solutions"], ["CH₄ combustion", "Stoichiometry"], ["Zn/Cu cell", "Electrochemistry"]].map(([label, target]) => <button key={label} onClick={() => onOpenTopic(target)}><Network /><strong>{label}</strong><span>Open {target}</span></button>)}</div></>,
    "Reference Data": <><h2>Reference Data</h2><p>Frequently used constants and relationships.</p><dl className="cs-reference"><dt>Avogadro constant</dt><dd>6.022 × 10²³ mol⁻¹</dd><dt>Gas constant</dt><dd>8.314 J mol⁻¹ K⁻¹</dd><dt>Water heat capacity</dt><dd>4.184 J g⁻¹ °C⁻¹</dd><dt>Faraday constant</dt><dd>96,485 C mol⁻¹</dd></dl></>,
    Calculators: <><h2>Calculators</h2><p>Open a solver with the right equation and worked example.</p><div className="cs-card-grid">{[["Molarity & dilution", "Solutions"], ["Heat energy", "Thermochemistry"], ["Cell potential", "Electrochemistry"]].map(([label, target]) => <button key={label} onClick={() => onOpenTopic(target)}><Calculator /><strong>{label}</strong><span>Calculate now</span></button>)}</div></>,
    Simulations: <><h2>Simulations</h2><p>Explore a live visual model for each supported problem type.</p><div className="cs-card-grid">{[["Acid-base titration", "Solutions"], ["Dynamic equilibrium", "Equilibrium"], ["Galvanic cell", "Electrochemistry"]].map(([label, target]) => <button key={label} onClick={() => onOpenTopic(target)}><TestTube2 /><strong>{label}</strong><span>Start simulation</span></button>)}</div></>,
    "Saved Solutions": <><h2>Saved Solutions</h2><p>{saved.length ? `${saved.length} solution${saved.length === 1 ? "" : "s"} ready to reopen.` : "No saved solutions yet."}</p><div className="cs-saved-list">{saved.map((item) => <button key={item} onClick={() => onOpenTopic(item)}><Save /><strong>{item}</strong><span>Open worked solution</span></button>)}</div>{!saved.length && <button className="cs-primary-action" onClick={onReturn}>Solve a problem</button>}</>,
  };
  return <main className="cs-side-workspace"><section>{content[page]}</section></main>;
}
export default function ChemistrySolverTargetPage({ initialPage = "New Problem" }) {
  const [topic, setTopic] = useState("Solutions"),
    [acidVolume, setAcidVolume] = useState(25),
    [acidM, setAcidM] = useState(0.1),
    [baseM, setBaseM] = useState(0.125),
    [tab, setTab] = useState("Titration Setup"),
    [hint, setHint] = useState(false),
    [checked, setChecked] = useState(false),
    [labMode, setLabMode] = useState(true),
    [units, setUnits] = useState("SI"),
    [activeSide, setActiveSide] = useState(initialPage);
  const [note, setNote] = useLocalStorage("chemistry-solver-notebook", "");
  const [saved, setSaved] = useLocalStorage("chemistry-solver-target-saved", []);
  const result = useMemo(() => {
    const moles = (acidVolume / 1000) * acidM,
      volume = (moles / baseM) * 1000;
    return { moles, volume };
  }, [acidVolume, acidM, baseM]);
  const reset = () => {
    setAcidVolume(25);
    setAcidM(0.1);
    setBaseM(0.125);
    setTab("Titration Setup");
    setHint(false);
    setChecked(false);
    setLabMode(true);
    setUnits("SI");
    setActiveSide("New Problem");
  };
  const openTopic = (nextTopic) => {
    setTopic(nextTopic);
    setActiveSide("New Problem");
    if (nextTopic === "Solutions") setTab("Titration Setup");
  };
  const saveTopic = () => setSaved((items) => items.includes(topic) ? items : [topic, ...items]);
  return (
    <div className="cs-app">
      <header>
        <FlaskConical />
        <div>
          <h1>Chemistry Problem Solver</h1>
          <p>Solve with units, models, and evidence</p>
        </div>
        <nav>
          {topics.map((name) => (
            <button
              className={topic === name ? "active" : ""}
              onClick={() => openTopic(name)}
              key={name}
            >
              {name}
            </button>
          ))}
        </nav>
        <button className={`cs-lab ${labMode ? "active" : ""}`} onClick={() => setLabMode((v) => !v)}>
          <Sun /> {labMode ? "Lab Mode" : "Study Mode"}
        </button>
        <button className="cs-units" onClick={() => setUnits((v) => v === "SI" ? "US" : "SI")}>Units: {units}⌄</button>
        <span className="cs-user">●</span>
      </header>
      <aside>
        {sidePages.map(([Icon, label]) => (
          <button key={label} className={activeSide === label ? "active" : ""} onClick={() => setActiveSide(label)}>
            <Icon />
            {label}
          </button>
        ))}
        <div>
          <Atom />
          <p>
            Better
            <br />
            Chemistry
            <br />
            Brighter Futures
          </p>
        </div>
      </aside>
      {activeSide !== "New Problem" ? (
        <SideWorkspace page={activeSide} note={note} setNote={setNote} saved={saved} onOpenTopic={openTopic} onReturn={() => setActiveSide("New Problem")} />
      ) : topic !== "Solutions" ? (
        <TopicProblem topic={topic} onVisualize={() => setActiveSide("Molecular Models")} onSave={saveTopic} saved={saved.includes(topic)} />
      ) : <main>
        <section className="cs-left">
          <article className="cs-problem">
            <h2>Problem</h2>
            <div className="cs-edit">
              <label>
                HCl volume{" "}
                <input
                  aria-label="HCl volume"
                  type="number"
                  value={acidVolume}
                  onChange={(e) => setAcidVolume(Number(e.target.value))}
                />
              </label>
              <label>
                HCl molarity{" "}
                <input
                  aria-label="HCl molarity"
                  type="number"
                  step=".01"
                  value={acidM}
                  onChange={(e) => setAcidM(Number(e.target.value))}
                />
              </label>
              <label>
                NaOH molarity{" "}
                <input
                  aria-label="NaOH molarity"
                  type="number"
                  step=".005"
                  value={baseM}
                  onChange={(e) => setBaseM(Number(e.target.value))}
                />
              </label>
            </div>
            <div className="cs-problem-actions">
              <button onClick={() => document.querySelector(".cs-edit")?.classList.toggle("show")}>✎ Edit Values</button>
              <button onClick={reset}><RotateCcw /> Reset</button>
              <button onClick={saveTopic}><Save /> {saved.includes(topic) ? "Saved" : "Save"}</button>
            </div>
            <p>
              {acidVolume.toFixed(1)} mL of {acidM.toFixed(3)} M HCl is titrated
              with {baseM.toFixed(3)} M NaOH.
              <br />
              Find the equivalence volume.
            </p>
          </article>
          <article className="cs-solution">
            <h2>Step-by-Step Solution</h2>
            <ol>
              <li>
                <b>Balanced chemical equation</b>
                <div className="cs-equation">
                  HCl <i>(aq)</i>　+　NaOH <i>(aq)</i>　→　NaCl <i>(aq)</i>
                  　+　H₂O <i>(l)</i>
                </div>
                <span className="cs-ratio">
                  <strong>1 : 1</strong>
                  <small>
                    mole ratio
                    <br />
                    HCl : NaOH
                  </small>
                </span>
              </li>
              <li>
                <b>Moles of HCl (analyte)</b>
                <p>
                  <em>n</em>
                  <sub>HCl</sub> = M × V = {acidM.toFixed(3)} mol/L ×{" "}
                  {(acidVolume / 1000).toFixed(4)} L ={" "}
                  {result.moles.toExponential(2)} mol
                </p>
              </li>
              <li>
                <b>Use stoichiometry to find moles of NaOH</b>
                <p>
                  <em>n</em>
                  <sub>NaOH</sub> = <em>n</em>
                  <sub>HCl</sub> = {result.moles.toExponential(2)} mol　 (1 : 1
                  ratio)
                </p>
              </li>
              <li>
                <b>Solve for equivalence volume of NaOH</b>
                <p>
                  V<sub>NaOH</sub> = n<sub>NaOH</sub> / M<sub>NaOH</sub> ={" "}
                  {result.moles.toExponential(2)} / {baseM.toFixed(3)} mol/L ={" "}
                  {(result.volume / 1000).toFixed(4)} L ={" "}
                  <strong>{result.volume.toFixed(1)} mL</strong>
                </p>
                <div className="cs-dimensional">
                  Dimensional Analysis (units cancel)
                  <br />
                  <b>
                    {result.moles.toExponential(2)} mol ÷ {baseM.toFixed(3)}{" "}
                    mol/L × 1000 mL/L = {result.volume.toFixed(1)} mL
                  </b>
                </div>
              </li>
              <li>
                <b>Answer</b>
                <div className="cs-answer">
                  Equivalence volume =　
                  <strong>{result.volume.toFixed(1)} mL</strong>
                  <Check />
                </div>
              </li>
            </ol>
            <footer>
              <button
                className={checked ? "done" : ""}
                onClick={() => setChecked(true)}
              >
                <Check /> {checked ? "Step checked" : "Check Step"}
              </button>
              <button onClick={() => setHint((v) => !v)}>
                <Lightbulb /> Reveal Hint
              </button>
              <button onClick={() => setTab("pH Curve")}>
                ▥ Visualize this step
              </button>
            </footer>
            {hint && (
              <p className="cs-hint">
                At equivalence, moles of H⁺ equal moles of OH⁻. The 1:1 balanced
                equation makes the mole amounts equal.
              </p>
            )}
          </article>
        </section>
        <section className="cs-visual">
          <header>
            <h2>Visualization</h2>
            <nav>
              {["Titration Setup", "pH Curve", "Molecular View"].map((name) => (
                <button
                  key={name}
                  className={tab === name ? "active" : ""}
                  onClick={() => setTab(name)}
                >
                  {name}
                </button>
              ))}
            </nav>
          </header>
          {tab === "Titration Setup" && <div className="cs-apparatus">
            <div className="cs-titrant">
              <i />
              NaOH (titrant)
              <br />
              {baseM.toFixed(3)} M
              <strong>
                Volume delivered
                <br />
                {result.volume.toFixed(1)} mL
              </strong>
            </div>
            <div className="cs-burette">
              <span style={{ height: `${Math.min(90, result.volume * 3)}%` }} />
              <i />
            </div>
            <div className="cs-beaker">
              <i />
              <span />
            </div>
            <div className="cs-analyte">
              <i />
              HCl (analyte)
              <br />
              {acidM.toFixed(3)} M<br />
              {acidVolume.toFixed(1)} mL
            </div>
            <b className="cs-stir">●　Stir</b>
          </div>}
          {tab === "pH Curve" && <div className="cs-tab-panel cs-curve-panel"><p>Move the problem values to see the equivalence point shift along the calculated curve.</p><article className="cs-curve">
            <h3>Titration Curve (Strong Acid–Strong Base)</h3>
            <svg viewBox="0 0 280 245">
              <path d="M30 205 C95 200 130 190 145 160 S148 75 165 57 S220 43 260 42" />
              <line
                x1={30 + (result.volume / 40) * 230}
                x2={30 + (result.volume / 40) * 230}
                y1="42"
                y2="210"
              />
              <circle cx={30 + (result.volume / 40) * 230} cy="130" r="7" />
              <text x="160" y="143">
                Equivalence point
              </text>
              <text x="160" y="160">
                ({result.volume.toFixed(1)} mL, pH ≈ 7.0)
              </text>
              <text x="8" y="18">
                pH
              </text>
              <text x="90" y="235">
                Volume of NaOH (mL)
              </text>
            </svg>
          </article></div>}
          {tab === "Molecular View" && <div className="cs-tab-panel cs-molecular-panel"><div className="cs-particle acid">H⁺</div><span>+</span><div className="cs-particle base">OH⁻</div><span>→</span><div className="cs-water">H₂O</div><h3>Neutralization at particle level</h3><p>Equal amounts of hydrogen and hydroxide ions combine to form water. Na⁺ and Cl⁻ remain as spectator ions.</p></div>}
          <article className={`cs-equivalence ${tab !== "Titration Setup" ? "cs-equivalence-wide" : ""}`}>
            <h3>At equivalence</h3>
            <dl>
              <dt>Volume of NaOH</dt>
              <dd>{result.volume.toFixed(1)} mL</dd>
              <dt>Moles HCl</dt>
              <dd>{result.moles.toExponential(2)} mol</dd>
              <dt>Moles NaOH</dt>
              <dd>{result.moles.toExponential(2)} mol</dd>
              <dt>pH</dt>
              <dd>≈ 7.0</dd>
              <dt>Solution</dt>
              <dd>NaCl (aq)</dd>
              <dt>Indicator</dt>
              <dd>Phenolphthalein</dd>
            </dl>
          </article>
          <p className={`cs-note ${tab !== "Titration Setup" ? "cs-note-wide" : ""}`}>
            <Beaker />
            At the equivalence point, moles of acid and base are equal and the
            solution is neutral (pH ≈ 7.0) for a strong acid–strong base
            titration.
          </p>
        </section>
      </main>}
    </div>
  );
}
