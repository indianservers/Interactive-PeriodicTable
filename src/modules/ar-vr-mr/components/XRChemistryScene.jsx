import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

const atomLabelCanvas = (text, color) => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(28, 26, 200, 72, 24);
  } else {
    ctx.rect(28, 26, 200, 72);
  }
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 38px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);
  return canvas;
};

const disposeObject = (object) => {
  object.traverse(child => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(material => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
    }
  });
};

const buildBond = (from, to, color = 0xcbd5e1) => {
  const start = new THREE.Vector3(...from.position);
  const end = new THREE.Vector3(...to.position);
  const direction = new THREE.Vector3().subVectors(end, start);
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const geometry = new THREE.CylinderGeometry(0.035, 0.035, Math.max(direction.length(), 0.001), 18);
  const material = new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.1 });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  mesh.userData.isExperienceObject = true;
  return mesh;
};

const buildSpriteLabel = (text, color, position, scale = [0.34, 0.17, 1]) => {
  const labelTexture = new THREE.CanvasTexture(atomLabelCanvas(text, color));
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTexture, transparent: true, depthWrite: false }));
  label.position.set(...position);
  label.scale.set(...scale);
  label.userData.isExperienceObject = true;
  return label;
};

const addArrow = (group, from, to, color = 0x22d3ee, label = '') => {
  const start = new THREE.Vector3(...from);
  const end = new THREE.Vector3(...to);
  const direction = new THREE.Vector3().subVectors(end, start);
  const arrow = new THREE.ArrowHelper(direction.clone().normalize(), start, direction.length(), color, 0.18, 0.08);
  arrow.userData.isExperienceObject = true;
  group.add(arrow);
  if (label) {
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    group.add(buildSpriteLabel(label, `#${color.toString(16).padStart(6, '0')}`, [mid.x, mid.y + 0.18, mid.z], [0.4, 0.18, 1]));
  }
};

const addPulseSphere = (group, position, radius, color, opacity = 0.2) => {
  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 36, 18),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe: true })
  );
  pulse.position.set(...position);
  pulse.userData.isExperienceObject = true;
  group.add(pulse);
};

const addDashedLine = (group, from, to, color = 0x60a5fa, opacity = 0.75) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(...from),
    new THREE.Vector3(...to),
  ]);
  const material = new THREE.LineDashedMaterial({ color, dashSize: 0.08, gapSize: 0.05, transparent: true, opacity });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  line.userData.isExperienceObject = true;
  group.add(line);
};

