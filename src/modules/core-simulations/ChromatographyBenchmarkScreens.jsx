import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Check,
  ChevronRight,
  Clock3,
  Flame,
  FlaskConical,
  RefreshCw,
  Save,
  ShieldAlert,
} from "lucide-react";
import { COMPONENTS, rfValues } from "./chromatographyModel.js";
import overviewScene from "../../assets/virtual-labs/chromatography/overview-apparatus-v1.png";
import tlcScene from "../../assets/virtual-labs/chromatography/tlc-apparatus-v2.png";
import "./ChromatographyBenchmarkScreens.css";
import "./ChromatographyBenchmarkOverrides.css";

function PeakChart({ compact = false }) {
  return (
    <svg
      className={`chb-peaks ${compact ? "compact" : ""}`}
      viewBox="0 0 430 260"
      role="img"
      aria-label="Example UV chromatogram with three resolved peaks"
    >
      <g className="grid">
        {[35, 80, 125, 170, 215].map((y) => (
          <line key={y} x1="48" x2="410" y1={y} y2={y} />
        ))}
      </g>
      <line x1="48" x2="414" y1="215" y2="215" />
      <line x1="48" x2="48" y1="22" y2="215" />
      <path
        className="yellow"
        d="M48 215C85 215 91 213 98 195C107 165 110 62 118 61C126 61 128 169 138 196C145 214 154 215 180 215"
      />
      <path
        className="red"
        d="M160 215C199 215 205 212 211 190C218 157 220 58 229 57C238 58 239 161 246 190C251 211 260 215 286 215"
      />
      <path
        className="blue"
        d="M270 215C320 215 326 213 333 187C340 153 343 55 351 55C360 56 362 164 370 191C376 211 385 215 410 215"
      />
      <g className="labels">
        <text x="92" y="20">
          Peak 1
        </text>
        <text x="202" y="20">
          Peak 2
        </text>
        <text x="324" y="20">
          Peak 3
        </text>
        <text x="87" y="39">
          tᴿ = 3.2 min
        </text>
        <text x="196" y="39">
          tᴿ = 6.1 min
        </text>
        <text x="316" y="39">
          tᴿ = 9.8 min
        </text>
      </g>
      <path className="resolution" d="M133 136H205M247 136H329" />
      <text x="147" y="126">
        Rₛ = 2.1
      </text>
      <text x="265" y="126">
        Rₛ = 2.4
      </text>
      <text x="188" y="248">
        Time (min)
      </text>
      <text transform="rotate(-90 14 155)" x="14" y="155">
        Absorbance (mAU)
      </text>
    </svg>
  );
}

