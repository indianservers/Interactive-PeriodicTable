import { LabToolFrame, ControlLabel } from './LabToolFrame.jsx';
import { standardFormationEnthalpies } from '../utils/chemistryTools.js';

export default function HessTool({ hessEquation, setHessEquation, hessResult }) {
  return (
    <LabToolFrame title="Reaction Enthalpy" result={hessResult.ok ? `Delta H = ${hessResult.deltaH.toFixed(1)} kJ` : hessResult.error}>
      <ControlLabel>Balanced or unbalanced equation</ControlLabel>
      <input value={hessEquation} onChange={e => setHessEquation(e.target.value)} className="input text-sm font-mono mb-3" />
      {hessResult.ok ? (
        <>
          <p className="text-xs text-gray-300 mb-3">Balanced: <span className="font-mono text-cyan-200">{hessResult.balanced}</span></p>
          <div className="grid sm:grid-cols-3 gap-2 mb-4">
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Reactants</p><p className="text-lg font-black text-white">{hessResult.reactants.toFixed(1)}</p></div>
            <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3"><p className="text-[10px] text-gray-500">Products</p><p className="text-lg font-black text-white">{hessResult.products.toFixed(1)}</p></div>
            <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3"><p className="text-[10px] text-cyan-300">Delta H</p><p className="text-lg font-black text-white">{hessResult.deltaH.toFixed(1)} kJ</p></div>
          </div>
          <svg viewBox="0 0 260 120" className="w-full h-40 rounded-xl bg-black/20 border border-white/10">
            <line x1="30" y1={hessResult.deltaH < 0 ? 35 : 85} x2="105" y2={hessResult.deltaH < 0 ? 35 : 85} stroke="#38bdf8" strokeWidth="4" />
            <line x1="155" y1={hessResult.deltaH < 0 ? 85 : 35} x2="230" y2={hessResult.deltaH < 0 ? 85 : 35} stroke="#34d399" strokeWidth="4" />
            <path d={`M105 ${hessResult.deltaH < 0 ? 35 : 85} C125 15, 135 15, 155 ${hessResult.deltaH < 0 ? 85 : 35}`} fill="none" stroke="#f59e0b" strokeWidth="3" />
            <text x="30" y="108" fill="#94a3b8" fontSize="10">Reactants</text>
            <text x="170" y="108" fill="#94a3b8" fontSize="10">Products</text>
          </svg>
        </>
      ) : (
        <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-xs text-amber-100">
          {hessResult.error}. Loaded values include {Object.keys(standardFormationEnthalpies).slice(0, 10).join(', ')} and more.
        </div>
      )}
    </LabToolFrame>
  );
}
