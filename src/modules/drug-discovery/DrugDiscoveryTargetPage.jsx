import { useMemo, useRef, useState } from "react";
import { BarChart3, Beaker, BookOpen, CircleHelp, FlaskConical, Folder, HelpCircle, Home, Maximize2, Network, RotateCcw, Search, Settings, ShieldCheck, Upload, Users } from "lucide-react";
import MolstarViewer from "../../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./DrugDiscoveryTargetPage.css";

const candidates = [
  [-8.7, "C-17", "lead"], [-8.1, "C-17a", "+0.3 logP"], [-8.4, "C-17b", "+F (potency hypothesis)"],
  [-7.9, "C-17c", "+Me (logP hypothesis)"], [-8.2, "C-17d", "+OMe"], [-7.1, "C-17e", "+Cl"],
  [-6.8, "C-17f", "+CF₃"], [-8.0, "C-17g", "+NH₂"],
];
const contacts = [
  { residue: 385, name: "Tyr385", role: "polar contact near inhibitor carboxylate" },
  { residue: 530, name: "Ser530", role: "polar contact near inhibitor carboxylate" },
];
const DEFAULT_SOURCE = { url: "/assets/drug-discovery/structures/5IKR.cif", label: "PDB 5IKR local cache" };
const ID8_SOURCE = { url: "/assets/drug-discovery/structures/ID8_ideal.sdf", label: "RCSB ID8 ideal coordinates" };

