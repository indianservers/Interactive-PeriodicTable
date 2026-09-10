import { useEffect, useMemo, useRef, useState } from "react";
import {
  Atom, Beaker, BookOpen, ChevronDown, CircleHelp, FlaskConical, Gauge,
  Home, Moon, Pause, Play, RotateCcw, Sparkles, Sun, Thermometer, Undo2,
} from "lucide-react";
import "./StatesMatterPage.css";

const substances = {
  water: { name: "Water", formula: "H₂O", mass: "18.015", mp: 0, bp: 100, icon: "💧", enthalpy: "40.7" },
  argon: { name: "Argon", formula: "Ar", mass: "39.948", mp: -189, bp: -186, icon: "●", enthalpy: "6.4" },
  oxygen: { name: "Oxygen", formula: "O₂", mass: "31.998", mp: -219, bp: -183, icon: "◉", enthalpy: "6.8" },
};

const presets = [
  { phase: "Solid", description: "Ordered lattice · Vibrating in place", temp: "−10 °C", energy: 80 },
  { phase: "Liquid", description: "Close particles · Able to flow", temp: "25 °C", energy: 450 },
  { phase: "Gas", description: "Distant particles · Rapid motion", temp: "200 °C", energy: 900 },
];

const experiments = [
  { id: "pressure", title: "Boil without more heat", task: "Lower pressure until the liquid begins boiling.", setup: { energy: 625, pressure: 1.4 } },
  { id: "triple", title: "Find the triple point", task: "Move the phase point close to the meeting of all three regions.", setup: { energy: 315, pressure: 0.7 } },
  { id: "forces", title: "Compare attractions", task: "Switch between force modes and observe the molecular model.", setup: { energy: 450, pressure: 1 } },
];

function thermalState(energy, substance, pressure) {
  const boilingPoint = substance.bp + Math.log(Math.max(0.1, pressure)) * 18;
  if (energy < 150) return { phase: "Solid", temp: substance.mp - 50 + energy / 3, boilingPoint };
  if (energy < 300) return { phase: "Melting", temp: substance.mp, boilingPoint };
  if (energy < 650) return { phase: "Liquid", temp: substance.mp + ((energy - 300) / 350) * (boilingPoint - substance.mp), boilingPoint };
  if (energy < 800) return { phase: "Boiling", temp: boilingPoint, boilingPoint };
  return { phase: "Gas", temp: boilingPoint + (energy - 800) * 0.25, boilingPoint };
}

function transitionMessage(energy, state) {
  if (energy >= 130 && energy < 150) return "Approaching melting";
  if (energy >= 150 && energy < 300) return "Melting · temperature is holding steady";
  if (energy >= 620 && energy < 650) return "Approaching boiling";
  if (energy >= 650 && energy < 800) return `Boiling at ${state.boilingPoint.toFixed(0)} °C · absorbing latent heat`;
  if (energy >= 800 && energy < 840) return "Phase change complete · fully gaseous";
  return `${state.phase} · ${state.temp.toFixed(0)} °C`;
}

