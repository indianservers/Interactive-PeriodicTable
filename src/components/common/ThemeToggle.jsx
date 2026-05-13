import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = ({ isDark, onToggle }) => (
  <button
    onClick={onToggle}
    className="p-2 rounded-xl glass hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
    aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
  >
    {isDark ? <Sun size={18} /> : <Moon size={18} />}
  </button>
);
export default ThemeToggle;
