# Crystal Lattice Explorer

## Scope and files

- `src/pages/CrystalTargetPage.jsx`: complete interactive page, navigation, structure library, controls and dialogs.
- `src/pages/crystalExplorer.css`: responsive reference-inspired dark workspace.
- `src/components/crystal/CrystalScene.jsx`: Three.js instanced lattice, OrbitControls, PBR lighting, actual-coordinate thumbnails, unit cell, polyhedra, Miller plane and clipping.
- `src/components/crystal/crystalStructures.js`: six crystallographic bases and calculations.
- `src/components/crystal/DiffractionChart.jsx`: interactive calculated diffraction plot.
- `src/App.jsx`, `src/components/layout/AppShell.jsx`: navigation integration and removal of overlapping global floating controls on this route.
- `package.json`, `package-lock.json`: KaTeX dependency; Three.js was already installed.
- `scripts/verify-crystal-data.mjs`, `scripts/verify-crystal.mjs`: scientific and browser regression checks.

## Scientific model

The library contains NaCl, CsCl, zinc blende, fluorite, diamond and hexagonal graphite. Repeated sites come from explicit conventional-cell bases. CsCl is described as primitive cubic, not a BCC Bravais lattice. Density is ZM/(N_A V); volume per formula unit is V/Z. Packing uses the listed hard-sphere radii. Reciprocal lattice vectors determine Miller spacing for both cubic and hexagonal structures. XRD positions follow Bragg's law with Cu K-alpha wavelength 1.5406 Å; relative intensities use approximate constant electron-count structure factors, multiplicity and a Lorentz-polarization factor.

The reference's NaCl volume of 95.1 Å³ per formula unit is inconsistent with a=5.64 Å and Z=4. This page calculates 44.85 Å³, density 2.16 g/cm³ and radius-model packing 65.3%, rather than copying inconsistent numbers.

Structure background/reference: https://aflow.org/prototype-encyclopedia/

## Verification

Run `node scripts/verify-crystal-data.mjs` for basis counts, unique periodic sites, density, cubic/hexagonal Miller spacing and NaCl reflections.

Run `scripts/verify-crystal.mjs` with `CRYSTAL_TEST=1` and `ORGANIC_QA_MODULE_ROOT` pointing to the installed Playwright node_modules. It checks rendered changes for unit-cell/polyhedra/label controls, vacancies, repeat cells, view modes, clipping controls, Miller inputs, XRD hover, all six structures, search, dialogs, PNG export, and responsive layouts. Screenshots and machine-readable results are in this directory. Desktop checks include absence of page scrolling and control-card clipping; narrow layouts deliberately scroll vertically.

Production validation uses `npm run build`. This repository has no separate lint/typecheck script.

## Limitations

- This is a reference-inspired interactive renderer, not a pixel-identical or photorealistic reproduction. It does not reproduce the reference's depth-of-field rendering or detached illustrative polyhedra.
- The optional, explicitly labeled foreground cutaway exposes the selected cell. Disable it to inspect the full repeated lattice.
- XRD intensities are educational approximations, not measured data or a full atomic-form-factor calculation.
- Defects illustrate removed/added sites; charge compensation, structural relaxation and defect energetics are not simulated.
- The 2D view is a locked (001) camera projection of the real geometry.
