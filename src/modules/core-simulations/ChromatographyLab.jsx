import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
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
  SlidersHorizontal,
  Trophy,
} from "lucide-react";
import {
  COMPONENTS,
  bedVolume,
  chromatogram,
  fractionAt,
  rfValues,
  separationSummary,
} from "./chromatographyModel.js";
import "./ChromatographyLab.css";
import {
  ChromatographyHomeBenchmark,
  ChromatographyTlcBenchmark,
} from "./ChromatographyBenchmarkScreens.jsx";
import ChromatographyMotionBench from "./ChromatographyMotionBench.jsx";
export default function ChromatographyWithPreparation() {
  const [preparing, setPreparing] = useState(false);
  const [preparation,setPreparation]=useState(null);
  return (
    <>
      <ChromatographyLab preparation={preparation} clearPreparation={()=>setPreparation(null)} />
      <button className="chm-launch" onClick={() => setPreparing(true)}>
        Prepare sample · live apparatus
      </button>
      {preparing && (
        <ChromatographyMotionBench initialState={preparation} onClose={(result) => {setPreparation(result);setPreparing(false);}} />
      )}
    </>
  );
}
const STEPS = [
  ["home", "Overview"],
  ["tlc", "TLC development"],
  ["column", "Pack column"],
  ["elution", "Elution"],
  ["analysis", "Fraction analysis"],
  ["report", "Report"],
];
const stepFromUrl = () =>
  Math.max(
    0,
    STEPS.findIndex(
      ([id]) => id === new URLSearchParams(location.search).get("screen"),
    ),
  );
