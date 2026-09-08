import { useMemo, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Database,
  Download,
  FlaskConical,
  GitCompare,
  Microscope,
  Route,
  Sigma,
} from "lucide-react";
import {
  literatureWorkflowChecklist,
  nonlinearModelGuides,
  researchDomains,
  researchNotebookSections,
  researchReadinessChecks,
  researchToolkitStats,
  researchWorkflowTemplates,
} from "../data/researchChemistryToolkit.js";

const sampleCsv = `x,y
0,0.04
1,1.12
2,2.05
3,3.18
4,3.95
5,5.08`;

const statusStyle = {
  Active: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Needed: "border-amber-300/25 bg-amber-300/10 text-amber-100",
};

const parsePairs = (text) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[\s,;\t]+/).map(Number))
    .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));

const fitLinear = (rows) => {
  if (rows.length < 2) return null;
  const n = rows.length;
  const sx = rows.reduce((total, [x]) => total + x, 0);
  const sy = rows.reduce((total, [, y]) => total + y, 0);
  const sxx = rows.reduce((total, [x]) => total + x * x, 0);
  const sxy = rows.reduce((total, [x, y]) => total + x * y, 0);
  const syy = rows.reduce((total, [, y]) => total + y * y, 0);
  const denominator = n * sxx - sx * sx;
  if (Math.abs(denominator) < 1e-9) return null;
  const slope = (n * sxy - sx * sy) / denominator;
  const intercept = (sy - slope * sx) / n;
  const ssTot = syy - (sy * sy) / n;
  const ssRes = rows.reduce(
    (total, [x, y]) => total + (y - (slope * x + intercept)) ** 2,
    0,
  );
  const r2 = ssTot > 0 ? 1 - ssRes / ssTot : 1;
  const residuals = rows.map(([x, y]) => ({
    x,
    y,
    predicted: slope * x + intercept,
    residual: y - (slope * x + intercept),
  }));
  return { slope, intercept, r2, ssRes, residuals };
};

const DataFitSvg = ({ rows, fit }) => {
  const xs = rows.map(([x]) => x);
  const ys = rows.map(([, y]) => y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 1);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 1);
  const xScale = (x) => 48 + ((x - minX) / Math.max(1e-9, maxX - minX)) * 520;
  const yScale = (y) => 230 - ((y - minY) / Math.max(1e-9, maxY - minY)) * 170;
  const y1 = fit ? fit.slope * minX + fit.intercept : minY;
  const y2 = fit ? fit.slope * maxX + fit.intercept : maxY;

  return (
    <svg
      viewBox="0 0 620 280"
      className="h-72 w-full rounded-2xl border border-white/10 bg-black/20"
    >
      <line x1="44" y1="236" x2="584" y2="236" stroke="#64748b" />
      <line x1="44" y1="40" x2="44" y2="236" stroke="#64748b" />
      <text x="48" y="264" fill="#94a3b8" fontSize="12">
        x / concentration / time
      </text>
      <text x="60" y="32" fill="#94a3b8" fontSize="12">
        y / response
      </text>
      {fit && (
        <line
          x1={xScale(minX)}
          y1={yScale(y1)}
          x2={xScale(maxX)}
          y2={yScale(y2)}
          stroke="#38bdf8"
          strokeWidth="4"
        />
      )}
      {rows.map(([x, y], index) => (
        <circle
          key={`${x}-${y}-${index}`}
          cx={xScale(x)}
          cy={yScale(y)}
          r="6"
          fill="#22c55e"
        />
      ))}
      {fit?.residuals.map((point) => (
        <line
          key={`r-${point.x}-${point.y}`}
          x1={xScale(point.x)}
          y1={yScale(point.y)}
          x2={xScale(point.x)}
          y2={yScale(point.predicted)}
          stroke="#f59e0b"
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      ))}
    </svg>
  );
};

