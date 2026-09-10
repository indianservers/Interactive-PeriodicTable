import { useMemo, useState } from "react";
import { Download, Play, RotateCcw, Scale } from "lucide-react";
import PharmaLabShell from "./components/PharmaLabShell.jsx";
import ScientificChart from "./components/ScientificChart.jsx";
import {
  doseResponse,
  exposureScenarios,
  simulateToxicology,
} from "./simulation/toxicologyModel.js";
import "./pharmaLab.css";
import "./toxicologyLab.css";

export default function ToxicologyLabPage() {
  const [query, setQuery] = useState("");
  const [scenario, setScenario] = useState("therapeutic");
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState("adult");
  const [fed, setFed] = useState(true);
  const [liver, setLiver] = useState("normal");
  const [alcohol, setAlcohol] = useState("none");
  const [repeated, setRepeated] = useState(false);
  const [ran, setRan] = useState(false);
  const [compare, setCompare] = useState(false);
  const [motion, setMotion] = useState(false);
  const [sources, setSources] = useState(false);
  const [message, setMessage] = useState(
    "Select an exposure scenario and run the educational simulation.",
  );
  const dose = exposureScenarios[scenario].doseMg;
  const result = useMemo(
    () =>
      simulateToxicology({
        doseMg: dose,
        weightKg: weight,
        age,
        fed,
        liver,
        alcohol,
        repeated,
      }),
    [dose, weight, age, fed, liver, alcohol, repeated],
  );
  const reset = () => {
    setScenario("therapeutic");
    setWeight(70);
    setAge("adult");
    setFed(true);
    setLiver("normal");
    setAlcohol("none");
    setRepeated(false);
    setRan(false);
    setCompare(false);
    setMessage("Default 500 mg / 70 kg adult scenario restored.");
  };
  return (
    <PharmaLabShell
      query={query}
      setQuery={setQuery}
      activeStage={7}
      onReset={reset}
      onSave={() => setMessage("Safety-learning scenario saved locally.")}
      onSources={() => setSources(true)}
      reducedMotion={motion}
      setReducedMotion={setMotion}
    >
      <main className="plab-tox">
        <header>
          <div>
            <h1>Toxicology & Patient Translation — Paracetamol Safety</h1>
            <p>Balancing benefit and risk from molecule to patient</p>
            <small>
              Explore how dose, patient factors and metabolism influence
              efficacy and liver safety.
            </small>
          </div>
          <aside>
            Compound: <b>Paracetamol</b> · Species: <b>Human ({weight} kg)</b> ·
            Simulation: <b>Educational</b>
          </aside>
        </header>
        <section className="plab-tox-grid">
          <aside className="plab-tox-left">
            <article>
              <h2>Dose & Exposure Scenario</h2>
              {Object.entries(exposureScenarios).map(([key, s]) => (
                <button
                  key={key}
                  className={scenario === key ? "active" : ""}
                  onClick={() => {
                    setScenario(key);
                    setRan(false);
                  }}
                >
                  <i />
                  <span>
                    <b>{s.label}</b>
                    <small>
                      {s.doseMg >= 1000
                        ? `${s.doseMg / 1000} g`
                        : `${s.doseMg} mg`}{" "}
                      paracetamol
                      <br />
                      {s.detail}
                    </small>
                  </span>
                </button>
              ))}
            </article>
            <article className="plab-patient">
              <h2>Patient Parameters (Simulation)</h2>
              <label>
                Body weight
                <input
                  aria-label="Body weight"
                  type="number"
                  min="10"
                  max="180"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                />
                <b>kg</b>
              </label>
              <label>
                Age group
                <select value={age} onChange={(e) => setAge(e.target.value)}>
                  <option value="child">Child</option>
                  <option value="adult">Adult (18–65 years)</option>
                  <option value="older">Older adult</option>
                </select>
              </label>
              <label>
                Fed or fasting
                <select
                  value={fed ? "fed" : "fasted"}
                  onChange={(e) => setFed(e.target.value === "fed")}
                >
                  <option value="fed">Fed (normal diet)</option>
                  <option value="fasted">Fasted</option>
                </select>
              </label>
              <label>
                Liver function
                <select
                  value={liver}
                  onChange={(e) => setLiver(e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="impaired">Impaired</option>
                </select>
              </label>
              <label>
                Alcohol use
                <select
                  value={alcohol}
                  onChange={(e) => setAlcohol(e.target.value)}
                >
                  <option value="none">No recent alcohol</option>
                  <option value="recent">Recent alcohol</option>
                  <option value="chronic">Chronic use</option>
                </select>
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={repeated}
                  onChange={(e) => setRepeated(e.target.checked)}
                />
                Repeated exposure
              </label>
              <p>These inputs affect the educational model only.</p>
            </article>
          </aside>
          <section
            className={`plab-liver-mechanism ${ran && !motion ? "active" : ""}`}
          >
            <h2>
              From Paracetamol to Liver Injury — Mechanism and Progression
            </h2>
            <div className="plab-chem-path">
              <span>
                <b>Paracetamol</b>
                <strong>HO⌬—NH—COCH₃</strong>
              </span>
              <em>
                CYP2E1
                <br />→
              </em>
              <span>
                <b>NAPQI</b>
                <strong>O⌬—N═COCH₃</strong>
              </span>
              <em>
                Glutathione
                <br />→
              </em>
              <span>
                <b>Detoxified metabolite</b>
                <strong>HO⌬—NH—SG</strong>
              </span>
            </div>
            <div className="plab-liver-shape">
              <i />
              <i />
              <i />
              <i />
              <b>LIVER</b>
            </div>
            <div className="plab-cell-row">
              <article>
                <h3>Normal hepatocyte</h3>
                <div className="cell normal">◉</div>
                <ul>
                  <li>Adequate glutathione</li>
                  <li>Efficient detoxification</li>
                  <li>No injury</li>
                </ul>
              </article>
              <strong>→</strong>
              <article>
                <h3>Glutathione depletion</h3>
                <div className="cell depleted">◉</div>
                <ul>
                  <li>GSH stores reduced</li>
                  <li>NAPQI binding rises</li>
                  <li>Mitochondrial stress</li>
                </ul>
              </article>
              <strong>→</strong>
              <article>
                <h3>Centrilobular injury</h3>
                <div className="cell injury">◉</div>
                <ul>
                  <li>Zone 3 injury</li>
                  <li>ALT/AST rise</li>
                  <li>Educational progression</li>
                </ul>
              </article>
            </div>
          </section>
          <aside className="plab-tox-right">
            <article>
              <h2>Risk Assessment</h2>
              <div className="plab-risk-grid">
                <span>
                  Estimated NAPQI burden
                  <b className={result.risk.toLowerCase()}>
                    {result.napqiBurden.toFixed(0)}% · {result.risk}
                  </b>
                  <i>
                    <em style={{ width: `${result.napqiBurden}%` }} />
                  </i>
                </span>
                <span>
                  Glutathione reserve<b>{result.gshReserve.toFixed(0)}%</b>
                  <i>
                    <em style={{ width: `${result.gshReserve}%` }} />
                  </i>
                </span>
                <span>
                  Predicted liver-injury risk
                  <b className={result.risk.toLowerCase()}>
                    {result.injuryProbability.toFixed(0)}% · {result.risk}
                  </b>
                  <i>
                    <em style={{ width: `${result.injuryProbability}%` }} />
                  </i>
                </span>
                <span>
                  Liver enzymes (baseline → 24 h)
                  <b>
                    ALT 24 → {result.alt.toFixed(0)} U/L
                    <br />
                    AST 22 → {result.ast.toFixed(0)} U/L
                  </b>
                </span>
              </div>
            </article>
            <article>
              <h2>Safety Pharmacology & Off-Target Risk</h2>
              <div className="plab-offtarget">
                {[
                  ["♡", "hERG (cardiac)", "Low risk"],
                  ["DNA", "Ames", "Negative"],
                  ["LVR", "CYP inhibition", "Low–moderate"],
                  ["REN", "Renal risk", "Low"],
                ].map((x) => (
                  <span key={x[1]}>
                    <i>{x[0]}</i>
                    <b>{x[1]}</b>
                    <em>{x[2]}</em>
                  </span>
                ))}
              </div>
              <div className="plab-warning">
                ⚠ <b>Simulations are educational and not medical guidance.</b>
                <span>
                  Suspected overdose or hepatotoxicity requires urgent clinical
                  assessment and contact with a poison center or emergency
                  department.
                </span>
              </div>
            </article>
          </aside>
        </section>
        <section className="plab-tox-bottom">
          <article>
            <h2>Therapeutic Window & 24 h Exposure</h2>
            <ScientificChart
              data={result.pk.profile.map((p) => ({
                x: p.x,
                y: Math.max(0.01, p.y),
              }))}
              xLabel="Time (hours)"
              yLabel="Plasma concentration"
              label="Simulated paracetamol exposure"
            />
            <b>
              Cmax {result.pk.cmax.toFixed(1)} mg/L at{" "}
              {result.pk.tmax.toFixed(2)} h · modeled educational profile
            </b>
          </article>
          <article>
            <h2>Dose–Response: Efficacy vs Hepatotoxicity</h2>
            <ScientificChart
              data={doseResponse.map((d) => ({ x: d.x, y: d.efficacy }))}
              secondary={doseResponse.map((d) => ({ x: d.x, y: d.injury }))}
              xLabel="Daily dose (g)"
              yLabel="Probability (%)"
              label="Illustrative benefit and liver-risk curves"
            />
            <b>Therapeutic range → increased risk</b>
          </article>
          <article className="plab-benefit">
            <h2>Benefit–Risk Matrix</h2>
            <div>
              <span>
                Favorable
                <br />
                benefit–risk
              </span>
              <span>Use with caution</span>
              <span>Low benefit</span>
              <span>Unfavorable</span>
              <i
                style={{
                  left: `${Math.min(92, 8 + result.injuryProbability * 0.8)}%`,
                  bottom: `${Math.min(90, 8 + result.efficacy * 0.75)}%`,
                }}
              />
            </div>
          </article>
          <article>
            <h2>Common Adverse Events</h2>
            <ul>
              <li>Nausea · ~1–10%</li>
              <li>Vomiting · ~1–10%</li>
              <li>Rash · ~0.1–1%</li>
              <li>Liver enzyme elevation · ~1–10%</li>
              <li>Serious liver injury: rare at therapeutic doses</li>
            </ul>
          </article>
          <article>
            <h2>Acetylcysteine (NAC) Mechanism</h2>
            <div className="plab-nac">
              GSH ✦✦✦ → Hepatocyte
              <br />
              <b>Replenishes glutathione</b>
            </div>
            <p>
              Mechanism education only; no dosing or treatment recommendations
              are provided.
            </p>
          </article>
        </section>
        <section className="plab-tox-actions">
          <div>
            ✓ <b>From molecule to medicine · 8/8 stages complete</b>
            <span>Interactive journey completed.</span>
          </div>
          <button
            onClick={() => {
              setCompare(!compare);
              setMessage(
                compare
                  ? "Comparison closed."
                  : "Therapeutic and selected exposure are now compared.",
              );
            }}
          >
            <Scale />
            Compare scenario
          </button>
          <button
            className="primary"
            onClick={() => {
              setRan(true);
              setMessage(
                `Simulation complete: ${result.risk.toLowerCase()} modeled risk, GSH reserve ${result.gshReserve.toFixed(0)}%.`,
              );
            }}
          >
            <Play />
            Run simulation
          </button>
          <button onClick={reset}>
            <RotateCcw />
            Reset patient
          </button>
          <button
            onClick={() =>
              setMessage("Educational learning report prepared for export.")
            }
          >
            <Download />
            Export learning report
          </button>
          <p role="status">{message}</p>
        </section>
        <footer>
          Pharmaceutical science for a healthier world. · Educational use only.
          Not a clinical recommendation.
        </footer>
      </main>
      {sources && (
        <div className="plab-drawer-backdrop" onClick={() => setSources(false)}>
          <aside className="plab-drawer" onClick={(e) => e.stopPropagation()}>
            <span className="plab-panel-kicker">PAGE 10 PROVENANCE</span>
            <h2>Safety evidence and limitations</h2>
            <a
              href="https://pubchem.ncbi.nlm.nih.gov/compound/1983"
              target="_blank"
              rel="noreferrer"
            >
              Paracetamol · PubChem CID 1983
            </a>
            <p>
              NAPQI/GSH mechanism is evidence-aligned; numerical patient-risk
              outputs are illustrative education, never medical guidance.
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
