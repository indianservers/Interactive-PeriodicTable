import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, ChevronRight, Download, Microscope, ShieldCheck, Sparkles, X } from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import PharmaMoleculeViewer from "./components/PharmaMoleculeViewer.jsx";
import { pharmaCompounds, pharmaSources, recentExperiments } from "./data/compounds.js";
import "./pharmaLab.css";

const storageKey = "chemistry-universe:pharma-lab-home:v1";
const moduleCards = [
  { name: "Medicinal Chemistry", detail: "Targets, docking and SAR", route: "visuals/pharma/medicinal-chemistry", icon: Sparkles },
  { name: "API Synthesis", detail: "Routes, yield and green metrics", route: "visuals/pharma/api-synthesis", icon: Microscope },
  { name: "Dosage Design", detail: "Preformulation to tablets", route: "visuals/pharma/preformulation", icon: BookOpen },
  { name: "Quality & Translation", detail: "Dissolution, HPLC, ADME and safety", route: "visuals/pharma/dissolution", icon: ShieldCheck },
];

export default function LabHomePage() {
  const [selectedId, setSelectedId] = useState(() => { try { return JSON.parse(localStorage.getItem(storageKey))?.selectedId || "paracetamol"; } catch { return "paracetamol"; } });
  const [query, setQuery] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => localStorage.getItem(`${storageKey}:motion`) === "true");
  const [saved, setSaved] = useState(false);
  const selected = pharmaCompounds.find((item) => item.id === selectedId) || pharmaCompounds[0];
  const filteredCompounds = useMemo(() => pharmaCompounds.filter((item) => `${item.name} ${item.className} ${item.formula}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredExperiments = useMemo(() => recentExperiments.filter((item) => `${item.title} ${item.compound}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const filteredModules = useMemo(() => moduleCards.filter((item) => `${item.name} ${item.detail}`.toLowerCase().includes(query.toLowerCase())), [query]);
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify({ selectedId, lastVisit: new Date().toISOString(), stage: 1 })), [selectedId]);
  useEffect(() => localStorage.setItem(`${storageKey}:motion`, String(reducedMotion)), [reducedMotion]);
  const reset = () => { setSelectedId("paracetamol"); setQuery(""); setReducedMotion(false); setSaved(false); };
  const exportReport = () => {
    const report = { title: "Pharmaceutical Chemistry Lab learning report", generatedAt: new Date().toISOString(), activeCompound: selected, journeyProgress: "1 of 8 stages", recentExperiments };
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `pharma-lab-${selected.id}-report.json`; anchor.click(); URL.revokeObjectURL(url); setSaved(true);
  };
  return (
    <PharmaLabShell query={query} setQuery={setQuery} activeStage={0} onReset={reset} onSave={exportReport} onSources={() => setSourcesOpen(true)} reducedMotion={reducedMotion} setReducedMotion={setReducedMotion}>
      <main className="plab-home">
        <section className="plab-hero">
          <div className="plab-hero-copy">
            <span className="plab-eyebrow">STAGE 01 · TARGET & DISCOVERY</span>
            <h1>Explore how a molecule<br/><em>becomes medicine.</em></h1>
            <p>Begin with a clinically familiar compound, inspect its validated structure, then follow its evidence through synthesis, formulation, quality and patient translation.</p>
            <div className="plab-hero-badges"><span><CheckCircle2/> Verified coordinates</span><span>5 case medicines</span><span>8 connected stages</span></div>
          </div>
          <PharmaMoleculeViewer compound={selected} reducedMotion={reducedMotion} />
          <aside className="plab-key-info">
            <span className="plab-panel-kicker">ACTIVE COMPOUND</span><h2>{selected.name}</h2><p>{selected.className}</p>
            <dl><div><dt>Molecular formula</dt><dd>{selected.formula}</dd></div><div><dt>Molar mass</dt><dd>{selected.mass}</dd></div><div><dt>PubChem CID</dt><dd>{selected.cid}</dd></div><div><dt>Learning status</dt><dd className="cyan">{selected.status}</dd></div></dl>
            <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${selected.cid}`} target="_blank" rel="noreferrer">Open primary record <ArrowRight size={14}/></a>
            <div className="plab-progress"><span><b>Journey progress</b><small>1 of 8 stages</small></span><div><i /></div></div>
          </aside>
        </section>

        <section className="plab-compound-strip" aria-label="Choose a case compound">
          <div><span className="plab-panel-kicker">CASE COMPOUNDS</span><h2>Choose a medicine to follow</h2></div>
          <div className="plab-compounds">{filteredCompounds.map((item) => <button key={item.id} className={item.id === selected.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><i style={{ background: item.color }} /><span><b>{item.name}</b><small>{item.className}</small></span><ChevronRight size={15}/></button>)}{!filteredCompounds.length && <p>No compound matches “{query}”.</p>}</div>
        </section>

        <section className="plab-lower-grid">
          <div className="plab-recent"><div className="plab-section-head"><span><span className="plab-panel-kicker">CONTINUE LEARNING</span><h2>Recent experiments</h2></span><a href="#/visuals/pharma/medicinal-chemistry">View laboratory <ArrowRight size={14}/></a></div>
            <div className="plab-experiment-list">{filteredExperiments.map((item) => <article key={item.id}><div className="plab-experiment-icon"><Microscope /></div><span><b>{item.title}</b><small>{item.compound} · {item.time} completed</small><span className="plab-mini-progress"><i style={{ width: `${item.progress}%` }} /></span></span><strong>{item.progress}%</strong><a href={`#/${item.route}`}>Resume <ChevronRight size={14}/></a></article>)}{!filteredExperiments.length && <p>No experiments match your search.</p>}</div>
          </div>
          <aside className="plab-safety"><div className="plab-safety-icon"><ShieldCheck /></div><span><span className="plab-panel-kicker">LAB SAFETY</span><h2>Simulation workspace</h2><p>Educational values are clearly separated from verified reference data. Follow institutional SOPs for real laboratory work.</p><button onClick={() => setSourcesOpen(true)}>Review data provenance</button></span></aside>
        </section>

        <section className="plab-modules"><div className="plab-section-head"><span><span className="plab-panel-kicker">CORE LABORATORY</span><h2>Launch a module</h2></span><small>Every module carries the selected compound forward</small></div><div>{filteredModules.map(({ name, detail, route, icon: Icon }, index) => <a key={name} href={`#/${route}`}><span className="plab-module-number">0{index + 1}</span><Icon/><b>{name}</b><small>{detail}</small><ArrowRight /></a>)}</div></section>
      </main>
      {saved && <div className="plab-status" role="status">Learning report exported successfully.</div>}
      {sourcesOpen && <div className="plab-drawer-backdrop" onClick={() => setSourcesOpen(false)}><aside className="plab-drawer" onClick={(e) => e.stopPropagation()}><header><span><span className="plab-panel-kicker">PROVENANCE</span><h2>Data source panel</h2></span><button onClick={() => setSourcesOpen(false)} aria-label="Close sources"><X /></button></header><p>Coordinate structures are loaded directly from stored SDF records. Reference links open the corresponding primary compound record.</p>{pharmaSources.map((source) => <a key={source.label} href={source.url} target="_blank" rel="noreferrer"><span><b>{source.label}</b><small>{source.value}</small></span><ArrowRight size={15}/></a>)}<button className="plab-export" onClick={exportReport}><Download size={16}/> Export learning report</button></aside></div>}
    </PharmaLabShell>
  );
}
