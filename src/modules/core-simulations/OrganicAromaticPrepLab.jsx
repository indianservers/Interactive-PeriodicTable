import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Download, FlaskConical, HelpCircle, Pause, Play, RefreshCw, ShieldCheck, Trophy } from "lucide-react";
import { aromaticPrepExperiments, aromaticPrepYield } from "./aromaticPrepModel.js";
import "./OrganicAromaticPrepLab.css";

const STEPS = [
  ["home", "Overview"],
  ["theory", "Substrate & mechanism"],
  ["setup", "Apparatus & reagents"],
  ["run", "Run the preparation"],
  ["workup", "Isolation & purity"],
  ["report", "Lab report"],
];

const initialStep = () => Math.max(0, STEPS.findIndex(([id]) => id === new URLSearchParams(location.search).get("screen")));

function Header({ title, step, go, reset }) {
  return (
    <header className="ap-head">
      <button onClick={() => go(step - 1)} aria-label="Previous screen"><ArrowLeft /></button>
      <span>Virtual Labs　/　Organic Chemistry</span>
      <b>{title}　 {step + 1} of 6</b>
      <div>{STEPS.map((_, i) => <i className={i <= step ? "done" : ""} key={i} />)}</div>
      <button aria-label="Help"><HelpCircle /></button>
      <button onClick={reset}><RefreshCw /> Reset</button>
    </header>
  );
}

function Footer({ step, go }) {
  return (
    <footer className="ap-foot">
      <button onClick={() => go(step - 1)} disabled={!step}><ArrowLeft /> Previous</button>
      <button className="primary" onClick={() => go(step + 1)}>{step === 5 ? "Complete Lab" : "Continue"} <ChevronRight /></button>
    </footer>
  );
}

function Bench({ running, fill, label, ice }) {
  return (
    <div className="ap-bench" role="img" aria-label="Preparation bench">
      <div className="ap-stand" />
      <div className="ap-flask" style={{ "--fill": fill }}>
        {running && <i className="ap-ppt" />}
        <span>{label}</span>
      </div>
      {running && <div className="ap-dropper"><i /></div>}
      {ice && <div className="ap-ice" />}
    </div>
  );
}

