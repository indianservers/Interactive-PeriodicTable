import { Heart, X, Atom } from 'lucide-react';
import { getCategoryInfo } from '../data/categories.js';
import { EmptyState } from '../components/common/EmptyState.jsx';

export const FavoritesPage = ({ favorites, onRemove, onSelectElement }) => {
  if (favorites.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-lg font-bold text-white mb-6">Favorites</h2>
        <EmptyState
          icon="💛"
          title="No favorites yet"
          description="Click the heart icon on any element to save it here for quick access."
          action={null}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Favorites</h2>
        <span className="text-sm text-gray-400">{favorites.length} element{favorites.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {favorites.map(el => {
          const catInfo = getCategoryInfo(el.category);
          return (
            <div
              key={el.atomicNumber}
              className="glass rounded-2xl p-4 relative group border border-white/5 hover:border-white/15 transition-all"
            >
              <button
                onClick={() => onRemove(el)}
                className="absolute top-2 right-2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all"
                aria-label={`Remove ${el.name} from favorites`}
              >
                <X size={12} />
              </button>
              <button
                onClick={() => onSelectElement(el)}
                className="w-full text-left"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black mb-2 border mx-auto"
                  style={{ backgroundColor: `${catInfo.color}20`, borderColor: `${catInfo.color}40`, color: catInfo.color }}
                >
                  {el.symbol}
                </div>
                <p className="text-xs font-semibold text-white text-center">{el.name}</p>
                <p className="text-[10px] text-gray-500 text-center">#{el.atomicNumber}</p>
                <div className="mt-2 text-center">
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: `${catInfo.color}20`, color: catInfo.color }}
                  >
                    {el.category}
                  </span>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FavoritesPage;
