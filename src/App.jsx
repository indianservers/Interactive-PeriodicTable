import { useState, useCallback, Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { PeriodicTablePage } from './pages/PeriodicTablePage.jsx';
import { TrendsPage } from './pages/TrendsPage.jsx';
import { ComparePage } from './pages/ComparePage.jsx';
import { AtomVisualizerPage } from './pages/AtomVisualizerPage.jsx';
import { QuizPage } from './pages/QuizPage.jsx';
import { FavoritesPage } from './pages/FavoritesPage.jsx';
import { SettingsPage } from './pages/SettingsPage.jsx';
import { useTheme } from './hooks/useTheme.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';

const MoleculeScenePage = lazy(() => import('./pages/MoleculeScenePage.jsx'));

function App() {
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [favorites, setFavorites] = useLocalStorage('cu-favorites', []);
  const [compact, setCompact] = useLocalStorage('cu-compact', false);
  const [reducedMotion, setReducedMotion] = useLocalStorage('cu-reduced-motion', false);

  // Cross-page element state
  const [atomViewerElement, setAtomViewerElement] = useState(null);
  const [compareElement, setCompareElement] = useState(null);

  const navigate = useCallback((page) => setCurrentPage(page), []);

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
    setCurrentPage('atom');
  }, []);

  const handleCompare = useCallback((element) => {
    setCompareElement(element);
    setCurrentPage('compare');
  }, []);

  const handleSelectElement = useCallback((element) => {
    setAtomViewerElement(element);
    setCurrentPage('table');
  }, []);

  const handleResetData = () => {
    if (window.confirm('Reset all app data? This clears favorites, quiz scores, and settings.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

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
        return <DashboardPage onNavigate={navigate} onSelectElement={handleSelectElement} />;
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
          <Suspense fallback={<div className="p-8 text-center text-gray-400">Loading 3D viewer…</div>}>
            <MoleculeScenePage />
          </Suspense>
        );
      case 'quiz':
        return <QuizPage />;
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
            onThemeToggle={toggleTheme}
            compact={compact}
            onCompactToggle={() => setCompact(c => !c)}
            reducedMotion={reducedMotion}
            onReducedMotionToggle={() => setReducedMotion(m => !m)}
            onResetData={handleResetData}
          />
        );
      default:
        return <DashboardPage onNavigate={navigate} onSelectElement={handleSelectElement} />;
    }
  };

  return (
    <div className={reducedMotion ? 'no-motion' : ''}>
      <AppShell
        currentPage={currentPage}
        onNavigate={navigate}
        isDark={isDark}
        onThemeToggle={toggleTheme}
      >
        {renderPage()}
      </AppShell>
    </div>
  );
}

export default App;
