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
import "./ChemistrySolverTargetPage.css";

const topics = [
  "Stoichiometry",
  "Solutions",
  "Thermochemistry",
  "Equilibrium",
  "Electrochemistry",
];
export default function ChemistrySolverTargetPage() {
  const [topic, setTopic] = useState("Solutions"),
    [acidVolume, setAcidVolume] = useState(25),
    [acidM, setAcidM] = useState(0.1),
    [baseM, setBaseM] = useState(0.125),
    [tab, setTab] = useState("Titration Setup"),
    [hint, setHint] = useState(false),
    [checked, setChecked] = useState(false),
    [labMode, setLabMode] = useState(true),
    [units, setUnits] = useState("SI"),
    [activeSide, setActiveSide] = useState("New Problem");
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
              onClick={() => setTopic(name)}
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
        {[
          [FileText, "New Problem"],
          [BookOpen, "My Notebook"],
          [Network, "Molecular Models"],
          [FileText, "Reference Data"],
          [Calculator, "Calculators"],
          [TestTube2, "Simulations"],
          [Save, "Saved Solutions"],
        ].map(([Icon, label], i) => (
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
      <main>
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
            <button
              onClick={() =>
                document.querySelector(".cs-edit")?.classList.toggle("show")
              }
            >
              ✎ Edit Values
            </button>
            <button onClick={reset}>
              <RotateCcw /> Reset
            </button>
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
          {tab === "pH Curve" && <div className="cs-tab-note">Curve mode: move the input values to see the equivalence point shift along the live titration curve.</div>}
          {tab === "Molecular View" && <div className="cs-tab-note">Molecular mode: one HCl and one NaOH neutralize to NaCl and water at the 1:1 equivalence ratio.</div>}
          <div className="cs-apparatus">
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
          </div>
          <article className="cs-curve">
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
          </article>
          <article className="cs-equivalence">
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
          <p className="cs-note">
            <Beaker />
            At the equivalence point, moles of acid and base are equal and the
            solution is neutral (pH ≈ 7.0) for a strong acid–strong base
            titration.
          </p>
        </section>
      </main>
    </div>
  );
}
