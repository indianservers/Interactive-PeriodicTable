import { useState } from "react";
import {
  Atom,
  Beaker,
  BookOpen,
  Box,
  FileText,
  FlaskConical,
  Home,
  Network,
  Pause,
  Play,
  Search,
  Settings,
  Users,
  Wifi,
} from "lucide-react";
import "./ImmersiveChemistryTargetPage.css";

const lessons = [
  [
    "Walk inside a crystal",
    "Explore real structures at atomic scale.",
    "XR　 Materials　 ◷ 20 min",
  ],
  [
    "Hold a protein",
    "Grab, rotate and explore biomolecules in 3D.",
    "XR　 Biochemistry　 ◷ 25 min",
  ],
  [
    "Explore an orbital",
    "Visualize and step inside electron orbitals.",
    "VR　 Quantum　 ◷ 15 min",
  ],
  [
    "Molecule assembly race",
    "Build molecules against the clock.",
    "MR　 Game　 ◷ 10 min",
  ],
];
export default function ImmersiveChemistryTargetPage() {
  const [mode, setMode] = useState("Mixed Reality"),
    [lesson, setLesson] = useState(0),
    [launched, setLaunched] = useState(false),
    [paused, setPaused] = useState(false),
    [cast, setCast] = useState(false),
    [navItem, setNavItem] = useState("Immersive Chemistry"),
    [category, setCategory] = useState("All"),
    [preview, setPreview] = useState(false),
    [notice, setNotice] = useState("Safety boundary active"),
    [activeDevice, setActiveDevice] = useState("Lab XR-01"),
    [seated, setSeated] = useState(false),
    [devices, setDevices] = useState(3);
  const lessonCategories = ["Materials", "Bio", "Quantum", "Gaming"];
  const visibleLessons = lessons
    .map((l, i) => ({ l, i, category: lessonCategories[i] }))
    .filter(({ category: c }) => category === "All" || c === category || (category === "Molecules" && ["Materials", "Quantum"].includes(c)));
  const announce = (message) => setNotice(message);
  return (
    <div className="xr-app">
      <header>
        <Network />
        <h1>
          Immersive <strong>Chemistry</strong>
        </h1>
        <span>Step inside molecular scale</span>
        <aside>
          ●　Lab XR-01 <b>Connected</b>
          <small>Meta Quest 3　▱ 90%</small>
          <Wifi />
        </aside>
        <button className="xr-settings" aria-label="Open XR settings" onClick={() => announce("XR settings ready") }><Settings /></button>
        <i>ED</i>
        <p>
          Dr. E. Chen<small>Instructor</small>
        </p>
      </header>
      <nav className="xr-side">
        {[
          [Home, "Home"],
          [Box, "Immersive Chemistry"],
          [FileText, "Lessons"],
          [Network, "Molecules"],
          [Atom, "Crystals"],
          [FlaskConical, "Reactions"],
          [Box, "Simulations"],
          [Beaker, "Live Lab"],
          [Users, "Classroom"],
          [FileText, "Reports"],
          ].map(([I, n]) => (
          <button className={navItem === n ? "active" : ""} key={n} onClick={() => { setNavItem(n); announce(`${n} section selected`); }}>
            <I />
            {n}
          </button>
        ))}
        <article>
          <p>
            Smaller world
            <br />
            <b>Brighter minds</b>
          </p>
          <small>
            CHEMISTRY
            <br />
            WITHOUT LIMITS
          </small>
        </article>
      </nav>
      <main>
        <section className="xr-scene">
          <nav>
            {["AR", "VR", "Mixed Reality"].map((n) => (
              <button
                className={mode === n ? "active" : ""}
                onClick={() => setMode(n)}
                key={n}
              >
                {n}
              </button>
            ))}
          </nav>
          <div className="xr-lab">
            <div className="xr-crystal">
              <b>Sodium Chloride (NaCl)</b>
              {Array.from({ length: 16 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div className="xr-benzene">
              {Array.from({ length: 6 }, (_, i) => (
                <i
                  key={i}
                  style={{ transform: `rotate(${i * 60}deg) translateX(92px)` }}
                />
              ))}
              <b>
                Benzene<small>C₆H₆</small>
              </b>
            </div>
            <div className="xr-periodic">
              <b>Periodic Table of the Elements</b>
              <div>
                {"H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr"
                  .split(" ")
                  .map((e) => (
                    <i key={e}>{e}</i>
                  ))}
              </div>
            </div>
            <div className="xr-energy">
              <b>Reaction Energy Surface</b>
              <i />
              <span>Reactants　　　　　　 Products</span>
            </div>
            <div className="xr-gestures">
              <b>Hand Gestures</b>
              <p>
                ☝　🤏　↻　🖐<small>Grab　 Pinch　 Rotate　 Push</small>
              </p>
            </div>
            <div className="xr-platform" />
            <p className="xr-safety">
              ✅　Safety Boundary Active
              <small>Room scale: 5.0 × 4.0 m — Clear</small>
            </p>
            <div className="xr-actions">
              <button onClick={() => { setPreview((v) => !v); announce(preview ? "3D preview closed" : "3D preview enabled"); }}>⬡ {preview ? "Close 3D preview" : "Preview in 3D"}</button>
              <button
                className="primary"
                onClick={() => { setLaunched((v) => !v); announce(launched ? "Spatial lesson stopped" : `Launching ${lessons[lesson][0]}`); }}
              >
                <Play />
                {launched ? "Spatial lesson active" : "Launch spatial lesson"}
              </button>
            </div>
          </div>
        </section>
        <aside className="xr-lessons">
          <header>
            <h2>Spatial Lesson Catalog</h2>
            <Search />
          </header>
          <nav>
            {["All", "Molecules", "Materials", "Bio", "Gaming"].map((c) => (
              <button key={c} className={category === c ? "active" : ""} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </nav>
          {visibleLessons.map(({ l, i }) => (
            <button
              className={lesson === i ? "active" : ""}
              key={l[0]}
              onClick={() => { setLesson(i); announce(`${l[0]} selected`); }}
            >
              <span className={`art art${i}`}>✧</span>
              <b>
                {l[0]}
                <small>{l[1]}</small>
                <i>{l[2]}</i>
              </b>
            </button>
          ))}
          <a>More lessons　→</a>
        </aside>
        <section className="xr-controls">
          <article>
            <h3>Instructor Controls</h3>
            <div>
              <button
                className={cast ? "active" : ""}
                onClick={() => setCast((v) => !v)}
              >
                <Users />
                Cast to Headsets<small>3 devices</small>
              </button>
              <button onClick={() => announce("Scene synchronized across connected headsets")}>↻ Sync Scene</button>
              <button onClick={() => { setPaused((v) => !v); announce(paused ? "All sessions resumed" : "All sessions paused"); }}>
                {paused ? <Play /> : <Pause />}
                {paused ? "Resume All" : "Pause All"}
              </button>
              <button onClick={() => announce("Hint sent: use pinch to scale the molecule")}>💡 Give Hint</button>
              <button onClick={() => { setLaunched(false); setPaused(false); announce("Spatial session ended"); }}>⏺ End Session</button>
            </div>
          </article>
          <article className="xr-live">
            <h3>Live View</h3>
            {["Lab XR-01", "Lab XR-02", "Lab XR-03"].map((n, i) => (
              <button key={n} className={activeDevice === n ? "active" : ""} onClick={() => { setActiveDevice(n); announce(`${n} selected`); }}>
                <i />
                {n}
                <small>● {i === 2 ? "Standby" : "Connected"}</small>
              </button>
            ))}
            <button onClick={() => { setDevices((v) => v + 1); announce(`XR-0${devices + 1} pairing requested`); }}>
              ＋<small>Add Device</small>
            </button>
          </article>
          <article className="xr-access">
            <h3>Accessibility</h3>
            <button className={seated ? "active" : ""} onClick={() => { setSeated((v) => !v); announce(seated ? "Standing mode enabled" : "Seated mode enabled"); }}>
              ♿　{seated ? "Seated mode" : "Seated mode"}{" "}
              <small>Full experience, no standing required</small>
            </button>
          </article>
          <article className="xr-motto">
            🌿　Learning today
            <br />
            　　for a brighter tomorrow.
            <small>SCIENCE　•　PEOPLE　•　A HEALTHIER PLANET</small>
          </article>
        </section>
        <div className="xr-status" role="status">{notice}</div>
      </main>
    </div>
  );
}
