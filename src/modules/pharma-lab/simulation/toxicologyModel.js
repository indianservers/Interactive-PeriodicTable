import { simulateOralPk } from "./admeModel.js";

export const exposureScenarios = {
  therapeutic: {
    label: "Therapeutic single dose",
    doseMg: 500,
    detail: "Analgesic / antipyretic effect",
  },
  maximum: {
    label: "Maximum labeled adult daily dose",
    doseMg: 4000,
    detail: "Upper limit teaching scenario",
  },
  supra: {
    label: "Supratherapeutic exposure",
    doseMg: 8000,
    detail: "Increased liver-injury risk",
  },
};

export function simulateToxicology({
  doseMg = 500,
  weightKg = 70,
  repeated = false,
  liver = "normal",
  alcohol = "none",
  age = "adult",
  fed = true,
} = {}) {
  if (doseMg <= 0 || weightKg <= 0)
    throw new RangeError("dose and body weight must be greater than zero");
  const gramsPerKg = doseMg / 1000 / weightKg;
  const liverFactor = liver === "impaired" ? 1.55 : 1;
  const alcoholFactor =
    alcohol === "chronic" ? 1.45 : alcohol === "recent" ? 1.18 : 1;
  const ageFactor = age === "older" ? 1.18 : age === "child" ? 1.1 : 1;
  const repeatFactor = repeated ? 1.32 : 1;
  const exposureFactor = liverFactor * alcoholFactor * ageFactor * repeatFactor;
  const saturation = Math.max(0, doseMg - 3000) / 5000;
  const napqiFraction =
    Math.min(0.34, 0.065 + saturation * 0.22) * exposureFactor;
  const napqiBurden = Math.min(100, (doseMg / 500) * napqiFraction * 8.5);
  const gshReserve = Math.max(0, 100 - napqiBurden * 0.92);
  const injuryProbability = Math.min(
    99,
    Math.max(
      1,
      2 +
        Math.max(0, gramsPerKg - 0.075) * 650 * exposureFactor +
        Math.max(0, 45 - gshReserve) * 0.65,
    ),
  );
  const risk =
    injuryProbability < 10
      ? "Low"
      : injuryProbability < 35
        ? "Moderate"
        : injuryProbability < 70
          ? "High"
          : "Critical";
  const alt =
    24 +
    injuryProbability * (risk === "Critical" ? 18 : risk === "High" ? 5 : 0.08);
  const ast =
    22 +
    injuryProbability *
      (risk === "Critical" ? 13 : risk === "High" ? 3.4 : 0.06);
  const pk = simulateOralPk({
    doseMg,
    weightKg,
    fed,
    hepatic: liver === "impaired" ? 0.6 : 1,
  });
  return {
    gramsPerKg,
    napqiFraction,
    napqiBurden,
    gshReserve,
    injuryProbability,
    risk,
    alt,
    ast,
    pk,
    efficacy: Math.min(98, (100 * doseMg) / (doseMg + 220)),
  };
}

export const doseResponse = Array.from({ length: 20 }, (_, i) => {
  const doseGrams = 0.1 + i * 0.52;
  return {
    x: doseGrams,
    efficacy: (100 * doseGrams) / (doseGrams + 0.22),
    injury: 100 / (1 + Math.exp(-(doseGrams - 4.8) * 1.15)),
  };
});
