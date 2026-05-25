import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { BookOpen, Boxes, Camera, Eye, EyeOff, Info, ListFilter, Maximize2, Pause, Play, RotateCcw, Search, Sparkles } from 'lucide-react';
import { MOLECULE_LIBRARY, ALL_MOLECULES } from '../../data/molecules.js';

/* --- Build Three.js scene --------------------------------------------------- */
function buildScene(scene, molecule, viewMode, showLabels, highlightId) {
  const toRemove = [];
  scene.traverse(obj => { if (obj.userData.isMoleculeObject) toRemove.push(obj); });
  toRemove.forEach(obj => scene.remove(obj));

  const atomMap = {};
  molecule.atoms.forEach(a => { atomMap[a.id] = a; });

  molecule.atoms.forEach(atom => {
    const r = atom.radius * (viewMode === 'space-fill' ? 2.2 : 1.0);
    const geo = new THREE.SphereGeometry(r, 36, 36);
    const isHighlighted = atom.id === highlightId;
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(atom.color || '#aaaaaa'),
      roughness: viewMode === 'wireframe' ? 1 : 0.22,
      metalness: viewMode === 'wireframe' ? 0 : 0.18,
      emissive: new THREE.Color(atom.color || '#aaaaaa'),
      emissiveIntensity: isHighlighted ? 0.45 : 0.07,
      wireframe: viewMode === 'wireframe',
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(...atom.position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.isMoleculeObject = true;
    mesh.userData.atomId = atom.id;
    mesh.userData.atom = atom;
    scene.add(mesh);
    atom._mesh = mesh;

    if (isHighlighted) {
      const ringGeo = new THREE.RingGeometry(r + 0.12, r + 0.22, 48);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.7 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(...atom.position);
      ring.userData.isMoleculeObject = true;
      scene.add(ring);
      const glowGeo = new THREE.RingGeometry(r + 0.22, r + 0.45, 48);
      const glowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(atom.color), side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
      const glow = new THREE.Mesh(glowGeo, glowMat);
      glow.position.set(...atom.position);
      glow.userData.isMoleculeObject = true;
      scene.add(glow);
    }

    if (atom.charge && showLabels) {
      const div = document.createElement('div');
      div.textContent = atom.charge;
      div.style.cssText = `font-size:10px;font-weight:900;color:#fff;
        background:${atom.charge === '+' ? 'rgba(239,68,68,0.9)' : 'rgba(59,130,246,0.9)'};
        border-radius:50%;width:16px;height:16px;
        display:flex;align-items:center;justify-content:center;
        pointer-events:none;user-select:none;
        box-shadow:0 0 6px ${atom.charge === '+' ? 'rgba(239,68,68,0.6)' : 'rgba(59,130,246,0.6)'};`;
      const cl = new CSS2DObject(div);
      cl.position.set(r * 0.7, r * 0.7, 0);
      cl.userData = { isCSS2D: true };
      mesh.add(cl);
    }
  });

  if (viewMode !== 'space-fill') {
    molecule.bonds.forEach(bond => {
      const atomA = atomMap[bond.from];
      const atomB = atomMap[bond.to];
      if (!atomA || !atomB) return;
      const pA = new THREE.Vector3(...atomA.position);
      const pB = new THREE.Vector3(...atomB.position);
      const dir = new THREE.Vector3().subVectors(pB, pA);
      const length = dir.length();
      const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

      if (bond.type === 'covalent') {
        const order = bond.order || 1;
        const n = dir.clone().normalize();
        const mat = new THREE.MeshStandardMaterial({
          color: 0x94a3b8, roughness: 0.35, metalness: 0.15,
          wireframe: viewMode === 'wireframe',
        });
        if (order === 1) {
          const geo = new THREE.CylinderGeometry(0.11, 0.11, length, 16);
          const cyl = new THREE.Mesh(geo, mat);
          cyl.position.copy(mid);
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
          cyl.castShadow = true;
          cyl.userData.isMoleculeObject = true;
          scene.add(cyl);
        } else {
          const ref = Math.abs(n.y) < 0.9 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
          const perp = new THREE.Vector3().crossVectors(n, ref).normalize();
          const spread = order === 2 ? 0.07 : 0.10;
          const radius = order === 2 ? 0.075 : 0.065;
          const offsets = order === 2
            ? [perp.clone().multiplyScalar(spread), perp.clone().multiplyScalar(-spread)]
            : [new THREE.Vector3(), perp.clone().multiplyScalar(spread), perp.clone().multiplyScalar(-spread)];
          offsets.forEach(offset => {
            const geo = new THREE.CylinderGeometry(radius, radius, length, 16);
            const cyl = new THREE.Mesh(geo, mat.clone());
            cyl.position.copy(mid.clone().add(offset));
            cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
            cyl.castShadow = true;
            cyl.userData.isMoleculeObject = true;
            scene.add(cyl);
          });
        }
      } else if (bond.type === 'ionic-dashed') {
        for (let i = 0; i < 10; i++) {
          if (i % 2 !== 0) continue;
          const t0 = i / 10, t1 = (i + 0.8) / 10;
          const sA = new THREE.Vector3().lerpVectors(pA, pB, t0);
          const sB2 = new THREE.Vector3().lerpVectors(pA, pB, t1);
          const sDir = new THREE.Vector3().subVectors(sB2, sA);
          const sMid = new THREE.Vector3().addVectors(sA, sB2).multiplyScalar(0.5);
          const sGeo = new THREE.CylinderGeometry(0.07, 0.07, sDir.length(), 8);
          const sMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.2, transparent: true, opacity: 0.82 });
          const seg = new THREE.Mesh(sGeo, sMat);
          seg.position.copy(sMid);
          seg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sDir.clone().normalize());
          seg.userData.isMoleculeObject = true;
          scene.add(seg);
        }
      }
      bond._mid = mid;
    });
  }

  if (showLabels && molecule.labels) {
    molecule.labels.forEach(lbl => {
      const div = document.createElement('div');
      div.textContent = lbl.text;
      div.style.cssText = `background:rgba(10,15,30,0.9);color:#e2e8f0;
        font-size:11px;font-family:Inter,sans-serif;
        padding:3px 9px;border-radius:20px;
        border:1px solid rgba(255,255,255,0.14);
        white-space:nowrap;pointer-events:none;user-select:none;
        backdrop-filter:blur(8px);box-shadow:0 2px 12px rgba(0,0,0,0.4);
        letter-spacing:0.01em;`;
      const css = new CSS2DObject(div);
      css.userData.isMoleculeObject = true;
      if (lbl.target) {
        const a = atomMap[lbl.target];
        if (a) css.position.set(a.position[0], a.position[1] + a.radius + 0.7, a.position[2]);
      } else if (lbl.targetBond) {
        const b = molecule.bonds.find(b =>
          (b.from === lbl.targetBond[0] && b.to === lbl.targetBond[1]) ||
          (b.from === lbl.targetBond[1] && b.to === lbl.targetBond[0])
        );
        if (b?._mid) { css.position.copy(b._mid); css.position.y += 0.6; }
      }
      scene.add(css);
    });
  }
}

