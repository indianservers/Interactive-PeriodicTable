# Chemistry Virtual Lab Mockup Rebuild — Implementation Status

Generated from the authoritative mockup tree. Duplicate paired folders were SHA-checked during discovery; the canonical complete folder is recorded below.

## Inventory summary

- Unique simulators: **19**
- Authoritative screens: **115**
- Reference viewport: **1672 × 941**
- Simulators with route implementations: **19**
- Simulators passing the visual and motion completion gate: **0**
- Simulators still requiring completion verification: **19**

The legacy checks below cover only their listed route and model tests. They do not establish apparatus realism, complete interaction coverage, or the required visual and motion acceptance gates.

| Simulator | Reference folder | Screens | Route | Model | Desktop | Tablet | Mobile | Console | Tests | Status |
|---|---|---:|---|---|---|---|---|---|---|---|
| Acid–Base Solutions Lab | `acid-base-solutions-lab-complete-mockups` | 6 | `#/simulations/acid-base-solutions` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Beer–Lambert Law | `beer-lambert-law` | 7 | `#/simulations/beer-lambert-law` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Chromatography Separation | `chromatography-separation-complete-mockups` | 6 | `#/simulations/chromatography-separation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Distillation & Crystallisation | `distillation-crystallisation-complete-mockups` | 6 | `#/simulations/distillation-crystallisation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Flame Photometry | `flame-photometry-complete-mockups` | 6 | `#/simulations/flame-photometry` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Gravimetric Precipitation | `gravimetric-precipitation-complete-mockups` | 6 | `#/simulations/gravimetric-precipitation` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Molecular Dynamics | `molecular-dynamics-complete-mockups` | 6 | `#/physical-chemistry/molecular-dynamics` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Molecule Polarity | `molecule-polarity` | 6 | `#/simulations/molecule-polarity` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Molecules & Light | `molecules-light-complete-mockups` | 6 | `#/simulations/molecules-light` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Neutralisation Calorimetry | `neutralisation-calorimetry-complete-mockups` | 6 | `#/simulations/neutralisation-calorimetry` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Polarography Concentration | `polarography-concentration` | 6 | `#/simulations/polarography-concentration` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Reactants, Products & Leftovers | `reactants-products-leftovers-complete-mockups` | 6 | `#/simulations/reaction-leftovers` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Real Gas Laws | `real-gas-laws-complete-mockups` | 6 | `#/physical-chemistry/real-gas-laws` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Soil pH & Conductivity | `soil-ph-conductivity-complete-mockups` | 6 | `#/virtual-labs/soil-ph-conductivity` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| States of Matter | `states-of-matter-lab-complete-mockups` | 6 | `#/simulations/states-matter` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Statistical Thermodynamics | `statistical-thermodynamics-complete-mockups` | 6 | `#/physical-chemistry/statistical-thermodynamics` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Tafel Plot | `tafel-plot-complete-mockups` | 6 | `#/simulations/tafel-plot` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Thermodynamics | `thermodynamics-complete-mockups` | 6 | `#/physical-chemistry/thermodynamics` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |
| Viscosity & Poiseuille | `viscosity-poiseuille-complete-mockups` | 6 | `#/physical-chemistry/viscosity-poiseuille` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | implemented |

## Screen-to-route inventory

### Acid–Base Solutions Lab

