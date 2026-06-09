import { useEffect, useMemo, useState } from 'react';
import { Menu, Atom, ChevronRight, Home, Search, Star, Share2, Printer, Maximize2, Download, BookOpen } from 'lucide-react';
import { ThemeToggle } from '../common/ThemeToggle.jsx';
import { elements } from '../../data/elements.js';
import { ALL_MOLECULES } from '../../data/molecules.js';
import { labToolCatalog } from '../../data/syllabus.js';
import { navGroups } from './Sidebar.jsx';
import { getCategoryInfo } from '../../data/categories.js';

const pageIcons = {
  dashboard: '⬡',
  table: '⊞',
  trends: '〜',
  compare: '⇄',
  atom: '◎',
  molecule: '⬡',
  syllabus: '▤',
  quiz: '✎',
  favorites: '♡',
  settings: '⚙',
};

const titles = {
  dashboard: 'Dashboard',
  table: 'Periodic Table',
  trends: 'Periodic Trends',
  compare: 'Compare Elements',
  atom: 'Atom Visualizer',
  molecule: '3D Molecule Viewer',
  symmetry: 'Molecular Symmetry Visualizer',
  'symmetry-operations': 'Symmetry Operations Guide',
  'symmetry-point-groups': 'Point Group Finder',
  'symmetry-practice': 'Self Learning Predictor',
  'symmetry-teaching': 'Symmetry Teaching Resources',
  lab: 'Chemistry Lab',
  syllabus: 'Syllabus Map',
  quiz: 'Quiz Mode',
  favorites: 'Favorites',
  settings: 'Settings',
  balancer: 'Equation Balancer',
  'study-tools': 'Study Tools',
  'chemistry-solver': 'Chemistry Solver',
  'chemistry-inventor': 'Chemistry Inventor Studio',
  'drug-discovery': 'Drug Discovery',
  'school-mastery': 'School Chemistry Mastery',
  'senior-core': 'Senior Chemistry Core',
  'organic-visuals': 'Organic Chemistry Visuals',
  'organic-mechanisms': 'Organic Mechanism Player',
  'organic-functional-tests': 'Organic Functional Tests',
  'organic-named-reactions': 'Organic Named Reactions',
  'organic-isomerism': 'Organic Isomerism Explorer',
  'organic-polymers': 'Organic Polymer Builder',
  'inorganic-visuals': 'Inorganic Chemistry Visuals',
  'inorganic-coordination': 'Coordination and CFT Visuals',
  'inorganic-crystals': 'Crystal Structure Visuals',
  'inorganic-salt-analysis': 'Inorganic Salt Analysis',
  'inorganic-metallurgy': 'Metallurgy Visual Flowchart',
  'inorganic-pblock': 'p-Block Inorganic Reference',
  'bio-visuals': 'Biochemistry Visuals',
  'bio-proteins': 'Protein and Enzyme Visuals',
  'bio-membranes': 'Lipid and Membrane Visuals',
  'bio-carbohydrates': 'Carbohydrate Visuals',
  'bio-nucleic-acids': 'DNA and RNA Visuals',
  'bio-metabolism': 'Metabolism and ATP Visuals',
  'pharma-visuals': 'Pharma Chemistry Visuals',
  'pharma-adme': 'ADME and Ionization Visuals',
  'pharma-dosage': 'Dosage Form Visuals',
  'pharma-qc': 'Pharmaceutical Assay and QC',
  'pharma-buffers': 'Pharmaceutical Buffer Visuals',
  'pharma-toxicology': 'Toxicology and Chelation Visuals',
  'organic-reaction-visualizer': 'Organic Reaction Visualizer',
  'spectroscopy-interpreter': 'Spectroscopy Interpreter',
  'biochemistry-module': 'Biochemistry Module',
  'inorganic-deep-module': 'Inorganic Chemistry Deep Module',
  'physical-simulators': 'Physical Chemistry Simulators',
  'iupac-nomenclature': 'IUPAC Nomenclature Practice',
  'retrosynthesis-planner': 'Retrosynthesis and Synthesis Planner',
  'subject-modules': 'Subject Modules',
};

