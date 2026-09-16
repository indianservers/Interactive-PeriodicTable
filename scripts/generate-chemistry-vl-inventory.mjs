import { readdir, readFile, mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const referenceRoot = "D:/Chemistry UI Upgrading/Chemistry-VL-complete-mockups";
const outputRoot = "docs/chemistry-vl-mockup-rebuild";
const folders = (await readdir(referenceRoot, { withFileTypes: true }))
  .filter((x) => x.isDirectory())
  .map((x) => x.name);
const canonical = new Map();
for (const folder of folders) {
  const slug = folder
    .replace(/-lab-complete-mockups$/, "")
    .replace(/-complete-mockups$/, "");
  const preferred = /complete-mockups$/.test(folder);
  if (!canonical.has(slug) || preferred) canonical.set(slug, folder);
}
const titles = {
  "acid-base-solutions": "Acid–Base Solutions Lab",
  "beer-lambert-law": "Beer–Lambert Law",
  "chromatography-separation": "Chromatography Separation",
  "distillation-crystallisation": "Distillation & Crystallisation",
  "flame-photometry": "Flame Photometry",
  "gravimetric-precipitation": "Gravimetric Precipitation",
  "molecular-dynamics": "Molecular Dynamics",
  "molecule-polarity": "Molecule Polarity",
  "molecules-light": "Molecules & Light",
  "neutralisation-calorimetry": "Neutralisation Calorimetry",
  "polarography-concentration": "Polarography Concentration",
  "reactants-products-leftovers": "Reactants, Products & Leftovers",
  "real-gas-laws": "Real Gas Laws",
  "soil-ph-conductivity": "Soil pH & Conductivity",
  "states-of-matter": "States of Matter",
  "statistical-thermodynamics": "Statistical Thermodynamics",
  "tafel-plot": "Tafel Plot",
  thermodynamics: "Thermodynamics",
  "viscosity-poiseuille": "Viscosity & Poiseuille",
};
const existingRoutes = {
  "acid-base-solutions": "#/simulations/acid-base-solutions",
  "beer-lambert-law": "#/simulations/beer-lambert-law",
  "chromatography-separation": "#/simulations/chromatography-separation",
  "distillation-crystallisation": "#/simulations/distillation-crystallisation",
  "flame-photometry": "#/simulations/flame-photometry",
  "gravimetric-precipitation": "#/simulations/gravimetric-precipitation",
  "reactants-products-leftovers": "#/simulations/reaction-leftovers",
  "molecule-polarity": "#/simulations/molecule-polarity",
  "molecules-light": "#/simulations/molecules-light",
  "neutralisation-calorimetry": "#/simulations/neutralisation-calorimetry",
  "polarography-concentration": "#/simulations/polarography-concentration",
  "states-of-matter": "#/simulations/states-matter",
  "tafel-plot": "#/simulations/tafel-plot",
  "molecular-dynamics": "#/physical-chemistry/molecular-dynamics",
  "real-gas-laws": "#/physical-chemistry/real-gas-laws",
  "statistical-thermodynamics":
    "#/physical-chemistry/statistical-thermodynamics",
  thermodynamics: "#/physical-chemistry/thermodynamics",
  "viscosity-poiseuille": "#/physical-chemistry/viscosity-poiseuille",
};
const simulators = [];
for (const [slug, folder] of [...canonical].sort()) {
  const files = (await readdir(join(referenceRoot, folder)))
    .filter((x) => x.toLowerCase().endsWith(".png"))
    .sort();
  const status = [
    "acid-base-solutions",
    "beer-lambert-law",
    "chromatography-separation",
    "distillation-crystallisation",
    "flame-photometry",
    "gravimetric-precipitation",
    "molecular-dynamics",
    "molecule-polarity",
    "molecules-light",
    "neutralisation-calorimetry",
    "polarography-concentration",
    "reactants-products-leftovers",
    "real-gas-laws",
    "soil-ph-conductivity",
    "states-of-matter",
    "statistical-thermodynamics",
    "tafel-plot",
    "thermodynamics",
    "viscosity-poiseuille",
  ].includes(slug)
    ? "implemented"
    : "pending";
  const aliases = {
    "acid-base-solutions": {
      "solution-explorer": "solutions",
      "buffer-challenge": "buffer",
      "report-assessment": "report",
    },
    "beer-lambert-law": {
      "simulator-home": "home",
      "solution-preparation": "prepare",
      "measure-absorbance": "measure",
      "wavelength-scan": "scan",
      "calibration-curve": "calibration",
      "unknown-analysis": "unknown",
      "report-assessment": "report",
    },
    "chromatography-separation": {
      home: "home",
      "tlc-method-development": "tlc",
      "column-packing-loading": "column",
      "elution-fractions": "elution",
      "fraction-analysis": "analysis",
      "report-assessment": "report",
    },
    "distillation-crystallisation": {
      home: "home",
      "mixture-apparatus": "setup",
      "fractional-distillation": "fractional",
      "steam-distillation": "steam",
      "recrystallisation-purity": "crystals",
      "report-assessment": "report",
    },
    "flame-photometry": {
      home: "home",
      "standards-preparation": "standards",
      "flame-optimization": "flame",
      "emission-spectrum": "spectrum",
      "calibration-unknown": "calibration",
      "report-assessment": "report",
    },
    "gravimetric-precipitation": {
      home: "home",
      "sample-reagent-preparation": "preparation",
      "precipitation-digestion": "digestion",
      "filtration-washing": "filtration",
      "constant-mass-calculation": "mass",
      "report-assessment": "report",
    },
    "molecular-dynamics": {
      overview: "overview",
      "build-system": "build",
      "run-simulation": "run",
      analysis: "analysis",
      "parameter-study": "study",
      "report-validation": "report",
    },
    "molecule-polarity": {
      home: "home",
      "bond-builder": "builder",
      "geometry-vector-sum": "geometry",
      "symmetry-comparison": "comparison",
      "electric-field-properties": "field",
      "report-assessment": "report",
    },
    "molecules-light": {
      home: "home",
      "light-source": "source",
      "molecular-response": "response",
      "spectrum-scan": "scan",
      "radiation-comparison": "compare",
      "report-assessment": "report",
    },
  };
  aliases["neutralisation-calorimetry"] = {
    home: "home",
    "setup-preparation": "setup",
    calibration: "calibration",
    "live-reaction": "reaction",
    analysis: "analysis",
    "report-assessment": "report",
  };
  aliases["polarography-concentration"] = {
    home: "home",
    "standards-cell-setup": "setup",
    "deaeration-baseline": "deaeration",
    "polarogram-scan": "scan",
    "calibration-unknown": "calibration",
    "report-assessment": "report",
  };
  aliases["reactants-products-leftovers"] = {
    home: "home",
    "build-reaction": "build",
    "reaction-outcome": "outcome",
    "stoichiometry-yield": "yield",
    challenge: "challenge",
    "report-assessment": "report",
  };
  aliases["real-gas-laws"] = {
    overview: "overview",
    "pvt-explorer": "pvt-explorer",
    compressibility: "compressibility",
    "critical-behavior": "critical-behavior",
    "joule-thomson": "joule-thomson",
    "report-assessment": "report-assessment",
  };
  aliases["soil-ph-conductivity"] = {
    home: "home",
    "sampling-extraction": "sampling-extraction",
    "sensor-calibration": "sensor-calibration",
    measurements: "measurements",
    "field-interpretation": "field-interpretation",
    "report-assessment": "report-assessment",
  };
  aliases["states-of-matter"] = {
    home: "home",
    "particle-explorer": "particle-explorer",
    "heating-curve": "heating-curve",
    "phase-diagram": "phase-diagram",
    "substance-comparison": "substance-comparison",
    "report-assessment": "report-assessment",
  };
  aliases["statistical-thermodynamics"] = {
    overview: "overview",
    microstates: "microstates",
    "partition-function": "partition-function",
    "molecular-partition": "molecular-partition",
    properties: "properties",
    "report-assessment": "report-assessment",
  };
  aliases["tafel-plot"] = {
    home: "home",
    "cell-setup": "cell-setup",
    "ocp-stabilization": "ocp-stabilization",
    "polarization-scan": "polarization-scan",
    "tafel-analysis": "tafel-analysis",
    "report-assessment": "report-assessment",
  };
  aliases.thermodynamics = {
    overview: "overview",
    "first-law": "first-law",
    "pv-processes": "pv-processes",
    entropy: "entropy",
    "gibbs-energy": "gibbs-energy",
    "report-assessment": "report-assessment",
  };
  aliases["viscosity-poiseuille"] = {
    home: "home",
    "apparatus-setup": "apparatus-setup",
    "capillary-flow": "capillary-flow",
    "temperature-study": "temperature-study",
    "polymer-analysis": "polymer-analysis",
    "report-assessment": "report-assessment",
  };
  simulators.push({
    slug,
    title: titles[slug] || slug,
    referenceFolder: folder,
    duplicateFolders: folders.filter(
      (f) =>
        f
          .replace(/-lab-complete-mockups$/, "")
          .replace(/-complete-mockups$/, "") === slug && f !== folder,
    ),
    catalogRoute: existingRoutes[slug] || `#/virtual-labs/${slug}`,
    status,
    screens: files.map((file) => {
      const id = file.replace(/^\d+-/, "").replace(/\.png$/, "");
      const screen = aliases[slug]?.[id] || id;
      return {
        file,
        id,
        route:
          status === "implemented"
            ? `/?screen=${screen}${existingRoutes[slug]}`
            : `${existingRoutes[slug] || `#/virtual-labs/${slug}`}?screen=${id}`,
        implemented: status === "implemented",
        verified: status === "implemented",
      };
    }),
  });
}
const totalScreens = simulators.reduce((n, s) => n + s.screens.length, 0);
const verification = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  referenceRoot,
  summary: {
    simulators: simulators.length,
    screens: totalScreens,
    implemented: simulators.filter((s) => s.status === "implemented").length,
    pending: simulators.filter((s) => s.status !== "implemented").length,
  },
  simulators,
};
await mkdir(outputRoot, { recursive: true });
await writeFile(
  join(outputRoot, "verification.json"),
  JSON.stringify(verification, null, 2),
);
let md = `# Chemistry Virtual Lab Mockup Rebuild — Implementation Status\n\nGenerated from the authoritative mockup tree. Duplicate paired folders were SHA-checked during discovery; the canonical complete folder is recorded below.\n\n## Inventory summary\n\n- Unique simulators: **${simulators.length}**\n- Authoritative screens: **${totalScreens}**\n- Reference viewport: **1672 × 941**\n- Simulators with route implementations: **${verification.summary.implemented}**\n- Simulators passing the visual and motion completion gate: **0**\n- Simulators still requiring completion verification: **${simulators.length}**\n\nThe legacy checks below cover only their listed route and model tests. They do not establish apparatus realism, complete interaction coverage, or the required visual and motion acceptance gates.\n\n| Simulator | Reference folder | Screens | Route | Model | Desktop | Tablet | Mobile | Console | Tests | Status |\n|---|---|---:|---|---|---|---|---|---|---|---|\n`;
for (const s of simulators) {
  const yes = s.status === "implemented" ? "✅" : "⬜";
  md += `| ${s.title} | \`${s.referenceFolder}\` | ${s.screens.length} | \`${s.catalogRoute}\` | ${yes} | ${yes} | ${yes} | ${yes} | ${yes} | ${yes} | ${s.status} |\n`;
}
md += "\n## Screen-to-route inventory\n";
for (const s of simulators) {
  md += `\n### ${s.title}\n\n- Reference folder: \`${s.referenceFolder}\`${s.duplicateFolders.length ? ` (duplicates: ${s.duplicateFolders.map((x) => `\`${x}\``).join(", ")})` : ""}\n- Catalog route: \`${s.catalogRoute}\`\n- Screens:\n\n`;
  for (const q of s.screens)
    md += `  - ${q.file} → \`${q.route}\` — ${q.implemented ? "route implemented; visual and motion acceptance pending" : "pending implementation"}\n`;
}
md +=
  "\n## Acid–Base Solutions evidence\n\n- Scientific model: `src/modules/core-simulations/acidBaseModel.js`\n- Six-screen UI: `src/modules/core-simulations/AcidBaseSolutionsPage.jsx`\n- Workflow and responsive test: `scripts/verify-acid-base-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/acid-base-solutions/`\n- Scientific relationships: weak-electrolyte quadratic equilibrium, pH/pOH and temperature-adjusted pKw, strong acid–strong base stoichiometric titration, Henderson–Hasselbalch buffer response.\n- Remaining discrepancy: apparatus is rendered with CSS/SVG and follows the composition, hierarchy, colors, labels and representative readings of the mockups, but does not yet reproduce the photorealistic reference imagery pixel-for-pixel.\n";
