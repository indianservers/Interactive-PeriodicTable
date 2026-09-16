# Pharmaceutical Chemistry Lab — Validation Log

## Page 1 — Lab Home

Status: implemented and browser-verified on 2026-09-09.

### Automated checks

- `node scripts/verify-pharma-home.mjs` validates the five required case compounds, eight unique journey routes, structure/provenance fields, source coverage, and progress ranges.
- `npm run build` completes successfully with Vite. The existing bundle-size warning remains advisory and is unrelated to the Page 1 change.

### Manual browser checks

The page was inspected in Chrome at `http://127.0.0.1:5173/#/visuals/pharma` against the supplied 1664 × 936 Page 1 mockup.

- Confirmed the dark navy/cyan shell, compact 16:9 hierarchy, full eight-stage journey, hero lab background, central molecule, five-compound strip, compound metadata, recent experiments, safety panel, and core modules.
- Confirmed the paracetamol SDF loads in the Mol* viewer and exposes representation, start/pause/resume, step, axis rotation, zoom, speed, selection, and fullscreen controls.
- Confirmed selecting atorvastatin updates the formula, molar mass, PubChem CID, status, and coordinate model.
- Confirmed RDKit 2D mode renders the selected compound and disables controls that only apply to 3D.
- Confirmed live search filters compounds, recent experiments, and modules.
- Confirmed the provenance drawer opens and lists primary records for all five compounds.
- Confirmed the Lead Optimization journey link resolves to an implemented medicinal-chemistry workspace rather than an unhandled hash.
- Confirmed reset, reduced-motion, local persistence, external primary-source link, and JSON learning-report export paths are wired.

### Remaining validation

## Page 2 — Medicinal Chemistry / Lead Optimization

Status: implemented; first browser QA pass completed on 2026-09-09.

- Confirmed the shared header and eight-stage journey render without the legacy application chrome.
- Confirmed PDB 1HWK loads from the local coordinate asset and focuses the atorvastatin ligand (`117`) in the experimental HMG-CoA reductase complex.
- Confirmed surface, cartoon, and atom representations are connected to Mol*.
- Confirmed Start, Pause, Resume, Step, Reset, and speed controls update the pose, score, contact counts, and live viewer orientation.
- Confirmed docking scores are visibly labeled illustrative and the PDB source is exposed from the evidence panel.
- Confirmed the dense three-column workspace and bottom SAR strip align with the approved Page 2 visual hierarchy.

## Page 3 — API Synthesis

Status: implementation, full application build, mapped-route browser QA, and console check completed on 2026-09-09.

- Confirmed the supplied 5.00 g / 5.00 mL preset calculates 0.0458 mol 4-aminophenol, 0.0530 mol acetic anhydride, 1.16 equivalents, 4-aminophenol as limiting reagent, and 6.93 g theoretical paracetamol.
- Confirmed invalid reagent equivalents and stirring below 250 rpm prevent advancement with explanatory messages.
- Confirmed Start, Pause, Resume, Reset, Step, and speed controls update the simulation; reset restores the original charge and apparatus state.
- Confirmed cumulative conversion does not decrease during cooling.
- Confirmed TLC sampling is unavailable before the reaction and generates a timed model sample after reaction begins.
- Confirmed the Three.js viewport changes from the three-neck reaction train to ice-bath crystallization, Büchner filtration, and drying equipment.
- Confirmed final representative outputs recalculate from current charge and conversion: isolated mass, percentage yield, mass balance, atom economy, and E-factor.
- Confirmed local persistence restores the last experiment after reload, source access is available, and the apparatus supports fullscreen.
- `node --test scripts/test-pharma-calculations.mjs`: 7/7 tests pass after adding preformulation pH-solubility, logD, temperature, and compatibility boundary coverage.
- Isolated esbuild bundles for Pages 2 and 3 compile successfully with no source errors.
- The full Vite production build completes successfully after the unrelated States of Matter files reappeared in the shared worktree; no changes to those files were made by this work.
- The actual mapped route `#/visuals/pharma/api-synthesis` renders without legacy application chrome and reports no browser console warnings or errors after settling.

## Page 4 — Preformulation / API Characterization

Status: implementation, calculation tests, full production build, mapped-route browser QA, and console check completed on 2026-09-09.

