import { useState, useEffect, useCallback, useRef } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const initial = useRef(initialValue);
  const read = useCallback(() => {
    try { const value = localStorage.getItem(key); return value === null ? initial.current : JSON.parse(value); }
    catch { return initial.current; }
  }, [key]);
  const [storedValue, setStoredValue] = useState(read);
  const current = useRef(storedValue);
  current.current = storedValue;
  const setValue = useCallback(value => {
    const next = typeof value === 'function' ? value(current.current) : value;
    current.current = next;
    setStoredValue(next);
    try { localStorage.setItem(key, JSON.stringify(next)); window.dispatchEvent(new CustomEvent('cu-storage', {detail:{key}})); } catch {}
  }, [key]);
  useEffect(() => {
    const sync = event => { if (event.key === key || event.detail?.key === key || event.key === null) { const next=read(); current.current=next; setStoredValue(next); } };
    window.addEventListener('storage',sync); window.addEventListener('cu-storage',sync);
    return () => {window.removeEventListener('storage',sync);window.removeEventListener('cu-storage',sync);};
  }, [key,read]);
  return [storedValue,setValue];
};
export default useLocalStorage;
