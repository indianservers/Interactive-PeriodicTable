import { useEffect, useMemo, useState } from "react";
import {
  Beaker,
  BookOpen,
  Check,
  ClipboardList,
  Droplets,
  FileText,
  FlaskConical,
  Home,
  Play,
  RotateCcw,
  Settings,
  ShieldCheck,
  TestTube2,
  Thermometer,
  TriangleAlert,
} from "lucide-react";
import "./virtualLabTarget.css";

const nav = [
  ["dashboard", "Home", Home],
  ["lab", "Lab Bench", FlaskConical],
  ["lab", "Experiments", Beaker],
  ["lab", "Chemicals", TestTube2],
  ["research-toolkit", "Data & Reports", FileText],
  ["syllabus", "Learn", BookOpen],
  ["settings", "Settings", Settings],
];
const reagents = [
  ["HCl (aq)", "0.100 M", "#e84b3c"],
  ["NaOH (aq)", "~0.100 M (unknown)", "#178de8"],
  ["Phenolphthalein", "Indicator (0.5% w/v)", "#dd3da9"],
  ["Distilled Water", "H₂O", "#e7eef5"],
];
export default function VirtualLabTargetPage({ onNavigate }) {
  const [volume, setVolume] = useState(23.4),
    [flow, setFlow] = useState(false),
    [swirl, setSwirl] = useState(false),
    [goggles, setGoggles] = useState(true);
  useEffect(() => {
    if (!flow) return;
    const timer = setInterval(
      () => setVolume((v) => Math.min(40, +(v + 0.1).toFixed(1))),
      80,
    );
    return () => clearInterval(timer);
  }, [flow]);
  const ph = useMemo(() => {
    const v = volume;
    if (v < 22) return +(1 + v * 0.12).toFixed(1);
    if (v <= 23.4) return +(3.6 + (v - 22) * 3.286).toFixed(1);
    if (v < 25) return +(8.2 + (v - 23.4) * 1.35).toFixed(1);
    return +(10.36 + Math.min(2.3, (v - 25) * 0.16)).toFixed(1);
  }, [volume]);
  const points = Array.from({ length: 41 }, (_, i) => {
    const y =
      i < 22
        ? 1 + i * 0.12
        : i < 25
          ? 3.6 + (i - 22) * 2.25
          : 10.35 + Math.min(2.3, (i - 25) * 0.16);
    return `${28 + i * 12.5},${145 - y * 9.2}`;
  }).join(" ");
  return (
    <div className="vlab">
      <header className="vl-top">
        <div className="vl-brand">
          <FlaskConical />
          <div>
            <b>Virtual Chemistry Lab</b>
            <span>EXPLORE　·　EXPERIMENT　·　UNDERSTAND</span>
          </div>
        </div>
        <div>
          <h1>Acid–Base Titration: HCl + NaOH</h1>
          <p>Determine the concentration of NaOH using standardized HCl</p>
        </div>
      </header>
      <aside className="vl-nav">
        {nav.map(([id, label, Icon], i) => (
          <button
            className={label === "Lab Bench" ? "active" : ""}
            onClick={() => onNavigate(id)}
            key={`${label}-${i}`}
          >
            <Icon />
            {label}
          </button>
        ))}
      </aside>
      <aside className="vl-reagents">
        <h2>Reagents & Equipment</h2>
        <div className="vl-tabs">
          <button className="active">Solutions</button>
          <button>Glassware</button>
          <button>Tools</button>
        </div>
        {reagents.map(([name, sub, color]) => (
          <button className="vl-reagent" key={name}>
            <i>⠿</i>
            <span className="vl-bottle" style={{ "--cap": color }} />
            <span>
              <b>{name}</b>
              <small>{sub}</small>
            </span>
            <em>⠿</em>
          </button>
        ))}
      </aside>
      <main className={`vl-stage ${swirl ? "swirl" : ""}`}>
        <div className="vl-reading">
          <b>Burette (HCl)</b>
          <strong>{volume.toFixed(2)} mL</strong>
          <span>
            Initial: 0.00 mL
            <br />
            Delivered: {volume.toFixed(2)} mL
          </span>
        </div>
        <div className="vl-drop" />
      </main>
      <aside className="vl-right">
        <section>
          <h3>
            <ClipboardList />
            Experiment Goals
          </h3>
          {[
            "Perform a titration",
            "Identify the equivalence point",
            "Calculate unknown concentration",
          ].map((x) => (
            <p key={x}>
              <Check />
              {x}
            </p>
          ))}
        </section>
        <section>
          <h3>Live Measurements</h3>
          <div className="vl-metric">
            <TestTube2 />
            <span>
              Burette Reading<strong>{volume.toFixed(2)} mL</strong>
            </span>
          </div>
          <div className="vl-metric">
            <FlaskConical />
            <span>
              pH (solution)<strong>{ph}</strong>
            </span>
          </div>
          <div className="vl-metric">
            <Thermometer />
            <span>
              Temperature
              <strong>{(24.4 + volume * 0.017).toFixed(1)} °C</strong>
            </span>
          </div>
        </section>
        <section className="vl-safety">
          <h3>
            <TriangleAlert />
            Safety & Hazards
          </h3>
          {[
            "Wear eye protection",
            "HCl is corrosive",
            "NaOH is corrosive",
            "Rinse spills with plenty of water",
            "Dispose of waste properly",
          ].map((x) => (
            <p key={x}>●　{x}</p>
          ))}
          <button
            className={goggles ? "on" : ""}
            onClick={() => setGoggles((v) => !v)}
          >
            <ShieldCheck />
            {goggles ? "Eye protection on" : "Wear eye protection"}
            <i />
          </button>
        </section>
      </aside>
      <section className="vl-bottom">
        <div className="vl-controls">
          <h3>Controls</h3>
          <div>
            <button
              onClick={() =>
                setVolume((v) => Math.min(40, +(v + 0.05).toFixed(2)))
              }
            >
              <Droplets />
              Add one drop
            </button>
            <button
              className={flow ? "on" : ""}
              onClick={() => setFlow((v) => !v)}
            >
              <Play />
              {flow ? "Stop flow" : "Continuous flow"}
            </button>
            <button
              className={swirl ? "on" : ""}
              onClick={() => setSwirl((v) => !v)}
            >
              <RotateCcw />
              Swirl flask
            </button>
            <button
              onClick={() => {
                setFlow(false);
                setSwirl(false);
                setVolume(0);
              }}
            >
              <RotateCcw />
              Reset experiment
            </button>
          </div>
        </div>
        <div className="vl-chart">
          <h3>Titration Curve (Live)</h3>
          <svg
            viewBox="0 0 600 175"
            role="img"
            aria-label="Live titration curve"
          >
            <g className="grid">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line
                  key={`h${i}`}
                  x1="28"
                  x2="548"
                  y1={25 + i * 25}
                  y2={25 + i * 25}
                />
              ))}
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <line
                  key={`v${i}`}
                  x1={28 + i * 65}
                  x2={28 + i * 65}
                  y1="20"
                  y2="150"
                />
              ))}
            </g>
            <polyline points={points} />
            <line className="equiv" x1="328" x2="328" y1="20" y2="150" />
            <circle cx={28 + volume * 12.5} cy={145 - ph * 9.2} r="5" />
            <text x="341" y="90">
              Equivalence point
            </text>
            <text x="341" y="105">
              (23.40 mL, pH 7.0)
            </text>
            <text x="230" y="170">
              Volume of HCl added (mL)
            </text>
          </svg>
        </div>
        <div className="vl-notes">
          <h3>Calculation Notebook</h3>
          <div>
            <p>
              1. Reaction
              <br />
              　HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)
            </p>
            <p>
              2. At equivalence point (1:1 stoichiometry)
              <br />
              　n(HCl) = n(NaOH)
            </p>
            <p>3. Calculate concentration of NaOH</p>
            <strong>
              C<sub>NaOH</sub> = 0.100 M × 23.40/25.00
              <br />= 0.0936 M
            </strong>
          </div>
        </div>
      </section>
    </div>
  );
}
