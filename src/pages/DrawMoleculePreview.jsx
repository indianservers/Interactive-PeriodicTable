import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { getRDKit } from "../modules/drug-discovery/rdkitService.js";
import { structureMolfile } from "../utils/structureDrawing.js";
import { libraryConformers } from "../data/drawLibraryConformers.js";
let conformerCatalogue;

import { parseSdf3D, canonicalSmiles } from "../utils/drawResearch.js";
import { conformers, templates } from "../utils/structureDrawLibrary.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const colors = {
  C: 0x30343b,
  H: 0xf1f2f3,
  N: 0x2439ef,
  O: 0xef171c,
  S: 0xefc323,
  Cl: 0x25bc67,
  F: 0x73d964,
  Br: 0x9c3024,
  P: 0xff933c,
};
export default forwardRef(function DrawMoleculePreview(
  {
    model,
    name,
    representation,
    spin,
    sdfText,
    onGeometry,
    onAtomPick,
    selectedAtomIds = [],
    atomLabels = false,
    background = "light",
  },
  ref,
) {
  const host = useRef(),
    sceneRef = useRef(),
    [status, setStatus] = useState(""),
    [hasConformer, setHasConformer] = useState(false);
  const callbacks = useRef({});
  callbacks.current = { onGeometry, onAtomPick, selectedAtomIds };
  useImperativeHandle(
    ref,
    () => ({
      snapshot() {
        const state = sceneRef.current;
        if (!state) return null;
        state.renderer.render(state.scene, state.camera);
        return state.renderer.domElement.toDataURL("image/png");
      },
      reset() {
        sceneRef.current?.controls.reset();
      },
      fullscreen() {
        host.current?.requestFullscreen?.();
      },
    }),
    [],
  );
  useEffect(() => {
    if (sceneRef.current) sceneRef.current.controls.autoRotate = spin;
  }, [spin]);
  useEffect(() => {
    let cancelled = false,
      dispose = () => {};
    async function init() {
      if (!host.current) return;
      setStatus("");
      let atoms = model.atoms.map((a) => ({
          ...a,
          x: (a.x - 400) / 40,
          y: (300 - a.y) / 40,
          z: 0,
        })),
        bonds = model.bonds;
      let is3D = false;
      try {
        const rd = await getRDKit();
        const identity = canonicalSmiles(rd, structureMolfile(model));
        if (!conformerCatalogue)
          conformerCatalogue = new Map([
            ...templates.map(([title, input]) => [
              canonicalSmiles(rd, input),
              conformers[title],
            ]),
            ...libraryConformers.map((e) => [e.smiles, e.sdf]),
          ]);
        let block = sdfText;
        const source = conformerCatalogue.get(identity);
        if (block && canonicalSmiles(rd, block) !== identity)
          throw Error(
            "Conformer does not match the current molecule; showing the planar graph.",
          );
        if (!block && source) {
          const response = await fetch(source);
          if (!response.ok)
            throw Error(
              "Bundled 3D conformer unavailable; showing the planar graph.",
            );
          block = await response.text();
        }
        if (block) {
          ({ atoms, bonds } = parseSdf3D(block));
          is3D = true;
        }
      } catch (e) {
        if (!cancelled) setStatus(e.message);
      }
      if (!cancelled) setHasConformer(is3D);
      if (cancelled) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          preserveDrawingBuffer: true,
        });
      } catch {
        setStatus("WebGL is unavailable");
        return;
      }
      const el = host.current,
        scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100),
        controls = new OrbitControls(camera, renderer.domElement);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      el.appendChild(renderer.domElement);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x758195, 2.6));
      const light = new THREE.DirectionalLight(0xffffff, 3.5);
      light.position.set(-4, 8, 10);
      scene.add(light);
      if (background === "dark") scene.background = new THREE.Color(0x07172b);
      callbacks.current.onGeometry?.({ atoms, bonds, is3D });
      const atomMeshes = new Map();
      const group = new THREE.Group();
      scene.add(group);
      const center = new THREE.Vector3();
      atoms.forEach((a) => center.add(new THREE.Vector3(a.x, a.y, a.z)));
      center.divideScalar(atoms.length || 1);
      const positions = new Map(
        atoms.map((a) => [a.id, new THREE.Vector3(a.x, a.y, a.z).sub(center)]),
      );
      const material = (c) =>
        new THREE.MeshStandardMaterial({
          color: c,
          roughness: 0.28,
          metalness: 0.08,
        });
      atoms.forEach((a) => {
        if (representation === "Wireframe" || representation === "Sticks")
          return;
        const r =
          representation === "Space Fill"
            ? a.element === "H"
              ? 0.8
              : 1.25
            : a.element === "H"
              ? 0.25
              : 0.43;
        const sphere = new THREE.Mesh(
          new THREE.SphereGeometry(r, 24, 18),
          material(colors[a.element] || 0xc47edd),
        );
        sphere.position.copy(positions.get(a.id));
        sphere.userData.atomId = a.id;
        atomMeshes.set(a.id, sphere);
        group.add(sphere);
      });
      if (representation !== "Space Fill")
        bonds.forEach((b) => {
          const a = positions.get(b.a),
            c = positions.get(b.b);
          if (!a || !c) return;
          const axis = c.clone().sub(a).normalize();
          const side = new THREE.Vector3().crossVectors(
            axis,
            new THREE.Vector3(0, 0, 1),
          );
          if (side.lengthSq() < 0.001)
            side.crossVectors(axis, new THREE.Vector3(0, 1, 0));
          side.normalize();
          const order = Math.min(3, Math.max(1, b.order === 4 ? 1 : b.order));
          for (let j = 0; j < order; j++) {
            const offset = side
              .clone()
              .multiplyScalar((j - (order - 1) / 2) * 0.2);
            const startA = a.clone().add(offset),
              endB = c.clone().add(offset),
              midpoint = startA.clone().lerp(endB, 0.5);
            [
              [startA, midpoint, atoms.find((v) => v.id === b.a)],
              [midpoint, endB, atoms.find((v) => v.id === b.b)],
            ].forEach(([start, end, atom]) => {
              const direction = end.clone().sub(start),
                r =
                  representation === "Wireframe"
                    ? 0.025
                    : order > 1
                      ? 0.07
                      : 0.12;
              const mesh = new THREE.Mesh(
                new THREE.CylinderGeometry(r, r, direction.length(), 12),
                material(colors[atom.element] || 0x667788),
              );
              mesh.position.copy(start).lerp(end, 0.5);
              mesh.quaternion.setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction.normalize(),
              );
              group.add(mesh);
            });
          }
        });
      const radius = Math.max(
        2,
        ...[...positions.values()].map((p) => p.length()),
      );
      camera.position.set(0, 0, radius * 3.15);
      controls.enableDamping = true;
      controls.autoRotate = spin;
      controls.autoRotateSpeed = 1.2;
      controls.saveState();
      sceneRef.current = { controls, renderer, scene, camera, atomMeshes };
      const raycaster = new THREE.Raycaster(),
        pointer = new THREE.Vector2();
      let pointerStart = null;
      const down = (e) => {
        pointerStart = [e.clientX, e.clientY];
      };
      const up = (e) => {
        if (
          !pointerStart ||
          Math.hypot(e.clientX - pointerStart[0], e.clientY - pointerStart[1]) >
            5
        )
          return;
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.set(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects([...atomMeshes.values()])[0];
        if (hit) callbacks.current.onAtomPick?.(hit.object.userData.atomId);
      };
      renderer.domElement.addEventListener("pointerdown", down);
      renderer.domElement.addEventListener("pointerup", up);
      const labelElements = atomLabels
        ? atoms.map((atom) => {
            const label = document.createElement("span");
            label.className = "draw-atom-label";
            label.textContent = `${atom.id} ${atom.element}`;
            el.appendChild(label);
            return { label, position: positions.get(atom.id) };
          })
        : [];

      const resize = () => {
        const w = el.clientWidth,
          h = el.clientHeight;
        if (w < 1 || h < 1) return;
        renderer.setSize(w, h);
        camera.aspect = w / Math.max(h, 1);
        camera.position.setLength((radius * 3.45) / Math.min(1, camera.aspect));
        controls.saveState();
        camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize);
      observer.observe(el);
      resize();
      let frame,
        measurementLine = null,
        previousSelection = "";
      const animate = () => {
        frame = requestAnimationFrame(animate);
        if (!el.clientWidth || !el.clientHeight) return;
        controls.update();
        atomMeshes.forEach((mesh, id) =>
          mesh.material.emissive.setHex(
            callbacks.current.selectedAtomIds.includes(id) ? 0x8a6500 : 0,
          ),
        );
        const selectionKey = callbacks.current.selectedAtomIds.join(",");
        if (selectionKey !== previousSelection) {
          previousSelection = selectionKey;
          if (measurementLine) {
            scene.remove(measurementLine);
            measurementLine.geometry.dispose();
            measurementLine.material.dispose();
            measurementLine = null;
          }
          const points = callbacks.current.selectedAtomIds
            .map((id) => positions.get(Number(id)))
            .filter(Boolean);
          if (points.length > 1) {
            measurementLine = new THREE.Line(
              new THREE.BufferGeometry().setFromPoints(points),
              new THREE.LineBasicMaterial({
                color: 0xf39a15,
                depthTest: false,
              }),
            );
            measurementLine.renderOrder = 5;
            scene.add(measurementLine);
          }
        }
        for (const { label, position } of labelElements) {
          const projected = position.clone().project(camera);
          label.style.left = `${((projected.x + 1) * el.clientWidth) / 2}px`;
          label.style.top = `${((1 - projected.y) * el.clientHeight) / 2}px`;
          label.style.display = projected.z < 1 ? "block" : "none";
        }
        renderer.render(scene, camera);
      };
      animate();
      dispose = () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        renderer.domElement.removeEventListener("pointerdown", down);
        renderer.domElement.removeEventListener("pointerup", up);
        labelElements.forEach(({ label }) => label.remove());
        controls.dispose();
        scene.traverse((o) => {
          o.geometry?.dispose();
          if (o.material) o.material.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
        sceneRef.current = null;
      };
    }
    init();
    return () => {
      cancelled = true;
      dispose();
    };
  }, [model, name, representation, sdfText, atomLabels, background]);
  return (
    <div
      className="draw-molecule-host"
      ref={host}
      style={{ background: background === "dark" ? "#07172b" : undefined }}
      role="img"
      aria-label={`Interactive ${hasConformer ? "3D conformer" : "planar molecular model"} of ${name}`}
    >
      {status && <small>{status}</small>}
      {!hasConformer && <small>Planar graph · drag to rotate</small>}
    </div>
  );
});
