import { useMemo, useState } from "react";
import {
  Activity,
  Atom,
  BookOpen,
  CircleHelp,
  FlaskConical,
  Globe2,
  Network,
  Pause,
  Play,
  Settings,
  Sun,
} from "lucide-react";
import "./MoleculesLightPage.css";

const molecules = {
  CO2: {
    formula: "CO₂",
    name: "Carbon dioxide",
    atoms: ["O", "C", "O"],
    peak: 4.26,
    mode: "Asymmetric stretch",
    relevance:
      "Strongly absorbs Earth’s outgoing infrared radiation. Key greenhouse gas.",
    modes: ["Symmetric stretch", "Asymmetric stretch", "Bending"],
    peaks: [2.7, 4.26, 15, 67, 155, 365],
    modePeaks: { "Symmetric stretch": 2.7, "Asymmetric stretch": 4.26, Bending: 15 },
  },
  H2O: {
    formula: "H₂O",
    name: "Water",
    atoms: ["H", "O", "H"],
    bent: true,
    peak: 2.74,
    mode: "Symmetric stretch",
    relevance: "A broad infrared absorber central to atmospheric heat balance.",
    modes: ["Symmetric stretch", "Asymmetric stretch", "Bending"],
    peaks: [2.66, 2.74, 6.27, 35, 180],
    modePeaks: { "Symmetric stretch": 2.74, "Asymmetric stretch": 2.66, Bending: 6.27 },
  },
  CH4: {
    formula: "CH₄",
    name: "Methane",
    atoms: ["H", "H", "C", "H", "H"],
    cross: true,
    peak: 3.31,
    mode: "Asymmetric stretch",
    relevance:
      "Absorbs strongly in the infrared and contributes to greenhouse warming.",
    modes: ["Symmetric stretch", "Asymmetric stretch", "Bending"],
    peaks: [3.31, 7.66, 18, 80, 240],
    modePeaks: { "Symmetric stretch": 3.31, "Asymmetric stretch": 3.31, Bending: 7.66 },
  },
  O3: {
    formula: "O₃",
    name: "Ozone",
    atoms: ["O", "O", "O"],
    bent: true,
    peak: 9.6,
    mode: "Asymmetric stretch",
    relevance:
      "Absorbs ultraviolet radiation and also has a strong infrared band.",
    modes: ["Symmetric stretch", "Asymmetric stretch", "Bending"],
    peaks: [4.7, 9.6, 14.3, 55, 210],
    modePeaks: { "Symmetric stretch": 14.3, "Asymmetric stretch": 9.6, Bending: 14.3 },
  },
};
const atmosphericBands = {
  CO2: [['4.26 μm', 'Asymmetric stretch', 'High'], ['15.0 μm', 'Bending', 'Very high']],
  H2O: [['2.74 μm', 'Symmetric stretch', 'Broad'], ['6.27 μm', 'Bending', 'Broad']],
  CH4: [['3.31 μm', 'Asymmetric stretch', 'High'], ['7.66 μm', 'Bending', 'Medium']],
  O3: [['9.60 μm', 'Asymmetric stretch', 'High'], ['0.25 μm', 'Electronic absorption', 'UV'] ],
};
const colors = { H: "#eef5ff", C: "#303741", O: "#ef2529" };
const sliderToWavelength = (value) => 10 ** (3 - (Number(value) / 100) * 6);
const wavelengthToSlider = (wavelength) =>
  ((3 - Math.log10(wavelength)) / 6) * 100;
const gaussian = (x, center, width = 0.04) =>
  Math.exp(-((Math.log10(x) - Math.log10(center)) ** 2) / (2 * width ** 2));