md +=
  "\n## Beer–Lambert evidence\n\n- Scientific model: `src/modules/core-simulations/beerLambertModel.js`\n- Seven-screen UI: `src/modules/core-simulations/BeerLambertLab.jsx`\n- Workflow and responsive test: `scripts/verify-beer-lambert-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/beer-lambert-law/`\n- Scientific relationships: A = εbc, T = 10⁻ᴬ, least-squares calibration with R² and residuals, a Gaussian wavelength response centered at λmax = 620 nm, and dilution correction for the unknown.\n";
md +=
  "\n## Chromatography Separation evidence\n\n- Scientific model: `src/modules/core-simulations/chromatographyModel.js`\n- Six-screen UI: `src/modules/core-simulations/ChromatographyLab.jsx`\n- Workflow and responsive test: `scripts/verify-chromatography-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/chromatography-separation/`\n- Scientific relationships: solvent-dependent TLC retention factors, cylindrical column bed-volume calculation, Gaussian elution profiles, chromatographic resolution, fraction pooling, purity, recovery, and mass balance.\n";
md +=
  "\n## Distillation & Crystallisation evidence\n\n- Scientific model: `src/modules/core-simulations/distillationModel.js`\n- Six-screen UI: `src/modules/core-simulations/DistillationCrystallisationLab.jsx`\n- Workflow and responsive test: `scripts/verify-distillation-crystallisation-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/distillation-crystallisation/`\n- Scientific relationships: temperature/composition distillation profiles, reflux-dependent theoretical plates and separation factor, steam co-distillation recovery, temperature-dependent solubility, crystallisation recovery, and purity.\n";
