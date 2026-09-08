import { useMemo, useState } from "react";
import {
  BarChart3,
  Beaker,
  Check,
  Database,
  FlaskConical,
  Folder,
  Leaf,
  Network,
  Play,
  RotateCcw,
  Save,
  Settings,
  Wrench,
} from "lucide-react";
import "./ChemistryInventorTargetPage.css";

const groups = [
  "—OH　Hydroxyl",
  "—NH₂　Amine",
  ">C=O　Carbonyl",
  "⬡　Aromatic",
  "—COO—　Ester",
  "—O—　Ether",
  "—COOH　Carboxyl",
  "C=C　Alkene",
  "—CH₃　Methyl",
  "···　More groups",
  "—CH₂—　Methylene",
];
export default function ChemistryInventorTargetPage() {
  const [solubility, setSolubility] = useState("Medium"),
    [bio, setBio] = useState("High"),
    [melting, setMelting] = useState("50 – 80"),
    [selected, setSelected] = useState([
      "—COO—　Ester",
      "—OH　Hydroxyl",
      "—CH₃　Methyl",
    ]),
    [view, setView] = useState("3D"),
    [predicted, setPredicted] = useState(true),
    [running, setRunning] = useState(false),
    [temp, setTemp] = useState(78),
    [headerTool, setHeaderTool] = useState("Projects"),
    [sideSection, setSideSection] = useState("Molecule Design"),
    [propertyTab, setPropertyTab] = useState("Predicted Properties"),
    [cameraAction, setCameraAction] = useState("Rotate");
  const properties = useMemo(
    () => ({
      logS: selected.includes("—OH　Hydroxyl") ? -1.1 : -2.4,
      bio: selected.includes("—COO—　Ester") ? 12 : 30,
      mp: 62 + (selected.length - 3) * 4,
      score: Math.min(98, 70 + selected.length * 4),
    }),
    [selected],
  );
  const toggleGroup = (g) =>
    setSelected((items) =>
      items.includes(g) ? items.filter((x) => x !== g) : [...items, g],
    );
  return (
    <div className="ci-app">
      <header>
        <FlaskConical />
        <div>
          <h1>Chemistry Inventor Lab</h1>
          <p>Design • Simulate • Create a Greener Tomorrow</p>
        </div>
        <nav>
          <button className={headerTool === "Projects" ? "active" : ""} onClick={() => setHeaderTool("Projects")}>
            <Folder />
            Projects
          </button>
          <button className={headerTool === "Library" ? "active" : ""} onClick={() => setHeaderTool("Library")}>
            <Database />
            Library
          </button>
          <button className={headerTool === "Tools" ? "active" : ""} onClick={() => setHeaderTool("Tools")}>
            <Wrench />
            Tools⌄
          </button>
          <span>SC</span>
        </nav>
        <aside>
          <Leaf />
          <b>
            Small
            <br />
            Molecules
            <br />
            <strong>Big Impact</strong>
          </b>
        </aside>
      </header>
      <nav className="ci-side">
        {[
          [Network, "Molecule Design"],
          [FlaskConical, "Reaction Builder"],
          [BarChart3, "Property Prediction"],
          [Leaf, "Green Chemistry"],
          [Database, "Compound Library"],
          [Folder, "Saved Projects"],
        ].map(([Icon, label], i) => (
          <button key={label} className={sideSection === label ? "active" : ""} onClick={() => setSideSection(label)}>
            <Icon />
            {label}
          </button>
        ))}
        <p>
          ♧　Sustainable
          <br />　 Chemistry
          <br />　 for a Brighter
          <br />　 Tomorrow
        </p>
      </nav>
      <main>
        <section className="ci-title">
          <Network />
          <div>
            <h2>Design within constraints</h2>
            <p>
              Assemble your molecule using functional-group blocks. Real-time
              validation and property prediction.
            </p>
          </div>
        </section>
        <section className="ci-design">
          <div className="ci-left">
            <article>
              <h3>◎　Target Constraints</h3>
              <label>
                💧 Water solubility
                <select
                  value={solubility}
                  onChange={(e) => setSolubility(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <label>
                🌿 Biodegradability
                <select value={bio} onChange={(e) => setBio(e.target.value)}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>
              <label>
                🌡 Melting point (°C)
                <select
                  value={melting}
                  onChange={(e) => setMelting(e.target.value)}
                >
                  <option>20 – 50</option>
                  <option>50 – 80</option>
                  <option>80 – 120</option>
                </select>
              </label>
              <label>
                ⊘ Exclude elements
                <select>
                  <option>Halogens (F, Cl, Br, I)</option>
                </select>
              </label>
              <p>
                ⓘ　Design a biodegradable ester monomer without halogens, with
                balanced solubility and melting point for sustainable polymers.
              </p>
            </article>
            <article className="ci-groups">
              <h3>Functional Group Blocks</h3>
              {groups.map((g) => (
                <button
                  key={g}
                  className={selected.includes(g) ? "active" : ""}
                  onClick={() => toggleGroup(g)}
                >
                  {g}
                </button>
              ))}
            </article>
          </div>
          <article className="ci-viewer">
            <header>
              <h3>
                <Check /> Molecular validity: passed
              </h3>
              <p>
                The structure is chemically valid and satisfies all constraints.
              </p>
              <nav>
                {["2D", "3D", "Surface"].map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={view === v ? "active" : ""}
                  >
                    {v}
                  </button>
                ))}
              </nav>
            </header>
            <Molecule model={view} />
            <h4>Lactic acid ethyl ester (Ethyl lactate)　✎</h4>
            <p>C₅H₁₀O₃　　MW: 118.13 g/mol</p>
            <footer>
              ● C　Carbon　　<span>● O　Oxygen</span>　　<i>● H　Hydrogen</i>
            </footer>
            <aside>
              <button className={cameraAction === "Rotate" ? "active" : ""} onClick={() => setCameraAction("Rotate")}>
                ◉<small>Rotate</small>
              </button>
              <button className={cameraAction === "Zoom" ? "active" : ""} onClick={() => setCameraAction("Zoom")}>
                ⌕<small>Zoom</small>
              </button>
              <button className={cameraAction === "Pan" ? "active" : ""} onClick={() => setCameraAction("Pan")}>
                ♧<small>Pan</small>
              </button>
              <button className={cameraAction === "Reset" ? "active" : ""} onClick={() => { setCameraAction("Reset"); setView("3D"); }}>
                <RotateCcw />
                <small>Reset</small>
              </button>
            </aside>
          </article>
          <div className="ci-properties">
            <header>
              <h2>
                <FlaskConical /> Test properties
              </h2>
              <button onClick={() => setPredicted(true)}>
                ▥ Run Prediction
              </button>
            </header>
            <article className="ci-table">
              <nav>
                {["Predicted Properties", "Group Contributions", "Safety & Feasibility"].map((name) => <button key={name} className={propertyTab === name ? "active" : ""} onClick={() => setPropertyTab(name)}>{name}</button>)}
              </nav>
              <table>
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Predicted Value</th>
                    <th>Confidence (95%)</th>
                    <th>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "💧 Water solubility (logS)",
                      properties.logS,
                      "[-1.6, -0.6]",
                      solubility,
                    ],
                    [
                      "🌿 Biodegradability (half-life, days)",
                      properties.bio,
                      "[8, 20]",
                      bio,
                    ],
                    [
                      "🌡 Melting point (°C)",
                      properties.mp,
                      "[54, 70]",
                      melting,
                    ],
                    ["🌡 Boiling point (°C)", 154, "[148, 161]", "—"],
                    ["♧ Density (g/cm³)", 1.03, "[0.99, 1.07]", "—"],
                    ["🍃 logP (hydrophobicity)", -0.4, "[-0.7, -0.1]", "—"],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td>{r[0]}</td>
                      <td>{predicted ? r[1] : "—"}</td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
            <article className="ci-contrib">
              <h3>Functional group contributions</h3>
              <p>
                Ester (—COO—) <i style={{ width: "70%" }} /> + Solubility　{" "}
                <b>+ Biodegradability</b>
              </p>
              <p>
                Hydroxyl (—OH) <i style={{ width: "30%" }} /> + Solubility　 +
                H-bonding
              </p>
              <p>
                Methyl (—CH₃) <i style={{ width: "18%" }} /> − Melting point　 +
                Hydrophobicity
              </p>
            </article>
            <article className="ci-safety">
              <h3>Safety &amp; synthesis feasibility</h3>
              <p>
                ✅ No restricted elements (halogens)　　　✅ Synthesis
                feasibility: <b>High</b>
                <br />✅ No high-alert structural alerts　　　　 ✅ Estimated
                cost: Low
                <br />✅ Predicted low toxicity (Ames: negative)　 Commercial
                precursors: Available
              </p>
            </article>
          </div>
        </section>
        <section className="ci-synthesis">
          <h2>
            <FlaskConical /> Simulate synthesis{" "}
            <small>
              Build a synthetic route, set conditions, and evaluate
              sustainability.
            </small>
          </h2>
          <article>
            <h3>Reaction scheme</h3>
            <div className="ci-reaction">
              HO—CH(CH₃)—COOH　 +　 HO—CH₂—CH₃　{" "}
              <b>
                H₂SO₄ (cat.)
                <br />
                reflux, 78 °C →
              </b>
              　 CH₃—CH(OH)—COO—CH₂CH₃　 +　 H₂O
            </div>
          </article>
          <article>
            <h3>Reaction conditions</h3>
            <label>
              Catalyst <input value="H₂SO₄ (cat.)" readOnly />
            </label>
            <label>
              Temperature{" "}
              <input
                aria-label="Reaction temperature"
                type="number"
                value={temp}
                onChange={(e) => setTemp(Number(e.target.value))}
              />{" "}
              °C
            </label>
            <label>
              Time <input value="4 – 6 h" readOnly />
            </label>
            <label>
              Solvent{" "}
              <select>
                <option>None (neat)</option>
              </select>
            </label>
          </article>
          <article className="ci-metrics">
            <h3>
              <Leaf /> Sustainability metrics
            </h3>
            <p>
              Atom economy <b>87%</b>
              <i style={{ width: "87%" }} />
            </p>
            <p>
              E-factor <b>0.15</b>
              <i style={{ width: "15%" }} />
            </p>
            <p>
              Green chemistry score <b>{properties.score} / 100</b>
              <i style={{ width: `${properties.score}%` }} />
            </p>
            <button onClick={() => setRunning((v) => !v)}>
              <Play />
              {running ? "Simulation complete" : "Run Simulation"}
            </button>
          </article>
        </section>
      </main>
    </div>
  );
}
function Molecule({ model }) {
  const atoms = [
    ["C", 45, 43],
    ["C", 38, 62],
    ["C", 50, 72],
    ["O", 55, 87],
    ["O", 63, 77],
    ["C", 72, 65],
    ["C", 80, 52],
    ["O", 46, 88],
  ];
  return (
    <div className={`ci-molecule ${model.toLowerCase()}`}>
      {atoms.map(([a, x, y], i) => (
        <i key={i} className={a} style={{ left: `${x}%`, top: `${y}%` }}>
          {a}
        </i>
      ))}
    </div>
  );
}