function MiniMolecule({ molecule, mode = "" }) {
  return (
    <span
      className={`ml-mini ${molecule.bent ? "bent" : ""} ${molecule.cross ? "cross" : ""} ${mode}`}
    >
      {molecule.atoms.map((atom, index) => (
        <i key={`${atom}-${index}`} style={{ "--atom-color": colors[atom] }} />
      ))}
    </span>
  );
}
function MoleculeStage({ molecule, absorbing, slow }) {
  return (
    <div
      className={`ml-stage-molecule ${molecule.bent ? "bent" : ""} ${molecule.cross ? "cross" : ""} ${absorbing ? "absorbing" : ""} ${slow ? "slow" : ""}`}
    >
      {molecule.atoms.map((atom, index) => (
        <span key={`${atom}-${index}`} style={{ "--atom-color": colors[atom] }}>
          {atom}
        </span>
      ))}
    </div>
  );
}

export default function MoleculesLightPage() {
  const [moleculeId, setMoleculeId] = useState("CO2"),
    [slider, setSlider] = useState(wavelengthToSlider(4.26)),
    [intensity, setIntensity] = useState(70),
    [slow, setSlow] = useState(true),
    [field, setField] = useState(true),
    [running, setRunning] = useState(true),
    [view, setView] = useState("Explore"),
    [activeMode, setActiveMode] = useState(null);
  const molecule = molecules[moleculeId],
    wavelength = sliderToWavelength(slider),
    energy = 1.239841984 / wavelength,
    absorbance = gaussian(wavelength, molecule.peak, 0.055),
    absorbedFraction = Math.min(1, absorbance * (intensity / 100)),
    absorbing = running && absorbance > 0.55,
    response = absorbing ? "Photon absorbed" : "Photon transmitted",
    selectedMode = absorbing ? (activeMode || molecule.mode) : "No resonant mode";
  const spectrumPoints = useMemo(
    () =>
      Array.from({ length: 240 }, (_, index) => {
        const x = index / 239,
          w = 10 ** (-1 + x * 4),
          y = Math.min(
            1,
            molecule.peaks.reduce(
              (sum, peak) => sum + gaussian(w, peak, 0.035),
              0,
            ),
          );
        return `${55 + x * 900},${142 - y * 105}`;
      }).join(" "),
    [molecule],
  );
  const reset = () => {
    setMoleculeId("CO2");
    setSlider(wavelengthToSlider(4.26));
    setIntensity(70);
    setSlow(true);
    setField(true);
    setRunning(true);
    setActiveMode(null);
  };
  return (
    <div className="ml-app">
      <header>
        <Atom />
        <h1>Molecules &amp; Light</h1>
        <span className="ml-headline">
          EXPLORE HOW MOLECULES INTERACT WITH
          <br />
          ELECTROMAGNETIC RADIATION
        </span>
        <p>MOLECULES ABSORB LIGHT　•　LIGHT REVEALS A BRIGHTER PLANET</p>
        <Sun />
      </header>
      <aside>
        {[
          [FlaskConical, "Explore"],
          [Network, "Molecules"],
          [Activity, "Spectra"],
          [Globe2, "Atmosphere"],
          [BookOpen, "Learn"],
        ].map(([Icon, label]) => (
          <button
            key={label}
            className={view === label ? "active" : ""}
            aria-pressed={view === label}
            aria-label={`${label} view`}
            onClick={() => setView(label)}
          >
            <Icon />
            {label}
          </button>
        ))}
        <div className="ml-side-bottom">
          <button onClick={() => setView("Settings")}>
            <Settings />
            Settings
          </button>
          <button onClick={() => setView("Help")}>
            <CircleHelp />
            Help
          </button>
          <small>
            SCIENCE
            <br />
            CONNECTS
            <br />
            US
          </small>
        </div>
      </aside>
      <main className={`ml-main ml-view-${view.toLowerCase().replace(/\s+/g, "-")}`}>
        <section className="ml-selector">
          <b>Select molecule:</b>
          {Object.entries(molecules).map(([id, item]) => (
            <button
              key={id}
              className={moleculeId === id ? "active" : ""}
              onClick={() => {
                setMoleculeId(id);
                setSlider(wavelengthToSlider(item.peak));
              }}
            >
              <MiniMolecule molecule={item} />
              <strong>{item.formula}</strong>
              <small>{item.name}</small>
            </button>
          ))}
          <nav className="ml-view-tabs" aria-label="Simulation views">
            {["Explore", "Molecules", "Spectra", "Atmosphere", "Learn"].map((label) => (
              <button
                key={label}
                type="button"
                className={view === label ? "active" : ""}
                aria-pressed={view === label}
                onClick={() => setView(label)}
              >
                {label}
              </button>
            ))}
          </nav>
        </section>
        <section className="ml-experiment">
          <h2>Infrared absorption</h2>
          <p>Shine light on a molecule and watch it respond in real time.</p>
          <span className="ml-live">●　Real-time simulation</span>
          {view === "Spectra" && <div className="ml-view-banner">Spectrum focus · tune wavelength to locate absorption peaks.</div>}
          {view === "Atmosphere" && <div className="ml-view-banner">Atmosphere focus · compare how {molecule.formula} contributes to radiative forcing.</div>}
          <div className="ml-source">
            <i />
            <b>
              Incoming light
              <br />
              {wavelength.toFixed(2)} μm<small>(infrared)</small>
            </b>
          </div>
          <div
            className={`ml-beam ${running ? "running" : ""}`}
            style={{ "--beam-opacity": intensity / 100 }}
          />
          <div className="ml-mode">{selectedMode}</div>
          <MoleculeStage
            molecule={molecule}
            absorbing={absorbing}
            slow={slow}
          />
          <b className="ml-molecule-label">
            {molecule.formula}
            <small>{absorbing ? "(vibrating)" : "(stable)"}</small>
          </b>
          <div className="ml-absorbed">
            <b>{response}</b>
            <span>ΔE = {energy.toFixed(3)} eV</span>
            <span>Absorbed intensity = {(absorbedFraction * 100).toFixed(0)}%</span>
          </div>
          <div className="ml-detector">
            <i />
            <b>
              Detector
              <small>{absorbing ? `(${((1 - absorbedFraction) * 100).toFixed(0)}% signal)` : "(full signal)"}</small>
            </b>
          </div>
          <button
            className="ml-play"
            onClick={() => setRunning((value) => !value)}
            aria-label={running ? "Pause light" : "Play light"}
          >
            {running ? <Pause /> : <Play />}
          </button>
        </section>
        <section className="ml-tuning">
          <div className="ml-wave-control">
            <h3>Tune wavelength</h3>
            <div className="ml-region-labels">
              <span>Microwave</span>
              <span>Infrared</span>
              <span>Visible</span>
              <span>Ultraviolet</span>
            </div>
            <input
              aria-label="Wavelength"
              type="range"
              min="0"
              max="100"
              step=".05"
              value={slider}
              onChange={(event) => setSlider(Number(event.target.value))}
            />
            <strong>‹　 {wavelength.toFixed(2)} μm　 ›</strong>
            <div className="ml-log-labels">
              <span>10³ μm</span>
              <span>10²</span>
              <span>10¹</span>
              <span>1</span>
              <span>10⁻¹</span>
              <span>10⁻²</span>
              <span>10⁻³</span>
            </div>
          </div>
          <div className="ml-intensity">
            <label>
              Intensity <span>☀</span>
              <input
                aria-label="Intensity"
                type="range"
                min="10"
                max="100"
                value={intensity}
                onChange={(event) => setIntensity(Number(event.target.value))}
              />
              <b>{intensity}%</b>
            </label>
            <button
              className={slow ? "on" : ""}
              onClick={() => setSlow((value) => !value)}
            >
              <i />
              Slow motion <b>5×</b>
            </button>
            <button
              className={field ? "on" : ""}
              onClick={() => setField((value) => !value)}
            >
              <i />
              Show electric field
            </button>
          </div>
          <div className={`ml-field ${field ? "visible" : ""}`}>
            <b>Electric field (E)</b>
            <svg viewBox="0 0 240 105" preserveAspectRatio="none">
              <path d="M4 54 C18 5,30 5,44 54 S70 103,84 54 S110 5,124 54 S150 103,164 54 S190 5,204 54 S230 103,238 54" />
            </svg>
            <span>λ = {wavelength.toFixed(2)} μm</span>
          </div>
        </section>
        <section className="ml-response">
          <h2>Molecular response</h2>
          <div className="ml-response-title">
            <strong>{molecule.formula}</strong>
            {molecule.name}
            <MiniMolecule molecule={molecule} />
          </div>
          <dl>
            <dt>Vibrational mode</dt>
            <dd>{molecule.mode}</dd>
            <dt>Wavelength (peak)</dt>
            <dd>{molecule.peak} μm</dd>
            <dt>Energy transition</dt>
            <dd>
              v = 0 → 1<br />
              ΔE = {(1.239841984 / molecule.peak).toFixed(3)} eV
            </dd>
            <dt>Selection rule</dt>
            <dd>
              Δv = ±1
              <br />
              Vibration changes dipole moment (IR active).
            </dd>
            <dt>Atmospheric relevance</dt>
            <dd>{molecule.relevance}</dd>
          </dl>
          <h3>Normal modes ({molecule.formula})</h3>
          <div className="ml-modes">
            {molecule.modes.map((mode) => (
              <button
                key={mode}
                className={mode === molecule.mode ? "active" : ""}
                onClick={() => {
                  setActiveMode(mode);
                  setSlider(wavelengthToSlider(molecule.modePeaks?.[mode] || molecule.peak));
                  setRunning(true);
                }}
              >
                <MiniMolecule
                  molecule={molecule}
                  mode={mode === "Bending" ? "bend" : "stretch"}
                />
                <b>{mode}</b>
                <small>
                  {mode === "Symmetric stretch" && moleculeId === "CO2"
                    ? "(IR inactive)"
                    : "(IR active)"}
                </small>
              </button>
            ))}
          </div>
          <button className="ml-reset" onClick={reset}>
            Reset experiment
          </button>
          {view === "Atmosphere" && <div className="ml-atmosphere"><h3>Atmospheric bands</h3><p>Absorption bands for {molecule.formula} that influence radiative energy transfer.</p>{atmosphericBands[moleculeId].map(([band, mode, strength]) => <div className="ml-band" key={band}><b>{band}</b><span>{mode}</span><em>{strength}</em></div>)}</div>}
          {view === "Spectra" && <div className="ml-spectra-readout"><h3>Spectrum cursor</h3><b>{wavelength.toFixed(2)} μm</b><span>{absorbance > 0.55 ? "Resonant absorption" : "Off-resonance transmission"}</span></div>}
        </section>
        <section className={`ml-spectrum ${view === "Spectra" ? "focus" : ""}`}>
          <h2>Absorption spectrum ({molecule.formula})</h2>
          <svg viewBox="0 0 1000 170" preserveAspectRatio="none">
            <g className="grid">
              <path d="M55 18V142H955 M55 78H955 M55 18H955" />
            </g>
            <polyline points={spectrumPoints} />
            <line
              x1={55 + ((Math.log10(wavelength) + 1) / 4) * 900}
              x2={55 + ((Math.log10(wavelength) + 1) / 4) * 900}
              y1="18"
              y2="142"
            />
            <text x="6" y="24">
              1.0
            </text>
            <text x="6" y="82">
              0.5
            </text>
            <text x="6" y="146">
              0.0
            </text>
            <text x="45" y="162">
              0.1
            </text>
            <text x="275" y="162">
              1
            </text>
            <text x="495" y="162">
              10
            </text>
            <text x="715" y="162">
              100
            </text>
            <text x="925" y="162">
              1000
            </text>
          </svg>
          <p>
            This peak at <b>{molecule.peak} μm</b> corresponds to the{" "}
            {molecule.mode.toLowerCase()} vibration of {molecule.formula}, where
            the molecule absorbs infrared light most strongly.
          </p>
        </section>
      </main>
    </div>
  );
}
