import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { loadStructureIntoPlugin } from './StructureLoader.js';
import { resolveColorScheme } from './viewerPresets.js';
import { structureSourceKey } from './structureSources.js';
import ViewerLoadingState from './ViewerLoadingState.jsx';
import './molstar.css';

const rotateVector = (v, axis, angle) => {
  const [x, y, z] = v, c = Math.cos(angle), s = Math.sin(angle);
  if (axis === 'x') return [x, y * c - z * s, y * s + z * c];
  if (axis === 'z') return [x * c - y * s, x * s + y * c, z];
  return [x * c + z * s, y, -x * s + z * c];
};

const rotateAroundAxis = (vector, axis, angle) => {
  const length = Math.hypot(...axis) || 1;
  const [ux, uy, uz] = axis.map(value => value / length);
  const [x, y, z] = vector;
  const cosine = Math.cos(angle), sine = Math.sin(angle);
  const dot = ux * x + uy * y + uz * z;
  return [
    x * cosine + (uy * z - uz * y) * sine + ux * dot * (1 - cosine),
    y * cosine + (uz * x - ux * z) * sine + uy * dot * (1 - cosine),
    z * cosine + (ux * y - uy * x) * sine + uz * dot * (1 - cosine),
  ];
};

const REPRESENTATION_KEYS = ['Cartoon', 'Backbone', 'Surface', 'Sticks', 'BallAndStick', 'Licorice', 'Spacefill'];

async function ensureRepresentation(plugin, runtime, key) {
  if (!runtime?.components || !runtime?.representations) return null;
  if (runtime.representations[key]) return runtime.representations[key];
  const component = ['Cartoon', 'Backbone', 'Surface'].includes(key)
    ? runtime.components?.polymer
    : runtime.components?.all;
  if (!component) return null;
  const carbonColor = { name: runtime.color, params: {} };
  const params = {
    Cartoon: { type: 'cartoon', color: runtime.color },
    Backbone: { type: 'backbone', color: runtime.color },
    Surface: { type: 'molecular-surface', typeParams: { alpha: 0.24, probeRadius: 1.4, quality: 'custom', resolution: 1.2 }, color: 'uniform', colorParams: { value: 0x2d668a } },
    Sticks: { type: 'ball-and-stick', typeParams: { sizeFactor: 0.18 }, color: 'element-symbol', colorParams: { carbonColor } },
    BallAndStick: { type: 'ball-and-stick', typeParams: { sizeFactor: 0.34 }, color: 'element-symbol', colorParams: { carbonColor } },
    Licorice: { type: 'ball-and-stick', typeParams: { sizeFactor: 0.12 }, color: 'element-symbol', colorParams: { carbonColor } },
    Spacefill: { type: 'spacefill', typeParams: { sizeFactor: 0.9 }, color: 'element-symbol', colorParams: { carbonColor } },
  }[key];
  if (!params) return null;
  const created = await plugin.builders.structure.representation.addRepresentation(component, params);
  runtime.representations[key] = created;
  return created;
}

async function focusResidueName(plugin, runtime, residueName, chain, durationMs = 0) {
  if (!plugin || !runtime?.structure?.obj?.data || !residueName) return;
  const [{ MolScriptBuilder: MS }, { StructureSelectionQuery }] = await Promise.all([
    import('molstar/lib/mol-script/language/builder'),
    import('molstar/lib/mol-plugin-state/helpers/structure-selection-query'),
  ]);
  const expression = MS.struct.generator.atomGroups({
    'residue-test': MS.core.rel.eq([MS.ammp('auth_comp_id'), String(residueName).toUpperCase()]),
    ...(chain ? { 'chain-test': MS.core.rel.eq([MS.ammp('auth_asym_id'), chain]) } : {}),
  });
  const query = StructureSelectionQuery(`Ligand ${residueName}`, expression);
  plugin.managers.structure.selection.fromCompiledQuery('set', query.query, true);
  const loci = plugin.managers.structure.selection.getLoci(runtime.structure.obj.data);
  if (loci?.elements?.length) plugin.managers.camera.focusLoci(loci, { minRadius: 7, extraRadius: 6, durationMs });
}

