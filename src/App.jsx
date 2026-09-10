import { useEffect, useState, useCallback, Suspense, lazy } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { AppShell } from "./components/layout/AppShell.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { PeriodicTablePage } from "./pages/PeriodicTablePage.jsx";
import { TrendsPage } from "./pages/TrendsPage.jsx";
import { ComparePage } from "./pages/ComparePage.jsx";
import { AtomVisualizerPage } from "./pages/AtomVisualizerPage.jsx";
import { ChallengeLabTargetPage } from "./pages/ChallengeLabTargetPage.jsx";
import { FavoritesPage } from "./pages/FavoritesPage.jsx";
import { SavedChemistryTargetPage } from "./pages/SavedChemistryTargetPage.jsx";
import { SettingsPage } from "./pages/SettingsPage.jsx";
import LibraryPage from "./pages/LibraryPage.jsx";
import { ChemistryLabPage } from "./pages/ChemistryLabPage.jsx";
import { SyllabusPage } from "./pages/SyllabusPage.jsx";
import { LearningPathTargetPage } from "./pages/LearningPathTargetPage.jsx";
import { ReactionBalancerTargetPage } from "./pages/ReactionBalancerTargetPage.jsx";
import { StudyToolkitTargetPage } from "./pages/StudyToolkitTargetPage.jsx";
import { SubjectModulePage } from "./pages/SubjectModulePage.jsx";
import { SchoolChemistryMasteryTargetPage } from "./pages/SchoolChemistryMasteryTargetPage.jsx";
import { SeniorChemistryCorePage } from "./pages/SeniorChemistryCorePage.jsx";
import { AdvancedVisualChemistryPage } from "./pages/AdvancedVisualChemistryPage.jsx";
import { PracticeExamTutorPage } from "./pages/PracticeExamTutorPage.jsx";
import { LearningCommandCenterDashboardPage } from "./pages/LearningCommandCenterDashboardPage.jsx";
import { CurriculumCoverageDashboardPage } from "./pages/CurriculumCoverageDashboardPage.jsx";
import OrganicVisualsTargetPage from "./pages/OrganicVisualsTargetPage.jsx";
import OrganicMechanismTargetPage from "./pages/OrganicMechanismTargetPage.jsx";
import FunctionalTestsTargetPage from "./pages/FunctionalTestsTargetPage.jsx";
import NamedReactionsTargetPage from "./pages/NamedReactionsTargetPage.jsx";
import IsomerismTargetPage from "./pages/IsomerismTargetPage.jsx";
import PolymerTargetPage from "./pages/PolymerTargetPage.jsx";
import CoordinationTargetPage from "./pages/CoordinationTargetPage.jsx";
import CrystalTargetPage from "./pages/CrystalTargetPage.jsx";
import SaltAnalysisTargetPage from "./pages/SaltAnalysisTargetPage.jsx";
import MetallurgyTargetPage from "./pages/MetallurgyTargetPage.jsx";
import PBlockTargetPage from "./pages/PBlockTargetPage.jsx";
import BioVisualsTargetPage from "./pages/BioVisualsTargetPage.jsx";
import MetabolismTargetPage from "./pages/MetabolismTargetPage.jsx";
import PharmaVisualsTargetPage from "./pages/PharmaVisualsTargetPage.jsx";
import MedicinalChemistryPage from "./modules/pharma-lab/MedicinalChemistryPage.jsx";
import ApiSynthesisPage from "./modules/pharma-lab/ApiSynthesisPage.jsx";
import PreformulationPage from "./modules/pharma-lab/PreformulationPage.jsx";
import TabletFormulationPage from "./modules/pharma-lab/TabletFormulationPage.jsx";
import DissolutionPage from "./modules/pharma-lab/DissolutionPage.jsx";
import HplcPage from "./modules/pharma-lab/HplcPage.jsx";
import StabilityPage from "./modules/pharma-lab/StabilityPage.jsx";
import AdmeLabPage from "./modules/pharma-lab/AdmeLabPage.jsx";
import ToxicologyLabPage from "./modules/pharma-lab/ToxicologyLabPage.jsx";
import DosageTargetPage from "./pages/DosageTargetPage.jsx";
import QCTargetPage from "./pages/QCTargetPage.jsx";
import BufferTargetPage from "./pages/BufferTargetPage.jsx";
import OrganicReactionTargetPage from "./pages/OrganicReactionTargetPage.jsx";
import SpectroscopyTargetPage from "./pages/SpectroscopyTargetPage.jsx";
import ModulesHubTargetPage from "./pages/ModulesHubTargetPage.jsx";
import IupacTargetPage from "./pages/IupacTargetPage.jsx";
import PhysicalTargetPage from "./pages/PhysicalTargetPage.jsx";
import InorganicDeepTargetPage from "./pages/InorganicDeepTargetPage.jsx";
import ChemistrySubjectHomePage from "./pages/ChemistrySubjectHomePage.jsx";
import VirtualLabsHomePage from "./pages/VirtualLabsHomePage.jsx";
import RetrosynthesisTargetPage from "./pages/RetrosynthesisTargetPage.jsx";
import { useTheme } from "./hooks/useTheme.js";
import { useLocalStorage } from "./hooks/useLocalStorage.js";

