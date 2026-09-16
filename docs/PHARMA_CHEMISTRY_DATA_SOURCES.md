# Pharmaceutical Chemistry Lab — Data Sources

## Provenance policy

The laboratory separates verified reference data from teaching simulations. Molecular identities, formulas, molar masses, and the stored 3D conformers on the Lab Home page are sourced from PubChem. Values created by the learning simulations are labeled **educational model**, **illustrative**, or **calculated** at the point of use. They are not batch-release results, prescribing guidance, or substitutes for validated laboratory procedures.

## Compound records used on Page 1

| Case compound | PubChem CID | Formula | Molar mass | Stored coordinate asset | Primary record |
|---|---:|---|---:|---|---|
| Paracetamol / acetaminophen | 1983 | C8H9NO2 | 151.16 g/mol | `/assets/toxicology/structures/acetaminophen.sdf` | https://pubchem.ncbi.nlm.nih.gov/compound/1983 |
| Ibuprofen | 3672 | C13H18O2 | 206.28 g/mol | `/assets/drug-discovery/compounds/ibuprofen.sdf` | https://pubchem.ncbi.nlm.nih.gov/compound/3672 |
| Metformin | 4091 | C4H11N5 | 129.16 g/mol | `/assets/pharma/metformin.sdf` | https://pubchem.ncbi.nlm.nih.gov/compound/4091 |
| Amoxicillin | 33613 | C16H19N3O5S | 365.40 g/mol | `/assets/pharma/amoxicillin.sdf` | https://pubchem.ncbi.nlm.nih.gov/compound/33613 |
| Atorvastatin | 60823 | C33H35FN2O5 | 558.64 g/mol | `/assets/pharma/atorvastatin.sdf` | https://pubchem.ncbi.nlm.nih.gov/compound/60823 |

The SDF files were obtained through the official PubChem PUG REST service (`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{CID}/SDF?record_type=3d`) and are kept locally so the interactive viewer does not depend on a live network request.

## Software and display methods

- 3D coordinates are rendered by the existing Mol* viewer integration. Element colors, representation changes, rotation, zoom, atom selection, and fullscreen are interactive display operations; they do not modify the underlying coordinates.
- 2D depictions are generated locally from the listed SMILES strings with the bundled RDKit WebAssembly runtime.
- The laboratory bench image at `/assets/pharma/lab-home-background.png` is an AI-generated decorative background. It contains no scientific values and is never used as an interactive instrument.

## Page-specific source register

### Page 2 — Medicinal Chemistry

- Experimental binding complex: RCSB PDB **1HWK**, catalytic portion of human HMG-CoA reductase with atorvastatin, X-ray diffraction, 2.22 Å: https://www.rcsb.org/structure/1HWK
- Local coordinate asset: `/assets/pharma/1HWK.pdb`; ligand component `117` is focused in chain A.
- Contact labels are generated from the local chain-A coordinate record with a 4.5 Å cutoff. The nearest displayed atom pairs are Ser684 OG (2.65 Å), Arg590 NE (2.77 Å), Asp690 OD2 (2.79 Å), Lys691 NZ (2.84 Å), and Val683 CG1 (3.29 Å).
- Atorvastatin descriptors are PubChem-computed values for CID 60823: MW 558.6 g/mol, XLogP3-AA 5.0, TPSA 112 Å², HBD/HBA 4/6, and 12 rotatable bonds: https://pubchem.ncbi.nlm.nih.gov/compound/60823
- Displayed pose, potency-index, and developability scores are explicitly labeled representative educational heuristics. They are not experimental measurements or directly comparable assay results.

### Page 3 — API Synthesis

- 4-aminophenol identity and molar mass: PubChem CID 403, https://pubchem.ncbi.nlm.nih.gov/compound/4-Aminophenol
- Acetic anhydride identity, molar mass (102.09 g/mol), and density (1.082 g/mL at 20 °C): PubChem CID 7918, https://pubchem.ncbi.nlm.nih.gov/compound/Acetic-anhydride
- Paracetamol identity and molar mass (151.16 g/mol): PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/Acetaminophen
- Reaction stoichiometry is a balanced 1:1 acetylation. Moles, equivalents, limiting reagent, theoretical yield, percentage yield, atom economy, and E-factor are calculated in-app with explicit units.
- The conversion curve, TLC spot intensity, isolation recovery, mass balance, and resulting E-factor are representative educational simulation outputs, not measured batch data.

### Page 4 — Preformulation

- Paracetamol identity, formula, molar mass, and compound record: PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/1983
- The baseline 25 °C / pH 7 aqueous-solubility display is 14.0 mg/mL, used as a representative literature-aligned teaching preset rather than a lot-specific measurement.
- The pH-solubility engine applies the Henderson–Hasselbalch weak-acid relationship with pKa 9.38 and couples temperature, pH, and selected solid form. LogD is calculated from logP, pH, and pKa.
- DSC, PXRD, DVS, laser-diffraction particle-size, polymorph, intrinsic-dissolution, compatibility-risk, and recommendation outputs are explicitly labeled representative educational simulations. They are not compendial, lot-release, or regulatory data.
- Form I/Form II/amorphous selection changes melting behavior, diffraction pattern, solubility, and dissolution consistently; humidity, temperature, storage duration, and excipient factor feed the compatibility risk model.

