import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const atomColors = {
  C: 0x94a3b8,
  H: 0xe5e7eb,
  O: 0xef4444,
  N: 0x3b82f6,
  S: 0xfacc15,
  P: 0xf97316,
  Cl: 0x22c55e,
  Br: 0xfb923c,
  M: 0xf59e0b,
  L: 0x67e8f9,
};

const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const cylinderGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 16);

function makeMaterial(color, opacity = 1) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.42,
    metalness: 0.08,
    transparent: opacity < 1,
    opacity,
  });
}

function addSphere(group, position, color, radius = 0.24, name = '') {
  const mesh = new THREE.Mesh(sphereGeo, makeMaterial(color));
  mesh.position.set(...position);
  mesh.scale.setScalar(radius);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData.name = name;
  group.add(mesh);
  return mesh;
}

function addBond(group, from, to, color = 0x64748b, radius = 0.045) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const mid = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, direction.length(), 16),
    makeMaterial(color),
  );
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  group.add(mesh);
  return mesh;
}

function addArrow(group, from, to, color = 0x22d3ee) {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = end.clone().sub(start);
  const arrow = new THREE.ArrowHelper(direction.clone().normalize(), start, direction.length(), color, 0.22, 0.12);
  group.add(arrow);
  return arrow;
}

function addTorus(group, position, color, radius = 0.8, tube = 0.035, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(
    new THREE.TorusGeometry(radius, tube, 16, 72),
    makeMaterial(color, 0.82),
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  group.add(mesh);
  return mesh;
}

function benzenePoints(radius = 0.88) {
  return Array.from({ length: 6 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 6;
    return [Math.cos(angle) * radius, Math.sin(angle) * radius, 0];
  });
}

function buildOrganicScene(group, variant, progress) {
  if (variant === 'eas') {
    const ring = benzenePoints();
    ring.forEach((point, index) => {
      addSphere(group, point, atomColors.C, 0.18, 'aryl carbon');
      addBond(group, point, ring[(index + 1) % ring.length], 0x38bdf8, 0.035);
    });
    addTorus(group, [0, 0, 0], 0x22c55e, 0.52, 0.025, [0, 0, 0]);
    const electrophileX = 1.9 - progress * 0.65;
    addSphere(group, [electrophileX, 0.15, 0], 0xfb7185, 0.22, 'E+');
    addArrow(group, [0.52, 0.1, 0.1], [electrophileX - 0.25, 0.14, 0.02], 0x22d3ee);
    addSphere(group, [0.72, -0.32, progress * 0.45], 0xfacc15, 0.11, 'sigma complex charge');
    return;
  }

  if (variant === 'grignard') {
    addSphere(group, [-0.35, 0, 0], atomColors.C, 0.25, 'carbonyl carbon');
    addSphere(group, [0.48, 0.2, 0], atomColors.O, 0.22, 'oxygen');
    addBond(group, [-0.18, 0.04, 0.04], [0.34, 0.16, 0.04], 0xef4444, 0.035);
    addBond(group, [-0.18, -0.04, -0.04], [0.34, 0.08, -0.04], 0xef4444, 0.035);
    addSphere(group, [-1.1, 0.1, 0], atomColors.C, 0.18, 'R group');
    addBond(group, [-0.55, 0, 0], [-0.94, 0.08, 0], 0x94a3b8);
    const reagentX = 1.65 - progress * 1.2;
    addSphere(group, [reagentX, -0.72, 0], atomColors.C, 0.18, 'R-');
    addSphere(group, [reagentX + 0.42, -0.88, 0], 0xa78bfa, 0.16, 'MgX');
    addBond(group, [reagentX, -0.72, 0], [reagentX + 0.42, -0.88, 0], 0xa78bfa);
    addArrow(group, [reagentX - 0.08, -0.62, 0], [-0.18, -0.08, 0], 0x22d3ee);
    addArrow(group, [0.2, 0.14, 0], [0.54, 0.35, 0], 0xfacc15);
    return;
  }

  if (variant === 'e1' || variant === 'e2') {
    const c1 = [-0.55, 0, 0];
    const c2 = [0.55, 0, 0];
    addSphere(group, c1, atomColors.C, 0.23, 'beta carbon');
    addSphere(group, c2, atomColors.C, 0.23, 'alpha carbon');
    addBond(group, c1, c2);
    addSphere(group, [-1.08, 0.78, 0], atomColors.H, 0.14, 'anti beta H');
    addBond(group, c1, [-1.08, 0.78, 0], 0xe5e7eb, 0.03);
    const leaving = [1.15 + progress * 0.8, -0.75, 0];
    addSphere(group, leaving, atomColors.Br, 0.19, 'leaving group');
    addBond(group, c2, [1.05, -0.62, 0], 0xfb923c, 0.035);
    addSphere(group, [-1.55 + progress * 0.45, 1.12 - progress * 0.2, 0], atomColors.O, 0.18, 'base');
    addArrow(group, [-1.42, 1.02, 0], [-1.02, 0.78, 0], 0x22d3ee);
    addArrow(group, [-0.88, 0.58, 0], [-0.16, 0.05, 0], 0x22d3ee);
    addArrow(group, [0.88, -0.48, 0], leaving, 0xfb7185);
    return;
  }

  const c = [0, 0, 0];
  addSphere(group, c, atomColors.C, 0.26, 'reaction center');
  [[0, 0.92, 0], [0, -0.9, 0.52], [0, -0.9, -0.52]].forEach((h, index) => {
    addSphere(group, h, atomColors.H, 0.13, `H${index + 1}`);
    addBond(group, c, h, 0xe5e7eb, 0.028);
  });
  const incoming = variant === 'sn1' ? [-1.15 + progress * 0.45, 0.1, progress * 0.7] : [-1.9 + progress * 1.1, 0.1, 0];
  const leaving = [1.05 + progress * 0.9, -0.1, 0];
  addSphere(group, incoming, atomColors.O, 0.2, 'nucleophile');
  addSphere(group, leaving, atomColors.Cl, 0.19, 'leaving group');
  addBond(group, c, [0.75, -0.08, 0], 0x22c55e, 0.035);
  addArrow(group, incoming, [-0.26, 0.02, 0], 0x22d3ee);
  addArrow(group, [0.42, -0.04, 0], leaving, 0xfb7185);
  if (variant === 'sn1') addTorus(group, [0, 0, 0], 0xfacc15, 0.44, 0.022, [Math.PI / 2, 0, 0]);
}

function buildCoordinationScene(group, geometry, progress) {
  const ligands = geometry === 'Tetrahedral'
    ? [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]]
    : geometry === 'Square planar'
      ? [[1.25, 0, 0], [-1.25, 0, 0], [0, 1.25, 0], [0, -1.25, 0]]
      : [[1.2, 0, 0], [-1.2, 0, 0], [0, 1.2, 0], [0, -1.2, 0], [0, 0, 1.2], [0, 0, -1.2]];
  addSphere(group, [0, 0, 0], atomColors.M, 0.3, 'metal center');
  ligands.forEach((raw, index) => {
    const wobble = Math.sin(progress * Math.PI * 2 + index) * 0.05;
    const point = [raw[0] + wobble, raw[1], raw[2]];
    addSphere(group, point, index % 2 ? 0x67e8f9 : 0xa7f3d0, 0.18, 'ligand');
    addBond(group, [0, 0, 0], point, 0x94a3b8, 0.035);
  });
  addOrbital(group, [0, 0, 0], 0x38bdf8, [0, 0, 0]);
  addOrbital(group, [0, 0, 0], 0xf59e0b, [0, Math.PI / 2, 0]);
}

