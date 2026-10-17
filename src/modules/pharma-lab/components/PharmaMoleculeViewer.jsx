import { useEffect, useRef, useState } from "react";
import { Box, Maximize2, Pause, Play, Rotate3D, SkipForward, ZoomIn, ZoomOut } from "lucide-react";
import MolstarViewer from "../../../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../../../components/molecular-viewer/ViewerErrorBoundary.jsx";

function Molecule2D({compound}) {
 return <div className="plab-2d"><img src={`/assets/pharma/${compound.id}-2d.png`} alt={`${compound.name}: PubChem CID ${compound.cid} molecular connectivity`} style={{maxWidth:'95%',maxHeight:'100%',background:'white',borderRadius:8}}/></div>;
}

export default function PharmaMoleculeViewer({ compound, reducedMotion, initialMode = "3D" }) {
  const viewerRef = useRef(null);
  const timerRef = useRef(null);
  const [mode, setMode] = useState(initialMode);
  const [style, setStyle] = useState("BallAndStick");
  const [running, setRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [selection, setSelection] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    window.clearInterval(timerRef.current);
    if (running && mode === "3D" && !reducedMotion) timerRef.current = window.setInterval(() => viewerRef.current?.rotate("y", 3 * speed), 55);
    return () => window.clearInterval(timerRef.current);
  }, [running, speed, mode, reducedMotion]);
  useEffect(() => { setReady(false); setSelection(null); }, [compound.id]);
  const representation = { BallAndStick: style === "BallAndStick", Spacefill: style === "Spacefill", Sticks: style === "Sticks" };
  return (
    <div className="plab-molecule-stage">
      <div className="plab-view-tabs"><button className={mode === "3D" ? "active" : ""} onClick={() => setMode("3D")}><Box size={14}/> 3D</button><button className={mode === "2D" ? "active" : ""} onClick={() => setMode("2D")}>2D structure</button></div>
      <div className="plab-molecule-canvas">
        {mode === "3D" ? <ViewerErrorBoundary label={`${compound.name} molecular structure`}><MolstarViewer ref={viewerRef} source={{ url: compound.sdf, format: "sdf" }} sourceType="sdf" label={`${compound.name} · PubChem CID ${compound.cid}`} representation={representation} colorScheme="element" showLabels={false} onReady={() => { setReady(true); requestAnimationFrame(() => viewerRef.current?.zoom(1.45)); }} onSelectionChange={setSelection} /></ViewerErrorBoundary> : <Molecule2D compound={compound} />}
        <div className="plab-molecule-name"><span style={{ background: compound.color }} /> <strong>{compound.name}</strong><small>{mode === "2D" ? "PubChem 2D depiction" : ready ? "coordinate model ready" : "loading coordinates…"}</small></div>
        {selection && <div className="plab-atom-readout"><b>{selection.element} · {selection.atom}</b><span>{selection.coordinates.map((value) => value.toFixed(2)).join(", ")} Å</span></div>}
      </div>
      <div className="plab-view-controls">
        <div>{["BallAndStick", "Spacefill", "Sticks"].map((item) => <button key={item} disabled={mode === "2D"} className={style === item ? "active" : ""} onClick={() => setStyle(item)}>{item === "BallAndStick" ? "Ball + stick" : item}</button>)}</div>
        <div><button onClick={() => { setHasStarted(true); setRunning(!running); }} disabled={mode === "2D"}>{running ? <Pause size={14}/> : <Play size={14}/>} {running ? "Pause" : hasStarted ? "Resume" : "Start"}</button><button onClick={() => viewerRef.current?.rotate("y", 18)} disabled={mode === "2D"} title="Step rotation"><SkipForward size={14}/></button><button onClick={() => viewerRef.current?.rotate("x", 18)} disabled={mode === "2D"} title="Rotate on x axis"><Rotate3D size={14}/></button><button onClick={() => viewerRef.current?.zoom(1.18)} disabled={mode === "2D"} title="Zoom in"><ZoomIn size={14}/></button><button onClick={() => viewerRef.current?.zoom(.84)} disabled={mode === "2D"} title="Zoom out"><ZoomOut size={14}/></button><button onClick={() => viewerRef.current?.fullscreen()} disabled={mode === "2D"} title="Fullscreen"><Maximize2 size={14}/></button></div>
        <label>Speed <input type="range" min="0.5" max="2" step="0.5" value={speed} onChange={(e) => setSpeed(+e.target.value)} /> {speed}×</label>
      </div>
    </div>
  );
}
