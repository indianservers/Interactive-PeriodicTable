import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { categories } from '../../data/categories.js';

export const CategoryLegend = ({ onFilterCategory, activeCategory }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="glass rounded-xl p-3">
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center justify-between w-full text-sm font-medium text-gray-300 mb-2"
      >
        <span>Category Legend</span>
        {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
      {!collapsed && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onFilterCategory(activeCategory === cat.id ? 'all' : cat.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs border transition-all ${
                activeCategory === cat.id
                  ? 'bg-white/15 border-white/20 text-white'
                  : 'border-white/5 hover:border-white/15 text-gray-400 hover:text-gray-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default CategoryLegend;
