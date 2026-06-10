import { Atom, TrendingUp, GitCompare, BookOpen, Layers, Zap, Star, FlaskConical, Lightbulb, GraduationCap, Clock, Heart, Sparkles, ArrowRight, BadgeCheck } from 'lucide-react';
import { getCategoryInfo } from '../data/categories.js';
import { useElements } from '../hooks/useElements.js';

const StatCard = ({ label, value, color }) => (
  <div className="glass rounded-xl p-4 text-center">
    <p className="text-2xl font-black" style={{ color }}>{value}</p>
    <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
  </div>
);

const QuickActionCard = ({ icon: Icon, title, desc, color, onClick }) => (
  <button
    onClick={onClick}
    className="group flex min-h-[132px] flex-col justify-between rounded-xl border border-white/10 bg-white/[0.045] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.075]"
  >
    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div>
      <p className="text-sm font-bold text-gray-100 group-hover:text-white">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{desc}</p>
    </div>
  </button>
);

const pageLabels = {
  dashboard: 'Dashboard',
  table: 'Periodic Table',
  trends: 'Trends',
  compare: 'Compare',
  atom: 'Atom Visualizer',
  molecule: '3D Molecules',
  lab: 'Chemistry Lab',
  balancer: 'Equation Balancer',
  syllabus: 'Syllabus Map',
  'study-tools': 'Study Tools',
  quiz: 'Quiz',
  favorites: 'Favorites',
  settings: 'Settings',
  'chemistry-inventor': 'Chemistry Inventor Studio',
};

