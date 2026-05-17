import { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { MobileNav } from './MobileNav.jsx';

export const AppShell = ({ children, currentPage, onNavigate, isDark, onThemeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark' : 'light'}`}>
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        <Topbar
          onMenuToggle={() => setSidebarOpen(true)}
          isDark={isDark}
          onThemeToggle={onThemeToggle}
          currentPage={currentPage}
          onNavigate={onNavigate}
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          {children}
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
