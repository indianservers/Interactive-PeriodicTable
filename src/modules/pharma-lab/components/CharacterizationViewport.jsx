import { useMemo } from "react";

export default function CharacterizationViewport({ polymorph, running, rotation, instrument, humidity }) {
  const atoms = useMemo(() => Array.from({ length: 18 }, (_, index) => ({
    x: 18 + (index % 6) * 15 + (Math.floor(index / 6) % 2) * 5,
    y: 21 + Math.floor(index / 6) * 27 + (index % 2) * 5,
    r: index % 4 === 0 ? 4.2 : index % 3 === 0 ? 3.3 : 2.7,
  })), []);
  return <div className={`plab-character-stage ${running ? "running" : ""}`} style={{ "--crystal-rotation": `${rotation}deg` }}>
    <div className="plab-instrument-bench">
      <div className="plab-machine plab-dvs-machine"><b>DVS</b><span>{humidity}% RH</span><i /></div>
      <div className="plab-machine plab-dsc-machine"><b>DSC</b><span>{instrument === "DSC" && running ? "SCANNING" : "READY"}</span><i /></div>
      <div className="plab-microscope"><i/><i/><b>POLARIZED</b></div>
      <div className="plab-sample-dish"><span>API</span></div>
    </div>
    <section className="plab-crystal-monitor" aria-label={`${polymorph} crystal structure model`}>
      <div className="plab-monitor-head"><b>CRYSTAL STRUCTURE · 3D</b><span>{polymorph}</span></div>
      <svg viewBox="0 0 110 100" role="img" aria-label="Interactive representative paracetamol crystal lattice">
        <g className="crystal-cage"><path d="M18 18 85 10 99 71 31 86Z M18 18 31 86 M85 10 99 71 M31 86 99 71"/><path d="M18 18 54 36 85 10 M54 36 99 71 M54 36 31 86"/></g>
        <g className="crystal-atoms">{atoms.map((atom,index)=><circle key={index} cx={atom.x} cy={atom.y} r={atom.r} fill={index%4===0?"#ef4444":index%3===0?"#3b82f6":"#dbeafe"}/>)}</g>
      </svg>
      <small>Drag control below to rotate · representative packing view</small>
    </section>
    <div className="plab-stage-labels"><span>DYNAMIC VAPOR SORPTION</span><span>DSC AUTOSAMPLER</span><span>POLARIZED-LIGHT MICROSCOPE</span></div>
  </div>;
}
