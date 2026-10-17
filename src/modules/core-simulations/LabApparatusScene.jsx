import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Play, Pause, RotateCcw, Maximize2 } from "lucide-react";
import "./labApparatusScene.css";
export default function LabApparatusScene({
  kind = "titration",
  label = "Laboratory apparatus",
  running = false,
  fill = "#43b6dd",
}) {
  const host = useRef(),
    api = useRef(),
    live = useRef({}),
    [animated, setAnimated] = useState(false),
    [error, setError] = useState("");
  live.current = { running: running || animated };
  useEffect(() => {
    const node = host.current;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    } catch {
      setError(
        "WebGL is unavailable. Laboratory controls and numerical results remain available.",
      );
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.setClearColor(0xdce8ef);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.domElement.setAttribute(
      "aria-label",
      `Interactive 3D ${label}. Drag to orbit; scroll to zoom.`,
    );
    renderer.domElement.tabIndex = 0;
    node.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(34, 1, 0.1, 80);
    camera.position.set(7, 4.3, 9);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.5, 0);
    controls.enableDamping = true;
    controls.minDistance = 4;
    controls.maxDistance = 20;
    controls.maxPolarAngle = Math.PI * 0.49;
    controls.saveState();
    api.current = { reset: () => controls.reset() };
    const pmrem = new T.PMREMGenerator(renderer),
      room = new RoomEnvironment(),
      environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();
    pmrem.dispose();
    scene.add(new T.HemisphereLight(0xe1f5ff, 0x182f49, 2));
    const light = new T.DirectionalLight(0xffffff, 3);
    light.position.set(3, 8, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(512, 512);
    light.shadow.camera.left = -8;
    light.shadow.camera.right = 8;
    light.shadow.camera.top = 6;
    light.shadow.camera.bottom = -6;
    light.shadow.bias = -0.001;
    scene.add(light);
    const edge = new T.PointLight(0x51baff, 25);
    edge.position.set(-5, 3, -3);
    scene.add(edge);
    const group = new T.Group();
    scene.add(group);
    const material = (color, metalness = 0, roughness = 0.3) =>
      new T.MeshStandardMaterial({ color, metalness, roughness });
    const steel = material(0xb8c5d1, 0.88, 0.2),
      white = material(0xdce5e9, 0.15),
      dark = material(0x142b3c, 0.35),
      blue = material(0x176dc1, 0.25),
      glass = new T.MeshPhysicalMaterial({
        color: 0xbde9ff,
        transparent: true,
        opacity: 0.22,
        roughness: 0.06,
        side: T.DoubleSide,
        depthWrite: false,
      }),
      liquid = new T.MeshPhysicalMaterial({
        color: fill,
        transparent: true,
        opacity: 0.5,
        roughness: 0.1,
        depthWrite: false,
      });
    const mesh = (geo, mat, x = 0, y = 0, z = 0, parent = group) => {
      const o = new T.Mesh(geo, mat);
      o.position.set(x, y, z);
      o.castShadow = !mat.transparent;
      o.receiveShadow = true;
      parent.add(o);
      return o;
    };
    const box = (w, h, d, mat, x, y, z, p) =>
        mesh(new T.BoxGeometry(w, h, d), mat, x, y, z, p),
      cyl = (r, h, mat, x, y, z, p) =>
        mesh(new T.CylinderGeometry(r, r, h, 40), mat, x, y, z, p),
      sphere = (r, mat, x, y, z, p) =>
        mesh(new T.SphereGeometry(r, 40, 28), mat, x, y, z, p);
    const tube = (points, r = 0.035, mat = steel) =>
      mesh(
        new T.TubeGeometry(
          new T.CatmullRomCurve3(points.map((p) => new T.Vector3(...p))),
          40,
          r,
          12,
          false,
        ),
        mat,
      );
    const rod = (a, b, r = 0.04, mat = steel) => {
      const start = new T.Vector3(...a),
        end = new T.Vector3(...b),
        o = cyl(r, start.distanceTo(end), mat, 0, 0, 0);
      o.position.copy(start).add(end).multiplyScalar(0.5);
      o.quaternion.setFromUnitVectors(
        new T.Vector3(0, 1, 0),
        end.sub(start).normalize(),
      );
      return o;
    };
    const textures = [];
    const text = (
      caption,
      x,
      y,
      z,
      w = 1.6,
      h = 0.35,
      bg = "#072337",
      color = "#66eaff",
    ) => {
      const c = document.createElement("canvas");
      c.width = 640;
      c.height = 140;
      const ctx = c.getContext("2d");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 640, 140);
      ctx.fillStyle = color;
      ctx.font = "bold 44px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(caption, 320, 70, 615);
      const texture = new T.CanvasTexture(c);
      texture.colorSpace = T.SRGBColorSpace;
      textures.push(texture);
      return mesh(
        new T.PlaneGeometry(w, h),
        new T.MeshBasicMaterial({ map: texture }),
        x,
        y,
        z,
      );
    };
    const flask = (x, z, color = liquid, scale = 1) => {
      const f = new T.Group();
      group.add(f);
      f.position.set(x, 0.25, z);
      f.scale.setScalar(scale);
      mesh(
        new T.CylinderGeometry(0.17, 0.57, 0.95, 48, 1, true),
        glass,
        0,
        0.48,
        0,
        f,
      );
      cyl(0.17, 0.5, glass, 0, 1.2, 0, f);
      mesh(new T.CylinderGeometry(0.36, 0.53, 0.5, 40), color, 0, 0.27, 0, f);
      cyl(0.2, 0.07, blue, 0, 1.48, 0, f);
      return f;
    };
    const beaker = (x, z, r = 0.65, h = 1.5) => {
      mesh(
        new T.CylinderGeometry(r, r, h, 48, 1, true),
        glass,
        x,
        0.3 + h / 2,
        z,
      );
      cyl(r, 0.04, glass, x, 0.3, z);
      cyl(r * 0.94, h * 0.55, liquid, x, 0.32 + h * 0.275, z);
      const ring = mesh(
        new T.TorusGeometry(r, 0.018, 10, 60),
        steel,
        x,
        0.3 + h,
        z,
      );
      ring.rotation.x = Math.PI / 2;
      for (let i = 1; i < 5; i++)
        box(
          0.16,
          0.012,
          0.015,
          white,
          x - r * 0.6,
          0.35 + (i * h) / 6,
          z + r * 0.85,
        );
    };
    box(12, 0.22, 7, material(0x8aa1b3, 0.25), 0, 0.08, 0);
    box(12, 4.3, 0.1, material(0xc1d1dc), 0, 2, -2.65);
    for (let i = 0; i < 7; i++)
      box(0.025, 4.3, 0.025, steel, -5.5 + i * 1.8, 2, -2.57);
    const particles = [],
      spinners = [];
    let motion = () => {};
    const type = kind.replace("-bench", "");
    if (["spectrophotometer", "cuvette"].includes(type)) {
      box(5, 1.3, 2.8, white, -0.9, 0.9, 0);
      box(5, 0.12, 2.8, steel, -0.9, 0.28, 0);
      box(2.4, 0.7, 1.4, dark, -1.7, 1.8, -0.55);
      text(
        type === "cuvette" ? "SPECTROPHOTOMETER" : "UV–VISIBLE  620 nm",
        -1.7,
        1.77,
        0.18,
        2.05,
        0.32,
      );
      text("ABSORBANCE", -1.7, 1.36, 1.42, 2, 0.25);
      for (let i = 0; i < 5; i++)
        cyl(0.075, 0.04, blue, -1.9 + i * 0.34, 0.8, 1.43).rotation.x =
          Math.PI / 2;
      const lid = box(1.65, 0.09, 1.7, dark, 0.6, 2.2, -0.7);
      lid.rotation.x = -0.5;
      box(1.55, 0.12, 1.7, dark, 0.6, 1.6, 0);
      box(0.35, 0.9, 0.35, glass, 0.6, 2.05, 0);
      box(0.3, 0.55, 0.3, liquid, 0.6, 1.88, 0);
      const beam = box(
        2.3,
        0.025,
        0.025,
        new T.MeshBasicMaterial({
          color: 0x31dcff,
          transparent: true,
          opacity: 0.75,
        }),
        0.6,
        1.9,
        0,
      );
      motion = (t) => {
        beam.material.opacity = 0.45 + 0.4 * Math.sin(t * 3) ** 2;
      };
      for (let i = 0; i < 4; i++) {
        flask(2.5 + (i % 2) * 0.9, -0.8 + Math.floor(i / 2) * 1.3, liquid, 0.7);
        text(
          String((i + 1) * 2) + " µM",
          2.5 + (i % 2) * 0.9,
          0.48,
          Math.floor(i / 2) * 1.3 - 0.4,
          0.48,
          0.15,
        );
      }
    } else if (type === "water-bath") {
      box(3, 0.4, 2.4, dark, -1.5, 0.45, 0);
      box(2.8, 1.25, 2.1, glass, -1.5, 1.2, 0);
      box(2.65, 0.8, 1.95, liquid, -1.5, 1, 0);
      sphere(0.52, glass, -1.5, 1.65, 0);
      const solution = sphere(0.46, liquid, -1.5, 1.55, 0);
      solution.scale.y = 0.55;
      cyl(0.13, 0.8, glass, -1.5, 2.35, 0);
      flask(2, 0);
      mesh(new T.CylinderGeometry(0.48, 0.18, 0.4, 40), white, 2, 2, 0);
      cyl(0.12, 0.6, glass, 2, 1.65, 0);
      tube(
        [
          [2.15, 1.25, 0],
          [3, 1.25, 0],
          [3.5, 0.4, -0.6],
        ],
        0.04,
        steel,
      );
      text("HEATED WATER BATH", -1.5, 0.45, 1.23, 2.3, 0.24);
      text("VACUUM FILTRATION", 2, 0.22, 1.25, 2, 0.22);
      for (let i = 0; i < 12; i++)
        particles.push(
          sphere(
            0.025,
            new T.MeshBasicMaterial({ color: 0xa7e8ff }),
            -1.5,
            1,
            0,
          ),
        );
      motion = (t) =>
        particles.forEach((o, i) =>
          o.position.set(
            -1.5 + Math.sin(i * 2) * 0.8,
            0.65 + ((t * 0.18 + i * 0.08) % 0.8),
            Math.cos(i * 3) * 0.6,
          ),
        );
    } else if (type === "organic") {
      box(2, 0.35, 2, dark, -1, 0.4, 0);
      const mantle = sphere(0.68, material(0x5383a6, 0.2), -1, 0.85, 0);
      mantle.scale.y = 0.55;
      sphere(0.53, glass, -1, 1.25, 0);
      const solution = sphere(0.47, liquid, -1, 1.15, 0);
      solution.scale.y = 0.55;
      cyl(0.12, 0.7, glass, -1, 1.92, 0);
      cyl(0.2, 1.6, glass, -1, 3, 0);
      cyl(0.07, 1.6, glass, -1, 3, 0);
      tube(
        [
          [-0.8, 2.35, 0],
          [0.4, 2.35, -0.4],
          [1.4, 0.5, -0.6],
        ],
        0.035,
        blue,
      );
      tube(
        [
          [-0.8, 3.6, 0],
          [0.3, 3.6, -0.4],
          [1.8, 0.5, -1],
        ],
        0.035,
        material(0xc65343),
      );
      box(0.8, 0.12, 1, steel, -2.2, 0.25, -0.3);
      cyl(0.035, 3.8, steel, -2.2, 2.2, -0.3);
      rod([-2.2, 2.9, -0.3], [-1, 2.9, 0], 0.03);
      text("REFLUX CONDENSER", 1.3, 2.5, 0, 2, 0.3);
      text("HEATING MANTLE", -1, 0.4, 1.03, 1.8, 0.22);
      for (let i = 0; i < 12; i++)
        particles.push(
          sphere(0.025, new T.MeshBasicMaterial({ color: 0x9ce3ff }), -1, 2, 0),
        );
      motion = (t) =>
        particles.forEach((o, i) => {
          o.position.set(
            -1 + Math.sin(i) * 0.035,
            1.7 + ((t * 0.4 + i * 0.16) % 1.9),
            0,
          );
        });
    } else if (type === "distillation") {
      box(2, 0.38, 2, dark, -2, 0.45, 0);
      const mantle = sphere(0.72, material(0x5383a6, 0.2), -2, 0.9, 0);
      mantle.scale.y = 0.6;
      sphere(0.58, glass, -2, 1.35, 0);
      const solution = sphere(0.52, liquid, -2, 1.3, 0);
      solution.scale.y = 0.55;
      cyl(0.13, 1.4, glass, -2, 2.4, 0);
      cyl(0.23, 1.25, glass, -2, 2.5, 0);
      for (let i = 0; i < 8; i++)
        cyl(0.2, 0.035, steel, -2, 1.95 + i * 0.14, 0);
      rod([-2, 3.15, 0], [-0.7, 3.15, 0], 0.09, glass);
      rod([-0.7, 3.15, 0], [1.8, 1.5, 0], 0.19, glass);
      rod([-0.7, 3.15, 0], [1.8, 1.5, 0], 0.075, glass);
      tube(
        [
          [-0.5, 3, -0.15],
          [0, 3.4, -1],
          [2, 2.5, -1],
        ],
        0.04,
        blue,
      );
      tube(
        [
          [1.4, 1.8, -0.15],
          [2.5, 1.8, -1],
          [3, 1, -1],
        ],
        0.04,
        material(0xc65343),
      );
      flask(2.15, 0);
      for (const x of [-3, 0.5]) {
        box(0.8, 0.12, 0.8, steel, x, 0.28, -0.5);
        cyl(0.035, 3.6, steel, x, 2.05, -0.5);
      }
      for (let i = 0; i < 15; i++)
        particles.push(
          sphere(
            0.025,
            new T.MeshBasicMaterial({ color: 0x82d9ff }),
            -2,
            1.8,
            0,
          ),
        );
      motion = (t) =>
        particles.forEach((o, i) => {
          const q = (t * 0.18 + i / 15) % 1;
          o.position.set(-2 + q * 3.8, 3.1 - q * 1.5, 0.02);
        });
    } else if (["flame-photometer", "flame"].includes(type)) {
      box(3.5, 2.4, 2.5, white, -1, 1.5, 0);
      box(2.7, 1.1, 0.08, dark, -1, 1.8, 1.28);
      text("Na 589 nm", -1, 2.1, 1.34, 1.5, 0.3);
      text("EMISSION  0.00", -1, 1.6, 1.35, 2, 0.28);
      cyl(0.23, 0.5, steel, 0.1, 3, 0);
      const flame = mesh(
        new T.ConeGeometry(0.23, 1.1, 32),
        new T.MeshBasicMaterial({
          color: 0xffb333,
          transparent: true,
          opacity: 0.8,
        }),
        0.1,
        3.75,
        0,
      );
      const core = mesh(
        new T.ConeGeometry(0.11, 0.7, 24),
        new T.MeshBasicMaterial({ color: 0x3cb5ff }),
        0.1,
        3.5,
        0,
      );
      for (let i = 0; i < 3; i++) flask(1.7 + i * 0.9, 0.3, liquid, 0.65);
      tube(
        [
          [0.1, 2.8, 0],
          [1.5, 2.7, 0],
          [2, 1, 0],
        ],
        0.035,
      );
      motion = (t) => {
        flame.scale.set(
          1 + Math.sin(t * 7) * 0.07,
          1 + Math.sin(t * 11) * 0.12,
          1,
        );
        core.scale.y = 1 + Math.sin(t * 9) * 0.08;
      };
    } else if (["gravimetric", "balance"].includes(type)) {
      box(3, 0.45, 2.6, white, -1.5, 0.5, 0);
      box(2.7, 1.8, 2.3, glass, -1.5, 1.65, 0);
      for (const x of [-2.8, -0.2])
        for (const z of [-1.1, 1.1]) box(0.035, 1.9, 0.035, steel, x, 1.65, z);
      cyl(0.65, 0.07, steel, -1.5, 0.83, 0);
      cyl(0.28, 0.24, white, -1.5, 1, 0);
      text("0.0000 g", -1.5, 0.5, 1.32, 1.6, 0.24);
      box(2.3, 2.7, 2.3, white, 2.1, 1.6, -0.2);
      box(1.85, 1.8, 0.08, dark, 2.1, 1.7, 1);
      box(1.4, 1.3, 0.08, glass, 2.1, 1.7, 1.07);
      text("DRYING OVEN", 2.1, 2.75, 1.08, 1.8, 0.25);
      beaker(0.4, 1.2, 0.4, 1.1);
    } else if (["viscosity", "viscometer"].includes(type)) {
      box(4.8, 0.35, 2.6, white, 0, 0.5, 0);
      box(4.4, 2.4, 2.2, glass, 0, 1.8, 0);
      for (const x of [-0.7, 0.7]) {
        cyl(0.07, 2.5, glass, x, 2, 0);
        sphere(0.28, glass, x, 2.45, 0);
        cyl(0.045, 1.6, liquid, x, 1.7, 0);
      }
      tube(
        [
          [-0.7, 0.85, 0],
          [-0.7, 0.6, 0],
          [0.7, 0.6, 0],
          [0.7, 0.85, 0],
        ],
        0.065,
        glass,
      );
      cyl(0.05, 2.7, steel, 1.6, 2, 0);
      text("TEMPERATURE BATH", 0, 0.5, 1.34, 2, 0.25);
      for (let i = 0; i < 10; i++)
        particles.push(
          sphere(0.025, new T.MeshBasicMaterial({ color: 0x68dcff }), 0, 0, 0),
        );
      motion = (t) =>
        particles.forEach((o, i) =>
          o.position.set(0.7, 0.9 + ((t * 0.3 + i * 0.15) % 1.8), 0),
        );
    } else if (
      [
        "soil",
        "ph-meter",
        "corrosion",
        "polarography",
        "electrodes",
        "calorimeter",
        "calorimetry",
      ].includes(type)
    ) {
      const calor = type.startsWith("calor");
      beaker(-1.1, 0, 0.9, 1.8);
      if (calor) {
        cyl(1, 0.12, white, -1.1, 2.15, 0);
        cyl(0.065, 2, steel, -1.1, 2.35, 0);
        box(1.2, 2.5, 1.1, white, 2, 1.5, -0.2);
      } else {
        for (let i = 0; i < 3; i++)
          cyl(
            i === 1 ? 0.06 : 0.09,
            2.2,
            i === 0 ? material(0xb37946, 0.75) : i === 1 ? glass : dark,
            -1.6 + i * 0.5,
            2,
            0,
          );
        tube(
          [
            [-1.6, 3.1, 0],
            [-1, 3.65, -0.4],
            [1.8, 2.4, 0],
          ],
          0.025,
          material(0xc14d40),
        );
        tube(
          [
            [-0.6, 3.1, 0],
            [0.2, 3.5, -0.7],
            [2, 2.4, 0],
          ],
          0.025,
          blue,
        );
        box(2.4, 1.8, 2.1, white, 2, 1.2, 0);
      }
      text(
        calor ? "THERMOMETER" : type === "soil" ? "pH METER" : "POTENTIOSTAT",
        2,
        1.6,
        1.08,
        1.9,
        0.35,
      );
      text(type.toUpperCase(), 2, 0.9, 1.1, 2, 0.25);
      for (let i = 0; i < 18; i++)
        particles.push(
          sphere(
            0.025,
            new T.MeshBasicMaterial({ color: 0x7cdfff }),
            -1.1,
            1,
            0,
          ),
        );
      motion = (t) =>
        particles.forEach((o, i) =>
          o.position.set(
            -1.1 + Math.sin(i * 3 + t) * 0.55,
            0.45 + ((i * 0.12 + t * 0.12) % 1.1),
            Math.cos(i * 2 + t) * 0.5,
          ),
        );
    } else {
      box(0.9, 0.12, 1.3, steel, -1.2, 0.3, -0.5);
      cyl(0.035, 3.8, steel, -1.2, 2.2, -0.5);
      rod([-1.2, 3.5, -0.5], [0, 3.5, 0], 0.03);
      cyl(0.065, 2.3, glass, 0, 2.65, 0);
      cyl(0.045, 1.5, liquid, 0, 2.9, 0);
      cyl(0.11, 0.12, blue, 0, 1.6, 0);
      flask(0, 0);
      const drop = sphere(0.045, liquid, 0, 1.4, 0);
      motion = (t) => {
        drop.position.y = 1.5 - ((t * 0.75) % 1) * 0.7;
        drop.visible = true;
      };
      text("BURETTE / REACTION FLASK", 0, 0.22, 1.3, 3, 0.22);
    }
    let visible = true,
      dirty = true,
      frame,
      last = 0,
      elapsed = 0;
    const change = () => {
      dirty = true;
    };
    controls.addEventListener("change", change);
    const resize = new ResizeObserver(() => {
      const r = node.getBoundingClientRect();
      if (r.width && r.height) {
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / r.height;
        camera.updateProjectionMatrix();
        dirty = true;
      }
    });
    resize.observe(node);
    const observer = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      dirty = true;
    });
    observer.observe(node);
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      controls.update();
      if (!visible || document.hidden || now - last < 40) return;
      const active =
        live.current.running &&
        !matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!dirty && !active) return;
      last = now;
      dirty = false;
      if (active) elapsed += 0.04;
      motion(elapsed);
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      controls.dispose();
      const geos = new Set(),
        mats = new Set();
      scene.traverse((o) => {
        if (o.geometry) geos.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material])
          if (m) mats.add(m);
      });
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      environment.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      node.replaceChildren();
    };
  }, [kind, fill]);
  return (
    <div className="lab-live-apparatus">
      <div className="lab-live-canvas" ref={host} />
      {error && <p role="status">{error}</p>}
      <div className="lab-live-tools">
        <span>Live 3D apparatus · drag to orbit · scroll to zoom</span>
        <button
          aria-label={
            animated ? "Pause apparatus animation" : "Animate apparatus"
          }
          aria-pressed={animated}
          onClick={() => setAnimated((v) => !v)}
        >
          {animated ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <button
          aria-label="Reset apparatus camera"
          onClick={() => api.current?.reset()}
        >
          <RotateCcw size={15} />
        </button>
        <button
          aria-label="Fullscreen apparatus"
          onClick={() => host.current?.parentElement.requestFullscreen?.()}
        >
          <Maximize2 size={15} />
        </button>
      </div>
    </div>
  );
}
