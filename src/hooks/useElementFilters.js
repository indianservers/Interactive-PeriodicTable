import { useState, useMemo } from 'react';
import { filterElements } from '../utils/elementHelpers.js';

export const useElementFilters = (elements) => {
  const [filters, setFilters] = useState({ search: '', category: 'all', phase: 'all', block: 'all' });

  const filtered = useMemo(() => filterElements(elements, filters), [elements, filters]);

  const setSearch = (search) => setFilters(f => ({ ...f, search }));
  const setCategory = (category) => setFilters(f => ({ ...f, category }));
  const setPhase = (phase) => setFilters(f => ({ ...f, phase }));
  const setBlock = (block) => setFilters(f => ({ ...f, block }));
  const reset = () => setFilters({ search: '', category: 'all', phase: 'all', block: 'all' });

  const hasActiveFilters = filters.search || filters.category !== 'all' || filters.phase !== 'all' || filters.block !== 'all';

  return { filters, filtered, setSearch, setCategory, setPhase, setBlock, reset, hasActiveFilters };
};

export default useElementFilters;