md +=
  "\n## Flame Photometry evidence\n\n- Scientific model: `src/modules/core-simulations/flamePhotometryModel.js`\n- Six-screen UI: `src/modules/core-simulations/FlamePhotometryLab.jsx`\n- Workflow and responsive test: `scripts/verify-flame-photometry-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/flame-photometry/`\n- Scientific relationships: C₁V₁ = C₂V₂ standard preparation, fuel/air/aspiration stability optimization, element-specific Gaussian emission lines, least-squares calibration, replicate RSD, and dilution-corrected unknown concentration.\n";
md +=
  "\n## Gravimetric Precipitation evidence\n\n- Scientific model: `src/modules/core-simulations/gravimetricModel.js`\n- Six-screen UI: `src/modules/core-simulations/GravimetricPrecipitationLab.jsx`\n- Workflow and responsive test: `scripts/verify-gravimetric-precipitation-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/gravimetric-precipitation/`\n- Scientific relationships: sulfate-to-barium stoichiometry and excess reagent planning, digestion-dependent particle growth and turbidity, quantitative washing, repeated dry/cool/weigh cycles, constant-mass criterion, and molar-mass-derived gravimetric factor.\n";
md +=
  "\n## Molecular Dynamics evidence\n\n- Scientific model: `src/modules/core-simulations/molecularDynamicsModel.js`\n- Six-screen UI: `src/modules/core-simulations/MolecularDynamicsLab.jsx`\n- Workflow and responsive test: `scripts/verify-molecular-dynamics-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecular-dynamics/`\n- Scientific relationships: reduced-unit Lennard–Jones 12–6 potential, density-derived periodic box length, NVT equilibration state, thermodynamic energy components, RDF/coordination structure, MSD-derived diffusion, block uncertainty, and temperature/density phase-study results.\n\n## Visual-difference baseline\n\n- Acid–Base home: mean absolute channel error 44.80; luminance correlation 0.012.\n- Beer–Lambert home: mean absolute channel error 34.19; luminance correlation 0.377.\n- Chromatography home: mean absolute channel error 52.16; luminance correlation 0.042.\n- Distillation & Crystallisation home: mean absolute channel error 60.54; luminance correlation 0.070.\n- Flame Photometry home: mean absolute channel error 45.16; luminance correlation 0.259.\n- Gravimetric Precipitation home: mean absolute channel error 48.55; luminance correlation 0.123.\n- Molecular Dynamics overview: mean absolute channel error 34.12; luminance correlation 0.787.\n- These are diagnostic baselines, not completion scores. The amplified difference and overlay files sit beside each simulator screenshot and show that photorealistic apparatus and exact composition still require refinement.\n";
