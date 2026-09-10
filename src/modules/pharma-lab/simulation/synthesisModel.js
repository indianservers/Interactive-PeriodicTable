export const synthesisSteps = ["Apparatus check", "Charge p-aminophenol", "Add acetic anhydride", "Heat & react", "Cool mixture", "Crystallize", "Vacuum filter", "Dry product", "Complete"];

export function validateSynthesisAdvance({ stage, equivalents, rpm, conversion }) {
  if (!Number.isInteger(stage) || stage < 0 || stage >= synthesisSteps.length) return "Unknown synthesis stage.";
  if (stage === 1 && (equivalents < 1 || equivalents > 2.5)) return "Adjust acetic anhydride to 1.0–2.5 equivalents before addition.";
  if (stage === 2 && rpm < 250) return "Set stirring to at least 250 rpm before heating to avoid local overheating.";
  if (stage === 3 && conversion < 85) return "Conversion is below 85%. Continue the controlled reaction hold or sample by TLC.";
  if (stage === synthesisSteps.length - 1) return "Workflow complete. Reset to repeat the experiment.";
  return "";
}

export function nextSynthesisStage(current) {
  const validation = validateSynthesisAdvance(current);
  return validation ? { stage: current.stage, validation } : { stage: current.stage + 1, validation: "" };
}

export function estimateParacetamolConversion({ elapsedMinutes, temperatureCelsius }) {
  if (elapsedMinutes < 0 || temperatureCelsius < 0) throw new RangeError("time and temperature cannot be negative");
  const temperatureFactor = temperatureCelsius < 60 ? 0.35 : temperatureCelsius > 95 ? 0.6 : 1;
  return Math.min(96, elapsedMinutes / 45 * temperatureFactor * 95);
}
