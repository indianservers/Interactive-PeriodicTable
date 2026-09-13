export const ELEMENTS = {
  Na: { name: 'Sodium', wavelength: 589.0, color: '#ffd900', sensitivity: 24.31 },
  K: { name: 'Potassium', wavelength: 766.5, color: '#ed1bff', sensitivity: 18.7 },
  Li: { name: 'Lithium', wavelength: 670.8, color: '#e71955', sensitivity: 21.4 },
  Ca: { name: 'Calcium', wavelength: 422.7, color: '#176ff0', sensitivity: 11.8 },
};

export const STANDARD_CONCENTRATIONS = [0, 2, 4, 6, 8, 10];
export const SODIUM_INTENSITIES = [0.4, 49.1, 97.8, 146.4, 194.9, 243.5];
export const UNKNOWN_REPLICATES = [122.1, 121.4, 122.5];

export function dilutionVolume(targetMgL, finalVolumeMl = 100, stockMgL = 1000) {
  return Number(targetMgL) * Number(finalVolumeMl) / Number(stockMgL);
}

export function linearRegression(xs = STANDARD_CONCENTRATIONS, ys = SODIUM_INTENSITIES) {
  const n = xs.length;
  const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0);
  const sxx = xs.reduce((a, x) => a + x * x, 0), sxy = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const slope = (n * sxy - sx * sy) / (n * sxx - sx * sx);
  const intercept = (sy - slope * sx) / n;
  const mean = sy / n;
  const ssRes = ys.reduce((a, y, i) => a + (y - (slope * xs[i] + intercept)) ** 2, 0);
  const ssTot = ys.reduce((a, y) => a + (y - mean) ** 2, 0);
  return { slope, intercept, r2: 1 - ssRes / ssTot };
}

export function mean(values) { return values.reduce((a, b) => a + b, 0) / values.length; }
export function rsd(values) {
  const avg = mean(values);
  const sd = Math.sqrt(values.reduce((a, x) => a + (x - avg) ** 2, 0) / (values.length - 1));
  return sd / avg * 100;
}

export function unknownResult(replicates = UNKNOWN_REPLICATES, dilutionFactor = 20) {
  const calibration = linearRegression();
  const intensity = mean(replicates);
  const diluted = (intensity - calibration.intercept) / calibration.slope;
  return { intensity, rsd: rsd(replicates), diluted, original: diluted * dilutionFactor, dilutionFactor, calibration };
}

export function flamePerformance({ fuel = 0.42, air = 5, aspiration = 4.2, height = 10 } = {}) {
  const distance = ((fuel - 0.42) / 0.18) ** 2 + ((air - 5) / 1.7) ** 2 + ((aspiration - 4.2) / 2) ** 2 + ((height - 10) / 5) ** 2;
  const stability = Math.max(55, 98.7 - distance * 12);
  return { stability, background: 1.8 + distance * 1.4, rsd: 0.42 + distance * 1.8, optimal: distance < 0.025 };
}

export function spectrum(wavelength, element = 'Na', concentration = 6) {
  const background = 1.8;
  const peaks = Object.entries(ELEMENTS).map(([id, el]) => {
    const abundance = id === element ? concentration / 6 : 0.08;
    const secondary = id === 'Na' ? [589.0, 589.6] : id === 'K' ? [766.5, 769.9] : [el.wavelength];
    return secondary.reduce((sum, line, index) => sum + (index ? 0.5 : 1) * el.sensitivity * 6 * abundance * Math.exp(-0.5 * ((wavelength - line) / (index ? 0.18 : 0.3)) ** 2), 0);
  });
  return background + peaks.reduce((a, b) => a + b, 0);
}
