import { useMemo, useState } from "react";
import {
  Accessibility,
  Atom,
  Box,
  ChevronDown,
  Database,
  FlaskConical,
  Home,
  LockKeyhole,
  Maximize2,
  MousePointer2,
  RotateCcw,
  Ruler,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Volume2,
  ZoomIn,
} from "lucide-react";
import "./settingsTarget.css";

const nav = [
  ["Home", Home, "dashboard"],
  ["Molecules", Atom, "molecule"],
  ["Reactions", SlidersHorizontal, "balancer"],
  ["Lab Tools", FlaskConical, "lab"],
  ["Data", Database, "favorites"],
  ["Learn", Box, "syllabus"],
  ["Settings", Settings, "settings"],
];
const modes = [
  ["Ball and Stick", "ball"],
  ["Space Fill", "space"],
  ["Sticks", "sticks"],
  ["Wireframe", "wire"],
  ["Electron Density", "density"],
];

function Toggle({ checked, onChange, label, help }) {
  return (
    <div className="st-toggle-row">
      <div>
        <b>{label}</b>
        {help && <small>{help}</small>}
      </div>
      <button
        className={`st-toggle ${checked ? "on" : ""}`}
        role="switch"
        aria-checked={checked}
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
function Field({ label, children }) {
  return (
    <label className="st-field">
      <span>{label}</span>
      <div className="st-select">
        {children}
        <ChevronDown size={15} />
      </div>
    </label>
  );
}
function Section({ icon: Icon, title, children }) {
  return (
    <section className="st-section">
      <h2>
        <Icon size={24} />
        {title}
      </h2>
      <div className="st-section-body">{children}</div>
    </section>
  );
}

export const SettingsPage = ({
  isDark,
  onThemeToggle,
  compact,
  onCompactToggle,
  reducedMotion,
  onReducedMotionToggle,
  highContrast,
  onHighContrastToggle,
  onColorThemeChange,
  language,
  onLanguageChange,
  onResetData,
  onNavigate,
}) => {
  const [quality, setQuality] = useState("High");
  const [colors, setColors] = useState("CPK (Jmol)");
  const [renderMode, setRenderMode] = useState("Ball and Stick");
  const [labels, setLabels] = useState(true);
  const [density, setDensity] = useState("Off");
  const [opacity, setOpacity] = useState(50);
  const [speed, setSpeed] = useState(55);
  const [units, setUnits] = useState("SI (m, g, mol, K, Pa)");
  const [temp, setTemp] = useState("Kelvin (K)");
  const [figures, setFigures] = useState("3");
  const [safeColors, setSafeColors] = useState(true);
  const [narration, setNarration] = useState(true);
  const [keyboard, setKeyboard] = useState(true);
  const [usage, setUsage] = useState(true);
  const [saveLocal, setSaveLocal] = useState(true);
  const [rotation, setRotation] = useState({ x: -6, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [drag, setDrag] = useState(null);
  const moleculeStyle = useMemo(
    () => ({
      transform: `translate(-50%,-50%) scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
    }),
    [zoom, rotation],
  );

  const resetScientific = () => {
    setQuality("High");
    setColors("CPK (Jmol)");
    setRenderMode("Ball and Stick");
    setLabels(true);
    setDensity("Off");
    setOpacity(50);
    setSpeed(55);
    setUnits("SI (m, g, mol, K, Pa)");
    setTemp("Kelvin (K)");
    setFigures("3");
    setSafeColors(true);
    setNarration(true);
    setKeyboard(true);
    setRotation({ x: -6, y: 0 });
    setZoom(1);
    if (reducedMotion) onReducedMotionToggle?.();
    if (highContrast) onHighContrastToggle?.();
    if (compact) onCompactToggle?.();
    if (!isDark) onThemeToggle?.();
    onColorThemeChange?.("study");
    onLanguageChange?.("en");
  };

  return (
    <div className="st-app">
      <header className="st-top">
        <button className="st-brand" onClick={() => onNavigate?.("dashboard")}>
          <Atom />
          <span>
            Molecular Workspace<small>EXPLORE · LEARN · DISCOVER</small>
          </span>
        </button>
        <span>Science today. A brighter tomorrow.</span>
      </header>
      <aside className="st-nav">
        {nav.map(([name, Icon, route]) => (
          <button
            key={name}
            className={route === "settings" ? "active" : ""}
            onClick={() => onNavigate?.(route)}
          >
            <Icon />
            {name}
          </button>
        ))}
        <div className="st-nav-mark">
          <FlaskConical />
          <span>
            Small Molecules
            <br />
            Big Ideas
          </span>
        </div>
      </aside>
      <main className="st-main">
        <div className="st-title">
          <div>
            <h1>
              <Settings /> Learning &amp; Lab Settings
            </h1>
            <p>
              Customize your visualization, learning tools, and lab preferences.
            </p>
          </div>
          <button className="st-restore" onClick={resetScientific}>
            <RotateCcw />
            Restore scientific defaults
          </button>
        </div>
        <div className="st-columns">
          <div className="st-left-grid">
            <Section icon={Box} title="3D & Simulation">
              <Field label="3D rendering quality">
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option>High</option>
                  <option>Balanced</option>
                  <option>Performance</option>
                </select>
              </Field>
              <small className="st-help">
                Balances visual detail and performance.
              </small>
              <Field label="Atom color standard">
                <select
                  value={colors}
                  onChange={(e) => setColors(e.target.value)}
                >
                  <option>CPK (Jmol)</option>
                  <option>Rasmol</option>
                  <option>Monochrome</option>
                </select>
              </Field>
              <small className="st-help">
                Carbon gray, Oxygen red, Nitrogen blue, etc.
              </small>
              <Field label="Default rendering style">
                <select
                  value={renderMode}
                  onChange={(e) => setRenderMode(e.target.value)}
                >
                  {modes.map((m) => (
                    <option key={m[0]}>{m[0]}</option>
                  ))}
                </select>
              </Field>
              <Toggle
                checked={labels}
                onChange={() => setLabels((v) => !v)}
                label="Show bond labels"
                help="Display bond lengths (Å) and angles (°)."
              />
              <Field label="Electron density surface">
                <select
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                >
                  <option>Off</option>
                  <option>Electrostatic</option>
                  <option>Van der Waals</option>
                </select>
              </Field>
              <label className="st-range">
                Opacity
                <input
                  type="range"
                  value={opacity}
                  onChange={(e) => setOpacity(+e.target.value)}
                />
                <span>{(opacity / 100).toFixed(2)}</span>
              </label>
              <label className="st-range">
                Animation speed
                <input
                  type="range"
                  value={speed}
                  onChange={(e) => setSpeed(+e.target.value)}
                />
                <span>{(speed / 55).toFixed(1)}×</span>
              </label>
              <small className="st-help">
                Affects molecular dynamics and transitions.
              </small>
            </Section>
            <Section icon={Ruler} title="Measurement">
              <Field label="Units for lab measurements">
                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <option>SI (m, g, mol, K, Pa)</option>
                  <option>Lab (mL, g, mol, °C)</option>
                </select>
              </Field>
              <div className="st-radio">
                <b>Temperature unit</b>
                <label>
                  <input
                    type="radio"
                    checked={temp === "Kelvin (K)"}
                    onChange={() => setTemp("Kelvin (K)")}
                  />{" "}
                  Kelvin (K)
                </label>
                <label>
                  <input
                    type="radio"
                    checked={temp === "Celsius (°C)"}
                    onChange={() => setTemp("Celsius (°C)")}
                  />{" "}
                  Celsius (°C)
                </label>
              </div>
              <Field label="Significant figures">
                <select
                  value={figures}
                  onChange={(e) => setFigures(e.target.value)}
                >
                  {["2", "3", "4", "5"].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </Field>
              <small className="st-help right">
                Used in displayed and exported values.
              </small>
            </Section>
            <Section icon={LockKeyhole} title="Data & Privacy">
              <Toggle
                checked={usage}
                onChange={() => setUsage((v) => !v)}
                label="Usage data (anonymous)"
                help="Help improve the app with anonymous usage statistics."
              />
              <Toggle
                checked={saveLocal}
                onChange={() => setSaveLocal((v) => !v)}
                label="Save lab work locally"
                help="Keep molecules, calculations, and notes on this device."
              />
              <div className="st-inline-actions">
                <button onClick={onResetData}>Manage data…</button>
                <button
                  onClick={() =>
                    alert("Privacy: learning data stays in this browser.")
                  }
                >
                  View privacy policy ↗
                </button>
              </div>
            </Section>
            <Section icon={Accessibility} title="Accessibility">
              <Toggle
                checked={safeColors}
                onChange={() => setSafeColors((v) => !v)}
                label="Color-vision safe reaction indicators"
                help="Use a high-contrast, color-blind friendly palette for reaction arrows, labels, and highlights."
              />
              <Toggle
                checked={reducedMotion}
                onChange={onReducedMotionToggle}
                label="Reduced motion"
                help="Minimize animations and camera motion."
              />
              <Toggle
                checked={narration}
                onChange={() => setNarration((v) => !v)}
                label="Narration / Read aloud"
                help="Spoken explanations for tools, molecules, and learning content."
              />
              <div className="st-dual">
                <Field label="">
                  <select
                    value={
                      language === "hi"
                        ? "Hindi Voice (HI)"
                        : "Natural Voice (EN)"
                    }
                    onChange={(e) =>
                      onLanguageChange?.(
                        e.target.value.includes("Hindi") ? "hi" : "en",
                      )
                    }
                  >
                    <option>Natural Voice (EN)</option>
                    <option>Hindi Voice (HI)</option>
                  </select>
                </Field>
                <button
                  onClick={() =>
                    window.speechSynthesis?.speak(
                      new SpeechSynthesisUtterance(
                        "Water has a bent molecular geometry.",
                      ),
                    )
                  }
                >
                  <Volume2 />
                  Test
                </button>
              </div>
              <Toggle
                checked={keyboard}
                onChange={() => setKeyboard((v) => !v)}
                label="Keyboard molecule rotation"
                help="Enable keyboard controls (arrow keys, WASD)."
              />
              <div className="st-key-help">
                Controls: &nbsp; Arrow keys = rotate &nbsp; | &nbsp; Shift =
                faster &nbsp; | &nbsp; R = reset view
              </div>
            </Section>
          </div>
          <section className="st-viewer">
            <h2>
              <Atom />
              Interactive Molecular Viewer
            </h2>
            <div className="st-view-head">
              <div>
                <b>Molecule: Water (H₂O)</b>
                <small>
                  Switch rendering modes to see how the same molecule can be
                  visualized.
                </small>
              </div>
              <select aria-label="Preview molecule">
                <option>Water (H₂O)</option>
                <option>Carbon dioxide (CO₂)</option>
              </select>
            </div>
            <div
              className={`st-stage mode-${modes.find((m) => m[0] === renderMode)?.[1] || "ball"} ${density !== "Off" ? "show-density" : ""}`}
              onPointerDown={(e) =>
                setDrag({
                  x: e.clientX,
                  y: e.clientY,
                  rx: rotation.x,
                  ry: rotation.y,
                })
              }
              onPointerMove={(e) =>
                drag &&
                setRotation({
                  x: drag.rx - (e.clientY - drag.y) / 3,
                  y: drag.ry + (e.clientX - drag.x) / 3,
                })
              }
              onPointerUp={() => setDrag(null)}
              onPointerLeave={() => setDrag(null)}
            >
              <div className="st-legend">
                <span>
                  <i className="oxygen" />O &nbsp; Oxygen
                </span>
                <span>
                  <i />H &nbsp; Hydrogen
                </span>
              </div>
              <div className="st-formula">
                H—O—H<small>104.5°</small>
              </div>
              <div className="st-molecule" style={moleculeStyle}>
                <span className="st-bond left" />
                <span className="st-bond right" />
                <i className="st-atom oxygen" />
                <i className="st-atom hydrogen h1" />
                <i className="st-atom hydrogen h2" />
                {labels && (
                  <>
                    <em className="l1">0.958 Å</em>
                    <em className="l2">0.958 Å</em>
                  </>
                )}
              </div>
              <div className="st-stage-tools">
                <button
                  onClick={() => setRotation((r) => ({ ...r, y: r.y + 28 }))}
                >
                  <MousePointer2 />
                  Rotate
                </button>
                <button onClick={() => setZoom((z) => Math.min(1.35, z + 0.1))}>
                  <ZoomIn />
                  Zoom
                </button>
                <button
                  onClick={() => setRotation((r) => ({ ...r, x: r.x + 12 }))}
                >
                  <Maximize2 />
                  Pan
                </button>
                <button
                  onClick={() => {
                    setRotation({ x: -6, y: 0 });
                    setZoom(1);
                  }}
                >
                  <RotateCcw />
                  Reset
                </button>
              </div>
            </div>
            <b className="st-mode-title">Rendering mode</b>
            <div className="st-modes">
              {modes.map(([name, key]) => (
                <button
                  key={name}
                  className={renderMode === name ? "active" : ""}
                  onClick={() => setRenderMode(name)}
                >
                  <span className={`st-mode-icon ${key}`}>
                    <i />
                    <i />
                    <i />
                  </span>
                  {name}
                </button>
              ))}
            </div>
            <div className="st-performance">
              <ShieldCheck />
              <div>
                <b>Performance</b>
                <span>
                  WebGL: <strong>Supported</strong> &nbsp;{" "}
                  <strong>60 FPS</strong>
                </span>
                <small>GPU: Hardware accelerated</small>
              </div>
              <div className="st-meter">
                {Array.from({ length: 18 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
              <span>
                16.7 ms<small>Frame time</small>
              </span>
            </div>
          </section>
        </div>
      </main>
      <footer className="st-footer">
        <span>
          Molecular Workspace v2.4.0 &nbsp; | &nbsp; WebGL Accelerated
        </span>
        <span>Learn more chemistry. Build a brighter you.</span>
      </footer>
    </div>
  );
};
export default SettingsPage;
