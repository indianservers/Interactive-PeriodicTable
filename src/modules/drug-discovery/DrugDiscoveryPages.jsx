import { useEffect, useMemo, useRef, useState } from "react";
import { getRDKit } from "./rdkitService";
import {
  Activity,
  ArrowRight,
  Atom,
  BadgeCheck,
  BarChart3,
  Beaker,
  BookOpen,
  Box,
  Brain,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Database,
  Download,
  ExternalLink,
  FileCode2,
  FileText,
  FlaskConical,
  Folder,
  GitBranch,
  GitCompare,
  GripVertical,
  HeartPulse,
  Lightbulb,
  Link2,
  ListFilter,
  Maximize2,
  Menu,
  MessageSquare,
  Microscope,
  Network,
  Pause,
  Pencil,
  Pill,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Thermometer,
  Trash2,
  TrendingUp,
  Upload,
  Users,
  Wand2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import MolstarViewer from "../../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../../components/molecular-viewer/ViewerErrorBoundary.jsx";
import SmallMoleculeViewer from "./SmallMoleculeViewer.jsx";
import {
  ACTIVITIES,
  COX2_STRUCTURE,
  COX2_TARGET,
  COMPOUNDS,
  DESIGNED_ANALOG,
  SCREENING_STEPS,
} from "./drugDiscoveryData.js";

const cached = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};
const useStored = (key, fallback) => {
  const [value, setValue] = useState(() => cached(key, fallback));
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
};
const cls = (...parts) => parts.filter(Boolean).join(" ");

function Panel({ title, icon: Icon, actions, className, children }) {
  return (
    <section className={cls("dds-panel", className)}>
      <header>
        {Icon && <Icon />}
        <h3>{title}</h3>
        <CircleHelp className="dds-help" />
        {actions && <div className="dds-panel-actions">{actions}</div>}
      </header>
      {children}
    </section>
  );
}
function PageHeading({ eyebrow, title, subtitle, actions }) {
  return (
    <div className="dds-page-heading">
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h2>{title}</h2>
        {subtitle && <span>{subtitle}</span>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
}
function SourceBadge({ kind = "experimental", children }) {
  return (
    <span className={`dds-source ${kind}`} title="Source and provenance label">
      {kind === "experimental" ? (
        <BadgeCheck />
      ) : kind === "predicted" ? (
        <Sparkles />
      ) : (
        <Database />
      )}
      {children}
    </span>
  );
}
function Molecule2D({ compound, compact = false }) {
  return (
    <figure className={cls("dds-molecule-2d", compact && "is-compact")}>
      <img
        src={compound.image}
        alt={`PubChem 2D structure of ${compound.name}`}
      />
      <figcaption>
        <b>{compound.name}</b>
        <small>
          CID {compound.cid} · {compound.chembl}
        </small>
      </figcaption>
    </figure>
  );
}
function Metric({ icon: Icon, label, value, note, tone = "cyan" }) {
  return (
    <article className={`dds-metric ${tone}`}>
      <Icon />
      <div>
        <span>{label}</span>
        <b>{value}</b>
        <small>{note}</small>
      </div>
    </article>
  );
}
function MiniLine({ values, color = "#38bdf8", label }) {
  const max = Math.max(...values),
    min = Math.min(...values);
  const pts = values
    .map(
      (v, i) =>
        `${8 + i * (184 / (values.length - 1))},${70 - ((v - min) / Math.max(1, max - min)) * 52}`,
    )
    .join(" ");
  return (
    <svg
      className="dds-mini-line"
      viewBox="0 0 200 80"
      role="img"
      aria-label={label}
    >
      <polyline points={pts} style={{ stroke: color }} />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={8 + i * (184 / (values.length - 1))}
          cy={70 - ((v - min) / Math.max(1, max - min)) * 52}
          r="3"
          style={{ fill: color }}
        />
      ))}
    </svg>
  );
}
function ActivityWarning() {
  return (
    <div className="dds-assay-warning">
      <ShieldAlert />
      IC50 records below come from distinct ChEMBL assays. They are shown with
      assay IDs and are not assumed directly comparable.
    </div>
  );
}
function StructureViewer({
  compact = false,
  selectedResidue,
  onSelectResidue,
  representation = "surface",
  viewerRef,
}) {
  const representationConfig =
    representation === "cartoon"
      ? { Cartoon: true, Ligand: true }
      : representation === "sticks"
        ? { Sticks: true, Ligand: true }
        : { Cartoon: true, Surface: true, Ligand: true };
  return (
    <div className={cls("dds-protein-viewer", compact && "is-compact")}>
      <ViewerErrorBoundary>
        <MolstarViewer
          ref={viewerRef}
          source={{ url: COX2_STRUCTURE.source, label: "PDB 5IKR local cache" }}
          sourceType="mmcif"
          label="COX-2 · mefenamic acid"
          pdbId="5IKR"
          representation={representationConfig}
          colorScheme="chain"
          selectedChain="A"
          selectedResidue={selectedResidue}
          focusOnSelection={Boolean(selectedResidue)}
          focusLigandId="ID8"
          focusLigandChain="A"
          showLabels={false}
          onSelectionChange={(selection) =>
            onSelectResidue?.(selection.residue)
          }
        />
      </ViewerErrorBoundary>
      <span className="dds-structure-caption">
        EXPERIMENTAL X-RAY · PDB 5IKR · ID8 MEFENAMIC ACID · 2.342 Å
      </span>
    </div>
  );
}
function ActivityTable({ limit = 8, selectable = false, selected, onSelect }) {
  return (
    <div className="dds-table dds-activity-table">
      <div>
        <b>Compound</b>
        <b>IC50</b>
        <b>Assay</b>
        <b>pChEMBL</b>
        <b>Evidence</b>
      </div>
      {ACTIVITIES.slice(0, limit).map((a, i) => (
        <button
          key={a.assayId}
          className={selected === i ? "is-selected" : ""}
          onClick={() => selectable && onSelect?.(i)}
        >
          <span>{a.compound}</span>
          <span>
            {a.standardValue} {a.unit}
          </span>
          <span>{a.assayId}</span>
          <span>{a.pchembl.toFixed(2)}</span>
          <span>
            <SourceBadge>{a.relation} · human</SourceBadge>
          </span>
        </button>
      ))}
    </div>
  );
}

