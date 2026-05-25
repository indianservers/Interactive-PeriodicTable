import { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PeriodicTablePage } from './pages/PeriodicTablePage.jsx';
import { TrendsPage } from './pages/TrendsPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { AtomVisualizerPage } from './pages/AtomVisualizerPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { ChemistryLabPage } from './pages/ChemistryLabPage.jsx';
import { SyllabusPage } from './pages/SyllabusPage.jsx';
import { ReactionBalancerPage } from './pages/ReactionBalancerPage.jsx';
import { StudyToolsPage } from './pages/StudyToolsPage.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

const MoleculeScenePage = lazy(() => import('./pages/MoleculeScenePage.jsx'));
const MolecularSymmetryModule = lazy(() => import('./modules/molecular-symmetry/MolecularSymmetryModule.jsx'));

const pageHashMap = {
  symmetry: 'molecular-symmetry',
};
const hashPageMap = {
  'molecular-symmetry': 'symmetry',
};

function App() {
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '');
    return hashPageMap[hash] || hash || 'dashboard';
  });
  const [favorites, setFavorites] = useLocalStorage('cu-favorites', []);
  const [compact, setCompact] = useLocalStorage('cu-compact', false);
  const [studyMode, setStudyMode] = useLocalStorage('cu-study-mode', false);
  const [reducedMotion, setReducedMotion] = useLocalStorage('cu-reduced-motion', false);
  const [highContrast, setHighContrast] = useLocalStorage('cu-high-contrast', false);
  const [colorTheme, setColorTheme] = useLocalStorage('cu-color-theme', 'study');
  const [language, setLanguage] = useLocalStorage('cu-language', 'en');
  const [recentPages, setRecentPages] = useLocalStorage('cu-recent-pages', []);
  const [favoritePages, setFavoritePages] = useLocalStorage('cu-favorite-pages', []);
  const [serviceWorkerUpdate, setServiceWorkerUpdate] = useState(null);

  // Cross-page element state
  const [atomViewerElement, setAtomViewerElement] = useState(null);
  const [compareElement, setCompareElement] = useState(null);

  const navigate = useCallback((page) => {
    setCurrentPage(page);
    const nextHash = pageHashMap[page] || page;
    if (window.location.hash.replace(/^#\/?/, '') !== nextHash) {
      window.location.hash = nextHash;
    }
    setRecentPages(prev => [page, ...prev.filter(id => id !== page)].slice(0, 8));
  }, [setRecentPages]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      setCurrentPage(hashPageMap[hash] || hash || 'dashboard');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const handleUpdate = (event) => setServiceWorkerUpdate(() => event.detail?.refresh || null);
    window.addEventListener('app-service-worker-update', handleUpdate);
    return () => window.removeEventListener('app-service-worker-update', handleUpdate);
  }, []);

  const handleFavoriteToggle = useCallback((element) => {
    setFavorites(prev => {
      const exists = prev.some(f => f.atomicNumber === element.atomicNumber);
      return exists
        ? prev.filter(f => f.atomicNumber !== element.atomicNumber)
        : [...prev, element];
    });
  }, [setFavorites]);

  const handleRemoveFavorite = useCallback((element) => {
    setFavorites(prev => prev.filter(f => f.atomicNumber !== element.atomicNumber));
  }, [setFavorites]);

  const handleViewAtom = useCallback((element) => {
    setAtomViewerElement(element);
    navigate('atom');
  }, [navigate]);

  const handleCompare = useCallback((element) => {
    setCompareElement(element);
    navigate('compare');
  }, [navigate]);

  const handleSelectElement = useCallback((element) => {
    setAtomViewerElement(element);
    navigate('table');
  }, [navigate]);

  const toggleFavoritePage = useCallback((page) => {
    setFavoritePages(prev => prev.includes(page) ? prev.filter(id => id !== page) : [page, ...prev].slice(0, 12));
  }, [setFavoritePages]);

  const handleResetData = () => {
    if (window.confirm('Reset all app data? This clears favorites, quiz scores, and settings.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleThemeWithReveal = useCallback((event) => {
    const rect = event?.currentTarget?.getBoundingClientRect?.();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 32;
    const y = rect ? rect.top + rect.height / 2 : 32;
    const reveal = document.createElement('div');
    reveal.className = 'theme-reveal';
    reveal.style.left = `${x}px`;
    reveal.style.top = `${y}px`;
    document.body.appendChild(reveal);
    toggleTheme();
    window.setTimeout(() => reveal.remove(), 340);
  }, [toggleTheme]);

  const commonProps = {
    favorites,
    onFavoriteToggle: handleFavoriteToggle,
    onViewAtom: handleViewAtom,
    onCompare: handleCompare,
    reducedMotion,
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage onNavigate={navigate} onSelectElement={handleSelectElement} recentPages={recentPages} favoritePages={favoritePages} />;
      case 'table':
        return <PeriodicTablePage {...commonProps} />;
      case 'trends':
        return <TrendsPage {...commonProps} />;
      case 'compare':
        return <ComparePage initialElement={compareElement} />;
      case 'atom':
        return <AtomVisualizerPage initialElement={atomViewerElement} reducedMotion={reducedMotion} />;
      case 'molecule':
        return (
          <Suspense fallback={
            <div className="page-transition p-4 md:p-6 max-w-7xl mx-auto space-y-3">
              <div className="skeleton h-12 rounded-2xl" />
              <div className="skeleton h-[560px] rounded-2xl" />
              <p className="text-center text-sm text-gray-400">Loading 3D viewer...</p>
            </div>
          }>
            <MoleculeScenePage />
          </Suspense>
        );
      case 'symmetry':
        return (
          <Suspense fallback={
            <div className="page-transition p-4 md:p-6 max-w-7xl mx-auto space-y-3">
              <div className="skeleton h-12 rounded-2xl" />
              <div className="skeleton h-[620px] rounded-2xl" />
              <p className="text-center text-sm text-gray-400">Loading molecular symmetry laboratory...</p>
            </div>
          }>
            <MolecularSymmetryModule />
          </Suspense>
        );
      case 'quiz':
        return <QuizPage />;
      case 'lab':
        return <ChemistryLabPage />;
      case 'balancer':
        return <ReactionBalancerPage />;
      case 'study-tools':
        return (
          <StudyToolsPage
            favorites={favorites}
            onFavoriteToggle={handleFavoriteToggle}
            onViewAtom={handleViewAtom}
            onCompare={handleCompare}
            reducedMotion={reducedMotion}
          />
        );
      case 'syllabus':
        return <SyllabusPage onNavigate={navigate} />;
      case 'favorites':
        return (
          <FavoritesPage
            favorites={favorites}
            onRemove={handleRemoveFavorite}
            onSelectElement={handleSelectElement}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            isDark={isDark}
            onThemeToggle={toggleThemeWithReveal}
            compact={compact}
            onCompactToggle={() => setCompact(c => !c)}
            reducedMotion={reducedMotion}
            onReducedMotionToggle={() => setReducedMotion(m => !m)}
            highContrast={highContrast}
            onHighContrastToggle={() => setHighContrast(v => !v)}
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            language={language}
            onLanguageChange={setLanguage}
            onResetData={handleResetData}
          />
        );
      default:
        return <DashboardPage onNavigate={navigate} onSelectElement={handleSelectElement} recentPages={recentPages} favoritePages={favoritePages} />;
    }
  };

  return (
    <div className={`${reducedMotion ? 'no-motion' : ''} ${highContrast ? 'high-contrast' : ''} ${compact ? 'app-compact' : ''} ${studyMode ? 'study-mode' : ''} theme-${colorTheme}`}>
      <AppShell
        currentPage={currentPage}
        onNavigate={navigate}
        isDark={isDark}
        onThemeToggle={toggleThemeWithReveal}
        compact={compact}
        studyMode={studyMode}
        onStudyModeToggle={() => setStudyMode(v => !v)}
        recentPages={recentPages}
        favoritePages={favoritePages}
        onFavoritePageToggle={toggleFavoritePage}
        onSelectElement={handleViewAtom}
      >
        {renderPage()}
      </AppShell>
      {serviceWorkerUpdate && (
        <button
          onClick={serviceWorkerUpdate}
          className="fixed bottom-20 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-cyan-400/30 bg-gray-950/95 px-4 py-3 text-left text-sm font-semibold text-cyan-50 shadow-2xl shadow-black/40 backdrop-blur-xl transition-colors hover:bg-cyan-950/90 lg:bottom-5 lg:left-auto lg:right-5 lg:translate-x-0"
          aria-live="polite"
        >
          New version available — tap to refresh.
        </button>
      )}
    </div>
  );
}

export default App;
