import { equilibriumH } from "../modules/core-simulations/acidBaseModel.js";
const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
const format = (value, digits = 2) => Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
const enzymeRate = (substrate, vmax = 120, km = 2.4) => (vmax * substrate) / (km + substrate);

export function calculateLab(labId, v, unknownSample) {
  const response = (metrics, summary, visual = { type: "metrics" }) => ({ metrics, summary, visual });
  const metric = (label, value, unit = "") => ({ label, value, unit });

  if (labId === "enzyme-kinetics") {
    const temperatureFactor = Math.exp(-Math.pow((v.temperature - 37) / 20, 2));
    const phFactor = Math.exp(-Math.pow((v.ph - 7.4) / 2.1, 2));
    const vmax = 120 * v.enzyme * temperatureFactor * phFactor;
    const rate = enzymeRate(v.substrate, vmax, 2.4);
    const points = Array.from({ length: 24 }, (_, index) => {
      const x = 0.1 + index * 0.85;
      return [x, enzymeRate(x, vmax, 2.4)];
    });
    return response(
      [metric("Initial rate", format(rate, 1), "µmol min⁻¹"), metric("Apparent Vmax", format(vmax, 1), "µmol min⁻¹"), metric("Km", "2.40", "mM"), metric("v/Vmax", format(rate / vmax, 3))],
      "Rate rises hyperbolically with substrate and approaches Vmax. Temperature and pH are teaching factors because real optima are enzyme-specific.",
      { type: "curve", points, current: [v.substrate, rate], xLabel: "[S] (mM)", yLabel: "Initial rate", title: "Michaelis–Menten response" },
    );
  }
  if (labId === "km-vmax") {
    const rate = enzymeRate(v.substrate, v.vmax, v.km);
    const points = Array.from({ length: 24 }, (_, index) => { const x = 0.2 + index * 0.85; return [x, enzymeRate(x, v.vmax, v.km)]; });
    return response(
      [metric("Predicted v", format(rate, 2), "µmol min⁻¹"), metric("1/Vmax", format(1 / v.vmax, 5), "min µmol⁻¹"), metric("−1/Km", format(-1 / v.km, 3), "mM⁻¹"), metric("Half Vmax at", format(v.km), "mM")],
      "The nonlinear curve is the preferred parameter fit. Reciprocal intercepts are provided for interpretation and diagnostics.",
      { type: "curve", points, current: [v.substrate, rate], xLabel: "[S] (mM)", yLabel: "v", title: "Parameter fit" },
    );
  }
  if (labId === "protein-structure") {
    const thermal = 1 / (1 + Math.exp((v.temperature - 58) / 5));
    const phPenalty = Math.exp(-Math.pow((v.ph - 7) / 3.2, 2));
    const denaturant = 1 / (1 + Math.exp((v.denaturant - 4.5) / 0.8));
    const folded = clamp(0, 1, thermal * phPenalty * denaturant);
    return response(
      [metric("Estimated folded fraction", format(folded * 100, 1), "%"), metric("Structure level", v.level), metric("Relative stability", folded > 0.75 ? "High" : folded > 0.35 ? "Intermediate" : "Low"), metric("Urea", format(v.denaturant, 1), "M")],
      "This teaches competing stabilising and denaturing effects; a real melting curve requires protein-specific measurements.", { type: "protein", folded, level: v.level },
    );
  }
  if (labId === "amino-acid-tests") {
    const positives = { Ninhydrin: ["Glycine", "Tyrosine", "Tryptophan", "Cysteine"], Xanthoproteic: ["Tyrosine", "Tryptophan"], Millon: ["Tyrosine"], "Hopkins–Cole": ["Tryptophan"], Nitroprusside: ["Cysteine"] };
    const colours = { Ninhydrin: "Violet", Xanthoproteic: "Yellow–orange", Millon: "Red", "Hopkins–Cole": "Violet ring", Nitroprusside: "Red–purple" };
    const positive = positives[v.test].includes(v.sample);
    return response(
      [metric("Observation", positive ? colours[v.test] : "No characteristic colour"), metric("Inference", positive ? "Positive" : "Negative"), metric("Sample", v.sample), metric("Test", v.test)],
      positive ? `${v.sample} contains the feature detected by the ${v.test} reaction.` : `A negative ${v.test} result does not exclude other functional groups. Confirm with another test.`,
      { type: "well", positive, colour: colours[v.test] },
    );
  }
  if (labId === "protein-assays") {
    const slopes = { Biuret: 0.34, Bradford: 0.92, Lowry: 0.71, A280: 0.58 };
    const absorbance = v.blank + slopes[v.assay] * v.concentration;
    return response(
      [metric("Predicted absorbance", format(absorbance, 3), "AU"), metric("Blank-corrected A", format(absorbance - v.blank, 3), "AU"), metric("Concentration", format(v.concentration), "mg mL⁻¹"), metric("Calibration status", absorbance <= 1.5 ? "Within teaching range" : "Dilute and repeat")],
      "The slope is a teaching calibration. Actual response varies with protein composition and must be established using standards.",
      { type: "spectrum", value: absorbance, colour: v.assay === "Bradford" ? "#2563eb" : v.assay === "Lowry" ? "#7c3aed" : "#38bdf8" },
    );
  }
  if (labId === "dna-extraction") {
    const theoretical = v.sampleMass * 0.08;
    const yieldUg = theoretical * (v.lysis / 100) * (v.recovery / 100) * (v.wash / 100);
    const purity = clamp(1.2, 2.05, 1.45 + v.wash / 180);
    return response(
      [metric("Recovered DNA", format(yieldUg, 2), "µg"), metric("Overall recovery", format((yieldUg / theoretical) * 100, 1), "%"), metric("Estimated A260/A280", format(purity, 2)), metric("Theoretical DNA", format(theoretical, 2), "µg")],
      "Yield is a mass-balance estimate. A260/A280 near 1.8 is consistent with relatively pure DNA but does not establish integrity.",
      { type: "workflow", stages: [v.lysis, v.recovery, v.wash], labels: ["Lysis", "Precipitation", "Wash"] },
    );
  }
  if (labId === "gel-electrophoresis") {
    const mobilityTerm = Math.max(0.25, 8 - 1.55 * Math.log10(v.fragment));
    const distance = clamp(0.3, 8.5, (v.voltage / 90) * (v.time / 40) * (1.2 / v.agarose) * mobilityTerm);
    const field = v.voltage / 10;
    return response(
      [metric("Estimated migration", format(distance, 2), "cm"), metric("Fragment", format(v.fragment, 0), "bp"), metric("Field estimate", format(field, 1), "V cm⁻¹"), metric("Run warning", field > 12 ? "Heating risk" : "Nominal")],
      "Migration is a teaching approximation; ladders are required because mobility depends on gel, buffer, topology and field.", { type: "gel", distance, fragment: v.fragment },
    );
  }
  if (labId === "pcr") {
    const efficiency = v.efficiency / 100;
    const product = v.copies * Math.pow(1 + efficiency, v.cycles);
    const annealPenalty = Math.exp(-Math.pow((v.annealing - 60) / 10, 2));
    const effective = product * annealPenalty;
    const points = Array.from({ length: v.cycles + 1 }, (_, cycle) => [cycle, Math.log10(Math.max(1, v.copies * Math.pow(1 + efficiency, cycle)))]);
    return response(
      [metric("Theoretical amplicons", format(effective, 0)), metric("Log₁₀ copies", format(Math.log10(Math.max(1, effective)), 2)), metric("Per-cycle multiplier", format(1 + efficiency, 2), "×"), metric("Annealing factor", format(annealPenalty * 100, 1), "%")],
      "The exponential model describes the pre-plateau phase. Real PCR eventually plateaus and specificity cannot be inferred from yield alone.",
      { type: "curve", points, current: [v.cycles, Math.log10(Math.max(1, effective))], xLabel: "Cycle", yLabel: "log₁₀ copies", title: "PCR amplification" },
    );
  }
  if (labId === "restriction-mapping") {
    const plasmid = v.plasmid;
    if (v.siteA <= 0 || v.siteB <= 0 || v.siteA >= plasmid || v.siteB >= plasmid) return response([metric("Cut sites", "Invalid")], "Each site must be inside the DNA length; adjust the site positions.");
    const sites = [...new Set([v.siteA, v.siteB])].sort((a,b)=>a-b);
    const fragments = v.topology === "Circular"
      ? sites.map((site,index)=>(sites[(index+1)%sites.length]-site+plasmid)%plasmid || plasmid)
      : [sites[0], ...sites.slice(1).map((site,index)=>site-sites[index]), plasmid-sites.at(-1)];
    return response(
      [metric("Fragments", fragments.map((x) => `${format(x, 0)} bp`).join(" + ")), metric("Total length", format(fragments.reduce((a, b) => a + b, 0), 0), "bp"), metric("Cut sites", String(sites.length)), metric("Topology", v.topology)],
      "Fragment sizes sum exactly to the DNA length. Coincident sites behave as one cut; partial digestion adds extra bands.", { type: "restriction", plasmid, sites, fragments, topology: v.topology },
    );
  }
  if (labId === "chromatography") {
    const rf = v.soluteDistance / v.frontDistance;
    if (rf > 1) return response([metric("Rf", "Invalid")], "The solute distance exceeds the solvent front. Check the measurements; Rf cannot exceed 1.");
    const resolution = Math.max(0, (v.selectivity - 1) * 5.2);
    return response(
      [metric("Rf", format(rf, 3)), metric("Solvent front", format(v.frontDistance, 1), "cm"), metric("Teaching resolution", format(resolution, 2), "Rs"), metric("Separation quality", resolution >= 1.5 ? "Baseline" : resolution >= 1 ? "Partial" : "Poor")],
      v.mode === "Paper/TLC" ? "Rf is dimensionless and must remain between 0 and 1." : "Column behaviour is a teaching estimate; experimental Rs also depends on efficiency and retention.",
      { type: "chromatography", rf, resolution, mode: v.mode },
    );
  }
  if (labId === "buffer-preparation") {
    const delta = v.addition / 1000, total = v.base + v.acid, ka = 10 ** -v.pka;
    const h = equilibriumH(h => h + v.base + delta - 1e-14/h - total*ka/(ka+h));
    const ph = -Math.log10(h), base = total*ka/(ka+h), acid=total-base;
    const capacityIndex = Math.LN10 * (h + 1e-14/h + total*ka*h/(ka+h)**2);
    return response(
      [metric("Calculated pH", format(ph, 3)), metric("Base/acid ratio", format(base / acid, 3)), metric("Buffer capacity", format(capacityIndex, 4), "mol L⁻¹ pH⁻¹"), metric("Best-use window", `${format(v.pka - 1, 1)}–${format(v.pka + 1, 1)} pH`)],
      "Ideal dilute-solution charge balance includes acid/base addition and water autoionisation, including beyond buffer capacity.", { type: "buffer", ph, pka: v.pka },
    );
  }
  if (labId === "ph-titration") {
    const pka1 = 2.34, pka2 = 9.60, q = v.baseEquivalents;
    const at = (eq) => {
      if (eq < 0.995) return clamp(0, 14, pka1 + Math.log10(Math.max(0.001, eq) / Math.max(0.001, 1 - eq)));
      if (eq <= 1.005) return (pka1 + pka2) / 2;
      return clamp(0, 14, pka2 + Math.log10(Math.max(0.001, eq - 1) / Math.max(0.001, 2 - eq)));
    };
    const ph = at(q);
    const points = Array.from({ length: 80 }, (_, index) => { const eq = 0.01 + index * (1.98 / 79); return [eq, at(eq)]; });
    return response(
      [metric("Predicted pH", format(ph, 2)), metric("pI", "5.97"), metric("pKa₁", "2.34"), metric("pKa₂", "9.60")],
      "The pI of glycine is (2.34 + 9.60)/2 = 5.97. This model omits dilution and endpoint water autoionisation.",
      { type: "curve", points, current: [q, ph], xLabel: "NaOH (equiv)", yLabel: "pH", title: "Glycine titration" },
    );
  }
  if (labId === "spectrophotometry") {
    const concentrationM = v.concentration / 1000;
    const corrected = v.epsilon * v.path * concentrationM;
    const absorbance = corrected + v.blank;
    const transmittance = Math.pow(10, -absorbance) * 100;
    const points = Array.from({ length: 20 }, (_, index) => { const c = index * 0.01; return [c, v.blank + v.epsilon * v.path * (c / 1000)]; });
    return response(
      [metric("Absorbance", format(absorbance, 3), "AU"), metric("Blank-corrected A", format(corrected, 3), "AU"), metric("Transmittance", format(transmittance, 2), "%"), metric("Linearity flag", absorbance <= 1.5 ? "Acceptable teaching range" : "Dilute sample")],
      "A = εbc uses concentration in mol L⁻¹. High absorbance, scattering and polychromatic light cause nonlinearity.",
      { type: "curve", points, current: [v.concentration, absorbance], xLabel: "Concentration (mM)", yLabel: "Absorbance", title: "Beer–Lambert calibration" },
    );
  }
  if (labId === "carbohydrate-tests") {
    const matrix = {
      Molisch: { Glucose: "Violet ring", Fructose: "Violet ring", Sucrose: "Violet ring", Starch: "Violet ring" },
      Benedict: { Glucose: "Brick-red precipitate", Fructose: "Brick-red precipitate", Sucrose: "Blue; no precipitate", Starch: "Blue; no precipitate" },
      Barfoed: { Glucose: "Red precipitate", Fructose: "Red precipitate", Sucrose: "No rapid precipitate", Starch: "Negative" },
      Seliwanoff: { Glucose: "Slow pale pink", Fructose: "Rapid cherry red", Sucrose: "Cherry red after hydrolysis", Starch: "Negative" },
      Iodine: { Glucose: "Yellow-brown", Fructose: "Yellow-brown", Sucrose: "Yellow-brown", Starch: "Blue-black" },
    };
    const observation = v.heating === 0 && ["Benedict", "Barfoed", "Seliwanoff"].includes(v.test) ? "Reaction incomplete without heating" : matrix[v.test][v.sample];
    return response(
      [metric("Observation", observation), metric("Sample", v.sample), metric("Test", v.test), metric("Heating", format(v.heating, 1), "min")],
      "Use several tests: no single classical colour reaction establishes identity with analytical specificity.",
      { type: "well", positive: !/Negative|no.*precipitate|Yellow-brown|incomplete/i.test(observation), colour: observation },
    );
  }
  if (labId === "lipid-analysis") {
    const isLipid = v.sample !== "Glucose solution";
    const observations = { "Sudan III": isLipid ? "Red-stained lipid layer" : "No separated red lipid layer", Emulsion: isLipid ? "Milky-white emulsion" : "Clear solution", Saponification: v.sample === "Vegetable oil" ? "Soap forms after heating with alkali" : "No triacylglycerol soap yield", "Grease spot": isLipid ? "Persistent translucent spot" : "Spot disappears on drying" };
    const observation = observations[v.test];
    return response(
      [metric("Observation", observation), metric("Inference", isLipid ? "Lipid-compatible" : "Negative control"), metric("Sample volume", format(v.sampleVolume, 1), "mL"), metric("Test", v.test)],
      "Qualitative lipid tests indicate hydrophobic material but do not identify a lipid class without further analysis.", { type: "well", positive: isLipid, colour: observation },
    );
  }
  if (labId === "clinical-analyzer") {
    const calibrators = {
      Glucose: [100, "mg dL⁻¹"], Urea: [50, "mg dL⁻¹"], Creatinine: [2, "mg dL⁻¹"],
      Bilirubin: [5, "mg dL⁻¹"], Cholesterol: [200, "mg dL⁻¹"], Triglycerides: [200, "mg dL⁻¹"],
      "Total protein": [6, "g dL⁻¹"],
    };
    const [calibrator, unit] = calibrators[v.analyte];
    const denominator = v.standardA - v.blank;
    const concentration = denominator > 0 ? calibrator * (v.unknownA - v.blank) / denominator : 0;
    const valid = denominator > 0 && v.unknownA > v.blank;
    return response(
      [metric("Calculated result", valid ? format(concentration, 2) : "Invalid", unit), metric("Calibrator", format(calibrator, 1), unit), metric("Unknown net A", format(v.unknownA - v.blank, 3), "AU"), metric("QC status", valid ? "Calculation valid" : "Check blank/standard")],
      "Educational only. Clinical interpretation requires validated controls, method-specific units and reference intervals.",
      { type: "analyzer", standard: Math.max(0, denominator), unknown: Math.max(0, v.unknownA - v.blank), analyte: v.analyte },
    );
  }
  if (labId === "metabolic-pathways") {
    const oxygenFactor = v.pathway === "Glycolysis" ? 0.35 + 0.65 * v.oxygen / 100 : v.oxygen / 100;
    const flux = 100 * v.substrate * oxygenFactor * (1 - v.inhibition / 100);
    const atpBase = { Glycolysis: 2, "TCA cycle": 10, "β-oxidation": 14, "Urea cycle": -4 }[v.pathway];
    const atp = atpBase * v.substrate * (1 - v.inhibition / 100);
    return response(
      [metric("Relative flux", format(flux, 1), "% baseline"), metric("ATP equivalent", format(atp, 1), "per teaching unit"), metric("Oxygen dependence", v.pathway === "Glycolysis" ? "Indirect" : "Strong/indirect via ETC"), metric("Pathway", v.pathway)],
      "This is a conceptual steady-state model that distinguishes pathway stoichiometry from distributed cellular control.", { type: "pathway", pathway: v.pathway, flux },
    );
  }
  if (labId === "atp-energy") {
    const ideal = 2.5 * v.nadh + 1.5 * v.fadh2;
    const atp = ideal * v.coupling / 100 * v.gradient / 100;
    return response(
      [metric("Estimated ATP", format(atp, 2), "mol"), metric("Ideal P/O yield", format(ideal, 2), "mol ATP"), metric("Coupled yield", format(atp / Math.max(1, v.nadh + v.fadh2), 2), "ATP/carrier"), metric("Energy loss", format(ideal - atp, 2), "ATP equivalent")],
      "2.5 and 1.5 are conventional approximate P/O ratios, not exact universal constants.", { type: "atp", gradient: v.gradient, coupling: v.coupling },
    );
  }
  if (labId === "enzyme-inhibitors") {
    const vmax = 120, km = 2.4, alpha = 1 + v.inhibitor / v.ki;
    let apparentVmax = vmax, apparentKm = km;
    if (v.inhibitorType === "Competitive") apparentKm = km * alpha;
    if (v.inhibitorType === "Noncompetitive") apparentVmax = vmax / alpha;
    if (v.inhibitorType === "Uncompetitive") { apparentVmax = vmax / alpha; apparentKm = km / alpha; }
    if (v.inhibitorType === "Irreversible") apparentVmax = vmax * Math.exp(-v.inhibitor / Math.max(0.1, v.ki));
    const rate = enzymeRate(v.substrate, apparentVmax, apparentKm);
    const points = Array.from({ length: 24 }, (_, index) => { const x = 0.1 + index * 0.85; return [x, enzymeRate(x, apparentVmax, apparentKm)]; });
    return response(
      [metric("Initial rate", format(rate, 2), "µmol min⁻¹"), metric("Apparent Vmax", format(apparentVmax, 2), "µmol min⁻¹"), metric("Apparent Km", format(apparentKm, 2), "mM"), metric("α", format(alpha, 2))],
      "The model assumes idealised pure inhibition types. Mixed inhibition requires separate α and α′ terms.",
      { type: "curve", points, current: [v.substrate, rate], xLabel: "[S] (mM)", yLabel: "v", title: `${v.inhibitorType} inhibition` },
    );
  }
  if (labId === "enzyme-stability") {
    const immediate = Math.exp(-Math.pow((v.temperature - 37) / 21, 2)) * Math.exp(-Math.pow((v.ph - 7.4) / 2.3, 2));
    const heatDamage = v.temperature > 45 ? Math.exp(-((v.temperature - 45) / 28) * (v.incubation / 45)) : 1;
    const phDamage = Math.exp(-Math.max(0, Math.abs(v.ph - 7.4) - 2.2) * v.incubation / 260);
    const residual = (v.condition === "Return to optimum" ? heatDamage * phDamage : immediate * heatDamage * phDamage) * 100;
    return response(
      [metric("Residual activity", format(residual, 1), "%"), metric("Immediate activity factor", format(immediate * 100, 1), "%"), metric("Persistent stability", format(heatDamage * phDamage * 100, 1), "%"), metric("Recovery protocol", v.condition)],
      "The curve is a teaching model. Real denaturation kinetics and reversibility must be measured for each enzyme.", { type: "stability", residual, temperature: v.temperature, ph: v.ph },
    );
  }
  if (labId === "protein-purification") {
    const factors = { "Ammonium sulfate": [0.86, 1.7], Dialysis: [0.95, 1.08], "Ion exchange": [0.78, 3.2], "Gel filtration": [0.82, 2.1], "Affinity chromatography": [0.68, 8.5] };
    const [yieldFactor, purityFactor] = factors[v.technique];
    const recovered = v.startingYield * Math.pow(yieldFactor, v.steps);
    const purity = clamp(0, 99.9, v.startingPurity * Math.pow(purityFactor, v.steps));
    return response(
      [metric("Target recovered", format(recovered, 1), "mg"), metric("Yield", format(recovered / v.startingYield * 100, 1), "%"), metric("Estimated purity", format(purity, 1), "%"), metric("Fold purification", format(purity / v.startingPurity, 2), "×")],
      "Technique factors are transparent teaching values. Actual purification tables use measured target activity and total protein.", { type: "purification", yield: recovered / v.startingYield * 100, purity },
    );
  }
  if (labId === "unknown-sample") {
    const positiveTest = { Glucose: "Benedict", Starch: "Iodine", Albumin: "Biuret", "Vegetable oil": "Sudan III" }[unknownSample];
    const positive = v.test === positiveTest;
    const verdict = v.hypothesis === "Uncertain" ? "Awaiting identification" : v.hypothesis === unknownSample ? "Identification supported" : "Identification not supported";
    return response(
      [metric("Test result", positive ? "Positive" : "Negative"), metric("Observation", positive ? "Characteristic reaction present" : "No characteristic reaction"), metric("Hypothesis verdict", verdict), metric("Evidence collected", v.test)],
      "Use at least one positive result and an orthogonal negative or confirmatory result before identifying an unknown.", { type: "unknown", positive, test: v.test, verdict },
    );
  }
  if (labId === "pipetting-dilution") {
    const delivered = v.v1 * (1 + v.error / 100);
    if (delivered > v.v2) return response([metric("Final concentration C₂", "Invalid")], "Final volume must be at least the delivered stock volume for a dilution.");
    const c2 = v.c1 * delivered / v.v2;
    const ranges = { P20: [2, 20], P200: [20, 200], P1000: [100, 1000] };
    const [min, max] = ranges[v.pipette];
    const suitable = v.v1 >= min && v.v1 <= max;
    return response(
      [metric("Final concentration C₂", format(c2, 4), "mM"), metric("Delivered volume", format(delivered, 1), "µL"), metric("Dilution factor", format(v.v2 / delivered, 2), "×"), metric("Pipette choice", suitable ? "Within nominal range" : `Choose ${v.v1 < 20 ? "P20" : v.v1 <= 200 ? "P200" : "P1000"}`)],
      "C₁V₁ = C₂V₂ conserves solute. Random and systematic pipetting errors propagate into concentration.", { type: "pipette", fill: clamp(0, 100, delivered / max * 100), suitable },
    );
  }
  if (labId === "lab-notebook") {
    return response(
      [metric("Record classification", v.recordType), metric("Evidence confidence", `${v.quality}/5`), metric("Traceability", v.quality >= 4 ? "Strong" : v.quality >= 2 ? "Developing" : "Weak"), metric("Export formats", "CSV + print/PDF")],
      "A reproducible record includes purpose, conditions, units, raw observations, calculations, deviations and interpretation.", { type: "notebook", quality: v.quality },
    );
  }
  const score = 0.2 * v.safetyScore + 0.3 * v.protocolScore + 0.3 * v.resultScore + 0.2 * v.conceptScore;
  return response(
    [metric("Weighted skill score", format(score, 1), "%"), metric("Safety contribution", format(v.safetyScore * 0.2, 1), "points"), metric("Procedure + results", format(v.protocolScore * 0.3 + v.resultScore * 0.3, 1), "points"), metric("Level", score >= 85 ? "Proficient" : score >= 65 ? "Developing" : "Needs practice")],
    "The transparent weighting supports formative feedback and is not a certification of practical competence.", { type: "assessment", score },
  );
}
