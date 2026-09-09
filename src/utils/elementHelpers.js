import { elements } from '../data/elements.js';

export const getElementBySymbol = (symbol) =>
  elements.find(e => e.symbol === symbol);

export const getElementByAtomicNumber = (n) =>
  elements.find(e => e.atomicNumber === n);

export const getElementByName = (name) =>
  elements.find(e => e.name.toLowerCase() === name.toLowerCase());

export const filterElements = (elements, filters) => {
  const { search, category, phase, block } = filters;
  return elements.filter(el => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !el.name.toLowerCase().includes(q) &&
        !el.symbol.toLowerCase().includes(q) &&
        !String(el.atomicNumber).includes(q)
      ) return false;
    }
    if (category && category !== 'all' && el.category !== category) return false;
    if (phase && phase !== 'all' && (el.phase || '').toLowerCase() !== phase.toLowerCase()) return false;
    if (block && block !== 'all' && el.block !== block) return false;
    return true;
  });
};

export const normalizeTrendValue = (value, min, max) => {
  if (value === null || value === undefined) return null;
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

export const getTrendMinMax = (elements, property) => {
  const values = elements
    .map(e => e[property])
    .filter(v => v !== null && v !== undefined);
  return { min: Math.min(...values), max: Math.max(...values) };
};

export const getDailyElement = () => {
  const day = Math.floor(Date.now() / 86400000);
  return elements[day % elements.length];
};