export default function DrugDiscoveryTargetPage() {
  const viewerRef = useRef(null), fileRef = useRef(null);
  const [selected, setSelected] = useState(0), [tab, setTab] = useState("2D Structure"), [interactions, setInteractions] = useState(true);
  const [optimized, setOptimized] = useState(false), [adme, setAdme] = useState(false), [section, setSection] = useState("Drug Discovery");
  const [viewMode, setViewMode] = useState("Complex"), [renderStyle, setRenderStyle] = useState("Surface"), [analysis, setAnalysis] = useState("SAR comparison");
  const [notice, setNotice] = useState(""), [selectedAtom, setSelectedAtom] = useState(null), [selectedResidue, setSelectedResidue] = useState(null);
  const [measurementAtoms, setMeasurementAtoms] = useState([]), [measuring, setMeasuring] = useState(false);
  const [structureSource, setStructureSource] = useState(DEFAULT_SOURCE), [sourceType, setSourceType] = useState("mmcif"), [structureLabel, setStructureLabel] = useState("PDB 5IKR");
  const c = candidates[selected], score = (c[0] - (optimized ? 0.3 : 0)).toFixed(1), isReferenceStructure = structureLabel === "PDB 5IKR";
  const props = useMemo(() => ({ mw: 342.4 + selected * 3.2, logp: (2.1 + selected * .12).toFixed(1), hbd: selected === 7 ? 3 : 2, hba: selected === 5 ? 5 : 6 }), [selected]);
  const representation = useMemo(() => ({ Cartoon: viewMode !== "Ligand" && renderStyle === "Cartoon", Surface: viewMode !== "Ligand" && renderStyle === "Surface", Sticks: viewMode !== "Ligand" && renderStyle === "Sticks", Ligand: viewMode !== "Protein", Ion: viewMode !== "Ligand" }), [viewMode, renderStyle]);
  const activeSource = viewMode === "Ligand" && isReferenceStructure ? ID8_SOURCE : structureSource;
  const activeSourceType = viewMode === "Ligand" && isReferenceStructure ? "sdf" : sourceType;
  const activeLabel = viewMode === "Ligand" && isReferenceStructure ? "Mefenamic acid · ID8" : structureLabel;
  const distance = measurementAtoms.length === 2 ? Math.hypot(...measurementAtoms[0].coordinates.map((value, index) => value - measurementAtoms[1].coordinates[index])).toFixed(2) : null;

  const onStructureSelection = (selection) => {
    setSelectedAtom(selection); setSelectedResidue(selection.residue);
    if (!measuring || !selection.coordinates) return;
    setMeasurementAtoms((current) => {
      const key = `${selection.chain}:${selection.residue}:${selection.atom}`;
      return [...current.filter((item) => `${item.chain}:${item.residue}:${item.atom}` !== key), selection].slice(-2);
    });
  };
  const loadUpload = async (event) => {
    const file = event.target.files?.[0]; if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!new Set(["pdb", "cif", "mmcif"]).has(extension)) { setNotice("Unsupported structure file. Upload PDB, CIF, or mmCIF coordinates."); event.target.value = ""; return; }
    setStructureSource({ data: await file.text(), label: file.name }); setSourceType(extension === "pdb" ? "pdb" : "mmcif"); setStructureLabel(file.name);
    setSelectedAtom(null); setSelectedResidue(null); setMeasurementAtoms([]); setNotice(`Loaded local structure ${file.name}`); event.target.value = "";
  };
  const showSection = (name) => { setSection(name); setNotice(name === "Drug Discovery" ? "Experimental structure workspace active" : `${name} workspace selected`); };

  return <div className="dd-app">
    <header><Network /><div><h1>Drug Discovery Studio</h1><p>From molecules to better medicines</p></div><label><Search /><input aria-label="Search targets, molecules, or projects" placeholder="Search targets, molecules, or projects..." onKeyDown={(event) => { if (event.key === "Enter") setNotice(event.currentTarget.value.trim() ? `Search ready: ${event.currentTarget.value.trim()}` : "Enter a target, molecule, or project"); }} /></label><nav><button onClick={() => showSection("Projects")}><Folder />Projects</button><button onClick={() => showSection("Help")}><HelpCircle />Help</button><span>EP</span><b>Dr. Elena Park<small>Medicinal Chemistry</small></b></nav></header>
    <aside>{[[Home, "Home"], [FlaskConical, "Drug Discovery"], [Settings, "Targets"], [Search, "Screening"], [Network, "Molecular Design"], [Beaker, "ADME & PK"], [ShieldCheck, "Safety & Toxicity"], [BarChart3, "Data & Analytics"], [BookOpen, "Notebooks"], [Users, "Team"], [Settings, "Settings"]].map(([Icon, name]) => <button className={section === name ? "active" : ""} key={name} onClick={() => showSection(name)}><Icon />{name}</button>)}<p>Better science<br />Healthier tomorrow</p></aside>
    <main>
      <section className="dd-pocket">
        <header><div><h2>COX-2 binding pocket</h2><p>{isReferenceStructure ? "PDB 5IKR · Homo sapiens · X-ray diffraction · 2.34 Å" : `${structureLabel} · user-supplied coordinates`}</p></div><span className={isReferenceStructure ? "dd-evidence" : "dd-evidence uploaded"}>{isReferenceStructure ? "Experimental complex" : "Uploaded structure"}</span><button className="dd-upload" onClick={() => fileRef.current?.click()}><Upload /> Upload structure</button><input ref={fileRef} type="file" accept=".pdb,.cif,.mmcif" onChange={loadUpload} hidden /></header>
        <div className="dd-surface"><ViewerErrorBoundary><MolstarViewer ref={viewerRef} source={activeSource} sourceType={activeSourceType} label={activeLabel} pdbId={isReferenceStructure && viewMode !== "Ligand" ? "5IKR" : undefined} representation={representation} colorScheme="chain" selectedChain={isReferenceStructure && viewMode !== "Ligand" ? "A" : undefined} selectedResidue={selectedResidue} focusOnSelection={Boolean(selectedResidue)} focusLigandId={isReferenceStructure && viewMode !== "Ligand" ? "ID8" : undefined} focusLigandChain="A" showLabels={false} onSelectionChange={onStructureSelection} onLoadError={(error) => setNotice(error.message)} /></ViewerErrorBoundary>
          {interactions && isReferenceStructure && <div className="dd-interaction-panel"><b>RCSB-annotated pocket contacts</b>{contacts.map((contact) => <button key={contact.residue} onClick={() => setSelectedResidue(contact.residue)}><span>{contact.name}</span><small>{contact.role}</small></button>)}<small>Interaction geometry is shown only when calculated from selected coordinates.</small></div>}
          <div className="dd-selection-readout">{selectedAtom ? <><b>{selectedAtom.residueName} {selectedAtom.residue} · Chain {selectedAtom.chain}</b><span>{selectedAtom.atom} · {selectedAtom.element}</span></> : <><b>Atom / residue inspector</b><span>Select an atom in the live structure</span></>}{measuring && <span>{distance ? `Calculated atom distance: ${distance} Å` : `Select ${2 - measurementAtoms.length} more atom${measurementAtoms.length ? "" : "s"}`}</span>}</div>
        </div>
        <footer><button className={interactions ? "active" : ""} onClick={() => setInteractions((value) => !value)}>◉ Interactions</button><select aria-label="Structure component" value={viewMode} onChange={(event) => { setViewMode(event.target.value); setSelectedResidue(null); setSelectedAtom(null); }}><option>Complex</option><option>Protein</option><option>Ligand</option></select>{["Surface", "Cartoon", "Sticks"].map((style) => <button key={style} className={renderStyle === style ? "active" : ""} onClick={() => setRenderStyle(style)} disabled={viewMode === "Ligand"}>{style}</button>)}<button className={measuring ? "active" : ""} onClick={() => { setMeasuring((value) => !value); setMeasurementAtoms([]); }}>Measure</button><button aria-label="Reset structure view" onClick={() => viewerRef.current?.reset()}><RotateCcw /></button><button aria-label="Fullscreen structure view" onClick={() => viewerRef.current?.fullscreen()}><Maximize2 /></button></footer>
      </section>

      <section className="dd-lead"><header><h2>Lead candidate {c[1]}</h2><p>Virtual design series · calculated scores, not observed binding</p><span>Design project</span></header><nav>{["2D Structure", "3D Conformer", "Properties"].map((name) => <button className={tab === name ? "active" : ""} onClick={() => setTab(name)} key={name}>{name}</button>)}</nav><div className="dd-structure">
        {tab === "2D Structure" && <MefenamicAcidDiagram title="Experimental reference: mefenamic acid (ID8)" />}
        {tab === "3D Conformer" && <div className="dd-reference-view"><ViewerErrorBoundary><MolstarViewer source={ID8_SOURCE} sourceType="sdf" label="Mefenamic acid · ID8" representation={{ Ligand: true }} showLabels={false} /></ViewerErrorBoundary><span>RCSB ideal coordinates for experimental reference ligand ID8; C-17 coordinates are unavailable.</span></div>}
        {tab === "Properties" && <div className="dd-property-note"><CircleHelp /><b>Calculated design profile</b><p>The values at right are educational model outputs for this virtual series. They are not experimental assay results.</p></div>}
      </div><div className="dd-smiles"><button onClick={() => setNotice("Structure editor remains separate from the read-only Mol* inspection views")}>✎ Edit design</button><span>Reference ID8 formula · C₁₅H₁₅NO₂</span></div><footer><button className="primary" onClick={() => setOptimized(true)}>✣ {optimized ? "Optimization applied" : "Optimize lead"}</button><button onClick={() => setNotice("Virtual redocking score recalculated")}>↻ Redock</button><button onClick={() => setNotice("Design hypothesis changed; no experimental coordinates were generated")}>⌘ Mutate group</button><button onClick={() => setNotice(`Calculated educational docking score: ${score} kcal/mol`)}>💡 Explain score</button></footer></section>

      <section className="dd-right"><article className="dd-props"><h2>Molecular properties <small>calculated</small></h2><Radar selected={selected} /><dl><dt>Molecular weight (MW)</dt><dd>{props.mw.toFixed(1)}</dd><dt>cLogP</dt><dd>{props.logp}</dd><dt>H-bond donors (HBD)</dt><dd>{props.hbd}</dd><dt>H-bond acceptors (HBA)</dt><dd>{props.hba}</dd><dt>Lipinski rule of 5</dt><dd className="pass">Pass ✓</dd><dt>Docking score (virtual)</dt><dd>{score} kcal/mol</dd><dt>Toxicity alert</dt><dd>Not assessed</dd></dl></article><article className="dd-adme"><h2>ADME &amp; developability <button onClick={() => setAdme(true)}>Run model</button></h2><p className="dd-method">Educational predictions; not clinical measurements.</p><dl><dt>Aqueous solubility (ESOL)</dt><dd>{adme ? "−4.2 (model)" : "—"}</dd><dt>Human intestinal absorption</dt><dd>{adme ? "92% (model)" : "—"}</dd><dt>Plasma protein binding</dt><dd>{adme ? "94% (model)" : "—"}</dd><dt>CYP3A4 inhibition</dt><dd>{adme ? "No flag" : "—"}</dd><dt>hERG risk</dt><dd>{adme ? "Low flag" : "—"}</dd><dt>Overall profile</dt><dd className={adme ? "pass" : ""}>{adme ? "Favorable model" : "Not run"}</dd></dl></article></section>

      <section className="dd-analogs"><header><h2>Virtual analog series (8)</h2><button className={analysis === "SAR comparison" ? "active" : ""} onClick={() => setAnalysis("SAR comparison")}>SAR comparison</button><button className={analysis === "Activity cliff analysis" ? "active" : ""} onClick={() => setAnalysis("Activity cliff analysis")}>Activity cliff analysis</button><select aria-label="Sort analog series"><option>Sort by · score (high → low)</option></select></header><div>{candidates.map((item, index) => <button key={item[1]} className={selected === index ? "active" : ""} onClick={() => { setSelected(index); setOptimized(false); }}><span className="dd-analog-glyph">DESIGN<br />{index + 1}</span><b>{item[1]}</b><strong>{item[0]} kcal/mol</strong><small>{item[2]}</small></button>)}</div></section>
      <footer>Design. Predict. Understand. Accelerate.<span>Experimental structures and virtual models are labelled separately.</span></footer>
      {notice && <div className="dd-notice" role="status"><span>{notice}</span><button aria-label="Dismiss notice" onClick={() => setNotice("")}>×</button></div>}
    </main>
  </div>;
}

