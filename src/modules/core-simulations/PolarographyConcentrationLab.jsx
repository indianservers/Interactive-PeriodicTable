import { useMemo, useState } from "react";
import {
  Activity,
  Beaker,
  Check,
  ChevronRight,
  Download,
  FlaskConical,
  HelpCircle,
  Pause,
  Play,
  RefreshCw,
  Save,
  ShieldCheck,
  Trophy,
  Wind,
} from "lucide-react";
import {
  CURRENTS,
  DEFAULT,
  STANDARDS,
  baselineAt,
  derivativeAt,
  dilutionVolume,
  linearRegression,
  oxygenAt,
  polarographicCurrent,
  unknownResult,
} from "./polarographyModel.js";
import "./PolarographyConcentrationLab.css";
const STEPS = [
    ["home", "Home"],
    ["setup", "Standards & Cell"],
    ["deaeration", "Deaeration"],
    ["scan", "Polarogram"],
    ["calibration", "Calibration"],
    ["report", "Report"],
  ],
  initialStep = () =>
    Math.max(
      0,
      STEPS.findIndex(
        ([id]) => id === new URLSearchParams(location.search).get("screen"),
      ),
    ),
  Panel = ({ title, children, className = "" }) => (
    <section className={`pg-panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
  Metric = ({ label, value }) => (
    <div className="pg-metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
function Header({ step, go, reset }) {
  return (
    <header className="pg-head">
      <button aria-label="Back">←</button>
      <span>Virtual Labs　/　Instrumental Analysis</span>
      <b>Polarography Concentration Laboratory</b>
      <label>
        {step + 1} of 6 <progress max="5" value={step} />
      </label>
      <button>
        <HelpCircle /> Help
      </button>
      <button onClick={reset}>
        <RefreshCw /> Reset
      </button>
    </header>
  );
}
const Footer = ({ step, go }) => (
  <footer className="pg-foot">
    <button disabled={!step} onClick={() => go(step - 1)}>
      ← Previous
    </button>
    <button className="primary" onClick={() => go(step === 5 ? 0 : step + 1)}>
      {step === 5 ? "Complete Lab" : "Continue"} <ChevronRight />
    </button>
  </footer>
);
function Cell({ bubbles = false, potential = null, current = null }) {
  return (
    <div
      className="pg-cell"
      role="img"
      aria-label="Three-electrode polarographic cell with mercury-film rotating disk working electrode"
    >
      <div className="electrodes">
        <i>
          Hg-film RDE<small>Working</small>
        </i>
        <i>
          Ag/AgCl<small>Reference</small>
        </i>
        <i>
          Pt<small>Counter</small>
        </i>
      </div>
      <div className="vessel">
        {bubbles &&
          Array.from({ length: 28 }, (_, i) => (
            <i
              style={{ left: `${(i * 37) % 95}%`, bottom: `${(i * 53) % 75}%` }}
              key={i}
            />
          ))}
      </div>
      {potential !== null && (
        <div className="display">
          Potential {potential.toFixed(3)} V<br />
          Current {current.toFixed(1)} μA
        </div>
      )}
      <div className="potentiostat">
        POTENTIOSTAT
        <br />
        <small>WE　RE　CE</small>
      </div>
    </div>
  );
}
function Polarogram({
  concentration = 6,
  derivative = false,
  overlay = false,
}) {
  const series = overlay ? STANDARDS : [concentration];
  return (
    <svg
      className="pg-chart"
      viewBox="0 0 650 300"
      role="img"
      aria-label={
        derivative
          ? "Derivative polarogram"
          : "Current versus potential polarogram"
      }
    >
      <line x1="50" x2="610" y1="255" y2="255" />
      <line x1="50" x2="50" y1="25" y2="255" />
      {series.map((c, j) => {
        const pts = Array.from({ length: 91 }, (_, i) => {
          const e = -0.2 - i * 0.01,
            y = derivative
              ? derivativeAt(e, concentration)
              : polarographicCurrent(e, c);
          return `${50 + i * 6.2},${derivative ? 250 - y * 3.6 : 35 - y * 7}`;
        });
        return (
          <polyline className={`line l${j}`} points={pts.join(" ")} key={c} />
        );
      })}
      <line className="half" x1="386" x2="386" y1="25" y2="255" />
      <text x="395" y="55">
        E½ = −0.742 V
      </text>
      <text x="230" y="290">
        Potential vs Ag/AgCl (V)
      </text>
    </svg>
  );
}
function CalibrationChart({ unknown = true }) {
  const fit = linearRegression(),
    points = STANDARDS.map(
      (x, i) => `${55 + x * 52},${260 - CURRENTS[i] * 7.3}`,
    );
  return (
    <svg
      className="pg-chart calibration-chart"
      viewBox="0 0 650 300"
      role="img"
      aria-label="Diffusion current versus cadmium concentration calibration"
    >
      <line x1="55" x2="590" y1="260" y2="260" />
      <line x1="55" x2="55" y1="25" y2="260" />
      <polyline points={points.join(" ")} />
      {points.map((p, i) => {
        const [x, y] = p.split(",");
        return <circle cx={x} cy={y} r="6" key={i} />;
      })}
      {unknown && (
        <>
          <line className="unknown" x1="55" x2="310" y1="153" y2="153" />
          <line className="unknown" x1="310" x2="310" y1="153" y2="260" />
          <circle className="unknown-dot" cx="310" cy="153" r="8" />
        </>
      )}
      <text x="390" y="45">
        iᵈ = {fit.slope.toFixed(2)}C + {fit.intercept.toFixed(2)}
      </text>
      <text x="390" y="70">
        R² = {fit.r2.toFixed(4)}
      </text>
      <text x="210" y="292">
        Cd²⁺ concentration (mg/L)
      </text>
    </svg>
  );
}
function Home({ go }) {
  return (
    <main className="pg-home">
      <section className="home-title">
        <small>ANALYTICAL ELECTROCHEMISTRY</small>
        <h1>Polarography Concentration Laboratory</h1>
        <p>
          Record a polarogram. Measure diffusion current. Determine an unknown
          concentration.
        </p>
      </section>
      <Panel title="Ilkovič Equation (Diffusion Current)" className="equation">
        <p>
          i<sub>d</sub> = 708 n D<sup>1/2</sup> m<sup>2/3</sup> t<sup>1/6</sup>{" "}
          C
        </p>
        <dl>
          <dt>iᵈ</dt>
          <dd>diffusion current</dd>
          <dt>n</dt>
          <dd>electrons transferred</dd>
          <dt>D</dt>
          <dd>diffusion coefficient</dd>
          <dt>m</dt>
          <dd>mercury flow rate</dd>
          <dt>C</dt>
          <dd>concentration</dd>
        </dl>
        <button className="primary" onClick={() => go(1)}>
          <FlaskConical /> Start Experiment
        </button>
      </Panel>
      <Panel title="Example Polarogram (Cd²⁺)">
        <Polarogram />
      </Panel>
      <Panel title="Electrode cell" className="hero-cell">
        <Cell bubbles />
        <p className="mercury">
          <ShieldCheck /> Mercury-film electrode is simulated and
          instructor-controlled. No real mercury handling occurs.
        </p>
      </Panel>
      <section className="feature-cards">
        {[
          ["Instrument Setup", "Assemble the three-electrode cell."],
          ["Deaeration", "Remove dissolved oxygen with nitrogen."],
          ["Polarogram Scan", "Measure the diffusion wave."],
          ["Concentration Analysis", "Use a calibration curve."],
        ].map(([a, b], i) => (
          <article key={a}>
            <i>{i + 1}</i>
            <b>{a}</b>
            <span>{b}</span>
          </article>
        ))}
      </section>
    </main>
  );
}
function Setup({ selected, setSelected, validated, setValidated }) {
  const target = STANDARDS[selected],
    v = dilutionVolume(target);
  return (
    <main className="pg-setup">
      <section className="step-title">
        <h1>Prepare Standards & Configure the Electrochemical Cell</h1>
        <p>
          Prepare cadmium standards, assemble electrodes, and set measurement
          parameters.
        </p>
      </section>
      <Panel title="Prepare Standards (Cd²⁺)" className="standards">
        <table>
          <thead>
            <tr>
              <th>Standard</th>
              <th>C₂ (mg L⁻¹)</th>
              <th>V₁ stock (mL)</th>
              <th>Dilute to (mL)</th>
            </tr>
          </thead>
          <tbody>
            {STANDARDS.map((c, i) => (
              <tr
                className={selected === i ? "selected" : ""}
                onClick={() => setSelected(i)}
                key={c}
              >
                <td>
                  <input type="radio" checked={selected === i} readOnly /> S{i}
                </td>
                <td>{c}</td>
                <td>{dilutionVolume(c).toFixed(2)}</td>
                <td>50.00</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Dilution Calculation</h3>
        <p className="formula">C₁V₁ = C₂V₂</p>
        <p>
          V₁ = ({target} × 50.00) / 100 = <b>{v.toFixed(2)} mL</b>
        </p>
        <div className="glassware">
          100 mg/L stock　➜　pipette {v.toFixed(2)} mL　➜　50 mL flask
        </div>
      </Panel>
      <Panel title="Configure the Electrochemical Cell" className="setup-cell">
        <Cell />
        <div className="depths">
          Working electrode: 2–3 mm
          <br />
          Reference electrode: 2–5 mm
          <br />
          Counter electrode: 2–5 mm
          <br />
          Cell solution: 20.0 mL
          <br />
          Rotation speed: 1000 rpm
        </div>
      </Panel>
      <Panel title="Measurement Parameters" className="params">
        <label>
          Supporting electrolyte
          <select>
            <option>0.10 M KCl</option>
          </select>
        </label>
        <label>
          Deposition potential
          <input
            aria-label="Deposition potential"
            type="number"
            value="-0.90"
            readOnly
          />{" "}
          V
        </label>
        <label>
          Deposition time
          <input type="number" value="60" readOnly /> s
        </label>
        <label>
          Scan range
          <input value="−0.20 to −1.10 V" readOnly />
        </label>
        <h3>Setup Checklist</h3>
        {[
          "Standards prepared",
          "Electrodes connected (WE, RE, CE)",
          "Reference electrode immersed",
          "Mercury-film condition passed",
        ].map((x) => (
          <p className="check" key={x}>
            <Check />
            {x}
          </p>
        ))}
        <button onClick={() => setValidated(false)}>Auto-configure</button>
        <button className="primary" onClick={() => setValidated(true)}>
          <Check /> Validate setup
        </button>
        {validated && (
          <p className="success">
            <Check /> Setup valid and safe
          </p>
        )}
      </Panel>
    </main>
  );
}
function Deaeration({ seconds, setSeconds, saved, setSaved }) {
  const oxygen = oxygenAt(seconds),
    base = baselineAt(seconds),
    complete = seconds >= 580;
  return (
    <main className="pg-deaeration">
      <section className="step-title">
        <h1>Deaerate & Establish Baseline</h1>
        <p>
          Purge with nitrogen to remove dissolved oxygen and establish a stable
          current.
        </p>
      </section>
      <Panel title="Purging & Operating Parameters" className="purge-controls">
        <label>
          Nitrogen flow rate
          <input type="number" value="40" readOnly /> mL/min
        </label>
        <label>
          Purge duration
          <input
            aria-label="Purge duration"
            type="range"
            min="0"
            max="600"
            value={seconds}
            onChange={(e) => setSeconds(+e.target.value)}
          />
          <output>{seconds} s</output>
        </label>
        <label>
          Rotation speed
          <input type="number" value="1000" readOnly /> rpm
        </label>
        <button onClick={() => setSeconds(Math.min(600, seconds + 60))}>
          <Play /> Start
        </button>
        <button className="primary">
          <Pause /> Pause
        </button>
        <p className="warning">
          Nitrogen purging and mercury procedures require a functioning fume
          hood in a real laboratory.
        </p>
      </Panel>
      <Panel title="Deaeration cell" className="deaeration-cell">
        <Cell bubbles />
        <p>Dissolved oxygen decreases during nitrogen purge.</p>
      </Panel>
      <Panel title="Measurement Status">
        <Metric
          label="Time elapsed"
          value={`${Math.floor(seconds / 60)
            .toString()
            .padStart(
              2,
              "0",
            )}:${(seconds % 60).toString().padStart(2, "0")} / 10:00`}
        />
        <Metric label="Dissolved O₂" value={`${oxygen.toFixed(2)} mg L⁻¹`} />
        <Metric label="Baseline current" value={`${base.toFixed(2)} μA`} />
        <Metric
          label="Baseline drift"
          value={complete ? "0.03 μA/min" : "stabilising"}
        />
        <p className={complete ? "success" : "notice"}>
          {complete ? (
            <>
              <Check /> Deaeration complete
            </>
          ) : (
            "Continue purging to O₂ < 0.5 mg L⁻¹"
          )}
        </p>
      </Panel>
      <Panel title="Dissolved Oxygen During Deaeration">
        <svg className="small-chart" viewBox="0 0 500 220">
          <polyline
            points={Array.from(
              { length: 31 },
              (_, i) => `${35 + i * 14},${190 - oxygenAt(i * 20) * 20}`,
            ).join(" ")}
          />
        </svg>
      </Panel>
      <Panel title="Baseline Current at −0.20 V">
        <svg className="small-chart" viewBox="0 0 500 220">
          <polyline
            points={Array.from(
              { length: 31 },
              (_, i) => `${35 + i * 14},${30 - baselineAt(i * 20) * 85}`,
            ).join(" ")}
          />
        </svg>
        <button onClick={() => setSeconds(0)}>
          <RefreshCw /> Restart purge
        </button>
        <button onClick={() => setSaved(true)}>
          <Save /> Save baseline
        </button>
        {saved && (
          <p className="success">
            <Check /> Baseline saved
          </p>
        )}
      </Panel>
    </main>
  );
}
function Scan({
  concentration,
  setConcentration,
  progress,
  setProgress,
  finished,
  setFinished,
}) {
  const potential = -0.2 - (0.9 * progress) / 100,
    current = polarographicCurrent(potential, concentration),
    diffusion = DEFAULT.slope * concentration + DEFAULT.intercept;
  return (
    <main className="pg-scan">
      <section className="step-title">
        <h1>Record Polarogram</h1>
        <p>
          Scan the potential and measure the diffusion current for the selected
          sample.
        </p>
      </section>
      <Panel title="Scan Parameters" className="scan-controls">
        <label>
          Sample
          <select>
            <option>S3 — Cd²⁺</option>
          </select>
        </label>
        <label>
          Concentration
          <input
            aria-label="Scan concentration"
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(+e.target.value)}
          />{" "}
          mg/L
        </label>
        <label>
          Potential range
          <input value="−0.20 to −1.10 V" readOnly />
        </label>
        <label>
          Scan progress
          <input
            aria-label="Scan progress"
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(+e.target.value)}
          />
        </label>
        <button onClick={() => setProgress(Math.min(100, progress + 10))}>
          <Play /> Start
        </button>
        <button className="primary">
          <Pause /> Pause
        </button>
        <button
          className="danger"
          onClick={() => {
            setProgress(100);
            setFinished(true);
          }}
        >
          Finish Scan
        </button>
      </Panel>
      <Panel
        title="Electrochemical Cell and Potentiostat (Live)"
        className="live-cell"
      >
        <Cell bubbles potential={potential} current={current} />
      </Panel>
      <Panel title="Measurement Status">
        <Metric label="Potential" value={`${potential.toFixed(3)} V`} />
        <Metric label="Current" value={`${current.toFixed(1)} μA`} />
        <Metric label="Baseline" value="−0.2 μA" />
        <Metric
          label="Plateau current"
          value={`${(-0.2 - diffusion).toFixed(1)} μA`}
        />
        <Metric
          label="Diffusion current"
          value={`${diffusion.toFixed(1)} μA`}
        />
        <Metric label="Half-wave potential" value="−0.742 V" />
        <p className={finished ? "success" : "notice"}>
          {finished ? (
            <>
              <Check /> Signal stable · scan complete
            </>
          ) : (
            "Scanning toward negative potential"
          )}
        </p>
      </Panel>
      <Panel title="Polarogram (Current vs Potential)" className="scan-plot">
        <Polarogram concentration={concentration} />
      </Panel>
      <Panel title="Derivative (dI/dE)">
        <Polarogram concentration={concentration} derivative />
      </Panel>
    </main>
  );
}
function Calibration({ dilution, setDilution, accepted, setAccepted }) {
  const fit = linearRegression(),
    u = unknownResult([14.5, 14.7, 14.6], dilution);
  return (
    <main className="pg-calibration">
      <section className="step-title">
        <h1>Calibration & Unknown Concentration</h1>
        <p>
          Fit standards, verify quality criteria, and determine the unknown
          sample.
        </p>
      </section>
      <Panel title="Standards Data">
        <table>
          <thead>
            <tr>
              <th>Std</th>
              <th>Concentration</th>
              <th>Diffusion current</th>
            </tr>
          </thead>
          <tbody>
            {STANDARDS.map((c, i) => (
              <tr key={c}>
                <td>S{i}</td>
                <td>{c} mg/L</td>
                <td>{CURRENTS[i].toFixed(1)} μA</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Unknown C-07</h3>
        <Metric label="Replicates" value="14.5, 14.7, 14.6 μA" />
        <Metric label="Mean current" value={`${u.mean.toFixed(1)} μA`} />
        <Metric label="RSD" value={`${u.rsd.toFixed(2)}%`} />
      </Panel>
      <Panel
        title="Calibration Curve (Diffusion Current vs Concentration)"
        className="calibration-plot"
      >
        <CalibrationChart />
        <Panel title="Overlay of Standard Polarograms">
          <Polarogram overlay />
        </Panel>
      </Panel>
      <Panel title="Result for Unknown">
        <Metric label="Diffusion current" value={`${u.mean.toFixed(1)} μA`} />
        <Metric
          label="Diluted concentration"
          value={`${u.diluted.toFixed(2)} ± 0.06 mg/L`}
        />
        <label>
          Dilution factor
          <input
            aria-label="Dilution factor"
            type="number"
            min="1"
            value={dilution}
            onChange={(e) => setDilution(+e.target.value)}
          />
        </label>
        <Metric
          label="Original sample"
          value={`${u.original.toFixed(2)} ± 0.30 mg/L`}
        />
        <Metric label="E½ identity check" value="−0.742 V · confirms Cd²⁺" />
        <p className="formula">C = (iᵈ − b) / m</p>
        <h3>Quality Assessment</h3>
        {[
          ["Calibration range", u.diluted <= 10],
          ["Replicate precision", u.rsd < 2],
          ["Identity confirmation", true],
        ].map(([x, ok]) => (
          <p className="check" key={x}>
            <Check />
            {x}: {ok ? "Pass" : "Review"}
          </p>
        ))}
        <button onClick={() => setAccepted(true)}>
          <Save /> Add to notebook
        </button>
        {accepted && (
          <p className="success">
            <Check /> Result accepted
          </p>
        )}
      </Panel>
    </main>
  );
}
function Report({ reset }) {
  const u = unknownResult(),
    [answers, setAnswers] = useState({}),
    score = [answers.oxygen, answers.identity, answers.proportional].filter(
      Boolean,
    ).length,
    exportCsv = () => {
      const data =
          "standard,concentration_mg_L,current_uA\n" +
          STANDARDS.map((c, i) => `S${i},${c},${CURRENTS[i]}`).join("\n") +
          `\nunknown,${u.diluted},${u.mean}`,
        url = URL.createObjectURL(new Blob([data], { type: "text/csv" })),
        a = document.createElement("a");
      a.href = url;
      a.download = "polarography-results.csv";
      a.click();
      URL.revokeObjectURL(url);
    };
  return (
    <main className="pg-report">
      <section className="report-side">
        <h1>Lab Report & Assessment</h1>
        <p className="success">
          <Check /> Lab Completed — 100%
        </p>
        {[
          "Standards prepared",
          "Oxygen removed",
          "Polarograms collected",
          "Calibration validated",
          "Unknown determined",
        ].map((x) => (
          <p className="check" key={x}>
            <Check />
            {x}
          </p>
        ))}
        <Cell />
      </section>
      <Panel title="Digital Lab Notebook" className="notebook">
        <table>
          <tbody>
            {[
              ["Analyte", "Cd²⁺"],
              ["Working electrode", "Mercury-film RDE (simulated)"],
              ["Supporting electrolyte", "0.10 M KCl"],
              ["Half-wave potential", "−0.742 V vs Ag/AgCl"],
              ["Calibration equation", "iᵈ = 2.97C + 0.08 μA"],
              ["Correlation coefficient", "0.9999"],
              ["Diluted unknown", "4.89 ± 0.06 mg/L"],
              ["Original sample", "24.45 ± 0.30 mg/L"],
            ].map(([a, b]) => (
              <tr key={a}>
                <td>{a}</td>
                <td>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="report-plots">
          <Panel title="Overlaid Polarograms">
            <Polarogram overlay />
          </Panel>
          <Panel title="Calibration Curve">
            <CalibrationChart />
          </Panel>
        </div>
        <p>
          <b>Validated conclusion:</b> The original sample contains 24.45 ± 0.30
          mg/L Cd²⁺, supported by a linear calibration (R² = 0.9999) and the
          characteristic half-wave potential.
        </p>
      </Panel>
      <Panel title="Knowledge Check" className="quiz">
        <button onClick={() => setAnswers({ ...answers, oxygen: true })}>
          Deaeration prevents an interfering reduction wave
        </button>
        <button onClick={() => setAnswers({ ...answers, identity: true })}>
          E½ identifies the electroactive species
        </button>
        <button onClick={() => setAnswers({ ...answers, proportional: true })}>
          Diffusion current is proportional to concentration
        </button>
        <p className={score === 3 ? "success" : "notice"}>
          <Trophy /> Score: {score}/3
        </p>
        <p>
          <ShieldCheck /> Safety confirmed: simulated mercury-film procedures
          only.
        </p>
      </Panel>
      <section className="report-actions">
        <button onClick={exportCsv}>
          <Download /> Download CSV
        </button>
        <button onClick={() => print()}>
          <Download /> Export PDF
        </button>
        <button className="primary" onClick={reset}>
          <RefreshCw /> Complete Lab
        </button>
      </section>
    </main>
  );
}
export default function PolarographyConcentrationLab() {
  const [step, setStep] = useState(initialStep),
    [selected, setSelected] = useState(3),
    [validated, setValidated] = useState(false),
    [seconds, setSeconds] = useState(582),
    [baselineSaved, setBaselineSaved] = useState(false),
    [concentration, setConcentration] = useState(6),
    [progress, setProgress] = useState(62),
    [finished, setFinished] = useState(false),
    [dilution, setDilution] = useState(5),
    [accepted, setAccepted] = useState(false);
  const go = (n) => {
      n = Math.max(0, Math.min(5, n));
      setStep(n);
      const u = new URL(location.href);
      u.searchParams.set("screen", STEPS[n][0]);
      history.replaceState({}, "", u);
      scrollTo(0, 0);
    },
    reset = () => {
      setSelected(3);
      setValidated(false);
      setSeconds(582);
      setBaselineSaved(false);
      setConcentration(6);
      setProgress(62);
      setFinished(false);
      setDilution(5);
      setAccepted(false);
      go(0);
    };
  return (
    <div className={`pg-app screen-${STEPS[step][0]}`}>
      <Header {...{ step, go, reset }} />
      {step === 0 && <Home go={go} />}{" "}
      {step === 1 && (
        <Setup {...{ selected, setSelected, validated, setValidated }} />
      )}
      {step === 2 && (
        <Deaeration
          seconds={seconds}
          setSeconds={setSeconds}
          saved={baselineSaved}
          setSaved={setBaselineSaved}
        />
      )}{" "}
      {step === 3 && (
        <Scan
          {...{
            concentration,
            setConcentration,
            progress,
            setProgress,
            finished,
            setFinished,
          }}
        />
      )}
      {step === 4 && (
        <Calibration {...{ dilution, setDilution, accepted, setAccepted }} />
      )}
      {step === 5 && <Report reset={reset} />}
      <Footer {...{ step, go }} />
    </div>
  );
}