const parentCrumbs = {
  table: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'table', label: 'Periodic Table' }],
  trends: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'trends', label: 'Periodic Trends' }],
  compare: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'compare', label: 'Compare Elements' }],
  atom: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'atom', label: 'Atom Visualizer' }],
  molecule: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'molecule', label: '3D Molecules' }],
  symmetry: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'symmetry', label: 'Molecular Symmetry' }],
  'symmetry-operations': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'symmetry', label: 'Molecular Symmetry' }, { id: 'symmetry-operations', label: 'Operations Guide' }],
  'symmetry-point-groups': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'symmetry', label: 'Molecular Symmetry' }, { id: 'symmetry-point-groups', label: 'Point Groups' }],
  'symmetry-practice': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'symmetry', label: 'Molecular Symmetry' }, { id: 'symmetry-practice', label: 'Self Learning' }],
  'symmetry-teaching': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'symmetry', label: 'Molecular Symmetry' }, { id: 'symmetry-teaching', label: 'Teaching Resources' }],
  lab: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'lab', label: 'Chemistry Lab' }],
  syllabus: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'syllabus', label: 'Syllabus Map' }],
  quiz: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'quiz', label: 'Quiz' }],
  favorites: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'favorites', label: 'Favorites' }],
  settings: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'settings', label: 'Settings' }],
  balancer: [{ id: 'dashboard', label: 'Dashboard' }, { id: 'balancer', label: 'Equation Balancer' }],
  'study-tools': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'study-tools', label: 'Study Tools' }],
  'chemistry-solver': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'chemistry-solver', label: 'Chemistry Solver' }],
  'chemistry-inventor': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'chemistry-inventor', label: 'Chemistry Inventor Studio' }],
  'drug-discovery': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'drug-discovery', label: 'Drug Discovery' }],
  'school-mastery': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'subject-modules', label: 'Subject Modules' }, { id: 'school-mastery', label: 'School Mastery' }],
  'senior-core': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'subject-modules', label: 'Subject Modules' }, { id: 'senior-core', label: 'Senior Core' }],
  'chemistry-visuals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'chemistry-visuals', label: 'Chemistry Visuals' }],
  'organic-visuals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }],
  'organic-mechanisms': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }, { id: 'organic-mechanisms', label: 'Mechanisms' }],
  'organic-functional-tests': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }, { id: 'organic-functional-tests', label: 'Functional Tests' }],
  'organic-named-reactions': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }, { id: 'organic-named-reactions', label: 'Named Reactions' }],
  'organic-isomerism': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }, { id: 'organic-isomerism', label: 'Isomerism' }],
  'organic-polymers': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-visuals', label: 'Organic Visuals' }, { id: 'organic-polymers', label: 'Polymers' }],
  'inorganic-visuals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }],
  'inorganic-coordination': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }, { id: 'inorganic-coordination', label: 'Coordination' }],
  'inorganic-crystals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }, { id: 'inorganic-crystals', label: 'Crystals' }],
  'inorganic-salt-analysis': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }, { id: 'inorganic-salt-analysis', label: 'Salt Analysis' }],
  'inorganic-metallurgy': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }, { id: 'inorganic-metallurgy', label: 'Metallurgy' }],
  'inorganic-pblock': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-visuals', label: 'Inorganic Visuals' }, { id: 'inorganic-pblock', label: 'p-Block' }],
  'bio-visuals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }],
  'bio-proteins': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }, { id: 'bio-proteins', label: 'Proteins' }],
  'bio-membranes': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }, { id: 'bio-membranes', label: 'Membranes' }],
  'bio-carbohydrates': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }, { id: 'bio-carbohydrates', label: 'Carbohydrates' }],
  'bio-nucleic-acids': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }, { id: 'bio-nucleic-acids', label: 'DNA/RNA' }],
  'bio-metabolism': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'bio-visuals', label: 'Bio Visuals' }, { id: 'bio-metabolism', label: 'Metabolism' }],
  'pharma-visuals': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }],
  'pharma-adme': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }, { id: 'pharma-adme', label: 'ADME' }],
  'pharma-dosage': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }, { id: 'pharma-dosage', label: 'Dosage' }],
  'pharma-qc': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }, { id: 'pharma-qc', label: 'Assay/QC' }],
  'pharma-buffers': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }, { id: 'pharma-buffers', label: 'Buffers' }],
  'pharma-toxicology': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'pharma-visuals', label: 'Pharma Visuals' }, { id: 'pharma-toxicology', label: 'Toxicology' }],
  'organic-reaction-visualizer': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'organic-reaction-visualizer', label: 'Organic Reactions' }],
  'spectroscopy-interpreter': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'spectroscopy-interpreter', label: 'Spectroscopy' }],
  'biochemistry-module': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'biochemistry-module', label: 'Biochemistry' }],
  'inorganic-deep-module': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'inorganic-deep-module', label: 'Inorganic Deep' }],
  'physical-simulators': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'physical-simulators', label: 'Physical Simulators' }],
  'iupac-nomenclature': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'iupac-nomenclature', label: 'IUPAC Practice' }],
  'retrosynthesis-planner': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'retrosynthesis-planner', label: 'Retrosynthesis' }],
  'subject-modules': [{ id: 'dashboard', label: 'Dashboard' }, { id: 'subject-modules', label: 'Subject Modules' }],
};

