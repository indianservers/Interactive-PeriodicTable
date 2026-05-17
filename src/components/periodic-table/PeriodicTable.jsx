import { useMemo } from 'react';
import { ElementTile } from './ElementTile.jsx';
import { elements } from '../../data/elements.js';
import { normalizeTrendValue, getTrendMinMax } from '../../utils/elementHelpers.js';
import { interpolateColor } from '../../utils/colorScales.js';
import { trends } from '../../data/trends.js';

export const PeriodicTable = ({
  filteredElements,
  selectedElement,
  onSelectElement,
  compact,
  trendMode,
  activeTrend,
  hoveredElement,
  onHoverElement,
}) => {
  const isFiltered = filteredElements.length < elements.length;
  const filteredSet = useMemo(() => new Set(filteredElements.map(e => e.atomicNumber)), [filteredElements]);

  const { min, max, trendInfo } = useMemo(() => {
    if (!trendMode || !activeTrend) return { min: 0, max: 1, trendInfo: null };
    const info = trends.find(t => t.id === activeTrend);
    const { min, max } = getTrendMinMax(elements, activeTrend);
    return { min, max, trendInfo: info };
  }, [trendMode, activeTrend]);

  const getTrendColor = (el) => {
    if (!trendMode || !activeTrend || !trendInfo) return null;
    const val = el[activeTrend];
    const ratio = normalizeTrendValue(val, min, max);
    if (ratio === null) return '#1f2937';
    return interpolateColor(ratio, trendInfo.colorFrom, trendInfo.colorTo);
  };

  const tileSize = compact ? 'h-8 w-8' : 'h-16 w-16';

  const mainTableElements = elements.filter(e => e.ypos <= 7 && !(e.ypos >= 6 && e.xpos >= 3 && e.xpos <= 17 && (e.atomicNumber >= 57 && e.atomicNumber <= 71 || e.atomicNumber >= 89 && e.atomicNumber <= 103)));
  const lanthanides = elements.filter(e => e.atomicNumber >= 57 && e.atomicNumber <= 71);
  const actinides = elements.filter(e => e.atomicNumber >= 89 && e.atomicNumber <= 103);
  const visibleElementSet = useMemo(() => new Set((isFiltered ? filteredElements : elements).map(e => e.atomicNumber)), [filteredElements, isFiltered]);
  const keyboardGrid = useMemo(() => {
    const rows = new Map();
    elements.forEach(el => {
      if (!visibleElementSet.has(el.atomicNumber)) return;
      const row = el.atomicNumber >= 57 && el.atomicNumber <= 71 ? 8 : el.atomicNumber >= 89 && el.atomicNumber <= 103 ? 9 : el.ypos;
      const col = el.atomicNumber >= 57 && el.atomicNumber <= 71 ? el.atomicNumber - 54 : el.atomicNumber >= 89 && el.atomicNumber <= 103 ? el.atomicNumber - 86 : el.xpos;
      if (!rows.has(row)) rows.set(row, []);
      rows.get(row).push({ el, row, col });
    });
    rows.forEach(items => items.sort((a, b) => a.col - b.col));
    return rows;
  }, [visibleElementSet]);

  const handleKeyboardNavigate = (event, element) => {
    const keys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const row = element.atomicNumber >= 57 && element.atomicNumber <= 71 ? 8 : element.atomicNumber >= 89 && element.atomicNumber <= 103 ? 9 : element.ypos;
    const col = element.atomicNumber >= 57 && element.atomicNumber <= 71 ? element.atomicNumber - 54 : element.atomicNumber >= 89 && element.atomicNumber <= 103 ? element.atomicNumber - 86 : element.xpos;
    const currentRow = keyboardGrid.get(row) || [];
    const currentIndex = currentRow.findIndex(item => item.el.atomicNumber === element.atomicNumber);
    let next = null;
    if (event.key === 'ArrowRight') next = currentRow[Math.min(currentRow.length - 1, currentIndex + 1)];
    if (event.key === 'ArrowLeft') next = currentRow[Math.max(0, currentIndex - 1)];
    if (event.key === 'Home') next = currentRow[0];
    if (event.key === 'End') next = currentRow[currentRow.length - 1];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const rowNumbers = [...keyboardGrid.keys()].sort((a, b) => a - b);
      const start = rowNumbers.indexOf(row);
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      for (let i = start + direction; i >= 0 && i < rowNumbers.length; i += direction) {
        const candidates = keyboardGrid.get(rowNumbers[i]) || [];
        if (candidates.length) {
          next = candidates.reduce((best, item) => Math.abs(item.col - col) < Math.abs(best.col - col) ? item : best, candidates[0]);
          break;
        }
      }
    }
    if (next) {
      document.querySelector(`[data-atomic-number="${next.el.atomicNumber}"]`)?.focus();
      onHoverElement?.(next.el);
    }
  };

  const renderGridSlot = (xpos, ypos) => {
    const el = mainTableElements.find(e => e.xpos === xpos && e.ypos === ypos);
    if (!el) return <div key={`empty-${xpos}-${ypos}`} className={tileSize} />;
    return (
      <div key={el.atomicNumber} className={tileSize}>
        <ElementTile
          element={el}
          isSelected={selectedElement?.atomicNumber === el.atomicNumber}
          isHovered={hoveredElement?.atomicNumber === el.atomicNumber}
          isFiltered={!isFiltered || filteredSet.has(el.atomicNumber)}
          compact={compact}
          trendColor={getTrendColor(el)}
          onClick={onSelectElement}
          onHover={onHoverElement}
          onNavigate={handleKeyboardNavigate}
        />
      </div>
    );
  };

  return (
    <div className="overflow-x-auto scrollbar-thin pb-3 rounded-2xl periodic-table-wrap">
      <div className="inline-block min-w-max p-3">
        {/* Group numbers header */}
        <div className="flex gap-1 mb-1">
          <div className={`${tileSize} flex items-center justify-center`}>
            <span className="text-[8px] text-gray-700 font-bold">Per.</span>
          </div>
          {Array.from({ length: 18 }, (_, i) => (
            <div key={i} className={`${tileSize} flex items-center justify-center`}>
              <span className="text-[8px] text-gray-700 font-medium">{i + 1}</span>
            </div>
          ))}
        </div>

        {/* Main grid rows 1-7 */}
        {Array.from({ length: 7 }, (_, rowIdx) => {
          const y = rowIdx + 1;
          return (
            <div key={y} className="flex gap-1 mb-1">
              {/* Period label */}
              <div className={`${tileSize} flex items-center justify-center flex-shrink-0`}>
                <span className="text-[9px] text-gray-600 font-bold">{y}</span>
              </div>
              {Array.from({ length: 18 }, (_, colIdx) => renderGridSlot(colIdx + 1, y))}
            </div>
          );
        })}

        {/* Gap row */}
        <div className="h-3" />

        {/* Lanthanides row */}
        <div className="flex gap-1 mb-1">
          <div className={`${tileSize} flex items-center justify-end pr-1`}>
            <span className="text-[8px] text-gray-500 writing-mode-vertical">57–71</span>
          </div>
          <div className={`${tileSize}`} />
          {lanthanides.map(el => (
            <div key={el.atomicNumber} className={tileSize}>
              <ElementTile
                element={el}
                isSelected={selectedElement?.atomicNumber === el.atomicNumber}
                isHovered={hoveredElement?.atomicNumber === el.atomicNumber}
                isFiltered={!isFiltered || filteredSet.has(el.atomicNumber)}
                compact={compact}
                trendColor={getTrendColor(el)}
                onClick={onSelectElement}
                onHover={onHoverElement}
                onNavigate={handleKeyboardNavigate}
              />
            </div>
          ))}
        </div>

        {/* Actinides row */}
        <div className="flex gap-1">
          <div className={`${tileSize} flex items-center justify-end pr-1`}>
            <span className="text-[8px] text-gray-500">89–103</span>
          </div>
          <div className={`${tileSize}`} />
          {actinides.map(el => (
            <div key={el.atomicNumber} className={tileSize}>
              <ElementTile
                element={el}
                isSelected={selectedElement?.atomicNumber === el.atomicNumber}
                isHovered={hoveredElement?.atomicNumber === el.atomicNumber}
                isFiltered={!isFiltered || filteredSet.has(el.atomicNumber)}
                compact={compact}
                trendColor={getTrendColor(el)}
                onClick={onSelectElement}
                onHover={onHoverElement}
                onNavigate={handleKeyboardNavigate}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default PeriodicTable;
