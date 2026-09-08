import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DObject, CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { interpolateAtoms, normalize } from '../utils/symmetryOperations.js';

const clearGroup = (group) => {
  while (group.children.length) {
    const child = group.children[0];
    group.remove(child);
    child.traverse?.((obj) => {
      obj.element?.remove?.();
      obj.geometry?.dispose?.();
      if (Array.isArray(obj.material)) obj.material.forEach(mat => mat.dispose?.());
      else obj.material?.dispose?.();
    });
  }
};

const makeBond = (from, to, color = 0x94a3b8, radius = 0.055, opacity = 1) => {
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 18);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.38, metalness: 0.08, transparent: opacity < 1, opacity });
  const cylinder = new THREE.Mesh(geometry, material);
  cylinder.position.copy(new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5));
  cylinder.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return cylinder;
};

function addMolecule(group, molecule, atoms, options = {}) {
  const atomById = Object.fromEntries(atoms.map(atom => [atom.id, atom]));
  molecule.bonds.forEach(bond => {
    const a = atomById[bond.from];
    const b = atomById[bond.to];
    if (!a || !b) return;
    const orderOffset = bond.order === 2 ? 0.055 : 0;
    const p1 = new THREE.Vector3(...a.position);
    const p2 = new THREE.Vector3(...b.position);
    if (bond.order === 2) {
      const side = new THREE.Vector3(0, 0, 1).cross(new THREE.Vector3().subVectors(p2, p1)).normalize().multiplyScalar(orderOffset);
      group.add(makeBond(p1.clone().add(side), p2.clone().add(side), options.bondColor, 0.035, options.opacity));
      group.add(makeBond(p1.clone().sub(side), p2.clone().sub(side), options.bondColor, 0.035, options.opacity));
    } else {
      group.add(makeBond(p1, p2, options.bondColor, options.bondRadius || 0.055, options.opacity));
    }
  });

  atoms.forEach(atom => {
    const mappingColor = options.mappingColors?.get(atom.id);
    const radius = (atom.radius || 0.32) * (options.spaceFill ? 1.75 : 1);
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(options.atomColor || atom.color || '#94a3b8'),
      roughness: 0.24,
      metalness: 0.08,
      transparent: options.opacity < 1,
      opacity: options.opacity ?? 1,
      emissive: new THREE.Color(mappingColor || options.emissive || atom.color || '#111827'),
      emissiveIntensity: mappingColor ? 0.42 : options.highlightIds?.has(atom.id) ? 0.38 : 0.04,
      wireframe: Boolean(options.wireframe),
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...atom.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.atomId = atom.id;
    group.add(mesh);

    if (options.showLabels) {
      const label = document.createElement('div');
      label.textContent = atom.id;
      label.className = 'pointer-events-none select-none rounded-full border border-white/15 bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold text-slate-100 shadow-lg';
      const cssLabel = new CSS2DObject(label);
      cssLabel.position.set(0, radius + 0.18, 0);
      mesh.add(cssLabel);
    }

    if (options.highlightIds?.has(atom.id)) {
      const ring = new THREE.Mesh(
        new THREE.SphereGeometry(radius * 1.35, 32, 32),
        new THREE.MeshBasicMaterial({ color: mappingColor || (options.fixedIds?.has(atom.id) ? 0x22c55e : 0xf97316), transparent: true, opacity: 0.28, wireframe: true }),
      );
      ring.position.copy(mesh.position);
      group.add(ring);
    }
  });
}

function addAxis(group, element) {
  const axis = normalize(element.axis || [0, 0, 1]);
  const direction = new THREE.Vector3(axis.x, axis.y, axis.z);
  const start = direction.clone().multiplyScalar(-2.5);
  const end = direction.clone().multiplyScalar(2.5);
  const axisMesh = makeBond(start, end, 0x60a5fa, 0.035, 0.92);
  axisMesh.userData.symmetryElementId = element.id;
  group.add(axisMesh);
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.42, 24),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6 }),
  );
  cone.position.copy(end);
  cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  cone.userData.symmetryElementId = element.id;
  group.add(cone);
}

