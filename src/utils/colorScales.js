import { getCategoryInfo } from '../data/categories.js';

export const getCategoryColor = (category) => {
  return getCategoryInfo(category).color;
};

export const getCategoryBg = (category) => {
  const info = getCategoryInfo(category);
  return info.bgClass;
};

export const interpolateColor = (ratio, fromHex, toHex) => {
  if (ratio === null || ratio === undefined) return '#374151';
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  if (!from || !to) return fromHex;
  const r = Math.round(from.r + (to.r - from.r) * ratio);
  const g = Math.round(from.g + (to.g - from.g) * ratio);
  const b = Math.round(from.b + (to.b - from.b) * ratio);
  return `rgb(${r},${g},${b})`;
};

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const getPhaseBadge = (phase) => {
  switch ((phase || '').toLowerCase()) {
    case 'gas':     return { label: 'Gas',     color: 'text-sky-400 bg-sky-400/10' };
    case 'liquid':  return { label: 'Liquid',  color: 'text-blue-400 bg-blue-400/10' };
    case 'solid':   return { label: 'Solid',   color: 'text-slate-300 bg-slate-400/10' };
    default:        return { label: 'Unknown', color: 'text-gray-400 bg-gray-400/10' };
  }
};