function addOrbital(group, position, color, rotation) {
  const mat = makeMaterial(color, 0.28);
  const a = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), mat);
  const b = new THREE.Mesh(new THREE.SphereGeometry(0.38, 24, 24), mat);
  a.position.set(-0.46, 0, 0);
  b.position.set(0.46, 0, 0);
  const orbital = new THREE.Group();
  orbital.position.set(...position);
  orbital.rotation.set(...rotation);
  orbital.add(a, b);
  group.add(orbital);
}

function buildBioScene(group, variant, progress) {
  if (variant === 'dna') {
    for (let i = 0; i < 18; i += 1) {
      const t = i * 0.42;
      const y = -1.6 + i * 0.18;
      const a = [Math.cos(t) * 0.75, y, Math.sin(t) * 0.75];
      const b = [Math.cos(t + Math.PI) * 0.75, y, Math.sin(t + Math.PI) * 0.75];
      addSphere(group, a, 0x38bdf8, 0.09, 'sugar phosphate');
      addSphere(group, b, 0xfb7185, 0.09, 'sugar phosphate');
      addBond(group, a, b, 0xfacc15, 0.018);
      if (i > 0) {
        const pt = (i - 1) * 0.42;
        addBond(group, [Math.cos(pt) * 0.75, y - 0.18, Math.sin(pt) * 0.75], a, 0x38bdf8, 0.018);
        addBond(group, [Math.cos(pt + Math.PI) * 0.75, y - 0.18, Math.sin(pt + Math.PI) * 0.75], b, 0xfb7185, 0.018);
      }
    }
    return;
  }
  if (variant === 'membrane') {
    for (let row = 0; row < 2; row += 1) {
      for (let i = 0; i < 12; i += 1) {
        const x = -2.4 + i * 0.44;
        const y = row ? 0.5 : -0.5;
        addSphere(group, [x, y, 0], 0x22d3ee, 0.12, 'polar head');
        addBond(group, [x - 0.04, y + (row ? -0.12 : 0.12), 0], [x - 0.14, row ? -0.28 : 0.28, 0.16], 0xf59e0b, 0.025);
        addBond(group, [x + 0.04, y + (row ? -0.12 : 0.12), 0], [x + 0.14, row ? -0.28 : 0.28, -0.16], 0xf59e0b, 0.025);
      }
    }
    return;
  }
  for (let i = 0; i < 26; i += 1) {
    const t = i * 0.48;
    const point = [Math.cos(t) * (0.8 + 0.02 * i), -1.1 + i * 0.09, Math.sin(t) * 0.52];
    addSphere(group, point, i % 3 === 0 ? 0xa78bfa : 0x22c55e, 0.11, 'amino acid residue');
    if (i > 0) {
      const p = (i - 1) * 0.48;
      const prev = [Math.cos(p) * (0.8 + 0.02 * (i - 1)), -1.1 + (i - 1) * 0.09, Math.sin(p) * 0.52];
      addBond(group, prev, point, 0x94a3b8, 0.025);
    }
  }
  addTorus(group, [0.2, 0.2, 0], 0xfacc15, 1.1 + progress * 0.08, 0.025, [Math.PI / 2, 0.2, 0]);
}