const addEffectPrimitives = (group, experience, stage, simulation = {}, arPlacement = {}) => {
  const primary = Number(simulation.primary ?? 58);
  const secondary = Number(simulation.secondary ?? 44);
  const tertiary = Number(simulation.tertiary ?? 62);
  const overlayDensity = Number(arPlacement.overlayDensity ?? 70) / 100;

  if (experience.effects?.includes('pi-cloud')) {
    [-0.18, 0.18].forEach(offset => {
      const cloud = new THREE.Mesh(
        new THREE.TorusGeometry(0.88 + primary * 0.0015, 0.045 + secondary * 0.00025, 16, 96),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: (0.32 + primary * 0.003) * overlayDensity })
      );
      cloud.position.z = offset;
      cloud.userData.isExperienceObject = true;
      group.add(cloud);
    });
  }

  if (experience.effects?.includes('orbitals') || experience.effects?.includes('orbital-lobes')) {
    const shellMaterial = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.28, wireframe: true });
    [0.62, 1.02, 1.38].slice(0, stage + 1).forEach(radius => {
      const shell = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), shellMaterial.clone());
      shell.userData.isExperienceObject = true;
      group.add(shell);
    });
  }

  if (experience.effects?.includes('angle-arcs')) {
    const curve = new THREE.EllipseCurve(0, 0, 0.58, 0.58, 0.15, 1.55 + primary * 0.008);
    const points = curve.getPoints(36).map(point => new THREE.Vector3(point.x, point.y, 0.04));
    const arc = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      new THREE.LineBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.9 * overlayDensity })
    );
    arc.userData.isExperienceObject = true;
    group.add(arc);
    addArrow(group, [0, 0.1, -0.78], [0, 0.1 + primary * 0.006, -1.2], 0xf59e0b, stage > 0 ? 'LP push' : '');
  }

  if (experience.effects?.includes('electron-flow') || experience.effects?.includes('electron-stream')) {
    const endX = -1.05 + (1.6 * primary) / 100;
    addArrow(group, [-1.05, 0.28, 0.12], [endX, 0.28, 0.12], 0x22c55e, stage > 0 ? 'e- flow' : '');
    if (experience.sceneType === 'electrochem') {
      Array.from({ length: 5 }).forEach((_, index) => {
        const t = ((primary / 100) + index * 0.17) % 1;
        const particle = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 18, 18),
          new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55 + secondary * 0.003 })
        );
        particle.position.set(-0.95 + t * 1.9, 0.47 + Math.sin(t * Math.PI) * 0.12, 0.16);
        particle.userData.isExperienceObject = true;
        group.add(particle);
      });
    }
  }

  if (experience.effects?.includes('proton-hop')) {
    addArrow(group, [-0.2, 0.32, 0.1], [0.55, 0.32, 0.1], 0xf8fafc, 'H+');
  }

  if (experience.effects?.includes('unit-cell') || experience.effects?.includes('volume-box')) {
    const squeeze = experience.effects?.includes('volume-box') ? 1 - primary * 0.003 : 1;
    const box = new THREE.Box3(new THREE.Vector3(-1.55 * squeeze, -0.85, -0.85), new THREE.Vector3(1.55 * squeeze, 0.95, 0.85));
    const helper = new THREE.Box3Helper(box, experience.effects?.includes('volume-box') ? 0x60a5fa : 0xf59e0b);
    helper.userData.isExperienceObject = true;
    group.add(helper);
  }

  if (experience.effects?.includes('binding-pocket')) {
    const pocket = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.58, 0.035, 80, 8),
      new THREE.MeshBasicMaterial({ color: 0x64748b, transparent: true, opacity: 0.36, wireframe: true })
    );
    pocket.position.set(-0.45, 0.02, -0.08);
    pocket.userData.isExperienceObject = true;
    group.add(pocket);
    addDashedLine(group, [0.2, 0, 0], [0.62, 0.22, 0], 0x38bdf8, 0.35 + secondary * 0.005);
    addPulseSphere(group, [0.18, 0.02, 0], 0.26 + primary * 0.002, 0x22c55e, 0.14);
  }

  if (experience.effects?.includes('emission-lines')) {
    ['#ef4444', '#facc15', '#a78bfa'].forEach((color, index) => {
      const line = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.75 - index * 0.1, 0.02),
        new THREE.MeshBasicMaterial({ color })
      );
      line.position.set(-0.55 + index * 0.55, 0.72, 0);
      line.userData.isExperienceObject = true;
      group.add(line);
    });
  }

  if (experience.effects?.includes('trend-glow')) {
    experience.atoms.forEach((item, index) => {
      addPulseSphere(group, item.position, item.radius + 0.12 + index * 0.03 + primary * 0.001, item.color, (0.12 + secondary * 0.002) * overlayDensity);
    });
    addArrow(group, [-1.05, 0.52, 0], [1.15, 0.52, 0], 0xf59e0b, 'radius trend');
  }

  if (experience.effects?.includes('salt-bridge')) {
    addDashedLine(group, [-0.45, -0.35, 0.12], [0.45, -0.35, 0.12], 0xa78bfa, 0.35 + secondary * 0.005);
  }

  if (experience.effects?.includes('hbond-score')) {
    addSpriteMetric(group, `fit ${Math.round((primary * 0.55 + secondary * 0.35 - tertiary * 0.18))}`, [0.18, 0.72, 0.05], '#22c55e');
  }

  if (experience.effects?.includes('vacancy-highlight')) {
    const vacancy = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.26, 40),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide, transparent: true, opacity: 0.78 })
    );
    vacancy.position.set(-0.36, 0.04, -0.39);
    vacancy.userData.isExperienceObject = true;
    group.add(vacancy);
  }
};

