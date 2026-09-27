import { calculateLab } from "../data/biochemistryCalculations.js";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, Beaker, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, Download, FlaskConical, GraduationCap, Play, Printer,
  Maximize2, RotateCcw, Search, ShieldCheck, Shuffle,
} from "lucide-react";
import {
  BIOCHEMISTRY_LAB_CATEGORIES, BIOCHEMISTRY_VIRTUAL_LABS, defaultValuesForLab,
} from "../data/biochemistryVirtualLabs.js";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./BiochemistryTargetPage.css";

const STRUCTURE_LABS = new Set([
  "enzyme-kinetics", "km-vmax", "protein-structure", "enzyme-inhibitors",
  "enzyme-stability", "protein-purification", "dna-extraction", "gel-electrophoresis",
  "pcr", "restriction-mapping", "carbohydrate-tests", "metabolic-pathways", "atp-energy",
]);
const STRUCTURE_SOURCES = {
  default: { url: "/assets/biochemistry/structures/1HEW.cif", format: "mmcif", label: "Hen egg-white lysozyme · PDB 1HEW", pdbId: "1HEW" },
  "dna-extraction": { url: "/assets/nucleic-acid/structures/1BNA.cif", format: "mmcif", label: "B-DNA dodecamer · PDB 1BNA", pdbId: "1BNA" },
  "gel-electrophoresis": { url: "/assets/nucleic-acid/structures/1BNA.cif", format: "mmcif", label: "B-DNA dodecamer · PDB 1BNA", pdbId: "1BNA" },
  pcr: { url: "/assets/nucleic-acid/structures/1BNA.cif", format: "mmcif", label: "B-DNA dodecamer · PDB 1BNA", pdbId: "1BNA" },
  "restriction-mapping": { url: "/assets/nucleic-acid/structures/1BNA.cif", format: "mmcif", label: "B-DNA dodecamer · PDB 1BNA", pdbId: "1BNA" },
  "carbohydrate-tests": { url: "/assets/carbohydrate-studio/structures/d-glucose.sdf", format: "sdf", label: "D-Glucose", pdbId: "" },
  "metabolic-pathways": { url: "/assets/biochemistry/structures/1C96.cif", format: "mmcif", label: "Aconitase–citrate · PDB 1C96", pdbId: "1C96" },
  "atp-energy": { url: "/assets/biochemistry/structures/1C96.cif", format: "mmcif", label: "Aconitase–citrate · PDB 1C96", pdbId: "1C96" },
};
const LYSOZYME_SOURCE = STRUCTURE_SOURCES.default;

const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
const format = (value, digits = 2) => Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
const enzymeRate = (substrate, vmax = 120, km = 2.4) => (vmax * substrate) / (km + substrate);


function CurveVisual({ visual }) {
  const xs = visual.points.map(([x]) => x), ys = visual.points.map(([, y]) => y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(0, ...ys), yMax = Math.max(...ys, 1);
  const point = ([x, y]) => [42 + ((x - xMin) / Math.max(1e-9, xMax - xMin)) * 416, 196 - ((y - yMin) / Math.max(1e-9, yMax - yMin)) * 160];
  const path = visual.points.map((p, index) => `${index ? "L" : "M"}${point(p).join(" ")}`).join(" ");
  const current = point(visual.current);
  return <figure className="bio-vl-chart"><figcaption>{visual.title}</figcaption><svg viewBox="0 0 500 230" role="img" aria-label={`${visual.title}, ${visual.xLabel} versus ${visual.yLabel}`}>
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="42" x2="458" y1={36 + i * 40} y2={36 + i * 40} />)}
    <path className="bio-axis" d="M42 22V196H468" /><path className="bio-curve-line" d={path} /><circle className="bio-current-point" cx={current[0]} cy={current[1]} r="6" />
    <text x="210" y="224">{visual.xLabel}</text><text x="12" y="120" transform="rotate(-90 12 120)">{visual.yLabel}</text>
  </svg></figure>;
}

