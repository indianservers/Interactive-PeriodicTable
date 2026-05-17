import { useState } from 'react';
import { TrendHeatmap, TrendExplanationCard } from '../components/visualizers/TrendHeatmap.jsx';
import { PeriodicTable } from '../components/periodic-table/PeriodicTable.jsx';
import { ElementDetailsDrawer } from '../components/elements/ElementDetailsDrawer.jsx';
import { useElements } from '../hooks/useElements.js';
import { VisualizationToolbar } from '../components/common/VisualizationToolbar.jsx';

export const TrendsPage = ({ favorites, onFavoriteToggle, onViewAtom, onCompare, reducedMotion }) => {
  const { elements } = useElements();
  const [activeTrend, setActiveTrend] = useState('electronegativity');
  const [selectedElement, setSelectedElement] = useState(null);

  return (
    <div className="page-transition p-4 md:p-6 space-y-4 max-w-full">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Periodic Trends</h2>
        <p className="text-sm text-gray-400">Select a property to visualize it as a heatmap across all elements.</p>
      </div>

      <div className="glass rounded-2xl p-4 space-y-3">
        <VisualizationToolbar
          targetSelector="main svg"
          title={`trend-${activeTrend}`}
          extra={
            <>
              <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-200">Intermediate · 5 min</span>
              <span className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-xs text-gray-200">Approximate values</span>
            </>
          }
        />
        <TrendHeatmap activeTrend={activeTrend} onTrendChange={setActiveTrend} />
        <div className="flex flex-wrap gap-1 text-[11px]">
          <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-1 text-cyan-200">x-axis: group</span>
          <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-emerald-200">y-axis: period</span>
          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-amber-200">color: property value</span>
        </div>
        <TrendExplanationCard activeTrend={activeTrend} />
      </div>

      {elements.length > 0 ? (
        <PeriodicTable
          filteredElements={elements}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
          compact={false}
          trendMode={true}
          activeTrend={activeTrend}
        />
      ) : (
        <div className="glass rounded-2xl p-8 text-center">
          <div className="skeleton mx-auto h-10 w-48 rounded-xl" />
          <p className="mt-4 text-sm text-gray-400">Loading trend table...</p>
        </div>
      )}

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