function ParticleCanvas({ phase = "Boiling", running = true, speed = 1, compact = false, trails = false, labels = false, labelText = "H₂O" }) {
  const ref = useRef(null);
  const particles = useRef([]);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return undefined;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const density = Math.min(2, devicePixelRatio || 1);
      canvas.width = rect.width * density;
      canvas.height = rect.height * density;
      ctx.setTransform(density, 0, 0, density, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const count = compact ? 38 : 78;
    if (particles.current.length !== count) {
      particles.current = Array.from({ length: count }, (_, index) => ({
        x: 0, y: 0, vx: Math.sin(index * 1.71) * 75,
        vy: Math.cos(index * 1.13) * 75, seed: index * 0.73,
      }));
    }
    let previous = performance.now();
    let frameId;
    const frame = (now) => {
      const dt = Math.min(0.03, (now - previous) / 1000) * speed;
      previous = now;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const solid = phase === "Solid";
      const gas = phase === "Gas";
      const changing = phase === "Boiling" || phase === "Melting";
      ctx.clearRect(0, 0, width, height);
      particles.current.forEach((particle, index) => {
        if (!particle.x) {
          particle.x = 18 + ((index * 47.3) % Math.max(1, width - 36));
          particle.y = gas ? 18 + ((index * 31.7) % Math.max(1, height - 36)) : height * (0.5 + ((index * 0.037) % 0.42));
        }
        if (solid) {
          const columns = compact ? 7 : 10;
          particle.x = width * 0.12 + (index % columns) * ((width * 0.76) / (columns - 1)) + Math.sin(now * 0.004 + particle.seed) * 1.4;
          particle.y = height * 0.2 + Math.floor(index / columns) * (compact ? 19 : 25) + Math.cos(now * 0.004 + particle.seed) * 1.4;
        } else if (running) {
          const lift = changing && particle.y > height * 0.56 && Math.sin(now * 0.002 + particle.seed) > 0.985;
          particle.vy += lift ? -110 : gas ? 0 : 18 * dt;
          particle.x += particle.vx * dt * (gas ? 1.35 : 0.55);
          particle.y += particle.vy * dt * (gas ? 1.35 : 0.55);
          if (!gas && particle.y < height * 0.42) { particle.y = height * 0.42; particle.vy = Math.abs(particle.vy); }
          if (particle.x < 10 || particle.x > width - 10) particle.vx *= -1;
          if (particle.y < 10 || particle.y > height - 10) particle.vy *= -1;
          particle.x = Math.max(10, Math.min(width - 10, particle.x));
          particle.y = Math.max(10, Math.min(height - 10, particle.y));
        }
        if (trails && !solid) {
          ctx.strokeStyle = "rgba(117, 211, 255, .32)";
          ctx.lineWidth = compact ? 1 : 1.5;
          ctx.beginPath(); ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * (gas ? 0.12 : 0.06), particle.y - particle.vy * (gas ? 0.12 : 0.06)); ctx.stroke();
        }
        ctx.save(); ctx.translate(particle.x, particle.y);
        ctx.fillStyle = "#f04444"; ctx.shadowBlur = compact ? 3 : 7; ctx.shadowColor = "#ef5449";
        ctx.beginPath(); ctx.arc(0, 0, compact ? 4.7 : 6.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.fillStyle = "#f7fbff";
        [[-5, -5], [6, -4]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * (compact ? 0.7 : 1), y * (compact ? 0.7 : 1), compact ? 2.8 : 4.1, 0, Math.PI * 2); ctx.fill(); });
        if (labels && !compact && index % 8 === 0) { ctx.fillStyle = "rgba(226, 245, 255, .9)"; ctx.font = "600 11px Inter, sans-serif"; ctx.fillText(labelText, 9, -11); }
        ctx.restore();
      });
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(frameId); observer.disconnect(); };
  }, [phase, running, speed, compact, trails, labels, labelText]);
  return <canvas ref={ref} aria-hidden="true" />;
}

function RangeField({ id, label, valueLabel, children, ticks }) {
  return <div className="sm-range-field">
    <span><label htmlFor={id}>{label}</label><output htmlFor={id}>{valueLabel}</output></span>
    {children}
    {ticks && <small className="sm-range-ticks">{ticks.map((tick) => <span key={tick}>{tick}</span>)}</small>}
  </div>;
}