export const DashboardPage = ({ onNavigate, onSelectElement, recentPages = [], favoritePages = [] }) => {
  const { elements, dailyElement } = useElements();
  const catInfo = dailyElement ? getCategoryInfo(dailyElement.category) : null;
  const factElement = elements[(Math.floor(Date.now() / 86400000) + 17) % elements.length];
  const factCat = factElement ? getCategoryInfo(factElement.category) : null;
  const fact = factElement?.commonUses?.length
    ? `${factElement.name} is used in ${factElement.commonUses.slice(0, 2).join(' and ')}.`
    : `${factElement?.name} was discovered by ${factElement?.discoveredBy || 'early chemists'}${factElement?.yearDiscovered ? ` in ${factElement.yearDiscovered}` : ''}.`;
  const resumePage = recentPages.find(page => page !== 'dashboard') || 'lab';
  const streak = Math.max(1, new Set(recentPages).size);

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 md:p-6">
      <section className="periodic-hero overflow-hidden rounded-2xl border border-white/10 p-5 md:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-emerald-200">
              <BadgeCheck size={13} />
              Offline-ready chemistry workspace
            </div>
            <h1 className="max-w-3xl text-3xl font-black leading-tight text-white md:text-5xl">
              Chemistry Universe Pro
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 md:text-base">
              A polished learning suite for elements, molecules, visual chemistry, exam practice, and classroom-ready lab tools.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={() => onNavigate('table')} className="btn-primary inline-flex items-center gap-2 text-sm">
                Explore Periodic Table <ArrowRight size={15} />
              </button>
              <button onClick={() => onNavigate('chemistry-solver')} className="btn-secondary inline-flex items-center gap-2 text-sm">
                Open Solver <Sparkles size={15} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Elements" value="118" color="#818cf8" />
            <StatCard label="Tools" value="50+" color="#34d399" />
            <StatCard label="Curricula" value="6" color="#f472b6" />
            <StatCard label="Modes" value="12" color="#fb923c" />
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-3">
        <div className="glass rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-white">Continue Learning</p>
              <p className="text-xs text-gray-500 mt-1">Resume where you last explored.</p>
            </div>
            <button onClick={() => onNavigate(resumePage)} className="btn-primary inline-flex items-center gap-2 text-sm">
              Resume <ArrowRight size={14} />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {recentPages.filter(page => page !== 'dashboard').slice(0, 5).map(page => (
              <button key={page} onClick={() => onNavigate(page)} className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-3 py-1 text-xs text-gray-300 hover:text-white">
                <Clock size={12} /> {pageLabels[page] || page}
              </button>
            ))}
          </div>
        </div>
        <div className="glass rounded-xl border border-white/10 p-4">
          <p className="text-sm font-black text-white">Study Progress</p>
          <p className="text-xs text-gray-500 mt-1">{streak} area{streak === 1 ? '' : 's'} visited recently.</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${Math.min(100, streak * 14)}%` }} />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard icon={Layers} title="Periodic Table" desc="Explore all elements" color="#818cf8" onClick={() => onNavigate('table')} />
          <QuickActionCard icon={TrendingUp} title="Periodic Trends" desc="Heatmap visualizations" color="#34d399" onClick={() => onNavigate('trends')} />
          <QuickActionCard icon={GitCompare} title="Compare" desc="Side-by-side analysis" color="#f472b6" onClick={() => onNavigate('compare')} />
          <QuickActionCard icon={BookOpen} title="Start Quiz" desc="Test your knowledge" color="#fb923c" onClick={() => onNavigate('quiz')} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Syllabus Shortcuts</h2>
        <div className="flex flex-wrap gap-2">
          {['Class 10', 'Class 11', 'Class 12', 'NEET', 'JEE Main', 'JEE Advanced'].map(label => (
            <button key={label} onClick={() => onNavigate('syllabus')} className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-gray-300 hover:text-white">
              <GraduationCap size={12} className="inline mr-1" /> {label}
            </button>
          ))}
          <button onClick={() => onNavigate('compare')} className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:text-white">
            <GitCompare size={12} className="inline mr-1" /> Pinned comparison
          </button>
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
                  #{dailyElement.atomicNumber} - Atomic mass: {dailyElement.atomicMass} u - {dailyElement.phase}
                </p>
                <p className="text-sm text-gray-300 mt-2 line-clamp-2 leading-relaxed">{dailyElement.summary}</p>
                {dailyElement.commonUses?.length > 0 && (
                  <p className="text-xs text-indigo-400 mt-2">Uses: {dailyElement.commonUses.slice(0, 3).join(' - ')}</p>
                )}
              </div>
            </div>
          </button>
        </div>
      )}

      {factElement && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Lightbulb size={13} className="inline mr-1.5 text-cyan-300" />
            Did You Know?
          </h2>
          <button
            onClick={() => onSelectElement(factElement)}
            className="w-full text-left glass rounded-2xl p-4 hover:bg-white/[0.07] transition-all border border-white/5 hover:border-white/15"
          >
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 rounded-xl border flex items-center justify-center text-lg font-black"
                style={{ color: factCat.color, borderColor: `${factCat.color}44`, background: `${factCat.color}18` }}>
                {factElement.symbol}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">{factElement.name}</p>
                <p className="text-sm text-gray-300 mt-0.5">{fact}</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {/* More tools */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">More Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickActionCard icon={Atom} title="Atom Visualizer" desc="Electron shell diagrams" color="#06b6d4" onClick={() => onNavigate('atom')} />
          <QuickActionCard icon={Zap} title="3D Molecules" desc="Three.js molecule viewer" color="#a78bfa" onClick={() => onNavigate('molecule')} />
          <QuickActionCard icon={FlaskConical} title="Chemistry Lab" desc="50 study tools and charts" color="#2dd4bf" onClick={() => onNavigate('lab')} />
          <QuickActionCard icon={Sparkles} title="Chemistry Inventor Studio" desc="Build, drag, simulate, and explain school chemistry experiments visually." color="#22d3ee" onClick={() => onNavigate('chemistry-inventor')} />
          <QuickActionCard icon={Star} title="Favorites" desc="Your saved elements" color="#fbbf24" onClick={() => onNavigate('favorites')} />
        </div>
      </div>

      {favoritePages.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            <Heart size={13} className="inline mr-1.5 text-amber-300" />
            Favorite Pages
          </h2>
          <div className="flex flex-wrap gap-2">
            {favoritePages.slice(0, 8).map(page => (
              <button key={page} onClick={() => onNavigate(page)} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-100 hover:text-white">
                {pageLabels[page] || page}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DashboardPage;