function buildPhysicalScene(group, variant, progress) {
  if (variant === 'crystal') {
    const coords = [-1, 0, 1];
    coords.forEach(x => coords.forEach(y => coords.forEach(z => {
      if (Math.abs(x) + Math.abs(y) + Math.abs(z) >= 2) addSphere(group, [x * 0.65, y * 0.65, z * 0.65], 0x38bdf8, 0.12, 'lattice atom');
    })));
    addSphere(group, [0, 0, 0], 0xf59e0b, 0.14, 'body/void site');
    return;
  }
  if (variant === 'electrochem') {
    addSphere(group, [-1.4, 0, 0], 0x94a3b8, 0.25, 'anode');
    addSphere(group, [1.4, 0, 0], 0xf59e0b, 0.25, 'cathode');
    addBond(group, [-1.4, 0.6, 0], [1.4, 0.6, 0], 0xe5e7eb, 0.025);
    Array.from({ length: 8 }).forEach((_, i) => {
      const x = -1 + ((i + progress * 4) % 8) * 0.3;
      addSphere(group, [x, 0.6, 0], 0x22d3ee, 0.06, 'electron');
    });
    addArrow(group, [-1.1, -0.4, 0], [1.1, -0.4, 0], 0x22c55e);
    return;
  }
  Array.from({ length: 34 }).forEach((_, i) => {
    const x = ((i * 37) % 100) / 24 - 2.1;
    const y = ((i * 19) % 100) / 28 - 1.6;
    const z = Math.sin(i + progress * Math.PI * 2) * 0.8;
    addSphere(group, [x, y, z], i % 2 ? 0x38bdf8 : 0xfb7185, 0.07, 'particle');
  });
}