export default function OrganicAromaticPrepLab({ experiment = "bromination" }) {
  const spec = aromaticPrepExperiments[experiment];
  const substrateIds = Object.keys(spec.substrates);
  const [step, setStep] = useState(initialStep);
  const [substrate, setSubstrate] = useState(substrateIds[0]);
  const [equivalents, setEquivalents] = useState(experiment === "bromination" ? 3 : 1.1);
  const [temperature, setTemperature] = useState(experiment === "benzoylation" ? 10 : 25);
  const [minutes, setMinutes] = useState(12);
  const [alkali, setAlkali] = useState(8);
  const [validated, setValidated] = useState(false);
  const [running, setRunning] = useState(false);
  const [ice, setIce] = useState(false);
  const [answers, setAnswers] = useState({});
  const sub = spec.substrates[substrate];
  const run = useMemo(
    () => aromaticPrepYield({ experiment, substrate, equivalents, temperature, minutes, alkali }),
    [experiment, substrate, equivalents, temperature, minutes, alkali],
  );

  const go = (n) => {
    n = Math.max(0, Math.min(5, n));
    setStep(n);
    const u = new URL(location.href);
    u.searchParams.set("screen", STEPS[n][0]);
    history.replaceState({}, "", u);
    scrollTo(0, 0);
  };
  const reset = () => {
    setSubstrate(substrateIds[0]);
    setEquivalents(experiment === "bromination" ? 3 : 1.1);
    setTemperature(experiment === "benzoylation" ? 10 : 25);
    setMinutes(12);
    setAlkali(8);
    setValidated(false);
    setRunning(false);
    setIce(false);
    setAnswers({});
    go(0);
  };
  const score = Object.entries(spec.quiz).filter(([key, q]) => answers[key] === q.correct).length;
  const csv = () => {
    const text = `experiment,substrate,product,conversion_percent,recovered_g,yield_percent\n${spec.id},${sub.label},${sub.product},${run.conversion.toFixed(1)},${run.recovered.toFixed(3)},${run.yieldPct.toFixed(1)}`;
    const a = document.createElement("a");
    const u = URL.createObjectURL(new Blob([text], { type: "text/csv" }));
    a.href = u;
    a.download = `${spec.id}-results.csv`;
    a.click();
    URL.revokeObjectURL(u);
  };

  return (
    <div className="ap-app">
      <Header title={spec.title} step={step} go={go} reset={reset} />
      {step === 0 && (
        <main className="ap-home">
          <section className="ap-panel intro">
            <p className="kicker"><FlaskConical /> Organic Chemistry · B.Sc II · BSCH-302</p>
            <h2>{spec.title}</h2>
            <p className="lead">{spec.lead}</p>
            <div className="ap-eq">{spec.equation}</div>
            <p>{spec.hazard}</p>
            <button className="primary" onClick={() => go(1)}><FlaskConical /> Start Experiment <ChevronRight /></button>
          </section>
          <section className="ap-hero">
            <Bench running fill="#c45c12" label="Reagent ready" />
            <div className="ap-danger" style={{ position: "absolute", right: 20, top: 24, maxWidth: 220 }}><ShieldCheck /> {spec.hazard}</div>
          </section>
          <div className="ap-cards">
            {["Choose substrate", "Assemble bench", "Run reaction", "Isolate & check MP"].map((x, i) => (
              <button key={x} onClick={() => go(i + 1)}><FlaskConical /><b>{x}</b><small>{STEPS[i + 1][1]}</small><ChevronRight /></button>
            ))}
          </div>
        </main>
      )}
      {step === 1 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Select substrate</h2>
            {substrateIds.map((id) => (
              <label className={substrate === id ? "active" : ""} key={id}>
                <input type="radio" checked={substrate === id} onChange={() => setSubstrate(id)} />
                {spec.substrates[id].label}
              </label>
            ))}
            <h3>Expected product</h3>
            <div className="ap-metric"><span>Product</span><b>{sub.product}</b></div>
            <div className="ap-metric"><span>Formula</span><b>{sub.formula}</b></div>
            <div className="ap-metric"><span>Molar mass</span><b>{sub.molarMass} g mol⁻¹</b></div>
            <div className="ap-metric"><span>Literature MP</span><b>{sub.mp}</b></div>
          </section>
          <section className="ap-panel">
            <h2>Why this substrate reacts this way</h2>
            <p>{sub.directing}</p>
            {experiment === "bromination" ? (
              <>
                <h3>Electrophile</h3>
                <p>Br₂ is polarised at the electron-rich ring. Phenol and aniline do not need a Lewis-acid catalyst. Acetanilide is brominated in acetic acid to keep substitution under control.</p>
                <p className="ap-notice">Compare phenol vs aniline vs protected aniline to see activation versus selectivity.</p>
              </>
            ) : (
              <>
                <h3>Schotten–Baumann conditions</h3>
                <p>Benzoyl chloride acylates the nucleophilic N or O atom. Aqueous NaOH keeps the nucleophile available and removes HCl so the equilibrium is driven toward the benzoyl derivative.</p>
                <p className="ap-notice">Aniline gives an amide (benzanilide). Phenol gives an ester (phenyl benzoate).</p>
              </>
            )}
          </section>
          <section className="ap-panel">
            <h2>Appearance</h2>
            <p>{sub.appearance}</p>
            <div className="ap-danger"><ShieldCheck /> {spec.hazard}</div>
          </section>
        </main>
      )}
      {step === 2 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Charge sheet</h2>
            <div className="ap-metric"><span>{sub.limitingName} charge</span><b>2.00 g</b></div>
            {experiment === "bromination" ? (
              <div className="ap-metric"><span>Bromine water / Br₂</span><b>{equivalents.toFixed(1)} eq</b></div>
            ) : (
              <>
                <div className="ap-metric"><span>Benzoyl chloride</span><b>{equivalents.toFixed(1)} eq</b></div>
                <div className="ap-metric"><span>10% NaOH</span><b>{alkali} mL</b></div>
              </>
            )}
            <h3>Checks</h3>
            {["Fume hood on", "Eye protection and gloves", "Conical flask in ice if required", "Never stopper a gas-evolving mixture"].map((x) => <p className="ap-check" key={x}><Check /> {x}</p>)}
            <button className="primary" onClick={() => setValidated(true)}><Check /> Validate setup</button>
            <p className={validated ? "ap-valid" : "ap-notice"}>{validated ? "Apparatus ready." : "Validate PPE and ventilation before adding reagent."}</p>
          </section>
          <section className="ap-panel" style={{ padding: 0 }}>
            <Bench fill="#9ec9e8" label={`${sub.label} charged`} ice={experiment === "benzoylation"} />
          </section>
          <section className="ap-panel">
            <h2>Stoichiometry reminder</h2>
            <p>{experiment === "bromination" && substrate !== "acetanilide" ? "Three ring positions require about 3 eq Br₂." : experiment === "bromination" ? "Protected aniline needs about 1 eq Br₂ for the para product." : "Slight excess benzoyl chloride with alkali favours complete acylation."}</p>
          </section>
        </main>
      )}
      {step === 3 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Run conditions</h2>
            <label>Reagent equivalents <input aria-label="Reagent equivalents" type="range" min="0.5" max="5" step="0.1" value={equivalents} onChange={(e) => setEquivalents(+e.target.value)} /><b>{equivalents.toFixed(1)} eq</b></label>
            <label>Temperature <input aria-label="Temperature" type="range" min="0" max="80" value={temperature} onChange={(e) => setTemperature(+e.target.value)} /><b>{temperature} °C</b></label>
            <label>Reaction time <input aria-label="Reaction time" type="range" min="0" max="40" value={minutes} onChange={(e) => setMinutes(+e.target.value)} /><b>{minutes} min</b></label>
            {experiment === "benzoylation" && <label>Alkali volume <input aria-label="Alkali volume" type="range" min="0" max="20" value={alkali} onChange={(e) => setAlkali(+e.target.value)} /><b>{alkali} mL</b></label>}
            <button className={running ? "primary" : ""} onClick={() => setRunning((x) => !x)}>{running ? <Pause /> : <Play />}{running ? "Pause addition" : "Start addition"}</button>
          </section>
          <section className="ap-panel" style={{ padding: 0 }}>
            <Bench running={running} fill={running ? "#f4f7fb" : "#c45c12"} label={running ? run.colour : "Awaiting reagent"} ice={temperature <= 15} />
          </section>
          <section className="ap-panel">
            <h2>Live observations</h2>
            <div className="ap-metric"><span>Conversion model</span><b className="good">{run.conversion.toFixed(0)}%</b></div>
            <div className="ap-metric"><span>Appearance</span><b>{run.colour}</b></div>
            <p className={running ? "ap-valid" : "ap-notice"}>{running ? run.observation : "Start addition to consume the electrophile / acylating agent."}</p>
          </section>
        </main>
      )}
      {step === 4 && (
        <main className="ap-three">
          <section className="ap-panel">
            <h2>Work-up</h2>
            {(experiment === "bromination"
              ? ["Filter the precipitate", "Wash with cold water / bisulfite if Br₂ remains", "Recrystallise (ethanol or dilute ethanol)", "Dry and weigh"]
              : ["Filter the solid", "Wash with cold water to remove alkali and chloride", "Recrystallise from ethanol", "Dry to constant mass"]
            ).map((x, i) => <p className="ap-check" key={x}><Check /> {i + 1}. {x}</p>)}
            <button onClick={() => setIce(true)}><Check /> {ice ? "Ice quench applied" : "Cool on ice"}</button>
          </section>
          <section className="ap-panel">
            <h2>Isolation result</h2>
            <div className="ap-metric"><span>Theoretical mass</span><b>{run.theoretical.toFixed(2)} g</b></div>
            <div className="ap-metric"><span>Recovered (dry)</span><b>{run.recovered.toFixed(2)} g</b></div>
            <div className="ap-metric"><span>Yield</span><b className="good">{run.yieldPct.toFixed(1)}%</b></div>
            <div className="ap-metric"><span>Melting range</span><b>±{run.mpSpread.toFixed(1)} °C vs {sub.mp}</b></div>
            <p className={run.yieldPct > 70 ? "ap-valid" : "ap-notice"}>{run.yieldPct > 70 ? "Yield and melting range support a successful isolation." : "Low conversion: check equivalents, temperature, alkali and mixing."}</p>
          </section>
          <section className="ap-panel">
            <h2>Identity check</h2>
            <p>{sub.appearance}</p>
            <p>Compare the observed melting range with {sub.mp}. A broad range suggests incomplete washing or mixed isomers.</p>
          </section>
        </main>
      )}
      {step === 5 && (
        <main className="ap-report">
          <section className="ap-panel">
            <h2>Completion</h2>
            {["Substrate selected", "Setup validated", "Reaction run", "Product isolated"].map((x) => <p className="ap-check" key={x}><Check /> {x}</p>)}
            <div className="ap-metric"><span>Yield</span><b className="good">{run.yieldPct.toFixed(1)}%</b></div>
          </section>
          <section className="ap-panel">
            <h2>Digital notebook</h2>
            <div className="ap-metric"><span>Substrate</span><b>{sub.label}</b></div>
            <div className="ap-metric"><span>Product</span><b>{sub.product} ({sub.formula})</b></div>
            <div className="ap-metric"><span>Recovered</span><b>{run.recovered.toFixed(3)} g</b></div>
            <p>{run.observation}</p>
            <button onClick={csv}><Download /> Download CSV</button>
          </section>
          <section className="ap-panel">
            <h2>Knowledge check</h2>
            {Object.entries(spec.quiz).map(([key, q]) => (
              <div key={key}>
                <p>{q.prompt}</p>
                {q.options.map((opt) => (
                  <label key={opt.id}><input type="radio" checked={answers[key] === opt.id} onChange={() => setAnswers((a) => ({ ...a, [key]: opt.id }))} />{opt.label}</label>
                ))}
              </div>
            ))}
            <div className={score === 3 ? "ap-valid" : "ap-notice"}><Trophy /> Score: {score}/3</div>
          </section>
        </main>
      )}
      <Footer step={step} go={go} />
    </div>
  );
}