const addSpriteMetric = (group, text, position, color) => {
  group.add(buildSpriteLabel(text, color, position, [0.56, 0.2, 1]));
};

const buildExperienceGroup = ({ experience, mode, scale, showLabels, selectedId, stage, simulation, arPlacement }) => {
  const group = new THREE.Group();
  group.userData.isExperienceObject = true;
  const arScale = mode === 'vr' ? 1 : Number(arPlacement?.surfaceScale ?? 1);
  const arHeight = mode === 'vr' ? 0 : Number(arPlacement?.height ?? 0.2);
  group.position.set(0, mode === 'vr' ? 1.45 : 0.52 + arHeight, -2.25);
  group.rotation.y = THREE.MathUtils.degToRad(Number(arPlacement?.rotationY ?? 0));
  group.scale.setScalar((mode === 'vr' ? 1.2 : 0.86) * scale * arScale);

  const atomMap = Object.fromEntries(experience.atoms.map(item => [item.id, item]));
  experience.bonds.forEach(([fromId, toId]) => {
    const from = atomMap[fromId];
    const to = atomMap[toId];
    if (from && to) group.add(buildBond(from, to, experience.sceneType === 'docking' ? 0x60a5fa : 0xcbd5e1));
  });

  experience.atoms.forEach(item => {
    const highlighted = selectedId === item.id;
    const geometry = new THREE.SphereGeometry(item.radius * (highlighted ? 1.18 : 1), 40, 40);
    const material = new THREE.MeshStandardMaterial({
      color: item.color,
      roughness: 0.2,
      metalness: 0.12,
      emissive: item.color,
      emissiveIntensity: highlighted ? 0.42 : 0.12,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(...item.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { isExperienceObject: true, selectable: true, atom: item };
    group.add(mesh);

    if (highlighted) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(item.radius + 0.05, item.radius + 0.09, 40),
        new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.8 })
      );
      ring.position.copy(mesh.position);
      ring.userData.isExperienceObject = true;
      group.add(ring);
    }

    if (showLabels) {
      group.add(buildSpriteLabel(item.element, item.color, [
        item.position[0],
        item.position[1] + item.radius + 0.16,
        item.position[2],
      ]));
    }
  });

  addEffectPrimitives(group, experience, stage, simulation, arPlacement);
  return group;
};