function fitCameraToMolecule(camera, controls, molecule) {
  const positions = molecule.atoms.map(a => new THREE.Vector3(...a.position));
  const box = new THREE.Box3().setFromPoints(positions);
  const size = box.getSize(new THREE.Vector3()).length();
  const center = box.getCenter(new THREE.Vector3());
  const dist = Math.max(size * 1.5, 4);
  camera.position.set(center.x, center.y + dist * 0.4, center.z + dist);
  controls.target.copy(center);
  controls.update();
}

/* --- helpers ----------------------------------------------------------------- */
const CAT_NAMES = Object.keys(MOLECULE_LIBRARY);
const LIBRARY_STATS = CAT_NAMES.reduce((acc, catName) => {
  const cat = MOLECULE_LIBRARY[catName];
  const subCount = Object.keys(cat.subcategories).length;
  const viewCount = Object.values(cat.subcategories).reduce((sum, sub) => sum + sub.molecules.length, 0);
  return {
    categories: acc.categories + 1,
    subcategories: acc.subcategories + subCount,
    moleculeViews: acc.moleculeViews + viewCount,
  };
}, { categories: 0, subcategories: 0, moleculeViews: 0 });

function findMolLocation(molName) {
  for (const [cName, cat] of Object.entries(MOLECULE_LIBRARY)) {
    for (const [sName, sub] of Object.entries(cat.subcategories)) {
      if (sub.molecules.some(x => x.name === molName)) return { cName, sName };
    }
  }
  return null;
}

