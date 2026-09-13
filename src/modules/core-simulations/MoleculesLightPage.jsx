import { useMemo, useState } from "react";
import {
  Activity,
  Atom,
  BookOpen,
  Check,
  ChevronRight,
  Download,
  FlaskConical,
  HelpCircle,
  Lightbulb,
  Pause,
  Play,
  RefreshCw,
  Save,
  Settings,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import {
  MOLECULES,
  TRANSITIONS,
  micrometersFromWavenumber,
  photonFromMicrometers,
  spectrum,
  transmittanceAt,
} from "./moleculesLightModel.js";
import "./MoleculesLightPage.css";
const STEPS = [
    ["home", "Home"],
    ["source", "Light Source"],
    ["response", "Molecular Response"],
    ["scan", "Spectra"],
    ["compare", "Data"],
    ["report", "Report"],
  ],
  initialStep = () =>
    Math.max(
      0,
      STEPS.findIndex(
        ([id]) => id === new URLSearchParams(location.search).get("screen"),
      ),
    ),
  Panel = ({ title, children, className = "" }) => (
    <section className={`ml2-panel ${className}`}>
      <h2>{title}</h2>
      {children}
    </section>
  ),
  Metric = ({ label, value }) => (
    <div className="ml2-metric">
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
const Molecule = ({ id = "CO2", active = false }) => {
  const atoms = {
    CO2: ["O", "C", "O"],
    H2O: ["H", "O", "H"],
    CH4: ["H", "H", "C", "H"],
    O2: ["O", "O"],
    NO2: ["O", "N", "O"],
    O3: ["O", "O", "O"],
  }[id];
  return (
    <div
      className={`ml2-molecule ${id.toLowerCase()} ${active ? "active" : ""}`}
      role="img"
      aria-label={`${id} molecular model`}
    >
      {atoms.map((a, i) => (
        <i className={a} key={i}>
          {a}
        </i>
      ))}
    </div>
  );
};
function Header({ step, go }) {
  return (
    <header className="ml2-head">
      <div>
        <FlaskConical />
        <span>
          <b>Chemistry Virtual Lab</b>
          <small>Explore · Experiment · Understand</small>
        </span>
      </div>
      <nav>
        {STEPS.map(([id, x], i) => (
          <button
            className={step === i ? "active" : ""}
            onClick={() => go(i)}
            key={id}
          >
            {x}
          </button>
        ))}
      </nav>
      <label>
        Progress <progress max="5" value={step} />
        <b>{step * 20}%</b>
      </label>
      <button aria-label="Help">
        <HelpCircle />
      </button>
    </header>
  );
}
const Footer = ({ step, go }) => (
  <footer className="ml2-foot">
    <button disabled={!step} onClick={() => go(step - 1)}>
      ← Previous
    </button>
    <button className="primary" onClick={() => go(step === 5 ? 0 : step + 1)}>
      {step === 5 ? "Restart Lab" : "Continue"} <ChevronRight />
    </button>
  </footer>
);
function Wave({ region = "infrared" }) {
  return (
    <div className={`ml2-wave ${region}`}>
      <svg viewBox="0 0 900 90">
        <path d="M0 45 Q25 2 50 45 T100 45 T150 45 T200 45 T250 45 T300 45 T350 45 T400 45 T450 45 T500 45 T550 45 T600 45 T650 45 T700 45 T750 45 T800 45 T850 45 T900 45" />
      </svg>
    </div>
  );
}
function Home({ wavelength, setWavelength, go }) {
  const p = photonFromMicrometers(wavelength);
  return (
    <main className="ml2-home">
      <section className="home-title">
        <small>MOLECULES & LIGHT</small>
        <h1>
          Tune electromagnetic radiation and observe how molecules absorb,
          rotate, vibrate, and excite electrons.
        </h1>
        <p>
          Adjust the wavelength, explore molecular motion, and compare selective
          absorption across the spectrum.
        </p>
      </section>
      <Panel title="The Electromagnetic Spectrum" className="spectrum-hero">
        <div className="regions">
          <span>Microwave</span>
          <span>Infrared</span>
          <span>Visible</span>
          <span>Ultraviolet</span>
        </div>
        <Wave />
        <label>
          Wavelength (λ)
          <input
            aria-label="Overview wavelength"
            type="range"
            min=".1"
            max="100"
            step=".1"
            value={wavelength}
            onChange={(e) => setWavelength(+e.target.value)}
          />
          <output>{wavelength.toFixed(2)} μm</output>
        </label>
        <div className="molecule-row">
          {[
            ["CO2", "Asymmetric stretch"],
            ["H2O", "Bending vibration"],
            ["O2", "No absorption"],
            ["CH4", "No absorption"],
            ["NO2", "Electronic response"],
          ].map(([id, x]) => (
            <article key={id}>
              <Molecule id={id} active={id === "CO2" || id === "H2O"} />
              <b>{id}</b>
              <small>{x}</small>
            </article>
          ))}
        </div>
      </Panel>
      <aside>
        <Panel title="Key Concept">
          <p className="equation">E = hν = hc/λ</p>
          <Metric
            label="Frequency"
            value={`${(p.frequency / 1e13).toFixed(2)} × 10¹³ Hz`}
          />
          <Metric label="Photon energy" value={`${p.energyEv.toFixed(3)} eV`} />
          <Metric
            label="Wavenumber"
            value={`${p.wavenumber.toFixed(0)} cm⁻¹`}
          />
        </Panel>
        <Panel title="Lab Details">
          <Metric label="Duration" value="25–35 min" />
          <Metric label="Level" value="Intermediate" />
          <button className="primary" onClick={() => go(1)}>
            <Play /> Start Exploring Light
          </button>
        </Panel>
      </aside>
      <section className="mode-cards">
        {Object.values(TRANSITIONS).map((t) => (
          <article key={t.label} style={{ "--c": t.color }}>
            <Wave region={t.label.toLowerCase()} />
            <b>
              {t.label}
              <br />
              {t.response}
            </b>
            <small>{t.transition}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
function Source({
  wavelength,
  setWavelength,
  molecule,
  setMolecule,
  intensity,
  setIntensity,
  fired,
  setFired,
  go,
}) {
  const p = photonFromMicrometers(wavelength),
    target = MOLECULES[molecule],
    near = target.bands.some((b) => Math.abs(b.wn - p.wavenumber) < 60);
  return (
    <main className="ml2-source">
      <section className="step-title">
        <small>SCREEN 2 OF 6</small>
        <h1>Tune the Light Source</h1>
      </section>
      <Panel title="Light Source" className="source-controls">
        <label>
          Electromagnetic region
          <select>
            <option>Infrared</option>
            <option>Microwave</option>
            <option>Visible</option>
            <option>Ultraviolet</option>
          </select>
        </label>
        <label>
          Wavelength <output>{wavelength.toFixed(2)} μm</output>
          <input
            aria-label="Source wavelength"
            type="range"
            min="2"
            max="20"
            step=".01"
            value={wavelength}
            onChange={(e) => setWavelength(+e.target.value)}
          />
        </label>
        <Metric
          label="Frequency"
          value={`${(p.frequency / 1e13).toFixed(2)} × 10¹³ Hz`}
        />
        <Metric label="Photon energy" value={`${p.energyEv.toFixed(3)} eV`} />
        <Metric label="Wavenumber" value={`${p.wavenumber.toFixed(0)} cm⁻¹`} />
      </Panel>
      <Panel
        title="Tunable Infrared Light Source and Molecular Chamber"
        className="instrument"
      >
        <div className="lamp">
          TUNABLE
          <br />
          IR SOURCE
        </div>
        <Wave />
        <div className="chamber">
          <Molecule id={molecule} active={fired && near} />
          <b>
            {fired
              ? near
                ? "ABSORPTION DETECTED"
                : "PHOTON TRANSMITTED"
              : "READY"}
          </b>
        </div>
        <p>
          λ = {wavelength.toFixed(2)} μm ·{" "}
          {near ? "resonant with an allowed transition" : "off resonance"}
        </p>
      </Panel>
      <Panel title="Molecule Presets" className="presets">
        {Object.entries(MOLECULES).map(([id, m]) => (
          <button
            key={id}
            className={molecule === id ? "selected" : ""}
            onClick={() => {
              setMolecule(id);
              if (m.bands[0])
                setWavelength(micrometersFromWavenumber(m.bands[0].wn));
            }}
          >
            <Molecule id={id} />
            <b>{m.formula}</b>
            <small>{m.bands[0]?.assignment || "No IR absorption"}</small>
          </button>
        ))}
      </Panel>
      <Panel title="Instrument Controls">
        <label>
          Intensity <output>{intensity}%</output>
          <input
            aria-label="Source intensity"
            type="range"
            min="0"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(+e.target.value)}
          />
        </label>
        <button className="primary" onClick={() => setFired(true)}>
          <Play /> Fire Photon
        </button>
        <button onClick={() => go(3)}>
          <Activity /> Scan Wavelength
        </button>
      </Panel>
      <Panel title="Photon Energy Relationship" className="relationship">
        <p className="equation">E = hν = hc/λ</p>
        <Metric label="E" value={`${p.energyEv.toFixed(3)} eV`} />
        <Metric label="ν" value={`${p.frequency.toExponential(2)} Hz`} />
        <Metric label="λ" value={`${wavelength.toFixed(2)} μm`} />
      </Panel>
    </main>
  );
}
function Response({
  wavelength,
  setWavelength,
  played,
  setPlayed,
  recorded,
  setRecorded,
}) {
  const p = photonFromMicrometers(wavelength),
    co2 = Math.abs(p.wavenumber - 2349) < 70;
  return (
    <main className="ml2-response">
      <Panel title="Radiation Source" className="response-controls">
        <button className="selected">IR</button>
        <button>Visible</button>
        <button>UV</button>
        <label>
          Wavelength (μm)
          <input
            aria-label="Response wavelength"
            type="number"
            value={wavelength}
            onChange={(e) => setWavelength(+e.target.value)}
          />
        </label>
        <Metric label="Wavenumber" value={`${p.wavenumber.toFixed(0)} cm⁻¹`} />
        <Metric
          label="Photon energy"
          value={`${p.energyJ.toExponential(2)} J`}
        />
        <h3>Visualization Options</h3>
        {[
          "Slow motion",
          "Show dipole-change vectors",
          "Show before/after positions",
        ].map((x) => (
          <label key={x}>
            <input type="checkbox" defaultChecked /> {x}
          </label>
        ))}
      </Panel>
      <Panel title="Molecular Chamber (Side View)" className="response-chamber">
        <div className="photon">4.26 μm IR photons　~~~➜</div>
        {[
          ["CO2", "Asymmetric stretch"],
          ["H2O", "Bending mode"],
          ["CH4", "No resonant vibration"],
          ["O2", "No IR activity"],
        ].map(([id, x]) => (
          <article key={id}>
            <Molecule id={id} active={played && id === "CO2" && co2} />
            <b>{id}</b>
            <span>{x}</span>
          </article>
        ))}
      </Panel>
      <Panel
        title={`Molecular Response at ${wavelength.toFixed(2)} μm`}
        className="response-table"
      >
        <table>
          <thead>
            <tr>
              <th>Molecule</th>
              <th>Symmetry</th>
              <th>Active mode</th>
              <th>Absorbed?</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(MOLECULES)
              .slice(0, 4)
              .map(([id, m]) => (
                <tr key={id}>
                  <td>{m.formula}</td>
                  <td>{m.point}</td>
                  <td>{m.bands[0]?.assignment || "None"}</td>
                  <td>{id === "CO2" && co2 ? "Yes" : "No"}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <p className="notice">
          <Lightbulb /> A vibrational mode is IR active only when it changes the
          molecular dipole moment.
        </p>
      </Panel>
      <Panel title="Energy-Level Diagram">
        <div className="levels">
          <span>v = 1</span>
          <i>↑ ΔE = hν</i>
          <span>v = 0</span>
        </div>
      </Panel>
      <Panel title="Simulation Controls">
        <button onClick={() => setPlayed(true)}>Step One Photon</button>
        <button className="primary" onClick={() => setPlayed(!played)}>
          {played ? <Pause /> : <Play />} {played ? "Pause Beam" : "Play Beam"}
        </button>
        <button onClick={() => setRecorded(true)}>
          <Save /> Record Observation
        </button>
        {recorded && (
          <p className="success">
            <Check /> Observation recorded
          </p>
        )}
      </Panel>
    </main>
  );
}
function SpectrumPlot({ molecule = "CO2", concentration = 400, path = 10 }) {
  const pts = useMemo(
    () =>
      spectrum(molecule, concentration, path)
        .map((p, i) => `${55 + i * 3.05},${35 + (100 - p.transmittance) * 2}`)
        .join(" "),
    [molecule, concentration, path],
  );
  return (
    <svg
      className="ml2-chart"
      viewBox="0 0 650 270"
      role="img"
      aria-label={`${molecule} infrared transmittance spectrum`}
    >
      <line x1="55" x2="605" y1="235" y2="235" />
      <line x1="55" x2="55" y1="25" y2="235" />
      <polyline points={pts} />
      <text x="240" y="263">
        Wavenumber (cm⁻¹)
      </text>
      <text x="170" y="60">
        2349 cm⁻¹ · 4.26 μm
      </text>
      <text x="500" y="140">
        667 cm⁻¹
      </text>
    </svg>
  );
}
function Scan({
  concentration,
  setConcentration,
  path,
  setPath,
  scanned,
  setScanned,
  overlays,
  setOverlays,
}) {
  const r = transmittanceAt(2349, "CO2", concentration, path);
  return (
    <main className="ml2-scan">
      <Panel title="Instrument Setup" className="scan-instrument">
        <div className="scanline">
          IR SOURCE ━━━ [ CO₂ GAS CELL ] ━━━ △ MONOCHROMATOR ━━━ ◉ DETECTOR
        </div>
      </Panel>
      <Panel title="Sample & Conditions">
        <label>
          Gas
          <select>
            <option>CO₂ (carbon dioxide)</option>
          </select>
        </label>
        <label>
          Concentration
          <input
            aria-label="Gas concentration"
            type="number"
            value={concentration}
            onChange={(e) => setConcentration(+e.target.value)}
          />{" "}
          ppm
        </label>
        <label>
          Path length
          <input
            aria-label="Gas path length"
            type="number"
            value={path}
            onChange={(e) => setPath(+e.target.value)}
          />{" "}
          cm
        </label>
      </Panel>
      <Panel title="Overlay Comparison">
        <label>
          <input type="checkbox" checked readOnly /> CO₂
        </label>
        <label>
          <input
            type="checkbox"
            checked={overlays}
            onChange={(e) => setOverlays(e.target.checked)}
          />{" "}
          H₂O
        </label>
        <label>
          <input type="checkbox" /> CH₄
        </label>
      </Panel>
      <Panel title="IR Absorption Spectrum" className="scan-chart">
        <SpectrumPlot concentration={concentration} path={path} />
        {scanned && (
          <p className="success">
            <Check /> Full scan completed · 2 peaks identified
          </p>
        )}
      </Panel>
      <Panel title="Peak Table (CO₂)" className="peak-table">
        <table>
          <thead>
            <tr>
              <th>Wavenumber</th>
              <th>Wavelength</th>
              <th>Assignment</th>
              <th>Intensity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2349 cm⁻¹</td>
              <td>4.26 μm</td>
              <td>Asymmetric stretch</td>
              <td>Strong</td>
            </tr>
            <tr>
              <td>667 cm⁻¹</td>
              <td>15.0 μm</td>
              <td>Bend</td>
              <td>Strong</td>
            </tr>
          </tbody>
        </table>
        <h3>Lambert–Beer Analysis</h3>
        <Metric label="Absorbance" value={r.absorbance.toFixed(2)} />
        <Metric
          label="Transmittance"
          value={`${r.transmittance.toFixed(1)}%`}
        />
      </Panel>
      <Panel title="Spectrum Controls">
        <button className="primary" onClick={() => setScanned(true)}>
          <Play /> Run Full Scan
        </button>
        <button onClick={() => setOverlays(true)}>+ Add Overlay</button>
        <button>
          <Download /> Export Spectrum
        </button>
      </Panel>
    </main>
  );
}
function Compare({ animated, setAnimated }) {
  return (
    <main className="ml2-compare">
      <section className="step-title">
        <h1>Compare Radiation Effects</h1>
        <p>
          Same photon flux, different energies, different molecular responses.
        </p>
      </section>
      <section className="radiation-cards">
        {Object.entries(TRANSITIONS).map(([id, t]) => (
          <article key={id} style={{ "--c": t.color }}>
            <h2>
              {t.label} ({t.response})
            </h2>
            <Metric label="Molecule" value={t.molecule} />
            <Metric label="Transition" value={t.transition} />
            <Metric
              label="Wavelength"
              value={
                t.wavelengthM >= 0.001
                  ? `${(t.wavelengthM * 100).toFixed(2)} cm`
                  : t.wavelengthM >= 1e-6
                    ? `${(t.wavelengthM * 1e6).toFixed(2)} μm`
                    : `${(t.wavelengthM * 1e9).toFixed(0)} nm`
              }
            />
            <Metric label="Energy" value={`${t.energyEv} eV`} />
            <Molecule
              id={
                id === "microwave"
                  ? "H2O"
                  : id === "infrared"
                    ? "CO2"
                    : id === "visible"
                      ? "NO2"
                      : "O3"
              }
              active={animated}
            />
            <p className="success">
              <Check /> Radiation absorbed
            </p>
          </article>
        ))}
      </section>
      <Panel title="Energy Level Comparison">
        <div className="energy-bars">
          {Object.values(TRANSITIONS).map((t) => (
            <i
              key={t.label}
              style={{
                height: `${25 + Math.log10(t.energyEv / 0.0001) * 35}px`,
                background: t.color,
              }}
            >
              <b>{t.energyEv} eV</b>
            </i>
          ))}
        </div>
      </Panel>
      <Panel title="Quantitative Comparison" className="comparison-table">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Frequency</th>
              <th>Energy</th>
              <th>Response</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(TRANSITIONS).map((t) => (
              <tr key={t.label}>
                <td>{t.label}</td>
                <td>{(299792458 / t.wavelengthM).toExponential(2)} Hz</td>
                <td>{t.energyEv} eV</td>
                <td>{t.response}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="Atmospheric & Real-World Applications">
        <p>
          <b>Greenhouse effect:</b> CO₂ and H₂O absorb IR radiation.
        </p>
        <p>
          <b>Ozone shielding:</b> O₃ absorbs harmful UV near 254 nm.
        </p>
        <p>
          <b>Remote sensing:</b> spectral signatures identify atmospheric gases.
        </p>
      </Panel>
      <button className="primary animate" onClick={() => setAnimated(true)}>
        <Play /> Compare Animation
      </button>
    </main>
  );
}
function Report({ reset }) {
  const [answers, setAnswers] = useState({}),
    score = [answers.energy, answers.ir, answers.uv].filter(Boolean).length,
    exportCsv = () => {
      const data =
          "radiation,molecule,transition,energy_eV\n" +
          Object.values(TRANSITIONS)
            .map(
              (t) => `${t.label},${t.molecule},${t.transition},${t.energyEv}`,
            )
            .join("\n"),
        u = URL.createObjectURL(new Blob([data], { type: "text/csv" })),
        a = document.createElement("a");
      a.href = u;
      a.download = "molecules-light-results.csv";
      a.click();
      URL.revokeObjectURL(u);
    };
  return (
    <main className="ml2-report">
      <section className="report-title">
        <Trophy />
        <div>
          <small>INVESTIGATION COMPLETE</small>
          <h1>Spectroscopy Report & Assessment</h1>
          <p>
            Summarize results, draw conclusions, and complete the assessment.
          </p>
        </div>
      </section>
      <section className="report-metrics">
        <Metric label="Scans Collected" value="4" />
        <Metric label="Molecules Investigated" value="5" />
        <Metric label="Peaks Identified" value="6" />
        <Metric label="Accuracy" value={score === 3 ? "95%" : "In progress"} />
      </section>
      <Panel title="IR Spectrum: CO₂">
        <SpectrumPlot />
      </Panel>
      <Panel title="Energy Level Diagram">
        <div className="report-levels">
          UV electronic — O₃
          <br />
          Visible electronic — NO₂
          <br />
          IR vibrational — CO₂
          <br />
          Microwave rotational — H₂O
        </div>
      </Panel>
      <Panel title="Molecular Responses to Light" className="report-molecules">
        {[
          ["H2O", "Rotation"],
          ["CO2", "Vibration"],
          ["NO2", "Electronic"],
          ["O3", "Photodissociation"],
        ].map(([id, x]) => (
          <article key={id}>
            <Molecule id={id} />
            <b>{id}</b>
            <span>{x}</span>
          </article>
        ))}
      </Panel>
      <Panel title="Results Summary" className="comparison-table">
        <table>
          <tbody>
            {Object.values(TRANSITIONS).map((t) => (
              <tr key={t.label}>
                <td>{t.label}</td>
                <td>{t.molecule}</td>
                <td>{t.transition}</td>
                <td>{t.energyEv} eV</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <Panel title="Your Report">
        <h3>Aim</h3>
        <p>
          Investigate how different molecules absorb light at characteristic
          wavelengths.
        </p>
        <h3>Evidence</h3>
        <p>
          CO₂ absorbs at 2349 and 667 cm⁻¹; visible and UV photons access
          electronic or dissociative states.
        </p>
        <h3>Conclusion</h3>
        <p>
          Absorption occurs when photon energy matches an allowed molecular
          transition and its selection rule.
        </p>
      </Panel>
      <Panel title="Knowledge Check" className="knowledge">
        <button onClick={() => setAnswers({ ...answers, energy: true })}>
          500 nm photon: 2.48 eV
        </button>
        <button onClick={() => setAnswers({ ...answers, ir: true })}>
          IR active: changing dipole moment
        </button>
        <button onClick={() => setAnswers({ ...answers, uv: true })}>
          UV can reach dissociative states
        </button>
        <b>
          <Check /> {score} / 3 correct
        </b>
      </Panel>
      <section className="report-actions">
        <button onClick={() => print()}>
          <Download /> PDF Report
        </button>
        <button onClick={exportCsv}>
          <Download /> Export CSV
        </button>
        <button className="primary" onClick={reset}>
          <RefreshCw /> Restart Lab
        </button>
      </section>
    </main>
  );
}
export default function MoleculesLightPage() {
  const [step, setStep] = useState(initialStep),
    [wavelength, setWavelength] = useState(4.26),
    [molecule, setMolecule] = useState("CO2"),
    [intensity, setIntensity] = useState(60),
    [fired, setFired] = useState(false),
    [played, setPlayed] = useState(false),
    [recorded, setRecorded] = useState(false),
    [concentration, setConcentration] = useState(400),
    [path, setPath] = useState(10),
    [scanned, setScanned] = useState(false),
    [overlays, setOverlays] = useState(true),
    [animated, setAnimated] = useState(false);
  const go = (n) => {
      n = Math.max(0, Math.min(5, n));
      setStep(n);
      const u = new URL(location.href);
      u.searchParams.set("screen", STEPS[n][0]);
      history.replaceState({}, "", u);
      scrollTo(0, 0);
    },
    reset = () => {
      setWavelength(4.26);
      setMolecule("CO2");
      setIntensity(60);
      setFired(false);
      setPlayed(false);
      setRecorded(false);
      setConcentration(400);
      setPath(10);
      setScanned(false);
      setOverlays(true);
      setAnimated(false);
      go(0);
    };
  return (
    <div className={`ml2-app screen-${STEPS[step][0]}`}>
      <Header step={step} go={go} />
      {step === 0 && <Home {...{ wavelength, setWavelength, go }} />}
      {step === 1 && (
        <Source
          {...{
            wavelength,
            setWavelength,
            molecule,
            setMolecule,
            intensity,
            setIntensity,
            fired,
            setFired,
            go,
          }}
        />
      )}
      {step === 2 && (
        <Response
          {...{
            wavelength,
            setWavelength,
            played,
            setPlayed,
            recorded,
            setRecorded,
          }}
        />
      )}
      {step === 3 && (
        <Scan
          {...{
            concentration,
            setConcentration,
            path,
            setPath,
            scanned,
            setScanned,
            overlays,
            setOverlays,
          }}
        />
      )}
      {step === 4 && <Compare {...{ animated, setAnimated }} />}
      {step === 5 && <Report reset={reset} />}
      <Footer {...{ step, go }} />
    </div>
  );
}