function addPlane(group, element) {
  const normal = normalize(element.planeNormal || [0, 0, 1]);
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(4.6, 4.6, 1, 1),
    new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
  );
  const n = new THREE.Vector3(normal.x, normal.y, normal.z);
  plane.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  plane.position.set(...(element.planePoint || [0, 0, 0]));
  plane.userData.symmetryElementId = element.id;
  group.add(plane);
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(plane.geometry),
    new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.75 }),
  );
  edge.quaternion.copy(plane.quaternion);
  edge.position.copy(plane.position);
  edge.userData.symmetryElementId = element.id;
  group.add(edge);
}

function addInversionCentre(group, element) {
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.95 }),
  );
  sphere.position.set(...(element.center || [0, 0, 0]));
  sphere.userData.symmetryElementId = element.id;
  group.add(sphere);
  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.14 }),
  );
  glow.position.copy(sphere.position);
  glow.userData.symmetryElementId = element.id;
  group.add(glow);
}

function fitCamera(camera, controls, atoms) {
  const points = atoms.map(atom => new THREE.Vector3(...atom.position));
  const box = new THREE.Box3().setFromPoints(points);
  const center = box.getCenter(new THREE.Vector3());
  const size = Math.max(box.getSize(new THREE.Vector3()).length(), 3);
  camera.position.set(center.x + size * 0.75, center.y + size * 0.45, center.z + size * 1.25);
  controls.target.copy(center);
  controls.update();
}

