import { FlaskConical } from 'lucide-react';

export const LabToolFrame = ({ title, result, children }) => (
  <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
    <div className="flex items-center gap-2 mb-3">
      <FlaskConical size={16} className="text-emerald-300" />
      <h4 className="text-sm font-black text-white">{title}</h4>
      <span className="ml-auto text-[10px] text-cyan-300 border border-cyan-500/25 bg-cyan-500/10 rounded-full px-2 py-0.5">
        Lazy Tool
      </span>
    </div>
    {children}
    {result && (
      <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm text-emerald-100">
        {result}
      </div>
    )}
  </div>
);

export const ControlLabel = ({ children }) => (
  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">{children}</label>
);

export const MiniBar = ({ label, value, color = '#38bdf8' }) => (
  <div>
    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
      <span>{label}</span><span>{Number(value).toFixed(2)}</span>
    </div>
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, value)}%`, background: color }} />
    </div>
  </div>
);
