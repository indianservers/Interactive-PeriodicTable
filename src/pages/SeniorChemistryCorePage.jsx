import { useMemo, useState } from "react";
import {
  Atom,
  BookOpen,
  Calculator,
  Check,
  FlaskConical,
  Home,
  Search,
  Wrench,
} from "lucide-react";
import "./seniorChemistryCoreTarget.css";

const concepts = [
  ["⚛", "Quantum Model", "Orbitals, electron configuration", "blue"],
  [
    "⌬",
    "Chemical Bonding",
    "Ionic, covalent, metallic, intermolecular",
    "teal",
  ],
  ["△", "Thermodynamics", "Enthalpy, entropy, Gibbs free energy", "gold"],
  ["⇄", "Equilibrium", "Dynamic systems, Kc, Kp", "violet"],
  ["▣", "Electrochemistry", "Redox, cell potential, electrolysis", "cyan"],
  ["⌁", "Kinetics", "Rates, mechanisms, activation energy", "pink"],
  ["⬡", "Organic Mechanisms", "Reaction pathways, arrow pushing", "green"],
];
const chapters = [
  ["Atomic Structure", 100],
  ["Periodicity", 90],
  ["Chemical Bonding", 100],
  ["Energetics", 78],
  ["Equilibrium", 72],
  ["Electrochemistry", 60],
  ["Reaction Kinetics", 48],
  ["Organic Chemistry", 40],
];