const flattenNavItems = (items) => items.flatMap(item => [item, ...flattenNavItems(item.subItems || [])]);
const pageItems = navGroups.flatMap(group => flattenNavItems(group.items));
const pageHashMap = {
  symmetry: 'molecular-symmetry',
  'symmetry-operations': 'molecular-symmetry/operations',
  'symmetry-point-groups': 'molecular-symmetry/point-groups',
  'symmetry-practice': 'molecular-symmetry/practice',
  'symmetry-teaching': 'molecular-symmetry/teaching',
  'chemistry-inventor': 'chemistry-inventor',
  'drug-discovery': 'drug-discovery',
  'school-mastery': 'school-mastery',
  'senior-core': 'senior-core',
  'chemistry-visuals': 'visuals',
  'organic-visuals': 'visuals/organic',
  'organic-mechanisms': 'visuals/organic/mechanisms',
  'organic-functional-tests': 'visuals/organic/functional-tests',
  'organic-named-reactions': 'visuals/organic/named-reactions',
  'organic-isomerism': 'visuals/organic/isomerism',
  'organic-polymers': 'visuals/organic/polymers',
  'inorganic-visuals': 'visuals/inorganic',
  'inorganic-coordination': 'visuals/inorganic/coordination',
  'inorganic-crystals': 'visuals/inorganic/crystals',
  'inorganic-salt-analysis': 'visuals/inorganic/salt-analysis',
  'inorganic-metallurgy': 'visuals/inorganic/metallurgy',
  'inorganic-pblock': 'visuals/inorganic/p-block',
  'bio-visuals': 'visuals/bio',
  'bio-proteins': 'visuals/bio/proteins',
  'bio-membranes': 'visuals/bio/membranes',
  'bio-carbohydrates': 'visuals/bio/carbohydrates',
  'bio-nucleic-acids': 'visuals/bio/nucleic-acids',
  'bio-metabolism': 'visuals/bio/metabolism',
  'pharma-visuals': 'visuals/pharma',
  'pharma-adme': 'visuals/pharma/adme',
  'pharma-dosage': 'visuals/pharma/dosage',
  'pharma-qc': 'visuals/pharma/qc',
  'pharma-buffers': 'visuals/pharma/buffers',
  'pharma-toxicology': 'visuals/pharma/toxicology',
  'organic-reaction-visualizer': 'modules/organic-reactions',
  'spectroscopy-interpreter': 'modules/spectroscopy',
  'biochemistry-module': 'modules/biochemistry',
  'inorganic-deep-module': 'modules/inorganic',
  'physical-simulators': 'modules/physical',
  'iupac-nomenclature': 'modules/iupac',
  'retrosynthesis-planner': 'modules/retrosynthesis',
  'subject-modules': 'modules',
};