function Header({ step, go, reset }) {
  return (
    <header className="ch-head">
      <button onClick={() => go(step - 1)} aria-label="Previous screen">
        <ArrowLeft />
      </button>
      <span>
        Virtual Labs　/　<b>Organic Chemistry</b>
        {step > 0 && <>　/　Chromatography Separation Laboratory</>}
      </span>
      <strong>
        {step === 0 ? "Chromatography Separation Laboratory" : STEPS[step][1]}
      </strong>
      <small>{step + 1} of 6</small>
      <div>
        {STEPS.map((_, i) => (
          <i className={i <= step ? "done" : ""} key={i} />
        ))}
      </div>
      <button>
        <HelpCircle /> Help
      </button>
      <button onClick={reset}>
        <RefreshCw /> Reset
      </button>
    </header>
  );
}
function Footer({ step, go }) {
  return (
    <footer className="ch-foot">
      <button onClick={() => go(step - 1)} disabled={!step}>
        <ArrowLeft /> Previous
      </button>
      <button className="primary" onClick={() => go(step + 1)}>
        {step === 5 ? "Complete Lab" : "Continue"} <ChevronRight />
      </button>
    </footer>
  );
}
function Panel({ title, children, className = "" }) {
  return (
    <section className={`ch-panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Column({ progress = 0, bands = true }) {
  return (
    <div className="ch-column">
      <div className="reservoir">Eluent</div>
      <div className="bed">
        {bands &&
          COMPONENTS.map((c, i) => (
            <i
              key={c.id}
              style={{
                background: c.color,
                top: `${28 + i * 12 + progress * (i + 1) * 0.38}%`,
              }}
            />
          ))}
      </div>
      <div className="stopcock">◆</div>
      <i className="drop" />
    </div>
  );
}
function Tubes({ volume = 90, selected = 18 }) {
  const n = fractionAt(volume);
  return (
    <div className="ch-tubes">
      {Array.from({ length: 24 }, (_, i) => {
        const k = i + 1,
          c =
            k >= 6 && k <= 8
              ? COMPONENTS[0].color
              : k >= 16 && k <= 19
                ? COMPONENTS[1].color
                : k >= 22 && k <= 24
                  ? COMPONENTS[2].color
                  : "#dbe7ef";
        return (
          <i
            className={k === selected ? "selected" : ""}
            key={k}
            style={{ "--fill": k <= n ? c : "#edf2f7" }}
          >
            <span>{k}</span>
          </i>
        );
      })}
    </div>
  );
}
function ChromPlot({ volume = 140 }) {
  const w = 720,
    h = 330,
    p = 50,
    points = Array.from({ length: 121 }, (_, i) => ({
      x: i / 10,
      y: chromatogram(i / 10),
    })),
    poly = points
      .map(
        (q) =>
          `${p + (q.x / 12) * (w - p * 2)},${h - p - (q.y / 210) * (h - p * 2)}`,
      )
      .join(" ");
  return (
    <svg
      className="ch-plot"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label="UV chromatogram"
    >
      <line x1={p} x2={w - p} y1={h - p} y2={h - p} />
      <polyline points={poly} />
      {COMPONENTS.map((c) => (
        <g key={c.id}>
          <line
            className="guide"
            x1={p + (c.retention / 12) * (w - p * 2)}
            x2={p + (c.retention / 12) * (w - p * 2)}
            y1={p}
            y2={h - p}
          />
          <text
            x={p + (c.retention / 12) * (w - p * 2) - 5}
            y={p + 20}
            fill={c.color}
          >
            {c.id}
          </text>
        </g>
      ))}
      <line
        className="current"
        x1={p + (Math.min(12, volume / 12) / 12) * (w - p * 2)}
        x2={p + (Math.min(12, volume / 12) / 12) * (w - p * 2)}
        y1={p}
        y2={h - p}
      />
      <text x="12" y="25">
        mAU
      </text>
      <text x="285" y="322">
        Retention time (min)
      </text>
    </svg>
  );
}
function TLC({ rf }) {
  return (
    <div className="ch-tlc">
      <div className="front" />
      <div className="origin" />
      {rf.map((c) => (
        <i
          key={c.id}
          style={{
            background: c.color,
            bottom: `${8 + c.rf * 78}%`,
            left: `${25 + COMPONENTS.indexOf(c) * 25}%`,
          }}
        >
          <span>{c.id}</span>
        </i>
      ))}
    </div>
  );
}
function Home({ go }) {
  return (
    <main className="ch-home">
      <Panel title="Chromatography Separation Laboratory" className="intro">
        <p className="kicker">
          <FlaskConical /> Organic Chemistry
        </p>
        <p className="lead">
          Pack a column. Separate a mixture. Analyze purity and recovery.
        </p>
        <div className="formula">k′ = (tᵣ − tₘ) / tₘ</div>
        <p>
          A larger retention factor indicates stronger interaction with the
          stationary phase.
        </p>
        <button className="primary" onClick={() => go(1)}>
          <FlaskConical /> Start Experiment <ChevronRight />
        </button>
      </Panel>
      <section className="ch-hero">
        <Column progress={0.2} />
        <Tubes volume={45} />
        <ChromPlot />
      </section>
      <div className="ch-cards">
        {[
          "Column Chromatography",
          "TLC Method Development",
          "Gradient Elution",
          "Fraction Analysis",
        ].map((x, i) => (
          <button key={x} onClick={() => go(Math.min(4, i + 1))}>
            <FlaskConical />
            <b>{x}</b>
            <small>
              {
                [
                  "Pack silica and load a narrow sample band.",
                  "Optimize Rf and resolution.",
                  "Separate a range of polarities.",
                  "Determine purity and recovery.",
                ][i]
              }
            </small>
            <ChevronRight />
          </button>
        ))}
      </div>
    </main>
  );
}
function TLCScreen({ ethyl, setEthyl, saved, setSaved }) {
  const rf = rfValues(ethyl),
    ratio = `${100 - ethyl}:${ethyl}`;
  return (
    <main className="ch-three">
      <Panel title="Develop Method with TLC">
        <p>Select a hexane/ethyl acetate ratio and optimize separation.</p>
        <h3>1. Select Solvent System</h3>
        {[10, 20, 30, 40].map((x) => (
          <label className={ethyl === x ? "active" : ""} key={x}>
            <input
              type="radio"
              name="solvent"
              checked={ethyl === x}
              onChange={() => setEthyl(x)}
            />
            {100 - x}:{x}
          </label>
        ))}
        <h3>2. Development Parameters</h3>
        <label>
          Front distance <input type="number" value="8.0" readOnly /> cm
        </label>
        <label>
          Spotting volume <input type="number" value="2" readOnly /> μL
        </label>
      </Panel>
      <Panel title="TLC Development" className="ch-visual">
        <div className="ch-chamber">
          <TLC rf={rf} />
        </div>
        <div className="uv">
          <TLC rf={rf} />
        </div>
        <p className="valid">
          <Check /> Origin above solvent; front marked immediately.
        </p>
      </Panel>
      <Panel title="Calculate Rf Values">
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th>Distance</th>
              <th>Rf</th>
            </tr>
          </thead>
          <tbody>
            {rf.map((c) => (
              <tr key={c.id}>
                <td style={{ color: c.color }}>{c.id}</td>
                <td>{c.distance.toFixed(1)} cm</td>
                <td>{c.rf.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className={ethyl === 30 ? "valid" : "notice"}>
          {ethyl === 30 ? (
            <>
              <Check /> 70:30 selected — balanced separation
            </>
          ) : (
            `${ratio} changes elution strength; compare spot spacing.`
          )}
        </p>
        <button onClick={() => setSaved(true)}>
          <Save /> {saved ? "Method saved" : "Save Method"}
        </button>
      </Panel>
    </main>
  );
}
function ColumnScreen({
  diameter,
  setDiameter,
  height,
  setHeight,
  packed,
  setPacked,
}) {
  const bv = bedVolume(diameter, height);
  return (
    <main className="ch-three">
      <Panel title="Pack Column & Load Sample">
        <p>
          Wet-pack silica, remove bubbles, level the bed, add sand, equilibrate
          and load a narrow band.
        </p>
        {[
          "Wet-pack silica slurry",
          "Remove bubbles",
          "Level bed",
          "Add sand layer",
          "Equilibrate column",
          "Load sample",
        ].map((x, i) => (
          <div className="instruction" key={x}>
            <b>{i + 1}</b>
            {x}
          </div>
        ))}
        <h3>Column Parameters</h3>
        <label>
          Inner diameter
          <input
            type="number"
            min="10"
            max="40"
            value={diameter}
            onChange={(e) => setDiameter(+e.target.value)}
          />{" "}
          mm
        </label>
        <label>
          Bed height
          <input
            type="number"
            min="80"
            max="260"
            value={height}
            onChange={(e) => setHeight(+e.target.value)}
          />{" "}
          mm
        </label>
        <p>
          Calculated bed volume: <b>{bv.toFixed(1)} mL</b>
        </p>
      </Panel>
      <Panel title="Column Packing" className="ch-column-stage">
        <Column progress={0} />
        <div className="sample-pipette">100 mg / 1.0 mL</div>
      </Panel>
      <Panel title="Validate Column">
        {[
          ["Bed uniformity", "97%"],
          ["Bubbles", "None"],
          ["Solvent above bed", "10 mm"],
          ["Back pressure", "0.18 bar"],
          ["Flow rate", "2.0 mL/min"],
        ].map(([a, b]) => (
          <div className="metric" key={a}>
            <span>{a}</span>
            <b>{b}</b>
            <Check />
          </div>
        ))}
        <p className={packed ? "valid" : "notice"}>
          {packed ? (
            <>
              <Check /> Column ready
            </>
          ) : (
            <>Auto-pack and validate before elution.</>
          )}
        </p>
        <button className="primary" onClick={() => setPacked(true)}>
          <SlidersHorizontal /> Auto-pack Column
        </button>
      </Panel>
    </main>
  );
}
function Elution({ volume, setVolume, running, setRunning }) {
  const current = fractionAt(volume),
    done = volume >= 120;
  return (
    <main className="ch-three ch-elution">
      <Panel title="Elute & Collect Fractions">
        <h3>Gradient Program</h3>
        <table>
          <tbody>
            <tr>
              <td>0–2 CV</td>
              <td>70:30</td>
            </tr>
            <tr>
              <td>2–4 CV</td>
              <td>60:40</td>
            </tr>
            <tr>
              <td>4–6 CV</td>
              <td>50:50</td>
            </tr>
          </tbody>
        </table>
        <label>
          Volume{" "}
          <input
            type="range"
            min="0"
            max="120"
            value={volume}
            onChange={(e) => setVolume(+e.target.value)}
          />
          <b>{volume} mL</b>
        </label>
        <button onClick={() => setRunning((x) => !x)}>
          {running ? <Pause /> : <Play />}
          {running ? "Pause Flow" : "Start Flow"}
        </button>
        <button onClick={() => setVolume((v) => Math.min(120, v + 10))}>
          Advance 10 mL
        </button>
      </Panel>
      <Panel title="Live Separation" className="ch-visual">
        <div className="elution-apparatus">
          <Column progress={volume / 120} />
          <Tubes volume={volume} selected={current} />
        </div>
        <ChromPlot volume={volume} />
      </Panel>
      <Panel title="Live Run Metrics">
        {[
          ["Back pressure", "0.21 bar"],
          ["Flow rate", "2.00 mL/min"],
          [
            "Current solvent",
            volume < 40 ? "70:30" : volume < 80 ? "60:40" : "50:50",
          ],
          ["Volume collected", `${volume} mL`],
          ["Current fraction", `${current} / 24`],
        ].map(([a, b]) => (
          <div className="metric" key={a}>
            <span>{a}</span>
            <b>{b}</b>
          </div>
        ))}
        <h3>Fraction Rack</h3>
        <Tubes volume={volume} selected={current} />
        <p className={done ? "valid" : "notice"}>
          {done ? (
            <>
              <Check /> Elution complete
            </>
          ) : (
            <>Advance through the gradient to collect all pools.</>
          )}
        </p>
      </Panel>
    </main>
  );
}
function Analysis({ pool, setPool, accepted, setAccepted }) {
  const summary = separationSummary(),
    c = COMPONENTS.find((x) => x.id === pool);
  return (
    <main className="ch-three">
      <Panel title="Analyze Fractions, Purity & Recovery">
        <table>
          <tbody>
            {COMPONENTS.map((x) => (
              <tr
                className={pool === x.id ? "active" : ""}
                key={x.id}
                onClick={() => setPool(x.id)}
              >
                <td style={{ color: x.color }}>{x.id}</td>
                <td>{x.fractions.join("–")}</td>
                <td>{x.mass.toFixed(1)} mg</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button>Pool Selected Fractions</button>
        <button>Concentrate</button>
        <button>Tare Collection Vial</button>
      </Panel>
      <Panel title="Fraction Rack & Final Chromatogram" className="ch-visual">
        <Tubes volume={120} selected={c.fractions[0]} />
        <div className="pool-labels">
          {COMPONENTS.map((x) => (
            <button
              key={x.id}
              onClick={() => setPool(x.id)}
              style={{ borderColor: x.color }}
            >
              {x.id}: fractions {x.fractions.join("–")}
            </button>
          ))}
        </div>
        <ChromPlot />
      </Panel>
      <Panel title={`Analysis: Compound ${pool}`}>
        {[
          [
            "Pooled volume",
            `${(c.fractions[1] - c.fractions[0] + 1) * 5}.0 mL`,
          ],
          ["Dry mass", `${c.mass.toFixed(1)} mg`],
          ["Purity", `${c.purity.toFixed(1)} %`],
          ["Recovery", `${c.recovery.toFixed(1)} %`],
          ["Rf", c.baseRf.toFixed(2)],
          ["Retention time", `${c.retention.toFixed(1)} min`],
        ].map(([a, b]) => (
          <div className="metric" key={a}>
            <span>{a}</span>
            <b>{b}</b>
          </div>
        ))}
        <h3>Mass Balance</h3>
        <p>
          Total recovered: {summary.recovered.toFixed(1)} mg (
          {summary.recoveryPercent.toFixed(1)}%)
        </p>
        <p className={accepted ? "valid" : "notice"}>
          {accepted ? (
            <>
              <Check /> Separation accepted
            </>
          ) : (
            <>Review purity and recovery, then accept.</>
          )}
        </p>
        <button className="primary" onClick={() => setAccepted(true)}>
          <Check /> Accept Pools
        </button>
      </Panel>
    </main>
  );
}
function Report({ reset }) {
  const [answers, setAnswers] = useState({}),
    score = [
      answers.q1 === "increase",
      answers.q2 === "improve",
      answers.q3 === "pure",
    ].filter(Boolean).length,
    s = separationSummary();
  const csv = () => {
    const data = [
        "compound,retention,purity,recovery",
        ...COMPONENTS.map(
          (c) => `${c.id},${c.retention},${c.purity},${c.recovery}`,
        ),
      ].join("\n"),
      a = document.createElement("a"),
      u = URL.createObjectURL(new Blob([data], { type: "text/csv" }));
    a.href = u;
    a.download = "chromatography-results.csv";
    a.click();
    URL.revokeObjectURL(u);
  };
  return (
    <main className="ch-report">
      <Panel title="Chromatography Lab Report">
        <div className="completion">100%</div>
        {[
          "TLC method optimized",
          "Column packed",
          "Sample eluted",
          "Pools analyzed",
          "Recovery calculated",
        ].map((x) => (
          <p key={x}>
            <Check /> {x}
          </p>
        ))}
        <Column progress={1} />
      </Panel>
      <Panel title="Digital Lab Notebook" className="wide">
        <div className="tabs">
          <button>Results</button>
          <button>Chromatogram</button>
          <button>Fractions</button>
          <button>TLC Plate</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Compound</th>
              <th>tR</th>
              <th>Purity</th>
              <th>Recovery</th>
            </tr>
          </thead>
          <tbody>
            {COMPONENTS.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.retention}</td>
                <td>{c.purity}%</td>
                <td>{c.recovery}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ChromPlot />
        <p>
          Resolution A/B: {s.resolutionAB.toFixed(1)}　Resolution B/C:{" "}
          {s.resolutionBC.toFixed(1)}　Total recovery:{" "}
          {s.recoveryPercent.toFixed(1)}%
        </p>
        <p className="valid">
          <Check /> The gradient separated A, B and C with high purity and
          recovery.
        </p>
        <button onClick={csv}>
          <Download /> Download CSV
        </button>
        <button onClick={() => print()}>
          <Download /> Export PDF
        </button>
      </Panel>
      <Panel title="Knowledge Check">
        <p>More polar solvent on silica:</p>
        <label>
          <input
            type="radio"
            checked={answers.q1 === "increase"}
            onChange={() => setAnswers((a) => ({ ...a, q1: "increase" }))}
          />{" "}
          Increases elution strength
        </label>
        <p>A narrow loading band:</p>
        <label>
          <input
            type="radio"
            checked={answers.q2 === "improve"}
            onChange={() => setAnswers((a) => ({ ...a, q2: "improve" }))}
          />{" "}
          Improves resolution
        </label>
        <p>Pool fractions when:</p>
        <label>
          <input
            type="radio"
            checked={answers.q3 === "pure"}
            onChange={() => setAnswers((a) => ({ ...a, q3: "pure" }))}
          />{" "}
          Same pure component and acceptable boundaries
        </label>
        <div className={score === 3 ? "valid" : "notice"}>
          <Trophy /> Score: {score}/3
        </div>
        <h3>Safety</h3>
        <p>
          <ShieldCheck /> Flammable solvents contained
        </p>
        <p>
          <ShieldCheck /> Column depressurized
        </p>
        <button onClick={reset}>
          <RefreshCw /> Restart
        </button>
      </Panel>
    </main>
  );
}
function ChromatographyLab({preparation,clearPreparation}) {
  const [step, setStep] = useState(stepFromUrl),
    [ethyl, setEthyl] = useState(30),
    [saved, setSaved] = useState(false),
    [diameter, setDiameter] = useState(20),
    [height, setHeight] = useState(180),
    [packed, setPacked] = useState(false),
    [volume, setVolume] = useState(90),
    [running, setRunning] = useState(false),
    [pool, setPool] = useState("B"),
    [accepted, setAccepted] = useState(false);
  useEffect(()=>{if(preparation){setEthyl(preparation.ethyl);setSaved(preparation.phase==='inspected');}},[preparation]);
  const go = (n) => {
    n = Math.max(0, Math.min(5, n));
    setStep(n);
    const u = new URL(location.href);
    u.searchParams.set("screen", STEPS[n][0]);
    history.replaceState({}, "", u);
    scrollTo(0, 0);
  };
  const reset = () => {
    clearPreparation();
    setEthyl(30);
    setSaved(false);
    setDiameter(20);
    setHeight(180);
    setPacked(false);
    setVolume(0);
    setRunning(false);
    setPool("B");
    setAccepted(false);
    go(0);
  };
  return (
    <div className="ch-app">
      <Header step={step} go={go} reset={reset} />
      {step === 0 && <ChromatographyHomeBenchmark go={go} />}{" "}
      {step === 1 && (
        <ChromatographyTlcBenchmark
          {...{ ethyl, setEthyl, saved, setSaved, go, preparation }}
        />
      )}{" "}
      {step === 2 && (
        <ColumnScreen
          {...{ diameter, setDiameter, height, setHeight, packed, setPacked }}
        />
      )}{" "}
      {step === 3 && (
        <Elution {...{ volume, setVolume, running, setRunning }} />
      )}{" "}
      {step === 4 && <Analysis {...{ pool, setPool, accepted, setAccepted }} />}{" "}
      {step === 5 && <Report reset={reset} />}{" "}
      {step > 1 && <Footer step={step} go={go} />}
    </div>
  );
}