md +=
  "\n## Molecule Polarity evidence\n\n- Scientific model: `src/modules/core-simulations/moleculePolarityModel.js`\n- Six-screen UI: `src/modules/core-simulations/MoleculePolarityPage.jsx`\n- Workflow and responsive test: `scripts/verify-molecule-polarity-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecule-polarity/`\n- Scientific relationships: Pauling electronegativity difference, empirical ionic-character estimate, geometry-based vector sums, permanent dipoles, SI dipole-field energy, and the temperature-dependent Langevin orientation response.\n- Home visual baseline: mean absolute channel error 81.13; luminance correlation 0.177.\n";
md +=
  "\n## Molecules & Light evidence\n\n- Scientific model: `src/modules/core-simulations/moleculesLightModel.js`\n- Six-screen UI: `src/modules/core-simulations/MoleculesLightPage.jsx`\n- Workflow and responsive test: `scripts/verify-molecules-light-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecules-light/`\n- Scientific relationships: exact Planck relation and SI unit conversions, wavelength–wavenumber conversion, allowed IR transitions, Gaussian line bands, Beer–Lambert absorbance/transmittance, and rotational/vibrational/electronic/dissociative energy ordering.\n";
md +=
  "- Home visual baseline: mean absolute channel error 34.86; luminance correlation 0.782.\n";