function buildSpectroscopyScene(group, variant, progress) {
  const atoms = [[-0.7, 0, 0, 'C'], [0.05, 0.05, 0, 'C'], [0.78, 0.08, 0, 'O'], [-1.15, 0.62, 0, 'H'], [-1.15, -0.62, 0, 'H'], [0.1, -0.72, 0, 'H'], [1.22, 0.55, 0, 'H']];
  atoms.forEach(([x, y, z, el], i) => addSphere(group, [x, y, z], atomColors[el], variant === 'ms' && i > 2 ? 0.11 + progress * 0.08 : 0.14, el));
  [[0, 1], [1, 2], [0, 3], [0, 4], [1, 5], [2, 6]].forEach(([a, b], i) => {
    const color = (variant === 'ir' && i === 1) || (variant === 'nmr' && i > 2) || (variant === 'ms' && i === 0) ? 0xfacc15 : 0x64748b;
    addBond(group, atoms[a].slice(0, 3), atoms[b].slice(0, 3), color, 0.035);
  });
  if (variant === 'ms') addArrow(group, [0.0, 0.75, 0], [0.0, 1.55, 0.3], 0xfb7185);
}

function buildNomenclatureScene(group, variant, progress) {
  if (variant === 'coordination') {
    buildCoordinationScene(group, 'Octahedral', progress);
    return;
  }
  const chain = [[-1.2, 0, 0], [-0.4, 0.35, 0], [0.4, -0.2, 0], [1.2, 0.24, 0]];
  chain.forEach((point, i) => {
    addSphere(group, point, atomColors.C, 0.16, 'chain carbon');
    if (i) addBond(group, chain[i - 1], point, 0x94a3b8, 0.035);
  });
  if (variant === 'rs') {
    addSphere(group, [0.4, -0.2, 0.86], atomColors.Br, 0.18, 'priority 1');
    addBond(group, [0.4, -0.2, 0], [0.4, -0.2, 0.86], 0xfb923c);
    addArrow(group, [0.92, 0.35, 0.2], [0.05, 0.42, 0.1], 0x22d3ee);
  } else if (variant === 'ez') {
    addBond(group, [-0.4, 0.41, 0.07], [0.4, -0.14, 0.07], 0x38bdf8, 0.025);
  } else {
    addTorus(group, [0, 0, 0], 0xa78bfa, 1.0, 0.04, [Math.PI / 2, 0.2, 0.3]);
  }
}

function buildRetrosynthesisScene(group, variant, progress) {
  const ring = benzenePoints(0.72);
  ring.forEach((point, index) => {
    addSphere(group, point, atomColors.C, 0.13, 'target aryl carbon');
    addBond(group, point, ring[(index + 1) % ring.length], 0x94a3b8, 0.028);
  });
  const bondStart = ring[0];
  const bondEnd = [1.35, 0.2, 0];
  addSphere(group, bondEnd, atomColors.O, 0.15, 'disconnection atom');
  addBond(group, bondStart, bondEnd, variant === 'disconnect' ? 0xfb7185 : 0xfacc15, 0.04);
  addSphere(group, [1.85, 0.35, 0], atomColors.C, 0.14, 'reagent fragment');
  addBond(group, bondEnd, [1.85, 0.35, 0], 0x94a3b8, 0.03);
  if (variant === 'disconnect') {
    addArrow(group, [1.18, 0.72, 0], [0.9, 0.2, 0], 0xfb7185);
    addArrow(group, [1.18, -0.36, 0], [0.9, 0.18, 0], 0xfb7185);
  } else {
    addArrow(group, [2.4 - progress * 0.8, -0.6, 0], [1.3, 0.1, 0], 0x22d3ee);
  }
}

