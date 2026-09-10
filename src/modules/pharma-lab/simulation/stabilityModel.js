import {
  arrheniusActivationEnergy,
  firstOrderShelfLifeMonths,
} from "../calculations/scientificCalculations.js";

export const conditions = {
  long: { label: "Long-term", temperature: 25, rh: 60 },
  intermediate: { label: "Intermediate", temperature: 30, rh: 65 },
  accelerated: { label: "Accelerated", temperature: 40, rh: 75 },
  photo: { label: "Photostability", temperature: 25, rh: 60, light: 1.2 },
};
export const packages = {
  pvc: { label: "PVC Blister", factor: 1, protection: "Fair" },
  alu: { label: "Alu-Alu Blister", factor: 0.52, protection: "Best" },
  hdpe: { label: "HDPE Bottle + Desiccant", factor: 0.72, protection: "Good" },
};
export const pullTimes = [0, 1, 2, 3, 6];

export function simulateStability({
  condition = "accelerated",
  packageType = "pvc",
  months = 3,
} = {}) {
  const env = conditions[condition];
  const pack = packages[packageType];
  if (!env || !pack)
    throw new RangeError("known stability condition and package are required");
  if (!pullTimes.includes(Number(months)))
    throw new RangeError("pull time must be a scheduled month");
  const tempFactor = 2 ** ((env.temperature - 25) / 10);
  const humidityFactor = 1 + Math.max(0, env.rh - 60) / 75;
  const lightFactor = env.light ? 1.28 : 1;
  const lossPerMonth =
    0.37 * tempFactor * humidityFactor * lightFactor * pack.factor;
  const rows = pullTimes.map((time) => ({
    x: time,
    assay: Math.max(0, 100.1 - lossPerMonth * time),
    impurities: 0.06 + lossPerMonth * time * 0.155,
    dissolution: Math.max(60, 96 - lossPerMonth * time * 0.82),
    moisture: 1.2 + lossPerMonth * time * 0.23,
  }));
  const rates = [25, 30, 35, 40].map((temperatureCelsius) => ({
    temperatureCelsius,
    rate: 0.00118 * 2 ** ((temperatureCelsius - 25) / 10) * pack.factor,
  }));
  const arrhenius = arrheniusActivationEnergy(rates);
  const rate25 = rates[0].rate;
  return {
    env,
    pack,
    rows,
    current: rows.find((row) => row.x === Number(months)),
    rates,
    arrhenius,
    shelfLifeMonths: firstOrderShelfLifeMonths({ ratePerMonth: rate25 }),
  };
}

export const packagingComparison = Object.keys(packages).map((packageType) => ({
  packageType,
  ...simulateStability({ packageType, months: 6 }).current,
  ...packages[packageType],
}));
