import { LabToolFrame, ControlLabel } from './LabToolFrame.jsx';

export default function GasLawTool({ gasP, gasV, gasT, setGasP, setGasV, setGasT, gasN }) {
  return (
    <LabToolFrame title="Ideal Gas Law Calculator" result={`n = ${gasN.toFixed(3)} mol`}>
      <div className="grid sm:grid-cols-3 gap-3">
        <div><ControlLabel>P atm</ControlLabel><input type="number" value={gasP} onChange={e => setGasP(Number(e.target.value))} className="input text-sm" /></div>
        <div><ControlLabel>V L</ControlLabel><input type="number" value={gasV} onChange={e => setGasV(Number(e.target.value))} className="input text-sm" /></div>
        <div><ControlLabel>T K</ControlLabel><input type="number" value={gasT} onChange={e => setGasT(Number(e.target.value))} className="input text-sm" /></div>
      </div>
    </LabToolFrame>
  );
}
