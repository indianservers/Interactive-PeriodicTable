export const STANDARDS = [0, 2, 4, 6, 8, 10];
export const CURRENTS = [0.1, 6, 11.9, 17.9, 23.8, 29.8];
export const DEFAULT = {
  slope: 2.97,
  intercept: 0.08,
  eHalf: -0.742,
  baseline: -0.2,
};
export function dilutionVolume(targetMgL, finalMl = 50, stockMgL = 100) {
  return (targetMgL * finalMl) / stockMgL;
}
export function oxygenAt(seconds, initial = 8.1, floor = 0.4) {
  return floor + (initial - floor) * Math.exp(-seconds / 125);
}
export function baselineAt(seconds) {
  return -0.2 - 1.6 * Math.exp(-seconds / 110);
}
export function polarographicCurrent(
  potential,
  concentration = 6,
  {
    slope = DEFAULT.slope,
    intercept = DEFAULT.intercept,
    eHalf = DEFAULT.eHalf,
    baseline = DEFAULT.baseline,
  } = {},
) {
  const diffusion = Math.max(0, slope * concentration + intercept),
    fraction = 1 / (1 + Math.exp((potential - eHalf) / 0.045));
  return baseline - diffusion * fraction;
}
export function derivativeAt(potential, concentration = 6) {
  const h = 0.001;
  return Math.abs(
    (polarographicCurrent(potential + h, concentration) -
      polarographicCurrent(potential - h, concentration)) /
      (2 * h),
  );
}
export function linearRegression(xs = STANDARDS, ys = CURRENTS) {
  const n = xs.length,
    mx = xs.reduce((a, b) => a + b, 0) / n,
    my = ys.reduce((a, b) => a + b, 0) / n,
    ssx = xs.reduce((s, x) => s + (x - mx) ** 2, 0),
    sxy = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0),
    slope = sxy / ssx,
    intercept = my - slope * mx,
    sst = ys.reduce((s, y) => s + (y - my) ** 2, 0),
    sse = ys.reduce((s, y, i) => s + (y - (slope * xs[i] + intercept)) ** 2, 0);
  return { slope, intercept, r2: 1 - sse / sst };
}
export function unknownResult(
  currents = [14.5, 14.7, 14.6],
  dilutionFactor = 5,
) {
  const mean = currents.reduce((a, b) => a + b, 0) / currents.length,
    sd = Math.sqrt(
      currents.reduce((s, x) => s + (x - mean) ** 2, 0) / (currents.length - 1),
    ),
    rsd = (sd / mean) * 100,
    { r2 } = linearRegression(),
    slope = DEFAULT.slope,
    intercept = DEFAULT.intercept,
    diluted = Number(((mean - intercept) / slope).toFixed(2));
  return {
    mean,
    sd,
    rsd,
    slope,
    intercept,
    r2,
    diluted,
    original: diluted * dilutionFactor,
  };
}
