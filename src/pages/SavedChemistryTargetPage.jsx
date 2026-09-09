import { useMemo, useState } from "react";
import {
  Atom,
  BookMarked,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Home,
  Library,
  Network,
  Play,
  Search,
  Settings,
  Star,
  Users,
} from "lucide-react";
import "./savedChemistryTarget.css";
const items = [
  [
    "Benzene",
    "Molecule",
    "C₆H₆",
    "Aromaticity · Organic · Ring Systems",
    80,
    "2 days ago",
    "benzene",
  ],
  [
    "Aspirin",
    "Molecule",
    "C₉H₈O₄",
    "Analgesic · Ester · Medicinal Chemistry",
    65,
    "5 hours ago",
    "aspirin",
  ],
  [
    "Cisplatin",
    "Molecule",
    "Pt(NH₃)₂Cl₂",
    "Coordination · Anticancer · Inorganic",
    55,
    "1 day ago",
    "cisplatin",
  ],
  [
    "Titration Curve",
    "Experiment",
    "pH vs volume",
    "Acid–Base · pH · Quantitative",
    75,
    "3 days ago",
    "curve",
  ],
  [
    "Crystal Lattice",
    "Experiment",
    "NaCl lattice",
    "Solid State · X-ray Diffraction",
    60,
    "4 days ago",
    "lattice",
  ],
  [
    "Sₙ2",
    "Reaction",
    "Nu⁻ + R–Br",
    "Nucleophilic · Kinetics · Stereochemistry",
    70,
    "2 days ago",
    "sn2",
  ],
  [
    "Aldol Condensation",
    "Reaction",
    "C–C formation",
    "Enolate · Carbonyl · Dehydration",
    50,
    "1 day ago",
    "aldol",
  ],
];
const nav = [
  ["dashboard", "Home", Home],
  ["dashboard", "Explore", Atom],
  ["physical-simulators", "Simulations", FlaskConical],
  ["organic-mechanisms", "Reactions", Network],
  ["molecule", "Molecules", Atom],
  ["study-tools", "Lab Notebook", ClipboardList],
  ["favorites", "Saved Chemistry", BookMarked],
  ["quiz", "Assessments", CheckCircle],
  ["learning-command", "Community", Users],
];
export const SavedChemistryTargetPage = ({ onNavigate }) => {
  const [selected, setSelected] = useState(items[1]),
    [filter, setFilter] = useState("All"),
    [query, setQuery] = useState("");
  const visible = useMemo(
    () =>
      items.filter(
        (x) =>
          (filter === "All" || x[1] === filter.slice(0, -1)) &&
          x[0].toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query],
  );
  return (
    <div className="savedchem">
      <header>
        <div>
          <Atom />
          <b>ChemVerse</b>
        </div>
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your saved chemistry…"
          />
        </label>
        <i>Small molecules. Big questions.</i>
        <span>JS⌄</span>
      </header>
      <aside className="sc-nav">
        {nav.map(([id, x, Icon]) => (
          <button
            className={x === "Saved Chemistry" ? "active" : ""}
            onClick={() => onNavigate(id)}
            key={x}
          >
            <Icon />
            {x}
          </button>
        ))}
        <blockquote>
          “Chemistry
          <br />
          turns curiosity
          <br />
          into a clearer world.”
          <br />
          ──<b>⚗</b>
        </blockquote>
      </aside>
      <main>
        <div className="sc-title">
          <h1>Saved Chemistry</h1>
          <p>Continue where curiosity paused</p>
        </div>
        <div className="sc-filters">
          {[
            ["All", 7],
            ["Molecules", 3],
            ["Experiments", 2],
            ["Reactions", 2],
            ["Notes", 0],
            ["Assessments", 0],
          ].map(([x, n]) => (
            <button
              className={filter === x ? "active" : ""}
              onClick={() => setFilter(x)}
              key={x}
            >
              {x} ({n})
            </button>
          ))}
          <span>Sort: Last opened　⌄</span>
        </div>
        <div className="sc-grid">
          {visible.map((x) => (
            <button
              className={`sc-card ${selected[0] === x[0] ? "selected" : ""}`}
              onClick={() => setSelected(x)}
              key={x[0]}
            >
              <div className={`sc-art ${x[6]}`}>{x[2]}</div>
              <em>{x[1]}</em>
              <h3>{x[0]}</h3>
              <p>{x[3]}</p>
              <small>
                Last position <b>{x[5]}</b>
              </small>
              <small>
                Mastery　
                <i style={{ "--p": `${x[4]}%` }} /> {x[4]}%
              </small>
              <footer>
                Resume exploration <ChevronRight />
              </footer>
            </button>
          ))}
        </div>
      </main>
      <aside className="sc-detail">
        <div className="sc-head">
          <em>{selected[1]}</em>
          <span>
            <Star /> Saved　•••
          </span>
          <h2>{selected[0]}</h2>
          <p>{selected[2]}</p>
        </div>
        <nav>
          {["3D View", "Properties", "Structure", "Uses", "Notes"].map(
            (x, i) => (
              <button className={i === 0 ? "active" : ""} key={x}>
                {x}
              </button>
            ),
          )}
        </nav>
        <div className={`sc-big ${selected[6]}`}>
          {selected[2]}
          <aside>
            <button>
              ⌾<small>Rotate</small>
            </button>
            <button>
              ⌁<small>Measure</small>
            </button>
            <button>
              A<small>Labels</small>
            </button>
            <button>
              ◇<small>View</small>
            </button>
          </aside>
        </div>
        <section>
          <h3>Measurement Tool</h3>
          <dl>
            <dt>O···O distance</dt>
            <dd>2.46 Å</dd>
            <dt>C=O bond length</dt>
            <dd>1.21 Å</dd>
            <dt>C–O bond length</dt>
            <dd>1.36 Å</dd>
          </dl>
        </section>
        <section>
          <h3>▣　My Note</h3>
          <p>
            Aspirin’s simple structure hides an elegant balance of reactivity
            and stability. Look again at the ester — a reminder that small
            changes can make a big difference in how molecules interact with the
            body.
          </p>
        </section>
        <button
          className="sc-resume"
          onClick={() =>
            onNavigate(selected[1] === "Experiment" ? "lab" : "molecule")
          }
        >
          <Play />
          Resume exploration
          <ChevronRight />
          <ChevronDown />
        </button>
      </aside>
    </div>
  );
};
export default SavedChemistryTargetPage;