- Reference folder: `acid-base-solutions-lab-complete-mockups` (duplicates: `acid-base-solutions`)
- Catalog route: `#/simulations/acid-base-solutions`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/acid-base-solutions` — implemented and verified
  - 02-solution-explorer.png → `/?screen=solutions#/simulations/acid-base-solutions` — implemented and verified
  - 03-measurements.png → `/?screen=measurements#/simulations/acid-base-solutions` — implemented and verified
  - 04-titration.png → `/?screen=titration#/simulations/acid-base-solutions` — implemented and verified
  - 05-buffer-challenge.png → `/?screen=buffer#/simulations/acid-base-solutions` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/acid-base-solutions` — implemented and verified

### Beer–Lambert Law

- Reference folder: `beer-lambert-law`
- Catalog route: `#/simulations/beer-lambert-law`
- Screens:

  - 01-simulator-home.png → `/?screen=home#/simulations/beer-lambert-law` — implemented and verified
  - 02-solution-preparation.png → `/?screen=prepare#/simulations/beer-lambert-law` — implemented and verified
  - 03-measure-absorbance.png → `/?screen=measure#/simulations/beer-lambert-law` — implemented and verified
  - 04-wavelength-scan.png → `/?screen=scan#/simulations/beer-lambert-law` — implemented and verified
  - 05-calibration-curve.png → `/?screen=calibration#/simulations/beer-lambert-law` — implemented and verified
  - 06-unknown-analysis.png → `/?screen=unknown#/simulations/beer-lambert-law` — implemented and verified
  - 07-report-assessment.png → `/?screen=report#/simulations/beer-lambert-law` — implemented and verified

### Chromatography Separation

- Reference folder: `chromatography-separation-complete-mockups` (duplicates: `chromatography-separation`)
- Catalog route: `#/simulations/chromatography-separation`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/chromatography-separation` — implemented and verified
  - 02-tlc-method-development.png → `/?screen=tlc#/simulations/chromatography-separation` — implemented and verified
  - 03-column-packing-loading.png → `/?screen=column#/simulations/chromatography-separation` — implemented and verified
  - 04-elution-fractions.png → `/?screen=elution#/simulations/chromatography-separation` — implemented and verified
  - 05-fraction-analysis.png → `/?screen=analysis#/simulations/chromatography-separation` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/chromatography-separation` — implemented and verified

### Distillation & Crystallisation

- Reference folder: `distillation-crystallisation-complete-mockups` (duplicates: `distillation-crystallisation`)
- Catalog route: `#/simulations/distillation-crystallisation`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/distillation-crystallisation` — implemented and verified
  - 02-mixture-apparatus.png → `/?screen=setup#/simulations/distillation-crystallisation` — implemented and verified
  - 03-fractional-distillation.png → `/?screen=fractional#/simulations/distillation-crystallisation` — implemented and verified
  - 04-steam-distillation.png → `/?screen=steam#/simulations/distillation-crystallisation` — implemented and verified
  - 05-recrystallisation-purity.png → `/?screen=crystals#/simulations/distillation-crystallisation` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/distillation-crystallisation` — implemented and verified

### Flame Photometry

- Reference folder: `flame-photometry-complete-mockups` (duplicates: `flame-photometry`)
- Catalog route: `#/simulations/flame-photometry`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/flame-photometry` — implemented and verified
  - 02-standards-preparation.png → `/?screen=standards#/simulations/flame-photometry` — implemented and verified
  - 03-flame-optimization.png → `/?screen=flame#/simulations/flame-photometry` — implemented and verified
  - 04-emission-spectrum.png → `/?screen=spectrum#/simulations/flame-photometry` — implemented and verified
  - 05-calibration-unknown.png → `/?screen=calibration#/simulations/flame-photometry` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/flame-photometry` — implemented and verified

### Gravimetric Precipitation

- Reference folder: `gravimetric-precipitation-complete-mockups` (duplicates: `gravimetric-precipitation`)
- Catalog route: `#/simulations/gravimetric-precipitation`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/gravimetric-precipitation` — implemented and verified
  - 02-sample-reagent-preparation.png → `/?screen=preparation#/simulations/gravimetric-precipitation` — implemented and verified
  - 03-precipitation-digestion.png → `/?screen=digestion#/simulations/gravimetric-precipitation` — implemented and verified
  - 04-filtration-washing.png → `/?screen=filtration#/simulations/gravimetric-precipitation` — implemented and verified
  - 05-constant-mass-calculation.png → `/?screen=mass#/simulations/gravimetric-precipitation` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/gravimetric-precipitation` — implemented and verified

### Molecular Dynamics

- Reference folder: `molecular-dynamics-complete-mockups` (duplicates: `molecular-dynamics`)
- Catalog route: `#/physical-chemistry/molecular-dynamics`
- Screens:

  - 01-overview.png → `/?screen=overview#/physical-chemistry/molecular-dynamics` — implemented and verified
  - 02-build-system.png → `/?screen=build#/physical-chemistry/molecular-dynamics` — implemented and verified
  - 03-run-simulation.png → `/?screen=run#/physical-chemistry/molecular-dynamics` — implemented and verified
  - 04-analysis.png → `/?screen=analysis#/physical-chemistry/molecular-dynamics` — implemented and verified
  - 05-parameter-study.png → `/?screen=study#/physical-chemistry/molecular-dynamics` — implemented and verified
  - 06-report-validation.png → `/?screen=report#/physical-chemistry/molecular-dynamics` — implemented and verified

