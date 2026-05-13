import { useState } from 'react';
import { trends } from '../../data/trends.js';
import { normalizeTrendValue, getTrendMinMax } from '../../utils/elementHelpers.js';
import { interpolateColor } from '../../utils/colorScales.js';
import { formatValue } from '../../utils/formatters.js';

export const TrendHeatmap = ({ onTrendChange, activeTrend }) => {
  const trend = trends.find(t => t.id === activeTrend) || trends[0];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={activeTrend}
        onChange={e => onTrendChange(e.target.value)}
        className="input text-sm py-2 w-auto"
        aria-label="Select trend property"
      >
        {trends.map(t => (
          <option key={t.id} value={t.id}>{t.label}</option>
        ))}
      </select>
      <div className="flex-1 min-w-48">
        <div
          className="h-3 rounded-full w-full"
          style={{ background: `linear-gradient(to right, ${trend.colorFrom}, ${trend.colorTo})` }}
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-0.5">
          <span>Low</span>
          <span>{trend.unit}</span>
          <span>High</span>
        </div>
      </div>
    </div>
  );
};

export const TrendExplanationCard = ({ activeTrend }) => {
  const trend = trends.find(t => t.id === activeTrend);
  if (!trend) return null;
  return (
    <div className="glass rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-200 mb-1">{trend.label} Trend</p>
      <p className="text-xs text-gray-400 leading-relaxed">{trend.description}</p>
    </div>
  );
};

export default TrendHeatmap;
