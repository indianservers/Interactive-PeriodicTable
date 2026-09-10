import { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Beaker,
  Check,
  Database,
  Download,
  FlaskConical,
  Folder,
  Leaf,
  Network,
  Play,
  Move,
  Maximize2,
  Rotate3d,
  RotateCcw,
  Save,
  Settings,
  ZoomIn,
  ZoomOut,
  Wrench,
  Upload,
} from "lucide-react";
import { MolstarViewer, ViewerErrorBoundary } from "../../components/molecular-viewer/index.js";
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
  const referenceSource = { url: "/assets/chemistry-inventor/ethyl-lactate.sdf", format: "sdf", label: "Ethyl lactate · PubChem CID 7344" };
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
    [cameraAction, setCameraAction] = useState("Rotate"),
    [camera, setCamera] = useState({ x: 0, y: 0, scale: 1, rotation: 0 }),
    [draggingCamera, setDraggingCamera] = useState(false),
    [inspectionSource, setInspectionSource] = useState(referenceSource),
    [inspectionStyle, setInspectionStyle] = useState("Ball & stick"),
    [inspectionReady, setInspectionReady] = useState(false),
    [inspectionAtom, setInspectionAtom] = useState(null);
  const cameraDrag = useRef(null);
  const inspectionRef = useRef(null);
  const importRef = useRef(null);
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
  const adjustZoom = (delta) => setCamera((value) => ({ ...value, scale: Math.min(1.8, Math.max(0.65, Number((value.scale + delta).toFixed(2)))) }));
  const resetCamera = () => {
    setCamera({ x: 0, y: 0, scale: 1, rotation: 0 });
    setCameraAction("Rotate");
    setView("3D");
  };
  const handleMoleculePointerDown = (event) => {
    if (cameraAction === "Zoom" || cameraAction === "Reset") return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    cameraDrag.current = { x: event.clientX, y: event.clientY, camera };
    setDraggingCamera(true);
  };
  const handleMoleculePointerMove = (event) => {
    if (!cameraDrag.current) return;
    const start = cameraDrag.current;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    setCamera(cameraAction === "Rotate"
      ? { ...start.camera, rotation: start.camera.rotation + dx * 0.45 }
      : { ...start.camera, x: start.camera.x + dx, y: start.camera.y + dy });
  };
  const stopMoleculeDrag = () => {
    cameraDrag.current = null;
    setDraggingCamera(false);
  };
  const importStructure = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const format = file.name.split(".").pop()?.toLowerCase();
    if (!["pdb", "cif", "mmcif", "mol", "sdf"].includes(format)) return;
    setInspectionReady(false);
    setInspectionAtom(null);
    setInspectionSource({ url: URL.createObjectURL(file), format, label: file.name });
    setView("Inspect");
    event.target.value = "";
  };
  const exportPreview = async () => {
    const image = await inspectionRef.current?.png();
    if (!image) return;
    const link = document.createElement("a");
    link.href = image;
    link.download = "ethyl-lactate-inspection.png";
    link.click();
  };
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
                    aria-pressed={selected.includes(g)}
                  >
                  <span>{g}</span>
                  <small>{selected.includes(g) ? "Added" : "Add"}</small>
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
                {["2D", "3D", "Surface", "Inspect"].map((v) => (
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
            {view !== "Inspect" ? <Molecule
              model={view}
              camera={camera}
              dragging={draggingCamera}
              onPointerDown={handleMoleculePointerDown}
              onPointerMove={handleMoleculePointerMove}
              onPointerUp={stopMoleculeDrag}
              onWheel={(event) => {
                event.preventDefault();
                adjustZoom(event.deltaY > 0 ? -0.05 : 0.05);
              }}
            /> : <div className="ci-inspection" data-ready={inspectionReady}>
              <ViewerErrorBoundary label="Chemistry Inventor structure inspection">
                <MolstarViewer
                  ref={inspectionRef}
                  source={inspectionSource}
                  sourceType={inspectionSource.format}
                  label={inspectionSource.label}
                  representation={{ BallAndStick: inspectionStyle === "Ball & stick", Spacefill: inspectionStyle === "Space filling", Sticks: inspectionStyle === "Sticks", Ligand: false, Branched: false, Ion: false }}
                  colorScheme="element"
                  showLabels={false}
                  onReady={() => { setInspectionReady(true); requestAnimationFrame(() => inspectionRef.current?.zoom(1.35)); }}
                  onLoadError={() => setInspectionReady(false)}
                  onSelectionChange={setInspectionAtom}
                />
              </ViewerErrorBoundary>
              <div className="ci-inspection-note">
                <b>{inspectionReady ? "Mol* inspection ready" : "Loading coordinates…"}</b>
                <span>{inspectionSource.label}</span>
                <span>{inspectionAtom ? `${inspectionAtom.element} atom ${inspectionAtom.sourceIndex + 1} · [${inspectionAtom.coordinates.map((value) => value.toFixed(2)).join(", ")}] Å` : "Read-only conformer inspection · click an atom for coordinates"}</span>
                <small>Return to 2D, 3D, or Surface to continue editing functional-group blocks.</small>
              </div>
            </div>}
            <h4>Lactic acid ethyl ester (Ethyl lactate)　✎</h4>
            <p>C₅H₁₀O₃　　MW: 118.13 g/mol</p>
            <footer>
              ● C　Carbon　　<span>● O　Oxygen</span>　　<i>● H　Hydrogen</i>
            </footer>
            {view !== "Inspect" ? <aside>
              <button className={cameraAction === "Rotate" ? "active" : ""} onClick={() => setCameraAction("Rotate")} title="Drag to rotate">
                <Rotate3d /><small>Rotate</small>
              </button>
              <button className={cameraAction === "Zoom" ? "active" : ""} onClick={() => setCameraAction("Zoom")} title="Use wheel or +/-">
                <ZoomIn /><small>Zoom</small>
              </button>
              <button className={cameraAction === "Pan" ? "active" : ""} onClick={() => setCameraAction("Pan")} title="Drag to pan">
                <Move /><small>Pan</small>
              </button>
              <button onClick={() => adjustZoom(-0.1)} title="Zoom out">
                <ZoomOut /><small>Out</small>
              </button>
              <button onClick={() => adjustZoom(0.1)} title="Zoom in">
                <ZoomIn /><small>In</small>
              </button>
              <button className={cameraAction === "Reset" ? "active" : ""} onClick={resetCamera} title="Reset camera">
                <RotateCcw />
                <small>Reset</small>
              </button>
            </aside> : <aside className="ci-inspection-tools">
              {["Ball & stick", "Space filling", "Sticks"].map((style) => <button key={style} className={inspectionStyle === style ? "active" : ""} onClick={() => setInspectionStyle(style)} title={style}><small>{style}</small></button>)}
              <button onClick={() => importRef.current?.click()} title="Import structure"><Upload /><small>Import</small></button>
              <button onClick={() => inspectionRef.current?.reset()} title="Reset conformer"><RotateCcw /><small>Reset</small></button>
              <button onClick={exportPreview} title="Export preview"><Download /><small>Export</small></button>
              <button onClick={() => inspectionRef.current?.fullscreen()} title="Full screen"><Maximize2 /><small>Full</small></button>
            </aside>}
            <input ref={importRef} type="file" accept=".pdb,.cif,.mmcif,.mol,.sdf" hidden onChange={importStructure} />
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
function Molecule({ model, camera, dragging, onPointerDown, onPointerMove, onPointerUp, onWheel }) {
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
    <div className={`ci-molecule ${model.toLowerCase()} ${dragging ? "dragging" : ""}`} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}>
      <div className="ci-molecule-stage" style={{ transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.scale}) rotate(${camera.rotation}deg)` }}>
        <span className="ci-molecule-bond" aria-hidden="true" />
        {atoms.map(([a, x, y], i) => (
          <i key={i} className={a} style={{ left: `${x}%`, top: `${y}%` }}>
            {a}
          </i>
        ))}
      </div>
    </div>
  );
}
