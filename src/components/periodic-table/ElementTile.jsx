import { memo } from 'react';
import { getCategoryInfo } from '../../data/categories.js';
import { getPhaseBadge } from '../../utils/colorScales.js';

export const ElementTile = memo(({ element, isSelected, isHovered, isFiltered, compact, trendColor, onClick, onHover, onNavigate }) => {
  const catInfo = getCategoryInfo(element.category);
  const phase = getPhaseBadge(element.phase);

  const phaseIndicator = { gas: '⬤', liquid: '◆', solid: '■' };
  const phaseIcon = phaseIndicator[(element.phase || '').toLowerCase()] || '?';

  const baseStyle = {
    borderColor: isSelected
      ? 'rgba(99,102,241,0.8)'
      : trendColor
      ? 'transparent'
      : `${catInfo.color}40`,
    backgroundColor: trendColor
      ? trendColor
      : isSelected
      ? 'rgba(99,102,241,0.2)'
      : isFiltered === false
      ? 'rgba(255,255,255,0.02)'
      : `${catInfo.color}18`,
    boxShadow: isSelected
      ? `0 0 0 2px rgba(99,102,241,0.6), 0 12px 28px rgba(0,0,0,0.38)`
      : isHovered
      ? `0 0 0 1px ${catInfo.color}99, 0 10px 24px ${catInfo.color}22`
      : undefined,
  };

  return (
    <button
      onClick={() => onClick(element)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(element);
          return;
        }
        onNavigate?.(event, element);
      }}
      data-atomic-number={element.atomicNumber}
      onMouseEnter={() => onHover?.(element)}
      onFocus={() => onHover?.(element)}
      onMouseLeave={() => onHover?.(null)}
      className={`element-tile w-full border focus-visible:ring-2 focus-visible:ring-indigo-400 ${
        isFiltered === false ? 'opacity-20 pointer-events-none' : ''
      } ${isSelected ? 'scale-110 z-20 element-tile-selected' : ''} ${isHovered ? 'z-10' : ''}`}
      style={baseStyle}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}, ${element.category}`}
      title={`${element.name} · Group ${element.group ?? 'f-block'} · Period ${element.period} · ${element.category}`}
    >
      {compact ? (
        <div className="p-0.5 h-full flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-400 leading-none">{element.atomicNumber}</span>
          <span className="font-black text-[12px] leading-tight" style={{ color: trendColor ? '#fff' : catInfo.color }}>{element.symbol}</span>
        </div>
      ) : (
        <div className="p-1.5 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[8px] text-gray-300 leading-none font-semibold">{element.atomicNumber}</span>
            <span className="text-[6px] leading-none" title={phase.label}
              style={{ color: element.phase === 'Gas' ? '#38bdf8' : element.phase === 'Liquid' ? '#60a5fa' : '#94a3b8' }}>
              {phaseIcon}
            </span>
          </div>
          <div className="text-center">
            <div className="font-black text-[15px] leading-none" style={{ color: trendColor ? '#fff' : catInfo.color }}>
              {element.symbol}
            </div>
            <div className="text-[7px] text-gray-300 truncate leading-tight mt-1">{element.name}</div>
            <div className="text-[6px] text-gray-500 leading-none mt-0.5">
              {typeof element.atomicMass === 'number' ? element.atomicMass.toFixed(element.atomicMass < 100 ? 3 : 2) : ''}
            </div>
          </div>
        </div>
      )}
    </button>
  );
});

ElementTile.displayName = 'ElementTile';
export default ElementTile;