### Page 5 — Tablet Formulation

- Paracetamol identity and molar mass: PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/1983
- The default immediate-release teaching formula is 500 mg paracetamol plus 150 mg excipients per 650 mg tablet. Component percentages and total are calculated directly from entered masses; batch start is blocked unless the formula total equals the selected target tablet weight.
- Thirty-tablet weight and hardness series, 15-sample blend uniformity, friability, disintegration, thickness, and pass/fail states are deterministic representative teaching simulations. Turret speed, compression force, fill depth, target weight, and formula composition are coupled to these outputs.
- Results are not master-formula instructions, manufacturing settings, compendial tests, clinical advice, or release data.

### Page 6 — Dissolution Testing

- Apparatus terminology and general stage concepts: USP dissolution harmonization overview, https://www.usp.org/harmonization-standards/pdg/general-methods/dissolution
- The six vessel profiles are deterministic educational models coupled to medium, pH, volume, temperature, paddle speed, formulation preset, and sink/non-sink choice.
- Sampling uses an explicit 10 mL withdrawal and equal-volume replacement calculation. Manual and scheduled automatic modes share the same correction logic.
- Vessel mean and sample RSD are calculated. S1 uses learner-selected Q + 5 for all six units; the displayed S2 teaching check uses mean ≥ Q and no unit below Q − 15. The UI explicitly avoids claiming monograph or regulatory compliance.
- Zero-order, first-order, Higuchi, Hixson–Crowell, Korsmeyer–Peppas, and Weibull comparisons display representative R² and AIC values; these are model-teaching outputs, not fits to measured product data.

### Page 7 — HPLC Assay and Impurities

- Paracetamol identity and compound record: PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/1983
- Calibration points are a labeled representative six-level dataset from 25–150 µg/mL. Ordinary least-squares slope, intercept, and R² are calculated in-app rather than hard-coded result labels.
- Assay uses the current sample and standard areas, concentration ratio, and potency fraction. Individual impurity percentages use area normalization with response-factor support. Six representative standard injections feed the sample-RSD calculation.
- Organic fraction, flow rate, column temperature, injection volume, wavelength, sample concentration, and integration threshold are coupled to retention time, response, pressure, peak inclusion, resolution, plates, tailing, assay, and impurity results.
- The chromatogram, method, suitability values, audit events, and pass/fail assessment are explicitly representative educational simulations. They are not validated analytical procedures, pharmacopoeial specifications, batch-release data, or regulatory claims.

### Page 8 — Stability and Degradation

- Study-condition terminology and general stability design: ICH Q1A(R2), https://database.ich.org/sites/default/files/Q1A%28R2%29%20Guideline.pdf
- Photostability terminology and exposure preset: ICH Q1B, https://database.ich.org/sites/default/files/Q1B%20Guideline.pdf
- Long-term, intermediate, accelerated, and photostability selections feed a deterministic temperature/humidity/light model. PVC, Alu-Alu, and desiccated HDPE selections apply explicit protection factors.
- Assay, total degradants, dissolution, and moisture are calculated for scheduled 0/1/2/3/6-month pulls. Arrhenius transformation/regression calculates slope, R², and activation energy; the 25 °C first-order rate estimates assay-limit shelf life.
- The displayed chamber contents, LC-MS trace, degradation products, trends, package comparison, risk label, and shelf-life result are representative educational simulations, not measured batch data or regulatory stability claims.

### Page 9 — ADME and Human Pharmacokinetics

- Paracetamol identity, formula, and compound record: PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/1983
- The page visually separates displayed typical literature ranges from the current simulation values. The base educational assumptions are 80% oral bioavailability, 0.9 L/kg apparent distribution volume, 2.3 h half-life, and predominant glucuronidation/sulfation.
- A Bateman oral-input model calculates the concentration-time profile from dose, weight, absorption rate, elimination rate, and distribution volume. Trapezoidal integration calculates AUC; the sampled curve calculates Cmax/Tmax; half-life, clearance, dose-interval accumulation, and 24 h mass balance are derived.
- Fed state, gastric emptying, hepatic function, renal function, one/two-compartment selection, weight, dose, and interval are learner-controlled assumptions coupled to the outputs.
- Anatomical diagrams and all simulated concentrations/exposures are educational. They are not individual predictions, dosing recommendations, diagnostic output, or a substitute for clinical pharmacology sources.

### Page 10 — Toxicology and Patient Translation

- Paracetamol identity and compound record: PubChem CID 1983, https://pubchem.ncbi.nlm.nih.gov/compound/1983
- The qualitative mechanism follows the established minor CYP-mediated conversion of paracetamol to reactive NAPQI, glutathione conjugation/detoxification, glutathione depletion under high exposure, and centrilobular liver injury.
- Dose, body weight, repeated exposure, age group, liver function, alcohol scenario, and fed state feed a transparent bounded educational risk model. The model calculates NAPQI burden, glutathione reserve, an illustrative injury-risk index, enzyme changes, exposure, and benefit/risk position.
- The off-target matrix, adverse-event ranges, dose-response curves, cell progression, and risk outputs are illustrative. The page prominently states that it is not medical guidance and directs suspected overdose/hepatotoxicity to urgent clinical assessment and poison-center/emergency services.
- The NAC panel explains only the glutathione-replenishment mechanism; it intentionally provides no dosing or treatment instructions.
