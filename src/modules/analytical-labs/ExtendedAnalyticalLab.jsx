import { useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Download,
  Droplets,
  FlaskConical,
  Gauge,
  Leaf,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Zap,
} from "lucide-react";

const n = (value) => Number(value) || 0;
const fixed = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";

const experimentConfigs = [
  {
    id: "organic-solvent-viscosity",
    title: "Organic-Solvent Viscosity",
    topic: "Physical Chemistry",
    icon: Gauge,
    accent: "cyan",
    theory: "An Ostwald viscometer compares the flow time and density of a liquid with a reference at the same temperature.",
    formula: "ηₛ = ηᵣ(ρₛtₛ)/(ρᵣtᵣ)",
    inputs: [
      ["sampleTime", "Sample flow time", 20, 300, 1, "s", 112],
      ["sampleDensity", "Sample density", 0.5, 1.5, 0.01, "g mL⁻¹", 0.79],
      ["referenceTime", "Water flow time", 20, 200, 1, "s", 72],
      ["referenceViscosity", "Water viscosity", 0.5, 1.5, 0.001, "mPa·s", 0.89],
    ],
    calculate: (v) => {
      const eta = n(v.referenceViscosity) * n(v.sampleDensity) * n(v.sampleTime) / (0.997 * n(v.referenceTime));
      return { primary: `${fixed(eta, 3)} mPa·s`, metrics: [["Relative viscosity", fixed(eta / n(v.referenceViscosity), 3)], ["Temperature basis", "25 °C"]], note: "Compare replicate flow times; they should normally agree within about 0.2 s." };
    },
    procedure: ["Thermostat and rinse the viscometer.", "Measure reference and solvent flow times in triplicate.", "Use density values at the same temperature.", "Calculate viscosity and report the mean."],
    safety: "Organic solvents may be volatile and flammable. Work in a hood, avoid ignition sources, and use compatible gloves.",
  },
  {
    id: "laser-flash-photometry",
    title: "Laser Flash Photometry",
    topic: "Photochemistry",
    icon: Zap,
    accent: "violet",
    theory: "A short laser pulse creates a transient species. Its absorbance decay gives the first-order lifetime and rate constant.",
    formula: "A(t) = A₀e⁻ᵏᵗ; k = ln(A₀/Aₜ)/t; τ = 1/k",
    inputs: [
      ["initialAbs", "Initial transient absorbance", 0.05, 1.5, 0.01, "AU", 0.82],
      ["finalAbs", "Absorbance at delay", 0.01, 1.4, 0.01, "AU", 0.21],
      ["delay", "Delay time", 1, 500, 1, "µs", 85],
      ["laserEnergy", "Laser pulse energy", 1, 30, 0.5, "mJ", 8],
    ],
    calculate: (v) => {
      const ratio = Math.max(n(v.initialAbs) / Math.max(n(v.finalAbs), 0.0001), 1.0001);
      const k = Math.log(ratio) / (n(v.delay) * 1e-6);
      return { primary: `τ = ${fixed(1e6 / k, 1)} µs`, metrics: [["Rate constant", `${fixed(k / 1000, 2)} ×10³ s⁻¹`], ["Absorbance loss", `${fixed((1 - n(v.finalAbs) / n(v.initialAbs)) * 100, 1)}%`]], note: n(v.finalAbs) >= n(v.initialAbs) ? "Set the delayed absorbance below the initial absorbance for a decay trace." : "The logarithmic decay model assumes one dominant first-order transient." };
    },
    procedure: ["Prepare an optically clear sample and purge if required.", "Set excitation wavelength and pulse energy.", "Record transient absorbance against delay time.", "Fit ln(A₀/Aₜ) and obtain k and τ."],
    safety: "Laser radiation can permanently damage eyes. Use an enclosed beam path, interlocks, wavelength-rated eyewear, and trained supervision.",
  },
  {
    id: "aspirin-estimation",
    title: "Aspirin Estimation",
    topic: "Pharmaceutical Analysis",
    icon: FlaskConical,
    accent: "rose",
    theory: "Aspirin is hydrolysed with a measured excess of alkali. Back-titration of the unused base gives the aspirin content.",
    formula: "% aspirin = (Vᵦ−Vₛ)N × 0.09008 × 100 / m",
    inputs: [
      ["blank", "Blank titre", 5, 50, 0.1, "mL", 28.4],
      ["sample", "Sample titre", 1, 45, 0.1, "mL", 11.2],
      ["normality", "Acid normality", 0.02, 0.5, 0.01, "N", 0.1],
      ["mass", "Tablet powder taken", 0.1, 1, 0.01, "g", 0.2],
    ],
    calculate: (v) => {
      const delta = Math.max(n(v.blank) - n(v.sample), 0);
      const aspirin = delta * n(v.normality) * 0.09008;
      return { primary: `${fixed((aspirin / n(v.mass)) * 100, 2)}% w/w`, metrics: [["Aspirin found", `${fixed(aspirin * 1000, 1)} mg`], ["Titre difference", `${fixed(delta, 1)} mL`]], note: "The factor accounts for two equivalents of alkali consumed per mole of aspirin during neutralisation and hydrolysis." };
    },
    procedure: ["Accurately weigh powdered tablet.", "Add standard alkali and heat to hydrolyse aspirin.", "Cool and back-titrate excess alkali against standard acid.", "Run a reagent blank and calculate percentage purity."],
    safety: "Sodium hydroxide and standard acid are corrosive. Wear eye protection and cool the flask before titration.",
  },
  {
    id: "glucose-estimation",
    title: "Glucose Estimation",
    topic: "Biochemical Analysis",
    icon: BarChart3,
    accent: "amber",
    theory: "The coloured product in a glucose assay follows a calibration line. Correcting the sample absorbance and dilution gives the original concentration.",
    formula: "C = (A−b)/m × dilution factor",
    inputs: [
      ["absorbance", "Sample absorbance", 0.01, 1.5, 0.01, "AU", 0.68],
      ["blank", "Calibration intercept", 0, 0.2, 0.005, "AU", 0.03],
      ["slope", "Calibration slope", 0.1, 2, 0.01, "AU per mg mL⁻¹", 0.74],
      ["dilution", "Dilution factor", 1, 100, 1, "×", 10],
    ],
    calculate: (v) => {
      const diluted = Math.max((n(v.absorbance) - n(v.blank)) / n(v.slope), 0);
      return { primary: `${fixed(diluted * n(v.dilution), 2)} mg mL⁻¹`, metrics: [["Diluted sample", `${fixed(diluted, 3)} mg mL⁻¹`], ["Corrected absorbance", fixed(n(v.absorbance) - n(v.blank), 3)]], note: "Use the same reagent timing and wavelength for standards, blank, and unknown." };
    },
    procedure: ["Prepare blank and glucose standards.", "Develop colour under identical time and temperature conditions.", "Measure absorbance at the specified wavelength.", "Use the calibration line and dilution factor."],
    safety: "Treat unknown biological samples as potentially infectious and dispose of colour reagent according to its SDS.",
  },
  {
    id: "water-physical-analysis",
    title: "Water Analysis — Physical Parameters",
    topic: "Environmental Analysis",
    icon: Droplets,
    accent: "blue",
    theory: "Temperature, turbidity, total dissolved solids and apparent colour are rapid physical indicators of water quality and treatment performance.",
    formula: "Physical Quality Index = weighted turbidity, TDS and colour score",
    inputs: [
      ["temperature", "Temperature", 5, 45, 0.5, "°C", 25],
      ["turbidity", "Turbidity", 0, 100, 0.5, "NTU", 3.2],
      ["tds", "Total dissolved solids", 0, 1500, 10, "mg L⁻¹", 280],
      ["colour", "Apparent colour", 0, 100, 1, "TCU", 8],
    ],
    calculate: (v) => {
      const score = Math.max(0, 100 - n(v.turbidity) * 2.5 - Math.max(n(v.tds) - 300, 0) / 12 - n(v.colour) * 0.5);
      const grade = score >= 85 ? "Good physical quality" : score >= 60 ? "Needs treatment review" : "Poor physical quality";
      return { primary: `${grade} (${fixed(score, 0)}/100)`, metrics: [["Turbidity", `${fixed(n(v.turbidity), 1)} NTU`], ["TDS", `${fixed(n(v.tds), 0)} mg L⁻¹`]], note: "This teaching index is for comparison, not a regulatory potability decision." };
    },
    procedure: ["Collect a representative sample without disturbing sediment.", "Record temperature immediately.", "Calibrate turbidity and conductivity/TDS meters.", "Measure colour against a blank and document appearance."],
    safety: "Do not taste unknown water. Wear gloves when contamination is possible and disinfect reusable probes between samples.",
  },
  {
    id: "water-chemical-analysis",
    title: "Water Analysis — Chemical Parameters",
    topic: "Environmental Analysis",
    icon: Droplets,
    accent: "cyan",
    theory: "pH, hardness, alkalinity, chloride and dissolved oxygen describe buffering, mineral load, salinity and biological condition.",
    formula: "Hardness as CaCO₃ = V_EDTA × M_EDTA × 100,000 / V_sample",
    inputs: [
      ["ph", "Measured pH", 3, 11, 0.1, "", 7.2],
      ["edta", "EDTA titre", 0.1, 30, 0.1, "mL", 8.6],
      ["edtaM", "EDTA molarity", 0.005, 0.05, 0.001, "M", 0.01],
      ["sampleVolume", "Water aliquot", 10, 100, 1, "mL", 50],
    ],
    calculate: (v) => {
      const hardness = n(v.edta) * n(v.edtaM) * 100000 / n(v.sampleVolume);
      const className = hardness < 60 ? "soft" : hardness < 120 ? "moderately hard" : hardness < 180 ? "hard" : "very hard";
      return { primary: `${fixed(hardness, 1)} mg L⁻¹ as CaCO₃`, metrics: [["Hardness class", className], ["pH", fixed(n(v.ph), 1)]], note: n(v.ph) >= 6.5 && n(v.ph) <= 8.5 ? "The entered pH lies in the common operational range used for drinking-water assessment." : "The entered pH warrants further investigation and treatment review." };
    },
    procedure: ["Calibrate the pH meter with bracketing buffers.", "Buffer the aliquot to pH 10 and add Eriochrome Black T.", "Titrate with standardized EDTA to a clear blue endpoint.", "Report hardness as CaCO₃ with the measured pH."],
    safety: "Preservation reagents and buffers can irritate skin and eyes. Follow sample-specific biosafety and chemical-waste procedures.",
  },
  {
    id: "gravimetric-barium",
    title: "Gravimetric Estimation of Barium",
    topic: "Gravimetric Analysis",
    icon: FlaskConical,
    accent: "emerald",
    theory: "Barium is precipitated and weighed as BaSO₄. The gravimetric factor converts the dry precipitate mass to elemental barium.",
    formula: "m(Ba) = m(BaSO₄) × 137.327/233.388",
    inputs: [
      ["crucible", "Empty crucible", 20, 40, 0.0001, "g", 28.4362],
      ["combined", "Crucible + BaSO₄", 20, 42, 0.0001, "g", 28.7826],
      ["sampleMass", "Original sample", 0.1, 2, 0.01, "g", 0.5],
      ["blankMass", "Blank correction", 0, 0.02, 0.0001, "g", 0.0012],
    ],
    calculate: (v) => {
      const ppt = Math.max(n(v.combined) - n(v.crucible) - n(v.blankMass), 0);
      const ba = ppt * 137.327 / 233.388;
      return { primary: `${fixed((ba / n(v.sampleMass)) * 100, 2)}% Ba`, metrics: [["BaSO₄ mass", `${fixed(ppt, 4)} g`], ["Barium mass", `${fixed(ba, 4)} g`]], note: "Digest the precipitate and wash free of chloride before drying or ignition to constant mass." };
    },
    procedure: ["Acidify and heat the barium solution.", "Add sulfate reagent slowly with stirring.", "Digest, filter and wash the BaSO₄ precipitate.", "Dry or ignite to constant mass and apply the factor."],
    safety: "Soluble barium salts are toxic. Avoid ingestion and collect barium-containing waste separately.",
  },
  {
    id: "gravimetric-nickel",
    title: "Gravimetric Estimation of Nickel",
    topic: "Gravimetric Analysis",
    icon: FlaskConical,
    accent: "emerald",
    theory: "Nickel(II) forms a red, sparingly soluble complex with dimethylglyoxime in ammoniacal solution and is weighed as Ni(DMG)₂.",
    formula: "m(Ni) = m[Ni(DMG)₂] × 58.693/288.915",
    inputs: [
      ["filter", "Empty filter crucible", 18, 35, 0.0001, "g", 24.1184],
      ["combined", "Crucible + Ni(DMG)₂", 18, 37, 0.0001, "g", 24.5621],
      ["sampleMass", "Original sample", 0.1, 2, 0.01, "g", 0.6],
      ["blankMass", "Blank correction", 0, 0.02, 0.0001, "g", 0.001],
    ],
    calculate: (v) => {
      const ppt = Math.max(n(v.combined) - n(v.filter) - n(v.blankMass), 0);
      const ni = ppt * 58.6934 / 288.915;
      return { primary: `${fixed((ni / n(v.sampleMass)) * 100, 2)}% Ni`, metrics: [["Ni(DMG)₂ mass", `${fixed(ppt, 4)} g`], ["Nickel mass", `${fixed(ni, 4)} g`]], note: "Control pH near 9 and allow complete precipitation before filtration." };
    },
    procedure: ["Buffer the nickel solution in ammoniacal medium.", "Add alcoholic dimethylglyoxime with stirring.", "Digest and filter the red precipitate.", "Wash, dry to constant mass and calculate nickel."],
    safety: "Nickel compounds are sensitizers and suspected carcinogens. Avoid dust and skin contact; collect heavy-metal waste.",
  },
  {
    id: "brass-alloy-analysis",
    title: "Brass / Alloy Analysis",
    topic: "Alloy Analysis",
    icon: Activity,
    accent: "amber",
    theory: "Copper in dissolved brass can be determined iodometrically; zinc is estimated by difference when other alloying constituents are negligible.",
    formula: "%Cu = V(S₂O₃²⁻) × M × 63.546 × 100 /(1000m)",
    inputs: [
      ["titre", "Thiosulfate titre", 1, 50, 0.1, "mL", 31.6],
      ["molarity", "Thiosulfate molarity", 0.02, 0.2, 0.005, "M", 0.1],
      ["sampleMass", "Brass aliquot equivalent", 0.1, 1, 0.01, "g", 0.3],
      ["other", "Other alloy constituents", 0, 10, 0.1, "%", 2],
    ],
    calculate: (v) => {
      const cu = n(v.titre) * n(v.molarity) * 63.546 / 1000;
      const cuPct = cu / n(v.sampleMass) * 100;
      const znPct = Math.max(100 - cuPct - n(v.other), 0);
      return { primary: `${fixed(cuPct, 2)}% Cu · ${fixed(znPct, 2)}% Zn`, metrics: [["Copper mass", `${fixed(cu, 4)} g`], ["Other constituents", `${fixed(n(v.other), 1)}%`]], note: "The zinc-by-difference result is valid only when stated minor constituents and sampling corrections are included." };
    },
    procedure: ["Dissolve a weighed brass sample under a hood.", "Add excess iodide to liberate iodine from copper(II).", "Titrate iodine with standardized thiosulfate using starch near the endpoint.", "Calculate copper and obtain zinc by validated difference."],
    safety: "Acid dissolution can release corrosive fumes. Use a fume hood and collect copper/zinc waste as heavy-metal waste.",
  },
  {
    id: "soil-conductivity",
    title: "Soil Specific Conductivity",
    topic: "Soil Analysis",
    icon: Leaf,
    accent: "lime",
    theory: "Electrical conductivity of a soil-water extract reflects soluble ionic salts and is corrected to a reference temperature.",
    formula: "EC₂₅ = ECₜ / [1 + 0.02(T−25)]",
    inputs: [
      ["ec", "Measured extract EC", 0.01, 12, 0.01, "dS m⁻¹", 1.42],
      ["temperature", "Measurement temperature", 10, 40, 0.5, "°C", 30],
      ["cellConstant", "Cell constant", 0.5, 2, 0.01, "cm⁻¹", 1],
      ["dilution", "Extract dilution", 1, 10, 1, "×", 1],
    ],
    calculate: (v) => {
      const ec25 = n(v.ec) * n(v.cellConstant) * n(v.dilution) / (1 + 0.02 * (n(v.temperature) - 25));
      const className = ec25 < 2 ? "non-saline" : ec25 < 4 ? "slightly saline" : ec25 < 8 ? "moderately saline" : "strongly saline";
      return { primary: `${fixed(ec25, 2)} dS m⁻¹ at 25 °C`, metrics: [["Salinity class", className], ["Temperature correction", fixed(1 / (1 + 0.02 * (n(v.temperature) - 25)), 3)]], note: "Interpretation depends on extraction ratio and crop tolerance; record the preparation method." };
    },
    procedure: ["Prepare the specified soil-to-water extract.", "Calibrate with a conductivity standard.", "Measure temperature and EC after equilibration.", "Apply cell, dilution and temperature corrections."],
    safety: "Treat field soil as biologically contaminated; wear gloves and control dust.",
  },
  {
    id: "soil-ph",
    title: "Soil pH",
    topic: "Soil Analysis",
    icon: Leaf,
    accent: "lime",
    theory: "A calibrated glass electrode measures hydrogen-ion activity in a defined soil-water suspension.",
    formula: "pH = 7 − E/S (ideal S ≈ 59.16 mV per pH at 25 °C)",
    inputs: [
      ["potential", "Electrode potential", -180, 180, 1, "mV", 42],
      ["slope", "Electrode slope", 50, 62, 0.1, "mV pH⁻¹", 58.6],
      ["offset", "Calibration offset", -0.5, 0.5, 0.01, "pH", 0.02],
      ["ratio", "Water-to-soil ratio", 1, 5, 0.5, ":1", 2.5],
    ],
    calculate: (v) => {
      const ph = 7 - n(v.potential) / n(v.slope) + n(v.offset);
      const className = ph < 5.5 ? "strongly acidic" : ph < 6.5 ? "slightly acidic" : ph <= 7.5 ? "near neutral" : ph <= 8.5 ? "slightly alkaline" : "strongly alkaline";
      return { primary: `pH ${fixed(ph, 2)}`, metrics: [["Soil reaction", className], ["Extraction ratio", `${fixed(n(v.ratio), 1)}:1`]], note: "pH depends on extraction medium and ratio; report both with the result." };
    },
    procedure: ["Air-dry, sieve and homogenize the soil.", "Prepare the specified soil-water suspension.", "Calibrate the meter with two or three buffers.", "Measure after equilibration and record the extraction ratio."],
    safety: "Wear gloves and minimize dust from dried soil. Rinse the electrode without wiping the glass bulb.",
  },
  {
    id: "soil-organic-carbon",
    title: "Soil Organic Carbon — Walkley–Black",
    topic: "Soil Analysis",
    icon: Leaf,
    accent: "lime",
    theory: "Dichromate oxidizes soil organic carbon; unused oxidant is back-titrated and corrected for incomplete oxidation.",
    formula: "%OC = (Vᵦ−Vₛ)N × 0.003 × 1.33 × 100 / m",
    inputs: [
      ["blank", "Blank titre", 5, 30, 0.1, "mL", 20.4],
      ["sample", "Sample titre", 1, 28, 0.1, "mL", 13.7],
      ["normality", "FAS normality", 0.1, 1, 0.01, "N", 0.5],
      ["mass", "Soil mass", 0.1, 2, 0.05, "g", 1],
    ],
    calculate: (v) => {
      const oc = Math.max(n(v.blank) - n(v.sample), 0) * n(v.normality) * 0.003 * 1.33 * 100 / n(v.mass);
      return { primary: `${fixed(oc, 2)}% organic carbon`, metrics: [["Organic matter estimate", `${fixed(oc * 1.724, 2)}%`], ["Titre difference", `${fixed(n(v.blank) - n(v.sample), 1)} mL`]], note: "The 1.33 correction is method-specific; dry-combustion carbon may differ." };
    },
    procedure: ["Weigh air-dry soil into a digestion flask.", "Add dichromate and concentrated sulfuric acid.", "After controlled digestion, dilute and add indicator.", "Back-titrate and apply blank and recovery correction."],
    safety: "Hexavalent chromium is toxic and carcinogenic; concentrated sulfuric acid is highly corrosive. This method requires a hood and hazardous-waste collection.",
  },
  {
    id: "soil-nitrogen-kjeldahl",
    title: "Soil Available Nitrogen — Kjeldahl",
    topic: "Soil Analysis",
    icon: Leaf,
    accent: "lime",
    theory: "Digestion converts nitrogen to ammonium; alkaline distillation releases ammonia for capture and titration.",
    formula: "%N = (Vₛ−Vᵦ)N × 1.4007 / m(g)",
    inputs: [
      ["sample", "Sample titre", 0.1, 30, 0.1, "mL", 8.8],
      ["blank", "Blank titre", 0, 10, 0.1, "mL", 0.6],
      ["normality", "Acid normality", 0.01, 0.2, 0.005, "N", 0.05],
      ["mass", "Soil mass", 0.5, 10, 0.1, "g", 5],
    ],
    calculate: (v) => {
      const pct = Math.max(n(v.sample) - n(v.blank), 0) * n(v.normality) * 1.4007 / n(v.mass);
      return { primary: `${fixed(pct, 3)}% nitrogen`, metrics: [["Nitrogen", `${fixed(pct * 10000, 0)} mg kg⁻¹`], ["Corrected titre", `${fixed(n(v.sample) - n(v.blank), 1)} mL`]], note: "State whether the protocol measures total Kjeldahl nitrogen or an operationally available fraction." };
    },
    procedure: ["Digest soil with acid and catalyst until clear.", "Make alkaline and distil released ammonia.", "Capture ammonia in boric acid.", "Titrate against standard acid and blank-correct."],
    safety: "Hot concentrated acid, alkali, selenium/copper catalysts and ammonia require a hood, face protection and trained supervision.",
  },
  {
    id: "soil-phosphorus-bray",
    title: "Soil Available Phosphorus — Bray",
    topic: "Soil Analysis",
    icon: Leaf,
    accent: "lime",
    theory: "Bray extractant releases an operationally available phosphorus fraction; a molybdenum-blue calibration gives extract concentration.",
    formula: "P (mg kg⁻¹) = C_extract × V_extract(L) × dilution / m_soil(kg)",
    inputs: [
      ["concentration", "Calibration result", 0.01, 10, 0.01, "mg L⁻¹ P", 1.8],
      ["extractVolume", "Extract volume", 10, 100, 1, "mL", 50],
      ["soilMass", "Soil mass", 1, 10, 0.1, "g", 5],
      ["dilution", "Colour dilution", 1, 20, 1, "×", 2],
    ],
    calculate: (v) => {
      const p = n(v.concentration) * (n(v.extractVolume) / 1000) * n(v.dilution) / (n(v.soilMass) / 1000);
      const className = p < 10 ? "low" : p < 25 ? "medium" : "high";
      return { primary: `${fixed(p, 1)} mg kg⁻¹ available P`, metrics: [["Indicative class", className], ["Extract P", `${fixed(n(v.concentration), 2)} mg L⁻¹`]], note: "Bray extraction is most appropriate for acid to neutral soils; calcareous soils need another extractant." };
    },
    procedure: ["Shake soil with Bray extractant for the specified time.", "Filter promptly.", "Develop molybdenum-blue colour with standards and blank.", "Read the calibration and apply mass, volume and dilution factors."],
    safety: "Bray reagents contain acid and fluoride. Use a hood, compatible gloves, and dedicated fluoride waste procedures.",
  },
  {
    id: "soft-drink-phosphate",
    title: "Phosphate in Soft Drinks",
    topic: "Food Analysis",
    icon: BarChart3,
    accent: "rose",
    theory: "Orthophosphate forms a coloured phosphomolybdate complex. Absorbance is converted to phosphate concentration with a calibration line.",
    formula: "C_PO₄ = (A−b)/m × dilution",
    inputs: [
      ["absorbance", "Sample absorbance", 0.01, 1.5, 0.01, "AU", 0.54],
      ["intercept", "Calibration intercept", 0, 0.2, 0.005, "AU", 0.02],
      ["slope", "Calibration slope", 0.001, 0.02, 0.0005, "AU per mg L⁻¹", 0.0065],
      ["dilution", "Sample dilution", 1, 20, 1, "×", 5],
    ],
    calculate: (v) => {
      const c = Math.max(n(v.absorbance) - n(v.intercept), 0) / n(v.slope) * n(v.dilution);
      return { primary: `${fixed(c, 0)} mg L⁻¹ phosphate`, metrics: [["As phosphorus", `${fixed(c * 30.974 / 94.971, 0)} mg L⁻¹ P`], ["Corrected absorbance", fixed(n(v.absorbance) - n(v.intercept), 3)]], note: "Degas coloured drinks and use an appropriate sample blank to correct matrix absorbance." };
    },
    procedure: ["Degas and dilute the soft drink.", "Prepare phosphate standards and a reagent blank.", "Develop phosphomolybdate colour for equal times.", "Measure absorbance and apply the calibration and dilution."],
    safety: "Colour reagents can be acidic and reducing. Wear eye protection and never consume laboratory samples.",
  },
  {
    id: "flame-photometry",
    title: "Flame Photometry",
    topic: "Instrumental Analysis",
    icon: Sparkles,
    accent: "orange",
    theory: "Excited alkali and alkaline-earth atoms emit element-specific light. Within a working range, emission intensity follows concentration.",
    formula: "C_unknown = (I−b)/m × dilution",
    inputs: [
      ["intensity", "Unknown emission", 0, 100, 0.5, "a.u.", 64],
      ["blank", "Calibration intercept", 0, 20, 0.1, "a.u.", 3.2],
      ["slope", "Calibration slope", 0.1, 10, 0.1, "a.u. per mg L⁻¹", 2.4],
      ["dilution", "Dilution factor", 1, 20, 1, "×", 2],
    ],
    calculate: (v) => {
      const c = Math.max(n(v.intensity) - n(v.blank), 0) / n(v.slope) * n(v.dilution);
      return { primary: `${fixed(c, 2)} mg L⁻¹`, metrics: [["Diluted solution", `${fixed(c / n(v.dilution), 2)} mg L⁻¹`], ["Net intensity", fixed(n(v.intensity) - n(v.blank), 1)]], note: n(v.intensity) > 90 ? "The signal is near the top of the working range; dilute and remeasure." : "Bracket the unknown with standards and verify drift using a mid-range check." };
    },
    procedure: ["Select the element filter/wavelength and optimize the flame.", "Aspirate blank and a series of standards.", "Measure the unknown between bracketing standards.", "Apply calibration, dilution and quality-control checks."],
    safety: "Fuel gases, open flame and hot burner parts require leak checks, flashback protection and trained shutdown procedures.",
  },
  {
    id: "polarography-cadmium",
    title: "Cadmium by Polarography",
    topic: "Electroanalytical Chemistry",
    icon: Activity,
    accent: "sky",
    theory: "The diffusion-limited polarographic current is proportional to electroactive cadmium concentration under fixed electrode and medium conditions.",
    formula: "C_Cd = (i_d−i_blank)/sensitivity × dilution",
    inputs: [
      ["current", "Diffusion current", 0.1, 30, 0.1, "µA", 12.8],
      ["blank", "Residual current", 0, 5, 0.05, "µA", 0.8],
      ["sensitivity", "Calibration sensitivity", 0.1, 5, 0.05, "µA per mg L⁻¹", 1.5],
      ["dilution", "Dilution factor", 1, 20, 1, "×", 1],
    ],
    calculate: (v) => {
      const c = Math.max(n(v.current) - n(v.blank), 0) / n(v.sensitivity) * n(v.dilution);
      return { primary: `${fixed(c, 2)} mg L⁻¹ Cd`, metrics: [["Net diffusion current", `${fixed(n(v.current) - n(v.blank), 2)} µA`], ["Indicative E½", "−0.60 V vs SCE"]], note: "Confirm identity from half-wave potential and use standard addition when matrix effects are important." };
    },
    procedure: ["Add supporting electrolyte and remove dissolved oxygen.", "Record the blank polarogram.", "Scan the sample through the cadmium wave.", "Measure diffusion current and use calibration or standard addition."],
    safety: "Cadmium is highly toxic and cumulative. Avoid all contact and aerosols; use a hood and dedicated hazardous-metal waste.",
  },
  {
    id: "polarography-vitamin-c",
    title: "Vitamin C by Polarography",
    topic: "Electroanalytical Chemistry",
    icon: Activity,
    accent: "sky",
    theory: "Ascorbic acid gives a concentration-dependent oxidation current. A fresh calibration converts blank-corrected current to vitamin C content.",
    formula: "C_vitC = (i−i_blank)/sensitivity × dilution",
    inputs: [
      ["current", "Peak/diffusion current", 0.1, 30, 0.1, "µA", 9.6],
      ["blank", "Blank current", 0, 5, 0.05, "µA", 0.6],
      ["sensitivity", "Calibration sensitivity", 0.05, 3, 0.05, "µA per mg L⁻¹", 0.75],
      ["dilution", "Sample dilution", 1, 50, 1, "×", 10],
    ],
    calculate: (v) => {
      const c = Math.max(n(v.current) - n(v.blank), 0) / n(v.sensitivity) * n(v.dilution);
      return { primary: `${fixed(c, 1)} mg L⁻¹ vitamin C`, metrics: [["Net current", `${fixed(n(v.current) - n(v.blank), 2)} µA`], ["Ascorbic acid", `${fixed(c / 10, 2)} mg per 100 mL`]], note: "Prepare standards and extracts freshly, protect them from light, and control pH to limit oxidation." };
    },
    procedure: ["Prepare fresh ascorbic-acid standards and sample extract.", "Add supporting electrolyte and deaerate consistently.", "Record blank, standards and sample polarograms.", "Measure current and calculate with dilution correction."],
    safety: "Follow the electrode manufacturer’s precautions. Mercury electrodes, if used, require closed handling and dedicated mercury waste.",
  },
];

