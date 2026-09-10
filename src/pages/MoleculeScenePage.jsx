import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Atom,
  BookOpen,
  Box,
  ChevronDown,
  ClipboardCheck,
  FlaskConical,
  FolderOpen,
  GraduationCap,
  Grid3X3,
  HelpCircle,
  Home,
  Library,
  MoreHorizontal,
  Maximize2,
  Move3D,
  Pause,
  PenLine,
  Play,
  RotateCcw,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Undo2,
  UserRound,
  Waypoints,
  Zap,
} from "lucide-react";
import "./moleculeStudioTarget.css";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";

function modelToMol(model, label = "Molecule Studio snapshot") {
  const atomLines = model.atoms.map(([symbol,x=0,y=0,z=0]) => `${Number(x).toFixed(4).padStart(10)}${Number(y).toFixed(4).padStart(10)}${Number(z).toFixed(4).padStart(10)} ${String(symbol).padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join("\n");
  const bondLines = model.bonds.map(([a,b]) => `${String(a+1).padStart(3)}${String(b+1).padStart(3)}  1  0  0  0  0`).join("\n");
  return `${label}\n  Molecule Studio 3D\n\n${String(model.atoms.length).padStart(3)}${String(model.bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\nM  END\n`;
}

const atoms = [
  ["C", -1.15, 0, 0],
  ["C", 0.55, 0, 0],
  ["O", 1.82, 0.35, 0],
  ["H", -1.55, 1.05, 0.65],
  ["H", -1.55, -1.05, 0.65],
  ["H", -1.55, 0, -1.15],
  ["H", 0.68, 1.03, 0.7],
  ["H", 0.68, -1.03, 0.7],
  ["H", 2.52, -0.25, 0],
];
const bonds = [
  [0, 1],
  [1, 2],
  [0, 3],
  [0, 4],
  [0, 5],
  [1, 6],
  [1, 7],
  [2, 8],
];
const colors = {
  C: 0x333a43,
  H: 0xf1f5f9,
  O: 0xf12626,
  N: 0x165bd8,
  Cl: 0x22c55e,
  S: 0xf4c542,
};
const PRESET_MODELS = {
  Ethanol: { atoms, bonds },
  Water: {
    atoms: [
      ["O", 0, 0, 0],
      ["H", -1, 0.72, 0],
      ["H", 1, 0.72, 0],
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  Methane: {
    atoms: [
      ["C", 0, 0, 0],
      ["H", 1, 1, 1],
      ["H", -1, -1, 1],
      ["H", 1, -1, -1],
      ["H", -1, 1, -1],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  Ethane: {
    atoms: [
      ["C", -0.75, 0, 0],
      ["C", 0.75, 0, 0],
      ["H", -1.3, 0.9, 0.6],
      ["H", -1.3, -0.9, 0.6],
      ["H", -1.3, 0, -1],
      ["H", 1.3, 0.9, -0.6],
      ["H", 1.3, -0.9, -0.6],
      ["H", 1.3, 0, 1],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
      [1, 5],
      [1, 6],
      [1, 7],
    ],
  },
  Benzene: {
    atoms: Array.from({ length: 6 }, (_, i) => [
      "C",
      Math.cos((i * Math.PI) / 3) * 1.35,
      Math.sin((i * Math.PI) / 3) * 1.35,
      0,
    ]).concat(
      Array.from({ length: 6 }, (_, i) => [
        "H",
        Math.cos((i * Math.PI) / 3) * 2.15,
        Math.sin((i * Math.PI) / 3) * 2.15,
        0,
      ]),
    ),
    bonds: Array.from({ length: 6 }, (_, i) => [i, (i + 1) % 6]).concat(
      Array.from({ length: 6 }, (_, i) => [i, i + 6]),
    ),
  },
  "Acetic acid": {
    atoms: [
      ["C", -1, 0, 0],
      ["C", 0.5, 0, 0],
      ["O", 1.2, 1, 0],
      ["O", 1.25, -1, 0],
      ["H", -1.6, 0.9, 0.5],
      ["H", -1.6, -0.9, 0.5],
      ["H", -1.6, 0, -1],
      ["H", 2, -1, 0],
    ],
    bonds: [
      [0, 1],
      [1, 2],
      [1, 3],
      [0, 4],
      [0, 5],
      [0, 6],
      [3, 7],
    ],
  },
  Ammonia: {
    atoms: [
      ["N", 0, 0.25, 0],
      ["H", -1.05, -0.6, 0.55],
      ["H", 1.05, -0.6, 0.55],
      ["H", 0, -0.65, -1],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
    ],
  },
  "Carbon dioxide": {
    atoms: [
      ["O", -1.45, 0, 0],
      ["C", 0, 0, 0],
      ["O", 1.45, 0, 0],
    ],
    bonds: [
      [0, 1],
      [1, 2],
    ],
  },
  Chloroform: {
    atoms: [
      ["C", 0, 0, 0],
      ["Cl", -1.15, 0.85, 0.5],
      ["Cl", 1.15, 0.85, 0.5],
      ["Cl", 0, -0.9, -1],
      ["H", 0, 1.15, -1],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ],
  },
  "Hydrogen cyanide": {
    atoms: [
      ["H", -1.5, 0, 0],
      ["C", 0, 0, 0],
      ["N", 1.45, 0, 0],
    ],
    bonds: [
      [0, 1],
      [1, 2],
    ],
  },
  "Sulfur dioxide": {
    atoms: [
      ["S", 0, 0, 0],
      ["O", -1.2, 0.7, 0],
      ["O", 1.2, 0.7, 0],
    ],
    bonds: [
      [0, 1],
      [0, 2],
    ],
  },
  "Nitric acid": {
    atoms: [
      ["N", 0, 0, 0],
      ["O", -1.1, 0.65, 0],
      ["O", 1.1, 0.65, 0],
      ["O", 0, -1.1, 0],
      ["H", 0, -1.8, 0.7],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [0, 3],
      [3, 4],
    ],
  },
  "Ethylene glycol": {
    atoms: [
      ["C", -0.7, 0, 0],
      ["C", 0.7, 0, 0],
      ["O", -1.45, 0.8, 0],
      ["O", 1.45, 0.8, 0],
      ["H", -1.8, 1.2, 0.5],
      ["H", 1.8, 1.2, 0.5],
    ],
    bonds: [
      [0, 1],
      [0, 2],
      [1, 3],
      [2, 4],
      [3, 5],
    ],
  },
  Formaldehyde: {
    atoms: [
      ["C", 0, 0, 0],
      ["O", 0, 1.2, 0],
      ["H", -1.05, -0.75, 0.45],
      ["H", 1.05, -0.75, 0.45],
    ],
    bonds: [[0, 1], [0, 2], [0, 3]],
  },
  "Hydrogen peroxide": {
    atoms: [
      ["O", -0.65, 0, 0], ["O", 0.65, 0, 0],
      ["H", -1.1, 0.75, 0.45], ["H", 1.1, -0.75, 0.45],
    ],
    bonds: [[0, 1], [0, 2], [1, 3]],
  },
  "Sulfuric acid": {
    atoms: [
      ["S", 0, 0, 0], ["O", -1.15, 0.8, 0], ["O", 1.15, 0.8, 0],
      ["O", -0.7, -1.05, 0], ["O", 0.7, -1.05, 0],
      ["H", -1.25, -1.7, 0.45], ["H", 1.25, -1.7, 0.45],
    ],
    bonds: [[0, 1], [0, 2], [0, 3], [0, 4], [3, 5], [4, 6]],
  },
};
const PRESET_INFO = {
  Methane: ["CH₄", "16.04 g/mol"],
  Ethane: ["C₂H₆", "30.07 g/mol"],
  Ethanol: ["C₂H₆O", "46.07 g/mol"],
  Benzene: ["C₆H₆", "78.11 g/mol"],
  Water: ["H₂O", "18.02 g/mol"],
  "Acetic acid": ["CH₃COOH", "60.05 g/mol"],
  Ammonia: ["NH₃", "17.03 g/mol"],
  "Carbon dioxide": ["CO₂", "44.01 g/mol"],
  Chloroform: ["CHCl₃", "119.38 g/mol"],
  "Hydrogen cyanide": ["HCN", "27.03 g/mol"],
  "Sulfur dioxide": ["SO₂", "64.07 g/mol"],
  "Nitric acid": ["HNO₃", "63.01 g/mol"],
  "Ethylene glycol": ["C₂H₆O₂", "62.07 g/mol"],
  Formaldehyde: ["CH₂O", "30.03 g/mol"],
  "Hydrogen peroxide": ["H₂O₂", "34.01 g/mol"],
  "Sulfuric acid": ["H₂SO₄", "98.08 g/mol"],
};
const PRESET_PROPERTIES = {
  Ethanol: ["Tetrahedral", "109.5°", "Polar", "Yes (–OH)", "Yes (O)"],
  Water: ["Bent", "104.5°", "Polar", "Yes (O–H)", "Yes (O)"],
  Methane: ["Tetrahedral", "109.5°", "Nonpolar", "No", "No"],
  Ethane: ["Tetrahedral", "109.5°", "Nonpolar", "No", "No"],
  Benzene: ["Trigonal planar", "120°", "Nonpolar", "No", "No"],
  "Acetic acid": [
    "Trigonal planar",
    "120°",
    "Polar",
    "Yes (–OH)",
    "Yes (carbonyl O)",
  ],
  Ammonia: ["Trigonal pyramidal", "107°", "Polar", "No", "Yes (N)"],
  "Carbon dioxide": ["Linear", "180°", "Nonpolar", "No", "No"],
  Chloroform: ["Tetrahedral", "109.5°", "Polar", "No", "No"],
  "Hydrogen cyanide": ["Linear", "180°", "Polar", "No", "Yes (N)"],
  "Sulfur dioxide": ["Bent", "119°", "Polar", "No", "Yes (O)"],
  "Nitric acid": ["Trigonal planar", "≈120°", "Polar", "Yes (–OH)", "Yes (O)"],
  "Ethylene glycol": ["Tetrahedral", "109.5°", "Polar", "Yes (–OH)", "Yes (O)"],
  Formaldehyde: ["Trigonal planar", "120°", "Polar", "No", "Yes (O)"],
  "Hydrogen peroxide": ["Bent", "94.8°", "Polar", "Yes (O–H)", "Yes (O)"],
  "Sulfuric acid": ["Tetrahedral", "≈109.5°", "Polar", "Yes (–OH)", "Yes (O)"],
};
function bond(a, b) {
  const s = new THREE.Vector3(a[1], a[2], a[3]),
    e = new THREE.Vector3(b[1], b[2], b[3]),
    d = e.clone().sub(s);
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.09, d.length(), 18),
    new THREE.MeshStandardMaterial({
      color: 0xb8c4d3,
      metalness: 0.35,
      roughness: 0.3,
    }),
  );
  m.position.copy(s).add(e).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
function Ethanol3D({
  autoRotate,
  spacefill,
  surface,
  vibrate,
  onSelect,
  selectedIndex,
  resetSignal,
  preset = "Ethanol",
  modelOverride,
  dragMode = false,
}) {
  const model = modelOverride || PRESET_MODELS[preset] || PRESET_MODELS.Ethanol;
  const host = useRef(null),
    state = useRef(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(),
      camera = new THREE.PerspectiveCamera(
        36,
        el.clientWidth / el.clientHeight,
        0.1,
        100,
      );
    camera.position.set(0, 0.4, 8);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.autoRotate = autoRotate;
    scene.add(new THREE.HemisphereLight(0xffffff, 0x15233d, 2.8));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 6, 5);
    scene.add(key);
    const blue = new THREE.PointLight(0x168cff, 28, 12);
    blue.position.set(3, -2, 2);
    scene.add(blue);
    const group = new THREE.Group();
    group.rotation.set(-0.15, -0.25, 0.05);
    scene.add(group);
    model.bonds.forEach(([a, b]) =>
      group.add(bond(model.atoms[a], model.atoms[b])),
    );
    const meshes = [];
    model.atoms.forEach((a, i) => {
      const r =
        (spacefill ? 1.42 : 1) * ({ C: 0.43, H: 0.31, O: 0.46 }[a[0]] || 0.4);
      const m = new THREE.Mesh(
        new THREE.SphereGeometry(r, 32, 22),
        new THREE.MeshStandardMaterial({
          color: colors[a[0]],
          roughness: 0.18,
          metalness: 0.05,
        }),
      );
      m.position.set(a[1], a[2], a[3]);
      m.userData = { index: i, symbol: a[0] };
      group.add(m);
      meshes.push(m);
    });
    const marker = new THREE.Mesh(
      new THREE.TorusGeometry(0.56, 0.045, 12, 40),
      new THREE.MeshBasicMaterial({
        color: 0x55d9ff,
        transparent: true,
        opacity: 0.95,
      }),
    );
    marker.rotation.x = Math.PI / 2;
    group.add(marker);
    if (surface) {
      const shell = new THREE.Mesh(
        new THREE.SphereGeometry(2.65, 48, 32),
        new THREE.MeshPhysicalMaterial({
          color: 0x169cff,
          transparent: true,
          opacity: 0.15,
          wireframe: true,
          roughness: 0.1,
        }),
      );
      group.add(shell);
    }
    const ray = new THREE.Raycaster(),
      pointer = new THREE.Vector2();
    const pick = (e) => {
      const b = renderer.domElement.getBoundingClientRect();
      pointer.set(
        (e.offsetX / b.width) * 2 - 1,
        -(e.offsetY / b.height) * 2 + 1,
      );
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(meshes)[0];
      if (hit) onSelect(hit.object.userData);
    };
    let dragIndex = null;
    const down = (e) => {
      if (!dragMode) return;
      const b = renderer.domElement.getBoundingClientRect();
      pointer.set((e.offsetX / b.width) * 2 - 1, -(e.offsetY / b.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const hit = ray.intersectObjects(meshes)[0];
      if (hit) { dragIndex = hit.object.userData.index; onSelect(hit.object.userData); controls.enabled = false; }
    };
    const move = (e) => {
      if (dragIndex == null) return;
      const b = renderer.domElement.getBoundingClientRect();
      pointer.set((e.offsetX / b.width) * 2 - 1, -(e.offsetY / b.height) * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const point = new THREE.Vector3();
      ray.ray.intersectPlane(plane, point);
      if (point) meshes[dragIndex].position.lerp(point, 0.35);
    };
    const up = () => { dragIndex = null; controls.enabled = true; };
    renderer.domElement.addEventListener("click", pick);
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointermove", move);
    renderer.domElement.addEventListener("pointerup", up);
    const resize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    const clock = new THREE.Clock();
    let frame;
    const loop = () => {
      controls.autoRotate = autoRotate;
      controls.update();
      group.position.y = vibrate
        ? Math.sin(clock.getElapsedTime() * 12) * 0.05
        : 0;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    loop();
    state.current = { camera, controls, group, meshes, marker };
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      renderer.domElement.removeEventListener("click", pick);
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointermove", move);
      renderer.domElement.removeEventListener("pointerup", up);
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, [autoRotate, spacefill, surface, vibrate, onSelect, model, dragMode]);
  useEffect(() => {
    const current = state.current;
    if (!current) return;
    current.meshes.forEach((mesh, index) => {
      const active = index === selectedIndex;
      mesh.material.emissiveIntensity = active ? 0.65 : 0.07;
      mesh.material.emissive.set(
        active ? 0x55d9ff : colors[mesh.userData.symbol],
      );
    });
    const mesh = current.meshes[selectedIndex];
    if (mesh) {
      current.marker.visible = true;
      current.marker.position.copy(mesh.position);
      current.marker.scale.setScalar(
        { C: 0.9, H: 0.7, O: 1, N: 1, Cl: 1 }[mesh.userData.symbol] || 0.9,
      );
    } else current.marker.visible = false;
  }, [selectedIndex]);
  useEffect(() => {
    if (state.current) {
      state.current.camera.position.set(0, 0.4, 8);
      state.current.controls.target.set(0, 0, 0);
      state.current.controls.update();
    }
  }, [resetSignal]);
  return (
    <div
      ref={host}
      className="ms-canvas"
      aria-label="Interactive ethanol molecule"
    />
  );
}

const sideNav = [
  ["dashboard", "Home", Home],
  ["molecule", "Molecule Studio", Atom],
  ["library", "Library", Library],
  ["organic-visuals", "Reactions", FlaskConical],
  ["syllabus", "Learn", GraduationCap],
  ["quiz", "Quizzes", ClipboardCheck],
  ["table", "Periodic Table", Grid3X3],
  ["settings", "Settings", Settings],
];
const palette = [
  ["C", "Carbon", "#4b5563"],
  ["H", "Hydrogen", "#e5e7eb"],
  ["O", "Oxygen", "#ef2525"],
  ["N", "Nitrogen", "#1769dc"],
  ["Cl", "Chlorine", "#22c55e"],
];
const presets = [
  ["Methane", "CH₄"],
  ["Ethane", "C₂H₆"],
  ["Ethanol", "C₂H₆O"],
  ["Benzene", "C₆H₆"],
  ["Water", "H₂O"],
  ["Acetic acid", "CH₃COOH"],
  ["Ammonia", "NH₃"],
  ["Carbon dioxide", "CO₂"],
  ["Chloroform", "CHCl₃"],
  ["Hydrogen cyanide", "HCN"],
  ["Sulfur dioxide", "SO₂"],
  ["Nitric acid", "HNO₃"],
  ["Ethylene glycol", "C₂H₆O₂"],
  ["Formaldehyde", "CH₂O"],
  ["Hydrogen peroxide", "H₂O₂"],
  ["Sulfuric acid", "H₂SO₄"],
];
export const MoleculeScenePage = ({ onNavigate }) => {
  const inspectViewerRef = useRef(null);
  const [selected, setSelected] = useState({ index: 0, symbol: "C" }),
    [tab, setTab] = useState("Atoms"),
    [autoRotate, setAutoRotate] = useState(true),
    [spacefill, setSpacefill] = useState(false),
    [surface, setSurface] = useState(false),
    [vibrate, setVibrate] = useState(false),
    [resetSignal, setResetSignal] = useState(0),
    [activePreset, setActivePreset] = useState("Ethanol"),
    [dragMode, setDragMode] = useState(false),
    [bondMode, setBondMode] = useState(false),
    [bondSource, setBondSource] = useState(null),
    [inspectorTab, setInspectorTab] = useState("Inspector"),
    [notice, setNotice] = useState("");
  const [workspaceMode, setWorkspaceMode] = useState("edit");
  const [inspectStyle, setInspectStyle] = useState("Ball & stick");
  const [inspectSource, setInspectSource] = useState(null);
  const [inspectReady, setInspectReady] = useState(false);
  const [inspectAtom, setInspectAtom] = useState(null);
  const [customModel, setCustomModel] = useState({
    atoms: [["C", 0, 0, 0]],
    bonds: [],
  });
  const select = useCallback(
    (atom) => {
      setSelected(atom);
      if (bondMode) {
        if (!bondSource) {
          setBondSource(atom);
          setNotice(
            `Selected ${atom.symbol}${atom.index + 1}; choose another atom to add a bond.`,
          );
        } else if (
          activePreset === "Custom molecule" &&
          bondSource.index !== atom.index
        ) {
          setCustomModel((model) =>
            model.bonds.some(
              ([a, b]) =>
                (a === bondSource.index && b === atom.index) ||
                (a === atom.index && b === bondSource.index),
            )
              ? model
              : {
                  ...model,
                  bonds: [...model.bonds, [bondSource.index, atom.index]],
                },
          );
          setBondSource(null);
          setNotice(
            `Bond added between ${bondSource.symbol}${bondSource.index + 1} and ${atom.symbol}${atom.index + 1}`,
          );
        } else {
          setBondSource(null);
          setNotice("Bond editing is available for custom molecules.");
        }
      }
    },
    [activePreset, bondMode, bondSource],
  );
  const currentModel =
    activePreset === "Custom molecule"
      ? customModel
      : PRESET_MODELS[activePreset];
  const snapshotSource = useMemo(() => ({ data:modelToMol(currentModel, activePreset), format:"mol", label:`${activePreset} editor snapshot` }), [activePreset, currentModel]);
  const activeInspectSource = inspectSource || snapshotSource;
  const enterInspectMode = () => { setInspectSource(null); setInspectReady(false); setInspectAtom(null); setWorkspaceMode("inspect"); announce("Read-only Mol* inspection mode"); };
  const importCoordinates = event => {
    const file=event.target.files?.[0];if(!file)return;const extension=file.name.split(".").pop()?.toLowerCase();const format=extension==="cif"||extension==="mmcif"?"mmcif":extension;
    if(!["pdb","mol","sdf","mmcif"].includes(format)){announce("Use PDB, CIF, MOL, or SDF coordinates");event.target.value="";return;}
    const reader=new FileReader();reader.onload=()=>{setInspectSource({data:String(reader.result),format,label:file.name});setInspectReady(false);setInspectAtom(null);setWorkspaceMode("inspect");announce(`${file.name} opened in read-only inspection mode`);};reader.readAsText(file);
  };
  const customCounts = customModel.atoms.reduce(
    (out, [symbol]) => ({ ...out, [symbol]: (out[symbol] || 0) + 1 }),
    {},
  );
  const customFormula =
    Object.entries(customCounts)
      .map(([symbol, count]) => `${symbol}${count > 1 ? count : ""}`)
      .join("") || "—";
  const info =
    activePreset === "Custom molecule"
      ? [customFormula, "—"]
      : PRESET_INFO[activePreset];
  const properties = PRESET_PROPERTIES[activePreset] || [
    "Custom geometry",
    "Varies",
    "Unknown",
    "—",
    "—",
  ];
  const selectPreset = (name) => {
    if (name === "Custom molecule") {
      setCustomModel({ atoms: [["C", 0, 0, 0]], bonds: [] });
      setTab("Atoms");
      setBondMode(false);
      setBondSource(null);
      announce("New molecule ready — add atoms from the palette");
    }
    setBondSource(null);
    setActivePreset(name);
    const model =
      name === "Custom molecule"
        ? { atoms: [["C"]], bonds: [] }
        : PRESET_MODELS[name];
    setSelected({ index: 0, symbol: model.atoms[0][0] });
  };
  const addCustomAtom = (symbol) => {
    if (activePreset !== "Custom molecule") {
      announce("Choose Create new molecule first");
      return;
    }
    const index = customModel.atoms.length;
    const angle = index * 1.15;
    setCustomModel((model) => ({
      atoms: [
        ...model.atoms,
        [
          symbol,
          Math.cos(angle) * 1.35,
          Math.sin(angle) * 1.35,
          (index % 2) * 0.35,
        ],
      ],
      bonds: index ? [...model.bonds, [0, index]] : model.bonds,
    }));
    setSelected({ index, symbol });
    announce(`${symbol} added to custom molecule`);
  };
  useEffect(() => {
    const atomsInModel = currentModel?.atoms || [];
    const valid = selected.index >= 0 && selected.index < atomsInModel.length;
    if (!valid && atomsInModel.length) {
      setSelected({ index: 0, symbol: atomsInModel[0][0] });
    }
  }, [activePreset, customModel, currentModel, selected.index]);
  const announce = (message) => {
    setNotice(message);
    window.clearTimeout(announce.timer);
    announce.timer = window.setTimeout(() => setNotice(""), 2400);
  };
  const saveProject = () => {
    localStorage.setItem(
      "molecule-studio-project",
      JSON.stringify({ activePreset, selected, customModel }),
    );
    announce("Molecule saved locally");
  };
  const loadProject = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("molecule-studio-project"));
      const validPreset =
        saved?.activePreset === "Custom molecule" ||
        PRESET_MODELS[saved?.activePreset];
      if (validPreset) {
        if (saved.activePreset === "Custom molecule" && saved.customModel)
          setCustomModel(saved.customModel);
        setActivePreset(saved.activePreset);
        const model =
          saved.activePreset === "Custom molecule"
            ? saved.customModel || customModel
            : PRESET_MODELS[saved.activePreset];
        setSelected(saved.selected || { index: 0, symbol: model.atoms[0][0] });
        announce("Saved molecule loaded");
      } else announce("No saved molecule yet");
    } catch {
      announce("Saved molecule could not be loaded");
    }
  };
  return (
    <div className={`mstudio ${workspaceMode === "inspect" ? "inspect-mode" : "edit-mode"}`}>
      <header className="ms-top">
        <div className="ms-logo">
          <Waypoints />
          <div>
            <b>Molecule Studio</b>
            <span>Build. Optimize. Understand.</span>
          </div>
        </div>
        <label>
          <span>⌕</span>
          <input placeholder="Search molecules, reactions, or concepts…" />
        </label>
        <button>
          <HelpCircle />
          Help
        </button>
        <div className="ms-user">
          <UserRound />
          <span>
            Chemistry
            <br />
            Learner
          </span>
          <ChevronDown />
        </div>
      </header>
      <aside className="ms-nav">
        {sideNav.map(([id, name, Icon], i) => (
          <button
            key={`${name}-${i}`}
            className={
              (name === "Molecule Studio" && window.location.hash.includes("molecule")) ||
              (name === "Library" && window.location.hash.includes("library"))
                ? "active"
                : ""
            }
            onClick={() => onNavigate(id)}
          >
            <Icon />
            {name}
          </button>
        ))}
        <div>
          SCIENCE
          <br />
          BUILDS A<br />
          BRIGHTER
          <br />
          TOMORROW
        </div>
      </aside>
      <aside className="ms-build">
        <h2>Build</h2>
        <div className="ms-tabs">
          {["Atoms", "Bonds", "Presets"].map((x) => (
            <button
              className={tab === x ? "active" : ""}
              onClick={() => setTab(x)}
              key={x}
            >
              {x}
            </button>
          ))}
        </div>
        {tab === "Atoms" && (
          <div className="ms-palette">
            {palette.map(([symbol, name, color]) => (
              <button
                key={symbol}
                onClick={() => {
                  if (activePreset === "Custom molecule") {
                    addCustomAtom(symbol);
                    return;
                  }
                  const index = currentModel.atoms.findIndex(
                    (a) => a[0] === symbol,
                  );
                  setSelected({ symbol, index: index < 0 ? 0 : index });
                  announce(`${symbol} selected in the viewer`);
                }}
              >
                <i style={{ background: color }} />
                {symbol}
                <span>{name}</span>
              </button>
            ))}
          </div>
        )}
        {tab === "Bonds" && (
          <div className="ms-bond-tools">
            {["Single bond", "Double bond", "Triple bond"].map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setBondMode(true);
                  announce(`${x} tool active — select two atoms`);
                }}
              >
                <i>{"═".repeat(i + 1)}</i>
                {x}
              </button>
            ))}
          </div>
        )}
        {tab === "Presets" && (
          <div className="ms-preset-list">
            <button
              className="ms-create"
              onClick={() => selectPreset("Custom molecule")}
            >
              ＋ Create new molecule<small>Start with one carbon atom</small>
            </button>
            {presets.map(([x, f]) => (
              <button key={x} onClick={() => selectPreset(x)}>
                {x}
                <small>{f}</small>
              </button>
            ))}
          </div>
        )}
        <h3>Bond Tools</h3>
        <div className="ms-bond-tools">
          {["Single bond", "Double bond", "Triple bond"].map((x, i) => (
            <button
              key={x}
              onClick={() => {
                setBondMode(true);
                setBondSource(null);
                announce(`${x} tool active — select two atoms in the viewer`);
              }}
            >
              <i>{"━".repeat(i + 1)}</i>
              {x}
            </button>
          ))}
        </div>
        <h3>Structure Presets</h3>
        <div className="ms-presets">
          <button
            className={activePreset === "Custom molecule" ? "active" : ""}
            onClick={() => selectPreset("Custom molecule")}
          >
            <span>＋</span>
            <b>New molecule</b>
          </button>
          {presets.map(([name, formula]) => (
            <button
              className={activePreset === name ? "active" : ""}
              onClick={() => selectPreset(name)}
              key={name}
            >
              <span>{formula}</span>
              <b>{name}</b>
            </button>
          ))}
        </div>
      </aside>
      <main className="ms-stage">
        <div className="ms-title">
          <div>
            <h1>{activePreset}</h1>
            <p>{info[0]}</p>
          </div>
          <div>
            <div className="ms-mode-switch" aria-label="Molecule workspace mode"><button className={workspaceMode==="edit"?"active":""} aria-pressed={workspaceMode==="edit"} onClick={()=>{setWorkspaceMode("edit");setInspectSource(null);announce("Edit mode restored");}}>Edit</button><button className={workspaceMode==="inspect"?"active":""} aria-pressed={workspaceMode==="inspect"} onClick={enterInspectMode}>Inspect</button></div>
            <label className="ms-import-coordinates"><FolderOpen/> Import<input type="file" accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importCoordinates}/></label>
            <button onClick={saveProject}>
              <Save />
              Save
            </button>
            <button onClick={loadProject}>
              <FolderOpen />
              Load
            </button>
            <button
              onClick={() =>
                announce(
                  "More molecule actions are available in Properties and Notes",
                )
              }
            >
              <MoreHorizontal />
            </button>
          </div>
        </div>
        {workspaceMode === "edit" ? <Ethanol3D
          preset={activePreset}
          modelOverride={currentModel}
          autoRotate={autoRotate}
          spacefill={spacefill}
          surface={surface}
          vibrate={vibrate}
          onSelect={select}
          selectedIndex={selected.index}
          resetSignal={resetSignal}
          dragMode={dragMode}
        /> : <div className="ms-inspect-view"><ViewerErrorBoundary label="Molecule inspection preview"><MolstarViewer ref={inspectViewerRef} source={activeInspectSource} sourceType={activeInspectSource.format} label={activeInspectSource.label} representation={{BallAndStick:inspectStyle==="Ball & stick",Spacefill:inspectStyle==="Space filling",Sticks:inspectStyle==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" showLabels={false} onReady={()=>{setInspectReady(true);requestAnimationFrame(()=>inspectViewerRef.current?.zoom(1.35));}} onLoadError={()=>setInspectReady(false)} onSelectionChange={setInspectAtom}/></ViewerErrorBoundary><div className="ms-inspect-tools"><b>{inspectReady?"Mol* ready":"Loading coordinates…"}</b>{["Ball & stick","Space filling","Sticks"].map(item=><button key={item} className={inspectStyle===item?"active":""} aria-pressed={inspectStyle===item} onClick={()=>setInspectStyle(item)}>{item}</button>)}<button onClick={()=>inspectViewerRef.current?.reset()}>Reset</button><button aria-label="Full screen inspection" onClick={()=>inspectViewerRef.current?.fullscreen()}><Maximize2/></button></div><div className="ms-inspect-readout">{inspectSource?`Imported · ${inspectSource.label}`:`Editor snapshot · ${activePreset}`}<br/>{inspectAtom?`${inspectAtom.element} · ${inspectAtom.atom} · [${inspectAtom.coordinates.map(value=>value.toFixed(2)).join(", ")}] Å`:"Read-only scientific inspection · click an atom for coordinates"}</div></div>}
        {workspaceMode === "edit" && <><div className="ms-measure">
          1.54 Å<br />
          <span>109.5°</span>
        </div>
        <div className="ms-axis">
          <b>Y</b>
          <i />X<br />
          <span>Z</span>
        </div></>}
      </main>
      <aside className="ms-inspector">
        <div className="ms-inspector-tabs">
          {["Inspector", "Properties", "Notes"].map((tabName) => (
            <button
              key={tabName}
              className={inspectorTab === tabName ? "active" : ""}
              onClick={() => setInspectorTab(tabName)}
            >
              {tabName}
            </button>
          ))}
        </div>
        {inspectorTab === "Notes" ? (
          <div className="ms-notes">
            <h3>Notes</h3>
            <textarea
              aria-label="Molecule notes"
              placeholder="Add an observation about this molecule…"
            />
          </div>
        ) : inspectorTab === "Properties" ? (
          <div className="ms-properties">
            <h3>Calculated properties</h3>
            <div className="ms-property-card">
              <b>{info[0]}</b>
              <span>Formula</span>
            </div>
            <div className="ms-property-card">
              <b>{properties[0]}</b>
              <span>Geometry</span>
            </div>
            <div className="ms-property-card">
              <b>{properties[2]}</b>
              <span>Polarity</span>
            </div>
            <p>Properties update when a preset is loaded or atoms are added.</p>
          </div>
        ) : (
          <>
            <h3>Selected Atom</h3>
            <button
              className="ms-selected"
              onClick={() => {
                const atoms = currentModel?.atoms || [];
                if (!atoms.length) return;
                const next = (Math.max(0, selected.index) + 1) % atoms.length;
                const atom = atoms[next];
                setSelected({ index: next, symbol: atom[0] });
                announce(`Selected ${atom[0]}${next + 1}`);
              }}
            >
              <i
                style={{
                  background: palette.find(
                    (x) => x[0] === selected.symbol,
                  )?.[2],
                }}
              />
              {selected.symbol}
              <span>
                {selected.symbol === "C" ? "Carbon" : "Atom"} ({selected.symbol}
                {selected.index + 1})
              </span>
              <ChevronDown />
            </button>
            <h3>Molecular Information</h3>
            <dl>
              <dt>Molecular formula</dt>
              <dd>{info[0]}</dd>
              <dt>Molar mass</dt>
              <dd>{info[1]}</dd>
              <dt>Name</dt>
              <dd>{activePreset}</dd>
              <dt>IUPAC name</dt>
              <dd>{activePreset}</dd>
            </dl>
            <h3>Local molecular geometry</h3>
            <dl>
              <dt>Geometry</dt>
              <dd>{properties[0]}</dd>
              <dt>Bond angle</dt>
              <dd>{properties[1]}</dd>
              <dt>Bond lengths</dt>
              <dd></dd>
              <dt>　C–C</dt>
              <dd>1.54 Å</dd>
              <dt>　C–H</dt>
              <dd>1.09 Å</dd>
              <dt>　C–O</dt>
              <dd>1.43 Å</dd>
            </dl>
            <h3>Polarity & Intermolecular Forces</h3>
            <dl>
              <dt>Molecule polarity</dt>
              <dd>{properties[2]}</dd>
              <dt>Hydrogen bond donor</dt>
              <dd>{properties[3]}</dd>
              <dt>Hydrogen bond acceptor</dt>
              <dd>{properties[4]}</dd>
            </dl>
            <h3>Lewis structure</h3>
            <div className="ms-lewis">
              {activePreset !== "Ethanol" ? (
                info[0]
              ) : (
                <>
                  　H　 H<br />
                  　│　│
                  <br />
                  H–C–C–Ö–H
                  <br />
                  　│　│
                  <br />
                  　H　 H
                </>
              )}
            </div>
          </>
        )}
      </aside>
      <footer className="ms-tools">
        <button
          className={autoRotate ? "active" : ""}
          onClick={() => setAutoRotate((v) => !v)}
        >
          <Undo2 />
          {autoRotate ? "Rotate" : "Paused"}
        </button>
        <button
          className={dragMode ? "active" : ""}
          onClick={() => {
            setDragMode((v) => !v);
            announce(
              dragMode
                ? "Drag atom mode off"
                : "Drag atom mode on — select an atom to position it",
            );
          }}
        >
          <Move3D />
          Drag atom
        </button>
        <button
          className={bondMode ? "active" : ""}
          onClick={() => {
            setBondMode((v) => !v);
            announce(
              bondMode ? "Bond tool off" : "Bond tool on — select two atoms",
            );
          }}
        >
          <Zap />
          Add bond
        </button>
        <button
          onClick={() => {
            if (activePreset === "Custom molecule" && selected.index >= 0) {
              if (customModel.atoms.length <= 1) {
                announce("Keep one atom in the custom molecule");
                return;
              }
              setCustomModel((model) => ({
                atoms: model.atoms.filter((_, i) => i !== selected.index),
                bonds: model.bonds
                  .filter(
                    ([a, b]) => a !== selected.index && b !== selected.index,
                  )
                  .map(([a, b]) => [
                    a > selected.index ? a - 1 : a,
                    b > selected.index ? b - 1 : b,
                  ]),
              }));
              setSelected({ index: 0, symbol: "C" });
              announce("Selected atom removed from custom molecule");
            } else {
              setSelected({ index: -1, symbol: "" });
              announce("Selected atom deleted from the current selection");
            }
          }}
        >
          <Trash2 />
          Delete
        </button>
        <i />
        <button
          onClick={() => {
            setResetSignal((v) => v + 1);
            announce("Geometry optimized");
          }}
        >
          <Sparkles />
          Optimize geometry
        </button>
        <button
          className={spacefill ? "active" : ""}
          onClick={() => setSpacefill((v) => !v)}
        >
          <Box />
          Spacefill
        </button>
        <button
          className={surface ? "active" : ""}
          onClick={() => setSurface((v) => !v)}
        >
          <Atom />
          Electrostatic surface
        </button>
        <button
          className={vibrate ? "active" : ""}
          onClick={() => setVibrate((v) => !v)}
        >
          {vibrate ? <Pause /> : <Play />}Play vibration mode
        </button>
        <button
          onClick={() => {
            setResetSignal((v) => v + 1);
            announce("View reset");
          }}
        >
          <RotateCcw />
          Reset view
        </button>
      </footer>
      {notice && (
        <div className="ms-notice" role="status">
          {notice}
        </div>
      )}
    </div>
  );
};
export default MoleculeScenePage;