function populateScene(group, scene, variant, progress) {
  if (scene === 'organic') buildOrganicScene(group, variant, progress);
  else if (scene === 'coordination') buildCoordinationScene(group, variant, progress);
  else if (scene === 'bio') buildBioScene(group, variant, progress);
  else if (scene === 'physical') buildPhysicalScene(group, variant, progress);
  else if (scene === 'spectroscopy') buildSpectroscopyScene(group, variant, progress);
  else if (scene === 'nomenclature') buildNomenclatureScene(group, variant, progress);
  else if (scene === 'retrosynthesis') buildRetrosynthesisScene(group, variant, progress);
  else buildOrganicScene(group, 'sn2', progress);
}

export function MiniMolecule3D({
  scene = 'organic',
  variant = 'sn2',
  title = '3D chemistry view',
  note = '',
  height = 280,
}) {
  const mountRef = useRef(null);
  const stateRef = useRef({ group: null, renderer: null, camera: null, controls: null, frame: 0, clock: new THREE.Clock() });
  const propsRef = useRef({ scene, variant });

  useEffect(() => {
    propsRef.current = { scene, variant };
    const state = stateRef.current;
    if (!state.group) return;
    state.group.clear();
    populateScene(state.group, scene, variant, 0.35);
  }, [scene, variant]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const sceneObject = new THREE.Scene();
    sceneObject.background = new THREE.Color(0x020617);
    const camera = new THREE.PerspectiveCamera(42, container.clientWidth / height, 0.1, 100);
    camera.position.set(0, 1.8, 5.2);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enablePan = false;

    sceneObject.add(new THREE.AmbientLight(0xffffff, 0.55));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(4, 5, 5);
    key.castShadow = true;
    sceneObject.add(key);
    const rim = new THREE.DirectionalLight(0x67e8f9, 0.5);
    rim.position.set(-4, 1, -3);
    sceneObject.add(rim);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.1 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.9;
    floor.receiveShadow = true;
    sceneObject.add(floor);

    const group = new THREE.Group();
    sceneObject.add(group);
    stateRef.current = { group, renderer, camera, controls, frame: 0, clock: new THREE.Clock(), lastTick: -1 };

    const animate = () => {
      const state = stateRef.current;
      const elapsed = state.clock.getElapsedTime();
      const tick = Math.floor(elapsed * 18);
      if (tick !== state.lastTick) {
        state.lastTick = tick;
        state.group.clear();
        populateScene(state.group, propsRef.current.scene, propsRef.current.variant, (Math.sin(elapsed * 1.25) + 1) / 2);
      }
      state.group.rotation.y += 0.0025;
      state.group.children.forEach(child => {
        if (child.type === 'ArrowHelper') return;
        if (child.isMesh && child.userData.name === 'electron') child.position.x += 0.006;
      });
      controls.update();
      renderer.render(sceneObject, camera);
      state.frame = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      camera.aspect = container.clientWidth / height;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, height);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(stateRef.current.frame);
      window.removeEventListener('resize', resize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [height]);

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-black text-white">{title}</p>
          {note && <p className="truncate text-[11px] text-gray-500">{note}</p>}
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-0.5 text-[10px] font-black text-cyan-100">3D</span>
      </div>
      <div ref={mountRef} style={{ height }} />
    </div>
  );
}

export default MiniMolecule3D;
