import { LayoutGrid, List, Layers } from 'lucide-react';

export const TableControls = ({ compact, onToggleCompact, trendMode, onToggleTrend }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-1 glass rounded-xl p-1">
      <button
        onClick={() => onToggleCompact(false)}
        className={`p-1.5 rounded-lg transition-colors ${!compact ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        aria-label="Detailed view"
        title="Detailed tile view"
      >
        <LayoutGrid size={15} />
      </button>
      <button
        onClick={() => onToggleCompact(true)}
        className={`p-1.5 rounded-lg transition-colors ${compact ? 'bg-white/15 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        aria-label="Compact view"
        title="Compact tile view"
      >
        <List size={15} />
      </button>
    </div>
    <button
      onClick={onToggleTrend}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
        trendMode
          ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
          : 'glass border-white/10 text-gray-400 hover:text-gray-200'
      }`}
      aria-label="Toggle trend color mode"
    >
      <Layers size={14} />
      Trend Colors
    </button>
  </div>
);
export default TableControls;
