import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import {
  initialMotion,
  actMotion,
  stepMotion,
} from "./chromatographyMotion.js";
import { rfValues } from "./chromatographyModel.js";
import "./ChromatographyMotionBench.css";

export default function ChromatographyMotionBench({ onClose,initialState }) {
  const host = useRef(null),
    hitTube = useRef(() => false),
    state = useRef(initialState ? structuredClone(initialState) : initialMotion()),
    [snapshot, setSnapshot] = useState({ ...state.current }),
    [reduced, setReduced] = useState(false);
  const dispatch = (action, value) => {
    state.current = actMotion(state.current, action, value);
    setSnapshot({ ...state.current });
  };
  useEffect(() => {
    const node = host.current,
      scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9f1f8");
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.transmissionResolutionScale = 0.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    node.appendChild(renderer.domElement);
    const pmrem = new THREE.PMREMGenerator(renderer),
      room = new RoomEnvironment(),
      env = pmrem.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    pmrem.dispose();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
    camera.position.set(0, 3.5, 9);
    camera.lookAt(0, 1, 0);
    const light = new THREE.DirectionalLight("#ffffff", 2);
    light.position.set(-3, 7, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    scene.add(light, new THREE.HemisphereLight("#dcecff", "#718095", 0.6));
    scene.environmentIntensity = 0.6;
    const materials = [],
      geometries = [];
    function material(opts) {
      const m = new THREE.MeshPhysicalMaterial(opts);
      materials.push(m);
      return m;
    }
    const glass = material({
      color: "#c8dfed",
      transmission: 0.9,
      transparent: true,
      opacity: 0.32,
      roughness: 0.12,
      ior: 1.46,
      thickness: 0.06,
      clearcoat: 1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const white = material({ color: "#fafafa", roughness: 0.36 }),
      blue = material({ color: "#085adc", roughness: 0.3 }),
      steel = material({ color: "#a9b5c0", metalness: 0.75, roughness: 0.25 });
    function mesh(g, m, parent = scene) {
      geometries.push(g);
      const o = new THREE.Mesh(g, m);
      o.castShadow = true;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    }
    function box(w, h, d, m, x, y, z, parent = scene) {
      const o = mesh(new THREE.BoxGeometry(w, h, d), m, parent);
      o.position.set(x, y, z);
      return o;
    }
    function cylinder(r, h, m, x, y, z, parent = scene) {
      const o = mesh(new THREE.CylinderGeometry(r, r, h, 48), m, parent);
      o.position.set(x, y, z);
      return o;
    }
    box(
      8,
      0.16,
      4,
      material({ color: "#c4d0db", metalness: 0.25, roughness: 0.3 }),
      0,
      -0.1,
      0,
    );
    for (let i = 0; i < 6; i++) {
      box(0.6, 2, 0.25, white, -3 + i * 1.2, 1, -1.8);
      cylinder(0.1, 0.5, blue, -3 + i * 1.2, 2.25, -1.8);
    }
    const tube = new THREE.Group();
    scene.add(tube);
    tube.position.set(-2, 1, 0);
    const raycaster = new THREE.Raycaster();
    hitTube.current = (x, y) => {
      const bounds = node.getBoundingClientRect();
      raycaster.setFromCamera(
        new THREE.Vector2(
          ((x - bounds.left) / bounds.width) * 2 - 1,
          (-(y - bounds.top) / bounds.height) * 2 + 1,
        ),
        camera,
      );
      return raycaster.intersectObject(tube, true).length > 0;
    };
    const profile = [
      new THREE.Vector2(0.01, -0.82),
      new THREE.Vector2(0.17, -0.79),
      new THREE.Vector2(0.24, -0.66),
      new THREE.Vector2(0.24, 0.8),
      new THREE.Vector2(0.27, 0.82),
      new THREE.Vector2(0.27, 0.85),
      new THREE.Vector2(0.22, 0.85),
      new THREE.Vector2(0.215, -0.64),
      new THREE.Vector2(0.15, -0.73),
      new THREE.Vector2(0.01, -0.75),
    ];
    mesh(new THREE.LatheGeometry(profile, 64), glass, tube);
    const cap = cylinder(0.27, 0.15, blue, 0, 0.94, 0, tube);
    const fluidMat = material({
      color: "#bb691a",
      roughness: 0.2,
      clearcoat: 1,
    });
    const liquidGeo = new THREE.CylinderGeometry(0.208, 0.17, 1.1, 48, 12),
      liquid = mesh(liquidGeo, fluidMat, tube);
    liquid.position.y = -0.18;
    const original = liquidGeo.attributes.position.array.slice();
    const particles = [];
    for (let i = 0; i < 35; i++) {
      const p = mesh(
        new THREE.SphereGeometry(0.012, 8, 6),
        material({ color: i % 2 ? "#6b3416" : "#ffd46a", roughness: 0.5 }),
        tube,
      );
      particles.push(p);
    }
    const pipette = new THREE.Group();
    scene.add(pipette);
    pipette.position.set(-0.8, 2.5, 0);
    cylinder(0.105, 0.9, white, 0, 0, 0, pipette);
    cylinder(0.13, 0.22, blue, 0, 0.55, 0, pipette);
    const tip = mesh(new THREE.ConeGeometry(0.06, 0.65, 32), glass, pipette);
    tip.rotation.z = Math.PI;
    tip.position.y = -0.72;
    const tipLiquid = cylinder(0.028, 0.4, fluidMat, 0, -0.7, 0, pipette);
    const chamber = new THREE.Group();
    scene.add(chamber);
    chamber.position.set(1.5, 0.85, 0);
    box(1.8, 0.08, 0.8, glass, 0, -0.72, 0, chamber);
    for (const x of [-0.9, 0.9])
      box(0.07, 1.6, 0.8, glass, x, 0.04, 0, chamber);
    for (const z of [-0.4, 0.4])
      box(1.8, 1.6, 0.06, glass, 0, 0.04, z, chamber);
    box(1.9, 0.08, 0.9, glass, 0, 0.87, 0, chamber);
    const solvent = box(
      1.7,
      0.17,
      0.7,
      material({
        color: "#c7e4ed",
        transmission: 0.65,
        roughness: 0.15,
        transparent: true,
        opacity: 0.65,
      }),
      0,
      -0.6,
      0,
      chamber,
    );
    const plate = new THREE.Group();
    scene.add(plate);
    plate.position.set(0.05, 0.7, 0.7);
    const plateMat = material({ color: "#f5f2df", roughness: 0.8 });
    box(0.75, 1.35, 0.04, plateMat, 0, 0, 0, plate);
    const spots = rfValues().map((c) => {
      const o = mesh(
        new THREE.SphereGeometry(0.048, 24, 16),
        material({ color: c.color, roughness: 0.6 }),
        plate,
      );
      o.scale.z = 0.18;
      return o;
    });
    const front = box(0.72, 0.008, 0.006, blue, 0, -0.5, 0.028, plate);
    const drop = mesh(new THREE.SphereGeometry(0.026, 16, 12), fluidMat);
    drop.visible = false;
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(media.matches);
    const change = () => setReduced(media.matches);
    media.addEventListener("change", change);
    const observer = new ResizeObserver(() => {
      const { width, height } = node.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
    observer.observe(node);
    let raf,
      previous = performance.now(),
      lastUI = 0;
    function draw(now) {
      const s = state.current,
        dt = s.paused ? 0 : (now - previous) / 1000;
      previous = now;
      stepMotion(s, dt);
      const motionScale = media.matches ? 0.2 : 1;
      tube.position.x = -2 + s.x * motionScale;
      tube.rotation.z = s.angle * motionScale;
      const uncapped = ![
        "idle",
        "moving",
        "shaking",
        "settling",
        "mixed",
      ].includes(s.phase);
      cap.position.lerp(
        new THREE.Vector3(uncapped ? -0.7 : 0, uncapped ? -0.8 : 0.94, 0),
        1 - Math.exp(-dt * 7),
      );
      const pos = liquidGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = original[i * 3],
          y = original[i * 3 + 1],
          z = original[i * 3 + 2],
          topWeight = (y + 0.55) / 1.1;
        const slope = -Math.tan(s.angle * motionScale) + s.slosh * motionScale;
        pos.setY(
          i,
          y * (s.tubeVolume / 1000) +
            topWeight *
              (x * slope + .015 * Math.pow(Math.hypot(x,z)/.208,8) +
                0.018 * Math.sin(x * 22 + s.time * 8) * Math.abs(s.slosh)),
        );
      }
      pos.needsUpdate = true;
      liquidGeo.computeVertexNormals();
      fluidMat.color.setRGB(
        0.7 + 0.15 * s.mixing,
        0.25 + 0.2 * s.mixing,
        0.05 + 0.12 * s.mixing,
      );
      fluidMat.opacity = 0.7 + 0.22 * s.suspension;
      particles.forEach((p, i) => {
        const a = i * 2.4,
          r = 0.13 * Math.sqrt((i + 1) / 35);
        p.position.set(
          Math.cos(a) * r,
          -0.7 +
            s.suspension * ((i % 9) / 10 + 0.06 * Math.sin(s.time * 3 + i)),
          Math.sin(a) * r,
        );
      });
      let px = -0.8,
        py = 2.5,
        pz = 0;
      if (["aspirating", "aspirated"].includes(s.phase)) {
        const t =
          s.phase === "aspirated"
            ? 1
            : THREE.MathUtils.smoothstep(s.elapsed, 0, 1);
        px = THREE.MathUtils.lerp(-0.8, -2, t);
        py = THREE.MathUtils.lerp(2.5, 1.5, t);
      }
      if (["dispensing", "spotted"].includes(s.phase)) {
        const t =
          s.phase === "spotted"
            ? 1
            : THREE.MathUtils.smoothstep(s.elapsed, 0, 1);
        px = THREE.MathUtils.lerp(-2, 0.05, t);
        py = THREE.MathUtils.lerp(1.5, 1.35, t);
        pz = 0.8 * t;
      }
      pipette.position.lerp(
        new THREE.Vector3(px, py, pz),
        1 - Math.exp(-dt * 8),
      );
      tipLiquid.scale.y = s.pipetteVolume / 2;
      tipLiquid.visible = s.pipetteVolume > 0;
      const placeT = ["positioned", "developing", "developed"].includes(s.phase)
        ? 1
        : s.phase === "placing"
          ? THREE.MathUtils.smoothstep(s.elapsed, 0, 1.5)
          : s.phase === "removing"
            ? 1 - THREE.MathUtils.smoothstep(s.elapsed, 0, 1.5)
            : 0;
      plate.position.set(
        THREE.MathUtils.lerp(0.05, 1.5, placeT),
        THREE.MathUtils.lerp(0.7, 1, placeT) + Math.sin(placeT * Math.PI) * 1.1,
        THREE.MathUtils.lerp(0.7, 0, placeT),
      );
      const rfs = rfValues(s.developedEthyl);
      spots.forEach((o, i) => {
        o.visible = s.plateVolume > 0;
        o.position.set((i - 1) * 0.2, -0.5 + s.front * rfs[i].rf * 1.05, 0.035);
        o.material.emissive.set(s.uv ? rfs[i].color : "#000000");
        o.material.emissiveIntensity = s.uv ? 0.8 : 0;
      });
      front.position.y = -0.5 + s.front * 1.05;
      plateMat.color.set(s.uv ? "#082489" : "#f5f2df");
      drop.visible =
        s.phase === "dispensing" && s.elapsed > 1 && s.pipetteVolume > 0;
      drop.position.set(0.05, .2 + .1 * (1 - ((s.elapsed * 2) % 1)), 0.8);
      solvent.position.y = -0.6 - 0.04 * s.front;
      renderer.render(scene, camera);
      if (now - lastUI > 80) {
        setSnapshot({ ...s });
        lastUI = now;
      }
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      media.removeEventListener("change", change);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      env.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);
  const drag = useRef(null);
  return (
    <div
      className="chm-modal"
      role="dialog"
      aria-modal="true"
      aria-label="Chromatography sample preparation"
    >
      <header>
        <h2>Sample preparation · live apparatus</h2>
        <button onClick={()=>onClose(structuredClone(state.current))}>Close preparation</button>
      </header>
      <div
        ref={host}
        className="chm-scene"
        onPointerDown={(e) => {
          if (!hitTube.current(e.clientX,e.clientY)) return;
          drag.current = { x: e.clientX, y: e.clientY };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            dispatch("drag", {
              x: (e.clientX - drag.current.x) / 180,
              angle: (e.clientY - drag.current.y) / 180,
            });
        }}
        onPointerUp={() => {
          drag.current = null;
          dispatch("stop");
        }}
        onPointerCancel={() => {
          drag.current = null;
          dispatch("stop");
        }}
        aria-label="Drag to shake sample tube"
      />
      <div className="chm-readings" data-motion={JSON.stringify(snapshot)}>
        <span>
          State: {snapshot.phase}
          {snapshot.paused ? " (paused)" : ""}
        </span>
        <span>Tube: {snapshot.tubeVolume.toFixed(2)} µL</span>
        <span>Pipette: {snapshot.pipetteVolume.toFixed(2)} / 2 µL</span>
        <span>Plate: {snapshot.plateVolume.toFixed(2)} µL</span>
        <span>Front: {(snapshot.front * 8).toFixed(2)} cm</span>
        {rfValues(snapshot.developedEthyl).map(c=><span key={c.id}>{c.id}: {(c.distance*snapshot.front).toFixed(2)} cm · Rf {c.rf.toFixed(2)}</span>)}
      </div>
      <p aria-live="polite">{snapshot.message}</p>
      <div className="chm-controls">
        {[
          ["shake", "Shake sample"],
          ["stop", "Stop shaking"],
          ["aspirate", "Aspirate 2 µL"],
          ["dispense", "Dispense onto plate"],
          ["place", "Place in chamber"],
          ["develop", "Develop plate"],
          ["inspect", "Remove and inspect"],
          ["uv", "UV 254 nm"],
          ["pause", snapshot.paused ? "Resume motion" : "Pause motion"],
          ["reset", "Reset preparation"],
        ].map(([action, label]) => (
          <button key={action} onClick={() => dispatch(action)}>
            {label}
          </button>
        ))}
        <label>
          Ethyl acetate{" "}
          <select
            value={snapshot.ethyl}
            onChange={(e) => dispatch("ratio", +e.target.value)}
          >
            {[10, 20, 30, 40].map((x) => (
              <option key={x} value={x}>
                {100 - x}:{x}
              </option>
            ))}
          </select>
        </label>
      </div>
      {reduced && (
        <small>
          Reduced motion: shaking displacement is reduced; experiment timing and
          volumes are preserved.
        </small>
      )}
    </div>
  );
}
