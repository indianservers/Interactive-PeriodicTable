export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));

export function ethanolDistillate(volumeMl) {
  const v = clamp(volumeMl, 0, 100);
  const temperature = v < 5 ? 65 + 2.6 * v : v < 55 ? 78.0 + 0.012 * (v - 5) : v < 78 ? 78.6 + 0.58 * (v - 55) : 92 + 0.36 * (v - 78);
  const ethanol = 0.08 + 0.85 / (1 + Math.exp((v - 68) / 7));
  return { volume: v, temperature, ethanolMoleFraction: ethanol };
}

export function fractionalRun(power = 42, reflux = 3) {
  const stablePower = clamp(power, 0, 100);
  const ratio = clamp(reflux, 1, 6);
  const volume = clamp(12 + stablePower * 0.62, 0, 100);
  const point = ethanolDistillate(volume);
  return {
    ...point,
    potTemperature: 84 + stablePower * 0.17,
    dropRate: stablePower / 22,
    theoreticalPlates: 3.2 + ratio,
    separationFactor: 1.9 + ratio * 0.3,
  };
}

export function steamRun(elapsedMinutes = 36.33, steamRate = 2.5) {
  const minutes = clamp(elapsedMinutes, 0, 45);
  const rate = clamp(steamRate, 0, 5);
  const distillateVolume = clamp(minutes * rate * 0.925, 0, 100);
  const oilVolume = 2.625 * (1 - Math.exp(-distillateVolume / 34));
  const oilMass = oilVolume * 1.04;
  return { distillateVolume, oilVolume, oilMass, recovery: oilMass / 3 * 100, headTemperature: 98.6 };
}

export function recrystallisation({ mass = 5, hotSolventMl = 95, coolingRate = 1, seedingTemperature = 30 } = {}) {
  const hotSolubility = 5.5;
  const coldSolubility = 0.53;
  const theoretical = Math.max(0, mass - coldSolubility * hotSolventMl / 100);
  const quality = Math.exp(-Math.abs(coolingRate - 1) * 0.08 - Math.abs(seedingTemperature - 30) * 0.002);
  const recovered = theoretical * (0.94 + 0.033 * quality);
  const recovery = recovered / theoretical * 100;
  const purity = 96.4 + 2.7 * quality;
  return { minimumHotSolvent: mass / hotSolubility * 100, theoretical, recovered, recovery, purity, meltingLow: 114, meltingHigh: 115 };
}

export function reportSummary() {
  const fractional = fractionalRun(42, 3);
  const steam = steamRun();
  const crystals = recrystallisation();
  return { fractional, steam, crystals };
}
