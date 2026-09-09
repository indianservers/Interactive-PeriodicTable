import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CircleHelp,
  Database,
  FlaskConical,
  Folder,
  HelpCircle,
  Home,
  Menu,
  Network,
  Search,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { ALL_PROVENANCE, ROUTES, SEARCH_INDEX } from "./drugDiscoveryData.js";
import {
  AdmePage,
  AnalyticsPage,
  CommandCenterPage,
  DesignPage,
  NotebookPage,
  SafetyPage,
  ScreeningPage,
  TargetPage,
  TeamPage,
  WorkspacePage,
} from "./DrugDiscoveryPages.jsx";
import "./DrugDiscoveryStudio.css";

const icons = {
  home: Home,
  workspace: FlaskConical,
  targets: Settings,
  screening: Search,
  design: Network,
  adme: Beaker,
  safety: ShieldCheck,
  analytics: BarChart3,
  notebooks: BookOpen,
  team: Users,
};
const pages = {
  home: CommandCenterPage,
  workspace: WorkspacePage,
  targets: TargetPage,
  screening: ScreeningPage,
  design: DesignPage,
  adme: AdmePage,
  safety: SafetyPage,
  analytics: AnalyticsPage,
  notebooks: NotebookPage,
  team: TeamPage,
};

const routeFromLocation = () => {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const nested = hash.match(/^drug-discovery\/?(.*)$/)?.[1] || "";
  return nested || "workspace";
};

export default function DrugDiscoveryStudio() {
  const [route, setRoute] = useState(routeFromLocation);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [provenanceOpen, setProvenanceOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectSaved, setProjectSaved] = useState(false);
  useEffect(() => {
    const sync = () => setRoute(routeFromLocation());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const navigate = (next) => {
    window.location.hash =
      next === "workspace" ? "/drug-discovery" : `/drug-discovery/${next}`;
    setRoute(next);
    setSidebarOpen(false);
  };
  const results = useMemo(
    () =>
      query.trim().length < 2
        ? []
        : SEARCH_INDEX.filter((item) =>
            `${item.title} ${item.detail} ${item.type} ${item.source}`
              .toLowerCase()
              .includes(query.toLowerCase()),
          ).slice(0, 12),
    [query],
  );
  const Page = pages[route] || WorkspacePage;

  return (
    <div className="dds-app">
      <header className="dds-header">
        <button
          className="dds-mobile-menu"
          aria-label="Open navigation"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu />
        </button>
        <Network className="dds-logo" />
        <div className="dds-brand">
          <h1>Drug Discovery Studio</h1>
          <p>From molecules to better medicines</p>
        </div>
        <label className="dds-global-search">
          <Search />
          <input
            aria-label="Global search"
            value={query}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search targets, molecules, projects, assays…"
          />
          <kbd>⌘ K</kbd>
        </label>
        <nav>
          <button onClick={() => navigate("home")}>
            <Folder />
            Projects
          </button>
          <button onClick={() => setProvenanceOpen(true)}>
            <Database />
            Sources
          </button>
          <button>
            <HelpCircle />
            Help
          </button>
          <span>EP</span>
          <b>
            Dr. Elena Park<small>Medicinal Chemistry</small>
          </b>
        </nav>
      </header>
      <aside className={`dds-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <button
          className="dds-side-close"
          onClick={() => setSidebarOpen(false)}
        >
          <X />
        </button>
        <nav>
          {ROUTES.map(([id, label]) => {
            const Icon = icons[id];
            return (
              <button
                key={id}
                className={route === id ? "is-active" : ""}
                onClick={() => navigate(id)}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </nav>
        <div className="dds-side-motto">
          <strong>
            Better science
            <br />
            Healthier tomorrow
          </strong>
          <span />
        </div>
      </aside>
      <main className="dds-page">
        <Page
          navigate={navigate}
          onProvenance={() => setProvenanceOpen(true)}
          onSaved={() => setProjectSaved(true)}
        />
      </main>
      {sidebarOpen && (
        <button
          className="dds-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {searchOpen && (
        <div className="dds-search-popover">
          <header>
            <Search />
            <b>Global scientific search</b>
            <button onClick={() => setSearchOpen(false)}>
              <X />
            </button>
          </header>
          {!query.trim() && (
            <p>
              Search PTGS2, P35354, 5IKR, CID 4044, CHEMBL230, assays or
              notebook entries.
            </p>
          )}
          {query && !results.length && (
            <p>
              No cached result. Live external search is not silently
              substituted.
            </p>
          )}
          {results.map((item) => (
            <button
              key={`${item.type}-${item.title}`}
              onClick={() => {
                navigate(item.route);
                setSearchOpen(false);
              }}
            >
              <span>{item.type}</span>
              <b>{item.title}</b>
              <small>{item.detail}</small>
              <em>{item.source}</em>
            </button>
          ))}
        </div>
      )}
      {searchOpen && (
        <button
          className="dds-search-scrim"
          aria-label="Close search"
          onClick={() => setSearchOpen(false)}
        />
      )}
      <aside className={`dds-provenance ${provenanceOpen ? "is-open" : ""}`}>
        <header>
          <div>
            <Database />
            <b>Source and provenance</b>
          </div>
          <button onClick={() => setProvenanceOpen(false)}>
            <X />
          </button>
        </header>
        <p>
          Every scientific entity retains its source identifier, method and
          evidence class. Retrieved {ALL_PROVENANCE[0]?.retrievedAt}.
        </p>
        {ALL_PROVENANCE.filter(
          (p, i, all) =>
            all.findIndex(
              (x) =>
                `${x.sourceDatabase}-${x.sourceId}` ===
                `${p.sourceDatabase}-${p.sourceId}`,
            ) === i,
        ).map((p) => (
          <article key={`${p.sourceDatabase}-${p.sourceId}`}>
            <span>{p.experimentalOrPredicted}</span>
            <b>
              {p.sourceDatabase} · {p.sourceId}
            </b>
            <small>{p.method || p.notes}</small>
            <a href={p.sourceUrl} target="_blank" rel="noreferrer">
              Open source ↗
            </a>
          </article>
        ))}
      </aside>
      {projectSaved && (
        <div className="dds-toast" role="status">
          <CircleHelp />
          Project state saved on this device.
          <button onClick={() => setProjectSaved(false)}>×</button>
        </div>
      )}
    </div>
  );
}
