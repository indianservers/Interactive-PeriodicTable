# Visual and motion acceptance

No Virtual Lab currently passes the user's complete acceptance gate.

The last measured Chromatography screenshots (before the motion preparation work) scored 48.80% for overview and 57.45% for TLC under windowed RGB SSIM at 1672 × 941. These are historical measurements, not scores for the new 3D preparation view. No 95% match is claimed.

## Current implementation

Chromatography has a new live sample preparation view accessible from “Prepare sample · live apparatus”. Its explicit state model covers automatic and pointer-driven shaking, independent liquid slosh, settling, bounded aspiration, dispensing, plate placement, solvent-front development, differential compound migration, removal, UV inspection, pause, and reset.

Model checks validate 30/60/120 FPS integration, mass balance at each timestep, pipette capacity, settling, rejected out-of-order actions, pause, and reset. The browser capture script records six frames per applicable action. Capture success is not a claim of photorealism or geometric collision verification.

## Outstanding completion work

- Integrate the rendered apparatus directly with the reference TLC composition. Preparation is currently a separate view; its state persists on close/reopen and supplies solvent ratio, spotting volume, and development progress to the main TLC screen.
- Finish column packing, loading, stopcock flow, fraction collection, live chromatogram, and result calculations under the same experiment state machine.
- Replace the static photographic apparatus in the reference screens with responsive apparatus that clears visual comparisons.
- Validate vessel/particle containment, smooth paths, manual manipulation, mobile and reduced-motion rendering, and performance with measured evidence.
- Rerun exact-reference visual comparisons after integrating the apparatus; reach 95% overall and 90% in every region.
- Apply the proven implementation to the remaining laboratories only after the Chromatography benchmark passes.

Existing route smoke tests and prior “implemented” inventory labels must not be interpreted as completion.
