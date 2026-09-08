import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  FlaskConical,
  Gauge,
  Minus,
  NotebookPen,
  Plus,
  Settings,
  Snowflake,
  Sun,
  ThermometerSun,
} from "lucide-react";
import "./GasPropertiesPage.css";

const gases = {
  Helium: { symbol: "He", mass: 4, color: "#d9efff", atoms: 1, a: 0.034, b: 0.0237 },
  Neon: { symbol: "Ne", mass: 20.18, color: "#aaa5e8", atoms: 1, a: 0.211, b: 0.0171 },
  Nitrogen: { symbol: "N₂", mass: 28.02, color: "#398cff", atoms: 2, a: 1.39, b: 0.0391 },
  Oxygen: { symbol: "O₂", mass: 32, color: "#ff5960", atoms: 2, a: 1.36, b: 0.0318 },
};
const initial = {
  count: 56,
  temp: 320,
  volume: 4,
  gas: "Helium",
  ideal: true,
  holdPressure: false,
};
const molesOf = (count) => count / 306;
const pressureOf = (s) => {
  const n = molesOf(s.count), gas = gases[s.gas];
  const ideal = (n * 0.0821 * s.temp) / s.volume;
  if (s.ideal) return ideal;
  const availableVolume = Math.max(0.15, s.volume - n * gas.b);
  return Math.max(0.01, (n * 0.0821 * s.temp) / availableVolume - gas.a * (n / s.volume) ** 2);
};

function useParticles(canvasRef, state) {
  const particles = useRef([]);
  const raf = useRef();
  const current = useRef(state);
  current.current = state;
  useEffect(() => {
    const canvas = canvasRef.current,
      ctx = canvas?.getContext("2d");
    if (!ctx) return;
    const resize = () => {
      const b = canvas.getBoundingClientRect(),
        d = Math.min(devicePixelRatio || 1, 2);
      canvas.width = b.width * d;
      canvas.height = b.height * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    let last = performance.now();
    const frame = (now) => {
      const dt = Math.min(0.03, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth,
        h = canvas.clientHeight,
        s = current.current;
      while (particles.current.length < s.count) {
        const index = particles.current.length;
        const a = (index * 2.399963) % (Math.PI * 2),
          sp = 65 + (index % 9) * 9;
        particles.current.push({
          x: 20 + ((index * 37.7) % Math.max(1, w - 40)),
          y: 20 + ((index * 23.9) % Math.max(1, h - 40)),
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          r: 3 + (index % 3) * 0.7,
        });
      }
      particles.current.length = Math.min(particles.current.length, s.count);
      ctx.clearRect(0, 0, w, h);
      for (const p of particles.current) {
        const factor = Math.sqrt(s.temp / 320);
        p.x += p.vx * factor * dt;
        p.y += p.vy * factor * dt;
        if (p.x < p.r || p.x > w - p.r) p.vx *= -1;
        if (p.y < p.r || p.y > h - p.r) p.vy *= -1;
        p.x = Math.max(p.r, Math.min(w - p.r, p.x));
        p.y = Math.max(p.r, Math.min(h - p.r, p.y));
        ctx.beginPath();
        ctx.fillStyle = gases[s.gas].color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = gases[s.gas].color;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf.current);
      observer.disconnect();
    };
  }, [canvasRef]);
}

function GasIcon({ gas }) {
  const g = gases[gas];
  return (
    <span className="gp-gas-icon">
      {Array.from({ length: g.atoms }, (_, i) => (
        <i key={i} style={{ background: g.color }} />
      ))}
    </span>
  );
}
function Sparkline({ type, temp, volume, pressure }) {
  const pv = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const v = 0.8 + i * 0.68;
        return [v, (pressure * volume) / v];
      }),
    [pressure, volume],
  );
  if (type === "pv")
    return (
      <svg viewBox="0 0 430 190" preserveAspectRatio="none">
        <g className="gp-gridlines">
          {[30, 70, 110, 150].map((y) => (
            <line key={y} x1="45" y1={y} x2="418" y2={y} />
          ))}
          {[45, 120, 195, 270, 345, 418].map((x) => (
            <line key={x} x1={x} y1="15" x2={x} y2="160" />
          ))}
        </g>
        <line className="axis" x1="45" y1="160" x2="420" y2="160" />
        <line className="axis" x1="45" y1="15" x2="45" y2="160" />
        <polyline
          points={pv
            .map(([v, p]) => `${45 + v * 58},${160 - Math.min(140, p * 50)}`)
            .join(" ")}
        />
        <circle
          className="current"
          cx={45 + volume * 58}
          cy={160 - Math.min(140, pressure * 50)}
          r="5"
        />
        <text x={58 + volume * 58} y={145 - Math.min(125, pressure * 50)}>
          P = {pressure.toFixed(2)} atm
        </text>
        <text x={58 + volume * 58} y={160 - Math.min(125, pressure * 50)}>
          V = {volume.toFixed(2)} L
        </text>
      </svg>
    );
  const t = temp;
  return (
    <svg viewBox="0 0 430 190" preserveAspectRatio="none">
      <g className="gp-gridlines">
        {[30, 70, 110, 150].map((y) => (
          <line key={y} x1="45" y1={y} x2="418" y2={y} />
        ))}
      </g>
      {[240, t, 400].map((k, i) => (
        <path
          key={k}
          className={`dist d${i}`}
          d={`M45 160 C ${80 + i * 20} 155, ${88 + i * 35} ${25 + i * 28}, ${140 + i * 35} ${30 + i * 28} S ${225 + i * 45} 160, 418 160`}
        />
      ))}
      <line
        className="avg"
        x1={120 + t / 3}
        y1="18"
        x2={120 + t / 3}
        y2="160"
      />
      <text x={135 + t / 3} y="30">
        Average speed
      </text>
      <text x={135 + t / 3} y="46">
        {Math.round(952 * Math.sqrt(t / 320))} m/s
      </text>
    </svg>
  );
}