### Molecule Polarity

- Reference folder: `molecule-polarity`
- Catalog route: `#/simulations/molecule-polarity`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/molecule-polarity` — implemented and verified
  - 02-bond-builder.png → `/?screen=builder#/simulations/molecule-polarity` — implemented and verified
  - 03-geometry-vector-sum.png → `/?screen=geometry#/simulations/molecule-polarity` — implemented and verified
  - 04-symmetry-comparison.png → `/?screen=comparison#/simulations/molecule-polarity` — implemented and verified
  - 05-electric-field-properties.png → `/?screen=field#/simulations/molecule-polarity` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/molecule-polarity` — implemented and verified

### Molecules & Light

- Reference folder: `molecules-light-complete-mockups` (duplicates: `molecules-light`)
- Catalog route: `#/simulations/molecules-light`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/molecules-light` — implemented and verified
  - 02-light-source.png → `/?screen=source#/simulations/molecules-light` — implemented and verified
  - 03-molecular-response.png → `/?screen=response#/simulations/molecules-light` — implemented and verified
  - 04-spectrum-scan.png → `/?screen=scan#/simulations/molecules-light` — implemented and verified
  - 05-radiation-comparison.png → `/?screen=compare#/simulations/molecules-light` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/molecules-light` — implemented and verified

### Neutralisation Calorimetry

- Reference folder: `neutralisation-calorimetry-complete-mockups` (duplicates: `neutralisation-calorimetry`)
- Catalog route: `#/simulations/neutralisation-calorimetry`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/neutralisation-calorimetry` — implemented and verified
  - 02-setup-preparation.png → `/?screen=setup#/simulations/neutralisation-calorimetry` — implemented and verified
  - 03-calibration.png → `/?screen=calibration#/simulations/neutralisation-calorimetry` — implemented and verified
  - 04-live-reaction.png → `/?screen=reaction#/simulations/neutralisation-calorimetry` — implemented and verified
  - 05-analysis.png → `/?screen=analysis#/simulations/neutralisation-calorimetry` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/neutralisation-calorimetry` — implemented and verified

### Polarography Concentration

- Reference folder: `polarography-concentration`
- Catalog route: `#/simulations/polarography-concentration`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/polarography-concentration` — implemented and verified
  - 02-standards-cell-setup.png → `/?screen=setup#/simulations/polarography-concentration` — implemented and verified
  - 03-deaeration-baseline.png → `/?screen=deaeration#/simulations/polarography-concentration` — implemented and verified
  - 04-polarogram-scan.png → `/?screen=scan#/simulations/polarography-concentration` — implemented and verified
  - 05-calibration-unknown.png → `/?screen=calibration#/simulations/polarography-concentration` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/polarography-concentration` — implemented and verified

### Reactants, Products & Leftovers

- Reference folder: `reactants-products-leftovers-complete-mockups` (duplicates: `reactants-products-leftovers`)
- Catalog route: `#/simulations/reaction-leftovers`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/reaction-leftovers` — implemented and verified
  - 02-build-reaction.png → `/?screen=build#/simulations/reaction-leftovers` — implemented and verified
  - 03-reaction-outcome.png → `/?screen=outcome#/simulations/reaction-leftovers` — implemented and verified
  - 04-stoichiometry-yield.png → `/?screen=yield#/simulations/reaction-leftovers` — implemented and verified
  - 05-challenge.png → `/?screen=challenge#/simulations/reaction-leftovers` — implemented and verified
  - 06-report-assessment.png → `/?screen=report#/simulations/reaction-leftovers` — implemented and verified

