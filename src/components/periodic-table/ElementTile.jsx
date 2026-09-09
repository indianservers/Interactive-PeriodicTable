import { memo } from 'react';
import { getCategoryInfo } from '../../data/categories.js';
import { getPhaseBadge } from '../../utils/colorScales.js';

const formatMass = (mass) => typeof mass === 'number' ? mass.toFixed(mass < 100 ? 3 : 2) : 'Unknown';

const keyProperty = (element, activeTrend) => {
  if (activeTrend && element[activeTrend] !== null && element[activeTrend] !== undefined) {
    const labels = {
      electronegativity: 'Electronegativity',
      atomicRadius: 'Atomic radius',
      ionizationEnergy: 'Ionization energy',
      atomicMass: 'Atomic mass',
      density: 'Density',
      meltingPoint: 'Melting point',
      boilingPoint: 'Boiling point',
    };
    return `${labels[activeTrend] || activeTrend}: ${element[activeTrend]}`;
  }
  return `Group ${element.group ?? 'f-block'} - Period ${element.period}`;
};

export const ElementTile = memo(({
  element,
  isSelected,
  isHovered,
  isFiltered,
  compact,
  trendColor,
  activeTrend,
  isDaily,
  isStudied,
  onClick,
  onHover,
  onNavigate,
}) => {
  const catInfo = getCategoryInfo(element.category);
  const phase = getPhaseBadge(element.phase);
  const phaseIndicator = { gas: 'G', liquid: 'L', solid: 'S' };
  const phaseIcon = phaseIndicator[(element.phase || '').toLowerCase()] || '?';
  const hoverPosition = element.period <= 2 ? 'top-full mt-2' : 'bottom-full mb-2';

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
      ? '0 0 0 2px rgba(99,102,241,0.6), 0 12px 28px rgba(0,0,0,0.38)'
      : isDaily
      ? '0 0 0 2px rgba(250,204,21,0.75), 0 0 22px rgba(250,204,21,0.28)'
      : isHovered
      ? `0 0 0 1px ${catInfo.color}99, 0 10px 24px ${catInfo.color}22`
      : undefined,
  };

  return (
    <button
      onClick={(event) => onClick(element, event)}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(element, event);
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
      } ${isSelected ? 'scale-110 z-20 element-tile-selected' : ''} ${isDaily ? 'daily-element-ring' : ''} ${isHovered ? 'z-30' : ''}`}
      style={baseStyle}
      aria-label={`${element.name}, atomic number ${element.atomicNumber}, ${element.category}`}
      title={`${element.name} - Group ${element.group ?? 'f-block'} - Period ${element.period} - ${element.category}`}
    >
      {isStudied && (
        <span className="absolute right-1 top-1 z-10 h-2 w-2 rounded-full bg-emerald-300 shadow-sm shadow-emerald-300/70" title="Studied in active syllabus" />
      )}
      {compact ? (
        <div className="p-0.5 h-full flex flex-col items-center justify-center">
          <span className="text-[8px] text-gray-400 leading-none">{element.atomicNumber}</span>
          <span className="font-black text-[12px] leading-tight" style={{ color: trendColor ? '#fff' : catInfo.color }}>{element.symbol}</span>
        </div>
      ) : (
        <div className="p-1.5 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="text-[8px] text-gray-300 leading-none font-semibold">{element.atomicNumber}</span>
            <span
              className="text-[7px] leading-none font-bold"
              title={phase.label}
              style={{ color: element.phase === 'Gas' ? '#38bdf8' : element.phase === 'Liquid' ? '#60a5fa' : '#94a3b8' }}
            >
              {phaseIcon}
            </span>
          </div>
          <div className="text-center">
            <div className="font-black text-[15px] leading-none" style={{ color: trendColor ? '#fff' : catInfo.color }}>
              {element.symbol}
            </div>
            <div className="text-[7px] text-gray-300 truncate leading-tight mt-1">{element.name}</div>
            <div className="text-[6px] text-gray-500 leading-none mt-0.5">
              {typeof element.atomicMass === 'number' ? formatMass(element.atomicMass) : ''}
            </div>
          </div>
        </div>
      )}
      {isHovered && isFiltered !== false && (
        <span className={`element-hover-card pointer-events-none absolute left-1/2 z-50 w-44 -translate-x-1/2 ${hoverPosition}`}>
          <span className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg border text-lg font-black" style={{ color: catInfo.color, borderColor: `${catInfo.color}55`, backgroundColor: `${catInfo.color}18` }}>
              {element.symbol}
            </span>
            <span className="min-w-0 text-left">
              <span className="block truncate text-sm font-black text-white">{element.name}</span>
              <span className="block text-[11px] text-gray-400">Mass {formatMass(element.atomicMass)} u</span>
              <span className="block truncate text-[11px] text-cyan-200">{keyProperty(element, activeTrend)}</span>
            </span>
          </span>
        </span>
      )}
    </button>
  );
});

ElementTile.displayName = 'ElementTile';
export default ElementTile;