function LabVisual({ visual }) {
  if (visual.type === "curve") return <CurveVisual visual={visual} />;
  if (visual.type === "protein") return <div className="bio-protein-model" role="img" aria-label={`${visual.level} structure, ${format(visual.folded * 100, 0)} percent folded`}><div className={`bio-protein-chain ${visual.folded < 0.45 ? "is-unfolded" : ""}`}>{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ "--i": i }} />)}</div><strong>{visual.level} structure</strong><small>{format(visual.folded * 100, 0)}% folded in the teaching model</small></div>;
  if (visual.type === "gel") return <div className="bio-gel" role="img" aria-label={`Gel lane with ${visual.fragment} base-pair band migrated ${format(visual.distance)} centimetres`}><div className="bio-gel-well" /><div className="bio-gel-band" style={{ top: `${18 + visual.distance * 8}%` }} /><span>{format(visual.fragment, 0)} bp</span></div>;
  if (visual.type === "restriction") return <div className={`bio-restriction ${visual.topology.toLowerCase()}`} role="img" aria-label={`${visual.topology} DNA restriction map`}><div className="bio-dna-map"><i /><i /><strong>{format(visual.plasmid, 0)} bp</strong></div><p>{visual.fragments.map((x) => `${format(x, 0)} bp`).join(" · ")}</p></div>;
  if (visual.type === "workflow") return <div className="bio-workflow">{visual.stages.map((stage, i) => <div key={visual.labels[i]}><span style={{ width: `${stage}%` }} /><b>{visual.labels[i]}</b><small>{format(stage, 0)}%</small></div>)}</div>;
  if (visual.type === "chromatography") return <div className="bio-chromatogram"><div className="bio-front" /><div className="bio-spot" style={{ bottom: `${12 + visual.rf * 72}%` }} /><span>Rf {format(visual.rf, 2)}</span></div>;
  if (visual.type === "pathway") return <div className="bio-pathway" aria-label={`${visual.pathway} pathway at ${format(visual.flux)} percent flux`}><span>Substrate</span><i style={{ opacity: clamp(0.15, 1, visual.flux / 100) }}>→</i><span>{visual.pathway}</span><i style={{ opacity: clamp(0.15, 1, visual.flux / 100) }}>→</i><span>Products</span></div>;
  if (visual.type === "atp") return <div className="bio-atp"><div style={{ "--charge": `${visual.gradient}%` }}>ATP</div><p>Proton gradient {format(visual.gradient, 0)}% · coupling {format(visual.coupling, 0)}%</p></div>;
  if (visual.type === "well" || visual.type === "unknown") return <div className={`bio-test-well ${visual.positive ? "positive" : "negative"}`}><div /><strong>{visual.positive ? "Positive reaction" : "Negative reaction"}</strong><small>{visual.colour || visual.test}</small></div>;
  if (visual.type === "spectrum") return <div className="bio-spectrum"><div style={{ height: `${clamp(6, 96, visual.value * 62)}%`, background: visual.colour }} /><span>Absorbance response</span></div>;
  if (visual.type === "analyzer") return <div className="bio-analyzer"><div><span style={{ height: `${clamp(4, 95, visual.standard * 70)}%` }} />Standard</div><div><span style={{ height: `${clamp(4, 95, visual.unknown * 70)}%` }} />Unknown</div><strong>{visual.analyte}</strong></div>;
  if (visual.type === "buffer") return <div className="bio-ph-meter"><span>pH</span><strong>{format(visual.ph, 3)}</strong><small>pKa {format(visual.pka, 2)}</small></div>;
  if (visual.type === "stability") return <div className="bio-stability"><div style={{ "--activity": `${visual.residual}%` }}><span /></div><strong>{format(visual.residual, 1)}% activity</strong><small>{visual.temperature}°C · pH {visual.ph}</small></div>;
  if (visual.type === "purification") return <div className="bio-purification"><div><span style={{ width: `${visual.yield}%` }} />Yield {format(visual.yield, 1)}%</div><div><span style={{ width: `${visual.purity}%` }} />Purity {format(visual.purity, 1)}%</div></div>;
  if (visual.type === "pipette") return <div className={`bio-pipette ${visual.suitable ? "valid" : "invalid"}`}><div><span style={{ height: `${visual.fill}%` }} /></div><strong>{visual.suitable ? "Suitable range" : "Change pipette"}</strong></div>;
  if (visual.type === "notebook") return <div className="bio-notebook-visual"><BookOpen /><strong>Evidence confidence</strong><span>{"●".repeat(visual.quality)}{"○".repeat(5 - visual.quality)}</span></div>;
  if (visual.type === "assessment") return <div className="bio-score-ring" style={{ "--score": visual.score }}><strong>{format(visual.score, 0)}%</strong><span>weighted score</span></div>;
  return <BarChart3 size={72} aria-hidden="true" />;
}

