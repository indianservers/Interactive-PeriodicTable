import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage('cu-theme', 'dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, setTheme, toggle, isDark: theme === 'dark' };
};

export default useTheme;
