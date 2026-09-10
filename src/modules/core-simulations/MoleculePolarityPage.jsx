import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Atom,
  BookOpen,
  FlaskConical,
  Home,
  Maximize2,
  RotateCcw,
  Settings,
  SlidersHorizontal,
  TableProperties,
  Zap,
} from "lucide-react";
import "./MoleculePolarityPage.css";
import MolstarViewer from "../../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../../components/molecular-viewer/ViewerErrorBoundary.jsx";

const EN = { H: 2.2, C: 2.55, N: 3.04, O: 3.44, F: 3.98, B: 2.04, Cl: 3.16 };
const colors = {
  H: 0xe8f1ff,
  C: 0x596779,
  N: 0x258cff,
  O: 0xed3046,
  F: 0x65df8a,
  B: 0xefaa5d,
  Cl: 0x42d872,
};
const molecules = {
  CO2: {
    name: "Carbon dioxide",
    formula: "CO₂",
    geometry: "Linear",
    point: "D∞h",
    dipole: 0,
    atoms: [
      ["O", -2.1, 0, 0],
      ["C", 0, 0, 0],
      ["O", 2.1, 0, 0],
    ],
    bonds: [
      [1, 0],
      [1, 2],
    ],
    note: "Equal C–O dipoles point in opposite directions and cancel.",
  },
  H2O: {
    name: "Water",
    formula: "H₂O",
    geometry: "Bent",
    point: "C₂v",
    dipole: 1.85,
    atoms: [
      ["O", 0, 0.45, 0],
      ["H", -1.55, -0.8, 0.2],
      ["H", 1.55, -0.8, -0.2],
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
    note: "The O–H bond dipoles reinforce along the molecular bisector.",
  },
  NH3: {
    name: "Ammonia",
    formula: "NH₃",
    geometry: "Trigonal pyramidal",
    point: "C₃v",
    dipole: 1.47,
    atoms: [
      ["N", 0, 0.55, 0],
      ["H", -1.45, -0.8, 0.5],
      ["H", 1.45, -0.8, 0.5],
      ["H", 0, -0.7, -1.35],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    note: "Three N–H dipoles produce a resultant toward nitrogen.",
  },
  BF3: {
    name: "Boron trifluoride",
    formula: "BF₃",
    geometry: "Trigonal planar",
    point: "D₃h",
    dipole: 0,
    atoms: [
      ["B", 0, 0, 0],
      ["F", 0, 2, 0],
      ["F", -1.75, -1, 0],
      ["F", 1.75, -1, 0],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
    note: "Three B–F dipoles cancel by trigonal symmetry.",
  },
  CH2Cl2: {
    name: "Dichloromethane",
    formula: "CH₂Cl₂",
    geometry: "Tetrahedral",
    point: "C₂v",
    dipole: 1.6,
    atoms: [
      ["C", 0, 0, 0],
      ["Cl", -1.75, 1.3, 0.55],
      ["Cl", 1.75, 1.3, -0.45],
      ["H", -1.15, -1.55, -0.7],
      ["H", 1.15, -1.55, 0.75],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
    note: "The bond dipoles do not cancel due to the asymmetric arrangement of atoms.",
  },
};

function moleculeMol(molecule) {
  const atomLines=molecule.atoms.map(([element,x,y,z])=>`${x.toFixed(4).padStart(10)}${y.toFixed(4).padStart(10)}${z.toFixed(4).padStart(10)} ${element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join("\n");
  const bondLines=molecule.bonds.map(([from,to])=>`${String(from+1).padStart(3)}${String(to+1).padStart(3)}  1  0  0  0  0`).join("\n");
  return {data:`${molecule.name} (${molecule.formula})\n  Molecule Polarity Lab\n\n${String(molecule.atoms.length).padStart(3)}${String(molecule.bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\nM  END\n`,format:"mol",label:`${molecule.name} · curated geometry`};
}

function bondCylinder(a, b, material) {
  const start = new THREE.Vector3(a[1], a[2], a[3]),
    end = new THREE.Vector3(b[1], b[2], b[3]),
    mid = start.clone().add(end).multiplyScalar(0.5),
    len = start.distanceTo(end);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, len, 24),
    material,
  );
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    end.clone().sub(start).normalize(),
  );
  return mesh;
}
function MoleculeCanvas({
  molecule,
  showDipoles,
  showCharges,
  showResult,
  showLonePairs,
  density,
  view,
  resetKey,
  renderMode,
  showField,
  fieldAngle,
}) {
  const ref = useRef();
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 14);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    host.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xbfe8ff, 0x07101d, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3);
    key.position.set(-4, 6, 8);
    scene.add(key);
    const rim = new THREE.PointLight(0x5b70ff, 40, 20);
    rim.position.set(4, 1, 5);
    scene.add(rim);
    const group = new THREE.Group();
    scene.add(group);
    const bondMat = new THREE.MeshStandardMaterial({
      color: 0xdbe9f5,
      metalness: 0.45,
      roughness: 0.28,
    });
    molecule.bonds.forEach(([a, b]) =>
      group.add(bondCylinder(molecule.atoms[a], molecule.atoms[b], bondMat)),
    );
    molecule.atoms.forEach((atom) => {
      const radius = renderMode === "ball-stick"
        ? (atom[0] === "H" ? 0.42 : atom[0] === "C" ? 0.58 : 0.7)
        : (atom[0] === "H" ? 0.55 : atom[0] === "C" ? 0.78 : 1);
      const mat = new THREE.MeshPhysicalMaterial({
        color: colors[atom[0]],
        roughness: renderMode === "ball-stick" ? 0.34 : 0.24,
        metalness: 0.05,
        clearcoat: 1,
      });
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 40, 32),
        mat,
      );
      mesh.position.set(atom[1], atom[2], atom[3]);
      group.add(mesh);
    });
    if (density) {
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(3.3, 40, 28),
        new THREE.MeshPhysicalMaterial({
          color: 0x527cff,
          transparent: true,
          opacity: 0.15,
          roughness: 0.3,
          transmission: 0.2,
          side: THREE.DoubleSide,
        }),
      );
      group.add(shell);
    }
    if (showLonePairs) {
      molecule.atoms.forEach((atom) => {
        if (!["O", "N", "F", "Cl"].includes(atom[0])) return;
        const center = new THREE.Vector3(atom[1], atom[2], atom[3]);
        [-0.22, 0.22].forEach((offset) => {
          const pair = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 16, 12),
            new THREE.MeshBasicMaterial({ color: 0x7ce7ff }),
          );
          pair.position.copy(center).add(new THREE.Vector3(offset, 0.42, 0));
          group.add(pair);
        });
      });
    }
    if (showDipoles)
      molecule.bonds.forEach(([from, to], i) => {
        const a = molecule.atoms[from],
          b = molecule.atoms[to],
          av = new THREE.Vector3(a[1], a[2], a[3]),
          bv = new THREE.Vector3(b[1], b[2], b[3]),
          dir = (
            EN[b[0]] > EN[a[0]] ? bv.clone().sub(av) : av.clone().sub(bv)
          ).normalize();
        const origin = av.clone().lerp(bv, 0.28);
        group.add(
          new THREE.ArrowHelper(
            dir,
            origin,
            1.25,
            i < 2 ? 0x63ff99 : 0xffc23f,
            0.35,
            0.2,
          ),
        );
      });
    if (showResult && molecule.dipole)
      group.add(
        new THREE.ArrowHelper(
          new THREE.Vector3(0, 1, 0),
          new THREE.Vector3(0, 0.2, 0.2),
          2.7,
          0xa36cff,
          0.55,
          0.32,
        ),
      );
    if(showField){
      const angle=THREE.MathUtils.degToRad(fieldAngle);
      group.add(new THREE.ArrowHelper(new THREE.Vector3(Math.sin(angle),Math.cos(angle),0),new THREE.Vector3(-Math.sin(angle)*2.8,-Math.cos(angle)*2.8,0),5.6,0x35d5ff,.45,.25));
    }
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    const presets = {
      Front: [0, 0, 14],
      Top: [0, 14, 0.1],
      Right: [14, 0, 0.1],
    };
    camera.position.set(...(presets[view] || presets.Front));
    controls.update();
    const resize = () => {
      const b = host.getBoundingClientRect();
      renderer.setSize(b.width, b.height, false);
      camera.aspect = b.width / b.height;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    let raf;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material) {
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) =>
            m.dispose(),
          );
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [molecule, showDipoles, showCharges, showResult, showLonePairs, density, view, resetKey, renderMode, showField, fieldAngle]);
  return (
    <div
      ref={ref}
      className="mp-canvas"
      aria-label={`Interactive 3D model of ${molecule.name}`}
    />
  );
}
function Mini({ m }) {
  return (
    <span className="mp-mini">
      {m.atoms.slice(0, 4).map((a, i) => (
        <i
          key={i}
          style={{
            background: `#${colors[a[0]].toString(16).padStart(6, "0")}`,
          }}
        />
      ))}
    </span>
  );
}
function Toggle({ label, on, set }) {
  return (
    <button className="mp-toggle" onClick={() => set(!on)}>
      <i className={on ? "on" : ""} />
      {label}
    </button>
  );
}
export default function MoleculePolarityPage() {
  const molRef=useRef(null);
  const [id, setId] = useState("CH2Cl2"),
    [dipoles, setDipoles] = useState(true),
    [charges, setCharges] = useState(true),
    [sum, setSum] = useState(true),
    [density, setDensity] = useState(false),
    [lone, setLone] = useState(false),
    [view, setView] = useState("Front"),
    [activeTab, setActiveTab] = useState("Model"),
    [renderMode, setRenderMode] = useState("realistic"),
    [resetKey, setResetKey] = useState(0),
    [structureMode,setStructureMode]=useState("vectors"),
    [molReady,setMolReady]=useState(false),
    [molAtom,setMolAtom]=useState(null),
    [showField,setShowField]=useState(false),
    [fieldAngle,setFieldAngle]=useState(0);
  const m = molecules[id];
  const molSource=useMemo(()=>moleculeMol(m),[m]);
  useEffect(()=>{setMolReady(false);setMolAtom(null);},[id]);
  const bondTypes = useMemo(() => {
    const map = new Map();
    m.bonds.forEach(([a, b]) => {
      const x = m.atoms[a][0],
        y = m.atoms[b][0],
        key = [x, y].sort().join("–");
      map.set(key, { label: `${x} – ${y}`, delta: Math.abs(EN[x] - EN[y]) });
    });
    return [...map.values()];
  }, [m]);
  return (
    <div className="mp-app">
      <header>
        <FlaskConical />
        <div>
          <h1>Molecule Polarity Lab</h1>
          <p>
            Explore molecular geometry, bond dipoles, and net dipole moments
          </p>
        </div>
        <nav>
          {["Model", "2D View", "Data", "Learn"].map((tab) => (
            <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>
          ))}
          <button>☀</button>
          <button>
            <Settings />
          </button>
        </nav>
      </header>
      <aside>
        {[
          [Home, "Home"],
          [Atom, "Molecules"],
          [SlidersHorizontal, "Compare"],
          [TableProperties, "Periodic Table"],
          [Settings, "Tools"],
          [BookOpen, "Notebook"],
        ].map(([I, n], i) => (
          <button key={n} className={i === 1 ? "active" : ""} onClick={() => {
            const routes = { Home: "dashboard", Molecules: "molecule-polarity", Compare: "compare", "Periodic Table": "table", Tools: "study-tools", Notebook: "syllabus" };
            if (routes[n]) window.location.hash = `#${routes[n]}`;
          }}>
            <I />
            {n}
          </button>
        ))}
      </aside>
      <main>
        {activeTab !== "Model" && <div className="mp-tab-banner"><b>{activeTab}</b><span>{activeTab === "2D View" ? "Vector diagram and bond-dipole geometry are shown below." : activeTab === "Data" ? `Pauling electronegativities and net dipole for ${m.formula} are summarized in the analysis panel.` : "Use the controls to compare symmetry, bond dipoles, and resultant vectors."}</span></div>}
        <section className="mp-presets">
          <h2>Molecule Presets</h2>
          {Object.entries(molecules).map(([key, x]) => (
            <button
              key={key}
              className={id === key ? "active" : ""}
              onClick={() => setId(key)}
            >
              <Mini m={x} />
              <span>
                <b>{x.formula}</b>
                <small>
                  {x.geometry}
                  <br />
                  {x.dipole ? "Polar" : "Nonpolar"} · {x.dipole.toFixed(2)} D
                </small>
              </span>
            </button>
          ))}
        </section>
        <section className="mp-stage">
          <div className="mp-structure-mode"><button className={structureMode==="vectors"?"active":""} onClick={()=>setStructureMode("vectors")}>Dipole vectors</button><button className={structureMode==="molstar"?"active":""} onClick={()=>setStructureMode("molstar")}>Mol* geometry</button></div>
          {structureMode==="vectors"?<MoleculeCanvas
            molecule={m}
            showDipoles={dipoles}
            showCharges={charges}
            showResult={sum}
            showLonePairs={lone}
            density={density}
            view={view}
            resetKey={resetKey}
            renderMode={renderMode}
            showField={showField}
            fieldAngle={fieldAngle}
          />:<div className="mp-molstar"><ViewerErrorBoundary label="Molecule polarity structure viewer"><MolstarViewer ref={molRef} source={molSource} sourceType={molSource.format} label={molSource.label} representation={{BallAndStick:renderMode==="ball-stick",Spacefill:renderMode==="realistic",Ligand:false,Branched:false,Ion:false}} colorScheme="element" onReady={()=>{setMolReady(true);requestAnimationFrame(()=>molRef.current?.zoom(1.3));}} onLoadError={()=>setMolReady(false)} onSelectionChange={setMolAtom}/></ViewerErrorBoundary><div className="mp-mol-meta"><b>{molReady?"Mol* coordinate view ready":"Loading coordinates…"}</b><span>Curated gas-phase teaching geometry · not an experimental structure</span><span>{molAtom?`${molAtom.element} atom ${molAtom.sourceIndex+1} · [${molAtom.coordinates.map(value=>value.toFixed(2)).join(", ")}] Å`:"Click an atom for coordinates"}</span></div><button className="mp-mol-full" aria-label="Full screen molecular geometry" onClick={()=>molRef.current?.fullscreen()}><Maximize2/> Fullscreen</button></div>}
          <div className="mp-net">
            Net molecular dipole<b>{m.dipole.toFixed(2)} D</b>
          </div>
          {charges && structureMode === "vectors" && (
            <>
              <span className="mp-charge c1">δ−</span>
              <span className="mp-charge c2">δ−</span>
              <span className="mp-charge c3">δ+</span>
              <span className="mp-charge c4">δ+</span>
            </>
          )}
          <footer>
            🖱 Drag to rotate　 ◉ Scroll to zoom　 ⦿ Click to reset{" "}
            <div>
              <button className={renderMode === "realistic" ? "active" : ""} onClick={() => setRenderMode("realistic")}>Realistic</button>
              <button className={renderMode === "ball-stick" ? "active" : ""} onClick={() => setRenderMode("ball-stick")}>Ball &amp; Stick</button>
            </div>
          </footer>
        </section>
        <section className="mp-analysis">
          <article>
            <h2>Molecule Analysis</h2>
            <h3>
              {m.formula}
              <Mini m={m} />
            </h3>
            <p>{m.name}</p>
            <dl>
              <dt>Geometry</dt>
              <dd>{m.geometry}</dd>
              <dt>Point group</dt>
              <dd>{m.point}</dd>
            </dl>
            <h4>Electronegativity (Pauling)</h4>
            {[...new Set(m.atoms.map((a) => a[0]))].map((a) => (
              <div className="mp-en" key={a}>
                <span>{a}</span>
                <b>{EN[a].toFixed(2)}</b>
              </div>
            ))}
            <h4>Bond dipoles</h4>
            {bondTypes.map((b, i) => (
              <div className="mp-bond-row" key={b.label}>
                <i className={i ? "gold" : ""}>➜</i>
                {b.label}
                <span>ΔEN = {b.delta.toFixed(2)}</span>
                <b>
                  {b.label.includes("H") ? "0.38" : (b.delta * 1.57).toFixed(2)}{" "}
                  D (×2)
                </b>
              </div>
            ))}
            <h4>Net molecular dipole</h4>
            <strong>
              {m.dipole ? "Polar" : "Nonpolar"} · {m.dipole.toFixed(2)} D
            </strong>
            <p>{m.note}</p>
          </article>
          <article className="mp-options">
            <h2>Display Options</h2>
            <Toggle
              label="Electron-density surface"
              on={density}
              set={setDensity}
            />
            <Toggle
              label="Partial charges (δ+/δ−)"
              on={charges}
              set={setCharges}
            />
            <Toggle label="Bond dipoles" on={dipoles} set={setDipoles} />
            <Toggle label="Vector addition" on={sum} set={setSum} />
            <Toggle label="Lone pairs" on={lone} set={setLone} />
            <Toggle label="Electric field" on={showField} set={setShowField} />
            {showField&&<label className="mp-field"><span><Zap/>Field orientation</span><output>{fieldAngle}°</output><input aria-label="Electric field orientation" type="range" min="0" max="360" value={fieldAngle} onChange={event=>setFieldAngle(Number(event.target.value))}/></label>}
          </article>
        </section>
        <section className="mp-vectors">
          <h2>2D Vector Diagram (head-to-tail)</h2>
          <div className="mp-vector-key">
            <span>➜ C – Cl (×2)</span>
            <span>➜ C – H (×2)</span>
            <span>➜ Net dipole ({m.dipole.toFixed(2)} D)</span>
          </div>
          <svg viewBox="0 0 470 170">
            <path className="green" d="M235 140 L145 70 M235 140 L325 70" />
            <path className="gold" d="M235 140 L195 165 M235 140 L275 165" />
            <path className="purple" d="M235 140 L235 25" />
            <text x="180" y="165">
              Resultant: {m.dipole.toFixed(2)} D (upward)
            </text>
          </svg>
        </section>
        <section className="mp-axis">
          <h2>View Along Axis</h2>
          {["Front", "Top", "Right"].map((v) => (
            <button
              key={v}
              className={view === v ? "active" : ""}
              onClick={() => setView(v)}
            >
              <Mini m={m} />
              {v}
            </button>
          ))}
          <button
            className="mp-reset"
            onClick={() => setResetKey((k) => k + 1)}
          >
            <RotateCcw />
            Reset view
          </button>
        </section>
      </main>
    </div>
  );
}
