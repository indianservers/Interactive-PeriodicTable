import { useMemo } from 'react';
import { elements } from '../data/elements.js';
import { getDailyElement } from '../utils/elementHelpers.js';

export const useElements = () => {
  const dailyElement = useMemo(() => getDailyElement(), []);
  return { elements, dailyElement, total: elements.length };
};

export default useElements;