export const ResearchChemistryToolkitPage = ({ onNavigate }) => {
  const [activeDomain, setActiveDomain] = useState("data-fitting");
  const [activeWorkflowId, setActiveWorkflowId] = useState("kinetics-fitting");
  const [csvText, setCsvText] = useState(sampleCsv);
  const [compoundName, setCompoundName] = useState("Ethyl acetate");
  const [smiles, setSmiles] = useState("CCOC(=O)C");
  const [compoundNotes, setCompoundNotes] = useState(
    "Reference compound for kinetics and spectroscopy checks.",
  );
  const [notice, setNotice] = useState("");
  const visibleWorkflows = useMemo(
    () =>
      researchWorkflowTemplates.filter(
        (workflow) => workflow.domain === activeDomain,
      ),
    [activeDomain],
  );
  const activeWorkflow =
    visibleWorkflows.find((workflow) => workflow.id === activeWorkflowId) ||
    visibleWorkflows[0] ||
    researchWorkflowTemplates[0];
  const rows = useMemo(() => parsePairs(csvText), [csvText]);
  const fit = useMemo(() => fitLinear(rows), [rows]);
  const announce = (message) => setNotice(message);

  const selectDomain = (domainId) => {
    const next = researchWorkflowTemplates.find(
      (workflow) => workflow.domain === domainId,
    );
    setActiveDomain(domainId);
    setActiveWorkflowId(next?.id || activeWorkflowId);
    announce(
      `${researchDomains.find((domain) => domain.id === domainId)?.label || domainId} lane selected`,
    );
  };

  const exportNotebookJson = () => {
    const payload = {
      createdAt: new Date().toISOString(),
      workflow: activeWorkflow,
      fit,
      notebookSections: researchNotebookSections,
      rawData: csvText,
      compound: { name: compoundName, smiles, notes: compoundNotes },
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chemistry-research-${activeWorkflow.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    announce("Notebook JSON exported");
  };

  return (
    <div className="mx-auto h-[calc(100vh-70px)] max-w-7xl space-y-4 overflow-hidden p-4 md:p-6">
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-950 via-cyan-950/35 to-violet-950/45 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Microscope size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Research Chemistry Toolkit</h2>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-gray-400">
              PhD-ready workflow scaffolding for data fitting, ELN provenance,
              cheminformatics triage, computational planning and reproducible
              research outputs.
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            <Metric
              value={researchToolkitStats.domains}
              label="domains"
              tone="text-white"
            />
            <Metric
              value={researchToolkitStats.workflows}
              label="workflows"
              tone="text-cyan-100"
            />
            <Metric
              value={researchToolkitStats.notebookSections}
              label="ELN sections"
              tone="text-emerald-100"
            />
            <Metric
              value={researchToolkitStats.checks}
              label="checks"
              tone="text-amber-100"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[285px_1fr]">
        <aside className="glass h-fit rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-2">
            <Route size={16} className="text-cyan-300" />
            <h3 className="text-sm font-bold text-white">Research Lane</h3>
          </div>
          <div className="space-y-2">
            {researchDomains.map((domain) => (
              <button
                key={domain.id}
                type="button"
                onClick={() => selectDomain(domain.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${activeDomain === domain.id ? "border-cyan-300/40 bg-cyan-300/12" : "border-white/10 bg-white/[0.035] hover:bg-white/[0.065]"}`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: domain.color }}
                  />
                  <span className="text-sm font-black text-white">
                    {domain.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{domain.focus}</p>
              </button>
            ))}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="glass rounded-2xl p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">
                  {activeWorkflow.level}
                </p>
                <h3 className="mt-1 text-lg font-black text-white">
                  {activeWorkflow.title}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleWorkflows.map((workflow) => (
                  <button
                    key={workflow.id}
                    type="button"
                    onClick={() => {
                      setActiveWorkflowId(workflow.id);
                      announce(`${workflow.title} workflow selected`);
                    }}
                    className={`rounded-xl border px-3 py-2 text-xs font-black transition-colors ${activeWorkflow.id === workflow.id ? "border-cyan-300/40 bg-cyan-300/15 text-cyan-50" : "border-white/10 bg-white/[0.035] text-gray-400 hover:text-gray-200"}`}
                  >
                    {workflow.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <FlaskConical size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  Compound Workspace
                </h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <label className="text-xs text-gray-400">
                  Compound name
                  <input
                    value={compoundName}
                    onChange={(event) => setCompoundName(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/40"
                  />
                </label>
                <label className="text-xs text-gray-400">
                  SMILES
                  <input
                    value={smiles}
                    onChange={(event) => setSmiles(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 font-mono text-sm text-cyan-100 outline-none focus:border-cyan-300/40"
                  />
                </label>
              </div>
              <label className="mt-2 block text-xs text-gray-400">
                Research notes
                <textarea
                  value={compoundNotes}
                  onChange={(event) => setCompoundNotes(event.target.value)}
                  className="mt-1 min-h-20 w-full rounded-lg border border-white/10 bg-black/25 px-3 py-2 text-sm text-gray-200 outline-none focus:border-cyan-300/40"
                />
              </label>
              <p className="mt-2 rounded-lg border border-emerald-300/15 bg-emerald-300/10 px-3 py-2 text-xs text-emerald-100">
                Workspace state is included in the JSON notebook export.
              </p>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white">
                    Workflow Evidence Map
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    {activeWorkflow.goal}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    announce(`Opening ${activeWorkflow.title}`);
                    onNavigate?.(activeWorkflow.route);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-black text-cyan-100 hover:bg-cyan-300/15"
                >
                  <Route size={14} /> Open Tool
                </button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <ListPanel
                  title="Inputs"
                  icon={Database}
                  items={activeWorkflow.inputs}
                />
                <ListPanel
                  title="Outputs"
                  icon={Sigma}
                  items={activeWorkflow.outputs}
                />
                <ListPanel
                  title="Validity Checks"
                  icon={BadgeCheck}
                  items={activeWorkflow.checks}
                />
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Download size={16} className="text-emerald-300" />
                  <h3 className="text-sm font-bold text-white">
                    Notebook Export
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={exportNotebookJson}
                  className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-black text-emerald-100 hover:bg-emerald-300/15"
                >
                  JSON
                </button>
              </div>
              <div className="space-y-2">
                {researchNotebookSections.map((section) => (
                  <div
                    key={section.id}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <p className="text-sm font-black text-white">
                      {section.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {section.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  CSV / Data Input
                </h3>
              </div>
              <textarea
                value={csvText}
                onChange={(event) => setCsvText(event.target.value)}
                className="min-h-56 w-full rounded-xl border border-white/10 bg-black/25 p-3 font-mono text-xs text-gray-200 outline-none focus:border-cyan-300/40"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Metric
                  value={rows.length}
                  label="data rows"
                  tone="text-cyan-100"
                />
                <Metric
                  value={fit ? fit.r2.toFixed(4) : "n/a"}
                  label="R2"
                  tone="text-emerald-100"
                />
              </div>
              {fit && (
                <p className="mt-3 rounded-xl border border-cyan-300/15 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-50">
                  y = {fit.slope.toFixed(4)}x + {fit.intercept.toFixed(4)};
                  residual sum = {fit.ssRes.toFixed(4)}
                </p>
              )}
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  Fit and Residual View
                </h3>
              </div>
              <DataFitSvg
                rows={rows.length ? rows : parsePairs(sampleCsv)}
                fit={fit || fitLinear(parsePairs(sampleCsv))}
              />
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <Sigma size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  Nonlinear Model Guide
                </h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {nonlinearModelGuides.map((item) => (
                  <div
                    key={item.model}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <p className="text-sm font-black text-white">
                      {item.model}
                    </p>
                    <p className="mt-1 rounded-lg border border-cyan-300/15 bg-cyan-300/10 px-2 py-1 font-mono text-[11px] font-bold text-cyan-100">
                      {item.equation}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">{item.use}</p>
                    <p className="mt-2 text-[11px] font-semibold text-amber-100">
                      {item.watch}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-rose-300" />
                <h3 className="text-sm font-bold text-white">
                  Literature Claim Workflow
                </h3>
              </div>
              <div className="space-y-2">
                {literatureWorkflowChecklist.map((item, index) => (
                  <div
                    key={item.step}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-rose-300/10 text-[10px] font-black text-rose-100">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-sm font-black text-white">
                          {item.step}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {item.detail}
                        </p>
                        <p className="mt-1 text-[11px] font-semibold text-emerald-100">
                          Output: {item.output}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen size={16} className="text-cyan-300" />
                <h3 className="text-sm font-bold text-white">
                  Research Readiness
                </h3>
              </div>
              <div className="space-y-2">
                {researchReadinessChecks.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-black text-white">
                        {item.title}
                      </p>
                      <span
                        className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-black ${statusStyle[item.status] || statusStyle.Needed}`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-4">
              <div className="mb-3 flex items-center gap-2">
                <GitCompare size={16} className="text-amber-300" />
                <h3 className="text-sm font-bold text-white">
                  Research Tool Routes
                </h3>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  ["Chemistry Solver", "chemistry-solver"],
                  ["Drug Discovery Suite", "drug-discovery"],
                  ["Spectroscopy", "spectroscopy-interpreter"],
                  ["Molecular Symmetry", "symmetry"],
                ].map(([label, route]) => (
                  <button
                    key={route}
                    type="button"
                    onClick={() => onNavigate?.(route)}
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-left text-xs font-black text-gray-200 hover:bg-white/[0.065]"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </main>
      </section>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 z-20 rounded-full border border-cyan-300/40 bg-slate-950/95 px-4 py-2 text-xs text-cyan-100"
        >
          {notice}
        </div>
      )}
    </div>
  );
};

const Metric = ({ value, label, tone }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-center">
    <p className={`text-lg font-black ${tone}`}>{value}</p>
    <p className="text-[10px] text-gray-500">{label}</p>
  </div>
);

const ListPanel = ({ title, icon: Icon, items }) => (
  <div className="rounded-xl border border-white/10 bg-black/15 p-3">
    <div className="mb-2 flex items-center gap-2">
      <Icon size={14} className="text-cyan-200" />
      <p className="text-xs font-black text-white">{title}</p>
    </div>
    <div className="space-y-1.5">
      {items.map((item) => (
        <p key={item} className="flex gap-2 text-xs text-gray-300">
          <CheckCircle2
            size={13}
            className="mt-0.5 shrink-0 text-emerald-300"
          />
          {item}
        </p>
      ))}
    </div>
  </div>
);

export default ResearchChemistryToolkitPage;