### Real Gas Laws

- Reference folder: `real-gas-laws-complete-mockups` (duplicates: `real-gas-laws`)
- Catalog route: `#/physical-chemistry/real-gas-laws`
- Screens:

  - 01-overview.png → `/?screen=overview#/physical-chemistry/real-gas-laws` — implemented and verified
  - 02-pvt-explorer.png → `/?screen=pvt-explorer#/physical-chemistry/real-gas-laws` — implemented and verified
  - 03-compressibility.png → `/?screen=compressibility#/physical-chemistry/real-gas-laws` — implemented and verified
  - 04-critical-behavior.png → `/?screen=critical-behavior#/physical-chemistry/real-gas-laws` — implemented and verified
  - 05-joule-thomson.png → `/?screen=joule-thomson#/physical-chemistry/real-gas-laws` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/physical-chemistry/real-gas-laws` — implemented and verified

### Soil pH & Conductivity

- Reference folder: `soil-ph-conductivity-complete-mockups` (duplicates: `soil-ph-conductivity`)
- Catalog route: `#/virtual-labs/soil-ph-conductivity`
- Screens:

  - 01-home.png → `/?screen=homeundefined` — implemented and verified
  - 02-sampling-extraction.png → `/?screen=sampling-extractionundefined` — implemented and verified
  - 03-sensor-calibration.png → `/?screen=sensor-calibrationundefined` — implemented and verified
  - 04-measurements.png → `/?screen=measurementsundefined` — implemented and verified
  - 05-field-interpretation.png → `/?screen=field-interpretationundefined` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessmentundefined` — implemented and verified

### States of Matter

- Reference folder: `states-of-matter-lab-complete-mockups` (duplicates: `states-of-matter`)
- Catalog route: `#/simulations/states-matter`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/states-matter` — implemented and verified
  - 02-particle-explorer.png → `/?screen=particle-explorer#/simulations/states-matter` — implemented and verified
  - 03-heating-curve.png → `/?screen=heating-curve#/simulations/states-matter` — implemented and verified
  - 04-phase-diagram.png → `/?screen=phase-diagram#/simulations/states-matter` — implemented and verified
  - 05-substance-comparison.png → `/?screen=substance-comparison#/simulations/states-matter` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/simulations/states-matter` — implemented and verified

### Statistical Thermodynamics

- Reference folder: `statistical-thermodynamics-complete-mockups` (duplicates: `statistical-thermodynamics`)
- Catalog route: `#/physical-chemistry/statistical-thermodynamics`
- Screens:

  - 01-overview.png → `/?screen=overview#/physical-chemistry/statistical-thermodynamics` — implemented and verified
  - 02-microstates.png → `/?screen=microstates#/physical-chemistry/statistical-thermodynamics` — implemented and verified
  - 03-partition-function.png → `/?screen=partition-function#/physical-chemistry/statistical-thermodynamics` — implemented and verified
  - 04-molecular-partition.png → `/?screen=molecular-partition#/physical-chemistry/statistical-thermodynamics` — implemented and verified
  - 05-properties.png → `/?screen=properties#/physical-chemistry/statistical-thermodynamics` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/physical-chemistry/statistical-thermodynamics` — implemented and verified

### Tafel Plot

- Reference folder: `tafel-plot-complete-mockups` (duplicates: `tafel-plot`)
- Catalog route: `#/simulations/tafel-plot`
- Screens:

  - 01-home.png → `/?screen=home#/simulations/tafel-plot` — implemented and verified
  - 02-cell-setup.png → `/?screen=cell-setup#/simulations/tafel-plot` — implemented and verified
  - 03-ocp-stabilization.png → `/?screen=ocp-stabilization#/simulations/tafel-plot` — implemented and verified
  - 04-polarization-scan.png → `/?screen=polarization-scan#/simulations/tafel-plot` — implemented and verified
  - 05-tafel-analysis.png → `/?screen=tafel-analysis#/simulations/tafel-plot` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/simulations/tafel-plot` — implemented and verified

### Thermodynamics

- Reference folder: `thermodynamics-complete-mockups` (duplicates: `thermodynamics`)
- Catalog route: `#/physical-chemistry/thermodynamics`
- Screens:

  - 01-overview.png → `/?screen=overview#/physical-chemistry/thermodynamics` — implemented and verified
  - 02-first-law.png → `/?screen=first-law#/physical-chemistry/thermodynamics` — implemented and verified
  - 03-pv-processes.png → `/?screen=pv-processes#/physical-chemistry/thermodynamics` — implemented and verified
  - 04-entropy.png → `/?screen=entropy#/physical-chemistry/thermodynamics` — implemented and verified
  - 05-gibbs-energy.png → `/?screen=gibbs-energy#/physical-chemistry/thermodynamics` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/physical-chemistry/thermodynamics` — implemented and verified

### Viscosity & Poiseuille

- Reference folder: `viscosity-poiseuille-complete-mockups` (duplicates: `viscosity-poiseuille`)
- Catalog route: `#/physical-chemistry/viscosity-poiseuille`
- Screens:

  - 01-home.png → `/?screen=home#/physical-chemistry/viscosity-poiseuille` — implemented and verified
  - 02-apparatus-setup.png → `/?screen=apparatus-setup#/physical-chemistry/viscosity-poiseuille` — implemented and verified
  - 03-capillary-flow.png → `/?screen=capillary-flow#/physical-chemistry/viscosity-poiseuille` — implemented and verified
  - 04-temperature-study.png → `/?screen=temperature-study#/physical-chemistry/viscosity-poiseuille` — implemented and verified
  - 05-polymer-analysis.png → `/?screen=polymer-analysis#/physical-chemistry/viscosity-poiseuille` — implemented and verified
  - 06-report-assessment.png → `/?screen=report-assessment#/physical-chemistry/viscosity-poiseuille` — implemented and verified

