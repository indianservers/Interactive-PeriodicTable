import { useEffect, useRef } from "react";
import * as THREE from "three";
import { CSS2DObject, CSS2DRenderer } from "three/examples/jsm/renderers/CSS2DRenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./inorganicComplexViewer.css";

const ligandPositions = [
  [0, 0, 2.05],
  [0, 0, -2.05],
  [2.05, 0, 0],
  [-2.05, 0, 0],
  [0, 2.05, 0],
  [0, -2.05, 0],
];

const atomStyle = {
  Cu: { color: 0x39a4ff, radius: 0.5 },
  O: { color: 0xf04444, radius: 0.28 },
  H: { color: 0xd6e0ec, radius: 0.14 },
};

function cylinderBetween(start, end, radius, color, opacity = 1) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, length, 16),
    new THREE.MeshStandardMaterial({ color, transparent: opacity < 1, opacity, roughness: 0.35 }),
  );
  mesh.position.copy(start).add(end).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function makeLabel(text, className) {
  const node = document.createElement("div");
  node.className = `inorganic-atom-label ${className}`;
  node.textContent = text;
  return new CSS2DObject(node);
}

export default function InorganicComplexViewer({
  representation = "ball-stick",
  showHydrogens = true,
  showPolyhedra = true,
  showLabels = true,
  autoRotate = true,
  measurementMode = false,
  onAtomSelect,
}) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const atomMeshesRef = useRef([]);
  const selectRef = useRef(onAtomSelect);
  selectRef.current = onAtomSelect;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(5.6, 4.4, 6.5);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.className = "inorganic-webgl";
    host.appendChild(renderer.domElement);
    const labels = new CSS2DRenderer();
    labels.domElement.className = "inorganic-label-layer";
    labels.domElement.style.pointerEvents = "none";
    host.appendChild(labels.domElement);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotateSpeed = 0.7;
    controls.minDistance = 3.8;
    controls.maxDistance = 14;
    const root = new THREE.Group();
    scene.add(root);
    scene.add(new THREE.HemisphereLight(0x9ecbff, 0x07111f, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(4, 7, 6);
    scene.add(key);
    const rim = new THREE.PointLight(0x2797ff, 20, 15);
    rim.position.set(-4, 1, 3);
    scene.add(rim);
    sceneRef.current = { scene, camera, renderer, labels, controls, root };

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const onPointerDown = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(atomMeshesRef.current, false)[0];
      if (hit?.object.userData.atom) selectRef.current?.(hit.object.userData.atom);
    };
    renderer.domElement.addEventListener("pointerdown", onPointerDown);

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      labels.setSize(width, height);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();
    let frame;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      labels.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      controls.dispose();
      renderer.dispose();
      host.replaceChildren();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    const state = sceneRef.current;
    if (!state) return;
    const { root, controls } = state;
    root.clear();
    atomMeshesRef.current = [];
    controls.autoRotate = autoRotate;
    const atoms = [{ id: "Cu", element: "Cu", position: new THREE.Vector3() }];
    ligandPositions.forEach((coords, index) => {
      const oxygen = new THREE.Vector3(...coords);
      atoms.push({ id: `O${index + 1}`, element: "O", position: oxygen });
      if (showHydrogens) {
        const outward = oxygen.clone().normalize();
        const side = new THREE.Vector3(0, 1, 0);
        if (Math.abs(outward.dot(side)) > 0.8) side.set(1, 0, 0);
        side.cross(outward).normalize();
        atoms.push({ id: `H${index + 1}a`, element: "H", position: oxygen.clone().add(outward.clone().multiplyScalar(0.47)).add(side.clone().multiplyScalar(0.38)) });
        atoms.push({ id: `H${index + 1}b`, element: "H", position: oxygen.clone().add(outward.clone().multiplyScalar(0.47)).sub(side.clone().multiplyScalar(0.38)) });
      }
    });
    if (showPolyhedra) {
      const poly = new THREE.Mesh(
        new THREE.OctahedronGeometry(2.02, 0),
        new THREE.MeshBasicMaterial({ color: 0x2f9dff, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false }),
      );
      root.add(poly);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(poly.geometry), new THREE.LineBasicMaterial({ color: 0x63c7ff, transparent: true, opacity: 0.75 }));
      root.add(edges);
    }
    const copper = new THREE.Vector3();
    atoms.forEach((atom) => {
      const style = atomStyle[atom.element];
      const scale = representation === "space-fill" ? 1.55 : 1;
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(style.radius * scale, 28, 20),
        new THREE.MeshStandardMaterial({ color: style.color, metalness: atom.element === "Cu" ? 0.5 : 0.05, roughness: 0.28, emissive: atom.element === "Cu" ? 0x073c90 : 0x000000, emissiveIntensity: 0.6 }),
      );
      mesh.position.copy(atom.position);
      mesh.userData.atom = { ...atom, coordinates: atom.position.toArray() };
      root.add(mesh);
      atomMeshesRef.current.push(mesh);
      if (showLabels && (atom.element !== "H" || representation !== "space-fill")) {
        const label = makeLabel(atom.id === "Cu" ? "Cu²⁺" : atom.id, atom.element === "Cu" ? "metal-label" : "atom-label");
        label.position.set(0, style.radius * scale + 0.08, 0);
        mesh.add(label);
      }
      if (atom.element === "Cu") copper.copy(atom.position);
    });
    ligandPositions.forEach((coords, index) => {
      const oxygen = new THREE.Vector3(...coords);
      root.add(cylinderBetween(copper, oxygen, 0.075, 0x63c7ff, 0.9));
      if (showHydrogens) {
        const outward = oxygen.clone().normalize();
        const side = new THREE.Vector3(0, 1, 0);
        if (Math.abs(outward.dot(side)) > 0.8) side.set(1, 0, 0);
        side.cross(outward).normalize();
        const h1 = oxygen.clone().add(outward.clone().multiplyScalar(0.47)).add(side.clone().multiplyScalar(0.38));
        const h2 = oxygen.clone().add(outward.clone().multiplyScalar(0.47)).sub(side.clone().multiplyScalar(0.38));
        root.add(cylinderBetween(oxygen, h1, 0.038, 0xa9bbcc, 0.9));
        root.add(cylinderBetween(oxygen, h2, 0.038, 0xa9bbcc, 0.9));
      }
    });
    const axes = new THREE.AxesHelper(2.9);
    axes.setColors(0xff6178, 0x5ef0bb, 0x63a7ff);
    root.add(axes);
  }, [representation, showHydrogens, showPolyhedra, showLabels, autoRotate]);

  return <div ref={hostRef} className={`inorganic-complex-viewer ${measurementMode ? "is-measuring" : ""}`} aria-label="Interactive octahedral hexaaquacopper complex viewer" />;
}
