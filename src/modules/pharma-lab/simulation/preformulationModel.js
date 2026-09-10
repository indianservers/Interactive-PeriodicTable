import { compatibilityRisk, weakAcidLogD, weakAcidSolubility } from "../calculations/scientificCalculations.js";

export const PREFORMULATION_BASE = Object.freeze({ pKa: 9.38, logP: 0.49, intrinsicSolubility: 13.94 });

export function makePreformulationData({ temperature = 25, polymorph = "Form I", particleSize = 62, humidity = 75, excipient = "MCC" } = {}) {
  const formFactor = polymorph === "Form II" ? 1.22 : polymorph === "Amorphous" ? 2.7 : 1;
  const sizeFactor = Math.sqrt(62 / Math.max(5, particleSize));
  const solubility = Array.from({ length: 25 }, (_, index) => {
    const pH = 1 + index * 0.46;
    return { x: Number(pH.toFixed(2)), y: Math.min(250, weakAcidSolubility({ intrinsicSolubility: PREFORMULATION_BASE.intrinsicSolubility * formFactor, pH, pKa: PREFORMULATION_BASE.pKa, temperatureCelsius: temperature })) };
  });
  const melt = polymorph === "Form II" ? 157.2 : polymorph === "Amorphous" ? 142 : 169.7;
  const dsc = Array.from({ length: 81 }, (_, index) => {
    const x = 50 + index * 2.5;
    const peak = -2.25 * Math.exp(-((x - melt) ** 2) / (2 * 4.2 ** 2));
    return { x, y: peak + 0.0007 * (x - 50) };
  });
  const pxrdPeaks = polymorph === "Form II" ? [12.1, 15.8, 18.2, 20.4, 24.1, 26.5] : polymorph === "Amorphous" ? [] : [11.9, 15.4, 18.2, 20.4, 23.5, 24.4, 26.5, 32.1];
  const pxrd = Array.from({ length: 141 }, (_, index) => {
    const x = 5 + index * 0.25;
    const crystalline = pxrdPeaks.reduce((sum, peak, peakIndex) => sum + (85 - peakIndex * 6) * Math.exp(-((x - peak) ** 2) / (2 * 0.12 ** 2)), 0);
    const halo = polymorph === "Amorphous" ? 48 * Math.exp(-((x - 19) ** 2) / (2 * 4.8 ** 2)) : 2;
    return { x, y: crystalline + halo };
  });
  const psd = Array.from({ length: 48 }, (_, index) => {
    const x = 1.16 ** index;
    return { x: Number(x.toFixed(1)), y: 11 * Math.exp(-((Math.log(x) - Math.log(particleSize)) ** 2) / (2 * 0.55 ** 2)) };
  });
  const dvs = Array.from({ length: 11 }, (_, index) => ({ x: index * 10, y: 0.05 + 0.0015 * index * 10 + 0.000033 * (index * 10) ** 2 }));
  const factors = { MCC: 0.42, Lactose: 0.83, "PVP K30": 0.5, Croscarmellose: 0.55, "Magnesium stearate": 0.94 };
  const risk = compatibilityRisk({ humidityPercent: humidity, temperatureCelsius: temperature, days: 28, excipientFactor: factors[excipient] });
  return { solubility, dsc, pxrd, psd, dvs, melt, risk, logD: weakAcidLogD({ logP: PREFORMULATION_BASE.logP, pH: 7, pKa: PREFORMULATION_BASE.pKa }), dissolution: 0.31 * sizeFactor * formFactor };
}