export const MoleculeViewer3D = forwardRef(function MoleculeViewer3D({
  molecule,
  selectedElement,
  operationResult,
  progress = 0,
  showLabels = true,
  showElements = true,
  showGhost = true,
  bondStyle = 'ball-stick',
  height = 580,
  onAtomSelect,
  onElementSelect,
  className = '',
}, ref) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const labelRendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const rafRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());

  const setCameraView = (view) => {
    if (!cameraRef.current || !controlsRef.current) return;
    const points = molecule.atoms.map(atom => new THREE.Vector3(...atom.position));
    const box = new THREE.Box3().setFromPoints(points);
    const center = box.getCenter(new THREE.Vector3());
    const distance = Math.max(box.getSize(new THREE.Vector3()).length(), 3) * 1.6;
    const direction = view === 'top' ? [0, 1, 0.001] : view === 'right' ? [1, 0, 0] : [0, 0, 1];
    cameraRef.current.position.set(center.x + direction[0] * distance, center.y + direction[1] * distance, center.z + direction[2] * distance);
    controlsRef.current.target.copy(center);
    controlsRef.current.update();
  };

  const displayedAtoms = useMemo(() => {
    if (!operationResult?.transformedAtoms) return molecule.atoms;
    return interpolateAtoms(molecule.atoms, operationResult.transformedAtoms, progress);
  }, [molecule, operationResult, progress]);

  useImperativeHandle(ref, () => ({
    resetCamera: () => {
      if (cameraRef.current && controlsRef.current) fitCamera(cameraRef.current, controlsRef.current, molecule.atoms);
    },
    exportPNG: () => {
      const renderer = rendererRef.current;
      if (!renderer || !sceneRef.current || !cameraRef.current) return null;
      renderer.render(sceneRef.current, cameraRef.current);
      return renderer.domElement.toDataURL('image/png');
    },
    setView: setCameraView,
  }), [molecule]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x07111f);
    scene.fog = new THREE.Fog(0x07111f, 18, 38);
    sceneRef.current = scene;

    const measuredHeight = () => container.clientHeight || (typeof height === 'number' ? height : 580);
    const initialHeight = measuredHeight();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / initialHeight, 0.1, 200);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, initialHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(container.clientWidth, initialHeight);
    labelRenderer.domElement.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    container.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.enablePan = true;
    controls.minDistance = 1.4;
    controls.maxDistance = 24;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xa5b4fc, 0x1f2937, 0.72));
    const key = new THREE.DirectionalLight(0xffffff, 1.45);
    key.position.set(5, 7, 8);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x67e8f9, 0.45);
    rim.position.set(-5, 2, -6);
    scene.add(rim);

    const grid = new THREE.GridHelper(8, 8, 0x1e3a5f, 0x13223a);
    grid.position.y = -2.15;
    grid.material.transparent = true;
    grid.material.opacity = 0.35;
    scene.add(grid);

    moleculeGroupRef.current = new THREE.Group();
    overlayGroupRef.current = new THREE.Group();
    scene.add(moleculeGroupRef.current);
    scene.add(overlayGroupRef.current);
    fitCamera(camera, controls, molecule.atoms);

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    tick();

    const resize = () => {
      const nextHeight = measuredHeight();
      camera.aspect = container.clientWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, nextHeight);
      labelRenderer.setSize(container.clientWidth, nextHeight);
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      clearGroup(moleculeGroupRef.current);
      clearGroup(overlayGroupRef.current);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement);
    };
  }, []);

  useEffect(() => {
    const group = moleculeGroupRef.current;
    if (!group) return;
    clearGroup(group);
    const mapping = operationResult?.mapping || [];
    const changedIds = new Set(mapping.filter(item => item.valid).map(item => item.from));
    const fixedIds = new Set(mapping.filter(item => item.unchanged).map(item => item.from));
    const palette = ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185'];
    const mappingColorMap = new Map(mapping.map((item, index) => [item.from, palette[index % palette.length]]));
    if (showGhost && operationResult?.transformedAtoms) {
      addMolecule(group, molecule, molecule.atoms, {
        atomColor: '#cbd5e1',
        bondColor: 0xcbd5e1,
        opacity: 0.2,
        showLabels: false,
        bondRadius: 0.035,
      });
    }
    addMolecule(group, molecule, displayedAtoms, {
      showLabels,
      opacity: 1,
      spaceFill: bondStyle === 'space-fill',
      wireframe: bondStyle === 'wireframe',
      highlightIds: changedIds,
      fixedIds,
      mappingColors: mappingColorMap,
    });
  }, [molecule, displayedAtoms, operationResult, showGhost, showLabels, bondStyle]);

  useEffect(() => {
    const group = overlayGroupRef.current;
    if (!group) return;
    clearGroup(group);
    if (!showElements || !selectedElement) return;
    if (selectedElement.type === 'Cn' || selectedElement.type === 'Sn') addAxis(group, selectedElement);
    if (selectedElement.type === 'sigma') addPlane(group, selectedElement);
    if (selectedElement.type === 'i') addInversionCentre(group, selectedElement);
  }, [selectedElement, showElements]);

  useEffect(() => {
    if (cameraRef.current && controlsRef.current) fitCamera(cameraRef.current, controlsRef.current, molecule.atoms);
  }, [molecule]);

  const handlePointerDown = (event) => {
    if ((!onAtomSelect && !onElementSelect) || !rendererRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = rendererRef.current.domElement.getBoundingClientRect();
    pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(pointerRef.current, cameraRef.current);
    const overlayTargets = [];
    overlayGroupRef.current?.traverse(obj => {
      if ((obj.isMesh || obj.isLineSegments) && obj.userData.symmetryElementId) overlayTargets.push(obj);
    });
    const overlayHit = raycasterRef.current.intersectObjects(overlayTargets, true)[0];
    if (overlayHit?.object?.userData?.symmetryElementId && onElementSelect) {
      onElementSelect(overlayHit.object.userData.symmetryElementId);
      return;
    }
    if (!onAtomSelect) return;
    const targets = [];
    moleculeGroupRef.current?.traverse(obj => {
      if (obj.isMesh && obj.userData.atomId) targets.push(obj);
    });
    const hit = raycasterRef.current.intersectObjects(targets)[0];
    if (hit) onAtomSelect(hit.object.userData.atomId);
  };

  return (
    <div
      ref={mountRef}
      onPointerDown={handlePointerDown}
      onKeyDown={event => {
        if (event.key === '1') setCameraView('front');
        if (event.key === '2') setCameraView('right');
        if (event.key === '3') setCameraView('top');
        if (event.key.toLowerCase() === 'r' && cameraRef.current && controlsRef.current) fitCamera(cameraRef.current, controlsRef.current, molecule.atoms);
      }}
      tabIndex={0}
      className={`relative ${typeof height === 'number' ? 'min-h-[420px]' : 'min-h-0'} overflow-hidden rounded-xl border border-white/10 bg-slate-950 ${className}`}
      style={{ height }}
      aria-label={`3D symmetry viewer for ${molecule.name}. Press 1 for front, 2 for right, 3 for top, or R to reset the camera.`}
      role="application"
    />
  );
});

export default MoleculeViewer3D;
