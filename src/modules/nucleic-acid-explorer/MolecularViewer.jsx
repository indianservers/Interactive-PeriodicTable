import { useCallback, useMemo, useRef } from "react";
import { Maximize2, RotateCcw } from "lucide-react";
import { MolstarViewer, ViewerErrorBoundary } from "../../components/molecular-viewer/index.js";

const representationMap = {
  "Ball & stick": { BallAndStick: true },
  Licorice: { Licorice: true },
  Backbone: { Backbone: true },
  Cartoon: { Cartoon: true },
  Surface: { Surface: true },
  "Space filling": { Spacefill: true },
};

export default function MolecularViewer({
  pdbId = "1BNA",
  source,
  sourceFormat = "mmcif",
  representation = "Ball & stick",
  compact = false,
  onReady,
  onSelection,
  focusResidue,
  focusOnSelection = false,
  orientAsHelix = false,
}) {
  const viewerRef = useRef(null);
  const viewerSource = useMemo(
    () => ({ url: source || `/assets/nucleic-acid/structures/${pdbId}.cif`, label: `${pdbId} coordinates` }),
    [pdbId, source],
  );
  const viewerRepresentation = representationMap[representation] || representationMap["Ball & stick"];
  const handleReady = useCallback((plugin, loaded) => {
    if (orientAsHelix) window.setTimeout(() => {
      const structure = loaded?.structure?.obj?.data;
      if (structure) plugin.managers.camera.orientAxes([structure], 0);
      window.setTimeout(() => viewerRef.current?.roll(90), 300);
    }, 500);
    onReady?.(plugin, loaded);
  }, [onReady, orientAsHelix]);

  return (
    <div className={`nae-molstar ${compact ? "is-compact" : ""}`}>
      <ViewerErrorBoundary>
        <MolstarViewer
          ref={viewerRef}
          source={viewerSource}
          sourceType={sourceFormat}
          label={`${pdbId} nucleic-acid structure`}
          pdbId={pdbId}
          representation={viewerRepresentation}
          colorScheme="element"
          selectedResidue={Number(focusResidue) || undefined}
          focusOnSelection={focusOnSelection}
          showLabels={false}
          onReady={handleReady}
          onSelectionChange={(selection) => onSelection?.({
            ...selection,
            residue: selection.residueName,
            residueNumber: selection.residue,
          })}
        />
      </ViewerErrorBoundary>
      <div className="nae-viewer-actions">
        <button type="button" onClick={() => viewerRef.current?.reset()} title="Reset camera">
          <RotateCcw size={16} />
        </button>
        <button type="button" onClick={() => viewerRef.current?.fullscreen()} title="Fullscreen">
          <Maximize2 size={16} />
        </button>
      </div>
    </div>
  );
}