export function CommandCenterPage({ navigate, onProvenance }) {
  const [taskDone, setTaskDone] = useState([]);
  const projectStages = [
    "Target validation",
    "Hit identification",
    "Screening",
    "Hit-to-lead",
    "Lead optimization",
    "Candidate selection",
  ];
  return (
    <div className="dds-command-page">
      <PageHeading
        title="Discovery Command Center"
        subtitle="From hypothesis to candidate selection"
        actions={
          <button onClick={onProvenance} className="dds-outline">
            <Database />
            Data freshness · cached Sep 9
          </button>
        }
      />
      <div className="dds-command-grid">
        <Panel
          title="Active project · Human COX-2"
          icon={Target}
          className="dds-project-hero"
          actions={<SourceBadge>PDB 5IKR</SourceBadge>}
        >
          <div className="dds-project-copy">
            <h3>Selective COX-2 inhibitor evidence program</h3>
            <p>
              Experimental structure: human COX-2 with deposited mefenamic acid
              (ID8). Virtual decisions remain clearly separated from molecular
              evidence.
            </p>
            <dl>
              <div>
                <dt>Target</dt>
                <dd>PTGS2 · P35354</dd>
              </div>
              <div>
                <dt>Structure</dt>
                <dd>5IKR · X-ray · 2.342 Å</dd>
              </div>
              <div>
                <dt>Bound ligand</dt>
                <dd>Mefenamic acid · ID8</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>Lead optimization</dd>
              </div>
            </dl>
            <button
              className="dds-primary"
              onClick={() => navigate("workspace")}
            >
              Open project <ArrowRight />
            </button>
          </div>
          <StructureViewer compact />
        </Panel>
        <Panel
          title="Project progress"
          icon={TrendingUp}
          className="dds-progress-card"
        >
          <strong>Lead optimization</strong>
          <p>Evidence package mapped to six decision gates</p>
          <div className="dds-stage-track">
            {projectStages.map((s, i) => (
              <button
                key={s}
                className={i < 4 ? "done" : i === 4 ? "active" : ""}
                onClick={() =>
                  navigate(
                    i < 2 ? "targets" : i === 2 ? "screening" : "workspace",
                  )
                }
              >
                <i>{i < 4 ? <Check /> : i + 1}</i>
                <span>{s}</span>
              </button>
            ))}
          </div>
        </Panel>
        <div className="dds-command-metrics">
          <Metric
            icon={FolderIcon}
            label="Active projects"
            value="4"
            note="Demonstration project state"
            tone="green"
          />
          <Metric
            icon={Pill}
            label="Real compounds"
            value={COMPOUNDS.length}
            note="PubChem + ChEMBL"
          />
          <Metric
            icon={FlaskConical}
            label="Assay records"
            value={ACTIVITIES.length}
            note="Human single-protein IC50"
            tone="purple"
          />
          <Metric
            icon={Calendar}
            label="Decisions due"
            value="2"
            note="Project-management state"
            tone="amber"
          />
        </div>
        <Panel title="Today" icon={Calendar} className="dds-today">
          <div>
            {[
              "Review 5IKR pocket evidence",
              "Check assay-context warning",
              "Inspect real analog series",
              "Prepare decision notebook",
            ].map((t, i) => (
              <label key={t}>
                <input
                  type="checkbox"
                  checked={taskDone.includes(i)}
                  onChange={() =>
                    setTaskDone((v) =>
                      v.includes(i) ? v.filter((x) => x !== i) : [...v, i],
                    )
                  }
                />
                <span>
                  <b>{["09:00", "10:30", "13:00", "16:30"][i]}</b>
                  {t}
                </span>
              </label>
            ))}
          </div>
          <button onClick={() => navigate("team")}>
            Open decision queue <ArrowRight />
          </button>
        </Panel>
        <Panel
          title="Discovery pipeline"
          icon={GitBranch}
          className="dds-pipeline"
        >
          <div className="dds-pipeline-table">
            {[
              ["COX-2 evidence", 4, "#38bdf8"],
              ["KRAS G12D", 2, "#8b5cf6"],
              ["TYK2", 3, "#34d399"],
              ["BACE1", 1, "#fb923c"],
            ].map(([name, stage, color]) => (
              <div key={name}>
                <b>{name}</b>
                <span>
                  {projectStages.map((_, i) => (
                    <i
                      key={i}
                      style={{ background: i <= stage ? color : "#173148" }}
                    />
                  ))}
                </span>
                <small>{projectStages[stage]}</small>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Potency records · distinct assays"
          icon={Activity}
          className="dds-potency"
        >
          <MiniLine
            values={ACTIVITIES.map((a) => a.pchembl)}
            label="pChEMBL values from distinct ChEMBL assays"
          />
          <ActivityWarning />
        </Panel>
        <Panel
          title="Top real compounds"
          icon={Pill}
          className="dds-top-compounds"
        >
          <ActivityTable limit={5} />
        </Panel>
      </div>
    </div>
  );
}

function FolderIcon(props) {
  return <Folder {...props} />;
}

export function WorkspacePage({ navigate, onProvenance }) {
  const viewerRef = useRef(null);
  const [compoundIndex, setCompoundIndex] = useState(4);
  const [tab, setTab] = useState("2D Structure");
  const [representation, setRepresentation] = useState("surface");
  const [residue, setResidue] = useState(null);
  const [spin, setSpin] = useState(false);
  const compound = COMPOUNDS[compoundIndex];
  const activity = ACTIVITIES.find((a) => a.compound === compound.name);
  return (
    <div>
      <PageHeading
        eyebrow="EXPERIMENTAL COMPLEX WORKSPACE"
        title="COX-2 · Mefenamic acid"
        subtitle="PDB 5IKR · Human cyclooxygenase-2 · X-ray diffraction · 2.342 Å"
        actions={
          <>
            <SourceBadge>PDB 5IKR</SourceBadge>
            <button onClick={onProvenance}>
              <Database />
              Provenance
            </button>
          </>
        }
      />
      <div className="dds-workspace-grid">
        <Panel
          title="3D binding pocket"
          icon={Atom}
          className="dds-pocket-panel"
          actions={
            <select
              aria-label="Protein representation"
              value={representation}
              onChange={(e) => setRepresentation(e.target.value)}
            >
              <option value="surface">Cartoon + surface</option>
              <option value="cartoon">Cartoon</option>
              <option value="sticks">Sticks</option>
            </select>
          }
        >
          <StructureViewer
            selectedResidue={residue}
            onSelectResidue={setResidue}
            representation={representation}
            viewerRef={viewerRef}
          />
          <div className="dds-viewer-tools">
            <button onClick={() => setResidue(385)}>Focus Tyr385</button>
            <button onClick={() => setResidue(530)}>Focus Ser530</button>
            <button onClick={() => setResidue(null)}>Focus ligand</button>
            <button onClick={() => viewerRef.current?.reset()}>
              <RotateCcw />
              Reset
            </button>
            <button onClick={() => viewerRef.current?.fullscreen()}>
              <Maximize2 />
            </button>
          </div>
        </Panel>
        <Panel
          title={compound.name}
          icon={Pill}
          className="dds-compound-panel"
          actions={
            <SourceBadge kind="computed">
              PubChem CID {compound.cid}
            </SourceBadge>
          }
        >
          <div className="dds-tabs">
            {[
              "2D Structure",
              "3D Conformer",
              "Properties",
              "Activity",
              "Notes",
            ].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
                key={t}
              >
                {t}
              </button>
            ))}
          </div>
          {tab === "2D Structure" && <Molecule2D compound={compound} />}
          {tab === "3D Conformer" && (
            <SmallMoleculeViewer compound={compound} />
          )}
          {tab === "Properties" && <DescriptorList compound={compound} />}
          {tab === "Activity" &&
            (activity ? (
              <ActivityRecord activity={activity} />
            ) : (
              <EmptyData text="No cached human COX-2 IC50 record." />
            ))}
          {tab === "Notes" && (
            <textarea
              aria-label="Compound notes"
              defaultValue="Compare the deposited ID8 pose with published COX-2 inhibitor chemotypes. Assay values require context."
            />
          )}
          <div className="dds-smiles">
            <span>Canonical SMILES</span>
            <code>{compound.smiles}</code>
          </div>
        </Panel>
        <Panel
          title="Molecular properties"
          icon={BarChart3}
          className="dds-properties-panel"
        >
          <Radar compound={compound} />
          <DescriptorList compound={compound} compact />
          <button className="dds-wide" onClick={() => navigate("adme")}>
            Open ADME evidence <ArrowRight />
          </button>
        </Panel>
        <Panel
          title="Real COX-2 inhibitor analog series"
          icon={GitCompare}
          className="dds-analog-panel"
        >
          <div className="dds-analog-strip">
            {COMPOUNDS.map((c, i) => (
              <button
                className={compoundIndex === i ? "active" : ""}
                onClick={() => {
                  setCompoundIndex(i);
                  setTab("2D Structure");
                }}
                key={c.cid}
              >
                <img src={c.image} alt="" />
                <b>{c.name}</b>
                <small>{c.chembl}</small>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="SAR comparison · sourced activities"
          icon={Activity}
          className="dds-sar-panel"
        >
          <ActivityWarning />
          <ActivityTable limit={6} />
        </Panel>
        <Panel
          title="ADME & developability"
          icon={Beaker}
          className="dds-dev-panel"
        >
          <p>No measured ADME values are bundled for this selected compound.</p>
          <ul>
            <li>PubChem calculated cLogP: {compound.logp}</li>
            <li>PubChem calculated TPSA: {compound.tpsa} Å²</li>
            <li>Experimental PK: Not available in cached sources</li>
            <li>
              Predictions: run from the ADME page with explicit model labels
            </li>
          </ul>
          <button onClick={() => navigate("adme")}>Open ADME & PK</button>
        </Panel>
      </div>
    </div>
  );
}

function DescriptorList({ compound, compact }) {
  const violations = [
    compound.mw > 500,
    compound.logp > 5,
    compound.hbd > 5,
    compound.hba > 10,
  ].filter(Boolean).length;
  return (
    <dl className={cls("dds-descriptors", compact && "compact")}>
      <div>
        <dt>Molecular weight</dt>
        <dd>{compound.mw} g/mol</dd>
      </div>
      <div>
        <dt>cLogP</dt>
        <dd>{compound.logp}</dd>
      </div>
      <div>
        <dt>TPSA</dt>
        <dd>{compound.tpsa} Å²</dd>
      </div>
      <div>
        <dt>HBD / HBA</dt>
        <dd>
          {compound.hbd} / {compound.hba}
        </dd>
      </div>
      <div>
        <dt>Rotatable bonds</dt>
        <dd>{compound.rotatable}</dd>
      </div>
      <div>
        <dt>Heavy atoms</dt>
        <dd>{compound.heavy}</dd>
      </div>
      <div>
        <dt>Lipinski assessment</dt>
        <dd className={violations ? "warn" : "pass"}>
          {violations} violation{violations === 1 ? "" : "s"}
        </dd>
      </div>
    </dl>
  );
}
function ActivityRecord({ activity }) {
  return (
    <article className="dds-activity-record">
      <SourceBadge>{activity.assayId}</SourceBadge>
      <dl>
        <div>
          <dt>Target</dt>
          <dd>{activity.target}</dd>
        </div>
        <div>
          <dt>Activity</dt>
          <dd>
            {activity.relation} {activity.standardValue} {activity.unit}{" "}
            {activity.activityType}
          </dd>
        </div>
        <div>
          <dt>Organism</dt>
          <dd>{activity.organism}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{activity.confidenceScore}/9</dd>
        </div>
        <div>
          <dt>Reference</dt>
          <dd>{activity.reference}</dd>
        </div>
        <div>
          <dt>Validity</dt>
          <dd>{activity.dataValidityComment}</dd>
        </div>
      </dl>
    </article>
  );
}
function EmptyData({ text }) {
  return (
    <div className="dds-empty">
      <Database />
      <b>Not available</b>
      <p>{text}</p>
    </div>
  );
}
function Radar({ compound }) {
  const vals = [
    compound.logp / 6,
    compound.mw / 500,
    compound.tpsa / 150,
    compound.hbd / 5,
    compound.hba / 10,
    compound.rotatable / 10,
  ];
  const points = vals
    .map((v, i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 3,
        r = 75 * Math.min(1, v);
      return `${110 + Math.cos(a) * r},${102 + Math.sin(a) * r}`;
    })
    .join(" ");
  return (
    <svg
      className="dds-radar"
      viewBox="0 0 220 205"
      role="img"
      aria-label={`Calculated descriptor radar for ${compound.name}`}
    >
      <polygon points="110,17 184,59 184,145 110,187 36,145 36,59" />
      <polygon
        className="mid"
        points="110,45 160,74 160,132 110,160 60,132 60,74"
      />
      <polygon className="value" points={points} />
      {["cLogP", "MW", "TPSA", "HBD", "HBA", "Rot. bonds"].map((x, i) => (
        <text
          key={x}
          x={[95, 177, 177, 95, 2, 0][i]}
          y={[12, 58, 158, 202, 158, 58][i]}
        >
          {x}
        </text>
      ))}
    </svg>
  );
}

export function TargetPage({ navigate, onProvenance }) {
  const [tab, setTab] = useState("Overview");
  const [residue, setResidue] = useState(385);
  const tabs = [
    "Overview",
    "Structural Biology",
    "Biology & Function",
    "Disease Associations",
    "Chemical Matter",
    "Literature",
    "AI Insights",
  ];
  return (
    <div>
      <PageHeading
        eyebrow="TARGET INTELLIGENCE"
        title={`${COX2_TARGET.commonName} · ${COX2_TARGET.gene}`}
        subtitle={`${COX2_TARGET.name} · UniProt ${COX2_TARGET.uniprot} · ChEMBL ${COX2_TARGET.id}`}
        actions={
          <>
            <select>
              <option>Human (Homo sapiens)</option>
            </select>
            <SourceBadge>Validated identifiers</SourceBadge>
          </>
        }
      />
      <div className="dds-tabs dds-target-tabs">
        {tabs.map((t) => (
          <button
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="dds-target-grid">
        <Panel
          title="3D structure · COX-2 homodimer"
          icon={Atom}
          className="dds-target-structure"
          actions={
            <button onClick={onProvenance}>
              <Database />
              PDB metadata
            </button>
          }
        >
          <StructureViewer
            selectedResidue={residue}
            onSelectResidue={setResidue}
          />
          <div className="dds-residue-chips">
            {COX2_STRUCTURE.residues.map((r) => (
              <button
                className={residue === +r.match(/\d+/)?.[0] ? "active" : ""}
                key={r}
                onClick={() => setResidue(+r.match(/\d+/)?.[0])}
              >
                {r}
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Target details"
          icon={Target}
          className="dds-target-details"
        >
          <dl>
            <div>
              <dt>Gene</dt>
              <dd>PTGS2</dd>
            </div>
            <div>
              <dt>UniProt</dt>
              <dd>P35354</dd>
            </div>
            <div>
              <dt>ChEMBL target</dt>
              <dd>CHEMBL230</dd>
            </div>
            <div>
              <dt>Organism</dt>
              <dd>Homo sapiens</dd>
            </div>
            <div>
              <dt>Function</dt>
              <dd>{COX2_TARGET.function}</dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{COX2_TARGET.location}</dd>
            </div>
          </dl>
          <button className="dds-primary" onClick={() => navigate("screening")}>
            Start evidence campaign
          </button>
        </Panel>
        <Panel
          title="Domain architecture · PTGS2"
          icon={GitBranch}
          className="dds-domain"
        >
          <div className="dds-domain-bar">
            <i>
              EGF-like
              <br />
              1–58
            </i>
            <i>
              Membrane binding
              <br />
              59–116
            </i>
            <i>
              Cyclooxygenase catalytic domain
              <br />
              117–576
            </i>
          </div>
          <h4>Active-site residues</h4>
          <div className="dds-active-site">
            <Molecule2D compound={COMPOUNDS[4]} compact />
            <ul>
              {COX2_STRUCTURE.residues.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel
          title={tab}
          icon={tab === "AI Insights" ? Brain : Activity}
          className="dds-target-evidence"
        >
          <TargetTabContent tab={tab} />
        </Panel>
        <Panel
          title="Known ligands · traceable entities"
          icon={Pill}
          className="dds-known-ligands"
        >
          <div className="dds-known-grid">
            {COMPOUNDS.slice(0, 4).map((c) => (
              <Molecule2D key={c.cid} compound={c} compact />
            ))}
          </div>
        </Panel>
        <Panel
          title="Activity records"
          icon={BarChart3}
          className="dds-target-activity"
        >
          <ActivityWarning />
          <ActivityTable limit={6} />
        </Panel>
      </div>
    </div>
  );
}
function TargetTabContent({ tab }) {
  const content = {
    Overview: [
      "Human PTGS2 is an inducible prostaglandin-endoperoxide synthase.",
      "The cached experimental structure is 5IKR with deposited mefenamic acid.",
    ],
    "Structural Biology": [
      "PDB 5IKR contains two protein chains and ligand ID8 in both chains.",
      "Experimental method: X-ray diffraction; reported high-resolution limit 2.342 Å.",
    ],
    "Biology & Function": [
      COX2_TARGET.function,
      "Catalyses prostanoid precursor formation in inflammatory signalling.",
    ],
    "Disease Associations": [
      "No fabricated association scores are shown.",
      "Review current Open Targets or literature evidence before making a disease claim.",
    ],
    "Chemical Matter": [
      `${COMPOUNDS.length} real compounds are cached from PubChem and mapped to ChEMBL.`,
      "Each activity record retains its own assay identifier.",
    ],
    Literature: [
      "RCSB and ChEMBL document identifiers are available in the provenance drawer.",
      "No invented publication titles are included.",
    ],
    "AI Insights": [
      "Computed summary only: assay heterogeneity is the main limitation in the cached series.",
      "Model: rule-based evidence summarizer v1; no potency prediction is presented.",
    ],
  };
  return (
    <div className="dds-target-tab-copy">
      {content[tab].map((x, i) => (
        <article key={x}>
          <i>{i + 1}</i>
          <p>{x}</p>
        </article>
      ))}
    </div>
  );
}

export function ScreeningPage({ onProvenance }) {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(0);
  const [running, setRunning] = useState(false);
  const [filters, setFilters] = useState({
    lipinski: true,
    pains: true,
    mw: true,
  });
  const scores = COMPOUNDS.map(
    (c) =>
      Math.round(
        (100 -
          Math.abs(c.mw - 330) / 5 -
          Math.abs(c.logp - 3) * 8 -
          Math.max(0, c.tpsa - 110) / 2) *
          10,
      ) / 10,
  );
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setStep((s) => {
          if (s >= 9) {
            setRunning(false);
            return 9;
          }
          return s + 1;
        }),
      650,
    );
    return () => clearInterval(timer);
  }, [running]);
  return (
    <div>
      <PageHeading
        eyebrow="VIRTUAL SCREENING"
        title="COX-2 evidence-screening campaign"
        subtitle="8 source-attributed compounds · receptor PDB 5IKR"
        actions={
          <>
            <SourceBadge kind="computed">
              Descriptor triage · no docking claim
            </SourceBadge>
            <button onClick={onProvenance}>
              <Database />
              Sources
            </button>
          </>
        }
      />
      <div className="dds-screen-steps">
        {SCREENING_STEPS.map((s, i) => (
          <button
            className={i === step ? "active" : i < step ? "done" : ""}
            onClick={() => setStep(i)}
            key={s}
          >
            <i>{i < step ? <Check /> : i + 1}</i>
            <span>{s}</span>
          </button>
        ))}
      </div>
      <div className="dds-screen-grid">
        <Panel
          title="Selected structure and pose"
          icon={Atom}
          className="dds-screen-viewer"
        >
          <StructureViewer compact />
          <div className="dds-pose-label">
            <b>{COMPOUNDS[selected].name}</b>
            <span>Pose: not docked</span>
            <small>
              The viewer shows deposited ID8 only. Selected compounds are not
              inserted into the experimental pocket.
            </small>
          </div>
        </Panel>
        <Panel
          title="Compound triage results"
          icon={ListFilter}
          className="dds-screen-table"
        >
          <div className="dds-table">
            <div>
              <b>#</b>
              <b>Compound</b>
              <b>Priority</b>
              <b>MW</b>
              <b>cLogP</b>
            </div>
            {COMPOUNDS.map((c, i) => (
              <button
                className={selected === i ? "is-selected" : ""}
                onClick={() => setSelected(i)}
                key={c.cid}
              >
                <span>{i + 1}</span>
                <span>{c.name}</span>
                <span>{scores[i]}</span>
                <span>{c.mw}</span>
                <span>{c.logp}</span>
              </button>
            ))}
          </div>
          <ActivityWarning />
        </Panel>
        <Panel
          title="Campaign settings"
          icon={Settings}
          className="dds-screen-settings"
        >
          <label>
            Target
            <select>
              <option>COX-2 · PDB 5IKR</option>
            </select>
          </label>
          <label>
            Library
            <select>
              <option>Curated PubChem/ChEMBL set ({COMPOUNDS.length})</option>
            </select>
          </label>
          <label>
            Docking engine
            <select>
              <option>Not configured</option>
              <option disabled>AutoDock Vina requires backend</option>
            </select>
          </label>
          <h4>Property filters</h4>
          {Object.entries(filters).map(([k, v]) => (
            <label className="dds-switch" key={k}>
              <input
                type="checkbox"
                checked={v}
                onChange={() => setFilters((f) => ({ ...f, [k]: !v }))}
              />
              <span />
              {k === "pains"
                ? "PAINS alert visibility"
                : k === "mw"
                  ? "MW 150–600"
                  : "Lipinski rules"}
            </label>
          ))}
          <div className="dds-data-note">
            <Database />
            <p>
              <b>Docking scores unavailable</b>No docking job or reproducible
              pose set is bundled. The displayed priority is a deterministic
              descriptor-triage calculation, not binding energy.
            </p>
          </div>
          <button
            className="dds-primary dds-wide"
            onClick={() => {
              setStep(0);
              setRunning(true);
            }}
          >
            {running ? (
              <>
                <RefreshCw className="spin" />
                Running workflow…
              </>
            ) : (
              <>
                Run reproducible triage <ArrowRight />
              </>
            )}
          </button>
        </Panel>
        <Panel
          title="Descriptor-priority distribution"
          icon={BarChart3}
          className="dds-screen-chart"
        >
          <BarDistribution values={scores} />
        </Panel>
        <Panel
          title="Chemical property space"
          icon={Activity}
          className="dds-screen-space"
        >
          <PropertyScatter selected={selected} onSelect={setSelected} />
        </Panel>
      </div>
    </div>
  );
}
function BarDistribution({ values }) {
  const bins = [0, 0, 0, 0, 0, 0];
  values.forEach(
    (v) => bins[Math.min(5, Math.max(0, Math.floor((v - 50) / 8)))]++,
  );
  return (
    <svg
      className="dds-big-chart"
      viewBox="0 0 520 230"
      role="img"
      aria-label="Descriptor priority distribution"
    >
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="46" x2="500" y1={30 + i * 40} y2={30 + i * 40} />
        ))}
      </g>
      {bins.map((v, i) => (
        <rect
          key={i}
          x={60 + i * 70}
          y={190 - v * 28}
          width="46"
          height={v * 28}
        />
      ))}
      <text x="175" y="220">
        Descriptor triage score (computed)
      </text>
    </svg>
  );
}
function PropertyScatter({ selected, onSelect }) {
  const xs = COMPOUNDS.map((c) => c.logp),
    ys = COMPOUNDS.map((c) => c.tpsa);
  return (
    <svg
      className="dds-big-chart"
      viewBox="0 0 520 230"
      role="img"
      aria-label="PubChem descriptor property space"
    >
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="50" x2="500" y1={25 + i * 40} y2={25 + i * 40} />
        ))}
      </g>
      {COMPOUNDS.map((c, i) => (
        <g key={c.cid} onClick={() => onSelect(i)} className="dds-chart-point">
          <circle
            className={selected === i ? "selected" : ""}
            cx={60 + (xs[i] - 2) * 105}
            cy={205 - (ys[i] - 30) * 1.15}
            r={selected === i ? 9 : 6}
          />
          <text x={68 + (xs[i] - 2) * 105} y={201 - (ys[i] - 30) * 1.15}>
            {c.name}
          </text>
        </g>
      ))}
      <text x="230" y="225">
        cLogP
      </text>
      <text transform="rotate(-90 15 130)" x="15" y="130">
        TPSA (Å²)
      </text>
    </svg>
  );
}

export function DesignPage({ onSaved, onProvenance }) {
  const [base, setBase] = useState(COMPOUNDS[4]);
  const [selectedR, setSelectedR] = useState("Cl");
  const [created, setCreated] = useState(null);
  const [view, setView] = useState("2D Editor");
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState("PubChem identity loaded");
  const create = async () => {
    setValidating(true);
    setValidation("Validating molecular graph with RDKit.js…");
    try {
      const RDKit = await getRDKit();
      const mol = RDKit.get_mol(DESIGNED_ANALOG.smiles);
      if (!mol) throw new Error("Invalid molecular graph");
      const canonical = mol.get_smiles();
      mol.delete();
      setCreated({ ...DESIGNED_ANALOG, smiles: canonical });
      setValidation(`Valid RDKit graph · ${RDKit.version()}`);
      onSaved?.();
    } catch (e) {
      setValidation(`Validation unavailable: ${e.message}`);
    } finally {
      setValidating(false);
    }
  };
  return (
    <div>
      <PageHeading
        eyebrow="MOLECULAR DESIGN"
        title="Molecular Design Studio"
        subtitle="Edit source-attributed chemical matter and save only validated graphs"
        actions={
          <>
            <SourceBadge kind="computed">RDKit.js 2025.03.4</SourceBadge>
            <button onClick={onProvenance}>
              <Database />
              Sources
            </button>
          </>
        }
      />
      <div className="dds-design-grid">
        <Panel
          title="2D molecular editor"
          icon={Pencil}
          className="dds-design-editor"
          actions={
            <div className="dds-tabs">
              {["2D Editor", "3D View", "Physicochemical", "SAR"].map((x) => (
                <button
                  onClick={() => setView(x)}
                  className={view === x ? "active" : ""}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
          }
        >
          <div className="dds-editor-canvas">
            <div className="dds-editor-tools">
              {[Menu, Pencil, Trash2, GitBranch, Atom, Settings].map((I, i) => (
                <button
                  onClick={() => setValidation(`Editor tool ${i + 1} selected`)}
                  key={i}
                >
                  <I />
                </button>
              ))}
            </div>
            {view === "3D View" ? (
              <SmallMoleculeViewer compound={created || base} />
            ) : (
              <Molecule2D compound={created || base} />
            )}
          </div>
          <div className="dds-editor-footer">
            <span>
              {created
                ? "Designed virtual analog"
                : "Experimental reference entity"}
            </span>
            <code>{(created || base).smiles}</code>
          </div>
        </Panel>
        <Panel
          title="Protein pocket context"
          icon={Atom}
          className="dds-design-pocket"
        >
          <StructureViewer compact />
          <small>
            The only displayed bound pose is deposited mefenamic acid ID8. The
            designed analog has no asserted pose.
          </small>
        </Panel>
        <Panel
          title="R-group replacement"
          icon={Wand2}
          className="dds-design-controls"
        >
          <label>
            Starting molecule
            <select
              value={base.cid}
              onChange={(e) =>
                setBase(COMPOUNDS.find((c) => c.cid === +e.target.value))
              }
            >
              {COMPOUNDS.map((c) => (
                <option value={c.cid} key={c.cid}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Transform
            <select>
              <option>Replace methyl with chlorine</option>
            </select>
          </label>
          <div className="dds-rgroups">
            {[
              "H",
              "F",
              "Cl",
              "Br",
              "CF₃",
              "CH₃",
              "OCH₃",
              "CN",
              "OH",
              "NO₂",
            ].map((x) => (
              <button
                className={selectedR === x ? "active" : ""}
                onClick={() => setSelectedR(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="dds-data-note">
            <Sparkles />
            <p>
              <b>Design preview</b>The implemented Cl transformation maps to the
              valid PubChem record for meclofenamic acid (CID 4037). No
              experimental potency is inferred.
            </p>
          </div>
          <button
            className="dds-primary dds-wide"
            onClick={create}
            disabled={validating}
          >
            {validating ? <RefreshCw className="spin" /> : <FlaskConical />}
            Create validated analog
          </button>
          <p className="dds-validation" role="status">
            {validation}
          </p>
        </Panel>
        <Panel
          title="Analog suggestions"
          icon={GitCompare}
          className="dds-design-analogs"
        >
          <div className="dds-analog-strip">
            {COMPOUNDS.slice(0, 6).map((c) => (
              <button key={c.cid} onClick={() => setBase(c)}>
                <img src={c.image} alt="" />
                <b>{c.name}</b>
                <small>Real entity · CID {c.cid}</small>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Synthesis feasibility"
          icon={FlaskConical}
          className="dds-synthesis"
        >
          <EmptyData text="No source-attributed retrosynthetic route has been loaded. A visual route is intentionally not fabricated." />
          <button
            onClick={() =>
              setValidation(
                "Route search requires a configured synthesis service",
              )
            }
          >
            Search configured route service
          </button>
        </Panel>
      </div>
    </div>
  );
}

export function AdmePage({ onProvenance }) {
  const [tab, setTab] = useState("Absorption");
  const [running, setRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [dose, setDose] = useState(100);
  const [halfLife, setHalfLife] = useState(6);
  const [volume, setVolume] = useState(40);
  const [route, setRoute] = useState("Oral");
  const [model, setModel] = useState("One-compartment");
  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setTime((v) => (v >= 72 ? 0 : v + 1)), 90);
    return () => clearInterval(t);
  }, [running]);
  const ka = route === "Oral" ? 1.2 : 8;
  const ke = Math.log(2) / halfLife;
  const curve = Array.from({ length: 25 }, (_, i) => {
    const t = i * 3;
    return route === "Oral"
      ? ((dose * ka) / (volume * (ka - ke))) *
          (Math.exp(-ke * t) - Math.exp(-ka * t))
      : (dose / volume) * Math.exp(-ke * t);
  });
  return (
    <div>
      <PageHeading
        eyebrow="COMPUTED PK WORKSPACE"
        title="ADME & Pharmacokinetics"
        subtitle="Mefenamic acid · measured ADME values not bundled; editable simulation is explicitly computed"
        actions={
          <>
            <SourceBadge kind="predicted">
              One-compartment simulation
            </SourceBadge>
            <button onClick={onProvenance}>
              <Database />
              Provenance
            </button>
          </>
        }
      />
      <div className="dds-adme-metrics">
        <Metric
          icon={Waves}
          label="Aqueous solubility"
          value="Not available"
          note="No measured record cached"
        />
        <Metric
          icon={HeartPulse}
          label="Clearance"
          value={`${(ke * volume).toFixed(1)} L/h`}
          note="Computed from editable parameters"
        />
        <Metric
          icon={Network}
          label="Volume of distribution"
          value={`${volume} L`}
          note="User-entered simulation parameter"
        />
        <Metric
          icon={Pill}
          label="Bioavailability"
          value={route === "Oral" ? "70%" : "100%"}
          note="Assumption · editable model"
        />
      </div>
      <div className="dds-tabs dds-adme-tabs">
        {[
          "Absorption",
          "Distribution",
          "Metabolism",
          "Excretion",
          "PK simulation",
        ].map((x) => (
          <button
            className={tab === x ? "active" : ""}
            onClick={() => setTab(x)}
            key={x}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="dds-adme-grid">
        <Panel
          title={`ADME journey · ${tab}`}
          icon={Activity}
          className="dds-body-panel"
          actions={
            <button onClick={() => setRunning((v) => !v)}>
              {running ? <Pause /> : <Play />}
              {running ? "Pause" : "Play simulation"}
            </button>
          }
        >
          <BodyJourney active={tab} time={time} />
        </Panel>
        <Panel
          title="Plasma concentration · simulated"
          icon={BarChart3}
          className="dds-pk-curve"
        >
          <Curve
            values={curve}
            color="#38bdf8"
            label="Simulated plasma concentration over 72 hours"
          />
          <SourceBadge kind="predicted">
            {model} · analytic equation
          </SourceBadge>
        </Panel>
        <Panel
          title="Evidence summary"
          icon={Database}
          className="dds-adme-summary"
        >
          <dl>
            {[
              ["Permeability", "Not available"],
              ["P-gp status", "Not available"],
              ["Protein binding", "Not available"],
              ["Microsomal stability", "Not available"],
              ["CYP inhibition", "Not available"],
              ["Renal clearance", "Not available"],
            ].map(([a, b]) => (
              <div key={a}>
                <dt>{a}</dt>
                <dd>{b}</dd>
              </div>
            ))}
          </dl>
          <p>
            No experimental ADME endpoint is inferred from physicochemical
            descriptors.
          </p>
        </Panel>
        <Panel
          title="PK simulation"
          icon={Settings}
          className="dds-pk-controls"
        >
          <label>
            Dose
            <input
              type="number"
              min="1"
              value={dose}
              onChange={(e) => setDose(+e.target.value)}
            />
            <span>mg</span>
          </label>
          <label>
            Route
            <select value={route} onChange={(e) => setRoute(e.target.value)}>
              <option>Oral</option>
              <option>IV</option>
            </select>
          </label>
          <label>
            Half-life
            <input
              type="range"
              min="1"
              max="24"
              value={halfLife}
              onChange={(e) => setHalfLife(+e.target.value)}
            />
            <output>{halfLife} h</output>
          </label>
          <label>
            Volume
            <input
              type="range"
              min="10"
              max="100"
              value={volume}
              onChange={(e) => setVolume(+e.target.value)}
            />
            <output>{volume} L</output>
          </label>
          <label>
            Model
            <select value={model} onChange={(e) => setModel(e.target.value)}>
              <option>One-compartment</option>
              <option>Two-compartment (not configured)</option>
            </select>
          </label>
          <button
            className="dds-primary"
            onClick={() => {
              setTime(0);
              setRunning(true);
            }}
          >
            Run simulation
          </button>
        </Panel>
        <Panel title="Metabolites" icon={GitBranch} className="dds-metabolites">
          <EmptyData text="Verified human metabolite structures were not found in the bundled source snapshot. Predicted metabolites are not invented." />
        </Panel>
        <Panel
          title="Dose–exposure"
          icon={TrendingUp}
          className="dds-dose-chart"
        >
          <Curve
            values={curve.map((v, i) => v * (1 + Math.sin(i / 4) * 0.08))}
            color="#f472b6"
            label="Simulated dose exposure"
          />
        </Panel>
      </div>
    </div>
  );
}
function Curve({ values, color, label }) {
  const max = Math.max(...values, 1);
  const pts = values
    .map(
      (v, i) =>
        `${38 + i * (450 / (values.length - 1))},${190 - (v / max) * 150}`,
    )
    .join(" ");
  return (
    <svg
      className="dds-big-chart"
      viewBox="0 0 520 230"
      role="img"
      aria-label={label}
    >
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="38" x2="500" y1={30 + i * 40} y2={30 + i * 40} />
        ))}
      </g>
      <polyline className="curve" points={pts} style={{ stroke: color }} />
      {values.map((v, i) => (
        <circle
          key={i}
          cx={38 + i * (450 / (values.length - 1))}
          cy={190 - (v / max) * 150}
          r="2.5"
          style={{ fill: color }}
        />
      ))}
      <text x="210" y="220">
        Time (hours)
      </text>
    </svg>
  );
}
function BodyJourney({ active, time }) {
  const stages = [
    "Oral dose",
    "Intestinal absorption",
    "Portal circulation",
    "Liver metabolism",
    "Systemic circulation",
    "Tissue distribution",
    "Renal excretion",
  ];
  const activeIndex =
    {
      Absorption: 1,
      Distribution: 5,
      Metabolism: 3,
      Excretion: 6,
      "PK simulation": 4,
    }[active] ?? 1;
  return (
    <div className="dds-body-journey">
      <div className="dds-body-silhouette">
        <HeartPulse />
        <span className="head" />
        <span className="torso" />
        <span className="liver">Liver</span>
        <span className="gut">Intestine</span>
        <span className="kidney">Kidney</span>
        <i style={{ offsetDistance: `${((time % 73) / 72) * 100}%` }} />
      </div>
      <ol>
        {stages.map((s, i) => (
          <li className={i === activeIndex ? "active" : ""} key={s}>
            <i>{i + 1}</i>
            {s}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SafetyPage({ onProvenance }) {
  const [endpoint, setEndpoint] = useState("hERG inhibition");
  const [alert, setAlert] = useState("Aromatic amine");
  const endpoints = [
    "hERG inhibition",
    "Drug-induced liver injury",
    "Ames mutagenicity",
    "Micronucleus",
    "CYP inhibition",
    "Reactive metabolites",
  ];
  return (
    <div>
      <PageHeading
        eyebrow="SAFETY EVIDENCE"
        title="Safety & Toxicology · Mefenamic acid"
        subtitle="Unavailable measurements remain blank; structural alerts are computed from the canonical graph"
        actions={
          <>
            <SourceBadge kind="computed">RDKit substructure screen</SourceBadge>
            <button onClick={onProvenance}>
              <Database />
              Sources
            </button>
          </>
        }
      />
      <div className="dds-tabs">
        {[
          "Overview",
          "Cardiac",
          "Hepatic",
          "Genotoxicity",
          "Off-targets",
          "Structural alerts",
        ].map((x) => (
          <button
            key={x}
            onClick={() =>
              setEndpoint(
                x === "Cardiac"
                  ? "hERG inhibition"
                  : x === "Hepatic"
                    ? "Drug-induced liver injury"
                    : endpoint,
              )
            }
          >
            {x}
          </button>
        ))}
      </div>
      <div className="dds-safety-grid">
        <Panel
          title="Organ-system evidence map"
          icon={HeartPulse}
          className="dds-risk-map"
        >
          <div className="dds-risk-body">
            <HeartPulse />
            <span className="brain">CNS · not assessed</span>
            <span className="heart">Cardiac · not assessed</span>
            <span className="hepatic">
              Hepatic · literature review required
            </span>
            <span className="renal">Renal · literature review required</span>
          </div>
          <p className="dds-legend">
            <i />
            No evidence loaded <i />
            Computed alert <i />
            Measured concern
          </p>
        </Panel>
        <Panel
          title="Real hERG/KCNH2 structure context"
          icon={Atom}
          className="dds-herg"
        >
          <EmptyData text="No hERG structure or compound pose is bundled. The application does not place mefenamic acid into a channel and call it crystallographic or docked evidence." />
          <button onClick={() => setEndpoint("hERG inhibition")}>
            Inspect endpoint availability
          </button>
        </Panel>
        <Panel
          title="Key safety endpoints"
          icon={ShieldAlert}
          className="dds-safety-table"
        >
          <div className="dds-table">
            <div>
              <b>Endpoint</b>
              <b>Value</b>
              <b>Evidence</b>
            </div>
            {endpoints.map((e) => (
              <button
                onClick={() => setEndpoint(e)}
                className={endpoint === e ? "is-selected" : ""}
                key={e}
              >
                <span>{e}</span>
                <span>Not available</span>
                <span>Source search required</span>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Endpoint details"
          icon={CircleHelp}
          className="dds-endpoint"
        >
          <select
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
          >
            {endpoints.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>
          <dl>
            <div>
              <dt>Value</dt>
              <dd>Not available</dd>
            </div>
            <div>
              <dt>Unit</dt>
              <dd>—</dd>
            </div>
            <div>
              <dt>Evidence class</dt>
              <dd>Not loaded</dd>
            </div>
            <div>
              <dt>Source searched</dt>
              <dd>Bundled PubChem / ChEMBL snapshot</dd>
            </div>
            <div>
              <dt>Concern threshold</dt>
              <dd>Not applied without a value</dd>
            </div>
            <div>
              <dt>Uncertainty</dt>
              <dd>Unknown</dd>
            </div>
          </dl>
          <p>No status colour is assigned without evidence.</p>
        </Panel>
        <Panel
          title="Computed structural alerts"
          icon={ShieldAlert}
          className="dds-alerts"
        >
          <Molecule2D compound={COMPOUNDS[4]} compact />
          <div>
            {["Aromatic amine", "Carboxylic acid", "Two aromatic rings"].map(
              (a, i) => (
                <button
                  className={alert === a ? "active" : ""}
                  onClick={() => setAlert(a)}
                  key={a}
                >
                  <span>{a}</span>
                  <b>{i === 0 ? "Review" : "Information"}</b>
                </button>
              ),
            )}
          </div>
          <p>
            <b>{alert}</b> identified from canonical SMILES by documented
            functional-group rules. This is not a toxicity result.
          </p>
        </Panel>
        <Panel
          title="Safety margin"
          icon={BarChart3}
          className="dds-safety-margin"
        >
          <EmptyData text="A safety margin cannot be calculated because compatible exposure and endpoint values are not available." />
        </Panel>
        <Panel
          title="Analog comparison"
          icon={GitCompare}
          className="dds-safety-analogs"
        >
          <div className="dds-analog-strip">
            {COMPOUNDS.slice(0, 5).map((c) => (
              <Molecule2D compact compound={c} key={c.cid} />
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function AnalyticsPage({ navigate, onProvenance }) {
  const [selected, setSelected] = useState(0);
  const [colorBy, setColorBy] = useState("pChEMBL");
  const [quality, setQuality] = useState("Confidence 9");
  const [fingerprintData, setFingerprintData] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [analyticsAttempt, setAnalyticsAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setAnalyticsError("");
    fetch("/assets/drug-discovery/data/analytics.json", {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Analytics request failed (${response.status})`);
        }
        return response.json();
      })
      .then(setFingerprintData)
      .catch((error) => {
        if (error.name !== "AbortError") setAnalyticsError(error.message);
      });
    return () => controller.abort();
  }, [analyticsAttempt]);
  const c = COMPOUNDS[selected],
    a = ACTIVITIES[selected];
  return (
    <div>
      <PageHeading
        eyebrow="CALCULATED ANALYTICS"
        title="Discovery Analytics"
        subtitle="8 real compounds · Morgan fingerprints and assay-context-preserving records"
        actions={
          <>
            <select
              value={colorBy}
              onChange={(e) => setColorBy(e.target.value)}
            >
              <option>pChEMBL</option>
              <option>Scaffold</option>
              <option>cLogP</option>
            </select>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
            >
              <option>Confidence 9</option>
              <option>All cached records</option>
            </select>
            <button onClick={onProvenance}>
              <Database />
              Metadata
            </button>
          </>
        }
      />
      <div className="dds-analytics-grid">
        <Panel
          title="Chemical space · Morgan fingerprint UMAP"
          icon={Activity}
          className="dds-umap"
        >
          <FingerprintMap
            selected={selected}
            onSelect={setSelected}
            colorBy={colorBy}
            points={fingerprintData?.points}
          />
          {analyticsError ? (
            <div className="dds-inline-error" role="alert">
              {analyticsError}
              <button onClick={() => setAnalyticsAttempt((x) => x + 1)}>
                Retry
              </button>
            </div>
          ) : (
            <small>
              {fingerprintData
                ? `RDKit ${fingerprintData.rdkitVersion} · Morgan radius ${fingerprintData.fingerprint.radius} · ${fingerprintData.fingerprint.bits} bits · UMAP seed ${fingerprintData.umap.seed}`
                : "Loading generated fingerprint projection…"}
            </small>
          )}
        </Panel>
        <Panel
          title="Potency vs physicochemical property"
          icon={BarChart3}
          className="dds-potency-scatter"
        >
          <PotencyScatter selected={selected} onSelect={setSelected} />
          <ActivityWarning />
        </Panel>
        <Panel
          title="Compound inspector"
          icon={Pill}
          className="dds-compound-inspector"
        >
          <Molecule2D compound={c} />
          <DescriptorList compound={c} />
          <ActivityRecord activity={a} />
          <button
            className="dds-primary dds-wide"
            onClick={() => navigate("notebooks")}
          >
            Add to notebook
          </button>
        </Panel>
        <Panel title="SAR heatmap" icon={GitCompare} className="dds-heatmap">
          <div className="dds-heat-table">
            <div>
              <b>Compound</b>
              <b>pChEMBL</b>
              <b>cLogP</b>
              <b>TPSA</b>
            </div>
            {COMPOUNDS.map((x, i) => (
              <button
                onClick={() => setSelected(i)}
                className={selected === i ? "active" : ""}
                key={x.cid}
              >
                <span>{x.name}</span>
                <i style={{ "--v": ACTIVITIES[i].pchembl / 9 }}>
                  {ACTIVITIES[i].pchembl}
                </i>
                <i style={{ "--v": x.logp / 6 }}>{x.logp}</i>
                <i style={{ "--v": x.tpsa / 150 }}>{x.tpsa}</i>
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="Matched molecular pair analysis"
          icon={GitCompare}
          className="dds-mmp"
        >
          <p>
            Pairs are computed from cached molecules; no potency delta is
            inferred across incompatible assays.
          </p>
          {[
            ["Mefenamic acid", "Diclofenac"],
            ["Celecoxib", "Valdecoxib"],
            ["Rofecoxib", "Etoricoxib"],
          ].map(([x, y]) => (
            <div key={x}>
              <span>{x}</span>
              <ArrowRight />
              <span>{y}</span>
              <b>Descriptor delta only</b>
            </div>
          ))}
        </Panel>
        <Panel
          title="Property distributions"
          icon={BarChart3}
          className="dds-prop-dist"
        >
          <BarDistribution values={COMPOUNDS.map((x) => x.mw / 5)} />
        </Panel>
      </div>
    </div>
  );
}
function FingerprintMap({ selected, onSelect, colorBy, points }) {
  const projected = useMemo(() => {
    if (!points?.length) return [];
    const byCid = new Map(points.map((point) => [Number(point.cid), point.coordinates]));
    const coordinates = COMPOUNDS.map((compound) => byCid.get(Number(compound.cid)));
    if (coordinates.some((value) => !Array.isArray(value))) return [];
    const xs = coordinates.map(([x]) => x);
    const ys = coordinates.map(([, y]) => y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return coordinates.map(([x, y]) => ({
      x: 65 + ((x - minX) / Math.max(maxX - minX, 1)) * 405,
      y: 255 - ((y - minY) / Math.max(maxY - minY, 1)) * 210,
    }));
  }, [points]);
  return (
    <svg
      className="dds-big-chart"
      viewBox="0 0 520 300"
      role="img"
      aria-label="Morgan fingerprint UMAP projection"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1="45" x2="500" y1={35 + i * 50} y2={35 + i * 50} />
          <line y1="20" y2="270" x1={50 + i * 100} x2={50 + i * 100} />
        </g>
      ))}
      {!projected.length && (
        <text x="260" y="150" textAnchor="middle">
          Loading generated UMAP coordinates…
        </text>
      )}
      {projected.length > 0 && COMPOUNDS.map((c, i) => (
        <g className="dds-chart-point" key={c.cid} onClick={() => onSelect(i)}>
          <circle
            className={selected === i ? "selected" : ""}
            cx={projected[i].x}
            cy={projected[i].y}
            r={selected === i ? 11 : 7}
            style={{
              fill:
                colorBy === "cLogP"
                  ? `hsl(${220 - c.logp * 25} 85% 55%)`
                  : colorBy === "Scaffold"
                    ? ["#38bdf8", "#34d399", "#f59e0b", "#f472b6"][i % 4]
                    : `hsl(${220 - (ACTIVITIES[i].pchembl - 4) * 38} 85% 55%)`,
            }}
          />
          <text
            x={projected[i].x + 12}
            y={projected[i].y + 4}
          >
            {c.name}
          </text>
        </g>
      ))}
      <text x="225" y="295">
        UMAP 1
      </text>
      <text transform="rotate(-90 15 160)" x="15" y="160">
        UMAP 2
      </text>
    </svg>
  );
}
function PotencyScatter({ selected, onSelect }) {
  return (
    <svg
      className="dds-big-chart"
      viewBox="0 0 520 300"
      role="img"
      aria-label="pChEMBL versus cLogP by assay"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line x1="45" x2="500" y1={35 + i * 50} y2={35 + i * 50} />
        </g>
      ))}
      {COMPOUNDS.map((c, i) => (
        <g className="dds-chart-point" key={c.cid} onClick={() => onSelect(i)}>
          <circle
            className={selected === i ? "selected" : ""}
            cx={50 + (c.logp - 2) * 125}
            cy={270 - (ACTIVITIES[i].pchembl - 4) * 45}
            r={selected === i ? 10 : 7}
          />
          <text
            x={60 + (c.logp - 2) * 125}
            y={267 - (ACTIVITIES[i].pchembl - 4) * 45}
          >
            {c.name}
          </text>
        </g>
      ))}
      <text x="230" y="295">
        PubChem cLogP
      </text>
      <text transform="rotate(-90 15 170)" x="15" y="170">
        pChEMBL (assay-specific)
      </text>
    </svg>
  );
}

const initialBlocks = [
  {
    id: 1,
    type: "Objective",
    text: "Review the deposited 5IKR mefenamic-acid pose and preserve assay provenance.",
  },
  {
    id: 2,
    type: "Hypothesis",
    text: "COX-2 chemical matter should be compared only after checking assay format and species.",
  },
  { id: 3, type: "Structure", ref: "5IKR" },
  { id: 4, type: "Molecule", ref: "Mefenamic acid" },
  { id: 5, type: "Dataset", ref: "CHEMBL230 human IC50 snapshot" },
  {
    id: 6,
    type: "Conclusion",
    text: "The current evidence supports structural inspection; cross-assay potency ranking remains limited.",
  },
];
export function NotebookPage({ navigate, onSaved }) {
  const [blocks, setBlocks] = useStored("dds-notebook-blocks", initialBlocks);
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useStored("dds-notebook-history", [
    { version: "v1.0", date: "Sep 9, 2026", author: "Dr. Elena Park" },
  ]);
  const types = [
    "Text",
    "Objective",
    "Hypothesis",
    "Molecule",
    "Reaction",
    "Protein structure",
    "3D binding pose",
    "Chart",
    "Table",
    "Code",
    "Dataset",
    "Decision",
    "Conclusion",
  ];
  const add = (type) => {
    const next = {
      id: Date.now(),
      type,
      text: `New ${type.toLowerCase()} block — edit this reproducible record.`,
    };
    setBlocks((v) => [...v, next]);
    setSelected(blocks.length);
    setHistory((v) => [
      {
        version: `v1.${v.length}`,
        date: new Date().toLocaleDateString(),
        author: "Dr. Elena Park",
      },
      ...v,
    ]);
    onSaved?.();
  };
  return (
    <div>
      <PageHeading
        eyebrow="ELECTRONIC RESEARCH NOTEBOOK"
        title="COX-2 evidence review"
        subtitle="Versioned blocks reference shared entities rather than duplicating scientific data"
        actions={
          <>
            <button className="dds-primary" onClick={() => add("Text")}>
              <Plus />
              New entry
            </button>
            <button onClick={() => window.print()}>
              <Download />
              Export
            </button>
          </>
        }
      />
      <div className="dds-notebook-grid">
        <aside className="dds-notebook-list">
          <label>
            <Search />
            <input placeholder="Search entries…" />
          </label>
          <h3>Design cycle · {blocks.length} blocks</h3>
          {blocks.map((b, i) => (
            <button
              className={selected === i ? "active" : ""}
              onClick={() => setSelected(i)}
              key={b.id}
            >
              <FileText />
              <span>
                <b>{b.type}</b>
                <small>{b.ref || b.text?.slice(0, 36)}</small>
              </span>
            </button>
          ))}
        </aside>
        <div className="dds-notebook-main">
          <div className="dds-block-toolbar">
            {types.map((t) => (
              <button onClick={() => add(t)} key={t}>
                <Plus />
                {t}
              </button>
            ))}
          </div>
          {blocks.map((b, i) => (
            <NotebookBlock
              key={b.id}
              block={b}
              selected={selected === i}
              onSelect={() => setSelected(i)}
              onChange={(text) =>
                setBlocks((v) =>
                  v.map((x) => (x.id === b.id ? { ...x, text } : x)),
                )
              }
              onDelete={() => setBlocks((v) => v.filter((x) => x.id !== b.id))}
            />
          ))}
        </div>
        <aside className="dds-notebook-details">
          <Panel title="Linked compounds" icon={Pill}>
            {COMPOUNDS.slice(0, 4).map((c) => (
              <button key={c.cid} onClick={() => navigate("workspace")}>
                <img src={c.image} alt="" />
                <span>
                  <b>{c.name}</b>
                  <small>CID {c.cid}</small>
                </span>
              </button>
            ))}
          </Panel>
          <Panel title="Linked datasets" icon={Database}>
            <ul>
              <li>RCSB 5IKR coordinates</li>
              <li>ChEMBL CHEMBL230 activities</li>
              <li>PubChem compound properties</li>
            </ul>
          </Panel>
          <Panel title="Authors" icon={Users}>
            <p>Dr. Elena Park · Owner</p>
            <p>Structural biology reviewer · Demonstration role</p>
          </Panel>
          <Panel title="Version history" icon={Clock3}>
            {history.slice(0, 5).map((h) => (
              <p key={`${h.version}-${h.date}`}>
                <b>{h.version}</b> {h.date}
                <small>{h.author}</small>
              </p>
            ))}
          </Panel>
          <Panel title="Approvals" icon={CheckCircle2}>
            <p>
              <SourceBadge kind="computed">Internal project state</SourceBadge>
            </p>
            <button onClick={() => onSaved?.()}>Request review</button>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
function NotebookBlock({ block, selected, onSelect, onChange, onDelete }) {
  return (
    <article
      className={cls("dds-notebook-block", selected && "active")}
      onClick={onSelect}
    >
      <header>
        <GripVertical />
        <b>{block.type}</b>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 />
        </button>
      </header>
      {block.ref && (
        <div className="dds-linked-ref">
          <Link2 />
          <span>
            <b>{block.ref}</b>
            <small>Live reference to shared source entity</small>
          </span>
        </div>
      )}
      {block.type === "Structure" && <StructureViewer compact />}
      {block.type === "Molecule" && (
        <Molecule2D compound={COMPOUNDS[4]} compact />
      )}
      {block.type === "Dataset" && <ActivityTable limit={3} />}{" "}
      {!block.ref && (
        <textarea
          value={block.text}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </article>
  );
}

export function TeamPage({ navigate, onSaved }) {
  const [decision, setDecision] = useStored("dds-decision", "Pending");
  const [tab, setTab] = useState("Decision");
  const disciplines = [
    "Target Biology",
    "Computational Chemistry",
    "Medicinal Chemistry",
    "DMPK",
    "Toxicology",
    "Project Leadership",
  ];
  return (
    <div>
      <PageHeading
        eyebrow="COX-2 EVIDENCE PROGRAM"
        title="Discovery Team"
        subtitle="Scientific roles, decisions and evidence are connected to shared source records"
        actions={
          <>
            <SourceBadge kind="computed">
              Project state · demonstration
            </SourceBadge>
            <button onClick={onSaved}>
              <Settings />
              Project settings
            </button>
          </>
        }
      />
      <div className="dds-tabs">
        {[
          "Team overview",
          "Meetings",
          "Decisions",
          "Files",
          "Access & permissions",
        ].map((x) => (
          <button key={x}>{x}</button>
        ))}
      </div>
      <div className="dds-team-grid">
        <Panel
          title="Collaboration map"
          icon={Network}
          className="dds-collab-map"
        >
          <div className="dds-team-center">
            <Atom />
            <b>COX-2 evidence</b>
            <small>{disciplines.length} disciplines</small>
          </div>
          {disciplines.map((d, i) => (
            <button style={{ "--i": i }} onClick={() => onSaved?.()} key={d}>
              <span>{i + 1}</span>
              <b>{d}</b>
              <small>
                {
                  [
                    "Validate target biology",
                    "Fingerprint and pose analysis",
                    "Design source-attributed analogs",
                    "Review PK assumptions",
                    "Assess evidence gaps",
                    "Own decision gates",
                  ][i]
                }
              </small>
            </button>
          ))}
        </Panel>
        <Panel
          title="Active review"
          icon={Calendar}
          className="dds-active-review"
        >
          <h3>Advance the evidence package</h3>
          <p>
            Decision: proceed to a reproducible docking or experimental
            follow-up plan.
          </p>
          <Molecule2D compound={COMPOUNDS[4]} />
          <ul>
            <li>Experimental structure 5IKR verified</li>
            <li>Ligand identity ID8 verified</li>
            <li>Human ChEMBL target verified</li>
            <li>Cross-assay limitation visible</li>
          </ul>
        </Panel>
        <Panel
          title="Decision review"
          icon={BadgeCheck}
          className="dds-decision"
        >
          <div className="dds-tabs">
            {["Decision", "Thread", "Files"].map((x) => (
              <button
                className={tab === x ? "active" : ""}
                onClick={() => setTab(x)}
                key={x}
              >
                {x}
              </button>
            ))}
          </div>
          {tab === "Decision" && (
            <>
              <h3>Evidence checklist</h3>
              {[
                ["Potency", true],
                ["Selectivity", false],
                ["Cellular activity", false],
                ["Docking evidence", false],
                ["ADME / PK", false],
                ["Safety", false],
              ].map(([e, done]) => (
                <button
                  key={e}
                  onClick={() =>
                    navigate(
                      e === "Potency"
                        ? "analytics"
                        : e === "Docking evidence"
                          ? "screening"
                          : e === "ADME / PK"
                            ? "adme"
                            : e === "Safety"
                              ? "safety"
                              : "workspace",
                    )
                  }
                >
                  <i className={done ? "done" : ""}>{done && <Check />}</i>
                  {e}
                  <ArrowRight />
                </button>
              ))}
              <h4>Current decision · {decision}</h4>
              <div className="dds-decision-actions">
                <button
                  onClick={() => setDecision("Approved with evidence gaps")}
                >
                  Approve
                </button>
                <button onClick={() => setDecision("Changes requested")}>
                  Request changes
                </button>
                <button onClick={() => setDecision("On hold")}>Hold</button>
              </div>
            </>
          )}
          {tab === "Thread" && (
            <textarea defaultValue="Record comments with links to the shared evidence objects." />
          )}
          {tab === "Files" && (
            <EmptyData text="No external files are attached to this demonstration project." />
          )}
        </Panel>
        <Panel title="Upcoming meeting" icon={Calendar} className="dds-meeting">
          <h3>COX-2 evidence review</h3>
          <p>Sep 12 · 10:00–11:00</p>
          <ul>
            <li>Assay context</li>
            <li>Docking-plan decision</li>
            <li>Safety evidence gaps</li>
          </ul>
          <button onClick={onSaved}>Add agenda item</button>
        </Panel>
        <Panel title="Team workload" icon={BarChart3} className="dds-workload">
          {disciplines.slice(0, 5).map((d, i) => (
            <div key={d}>
              <span>{d}</span>
              <i>
                <b style={{ width: `${45 + i * 9}%` }} />
              </i>
              <small>{i === 3 ? "At risk" : "On track"}</small>
            </div>
          ))}
        </Panel>
        <Panel
          title="Access and permissions"
          icon={ShieldCheck}
          className="dds-access"
        >
          {[
            "Elena Park · Owner",
            "Maya Chen · Editor",
            "Lucas Moretti · Editor",
            "Sarah Kim · Reviewer",
            "James Patel · Viewer",
          ].map((x) => (
            <p key={x}>
              {x}
              <button onClick={onSaved}>Review</button>
            </p>
          ))}
        </Panel>
      </div>
    </div>
  );
}
