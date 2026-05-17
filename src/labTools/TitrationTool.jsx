import { LabToolFrame, ControlLabel } from './LabToolFrame.jsx';

export default function TitrationTool({ simTitration, simTitrationDrops, setSimTitrationDrops }) {
  return (
    <LabToolFrame title="Titration Simulator" result={`pH ${simTitration.pH.toFixed(2)} - ${simTitration.region}`}>
      <ControlLabel>NaOH drops: {simTitrationDrops}</ControlLabel>
      <input type="range" min="0" max="1000" value={simTitrationDrops} onChange={e => setSimTitrationDrops(Number(e.target.value))} className="w-full" />
      <div className="mt-4 h-36 rounded-xl border border-white/10 flex items-end overflow-hidden bg-white/[0.04]">
        <div className="w-full transition-all" style={{ height: `${Math.min(100, 25 + simTitrationDrops / 10)}%`, background: simTitration.pH < 7 ? '#ef4444' : simTitration.pH < 9 ? '#22c55e' : '#ec4899' }} />
      </div>
    </LabToolFrame>
  );
}
