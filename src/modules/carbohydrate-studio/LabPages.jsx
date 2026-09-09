import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Beaker,
  CheckCircle2,
  Link2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Droplets,
  Eye,
  Flame,
  FlaskConical,
  Gauge,
  GraduationCap,
  GripVertical,
  HeartPulse,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Smile,
  Sparkles,
  Star,
  Target,
  Thermometer,
  Trophy,
  Utensils,
  Waves,
  X,
  Zap,
} from "lucide-react";
import CarbohydrateViewer from "./CarbohydrateViewer.jsx";
import { CARBOHYDRATES, COMPOUND_NAMES } from "./carbohydrateData.js";

const water = {
  name: "Water",
  formula: "H₂O",
  classification: "Small molecule",
  cid: 962,
  source: "/assets/carbohydrate-studio/structures/water.sdf",
};
const solubilityTemperatures = [0, 25, 40, 60, 80, 100];
const solubilityAt = (name, temperature) => {
  const values = CARBOHYDRATES[name].solubility;
  let upper = solubilityTemperatures.findIndex((t) => t >= temperature);
  if (upper < 0) upper = solubilityTemperatures.length - 1;
  if (upper === 0) return values[0];
  const lower = upper - 1;
  const ratio =
    (temperature - solubilityTemperatures[lower]) /
    (solubilityTemperatures[upper] - solubilityTemperatures[lower]);
  return Math.round(values[lower] + (values[upper] - values[lower]) * ratio);
};

function Help() {
  return <CircleHelp className="cs-help" />;
}
function Panel({ title, icon: Icon, actions, className = "", children }) {
  return (
    <section className={`cs-lab-panel ${className}`}>
      <div className="cs-lab-panel-head">
        <div>
          {Icon && <Icon />}
          <h3>{title}</h3>
          <Help />
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}
function Control({
  icon: Icon,
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  select,
}) {
  return (
    <label className="cs-control">
      {Icon && <Icon />}
      <span>{label}</span>
      {select ? (
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {select.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      ) : (
        <>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(+e.target.value)}
          />
          <output>
            {value}
            {unit}
          </output>
        </>
      )}
    </label>
  );
}

const reactionPresets = {
  Hydrolysis: {
    title: "Sucrose Hydrolysis",
    equation: "C₁₂H₂₂O₁₁ + H₂O → C₆H₁₂O₆ + C₆H₁₂O₆",
    subtitle: "Break the α(1→2)β glycosidic bond to form glucose and fructose.",
  },
  Oxidation: {
    title: "Glucose Oxidation",
    equation: "C₆H₁₂O₆ + O₂ → C₆H₁₂O₇",
    subtitle: "Oxidize the aldehyde-equivalent reducing end to gluconic acid.",
  },
  Reduction: {
    title: "Glucose Reduction",
    equation: "C₆H₁₂O₆ + H₂ → C₆H₁₄O₆",
    subtitle:
      "Reduce the carbonyl-equivalent form to the sugar alcohol sorbitol.",
  },
  Fermentation: {
    title: "Glucose Fermentation",
    equation: "C₆H₁₂O₆ → 2 C₂H₅OH + 2 CO₂",
    subtitle:
      "Follow anaerobic conversion of glucose into ethanol and carbon dioxide.",
  },
};
const reactionStages = [
  "Reactants",
  "Molecular approach",
  "Bond polarization",
  "Bond breaking",
  "H / OH transfer",
  "Product formation",
  "Separated products",
];

function EnergyChart({ progress, activation }) {
  const points = Array.from({ length: 51 }, (_, i) => {
    const x = i / 50;
    const energy =
      -18 * x + activation * Math.exp(-Math.pow((x - 0.48) / 0.2, 2));
    return [24 + x * 330, 145 - energy * 1.25];
  });
  return (
    <svg
      className="cs-chart"
      viewBox="0 0 380 180"
      role="img"
      aria-label={`Energy profile with activation energy ${activation} kilojoules per mole`}
    >
      <g className="cs-chart-grid">
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1="24" x2="354" y1={25 + i * 30} y2={25 + i * 30} />
        ))}
      </g>
      <polyline points={points.map((p) => p.join(",")).join(" ")} />
      <line
        className="cs-chart-marker"
        x1={24 + progress * 3.3}
        x2={24 + progress * 3.3}
        y1="18"
        y2="153"
      />
      <text x="25" y="170">
        Reactants
      </text>
      <text x="300" y="170">
        Products
      </text>
      <text x="188" y="20">
        Eₐ = {activation} kJ/mol
      </text>
    </svg>
  );
}

function ReactionModels({ progress }) {
  const stage = Math.min(6, Math.floor(progress / 16.67));
  return (
    <div className="cs-reaction-models" data-stage={stage}>
      <div
        className={`cs-reaction-side reactants ${stage > 4 ? "is-faded" : ""}`}
      >
        <div>
          <strong>Sucrose</strong>
          <small>C₁₂H₂₂O₁₁</small>
          <CarbohydrateViewer
            compound={CARBOHYDRATES.Sucrose}
            carbonLabels={stage >= 2 && stage <= 4}
            selectedCarbon={stage >= 2 && stage <= 4 ? 1 : null}
          />
        </div>
        <b className="cs-reaction-plus">+</b>
        <div className="cs-water">
          <strong>Water</strong>
          <CarbohydrateViewer compound={water} representation="Ball & stick" />
        </div>
      </div>
      <div className="cs-reaction-arrow">
        <ArrowRight />
      </div>
      <div
        className={`cs-reaction-side products ${stage < 3 ? "is-faded" : ""}`}
      >
        <div>
          <strong>Glucose</strong>
          <small>C₆H₁₂O₆</small>
          <CarbohydrateViewer compound={CARBOHYDRATES["D-Glucose"]} />
        </div>
        <b className="cs-reaction-plus">+</b>
        <div>
          <strong>Fructose</strong>
          <small>C₆H₁₂O₆</small>
          <CarbohydrateViewer compound={CARBOHYDRATES["D-Fructose"]} />
        </div>
      </div>
      {stage === 3 && (
        <div className="cs-transition-flash">
          <Link2 /> Glycosidic bond cleavage
        </div>
      )}
    </div>
  );
}