export const SeniorChemistryCorePage = () => {
  const [active, setActive] = useState(4),
    [cu, setCu] = useState(1),
    [zn, setZn] = useState(1),
    [trace, setTrace] = useState(true),
    [logScale, setLogScale] = useState(true),
    [opened, setOpened] = useState(false),
    [navItem, setNavItem] = useState("Concept Map"),
    [query, setQuery] = useState(""),
    [formulaVisible, setFormulaVisible] = useState(true),
    [potentialsVisible, setPotentialsVisible] = useState(false),
    [notice, setNotice] = useState("");
  const potential = useMemo(
    () => 1.1 - 0.0296 * Math.log10(Math.max(0.0001, zn / cu)),
    [cu, zn],
  );
  const markerX = 82 + 365 * ((Math.log10(Math.max(0.0001, cu)) + 4) / 4),
    markerY = 154 - (potential - 0.5) * 112;
  const announce = (message) => setNotice(message);
  return (
    <div className="scc-app">
      <header>
        <FlaskConical />
        <div>
          <h1>Senior Chemistry Core</h1>
          <p>Explore　•　Connect　•　Apply</p>
        </div>
        <label>
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search concepts, reactions, practicals..." />
        </label>
        <button onClick={() => announce("Notebook opened")}>
          <BookOpen /> Notebook
        </button>
        <button onClick={() => announce("Calculator opened")}>
          <Calculator /> Calculator
        </button>
        <button onClick={() => announce("Resources opened")}>⬡ Resources</button>
        <b>JS</b>
        <i>
          Higher understanding.
          <br />A brighter tomorrow.
        </i>
      </header>
      <aside>
        {[
          [Home, "Home"],
          [Atom, "Concept Map"],
          [BookOpen, "Course"],
          [FlaskConical, "Practicals"],
          [BookOpen, "Revision"],
          [BookOpen, "Past Papers"],
          [Wrench, "Tools"],
        ].map(([I, n]) => (
          <button className={navItem === n ? "active" : ""} key={n} onClick={() => { setNavItem(n); announce(`${n} selected`); }}>
            <I />
            {n}
          </button>
        ))}
        <p>
          “Chemistry explains
          <br />
          the world around us.”
        </p>
        <footer>
          ⬡
          <span>
            Atoms
            <br />
            Ideas
            <br />A better future
          </span>
        </footer>
      </aside>
      <main>
        <nav className="scc-concepts">
          {concepts.filter((c) => `${c[1]} ${c[2]}`.toLowerCase().includes(query.toLowerCase())).map((c, i) => (
            <button
              key={c[1]}
              className={`${c[3]} ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              <strong>{c[0]}</strong>
              <b>{c[1]}</b>
              <span>{c[2]}</span>
            </button>
          ))}
        </nav>
        <section className="scc-left">
          <article className="scc-progress">
            <header>
              <h2>Course Progress</h2>
              <small>Year 12–13</small>
            </header>
            {chapters.map((c, i) => (
              <div className={i === 5 ? "active" : ""} key={c[0]}>
                <span>
                  {i + 1}.　{c[0]}
                </span>
                <i>
                  <b style={{ width: `${c[1]}%` }} />
                </i>
                <em>{c[1]}%</em>
              </div>
            ))}
            <p>
              6.1　Redox Reactions <Check />
            </p>
            <p>
              6.2　Cell Potential <Check />
            </p>
            <p>6.3　Electrolysis　○</p>
            <p>6.4　Applications　○</p>
          </article>
          <article className="scc-upcoming">
            <header>
              <h2>Upcoming</h2>
              <a onClick={() => announce("All upcoming practicals displayed")}>View all</a>
            </header>
            <div>
              <FlaskConical />
              <p>
                <b>Electrochemistry Practical</b>
                <span>Thu, 24 Apr</span>
                <small>
                  Investigate cell potentials using different electrode
                  combinations.
                </small>
              </p>
            </div>
            <button onClick={() => setOpened(!opened)}>
              {opened ? "Practical opened" : "Open practical"}　→
            </button>
          </article>
        </section>
        <section className="scc-cell">
          <header>
            <div>
              <small>Electrochemistry</small>
              <h2>Zn–Cu Galvanic Cell</h2>
              <p>
                Interactive 3D model – explore the flow of electrons and ions
              </p>
            </div>
            <button
              onClick={() => {
                setCu(1);
                setZn(1);
              }}
            >
              ↻ Reset
            </button>
            <button
              className={trace ? "on" : ""}
              onClick={() => setTrace(!trace)}
            >
              Trace electron flow　
              <span />
            </button>
          </header>
          <div className="cell-scene">
            <div className={`wire ${trace ? "tracing" : ""}`}>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="bulb">💡</div>
            <b className="electron">e⁻　　　　　　　　→　　　　　　　　e⁻</b>
            <div className="bridge">
              Salt bridge (KNO₃)<span>K⁺ →　　　← NO₃⁻</span>
            </div>
            <div className="beaker zinc">
              <label>−</label>
              <i />
              <strong>Zn</strong>
              <span>Zn²⁺(aq)</span>
              <small>
                Anode
                <br />
                (oxidation)
              </small>
            </div>
            <div className="beaker copper">
              <label>+</label>
              <i />
              <strong>Cu</strong>
              <span>Cu²⁺(aq)</span>
              <small>
                Cathode
                <br />
                (reduction)
              </small>
            </div>
            <p className="zn-eq">Zn(s) → Zn²⁺(aq) + 2e⁻</p>
            <p className="cu-eq">Cu²⁺(aq) + 2e⁻ → Cu(s)</p>
            <output>
              E°<sub>cell</sub> = {potential.toFixed(2)} V
            </output>
          </div>
        </section>
        <aside className="scc-formula">
          <article>
            <header>
              <h2>Key Formulae</h2>
              <a onClick={() => setFormulaVisible((v) => !v)}>{formulaVisible ? "Hide⌄" : "Show⌄"}</a>
            </header>
            {formulaVisible && <div>
              <b>Cell potential (standard)</b>
              <p>
                E°<sub>cell</sub> = E°<sub>cathode</sub> − E°<sub>anode</sub>
              </p>
            </div>}
            <div>
              <b>Nernst equation</b>
              <p>
                E = E° − <sup>RT</sup>⁄<sub>nF</sub> ln Q　= E° −{" "}
                <sup>0.0592</sup>⁄<sub>n</sub> log₁₀ Q
              </p>
            </div>
            <div>
              <b>Gibbs free energy</b>
              <p>ΔG = −nFE　　　　ΔG° = −nFE°</p>
            </div>
            <div>
              <b>Faraday's laws</b>
              <p>Q = It　　　　　 n = Q/Fz</p>
            </div>
          </article>
          <article>
            <header>
              <h3>Standard electrode potentials (298 K)</h3>
              <a onClick={() => { setPotentialsVisible((v) => !v); announce(potentialsVisible ? "Standard potential list collapsed" : "Standard potential list expanded"); }}>{potentialsVisible ? "Hide" : "Show all"}</a>
            </header>
            <p>Zn²⁺ + 2e⁻ → Zn　　−0.76 V</p>
            <p>Cu²⁺ + 2e⁻ → Cu　　+0.34 V</p>
            {potentialsVisible && <p>Ag⁺ + e⁻ → Ag　　+0.80 V</p>}
          </article>
          <article className="scc-evidence">
            <h2>Evidence & Observations</h2>
            {[
              "Zinc electrode loses mass (oxidation)",
              "Blue colour of Cu²⁺ solution fades",
              "Copper metal deposits on cathode",
              "Voltmeter reads ~1.10 V (standard conditions)",
              "Ions migrate through salt bridge to maintain charge balance",
            ].map((x) => (
              <p key={x}>✓　{x}</p>
            ))}
            <small>
              Real-world applications　　🔋 Batteries and portable power
            </small>
          </article>
        </aside>
        <section className="scc-graph">
          <article>
            <header>
              <h2>Cell Potential vs Concentration</h2>
              <span>
                E = {potential.toFixed(2)} V<br />
                (at {cu.toFixed(2)} M)
              </span>
            </header>
            <svg viewBox="0 0 500 185">
              <g className="grid">
                <path d="M82 25V154H455M82 50H455M82 76H455M82 102H455M82 128H455M155 25V154M228 25V154M301 25V154M374 25V154M447 25V154" />
              </g>
              <path
                className="curve"
                d="M82 132 C155 122 228 108 301 93 S405 76 447 69"
              />
              <circle cx={markerX} cy={markerY} r="6" />
              <text x="63" y="158">
                0.50
              </text>
              <text x="63" y="130">
                0.70
              </text>
              <text x="63" y="104">
                0.90
              </text>
              <text x="63" y="78">
                1.10
              </text>
              <text x="63" y="52">
                1.30
              </text>
              <text x="75" y="174">
                10⁻⁴
              </text>
              <text x="218" y="174">
                10⁻²
              </text>
              <text x="435" y="174">
                10⁰
              </text>
            </svg>
            <p>Concentration of Cu²⁺ (mol L⁻¹)</p>
          </article>
          <aside>
            <h2>Controls</h2>
            <label>
              [Cu²⁺] (mol L⁻¹)<output>{cu.toFixed(2)}</output>
              <input
                aria-label="Copper concentration"
                type="range"
                min=".01"
                max="2"
                step=".01"
                value={cu}
                onChange={(e) => setCu(+e.target.value)}
              />
            </label>
            <label>
              [Zn²⁺] (mol L⁻¹)<output>{zn.toFixed(2)}</output>
              <input
                aria-label="Zinc concentration"
                type="range"
                min=".01"
                max="2"
                step=".01"
                value={zn}
                onChange={(e) => setZn(+e.target.value)}
              />
            </label>
            <button
              className={logScale ? "on" : ""}
              onClick={() => setLogScale(!logScale)}
            >
              ✓　Log scale (x-axis)
            </button>
          </aside>
        </section>
      </main>
      {notice && <div className="scc-notice" role="status">{notice}</div>}
    </div>
  );
};
export default SeniorChemistryCorePage;