const MoleculeScenePage = lazy(() => import("./pages/MoleculeScenePage.jsx"));
const ProteinTargetPage = lazy(() => import("./pages/ProteinTargetPage.jsx"));
const NucleicAcidExplorer = lazy(
  () => import("./modules/nucleic-acid-explorer/NucleicAcidExplorer.jsx"),
);
const CarbohydrateStudio = lazy(
  () => import("./modules/carbohydrate-studio/CarbohydrateStudio.jsx"),
);
const VirtualLabTargetPage = lazy(
  () => import("./pages/VirtualLabTargetPage.jsx"),
);
const MolecularSymmetryModule = lazy(
  () => import("./modules/molecular-symmetry/MolecularSymmetryModule.jsx"),
);
const ChemistrySolverModule = lazy(
  () => import("./modules/chemistry-solver/ChemistrySolverTargetPage.jsx"),
);
const ChemistryInventorStudio = lazy(
  () => import("./modules/chemistry-inventor/ChemistryInventorTargetPage.jsx"),
);
const DrugDiscoveryModule = lazy(
  () => import("./modules/drug-discovery/DrugDiscoveryStudio.jsx"),
);
const ResearchToolkitDashboardPage = lazy(
  () => import("./pages/ResearchToolkitDashboardPage.jsx"),
);
const BiochemistryTargetPage = lazy(
  () => import("./pages/BiochemistryTargetPage.jsx"),
);
const MembraneTargetPage = lazy(
  () => import("./pages/MembraneTargetPage.jsx"),
);
const ARVRMRModule = lazy(
  () => import("./modules/ar-vr-mr/ImmersiveChemistryTargetPage.jsx"),
);
const AtomBuilderPage = lazy(
  () => import("./modules/core-simulations/AtomBuilderPage.jsx"),
);
const GasPropertiesPage = lazy(
  () => import("./modules/core-simulations/GasPropertiesPage.jsx"),
);
const ReactionLeftoversPage = lazy(
  () => import("./modules/core-simulations/ReactionLeftoversPage.jsx"),
);
const AcidBaseSolutionsPage = lazy(
  () => import("./modules/core-simulations/AcidBaseSolutionsPage.jsx"),
);
const MoleculePolarityPage = lazy(
  () => import("./modules/core-simulations/MoleculePolarityPage.jsx"),
);
const MoleculesLightPage = lazy(
  () => import("./modules/core-simulations/MoleculesLightPage.jsx"),
);
const StatesMatterPage = lazy(
  () => import("./modules/core-simulations/StatesMatterPage.jsx"),
);

