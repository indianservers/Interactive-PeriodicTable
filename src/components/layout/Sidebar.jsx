import { useState } from 'react';
import {
  LayoutDashboard, Table2, TrendingUp, GitCompare,
  Atom, Box, BookOpen, Heart, Settings, X, FlaskConical, GraduationCap,
  ChevronDown, Trophy, Scale,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Explore',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'table', label: 'Periodic Table', icon: Table2 },
      { id: 'trends', label: 'Trends', icon: TrendingUp },
      { id: 'compare', label: 'Compare', icon: GitCompare },
    ],
  },
  {
    label: 'Visualize',
    items: [
      { id: 'atom', label: 'Atom Visualizer', icon: Atom },
      { id: 'molecule', label: '3D Molecules', icon: Box },
      { id: 'lab', label: 'Chemistry Lab', icon: FlaskConical },
      { id: 'balancer', label: 'Equation Balancer', icon: Scale },
    ],
  },
  {
    label: 'Learn',
    items: [
      { id: 'syllabus', label: 'Syllabus Map', icon: GraduationCap },
      { id: 'study-tools', label: 'Study Tools', icon: Trophy },
      { id: 'quiz', label: 'Quiz', icon: BookOpen },
      { id: 'favorites', label: 'Favorites', icon: Heart },
    ],
  },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const [labOpen, setLabOpen] = useState(false);
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-60 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          border-r border-white/[0.07]
        `}
        style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/40">
              <Atom size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-black text-gradient leading-none tracking-wider">CHEMISTRY</p>
              <p className="text-[10px] text-gray-600 leading-none mt-0.5 tracking-widest">UNIVERSE PRO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-4">
          {navGroups.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-1.5">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map(({ id, label, icon: Icon }) => (
                  <div key={id}>
                    <button
                      onClick={() => {
                        if (id === 'lab') setLabOpen(open => !open);
                        else { onNavigate(id); onClose(); }
                      }}
                      className={`sidebar-item w-full text-left ${currentPage === id ? 'active' : ''}`}
                      aria-current={currentPage === id ? 'page' : undefined}
                      aria-expanded={id === 'lab' ? labOpen : undefined}
                    >
                      <Icon size={16} className="flex-shrink-0" />
                      <span className="text-sm">{label}</span>
                      {id === 'lab' ? (
                        <ChevronDown size={14} className={`ml-auto transition-transform ${labOpen ? 'rotate-180' : ''}`} />
                      ) : currentPage === id && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/60" />
                      )}
                    </button>
                    {id === 'lab' && labOpen && (
                      <div className="ml-8 mt-1 space-y-0.5">
                        {[
                          ['lab', 'Open Lab'],
                          ['syllabus', 'Syllabus Tags'],
                        ].map(([target, subLabel]) => (
                          <button
                            key={subLabel}
                            onClick={() => { onNavigate(target); onClose(); }}
                            className={`w-full text-left rounded-lg px-3 py-2 text-xs transition-colors ${
                              currentPage === target ? 'bg-indigo-500/15 text-indigo-200' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                            }`}
                          >
                            {subLabel}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 pb-3 border-t border-white/[0.07] pt-3 space-y-0.5">
          {bottomItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { onNavigate(id); onClose(); }}
              className={`sidebar-item w-full text-left ${currentPage === id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span className="text-sm">{label}</span>
            </button>
          ))}
          <div className="px-3 pt-2">
            <p className="text-[10px] text-gray-700">v1.0 · 118 Elements · Phase 1</p>
          </div>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
