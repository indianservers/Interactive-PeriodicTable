import '../utilityLabs.css';
import { useEffect, useRef, useState } from 'react';
import { savePharmaReport, downloadPharmaJson } from '../labReports.js';
import PublishedExperiment, { ExperimentDataMode } from './PublishedExperiment.jsx';
import ExperimentComparison from './ExperimentComparison.jsx';
import { remainingPublishedLabs } from '../data/publishedDataRegistry.js';
import {
  Accessibility,
  ChevronLeft,
  ChevronRight,
  Database,
  FlaskConical,
  RotateCcw,
  Save,
  Search,
  Settings2,
} from "lucide-react";
import { medicineJourney } from "../data/compounds.js";
import { searchGlobal } from '../../../data/globalSearch.js';
import "../pharmaLab.css";
import "../shellEnhancements.css";
import '../targetPresentation.css';

const labPages = [
  ["visuals/pharma/lab", "Lab Home"],
  ["visuals/pharma/medicinal-chemistry", "Medicinal Chemistry"],
  ["visuals/pharma/api-synthesis", "API Synthesis"],
  ["visuals/pharma/preformulation", "Preformulation"],
  ["visuals/pharma/tablet-formulation", "Tablet Formulation"],
  ["visuals/pharma/dissolution", "Dissolution"],
  ["visuals/pharma/hplc", "HPLC"],
  ["visuals/pharma/stability", "Stability"],
  ["visuals/pharma/adme", "ADME"],
  ["visuals/pharma/toxicology", "Toxicology"],
  ["visuals/pharma/dosage", "Dosage Forms"],
  ["visuals/pharma/qc", "Assay & QC"],
  ["visuals/pharma/buffers", "Buffers"],
  ["visuals/pharma/dosage", "Dosage Designer"],
  ["visuals/pharma/qc", "QC Calculations"],
  ["visuals/pharma/buffers", "Buffer Formulator"],
];