const pageHashMap = {
  library: "library",
  "atom-builder": "simulations/atom-builder",
  "gas-properties": "simulations/gas-properties",
  "reaction-leftovers": "simulations/reaction-leftovers",
  "acid-base-solutions": "simulations/acid-base-solutions",
  "molecule-polarity": "simulations/molecule-polarity",
  "molecules-light": "simulations/molecules-light",
  "states-matter": "simulations/states-matter",
  symmetry: "molecular-symmetry",
  "symmetry-operations": "molecular-symmetry/operations",
  "symmetry-point-groups": "molecular-symmetry/point-groups",
  "symmetry-practice": "molecular-symmetry/practice",
  "symmetry-teaching": "molecular-symmetry/teaching",
  "chemistry-solver": "chemistry-solver",
  "chemistry-solver-questions": "chemistry-solver/questions",
  "chemistry-solver-bookmarks": "chemistry-solver/bookmarks",
  "chemistry-solver-practice": "chemistry-solver/practice",
  "chemistry-inventor": "chemistry-inventor",
  "drug-discovery": "drug-discovery",
  "ar-vr-mr": "ar-vr-mr",
  "school-mastery": "school-mastery",
  "senior-core": "senior-core",
  "advanced-visuals": "advanced-visuals",
  "practice-tutor": "practice-tutor",
  "learning-command": "learning-command",
  "coverage-audit": "coverage-audit",
  "research-toolkit": "research-toolkit",
  "chemistry-visuals": "visuals",
  "organic-visuals": "visuals/organic",
  "organic-mechanisms": "visuals/organic/mechanisms",
  "organic-functional-tests": "visuals/organic/functional-tests",
  "organic-named-reactions": "visuals/organic/named-reactions",
  "organic-isomerism": "visuals/organic/isomerism",
  "organic-polymers": "visuals/organic/polymers",
  "inorganic-visuals": "visuals/inorganic",
  "inorganic-coordination": "visuals/inorganic/coordination",
  "inorganic-crystals": "visuals/inorganic/crystals",
  "inorganic-salt-analysis": "visuals/inorganic/salt-analysis",
  "inorganic-metallurgy": "visuals/inorganic/metallurgy",
  "inorganic-pblock": "visuals/inorganic/p-block",
  "bio-visuals": "visuals/bio",
  "bio-proteins": "visuals/bio/proteins",
  "bio-membranes": "visuals/bio/membranes",
  "bio-carbohydrates": "visuals/bio/carbohydrates",
  "bio-nucleic-acids": "visuals/bio/nucleic-acids",
  "bio-metabolism": "visuals/bio/metabolism",
  "pharma-visuals": "visuals/pharma",
  "pharma-preformulation": "visuals/pharma/preformulation",
  "pharma-tablet-formulation": "visuals/pharma/tablet-formulation",
  "pharma-dissolution": "visuals/pharma/dissolution",
  "pharma-hplc": "visuals/pharma/hplc",
  "pharma-stability": "visuals/pharma/stability",
  "pharma-adme": "visuals/pharma/adme",
  "pharma-dosage": "visuals/pharma/dosage",
  "pharma-qc": "visuals/pharma/qc",
  "pharma-buffers": "visuals/pharma/buffers",
  "pharma-toxicology": "visuals/pharma/toxicology",
  "organic-reaction-visualizer": "modules/organic-reactions",
  "spectroscopy-interpreter": "modules/spectroscopy",
  "biochemistry-module": "modules/biochemistry",
  "inorganic-deep-module": "modules/inorganic",
  "physical-simulators": "modules/physical",
  "iupac-nomenclature": "modules/iupac",
  "retrosynthesis-planner": "modules/retrosynthesis",
  "subject-modules": "modules",
  "physical-chemistry": "physical-chemistry",
  "organic-chemistry": "organic-chemistry",
  "inorganic-chemistry": "inorganic-chemistry",
  "analytical-chemistry": "analytical-chemistry",
  "virtual-labs": "virtual-labs",
  "physical-chemistry-vl": "virtual-labs",
  "organic-chemistry-vl": "virtual-labs",
  "inorganic-chemistry-vl": "virtual-labs",
  "advanced-analytical-chemistry-vl": "virtual-labs",
};
const hashPageMap = {
  library: "library",
  "simulations/atom-builder": "atom-builder",
  "simulations/gas-properties": "gas-properties",
  "simulations/reaction-leftovers": "reaction-leftovers",
  "simulations/acid-base-solutions": "acid-base-solutions",
  "simulations/molecule-polarity": "molecule-polarity",
  "simulations/molecules-light": "molecules-light",
  "simulations/states-matter": "states-matter",
  "molecular-symmetry": "symmetry",
  "molecular-symmetry/operations": "symmetry-operations",
  "molecular-symmetry/point-groups": "symmetry-point-groups",
  "molecular-symmetry/practice": "symmetry-practice",
  "molecular-symmetry/teaching": "symmetry-teaching",
  "chemistry-solver": "chemistry-solver",
  "chemistry-solver/questions": "chemistry-solver-questions",
  "chemistry-solver/bookmarks": "chemistry-solver-bookmarks",
  "chemistry-solver/practice": "chemistry-solver-practice",
  "chemistry-inventor": "chemistry-inventor",
  "drug-discovery": "drug-discovery",
  "ar-vr-mr": "ar-vr-mr",
  "school-mastery": "school-mastery",
  "senior-core": "senior-core",
  "advanced-visuals": "advanced-visuals",
  "practice-tutor": "practice-tutor",
  "learning-command": "learning-command",
  "coverage-audit": "coverage-audit",
  "research-toolkit": "research-toolkit",
  visuals: "chemistry-visuals",
  "visuals/organic": "organic-visuals",
  "visuals/organic/mechanisms": "organic-mechanisms",
  "visuals/organic/functional-tests": "organic-functional-tests",
  "visuals/organic/named-reactions": "organic-named-reactions",
  "visuals/organic/isomerism": "organic-isomerism",
  "visuals/organic/polymers": "organic-polymers",
  "visuals/inorganic": "inorganic-visuals",
  "visuals/inorganic/coordination": "inorganic-coordination",
  "visuals/inorganic/crystals": "inorganic-crystals",
  "visuals/inorganic/salt-analysis": "inorganic-salt-analysis",
  "visuals/inorganic/metallurgy": "inorganic-metallurgy",
  "visuals/inorganic/p-block": "inorganic-pblock",
  "visuals/bio": "bio-visuals",
  "visuals/bio/proteins": "bio-proteins",
  "visuals/bio/membranes": "bio-membranes",
  "visuals/bio/carbohydrates": "bio-carbohydrates",
  "visuals/bio/nucleic-acids": "bio-nucleic-acids",
  "visuals/bio/metabolism": "bio-metabolism",
  "visuals/pharma": "pharma-visuals",
  "visuals/pharma/medicinal-chemistry": "pharma-medicinal",
  "visuals/pharma/api-synthesis": "pharma-api-synthesis",
  "visuals/pharma/preformulation": "pharma-preformulation",
  "visuals/pharma/tablet-formulation": "pharma-tablet-formulation",
  "visuals/pharma/dissolution": "pharma-dissolution",
  "visuals/pharma/hplc": "pharma-hplc",
  "visuals/pharma/stability": "pharma-stability",
  "visuals/pharma/adme": "pharma-adme",
  "visuals/pharma/dosage": "pharma-dosage",
  "visuals/pharma/qc": "pharma-qc",
  "visuals/pharma/buffers": "pharma-buffers",
  "visuals/pharma/toxicology": "pharma-toxicology",
  "modules/organic-reactions": "organic-reaction-visualizer",
  "modules/spectroscopy": "spectroscopy-interpreter",
  "modules/biochemistry": "biochemistry-module",
  "modules/inorganic": "inorganic-deep-module",
  "modules/physical": "physical-simulators",
  "modules/iupac": "iupac-nomenclature",
  "modules/retrosynthesis": "retrosynthesis-planner",
  modules: "subject-modules",
  "physical-chemistry": "physical-chemistry",
  "organic-chemistry": "organic-chemistry",
  "inorganic-chemistry": "inorganic-chemistry",
  "analytical-chemistry": "analytical-chemistry",
  "virtual-labs": "virtual-labs",
};

const symmetrySections = {
  symmetry: "visualizer",
  "symmetry-operations": "operations",
  "symmetry-point-groups": "point-groups",
  "symmetry-practice": "practice",
  "symmetry-teaching": "teaching",
};

const labVisualRoutes = {
  "chemistry-visuals": { focus: "all", experiment: "molecule-links" },
  "organic-visuals": { focus: "organic", experiment: "mechanism" },
  "organic-mechanisms": { focus: "organic", experiment: "mechanism" },
  "organic-functional-tests": {
    focus: "organic",
    experiment: "functional-tests",
  },
  "organic-named-reactions": {
    focus: "organic",
    experiment: "named-reactions",
  },
  "organic-isomerism": { focus: "organic", experiment: "isomerism" },
  "organic-polymers": { focus: "organic", experiment: "polymer" },
  "inorganic-visuals": { focus: "inorganic", experiment: "cft" },
  "inorganic-coordination": { focus: "inorganic", experiment: "cft" },
  "inorganic-crystals": { focus: "inorganic", experiment: "crystal-defects" },
  "inorganic-salt-analysis": {
    focus: "inorganic",
    experiment: "salt-analysis",
  },
  "inorganic-metallurgy": { focus: "inorganic", experiment: "metallurgy" },
  "inorganic-pblock": { focus: "inorganic", experiment: "pblock-advanced" },
  "bio-visuals": { focus: "bio", experiment: "protein-structure" },
  "bio-proteins": { focus: "bio", experiment: "protein-structure" },
  "bio-membranes": { focus: "bio", experiment: "lipid-membrane" },
  "bio-carbohydrates": { focus: "bio", experiment: "carbohydrate-lab" },
  "bio-nucleic-acids": { focus: "bio", experiment: "nucleic-acid-lab" },
  "bio-metabolism": { focus: "bio", experiment: "metabolism-atp" },
  "pharma-visuals": { focus: "pharma", experiment: "drug-functional-groups" },
  "pharma-adme": { focus: "pharma", experiment: "adme-ionization" },
  "pharma-dosage": { focus: "pharma", experiment: "dosage-form-lab" },
  "pharma-qc": { focus: "pharma", experiment: "pharma-analysis" },
  "pharma-buffers": { focus: "pharma", experiment: "pharma-buffer-lab" },
  "pharma-toxicology": { focus: "pharma", experiment: "toxicology-chelation" },
};

