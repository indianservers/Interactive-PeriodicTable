# Physical Chemistry Studio rebuild inventory

Date: 2026-03-10

## Existing application and replacement scope

- Runtime: React 18.3 + Vite 5.4, JavaScript/JSX, Tailwind plus page-scoped CSS.
- Scientific/rendering libraries already available: Three.js 0.168, KaTeX 0.18, RDKit, 3Dmol.js and Mol*.
- Current Physical Chemistry implementation: `src/pages/PhysicalTargetPage.jsx` with `src/pages/physicalTarget.css`.
- Current public hash: `#modules/physical`, mapped by `src/App.jsx` to `physical-simulators`.
- Existing page is a single Argon piston UI using an SVG illustration and synthetic chart paths. It is the implementation to replace, not preserve as a parallel duplicate.
- `AppShell` already treats `physical-simulators` as an immersive full-screen page. Its global Home and motion controls remain available unless the new studio intentionally supplies equivalents.
- The worktree contains substantial unrelated in-progress changes. This rebuild is isolated to the physical-chemistry module, its route integration, its verification scripts, and this evidence directory.

## Mockup audit

All fourteen reference PNGs were opened and inspected before implementation. Every source image is 1672 × 941 px.

| Seq. | Reference file | Required workspace | Hash route | Primary model/view |
|---:|---|---|---|---|
| 01 | `01_Molecular_Dynamics.png` | Molecular Dynamics | `#modules/physical/molecular-dynamics` (and `#modules/physical`) | Lennard-Jones particles in a piston; live velocity, pressure and P–V plots |
| 02 | `02_Real_Gas_Laws.png` | Real Gas Laws | `#modules/physical/real-gas-laws` | Compressible gas with ideal, van der Waals, Redlich–Kwong and Peng–Robinson comparisons |
| 03 | `03_Thermodynamics.png` | Thermodynamics | `#modules/physical/thermodynamics` | Four-stage Carnot cycle, energy/work accounting and P–V/T–S plots |
| 04 | `04_Statistical_Thermodynamics.png` | Statistical Thermodynamics | `#modules/physical/statistical-thermodynamics` | Boltzmann populations, partition functions and energy-level occupation |
| 05 | `05_Chemical_Kinetics.png` | Chemical Kinetics | `#modules/physical/chemical-kinetics` | Collision kinetics, rate laws, Arrhenius and reaction-coordinate analysis |
| 06 | `06_Chemical_Equilibrium.png` | Chemical Equilibrium | `#modules/physical/chemical-equilibrium` | N₂O₄ ⇌ 2 NO₂ mass-action dynamics and Le Châtelier perturbations |
| 07 | `07_Phase_Equilibrium.png` | Phase Equilibrium | `#modules/physical/phase-equilibrium` | Water phase-cell animation, phase boundaries and heating curves |
| 08 | `08_Solutions_Colligative_Properties.png` | Solutions & Colligative Properties | `#modules/physical/solutions-colligative-properties` | NaCl hydration/dissociation with activity-aware colligative properties |
| 09 | `09_Electrochemistry.png` | Electrochemistry | `#modules/physical/electrochemistry` | Daniell cell, Nernst potential, ion transport and polarization |
| 10 | `10_Quantum_Chemistry.png` | Quantum Chemistry | `#modules/physical/quantum-chemistry` | Hydrogenic orbital probability density, nodes and quantized energy |
| 11 | `11_Molecular_Spectroscopy.png` | Molecular Spectroscopy | `#modules/physical/molecular-spectroscopy` | CO₂ normal modes with IR/Raman spectra and selection rules |
| 12 | `12_Surface_Chemistry.png` | Surface Chemistry | `#modules/physical/surface-chemistry` | Langmuir adsorption/desorption on Pt(111) with stochastic site occupation |
| 13 | `13_Photochemistry.png` | Photochemistry | `#modules/physical/photochemistry` | Azobenzene photoisomerization, excited-state kinetics and spectra |
| 14 | `14_Transport_Phenomena.png` | Transport Phenomena | `#modules/physical/transport-phenomena` | Brownian diffusion across a membrane, Fick profiles, MSD and VACF |

The legacy `#modules/physical` route will resolve to Molecular Dynamics so existing deep links continue to work. Studio navigation will update the hash to the canonical subroute.

## Shared visual measurements and design grammar

- Desktop reference viewport: 1672 × 941.
- Left rail: approximately 137 px in source pixels (163 px in the earlier 1920-layout design scale), full height, near-black navy, 1 px blue-gray divider.
- Header: approximately 69 px in source pixels (81 px design scale), with product title/subtitle at left and compact selectors/actions at right.
- Main padding/gutters: 12–16 px. Panels use 1 px `#25394f`-family borders and 6–8 px radii.
- Experiment zone: typically 500–560 px tall at the reference viewport, split into a dominant visual column and one or two 300–390 px control/results columns.
- Analysis zone: three or four equal-height plot cards along the bottom, approximately 225–250 px high.
- Palette: `#07131f`/`#0b1928` background, `#112235` panels, `#263f59` dividers, `#dbeafe` primary text, `#9fc4e8` secondary text, `#26a8ff` cyan-blue controls; scientific series add amber, mint, red and violet.
- Typography: compact Segoe UI/system sans; 30–32 px workspace title, 16–20 px section titles, 12–14 px labels and tick text. Equations use KaTeX where symbolic clarity matters.
- Interaction grammar: luminous selected tabs, native labeled selects/ranges, Run/Pause/Reset cluster, direct-manipulation Three.js viewport, live values, visible units, keyboard focus, reduced-motion support and deterministic Reset.
- Responsive behavior: collapse the rail to icons; stack scene, controls and results below roughly 1100 px; plot cards become a single column below tablet widths; controls remain reachable without horizontal overflow.

## Reuse and architecture decision

Reusable patterns identified in the repository:

- Three.js scene setup, instancing, OrbitControls, ResizeObserver handling, resource disposal and reduced-motion checks from `src/components/crystal/CrystalScene.jsx`.
- Three.js marching-cubes orbital surface technique from `src/pages/AdvancedOrbitalScene.jsx` for the Quantum Chemistry workspace.
- Existing immersive-page bypass in `src/components/layout/AppShell.jsx`.
- Existing global focus styling and light/dark integration from `src/index.css`.

The rebuild will be a dedicated `src/modules/physical-chemistry/` feature, with a shared studio shell, accessible controls, SVG plotting primitives, Three.js scene utilities, centralized constants/units/provenance/validation, and one model module per workspace. `PhysicalTargetPage.jsx` remains the integration entry point and delegates to the new studio. This avoids a broad application rewrite and keeps unrelated pages untouched.

## Shared scientific layer

The feature will centralize:

- SI definitions and CODATA/NIST constants with source URL, retrieved date and uncertainty/exactness metadata.
- Explicit conversions for pressure, energy, length, concentration, viscosity, frequency/wavenumber and electrochemical units.
- Numeric domain checks, finite-number assertions, probability normalization, non-negative concentration/population constraints and conservation checks.
- Seeded pseudo-random generation for reproducible stochastic simulations.
- Model metadata displayed in the UI: equation, assumptions, applicability, limitations and provenance.
- Data export that records model name, inputs, units, seed, constants version and sampled series.

## Sequential implementation gate

Workspaces are implemented and validated strictly in reference order 01 through 14. A page is not considered complete until its model, interaction loop, visual state, plots, responsive layout, keyboard controls, reduced-motion behavior, deterministic reset and browser console have been checked. Shared infrastructure introduced for page 01 may be reused later, but no later workspace is treated as validated before its predecessor.

