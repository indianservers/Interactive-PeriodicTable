import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  Atom,
  BookOpen,
  Boxes,
  Columns3,
  Database,
  Dna,
  FlaskConical,
  GraduationCap,
  Import,
  Menu,
  Microscope,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Search,
  Settings2,
  Waves,
  X,
} from "lucide-react";
import MolecularViewer from "./MolecularViewer.jsx";
import "./nucleicAcidExplorer.css";

const WorkspaceRouter = lazy(() => import("./WorkspacePages.jsx"));

const routes = [
  ["", "Home", Dna],
  ["molecules", "Molecules", Database],
  ["nucleotide-builder", "Nucleotide Builder", FlaskConical],
  ["sequences", "Sequences", Waves],
  ["replication", "Replication", Play],
  ["transcription", "Transcription", Atom],
  ["comparative", "Comparative View", Columns3],
  ["gallery", "3D Gallery", Boxes],
  ["learn", "Learn", BookOpen],
  ["quizzes", "Quizzes", GraduationCap],
];

const structures = {
  B: {
    id: "1BNA",
    name: "B-DNA dodecamer",
    detail: "Dickerson–Drew dodecamer",
    resolution: "1.90 Å",
    bp: "12 bp",
    form: "Right-handed",
    method: "X-ray diffraction",
    sequence: "CGCGAATTCGCG",
  },
  A: {
    id: "1ANA",
    name: "A-DNA tetramer",
    detail: "d(CCGG) duplex",
    resolution: "2.00 Å",
    bp: "4 bp",
    form: "Right-handed",
    method: "X-ray diffraction",
    sequence: "CCGG",
  },
  Z: {
    id: "4OCB",
    name: "Z-DNA dodecamer",
    detail: "d(CGCGCGCGCGCG)₂",
    resolution: "0.75 Å",
    bp: "12 bp",
    form: "Left-handed",
    method: "X-ray diffraction",
    sequence: "CGCGCGCGCGCG",
  },
};

const rnaStructure = {
  id: "2KOC",
  name: "RNA hairpin",
  detail: "14-mer cUUCGg tetraloop",
  resolution: "Solution NMR",
  bp: "14 nt",
  form: "Folded RNA",
  method: "Solution NMR",
  sequence: "GGCACUUCGGUGCC",
};

const distance = (a, b) =>
  Math.hypot(...a.map((value, index) => value - b[index]));

const angle = (a, b, c) => {
  const u = a.map((value, index) => value - b[index]);
  const v = c.map((value, index) => value - b[index]);
  const dot = u.reduce((sum, value, index) => sum + value * v[index], 0);
  const denom = Math.hypot(...u) * Math.hypot(...v);
  return denom ? (Math.acos(Math.max(-1, Math.min(1, dot / denom))) * 180) / Math.PI : 0;
};