const subjectModuleRoutes = new Set([
  "organic-reaction-visualizer",
  "spectroscopy-interpreter",
  "biochemistry-module",
  "inorganic-deep-module",
  "physical-simulators",
  "iupac-nomenclature",
  "retrosynthesis-planner",
  "subject-modules",
]);

const pageStatusLabels = {
  dashboard: "Dashboard",
  table: "Periodic Table",
  trends: "Periodic Trends",
  compare: "Compare Elements",
  atom: "Atom Visualizer",
  "atom-builder": "Build an Atom and Nucleus",
  "gas-properties": "Gas Properties",
  "reaction-leftovers": "Reactants, Products and Leftovers",
  "acid-base-solutions": "Acid-Base Solutions",
  "molecule-polarity": "Molecule Polarity",
  "molecules-light": "Molecules and Light",
  "states-matter": "States of Matter",
  molecule: "3D Molecule Viewer",
  symmetry: "Molecular Symmetry Visualizer",
  "symmetry-operations": "Symmetry Operations Guide",
  "symmetry-point-groups": "Point Group Finder",
  "symmetry-practice": "Self Learning Predictor",
  "symmetry-teaching": "Symmetry Teaching Resources",
  lab: "Chemistry Lab",
  syllabus: "Syllabus Map",
  quiz: "Quiz Mode",
  favorites: "Favorites",
  settings: "Settings",
  balancer: "Equation Balancer",
  "study-tools": "Study Tools",
  "chemistry-solver": "Chemistry Solver",
  "chemistry-solver-questions": "Chemistry Solver Questions",
  "chemistry-solver-bookmarks": "Chemistry Solver Bookmarks",
  "chemistry-solver-practice": "Chemistry Solver Practice",
  "chemistry-inventor": "Chemistry Inventor Studio",
  "drug-discovery": "Drug Discovery",
  "ar-vr-mr": "AR/VR/MR Chemistry",
  "school-mastery": "School Chemistry Mastery",
  "senior-core": "Senior Chemistry Core",
  "advanced-visuals": "Advanced Visual Chemistry",
  "practice-tutor": "Practice, Exams and Tutor",
  "learning-command": "Learning Command Center",
  "coverage-audit": "Curriculum Map",
  "research-toolkit": "Research Chemistry Toolkit",
  "chemistry-visuals": "Chemistry Visuals",
  "organic-visuals": "Organic Chemistry Visuals",
  "organic-mechanisms": "Organic Mechanism Player",
  "organic-functional-tests": "Organic Functional Tests",
  "organic-named-reactions": "Organic Named Reactions",
  "organic-isomerism": "Organic Isomerism Explorer",
  "organic-polymers": "Organic Polymer Builder",
  "inorganic-visuals": "Inorganic Chemistry Visuals",
  "inorganic-coordination": "Coordination and CFT Visuals",
  "inorganic-crystals": "Crystal Structure Visuals",
  "inorganic-salt-analysis": "Inorganic Salt Analysis",
  "inorganic-metallurgy": "Metallurgy Visual Flowchart",
  "inorganic-pblock": "p-Block Inorganic Reference",
  "bio-visuals": "Biochemistry Visuals",
  "bio-proteins": "Protein and Enzyme Visuals",
  "bio-membranes": "Lipid and Membrane Visuals",
  "bio-carbohydrates": "Carbohydrate Visuals",
  "bio-nucleic-acids": "DNA and RNA Visuals",
  "bio-metabolism": "Metabolism and ATP Visuals",
  "pharma-visuals": "Pharma Chemistry Visuals",
  "pharma-adme": "ADME and Ionization Visuals",
  "pharma-dosage": "Dosage Form Visuals",
  "pharma-qc": "Pharmaceutical Assay and QC",
  "pharma-buffers": "Pharmaceutical Buffer Visuals",
  "pharma-toxicology": "Toxicology and Chelation Visuals",
  "organic-reaction-visualizer": "Organic Reaction Visualizer",
  "spectroscopy-interpreter": "Spectroscopy Interpreter",
  "biochemistry-module": "Biochemistry Module",
  "inorganic-deep-module": "Inorganic Chemistry Deep Module",
  "physical-simulators": "Physical Chemistry Studio",
  "iupac-nomenclature": "IUPAC Nomenclature Practice",
  "retrosynthesis-planner": "Retrosynthesis and Synthesis Planner",
  "subject-modules": "Subject Modules",
};

const formatPageStatusLabel = (page) =>
  pageStatusLabels[page] ||
  page
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") ||
  "Dashboard";

