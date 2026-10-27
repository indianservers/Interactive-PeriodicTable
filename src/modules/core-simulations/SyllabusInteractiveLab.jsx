import LabScreenNavigation from '../../utils/LabScreenNavigation.jsx';
import {labScreenIndex,useLabRouteSync,pushLabScreen} from '../../utils/labRouteState.js';
import KnowledgeCheck from "../../components/common/KnowledgeCheck.jsx";
import { completeLab } from "../../utils/labNavigation.js";
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

const initialStep = () => labScreenIndex(location, STEPS.map(([id]) => id));

function Chart({ points, xLabel = "Independent variable", yLabel = "Response", label = "Model reference" }) {
  if (!points?.length) return null;
  return (
    <div className="dc-chart">
      <SciencePlot
        series={[{ label, data: points, color: "#2d8cff", points: true }]}
        xLabel={xLabel}
        yLabel={yLabel}
        height={230}
        theme="lab"
        legend={false}
      />
    </div>
  );
}

export default function SyllabusInteractiveLab({ experimentId, onNavigate }) {
  const spec = syllabusInteractiveById[experimentId] || Object.values(syllabusInteractiveById)[0];
  const defaults = Object.fromEntries((spec.controls || []).map((c) => [c.key, c.value]));
  const [step, setStep] = useState(initialStep);
  const [values, setValues] = useState(defaults);
  const [running, setRunning] = useState(false);
  const [validated, setValidated] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [action, setAction] = useState(-1);
  const [recorded, setRecorded] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const questions = useMemo(() => (spec.quiz || []).map(q => ({...q, correct: 0, options: q.options.map((label,id) => ({id,label}))})), [spec]);
  const result = useMemo(() => spec.compute(values), [spec, values]);
  const bench = benchKindFor(spec.id, spec.subject);
  const structure = INTERACTIVE_STRUCTURES[spec.id];
  const fill = running ? "#2f7de1" : "#8ec8ef";

  const go = (n) => {
    if (n > 5) { completeLab(); return; }
    n = Math.max(0, Math.min(5, n));
    setRunning(false);
    setStep(n);
    const u = new URL(location.href);
    u.searchParams.set("screen", STEPS[n][0]);
    pushLabScreen(u);
    scrollTo(0, 0);
  };
  const reset = () => {
    setValues(defaults);
    setRunning(false);
    setValidated(false);setHasRun(false);setRecorded(false);setAction(-1);

    go(0);
  };

  const csv = () => {
    const rows=[['experiment','metric','value'],...Object.entries(values).map(([key,value])=>[spec.id,`input.${key}`,value]),[spec.id,'primary',result.primary],[spec.id,'detail',result.detail],[spec.id,'observation',result.observation],[spec.id,'model_basis',result.quality]];
    const text = rows.map(row=>row.map(cell=>`"${String(cell??'').replaceAll('"','""')}"`).join(',')).join('\r\n');
    const a = document.createElement("a");
    const u = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.href = u;
    a.download = `${spec.id}-results.csv`;
    a.click();
    setTimeout(()=>URL.revokeObjectURL(u),1000);
  };

  useLabRouteSync(STEPS.map(item=>item[0]),next => {setRunning(false);setStep(next);},true);
  return (
    <div className="ap-app"><LabScreenNavigation ids={STEPS.map(item=>item[0])} active={step}/>
      <header className="ap-head">
        <button onClick={() => go(step - 1)} aria-label="Previous screen"><ArrowLeft /></button>
        <span>Virtual Labs　/　{spec.subject}　/　{spec.paper}</span>
        <b>{spec.title}　 {step + 1} of 6</b>
        <div>{STEPS.map((_, i) => <i className={i <= step ? "done" : ""} key={i} />)}</div>
        <button aria-label="Help" aria-expanded={helpOpen} aria-controls="practical-help" onClick={() => setHelpOpen(open => !open)}><HelpCircle /></button>
        <button onClick={reset}><RefreshCw /> Reset</button>
      </header>

      {helpOpen && <section id="practical-help" className="ap-panel" aria-label="Practical help"><h2>{spec.title}: help</h2><p>Use the six stage tabs to read the theory, inspect apparatus, operate the experiment controls, and review results. Changing stages pauses the apparatus animation. Browser Back and Forward restore the selected stage.</p><p>{spec.description}</p><p>{spec.hazard}</p><button onClick={() => setHelpOpen(false)}>Close help</button></section>}

      <nav className="ap-stages" aria-label="Experiment stages">{STEPS.map(([id,label],i) => <button key={id} aria-current={step===i?"step":undefined} onClick={() => go(i)}>{i+1}. {label}</button>)}</nav>
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
            {structure ? <LabMoleculeStage structureId={spec.id} label={structure.label} /> : <LabBenchVisual apparatus={spec.apparatus} kind={bench} label={spec.kicker} fill="#8ec8ef" />}
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
            <h2>Controls</h2><div className="lab-action-controls">{spec.steps.map((item,i)=><button key={item} aria-pressed={action===i} onClick={()=>{setAction(i);setRunning(true);setHasRun(true)}}>{i+1}. {item}</button>)}</div>
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
            <button className={running ? "primary" : ""} onClick={() => {setRunning((x) => !x);setHasRun(true);}}>{running ? <Pause /> : <Play />}{running ? "Pause" : "Run"}</button>
          </section>
          <section className="ap-panel">
            <h2>Live experiment</h2><ol className="lab-procedure">{spec.steps.map((item,i)=><li key={item}>{i+1}. {item}</li>)}</ol>
            {structure ? <LabMoleculeStage structureId={spec.id} label={structure.label} /> : <LabBenchVisual apparatus={spec.apparatus} kind={bench} running={running} fill={fill} label={action >= 0 ? spec.steps[action] : result.primary} />}
            {action>=0&&<p className="ap-valid" role="status">Current operation: {spec.steps[action]}</p>}
            <Chart points={result.chart} xLabel={result.xLabel} yLabel={result.yLabel} label={result.chartLabel} />
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
            <h2>Analysis</h2><button onClick={()=>setRecorded(true)}>{recorded?"Result recorded":"Record result"}</button>
            <div className="ap-metric"><span>Primary result</span><b className="good">{result.primary}</b></div>
            <p>{result.detail}</p>
            <p className="ap-valid">{result.quality}</p>
            {!result.chart?.length&&<button onClick={csv}><Download /> Export qualitative summary CSV</button>}
          </section>
          {!!result.chart?.length&&<section className="ap-panel"><h2>Model plot</h2><Chart points={result.chart} xLabel={result.xLabel} yLabel={result.yLabel} label={result.chartLabel} /><button onClick={csv}><Download /> CSV</button></section>}
          <section className="ap-panel"><h2>Observation</h2><p>{result.observation}</p></section>
        </main>
      )}

      {step === 5 && (
        <main className="ap-report">
          <section className="ap-panel">
            <h2>Completion</h2>
            {[["Setup validated",validated],["Experiment run",hasRun],["Result recorded",recorded]].map(([label,done]) => <p className="ap-check" key={label}>{done?<Check/>:"○"} {label}: {done?"Done":"Pending"}</p>)}
          </section>
          <section className="ap-panel">
            <h2>Notebook</h2>
            <p><b>{result.primary}</b></p>
            <p>{result.detail}</p>
            <button onClick={csv}><Download /> Download CSV</button>
          </section>
          <section className="ap-panel">
            <h2>Knowledge check</h2>
            <KnowledgeCheck key={spec.id} questions={questions} />
          </section>
        </main>
      )}

      <footer className="ap-foot">
        <button onClick={() => go(step - 1)} disabled={!step}><ArrowLeft /> Previous</button>
        <button className="primary" onClick={() => step === 5 ? completeLab(onNavigate) : go(step + 1)}>{step === 5 ? "Complete" : "Continue"} <ChevronRight /></button>
      </footer>
    </div>
  );
}
