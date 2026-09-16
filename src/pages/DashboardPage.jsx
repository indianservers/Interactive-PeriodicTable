import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Atom,
  BookOpen,
  Boxes,
  ChevronRight,
  FlaskConical,
  Focus,
  Fullscreen,
  GraduationCap,
  Home,
  Maximize2,
  Menu,
  Microscope,
  Moon,
  Move3D,
  PenTool,
  Pause,
  Play,
  Rotate3D,
  Search,
  Settings,
  Sparkles,
  TestTubes,
  Waypoints,
  ZoomIn,
} from "lucide-react";
import "./dashboardTarget.css";
import "./dashboardResponsive.css";
import HomeLibrary from "./HomeLibrary.jsx";
import ConceptIcon from "../components/ConceptIcon.jsx";
import { conceptPng } from "../data/homeIconManifest.js";
import HomeStatistics from "./HomeStatistics.jsx";
import { completedVirtualLabs } from "../data/completedVirtualLabs.js";
import "./completedLabs.css";
import "./homeLibrary.css";

const ATOMS = [
  ["N", -1.25, 0.55, 0],
  ["C", -0.45, 1.05, 0],
  ["N", 0.35, 0.45, 0],
  ["C", 1.28, 0.8, 0],
  ["N", 1.72, -0.08, 0],
  ["C", 0.98, -0.75, 0],
  ["N", -0.05, -0.56, 0],
  ["C", -0.92, -0.2, 0],
  ["O", -0.52, 1.98, 0],
  ["O", 1.57, 1.68, 0],
  ["C", -2.15, 1.08, 0.2],
  ["C", 2.72, -0.2, -0.16],
  ["C", -0.33, -1.72, 0.25],
  ["H", -2.62, 0.52, 0.1],
  ["H", -2.28, 1.73, -0.5],
  ["H", -2.12, 1.48, 1.04],
  ["H", 3.05, 0.2, 0.78],
  ["H", 3.08, 0.34, -0.99],
  ["H", 2.98, -1.24, -0.13],
  ["H", -0.12, -2.23, 1.17],
  ["H", -0.03, -2.24, -0.58],
  ["H", -1.39, -1.91, 0.38],
  ["H", -0.18, 0.13, -0.92],
  ["H", 1.2, -1.18, -0.95],
];
const BONDS = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 0],
  [2, 6],
  [1, 8],
  [3, 9],
  [0, 10],
  [4, 11],
  [6, 12],
  [10, 13],
  [10, 14],
  [10, 15],
  [11, 16],
  [11, 17],
  [11, 18],
  [12, 19],
  [12, 20],
  [12, 21],
  [7, 22],
  [5, 23],
];
const COLORS = { C: 0x293638, N: 0x2e69d3, O: 0xd9473f, H: 0xe8eeee };

function makeBond(a, b) {
  const start = new THREE.Vector3(a[1], a[2], a[3]);
  const end = new THREE.Vector3(b[1], b[2], b[3]);
  const delta = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.065, 0.065, delta.length(), 14),
    new THREE.MeshStandardMaterial({
      color: 0x98a8a5,
      roughness: 0.42,
      metalness: 0.15,
    }),
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    delta.normalize(),
  );
  return mesh;
}

