import { Atom, TrendingUp, GitCompare, BookOpen, Layers, Zap, Star } from 'lucide-react';
import { getCategoryInfo } from '../data/categories.js';
import { useElements } from '../hooks/useElements.js';

const StatCard = ({ label, value, color }) => (
  <div className="glass rounded-2xl p-4 text-center">
    <p className="text-2xl font-black" style={{ color }}>{value}</p>
    <p className="text-xs text-gray-400 mt-1">{label}</p>
  </div>
);

const QuickActionCard = ({ icon: Icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="glass rounded-2xl p-5 text-left hover:bg-white/[0.07] transition-all group border border-white/5 hover:border-white/15 flex flex-col gap-3"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="font-semibold text-gray-100 group-hover:text-white text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  </button>
);

export const DashboardPage = ({ onNavigate, onSelectElement }) => {
  const { dailyElement } = useElements();
  const catInfo = dailyElement ? getCategoryInfo(dailyElement.category) : null;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-10 relative overflow-hidden rounded-3xl"
        style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 0%, rgba(99,102,241,0.13) 0%, transparent 65%)' }}>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Atom size={16} className="text-white" />
          </div>
          <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Chemistry Universe</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
          Interactive Periodic
          <span className="text-gradient"> Table Pro</span>
        </h1>
        <p className="text-gray-400 mt-2 text-sm max-w-md mx-auto">
          Explore all 118 elements with trends, comparisons, visualizations, and quizzes.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard label="Elements" value="118" color="#818cf8" />
        <StatCard label="Groups" value="18" color="#34d399" />
        <StatCard label="Periods" value="7" color="#f472b6" />
        <StatCard label="Categories" value="10" color="#fb923c" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard icon={Layers} title="Periodic Table" desc="Explore all elements" color="#818cf8" onClick={() => onNavigate('table')} />
          <QuickActionCard icon={TrendingUp} title="Periodic Trends" desc="Heatmap visualizations" color="#34d399" onClick={() => onNavigate('trends')} />
          <QuickActionCard icon={GitCompare} title="Compare" desc="Side-by-side analysis" color="#f472b6" onClick={() => onNavigate('compare')} />
          <QuickActionCard icon={BookOpen} title="Start Quiz" desc="Test your knowledge" color="#fb923c" onClick={() => onNavigate('quiz')} />
        </div>
      </div>

      {/* Element of the day */}
      {dailyElement && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Star size={13} className="inline mr-1.5 text-yellow-400" />
            Element of the Day
          </h2>
          <button
            onClick={() => onSelectElement(dailyElement)}
            className="w-full text-left glass rounded-2xl p-5 hover:bg-white/[0.07] transition-all border border-white/5 hover:border-white/15 group"
          >
            <div className="flex items-start gap-5">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black border flex-shrink-0"
                style={{ backgroundColor: `${catInfo.color}20`, borderColor: `${catInfo.color}40`, color: catInfo.color }}
              >
                {dailyElement.symbol}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white">{dailyElement.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full text-gray-300 border"
                    style={{ borderColor: `${catInfo.color}40`, backgroundColor: `${catInfo.color}15` }}>
                    {dailyElement.category}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  #{dailyElement.atomicNumber} · Atomic mass: {dailyElement.atomicMass} u · {dailyElement.phase}
                </p>
                <p className="text-sm text-gray-300 mt-2 line-clamp-2 leading-relaxed">{dailyElement.summary}</p>
                {dailyElement.commonUses?.length > 0 && (
                  <p className="text-xs text-indigo-400 mt-2">Uses: {dailyElement.commonUses.slice(0, 3).join(' · ')}</p>
                )}
              </div>
            </div>
          </button>
        </div>
      )}

      {/* More tools */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">More Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <QuickActionCard icon={Atom} title="Atom Visualizer" desc="Electron shell diagrams" color="#06b6d4" onClick={() => onNavigate('atom')} />
          <QuickActionCard icon={Zap} title="3D Molecules" desc="Three.js molecule viewer" color="#a78bfa" onClick={() => onNavigate('molecule')} />
          <QuickActionCard icon={Star} title="Favorites" desc="Your saved elements" color="#fbbf24" onClick={() => onNavigate('favorites')} />
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