export default function StatesMatterPage({ reducedMotion = false, onNavigate }) {
  const [substanceId, setSubstanceId] = useState("water");
  const [energy, setEnergy] = useState(700);
  const [pressure, setPressure] = useState(1);
  const [input, setInput] = useState(0);
  const [running, setRunning] = useState(true);
  const [motionEnabled, setMotionEnabled] = useState(!reducedMotion);
  const [speed, setSpeed] = useState(1);
  const [forces, setForces] = useState(true);
  const [trails, setTrails] = useState(true);
  const [labels, setLabels] = useState(false);
  const [forceMode, setForceMode] = useState("Hydrogen bonding");
  const [theme, setTheme] = useState("dark");
  const [notice, setNotice] = useState("");
  const [undoState, setUndoState] = useState(null);
  const [activeExperiment, setActiveExperiment] = useState(null);
  const phaseRef = useRef(null);
  const labRef = useRef(null);
  const chartsRef = useRef(null);
  const guideRef = useRef(null);
  const substance = substances[substanceId];
  const state = useMemo(() => thermalState(energy, substance, pressure), [energy, substance, pressure]);
  const phasePoint = { x: 58 + (energy / 1000) * 380, y: 218 - ((pressure - 0.1) / 4.9) * 160 };
  const heatLabel = input === 0 ? "Neutral" : `${input > 0 ? "+" : ""}${input.toFixed(2)} energy/tick`;

  useEffect(() => {
    if (!running || !input) return undefined;
    const timer = setInterval(() => setEnergy((value) => Math.max(0, Math.min(1000, value + input * speed))), 60);
    return () => clearInterval(timer);
  }, [running, input, speed]);
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 4200);
    return () => clearTimeout(timer);
  }, [notice]);

  const snapshot = () => ({ substanceId, energy, pressure, input, running, speed, forces, trails, labels, forceMode });
  const reset = () => {
    setUndoState(snapshot()); setSubstanceId("water"); setEnergy(700); setPressure(1); setInput(0);
    setRunning(true); setSpeed(1); setForces(true); setTrails(true); setLabels(false);
    setForceMode("Hydrogen bonding"); setActiveExperiment(null);
    setNotice("Lab reset to water at standard pressure.");
  };
  const undoReset = () => {
    if (!undoState) return;
    const setters = { substanceId: setSubstanceId, energy: setEnergy, pressure: setPressure, input: setInput, running: setRunning, speed: setSpeed, forces: setForces, trails: setTrails, labels: setLabels, forceMode: setForceMode };
    Object.entries(undoState).forEach(([key, value]) => setters[key]?.(value));
    setUndoState(null); setNotice("Previous lab settings restored.");
  };
  const applyPreset = (preset) => { setEnergy(preset.energy); setInput(0); setNotice(`${preset.phase} example loaded. Temperature and pressure remain adjustable.`); };
  const startExperiment = (experiment) => {
    setActiveExperiment(experiment.id); setEnergy(experiment.setup.energy); setPressure(experiment.setup.pressure);
    setInput(0); setRunning(false);
    labRef.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    setNotice(`${experiment.title} is ready. Follow the highlighted challenge.`);
  };
  const updatePhasePoint = (event) => {
    const bounds = phaseRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const svgX = ((event.clientX - bounds.left) / bounds.width) * 500;
    const svgY = ((event.clientY - bounds.top) / bounds.height) * 290;
    const nextEnergy = Math.round(Math.max(0, Math.min(1, (svgX - 58) / 380)) * 1000);
    const nextPressure = +(0.1 + (1 - Math.max(0, Math.min(1, (svgY - 48) / 170))) * 4.9).toFixed(1);
    setEnergy(nextEnergy); setPressure(nextPressure); setInput(0);
  };
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });

  return <div className={`sm-app sm-theme-${theme}`}>
    <a className="sm-skip" href="#sm-lab">Skip to lab controls</a>
    <header className="sm-header">
      <button className="sm-home" type="button" aria-label="Return to chemistry home" onClick={() => onNavigate?.("dashboard")}><Home /></button>
      <FlaskConical className="sm-logo" aria-hidden="true" />
      <div className="sm-title"><h1>States of Matter Lab</h1><p>Change temperature and pressure. Watch the same particles form different states.</p></div>
      <div className="sm-header-actions">
        <label className="sm-substance-select"><span>Substance</span><select value={substanceId} onChange={(event) => setSubstanceId(event.target.value)}>{Object.entries(substances).map(([id, item]) => <option key={id} value={id}>{item.icon} {item.formula} · {item.name}</option>)}</select></label>
        <button type="button" title="Open guided experiments" onClick={() => scrollTo(guideRef)}><Sparkles /> <span>Guided labs</span></button>
        <button type="button" title={`Use ${theme === "dark" ? "light" : "dark"} theme`} aria-label={`Use ${theme === "dark" ? "light" : "dark"} theme`} onClick={() => setTheme((value) => value === "dark" ? "light" : "dark")}>{theme === "dark" ? <Sun /> : <Moon />}</button>
        <button type="button" onClick={reset}><RotateCcw /> <span>Reset</span></button>
      </div>
    </header>

    <nav className="sm-section-nav" aria-label="Lab sections">
      <button type="button" onClick={() => scrollTo(labRef)}><Beaker /> Lab</button>
      <button type="button" onClick={() => scrollTo(chartsRef)}><Gauge /> Diagrams</button>
      <button type="button" onClick={() => scrollTo(guideRef)}><BookOpen /> Guided labs</button>
    </nav>

    <main>
      <section className="sm-previews" aria-labelledby="sm-presets-title">
        <div className="sm-section-heading"><div><span>Quick presets</span><h2 id="sm-presets-title">See how particles arrange themselves</h2></div><p>Select an example, then fine-tune the conditions below.</p></div>
        <div className="sm-preview-grid">{presets.map((preset) => <button type="button" className={`sm-preview sm-preview-${preset.phase.toLowerCase()} ${state.phase === preset.phase ? "active" : ""}`} key={preset.phase} onClick={() => applyPreset(preset)} aria-label={`Load ${preset.phase} example at ${preset.temp}`}>
          <span className="sm-preview-title"><i aria-hidden="true" />{preset.phase}<small>Jump to example</small></span>
          <span className="sm-preview-canvas"><ParticleCanvas phase={preset.phase} compact running={motionEnabled} /></span>
          <span className="sm-preview-copy">{preset.description}<b>{preset.temp}</b></span>
        </button>)}</div>
      </section>

      <section className="sm-workspace" id="sm-lab" ref={labRef} aria-labelledby="sm-current-state">
        <div className="sm-control-dock">
          <div className={`sm-state-badge sm-state-${state.phase.toLowerCase()}`}><span>Current state</span><strong id="sm-current-state">{state.phase}</strong><small>{transitionMessage(energy, state)}</small></div>
          <RangeField id="sm-pressure" label="Pressure" valueLabel={`${pressure.toFixed(1)} atm · ${(pressure * 101.3).toFixed(0)} kPa`} ticks={["0.1", "1", "2.5", "5 atm"]}>
            <div className="sm-range-with-steps"><button type="button" aria-label="Decrease pressure by 0.1 atmosphere" onClick={() => setPressure((value) => Math.max(0.1, +(value - 0.1).toFixed(1)))}>−</button><input id="sm-pressure" type="range" min="0.1" max="5" step="0.1" value={pressure} onChange={(event) => setPressure(Number(event.target.value))} /><button type="button" aria-label="Increase pressure by 0.1 atmosphere" onClick={() => setPressure((value) => Math.min(5, +(value + 0.1).toFixed(1)))}>+</button></div>
          </RangeField>
          <RangeField id="sm-heat" label="Heat flow" valueLabel={heatLabel} ticks={["Cool", "Neutral", "Heat"]}><input id="sm-heat" className="sm-heat-range" type="range" min="-5" max="5" step="0.25" value={input} onChange={(event) => setInput(Number(event.target.value))} /></RangeField>
          <div className="sm-playback" aria-label="Simulation playback controls"><button type="button" disabled={running} title={running ? "Pause the simulation to advance one step" : "Advance by one energy step"} onClick={() => setEnergy((value) => Math.min(1000, value + 10))}>Step</button><button type="button" className="primary" aria-pressed={running} onClick={() => setRunning((value) => !value)}>{running ? <Pause /> : <Play />}<span>{running ? "Pause" : "Play"}</span></button><label><span>Speed</span><select aria-label="Simulation speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value=".5">0.5×</option><option value="1">1×</option><option value="2">2×</option></select></label></div>
        </div>

        {activeExperiment && <div className="sm-challenge" role="status"><Sparkles /><span><b>{experiments.find((item) => item.id === activeExperiment)?.title}</b>{experiments.find((item) => item.id === activeExperiment)?.task}</span><button type="button" onClick={() => setActiveExperiment(null)}>End challenge</button></div>}

        <div className="sm-lab-grid">
          <article className="sm-info-card"><div className="sm-card-heading"><Atom /><div><span>System</span><h2>{substance.formula} · {substance.name}</h2></div></div><dl><div><dt>Molar mass</dt><dd>{substance.mass} g/mol</dd></div><div><dt>Chamber volume</dt><dd>1.00 L</dd></div><div><dt>Total molecules</dt><dd>3.34 × 10²²</dd></div></dl><div className="sm-meter"><span><b>Energy input</b><output>{energy} / 1000</output></span><progress value={energy} max="1000">{energy / 10}%</progress><small>{state.phase === "Melting" || state.phase === "Boiling" ? "Added energy is changing phase, not temperature." : "Energy changes particle motion and temperature."}</small></div><button type="button" className="sm-motion" aria-pressed={!motionEnabled} onClick={() => setMotionEnabled((value) => !value)}>{motionEnabled ? <Pause /> : <Play />}{motionEnabled ? "Pause particle motion" : "Resume particle motion"}</button></article>

          <article className="sm-vessel-card" aria-label={`${substance.name} molecular chamber. ${transitionMessage(energy, state)}`}><div className="sm-vessel"><ParticleCanvas phase={state.phase} running={running && motionEnabled} speed={speed} trails={trails} labels={labels} labelText={substance.formula} />{state.phase !== "Gas" && <div className="sm-water" />}<div className="sm-vessel-status"><span>{state.phase}</span><strong>{state.temp.toFixed(0)} °C</strong><small>{transitionMessage(energy, state)}</small></div></div></article>

          <article className="sm-readout-card"><div className="sm-card-heading"><Thermometer /><div><span>Live readings</span><h2>Conditions</h2></div></div><dl><div><dt>Temperature</dt><dd>{state.temp.toFixed(0)} °C</dd></div><div><dt>Pressure</dt><dd>{(pressure * 101.3).toFixed(1)} kPa</dd></div><div><dt>Boiling point</dt><dd>{state.boilingPoint.toFixed(0)} °C</dd></div><div><dt>Mean speed</dt><dd>{Math.max(90, Math.round(300 + energy * 0.5))} m/s</dd></div></dl><div className="sm-transition-track" aria-label={`Energy progress ${Math.round(energy / 10)} percent`}><i style={{ width: `${energy / 10}%` }} /><span style={{ left: `${Math.min(98, Math.max(2, energy / 10))}%` }} /></div><div className="sm-transition-labels"><span>Solid</span><span>Liquid</span><span>Gas</span></div></article>
        </div>
      </section>

      <section className="sm-analysis" ref={chartsRef} aria-label="Synchronized scientific diagrams">
        <article className="sm-phase-card"><div className="sm-section-heading"><div><span>Pressure × temperature</span><h2>Phase diagram</h2></div><output>{state.temp.toFixed(0)} °C · {pressure.toFixed(1)} atm</output></div><p className="sm-card-instruction">Drag anywhere on the plot to change both temperature and pressure.</p>
          <svg ref={phaseRef} className="sm-phase-svg" viewBox="0 0 500 290" role="img" aria-label={`Interactive phase diagram. Current point is ${state.phase} at ${state.temp.toFixed(0)} degrees Celsius and ${pressure.toFixed(1)} atmospheres.`} onPointerDown={(event) => { event.currentTarget.setPointerCapture?.(event.pointerId); updatePhasePoint(event); }} onPointerMove={(event) => { if (event.buttons === 1) updatePhasePoint(event); }}>
            <defs><pattern id="sm-solid-pattern" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 8L8 0" stroke="#2dd4bf" strokeOpacity=".2" /></pattern><pattern id="sm-gas-pattern" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#fbbf24" fillOpacity=".35" /></pattern></defs>
            <path className="solid" d="M58 218V48H175L158 218Z" /><path className="solid-pattern" d="M58 218V48H175L158 218Z" /><path className="liquid" d="M175 48H438L182 202L158 218Z" /><path className="gas" d="M182 202L438 48V218H58Z" /><path className="gas-pattern" d="M182 202L438 48V218H58Z" /><path className="line" d="M58 218Q145 210 182 202Q300 126 438 48" />
            <g className="axes"><line x1="58" y1="218" x2="448" y2="218" /><line x1="58" y1="218" x2="58" y2="35" /><text x="250" y="278">Temperature / energy →</text><text x="16" y="150" transform="rotate(-90 16 150)">Pressure (atm) →</text><text x="48" y="238">0</text><text x="425" y="238">1000</text><text x="28" y="220">0.1</text><text x="36" y="55">5</text></g>
            <text className="region-label" x="90" y="132">▧ Solid</text><text className="region-label" x="220" y="98">≈ Liquid</text><text className="region-label" x="365" y="166">◌ Gas</text><text x="190" y="223">Triple point</text><text x="350" y="39">Critical point</text><circle className="current-halo" cx={phasePoint.x} cy={phasePoint.y} r="13" /><circle className="current-point" cx={phasePoint.x} cy={phasePoint.y} r="7" /><text className="you-are-here" x={Math.min(390, phasePoint.x + 12)} y={Math.max(28, phasePoint.y - 12)}>Current conditions</text>
          </svg>
          <RangeField id="sm-energy" label="Temperature / energy coordinate" valueLabel={`${energy} / 1000`} ticks={["Solid", "Phase changes", "Gas"]}><input id="sm-energy" type="range" min="0" max="1000" value={energy} onChange={(event) => { setEnergy(Number(event.target.value)); setInput(0); }} /></RangeField>
        </article>

        <article className="sm-energy-card"><div className="sm-section-heading"><div><span>Energy added</span><h2>Heating curve &amp; enthalpy</h2></div><output>{energy} units</output></div><div className="sm-chart-legend" aria-label="Chart legend"><span><i className="temperature" />Temperature</span><span><i className="energy" />Phase-change plateau</span><span><i className="current" />Current point</span></div>
          <svg className="sm-energy-svg" viewBox="0 0 500 250" role="img" aria-label={`Heating curve with current energy at ${energy} out of 1000.`}><g className="grid"><line x1="55" y1="45" x2="465" y2="45" /><line x1="55" y1="100" x2="465" y2="100" /><line x1="55" y1="155" x2="465" y2="155" /><line x1="55" y1="210" x2="465" y2="210" /></g><g className="axes"><line x1="55" y1="210" x2="470" y2="210" /><line x1="55" y1="210" x2="55" y2="30" /><text x="220" y="244">Energy added (relative units)</text><text x="18" y="150" transform="rotate(-90 18 150)">Temperature (°C)</text><text x="48" y="228">0</text><text x="246" y="228">500</text><text x="438" y="228">1000</text><text x="28" y="214">−50</text><text x="36" y="159">0</text><text x="27" y="104">100</text><text x="27" y="49">200</text></g><polyline className="temperature-line" points="55,195 118,155 180,155 325,83 388,83 465,40" /><line className="latent" x1="118" y1="148" x2="180" y2="148" /><line className="latent" x1="325" y1="76" x2="388" y2="76" /><text x="118" y="137">Melting plateau</text><text x="310" y="64">Vaporization: ΔH = {substance.enthalpy} kJ/mol</text><line className="current-line" x1={55 + energy * 0.41} y1="32" x2={55 + energy * 0.41} y2="210" /><circle className="current-dot" cx={55 + energy * 0.41} cy={energy < 150 ? 195 - energy * .267 : energy < 300 ? 155 : energy < 650 ? 155 - (energy - 300) * .206 : energy < 800 ? 83 : 83 - (energy - 800) * .215} r="7" /></svg>
          <p className="sm-chart-note"><b>{transitionMessage(energy, state)}.</b> Flat sections show latent heat: energy changes particle arrangement while temperature stays constant.</p>
        </article>

        <article className="sm-forces-card"><div className="sm-section-heading"><div><span>Molecular attraction</span><h2>Intermolecular forces</h2></div><CircleHelp aria-hidden="true" /></div><div className="sm-force-tabs" role="radiogroup" aria-label="Intermolecular force model">{["Off", "Van der Waals", "Hydrogen bonding"].map((mode) => <button type="button" role="radio" aria-checked={forceMode === mode} key={mode} className={forceMode === mode ? "active" : ""} onClick={() => { setForceMode(mode); setForces(mode !== "Off"); setNotice(`${mode} model selected.`); }}>{mode}</button>)}</div><div className="sm-force-body"><div className="sm-force-model" aria-label={`${forceMode} molecular attraction illustration`}><MiniWater active={forces} /><MiniWater active={forces} /><MiniWater active={forces} /></div><fieldset><legend>Display options</legend><label><input type="checkbox" checked={forces} onChange={(event) => { const checked = event.target.checked; setForces(checked); setForceMode(checked ? "Hydrogen bonding" : "Off"); }} /> Show force lines</label><label><input type="checkbox" checked={trails} onChange={(event) => setTrails(event.target.checked)} /> Show speed trails</label><label><input type="checkbox" checked={labels} onChange={(event) => setLabels(event.target.checked)} /> Show molecular labels</label></fieldset></div><p>Stronger attractions raise melting and boiling points because more energy is needed to separate particles.</p></article>
      </section>

      <section className="sm-guides" ref={guideRef} aria-labelledby="sm-guides-title"><div className="sm-section-heading"><div><span>Learn by changing one variable</span><h2 id="sm-guides-title">Guided experiments</h2></div><p>Each challenge loads a starting condition; you remain in control.</p></div><div className="sm-guide-grid">{experiments.map((experiment, index) => <article key={experiment.id}><span>0{index + 1}</span><h3>{experiment.title}</h3><p>{experiment.task}</p><button type="button" onClick={() => startExperiment(experiment)}>Start challenge</button></article>)}</div><details className="sm-glossary"><summary><CircleHelp /> Key terms <ChevronDown /></summary><div><p><b>Triple point</b>The one temperature and pressure where solid, liquid, and gas coexist.</p><p><b>Critical point</b>Beyond this point, liquid and gas become indistinguishable.</p><p><b>Latent heat</b>Energy used to change state without changing temperature.</p><p><b>Intermolecular forces</b>Attractions between neighboring molecules.</p></div></details></section>
    </main>

    {notice && <div className="sm-toast" role="status" aria-live="polite"><span>{notice}</span>{undoState && notice.startsWith("Lab reset") && <button type="button" onClick={undoReset}><Undo2 /> Undo</button>}</div>}
  </div>;
}

function MiniWater({ active = false }) {
  return <span className={`sm-mini-water ${active ? "sm-force-active" : ""}`} aria-hidden="true"><i /><i /><i /></span>;
}
