import { useState } from 'react';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { MobileNav } from './MobileNav.jsx';

export const AppShell = ({ children, currentPage, onNavigate, isDark, onThemeToggle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <MobileNav currentPage={currentPage} onNavigate={onNavigate} />
    </div>
  );
};
export default AppShell;
