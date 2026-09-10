export const CONSTANTS = Object.freeze({
  kB: { value: 1.380649e-23, unit: 'J K⁻¹', exact: true, source: 'https://physics.nist.gov/cgi-bin/cuu/Value?k', label: 'Boltzmann constant' },
  NA: { value: 6.02214076e23, unit: 'mol⁻¹', exact: true, source: 'https://physics.nist.gov/cgi-bin/cuu/Value?na', label: 'Avogadro constant' },
  R: { value: 8.31446261815324, unit: 'J mol⁻¹ K⁻¹', exact: true, source: 'https://physics.nist.gov/cgi-bin/cuu/Value?r', label: 'molar gas constant' },
  h: { value: 6.62607015e-34, unit: 'J Hz⁻¹', exact: true, source: 'https://physics.nist.gov/cgi-bin/cuu/Value?h', label: 'Planck constant' },
  c: { value: 299792458, unit: 'm s⁻¹', exact: true, source: 'https://physics.nist.gov/cgi-bin/cuu/Value?c', label: 'speed of light' },
  e: { value: 1.602176634e-19, unit: 'C', exact: true, source: 'https://physics.nist.gov/cuu/Constants/Value/e.html', label: 'elementary charge' },
});

export const SPECIES = Object.freeze({
  Ar: { name: 'Argon', symbol: 'Ar', molarMass: 39.948e-3, sigma: 3.405e-10, epsilonOverK: 119.8, source: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7440371' },
  Ne: { name: 'Neon', symbol: 'Ne', molarMass: 20.1797e-3, sigma: 2.789e-10, epsilonOverK: 35.6, source: 'https://webbook.nist.gov/cgi/cbook.cgi?ID=C7440019' },
});

export const clamp = (value, min, max) => Math.min(max, Math.max(min, Number.isFinite(+value) ? +value : min));
export const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
export const fmt = (value, digits = 2) => Number.isFinite(value) ? value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';
export const normalize = values => { const sum = values.reduce((a, b) => a + Math.max(0, b), 0); return sum ? values.map(v => Math.max(0, v) / sum) : values.map(() => 0); };
export const linspace = (start, stop, count) => Array.from({ length: count }, (_, i) => start + (stop - start) * i / Math.max(1, count - 1));

export function seeded(seed = 20250310) {
  let state = seed >>> 0;
  return () => ((state = Math.imul(1664525, state) + 1013904223 >>> 0) / 4294967296);
}

export const conversions = Object.freeze({
  PaToBar: value => value / 1e5,
  barToPa: value => value * 1e5,
  JToKJ: value => value / 1000,
  KJToJ: value => value * 1000,
  mToNm: value => value * 1e9,
  nmToM: value => value * 1e-9,
  HzToWavenumber: value => value / (CONSTANTS.c.value * 100),
  wavenumberToHz: value => value * CONSTANTS.c.value * 100,
});

export function assertPhysical(label, value, { min = -Infinity, max = Infinity } = {}) {
  if (!Number.isFinite(value) || value < min || value > max) throw new RangeError(`${label} must be finite and within [${min}, ${max}]`);
  return value;
}

export const PROVENANCE = Object.freeze({
  retrievedAt: '2026-03-10',
  constants: 'NIST 2022 CODATA values; defining SI constants are exact.',
  argon: 'NIST Chemistry WebBook SRD 69; molecular weight 39.948 g mol⁻¹.',
  lennardJones: '12-6 Lennard–Jones pair potential; truncated at 2.5σ and shifted to zero at cutoff. Classroom-scale reduced simulation mapped to SI observables.',
});

export const MODEL_PROVENANCE = Object.freeze({
  'real-gas-laws': [['NIST Argon fluid data','https://webbook.nist.gov/cgi/cbook.cgi?ID=C7440371&Mask=4']],
  thermodynamics: [['IUPAC Gold Book: thermodynamics terminology','https://goldbook.iupac.org/terms/view/T06321']],
  'statistical-thermodynamics': [['IUPAC Gold Book: partition function','https://goldbook.iupac.org/terms/view/P04493']],
  'chemical-kinetics': [['NIST Chemical Kinetics Database','https://kinetics.nist.gov/kinetics/']],
  'chemical-equilibrium': [['IUPAC Gold Book: equilibrium constant','https://goldbook.iupac.org/terms/view/E02177']],
  'phase-equilibrium': [['NIST Chemistry WebBook: water phase data','https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Mask=4']],
  'solutions-colligative-properties': [['IUPAC Gold Book: colligative property','https://goldbook.iupac.org/terms/view/C01190']],
  electrochemistry: [['IUPAC Gold Book: Nernst equation','https://goldbook.iupac.org/terms/view/N04151']],
  'quantum-chemistry': [['NIST Atomic Spectra Database','https://physics.nist.gov/PhysRefData/ASD/levels_form.html']],
  'molecular-spectroscopy': [['NIST Chemistry WebBook: carbon dioxide spectrum','https://webbook.nist.gov/cgi/cbook.cgi?ID=C124389&Mask=80']],
  'surface-chemistry': [['IUPAC Gold Book: Langmuir adsorption isotherm','https://goldbook.iupac.org/terms/view/L03420']],
  photochemistry: [['IUPAC Gold Book: quantum yield','https://goldbook.iupac.org/terms/view/Q04991']],
  'transport-phenomena': [['NIST CODATA: Boltzmann constant','https://physics.nist.gov/cgi-bin/cuu/Value?k']],
});
