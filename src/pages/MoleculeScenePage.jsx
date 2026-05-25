import { MoleculeScene } from '../components/visualizers/MoleculeScene.jsx';
import { VisualizationToolbar } from '../components/common/VisualizationToolbar.jsx';

export const MoleculeScenePage = () => (
  <div className="page-transition p-4 md:p-6 max-w-7xl mx-auto space-y-3">
    <VisualizationToolbar
      targetSelector="canvas"
      title="molecule-scene"
      extra={<span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-200">Advanced · 8 min</span>}
    />
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-3 flex flex-wrap gap-1">
        <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-200">x-axis: horizontal</span>
        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-200">y-axis: vertical</span>
        <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-[11px] text-violet-200">z-axis: depth</span>
      </div>
    </div>
    <MoleculeScene height={560} />
  </div>
);

export default MoleculeScenePage;