## Acid–Base Solutions evidence

- Scientific model: `src/modules/core-simulations/acidBaseModel.js`
- Six-screen UI: `src/modules/core-simulations/AcidBaseSolutionsPage.jsx`
- Workflow and responsive test: `scripts/verify-acid-base-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/acid-base-solutions/`
- Scientific relationships: weak-electrolyte quadratic equilibrium, pH/pOH and temperature-adjusted pKw, strong acid–strong base stoichiometric titration, Henderson–Hasselbalch buffer response.
- Remaining discrepancy: apparatus is rendered with CSS/SVG and follows the composition, hierarchy, colors, labels and representative readings of the mockups, but does not yet reproduce the photorealistic reference imagery pixel-for-pixel.

## Beer–Lambert evidence

- Scientific model: `src/modules/core-simulations/beerLambertModel.js`
- Seven-screen UI: `src/modules/core-simulations/BeerLambertLab.jsx`
- Workflow and responsive test: `scripts/verify-beer-lambert-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/beer-lambert-law/`
- Scientific relationships: A = εbc, T = 10⁻ᴬ, least-squares calibration with R² and residuals, a Gaussian wavelength response centered at λmax = 620 nm, and dilution correction for the unknown.

## Chromatography Separation evidence

- Scientific model: `src/modules/core-simulations/chromatographyModel.js`
- Six-screen UI: `src/modules/core-simulations/ChromatographyLab.jsx`
- Workflow and responsive test: `scripts/verify-chromatography-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/chromatography-separation/`
- Scientific relationships: solvent-dependent TLC retention factors, cylindrical column bed-volume calculation, Gaussian elution profiles, chromatographic resolution, fraction pooling, purity, recovery, and mass balance.