function CaffeineViewer({ mode, autoRotate, isolate, zoomSignal, onAtom }) {
  const mountRef = useRef(null);
  const stateRef = useRef(null);
  useEffect(() => {
    const host = mountRef.current;
    if (!host) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      35,
      host.clientWidth / host.clientHeight,
      0.1,
      100,
    );
    camera.position.set(0, 0.3, 11);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 4;
    controls.maxDistance = 30;
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8d7d2, 2.1));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(-3, 5, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x79e7dc, 18, 10);
    rim.position.set(4, -2, 3);
    scene.add(rim);
    const group = new THREE.Group();
    group.rotation.set(-0.34, -0.2, -0.12);
    scene.add(group);
    BONDS.forEach(([i, j]) => group.add(makeBond(ATOMS[i], ATOMS[j])));
    const atomMeshes = [];
    ATOMS.forEach((atom, index) => {
      const radius =
        mode === "spacefill"
          ? { H: 0.25, C: 0.46, N: 0.43, O: 0.42 }[atom[0]]
          : { H: 0.18, C: 0.31, N: 0.3, O: 0.29 }[atom[0]];
      const geometry =
        mode === "wireframe"
          ? new THREE.IcosahedronGeometry(radius, 1)
          : new THREE.SphereGeometry(radius, 28, 18);
      const sphere = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: COLORS[atom[0]],
          roughness: 0.24,
          metalness: 0.08,
          wireframe: mode === "wireframe",
        }),
      );
      sphere.position.set(atom[1], atom[2], atom[3]);
      sphere.userData = { index, symbol: atom[0] };
      group.add(sphere);
      atomMeshes.push(sphere);
    });
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const click = (event) => {
      const box = renderer.domElement.getBoundingClientRect();
      pointer.set(
        ((event.clientX - box.left) / box.width) * 2 - 1,
        -((event.clientY - box.top) / box.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(atomMeshes)[0];
      if (hit) onAtom?.(hit.object.userData);
    };
    renderer.domElement.addEventListener("click", click);
    const resize = () => {
      if (!host.clientWidth || !host.clientHeight) return;
      camera.aspect = host.clientWidth / host.clientHeight;
      const distance = Math.max(5.8, 7.2 / camera.aspect) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.setLength(distance);
      camera.updateProjectionMatrix();
      renderer.setSize(host.clientWidth, host.clientHeight);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    controls.autoRotate = autoRotate;
    let frame;
    const animate = () => {

      controls.autoRotateSpeed = 0.9;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    stateRef.current = { camera, controls, group, atomMeshes };
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("click", click);
      controls.dispose();
      renderer.dispose();
      if (host.contains(renderer.domElement))
        host.removeChild(renderer.domElement);
    };
  }, [mode, onAtom]);
  useEffect(() => {
    if (stateRef.current) stateRef.current.controls.autoRotate = autoRotate;
  }, [autoRotate]);
  useEffect(() => {
    if (stateRef.current && zoomSignal > 0) {
      stateRef.current.camera.position.multiplyScalar(0.86);
      stateRef.current.controls.update();
    }
  }, [zoomSignal]);
  useEffect(() => {
    stateRef.current?.atomMeshes.forEach((mesh) => {
      mesh.visible = !isolate || mesh.userData.symbol === "N";
    });
  }, [isolate, mode]);
  return (
    <div
      className="dash-canvas"
      ref={mountRef}
      aria-label="Interactive 3D caffeine molecule"
    />
  );
}

const navItems = [
  ["dashboard", "Home", Home],
  ["library", "Browse all", Search],
  ["simulators", "Simulators", FlaskConical],
  ["syllabus", "Learn", BookOpen],
  ["molecule", "3D Explorer", Boxes],
  ["structure-draw", "Structure Draw", PenTool],
  ["lab", "Virtual Lab", FlaskConical],
  ["chemistry-solver", "Reaction Solver", Sparkles],
  ["study-tools", "Resources", BookOpen],
  ["learning-command", "Progress", GraduationCap],
  ["settings", "Settings", Settings],
];
const modules = [
  ["table", "Periodic Table", "118 elements", Atom],
  ["lab", "Virtual Lab", "Run experiments", TestTubes],
  ["chemistry-solver", "Reaction Solver", "Balance & predict", Sparkles],
  ["symmetry", "Molecular Symmetry", "Explore point groups", Waypoints],
  ["organic-mechanisms", "Organic Mechanisms", "Step by step", Move3D],
  ["drug-discovery", "Drug Discovery", "Design molecules", Microscope],
  ["structure-draw", "Structure Draw", "Ketcher editor", PenTool],
];

