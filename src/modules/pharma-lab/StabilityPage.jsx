import { useEffect, useMemo, useRef, useState } from "react";
import { BarChart3, Eye, FileText, Play, TestTube2 } from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import ExperimentControls from "./components/ExperimentControls.jsx";
import ScientificChart from "./components/ScientificChart.jsx";
import StabilityChambers from "./components/StabilityChambers.jsx";
import {
  conditions,
  packages,
  packagingComparison,
  pullTimes,
  simulateStability,
} from "./simulation/stabilityModel.js";
import "./pharmaLab.css";
import "./stability.css";

export default function StabilityPage() {
  const timer = useRef(null);
  const [query, setQuery] = useState("");
  const [condition, setCondition] = useState("accelerated");
  const [packageType, setPackageType] = useState("pvc");
  const [month, setMonth] = useState(3);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [motion, setMotion] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [modeled, setModeled] = useState(false);
  const [sources, setSources] = useState(false);
  const [message, setMessage] = useState(
    "Pull the selected scheduled samples before HPLC analysis.",
  );
  const [audit, setAudit] = useState([
    { time: "14:02", action: "Study opened", detail: "PT-24-001" },
  ]);
  const result = useMemo(
    () => simulateStability({ condition, packageType, months: month }),
    [condition, packageType, month],
  );
  useEffect(() => {
    clearInterval(timer.current);
    if (running)
      timer.current = setInterval(
        () => setProgress((p) => Math.min(100, p + speed * 2)),
        120,
      );
    return () => clearInterval(timer.current);
  }, [running, speed]);
  useEffect(() => {
    if (progress >= 100 && running) {
      setRunning(false);
      setMessage("Scheduled pull completed. Samples are ready for HPLC.");
      setAudit((a) => [
        ...a,
        {
          time: "14:08",
          action: "Pulled samples",
          detail: `${month}M, ${conditions[condition].label}`,
        },
      ]);
    }
  }, [progress, running, month, condition]);
  const reset = () => {
    setCondition("accelerated");
    setPackageType("pvc");
    setMonth(3);
    setProgress(0);
    setRunning(false);
    setStarted(false);
    setAnalyzed(false);
    setModeled(false);
    setAudit([{ time: "14:02", action: "Study opened", detail: "PT-24-001" }]);
    setMessage("Default ICH teaching study restored.");
  };
  const toggle = () => {
    setStarted(true);
    setRunning((v) => !v);
    setMessage(
      running
        ? "Sample pull paused."
        : "Retrieving the selected package from the stability chamber.",
    );
  };
  const runHplc = () => {
    if (progress < 100)
      return setMessage(
        "Complete the scheduled sample pull before running HPLC.",
      );
    setAnalyzed(true);
    setAudit((a) => [
      ...a,
      {
        time: "14:18",
        action: "Ran HPLC",
        detail: `Assay ${result.current.assay.toFixed(1)}%`,
      },
    ]);
    setMessage("Assay and degradation-product results calculated.");
  };
  const trend = result.rows.map((r) => ({ x: r.x, y: r.assay }));
  const impurities = result.rows.map((r) => ({ x: r.x, y: r.impurities }));
  return (
    <PharmaLabShell
      query={query}
      setQuery={setQuery}
      activeStage={6}
      onReset={reset}
      onSave={() => setMessage("Stability study state saved locally.")}
      onSources={() => setSources(true)}
      reducedMotion={motion}
      setReducedMotion={setMotion}
    >
      <main className="plab-stability">
        <header className="plab-stability-title">
          <div>
            <h1>Stability & Degradation — ICH Study</h1>
            <p>
              Real stability data. Reliable medicines.{" "}
              <span>Representative data for educational use only.</span>
            </p>
          </div>
          <aside>
            Compound: <b>Paracetamol Tablet</b> · ICH: <b>Q1A(R2)</b> · Batch:{" "}
            <b>PT-24-001</b> · Start: <b>01 Jan 2025</b>
          </aside>
        </header>
        <div className="plab-stability-grid">
          <aside className="plab-stability-left">
            <h2>Stability Study Protocol</h2>
            <div className="plab-condition-tabs">
              {Object.entries(conditions).map(([key, value]) => (
                <button
                  key={key}
                  className={condition === key ? "active" : ""}
                  onClick={() => {
                    setCondition(key);
                    setAnalyzed(false);
                  }}
                >
                  {value.label}
                  <b>
                    {value.light
                      ? "1.2 M lux·h"
                      : `${value.temperature}°C / ${value.rh}% RH`}
                  </b>
                </button>
              ))}
            </div>
            <h2>Sample Schedule (Months)</h2>
            {pullTimes.map((time) => (
              <button
                className={`plab-pull ${month === time ? "active" : ""}`}
                key={time}
                onClick={() => {
                  setMonth(time);
                  setProgress(0);
                  setAnalyzed(false);
                }}
              >
                <i /> <b>{time}</b>
                {time === 0
                  ? "Initial (T0)"
                  : `${time} Month${time === 1 ? "" : "s"}`}
              </button>
            ))}
          </aside>
          <section className="plab-stability-center">
            <StabilityChambers
              active={condition}
              running={running && !motion}
              selectedMonth={month}
            />
            <article className="plab-stability-trend">
              <h2>
                Analytical Results — Trend ({conditions[condition].label}{" "}
                {result.env.temperature}°C / {result.env.rh}% RH)
              </h2>
              <ScientificChart
                data={trend}
                secondary={impurities}
                xLabel="Time (months)"
                yLabel="Assay (%) / impurities (%)"
                label="Stability assay and impurity trend"
              />
              <div className="plab-trend-values">
                <span>
                  Assay <b>{result.current.assay.toFixed(1)}%</b>
                </span>
                <span>
                  Impurities <b>{result.current.impurities.toFixed(2)}%</b>
                </span>
                <span>
                  Dissolution Q45{" "}
                  <b>{result.current.dissolution.toFixed(0)}%</b>
                </span>
                <span>
                  Moisture <b>{result.current.moisture.toFixed(1)}%</b>
                </span>
              </div>
            </article>
          </section>
          <aside className="plab-degradation">
            <h2>
              Degradation Pathway <small>(Representative)</small>
            </h2>
            <div className="plab-reaction">
              <b>
                Paracetamol
                <br />
                C₈H₉NO₂
              </b>
              <strong>HO⌬—NH—COCH₃</strong>
              <span>Oxidation / Hydrolysis →</span>
              <b>
                p-Aminophenol
                <br />
                C₆H₇NO
              </b>
              <strong>HO⌬—NH₂</strong>
            </div>
            <div className="plab-ms">
              <b>LC-MS (ESI+) — p-Aminophenol</b>
              <i />
              <i />
              <i />
              <i />
              <span>m/z 110.060</span>
            </div>
            <div className="plab-risk">
              ⚠{" "}
              <b>
                {result.current.impurities > 0.5
                  ? "High"
                  : result.current.impurities > 0.2
                    ? "Medium"
                    : "Low"}
              </b>
              <span>Potential toxic impurity (p-aminophenol)</span>
            </div>
          </aside>
        </div>
        <section className="plab-stability-bottom">
          <article className="plab-package">
            <h2>
              Packaging Comparison <small>(6 Months, Accelerated)</small>
            </h2>
            <div className="plab-package-head">
              <b>Packaging</b>
              <b>Assay 6M</b>
              <b>Total impurities</b>
              <b>Moisture</b>
              <b>Protection</b>
            </div>
            {packagingComparison.map((row) => (
              <button
                key={row.packageType}
                className={packageType === row.packageType ? "active" : ""}
                onClick={() => setPackageType(row.packageType)}
              >
                <b>{row.label}</b>
                <span>{row.assay.toFixed(1)}%</span>
                <span>{row.impurities.toFixed(2)}%</span>
                <span>{row.moisture.toFixed(1)}%</span>
                <strong>{row.protection}</strong>
              </button>
            ))}
          </article>
          <article className="plab-kinetic">
            <h2>Kinetic Analysis</h2>
            <ScientificChart
              data={result.rates.map((r) => ({
                x: 1 / (r.temperatureCelsius + 273.15),
                y: Math.log(r.rate),
              }))}
              xLabel="1/T (1/K)"
              yLabel="ln(k)"
              label="Arrhenius degradation plot"
            />
            <b>
              Linear fit R² {result.arrhenius.rSquared.toFixed(3)} · Ea{" "}
              {result.arrhenius.activationEnergyKjPerMol.toFixed(0)} kJ/mol
            </b>
          </article>
          <article className="plab-shelf">
            <h2>Shelf-Life Estimate</h2>
            <span>Predicted shelf-life at 25°C</span>
            <strong>{Math.round(result.shelfLifeMonths)} months</strong>
            <em>
              {modeled
                ? "Calculated first-order estimate"
                : "Model not yet run"}
            </em>
            <small>
              Based on assay lower-limit crossing. Representative educational
              model.
            </small>
          </article>
          <aside className="plab-stability-actions">
            <h2>Run Controls</h2>
            <button onClick={toggle}>
              <TestTube2 />
              Pull Samples
            </button>
            <button className="primary" onClick={runHplc}>
              <Play />
              Run HPLC
            </button>
            <button
              onClick={() =>
                setMessage(
                  "Appearance inspection: no visible change in the selected representative sample.",
                )
              }
            >
              <Eye />
              Inspect Appearance
            </button>
            <button
              onClick={() => {
                if (!analyzed)
                  return setMessage("Run HPLC before modeling shelf life.");
                setModeled(true);
                setAudit((a) => [
                  ...a,
                  {
                    time: "14:45",
                    action: "Modeled shelf life",
                    detail: `${Math.round(result.shelfLifeMonths)} months`,
                  },
                ]);
              }}
            >
              <BarChart3 />
              Model Shelf Life
            </button>
            <button
              onClick={() =>
                setMessage(
                  "Representative stability report prepared for export.",
                )
              }
            >
              <FileText />
              Generate Report
            </button>
            <ExperimentControls
              running={running}
              started={started}
              onToggle={toggle}
              onStep={() => {
                setStarted(true);
                setProgress((p) => Math.min(100, p + 20));
              }}
              onReset={reset}
              speed={speed}
              onSpeedChange={setSpeed}
            />
            <p role="status">{message}</p>
          </aside>
          <aside className="plab-stability-audit">
            <h2>System Status</h2>
            {[
              "Stability Chamber 1",
              "Stability Chamber 2",
              "Photostability Chamber",
              "Temperature Control",
              "Humidity Control",
              "Light Intensity",
            ].map((x) => (
              <span key={x}>
                ● {x}
                <b>Normal</b>
              </span>
            ))}
            <h2>Audit Trail</h2>
            {audit.slice(-5).map((x, i) => (
              <span key={i}>
                <small>{x.time}</small>
                {x.action}
                <b>{x.detail}</b>
              </span>
            ))}
          </aside>
        </section>
        <footer>
          Analytical science supports quality medicines. · Educational use only;
          representative data, not a compendial claim.
        </footer>
      </main>
      {sources && (
        <div className="plab-drawer-backdrop" onClick={() => setSources(false)}>
          <aside className="plab-drawer" onClick={(e) => e.stopPropagation()}>
            <span className="plab-panel-kicker">PAGE 8 PROVENANCE</span>
            <h2>Stability model sources</h2>
            <a
              href="https://database.ich.org/sites/default/files/Q1A%28R2%29%20Guideline.pdf"
              target="_blank"
              rel="noreferrer"
            >
              ICH Q1A(R2)
            </a>
            <a
              href="https://database.ich.org/sites/default/files/Q1B%20Guideline.pdf"
              target="_blank"
              rel="noreferrer"
            >
              ICH Q1B Photostability
            </a>
            <p>
              All trend values and shelf-life estimates are labeled
              representative educational calculations.
            </p>
            <button className="plab-export" onClick={() => setSources(false)}>
              Close source panel
            </button>
          </aside>
        </div>
      )}
    </PharmaLabShell>
  );
}
