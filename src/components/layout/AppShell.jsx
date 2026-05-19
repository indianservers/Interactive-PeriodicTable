import { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { MobileNav } from './MobileNav.jsx';

export const AppShell = ({ children, currentPage, onNavigate, isDark, onThemeToggle, recentPages = [], favoritePages = [], onFavoritePageToggle, onSelectElement, compact = false, studyMode = false, onStudyModeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);
  const currentYear = new Date().getFullYear();
  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (touch?.clientX <= 24) window.__cuSwipeStart = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event) => {
    const start = window.__cuSwipeStart;
    const touch = event.changedTouches?.[0];
    window.__cuSwipeStart = null;
    if (!start || !touch) return;
    if (touch.clientX - start.x > 70 && Math.abs(touch.clientY - start.y) < 50) {
      const backPage = recentPages.find(page => page !== currentPage) || 'dashboard';
      onNavigate?.(backPage);
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark' : 'light'}`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        favoritePages={favoritePages}
        recentPages={recentPages}
        mini={sidebarMini}
        onMiniToggle={() => setSidebarMini(v => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Topbar
          onMenuToggle={() => setSidebarOpen(true)}
          isDark={isDark}
          onThemeToggle={onThemeToggle}
          currentPage={currentPage}
          onNavigate={onNavigate}
          recentPages={recentPages}
          favoritePages={favoritePages}
          onFavoritePageToggle={onFavoritePageToggle}
          onSelectElement={onSelectElement}
          compact={compact}
          studyMode={studyMode}
          onStudyModeToggle={onStudyModeToggle}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          <div key={currentPage} className="page-transition">
            {children}
          </div>
          <footer className="mx-auto mt-6 max-w-7xl px-4 pb-6 text-center text-xs text-gray-500 md:px-6">
            <p>
              Chemistry Universe Tool by{' '}
              <a
                href="https://aimersociety.com/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Aimer Society AI Tools
              </a>
              . Copyright 2022 to {currentYear}. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
      <MobileNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};
export default AppShell;
