import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import MolstarViewer from '../../components/molecular-viewer/MolstarViewer.jsx';
import ViewerErrorBoundary from '../../components/molecular-viewer/ViewerErrorBoundary.jsx';

function parseSdfAtomMap(sdf) {
  const lines = sdf.split(/\r?\n/);
  const count = Number.parseInt(lines[3]?.slice(0, 3), 10) || 0;
  const elements = lines.slice(4, 4 + count).map(line => line.slice(31, 34).trim().toUpperCase());
  return { elements, carbonSourceIndices: elements.flatMap((element, index) => element === 'C' ? [index] : []) };
}

export default forwardRef(function CarbohydrateViewer({ compound, representation = 'Ball & stick', hydrogens = true, labels = false, carbonLabels = false, selectedCarbon = null, onSelectCarbon, onHoverCarbon, className = '' }, ref) {
  const viewerRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [atomMap, setAtomMap] = useState({ elements: [], carbonSourceIndices: [] });
  const [selectedAtom, setSelectedAtom] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetch(compound.source).then(response => {
      if (!response.ok) throw new Error(`Unable to load ${compound.name}`);
      return response.text();
    }).then(sdf => { if (!cancelled) setAtomMap(parseSdfAtomMap(sdf)); })
      .catch(() => { if (!cancelled) setAtomMap({ elements: [], carbonSourceIndices: [] }); });
    return () => { cancelled = true; };
  }, [compound]);
  const selectedAtomIndex = Number.isFinite(selectedCarbon) ? atomMap.carbonSourceIndices[selectedCarbon - 1] : undefined;
  const representationState = useMemo(() => ({
    BallAndStick: representation === 'Ball & stick',
    Spacefill: representation === 'Space filling',
    Sticks: representation === 'Sticks',
    Ligand: false,
    Branched: false,
    Ion: false,
  }), [representation]);
  useEffect(() => { setStatus('loading'); setSelectedAtom(null); }, [compound]);
  const inspectAtom = atom => {
    setSelectedAtom(atom);
    if (atom?.element?.toUpperCase() === 'C') {
      const carbon = atomMap.carbonSourceIndices.indexOf(atom.sourceIndex) + 1;
      if (carbon > 0) { onSelectCarbon?.(carbon); onHoverCarbon?.(carbon); }
    }
  };
  return <div className={`cs-viewer ${className}`} data-status={status} data-engine="Mol*" data-selected-carbon={selectedCarbon || ''}>
    <ViewerErrorBoundary label={`${compound.name} carbohydrate viewer`}>
      <MolstarViewer
        ref={node => { viewerRef.current = node; if (typeof ref === 'function') ref(node); else if (ref) ref.current = node; }}
        source={{ url: compound.source, format: compound.sourceType, label: `${compound.name} PubChem conformer` }}
        sourceType={compound.sourceType}
        label={`${compound.name} PubChem CID ${compound.cid}`}
        representation={representationState}
        colorScheme="element"
        selectedAtomIndex={selectedAtomIndex}
        focusOnSelection={false}
        showHydrogens={hydrogens}
        showLabels={false}
        onReady={() => { setStatus('ready'); requestAnimationFrame(() => viewerRef.current?.zoom(compound.classification.startsWith('Polysaccharide') ? 1.15 : 1.35)); }}
        onLoadError={() => setStatus('error')}
        onSelectionChange={inspectAtom}
      />
    </ViewerErrorBoundary>
    {carbonLabels && <div className="cs-carbon-labels" aria-label="Carbon atom numbering">{atomMap.carbonSourceIndices.map((sourceIndex, index) => <button key={sourceIndex} className={selectedCarbon === index + 1 ? 'is-active' : ''} aria-label={`Select carbon C${index + 1}`} onClick={() => onSelectCarbon?.(index + 1)}>{compound.classification === 'Disaccharide' ? `${index < 6 ? 'A' : 'B'}C${index % 6 + 1}` : `C${index + 1}`}</button>)}</div>}
    {labels && <div className="cs-atom-readout">{selectedAtom ? `${selectedAtom.element} · atom ${selectedAtom.sourceIndex + 1} · [${selectedAtom.coordinates.map(value => value.toFixed(2)).join(', ')}] Å` : 'Click any atom for its element and coordinates'}</div>}
    <div className="cs-source-badge">MOL* · PUBCHEM CID {compound.cid} · 3D CONFORMER</div>
  </div>;
});