async function focusAuthChain(plugin, runtime, chain, durationMs = 0) {
  if (!plugin || !runtime?.structure?.obj?.data || !chain) return;
  const [{ MolScriptBuilder: MS }, { StructureSelectionQuery }] = await Promise.all([
    import('molstar/lib/mol-script/language/builder'),
    import('molstar/lib/mol-plugin-state/helpers/structure-selection-query'),
  ]);
  const expression = MS.struct.generator.atomGroups({
    'chain-test': MS.core.rel.eq([MS.ammp('auth_asym_id'), String(chain)]),
  });
  const query = StructureSelectionQuery(`Chain ${chain}`, expression);
  plugin.managers.structure.selection.fromCompiledQuery('set', query.query, true);
  const loci = plugin.managers.structure.selection.getLoci(runtime.structure.obj.data);
  if (loci?.elements?.length) plugin.managers.camera.focusLoci(loci, { minRadius: 9, extraRadius: 6, durationMs });
}

export default forwardRef(function MolstarViewer({
  source,
  sourceType = 'pdb',
  label = 'Structure',
  pdbId,
  representation = { Cartoon: true, Surface: false, Sticks: false },
  colorScheme = 'chain',
  selectedChain,
  selectedResidue,
  highlightedResidues = [],
  focusOnSelection = false,
  focusLigandOnLoad = false,
  focusLigandId,
  focusLigandChain,
  backgroundColor = 0x06131f,
  showUnitCell = false,
  showControls = false,
  showLabels = true,
  annotations = [],
  onReady,
  onSelectionChange,
  onLoadError,
}, ref) {
  const hostRef = useRef(null);
  const pluginRef = useRef(null);
  const runtimeRef = useRef(null);
  const callbacksRef = useRef({ onReady, onSelectionChange, onLoadError });
  const [pluginReady, setPluginReady] = useState(false);
  const [retry, setRetry] = useState(0);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Preparing Mol*…');
  const [selectionEpoch, setSelectionEpoch] = useState(0);
  const sourceKey = useMemo(() => structureSourceKey(source, sourceType, label), [source, sourceType, label]);
  const highlightedResidueKey = highlightedResidues.join(',');
  callbacksRef.current = { onReady, onSelectionChange, onLoadError };

  useEffect(() => {
    let disposed = false;
    let resizeObserver;
    let clickSubscription;
    let uiRoot;
    const unmountUi = () => { if (uiRoot) queueMicrotask(() => uiRoot?.unmount()); };
    (async () => {
      try {
        const [{ createPluginUI }, { DefaultPluginUISpec }, { PluginConfig }, { Structure, StructureElement, StructureProperties }] = await Promise.all([
          import('molstar/lib/mol-plugin-ui'),
          import('molstar/lib/mol-plugin-ui/spec'),
          import('molstar/lib/mol-plugin/config'),
          import('molstar/lib/mol-model/structure'),
        ]);
        if (disposed || !hostRef.current) return;
        const base = DefaultPluginUISpec();
        const plugin = await createPluginUI({
          target: hostRef.current,
          render: (element, target) => { uiRoot = createRoot(target); uiRoot.render(element); },
          spec: {
            ...base,
            layout: { initial: { isExpanded: false, showControls, controlsDisplay: 'reactive' } },
            components: {
              ...base.components,
              controls: { top: 'none', left: 'none', right: showControls ? 'reactive' : 'none', bottom: 'none' },
              remoteState: 'none',
            },
            config: [
              ...(base.config || []),
              [PluginConfig.Viewport.ShowExpand, false],
              [PluginConfig.Viewport.ShowControls, showControls],
              [PluginConfig.Viewport.ShowSettings, showControls],
              [PluginConfig.Viewport.ShowSelectionMode, false],
              [PluginConfig.Viewport.ShowAnimation, false],
              [PluginConfig.Viewport.ShowTrajectoryControls, false],
              [PluginConfig.Viewport.ShowScreenshotControls, false],
            ],
          },
        });
        if (disposed) { plugin.dispose(); unmountUi(); return; }
        pluginRef.current = plugin;
        runtimeRef.current = { Structure, StructureElement, StructureProperties, representations: {}, structure: null };
        plugin.canvas3d?.setProps({ renderer: { backgroundColor }, transparentBackground: false });
        clickSubscription = plugin.behaviors.interaction.click.subscribe(({ current }) => {
          const loci = current?.loci;
          if (!loci || !StructureElement.Loci.is(loci)) return;
          const location = StructureElement.Loci.getFirstLocation(loci);
          if (!location) return;
          const coordinates = [0, 0, 0];
          location.unit.conformation.position(location.element, coordinates);
          callbacksRef.current.onSelectionChange?.({
            residue: StructureProperties.residue.auth_seq_id(location),
            residueName: StructureProperties.atom.auth_comp_id(location),
            chain: StructureProperties.chain.auth_asym_id(location),
            atom: StructureProperties.atom.auth_atom_id(location),
            element: StructureProperties.atom.type_symbol(location),
            coordinates,
          });
        });
        resizeObserver = new ResizeObserver(() => plugin.canvas3d?.requestResize());
        resizeObserver.observe(hostRef.current);
        setPluginReady(true);
      } catch (error) {
        if (!disposed) {
          setStatus('error'); setMessage(`Mol* could not start: ${error.message}`);
          callbacksRef.current.onLoadError?.(error);
        }
      }
    })();
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      clickSubscription?.unsubscribe();
      pluginRef.current?.dispose();
      unmountUi();
      pluginRef.current = null;
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!pluginReady || !pluginRef.current) return;
    let cancelled = false;
    let cameraTimer;
    const plugin = pluginRef.current;
    (async () => {
      setStatus('loading'); setMessage(`Loading ${label} coordinates…`);
      try {
        runtimeRef.current = { ...runtimeRef.current, structure: null, components: null, representations: {} };
        await plugin.clear();
        if (cancelled) return;
        const loaded = await loadStructureIntoPlugin(plugin, source, sourceType, label);
        if (cancelled) return;
        const unitCell = showUnitCell ? await plugin.builders.structure.tryCreateUnitcell(loaded.model, undefined, { isHidden: false }) : null;
        const polymer = await plugin.builders.structure.tryCreateComponentStatic(loaded.structure, 'polymer');
        const all = await plugin.builders.structure.tryCreateComponentStatic(loaded.structure, 'all');
        const ligand = await plugin.builders.structure.tryCreateComponentStatic(loaded.structure, 'ligand');
        const branched = await plugin.builders.structure.tryCreateComponentStatic(loaded.structure, 'branched');
        const ion = await plugin.builders.structure.tryCreateComponentStatic(loaded.structure, 'ion');
        const color = resolveColorScheme(colorScheme);
        const runtime = { ...runtimeRef.current, ...loaded, unitCell, structure: loaded.structure, components: { polymer, all, ligand, branched, ion }, representations: {}, color };
        runtimeRef.current = runtime;
        for (const key of REPRESENTATION_KEYS) if (representation[key]) await ensureRepresentation(plugin, runtime, key);
        if (ligand) runtime.representations.Ligand = await plugin.builders.structure.representation.addRepresentation(ligand, { type: 'ball-and-stick', typeParams: { sizeFactor: 0.32 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });
        if (branched) runtime.representations.Branched = await plugin.builders.structure.representation.addRepresentation(branched, { type: 'ball-and-stick', typeParams: { sizeFactor: 0.3 }, color: 'element-symbol', colorParams: { carbonColor: { name: 'element-symbol', params: {} } } });
        if (ion) runtime.representations.Ion = await plugin.builders.structure.representation.addRepresentation(ion, { type: 'spacefill', typeParams: { sizeFactor: 0.8 }, color: 'element-symbol' });
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        if (cancelled) return;
        plugin.canvas3d?.requestResize();
        plugin.managers.camera.reset(undefined, 0);
        setSelectionEpoch(value => value + 1);
        setStatus('ready'); setMessage(`${label} loaded from coordinate data`);
        if (focusLigandId) {
          await focusResidueName(plugin, runtime, focusLigandId, focusLigandChain, 0);
        } else if (focusLigandOnLoad && ligand?.obj?.data) {
          plugin.managers.camera.focusLoci(runtime.Structure.toStructureElementLoci(ligand.obj.data), { minRadius: 8, extraRadius: 7, durationMs: 0 });
        }
        callbacksRef.current.onReady?.(plugin, loaded);
        cameraTimer = window.setTimeout(() => {
          if (!cancelled) {
            if (focusLigandId) focusResidueName(plugin, runtime, focusLigandId, focusLigandChain, 0);
            else if (focusLigandOnLoad && ligand?.obj?.data) plugin.managers.camera.focusLoci(runtime.Structure.toStructureElementLoci(ligand.obj.data), { minRadius: 8, extraRadius: 7, durationMs: 0 });
            else if (!(focusOnSelection && Number.isFinite(selectedResidue))) plugin.managers.camera.reset(undefined, 0);
          }
        }, 350);
      } catch (error) {
        if (!cancelled) {
          setStatus('error'); setMessage(error.message || 'The structure could not be loaded.');
          callbacksRef.current.onLoadError?.(error);
        }
      }
    })();
    return () => { cancelled = true; window.clearTimeout(cameraTimer); };
  }, [pluginReady, sourceKey, colorScheme, focusLigandOnLoad, focusLigandId, focusLigandChain, showUnitCell, retry]);

  useEffect(() => {
    const plugin = pluginRef.current, runtimeAtStart = runtimeRef.current, reps = runtimeAtStart?.representations;
    if (!plugin || !runtimeAtStart?.components || !reps) return;
    let cancelled = false;
    (async () => {
      try {
        const runtime = runtimeAtStart;
        for (const key of REPRESENTATION_KEYS) {
          if (cancelled || runtime !== runtimeRef.current) return;
          const rep = representation[key] ? await ensureRepresentation(plugin, runtime, key) : reps[key];
          if (cancelled || runtime !== runtimeRef.current) return;
          if (rep) plugin.state.data.updateCellState(rep.ref, { isHidden: !representation[key] });
        }
        if (reps.Ligand) plugin.state.data.updateCellState(reps.Ligand.ref, { isHidden: representation.Ligand === false });
        if (reps.Branched) plugin.state.data.updateCellState(reps.Branched.ref, { isHidden: representation.Branched === false });
        if (reps.Ion) plugin.state.data.updateCellState(reps.Ion.ref, { isHidden: representation.Ion === false });
        if (runtime.unitCell) plugin.state.data.updateCellState(runtime.unitCell.ref, { isHidden: !showUnitCell });
        plugin.canvas3d?.requestDraw?.();
      } catch (error) {
        if (!cancelled && runtimeAtStart === runtimeRef.current) console.warn('Mol* representation update failed', error);
      }
    })();
    return () => { cancelled = true; };
  }, [representation, showUnitCell]);

  useEffect(() => {
    const plugin = pluginRef.current, structure = runtimeRef.current?.structure;
    if (!plugin || !structure?.obj?.data) return;
    let cancelled = false;
    (async () => {
      try {
        const [{ MolScriptBuilder: MS }, { StructureSelectionQuery }] = await Promise.all([
          import('molstar/lib/mol-script/language/builder'),
          import('molstar/lib/mol-plugin-state/helpers/structure-selection-query'),
        ]);
        if (cancelled) return;
        const residues = [...new Set([selectedResidue, ...highlightedResidues].filter(Number.isFinite))];
        if (!residues.length) { plugin.managers.structure.selection.clear(); return; }
        const tests = [MS.core.set.has([MS.set(...residues), MS.ammp('auth_seq_id')])];
        if (selectedChain) tests.push(MS.core.rel.eq([MS.ammp('auth_asym_id'), selectedChain]));
        const expression = MS.struct.generator.atomGroups({ 'residue-test': tests.length === 1 ? tests[0] : MS.core.logic.and(tests) });
        const query = StructureSelectionQuery('Application selection', expression);
        plugin.managers.structure.selection.fromCompiledQuery('set', query.query, true);
        if (focusOnSelection && Number.isFinite(selectedResidue)) {
          const loci = plugin.managers.structure.selection.getLoci(structure.obj.data);
          if (loci?.elements?.length) plugin.managers.camera.focusLoci(loci, { minRadius: 7, extraRadius: 5, durationMs: 220 });
        }
      } catch (error) { console.warn('Mol* selection synchronization failed', error); }
    })();
    return () => { cancelled = true; };
  }, [selectedChain, selectedResidue, highlightedResidueKey, selectionEpoch, focusOnSelection]);

  useImperativeHandle(ref, () => ({
    reset: () => pluginRef.current?.managers.camera.reset(undefined, 200),
    focusSelection: () => {
      const plugin = pluginRef.current, structure = runtimeRef.current?.structure?.obj?.data;
      if (plugin && structure) plugin.managers.camera.focusLoci(plugin.managers.structure.selection.getLoci(structure));
    },
    focusLigand: () => {
      const plugin = pluginRef.current, runtime = runtimeRef.current, ligand = runtime?.components?.ligand?.obj?.data;
      if (plugin && ligand) plugin.managers.camera.focusLoci(runtime.Structure.toStructureElementLoci(ligand), { minRadius: 8, extraRadius: 7, durationMs: 220 });
    },
    focusLigandId: (residueName, chain) => focusResidueName(pluginRef.current, runtimeRef.current, residueName, chain, 220),
    focusChain: chain => focusAuthChain(pluginRef.current, runtimeRef.current, chain, 220),
    rotate: (axis = 'y', degrees = 15) => {
      const canvas = pluginRef.current?.canvas3d; if (!canvas) return;
      const snap = canvas.camera.getSnapshot(), offset = snap.position.map((v, i) => v - snap.target[i]);
      const next = rotateVector(offset, axis, degrees * Math.PI / 180).map((v, i) => v + snap.target[i]);
      canvas.requestCameraReset({ snapshot: { ...snap, position: next }, durationMs: 180 });
    },
    roll: (degrees = 90) => {
      const canvas = pluginRef.current?.canvas3d; if (!canvas) return;
      const snap = canvas.camera.getSnapshot();
      const viewAxis = snap.target.map((value, index) => value - snap.position[index]);
      const up = rotateAroundAxis(snap.up, viewAxis, degrees * Math.PI / 180);
      canvas.requestCameraReset({ snapshot: { ...snap, up }, durationMs: 180 });
    },
    zoom: factor => {
      const canvas = pluginRef.current?.canvas3d; if (!canvas) return;
      const snap = canvas.camera.getSnapshot();
      const position = snap.target.map((v, i) => v + (snap.position[i] - v) / factor);
      canvas.requestCameraReset({ snapshot: { ...snap, position }, durationMs: 160 });
    },
    pan: (x = 0, y = 0) => {
      const canvas = pluginRef.current?.canvas3d; if (!canvas) return;
      const snap = canvas.camera.getSnapshot(), scale = Math.max(.01, snap.radius / 650);
      const delta = [x * scale, y * scale, 0];
      canvas.requestCameraReset({ snapshot: { ...snap, position: snap.position.map((v, i) => v + delta[i]), target: snap.target.map((v, i) => v + delta[i]) }, durationMs: 160 });
    },
    png: async () => pluginRef.current?.helpers.viewportScreenshot?.getImageDataUri(),
    fullscreen: () => hostRef.current?.closest('.molstar-viewer')?.requestFullscreen?.(),
    plugin: () => pluginRef.current,
  }), []);

  return <div className="molstar-viewer" data-ready={status === 'ready'} data-engine="Mol*" data-selected={selectedResidue || ''} data-representations={Object.keys(representation).filter(key => representation[key]).join(',')}>
    <div ref={hostRef} className="molstar-viewer-host" aria-label={`Mol* scientific structure viewer${pdbId ? ` for PDB ${pdbId}` : ''}`} />
    <ViewerLoadingState status={status} message={message} onRetry={() => setRetry(value => value + 1)} />
    {status === 'ready' && <div className="molstar-viewer-badge">MOL* · {pdbId ? `PDB ${pdbId}` : label.toUpperCase()}</div>}
    {status === 'ready' && showLabels && annotations.map((item, index) => <div key={item.label || index} className={`molstar-viewer-annotation ${index ? 'is-secondary' : 'is-primary'}`}>{item.label}</div>)}
  </div>;
});
