import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Download, FlaskConical, HelpCircle, Pause, Play, RefreshCw, ShieldCheck, Trophy } from "lucide-react";
import { syllabusInteractiveById } from "./syllabusInteractiveModel.js";
import { benchKindFor, INTERACTIVE_STRUCTURES } from "./labStructures.js";
import LabBenchVisual from "./LabBenchVisual.jsx";
import LabMoleculeStage from "./LabMoleculeStage.jsx";
import { SciencePlot } from "../../components/science/SciencePlot.jsx";
import "./OrganicAromaticPrepLab.css";

const STEPS = [
  ["home", "Overview"],
  ["theory", "Theory"],
  ["setup", "Apparatus"],
  ["run", "Experiment"],
  ["analyse", "Results"],
  ["report", "Assessment"],
];

const initialStep = () => Math.max(0, STEPS.findIndex(([id]) => id === new URLSearchParams(location.search).get("screen")));

function Chart({ points }) {
  if (!points?.length) return null;
  return (
    <div className="dc-chart">
      <SciencePlot
        series={[{ label: "Live data", data: points, color: "#2d8cff", points: true }]}
        xLabel="Independent variable"
        yLabel="Response"
        height={230}
        legend={false}
      />
    </div>
  );
}

export default function SyllabusInteractiveLab({ experimentId }) {
  const spec = syllabusInteractiveById[experimentId] || Object.values(syllabusInteractiveById)[0];
  const defaults = Object.fromEntries((spec.controls || []).map((c) => [c.key, c.value]));
  const [step, setStep] = useState(initialStep);
  const [values, setValues] = useState(defaults);
  const [running, setRunning] = useState(false);
  const [validated, setValidated] = useState(false);
  const [picked, setPicked] = useState({});
  const result = useMemo(() => spec.compute(values), [spec, values]);
  const bench = benchKindFor(spec.id, spec.subject);
  const structure = INTERACTIVE_STRUCTURES[spec.id];
  const fill = running ? "#2f7de1" : "#8ec8ef";

  const go = (n) => {
    n = Math.max(0, Math.min(5, n));
    setStep(n);
    const u = new URL(location.href);
    u.searchParams.set("screen", STEPS[n][0]);
    history.replaceState({}, "", u);
    scrollTo(0, 0);
  };
  const reset = () => {
    setValues(defaults);
    setRunning(false);
    setValidated(false);
    setPicked({});
    go(0);
  };
  const score = (spec.quiz || []).filter((q, i) => picked[i] === 0).length;
  const csv = () => {
    const text = `experiment,metric,value\n${spec.id},primary,${result.primary}\n${spec.id},detail,${result.detail}`;
    const a = document.createElement("a");
    const u = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.href = u;
    a.download = `${spec.id}-results.csv`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="ap-app">
      <header className="ap-head">
        <button onClick={() => go(step - 1)} aria-label="Previous screen"><ArrowLeft /></button>
        <span>Virtual Labs　/　{spec.subject}　/　{spec.paper}</span>
        <b>{spec.title}　 {step + 1} of 6</b>
        <div>{STEPS.map((_, i) => <i className={i <= step ? "done" : ""} key={i} />)}</div>
        <button aria-label="Help"><HelpCircle /></button>
        <button onClick={reset}><RefreshCw /> Reset</button>
      </header>

      {step === 0 && (
        <main className="ap-home">
          <section className="ap-panel intro">
            <p className="kicker"><FlaskConical /> {spec.kicker} · {spec.kind === "sim" ? "Interactive simulation" : "Guided practical"}</p>
            <h2>{spec.title}</h2>
            <p className="lead">{spec.lead}</p>
            <div className="ap-eq">{spec.equation}</div>
            <p>{spec.hazard}</p>
            <button className="primary" onClick={() => go(1)}><FlaskConical /> Start <ChevronRight /></button>
          </section>
          <section className="ap-hero">
            {structure ? <LabMoleculeStage structureId={spec.id} label={structure.label} /> : <LabBenchVisual kind={bench} label={spec.kicker} fill="#8ec8ef" />}
            <div className="ap-danger" style={{ position: "absolute", right: 20, top: 24, maxWidth: 240 }}><ShieldCheck /> {spec.hazard}</div>
          </section>
        </main>
      )}

      {step === 1 && (
        <main className="ap-three">
          <section className="ap-panel"><h2>Theory</h2><p>{spec.theory}</p></section>
          <section className="ap-panel"><h2>What you will measure</h2><p>{spec.description}</p><p className="ap-notice">{spec.lead}</p></section>
          <section className="ap-panel"><h2>Safety</h2><p className="ap-danger">{spec.hazard}</p></section>
        </main>
      )}

      {step === 2 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Apparatus</h2>
            {(spec.apparatus || spec.steps).map((item) => <p className="ap-check" key={item}><Check /> {item}</p>)}
            <button className="primary" onClick={() => setValidated(true)}><Check /> Validate setup</button>
            <p className={validated ? "ap-valid" : "ap-notice"}>{validated ? "Setup validated." : "Check glassware, PPE and reagents."}</p>
          </section>
          <section className="ap-panel">
            <h2>Procedure</h2>
            {(spec.steps || []).map((item, i) => <p key={item}>{i + 1}. {item}</p>)}
          </section>
          <section className="ap-panel"><h2>Equation</h2><div className="ap-eq">{spec.equation}</div></section>
        </main>
      )}

      {step === 3 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Controls</h2>
            {(spec.controls || []).map((c) => (
              <label key={c.key}>
                {c.label}
                <input
                  aria-label={c.label}
                  type="range"
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  value={values[c.key]}
                  onChange={(e) => setValues((cur) => ({ ...cur, [c.key]: +e.target.value }))}
                />
                <b>{Number(values[c.key]).toFixed(c.step < 1 ? 3 : 1)} {c.unit}</b>
              </label>
            ))}
            <button className={running ? "primary" : ""} onClick={() => setRunning((x) => !x)}>{running ? <Pause /> : <Play />}{running ? "Pause" : "Run"}</button>
          </section>
          <section className="ap-panel">
            <h2>Live experiment</h2>
            {structure ? <LabMoleculeStage structureId={spec.id} label={structure.label} /> : <LabBenchVisual kind={bench} running={running} fill={fill} label={result.primary} />}
            <Chart points={result.chart} />
            <p className={running ? "ap-valid" : "ap-notice"}>{running ? result.observation : "Press Run to lock in the live observation."}</p>
          </section>
          <section className="ap-panel">
            <h2>Readout</h2>
            <div className="ap-metric"><span>Result</span><b className="good">{result.primary}</b></div>
            <p>{result.detail}</p>
          </section>
        </main>
      )}

      {step === 4 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Analysis</h2>
            <div className="ap-metric"><span>Primary result</span><b className="good">{result.primary}</b></div>
            <p>{result.detail}</p>
            <p className="ap-valid">{result.quality}</p>
          </section>
          <section className="ap-panel"><h2>Evidence plot</h2><Chart points={result.chart} /><button onClick={csv}><Download /> CSV</button></section>
          <section className="ap-panel"><h2>Observation</h2><p>{result.observation}</p></section>
        </main>
      )}

      {step === 5 && (
        <main className="ap-report">
          <section className="ap-panel">
            <h2>Completion</h2>
            {["Theory read", "Setup validated", "Experiment run", "Result recorded"].map((x) => <p className="ap-check" key={x}><Check /> {x}</p>)}
          </section>
          <section className="ap-panel">
            <h2>Notebook</h2>
            <p><b>{result.primary}</b></p>
            <p>{result.detail}</p>
            <button onClick={csv}><Download /> Download CSV</button>
          </section>
          <section className="ap-panel">
            <h2>Knowledge check</h2>
            {(spec.quiz || []).map((q, qi) => (
              <div key={q.prompt}>
                <p>{q.prompt}</p>
                {q.options.map((opt, oi) => (
                  <label key={opt}><input type="radio" checked={picked[qi] === oi} onChange={() => setPicked((a) => ({ ...a, [qi]: oi }))} />{opt}</label>
                ))}
              </div>
            ))}
            <div className={score === (spec.quiz || []).length ? "ap-valid" : "ap-notice"}><Trophy /> Score: {score}/{(spec.quiz || []).length}</div>
          </section>
        </main>
      )}

      <footer className="ap-foot">
        <button onClick={() => go(step - 1)} disabled={!step}><ArrowLeft /> Previous</button>
        <button className="primary" onClick={() => go(step + 1)}>{step === 5 ? "Complete" : "Continue"} <ChevronRight /></button>
      </footer>
    </div>
  );
}
