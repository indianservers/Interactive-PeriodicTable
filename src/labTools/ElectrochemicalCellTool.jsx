import { LabToolFrame, ControlLabel } from './LabToolFrame.jsx';
import { halfReactions } from '../utils/chemistryTools.js';

export default function ElectrochemicalCellTool({ activeExperiment, corrosion, anodeHalf, cathodeHalf, setAnodeHalf, setCathodeHalf, cellMode, setCellMode, electrochemicalCell }) {
  return (
    <LabToolFrame title={activeExperiment.title} result={activeExperiment.id === 'corrosion' ? `${corrosion} corrodes preferentially in this pair.` : `EMF is ${electrochemicalCell.emf.toFixed(2)} V.`}>
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div><ControlLabel>Anode oxidation partner</ControlLabel><select value={anodeHalf} onChange={e => setAnodeHalf(e.target.value)} className="input text-sm">{Object.keys(halfReactions).map(x => <option key={x}>{x}</option>)}</select></div>
        <div><ControlLabel>Cathode reduction</ControlLabel><select value={cathodeHalf} onChange={e => setCathodeHalf(e.target.value)} className="input text-sm">{Object.keys(halfReactions).map(x => <option key={x}>{x}</option>)}</select></div>
      </div>
      <select value={cellMode} onChange={e => setCellMode(e.target.value)} className="input text-sm mb-4">
        <option value="galvanic">Galvanic</option>
        <option value="electrolytic">Electrolytic</option>
      </select>
      <div className="h-36 rounded-xl bg-black/20 border border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
        <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">{anodeHalf}<br /><span className="text-[10px] text-gray-500">anode</span></span>
        <span className="text-cyan-300 font-mono text-xl">{electrochemicalCell.emf.toFixed(2)} V</span>
        <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">{cathodeHalf}<br /><span className="text-[10px] text-gray-500">cathode</span></span>
      </div>
      <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-gray-300">
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">Anode: {electrochemicalCell.anode.species}</div>
        <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">Cathode: {electrochemicalCell.cathode.species}</div>
      </div>
      <p className="mt-2 text-xs text-gray-400">Cell diagram: <span className="font-mono text-gray-200">{electrochemicalCell.cellDiagram}</span></p>
      <p className={`mt-1 text-xs ${electrochemicalCell.spontaneous ? 'text-emerald-300' : 'text-amber-300'}`}>{electrochemicalCell.spontaneous ? 'Spontaneous under selected mode.' : 'Requires external energy in selected mode.'}</p>
    </LabToolFrame>
  );
}