const MoleculeThumb = ({ molecule }) => {
  const atoms = molecule.atoms.slice(0, 18);
  const xs = atoms.map(atom => atom.position[0]);
  const ys = atoms.map(atom => atom.position[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const project = atom => {
    const x = 12 + ((atom.position[0] - minX) / Math.max(0.1, maxX - minX)) * 76;
    const y = 14 + ((atom.position[1] - minY) / Math.max(0.1, maxY - minY)) * 48;
    return [Number.isFinite(x) ? x : 50, Number.isFinite(y) ? 72 - y : 36];
  };
  return (
    <svg viewBox="0 0 100 72" className="w-full h-16 rounded-lg bg-black/20 border border-white/10">
      {molecule.bonds.slice(0, 18).map((bond, index) => {
        const a = atoms.find(atom => atom.id === bond.from);
        const b = atoms.find(atom => atom.id === bond.to);
        if (!a || !b) return null;
        const [x1, y1] = project(a);
        const [x2, y2] = project(b);
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2" strokeLinecap="round" />;
      })}
      {atoms.map(atom => {
        const [x, y] = project(atom);
        return (
          <g key={atom.id}>
            <circle cx={x} cy={y} r="5" fill={atom.color || '#94a3b8'} />
            <text x={x} y={y + 2.5} textAnchor="middle" fontSize="5" fontWeight="700" fill="#020617">{atom.element}</text>
          </g>
        );
      })}
    </svg>
  );
};

/* --- Component -------------------------------------------------------------- */
export const MoleculeScene = ({ height = 520 }) => {
  const mountRef     = useRef(null);
  const rendererRef  = useRef(null);
  const labelRenRef  = useRef(null);
  const cameraRef    = useRef(null);
  const sceneRef     = useRef(null);
  const controlsRef  = useRef(null);
  const rafRef       = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef     = useRef(new THREE.Vector2());

  // -- Category / subcategory navigation --------------------------------------
  const [selectedCat, setSelectedCat] = useState(() => CAT_NAMES[1]); // Inorganic Chemistry
  const [selectedSub, setSelectedSub] = useState('Oxides & Water');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDrop, setShowSearchDrop] = useState(false);
  const [cardDensity, setCardDensity] = useState('compact');

  // -- 3D state ----------------------------------------------------------------
  const [mol, setMol] = useState(() => {
    const cat = MOLECULE_LIBRARY[CAT_NAMES[1]];
    return cat?.subcategories['Oxides & Water']?.molecules[0] || ALL_MOLECULES[0];
  });
  const [viewMode, setViewMode]     = useState('ball-stick');
  const [autoRot, setAutoRot]       = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [highlightId, setHighlightId] = useState(null);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [showPanel, setShowPanel]   = useState(true);

  // -- Derived navigation ------------------------------------------------------
  const catData  = MOLECULE_LIBRARY[selectedCat];
  const subNames = catData ? Object.keys(catData.subcategories) : [];
  const subData  = catData?.subcategories[selectedSub];
  const subMols  = subData?.molecules || [];

  const isSearching = searchQuery.trim().length > 0;
  const searchResults = isSearching
    ? ALL_MOLECULES.filter(m =>
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.iupacName?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 12)
    : [];
  const visibleMoleculeCards = useMemo(() => subMols.slice(0, cardDensity === 'compact' ? 12 : 8), [subMols, cardDensity]);

  // -- Navigation handlers -----------------------------------------------------
  const selectMolecule = useCallback((m) => {
    setMol(m); setHighlightId(null); setSelectedAtom(null);
    setSearchQuery(''); setShowSearchDrop(false);
    const loc = findMolLocation(m.name);
    if (loc) { setSelectedCat(loc.cName); setSelectedSub(loc.sName); }
  }, []);

  const handleCatChange = (catName) => {
    setSelectedCat(catName);
    const subs = MOLECULE_LIBRARY[catName]?.subcategories || {};
    const firstSub = Object.keys(subs)[0];
    if (firstSub) {
      setSelectedSub(firstSub);
      const mols = subs[firstSub]?.molecules || [];
      if (mols[0]) { setMol(mols[0]); setHighlightId(null); setSelectedAtom(null); }
    }
  };

  const handleSubChange = (subName) => {
    setSelectedSub(subName);
    const mols = catData?.subcategories[subName]?.molecules || [];
    if (mols[0]) { setMol(mols[0]); setHighlightId(null); setSelectedAtom(null); }
  };

  // -- Init Three.js once ------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    const w = container.clientWidth, h = height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060d1f);
    scene.fog = new THREE.Fog(0x060d1f, 20, 42);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 200);
    camera.position.set(0, 3, 10);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(w, h);
    labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;';
    container.style.position = 'relative';
    container.appendChild(labelRenderer.domElement);
    labelRenRef.current = labelRenderer;

    const hemi = new THREE.HemisphereLight(0x8899ff, 0x441122, 0.6);
    scene.add(hemi);
    const ambient = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambient);
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(6, 12, 8); key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.near = 0.1; key.shadow.camera.far = 50;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x8899dd, 0.5);
    fill.position.set(-6, 3, -4); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.3);
    rim.position.set(0, -5, -8); scene.add(rim);

    const grid = new THREE.GridHelper(24, 24, 0x1e3a5f, 0x0f1f3a);
    grid.position.y = -2.2;
    grid.material.transparent = true; grid.material.opacity = 0.55;
    scene.add(grid);

    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.22, transparent: true });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.2; floor.receiveShadow = true;
    scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.dampingFactor = 0.06;
    controls.minDistance = 1.5; controls.maxDistance = 30;
    controls.autoRotate = true; controls.autoRotateSpeed = 1.4;
    controlsRef.current = controls;

    fitCameraToMolecule(camera, controls, mol);

    const animate = () => {
      rafRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = container.clientWidth;
      camera.aspect = nw / height;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, height);
      labelRenderer.setSize(nw, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      if (container.contains(labelRenderer.domElement)) container.removeChild(labelRenderer.domElement);
    };
  }, []); // eslint-disable-line

  // -- Rebuild molecule ---------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return;
    buildScene(sceneRef.current, mol, viewMode, showLabels, highlightId);
    if (cameraRef.current && controlsRef.current)
      fitCameraToMolecule(cameraRef.current, controlsRef.current, mol);
  }, [mol, viewMode, showLabels, highlightId]);

  useEffect(() => {
    if (controlsRef.current) controlsRef.current.autoRotate = autoRot;
  }, [autoRot]);

  // -- Atom click via raycasting ------------------------------------------------
  const handleCanvasClick = useCallback((e) => {
    const container = mountRef.current;
    if (!container || !sceneRef.current || !cameraRef.current) return;
    const rect = container.getBoundingClientRect();
    const canvas = rendererRef.current.domElement;
    mouseRef.current.x = ((e.clientX - rect.left) / canvas.clientWidth) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / canvas.clientHeight) * 2 + 1;
    const rc = raycasterRef.current;
    rc.setFromCamera(mouseRef.current, cameraRef.current);
    const meshes = [];
    sceneRef.current.traverse(obj => { if (obj.isMesh && obj.userData.atomId) meshes.push(obj); });
    const hits = rc.intersectObjects(meshes);
    if (hits.length > 0) {
      const atom = hits[0].object.userData.atom;
      setHighlightId(atom.id); setSelectedAtom(atom); setAutoRot(false);
    } else {
      setHighlightId(null); setSelectedAtom(null);
    }
  }, []);

  const handleScreenshot = () => {
    if (!rendererRef.current) return;
    rendererRef.current.render(sceneRef.current, cameraRef.current);
    const url = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url; a.download = `${mol.name.replace(/\s+/g, '_')}.png`; a.click();
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current)
      fitCameraToMolecule(cameraRef.current, controlsRef.current, mol);
  };

  const elementCounts = mol.atoms.reduce((acc, a) => {
    acc[a.element] = (acc[a.element] || 0) + 1; return acc;
  }, {});

  return (
    <div className="flex flex-col gap-3">

      {/* -- Row 1: Search + View modes + Controls -- */}
      <div className="glass rounded-2xl p-3 border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={18} className="text-cyan-300" />
              <h3 className="text-base font-bold">Interactive 3D Molecule Viewer</h3>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Explore {ALL_MOLECULES.length} modeled molecules through {LIBRARY_STATS.subcategories} guided learning paths. Click atoms, rotate structures, switch view modes, and read the key idea for each topic.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              [LIBRARY_STATS.categories, 'categories'],
              [LIBRARY_STATS.subcategories, 'subtopics'],
              [LIBRARY_STATS.moleculeViews, 'guided views'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                <div className="text-lg font-black text-white leading-none">{value}</div>
                <div className="text-[10px] text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        {/* Search with dropdown */}
        <div className="relative flex-1 min-w-44 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search ${ALL_MOLECULES.length} molecules...`}
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setShowSearchDrop(true); }}
            onFocus={() => setShowSearchDrop(true)}
            onBlur={() => setTimeout(() => setShowSearchDrop(false), 180)}
            onKeyDown={e => e.key === 'Escape' && setSearchQuery('')}
            className="input text-sm py-2 pl-9 pr-8 w-full"
          />
          {isSearching && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-base leading-none"
            >x</button>
          )}
          {showSearchDrop && isSearching && searchResults.length > 0 && (
            <div
              onMouseDown={e => e.preventDefault()}
              className="absolute top-full left-0 right-0 z-50 mt-1 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              style={{ background: 'rgba(8,14,36,0.97)', backdropFilter: 'blur(20px)' }}
            >
              {searchResults.map(m => {
                const loc = findMolLocation(m.name);
                const catColor = loc ? MOLECULE_LIBRARY[loc.cName]?.color : '#94a3b8';
                return (
                  <button
                    key={m.name}
                    onClick={() => selectMolecule(m)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-0"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor }} />
                    <span className="text-sm text-gray-200">{m.name}</span>
                    <span className="ml-auto text-xs text-gray-500 font-mono">{m.formula}</span>
                    {m.iupacName && <span className="sr-only">{m.iupacName}</span>}
                  </button>
                );
              })}
              {isSearching && searchResults.length === 0 && (
                <p className="text-xs text-gray-600 text-center py-3">No molecules found</p>
              )}
            </div>
          )}
        </div>

        {/* View mode toggle */}
        <div className="flex rounded-xl overflow-hidden border border-white/10 divide-x divide-white/10">
          {[['ball-stick', 'Ball'], ['space-fill', 'Fill'], ['wireframe', 'Wire']].map(([v, vl]) => (
            <button key={v} onClick={() => setViewMode(v)}
              className={`px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap ${
                viewMode === v ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200'
              }`}>
              {vl}
            </button>
          ))}
        </div>

        {/* Controls */}
        <button onClick={() => setAutoRot(r => !r)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${
            autoRot ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'glass border-white/10 text-gray-400 hover:text-gray-200'
          }`}>
          {autoRot ? <Pause size={13} /> : <Play size={13} />}
          Rotate
        </button>
        <button onClick={() => setShowLabels(l => !l)}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
            showLabels ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-300' : 'glass border-white/10 text-gray-400'
          }`}>
          {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
          Labels
        </button>
        <button onClick={resetCamera}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass border border-white/10 text-gray-400 hover:text-gray-200 transition-all"
          title="Reset camera">
          <RotateCcw size={13} />
          Reset
        </button>
        <button onClick={handleScreenshot}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass border border-white/10 text-gray-400 hover:text-gray-200 transition-all"
          title="Download PNG">
          <Camera size={13} />
          PNG
        </button>
        <button onClick={() => setShowPanel(p => !p)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium glass border border-white/10 text-gray-400 hover:text-gray-200 transition-all">
          <Info size={13} />
          {showPanel ? 'Hide Panel' : 'Show Panel'}
        </button>
      </div>

      <div className="glass rounded-2xl p-2.5 border border-white/10">
        <div className="grid md:grid-cols-[auto_minmax(160px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)] gap-2 items-center">
          <div className="flex items-center gap-2 px-1 text-xs font-semibold text-gray-300 whitespace-nowrap">
            <ListFilter size={14} className="text-cyan-300" />
            Learning Categories
          </div>
          <select
            value={selectedCat}
            onChange={e => handleCatChange(e.target.value)}
            className="input text-xs py-2 min-w-0"
            aria-label="Learning category"
          >
            {CAT_NAMES.map(catName => (
              <option key={catName} value={catName}>{catName}</option>
            ))}
          </select>
          <select
            value={selectedSub}
            onChange={e => handleSubChange(e.target.value)}
            className="input text-xs py-2 min-w-0"
            aria-label="Learning subcategory"
          >
            {subNames.map(subName => (
              <option key={subName} value={subName}>{subName}</option>
            ))}
          </select>
          {subMols.length > 0 ? (
            <select
              value={mol.name}
              onChange={e => {
                const m = subMols.find(x => x.name === e.target.value);
                if (m) selectMolecule(m);
              }}
              className="input text-xs py-2 min-w-0"
              aria-label="Molecule"
            >
              {subMols.map(m => (
                <option key={m.name} value={m.name}>{m.name} - {m.formula}</option>
              ))}
            </select>
          ) : (
            <span className="text-xs text-gray-600 italic px-2">Select a subcategory</span>
          )}
        </div>
        {subMols.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Visual Browse</p>
              <div className="flex rounded-lg overflow-hidden border border-white/10">
                {['compact', 'expanded'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setCardDensity(mode)}
                    className={`px-2.5 py-1 text-[10px] capitalize ${cardDensity === mode ? 'bg-indigo-600 text-white' : 'bg-white/[0.04] text-gray-500 hover:text-gray-300'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
            <div className={`grid gap-2 ${cardDensity === 'compact' ? 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-6' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
              {visibleMoleculeCards.map(item => (
                <button
                  key={item.name}
                  onClick={() => selectMolecule(item)}
                  className={`rounded-xl border text-left transition-colors hover:bg-white/[0.08] ${
                    mol.name === item.name ? 'bg-indigo-500/15 border-indigo-400/30' : 'bg-white/[0.035] border-white/10'
                  } ${cardDensity === 'compact' ? 'p-2' : 'p-3'}`}
                >
                  <MoleculeThumb molecule={item} />
                  <p className="mt-2 text-xs font-bold text-white truncate">{item.name}</p>
                  {cardDensity === 'expanded' && (
                    <>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{item.formula} - {item.atoms.length} atoms</p>
                      {item.iupacName && <p className="text-[10px] text-cyan-300 mt-1 truncate">{item.iupacName}</p>}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Primary 3D molecule view */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-2xl font-black text-white tracking-tight">{mol.formula}</span>
        <span className="text-sm text-gray-400">{mol.name}</span>
        {mol.iupacName && <span className="text-xs text-cyan-300">IUPAC: {mol.iupacName}</span>}
        <div className="flex items-center gap-1 text-[10px] flex-shrink-0">
          <span style={{ color: catData?.color || '#94a3b8' }}>{selectedCat}</span>
          <span className="text-gray-700 mx-0.5">&gt;</span>
          <span className="text-gray-500">{selectedSub}</span>
        </div>
        <div className="flex gap-2 ml-auto flex-wrap">
          {Object.entries(elementCounts).map(([el, n]) => (
            <span key={el} className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-gray-300">
              {n} {el}
            </span>
          ))}
          <span className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-gray-400">
            {mol.bonds.length} bonds
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <div
          ref={mountRef}
          onClick={handleCanvasClick}
          className="flex-1 rounded-2xl overflow-hidden border border-white/10 cursor-pointer"
          style={{ height: `${height}px`, background: '#060d1f', minWidth: 0 }}
        />

        {showPanel && (
          <div className="w-52 flex-shrink-0 flex flex-col gap-2 overflow-y-auto scrollbar-thin"
            style={{ maxHeight: `${height}px` }}>

            {selectedAtom ? (
              <div className="glass rounded-xl p-3 border border-indigo-500/30"
                style={{ background: `${selectedAtom.color}18` }}>
                <p className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                    style={{ background: selectedAtom.color }} />
                  {selectedAtom.element}
                  {selectedAtom.charge && (
                    <span className="ml-auto text-xs font-black"
                      style={{ color: selectedAtom.charge === '+' ? '#ef4444' : '#3b82f6' }}>
                      {selectedAtom.charge}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-gray-400">ID: {selectedAtom.id}</p>
                <p className="text-[10px] text-gray-400">
                  ({selectedAtom.position.map(v => v.toFixed(2)).join(', ')}) A
                </p>
                <p className="text-[10px] text-gray-400">vdW: {selectedAtom.radius} A</p>
                <button onClick={() => { setHighlightId(null); setSelectedAtom(null); }}
                  className="mt-2 w-full text-[10px] text-gray-500 hover:text-gray-300 transition-colors text-center">
                  x Clear
                </button>
              </div>
            ) : (
              <div className="glass rounded-xl p-3 text-center border border-white/5">
                <p className="text-[10px] text-gray-600">Click an atom to inspect</p>
              </div>
            )}

            <div className="glass rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Atoms - {mol.atoms.length}
              </p>
              <div className="space-y-0.5">
                {mol.atoms.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setHighlightId(a.id); setSelectedAtom(a); setAutoRot(false); }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all text-xs ${
                      highlightId === a.id ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
                    <span className="font-mono font-bold" style={{ color: a.color }}>{a.element}</span>
                    <span className="text-gray-600 text-[10px]">{a.id}</span>
                    {a.charge && (
                      <span className="ml-auto text-[10px] font-bold"
                        style={{ color: a.charge === '+' ? '#f87171' : '#60a5fa' }}>
                        {a.charge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
                Bonds - {mol.bonds.length}
              </p>
              <div className="space-y-0.5 max-h-36 overflow-y-auto scrollbar-thin">
                {mol.bonds.map((b) => (
                  <div key={`${b.from}-${b.to}`} className="flex items-center gap-1.5 text-[10px] text-gray-400 px-1">
                    <span className={`w-2 h-1 rounded-full flex-shrink-0 ${b.type === 'ionic-dashed' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                    <span className="font-mono">{b.from}</span>
                    <span className="text-gray-700">-</span>
                    <span className="font-mono">{b.to}</span>
                    <span className="ml-auto text-gray-600 text-[9px]">
                      {b.type === 'ionic-dashed' ? 'ionic' : b.order === 3 ? 'triple' : b.order === 2 ? 'double' : 'cov.'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Legend</p>
              <div className="space-y-1.5 text-[10px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" /> Covalent bond
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-1 rounded bg-amber-500 flex-shrink-0" /> Ionic bond
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-white flex-shrink-0" /> Selected atom
                </div>
              </div>
            </div>

            {catData && (
              <div className="glass rounded-xl p-3 border"
                style={{ borderColor: `${catData.color}30`, background: `${catData.color}0a` }}>
                <p className="text-[10px] font-semibold mb-1" style={{ color: catData.color }}>
                  {selectedCat}
                </p>
                <p className="text-[10px] text-gray-500">{catData.description}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {subNames.length} subcategories
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-[10px] text-gray-700 text-center">
        Click atom to inspect - Drag to orbit - Scroll to zoom - Right-drag to pan
      </p>

      {subData && (
        <div className="grid md:grid-cols-3 gap-2">
          <div className="glass rounded-xl p-3 border" style={{ borderColor: `${catData.color}25` }}>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">
              <BookOpen size={12} />
              Learn
            </div>
            <p className="text-xs text-gray-300">{subData.learningGoal || subData.description}</p>
          </div>
          <div className="glass rounded-xl p-3 border" style={{ borderColor: `${catData.color}25` }}>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">
              <Sparkles size={12} />
              Key Idea
            </div>
            <p className="text-xs text-gray-300">{subData.keyIdea || 'Use the 3D shape, labels, and atom colors together to reason about the molecule.'}</p>
          </div>
          <div className="glass rounded-xl p-3 border" style={{ borderColor: `${catData.color}25` }}>
            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-gray-500 mb-1">
              <Boxes size={12} />
              Try This
            </div>
            <p className="text-xs text-gray-300">Switch view modes, pause rotation, then click atoms to connect the formula with the 3D structure.</p>
          </div>
        </div>
      )}

    </div>
  );
};

export default MoleculeScene;
