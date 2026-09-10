import { trapezoidalAuc } from "../calculations/scientificCalculations.js";

export function simulateOralPk({
  doseMg = 500,
  weightKg = 70,
  gastric = 1,
  hepatic = 1,
  renal = 1,
  fed = false,
  model = "one",
  intervalHours = 8,
} = {}) {
  if (doseMg <= 0 || weightKg <= 0 || intervalHours <= 0)
    throw new RangeError(
      "dose, weight, and interval must be greater than zero",
    );
  const bioavailability = 0.8 * (fed ? 0.94 : 1);
  const ka = 2.8 * gastric * (fed ? 0.62 : 1);
  const halfLife = 2.3 / (0.58 * hepatic + 0.42 * renal);
  const ke = Math.log(2) / halfLife;
  const volume = 0.9 * weightKg;
  const scale = (bioavailability * doseMg * ka) / (volume * (ka - ke));
  const concentration = (time) =>
    Math.max(
      0,
      scale *
        (Math.exp(-ke * time) - Math.exp(-ka * time)) *
        (model === "two" ? 0.78 + 0.22 * Math.exp(-0.16 * time) : 1),
    );
  const profile = Array.from({ length: 97 }, (_, i) => ({
    x: i * 0.25,
    y: concentration(i * 0.25),
  }));
  const peak = profile.reduce(
    (best, point) => (point.y > best.y ? point : best),
    profile[0],
  );
  const auc = trapezoidalAuc(profile);
  const accumulation = 1 / (1 - Math.exp(-ke * intervalHours));
  return {
    profile,
    bioavailability,
    ka,
    halfLife,
    ke,
    volume,
    cmax: peak.y,
    tmax: peak.x,
    auc,
    clearance: ke * volume,
    accumulation,
    pathways: {
      glucuronidation: 55 * hepatic,
      sulfation: 30 * hepatic,
      unchanged: 5 * renal,
      cyp: Math.max(5, 10 - hepatic * 3),
    },
  };
}

export function massBalanceAt(timeHours, result) {
  const eliminated = Math.min(88, (1 - Math.exp(-result.ke * timeHours)) * 90);
  return {
    glucuronide: eliminated * 0.55,
    sulfate: eliminated * 0.3,
    unchanged: eliminated * 0.05,
    other: eliminated * 0.1,
    remaining: 100 - eliminated,
  };
}
