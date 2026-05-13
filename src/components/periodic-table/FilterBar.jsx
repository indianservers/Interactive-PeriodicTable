import { RefreshCw } from 'lucide-react';
import { SearchBox } from '../common/SearchBox.jsx';

export const FilterBar = ({ filters, onSearch, onCategory, onPhase, onBlock, onReset, hasActive }) => (
  <div className="flex flex-wrap gap-2 items-center">
    <SearchBox value={filters.search} onChange={onSearch} className="flex-1 min-w-40" />
    <select
      value={filters.phase}
      onChange={e => onPhase(e.target.value)}
      className="input text-sm py-2 w-auto cursor-pointer"
      aria-label="Filter by phase"
    >
      <option value="all">All Phases</option>
      <option value="solid">Solid</option>
      <option value="liquid">Liquid</option>
      <option value="gas">Gas</option>
    </select>
    <select
      value={filters.block}
      onChange={e => onBlock(e.target.value)}
      className="input text-sm py-2 w-auto cursor-pointer"
      aria-label="Filter by block"
    >
      <option value="all">All Blocks</option>
      <option value="s">s-block</option>
      <option value="p">p-block</option>
      <option value="d">d-block</option>
      <option value="f">f-block</option>
    </select>
    {hasActive && (
      <button onClick={onReset} className="btn-secondary flex items-center gap-1.5 text-sm py-2">
        <RefreshCw size={14} />
        Reset
      </button>
    )}
  </div>
);
export default FilterBar;