function routeFromPath() {
  const marker = "/nucleic-acid-explorer";
  const path = window.location.pathname;
  return path.startsWith(marker)
    ? path.slice(marker.length).replace(/^\//, "")
    : "";
}

export default function NucleicAcidExplorer() {
  const [route, setRoute] = useState(routeFromPath);
  const [acid, setAcid] = useState("DNA");
  const [form, setForm] = useState("B");
  const [representation, setRepresentation] = useState("Ball & stick");
  const [mobileNav, setMobileNav] = useState(false);
  const [search, setSearch] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem("nae-sidebar-collapsed") === "true",
  );
  const [selectedResidue, setSelectedResidue] = useState(4);
  const [inspectorTab, setInspectorTab] = useState("Residue Inspector");
  const [pickedAtoms, setPickedAtoms] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nae-settings")) || {
        showAxes: true,
        rememberPanels: true,
        reducedMotion: false,
      };
    } catch {
      return { showAxes: true, rememberPanels: true, reducedMotion: false };
    }
  });
  const structure = acid === "RNA" ? rnaStructure : structures[form];
  const homeSequence = structure.sequence;
  const currentAtom = pickedAtoms.at(-1);
  const measuredDistance =
    pickedAtoms.length >= 2
      ? distance(pickedAtoms.at(-2).coordinates, pickedAtoms.at(-1).coordinates)
      : null;
  const measuredAngle =
    pickedAtoms.length >= 3
      ? angle(
          pickedAtoms.at(-3).coordinates,
          pickedAtoms.at(-2).coordinates,
          pickedAtoms.at(-1).coordinates,
        )
      : null;
  const handleSelection = useCallback((atom) => {
    setPickedAtoms((items) => {
      const key = `${atom.chain}:${atom.residueNumber}:${atom.atom}`;
      const previous = items.at(-1);
      const previousKey = previous && `${previous.chain}:${previous.residueNumber}:${previous.atom}`;
      return key === previousKey ? items : [...items.slice(-2), atom];
    });
    if (atom.residueNumber) setSelectedResidue(atom.residueNumber);
    setInspectorTab("Residue Inspector");
  }, []);

  useEffect(() => {
    localStorage.setItem("nae-settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const onPop = () => setRoute(routeFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const go = (next, params) => {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    const path = `/nucleic-acid-explorer${next ? `/${next}` : ""}${queryString}`;
    window.history.pushState({}, "", path);
    setRoute(next);
    setMobileNav(false);
    setSettingsOpen(false);
    window.requestAnimationFrame(() =>
      document.querySelector(".nae-workspace")?.scrollTo(0, 0),
    );
  };

  return (
    <div className={`nae-app ${settings.reducedMotion ? "reduce-motion" : ""}`}>
      <header className="nae-topbar">
        <button
          className="nae-icon-button nae-mobile-only"
          onClick={() => setMobileNav(true)}
          aria-label="Open navigation"
        >
          <Menu />
        </button>
        <button className="nae-brand" onClick={() => go("")}>
          <Dna />
          <span>
            <strong>Nucleic Acid Explorer</strong>
            <small>STRUCTURE · SEQUENCE · MECHANISM</small>
          </span>
        </button>
        <label className="nae-global-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && search.trim()) go("molecules", { q: search.trim() });
            }}
            placeholder="Search PDB IDs, sequences, genes, or topics…"
          />
          <kbd>↵</kbd>
        </label>
        <div className="nae-mode" aria-label="Molecule mode">
          {["DNA", "RNA"].map((value) => (
            <button
              key={value}
              className={acid === value ? "active" : ""}
              onClick={() => {
                setAcid(value);
                setPickedAtoms([]);
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <button className="nae-top-action" onClick={() => go("molecules")}>
          <Import size={17} /> Import
        </button>
        <button
          className="nae-icon-button"
          title="Settings"
          onClick={() => setSettingsOpen((x) => !x)}
        >
          <Settings2 size={18} />
        </button>
        {settingsOpen && (
          <div className="nae-settings-popover">
            <strong>Viewer preferences</strong>
            <label>
              <input
                type="checkbox"
                checked={settings.showAxes}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, showAxes: e.target.checked }))
                }
              /> Show annotations and scale
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.rememberPanels}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, rememberPanels: e.target.checked }))
                }
              /> Remember panel state
            </label>
            <label>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) =>
                  setSettings((s) => ({ ...s, reducedMotion: e.target.checked }))
                }
              /> Reduced motion
            </label>
            <small>Preferences are stored on this device.</small>
          </div>
        )}
      </header>
      <div
        className={`nae-body ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}
      >
        <aside className={`nae-sidebar ${mobileNav ? "open" : ""}`}>
          <button className="nae-close-nav" aria-label="Close navigation" onClick={() => setMobileNav(false)}>
            <X />
          </button>
          <nav>
            {routes.map(([id, label, Icon]) => (
              <button
                key={label}
                className={route === id ? "active" : ""}
                onClick={() => go(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <button
            className="nae-collapse"
            onClick={() =>
              setSidebarCollapsed((value) => {
                if (settings.rememberPanels) localStorage.setItem("nae-sidebar-collapsed", String(!value));
                return !value;
              })
            }
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={17} />
            ) : (
              <PanelLeftClose size={17} />
            )}
            <span>{sidebarCollapsed ? "Expand" : "Collapse"}</span>
          </button>
          <div className="nae-sidebar-foot">
            <span className="nae-status-dot" /> Offline samples ready
            <small>RCSB PDB coordinate cache</small>
          </div>
        </aside>
        <main className="nae-workspace">
          {route === "" ? (
            <div className="nae-home">
              <section className="nae-view-card">
                <div className="nae-panel-head">
                  <div>
                    <p className="nae-eyebrow">RCSB PDB · CACHED SAMPLE</p>
                    <h1>
                      {structure.name} <span>({structure.id})</span>
                    </h1>
                    <p>
                      {structure.detail} · {structure.bp} ·{" "}
                      {structure.resolution}
                    </p>
                  </div>
                  <div className="nae-control-row">
                    <select
                      aria-label="Helical form"
                      value={form}
                      disabled={acid === "RNA"}
                      onChange={(e) => setForm(e.target.value)}
                    >
                      <option value="A">A-DNA</option>
                      <option value="B">B-DNA</option>
                      <option value="Z">Z-DNA</option>
                    </select>
                    <select
                      aria-label="Representation"
                      value={representation}
                      onChange={(e) => setRepresentation(e.target.value)}
                    >
                      {[
                        "Ball & stick",
                        "Licorice",
                        "Backbone",
                        "Cartoon",
                        "Surface",
                        "Space filling",
                      ].map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="nae-main-viewer">
                  <MolecularViewer
                    pdbId={structure.id}
                    representation={representation}
                    onSelection={handleSelection}
                    focusResidue={selectedResidue}
                    orientAsHelix={acid === "DNA"}
                  />
                  {settings.showAxes && <div
                    className="nae-structure-annotations"
                    aria-label="Structure annotations"
                  >
                    <span className="major">Major groove</span>
                    <span className="minor">Minor groove</span>
                    <span className="backbone">Sugar–phosphate backbone</span>
                    <span className="five">5′</span>
                    <span className="three">3′</span>
                  </div>}
                </div>
                <div className="nae-sequence-strip">
                  <span>5′</span>
                  {homeSequence.split("").map((base, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedResidue(i + 1)}
                      className={selectedResidue === i + 1 ? "active" : ""}
                    >
                      {base}
                      <small>{i + 1}</small>
                    </button>
                  ))}
                  <span>3′</span>
                </div>
              </section>
              <aside className="nae-inspector">
                <div className="nae-tabs">
                  {["Residue Inspector", "Structure", "Measurements"].map((tab) => (
                    <button
                      key={tab}
                      className={inspectorTab === tab ? "active" : ""}
                      onClick={() => setInspectorTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="nae-inspector-body">
                  {inspectorTab === "Residue Inspector" && <>
                  <p className="nae-eyebrow">CURRENT SELECTION</p>
                  <h2>
                    {currentAtom?.residue || (acid === "RNA" ? "RNA" : "DG")} {selectedResidue}{" "}
                    <span>· Chain {currentAtom?.chain || "A"}</span>
                  </h2>
                  <p>{currentAtom ? `${currentAtom.atom} · ${currentAtom.element}` : "Select an atom in the live Mol* view"}</p>
                  <dl>
                    <dt>PDB ID</dt>
                    <dd>{structure.id}</dd>
                    <dt>Residue</dt>
                    <dd>{currentAtom?.residue || (acid === "RNA" ? "RNA" : "DG")}</dd>
                    <dt>Atom</dt>
                    <dd>{currentAtom?.atom || "—"}</dd>
                    <dt>Sequence position</dt>
                    <dd>{selectedResidue} / {homeSequence.length}</dd>
                    <dt>Polymer type</dt>
                    <dd>{acid}</dd>
                    <dt>Representation</dt>
                    <dd>{representation}</dd>
                  </dl>
                  </>}
                  {inspectorTab === "Structure" && <>
                  <div className="nae-rule" />
                  <h3>Structure facts</h3>
                  <dl>
                    <dt>Helical form</dt>
                    <dd>{acid === "RNA" ? "RNA hairpin" : `${form}-DNA`}</dd>
                    <dt>Handedness</dt>
                    <dd>{structure.form}</dd>
                    <dt>Experimental method</dt>
                    <dd>{structure.method}</dd>
                    <dt>Resolution</dt>
                    <dd>{structure.resolution}</dd>
                  </dl>
                  </>}
                  {inspectorTab === "Measurements" && <>
                    <p className="nae-eyebrow">LIVE ATOM MEASUREMENTS</p>
                    <h3>Select two or three atoms in Mol*</h3>
                    <dl>
                      <dt>Selected atoms</dt>
                      <dd>{pickedAtoms.length} / 3</dd>
                      <dt>Latest distance</dt>
                      <dd>{measuredDistance === null ? "Select two atoms" : `${measuredDistance.toFixed(2)} Å`}</dd>
                      <dt>Latest angle</dt>
                      <dd>{measuredAngle === null ? "Select three atoms" : `${measuredAngle.toFixed(1)}°`}</dd>
                    </dl>
                    <button className="nae-button" onClick={() => setPickedAtoms([])}>Clear measurements</button>
                    <small>Values are calculated directly from the selected experimental coordinates.</small>
                  </>}
                  {inspectorTab === "Residue Inspector" &&
                  <div className="nae-callout">
                    <Microscope size={18} />
                    <span>
                      Click an atom or residue in Mol* to inspect the
                      experimental model. Use the Mol* selection tools for
                      distance and angle measurements.
                    </span>
                  </div>
                  }
                </div>
              </aside>
              <section className="nae-home-lower">
                <article>
                  <p className="nae-eyebrow">STRUCTURE FACTS</p>
                  <h3>
                    {structure.id} · {structure.name}
                  </h3>
                  <p>
                    Validated coordinates from the RCSB Protein Data Bank.
                    Cached locally for reliable study access.
                  </p>
                  <button onClick={() => go("molecules")}>
                    Open catalogue →
                  </button>
                </article>
                <article>
                  <p className="nae-eyebrow">CONTINUE SESSION</p>
                  <h3>Major and minor grooves</h3>
                  <p>
                    Return to the live lesson at step 3: measure groove
                    geometry.
                  </p>
                  <button onClick={() => go("learn")}>Continue lesson →</button>
                </article>
                <article>
                  <p className="nae-eyebrow">QUICK WORKSPACES</p>
                  <div className="nae-quick-links">
                    <button onClick={() => go("nucleotide-builder")}>
                      Build
                    </button>
                    <button onClick={() => go("sequences")}>Analyse</button>
                    <button onClick={() => go("replication")}>Replicate</button>
                    <button onClick={() => go("comparative")}>Compare</button>
                  </div>
                </article>
                <article>
                  <p className="nae-eyebrow">RECENT STRUCTURES</p>
                  <h3>Coordinate history</h3>
                  <div className="nae-quick-links">
                    {["1BNA", "2KOC", "6ALH"].map((id) => (
                      <button key={id} onClick={() => go("molecules", { pdb: id })}>{id}</button>
                    ))}
                  </div>
                </article>
              </section>
            </div>
          ) : (
            <Suspense fallback={<div className="nae-route-loading" role="status"><span className="nae-spinner" /><strong>Loading scientific workspace…</strong></div>}>
              <WorkspaceRouter route={route} acid={acid} setAcid={setAcid} />
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
