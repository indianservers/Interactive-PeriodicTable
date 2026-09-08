import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Beaker,
  Box,
  BookOpen,
  FlaskConical,
  Moon,
  Network,
  Pause,
  Play,
  RotateCcw,
  Sun,
  TableProperties,
} from "lucide-react";
import "./StatesMatterPage.css";

const substances = {
  water: { name: "Water", formula: "H₂O", mass: "18.015", mp: 0, bp: 100 },
  argon: { name: "Argon", formula: "Ar", mass: "39.948", mp: -189, bp: -186 },
  oxygen: { name: "Oxygen", formula: "O₂", mass: "31.998", mp: -219, bp: -183 },
};
function thermalState(energy, s, p) {
  const bp = s.bp + Math.log(Math.max(0.1, p)) * 18;
  if (energy < 150) return { phase: "Solid", temp: s.mp - 50 + energy / 3 };
  if (energy < 300) return { phase: "Melting", temp: s.mp };
  if (energy < 650)
    return {
      phase: "Liquid",
      temp: s.mp + ((energy - 300) / 350) * (bp - s.mp),
    };
  if (energy < 800) return { phase: "Boiling", temp: bp };
  return { phase: "Gas", temp: bp + (energy - 800) * 0.25 };
}

function ParticleCanvas({
  phase = "Boiling",
  running = true,
  speed = 1,
  compact = false,
  trails = false,
  labels = false,
  labelText = "H₂O",
}) {
  const ref = useRef(null),
    particles = useRef([]);
  useEffect(() => {
    const canvas = ref.current,
      ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(),
        d = Math.min(2, devicePixelRatio || 1);
      canvas.width = rect.width * d;
      canvas.height = rect.height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const count = compact ? 42 : 82;
    if (particles.current.length !== count)
      particles.current = Array.from({ length: count }, (_, i) => ({
        x: 0,
        y: 0,
        vx: Math.sin(i * 1.71) * 75,
        vy: Math.cos(i * 1.13) * 75,
        seed: i * 0.73,
      }));
    let previous = performance.now(),
      frameId;
    const frame = (now) => {
      const dt = Math.min(0.03, (now - previous) / 1000) * speed;
      previous = now;
      const w = canvas.clientWidth,
        h = canvas.clientHeight,
        solid = phase === "Solid",
        gas = phase === "Gas",
        boiling = phase === "Boiling";
      ctx.clearRect(0, 0, w, h);
      particles.current.forEach((p, i) => {
        if (!p.x) {
          p.x = 18 + ((i * 47.3) % Math.max(1, w - 36));
          p.y = gas
            ? 18 + ((i * 31.7) % Math.max(1, h - 36))
            : h * (0.48 + ((i * 0.037) % 0.45));
        }
        if (solid) {
          const cols = compact ? 7 : 10;
          p.x =
            w * 0.12 +
            (i % cols) * ((w * 0.76) / (cols - 1)) +
            Math.sin(now * 0.004 + p.seed) * 1.4;
          p.y =
            h * 0.2 +
            Math.floor(i / cols) * (compact ? 20 : 27) +
            Math.cos(now * 0.004 + p.seed) * 1.4;
        } else if (running) {
          const lift = boiling && p.y > h * 0.56 && Math.sin(now * 0.002 + p.seed) > 0.985;
          p.vy += lift ? -110 : gas ? 0 : 18 * dt;
          p.x += p.vx * dt * (gas ? 1.35 : 0.55);
          p.y += p.vy * dt * (gas ? 1.35 : 0.55);
          if (!gas && p.y < h * 0.42) {
            p.y = h * 0.42;
            p.vy = Math.abs(p.vy);
          }
          if (p.x < 10 || p.x > w - 10) p.vx *= -1;
          if (p.y < 10 || p.y > h - 10) p.vy *= -1;
          p.x = Math.max(10, Math.min(w - 10, p.x));
          p.y = Math.max(10, Math.min(h - 10, p.y));
        }
        if (trails && !solid) {
          ctx.save();
          ctx.strokeStyle = "rgba(117, 211, 255, .34)";
          ctx.lineWidth = compact ? 1 : 1.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * (gas ? 0.12 : 0.06), p.y - p.vy * (gas ? 0.12 : 0.06));
          ctx.stroke();
          ctx.restore();
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.beginPath();
        ctx.fillStyle = "#e7302f";
        ctx.shadowBlur = compact ? 3 : 7;
        ctx.shadowColor = "#ef5449";
        ctx.arc(0, 0, compact ? 5 : 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#f1f5fb";
        for (const [x, y] of [
          [-5, -5],
          [6, -4],
        ]) {
          ctx.beginPath();
          ctx.arc(
            x * (compact ? 0.7 : 1),
            y * (compact ? 0.7 : 1),
            compact ? 3 : 4.3,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        if (labels && !compact && i % 8 === 0) {
          ctx.fillStyle = "rgba(226, 245, 255, .75)";
          ctx.font = "10px Inter, sans-serif";
          ctx.fillText(labelText, 9, -11);
        }
        ctx.restore();
      });
      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, [phase, running, speed, compact, trails, labels]);
  return <canvas ref={ref} />;
}

export default function StatesMatterPage() {
  const [substanceId, setSubstanceId] = useState("water"),
    [energy, setEnergy] = useState(700),
    [pressure, setPressure] = useState(1),
    [input, setInput] = useState(0),
    [running, setRunning] = useState(true),
    [speed, setSpeed] = useState(1),
    [forces, setForces] = useState(true),
    [trails, setTrails] = useState(true),
    [labels, setLabels] = useState(false),
    [section, setSection] = useState("Lab"),
    [forceMode, setForceMode] = useState("Hydrogen bonding");
  const substance = substances[substanceId],
    state = useMemo(
      () => thermalState(energy, substance, pressure),
      [energy, substance, pressure],
    );
  useEffect(() => {
    if (!running || !input) return;
    const timer = setInterval(
      () =>
        setEnergy((value) =>
          Math.max(0, Math.min(1000, value + input * speed)),
        ),
      60,
    );
    return () => clearInterval(timer);
  }, [running, input, speed]);
  const reset = () => {
    setSubstanceId("water");
    setEnergy(700);
    setPressure(1);
    setInput(0);
    setRunning(true);
    setSpeed(1);
    setForces(true);
    setTrails(true);
    setLabels(false);
    setForceMode("Hydrogen bonding");
  };
  return (
    <div className="sm-app">
      <header>
        <FlaskConical />
        <div>
          <h1>States of Matter Lab</h1>
          <p>
            Explore how temperature, pressure, and molecular interactions
            determine the state of matter.
          </p>
        </div>
        <nav>
          <button onClick={() => setSubstanceId((id) => id === "water" ? "argon" : id === "argon" ? "oxygen" : "water")}>💧 {substance.formula}⌄</button>
          <button onClick={() => setSection(section === "Tools" ? "Lab" : "Tools")}>⚙ Tools⌄</button>
          <button onClick={() => setSection("Data")}>
            <TableProperties /> Data⌄
          </button>
          <button onClick={reset}>
            <RotateCcw /> Reset
          </button>
          <button>
            <Moon />
            <Sun />
          </button>
        </nav>
        <small>
          Science
          <br />
          Today
          <br />A Brighter Tomorrow
        </small>
      </header>
      <aside>
        {[
          [Beaker, "Lab"],
          [BarChart3, "Phase Diagram"],
          [BarChart3, "Energy & Heat"],
          [Network, "Molecular View"],
          [Box, "Compare Substances"],
          [BookOpen, "Notes"],
        ].map(([Icon, label], i) => (
          <button key={label} className={section === label || (i === 0 && section === "Lab") ? "active" : ""} onClick={() => setSection(label)}>
            <Icon />
            {label}
          </button>
        ))}
        <p>
          “Same molecules.
          <br />
          Different worlds.”
          <br />
          <br />—<br />
          <small>Matter connects us.</small>
        </p>
      </aside>
      <main>
        {section !== "Lab" && <div className="sm-section-banner"><b>{section}</b><span>{section === "Phase Diagram" ? `Current point: ${state.phase} at ${state.temp.toFixed(0)} °C and ${pressure.toFixed(1)} atm.` : section === "Energy & Heat" ? `Energy input is ${energy.toFixed(0)} units; simulation speed is ${speed}×.` : section === "Molecular View" ? `${substance.formula} particles are ${labels ? "labelled" : "shown without labels"}.` : section === "Compare Substances" ? `Comparing ${substance.name} with water: melting ${substance.mp} °C · boiling ${substance.bp} °C.` : "Use the live controls and record an observation."}</span></div>}
        <section className="sm-previews">
          {[
            ["Solid", "-10 °C"],
            ["Liquid", "25 °C"],
            ["Gas", "200 °C"],
          ].map(([phase, temp]) => (
            <article key={phase}>
              <h2>{phase}</h2>
              <div>
                <ParticleCanvas phase={phase} compact />
              </div>
              <p>
                {phase === "Solid"
                  ? "Ordered lattice · Vibrating in place"
                  : phase === "Liquid"
                    ? "Close, flowing molecules"
                    : "Widely moving molecules"}
                <b>{temp}</b>
              </p>
            </article>
          ))}
        </section>
        <section className="sm-chamber">
          <article className="sm-pressure">
            <h3>Pressure</h3>
            <strong>{(pressure * 101.3).toFixed(1)} kPa</strong>
            <b>{pressure.toFixed(1)} atm</b>
            <div className="sm-pressure-stepper" aria-label="Pressure step controls">
              <button aria-label="Increase pressure" onClick={() => setPressure((value) => Math.min(5, +(value + 0.1).toFixed(1)))}>▲</button>
              <button aria-label="Decrease pressure" onClick={() => setPressure((value) => Math.max(0.1, +(value - 0.1).toFixed(1)))}>▼</button>
            </div>
            <input
              aria-label="Pressure"
              type="range"
              min=".1"
              max="5"
              step=".1"
              value={pressure}
              onChange={(e) => setPressure(Number(e.target.value))}
            />
            <small>Vacuum　10　50　100　500</small>
          </article>
          <article className="sm-system">
            <h3>System</h3>
            <b>
              💧 {substance.formula} ({substance.name})
            </b>
            <span>
              Molar mass <i>{substance.mass} g/mol</i>
            </span>
            <span>
              Chamber volume <i>1.00 L</i>
            </span>
            <span>
              Total molecules <i>3.34 × 10²²</i>
            </span>
          </article>
          <div className="sm-vessel">
            <div className="sm-lid" />
            <ParticleCanvas
              phase={state.phase}
              running={running}
              speed={speed}
              trails={trails}
              labels={labels}
              labelText={substance.formula}
            />
            <div className="sm-water" />
            <strong>
              {state.phase} at {state.temp.toFixed(0)} °C
            </strong>
            <div className="sm-gauge">
              101
              <br />
              <small>kPa</small>
              <i style={{ transform: `rotate(${-55 + pressure * 20}deg)` }} />
            </div>
          </div>
          <article className="sm-temp">
            <h3>Temperature</h3>
            <strong>{state.temp.toFixed(0)} °C</strong>
            <input
              aria-label="Heat or cool"
              type="range"
              min="-5"
              max="5"
              step=".25"
              value={input}
              onChange={(e) => setInput(Number(e.target.value))}
            />
            <span>🔥 Heat</span>
            <span>❄ Cool</span>
          </article>
          <div className="sm-play">
            <button onClick={() => setEnergy((v) => Math.min(1000, v + 10))}>
              ↻ Step
            </button>
            <button
              className="primary"
              aria-label={running ? "Pause simulation" : "Play simulation"}
              onClick={() => setRunning((v) => !v)}
            >
              {running ? <Pause /> : <Play />}
            </button>
            <select
              aria-label="Simulation speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            >
              <option value=".5">0.5×</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
            </select>
            <small>●　Live Simulation</small>
          </div>
        </section>
        <section className="sm-right">
          <article className="sm-phase">
            <h2>Phase diagram</h2>
            <svg viewBox="0 0 480 265">
              <path className="solid" d="M60 220V40H170L155 220Z" />
              <path className="liquid" d="M170 40H410L180 205L155 220Z" />
              <path className="gas" d="M180 205L410 40V220H60Z" />
              <path
                className="line"
                d="M60 220Q145 210 180 205Q290 130 410 40"
              />
              <circle
                cx={180 + (state.temp / 250) * 180}
                cy={205 - Math.log10(pressure + 1) * 40}
                r="7"
              />
              <text x="85" y="130">
                Solid
              </text>
              <text x="200" y="95">
                Liquid
              </text>
              <text x="355" y="165">
                Gas
              </text>
              <text x="190" y="222">
                Triple point
              </text>
              <text x="340" y="28">
                Critical point
              </text>
            </svg>
            <label>
              Drag to explore:{" "}
              <input
                aria-label="Phase temperature"
                type="range"
                min="0"
                max="1000"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
              />
            </label>
          </article>
          <article className="sm-energy">
            <h2>Energy &amp; enthalpy</h2>
            <svg viewBox="0 0 480 180">
              <path d="M50 155L160 45H305L410 155" />
              <polyline points="50,160 160,95 305,75 410,30" />
              <text x="180" y="42">
                Latent heat (vaporization)
              </text>
              <text x="205" y="59">
                ΔHᵥₐₚ = 40.7 kJ/mol
              </text>
            </svg>
          </article>
          <article className="sm-forces">
            <h2>Intermolecular forces</h2>
            <div className="sm-force-tabs">
              {["Off", "Van der Waals", "Hydrogen bonding"].map((mode) => <button key={mode} className={forceMode === mode ? "active" : ""} onClick={() => { setForceMode(mode); setForces(mode !== "Off"); }}>{mode}</button>)}
            </div>
            <div className="sm-force-model">
              <MiniWater active={forces} />
              <MiniWater active={forces} />
              <MiniWater active={forces} />
            </div>
            <label>
              <input
                type="checkbox"
                checked={forces}
                onChange={(e) => setForces(e.target.checked)}
              />{" "}
              Show forces
            </label>
            <label>
              <input
                type="checkbox"
                checked={trails}
                onChange={(e) => setTrails(e.target.checked)}
              />{" "}
              Show speed trails
            </label>
            <label>
              <input
                type="checkbox"
                checked={labels}
                onChange={(e) => setLabels(e.target.checked)}
              />{" "}
              Show molecular labels
            </label>
            <strong>
              652 <small>m/s</small>
            </strong>
            <p>
              Stronger intermolecular forces increase melting/boiling points and
              require more energy to change state.
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
function MiniWater({ active = false }) {
  return (
    <span className={`sm-mini-water ${active ? "sm-force-active" : ""}`}>
      <i />
      <i />
      <i />
    </span>
  );
}