const glossaryTerms = [
  ['CFSE', 'Crystal field stabilization energy from d-orbital splitting.'],
  ['BOD', 'Biochemical oxygen demand, oxygen consumed by microbes in water.'],
  ['Delta G', 'Gibbs free energy; negative values indicate spontaneity.'],
  ['Ksp', 'Solubility product constant for sparingly soluble salts.'],
  ['CIP', 'Priority rules used for E/Z and R/S stereochemistry.'],
  ['PAN', 'Peroxyacetyl nitrate, a photochemical smog irritant.'],
  ['QSAR', 'Quantitative structure-activity relationship linking molecular descriptors to bioactivity.'],
  ['ADME', 'Absorption, distribution, metabolism, and excretion profile for a drug candidate.'],
  ['pLDDT', 'AlphaFold local confidence score for predicted protein structure regions.'],
  ['pChEMBL', 'Normalized potency scale used by ChEMBL for comparable activity values.'],
];

export const Topbar = ({ onMenuToggle, isDark, onThemeToggle, currentPage, onNavigate, recentPages = [], favoritePages = [], onFavoritePageToggle, onSelectElement, studyMode = false, onStudyModeToggle, canInstall = false, onInstallApp, isOnline = true }) => {
  const breadcrumbs = parentCrumbs[currentPage] || [{ id: 'dashboard', label: 'Dashboard' }];
  const [searchOpen, setSearchOpen] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const activeTitle = titles[currentPage] || 'Chemistry Universe';
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pageMatches = pageItems
      .filter(item => !q || `${item.label} ${item.id}`.toLowerCase().includes(q))
      .map(item => ({ type: 'Page', label: item.label, detail: 'Open page', id: item.id }));
    const elementMatches = elements
      .filter(el => q && [el.name, el.symbol, String(el.atomicNumber), el.category].join(' ').toLowerCase().includes(q))
      .slice(0, 8)
      .map(el => ({ type: 'Element', label: `${el.name} (${el.symbol})`, detail: `#${el.atomicNumber} ${el.category}`, element: el }));
    const moleculeMatches = ALL_MOLECULES
      .filter(molecule => q && [molecule.name, molecule.formula, molecule.iupacName].join(' ').toLowerCase().includes(q))
      .slice(0, 5)
      .map(molecule => ({ type: 'Molecule', label: molecule.name, detail: molecule.formula, id: 'molecule' }));
    const toolMatches = labToolCatalog
      .filter(tool => q && [tool.title, tool.type, tool.id].join(' ').toLowerCase().includes(q))
      .slice(0, 8)
      .map(tool => ({ type: 'Tool', label: tool.title, detail: tool.type, id: 'lab' }));
    return [...pageMatches, ...elementMatches, ...moleculeMatches, ...toolMatches].slice(0, 12);
  }, [query]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setSearchOpen(true);
      }
      if (event.key === '?' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const chooseSuggestion = (item) => {
    if (item.element) onSelectElement?.(item.element);
    else onNavigate?.(item.id);
    setSearchOpen(false);
    setQuery('');
  };

  const sharePage = () => {
    if (!navigator.clipboard) return;
    const shareHash = pageHashMap[currentPage] || currentPage;
    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}#/${shareHash}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  const fullscreenPage = () => {
    const target = document.querySelector('main') || document.documentElement;
    if (target.requestFullscreen) target.requestFullscreen();
  };
  const exportFirstVisual = () => {
    const svg = document.querySelector('main svg');
    const canvas = document.querySelector('main canvas');
    if (svg) {
      const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentPage}-visual.svg`;
      a.click();
      URL.revokeObjectURL(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } else if (canvas) {
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `${currentPage}-visual.png`;
      a.click();
    }
  };

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between px-4 border-b border-white/[0.07]"
      style={{ background: 'rgba(3,7,18,0.82)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)' }}>
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-white/10 active:bg-white/15 transition-colors text-gray-400 hover:text-gray-200"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600/60 to-purple-700/60 border border-indigo-500/30 flex items-center justify-center shadow-lg">
            <Atom size={14} className="text-indigo-300" />
          </div>
          <div className="hidden sm:flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => onNavigate?.('dashboard')}
              className="text-[11px] text-gray-500 font-medium hidden md:inline-flex items-center gap-1 hover:text-gray-300 transition-colors"
            >
              <Home size={12} />
              Chemistry Universe
            </button>
            <ChevronRight size={12} className="text-gray-700 hidden md:block flex-shrink-0" />
            <nav className="flex items-center gap-1.5 min-w-0" aria-label="Breadcrumb">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                return (
                  <span key={`${crumb.id}-${index}`} className="inline-flex items-center gap-1.5 min-w-0">
                    {index > 0 && <ChevronRight size={12} className="text-gray-700 flex-shrink-0" />}
                    <button
                      onClick={() => !isLast && onNavigate?.(crumb.id)}
                      disabled={isLast}
                      aria-current={isLast ? 'page' : undefined}
                      className={`text-sm truncate transition-colors ${
                        isLast
                          ? 'font-semibold text-gray-200 cursor-default'
                          : 'text-gray-500 hover:text-indigo-300'
                      }`}
                    >
                      {crumb.label}
                    </button>
                  </span>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`hidden items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold sm:flex ${isOnline ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/25 bg-amber-400/10 text-amber-200'}`} title="Offline cache status">
          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-emerald-300' : 'bg-amber-300'}`} />
          {isOnline ? 'Offline ready' : 'Offline'}
        </div>
        {canInstall && (
          <button onClick={onInstallApp} className="hidden items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-bold text-cyan-100 hover:bg-cyan-400/15 md:flex" title="Install desktop shortcut">
            <Download size={14} />
            Install
          </button>
        )}
        <button
          onClick={() => setSearchOpen(true)}
          className="hidden md:flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-gray-400 hover:text-gray-100"
          title="Search all pages, elements, molecules, and lab tools"
        >
          <Search size={14} />
          Search
          <span className="rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] text-gray-500">/</span>
        </button>
        <button onClick={() => onFavoritePageToggle?.(currentPage)} className={`rounded-xl border border-white/10 p-2 ${favoritePages.includes(currentPage) ? 'bg-amber-500/15 text-amber-300' : 'text-gray-400 hover:text-gray-100'}`} title="Favorite this page">
          <Star size={16} />
        </button>
        <button onClick={sharePage} className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-gray-100" title={copied ? 'Copied' : 'Share this page'}>
          <Share2 size={16} />
        </button>
        <button onClick={exportFirstVisual} className="hidden sm:block rounded-xl border border-white/10 p-2 text-gray-400 hover:text-gray-100" title="Export first visualization">
          <Download size={16} />
        </button>
        <button onClick={fullscreenPage} className="hidden sm:block rounded-xl border border-white/10 p-2 text-gray-400 hover:text-gray-100" title="Fullscreen page">
          <Maximize2 size={16} />
        </button>
        <button onClick={() => setGlossaryOpen(true)} className="hidden sm:block rounded-xl border border-white/10 p-2 text-gray-400 hover:text-gray-100" title="Glossary">
          <BookOpen size={16} />
        </button>
        <button onClick={onStudyModeToggle} className={`hidden lg:block rounded-xl border border-white/10 px-3 py-2 text-xs ${studyMode ? 'bg-cyan-500/15 text-cyan-200' : 'text-gray-400 hover:text-gray-100'}`} title="Study mode">
          Study
        </button>
        <button onClick={() => window.print()} className="rounded-xl border border-white/10 p-2 text-gray-400 hover:text-gray-100" title="Print page">
          <Printer size={16} />
        </button>
        <ThemeToggle isDark={isDark} onToggle={onThemeToggle} />
      </div>
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setSearchOpen(false)}>
          <div className="mx-auto mt-16 max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-gray-950 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <Search size={18} className="text-cyan-300" />
              <input
                autoFocus
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Escape') setSearchOpen(false);
                  if (event.key === 'Enter' && suggestions[0]) chooseSuggestion(suggestions[0]);
                }}
                className="w-full bg-transparent text-sm text-white outline-none"
                placeholder="Search elements, molecules, lab tools, pages..."
              />
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {suggestions.length > 0 ? suggestions.map((item, index) => {
                const cat = item.element ? getCategoryInfo(item.element.category) : null;
                return (
                <button key={`${item.type}-${item.label}-${index}`} onClick={() => chooseSuggestion(item)} className="w-full rounded-xl px-3 py-2 text-left hover:bg-white/[0.06]">
                  <span className="flex items-center gap-3">
                    {item.element ? (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-black" style={{ color: cat.color, borderColor: `${cat.color}55`, background: `${cat.color}18` }}>{item.element.symbol}</span>
                    ) : (
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-cyan-200">{item.type === 'Tool' ? 'Lab Tool' : item.type}</span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-white">{item.label}</span>
                      <span className="block text-xs text-gray-500">{item.detail}</span>
                    </span>
                  </span>
                </button>
              );}) : (
                <div className="p-6 text-center text-sm text-gray-500">No results yet. Try CFT, Oxygen, H2O, or Periodic Table.</div>
              )}
            </div>
            {(recentPages.length > 0 || favoritePages.length > 0) && (
              <div className="border-t border-white/10 p-3 text-xs text-gray-400">
                {favoritePages.length > 0 && <p>Favorites: {favoritePages.map(id => titles[id] || id).join(', ')}</p>}
                {recentPages.length > 0 && <p className="mt-1">Recent: {recentPages.map(id => titles[id] || id).join(', ')}</p>}
              </div>
            )}
          </div>
        </div>
      )}
      {shortcutsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setShortcutsOpen(false)}>
          <div className="mx-auto mt-20 max-w-md rounded-2xl border border-white/10 bg-gray-950 p-5 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-white">Keyboard Shortcuts</h3>
              <button onClick={() => setShortcutsOpen(false)} className="btn-secondary text-xs">Close</button>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              {[
                ['/', 'Open global search'],
                ['?', 'Show this shortcut panel'],
                ['Arrow keys', 'Move across periodic table tiles'],
                ['Enter', 'Open focused element'],
                ['Shift-click', 'Select an element range'],
                ['Space', 'Flip flashcard'],
                ['Left / Right', 'Previous or next flashcard'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] px-3 py-2">
                  <span className="font-mono text-cyan-200">{key}</span>
                  <span className="text-gray-300">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {glossaryOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 p-4 backdrop-blur-sm" onMouseDown={() => setGlossaryOpen(false)}>
          <div className="ml-auto h-full max-w-md overflow-y-auto rounded-2xl border border-white/10 bg-gray-950 p-4 shadow-2xl" onMouseDown={event => event.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-black text-white">Chemistry Glossary</h3>
              <button onClick={() => setGlossaryOpen(false)} className="btn-secondary text-xs">Close</button>
            </div>
            <div className="mt-4 space-y-2">
              {glossaryTerms.map(([term, definition]) => (
                <div key={term} className="rounded-xl border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-sm font-bold text-cyan-200">{term}</p>
                  <p className="mt-1 text-sm text-gray-300">{definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
export default Topbar;
