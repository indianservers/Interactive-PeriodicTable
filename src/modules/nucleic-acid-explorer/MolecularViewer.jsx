import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  orientAsHelix = /^(1BNA|1ANA|4OCB|1D66|143D|1AAY)$/i.test(pdbId),
}) {
  const viewerRef = useRef(null);
  const [framed,setFramed]=useState(false);useEffect(()=>setFramed(false),[pdbId,source]);
  const viewerSource = useMemo(
    () => ({ url: source || `/assets/nucleic-acid/structures/${pdbId}.cif`, label: `${pdbId} coordinates` }),
    [pdbId, source],
  );
  const viewerRepresentation = representationMap[representation] || representationMap["Ball & stick"];
  const handleReady = useCallback((plugin, loaded) => {
    if (orientAsHelix) {
      const structure=loaded?.structure?.obj?.data, canvas=plugin.canvas3d;
      if(structure&&canvas){
        const points=[],tmp=[0,0,0];for(const unit of structure.units){if(unit.kind!==0)continue;for(const element of unit.elements){unit.conformation.position(element,tmp);points.push([...tmp]);}}
        if(points.length){const center=[0,0,0];points.forEach(p=>p.forEach((v,i)=>center[i]+=v/points.length));const covariance=Array.from({length:3},()=>[0,0,0]);let radius=0;points.forEach(p=>{const d=p.map((v,i)=>v-center[i]);radius=Math.max(radius,Math.hypot(...d));for(let i=0;i<3;i++)for(let j=0;j<3;j++)covariance[i][j]+=d[i]*d[j]});let axis=[.3,.5,.8];for(let n=0;n<32;n++){const next=covariance.map(row=>row.reduce((sum,v,i)=>sum+v*axis[i],0)),norm=Math.hypot(...next)||1;axis=next.map(v=>v/norm)}if(axis[1]<0)axis=axis.map(v=>-v);const reference=Math.abs(axis[2])<.85?[0,0,1]:[0,1,0],direction=[axis[1]*reference[2]-axis[2]*reference[1],axis[2]*reference[0]-axis[0]*reference[2],axis[0]*reference[1]-axis[1]*reference[0]],length=Math.hypot(...direction)||1;canvas.requestCameraReset({snapshot:canvas.camera.getFocus(center,radius*.85,axis,direction.map(v=>v/length)),durationMs:0});}
      }
    }
    if(sourceFormat==='sdf')window.setTimeout(()=>viewerRef.current?.zoom(1.5),100);
    setFramed(true);onReady?.(plugin, loaded);
  }, [onReady, orientAsHelix, sourceFormat]);

  return (
    <div className={`nae-molstar ${compact ? "is-compact" : ""}`} data-framed={framed}>
      <ViewerErrorBoundary>
        <MolstarViewer
          ref={viewerRef}
          source={viewerSource}
          sourceType={sourceFormat}
          label={`${pdbId} nucleic-acid structure`}
          pdbId={pdbId}
          representation={viewerRepresentation}
          colorScheme="element"
          surfaceOpacity={0.82}
          surfaceColor={0x9ca9b9}
          surfaceProteinOnly={pdbId==='6ALH'}
          polymerOnly={sourceFormat!=='sdf'}
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
