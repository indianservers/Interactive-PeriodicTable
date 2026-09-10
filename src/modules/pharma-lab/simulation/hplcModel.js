import {
  hplcAssay,
  impurityPercent,
  linearRegression,
  percentRsd,
} from "../calculations/scientificCalculations.js";

export const calibrationPoints = [25, 50, 75, 100, 125, 150].map((x, i) => ({
  x,
  y: 42851 * x + 12940 + (i % 2 ? 6200 : -4800),
}));

export function simulateHplcMethod({
  organicPercent = 30,
  flow = 1,
  temperature = 30,
  injectionVolume = 20,
  wavelength = 243,
  sampleConcentration = 100,
  threshold = 0.015,
} = {}) {
  const retentionScale =
    ((30 / organicPercent) ** 1.25 / flow) *
    Math.exp(-0.012 * (temperature - 30));
  const response =
    (injectionVolume / 20) *
    (sampleConcentration / 100) *
    (1 - Math.min(0.3, Math.abs(wavelength - 243) * 0.012));
  const peaks = [
    {
      name: "Impurity J",
      rt: 2.8 * retentionScale,
      height: 33 * response,
      area: 12563 * response,
    },
    {
      name: "Paracetamol",
      rt: 4.72 * retentionScale,
      height: 205 * response,
      area: 17856342 * response,
    },
    {
      name: "Impurity K",
      rt: 7.9 * retentionScale,
      height: 30 * response,
      area: 7432 * response,
    },
  ].filter((peak) => peak.height / 205 >= threshold);
  const pressure =
    25.1 *
    flow *
    (30 / Math.max(10, temperature)) *
    (1 + (30 - organicPercent) * 0.012);
  const solventMl = flow * 10;
  const totalArea = peaks.reduce((sum, peak) => sum + peak.area, 0);
  const assay = hplcAssay({
    sampleArea: peaks.find((p) => p.name === "Paracetamol")?.area || 0,
    standardArea: 17964000,
    sampleConcentration,
    standardConcentration: 100,
  });
  const impurities = peaks
    .filter((p) => p.name !== "Paracetamol")
    .map((peak) => ({
      ...peak,
      percent: impurityPercent({ impurityArea: peak.area, totalArea }),
    }));
  const injections = [
    17856342, 17844120, 17910210, 17888940, 17872115, 17861003,
  ].map((value) => value * response);
  return {
    peaks,
    pressure,
    solventMl,
    totalArea,
    assay,
    impurities,
    injectionRsd: percentRsd(injections),
    calibration: linearRegression(calibrationPoints),
    resolution: Math.max(
      0.7,
      2.45 - (flow - 1) * 0.35 - Math.abs(organicPercent - 30) * 0.035,
    ),
    plates: 8450 * (1 / flow) * Math.sqrt(30 / temperature),
    tailing: 1.12 + Math.abs(organicPercent - 30) * 0.008,
  };
}

export function chromatogramPoints(peaks, runTime = 10) {
  return Array.from({ length: 201 }, (_, i) => {
    const x = (i * runTime) / 200;
    const y = peaks.reduce(
      (sum, peak) =>
        sum +
        peak.height *
          Math.exp(
            -((x - peak.rt) ** 2) /
              (2 * (peak.name === "Paracetamol" ? 0.095 : 0.075) ** 2),
          ),
      0,
    );
    return { x, y };
  });
}
