import { useMemo, useRef, useState } from "react";
import { Maximize2, RotateCcw } from "lucide-react";
import MolstarViewer from "../../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../../components/molecular-viewer/ViewerErrorBoundary.jsx";
import { INTERACTIVE_STRUCTURES, POLARITY_STRUCTURES } from "./labStructures.js";

export default function LabMoleculeStage({
  moleculeId,
  structureId,
  source,
  label,
  representation = "BallAndStick",
}) {
  const viewerRef = useRef(null);
  const [style, setStyle] = useState(representation);
  const resolved = source
    || POLARITY_STRUCTURES[moleculeId]
    || INTERACTIVE_STRUCTURES[structureId];
  const reps = useMemo(() => ({
    BallAndStick: style === "BallAndStick",
    Spacefill: style === "Spacefill",
    Sticks: style === "Sticks",
  }), [style]);
  if (!resolved) return null;
  return (
    <div className="lab-mol-stage">
      <ViewerErrorBoundary label={label || resolved.label}>
        <MolstarViewer
          ref={viewerRef}
          source={resolved}
          sourceType={resolved.format}
          label={label || resolved.label}
          representation={reps}
          colorScheme="element"
          showLabels={false}
          showHydrogens
        />
      </ViewerErrorBoundary>
      <div className="lab-mol-tools">
        {["BallAndStick", "Sticks", "Spacefill"].map((item) => (
          <button key={item} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>
            {item === "BallAndStick" ? "Ball + stick" : item}
          </button>
        ))}
        <button onClick={() => viewerRef.current?.reset()} aria-label="Reset camera"><RotateCcw /></button>
        <button onClick={() => viewerRef.current?.fullscreen()} aria-label="Fullscreen structure"><Maximize2 /></button>
      </div>
    </div>
  );
}
