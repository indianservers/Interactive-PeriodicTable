import { Search, X } from 'lucide-react';

export const SearchBox = ({ value, onChange, placeholder = 'Search elements…', className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="input pl-9 pr-9 text-sm"
      aria-label={placeholder}
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);
export default SearchBox;
