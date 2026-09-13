export const ACID_BASE_SOLUTIONS = Object.freeze({
  hcl: { id: 'hcl', name: 'Hydrochloric acid', formula: 'HCl', kind: 'strong-acid', color: '#ef4444' },
  acetic: { id: 'acetic', name: 'Acetic acid', formula: 'CH₃COOH', kind: 'weak-acid', ka: 1.8e-5, color: '#f59e0b' },
  naoh: { id: 'naoh', name: 'Sodium hydroxide', formula: 'NaOH', kind: 'strong-base', color: '#7c3aed' },
  ammonia: { id: 'ammonia', name: 'Ammonia', formula: 'NH₃', kind: 'weak-base', kb: 1.8e-5, color: '#2563eb' },
});

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || 0));
const quadraticIon = (c, k) => (-k + Math.sqrt(k * k + 4 * k * c)) / 2;

export function solveSolution(id = 'acetic', concentration = 0.1, temperature = 25) {
  const solution = ACID_BASE_SOLUTIONS[id] || ACID_BASE_SOLUTIONS.acetic;
  const c = clamp(concentration, 1e-6, 2);
  const pKw = 14 - 0.0335 * (temperature - 25);
  let h;
  let ionisation;
  if (solution.kind === 'strong-acid') {
    h = c;
    ionisation = 1;
  } else if (solution.kind === 'weak-acid') {
    h = quadraticIon(c, solution.ka);
    ionisation = h / c;
  } else if (solution.kind === 'strong-base') {
    h = 10 ** -pKw / c;
    ionisation = 1;
  } else {
    const oh = quadraticIon(c, solution.kb);
    h = 10 ** -pKw / oh;
    ionisation = oh / c;
  }
  const pH = clamp(-Math.log10(h), 0, pKw);
  const pOH = pKw - pH;
  const conductivity = Math.max(0.02, (solution.kind.startsWith('strong') ? 38 : 4.1) * c ** 0.82);
  return { solution, concentration: c, temperature, pH, pOH, h, oh: 10 ** -pOH, ionisation, conductivity };
}

export function strongAcidTitration({ acidConcentration = 0.1, acidVolume = 25, baseConcentration = 0.1, baseVolume = 0, temperature = 25 } = {}) {
  const acidMoles = acidConcentration * acidVolume / 1000;
  const baseMoles = baseConcentration * baseVolume / 1000;
  const totalVolume = Math.max(1e-9, (acidVolume + baseVolume) / 1000);
  const difference = acidMoles - baseMoles;
  const pKw = 14 - 0.0335 * (temperature - 25);
  const equivalenceVolume = acidMoles / baseConcentration * 1000;
  let pH;
  if (Math.abs(difference) < 1e-12) pH = pKw / 2;
  else if (difference > 0) pH = -Math.log10(difference / totalVolume);
  else pH = pKw + Math.log10(-difference / totalVolume);
  return { pH: clamp(pH, 0, pKw), acidMoles, baseMoles, equivalenceVolume, excessMoles: Math.abs(difference) };
}

export function titrationSeries(options = {}, endVolume = 50, step = 1) {
  const points = [];
  for (let volume = 0; volume <= endVolume + 1e-9; volume += step) {
    const result = strongAcidTitration({ ...options, baseVolume: volume });
    points.push({ x: volume, y: result.pH });
  }
  return points;
}

export function acetateBuffer({ acidStock = 0.5, baseStock = 0.5, acidVolume = 100, baseVolume = 100, finalVolume = 250, addedAcidMmol = 0, addedBaseMmol = 0 } = {}) {
  const pKa = -Math.log10(ACID_BASE_SOLUTIONS.acetic.ka);
  let acidMmol = acidStock * acidVolume;
  let baseMmol = baseStock * baseVolume;
  const neutralisedAcid = Math.min(baseMmol, Math.max(0, addedAcidMmol));
  baseMmol -= neutralisedAcid;
  acidMmol += neutralisedAcid;
  const neutralisedBase = Math.min(acidMmol, Math.max(0, addedBaseMmol));
  acidMmol -= neutralisedBase;
  baseMmol += neutralisedBase;
  const pH = acidMmol > 0 && baseMmol > 0 ? pKa + Math.log10(baseMmol / acidMmol) : baseMmol > 0 ? 14 : 0;
  return {
    pKa,
    pH: clamp(pH, 0, 14),
    acidMmol,
    baseMmol,
    ratio: acidMmol ? baseMmol / acidMmol : Infinity,
    totalConcentration: (acidMmol + baseMmol) / Math.max(1, finalVolume),
  };
}

export function indicatorForPH(pH) {
  if (pH < 3) return { name: 'Red', color: '#dc1735' };
  if (pH < 6) return { name: 'Orange', color: '#f97316' };
  if (pH < 8) return { name: 'Green', color: '#16a34a' };
  if (pH < 11) return { name: 'Blue', color: '#2563eb' };
  return { name: 'Purple', color: '#6d28d9' };
}