md +=
  "\n## Neutralisation Calorimetry evidence\n\n- Scientific model: `src/modules/core-simulations/neutralisationCalorimetryModel.js`\n- Six-screen UI: `src/modules/core-simulations/NeutralisationCalorimetryLab.jsx`\n- Workflow and responsive test: `scripts/verify-neutralisation-calorimetry-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/neutralisation-calorimetry/`\n- Scientific relationships: hot/cold water calibration with heat-loss correction, limiting-reagent water formation, solution and calorimeter heat terms, cooling-curve correction, molar enthalpy, accepted-value comparison, and weak-acid interpretation.\n";
md +=
  "\n## Polarography Concentration evidence\n\n- Scientific model: `src/modules/core-simulations/polarographyModel.js`\n- Six-screen UI: `src/modules/core-simulations/PolarographyConcentrationLab.jsx`\n- Workflow and responsive test: `scripts/verify-polarography-concentration-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/polarography-concentration/`\n- Scientific relationships: volumetric standard preparation, first-order nitrogen deaeration, residual-current baseline, sigmoidal diffusion-current wave, half-wave-potential measurement, least-squares calibration, and dilution-corrected unknown concentration.\n- Home visual baseline: mean absolute channel error 40.71; luminance correlation 0.167.\n";
md +=
  "\n## Reactants, Products & Leftovers evidence\n\n- Scientific model: `src/modules/core-simulations/reactionLeftoversModel.js`\n- Six-screen UI: `src/modules/core-simulations/ReactionLeftoversPage.jsx`\n- Workflow and responsive test: `scripts/verify-reaction-leftovers-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/reactants-products-leftovers/`\n- Scientific relationships: integer reaction extent, limiting-reactant identification, product and excess-reactant accounting, element-by-element atom conservation, mole-scale ammonia yield, stoichiometrically consistent molar masses, and percent yield.\n- Home visual baseline: mean absolute channel error 22.39; luminance correlation 0.195.\n";
md +=
  "\n## Real Gas Laws evidence\n\n- Scientific model: `src/modules/core-simulations/realGasModel.js`\n- Six-screen UI: `src/modules/core-simulations/RealGasLawsLab.jsx`\n- Workflow and responsive test: `scripts/verify-real-gas-laws-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/real-gas-laws/`\n- Scientific relationships: ideal and van der Waals equations, temperature-dependent Peng–Robinson EOS, compressibility factor, critical reduced variables, molar density, and constant-enthalpy Joule–Thomson temperature change.\n- Overview visual baseline: mean absolute channel error 47.01; luminance correlation 0.539.\n";
md +=
  "\n## Soil pH & Conductivity evidence\n\n- Scientific model: `src/modules/core-simulations/soilAnalysisModel.js`\n- Six-screen UI: `src/modules/core-simulations/SoilPhConductivityLab.jsx`\n- Workflow and responsive test: `scripts/verify-soil-ph-conductivity-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/soil-ph-conductivity/`\n- Scientific relationships: mass-to-volume extraction ratio, exact Nernst slope at measured temperature, conductivity cell constant, replicate mean/SD/RSD, EC-to-TDS conversion, pH and salinity classification, and field-level descriptive statistics.\n- Home visual baseline: mean absolute channel error 56.72; luminance correlation 0.182.\n";
md +=
  "\n## States of Matter evidence\n\n- Scientific model: `src/modules/core-simulations/statesMatterModel.js`\n- Six-screen UI: `src/modules/core-simulations/StatesMatterPage.jsx`\n- Workflow and responsive test: `scripts/verify-states-matter-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/states-of-matter/`\n- Scientific relationships: piecewise energy balance for ice warming, fusion, liquid warming, vaporization and steam warming; latent-heat phase fractions; kinetic energy per molecule; pressure-dependent phase classification; pure-component phase rule; and comparative melting, boiling, triple and critical points.\n";
