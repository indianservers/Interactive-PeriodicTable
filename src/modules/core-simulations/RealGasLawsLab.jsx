import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  BookOpen,
  Check,
  FlaskConical,
  Gauge,
  Home,
  Play,
  RefreshCw,
  Settings,
  Thermometer,
  Trophy,
} from "lucide-react";
import {
  CO2,
  idealPressure,
  jouleThomson,
  pengRobinsonPressure,
  reducedState,
  stateAt,
  vanDerWaalsPressure,
} from "./realGasModel.js";
import "./RealGasLawsLab.css";

const ids = [
    "overview",
    "pvt-explorer",
    "compressibility",
    "critical-behavior",
    "joule-thomson",
    "report-assessment",
  ],
  names = [
    "Overview",
    "PVT Explorer",
    "Compressibility",
    "Critical Point",
    "Joule–Thomson",
    "Summary",
  ];
function Nav({ step, go }) {
  return (
    <>
      <header className="rg-head">
        <div>
          <FlaskConical />
          <b>Physical Chemistry Studio</b>
          <small>Explore · Simulate · Understand</small>
        </div>
        <nav>
          {names.map((n, i) => (
            <button
              className={i === step ? "active" : ""}
              onClick={() => go(i)}
              key={n}
            >
              {i + 1}. {n}
            </button>
          ))}
        </nav>
        <Settings />
      </header>
      <aside className="rg-side">
        <h2>
          <Gauge />
          Real Gas Laws
        </h2>
        {names.map((n, i) => (
          <button
            className={i === step ? "active" : ""}
            onClick={() => go(i)}
            key={n}
          >
            <i>{i + 1}</i>
            {n}
          </button>
        ))}
      </aside>
    </>
  );
}
function Card({ title, children, className = "" }) {
  return (
    <section className={`rg-card ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
function Molecules({ dense = false }) {
  return (
    <div className={`rg-molecules ${dense ? "dense" : ""}`}>
      {Array.from({ length: dense ? 30 : 12 }, (_, i) => (
        <i
          key={i}
          style={{ "--x": `${(i * 37) % 88}%`, "--y": `${(i * 61) % 82}%` }}
        >
          <b />
          <span />
          <b />
        </i>
      ))}
    </div>
  );
}
function Plot({ kind = "pv", T = 300 }) {
  const pts = Array.from({ length: 45 }, (_, i) => 0.08 + i * 0.11);
  let series;
  if (kind === "z")
    series = [280, 300, 320, 400].map((temp, j) => ({
      c: ["#0754bb", "#08a0b8", "#4b9c50", "#47a2ff"][j],
      d: Array.from({ length: 41 }, (_, i) => {
        const p = i / 2,
          z =
            1 -
            (0.44 - (temp - 280) / 500) * Math.exp(-(((p - 6) / 5) ** 2)) +
            0.02 * p;
        return [p, z];
      }),
    }));
  else
    series = [
      { c: "#111", dash: true, d: pts.map((v) => [v, idealPressure(T, v)]) },
      { c: "#0564c9", d: pts.map((v) => [v, vanDerWaalsPressure(T, v)]) },
      { c: "#0aa6a5", d: pts.map((v) => [v, pengRobinsonPressure(T, v)]) },
    ];
  const xd = kind === "z" ? [0, 20] : [0, 5],
    yd = kind === "z" ? [0.4, 1.6] : [0, 10],
    path = (d) =>
      d
        .map(
          ([x, y], i) =>
            `${i ? "L" : "M"} ${48 + ((x - xd[0]) / (xd[1] - xd[0])) * 445} ${300 - ((Math.max(yd[0], Math.min(yd[1], y)) - yd[0]) / (yd[1] - yd[0])) * 255}`,
        )
        .join(" ");
  return (
    <svg
      className="rg-plot"
      viewBox="0 0 520 330"
      role="img"
      aria-label={
        kind === "z"
          ? "Compressibility factor against pressure"
          : "Pressure volume isotherm"
      }
    >
      <path d="M48 25V300H500" />
      <g className="grid">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M48 ${45 + i * 50}H500 M${48 + i * 90} 25V300`} />
        ))}
      </g>
      {series.map((s, i) => (
        <path
          key={i}
          className="curve"
          stroke={s.c}
          strokeDasharray={s.dash ? "7 5" : undefined}
          d={path(s.d)}
        />
      ))}
      <text x="245" y="325">
        {kind === "z" ? "Pressure, P (MPa)" : "Molar volume, Vₘ (L mol⁻¹)"}
      </text>
      <text x="8" y="170" transform="rotate(-90 8 170)">
        {kind === "z" ? "Compressibility factor, Z" : "Pressure, P (MPa)"}
      </text>
    </svg>
  );
}
function Overview({ go }) {
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Real Gas Laws<small>Screen 1 of 6 · Overview</small>
        </h1>
        <span>Advanced Level　◷ 30–40 min</span>
      </div>
      <div className="rg-hero">
        <Card title="Learning Objectives">
          <ol>
            <li>Measure and analyse P, V, T for CO₂.</li>
            <li>Calculate compressibility factor Z.</li>
            <li>Compare equations of state.</li>
            <li>Explore critical behaviour.</li>
          </ol>
          <h2>Simulation Modes</h2>
          {names.slice(1, 5).map((n, i) => (
            <button key={n} onClick={() => go(i + 1)}>
              {n}
            </button>
          ))}
        </Card>
        <div className="rg-cylinder">
          <div className="rg-gauge">
            5.21<small>MPa</small>
          </div>
          <Molecules dense />
          <b>CO₂</b>
          <span>304 K　250 mL</span>
        </div>
        <div>
          <Card title="Molecular View: Collisions">
            <Molecules />
            <p>
              Intermolecular forces make collisions non-ideal, reducing
              effective pressure.
            </p>
          </Card>
          <Card title="Isotherms: Ideal vs Real (CO₂)">
            <Plot />
          </Card>
        </div>
        <div>
          <Card title="Selected Substance: CO₂">
            <div className="rg-co2">
              <i />
              <b />
              <i />
            </div>
            <h3>Carbon Dioxide (CO₂)</h3>
            <table>
              <tbody>
                <tr>
                  <th>Tc</th>
                  <td>304.13 K</td>
                </tr>
                <tr>
                  <th>Pc</th>
                  <td>7.377 MPa</td>
                </tr>
                <tr>
                  <th>ω</th>
                  <td>0.224</td>
                </tr>
              </tbody>
            </table>
          </Card>
          <Card title="Equations of State">
            <b>Ideal Gas Law</b>
            <strong>PV = nRT</strong>
            <b>Peng–Robinson</b>
            <strong>P = RT/(V−b) − aα/[V(V+b)+b(V−b)]</strong>
          </Card>
          <button className="rg-primary" onClick={() => go(1)}>
            <Play />
            Start CO₂ Experiment →
          </button>
        </div>
      </div>
    </div>
  );
}
function Pvt({ go }) {
  const [T, setT] = useState(300),
    [V, setV] = useState(0.5),
    s = stateAt(T, V);
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Real Gas Laws<small>Screen 2 of 6 · PVT Explorer</small>
        </h1>
      </div>
      <div className="rg-pvt">
        <Card title="System Controls">
          <label>
            Gas
            <select>
              <option>CO₂ (carbon dioxide)</option>
            </select>
          </label>
          <label>
            Temperature, T (K)
            <input
              aria-label="Temperature"
              type="number"
              value={T}
              onChange={(e) => setT(+e.target.value)}
            />
          </label>
          <label>
            Volume, V (L/mol)
            <input
              aria-label="Molar volume"
              type="number"
              step=".1"
              value={V}
              onChange={(e) => setV(Math.max(0.08, +e.target.value))}
            />
          </label>
          <h2>Model Overlays</h2>
          {["Ideal Gas", "van der Waals", "Peng–Robinson", "Measured"].map(
            (x) => (
              <label key={x}>
                <input type="checkbox" defaultChecked /> {x}
              </label>
            ),
          )}
        </Card>
        <div className="rg-cylinder instrument">
          <Molecules dense />
          <b>CO₂</b>
          <span>
            n = 1.000 mol
            <br />T = {T.toFixed(1)} K<br />V = {V.toFixed(3)} L
          </span>
          <div className="rg-readout">
            Ideal {s.ideal.toFixed(3)}
            <br />
            van der Waals {s.vdw.toFixed(3)}
            <br />
            Peng–Robinson {s.pr.toFixed(3)}
          </div>
        </div>
        <div>
          <Card title={`P–V Isotherm (T = ${T.toFixed(1)} K, n = 1.000 mol)`}>
            <Plot T={T} />
          </Card>
          <Card title={`Data at ${T.toFixed(1)} K`}>
            <table>
              <thead>
                <tr>
                  <th>V</th>
                  <th>Pideal</th>
                  <th>PvdW</th>
                  <th>PPR</th>
                  <th>Z</th>
                </tr>
              </thead>
              <tbody>
                {[0.1, 0.2, 0.5, 1, 2, 5].map((v) => {
                  const q = stateAt(T, v);
                  return (
                    <tr className={v === V ? "selected" : ""} key={v}>
                      <td>{v.toFixed(3)}</td>
                      <td>{q.ideal.toFixed(3)}</td>
                      <td>{q.vdw.toFixed(3)}</td>
                      <td>{q.pr.toFixed(3)}</td>
                      <td>{q.Z.toFixed(3)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </div>
        <div>
          <Card title="Molecular View: Why Real Gases Deviate?">
            <Molecules />
            <p>
              Attractions reduce momentum transfer to the walls, producing Z
              &lt; 1.
            </p>
          </Card>
          <Card title="Compressibility Factor">
            <strong className="rg-big">Z = {s.Z.toFixed(3)}</strong>
            <p>Z = PV / nRT</p>
          </Card>
          <Card title="Equations and Parameters (CO₂)">
            <p>Ideal: PV=nRT</p>
            <p>
              van der Waals: a=
              {(
                (27 * 0.008314462618 ** 2 * CO2.Tc ** 2) /
                (64 * CO2.Pc)
              ).toFixed(4)}
              , b={((0.008314462618 * CO2.Tc) / (8 * CO2.Pc)).toFixed(5)}
            </p>
          </Card>
          <button className="rg-primary" onClick={() => go(2)}>
            Continue to Z Analysis →
          </button>
        </div>
      </div>
    </div>
  );
}
function Compress({ go }) {
  const [P, setP] = useState(5),
    z = 0.79,
    vm = (z * 0.008314462618 * 300) / P;
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Real Gas Laws
          <small>Screen 3 of 6 · Compressibility Factor Analysis</small>
        </h1>
      </div>
      <div className="rg-analysis">
        <Card title="System Controls">
          <label>
            Equation of State
            <select>
              <option>Peng–Robinson (PR)</option>
            </select>
          </label>
          <label>
            Temperature (K)
            <input value="300" readOnly />
          </label>
          <label>
            Pressure (MPa)
            <input
              aria-label="Pressure"
              type="number"
              value={P}
              onChange={(e) => setP(+e.target.value)}
            />
          </label>
          <button className="rg-primary">Sweep Pressure</button>
          <button onClick={() => go(3)}>Critical Behavior</button>
        </Card>
        <Card title="Compressibility Factor Z vs. Pressure">
          <Plot kind="z" />
          <Card title="Data at Selected Point">
            <table>
              <tbody>
                <tr>
                  <th>Temperature</th>
                  <td>300.0 K</td>
                </tr>
                <tr>
                  <th>Pressure</th>
                  <td>{P.toFixed(2)} MPa</td>
                </tr>
                <tr>
                  <th>Z</th>
                  <td>{z.toFixed(2)}</td>
                </tr>
                <tr>
                  <th>Molar volume</th>
                  <td>{vm.toFixed(3)} L/mol</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </Card>
        <div>
          <Card title="Why Z < 1? Attractive Interactions">
            <Molecules />
            <p>
              At moderate pressure, attractions make the gas easier to compress.
            </p>
          </Card>
          <Card title="Why Z > 1? Repulsive Interactions">
            <Molecules dense />
            <p>
              At high pressure, excluded volume and short-range repulsions
              dominate.
            </p>
          </Card>
          <Card title="Virial Expansion and Boyle Temperature">
            <strong className="rg-big">Z = 1 + B(T)/Vₘ + C(T)/Vₘ² + …</strong>
            <p>For CO₂, Tᴮ ≈ 304 K.</p>
          </Card>
          <Card title="Key Takeaways">
            <p>
              CO₂ has a minimum in Z near 7 MPa at 300 K. Attractions dominate
              first; repulsions dominate at high pressure.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
function Critical({ go }) {
  const [T, setT] = useState(304.13),
    [P, setP] = useState(7.377),
    r = reducedState(T, P, 0.094);
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Critical Behavior of CO₂
          <small>
            Screen 4 of 6 · Near the critical point, phases become
            indistinguishable.
          </small>
        </h1>
      </div>
      <div className="rg-critical">
        <Card title="Controls">
          <label>
            Temperature, T (K)
            <input
              aria-label="Critical temperature"
              value={T}
              onChange={(e) => setT(+e.target.value)}
            />
          </label>
          <label>
            Pressure, P (MPa)
            <input value={P} onChange={(e) => setP(+e.target.value)} />
          </label>
          <button
            className="rg-primary"
            onClick={() => {
              setT(CO2.Tc);
              setP(CO2.Pc);
            }}
          >
            Approach Critical
          </button>
          <button onClick={() => go(4)}>Joule–Thomson Exp.</button>
        </Card>
        <div>
          <Card
            title="View Cell: CO₂ Near the Critical Point"
            className="rg-cells"
          >
            {[
              [300, "Below critical"],
              [304.13, "At the critical point"],
              [310, "Supercritical"],
            ].map(([t, l], i) => (
              <section key={t}>
                <b>T = {t} K</b>
                <div className={`rg-window w${i}`}>
                  <Molecules dense />
                </div>
                <strong>{l}</strong>
              </section>
            ))}
          </Card>
          <div className="rg-critical-data">
            <Card title="State Properties">
              <table>
                <tbody>
                  <tr>
                    <th>Temperature</th>
                    <td>{T.toFixed(2)} K</td>
                  </tr>
                  <tr>
                    <th>Pressure</th>
                    <td>{P.toFixed(3)} MPa</td>
                  </tr>
                  <tr>
                    <th>Molar volume</th>
                    <td>0.094 L/mol</td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card title="Reduced Variables">
              <p>Tr = {r.Tr.toFixed(3)}</p>
              <p>Pr = {r.Pr.toFixed(3)}</p>
              <p>Vr = {r.Vr.toFixed(3)}</p>
            </Card>
          </div>
        </div>
        <div>
          <Card title="P–V Isotherms for CO₂">
            <Plot T={304.13} />
          </Card>
          <Card title="Phase Envelope (P–T Diagram)">
            <div className="rg-phase">
              <i />
              <b>
                Critical point
                <br />
                Tc=304.13 K, Pc=7.377 MPa
              </b>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
function JT({ go }) {
  const [P1, setP1] = useState(10),
    [T1, setT1] = useState(300),
    [P2, setP2] = useState(1),
    [ran, setRan] = useState(false),
    j = jouleThomson(T1, P1, P2);
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Joule–Thomson Expansion
          <small>Screen 5 of 6 · Steady throttling at constant enthalpy</small>
        </h1>
      </div>
      <div className="rg-jt">
        <Card title="Simulation Controls">
          <label>
            Inlet Pressure
            <input
              aria-label="Inlet pressure"
              value={P1}
              onChange={(e) => setP1(+e.target.value)}
            />
          </label>
          <label>
            Inlet Temperature
            <input
              aria-label="Inlet temperature"
              value={T1}
              onChange={(e) => setT1(+e.target.value)}
            />
          </label>
          <label>
            Outlet Pressure
            <input
              aria-label="Outlet pressure"
              value={P2}
              onChange={(e) => setP2(+e.target.value)}
            />
          </label>
          <button className="rg-primary" onClick={() => setRan(true)}>
            Run Expansion
          </button>
          <button onClick={() => go(5)}>Report</button>
        </Card>
        <div>
          <Card title="Throttling Apparatus (Joule–Thomson Expansion)">
            <div className="rg-pipe">
              <Gauge />
              <span>
                High pressure
                <br />
                {P1.toFixed(1)} MPa
              </span>
              <i>Porous plug</i>
              <span>
                Low pressure
                <br />
                {P2.toFixed(1)} MPa
              </span>
              <Thermometer />
            </div>
            <p>Insulated (Q = 0), no shaft work: h₁ = h₂.</p>
          </Card>
          <div className="rg-jt-results">
            <Card title="Results (CO₂, Peng–Robinson EOS)">
              <table>
                <tbody>
                  <tr>
                    <th>Temperature change</th>
                    <td>{j.deltaT.toFixed(1)} K</td>
                  </tr>
                  <tr>
                    <th>Outlet temperature</th>
                    <td>{j.T2.toFixed(1)} K</td>
                  </tr>
                  <tr>
                    <th>μJT</th>
                    <td>{j.mu.toFixed(2)} K/MPa</td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card title="Compare Gases">
              <table>
                <tbody>
                  <tr>
                    <th>CO₂</th>
                    <td>+2.83</td>
                    <td>Cools</td>
                  </tr>
                  <tr>
                    <th>N₂</th>
                    <td>+0.26</td>
                    <td>Cools</td>
                  </tr>
                  <tr>
                    <th>H₂</th>
                    <td>−0.46</td>
                    <td>Warms</td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
          {ran && (
            <div className="rg-success">
              <Check />
              Expansion complete! CO₂ cools by {Math.abs(j.deltaT).toFixed(1)} K
              for a {Math.abs(j.deltaP).toFixed(1)} MPa pressure drop.
            </div>
          )}
        </div>
        <div>
          <Card title="T–P Inversion Curve (CO₂)">
            <Plot kind="z" />
          </Card>
          <Card title="Molecular Explanation">
            <p>
              Attractive forces dominate at 300 K. Expansion increases
              separation and lowers kinetic energy to maintain constant
              enthalpy.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
function Report({ go }) {
  const [answers, setAnswers] = useState({}),
    qs = [
      ["What causes non-ideal behavior?", "Intermolecular attractions"],
      [
        "What is special at the critical point?",
        "Phases become indistinguishable",
      ],
      ["What does positive μJT mean?", "The gas cools on expansion"],
    ],
    score = qs.filter((q, i) => answers[i] === q[1]).length;
  return (
    <div className="rg-main">
      <div className="rg-title">
        <h1>
          Study Complete!
          <small>Screen 6 of 6 · Report & Model Assessment</small>
        </h1>
        <strong className="rg-big">100%</strong>
      </div>
      <div className="rg-report-top">
        <Card title="Experiment Summary">
          <div className="rg-co2">
            <i />
            <b />
            <i />
          </div>
          <p>
            18 PVT points · 5 isotherms
            <br />
            250–400 K · 0.1–10 MPa
          </p>
        </Card>
        <Card title="Best-Fit Model">
          <h1>Peng–Robinson</h1>
          <p>
            RMSE <b>0.042 MPa</b>
          </p>
          <p>
            Model score <b>95%</b>
          </p>
        </Card>
        <Card title="Selected Result">
          <table>
            <tbody>
              <tr>
                <th>Measured pressure</th>
                <td>3.86 MPa</td>
              </tr>
              <tr>
                <th>Ideal gas</th>
                <td>4.989 MPa</td>
              </tr>
              <tr>
                <th>Peng–Robinson</th>
                <td>3.858 MPa</td>
              </tr>
              <tr>
                <th>Z</th>
                <td>0.774</td>
              </tr>
            </tbody>
          </table>
        </Card>
        <Card title="Critical Properties">
          <p>Tc 304.13 K</p>
          <p>Pc 7.377 MPa</p>
          <p>Vc 0.094 L/mol</p>
        </Card>
      </div>
      <div className="rg-report-charts">
        <Card title="Model Residuals">
          <Plot kind="z" />
        </Card>
        <Card title="Compressibility">
          <Plot kind="z" />
        </Card>
        <Card title="Isotherms">
          <Plot />
        </Card>
        <Card title="Joule–Thomson">
          <div className="rg-valve">
            P₁ 10 MPa　▷◁　P₂ 1 MPa<strong>ΔT = −25.5 K</strong>
          </div>
        </Card>
      </div>
      <div className="rg-report-bottom">
        <Card title="Report">
          <label>
            Aim
            <textarea defaultValue="Investigate the PVT behaviour of CO₂ and evaluate equations of state." />
          </label>
          <label>
            Conclusion
            <textarea defaultValue="Peng–Robinson gives the best overall description; CO₂ cools during throttling at 300 K." />
          </label>
        </Card>
        <Card title={`Knowledge Check ${score} / 3`}>
          {qs.map((q, i) => (
            <fieldset key={q[0]}>
              <legend>{q[0]}</legend>
              <button
                className={answers[i] === q[1] ? "active" : ""}
                onClick={() => setAnswers({ ...answers, [i]: q[1] })}
              >
                {q[1]}
              </button>
              <button onClick={() => setAnswers({ ...answers, [i]: "wrong" })}>
                None of these
              </button>
            </fieldset>
          ))}
        </Card>
        <Card title="Achievements">
          <Trophy />
          <h2>EOS Analyst</h2>
          <p>Real-Gas Expert</p>
        </Card>
      </div>
      <button className="rg-primary rg-restart" onClick={() => go(0)}>
        <RefreshCw />
        Restart Study
      </button>
    </div>
  );
}
export default function RealGasLawsLab() {
  const initial =
      new URLSearchParams(location.search).get("screen") || "overview",
    [screen, setScreen] = useState(
      ids.includes(initial) ? initial : "overview",
    ),
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
    <div className="rg-app">
      <Nav step={step} go={go} />
      {step === 0 ? (
        <Overview go={go} />
      ) : step === 1 ? (
        <Pvt go={go} />
      ) : step === 2 ? (
        <Compress go={go} />
      ) : step === 3 ? (
        <Critical go={go} />
      ) : step === 4 ? (
        <JT go={go} />
      ) : (
        <Report go={go} />
      )}
    </div>
  );
}