function MefenamicAcidDiagram({ title }) {
  return <figure className="dd-chemical-diagram"><svg viewBox="0 0 430 250" role="img" aria-label="2D skeletal structure of mefenamic acid"><g fill="none" stroke="currentColor" strokeWidth="3"><path d="M75 75l52-30 52 30v60l-52 30-52-30zM87 82l40-23M165 82v46M87 128l40 23M179 104h58M237 104l48-28M237 104l48 28M285 76l52 30v60l-52 30-52-30v-34M298 84l28 16M326 148l-28 32M244 157l-40 23M204 180l-35-20M169 160l-24 35M175 164l-23 36" /></g><g fill="currentColor" fontFamily="IBM Plex Mono, monospace" fontSize="17"><text x="188" y="98" fill="#79c9ff">NH</text><text x="127" y="219" fill="#ff6671">O</text><text x="177" y="218" fill="#ff6671">OH</text><text x="276" y="67">CH₃</text><text x="338" y="178">CH₃</text></g></svg><figcaption>{title}</figcaption></figure>;
}
function Radar({ selected }) {
  const delta = selected * 3;
  return <svg viewBox="0 0 300 220" aria-label="Calculated molecular property radar chart"><path className="grid" d="M150 20L245 75L245 155L150 205L55 155L55 75Z M150 55L210 88L210 142L150 172L90 142L90 88Z" /><path className="range" d="M150 43L230 82L220 148L150 185L73 145L80 88Z" /><path className="value" d={`M150 ${55 - delta}L${215 + delta} 92L205 142L150 174L82 144L92 92Z`} /><text x="135" y="13">Lipophilicity</text><text x="248" y="75">Size</text><text x="248" y="165">Polarity</text><text x="130" y="218">Solubility</text><text x="5" y="165">Flexibility</text><text x="5" y="75">TPSA</text></svg>;
}
