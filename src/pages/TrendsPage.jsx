import { useState } from 'react';
import { TrendHeatmap, TrendExplanationCard } from '../components/visualizers/TrendHeatmap.jsx';
import { PeriodicTable } from '../components/periodic-table/PeriodicTable.jsx';
import { ElementDetailsDrawer } from '../components/elements/ElementDetailsDrawer.jsx';
import { useElements } from '../hooks/useElements.js';

export const TrendsPage = ({ favorites, onFavoriteToggle, onViewAtom, onCompare, reducedMotion }) => {
  const { elements } = useElements();
  const [activeTrend, setActiveTrend] = useState('electronegativity');
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-full">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Periodic Trends</h2>
        <p className="text-sm text-gray-400">Select a property to visualize it as a heatmap across all elements.</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <TrendHeatmap activeTrend={activeTrend} onTrendChange={setActiveTrend} />
        <TrendExplanationCard activeTrend={activeTrend} />
      </div>

      <PeriodicTable
        filteredElements={elements}
        selectedElement={selectedElement}
        onSelectElement={setSelectedElement}
        compact={false}
        trendMode={true}
        activeTrend={activeTrend}
      />

      {selectedElement && (
        <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedElement(null)} />
          <div className="relative w-full lg:max-w-md bg-gray-900 rounded-t-3xl lg:rounded-2xl border border-white/10 max-h-[85vh] overflow-hidden">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1 lg:hidden" />
            <ElementDetailsDrawer
              element={selectedElement}
              onClose={() => setSelectedElement(null)}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={favorites.some(f => f.atomicNumber === selectedElement.atomicNumber)}
              onViewAtom={el => { onViewAtom(el); setSelectedElement(null); }}
              onCompare={el => { onCompare(el); setSelectedElement(null); }}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default TrendsPage;