export default function GasPropertiesPage() {
  const [s, setS] = useState(initial);
  const [section, setSection] = useState("Lab");
  const [advanced, setAdvanced] = useState(false);
  const canvasRef = useRef();
  useParticles(canvasRef, s);
  const pressure = pressureOf(s);
  const moles = molesOf(s.count);
  const speed = Math.round(
    952 * Math.sqrt(s.temp / 320) * Math.sqrt(4 / gases[s.gas].mass),
  );
  const change = (key, value) =>
    setS((old) => {
      const next = { ...old, [key]: value };
      if (old.holdPressure && (key === "temp" || key === "count"))
        next.volume = Math.max(
          1,
          Math.min(6, (molesOf(next.count) * 0.0821 * next.temp) / pressure),
        );
      return next;
    });
  return (
    <div className="gp-app">
      <header className="gp-head">
        <FlaskConical />
        <div>
          <h1>Gas Properties Lab</h1>
          <p>
            Explore the relationships between pressure, volume, temperature and
            amount of gas
          </p>
        </div>
        <nav>
          <button className={section === "Experiments" ? "active" : ""} onClick={() => setSection("Experiments")}>
            <BookOpen />
            Experiments
          </button>
          <button className={section === "Data" ? "active" : ""} onClick={() => setSection("Data")}>
            <BarChart3 />
            Data
          </button>
          <button className={section === "Settings" ? "active" : ""} onClick={() => setSection("Settings")}>
            <Settings />
            Settings
          </button>
          <button>
            <Sun />
          </button>
          <span>
            <i />
            Ideal Gas Mode<small>PV = nRT</small>
          </span>
        </nav>
      </header>
      <aside className="gp-nav">
        {[
          [FlaskConical, "Lab"],
          [BarChart3, "Graphs"],
          [Atom, "Molecules"],
          [BookOpen, "Theory"],
          [NotebookPen, "Notebook"],
        ].map(([I, n], i) => (
          <button className={(section === n || (i === 0 && section === "Lab")) ? "active" : ""} key={n} onClick={() => setSection(n)}>
            <I />
            {n}
          </button>
        ))}
        <p>
          Science
          <br />
          Builds
          <br />a Brighter
          <br />
          Tomorrow
        </p>
      </aside>
      <main className="gp-main">
        <section className="gp-apparatus">
          <div className="gp-volume">
            <b>Volume (L)</b>
            {[6, 5, 4, 3, 2, 1].map((n) => (
              <span key={n}>{n.toFixed(1)}</span>
            ))}
            <i style={{ top: `${(6 - s.volume) * 16.3 + 1}%` }} />
          </div>
          <div className="gp-cylinder">
            <div className="gp-rod" />
            <div
              className="gp-piston"
              style={{ top: `${Math.max(5, (6 - s.volume) * 10 + 7)}%` }}
            />
            <canvas
              ref={canvasRef}
              style={{
                top: `${Math.max(12, (6 - s.volume) * 10 + 15)}%`,
                height: `${Math.min(76, 84 - (6 - s.volume) * 10)}%`,
              }}
            />
            <div className="gp-base">
              <span />
            </div>
          </div>
          <div className="gp-gauge">
            <i style={{ transform: `rotate(${-125 + pressure * 80}deg)` }} />
            <b>
              Pressure<small>(atm)</small>
            </b>
          </div>
          <div className={`gp-flame ${s.temp < 280 ? "cool" : ""}`}>
            <i />
            <i />
            <i />
          </div>
        </section>
        <section className="gp-readouts">
          {[
            ["P", "Pressure", pressure.toFixed(2) + " atm", "blue"],
            ["V", "Volume", s.volume.toFixed(2) + " L", "purple"],
            ["T", "Temperature", s.temp + " K", "gold"],
            ["n", "Amount of gas", moles.toFixed(3) + " mol", "green"],
          ].map(([symbol, label, value, color]) => (
            <div key={symbol}>
              <em className={color}>{symbol}</em>
              <span>{label}</span>
              <b>{value}</b>
            </div>
          ))}
        </section>
        <section className="gp-graphs">
          <article>
            <h2>P–V Graph (Isothermal Highlighted)</h2>
            <Sparkline
              type="pv"
              temp={s.temp}
              volume={s.volume}
              pressure={pressure}
            />
          </article>
          <article>
            <h2>Maxwell–Boltzmann Distribution</h2>
            <Sparkline type="dist" temp={s.temp} />
          </article>
        </section>
        <section className="gp-controls">
          <article className="gp-types">
            <h3>Molecule type</h3>
            <div>
              {Object.keys(gases).map((g) => (
                <button
                  key={g}
                  className={s.gas === g ? "active" : ""}
                  onClick={() => change("gas", g)}
                >
                  <GasIcon gas={g} />
                  <b>{gases[g].symbol}</b>
                  <small>{gases[g].mass.toFixed(2)} g/mol</small>
                </button>
              ))}
            </div>
          </article>
          <article>
            <h3>Pump particles</h3>
            <div className="gp-step">
              <button onClick={() => change("count", Math.max(1, s.count - 5))}>
                <Minus />
              </button>
              <span>n = {moles.toFixed(3)} mol</span>
              <button
                onClick={() => change("count", Math.min(180, s.count + 5))}
              >
                <Plus />
              </button>
            </div>
            <div className="gp-two">
              <button
                className="primary"
                onClick={() => change("count", Math.min(180, s.count + 12))}
              >
                Pump particles
              </button>
              <button onClick={() => change("holdPressure", !s.holdPressure)}>
                <i className={s.holdPressure ? "on" : ""} />
                Hold pressure
              </button>
            </div>
          </article>
          <article>
            <h3>Temperature control</h3>
            <div className="gp-two">
              <button
                className="cold"
                onClick={() => change("temp", Math.max(200, s.temp - 20))}
              >
                <Snowflake />
                Cool
              </button>
              <button
                className="hot"
                onClick={() => change("temp", Math.min(800, s.temp + 20))}
              >
                <ThermometerSun />
                Heat
              </button>
            </div>
            <input
              aria-label="Temperature"
              type="range"
              min="200"
              max="800"
              value={s.temp}
              onChange={(e) => change("temp", +e.target.value)}
            />
            <div className="gp-scale">
              <span>200 K</span>
              <b>{s.temp} K</b>
              <span>800 K</span>
            </div>
          </article>
          <article>
            <h3>Volume control</h3>
            <div className="gp-step">
              <button
                onClick={() => change("volume", Math.max(1, s.volume - 0.25))}
              >
                <Minus />
              </button>
              <input
                aria-label="Volume"
                type="range"
                min="1"
                max="6"
                step=".05"
                value={s.volume}
                onChange={(e) => change("volume", +e.target.value)}
              />
              <button
                onClick={() => change("volume", Math.min(6, s.volume + 0.25))}
              >
                <Plus />
              </button>
            </div>
            <b className="gp-center">V = {s.volume.toFixed(2)} L</b>
            <div className="gp-scale">
              <span>1.0 L</span>
              <span>6.0 L</span>
            </div>
          </article>
          <article>
            <h3>Simulation options</h3>
            <ToggleLine
              label="Ideal gas (PV = nRT)"
              on={s.ideal}
              action={() => change("ideal", !s.ideal)}
            />
            <ToggleLine
              label="Real gas (van der Waals)"
              on={!s.ideal}
              action={() => change("ideal", !s.ideal)}
            />
            <button className="gp-advanced" onClick={() => setAdvanced((v) => !v)} aria-expanded={advanced}>
              <Settings />
              {advanced ? "Close advanced settings" : "Advanced settings"}
            </button>
            {advanced && <div className="gp-advanced-panel">Collision model: {s.ideal ? "Ideal gas" : "van der Waals"}. Increase particle count or temperature to observe collision-rate changes.</div>}
          </article>
        </section>
        <section className="gp-stats">
          <div>
            <small>Collisions (total)</small>
            <b>{(18429 + s.count * 3).toLocaleString()}</b>
          </div>
          <div>
            <small>Collisions per second</small>
            <b>{Math.round((612 * pressure) / 1.2)}</b>
          </div>
          <div>
            <small>Average speed</small>
            <b>{speed} m/s</b>
          </div>
          <div className="gp-spectrum">
            <span />
          </div>
          <div className="gp-formula">
            PV = nRT{" "}
            <small>P (atm) · V (L) = n (mol) · R (0.0821) · T (K)</small>
          </div>
          <p>
            <Gauge />
            Real gases deviate at high pressure and low temperature
          </p>
        </section>
      </main>
    </div>
  );
}
function ToggleLine({ label, on, action }) {
  return (
    <button className="gp-toggle-line" onClick={action}>
      <i className={on ? "on" : ""} />
      {label}
    </button>
  );
}
