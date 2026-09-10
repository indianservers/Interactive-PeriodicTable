import { Pause, Play, RotateCcw, SkipForward } from "lucide-react";

export default function ExperimentControls({ running, started, onToggle, onStep, onReset, speed, onSpeedChange, disabled = false }) {
  return <div className="plab-experiment-controls" aria-label="Experiment playback controls">
    <button className="primary" onClick={onToggle} disabled={disabled}>{running ? <Pause /> : <Play />}{running ? "Pause" : started ? "Resume" : "Start"}</button>
    <button onClick={onStep} disabled={disabled}><SkipForward />Step</button>
    <button onClick={onReset}><RotateCcw />Reset</button>
    <label>Speed <input aria-label="Simulation speed" type="range" min="0.5" max="3" step="0.5" value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))}/><output>{speed}×</output></label>
  </div>;
}
