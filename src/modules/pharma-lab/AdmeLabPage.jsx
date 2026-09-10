import { useMemo, useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import ScientificChart from "./components/ScientificChart.jsx";
import { massBalanceAt, simulateOralPk } from "./simulation/admeModel.js";
import "./pharmaLab.css";
import "./admeLab.css";

const stages = [
  [
    "Absorption",
    "Rapid absorption in small intestine",
    "Bioavailability 70–90% · Tmax 0.5–1 h",
    "🫃",
  ],
  [
    "Distribution",
    "Widely distributed in total body water",
    "Vd 0.6–1.2 L/kg · protein binding 10–25%",
    "🩸",
  ],
  [
    "Metabolism",
    "Primarily hepatic conjugation",
    "Glucuronidation ~55% · sulfation ~30%",
    "🫀",
  ],
  [
    "Excretion",
    "Renal elimination of conjugates",
    "Half-life 2–3 h · unchanged ~5%",
    "🫘",
  ],
];

export default function AdmeLabPage() {
  const [query, setQuery] = useState("");
  const [dose, setDose] = useState(500);
  const [weight, setWeight] = useState(70);
  const [gastric, setGastric] = useState(1);
  const [hepatic, setHepatic] = useState(1);
  const [renal, setRenal] = useState(1);
  const [fed, setFed] = useState(false);
  const [model, setModel] = useState("one");
  const [interval, setIntervalHours] = useState(8);
  const [simulated, setSimulated] = useState(false);
  const [motion, setMotion] = useState(false);
  const [sources, setSources] = useState(false);
  const [message, setMessage] = useState(
    "Adjust patient and dose assumptions, then simulate.",
  );
  const result = useMemo(
    () =>
      simulateOralPk({
        doseMg: dose,
        weightKg: weight,
        gastric,
        hepatic,
        renal,
        fed,
        model,
        intervalHours: interval,
      }),
    [dose, weight, gastric, hepatic, renal, fed, model, interval],
  );
  const normal = useMemo(
    () => simulateOralPk({ doseMg: dose, weightKg: weight }),
    [dose, weight],
  );
  const fasted = useMemo(
    () => simulateOralPk({ doseMg: dose, weightKg: weight, gastric: 1.3 }),
    [dose, weight],
  );
  const impaired = useMemo(
    () => simulateOralPk({ doseMg: dose, weightKg: weight, hepatic: 0.55 }),
    [dose, weight],
  );
  const mass = massBalanceAt(24, result);
  const reset = () => {
    setDose(500);
    setWeight(70);
    setGastric(1);
    setHepatic(1);
    setRenal(1);
    setFed(false);
    setModel("one");
    setIntervalHours(8);
    setSimulated(false);
    setMessage("Default 500 mg / 70 kg immediate-release scenario restored.");
  };
  return (
    <PharmaLabShell
      query={query}
      setQuery={setQuery}
      activeStage={6}
      onReset={reset}
      onSave={() => setMessage("PK scenario saved locally.")}
      onSources={() => setSources(true)}
      reducedMotion={motion}
      setReducedMotion={setMotion}
    >
      <main className="plab-adme">
        <header>
          <div>
            <h1>ADME & Metabolism — Human Pharmacokinetics</h1>
            <p>
              Paracetamol (Acetaminophen) · Oral {dose} mg (Immediate Release)
            </p>
            <small>
              From absorption to elimination — linking chemistry, biology and
              patient response.
            </small>
          </div>
          <aside>
            Compound: <b>Paracetamol</b> · Dose: <b>{dose} mg</b> · Species:{" "}
            <b>Human ({weight} kg)</b> · Simulation: <b>Educational</b>
          </aside>
        </header>
        <section className="plab-adme-grid">
          <aside className="plab-pk-left">
            <article>
              <h2>Key Pharmacokinetic Parameters</h2>
              {[
                [
                  "Oral bioavailability",
                  "70–90%",
                  `${(result.bioavailability * 100).toFixed(0)}%`,
                ],
                ["Tmax", "0.5–1 h", `${result.tmax.toFixed(2)} h`],
                ["Cmax", "8–12 mg/L", `${result.cmax.toFixed(1)} mg/L`],
                ["AUC₀–₂₄", "30–40 mg·h/L", `${result.auc.toFixed(1)} mg·h/L`],
                [
                  "Volume of distribution",
                  "0.6–1.2 L/kg",
                  `${(result.volume / weight).toFixed(1)} L/kg`,
                ],
                [
                  "Elimination half-life",
                  "2–3 h",
                  `${result.halfLife.toFixed(1)} h`,
                ],
                [
                  "Clearance",
                  "15–25 L/h",
                  `${result.clearance.toFixed(1)} L/h`,
                ],
              ].map((r) => (
                <span key={r[0]}>
                  <b>{r[0]}</b>
                  <em>{r[1]}</em>
                  <strong>{r[2]}</strong>
                </span>
              ))}
            </article>
            <article>
              <h2>ADME Stages</h2>
              {stages.map((s, i) => (
                <div key={s[0]}>
                  <i>{s[3]}</i>
                  <b>{i + 1}</b>
                  <span>
                    <strong>{s[0]}</strong>
                    <small>
                      {s[1]}
                      <br />
                      {s[2]}
                    </small>
                  </span>
                </div>
              ))}
            </article>
          </aside>
          <section className="plab-body-map">
            <div
              className={`plab-human ${simulated && !motion ? "active" : ""}`}
            >
              <i className="head" />
              <i className="torso" />
              <b className="stomach">Stomach</b>
              <b className="liver">Liver</b>
              <b className="gut">Small intestine</b>
              <b className="kidney">Kidneys</b>
              <span className="dose">
                💊 Oral dose
                <br />
                {dose} mg
              </span>
              <svg viewBox="0 0 400 550">
                <path d="M90 80C185 130 175 195 210 240S170 340 205 395S270 420 270 505" />
                <circle cx="90" cy="80" r="6" />
                <circle cx="185" cy="210" r="6" />
                <circle cx="205" cy="395" r="6" />
              </svg>
            </div>
            <div className="plab-organ-insets">
              <article>
                <h3>Liver lobule (metabolism)</h3>
                <div className="lobule">
                  ⬡⬡⬡
                  <br />
                  🟢 🔴 🔵
                </div>
                <span>Hepatocytes · portal triad · central vein</span>
              </article>
              <article>
                <h3>Nephron (excretion)</h3>
                <div className="nephron">◉〰〰〰↘</div>
                <span>Filtration · secretion · urine</span>
              </article>
            </div>
          </section>
          <aside className="plab-adme-right">
            <article className="plab-sankey">
              <h2>Metabolic Pathway of Paracetamol</h2>
              <div>
                <b>
                  Paracetamol
                  <br />
                  C₈H₉NO₂
                </b>
                <span className="s1">55% → Glucuronidation</span>
                <span className="s2">30% → Sulfation</span>
                <span className="s3">5% → Unchanged urine</span>
                <span className="s4">5–10% → CYP oxidation / NAPQI</span>
              </div>
            </article>
            <div className="plab-adme-right-lower">
              <article className="plab-pk-controls">
                <h2>Simulation Controls</h2>
                <Control
                  label="Dose (mg)"
                  value={dose}
                  set={setDose}
                  min={325}
                  max={1000}
                  step={25}
                />
                <Control
                  label="Weight (kg)"
                  value={weight}
                  set={setWeight}
                  min={40}
                  max={120}
                />
                <Control
                  label="Gastric emptying"
                  value={gastric}
                  set={setGastric}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                />
                <Control
                  label="Hepatic function"
                  value={hepatic}
                  set={setHepatic}
                  min={0.4}
                  max={1.2}
                  step={0.1}
                />
                <Control
                  label="Renal function"
                  value={renal}
                  set={setRenal}
                  min={0.4}
                  max={1.2}
                  step={0.1}
                />
                <Control
                  label="Dose interval"
                  value={interval}
                  set={setIntervalHours}
                  min={4}
                  max={12}
                />
                <label>
                  <input
                    type="checkbox"
                    checked={fed}
                    onChange={(e) => setFed(e.target.checked)}
                  />{" "}
                  Fed state
                </label>
                <select
                  aria-label="PK model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                >
                  <option value="one">One-compartment</option>
                  <option value="two">Two-compartment</option>
                </select>
                <button
                  onClick={() => {
                    setSimulated(true);
                    setMessage(
                      `Simulated: Cmax ${result.cmax.toFixed(1)} mg/L at ${result.tmax.toFixed(2)} h.`,
                    );
                  }}
                >
                  <Play />
                  Simulate dose
                </button>
                <button onClick={reset}>
                  <RotateCcw />
                  Reset
                </button>
                <p role="status">{message}</p>
              </article>
              <article className="plab-primary-profile">
                <h2>Plasma Concentration–Time Profile</h2>
                <ScientificChart
                  data={result.profile}
                  xLabel="Time (hours)"
                  yLabel="Concentration (mg/L)"
                  label="Current oral pharmacokinetic profile"
                />
                <b>
                  Cmax {result.cmax.toFixed(1)} mg/L · Tmax{" "}
                  {result.tmax.toFixed(2)} h · t½ {result.halfLife.toFixed(1)} h
                  · AUC {result.auc.toFixed(1)} mg·h/L
                </b>
              </article>
            </div>
          </aside>
        </section>
        <section className="plab-adme-bottom">
          <article>
            <h2>
              Simulated Plasma Profiles ({dose} mg, {weight} kg)
            </h2>
            <ScientificChart
              data={normal.profile}
              secondary={fasted.profile}
              xLabel="Time (hours)"
              yLabel="Plasma concentration"
              label="Normal and fasted plasma profiles"
            />
            <b>
              Normal · fasted comparison · hepatic impairment t½{" "}
              {impaired.halfLife.toFixed(1)} h
            </b>
          </article>
          <article>
            <h2>Mass Balance — 0 to 24 h</h2>
            <div className="plab-mass-bars">
              {Object.entries(mass).map(([key, value]) => (
                <span key={key}>
                  <i style={{ width: `${value}%` }} />
                  <b>
                    {key} {value.toFixed(1)}%
                  </b>
                </span>
              ))}
            </div>
          </article>
          <article>
            <h2>Key Takeaways</h2>
            <ul>
              <li>
                Well absorbed orally with an educational F of{" "}
                {(result.bioavailability * 100).toFixed(0)}%.
              </li>
              <li>Glucuronidation and sulfation dominate metabolism.</li>
              <li>A small CYP fraction forms reactive NAPQI.</li>
              <li>Hepatic or renal impairment prolongs exposure.</li>
              <li>
                Accumulation ratio at {interval} h:{" "}
                {result.accumulation.toFixed(2)}.
              </li>
            </ul>
          </article>
        </section>
        <footer>
          Educational simulation only · representative literature ranges, not a
          clinical recommendation.
        </footer>
      </main>
      {sources && (
        <div className="plab-drawer-backdrop" onClick={() => setSources(false)}>
          <aside className="plab-drawer" onClick={(e) => e.stopPropagation()}>
            <span className="plab-panel-kicker">PAGE 9 PROVENANCE</span>
            <h2>Human PK sources</h2>
            <a
              href="https://pubchem.ncbi.nlm.nih.gov/compound/1983"
              target="_blank"
              rel="noreferrer"
            >
              Paracetamol · PubChem CID 1983
            </a>
            <p>
              Published ranges are shown separately from calculated
              one/two-compartment teaching outputs.
            </p>
            <button className="plab-export" onClick={() => setSources(false)}>
              Close source panel
            </button>
          </aside>
        </div>
      )}
    </PharmaLabShell>
  );
}
function Control({ label, value, set, min, max, step = 1 }) {
  return (
    <label>
      <span>{label}</span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
      />
      <output>{value}</output>
    </label>
  );
}
