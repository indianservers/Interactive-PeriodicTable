import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart3, Beaker, BookOpen, CheckCircle2, ChevronLeft, ChevronRight,
  ClipboardCheck, Download, FlaskConical, GraduationCap, Play, Printer,
  Maximize2, RotateCcw, Search, ShieldCheck, Shuffle,
} from "lucide-react";
import {
  BIOCHEMISTRY_LAB_CATEGORIES, BIOCHEMISTRY_VIRTUAL_LABS, defaultValuesForLab,
} from "../data/biochemistryVirtualLabs.js";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./BiochemistryTargetPage.css";

const STRUCTURE_LABS = new Set(["enzyme-kinetics", "km-vmax", "protein-structure", "enzyme-inhibitors", "enzyme-stability", "protein-purification"]);
const LYSOZYME_SOURCE = { url: "/assets/biochemistry/structures/1HEW.cif", label: "PDB 1HEW local cache" };

const clamp = (min, max, value) => Math.min(max, Math.max(min, value));
const format = (value, digits = 2) => Number(value).toLocaleString(undefined, { maximumFractionDigits: digits });
const enzymeRate = (substrate, vmax = 120, km = 2.4) => (vmax * substrate) / (km + substrate);

function calculateLab(labId, v, unknownSample) {
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
    const sites = [clamp(1, plasmid - 2, v.siteA), clamp(2, plasmid - 1, v.siteB)].sort((a, b) => a - b);
    if (sites[0] === sites[1]) sites[1] += 1;
    const fragments = v.topology === "Circular" ? [sites[1] - sites[0], plasmid - (sites[1] - sites[0])] : [sites[0], sites[1] - sites[0], plasmid - sites[1]];
    return response(
      [metric("Fragments", fragments.map((x) => `${format(x, 0)} bp`).join(" + ")), metric("Total length", format(fragments.reduce((a, b) => a + b, 0), 0), "bp"), metric("Cut sites", "2"), metric("Topology", v.topology)],
      "Fragment sizes sum exactly to the DNA length. Coincident sites behave as one cut; partial digestion adds extra bands.", { type: "restriction", plasmid, sites, fragments, topology: v.topology },
    );
  }
  if (labId === "chromatography") {
    const rf = clamp(0, 1, v.soluteDistance / v.frontDistance);
    const resolution = Math.max(0, (v.selectivity - 1) * 5.2);
    return response(
      [metric("Rf", format(rf, 3)), metric("Solvent front", format(v.frontDistance, 1), "cm"), metric("Teaching resolution", format(resolution, 2), "Rs"), metric("Separation quality", resolution >= 1.5 ? "Baseline" : resolution >= 1 ? "Partial" : "Poor")],
      v.mode === "Paper/TLC" ? "Rf is dimensionless and must remain between 0 and 1." : "Column behaviour is a teaching estimate; experimental Rs also depends on efficiency and retention.",
      { type: "chromatography", rf, resolution, mode: v.mode },
    );
  }
  if (labId === "buffer-preparation") {
    const delta = v.addition / 1000;
    const base = Math.max(1e-5, v.base + delta);
    const acid = Math.max(1e-5, v.acid - delta);
    const ph = v.pka + Math.log10(base / acid);
    const capacityIndex = 2.303 * (base * acid) / (base + acid);
    return response(
      [metric("Calculated pH", format(ph, 3)), metric("Base/acid ratio", format(base / acid, 3)), metric("Capacity index", format(capacityIndex, 4), "mol L⁻¹"), metric("Best-use window", `${format(v.pka - 1, 1)}–${format(v.pka + 1, 1)} pH`)],
      "Henderson–Hasselbalch is most reliable when both conjugate forms are appreciable and activities approximate concentrations.", { type: "buffer", ph, pka: v.pka },
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
      { type: "well", positive: !/Negative|no precipitate|Yellow-brown|incomplete/i.test(observation), colour: observation },
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

function CurveVisual({ visual }) {
  const xs = visual.points.map(([x]) => x), ys = visual.points.map(([, y]) => y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs), yMin = Math.min(0, ...ys), yMax = Math.max(...ys, 1);
  const point = ([x, y]) => [42 + ((x - xMin) / Math.max(1e-9, xMax - xMin)) * 416, 196 - ((y - yMin) / Math.max(1e-9, yMax - yMin)) * 160];
  const path = visual.points.map((p, index) => `${index ? "L" : "M"}${point(p).join(" ")}`).join(" ");
  const current = point(visual.current);
  return <figure className="bio-vl-chart"><figcaption>{visual.title}</figcaption><svg viewBox="0 0 500 230" role="img" aria-label={`${visual.title}, ${visual.xLabel} versus ${visual.yLabel}`}>
    {[0, 1, 2, 3, 4].map((i) => <line key={i} x1="42" x2="458" y1={36 + i * 40} y2={36 + i * 40} />)}
    <path className="bio-axis" d="M42 22V196H468" /><path className="bio-curve-line" d={path} /><circle className="bio-current-point" cx={current[0]} cy={current[1]} r="6" />
    <text x="210" y="224">{visual.xLabel}</text><text x="12" y="120" transform="rotate(-90 12 120)">{visual.yLabel}</text>
  </svg></figure>;
}

function LabVisual({ visual }) {
  if (visual.type === "curve") return <CurveVisual visual={visual} />;
  if (visual.type === "protein") return <div className="bio-protein-model" role="img" aria-label={`${visual.level} structure, ${format(visual.folded * 100, 0)} percent folded`}><div className={`bio-protein-chain ${visual.folded < 0.45 ? "is-unfolded" : ""}`}>{Array.from({ length: 18 }, (_, i) => <span key={i} style={{ "--i": i }} />)}</div><strong>{visual.level} structure</strong><small>{format(visual.folded * 100, 0)}% folded in the teaching model</small></div>;
  if (visual.type === "gel") return <div className="bio-gel" role="img" aria-label={`Gel lane with ${visual.fragment} base-pair band migrated ${format(visual.distance)} centimetres`}><div className="bio-gel-well" /><div className="bio-gel-band" style={{ top: `${18 + visual.distance * 8}%` }} /><span>{format(visual.fragment, 0)} bp</span></div>;
  if (visual.type === "restriction") return <div className={`bio-restriction ${visual.topology.toLowerCase()}`} role="img" aria-label={`${visual.topology} DNA restriction map`}><div className="bio-dna-map"><i /><i /><strong>{format(visual.plasmid, 0)} bp</strong></div><p>{visual.fragments.map((x) => `${format(x, 0)} bp`).join(" · ")}</p></div>;
  if (visual.type === "workflow") return <div className="bio-workflow">{visual.stages.map((stage, i) => <div key={visual.labels[i]}><span style={{ width: `${stage}%` }} /><b>{visual.labels[i]}</b><small>{format(stage, 0)}%</small></div>)}</div>;
  if (visual.type === "chromatography") return <div className="bio-chromatogram"><div className="bio-front" /><div className="bio-spot" style={{ bottom: `${12 + visual.rf * 72}%` }} /><span>Rf {format(visual.rf, 2)}</span></div>;
  if (visual.type === "pathway") return <div className="bio-pathway" aria-label={`${visual.pathway} pathway at ${format(visual.flux)} percent flux`}><span>Substrate</span><i style={{ opacity: clamp(0.15, 1, visual.flux / 100) }}>→</i><span>{visual.pathway}</span><i style={{ opacity: clamp(0.15, 1, visual.flux / 100) }}>→</i><span>Products</span></div>;
  if (visual.type === "atp") return <div className="bio-atp"><div style={{ "--charge": `${visual.gradient}%` }}>ATP</div><p>Proton gradient {format(visual.gradient, 0)}% · coupling {format(visual.coupling, 0)}%</p></div>;
  if (visual.type === "well" || visual.type === "unknown") return <div className={`bio-test-well ${visual.positive ? "positive" : "negative"}`}><div /><strong>{visual.positive ? "Positive reaction" : "Negative reaction"}</strong><small>{visual.colour || visual.test}</small></div>;
  if (visual.type === "spectrum") return <div className="bio-spectrum"><div style={{ height: `${clamp(6, 96, visual.value * 62)}%`, background: visual.colour }} /><span>Absorbance response</span></div>;
  if (visual.type === "analyzer") return <div className="bio-analyzer"><div><span style={{ height: `${clamp(4, 95, visual.standard * 70)}%` }} />Standard</div><div><span style={{ height: `${clamp(4, 95, visual.unknown * 70)}%` }} />Unknown</div><strong>{visual.analyte}</strong></div>;
  if (visual.type === "buffer") return <div className="bio-ph-meter"><span>pH</span><strong>{format(visual.ph, 3)}</strong><small>pKa {format(visual.pka, 2)}</small></div>;
  if (visual.type === "stability") return <div className="bio-stability"><div style={{ "--activity": `${visual.residual}%` }}><span /></div><strong>{format(visual.residual, 1)}% activity</strong><small>{visual.temperature}°C · pH {visual.ph}</small></div>;
  if (visual.type === "purification") return <div className="bio-purification"><div><span style={{ width: `${visual.yield}%` }} />Yield {format(visual.yield, 1)}%</div><div><span style={{ width: `${visual.purity}%` }} />Purity {format(visual.purity, 1)}%</div></div>;
  if (visual.type === "pipette") return <div className={`bio-pipette ${visual.suitable ? "valid" : "invalid"}`}><div><span style={{ height: `${visual.fill}%` }} /></div><strong>{visual.suitable ? "Suitable range" : "Change pipette"}</strong></div>;
  if (visual.type === "notebook") return <div className="bio-notebook-visual"><BookOpen /><strong>Evidence confidence</strong><span>{"●".repeat(visual.quality)}{"○".repeat(5 - visual.quality)}</span></div>;
  if (visual.type === "assessment") return <div className="bio-score-ring" style={{ "--score": visual.score }}><strong>{format(visual.score, 0)}%</strong><span>weighted score</span></div>;
  return <BarChart3 size={72} aria-hidden="true" />;
}

function StructureLabVisual({ activeId, step, notice }) {
  const viewerRef = useRef(null);
  const [representation, setRepresentation] = useState("Surface");
  const [selectedAtom, setSelectedAtom] = useState(null);
  const guidedResidue = [null, 35, 52, 35][Math.min(step, 3)];
  const structureRepresentation = useMemo(() => ({
    Surface: representation === "Surface",
    Cartoon: representation === "Cartoon",
    BallAndStick: representation === "Atoms",
  }), [representation]);
  const lesson = activeId === "protein-structure"
    ? "Inspect the experimental fold; the simulation variables remain an educational stability model."
    : activeId === "enzyme-inhibitors"
      ? "Tri-N-acetylchitotriose is the experimentally bound inhibitor in this structure."
      : "1HEW is a structural reference; it does not generate the Michaelis–Menten calculation below.";
  return <div className="biovl-structure-stage">
    <div className="biovl-structure-meta"><div><b>Hen egg-white lysozyme · inhibitor complex</b><span>PDB 1HEW · X-ray diffraction · 1.75 Å · Gallus gallus</span></div><em>Experimental structure</em></div>
    <div className="biovl-structure-view"><ViewerErrorBoundary><MolstarViewer ref={viewerRef} source={LYSOZYME_SOURCE} sourceType="mmcif" label="Lysozyme inhibitor complex" pdbId="1HEW" representation={structureRepresentation} colorScheme="chain" selectedChain="A" selectedResidue={guidedResidue} highlightedResidues={[35, 52]} focusOnSelection={Number.isFinite(guidedResidue)} focusLigandId="NAG" focusLigandChain="B" showLabels={false} onSelectionChange={setSelectedAtom} onLoadError={(error) => notice(error.message)} /></ViewerErrorBoundary></div>
    <div className="biovl-structure-toolbar">{["Surface", "Cartoon", "Atoms"].map((item) => <button key={item} className={representation === item ? "active" : ""} onClick={() => setRepresentation(item)}>{item}</button>)}<button onClick={() => viewerRef.current?.focusLigandId("NAG", "B")}>Focus inhibitor</button><button onClick={() => viewerRef.current?.reset()}><RotateCcw /> Reset</button><button aria-label="Fullscreen molecular structure" onClick={() => viewerRef.current?.fullscreen()}><Maximize2 /></button></div>
    <div className="biovl-structure-inspector"><span>{selectedAtom ? `${selectedAtom.residueName} ${selectedAtom.residue} · chain ${selectedAtom.chain} · ${selectedAtom.atom}` : guidedResidue ? `Protocol focus: catalytic residue ${guidedResidue}` : "Ligand-focused experimental reference"}</span><small>{lesson}</small></div>
  </div>;
}

function downloadText(name, text, type = "text/plain") {
  const href = URL.createObjectURL(new Blob([text], { type }));
  const anchor = document.createElement("a");
  anchor.href = href; anchor.download = name; anchor.click(); URL.revokeObjectURL(href);
}

export default function BiochemistryTargetPage({ onNavigate }) {
  const [activeId, setActiveId] = useState(BIOCHEMISTRY_VIRTUAL_LABS[0].id);
  const activeLab = BIOCHEMISTRY_VIRTUAL_LABS.find((lab) => lab.id === activeId) || BIOCHEMISTRY_VIRTUAL_LABS[0];
  const [values, setValues] = useState(() => defaultValuesForLab(activeLab));
  const [category, setCategory] = useState("All"), [query, setQuery] = useState(""), [difficulty, setDifficulty] = useState("Intermediate");
  const [safe, setSafe] = useState(false), [step, setStep] = useState(0), [running, setRunning] = useState(false), [progress, setProgress] = useState(0);
  const [history, setHistory] = useState([]);
  const [notes, setNotes] = useState(() => { try { return JSON.parse(localStorage.getItem("biochemistry-vl-notes") || "{}"); } catch { return {}; } });
  const [notebookTab, setNotebookTab] = useState("Observations"), [quizChoice, setQuizChoice] = useState(null), [quizChecked, setQuizChecked] = useState(false);
  const [quizResults, setQuizResults] = useState({}), [unknownSample, setUnknownSample] = useState("Albumin"), [notice, setNotice] = useState("");
  const result = useMemo(() => calculateLab(activeId, values, unknownSample), [activeId, values, unknownSample]);
  const filteredLabs = useMemo(() => BIOCHEMISTRY_VIRTUAL_LABS.filter((lab) => (category === "All" || lab.category === category) && `${lab.title} ${lab.objective} ${lab.category}`.toLowerCase().includes(query.trim().toLowerCase())), [category, query]);

  useEffect(() => { localStorage.setItem("biochemistry-vl-notes", JSON.stringify(notes)); }, [notes]);
  useEffect(() => { if (!running) return undefined; const timer = window.setInterval(() => setProgress((current) => Math.min(100, current + 10)), 100); return () => window.clearInterval(timer); }, [running]);
  useEffect(() => {
    if (!running || progress < 100) return;
    setRunning(false);
    setHistory((items) => [{ id: `${Date.now()}-${activeId}`, time: new Date().toLocaleTimeString(), labId: activeId, lab: activeLab.title, parameters: { ...values }, result: result.metrics.map((item) => `${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`).join("; ") }, ...items].slice(0, 50));
    setNotice("Experiment completed and recorded in the notebook.");
  }, [progress, running, activeId, activeLab.title, values, result.metrics]);
  useEffect(() => { if (!notice) return undefined; const timer = window.setTimeout(() => setNotice(""), 2600); return () => window.clearTimeout(timer); }, [notice]);

  const chooseLab = (lab) => { setActiveId(lab.id); setValues(defaultValuesForLab(lab)); setSafe(false); setStep(0); setProgress(0); setRunning(false); setQuizChoice(null); setQuizChecked(false); };
  const randomize = () => {
    const next = {};
    activeLab.controls.forEach((control) => {
      if (control.type === "select") next[control.key] = control.options[Math.floor(Math.random() * control.options.length)];
      else { const steps = Math.floor((control.max - control.min) / control.step); next[control.key] = Number((control.min + Math.floor(Math.random() * (steps + 1)) * control.step).toFixed(6)); }
    });
    if (activeId === "unknown-sample") { const samples = ["Glucose", "Starch", "Albumin", "Vegetable oil"]; setUnknownSample(samples[Math.floor(Math.random() * samples.length)]); }
    setValues(next); setNotice("A new sample and parameter set is ready.");
  };
  const exportCsv = () => {
    const rows = [["Time", "Lab", "Parameters", "Result"], ...history.map((item) => [item.time, item.lab, JSON.stringify(item.parameters), item.result])];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    downloadText("biochemistry-virtual-lab-notebook.csv", csv, "text/csv");
  };
  const answerQuiz = () => { if (quizChoice === null) return; const correct = quizChoice === activeLab.quiz.answer; setQuizChecked(true); setQuizResults((scores) => ({ ...scores, [activeId]: correct })); setNotice(correct ? "Correct — concept check passed." : "Review the explanation and try again."); };
  const completedCount = Object.values(quizResults).filter(Boolean).length;
  const currentNotes = notes[activeId] || { Hypothesis: "", Observations: "", Conclusion: "", "Instructor feedback": "" };

  return <div className="biovl-page">
    <header className="biovl-header">
      <button className="biovl-brand" onClick={() => onNavigate?.("virtual-labs")} aria-label="Return to Virtual Labs home"><span><FlaskConical /></span><div><strong>Biochemistry Virtual Lab</strong><small>25 interactive investigations</small></div></button>
      <label className="biovl-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search labs, methods, or concepts" /></label>
      <label className="biovl-level">Level<select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <div className="biovl-progress"><span>{completedCount}/25 checks</span><div><i style={{ width: `${completedCount * 4}%` }} /></div></div>
    </header>
    <div className="biovl-layout">
      <aside className="biovl-catalog">
        <div className="biovl-catalog-head"><div><span>LAB LIBRARY</span><strong>{filteredLabs.length} investigations</strong></div><button onClick={() => { setCategory("All"); setQuery(""); }}><RotateCcw /> Clear</button></div>
        <div className="biovl-category-row">{["All", ...BIOCHEMISTRY_LAB_CATEGORIES].map((item) => <button key={item} className={category === item ? "active" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div>
        <nav aria-label="Biochemistry virtual labs">{filteredLabs.map((lab) => <button key={lab.id} className={activeId === lab.id ? "active" : ""} onClick={() => chooseLab(lab)}><span>{String(BIOCHEMISTRY_VIRTUAL_LABS.indexOf(lab) + 1).padStart(2, "0")}</span><div><strong>{lab.title}</strong><small>{lab.category}</small></div>{quizResults[lab.id] && <CheckCircle2 className="complete" />}</button>)}{!filteredLabs.length && <p className="biovl-empty">No labs match this search.</p>}</nav>
      </aside>
      <main className="biovl-workbench">
        <section className="biovl-titlebar"><div><span>{activeLab.category} · {difficulty}</span><h1>{activeLab.title}</h1><p>{activeLab.objective}</p></div><div className="biovl-title-actions"><button onClick={randomize}><Shuffle /> Randomise sample</button></div></section>
        <section className="biovl-simulation-grid">
          <div className="biovl-visual-card"><div className="biovl-card-label"><Beaker /> {STRUCTURE_LABS.has(activeId) ? "LIVE MOLECULAR REFERENCE" : "LIVE EXPERIMENT"} <span>{running ? "Running" : progress === 100 ? "Complete" : "Ready"}</span></div>{STRUCTURE_LABS.has(activeId) ? <StructureLabVisual activeId={activeId} step={step} notice={setNotice} /> : <LabVisual visual={result.visual} />}<div className="biovl-progress-line"><span style={{ width: `${progress}%` }} /></div><div className="biovl-actions"><button className="primary" disabled={!safe || running} onClick={() => { setProgress(0); setRunning(true); setNotice("Experiment running…"); }}><Play /> {running ? "Running…" : "Run experiment"}</button><button onClick={() => { setValues(defaultValuesForLab(activeLab)); setProgress(0); }}><RotateCcw /> Reset</button></div></div>
          <div className="biovl-controls-card"><div className="biovl-card-label"><BarChart3 /> VARIABLES</div><div className="biovl-controls">{activeLab.controls.map((control) => <label key={control.key}><span>{control.label}<output>{values[control.key]}{control.unit ? ` ${control.unit}` : ""}</output></span>{control.type === "select" ? <select value={values[control.key]} onChange={(event) => setValues((current) => ({ ...current, [control.key]: event.target.value }))}>{control.options.map((option) => <option key={option}>{option}</option>)}</select> : <input type="range" min={control.min} max={control.max} step={control.step} value={values[control.key]} onInput={(event) => setValues((current) => ({ ...current, [control.key]: Number(event.target.value) }))} onChange={(event) => setValues((current) => ({ ...current, [control.key]: Number(event.target.value) }))} aria-valuetext={`${values[control.key]} ${control.unit}`} />}</label>)}</div><label className={`biovl-safety-check ${safe ? "checked" : ""}`}><input type="checkbox" checked={safe} onChange={(event) => setSafe(event.target.checked)} /><ShieldCheck /><span><strong>Safety checkpoint</strong><small>{activeLab.safety}</small></span></label></div>
        </section>
        <section className="biovl-results-card"><div className="biovl-card-label"><ClipboardCheck /> CALCULATED RESULTS <span>Equation-backed</span></div><div className="biovl-metrics">{result.metrics.map((item) => <article key={item.label}><span>{item.label}</span><strong>{item.value}</strong><small>{item.unit}</small></article>)}</div><p className="biovl-interpretation">{result.summary}</p><details><summary>Model and accuracy notes</summary><p>{activeLab.model}</p></details></section>
        <section className="biovl-learning-grid">
          <article className="biovl-protocol-card"><div className="biovl-card-label"><BookOpen /> GUIDED PROTOCOL</div><ol>{activeLab.protocol.map((item, index) => <li key={item} className={step === index ? "active" : step > index ? "done" : ""}><button onClick={() => setStep(index)}><span>{step > index ? <CheckCircle2 /> : index + 1}</span><p>{item}</p></button></li>)}</ol><div className="biovl-step-actions"><button disabled={step === 0} onClick={() => setStep((value) => value - 1)}><ChevronLeft /> Previous</button><button disabled={step === activeLab.protocol.length - 1} onClick={() => setStep((value) => value + 1)}>Next <ChevronRight /></button></div></article>
          <article className="biovl-quiz-card"><div className="biovl-card-label"><GraduationCap /> CONCEPT CHECK</div><h2>{activeLab.quiz.prompt}</h2><div className="biovl-quiz-options">{activeLab.quiz.choices.map((choice, index) => <label key={choice} className={quizChoice === index ? "selected" : ""}><input type="radio" name={`quiz-${activeId}`} checked={quizChoice === index} onChange={() => { setQuizChoice(index); setQuizChecked(false); }} />{choice}</label>)}</div><button className="primary" disabled={quizChoice === null} onClick={answerQuiz}>Check answer</button>{quizChecked && <p className={quizChoice === activeLab.quiz.answer ? "correct" : "incorrect"}><strong>{quizChoice === activeLab.quiz.answer ? "Correct." : "Not quite."}</strong> {activeLab.quiz.explanation}</p>}</article>
        </section>
      </main>
      <aside className="biovl-notebook"><div className="biovl-notebook-head"><div><BookOpen /><span><strong>Lab notebook</strong><small>Saved on this device</small></span></div><span>{history.length} runs</span></div><div className="biovl-notebook-tabs">{["Hypothesis", "Observations", "Conclusion", "Instructor feedback"].map((item) => <button key={item} className={notebookTab === item ? "active" : ""} onClick={() => setNotebookTab(item)}>{item}</button>)}</div><textarea value={currentNotes[notebookTab] || ""} onChange={(event) => setNotes((all) => ({ ...all, [activeId]: { ...currentNotes, [notebookTab]: event.target.value } }))} placeholder={`Record ${notebookTab.toLowerCase()} for ${activeLab.title}…`} /><div className="biovl-export-row"><button disabled={!history.length} onClick={exportCsv}><Download /> CSV</button><button onClick={() => window.print()}><Printer /> Print / PDF</button></div><section className="biovl-history"><h2>Recent measurements</h2>{history.filter((item) => item.labId === activeId).slice(0, 5).map((item) => <article key={item.id}><span>{item.time}</span><strong>{item.result}</strong></article>)}{!history.some((item) => item.labId === activeId) && <p>Pass the safety checkpoint and run this experiment to capture a result.</p>}</section><section className="biovl-coverage"><h2>Implemented toolkit</h2><ul><li>25 complete lab workspaces</li><li>Live calculations and visual feedback</li><li>Safety and procedural checkpoints</li><li>Randomised repeat practice</li><li>Device-local notes and exports</li><li>Accessible keyboard and touch controls</li></ul></section></aside>
    </div>
    <div className="sr-only" aria-live="polite">{notice}</div>{notice && <div className="biovl-toast" role="status">{notice}</div>}
  </div>;
}