export const EXTENDED_ANALYTICAL_EXPERIMENTS = experimentConfigs.map((item) => ({
  id: item.id,
  title: item.title,
  tab: "Advanced",
  type: "Simulation",
  difficulty: ["water-physical-analysis", "soil-conductivity", "soil-ph"].includes(item.id) ? "Intermediate" : "Advanced",
  icon: item.icon,
  topic: item.topic,
  teaches: item.theory,
  steps: item.procedure,
  tryThis: "Change one measurement and explain how it propagates into the reported result.",
  result: `Complete the ${item.title.toLowerCase()} workflow and interpret the calculated result.`,
  safety: item.safety,
  realWorld: "Used in teaching, quality control, environmental, food, pharmaceutical, or research laboratories.",
}));

const accents = {
  cyan: "from-cyan-500/20 border-cyan-400/25 text-cyan-200",
  violet: "from-violet-500/20 border-violet-400/25 text-violet-200",
  rose: "from-rose-500/20 border-rose-400/25 text-rose-200",
  amber: "from-amber-500/20 border-amber-400/25 text-amber-200",
  blue: "from-blue-500/20 border-blue-400/25 text-blue-200",
  emerald: "from-emerald-500/20 border-emerald-400/25 text-emerald-200",
  lime: "from-lime-500/20 border-lime-400/25 text-lime-200",
  orange: "from-orange-500/20 border-orange-400/25 text-orange-200",
  sky: "from-sky-500/20 border-sky-400/25 text-sky-200",
};

