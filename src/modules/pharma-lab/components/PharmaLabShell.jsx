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
import "../shellEnhancements.css";

const labPages = [
  ["visuals/pharma", "Lab Home"],
  ["visuals/pharma/medicinal-chemistry", "Medicinal Chemistry"],
  ["visuals/pharma/api-synthesis", "API Synthesis"],
  ["visuals/pharma/preformulation", "Preformulation"],
  ["visuals/pharma/tablet-formulation", "Tablet Formulation"],
  ["visuals/pharma/dissolution", "Dissolution"],
  ["visuals/pharma/hplc", "HPLC"],
  ["visuals/pharma/stability", "Stability"],
  ["visuals/pharma/adme", "ADME"],
  ["visuals/pharma/toxicology", "Toxicology"],
];

export default function PharmaLabShell({
  children,
  query,
  setQuery,
  activeStage = 0,
  onReset,
  onSave,
  onSources,
  reducedMotion,
  setReducedMotion,
}) {
  const route = window.location.hash.replace(/^#\/?/, "").replace(/\/$/, "");
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
          href="#/visuals/pharma"
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
        <label className="plab-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search compounds, experiments, modules…"
          />
          <kbd>⌘ K</kbd>
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
            <button disabled title="No previous page">
              <ChevronLeft size={17} />
            </button>
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
          <button onClick={onSources} title="Open data sources">
            <Database size={17} />
          </button>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
            title="Toggle reduced motion"
          >
            <Accessibility size={17} />
          </button>
          <button onClick={onReset} title="Reset lab home">
            <RotateCcw size={17} />
          </button>
          <button onClick={onSave} title="Save learning report">
            <Save size={17} />
          </button>
          <button
            onClick={() => setReducedMotion(!reducedMotion)}
            aria-pressed={reducedMotion}
            title="Toggle low-motion lab settings"
          >
            <Settings2 size={17} />
          </button>
          <span className="plab-avatar">SL</span>
        </div>
      </header>
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
                  : index < activeStage
                    ? "complete"
                    : ""
              }
              aria-current={index === activeStage ? "step" : undefined}
              title={stage.label}
            >
              <span>{index < activeStage ? "✓" : index + 1}</span>
              <b>{stage.short}</b>
              <small>{stage.label}</small>
            </a>
          ))}
        </div>
      </nav>
      {children}
    </div>
  );
}
