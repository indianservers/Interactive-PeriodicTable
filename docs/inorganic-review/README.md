# Cobalt equilibrium lab

Routes: `#visuals/inorganic` and `#modules/inorganic` share the rebuilt page.

## Implementation

- Three.js, already installed: lathed glass walls and bases, physical liquid
  materials, meniscus, procedural stone texture, room-environment reflections,
  contact shadows, instanced suspended particles and orbit controls.
- Idealized octahedral Co–water and tetrahedral Co–chloride models use the same
  atom/bond meshes as the live substitution scene. They are not PDB structures.
- HTML controls, tabs and locally persisted notebook; SVG high-spin d7 diagrams
  and interactive absorbance curves. Notebook PNGs are local WebGL captures,
  explicitly described as rendered references rather than experiment photographs.
- Animation stops when hidden/offscreen, respects reduced motion and disposes
  renderer, geometry, material, texture, control and observer resources on unmount.
- The left beaker is the changing sample. The right is a labeled fixed
  chloride-rich reference. This distinction is intentional, not two differently
  coloured depictions of the same equilibrium mixture.

## Scientific corrections and limitations

- Co(II), not the prior copper model. High-spin d7 is t2g5 eg2 (octahedral)
  and e4 t2 3 (tetrahedral); both have three unpaired electrons.
- The supplied illustration reverses the absorption bands. Aqua/pink absorption
  is shown near 510 nm; chloride/blue absorption is shown in the red region near
  685 nm. Observed colour and absorbed colour are not the same.
- The two-species concentration mapping, K298=0.6, delta-H=+32 kJ/mol, band
  shapes and eight-second animation are explicitly illustrative. They are not
  calibrated equilibrium, kinetic or spectroscopic measurements. Intermediates
  and nonideal activities are omitted.

Sources:
- https://www.chem.indiana.edu/faculty-research/faculty-resources/chemistry-demos/demo/le-chateliers-principle-using-a-cobalt-complex/
- https://paperspast.natlib.govt.nz/periodicals/TPRSNZ1948-77.2.6.1
- https://chem.washington.edu/lecture-demos/cobalt-equilibrium

## Verification

`node scripts/verify-cobalt-model.mjs` checks coordination geometry, tetrahedral
angles, monotonic concentration/temperature response, normalized fractions and
absorption ordering. `npm run build` passes (existing large-bundle/3Dmol warnings).

`scripts/verify-inorganic.mjs` captures screenshots. Set `INORGANIC_TEST=1` for
the interaction/responsive suite; only a generated `verification.json` proves
that the complete suite passed. Set `INORGANIC_GENERATE=1` to regenerate the
notebook images. The script uses Playwright from `ORGANIC_QA_MODULE_ROOT`.

## Remaining visual differences

The real-time glassware is still more stylized than the photographic target;
complex refraction, caustics and laboratory-background detail are simplified.
The current screenshots do **not** establish the requested 95% similarity or
60-FPS performance. Do not describe the entire acceptance specification as met.