- Replaced the former dosage-page alias with a dedicated `#/visuals/pharma/preformulation` route and the shared shell at active journey stage 4.
- Confirmed the layout reproduces the supplied hierarchy: left characterization navigation and paracetamol identity, central DVS/DSC/microscope/crystal bench, right excipient and DVS panels, property strip, four traces, controls, and recommendation.
- Confirmed the default preset displays 14.00 mg/mL at pH 7, pKa 9.38, LogP/LogD, 169.7 °C Form I melting point, D50 62 µm, D90 148 µm, 0.31 mg/cm²/min intrinsic dissolution, and 0.38% w/w uptake at 80% RH.
- Confirmed Start advances the selected instrument run, Pause stops it, Step advances one interval, Reset restores Form I/MCC and default conditions, and speed is adjustable.
- Confirmed polymorph selection changes DSC/PXRD/solubility/dissolution together: Form II produced the expected alternate 157.2 °C teaching preset during browser QA.
- Confirmed magnesium stearate selection updates the compatibility recommendation to a monitoring state with a calculated risk index.
- Confirmed crystal rotation/animation, instrument selection, temperature, pH, D50, humidity, polymorph, excipient, Guided/Free mode, source drawer, and reduced motion are wired.
- Confirmed the actual mapped route renders without legacy application chrome and browser console warnings/errors are empty.
- `npm run build` completes successfully; the existing 3Dmol `eval` and chunk-size notices remain advisory dependency/bundle warnings.

## Page 5 — Dosage Form / Tablet Formulation

Status: implementation, automated tests, production build, mapped-route browser QA, and console check completed on 2026-09-09.

- Replaced the old dosage alias at `#/visuals/pharma/tablet-formulation` with a dedicated shared-shell page at active journey stage 5.
- Confirmed the full-page comparison reproduces the supplied composition: process navigation, granulator/transfer/rotary-press bench, formula overlay, compression controls, three process charts, three CQAs, and quality assessment.
- Confirmed the default formula totals 650.0 mg and 100.00% with calculated per-component percentages.
- Confirmed modifying the API amount to 490 mg produces a precise “10.0 mg under target” validation, blocks batch start, and changes overall assessment; Reset restores the valid formula.
- Confirmed target weight automatically balances the API amount while process controls recalculate weight, hardness, friability, disintegration, and thickness results.
- Confirmed Start, Pause, Resume, Stop, Step, Reset, and speed controls are wired and update process progress/animation.
- Confirmed the nominal preset yields all-pass representative CQAs, while force/speed/fill-depth changes can move individual results out of range.
- `node --test scripts/test-pharma-calculations.mjs`: 8/8 tests pass, including formula-total enforcement and coupled CQA behavior.
- `npm run build` completes successfully; browser console warning/error log is empty on the mapped route.

## Page 6 — Dissolution Lab / USP Apparatus II

Status: implementation, calculation tests, production build, mapped-route browser QA, and console check completed on 2026-09-09.

- Confirmed the dedicated route uses the shared shell at journey stage 6 and reproduces the supplied method/apparatus/results/profile/kinetics/control composition.
- Confirmed six glass vessels, independently displayed values, animated paddles, tablet loading, wetting/dispersion particles, water bath, and six-channel autosampler are functional renderings rather than screenshots.
- Confirmed starting before loading is blocked with an explanatory validation message; raised paddles and out-of-range bath temperature are also guarded.
- Confirmed manual sample collection records six 10 mL aliquots and equal-volume replacement. Automatic mode collected the scheduled 30-minute pull during browser QA.
- Confirmed formulation and sink controls affect the curves: the high-hardness/non-sink scenario yielded a 70.5% mean and 1.00% RSD at 30 minutes, visibly below the selected 85% S1 threshold.
- Confirmed medium, volume, pH, temperature, paddle speed, Q, stage, formulation, sink condition, sampling mode, Guided/Free mode, Start/Pause/Resume/Step/Reset/speed, paddles, and model tabs are wired.
- Confirmed six model families expose representative R² and AIC comparisons and configurable S1/S2 checks are explicitly non-claiming.
- `node --test scripts/test-pharma-calculations.mjs`: 9/9 tests pass, including dissolution curve response, six-vessel acceptance boundaries, sampling replacement, and invalid inputs.
- Browser console warning/error log is empty on the mapped route.

## Page 7 — Analytical Quality Control / HPLC

Status: implementation, calculation tests, production build, mapped-route browser QA, visual comparison, and console check completed on 2026-09-10.

- Confirmed the dedicated `#/visuals/pharma/hplc` route uses the shared shell and closely reproduces the approved three-column composition: workflow/method controls, stacked HPLC system, chromatogram, run controls, and five-part result strip.
- Confirmed the CSS-rendered instrument includes solvent reservoirs, pump, degasser, autosampler tray, UV detector, C18 column oven, and an animated cyan flow/sample path.
- Confirmed an unprimed run is blocked with “Prime the solvent path before running the sequence.”
- Confirmed Prime plus ten controlled Step actions reaches the complete state; integration records a three-peak audit event and changes the overall assessment to PASS.
- Confirmed the baseline calculated results: assay 99.4% label claim, total impurities 0.112%, injection RSD 0.13%, resolution 2.45, 8,450 plates, tailing 1.12, and calibration R² 0.99999.
- Confirmed changing organic fraction, flow, temperature, injection, wavelength, concentration, runtime, and threshold is wired to the model; automated tests verify increased flow raises pressure and increased flow/organic content shortens retention.
- `node --test scripts/test-pharma-calculations.mjs`: 10/10 tests pass, including regression, assay, impurity normalization, invalid standard-area handling, pressure, and retention behavior.
- `npm run build` completes successfully; existing 3Dmol `eval` and bundle-size notices remain advisory. Browser warning/error log is empty on the mapped route.