## Distillation & Crystallisation evidence

- Scientific model: `src/modules/core-simulations/distillationModel.js`
- Six-screen UI: `src/modules/core-simulations/DistillationCrystallisationLab.jsx`
- Workflow and responsive test: `scripts/verify-distillation-crystallisation-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/distillation-crystallisation/`
- Scientific relationships: temperature/composition distillation profiles, reflux-dependent theoretical plates and separation factor, steam co-distillation recovery, temperature-dependent solubility, crystallisation recovery, and purity.

## Flame Photometry evidence

- Scientific model: `src/modules/core-simulations/flamePhotometryModel.js`
- Six-screen UI: `src/modules/core-simulations/FlamePhotometryLab.jsx`
- Workflow and responsive test: `scripts/verify-flame-photometry-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/flame-photometry/`
- Scientific relationships: C₁V₁ = C₂V₂ standard preparation, fuel/air/aspiration stability optimization, element-specific Gaussian emission lines, least-squares calibration, replicate RSD, and dilution-corrected unknown concentration.

## Gravimetric Precipitation evidence

- Scientific model: `src/modules/core-simulations/gravimetricModel.js`
- Six-screen UI: `src/modules/core-simulations/GravimetricPrecipitationLab.jsx`
- Workflow and responsive test: `scripts/verify-gravimetric-precipitation-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/gravimetric-precipitation/`
- Scientific relationships: sulfate-to-barium stoichiometry and excess reagent planning, digestion-dependent particle growth and turbidity, quantitative washing, repeated dry/cool/weigh cycles, constant-mass criterion, and molar-mass-derived gravimetric factor.

## Molecular Dynamics evidence

- Scientific model: `src/modules/core-simulations/molecularDynamicsModel.js`
- Six-screen UI: `src/modules/core-simulations/MolecularDynamicsLab.jsx`
- Workflow and responsive test: `scripts/verify-molecular-dynamics-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecular-dynamics/`
- Scientific relationships: reduced-unit Lennard–Jones 12–6 potential, density-derived periodic box length, NVT equilibration state, thermodynamic energy components, RDF/coordination structure, MSD-derived diffusion, block uncertainty, and temperature/density phase-study results.

## Visual-difference baseline

- Acid–Base home: mean absolute channel error 44.80; luminance correlation 0.012.
- Beer–Lambert home: mean absolute channel error 34.19; luminance correlation 0.377.
- Chromatography home: mean absolute channel error 52.16; luminance correlation 0.042.
- Distillation & Crystallisation home: mean absolute channel error 60.54; luminance correlation 0.070.
- Flame Photometry home: mean absolute channel error 45.16; luminance correlation 0.259.
- Gravimetric Precipitation home: mean absolute channel error 48.55; luminance correlation 0.123.
- Molecular Dynamics overview: mean absolute channel error 34.12; luminance correlation 0.787.
- These are diagnostic baselines, not completion scores. The amplified difference and overlay files sit beside each simulator screenshot and show that photorealistic apparatus and exact composition still require refinement.

## Molecule Polarity evidence

- Scientific model: `src/modules/core-simulations/moleculePolarityModel.js`
- Six-screen UI: `src/modules/core-simulations/MoleculePolarityPage.jsx`
- Workflow and responsive test: `scripts/verify-molecule-polarity-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecule-polarity/`
- Scientific relationships: Pauling electronegativity difference, empirical ionic-character estimate, geometry-based vector sums, permanent dipoles, SI dipole-field energy, and the temperature-dependent Langevin orientation response.
- Home visual baseline: mean absolute channel error 81.13; luminance correlation 0.177.

## Molecules & Light evidence

