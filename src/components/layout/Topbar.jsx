import { Menu, Atom, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

const pageIcons = {
  dashboard: '⬡',
  table: '⊞',
  trends: '〜',
  compare: '⇄',
  atom: '◎',
  molecule: '⬡',
  quiz: '✎',
  favorites: '♡',
  settings: '⚙',
};

export const Topbar = ({ onMenuToggle, isDark, onThemeToggle, currentPage }) => {
  const titles = {
    dashboard: 'Dashboard',
    table: 'Periodic Table',
    trends: 'Periodic Trends',
    compare: 'Compare Elements',
    atom: 'Atom Visualizer',
    molecule: '3D Molecule Viewer',
    quiz: 'Quiz Mode',
    favorites: 'Favorites',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/[0.07]"
      style={{ background: 'rgba(3,7,18,0.82)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors text-gray-400 hover:text-gray-200"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600/60 to-purple-700/60 border border-indigo-500/30 flex items-center justify-center shadow-lg">
            <Atom size={14} className="text-indigo-300" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500 font-medium hidden md:block">Chemistry Universe</span>
            <ChevronRight size={12} className="text-gray-700 hidden md:block" />
            <span className="font-semibold text-sm text-gray-200 tracking-tight">
              {titles[currentPage] || 'Chemistry Universe'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
      </div>
    </header>
  );
};
export default Topbar;
