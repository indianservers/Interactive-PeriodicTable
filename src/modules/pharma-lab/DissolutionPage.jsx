import { useEffect, useMemo, useRef, useState } from "react";
import {
  Beaker,
  CheckCircle2,
  Droplet,
  MoveUp,
  Pause,
  Play,
  TestTube2,
} from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import DissolutionApparatus from "./components/DissolutionApparatus.jsx";
import ScientificChart from "./components/ScientificChart.jsx";
import ExperimentControls from "./components/ExperimentControls.jsx";
import {
  dissolutionAcceptance,
  dissolutionTimes,
  kineticFits,
  sampleWithReplacement,
  vesselProfiles,
} from "./simulation/dissolutionModel.js";
import { percentRsd } from "./calculations/scientificCalculations.js";
import "./pharmaLab.css";
import "./dissolution.css";

export default function DissolutionPage() {
  const timer = useRef(null);
  const [query, setQuery] = useState("");
  const [rpm, setRpm] = useState(50);
  const [temperature, setTemperature] = useState(37);
  const [pH, setPH] = useState(5.8);
  const [volume, setVolume] = useState(900);
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [raised, setRaised] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [samples, setSamples] = useState([]);
  const [medium, setMedium] = useState("Phosphate buffer");
  const [formulation, setFormulation] = useState("Immediate-release");
  const [sink, setSink] = useState(true);
  const [samplingMode, setSamplingMode] = useState("Manual");
  const [mode, setMode] = useState("guided");
  const [q, setQ] = useState(80);
  const [stage, setStage] = useState("S1");
  const [model, setModel] = useState("Weibull");
  const [motion, setMotion] = useState(false);
  const [sources, setSources] = useState(false);
  const [message, setMessage] = useState(
    "Load one tablet into each vessel, then start the paddle run.",
  );
  const profiles = useMemo(
    () =>
      vesselProfiles({
        rpm,
        temperature,
        pH,
        hardness: 92,
        mediumFactor:
          (medium === "Water" ? 0.91 : medium === "0.1 N HCl" ? 0.96 : 1) *
          (formulation === "High-hardness" ? 0.82 : formulation === "Low-disintegrant" ? 0.75 : 1) *
          (sink ? 1 : 0.7),
      }),
    [rpm, temperature, pH, medium, formulation, sink],
  );
  const atTime = (profile) =>
    profile.reduce((best, point) =>
      Math.abs(point.x - elapsed) < Math.abs(best.x - elapsed) ? point : best,
    ).y;
  const values = profiles.map(atTime);
  const acceptance = dissolutionAcceptance(values, { q, stage });
  const rsd = acceptance.mean ? percentRsd(values) : 0;
  const meanProfile = dissolutionTimes.map((time, i) => ({
    x: time,
    y: profiles.reduce((sum, profile) => sum + profile[i].y, 0) / 6,
  }));
  const fits = kineticFits(meanProfile);
  const selected = fits.find((fit) => fit.name === model) || fits.at(-1);
  useEffect(() => {
    clearInterval(timer.current);
    if (running)
      timer.current = setInterval(
        () => setElapsed((value) => Math.min(45, value + 0.25 * speed)),
        120,
      );
    return () => clearInterval(timer.current);
  }, [running, speed]);
  useEffect(() => {
    if (elapsed >= 45 && running) {
      setRunning(false);
      setMessage(
        "45-minute run complete. Review S1 acceptance and fitted models.",
      );
    }
  }, [elapsed, running]);
  const reset = () => {
    setRpm(50);
    setTemperature(37);
    setPH(5.8);
    setVolume(900);
    setElapsed(0);
    setRunning(false);
    setStarted(false);
    setLoaded(false);
    setRaised(false);
    setSamples([]);
    setMedium("Phosphate buffer");
    setFormulation("Immediate-release");
    setSink(true);
    setSamplingMode("Manual");
    setQ(80);
    setStage("S1");
    setMessage("Default USP Apparatus II teaching method restored.");
  };
  const toggle = () => {
    if (!loaded) return setMessage("Load tablets before starting the paddles.");
    if (raised) return setMessage("Lower the paddles before starting.");
    if (temperature < 36.5 || temperature > 37.5)
      return setMessage("Set the water bath to 37.0 ± 0.5 °C before starting.");
    setStarted(true);
    setRunning((value) => !value);
    setMessage(
      running
        ? `Dissolution paused at ${elapsed.toFixed(1)} min · vessel RSD ${rsd.toFixed(2)}%.`
        : `Dissolution running · current vessel RSD ${rsd.toFixed(2)}%.`,
    );
  };
  const collect = () => {
    if (!loaded || elapsed === 0)
      return setMessage("Begin the run before collecting a sample.");
    const sample = sampleWithReplacement({
      concentrationMgPerMl: values.reduce((a, b) => a + b, 0) / 600,
      sampleVolumeMl: 10,
      mediumVolumeMl: volume,
      replacement: true,
    });
    setSamples((items) => [
      ...items,
      { time: elapsed, mean: acceptance.mean, ...sample },
    ]);
    setMessage(
      `Collected 10 mL from six channels at ${elapsed.toFixed(1)} min and replaced equal medium volume.`,
    );
  };
  useEffect(() => {
    if (samplingMode !== "Automatic" || !running || elapsed <= 0) return;
    const due = [5, 10, 15, 20, 30, 45].find(
      (time) => elapsed >= time && !samples.some((sample) => sample.scheduledTime === time),
    );
    if (due == null) return;
    const sample = sampleWithReplacement({
      concentrationMgPerMl: values.reduce((a, b) => a + b, 0) / 600,
      sampleVolumeMl: 10,
      mediumVolumeMl: volume,
      replacement: true,
    });
    setSamples((items) => [...items, { scheduledTime: due, time: elapsed, mean: acceptance.mean, ...sample }]);
    setMessage(`Autosampler collected and replaced six 10 mL aliquots at the ${due}-minute pull.`);
  }, [elapsed, running, samplingMode, samples, values, volume, acceptance.mean]);
  return (
    <PharmaLabShell
      query={query}
      setQuery={setQuery}
      activeStage={5}
      onReset={reset}
      onSave={() => setMessage("Dissolution method report saved locally.")}
      onSources={() => setSources(true)}
      reducedMotion={motion}
      setReducedMotion={setMotion}
    >
      <main className="plab-dissolve">
        <header className="plab-page-title">
          <div>
            <span className="plab-panel-kicker">
              STAGE 06 · QUALITY CONTROL
            </span>
            <h1>Dissolution Lab — USP Apparatus II</h1>
            <p>Immediate-release paracetamol · six-vessel teaching method</p>
          </div>
          <div className="plab-mode">
            <button className={mode === "guided" ? "active" : ""} onClick={() => setMode("guided")}>Guided</button>
            <button className={mode === "free" ? "active" : ""} onClick={() => setMode("free")}>Free experiment</button>
          </div>
        </header>
        <div className="plab-diss-grid">
          <aside className="plab-method">
            <h2>Method Parameters</h2>
            <dl>
              {[
                ["Apparatus", "USP Apparatus II (Paddle)"],
                ["Medium", medium],
                ["Volume", `${volume} mL / vessel`],
                ["Temperature", `${temperature.toFixed(1)} °C`],
                ["Paddle speed", `${rpm} rpm`],
                ["Duration", "45 min"],
                ["Detection", "UV · 243 nm"],
                ["Sampling", "5, 10, 15, 20, 30, 45 min"],
                [
                  "Run state",
                  running
                    ? `In progress (${elapsed.toFixed(1)} min)`
                    : loaded
                      ? "Ready"
                      : "Not loaded",
                ],
              ].map(([a, b]) => (
                <div key={a}>
                  <dt>{a}</dt>
                  <dd>{b}</dd>
                </div>
              ))}
            </dl>
            <div className="plab-diss-structure">
              <span>HO</span>
              <b>Paracetamol</b>
              <small>C₈H₉NO₂ · MW 151.16</small>
            </div>
          </aside>
          <section className="plab-diss-apparatus">
            <DissolutionApparatus
              running={running && !motion}
              elapsed={elapsed}
              rpm={rpm}
              temperature={temperature}
              loaded={loaded}
              paddlesRaised={raised}
            />
            <div className="plab-profile">
              <h2>Dissolution Profile</h2>
              <ScientificChart
                data={meanProfile.filter(
                  (point) => point.x <= Math.max(5, elapsed) || elapsed === 0,
                )}
                secondary={meanProfile.map((point) => ({
                  ...point,
                  y: Math.min(100, point.y + 5),
                }))}
                limits={[q]}
                xLabel="Time (min)"
                yLabel="% dissolved"
                label="Mean six-vessel simulated dissolution profile"
              />
            </div>
            <div className="plab-kinetics">
              <h2>Kinetic Model Fitting</h2>
              <div>
                {fits.map((fit) => (
                  <button
                    className={model === fit.name ? "active" : ""}
                    onClick={() => setModel(fit.name)}
                    key={fit.name}
                  >
                    {fit.name}
                  </button>
                ))}
              </div>
              <table>
                <tbody>
                  {fits.map((fit) => (
                    <tr key={fit.name}>
                      <td>{fit.name}</td>
                      <td>{fit.r2.toFixed(3)}</td>
                      <td>AIC {fit.aic.toFixed(1)}</td>
                      <td>{fit.parameter}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <b>
                Best fit: {selected.name} · R² {selected.r2.toFixed(3)}
              </b>
            </div>
          </section>
          <aside className="plab-vessel-results">
            <h2>
              Vessel Results <small>({elapsed.toFixed(0)} min)</small>
            </h2>
            <div className="plab-vessel-cards">
              {values.map((value, i) => (
                <article key={i}>
                  <small>Vessel {i + 1}</small>
                  <strong>{value.toFixed(1)}%</strong>
                  <span>
                    <i />
                    <i className="mini-paddle" />
                    <em />
                  </span>
                </article>
              ))}
              <article className="mean">
                <small>Mean dissolved</small>
                <strong>{acceptance.mean.toFixed(1)}%</strong>
                <span>Threshold {acceptance.threshold}%</span>
                <span>RSD {rsd.toFixed(2)}%</span>
                <b className={acceptance.pass ? "pass" : "fail"}>
                  {acceptance.pass ? "✓ Pass" : "Run pending"}
                </b>
              </article>
            </div>
            <div className="plab-diss-controls">
              <h2>Run Controls</h2>
              <button
                onClick={() => {
                  setLoaded(true);
                  setMessage(
                    "Six tablets loaded. Verify method conditions, then start.",
                  );
                }}
              >
                <Beaker />
                Load Tablets
              </button>
              <button onClick={toggle}>
                {running ? <Pause /> : <Play />}
                {running ? "Pause" : "Start / Resume"}
              </button>
              <button
                onClick={() => {
                  setRunning(false);
                  setRaised((value) => !value);
                }}
              >
                <MoveUp /> {raised ? "Lower" : "Raise"} Paddles
              </button>
              <button onClick={collect}>
                <TestTube2 />
                Collect Sample
              </button>
              <button
                onClick={() => {
                  setMedium((value) =>
                    value === "Phosphate buffer"
                      ? "Water"
                      : value === "Water"
                        ? "0.1 N HCl"
                        : "Phosphate buffer",
                  );
                  setMessage(
                    "Medium changed; profiles recalculated with the selected medium factor.",
                  );
                }}
              >
                <Droplet />
                Change Medium
              </button>
            </div>
            <div className="plab-method-controls">
              <label>
                Speed{" "}
                <input
                  type="range"
                  min="25"
                  max="100"
                  value={rpm}
                  onChange={(e) => setRpm(Number(e.target.value))}
                />
                <output>{rpm} rpm</output>
              </label>
              <label>
                Temperature{" "}
                <input
                  type="range"
                  min="35"
                  max="39"
                  step=".1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                />
                <output>{temperature.toFixed(1)} °C</output>
              </label>
              <label>
                pH{" "}
                <input
                  type="range"
                  min="1"
                  max="7"
                  step=".1"
                  value={pH}
                  onChange={(e) => setPH(Number(e.target.value))}
                />
                <output>{pH}</output>
              </label>
              <label>
                Q{" "}
                <input
                  type="range"
                  min="60"
                  max="90"
                  value={q}
                  onChange={(e) => setQ(Number(e.target.value))}
                />
                <output>{q}%</output>
              </label>
              <select
                aria-label="Acceptance stage"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option>S1</option>
                <option>S2</option>
              </select>
              <label>
                Volume
                <input type="range" min="500" max="1000" step="50" value={volume} onChange={(e) => setVolume(Number(e.target.value))}/>
                <output>{volume} mL</output>
              </label>
              <select aria-label="Tablet formulation" value={formulation} onChange={(e) => setFormulation(e.target.value)}>
                <option>Immediate-release</option>
                <option>High-hardness</option>
                <option>Low-disintegrant</option>
              </select>
              <select aria-label="Sink condition" value={sink ? "Sink" : "Non-sink"} onChange={(e) => setSink(e.target.value === "Sink")}>
                <option>Sink</option><option>Non-sink</option>
              </select>
              <select aria-label="Sampling mode" value={samplingMode} onChange={(e) => setSamplingMode(e.target.value)}>
                <option>Manual</option><option>Automatic</option>
              </select>
            </div>
            <ExperimentControls
              running={running}
              started={started}
              onToggle={toggle}
              onStep={() => {
                if (!loaded) return setMessage("Load tablets before stepping.");
                setStarted(true);
                setElapsed((value) => Math.min(45, value + 5));
              }}
              onReset={reset}
              speed={speed}
              onSpeedChange={setSpeed}
            />
            <div className="plab-compliance">
              <CheckCircle2 />
              <span>
                <b>
                  {acceptance.pass
                    ? "Overall Result: PASS"
                    : "Acceptance pending"}
                </b>
                <small>
                  {stage}: all six units ≥ Q {stage === "S1" ? "+ 5" : ""} (
                  {acceptance.threshold}%). {samples.length} samples collected.
                </small>
              </span>
            </div>
            <p role="status">{message}</p>
          </aside>
        </div>
        <footer className="plab-educational-note">
          Configurable educational acceptance check · not a release decision or
          clinical claim.
        </footer>
      </main>
      {sources && (
        <div className="plab-drawer-backdrop" onClick={() => setSources(false)}>
          <aside className="plab-drawer" onClick={(e) => e.stopPropagation()}>
            <span className="plab-panel-kicker">PAGE 6 PROVENANCE</span>
            <h2>Dissolution model</h2>
            <p>
              The six vessel profiles and kinetic-fit scores are deterministic
              representative teaching simulations. The acceptance threshold is
              learner-configurable and must not be interpreted as a product
              claim.
            </p>
            <a
              href="https://www.usp.org/harmonization-standards/pdg/general-methods/dissolution"
              target="_blank"
              rel="noreferrer"
            >
              USP dissolution harmonization overview
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
