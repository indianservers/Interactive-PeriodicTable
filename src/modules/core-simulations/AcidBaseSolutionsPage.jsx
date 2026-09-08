import { useMemo, useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  Droplets,
  FlaskConical,
  Lightbulb,
  List,
  RotateCcw,
  Settings,
  SlidersHorizontal,
} from "lucide-react";
import "./AcidBaseSolutionsPage.css";

const solveWeak = (c, k) => (-k + Math.sqrt(k * k + 4 * k * c)) / 2;
const makeData = (strong, c, k = 1.8e-5) => {
  const h = strong ? c : solveWeak(c, k);
  return { pH: -Math.log10(h), alpha: strong ? 1 : h / c, h };
};
function Particle({ kind, i }) {
  return (
    <i
      className={`ab-particle ${kind}`}
      style={{
        left: `${8 + ((i * 37) % 82)}%`,
        top: `${8 + ((i * 29) % 82)}%`,
      }}
    />
  );
}
function Beaker({ strong, data, indicator }) {
  const ions = strong ? 12 : 3;
  return (
    <article className={`ab-solution ${strong ? "strong" : "weak"} indicator-${indicator.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="ab-solution-head">
        <select defaultValue={strong ? "0.10 M HCl" : "0.10 M CH₃COOH"}>
          <option>{strong ? "0.10 M HCl" : "0.10 M CH₃COOH"}</option>
        </select>
        <b>{strong ? "Strong acid" : "Weak acid"}</b>
      </div>
      <div className="ab-ion">
        <span>Ionization</span>
        <strong>{(data.alpha * 100).toFixed(strong ? 0 : 1)}%</strong>
        <i>
          <em style={{ width: `${data.alpha * 100}%` }} />
        </i>
      </div>
      <div className="ab-apparatus">
        <div className="ab-meter">
          <small>pH</small>
          <b>{data.pH.toFixed(2)}</b>
        </div>
        <div className="ab-beaker">
          <div className="ab-liquid" aria-label={`${strong ? "strong" : "weak"} acid particle view`}>
            {Array.from({ length: 20 }, (_, i) => (
              <Particle key={"w" + i} kind="water" i={i} />
            ))}
            {Array.from({ length: ions }, (_, i) => (
              <Particle
                key={"i" + i}
                kind={
                  strong
                    ? i % 2
                      ? "chloride"
                      : "hydronium"
                    : i % 2
                      ? "acetate"
                      : "hydronium"
                }
                i={i + 22}
              />
            ))}
          </div>
          <span className="ab-probe left" />
          <span className="ab-probe right" />
        </div>
        <div className={`ab-bulb ${strong ? "on" : ""}`}>
          💡
          <b>
            Conductivity<small>{strong ? "High" : "Low"}</small>
          </b>
        </div>
      </div>
      <div className="ab-legend">
        <span>🔴 H₂O</span>
        <span>🟣 H₃O⁺</span>
        <span>{strong ? "🟢 Cl⁻" : "⚫ CH₃COOH"}</span>
      </div>
      <footer>
        {strong ? "HCl + H₂O → H₃O⁺ + Cl⁻" : "CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻"}
        <small>({strong ? "complete" : "partial"} ionization)</small>
      </footer>
    </article>
  );
}
export default function AcidBaseSolutionsPage() {
  const [c, setC] = useState(0.1),
    [ka, setKa] = useState(1.8e-5),
    [indicator, setIndicator] = useState("None"),
    [acidType, setAcidType] = useState("CH₃COOH (acetic acid)"),
    [view, setView] = useState("Molecular View"),
    [activeSide, setActiveSide] = useState("Compare solutions");
  const strong = useMemo(() => makeData(true, c), [c]),
    weak = useMemo(() => makeData(false, c, ka), [c, ka]);
  const selectedData = acidType.startsWith("HCl") ? strong : weak;
  const reset = () => {
    setC(0.1);
    setKa(1.8e-5);
    setIndicator("None");
    setAcidType("CH₃COOH (acetic acid)");
    setView("Molecular View");
  };
  return (
    <div className="ab-app">
      <header>
        <FlaskConical />
        <div>
          <h1>Acid–Base Solutions Lab</h1>
          <p>Explore ionization, pH, and conductivity at the molecular level</p>
        </div>
        <nav>
          {[
            [Atom, "Molecular View"],
            [BarChart3, "Chart View"],
            [List, "Table View"],
          ].map(([I, n]) => (
            <button
              key={n}
              className={view === n ? "active" : ""}
              onClick={() => setView(n)}
            >
              <I />
              {n}
            </button>
          ))}
          <button onClick={reset}>
            <RotateCcw />
            Reset
          </button>
        </nav>
      </header>
      <aside>
        {[
          [FlaskConical, "Compare solutions"],
          [BarChart3, "pH meter"],
          [FlaskConical, "Titration"],
          [Droplets, "Indicators"],
          [Atom, "Solubility"],
          [Atom, "Molecular view"],
          [BookOpen, "Theory"],
          [List, "Lab notes"],
        ].map(([I, n], i) => (
          <button key={n} className={activeSide === n ? "active" : ""} onClick={() => {
            setActiveSide(n);
            if (["pH meter", "Titration", "Theory"].includes(n)) setView("Chart View");
            if (["Molecular view", "Indicators", "Compare solutions"].includes(n)) setView("Molecular View");
            if (["Solubility", "Lab notes"].includes(n)) setView("Table View");
          }}>
            <I />
            {n}
          </button>
        ))}
        <p>
          ⚛<br />
          Small
          <br />
          Molecules
          <br />
          Big Questions™
        </p>
      </aside>
      <main>
        <div className="ab-title">
          <SlidersHorizontal />
          <h2>{activeSide}</h2>
          <span>
            Same concentration. Different strengths. See how ionization changes
            everything.
          </span>
          <b className="ab-selected-readout">Selected: {acidType} · pH {selectedData.pH.toFixed(2)}</b>
        </div>
        {view === "Chart View" && <section className="ab-view-panel"><h3>Chart view</h3><p>Compare pH and ionization as concentration changes. Strong acid: <b>{strong.pH.toFixed(2)}</b> · Weak acid: <b>{weak.pH.toFixed(2)}</b>.</p><div className="ab-chart-bars"><i style={{height:`${Math.max(10, strong.alpha*100)}%`}} /><i style={{height:`${Math.max(10, weak.alpha*100)}%`}} /></div></section>}
        {view === "Table View" && <section className="ab-view-panel"><h3>Species table</h3><table><thead><tr><th>Species</th><th>Concentration</th><th>Role</th></tr></thead><tbody><tr><td>H₃O⁺</td><td>{weak.h.toExponential(2)} M</td><td>Acidic ion</td></tr><tr><td>CH₃COOH</td><td>{(c-weak.h).toFixed(4)} M</td><td>Weak acid</td></tr><tr><td>CH₃COO⁻</td><td>{weak.h.toExponential(2)} M</td><td>Conjugate base</td></tr></tbody></table></section>}
        <section className="ab-compare">
          <Beaker strong data={strong} indicator={indicator} />
          <Beaker data={weak} indicator={indicator} />
        </section>
        <section className="ab-controls">
          <h2>
            <Settings />
            Solution controls
          </h2>
          <label>
            Concentration (M)<b>{c.toFixed(2)}</b>
            <input
              type="range"
              min=".001"
              max="1"
              step=".001"
              value={c}
              onChange={(e) => setC(+e.target.value)}
            />
            <small>0.001　　0.01　　 0.10　　　1.0</small>
          </label>
          <label>
            Acid / Base
            <select value={acidType} onChange={(e) => setAcidType(e.target.value)} aria-label="Acid or base selection">
              <option>CH₃COOH (acetic acid)</option>
              <option>HCl (hydrochloric acid)</option>
            </select>
          </label>
          <label>
            Acid strength (Kₐ)<b>{ka.toExponential(1)}</b>
            <input
              type="range"
              min=".000001"
              max=".01"
              step=".000001"
              value={ka}
              onChange={(e) => setKa(+e.target.value)}
            />
          </label>
          <label>
            Add indicator (3 drops)
            <select
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
            >
              <option>None</option>
              <option>Phenolphthalein</option>
              <option>Methyl orange</option>
            </select>
          </label>
        </section>
        <section className="ab-equilibrium">
          <h3>Ionization equation</h3>
          <p>CH₃COOH + H₂O ⇌ H₃O⁺ + CH₃COO⁻</p>
          <b>Kₐ = {ka.toExponential(1)}</b>
        </section>
        <section className="ab-pie">
          <h3>Species distribution ({c.toFixed(2)} M)</h3>
          <i style={{ "--ion": `${weak.alpha * 100 * 3.6}deg` }} />
          <div>
            <span>🔵 CH₃COOH　{((1 - weak.alpha) * 100).toFixed(1)}%</span>
            <span>🟣 CH₃COO⁻　{(weak.alpha * 100).toFixed(1)}%</span>
            <span>🔴 H₃O⁺　　 {(weak.alpha * 100).toFixed(1)}%</span>
          </div>
        </section>
        <section className="ab-ph">
          <h3>pH scale (25 °C)</h3>
          <div>
            <i />
            <mark style={{ left: `${(strong.pH / 14) * 100}%` }}>
              {strong.pH.toFixed(2)}
            </mark>
            <mark className="weak" style={{ left: `${(weak.pH / 14) * 100}%` }}>
              {weak.pH.toFixed(2)}
            </mark>
          </div>
          <span>0　 1　 2　 3　 4　 5　 6　 7　 8　 9　10　11　12　13　14</span>
          <footer>
            ← More acidic <b>Neutral</b> More basic →
          </footer>
        </section>
        <section className="ab-take">
          <h3>
            <Lightbulb />
            Key takeaways
          </h3>
          {[
            "Strong acids ionize 100% in water.",
            "Weak acids ionize partially (established by Kₐ).",
            "More ions → higher conductivity.",
            "Lower pH means higher [H₃O⁺].",
            "Same concentration, different behavior.",
          ].map((x) => (
            <p key={x}>✓ {x}</p>
          ))}
        </section>
      </main>
    </div>
  );
}