const getLoadingDetail = (page) => {
  if (subjectModuleRoutes.has(page))
    return "Preparing 3D scene, reaction controls, and module data...";
  if (labVisualRoutes[page])
    return "Opening visual experiment, submenu context, and simulation controls...";
  if (page === "molecule" || page.startsWith("symmetry"))
    return "Preparing molecular canvas, controls, and 3D assets...";
  if (page === "school-mastery")
    return "Preparing grade path, experiments, practice, viva, and visual links...";
  if (page === "senior-core")
    return "Preparing senior chemistry tracks, formulae, mechanisms, and 3D routes...";
  if (page === "advanced-visuals")
    return "Preparing advanced visual modules, simulations, and 2D/3D launch paths...";
  if (page === "practice-tutor")
    return "Preparing adaptive practice, exams, mistake notebook, flashcards, and tutor prompts...";
  if (page === "learning-command")
    return "Preparing learning paths, teacher assignments, printable artifacts, and readiness checks...";
  if (page === "coverage-audit")
    return "Preparing board coverage, missing pieces, 2D/3D readiness, and priority gap backlog...";
  if (page === "research-toolkit")
    return "Preparing research workflows, data fitting, provenance, and reproducibility tools...";
  if (page === "chemistry-inventor")
    return "Preparing builder palette, canvas, inspector, and simulation status...";
  if (page === "ar-vr-mr")
    return "Preparing WebXR support checks, immersive scene, and AR/VR/MR controls...";
  return "Preparing page content and interactive controls...";
};

function LoadingProgress({
  title,
  detail,
  height = 620,
  reducedMotion = false,
}) {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(78);
      return undefined;
    }

    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 92) return value;
        const increment = value < 45 ? 9 : value < 75 ? 5 : 2;
        return Math.min(92, value + increment);
      });
    }, 180);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <div
      className="page-transition p-4 md:p-6 max-w-7xl mx-auto space-y-3"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <div className="glass rounded-2xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
              Loading Progress
            </p>
            <h2 className="mt-1 text-base font-black text-white">{title}</h2>
            <p className="mt-1 text-xs text-gray-400">{detail}</p>
          </div>
          <div className="text-2xl font-black tabular-nums text-cyan-100">
            {progress}%
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full border border-white/10 bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-300 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="skeleton h-12 rounded-2xl" />
      <div className="skeleton rounded-2xl" style={{ height }} />
    </div>
  );
}

