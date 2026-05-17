import { LabToolFrame, MiniBar, ControlLabel } from './LabToolFrame.jsx';

export default function PhMeterTool({ probeSolution, setProbeSolution, probePh }) {
  return (
    <LabToolFrame title="pH Meter" result={`${probeSolution} is ${probePh < 7 ? 'acidic' : probePh > 7 ? 'basic' : 'neutral'}.`}>
      <ControlLabel>Test solution</ControlLabel>
      <select value={probeSolution} onChange={e => setProbeSolution(e.target.value)} className="input text-sm mb-4">
        {['water', 'vinegar', 'ammonia', 'cola', 'soap'].map(s => <option key={s}>{s}</option>)}
      </select>
      <div className="text-5xl font-black text-white">pH {probePh.toFixed(1)}</div>
      <MiniBar label="acid to base" value={(probePh / 14) * 100} color={probePh < 7 ? '#ef4444' : probePh > 7 ? '#3b82f6' : '#22c55e'} />
    </LabToolFrame>
  );
}
