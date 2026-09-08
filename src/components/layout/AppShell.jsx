import { useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { Topbar } from "./Topbar.jsx";
import { MobileNav } from "./MobileNav.jsx";

export const AppShell = ({
  children,
  currentPage,
  onNavigate,
  isDark,
  onThemeToggle,
  recentPages = [],
  favoritePages = [],
  onFavoritePageToggle,
  onSelectElement,
  compact = false,
  studyMode = false,
  onStudyModeToggle,
  canInstall = false,
  onInstallApp,
  isOnline = true,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMini, setSidebarMini] = useState(false);
  const isSimulation = new Set([
    "atom-builder",
    "gas-properties",
    "reaction-leftovers",
    "acid-base-solutions",
    "molecule-polarity",
    "molecules-light",
    "states-matter",
    "symmetry",
  ]).has(currentPage);
  const currentYear = new Date().getFullYear();
  const handleTouchStart = (event) => {
    const touch = event.touches?.[0];
    if (touch?.clientX <= 24)
      window.__cuSwipeStart = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event) => {
    const start = window.__cuSwipeStart;
    const touch = event.changedTouches?.[0];
    window.__cuSwipeStart = null;
    if (!start || !touch) return;
    if (
      touch.clientX - start.x > 70 &&
      Math.abs(touch.clientY - start.y) < 50
    ) {
      const backPage =
        recentPages.find((page) => page !== currentPage) || "dashboard";
      onNavigate?.(backPage);
    }
  };

  // Dashboard has a page-specific full-viewport learning shell. Keeping it
  // isolated here prevents its layout from affecting protected tool routes.
  if (
    currentPage === "dashboard" ||
    currentPage === "molecule" ||
    currentPage === "lab" ||
    currentPage === "syllabus" ||
    currentPage === "balancer" ||
    currentPage === "study-tools" ||
    currentPage === "quiz" ||
    currentPage === "favorites" ||
    currentPage === "settings" ||
    currentPage === "gas-properties" ||
    currentPage === "reaction-leftovers" ||
    currentPage === "acid-base-solutions" ||
    currentPage === "molecule-polarity" ||
    currentPage === "molecules-light" ||
    currentPage === "states-matter" ||
    currentPage === "chemistry-solver" ||
    currentPage === "chemistry-inventor" ||
    currentPage === "drug-discovery" ||
    currentPage === "ar-vr-mr" ||
    currentPage === "school-mastery" ||
    currentPage === "senior-core" ||
    currentPage === "advanced-visuals" ||
    currentPage === "practice-tutor" ||
    currentPage === "learning-command" ||
    currentPage === "coverage-audit" ||
    currentPage === "research-toolkit" ||
    currentPage === "chemistry-visuals" ||
    currentPage === "organic-visuals" ||
    currentPage === "organic-mechanisms" ||
    currentPage === "organic-functional-tests" ||
    currentPage === "organic-named-reactions" ||
    currentPage === "organic-isomerism" ||
    currentPage === "organic-polymers" ||
    currentPage === "inorganic-visuals" ||
    currentPage === "inorganic-coordination" ||
    currentPage === "inorganic-crystals" ||
    currentPage === "inorganic-salt-analysis" ||
    currentPage === "inorganic-metallurgy" ||
    currentPage === "inorganic-pblock" ||
    currentPage === "bio-visuals" ||
    currentPage === "bio-proteins" ||
    currentPage === "bio-membranes" ||
    currentPage === "bio-carbohydrates" ||
    currentPage === "bio-nucleic-acids" ||
    currentPage === "bio-metabolism" ||
    currentPage === "pharma-visuals" ||
    currentPage === "pharma-adme" ||
    currentPage === "pharma-dosage" ||
    currentPage === "pharma-qc" ||
    currentPage === "pharma-buffers" ||
    currentPage === "pharma-toxicology" ||
    currentPage === "organic-reaction-visualizer" ||
    currentPage === "spectroscopy-interpreter" ||
    currentPage === "biochemistry-module" ||
    currentPage === "inorganic-deep-module" ||
    currentPage === "physical-simulators" ||
    currentPage === "iupac-nomenclature" ||
    currentPage === "retrosynthesis-planner" ||
    currentPage === "subject-modules"
  ) {
    return (
      <div className={isDark ? "dark" : "light"}>
        <main className="min-h-screen overflow-x-hidden">{children}</main>
      </div>
    );
  }

  return (
    <div
      className={`${isSimulation ? "min-h-screen lg:h-screen lg:overflow-hidden" : "min-h-screen"} flex ${isDark ? "dark" : "light"}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        favoritePages={favoritePages}
        recentPages={recentPages}
        mini={sidebarMini}
        onMiniToggle={() => setSidebarMini((v) => !v)}
      />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 lg:ml-0">
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
          canInstall={canInstall}
          onInstallApp={onInstallApp}
          isOnline={isOnline}
        />
        <main
          className={`flex-1 min-h-0 ${isSimulation ? "overflow-y-auto pb-20 lg:overflow-hidden lg:pb-0" : "overflow-y-auto pb-20 lg:pb-6"}`}
        >
          <div key={currentPage} className="page-transition">
            {children}
          </div>
          <footer
            className={`${isSimulation ? "lg:hidden" : ""} mx-auto mt-6 max-w-7xl px-4 pb-6 text-center text-xs text-gray-500 md:px-6`}
          >
            <p>
              Chemistry Universe Tool by{" "}
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