function App() {
  const { theme, toggle: toggleTheme, isDark } = useTheme();
  const resolveLocationPage = () => {
    const rawHash = window.location.hash.replace(/^#\/?/, "");
    const nestedHash = rawHash.split("#").filter(Boolean);
    const path = window.location.pathname.replace(/^\//, "");
    if (path.startsWith("nucleic-acid-explorer")) return "bio-nucleic-acids";
    if (path.startsWith("carbohydrate-structure-studio"))
      return "bio-carbohydrates";
    if (path.startsWith("drug-discovery")) return "drug-discovery";
    if (rawHash.startsWith("drug-discovery")) return "drug-discovery";
    if (nestedHash.length > 1 && nestedHash.at(-1) === "molecule")
      return "molecule";
    if (
      path.endsWith("/simulations/acid-base-solutions") &&
      rawHash === "molecule"
    )
      return "molecule";
    if (rawHash.startsWith("modules/physical/")) return "physical-simulators";
    return (
      hashPageMap[rawHash] ||
      hashPageMap[nestedHash[0]] ||
      rawHash ||
      "dashboard"
    );
  };
  const [currentPage, setCurrentPage] = useState(() => {
    return resolveLocationPage();
  });
  const [favorites, setFavorites] = useLocalStorage("cu-favorites", []);
  const [compact, setCompact] = useLocalStorage("cu-compact", false);
  const [studyMode, setStudyMode] = useLocalStorage("cu-study-mode", false);
  const [reducedMotion, setReducedMotion] = useLocalStorage(
    "cu-reduced-motion",
    false,
  );
  const [highContrast, setHighContrast] = useLocalStorage(
    "cu-high-contrast",
    false,
  );
  const [colorTheme, setColorTheme] = useLocalStorage(
    "cu-color-theme",
    "study",
  );
  const [language, setLanguage] = useLocalStorage("cu-language", "en");
  const [recentPages, setRecentPages] = useLocalStorage("cu-recent-pages", []);
  const [favoritePages, setFavoritePages] = useLocalStorage(
    "cu-favorite-pages",
    [],
  );
  const [serviceWorkerUpdate, setServiceWorkerUpdate] = useState(null);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [routeProgress, setRouteProgress] = useState(100);
  const [routeStatus, setRouteStatus] = useState({
    visible: false,
    title: "Ready",
    detail: "Dashboard ready",
    ready: true,
  });

  // Cross-page element state
  const [atomViewerElement, setAtomViewerElement] = useState(null);
  const [compareElement, setCompareElement] = useState(null);

  const navigate = useCallback(
    (page) => {
      const label = formatPageStatusLabel(page);
      setRouteProgress(18);
      setRouteStatus({
        visible: true,
        title: `Opening ${label}`,
        detail: "Syncing route and preparing chemistry tools...",
        ready: false,
      });
      setCurrentPage(page);
      const nextHash = pageHashMap[page] || page;
      if (window.location.hash.replace(/^#\/?/, "") !== nextHash) {
        window.location.hash = nextHash;
      }
      setRecentPages((prev) =>
        [page, ...prev.filter((id) => id !== page)].slice(0, 8),
      );
    },
    [setRecentPages],
  );

  useEffect(() => {
    const handleHashChange = () => {
      const nextPage = resolveLocationPage();
      setRouteProgress(18);
      setRouteStatus({
        visible: true,
        title: `Opening ${formatPageStatusLabel(nextPage)}`,
        detail: "Reading route and preparing page state...",
        ready: false,
      });
      setCurrentPage((previousPage) => {
        if (previousPage === nextPage) {
          setRouteProgress(100);
          setRouteStatus({
            visible: false,
            title: `Ready: ${formatPageStatusLabel(nextPage)}`,
            detail: "All visible controls loaded.",
            ready: true,
          });
        }
        return nextPage;
      });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    const label = formatPageStatusLabel(currentPage);
    setRouteProgress(64);
    setRouteStatus({
      visible: true,
      title: `Loading ${label}`,
      detail: getLoadingDetail(currentPage),
      ready: false,
    });
    const done = window.setTimeout(() => {
      setRouteProgress(100);
      setRouteStatus({
        visible: true,
        title: `Ready: ${label}`,
        detail: "All visible controls loaded.",
        ready: true,
      });
    }, 320);
    const hide = window.setTimeout(() => {
      setRouteStatus((status) => ({ ...status, visible: false }));
    }, 1200);
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(hide);
    };
  }, [currentPage]);

  useEffect(() => {
    const handleInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };
    const handleInstalled = () => setInstallPrompt(null);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("beforeinstallprompt", handleInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = (event) =>
      setServiceWorkerUpdate(() => event.detail?.refresh || null);
    window.addEventListener("app-service-worker-update", handleUpdate);
    return () =>
      window.removeEventListener("app-service-worker-update", handleUpdate);
  }, []);

  const handleFavoriteToggle = useCallback(
    (element) => {
      setFavorites((prev) => {
        const exists = prev.some(
          (f) => f.atomicNumber === element.atomicNumber,
        );
        return exists
          ? prev.filter((f) => f.atomicNumber !== element.atomicNumber)
          : [...prev, element];
      });
    },
    [setFavorites],
  );

  const handleRemoveFavorite = useCallback(
    (element) => {
      setFavorites((prev) =>
        prev.filter((f) => f.atomicNumber !== element.atomicNumber),
      );
    },
    [setFavorites],
  );

  const handleViewAtom = useCallback(
    (element) => {
      setAtomViewerElement(element);
      navigate("atom");
    },
    [navigate],
  );

  const handleCompare = useCallback(
    (element) => {
      setCompareElement(element);
      navigate("compare");
    },
    [navigate],
  );

  const handleSelectElement = useCallback(
    (element) => {
      setAtomViewerElement(element);
      navigate("table");
    },
    [navigate],
  );

  const toggleFavoritePage = useCallback(
    (page) => {
      setFavoritePages((prev) =>
        prev.includes(page)
          ? prev.filter((id) => id !== page)
          : [page, ...prev].slice(0, 12),
      );
    },
    [setFavoritePages],
  );

  const handleResetData = () => {
    if (
      window.confirm(
        "Reset all app data? This clears favorites, quiz scores, and settings.",
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleInstallApp = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    setInstallPrompt(null);
  }, [installPrompt]);

  const toggleThemeWithReveal = useCallback(
    (event) => {
      const rect = event?.currentTarget?.getBoundingClientRect?.();
      const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 32;
      const y = rect ? rect.top + rect.height / 2 : 32;
      const reveal = document.createElement("div");
      reveal.className = "theme-reveal";
      reveal.style.left = `${x}px`;
      reveal.style.top = `${y}px`;
      document.body.appendChild(reveal);
      toggleTheme();
      window.setTimeout(() => reveal.remove(), 340);
    },
    [toggleTheme],
  );

  const commonProps = {
    favorites,
    onFavoriteToggle: handleFavoriteToggle,
    onViewAtom: handleViewAtom,
    onCompare: handleCompare,
    reducedMotion,
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigate={navigate}
            onSelectElement={handleSelectElement}
            recentPages={recentPages}
            favoritePages={favoritePages}
          />
        );
      case "physical-chemistry":
      case "organic-chemistry":
      case "inorganic-chemistry":
      case "analytical-chemistry":
        return (
          <ChemistrySubjectHomePage page={currentPage} onNavigate={navigate} />
        );
      case "virtual-labs":
        return <VirtualLabsHomePage onNavigate={navigate} />;
      case "table":
        return <PeriodicTablePage {...commonProps} />;
      case "trends":
        return <TrendsPage {...commonProps} />;
      case "compare":
        return <ComparePage initialElement={compareElement} />;
      case "atom":
        return (
          <AtomVisualizerPage
            initialElement={atomViewerElement}
            reducedMotion={reducedMotion}
          />
        );
      case "atom-builder":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading atom builder"
                detail="Preparing nucleons, shells, and isotope calculations..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <AtomBuilderPage />
          </Suspense>
        );
      case "gas-properties":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading gas properties"
                detail="Preparing particle collisions, gauges, and live graph..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <GasPropertiesPage />
          </Suspense>
        );
      case "reaction-leftovers":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading reaction particles"
                detail="Preparing balanced recipes and particle conservation..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <ReactionLeftoversPage />
          </Suspense>
        );
      case "acid-base-solutions":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading acid-base solutions"
                detail="Preparing ions, probes, and equilibrium calculations..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <AcidBaseSolutionsPage />
          </Suspense>
        );
      case "molecule-polarity":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading molecule polarity"
                detail="Preparing molecular geometry and dipole vectors..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <MoleculePolarityPage />
          </Suspense>
        );
      case "molecules-light":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading molecules and light"
                detail="Preparing photons, molecular modes, and absorption spectra..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <MoleculesLightPage />
          </Suspense>
        );
      case "states-matter":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading states of matter"
                detail="Preparing particles, phase transitions, and heating curve..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <StatesMatterPage reducedMotion={reducedMotion} onNavigate={navigate} />
          </Suspense>
        );
      case "molecule":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading 3D viewer"
                detail="Preparing molecular canvas and controls..."
                height={560}
                reducedMotion={reducedMotion}
              />
            }
          >
            <MoleculeScenePage onNavigate={navigate} />
          </Suspense>
        );
      case "library":
        return <LibraryPage onNavigate={navigate} />;
      case "symmetry":
      case "symmetry-operations":
      case "symmetry-point-groups":
      case "symmetry-practice":
      case "symmetry-teaching":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading molecular symmetry laboratory"
                detail="Preparing symmetry operations, point-group tools, and 3D viewer..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <MolecularSymmetryModule
              section={symmetrySections[currentPage]}
              currentPage={currentPage}
              onNavigate={navigate}
            />
          </Suspense>
        );
      case "chemistry-solver":
      case "chemistry-solver-questions":
      case "chemistry-solver-bookmarks":
      case "chemistry-solver-practice":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading chemistry solver"
                detail="Loading solved question bank, filters, and learning assistant..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <ChemistrySolverModule
              key={currentPage}
              initialPage={{
                "chemistry-solver-bookmarks": "Saved Solutions",
                "chemistry-solver-practice": "Simulations",
              }[currentPage] || "New Problem"}
            />
          </Suspense>
        );
      case "chemistry-inventor":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading Chemistry Inventor Studio"
                detail="Preparing builder palette, canvas, inspector, and simulation panel..."
                height={640}
                reducedMotion={reducedMotion}
              />
            }
          >
            <ChemistryInventorStudio />
          </Suspense>
        );
      case "drug-discovery":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading Drug Discovery Module"
                detail="Preparing AlphaFold, ChEMBL, PubChem, PDB, SAR, docking, and ADME workspaces..."
                height={680}
                reducedMotion={reducedMotion}
              />
            }
          >
            <DrugDiscoveryModule />
          </Suspense>
        );
      case "ar-vr-mr":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading AR/VR/MR Chemistry"
                detail="Preparing WebXR support checks, immersive scene, and XR launch controls..."
                height={680}
                reducedMotion={reducedMotion}
              />
            }
          >
            <ARVRMRModule reducedMotion={reducedMotion} />
          </Suspense>
        );
      case "school-mastery":
        return <SchoolChemistryMasteryTargetPage onNavigate={navigate} />;
      case "senior-core":
        return <SeniorChemistryCorePage onNavigate={navigate} />;
      case "advanced-visuals":
        return <AdvancedVisualChemistryPage onNavigate={navigate} />;
      case "practice-tutor":
        return <PracticeExamTutorPage onNavigate={navigate} />;
      case "learning-command":
        return <LearningCommandCenterDashboardPage onNavigate={navigate} />;
      case "coverage-audit":
        return <CurriculumCoverageDashboardPage onNavigate={navigate} />;
      case "research-toolkit":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading research structure workspace"
                detail="Preparing Mol*, local coordinate samples, spectra, and notebook tools..."
              />
            }
          >
            <ResearchToolkitDashboardPage onNavigate={navigate} />
          </Suspense>
        );
      case "organic-reaction-visualizer":
        return <OrganicReactionTargetPage onNavigate={navigate} />;
      case "spectroscopy-interpreter":
        return <SpectroscopyTargetPage onNavigate={navigate} />;
      case "biochemistry-module":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading biochemistry virtual lab"
                detail="Preparing the experiment, Mol* structure reference, and notebook..."
              />
            }
          >
            <BiochemistryTargetPage onNavigate={navigate} />
          </Suspense>
        );
      case "inorganic-deep-module":
        return <InorganicDeepTargetPage onNavigate={navigate} />;
      case "physical-simulators":
        return <PhysicalTargetPage onNavigate={navigate} />;
      case "iupac-nomenclature":
        return <IupacTargetPage onNavigate={navigate} />;
      case "retrosynthesis-planner":
        return <RetrosynthesisTargetPage onNavigate={navigate} />;
      case "subject-modules":
        return <ModulesHubTargetPage />;
      case "subject-modules-legacy":
        return (
          <SubjectModulePage
            moduleId={
              currentPage === "subject-modules"
                ? "organic-reaction-visualizer"
                : currentPage
            }
          />
        );
      case "quiz":
        return <ChallengeLabTargetPage onNavigate={navigate} />;
      case "chemistry-visuals": {
        const route =
          labVisualRoutes[currentPage] || labVisualRoutes["chemistry-visuals"];
        return (
          <ChemistryLabPage
            initialFocusTopic={route.focus}
            initialExperimentId={route.experiment}
          />
        );
      }
      case "organic-visuals":
        return <OrganicVisualsTargetPage onNavigate={navigate} />;
      case "organic-mechanisms":
        return <OrganicMechanismTargetPage onNavigate={navigate} />;
      case "organic-functional-tests":
        return <FunctionalTestsTargetPage />;
      case "organic-named-reactions":
        return <NamedReactionsTargetPage onNavigate={navigate} />;
      case "organic-isomerism":
        return <IsomerismTargetPage />;
      case "organic-polymers":
        return <PolymerTargetPage />;
      case "inorganic-visuals":
        return <InorganicDeepTargetPage onNavigate={navigate} />;
      case "inorganic-coordination":
        return <CoordinationTargetPage />;
      case "inorganic-crystals":
        return <CrystalTargetPage onNavigate={navigate} />;
      case "inorganic-salt-analysis":
        return <SaltAnalysisTargetPage />;
      case "inorganic-metallurgy":
        return <MetallurgyTargetPage />;
      case "inorganic-pblock":
        return <PBlockTargetPage />;
      case "bio-visuals":
        return <BioVisualsTargetPage onNavigate={navigate} />;
      case "bio-proteins":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading Protein Structure Studio"
                detail="Preparing Mol* and the local 1MBN coordinate sample..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <ProteinTargetPage onNavigate={navigate} />
          </Suspense>
        );
      case "bio-membranes":
        return (
          <Suspense fallback={<LoadingProgress title="Loading Membrane Structure Studio" detail="Preparing the 4HQJ membrane-pump structure and transport schematic..." height={620} reducedMotion={reducedMotion} />}>
            <MembraneTargetPage />
          </Suspense>
        );
      case "bio-carbohydrates":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading Carbohydrate Structure Studio"
                detail="Preparing validated structures and interactive laboratory controls..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <CarbohydrateStudio />
          </Suspense>
        );
      case "bio-nucleic-acids":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading DNA & RNA Studio"
                detail="Preparing Mol* and the local nucleic-acid coordinate samples..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <NucleicAcidExplorer />
          </Suspense>
        );
      case "bio-metabolism":
        return <MetabolismTargetPage />;
      case "pharma-visuals":
        return <PharmaVisualsTargetPage onNavigate={navigate} />;
      case "pharma-medicinal":
        return <MedicinalChemistryPage />;
      case "pharma-api-synthesis":
        return <ApiSynthesisPage />;
      case "pharma-preformulation":
        return <PreformulationPage />;
      case "pharma-tablet-formulation":
        return <TabletFormulationPage />;
      case "pharma-dissolution":
        return <DissolutionPage />;
      case "pharma-hplc":
        return <HplcPage />;
      case "pharma-stability":
        return <StabilityPage />;
      case "pharma-adme":
        return <AdmeLabPage />;
      case "pharma-dosage":
        return <DosageTargetPage />;
      case "pharma-qc":
        return <QCTargetPage />;
      case "pharma-buffers":
        return <BufferTargetPage />;
      case "pharma-toxicology": {
        return <ToxicologyLabPage />;
      }
      case "pharma-toxicology-legacy": {
        const route =
          labVisualRoutes[currentPage] || labVisualRoutes["chemistry-visuals"];
        return (
          <ChemistryLabPage
            initialFocusTopic={route.focus}
            initialExperimentId={route.experiment}
          />
        );
      }
      case "lab":
        return (
          <Suspense
            fallback={
              <LoadingProgress
                title="Loading virtual lab"
                detail="Preparing titration bench and measurements..."
                height={620}
                reducedMotion={reducedMotion}
              />
            }
          >
            <VirtualLabTargetPage onNavigate={navigate} />
          </Suspense>
        );
      case "balancer":
        return <ReactionBalancerTargetPage />;
      case "study-tools":
        return <StudyToolkitTargetPage onNavigate={navigate} />;
      case "syllabus":
        return <LearningPathTargetPage onNavigate={navigate} />;
      case "favorites":
        return <SavedChemistryTargetPage onNavigate={navigate} />;
      case "settings":
        return (
          <SettingsPage
            isDark={isDark}
            onThemeToggle={toggleThemeWithReveal}
            compact={compact}
            onCompactToggle={() => setCompact((c) => !c)}
            reducedMotion={reducedMotion}
            onReducedMotionToggle={() => setReducedMotion((m) => !m)}
            highContrast={highContrast}
            onHighContrastToggle={() => setHighContrast((v) => !v)}
            colorTheme={colorTheme}
            onColorThemeChange={setColorTheme}
            language={language}
            onLanguageChange={setLanguage}
            onResetData={handleResetData}
            onNavigate={navigate}
          />
        );
      default:
        return (
          <DashboardPage
            onNavigate={navigate}
            onSelectElement={handleSelectElement}
            recentPages={recentPages}
            favoritePages={favoritePages}
          />
        );
    }
  };

  if (currentPage === "bio-nucleic-acids") {
    return (
      <Suspense
        fallback={
          <LoadingProgress
            title="Loading DNA & RNA Studio"
            detail="Preparing Mol* and the local nucleic-acid coordinate samples..."
            height={620}
            reducedMotion={reducedMotion}
          />
        }
      >
        <NucleicAcidExplorer />
      </Suspense>
    );
  }

  if (currentPage === "bio-carbohydrates") {
    return (
      <Suspense
        fallback={
          <LoadingProgress
            title="Loading Carbohydrate Structure Studio"
            detail="Preparing validated structures and interactive laboratory controls..."
            height={620}
            reducedMotion={reducedMotion}
          />
        }
      >
        <CarbohydrateStudio />
      </Suspense>
    );
  }

  return (
    <div
      className={`${reducedMotion ? "no-motion motion-paused" : ""} ${highContrast ? "high-contrast" : ""} ${compact ? "app-compact" : ""} ${studyMode ? "study-mode" : ""} theme-${colorTheme}`}
    >
      <AppShell
        currentPage={currentPage}
        onNavigate={navigate}
        isDark={isDark}
        onThemeToggle={toggleThemeWithReveal}
        compact={compact}
        studyMode={studyMode}
        onStudyModeToggle={() => setStudyMode((v) => !v)}
        recentPages={recentPages}
        favoritePages={favoritePages}
        onFavoritePageToggle={toggleFavoritePage}
        onSelectElement={handleViewAtom}
        canInstall={Boolean(installPrompt)}
        onInstallApp={handleInstallApp}
        isOnline={isOnline}
        motionEnabled={!reducedMotion}
        onMotionToggle={() => setReducedMotion((value) => !value)}
      >
        {renderPage()}
      </AppShell>
      <div className="pointer-events-none fixed left-0 top-0 z-[120] h-1 w-full bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-300 shadow-lg shadow-cyan-500/30 transition-all duration-300"
          style={{
            width: `${routeProgress}%`,
            opacity: routeProgress >= 100 ? 0 : 1,
          }}
        />
      </div>
      {routeStatus.visible && (
        <div
          className="pointer-events-none fixed left-1/2 top-16 z-[121] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-cyan-300/25 bg-gray-950/95 p-3 text-cyan-50 shadow-2xl shadow-black/40 backdrop-blur-xl lg:top-4"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3">
            <div
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${routeStatus.ready ? "border-emerald-300/30 bg-emerald-400/15 text-emerald-200" : "border-cyan-300/30 bg-cyan-400/15 text-cyan-200"}`}
            >
              {routeStatus.ready ? (
                <CheckCircle2 size={18} />
              ) : (
                <Loader2
                  size={18}
                  className={reducedMotion ? "" : "animate-spin"}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-cyan-100">
                  {routeStatus.title}
                </p>
                <span className="shrink-0 text-xs font-black tabular-nums text-white">
                  {routeProgress}%
                </span>
              </div>
              <p className="mt-1 truncate text-[11px] font-semibold text-gray-400">
                {routeStatus.detail}
              </p>
            </div>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-indigo-300 to-emerald-300 transition-all duration-300"
              style={{ width: `${routeProgress}%` }}
            />
          </div>
        </div>
      )}
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