function StructureLabVisual({ activeId, step, notice }) {
  const viewerRef = useRef(null);
  const [representation, setRepresentation] = useState("Surface");
  const [selectedAtom, setSelectedAtom] = useState(null);
  const source = STRUCTURE_SOURCES[activeId] || STRUCTURE_SOURCES.default;
  const isMacromolecule = source.format === "mmcif";
  const guidedResidue = isMacromolecule && source.pdbId === "1HEW" ? [null, 35, 52, 35][Math.min(step, 3)] : null;
  const structureRepresentation = useMemo(() => ({
    Surface: representation === "Surface" && isMacromolecule,
    Cartoon: representation === "Cartoon" && isMacromolecule,
    BallAndStick: representation === "Atoms" || !isMacromolecule,
  }), [representation, isMacromolecule]);
  const lesson = activeId === "protein-structure"
    ? "Inspect the experimental fold; the simulation variables remain an educational stability model."
    : activeId === "enzyme-inhibitors"
      ? "Tri-N-acetylchitotriose is the experimentally bound inhibitor in this structure."
      : `${source.label} is a structural reference for this investigation.`;
  return <div className="biovl-structure-stage">
    <div className="biovl-structure-meta"><div><b>{source.label}</b><span>{source.pdbId ? `PDB ${source.pdbId} · local experimental cache` : "Local coordinate model"}</span></div><em>Experimental structure</em></div>
    <div className="biovl-structure-view"><ViewerErrorBoundary><MolstarViewer ref={viewerRef} source={source} sourceType={source.format} label={source.label} pdbId={source.pdbId} representation={structureRepresentation} colorScheme={isMacromolecule ? "chain" : "element"} selectedChain={source.pdbId === "1HEW" ? "A" : undefined} selectedResidue={guidedResidue} highlightedResidues={source.pdbId === "1HEW" ? [35, 52] : []} focusOnSelection={Number.isFinite(guidedResidue)} focusLigandId={source.pdbId === "1HEW" ? "NAG" : undefined} focusLigandChain={source.pdbId === "1HEW" ? "B" : undefined} showLabels={false} onSelectionChange={setSelectedAtom} onLoadError={(error) => notice(error.message)} /></ViewerErrorBoundary></div>
    <div className="biovl-structure-toolbar">{["Surface", "Cartoon", "Atoms"].map((item) => <button key={item} className={representation === item ? "active" : ""} onClick={() => setRepresentation(item)}>{item}</button>)}<button onClick={() => viewerRef.current?.focusLigandId("NAG", "B")}>Focus inhibitor</button><button onClick={() => viewerRef.current?.reset()}><RotateCcw /> Reset</button><button aria-label="Fullscreen molecular structure" onClick={() => viewerRef.current?.fullscreen()}><Maximize2 /></button></div>
    <div className="biovl-structure-inspector"><span>{selectedAtom ? `${selectedAtom.residueName} ${selectedAtom.residue} · chain ${selectedAtom.chain} · ${selectedAtom.atom}` : guidedResidue ? `Protocol focus: catalytic residue ${guidedResidue}` : "Ligand-focused experimental reference"}</span><small>{lesson}</small></div>
  </div>;
}

