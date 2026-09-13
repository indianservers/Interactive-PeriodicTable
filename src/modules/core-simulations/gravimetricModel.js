export const MOLAR_MASS = { BaSO4: 233.39, SO4: 96.06 };
export const MASS_CYCLES = [28.6432, 28.8071, 28.8057, 28.8055];

export function reagentPlan({ sampleMass = 0.5, estimatedPercent = 20, reagentMolarity = 0.1, selectedMl = 12.5 } = {}) {
  const sulfateMass = sampleMass * estimatedPercent / 100;
  const sulfateMoles = sulfateMass / MOLAR_MASS.SO4;
  const stoichiometricMl = sulfateMoles / reagentMolarity * 1000;
  return { sulfateMass, sulfateMoles, stoichiometricMl, selectedMl, excessPercent: (selectedMl / stoichiometricMl - 1) * 100, sufficient: selectedMl >= stoichiometricMl * 1.1 };
}

export function digestionState(minutes = 42.3, additionRate = 1, temperature = 80) {
  const time = Math.max(0, Math.min(60, Number(minutes) || 0));
  const particleDiameter = 0.02 + 2.1 * (1 - Math.exp(-time / 13));
  const turbidity = 12 + 74 * Math.exp(-time / 10);
  const completeness = Math.min(100, time / 42.3 * 100);
  return { time, particleDiameter, turbidity, completeness, additionRate, temperature, complete: time >= 42.3 && temperature >= 75 && temperature <= 85 };
}

export function gravimetricResult({ emptyCrucible = MASS_CYCLES[0], finalMass = MASS_CYCLES[3], sampleMass = 0.5 } = {}) {
  const precipitateMass = finalMass - emptyCrucible;
  const factor = MOLAR_MASS.SO4 / MOLAR_MASS.BaSO4;
  const analyteMass = precipitateMass * factor;
  const percent = analyteMass / sampleMass * 100;
  const delta = Math.abs(MASS_CYCLES[3] - MASS_CYCLES[2]);
  return { precipitateMass, factor, analyteMass, percent, delta, constantMass: delta <= 0.0003 };
}