function ReactionInspector({ tab, setTab, open, onClose, category }) {
  return (
    <aside
      className={`cs-inspector cs-reaction-inspector ${open ? "is-open" : ""}`}
    >
      <div className="cs-panel-title">
        <strong>About this reaction</strong>
        <button className="cs-icon-button" onClick={onClose}>
          <X />
        </button>
      </div>
      <div className="cs-inspector-tabs">
        {["Overview", "Bonds", "Mechanism"].map((t) => (
          <button
            className={tab === t ? "is-active" : ""}
            onClick={() => setTab(t)}
            key={t}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="cs-inspector-copy">
          <article>
            <Link2 />
            <div>
              <h3>Bond breaking</h3>
              <p>
                {category === "Hydrolysis"
                  ? "Hydrolysis breaks the α(1→2)β glycosidic bond between glucose C1 and fructose C2."
                  : "The highlighted functional group is transformed while the carbon skeleton remains conserved."}
              </p>
            </div>
          </article>
          <article>
            <Settings2 />
            <div>
              <h3>Role of catalyst</h3>
              <p>
                Acid or sucrase lowers the activation barrier by stabilizing the
                transition state.
              </p>
            </div>
          </article>
          <article>
            <FlaskConical />
            <div>
              <h3>Balanced equation</h3>
              <div className="cs-equation-box">
                {reactionPresets[category].equation}
              </div>
            </div>
          </article>
          <article>
            <Eye />
            <div>
              <h3>Expected observations</h3>
              <ul>
                <li>Reactant concentration decreases.</li>
                <li>Products increase according to stoichiometry.</li>
                <li>Glucose and fructose are reducing sugars.</li>
              </ul>
            </div>
          </article>
        </div>
      )}
      {tab === "Bonds" && (
        <div className="cs-inspector-copy">
          <article>
            <Link2 />
            <div>
              <h3>Reactive bond</h3>
              <p>
                C1—O—C2 is polarized before heterolytic cleavage. Water supplies
                H and OH to cap the products.
              </p>
              <div className="cs-bond-diagram">
                <b>C1</b>
                <span>— O —</span>
                <b>C2</b>
              </div>
            </div>
          </article>
          <article>
            <Activity />
            <div>
              <h3>Electron density</h3>
              <p>
                The bridging oxygen is protonated under acid catalysis, making
                the glycosidic group a better leaving group.
              </p>
            </div>
          </article>
        </div>
      )}
      {tab === "Mechanism" && (
        <ol className="cs-mechanism-list">
          {reactionStages.map((s, i) => (
            <li key={s}>
              <b>{i + 1}</b>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}

export function ReactionPage({ inspectorOpen, setInspectorOpen }) {
  const [category, setCategory] = useState("Hydrolysis");
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [acid, setAcid] = useState(0.1);
  const [temperature, setTemperature] = useState(37);
  const [enzyme, setEnzyme] = useState(true);
  const [duration, setDuration] = useState(120);
  const [concentration, setConcentration] = useState(0.5);
  const [tab, setTab] = useState("Overview");
  const activation = Math.max(
    28,
    Math.round(78 - (enzyme ? 18 : 0) - acid * 40 - (temperature - 25) * 0.18),
  );
  const rateFactor =
    speed * (enzyme ? 1.45 : 1) * (1 + acid) * Math.max(0.65, temperature / 37);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(
      () =>
        setProgress((p) =>
          p >= 100 ? 100 : Math.min(100, p + rateFactor * 0.34),
        ),
      60,
    );
    return () => clearInterval(timer);
  }, [playing, rateFactor]);
  useEffect(() => {
    if (progress >= 100) setPlaying(false);
  }, [progress]);
  const stage = Math.min(6, Math.floor(progress / 16.67));
  const extent = progress / 100;
  const sucrose = Math.max(0, Math.round(20 * (1 - extent)));
  const products = Math.round(20 * extent);
  return (
    <>
      <main className="cs-main cs-reaction-page">
        <div className="cs-page-top">
          <div>
            <p className="cs-eyebrow">
              <FlaskConical /> Reaction Lab
            </p>
            <h2>{reactionPresets[category].title}</h2>
            <p>{reactionPresets[category].subtitle}</p>
          </div>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setProgress(0);
            }}
          >
            {Object.keys(reactionPresets).map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div className="cs-category-tabs">
          {Object.keys(reactionPresets).map((name) => (
            <button
              className={category === name ? "is-active" : ""}
              onClick={() => {
                setCategory(name);
                setProgress(0);
              }}
              key={name}
            >
              <FlaskConical />
              {name}
            </button>
          ))}
        </div>
        <section className="cs-reaction-stage">
          <h1>{reactionPresets[category].title}</h1>
          <p>{reactionPresets[category].equation}</p>
          <ReactionModels progress={progress} />
          <div className="cs-reaction-playback">
            <button
              aria-label={playing ? "Pause reaction" : "Play reaction"}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing ? <Pause /> : <Play />}
            </button>
            <button
              aria-label="Previous reaction frame"
              onClick={() => setProgress((p) => Math.max(0, p - 16.67))}
            >
              <ChevronLeft />
            </button>
            <input
              aria-label="Reaction timeline"
              type="range"
              min="0"
              max="100"
              step=".1"
              value={progress}
              onChange={(e) => setProgress(+e.target.value)}
            />
            <button
              aria-label="Next reaction frame"
              onClick={() => setProgress((p) => Math.min(100, p + 16.67))}
            >
              <ChevronRight />
            </button>
            <b>
              {Math.round(extent * duration)} s / {duration} s
            </b>
          </div>
          <div className="cs-reaction-timeline">
            {reactionStages.map((s, i) => (
              <button
                className={stage === i ? "is-active" : ""}
                onClick={() => setProgress(i * 16.67)}
                key={s}
              >
                <span>{Math.round((i * duration) / 6)}s</span>
                <b>{s}</b>
              </button>
            ))}
          </div>
        </section>
        <div className="cs-reaction-data">
          <Panel title="Reaction conditions" icon={Settings2}>
            <div className="cs-controls-stack">
              <Control
                icon={FlaskConical}
                label="Acid concentration"
                value={acid}
                min={0}
                max={1}
                step={0.05}
                unit=" M"
                onChange={setAcid}
              />
              <Control
                icon={Thermometer}
                label="Temperature"
                value={temperature}
                min={10}
                max={90}
                unit=" °C"
                onChange={setTemperature}
              />
              <Control
                icon={Sparkles}
                label="Enzyme"
                value={enzyme ? "Sucrase on" : "Off"}
                select={["Sucrase on", "Off"]}
                onChange={(v) => setEnzyme(v === "Sucrase on")}
              />
              <Control
                icon={Clock3}
                label="Duration"
                value={duration}
                min={30}
                max={300}
                step={10}
                unit=" s"
                onChange={setDuration}
              />
              <Control
                icon={Beaker}
                label="Concentration"
                value={concentration}
                min={0.1}
                max={1}
                step={0.1}
                unit=" M"
                onChange={setConcentration}
              />
              <Control
                icon={Gauge}
                label="Playback"
                value={speed}
                min={0.25}
                max={2}
                step={0.25}
                unit="×"
                onChange={setSpeed}
              />
            </div>
          </Panel>
          <Panel title="Energy profile" icon={Activity}>
            <EnergyChart progress={progress} activation={activation} />
          </Panel>
          <Panel title="Molecule counts (real-time)" icon={Waves}>
            <div className="cs-count-list">
              <span>
                <i className="is-sucrose" />
                Sucrose{" "}
                <small>{(concentration * (1 - extent)).toFixed(2)} M</small>
                <b>{sucrose}</b>
              </span>
              <span>
                <i className="is-water" />
                Water <small>solvent</small>
                <b>{Math.max(0, Math.round(180 * concentration) - products)}</b>
              </span>
              <span>
                <i className="is-glucose" />
                Glucose <small>{(concentration * extent).toFixed(2)} M</small>
                <b>{products}</b>
              </span>
              <span>
                <i className="is-fructose" />
                Fructose <small>{(concentration * extent).toFixed(2)} M</small>
                <b>{products}</b>
              </span>
            </div>
            <div className="cs-log">
              <strong>Observation log</strong>
              <p>
                {reactionStages[stage]} · {activation} kJ mol⁻¹ barrier ·{" "}
                {temperature} °C
              </p>
            </div>
          </Panel>
        </div>
      </main>
      <ReactionInspector
        tab={tab}
        setTab={setTab}
        open={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
        category={category}
      />
    </>
  );
}

function SolubilityChart({ compounds, temperature }) {
  const colors = ["#45dcff", "#ff63d2", "#ffd84b"];
  return (
    <svg
      className="cs-chart cs-sol-chart"
      viewBox="0 0 520 260"
      role="img"
      aria-label="Solubility versus temperature graph"
    >
      <g className="cs-chart-grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line key={i} x1="50" x2="500" y1={20 + i * 40} y2={20 + i * 40} />
        ))}
      </g>
      {compounds.map((name, index) => {
        const vals = CARBOHYDRATES[name].solubility;
        const pts = vals.map((v, i) => [
          50 + solubilityTemperatures[i] * 4.5,
          220 - Math.min(200, v * 0.72),
        ]);
        return (
          <g key={name}>
            <polyline
              style={{ stroke: colors[index] }}
              points={pts.map((p) => p.join(",")).join(" ")}
            />
            <text x="60" y={35 + index * 20} style={{ fill: colors[index] }}>
              ● {name}
            </text>
            <circle
              cx={50 + temperature * 4.5}
              cy={220 - Math.min(200, solubilityAt(name, temperature) * 0.72)}
              r="6"
              style={{ fill: colors[index] }}
            />
          </g>
        );
      })}
      <line
        className="cs-chart-marker"
        x1={50 + temperature * 4.5}
        x2={50 + temperature * 4.5}
        y1="18"
        y2="222"
      />
      <text x="210" y="250">
        Temperature (°C)
      </text>
    </svg>
  );
}

function BeakerScene({ compounds, concentration, temperature }) {
  return (
    <div className="cs-beaker-scene">
      {compounds.map((name) => (
        <div className="cs-beaker-unit" key={name}>
          <h4>{name}</h4>
          <small>{CARBOHYDRATES[name].formula}</small>
          <div className="cs-beaker">
            <div
              className="cs-solution"
              style={{
                height: `${35 + concentration * 35}%`,
                opacity: 0.45 + temperature / 200,
              }}
            />
            <CarbohydrateViewer
              compound={CARBOHYDRATES[name]}
              hydrogens={false}
            />
            <div className="cs-beaker-scale">
              200
              <br />
              150
              <br />
              100
              <br />
              50
            </div>
          </div>
          <button>{name}</button>
        </div>
      ))}
    </div>
  );
}

function ExperimentReadout({
  experiment,
  compounds,
  concentration,
  temperature,
}) {
  if (experiment === "Solubility") return null;
  if (experiment === "Optical rotation")
    return (
      <div className="cs-experiment-readout">
        <Waves />
        <div>
          <strong>Polarimetry active</strong>
          <p>
            Adjust concentration, tube length, temperature, and wavelength in
            the inspector. Rotation follows α = [α]lc.
          </p>
        </div>
      </div>
    );
  if (experiment === "Sweetness")
    return (
      <div className="cs-experiment-bars">
        {compounds.map((n) => (
          <div key={n}>
            <span>{n}</span>
            <i>
              <b
                style={{
                  width: `${Math.min(100, (CARBOHYDRATES[n].sweetness / 1.7) * 100)}%`,
                }}
              />
            </i>
            <strong>{CARBOHYDRATES[n].sweetness}×</strong>
          </div>
        ))}
      </div>
    );
  if (experiment === "Melting / decomposition")
    return (
      <div className="cs-experiment-readout">
        <Thermometer />
        <div>
          <strong>Thermal behaviour</strong>
          <p>
            {compounds
              .map((n) => `${n}: ${CARBOHYDRATES[n].melting}`)
              .join(" · ")}
          </p>
        </div>
      </div>
    );
  if (experiment === "Osmotic behaviour") {
    const pressure = (
      concentration *
      0.082057 *
      (temperature + 273.15)
    ).toFixed(2);
    return (
      <div className="cs-experiment-readout">
        <Gauge />
        <div>
          <strong>Ideal osmotic pressure: {pressure} atm</strong>
          <p>π = MRT for a non-electrolyte at {temperature} °C.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="cs-experiment-readout">
      <FlaskConical />
      <div>
        <strong>{experiment}</strong>
        <p>
          Reducing sugars convert the reagent to a visible product; sucrose
          remains negative until hydrolysed.
        </p>
      </div>
    </div>
  );
}

function Polarimeter({ compound, concentration, tubeLength, wavelength }) {
  const c = CARBOHYDRATES[compound];
  const base = c.rotation || 0;
  const angle = +(base * (concentration / 0.1) * tubeLength).toFixed(1);
  return (
    <div className="cs-polarimeter">
      <div className="cs-light-source" />
      <div className="cs-light-tube">
        <i style={{ transform: `rotate(${angle}deg)` }} />
      </div>
      <div className="cs-dial" style={{ "--angle": `${angle}deg` }}>
        <span>
          {angle > 0 ? "+" : ""}
          {angle}°
        </span>
      </div>
      <p>
        Plane-polarized {wavelength} nm light rotates through {tubeLength} dm of{" "}
        {compound} solution.
      </p>
    </div>
  );
}

export function PropertiesPage({ inspectorOpen, setInspectorOpen }) {
  const [compounds, setCompounds] = useState([
    "D-Glucose",
    "D-Fructose",
    "Sucrose",
  ]);
  const [temperature, setTemperature] = useState(25);
  const [ph, setPh] = useState(7);
  const [concentration, setConcentration] = useState(0.1);
  const [solvent, setSolvent] = useState("Water");
  const [wavelength, setWavelength] = useState(589);
  const [experiment, setExperiment] = useState("Solubility");
  const [polarCompound, setPolarCompound] = useState("D-Glucose");
  const [tubeLength, setTubeLength] = useState(1);
  const [testResult, setTestResult] = useState(null);
  const toggleCompound = (name) =>
    setCompounds((c) =>
      c.includes(name)
        ? c.length > 1
          ? c.filter((x) => x !== name)
          : c
        : [...c.slice(-2), name],
    );
  const p = CARBOHYDRATES[polarCompound];
  const angle = +(
    (p.rotation || 0) *
    (concentration / 0.1) *
    tubeLength
  ).toFixed(1);
  const experiments = [
    "Solubility",
    "Optical rotation",
    "Sweetness",
    "Melting / decomposition",
    "Benedict’s test",
    "Fehling’s test",
    "Tollens’ test",
    "Osmotic behaviour",
  ];
  return (
    <>
      <main className="cs-main cs-properties-page">
        <div className="cs-page-top">
          <div>
            <h2>Properties Lab</h2>
            <h3>Compare Carbohydrates</h3>
            <p>
              Measure how molecular structure changes physical and chemical
              behaviour.
            </p>
          </div>
          <div className="cs-compare-picker">
            Compare:{" "}
            {COMPOUND_NAMES.slice(0, 11).map((name) => (
              <button
                key={name}
                className={compounds.includes(name) ? "is-active" : ""}
                onClick={() => toggleCompound(name)}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
        <div className="cs-experiment-tabs">
          {experiments.map((x) => (
            <button
              key={x}
              className={experiment === x ? "is-active" : ""}
              onClick={() => {
                setExperiment(x);
                setTestResult(null);
              }}
            >
              {x}
            </button>
          ))}
        </div>
        <ExperimentReadout
          experiment={experiment}
          compounds={compounds}
          concentration={concentration}
          temperature={temperature}
        />
        <div className="cs-bench-row">
          <BeakerScene
            compounds={compounds}
            concentration={concentration}
            temperature={temperature}
          />
          <div className="cs-bench-controls">
            <Control
              icon={Thermometer}
              label="Temperature"
              value={temperature}
              min={0}
              max={100}
              unit=" °C"
              onChange={setTemperature}
            />
            <Control
              icon={FlaskConical}
              label="pH"
              value={ph}
              min={0}
              max={14}
              step={0.5}
              onChange={setPh}
            />
            <Control
              icon={Beaker}
              label="Concentration"
              value={concentration}
              min={0.01}
              max={1}
              step={0.01}
              unit=" M"
              onChange={setConcentration}
            />
            <Control
              icon={Waves}
              label="Solvent"
              value={solvent}
              select={["Water", "Ethanol", "DMSO"]}
              onChange={setSolvent}
            />
            {experiment.includes("test") && (
              <button
                className="cs-primary"
                onClick={() =>
                  setTestResult(
                    compounds
                      .map(
                        (n) =>
                          `${n}: ${CARBOHYDRATES[n].reducing ? "positive" : "negative"}`,
                      )
                      .join(" · "),
                  )
                }
              >
                <FlaskConical /> Run {experiment}
              </button>
            )}
            {testResult && <div className="cs-test-result">{testResult}</div>}
          </div>
        </div>
        <div className="cs-properties-data">
          <Panel title="Solubility" icon={Activity}>
            <SolubilityChart compounds={compounds} temperature={temperature} />
          </Panel>
          <Panel
            title={`Property comparison (${temperature} °C, pH ${ph})`}
            icon={Beaker}
          >
            <div className="cs-property-table">
              <div>
                <b>Property</b>
                {compounds.map((n) => (
                  <b key={n}>{n}</b>
                ))}
              </div>
              {[
                [
                  "Molar mass",
                  (n) =>
                    CARBOHYDRATES[n].molarMass
                      ? `${CARBOHYDRATES[n].molarMass} g/mol`
                      : "Polymer",
                ],
                [
                  "Solubility",
                  (n) => `${solubilityAt(n, temperature)} g/100 mL`,
                ],
                ["Sweetness", (n) => CARBOHYDRATES[n].sweetness],
                [
                  "Optical rotation",
                  (n) =>
                    CARBOHYDRATES[n].rotation == null
                      ? "Not fixed"
                      : `${CARBOHYDRATES[n].rotation > 0 ? "+" : ""}${CARBOHYDRATES[n].rotation}°`,
                ],
                ["Melting behaviour", (n) => CARBOHYDRATES[n].melting],
                [
                  "Reducing ability",
                  (n) => (CARBOHYDRATES[n].reducing ? "Yes" : "No"),
                ],
              ].map(([label, get]) => (
                <div key={label}>
                  <span>{label}</span>
                  {compounds.map((n) => (
                    <span key={n}>{get(n)}</span>
                  ))}
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>
      <aside
        className={`cs-inspector cs-properties-inspector ${inspectorOpen ? "is-open" : ""}`}
      >
        <div className="cs-panel-title">
          <strong>
            <Waves /> Polarimeter
          </strong>
          <button
            className="cs-icon-button"
            onClick={() => setInspectorOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="cs-polar-controls">
          <select
            value={polarCompound}
            onChange={(e) => setPolarCompound(e.target.value)}
          >
            {COMPOUND_NAMES.slice(0, 11).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <Control
            label="Tube length"
            value={tubeLength}
            min={0.5}
            max={2}
            step={0.1}
            unit=" dm"
            onChange={setTubeLength}
          />
          <Control
            label="Wavelength"
            value={wavelength}
            min={436}
            max={656}
            step={1}
            unit=" nm"
            onChange={setWavelength}
          />
        </div>
        <Polarimeter
          compound={polarCompound}
          concentration={concentration}
          tubeLength={tubeLength}
          wavelength={wavelength}
        />
        <section className="cs-polar-result">
          <h3>Result</h3>
          <strong>
            {angle > 0 ? "+" : ""}
            {angle}°
          </strong>
          <small>
            at {temperature} °C, {wavelength} nm
          </small>
        </section>
        <section className={`cs-rotation-card ${angle < 0 ? "is-left" : ""}`}>
          <Sparkles />
          <div>
            <h3>{angle >= 0 ? "Dextrorotatory (+)" : "Levorotatory (−)"}</h3>
            <p>
              Rotates plane-polarized light to the{" "}
              {angle >= 0 ? "right (clockwise)" : "left (counterclockwise)"}.
            </p>
          </div>
        </section>
        <section className="cs-fact-card">
          <Lightbulb />
          <div>
            <strong>
              {p.name} is {p.reducing ? "reducing" : "non-reducing"}
            </strong>
            <p>
              {p.reducing
                ? "Its free anomeric centre responds to Benedict’s, Fehling’s and Tollens’ reagents."
                : "Its anomeric centres are joined, so reducing-sugar tests remain negative."}
            </p>
          </div>
        </section>
      </aside>
    </>
  );
}

const pathwaySets = {
  "Digestion & Absorption": [
    [
      "Food (starch)",
      "Mouth",
      "Stomach",
      "Small intestine",
      "Enterocyte",
      "Bloodstream",
      "Cellular respiration",
    ],
    [
      "Ingestion",
      "Salivary amylase",
      "Acid pause",
      "Pancreatic amylase",
      "Maltase · SGLT1",
      "GLUT2 · circulation",
      "Glycolysis · TCA · ETC",
    ],
  ],
  "Sucrose digestion": [
    [
      "Sucrose meal",
      "Mouth",
      "Stomach",
      "Brush border",
      "Enterocyte",
      "Bloodstream",
      "Cellular respiration",
    ],
    [
      "Ingestion",
      "No cleavage",
      "Acid transit",
      "Sucrase",
      "SGLT1 / GLUT5",
      "GLUT2",
      "Glycolysis · TCA · ETC",
    ],
  ],
  "Lactose digestion": [
    [
      "Lactose meal",
      "Mouth",
      "Stomach",
      "Brush border",
      "Enterocyte",
      "Bloodstream",
      "Cellular respiration",
    ],
    [
      "Ingestion",
      "No cleavage",
      "Acid transit",
      "Lactase",
      "SGLT1 / GLUT5",
      "GLUT2",
      "Glycolysis · TCA · ETC",
    ],
  ],
  "Glycogen metabolism": [
    [
      "Glycogen store",
      "Phosphorolysis",
      "Glucose-1-P",
      "Glucose-6-P",
      "Glycolysis",
      "Pyruvate",
      "ATP production",
    ],
    [
      "Glycogen phosphorylase",
      "Debranching enzyme",
      "Phosphoglucomutase",
      "Hexose pool",
      "Cytosolic enzymes",
      "Pyruvate dehydrogenase",
      "TCA · ETC",
    ],
  ],
  "Cellulose & fibre": [
    [
      "Plant fibre",
      "Mouth",
      "Stomach",
      "Small intestine",
      "Colon",
      "Microbiota",
      "Host metabolism",
    ],
    [
      "Chewing",
      "No cellulase",
      "Acid transit",
      "Water retention",
      "Fermentation",
      "Short-chain acids",
      "Colonocyte oxidation",
    ],
  ],
  "Glycolysis overview": [
    [
      "Glucose",
      "Priming",
      "Cleavage",
      "Oxidation",
      "ATP formation",
      "Pyruvate",
      "Cellular respiration",
    ],
    [
      "Hexokinase",
      "PFK-1",
      "Aldolase",
      "GAPDH",
      "Pyruvate kinase",
      "Pyruvate dehydrogenase",
      "TCA · ETC",
    ],
  ],
};
const pathwayIcons = [
  Utensils,
  Smile,
  Activity,
  Waves,
  Droplets,
  HeartPulse,
  Zap,
];
const stepFacts = [
  {
    location: "Diet",
    substrate: "Starch",
    product: "Chewed starch",
    enzyme: "Mechanical processing",
    ph: "~7",
    description:
      "Food introduces α-linked glucose polymers to the digestive tract.",
    significance: "Starch is a compact, digestible energy reserve.",
  },
  {
    location: "Oral cavity",
    substrate: "Starch",
    product: "Maltose + oligosaccharides",
    enzyme: "Salivary amylase",
    ph: "~6.8",
    description:
      "Salivary α-amylase hydrolyses internal α(1→4) bonds, creating shorter dextrins.",
    significance:
      "Carbohydrate digestion begins before food reaches the stomach.",
  },
  {
    location: "Stomach",
    substrate: "Oligosaccharides",
    product: "Mostly unchanged carbohydrate",
    enzyme: "Amylase becomes inactive",
    ph: "1–3",
    description:
      "Strong acidity denatures salivary amylase, so little carbohydrate cleavage occurs.",
    significance:
      "The stomach mainly mixes and meters chyme into the intestine.",
  },
  {
    location: "Small-intestinal lumen",
    substrate: "Starch fragments",
    product: "Maltose + limit dextrins",
    enzyme: "Pancreatic amylase",
    ph: "6–7.5",
    description:
      "Pancreatic amylase resumes α(1→4) hydrolysis in neutralized chyme.",
    significance:
      "Luminal digestion prepares oligosaccharides for brush-border enzymes.",
  },
  {
    location: "Brush border / enterocyte",
    substrate: "Maltose and sucrose",
    product: "Glucose, fructose, galactose",
    enzyme: "Maltase · sucrase · lactase",
    ph: "6–7.5",
    description:
      "Disaccharidases make monosaccharides. SGLT1 cotransports glucose with Na⁺; GLUT5 transports fructose.",
    significance:
      "Secondary active transport concentrates glucose inside the cell.",
  },
  {
    location: "Basolateral membrane and blood",
    substrate: "Intracellular glucose",
    product: "Circulating glucose",
    enzyme: "GLUT2 facilitated diffusion",
    ph: "7.4",
    description:
      "GLUT2 releases monosaccharides down their gradient into portal blood.",
    significance: "Tissues use glucose for ATP production or storage.",
  },
  {
    location: "Cytosol and mitochondria",
    substrate: "Glucose + O₂",
    product: "CO₂ + H₂O + ATP",
    enzyme: "Glycolysis · TCA cycle · electron transport chain",
    ph: "~7.2",
    description:
      "Cells oxidize glucose through glycolysis, pyruvate oxidation, the TCA cycle and oxidative phosphorylation.",
    significance:
      "Complete aerobic respiration captures far more ATP than glycolysis alone.",
  },
];

function MembraneTransport({ running, onToggle }) {
  return (
    <section className={`cs-membrane ${running ? "is-running" : ""}`}>
      <div className="cs-membrane-title">
        <div>
          <h3>Glucose transport across the enterocyte</h3>
          <p>Intestinal lumen → enterocyte (SGLT1) → bloodstream (GLUT2)</p>
        </div>
        <button onClick={onToggle}>
          {running ? <Pause /> : <Play />}
          {running ? "Pause transport" : "Animate transport"}
        </button>
      </div>
      <div className="cs-membrane-scene">
        <div className="cs-zone cs-lumen">
          <b>Intestinal lumen</b>
          <span>high Na⁺</span>
        </div>
        <div className="cs-zone cs-cell">
          <b>Enterocyte</b>
          <span>epithelial cell</span>
        </div>
        <div className="cs-zone cs-blood">
          <b>Bloodstream</b>
          <span>portal circulation</span>
        </div>
        <div className="cs-bilayer top">
          {Array.from({ length: 25 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="cs-bilayer bottom">
          {Array.from({ length: 25 }, (_, i) => (
            <i key={i} />
          ))}
        </div>
        <div className="cs-transporter sglt">
          SGLT1<small>Na⁺ + glucose</small>
        </div>
        <div className="cs-transporter glut">
          GLUT2<small>facilitated diffusion</small>
        </div>
        {Array.from({ length: 7 }, (_, i) => (
          <span key={`g${i}`} className={`cs-particle glucose p${i}`}>
            G
          </span>
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <span key={`n${i}`} className={`cs-particle sodium p${i}`}>
            Na⁺
          </span>
        ))}
        <ArrowRight className="cs-flow-arrow one" />
        <ArrowRight className="cs-flow-arrow two" />
      </div>
      <div className="cs-membrane-key">
        <span>
          <i className="cs-particle glucose">G</i> Glucose
        </span>
        <span>
          <i className="cs-particle sodium">Na⁺</i> Sodium ion
        </span>
        <span>
          Apical cotransport uses the Na⁺ gradient; basolateral exit is passive.
        </span>
      </div>
    </section>
  );
}

export function BiologyPage({ inspectorOpen, setInspectorOpen }) {
  const [pathway, setPathway] = useState("Digestion & Absorption");
  const [step, setStep] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [transport, setTransport] = useState(true);
  const names = pathwaySets[pathway][0],
    enzymes = pathwaySets[pathway][1];
  const fact =
    pathway === "Digestion & Absorption"
      ? stepFacts[step]
      : {
          location: names[step],
          substrate: names[Math.max(0, step - 1)],
          product: names[Math.min(6, step + 1)],
          enzyme: enzymes[step],
          ph: step === 2 ? "1–3" : "6–7.5",
          description: `${enzymes[step]} advances the ${pathway.toLowerCase()} pathway from ${names[step]} toward ${names[Math.min(6, step + 1)]}.`,
          significance: `This stage connects carbohydrate structure to ${pathway.toLowerCase()} physiology.`,
        };
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep((s) => (s >= 6 ? 0 : s + 1)), 1800);
    return () => clearInterval(timer);
  }, [playing]);
  return (
    <>
      <main className="cs-main cs-biology-page">
        <div className="cs-bio-title">
          <div>
            <p>BIOLOGY EXPLORER</p>
            <h2>{pathway}</h2>
            <h3>Follow one glucose molecule</h3>
          </div>
          <p>
            Explore how dietary carbohydrates are broken down into
            monosaccharides, absorbed in the small intestine, and used for
            cellular energy.
          </p>
          <select
            value={pathway}
            onChange={(e) => {
              setPathway(e.target.value);
              setStep(0);
            }}
          >
            {Object.keys(pathwaySets).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <section className="cs-pathway-scene">
          {names.map((name, i) => {
            const Icon = pathwayIcons[i];
            return (
              <button
                key={name}
                className={`cs-pathway-step ${step === i ? "is-active" : ""} ${step > i ? "is-complete" : ""}`}
                onClick={() => setStep(i)}
              >
                <span className="cs-step-num">{i + 1}</span>
                <h3>{name}</h3>
                <Icon />
                <b>{enzymes[i]}</b>
                <small>
                  {i === 2
                    ? "pH 1–3"
                    : i === 1
                      ? "pH ~6.8"
                      : i >= 3 && i < 5
                        ? "pH 6–7.5"
                        : ""}
                </small>
                {i < 6 && <ArrowRight className="cs-step-arrow" />}
              </button>
            );
          })}
          <span className={`cs-follow-glucose step-${step}`}>G</span>
        </section>
        <div className="cs-bio-controls">
          <button onClick={() => setPlaying((v) => !v)}>
            {playing ? <Pause /> : <Play />}
            {playing ? "Pause pathway" : "Play pathway"}
          </button>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ChevronLeft /> Previous
          </button>
          <div>
            {names.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to pathway step ${i + 1}`}
                className={step === i ? "is-active" : ""}
                onClick={() => setStep(i)}
              />
            ))}
          </div>
          <button onClick={() => setStep((s) => Math.min(6, s + 1))}>
            Next <ChevronRight />
          </button>
        </div>
        <MembraneTransport
          running={transport}
          onToggle={() => setTransport((v) => !v)}
        />
      </main>
      <aside
        className={`cs-inspector cs-bio-inspector ${inspectorOpen ? "is-open" : ""}`}
      >
        <div className="cs-panel-title">
          <strong>Pathway Inspector</strong>
          <button
            className="cs-icon-button"
            onClick={() => setInspectorOpen(false)}
          >
            <X />
          </button>
        </div>
        <div className="cs-step-selector">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))}>
            <ChevronLeft />
          </button>
          <b>Step {step + 1} of 7</b>
          <button onClick={() => setStep((s) => Math.min(6, s + 1))}>
            <ChevronRight />
          </button>
        </div>
        <section className="cs-location-card">
          {(() => {
            const I = pathwayIcons[step];
            return <I />;
          })()}
          <div>
            <h2>{names[step]}</h2>
            <p>{enzymes[step]}</p>
          </div>
        </section>
        <dl className="cs-pathway-facts">
          <div>
            <dt>Enzyme</dt>
            <dd>{fact.enzyme}</dd>
          </div>
          <div>
            <dt>Substrate</dt>
            <dd>{fact.substrate}</dd>
          </div>
          <div>
            <dt>Product</dt>
            <dd>{fact.product}</dd>
          </div>
          <div>
            <dt>Location</dt>
            <dd>{fact.location}</dd>
          </div>
          <div>
            <dt>pH</dt>
            <dd>{fact.ph}</dd>
          </div>
        </dl>
        <section className="cs-about-step">
          <h3>About this step</h3>
          <p>{fact.description}</p>
          <div className="cs-bio-mini">
            <CarbohydrateViewer
              compound={
                step === 0 ? CARBOHYDRATES.Starch : CARBOHYDRATES["D-Glucose"]
              }
              hydrogens={false}
            />
          </div>
        </section>
        <section className="cs-fact-card">
          <Lightbulb />
          <div>
            <strong>Did you know?</strong>
            <p>{fact.significance}</p>
          </div>
        </section>
      </aside>
    </>
  );
}

const quizBank = [
  {
    mode: "Identify the carbohydrate",
    title: "Identify the Carbohydrate",
    prompt:
      "Examine the 3D structure and Haworth projection. Which carbohydrate is shown?",
    compound: "D-Glucose",
    choices: ["D-Glucose", "D-Fructose", "D-Galactose", "D-Mannose"],
    answer: "D-Glucose",
    explanation:
      "The six-membered pyranose ring and glucose OH pattern identify D-glucose.",
    hints: [
      "Count the ring atoms.",
      "Locate the anomeric carbon.",
      "Compare the C4 hydroxyl orientation.",
    ],
  },
  {
    mode: "Label the carbon atoms",
    title: "Label the Carbon Atoms",
    prompt:
      "Select the carbon adjacent to the ring oxygen that bears the anomeric hydroxyl.",
    compound: "D-Glucose",
    choices: ["C1", "C2", "C5", "C6"],
    answer: "C1",
    explanation:
      "In an aldose such as glucose, the former carbonyl carbon becomes anomeric C1.",
    hints: [
      "Start next to ring oxygen.",
      "This carbon came from the aldehyde.",
      "It is carbon 1.",
    ],
  },
  {
    mode: "Determine α or β",
    title: "Determine α or β",
    prompt:
      "The anomeric OH is trans to CH₂OH in this D-sugar. Which anomer is it?",
    compound: "D-Glucose",
    choices: ["α anomer", "β anomer", "Epimer", "Enantiomer"],
    answer: "α anomer",
    explanation:
      "For D-glucose, trans orientation of anomeric OH and CH₂OH is the α anomer.",
    hints: [
      "Compare two substituents.",
      "Use cis/trans orientation.",
      "Trans is α for this D-sugar.",
    ],
  },
  {
    mode: "Identify an epimer",
    title: "Identify an Epimer",
    prompt: "Which monosaccharide differs from D-glucose only at C2?",
    compound: "D-Mannose",
    choices: ["D-Mannose", "D-Galactose", "D-Fructose", "D-Ribose"],
    answer: "D-Mannose",
    explanation:
      "D-mannose is the C2 epimer of D-glucose; D-galactose is the C4 epimer.",
    hints: [
      "Look for one stereocentre.",
      "Compare the C2 OH.",
      "Mannose differs at C2.",
    ],
  },
  {
    mode: "Determine reducing ability",
    title: "Determine Reducing Ability",
    prompt: "Will this disaccharide give a positive Benedict’s test?",
    compound: "Sucrose",
    choices: ["Yes, strongly", "Yes, weakly", "No", "Only after reduction"],
    answer: "No",
    explanation:
      "Sucrose has both anomeric centres tied in its α(1→2)β bond, so it cannot open to a free carbonyl.",
    hints: [
      "Find both anomeric centres.",
      "Are either centres free?",
      "Both are acetal/ketal centres.",
    ],
  },
  {
    mode: "Select the glycosidic linkage",
    title: "Select the Glycosidic Linkage",
    prompt: "Identify the linkage in maltose.",
    compound: "Maltose",
    choices: ["α(1→4)", "β(1→4)", "α(1→2)β", "α(1→6)"],
    answer: "α(1→4)",
    explanation:
      "Maltose joins two glucose units through an α bond from C1 to C4.",
    hints: [
      "Both monomers are glucose.",
      "The acceptor is carbon 4.",
      "The donor geometry is α.",
    ],
  },
  {
    mode: "Predict the reaction product",
    title: "Predict the Reaction Product",
    prompt: "Complete hydrolysis of sucrose forms which pair?",
    compound: "Sucrose",
    choices: [
      "Glucose + fructose",
      "Glucose + glucose",
      "Galactose + glucose",
      "Ribose + fructose",
    ],
    answer: "Glucose + fructose",
    explanation:
      "Water cleaves sucrose into its constituent glucose and fructose monomers.",
    hints: [
      "Sucrose contains two different rings.",
      "One is a ketose.",
      "The pair is glucose and fructose.",
    ],
  },
  {
    mode: "Match structure to function",
    title: "Match Structure to Biological Function",
    prompt: "Which polymer’s β(1→4) chains reinforce plant cell walls?",
    compound: "Cellulose",
    choices: ["Cellulose", "Starch", "Glycogen", "Trehalose"],
    answer: "Cellulose",
    explanation:
      "Linear cellulose chains hydrogen-bond into strong fibrils in plant walls.",
    hints: [
      "Look for a structural polymer.",
      "Humans cannot hydrolyse it.",
      "It is dietary fibre.",
    ],
  },
  {
    mode: "Build the correct molecule",
    title: "Build the Correct Molecule",
    prompt: "Choose the monomers that form lactose.",
    compound: "Lactose",
    choices: [
      "Galactose + glucose",
      "Glucose + fructose",
      "Glucose + glucose",
      "Ribose + glucose",
    ],
    answer: "Galactose + glucose",
    explanation: "Lactose is β-D-galactopyranosyl-(1→4)-D-glucose.",
    hints: [
      "It is milk sugar.",
      "Lactase cleaves it.",
      "One monomer is galactose.",
    ],
  },
  {
    mode: "Interpret experimental results",
    title: "Interpret Experimental Results",
    prompt:
      "A sample gives a brick-red Benedict’s precipitate but sucrose does not. What does this show?",
    compound: "D-Glucose",
    choices: [
      "The sample is reducing",
      "The sample is nonpolar",
      "The sample is a polymer",
      "The sample is acidic",
    ],
    answer: "The sample is reducing",
    explanation:
      "A brick-red Cu₂O precipitate indicates reduction of Cu²⁺ by a free carbonyl-equivalent sugar.",
    hints: [
      "Benedict’s uses copper ions.",
      "A red solid is Cu₂O.",
      "The sugar transfers electrons.",
    ],
  },
];
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

function QuizHaworth({
  assigned,
  setAssigned,
  selectedCarbon,
  setSelectedCarbon,
}) {
  const pts = [
    [65, 115],
    [112, 55],
    [190, 78],
    [213, 150],
    [163, 207],
    [87, 205],
  ];
  return (
    <div className="cs-quiz-haworth">
      <svg viewBox="0 0 270 250">
        <polyline points={pts.map((p) => p.join(",")).join(" ")} />
        <text x="145" y="56">
          O
        </text>
        {pts.map(([x, y], i) => (
          <g key={i} onClick={() => setSelectedCarbon(i + 1)}>
            <circle
              cx={x}
              cy={y}
              r="20"
              className={selectedCarbon === i + 1 ? "is-active" : ""}
            />
            <text x={x} y={y + 5} textAnchor="middle">
              {assigned[i] || "?"}
            </text>
          </g>
        ))}
      </svg>
      <div className="cs-label-bank">
        {["C1", "C2", "C3", "C4", "C5", "C6"].map((label) => (
          <button
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", label)}
            onClick={() =>
              setAssigned((a) => {
                const next = [...a];
                const index = Math.max(0, selectedCarbon - 1);
                next[index] = label;
                return next;
              })
            }
            key={label}
          >
            <GripVertical />
            {label}
          </button>
        ))}
      </div>
      <div className="cs-drop-row">
        {assigned.map((label, i) => (
          <span
            key={i}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) =>
              setAssigned((a) => {
                const next = [...a];
                next[i] = e.dataTransfer.getData("text/plain");
                return next;
              })
            }
          >
            {label || `C${i + 1}`}
          </span>
        ))}
      </div>
    </div>
  );
}

export function QuizPage({ inspectorOpen, setInspectorOpen }) {
  const [questions, setQuestions] = useState(() => quizBank);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [confidence, setConfidence] = useState("Not sure");
  const [hintCount, setHintCount] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  const [assigned, setAssigned] = useState(Array(6).fill(""));
  const [selectedCarbon, setSelectedCarbon] = useState(1);
  const q = questions[index];
  const correct = submitted && choice === q.answer;
  const submit = () => {
    if (!choice || submitted) return;
    const ok = choice === q.answer;
    setSubmitted(true);
    setAttempts((a) => a + 1);
    if (ok) {
      setCorrectCount((c) => c + 1);
      setScore(
        (s) =>
          s +
          (difficulty === "Hard" ? 150 : difficulty === "Easy" ? 70 : 100) +
          streak * 10,
      );
      setStreak((s) => s + 1);
    } else setStreak(0);
  };
  const next = () => {
    setIndex((i) => (i + 1) % questions.length);
    setChoice("");
    setSubmitted(false);
    setHintCount(0);
    setAssigned(Array(6).fill(""));
    setSelectedCarbon(1);
  };
  const restart = () => {
    setQuestions(shuffle(quizBank));
    setIndex(0);
    setChoice("");
    setSubmitted(false);
    setScore(0);
    setStreak(0);
    setAttempts(0);
    setCorrectCount(0);
    setHintCount(0);
  };
  return (
    <>
      <main className="cs-main cs-quiz-page">
        <div className="cs-quiz-head">
          <div>
            <p>
              <GraduationCap /> Quiz Lab
            </p>
            <h2>{q.title}</h2>
            <span>{q.prompt}</span>
          </div>
          <div className="cs-quiz-metrics">
            <div>
              <b>
                Question {index + 1} of {questions.length}
              </b>
              <progress value={index + 1} max={questions.length} />
            </div>
            <span>
              <Flame />
              {streak}
              <small>Streak</small>
            </span>
            <span>
              <Star />
              {score}
              <small>Score</small>
            </span>
            <label>
              <BarChart3 />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
              <small>Difficulty</small>
            </label>
          </div>
        </div>
        <div className="cs-quiz-visuals">
          <Panel
            title="3D Molecular Model"
            icon={FlaskConical}
            actions={
              <select>
                <option>Ball & stick</option>
                <option>Space filling</option>
              </select>
            }
          >
            <div className="cs-quiz-viewer">
              <CarbohydrateViewer
                compound={CARBOHYDRATES[q.compound]}
                selectedCarbon={selectedCarbon}
                onSelectCarbon={setSelectedCarbon}
                carbonLabels={false}
              />
            </div>
          </Panel>
          <Panel
            title="Haworth Projection"
            icon={Waves}
            actions={
              <select>
                <option>α / β view</option>
                <option>Fischer view</option>
              </select>
            }
          >
            <QuizHaworth
              assigned={assigned}
              setAssigned={setAssigned}
              selectedCarbon={selectedCarbon}
              setSelectedCarbon={setSelectedCarbon}
            />
          </Panel>
        </div>
        <div className="cs-answer-area">
          <section>
            <h3>1. Choose your answer</h3>
            <div className="cs-answer-choices">
              {q.choices.map((c) => (
                <button
                  disabled={submitted}
                  className={`${choice === c ? "is-selected" : ""} ${submitted && c === q.answer ? "is-correct" : ""} ${submitted && choice === c && c !== q.answer ? "is-wrong" : ""}`}
                  onClick={() => setChoice(c)}
                  key={c}
                >
                  <i />
                  {c}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3>
              2. Label the carbons <small>(optional)</small>
            </h3>
            <p>
              Choose a carbon, then assign a draggable label in the Haworth
              panel.
            </p>
            <div className="cs-carbon-summary">
              {assigned.map((c, i) => (
                <span key={i}>
                  <b>C{i + 1}</b>
                  {c || "—"}
                </span>
              ))}
            </div>
          </section>
          <section>
            <h3>3. Confidence</h3>
            <div className="cs-confidence">
              {["Not sure", "Somewhat sure", "Very sure"].map((c) => (
                <button
                  className={confidence === c ? "is-active" : ""}
                  onClick={() => setConfidence(c)}
                  key={c}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="cs-hints">
              <strong>
                <Lightbulb /> Hint ladder
              </strong>
              {q.hints.map((h, i) => (
                <button
                  key={h}
                  disabled={i > hintCount}
                  onClick={() =>
                    setHintCount(Math.min(3, Math.max(hintCount, i + 1)))
                  }
                >
                  <span>Hint {i + 1}</span>
                  {i < hintCount ? h : "Reveal progressively"}
                  <ChevronRight />
                </button>
              ))}
            </div>
          </section>
        </div>
        <div className="cs-quiz-actions">
          <button
            className="cs-primary"
            disabled={!choice || submitted}
            onClick={submit}
          >
            <CheckCircle2 /> Check answer
          </button>
          {submitted && (
            <button onClick={next}>
              Next question <ChevronRight />
            </button>
          )}
          {submitted && !correct && (
            <button
              onClick={() => {
                setSubmitted(false);
                setChoice("");
              }}
            >
              <RotateCcw /> Retry
            </button>
          )}
          <button onClick={restart}>
            <RotateCcw /> New randomized quiz
          </button>
        </div>
      </main>
      <aside
        className={`cs-inspector cs-quiz-inspector ${inspectorOpen ? "is-open" : ""}`}
      >
        <div className="cs-panel-title">
          <strong>Learning objectives</strong>
          <Target />
          <button
            className="cs-icon-button"
            onClick={() => setInspectorOpen(false)}
          >
            <X />
          </button>
        </div>
        <ul className="cs-objectives">
          <li>
            <CheckCircle2 /> Recognize 2D and 3D carbohydrate structures
          </li>
          <li>
            <CheckCircle2 /> Identify ring size and α/β configuration
          </li>
          <li>
            <CheckCircle2 /> Connect stereochemistry to reactivity
          </li>
        </ul>
        <Panel title="Topic mastery" icon={BarChart3}>
          <div className="cs-mastery">
            {[
              ["Structure", 80],
              ["Reactions", 45],
              ["Properties", 60],
              ["Biology", 30],
            ].map(([t, v]) => (
              <div key={t}>
                <span>{t}</span>
                <progress value={v} max="100" />
                <b>{v}%</b>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Current challenge" icon={Trophy}>
          <dl className="cs-challenge">
            <div>
              <dt>Type</dt>
              <dd>{q.mode}</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{q.compound}</dd>
            </div>
            <div>
              <dt>Difficulty</dt>
              <dd>{difficulty}</dd>
            </div>
            <div>
              <dt>Accuracy</dt>
              <dd>
                {attempts ? Math.round((correctCount / attempts) * 100) : 0}%
              </dd>
            </div>
          </dl>
        </Panel>
        <Panel title="Answer feedback" icon={Activity}>
          <div
            className={`cs-feedback ${submitted ? (correct ? "is-correct" : "is-wrong") : ""}`}
          >
            {!submitted ? (
              <>
                <CircleHelp />
                <p>Your explanation will appear after you check.</p>
              </>
            ) : (
              <>
                <strong>{correct ? "Correct" : "Not quite"}</strong>
                <p>{q.explanation}</p>
                <small>
                  Confidence: {confidence} · Hints used: {hintCount}
                </small>
              </>
            )}
          </div>
        </Panel>
      </aside>
    </>
  );
}