- Scientific model: `src/modules/core-simulations/moleculesLightModel.js`
- Six-screen UI: `src/modules/core-simulations/MoleculesLightPage.jsx`
- Workflow and responsive test: `scripts/verify-molecules-light-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/molecules-light/`
- Scientific relationships: exact Planck relation and SI unit conversions, wavelength–wavenumber conversion, allowed IR transitions, Gaussian line bands, Beer–Lambert absorbance/transmittance, and rotational/vibrational/electronic/dissociative energy ordering.
- Home visual baseline: mean absolute channel error 34.86; luminance correlation 0.782.

## Neutralisation Calorimetry evidence

- Scientific model: `src/modules/core-simulations/neutralisationCalorimetryModel.js`
- Six-screen UI: `src/modules/core-simulations/NeutralisationCalorimetryLab.jsx`
- Workflow and responsive test: `scripts/verify-neutralisation-calorimetry-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/neutralisation-calorimetry/`
- Scientific relationships: hot/cold water calibration with heat-loss correction, limiting-reagent water formation, solution and calorimeter heat terms, cooling-curve correction, molar enthalpy, accepted-value comparison, and weak-acid interpretation.

## Polarography Concentration evidence

- Scientific model: `src/modules/core-simulations/polarographyModel.js`
- Six-screen UI: `src/modules/core-simulations/PolarographyConcentrationLab.jsx`
- Workflow and responsive test: `scripts/verify-polarography-concentration-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/polarography-concentration/`
- Scientific relationships: volumetric standard preparation, first-order nitrogen deaeration, residual-current baseline, sigmoidal diffusion-current wave, half-wave-potential measurement, least-squares calibration, and dilution-corrected unknown concentration.
- Home visual baseline: mean absolute channel error 40.71; luminance correlation 0.167.

## Reactants, Products & Leftovers evidence

- Scientific model: `src/modules/core-simulations/reactionLeftoversModel.js`
- Six-screen UI: `src/modules/core-simulations/ReactionLeftoversPage.jsx`
- Workflow and responsive test: `scripts/verify-reaction-leftovers-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/reactants-products-leftovers/`
- Scientific relationships: integer reaction extent, limiting-reactant identification, product and excess-reactant accounting, element-by-element atom conservation, mole-scale ammonia yield, stoichiometrically consistent molar masses, and percent yield.
- Home visual baseline: mean absolute channel error 22.39; luminance correlation 0.195.

## Real Gas Laws evidence

- Scientific model: `src/modules/core-simulations/realGasModel.js`
- Six-screen UI: `src/modules/core-simulations/RealGasLawsLab.jsx`
- Workflow and responsive test: `scripts/verify-real-gas-laws-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/real-gas-laws/`
- Scientific relationships: ideal and van der Waals equations, temperature-dependent Peng–Robinson EOS, compressibility factor, critical reduced variables, molar density, and constant-enthalpy Joule–Thomson temperature change.
- Overview visual baseline: mean absolute channel error 47.01; luminance correlation 0.539.

## Soil pH & Conductivity evidence

- Scientific model: `src/modules/core-simulations/soilAnalysisModel.js`
- Six-screen UI: `src/modules/core-simulations/SoilPhConductivityLab.jsx`
- Workflow and responsive test: `scripts/verify-soil-ph-conductivity-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/soil-ph-conductivity/`
- Scientific relationships: mass-to-volume extraction ratio, exact Nernst slope at measured temperature, conductivity cell constant, replicate mean/SD/RSD, EC-to-TDS conversion, pH and salinity classification, and field-level descriptive statistics.
- Home visual baseline: mean absolute channel error 56.72; luminance correlation 0.182.

## States of Matter evidence

- Scientific model: `src/modules/core-simulations/statesMatterModel.js`
- Six-screen UI: `src/modules/core-simulations/StatesMatterPage.jsx`
- Workflow and responsive test: `scripts/verify-states-matter-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/states-of-matter/`
- Scientific relationships: piecewise energy balance for ice warming, fusion, liquid warming, vaporization and steam warming; latent-heat phase fractions; kinetic energy per molecule; pressure-dependent phase classification; pure-component phase rule; and comparative melting, boiling, triple and critical points.

## Statistical Thermodynamics evidence