## Page 8 — Stability and Degradation / ICH Study

Status: implementation, calculation tests, production build, mapped-route browser QA, visual comparison, and console check completed on 2026-09-10.

- Confirmed the dedicated `#/visuals/pharma/stability` route closely reproduces the supplied protocol/schedule, chamber, trend, degradation, packaging, Arrhenius, shelf-life, control, status, and audit layout.
- Confirmed accelerated and long-term stability cabinets plus a lit photostability cabinet are functional CSS-rendered instruments with selected-condition and sample-pull animation states.
- Confirmed running HPLC before a completed pull is blocked; completing the pull exposes the “Samples are ready for HPLC” state and HPLC analysis adds an audit event.
- Confirmed shelf-life modeling is gated behind HPLC analysis and Alu-Alu selection recalculates the modeled result from 89 to 172 months in the checked representative scenario.
- Confirmed condition, package, and scheduled pull time recalculate assay, total degradants, dissolution, moisture, risk, Arrhenius behavior, and shelf-life together.
- `node --test scripts/test-pharma-calculations.mjs`: 11/11 tests pass, including packaging protection ordering, Arrhenius R²/activation energy, shelf-life boundaries, and invalid pull handling.
- `npm run build` completes successfully; existing dependency/bundle notices remain advisory. Browser warning/error log is empty on the mapped route.

## Page 9 — ADME and Human Pharmacokinetics

Status: implementation, calculation tests, production build, mapped-route browser QA, visual comparison, and console check completed on 2026-09-10.

- Replaced the former partial ADME screen at `#/visuals/pharma/adme` with the shared-shell pharmacokinetics workspace matching the approved parameter/body/pathway/control/profile/mass-balance composition.
- Confirmed dose, body weight, gastric emptying, hepatic function, renal function, fed state, PK model, and dose interval are interactive and recalculate all dependent outputs.
- Confirmed changing the dose from 500 to 1000 mg changed Cmax from 4.8 to 9.7 mg/L and AUC from 21.0 to 41.9 mg·h/L in browser QA; Simulate reported the new Cmax/Tmax state.
- Confirmed the model displays one primary profile, normal/fasted comparison, hepatic-impairment summary, metabolic pathway allocation, derived clearance/half-life, and a five-fraction mass balance summing to 100%.
- `node --test scripts/test-pharma-calculations.mjs`: 12/12 tests pass, including dose proportionality, fed-state Tmax, organ-impairment half-life, trapezoidal AUC, mass-balance conservation, and invalid-dose handling.
- `npm run build` completes successfully with only existing advisory dependency/bundle notices. Browser warning/error log is empty on the mapped route.

## Page 10 — Toxicology and Patient Translation

Status: implementation, calculation tests, production build, mapped-route browser QA, visual comparison, and console check completed on 2026-09-10.

- Replaced the former partial toxicology page at `#/visuals/pharma/toxicology` with the final shared-shell patient-translation workspace and an 8/8 journey completion state.
- Confirmed the mockup hierarchy: scenario/patient controls, paracetamol→NAPQI→GSH mechanism, liver/cell progression, risk assessment, off-target matrix, prominent medical disclaimer, exposure/dose-response plots, benefit-risk matrix, adverse events, NAC mechanism, and completion controls.
- Confirmed the baseline therapeutic scenario produces a low educational risk state with 99% GSH reserve.
- Confirmed the high-risk browser scenario (8 g, impaired liver, chronic alcohol use, repeated exposure) recalculates to a critical state with 100% modeled NAPQI burden, 8% GSH reserve, and a 99% illustrative injury-risk index.
- Confirmed Run, Compare, Reset, Export, scenario buttons, body weight, age, food, liver, alcohol, repeated-exposure, source drawer, and reduced-motion controls are wired.
- `node --test scripts/test-pharma-calculations.mjs`: 13/13 tests pass, including exposure ordering, glutathione depletion, vulnerable-patient risk, enzyme response, dose-response monotonicity, and invalid weight.
- `npm run build` completes successfully with only existing advisory dependency/bundle notices. Browser warning/error log is empty on the mapped route.