export default function PharmaLabShell({
  children,
  query,
  setQuery,
  activeStage = 0,
  onReset,
  onSuspend,
  onSave,
  onSources,
  reducedMotion,
  setReducedMotion,
}) {
  const [notice, setNotice] = useState('');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [evidenceMode, setEvidenceMode] = useState('simulation');
  const [evidenceKey, setEvidenceKey] = useState(0);
  const searchInput = useRef(null);
  useEffect(() => {const onKey=e=>{if(e.key==='Escape'){setSettingsOpen(false);setQuery('')}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[setQuery]);
  const appMatches=query?.trim()?searchGlobal(query).filter(item=>item.id):[];
  const saveReport=()=>{try{savePharmaReport();setNotice('Report saved on this device and downloaded.')}catch(error){setNotice('Report could not be saved: '+error.message)}};
  const route = window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
  const evidenceLab = route.startsWith('visuals/pharma/') && remainingPublishedLabs[route.split('/').at(-1)] ? route.split('/').at(-1) : null;
  const showingEvidence = Boolean(evidenceLab && evidenceMode === 'published');
  const showingComparison = Boolean(evidenceLab && evidenceMode === 'comparison');
  useEffect(() => { setEvidenceMode('simulation'); }, [route]);
  const showSources = () => showingEvidence || showingComparison ? document.querySelector('.published-source')?.scrollIntoView({ behavior: 'smooth', block: 'start' }) : onSources?.();
  const resetWorkspace = () => { onReset?.(); setEvidenceKey(value => value + 1); };
  const pageIndex = labPages.findIndex(([path]) => path === route);
  const previousPage = pageIndex > 0 ? labPages[pageIndex - 1] : null;
  const nextPage =
    pageIndex >= 0 && pageIndex < labPages.length - 1
      ? labPages[pageIndex + 1]
      : null;
  return (
    <div className={`plab ${reducedMotion ? "plab-reduced" : ""}`}>
      <header className="plab-header">
        <a
          className="plab-brand"
          href="#/visuals/pharma/lab"
          aria-label="Pharmaceutical Chemistry Lab home"
        >
          <span className="plab-brandmark">
            <FlaskConical />
          </span>
          <span>
            <strong>Pharmaceutical Chemistry Lab</strong>
            <small>FROM MOLECULE TO MEDICINE</small>
          </span>
        </a>
        <label className="plab-search" style={{position:"relative"}}>
          <Search size={16} />
          <input
            ref={searchInput}
            aria-label="Search pharmaceutical workspaces"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search compounds, experiments, modules…"
          />
          <kbd>Ctrl K</kbd>
          {query?.trim() && <div className="plab-global-results">{appMatches.map((item,index)=><a key={`${item.id}-${index}`} href={`#/${item.id}`}>{item.label}</a>)}{!appMatches.length&&<span>No app matches. Local table results remain below.</span>}</div>}
        </label>
        <div className="plab-header-actions">
          {previousPage ? (
            <a
              className="plab-stage-arrow"
              href={`#/${previousPage[0]}`}
              title={`Previous: ${previousPage[1]}`}
            >
              <ChevronLeft size={17} />
            </a>
          ) : (
            <a className="plab-stage-arrow" href="#/visuals/pharma" title="Pharmaceutical overview" aria-label="Pharmaceutical overview">
              <ChevronLeft size={17} />
            </a>
          )}
          {nextPage ? (
            <a
              className="plab-stage-arrow"
              href={`#/${nextPage[0]}`}
              title={`Next: ${nextPage[1]}`}
            >
              <ChevronRight size={17} />
            </a>
          ) : (
            <button disabled title="Final page">
              <ChevronRight size={17} />
            </button>
          )}
          <button onClick={showSources} title="Open data sources">
            <Database size={17} />
          </button>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
            title="Toggle reduced motion"
          >
            <Accessibility size={17} />
          </button>
          <button onClick={resetWorkspace} title="Reset lab home">
            <RotateCcw size={17} />
          </button>
          <button onClick={saveReport} title="Save learning report">
            <Save size={17} />
          </button>
          <button
            onClick={() => setSettingsOpen(value=>!value)}
            aria-expanded={settingsOpen}
            title="Workspace settings"
          >
            <Settings2 size={17} />
          </button>
          <span className="plab-avatar">SL</span>
        </div>
      </header>
      <details className="plab-workspace-menu"><summary>Workspaces</summary><nav className="plab-workspaces" aria-label="Pharmaceutical lab workspaces">
        {labPages.map(([path, label]) => <a key={path} href={`#/${path}`} aria-current={route === path ? 'page' : undefined}>{label}</a>)}
      </nav></details>
      <nav className="plab-journey" aria-label="Medicine journey">
        <div className="plab-journey-title">
          <strong>The medicine journey</strong>
          <small>8 connected stages · molecule to patient</small>
        </div>
        <div className="plab-journey-track">
          {medicineJourney.map((stage, index) => (
            <a
              key={stage.id}
              href={`#/${stage.route}`}
              className={
                index === activeStage
                  ? "active"
                  : ""
              }
              aria-current={index === activeStage ? "step" : undefined}
              title={stage.label}
            >
              <span>{index + 1}</span>
              <b>{stage.label}</b>
              <small>{stage.short}</small>
            </a>
          ))}
        </div>
      </nav>
      <div className="plab-data-notice"><b>Data provenance:</b> Published measurements carry study citations. PubChem identities and PDB coordinates are reference data. Teaching simulations are labeled calculated results, not measured batches or clinical predictions. <button onClick={showSources}>View page sources</button></div>
      {settingsOpen&&<section className="plab-settings-panel" aria-label="Workspace settings"><label><input type="checkbox" checked={reducedMotion} onChange={e=>setReducedMotion(e.target.checked)}/> Reduce decorative motion</label><button onClick={saveReport}>Save and download current report</button><button onClick={()=>{const report=localStorage.getItem(`pharma-report:${location.hash}`);if(report)downloadPharmaJson('saved-pharma-report.json',JSON.parse(report));else setNotice('No saved report exists for this page.')}}>Download saved report</button><button onClick={()=>setSettingsOpen(false)}>Close settings</button></section>}
      {evidenceLab && <ExperimentDataMode value={evidenceMode} workspaceLabel={evidenceLab === 'medicinal-chemistry' ? 'Sourced structures · calculated contacts' : 'Teaching simulation · calculated results'} onChange={value => { onSuspend?.(); setEvidenceMode(value); }}/ >}
      {showingComparison ? <ExperimentComparison key={`${evidenceLab}:${evidenceKey}`} lab={evidenceLab}/> : showingEvidence ? <PublishedExperiment key={`${evidenceLab}:${evidenceKey}`} lab={evidenceLab}/> : children}
      {notice&&<div className="plab-status" role="status"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="Dismiss report status"> ×</button></div>}
    </div>
  );
}
