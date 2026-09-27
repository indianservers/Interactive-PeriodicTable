// Illustrative blue dye, not experimental copper sulfate data.
export const PEAK_WAVELENGTH = 620;
export const UNKNOWN_REPLICATES = Object.freeze([0.533, 0.529, 0.536]);
export const UNKNOWN_MEAN = UNKNOWN_REPLICATES.reduce((sum, value) => sum + value, 0) / UNKNOWN_REPLICATES.length;
export const MOLAR_ABSORPTIVITY = 1.01e4;
export const CALIBRATION_INTERCEPT = 0.003;
export const STANDARD_CONCENTRATIONS = Object.freeze([0, 1e-5, 2e-5, 4e-5, 6e-5, 8e-5]);
const OFFSETS = Object.freeze([0, -0.002, 0.002, 0.005, -0.001, -0.002]);

export function absorbance(concentration, pathLength = 1, epsilon = MOLAR_ABSORPTIVITY, intercept = CALIBRATION_INTERCEPT) {
  const c = Math.max(0, Number(concentration) || 0);
  const b = Math.max(0, Number(pathLength) || 0);
  return epsilon * b * c + intercept;
}

export function transmittance(absorbanceValue) { return 100 * 10 ** (-Math.max(0, absorbanceValue)); }

export function standards(pathLength = 1, wavelength = PEAK_WAVELENGTH) {
  return STANDARD_CONCENTRATIONS.map((concentration, index) => ({ id: index ? `S${index}` : 'Blank', concentration, absorbance: Math.max(0, spectrum(wavelength, concentration, pathLength) + OFFSETS[index]) }));
}

export function linearRegression(rows) {
  const usable = rows.filter(row => row.included !== false), n = usable.length;
  if (n < 2 || new Set(usable.map(row => row.concentration)).size < 2) return { valid: false, slope: NaN, intercept: NaN, r2: NaN, residual: NaN };
  const sx = usable.reduce((s,row)=>s+row.concentration,0), sy=usable.reduce((s,row)=>s+row.absorbance,0);
  const sxx=usable.reduce((s,row)=>s+row.concentration**2,0), sxy=usable.reduce((s,row)=>s+row.concentration*row.absorbance,0);
  const slope=(n*sxy-sx*sy)/(n*sxx-sx*sx), intercept=(sy-slope*sx)/n;
  const mean=sy/n, total=usable.reduce((s,row)=>s+(row.absorbance-mean)**2,0), residual=usable.reduce((s,row)=>s+(row.absorbance-(slope*row.concentration+intercept))**2,0);
  return { valid: Number.isFinite(slope) && slope > 0, slope, intercept, r2: total > 0 ? 1-residual/total : 0, residual };
}

export function spectrum(wavelength, concentration = 8e-5, pathLength = 1) {
  const gaussian = Math.exp(-0.5 * ((Number(wavelength)-PEAK_WAVELENGTH)/55)**2);
  return absorbance(concentration, pathLength, MOLAR_ABSORPTIVITY * gaussian);
}

export function unknownFromAbsorbance(value, fit, dilutionFactor = 10) {
  if (fit.valid === false || !(fit.slope > 0) || !Number.isFinite(fit.intercept)) return { diluted: NaN, original: NaN, valid: false };
  const diluted = (Number(value)-fit.intercept)/fit.slope;
  return { diluted, original: diluted*Math.max(1,Number(dilutionFactor)||1), valid: Number.isFinite(diluted) && diluted >= 0 };
}