const modeCards = [
  [
    "Column Chromatography",
    "Pack a silica gel column, load a mixture, elute with solvent, collect fractions, and analyze purity and recovery.",
    "Beginner",
    "~ 25 min",
    "column",
  ],
  [
    "TLC Method Development",
    "Test solvent systems, calculate Rf values, and select optimal conditions for column separation.",
    "Beginner",
    "~ 20 min",
    "tlc",
  ],
  [
    "Gradient Elution",
    "Use a solvent gradient to separate compounds with a range of polarities.",
    "Intermediate",
    "~ 30 min",
    "elution",
  ],
  [
    "Fraction Analysis",
    "Analyze collected fractions by TLC and UV. Determine purity, identify components, and calculate recovery.",
    "Advanced",
    "~ 25 min",
    "analysis",
  ],
];
export function ChromatographyHomeBenchmark({ go }) {
  return (
    <main className="chb-home">
      <section className="chb-home-copy">
        <p className="chb-kicker">
          <FlaskConical />
          Organic Chemistry
        </p>
        <h1>Chromatography Separation Laboratory</h1>
        <p className="chb-subtitle">
          Pack a column. Separate a mixture. Analyze purity and recovery.
        </p>
        <div className="chb-principles">
          <article>
            <h2>Separation Principle (Retention Factor)</h2>
            <div className="chb-formula">
              k′ ={" "}
              <span className="chb-fraction">
                <span>
                  <i>t</i>
                  <sub>R</sub> − <i>t</i>
                  <sub>M</sub>
                </span>
                <span>
                  <i>t</i>
                  <sub>M</sub>
                </span>
              </span>
            </div>
            <dl>
              <div>
                <dt>
                  t<sub>R</sub>
                </dt>
                <dd>retention time of analyte (min)</dd>
              </div>
              <div>
                <dt>
                  t<sub>M</sub>
                </dt>
                <dd>dead time (void time) (min)</dd>
              </div>
              <div>
                <dt>k′</dt>
                <dd>retention factor (dimensionless)</dd>
              </div>
            </dl>
            <hr />
            <p>
              A larger k′ indicates stronger interaction between the analyte and
              the stationary phase, resulting in longer retention on the column.
            </p>
          </article>
          <article>
            <h2>Example Chromatogram (UV, 254 nm)</h2>
            <PeakChart />
          </article>
        </div>
        <button className="chb-start" onClick={() => go(1)}>
          <FlaskConical />
          Start Experiment
          <ChevronRight />
        </button>
      </section>
      <section
        className="chb-home-scene"
        style={{ backgroundImage: `url(${overviewScene})` }}
        aria-label="Chromatography apparatus in a professional laboratory"
      >
        <div className="chb-live-monitor">
          <small>UV 254 nm</small>
          <PeakChart compact />
        </div>
        <div className="chb-scene-bands">
          {COMPONENTS.map((c, i) => (
            <i
              key={c.id}
              style={{ background: c.color, top: `${31 + i * 4.8}%` }}
            />
          ))}
        </div>
        <button className="chb-explore" onClick={() => go(2)}>
          <span />
          Explore separation
        </button>
        {[
          ["Eluent", "hexane/ethyl acetate", 34, 5],
          ["Packed column", "silica gel", 35, 22],
          ["Sample bands", "3 components", 35, 33],
          ["Stopcock", "", 36, 49],
          ["Live chromatogram", "", 73, 11],
          ["TLC chamber", "for method development", 80, 46],
          ["Fraction collector", "", 46, 72],
          ["Collected fractions", "", 91, 61],
        ].map(([a, b, x, y]) => (
          <label key={a} style={{ left: `${x}%`, top: `${y}%` }}>
            <b>{a}</b>
            {b && <small>{b}</small>}
          </label>
        ))}
      </section>
      <nav className="chb-modes">
        {modeCards.map(([title, copy, level, time, id], i) => (
          <button key={id} onClick={() => go([2, 1, 3, 4][i])}>
            <span className={`thumb t${i + 1}`} />
            <strong>{title}</strong>
            <p>{copy}</p>
            <footer>
              <em className={level}>{level}</em>
              <small>
                <Clock3 />
                {time}
              </small>
              <ChevronRight />
            </footer>
          </button>
        ))}
      </nav>
    </main>
  );
}

function SolventChart({ ethyl }) {
  const ratios = [10, 20, 30, 40],
    series = COMPONENTS.map((c, i) => ratios.map((x) => rfValues(x)[i].rf));
  return (
    <svg
      className="chb-solvent-chart"
      viewBox="0 0 330 205"
      role="img"
      aria-label="Rf versus solvent composition"
    >
      <g>
        {[30, 75, 120, 165].map((y) => (
          <line key={y} x1="38" x2="285" y1={y} y2={y} />
        ))}
      </g>
      <line x1="38" x2="290" y1="170" y2="170" />
      <line x1="38" x2="38" y1="20" y2="170" />
      {series.map((s, i) => (
        <g key={COMPONENTS[i].id}>
          <polyline
            style={{ stroke: COMPONENTS[i].color }}
            points={s
              .map((v, j) => `${55 + j * 72},${170 - v * 160}`)
              .join(" ")}
          />
          {s.map((v, j) => (
            <circle
              key={j}
              style={{ fill: COMPONENTS[i].color }}
              cx={55 + j * 72}
              cy={170 - v * 160}
              r="5"
            />
          ))}
          <text
            x="278"
            y={170 - s[3] * 160 + 4}
            style={{ fill: COMPONENTS[i].color }}
          >
            {COMPONENTS[i].id}
          </text>
        </g>
      ))}
      <line
        className="selected"
        x1={55 + (ethyl / 10 - 1) * 72}
        x2={55 + (ethyl / 10 - 1) * 72}
        y1="18"
        y2="174"
      />
      <g className="ticks">
        {ratios.map((x, j) => (
          <text key={x} x={42 + j * 72} y="190">
            {100 - x}:{x}
          </text>
        ))}
      </g>
      <text x="4" y="90">
        Rf
      </text>
    </svg>
  );
}

