# Physical Chemistry Studio rebuild

The former single-page Physical Chemistry simulator has been replaced by one coherent studio with fourteen canonical deep-linked workspaces. The legacy `#modules/physical` link continues to open Molecular Dynamics.

## Delivered workspaces

1. Molecular Dynamics — seeded worker-based 12-6 Lennard–Jones dynamics, interactive Three.js chamber, velocity histogram, pressure history and P–V response.
2. Real Gas Laws — ideal and van der Waals equations of state, compressibility and residual-pressure analysis.
3. Thermodynamics — reversible Carnot model with heat, work, efficiency, P–V and T–S paths.
4. Statistical Thermodynamics — normalized canonical populations, partition function, mean energy and entropy.
5. Chemical Kinetics — second-order concentration evolution, Arrhenius law, collision energy and reaction coordinate.
6. Chemical Equilibrium — stoichiometric extent solution for N₂O₄ ⇌ 2 NO₂ with a verified Q = K endpoint.
7. Phase Equilibrium — water phase classification, vapor boundary, heating path and phase-rule context.
8. Solutions & Colligative Properties — van ’t Hoff boiling, freezing and osmotic models.
9. Electrochemistry — Daniell-cell Nernst potential, ΔG, equilibrium constant, concentration and polarization behavior.
10. Quantum Chemistry — hydrogenic energy/angular-momentum states, nodes, radial/angular plots and orbital-density view.
11. Molecular Spectroscopy — CO₂ normal modes, IR/Raman selection behavior, energy levels and normal coordinates.
12. Surface Chemistry — Langmuir coverage, kinetic relaxation, adsorption-energy distribution and seeded site occupation.
13. Photochemistry — photon energy, azobenzene excited-state relaxation, potential surfaces and product quantum yield.
14. Transport Phenomena — Stokes–Einstein diffusion, Fick flux, concentration profiles, MSD and velocity autocorrelation.

## Scientific and interaction guarantees

- Shared SI/CODATA constants, conversions, seeded randomness and physical-domain helpers live in `src/modules/physical-chemistry/scientific.js`.
- Every model exposes governing equations, assumptions, a dated authoritative source, live derived values and JSON export metadata.
- Run animates the shared model state, Pause freezes it, and Reset restores deterministic defaults.
- The Molecular Dynamics integrator runs in a module Web Worker. The particle scene uses an instanced Three.js mesh and cleans up its renderer, controls and GPU resources on unmount.
- All other workspaces compute their plots from the same inputs displayed in the control panel; none use static screenshot imagery.
- Reduced-motion CSS, focus-visible controls, labeled inputs, tab semantics and responsive stacking are included.

## Verification

Run:

```powershell
$env:PLAYWRIGHT_MODULE_ROOT='C:\Users\saisa\.cache\codex-runtimes\codex-primary-runtime\dependencies\node'
npm run test:physical
```

The verifier checks the workspaces strictly in order 01–14, model finiteness, equilibrium mass action, probability normalization, Carnot efficiency, non-negative colligative outputs, positive diffusion, Run/Pause/Reset, parameter changes, chart counts, browser errors, desktop overflow, and mobile overflow. It saves the structured result to `verification.json` and the fourteen 1672×941 comparison captures to `screenshots/`.

The original visual audit and route/component map are in `INVENTORY.md`.
