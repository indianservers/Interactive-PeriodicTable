import { useState } from 'react';
import {
  Activity, Atom, BarChart3, BookOpen, Box, Brain, Calculator, ChevronDown, CircleDot, Clock,
  FileQuestion, FlaskConical, FlaskRound, GitCompare, GraduationCap, Heart,
  LayoutDashboard, Lightbulb, ListTree, Microscope, Orbit, PanelLeftClose,
  PanelLeftOpen, Pill, Puzzle, Route, Scale, Search, Settings, Sigma, Sparkles,
  Table2, TestTube2, TrendingUp, Trophy, Waves, X,
} from 'lucide-react';

export const navGroups = [
  {
    label: 'Explore',
    icon: Route,
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'table', label: 'Periodic Table', icon: Table2 },
      { id: 'trends', label: 'Trends', icon: TrendingUp },
      { id: 'compare', label: 'Compare', icon: GitCompare },
    ],
  },
  {
    label: 'Visualize',
    icon: Microscope,
    items: [
      { id: 'atom', label: 'Atom Visualizer', icon: Atom },
      { id: 'molecule', label: '3D Molecules', icon: Box },
      {
        id: 'chemistry-visuals',
        label: 'Chemistry Visuals',
        icon: TestTube2,
        subItems: [
          {
            id: 'organic-visuals',
            label: 'Organic Chemistry',
            icon: FlaskRound,
            subItems: [
              { id: 'organic-visuals', label: 'All Organic Visuals', icon: Sparkles },
              { id: 'organic-mechanisms', label: 'Mechanism Player', icon: Route },
              { id: 'organic-functional-tests', label: 'Functional Tests', icon: Trophy },
              { id: 'organic-named-reactions', label: 'Named Reactions', icon: BookOpen },
              { id: 'organic-isomerism', label: 'Isomerism Explorer', icon: GitCompare },
              { id: 'organic-polymers', label: 'Polymer Builder', icon: Box },
              { id: 'molecule', label: 'Organic 3D Molecules', icon: Box },
            ],
          },
          {
            id: 'inorganic-visuals',
            label: 'Inorganic Chemistry',
            icon: Atom,
            subItems: [
              { id: 'inorganic-visuals', label: 'All Inorganic Visuals', icon: Sparkles },
              { id: 'inorganic-coordination', label: 'Coordination and CFT', icon: Orbit },
              { id: 'inorganic-crystals', label: 'Crystal Structures', icon: Box },
              { id: 'inorganic-salt-analysis', label: 'Salt Analysis', icon: Trophy },
              { id: 'inorganic-metallurgy', label: 'Metallurgy Flowchart', icon: Route },
              { id: 'inorganic-pblock', label: 'p-Block Reference', icon: BookOpen },
              { id: 'trends', label: 'Periodic Trends', icon: TrendingUp },
            ],
          },
          {
            id: 'bio-visuals',
            label: 'Bio Chemistry',
            icon: Waves,
            subItems: [
              { id: 'bio-visuals', label: 'All Bio Visuals', icon: Sparkles },
              { id: 'bio-proteins', label: 'Proteins and Enzymes', icon: Brain },
              { id: 'bio-membranes', label: 'Lipids and Membranes', icon: Waves },
              { id: 'bio-carbohydrates', label: 'Carbohydrates', icon: FlaskRound },
              { id: 'bio-nucleic-acids', label: 'DNA and RNA', icon: GitCompare },
              { id: 'bio-metabolism', label: 'Metabolism and ATP', icon: Route },
              { id: 'molecule', label: 'Biomolecule 3D Viewer', icon: Box },
            ],
          },
          {
            id: 'pharma-visuals',
            label: 'Pharma Chemistry',
            icon: Pill,
            subItems: [
              { id: 'pharma-visuals', label: 'All Pharma Visuals', icon: Sparkles },
              { id: 'pharma-adme', label: 'ADME and Ionization', icon: Route },
              { id: 'pharma-dosage', label: 'Dosage Forms', icon: FlaskConical },
              { id: 'pharma-qc', label: 'Assay and QC', icon: Trophy },
              { id: 'pharma-buffers', label: 'Pharma Buffers', icon: FlaskRound },
              { id: 'pharma-toxicology', label: 'Toxicology', icon: Heart },
              { id: 'drug-discovery', label: 'Drug Discovery Suite', icon: Pill },
            ],
          },
        ],
      },
      {
        id: 'symmetry',
        label: 'Molecular Symmetry',
        icon: Orbit,
        subItems: [
          { id: 'symmetry', label: '3D Visualizer', icon: Sigma },
          { id: 'symmetry-operations', label: 'Operations Guide', icon: Lightbulb },
          { id: 'symmetry-point-groups', label: 'Point Group Finder', icon: Route },
          { id: 'symmetry-practice', label: 'Self Learning Predictor', icon: Brain },
          { id: 'symmetry-teaching', label: 'Teaching Resources', icon: GraduationCap },
        ],
      },
      {
        id: 'lab',
        label: 'Chemistry Lab',
        icon: FlaskConical,
        subItems: [
          { id: 'lab', label: 'Open Lab', icon: FlaskRound },
          { id: 'syllabus', label: 'Syllabus Tags', icon: GraduationCap },
          { id: 'study-tools', label: 'Study Tools', icon: Trophy },
        ],
      },
      { id: 'balancer', label: 'Equation Balancer', icon: Scale },
      { id: 'drug-discovery', label: 'Drug Discovery', icon: Pill },
    ],
  },
  {
    label: 'Learn',
    icon: BookOpen,
    items: [
      {
        id: 'subject-modules',
        label: 'Subject Modules',
        icon: GraduationCap,
        subItems: [
          { id: 'school-mastery', label: 'School Chemistry Mastery', icon: Trophy },
          { id: 'senior-core', label: 'Senior Chemistry Core', icon: Sigma },
          { id: 'advanced-visuals', label: 'Advanced Visual Chemistry', icon: Sparkles },
          { id: 'practice-tutor', label: 'Practice, Exams and Tutor', icon: FileQuestion },
          { id: 'learning-command', label: 'Learning Command Center', icon: ListTree },
          { id: 'organic-reaction-visualizer', label: 'Organic Reaction Visualizer', icon: Route },
          { id: 'spectroscopy-interpreter', label: 'Spectroscopy Interpreter', icon: BarChart3 },
          { id: 'biochemistry-module', label: 'Biochemistry Module', icon: Brain },
          { id: 'inorganic-deep-module', label: 'Inorganic Deep Module', icon: Atom },
          { id: 'physical-simulators', label: 'Physical Simulators', icon: Activity },
          { id: 'iupac-nomenclature', label: 'IUPAC Nomenclature', icon: BookOpen },
          { id: 'retrosynthesis-planner', label: 'Retrosynthesis Planner', icon: GitCompare },
        ],
      },
      { id: 'syllabus', label: 'Syllabus Map', icon: GraduationCap },
      { id: 'study-tools', label: 'Study Tools', icon: Trophy },
      {
        id: 'chemistry-solver',
        label: 'Chemistry Solver',
        icon: Calculator,
        subItems: [
          { id: 'chemistry-solver', label: 'Solved Questions', icon: FileQuestion },
          { id: 'chemistry-solver', label: 'Bookmarks', icon: Heart },
          { id: 'chemistry-solver', label: 'Practice Extensions', icon: Puzzle },
        ],
      },
      { id: 'chemistry-inventor', label: 'Chemistry Inventor Studio', icon: Sparkles },
      { id: 'quiz', label: 'Quiz', icon: BookOpen },
      { id: 'favorites', label: 'Favorites', icon: Heart },
    ],
  },
];

