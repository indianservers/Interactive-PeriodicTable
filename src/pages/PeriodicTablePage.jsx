import { useState, useCallback } from 'react';
import { Atom, FlaskConical, Layers, MousePointer2, Sparkles, Zap } from 'lucide-react';
import { PeriodicTable } from '../components/periodic-table/PeriodicTable.jsx';
import { FilterBar } from '../components/periodic-table/FilterBar.jsx';
import { CategoryLegend } from '../components/periodic-table/CategoryLegend.jsx';
import { TableControls } from '../components/periodic-table/TableControls.jsx';
import { ElementDetailsDrawer } from '../components/elements/ElementDetailsDrawer.jsx';
import { TrendHeatmap, TrendExplanationCard } from '../components/visualizers/TrendHeatmap.jsx';
import { useElements } from '../hooks/useElements.js';
import { useElementFilters } from '../hooks/useElementFilters.js';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export const PeriodicTablePage = ({ favorites, onFavoriteToggle, onViewAtom, onCompare, reducedMotion }) => {
  const { elements } = useElements();
  const { filters, filtered, setSearch, setCategory, setPhase, setBlock, reset, hasActiveFilters } = useElementFilters(elements);
  const [selectedElement, setSelectedElement] = useState(null);
  const [compact, setCompact] = useLocalStorage('cu-compact', false);
  const [trendMode, setTrendMode] = useState(false);
  const [activeTrend, setActiveTrend] = useState('electronegativity');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hoveredElement, setHoveredElement] = useState(null);

  const handleSelectElement = useCallback((el) => {
    setSelectedElement(el);
    setDrawerOpen(true);
  }, []);

  const handleClose = () => {
    setDrawerOpen(false);
    setSelectedElement(null);
  };

  return (
    <div className="flex flex-col h-full periodic-page">
      <div className="flex flex-col lg:flex-row gap-0 flex-1 min-h-0">
        {/* Main table area */}
        <div className="flex-1 p-4 space-y-4 overflow-auto scrollbar-thin min-w-0">
          <div className="periodic-hero rounded-2xl border border-white/10 p-4 overflow-hidden">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-white">
                  <Atom size={22} className="text-cyan-300" />
                  <h2 className="text-xl font-black tracking-tight">Periodic Table</h2>
                </div>
                <p className="text-sm text-gray-400 mt-1 max-w-3xl">
                  Explore elements by family, phase, block, and trends. Hover to preview, click to inspect, then jump into atom view or compare elements.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  [elements.length, 'elements', Sparkles],
                  [filtered.length, 'visible', MousePointer2],
                  [trendMode ? 'On' : 'Off', 'trends', Layers],
                ].map(([value, label, Icon]) => (
                  <div key={label} className="rounded-xl bg-white/[0.055] border border-white/10 px-3 py-2 min-w-24">
                    <div className="flex items-center gap-2">
                      <Icon size={14} className="text-cyan-300" />
                      <span className="text-lg font-black text-white leading-none">{value}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid lg:grid-cols-[1fr_280px] gap-3">
              <div className="grid sm:grid-cols-3 gap-2">
                <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <FlaskConical size={14} className="text-emerald-300" />
                    Fast Learning
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Use color families first, then phase and block filters to build memory in layers.</p>
                </div>
                <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <Zap size={14} className="text-amber-300" />
                    Trend Mode
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Turn on trend colors to see atomic radius, electronegativity, and energy patterns.</p>
                </div>
                <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-300">
                    <MousePointer2 size={14} className="text-violet-300" />
                    Interactive
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">Hover previews an element; click opens deeper properties and actions.</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.055] border border-white/10 p-3 min-h-24">
                <div className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">Live Preview</div>
                {hoveredElement ? (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl border border-white/15 bg-white/10 flex items-center justify-center text-xl font-black text-white">
                      {hoveredElement.symbol}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">{hoveredElement.name}</div>
                      <div className="text-xs text-gray-500 truncate">{hoveredElement.category} · Period {hoveredElement.period} · {hoveredElement.block}-block</div>
                      <div className="text-[11px] text-gray-400 mt-1">Atomic mass: {typeof hoveredElement.atomicMass === 'number' ? hoveredElement.atomicMass.toFixed(3) : 'Unknown'}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-3">Hover any tile to preview its family, period, block, and mass.</p>
                )}
              </div>
            </div>
          </div>

          {/* Controls row */}
          <div className="flex flex-wrap items-start gap-3 justify-between glass rounded-2xl p-3">
            <FilterBar
              filters={filters}
              onSearch={setSearch}
              onCategory={setCategory}
              onPhase={setPhase}
              onBlock={setBlock}
              onReset={reset}
              hasActive={hasActiveFilters}
            />
            <TableControls
              compact={compact}
              onToggleCompact={setCompact}
              trendMode={trendMode}
              onToggleTrend={() => setTrendMode(m => !m)}
            />
          </div>

          {/* Trend controls */}
          {trendMode && (
            <div className="space-y-2">
              <TrendHeatmap activeTrend={activeTrend} onTrendChange={setActiveTrend} />
              <TrendExplanationCard activeTrend={activeTrend} />
            </div>
          )}

          {/* Category legend */}
          <CategoryLegend onFilterCategory={setCategory} activeCategory={filters.category} />

          {/* Table */}
          <PeriodicTable
            filteredElements={filtered}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            compact={compact}
            trendMode={trendMode}
            activeTrend={activeTrend}
            hoveredElement={hoveredElement}
            onHoverElement={setHoveredElement}
          />

          <p className="text-[10px] text-gray-600 text-center">
            Showing {filtered.length} of 118 elements · Click any tile to view details
          </p>
        </div>

        {/* Details drawer (desktop: right panel, tablet/mobile: modal) */}
        {drawerOpen && selectedElement && (
          <>
            {/* Desktop side panel */}
            <div className="hidden lg:flex w-80 xl:w-96 border-l border-white/10 flex-shrink-0 h-full overflow-hidden drawer-slide-in">
              <div className="w-full">
                <ElementDetailsDrawer
                  element={selectedElement}
                  onClose={handleClose}
                  onFavoriteToggle={onFavoriteToggle}
                  isFavorite={favorites.some(f => f.atomicNumber === selectedElement.atomicNumber)}
                  onViewAtom={el => { onViewAtom(el); handleClose(); }}
                  onCompare={el => { onCompare(el); handleClose(); }}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>

            {/* Mobile/tablet modal */}
            <div className="lg:hidden fixed inset-0 z-50 flex items-end">
              <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
              <div className="relative w-full bg-gray-900 rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-hidden drawer-slide-up">
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-3 mb-1" />
                <ElementDetailsDrawer
                  element={selectedElement}
                  onClose={handleClose}
                  onFavoriteToggle={onFavoriteToggle}
                  isFavorite={favorites.some(f => f.atomicNumber === selectedElement.atomicNumber)}
                  onViewAtom={el => { onViewAtom(el); handleClose(); }}
                  onCompare={el => { onCompare(el); handleClose(); }}
                  reducedMotion={reducedMotion}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default PeriodicTablePage;