function downloadText(name, text, type = "text/plain") {
  const href = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = href; anchor.download = name; anchor.click(); URL.revokeObjectURL(href);
}

export default function BiochemistryTargetPage({ onNavigate, initialLabId }) {
  const [activeId, setActiveId] = useState(() => BIOCHEMISTRY_VIRTUAL_LABS.find(lab => lab.id === initialLabId)?.id || BIOCHEMISTRY_VIRTUAL_LABS[0].id);
  const activeLab = BIOCHEMISTRY_VIRTUAL_LABS.find((lab) => lab.id === activeId) || BIOCHEMISTRY_VIRTUAL_LABS[0];
  const [values, setValues] = useState(() => defaultValuesForLab(activeLab));
  const [category, setCategory] = useState("All"), [query, setQuery] = useState(""), [difficulty, setDifficulty] = useState("Intermediate");
  const [safe, setSafe] = useState(false), [step, setStep] = useState(0), [running, setRunning] = useState(false), [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem("biochemistry-vl-notes") || "{}"); } catch { return {}; } });
  const [notebookTab, setNotebookTab] = useState("Observations"), [quizChoice, setQuizChoice] = useState(null), [quizChecked, setQuizChecked] = useState(false);
  const [quizResults, setQuizResults] = useState({}), [unknownSample, setUnknownSample] = useState("Albumin"), [notice, setNotice] = useState("");
  const result = useMemo(() => calculateLab(activeId, values, unknownSample), [activeId, values, unknownSample]);
  const filteredLabs = useMemo(() => BIOCHEMISTRY_VIRTUAL_LABS.filter((lab) => (category === "All" || lab.category === category) && `${lab.title} ${lab.objective} ${lab.category}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);

  useEffect(() => { localStorage.setItem("biochemistry-vl-notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => setProgress((current) => Math.min(100, current + 10)), 100); return () => window.clearInterval(timer); }, [running]);
  useEffect(() => {
    if (!running || progress < 100) return;
    setRunning(false);
    setHistory((items) => [{ id: `${Date.now()}-${activeId}`, time: new Date().toLocaleTimeString(), labId: activeId, lab: activeLab.title, parameters: { ...values }, result: result.metrics.map((item) => `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join("; ") }, ...items].slice(0, 50));
    setNotice("Experiment completed and recorded in the notebook.");
  }, [progress, running, activeId, activeLab.title, values, result.metrics]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(""), 2600); return () => window.clearTimeout(timer); }, [notice]);

  const chooseLab = (lab) => { setActiveId(lab.id); setValues(defaultValuesForLab(lab)); setSafe(false); setStep(0); setProgress(0); setRunning(false); setQuizChoice(null); setQuizChecked(false); };
  const randomize = () => {
    const next = {};
    activeLab.controls.forEach((control) => {
      if (control.type === "select") next[control.key] = control.options[Math.floor(Math.random() * control.options.length)];
      else { const steps = Math.floor((control.max - control.min) / control.step); next[control.key] = Number((control.min + Math.floor(Math.random() * (steps + 1)) * control.step).toFixed(6)); }
    });
    if (activeId === "unknown-sample") { const samples = ["Glucose", "Starch", "Albumin", "Vegetable oil"]; setUnknownSample(samples[Math.floor(Math.random() * samples.length)]); }
    setValues(next); setNotice("A new sample and parameter set is ready.");
  };
  const exportCsv = () => {
    const rows = [["Time", "Lab", "Parameters", "Result"], ...history.map((item) => [item.time, item.lab, JSON.stringify(item.parameters), item.result])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadText("biochemistry-virtual-lab-notebook.csv", csv, "text/csv");
  };
  const answerQuiz = () => { if (quizChoice === null) return; const correct = quizChoice === activeLab.quiz.answer; setQuizChecked(true); setQuizResults((scores) => ({ ...scores, [activeId]: correct })); setNotice(correct ? "Correct — concept check passed." : "Review the explanation and try again."); };
  const completedCount = Object.values(quizResults).filter(Boolean).length;
  const currentNotes = notes[activeId] || { Hypothesis: "", Observations: "", Conclusion: "", "Instructor feedback": "" };

  return <div className="biovl-page">
    <header className="biovl-header">
      <button className="biovl-brand" onClick={() => onNavigate?.("virtual-labs")} aria-label="Return to Virtual Labs home"><span><FlaskConical /></span><div><strong>Biochemistry Virtual Lab</strong><small>25 interactive investigations</small></div></button>
      <label className="biovl-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search labs, methods, or concepts" /></label>
      <label className="biovl-level">Level<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <div className="biovl-progress"><span>{completedCount}/25 checks</span><div><i style={{ width: `${completedCount * 4}%` }} /></div></div>
    </header>
    <div className="biovl-layout">
      <aside className="biovl-catalog">
        <div className="biovl-catalog-head"><div><span>LAB LIBRARY</span><strong>{filteredLabs.length} investigations</strong></div><button onClick={() => { setCategory("All"); setQuery(""); }}><RotateCcw /> Clear</button></div>
        <div className="biovl-category-row">{["All", ...BIOCHEMISTRY_LAB_CATEGORIES].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <nav aria-label="Biochemistry virtual labs">{filteredLabs.map((lab) => <button key={lab.id} className={activeId === lab.id ? "active" : ""} onClick={() => chooseLab(lab)}><span>{String(BIOCHEMISTRY_VIRTUAL_LABS.indexOf(lab) + 1).padStart(2, "0")}</span><div><strong>{lab.title}</strong><small>{lab.category}</small></div>{quizResults[lab.id] && <CheckCircle2 className="complete" />}</button>)}{!filteredLabs.length && <p className="biovl-empty">No labs match this search.</p>}</nav>
      </aside>
      <main className="biovl-workbench">
        <section className="biovl-titlebar"><div><span>{activeLab.category} · {difficulty}</span><h1>{activeLab.title}</h1><p>{activeLab.objective}</p></div><div className="biovl-title-actions"><button onClick={randomize}><Shuffle /> Randomise sample</button></div></section>
        <section className="biovl-simulation-grid">
          <div className="biovl-visual-card"><div className="biovl-card-label"><Beaker /> {STRUCTURE_LABS.has(activeId) ? "LIVE MOLECULAR REFERENCE" : "LIVE EXPERIMENT"} <span>{running ? "Running" : progress === 100 ? "Complete" : "Ready"}</span></div>{STRUCTURE_LABS.has(activeId) ? <StructureLabVisual activeId={activeId} step={step} notice={setNotice} /> : <LabVisual visual={result.visual} />}<div className="biovl-progress-line"><span style={{ width: `${progress}%` }} /></div><div className="biovl-actions"><button className="primary" disabled={!safe || running} onClick={() => { setProgress(0); setRunning(true); setNotice("Experiment running…"); }}><Play /> {running ? "Running…" : "Run experiment"}</button><button onClick={() => { setValues(defaultValuesForLab(activeLab)); setProgress(0); }}><RotateCcw /> Reset</button></div></div>
          <div className="biovl-controls-card"><div className="biovl-card-label"><BarChart3 /> VARIABLES</div><div className="biovl-controls">{activeLab.controls.map((control) => <label key={control.key}><span>{control.label}<output>{values[control.key]}{control.unit ? ` ${control.unit}` : ""}</output></span>{control.type === "select" ? <select value={values[control.key]} onChange={(event) => setValues((current) => ({ ...current, [control.key]: event.target.value }))}>{control.options.map((option) => <option key={option}>{option}</option>)}</select> : <input type="range" min={control.min} max={control.max} step={control.step} value={values[control.key]} onInput={(event) => setValues((current) => ({ ...current, [control.key]: Number(event.target.value) }))} onChange={(event) => setValues((current) => ({ ...current, [control.key]: Number(event.target.value) }))} aria-valuetext={`${values[control.key]} ${control.unit}`} />}</label>)}</div><label className={`biovl-safety-check ${safe ? "checked" : ""}`}><input type="checkbox" checked={safe} onChange={(event) => setSafe(event.target.checked)} /><ShieldCheck /><span><strong>Safety checkpoint</strong><small>{activeLab.safety}</small></span></label></div>
        </section>
        <section className="biovl-results-card"><div className="biovl-card-label"><ClipboardCheck /> CALCULATED RESULTS <span>Equation-backed</span></div><div className="biovl-metrics">{result.metrics.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.unit}</small></article>)}</div><p className="biovl-interpretation">{result.summary}</p><details><summary>Model and accuracy notes</summary><p>{activeLab.model}</p></details></section>
        <section className="biovl-learning-grid">
          <article className="biovl-protocol-card"><div className="biovl-card-label"><BookOpen /> GUIDED PROTOCOL</div><ol>{activeLab.protocol.map((item, index) => <li key={item} className={step === index ? "active" : step > index ? "done" : ""}><button onClick={() => setStep(index)}><span>{step > index ? <CheckCircle2 /> : index + 1}</span><p>{item}</p></button></li>)}</ol><div className="biovl-step-actions"><button disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ChevronLeft /> Previous</button><button disabled={step === activeLab.protocol.length - 1} onClick={() => setStep((value) => value + 1)}>Next <ChevronRight /></button></div></article>
          <article className="biovl-quiz-card"><div className="biovl-card-label"><GraduationCap /> CONCEPT CHECK</div><h2>{activeLab.quiz.prompt}</h2><div className="biovl-quiz-options">{activeLab.quiz.choices.map((choice, index) => <label key={choice} className={quizChoice === index ? "selected" : ""}><input type="radio" name={`quiz-${activeId}`} checked={quizChoice === index} onChange={() => { setQuizChoice(index); setQuizChecked(false); }} />{choice}</label>)}</div><button className="primary" disabled={quizChoice === null} onClick={answerQuiz}>Check answer</button>{quizChecked && <p className={quizChoice === activeLab.quiz.answer ? "correct" : "incorrect"}><strong>{quizChoice === activeLab.quiz.answer ? "Correct." : "Not quite."}</strong> {activeLab.quiz.explanation}</p>}</article>
        </section>
      </main>
      <aside className="biovl-notebook"><div className="biovl-notebook-head"><div><BookOpen /><span><strong>Lab notebook</strong><small>Saved on this device</small></span></div><span>{history.length} runs</span></div><div className="biovl-notebook-tabs">{["Hypothesis", "Observations", "Conclusion", "Instructor feedback"].map((item) => <button key={item} className={notebookTab === item ? "active" : ""} onClick={() => setNotebookTab(item)}>{item}</button>)}</div><textarea value={currentNotes[notebookTab] || ""} onChange={(event) => setNotes((all) => ({ ...all, [activeId]: { ...currentNotes, [notebookTab]: event.target.value } }))} placeholder={`Record ${notebookTab.toLowerCase()} for ${activeLab.title}…`} /><div className="biovl-export-row"><button disabled={!history.length} onClick={exportCsv}><Download /> CSV</button><button onClick={() => window.print()}><Printer /> Print / PDF</button></div><section className="biovl-history"><h2>Recent measurements</h2>{history.filter((item) => item.labId === activeId).slice(0, 5).map((item) => <article key={item.id}><span>{item.time}</span><strong>{item.result}</strong></article>)}{!history.some((item) => item.labId === activeId) && <p>Pass the safety checkpoint and run this experiment to capture a result.</p>}</section><section className="biovl-coverage"><h2>Implemented toolkit</h2><ul><li>25 complete lab workspaces</li><li>Live calculations and visual feedback</li><li>Safety and procedural checkpoints</li><li>Randomised repeat practice</li><li>Device-local notes and exports</li><li>Accessible keyboard and touch controls</li></ul></section></aside>
    </div>
    <div className="sr-only" aria-live="polite">{notice}</div>{notice && <div className="biovl-toast" role="status">{notice}</div>}
  </div>;
}