- Scientific model: `src/modules/core-simulations/statisticalThermodynamicsModel.js`
- Six-screen UI: `src/modules/core-simulations/StatisticalThermodynamicsLab.jsx`
- Workflow and responsive test: `scripts/verify-statistical-thermodynamics-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/statistical-thermodynamics/`
- Scientific relationships: exact binomial multiplicity and Boltzmann entropy, two-level canonical populations and heat capacity, translational/rotational/vibrational/electronic molecular partition factors, homonuclear symmetry correction, and U, S, Cᵥ, H and A derived from quantum molecular modes.
- Scientific corrections versus artwork: the N₂ rotational partition function includes σ = 2; qtrans uses the stated 1.00 m³ volume; qvib is explicitly ground-referenced while zero-point energy is treated as a separate energy-reference choice.

## Tafel Plot evidence

- Scientific model: `src/modules/core-simulations/tafelModel.js`
- Six-screen UI: `src/modules/core-simulations/TafelPlotLab.jsx`
- Workflow and responsive test: `scripts/verify-tafel-plot-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/tafel-plot/`
- Scientific relationships: exponentially stabilizing OCP trace and Ag/AgCl-to-SHE conversion, net Butler–Volmer polarization current, independent anodic/cathodic Tafel regressions, fitted-line intersection for Ecorr and icorr, Stern–Geary polarization resistance, and equivalent-weight/density corrosion-rate conversion.
- Home visual baseline: mean absolute channel error 35.76; luminance correlation 0.029.

## Thermodynamics evidence

- Scientific model: `src/modules/core-simulations/thermodynamicsModel.js`
- Six-screen UI: `src/modules/core-simulations/ThermodynamicsLab.jsx`
- Workflow and responsive test: `scripts/verify-thermodynamics-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/thermodynamics/`
- Scientific relationships: chemistry-sign first-law energy accounting, exact ideal-gas reversible isothermal/adiabatic/isobaric/isochoric paths, entropy change and free-expansion irreversibility, Gibbs spontaneity under standard and nonstandard conditions, equilibrium constants, reaction quotients, and Carnot efficiency.
- Scientific corrections versus artwork: the initial 1 mol, 300 K, 10 L state uses the ideal-gas pressure 2.49 bar; the stated partial pressures give Q = 0.0105 and ΔG = -6.47 kJ mol⁻¹; exact ΔH° and ΔS° values give Kp = 0.143.

## Viscosity & Poiseuille evidence

- Scientific model: `src/modules/core-simulations/viscosityModel.js`
- Six-screen UI: `src/modules/core-simulations/ViscosityPoiseuilleLab.jsx`
- Workflow and responsive test: `scripts/verify-viscosity-poiseuille-lab.mjs`
- Screenshots: `docs/chemistry-vl-mockup-rebuild/screenshots/viscosity-poiseuille/`
- Scientific relationships: Ostwald-viscometer η = Kρt conversion, Poiseuille volumetric flow and Reynolds-number classification, Arrhenius viscosity-temperature regression, replicate RSD, relative/specific/reduced polymer viscosities, zero-concentration intrinsic-viscosity extrapolation, and Mark–Houwink viscosity-average molecular weight.
- Scientific corrections versus artwork: K = 0.08325 mm² s⁻² is used because the artwork's 0.00350 value cannot produce its stated η, ρ and t; exact evaluation of ([η]/K)^(1/a) gives 7.80 × 10³ g mol⁻¹.

## Discovery and launch navigation

- Canonical direct-launch data: `src/data/completedVirtualLabs.js`
- Main dashboard: a responsive 19-lab quick-launch section.
- Virtual Labs home: filterable cards for all 19 completed labs and 115 guided screens.
- Subject home pages: entries remain available through the shared home-library catalogue.
- Physical Chemistry Studio: horizontally scrollable shortcuts to every applicable completed lab.
- Navigation workflow test: `scripts/verify-virtual-lab-navigation.mjs`
- Visual evidence: `docs/chemistry-vl-mockup-rebuild/navigation/`
