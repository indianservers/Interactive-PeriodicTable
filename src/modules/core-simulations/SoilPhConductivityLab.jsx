import { useMemo, useState } from "react";
import {
  Beaker,
  Check,
  CircleHelp,
  Clock,
  Download,
  FlaskConical,
  Gauge,
  Map,
  Play,
  RefreshCw,
  Save,
  Scale,
  ShieldCheck,
  Thermometer,
} from "lucide-react";
import {
  SAMPLES,
  cellConstant,
  extractionWater,
  fieldSummary,
  nernstSlope,
  sampleResult,
  salinityClass,
  phClass,
  tdsFromEc,
} from "./soilAnalysisModel.js";
import "./SoilPhConductivityLab.css";
const ids = [
  "home",
  "sampling-extraction",
  "sensor-calibration",
  "measurements",
  "field-interpretation",
  "report-assessment",
];
function Header({ step, go }) {
  return (
    <header className="soil-head">
      <button onClick={() => go(Math.max(0, step - 1))}>←</button>
      <span>Virtual Labs　/　Water &amp; Soil Analysis</span>
      <b>Soil pH &amp; Conductivity Laboratory　 {step + 1} of 6</b>
      <i>
        {ids.map((_, i) => (
          <em className={i <= step ? "on" : ""} key={i} />
        ))}
      </i>
      <CircleHelp />
      <button onClick={() => go(0)}>
        <RefreshCw /> Reset
      </button>
    </header>
  );
}
function Card({ title, children, className = "" }) {
  return (
    <section className={`soil-card ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Title({ children, sub }) {
  return (
    <div className="soil-title">
      <FlaskConical />
      <span>
        <small>Water &amp; Soil Analysis</small>
        <h1>{children}</h1>
        <p>{sub}</p>
      </span>
    </div>
  );
}
function Meter({ kind, value, unit = "" }) {
  return (
    <div className={`soil-meter ${kind}`}>
      <div className="soil-probe" />
      <div className="soil-beaker">
        <i />
      </div>
      <div className="soil-display">
        <small>{kind === "ph" ? "pH" : "Cond"}　25.1 °C</small>
        <b>{value}</b>
        <span>{unit}</span>
        <em>Stable ✓</em>
      </div>
    </div>
  );
}
function Trend({ kind = "ph", value = 6.43 }) {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const y =
      kind === "ph"
        ? value + (6.65 - value) * Math.exp(-i * 0.8)
        : value * (1 - Math.exp(-i * 0.8));
    return [
      35 + i * 45,
      140 - ((y - (kind === "ph" ? 5.5 : 0)) / (kind === "ph" ? 2 : 2)) * 110,
    ];
  });
  return (
    <svg
      className="soil-chart"
      viewBox="0 0 430 175"
      role="img"
      aria-label={`${kind} stabilization chart`}
    >
      <path d="M35 15V145H415" />
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M35 ${25 + i * 28}H415 M${35 + i * 90} 15V145`} />
        ))}
      </g>
      <polyline points={pts.map((x) => x.join(",")).join(" ")} />
      <text x="220" y="168">
        Time (s)
      </text>
    </svg>
  );
}
function FieldMap({ mode = "ph" }) {
  return (
    <div className={`soil-map ${mode}`}>
      <i />
      <b>S-A01</b>
      <b>S-A02</b>
      <b className="selected">
        S-A03
        <small>
          pH: 6.43
          <br />
          EC: 1.17 dS/m
        </small>
      </b>
      <b>S-A04</b>
      <b>S-A05</b>
    </div>
  );
}
function Home({ go }) {
  return (
    <main className="soil-page">
      <Title sub="Prepare a representative soil extract. Calibrate electrodes. Evaluate acidity and salinity.">
        Soil pH &amp; Conductivity Laboratory
      </Title>
      <div className="soil-home">
        <Card title="Learning Objectives">
          <ul>
            <li>Prepare a representative soil extract.</li>
            <li>Calibrate electrodes.</li>
            <li>Evaluate acidity and salinity.</li>
          </ul>
          <h2>Key Equations &amp; Interpretation</h2>
          <strong>pH = −log₁₀[aH⁺]</strong>
          <p>
            Lower pH = more acidic
            <br />
            Higher pH = more alkaline
          </p>
          <p>
            EC &lt; 0.2 non-saline
            <br />
            0.8–2.0 moderately saline
            <br />
            &gt; 2.0 highly saline
          </p>
          <button className="soil-primary" onClick={() => go(1)}>
            <FlaskConical />
            Start Experiment →
          </button>
        </Card>
        <div>
          <Card title="Soil Extract pH and EC (Example)">
            <Trend />
            <div className="soil-mini-lines">
              pH　6.4 → 7.1　　EC　0.22 → 2.74 dS/m
            </div>
          </Card>
          <Card title="Field Grid: Soil pH Map (Preview)">
            <FieldMap />
          </Card>
        </div>
        <div className="soil-hero">
          <div className="soil-labbench">
            <div className="soil-sieve">2 mm sieve</div>
            <div className="soil-bottles">pH 4.00　pH 7.00　pH 10.00</div>
            <Meter kind="ph" value="6.72" unit="pH" />
            <Meter kind="ec" value="0.48" unit="dS/m" />
          </div>
        </div>
      </div>
      <div className="soil-modes">
        {[
          ["Soil Sampling", "Collect and composite soil samples."],
          ["pH Measurement", "Calibrate and measure acidity."],
          ["Conductivity & TDS", "Assess soluble salts."],
          ["Soil Health Map", "Interpret spatial patterns."],
        ].map((x, i) => (
          <button key={x[0]} onClick={() => go(Math.min(4, i + 1))}>
            <b>{x[0]}</b>
            <span>{x[1]}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
function Sampling({ go }) {
  const [mass, setMass] = useState(20),
    [ratio, setRatio] = useState(2.5),
    [running, setRunning] = useState(false),
    water = extractionWater(mass, ratio);
  return (
    <main className="soil-page">
      <Title sub="Collect a composite soil sample, prepare and extract at a 1:2.5 (w/v) ratio for pH and EC analysis.">
        Prepare Representative Soil Extract
      </Title>
      <div className="soil-sampling">
        <Card title="1. Field Sampling (Composite Sample)">
          <FieldMap />
          <ul>
            <li>Collect 5 subsamples in a zigzag pattern.</li>
            <li>Sample depth: 0–15 cm.</li>
            <li>Remove stones, roots and debris.</li>
            <li>Sample ID: S-A03; sandy loam.</li>
          </ul>
        </Card>
        <Card title="2. Sample Preparation Workflow" className="soil-workflow">
          {[
            "Field sampling",
            "Composite sample",
            "Air-dry at room temperature",
            "Sieve 2 mm",
            "Weigh soil",
            "Add DI water",
            "Shake 180 rpm",
            "Settle / Filter",
          ].map((x, i) => (
            <div key={x}>
              <i>{i + 1}</i>
              <b>{x}</b>
              <span className={`prep p${i}`} />
            </div>
          ))}
        </Card>
        <div>
          <Card title="3. Extraction Parameters">
            <label>
              Soil mass
              <input
                aria-label="Soil mass"
                type="number"
                value={mass}
                onChange={(e) => setMass(+e.target.value)}
              />{" "}
              g
            </label>
            <label>
              Soil : Water ratio 1 :
              <input
                aria-label="Extraction ratio"
                type="number"
                step=".1"
                value={ratio}
                onChange={(e) => setRatio(+e.target.value)}
              />
            </label>
            <table>
              <tbody>
                <tr>
                  <th>DI water volume</th>
                  <td>{water.toFixed(1)} mL</td>
                </tr>
                <tr>
                  <th>Shake speed</th>
                  <td>180 rpm</td>
                </tr>
                <tr>
                  <th>Shake time</th>
                  <td>30 min</td>
                </tr>
                <tr>
                  <th>Temperature</th>
                  <td>25 °C</td>
                </tr>
              </tbody>
            </table>
          </Card>
          <Card title="Live Monitoring">
            <strong>{running ? "180 rpm" : "Ready to start"}</strong>
            <p>Turbidity 286 NTU</p>
          </Card>
          <Card title="Preparation Checklist">
            {[
              "Representative composite",
              "Air-dried sample",
              "2 mm sieve",
              "Calibrated balance",
              "Correct extraction ratio",
            ].map((x) => (
              <label key={x}>
                <input type="checkbox" defaultChecked={running} /> {x}
              </label>
            ))}
          </Card>
        </div>
      </div>
      <footer>
        <button onClick={() => setRunning(false)}>Reset Preparation</button>
        <button className="soil-primary" onClick={() => setRunning(true)}>
          <Play />
          Start Shaking
        </button>
        <button onClick={() => go(2)}>Continue →</button>
      </footer>
    </main>
  );
}
function Calibration({ go }) {
  const [saved, setSaved] = useState(false),
    slope = nernstSlope(25),
    k = cellConstant(1413, 1410);
  return (
    <main className="soil-page">
      <Title sub="Calibrate the pH electrode using three buffers and the EC cell using KCl conductivity standards.">
        Calibrate pH &amp; Conductivity Sensors
      </Title>
      <div className="soil-cal">
        <div>
          <button>▣ pH Electrode →</button>
          <button>▥ EC Cell →</button>
          <Card title="pH Three-Point Calibration">
            <ol>
              <li>Rinse electrode with DI water.</li>
              <li>Blot gently—do not wipe.</li>
              <li>Immerse in buffer.</li>
              <li>Wait for a stable reading.</li>
              <li>Accept reading.</li>
            </ol>
            <strong>Current buffer: pH 10.00　25 °C</strong>
          </Card>
        </div>
        <Card title="pH Electrode Calibration (Current buffer: pH 10.00)">
          <Meter kind="ph" value="10.002" unit="pH" />
          <div className="soil-standards">
            pH 4.00　pH 7.00　pH 10.00　DI Water Rinse
          </div>
        </Card>
        <Card title="Conductivity Cell Calibration">
          <Meter kind="ec" value="1415" unit="μS/cm" />
          <div className="soil-standards">
            84 μS/cm　1413 μS/cm　12.88 mS/cm
          </div>
        </Card>
        <div>
          <Card title="Calibration Results">
            <h3>
              pH Electrode　
              <span className="pass">
                <Check />
                Calibration Passed
              </span>
            </h3>
            <table>
              <tbody>
                <tr>
                  <th>Slope</th>
                  <td>98.7% ({(slope * 0.987).toFixed(1)} mV/pH)</td>
                </tr>
                <tr>
                  <th>Offset</th>
                  <td>+1.2 mV</td>
                </tr>
                <tr>
                  <th>R²</th>
                  <td>0.9998</td>
                </tr>
              </tbody>
            </table>
            <h3>
              EC Cell　
              <span className="pass">
                <Check />
                Calibration Passed
              </span>
            </h3>
            <table>
              <tbody>
                <tr>
                  <th>Cell constant</th>
                  <td>{k.toFixed(3)} cm⁻¹</td>
                </tr>
                <tr>
                  <th>Error</th>
                  <td>+0.14%</td>
                </tr>
              </tbody>
            </table>
          </Card>
          <Card title="Calibration Checklist">
            {[
              "No cross-contamination",
              "Electrode blotted",
              "No air bubbles",
              "Correct standards",
              "Solutions at 25 °C",
            ].map((x) => (
              <label key={x}>
                <input type="checkbox" defaultChecked /> {x}
              </label>
            ))}
          </Card>
        </div>
      </div>
      <footer>
        <button>Recalibrate</button>
        <button className="soil-primary" onClick={() => setSaved(true)}>
          <Save />
          Save Calibration
        </button>
        <button disabled={!saved} onClick={() => go(3)}>
          Continue →
        </button>
      </footer>
    </main>
  );
}
function Measurements({ go }) {
  const [rep, setRep] = useState(0),
    [recorded, setRecorded] = useState(false),
    ph = [6.42, 6.45, 6.43],
    ec = [1.18, 1.16, 1.17],
    r = sampleResult(ph, ec);
  return (
    <main className="soil-page">
      <Title sub="Measure soil pH in a 1:2.5 suspension and EC (and TDS) in the clarified extract.">
        Measure Soil pH, EC &amp; TDS
      </Title>
      <div className="soil-measure">
        <Card title="Select Sample">
          {SAMPLES.map((x) => (
            <label key={x.id}>
              <input type="radio" checked={x.id === "S-A03"} readOnly /> {x.id}
            </label>
          ))}
          <h2>Measurement Sequence</h2>
          <ol>
            <li>Rinse electrodes</li>
            <li>Blot gently</li>
            <li>Measure pH</li>
            <li>Wait for stability</li>
            <li>Record pH</li>
            <li>Measure EC</li>
          </ol>
        </Card>
        <div>
          <div className="soil-tabs">
            {ph.map((_, i) => (
              <button
                className={rep === i ? "active" : ""}
                onClick={() => setRep(i)}
                key={i}
              >
                Replicate {i + 1}
              </button>
            ))}
          </div>
          <div className="soil-meters">
            <Card title="pH Measurement (Unfiltered 1:2.5 Suspension)">
              <Meter kind="ph" value={ph[rep].toFixed(2)} unit="pH" />
              <Trend value={ph[rep]} />
            </Card>
            <Card title="EC Measurement (Clarified Extract)">
              <Meter kind="ec" value={ec[rep].toFixed(2)} unit="dS/m" />
              <Trend kind="ec" value={ec[rep]} />
            </Card>
          </div>
        </div>
        <div>
          <Card title="Results for Sample S-A03">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>R1</th>
                  <th>R2</th>
                  <th>R3</th>
                  <th>Mean</th>
                  <th>SD</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>pH</th>
                  {ph.map((x) => (
                    <td key={x}>{x}</td>
                  ))}
                  <td>{r.ph.mean.toFixed(2)}</td>
                  <td>{r.ph.sd.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>EC</th>
                  {ec.map((x) => (
                    <td key={x}>{x}</td>
                  ))}
                  <td>{r.ec.mean.toFixed(2)}</td>
                  <td>{r.ec.sd.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <p>
              TDS: <b>{r.tds.toFixed(0)} mg/L</b>
            </p>
          </Card>
          <Card title="Interpretation">
            <h3>
              Soil pH　{r.ph.mean.toFixed(2)}　<span>{r.phClass}</span>
            </h3>
            <h3>
              Salinity　{r.ec.mean.toFixed(2)} dS/m　
              <span>{r.salinityClass}</span>
            </h3>
          </Card>
          <Card title="Quality Indicators">
            <p>pH stability: Stable ✓</p>
            <p>Replicate precision: {r.ec.rsd.toFixed(1)}% ✓</p>
          </Card>
        </div>
      </div>
      <footer>
        <button onClick={() => setRecorded(false)}>Repeat</button>
        <button className="soil-primary" onClick={() => setRecorded(true)}>
          <Save />
          Record
        </button>
        <button onClick={() => setRep((rep + 1) % 3)}>Next replicate</button>
        <button disabled={!recorded} onClick={() => go(4)}>
          Continue →
        </button>
      </footer>
    </main>
  );
}
function Interpretation({ go }) {
  const [selected, setSelected] = useState("S-A03"),
    s = SAMPLES.find((x) => x.id === selected),
    f = fieldSummary();
  return (
    <main className="soil-page">
      <Title sub="Visualize spatial patterns of soil pH, EC and TDS and identify areas needing further investigation.">
        Interpret Soil Health &amp; Field Variability
      </Title>
      <div className="soil-field">
        <div>
          <Card title="Field Samples (5)">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>pH</th>
                  <th>EC</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLES.map((x) => (
                  <tr
                    className={x.id === selected ? "selected" : ""}
                    onClick={() => setSelected(x.id)}
                    key={x.id}
                  >
                    <td>{x.id}</td>
                    <td>{x.ph.toFixed(2)}</td>
                    <td>{x.ec.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card title="Map Layers">
            <button>pH</button>
            <button>EC (Salinity)</button>
            <button>TDS</button>
            <div className="soil-gradient" />
          </Card>
        </div>
        <div>
          <div className="soil-map-tabs">
            <b>pH Map (Active)</b>
            <b>EC (Salinity) Map</b>
          </div>
          <div className="soil-maps">
            <FieldMap />
            <FieldMap mode="ec" />
          </div>
          <div className="soil-field-bottom">
            <Card title="Soil pH vs. EC">
              <Trend kind="ec" value={1.17} />
            </Card>
            <Card title="Sample Summary (n=5)">
              <table>
                <tbody>
                  <tr>
                    <th>pH</th>
                    <td>
                      {f.ph.mean.toFixed(2)} ± {f.ph.sd.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <th>EC</th>
                    <td>
                      {f.ec.mean.toFixed(2)} ± {f.ec.sd.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <th>TDS</th>
                    <td>{f.tds.mean.toFixed(0)} mg/L</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </div>
        <div>
          <Card title="Interpretation Zones (from pH & EC Maps)">
            {[
              ["Area 1 – Suitable", "No action needed"],
              [
                "Area 2 – Slightly Acidic / Moderately Saline",
                "Verify & Investigate",
              ],
              ["Area 3 – Alkaline / Saline", "Priority Resampling"],
            ].map((x, i) => (
              <article className={`zone z${i}`} key={x[0]}>
                <b>{x[0]}</b>
                <span>{x[1]}</span>
                <p>
                  {i === 0
                    ? "Conditions within suitable ranges."
                    : i === 1
                      ? "Check drainage and confirm the laboratory method."
                      : "Conduct targeted resampling and investigate causes."}
                </p>
              </article>
            ))}
          </Card>
          <Card title="Selected Sample">
            <p>
              {s.id}: {phClass(s.ph)}, {salinityClass(s.ec)}
            </p>
            <p>
              pH {s.ph.toFixed(2)} · EC {s.ec.toFixed(2)} dS/m · TDS{" "}
              {tdsFromEc(s.ec).toFixed(0)} mg/L
            </p>
          </Card>
          <Card title="Data Quality & Map Reliability">
            <p>Spatial coverage ✓ Adequate</p>
            <p>Interpolation confidence ⚠ Moderate</p>
            <p>Replicate precision ✓ Good</p>
          </Card>
        </div>
      </div>
      <footer>
        <button>Export Map</button>
        <button>Add to Notebook</button>
        <button className="soil-primary" onClick={() => go(5)}>
          Continue →
        </button>
      </footer>
    </main>
  );
}
function Report({ go }) {
  const [answers, setAnswers] = useState({}),
    qs = [
      ["Benefit of composite sampling?", "Reduces local spatial bias"],
      ["Why blot rather than wipe?", "Avoid contamination and static damage"],
      ["What does EC indicate?", "Total soluble-ion conductivity"],
    ],
    score = qs.filter((x, i) => answers[i] === x[1]).length;
  return (
    <main className="soil-page">
      <Title sub="Review results, evaluate data quality, and draw evidence-based conclusions.">
        Soil Analysis Report &amp; Assessment
      </Title>
      <div className="soil-report">
        <div>
          <Card title="Lab Completion　100%">
            <progress value="100" max="100" />
            {[
              "Representative sampling",
              "Extract prepared",
              "Sensors calibrated",
              "pH and EC measured",
              "Map interpreted",
            ].map((x) => (
              <p key={x}>
                <Check /> {x}
              </p>
            ))}
          </Card>
          <Card title="Apparatus Used">
            <div className="soil-tools">
              pH meter　EC meter　Sample bottle　Extraction flask　Pipette
            </div>
            <h2>Total Time　31:12　　Safety 100%</h2>
          </Card>
        </div>
        <div>
          <Card title="Digital Lab Notebook">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>pH</th>
                  <th>EC</th>
                  <th>TDS</th>
                  <th>Texture</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLES.map((x) => (
                  <tr key={x.id}>
                    <td>{x.id}</td>
                    <td>{x.ph.toFixed(2)}</td>
                    <td>{x.ec.toFixed(2)}</td>
                    <td>{tdsFromEc(x.ec).toFixed(0)}</td>
                    <td>{x.texture}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className="soil-report-maps">
            <Card title="pH Map (Interpolated)">
              <FieldMap />
            </Card>
            <Card title="EC Map (Interpolated)">
              <FieldMap mode="ec" />
            </Card>
          </div>
          <div className="soil-report-maps">
            <Card title="pH Stabilization">
              <Trend />
            </Card>
            <Card title="EC Stabilization">
              <Trend kind="ec" value={1.17} />
            </Card>
          </div>
        </div>
        <div>
          <Card title={`Knowledge Check　${score} / 3`}>
            {qs.map((q, i) => (
              <fieldset key={q[0]}>
                <legend>
                  {i + 1}. {q[0]}
                </legend>
                <button
                  className={answers[i] === q[1] ? "active" : ""}
                  onClick={() => setAnswers({ ...answers, [i]: q[1] })}
                >
                  {q[1]}
                </button>
                <button
                  onClick={() => setAnswers({ ...answers, [i]: "wrong" })}
                >
                  Other
                </button>
              </fieldset>
            ))}
          </Card>
          <Card title="Safety & Good Practice">
            <p>
              <Check /> Electrodes rinsed and stored correctly.
            </p>
            <p>
              <Check /> All samples labelled with ID and location.
            </p>
          </Card>
          <Card title="Validated Conclusion">
            <p>
              Soil pH, EC and estimated TDS show clear spatial variability. Use
              targeted resampling in specific zones.
            </p>
            <b>These results do not provide a fertilizer prescription.</b>
          </Card>
        </div>
      </div>
      <footer>
        <button>
          <Download />
          Download CSV
        </button>
        <button>Export PDF</button>
        <button className="soil-primary" onClick={() => go(0)}>
          Complete Lab →
        </button>
      </footer>
    </main>
  );
}
export default function SoilPhConductivityLab() {
  const initial = new URLSearchParams(location.search).get("screen") || "home",
    [screen, setScreen] = useState(ids.includes(initial) ? initial : "home"),
    step = ids.indexOf(screen),
    go = (i) => {
      const s = ids[i];
      setScreen(s);
      const u = new URL(location.href);
      u.searchParams.set("screen", s);
      history.replaceState(null, "", u);
      scrollTo(0, 0);
    };
  return (
    <div className="soil-app">
      <Header step={step} go={go} />
      {step === 0 ? (
        <Home go={go} />
      ) : step === 1 ? (
        <Sampling go={go} />
      ) : step === 2 ? (
        <Calibration go={go} />
      ) : step === 3 ? (
        <Measurements go={go} />
      ) : step === 4 ? (
        <Interpretation go={go} />
      ) : (
        <Report go={go} />
      )}
    </div>
  );
}
