import { LayoutDashboard, Table2, FlaskConical, Orbit, BookOpen } from 'lucide-react';

const mobileItems = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'table', label: 'Table', icon: Table2 },
  { id: 'symmetry', label: 'Symmetry', icon: Orbit },
  { id: 'lab', label: 'Lab', icon: FlaskConical },
  { id: 'quiz', label: 'Quiz', icon: BookOpen },
];

export const MobileNav = ({ currentPage, onNavigate }) => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-gray-950/90 backdrop-blur-md border-t border-white/10">
    <div className="grid grid-cols-5 h-16">
      {mobileItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex flex-col items-center justify-center gap-0.5 transition-colors relative ${
            currentPage === id ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
          }`}
          aria-label={label}
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
          {currentPage === id && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400 shadow shadow-indigo-400/60" />
          )}
        </button>
      ))}
    </div>
  </nav>
);
export default MobileNav;
