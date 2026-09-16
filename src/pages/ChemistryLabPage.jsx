import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Boxes,
  Calculator,
  Download,
  FlaskConical,
  GraduationCap,
  Languages,
  Mic2,
  Orbit,
  Printer,
  RadioTower,
  ShieldAlert,
  Sparkles,
  Trophy,
  Zap,
  Atom,
  GitCompare,
  Waves,
  Search,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  Target,
  SlidersHorizontal,
} from "lucide-react";
import { elements } from "../data/elements.js";
import { ALL_MOLECULES } from "../data/molecules.js";
import {
  abundanceRows,
  balanceEquation,
  buildIonicFormula,
  classifyBond,
  crystalLattices,
  buildElectrochemicalCell,
  calculateReactionEnthalpy,
  electronConfigParts,
  electrolysisProducts,
  elementEnrichment,
  ionData,
  lewisAssessment,
  halfReactions,
  likelyIsotopes,
  molarMass,
  normalizeFormulaText,
  parseFormula,
  reactionLibrary,
  standardFormationEnthalpies,
  strongAcidStrongBaseTitration,
  vseprFromDomains,
} from "../utils/chemistryTools.js";
import { getCategoryInfo } from "../data/categories.js";
import { useLocalStorage } from "../hooks/useLocalStorage.js";
import {
  getSyllabusTagsForLab,
  syllabusTrackMap,
  syllabusTracks,
} from "../data/syllabus.js";
import ExtendedAnalyticalLab, {
  EXTENDED_ANALYTICAL_EXPERIMENTS,
} from "../modules/analytical-labs/ExtendedAnalyticalLab.jsx";
import AssessedPracticalLab, {
  ASSESSED_PRACTICAL_EXPERIMENTS,
} from "../modules/assessed-practicals/AssessedPracticalLab.jsx";

const lazyLabTools = {
  titration: lazy(() => import("../labTools/TitrationTool.jsx")),
  "ph-meter": lazy(() => import("../labTools/PhMeterTool.jsx")),
  "gas-law": lazy(() => import("../labTools/GasLawTool.jsx")),
  "molar-mass": lazy(() => import("../labTools/MolarMassTool.jsx")),
  "formula-builder": lazy(() => import("../labTools/MolarMassTool.jsx")),
  hess: lazy(() => import("../labTools/HessTool.jsx")),
  "electrochemical-cell": lazy(
    () => import("../labTools/ElectrochemicalCellTool.jsx"),
  ),
};

const Section = ({ icon: Icon, title, children, className = "" }) => (
  <section className={`glass rounded-2xl p-4 border-white/10 ${className}`}>
    <div className="flex items-center gap-2 mb-3">
      <Icon size={16} className="text-cyan-300" />
      <h3 className="text-sm font-bold text-white">{title}</h3>
    </div>
    {children}
  </section>
);

const MiniBar = ({ label, value, color = "#38bdf8" }) => (
  <div>
    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
      <span>{label}</span>
      <span>{value.toFixed(2)}</span>
    </div>
    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(100, value)}%`, background: color }}
      />
    </div>
  </div>
);

const configToBoxes = (part) => {
  const capacities = { s: 1, p: 3, d: 5, f: 7 };
  const boxes = capacities[part.orbital] || 1;
  const arrows = Array.from({ length: boxes }, (_, i) => {
    const first = i < part.electrons;
    const second = i + boxes < part.electrons;
    return `${first ? "↑" : ""}${second ? "↓" : ""}`;
  });
  return arrows;
};

const geometryData = {
  linear: {
    angle: "180 deg",
    points: [
      [50, 50],
      [18, 50],
      [82, 50],
    ],
  },
  bent: {
    angle: "104-120 deg",
    points: [
      [50, 50],
      [26, 28],
      [74, 28],
    ],
  },
  "trigonal planar": {
    angle: "120 deg",
    points: [
      [50, 50],
      [50, 15],
      [20, 72],
      [80, 72],
    ],
  },
  tetrahedral: {
    angle: "109.5 deg",
    points: [
      [50, 50],
      [50, 14],
      [18, 64],
      [82, 64],
      [50, 86],
    ],
  },
  pyramidal: {
    angle: "107 deg",
    points: [
      [50, 46],
      [22, 70],
      [78, 70],
      [50, 82],
    ],
  },
  octahedral: {
    angle: "90 deg",
    points: [
      [50, 50],
      [50, 12],
      [50, 88],
      [12, 50],
      [88, 50],
      [30, 30],
      [70, 70],
    ],
  },
};

const kspData = {
  NaCl: { ksp: 36, ions: 2, molarSolubility: 6.1 },
  AgCl: { ksp: 1.8e-10, ions: 2, molarSolubility: 1.34e-5 },
  CaF2: { ksp: 3.9e-11, ions: 3, molarSolubility: 2.14e-4 },
  BaSO4: { ksp: 1.1e-10, ions: 2, molarSolubility: 1.05e-5 },
  PbI2: { ksp: 7.9e-9, ions: 3, molarSolubility: 1.25e-3 },
};

const reductionPotentials = {
  Mg: -2.37,
  Al: -1.66,
  Zn: -0.76,
  Fe: -0.44,
  Ni: -0.25,
  Sn: -0.14,
  Pb: -0.13,
  H: 0,
  Cu: 0.34,
  Ag: 0.8,
};

const indicators = {
  Litmus: {
    low: 4.5,
    high: 8.3,
    acid: "#ef4444",
    base: "#3b82f6",
    mid: "#8b5cf6",
  },
  Phenolphthalein: {
    low: 8.2,
    high: 10,
    acid: "#f8fafc",
    base: "#ec4899",
    mid: "#f9a8d4",
  },
  "Methyl orange": {
    low: 3.1,
    high: 4.4,
    acid: "#ef4444",
    base: "#f59e0b",
    mid: "#fb923c",
  },
  "Bromothymol blue": {
    low: 6,
    high: 7.6,
    acid: "#facc15",
    base: "#2563eb",
    mid: "#22c55e",
  },
};

const AVOGADRO = 6.022e23;

const unitCellData = {
  "Simple Cubic": {
    atoms: 1,
    packing: 52.4,
    coordination: 6,
    voids:
      "Cubic voids; tetrahedral/octahedral void language is mainly used for close packing.",
    points: [
      [20, 20],
      [80, 20],
      [20, 80],
      [80, 80],
    ],
    z: 1,
  },
  BCC: {
    atoms: 2,
    packing: 68,
    coordination: 8,
    voids: "Distorted tetrahedral and octahedral interstitial sites.",
    points: [
      [20, 20],
      [80, 20],
      [20, 80],
      [80, 80],
      [50, 50],
    ],
    z: 2,
  },
  FCC: {
    atoms: 4,
    packing: 74,
    coordination: 12,
    voids:
      "Octahedral voids = N; tetrahedral voids = 2N for N close-packed atoms.",
    points: [
      [20, 20],
      [80, 20],
      [20, 80],
      [80, 80],
      [50, 20],
      [20, 50],
      [80, 50],
      [50, 80],
    ],
    z: 4,
  },
  HCP: {
    atoms: 6,
    packing: 74,
    coordination: 12,
    voids:
      "Octahedral voids = N; tetrahedral voids = 2N in close-packed ABAB layers.",
    points: [
      [28, 24],
      [72, 24],
      [50, 44],
      [28, 64],
      [72, 64],
      [50, 84],
    ],
    z: 6,
  },
};

const UnitCellSvg = ({ type }) => {
  const data = unitCellData[type] || unitCellData.FCC;
  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
    >
      <rect
        x="20"
        y="20"
        width="60"
        height="60"
        fill="none"
        stroke="#64748b"
        strokeWidth="2"
      />
      <path
        d="M20 20 L36 10 H96 L80 20 M80 20 L96 10 V70 L80 80 M20 80 L36 70 H96"
        fill="none"
        stroke="#475569"
        strokeWidth="1.5"
      />
      {data.points.map(([x, y], index) => (
        <circle
          key={index}
          cx={x}
          cy={y}
          r={index > 3 ? 6 : 7}
          fill={index > 3 ? "#38bdf8" : "#a78bfa"}
          stroke="#e2e8f0"
          strokeWidth="1"
        />
      ))}
      <text x="8" y="94" fill="#94a3b8" fontSize="7">
        {type}
      </text>
    </svg>
  );
};

const CrystalGrid = ({ mode, compound }) => {
  const missing = mode === "schottky" ? new Set(["2-2", "3-3"]) : new Set();
  const displaced = mode === "frenkel" ? "2-2" : null;
  return (
    <svg
      viewBox="0 0 160 120"
      className="w-full h-36 rounded-xl bg-black/20 border border-white/10"
    >
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 6 }, (_, col) => {
          const id = `${row}-${col}`;
          const ion =
            compound === "ionic"
              ? (row + col) % 2 === 0
                ? "Na+"
                : "Cl-"
              : "M";
          const isMissing =
            missing.has(id) || (mode === "frenkel" && id === displaced);
          if (isMissing)
            return (
              <circle
                key={id}
                cx={18 + col * 24}
                cy={16 + row * 21}
                r="7"
                fill="none"
                stroke="#ef4444"
                strokeDasharray="2 2"
              />
            );
          return (
            <g key={id}>
              <circle
                cx={18 + col * 24}
                cy={16 + row * 21}
                r="7"
                fill={ion === "Cl-" ? "#34d399" : "#60a5fa"}
                opacity={compound === "metal" ? 0.85 : 1}
              />
              <text
                x={18 + col * 24}
                y={18 + row * 21}
                textAnchor="middle"
                fontSize="5"
                fill="#020617"
                fontWeight="700"
              >
                {ion}
              </text>
            </g>
          );
        }),
      )}
      {mode === "frenkel" && (
        <circle
          cx="114"
          cy="58"
          r="6"
          fill="#60a5fa"
          stroke="#fbbf24"
          strokeWidth="2"
        />
      )}
      <text x="8" y="114" fill="#94a3b8" fontSize="7">
        {mode === "perfect"
          ? "Perfect crystal"
          : mode === "schottky"
            ? "Schottky defect"
            : "Frenkel defect"}
      </text>
    </svg>
  );
};

const SiliconDopingSvg = ({ type }) => (
  <svg
    viewBox="0 0 220 110"
    className="w-full h-36 rounded-xl bg-black/20 border border-white/10"
  >
    {Array.from({ length: 4 }, (_, row) =>
      Array.from({ length: 6 }, (_, col) => {
        const dopant = row === 1 && col === 3;
        return (
          <g key={`${row}-${col}`}>
            <circle
              cx={22 + col * 35}
              cy={20 + row * 24}
              r="9"
              fill={dopant ? (type === "n" ? "#22c55e" : "#f472b6") : "#38bdf8"}
            />
            <text
              x={22 + col * 35}
              y={23 + row * 24}
              textAnchor="middle"
              fontSize="7"
              fill="#020617"
              fontWeight="900"
            >
              {dopant ? (type === "n" ? "P" : "B") : "Si"}
            </text>
          </g>
        );
      }),
    )}
    <text x="10" y="104" fill="#cbd5e1" fontSize="8">
      {type === "n"
        ? "n-type: Group 15 dopant adds extra electron"
        : "p-type: Group 13 dopant creates a hole"}
    </text>
  </svg>
);

const IsothermPlot = ({ freundlichK, freundlichN, langmuirA, langmuirB }) => {
  const fPoints = Array.from({ length: 20 }, (_, i) => {
    const p = 0.1 + i * 0.5;
    const y = freundlichK * p ** (1 / freundlichN);
    return `${12 + i * 11},${92 - Math.min(78, y * 18)}`;
  }).join(" ");
  const lPoints = Array.from({ length: 20 }, (_, i) => {
    const p = 0.1 + i * 0.5;
    const y = (langmuirA * p) / (1 + langmuirB * p);
    return `${12 + i * 11},${92 - Math.min(78, y * 18)}`;
  }).join(" ");
  return (
    <svg
      viewBox="0 0 240 110"
      className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
    >
      <line x1="12" y1="92" x2="225" y2="92" stroke="#64748b" />
      <line x1="12" y1="10" x2="12" y2="92" stroke="#64748b" />
      <polyline points={fPoints} fill="none" stroke="#38bdf8" strokeWidth="3" />
      <polyline points={lPoints} fill="none" stroke="#f59e0b" strokeWidth="3" />
      <text x="160" y="18" fill="#38bdf8" fontSize="8">
        Freundlich
      </text>
      <text x="160" y="31" fill="#f59e0b" fontSize="8">
        Langmuir
      </text>
      <text x="104" y="106" fill="#94a3b8" fontSize="8">
        Pressure P
      </text>
      <text x="18" y="18" fill="#94a3b8" fontSize="8">
        x/m
      </text>
    </svg>
  );
};

const indicatorColor = (indicator, pH) => {
  const item = indicators[indicator];
  if (pH < item.low) return item.acid;
  if (pH > item.high) return item.base;
  return item.mid;
};

const difficultyStyles = {
  Beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  Intermediate: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  Advanced: "bg-rose-500/15 text-rose-300 border-rose-500/25",
};

const typeStyles = {
  Simulation: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  Calculator: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  Visualizer: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  Practice: "bg-pink-500/15 text-pink-300 border-pink-500/25",
  Reference: "bg-slate-500/15 text-slate-300 border-slate-500/25",
};

const BadgePill = ({ children, className = "", style }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${className}`}
    style={style}
  >
    {children}
  </span>
);

const newLabToolIds = new Set([
  "analytical-lab",
  "unit-cell",
  "crystal-defects",
  "adsorption",
  "surface-chemistry-deep",
  "named-reactions",
  "organic-reaction-bank",
  "functional-tests",
  "isomerism",
  "reactivity-series",
  "quantum-numbers",
  "gibbs",
  "environmental-chem",
  "cft",
  "metallurgy",
  "salt-analysis",
  "pblock-advanced",
  "nuclear-chemistry",
  "drug-functional-groups",
  "adme-ionization",
  "isotonicity",
  "clinical-buffers",
  "pharma-analysis",
  "radiopharma",
  "enzyme-kinetics",
  "amino-acid-pi",
  "protein-structure",
  "carbohydrate-lab",
  "lipid-membrane",
  "nucleic-acid-lab",
  "vitamin-coenzyme-map",
  "metabolism-atp",
  "drug-class-studio",
  "drug-metabolism-lab",
  "dosage-form-lab",
  "antacid-analgesic-antimicrobial",
  "pharma-buffer-lab",
  "electrolyte-panel",
  "hemoglobin-oxygen",
  "diagnostic-color-tests",
  "clinical-metabolites",
  "toxicology-chelation",
]);

const experimentBestFor = (item) => {
  if (item.type === "Calculator") return "Fast numerical practice";
  if (item.type === "Practice") return "Exam-style revision";
  if (item.type === "Reference") return "Quick theory lookup";
  if (item.type === "Visualizer") return "Concept visualization";
  return "Interactive learning";
};

const estimatedMinutes = (item) => {
  if (item.difficulty === "Beginner") return 3;
  if (item.difficulty === "Intermediate") return 5;
  return item.type === "Reference" ? 7 : 8;
};

const organicTracks = ["Class 11", "Class 12", "JEE Advanced"];

const namedReactionData = [
  {
    name: "Aldol Condensation",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation:
      "2 R-CHO -> beta-hydroxy aldehyde -> alpha,beta-unsaturated aldehyde",
    conditions: "Dilute NaOH or Ba(OH)2, warm after aldol addition",
    mechanism: "Enolate addition followed by dehydration",
  },
  {
    name: "Cannizzaro Reaction",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "2 HCHO + OH- -> HCOO- + CH3OH",
    conditions: "Conc. NaOH/KOH; aldehyde without alpha-H",
    mechanism: "Disproportionation via hydride transfer",
  },
  {
    name: "Friedel-Crafts Acylation",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "Ar-H + RCOCl -> Ar-COR + HCl",
    conditions: "Anhydrous AlCl3, dry solvent",
    mechanism: "Electrophilic aromatic substitution, acylium ion",
  },
  {
    name: "Friedel-Crafts Alkylation",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "Ar-H + R-Cl -> Ar-R + HCl",
    conditions: "Anhydrous AlCl3; alkyl halide",
    mechanism:
      "Electrophilic aromatic substitution, carbocation-like electrophile",
  },
  {
    name: "Williamson Ether Synthesis",
    category: "Organic",
    level: ["Class 12", "JEE Main"],
    equation: "R-O-Na+ + R-X -> R-O-R + NaX",
    conditions: "Dry ether; primary alkyl halide preferred",
    mechanism: "SN2 substitution",
  },
  {
    name: "Wurtz Reaction",
    category: "Organic",
    level: ["Class 11", "JEE Main"],
    equation: "2 R-X + 2 Na -> R-R + 2 NaX",
    conditions: "Dry ether; sodium metal",
    mechanism: "Radical coupling of alkyl halides",
  },
  {
    name: "Sandmeyer Reaction",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "Ar-N2+Cl- + CuCl -> Ar-Cl + N2",
    conditions: "CuCl/CuBr/CuCN, cold diazonium salt",
    mechanism: "Diazonium replacement",
  },
  {
    name: "Gattermann Reaction",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "Ar-N2+Cl- + HX/Cu -> Ar-X + N2",
    conditions: "HCl or HBr with copper powder",
    mechanism: "Diazonium halogenation",
  },
  {
    name: "Reimer-Tiemann Reaction",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "Phenol + CHCl3 + NaOH -> salicylaldehyde",
    conditions: "CHCl3, aq. NaOH, heat; acid workup",
    mechanism: "Electrophilic substitution by dichlorocarbene",
  },
  {
    name: "Kolbe Reaction",
    category: "Organic",
    level: ["Class 12", "JEE Main"],
    equation: "Sodium phenoxide + CO2 -> salicylic acid",
    conditions: "CO2, pressure, 400 K; acidification",
    mechanism: "Carboxylation of phenoxide",
  },
  {
    name: "Hell-Volhard-Zelinsky",
    category: "Organic",
    level: ["Class 12", "JEE Advanced"],
    equation: "RCH2COOH + Br2 -> RCHBrCOOH",
    conditions: "Br2/Cl2 with red P or PBr3",
    mechanism: "Alpha-halogenation through acyl halide/enol",
  },
  {
    name: "Diels-Alder Reaction",
    category: "Organic",
    level: ["JEE Advanced"],
    equation: "Conjugated diene + dienophile -> cyclohexene derivative",
    conditions: "Heat; electron-rich diene and electron-poor dienophile",
    mechanism: "Concerted [4+2] cycloaddition",
  },
  {
    name: "Haber Process",
    category: "Industrial",
    level: ["Class 11", "JEE Main"],
    equation: "N2 + 3 H2 <=> 2 NH3",
    conditions: "Fe catalyst, 450 C, 150-250 atm, K2O/Al2O3 promoters",
    mechanism: "Heterogeneous catalytic equilibrium",
  },
  {
    name: "Ostwald Process",
    category: "Industrial",
    level: ["Class 12", "JEE Main"],
    equation: "NH3 -> NO -> NO2 -> HNO3",
    conditions: "Pt/Rh gauze, about 800 C, oxidation and absorption",
    mechanism: "Catalytic oxidation sequence",
  },
  {
    name: "Contact Process",
    category: "Industrial",
    level: ["Class 12", "JEE Main"],
    equation: "2 SO2 + O2 <=> 2 SO3 -> H2SO4",
    conditions: "V2O5, 720 K, 1-2 atm; absorb SO3 in H2SO4",
    mechanism: "Catalytic oxidation and absorption",
  },
  {
    name: "Solvay Process",
    category: "Industrial",
    level: ["Class 11", "JEE Main"],
    equation: "NaCl + NH3 + CO2 + H2O -> NaHCO3 -> Na2CO3",
    conditions: "Brine saturated with NH3 and CO2; calcination",
    mechanism: "Precipitation and thermal decomposition",
  },
  {
    name: "Bessemer Process",
    category: "Inorganic",
    level: ["Class 12", "JEE Main"],
    equation: "Molten pig iron + O2 -> steel + oxides",
    conditions: "Air blown through molten iron in converter",
    mechanism: "Oxidative removal of C, Si, Mn impurities",
  },
];

const surfaceModes = [
  { id: "isotherms", label: "Isotherms" },
  { id: "catalysis", label: "Catalysis" },
  { id: "colloids", label: "Colloids" },
  { id: "emulsions", label: "Emulsions" },
  { id: "micelles", label: "Micelles" },
  { id: "exam", label: "Exam Drill" },
];

const surfaceColloidSystems = {
  "gold-sol": {
    name: "Gold sol",
    charge: "negative",
    kind: "lyophobic",
    dispersed: "Au particles",
    medium: "water",
    coagulators: ["Al3+ strongest", "Ba2+ moderate", "Na+ weakest"],
    note: "Needs stabilizing charge; trace electrolyte can coagulate it.",
  },
  "ferric-hydroxide": {
    name: "Ferric hydroxide sol",
    charge: "positive",
    kind: "lyophobic",
    dispersed: "Fe(OH)3",
    medium: "water",
    coagulators: ["PO4 3- strongest", "SO4 2- moderate", "Cl- weakest"],
    note: "Negative counter-ions coagulate a positive sol.",
  },
  starch: {
    name: "Starch sol",
    charge: "weakly negative",
    kind: "lyophilic",
    dispersed: "hydrated starch chains",
    medium: "water",
    coagulators: ["salt plus alcohol", "high electrolyte level"],
    note: "Solvation gives extra stability and protective action.",
  },
  soap: {
    name: "Soap sol",
    charge: "negative",
    kind: "association colloid",
    dispersed: "soap micelles",
    medium: "water",
    coagulators: ["Ca2+ forms scum", "Mg2+ forms scum"],
    note: "Above CMC, soap ions aggregate into cleansing micelles.",
  },
};

const surfaceCatalystCases = [
  {
    process: "Haber process",
    catalyst: "Fe with K2O/Al2O3 promoters",
    role: "N2 and H2 adsorb, bonds weaken, NH3 desorbs.",
    poison: "Sulfur compounds poison iron sites.",
  },
  {
    process: "Contact process",
    catalyst: "V2O5",
    role: "Cycles between oxidation states while SO2 becomes SO3.",
    poison: "Dust or arsenic impurities reduce activity.",
  },
  {
    process: "Hydrogenation of alkenes",
    catalyst: "Ni, Pd, or Pt",
    role: "H2 and alkene adsorb on metal surface; syn addition is common.",
    poison: "Lead salts can partially poison Pd for selective reductions.",
  },
];

const surfaceConceptCards = [
  {
    title: "Adsorption factors",
    points: [
      "Greater surface area increases adsorption.",
      "Lower temperature favors physisorption.",
      "Chemisorption may rise first with temperature due to activation energy.",
      "Easily liquefiable gases are adsorbed more strongly.",
    ],
  },
  {
    title: "Colloid preparation",
    points: [
      "Dispersion: arc, peptization, mechanical dispersion.",
      "Condensation: hydrolysis, oxidation, reduction, double decomposition.",
      "Peptization converts a precipitate into sol by adding a suitable electrolyte.",
    ],
  },
  {
    title: "Colloid purification",
    points: [
      "Dialysis removes dissolved ions through a membrane.",
      "Electrodialysis speeds ion removal using electric field.",
      "Ultrafiltration separates colloid from crystalloids using fine filters.",
    ],
  },
  {
    title: "Colloid properties",
    points: [
      "Tyndall effect proves scattering.",
      "Brownian movement resists settling.",
      "Electrophoresis reveals particle charge.",
      "Coagulation occurs when charge protection is neutralized.",
    ],
  },
];

const surfacePracticeScenarios = [
  {
    prompt:
      "A negative As2S3 sol is coagulated by NaCl, BaCl2, and AlCl3. Which is most effective?",
    answer:
      "AlCl3, because Al3+ is the highest-valency counter-ion for a negative sol.",
  },
  {
    prompt: "Why does activated charcoal remove colored impurities?",
    answer:
      "It has high surface area and adsorbs dye molecules onto its surface.",
  },
  {
    prompt: "Why does soap fail in hard water?",
    answer:
      "Ca2+ and Mg2+ form insoluble scum with soap anions, reducing micelle formation.",
  },
  {
    prompt: "What happens when gelatin protects gold sol from NaCl?",
    answer:
      "Gelatin acts as a lyophilic protective colloid and raises the coagulation resistance.",
  },
  {
    prompt:
      "A catalyst increases rate but product yield at equilibrium is unchanged. Why?",
    answer:
      "It lowers activation energy for forward and reverse paths; it does not change Delta G or K.",
  },
];

const organicBankModes = [
  { id: "transformations", label: "Transformations" },
  { id: "stereo", label: "Stereo Outcomes" },
  { id: "rearrangements", label: "Rearrangements" },
  { id: "pericyclic", label: "Pericyclic" },
  { id: "protecting", label: "Protecting Groups" },
  { id: "drills", label: "Synthesis Drills" },
  { id: "quickcheck", label: "Quick Check" },
];

const reagentTransformations = [
  {
    id: "alkene-alcohol",
    from: "Alkene",
    to: "Alcohol",
    reagents: [
      "H2O/H+ gives Markovnikov alcohol",
      "BH3.THF then H2O2/OH- gives anti-Markovnikov alcohol",
      "Hg(OAc)2/H2O then NaBH4 avoids rearrangement",
    ],
    selectivity: "Regiochemistry changes with reagent set.",
    caution: "Acid hydration can rearrange through carbocations.",
  },
  {
    id: "alkene-epoxide-diol",
    from: "Alkene",
    to: "Epoxide or diol",
    reagents: [
      "mCPBA gives epoxide",
      "OsO4/NMO gives syn diol",
      "Cold alkaline KMnO4 gives syn diol",
      "Epoxide opening in acid/base gives anti 1,2-diol",
    ],
    selectivity: "Oxidation conditions decide epoxide versus cis/trans diol.",
    caution: "Hot KMnO4 can cleave alkenes instead of stopping at diol.",
  },
  {
    id: "alkyne-alkene-carbonyl",
    from: "Alkyne",
    to: "Alkene or carbonyl",
    reagents: [
      "H2/Lindlar gives cis alkene",
      "Na/NH3(l) gives trans alkene",
      "HgSO4/H2SO4/H2O gives Markovnikov ketone",
      "BH3 then H2O2/OH- gives aldehyde from terminal alkyne",
    ],
    selectivity:
      "Partial reduction stereochemistry and hydration regiochemistry are reagent controlled.",
    caution: "Uncontrolled hydrogenation reduces all the way to alkane.",
  },
  {
    id: "alcohol-halide",
    from: "Alcohol",
    to: "Alkyl halide",
    reagents: [
      "SOCl2/pyridine for R-Cl",
      "PBr3 for R-Br",
      "HX for tertiary alcohols",
    ],
    selectivity: "SN2 routes invert at chiral primary/secondary centers.",
    caution: "Strong acid can cause elimination or rearrangement.",
  },
  {
    id: "carbonyl-alcohol",
    from: "Aldehyde/ketone",
    to: "Alcohol",
    reagents: [
      "NaBH4 mild reduction",
      "LiAlH4 strong reduction",
      "H2/Ni catalytic hydrogenation",
    ],
    selectivity:
      "Hydride attacks planar carbonyl from either face unless controlled.",
    caution: "LiAlH4 also reduces acids, esters, and amides.",
  },
  {
    id: "alcohol-carbonyl",
    from: "Alcohol",
    to: "Carbonyl/acid",
    reagents: [
      "PCC stops primary alcohol at aldehyde",
      "KMnO4 or K2Cr2O7 oxidizes primary alcohol to acid",
      "Secondary alcohol gives ketone",
    ],
    selectivity: "Oxidation level is reagent controlled.",
    caution: "Tertiary alcohols resist normal oxidation.",
  },
  {
    id: "acid-derivatives",
    from: "Carboxylic acid derivative",
    to: "Acid, ester, amide, or alcohol",
    reagents: [
      "SOCl2 converts acid to acid chloride",
      "ROH/H+ forms ester",
      "NH3 or amine forms amide",
      "LiAlH4 reduces acid derivatives to alcohols",
    ],
    selectivity:
      "Acyl substitution follows leaving-group ability: acid chloride > anhydride > ester > amide.",
    caution:
      "Grignard adds twice to acid chlorides/esters unless organocuprate or Weinreb amide control is used.",
  },
  {
    id: "aromatic-substitution",
    from: "Benzene derivative",
    to: "Substituted arene",
    reagents: ["Br2/FeBr3", "HNO3/H2SO4", "RCOCl/AlCl3", "SO3/H2SO4"],
    selectivity: "Directing effects decide ortho/para/meta products.",
    caution: "Strongly deactivated rings resist Friedel-Crafts.",
  },
  {
    id: "carbon-chain",
    from: "Carbonyl/halide",
    to: "Longer carbon chain",
    reagents: [
      "RMgX then H3O+",
      "NaCN then hydrolysis",
      "acetylide ion then alkyl halide",
    ],
    selectivity: "New C-C bond forms at electrophilic carbon.",
    caution: "Grignard reagents are destroyed by water, alcohols, and acids.",
  },
  {
    id: "amine-prep",
    from: "Nitro, nitrile, amide, or halide",
    to: "Amine",
    reagents: [
      "Sn/HCl or H2/Pd reduces nitro to aniline",
      "LiAlH4 reduces nitrile or amide to amine",
      "Gabriel synthesis gives primary amine",
      "Hofmann rearrangement gives one-carbon-shorter amine",
    ],
    selectivity: "Choose route by carbon count and aryl/alkyl context.",
    caution: "Direct alkylation of NH3 can over-alkylate.",
  },
  {
    id: "diazonium",
    from: "Aniline",
    to: "Aryl halide, phenol, nitrile, or azo dye",
    reagents: [
      "NaNO2/HCl at 0-5 C",
      "CuCl/CuBr/CuCN",
      "H2O/heat",
      "phenol or aniline coupling",
    ],
    selectivity: "Diazonium chemistry swaps -NH2 for many groups.",
    caution: "Keep diazonium salts cold; many decompose on warming.",
  },
];

const stereochemicalOutcomes = [
  {
    reaction: "SN2 substitution",
    outcome: "Backside attack gives inversion of configuration.",
    cue: "Strong nucleophile, primary/secondary substrate, polar aprotic solvent.",
  },
  {
    reaction: "SN1 substitution",
    outcome:
      "Planar carbocation gives racemization with partial inversion excess.",
    cue: "Tertiary or resonance-stabilized substrate, polar protic solvent.",
  },
  {
    reaction: "E2 elimination",
    outcome: "Leaving group and beta-H must be anti-periplanar.",
    cue: "Strong base; bulky base favors Hofmann product.",
  },
  {
    reaction: "Br2 addition to alkene",
    outcome: "Anti addition through bromonium ion.",
    cue: "Vicinal dibromide; no free carbocation rearrangement.",
  },
  {
    reaction: "Hydroboration oxidation",
    outcome: "Syn addition, anti-Markovnikov alcohol.",
    cue: "BH3.THF then H2O2/OH-.",
  },
  {
    reaction: "Diels-Alder reaction",
    outcome:
      "Concerted suprafacial addition; endo product often favored kinetically.",
    cue: "Electron-rich diene plus electron-poor dienophile.",
  },
  {
    reaction: "Epoxide opening",
    outcome:
      "Anti opening; base attacks less substituted carbon, acid attacks more substituted carbon.",
    cue: "Check acidic versus basic conditions before assigning regioselectivity.",
  },
  {
    reaction: "Catalytic hydrogenation",
    outcome: "Syn addition of H2 on metal surface.",
    cue: "Both hydrogens usually add from the same face of the alkene.",
  },
];

const rearrangementData = [
  {
    name: "Hydride or methyl shift",
    trigger: "Carbocation intermediate",
    migration: "1,2-shift forms a more stable carbocation.",
    product: "Rearranged alcohol, alkene, or substitution product.",
  },
  {
    name: "Pinacol rearrangement",
    trigger: "Vicinal diol in acid",
    migration: "Group migrates while water leaves.",
    product: "Ketone or aldehyde after cation rearrangement.",
  },
  {
    name: "Beckmann rearrangement",
    trigger: "Oxime with acid or PCl5",
    migration: "Group anti to leaving group migrates to nitrogen.",
    product: "Amide or lactam.",
  },
  {
    name: "Hofmann rearrangement",
    trigger: "Amide with Br2/NaOH",
    migration: "R group migrates from carbonyl carbon to nitrogen.",
    product: "Primary amine with one fewer carbonyl carbon.",
  },
  {
    name: "Baeyer-Villiger oxidation",
    trigger: "Ketone with peracid",
    migration: "More migratory group moves next to oxygen.",
    product: "Ester or lactone.",
  },
];

const pericyclicBasics = [
  {
    name: "Diels-Alder [4+2]",
    rule: "Thermal suprafacial-suprafacial cycloaddition is allowed.",
    use: "Builds six-membered rings with stereospecificity.",
  },
  {
    name: "Electrocyclic ring opening",
    rule: "4n pi systems: thermal conrotatory, photochemical disrotatory.",
    use: "Predict cis/trans relationship after ring opening.",
  },
  {
    name: "Electrocyclic ring closure",
    rule: "4n+2 pi systems: thermal disrotatory, photochemical conrotatory.",
    use: "Connects linear polyenes to cyclic dienes.",
  },
  {
    name: "[3,3] sigmatropic shift",
    rule: "Concerted migration through a six-membered transition state.",
    use: "Claisen and Cope rearrangements move sigma bonds predictably.",
  },
];

const protectingGroups = [
  {
    group: "TMS ether",
    protects: "Alcohol",
    install: "TMSCl, imidazole or base",
    remove: "TBAF or acid workup",
    when: "Use when an -OH would quench Grignard or acylation chemistry.",
  },
  {
    group: "Acetal/ketal",
    protects: "Aldehyde or ketone",
    install: "Diol, acid catalyst, remove water",
    remove: "Aqueous acid",
    when: "Use when carbonyl must survive base, hydride, or Grignard steps.",
  },
  {
    group: "Boc carbamate",
    protects: "Amine",
    install: "Boc2O, base",
    remove: "TFA or HCl",
    when: "Use to suppress amine basicity/nucleophilicity.",
  },
  {
    group: "Benzyl ether",
    protects: "Alcohol or phenol",
    install: "BnBr, base",
    remove: "H2/Pd-C",
    when: "Use when acid/base stability is needed before hydrogenolysis.",
  },
  {
    group: "Ester",
    protects: "Carboxylic acid",
    install: "ROH, acid or diazomethane",
    remove: "Hydrolysis",
    when: "Use to mask acidity and improve organic solubility.",
  },
];

const synthesisDrills = [
  {
    id: "acetophenone",
    start: "Benzene",
    target: "Acetophenone",
    disconnection:
      "Break the aryl-COCH3 bond back to benzene plus acetyl electrophile.",
    steps: ["Friedel-Crafts acylation with CH3COCl/AlCl3", "Aqueous workup"],
    check:
      "Acylation avoids polyalkylation and gives a meta-directing ketone product for later steps.",
    trap: "Do not use Friedel-Crafts on strongly deactivated rings.",
  },
  {
    id: "p-nitroaniline",
    start: "Aniline",
    target: "p-Nitroaniline",
    disconnection:
      "Keep aniline directing power but tame its basicity by temporary acyl protection.",
    steps: [
      "Protect -NH2 as acetanilide",
      "Nitrate with HNO3/H2SO4 cold",
      "Hydrolyze amide protecting group",
    ],
    check:
      "Protection prevents over-oxidation/protonation and controls para substitution.",
    trap: "Direct nitration of aniline in acid gives poor control because anilinium is meta-directing.",
  },
  {
    id: "benzyl-alcohol",
    start: "Toluene",
    target: "Benzyl alcohol",
    disconnection:
      "Convert benzylic C-H to benzylic leaving group, then substitute.",
    steps: ["Benzylic bromination with NBS/hv", "Hydrolysis with aqueous base"],
    check:
      "NBS selects benzylic substitution rather than aromatic bromination.",
    trap: "Br2/FeBr3 brominates the ring, not the side chain.",
  },
  {
    id: "cyclohexene-dibromide",
    start: "Cyclohexene",
    target: "trans-1,2-dibromocyclohexane",
    disconnection: "Recognize anti vicinal dibromide as alkene bromination.",
    steps: ["Add Br2 in CCl4", "Anti opening of bromonium ion"],
    check: "The vicinal dibromide forms by anti addition.",
    trap: "Do not draw syn addition for bromonium ion opening.",
  },
  {
    id: "butanone",
    start: "2-butanol",
    target: "Butanone",
    disconnection: "Secondary alcohol is one oxidation level below ketone.",
    steps: ["Oxidize with PCC or K2Cr2O7/H+", "Stop at ketone"],
    check: "Secondary alcohol oxidation gives ketone, not acid.",
    trap: "No carbon skeleton change is needed.",
  },
  {
    id: "anti-markovnikov-alcohol",
    start: "1-butene",
    target: "1-butanol",
    disconnection: "Install OH at less substituted alkene carbon.",
    steps: ["BH3.THF", "H2O2/OH- oxidative workup"],
    check:
      "Hydroboration gives syn, anti-Markovnikov hydration without carbocation rearrangement.",
    trap: "H2O/H+ would give mainly 2-butanol.",
  },
  {
    id: "carboxylic-acid-from-nitrile",
    start: "1-bromopropane",
    target: "butanoic acid",
    disconnection: "Add one carbon by cyanide, then hydrolyze nitrile.",
    steps: [
      "NaCN in polar aprotic solvent",
      "Acidic or basic hydrolysis of nitrile",
    ],
    check: "Cyanide substitution extends the carbon chain by one carbon.",
    trap: "Use primary halide for SN2; tertiary halide eliminates.",
  },
];

const organicCompatibilityRules = [
  {
    problem: "Grignard reagent present",
    avoid: "Water, alcohol, carboxylic acid, phenol, amine N-H",
    fix: "Protect acidic groups or run Grignard before deprotection.",
  },
  {
    problem: "Strong oxidizer planned",
    avoid: "Unprotected aldehydes, sulfides, electron-rich aromatics",
    fix: "Use PCC or chemoselective conditions when needed.",
  },
  {
    problem: "Friedel-Crafts step planned",
    avoid: "Strongly deactivated or aniline-like basic rings",
    fix: "Protect amines or choose acylation before deactivating substitution.",
  },
  {
    problem: "SN2 substitution planned",
    avoid: "Tertiary alkyl halides and strong steric hindrance",
    fix: "Use primary substrates, polar aprotic solvent, or change route.",
  },
];

const organicQuickPrompts = [
  {
    prompt: "Convert propene to 1-propanol.",
    answer: "Use BH3.THF then H2O2/OH- for anti-Markovnikov hydration.",
  },
  {
    prompt: "Convert benzene to nitrobenzene.",
    answer:
      "Use HNO3/H2SO4; nitronium ion performs electrophilic aromatic substitution.",
  },
  {
    prompt: "Predict stereochemistry for 2-bromobutane + CN- in DMSO.",
    answer: "SN2 inversion at the reacting stereocenter.",
  },
  {
    prompt: "Protect an aldehyde before a Grignard step.",
    answer:
      "Convert it to an acetal with ethylene glycol and acid, then deprotect with aqueous acid.",
  },
  {
    prompt: "Make a primary amine without over-alkylation.",
    answer:
      "Use Gabriel phthalimide synthesis or reduce a nitrile/amides depending on carbon count.",
  },
];

const functionalTestData = [
  {
    name: "Tollens' test",
    detects: "Aldehydes and reducing sugars",
    reagents: "Ammoniacal AgNO3",
    positive: "Bright silver mirror or black Ag deposit",
    negative: "No silver mirror",
    example: "Glucose or ethanal",
  },
  {
    name: "Fehling's test",
    detects: "Aliphatic aldehydes and reducing sugars",
    reagents: "Fehling A + Fehling B, warm",
    positive: "Brick-red Cu2O precipitate",
    negative: "Solution remains blue",
    example: "Ethanal",
  },
  {
    name: "Lucas test",
    detects: "Alcohol class: 3 deg, 2 deg, 1 deg",
    reagents: "Conc. HCl + anhydrous ZnCl2",
    positive:
      "Turbidity: immediate for 3 deg, minutes for 2 deg, slow/none for 1 deg",
    negative: "No turbidity at room temperature",
    example: "tert-Butyl alcohol",
  },
  {
    name: "Iodoform test",
    detects: "CH3CO- group or CH3CH(OH)- alcohols",
    reagents: "I2/NaOH",
    positive: "Yellow CHI3 precipitate with antiseptic smell",
    negative: "No yellow precipitate",
    example: "Ethanol or acetone",
  },
  {
    name: "Baeyer's test",
    detects: "Unsaturation in alkenes/alkynes",
    reagents: "Cold dilute alkaline KMnO4",
    positive: "Purple KMnO4 decolorizes with brown MnO2",
    negative: "Purple color persists",
    example: "Ethene",
  },
  {
    name: "Hinsberg test",
    detects: "Primary, secondary, tertiary amines",
    reagents: "Benzenesulfonyl chloride + NaOH",
    positive:
      "Primary soluble then precipitates on acidification; secondary insoluble sulfonamide",
    negative: "Tertiary amine does not form sulfonamide",
    example: "Aniline",
  },
  {
    name: "2,4-DNP test",
    detects: "Aldehydes and ketones",
    reagents: "2,4-dinitrophenylhydrazine reagent",
    positive: "Orange/yellow crystalline precipitate",
    negative: "No precipitate",
    example: "Propanone",
  },
  {
    name: "Victor Meyer test",
    detects: "Primary, secondary, tertiary alcohols",
    reagents: "PI3, AgNO2, HNO2, alkali",
    positive: "Red for primary, blue for secondary, colorless for tertiary",
    negative: "No diagnostic color if conversion fails",
    example: "Ethanol",
  },
  {
    name: "Sodium bicarbonate test",
    detects: "Carboxylic acids",
    reagents: "NaHCO3 solution",
    positive: "Brisk CO2 effervescence",
    negative: "No effervescence",
    example: "Acetic acid",
  },
  {
    name: "Litmus/pH test",
    detects: "Acids vs phenols",
    reagents: "Blue litmus or pH paper",
    positive:
      "Carboxylic acids turn blue litmus red strongly; phenols weakly acidic",
    negative: "Neutral compounds show little change",
    example: "Benzoic acid vs phenol",
  },
];

const functionalQuizData = [
  {
    compound: "Ethanal",
    answer: "Tollens' test",
    expected: "Silver mirror; Fehling also gives brick-red ppt.",
  },
  {
    compound: "Acetone",
    answer: "2,4-DNP test",
    expected:
      "Orange precipitate; iodoform is also positive for methyl ketone.",
  },
  {
    compound: "Ethene",
    answer: "Baeyer's test",
    expected: "Cold alkaline KMnO4 decolorizes.",
  },
  {
    compound: "Acetic acid",
    answer: "Sodium bicarbonate test",
    expected: "CO2 effervescence.",
  },
  {
    compound: "tert-Butyl alcohol",
    answer: "Lucas test",
    expected: "Immediate turbidity.",
  },
];

const analyticalModes = [
  {
    id: "gravimetry",
    label: "Gravimetry",
    note: "Precipitate, dry, weigh, and convert mass to analyte.",
  },
  {
    id: "volumetric",
    label: "Volumetric",
    note: "Direct, back, EDTA, iodometry, and iodimetry titration logic.",
  },
  {
    id: "calibration",
    label: "Calibration",
    note: "Build Beer-Lambert calibration curves and read unknowns.",
  },
  {
    id: "chromatography",
    label: "Chromatography",
    note: "Interpret Rf, retention, resolution, and purity.",
  },
  {
    id: "quality",
    label: "Method QA",
    note: "Recovery, precision, blanks, interferences, and reporting checks.",
  },
];

const gravimetricMethods = {
  chloride: {
    analyte: "Cl-",
    precipitate: "AgCl",
    reagent: "AgNO3",
    factor: 35.45 / 143.32,
    check: "White curdy precipitate; soluble in NH3.",
    interference: "Br- and I- also precipitate with Ag+.",
  },
  sulfate: {
    analyte: "SO4^2-",
    precipitate: "BaSO4",
    reagent: "BaCl2",
    factor: 96.06 / 233.39,
    check: "Heavy white precipitate; insoluble in dilute acid.",
    interference: "Avoid phosphate/carbonate contamination.",
  },
  nickel: {
    analyte: "Ni^2+",
    precipitate: "Ni(DMG)2",
    reagent: "Dimethylglyoxime",
    factor: 58.69 / 288.91,
    check: "Red chelate precipitate in ammoniacal medium.",
    interference: "pH and masking agents change recovery.",
  },
  calcium: {
    analyte: "Ca^2+",
    precipitate: "CaC2O4.H2O",
    reagent: "Ammonium oxalate",
    factor: 40.08 / 146.11,
    check: "White calcium oxalate; ignition can convert to CaO for weighing.",
    interference:
      "Mg2+ and phosphate can co-precipitate if pH is poorly controlled.",
  },
  iron: {
    analyte: "Fe^3+",
    precipitate: "Fe2O3 after ignition",
    reagent: "NH4OH, then ignition",
    factor: 111.69 / 159.69,
    check: "Reddish-brown hydroxide ignites to constant-mass Fe2O3.",
    interference: "Al3+ and Cr3+ hydroxides contaminate unless separated.",
  },
};

const volumetricMethods = {
  "direct-acid-base": {
    label: "Direct acid-base titration",
    analyte: "Unknown monoprotic acid/base",
    factor: 1,
    unit: "M",
    formula: "Cunknown = Mtitrant x Vtitrant / Valiquot",
    endpoint: "Sharp indicator color change near equivalence.",
  },
  "back-titration": {
    label: "Back titration",
    analyte: "CaCO3 purity",
    factor: 100.09,
    unit: "% purity",
    formula: "% = M x (Vblank - Vsample) x Mr / sample mass x 100",
    endpoint: "Excess acid left after dissolving sample is titrated.",
  },
  complexometric: {
    label: "Complexometric EDTA titration",
    analyte: "Water hardness as CaCO3",
    factor: 100090,
    unit: "mg/L as CaCO3",
    formula: "Hardness = MEDTA x VEDTA x 100090 / Vsample",
    endpoint: "Eriochrome Black T changes wine red to blue.",
  },
  iodometry: {
    label: "Iodometry",
    analyte: "Cu2+ by thiosulfate",
    factor: 63.55,
    unit: "mg Cu",
    formula: "Cu2+ liberates I2; I2 is titrated by thiosulfate.",
    endpoint: "Starch blue disappears near endpoint.",
  },
  iodimetry: {
    label: "Iodimetry",
    analyte: "Ascorbic acid",
    factor: 176.12,
    unit: "mg vitamin C",
    formula: "Ascorbic acid reacts 1:1 with I2.",
    endpoint: "First permanent blue starch-iodine color.",
  },
  permanganometry: {
    label: "Permanganometry",
    analyte: "Fe2+ or oxalate",
    factor: 55.85,
    unit: "mg Fe2+",
    formula: "MnO4- self-indicates in acid; 1 mol MnO4- oxidizes 5 mol Fe2+.",
    endpoint: "Faint permanent pink color.",
  },
  argentometry: {
    label: "Argentometric precipitation titration",
    analyte: "Chloride by AgNO3",
    factor: 35.45,
    unit: "mg Cl-",
    formula:
      "Ag+ + Cl- -> AgCl; Mohr/Fajans/Volhard variants differ by indicator and medium.",
    endpoint:
      "Chromate red-brown Ag2CrO4 or adsorption indicator color change.",
  },
};

const calibrationStandards = [
  { c: 0, a: 0.002 },
  { c: 2, a: 0.126 },
  { c: 4, a: 0.247 },
  { c: 6, a: 0.371 },
  { c: 8, a: 0.493 },
  { c: 10, a: 0.615 },
];

const chromatographySamples = {
  ink: {
    label: "Ink mixture TLC",
    solventFront: 8.0,
    spots: [
      { label: "Yellow dye", distance: 2.2, color: "#facc15" },
      { label: "Blue dye", distance: 4.8, color: "#38bdf8" },
      { label: "Red dye", distance: 6.4, color: "#fb7185" },
    ],
    note: "Different dye polarity gives different attraction to the stationary phase.",
  },
  analgesic: {
    label: "Analgesic tablet HPLC",
    solventFront: 10,
    spots: [
      { label: "Caffeine", distance: 2.7, color: "#a78bfa" },
      { label: "Paracetamol", distance: 4.1, color: "#22c55e" },
      { label: "Aspirin", distance: 7.2, color: "#f59e0b" },
    ],
    note: "Peak order and area support identity, assay, and impurity decisions.",
  },
  aminoAcids: {
    label: "Amino acid paper chromatography",
    solventFront: 7.5,
    spots: [
      { label: "Glycine", distance: 1.9, color: "#60a5fa" },
      { label: "Alanine", distance: 3.1, color: "#34d399" },
      { label: "Leucine", distance: 5.9, color: "#f472b6" },
    ],
    note: "Ninhydrin reveals amino acid spots after development.",
  },
};

const analyticalWorkflowCards = [
  {
    title: "Sampling",
    detail:
      "Use representative sample, clean container, preservation, label, and chain-of-custody where needed.",
  },
  {
    title: "Preparation",
    detail:
      "Dissolve, digest, filter, mask interferences, dilute into calibration range, and record blanks.",
  },
  {
    title: "Measurement",
    detail:
      "Run standards, blank, sample, duplicate, spike/recovery, and method control sample.",
  },
  {
    title: "Reporting",
    detail:
      "Report units, method, dilution, significant figures, uncertainty, recovery correction, and detection limit.",
  },
];

const volumetricVariantNotes = [
  [
    "Direct titration",
    "Analyte reacts quickly and completely with titrant; endpoint closely matches equivalence point.",
  ],
  [
    "Back titration",
    "Add excess known reagent, let slow/insoluble sample react, then titrate leftover reagent.",
  ],
  [
    "Complexometric",
    "EDTA forms 1:1 metal complexes; pH buffer and masking agents control selectivity.",
  ],
  [
    "Iodometry",
    "Analyte oxidizes iodide to iodine; iodine is titrated with thiosulfate.",
  ],
  [
    "Iodimetry",
    "Standard iodine directly oxidizes a reducing analyte such as ascorbic acid.",
  ],
  [
    "Redox titration",
    "Electron equivalents replace acid-base equivalents; permanganate can self-indicate.",
  ],
  [
    "Precipitation titration",
    "Endpoint depends on first excess titrant or adsorption indicator after precipitate formation.",
  ],
];

const chromatographyRules = [
  [
    "Rf",
    "Rf = spot distance / solvent front; same compound has similar Rf only under identical conditions.",
  ],
  [
    "Resolution",
    "Rs about 1.5 or higher usually indicates baseline separation.",
  ],
  [
    "Retention",
    "In HPLC/GC, identity is supported by retention time but confirmed with standards or spectra.",
  ],
  [
    "Peak area",
    "Area is used for quantity after calibration or internal-standard correction.",
  ],
  [
    "Tailing",
    "Peak tailing suggests adsorption, overload, active sites, or pH mismatch.",
  ],
  [
    "Mobile phase",
    "Changing polarity, pH, or gradient changes retention and selectivity.",
  ],
];

const analyticalPracticeScenarios = [
  {
    prompt:
      "A limestone tablet dissolves slowly and leaves insoluble material. Which titration style is best?",
    answer:
      "Back titration: add excess acid to react with CaCO3, then titrate leftover acid.",
  },
  {
    prompt:
      "A water-hardness endpoint changes wine red to blue at pH 10. Which method is being used?",
    answer: "Complexometric EDTA titration with Eriochrome Black T indicator.",
  },
  {
    prompt: "An unknown absorbance is higher than the highest standard.",
    answer:
      "Dilute the sample and rerun; do not extrapolate beyond the calibration range.",
  },
  {
    prompt: "Two HPLC peaks have Rs = 0.8.",
    answer:
      "They are poorly resolved; change mobile phase, column, gradient, pH, or temperature.",
  },
  {
    prompt: "A gravimetric precipitate is not washed well.",
    answer:
      "Adsorbed ions or mother liquor cause positive error in precipitate mass.",
  },
];

const structuralIsomerData = {
  C4H10: [
    {
      type: "Chain",
      name: "Butane",
      formula: "CH3-CH2-CH2-CH3",
      points: [
        [16, 58],
        [58, 34],
        [100, 58],
        [142, 34],
      ],
    },
    {
      type: "Chain",
      name: "2-methylpropane",
      formula: "(CH3)3CH",
      points: [
        [30, 62],
        [74, 38],
        [118, 62],
        [74, 84],
      ],
    },
  ],
  C3H6O: [
    {
      type: "Functional",
      name: "Propanal",
      formula: "CH3-CH2-CHO",
      points: [
        [18, 62],
        [66, 38],
        [114, 62],
      ],
      suffix: "CHO",
    },
    {
      type: "Functional",
      name: "Propanone",
      formula: "CH3-CO-CH3",
      points: [
        [18, 62],
        [72, 38],
        [126, 62],
      ],
      suffix: "C=O",
    },
  ],
  C2H6O: [
    {
      type: "Functional",
      name: "Ethanol",
      formula: "CH3-CH2-OH",
      points: [
        [24, 62],
        [80, 38],
        [136, 62],
      ],
      suffix: "OH",
    },
    {
      type: "Functional",
      name: "Methoxymethane",
      formula: "CH3-O-CH3",
      points: [
        [28, 62],
        [82, 38],
        [136, 62],
      ],
      suffix: "O",
    },
  ],
  C4H8: [
    {
      type: "Position",
      name: "But-1-ene",
      formula: "CH2=CH-CH2-CH3",
      points: [
        [16, 58],
        [58, 34],
        [100, 58],
        [142, 34],
      ],
      suffix: "C=C at C1",
    },
    {
      type: "Position",
      name: "But-2-ene",
      formula: "CH3-CH=CH-CH3",
      points: [
        [16, 34],
        [58, 58],
        [100, 58],
        [142, 34],
      ],
      suffix: "C=C at C2",
    },
    {
      type: "Chain",
      name: "2-methylpropene",
      formula: "(CH3)2C=CH2",
      points: [
        [34, 58],
        [80, 34],
        [126, 58],
        [80, 84],
      ],
      suffix: "branched alkene",
    },
  ],
};

const BondLineSketch = ({ item, label }) => (
  <svg
    viewBox="0 0 160 110"
    className="w-full h-32 rounded-xl bg-black/20 border border-white/10"
  >
    <polyline
      points={item.points.map(([x, y]) => `${x},${y}`).join(" ")}
      fill="none"
      stroke="#e2e8f0"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {item.points.map(([x, y], index) => (
      <circle key={index} cx={x} cy={y} r="3" fill="#38bdf8" />
    ))}
    {item.suffix && (
      <text x="80" y="92" textAnchor="middle" fill="#a5f3fc" fontSize="9">
        {item.suffix}
      </text>
    )}
    <text x="10" y="18" fill="#94a3b8" fontSize="8">
      {label || item.formula}
    </text>
  </svg>
);

const StereoSketches = () => (
  <div className="grid lg:grid-cols-3 gap-3">
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">
        Geometric: cis/trans but-2-ene
      </p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        <line
          x1="54"
          y1="42"
          x2="98"
          y2="62"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <line
          x1="98"
          y1="62"
          x2="142"
          y2="62"
          stroke="#e2e8f0"
          strokeWidth="5"
        />
        <line
          x1="142"
          y1="62"
          x2="186"
          y2="42"
          stroke="#e2e8f0"
          strokeWidth="3"
        />
        <text x="44" y="36" fill="#a5f3fc" fontSize="10">
          CH3
        </text>
        <text x="176" y="36" fill="#a5f3fc" fontSize="10">
          CH3
        </text>
        <text x="94" y="94" fill="#94a3b8" fontSize="9">
          cis: same side
        </text>
      </svg>
      <p className="text-[11px] text-gray-400 mt-2">
        E/Z uses CIP priority: higher-priority groups same side = Z, opposite
        side = E.
      </p>
    </div>
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">Optical isomerism</p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        <line
          x1="110"
          y1="15"
          x2="110"
          y2="105"
          stroke="#64748b"
          strokeDasharray="4 4"
        />
        {[58, 162].map((cx, i) => (
          <g key={cx}>
            <circle cx={cx} cy="60" r="10" fill="#38bdf8" />
            <line
              x1={cx}
              y1="60"
              x2={cx - (i ? -24 : 24)}
              y2="32"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <line
              x1={cx}
              y1="60"
              x2={cx + (i ? -24 : 24)}
              y2="88"
              stroke="#e2e8f0"
              strokeWidth="2"
            />
            <text x={cx - 42} y="30" fill="#a5f3fc" fontSize="8">
              A
            </text>
            <text x={cx + 34} y="92" fill="#f0abfc" fontSize="8">
              B
            </text>
          </g>
        ))}
        <text x="64" y="112" textAnchor="middle" fill="#94a3b8" fontSize="8">
          enantiomers
        </text>
        <text x="162" y="112" textAnchor="middle" fill="#94a3b8" fontSize="8">
          mirror image
        </text>
      </svg>
      <p className="text-[11px] text-gray-400 mt-2">
        Diastereomers are stereoisomers that are not mirror images; meso forms
        are achiral due to internal symmetry.
      </p>
    </div>
    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
      <p className="text-xs font-bold text-white mb-2">
        Conformational: Newman projections
      </p>
      <svg viewBox="0 0 220 120" className="w-full h-32 rounded-lg bg-black/20">
        {[58, 162].map((cx, i) => (
          <g key={cx}>
            <circle
              cx={cx}
              cy="60"
              r="18"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
            />
            {[270, 30, 150].map((deg, j) => {
              const rad = ((deg + (i ? 0 : 60)) * Math.PI) / 180;
              return (
                <line
                  key={j}
                  x1={cx}
                  y1="60"
                  x2={cx + Math.cos(rad) * 34}
                  y2={60 + Math.sin(rad) * 34}
                  stroke="#e2e8f0"
                  strokeWidth="2"
                />
              );
            })}
            <circle cx={cx} cy="60" r="4" fill="#fbbf24" />
            <text
              x={cx}
              y="110"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="8"
            >
              {i ? "eclipsed" : "staggered"}
            </text>
          </g>
        ))}
      </svg>
    </div>
  </div>
);

const reactivityMetals = [
  { symbol: "K", name: "Potassium", rank: 14, color: "#ef4444" },
  { symbol: "Na", name: "Sodium", rank: 13, color: "#f97316" },
  { symbol: "Ca", name: "Calcium", rank: 12, color: "#f59e0b" },
  { symbol: "Mg", name: "Magnesium", rank: 11, color: "#eab308" },
  { symbol: "Al", name: "Aluminium", rank: 10, color: "#84cc16" },
  { symbol: "Zn", name: "Zinc", rank: 9, color: "#22c55e" },
  { symbol: "Fe", name: "Iron", rank: 8, color: "#10b981" },
  { symbol: "Ni", name: "Nickel", rank: 7, color: "#14b8a6" },
  { symbol: "Sn", name: "Tin", rank: 6, color: "#06b6d4" },
  { symbol: "Pb", name: "Lead", rank: 5, color: "#3b82f6" },
  { symbol: "H", name: "Hydrogen", rank: 4, color: "#6366f1" },
  { symbol: "Cu", name: "Copper", rank: 3, color: "#8b5cf6" },
  { symbol: "Ag", name: "Silver", rank: 2, color: "#a855f7" },
  { symbol: "Au", name: "Gold", rank: 1, color: "#ec4899" },
];

const saltSolutions = [
  { metal: "Zn", salt: "ZnSO4", color: "#bfdbfe" },
  { metal: "Fe", salt: "FeSO4", color: "#bbf7d0" },
  { metal: "Cu", salt: "CuSO4", color: "#38bdf8" },
  { metal: "Ag", salt: "AgNO3", color: "#e5e7eb" },
  { metal: "Pb", salt: "Pb(NO3)2", color: "#fef3c7" },
];

const reactionMediumNotes = {
  water:
    "K, Na, and Ca react with cold water to form hydroxides and hydrogen gas; Mg reacts slowly with hot water/steam.",
  acid: "Metals above hydrogen displace H2 from dilute acids.",
  hcl: "Dilute HCl reacts with metals above hydrogen to form metal chlorides and H2.",
};

const quantumOrbitalLetters = ["s", "p", "d", "f"];
const PLANCK = 6.626e-34;
const ELECTRON_VOLT = 1.602e-19;
const GAS_R = 8.314;

const gibbsSignTable = [
  {
    h: "-",
    s: "+",
    when: "Spontaneous at all temperatures",
    note: "Exothermic and entropy increases.",
  },
  {
    h: "-",
    s: "-",
    when: "Spontaneous at low temperature",
    note: "Heat release wins when T is small.",
  },
  {
    h: "+",
    s: "+",
    when: "Spontaneous at high temperature",
    note: "Entropy term wins when T is large.",
  },
  {
    h: "+",
    s: "-",
    when: "Non-spontaneous at all temperatures",
    note: "Endothermic and entropy decreases.",
  },
];

const GibbsPlot = ({ dH, dS, temp }) => {
  const points = Array.from({ length: 12 }, (_, i) => {
    const t = 200 + i * (1300 / 11);
    const g = dH - t * (dS / 1000);
    return { t, g };
  });
  const minG = Math.min(...points.map((p) => p.g), 0);
  const maxG = Math.max(...points.map((p) => p.g), 0);
  const span = Math.max(1, maxG - minG);
  const line = points
    .map((p) => {
      const x = 24 + ((p.t - 200) / 1300) * 212;
      const y = 116 - ((p.g - minG) / span) * 86;
      return `${x},${y}`;
    })
    .join(" ");
  const zeroY = 116 - ((0 - minG) / span) * 86;
  const tempX = 24 + ((temp - 200) / 1300) * 212;
  return (
    <svg
      viewBox="0 0 260 140"
      className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
    >
      <line x1="24" y1="116" x2="240" y2="116" stroke="#475569" />
      <line x1="24" y1="24" x2="24" y2="116" stroke="#475569" />
      <line
        x1="24"
        y1={zeroY}
        x2="240"
        y2={zeroY}
        stroke="#f59e0b"
        strokeDasharray="4 4"
      />
      <polyline points={line} fill="none" stroke="#38bdf8" strokeWidth="3" />
      <line
        x1={tempX}
        y1="24"
        x2={tempX}
        y2="116"
        stroke="#a78bfa"
        strokeWidth="2"
      />
      <text x="26" y="18" fill="#94a3b8" fontSize="8">
        Delta G
      </text>
      <text x="202" y="132" fill="#94a3b8" fontSize="8">
        T (K)
      </text>
      <text x={Math.min(205, tempX + 4)} y="36" fill="#c4b5fd" fontSize="8">
        {temp} K
      </text>
    </svg>
  );
};

const AtmosphereSketch = () => (
  <svg
    viewBox="0 0 260 150"
    className="w-full h-48 rounded-xl bg-black/20 border border-white/10"
  >
    {[
      ["Troposphere", 105, "#22c55e", "weather, dust, water vapor"],
      ["Stratosphere", 70, "#38bdf8", "ozone layer"],
      ["Mesosphere", 38, "#818cf8", "meteors burn"],
      ["Thermosphere", 14, "#f472b6", "ionosphere"],
    ].map(([label, y, color, note]) => (
      <g key={label}>
        <rect
          x="22"
          y={y}
          width="216"
          height="28"
          rx="6"
          fill={color}
          opacity="0.18"
          stroke={color}
        />
        <text x="34" y={y + 12} fill="#f8fafc" fontSize="9" fontWeight="700">
          {label}
        </text>
        <text x="34" y={y + 23} fill="#cbd5e1" fontSize="7">
          {note}
        </text>
      </g>
    ))}
  </svg>
);

const cftGeometryData = {
  Octahedral: {
    levels: [
      { label: "t2g", count: 3, energy: -0.4 },
      { label: "eg", count: 2, energy: 0.6 },
    ],
    note: "t2g lower, eg upper; gap is Delta o.",
  },
  Tetrahedral: {
    levels: [
      { label: "e", count: 2, energy: -0.6 },
      { label: "t2", count: 3, energy: 0.4 },
    ],
    note: "e lower, t2 upper; Delta t is about 4/9 Delta o.",
  },
  "Square Planar": {
    levels: [
      { label: "dxy", count: 1, energy: -0.6 },
      { label: "dz2", count: 1, energy: -0.2 },
      { label: "dxz, dyz", count: 2, energy: 0.2 },
      { label: "dx2-y2", count: 1, energy: 1.0 },
    ],
    note: "Square planar splitting places dx2-y2 highest.",
  },
};

const fillCftLevels = (geometry, electrons, field) => {
  const data = cftGeometryData[geometry];
  const boxes = data.levels.flatMap((level) =>
    Array.from({ length: level.count }, (_, index) => ({
      ...level,
      id: `${level.label}-${index}`,
      electrons: 0,
    })),
  );
  const ordered = boxes.map((box, index) => index);
  const addSingle = (indices) => {
    for (const index of indices) {
      if (electrons <= 0) return;
      if (boxes[index].electrons === 0) {
        boxes[index].electrons = 1;
        electrons -= 1;
      }
    }
  };
  const addPairs = (indices) => {
    for (const index of indices) {
      if (electrons <= 0) return;
      if (boxes[index].electrons === 1) {
        boxes[index].electrons = 2;
        electrons -= 1;
      }
    }
  };
  if (field === "weak" && geometry === "Octahedral") {
    addSingle(ordered);
    addPairs(ordered);
  } else {
    data.levels.forEach((level) => {
      const indices = ordered.filter(
        (index) => boxes[index].label === level.label,
      );
      addSingle(indices);
      addPairs(indices);
    });
  }
  const unpaired = boxes.filter((box) => box.electrons === 1).length;
  const cfse = boxes.reduce((sum, box) => sum + box.electrons * box.energy, 0);
  const pairs = boxes.filter((box) => box.electrons === 2).length;
  return { boxes, unpaired, cfse, pairs };
};

const CftDiagram = ({ geometry, filled }) => {
  const data = cftGeometryData[geometry];
  return (
    <svg
      viewBox="0 0 300 190"
      className="w-full h-64 rounded-xl bg-black/20 border border-white/10"
    >
      <line x1="30" y1="160" x2="30" y2="25" stroke="#64748b" />
      <text
        x="12"
        y="30"
        fill="#94a3b8"
        fontSize="8"
        transform="rotate(-90 12 30)"
      >
        energy
      </text>
      {data.levels.map((level, levelIndex) => {
        const y = 135 - ((level.energy + 0.8) / 2) * 90;
        const levelBoxes = filled.boxes.filter(
          (box) => box.label === level.label,
        );
        return (
          <g key={level.label}>
            <text x="48" y={y + 4} fill="#cbd5e1" fontSize="10">
              {level.label}
            </text>
            {levelBoxes.map((box, index) => (
              <g key={box.id}>
                <line
                  x1={95 + index * 35}
                  y1={y}
                  x2={122 + index * 35}
                  y2={y}
                  stroke={levelIndex ? "#f472b6" : "#38bdf8"}
                  strokeWidth="3"
                />
                {box.electrons >= 1 && (
                  <text
                    x={99 + index * 35}
                    y={y - 5}
                    fill="#f8fafc"
                    fontSize="14"
                  >
                    up
                  </text>
                )}
                {box.electrons === 2 && (
                  <text
                    x={111 + index * 35}
                    y={y - 5}
                    fill="#f8fafc"
                    fontSize="14"
                  >
                    dn
                  </text>
                )}
              </g>
            ))}
          </g>
        );
      })}
      <path
        d="M248 70 V125"
        stroke="#fbbf24"
        strokeWidth="2"
        markerEnd="url(#arrow)"
        markerStart="url(#arrow)"
      />
      <text x="254" y="100" fill="#fde68a" fontSize="9">
        {geometry === "Tetrahedral" ? "Delta t" : "Delta o"}
      </text>
      <defs>
        <marker
          id="arrow"
          markerWidth="8"
          markerHeight="8"
          refX="4"
          refY="4"
          orient="auto"
        >
          <path d="M0,0 L8,4 L0,8 Z" fill="#fbbf24" />
        </marker>
      </defs>
    </svg>
  );
};

const metallurgyData = {
  Al: [
    {
      title: "Ore",
      detail: "Bauxite: Al2O3.xH2O",
      equation: "Al ore with Fe2O3 and SiO2 impurities",
      purpose: "Source of aluminium.",
    },
    {
      title: "Crushing",
      detail: "Powdered bauxite",
      equation: "Mechanical size reduction",
      purpose: "Increase surface area.",
    },
    {
      title: "Bayer leaching",
      detail: "Hot concentrated NaOH",
      equation: "Al2O3 + 2NaOH + 3H2O -> 2Na[Al(OH)4]",
      purpose: "Dissolve alumina selectively.",
    },
    {
      title: "Hall-Heroult",
      detail: "Electrolysis of alumina in molten cryolite",
      equation: "2Al2O3 + 3C -> 4Al + 3CO2",
      purpose: "Reduce Al3+ to Al.",
    },
    {
      title: "Refining",
      detail: "Electrolytic refining when high purity is needed",
      equation: "Al3+ + 3e- -> Al",
      purpose: "Improve purity.",
    },
  ],
  Fe: [
    {
      title: "Ore",
      detail: "Haematite: Fe2O3",
      equation: "Fe2O3 with gangue",
      purpose: "Iron source.",
    },
    {
      title: "Concentration",
      detail: "Gravity/magnetic separation",
      equation: "Remove lighter gangue",
      purpose: "Enrich ore.",
    },
    {
      title: "Blast furnace zones",
      detail: "Hot air, coke, limestone",
      equation: "C + O2 -> CO2; C + CO2 -> 2CO",
      purpose: "Generate reducing CO.",
    },
    {
      title: "Reduction",
      detail: "Upper/middle furnace",
      equation: "Fe2O3 + 3CO -> 2Fe + 3CO2",
      purpose: "Reduce oxide to iron.",
    },
    {
      title: "Slag formation",
      detail: "Limestone flux",
      equation: "CaCO3 -> CaO + CO2; CaO + SiO2 -> CaSiO3",
      purpose: "Remove silica impurity.",
    },
  ],
  Cu: [
    {
      title: "Ore",
      detail: "Copper pyrites / sulphide ore",
      equation: "CuFeS2 or Cu2S",
      purpose: "Copper source.",
    },
    {
      title: "Froth flotation",
      detail: "Sulphide ore concentration",
      equation: "Pine oil froth carries sulphide particles",
      purpose: "Separate sulphide from gangue.",
    },
    {
      title: "Roasting",
      detail: "Partial oxidation",
      equation: "2Cu2S + 3O2 -> 2Cu2O + 2SO2",
      purpose: "Convert sulphide partly to oxide.",
    },
    {
      title: "Bessemerisation",
      detail: "Self-reduction",
      equation: "2Cu2O + Cu2S -> 6Cu + SO2",
      purpose: "Produce blister copper.",
    },
    {
      title: "Refining",
      detail: "Electrolytic refining",
      equation: "Cu2+ + 2e- -> Cu",
      purpose: "Get pure copper.",
    },
  ],
  Zn: [
    {
      title: "Ore",
      detail: "Zinc blende: ZnS",
      equation: "ZnS ore",
      purpose: "Zinc source.",
    },
    {
      title: "Froth flotation",
      detail: "Concentrates sulphide ore",
      equation: "Sulphide particles attach to froth",
      purpose: "Remove gangue.",
    },
    {
      title: "Roasting",
      detail: "Convert sulphide to oxide",
      equation: "2ZnS + 3O2 -> 2ZnO + 2SO2",
      purpose: "Make reducible oxide.",
    },
    {
      title: "Reduction",
      detail: "Coke, high temperature",
      equation: "ZnO + C -> Zn + CO",
      purpose: "Obtain zinc vapour.",
    },
    {
      title: "Refining",
      detail: "Distillation/electrolytic refining",
      equation: "Condense Zn vapour",
      purpose: "Purify zinc.",
    },
  ],
  Pb: [
    {
      title: "Ore",
      detail: "Galena: PbS",
      equation: "PbS ore",
      purpose: "Lead source.",
    },
    {
      title: "Froth flotation",
      detail: "Sulphide concentration",
      equation: "Froth carries PbS",
      purpose: "Enrich ore.",
    },
    {
      title: "Roasting",
      detail: "PbS partly oxidized",
      equation: "2PbS + 3O2 -> 2PbO + 2SO2",
      purpose: "Make oxide/sulphate mix.",
    },
    {
      title: "Self-reduction",
      detail: "Smelting",
      equation: "PbS + 2PbO -> 3Pb + SO2",
      purpose: "Produce lead.",
    },
    {
      title: "Refining",
      detail: "Electrolytic refining",
      equation: "Pb2+ + 2e- -> Pb",
      purpose: "Remove impurities.",
    },
  ],
  Na: [
    {
      title: "Ore",
      detail: "Fused NaCl",
      equation: "Downs cell feed",
      purpose: "Sodium source.",
    },
    {
      title: "Drying",
      detail: "Remove moisture",
      equation: "Avoid water reduction",
      purpose: "Prevent side reactions.",
    },
    {
      title: "Electrolysis",
      detail: "Downs process",
      equation: "2NaCl(l) -> 2Na + Cl2",
      purpose: "Extract highly reactive sodium.",
    },
    {
      title: "Collection",
      detail: "Na and Cl2 kept separate",
      equation: "Na forms at cathode",
      purpose: "Avoid recombination.",
    },
    {
      title: "Storage",
      detail: "Store under kerosene",
      equation: "Na reacts with air/water",
      purpose: "Protect metal.",
    },
  ],
  Mg: [
    {
      title: "Ore",
      detail: "Carnallite / magnesite / sea water",
      equation: "MgCl2 prepared",
      purpose: "Magnesium source.",
    },
    {
      title: "Concentration",
      detail: "Convert to anhydrous MgCl2",
      equation: "MgCl2.xH2O -> MgCl2",
      purpose: "Prepare electrolyte.",
    },
    {
      title: "Electrolysis",
      detail: "Molten MgCl2",
      equation: "MgCl2(l) -> Mg + Cl2",
      purpose: "Reduce Mg2+.",
    },
    {
      title: "Refining",
      detail: "Distillation under inert atmosphere",
      equation: "Physical purification",
      purpose: "Remove volatile impurities.",
    },
    {
      title: "Special methods",
      detail: "Pidgeon process also used",
      equation: "2MgO + Si -> 2Mg + SiO2",
      purpose: "Thermal reduction route.",
    },
  ],
};

const saltAnalysisGroups = [
  [
    "Group I (dilute HCl)",
    "Pb2+, Ag+, Hg2 2+",
    "White/yellow chloride precipitates",
  ],
  [
    "Group II (H2S in HCl)",
    "Cu2+, Pb2+, As3+",
    "Colored sulphide precipitates",
  ],
  ["Group III (NH4OH + NH4Cl)", "Fe3+, Al3+, Cr3+", "Hydroxide precipitates"],
  [
    "Group IV (H2S in NH4OH)",
    "Ni2+, Co2+, Mn2+, Zn2+",
    "Sulphide precipitates in basic medium",
  ],
  ["Group V ((NH4)2CO3)", "Ba2+, Sr2+, Ca2+", "Carbonate precipitates"],
  [
    "Group VI (no group reagent)",
    "Mg2+, Na+, K+, NH4+",
    "Special confirmatory tests",
  ],
];

const anionTests = [
  ["CO3 2-", "Dilute HCl", "CO2 effervescence; lime water turns milky"],
  ["SO4 2-", "BaCl2 after acidifying", "White BaSO4 precipitate"],
  ["Cl-", "AgNO3", "White curdy AgCl precipitate"],
  ["Br-", "AgNO3", "Pale yellow AgBr precipitate"],
  ["I-", "AgNO3 / starch-iodine", "Yellow AgI; blue starch-iodine complex"],
  ["NO3-", "Brown ring test", "Brown ring at junction"],
  ["PO4 3-", "Ammonium molybdate", "Canary yellow precipitate"],
  ["S2-", "Lead acetate paper", "Black PbS stain"],
];

const saltSamples = {
  NaCl: [
    "Flame test: intense yellow confirms Na+.",
    "Add dilute HNO3, then AgNO3: white curdy ppt of AgCl.",
    "Confirm AgCl dissolves in NH4OH.",
  ],
  CuSO4: [
    "Blue solution suggests Cu2+.",
    "Pass H2S in acidic medium: black CuS ppt.",
    "Add BaCl2 after acidifying: white BaSO4 confirms sulphate.",
  ],
  NH4NO3: [
    "Warm with NaOH: ammonia smell; moist red litmus turns blue.",
    "Brown ring test confirms nitrate.",
    "No permanent flame color expected.",
  ],
  BaCO3: [
    "Dilute HCl gives brisk CO2; lime water turns milky.",
    "Ba2+ gives apple green flame.",
    "Add (NH4)2CO3 in group V gives white carbonate ppt.",
  ],
};

const saltWorkflowStages = [
  {
    id: "preliminary",
    label: "Preliminary",
    cue: "Color, solubility, flame, dry heating, dilute acid action.",
  },
  {
    id: "anion",
    label: "Anion Tests",
    cue: "Use dilute acid group, concentrated acid clues, then confirmatory tests.",
  },
  {
    id: "cation",
    label: "Cation Groups",
    cue: "Add group reagents in order so earlier ions do not mask later ions.",
  },
  {
    id: "confirm",
    label: "Confirm",
    cue: "Run specific confirmatory tests and cross-check interference.",
  },
  {
    id: "viva",
    label: "Viva",
    cue: "Explain why each reagent is used and what false positives can occur.",
  },
];

const cationSeparationData = {
  Pb2: {
    ion: "Pb2+",
    group: "I",
    reagent: "Dilute HCl",
    observation:
      "White PbCl2 ppt; dissolves in hot water, yellow PbCrO4 with K2CrO4.",
    confirm: "Hot-water extract + K2CrO4 gives yellow precipitate.",
    color: "#f8fafc",
    interference:
      "Pb2+ can also appear in Group II if not fully removed in Group I.",
  },
  Ag: {
    ion: "Ag+",
    group: "I",
    reagent: "Dilute HCl",
    observation:
      "White curdy AgCl ppt; soluble in NH4OH, reprecipitates with HNO3.",
    confirm:
      "AgCl dissolves in ammonium hydroxide due to diamminesilver complex.",
    color: "#e5e7eb",
    interference:
      "Cl- in glassware or tap water can create false AgCl cloudiness.",
  },
  Cu: {
    ion: "Cu2+",
    group: "II",
    reagent: "H2S in acidic medium",
    observation: "Black CuS ppt; blue solution; deep blue complex with NH4OH.",
    confirm: "Add NH4OH: pale blue ppt dissolves to deep blue solution.",
    color: "#38bdf8",
    interference:
      "Insufficient acidity lets Group IV sulphides precipitate too early.",
  },
  Fe: {
    ion: "Fe3+",
    group: "III",
    reagent: "NH4Cl + NH4OH",
    observation: "Reddish-brown Fe(OH)3 precipitate.",
    confirm: "KSCN gives blood-red ferric thiocyanate complex.",
    color: "#fb923c",
    interference:
      "Fe2+ must be oxidized to Fe3+ for classic ferric confirmatory test.",
  },
  Al: {
    ion: "Al3+",
    group: "III",
    reagent: "NH4Cl + NH4OH",
    observation: "White gelatinous Al(OH)3; dissolves in excess NaOH.",
    confirm: "Aluminate solution gives white gelatinous ppt on acidification.",
    color: "#f1f5f9",
    interference:
      "Zn(OH)2 is also amphoteric; group separation context matters.",
  },
  Zn: {
    ion: "Zn2+",
    group: "IV",
    reagent: "H2S in ammoniacal medium",
    observation: "White ZnS precipitate.",
    confirm: "Potassium ferrocyanide gives bluish-white zinc ferrocyanide ppt.",
    color: "#e2e8f0",
    interference: "Too acidic medium prevents ZnS precipitation.",
  },
  Ni: {
    ion: "Ni2+",
    group: "IV",
    reagent: "H2S in ammoniacal medium",
    observation: "Black NiS precipitate.",
    confirm: "Dimethylglyoxime in ammoniacal medium gives red ppt.",
    color: "#ef4444",
    interference:
      "Fe/Ni colors can confuse if Group III ions were not removed.",
  },
  Ba: {
    ion: "Ba2+",
    group: "V",
    reagent: "(NH4)2CO3 with NH4Cl/NH4OH",
    observation: "White BaCO3 ppt; apple green flame.",
    confirm: "K2CrO4 gives yellow BaCrO4; sulphate gives insoluble BaSO4.",
    color: "#84cc16",
    interference:
      "Carbonate anion must be removed before group V cation precipitation.",
  },
  Ca: {
    ion: "Ca2+",
    group: "V",
    reagent: "(NH4)2CO3 with NH4Cl/NH4OH",
    observation: "White CaCO3 ppt; brick-red flame.",
    confirm: "Ammonium oxalate gives white CaC2O4 ppt.",
    color: "#fb7185",
    interference: "Ba2+ and Sr2+ must be separated before Ca2+ confirmation.",
  },
  NH4: {
    ion: "NH4+",
    group: "VI",
    reagent: "NaOH warm",
    observation: "Ammonia gas turns moist red litmus blue.",
    confirm: "NH3 fumes form white smoke with HCl rod.",
    color: "#a78bfa",
    interference:
      "Do NH4+ test before adding ammonium salts in group analysis.",
  },
  Na: {
    ion: "Na+",
    group: "VI",
    reagent: "Flame test",
    observation: "Persistent golden-yellow flame.",
    confirm: "Uranyl zinc acetate gives yellow crystalline ppt where used.",
    color: "#facc15",
    interference:
      "Sodium contamination is common; cobalt glass is not useful for Na.",
  },
};

const anionConfirmatoryData = {
  CO3: {
    ion: "CO3^2-",
    group: "Dilute acid group",
    reagent: "Dilute HCl then lime water",
    observation: "Brisk effervescence; CO2 turns lime water milky.",
    confirm: "Milkiness disappears in excess CO2 due to bicarbonate formation.",
    interference:
      "Sulphite also releases gas; confirm with lime water and odor/context.",
  },
  SO4: {
    ion: "SO4^2-",
    group: "Barium test",
    reagent: "BaCl2 after acidifying with dilute HCl",
    observation: "Dense white BaSO4 ppt insoluble in acids.",
    confirm: "Precipitate remains insoluble in dilute HCl/HNO3.",
    interference:
      "Carbonate and sulphite must be removed by acidification first.",
  },
  Cl: {
    ion: "Cl-",
    group: "Silver nitrate test",
    reagent: "Dilute HNO3 then AgNO3",
    observation: "White curdy AgCl ppt soluble in NH4OH.",
    confirm: "Reprecipitation on acidifying ammoniacal solution with HNO3.",
    interference: "Use HNO3, not HCl, before AgNO3 or you add chloride.",
  },
  Br: {
    ion: "Br-",
    group: "Silver nitrate test",
    reagent: "Dilute HNO3 then AgNO3",
    observation: "Pale yellow AgBr partly soluble in NH4OH.",
    confirm: "Chlorine water liberates bromine; organic layer orange-brown.",
    interference: "Iodide gives darker yellow ppt; use oxidizing confirmation.",
  },
  I: {
    ion: "I-",
    group: "Silver nitrate / starch test",
    reagent: "AgNO3 or chlorine water + starch",
    observation: "Yellow AgI insoluble in NH4OH; blue-black starch iodine.",
    confirm: "Chlorine water oxidizes I- to I2; starch turns blue-black.",
    interference:
      "Excess chlorine water can further oxidize iodine and discharge color.",
  },
  NO3: {
    ion: "NO3-",
    group: "Brown ring test",
    reagent: "Fresh FeSO4 then conc. H2SO4 down side",
    observation: "Brown ring at junction.",
    confirm: "Nitrosyl ferrous sulphate ring forms at acid interface.",
    interference:
      "Nitrite interferes; destroy nitrite with sulphamic acid before nitrate test.",
  },
  PO4: {
    ion: "PO4^3-",
    group: "Molybdate test",
    reagent: "Ammonium molybdate + conc. HNO3 warm",
    observation: "Canary-yellow ammonium phosphomolybdate ppt.",
    confirm: "Yellow ppt intensifies on warming.",
    interference: "Arsenate gives similar molybdate precipitate.",
  },
  S: {
    ion: "S^2-",
    group: "Lead acetate test",
    reagent: "Dilute acid gas to lead acetate paper",
    observation: "Black PbS stain.",
    confirm: "H2S smell and blackening of lead acetate paper.",
    interference: "Do in ventilation; sulphide can mask metal sulphide colors.",
  },
};

const saltUnknowns = {
  NaCl: {
    cation: "Na",
    anion: "Cl",
    appearance: "White crystalline solid, soluble in water.",
    dryHeat: "No gas; crackling may occur.",
    flame: "Golden yellow",
    solubility: "Soluble",
    clue: "Common neutral salt with halide behavior.",
  },
  CuSO4: {
    cation: "Cu",
    anion: "SO4",
    appearance: "Blue crystalline solid; blue solution.",
    dryHeat: "Hydrated crystals may lose water and become pale.",
    flame: "Blue-green edge may appear",
    solubility: "Soluble",
    clue: "Color already suggests transition-metal cation.",
  },
  NH4NO3: {
    cation: "NH4",
    anion: "NO3",
    appearance: "White crystalline solid, very soluble.",
    dryHeat: "May decompose on heating; no residue in simple school test.",
    flame: "No characteristic flame",
    solubility: "Soluble",
    clue: "Ammonium and nitrate both require special tests.",
  },
  BaCO3: {
    cation: "Ba",
    anion: "CO3",
    appearance: "White powder, sparingly soluble.",
    dryHeat: "No simple color change.",
    flame: "Apple green",
    solubility: "Insoluble in water, dissolves in acid with effervescence.",
    clue: "Acid action is the fastest clue.",
  },
  FeCl3: {
    cation: "Fe",
    anion: "Cl",
    appearance: "Yellow-brown solid/solution.",
    dryHeat: "May fume; hydrolysis color is common.",
    flame: "No diagnostic flame",
    solubility: "Soluble",
    clue: "Ferric color plus chloride test.",
  },
  AlPO4: {
    cation: "Al",
    anion: "PO4",
    appearance: "White gelatinous solid, sparingly soluble.",
    dryHeat: "No characteristic gas.",
    flame: "No diagnostic flame",
    solubility: "Sparingly soluble",
    clue: "Amphoteric hydroxide and phosphate molybdate test.",
  },
  ZnS: {
    cation: "Zn",
    anion: "S",
    appearance: "White to pale solid, insoluble.",
    dryHeat: "Acid releases H2S odor in conceptual test.",
    flame: "No diagnostic flame",
    solubility: "Insoluble; reacts with acid.",
    clue: "Sulphide anion can interfere with metal sulphide group tests.",
  },
  CaBr2: {
    cation: "Ca",
    anion: "Br",
    appearance: "White hygroscopic solid.",
    dryHeat: "No characteristic gas in simple test.",
    flame: "Brick red",
    solubility: "Soluble",
    clue: "Calcium flame plus bromide confirmation.",
  },
  NiCl2: {
    cation: "Ni",
    anion: "Cl",
    appearance: "Green solid/solution.",
    dryHeat: "Hydrated salt may lose water.",
    flame: "No reliable flame",
    solubility: "Soluble",
    clue: "Dimethylglyoxime confirmation is decisive.",
  },
};

const saltVivaPrompts = [
  [
    "Why is dilute HCl added first in group analysis?",
    "It precipitates Group I chlorides before sulphide and hydroxide groups are tested.",
  ],
  [
    "Why is H2S passed in acidic medium for Group II?",
    "Acid suppresses S2- concentration, so only very insoluble Group II sulphides precipitate.",
  ],
  [
    "Why add NH4Cl before NH4OH in Group III?",
    "NH4Cl suppresses OH- concentration and prevents premature precipitation of later-group hydroxides.",
  ],
  [
    "Why acidify with HNO3 before AgNO3 halide tests?",
    "HNO3 removes carbonate/sulphite interference without adding chloride.",
  ],
  [
    "Why test NH4+ before adding ammonium reagents?",
    "Later NH4Cl/NH4OH additions contaminate the sample with ammonium ions.",
  ],
  [
    "Why can carbonate interfere with cation group V?",
    "Carbonate can precipitate Ba2+, Sr2+, Ca2+ before the intended group step.",
  ],
];

const flameReference = [
  ["Na", "yellow"],
  ["K", "lilac"],
  ["Ca", "brick red"],
  ["Ba", "apple green"],
  ["Cu", "blue-green"],
  ["Sr", "crimson"],
];

const pBlockData = {
  "Group 15": [
    [
      "Oxyacids of nitrogen",
      "HNO2 is nitrous acid; HNO3 is nitric acid with N in +5 oxidation state and strong oxidizing behavior.",
    ],
    [
      "Oxyacids of phosphorus",
      "H3PO4 basicity 3; H3PO3 basicity 2 and reducing due to P-H bond; H4P2O7 is pyrophosphoric acid.",
    ],
    [
      "Allotropes of phosphorus",
      "White P4 is reactive and poisonous; red phosphorus is polymeric and safer; black phosphorus is layered and most stable.",
    ],
  ],
  "Group 16": [
    [
      "Allotropes of sulphur",
      "Rhombic sulphur is stable at room temperature; monoclinic above 369 K; plastic sulphur is chain-like.",
    ],
    [
      "Oxyacids of sulphur",
      "H2SO4, H2SO3, H2S2O3, and H2S2O7 (oleum) differ in S oxidation state and S-S/peroxo-like linkages.",
    ],
    [
      "SO3 and H2SO4 behavior",
      "SO3 is trigonal planar. Concentrated H2SO4 acts as dehydrating and oxidizing agent; dilute acid mainly acidifies.",
    ],
  ],
  "Group 17": [
    [
      "Interhalogens",
      "Types XX', XX'3, XX'5, XX'7 form when a larger halogen combines with smaller, more electronegative halogens.",
    ],
    [
      "Oxoacids of chlorine",
      "Acid strength increases as HOCl < HClO2 < HClO3 < HClO4 due to stronger -I effect and resonance stabilization.",
    ],
    [
      "Fluorine anomaly",
      "Fluorine has no positive oxidation state because it is the most electronegative element and lacks d orbitals.",
    ],
  ],
  "Group 18": [
    ["XeF2", "Linear, AX2E3 by VSEPR."],
    ["XeF4", "Square planar, AX4E2 with lone pairs opposite."],
    [
      "XeF6 and XeO3",
      "XeF6 is distorted octahedral due to one lone pair; XeO3 is pyramidal and explosive when dry.",
    ],
  ],
};

const pharmaMedicalReference = {
  "drug-functional-groups": {
    result:
      "High-yield drug motifs: acids, bases, amides, esters, alcohols, aromatics, and halogens.",
    columns: ["Group", "Pharma meaning", "Medical example"],
    rows: [
      [
        "Carboxylic acid",
        "Often acidic and ionized at blood pH; improves salt formation and water solubility.",
        "NSAIDs, amino acids, bile acids",
      ],
      [
        "Amine",
        "Often basic; changes membrane crossing, receptor binding, and salt formation.",
        "Antihistamines, local anesthetics",
      ],
      [
        "Amide",
        "Stable polar linkage; common in peptides and many drug scaffolds.",
        "Paracetamol, penicillins",
      ],
      [
        "Ester",
        "Can act as a prodrug or be hydrolyzed by esterases.",
        "Aspirin, ester local anesthetics",
      ],
      [
        "Aromatic ring",
        "Adds shape, pi interactions, and hydrophobic binding.",
        "Many analgesic and antimicrobial drugs",
      ],
      [
        "Halogen",
        "Can tune lipophilicity, metabolic stability, and binding.",
        "Fluorinated steroids and antibiotics",
      ],
    ],
  },
  "adme-ionization": {
    result:
      "ADME links structure to absorption, distribution, metabolism, and excretion.",
    columns: ["Concept", "Chemistry rule", "Pharma impact"],
    rows: [
      [
        "pH versus pKa",
        "Weak acids ionize when pH is above pKa; weak bases ionize when pH is below pKa.",
        "Charge changes solubility and membrane crossing.",
      ],
      [
        "Lipophilicity",
        "Nonpolar surfaces favor membranes; polar groups favor water.",
        "Too lipophilic can reduce solubility; too polar can reduce absorption.",
      ],
      [
        "Hydrogen bonding",
        "Donors and acceptors improve binding and water interaction.",
        "Excess hydrogen bonding may lower permeability.",
      ],
      [
        "Metabolism",
        "Oxidation, reduction, hydrolysis, and conjugation alter functional groups.",
        "Can activate prodrugs or clear active drugs.",
      ],
      [
        "Excretion",
        "Ionized and polar compounds are cleared more easily in urine or bile.",
        "pH can influence renal trapping for weak acids/bases.",
      ],
    ],
  },
  isotonicity: {
    result:
      "Isotonic preparations are designed to avoid strong water movement across cell membranes.",
    columns: ["Term", "Chemistry meaning", "Medical relevance"],
    rows: [
      [
        "Hypotonic",
        "Lower effective solute concentration than body fluid.",
        "Cells can swell as water enters.",
      ],
      [
        "Isotonic",
        "Similar osmotic pressure to body fluid.",
        "Preferred for many IV and ophthalmic solutions.",
      ],
      [
        "Hypertonic",
        "Higher effective solute concentration than body fluid.",
        "Cells can shrink as water leaves.",
      ],
      [
        "Osmotic pressure",
        "Pi = iMRT for dilute solutions.",
        "Connects concentration to membrane water flow.",
      ],
      [
        "Normal saline",
        "0.9 percent NaCl is close to physiological tonicity.",
        "Common fluid for clinical use.",
      ],
    ],
  },
  "clinical-buffers": {
    result:
      "Clinical buffer chemistry keeps body fluids near functional pH ranges.",
    columns: ["Buffer system", "Chemistry role", "Medical connection"],
    rows: [
      [
        "Bicarbonate",
        "H2CO3/HCO3- pair responds to CO2 and acid load.",
        "Major blood buffer linked to respiration.",
      ],
      [
        "Phosphate",
        "H2PO4-/HPO4^2- pair buffers near intracellular and renal pH.",
        "Important in cells and urine.",
      ],
      [
        "Proteins",
        "Ionizable amino acid side chains accept or donate protons.",
        "Hemoglobin contributes to blood buffering.",
      ],
      [
        "Acidosis",
        "Blood pH falls below normal range.",
        "Can reflect metabolic or respiratory imbalance.",
      ],
      [
        "Alkalosis",
        "Blood pH rises above normal range.",
        "Can reflect CO2 loss or metabolic disturbance.",
      ],
    ],
  },
  "pharma-analysis": {
    result:
      "Pharmaceutical QC proves identity, strength, purity, and performance.",
    columns: ["Method", "What it checks", "Typical use"],
    rows: [
      [
        "Titration assay",
        "Amount of acid, base, oxidant, reductant, or complexing ion.",
        "Aspirin, antacids, iodine, peroxide assays",
      ],
      [
        "Chromatography",
        "Separation and quantification of active ingredient and impurities.",
        "HPLC purity and content uniformity",
      ],
      [
        "Spectroscopy",
        "Identity and concentration from light absorption or emission.",
        "UV-visible assay, IR identity check",
      ],
      [
        "Dissolution testing",
        "How quickly a dosage form releases drug.",
        "Tablet and capsule performance",
      ],
      [
        "Limit tests",
        "Trace impurity control.",
        "Heavy metals, chloride, sulfate, residual impurities",
      ],
    ],
  },
  radiopharma: {
    result:
      "Radiopharmaceutical design balances half-life, emission, targeting, and safe clearance.",
    columns: ["Isotope", "Main use", "Chemistry reason"],
    rows: [
      [
        "Tc-99m",
        "SPECT imaging tracer.",
        "Gamma emission and short half-life suit diagnostics.",
      ],
      [
        "F-18",
        "PET imaging tracer.",
        "Small fluorine label fits biomolecules such as glucose analogs.",
      ],
      [
        "I-131",
        "Thyroid imaging and therapy.",
        "Iodide targets thyroid tissue; beta and gamma emissions are useful clinically.",
      ],
      [
        "Co-60",
        "Radiotherapy source.",
        "Strong gamma emission for external beam treatment.",
      ],
      [
        "Lu-177",
        "Targeted radionuclide therapy.",
        "Beta emission plus ligand targeting for selected tumors.",
      ],
    ],
  },
  "enzyme-kinetics": {
    result:
      "Enzyme rate rises with substrate, then approaches Vmax; inhibitors reshape the curve.",
    columns: ["Control", "Visual signal", "Lab connection"],
    rows: [
      [
        "Substrate",
        "More substrate fills more active sites until saturation.",
        "Michaelis-Menten kinetics",
      ],
      [
        "Competitive inhibitor",
        "Competes at active site; apparent Km increases.",
        "Drug-enzyme competition",
      ],
      [
        "Noncompetitive inhibitor",
        "Lowers active enzyme fraction; Vmax falls.",
        "Allosteric inhibition",
      ],
      [
        "Temperature",
        "Moderate heat speeds collisions; high heat denatures protein.",
        "Fever, sterilization, assays",
      ],
      [
        "pH",
        "Ionization changes active-site binding.",
        "Pepsin, trypsin, clinical enzymes",
      ],
    ],
  },
  "amino-acid-pi": {
    result:
      "Amino acids shift charge with pH: cationic below pI, zwitterionic near pI, anionic above pI.",
    columns: ["pH region", "Dominant form", "Visualization cue"],
    rows: [
      ["Low pH", "NH3+ and COOH; net positive.", "Migrates toward cathode"],
      [
        "Near pI",
        "NH3+ and COO-; net zero.",
        "Lowest solubility in electric field",
      ],
      ["High pH", "NH2 and COO-; net negative.", "Migrates toward anode"],
      [
        "Peptide bond",
        "COOH plus NH2 condense to amide linkage.",
        "Protein backbone formation",
      ],
      [
        "Side chain",
        "Acidic/basic/polar/nonpolar groups tune behavior.",
        "Protein folding and binding",
      ],
    ],
  },
  "protein-structure": {
    result:
      "Protein behavior depends on primary sequence, folding forces, and denaturation conditions.",
    columns: ["Level", "Visual structure", "Lab/medical link"],
    rows: [
      ["Primary", "Amino acid chain order.", "Mutation changes sequence"],
      [
        "Secondary",
        "Alpha helix and beta sheet hydrogen bonding.",
        "Keratin, silk, enzymes",
      ],
      [
        "Tertiary",
        "Hydrophobic packing, ionic links, disulfides.",
        "Enzyme active sites",
      ],
      ["Quaternary", "Multiple subunits assemble.", "Hemoglobin tetramer"],
      [
        "Denaturation",
        "Heat, pH, solvents disrupt folding.",
        "Fever, sterilization, protein tests",
      ],
    ],
  },
  "carbohydrate-lab": {
    result:
      "Carbohydrates cycle between open-chain and ring forms; reducing sugars give diagnostic color changes.",
    columns: ["Sugar idea", "Visual cue", "Test/lab link"],
    rows: [
      [
        "Glucose ring",
        "Six-membered ring with many OH groups.",
        "High water solubility",
      ],
      [
        "Fructose",
        "Ketose that can isomerize under test conditions.",
        "Positive reducing sugar tests",
      ],
      [
        "Sucrose",
        "Nonreducing disaccharide linkage.",
        "No free anomeric carbon",
      ],
      ["Starch", "Coiled glucose polymer.", "Blue-black iodine complex"],
      [
        "Cellulose",
        "Straight beta-glucose polymer.",
        "Fiber and plant cell walls",
      ],
    ],
  },
  "lipid-membrane": {
    result:
      "Lipids self-assemble: polar heads face water and nonpolar tails hide inside membranes or micelles.",
    columns: ["Structure", "Visual assembly", "Medical/pharma link"],
    rows: [
      [
        "Fatty acid",
        "Long nonpolar tail plus polar acid head.",
        "Energy storage and soaps",
      ],
      [
        "Triglyceride",
        "Three fatty acids esterified to glycerol.",
        "Fats, oils, digestion",
      ],
      [
        "Phospholipid",
        "Two tails plus phosphate head.",
        "Cell membrane bilayer",
      ],
      [
        "Micelle",
        "Tails inward, heads outward.",
        "Soap, bile salts, drug solubilization",
      ],
      [
        "Emulsion",
        "Dispersed oil droplets stabilized by surfactant.",
        "Creams, suspensions, lipid formulations",
      ],
    ],
  },
  "nucleic-acid-lab": {
    result:
      "DNA/RNA recognition uses base pairing, hydrogen bonding, sugar chemistry, and phosphate charge.",
    columns: ["Unit", "Visual cue", "Bio/medical link"],
    rows: [
      ["Nucleotide", "Base plus sugar plus phosphate.", "DNA/RNA monomer"],
      ["A-T/U pair", "Two hydrogen bonds.", "Genetic coding"],
      ["G-C pair", "Three hydrogen bonds.", "Higher thermal stability"],
      [
        "Backbone",
        "Charged phosphate-sugar chain.",
        "Electrophoresis migration",
      ],
      ["RNA difference", "Ribose OH and uracil.", "mRNA, tRNA, ribozymes"],
    ],
  },
  "vitamin-coenzyme-map": {
    result:
      "Vitamins and minerals often work as coenzymes, redox carriers, cofactors, or structural ions.",
    columns: ["Nutrient", "Chemical role", "Medical connection"],
    rows: [
      [
        "B vitamins",
        "Coenzyme fragments for metabolism.",
        "Energy pathways, anemia links",
      ],
      [
        "Vitamin C",
        "Redox antioxidant and collagen support.",
        "Scurvy, wound healing",
      ],
      ["Vitamin D/Ca", "Calcium-phosphate regulation.", "Bone chemistry"],
      ["Iron", "Redox metal in heme.", "Oxygen transport, anemia"],
      [
        "Zinc/Mg",
        "Enzyme cofactors and Lewis acid centers.",
        "Immunity, ATP enzymes",
      ],
    ],
  },
  "metabolism-atp": {
    result:
      "Metabolism moves carbon, nitrogen, electrons, and phosphate energy through linked pathways.",
    columns: ["Pathway board", "Chemical transformation", "Medical link"],
    rows: [
      [
        "Glycolysis",
        "Glucose fragments into pyruvate with ATP/NADH production.",
        "Blood glucose and energy",
      ],
      [
        "Citric acid cycle",
        "Acetyl carbon oxidized to CO2.",
        "Central metabolism",
      ],
      [
        "ATP hydrolysis",
        "Phosphate transfer powers unfavorable steps.",
        "Bioenergetics",
      ],
      [
        "Urea cycle",
        "Excess nitrogen converted to urea.",
        "Liver and kidney chemistry",
      ],
      [
        "Oxidative phosphorylation",
        "Proton gradient drives ATP synthase.",
        "Mitochondrial function",
      ],
    ],
  },
  "drug-class-studio": {
    result:
      "Drug classes can be compared by target, functional group pattern, and chemical handling.",
    columns: ["Class", "Core chemistry", "Visual lab anchor"],
    rows: [
      [
        "Analgesics",
        "Aromatics, amides, acids, phenols.",
        "Pain/fever medicine motifs",
      ],
      [
        "Antacids",
        "Weak bases neutralize gastric acid.",
        "Neutralization and buffers",
      ],
      [
        "Antimicrobials",
        "Heterocycles, beta-lactams, sulfonamides, quinolones.",
        "Selective toxicity",
      ],
      [
        "Antihistamines",
        "Basic amines plus aromatic groups.",
        "Receptor-binding shape",
      ],
      [
        "Local anesthetics",
        "Aromatic-lipophilic group, linker, amine.",
        "Ionization controls onset",
      ],
    ],
  },
  "drug-metabolism-lab": {
    result:
      "Drug metabolism changes polarity through phase I functionalization and phase II conjugation.",
    columns: ["Metabolic step", "Chemical change", "Pharma consequence"],
    rows: [
      [
        "Oxidation",
        "Adds or exposes OH, C=O, N-oxide, or epoxide.",
        "Often CYP-mediated",
      ],
      [
        "Reduction",
        "Reduces nitro, azo, carbonyl, or disulfide groups.",
        "Low oxygen tissues, gut flora",
      ],
      [
        "Hydrolysis",
        "Breaks esters, amides, lactams.",
        "Prodrug activation or clearance",
      ],
      [
        "Glucuronidation",
        "Adds glucuronic acid.",
        "Increases water solubility",
      ],
      [
        "Sulfation/acetylation",
        "Conjugates polar or amine groups.",
        "Clearance and genetic variation",
      ],
    ],
  },
  "dosage-form-lab": {
    result:
      "Dosage forms are chemical delivery systems: solution, suspension, emulsion, tablet, capsule, or syrup.",
    columns: ["Form", "Visual behavior", "Chemistry control"],
    rows: [
      ["Solution", "Clear single phase.", "Solubility, pH, preservative"],
      [
        "Suspension",
        "Solid particles dispersed in liquid.",
        "Wetting, viscosity, sedimentation",
      ],
      [
        "Emulsion",
        "Oil and water droplets stabilized.",
        "Surfactant and droplet size",
      ],
      [
        "Tablet",
        "Compressed powder matrix.",
        "Binder, disintegrant, dissolution",
      ],
      [
        "Syrup",
        "Concentrated sugar solution.",
        "Osmotic preservation and taste masking",
      ],
    ],
  },
  "antacid-analgesic-antimicrobial": {
    result:
      "Common medicine groups connect directly to acid-base, organic, and microbial chemistry.",
    columns: ["Medicine group", "Main chemistry", "Lab visualization"],
    rows: [
      [
        "Antacid",
        "Carbonates/hydroxides neutralize HCl.",
        "CO2 bubbles or pH rise",
      ],
      [
        "Aspirin-like analgesic",
        "Aromatic acid/ester chemistry.",
        "Hydrolysis and titration",
      ],
      [
        "Paracetamol-like analgesic",
        "Phenol plus amide motif.",
        "Functional group map",
      ],
      [
        "Sulfa drugs",
        "Sulfonamide mimicry.",
        "Competitive biochemical blocking",
      ],
      [
        "Disinfectants",
        "Oxidants or membrane disruptors.",
        "Protein/lipid damage",
      ],
    ],
  },
  "pharma-buffer-lab": {
    result:
      "Pharmaceutical buffers choose pH for stability, comfort, solubility, and compatibility.",
    columns: ["Buffer decision", "Chemistry control", "Formulation link"],
    rows: [
      [
        "Target pH",
        "Close to pKa for useful buffer capacity.",
        "Eye drops, injections, oral liquids",
      ],
      ["Capacity", "More conjugate pair resists pH change.", "Shelf stability"],
      [
        "Compatibility",
        "Avoid precipitation or degradation.",
        "Drug salt and excipients",
      ],
      [
        "Comfort",
        "Physiological pH reduces irritation.",
        "Ophthalmic and injectable products",
      ],
      [
        "Preservation",
        "pH affects microbial growth and preservative ionization.",
        "Multi-dose containers",
      ],
    ],
  },
  "electrolyte-panel": {
    result:
      "Clinical electrolyte panels visualize charged ions that control nerves, heart rhythm, water balance, and bone.",
    columns: ["Ion", "Chemical role", "Clinical signal"],
    rows: [
      ["Na+", "Major extracellular cation.", "Water balance and osmolarity"],
      ["K+", "Major intracellular cation.", "Nerve and heart excitability"],
      [
        "Ca2+",
        "Bone mineral, signaling, clotting.",
        "Tetany, bone, cardiac effects",
      ],
      ["Mg2+", "ATP enzyme cofactor.", "Neuromuscular and enzyme function"],
      [
        "Cl-/HCO3-",
        "Charge balance and acid-base control.",
        "Blood gas and metabolic balance",
      ],
    ],
  },
  "hemoglobin-oxygen": {
    result:
      "Hemoglobin binds oxygen cooperatively; pH, CO2, CO, and 2,3-BPG shift oxygen release.",
    columns: ["Factor", "Curve effect", "Medical chemistry link"],
    rows: [
      [
        "O2 pressure",
        "Higher pressure loads heme sites.",
        "Lungs versus tissues",
      ],
      [
        "Cooperativity",
        "One O2 increases affinity for the next.",
        "Sigmoid binding curve",
      ],
      ["Low pH/CO2", "Right shift releases O2 to tissues.", "Bohr effect"],
      [
        "Carbon monoxide",
        "Binds heme strongly and blocks O2 transport.",
        "CO poisoning",
      ],
      [
        "Iron state",
        "Fe2+ binds O2; Fe3+ methemoglobin cannot carry well.",
        "Oxidative stress",
      ],
    ],
  },
  "diagnostic-color-tests": {
    result:
      "Diagnostic reagent tests convert analyte chemistry into visible color, precipitate, or intensity.",
    columns: ["Analyte", "Visual test idea", "Chemistry signal"],
    rows: [
      [
        "Glucose",
        "Oxidase/peroxidase color or reducing test.",
        "Redox chemistry",
      ],
      ["Protein", "Biuret violet complex.", "Peptide bonds coordinate Cu2+"],
      [
        "Ketone bodies",
        "Nitroprusside purple complex.",
        "Diabetes/fasting urine test",
      ],
      ["Bilirubin", "Diazo color formation.", "Liver/bile chemistry"],
      [
        "Chloride",
        "AgCl precipitate/titration.",
        "Electrolyte and salt analysis",
      ],
    ],
  },
  "clinical-metabolites": {
    result:
      "Clinical metabolites are small molecules whose concentration reflects metabolism and organ function.",
    columns: ["Marker", "Chemical identity", "Clinical chemistry use"],
    rows: [
      ["Glucose", "Reducing carbohydrate fuel.", "Diabetes monitoring"],
      [
        "Urea",
        "Neutral nitrogen waste.",
        "Protein metabolism and kidney function",
      ],
      [
        "Creatinine",
        "Creatine breakdown product.",
        "Renal filtration estimate",
      ],
      ["Cholesterol", "Sterol lipid.", "Membranes, hormones, lipid panel"],
      ["Uric acid", "Purine oxidation product.", "Gout and kidney stones"],
    ],
  },
  "toxicology-chelation": {
    result:
      "Toxicology connects binding strength, redox chemistry, enzyme poisoning, and chelation.",
    columns: ["Toxin", "Chemical damage", "Treatment concept"],
    rows: [
      [
        "Lead",
        "Binds sulfhydryl groups and disrupts heme enzymes.",
        "Chelation with suitable ligands",
      ],
      [
        "Mercury",
        "Soft metal binds sulfur-rich proteins.",
        "Avoid exposure; chelation in selected cases",
      ],
      [
        "Cyanide",
        "Binds cytochrome oxidase iron.",
        "Antidote chemistry redirects or oxidizes target",
      ],
      [
        "Carbon monoxide",
        "Binds hemoglobin Fe2+ strongly.",
        "Oxygen therapy shifts binding equilibrium",
      ],
      [
        "Arsenic",
        "Disrupts enzyme thiols and phosphate chemistry.",
        "Chelation and exposure control",
      ],
    ],
  },
};

const LAB_EXPERIMENTS = [
  {
    id: "titration",
    title: "Titration Simulator",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Beginner",
    icon: Waves,
    topic: "pH",
    teaches: "How acid and base neutralize each other.",
    steps: [
      "Move the NaOH drops slider.",
      "Watch the color and pH change.",
      "Find the point where the solution becomes neutral.",
    ],
    tryThis: "Set drops near the middle and notice the fast pH jump.",
    result: "A sharp pH change marks the equivalence region.",
    safety: "Real titrations use goggles and careful handling.",
    realWorld: "Used to test medicine, water, and food acidity.",
  },
  {
    id: "electrolysis",
    title: "Electrolysis Cell",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Zap,
    topic: "Redox",
    teaches: "How electricity drives chemical changes.",
    steps: [
      "Choose an electrolyte.",
      "Identify cathode and anode products.",
      "Compare different solutions.",
    ],
    tryThis: "Switch from CuSO4 to NaCl(aq).",
    result: "Different ions produce different gases or metals.",
    safety: "Electrolysis can produce gases; use ventilation in real labs.",
    realWorld: "Used in electroplating and metal extraction.",
  },
  {
    id: "distillation",
    title: "Distillation Apparatus",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Beginner",
    icon: FlaskConical,
    topic: "Separation",
    teaches: "How boiling points separate liquids.",
    steps: [
      "Increase heat slowly.",
      "Watch vapor move to the condenser.",
      "Collect the condensed liquid.",
    ],
    tryThis: "Raise heat above 78 percent.",
    result: "More volatile liquid vaporizes first.",
    safety: "Never seal heated glassware.",
    realWorld: "Used for purifying solvents and water.",
  },
  {
    id: "chromatography",
    title: "Chromatography",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Beginner",
    icon: BarChart3,
    topic: "Separation",
    teaches: "How mixtures split into colored bands.",
    steps: [
      "Move the run time slider.",
      "Watch colors travel different distances.",
      "Compare the final band positions.",
    ],
    tryThis: "Run the slider to 100 percent.",
    result: "Substances separate because they move at different speeds.",
    safety: "Use safe solvents in classroom demos.",
    realWorld: "Used in forensics and quality testing.",
  },
  {
    id: "analytical-lab",
    title: "Full Analytical Chemistry Lab",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Advanced",
    icon: BarChart3,
    topic: "Analytical Chemistry",
    teaches:
      "Quantitative analysis uses precipitation, titration, calibration, and separation data to identify and measure samples.",
    steps: [
      "Choose gravimetry, volumetric analysis, calibration, or chromatography.",
      "Change sample and reagent values.",
      "Read the calculation, endpoint, and interpretation.",
    ],
    tryThis:
      "Switch from back titration to EDTA hardness, then compare calibration and chromatography results.",
    result:
      "A complete analysis connects sample preparation, stoichiometry, signal calibration, separation, and quality checks.",
    safety:
      "Analytical reagents may be corrosive, oxidizing, toxic, or solvent-based; validate methods before real lab use.",
    realWorld:
      "Used in water testing, pharma QC, ores, food, clinical labs, and environmental monitoring.",
  },
  {
    id: "spectroscopy",
    title: "Spectroscopy Viewer",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: RadioTower,
    topic: "Light",
    teaches: "Each element has a unique light fingerprint.",
    steps: [
      "Choose an element.",
      "Look at the bright emission lines.",
      "Compare line positions.",
    ],
    tryThis: "Compare hydrogen and sodium.",
    result: "Line positions identify elements.",
    safety: "Avoid looking directly into bright discharge lamps.",
    realWorld: "Used to study stars and unknown samples.",
  },
  {
    id: "ph-meter",
    title: "pH Meter",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Beginner",
    icon: Activity,
    topic: "Acids",
    teaches: "pH tells whether a solution is acidic, neutral, or basic.",
    steps: [
      "Choose a solution.",
      "Read the pH value.",
      "Use the bar to classify it.",
    ],
    tryThis: "Compare vinegar, water, and ammonia.",
    result: "Low pH is acidic; high pH is basic.",
    safety: "Do not taste unknown solutions.",
    realWorld: "Used in pools, soil, and drinking water tests.",
  },
  {
    id: "electrochemical-cell",
    title: "Electrochemical Cell",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Zap,
    topic: "Cells",
    teaches: "How metal pairs create voltage.",
    steps: [
      "Pick two metals.",
      "Read the voltage.",
      "Change one metal and compare.",
    ],
    tryThis: "Try Zn and Cu.",
    result: "A bigger potential difference gives more voltage.",
    safety: "Real cells can leak corrosive electrolytes.",
    realWorld: "The idea behind batteries.",
  },
  {
    id: "equilibrium",
    title: "Le Chatelier Equilibrium",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: GitCompare,
    topic: "Equilibrium",
    teaches: "Systems respond to stress by shifting direction.",
    steps: [
      "Change reactant level.",
      "Change temperature.",
      "Read the predicted shift.",
    ],
    tryThis: "Increase reactant level above 1.",
    result: "Adding reactant often shifts toward products.",
    safety: "Equilibrium demos may use irritating gases.",
    realWorld: "Important in industrial chemical production.",
  },
  {
    id: "osmosis",
    title: "Osmosis Demo",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Beginner",
    icon: Waves,
    topic: "Membranes",
    teaches: "Water moves toward higher solute concentration.",
    steps: [
      "Set left concentration.",
      "Set right concentration.",
      "Observe water flow direction.",
    ],
    tryThis: "Make the right side more concentrated.",
    result: "Water flows toward the side with more solute.",
    safety: "Use clean materials in biology demos.",
    realWorld: "Explains cells swelling or shrinking.",
  },
  {
    id: "flame-test",
    title: "Flame Test",
    tab: "Atoms",
    type: "Simulation",
    difficulty: "Beginner",
    icon: Sparkles,
    topic: "Emission",
    teaches: "Metal ions can color a flame.",
    steps: [
      "Choose a metal ion.",
      "Observe the flame color.",
      "Compare colors.",
    ],
    tryThis: "Compare Na and Cu.",
    result: "Excited electrons release colored light.",
    safety: "Real flame tests require teacher supervision.",
    realWorld: "Used for quick ion identification.",
  },
  {
    id: "molar-mass",
    title: "Molar Mass Calculator",
    tab: "Basics",
    type: "Calculator",
    difficulty: "Beginner",
    icon: Calculator,
    topic: "Formulas",
    teaches: "How formula mass is calculated from atoms.",
    steps: ["Enter a formula.", "Read atom counts.", "Read total molar mass."],
    tryThis: "Try H2O or Ca(OH)2.",
    result: "Molar mass is the sum of atomic masses.",
    realWorld: "Needed for measuring chemicals accurately.",
  },
  {
    id: "stoichiometry",
    title: "Stoichiometry Solver",
    tab: "Reactions",
    type: "Calculator",
    difficulty: "Intermediate",
    icon: Calculator,
    topic: "Moles",
    teaches: "Balanced equations connect reactant and product amounts.",
    steps: [
      "Enter an equation.",
      "Enter starting moles.",
      "Use coefficients to reason about amounts.",
    ],
    tryThis: "Try N2 + H2 -> NH3.",
    result: "Coefficients act like mole ratios.",
    realWorld: "Used to plan reactions and reduce waste.",
  },
  {
    id: "dilution",
    title: "Molarity / Dilution Calculator",
    tab: "Solutions",
    type: "Calculator",
    difficulty: "Beginner",
    icon: Calculator,
    topic: "Concentration",
    teaches: "How dilution changes volume and concentration.",
    steps: [
      "Enter C1, V1, and C2.",
      "Read the required V2.",
      "Compare concentrated vs dilute.",
    ],
    tryThis: "Make C2 smaller than C1.",
    result: "Diluting lowers concentration and increases volume.",
    safety: "Always add acid to water in real prep.",
    realWorld: "Used to prepare lab solutions.",
  },
  {
    id: "weak-acid-ph",
    title: "pH / pOH Calculator",
    tab: "Solutions",
    type: "Calculator",
    difficulty: "Intermediate",
    icon: Calculator,
    topic: "Acids",
    teaches: "How weak acid strength affects pH.",
    steps: [
      "Enter Ka.",
      "Read pH and pOH.",
      "Compare stronger and weaker acids.",
    ],
    tryThis: "Increase Ka.",
    result: "Larger Ka means stronger acid and lower pH.",
    realWorld: "Used for buffers and acid-base chemistry.",
  },
  {
    id: "gas-law",
    title: "Ideal Gas Law Calculator",
    tab: "Basics",
    type: "Calculator",
    difficulty: "Beginner",
    icon: Calculator,
    topic: "Gases",
    teaches: "Pressure, volume, temperature, and moles are linked.",
    steps: [
      "Enter P, V, and T.",
      "Read moles.",
      "Change temperature and compare.",
    ],
    tryThis: "Use 1 atm, 22.4 L, 273.15 K.",
    result: "Those values are about 1 mole of ideal gas.",
    realWorld: "Used in balloons, cylinders, and engines.",
  },
  {
    id: "empirical-formula",
    title: "Empirical Formula Finder",
    tab: "Basics",
    type: "Calculator",
    difficulty: "Intermediate",
    icon: Calculator,
    topic: "Composition",
    teaches: "Percent composition can reveal atom ratios.",
    steps: [
      "Enter element symbols.",
      "Enter percentages.",
      "Read the simplest formula.",
    ],
    tryThis: "Use C 40, H 6.7, O 53.3.",
    result: "The result is the simplest whole-number ratio.",
    realWorld: "Used in compound analysis.",
  },
  {
    id: "oxidation",
    title: "Oxidation State Finder",
    tab: "Reactions",
    type: "Calculator",
    difficulty: "Intermediate",
    icon: Calculator,
    topic: "Redox",
    teaches: "Atoms can be assigned oxidation numbers.",
    steps: [
      "Enter a formula.",
      "Read common oxidation guesses.",
      "Use them to identify redox changes.",
    ],
    tryThis: "Try H2SO4.",
    result: "O is usually -2 and H is usually +1.",
    realWorld: "Used for balancing redox equations.",
  },
  {
    id: "electron-config-tool",
    title: "Electron Configuration Builder",
    tab: "Atoms",
    type: "Calculator",
    difficulty: "Intermediate",
    icon: Atom,
    topic: "Electrons",
    teaches: "Electron configuration shows orbital filling.",
    steps: [
      "Enter atomic number.",
      "Read the configuration.",
      "Notice shell and orbital order.",
    ],
    tryThis: "Try atomic number 8.",
    result: "Electrons fill lower energy orbitals first.",
    realWorld: "Explains bonding and periodic trends.",
  },
  {
    id: "hess",
    title: "Reaction Enthalpy (Hess's Law)",
    tab: "Reactions",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Energy",
    teaches: "Reaction enthalpies can be added.",
    steps: [
      "Enter two enthalpy values.",
      "Add them to get total change.",
      "Decide if heat is released or absorbed.",
    ],
    tryThis: "Use -286 and 44.",
    result: "Negative total means exothermic.",
    realWorld: "Used in thermochemistry.",
  },
  {
    id: "colligative",
    title: "Colligative Properties Calculator",
    tab: "Solutions",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Waves,
    topic: "Solutions",
    teaches: "Solutes change boiling and freezing points.",
    steps: [
      "Set molality.",
      "Read boiling elevation.",
      "Read freezing depression.",
    ],
    tryThis: "Increase molality.",
    result: "More solute causes bigger temperature shifts.",
    realWorld: "Explains antifreeze and salted roads.",
  },
  {
    id: "adsorption",
    title: "Adsorption Isotherms Lab",
    tab: "Solutions",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Surface Chemistry",
    teaches: "Adsorption isotherms connect surface loading to pressure.",
    steps: [
      "Adjust Freundlich constants.",
      "Adjust Langmuir constants.",
      "Compare physisorption and chemisorption.",
    ],
    tryThis: "Increase b in Langmuir and watch saturation arrive earlier.",
    result:
      "Freundlich is empirical; Langmuir approaches monolayer saturation.",
    realWorld: "Used in catalysis, charcoal adsorption, and colloid chemistry.",
  },
  {
    id: "surface-chemistry-deep",
    title: "Surface Chemistry Deep Module",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Surface Chemistry",
    teaches:
      "Adsorption, catalysis, colloids, coagulation, emulsions, micelles, cleansing action, and Hardy-Schulze rule in one linked module.",
    steps: [
      "Choose a surface chemistry mode.",
      "Change colloid, catalyst, electrolyte, emulsifier, or surfactant values.",
      "Interpret the visible surface process and exam rule.",
    ],
    tryThis:
      "Open colloids, switch gold sol to ferric hydroxide sol, then increase counter-ion charge.",
    result:
      "Surface phenomena depend on surface area, adsorption, charge stabilization, and amphiphile aggregation.",
    safety:
      "Real colloids, catalysts, dyes, and surfactants may be irritants or powders; avoid inhalation and follow lab disposal rules.",
    realWorld:
      "Used in catalysis, medicine, water treatment, detergents, paints, foods, and pharmaceuticals.",
  },
  {
    id: "orbital-shape",
    title: "Orbital Shape Viewer",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Orbit,
    topic: "Orbitals",
    teaches: "Orbitals have different shapes.",
    steps: ["Choose s, p, d, or f.", "Observe lobe count.", "Read the note."],
    tryThis: "Compare s and p.",
    result: "Orbital shape affects bonding direction.",
    realWorld: "Core idea in molecular structure.",
  },
  {
    id: "crystal-structure",
    title: "Crystal Structure Viewer",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Boxes,
    topic: "Solids",
    teaches: "Solids arrange particles in repeating patterns.",
    steps: [
      "Pick a structure.",
      "Change lattice size.",
      "Observe repeating units.",
    ],
    tryThis: "Increase lattice size.",
    result: "Crystal properties depend on arrangement.",
    realWorld: "Important in salts, metals, and minerals.",
  },
  {
    id: "unit-cell",
    title: "Unit Cell Calculator",
    tab: "Basics",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Boxes,
    topic: "Solid State",
    teaches:
      "Unit cell type controls Z, packing efficiency, coordination number, and density.",
    steps: [
      "Choose a unit cell.",
      "Enter edge length and molar mass.",
      "Calculate Z or density.",
    ],
    tryThis: "Compare BCC and FCC with the same edge length.",
    result: "Density follows rho = ZM / (Na x a^3).",
    realWorld: "Used to identify crystalline solids from X-ray density data.",
  },
  {
    id: "crystal-defects",
    title: "Crystal Defects Visualizer",
    tab: "Basics",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: ShieldAlert,
    topic: "Solid State",
    teaches:
      "Crystal defects change density, conductivity, and ionic movement.",
    steps: [
      "Toggle ionic or metal crystal.",
      "Compare perfect, Schottky, and Frenkel grids.",
      "Review n-type and p-type doping.",
    ],
    tryThis: "Switch from ionic to metal lattice and compare missing sites.",
    result:
      "Schottky lowers density; Frenkel usually keeps density nearly unchanged.",
    realWorld: "Explains semiconductors, AgCl defects, and NaCl vacancies.",
  },
  {
    id: "named-reactions",
    title: "Named Reactions Reference",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Advanced",
    icon: BookOpen,
    topic: "Organic",
    teaches:
      "Named reactions connect reagents, conditions, and mechanism patterns.",
    steps: [
      "Search a reaction.",
      "Filter by category or exam level.",
      "Read reactants, conditions, and mechanism type.",
    ],
    tryThis: "Filter JEE Advanced and Organic together.",
    result: "High-yield reactions become easier to compare before practice.",
    realWorld: "Useful for synthesis planning and board/JEE revision.",
  },
  {
    id: "organic-reaction-bank",
    title: "Organic Reaction Bank Depth",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Advanced",
    icon: BookOpen,
    topic: "Organic",
    teaches:
      "Reagent choice, stereochemical outcome, rearrangement risk, pericyclic rules, protecting groups, and multi-step synthesis strategy.",
    steps: [
      "Pick a bank section.",
      "Compare reagents or reaction logic.",
      "Run a synthesis drill and check why each step is chosen.",
    ],
    tryThis:
      "Use transformations for alkene to alcohol, then compare hydroboration in the stereo tab.",
    result:
      "Organic synthesis becomes predictable when transformation, mechanism, stereochemistry, and compatibility are tracked together.",
    safety:
      "Many organic reagents are corrosive, flammable, toxic, or moisture-sensitive; this is a learning model only.",
    realWorld:
      "Used in exam synthesis, medicinal chemistry, polymer work, and route planning.",
  },
  {
    id: "functional-tests",
    title: "Functional Group Test Reference",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Advanced",
    icon: BadgeCheck,
    topic: "Organic Tests",
    teaches:
      "Qualitative tests identify functional groups from visible observations.",
    steps: [
      "Pick a test.",
      "Read reagents and observations.",
      "Try the reverse quiz.",
    ],
    tryThis: "Select iodoform, then answer the acetone quiz.",
    result:
      "A positive result links compound class to a visible color or precipitate.",
    safety: "Many qualitative reagents are corrosive or toxic in real labs.",
    realWorld: "Used in practical organic analysis.",
  },
  {
    id: "isomerism",
    title: "Isomerism Explorer",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: GitCompare,
    topic: "Isomerism",
    teaches:
      "Isomers share formula but differ in connectivity, geometry, or coordination arrangement.",
    steps: [
      "Enter a formula.",
      "Review structural isomers.",
      "Compare stereochemical and coordination examples.",
    ],
    tryThis: "Try C4H10, C2H6O, C3H6O, or C4H8.",
    result:
      "Structural, stereo, and coordination isomerism use different comparison rules.",
    realWorld:
      "Explains drug activity, organic products, and coordination chemistry questions.",
  },
  {
    id: "reactivity-series",
    title: "Reactivity Series & Displacement Simulator",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Zap,
    topic: "Reactivity",
    teaches:
      "A more reactive metal displaces a less reactive metal from its salt solution.",
    steps: [
      "Pick a metal and salt solution.",
      "Check if displacement happens.",
      "Compare water and acid reactions.",
    ],
    tryThis: "Try Cu with ZnSO4 and then Zn with CuSO4.",
    result: "Metals above another metal in the series can displace it.",
    safety: "Reactive metals and acids require teacher supervision.",
    realWorld: "Explains extraction, corrosion, and displacement reactions.",
  },
  {
    id: "quantum-numbers",
    title: "Quantum Numbers Explorer",
    tab: "Atoms",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Atom,
    topic: "Quantum",
    teaches:
      "Quantum numbers describe electron shells, subshells, orbitals, and spin.",
    steps: [
      "Set n, l, ml, and ms.",
      "Check validity.",
      "Use wavelength, uncertainty, and photoelectric calculators.",
    ],
    tryThis: "Set n=3 and l=2 to see a 3d orbital.",
    result: "Only combinations obeying l < n and -l <= ml <= l are allowed.",
    realWorld: "Foundation for atomic structure and spectra.",
  },
  {
    id: "gibbs",
    title: "Gibbs Free Energy & Thermodynamic Spontaneity",
    tab: "Reactions",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Thermodynamics",
    teaches:
      "Delta G combines enthalpy, entropy, and temperature to predict spontaneity.",
    steps: [
      "Enter Delta H and Delta S.",
      "Change temperature.",
      "Read Delta G and K.",
    ],
    tryThis: "Use positive Delta H and positive Delta S, then raise T.",
    result: "A reaction is spontaneous when Delta G is negative.",
    realWorld: "Used to predict reaction feasibility and equilibrium.",
  },
  {
    id: "environmental-chem",
    title: "Environmental Chemistry Deep Module",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Waves,
    topic: "Environment",
    teaches:
      "Ozone depletion, photochemical smog, water hardness, BOD/COD, eutrophication, and pollutant treatment.",
    steps: [
      "Choose an environmental chemistry section.",
      "Adjust water-quality or treatment values.",
      "Connect reaction pathways to environmental impact and control.",
    ],
    tryThis:
      "Calculate BOD/COD, then switch to eutrophication and raise phosphate.",
    result:
      "Environmental chemistry connects reaction mechanisms, analytical water-quality values, and practical pollution control.",
    realWorld:
      "Useful for Class 11 environmental chemistry, NEET revision, water testing, wastewater treatment, and air-pollution control.",
  },
  {
    id: "drug-functional-groups",
    title: "Drug Functional Groups Map",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Intermediate",
    icon: BadgeCheck,
    topic: "Medicinal Chemistry",
    teaches:
      "Functional groups control solubility, binding, stability, and metabolism in drug molecules.",
    steps: [
      "Compare acids, bases, amides, esters, and aromatics.",
      "Connect each group to pKa or hydrogen bonding.",
      "Predict how the group changes absorption or metabolism.",
    ],
    tryThis: "Search amine, carboxylic acid, ester, or amide.",
    result: "Drug-like molecules balance polarity, shape, and ionization.",
    realWorld: "Used in medicinal chemistry, pharmacy, and pharmacology.",
  },
  {
    id: "adme-ionization",
    title: "ADME, pKa and Ionization Guide",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Pharmacokinetics",
    teaches:
      "Absorption, distribution, metabolism, and excretion depend strongly on charge, polarity, and pH.",
    steps: [
      "Identify acidic or basic groups.",
      "Compare pH with pKa.",
      "Estimate whether the molecule is mostly ionized.",
    ],
    tryThis: "Compare a weak acid at stomach pH and blood pH.",
    result:
      "Ionized forms are usually more water soluble; neutral forms cross membranes more easily.",
    realWorld: "Used to reason about drug absorption and dosing.",
  },
  {
    id: "isotonicity",
    title: "Isotonicity and Osmotic Pressure",
    tab: "Solutions",
    type: "Calculator",
    difficulty: "Advanced",
    icon: Calculator,
    topic: "Pharma Solutions",
    teaches:
      "Osmotic pressure explains why injections and eye drops must match body-fluid tonicity.",
    steps: [
      "Review molarity and van Hoff factor.",
      "Compare hypotonic, isotonic, and hypertonic solutions.",
      "Link osmotic pressure to cell swelling or shrinking.",
    ],
    tryThis: "Compare normal saline with pure water.",
    result:
      "Body-compatible solutions are designed near physiological osmolarity.",
    realWorld: "Used in IV fluids, ophthalmic preparations, and medical labs.",
  },
  {
    id: "clinical-buffers",
    title: "Blood Buffers and Clinical pH",
    tab: "Solutions",
    type: "Reference",
    difficulty: "Intermediate",
    icon: ShieldAlert,
    topic: "Clinical Chemistry",
    teaches:
      "Bicarbonate, phosphate, and protein buffers help keep blood pH in a narrow range.",
    steps: [
      "Review buffer pair and pKa.",
      "Connect acid/base addition to pH resistance.",
      "Relate pH change to acidosis or alkalosis.",
    ],
    tryThis: "Compare bicarbonate buffer with pure water.",
    result:
      "Clinical pH is controlled by chemistry plus breathing and kidney regulation.",
    realWorld: "Used in blood chemistry, physiology, and medical diagnostics.",
  },
  {
    id: "pharma-analysis",
    title: "Pharmaceutical Assay and QC Tests",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Advanced",
    icon: FlaskConical,
    topic: "Pharma Analysis",
    teaches:
      "Medicine quality checks use titration, chromatography, spectroscopy, dissolution, and impurity testing.",
    steps: [
      "Match the assay type to the sample.",
      "Identify what property is measured.",
      "Choose the chemistry tool that confirms quality.",
    ],
    tryThis:
      "Map aspirin assay to acid-base titration and HPLC impurity checks.",
    result:
      "Pharmaceutical QC combines quantitative and instrumental analysis.",
    safety:
      "Real assays follow pharmacopoeial methods and validated procedures.",
    realWorld: "Used in pharmacy labs, manufacturing, and regulatory testing.",
  },
  {
    id: "radiopharma",
    title: "Radiopharmaceutical Isotopes",
    tab: "Atoms",
    type: "Reference",
    difficulty: "Intermediate",
    icon: RadioTower,
    topic: "Nuclear Medicine",
    teaches:
      "Medical tracers use isotope half-life, decay type, and tissue targeting chemistry.",
    steps: [
      "Compare half-life and decay emission.",
      "Connect isotope choice to imaging or therapy.",
      "Review shielding and dose safety.",
    ],
    tryThis: "Compare Tc-99m, I-131, F-18, and Co-60.",
    result:
      "Useful medical isotopes balance detectable radiation with safe biological clearance.",
    safety: "Radioisotopes require trained handling and strict dose controls.",
    realWorld: "Used in PET, SPECT, thyroid therapy, and radiotherapy.",
  },
  {
    id: "enzyme-kinetics",
    title: "Enzyme Kinetics Visual Lab",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Biochemistry",
    teaches:
      "Substrate level, inhibitors, temperature, and pH change enzyme rate curves.",
    steps: [
      "Move through substrate and inhibitor stages.",
      "Compare curve shape.",
      "Connect Km and Vmax to assay behavior.",
    ],
    tryThis: "Compare competitive and noncompetitive inhibition.",
    result:
      "Enzyme graphs show active-site saturation and inhibition patterns.",
    realWorld: "Used in diagnostics, drug discovery, and enzyme assays.",
  },
  {
    id: "amino-acid-pi",
    title: "Amino Acid pI and Zwitterion Lab",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: GitCompare,
    topic: "Biochemistry",
    teaches: "Amino acids change net charge with pH and form peptide bonds.",
    steps: [
      "Scan low pH, pI, and high pH.",
      "Watch charge symbols shift.",
      "Connect charge to electrophoresis.",
    ],
    tryThis: "Place the stage near pI and inspect net charge.",
    result:
      "Amino acid ionization controls solubility, migration, and peptide formation.",
    realWorld: "Used in protein purification and formulation.",
  },
  {
    id: "protein-structure",
    title: "Protein Folding and Denaturation Studio",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Boxes,
    topic: "Biochemistry",
    teaches:
      "Protein levels of structure build from sequence to folded function.",
    steps: [
      "Move from primary to quaternary structure.",
      "Inspect denaturation stage.",
      "Connect folding forces to function.",
    ],
    tryThis: "Move to denaturation and compare shape loss.",
    result: "Protein function depends on folded 3D chemistry.",
    realWorld: "Used in enzyme function, fever effects, and lab tests.",
  },
  {
    id: "carbohydrate-lab",
    title: "Carbohydrate Ring and Reducing Sugar Lab",
    tab: "Molecules",
    type: "Practice",
    difficulty: "Intermediate",
    icon: BadgeCheck,
    topic: "Biochemistry",
    teaches:
      "Sugar ring/open-chain chemistry explains reducing tests and polysaccharides.",
    steps: [
      "Compare glucose, fructose, sucrose, starch, and cellulose.",
      "Watch ring and polymer cues.",
      "Connect structures to tests.",
    ],
    tryThis: "Compare sucrose with glucose.",
    result:
      "Free anomeric carbon and polymer shape control carbohydrate tests.",
    realWorld: "Used in nutrition, diagnostics, and pharmacy excipients.",
  },
  {
    id: "lipid-membrane",
    title: "Lipid Membrane and Micelle Visualizer",
    tab: "Molecules",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Waves,
    topic: "Biochemistry",
    teaches:
      "Lipids arrange into bilayers, micelles, emulsions, and membranes.",
    steps: [
      "Compare lipid assemblies.",
      "Watch hydrophilic heads and hydrophobic tails.",
      "Connect to solubilization.",
    ],
    tryThis: "Move from phospholipid to micelle.",
    result: "Amphiphiles self-assemble to minimize tail-water contact.",
    realWorld: "Used in cells, bile salts, creams, and drug delivery.",
  },
  {
    id: "nucleic-acid-lab",
    title: "DNA/RNA Base Pairing Visualizer",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: GitCompare,
    topic: "Biochemistry",
    teaches:
      "Base pairing, phosphate charge, and sugar differences organize DNA and RNA.",
    steps: [
      "Compare A-T/U and G-C pairing.",
      "Watch hydrogen-bond counts.",
      "Connect backbone charge to migration.",
    ],
    tryThis: "Compare G-C with A-T.",
    result:
      "Hydrogen bonding and phosphate chemistry make genetic structure readable.",
    realWorld: "Used in genetics, PCR, sequencing, and diagnostics.",
  },
  {
    id: "vitamin-coenzyme-map",
    title: "Vitamins, Coenzymes and Minerals Map",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Intermediate",
    icon: BookOpen,
    topic: "Biochemistry",
    teaches:
      "Micronutrients act as coenzymes, redox carriers, cofactors, and structural ions.",
    steps: [
      "Compare nutrient roles.",
      "Map nutrient to chemical job.",
      "Connect deficiency to chemistry.",
    ],
    tryThis: "Compare iron, vitamin C, and B vitamins.",
    result: "Small cofactors make large biological pathways work.",
    realWorld: "Used in nutrition, clinical chemistry, and pharmacology.",
  },
  {
    id: "metabolism-atp",
    title: "Metabolism, ATP and Urea Cycle Board",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Metabolism",
    teaches:
      "Metabolic boards track carbon, nitrogen, electrons, and phosphate energy.",
    steps: [
      "Move through glycolysis, ATP, and urea cycle stages.",
      "Watch pathway flow.",
      "Connect outputs to clinical markers.",
    ],
    tryThis: "Move to urea cycle and read nitrogen flow.",
    result: "Metabolism is chemical accounting across linked pathways.",
    realWorld: "Used in physiology, liver/kidney chemistry, and bioenergetics.",
  },
  {
    id: "drug-class-studio",
    title: "Drug Class Chemistry Studio",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Intermediate",
    icon: BadgeCheck,
    topic: "Medicinal Chemistry",
    teaches:
      "Drug classes share recognizable functional group and target patterns.",
    steps: [
      "Compare analgesics, antacids, antimicrobials, antihistamines, and anesthetics.",
      "Read group motifs.",
      "Connect chemistry to use.",
    ],
    tryThis: "Compare local anesthetics with antihistamines.",
    result: "Drug class behavior follows structure, charge, and target fit.",
    realWorld: "Used in pharmacy, pharmacology, and medicinal chemistry.",
  },
  {
    id: "drug-metabolism-lab",
    title: "Drug Metabolism Reaction Lab",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: ChevronRight,
    topic: "Pharmacokinetics",
    teaches:
      "Drug metabolism changes polarity through functionalization and conjugation.",
    steps: [
      "Step through phase I and phase II transformations.",
      "Watch polarity rise.",
      "Connect chemistry to clearance.",
    ],
    tryThis: "Compare oxidation with glucuronidation.",
    result: "Metabolism usually makes molecules easier to eliminate.",
    realWorld: "Used in prodrugs, interactions, and dose design.",
  },
  {
    id: "dosage-form-lab",
    title: "Dosage Form Chemistry Lab",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: FlaskConical,
    topic: "Pharma Solutions",
    teaches: "Dosage forms are controlled chemical delivery systems.",
    steps: [
      "Compare solution, suspension, emulsion, tablet, and syrup.",
      "Watch phase behavior.",
      "Connect formulation choices to release.",
    ],
    tryThis: "Compare suspension with solution.",
    result:
      "Solubility, particle size, viscosity, and surfactants control delivery.",
    realWorld: "Used in compounding and pharmaceutical manufacturing.",
  },
  {
    id: "antacid-analgesic-antimicrobial",
    title: "Antacid, Analgesic and Antimicrobial Lab",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Intermediate",
    icon: ShieldAlert,
    topic: "Medicines",
    teaches:
      "Common medicines connect to neutralization, organic motifs, and microbial targets.",
    steps: [
      "Compare medicine groups.",
      "Watch pH or motif changes.",
      "Connect chemistry to action.",
    ],
    tryThis: "Compare antacid neutralization with sulfa competition.",
    result: "Medicine action often starts with a simple chemical principle.",
    realWorld: "Used in NEET, pharmacy, and medical chemistry foundations.",
  },
  {
    id: "pharma-buffer-lab",
    title: "Pharmaceutical Buffer Formulation Lab",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Advanced",
    icon: ShieldAlert,
    topic: "Pharma Buffers",
    teaches:
      "Formulation pH controls stability, comfort, solubility, and compatibility.",
    steps: [
      "Choose target buffer stage.",
      "Compare capacity and comfort.",
      "Connect pH to dosage form.",
    ],
    tryThis: "Compare comfort with shelf stability.",
    result:
      "A good buffer balances chemical stability with body compatibility.",
    realWorld: "Used in injections, eye drops, oral liquids, and biologics.",
  },
  {
    id: "electrolyte-panel",
    title: "Clinical Electrolyte Panel Visualizer",
    tab: "Solutions",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: BarChart3,
    topic: "Clinical Chemistry",
    teaches:
      "Electrolytes control water balance, nerves, muscles, heart rhythm, and acid-base chemistry.",
    steps: [
      "Compare Na, K, Ca, Mg, Cl, and bicarbonate.",
      "Watch ion bars.",
      "Connect charge to body systems.",
    ],
    tryThis: "Compare sodium with potassium.",
    result: "Ion concentration and charge create body-fluid chemistry.",
    realWorld: "Used in hospital chemistry panels and physiology.",
  },
  {
    id: "hemoglobin-oxygen",
    title: "Hemoglobin and Oxygen Binding Lab",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Activity,
    topic: "Medical Chemistry",
    teaches:
      "Hemoglobin oxygen loading changes with pressure, pH, CO2, CO, and iron state.",
    steps: [
      "Move through curve factors.",
      "Watch oxygen occupancy.",
      "Connect curve shift to tissues.",
    ],
    tryThis: "Compare low pH with carbon monoxide.",
    result: "Binding equilibria decide oxygen delivery.",
    realWorld: "Used in respiratory physiology and CO poisoning.",
  },
  {
    id: "diagnostic-color-tests",
    title: "Diagnostic Reagent Color Lab",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Intermediate",
    icon: Sparkles,
    topic: "Diagnostics",
    teaches:
      "Diagnostic reagents turn analyte chemistry into visible color, precipitate, or intensity.",
    steps: [
      "Compare glucose, protein, ketones, bilirubin, and chloride.",
      "Watch color panels.",
      "Connect analyte to reagent chemistry.",
    ],
    tryThis: "Compare glucose redox with biuret protein complex.",
    result: "Color tests convert molecular chemistry into measurable signals.",
    realWorld: "Used in clinical labs, urine tests, and point-of-care testing.",
  },
  {
    id: "clinical-metabolites",
    title: "Glucose, Urea, Creatinine and Cholesterol Lab",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: BarChart3,
    topic: "Clinical Chemistry",
    teaches:
      "Small metabolites reflect fuel use, nitrogen waste, kidney function, lipid balance, and purine chemistry.",
    steps: [
      "Compare marker bars.",
      "Read the chemical identity.",
      "Connect marker to organ function.",
    ],
    tryThis: "Compare glucose with creatinine.",
    result:
      "Clinical markers are small molecules measured by analytical chemistry.",
    realWorld: "Used in blood tests and medical diagnostics.",
  },
  {
    id: "toxicology-chelation",
    title: "Toxicology and Chelation Visualizer",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Advanced",
    icon: ShieldAlert,
    topic: "Toxicology",
    teaches:
      "Toxins harm by binding metals/proteins, blocking enzymes, or shifting equilibria; chelation can trap some metals.",
    steps: [
      "Compare toxin binding targets.",
      "Watch ligand capture.",
      "Connect chemistry to treatment concept.",
    ],
    tryThis: "Compare lead chelation with CO poisoning.",
    result:
      "Toxicity often comes from strong binding at the wrong biochemical site.",
    safety:
      "Toxicology topics are conceptual; real exposure needs medical care.",
    realWorld:
      "Used in poisoning, occupational health, and coordination chemistry.",
  },
  {
    id: "cft",
    title: "Crystal Field Theory Visualizer",
    tab: "Advanced",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Orbit,
    topic: "Coordination",
    teaches:
      "Ligand geometry splits d orbitals, changing color, CFSE, and magnetism.",
    steps: [
      "Choose geometry.",
      "Set d-electron count.",
      "Compare strong and weak field filling.",
    ],
    tryThis: "Try d6 octahedral in strong and weak field modes.",
    result:
      "Splitting and pairing decide unpaired electrons and magnetic moment.",
    realWorld: "Explains transition metal complex color and spin state.",
  },
  {
    id: "metallurgy",
    title: "Metallurgy & Extraction Flowchart",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Advanced",
    icon: Boxes,
    topic: "Metallurgy",
    teaches:
      "Ore extraction follows concentration, reduction, and refining logic.",
    steps: [
      "Select a metal.",
      "Click each extraction step.",
      "Review equations and Ellingham idea.",
    ],
    tryThis: "Compare Al electrolysis with Fe blast furnace reduction.",
    result: "Reduction route depends on metal reactivity and oxide stability.",
    realWorld: "Core industrial chemistry for metals.",
  },
  {
    id: "salt-analysis",
    title: "Full Qualitative Salt Analysis Simulator",
    tab: "Advanced",
    type: "Practice",
    difficulty: "Advanced",
    icon: BadgeCheck,
    topic: "Salt Analysis",
    teaches:
      "Systematic reagent order separates cation groups and confirms anions while avoiding masking and interference.",
    steps: [
      "Start with preliminary clues.",
      "Confirm the anion with the correct reagent.",
      "Separate cation groups in order.",
      "Run confirmatory tests and answer viva prompts.",
    ],
    tryThis:
      "Choose CuSO4, then move through anion, cation, confirm, and viva stages.",
    result:
      "A complete unknown workflow identifies cation and anion by observation, group separation, confirmation, and interference checks.",
    safety:
      "Qualitative analysis reagents can be toxic, acidic, sulphide-releasing, or ammonia-producing; use ventilation and teacher supervision.",
    realWorld:
      "Used in practical exams, inorganic analysis, water testing, and analytical chemistry training.",
  },
  {
    id: "pblock-advanced",
    title: "p-Block Groups 15-18 Reference",
    tab: "Advanced",
    type: "Reference",
    difficulty: "Advanced",
    icon: BookOpen,
    topic: "p-Block",
    teaches:
      "Groups 15 to 18 show key oxyacids, allotropes, interhalogens, and xenon structures.",
    steps: [
      "Open a group tab.",
      "Review structures and trends.",
      "Connect VSEPR to noble gas compounds.",
    ],
    tryThis: "Compare chlorine oxoacid strength across oxidation states.",
    result:
      "p-block trends often depend on oxidation state, bonding, and size effects.",
    realWorld: "High-yield JEE Advanced inorganic reference.",
  },
  {
    id: "hybridization",
    title: "Hybridization Animator",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Orbit,
    topic: "Bonding",
    teaches: "Hybrid orbitals explain common shapes.",
    steps: [
      "Choose a hybridization.",
      "Observe orbital count.",
      "Connect it to geometry.",
    ],
    tryThis: "Compare sp2 and sp3.",
    result: "Hybridization predicts bond directions.",
    realWorld: "Used in organic chemistry.",
  },
  {
    id: "vsepr",
    title: "VSEPR Shape Builder",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Boxes,
    topic: "Shapes",
    teaches: "Electron domains determine molecular shape.",
    steps: [
      "Set bonded atoms.",
      "Set lone pairs.",
      "Read the shape and angle.",
    ],
    tryThis: "Use 2 bonds and 2 lone pairs.",
    result: "Lone pairs bend molecular shapes.",
    realWorld: "Explains water shape and polarity.",
  },
  {
    id: "bond-polarity",
    title: "Bond Polarity Visualizer",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Beginner",
    icon: GitCompare,
    topic: "Bonds",
    teaches: "Electronegativity difference affects bond type.",
    steps: [
      "Choose two elements.",
      "Read bond prediction.",
      "Compare similar and different atoms.",
    ],
    tryThis: "Compare H-Cl and Na-Cl.",
    result: "Large difference tends toward ionic character.",
    realWorld: "Helps predict solubility and reactivity.",
  },
  {
    id: "mechanism",
    title: "Reaction Mechanism Player",
    tab: "Reactions",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: ChevronRight,
    topic: "Organic",
    teaches: "Reactions happen in steps.",
    steps: ["Choose a mechanism.", "Move through steps.", "Read each event."],
    tryThis: "Compare SN1 and SN2.",
    result: "Mechanism controls product and rate.",
    realWorld: "Used in synthesis planning.",
  },
  {
    id: "imf",
    title: "Intermolecular Forces Demo",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Waves,
    topic: "Forces",
    teaches: "Attractions between molecules affect properties.",
    steps: [
      "Choose a force type.",
      "Observe relative strength.",
      "Connect to boiling point.",
    ],
    tryThis: "Select hydrogen bonding.",
    result: "Stronger forces usually mean higher boiling points.",
    realWorld: "Explains water behavior.",
  },
  {
    id: "nuclear-decay",
    title: "Nuclear Decay Simulator",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: RadioTower,
    topic: "Nuclear",
    teaches: "Radioactive nuclei change over time.",
    steps: [
      "Choose decay mode.",
      "Adjust half-lives.",
      "Watch remaining parent material.",
    ],
    tryThis: "Move to 4 half-lives.",
    result: "Each half-life halves the remaining sample.",
    safety: "Real radioactive materials need strict controls.",
    realWorld: "Used in dating and medicine.",
  },
  {
    id: "nuclear-chemistry",
    title: "Nuclear Chemistry Lab",
    tab: "Atoms",
    type: "Simulation",
    difficulty: "Advanced",
    icon: RadioTower,
    topic: "Nuclear Chemistry",
    teaches:
      "Decay series, nuclear equations, binding energy, mass defect, fission/fusion energetics, shielding, and radiation dose.",
    steps: [
      "Choose a nuclear chemistry mode.",
      "Balance mass number and atomic number.",
      "Compare energy release and shielding effect.",
    ],
    tryThis:
      "Build the U-238 decay fragment, then compare lead shielding for beta and gamma radiation.",
    result:
      "Nuclear chemistry conserves nucleon number and charge while mass defect explains large energy changes.",
    safety:
      "Radiation work requires trained supervision, time-distance-shielding controls, monitoring, and legal compliance.",
    realWorld:
      "Used in dating, nuclear power, radiotherapy, PET/SPECT imaging, sterilization, and materials testing.",
  },
  {
    id: "phase-diagram",
    title: "Phase Diagram Explorer",
    tab: "Basics",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: BarChart3,
    topic: "States",
    teaches: "Temperature and pressure determine phase.",
    steps: ["Change temperature.", "Change pressure.", "Read the phase."],
    tryThis: "Raise pressure and temperature.",
    result: "Matter can become solid, liquid, gas, or supercritical.",
    realWorld: "Used in weather and industrial processes.",
  },
  {
    id: "mo-diagram",
    title: "Molecular Orbital Diagram",
    tab: "Molecules",
    type: "Visualizer",
    difficulty: "Advanced",
    icon: Orbit,
    topic: "Orbitals",
    teaches: "Molecular orbitals explain bond order and magnetism.",
    steps: [
      "Choose a molecule.",
      "Read bond order.",
      "Check magnetic behavior.",
    ],
    tryThis: "Choose O2.",
    result: "O2 is paramagnetic in MO theory.",
    realWorld: "Explains observations Lewis structures miss.",
  },
  {
    id: "rate-lab",
    title: "Reaction Rate Lab",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Activity,
    topic: "Kinetics",
    teaches: "Temperature and concentration affect reaction speed.",
    steps: [
      "Change temperature.",
      "Change concentration.",
      "Watch curve steepness.",
    ],
    tryThis: "Increase both sliders.",
    result: "Higher temperature and concentration usually increase rate.",
    safety: "Fast reactions can heat or foam.",
    realWorld: "Used in food, medicine, and manufacturing.",
  },
  {
    id: "calorimetry",
    title: "Calorimetry Experiment",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: FlaskConical,
    topic: "Heat",
    teaches: "Heat transfer changes final temperature.",
    steps: [
      "Set metal temperature.",
      "Set metal mass.",
      "Read final water temperature.",
    ],
    tryThis: "Increase metal mass.",
    result: "More hot metal transfers more heat.",
    safety: "Hot metals and water can burn.",
    realWorld: "Used to measure specific heat.",
  },
  {
    id: "solubility",
    title: "Solubility Lab",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: FlaskConical,
    topic: "Ksp",
    teaches: "Precipitates form when ion product exceeds Ksp.",
    steps: ["Choose a salt.", "Add solute.", "Watch precipitate status."],
    tryThis: "Increase salt added.",
    result: "When Q > Ksp, precipitate forms.",
    safety: "Some salts are toxic in real labs.",
    realWorld: "Used in water treatment and analysis.",
  },
  {
    id: "indicator",
    title: "Indicator Color Table",
    tab: "Solutions",
    type: "Reference",
    difficulty: "Beginner",
    icon: Sparkles,
    topic: "pH",
    teaches: "Indicators change color over pH ranges.",
    steps: ["Pick an indicator.", "Set pH.", "Observe color."],
    tryThis: "Move pH across 7.",
    result: "Each indicator has its own transition range.",
    safety: "Indicators can stain skin and clothing.",
    realWorld: "Used in titrations and quick pH tests.",
  },
  {
    id: "corrosion",
    title: "Galvanic Series / Corrosion Demo",
    tab: "Reactions",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: ShieldAlert,
    topic: "Corrosion",
    teaches: "Some metals corrode preferentially.",
    steps: [
      "Pick two metals.",
      "Compare potentials.",
      "Identify which corrodes.",
    ],
    tryThis: "Try Zn and Cu.",
    result: "The more easily oxidized metal corrodes.",
    safety: "Corrosion products may be hazardous.",
    realWorld: "Used in sacrificial anodes.",
  },
  {
    id: "soap",
    title: "Soap Making (Saponification)",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Advanced",
    icon: FlaskConical,
    topic: "Organic",
    teaches: "Fats react with base to make soap.",
    steps: [
      "Move reaction progress.",
      "Observe product formation.",
      "Connect to ester hydrolysis.",
    ],
    tryThis: "Set progress near 100 percent.",
    result: "More progress means more soap product.",
    safety: "Real lye is caustic.",
    realWorld: "Used to manufacture soap.",
  },
  {
    id: "fermentation",
    title: "Fermentation Simulator",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Beginner",
    icon: Activity,
    topic: "Biochemistry",
    teaches: "Yeast activity depends strongly on temperature.",
    steps: ["Change temperature.", "Watch activity.", "Find the best range."],
    tryThis: "Set temperature near 32 C.",
    result: "Activity drops when too cold or too hot.",
    safety: "Use clean containers for real fermentation.",
    realWorld: "Used in bread and beverages.",
  },
  {
    id: "polymer",
    title: "Polymer Builder",
    tab: "Advanced",
    type: "Simulation",
    difficulty: "Intermediate",
    icon: Boxes,
    topic: "Polymers",
    teaches: "Polymers are chains of repeating units.",
    steps: [
      "Change chain length.",
      "Observe repeating units.",
      "Connect length to material properties.",
    ],
    tryThis: "Increase polymer length.",
    result: "Longer chains often make tougher materials.",
    realWorld: "Used in plastics and fibers.",
  },
  {
    id: "buffer",
    title: "Buffer Solution Lab",
    tab: "Solutions",
    type: "Simulation",
    difficulty: "Advanced",
    icon: ShieldAlert,
    topic: "Buffers",
    teaches: "Buffers resist pH change.",
    steps: [
      "Add acid or base.",
      "Compare buffer vs pure water.",
      "Read pH response.",
    ],
    tryThis: "Add small acid amount.",
    result: "Buffer pH changes less than pure water.",
    safety: "Buffers still need proper chemical handling.",
    realWorld: "Important in blood and biology labs.",
  },
  {
    id: "recrystallization",
    title: "Recrystallization Visualizer",
    tab: "Solutions",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Sparkles,
    topic: "Purification",
    teaches: "Solubility changes with temperature.",
    steps: [
      "Set temperature.",
      "Watch supersaturation.",
      "Predict crystal formation.",
    ],
    tryThis: "Lower temperature.",
    result: "Cooling can form crystals from solution.",
    safety: "Hot solvents can be flammable.",
    realWorld: "Used to purify solids.",
  },
  {
    id: "bohr",
    title: "Bohr Controls and Ion Formation",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Beginner",
    icon: Atom,
    topic: "Atoms",
    teaches: "Shell electrons help predict common ions.",
    steps: [
      "Choose an element.",
      "Count shell electrons.",
      "Read likely ion pattern.",
    ],
    tryThis: "Compare Na and Cl.",
    result: "Outer electrons guide simple ion formation.",
    realWorld: "Helps explain ionic compounds.",
  },
  {
    id: "timeline",
    title: "Element Discovery Timeline",
    tab: "Atoms",
    type: "Reference",
    difficulty: "Beginner",
    icon: RadioTower,
    topic: "History",
    teaches: "Elements were discovered across centuries.",
    steps: [
      "Scroll the timeline.",
      "Pick an element.",
      "Read discoverer and year.",
    ],
    tryThis: "Select an ancient element and a modern element.",
    result: "Discovery history reflects available tools.",
    realWorld: "Connects chemistry to human discovery.",
  },
  {
    id: "element-pack",
    title: "Element Information Pack",
    tab: "Atoms",
    type: "Reference",
    difficulty: "Beginner",
    icon: BookOpen,
    topic: "Elements",
    teaches: "One element has uses, safety notes, occurrence, and extraction.",
    steps: [
      "Choose an element.",
      "Read each information tile.",
      "Connect properties to uses.",
    ],
    tryThis: "Choose carbon or oxygen.",
    result: "Properties explain where and how elements are used.",
    safety: "Check safety before handling real substances.",
    realWorld: "Useful for assignments and lab prep.",
  },
  {
    id: "isotopes",
    title: "Isotope Explorer and Half-Life Chart",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: RadioTower,
    topic: "Isotopes",
    teaches: "Isotopes differ by neutron count.",
    steps: [
      "Choose an element with isotope data.",
      "Read neutron counts.",
      "Compare half-lives.",
    ],
    tryThis: "Choose C or U.",
    result: "Same element can have stable and radioactive isotopes.",
    safety: "Radioisotopes require trained handling.",
    realWorld: "Used in dating and medical tracers.",
  },
  {
    id: "formula-builder",
    title: "Formula Builder and Molar Mass",
    tab: "Basics",
    type: "Calculator",
    difficulty: "Beginner",
    icon: Calculator,
    topic: "Formulas",
    teaches: "Formulas tell atom counts and mass.",
    steps: ["Enter formula.", "Read parsed atoms.", "Read molar mass."],
    tryThis: "Try Ca(OH)2.",
    result: "Parentheses multiply grouped atoms.",
    realWorld: "Used before every measured reaction.",
  },
  {
    id: "bond-predictor",
    title: "Bond Predictor",
    tab: "Molecules",
    type: "Practice",
    difficulty: "Beginner",
    icon: GitCompare,
    topic: "Bonds",
    teaches: "Element pairs can suggest bond type.",
    steps: [
      "Enter two symbols.",
      "Read prediction.",
      "Change one element and compare.",
    ],
    tryThis: "Try Na and Cl.",
    result: "Metal plus nonmetal often forms ionic compounds.",
    realWorld: "Helps predict properties of compounds.",
  },
  {
    id: "equation-balancer",
    title: "Equation Balancer",
    tab: "Reactions",
    type: "Practice",
    difficulty: "Intermediate",
    icon: FlaskConical,
    topic: "Equations",
    teaches: "Atoms must be conserved in reactions.",
    steps: [
      "Enter an equation.",
      "Read balanced output.",
      "Check each element count.",
    ],
    tryThis: "Try CH4 + O2 -> CO2 + H2O.",
    result: "Balanced equations preserve atoms.",
    realWorld: "Required for stoichiometry.",
  },
  {
    id: "abundance",
    title: "Abundance and Comparison Charts",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Beginner",
    icon: BarChart3,
    topic: "Data",
    teaches: "Element data can be compared visually.",
    steps: [
      "Choose an element.",
      "Pick a second element.",
      "Compare properties.",
    ],
    tryThis: "Compare C and O.",
    result: "Charts make property differences easier to see.",
    realWorld: "Useful for studying trends.",
  },
  {
    id: "trend-graph",
    title: "Trend Graph and Animated Arrows",
    tab: "Atoms",
    type: "Visualizer",
    difficulty: "Intermediate",
    icon: Activity,
    topic: "Trends",
    teaches: "Properties change across periods.",
    steps: [
      "Choose an element.",
      "Look at its period graph.",
      "Notice left-to-right patterns.",
    ],
    tryThis: "Choose a period 2 element.",
    result: "Electronegativity tends to increase across a period.",
    realWorld: "Helps predict reactivity.",
  },
  {
    id: "safety-valency",
    title: "Lab Safety, VSEPR, Lewis, Valency",
    tab: "Basics",
    type: "Practice",
    difficulty: "Beginner",
    icon: ShieldAlert,
    topic: "Safety",
    teaches: "Basic safety and structure rules support lab work.",
    steps: [
      "Read valency clue.",
      "Check Lewis note.",
      "Review safety reminder.",
    ],
    tryThis: "Choose oxygen.",
    result: "Simple rules build first predictions.",
    safety: "Always label, ventilate, and use PPE.",
    realWorld: "Used before any experiment.",
  },
  {
    id: "concept-helper",
    title: "Concept Helper",
    tab: "Basics",
    type: "Practice",
    difficulty: "Beginner",
    icon: Brain,
    topic: "Revision",
    teaches: "Use built-in explanations for common chemistry ideas.",
    steps: [
      "Type a short concept question.",
      "Read the rule-based explanation.",
      "Compare the answer with your notes.",
    ],
    tryThis: "Ask about electronegativity.",
    result: "Short explanations connect facts to causes.",
    realWorld: "Useful for revision.",
  },
  {
    id: "molecule-links",
    title: "Molecule Links, Crystal Lattice, Reactions, Functional Groups",
    tab: "Molecules",
    type: "Reference",
    difficulty: "Advanced",
    icon: BadgeCheck,
    topic: "Connections",
    teaches: "Element choices connect to molecules and structures.",
    steps: [
      "Choose an element.",
      "Review related molecules.",
      "Read the reaction/functional group prompts.",
    ],
    tryThis: "Choose carbon.",
    result: "Elements participate in many molecule families.",
    realWorld: "Useful for organic and materials chemistry.",
  },
  ...EXTENDED_ANALYTICAL_EXPERIMENTS,
  ...ASSESSED_PRACTICAL_EXPERIMENTS,
];

const labTabs = [
  "Start Here",
  "Basics",
  "Atoms",
  "Molecules",
  "Reactions",
  "Solutions",
  "Advanced",
];
const labFocusTopics = [
  { id: "all", label: "All", desc: "Show every matching experiment" },
  { id: "beginner", label: "Start Here", desc: "Only beginner-friendly labs" },
  {
    id: "matter",
    label: "Matter",
    desc: "States, mixtures, separation, phase",
  },
  { id: "atoms", label: "Atoms", desc: "Shells, spectra, isotopes, orbitals" },
  {
    id: "bonding",
    label: "Bonding",
    desc: "Bonds, shapes, polarity, molecules",
  },
  {
    id: "reactions",
    label: "Reactions",
    desc: "Equations, redox, rates, heat",
  },
  {
    id: "solutions",
    label: "Solutions",
    desc: "pH, concentration, solubility, buffers",
  },
  {
    id: "analytical",
    label: "Analytical",
    desc: "Gravimetry, titrations, calibration, chromatography",
  },
  {
    id: "inorganic",
    label: "Inorganic",
    desc: "p-block, coordination, CFT, metallurgy, salt analysis, crystals",
  },
  {
    id: "organic",
    label: "Organic",
    desc: "Mechanisms, polymers, biomolecules",
  },
  {
    id: "bio",
    label: "Bio",
    desc: "Enzymes, proteins, sugars, lipids, DNA, metabolism",
  },
  {
    id: "pharma",
    label: "Pharma",
    desc: "Drug groups, ADME, dosage forms, assays, buffers",
  },
  {
    id: "medical",
    label: "Medical",
    desc: "Clinical, isotope, electrolyte and toxicology chemistry",
  },
];
const labTypes = [
  "All",
  "Simulation",
  "Calculator",
  "Visualizer",
  "Practice",
  "Reference",
];
const labDifficulties = ["All", "Beginner", "Intermediate", "Advanced"];
const experimentMetaByTitle = Object.fromEntries(
  LAB_EXPERIMENTS.map((item) => [item.title, item]),
);

const visualAtlasItems = [
  {
    title: "SN2 reaction mechanism",
    world: "Organic",
    color: "#f59e0b",
    icon: "⚗",
    detail:
      "Nucleophile approach, transition state, and leaving-group departure.",
  },
  {
    title: "Benzene π system",
    world: "Organic",
    color: "#f59e0b",
    icon: "⌬",
    detail: "Delocalized π electrons create a stable aromatic ring.",
  },
  {
    title: "Zeolite crystal structure",
    world: "Inorganic",
    color: "#60a5fa",
    icon: "✣",
    detail:
      "Connected tetrahedra form porous channels for selective adsorption.",
  },
  {
    title: "Perovskite lattice dynamics",
    world: "Inorganic",
    color: "#60a5fa",
    icon: "◇",
    detail: "Lattice distortion changes conductivity and optical response.",
  },
  {
    title: "ATP synthase in action",
    world: "Biochemistry",
    color: "#34d399",
    icon: "⟳",
    detail: "A proton gradient powers ATP formation in molecular machines.",
  },
  {
    title: "Enzyme–substrate binding",
    world: "Biochemistry",
    color: "#34d399",
    icon: "∿",
    detail: "Shape and functional-group complementarity guide catalysis.",
  },
  {
    title: "Protein folding landscape",
    world: "Physical",
    color: "#a78bfa",
    icon: "〰",
    detail: "Energy funnels connect unfolded chains to stable conformations.",
  },
  {
    title: "Reaction energy profile",
    world: "Physical",
    color: "#a78bfa",
    icon: "⌁",
    detail: "Activation energy and reaction enthalpy shape the pathway.",
  },
  {
    title: "Drug dissolution in water",
    world: "Pharmaceutical",
    color: "#f472b6",
    icon: "◉",
    detail: "Solvation and particle size influence release into solution.",
  },
  {
    title: "COVID-19 Mpro inhibitor",
    world: "Pharmaceutical",
    color: "#f472b6",
    icon: "⚛",
    detail: "A ligand occupies a catalytic pocket and blocks protease action.",
  },
];

const prerequisiteMap = {
  titration: "Know pH, neutralization, and indicators first.",
  stoichiometry: "Know mole concept and balanced equations first.",
  vsepr: "Know valence electrons and Lewis structures first.",
  hybridization: "Know sigma bonds, pi bonds, and VSEPR first.",
  "weak-acid-ph": "Know pH and acid dissociation first.",
  electrolysis: "Know oxidation, reduction, anode, and cathode first.",
  "electrochemical-cell": "Know redox potential and electron flow first.",
  colligative: "Know molality and solution concentration first.",
  "analytical-lab":
    "Know mole ratios, concentration units, endpoints, calibration graphs, and separation basics.",
  "surface-chemistry-deep":
    "Know surface area, adsorption, solution charge, and basic intermolecular forces first.",
  "organic-reaction-bank":
    "Know functional groups, nucleophiles/electrophiles, leaving groups, and basic mechanisms first.",
  "environmental-chem":
    "Know air composition, oxidation, acids, dissolved oxygen, ions, and water-quality units.",
  mechanism: "Know nucleophiles, leaving groups, and bond breaking first.",
  "enzyme-kinetics":
    "Know enzymes as catalysts, active sites, substrate, product, and reaction rate.",
  "amino-acid-pi":
    "Know acids, bases, zwitterions, and alpha-amino acid functional groups.",
  "protein-structure":
    "Know peptide bonds, hydrogen bonding, hydrophobic interactions, and disulfide links.",
  "carbohydrate-lab":
    "Know ring/open-chain sugar forms, glycosidic bonds, and reducing tests.",
  "lipid-membrane":
    "Know polar heads, nonpolar tails, amphiphiles, and hydrophobic effect.",
  "nucleic-acid-lab": "Know nucleotide parts: base, sugar, and phosphate.",
  "vitamin-coenzyme-map":
    "Know vitamins as small organic helpers and minerals as inorganic cofactors.",
  "metabolism-atp":
    "Know oxidation-reduction, ATP phosphate transfer, and carbon/nitrogen flow.",
  "drug-functional-groups":
    "Know organic functional groups, polarity, hydrogen bonding, and acid-base behavior.",
  "adme-ionization":
    "Know pH, pKa, ionization, polarity, and membrane crossing basics.",
  isotonicity:
    "Know molarity, osmotic pressure, van Hoff factor, and semipermeable membranes.",
  "clinical-buffers":
    "Know weak acid/conjugate base buffers and Henderson-Hasselbalch idea.",
  "drug-class-studio":
    "Know organic motifs such as acids, amides, amines, aromatics, and heterocycles.",
  "drug-metabolism-lab":
    "Know oxidation, reduction, hydrolysis, and conjugation reactions.",
  "dosage-form-lab":
    "Know solution, suspension, emulsion, solubility, viscosity, and surfactants.",
  "antacid-analgesic-antimicrobial":
    "Know neutralization, functional groups, and selective toxicity idea.",
  "pharma-buffer-lab":
    "Know buffer capacity, target pH, pKa, and compatibility.",
  "pharma-analysis":
    "Know titration, chromatography, spectroscopy, and impurity testing basics.",
  radiopharma:
    "Know isotopes, half-life, decay type, tracer targeting, and radiation safety.",
  "salt-analysis":
    "Know solubility, precipitation, amphoteric hydroxides, flame tests, and common anion confirmatory reactions.",
  "nuclear-chemistry":
    "Know atomic number, mass number, isotopes, half-life, and conservation of mass number and charge.",
  "electrolyte-panel":
    "Know ions, charge balance, osmolarity, and body-fluid compartments.",
  "hemoglobin-oxygen":
    "Know equilibrium, cooperative binding, heme iron, pH, and CO2 effects.",
  "diagnostic-color-tests":
    "Know redox tests, complex formation, precipitation, and absorbance.",
  "clinical-metabolites":
    "Know small biomolecules and analytical concentration measurements.",
  "toxicology-chelation":
    "Know coordination, ligand binding, enzyme inhibition, and redox toxicity.",
};

const commonMistakes = {
  titration:
    "Do not assume pH changes evenly; near equivalence it can jump very quickly.",
  "molar-mass":
    "Remember that atoms inside parentheses are multiplied by the subscript outside.",
  stoichiometry: "Always balance the equation before using mole ratios.",
  dilution: "Use the same volume units on both sides of C1V1 = C2V2.",
  vsepr: "Count lone pairs as electron domains even though they are not atoms.",
  "bond-polarity":
    "A polar bond does not always mean the whole molecule is polar.",
  equilibrium: "A catalyst changes speed, not the equilibrium position.",
  colligative:
    "Use molality, not molarity, for boiling and freezing point calculations.",
  electrolysis:
    "Do not mix up electrode sign conventions for electrolytic and galvanic cells.",
  "analytical-lab":
    "Do not report an analytical result without blank correction, dilution factor, units, and method limits.",
  "surface-chemistry-deep":
    "Do not apply Hardy-Schulze by total salt amount only; the charge of the counter-ion is the key idea.",
  "organic-reaction-bank":
    "Do not choose reagents by product name alone; check mechanism, stereochemistry, rearrangement risk, and functional-group compatibility.",
  "environmental-chem":
    "Do not confuse stratospheric ozone protection with tropospheric ozone pollution; high BOD/COD usually means polluted water.",
  "enzyme-kinetics":
    "Do not assume rate rises forever; active sites saturate near Vmax.",
  "amino-acid-pi":
    "Do not treat every amino acid as neutral at all pH values; net charge changes with pH.",
  "protein-structure":
    "Do not confuse denaturation with peptide-bond hydrolysis; unfolding can occur without breaking the backbone.",
  "carbohydrate-lab":
    "Do not assume every disaccharide is reducing; sucrose lacks a free anomeric carbon.",
  "lipid-membrane":
    "Do not draw lipid tails facing water in a stable bilayer or micelle.",
  "nucleic-acid-lab":
    "Do not forget phosphate makes nucleic acid backbones negatively charged.",
  "vitamin-coenzyme-map":
    "Do not memorize vitamins only as names; link each one to a chemical role.",
  "metabolism-atp":
    "Do not treat ATP as stored heat; it drives reactions through coupled phosphate transfer.",
  "drug-functional-groups":
    "Do not decide drug behavior from one group only; shape, charge, and polarity act together.",
  "adme-ionization":
    "Do not assume neutral is always better; solubility and permeability must be balanced.",
  isotonicity:
    "Do not confuse percent concentration with osmolarity; ion dissociation changes particle count.",
  "clinical-buffers":
    "Do not treat blood pH as a single test-tube buffer; lungs and kidneys also regulate it.",
  "drug-class-studio":
    "Do not assume all drugs in a class have identical functional groups or metabolism.",
  "drug-metabolism-lab":
    "Do not assume metabolism always inactivates a drug; prodrugs can be activated.",
  "dosage-form-lab":
    "Do not call a cloudy suspension a solution; phase behavior matters.",
  "antacid-analgesic-antimicrobial":
    "Do not mix symptom relief chemistry with antimicrobial target chemistry.",
  "pharma-buffer-lab":
    "Do not maximize buffer strength blindly; comfort and compatibility can suffer.",
  "pharma-analysis":
    "Do not use one assay to prove everything; identity, purity, strength, and release are different checks.",
  radiopharma:
    "Do not pick an isotope by radiation type alone; half-life, targeting, and clearance matter.",
  "salt-analysis":
    "Do not skip reagent order; early contamination or unremoved groups can create false positives.",
  "nuclear-chemistry":
    "Do not balance nuclear equations by chemical valency; conserve mass number A and atomic number Z.",
  "electrolyte-panel":
    "Do not compare ions only by charge; compartment and concentration range matter.",
  "hemoglobin-oxygen":
    "Do not confuse oxygen binding with oxidation of iron to Fe3+.",
  "diagnostic-color-tests":
    "Do not read color intensity without controls, calibration, and timing.",
  "clinical-metabolites":
    "Do not interpret a marker without sample type, units, and context.",
  "toxicology-chelation":
    "Do not assume every poison is treated by chelation; mechanism decides treatment concept.",
};

const formulaNotes = {
  "molar-mass": "Molar mass = sum of each atomic mass x atom count.",
  "formula-builder": "Molar mass = sum of each atomic mass x atom count.",
  stoichiometry: "Balanced equation coefficients give mole ratios.",
  dilution: "C1V1 = C2V2.",
  "weak-acid-ph": "[H+] approximately equals sqrt(Ka x C) for a weak acid.",
  "gas-law": "PV = nRT.",
  hess: "Delta H total = sum of adjusted reaction enthalpies.",
  colligative: "Delta Tb = Kb x m and Delta Tf = Kf x m.",
  "analytical-lab":
    "Analytical result = stoichiometry or signal model applied to a prepared sample, then corrected for dilution, blanks, and recovery.",
  "surface-chemistry-deep":
    "Freundlich: x/m = kP^(1/n); Langmuir: x/m = aP/(1+bP); coagulating power rises sharply with counter-ion valency.",
  "organic-reaction-bank":
    "A synthesis route is a sequence of chemoselective transformations with stereochemical control and protection when functional groups conflict.",
  "environmental-chem":
    "BOD = (D1 - D2) x dilution; COD = (blank - sample) x N x 8000 / mL sample; hardness as CaCO3 = 2.497Ca + 4.118Mg.",
  "rate-lab": "Rate generally increases with concentration and temperature.",
  calorimetry: "q = m c Delta T.",
  solubility: "Precipitation is predicted by comparing Q with Ksp.",
  "enzyme-kinetics": "Michaelis-Menten: v = Vmax[S] / (Km + [S]).",
  "amino-acid-pi":
    "For simple neutral amino acids, pI is roughly (pKa1 + pKa2) / 2.",
  "protein-structure":
    "Protein stability is a balance of hydrogen bonding, ionic links, hydrophobic packing, and disulfides.",
  "carbohydrate-lab":
    "Reducing sugars have a free anomeric carbon that can open to a carbonyl form.",
  "lipid-membrane":
    "Amphiphiles assemble with polar heads toward water and nonpolar tails away from water.",
  "nucleic-acid-lab":
    "A pairs with T/U by 2 H-bonds; G pairs with C by 3 H-bonds.",
  "vitamin-coenzyme-map":
    "Coenzymes transfer electrons, acyl groups, one-carbon units, or phosphate-linked energy.",
  "metabolism-atp":
    "ATP hydrolysis and redox carriers couple unfavorable steps to favorable chemistry.",
  "drug-functional-groups":
    "Drug-like behavior depends on pKa, logP, H-bond donors/acceptors, and molecular shape.",
  "adme-ionization":
    "Weak acid ionized fraction rises above pKa; weak base ionized fraction rises below pKa.",
  isotonicity:
    "Osmotic pressure: Pi = iMRT; osmolarity counts dissolved particles.",
  "clinical-buffers": "Henderson-Hasselbalch: pH = pKa + log(base/acid).",
  "drug-class-studio":
    "SAR compares how structure changes affect potency, selectivity, and safety.",
  "drug-metabolism-lab":
    "Phase I adds/exposes groups; Phase II conjugates polar groups for clearance.",
  "dosage-form-lab":
    "Release depends on solubility, particle size, dissolution, viscosity, and matrix breakup.",
  "antacid-analgesic-antimicrobial":
    "Antacids neutralize acid; analgesics affect biochemical targets; antimicrobials block microbial chemistry.",
  "pharma-buffer-lab": "Useful buffer range is usually near pKa +/- 1 pH unit.",
  "pharma-analysis":
    "Assay proves amount; chromatography separates impurities; dissolution tests release.",
  radiopharma: "Remaining activity follows A = A0 / 2^n after n half-lives.",
  "salt-analysis":
    "Qualitative analysis depends on selective precipitation: lower Ksp groups precipitate first under controlled acidity/basicity.",
  "nuclear-chemistry":
    "Mass defect = separated nucleon mass - nuclear mass; E = Delta m x 931.5 MeV per u; dose equivalent = absorbed dose x radiation weighting factor.",
  "electrolyte-panel":
    "Electroneutrality and osmolarity link ions to water balance.",
  "hemoglobin-oxygen":
    "Bohr effect: lower pH and higher CO2 shift oxygen release toward tissues.",
  "diagnostic-color-tests":
    "Many color tests use redox change, complex formation, precipitation, or enzymatic color generation.",
  "clinical-metabolites":
    "Clinical chemistry converts concentration changes into metabolic and organ-function signals.",
  "toxicology-chelation":
    "Chelators bind metal ions through multiple donor atoms to improve removal or reduce binding to enzymes.",
};

const miniQuiz = {
  titration: {
    q: "What marks the equivalence region?",
    a: "A sharp pH change as acid and base neutralize.",
  },
  "molar-mass": {
    q: "Why do parentheses matter in formulas?",
    a: "They multiply every atom inside the group.",
  },
  stoichiometry: {
    q: "What must be done before mole-ratio calculations?",
    a: "Balance the chemical equation.",
  },
  vsepr: {
    q: "What determines molecular shape in VSEPR?",
    a: "Bonding pairs and lone-pair electron domains.",
  },
  electrolysis: {
    q: "What drives a non-spontaneous reaction in electrolysis?",
    a: "External electrical energy.",
  },
  "analytical-lab": {
    q: "Why are calibration and blank correction important?",
    a: "They separate the analyte signal from instrument/reagent background and convert signal into concentration.",
  },
  "surface-chemistry-deep": {
    q: "In Hardy-Schulze rule, what controls coagulating power most strongly?",
    a: "The valency of the counter-ion; higher opposite charge coagulates more strongly.",
  },
  "organic-reaction-bank": {
    q: "Why might two reagents give alcohols from the same alkene but different products?",
    a: "They can follow different mechanisms and regiochemistry, such as Markovnikov hydration versus anti-Markovnikov hydroboration.",
  },
  "environmental-chem": {
    q: "Why does eutrophication lower dissolved oxygen?",
    a: "Nutrients cause algal blooms; microbial decomposition of dead algae consumes oxygen and raises BOD.",
  },
  "enzyme-kinetics": {
    q: "Why does the enzyme rate curve level off?",
    a: "Active sites become saturated, so rate approaches Vmax.",
  },
  "amino-acid-pi": {
    q: "What happens to net amino acid charge near pI?",
    a: "The net charge is close to zero, often as a zwitterion.",
  },
  "protein-structure": {
    q: "What changes during denaturation?",
    a: "The folded structure is disrupted while peptide bonds may remain intact.",
  },
  "carbohydrate-lab": {
    q: "What makes a sugar reducing?",
    a: "A free anomeric carbon that can open to a carbonyl form.",
  },
  "lipid-membrane": {
    q: "Why do micelles form in water?",
    a: "Polar heads face water while nonpolar tails hide inside.",
  },
  "nucleic-acid-lab": {
    q: "Which base pair has more hydrogen bonds, A-T or G-C?",
    a: "G-C has three hydrogen bonds; A-T has two.",
  },
  "metabolism-atp": {
    q: "What does ATP transfer in many biochemical reactions?",
    a: "A phosphate-linked energy unit that couples reactions.",
  },
  "adme-ionization": {
    q: "Why does pKa matter in drug absorption?",
    a: "It predicts ionization, which affects solubility and membrane crossing.",
  },
  isotonicity: {
    q: "Why does NaCl count more particles than glucose?",
    a: "NaCl dissociates into ions, increasing osmotic particle count.",
  },
  "clinical-buffers": {
    q: "What is the main blood buffer pair?",
    a: "Carbonic acid/bicarbonate, linked to CO2 handling.",
  },
  radiopharma: {
    q: "Why is half-life important for medical isotopes?",
    a: "It balances useful detection or therapy with safe clearance.",
  },
  "salt-analysis": {
    q: "Why is reagent order important in salt analysis?",
    a: "It separates groups selectively and prevents later ions or added reagents from masking earlier confirmations.",
  },
  "nuclear-chemistry": {
    q: "What must be conserved in a nuclear equation?",
    a: "Total mass number and total atomic number must balance on both sides.",
  },
  "electrolyte-panel": {
    q: "Which ion is the major extracellular cation?",
    a: "Sodium ion, Na+.",
  },
  "hemoglobin-oxygen": {
    q: "What does low pH do to oxygen release?",
    a: "It shifts hemoglobin toward releasing oxygen in tissues.",
  },
  "toxicology-chelation": {
    q: "What is chelation?",
    a: "Binding a metal ion with a ligand that has multiple donor atoms.",
  },
};

const appliedChemistryRoadmaps = {
  bio: {
    title: "Biochemistry Strength Map",
    accent: "#22c55e",
    strands: [
      [
        "Biomolecule structure",
        "Amino acids, proteins, carbohydrates, lipids, nucleic acids",
      ],
      [
        "Biochemical forces",
        "Hydrogen bonding, ionization, hydrophobic effect, redox and phosphate transfer",
      ],
      [
        "Lab visuals",
        "Enzyme curves, folding, reducing sugars, membranes, base pairing, metabolism board",
      ],
    ],
  },
  pharma: {
    title: "Pharmaceutical Chemistry Strength Map",
    accent: "#14b8a6",
    strands: [
      [
        "Drug structure",
        "Functional groups, SAR, pKa, lipophilicity, hydrogen bonding",
      ],
      [
        "Formulation chemistry",
        "Buffers, isotonicity, dosage forms, solubility, stability, excipients",
      ],
      [
        "Quality control",
        "Assay, chromatography, spectroscopy, dissolution, impurities and limits",
      ],
    ],
  },
  medical: {
    title: "Medical and Clinical Chemistry Strength Map",
    accent: "#fb7185",
    strands: [
      [
        "Body-fluid chemistry",
        "Electrolytes, buffers, osmolarity, blood pH, oxygen binding",
      ],
      [
        "Diagnostics",
        "Glucose, urea, creatinine, cholesterol, color tests, radiotracers",
      ],
      [
        "Toxicology",
        "Heavy metals, CO, cyanide, enzyme poisoning, chelation and isotope safety",
      ],
    ],
  },
};

const LabCard = ({ title, children }) => {
  const meta = experimentMetaByTitle[title];
  const Icon = meta?.icon || FlaskConical;
  const syllabusTags = meta ? getSyllabusTagsForLab(meta.id) : { tracks: [] };
  return (
    <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <Icon size={17} className="text-cyan-300" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white">{title}</h4>
          {meta && (
            <div className="mt-1 flex flex-wrap gap-1">
              <BadgePill className={difficultyStyles[meta.difficulty]}>
                {meta.difficulty}
              </BadgePill>
              <BadgePill className={typeStyles[meta.type]}>
                {meta.type}
              </BadgePill>
              <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                {estimatedMinutes(meta)} min
              </BadgePill>
              <BadgePill className="bg-white/[0.04] text-gray-300 border-white/10">
                {meta.topic}
              </BadgePill>
              {syllabusTags.tracks.slice(0, 4).map((trackId) => (
                <BadgePill
                  key={trackId}
                  className="bg-black/15 text-gray-300 border-white/10"
                  style={{
                    borderColor: `${syllabusTrackMap[trackId]?.color || "#64748b"}66`,
                    color: syllabusTrackMap[trackId]?.color,
                  }}
                >
                  {syllabusTrackMap[trackId]?.label}
                </BadgePill>
              ))}
            </div>
          )}
        </div>
      </div>
      {meta && (
        <div className="mb-3 rounded-xl bg-black/15 border border-white/10 p-3">
          <p className="text-xs text-gray-300">
            <span className="text-cyan-300 font-semibold">Learn:</span>{" "}
            {meta.teaches}
          </p>
          {meta.safety && (
            <p className="text-[11px] text-amber-300 mt-1">
              <span className="font-semibold">Safety:</span> {meta.safety}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

const Bench = ({ title, children, result }) => {
  const [copied, setCopied] = useState(false);
  const [flash, setFlash] = useState(false);
  const resultText = typeof result === "string" ? result : "";
  const approximate = /\d/.test(resultText);
  const statusClass = /no |invalid|error|non-spontaneous|illegal/i.test(
    resultText,
  )
    ? "bg-amber-500/10 border-amber-500/20 text-amber-100"
    : /correct|spontaneous|forms|complete|allowed|occurs|negative|positive/i.test(
          resultText,
        )
      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-100"
      : "bg-cyan-500/10 border-cyan-500/20 text-cyan-100";
  const copyResult = () => {
    if (!resultText || !navigator.clipboard) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };
  useEffect(() => {
    if (!resultText) return;
    setFlash(true);
    const timeout = window.setTimeout(() => setFlash(false), 650);
    return () => window.clearTimeout(timeout);
  }, [resultText]);
  return (
    <div
      data-active-lab
      className="rounded-2xl bg-black/20 border border-white/10 p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <FlaskConical size={16} className="text-emerald-300" />
        <h4 className="text-sm font-black text-white">{title}</h4>
        <span className="ml-auto text-[10px] text-emerald-300 border border-emerald-500/25 bg-emerald-500/10 rounded-full px-2 py-0.5">
          Live Lab
        </span>
      </div>
      {children}
      {result && (
        <div
          className={`mt-4 rounded-xl border p-3 text-sm transition-shadow ${statusClass} ${flash ? "ring-2 ring-cyan-300/40 shadow-lg shadow-cyan-500/10" : ""}`}
        >
          <div className="flex items-start gap-2">
            <span className="flex-1">{result}</span>
            {approximate && (
              <BadgePill className="bg-white/[0.08] text-gray-200 border-white/15">
                Approximate
              </BadgePill>
            )}
            {resultText && (
              <button
                type="button"
                onClick={copyResult}
                className="rounded-lg border border-white/10 bg-black/15 px-2 py-1 text-[10px] text-gray-200 hover:text-white"
                title="Copy result"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const ControlLabel = ({ children }) => (
  <label className="block text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-1">
    {children}
  </label>
);

const ElementSearchInput = ({
  value,
  onChange,
  allowedSymbols,
  className = "",
  placeholder = "Search Elements",
}) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selectedElement = elements.find((el) => el.symbol === value);
  const availableElements = useMemo(() => {
    const allowed = allowedSymbols ? new Set(allowedSymbols) : null;
    return elements.filter((el) => !allowed || allowed.has(el.symbol));
  }, [allowedSymbols]);
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? availableElements.filter(
          (el) =>
            el.name.toLowerCase().includes(q) ||
            el.symbol.toLowerCase().includes(q) ||
            String(el.atomicNumber).includes(q) ||
            el.category.toLowerCase().includes(q),
        )
      : availableElements;
    return matches.slice(0, 8);
  }, [availableElements, query]);

  useEffect(() => {
    if (selectedElement)
      setQuery(`${selectedElement.name} (${selectedElement.symbol})`);
  }, [selectedElement]);

  const selectElement = (symbol) => {
    const next = elements.find((el) => el.symbol === symbol);
    if (!next) return;
    onChange(symbol);
    setQuery(`${next.name} (${next.symbol})`);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && suggestions[0]) {
            e.preventDefault();
            selectElement(suggestions[0].symbol);
          }
        }}
        placeholder={placeholder}
        className="input text-sm pl-9"
      />
      {open && (
        <div className="absolute z-40 mt-2 w-full max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-gray-950 shadow-2xl">
          <div className="px-3 py-2 text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/10">
            Available elements
          </div>
          {suggestions.length > 0 ? (
            suggestions.map((el) => (
              <button
                type="button"
                key={el.symbol}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectElement(el.symbol)}
                className="w-full px-3 py-2 text-left hover:bg-white/[0.06] flex items-center gap-3"
              >
                <span className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 flex items-center justify-center text-sm font-black">
                  {el.symbol}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-white truncate">
                    {el.name}
                  </span>
                  <span className="block text-[11px] text-gray-500 truncate">
                    #{el.atomicNumber} - {el.category}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <div className="px-3 py-3 text-xs text-gray-500">
              No available element matches this search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const orbitalMeta = {
  s: { lobes: 1, note: "Spherical orbital with no angular node." },
  p: { lobes: 2, note: "Two opposite lobes with one nodal plane." },
  d: { lobes: 4, note: "Mostly cloverleaf shapes with two angular nodes." },
  f: {
    lobes: 8,
    note: "Complex multi-lobed shapes used in f-block chemistry.",
  },
};

const moData = {
  H2: {
    electrons: 2,
    order: 1,
    magnetic: "diamagnetic",
    fill: ["sigma 1s ↑↓"],
  },
  N2: {
    electrons: 10,
    order: 3,
    magnetic: "diamagnetic",
    fill: ["sigma 2s ↑↓", "sigma* 2s ↑↓", "pi 2p ↑↓ ↑↓", "sigma 2p ↑↓"],
  },
  O2: {
    electrons: 12,
    order: 2,
    magnetic: "paramagnetic",
    fill: [
      "sigma 2s ↑↓",
      "sigma* 2s ↑↓",
      "sigma 2p ↑↓",
      "pi 2p ↑↓ ↑↓",
      "pi* 2p ↑ ↑",
    ],
  },
};

const mechanismData = {
  SN1: [
    "Leaving group departs",
    "Carbocation forms",
    "Nucleophile attacks",
    "Product forms",
  ],
  SN2: [
    "Nucleophile approaches backside",
    "C-Nu bond forms as C-LG breaks",
    "Transition state",
    "Inverted product forms",
  ],
  E2: [
    "Base removes beta-H",
    "C-H and C-LG bonds break",
    "C=C pi bond forms",
    "Alkene product forms",
  ],
};

const nuclearModes = [
  { id: "series", label: "Decay Series" },
  { id: "equations", label: "Equations" },
  { id: "binding", label: "Binding Energy" },
  { id: "energetics", label: "Fission/Fusion" },
  { id: "dose", label: "Shielding & Dose" },
];

const nuclearDecayModes = {
  alpha: {
    label: "Alpha",
    particle: "He-4 nucleus",
    deltaA: -4,
    deltaZ: -2,
    symbol: "4/2 He",
    shield: "paper, skin, or a few cm air",
    hazard: "dangerous if inhaled or ingested",
  },
  "beta-minus": {
    label: "Beta minus",
    particle: "electron + antineutrino",
    deltaA: 0,
    deltaZ: 1,
    symbol: "0/-1 e",
    shield: "plastic, glass, or thin metal",
    hazard: "skin and internal hazard",
  },
  "beta-plus": {
    label: "Beta plus",
    particle: "positron + neutrino",
    deltaA: 0,
    deltaZ: -1,
    symbol: "0/+1 e",
    shield: "shield annihilation gamma photons too",
    hazard: "PET-style gamma dose after annihilation",
  },
  gamma: {
    label: "Gamma",
    particle: "high-energy photon",
    deltaA: 0,
    deltaZ: 0,
    symbol: "gamma",
    shield: "dense lead or thick concrete",
    hazard: "deep penetrating external dose",
  },
};

const nuclearSeriesTemplates = {
  "u-238": {
    name: "U-238 series",
    start: { symbol: "U", z: 92, a: 238 },
    steps: ["alpha", "beta-minus", "beta-minus", "alpha", "alpha"],
    final: "Ra-226 path fragment",
  },
  "th-232": {
    name: "Th-232 series",
    start: { symbol: "Th", z: 90, a: 232 },
    steps: ["alpha", "alpha", "beta-minus", "beta-minus", "alpha"],
    final: "Ra-224 path fragment",
  },
  "c-14": {
    name: "C-14 dating",
    start: { symbol: "C", z: 6, a: 14 },
    steps: ["beta-minus"],
    final: "N-14",
  },
};

const nuclearEquationPrompts = [
  {
    id: "u-alpha",
    parent: "238/92 U",
    decay: "alpha",
    answer: "234/90 Th + 4/2 He",
    reason: "Alpha decay lowers mass number by 4 and atomic number by 2.",
  },
  {
    id: "c-beta",
    parent: "14/6 C",
    decay: "beta-minus",
    answer: "14/7 N + 0/-1 e",
    reason: "Beta minus keeps A same and raises Z by 1.",
  },
  {
    id: "p-beta-plus",
    parent: "30/15 P",
    decay: "beta-plus",
    answer: "30/14 Si + 0/+1 e",
    reason: "Beta plus keeps A same and lowers Z by 1.",
  },
  {
    id: "ra-alpha",
    parent: "226/88 Ra",
    decay: "alpha",
    answer: "222/86 Rn + 4/2 He",
    reason: "Mass and charge are conserved on both sides.",
  },
];

const nuclearBindingIsotopes = {
  "he-4": { label: "He-4", z: 2, n: 2, mass: 4.002603 },
  "c-12": { label: "C-12", z: 6, n: 6, mass: 12.0 },
  "fe-56": { label: "Fe-56", z: 26, n: 30, mass: 55.934937 },
  "u-235": { label: "U-235", z: 92, n: 143, mass: 235.043929 },
};

const nuclearEnergeticExamples = {
  fission: {
    label: "U-235 fission",
    reactantsMass: 236.0526,
    productsMass: 235.8351,
    products: "Ba-141 + Kr-92 + 3n",
    note: "Large nuclei split into medium nuclei plus neutrons; chain reaction depends on neutron economy.",
  },
  fusion: {
    label: "D-T fusion",
    reactantsMass: 5.030151,
    productsMass: 5.011268,
    products: "He-4 + n",
    note: "Light nuclei fuse; high temperature overcomes Coulomb repulsion.",
  },
  annihilation: {
    label: "Positron annihilation",
    reactantsMass: 0.001097,
    productsMass: 0,
    products: "2 gamma photons",
    note: "Mass converts almost completely to photon energy, used in PET detection.",
  },
};

const shieldingMaterials = {
  paper: { label: "Paper/skin", hvl: { alpha: 0.01, beta: 0.12, gamma: 12 } },
  plastic: { label: "Plastic", hvl: { alpha: 0.01, beta: 0.45, gamma: 9 } },
  aluminum: { label: "Aluminum", hvl: { alpha: 0.01, beta: 0.9, gamma: 3.8 } },
  lead: { label: "Lead", hvl: { alpha: 0.01, beta: 0.35, gamma: 0.9 } },
  concrete: { label: "Concrete", hvl: { alpha: 0.01, beta: 1.6, gamma: 6.1 } },
};

const radiationWeighting = { alpha: 20, beta: 1, gamma: 1 };
const PROTON_MASS_U = 1.007276;
const NEUTRON_MASS_U = 1.008665;
const U_TO_MEV = 931.5;

const environmentalTabs = [
  "Ozone",
  "Smog",
  "Water Hardness",
  "BOD/COD",
  "Eutrophication",
  "Treatment",
];

const pollutantTreatmentMethods = [
  {
    method: "Primary treatment",
    target: "Suspended solids",
    chemistry:
      "Screening and sedimentation remove grit and settleable particles.",
    output: "Lower turbidity and sludge formation.",
  },
  {
    method: "Secondary treatment",
    target: "Biodegradable organics",
    chemistry: "Aerobic microbes oxidize organic matter, lowering BOD.",
    output: "Cleaner effluent after activated sludge or trickling filter.",
  },
  {
    method: "Tertiary treatment",
    target: "Nutrients and trace pollutants",
    chemistry:
      "Phosphate precipitation, nitrification-denitrification, carbon adsorption, membranes.",
    output: "Lower eutrophication risk and fewer micropollutants.",
  },
  {
    method: "Flue-gas desulfurization",
    target: "SO2",
    chemistry: "CaCO3/CaO slurry absorbs SO2 to form calcium sulfite/sulfate.",
    output: "Less acid rain precursor emission.",
  },
  {
    method: "Catalytic converter",
    target: "CO, NOx, hydrocarbons",
    chemistry: "Pt/Pd/Rh catalyze oxidation of CO/HC and reduction of NOx.",
    output: "Less photochemical smog precursor load.",
  },
  {
    method: "Activated carbon",
    target: "Dyes, odors, organic micropollutants",
    chemistry: "High surface area adsorbs nonpolar and aromatic pollutants.",
    output: "Improved taste, color, and trace organic removal.",
  },
];

const smogMechanismSteps = [
  ["NO2 photolysis", "NO2 + hv -> NO + O"],
  ["Ozone formation", "O + O2 -> O3"],
  ["Radical oxidation", "Hydrocarbons -> RO2 radicals"],
  ["NO to NO2 recycling", "RO2 + NO -> RO + NO2"],
  ["PAN/oxidants", "Acyl peroxy radicals + NO2 -> PAN"],
];

const phaseAt = (temp, pressure) => {
  if (pressure > 150 && temp > 374) return "supercritical fluid";
  if (temp < 0) return pressure < 0.006 ? "vapor" : "solid";
  if (temp > 100 && pressure <= 1) return "gas";
  if (pressure < 0.006) return "gas";
  return "liquid";
};

const flameColors = {
  Li: "#dc2626",
  Na: "#facc15",
  K: "#a855f7",
  Ca: "#fb923c",
  Sr: "#ef4444",
  Ba: "#22c55e",
  Cu: "#14b8a6",
  Cs: "#3b82f6",
};

const spectrumLines = {
  H: [410, 434, 486, 656],
  He: [447, 501, 587, 668],
  Li: [460, 610, 671],
  Na: [589],
  K: [404, 766],
  Ca: [423, 616, 643],
  Cu: [510, 578],
};

const wavelengthColor = (nm) => {
  if (nm < 450) return "#6366f1";
  if (nm < 495) return "#06b6d4";
  if (nm < 570) return "#22c55e";
  if (nm < 590) return "#eab308";
  if (nm < 620) return "#f97316";
  return "#ef4444";
};

const empiricalFormula = (rows) => {
  const moles = rows
    .map((row) => ({
      ...row,
      moles:
        Number(row.percent || 0) /
        (elements.find((e) => e.symbol === row.symbol)?.atomicMass || 1),
    }))
    .filter((row) => row.symbol && row.moles > 0);
  const min = Math.min(...moles.map((row) => row.moles));
  return moles
    .map(
      (row) =>
        `${row.symbol}${Math.round(row.moles / min) > 1 ? Math.round(row.moles / min) : ""}`,
    )
    .join("");
};

const oxidationGuess = (formula) => {
  const counts = parseFormula(formula);
  return Object.keys(counts)
    .map((symbol) => {
      const value =
        symbol === "O"
          ? -2
          : symbol === "H"
            ? 1
            : (ionData[symbol]?.charge ?? 0);
      return `${symbol}: ${value > 0 ? "+" : ""}${value}`;
    })
    .join(" · ");
};

export const ChemistryLabPage = ({
  initialFocusTopic = "all",
  initialExperimentId = "",
}) => {
  const labSearchRef = useRef(null);
  const [selectedSymbol, setSelectedSymbol] = useState("C");
  const [secondSymbol, setSecondSymbol] = useState("O");
  const [formulaInput, setFormulaInput] = useState("Ca(OH)2");
  const [bondA, setBondA] = useState("Na");
  const [bondB, setBondB] = useState("Cl");
  const [lattice, setLattice] = useState("Sodium chloride");
  const [latticeSize, setLatticeSize] = useState(4);
  const [reactionKey, setReactionKey] = useState("water");
  const [reactionStep, setReactionStep] = useState(1);
  const [lewisElement, setLewisElement] = useState("O");
  const [bondedAtoms, setBondedAtoms] = useState(4);
  const [lonePairs, setLonePairs] = useState(0);
  const [hybrid, setHybrid] = useState("sp3");
  const [trendMetric, setTrendMetric] = useState("electronegativity");
  const [decayHalfLives, setDecayHalfLives] = useState(1);
  const [cation, setCation] = useState("Ca");
  const [anion, setAnion] = useState("Cl");
  const [electrolyte, setElectrolyte] = useState("CuSO4");
  const [titrationMl, setTitrationMl] = useState(25);
  const [equationInput, setEquationInput] = useState("CH4 + O2 -> CO2 + H2O");
  const [rateTemp, setRateTemp] = useState(35);
  const [rateConc, setRateConc] = useState(1.2);
  const [metalTemp, setMetalTemp] = useState(95);
  const [metalMass, setMetalMass] = useState(50);
  const [salt, setSalt] = useState("AgCl");
  const [saltAdded, setSaltAdded] = useState(0.001);
  const [solutionPh, setSolutionPh] = useState(7);
  const [indicator, setIndicator] = useState("Bromothymol blue");
  const [metalA, setMetalA] = useState("Zn");
  const [metalB, setMetalB] = useState("Cu");
  const [anodeHalf, setAnodeHalf] = useState("Zn");
  const [cathodeHalf, setCathodeHalf] = useState("Cu");
  const [cellMode, setCellMode] = useState("galvanic");
  const [sapProgress, setSapProgress] = useState(45);
  const [yeastTemp, setYeastTemp] = useState(32);
  const [polymerLength, setPolymerLength] = useState(8);
  const [bufferAdded, setBufferAdded] = useState(2);
  const [recrystTemp, setRecrystTemp] = useState(35);
  const [orbitalType, setOrbitalType] = useState("p");
  const [structureType, setStructureType] = useState("NaCl");
  const [hybridMix, setHybridMix] = useState(55);
  const [polarityA, setPolarityA] = useState("H");
  const [polarityB, setPolarityB] = useState("Cl");
  const [mechanism, setMechanism] = useState("SN2");
  const [mechanismStep, setMechanismStep] = useState(1);
  const [imfType, setImfType] = useState("hydrogen bonding");
  const [decayMode, setDecayMode] = useState("alpha");
  const [nuclearMode, setNuclearMode] = useState("series");
  const [nuclearSeries, setNuclearSeries] = useState("u-238");
  const [nuclearSeriesSteps, setNuclearSeriesSteps] = useState(3);
  const [nuclearEquationId, setNuclearEquationId] = useState("u-alpha");
  const [nuclearBindingIso, setNuclearBindingIso] = useState("fe-56");
  const [nuclearEnergeticCase, setNuclearEnergeticCase] = useState("fission");
  const [radiationType, setRadiationType] = useState("gamma");
  const [shieldMaterial, setShieldMaterial] = useState("lead");
  const [shieldThickness, setShieldThickness] = useState(3);
  const [absorbedDose, setAbsorbedDose] = useState(0.02);
  const [phaseTemp, setPhaseTemp] = useState(25);
  const [phasePressure, setPhasePressure] = useState(1);
  const [moMolecule, setMoMolecule] = useState("O2");
  const [simTitrationDrops, setSimTitrationDrops] = useState(25);
  const [distillHeat, setDistillHeat] = useState(55);
  const [chromTime, setChromTime] = useState(35);
  const [probeSolution, setProbeSolution] = useState("water");
  const [eqReactant, setEqReactant] = useState(1);
  const [eqTemp, setEqTemp] = useState(25);
  const [osmosisLeft, setOsmosisLeft] = useState(0.2);
  const [osmosisRight, setOsmosisRight] = useState(1.0);
  const [flameElement, setFlameElement] = useState("Na");
  const [stoichEquation, setStoichEquation] = useState("N2 + H2 -> NH3");
  const [stoichMoles, setStoichMoles] = useState(2);
  const [c1, setC1] = useState(1);
  const [v1, setV1] = useState(25);
  const [c2, setC2] = useState(0.1);
  const [ka, setKa] = useState(1.8e-5);
  const [gasP, setGasP] = useState(1);
  const [gasV, setGasV] = useState(22.4);
  const [gasT, setGasT] = useState(273.15);
  const [empRows, setEmpRows] = useState([
    { symbol: "C", percent: 40 },
    { symbol: "H", percent: 6.7 },
    { symbol: "O", percent: 53.3 },
  ]);
  const [oxidFormula, setOxidFormula] = useState("H2SO4");
  const [configAtomicNumber, setConfigAtomicNumber] = useState(8);
  const [hessA, setHessA] = useState(-286);
  const [hessB, setHessB] = useState(44);
  const [hessEquation, setHessEquation] = useState("CH4 + O2 -> CO2 + H2O");
  const [molality, setMolality] = useState(1);
  const [unitCellType, setUnitCellType] = useState("FCC");
  const [unitCellA, setUnitCellA] = useState(400);
  const [unitCellDensity, setUnitCellDensity] = useState(8.96);
  const [unitCellMolarMass, setUnitCellMolarMass] = useState(63.55);
  const [unitCellZInput, setUnitCellZInput] = useState(4);
  const [defectCrystalType, setDefectCrystalType] = useState("ionic");
  const [dopingType, setDopingType] = useState("n");
  const [freundlichK, setFreundlichK] = useState(1.2);
  const [freundlichN, setFreundlichN] = useState(2);
  const [langmuirA, setLangmuirA] = useState(4);
  const [langmuirB, setLangmuirB] = useState(0.8);
  const [adsorptionMode, setAdsorptionMode] = useState("physisorption");
  const [surfaceMode, setSurfaceMode] = useState("isotherms");
  const [surfaceColloid, setSurfaceColloid] = useState("gold-sol");
  const [surfaceCounterCharge, setSurfaceCounterCharge] = useState(2);
  const [surfaceElectrolyteConc, setSurfaceElectrolyteConc] = useState(0.01);
  const [surfaceCatalystTemp, setSurfaceCatalystTemp] = useState(450);
  const [surfaceCatalystArea, setSurfaceCatalystArea] = useState(60);
  const [surfaceCatalystCase, setSurfaceCatalystCase] = useState(
    surfaceCatalystCases[0].process,
  );
  const [surfaceEmulsifier, setSurfaceEmulsifier] = useState(55);
  const [surfaceSurfactantConc, setSurfaceSurfactantConc] = useState(1.4);
  const [surfacePracticeIndex, setSurfacePracticeIndex] = useState(0);
  const [organicBankMode, setOrganicBankMode] = useState("transformations");
  const [organicTransformation, setOrganicTransformation] =
    useState("alkene-alcohol");
  const [organicRearrangement, setOrganicRearrangement] = useState(
    "Hydride or methyl shift",
  );
  const [organicDrill, setOrganicDrill] = useState("acetophenone");
  const [organicPromptIndex, setOrganicPromptIndex] = useState(0);
  const [namedReactionSearch, setNamedReactionSearch] = useState("");
  const [namedReactionCategory, setNamedReactionCategory] = useState("All");
  const [namedReactionTrack, setNamedReactionTrack] = useState("All");
  const [selectedFunctionalTest, setSelectedFunctionalTest] = useState(
    functionalTestData[0].name,
  );
  const [functionalQuizIndex, setFunctionalQuizIndex] = useState(0);
  const [functionalQuizAnswer, setFunctionalQuizAnswer] = useState("");
  const [analyticalMode, setAnalyticalMode] = useState("gravimetry");
  const [gravimetricAnalyte, setGravimetricAnalyte] = useState("chloride");
  const [gravSampleMl, setGravSampleMl] = useState(100);
  const [gravPrecipMass, setGravPrecipMass] = useState(0.287);
  const [volumetricMethod, setVolumetricMethod] = useState("complexometric");
  const [volTitrantM, setVolTitrantM] = useState(0.01);
  const [volTitrantMl, setVolTitrantMl] = useState(12.5);
  const [volBlankMl, setVolBlankMl] = useState(25);
  const [volAliquotMl, setVolAliquotMl] = useState(50);
  const [volSampleMass, setVolSampleMass] = useState(0.25);
  const [unknownAbsorbance, setUnknownAbsorbance] = useState(0.335);
  const [dilutionFactor, setDilutionFactor] = useState(10);
  const [chromSample, setChromSample] = useState("analgesic");
  const [chromPeakWidth, setChromPeakWidth] = useState(0.42);
  const [analyticalRecovery, setAnalyticalRecovery] = useState(98);
  const [analyticalRsd, setAnalyticalRsd] = useState(1.8);
  const [analyticalNoiseAbs, setAnalyticalNoiseAbs] = useState(0.006);
  const [analyticalPracticeIndex, setAnalyticalPracticeIndex] = useState(0);
  const [isomerFormula, setIsomerFormula] = useState("C4H10");
  const [reactivityMetal, setReactivityMetal] = useState("Zn");
  const [reactivitySalt, setReactivitySalt] = useState("CuSO4");
  const [reactivityMode, setReactivityMode] = useState("salt");
  const [quantumN, setQuantumN] = useState(2);
  const [quantumL, setQuantumL] = useState(1);
  const [quantumMl, setQuantumMl] = useState(0);
  const [quantumMs, setQuantumMs] = useState("1/2");
  const [deBroglieMass, setDeBroglieMass] = useState(9.11e-31);
  const [deBroglieVelocity, setDeBroglieVelocity] = useState(2.2e6);
  const [uncertaintyDx, setUncertaintyDx] = useState(1e-10);
  const [photoFrequency, setPhotoFrequency] = useState(8e14);
  const [photoWorkFunction, setPhotoWorkFunction] = useState(2.3);
  const [gibbsDeltaH, setGibbsDeltaH] = useState(-40);
  const [gibbsDeltaS, setGibbsDeltaS] = useState(-80);
  const [gibbsTemp, setGibbsTemp] = useState(298);
  const [kirchhoffH1, setKirchhoffH1] = useState(-100);
  const [kirchhoffT1, setKirchhoffT1] = useState(298);
  const [kirchhoffT2, setKirchhoffT2] = useState(500);
  const [kirchhoffCp, setKirchhoffCp] = useState(24);
  const [environmentTab, setEnvironmentTab] = useState("Ozone");
  const [waterCaMgL, setWaterCaMgL] = useState(48);
  const [waterMgMgL, setWaterMgMgL] = useState(18);
  const [bodInitialDo, setBodInitialDo] = useState(8.6);
  const [bodFinalDo, setBodFinalDo] = useState(4.2);
  const [bodDilutionFactor, setBodDilutionFactor] = useState(2);
  const [codBlankMl, setCodBlankMl] = useState(12.6);
  const [codSampleMl, setCodSampleMl] = useState(7.8);
  const [codNormality, setCodNormality] = useState(0.1);
  const [codAliquotMl, setCodAliquotMl] = useState(50);
  const [phosphateMgL, setPhosphateMgL] = useState(0.18);
  const [nitrateMgL, setNitrateMgL] = useState(7);
  const [treatmentMethod, setTreatmentMethod] = useState("Secondary treatment");
  const [cftGeometry, setCftGeometry] = useState("Octahedral");
  const [cftElectrons, setCftElectrons] = useState(6);
  const [cftField, setCftField] = useState("strong");
  const [cftDelta, setCftDelta] = useState(2.1);
  const [metallurgyMetal, setMetallurgyMetal] = useState("Fe");
  const [metallurgyStep, setMetallurgyStep] = useState(0);
  const [saltAnalysisSample, setSaltAnalysisSample] = useState("NaCl");
  const [saltWorkflowStage, setSaltWorkflowStage] = useState("preliminary");
  const [saltCationTest, setSaltCationTest] = useState("Na");
  const [saltAnionTest, setSaltAnionTest] = useState("Cl");
  const [saltReagentStep, setSaltReagentStep] = useState(0);
  const [saltVivaIndex, setSaltVivaIndex] = useState(0);
  const [pblockGroup, setPblockGroup] = useState("Group 15");
  const [bioMedicalStage, setBioMedicalStage] = useState(0);
  const [language, setLanguage] = useLocalStorage("cu-language", "en");
  const [teacherMode, setTeacherMode] = useLocalStorage(
    "cu-teacher-mode",
    false,
  );
  const [savedFilters, setSavedFilters] = useLocalStorage(
    "cu-saved-filters",
    [],
  );
  const [achievements, setAchievements] = useLocalStorage("cu-achievements", [
    "Explorer",
  ]);
  const [conceptQuestion, setConceptQuestion] = useState(
    "Why does electronegativity increase across a period?",
  );
  const [guidedMode, setGuidedMode] = useLocalStorage(
    "cu-lab-guided-mode",
    true,
  );
  const [learningMode, setLearningMode] = useLocalStorage(
    "cu-lab-learning-mode",
    true,
  );
  const [completedExperiments, setCompletedExperiments] = useLocalStorage(
    "cu-lab-completed",
    [],
  );
  const [activeLabTab, setActiveLabTab] = useState("Start Here");
  const [activeFocusTopic, setActiveFocusTopic] = useState(
    initialFocusTopic || "all",
  );
  const [labSearch, setLabSearch] = useState("");
  const [showLabSearchSuggestions, setShowLabSearchSuggestions] =
    useState(false);
  const [labTypeFilter, setLabTypeFilter] = useState("All");
  const [labDifficultyFilter, setLabDifficultyFilter] = useState("All");
  const [activeExperimentId, setActiveExperimentId] = useState(
    initialExperimentId || "titration",
  );
  const [showAdvancedLab, setShowAdvancedLab] = useState(false);
  const [focusLab, setFocusLab] = useState(false);
  const [experimentStarted, setExperimentStarted] = useState(false);
  const [studentPractice, setStudentPractice] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [activeSyllabusFilter, setActiveSyllabusFilter] = useState("all");
  const [completedSteps, setCompletedSteps] = useLocalStorage(
    "cu-lab-step-checks",
    {},
  );
  const [labNotes, setLabNotes] = useLocalStorage("cu-lab-notes", {});
  const [compareSnapshots, setCompareSnapshots] = useLocalStorage(
    "cu-lab-compare-snapshots",
    {},
  );
  const [bookmarkedLabs, setBookmarkedLabs] = useLocalStorage(
    "cu-lab-bookmarks",
    [],
  );
  const [recentLabIds, setRecentLabIds] = useLocalStorage("cu-lab-recent", []);
  const [lastExampleChips, setLastExampleChips] = useLocalStorage(
    "cu-lab-last-examples",
    [],
  );
  const [showTheoryDetails, setShowTheoryDetails] = useLocalStorage(
    "cu-lab-theory-open",
    true,
  );
  const [showFormulaDetails, setShowFormulaDetails] = useLocalStorage(
    "cu-lab-formula-open",
    true,
  );
  const [copiedLabAction, setCopiedLabAction] = useState("");
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);
  const [atlasIndex, setAtlasIndex] = useState(0);
  const [atlasScale, setAtlasScale] = useState("All");
  const [atlasTime, setAtlasTime] = useState("All");
  const [atlasProcess, setAtlasProcess] = useState("All");

  const selected =
    elements.find((el) => el.symbol === selectedSymbol) || elements[5];
  const second =
    elements.find((el) => el.symbol === secondSymbol) || elements[7];
  const cat = getCategoryInfo(selected.category);
  const enriched = elementEnrichment(selected);
  const isotopes = likelyIsotopes(selected);
  const configParts = electronConfigParts(selected.electronConfiguration);
  const parsed = parseFormula(formulaInput);
  const mass = molarMass(formulaInput);
  const bondPrediction = classifyBond(bondA, bondB);
  const selectedMolecules = ALL_MOLECULES.filter((m) =>
    m.atoms.some((a) => a.element === selected.symbol),
  ).slice(0, 8);
  const formulaSuggestions = useMemo(() => {
    const query = normalizeFormulaText(formulaInput).toLowerCase();
    if (!query) return [];
    return ALL_MOLECULES.filter((molecule) =>
      normalizeFormulaText(molecule.formula).toLowerCase().startsWith(query),
    ).slice(0, 6);
  }, [formulaInput]);
  const lewis =
    elements.find((el) => el.symbol === lewisElement) || elements[7];
  const lewisDots = lewis.shells?.at(-1) || 0;
  const compound = buildIonicFormula(cation, anion);
  const decayRemaining = 100 / 2 ** decayHalfLives;
  const titration = strongAcidStrongBaseTitration(0.1, 25, 0.1, titrationMl);
  const ph = titration.pH;
  const latticeInfo = crystalLattices[lattice];
  const vsepr = vseprFromDomains(bondedAtoms, lonePairs);
  const geometry = geometryData[vsepr.shape] || geometryData.linear;
  const lewisInfo = lewisAssessment(lewisElement);
  const balanced = balanceEquation(equationInput);
  const electrolysis = electrolysisProducts(electrolyte);
  const reaction = reactionLibrary[reactionKey];
  const rateK = rateConc * Math.exp((rateTemp - 25) / 18);
  const ratePoints = Array.from({ length: 12 }, (_, i) => {
    const t = i / 2;
    return { x: 10 + i * 20, y: 82 - 65 * (1 - Math.exp((-rateK * t) / 8)) };
  });
  const waterMass = 100;
  const metalSpecificHeat = 0.385;
  const finalTemp =
    (metalMass * metalSpecificHeat * metalTemp + waterMass * 4.184 * 22) /
    (metalMass * metalSpecificHeat + waterMass * 4.184);
  const selectedSalt = kspData[salt];
  const ionConcentration = saltAdded / 0.1;
  const ionProduct =
    selectedSalt.ions === 2 ? ionConcentration ** 2 : 4 * ionConcentration ** 3;
  const precipitates = ionProduct > selectedSalt.ksp;
  const corrosion =
    reductionPotentials[metalA] < reductionPotentials[metalB] ? metalA : metalB;
  const cellVoltage = Math.abs(
    reductionPotentials[metalA] - reductionPotentials[metalB],
  );
  const electrochemicalCell = buildElectrochemicalCell(
    anodeHalf,
    cathodeHalf,
    cellMode,
  );
  const yeastActivity = Math.max(0, 100 - Math.abs(yeastTemp - 32) * 4);
  const bufferPh =
    4.76 +
    Math.log10(
      Math.max(0.01, (0.1 - bufferAdded / 100) / (0.1 + bufferAdded / 100)),
    );
  const pureWaterPh = Math.max(
    1,
    Math.min(
      14,
      bufferAdded >= 0 ? 7 - bufferAdded * 1.7 : 7 - bufferAdded * 2.2,
    ),
  );
  const solubilityAtTemp = 12 + recrystTemp * 0.9;
  const supersaturation = Math.max(0, 80 - solubilityAtTemp);
  const orbital = orbitalMeta[orbitalType];
  const polarity = classifyBond(polarityA, polarityB);
  const mechanismSteps = mechanismData[mechanism];
  const phase = phaseAt(phaseTemp, phasePressure);
  const mo = moData[moMolecule];
  const selectedNuclearSeries =
    nuclearSeriesTemplates[nuclearSeries] || nuclearSeriesTemplates["u-238"];
  const nuclearSeriesRows = selectedNuclearSeries.steps
    .slice(0, nuclearSeriesSteps)
    .reduce(
      (rows, modeId, index) => {
        const previous = rows[rows.length - 1];
        const modeInfo = nuclearDecayModes[modeId];
        rows.push({
          step: index + 1,
          mode: modeInfo.label,
          symbol: previous.symbol,
          a: previous.a + modeInfo.deltaA,
          z: previous.z + modeInfo.deltaZ,
          emitted: modeInfo.symbol,
        });
        return rows;
      },
      [
        {
          step: 0,
          mode: "Parent",
          symbol: selectedNuclearSeries.start.symbol,
          a: selectedNuclearSeries.start.a,
          z: selectedNuclearSeries.start.z,
          emitted: "-",
        },
      ],
    );
  const nuclearSeriesProduct = nuclearSeriesRows[nuclearSeriesRows.length - 1];
  const selectedNuclearEquation =
    nuclearEquationPrompts.find((item) => item.id === nuclearEquationId) ||
    nuclearEquationPrompts[0];
  const selectedBindingIso =
    nuclearBindingIsotopes[nuclearBindingIso] ||
    nuclearBindingIsotopes["fe-56"];
  const separatedNucleonMass =
    selectedBindingIso.z * PROTON_MASS_U +
    selectedBindingIso.n * NEUTRON_MASS_U;
  const massDefect = separatedNucleonMass - selectedBindingIso.mass;
  const bindingEnergy = massDefect * U_TO_MEV;
  const bindingPerNucleon =
    bindingEnergy / Math.max(1, selectedBindingIso.z + selectedBindingIso.n);
  const selectedEnergeticCase =
    nuclearEnergeticExamples[nuclearEnergeticCase] ||
    nuclearEnergeticExamples.fission;
  const energeticMassDefect = Math.max(
    0,
    selectedEnergeticCase.reactantsMass - selectedEnergeticCase.productsMass,
  );
  const energeticMev = energeticMassDefect * U_TO_MEV;
  const energeticJoulePerEvent = energeticMev * 1.60218e-13;
  const selectedShield =
    shieldingMaterials[shieldMaterial] || shieldingMaterials.lead;
  const hvl = selectedShield.hvl[radiationType] || selectedShield.hvl.gamma;
  const transmittedFraction =
    100 / 2 ** (shieldThickness / Math.max(0.001, hvl));
  const doseEquivalent =
    absorbedDose * (radiationWeighting[radiationType] || 1);
  const simTitration = strongAcidStrongBaseTitration(
    0.1,
    25,
    0.1,
    simTitrationDrops * 0.05,
  );
  const probePh = {
    water: 7,
    vinegar: 2.8,
    ammonia: 11.2,
    cola: 2.5,
    soap: 10.5,
  }[probeSolution];
  const eqShift =
    eqReactant > 1
      ? "shifts toward products"
      : eqReactant < 1
        ? "shifts toward reactants"
        : eqTemp > 40
          ? "temperature shift depends on reaction heat"
          : "near equilibrium";
  const osmoticFlow =
    osmosisRight > osmosisLeft
      ? "water flows right"
      : osmosisRight < osmosisLeft
        ? "water flows left"
        : "no net flow";
  const stoichBalanced = balanceEquation(stoichEquation);
  const dilutionV2 = (c1 * v1) / Math.max(0.0001, c2);
  const weakAcidPh = -Math.log10(Math.sqrt(ka * 0.1));
  const gasN = (gasP * gasV) / (0.082057 * gasT);
  const configElement =
    elements.find((e) => e.atomicNumber === Number(configAtomicNumber)) ||
    elements[7];
  const configFill = electronConfigParts(configElement.electronConfiguration);
  const deltaH = Number(hessA) + Number(hessB);
  const hessResult = calculateReactionEnthalpy(hessEquation);
  const boilingElevation = 0.512 * molality;
  const freezingDepression = 1.86 * molality;
  const selectedUnitCell = unitCellData[unitCellType];
  const unitCellAcm = unitCellA * 1e-10;
  const unitCellCalculatedZ =
    (unitCellDensity * AVOGADRO * unitCellAcm ** 3) /
    Math.max(0.0001, unitCellMolarMass);
  const unitCellCalculatedDensity =
    (unitCellZInput * unitCellMolarMass) /
    (AVOGADRO * Math.max(1e-30, unitCellAcm ** 3));
  const goldNumberExample = 10 / 0.2;
  const selectedSurfaceColloid =
    surfaceColloidSystems[surfaceColloid] || surfaceColloidSystems["gold-sol"];
  const selectedCatalystCase =
    surfaceCatalystCases.find((item) => item.process === surfaceCatalystCase) ||
    surfaceCatalystCases[0];
  const hardySchulzePower =
    surfaceElectrolyteConc * surfaceCounterCharge ** 6 * 100;
  const catalystActivity = Math.min(
    100,
    Math.max(5, surfaceCatalystArea * 0.9 + (surfaceCatalystTemp - 300) * 0.16),
  );
  const emulsionStability = Math.min(
    100,
    Math.max(
      5,
      surfaceEmulsifier * 1.05 - Math.abs(surfaceEmulsifier - 65) * 0.25,
    ),
  );
  const micelleFormed = surfaceSurfactantConc >= 1;
  const selectedTransformation =
    reagentTransformations.find((item) => item.id === organicTransformation) ||
    reagentTransformations[0];
  const selectedRearrangement =
    rearrangementData.find((item) => item.name === organicRearrangement) ||
    rearrangementData[0];
  const selectedSynthesisDrill =
    synthesisDrills.find((item) => item.id === organicDrill) ||
    synthesisDrills[0];
  const activeSurfacePractice =
    surfacePracticeScenarios[
      surfacePracticeIndex % surfacePracticeScenarios.length
    ];
  const activeOrganicPrompt =
    organicQuickPrompts[organicPromptIndex % organicQuickPrompts.length];
  const filteredNamedReactions = namedReactionData.filter((reaction) => {
    const query = namedReactionSearch.trim().toLowerCase();
    const matchesQuery =
      !query ||
      [
        reaction.name,
        reaction.equation,
        reaction.conditions,
        reaction.mechanism,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesCategory =
      namedReactionCategory === "All" ||
      reaction.category === namedReactionCategory;
    const matchesTrack =
      namedReactionTrack === "All" ||
      reaction.level.includes(namedReactionTrack);
    return matchesQuery && matchesCategory && matchesTrack;
  });
  const selectedTest =
    functionalTestData.find((test) => test.name === selectedFunctionalTest) ||
    functionalTestData[0];
  const activeFunctionalQuiz =
    functionalQuizData[functionalQuizIndex % functionalQuizData.length];
  const functionalQuizCorrect =
    functionalQuizAnswer &&
    functionalQuizAnswer === activeFunctionalQuiz.answer;
  const selectedGravimetricMethod =
    gravimetricMethods[gravimetricAnalyte] || gravimetricMethods.chloride;
  const gravAnalyteMassG = gravPrecipMass * selectedGravimetricMethod.factor;
  const gravMgPerL =
    (gravAnalyteMassG * 1000) / Math.max(0.001, gravSampleMl / 1000);
  const selectedVolumetricMethod =
    volumetricMethods[volumetricMethod] || volumetricMethods.complexometric;
  const volumetricMoles = volTitrantM * (volTitrantMl / 1000);
  const volumetricBlankMoles =
    volTitrantM * (Math.max(0, volBlankMl - volTitrantMl) / 1000);
  const volumetricResult = (() => {
    if (volumetricMethod === "direct-acid-base")
      return volumetricMoles / Math.max(0.0001, volAliquotMl / 1000);
    if (volumetricMethod === "back-titration")
      return (
        ((volumetricBlankMoles * selectedVolumetricMethod.factor) /
          Math.max(0.0001, volSampleMass)) *
        100
      );
    if (volumetricMethod === "complexometric")
      return (
        (volumetricMoles * selectedVolumetricMethod.factor) /
        Math.max(0.001, volAliquotMl)
      );
    return volumetricMoles * selectedVolumetricMethod.factor * 1000;
  })();
  const calN = calibrationStandards.length;
  const calMeanX =
    calibrationStandards.reduce((sum, point) => sum + point.c, 0) / calN;
  const calMeanY =
    calibrationStandards.reduce((sum, point) => sum + point.a, 0) / calN;
  const calSlope =
    calibrationStandards.reduce(
      (sum, point) => sum + (point.c - calMeanX) * (point.a - calMeanY),
      0,
    ) /
    calibrationStandards.reduce(
      (sum, point) => sum + (point.c - calMeanX) ** 2,
      0,
    );
  const calIntercept = calMeanY - calSlope * calMeanX;
  const calSst = calibrationStandards.reduce(
    (sum, point) => sum + (point.a - calMeanY) ** 2,
    0,
  );
  const calSse = calibrationStandards.reduce(
    (sum, point) => sum + (point.a - (calSlope * point.c + calIntercept)) ** 2,
    0,
  );
  const calR2 = 1 - calSse / Math.max(1e-12, calSst);
  const calLod = (3.3 * analyticalNoiseAbs) / Math.max(1e-6, calSlope);
  const calLoq = (10 * analyticalNoiseAbs) / Math.max(1e-6, calSlope);
  const unknownConcentration = Math.max(
    0,
    (unknownAbsorbance - calIntercept) / calSlope,
  );
  const finalUnknownConcentration = unknownConcentration * dilutionFactor;
  const recoveryCorrectedConcentration =
    finalUnknownConcentration / Math.max(0.01, analyticalRecovery / 100);
  const selectedChromatography =
    chromatographySamples[chromSample] || chromatographySamples.analgesic;
  const chromRfRows = selectedChromatography.spots.map((spot, index, spots) => {
    const nextSpot = spots[index + 1];
    const rf = spot.distance / selectedChromatography.solventFront;
    const resolution = nextSpot
      ? (2 * Math.abs(nextSpot.distance - spot.distance)) /
        Math.max(0.01, chromPeakWidth * 2)
      : null;
    return { ...spot, rf, resolution };
  });
  const chromMinResolution = Math.min(
    ...chromRfRows
      .map((row) => row.resolution)
      .filter((value) => value !== null),
  );
  const theoreticalPlates =
    16 *
    (selectedChromatography.solventFront / Math.max(0.01, chromPeakWidth)) ** 2;
  const activeAnalyticalPractice =
    analyticalPracticeScenarios[
      analyticalPracticeIndex % analyticalPracticeScenarios.length
    ];
  const structuralIsomers =
    structuralIsomerData[isomerFormula.replace(/\s/g, "")] || [];
  const selectedReactivityMetal =
    reactivityMetals.find((metal) => metal.symbol === reactivityMetal) ||
    reactivityMetals[5];
  const selectedSaltSolution =
    saltSolutions.find((solution) => solution.salt === reactivitySalt) ||
    saltSolutions[2];
  const saltMetal =
    reactivityMetals.find(
      (metal) => metal.symbol === selectedSaltSolution.metal,
    ) || reactivityMetals[11];
  const displacementHappens = selectedReactivityMetal.rank > saltMetal.rank;
  const acidReactionHappens =
    selectedReactivityMetal.rank >
    (reactivityMetals.find((metal) => metal.symbol === "H")?.rank || 4);
  const waterReactionHappens = ["K", "Na", "Ca"].includes(reactivityMetal);
  const reactivityEquation =
    reactivityMode === "salt"
      ? displacementHappens
        ? `${reactivityMetal} + ${reactivitySalt} -> ${selectedReactivityMetal.symbol} salt + ${selectedSaltSolution.metal}`
        : `${reactivityMetal} + ${reactivitySalt} -> no reaction`
      : reactivityMode === "water"
        ? waterReactionHappens
          ? `${reactivityMetal} + H2O -> ${reactivityMetal}OH / hydroxide + H2`
          : `${reactivityMetal} + cold water -> no vigorous reaction`
        : acidReactionHappens
          ? `${reactivityMetal} + dilute HCl -> ${reactivityMetal}Cl salt + H2`
          : `${reactivityMetal} + dilute HCl -> no reaction`;
  const quantumValid =
    quantumL >= 0 &&
    quantumL < quantumN &&
    quantumMl >= -quantumL &&
    quantumMl <= quantumL;
  const quantumOrbital = `${quantumN}${quantumOrbitalLetters[quantumL] || "?"}`;
  const subshellCapacity = 2 * (2 * quantumL + 1);
  const deBroglieLambda =
    PLANCK / Math.max(1e-40, deBroglieMass * deBroglieVelocity);
  const minMomentumUncertainty =
    PLANCK / (4 * Math.PI * Math.max(1e-30, uncertaintyDx));
  const photoEnergyEv = (PLANCK * photoFrequency) / ELECTRON_VOLT;
  const photoKE = photoEnergyEv - photoWorkFunction;
  const gibbsValue = gibbsDeltaH - gibbsTemp * (gibbsDeltaS / 1000);
  const gibbsK = Math.exp((-gibbsValue * 1000) / (GAS_R * gibbsTemp));
  const gibbsCrossover =
    gibbsDeltaS === 0 ? null : gibbsDeltaH / (gibbsDeltaS / 1000);
  const kirchhoffH2 =
    kirchhoffH1 + (kirchhoffCp / 1000) * (kirchhoffT2 - kirchhoffT1);
  const hardnessAsCaCO3 = waterCaMgL * 2.497 + waterMgMgL * 4.118;
  const hardnessClass =
    hardnessAsCaCO3 < 75
      ? "soft"
      : hardnessAsCaCO3 < 150
        ? "moderately hard"
        : hardnessAsCaCO3 < 300
          ? "hard"
          : "very hard";
  const bodValue = Math.max(0, (bodInitialDo - bodFinalDo) * bodDilutionFactor);
  const codValue = Math.max(
    0,
    ((codBlankMl - codSampleMl) * codNormality * 8000) /
      Math.max(0.1, codAliquotMl),
  );
  const eutrophicationRisk = Math.min(100, phosphateMgL * 220 + nitrateMgL * 4);
  const eutrophicationLabel =
    eutrophicationRisk < 30
      ? "low"
      : eutrophicationRisk < 65
        ? "moderate"
        : "high";
  const selectedTreatmentMethod =
    pollutantTreatmentMethods.find((item) => item.method === treatmentMethod) ||
    pollutantTreatmentMethods[1];
  const cftFilled = fillCftLevels(cftGeometry, cftElectrons, cftField);
  const cftMoment = Math.sqrt(cftFilled.unpaired * (cftFilled.unpaired + 2));
  const cftWavelength = 1240 / Math.max(0.1, cftDelta);
  const cftAbsorbed =
    cftWavelength < 450
      ? "violet-blue"
      : cftWavelength < 500
        ? "blue-green"
        : cftWavelength < 570
          ? "green-yellow"
          : cftWavelength < 620
            ? "orange"
            : "red";
  const cftComplement =
    cftWavelength < 450
      ? "#facc15"
      : cftWavelength < 500
        ? "#ef4444"
        : cftWavelength < 570
          ? "#a855f7"
          : cftWavelength < 620
            ? "#2563eb"
            : "#14b8a6";
  const selectedMetallurgy =
    metallurgyData[metallurgyMetal] || metallurgyData.Fe;
  const activeMetallurgyStep =
    selectedMetallurgy[metallurgyStep] || selectedMetallurgy[0];
  const activeSaltUnknown =
    saltUnknowns[saltAnalysisSample] || saltUnknowns.NaCl;
  const expectedSaltCation =
    cationSeparationData[activeSaltUnknown.cation] || cationSeparationData.Na;
  const expectedSaltAnion =
    anionConfirmatoryData[activeSaltUnknown.anion] || anionConfirmatoryData.Cl;
  const selectedSaltCationTest =
    cationSeparationData[saltCationTest] || expectedSaltCation;
  const selectedSaltAnionTest =
    anionConfirmatoryData[saltAnionTest] || expectedSaltAnion;
  const saltCationMatch = selectedSaltCationTest.ion === expectedSaltCation.ion;
  const saltAnionMatch = selectedSaltAnionTest.ion === expectedSaltAnion.ion;
  const saltSequence = [
    ["1", "Preliminary observation", activeSaltUnknown.appearance],
    [
      "2",
      "Dry heat / solubility / flame",
      `${activeSaltUnknown.dryHeat} Flame: ${activeSaltUnknown.flame}.`,
    ],
    [
      "3",
      "Anion group test",
      `${expectedSaltAnion.reagent}: ${expectedSaltAnion.observation}`,
    ],
    [
      "4",
      "Cation group separation",
      `${expectedSaltCation.reagent}: ${expectedSaltCation.observation}`,
    ],
    [
      "5",
      "Confirmatory test",
      `${expectedSaltCation.confirm} Also confirm ${expectedSaltAnion.ion}: ${expectedSaltAnion.confirm}`,
    ],
  ];
  const activeSaltSequenceStep =
    saltSequence[Math.min(saltReagentStep, saltSequence.length - 1)];
  const saltInterferenceAlerts = [
    activeSaltUnknown.cation === "NH4"
      ? "Test NH4+ before using NH4Cl, NH4OH, or (NH4)2CO3 group reagents."
      : "",
    ["CO3", "S"].includes(activeSaltUnknown.anion)
      ? `${expectedSaltAnion.ion} can interfere with cation separation; remove/confirm anion before group reagents.`
      : "",
    ["Cl", "Br", "I"].includes(activeSaltUnknown.anion)
      ? "Use dilute HNO3 before AgNO3; HCl would add chloride and spoil the halide test."
      : "",
    expectedSaltCation.group === "I"
      ? "Remove Group I precipitate completely before passing H2S for Group II."
      : "",
  ].filter(Boolean);

  const timeline = useMemo(
    () =>
      elements
        .filter((el) => el.yearDiscovered)
        .sort((a, b) => a.yearDiscovered - b.yearDiscovered)
        .filter((_, i) => i % 4 === 0)
        .slice(0, 24),
    [],
  );

  const speak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(
      new SpeechSynthesisUtterance(`${selected.name}. ${selected.summary}`),
    );
    setAchievements((a) =>
      a.includes("Audio Learner") ? a : [...a, "Audio Learner"],
    );
  };

  const saveCurrentFilter = () => {
    const filter = `${selected.category} / Period ${selected.period}`;
    setSavedFilters((filters) =>
      filters.includes(filter) ? filters : [filter, ...filters].slice(0, 6),
    );
  };

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ selected, isotopes, enriched, mass, parsed }, null, 2)],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected.symbol}-chemistry-lab.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const conceptAnswer = conceptQuestion
    .toLowerCase()
    .includes("electronegativity")
    ? "Across a period, nuclear charge rises while shielding changes only modestly, so atoms pull bonding electrons more strongly."
    : conceptQuestion.toLowerCase().includes("isotope")
      ? "Isotopes are atoms of the same element with the same proton count but different neutron counts, so their masses differ."
      : "Use atomic number for protons, shell data for Bohr-style structure, and category/phase to predict broad behavior.";

  const recommendedPath = LAB_EXPERIMENTS.filter((item) =>
    [
      "titration",
      "molar-mass",
      "bohr",
      "bond-predictor",
      "equation-balancer",
      "ph-meter",
    ].includes(item.id),
  );
  const labSearchSuggestions = useMemo(() => {
    const query = labSearch.trim().toLowerCase();
    const matches = LAB_EXPERIMENTS.filter((item) => {
      if (!query) return true;
      return [item.title, item.topic, item.type, item.difficulty, item.teaches]
        .join(" ")
        .toLowerCase()
        .includes(query);
    }).slice(0, 8);
    const topics = [...new Set(LAB_EXPERIMENTS.map((item) => item.topic))]
      .filter((topic) => !query || topic.toLowerCase().includes(query))
      .slice(0, 4);
    return { matches, topics };
  }, [labSearch]);
  const visibleExperiments = LAB_EXPERIMENTS.filter((item) => {
    const query = labSearch.trim().toLowerCase();
    const itemTags = getSyllabusTagsForLab(item.id);
    const focusMap = {
      beginner: item.difficulty === "Beginner",
      matter: itemTags.units.some((unit) =>
        ["matter", "practical"].includes(unit),
      ),
      atoms: itemTags.units.some((unit) =>
        ["atoms", "periodic", "inorganic"].includes(unit),
      ),
      bonding: itemTags.units.some((unit) =>
        ["bonding", "coordination"].includes(unit),
      ),
      reactions: itemTags.units.some((unit) =>
        [
          "reactions",
          "thermo",
          "equilibrium",
          "electrochem",
          "kinetics",
        ].includes(unit),
      ),
      solutions: itemTags.units.some((unit) =>
        ["acidBase", "solutions"].includes(unit),
      ),
      analytical:
        item.id === "analytical-lab" ||
        itemTags.units.some((unit) =>
          ["practical", "clinical", "pharmaceutical"].includes(unit),
        ) ||
        [
          "chromatography",
          "titration",
          "solubility",
          "salt-analysis",
          "pharma-analysis",
          "diagnostic-color-tests",
        ].includes(item.id),
      inorganic:
        itemTags.units.some((unit) =>
          ["inorganic", "coordination", "periodic", "atoms"].includes(unit),
        ) ||
        [
          "salt-analysis",
          "pblock-advanced",
          "cft",
          "metallurgy",
          "unit-cell",
          "crystal-defects",
          "crystal-structure",
          "reactivity-series",
          "molecule-links",
        ].includes(item.id),
      organic: itemTags.units.some((unit) =>
        ["organicBasics", "organicAdvanced", "biomolecules"].includes(unit),
      ),
      bio:
        itemTags.units.includes("biomolecules") ||
        [
          "enzyme-kinetics",
          "amino-acid-pi",
          "protein-structure",
          "carbohydrate-lab",
          "lipid-membrane",
          "nucleic-acid-lab",
          "vitamin-coenzyme-map",
          "metabolism-atp",
        ].includes(item.id),
      pharma:
        itemTags.units.includes("pharmaceutical") ||
        itemTags.tracks.includes("pharma"),
      medical: itemTags.units.some((unit) =>
        ["biomolecules", "pharmaceutical", "clinical"].includes(unit),
      ),
      all: true,
    };
    const matchesSearch =
      !query ||
      [item.title, item.topic, item.type, item.difficulty, item.teaches]
        .join(" ")
        .toLowerCase()
        .includes(query);
    const matchesFocus = activeFocusTopic
      ? (focusMap[activeFocusTopic] ?? true)
      : false;
    const matchesTab =
      activeLabTab === "Start Here" || item.tab === activeLabTab;
    const matchesType = labTypeFilter === "All" || item.type === labTypeFilter;
    const matchesDifficulty =
      labDifficultyFilter === "All" || item.difficulty === labDifficultyFilter;
    const matchesSyllabus =
      activeSyllabusFilter === "all" ||
      itemTags.tracks.includes(activeSyllabusFilter);
    return (
      matchesSearch &&
      matchesFocus &&
      matchesTab &&
      matchesType &&
      matchesDifficulty &&
      matchesSyllabus
    );
  });
  const activeExperiment =
    LAB_EXPERIMENTS.find((item) => item.id === activeExperimentId) ||
    LAB_EXPERIMENTS[0];
  const isVisualAtlas = initialExperimentId === "molecule-links";
  const atlasVisibleItems = visualAtlasItems.filter((item) => {
    const scaleMatch =
      atlasScale === "All" ||
      (atlasScale === "Molecular" &&
        ["Organic", "Biochemistry", "Pharmaceutical"].includes(item.world)) ||
      (atlasScale === "Mesoscale" && item.world === "Inorganic") ||
      (atlasScale === "Macroscopic" && item.world === "Physical");
    const timeMatch =
      atlasTime === "All" ||
      (atlasTime === "Dynamic" &&
        !item.title.includes("Benzene") &&
        !item.title.includes("Zeolite")) ||
      (atlasTime === "Static" &&
        (item.title.includes("Benzene") || item.title.includes("Zeolite")));
    const processMatch =
      atlasProcess === "All" ||
      (atlasProcess === "Reaction" &&
        ["Organic", "Physical"].includes(item.world)) ||
      (atlasProcess === "Structure" &&
        ["Inorganic", "Biochemistry"].includes(item.world)) ||
      (atlasProcess === "Application" && item.world === "Pharmaceutical");
    return scaleMatch && timeMatch && processMatch;
  });
  const activeAtlasItem =
    atlasVisibleItems[atlasIndex % Math.max(1, atlasVisibleItems.length)] ||
    visualAtlasItems[0];
  const ActiveExperimentIcon = activeExperiment.icon;
  const activeSyllabusTags = getSyllabusTagsForLab(activeExperiment.id);
  const activeStepsDone = completedSteps[activeExperiment.id] || [];
  const categoryCompleteCount = activeFocusTopic
    ? visibleExperiments.filter((item) =>
        completedExperiments.includes(item.id),
      ).length
    : 0;
  const categoryProgress = visibleExperiments.length
    ? Math.round((categoryCompleteCount / visibleExperiments.length) * 100)
    : 0;
  const activeExperimentIndex = LAB_EXPERIMENTS.findIndex(
    (item) => item.id === activeExperiment.id,
  );
  const completedCount = LAB_EXPERIMENTS.filter((item) =>
    completedExperiments.includes(item.id),
  ).length;
  const progressPercent = Math.round(
    (completedCount / LAB_EXPERIMENTS.length) * 100,
  );
  const isActiveComplete = completedExperiments.includes(activeExperiment.id);
  const recentExperiments = recentLabIds
    .map((id) => LAB_EXPERIMENTS.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 6);
  const bookmarkedExperiments = bookmarkedLabs
    .map((id) => LAB_EXPERIMENTS.find((item) => item.id === id))
    .filter(Boolean)
    .slice(0, 6);
  const relatedExperiments = LAB_EXPERIMENTS.filter(
    (item) =>
      item.id !== activeExperiment.id &&
      (item.topic === activeExperiment.topic ||
        item.tab === activeExperiment.tab ||
        item.type === activeExperiment.type),
  ).slice(0, 4);
  const filtersActive = Boolean(
    labSearch ||
    labTypeFilter !== "All" ||
    labDifficultyFilter !== "All" ||
    activeSyllabusFilter !== "all" ||
    (activeFocusTopic && activeFocusTopic !== "all") ||
    activeLabTab !== "Start Here",
  );
  const validationMessage = (() => {
    if (
      (activeExperiment.id === "molar-mass" ||
        activeExperiment.id === "formula-builder") &&
      (!formulaInput.trim() || Object.keys(parsed).length === 0)
    )
      return "Enter a valid chemical formula such as H2O or Ca(OH)2.";
    if (activeExperiment.id === "stoichiometry" && !stoichBalanced.ok)
      return (
        stoichBalanced.error ||
        "Enter a valid equation using -> between reactants and products."
      );
    if (
      activeExperiment.id === "gas-law" &&
      (gasP <= 0 || gasV <= 0 || gasT <= 0)
    )
      return "P, V, and T must all be positive.";
    if (
      activeExperiment.id === "unit-cell" &&
      (unitCellA <= 0 || unitCellMolarMass <= 0)
    )
      return "Edge length and molar mass must be positive.";
    if (activeExperiment.id === "quantum-numbers" && !quantumValid)
      return "Quantum numbers must satisfy l < n and -l <= ml <= l.";
    if (activeExperiment.id === "gibbs" && gibbsTemp <= 0)
      return "Temperature must be greater than 0 K.";
    return "";
  })();
  useEffect(() => {
    setRecentLabIds((ids) =>
      [
        activeExperiment.id,
        ...ids.filter((id) => id !== activeExperiment.id),
      ].slice(0, 8),
    );
  }, [activeExperiment.id, setRecentLabIds]);
  useEffect(() => {
    const nextFocus = initialFocusTopic || "all";
    setActiveFocusTopic(nextFocus);
    setActiveLabTab("Start Here");
    const requestedExperiment = initialExperimentId
      ? LAB_EXPERIMENTS.find((item) => item.id === initialExperimentId)
      : null;
    if (requestedExperiment) {
      setActiveExperimentId(requestedExperiment.id);
      setActiveLabTab(requestedExperiment.tab);
      return;
    }
    if (nextFocus !== "all") {
      const nextExperiment = LAB_EXPERIMENTS.find((item) => {
        const itemTags = getSyllabusTagsForLab(item.id);
        if (nextFocus === "inorganic") {
          return (
            itemTags.units.some((unit) =>
              ["inorganic", "coordination", "periodic", "atoms"].includes(unit),
            ) ||
            [
              "salt-analysis",
              "pblock-advanced",
              "cft",
              "metallurgy",
              "unit-cell",
              "crystal-defects",
              "crystal-structure",
              "reactivity-series",
              "molecule-links",
            ].includes(item.id)
          );
        }
        if (nextFocus === "organic")
          return itemTags.units.some((unit) =>
            ["organicBasics", "organicAdvanced", "biomolecules"].includes(unit),
          );
        if (nextFocus === "analytical")
          return (
            item.id === "analytical-lab" || itemTags.units.includes("practical")
          );
        if (nextFocus === "bio") return itemTags.units.includes("biomolecules");
        if (nextFocus === "pharma")
          return (
            itemTags.units.includes("pharmaceutical") ||
            itemTags.tracks.includes("pharma")
          );
        return false;
      });
      if (nextExperiment) setActiveExperimentId(nextExperiment.id);
    }
  }, [initialExperimentId, initialFocusTopic]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey)
        return;
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      event.preventDefault();
      labSearchRef.current?.focus();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
  const markActiveComplete = () => {
    setCompletedExperiments((items) =>
      items.includes(activeExperiment.id)
        ? items
        : [...items, activeExperiment.id],
    );
  };
  const resetGuidedProgress = () => setCompletedExperiments([]);
  const resetActiveExperiment = () => {
    setExperimentStarted(false);
    setShowQuizAnswer(false);
    setCompletedSteps((items) => ({ ...items, [activeExperiment.id]: [] }));
  };
  const clearLabFilters = () => {
    setLabSearch("");
    setLabTypeFilter("All");
    setLabDifficultyFilter("All");
    setActiveSyllabusFilter("all");
    setActiveFocusTopic("all");
    setActiveLabTab("Start Here");
  };
  const toggleBookmark = (id) => {
    setBookmarkedLabs((ids) =>
      ids.includes(id)
        ? ids.filter((item) => item !== id)
        : [id, ...ids].slice(0, 12),
    );
  };
  const toggleStepDone = (stepIndex) => {
    setCompletedSteps((items) => {
      const current = items[activeExperiment.id] || [];
      const next = current.includes(stepIndex)
        ? current.filter((index) => index !== stepIndex)
        : [...current, stepIndex];
      return { ...items, [activeExperiment.id]: next };
    });
  };
  const activeResultText = () => {
    if (activeExperiment.id === "titration")
      return `pH ${simTitration.pH.toFixed(2)} - ${simTitration.region}`;
    if (activeExperiment.id === "ph-meter")
      return `${probeSolution}: pH ${probePh.toFixed(1)}`;
    if (
      activeExperiment.id === "molar-mass" ||
      activeExperiment.id === "formula-builder"
    )
      return `${formulaInput}: ${mass.toFixed(3)} g/mol`;
    if (activeExperiment.id === "stoichiometry")
      return stoichBalanced.ok ? stoichBalanced.balanced : stoichBalanced.error;
    if (activeExperiment.id === "dilution")
      return `V2 = ${dilutionV2.toFixed(2)} mL`;
    if (activeExperiment.id === "gas-law") return `n = ${gasN.toFixed(3)} mol`;
    if (activeExperiment.id === "vsepr")
      return `${vsepr.shape}, ${geometry.angle}`;
    if (activeExperiment.id === "rate-lab")
      return `Rate factor ${rateK.toFixed(2)}`;
    if (activeExperiment.id === "solubility")
      return precipitates ? "Precipitate forms" : "No precipitate yet";
    if (activeExperiment.id === "salt-analysis")
      return `${saltAnalysisSample}: ${expectedSaltCation.ion} confirmed by ${expectedSaltCation.reagent}; ${expectedSaltAnion.ion} confirmed by ${expectedSaltAnion.reagent}`;
    if (activeExperiment.id === "analytical-lab") {
      if (analyticalMode === "gravimetry")
        return `${selectedGravimetricMethod.analyte}: ${gravMgPerL.toFixed(1)} mg/L by ${selectedGravimetricMethod.precipitate} gravimetry`;
      if (analyticalMode === "volumetric")
        return `${selectedVolumetricMethod.label}: ${volumetricResult.toFixed(volumetricMethod === "direct-acid-base" ? 4 : 2)} ${selectedVolumetricMethod.unit}`;
      if (analyticalMode === "calibration")
        return `Unknown ${finalUnknownConcentration.toFixed(1)} mg/L; R2 ${calR2.toFixed(4)}, LOD ${calLod.toFixed(2)} mg/L`;
      if (analyticalMode === "chromatography")
        return `${selectedChromatography.label}: Rs min ${chromMinResolution.toFixed(2)}, plates approx ${theoreticalPlates.toFixed(0)}`;
      return `Recovery-corrected result ${recoveryCorrectedConcentration.toFixed(1)} mg/L; RSD ${analyticalRsd.toFixed(1)}%.`;
    }
    if (activeExperiment.id === "surface-chemistry-deep")
      return `${selectedSurfaceColloid.name}: Hardy-Schulze index ${hardySchulzePower.toFixed(1)}; micelles ${micelleFormed ? "formed" : "below CMC"}.`;
    if (activeExperiment.id === "organic-reaction-bank")
      return `${selectedTransformation.from} to ${selectedTransformation.to}: ${selectedTransformation.reagents[0]}.`;
    if (activeExperiment.id === "nuclear-chemistry") {
      if (nuclearMode === "binding")
        return `${selectedBindingIso.label}: mass defect ${massDefect.toFixed(4)} u, binding energy ${bindingPerNucleon.toFixed(2)} MeV/nucleon`;
      if (nuclearMode === "energetics")
        return `${selectedEnergeticCase.label}: ${energeticMev.toFixed(1)} MeV released per event`;
      if (nuclearMode === "dose")
        return `${selectedShield.label} transmits ${transmittedFraction.toFixed(2)}%; equivalent dose ${doseEquivalent.toFixed(3)} Sv`;
      if (nuclearMode === "equations")
        return `${selectedNuclearEquation.parent} ${selectedNuclearEquation.decay} -> ${selectedNuclearEquation.answer}`;
      return `${selectedNuclearSeries.name}: after ${nuclearSeriesSteps} step(s), A=${nuclearSeriesProduct.a}, Z=${nuclearSeriesProduct.z}`;
    }
    if (activeExperiment.id === "environmental-chem") {
      if (environmentTab === "Water Hardness")
        return `Hardness ${hardnessAsCaCO3.toFixed(0)} mg/L as CaCO3: ${hardnessClass}.`;
      if (environmentTab === "BOD/COD")
        return `BOD ${bodValue.toFixed(1)} mg/L; COD ${codValue.toFixed(0)} mg/L.`;
      if (environmentTab === "Eutrophication")
        return `Nutrient risk ${eutrophicationRisk.toFixed(0)}%: ${eutrophicationLabel}.`;
      if (environmentTab === "Treatment")
        return `${selectedTreatmentMethod.method}: targets ${selectedTreatmentMethod.target}.`;
      return `${environmentTab}: atmospheric reaction pathway and pollutant impacts.`;
    }
    return activeExperiment.result;
  };
  const saveSnapshot = (slot) => {
    setCompareSnapshots((items) => ({
      ...items,
      [activeExperiment.id]: {
        ...(items[activeExperiment.id] || {}),
        [slot]: {
          result: activeResultText(),
          savedAt: new Date().toLocaleString(),
        },
      },
    }));
  };
  const exportActiveResult = () => {
    const payload = {
      experiment: activeExperiment.title,
      result: activeResultText(),
      notes: labNotes[activeExperiment.id] || "",
      syllabus: activeSyllabusTags.tracks
        .map((id) => syllabusTrackMap[id]?.label)
        .filter(Boolean),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeExperiment.id}-lab-result.json`;
    a.click();
    URL.revokeObjectURL(url);
    showCopiedFeedback("Result exported");
  };
  const showCopiedFeedback = (message) => {
    setCopiedLabAction(message);
    window.setTimeout(() => setCopiedLabAction(""), 1600);
  };
  const shareActiveSetup = () => {
    const url = `${window.location.origin}${window.location.pathname}#lab=${activeExperiment.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showCopiedFeedback("Share link copied");
    }
  };
  const exportActiveVisualization = () => {
    const svg = document.querySelector("[data-active-lab] svg");
    if (!svg) {
      showCopiedFeedback("No visualization to export");
      return;
    }
    const source = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeExperiment.id}-visualization.svg`;
    a.click();
    URL.revokeObjectURL(url);
    showCopiedFeedback("Visualization exported");
  };
  const openActiveFullscreen = () => {
    const target =
      document.querySelector("[data-active-lab] svg") ||
      document.querySelector("[data-active-lab]");
    if (target?.requestFullscreen) target.requestFullscreen();
    else showCopiedFeedback("Fullscreen unavailable");
  };
  const clearCompareSnapshots = () => {
    setCompareSnapshots((items) => ({ ...items, [activeExperiment.id]: {} }));
    showCopiedFeedback("Saved graph snapshots cleared");
  };
  const applyActivePreset = (preset) => {
    if (activeExperiment.id === "titration")
      setSimTitrationDrops(
        preset === "acidic" ? 10 : preset === "neutral" ? 500 : 900,
      );
    else if (activeExperiment.id === "ph-meter")
      setProbeSolution(
        preset === "acidic"
          ? "vinegar"
          : preset === "basic"
            ? "ammonia"
            : "water",
      );
    else if (activeExperiment.id === "rate-lab") {
      setRateTemp(preset === "fast" ? 75 : 20);
      setRateConc(preset === "fast" ? 2.6 : 0.4);
    } else if (activeExperiment.id === "solubility")
      setSaltAdded(preset === "fast" ? 0.009 : 0.001);
  };
  const applyExampleValues = () => {
    const id = activeExperiment.id;
    if (id === "molar-mass" || id === "formula-builder")
      setFormulaInput("H2SO4");
    else if (id === "stoichiometry") setStoichEquation("N2 + H2 -> NH3");
    else if (id === "gas-law") {
      setGasP(1);
      setGasV(22.4);
      setGasT(273.15);
    } else if (id === "weak-acid-ph") setKa(1.8e-5);
    else if (id === "unit-cell") {
      setUnitCellType("FCC");
      setUnitCellA(361);
      setUnitCellDensity(8.96);
      setUnitCellMolarMass(63.55);
      setUnitCellZInput(4);
    } else if (id === "quantum-numbers") {
      setQuantumN(3);
      setQuantumL(2);
      setQuantumMl(0);
      setQuantumMs("1/2");
    } else if (id === "gibbs") {
      setGibbsDeltaH(40);
      setGibbsDeltaS(120);
      setGibbsTemp(500);
    } else if (id === "cft") {
      setCftGeometry("Octahedral");
      setCftElectrons(6);
      setCftField("strong");
    } else applyActivePreset("neutral");
    const label = `${activeExperiment.title}: example`;
    setLastExampleChips((items) =>
      [label, ...items.filter((item) => item !== label)].slice(0, 6),
    );
  };
  const tryRandomExample = () => {
    const options = [
      () => {
        setActiveExperimentId("molar-mass");
        setFormulaInput(
          ["H2O", "Ca(OH)2", "Al2(SO4)3", "C6H12O6"][
            Math.floor(Math.random() * 4)
          ],
        );
      },
      () => {
        setActiveExperimentId("gas-law");
        setGasP(Number((0.8 + Math.random() * 2).toFixed(2)));
        setGasV(Number((5 + Math.random() * 25).toFixed(1)));
        setGasT(Math.round(250 + Math.random() * 250));
      },
      () => {
        setActiveExperimentId("gibbs");
        setGibbsDeltaH(Math.round(-80 + Math.random() * 180));
        setGibbsDeltaS(Math.round(-120 + Math.random() * 260));
        setGibbsTemp(Math.round(250 + Math.random() * 900));
      },
      () => {
        setActiveExperimentId("quantum-numbers");
        const n = 1 + Math.floor(Math.random() * 4);
        const l = Math.floor(Math.random() * n);
        setQuantumN(n);
        setQuantumL(l);
        setQuantumMl(Math.floor(Math.random() * (2 * l + 1)) - l);
      },
    ];
    options[Math.floor(Math.random() * options.length)]();
    setActiveFocusTopic("all");
    setActiveLabTab("Start Here");
    setExperimentStarted(true);
    setLastExampleChips((items) =>
      [
        "Random example",
        ...items.filter((item) => item !== "Random example"),
      ].slice(0, 6),
    );
  };
  const moveExperiment = (direction) => {
    const nextIndex =
      (activeExperimentIndex + direction + LAB_EXPERIMENTS.length) %
      LAB_EXPERIMENTS.length;
    setActiveExperimentId(LAB_EXPERIMENTS[nextIndex].id);
    setActiveLabTab(LAB_EXPERIMENTS[nextIndex].tab);
  };
  const selectFocusTopic = (topicId) => {
    setActiveFocusTopic(topicId);
    setActiveLabTab("Start Here");
    const nextExperiment = LAB_EXPERIMENTS.find((item) => {
      const itemTags = getSyllabusTagsForLab(item.id);
      if (topicId === "all") return true;
      if (topicId === "beginner") return item.difficulty === "Beginner";
      const topicUnits =
        {
          matter: ["matter", "practical"],
          atoms: ["atoms", "periodic", "inorganic"],
          bonding: ["bonding", "coordination"],
          reactions: [
            "reactions",
            "thermo",
            "equilibrium",
            "electrochem",
            "kinetics",
          ],
          solutions: ["acidBase", "solutions"],
          inorganic: ["inorganic", "coordination", "periodic", "atoms"],
          organic: ["organicBasics", "organicAdvanced", "biomolecules"],
          bio: ["biomolecules"],
          pharma: ["pharmaceutical"],
          medical: ["biomolecules", "pharmaceutical", "clinical"],
        }[topicId] || [];
      return (
        itemTags.units.some((unit) => topicUnits.includes(unit)) ||
        (topicId === "inorganic" &&
          [
            "salt-analysis",
            "pblock-advanced",
            "cft",
            "metallurgy",
            "unit-cell",
            "crystal-defects",
            "crystal-structure",
            "reactivity-series",
            "molecule-links",
          ].includes(item.id))
      );
    });
    if (nextExperiment) setActiveExperimentId(nextExperiment.id);
    setExperimentStarted(false);
  };
  const activeFocusInfo = labFocusTopics.find(
    (topic) => topic.id === activeFocusTopic,
  );
  const activeRoadmap = appliedChemistryRoadmaps[activeFocusTopic];
  const showFullLab = !guidedMode || showAdvancedLab;
  const renderGuidedWorkbench = () => {
    if (
      ASSESSED_PRACTICAL_EXPERIMENTS.some(
        (experiment) => experiment.id === activeExperiment.id,
      )
    ) {
      return (
        <AssessedPracticalLab
          key={activeExperiment.id}
          experimentId={activeExperiment.id}
        />
      );
    }
    if (
      EXTENDED_ANALYTICAL_EXPERIMENTS.some(
        (experiment) => experiment.id === activeExperiment.id,
      )
    ) {
      return (
        <ExtendedAnalyticalLab
          key={activeExperiment.id}
          experimentId={activeExperiment.id}
        />
      );
    }
    const LazyTool = lazyLabTools[activeExperiment.id];
    if (LazyTool) {
      const lazyToolProps = {
        activeExperiment,
        title: activeExperiment.title,
        simTitration,
        simTitrationDrops,
        setSimTitrationDrops,
        probeSolution,
        setProbeSolution,
        probePh,
        gasP,
        gasV,
        gasT,
        setGasP,
        setGasV,
        setGasT,
        gasN,
        formulaInput,
        setFormulaInput,
        formulaSuggestions,
        parsed,
        mass,
        hessEquation,
        setHessEquation,
        hessResult,
        corrosion,
        anodeHalf,
        cathodeHalf,
        setAnodeHalf,
        setCathodeHalf,
        cellMode,
        setCellMode,
        electrochemicalCell,
      };
      return (
        <Suspense
          fallback={
            <Bench
              title={activeExperiment.title}
              result="Loading tool module..."
            >
              <div className="space-y-3">
                <div className="h-8 rounded-xl bg-white/[0.06] animate-pulse" />
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                  <div className="h-24 rounded-xl bg-white/[0.04] animate-pulse" />
                </div>
              </div>
            </Bench>
          }
        >
          <LazyTool {...lazyToolProps} />
        </Suspense>
      );
    }
    switch (activeExperiment.id) {
      case "titration":
        return (
          <Bench
            title="Titration Simulator"
            result={`pH ${simTitration.pH.toFixed(2)} - ${simTitration.region}`}
          >
            <ControlLabel>NaOH drops: {simTitrationDrops}</ControlLabel>
            <input
              type="range"
              min="0"
              max="1000"
              value={simTitrationDrops}
              onChange={(e) => setSimTitrationDrops(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-4 h-36 rounded-xl border border-white/10 flex items-end overflow-hidden bg-white/[0.04]">
              <div
                className="w-full transition-all"
                style={{
                  height: `${Math.min(100, 25 + simTitrationDrops / 10)}%`,
                  background:
                    simTitration.pH < 7
                      ? "#ef4444"
                      : simTitration.pH < 9
                        ? "#22c55e"
                        : "#ec4899",
                }}
              />
            </div>
          </Bench>
        );
      case "electrolysis":
        return (
          <Bench
            title="Electrolysis Cell"
            result={`${electrolysis.cathode}; ${electrolysis.anode}`}
          >
            <ControlLabel>Electrolyte</ControlLabel>
            <select
              value={electrolyte}
              onChange={(e) => setElectrolyte(e.target.value)}
              className="input text-sm mb-4"
            >
              {["CuSO4", "NaCl(aq)", "H2O + acid"].map((e) => (
                <option key={e}>{e}</option>
              ))}
            </select>
            <div className="h-40 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
              <span className="absolute left-12 top-5 bottom-5 w-4 rounded bg-slate-300" />
              <span className="absolute right-12 top-5 bottom-5 w-4 rounded bg-slate-300" />
              {Array.from({ length: 24 }, (_, i) => (
                <span
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-pulse"
                  style={{
                    left: `${15 + (i % 8) * 9}%`,
                    top: `${20 + Math.floor(i / 8) * 22}%`,
                  }}
                />
              ))}
            </div>
          </Bench>
        );
      case "distillation":
        return (
          <Bench
            title="Distillation Apparatus"
            result={
              distillHeat > 78
                ? "Ethanol-rich vapor condenses into the collector."
                : "Heat is still below the strong boiling range."
            }
          >
            <ControlLabel>Heating: {distillHeat}%</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={distillHeat}
              onChange={(e) => setDistillHeat(Number(e.target.value))}
              className="w-full"
            />
            <div className="h-40 rounded-xl bg-black/20 border border-white/10 relative mt-4">
              <span className="absolute left-10 bottom-6 w-20 h-20 rounded-b-3xl border border-cyan-300/30 bg-cyan-500/10" />
              <span className="absolute left-28 top-16 right-24 h-3 bg-slate-400 rounded" />
              <span className="absolute right-12 bottom-6 w-14 h-16 rounded-b-xl border border-white/20 bg-white/[0.04]" />
              {distillHeat > 45 && (
                <span className="absolute left-32 top-14 right-20 border-t border-dashed border-cyan-300 animate-pulse" />
              )}
            </div>
          </Bench>
        );
      case "chromatography":
        return (
          <Bench
            title="Chromatography"
            result="Bands separate because each substance has a different attraction to the paper and solvent."
          >
            <ControlLabel>Run time: {chromTime}%</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={chromTime}
              onChange={(e) => setChromTime(Number(e.target.value))}
              className="w-full"
            />
            <div className="h-44 rounded-xl bg-yellow-50/90 border border-white/10 relative mt-4">
              {["#ef4444", "#22c55e", "#3b82f6"].map((color, i) => (
                <span
                  key={color}
                  className="absolute left-1/2 -translate-x-1/2 w-28 h-3 rounded-full"
                  style={{
                    background: color,
                    bottom: `${12 + chromTime * (0.25 + i * 0.12)}%`,
                  }}
                />
              ))}
              <span className="absolute left-8 right-8 bottom-5 border-t border-gray-500/40" />
            </div>
          </Bench>
        );
      case "analytical-lab":
        return (
          <Bench
            title="Full Analytical Chemistry Lab"
            result={activeResultText()}
          >
            <div className="space-y-4">
              <div className="grid md:grid-cols-5 gap-2">
                {analyticalModes.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setAnalyticalMode(mode.id)}
                    className={`rounded-xl border p-3 text-left transition-colors ${analyticalMode === mode.id ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-50" : "border-white/10 bg-white/[0.035] text-gray-300 hover:bg-white/[0.06]"}`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">
                      {mode.label}
                    </span>
                    <span className="mt-1 block text-[11px] text-gray-500">
                      {mode.note}
                    </span>
                  </button>
                ))}
              </div>

              {analyticalMode === "gravimetry" && (
                <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <ControlLabel>Analyte</ControlLabel>
                        <select
                          value={gravimetricAnalyte}
                          onChange={(e) =>
                            setGravimetricAnalyte(e.target.value)
                          }
                          className="input text-sm"
                        >
                          {Object.entries(gravimetricMethods).map(
                            ([id, method]) => (
                              <option key={id} value={id}>
                                {method.analyte} as {method.precipitate}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <ControlLabel>
                          Sample volume: {gravSampleMl} mL
                        </ControlLabel>
                        <input
                          type="range"
                          min="10"
                          max="500"
                          value={gravSampleMl}
                          onChange={(e) =>
                            setGravSampleMl(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <ControlLabel>
                          Precipitate mass: {gravPrecipMass.toFixed(3)} g
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.02"
                          max="1.5"
                          step="0.001"
                          value={gravPrecipMass}
                          onChange={(e) =>
                            setGravPrecipMass(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Reagent
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {selectedGravimetricMethod.reagent}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Analyte Mass
                        </p>
                        <p className="mt-1 text-lg font-black text-cyan-100">
                          {(gravAnalyteMassG * 1000).toFixed(2)} mg
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Concentration
                        </p>
                        <p className="mt-1 text-lg font-black text-emerald-100">
                          {gravMgPerL.toFixed(1)} mg/L
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-50">
                      Mass factor = analyte molar mass / precipitate molar mass.
                      Dry precipitate mass x factor gives analyte mass.
                    </div>
                    <div className="grid md:grid-cols-4 gap-2 text-xs">
                      {[
                        [
                          "Digest",
                          "Heat precipitate in mother liquor so particles grow and adsorbed impurities drop.",
                        ],
                        [
                          "Wash",
                          "Remove mother liquor with volatile/electrolyte wash that does not dissolve precipitate.",
                        ],
                        [
                          "Ignite/dry",
                          "Bring precipitate to known constant composition before weighing.",
                        ],
                        ["Error check", selectedGravimetricMethod.interference],
                      ].map(([title, note]) => (
                        <div
                          key={title}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <p className="font-black text-white">{title}</p>
                          <p className="mt-1 text-gray-300">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 260 240"
                    className="h-72 w-full rounded-xl border border-white/10 bg-slate-950/70"
                  >
                    <rect
                      x="38"
                      y="28"
                      width="88"
                      height="142"
                      rx="18"
                      fill="#0f172a"
                      stroke="#334155"
                    />
                    <path
                      d="M46 118 C68 104, 94 132, 118 114 L118 158 L46 158Z"
                      fill="#38bdf855"
                    />
                    <circle
                      cx="76"
                      cy="132"
                      r={12 + Math.min(28, gravPrecipMass * 24)}
                      fill="#e2e8f0"
                      opacity="0.9"
                    />
                    <circle
                      cx="92"
                      cy="145"
                      r={8 + Math.min(20, gravPrecipMass * 16)}
                      fill="#cbd5e1"
                      opacity="0.85"
                    />
                    <rect
                      x="154"
                      y="62"
                      width="68"
                      height="112"
                      rx="10"
                      fill="#111827"
                      stroke="#64748b"
                    />
                    <rect
                      x="168"
                      y="50"
                      width="40"
                      height="16"
                      rx="6"
                      fill="#475569"
                    />
                    <rect
                      x="166"
                      y="170"
                      width="44"
                      height="18"
                      rx="5"
                      fill="#94a3b8"
                    />
                    <text x="44" y="202" fill="#cbd5e1" fontSize="11">
                      {selectedGravimetricMethod.precipitate} precipitate
                    </text>
                    <text x="150" y="202" fill="#cbd5e1" fontSize="11">
                      drying oven
                    </text>
                    <text x="42" y="222" fill="#94a3b8" fontSize="9">
                      {selectedGravimetricMethod.check}
                    </text>
                  </svg>
                </div>
              )}

              {analyticalMode === "volumetric" && (
                <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <ControlLabel>Method</ControlLabel>
                        <select
                          value={volumetricMethod}
                          onChange={(e) => setVolumetricMethod(e.target.value)}
                          className="input text-sm"
                        >
                          {Object.entries(volumetricMethods).map(
                            ([id, method]) => (
                              <option key={id} value={id}>
                                {method.label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <ControlLabel>
                          Titrant M: {volTitrantM.toFixed(3)}
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.001"
                          max="0.2"
                          step="0.001"
                          value={volTitrantM}
                          onChange={(e) =>
                            setVolTitrantM(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <ControlLabel>
                          Titre: {volTitrantMl.toFixed(2)} mL
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.1"
                          max="50"
                          step="0.05"
                          value={volTitrantMl}
                          onChange={(e) =>
                            setVolTitrantMl(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <ControlLabel>
                          Blank: {volBlankMl.toFixed(1)} mL
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.1"
                          max="60"
                          step="0.1"
                          value={volBlankMl}
                          onChange={(e) =>
                            setVolBlankMl(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <ControlLabel>
                          Aliquot: {volAliquotMl.toFixed(1)} mL
                        </ControlLabel>
                        <input
                          type="range"
                          min="5"
                          max="250"
                          step="1"
                          value={volAliquotMl}
                          onChange={(e) =>
                            setVolAliquotMl(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <ControlLabel>
                          Sample mass: {volSampleMass.toFixed(3)} g
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.02"
                          max="2"
                          step="0.01"
                          value={volSampleMass}
                          onChange={(e) =>
                            setVolSampleMass(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Analyte
                        </p>
                        <p className="mt-1 text-sm font-bold text-white">
                          {selectedVolumetricMethod.analyte}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Result
                        </p>
                        <p className="mt-1 text-lg font-black text-emerald-100">
                          {volumetricResult.toFixed(
                            volumetricMethod === "direct-acid-base" ? 4 : 2,
                          )}{" "}
                          {selectedVolumetricMethod.unit}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Endpoint
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                          {selectedVolumetricMethod.endpoint}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-xl border border-violet-300/20 bg-violet-300/10 p-3 text-xs text-violet-50">
                      {selectedVolumetricMethod.formula}
                    </div>
                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 text-xs">
                      {volumetricVariantNotes.map(([title, note]) => (
                        <div
                          key={title}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <p className="font-black text-white">{title}</p>
                          <p className="mt-1 text-gray-300">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 260 250"
                    className="h-72 w-full rounded-xl border border-white/10 bg-slate-950/70"
                  >
                    <rect
                      x="112"
                      y="24"
                      width="22"
                      height="144"
                      rx="8"
                      fill="#0f172a"
                      stroke="#94a3b8"
                    />
                    <rect
                      x="118"
                      y="36"
                      width="10"
                      height={Math.max(12, 116 - volTitrantMl * 1.7)}
                      fill="#38bdf8"
                      opacity="0.7"
                    />
                    <path
                      d="M123 168 L123 196"
                      stroke="#94a3b8"
                      strokeWidth="4"
                    />
                    <circle cx="123" cy="204" r="4" fill="#38bdf8" />
                    <path
                      d="M72 208 C88 178, 158 178, 174 208 L166 230 H80Z"
                      fill="#22c55e33"
                      stroke="#34d399"
                      strokeWidth="3"
                    />
                    <text x="86" y="226" fill="#bbf7d0" fontSize="10">
                      sample aliquot
                    </text>
                    <text x="60" y="18" fill="#cbd5e1" fontSize="11">
                      {selectedVolumetricMethod.label}
                    </text>
                    <text x="48" y="244" fill="#94a3b8" fontSize="9">
                      {volTitrantMl.toFixed(2)} mL endpoint reading
                    </text>
                  </svg>
                </div>
              )}

              {analyticalMode === "calibration" && (
                <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <ControlLabel>
                          Unknown absorbance: {unknownAbsorbance.toFixed(3)}
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.02"
                          max="0.75"
                          step="0.001"
                          value={unknownAbsorbance}
                          onChange={(e) =>
                            setUnknownAbsorbance(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                      <div>
                        <ControlLabel>
                          Dilution factor: {dilutionFactor}x
                        </ControlLabel>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          step="1"
                          value={dilutionFactor}
                          onChange={(e) =>
                            setDilutionFactor(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Slope
                        </p>
                        <p className="mt-1 text-lg font-black text-cyan-100">
                          {calSlope.toFixed(4)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Unknown
                        </p>
                        <p className="mt-1 text-lg font-black text-emerald-100">
                          {unknownConcentration.toFixed(2)} mg/L
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          Original sample
                        </p>
                        <p className="mt-1 text-lg font-black text-amber-100">
                          {finalUnknownConcentration.toFixed(1)} mg/L
                        </p>
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          R2
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {calR2.toFixed(4)}
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          LOD
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {calLod.toFixed(2)} mg/L
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                          LOQ
                        </p>
                        <p className="mt-1 text-lg font-black text-white">
                          {calLoq.toFixed(2)} mg/L
                        </p>
                      </div>
                    </div>
                    <div>
                      <ControlLabel>
                        Instrument noise sigma A:{" "}
                        {analyticalNoiseAbs.toFixed(3)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0.001"
                        max="0.03"
                        step="0.001"
                        value={analyticalNoiseAbs}
                        onChange={(e) =>
                          setAnalyticalNoiseAbs(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <p className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3 text-xs text-cyan-50">
                      Calibration equation: A = {calSlope.toFixed(4)}C +{" "}
                      {calIntercept.toFixed(4)}. Keep unknown absorbance inside
                      the standard range for best accuracy; use standard
                      addition when matrix effects are suspected.
                    </p>
                  </div>
                  <svg
                    viewBox="0 0 280 240"
                    className="h-72 w-full rounded-xl border border-white/10 bg-slate-950/70"
                  >
                    <line x1="38" y1="200" x2="250" y2="200" stroke="#64748b" />
                    <line x1="38" y1="28" x2="38" y2="200" stroke="#64748b" />
                    <polyline
                      points={calibrationStandards
                        .map(
                          (point) =>
                            `${38 + point.c * 19},${200 - point.a * 250}`,
                        )
                        .join(" ")}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {calibrationStandards.map((point) => (
                      <circle
                        key={point.c}
                        cx={38 + point.c * 19}
                        cy={200 - point.a * 250}
                        r="5"
                        fill="#22c55e"
                      />
                    ))}
                    <line
                      x1="38"
                      x2="250"
                      y1={200 - unknownAbsorbance * 250}
                      y2={200 - unknownAbsorbance * 250}
                      stroke="#f59e0b"
                      strokeDasharray="5 5"
                    />
                    <circle
                      cx={38 + unknownConcentration * 19}
                      cy={200 - unknownAbsorbance * 250}
                      r="8"
                      fill="#f59e0b"
                      stroke="#fde68a"
                      strokeWidth="2"
                    />
                    <text x="104" y="224" fill="#94a3b8" fontSize="10">
                      Concentration
                    </text>
                    <text x="48" y="38" fill="#94a3b8" fontSize="10">
                      Absorbance
                    </text>
                  </svg>
                </div>
              )}

              {analyticalMode === "chromatography" && (
                <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div>
                        <ControlLabel>Sample</ControlLabel>
                        <select
                          value={chromSample}
                          onChange={(e) => setChromSample(e.target.value)}
                          className="input text-sm"
                        >
                          {Object.entries(chromatographySamples).map(
                            ([id, sample]) => (
                              <option key={id} value={id}>
                                {sample.label}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                      <div>
                        <ControlLabel>
                          Peak width: {chromPeakWidth.toFixed(2)} cm
                        </ControlLabel>
                        <input
                          type="range"
                          min="0.1"
                          max="1.5"
                          step="0.01"
                          value={chromPeakWidth}
                          onChange={(e) =>
                            setChromPeakWidth(Number(e.target.value))
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-white/[0.05] text-gray-400">
                          <tr>
                            <th className="p-2">Component</th>
                            <th className="p-2">Distance</th>
                            <th className="p-2">Rf</th>
                            <th className="p-2">Resolution to next</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chromRfRows.map((row) => (
                            <tr
                              key={row.label}
                              className="border-t border-white/10"
                            >
                              <td className="p-2 font-bold text-white">
                                {row.label}
                              </td>
                              <td className="p-2 text-gray-300">
                                {row.distance.toFixed(1)} cm
                              </td>
                              <td className="p-2 text-cyan-200">
                                {row.rf.toFixed(2)}
                              </td>
                              <td className="p-2 text-gray-300">
                                {row.resolution
                                  ? row.resolution.toFixed(2)
                                  : "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p
                      className={`rounded-xl border p-3 text-xs ${chromMinResolution >= 1.5 ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-50" : "border-amber-300/20 bg-amber-300/10 text-amber-50"}`}
                    >
                      {selectedChromatography.note} Minimum resolution is{" "}
                      {chromMinResolution.toFixed(2)}; values above about 1.5
                      usually mean baseline separation.
                    </p>
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-2 text-xs">
                      {chromatographyRules.map(([title, note]) => (
                        <div
                          key={title}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <p className="font-black text-white">{title}</p>
                          <p className="mt-1 text-gray-300">{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <svg
                    viewBox="0 0 260 260"
                    className="h-72 w-full rounded-xl border border-white/10 bg-yellow-50/95"
                  >
                    <rect
                      x="82"
                      y="24"
                      width="96"
                      height="210"
                      rx="8"
                      fill="#f8fafc"
                      stroke="#94a3b8"
                    />
                    <line
                      x1="94"
                      y1="214"
                      x2="166"
                      y2="214"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                    <line
                      x1="94"
                      y1="42"
                      x2="166"
                      y2="42"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="5 5"
                    />
                    {chromRfRows.map((row) => (
                      <g key={row.label}>
                        <ellipse
                          cx="130"
                          cy={214 - row.rf * 172}
                          rx={22 + chromPeakWidth * 7}
                          ry="7"
                          fill={row.color}
                          opacity="0.86"
                        />
                        <text
                          x="178"
                          y={218 - row.rf * 172}
                          fill="#334155"
                          fontSize="8"
                        >
                          {row.label}
                        </text>
                      </g>
                    ))}
                    <text x="92" y="238" fill="#334155" fontSize="9">
                      origin
                    </text>
                    <text x="174" y="45" fill="#334155" fontSize="9">
                      front {selectedChromatography.solventFront} cm
                    </text>
                  </svg>
                </div>
              )}
              {analyticalMode === "quality" && (
                <div className="grid lg:grid-cols-[300px_1fr] gap-4">
                  <div className="space-y-3">
                    <div>
                      <ControlLabel>
                        Recovery {analyticalRecovery}%
                      </ControlLabel>
                      <input
                        type="range"
                        min="70"
                        max="120"
                        step="0.5"
                        value={analyticalRecovery}
                        onChange={(e) =>
                          setAnalyticalRecovery(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Replicate RSD {analyticalRsd.toFixed(1)}%
                      </ControlLabel>
                      <input
                        type="range"
                        min="0.1"
                        max="8"
                        step="0.1"
                        value={analyticalRsd}
                        onChange={(e) =>
                          setAnalyticalRsd(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <ControlLabel>Practice scenario</ControlLabel>
                    <select
                      value={analyticalPracticeIndex}
                      onChange={(e) =>
                        setAnalyticalPracticeIndex(Number(e.target.value))
                      }
                      className="input text-sm"
                    >
                      {analyticalPracticeScenarios.map((item, index) => (
                        <option key={item.prompt} value={index}>
                          Scenario {index + 1}
                        </option>
                      ))}
                    </select>
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs text-gray-500">Prompt</p>
                      <p className="mt-2 text-sm font-bold text-white">
                        {activeAnalyticalPractice.prompt}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-50">
                      {activeAnalyticalPractice.answer}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-3 gap-2">
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[10px] text-gray-500">Measured</p>
                        <p className="text-lg font-black text-white">
                          {finalUnknownConcentration.toFixed(1)} mg/L
                        </p>
                      </div>
                      <div className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 p-3">
                        <p className="text-[10px] text-cyan-300">
                          Recovery corrected
                        </p>
                        <p className="text-lg font-black text-white">
                          {recoveryCorrectedConcentration.toFixed(1)} mg/L
                        </p>
                      </div>
                      <div
                        className={`rounded-xl border p-3 ${analyticalRsd <= 2 ? "border-emerald-400/20 bg-emerald-500/10" : "border-amber-400/20 bg-amber-500/10"}`}
                      >
                        <p className="text-[10px] text-gray-300">Precision</p>
                        <p className="text-lg font-black text-white">
                          {analyticalRsd <= 2 ? "good" : "review"}
                        </p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 text-xs">
                      {analyticalWorkflowCards.map((card) => (
                        <div
                          key={card.title}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <p className="font-black text-white">{card.title}</p>
                          <p className="mt-1 text-gray-300">{card.detail}</p>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-xs text-amber-50">
                      Report checklist: method name, sample prep, blank
                      correction, dilution factor, calibration range, recovery,
                      RSD, LOD/LOQ, units, and significant figures.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Bench>
        );
      case "spectroscopy":
        return (
          <Bench
            title="Spectroscopy Viewer"
            result={`Visible emission lines for ${selectedSymbol}.`}
          >
            <ControlLabel>Element</ControlLabel>
            <ElementSearchInput
              value={selectedSymbol}
              onChange={setSelectedSymbol}
              allowedSymbols={["H", "He", "Li", "Na", "K", "Ca", "Cu"]}
              className="mb-4"
            />
            <div className="h-28 rounded-xl bg-gradient-to-r from-violet-700 via-green-500 to-red-600 border border-white/10 relative overflow-hidden">
              {(spectrumLines[selectedSymbol] || [486, 656]).map((nm) => (
                <span
                  key={nm}
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_white]"
                  style={{ left: `${((nm - 380) / 370) * 100}%` }}
                />
              ))}
            </div>
          </Bench>
        );
      case "ph-meter":
        return (
          <Bench
            title="pH Meter"
            result={`${probeSolution} is ${probePh < 7 ? "acidic" : probePh > 7 ? "basic" : "neutral"}.`}
          >
            <ControlLabel>Test solution</ControlLabel>
            <select
              value={probeSolution}
              onChange={(e) => setProbeSolution(e.target.value)}
              className="input text-sm mb-4"
            >
              {["water", "vinegar", "ammonia", "cola", "soap"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <div className="text-5xl font-black text-white">
              pH {probePh.toFixed(1)}
            </div>
            <MiniBar
              label="acid to base"
              value={(probePh / 14) * 100}
              color={
                probePh < 7 ? "#ef4444" : probePh > 7 ? "#3b82f6" : "#22c55e"
              }
            />
          </Bench>
        );
      case "electrochemical-cell":
      case "corrosion":
        return (
          <Bench
            title={activeExperiment.title}
            result={
              activeExperiment.id === "corrosion"
                ? `${corrosion} corrodes preferentially in this pair.`
                : `EMF is ${electrochemicalCell.emf.toFixed(2)} V.`
            }
          >
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <ControlLabel>Anode oxidation partner</ControlLabel>
                <select
                  value={anodeHalf}
                  onChange={(e) => setAnodeHalf(e.target.value)}
                  className="input text-sm"
                >
                  {Object.keys(halfReactions).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
              <div>
                <ControlLabel>Cathode reduction</ControlLabel>
                <select
                  value={cathodeHalf}
                  onChange={(e) => setCathodeHalf(e.target.value)}
                  className="input text-sm"
                >
                  {Object.keys(halfReactions).map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </div>
            </div>
            <select
              value={cellMode}
              onChange={(e) => setCellMode(e.target.value)}
              className="input text-sm mb-4"
            >
              <option value="galvanic">Galvanic</option>
              <option value="electrolytic">Electrolytic</option>
            </select>
            <div className="h-36 rounded-xl bg-black/20 border border-white/10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4">
              <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">
                {anodeHalf}
                <br />
                <span className="text-[10px] text-gray-500">anode</span>
              </span>
              <span className="text-cyan-300 font-mono text-xl">
                {electrochemicalCell.emf.toFixed(2)} V
              </span>
              <span className="px-4 py-8 rounded-xl bg-white/[0.06] text-center">
                {cathodeHalf}
                <br />
                <span className="text-[10px] text-gray-500">cathode</span>
              </span>
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                Anode: {electrochemicalCell.anode.species}
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                Cathode: {electrochemicalCell.cathode.species}
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">
              Cell diagram:{" "}
              <span className="font-mono text-gray-200">
                {electrochemicalCell.cellDiagram}
              </span>
            </p>
            <p
              className={`mt-1 text-xs ${electrochemicalCell.spontaneous ? "text-emerald-300" : "text-amber-300"}`}
            >
              {electrochemicalCell.spontaneous
                ? "Spontaneous under selected mode."
                : "Requires external energy in selected mode."}
            </p>
          </Bench>
        );
      case "equilibrium":
        return (
          <Bench
            title="Le Chatelier Equilibrium"
            result={`The system ${eqShift}.`}
          >
            <ControlLabel>Reactant level {eqReactant.toFixed(1)}x</ControlLabel>
            <input
              type="range"
              min="0.2"
              max="3"
              step="0.1"
              value={eqReactant}
              onChange={(e) => setEqReactant(Number(e.target.value))}
              className="w-full mb-3"
            />
            <ControlLabel>Temperature {eqTemp} C</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={eqTemp}
              onChange={(e) => setEqTemp(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-4 text-center text-xl text-white font-mono">
              N2O4 ⇌ 2NO2
            </div>
          </Bench>
        );
      case "osmosis":
        return (
          <Bench title="Osmosis Demo" result={osmoticFlow}>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <ControlLabel>Left {osmosisLeft} M</ControlLabel>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={osmosisLeft}
                  onChange={(e) => setOsmosisLeft(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <ControlLabel>Right {osmosisRight} M</ControlLabel>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={osmosisRight}
                  onChange={(e) => setOsmosisRight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="h-28 rounded-xl bg-blue-500/10 border border-blue-400/20 mt-4 grid grid-cols-2 divide-x divide-dashed divide-white/30">
              <div className="flex items-center justify-center text-gray-200">
                Left solution
              </div>
              <div className="flex items-center justify-center text-gray-200">
                Right solution
              </div>
            </div>
          </Bench>
        );
      case "flame-test":
        return (
          <Bench
            title="Flame Test"
            result={`${flameElement} produces its characteristic flame color.`}
          >
            <ControlLabel>Metal ion</ControlLabel>
            <ElementSearchInput
              value={flameElement}
              onChange={setFlameElement}
              allowedSymbols={Object.keys(flameColors)}
              className="mb-4"
              placeholder="Search available metal ions"
            />
            <div className="h-40 rounded-xl bg-black border border-white/10 flex items-end justify-center overflow-hidden">
              <div
                className="w-32 h-32 rounded-t-full blur-sm"
                style={{
                  background: flameColors[flameElement],
                  boxShadow: `0 0 50px ${flameColors[flameElement]}`,
                }}
              />
            </div>
          </Bench>
        );
      case "molar-mass":
      case "formula-builder":
        return (
          <Bench
            title={activeExperiment.title}
            result={`Molar mass = ${mass.toFixed(3)} g/mol`}
          >
            <ControlLabel>Formula</ControlLabel>
            <input
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              className="input text-sm mb-3"
            />
            {formulaSuggestions.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {formulaSuggestions.map((molecule) => (
                  <button
                    key={molecule.name}
                    onClick={() =>
                      setFormulaInput(normalizeFormulaText(molecule.formula))
                    }
                    className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2 py-1 text-[10px] text-cyan-100"
                  >
                    {molecule.name} ({normalizeFormulaText(molecule.formula)})
                  </button>
                ))}
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[10px] text-gray-500 uppercase">Atoms</p>
                <p className="text-sm text-gray-200 font-mono mt-1">
                  {Object.entries(parsed)
                    .map(([s, n]) => `${s}:${n}`)
                    .join("  ") || "None"}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[10px] text-gray-500 uppercase">
                  Molar mass
                </p>
                <p className="text-2xl font-black text-white">
                  {mass.toFixed(3)}
                </p>
              </div>
            </div>
          </Bench>
        );
      case "stoichiometry":
        return (
          <Bench
            title="Stoichiometry Solver"
            result={
              stoichBalanced.ok ? stoichBalanced.balanced : stoichBalanced.error
            }
          >
            <ControlLabel>Equation</ControlLabel>
            <input
              value={stoichEquation}
              onChange={(e) => setStoichEquation(e.target.value)}
              className="input text-sm mb-3"
            />
            <ControlLabel>Starting moles</ControlLabel>
            <input
              type="number"
              value={stoichMoles}
              onChange={(e) => setStoichMoles(Number(e.target.value))}
              className="input text-sm"
            />
          </Bench>
        );
      case "dilution":
        return (
          <Bench
            title="Molarity / Dilution Calculator"
            result={`Required final volume V2 = ${dilutionV2.toFixed(2)} mL`}
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <ControlLabel>C1</ControlLabel>
                <input
                  type="number"
                  value={c1}
                  onChange={(e) => setC1(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
              <div>
                <ControlLabel>V1</ControlLabel>
                <input
                  type="number"
                  value={v1}
                  onChange={(e) => setV1(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
              <div>
                <ControlLabel>C2</ControlLabel>
                <input
                  type="number"
                  value={c2}
                  onChange={(e) => setC2(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
            </div>
          </Bench>
        );
      case "weak-acid-ph":
        return (
          <Bench
            title="pH / pOH Calculator"
            result={`pH ${weakAcidPh.toFixed(2)}; pOH ${(14 - weakAcidPh).toFixed(2)}`}
          >
            <ControlLabel>Ka</ControlLabel>
            <input
              type="number"
              value={ka}
              onChange={(e) => setKa(Number(e.target.value))}
              className="input text-sm"
            />
          </Bench>
        );
      case "gas-law":
        return (
          <Bench
            title="Ideal Gas Law Calculator"
            result={`n = ${gasN.toFixed(3)} mol`}
          >
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <ControlLabel>P atm</ControlLabel>
                <input
                  type="number"
                  value={gasP}
                  onChange={(e) => setGasP(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
              <div>
                <ControlLabel>V L</ControlLabel>
                <input
                  type="number"
                  value={gasV}
                  onChange={(e) => setGasV(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
              <div>
                <ControlLabel>T K</ControlLabel>
                <input
                  type="number"
                  value={gasT}
                  onChange={(e) => setGasT(Number(e.target.value))}
                  className="input text-sm"
                />
              </div>
            </div>
          </Bench>
        );
      case "empirical-formula":
        return (
          <Bench
            title="Empirical Formula Finder"
            result={`Empirical formula: ${empiricalFormula(empRows)}`}
          >
            {empRows.map((row, i) => (
              <div key={i} className="grid grid-cols-2 gap-2 mb-2">
                <input
                  value={row.symbol}
                  onChange={(e) =>
                    setEmpRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i ? { ...r, symbol: e.target.value } : r,
                      ),
                    )
                  }
                  className="input text-sm"
                />
                <input
                  type="number"
                  value={row.percent}
                  onChange={(e) =>
                    setEmpRows((rows) =>
                      rows.map((r, idx) =>
                        idx === i
                          ? { ...r, percent: Number(e.target.value) }
                          : r,
                      ),
                    )
                  }
                  className="input text-sm"
                />
              </div>
            ))}
          </Bench>
        );
      case "oxidation":
        return (
          <Bench
            title="Oxidation State Finder"
            result={oxidationGuess(oxidFormula)}
          >
            <ControlLabel>Formula</ControlLabel>
            <input
              value={oxidFormula}
              onChange={(e) => setOxidFormula(e.target.value)}
              className="input text-sm"
            />
          </Bench>
        );
      case "electron-config-tool":
        return (
          <Bench
            title="Electron Configuration Builder"
            result={`${configElement.name}: ${configElement.electronConfiguration}`}
          >
            <ControlLabel>Atomic number</ControlLabel>
            <input
              type="number"
              min="1"
              max="118"
              value={configAtomicNumber}
              onChange={(e) => setConfigAtomicNumber(Number(e.target.value))}
              className="input text-sm mb-3"
            />
            <div className="flex flex-wrap gap-1">
              {configFill.map((part) => (
                <span
                  key={part.raw}
                  className="px-2 py-1 rounded bg-white/[0.06] text-xs"
                >
                  {part.raw}
                </span>
              ))}
            </div>
          </Bench>
        );
      case "hess":
        return (
          <Bench
            title="Reaction Enthalpy"
            result={
              hessResult.ok
                ? `Delta H = ${hessResult.deltaH.toFixed(1)} kJ`
                : hessResult.error
            }
          >
            <ControlLabel>Balanced or unbalanced equation</ControlLabel>
            <input
              value={hessEquation}
              onChange={(e) => setHessEquation(e.target.value)}
              className="input text-sm font-mono mb-3"
            />
            {hessResult.ok ? (
              <>
                <p className="text-xs text-gray-300 mb-3">
                  Balanced:{" "}
                  <span className="font-mono text-cyan-200">
                    {hessResult.balanced}
                  </span>
                </p>
                <div className="grid sm:grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Reactants</p>
                    <p className="text-lg font-black text-white">
                      {hessResult.reactants.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Products</p>
                    <p className="text-lg font-black text-white">
                      {hessResult.products.toFixed(1)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="text-[10px] text-cyan-300">Delta H</p>
                    <p className="text-lg font-black text-white">
                      {hessResult.deltaH.toFixed(1)} kJ
                    </p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 260 120"
                  className="w-full h-40 rounded-xl bg-black/20 border border-white/10"
                >
                  <line
                    x1="30"
                    y1={hessResult.deltaH < 0 ? 35 : 85}
                    x2="105"
                    y2={hessResult.deltaH < 0 ? 35 : 85}
                    stroke="#38bdf8"
                    strokeWidth="4"
                  />
                  <line
                    x1="155"
                    y1={hessResult.deltaH < 0 ? 85 : 35}
                    x2="230"
                    y2={hessResult.deltaH < 0 ? 85 : 35}
                    stroke="#34d399"
                    strokeWidth="4"
                  />
                  <path
                    d={`M105 ${hessResult.deltaH < 0 ? 35 : 85} C125 15, 135 15, 155 ${hessResult.deltaH < 0 ? 85 : 35}`}
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3"
                  />
                  <text x="30" y="108" fill="#94a3b8" fontSize="10">
                    Reactants
                  </text>
                  <text x="170" y="108" fill="#94a3b8" fontSize="10">
                    Products
                  </text>
                </svg>
              </>
            ) : (
              <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-xs text-amber-100">
                {hessResult.error}. Loaded values include{" "}
                {Object.keys(standardFormationEnthalpies)
                  .slice(0, 10)
                  .join(", ")}{" "}
                and more.
              </div>
            )}
          </Bench>
        );
      case "colligative":
        return (
          <Bench
            title="Colligative Properties"
            result={`Boiling elevation ${boilingElevation.toFixed(2)} C; freezing depression ${freezingDepression.toFixed(2)} C`}
          >
            <ControlLabel>Molality {molality} m</ControlLabel>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={molality}
              onChange={(e) => setMolality(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "adsorption":
        return (
          <Bench
            title="Adsorption Isotherms Lab"
            result={`Freundlich: x/m = ${freundlichK.toFixed(1)}P^(1/${freundlichN.toFixed(1)}); Langmuir: x/m = ${langmuirA.toFixed(1)}P/(1+${langmuirB.toFixed(1)}P)`}
          >
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
              <div>
                <IsothermPlot
                  freundlichK={freundlichK}
                  freundlichN={freundlichN}
                  langmuirA={langmuirA}
                  langmuirB={langmuirB}
                />
                <div className="grid sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <ControlLabel>
                      Freundlich k {freundlichK.toFixed(1)}
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.2"
                      max="4"
                      step="0.1"
                      value={freundlichK}
                      onChange={(e) => setFreundlichK(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Freundlich n {freundlichN.toFixed(1)}
                    </ControlLabel>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="0.1"
                      value={freundlichN}
                      onChange={(e) => setFreundlichN(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Langmuir a {langmuirA.toFixed(1)}
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.5"
                      max="8"
                      step="0.1"
                      value={langmuirA}
                      onChange={(e) => setLangmuirA(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Langmuir b {langmuirB.toFixed(1)}
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={langmuirB}
                      onChange={(e) => setLangmuirB(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <select
                  value={adsorptionMode}
                  onChange={(e) => setAdsorptionMode(e.target.value)}
                  className="input text-sm"
                >
                  <option value="physisorption">Physisorption</option>
                  <option value="chemisorption">Chemisorption</option>
                </select>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  {adsorptionMode === "physisorption"
                    ? "Physisorption: weak van der Waals forces, low heat of adsorption, reversible, multilayer possible, favored at low temperature."
                    : "Chemisorption: chemical bond formation, high heat of adsorption, often specific and monolayer, may need activation energy."}
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="font-bold text-cyan-200">
                      Lyophilic colloids
                    </p>
                    <p className="text-gray-400 mt-1">
                      Solvent loving; starch, gelatin, gum. More stable.
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3">
                    <p className="font-bold text-amber-200">
                      Lyophobic colloids
                    </p>
                    <p className="text-gray-400 mt-1">
                      Solvent hating; gold sol, sulfur sol. Easily coagulated.
                    </p>
                  </div>
                </div>
                <svg
                  viewBox="0 0 220 70"
                  className="w-full h-24 rounded-xl bg-black/20 border border-white/10"
                >
                  <line
                    x1="12"
                    y1="35"
                    x2="208"
                    y2="35"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    opacity="0.8"
                  />
                  {Array.from({ length: 18 }, (_, i) => (
                    <circle
                      key={i}
                      cx={22 + i * 10}
                      cy={28 + (i % 4) * 4}
                      r="2"
                      fill="#fbbf24"
                    />
                  ))}
                  <text x="14" y="62" fill="#94a3b8" fontSize="8">
                    Tyndall effect: light path visible due to scattering by
                    colloidal particles
                  </text>
                </svg>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  <p>
                    <span className="text-cyan-300 font-semibold">
                      Hardy-Schulze rule:
                    </span>{" "}
                    higher counter-ion valency causes stronger coagulation.
                  </p>
                  <p className="mt-1">
                    <span className="text-emerald-300 font-semibold">
                      Gold number:
                    </span>{" "}
                    mg of protective colloid needed to prevent coagulation of 10
                    mL gold sol by 1 mL 10% NaCl. Example: 10 mg / 0.2 mg =
                    protection ratio {goldNumberExample.toFixed(0)}.
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "surface-chemistry-deep":
        return (
          <Bench
            title="Surface Chemistry Deep Module"
            result={`${surfaceModes.find((mode) => mode.id === surfaceMode)?.label}: ${activeResultText()}`}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {surfaceModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSurfaceMode(mode.id)}
                  className={`btn-secondary text-xs px-3 py-2 ${surfaceMode === mode.id ? "bg-cyan-500/20 text-cyan-100 border-cyan-400/30" : ""}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {surfaceMode === "isotherms" && (
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-4">
                <div>
                  <IsothermPlot
                    freundlichK={freundlichK}
                    freundlichN={freundlichN}
                    langmuirA={langmuirA}
                    langmuirB={langmuirB}
                  />
                  <div className="grid sm:grid-cols-2 gap-3 mt-3">
                    <div>
                      <ControlLabel>
                        Freundlich k {freundlichK.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0.2"
                        max="4"
                        step="0.1"
                        value={freundlichK}
                        onChange={(e) => setFreundlichK(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Freundlich n {freundlichN.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="1"
                        max="5"
                        step="0.1"
                        value={freundlichN}
                        onChange={(e) => setFreundlichN(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Langmuir a {langmuirA.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0.5"
                        max="8"
                        step="0.1"
                        value={langmuirA}
                        onChange={(e) => setLangmuirA(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Langmuir b {langmuirB.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0.1"
                        max="3"
                        step="0.1"
                        value={langmuirB}
                        onChange={(e) => setLangmuirB(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs">
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="font-black text-cyan-100">Freundlich</p>
                    <p className="text-gray-300 mt-1">
                      Empirical, useful at moderate pressure; log(x/m) vs log P
                      gives slope 1/n.
                    </p>
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3">
                    <p className="font-black text-amber-100">Langmuir</p>
                    <p className="text-gray-300 mt-1">
                      Assumes fixed equivalent sites and monolayer saturation on
                      the surface.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300">
                    Physisorption is weak, reversible, and often multilayer.
                    Chemisorption is specific, stronger, commonly monolayer, and
                    may need activation energy.
                  </div>
                </div>
                <div className="lg:col-span-2 grid md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                  {surfaceConceptCards.map((card) => (
                    <article
                      key={card.title}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <h5 className="text-sm font-black text-white">
                        {card.title}
                      </h5>
                      <div className="mt-2 space-y-1 text-gray-300">
                        {card.points.map((point) => (
                          <p key={point}>{point}</p>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
            {surfaceMode === "catalysis" && (
              <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Catalyst case</ControlLabel>
                  <select
                    value={surfaceCatalystCase}
                    onChange={(e) => setSurfaceCatalystCase(e.target.value)}
                    className="input text-sm"
                  >
                    {surfaceCatalystCases.map((item) => (
                      <option key={item.process}>{item.process}</option>
                    ))}
                  </select>
                  <div>
                    <ControlLabel>
                      Temperature {surfaceCatalystTemp} C
                    </ControlLabel>
                    <input
                      type="range"
                      min="250"
                      max="800"
                      value={surfaceCatalystTemp}
                      onChange={(e) =>
                        setSurfaceCatalystTemp(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Active surface area {surfaceCatalystArea}%
                    </ControlLabel>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={surfaceCatalystArea}
                      onChange={(e) =>
                        setSurfaceCatalystArea(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <MiniBar
                    label="relative catalytic activity"
                    value={catalystActivity}
                    color="#22c55e"
                  />
                </div>
                <div className="space-y-3">
                  <svg
                    viewBox="0 0 260 150"
                    className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
                  >
                    <rect
                      x="25"
                      y="105"
                      width="210"
                      height="18"
                      rx="8"
                      fill="#94a3b8"
                    />
                    {Array.from({ length: 9 }, (_, i) => (
                      <circle
                        key={i}
                        cx={42 + i * 22}
                        cy="99"
                        r="7"
                        fill={i % 2 ? "#f59e0b" : "#38bdf8"}
                      />
                    ))}
                    <path
                      d="M55 40 C85 12, 115 12, 140 42 S195 76, 216 44"
                      fill="none"
                      stroke="#f472b6"
                      strokeWidth="3"
                    />
                    <text x="52" y="34" fill="#cbd5e1" fontSize="9">
                      adsorb
                    </text>
                    <text x="113" y="28" fill="#cbd5e1" fontSize="9">
                      activate
                    </text>
                    <text x="183" y="36" fill="#cbd5e1" fontSize="9">
                      desorb
                    </text>
                    <text x="36" y="140" fill="#94a3b8" fontSize="9">
                      Surface sites lower activation energy; poisons block
                      sites.
                    </text>
                  </svg>
                  <div className="grid sm:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Catalyst</p>
                      <p className="font-bold text-white">
                        {selectedCatalystCase.catalyst}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Poison risk</p>
                      <p className="font-bold text-white">
                        {selectedCatalystCase.poison}
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-xs text-emerald-50">
                    {selectedCatalystCase.role}
                  </p>
                </div>
              </div>
            )}
            {surfaceMode === "colloids" && (
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Colloid system</ControlLabel>
                  <select
                    value={surfaceColloid}
                    onChange={(e) => setSurfaceColloid(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(surfaceColloidSystems).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <div>
                    <ControlLabel>
                      Counter-ion charge {surfaceCounterCharge}+
                    </ControlLabel>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      value={surfaceCounterCharge}
                      onChange={(e) =>
                        setSurfaceCounterCharge(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Electrolyte concentration{" "}
                      {surfaceElectrolyteConc.toFixed(3)} M
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.001"
                      max="0.05"
                      step="0.001"
                      value={surfaceElectrolyteConc}
                      onChange={(e) =>
                        setSurfaceElectrolyteConc(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <MiniBar
                    label="Hardy-Schulze coagulation index"
                    value={hardySchulzePower}
                    color="#f87171"
                  />
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-4 gap-2">
                    {[
                      ["Type", selectedSurfaceColloid.kind],
                      ["Charge", selectedSurfaceColloid.charge],
                      ["Dispersed phase", selectedSurfaceColloid.dispersed],
                      ["Medium", selectedSurfaceColloid.medium],
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                      >
                        <p className="text-[10px] text-gray-500">{label}</p>
                        <p className="text-sm font-black text-white">{value}</p>
                      </div>
                    ))}
                  </div>
                  <svg
                    viewBox="0 0 280 140"
                    className="w-full h-52 rounded-xl bg-black/20 border border-white/10"
                  >
                    {Array.from({ length: 22 }, (_, i) => (
                      <circle
                        key={i}
                        cx={24 + (i % 11) * 22}
                        cy={28 + Math.floor(i / 11) * 42 + (i % 3) * 4}
                        r={5 + (i % 2)}
                        fill={
                          selectedSurfaceColloid.charge.includes("positive")
                            ? "#f472b6"
                            : "#38bdf8"
                        }
                        opacity="0.85"
                      />
                    ))}
                    {Array.from(
                      { length: surfaceCounterCharge * 4 },
                      (_, i) => (
                        <text
                          key={i}
                          x={35 + i * 18}
                          y={118 - (i % 2) * 12}
                          fill="#fbbf24"
                          fontSize="11"
                        >
                          {surfaceCounterCharge === 1
                            ? "+"
                            : surfaceCounterCharge === 2
                              ? "2+"
                              : "3+"}
                        </text>
                      ),
                    )}
                    <text x="16" y="132" fill="#94a3b8" fontSize="9">
                      Oppositely charged ions compress the electric double layer
                      and cause coagulation.
                    </text>
                  </svg>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-cyan-50">
                      {selectedSurfaceColloid.note}
                    </div>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-amber-50">
                      Coagulating trend:{" "}
                      {selectedSurfaceColloid.coagulators.join(" > ")}.
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    {[
                      "Electrophoresis: particles move toward the oppositely charged electrode.",
                      "Coagulation value: minimum electrolyte concentration needed to coagulate a sol.",
                      "Protection: lyophilic colloids can shield lyophobic sols; lower gold number means better protection.",
                    ].map((note) => (
                      <div
                        key={note}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300"
                      >
                        {note}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {surfaceMode === "emulsions" && (
              <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                <div className="space-y-3">
                  <div>
                    <ControlLabel>
                      Emulsifier strength {surfaceEmulsifier}%
                    </ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={surfaceEmulsifier}
                      onChange={(e) =>
                        setSurfaceEmulsifier(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <MiniBar
                    label="emulsion stability"
                    value={emulsionStability}
                    color="#a78bfa"
                  />
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                    Oil-in-water emulsions disperse oil droplets in water;
                    water-in-oil emulsions disperse water droplets in oil.
                    Emulsifiers sit at the interface and reduce interfacial
                    tension.
                  </div>
                </div>
                <svg
                  viewBox="0 0 280 150"
                  className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
                >
                  <rect
                    x="20"
                    y="20"
                    width="240"
                    height="105"
                    rx="18"
                    fill="#38bdf8"
                    opacity="0.16"
                  />
                  {Array.from({ length: 8 }, (_, i) => (
                    <circle
                      key={i}
                      cx={48 + (i % 4) * 55}
                      cy={48 + Math.floor(i / 4) * 42}
                      r={12 + (i % 3)}
                      fill="#f59e0b"
                      opacity="0.82"
                      stroke="#f8fafc"
                      strokeWidth={surfaceEmulsifier / 35}
                    />
                  ))}
                  <text x="30" y="140" fill="#94a3b8" fontSize="9">
                    Emulsifier coating prevents droplets from merging.
                  </text>
                </svg>
              </div>
            )}
            {surfaceMode === "micelles" && (
              <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-4">
                <div className="space-y-3">
                  <div>
                    <ControlLabel>
                      Surfactant concentration{" "}
                      {surfaceSurfactantConc.toFixed(1)} x CMC
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={surfaceSurfactantConc}
                      onChange={(e) =>
                        setSurfaceSurfactantConc(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div
                    className={`rounded-xl border p-3 text-sm ${micelleFormed ? "bg-emerald-500/10 border-emerald-400/20 text-emerald-50" : "bg-amber-500/10 border-amber-400/20 text-amber-50"}`}
                  >
                    {micelleFormed
                      ? "Above CMC: micelles form and trap oily dirt in hydrophobic cores."
                      : "Below CMC: mostly individual surfactant ions; cleansing is weaker."}
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                    Cleansing action: hydrophobic tails dissolve in grease,
                    hydrophilic heads stay in water, agitation breaks grease
                    into micelles that rinse away.
                  </div>
                </div>
                <svg
                  viewBox="0 0 280 170"
                  className="w-full h-60 rounded-xl bg-black/20 border border-white/10"
                >
                  <circle
                    cx="140"
                    cy="80"
                    r="35"
                    fill="#f59e0b"
                    opacity="0.75"
                  />
                  {Array.from({ length: micelleFormed ? 18 : 7 }, (_, i) => {
                    const angle = (Math.PI * 2 * i) / (micelleFormed ? 18 : 7);
                    const x1 = 140 + Math.cos(angle) * 43;
                    const y1 = 80 + Math.sin(angle) * 43;
                    const x2 = 140 + Math.cos(angle) * 24;
                    const y2 = 80 + Math.sin(angle) * 24;
                    return (
                      <g key={i}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#94a3b8"
                          strokeWidth="2"
                        />
                        <circle cx={x1} cy={y1} r="4" fill="#38bdf8" />
                      </g>
                    );
                  })}
                  <text
                    x="92"
                    y="84"
                    fill="#111827"
                    fontSize="10"
                    fontWeight="800"
                  >
                    oil/grease
                  </text>
                  <text x="28" y="150" fill="#94a3b8" fontSize="9">
                    Heads face water; tails face oil. Hard water Ca2+/Mg2+ can
                    form scum.
                  </text>
                </svg>
              </div>
            )}
            {surfaceMode === "exam" && (
              <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Scenario</ControlLabel>
                  <select
                    value={surfacePracticeIndex}
                    onChange={(e) =>
                      setSurfacePracticeIndex(Number(e.target.value))
                    }
                    className="input text-sm"
                  >
                    {surfacePracticeScenarios.map((item, index) => (
                      <option key={item.prompt} value={index}>
                        Question {index + 1}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                    <p className="text-xs text-gray-500">Prompt</p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {activeSurfacePractice.prompt}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-4 text-sm text-emerald-50">
                    {activeSurfacePractice.answer}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    [
                      "Hardy-Schulze",
                      "For a negative sol: Al3+ > Ba2+ > Na+. For a positive sol: PO4 3- > SO4 2- > Cl-.",
                    ],
                    [
                      "Micelles",
                      "Form only above CMC and above Kraft temperature for soaps.",
                    ],
                    [
                      "Emulsions",
                      "Oil-in-water conducts better than water-in-oil and feels less greasy.",
                    ],
                    [
                      "Catalysis",
                      "Promoters increase activity; poisons reduce activity by blocking active sites.",
                    ],
                    [
                      "Adsorption",
                      "Positive adsorption concentrates solute at surface; negative adsorption depletes it.",
                    ],
                    [
                      "Colloid charge",
                      "Charge often comes from preferential ion adsorption on particle surface.",
                    ],
                  ].map(([title, note]) => (
                    <article
                      key={title}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <h5 className="font-black text-white">{title}</h5>
                      <p className="mt-2 text-gray-300">{note}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </Bench>
        );
      case "orbital-shape":
        return (
          <Bench title="Orbital Shape Viewer" result={orbital.note}>
            <ControlLabel>Orbital</ControlLabel>
            <select
              value={orbitalType}
              onChange={(e) => setOrbitalType(e.target.value)}
              className="input text-sm mb-4"
            >
              {Object.keys(orbitalMeta).map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <div className="h-40 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
              {Array.from({ length: orbital.lobes }, (_, i) => (
                <span
                  key={i}
                  className="absolute w-20 h-12 rounded-[50%] opacity-80"
                  style={{
                    background: i % 2 ? "#ef4444" : "#38bdf8",
                    transform: `rotate(${(360 / orbital.lobes) * i}deg) translateX(${orbitalType === "s" ? 0 : 32}px)`,
                  }}
                />
              ))}
              <span className="absolute w-5 h-5 rounded-full bg-white" />
            </div>
          </Bench>
        );
      case "hybridization":
        return (
          <Bench
            title="Hybridization Animator"
            result={`${hybrid} hybrid orbitals are shown in the model.`}
          >
            <ControlLabel>Hybridization</ControlLabel>
            <select
              value={hybrid}
              onChange={(e) => setHybrid(e.target.value)}
              className="input text-sm mb-4"
            >
              {["sp", "sp2", "sp3", "dsp2", "sp3d"].map((h) => (
                <option key={h}>{h}</option>
              ))}
            </select>
            <div className="h-44 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-2">
              {Array.from(
                {
                  length:
                    hybrid === "sp"
                      ? 2
                      : hybrid === "sp2"
                        ? 3
                        : hybrid === "sp3"
                          ? 4
                          : 5,
                },
                (_, i) => (
                  <span
                    key={i}
                    className="w-12 h-20 rounded-[50%] bg-gradient-to-b from-pink-400 to-indigo-500 opacity-75"
                    style={{
                      transform: `rotate(${i * (180 / (hybrid === "sp" ? 1 : 4))}deg)`,
                    }}
                  />
                ),
              )}
            </div>
          </Bench>
        );
      case "vsepr":
        return (
          <Bench
            title="VSEPR Shape Builder"
            result={`${vsepr.shape}; angle ${geometry.angle}`}
          >
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div>
                <ControlLabel>Bonded atoms: {bondedAtoms}</ControlLabel>
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={bondedAtoms}
                  onChange={(e) => setBondedAtoms(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div>
                <ControlLabel>Lone pairs: {lonePairs}</ControlLabel>
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={lonePairs}
                  onChange={(e) => setLonePairs(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <svg
              viewBox="0 0 100 100"
              className="w-full h-44 rounded-xl bg-black/20 border border-white/10"
            >
              {geometry.points.slice(1).map((point, i) => (
                <line
                  key={i}
                  x1={geometry.points[0][0]}
                  y1={geometry.points[0][1]}
                  x2={point[0]}
                  y2={point[1]}
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
              ))}
              {geometry.points.map((point, i) => (
                <circle
                  key={i}
                  cx={point[0]}
                  cy={point[1]}
                  r={i === 0 ? 7 : 5}
                  fill={i === 0 ? "#38bdf8" : "#a78bfa"}
                />
              ))}
            </svg>
          </Bench>
        );
      case "bond-polarity":
      case "bond-predictor":
        return (
          <Bench
            title={activeExperiment.title}
            result={`${polarity.type}: ${polarity.note}`}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <ControlLabel>Element A</ControlLabel>
                <ElementSearchInput value={polarityA} onChange={setPolarityA} />
              </div>
              <div>
                <ControlLabel>Element B</ControlLabel>
                <ElementSearchInput value={polarityB} onChange={setPolarityB} />
              </div>
            </div>
          </Bench>
        );
      case "mechanism":
        return (
          <Bench
            title="Reaction Mechanism Player"
            result={
              mechanismSteps[
                Math.min(mechanismStep - 1, mechanismSteps.length - 1)
              ]
            }
          >
            <ControlLabel>Mechanism</ControlLabel>
            <select
              value={mechanism}
              onChange={(e) => setMechanism(e.target.value)}
              className="input text-sm mb-3"
            >
              {Object.keys(mechanismData).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <ControlLabel>Step {mechanismStep}</ControlLabel>
            <input
              type="range"
              min="1"
              max={mechanismSteps.length}
              value={mechanismStep}
              onChange={(e) => setMechanismStep(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "imf":
        return (
          <Bench
            title="Intermolecular Forces Demo"
            result={`${imfType} affects melting point, boiling point, and solubility.`}
          >
            <ControlLabel>Force type</ControlLabel>
            <select
              value={imfType}
              onChange={(e) => setImfType(e.target.value)}
              className="input text-sm"
            >
              {[
                "London dispersion",
                "dipole-dipole",
                "hydrogen bonding",
                "ion-dipole",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </Bench>
        );
      case "nuclear-decay":
      case "isotopes":
        return (
          <Bench
            title={activeExperiment.title}
            result={`${decayRemaining.toFixed(2)}% parent isotope remains.`}
          >
            <ControlLabel>Half-lives elapsed: {decayHalfLives}</ControlLabel>
            <input
              type="range"
              min="0"
              max="8"
              value={decayHalfLives}
              onChange={(e) => setDecayHalfLives(Number(e.target.value))}
              className="w-full"
            />
            <MiniBar
              label="parent isotope remaining"
              value={decayRemaining}
              color="#f87171"
            />
          </Bench>
        );
      case "nuclear-chemistry":
        return (
          <Bench title="Nuclear Chemistry Lab" result={activeResultText()}>
            <div className="flex flex-wrap gap-2 mb-4">
              {nuclearModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setNuclearMode(mode.id)}
                  className={`btn-secondary text-xs px-3 py-2 ${nuclearMode === mode.id ? "bg-rose-500/20 text-rose-100 border-rose-400/30" : ""}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {nuclearMode === "series" && (
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Series template</ControlLabel>
                  <select
                    value={nuclearSeries}
                    onChange={(e) => setNuclearSeries(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(nuclearSeriesTemplates).map(
                      ([id, item]) => (
                        <option key={id} value={id}>
                          {item.name}
                        </option>
                      ),
                    )}
                  </select>
                  <div>
                    <ControlLabel>
                      Steps shown {nuclearSeriesSteps}
                    </ControlLabel>
                    <input
                      type="range"
                      min="1"
                      max={selectedNuclearSeries.steps.length}
                      value={nuclearSeriesSteps}
                      onChange={(e) =>
                        setNuclearSeriesSteps(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                    Decay series are built by applying alpha and beta changes
                    repeatedly while conserving A and Z at every step.
                  </div>
                </div>
                <div className="space-y-2">
                  {nuclearSeriesRows.map((row) => (
                    <div
                      key={`${row.step}-${row.a}-${row.z}`}
                      className="grid grid-cols-[64px_1fr_100px] gap-2 items-center rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs"
                    >
                      <span className="font-black text-white">
                        Step {row.step}
                      </span>
                      <span className="font-mono text-cyan-100">
                        {row.a}/{row.z} {row.symbol}
                      </span>
                      <span className="text-gray-400">{row.emitted}</span>
                    </div>
                  ))}
                  <p className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-3 text-xs text-rose-50">
                    Series note: {selectedNuclearSeries.final}. Full natural
                    series continue until a stable lead isotope.
                  </p>
                </div>
              </div>
            )}
            {nuclearMode === "equations" && (
              <div className="grid lg:grid-cols-[300px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Nuclear equation prompt</ControlLabel>
                  <select
                    value={nuclearEquationId}
                    onChange={(e) => setNuclearEquationId(e.target.value)}
                    className="input text-sm"
                  >
                    {nuclearEquationPrompts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.parent} {item.decay}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="mt-2 text-lg font-black text-white font-mono">{`${selectedNuclearEquation.parent} -> ? + ${nuclearDecayModes[selectedNuclearEquation.decay].symbol}`}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-4">
                    <p className="text-xs text-emerald-300">Answer</p>
                    <p className="mt-2 text-xl font-black text-white font-mono">
                      {selectedNuclearEquation.answer}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2 text-xs">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Particle</p>
                      <p className="font-bold text-white">
                        {
                          nuclearDecayModes[selectedNuclearEquation.decay]
                            .particle
                        }
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Delta A</p>
                      <p className="font-bold text-white">
                        {
                          nuclearDecayModes[selectedNuclearEquation.decay]
                            .deltaA
                        }
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Delta Z</p>
                      <p className="font-bold text-white">
                        {
                          nuclearDecayModes[selectedNuclearEquation.decay]
                            .deltaZ
                        }
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-xs text-cyan-50">
                    {selectedNuclearEquation.reason}
                  </p>
                </div>
              </div>
            )}
            {nuclearMode === "binding" && (
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Isotope</ControlLabel>
                  <select
                    value={nuclearBindingIso}
                    onChange={(e) => setNuclearBindingIso(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(nuclearBindingIsotopes).map(
                      ([id, item]) => (
                        <option key={id} value={id}>
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                    Mass defect compares separated protons/neutrons with actual
                    nuclear mass. Larger binding energy per nucleon usually
                    means greater nuclear stability.
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2">
                  {[
                    ["Z protons", selectedBindingIso.z],
                    ["N neutrons", selectedBindingIso.n],
                    ["Mass defect", `${massDefect.toFixed(4)} u`],
                    ["Binding/nucleon", `${bindingPerNucleon.toFixed(2)} MeV`],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <p className="text-[10px] text-gray-500">{label}</p>
                      <p className="text-lg font-black text-white">{value}</p>
                    </div>
                  ))}
                  <svg
                    viewBox="0 0 260 120"
                    className="sm:col-span-2 xl:col-span-4 w-full h-40 rounded-xl bg-black/20 border border-white/10"
                  >
                    <line x1="25" y1="92" x2="235" y2="92" stroke="#64748b" />
                    <line x1="25" y1="20" x2="25" y2="92" stroke="#64748b" />
                    {Object.values(nuclearBindingIsotopes).map((iso, index) => {
                      const defect =
                        ((iso.z * PROTON_MASS_U +
                          iso.n * NEUTRON_MASS_U -
                          iso.mass) *
                          U_TO_MEV) /
                        (iso.z + iso.n);
                      return (
                        <circle
                          key={iso.label}
                          cx={45 + index * 58}
                          cy={92 - defect * 7}
                          r="6"
                          fill={
                            iso.label === selectedBindingIso.label
                              ? "#fb7185"
                              : "#38bdf8"
                          }
                        />
                      );
                    })}
                    <text x="35" y="112" fill="#94a3b8" fontSize="8">
                      Binding energy per nucleon comparison
                    </text>
                  </svg>
                </div>
              </div>
            )}
            {nuclearMode === "energetics" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Reaction type</ControlLabel>
                  <select
                    value={nuclearEnergeticCase}
                    onChange={(e) => setNuclearEnergeticCase(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(nuclearEnergeticExamples).map(
                      ([id, item]) => (
                        <option key={id} value={id}>
                          {item.label}
                        </option>
                      ),
                    )}
                  </select>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-center">
                    <p className="text-xs text-gray-500">Products</p>
                    <p className="text-lg font-black text-white">
                      {selectedEnergeticCase.products}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">Mass lost</p>
                      <p className="text-lg font-black text-white">
                        {energeticMassDefect.toFixed(4)} u
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-3">
                      <p className="text-[10px] text-rose-300">Energy</p>
                      <p className="text-lg font-black text-white">
                        {energeticMev.toFixed(1)} MeV
                      </p>
                    </div>
                    <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                      <p className="text-[10px] text-cyan-300">Per event</p>
                      <p className="text-lg font-black text-white">
                        {energeticJoulePerEvent.toExponential(2)} J
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                    {selectedEnergeticCase.note}
                  </p>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-amber-50">
                      Fission: neutron-induced splitting, critical mass,
                      moderators, control rods, and shielding matter.
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-emerald-50">
                      Fusion: high binding gain for light nuclei, but needs
                      extreme temperature and confinement.
                    </div>
                  </div>
                </div>
              </div>
            )}
            {nuclearMode === "dose" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Radiation type</ControlLabel>
                  <select
                    value={radiationType}
                    onChange={(e) => setRadiationType(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="alpha">Alpha</option>
                    <option value="beta">Beta</option>
                    <option value="gamma">Gamma</option>
                  </select>
                  <ControlLabel>Shield material</ControlLabel>
                  <select
                    value={shieldMaterial}
                    onChange={(e) => setShieldMaterial(e.target.value)}
                    className="input text-sm"
                  >
                    {Object.entries(shieldingMaterials).map(([id, item]) => (
                      <option key={id} value={id}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <div>
                    <ControlLabel>
                      Thickness {shieldThickness.toFixed(1)} cm
                    </ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.1"
                      value={shieldThickness}
                      onChange={(e) =>
                        setShieldThickness(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Absorbed dose {absorbedDose.toFixed(3)} Gy
                    </ControlLabel>
                    <input
                      type="range"
                      min="0.001"
                      max="0.2"
                      step="0.001"
                      value={absorbedDose}
                      onChange={(e) => setAbsorbedDose(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">HVL</p>
                      <p className="text-lg font-black text-white">
                        {hvl.toFixed(2)} cm
                      </p>
                    </div>
                    <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                      <p className="text-[10px] text-cyan-300">Transmitted</p>
                      <p className="text-lg font-black text-white">
                        {transmittedFraction.toFixed(2)}%
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-3">
                      <p className="text-[10px] text-rose-300">
                        Equivalent dose
                      </p>
                      <p className="text-lg font-black text-white">
                        {doseEquivalent.toFixed(3)} Sv
                      </p>
                    </div>
                  </div>
                  <MiniBar
                    label="radiation transmitted after shielding"
                    value={transmittedFraction}
                    color="#fb7185"
                  />
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(nuclearDecayModes).map(([id, item]) => (
                      <div
                        key={id}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                      >
                        <p className="font-black text-white">{item.label}</p>
                        <p className="mt-1 text-gray-300">
                          Shield: {item.shield}
                        </p>
                        <p className="mt-1 text-gray-500">{item.hazard}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Bench>
        );
      case "phase-diagram":
        return (
          <Bench
            title="Phase Diagram Explorer"
            result={`Predicted phase: ${phase}`}
          >
            <ControlLabel>Temperature {phaseTemp} C</ControlLabel>
            <input
              type="range"
              min="-50"
              max="450"
              value={phaseTemp}
              onChange={(e) => setPhaseTemp(Number(e.target.value))}
              className="w-full mb-3"
            />
            <ControlLabel>Pressure {phasePressure} atm</ControlLabel>
            <input
              type="range"
              min="0"
              max="250"
              value={phasePressure}
              onChange={(e) => setPhasePressure(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "mo-diagram":
        return (
          <Bench
            title="Molecular Orbital Diagram"
            result={`Bond order ${mo.order}; ${mo.magnetic}.`}
          >
            <ControlLabel>Molecule</ControlLabel>
            <select
              value={moMolecule}
              onChange={(e) => setMoMolecule(e.target.value)}
              className="input text-sm mb-3"
            >
              {Object.keys(moData).map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
            <div className="space-y-1">
              {mo.fill.map((row) => (
                <div
                  key={row}
                  className="rounded-lg bg-white/[0.05] border border-white/10 px-3 py-2 text-xs font-mono text-gray-200"
                >
                  {row}
                </div>
              ))}
            </div>
          </Bench>
        );
      case "rate-lab":
        return (
          <Bench
            title="Reaction Rate Lab"
            result={`Rate factor ${rateK.toFixed(2)} from current temperature and concentration.`}
          >
            <ControlLabel>Temperature {rateTemp} C</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={rateTemp}
              onChange={(e) => setRateTemp(Number(e.target.value))}
              className="w-full mb-3"
            />
            <ControlLabel>Concentration {rateConc.toFixed(1)} M</ControlLabel>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={rateConc}
              onChange={(e) => setRateConc(Number(e.target.value))}
              className="w-full"
            />
            <svg
              viewBox="0 0 260 90"
              className="w-full h-32 mt-4 rounded-xl bg-black/20 border border-white/10"
            >
              <polyline
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                points={ratePoints.map((p) => `${p.x},${p.y}`).join(" ")}
              />
            </svg>
          </Bench>
        );
      case "calorimetry":
        return (
          <Bench
            title="Calorimetry Experiment"
            result={`Final temperature: ${finalTemp.toFixed(2)} C`}
          >
            <ControlLabel>Metal temperature {metalTemp} C</ControlLabel>
            <input
              type="range"
              min="25"
              max="200"
              value={metalTemp}
              onChange={(e) => setMetalTemp(Number(e.target.value))}
              className="w-full mb-3"
            />
            <ControlLabel>Metal mass {metalMass} g</ControlLabel>
            <input
              type="range"
              min="5"
              max="200"
              value={metalMass}
              onChange={(e) => setMetalMass(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "solubility":
        return (
          <Bench
            title="Solubility Lab"
            result={
              precipitates
                ? "Precipitate forms because Q is greater than Ksp."
                : "No precipitate yet; Q is below Ksp."
            }
          >
            <ControlLabel>Salt</ControlLabel>
            <select
              value={salt}
              onChange={(e) => setSalt(e.target.value)}
              className="input text-sm mb-3"
            >
              {Object.keys(kspData).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ControlLabel>Salt added {saltAdded} mol</ControlLabel>
            <input
              type="range"
              min="0"
              max="0.01"
              step="0.0005"
              value={saltAdded}
              onChange={(e) => setSaltAdded(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "indicator":
        return (
          <Bench
            title="Indicator Color Table"
            result={`${indicator} at pH ${solutionPh}`}
          >
            <ControlLabel>Indicator</ControlLabel>
            <select
              value={indicator}
              onChange={(e) => setIndicator(e.target.value)}
              className="input text-sm mb-3"
            >
              {Object.keys(indicators).map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
            <ControlLabel>pH {solutionPh}</ControlLabel>
            <input
              type="range"
              min="0"
              max="14"
              step="0.1"
              value={solutionPh}
              onChange={(e) => setSolutionPh(Number(e.target.value))}
              className="w-full"
            />
            <div
              className="h-24 rounded-xl border border-white/10 mt-4"
              style={{ background: indicatorColor(indicator, solutionPh) }}
            />
          </Bench>
        );
      case "soap":
        return (
          <Bench
            title="Soap Making"
            result={`Saponification progress: ${sapProgress}%`}
          >
            <ControlLabel>Reaction progress {sapProgress}%</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={sapProgress}
              onChange={(e) => setSapProgress(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "fermentation":
        return (
          <Bench
            title="Fermentation Simulator"
            result={`Yeast activity: ${yeastActivity.toFixed(0)}%`}
          >
            <ControlLabel>Temperature {yeastTemp} C</ControlLabel>
            <input
              type="range"
              min="0"
              max="60"
              value={yeastTemp}
              onChange={(e) => setYeastTemp(Number(e.target.value))}
              className="w-full"
            />
            <MiniBar
              label="yeast activity"
              value={yeastActivity}
              color="#f59e0b"
            />
          </Bench>
        );
      case "polymer":
        return (
          <Bench
            title="Polymer Builder"
            result={`${polymerLength} repeating units in the chain.`}
          >
            <ControlLabel>Chain length {polymerLength}</ControlLabel>
            <input
              type="range"
              min="2"
              max="20"
              value={polymerLength}
              onChange={(e) => setPolymerLength(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex flex-wrap gap-1 mt-4">
              {Array.from({ length: polymerLength }, (_, i) => (
                <span
                  key={i}
                  className="w-8 h-8 rounded-full bg-cyan-500/30 border border-cyan-300/30"
                />
              ))}
            </div>
          </Bench>
        );
      case "buffer":
        return (
          <Bench
            title="Buffer Solution Lab"
            result={`Buffer pH ${bufferPh.toFixed(2)} vs pure water pH ${pureWaterPh.toFixed(2)}`}
          >
            <ControlLabel>Acid/base added {bufferAdded}</ControlLabel>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={bufferAdded}
              onChange={(e) => setBufferAdded(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "recrystallization":
        return (
          <Bench
            title="Recrystallization Visualizer"
            result={`Supersaturation: ${supersaturation.toFixed(1)}%`}
          >
            <ControlLabel>Temperature {recrystTemp} C</ControlLabel>
            <input
              type="range"
              min="0"
              max="100"
              value={recrystTemp}
              onChange={(e) => setRecrystTemp(Number(e.target.value))}
              className="w-full"
            />
          </Bench>
        );
      case "bohr":
      case "timeline":
      case "element-pack":
      case "abundance":
      case "trend-graph":
      case "safety-valency":
      case "molecule-links":
        return (
          <Bench
            title={activeExperiment.title}
            result={`Current element: ${selected.name} (${selected.symbol})`}
          >
            <ControlLabel>Element</ControlLabel>
            <ElementSearchInput
              value={selectedSymbol}
              onChange={setSelectedSymbol}
              className="mb-4"
            />
            <div className="grid sm:grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[10px] text-gray-500">Shells</p>
                <p className="text-lg font-black text-white">
                  {selected.shells?.join("-")}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[10px] text-gray-500">Category</p>
                <p className="text-sm text-gray-200">{selected.category}</p>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="text-[10px] text-gray-500">Discovered</p>
                <p className="text-sm text-gray-200">
                  {selected.yearDiscovered || "Ancient"}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">{selected.summary}</p>
          </Bench>
        );
      case "concept-helper":
        return (
          <Bench title="Concept Helper" result={conceptAnswer}>
            <ControlLabel>Question</ControlLabel>
            <textarea
              value={conceptQuestion}
              onChange={(e) => setConceptQuestion(e.target.value)}
              className="input min-h-24 text-sm"
            />
          </Bench>
        );
      case "unit-cell":
        return (
          <Bench
            title="Unit Cell Calculator"
            result={`For ${unitCellType}: Z(theory) = ${selectedUnitCell.z}, calculated Z = ${unitCellCalculatedZ.toFixed(2)}, calculated density = ${unitCellCalculatedDensity.toFixed(3)} g/cm3`}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div>
                <ControlLabel>Unit cell type</ControlLabel>
                <select
                  value={unitCellType}
                  onChange={(e) => {
                    const next = e.target.value;
                    setUnitCellType(next);
                    setUnitCellZInput(unitCellData[next].z);
                  }}
                  className="input text-sm mb-3"
                >
                  {Object.keys(unitCellData).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <UnitCellSvg type={unitCellType} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Atoms / cell</p>
                    <p className="text-2xl font-black text-white">
                      {selectedUnitCell.atoms}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Packing</p>
                    <p className="text-2xl font-black text-white">
                      {selectedUnitCell.packing}%
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Coordination</p>
                    <p className="text-2xl font-black text-white">
                      {selectedUnitCell.coordination}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-sm text-cyan-50">
                  Void types: {selectedUnitCell.voids}
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-center font-mono text-sm text-gray-200">
                  rho = ZM / (Na x a^3)
                </div>
                <div className="grid sm:grid-cols-4 gap-2">
                  <div>
                    <ControlLabel>a (pm)</ControlLabel>
                    <input
                      type="number"
                      value={unitCellA}
                      onChange={(e) => setUnitCellA(Number(e.target.value))}
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <ControlLabel>density</ControlLabel>
                    <input
                      type="number"
                      value={unitCellDensity}
                      onChange={(e) =>
                        setUnitCellDensity(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <ControlLabel>M (g/mol)</ControlLabel>
                    <input
                      type="number"
                      value={unitCellMolarMass}
                      onChange={(e) =>
                        setUnitCellMolarMass(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                  </div>
                  <div>
                    <ControlLabel>Z</ControlLabel>
                    <input
                      type="number"
                      value={unitCellZInput}
                      onChange={(e) =>
                        setUnitCellZInput(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3">
                    <p className="text-[10px] text-emerald-300">
                      Find Z from rho, a, M
                    </p>
                    <p className="text-xl font-black text-white">
                      {unitCellCalculatedZ.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-violet-500/10 border border-violet-400/20 p-3">
                    <p className="text-[10px] text-violet-300">
                      Find density from Z, a, M
                    </p>
                    <p className="text-xl font-black text-white">
                      {unitCellCalculatedDensity.toFixed(3)} g/cm3
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "named-reactions":
        return (
          <Bench
            title="Named Reactions Reference"
            result={`${filteredNamedReactions.length} reaction${filteredNamedReactions.length === 1 ? "" : "s"} match the current filters.`}
          >
            <div className="grid lg:grid-cols-[1fr_170px_190px] gap-2 mb-4">
              <div>
                <ControlLabel>
                  Search reaction, reagent, product, or mechanism
                </ControlLabel>
                <input
                  value={namedReactionSearch}
                  onChange={(e) => setNamedReactionSearch(e.target.value)}
                  className="input text-sm"
                  placeholder="Try Sandmeyer, AlCl3, diazonium, catalyst..."
                />
              </div>
              <div>
                <ControlLabel>Category</ControlLabel>
                <div className="flex flex-wrap gap-1">
                  {["All", "Organic", "Inorganic", "Industrial"].map(
                    (category) => (
                      <button
                        key={category}
                        onClick={() => setNamedReactionCategory(category)}
                        className={`btn-secondary text-[11px] px-2 py-1 ${namedReactionCategory === category ? "bg-cyan-500/20 text-cyan-200" : ""}`}
                      >
                        {category}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div>
                <ControlLabel>Exam level</ControlLabel>
                <div className="flex flex-wrap gap-1">
                  {["All", ...organicTracks].map((track) => (
                    <button
                      key={track}
                      onClick={() => setNamedReactionTrack(track)}
                      className={`btn-secondary text-[11px] px-2 py-1 ${namedReactionTrack === track ? "bg-violet-500/20 text-violet-200" : ""}`}
                    >
                      {track}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredNamedReactions.map((reaction) => (
                <article
                  key={reaction.name}
                  className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-black text-white">
                      {reaction.name}
                    </h5>
                    <BadgePill
                      className={
                        reaction.category === "Organic"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/25"
                          : reaction.category === "Industrial"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/25"
                            : "bg-blue-500/15 text-blue-300 border-blue-500/25"
                      }
                    >
                      {reaction.category}
                    </BadgePill>
                  </div>
                  <p className="mt-3 rounded-lg bg-black/20 border border-white/10 p-2 text-xs font-mono text-cyan-100">
                    {reaction.equation}
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-gray-300">
                    <p>
                      <span className="text-gray-500">Conditions:</span>{" "}
                      {reaction.conditions}
                    </p>
                    <p>
                      <span className="text-gray-500">Mechanism:</span>{" "}
                      {reaction.mechanism}
                    </p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {reaction.level.map((level) => (
                      <BadgePill
                        key={level}
                        className="bg-black/15 text-gray-300 border-white/10"
                      >
                        {level}
                      </BadgePill>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </Bench>
        );
      case "organic-reaction-bank":
        return (
          <Bench
            title="Organic Reaction Bank Depth"
            result={activeResultText()}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {organicBankModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setOrganicBankMode(mode.id)}
                  className={`btn-secondary text-xs px-3 py-2 ${organicBankMode === mode.id ? "bg-emerald-500/20 text-emerald-100 border-emerald-400/30" : ""}`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            {organicBankMode === "transformations" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div>
                  <ControlLabel>Transformation</ControlLabel>
                  <select
                    value={organicTransformation}
                    onChange={(e) => setOrganicTransformation(e.target.value)}
                    className="input text-sm"
                  >
                    {reagentTransformations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.from} to {item.to}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 rounded-xl bg-black/20 border border-white/10 p-3 text-center">
                    <p className="text-xs text-gray-500">Route target</p>
                    <p className="text-lg font-black text-white">
                      {selectedTransformation.from}
                    </p>
                    <p className="text-cyan-300 font-mono">-&gt;</p>
                    <p className="text-lg font-black text-white">
                      {selectedTransformation.to}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid md:grid-cols-3 gap-2">
                    {selectedTransformation.reagents.map((reagent) => (
                      <div
                        key={reagent}
                        className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-xs text-emerald-50"
                      >
                        <p className="font-mono">{reagent}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Selectivity</p>
                      <p className="text-gray-200 mt-1">
                        {selectedTransformation.selectivity}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3">
                      <p className="text-amber-200 font-bold">Watch out</p>
                      <p className="text-amber-50 mt-1">
                        {selectedTransformation.caution}
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-2 text-xs">
                    {organicCompatibilityRules.map((rule) => (
                      <article
                        key={rule.problem}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                      >
                        <h5 className="font-black text-white">
                          {rule.problem}
                        </h5>
                        <p className="mt-2 text-rose-200">
                          Avoid: {rule.avoid}
                        </p>
                        <p className="mt-2 text-cyan-100">Fix: {rule.fix}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {organicBankMode === "stereo" && (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                {stereochemicalOutcomes.map((item) => (
                  <article
                    key={item.reaction}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                  >
                    <h5 className="text-sm font-black text-white">
                      {item.reaction}
                    </h5>
                    <p className="mt-2 text-xs text-cyan-100">{item.outcome}</p>
                    <p className="mt-3 rounded-lg bg-black/20 border border-white/10 p-2 text-xs text-gray-400">
                      {item.cue}
                    </p>
                  </article>
                ))}
              </div>
            )}
            {organicBankMode === "rearrangements" && (
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div>
                  <ControlLabel>Rearrangement</ControlLabel>
                  <select
                    value={organicRearrangement}
                    onChange={(e) => setOrganicRearrangement(e.target.value)}
                    className="input text-sm"
                  >
                    {rearrangementData.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                  <svg
                    viewBox="0 0 220 125"
                    className="w-full h-40 mt-3 rounded-xl bg-black/20 border border-white/10"
                  >
                    <circle
                      cx="45"
                      cy="62"
                      r="18"
                      fill="#38bdf8"
                      opacity="0.82"
                    />
                    <path
                      d="M75 62 C105 20, 130 20, 158 62"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3"
                    />
                    <circle
                      cx="178"
                      cy="62"
                      r="18"
                      fill="#f472b6"
                      opacity="0.82"
                    />
                    <text
                      x="31"
                      y="66"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="800"
                    >
                      start
                    </text>
                    <text
                      x="160"
                      y="66"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="800"
                    >
                      new
                    </text>
                    <text x="62" y="112" fill="#94a3b8" fontSize="9">
                      1,2 migration reorganizes connectivity
                    </text>
                  </svg>
                </div>
                <div className="grid md:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-gray-500">Trigger</p>
                    <p className="text-white font-bold mt-1">
                      {selectedRearrangement.trigger}
                    </p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="text-cyan-300">Migration</p>
                    <p className="text-cyan-50 font-bold mt-1">
                      {selectedRearrangement.migration}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3">
                    <p className="text-emerald-300">Product logic</p>
                    <p className="text-emerald-50 font-bold mt-1">
                      {selectedRearrangement.product}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {organicBankMode === "pericyclic" && (
              <div className="grid md:grid-cols-2 gap-3">
                {pericyclicBasics.map((item) => (
                  <article
                    key={item.name}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="text-sm font-black text-white">
                        {item.name}
                      </h5>
                      <BadgePill className="bg-violet-500/15 text-violet-300 border-violet-500/25">
                        concerted
                      </BadgePill>
                    </div>
                    <p className="mt-2 text-xs text-violet-100">{item.rule}</p>
                    <p className="mt-2 text-xs text-gray-400">{item.use}</p>
                  </article>
                ))}
              </div>
            )}
            {organicBankMode === "protecting" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-gray-400 border-b border-white/10">
                    <tr>
                      <th className="py-2 pr-3">Group</th>
                      <th className="py-2 pr-3">Protects</th>
                      <th className="py-2 pr-3">Install</th>
                      <th className="py-2 pr-3">Remove</th>
                      <th className="py-2">Use when</th>
                    </tr>
                  </thead>
                  <tbody>
                    {protectingGroups.map((item) => (
                      <tr key={item.group} className="border-b border-white/5">
                        <td className="py-2 pr-3 font-bold text-white">
                          {item.group}
                        </td>
                        <td className="py-2 pr-3 text-cyan-100">
                          {item.protects}
                        </td>
                        <td className="py-2 pr-3 text-gray-300">
                          {item.install}
                        </td>
                        <td className="py-2 pr-3 text-gray-300">
                          {item.remove}
                        </td>
                        <td className="py-2 text-gray-400">{item.when}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {organicBankMode === "drills" && (
              <div className="grid lg:grid-cols-[260px_1fr] gap-4">
                <div>
                  <ControlLabel>Synthesis target</ControlLabel>
                  <select
                    value={organicDrill}
                    onChange={(e) => setOrganicDrill(e.target.value)}
                    className="input text-sm"
                  >
                    {synthesisDrills.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.target}
                      </option>
                    ))}
                  </select>
                  <div className="mt-3 rounded-xl bg-black/20 border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Start</p>
                    <p className="text-base font-black text-white">
                      {selectedSynthesisDrill.start}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-3">Target</p>
                    <p className="text-base font-black text-emerald-200">
                      {selectedSynthesisDrill.target}
                    </p>
                  </div>
                  <div className="mt-3 rounded-xl bg-violet-500/10 border border-violet-400/20 p-3 text-xs text-violet-50">
                    <p className="font-bold text-violet-200">
                      Retrosynthetic clue
                    </p>
                    <p className="mt-1">
                      {selectedSynthesisDrill.disconnection}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedSynthesisDrill.steps.map((step, index) => (
                    <div
                      key={step}
                      className="flex gap-3 rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <span className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-100 flex items-center justify-center text-sm font-black">
                        {index + 1}
                      </span>
                      <p className="text-sm text-gray-200 pt-1">{step}</p>
                    </div>
                  ))}
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3 text-xs text-cyan-50">
                    {selectedSynthesisDrill.check}
                  </div>
                  <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-xs text-amber-50">
                    <span className="font-bold text-amber-200">
                      Common trap:
                    </span>{" "}
                    {selectedSynthesisDrill.trap}
                  </div>
                </div>
              </div>
            )}
            {organicBankMode === "quickcheck" && (
              <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-4">
                <div className="space-y-3">
                  <ControlLabel>Prompt</ControlLabel>
                  <select
                    value={organicPromptIndex}
                    onChange={(e) =>
                      setOrganicPromptIndex(Number(e.target.value))
                    }
                    className="input text-sm"
                  >
                    {organicQuickPrompts.map((item, index) => (
                      <option key={item.prompt} value={index}>
                        Prompt {index + 1}
                      </option>
                    ))}
                  </select>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                    <p className="text-xs text-gray-500">Question</p>
                    <p className="mt-2 text-sm font-bold text-white">
                      {activeOrganicPrompt.prompt}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-4 text-sm text-emerald-50">
                    {activeOrganicPrompt.answer}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  {[
                    [
                      "Reagent-first thinking",
                      "Map substrate class, product class, oxidation level, and skeleton change before choosing reagent.",
                    ],
                    [
                      "Stereo check",
                      "Ask whether the mechanism is planar, backside, syn addition, anti addition, or concerted.",
                    ],
                    [
                      "Rearrangement check",
                      "If a carbocation appears, test hydride/methyl shift before final product.",
                    ],
                    [
                      "Protection check",
                      "Protect only when a functional group would react under the planned conditions.",
                    ],
                    [
                      "Pericyclic check",
                      "Count pi electrons and decide thermal versus photochemical mode.",
                    ],
                    [
                      "Route economy",
                      "Prefer routes that control selectivity and avoid unnecessary protection steps.",
                    ],
                  ].map(([title, note]) => (
                    <article
                      key={title}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <h5 className="font-black text-white">{title}</h5>
                      <p className="mt-2 text-gray-300">{note}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </Bench>
        );
      case "reactivity-series":
        return (
          <Bench
            title="Reactivity Series & Displacement Simulator"
            result={reactivityEquation}
          >
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                <p className="text-xs font-bold text-white mb-3">
                  Most reactive to least reactive
                </p>
                <div className="space-y-1">
                  {reactivityMetals.map((metal) => (
                    <button
                      key={metal.symbol}
                      onClick={() => setReactivityMetal(metal.symbol)}
                      className={`w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs border ${reactivityMetal === metal.symbol ? "bg-white/10 border-white/25 text-white" : "border-white/10 text-gray-300 hover:bg-white/[0.05]"}`}
                    >
                      <span
                        className="w-8 h-7 rounded-md flex items-center justify-center font-black text-slate-950"
                        style={{ background: metal.color }}
                      >
                        {metal.symbol}
                      </span>
                      <span>{metal.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div>
                    <ControlLabel>Metal strip</ControlLabel>
                    <select
                      value={reactivityMetal}
                      onChange={(e) => setReactivityMetal(e.target.value)}
                      className="input text-sm"
                    >
                      {reactivityMetals
                        .filter((m) => m.symbol !== "H")
                        .map((m) => (
                          <option key={m.symbol}>{m.symbol}</option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <ControlLabel>Salt solution</ControlLabel>
                    <select
                      value={reactivitySalt}
                      onChange={(e) => setReactivitySalt(e.target.value)}
                      className="input text-sm"
                    >
                      {saltSolutions.map((solution) => (
                        <option key={solution.salt}>{solution.salt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <ControlLabel>Reaction mode</ControlLabel>
                    <select
                      value={reactivityMode}
                      onChange={(e) => setReactivityMode(e.target.value)}
                      className="input text-sm"
                    >
                      <option value="salt">Displacement</option>
                      <option value="water">With water</option>
                      <option value="hcl">Dilute HCl</option>
                      <option value="acid">Dilute acid</option>
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-[1fr_1.1fr] gap-3">
                  <svg
                    viewBox="0 0 240 170"
                    className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
                  >
                    <rect
                      x="62"
                      y="48"
                      width="116"
                      height="90"
                      rx="14"
                      fill={
                        reactivityMode === "salt"
                          ? selectedSaltSolution.color
                          : reactivityMode === "water"
                            ? "#bae6fd"
                            : "#fde68a"
                      }
                      opacity="0.75"
                      stroke="#e2e8f0"
                    />
                    <rect
                      x="102"
                      y="22"
                      width="22"
                      height="102"
                      rx="8"
                      fill={selectedReactivityMetal.color}
                    />
                    {(reactivityMode === "salt"
                      ? displacementHappens
                      : reactivityMode === "water"
                        ? waterReactionHappens
                        : acidReactionHappens) &&
                      Array.from({ length: 12 }, (_, i) => (
                        <circle
                          key={i}
                          cx={76 + (i % 6) * 18}
                          cy={66 + Math.floor(i / 6) * 24}
                          r={3 + (i % 3)}
                          fill="#f8fafc"
                          opacity="0.85"
                        />
                      ))}
                    <text
                      x="120"
                      y="154"
                      textAnchor="middle"
                      fill="#cbd5e1"
                      fontSize="9"
                    >
                      {reactivityMode === "salt"
                        ? displacementHappens
                          ? "displacement occurs"
                          : "no displacement"
                        : reactionMediumNotes[reactivityMode]}
                    </text>
                  </svg>
                  <div className="space-y-3">
                    <div
                      className={`rounded-xl border p-4 ${reactivityMode === "salt" ? (displacementHappens ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-100" : "bg-amber-500/10 border-amber-500/25 text-amber-100") : "bg-cyan-500/10 border-cyan-500/25 text-cyan-100"}`}
                    >
                      <p className="text-sm font-black">
                        {reactivityMode === "salt"
                          ? displacementHappens
                            ? "Displacement happens"
                            : "No displacement"
                          : "Medium rule"}
                      </p>
                      <p className="text-xs mt-1">
                        {reactivityMode === "salt"
                          ? `${reactivityMetal} is ${displacementHappens ? "above" : "below"} ${selectedSaltSolution.metal} in the series.`
                          : reactionMediumNotes[reactivityMode]}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                      <p>
                        <span className="text-cyan-300 font-semibold">
                          Class 10 key:
                        </span>{" "}
                        Cu cannot displace Zn from ZnSO4 because copper is below
                        zinc in the reactivity series.
                      </p>
                      <p className="mt-2">
                        <span className="text-amber-300 font-semibold">
                          Corrosion:
                        </span>{" "}
                        iron forms tiny electrochemical cells with water and
                        oxygen, producing hydrated iron(III) oxide. Gold is too
                        unreactive to oxidize under normal conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "quantum-numbers":
        return (
          <Bench
            title="Quantum Numbers Explorer"
            result={
              quantumValid
                ? `${quantumOrbital} orbital, ml = ${quantumMl}, ms = ${quantumMs}; subshell capacity = ${subshellCapacity} electrons.`
                : "Illegal combination: l must be 0 to n-1, and ml must be from -l to +l."
            }
          >
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4 space-y-3">
                <div>
                  <ControlLabel>
                    n principal quantum number: {quantumN}
                  </ControlLabel>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={quantumN}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setQuantumN(next);
                      setQuantumL((l) => Math.min(l, next - 1));
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <ControlLabel>
                    l azimuthal quantum number: {quantumL}
                  </ControlLabel>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, quantumN - 1)}
                    value={quantumL}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      setQuantumL(next);
                      setQuantumMl((ml) => Math.max(-next, Math.min(next, ml)));
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <ControlLabel>
                    ml magnetic quantum number: {quantumMl}
                  </ControlLabel>
                  <input
                    type="range"
                    min={-quantumL}
                    max={quantumL}
                    value={quantumMl}
                    onChange={(e) => setQuantumMl(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <ControlLabel>ms spin quantum number</ControlLabel>
                  <select
                    value={quantumMs}
                    onChange={(e) => setQuantumMs(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="1/2">+1/2</option>
                    <option value="-1/2">-1/2</option>
                  </select>
                </div>
                <div
                  className={`rounded-xl border p-3 text-sm ${quantumValid ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-100" : "bg-red-500/10 border-red-500/25 text-red-100"}`}
                >
                  <p className="font-black">
                    {quantumValid
                      ? "Allowed quantum state"
                      : "Invalid quantum state"}
                  </p>
                  <p className="text-xs mt-1">
                    Orbital name: {quantumOrbital}. Allowed electrons in
                    subshell = 2(2l+1) = {subshellCapacity}.
                  </p>
                </div>
              </div>
              <div className="grid gap-3">
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">
                    de Broglie wavelength: lambda = h / mv
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={deBroglieMass}
                      onChange={(e) => setDeBroglieMass(Number(e.target.value))}
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      value={deBroglieVelocity}
                      onChange={(e) =>
                        setDeBroglieVelocity(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                  </div>
                  <p className="text-xs text-cyan-100 mt-2">
                    lambda = {deBroglieLambda.toExponential(3)} m
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">
                    Heisenberg: minimum dp = h / (4 pi dx)
                  </p>
                  <input
                    type="number"
                    value={uncertaintyDx}
                    onChange={(e) => setUncertaintyDx(Number(e.target.value))}
                    className="input text-sm"
                  />
                  <p className="text-xs text-cyan-100 mt-2">
                    minimum dp = {minMomentumUncertainty.toExponential(3)} kg
                    m/s
                  </p>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">
                    Photoelectric effect: KE = h nu - phi
                  </p>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={photoFrequency}
                      onChange={(e) =>
                        setPhotoFrequency(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      value={photoWorkFunction}
                      onChange={(e) =>
                        setPhotoWorkFunction(Number(e.target.value))
                      }
                      className="input text-sm"
                    />
                  </div>
                  <p
                    className={`text-xs mt-2 ${photoKE >= 0 ? "text-emerald-100" : "text-amber-100"}`}
                  >
                    KE = {Math.max(0, photoKE).toFixed(3)} eV{" "}
                    {photoKE < 0 ? "(no emission)" : ""}
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "gibbs":
        return (
          <Bench
            title="Gibbs Free Energy & Thermodynamic Spontaneity"
            result={`Delta G = ${gibbsValue.toFixed(2)} kJ/mol, so the reaction is ${gibbsValue < 0 ? "spontaneous" : "non-spontaneous"} at ${gibbsTemp} K. K = ${gibbsK.toExponential(2)}.`}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div className="space-y-3">
                <div>
                  <ControlLabel>Delta H (kJ/mol)</ControlLabel>
                  <input
                    type="number"
                    value={gibbsDeltaH}
                    onChange={(e) => setGibbsDeltaH(Number(e.target.value))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <ControlLabel>Delta S (J/mol K)</ControlLabel>
                  <input
                    type="number"
                    value={gibbsDeltaS}
                    onChange={(e) => setGibbsDeltaS(Number(e.target.value))}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <ControlLabel>Temperature {gibbsTemp} K</ControlLabel>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    value={gibbsTemp}
                    onChange={(e) => setGibbsTemp(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  Delta G = Delta H - T Delta S. Delta G standard = -RT ln K.{" "}
                  {gibbsCrossover && gibbsCrossover > 0
                    ? `Crossover T = ${gibbsCrossover.toFixed(1)} K.`
                    : "No positive crossover temperature for these signs."}
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                  <p className="text-sm font-bold text-white mb-2">
                    Kirchhoff law: Delta H2 = Delta H1 + Delta Cp(T2 - T1)
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={kirchhoffH1}
                      onChange={(e) => setKirchhoffH1(Number(e.target.value))}
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      value={kirchhoffCp}
                      onChange={(e) => setKirchhoffCp(Number(e.target.value))}
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      value={kirchhoffT1}
                      onChange={(e) => setKirchhoffT1(Number(e.target.value))}
                      className="input text-sm"
                    />
                    <input
                      type="number"
                      value={kirchhoffT2}
                      onChange={(e) => setKirchhoffT2(Number(e.target.value))}
                      className="input text-sm"
                    />
                  </div>
                  <p className="text-xs text-cyan-100 mt-2">
                    Delta H at T2 = {kirchhoffH2.toFixed(2)} kJ/mol
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <GibbsPlot dH={gibbsDeltaH} dS={gibbsDeltaS} temp={gibbsTemp} />
                <div className="grid sm:grid-cols-2 gap-2">
                  {gibbsSignTable.map((row) => (
                    <div
                      key={`${row.h}${row.s}`}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs"
                    >
                      <p className="font-black text-white">
                        Delta H {row.h}, Delta S {row.s}
                      </p>
                      <p className="text-cyan-100 mt-1">{row.when}</p>
                      <p className="text-gray-500 mt-1">{row.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Bench>
        );
      case "environmental-chem":
        return (
          <Bench title="Environmental Chemistry" result={activeResultText()}>
            <div className="flex flex-wrap gap-2 mb-4">
              {environmentalTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setEnvironmentTab(tab)}
                  className={`btn-secondary text-xs ${environmentTab === tab ? "bg-emerald-500/20 text-emerald-200" : ""}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            {environmentTab === "Ozone" && (
              <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-4">
                <AtmosphereSketch />
                <div className="grid gap-3 text-xs">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="font-bold text-white">Composition</p>
                    <p className="text-gray-400 mt-1">
                      Dry air is about 78% N2, 21% O2, 0.93% Ar, and about 0.04%
                      CO2, with variable water vapor.
                    </p>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="font-bold text-cyan-100">Chapman cycle</p>
                    <p className="text-cyan-50/90 mt-1">
                      {
                        "O2 + UV -> O + O; O + O2 -> O3; O3 + UV -> O2 + O. Stratospheric ozone absorbs harmful UV-B."
                      }
                    </p>
                  </div>
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                    <p className="font-bold text-red-100">
                      CFC destruction chain
                    </p>
                    <p className="text-red-100/80 mt-1">
                      {
                        "CCl2F2 + UV -> Cl radical; Cl + O3 -> ClO + O2; ClO + O -> Cl + O2. Chlorine is regenerated, so one radical can destroy many ozone molecules."
                      }
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-2">
                    {[
                      "Polar stratospheric clouds activate chlorine reservoirs.",
                      "Ozone thinning increases UV exposure and biological damage.",
                      "Montreal Protocol targeted CFC and halon emissions.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {environmentTab === "Smog" && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="font-bold text-white">Classical smog</p>
                    <p className="text-gray-400 mt-1">
                      Cool, humid, reducing smog from smoke, fog, SO2, and
                      particulates.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="font-bold text-white">Photochemical smog</p>
                    <p className="text-gray-400 mt-1">
                      Warm, sunny, oxidizing smog from NOx and hydrocarbons;
                      contains O3, aldehydes, and PAN.
                    </p>
                  </div>
                  <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-3">
                    <p className="font-bold text-violet-100">PAN formation</p>
                    <p className="text-violet-100/80 mt-1">
                      Hydrocarbon radicals + O2 + NO2 form peroxyacetyl nitrate,
                      an eye-irritating oxidant.
                    </p>
                  </div>
                </div>
                <div className="grid md:grid-cols-5 gap-2 text-xs">
                  {smogMechanismSteps.map(([title, equation], index) => (
                    <div
                      key={title}
                      className="rounded-xl bg-black/20 border border-white/10 p-3"
                    >
                      <p className="text-[10px] text-gray-500">
                        Step {index + 1}
                      </p>
                      <p className="font-black text-white">{title}</p>
                      <p className="mt-2 font-mono text-cyan-100">{equation}</p>
                    </div>
                  ))}
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 p-3 text-amber-50">
                    {
                      "Acid rain: SO2 + H2O -> H2SO3; NOx oxidizes and hydrates to HNO3. Marble damage: CaCO3 + H2SO4 -> CaSO4 + CO2 + H2O."
                    }
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300">
                    Control: reduce NOx and hydrocarbons using catalytic
                    converters, clean fuels, vapor recovery, and public
                    transport planning.
                  </div>
                </div>
              </div>
            )}
            {environmentTab === "Water Hardness" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-3">
                  <div>
                    <ControlLabel>Ca2+ {waterCaMgL} mg/L</ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={waterCaMgL}
                      onChange={(e) => setWaterCaMgL(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>Mg2+ {waterMgMgL} mg/L</ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={waterMgMgL}
                      onChange={(e) => setWaterMgMgL(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <MiniBar
                    label="hardness as CaCO3"
                    value={Math.min(100, hardnessAsCaCO3 / 4)}
                    color="#38bdf8"
                  />
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                      <p className="text-[10px] text-cyan-300">
                        Total hardness
                      </p>
                      <p className="text-xl font-black text-white">
                        {hardnessAsCaCO3.toFixed(0)} mg/L
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">Class</p>
                      <p className="text-xl font-black text-white">
                        {hardnessClass}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">Formula</p>
                      <p className="text-xs font-mono text-gray-200">
                        Ca x 2.497 + Mg x 4.118
                      </p>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-2 text-xs">
                    {[
                      "Temporary hardness: Ca/Mg bicarbonates, removable by boiling or lime.",
                      "Permanent hardness: Ca/Mg chlorides and sulfates, removed by washing soda, zeolite, or ion exchange.",
                      "Soap test: hard water wastes soap by forming insoluble Ca/Mg salts.",
                      "EDTA titration: EBT endpoint changes wine red to blue.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {environmentTab === "BOD/COD" && (
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div>
                      <ControlLabel>
                        Initial DO {bodInitialDo.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="0.1"
                        value={bodInitialDo}
                        onChange={(e) =>
                          setBodInitialDo(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Final DO {bodFinalDo.toFixed(1)}
                      </ControlLabel>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        step="0.1"
                        value={bodFinalDo}
                        onChange={(e) => setBodFinalDo(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Dilution {bodDilutionFactor.toFixed(1)}x
                      </ControlLabel>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={bodDilutionFactor}
                        onChange={(e) =>
                          setBodDilutionFactor(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                    <p className="text-[10px] text-cyan-300">BOD</p>
                    <p className="text-2xl font-black text-white">
                      {bodValue.toFixed(1)} mg/L
                    </p>
                    <p className="text-xs text-cyan-50 mt-1">
                      BOD = (D1 - D2) x dilution factor, usually over 5 days at
                      20 C.
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-4 gap-2">
                    <div>
                      <ControlLabel>
                        Blank {codBlankMl.toFixed(1)} mL
                      </ControlLabel>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.1"
                        value={codBlankMl}
                        onChange={(e) => setCodBlankMl(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>
                        Sample {codSampleMl.toFixed(1)} mL
                      </ControlLabel>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.1"
                        value={codSampleMl}
                        onChange={(e) => setCodSampleMl(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>N {codNormality.toFixed(2)}</ControlLabel>
                      <input
                        type="range"
                        min="0.02"
                        max="0.25"
                        step="0.01"
                        value={codNormality}
                        onChange={(e) =>
                          setCodNormality(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                    <div>
                      <ControlLabel>Aliquot {codAliquotMl} mL</ControlLabel>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={codAliquotMl}
                        onChange={(e) =>
                          setCodAliquotMl(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-rose-500/10 border border-rose-400/20 p-3">
                    <p className="text-[10px] text-rose-300">COD</p>
                    <p className="text-2xl font-black text-white">
                      {codValue.toFixed(0)} mg/L
                    </p>
                    <p className="text-xs text-rose-50 mt-1">
                      COD = (blank - sample) x N x 8000 / sample volume.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {environmentTab === "Eutrophication" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-3">
                  <div>
                    <ControlLabel>
                      Phosphate {phosphateMgL.toFixed(2)} mg/L
                    </ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="1.2"
                      step="0.01"
                      value={phosphateMgL}
                      onChange={(e) => setPhosphateMgL(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <ControlLabel>
                      Nitrate {nitrateMgL.toFixed(1)} mg/L
                    </ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="0.5"
                      value={nitrateMgL}
                      onChange={(e) => setNitrateMgL(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <MiniBar
                    label={`${eutrophicationLabel} risk`}
                    value={eutrophicationRisk}
                    color="#22c55e"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-xs">
                  {[
                    [
                      "Nutrient input",
                      "Fertilizer runoff, sewage, detergents, and animal waste add nitrate/phosphate.",
                    ],
                    [
                      "Algal bloom",
                      "Fast algal growth blocks light and changes pH/oxygen balance.",
                    ],
                    [
                      "Decomposition",
                      "Dead algae are decomposed by microbes, increasing BOD.",
                    ],
                    [
                      "Hypoxia",
                      "Dissolved oxygen falls; fish and aerobic organisms die.",
                    ],
                    [
                      "Control",
                      "Nutrient removal, riparian buffers, sewage treatment, phosphate-free detergents.",
                    ],
                    [
                      "Indicator",
                      "High phosphate is often the limiting trigger in freshwater systems.",
                    ],
                  ].map(([title, note]) => (
                    <div
                      key={title}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <p className="font-black text-white">{title}</p>
                      <p className="mt-1 text-gray-300">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {environmentTab === "Treatment" && (
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div>
                  <ControlLabel>Treatment method</ControlLabel>
                  <select
                    value={treatmentMethod}
                    onChange={(e) => setTreatmentMethod(e.target.value)}
                    className="input text-sm"
                  >
                    {pollutantTreatmentMethods.map((item) => (
                      <option key={item.method}>{item.method}</option>
                    ))}
                  </select>
                  <div className="mt-3 rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                    Match treatment to pollutant type: particulate,
                    biodegradable organic, nutrient, gas-phase acid precursor,
                    vehicle exhaust, or trace organic.
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">Target</p>
                      <p className="font-black text-white">
                        {selectedTreatmentMethod.target}
                      </p>
                    </div>
                    <div className="sm:col-span-2 rounded-xl bg-cyan-500/10 border border-cyan-400/20 p-3">
                      <p className="text-[10px] text-cyan-300">Chemistry</p>
                      <p className="font-bold text-cyan-50">
                        {selectedTreatmentMethod.chemistry}
                      </p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-xs text-emerald-50">
                    {selectedTreatmentMethod.output}
                  </p>
                  <div className="grid md:grid-cols-3 gap-2 text-xs">
                    {[
                      "Reduce at source first.",
                      "Separate physical solids before chemical polishing.",
                      "Track pH, BOD, COD, nutrients, turbidity, and toxicity after treatment.",
                    ].map((item) => (
                      <div
                        key={item}
                        className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-gray-300"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Bench>
        );
      case "cft":
        return (
          <Bench
            title="Crystal Field Theory Visualizer"
            result={`d${cftElectrons} ${cftGeometry.toLowerCase()} ${cftField}-field: CFSE = ${cftFilled.cfse.toFixed(1)} Delta units + ${cftFilled.pairs}P; unpaired = ${cftFilled.unpaired}; mu = ${cftMoment.toFixed(2)} BM.`}
          >
            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4">
              <div className="space-y-3">
                <div className="grid sm:grid-cols-2 gap-2">
                  <div>
                    <ControlLabel>Geometry</ControlLabel>
                    <select
                      value={cftGeometry}
                      onChange={(e) => setCftGeometry(e.target.value)}
                      className="input text-sm"
                    >
                      {Object.keys(cftGeometryData).map((geometry) => (
                        <option key={geometry}>{geometry}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <ControlLabel>Ligand field</ControlLabel>
                    <select
                      value={cftField}
                      onChange={(e) => setCftField(e.target.value)}
                      className="input text-sm"
                    >
                      <option value="strong">Strong field</option>
                      <option value="weak">Weak field</option>
                    </select>
                  </div>
                </div>
                <div>
                  <ControlLabel>d-electrons: d{cftElectrons}</ControlLabel>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={cftElectrons}
                    onChange={(e) => setCftElectrons(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <ControlLabel>
                    Delta energy: {cftDelta.toFixed(1)} eV
                  </ControlLabel>
                  <input
                    type="range"
                    min="0.8"
                    max="4"
                    step="0.1"
                    value={cftDelta}
                    onChange={(e) => setCftDelta(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <CftDiagram geometry={cftGeometry} filled={cftFilled} />
              </div>
              <div className="space-y-3">
                <div className="grid sm:grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">CFSE</p>
                    <p className="text-xl font-black text-white">
                      {cftFilled.cfse.toFixed(1)}Delta + {cftFilled.pairs}P
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Unpaired</p>
                    <p className="text-xl font-black text-white">
                      {cftFilled.unpaired}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                    <p className="text-[10px] text-gray-500">Moment</p>
                    <p className="text-xl font-black text-white">
                      {cftMoment.toFixed(2)} BM
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                  <p className="font-mono text-cyan-100">
                    mu = sqrt(n(n+2)) BM
                  </p>
                  <p className="mt-2">{cftGeometryData[cftGeometry].note}</p>
                  <p className="mt-2">
                    {
                      "Spectrochemical series: I- < Br- < Cl- < F- < OH- < H2O < NH3 < en < CN- < CO"
                    }
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <p className="text-xs text-gray-400">Color prediction</p>
                  <div
                    className="mt-2 h-16 rounded-xl border border-white/10"
                    style={{ background: cftComplement }}
                  />
                  <p className="text-xs text-gray-300 mt-2">
                    Absorbed wavelength about {cftWavelength.toFixed(0)} nm (
                    {cftAbsorbed}); displayed patch is the approximate
                    complementary color.
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "metallurgy":
        return (
          <Bench
            title="Metallurgy & Extraction Flowchart"
            result={`${metallurgyMetal}: ${activeMetallurgyStep.title} - ${activeMetallurgyStep.purpose}`}
          >
            <div className="grid lg:grid-cols-[240px_1fr] gap-4">
              <div>
                <ControlLabel>Metal</ControlLabel>
                <select
                  value={metallurgyMetal}
                  onChange={(e) => {
                    setMetallurgyMetal(e.target.value);
                    setMetallurgyStep(0);
                  }}
                  className="input text-sm mb-3"
                >
                  {Object.keys(metallurgyData).map((metal) => (
                    <option key={metal}>{metal}</option>
                  ))}
                </select>
                <div className="rounded-xl bg-black/20 border border-white/10 p-3 text-xs text-gray-300">
                  <p className="font-bold text-white mb-2">
                    Special refining methods
                  </p>
                  <p>
                    Van Arkel method: Ti/Zr + I2 forms volatile iodide,
                    decomposed on hot filament for pure metal.
                  </p>
                  <p className="mt-2">
                    Zone refining: used for Si, Ge, Ga; impurities concentrate
                    in molten zone.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid md:grid-cols-5 gap-2">
                  {selectedMetallurgy.map((step, index) => (
                    <button
                      key={step.title}
                      onClick={() => setMetallurgyStep(index)}
                      className={`rounded-xl border p-3 text-left transition-colors ${metallurgyStep === index ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-100" : "bg-white/[0.035] border-white/10 text-gray-300 hover:bg-white/[0.06]"}`}
                    >
                      <span className="block text-[10px] text-gray-500">
                        Step {index + 1}
                      </span>
                      <span className="block text-xs font-black">
                        {step.title}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-4">
                  <h5 className="text-lg font-black text-white">
                    {activeMetallurgyStep.title}
                  </h5>
                  <p className="text-sm text-gray-300 mt-1">
                    {activeMetallurgyStep.detail}
                  </p>
                  <p className="mt-3 rounded-lg bg-black/20 border border-white/10 p-3 text-xs font-mono text-cyan-100">
                    {activeMetallurgyStep.equation}
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    <span className="text-emerald-300 font-semibold">
                      Purpose:
                    </span>{" "}
                    {activeMetallurgyStep.purpose}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-100">
                  <p className="font-bold">Ellingham concept</p>
                  <p className="mt-1">
                    A metal can reduce an oxide if its oxide formation line lies
                    lower at that temperature. Approximate oxide stability:
                    Al2O3 and MgO very stable, ZnO/FeO moderate, Cu2O less
                    stable and easier to reduce.
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "salt-analysis":
        return (
          <Bench
            title="Full Qualitative Salt Analysis Simulator"
            result={`${saltAnalysisSample}: ${expectedSaltCation.ion} and ${expectedSaltAnion.ion}`}
          >
            <div className="space-y-4">
              <div className="grid lg:grid-cols-[280px_1fr] gap-4">
                <div className="space-y-3">
                  <div>
                    <ControlLabel>Unknown salt sample</ControlLabel>
                    <select
                      value={saltAnalysisSample}
                      onChange={(e) => {
                        const next = e.target.value;
                        const sample = saltUnknowns[next] || saltUnknowns.NaCl;
                        setSaltAnalysisSample(next);
                        setSaltCationTest(sample.cation);
                        setSaltAnionTest(sample.anion);
                        setSaltReagentStep(0);
                      }}
                      className="input text-sm"
                    >
                      {Object.keys(saltUnknowns).map((sample) => (
                        <option key={sample}>{sample}</option>
                      ))}
                    </select>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                      Preliminary clues
                    </p>
                    <div className="mt-3 space-y-2 text-xs text-gray-300">
                      <p>
                        <span className="text-cyan-300 font-semibold">
                          Appearance:
                        </span>{" "}
                        {activeSaltUnknown.appearance}
                      </p>
                      <p>
                        <span className="text-cyan-300 font-semibold">
                          Solubility:
                        </span>{" "}
                        {activeSaltUnknown.solubility}
                      </p>
                      <p>
                        <span className="text-cyan-300 font-semibold">
                          Dry heat:
                        </span>{" "}
                        {activeSaltUnknown.dryHeat}
                      </p>
                      <p>
                        <span className="text-cyan-300 font-semibold">
                          Flame:
                        </span>{" "}
                        {activeSaltUnknown.flame}
                      </p>
                      <p className="text-amber-200">
                        <span className="font-semibold">Clue:</span>{" "}
                        {activeSaltUnknown.clue}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-200">
                      Interference logic
                    </p>
                    <div className="mt-2 space-y-2 text-xs text-amber-50">
                      {(saltInterferenceAlerts.length
                        ? saltInterferenceAlerts
                        : [
                            "No major special interference for this sample, but still follow reagent order.",
                          ]
                      ).map((alert) => (
                        <p key={alert}>{alert}</p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                    <p className="text-xs font-bold text-white mb-2">
                      Flame colors
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
                      {flameReference.map(([ion, color]) => (
                        <span key={ion}>
                          {ion}: {color}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-5 gap-2">
                    {saltWorkflowStages.map((stage) => (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setSaltWorkflowStage(stage.id)}
                        className={`rounded-xl border p-3 text-left ${saltWorkflowStage === stage.id ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-50" : "border-white/10 bg-white/[0.035] text-gray-300 hover:bg-white/[0.06]"}`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {stage.label}
                        </span>
                        <span className="mt-1 block text-[11px] text-gray-500">
                          {stage.cue}
                        </span>
                      </button>
                    ))}
                  </div>

                  {saltWorkflowStage === "preliminary" && (
                    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {[
                          ["Color clue", activeSaltUnknown.appearance],
                          ["Solubility clue", activeSaltUnknown.solubility],
                          ["Dry heating clue", activeSaltUnknown.dryHeat],
                          ["Flame clue", activeSaltUnknown.flame],
                        ].map(([label, value]) => (
                          <div
                            key={label}
                            className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                              {label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>
                      <svg
                        viewBox="0 0 300 230"
                        className="h-72 w-full rounded-xl border border-white/10 bg-slate-950/70"
                      >
                        <rect
                          x="46"
                          y="42"
                          width="88"
                          height="126"
                          rx="18"
                          fill="#0f172a"
                          stroke="#334155"
                        />
                        <path
                          d="M56 126 C76 106, 106 142, 124 118 L124 154 L56 154Z"
                          fill={expectedSaltCation.color}
                          opacity="0.35"
                        />
                        <circle
                          cx="92"
                          cy="128"
                          r="18"
                          fill={expectedSaltCation.color}
                          opacity="0.8"
                        />
                        <rect
                          x="176"
                          y="62"
                          width="58"
                          height="108"
                          rx="12"
                          fill="#111827"
                          stroke="#64748b"
                        />
                        <path
                          d="M180 168 C194 140, 216 140, 230 168"
                          fill="#fb718533"
                          stroke="#fb7185"
                        />
                        <text x="54" y="196" fill="#cbd5e1" fontSize="11">
                          unknown solution
                        </text>
                        <text x="168" y="196" fill="#cbd5e1" fontSize="11">
                          flame / heat clue
                        </text>
                        <text x="52" y="24" fill="#94a3b8" fontSize="10">
                          Start with observations before adding group reagents.
                        </text>
                      </svg>
                    </div>
                  )}

                  {saltWorkflowStage === "anion" && (
                    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                      <div className="space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <ControlLabel>
                              Try anion confirmatory test
                            </ControlLabel>
                            <select
                              value={saltAnionTest}
                              onChange={(e) => setSaltAnionTest(e.target.value)}
                              className="input text-sm"
                            >
                              {Object.entries(anionConfirmatoryData).map(
                                ([id, test]) => (
                                  <option key={id} value={id}>
                                    {test.ion}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                          <div
                            className={`rounded-xl border p-3 ${saltAnionMatch ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50" : "border-amber-300/25 bg-amber-300/10 text-amber-50"}`}
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest">
                              {saltAnionMatch
                                ? "Correct anion"
                                : "Compare observation"}
                            </p>
                            <p className="mt-1 text-sm font-bold">
                              {saltAnionMatch
                                ? `${expectedSaltAnion.ion} confirmed`
                                : `Expected clue fits ${expectedSaltAnion.ion}`}
                            </p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="text-xs font-black text-white">
                              Selected test
                            </p>
                            <p className="mt-2 text-xs text-gray-300">
                              <span className="text-cyan-300">Reagent:</span>{" "}
                              {selectedSaltAnionTest.reagent}
                            </p>
                            <p className="mt-1 text-xs text-gray-300">
                              <span className="text-cyan-300">
                                Observation:
                              </span>{" "}
                              {selectedSaltAnionTest.observation}
                            </p>
                            <p className="mt-1 text-xs text-gray-300">
                              <span className="text-cyan-300">Confirm:</span>{" "}
                              {selectedSaltAnionTest.confirm}
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="text-xs font-black text-white">
                              Expected for unknown
                            </p>
                            <p className="mt-2 text-xs text-gray-300">
                              <span className="text-emerald-300">Ion:</span>{" "}
                              {expectedSaltAnion.ion}
                            </p>
                            <p className="mt-1 text-xs text-gray-300">
                              <span className="text-emerald-300">Group:</span>{" "}
                              {expectedSaltAnion.group}
                            </p>
                            <p className="mt-1 text-xs text-amber-200">
                              <span className="font-semibold">
                                Interference:
                              </span>{" "}
                              {expectedSaltAnion.interference}
                            </p>
                          </div>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                          {anionTests.map(([ion, reagent, observation]) => (
                            <div
                              key={ion}
                              className="rounded-lg bg-black/15 border border-white/10 p-2"
                            >
                              <p className="text-xs font-bold text-white">
                                {ion}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                {reagent}
                              </p>
                              <p className="text-[11px] text-gray-300 mt-1">
                                {observation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <svg
                        viewBox="0 0 260 250"
                        className="h-72 w-full rounded-xl border border-white/10 bg-slate-950/70"
                      >
                        <rect
                          x="74"
                          y="42"
                          width="112"
                          height="156"
                          rx="18"
                          fill="#0f172a"
                          stroke="#334155"
                        />
                        <path
                          d="M84 142 C106 120, 146 166, 176 132 L176 184 L84 184Z"
                          fill="#38bdf855"
                        />
                        <circle
                          cx="126"
                          cy="140"
                          r="18"
                          fill={saltAnionMatch ? "#22c55e" : "#f59e0b"}
                          opacity="0.85"
                        />
                        <circle
                          cx="148"
                          cy="154"
                          r="13"
                          fill="#e2e8f0"
                          opacity="0.75"
                        />
                        <text x="72" y="222" fill="#cbd5e1" fontSize="10">
                          {selectedSaltAnionTest.ion}:{" "}
                          {selectedSaltAnionTest.observation.slice(0, 34)}
                        </text>
                      </svg>
                    </div>
                  )}

                  {saltWorkflowStage === "cation" && (
                    <div className="grid lg:grid-cols-[1fr_300px] gap-4">
                      <div className="space-y-2">
                        {saltAnalysisGroups.map(
                          ([group, ions, observation]) => {
                            const activeGroup = group.includes(
                              `Group ${expectedSaltCation.group}`,
                            );
                            return (
                              <div
                                key={group}
                                className={`grid sm:grid-cols-[190px_1fr] gap-2 rounded-xl border p-3 ${activeGroup ? "border-emerald-300/30 bg-emerald-300/10" : "border-white/10 bg-white/[0.035]"}`}
                              >
                                <p className="text-xs font-bold text-cyan-100">
                                  {group}
                                </p>
                                <p className="text-xs text-gray-300">
                                  {ions} - {observation}
                                </p>
                              </div>
                            );
                          },
                        )}
                      </div>
                      <div className="space-y-3">
                        <ControlLabel>
                          Try cation confirmatory route
                        </ControlLabel>
                        <select
                          value={saltCationTest}
                          onChange={(e) => setSaltCationTest(e.target.value)}
                          className="input text-sm"
                        >
                          {Object.entries(cationSeparationData).map(
                            ([id, test]) => (
                              <option key={id} value={id}>
                                {test.ion} - Group {test.group}
                              </option>
                            ),
                          )}
                        </select>
                        <div
                          className={`rounded-xl border p-3 ${saltCationMatch ? "border-emerald-300/25 bg-emerald-300/10 text-emerald-50" : "border-amber-300/25 bg-amber-300/10 text-amber-50"}`}
                        >
                          <p className="text-xs font-black">
                            {saltCationMatch
                              ? "Cation route matches"
                              : "Cation route mismatch"}
                          </p>
                          <p className="mt-2 text-xs">
                            {saltCationMatch
                              ? selectedSaltCationTest.confirm
                              : `Expected ${expectedSaltCation.ion}: ${expectedSaltCation.observation}`}
                          </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-gray-300">
                          <p>
                            <span className="text-cyan-300">Reagent:</span>{" "}
                            {selectedSaltCationTest.reagent}
                          </p>
                          <p className="mt-1">
                            <span className="text-cyan-300">Observation:</span>{" "}
                            {selectedSaltCationTest.observation}
                          </p>
                          <p className="mt-1 text-amber-200">
                            <span className="font-semibold">Interference:</span>{" "}
                            {selectedSaltCationTest.interference}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {saltWorkflowStage === "confirm" && (
                    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                      <div className="space-y-3">
                        <ControlLabel>
                          Reagent sequence step {saltReagentStep + 1} of{" "}
                          {saltSequence.length}
                        </ControlLabel>
                        <input
                          type="range"
                          min="0"
                          max={saltSequence.length - 1}
                          value={saltReagentStep}
                          onChange={(e) =>
                            setSaltReagentStep(Number(e.target.value))
                          }
                          className="w-full"
                        />
                        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-cyan-200">
                            {activeSaltSequenceStep[1]}
                          </p>
                          <p className="mt-2 text-sm font-semibold text-white">
                            {activeSaltSequenceStep[2]}
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                            <p className="text-xs font-black text-emerald-100">
                              Cation confirmed
                            </p>
                            <p className="mt-2 text-sm text-white">
                              {expectedSaltCation.ion}
                            </p>
                            <p className="mt-1 text-xs text-emerald-50">
                              {expectedSaltCation.confirm}
                            </p>
                          </div>
                          <div className="rounded-xl border border-violet-300/20 bg-violet-300/10 p-3">
                            <p className="text-xs font-black text-violet-100">
                              Anion confirmed
                            </p>
                            <p className="mt-2 text-sm text-white">
                              {expectedSaltAnion.ion}
                            </p>
                            <p className="mt-1 text-xs text-violet-50">
                              {expectedSaltAnion.confirm}
                            </p>
                          </div>
                        </div>
                        <ol className="space-y-2 text-xs text-gray-300">
                          {saltSequence.map(
                            ([number, title, detail], index) => (
                              <li
                                key={title}
                                className={`rounded-lg border p-2 ${index <= saltReagentStep ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-50" : "border-white/10 bg-white/[0.03]"}`}
                              >
                                <span className="font-black">
                                  {number}. {title}:
                                </span>{" "}
                                {detail}
                              </li>
                            ),
                          )}
                        </ol>
                      </div>
                      <svg
                        viewBox="0 0 300 260"
                        className="h-80 w-full rounded-xl border border-white/10 bg-slate-950/70"
                      >
                        {saltSequence.map(([number, title], index) => {
                          const active = index <= saltReagentStep;
                          return (
                            <g key={title}>
                              {index > 0 && (
                                <line
                                  x1="150"
                                  y1={38 + (index - 1) * 45}
                                  x2="150"
                                  y2={65 + (index - 1) * 45}
                                  stroke={active ? "#22d3ee" : "#334155"}
                                  strokeWidth="4"
                                />
                              )}
                              <circle
                                cx="150"
                                cy={28 + index * 45}
                                r={active ? 17 : 13}
                                fill={active ? "#22c55e" : "#1e293b"}
                                stroke={active ? "#bbf7d0" : "#64748b"}
                                strokeWidth="3"
                              />
                              <text
                                x="146"
                                y={32 + index * 45}
                                fill={active ? "#052e16" : "#cbd5e1"}
                                fontSize="11"
                                fontWeight="900"
                              >
                                {number}
                              </text>
                              <text
                                x="176"
                                y={32 + index * 45}
                                fill="#cbd5e1"
                                fontSize="10"
                              >
                                {title}
                              </text>
                            </g>
                          );
                        })}
                        <text x="52" y="246" fill="#94a3b8" fontSize="10">
                          Do tests in order to avoid masking and contamination.
                        </text>
                      </svg>
                    </div>
                  )}

                  {saltWorkflowStage === "viva" && (
                    <div className="grid lg:grid-cols-[1fr_320px] gap-4">
                      <div className="space-y-3">
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            Viva prompt
                          </p>
                          <p className="mt-2 text-lg font-black text-white">
                            {saltVivaPrompts[saltVivaIndex][0]}
                          </p>
                          <p className="mt-3 text-sm text-emerald-100">
                            {saltVivaPrompts[saltVivaIndex][1]}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {saltVivaPrompts.map((prompt, index) => (
                            <button
                              key={prompt[0]}
                              onClick={() => setSaltVivaIndex(index)}
                              className={`btn-secondary text-xs ${saltVivaIndex === index ? "bg-cyan-500/20 text-cyan-200" : ""}`}
                            >
                              Q{index + 1}
                            </button>
                          ))}
                        </div>
                        <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-3 text-xs text-amber-50">
                          Final answer format: sample contains{" "}
                          {expectedSaltCation.ion} cation and{" "}
                          {expectedSaltAnion.ion} anion, therefore the salt is
                          consistent with {saltAnalysisSample}.
                        </div>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                        <p className="text-xs font-black text-white">
                          Exam checklist
                        </p>
                        <ul className="mt-3 space-y-2 text-xs text-gray-300">
                          <li>1. State preliminary observation.</li>
                          <li>2. Record reagent and exact observation.</li>
                          <li>3. Separate cation group before confirmation.</li>
                          <li>4. Confirm anion with a specific test.</li>
                          <li>5. Mention interference or why order matters.</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Bench>
        );
      case "pblock-advanced":
        return (
          <Bench
            title="p-Block Groups 15-18 Reference"
            result={`${pblockGroup}: ${pBlockData[pblockGroup][0][1]}`}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.keys(pBlockData).map((group) => (
                <button
                  key={group}
                  onClick={() => setPblockGroup(group)}
                  className={`btn-secondary text-xs ${pblockGroup === group ? "bg-cyan-500/20 text-cyan-200" : ""}`}
                >
                  {group}
                </button>
              ))}
            </div>
            <div className="grid lg:grid-cols-[1fr_280px] gap-4">
              <div className="grid md:grid-cols-2 gap-3">
                {pBlockData[pblockGroup].map(([title, detail]) => (
                  <article
                    key={title}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-4"
                  >
                    <h5 className="text-sm font-black text-white">{title}</h5>
                    <p className="text-xs text-gray-300 mt-2">{detail}</p>
                  </article>
                ))}
              </div>
              <svg
                viewBox="0 0 220 180"
                className="w-full h-56 rounded-xl bg-black/20 border border-white/10"
              >
                {pblockGroup === "Group 18" ? (
                  <>
                    <line
                      x1="35"
                      y1="50"
                      x2="95"
                      y2="50"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    <text x="20" y="54" fill="#cbd5e1" fontSize="10">
                      F-Xe-F
                    </text>
                    <rect
                      x="70"
                      y="88"
                      width="54"
                      height="54"
                      fill="none"
                      stroke="#a78bfa"
                      strokeWidth="3"
                    />
                    <text x="76" y="119" fill="#cbd5e1" fontSize="10">
                      XeF4
                    </text>
                    <circle
                      cx="165"
                      cy="98"
                      r="24"
                      fill="none"
                      stroke="#f472b6"
                      strokeWidth="3"
                    />
                    <text x="148" y="102" fill="#cbd5e1" fontSize="10">
                      XeF6
                    </text>
                  </>
                ) : (
                  <>
                    <circle
                      cx="110"
                      cy="82"
                      r="26"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3"
                    />
                    {[0, 60, 120, 180, 240, 300].map((angle) => {
                      const rad = (angle * Math.PI) / 180;
                      return (
                        <line
                          key={angle}
                          x1="110"
                          y1="82"
                          x2={110 + Math.cos(rad) * 52}
                          y2={82 + Math.sin(rad) * 52}
                          stroke="#e2e8f0"
                          strokeWidth="2"
                        />
                      );
                    })}
                    <text x="70" y="155" fill="#94a3b8" fontSize="9">
                      schematic oxyacid / allotrope bonding
                    </text>
                  </>
                )}
              </svg>
            </div>
          </Bench>
        );
      case "drug-functional-groups":
      case "adme-ionization":
      case "isotonicity":
      case "clinical-buffers":
      case "pharma-analysis":
      case "radiopharma":
      case "enzyme-kinetics":
      case "amino-acid-pi":
      case "protein-structure":
      case "carbohydrate-lab":
      case "lipid-membrane":
      case "nucleic-acid-lab":
      case "vitamin-coenzyme-map":
      case "metabolism-atp":
      case "drug-class-studio":
      case "drug-metabolism-lab":
      case "dosage-form-lab":
      case "antacid-analgesic-antimicrobial":
      case "pharma-buffer-lab":
      case "electrolyte-panel":
      case "hemoglobin-oxygen":
      case "diagnostic-color-tests":
      case "clinical-metabolites":
      case "toxicology-chelation": {
        const reference = pharmaMedicalReference[activeExperiment.id];
        const activeStageIndex = Math.min(
          bioMedicalStage,
          reference.rows.length - 1,
        );
        const activeRow = reference.rows[activeStageIndex] || reference.rows[0];
        const stagePercent =
          reference.rows.length > 1
            ? (activeStageIndex / (reference.rows.length - 1)) * 100
            : 0;
        const signal = 35 + ((activeStageIndex * 17) % 55);
        const isBarLab = [
          "electrolyte-panel",
          "clinical-metabolites",
          "diagnostic-color-tests",
          "pharma-analysis",
        ].includes(activeExperiment.id);
        const isCurveLab = [
          "enzyme-kinetics",
          "hemoglobin-oxygen",
          "adme-ionization",
          "drug-metabolism-lab",
        ].includes(activeExperiment.id);
        const isMembraneLab = [
          "lipid-membrane",
          "isotonicity",
          "dosage-form-lab",
        ].includes(activeExperiment.id);
        const isMoleculeLab = [
          "nucleic-acid-lab",
          "protein-structure",
          "amino-acid-pi",
          "carbohydrate-lab",
        ].includes(activeExperiment.id);
        const isToxicology = activeExperiment.id === "toxicology-chelation";
        const activeColor = isToxicology
          ? "#fb7185"
          : isBarLab
            ? "#f59e0b"
            : isMembraneLab
              ? "#38bdf8"
              : isMoleculeLab
                ? "#a78bfa"
                : "#22c55e";
        const activeShort = String(activeRow[0]).slice(0, 22);
        const specializedMetric =
          activeExperiment.id === "carbohydrate-lab"
            ? {
                label: "Reducing sugar check",
                value:
                  activeStageIndex >= 2
                    ? "Free anomeric carbon"
                    : "Ring form under review",
              }
            : activeExperiment.id === "nucleic-acid-lab"
              ? {
                  label: "Base-pair audit",
                  value:
                    activeStageIndex >= 2
                      ? "G–C · 3 H-bonds"
                      : "A–T/U · 2 H-bonds",
                }
              : activeExperiment.id === "metabolism-atp"
                ? {
                    label: "Energy ledger",
                    value: `${12 + activeStageIndex * 2} ATP equivalents · ${4 + activeStageIndex} carbons tracked`,
                  }
                : activeExperiment.id === "adme-ionization"
                  ? {
                      label: "Ionized fraction",
                      value: `${Math.round(18 + activeStageIndex * 16)}% at current pH`,
                    }
                  : activeExperiment.id === "drug-functional-groups"
                    ? {
                        label: "Medicinal chemistry cue",
                        value:
                          activeStageIndex >= 2
                            ? "H-bonding + ionization"
                            : "Polarity + scaffold shape",
                      }
                    : activeExperiment.id === "dosage-form-lab"
                      ? {
                          label: "Release profile",
                          value: `${Math.round(22 + activeStageIndex * 13)}% released · dissolution window ${2 + activeStageIndex} h`,
                        }
                      : activeExperiment.id === "pharma-analysis"
                        ? {
                            label: "QC decision",
                            value:
                              activeStageIndex >= 2
                                ? "PASS · assay within specification"
                                : "IN REVIEW · calibrate standard",
                          }
                        : activeExperiment.id === "pharma-buffer-lab"
                          ? {
                              label: "Buffer check",
                              value: `pH ${(6.8 + activeStageIndex * 0.18).toFixed(2)} · capacity ${Math.round(70 + activeStageIndex * 6)}%`,
                            }
                          : activeExperiment.id === "toxicology-chelation"
                            ? {
                                label: "Antidote progress",
                                value:
                                  activeStageIndex >= 2
                                    ? "Chelator bound · clearance rising"
                                    : "Exposure under observation",
                              }
                            : null;
        return (
          <Bench title={activeExperiment.title} result={reference.result}>
            <div className="space-y-4">
              <div className="grid lg:grid-cols-[1fr_280px] gap-4">
                <div className="rounded-xl bg-black/20 border border-white/10 p-4 overflow-hidden">
                  <svg
                    viewBox="0 0 520 260"
                    className="w-full h-72 rounded-xl bg-slate-950/70 border border-white/10"
                  >
                    <defs>
                      <linearGradient id="bioMedicalGlow" x1="0" x2="1">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="50%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#fb7185" />
                      </linearGradient>
                      <radialGradient
                        id="bioMedicalPulse"
                        cx="50%"
                        cy="50%"
                        r="60%"
                      >
                        <stop
                          offset="0%"
                          stopColor={activeColor}
                          stopOpacity="0.65"
                        />
                        <stop
                          offset="100%"
                          stopColor={activeColor}
                          stopOpacity="0"
                        />
                      </radialGradient>
                    </defs>
                    <rect
                      x="18"
                      y="18"
                      width="484"
                      height="224"
                      rx="18"
                      fill="#020617"
                      stroke="#1e293b"
                    />
                    <rect
                      x="34"
                      y="34"
                      width="452"
                      height="26"
                      rx="13"
                      fill="#0f172a"
                      stroke="#243244"
                    />
                    <circle cx="50" cy="47" r="5" fill={activeColor} />
                    <text
                      x="62"
                      y="51"
                      fill="#e2e8f0"
                      fontSize="12"
                      fontWeight="700"
                    >
                      {activeShort}
                    </text>
                    {isCurveLab && (
                      <>
                        {[92, 128, 164, 200].map((y) => (
                          <line
                            key={y}
                            x1="62"
                            y1={y}
                            x2="462"
                            y2={y}
                            stroke="#1f2937"
                            strokeDasharray="4 7"
                          />
                        ))}
                        {[142, 222, 302, 382].map((x) => (
                          <line
                            key={x}
                            x1={x}
                            y1="74"
                            x2={x}
                            y2="204"
                            stroke="#1f2937"
                            strokeDasharray="4 7"
                          />
                        ))}
                        <line
                          x1="62"
                          y1="204"
                          x2="462"
                          y2="204"
                          stroke="#64748b"
                          strokeWidth="2"
                        />
                        <line
                          x1="62"
                          y1="204"
                          x2="62"
                          y2="72"
                          stroke="#64748b"
                          strokeWidth="2"
                        />
                        <path
                          d={`M70 198 C 145 ${150 - activeStageIndex * 7}, 215 ${98 - activeStageIndex * 5}, 455 ${80 + activeStageIndex * 9}`}
                          fill="none"
                          stroke="url(#bioMedicalGlow)"
                          strokeWidth="6"
                          strokeLinecap="round"
                        />
                        <path
                          d={`M70 198 C 135 180, 220 ${125 + activeStageIndex * 8}, 455 ${118 + activeStageIndex * 7}`}
                          fill="none"
                          stroke="#a78bfa"
                          strokeWidth="3"
                          strokeDasharray="8 8"
                          strokeLinecap="round"
                        />
                        <text x="70" y="82" fill="#94a3b8" fontSize="11">
                          rate / occupancy
                        </text>
                        <text x="332" y="226" fill="#94a3b8" fontSize="11">
                          substrate, O2 pressure, or time
                        </text>
                        <circle
                          cx={95 + stagePercent * 3.55}
                          cy={198 - signal}
                          r="24"
                          fill="url(#bioMedicalPulse)"
                        />
                        <circle
                          cx={95 + stagePercent * 3.55}
                          cy={198 - signal}
                          r="10"
                          fill="#22c55e"
                          stroke="#bbf7d0"
                          strokeWidth="3"
                        />
                        <g transform="translate(388 92)">
                          <rect
                            x="0"
                            y="0"
                            width="82"
                            height="58"
                            rx="16"
                            fill="#0f172a"
                            stroke="#334155"
                          />
                          <path
                            d="M18 34 C24 14, 56 14, 64 34 C58 50, 24 50, 18 34Z"
                            fill="#16a34a33"
                            stroke="#22c55e"
                            strokeWidth="2"
                          />
                          <circle
                            cx={42 + (activeStageIndex % 2) * 10}
                            cy="34"
                            r="7"
                            fill={activeColor}
                          />
                          <text x="14" y="14" fill="#94a3b8" fontSize="9">
                            active site
                          </text>
                        </g>
                      </>
                    )}
                    {isBarLab && (
                      <>
                        <line
                          x1="58"
                          y1="210"
                          x2="468"
                          y2="210"
                          stroke="#64748b"
                          strokeWidth="2"
                        />
                        {reference.rows.map((row, index) => {
                          const height =
                            42 + ((index * 23 + activeStageIndex * 15) % 112);
                          const active = index === activeStageIndex;
                          return (
                            <g key={row[0]}>
                              <rect
                                x={68 + index * 76}
                                y="82"
                                width="54"
                                height="130"
                                rx="18"
                                fill="#0f172a"
                                stroke={active ? activeColor : "#475569"}
                                strokeWidth="2"
                              />
                              <rect
                                x={74 + index * 76}
                                y={210 - height}
                                width="42"
                                height={height}
                                rx="10"
                                fill={active ? `${activeColor}cc` : "#334155"}
                              />
                              <rect
                                x={76 + index * 76}
                                y={210 - height}
                                width="38"
                                height={height}
                                rx="8"
                                fill={active ? "#22c55e99" : "#334155"}
                                stroke={active ? "#bbf7d0" : "#64748b"}
                                strokeWidth="2"
                              />
                              <rect
                                x={72 + index * 76}
                                y="66"
                                width="46"
                                height="22"
                                rx="8"
                                fill={active ? "#f59e0b" : "#0f172a"}
                                stroke="#475569"
                              />
                              <text
                                x={76 + index * 76}
                                y="230"
                                fill="#cbd5e1"
                                fontSize="10"
                              >
                                {row[0].slice(0, 8)}
                              </text>
                            </g>
                          );
                        })}
                        <text x="68" y="76" fill="#94a3b8" fontSize="11">
                          test tubes: color intensity and concentration signal
                        </text>
                      </>
                    )}
                    {isMembraneLab && (
                      <>
                        <rect
                          x="46"
                          y="70"
                          width="428"
                          height="130"
                          rx="26"
                          fill="#0f172a"
                          stroke="#334155"
                        />
                        <text x="64" y="88" fill="#94a3b8" fontSize="11">
                          aqueous side A
                        </text>
                        <text x="370" y="190" fill="#94a3b8" fontSize="11">
                          aqueous side B
                        </text>
                        {Array.from({ length: 14 }, (_, i) => (
                          <g
                            key={i}
                            transform={`translate(${76 + i * 28}, 94)`}
                          >
                            <circle cx="0" cy="0" r="8" fill="#38bdf8" />
                            <line
                              x1="-4"
                              y1="8"
                              x2="-12"
                              y2="48"
                              stroke="#f59e0b"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <line
                              x1="4"
                              y1="8"
                              x2="12"
                              y2="48"
                              stroke="#f59e0b"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <circle cx="0" cy="86" r="8" fill="#38bdf8" />
                            <line
                              x1="-4"
                              y1="78"
                              x2="-12"
                              y2="38"
                              stroke="#f59e0b"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                            <line
                              x1="4"
                              y1="78"
                              x2="12"
                              y2="38"
                              stroke="#f59e0b"
                              strokeWidth="4"
                              strokeLinecap="round"
                            />
                          </g>
                        ))}
                        {Array.from({ length: 18 }, (_, i) => (
                          <circle
                            key={i}
                            cx={72 + ((i * 29) % 410)}
                            cy={78 + ((i * 37 + activeStageIndex * 9) % 116)}
                            r="3"
                            fill={i % 3 ? "#bae6fd" : "#fb7185"}
                            opacity="0.8"
                          />
                        ))}
                        <path
                          d={`M116 132 C 190 ${110 - activeStageIndex * 6}, 265 ${164 + activeStageIndex * 3}, 398 132`}
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="2"
                          strokeDasharray="7 7"
                        />
                        <circle
                          cx={125 + stagePercent * 2.6}
                          cy="132"
                          r={18 + activeStageIndex * 3}
                          fill="#fb718533"
                          stroke="#fb7185"
                          strokeWidth="3"
                        />
                        <text x="66" y="224" fill="#94a3b8" fontSize="11">
                          bilayer, osmotic movement, droplets, micelles, and
                          formulation particles
                        </text>
                      </>
                    )}
                    {isMoleculeLab && (
                      <>
                        <path
                          d={`M58 ${150 - activeStageIndex * 9} C 110 65, 172 205, 228 110 S 350 62, 462 ${150 + activeStageIndex * 5}`}
                          fill="none"
                          stroke="url(#bioMedicalGlow)"
                          strokeWidth="9"
                          strokeLinecap="round"
                        />
                        <path
                          d={`M58 ${164 - activeStageIndex * 7} C 110 78, 172 218, 228 124 S 350 76, 462 ${164 + activeStageIndex * 4}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth={
                            activeExperiment.id === "nucleic-acid-lab" ? 5 : 0
                          }
                          strokeLinecap="round"
                          opacity="0.8"
                        />
                        {Array.from({ length: 8 }, (_, i) => (
                          <g key={i}>
                            {activeExperiment.id === "nucleic-acid-lab" && (
                              <line
                                x1={72 + i * 55}
                                y1={118 + (i % 2 ? 36 : -22)}
                                x2={72 + i * 55}
                                y2={132 + (i % 2 ? 36 : -22)}
                                stroke="#c4b5fd"
                                strokeWidth="3"
                                strokeDasharray="4 4"
                              />
                            )}
                            <circle
                              cx={72 + i * 55}
                              cy={118 + (i % 2 ? 36 : -22)}
                              r="15"
                              fill={
                                i <= activeStageIndex + 2
                                  ? "#22c55e"
                                  : "#475569"
                              }
                              stroke="#e2e8f0"
                              strokeWidth="2"
                            />
                            <text
                              x={67 + i * 55}
                              y={123 + (i % 2 ? 36 : -22)}
                              fill="#020617"
                              fontSize="10"
                              fontWeight="900"
                            >
                              {["A", "T", "G", "C", "OH", "N", "P", "S"][i]}
                            </text>
                          </g>
                        ))}
                        <g transform="translate(360 78)">
                          <rect
                            x="0"
                            y="0"
                            width="92"
                            height="54"
                            rx="14"
                            fill="#0f172a"
                            stroke="#334155"
                          />
                          <text x="12" y="20" fill="#94a3b8" fontSize="9">
                            contacts
                          </text>
                          <circle cx="22" cy="36" r="6" fill="#22d3ee" />
                          <circle cx="46" cy="36" r="6" fill="#f59e0b" />
                          <circle cx="70" cy="36" r="6" fill="#fb7185" />
                        </g>
                        <text x="70" y="224" fill="#94a3b8" fontSize="11">
                          sequence, rings, base pairs, folding contacts, and
                          ionizable groups
                        </text>
                      </>
                    )}
                    {isToxicology && (
                      <>
                        <path
                          d="M86 128 C118 68, 198 66, 228 128 C198 190, 118 188, 86 128Z"
                          fill="#7f1d1d66"
                          stroke="#f87171"
                          strokeWidth="4"
                        />
                        <text
                          x="132"
                          y="133"
                          fill="#fecaca"
                          fontSize="17"
                          fontWeight="900"
                        >
                          toxin
                        </text>
                        <circle
                          cx="340"
                          cy="130"
                          r="58"
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth="6"
                          strokeDasharray="12 8"
                        />
                        {[0, 60, 120, 180, 240, 300].map((angle) => {
                          const rad = (angle * Math.PI) / 180;
                          return (
                            <circle
                              key={angle}
                              cx={340 + Math.cos(rad) * 58}
                              cy={130 + Math.sin(rad) * 58}
                              r="9"
                              fill="#34d399"
                            />
                          );
                        })}
                        <circle
                          cx="340"
                          cy="130"
                          r="18"
                          fill="#f59e0b"
                          stroke="#fde68a"
                          strokeWidth="3"
                        />
                        <path
                          d="M230 130 C252 106, 272 106, 294 130 C272 154, 252 154, 230 130Z"
                          fill="#0f172a"
                          stroke="#cbd5e1"
                          strokeWidth="3"
                        />
                        <text x="244" y="134" fill="#e2e8f0" fontSize="10">
                          bind
                        </text>
                        <text x="74" y="224" fill="#94a3b8" fontSize="11">
                          enzyme/heme binding site vs chelator pocket with
                          multiple donor atoms
                        </text>
                      </>
                    )}
                    {!isCurveLab &&
                      !isBarLab &&
                      !isMembraneLab &&
                      !isMoleculeLab &&
                      !isToxicology && (
                        <>
                          {reference.rows.map((row, index) => {
                            const x =
                              70 +
                              index *
                                (380 / Math.max(1, reference.rows.length - 1));
                            const active =
                              index ===
                              Math.min(
                                bioMedicalStage,
                                reference.rows.length - 1,
                              );
                            return (
                              <g key={row[0]}>
                                {index > 0 && (
                                  <line
                                    x1={
                                      70 +
                                      (index - 1) *
                                        (380 /
                                          Math.max(
                                            1,
                                            reference.rows.length - 1,
                                          ))
                                    }
                                    y1="130"
                                    x2={x}
                                    y2="130"
                                    stroke="#334155"
                                    strokeWidth="4"
                                  />
                                )}
                                <circle
                                  cx={x}
                                  cy="130"
                                  r={active ? 25 : 18}
                                  fill={active ? "#22c55e" : "#1e293b"}
                                  stroke={active ? "#bbf7d0" : "#64748b"}
                                  strokeWidth="3"
                                />
                                <text
                                  x={x - 18}
                                  y="176"
                                  fill="#cbd5e1"
                                  fontSize="10"
                                >
                                  {row[0].slice(0, 14)}
                                </text>
                              </g>
                            );
                          })}
                          <rect
                            x="72"
                            y="54"
                            width={110 + stagePercent * 2.9}
                            height="18"
                            rx="9"
                            fill="url(#bioMedicalGlow)"
                          />
                          <text x="76" y="48" fill="#94a3b8" fontSize="12">
                            progressive visual map
                          </text>
                        </>
                      )}
                  </svg>
                </div>
                <div className="space-y-3">
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                    <p className="text-xs font-bold text-emerald-200">
                      Active stage
                    </p>
                    <p className="text-lg font-black text-white mt-1">
                      {activeRow[0]}
                    </p>
                    <p className="text-sm text-emerald-50 mt-2">
                      {activeRow[1]}
                    </p>
                    <p className="text-xs text-emerald-100/75 mt-2">
                      {activeRow[2]}
                    </p>
                  </div>
                  <div>
                    <ControlLabel>
                      Visualization stage: {activeStageIndex + 1}/
                      {reference.rows.length}
                    </ControlLabel>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, reference.rows.length - 1)}
                      value={Math.min(
                        bioMedicalStage,
                        reference.rows.length - 1,
                      )}
                      onChange={(e) =>
                        setBioMedicalStage(Number(e.target.value))
                      }
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">assay signal</p>
                      <p className="text-2xl font-black text-white">
                        {signal}%
                      </p>
                      <MiniBar
                        label="relative response"
                        value={signal}
                        color="#22d3ee"
                      />
                    </div>
                    <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-[10px] text-gray-500">
                        polarity / charge
                      </p>
                      <p className="text-2xl font-black text-white">
                        {Math.round(100 - signal / 1.4)}%
                      </p>
                      <MiniBar
                        label="chemical shift"
                        value={100 - signal / 1.4}
                        color="#fb7185"
                      />
                    </div>
                  </div>
                  {specializedMetric && (
                    <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                        {specializedMetric.label}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">
                        {specializedMetric.value}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.035] border border-white/10 overflow-hidden">
                <div className="grid grid-cols-[0.8fr_1.1fr_1.1fr] gap-px bg-white/10 text-xs">
                  {reference.columns.map((column) => (
                    <div
                      key={column}
                      className="bg-slate-950/80 px-3 py-2 font-bold text-cyan-100"
                    >
                      {column}
                    </div>
                  ))}
                  {reference.rows.flatMap((row, rowIndex) =>
                    row.map((cell, index) => (
                      <div
                        key={`${row[0]}-${index}`}
                        className={`px-3 py-2 ${rowIndex === activeStageIndex ? "bg-cyan-500/15 text-cyan-50" : "bg-slate-950/55 text-gray-300"}`}
                      >
                        {cell}
                      </div>
                    )),
                  )}
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {reference.rows.map((row, index) => (
                  <button
                    key={row[0]}
                    onClick={() => setBioMedicalStage(index)}
                    className={`text-left rounded-xl border p-3 transition-colors ${index === Math.min(bioMedicalStage, reference.rows.length - 1) ? "bg-cyan-500/15 border-cyan-500/30" : "bg-white/[0.035] border-white/10 hover:bg-white/[0.06]"}`}
                  >
                    <p className="text-sm font-bold text-white">{row[0]}</p>
                    <p className="text-xs text-gray-400 mt-1">{row[1]}</p>
                    <p className="text-[11px] text-cyan-300 mt-2">{row[2]}</p>
                  </button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <p className="text-xs font-bold text-violet-200">
                    Visual lab mode
                  </p>
                  <p className="text-sm text-violet-50 mt-2">
                    Use the stage control to scan structures, curves, tests,
                    formulations, ions, or pathway steps without switching into
                    question-answer practice.
                  </p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-xs font-bold text-amber-200">
                    Bridge concepts
                  </p>
                  <p className="text-sm text-amber-50 mt-2">
                    Connect each visual to organic functional groups, buffers,
                    solutions, isotopes, kinetics, coordination, and analytical
                    chemistry.
                  </p>
                </div>
              </div>
            </div>
          </Bench>
        );
      }
      case "functional-tests":
        return (
          <Bench
            title="Functional Group Test Reference"
            result={
              functionalQuizAnswer
                ? functionalQuizCorrect
                  ? `Correct: ${activeFunctionalQuiz.expected}`
                  : `Review: best pick is ${activeFunctionalQuiz.answer}. ${activeFunctionalQuiz.expected}`
                : "Pick a test or try the reverse quiz."
            }
          >
            <div className="grid lg:grid-cols-[260px_1fr] gap-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-2 max-h-[520px] overflow-y-auto">
                {functionalTestData.map((test) => (
                  <button
                    key={test.name}
                    onClick={() => setSelectedFunctionalTest(test.name)}
                    className={`w-full text-left rounded-lg px-3 py-2 text-xs mb-1 transition-colors ${selectedFunctionalTest === test.name ? "bg-cyan-500/15 text-cyan-100 border border-cyan-500/25" : "text-gray-400 hover:bg-white/[0.05]"}`}
                  >
                    <span className="block font-bold">{test.name}</span>
                    <span className="block text-[10px] text-gray-500 truncate">
                      {test.detects}
                    </span>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <div className="flex flex-wrap items-center gap-2 justify-between">
                    <h5 className="text-lg font-black text-white">
                      {selectedTest.name}
                    </h5>
                    <BadgePill className="bg-pink-500/15 text-pink-300 border-pink-500/25">
                      qualitative analysis
                    </BadgePill>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs">
                    <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Detects</p>
                      <p className="text-white font-semibold mt-1">
                        {selectedTest.detects}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white/[0.04] border border-white/10 p-3">
                      <p className="text-gray-500">Reagents</p>
                      <p className="text-white font-semibold mt-1">
                        {selectedTest.reagents}
                      </p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
                      <p className="text-emerald-300">Positive result</p>
                      <p className="text-emerald-50 font-semibold mt-1">
                        {selectedTest.positive}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-500/10 border border-slate-500/20 p-3">
                      <p className="text-gray-400">Negative result</p>
                      <p className="text-gray-100 font-semibold mt-1">
                        {selectedTest.negative}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-gray-300">
                    <span className="text-cyan-300 font-semibold">
                      Example:
                    </span>{" "}
                    {selectedTest.example}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <h5 className="text-sm font-black text-white">
                      Which test? Reverse quiz
                    </h5>
                    <button
                      onClick={() => {
                        setFunctionalQuizIndex(
                          (i) => (i + 1) % functionalQuizData.length,
                        );
                        setFunctionalQuizAnswer("");
                      }}
                      className="btn-secondary text-xs"
                    >
                      Next compound
                    </button>
                  </div>
                  <p className="text-sm text-gray-300">
                    Compound:{" "}
                    <span className="text-white font-black">
                      {activeFunctionalQuiz.compound}
                    </span>
                  </p>
                  <div className="mt-3 grid sm:grid-cols-2 gap-2">
                    <select
                      value={functionalQuizAnswer}
                      onChange={(e) => setFunctionalQuizAnswer(e.target.value)}
                      className="input text-sm"
                    >
                      <option value="">Choose the best test</option>
                      {functionalTestData.map((test) => (
                        <option key={test.name} value={test.name}>
                          {test.name}
                        </option>
                      ))}
                    </select>
                    <div
                      className={`rounded-lg border p-3 text-xs ${functionalQuizAnswer ? (functionalQuizCorrect ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-100" : "bg-amber-500/10 border-amber-500/25 text-amber-100") : "bg-black/20 border-white/10 text-gray-400"}`}
                    >
                      {functionalQuizAnswer
                        ? functionalQuizCorrect
                          ? activeFunctionalQuiz.expected
                          : `Expected: ${activeFunctionalQuiz.answer}. ${activeFunctionalQuiz.expected}`
                        : "Select an answer to check the expected observation."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "isomerism":
        return (
          <Bench
            title="Isomerism Explorer"
            result={
              structuralIsomers.length
                ? `${isomerFormula} has ${structuralIsomers.length} listed structural isomer examples in this explorer.`
                : "Try C4H10, C2H6O, C3H6O, or C4H8 for structural drawings."
            }
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <div className="grid md:grid-cols-[220px_1fr] gap-3 items-end">
                  <div>
                    <ControlLabel>Molecular formula</ControlLabel>
                    <input
                      value={isomerFormula}
                      onChange={(e) => setIsomerFormula(e.target.value)}
                      className="input text-sm"
                      placeholder="C4H10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(structuralIsomerData).map((formula) => (
                      <button
                        key={formula}
                        onClick={() => setIsomerFormula(formula)}
                        className={`btn-secondary text-xs ${isomerFormula.replace(/\s/g, "") === formula ? "bg-cyan-500/20 text-cyan-200" : ""}`}
                      >
                        {formula}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 grid md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {structuralIsomers.length ? (
                    structuralIsomers.map((isomer) => (
                      <div
                        key={isomer.name}
                        className="rounded-xl bg-black/20 border border-white/10 p-3"
                      >
                        <BondLineSketch item={isomer} />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-white">
                            {isomer.name}
                          </p>
                          <BadgePill className="bg-blue-500/15 text-blue-300 border-blue-500/25">
                            {isomer.type}
                          </BadgePill>
                        </div>
                        <p className="text-xs font-mono text-cyan-100 mt-1">
                          {isomer.formula}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="md:col-span-2 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 text-sm text-amber-100">
                      No built-in structural set for this formula yet.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BadgePill className="bg-violet-500/15 text-violet-300 border-violet-500/25">
                    Section B
                  </BadgePill>
                  <h5 className="text-sm font-black text-white">
                    Stereoisomers
                  </h5>
                </div>
                <StereoSketches />
              </div>

              <div className="rounded-xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                    Section C
                  </BadgePill>
                  <h5 className="text-sm font-black text-white">
                    Coordination compound isomerism
                  </h5>
                </div>
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="font-bold text-white">
                      Geometric square planar
                    </p>
                    <p className="text-gray-400 mt-1">
                      [MA2B2] gives cis/trans arrangements depending on whether
                      identical ligands are adjacent or opposite.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="font-bold text-white">Geometric octahedral</p>
                    <p className="text-gray-400 mt-1">
                      [MA2B4] gives cis/trans; [MA3B3] can show
                      facial/meridional forms.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="font-bold text-white">Optical complexes</p>
                    <p className="text-gray-400 mt-1">
                      Tris-bidentate complexes like [M(en)3]3+ form
                      non-superimposable delta/lambda mirror images.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/20 border border-white/10 p-3">
                    <p className="font-bold text-white">Ionization/linkage</p>
                    <p className="text-gray-400 mt-1">
                      [Co(NH3)5Br]SO4 vs [Co(NH3)5SO4]Br; NO2- can bind through
                      N as nitro or O as nitrito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Bench>
        );
      case "crystal-defects":
        return (
          <Bench
            title="Crystal Defects Visualizer"
            result={
              defectCrystalType === "ionic"
                ? "Ionic solids commonly show Schottky and Frenkel defects."
                : "Metal crystals mainly show vacancies, interstitials, and substitutional impurities."
            }
          >
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setDefectCrystalType("ionic")}
                className={`btn-secondary text-xs ${defectCrystalType === "ionic" ? "bg-indigo-500/20 text-indigo-200" : ""}`}
              >
                Ionic compound
              </button>
              <button
                onClick={() => setDefectCrystalType("metal")}
                className={`btn-secondary text-xs ${defectCrystalType === "metal" ? "bg-indigo-500/20 text-indigo-200" : ""}`}
              >
                Metal crystal
              </button>
            </div>
            <div className="grid lg:grid-cols-3 gap-3">
              <CrystalGrid mode="perfect" compound={defectCrystalType} />
              <CrystalGrid mode="schottky" compound={defectCrystalType} />
              <CrystalGrid mode="frenkel" compound={defectCrystalType} />
            </div>
            <div className="grid md:grid-cols-3 gap-2 mt-4 text-xs">
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="font-bold text-white">Schottky defect</p>
                <p className="text-gray-400 mt-1">
                  Missing cation-anion pairs; density decreases. Common in NaCl,
                  KCl, CsCl, AgBr.
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="font-bold text-white">Frenkel defect</p>
                <p className="text-gray-400 mt-1">
                  Small ion leaves lattice site for interstitial; density nearly
                  unchanged. AgCl, AgBr, AgI, ZnS.
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                <p className="font-bold text-white">Conductivity</p>
                <p className="text-gray-400 mt-1">
                  Defects increase ionic movement; doping creates electronic
                  conductivity in semiconductors.
                </p>
              </div>
            </div>
            <div className="mt-4 grid lg:grid-cols-[1fr_0.8fr] gap-3">
              <div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setDopingType("n")}
                    className={`btn-secondary text-xs ${dopingType === "n" ? "bg-emerald-500/20 text-emerald-200" : ""}`}
                  >
                    n-type
                  </button>
                  <button
                    onClick={() => setDopingType("p")}
                    className={`btn-secondary text-xs ${dopingType === "p" ? "bg-pink-500/20 text-pink-200" : ""}`}
                  >
                    p-type
                  </button>
                </div>
                <SiliconDopingSvg type={dopingType} />
              </div>
              <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                <p>
                  <span className="text-emerald-300 font-semibold">
                    n-type:
                  </span>{" "}
                  Si doped with P/As/Sb gives extra electrons.
                </p>
                <p className="mt-2">
                  <span className="text-pink-300 font-semibold">p-type:</span>{" "}
                  Si doped with B/Al/Ga creates electron holes.
                </p>
                <p className="mt-2">
                  Class 12 link: imperfections explain color, density change,
                  and semiconductor behavior.
                </p>
              </div>
            </div>
          </Bench>
        );
      case "crystal-structure":
      default:
        return (
          <Bench
            title={activeExperiment.title}
            result="Use the controls below to change the model and observe the result."
          >
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <ControlLabel>Structure</ControlLabel>
                <select
                  value={structureType}
                  onChange={(e) => setStructureType(e.target.value)}
                  className="input text-sm"
                >
                  {["NaCl", "CsCl", "diamond", "graphite"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <ControlLabel>Lattice size {latticeSize}</ControlLabel>
                <input
                  type="range"
                  min="2"
                  max="7"
                  value={latticeSize}
                  onChange={(e) => setLatticeSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2 max-w-xs">
              {Array.from({ length: latticeSize * latticeSize }, (_, i) => (
                <span
                  key={i}
                  className="aspect-square rounded-full border border-white/10"
                  style={{ background: i % 2 ? "#38bdf8" : "#a78bfa" }}
                />
              ))}
            </div>
          </Bench>
        );
    }
  };

  return (
    <div
      className={`p-4 md:p-6 max-w-7xl mx-auto space-y-4 ${isVisualAtlas ? "h-[calc(100vh-70px)] overflow-hidden" : ""} ${teacherMode ? "text-[1.08rem]" : ""}`}
    >
      {isVisualAtlas && (
        <section className="rounded-2xl border border-cyan-400/20 bg-[radial-gradient(circle_at_50%_35%,rgba(30,64,175,.25),rgba(2,6,23,.96)_65%)] p-4 md:p-5 shadow-2xl shadow-cyan-950/20">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300/80">
                Five worlds · one chemistry
              </p>
              <h1 className="mt-1 text-2xl md:text-3xl font-black text-white">
                Chemistry Visual Atlas{" "}
                <span className="text-cyan-300 font-normal">
                  | See the invisible
                </span>
              </h1>
              <p className="mt-1 text-sm text-slate-300">
                From electrons to medicines — explore connected visual
                explanations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() =>
                  setAtlasIndex(
                    (atlasIndex - 1 + atlasVisibleItems.length) %
                      Math.max(1, atlasVisibleItems.length),
                  )
                }
                className="btn-secondary"
                aria-label="Previous featured visual"
              >
                ‹
              </button>
              <span className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-slate-300">
                {(atlasIndex % Math.max(1, atlasVisibleItems.length)) + 1} /{" "}
                {atlasVisibleItems.length}
              </span>
              <button
                onClick={() =>
                  setAtlasIndex(
                    (atlasIndex + 1) % Math.max(1, atlasVisibleItems.length),
                  )
                }
                className="btn-secondary"
                aria-label="Next featured visual"
              >
                ›
              </button>
            </div>
          </div>
          <div className="mt-4 grid lg:grid-cols-[1fr_300px] gap-4">
            <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="absolute inset-8 rounded-full border border-cyan-400/20" />
              <div className="absolute inset-16 rounded-full border border-indigo-400/20" />
              <div className="relative grid h-full min-h-[265px] place-items-center text-center">
                <div className="rounded-full border border-cyan-300/40 bg-slate-950/80 px-7 py-6 shadow-[0_0_55px_rgba(34,211,238,.25)]">
                  <p className="text-[10px] tracking-[0.3em] text-cyan-200">
                    CHEMISTRY
                  </p>
                  <p className="text-[10px] tracking-[0.3em] text-cyan-200">
                    CONNECTS
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    matter · energy · life
                  </p>
                </div>
                {[
                  "Organic",
                  "Inorganic",
                  "Biochemistry",
                  "Physical",
                  "Pharmaceutical",
                ].map((world, i) => {
                  const item = visualAtlasItems.find(
                    (entry) => entry.world === world,
                  );
                  return (
                    <button
                      key={world}
                      onClick={() => {
                        const next = atlasVisibleItems.findIndex(
                          (entry) => entry.world === world,
                        );
                        if (next >= 0) setAtlasIndex(next);
                      }}
                      className="absolute rounded-xl border px-3 py-2 text-left text-[11px] font-semibold transition hover:scale-105"
                      style={{
                        color: item.color,
                        borderColor: `${item.color}66`,
                        background: `${item.color}12`,
                        top:
                          i === 0
                            ? "4%"
                            : i === 1
                              ? "33%"
                              : i === 2
                                ? "29%"
                                : i === 3
                                  ? "70%"
                                  : "69%",
                        left:
                          i === 0
                            ? "43%"
                            : i === 1
                              ? "3%"
                              : i === 2
                                ? "76%"
                                : i === 3
                                  ? "15%"
                                  : "70%",
                      }}
                    >
                      {world}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {item.detail.slice(0, 34)}…
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  Featured visual
                </p>
                <span className="text-xs text-slate-400">
                  {activeAtlasItem.world}
                </span>
              </div>
              <div className="mt-3 grid h-36 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800">
                <span
                  className="text-7xl"
                  style={{ color: activeAtlasItem.color }}
                >
                  {activeAtlasItem.icon}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-black text-white">
                {activeAtlasItem.title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                {activeAtlasItem.detail}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {["Electron density", "Electrostatic potential", "Both"].map(
                  (mode) => (
                    <button
                      key={mode}
                      onClick={() =>
                        setCopiedLabAction(`${mode} overlay selected`)
                      }
                      className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-200"
                    >
                      {mode}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-3 text-xs">
            <span className="text-slate-400">Scale</span>
            {["All", "Atomic", "Molecular", "Mesoscale", "Macroscopic"].map(
              (value) => (
                <button
                  key={value}
                  onClick={() => setAtlasScale(value)}
                  className={`btn-secondary text-[11px] ${atlasScale === value ? "bg-cyan-400/20 text-cyan-100 border-cyan-300/40" : ""}`}
                >
                  {value}
                </button>
              ),
            )}
            <span className="ml-2 text-slate-400">Time</span>
            {["All", "Static", "Dynamic", "Real-time"].map((value) => (
              <button
                key={value}
                onClick={() => setAtlasTime(value)}
                className={`btn-secondary text-[11px] ${atlasTime === value ? "bg-cyan-400/20 text-cyan-100 border-cyan-300/40" : ""}`}
              >
                {value}
              </button>
            ))}
            <span className="ml-2 text-slate-400">Process</span>
            {["All", "Structure", "Reaction", "Dynamics", "Application"].map(
              (value) => (
                <button
                  key={value}
                  onClick={() => setAtlasProcess(value)}
                  className={`btn-secondary text-[11px] ${atlasProcess === value ? "bg-cyan-400/20 text-cyan-100 border-cyan-300/40" : ""}`}
                >
                  {value}
                </button>
              ),
            )}
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
            {atlasVisibleItems.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setAtlasIndex(index)}
                className={`rounded-xl border p-2 text-left ${item.title === activeAtlasItem.title ? "border-cyan-300/70 bg-cyan-400/10" : "border-white/10 bg-black/20"}`}
              >
                <div
                  className="grid h-14 place-items-center rounded-lg bg-slate-900 text-3xl"
                  style={{ color: item.color }}
                >
                  {item.icon}
                </div>
                <p className="mt-1 truncate text-[10px] font-semibold text-white">
                  {item.title}
                </p>
                <p className="text-[10px] text-slate-500">{item.world}</p>
              </button>
            ))}
          </div>
        </section>
      )}
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2 text-white">
              <Sparkles size={22} className="text-cyan-300" />
              <h2 className="text-xl font-black">Chemistry Lab</h2>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Timeline, isotopes, orbitals, formula tools, safety notes, charts,
              exports, classroom tools, and rule-based chemistry explanations in
              one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <ElementSearchInput
              value={selectedSymbol}
              onChange={setSelectedSymbol}
              className="w-56"
            />
            <button
              onClick={tryRandomExample}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Sparkles size={14} /> Random
            </button>
            <button
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Languages size={14} /> {language === "en" ? "English" : "Hindi"}
            </button>
            <button
              onClick={speak}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Mic2 size={14} /> Pronounce
            </button>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 border-white/10 space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center gap-4 justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-300" />
              <h3 className="text-base font-bold text-white">
                Guided Chemistry Lab
              </h3>
            </div>
            <p className="text-sm text-gray-400 mt-1 max-w-3xl">
              Pick one experiment at a time, follow simple steps, and use labels
              to understand what each tool is for.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setGuidedMode((v) => !v)}
              className={`btn-secondary flex items-center gap-2 text-sm ${guidedMode ? "bg-emerald-500/15 text-emerald-200 border-emerald-500/25" : ""}`}
            >
              <Target size={14} /> Guided Mode
            </button>
            <button
              onClick={() => setLearningMode((v) => !v)}
              className={`btn-secondary flex items-center gap-2 text-sm ${learningMode ? "bg-cyan-500/15 text-cyan-200 border-cyan-500/25" : ""}`}
            >
              <Lightbulb size={14} /> Learning Mode
            </button>
            <button
              onClick={() => setTeacherMode(!teacherMode)}
              className={`btn-secondary flex items-center gap-2 text-sm ${teacherMode ? "bg-amber-500/15 text-amber-200 border-amber-500/25" : ""}`}
            >
              <GraduationCap size={14} /> Large Text
            </button>
            <button
              onClick={() => setShowAdvancedLab((v) => !v)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={14} />{" "}
              {showFullLab ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_260px] gap-4">
          <div className="space-y-3">
            {(recentExperiments.length > 0 ||
              bookmarkedExperiments.length > 0) && (
              <div className="grid lg:grid-cols-2 gap-3">
                {recentExperiments.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-white">
                        Recently Used
                      </p>
                      <span className="text-[10px] text-gray-500">
                        quick jump
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {recentExperiments.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveExperimentId(item.id);
                              setActiveLabTab(item.tab);
                              setActiveFocusTopic("all");
                              setExperimentStarted(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-gray-300 hover:text-white"
                          >
                            <Icon size={11} className="text-cyan-300" />{" "}
                            {item.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {bookmarkedExperiments.length > 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-black text-white">
                        Bookmarked Tools
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {bookmarkedExperiments.length} saved
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {bookmarkedExperiments.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              setActiveExperimentId(item.id);
                              setActiveLabTab(item.tab);
                              setActiveFocusTopic("all");
                              setExperimentStarted(true);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-100 hover:text-white"
                          >
                            <Icon size={11} /> {item.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {lastExampleChips.length > 0 && (
              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <p className="text-xs font-black text-white">
                    Last Used Examples
                  </p>
                  <button
                    onClick={() => setLastExampleChips([])}
                    className="text-[10px] text-gray-500 hover:text-gray-300"
                  >
                    Clear all
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {lastExampleChips.map((chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/10 bg-black/15 px-2 py-1 text-[11px] text-gray-300"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {labFocusTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => selectFocusTopic(topic.id)}
                  className={`text-left rounded-xl border p-3 transition-colors ${
                    activeFocusTopic === topic.id
                      ? "bg-emerald-500/15 border-emerald-500/35 text-emerald-100"
                      : "bg-white/[0.035] border-white/10 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  <span className="block text-sm font-bold">{topic.label}</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    {topic.desc}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {labTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveLabTab(tab)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    activeLabTab === tab
                      ? "bg-indigo-600/25 border-indigo-500/40 text-indigo-100"
                      : "bg-white/[0.035] border-white/10 text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-[1fr_170px_170px_180px_auto] gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  ref={labSearchRef}
                  value={labSearch}
                  onChange={(e) => {
                    setLabSearch(e.target.value);
                    setShowLabSearchSuggestions(true);
                  }}
                  onFocus={() => setShowLabSearchSuggestions(true)}
                  onBlur={() =>
                    window.setTimeout(
                      () => setShowLabSearchSuggestions(false),
                      120,
                    )
                  }
                  placeholder="Try pH, CFT, salt analysis, Gibbs..."
                  className="input text-sm pl-9"
                  title="Press / to search"
                />
                {showLabSearchSuggestions && (
                  <div className="absolute z-30 mt-2 w-full rounded-xl border border-white/10 bg-gray-950 shadow-2xl overflow-hidden">
                    {labSearchSuggestions.topics.length > 0 && (
                      <div className="border-b border-white/10 p-2">
                        <p className="px-1 pb-1 text-[10px] uppercase tracking-widest text-gray-500">
                          Suggested words
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {labSearchSuggestions.topics.map((topic) => (
                            <button
                              type="button"
                              key={topic}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setLabSearch(topic);
                                setShowLabSearchSuggestions(false);
                              }}
                              className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-gray-300 hover:text-white"
                            >
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {labSearchSuggestions.matches.length > 0 ? (
                      labSearchSuggestions.matches.map((item) => (
                        <button
                          type="button"
                          key={item.id}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setLabSearch(item.title);
                            setActiveExperimentId(item.id);
                            setActiveLabTab(item.tab);
                            setActiveFocusTopic("all");
                            setShowLabSearchSuggestions(false);
                          }}
                          className="w-full px-3 py-2 text-left hover:bg-white/[0.06]"
                        >
                          <span className="block text-sm font-semibold text-white">
                            {item.title}
                          </span>
                          <span className="block text-[11px] text-gray-500">
                            {item.topic} - {item.type} - {item.difficulty}
                          </span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-3 text-xs text-gray-500">
                        No matching lab suggestion.
                      </div>
                    )}
                  </div>
                )}
              </div>
              <select
                value={labTypeFilter}
                onChange={(e) => setLabTypeFilter(e.target.value)}
                className="input text-sm"
              >
                {labTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
              <select
                value={labDifficultyFilter}
                onChange={(e) => setLabDifficultyFilter(e.target.value)}
                className="input text-sm"
              >
                {labDifficulties.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
              <select
                value={activeSyllabusFilter}
                onChange={(e) => setActiveSyllabusFilter(e.target.value)}
                className="input text-sm"
              >
                <option value="all">All topics</option>
                {syllabusTracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.label}
                  </option>
                ))}
              </select>
              <button
                onClick={clearLabFilters}
                disabled={!filtersActive}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Clear filters
              </button>
            </div>

            {activeLabTab === "Start Here" && (
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                <div className="flex items-center gap-2 text-emerald-200 font-bold text-sm">
                  <GraduationCap size={16} />
                  Recommended beginner path
                </div>
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {recommendedPath.map((item, index) => {
                    const Icon = item.icon;
                    const done = completedExperiments.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveExperimentId(item.id);
                          setActiveLabTab(item.tab);
                        }}
                        className="text-left rounded-xl bg-black/15 border border-white/10 p-3 hover:bg-white/[0.06] transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-xs font-black text-emerald-200">
                            {index + 1}
                          </span>
                          <Icon size={15} className="text-emerald-300" />
                          {done && (
                            <CheckCircle
                              size={14}
                              className="ml-auto text-emerald-300"
                            />
                          )}
                        </div>
                        <p className="text-xs font-bold text-white mt-2">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {item.teaches}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeFocusTopic ? (
              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-center">
                <FlaskConical size={30} className="text-cyan-300 mx-auto" />
                <p className="text-base font-bold text-white mt-3">
                  Choose a chemistry area to begin
                </p>
                <p className="text-sm text-gray-500 mt-1 max-w-lg mx-auto">
                  Experiments stay hidden until you select a category. This
                  keeps the lab focused for students.
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <p className="text-sm font-bold text-emerald-100">
                    {activeFocusInfo?.label}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {activeFocusInfo?.desc}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                      <span>
                        {visibleExperiments.length} related experiments
                      </span>
                      <span>
                        {categoryCompleteCount}/{visibleExperiments.length} done
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{ width: `${categoryProgress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {activeRoadmap && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-black text-white">
                          {activeRoadmap.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Structure, lab method, and medical use stay linked
                          while you move through tools.
                        </p>
                      </div>
                      <BadgePill
                        className="bg-black/15 text-gray-200 border-white/10"
                        style={{
                          borderColor: `${activeRoadmap.accent}66`,
                          color: activeRoadmap.accent,
                        }}
                      >
                        applied track
                      </BadgePill>
                    </div>
                    <div className="grid md:grid-cols-3 gap-3">
                      {activeRoadmap.strands.map(([title, detail], index) => (
                        <div
                          key={title}
                          className="rounded-xl bg-black/20 border border-white/10 p-3"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
                              style={{
                                background: `${activeRoadmap.accent}22`,
                                color: activeRoadmap.accent,
                                border: `1px solid ${activeRoadmap.accent}55`,
                              }}
                            >
                              {index + 1}
                            </span>
                            <p className="text-xs font-bold text-white">
                              {title}
                            </p>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-2">
                            {detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-2 max-h-80 overflow-y-auto scrollbar-thin pr-1">
                  {visibleExperiments.map((item) => {
                    const Icon = item.icon;
                    const active = activeExperiment.id === item.id;
                    const done = completedExperiments.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveExperimentId(item.id);
                          setExperimentStarted(false);
                          setShowQuizAnswer(false);
                        }}
                        className={`text-left rounded-2xl border p-3 transition-colors ${
                          active
                            ? "bg-indigo-600/20 border-indigo-500/40"
                            : "bg-white/[0.035] border-white/10 hover:bg-white/[0.065]"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center">
                            <Icon size={17} className="text-cyan-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-white truncate">
                              {item.title}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {newLabToolIds.has(item.id) && (
                                <BadgePill className="bg-amber-500/15 text-amber-300 border-amber-500/25">
                                  New
                                </BadgePill>
                              )}
                              <BadgePill
                                className={difficultyStyles[item.difficulty]}
                              >
                                {item.difficulty}
                              </BadgePill>
                              <BadgePill className={typeStyles[item.type]}>
                                {item.type}
                              </BadgePill>
                              <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                                {estimatedMinutes(item)} min
                              </BadgePill>
                            </div>
                          </div>
                          {done && (
                            <CheckCircle
                              size={15}
                              className="text-emerald-300 flex-shrink-0"
                            />
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">
                          {item.teaches}
                        </p>
                        <p className="text-[10px] text-cyan-300 mt-2">
                          Best for: {experimentBestFor(item)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {visibleExperiments.length === 0 && (
                  <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-6 text-center">
                    <p className="text-sm font-semibold text-gray-300">
                      No experiment matches this focus.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Try clearing search or switching to All.
                    </p>
                    <button
                      onClick={clearLabFilters}
                      className="btn-secondary text-xs mt-3"
                    >
                      Clear filters
                    </button>
                  </div>
                )}

                <div
                  className={
                    focusLab
                      ? "fixed inset-4 z-50 overflow-y-auto rounded-2xl bg-gray-950 border border-white/15 p-4 shadow-2xl"
                      : ""
                  }
                >
                  {focusLab && (
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-sm font-bold text-white">
                        Focus Lab: {activeExperiment.title}
                      </p>
                      <button
                        onClick={() => setFocusLab(false)}
                        className="btn-secondary text-sm"
                      >
                        Close Focus
                      </button>
                    </div>
                  )}
                  {!experimentStarted ? (
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-center">
                      <p className="text-sm font-bold text-white">
                        Ready to begin {activeExperiment.title}?
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Read the experiment details, then start the live lab
                        bench.
                      </p>
                      <button
                        onClick={() => setExperimentStarted(true)}
                        className="btn-primary mt-4"
                        title="Start the selected lab tool"
                      >
                        Start Experiment
                      </button>
                    </div>
                  ) : (
                    renderGuidedWorkbench()
                  )}
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 h-fit lg:sticky lg:top-4">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <ActiveExperimentIcon size={20} className="text-cyan-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`${teacherMode ? "text-base" : "text-sm"} font-black text-white`}
                >
                  {activeExperiment.title}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {newLabToolIds.has(activeExperiment.id) && (
                    <BadgePill className="bg-amber-500/15 text-amber-300 border-amber-500/25">
                      New
                    </BadgePill>
                  )}
                  <BadgePill
                    className={difficultyStyles[activeExperiment.difficulty]}
                  >
                    {activeExperiment.difficulty}
                  </BadgePill>
                  <BadgePill className={typeStyles[activeExperiment.type]}>
                    {activeExperiment.type}
                  </BadgePill>
                  {activeExperiment.type === "Visualizer" && (
                    <BadgePill className="bg-blue-500/15 text-blue-300 border-blue-500/25">
                      Visual
                    </BadgePill>
                  )}
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                    {estimatedMinutes(activeExperiment)} min
                  </BadgePill>
                  <BadgePill className="bg-white/[0.04] text-gray-300 border-white/10">
                    {activeExperiment.topic}
                  </BadgePill>
                  {activeSyllabusTags.tracks.map((trackId) => (
                    <BadgePill
                      key={trackId}
                      className="bg-black/15 border-white/10"
                      style={{
                        borderColor: `${syllabusTrackMap[trackId]?.color || "#64748b"}66`,
                        color: syllabusTrackMap[trackId]?.color,
                      }}
                    >
                      {syllabusTrackMap[trackId]?.label}
                    </BadgePill>
                  ))}
                </div>
                <p className="mt-2 text-[11px] text-cyan-300">
                  Best for: {experimentBestFor(activeExperiment)}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                <span>Guided progress</span>
                <span>
                  {completedCount}/{LAB_EXPERIMENTS.length} complete
                </span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {copiedLabAction && (
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 text-xs text-emerald-100">
                  {copiedLabAction}
                </div>
              )}
              {validationMessage && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-3 text-xs text-amber-100">
                  <span className="font-semibold">Check input:</span>{" "}
                  {validationMessage}
                </div>
              )}
              <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                <button
                  onClick={() => setShowTheoryDetails((v) => !v)}
                  className="w-full flex items-center justify-between gap-2 text-left"
                >
                  <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                    About Experiment
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {showTheoryDetails ? "Collapse" : "Expand"}
                  </span>
                </button>
                {showTheoryDetails && (
                  <>
                    <p className="text-sm text-gray-300 mt-1">
                      {activeExperiment.teaches}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      <span className="text-cyan-300 font-semibold">
                        Prerequisite:
                      </span>{" "}
                      {prerequisiteMap[activeExperiment.id] ||
                        "No special prerequisite. Start with the visible controls and observe the result."}
                    </p>
                  </>
                )}
              </div>
              {learningMode && !studentPractice && (
                <>
                  <div className="rounded-xl bg-black/15 border border-white/10 p-3">
                    <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                      What To Do
                    </p>
                    <ol className="mt-2 space-y-1">
                      {activeExperiment.steps.map((step, index) => (
                        <li
                          key={step}
                          className="text-xs text-gray-300 flex gap-2 items-start"
                        >
                          <button
                            onClick={() => toggleStepDone(index)}
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 ${activeStepsDone.includes(index) ? "bg-emerald-500/25 text-emerald-200" : "bg-cyan-500/15 text-cyan-200"}`}
                          >
                            {activeStepsDone.includes(index) ? "✓" : index + 1}
                          </button>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <p className="mt-2 text-[10px] text-gray-500">
                      Step{" "}
                      {Math.min(
                        activeStepsDone.length + 1,
                        activeExperiment.steps.length,
                      )}{" "}
                      of {activeExperiment.steps.length}
                    </p>
                  </div>
                  <div className="rounded-xl bg-black/15 border border-white/10 p-3 space-y-2 text-xs">
                    <p className="text-gray-300">
                      <span className="text-cyan-300 font-semibold">
                        Try this:
                      </span>{" "}
                      {activeExperiment.tryThis}
                    </p>
                    <p className="text-gray-300">
                      <span
                        className="text-emerald-300 font-semibold"
                        title="Core rule or formula behind this tool"
                      >
                        How it works:
                      </span>{" "}
                      {activeExperiment.result}
                    </p>
                    <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-2 text-violet-100">
                      <span className="text-violet-300 font-semibold">
                        Real-world use:
                      </span>{" "}
                      {activeExperiment.realWorld}
                    </div>
                    <div className="rounded-lg bg-amber-500/10 border border-amber-500/25 p-2 text-amber-100">
                      <span
                        className="text-amber-300 font-semibold"
                        title="A common exam or lab error"
                      >
                        Common mistake:
                      </span>{" "}
                      {commonMistakes[activeExperiment.id] ||
                        "Changing too many controls at once makes observations harder to explain."}
                    </div>
                    {formulaNotes[activeExperiment.id] &&
                      showFormulaDetails && (
                        <p
                          className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-2 text-blue-100"
                          title="Formula card"
                        >
                          <span className="text-blue-300 font-semibold">
                            Formula note:
                          </span>{" "}
                          {formulaNotes[activeExperiment.id]}
                        </p>
                      )}
                    {formulaNotes[activeExperiment.id] && (
                      <button
                        onClick={() => setShowFormulaDetails((v) => !v)}
                        className="text-[10px] text-blue-300 hover:text-blue-100"
                      >
                        {showFormulaDetails ? "Hide formula" : "Show formula"}
                      </button>
                    )}
                    {activeExperiment.safety && (
                      <p className="text-amber-300">
                        <span className="font-semibold">Safety:</span>{" "}
                        {activeExperiment.safety}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => toggleBookmark(activeExperiment.id)}
                className={`btn-secondary text-xs ${bookmarkedLabs.includes(activeExperiment.id) ? "bg-amber-500/15 text-amber-200 border-amber-500/25" : ""}`}
              >
                {bookmarkedLabs.includes(activeExperiment.id)
                  ? "Bookmarked"
                  : "Bookmark"}
              </button>
              <button
                onClick={applyExampleValues}
                className="btn-secondary text-xs"
              >
                Example Values
              </button>
              <button
                onClick={tryRandomExample}
                className="btn-secondary text-xs"
              >
                Try Random
              </button>
              <button
                onClick={shareActiveSetup}
                className="btn-secondary text-xs"
              >
                Share Setup
              </button>
              <button
                onClick={openActiveFullscreen}
                className="btn-secondary text-xs"
                disabled={!experimentStarted}
                title={
                  experimentStarted
                    ? "Open the current lab visualization in fullscreen"
                    : "Start the experiment first"
                }
              >
                Fullscreen
              </button>
              <button
                onClick={exportActiveVisualization}
                className="btn-secondary text-xs"
                disabled={!experimentStarted}
                title={
                  experimentStarted
                    ? "Export the first SVG visualization"
                    : "Start the experiment first"
                }
              >
                Export Image
              </button>
              <button
                onClick={() => setFocusLab(true)}
                className="btn-secondary text-xs"
              >
                Focus Lab
              </button>
              <button
                onClick={() => setTeacherMode(!teacherMode)}
                className="btn-secondary text-xs"
              >
                {teacherMode ? "Teacher Demo On" : "Teacher Demo"}
              </button>
              <button
                onClick={() => setStudentPractice((v) => !v)}
                className={`btn-secondary text-xs ${studentPractice ? "bg-pink-500/15 text-pink-200 border-pink-500/25" : ""}`}
              >
                {studentPractice ? "Practice Mode On" : "Practice Mode"}
              </button>
              <button
                onClick={() => setShowManual((v) => !v)}
                className="btn-secondary text-xs"
              >
                Lab Manual
              </button>
            </div>

            {studentPractice && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                  Mini Quiz
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  {miniQuiz[activeExperiment.id]?.q ||
                    `What did changing the controls teach you about ${activeExperiment.topic}?`}
                </p>
                <button
                  onClick={() => setShowQuizAnswer((v) => !v)}
                  className="btn-secondary text-xs mt-2"
                >
                  {showQuizAnswer ? "Hide Answer" : "Show Answer"}
                </button>
                {showQuizAnswer && (
                  <p className="text-xs text-emerald-200 mt-2">
                    {miniQuiz[activeExperiment.id]?.a ||
                      activeExperiment.result}
                  </p>
                )}
              </div>
            )}

            {showManual && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3 space-y-2 text-xs">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                  Lab Manual
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">Aim:</span>{" "}
                  {activeExperiment.teaches}
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">
                    Apparatus:
                  </span>{" "}
                  Interactive controls, observation panel, result display.
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">Theory:</span>{" "}
                  {activeExperiment.result}
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">
                    Procedure:
                  </span>{" "}
                  {activeExperiment.steps.join(" ")}
                </p>
                <p>
                  <span className="text-cyan-300 font-semibold">Viva:</span>{" "}
                  {miniQuiz[activeExperiment.id]?.q ||
                    "Explain the result in one sentence."}
                </p>
              </div>
            )}

            <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                Lab Notebook
              </p>
              <textarea
                value={labNotes[activeExperiment.id] || ""}
                onChange={(e) =>
                  setLabNotes((items) => ({
                    ...items,
                    [activeExperiment.id]: e.target.value,
                  }))
                }
                className="input min-h-20 text-sm"
                placeholder="Write observations, measurements, and conclusion..."
              />
            </div>

            <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                Observe - Measure - Conclude
              </p>
              <p className="text-xs text-gray-300">
                <span className="text-cyan-300 font-semibold">Observe:</span>{" "}
                {activeExperiment.tryThis}
              </p>
              <p className="text-xs text-gray-300">
                <span className="text-emerald-300 font-semibold">Measure:</span>{" "}
                {activeResultText()}
              </p>
              <p className="text-xs text-gray-300">
                <span className="text-violet-300 font-semibold">Conclude:</span>{" "}
                {activeExperiment.result}
              </p>
            </div>

            {activeExperiment.type === "Visualizer" && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Visualization Legend
                </p>
                <div className="flex flex-wrap gap-1">
                  <BadgePill className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25">
                    x-axis / horizontal
                  </BadgePill>
                  <BadgePill className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25">
                    y-axis / vertical
                  </BadgePill>
                  <BadgePill className="bg-violet-500/15 text-violet-300 border-violet-500/25">
                    z-axis / depth
                  </BadgePill>
                  <BadgePill className="bg-white/[0.08] text-gray-200 border-white/15">
                    high-contrast grid
                  </BadgePill>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => applyActivePreset("acidic")}
                className="btn-secondary text-xs"
              >
                Acidic
              </button>
              <button
                onClick={() => applyActivePreset("neutral")}
                className="btn-secondary text-xs"
              >
                Neutral
              </button>
              <button
                onClick={() => applyActivePreset("basic")}
                className="btn-secondary text-xs"
              >
                Basic/Fast
              </button>
              <button
                onClick={resetActiveExperiment}
                className="btn-secondary text-xs"
              >
                Reset Experiment
              </button>
              <button
                onClick={() => saveSnapshot("A")}
                className="btn-secondary text-xs"
              >
                Save A
              </button>
              <button
                onClick={() => saveSnapshot("B")}
                className="btn-secondary text-xs"
              >
                Save B
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary text-xs"
              >
                Print Worksheet
              </button>
              <button
                onClick={exportActiveResult}
                className="btn-secondary text-xs"
              >
                Export Result
              </button>
              <button
                onClick={clearCompareSnapshots}
                className="btn-secondary text-xs"
              >
                Clear all graphs
              </button>
              <button
                onClick={() => moveExperiment(-1)}
                className="btn-secondary text-sm flex items-center justify-center gap-1"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => moveExperiment(1)}
                className="btn-secondary text-sm flex items-center justify-center gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
              <button
                onClick={markActiveComplete}
                className={`col-span-2 btn-primary text-sm flex items-center justify-center gap-2 ${isActiveComplete ? "opacity-80" : ""}`}
              >
                <CheckCircle size={15} />{" "}
                {isActiveComplete ? "Completed" : "Mark Complete"}
              </button>
              <button
                onClick={resetGuidedProgress}
                className="col-span-2 text-xs text-gray-500 hover:text-gray-300 py-1"
              >
                Reset guided progress
              </button>
            </div>

            {relatedExperiments.length > 0 && (
              <div className="mt-4 rounded-xl bg-black/15 border border-white/10 p-3">
                <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold mb-2">
                  Related tools
                </p>
                <div className="space-y-1">
                  {relatedExperiments.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveExperimentId(item.id);
                          setActiveLabTab(item.tab);
                          setActiveFocusTopic("all");
                          setExperimentStarted(true);
                        }}
                        className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs text-gray-300 hover:bg-white/[0.05] hover:text-white"
                      >
                        <Icon size={13} className="text-cyan-300" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {compareSnapshots[activeExperiment.id] && (
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                {["A", "B"].map((slot) => (
                  <div
                    key={slot}
                    className="rounded-xl bg-white/[0.035] border border-white/10 p-2"
                  >
                    <p className="text-gray-500">Snapshot {slot}</p>
                    <p className="text-gray-200 mt-1">
                      {compareSnapshots[activeExperiment.id]?.[slot]?.result ||
                        "Not saved"}
                    </p>
                    {compareSnapshots[activeExperiment.id]?.[slot]?.savedAt && (
                      <p className="text-[10px] text-gray-600 mt-1">
                        {compareSnapshots[activeExperiment.id][slot].savedAt}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showFullLab && (
        <>
          <Section icon={Zap} title="Interactive Simulations">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <LabCard title="Titration Simulator">
                <label className="text-[10px] text-gray-500">
                  NaOH drops: {simTitrationDrops}
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={simTitrationDrops}
                    onChange={(e) =>
                      setSimTitrationDrops(Number(e.target.value))
                    }
                    className="w-full"
                  />
                </label>
                <div className="mt-3 h-24 rounded-xl border border-white/10 flex items-end overflow-hidden bg-white/[0.04]">
                  <div
                    className="w-full"
                    style={{
                      height: `${Math.min(100, 25 + simTitrationDrops / 10)}%`,
                      background:
                        simTitration.pH < 7
                          ? "#ef4444"
                          : simTitration.pH < 9
                            ? "#22c55e"
                            : "#ec4899",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  pH meter: {simTitration.pH.toFixed(2)} · {simTitration.region}
                </p>
              </LabCard>

              <LabCard title="Electrolysis Cell">
                <select
                  value={electrolyte}
                  onChange={(e) => setElectrolyte(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["CuSO4", "NaCl(aq)", "H2O + acid"].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <div className="h-24 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
                  <span className="absolute left-8 top-3 bottom-3 w-3 rounded bg-slate-300" />
                  <span className="absolute right-8 top-3 bottom-3 w-3 rounded bg-slate-300" />
                  {Array.from({ length: 16 }, (_, i) => (
                    <span
                      key={i}
                      className="absolute w-2 h-2 rounded-full bg-cyan-200 animate-pulse"
                      style={{
                        left: `${18 + (i % 8) * 8}%`,
                        top: `${20 + Math.floor(i / 8) * 35}%`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {electrolysis.cathode}; {electrolysis.anode}
                </p>
              </LabCard>

              <LabCard title="Distillation Apparatus">
                <label className="text-[10px] text-gray-500">
                  Heating: {distillHeat}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={distillHeat}
                    onChange={(e) => setDistillHeat(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="h-28 rounded-xl bg-black/20 border border-white/10 relative mt-3">
                  <span className="absolute left-8 bottom-4 w-14 h-16 rounded-b-3xl border border-cyan-300/30 bg-cyan-500/10" />
                  <span className="absolute left-20 top-10 right-16 h-2 bg-slate-400 rounded" />
                  <span className="absolute right-8 bottom-4 w-10 h-12 rounded-b-xl border border-white/20 bg-white/[0.04]" />
                  {distillHeat > 45 && (
                    <span className="absolute left-24 top-8 right-14 border-t border-dashed border-cyan-300 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {distillHeat > 78
                    ? "Ethanol-rich vapor condenses into collector."
                    : "Heat below boiling range; little vapor collected."}
                </p>
              </LabCard>

              <LabCard title="Chromatography">
                <label className="text-[10px] text-gray-500">
                  Run time: {chromTime}%
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={chromTime}
                    onChange={(e) => setChromTime(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="h-28 rounded-xl bg-yellow-50/90 border border-white/10 relative mt-3">
                  {["#ef4444", "#22c55e", "#3b82f6"].map((color, i) => (
                    <span
                      key={color}
                      className="absolute left-1/2 -translate-x-1/2 w-20 h-3 rounded-full"
                      style={{
                        background: color,
                        bottom: `${12 + chromTime * (0.25 + i * 0.12)}%`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Bands separate by attraction to stationary phase vs solvent.
                </p>
              </LabCard>

              <LabCard title="Spectroscopy Viewer">
                <ElementSearchInput
                  value={selectedSymbol}
                  onChange={setSelectedSymbol}
                  allowedSymbols={["H", "He", "Li", "Na", "K", "Ca", "Cu"]}
                  className="mb-3"
                />
                <div className="h-20 rounded-xl bg-gradient-to-r from-violet-700 via-green-500 to-red-600 border border-white/10 relative overflow-hidden">
                  {(spectrumLines[selectedSymbol] || [486, 656]).map((nm) => (
                    <span
                      key={nm}
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_white]"
                      style={{ left: `${((nm - 380) / 370) * 100}%` }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Visible emission lines for {selectedSymbol}.
                </p>
              </LabCard>

              <LabCard title="pH Meter">
                <select
                  value={probeSolution}
                  onChange={(e) => setProbeSolution(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["water", "vinegar", "ammonia", "cola", "soap"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <div className="text-4xl font-black text-white">
                  pH {probePh.toFixed(1)}
                </div>
                <MiniBar
                  label="acid to base"
                  value={(probePh / 14) * 100}
                  color={
                    probePh < 7
                      ? "#ef4444"
                      : probePh > 7
                        ? "#3b82f6"
                        : "#22c55e"
                  }
                />
              </LabCard>

              <LabCard title="Electrochemical Cell">
                <div className="flex gap-2 mb-3">
                  {[metalA, metalB].map((m, i) => (
                    <select
                      key={i}
                      value={m}
                      onChange={(e) =>
                        i
                          ? setMetalB(e.target.value)
                          : setMetalA(e.target.value)
                      }
                      className="input text-xs"
                    >
                      {Object.keys(reductionPotentials).map((x) => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  ))}
                </div>
                <div className="h-24 rounded-xl bg-black/20 border border-white/10 flex items-center justify-around">
                  <span className="px-3 py-6 rounded-xl bg-white/[0.06]">
                    {metalA}
                  </span>
                  <span className="text-cyan-300 font-mono">
                    {cellVoltage.toFixed(2)} V
                  </span>
                  <span className="px-3 py-6 rounded-xl bg-white/[0.06]">
                    {metalB}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Salt bridge maintains charge; electrons flow from lower E deg
                  metal.
                </p>
              </LabCard>

              <LabCard title="Le Chatelier Equilibrium">
                <label className="text-[10px] text-gray-500">
                  Reactant level {eqReactant.toFixed(1)}x
                  <input
                    type="range"
                    min="0.2"
                    max="3"
                    step="0.1"
                    value={eqReactant}
                    onChange={(e) => setEqReactant(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <label className="text-[10px] text-gray-500">
                  Temperature {eqTemp} C
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={eqTemp}
                    onChange={(e) => setEqTemp(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  N2O4 ⇌ 2NO2: system {eqShift}.
                </p>
              </LabCard>

              <LabCard title="Osmosis Demo">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500">
                  <label>
                    Left {osmosisLeft} M
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={osmosisLeft}
                      onChange={(e) => setOsmosisLeft(Number(e.target.value))}
                    />
                  </label>
                  <label>
                    Right {osmosisRight} M
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={osmosisRight}
                      onChange={(e) => setOsmosisRight(Number(e.target.value))}
                    />
                  </label>
                </div>
                <div className="h-20 rounded-xl bg-blue-500/10 border border-blue-400/20 mt-3 grid grid-cols-2 divide-x divide-dashed divide-white/30">
                  <div className="flex items-center justify-center">H2O</div>
                  <div className="flex items-center justify-center">
                    {osmosisRight > osmosisLeft ? "← solute" : "solute →"}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {osmoticFlow} toward higher solute concentration.
                </p>
              </LabCard>

              <LabCard title="Flame Test">
                <ElementSearchInput
                  value={flameElement}
                  onChange={setFlameElement}
                  allowedSymbols={Object.keys(flameColors)}
                  className="mb-3"
                  placeholder="Search available metal ions"
                />
                <div className="h-28 rounded-xl bg-black border border-white/10 flex items-end justify-center overflow-hidden">
                  <div
                    className="w-24 h-24 rounded-t-full blur-sm"
                    style={{
                      background: flameColors[flameElement],
                      boxShadow: `0 0 40px ${flameColors[flameElement]}`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {flameElement} characteristic flame color.
                </p>
              </LabCard>
            </div>
          </Section>

          <Section icon={Calculator} title="Calculators & Tools">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <LabCard title="Molar Mass Calculator">
                <input
                  value={formulaInput}
                  onChange={(e) => setFormulaInput(e.target.value)}
                  className="input text-xs mb-2"
                />
                <p className="text-2xl font-black text-white">
                  {mass.toFixed(3)} g/mol
                </p>
                <p className="text-xs text-gray-500">
                  {Object.entries(parsed)
                    .map(([s, n]) => `${s} x ${n}`)
                    .join(" · ")}
                </p>
              </LabCard>

              <LabCard title="Stoichiometry Solver">
                <input
                  value={stoichEquation}
                  onChange={(e) => setStoichEquation(e.target.value)}
                  className="input text-xs mb-2"
                />
                <input
                  type="number"
                  value={stoichMoles}
                  onChange={(e) => setStoichMoles(Number(e.target.value))}
                  className="input text-xs mb-2"
                />
                <p className="text-xs text-gray-300">
                  {stoichBalanced.ok
                    ? stoichBalanced.balanced
                    : stoichBalanced.error}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Starting amount: {stoichMoles} mol of first reactant.
                </p>
              </LabCard>

              <LabCard title="Molarity / Dilution Calculator">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={c1}
                    onChange={(e) => setC1(Number(e.target.value))}
                    className="input text-xs"
                  />
                  <input
                    type="number"
                    value={v1}
                    onChange={(e) => setV1(Number(e.target.value))}
                    className="input text-xs"
                  />
                  <input
                    type="number"
                    value={c2}
                    onChange={(e) => setC2(Number(e.target.value))}
                    className="input text-xs"
                  />
                </div>
                <p className="text-2xl font-black text-white mt-3">
                  V2 = {dilutionV2.toFixed(2)} mL
                </p>
                <p className="text-xs text-gray-500">C1V1 = C2V2</p>
              </LabCard>

              <LabCard title="pH / pOH Calculator">
                <input
                  type="number"
                  value={ka}
                  onChange={(e) => setKa(Number(e.target.value))}
                  className="input text-xs mb-2"
                />
                <p className="text-xl font-black text-white">
                  pH {weakAcidPh.toFixed(2)} · pOH{" "}
                  {(14 - weakAcidPh).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  Weak acid approximation for 0.100 M acid.
                </p>
              </LabCard>

              <LabCard title="Ideal Gas Law Calculator">
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    value={gasP}
                    onChange={(e) => setGasP(Number(e.target.value))}
                    className="input text-xs"
                  />
                  <input
                    type="number"
                    value={gasV}
                    onChange={(e) => setGasV(Number(e.target.value))}
                    className="input text-xs"
                  />
                  <input
                    type="number"
                    value={gasT}
                    onChange={(e) => setGasT(Number(e.target.value))}
                    className="input text-xs"
                  />
                </div>
                <p className="text-2xl font-black text-white mt-3">
                  n = {gasN.toFixed(3)} mol
                </p>
                <p className="text-xs text-gray-500">
                  PV = nRT, R = 0.082057 L atm mol-1 K-1
                </p>
              </LabCard>

              <LabCard title="Empirical Formula Finder">
                {empRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2 mb-1">
                    <input
                      value={row.symbol}
                      onChange={(e) =>
                        setEmpRows((rows) =>
                          rows.map((r, idx) =>
                            idx === i ? { ...r, symbol: e.target.value } : r,
                          ),
                        )
                      }
                      className="input text-xs"
                    />
                    <input
                      type="number"
                      value={row.percent}
                      onChange={(e) =>
                        setEmpRows((rows) =>
                          rows.map((r, idx) =>
                            idx === i
                              ? { ...r, percent: Number(e.target.value) }
                              : r,
                          ),
                        )
                      }
                      className="input text-xs"
                    />
                  </div>
                ))}
                <p className="text-2xl font-black text-white mt-2">
                  {empiricalFormula(empRows)}
                </p>
              </LabCard>

              <LabCard title="Oxidation State Finder">
                <input
                  value={oxidFormula}
                  onChange={(e) => setOxidFormula(e.target.value)}
                  className="input text-xs mb-2"
                />
                <p className="text-sm text-gray-200">
                  {oxidationGuess(oxidFormula)}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Applies common rules for O, H, and known ion charges.
                </p>
              </LabCard>

              <LabCard title="Electron Configuration Builder">
                <input
                  type="number"
                  min="1"
                  max="118"
                  value={configAtomicNumber}
                  onChange={(e) =>
                    setConfigAtomicNumber(Number(e.target.value))
                  }
                  className="input text-xs mb-2"
                />
                <p className="text-sm text-gray-200 font-mono">
                  {configElement.name}: {configElement.electronConfiguration}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {configFill.map((part) => (
                    <span
                      key={part.raw}
                      className="px-2 py-1 rounded bg-white/[0.06] text-xs"
                    >
                      {part.raw}
                    </span>
                  ))}
                </div>
              </LabCard>

              <LabCard title="Reaction Enthalpy (Hess's Law)">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={hessA}
                    onChange={(e) => setHessA(Number(e.target.value))}
                    className="input text-xs"
                  />
                  <input
                    type="number"
                    value={hessB}
                    onChange={(e) => setHessB(Number(e.target.value))}
                    className="input text-xs"
                  />
                </div>
                <p className="text-2xl font-black text-white mt-3">
                  ΔH = {deltaH.toFixed(1)} kJ
                </p>
                <p className="text-xs text-gray-500">
                  Sum reaction enthalpies after matching target reaction.
                </p>
              </LabCard>

              <LabCard title="Colligative Properties Calculator">
                <label className="text-[10px] text-gray-500">
                  Molality {molality} m
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={molality}
                    onChange={(e) => setMolality(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <p className="text-sm text-gray-200 mt-2">
                  ΔTb = {boilingElevation.toFixed(2)} C · ΔTf ={" "}
                  {freezingDepression.toFixed(2)} C
                </p>
                <p className="text-xs text-gray-500">
                  Water constants: Kb 0.512, Kf 1.86.
                </p>
              </LabCard>
            </div>
          </Section>

          <Section icon={Orbit} title="Visualizers & Explorers">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <LabCard title="Orbital Shape Viewer">
                <select
                  value={orbitalType}
                  onChange={(e) => setOrbitalType(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {Object.keys(orbitalMeta).map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <div className="h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center relative overflow-hidden">
                  {Array.from({ length: orbital.lobes }, (_, i) => {
                    const angle = (360 / orbital.lobes) * i;
                    return (
                      <span
                        key={i}
                        className="absolute w-16 h-10 rounded-[50%] opacity-80"
                        style={{
                          background: i % 2 ? "#ef4444" : "#38bdf8",
                          transform: `rotate(${angle}deg) translateX(${orbitalType === "s" ? 0 : 24}px)`,
                        }}
                      />
                    );
                  })}
                  <span className="absolute w-4 h-4 rounded-full bg-white" />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {orbitalType} orbital: {orbital.note} Blue/red show opposite
                  wavefunction phase.
                </p>
              </LabCard>

              <LabCard title="Crystal Structure Viewer">
                <select
                  value={structureType}
                  onChange={(e) => setStructureType(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["NaCl", "diamond", "HCP", "FCC"].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <div className="h-32 rounded-xl bg-black/20 border border-white/10 grid grid-cols-4 gap-1 p-4">
                  {Array.from(
                    { length: structureType === "HCP" ? 18 : 16 },
                    (_, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-white/15"
                        style={{
                          background:
                            structureType === "NaCl" && i % 2
                              ? "#4ade80"
                              : "#94a3b8",
                          transform:
                            structureType === "HCP"
                              ? `translateX(${(Math.floor(i / 4) % 2) * 10}px)`
                              : structureType === "FCC" &&
                                  [0, 3, 12, 15, 5, 6, 9, 10].includes(i)
                                ? "scale(1.15)"
                                : "scale(0.85)",
                        }}
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Compare cubic, diamond, close-packed, and ionic unit-cell
                  patterns.
                </p>
              </LabCard>

              <LabCard title="Hybridization Animator">
                <select
                  value={hybrid}
                  onChange={(e) => setHybrid(e.target.value)}
                  className="input text-xs mb-2"
                >
                  {["sp", "sp2", "sp3", "dsp2", "sp3d"].map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hybridMix}
                  onChange={(e) => setHybridMix(Number(e.target.value))}
                  className="w-full mb-3"
                />
                <div className="h-28 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-1">
                  {Array.from(
                    {
                      length:
                        hybrid === "sp"
                          ? 2
                          : hybrid === "sp2"
                            ? 3
                            : hybrid === "sp3"
                              ? 4
                              : 5,
                    },
                    (_, i) => (
                      <span
                        key={i}
                        className="w-8 rounded-[50%] bg-gradient-to-b from-cyan-300 to-violet-500"
                        style={{
                          height: `${36 + hybridMix / 3}px`,
                          transform: `rotate(${i * 35 - hybridMix / 8}deg)`,
                        }}
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Mix amount {hybridMix}% shows atomic orbitals combining into
                  directed hybrids.
                </p>
              </LabCard>

              <LabCard title="VSEPR Shape Builder">
                <div className="grid grid-cols-2 gap-2 mb-3 text-[10px] text-gray-500">
                  <label>
                    Bonded atoms
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={bondedAtoms}
                      onChange={(e) => setBondedAtoms(Number(e.target.value))}
                      className="input text-xs mt-1"
                    />
                  </label>
                  <label>
                    Lone pairs
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={lonePairs}
                      onChange={(e) => setLonePairs(Number(e.target.value))}
                      className="input text-xs mt-1"
                    />
                  </label>
                </div>
                <svg
                  viewBox="0 0 100 80"
                  className="w-full h-28 rounded-xl bg-black/20 border border-white/10"
                >
                  {geometry.points.slice(1).map((p, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="40"
                      x2={p[0]}
                      y2={p[1] * 0.8}
                      stroke="#38bdf8"
                    />
                  ))}
                  {geometry.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1] * 0.8}
                      r={i ? 4 : 7}
                      fill={i ? "#e2e8f0" : "#f59e0b"}
                    />
                  ))}
                </svg>
                <p className="text-xs text-gray-500 mt-2">
                  AX{bondedAtoms}E{lonePairs}: {vsepr.shape}, {vsepr.angle}.
                </p>
              </LabCard>

              <LabCard title="Bond Polarity Visualizer">
                <div className="flex gap-2 mb-3">
                  <ElementSearchInput
                    value={polarityA}
                    onChange={setPolarityA}
                  />
                  <ElementSearchInput
                    value={polarityB}
                    onChange={setPolarityB}
                  />
                </div>
                <svg
                  viewBox="0 0 220 80"
                  className="w-full h-28 rounded-xl bg-black/20 border border-white/10"
                >
                  <circle cx="55" cy="40" r="18" fill="#94a3b8" />
                  <circle cx="165" cy="40" r="18" fill="#38bdf8" />
                  <line
                    x1="73"
                    y1="40"
                    x2="147"
                    y2="40"
                    stroke="#e2e8f0"
                    strokeWidth="4"
                  />
                  <line
                    x1="90"
                    y1="22"
                    x2="145"
                    y2="22"
                    stroke="#f59e0b"
                    strokeWidth="3"
                    markerEnd="url(#arrow)"
                  />
                  <defs>
                    <marker
                      id="arrow"
                      markerWidth="8"
                      markerHeight="8"
                      refX="5"
                      refY="3"
                      orient="auto"
                    >
                      <path d="M0,0 L0,6 L6,3 z" fill="#f59e0b" />
                    </marker>
                  </defs>
                  <text x="50" y="45" fontSize="11" fill="#fff">
                    {polarityA}
                  </text>
                  <text x="160" y="45" fontSize="11" fill="#fff">
                    {polarityB}
                  </text>
                </svg>
                <p className="text-xs text-gray-500 mt-2">
                  {polarity.type}. Delta EN{" "}
                  {polarity.delta?.toFixed?.(2) ?? "n/a"}; arrow points toward
                  the more electronegative atom.
                </p>
              </LabCard>

              <LabCard title="Reaction Mechanism Player">
                <div className="flex gap-2 mb-3">
                  <select
                    value={mechanism}
                    onChange={(e) => {
                      setMechanism(e.target.value);
                      setMechanismStep(0);
                    }}
                    className="input text-xs"
                  >
                    {Object.keys(mechanismData).map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                  <input
                    type="range"
                    min="0"
                    max={mechanismSteps.length - 1}
                    value={mechanismStep}
                    onChange={(e) => setMechanismStep(Number(e.target.value))}
                  />
                </div>
                <div className="h-28 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                  <span className="text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">
                    Nu: {"->"} C - LG
                  </span>
                  <span className="mx-2 text-cyan-300 text-2xl">↷</span>
                  <span className="text-xs px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10">
                    Product
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {mechanism}: {mechanismSteps[mechanismStep]}
                </p>
              </LabCard>

              <LabCard title="Intermolecular Forces Demo">
                <select
                  value={imfType}
                  onChange={(e) => setImfType(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {[
                    "London dispersion",
                    "dipole-dipole",
                    "hydrogen bonding",
                  ].map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
                <div className="h-28 rounded-xl bg-black/20 border border-white/10 relative overflow-hidden">
                  {Array.from({ length: 6 }, (_, i) => (
                    <span
                      key={i}
                      className="absolute w-12 h-6 rounded-full bg-cyan-400/30 border border-cyan-300/30"
                      style={{
                        left: `${10 + (i % 3) * 28}%`,
                        top: `${20 + Math.floor(i / 3) * 38}%`,
                      }}
                    />
                  ))}
                  {Array.from(
                    {
                      length:
                        imfType === "hydrogen bonding"
                          ? 5
                          : imfType === "dipole-dipole"
                            ? 3
                            : 2,
                    },
                    (_, i) => (
                      <span
                        key={i}
                        className="absolute border-t border-dashed border-yellow-300 w-16"
                        style={{
                          left: `${20 + i * 12}%`,
                          top: `${42 + (i % 2) * 20}%`,
                        }}
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {imfType} controls boiling point, viscosity, and solubility
                  trends.
                </p>
              </LabCard>

              <LabCard title="Nuclear Decay Simulator">
                <select
                  value={decayMode}
                  onChange={(e) => setDecayMode(e.target.value)}
                  className="input text-xs mb-2"
                >
                  {["alpha", "beta-", "gamma"].map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={decayHalfLives}
                  onChange={(e) => setDecayHalfLives(Number(e.target.value))}
                  className="w-full"
                />
                <div className="h-20 rounded-xl bg-black/20 border border-white/10 mt-3 flex items-center justify-center gap-3">
                  <span className="w-12 h-12 rounded-full bg-red-400/60 flex items-center justify-center text-xs text-white">
                    Parent
                  </span>
                  <span className="text-yellow-300">
                    {decayMode === "alpha"
                      ? "α"
                      : decayMode === "beta-"
                        ? "β-"
                        : "γ"}
                  </span>
                  <span className="w-12 h-12 rounded-full bg-green-400/50 flex items-center justify-center text-xs text-white">
                    Daughter
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {decayRemaining.toFixed(2)}% parent remains after{" "}
                  {decayHalfLives} half-lives.
                </p>
              </LabCard>

              <LabCard title="Phase Diagram Explorer">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
                  <label>
                    Temp {phaseTemp} C
                    <input
                      type="range"
                      min="-50"
                      max="450"
                      value={phaseTemp}
                      onChange={(e) => setPhaseTemp(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label>
                    Pressure {phasePressure} atm
                    <input
                      type="range"
                      min="0.001"
                      max="220"
                      step="0.1"
                      value={phasePressure}
                      onChange={(e) => setPhasePressure(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
                <svg
                  viewBox="0 0 220 120"
                  className="w-full h-32 rounded-xl bg-black/20 border border-white/10"
                >
                  <path
                    d="M20 95 C70 65, 85 45, 110 20"
                    stroke="#38bdf8"
                    fill="none"
                  />
                  <path
                    d="M45 100 C78 75, 130 70, 190 25"
                    stroke="#f59e0b"
                    fill="none"
                  />
                  <circle
                    cx={20 + Math.min(190, (phaseTemp + 50) * 0.38)}
                    cy={105 - Math.min(95, Math.log10(phasePressure + 1) * 40)}
                    r="5"
                    fill="#22c55e"
                  />
                  <text x="25" y="112" fontSize="8" fill="#64748b">
                    triple
                  </text>
                  <text x="168" y="22" fontSize="8" fill="#64748b">
                    critical
                  </text>
                </svg>
                <p className="text-xs text-gray-500 mt-2">
                  At {phaseTemp} C and {phasePressure} atm: {phase}.
                </p>
              </LabCard>

              <LabCard title="Molecular Orbital Diagram">
                <select
                  value={moMolecule}
                  onChange={(e) => setMoMolecule(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {Object.keys(moData).map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <div className="space-y-1">
                  {mo.fill.map((row, i) => (
                    <div key={row} className="flex items-center gap-2 text-xs">
                      <span className="w-20 text-gray-500">level {i + 1}</span>
                      <span className="flex-1 rounded-lg bg-white/[0.05] border border-white/10 px-2 py-1 text-gray-200 font-mono">
                        {row}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {moMolecule}: bond order {mo.order}, {mo.magnetic},{" "}
                  {mo.electrons} valence electrons.
                </p>
              </LabCard>
            </div>
          </Section>

          <Section icon={FlaskConical} title="Virtual Lab Experiments">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <LabCard title="Reaction Rate Lab">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
                  <label>
                    Temperature: {rateTemp} C
                    <input
                      type="range"
                      min="5"
                      max="80"
                      value={rateTemp}
                      onChange={(e) => setRateTemp(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label>
                    Concentration: {rateConc.toFixed(1)} M
                    <input
                      type="range"
                      min="0.2"
                      max="3"
                      step="0.1"
                      value={rateConc}
                      onChange={(e) => setRateConc(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
                <svg
                  viewBox="0 0 250 90"
                  className="w-full h-28 rounded-xl bg-black/20 border border-white/10"
                >
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    points={ratePoints.map((p) => `${p.x},${p.y}`).join(" ")}
                  />
                  <text x="8" y="84" fontSize="8" fill="#64748b">
                    product vs time; k={rateK.toFixed(2)}
                  </text>
                </svg>
              </LabCard>

              <LabCard title="Calorimetry Experiment">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 mb-3">
                  <label>
                    Metal temp: {metalTemp} C
                    <input
                      type="range"
                      min="30"
                      max="150"
                      value={metalTemp}
                      onChange={(e) => setMetalTemp(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                  <label>
                    Metal mass: {metalMass} g
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={metalMass}
                      onChange={(e) => setMetalMass(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
                <div className="h-28 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-end justify-center overflow-hidden">
                  <div
                    className="w-28 rounded-t-3xl transition-all"
                    style={{
                      height: `${Math.min(100, finalTemp * 1.8)}%`,
                      background: finalTemp > 35 ? "#ef4444" : "#38bdf8",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Final equilibrium temperature: {finalTemp.toFixed(2)} C using
                  q metal + q water = 0.
                </p>
              </LabCard>

              <LabCard title="Solubility Lab">
                <div className="flex gap-2 mb-3">
                  <select
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                    className="input text-xs"
                  >
                    {Object.keys(kspData).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.0005"
                    value={saltAdded}
                    onChange={(e) => setSaltAdded(Number(e.target.value))}
                    className="input text-xs"
                  />
                </div>
                <MiniBar
                  label={`Q = ${ionProduct.toExponential(2)}`}
                  value={Math.min(100, (ionProduct / selectedSalt.ksp) * 30)}
                  color={precipitates ? "#ef4444" : "#22c55e"}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Ksp {selectedSalt.ksp.toExponential(2)}.{" "}
                  {precipitates
                    ? "Precipitate forms."
                    : "Solution remains unsaturated/saturated."}
                </p>
              </LabCard>

              <LabCard title="Indicator Color Table">
                <div className="flex gap-2 mb-3">
                  <select
                    value={indicator}
                    onChange={(e) => setIndicator(e.target.value)}
                    className="input text-xs"
                  >
                    {Object.keys(indicators).map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                  <label className="text-[10px] text-gray-500 flex-1">
                    pH {solutionPh}
                    <input
                      type="range"
                      min="0"
                      max="14"
                      step="0.1"
                      value={solutionPh}
                      onChange={(e) => setSolutionPh(Number(e.target.value))}
                      className="w-full"
                    />
                  </label>
                </div>
                <div
                  className="h-24 rounded-xl border border-white/10 flex items-center justify-center text-sm font-bold"
                  style={{
                    background: indicatorColor(indicator, solutionPh),
                    color:
                      solutionPh > 4 && solutionPh < 10 ? "#111827" : "#fff",
                  }}
                >
                  {indicator}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Transition range: pH {indicators[indicator].low}-
                  {indicators[indicator].high}.
                </p>
              </LabCard>

              <LabCard title="Galvanic Series / Corrosion Demo">
                <div className="flex gap-2 mb-3">
                  {[
                    [metalA, setMetalA],
                    [metalB, setMetalB],
                  ].map(([value, setter], i) => (
                    <select
                      key={i}
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="input text-xs"
                    >
                      {Object.keys(reductionPotentials).map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                    </select>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  {[metalA, metalB].map((m) => (
                    <div
                      key={m}
                      className={`rounded-xl p-3 border ${m === corrosion ? "border-red-400/40 bg-red-500/10" : "border-green-400/30 bg-green-500/10"}`}
                    >
                      <p className="text-xl font-black text-white">{m}</p>
                      <p className="text-[10px] text-gray-500">
                        E deg {reductionPotentials[m]} V
                      </p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {corrosion} corrodes first. Cell voltage about{" "}
                  {cellVoltage.toFixed(2)} V.
                </p>
              </LabCard>

              <LabCard title="Soap Making (Saponification)">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sapProgress}
                  onChange={(e) => setSapProgress(Number(e.target.value))}
                  className="w-full mb-3"
                />
                <div className="h-24 rounded-xl bg-black/20 border border-white/10 relative overflow-hidden">
                  {Array.from({ length: 14 }, (_, i) => (
                    <span
                      key={i}
                      className="absolute h-2 rounded-full bg-emerald-300"
                      style={{
                        width: `${20 + sapProgress / 5}px`,
                        left: `${8 + (i % 7) * 13}%`,
                        top: `${20 + Math.floor(i / 7) * 35}%`,
                        transform: `rotate(${i * 23}deg)`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Triglyceride + 3NaOH {"->"} glycerol + 3 soap salts. Micelles
                  grow as progress reaches {sapProgress}%.
                </p>
              </LabCard>

              <LabCard title="Fermentation Simulator">
                <label className="text-[10px] text-gray-500">
                  Yeast temperature: {yeastTemp} C
                  <input
                    type="range"
                    min="5"
                    max="55"
                    value={yeastTemp}
                    onChange={(e) => setYeastTemp(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <MiniBar
                  label="Yeast activity"
                  value={yeastActivity}
                  color="#f59e0b"
                />
                <div className="mt-3 flex flex-wrap gap-1">
                  {Array.from(
                    { length: Math.round(yeastActivity / 8) },
                    (_, i) => (
                      <span
                        key={i}
                        className="w-3 h-3 rounded-full bg-slate-200 animate-pulse"
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  C6H12O6 {"->"} 2C2H5OH + 2CO2. Activity peaks near 30-35 C.
                </p>
              </LabCard>

              <LabCard title="Polymer Builder">
                <label className="text-[10px] text-gray-500">
                  Monomers: {polymerLength}
                  <input
                    type="range"
                    min="2"
                    max="24"
                    value={polymerLength}
                    onChange={(e) => setPolymerLength(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="flex flex-wrap gap-1 mt-3">
                  {Array.from({ length: polymerLength }, (_, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-violet-500/20 border border-violet-400/20 text-xs text-violet-100"
                    >
                      CH2
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Addition polymerization links alkene monomers into a growing
                  carbon chain.
                </p>
              </LabCard>

              <LabCard title="Buffer Solution Lab">
                <label className="text-[10px] text-gray-500">
                  Acid/base added: {bufferAdded.toFixed(1)} mmol
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={bufferAdded}
                    onChange={(e) => setBufferAdded(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10">
                    <p className="text-[10px] text-gray-500">Acetate buffer</p>
                    <p className="text-xl font-black text-white">
                      pH {bufferPh.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/[0.04] p-3 border border-white/10">
                    <p className="text-[10px] text-gray-500">Pure water</p>
                    <p className="text-xl font-black text-white">
                      pH {pureWaterPh.toFixed(2)}
                    </p>
                  </div>
                </div>
              </LabCard>

              <LabCard title="Recrystallization Visualizer">
                <label className="text-[10px] text-gray-500">
                  Cooling temperature: {recrystTemp} C
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={recrystTemp}
                    onChange={(e) => setRecrystTemp(Number(e.target.value))}
                    className="w-full"
                  />
                </label>
                <div className="h-28 rounded-xl bg-cyan-500/10 border border-cyan-400/20 relative overflow-hidden mt-3">
                  {Array.from(
                    { length: Math.round(supersaturation / 5) },
                    (_, i) => (
                      <span
                        key={i}
                        className="absolute w-3 h-3 rotate-45 bg-cyan-200"
                        style={{
                          left: `${8 + (i % 8) * 11}%`,
                          top: `${20 + Math.floor(i / 8) * 22}%`,
                        }}
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Supersaturation index {supersaturation.toFixed(1)}. Crystals
                  form as solubility drops on cooling.
                </p>
              </LabCard>
            </div>
          </Section>

          <Section icon={Sparkles} title="10 Interactive Chemistry Simulators">
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Boxes size={15} className="text-emerald-300" />
                  <h4 className="text-sm font-bold text-white">
                    3D Crystal Lattice Explorer
                  </h4>
                </div>
                <div className="flex gap-2 mb-3">
                  <select
                    value={lattice}
                    onChange={(e) => setLattice(e.target.value)}
                    className="input text-xs"
                  >
                    {Object.keys(crystalLattices).map((name) => (
                      <option key={name}>{name}</option>
                    ))}
                  </select>
                  <input
                    type="range"
                    min="2"
                    max="6"
                    value={latticeSize}
                    onChange={(e) => setLatticeSize(Number(e.target.value))}
                  />
                </div>
                <div className="relative h-44 mx-auto rounded-xl bg-black/20 border border-white/10 overflow-hidden">
                  {latticeInfo.points
                    .slice(0, latticeSize * latticeSize * 3)
                    .map((p, i) => (
                      <span
                        key={i}
                        title={latticeInfo.species[p.species]?.label}
                        className="absolute w-4 h-4 rounded-full border border-white/15 shadow-lg"
                        style={{
                          background: latticeInfo.species[p.species]?.color,
                          left: `${12 + p.x * (72 / Math.max(1, latticeSize))}%`,
                          top: `${12 + p.y * (72 / Math.max(1, latticeSize))}%`,
                          transform: `translate(${p.z * 10}px, ${p.z * -6}px)`,
                          opacity: 0.58 + (p.z % 2) * 0.18,
                        }}
                      />
                    ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  {latticeInfo.formula} · {latticeInfo.type}: {latticeInfo.note}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity size={15} className="text-orange-300" />
                  <h4 className="text-sm font-bold text-white">
                    Chemical Reaction Animator
                  </h4>
                </div>
                <div className="flex gap-2 mb-2">
                  <select
                    value={reactionKey}
                    onChange={(e) => {
                      setReactionKey(e.target.value);
                      setReactionStep(0);
                    }}
                    className="input text-xs"
                  >
                    {Object.keys(reactionLibrary).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                  <input
                    type="range"
                    min="0"
                    max={reaction.steps.length - 1}
                    value={reactionStep}
                    onChange={(e) => setReactionStep(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="h-28 relative rounded-xl bg-black/20 border border-white/10 mt-3 overflow-hidden">
                  {reaction.species.map((txt, i) => (
                    <span
                      key={txt}
                      className="absolute px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-xs text-cyan-100 transition-all"
                      style={{
                        left: `${12 + i * 28 + reactionStep * (i === 2 ? 8 : -2)}%`,
                        top: `${25 + Math.abs(2 - reactionStep) * (i + 1) * 4}%`,
                        opacity: reactionStep < 3 && i === 2 ? 0.25 : 1,
                      }}
                    >
                      {txt}
                    </span>
                  ))}
                  <div className="absolute bottom-3 left-4 right-4 h-1 rounded bg-white/10">
                    <div
                      className="h-full rounded bg-orange-400"
                      style={{
                        width: `${(reactionStep / (reaction.steps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {reaction.equation} · {reaction.steps[reactionStep]}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Atom size={15} className="text-violet-300" />
                  <h4 className="text-sm font-bold text-white">
                    Lewis Structure Builder
                  </h4>
                </div>
                <select
                  value={lewisElement}
                  onChange={(e) => setLewisElement(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["C", "N", "O", "F", "Cl", "S", "P"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <div className="relative h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center">
                  <span className="text-4xl font-black text-white">
                    {lewis.symbol}
                  </span>
                  {Array.from({ length: lewisDots }, (_, i) => {
                    const angle = (Math.PI * 2 * i) / Math.max(1, lewisDots);
                    return (
                      <span
                        key={i}
                        className="absolute w-2 h-2 rounded-full bg-cyan-300"
                        style={{
                          transform: `translate(${Math.cos(angle) * 48}px, ${Math.sin(angle) * 48}px)`,
                        }}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {lewisDots} valence dots · needs{" "}
                  {lewisInfo.electronsNeededForOctet} e- for octet ·{" "}
                  {lewisInfo.note}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <GitCompare size={15} className="text-sky-300" />
                  <h4 className="text-sm font-bold text-white">
                    VSEPR Shape Simulator
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <label className="text-[10px] text-gray-500">
                    Bonded atoms
                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={bondedAtoms}
                      onChange={(e) => setBondedAtoms(Number(e.target.value))}
                      className="input text-xs mt-1"
                    />
                  </label>
                  <label className="text-[10px] text-gray-500">
                    Lone pairs
                    <input
                      type="number"
                      min="0"
                      max="3"
                      value={lonePairs}
                      onChange={(e) => setLonePairs(Number(e.target.value))}
                      className="input text-xs mt-1"
                    />
                  </label>
                </div>
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-32 rounded-xl bg-black/20 border border-white/10"
                >
                  {geometry.points.slice(1).map((p, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={p[0]}
                      y2={p[1]}
                      stroke="#38bdf8"
                      strokeWidth="2"
                    />
                  ))}
                  {geometry.points.map((p, i) => (
                    <circle
                      key={i}
                      cx={p[0]}
                      cy={p[1]}
                      r={i === 0 ? 7 : 5}
                      fill={i === 0 ? "#f59e0b" : "#e2e8f0"}
                    />
                  ))}
                </svg>
                <p className="text-xs text-gray-500 mt-2">
                  AX{bondedAtoms}E{lonePairs}: {vsepr.shape}, typical angle{" "}
                  {vsepr.angle}.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Orbit size={15} className="text-pink-300" />
                  <h4 className="text-sm font-bold text-white">
                    Orbital Hybridization Viewer
                  </h4>
                </div>
                <select
                  value={hybrid}
                  onChange={(e) => setHybrid(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["sp", "sp2", "sp3", "dsp2", "sp3d"].map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
                <div className="h-32 rounded-xl bg-black/20 border border-white/10 flex items-center justify-center gap-2">
                  {Array.from(
                    {
                      length:
                        hybrid === "sp"
                          ? 2
                          : hybrid === "sp2"
                            ? 3
                            : hybrid === "sp3"
                              ? 4
                              : 5,
                    },
                    (_, i) => (
                      <span
                        key={i}
                        className="w-10 h-16 rounded-[50%] bg-gradient-to-b from-pink-400 to-indigo-500 opacity-75"
                        style={{
                          transform: `rotate(${i * (180 / (hybrid === "sp" ? 1 : 4))}deg)`,
                        }}
                      />
                    ),
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {hybrid} orbitals explain sigma bonds, pi bonds, and bond
                  angles.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 size={15} className="text-lime-300" />
                  <h4 className="text-sm font-bold text-white">
                    Periodic Trend Playground
                  </h4>
                </div>
                <select
                  value={trendMetric}
                  onChange={(e) => setTrendMetric(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {[
                    "electronegativity",
                    "atomicRadius",
                    "ionizationEnergy",
                  ].map((metric) => (
                    <option key={metric}>{metric}</option>
                  ))}
                </select>
                <svg
                  viewBox="0 0 260 90"
                  className="w-full h-32 rounded-xl bg-black/20 border border-white/10"
                >
                  <polyline
                    fill="none"
                    stroke="#a3e635"
                    strokeWidth="3"
                    points={elements
                      .filter(
                        (e) => e.period === selected.period && e[trendMetric],
                      )
                      .map(
                        (e, i) =>
                          `${12 + i * 22},${82 - Math.min(70, e[trendMetric] / (trendMetric === "atomicRadius" ? 4 : trendMetric === "ionizationEnergy" ? 35 : 0.06))}`,
                      )
                      .join(" ")}
                  />
                </svg>
                <p className="text-xs text-gray-500 mt-2">
                  Animated trend arrows help compare values across period{" "}
                  {selected.period}.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <RadioTower size={15} className="text-red-300" />
                  <h4 className="text-sm font-bold text-white">
                    Isotope and Decay Simulator
                  </h4>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={decayHalfLives}
                  onChange={(e) => setDecayHalfLives(Number(e.target.value))}
                  className="w-full"
                />
                <div className="mt-3">
                  <MiniBar
                    label={`${decayHalfLives} half-lives elapsed`}
                    value={decayRemaining}
                    color="#f87171"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {decayRemaining.toFixed(2)}% parent isotope remains; daughter
                  product grows over time.
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator size={15} className="text-amber-300" />
                  <h4 className="text-sm font-bold text-white">
                    Compound Formula Builder
                  </h4>
                </div>
                <div className="flex gap-2 mb-3">
                  <select
                    value={cation}
                    onChange={(e) => setCation(e.target.value)}
                    className="input text-xs"
                  >
                    {["Na", "K", "Mg", "Ca", "Al", "Zn", "Fe"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={anion}
                    onChange={(e) => setAnion(e.target.value)}
                    className="input text-xs"
                  >
                    {["Cl", "F", "O", "S", "N", "P"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="text-3xl font-black text-white">
                  {compound.formula}
                </div>
                <p className="text-xs text-gray-500 mt-2">{compound.note}</p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={15} className="text-blue-300" />
                  <h4 className="text-sm font-bold text-white">
                    Electrolysis and Redox Lab
                  </h4>
                </div>
                <select
                  value={electrolyte}
                  onChange={(e) => setElectrolyte(e.target.value)}
                  className="input text-xs mb-3"
                >
                  {["CuSO4", "NaCl(aq)", "H2O + acid"].map((e) => (
                    <option key={e}>{e}</option>
                  ))}
                </select>
                <div className="h-32 rounded-xl bg-blue-500/10 border border-blue-400/20 relative overflow-hidden">
                  <div className="absolute left-8 top-4 bottom-4 w-3 bg-slate-300 rounded" />
                  <div className="absolute right-8 top-4 bottom-4 w-3 bg-slate-300 rounded" />
                  {Array.from({ length: 12 }, (_, i) => (
                    <span
                      key={i}
                      className="absolute text-[10px] text-blue-200 animate-pulse"
                      style={{
                        left: `${20 + (i % 6) * 10}%`,
                        top: `${25 + Math.floor(i / 6) * 35}%`,
                      }}
                    >
                      e-
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Cathode: {electrolysis.cathode}
                </p>
                <p className="text-xs text-gray-400">
                  Anode: {electrolysis.anode}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {electrolysis.note}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.035] border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Waves size={15} className="text-fuchsia-300" />
                  <h4 className="text-sm font-bold text-white">
                    pH Titration Simulator
                  </h4>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={titrationMl}
                  onChange={(e) => setTitrationMl(Number(e.target.value))}
                  className="w-full"
                />
                <div className="grid grid-cols-[72px_1fr] gap-3 mt-3">
                  <div className="h-28 rounded-b-3xl rounded-t-lg border border-white/15 flex items-end overflow-hidden bg-white/[0.04]">
                    <div
                      className="w-full transition-all"
                      style={{
                        height: `${30 + titrationMl}%`,
                        background:
                          ph < 4 ? "#ef4444" : ph < 8 ? "#22c55e" : "#a855f7",
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <MiniBar
                      label={`${titrationMl} mL titrant`}
                      value={titrationMl * 2}
                      color="#e879f9"
                    />
                    <MiniBar
                      label={`pH ${ph.toFixed(2)}`}
                      value={(ph / 14) * 100}
                      color={
                        ph < 4 ? "#ef4444" : ph < 8 ? "#22c55e" : "#a855f7"
                      }
                    />
                    <p className="text-xs text-gray-500">
                      0.100 M HCl, 25.00 mL titrated with 0.100 M NaOH:{" "}
                      {titration.region}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          <div className="grid xl:grid-cols-[1.15fr_0.85fr] gap-4">
            <Section icon={RadioTower} title="Element Discovery Timeline">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-72 overflow-y-auto scrollbar-thin pr-1">
                {timeline.map((el) => {
                  const info = getCategoryInfo(el.category);
                  const active = selected.atomicNumber === el.atomicNumber;
                  return (
                    <button
                      key={el.atomicNumber}
                      onClick={() => setSelectedSymbol(el.symbol)}
                      className={`w-full text-left rounded-xl border p-2.5 transition-colors ${
                        active
                          ? "bg-white/[0.09] border-white/25"
                          : "bg-white/[0.03] border-white/10 hover:bg-white/[0.07]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-black border"
                          style={{
                            color: info.color,
                            borderColor: `${info.color}55`,
                            background: `${info.color}16`,
                          }}
                        >
                          {el.symbol}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-gray-200 truncate">
                            {el.name}
                          </span>
                          <span className="block text-[10px] text-gray-500 truncate">
                            {el.discoveredBy}
                          </span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">
                          {el.yearDiscovered}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section icon={BookOpen} title="Element Information Pack">
              <div className="grid sm:grid-cols-2 gap-2 text-xs">
                {[
                  [
                    "Common uses",
                    selected.commonUses?.join(", ") ||
                      "Reference uses unavailable",
                  ],
                  ["Safety", enriched.safety],
                  ["Occurrence", enriched.occurrence],
                  ["Extraction", enriched.extraction],
                  ["Crystal structure", enriched.crystal],
                  [
                    "Formula link",
                    `${selected.symbol} appears in ${selectedMolecules.length} molecule models`,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                  >
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">
                      {label}
                    </p>
                    <p className="text-gray-300 mt-1">
                      {language === "hi" && label === "Safety"
                        ? `सुरक्षा: ${value}`
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Section
              icon={Activity}
              title="Isotope Explorer and Half-Life Chart"
            >
              <div className="space-y-2">
                {isotopes.length > 0 ? (
                  isotopes.map((iso, i) => (
                    <div
                      key={iso.label}
                      className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                    >
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-white">
                          {iso.label}
                        </span>
                        <span className="text-gray-500">{iso.halfLife}</span>
                      </div>
                      <MiniBar
                        label={`${iso.neutrons ?? "unknown"} neutrons · ${iso.abundance}`}
                        value={
                          iso.neutrons ? Math.min(100, iso.neutrons * 2) : 10
                        }
                        color={i === 0 ? cat.color : "#64748b"}
                      />
                      {iso.decay && (
                        <p className="text-[10px] text-gray-500 mt-1">
                          Decay mode: {iso.decay}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-400">
                    No curated isotope records are loaded for {selected.name}.
                    Select H, C, O, Na, Cl, K, Ca, Fe, I, or U to see real
                    isotope data.
                  </div>
                )}
                <p className="text-[10px] text-gray-600">
                  Uses curated stable/radioactive isotope records where
                  available; no synthetic estimates are shown.
                </p>
              </div>
            </Section>

            <Section icon={Orbit} title="Electron Configuration Builder">
              <p className="text-xs text-gray-400 mb-2">
                {selected.electronConfiguration}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {configParts.map((part) => (
                  <span
                    key={part.raw}
                    className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-mono text-gray-200"
                  >
                    {part.raw}
                  </span>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {configParts.slice(-4).map((part) => (
                  <div
                    key={`${part.raw}-boxes`}
                    className="flex items-center gap-2 text-xs"
                  >
                    <span className="w-10 text-gray-500 font-mono">
                      {part.n}
                      {part.orbital}
                    </span>
                    {configToBoxes(part).map((box, i) => (
                      <span
                        key={i}
                        className="w-8 h-7 rounded border border-white/15 bg-white/[0.04] flex items-center justify-center text-cyan-200"
                      >
                        {box}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </Section>

            <Section icon={Zap} title="Bohr Controls and Ion Formation">
              <div className="grid grid-cols-2 gap-2">
                {selected.shells?.map((count, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3 text-center"
                  >
                    <p className="text-lg font-black text-white">{count}</p>
                    <p className="text-[10px] text-gray-500">shell n={i + 1}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Likely ion:{" "}
                {selected.group <= 2
                  ? `+${selected.group}`
                  : selected.group >= 16 && selected.group <= 17
                    ? `${selected.group - 18}`
                    : "variable"}{" "}
                based on group pattern.
              </p>
            </Section>
          </div>

          <div className="grid lg:grid-cols-4 gap-4">
            <Section
              icon={Calculator}
              title="Formula Builder and Molar Mass"
              className="lg:col-span-2"
            >
              <input
                value={formulaInput}
                onChange={(e) => setFormulaInput(e.target.value)}
                className="input text-sm mb-3"
              />
              <div className="grid sm:grid-cols-2 gap-2">
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Atoms
                  </p>
                  <p className="text-sm text-gray-200 font-mono mt-1">
                    {Object.entries(parsed)
                      .map(([s, n]) => `${s}:${n}`)
                      .join("  ") || "None"}
                  </p>
                </div>
                <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    Molar mass
                  </p>
                  <p className="text-xl font-black text-white mt-1">
                    {mass.toFixed(3)} g/mol
                  </p>
                </div>
              </div>
            </Section>

            <Section icon={Boxes} title="Bond Predictor">
              <div className="flex gap-2 mb-2">
                <input
                  value={bondA}
                  onChange={(e) => setBondA(e.target.value)}
                  className="input text-sm"
                />
                <input
                  value={bondB}
                  onChange={(e) => setBondB(e.target.value)}
                  className="input text-sm"
                />
              </div>
              <p className="text-sm font-bold text-white">
                {bondPrediction.type}
              </p>
              <p className="text-xs text-gray-500">{bondPrediction.note}</p>
            </Section>

            <Section icon={FlaskConical} title="Equation Balancer">
              <input
                value={equationInput}
                onChange={(e) => setEquationInput(e.target.value)}
                className="input text-xs mb-2"
              />
              {balanced.ok ? (
                <p className="text-sm font-mono text-gray-200">
                  {balanced.balanced}
                </p>
              ) : (
                <p className="text-sm text-red-300">{balanced.error}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                Balances equations by conserving each element across reactants
                and products.
              </p>
              {false && (
                <>
                  <p className="text-sm font-mono text-gray-200">
                    2H₂ + O₂ → 2H₂O
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Starter balancer with common reaction pattern examples. Full
                    symbolic balancing can be expanded from this panel.
                  </p>
                </>
              )}
            </Section>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Section icon={BarChart3} title="Abundance and Comparison Charts">
              <div className="space-y-2">
                {abundanceRows(selected).map(([label, value]) => (
                  <MiniBar
                    key={label}
                    label={label}
                    value={Math.min(100, value)}
                    color={cat.color}
                  />
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <select
                  value={secondSymbol}
                  onChange={(e) => setSecondSymbol(e.target.value)}
                  className="input text-xs"
                >
                  {elements.map((el) => (
                    <option key={el.symbol} value={el.symbol}>
                      {el.symbol}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-400 self-center">
                  {selected.symbol} vs {second.symbol}: EN{" "}
                  {selected.electronegativity ?? "n/a"} /{" "}
                  {second.electronegativity ?? "n/a"}
                </span>
              </div>
            </Section>

            <Section icon={Activity} title="Trend Graph and Animated Arrows">
              <svg viewBox="0 0 240 90" className="w-full h-28">
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                  points={elements
                    .filter(
                      (e) =>
                        e.period === selected.period && e.electronegativity,
                    )
                    .map(
                      (e, i) =>
                        `${i * 22 + 10},${80 - e.electronegativity * 16}`,
                    )
                    .join(" ")}
                />
                <text x="8" y="86" fontSize="8" fill="#64748b">
                  Period {selected.period} electronegativity
                </text>
              </svg>
              <div className="flex gap-1 text-[10px] text-cyan-300 animate-pulse">
                left → right: radius tends down, electronegativity tends up
              </div>
            </Section>

            <Section
              icon={ShieldAlert}
              title="Lab Safety, VSEPR, Lewis, Valency"
            >
              <div className="space-y-2 text-xs text-gray-300">
                <p>
                  Valency trainer:{" "}
                  {selected.group
                    ? `Group ${selected.group} suggests common valence patterns.`
                    : "f-block variable valency."}
                </p>
                <p>
                  Lewis practice: draw valence dots from outer shell count{" "}
                  {selected.shells?.at(-1) ?? "n/a"}.
                </p>
                <p>
                  VSEPR trainer: count electron domains, then choose linear,
                  trigonal planar, tetrahedral, bent, or pyramidal.
                </p>
                <p>
                  Safety mini lesson: label, ventilate, wear PPE, and check
                  incompatibilities.
                </p>
              </div>
            </Section>
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <Section icon={Trophy} title="Achievements, Classroom, Progress">
              <div className="flex flex-wrap gap-2 mb-3">
                {achievements.map((a) => (
                  <span
                    key={a}
                    className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/20"
                  >
                    {a}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setTeacherMode(!teacherMode)}
                className="btn-secondary text-sm w-full mb-2"
              >
                {teacherMode ? "Teacher mode on" : "Teacher mode off"}
              </button>
              <button
                onClick={saveCurrentFilter}
                className="btn-secondary text-sm w-full"
              >
                Save current study filter
              </button>
              <div className="mt-2 text-[10px] text-gray-500">
                {savedFilters.join(" · ") || "No saved filters yet"}
              </div>
            </Section>

            <Section icon={Download} title="Print, Export, Offline">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-secondary text-xs flex items-center gap-1 justify-center"
                >
                  <Printer size={13} /> Print/PDF
                </button>
                <button
                  onClick={exportJson}
                  className="btn-secondary text-xs flex items-center gap-1 justify-center"
                >
                  <Download size={13} /> Export
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                The app runs from local datasets, can print through the browser,
                exports the selected element pack as JSON, and caches assets
                through the service worker.
              </p>
            </Section>

            <Section icon={Brain} title="Concept Helper">
              <textarea
                value={conceptQuestion}
                onChange={(e) => setConceptQuestion(e.target.value)}
                className="input min-h-20 text-sm"
              />
              <div className="mt-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-3 text-xs text-cyan-100">
                {conceptAnswer}
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Rule-based helper for a small set of built-in chemistry
                explanations.
              </p>
            </Section>
          </div>

          <Section
            icon={BadgeCheck}
            title="Molecule Links, Crystal Lattice, Reactions, Functional Groups"
          >
            <div className="grid md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-2">
                  Molecules containing {selected.symbol}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMolecules.map((m) => (
                    <span
                      key={m.name}
                      className="px-2 py-1 rounded-lg bg-white/[0.05] border border-white/10 text-xs text-gray-300"
                    >
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 27 }, (_, i) => (
                  <span
                    key={i}
                    className="aspect-square rounded-full border border-white/10"
                    style={{
                      background: i % 2 ? cat.color : "#94a3b8",
                      opacity: 0.45 + (i % 3) * 0.15,
                    }}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Reaction path: reactants → activated complex → products.</p>
                <p>
                  Functional group practice: identify alcohol, carbonyl, acid,
                  amine, aromatic, and halide patterns.
                </p>
                <p>
                  Decay chain viewer: radioactive elements show parent →
                  daughter → stable endpoint as a lesson flow.
                </p>
              </div>
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

export default ChemistryLabPage;