export const XRChemistryScene = ({
  experience,
  mode,
  reducedMotion = false,
  scale = 1,
  showLabels = true,
  autoRotate = true,
  stage = 1,
  selectedId = null,
  simulation,
  arPlacement,
  onARPlacementChange,
  onSelectObject,
}) => {
  const mountRef = useRef(null);
  const buttonsRef = useRef(null);
  const sceneRef = useRef(null);
  const groupRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const reticleRef = useRef(null);
  const hitTestSourceRef = useRef(null);
  const hitTestSourceRequestedRef = useRef(false);
  const controllerRef = useRef(null);
  const xrReferenceSpaceRef = useRef(null);
  const latestPlacementRef = useRef(arPlacement || {});
  const raycasterRef = useRef(new THREE.Raycaster());
  const pointerRef = useRef(new THREE.Vector2());
  const desktopPlaneRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));
  const fallbackPlacementRef = useRef(new THREE.Vector3(0, 0.52, -2.25));

  const sessionMode = useMemo(() => (mode === 'vr' ? 'vr' : 'ar'), [mode]);
  const placementStatus = arPlacement?.status || 'desktop-preview';
  const isPlacedStatus = (status) => status === 'placed' || status === 'locked';
  const placementNumbers = (placement = latestPlacementRef.current || {}) => ({
    scaleValue: Number(placement.surfaceScale ?? 1),
    heightValue: Number(placement.height ?? 0.2),
    rotationValue: THREE.MathUtils.degToRad(Number(placement.rotationY ?? 0)),
  });

  useEffect(() => {
    latestPlacementRef.current = arPlacement || {};
  }, [arPlacement]);

  const emitPlacementStatus = (status, patch = {}) => {
    const current = latestPlacementRef.current || {};
    const hasChanged = current.status !== status || Object.entries(patch).some(([key, value]) => current[key] !== value);
    if (!hasChanged) return;
    latestPlacementRef.current = { ...current, status, ...patch };
    onARPlacementChange?.({ status, ...patch });
  };

  const applyPlacementControls = (group = groupRef.current) => {
    if (!group) return;
    const currentPlacement = latestPlacementRef.current || {};
    const { scaleValue, heightValue, rotationValue } = placementNumbers(currentPlacement);
    const sceneScale = (mode === 'vr' ? 1.2 : 0.86) * scale * scaleValue;
    if (!rendererRef.current?.xr.isPresenting || mode === 'vr') {
      group.matrixAutoUpdate = true;
      const desktopPosition = Array.isArray(currentPlacement.desktopPosition)
        ? new THREE.Vector3(...currentPlacement.desktopPosition)
        : fallbackPlacementRef.current;
      fallbackPlacementRef.current.copy(desktopPosition);
      group.position.set(desktopPosition.x, 0.52 + heightValue, desktopPosition.z);
      group.quaternion.identity();
      group.rotation.y = rotationValue;
      group.scale.setScalar(sceneScale);
      group.visible = true;
      group.updateMatrix();
    } else if (!isPlacedStatus(currentPlacement.status)) {
      group.visible = false;
    } else {
      group.visible = true;
      group.matrixAutoUpdate = true;
      const basePosition = Array.isArray(currentPlacement.placedPosition)
        ? new THREE.Vector3(...currentPlacement.placedPosition)
        : group.userData.baseARPosition;
      if (basePosition) group.position.set(basePosition.x, basePosition.y + heightValue, basePosition.z);
      if (Array.isArray(currentPlacement.placedQuaternion)) {
        group.quaternion.fromArray(currentPlacement.placedQuaternion);
      }
      group.rotateY(rotationValue);
      group.scale.setScalar(sceneScale);
      group.updateMatrix();
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    const buttonContainer = buttonsRef.current;
    if (!container || !buttonContainer) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(mode === 'vr' ? 0x020617 : 0x06121f);
    scene.fog = new THREE.Fog(0x020617, 10, 34);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, container.clientWidth / 540, 0.05, 100);
    camera.position.set(0, 1.45, 3.65);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: mode !== 'vr', preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, 540);
    renderer.shadowMap.enabled = true;
    renderer.xr.enabled = true;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.55, -1.15);
    controls.enableDamping = true;
    controls.autoRotate = autoRotate && !reducedMotion;
    controls.autoRotateSpeed = 0.75;
    controlsRef.current = controls;

    scene.add(new THREE.HemisphereLight(0xdbeafe, 0x172554, arPlacement?.lightingBoost ? 1.45 : 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 5, 4);
    key.castShadow = true;
    scene.add(key);

    const grid = new THREE.GridHelper(5, 10, 0x38bdf8, 0x1e293b);
    grid.material.transparent = true;
    grid.material.opacity = mode === 'vr' ? 0.34 : arPlacement?.showOcclusionPlane === false ? 0.08 : 0.22;
    scene.add(grid);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 8),
      new THREE.ShadowMaterial({ opacity: 0.18 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const reticle = new THREE.Mesh(
      new THREE.RingGeometry(0.22, 0.26, 48).rotateX(-Math.PI / 2),
      new THREE.MeshBasicMaterial({ color: arPlacement?.anchorLocked ? 0x22c55e : 0x22d3ee, transparent: true, opacity: mode === 'vr' || arPlacement?.showReticle === false ? 0 : 0.55 })
    );
    reticle.position.set(0, 0.01, -2.2);
    reticle.matrixAutoUpdate = false;
    reticle.visible = mode !== 'vr' && arPlacement?.showReticle !== false;
    reticleRef.current = reticle;
    scene.add(reticle);

    const placeAtReticle = () => {
      const group = groupRef.current;
      const currentPlacement = latestPlacementRef.current || {};
      const currentAnchorLocked = currentPlacement.anchorLocked !== false;
      if (!group || !reticle.visible || (currentAnchorLocked && currentPlacement.status === 'locked')) return;
      const { scaleValue, heightValue, rotationValue } = placementNumbers(currentPlacement);
      const basePosition = new THREE.Vector3();
      const baseQuaternion = new THREE.Quaternion();
      const baseScale = new THREE.Vector3();
      reticle.matrix.decompose(basePosition, baseQuaternion, baseScale);
      group.visible = true;
      group.matrixAutoUpdate = true;
      group.userData.baseARPosition = basePosition.clone();
      group.position.set(basePosition.x, basePosition.y + heightValue, basePosition.z);
      group.quaternion.copy(baseQuaternion);
      group.rotateY(rotationValue);
      group.scale.setScalar((mode === 'vr' ? 1.2 : 0.86) * scale * scaleValue);
      group.updateMatrix();
      emitPlacementStatus(currentAnchorLocked ? 'locked' : 'placed', {
        placedAt: new Date().toISOString(),
        placedPosition: basePosition.toArray(),
        placedQuaternion: baseQuaternion.toArray(),
        statusDetail: currentAnchorLocked ? 'Placed and locked on selected AR/MR surface point.' : 'Placed on selected AR/MR surface point.',
      });
    };

    const controller = renderer.xr.getController(0);
    controller.addEventListener('select', placeAtReticle);
    controllerRef.current = controller;
    scene.add(controller);

    renderer.xr.addEventListener('sessionstart', async () => {
      if (mode === 'vr') return;
      hitTestSourceRequestedRef.current = false;
      hitTestSourceRef.current = null;
      emitPlacementStatus('scanning');
      const session = renderer.xr.getSession();
      try {
        const viewerSpace = await session.requestReferenceSpace('viewer');
        xrReferenceSpaceRef.current = await session.requestReferenceSpace('local');
        hitTestSourceRef.current = await session.requestHitTestSource({ space: viewerSpace });
        hitTestSourceRequestedRef.current = true;
      } catch {
        emitPlacementStatus('scanning', { statusDetail: 'Hit-test unavailable in this browser session' });
      }
      session.addEventListener('end', () => {
        hitTestSourceRequestedRef.current = false;
        hitTestSourceRef.current = null;
        xrReferenceSpaceRef.current = null;
        emitPlacementStatus('desktop-preview');
      }, { once: true });
    });

    const button = sessionMode === 'vr'
      ? VRButton.createButton(renderer)
      : ARButton.createButton(renderer, {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['local-floor', 'dom-overlay'],
          domOverlay: { root: document.body },
        });
    button.className = `${button.className || ''} xr-webxr-button`;
    buttonContainer.appendChild(button);

    const onResize = () => {
      const width = container.clientWidth;
      camera.aspect = width / 540;
      camera.updateProjectionMatrix();
      renderer.setSize(width, 540);
    };
    window.addEventListener('resize', onResize);

    renderer.setAnimationLoop((time, frame) => {
      controls.update();
      if (groupRef.current && autoRotate && !reducedMotion) {
        groupRef.current.rotation.y += mode === 'vr' ? 0.0026 : 0.0015;
      }
      const reticleMesh = reticleRef.current;
      if (frame && reticleMesh && mode !== 'vr') {
        const currentPlacement = latestPlacementRef.current || {};
        const currentAnchorLocked = currentPlacement.anchorLocked !== false;
        const currentPlaced = isPlacedStatus(currentPlacement.status);
        const referenceSpace = xrReferenceSpaceRef.current || renderer.xr.getReferenceSpace();
        const source = hitTestSourceRef.current;
        const hitTestResults = source && referenceSpace ? frame.getHitTestResults(source) : [];
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(referenceSpace);
          reticleMesh.visible = currentPlacement.showReticle !== false && !(currentAnchorLocked && currentPlacement.status === 'locked');
          reticleMesh.matrix.fromArray(pose.transform.matrix);
          if (!currentPlaced) emitPlacementStatus('surface-found');
        } else {
          reticleMesh.visible = false;
          if (!currentPlaced && hitTestSourceRequestedRef.current) emitPlacementStatus('scanning');
        }
      }
      renderer.render(scene, camera);
    });

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      controller.removeEventListener('select', placeAtReticle);
      button.remove();
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, [mode, reducedMotion, sessionMode, arPlacement?.lightingBoost, arPlacement?.showOcclusionPlane, arPlacement?.showReticle]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRotate && !reducedMotion;
  }, [autoRotate, reducedMotion]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (groupRef.current) {
      scene.remove(groupRef.current);
      disposeObject(groupRef.current);
    }
    const group = buildExperienceGroup({ experience, mode, scale, showLabels, selectedId, stage, simulation, arPlacement });
    groupRef.current = group;
    scene.add(group);
    applyPlacementControls(group);
  }, [experience, mode, scale, showLabels, selectedId, stage, simulation, arPlacement?.overlayDensity]);

  useEffect(() => {
    applyPlacementControls();
  }, [scale, arPlacement?.surfaceScale, arPlacement?.height, arPlacement?.rotationY, arPlacement?.desktopPosition, arPlacement?.placedPosition, arPlacement?.placedQuaternion, mode, placementStatus]);

  const handlePointerDown = (event) => {
    const container = mountRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    if (!container || !camera || !scene) return;

    const rect = container.getBoundingClientRect();
    pointerRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(pointerRef.current, camera);

    const selectable = [];
    scene.traverse(child => {
      if (child.userData?.selectable) selectable.push(child);
    });
    const hit = raycasterRef.current.intersectObjects(selectable, false)[0];
    const currentPlacement = latestPlacementRef.current || {};
    const placementMode = currentPlacement.placementMode !== false;
    const currentAnchorLocked = currentPlacement.anchorLocked !== false;

    if (!placementMode && hit?.object?.userData?.atom) {
      onSelectObject?.(hit.object.userData.atom);
      return;
    }

    onSelectObject?.(null);
    if (mode === 'vr' || rendererRef.current?.xr.isPresenting) return;
    if (currentAnchorLocked && currentPlacement.status === 'locked') {
      if (hit?.object?.userData?.atom) onSelectObject?.(hit.object.userData.atom);
      return;
    }

    const placementPoint = new THREE.Vector3();
    const hasPlacementPoint = raycasterRef.current.ray.intersectPlane(desktopPlaneRef.current, placementPoint) || (hit?.point && placementPoint.copy(hit.point));
    if (hasPlacementPoint) {
      const { scaleValue, heightValue, rotationValue } = placementNumbers(currentPlacement);
      fallbackPlacementRef.current.copy(placementPoint);
      if (groupRef.current) {
        groupRef.current.visible = true;
        groupRef.current.matrixAutoUpdate = true;
        groupRef.current.position.set(placementPoint.x, 0.52 + heightValue, placementPoint.z);
        groupRef.current.quaternion.identity();
        groupRef.current.rotation.y = rotationValue;
        groupRef.current.scale.setScalar((mode === 'vr' ? 1.2 : 0.86) * scale * scaleValue);
        groupRef.current.updateMatrix();
      }
      emitPlacementStatus(currentAnchorLocked ? 'locked' : 'placed', {
        placedAt: new Date().toISOString(),
        desktopPosition: placementPoint.toArray(),
        statusDetail: currentAnchorLocked ? 'Desktop placement locked at selected point.' : 'Desktop placement moved to selected point.',
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">WebXR Scene Base</p>
          <h3 className="mt-1 text-xl font-black text-white">{experience.title}</h3>
        </div>
        <div ref={buttonsRef} className="flex min-h-10 items-center gap-2" />
      </div>
      <div
        ref={mountRef}
        onPointerDown={handlePointerDown}
        className="h-[540px] touch-none overflow-hidden rounded-2xl border border-white/10 bg-slate-950"
        aria-label={`${experience.title} ${mode.toUpperCase()} preview`}
      />
    </div>
  );
};

export default XRChemistryScene;
