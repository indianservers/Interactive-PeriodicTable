import { Hash, LayoutGrid, List, Layers } from 'lucide-react';

export const TableControls = ({ compact, onToggleCompact, trendMode, onToggleTrend, jumpValue = '', onJumpValueChange, onJump, activeSyllabusTrack = 'off', onSyllabusTrackChange }) => (
  <div className="flex flex-wrap items-center gap-2">
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
    <label className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-gray-400">
      <Hash size={13} />
      <input
        value={jumpValue}
        onChange={event => onJumpValueChange?.(event.target.value.replace(/\D/g, '').slice(0, 3))}
        onKeyDown={event => {
          if (event.key === 'Enter') onJump?.();
        }}
        className="w-12 bg-transparent text-sm font-semibold text-gray-100 outline-none placeholder:text-gray-600"
        placeholder="79"
        inputMode="numeric"
        aria-label="Jump to atomic number"
      />
      <button onClick={onJump} className="rounded-lg bg-white/10 px-2 py-1 text-[10px] font-bold text-gray-200 hover:bg-white/15">
        Jump
      </button>
    </label>
    <select
      value={activeSyllabusTrack}
      onChange={event => onSyllabusTrackChange?.(event.target.value)}
      className="input h-9 w-36 rounded-xl py-1.5 text-xs"
      aria-label="Topic highlight overlay"
    >
      <option value="off">Highlight off</option>
      <option value="class10">Class 10</option>
      <option value="class11">Class 11</option>
      <option value="class12">Class 12</option>
      <option value="neet">NEET</option>
      <option value="jeeMain">JEE Main</option>
    </select>
  </div>
);
export default TableControls;