function LiveTlcOverlay({ rf, progress, uv }) {
  const lanes = [
    { id: "Mix", spots: rf },
    ...rf.map((x) => ({ id: x.id, spots: [x] })),
  ];
  return (
    <div className={`chb-live-plate ${uv ? "uv" : ""}`}>
      <i className="front" style={{ bottom: `${12 + progress * 74}%` }} />
      {lanes.map((lane, j) => (
        <span
          className="lane"
          key={lane.id}
          style={{ left: `${15 + j * 23}%` }}
        >
          {lane.spots.map((c) => (
            <i
              key={c.id}
              style={{
                background: c.color,
                bottom: `${12 + c.rf * progress * 74}%`,
              }}
            />
          ))}
          <b>{lane.id}</b>
        </span>
      ))}
    </div>
  );
}

export function ChromatographyTlcBenchmark({
  preparation,
  ethyl,
  setEthyl,
  saved,
  setSaved,
  go,
}) {
  const [saturation, setSaturation] = useState(10),
    [distance, setDistance] = useState(8),
    [volume, setVolume] = useState(2),
    [progress, setProgress] = useState(1),
    [running, setRunning] = useState(false),
    [uv, setUv] = useState(true),
    rf = useMemo(() => rfValues(ethyl, distance), [ethyl, distance]),
    ratio = `${100 - ethyl}:${ethyl}`;
  useEffect(()=>{if(preparation){setProgress(preparation.front);setVolume(preparation.plateVolume);setUv(preparation.uv);}},[preparation]);
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(
      () =>
        setProgress((p) =>
          p >= 1 ? (setRunning(false), 1) : Math.min(1, p + 0.025),
        ),
      35,
    );
    return () => clearInterval(timer);
  }, [running]);
  const redevelop = () => {
    setProgress(0);
    setRunning(true);
    setSaved(false);
  };
  return (
    <main className="chb-tlc">
      <aside className="chb-tlc-left">
        <p className="chb-kicker">
          <FlaskConical />
          Organic Chemistry
        </p>
        <h1>Develop Method with TLC</h1>
        <p>
          Select a solvent system and develop your method. Optimize separation,
          then proceed.
        </p>
        <section className="chb-control-card">
          <h2>1. Select Solvent System</h2>
          <p>Choose the hexane/ethyl acetate ratio (v/v).</p>
          {[10, 20, 30, 40].map((x) => (
            <label className={ethyl === x ? "selected" : ""} key={x}>
              <input
                aria-label={`${100 - x}:${x}`}
                type="radio"
                name="solvent"
                checked={ethyl === x}
                onChange={() => {
                  setEthyl(x);
                  setSaved(false);
                }}
              />
              <b>
                {100 - x} : {x}
              </b>
              <span>
                {x === 10
                  ? "(less polar)"
                  : x === 30
                    ? "(selected)"
                    : x === 40
                      ? "(more polar)"
                      : ""}
              </span>
            </label>
          ))}
          <hr />
          <h2>2. Development Parameters</h2>
          <div className="chb-number">
            <span>
              Chamber saturation time
              <small>Allow chamber to equilibrate with solvent vapor.</small>
            </span>
            <input
              aria-label="Chamber saturation time"
              type="number"
              min="5"
              max="30"
              value={saturation}
              onChange={(e) => setSaturation(+e.target.value)}
            />
            <b>min</b>
          </div>
          <div className="chb-number">
            <span>
              Development distance
              <small>Distance from origin to solvent front.</small>
            </span>
            <input
              aria-label="Development distance"
              type="number"
              min="4"
              max="10"
              step=".5"
              value={distance}
              onChange={(e) => setDistance(+e.target.value)}
            />
            <b>cm</b>
          </div>
          <div className="chb-number">
            <span>
              Spotting volume<small>Keep spots small and concentrated.</small>
            </span>
            <input
              aria-label="Spotting volume"
              type="number"
              min="1"
              max="5"
              value={volume}
              onChange={(e) => setVolume(+e.target.value)}
            />
            <b>µL</b>
          </div>
        </section>
      </aside>
      <section className="chb-tlc-centre">
        <div
          className="chb-tlc-photo"
          style={{ backgroundImage: `url(${tlcScene})` }}
        >
          <button className="chb-view visible" onClick={() => setUv(false)}>
            TLC Development (Visible Light)
          </button>
          <button className="chb-view ultraviolet" onClick={() => setUv(true)}>
            Developed TLC Plate (UV 254 nm)
          </button>
          <LiveTlcOverlay rf={rf} progress={progress} uv={false} />
          <LiveTlcOverlay rf={rf} progress={progress} uv />
          <label className="front-label">
            Solvent front
            <br />
            <b>{(distance * progress).toFixed(1)} cm</b>
          </label>
          <label className="origin-label">
            Origin
            <br />
            <b>0.0 cm</b>
          </label>
          <label className="solvent-label">
            Solvent
            <br />
            <b>hexane/ethyl acetate {ratio}</b>
          </label>
          {running && (
            <div className="chb-developing">
              Developing… {Math.round(progress * 100)}%
            </div>
          )}
        </div>
        <div className="chb-lower-cards">
          <section>
            <h2>5. Method Checklist</h2>
            {[
              [volume <= 2, "Spots are small and concentrated (≤ 2 mm)"],
              [saturation >= 10, `Chamber saturated for ${saturation} min`],
              [true, "Origin above solvent level"],
              [
                progress === 1,
                "Solvent front marked immediately after development",
              ],
            ].map(([ok, x]) => (
              <p key={x} className={ok ? "ok" : "wait"}>
                {ok ? <Check /> : "○"}
                {x}
              </p>
            ))}
          </section>
          <section>
            <h2>6. Safety Reminders</h2>
            <div className="chb-safety">
              <ShieldAlert />
              <p>
                <b>Flammable solvents</b>
                <br />• Use in a fume hood.
                <br />• Keep away from ignition sources.
                <br />• Wear lab coat, gloves, and safety glasses.
                <br />• Dispose of solvent waste properly.
              </p>
              <span>
                <Flame />
                Hexane /<br />
                Ethyl Acetate
              </span>
            </div>
          </section>
        </div>
      </section>
      <aside className="chb-tlc-right">
        <section>
          <h2>
            3. Calculate R<sub>f</sub> Values
          </h2>
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Distance (cm)</th>
                <th>
                  R<sub>f</sub>
                </th>
              </tr>
            </thead>
            <tbody>
              {rf.map((c) => (
                <tr key={c.id}>
                  <td style={{ color: c.color }}>
                    <b>{c.id}</b> (
                    {c.id === "A" ? "yellow" : c.id === "B" ? "red" : "blue"})
                  </td>
                  <td>{(c.distance * progress).toFixed(1)}</td>
                  <td>
                    <b>{(c.rf * progress).toFixed(2)}</b>
                  </td>
                </tr>
              ))}
              <tr>
                <td>Solvent front</td>
                <td>{(distance * progress).toFixed(1)}</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
          <p className="chb-valid">
            <Check />
            <span>
              Resolution between adjacent components:{" "}
              <b>{ethyl === 30 ? "Valid" : "Review"}</b>
              <small>
                Rₛ (A/B) = {(2.1 - (ethyl - 30) ** 2 * 0.002).toFixed(1)}　|　Rₛ
                (B/C) = {(2.4 - (ethyl - 30) ** 2 * 0.002).toFixed(1)}
              </small>
            </span>
          </p>
        </section>
        <section>
          <h2>4. Solvent Strength Comparison</h2>
          <SolventChart ethyl={ethyl} />
          <p className={ethyl === 30 ? "chb-balanced" : "chb-review"}>
            <Check />
            <span>
              <b>
                {ratio} selected —{" "}
                {ethyl === 30 ? "balanced separation" : "compare resolution"}
              </b>
              <small>
                {ethyl === 30
                  ? "Good resolution and reasonable run time."
                  : "Solvent strength changes spot spacing and retention."}
              </small>
            </span>
          </p>
        </section>
      </aside>
      <footer className="chb-tlc-footer">
        <button onClick={() => go(0)}>←　Previous</button>
        <button onClick={redevelop}>
          <RefreshCw />
          {running ? "Developing…" : "Redevelop (Run Again)"}
        </button>
        <button onClick={() => setSaved(true)}>
          <Save />
          {saved ? "Method Saved" : "Save Method"}
        </button>
        <button
          className="primary"
          disabled={progress < 1 || !saved}
          onClick={() => go(2)}
        >
          Continue
          <ChevronRight />
        </button>
      </footer>
    </main>
  );
}
