import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export default forwardRef(function CarbohydrateViewer({ compound, representation = 'Ball & stick', hydrogens = true, labels = false, carbonLabels = false, selectedCarbon = null, onSelectCarbon, onHoverCarbon, className = '' }, ref) {
  const hostRef = useRef(null);
  const sceneRef = useRef(null);
  const callbacksRef = useRef({ onSelectCarbon, onHoverCarbon });
  const [status, setStatus] = useState('loading');
  callbacksRef.current = { onSelectCarbon, onHoverCarbon };

  useImperativeHandle(ref, () => ({
    reset: () => { const s = sceneRef.current; if (s) { s.viewer.setView(s.home); s.viewer.render(); } },
    rotate: (axis = 'y', angle = 18) => { sceneRef.current?.viewer.rotate(angle, axis); sceneRef.current?.viewer.render(); },
    zoom: factor => { sceneRef.current?.viewer.zoom(factor); sceneRef.current?.viewer.render(); },
    pan: (x, y) => { sceneRef.current?.viewer.translate(x, y); sceneRef.current?.viewer.render(); },
    fullscreen: () => hostRef.current?.closest('.cs-viewer')?.requestFullscreen?.(),
  }), []);

  useEffect(() => {
    let cancelled = false;
    let observer;
    setStatus('loading');
    Promise.all([import('3dmol'), fetch(compound.source).then(r => { if (!r.ok) throw new Error(`Unable to load ${compound.name}`); return r.text(); })])
      .then(([lib, sdf]) => {
        if (cancelled || !hostRef.current) return;
        const mol = lib.createViewer ? lib : lib.default;
        const viewer = mol.createViewer(hostRef.current, { backgroundColor: '#061522', backgroundAlpha: 0, antialias: true, disableFog: true });
        const model = viewer.addModel(sdf, 'sdf', { keepH: true });
        const atoms = model.selectedAtoms({});
        const carbons = atoms.filter(a => String(a.elem).toUpperCase() === 'C').sort((a, b) => a.serial - b.serial);
        const carbonIndex = new Map(carbons.map((atom, index) => [atom.serial, index + 1]));
        viewer.setClickable({}, true, atom => {
          const carbon = carbonIndex.get(atom.serial);
          if (carbon) callbacksRef.current.onSelectCarbon?.(carbon);
        });
        viewer.setHoverable({}, true, atom => {
          const carbon = carbonIndex.get(atom.serial);
          if (carbon) callbacksRef.current.onHoverCarbon?.(carbon);
        }, () => callbacksRef.current.onHoverCarbon?.(null));
        viewer.setHoverDuration(70);
        viewer.zoomTo();
        viewer.zoom(compound.classification.startsWith('Polysaccharide') ? 1.15 : 1.3);
        sceneRef.current = { viewer, model, atoms, carbons, mol, home: viewer.getView() };
        observer = new ResizeObserver(() => { viewer.resize(); viewer.render(); });
        observer.observe(hostRef.current);
        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });
    return () => {
      cancelled = true;
      observer?.disconnect();
      if (sceneRef.current) sceneRef.current.viewer.clear();
      sceneRef.current = null;
      hostRef.current?.replaceChildren();
    };
  }, [compound]);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene || status !== 'ready') return;
    const { viewer, carbons } = scene;
    viewer.setStyle({}, {});
    const base = representation === 'Space filling'
      ? { sphere: { scale: 0.9, colorscheme: 'Jmol' } }
      : representation === 'Sticks'
        ? { stick: { radius: 0.13, colorscheme: 'Jmol' } }
        : { stick: { radius: 0.15, colorscheme: 'Jmol' }, sphere: { scale: 0.25, colorscheme: 'Jmol' } };
    viewer.setStyle(hydrogens ? {} : { not: { elem: 'H' } }, base);
    if (!hydrogens) viewer.setStyle({ elem: 'H' }, {});
    if (selectedCarbon) viewer.addStyle({ serial: carbons[selectedCarbon - 1]?.serial }, { stick: { radius: 0.24, color: '#ffe13b' }, sphere: { scale: 0.42, color: '#ffe13b' } });
    viewer.removeAllLabels();
    if (labels) scene.atoms.filter(a => hydrogens || a.elem !== 'H').forEach(atom => viewer.addLabel(atom.elem, { position: atom, fontSize: 9, fontColor: '#e8f7ff', backgroundOpacity: 0, inFront: true }));
    if (carbonLabels) carbons.forEach((atom, index) => viewer.addLabel(compound.classification === 'Disaccharide' ? `${index < 6 ? 'A' : 'B'}C${index % 6 + 1}` : `C${index + 1}`, { position: atom, fontSize: 10, fontColor: '#071522', backgroundColor: '#5be8ff', backgroundOpacity: .92, borderThickness: 0, inFront: true }));
    viewer.render();
  }, [status, representation, hydrogens, labels, carbonLabels, selectedCarbon]);

  return <div className={`cs-viewer ${className}`} data-status={status} data-selected-carbon={selectedCarbon || ''}>
    <div ref={hostRef} className="cs-viewer-host" role="img" aria-label={`Interactive 3D structure of ${compound.name}`} />
    {status === 'loading' && <div className="cs-view-state">Loading validated structure…</div>}
    {status === 'error' && <div className="cs-view-state is-error">Structure unavailable</div>}
    <div className="cs-source-badge">3DMOL · PUBCHEM CID {compound.cid}</div>
  </div>;
});
