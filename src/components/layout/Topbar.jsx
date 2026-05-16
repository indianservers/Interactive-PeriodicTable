import { Menu, Atom, ChevronRight, Home } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';

const pageIcons = {
  dashboard: '⬡',
  table: '⊞',
  trends: '〜',
  compare: '⇄',
  atom: '◎',
  molecule: '⬡',
  syllabus: '▤',
  quiz: '✎',
  favorites: '♡',
  settings: '⚙',
};

const titles = {
  dashboard: 'Dashboard',
  table: 'Periodic Table',
  trends: 'Periodic Trends',
  compare: 'Compare Elements',
  atom: 'Atom Visualizer',
  molecule: '3D Molecule Viewer',
  lab: 'Chemistry Lab',
  syllabus: 'Syllabus Map',
  quiz: 'Quiz Mode',
  favorites: 'Favorites',
  settings: 'Settings',
};

const parentCrumbs = {
  table: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'table', label: 'Periodic Table' }],
  trends: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'trends', label: 'Periodic Trends' }],
  compare: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'compare', label: 'Compare Elements' }],
  atom: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'atom', label: 'Atom Visualizer' }],
  molecule: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'molecule', label: '3D Molecules' }],
  lab: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'lab', label: 'Chemistry Lab' }],
  syllabus: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'syllabus', label: 'Syllabus Map' }],
  quiz: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'quiz', label: 'Quiz' }],
  favorites: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'favorites', label: 'Favorites' }],
  settings: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'settings', label: 'Settings' }],
};

export const Topbar = ({ onMenuToggle, isDark, onThemeToggle, currentPage, onNavigate }) => {
  const breadcrumbs = parentCrumbs[currentPage] || [{ id: 'dashboard', label: 'Dashboard' }];

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
          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="text-[11px] text-gray-500 font-medium hidden md:inline-flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              <Home size={12} />
              Chemistry Universe
            </button>
            <ChevronRight size={12} className="text-gray-700 hidden md:block flex-shrink-0" />
            <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={`${crumb.id}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
                    {index > 0 && <ChevronRight size={12} className="text-gray-700 flex-shrink-0" />}
                    <button
                      onClick={() => !isLast && onNavigate?.(crumb.id)}
                      disabled={isLast}
                      aria-current={isLast ? 'page' : undefined}
                      className={`text-sm truncate transition-colors ${
                        isLast
                          ? 'font-semibold text-gray-200 cursor-default'
                          : 'text-gray-500 hover:text-indigo-300'
                      }`}
                    >
                      {crumb.label}
                    </button>
                  </span>
                );
              })}
            </nav>
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
