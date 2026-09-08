import { useMemo, useState } from "react";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CircleHelp,
  FlaskConical,
  Folder,
  HelpCircle,
  Home,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import "./DrugDiscoveryTargetPage.css";

const candidates = [
  [-8.7, "C-17", "lead"],
  [-8.1, "C-17a", "+0.3 logP"],
  [-8.4, "C-17b", "+F (↑ potency)"],
  [-7.9, "C-17c", "+Me (↑ logP)"],
  [-8.2, "C-17d", "+OMe"],
  [-7.1, "C-17e", "+Cl"],
  [-6.8, "C-17f", "+CF₃"],
  [-8.0, "C-17g", "+NH₂"],
];
export default function DrugDiscoveryTargetPage() {
  const [selected, setSelected] = useState(0),
    [tab, setTab] = useState("2D Structure"),
    [interactions, setInteractions] = useState(true),
    [optimized, setOptimized] = useState(false),
    [adme, setAdme] = useState(false),
    [section, setSection] = useState("Drug Discovery"),
    [surface, setSurface] = useState("Surface"),
    [renderStyle, setRenderStyle] = useState("Cartoon"),
    [analysis, setAnalysis] = useState("SAR comparison"),
    [notice, setNotice] = useState("");
  const c = candidates[selected],
    score = (c[0] - (optimized ? 0.3 : 0)).toFixed(1),
    props = useMemo(
      () => ({
        mw: 342.4 + selected * 3.2,
        logp: (2.1 + selected * 0.12).toFixed(1),
        hbd: selected === 7 ? 3 : 2,
        hba: selected === 5 ? 5 : 6,
      }),
      [selected],
    );
  return (
    <div className="dd-app">
      <header>
        <Network />
        <div>
          <h1>Drug Discovery Studio</h1>
          <p>From molecules to better medicines</p>
        </div>
        <label>
          <Search />
          <input placeholder="Search targets, molecules, or projects..." />
        </label>
        <nav>
          <button onClick={() => setSection("Projects")}>
            <Folder />
            Projects
          </button>
          <button onClick={() => setSection("Help")}>
            <HelpCircle />
            Help
          </button>
          <span>EP</span>
          <b>
            Dr. Elena Park<small>Medicinal Chemistry</small>
          </b>
        </nav>
      </header>
      <aside>
        {[
          [Home, "Home"],
          [FlaskConical, "Drug Discovery"],
          [Settings, "Targets"],
          [Search, "Screening"],
          [Network, "Molecular Design"],
          [Beaker, "ADME & PK"],
          [ShieldCheck, "Safety & Toxicity"],
          [BarChart3, "Data & Analytics"],
          [BookOpen, "Notebooks"],
          [Users, "Team"],
          [Settings, "Settings"],
        ].map(([I, n], i) => (
          <button className={section === n || (i === 1 && section === "Drug Discovery") ? "active" : ""} key={n} onClick={() => setSection(n)}>
            <I />
            {n}
          </button>
        ))}
        <p>
          Better science
          <br />
          Healthier tomorrow
        </p>
      </aside>
      <main>
        <section className="dd-pocket">
          <header>
            <h2>COX-2 binding pocket</h2>
            <p>PDB: 5IKR　 Human Cyclooxygenase-2　 Resolution: 2.3 Å</p>
          </header>
          <div className="dd-surface">
            <div className="dd-ligand">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            {interactions && (
              <div className="dd-lines">
                Tyr385　┈┈　Ser530
                <br />
                <br />
                Arg120　┈┈┈┈┈　His90
                <br />
                <br />
                　　　　　　　　　Leu384
              </div>
            )}
          </div>
          <footer>
            <button onClick={() => setInteractions((v) => !v)}>
              ◉ Show interactions
            </button>
            <select value={surface} onChange={(e) => setSurface(e.target.value)}>
              <option>Surface</option>
              <option>Mesh</option>
            </select>
            <button className={renderStyle === "Cartoon" ? "active" : ""} onClick={() => setRenderStyle("Cartoon")}>Cartoon</button>
            <button className={renderStyle === "Sticks" ? "active" : ""} onClick={() => setRenderStyle("Sticks")}>Sticks</button>
            <button onClick={() => setNotice("Pocket view reset")}>↻ Reset view</button>
            <button onClick={() => setNotice("Expanded pocket view")}>⛶</button>
          </footer>
        </section>
        <section className="dd-lead">
          <header>
            <h2>Lead candidate {c[1]}</h2>
            <p>A selective COX-2 inhibitor (virtual)</p>
            <span>Active project</span>
          </header>
          <nav>
            {["2D Structure", "3D Conformer", "Properties"].map((n) => (
              <button
                className={tab === n ? "active" : ""}
                onClick={() => setTab(n)}
                key={n}
              >
                {n}
              </button>
            ))}
          </nav>
          <div
            className={`dd-structure ${tab.startsWith("3D") ? "three" : ""}`}
          >
            <b>
              O　　O
              <br /> ╲　 ╱<br />
              　S—NH—⬡
              <br /> ╱　 ╲<br />
              O　　　⬡—COOH
            </b>
          </div>
          <div className="dd-smiles">
            <button onClick={() => setNotice("Structure editor ready for C-17")}>✎ Edit structure</button>
            <span>SMILES　O=C(O)c1ccc(NC(=O)S(=O)...</span>
          </div>
          <footer>
            <button className="primary" onClick={() => setOptimized(true)}>
              ✣ {optimized ? "Lead optimized" : "Optimize lead"}
            </button>
            <button onClick={() => setNotice("Redocking completed")}>↻ Redock</button>
            <button onClick={() => setNotice("Mutation preview: para-fluoro analog")}>⌘ Mutate group</button>
            <button onClick={() => setNotice(`Docking score ${score} kcal/mol reflects the current analog`) }>💡 Explain score</button>
          </footer>
        </section>
        <section className="dd-right">
          <article className="dd-props">
            <h2>Molecular properties</h2>
            <Radar selected={selected} />
            <dl>
              <dt>Molecular weight (MW)</dt>
              <dd>{props.mw.toFixed(1)}</dd>
              <dt>cLogP</dt>
              <dd>{props.logp}</dd>
              <dt>H-bond donors (HBD)</dt>
              <dd>{props.hbd}</dd>
              <dt>H-bond acceptors (HBA)</dt>
              <dd>{props.hba}</dd>
              <dt>Lipinski rule of 5</dt>
              <dd className="pass">Pass ✓</dd>
              <dt>Docking score (COX-2)</dt>
              <dd>{score} kcal/mol</dd>
              <dt>Toxicity alert</dt>
              <dd className="pass">None ✓</dd>
            </dl>
          </article>
          <article className="dd-adme">
            <h2>
              ADME &amp; developability{" "}
              <button onClick={() => setAdme(true)}>Run ADME</button>
            </h2>
            <dl>
              <dt>Aqueous solubility (ESOL)</dt>
              <dd>{adme ? "−4.2 (moderate)" : "—"}</dd>
              <dt>Human intestinal absorption</dt>
              <dd>{adme ? "92% (high)" : "—"}</dd>
              <dt>Plasma protein binding</dt>
              <dd>{adme ? "94% (high)" : "—"}</dd>
              <dt>CYP3A4 inhibition</dt>
              <dd>No</dd>
              <dt>hERG risk</dt>
              <dd>Low</dd>
              <dt>Metabolic stability (HLM)</dt>
              <dd>t½ 2.8 h</dd>
              <dt>Overall profile</dt>
              <dd className="pass">Favorable</dd>
            </dl>
          </article>
        </section>
        <section className="dd-analogs">
          <header>
            <h2>Analog series (8)</h2>
            <button className={analysis === "SAR comparison" ? "active" : ""} onClick={() => setAnalysis("SAR comparison")}>SAR comparison</button>
            <button className={analysis === "Activity cliff analysis" ? "active" : ""} onClick={() => setAnalysis("Activity cliff analysis")}>Activity cliff analysis</button>
            <select>
              <option>Sort by　Activity (high → low)</option>
            </select>
          </header>
          <div>
            {candidates.map((item, i) => (
              <button
                key={item[1]}
                className={selected === i ? "active" : ""}
                onClick={() => {
                  setSelected(i);
                  setOptimized(false);
                }}
              >
                <span>
                  O═S—NH—⬡
                  <br />
                  　│　　COOH
                </span>
                <b>{item[1]}</b>
                <strong>{item[0]} kcal/mol</strong>
                <small>{item[2]}</small>
              </button>
            ))}
          </div>
        </section>
        <footer>
          Design. Predict. Understand. Accelerate.
          <span>Small molecules. A healthier world.　♧</span>
        </footer>
        {notice && <div className="dd-notice" role="status">{notice}</div>}
      </main>
    </div>
  );
}
function Radar({ selected }) {
  const d = selected * 3;
  return (
    <svg viewBox="0 0 300 220">
      <path
        className="grid"
        d="M150 20L245 75L245 155L150 205L55 155L55 75Z M150 55L210 88L210 142L150 172L90 142L90 88Z"
      />
      <path
        className="range"
        d="M150 43L230 82L220 148L150 185L73 145L80 88Z"
      />
      <path
        className="value"
        d={`M150 ${55 - d}L${215 + d} 92L205 142L150 174L82 144L92 92Z`}
      />
      <text x="135" y="13">
        Lipophilicity
      </text>
      <text x="248" y="75">
        Size
      </text>
      <text x="248" y="165">
        Polarity
      </text>
      <text x="130" y="218">
        Solubility
      </text>
      <text x="5" y="165">
        Flexibility
      </text>
      <text x="5" y="75">
        TPSA
      </text>
    </svg>
  );
}