const bottomItems = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

const updatedPages = new Set(['lab', 'balancer', 'study-tools', 'symmetry', 'symmetry-operations', 'symmetry-point-groups', 'symmetry-practice', 'symmetry-teaching', 'chemistry-solver', 'chemistry-inventor', 'drug-discovery', 'chemistry-visuals', 'organic-visuals', 'inorganic-visuals', 'bio-visuals', 'pharma-visuals', 'subject-modules', 'school-mastery', 'senior-core', 'advanced-visuals', 'practice-tutor', 'learning-command']);
const flattenNavItems = (items) => items.flatMap(item => [item, ...flattenNavItems(item.subItems || [])]);
const allNavItems = navGroups.flatMap(group => flattenNavItems(group.items));
const pageLabelMap = Object.fromEntries(allNavItems.map(item => [item.id, item]));

const MenuTooltip = ({ text }) => (
  <span className="pointer-events-none absolute left-full top-1/2 z-[80] ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-950 px-2.5 py-1.5 text-xs font-semibold text-slate-100 opacity-0 shadow-xl shadow-black/30 transition-opacity group-hover/menu-tooltip:opacity-100 lg:group-hover/menu-tooltip:block">
    {text}
  </span>
);

const itemTitle = (label, detail) => detail ? `${label} - ${detail}` : label;

