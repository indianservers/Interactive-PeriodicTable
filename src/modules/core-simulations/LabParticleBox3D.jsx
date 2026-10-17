import { useEffect, useRef } from "react";
import * as T from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { seededParticles } from "./molecularDynamicsModel.js";
export default function LabParticleBox3D({
  count = 256,
  seed = 8675309,
  running = false,
  vectors = true,
  phase = "liquid",
}) {
  const host = useRef(),
    live = useRef(running);
  live.current = running;
  useEffect(() => {
    const node = host.current;
    let renderer;
    try {
      renderer = new T.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      node.textContent = "WebGL unavailable";
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.setClearColor(0x03111b, 0);
    renderer.domElement.setAttribute(
      "aria-label",
      `${count} argon atoms in an interactive periodic-box illustration`,
    );
    renderer.domElement.tabIndex = 0;
    node.appendChild(renderer.domElement);
    const scene = new T.Scene(),
      camera = new T.PerspectiveCamera(38, 1, 0.1, 40);
    camera.position.set(5, 3.2, 7);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    scene.add(new T.HemisphereLight(0xccedff, 0x0b2241, 2.6));
    const light = new T.DirectionalLight(0xffffff, 3);
    light.position.set(3, 5, 3);
    scene.add(light);
    const geo = new T.SphereGeometry(0.065, 16, 12),
      mat = new T.MeshPhysicalMaterial({
        color: 0x218df5,
        roughness: 0.18,
        metalness: 0.1,
        clearcoat: 1,
      }),
      n = Math.max(1, Math.min(4000, Math.round(count) || 256)),
      atoms = new T.InstancedMesh(geo, mat, n),
      dummy = new T.Object3D();
    scene.add(atoms);
    const boxGeometry = new T.BoxGeometry(4.4, 3.6, 3.6),
      boundary = new T.LineSegments(
        new T.EdgesGeometry(boxGeometry),
        new T.LineBasicMaterial({
          color: 0x479dda,
          transparent: true,
          opacity: 0.65,
        }),
      );
    scene.add(boundary);
    const glass = new T.Mesh(
      boxGeometry,
      new T.MeshPhysicalMaterial({
        color: 0x369bdf,
        transparent: true,
        opacity: 0.035,
        side: T.DoubleSide,
        depthWrite: false,
      }),
    );
    scene.add(glass);
    const points = seededParticles(n, seed),
      arrows = [];
    if (vectors)
      for (let i = 0; i < Math.min(40, n); i++) {
        const p = points[i],
          a = new T.ArrowHelper(
            new T.Vector3(p.vx, p.vy, p.z - 0.5).normalize(),
            new T.Vector3(),
            0.28,
            0xffd166,
            0.08,
            0.04,
          );
        scene.add(a);
        arrows.push(a);
      }
    let t = 0,
      last = 0,
      frame,
      dirty = true,
      visible = true;
    const place = () => {
      points.forEach((p, i) => {
        const x = (p.x - 50) / 23,
          y = (p.y - 50) / 26,
          z = (p.z - 0.5) * 3.2;
        const solid = phase.includes("solid");
        const v = solid ? 0.025 : 0.25;
        dummy.position.set(
          x + Math.sin(t + p.id) * v,
          y + Math.cos(t * 0.8 + p.id) * v,
          z + Math.sin(t * 0.9 + p.id) * v,
        );
        dummy.updateMatrix();
        atoms.setMatrixAt(i, dummy.matrix);
        if (arrows[i]) arrows[i].position.copy(dummy.position);
      });
      atoms.instanceMatrix.needsUpdate = true;
    };
    place();
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
    const observer = new IntersectionObserver((e) => {
      visible = e[0]?.isIntersecting ?? true;
      dirty = true;
    });
    observer.observe(node);
    controls.addEventListener("change", () => {
      dirty = true;
    });
    const draw = (now) => {
      frame = requestAnimationFrame(draw);
      controls.update();
      if (!visible || document.hidden || now - last < 40) return;
      const active =
        live.current && !matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!dirty && !active) return;
      last = now;
      dirty = false;
      if (active) {
        t += 0.04;
        place();
      }
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      observer.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      renderer.dispose();
      renderer.forceContextLoss();
      node.replaceChildren();
    };
  }, [count, seed, vectors, phase]);
  return (
    <div
      ref={host}
      className="md-particles md-particles-webgl"
      data-running={running}
    />
  );
}
