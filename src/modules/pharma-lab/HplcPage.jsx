import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Droplet,
  FileDown,
  FlaskConical,
  Play,
  ScanLine,
} from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import HplcInstrument from "./components/HplcInstrument.jsx";
import ScientificChart from "./components/ScientificChart.jsx";
import ExperimentControls from "./components/ExperimentControls.jsx";
import {
  calibrationPoints,
  chromatogramPoints,
  simulateHplcMethod,
} from "./simulation/hplcModel.js";
import "./pharmaLab.css";
import "./hplc.css";

const workflow = [
  "Standard Preparation",
  "Sample Preparation",
  "Sequence Setup",
  "Acquire Data",
  "Integrate Peaks",
  "Generate Report",
];
export default function HplcPage() {
  const timer = useRef(null);
  const [query, setQuery] = useState("");
  const [organic, setOrganic] = useState(30);
  const [flow, setFlow] = useState(1);
  const [temperature, setTemperature] = useState(30);
  const [injection, setInjection] = useState(20);
  const [wavelength, setWavelength] = useState(243);
  const [runTime, setRunTime] = useState(10);
  const [concentration, setConcentration] = useState(100);
  const [threshold, setThreshold] = useState(0.015);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [primed, setPrimed] = useState(false);
  const [integrated, setIntegrated] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [motion, setMotion] = useState(false);
  const [sources, setSources] = useState(false);
  const [mode, setMode] = useState("guided");
  const [audit, setAudit] = useState([
    { time: "14:01", action: "Method loaded", detail: "QC-HPLC-001" },
  ]);
  const [message, setMessage] = useState(
    "Prime the flow path before injecting a standard or sample.",
  );
  const result = useMemo(
    () =>
      simulateHplcMethod({
        organicPercent: organic,
        flow,
        temperature,
        injectionVolume: injection,
        wavelength,
        sampleConcentration: concentration,
        threshold,
      }),
    [
      organic,
      flow,
      temperature,
      injection,
      wavelength,
      concentration,
      threshold,
    ],
  );
  const chromatogram = useMemo(
    () => chromatogramPoints(result.peaks, runTime),
    [result.peaks, runTime],
  );
  useEffect(() => {
    clearInterval(timer.current);
    if (running)
      timer.current = setInterval(
        () => setProgress((v) => Math.min(100, v + speed)),
        120,
      );
    return () => clearInterval(timer.current);
  }, [running, speed]);
  useEffect(() => {
    if (progress >= 100 && running) {
      setRunning(false);
      setMessage(
        "Sequence complete. Integrate detected peaks to calculate assay and impurities.",
      );
      setAudit((a) => [
        ...a,
        {
          time: "14:21",
          action: "Run completed",
          detail: `${runTime.toFixed(1)} min`,
        },
      ]);
    }
  }, [progress, running, runTime]);
  const reset = () => {
    setOrganic(30);
    setFlow(1);
    setTemperature(30);
    setInjection(20);
    setWavelength(243);
    setRunTime(10);
    setConcentration(100);
    setThreshold(0.015);
    setProgress(0);
    setRunning(false);
    setStarted(false);
    setPrimed(false);
    setIntegrated(false);
    setAudit([
      { time: "14:01", action: "Method loaded", detail: "QC-HPLC-001" },
    ]);
    setMessage("Default representative HPLC method restored.");
  };
  const toggle = () => {
    if (!primed)
      return setMessage("Prime the solvent path before running the sequence.");
    setStarted(true);
    setRunning((v) => !v);
    setMessage(
      running
        ? "Sequence paused; pressure and solvent use held."
        : "Sequence running; the sample band is moving through the C18 column.",
    );
  };
  const pass =
    result.assay >= 98 &&
    result.assay <= 102 &&
    result.impurities.reduce((s, p) => s + p.percent, 0) <= 0.5 &&
    result.resolution >= 1.5 &&
    result.injectionRsd <= 1;
  return (
    <PharmaLabShell
      query={query}
      setQuery={setQuery}
      activeStage={5}
      onReset={reset}
      onSave={() => setMessage("HPLC experiment state saved locally.")}
      onSources={() => setSources(true)}
      reducedMotion={motion}
      setReducedMotion={setMotion}
    >
      <main className="plab-hplc">
        <header className="plab-page-title">
          <div>
            <span className="plab-panel-kicker">
              STAGE 06 · ANALYTICAL QUALITY CONTROL
            </span>
            <h1>HPLC Assay & Impurities</h1>
            <p>Paracetamol tablet · representative C18 UV method</p>
          </div>
          <div className="plab-mode">
            <button
              className={mode === "guided" ? "active" : ""}
              onClick={() => setMode("guided")}
            >
              Guided
            </button>
            <button
              className={mode === "free" ? "active" : ""}
              onClick={() => setMode("free")}
            >
              Free experiment
            </button>
          </div>
        </header>
        <div className="plab-hplc-grid">
          <aside className="plab-hplc-left">
            <h2>Analysis Workflow</h2>
            {workflow.map((name, i) => (
              <button key={name} className={progress / 20 >= i ? "done" : ""}>
                <span>{i + 1}</span>
                <b>{name}</b>
              </button>
            ))}
            <h2>Method Parameters</h2>
            <Control
              label="Organic B"
              value={organic}
              set={setOrganic}
              min={10}
              max={70}
              unit="%"
            />
            <Control
              label="Flow rate"
              value={flow}
              set={setFlow}
              min={0.4}
              max={2}
              step={0.1}
              unit="mL/min"
            />
            <Control
              label="Column temp."
              value={temperature}
              set={setTemperature}
              min={20}
              max={60}
              unit="°C"
            />
            <Control
              label="Injection"
              value={injection}
              set={setInjection}
              min={2}
              max={50}
              unit="µL"
            />
            <Control
              label="UV"
              value={wavelength}
              set={setWavelength}
              min={200}
              max={300}
              unit="nm"
            />
            <Control
              label="Run time"
              value={runTime}
              set={setRunTime}
              min={5}
              max={20}
              unit="min"
            />
            <Control
              label="Sample conc."
              value={concentration}
              set={setConcentration}
              min={25}
              max={150}
              unit="µg/mL"
            />
            <Control
              label="Integration"
              value={threshold}
              set={setThreshold}
              min={0.005}
              max={0.1}
              step={0.005}
              unit="AU"
            />
          </aside>
          <section className="plab-hplc-center">
            <HplcInstrument
              running={running && !motion}
              progress={progress}
              pressure={result.pressure}
              flow={flow}
              temperature={temperature}
              wavelength={wavelength}
              primed={primed}
            />
            <div className="plab-chrom">
              <h2>
                Chromatogram — Paracetamol Assay & Impurities{" "}
                <span>{runTime.toFixed(1)} min</span>
              </h2>
              <ScientificChart
                data={chromatogram}
                xLabel="Time (min)"
                yLabel="mAU"
                label="Simulated HPLC chromatogram"
              />
              {result.peaks.map((peak) => (
                <span
                  key={peak.name}
                  style={{
                    left: `${Math.min(92, (peak.rt / runTime) * 100)}%`,
                  }}
                >
                  <b>{peak.name}</b>
                  {peak.rt.toFixed(2)} min
                </span>
              ))}
            </div>
          </section>
          <aside className="plab-hplc-right">
            <h2>Run Controls</h2>
            <button
              onClick={() => {
                setPrimed(true);
                setMessage("Solvent path primed; pressure stabilized.");
                setAudit((a) => [
                  ...a,
                  {
                    time: "14:05",
                    action: "System primed",
                    detail: `${flow.toFixed(2)} mL/min`,
                  },
                ]);
              }}
            >
              <Droplet />
              Prime System
            </button>
            <button
              onClick={() =>
                setMessage(
                  primed
                    ? "Standard injected; calibration response confirmed."
                    : "Prime the system before injection.",
                )
              }
            >
              <FlaskConical />
              Inject Standard
            </button>
            <button className="primary" onClick={toggle}>
              <Play />
              Run Sequence
            </button>
            <button
              onClick={() => {
                if (progress < 100)
                  return setMessage(
                    "Complete the sequence before integration.",
                  );
                setIntegrated(true);
                setAudit((a) => [
                  ...a,
                  {
                    time: "14:22",
                    action: "Data integrated",
                    detail: `${result.peaks.length} peaks`,
                  },
                ]);
                setMessage(
                  "Peak integration complete; assay and impurity results updated.",
                );
              }}
            >
              <ScanLine />
              Integrate Peaks
            </button>
            <button
              onClick={() =>
                setMessage("Representative report prepared for local export.")
              }
            >
              <FileDown />
              Export Report
            </button>
            <ExperimentControls
              running={running}
              started={started}
              onToggle={toggle}
              onStep={() => {
                if (!primed) return setMessage("Prime before stepping.");
                setStarted(true);
                setProgress((v) => Math.min(100, v + 10));
              }}
              onReset={reset}
              speed={speed}
              onSpeedChange={setSpeed}
            />
            <div className="plab-live">
              <span>
                Pressure <b>{result.pressure.toFixed(1)} MPa</b>
              </span>
              <span>
                Solvent <b>{result.solventMl.toFixed(1)} mL</b>
              </span>
              <span>
                Resolution <b>{result.resolution.toFixed(2)}</b>
              </span>
            </div>
            <p role="status">{message}</p>
          </aside>
        </div>
        <section className="plab-hplc-bottom">
          <article>
            <h3>Calibration Curve</h3>
            <ScientificChart
              data={calibrationPoints}
              xLabel="Concentration (µg/mL)"
              yLabel="Peak area"
              label="Representative calibration curve"
            />
            <b>
              y = {result.calibration.slope.toFixed(0)}x +{" "}
              {result.calibration.intercept.toFixed(0)} · R²{" "}
              {result.calibration.rSquared.toFixed(5)}
            </b>
          </article>
          <article className="plab-suit">
            <h3>System Suitability</h3>
            {[
              [
                "Retention",
                result.peaks
                  .find((p) => p.name === "Paracetamol")
                  ?.rt.toFixed(2) + " min",
                true,
              ],
              ["Plates", result.plates.toFixed(0), result.plates >= 5000],
              ["Tailing", result.tailing.toFixed(2), result.tailing <= 1.5],
              [
                "Injection RSD",
                result.injectionRsd.toFixed(2) + "%",
                result.injectionRsd <= 1,
              ],
              [
                "Resolution",
                result.resolution.toFixed(2),
                result.resolution >= 1.5,
              ],
            ].map(([a, b, c]) => (
              <span className={c ? "pass" : "fail"} key={a}>
                {c ? "✓" : "!"} {a}
                <b>{b}</b>
              </span>
            ))}
          </article>
          <article className="plab-sample-results">
            <h3>Sample Results</h3>
            {result.peaks.map((peak) => (
              <span key={peak.name}>
                <b>{peak.name}</b>
                <em>{peak.rt.toFixed(2)} min</em>
                <strong>
                  {peak.name === "Paracetamol"
                    ? result.assay.toFixed(1) + "% label claim"
                    : result.impurities
                        .find((p) => p.name === peak.name)
                        ?.percent.toFixed(3) + "%"}
                </strong>
              </span>
            ))}
            <span>
              <b>Total impurities</b>
              <strong>
                {result.impurities
                  .reduce((s, p) => s + p.percent, 0)
                  .toFixed(3)}
                %
              </strong>
            </span>
          </article>
          <article className="plab-audit">
            <h3>Audit Trail</h3>
            {audit.slice(-5).map((item, i) => (
              <span key={i}>
                <small>{item.time}</small>
                <b>{item.action}</b>
                <em>{item.detail}</em>
              </span>
            ))}
          </article>
          <article
            className={`plab-overall ${pass && integrated ? "pass" : "pending"}`}
          >
            <CheckCircle2 />
            <b>
              {pass && integrated
                ? "OVERALL RESULT · PASS"
                : "INTEGRATION PENDING"}
            </b>
            <span>Representative educational assessment</span>
          </article>
        </section>
        <footer className="plab-educational-note">
          Representative method and data · not a compendial claim or release
          result.
        </footer>
      </main>
      {sources && (
        <div className="plab-drawer-backdrop" onClick={() => setSources(false)}>
          <aside className="plab-drawer" onClick={(e) => e.stopPropagation()}>
            <span className="plab-panel-kicker">PAGE 7 PROVENANCE</span>
            <h2>HPLC model sources</h2>
            <p>
              Compound identity is referenced to PubChem CID 1983. Method,
              chromatogram, calibration, suitability and impurity outputs are
              representative educational simulations.
            </p>
            <a
              href="https://pubchem.ncbi.nlm.nih.gov/compound/1983"
              target="_blank"
              rel="noreferrer"
            >
              Paracetamol · PubChem CID 1983
            </a>
            <button className="plab-export" onClick={() => setSources(false)}>
              Close source panel
            </button>
          </aside>
        </div>
      )}
    </PharmaLabShell>
  );
}
function Control({ label, value, set, min, max, step = 1, unit }) {
  return (
    <label className="plab-hplc-control">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
      <output>
        {value} {unit}
      </output>
    </label>
  );
}