export const Sidebar = ({ currentPage, onNavigate, isOpen, onClose, favoritePages = [], recentPages = [], mini = false, onMiniToggle }) => {
  const [menuSearch, setMenuSearch] = useState('');
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(navGroups.map(group => [group.label, true])));
  const [openSubmenus, setOpenSubmenus] = useState({ 'chemistry-visuals': true, symmetry: true });
  const query = menuSearch.trim().toLowerCase();
  const itemMatchesQuery = (item) => {
    if (!query) return true;
    const childText = flattenNavItems(item.subItems || []).map(subItem => `${subItem.label} ${subItem.id}`).join(' ');
    return `${item.label} ${item.id} ${childText}`.toLowerCase().includes(query);
  };
  const filteredGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(itemMatchesQuery),
    }))
    .filter(group => group.items.length > 0);
  const recentItems = recentPages.map(id => pageLabelMap[id]).filter(Boolean).slice(0, 4);

  const goTo = (id) => {
    onNavigate(id);
    onClose();
  };

  const handleParentClick = (id, hasSubItems) => {
    if (hasSubItems) {
      setOpenSubmenus(open => ({ ...open, [id]: !open[id] }));
      return;
    }
    goTo(id);
  };

  const itemHasActivePage = (item) => item.id === currentPage || (item.subItems || []).some(itemHasActivePage);

  const renderNavItem = ({ id, label, icon: Icon = CircleDot, subItems = [] }, depth = 0) => {
    const submenuOpen = Boolean(openSubmenus[id]);
    const hasSubItems = subItems.length > 0;
    const active = itemHasActivePage({ id, subItems });
    const visibleSubItems = subItems.filter(itemMatchesQuery);
    return (
      <div key={`${id}-${label}`}>
        <button
          onClick={() => handleParentClick(id, hasSubItems)}
          onDoubleClick={() => hasSubItems && pageLabelMap[id] && goTo(id)}
          className={`${depth === 0 ? 'sidebar-item text-sm' : 'group/menu-tooltip relative flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors'} ${
            depth === 0
              ? active ? 'active' : ''
              : active ? 'bg-indigo-500/15 text-indigo-200' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
          }`}
          aria-current={active ? 'page' : undefined}
          aria-expanded={hasSubItems ? submenuOpen : undefined}
          title={hasSubItems ? itemTitle(label, submenuOpen ? 'Collapse submenu. Double-click to open page.' : 'Expand submenu. Double-click to open page.') : label}
          aria-label={hasSubItems ? itemTitle(label, submenuOpen ? 'Collapse submenu' : 'Expand submenu') : label}
        >
          <Icon size={depth === 0 ? 16 : 13} className="flex-shrink-0" />
          <span className={depth === 0 ? 'text-sm' : ''}>{label}</span>
          {depth === 0 && updatedPages.has(id) && <span className="ml-auto rounded-full border border-amber-500/25 bg-amber-500/10 px-1.5 py-0.5 text-[9px] font-bold text-amber-300">Updated</span>}
          {depth === 0 && favoritePages.includes(id) && <Sparkles size={13} className="text-amber-300" title="Favorite page" />}
          {hasSubItems ? (
            <ChevronDown size={14} className={`ml-auto transition-transform ${submenuOpen ? 'rotate-180' : ''}`} />
          ) : currentPage === id && depth === 0 ? (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400/60" />
          ) : null}
          <MenuTooltip text={label} />
        </button>
        {hasSubItems && submenuOpen && (
          <div className={`${depth === 0 ? 'ml-8' : 'ml-4'} mt-1 space-y-0.5 border-l border-white/10 pl-2`}>
            {visibleSubItems.map(item => renderNavItem(item, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full ${mini ? 'w-52 sidebar-mini' : 'w-60'} flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
          border-r border-white/[0.07]
        `}
        style={{ background: 'rgba(5,8,22,0.97)', backdropFilter: 'blur(24px)' }}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-900/40">
              <Atom size={18} className="text-white" />
            </div>
            <div>
              <p className="text-gradient text-xs font-black leading-none tracking-wider">CHEMISTRY</p>
              <p className="mt-0.5 text-[10px] leading-none tracking-widest text-gray-600">UNIVERSE PRO</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300 lg:hidden"
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        <div className="px-3 pt-3">
          <button
            onClick={onMiniToggle}
            className="mb-2 hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 p-2 text-xs font-bold text-gray-500 hover:bg-white/5 hover:text-gray-200 lg:flex"
            title={mini ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={mini ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!mini}
          >
            {mini ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
            <span>{mini ? 'Expand menu' : 'Collapse menu'}</span>
          </button>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={menuSearch}
              onChange={event => setMenuSearch(event.target.value)}
              className="input h-9 rounded-xl pl-8 pr-3 text-xs"
              placeholder="Search menu"
            />
          </div>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-3">
          {!query && recentItems.length > 0 && (
            <div>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Recently Opened</p>
              <div className="space-y-0.5">
                {recentItems.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => goTo(id)}
                    className={`sidebar-item group/menu-tooltip relative w-full text-left ${currentPage === id ? 'active' : ''}`}
                    title={itemTitle(label, 'Recently opened')}
                    aria-label={itemTitle(label, 'Recently opened')}
                  >
                    <Clock size={15} className="flex-shrink-0" />
                    <span className="text-sm">{label}</span>
                    <MenuTooltip text={label} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && favoritePages.length > 0 && (
            <div>
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Bookmarks</p>
              <div className="space-y-0.5">
                {favoritePages.map(id => pageLabelMap[id]).filter(Boolean).slice(0, 5).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => goTo(id)}
                    className={`sidebar-item group/menu-tooltip relative w-full text-left ${currentPage === id ? 'active' : ''}`}
                    title={itemTitle(label, 'Bookmarked page')}
                    aria-label={itemTitle(label, 'Bookmarked page')}
                  >
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="text-sm">{label}</span>
                    <Sparkles size={13} className="ml-auto text-amber-300" />
                    <MenuTooltip text={label} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredGroups.map(group => {
            const GroupIcon = group.icon || ListTree;
            return (
              <div key={group.label}>
                <button
                  onClick={() => setOpenGroups(groups => ({ ...groups, [group.label]: !groups[group.label] }))}
                  className="mb-1.5 flex w-full items-center justify-between rounded-lg px-3 py-1 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-600 hover:bg-white/5 hover:text-gray-400"
                  aria-expanded={openGroups[group.label]}
                  title={`${openGroups[group.label] ? 'Collapse' : 'Expand'} ${group.label}`}
                  aria-label={`${openGroups[group.label] ? 'Collapse' : 'Expand'} ${group.label}`}
                >
                  <span className="inline-flex items-center gap-2"><GroupIcon size={12} />{group.label}</span>
                  <ChevronDown size={12} className={`transition-transform ${openGroups[group.label] ? 'rotate-180' : ''}`} />
                </button>
                {openGroups[group.label] && (
                  <div className="space-y-0.5">
                    {group.items.map(item => renderNavItem(item))}
                  </div>
                )}
              </div>
            );
          })}
          {filteredGroups.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4 text-center">
              <p className="text-sm font-semibold text-gray-300">No tools found</p>
              <p className="mt-1 text-xs text-gray-500">Try table, lab, quiz, or molecule.</p>
            </div>
          )}
        </nav>

        <div className="space-y-0.5 border-t border-white/[0.07] px-3 pb-3 pt-3">
          {bottomItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => goTo(id)}
              className={`sidebar-item group/menu-tooltip relative w-full text-left ${currentPage === id ? 'active' : ''}`}
              title={label}
              aria-label={label}
            >
              <Icon size={16} />
              <span className="text-sm">{label}</span>
              <MenuTooltip text={label} />
            </button>
          ))}
          <div className="px-3 pt-2">
            <p className="text-[10px] text-gray-700">v1.0 - 118 Elements - Offline Ready</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