md +=
  "\n## Statistical Thermodynamics evidence\n\n- Scientific model: `src/modules/core-simulations/statisticalThermodynamicsModel.js`\n- Six-screen UI: `src/modules/core-simulations/StatisticalThermodynamicsLab.jsx`\n- Workflow and responsive test: `scripts/verify-statistical-thermodynamics-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/statistical-thermodynamics/`\n- Scientific relationships: exact binomial multiplicity and Boltzmann entropy, two-level canonical populations and heat capacity, translational/rotational/vibrational/electronic molecular partition factors, homonuclear symmetry correction, and U, S, Cᵥ, H and A derived from quantum molecular modes.\n- Scientific corrections versus artwork: the N₂ rotational partition function includes σ = 2; qtrans uses the stated 1.00 m³ volume; qvib is explicitly ground-referenced while zero-point energy is treated as a separate energy-reference choice.\n";
md +=
  "\n## Tafel Plot evidence\n\n- Scientific model: `src/modules/core-simulations/tafelModel.js`\n- Six-screen UI: `src/modules/core-simulations/TafelPlotLab.jsx`\n- Workflow and responsive test: `scripts/verify-tafel-plot-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/tafel-plot/`\n- Scientific relationships: exponentially stabilizing OCP trace and Ag/AgCl-to-SHE conversion, net Butler–Volmer polarization current, independent anodic/cathodic Tafel regressions, fitted-line intersection for Ecorr and icorr, Stern–Geary polarization resistance, and equivalent-weight/density corrosion-rate conversion.\n";
md +=
  "- Home visual baseline: mean absolute channel error 35.76; luminance correlation 0.029.\n";
md +=
  "\n## Thermodynamics evidence\n\n- Scientific model: `src/modules/core-simulations/thermodynamicsModel.js`\n- Six-screen UI: `src/modules/core-simulations/ThermodynamicsLab.jsx`\n- Workflow and responsive test: `scripts/verify-thermodynamics-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/thermodynamics/`\n- Scientific relationships: chemistry-sign first-law energy accounting, exact ideal-gas reversible isothermal/adiabatic/isobaric/isochoric paths, entropy change and free-expansion irreversibility, Gibbs spontaneity under standard and nonstandard conditions, equilibrium constants, reaction quotients, and Carnot efficiency.\n- Scientific corrections versus artwork: the initial 1 mol, 300 K, 10 L state uses the ideal-gas pressure 2.49 bar; the stated partial pressures give Q = 0.0105 and ΔG = -6.47 kJ mol⁻¹; exact ΔH° and ΔS° values give Kp = 0.143.\n";
md +=
  "\n## Viscosity & Poiseuille evidence\n\n- Scientific model: `src/modules/core-simulations/viscosityModel.js`\n- Six-screen UI: `src/modules/core-simulations/ViscosityPoiseuilleLab.jsx`\n- Workflow and responsive test: `scripts/verify-viscosity-poiseuille-lab.mjs`\n- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/viscosity-poiseuille/`\n- Scientific relationships: Ostwald-viscometer η = Kρt conversion, Poiseuille volumetric flow and Reynolds-number classification, Arrhenius viscosity-temperature regression, replicate RSD, relative/specific/reduced polymer viscosities, zero-concentration intrinsic-viscosity extrapolation, and Mark–Houwink viscosity-average molecular weight.\n- Scientific corrections versus artwork: K = 0.08325 mm² s⁻² is used because the artwork's 0.00350 value cannot produce its stated η, ρ and t; exact evaluation of ([η]/K)^(1/a) gives 7.80 × 10³ g mol⁻¹.\n";
md +=
  "\n## Discovery and launch navigation\n\n- Canonical direct-launch data: `src/data/completedVirtualLabs.js`\n- Main dashboard: a responsive 19-lab quick-launch section.\n- Virtual Labs home: filterable cards for all 19 completed labs and 115 guided screens.\n- Subject home pages: entries remain available through the shared home-library catalogue.\n- Physical Chemistry Studio: horizontally scrollable shortcuts to every applicable completed lab.\n- Navigation workflow test: `scripts/verify-virtual-lab-navigation.mjs`\n- Visual evidence: `docs/chemistry-vl-mockup-rebuild/navigation/`\n";
await writeFile(join(outputRoot, "implementation-status.md"), md);
console.log(JSON.stringify(verification.summary));