const initialValues = (config) =>
  Object.fromEntries(config.inputs.map(([key, , , , , , value]) => [key, value]));

export default function ExtendedAnalyticalLab({ experimentId }) {
  const config = experimentConfigs.find((item) => item.id === experimentId) || experimentConfigs[0];
  const [values, setValues] = useState(() => initialValues(config));
  const [completed, setCompleted] = useState([]);
  const [note, setNote] = useState("");
  const result = useMemo(() => config.calculate(values), [config, values]);
  const Icon = config.icon;

  const reset = () => {
    setValues(initialValues(config));
    setCompleted([]);
    setNote("");
  };

  const downloadReport = () => {
    const lines = [
      config.title,
      "=".repeat(config.title.length),
      `Theory: ${config.theory}`,
      `Equation: ${config.formula}`,
      "",
      "Measurements:",
      ...config.inputs.map(([key, label, , , , unit]) => `- ${label}: ${values[key]} ${unit}`),
      "",
      `Result: ${result.primary}`,
      ...result.metrics.map(([label, value]) => `- ${label}: ${value}`),
      `Interpretation: ${result.note}`,
      `Observation: ${note || "Not entered"}`,
      "",
      `Safety: ${config.safety}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.id}-report.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div data-extended-analytical-lab={config.id} className="space-y-4">
      <section className={`rounded-2xl border bg-gradient-to-br ${accents[config.accent]} to-slate-950/30 p-4`}>
        <div className="flex flex-wrap items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-white/15 bg-black/20">
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] opacity-70">Interactive analytical bench</p>
            <h4 className="mt-1 text-lg font-black text-white">{config.title}</h4>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-gray-300">{config.theory}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={reset} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 px-2.5 py-2 text-[11px] text-gray-200 hover:bg-white/10"><RotateCcw size={13} /> Reset</button>
            <button type="button" onClick={downloadReport} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2.5 py-2 text-[11px] text-white hover:bg-white/15"><Download size={13} /> Report</button>
          </div>
        </div>
        <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 font-mono text-xs text-cyan-100">{config.formula}</div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2"><Gauge size={15} className="text-cyan-300" /><h5 className="text-sm font-bold text-white">Measurements</h5><span className="ml-auto text-[10px] text-gray-500">Adjust values to recalculate</span></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {config.inputs.map(([key, label, min, max, step, unit]) => (
              <label key={key} className="block rounded-xl border border-white/10 bg-white/[0.035] p-3">
                <span className="flex items-center justify-between gap-2 text-[11px] font-semibold text-gray-300"><span>{label}</span><span className="font-mono text-cyan-200">{values[key]} {unit}</span></span>
                <input type="range" min={min} max={max} step={step} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))} className="mt-3 w-full accent-cyan-400" />
                <div className="mt-2 flex items-center gap-2"><input type="number" min={min} max={max} step={step} value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: Number(event.target.value) }))} className="input min-w-0 flex-1 text-xs" /><span className="text-[10px] text-gray-500">{unit}</span></div>
              </label>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-emerald-400/20 bg-emerald-500/[0.07] p-4">
          <div className="flex items-center gap-2"><Activity size={15} className="text-emerald-300" /><h5 className="text-sm font-bold text-white">Live result</h5></div>
          <p className="mt-4 break-words text-2xl font-black text-emerald-200">{result.primary}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            {result.metrics.map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-black/15 p-3"><p className="text-[10px] uppercase tracking-wider text-gray-500">{label}</p><p className="mt-1 text-sm font-bold text-white">{value}</p></div>)}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-gray-300">{result.note}</p>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_.8fr]">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-300" /><h5 className="text-sm font-bold text-white">Procedure checkpoint</h5><span className="ml-auto text-[10px] text-gray-500">{completed.length}/{config.procedure.length} complete</span></div>
          <div className="space-y-2">
            {config.procedure.map((step, index) => {
              const done = completed.includes(index);
              return <button key={step} type="button" onClick={() => setCompleted((current) => done ? current.filter((item) => item !== index) : [...current, index])} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs transition-colors ${done ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"}`}><span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] ${done ? "border-emerald-300 bg-emerald-400/20" : "border-white/20"}`}>{done ? "✓" : index + 1}</span><span className={done ? "line-through decoration-emerald-400/40" : ""}>{step}</span></button>;
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div className="rounded-2xl border border-amber-400/20 bg-amber-500/[0.07] p-4"><div className="flex items-center gap-2"><ShieldAlert size={15} className="text-amber-300" /><h5 className="text-sm font-bold text-white">Safety & quality</h5></div><p className="mt-2 text-xs leading-relaxed text-amber-50/80">{config.safety}</p></div>
          <label className="block rounded-2xl border border-white/10 bg-black/20 p-4"><span className="text-sm font-bold text-white">Observation note</span><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} placeholder="Record endpoint, colour, replicate agreement, anomalies…" className="input mt-2 resize-y text-xs" /></label>
        </section>
      </div>
    </div>
  );
}