export const DashboardPage = ({ onNavigate }) => {
  const [navOpen, setNavOpen] = useState(false),
    [mode, setMode] = useState("ball"),
    [autoRotate, setAutoRotate] = useState(true),
    [isolate, setIsolate] = useState(false),
    [zoomSignal, setZoomSignal] = useState(0),
    [selectedAtom, setSelectedAtom] = useState(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [subgroup, setSubgroup] = useState("all");
  const searchRef = useRef(null);
  const browse = (value = "all") => { setCategory(value); setSubgroup("all"); setNavOpen(false); requestAnimationFrame(() => document.getElementById("home-library")?.scrollIntoView({ behavior: "smooth", block: "start" })); };
  useEffect(() => { const shortcut = e => { if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); searchRef.current?.focus(); } }; window.addEventListener("keydown", shortcut); return () => window.removeEventListener("keydown", shortcut); }, []);
  const chooseAtom = useCallback((atom) => setSelectedAtom(atom), []);
  const recent = [
    ["Esterification", "Virtual lab", "lab", "synthesis"],
    ["Aspirin synthesis", "Organic chemistry", "organic-mechanisms", "drug"],
    ["SN2 mechanism", "Reaction explorer", "organic-mechanisms", "mechanism"],
  ];
  return (
    <div className={`dashboard-target ${navOpen ? "nav-open" : ""} ${query ? "hub-searching" : ""}`}>
      <aside className="dash-side">
        <div className="dash-brand">
          <div className="dash-brand-mark">
            <Atom size={22} />
          </div>
          <div>
            <b>CHEMISTRY</b>
            <span>LEARNING LAB</span>
          </div>
        </div>
        <nav className="dash-nav">
          {navItems.map(([id, label, Icon]) => (
            <button
              key={id}
              className={id === "dashboard" ? "active" : ""}
              onClick={() => id === "library" ? browse() : id === "simulators" || id === "lab" ? onNavigate("virtual-labs") : onNavigate(id)}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>
        <div className="dash-side-note">
          “The important thing is to never stop questioning.”
          <br />— Albert Einstein
        </div>
      </aside>
      <div className="dash-shell">
        <header className="dash-top">
          <button
            className="dash-mobile-menu"
            onClick={() => setNavOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <Menu size={20} />
          </button>
          <label className="dash-search">
            <Search size={14} />
            <input ref={searchRef} aria-label="Search all chemistry" placeholder="Search simulators, molecules, reactions, topics…" value={query} onChange={e => { setQuery(e.target.value); setCategory("all"); setSubgroup("all"); }} />
            <kbd>⌘ K</kbd>
          </label>
          <div className="dash-top-links">
            <button onClick={() => browse()}>Explore</button>
            <button onClick={() => onNavigate("structure-draw")}>
              Draw
            </button>
            <button onClick={() => onNavigate("chemistry-inventor")}>
              Create
            </button>
            <button onClick={() => onNavigate("syllabus")}>Learn</button>
            <Moon size={15} />
            <div className="dash-avatar">CU</div>
          </div>
        </header>
        <div className="dash-main">
          <section className="dash-intro">
            <div>
              <h1>Chemistry Learning Hub</h1>
              <p>Explore matter. Test ideas. See reactions.</p>
            </div>
            <div>
              <button
                className="dash-launch"
                onClick={() => onNavigate("molecule")}
              >
                <Boxes size={15} />
                Launch 3D Explorer
                <ChevronRight size={14} />
              </button>
              <div className="dash-hand">
                Small Molecules
                <br />
                Big Ideas
              </div>
            </div>
          </section>
          <HomeStatistics/>
          <div className="hub-quick-browse"><button onClick={() => onNavigate("virtual-labs")}><ConceptIcon icon="simulation"/>Virtual Labs <ChevronRight size={14}/></button><button onClick={() => onNavigate("structure-draw")}><ConceptIcon icon="inventor"/>Structure Draw</button><button onClick={() => onNavigate("physical-chemistry")}><ConceptIcon icon="gas"/>Physical chemistry</button><button onClick={() => onNavigate("organic-chemistry")}><ConceptIcon icon="organic"/>Organic chemistry</button><button onClick={() => onNavigate("inorganic-chemistry")}><ConceptIcon icon="crystal"/>Inorganic chemistry</button><button onClick={() => onNavigate("analytical-chemistry")}><ConceptIcon icon="research"/>Analytical chemistry</button><button onClick={() => browse()}>Browse all categories <ChevronRight size={14}/></button></div>
          <section className="dash-new-labs" aria-labelledby="dash-new-labs-title">
            <header><div><span className="hub-eyebrow">NEW INTERACTIVE EXPERIENCES</span><h2 id="dash-new-labs-title">Virtual Labs &amp; Simulators</h2><p>Launch any of the {completedVirtualLabs.length} completed, model-driven laboratory workflows.</p></div><button onClick={() => onNavigate("virtual-labs")}>View lab home <ChevronRight size={14}/></button></header>
            <div>{completedVirtualLabs.map(lab=><button key={lab.id} onClick={()=>onNavigate(lab.route)}><FlaskConical size={15}/><span><b>{lab.title}</b><small>{lab.subject} · {lab.screens} screens</small></span><ChevronRight size={13}/></button>)}</div>
          </section>
          <div className="dash-workspace">
            <section className="dash-panel dash-molecule-card">
              <div className="dash-molecule-info">
                <span className="dash-eyebrow">Molecule of the day</span>
                <h2>Caffeine</h2>
                <div className="dash-formula">C₈H₁₀N₄O₂</div>
                <div className="dash-iupac">1,3,7-Trimethylxanthine</div>
                <span className="dash-tag">Bioactive molecule</span>
                <p className="dash-desc">
                  A natural stimulant found in coffee, tea and cacao. Rotate the
                  model to inspect its fused-ring structure and nitrogen-rich
                  functional groups.
                </p>
                <div className="dash-stats">
                  <div className="dash-stat">
                    <span>Molar mass</span>
                    <b>194.19 g/mol</b>
                  </div>
                  <div className="dash-stat">
                    <span>Melting point</span>
                    <b>238°C (dec.)</b>
                  </div>
                  <div className="dash-stat">
                    <span>Boiling point</span>
                    <b>178°C (subl.)</b>
                  </div>
                </div>
              </div>
              <div className="dash-canvas-wrap">
                <CaffeineViewer
                  mode={mode}
                  autoRotate={autoRotate}
                  isolate={isolate}
                  zoomSignal={zoomSignal}
                  onAtom={chooseAtom}
                />
                <div className="dash-orbit-hint">
                  <Rotate3D size={12} />
                  Drag to rotate · Scroll to zoom
                </div>
              </div>
              <div className="dash-molecule-controls">
                <h3>Atom legend</h3>
                <div className="dash-legend">
                  {[
                    ["C", "#293638", "Carbon"],
                    ["O", "#d9473f", "Oxygen"],
                    ["N", "#2e69d3", "Nitrogen"],
                    ["H", "#e8eeee", "Hydrogen"],
                  ].map(([symbol, color, name]) => (
                    <span key={symbol}>
                      <i className="atom-dot" style={{ background: color }} />
                      {symbol} {name}
                    </span>
                  ))}
                </div>
                <h3>Explore</h3>
                <div className="dash-control-grid">
                  <button
                    className={autoRotate ? "on" : ""}
                    onClick={() => setAutoRotate((v) => !v)}
                  >
                    <Rotate3D size={13} />
                    {autoRotate ? "Pause rotate" : "Rotate"}
                  </button>
                  <button onClick={() => setZoomSignal((v) => v + 1)}>
                    <ZoomIn size={13} />
                    Zoom
                  </button>
                  <button
                    className={isolate ? "on" : ""}
                    onClick={() => setIsolate((v) => !v)}
                  >
                    <Focus size={13} />
                    Isolate N
                  </button>
                  <button
                    onClick={() => setSelectedAtom({ symbol: "C–N", index: 1 })}
                  >
                    <Maximize2 size={13} />
                    Measure bond
                  </button>
                  <button onClick={() => setAutoRotate((v) => !v)}>
                    {autoRotate ? <Pause size={13} /> : <Play size={13} />}
                    Animation
                  </button>
                </div>
              </div>
              <div className="dash-viewbar">
                <span>Representation</span>
                {[
                  ["ball", "Ball & Stick"],
                  ["spacefill", "Spacefill"],
                  ["wireframe", "Wireframe"],
                ].map(([id, label]) => (
                  <button
                    key={id}
                    className={mode === id ? "active" : ""}
                    onClick={() => setMode(id)}
                  >
                    {label}
                  </button>
                ))}
                <span className="dash-bond-readout">
                  {selectedAtom ? `${selectedAtom.symbol} selected · ` : ""}C–N
                  bond 1.34 Å
                </span>
                <button
                  onClick={() =>
                    document
                      .querySelector(".dash-molecule-card")
                      ?.requestFullscreen?.()
                  }
                  aria-label="Fullscreen molecule"
                >
                  <Fullscreen size={13} />
                </button>
              </div>
            </section>
            <aside className="dash-right">
              <section className="dash-panel dash-course">
                <div className="dash-course-art" />
                <div className="dash-course-body">
                  <label>Continue learning</label>
                  <h3>Organic Chemistry</h3>
                  <p>Aromatic Compounds · Lesson 6 of 8</p>
                  <div className="dash-progress">
                    <i />
                  </div>
                  <div className="dash-course-actions">
                    <span>72% complete</span>
                    <button onClick={() => onNavigate("organic-visuals")}>
                      Continue lesson
                    </button>
                  </div>
                </div>
              </section>
              <section className="dash-panel dash-mastery">
                <div className="dash-ring">
                  <span>68%</span>
                </div>
                <div>
                  <h3>Overall mastery</h3>
                  <p>
                    12 concepts mastered
                    <br />4 day learning streak
                  </p>
                </div>
              </section>
              <section className="dash-panel dash-recent">
                <h3>Recent experiments</h3>
                {recent.map(([name, meta, id, glyph]) => (
                  <button key={name} onClick={() => id === "library" ? browse() : id === "simulators" ? browse("simulators") : onNavigate(id)}>
                    <em><ConceptIcon icon={glyph}/></em>
                    <span>
                      {name}
                      <small>{meta}</small>
                    </span>
                    <ChevronRight size={12} style={{ marginLeft: "auto" }} />
                  </button>
                ))}
              </section>
            </aside>
          </div>
          <section className="dash-modules">
            {modules.map(([id, title, note, Icon], index) => (
              <button
                className="dash-module"
                key={id}
                onClick={() => id === "library" ? browse() : id === "simulators" ? browse("simulators") : onNavigate(id)}
              >
                <div className="hub-feature-art" style={{"--category-color": ["#aa96ff", "#4ee4ff", "#71e4b5", "#aa8eff", "#e992ff", "#ffc780"][index]}}><ConceptIcon icon={conceptPng[id]}/></div>
                <i>
                  <Icon size={15} />
                </i>
                <span>
                  <b>{title}</b>
                  <small>{note}</small>
                </span>
              </button>
            ))}
          </section>
          <HomeLibrary query={query} setQuery={setQuery} category={category} setCategory={setCategory} subgroup={subgroup} setSubgroup={setSubgroup} onNavigate={onNavigate}/>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
