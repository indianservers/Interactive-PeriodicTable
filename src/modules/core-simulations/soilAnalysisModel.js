export const SAMPLES = [
  {
    id: "S-A01",
    lat: 40.7121,
    lon: -93.5234,
    ph: 7.1,
    ec: 0.22,
    texture: "Loam",
  },
  {
    id: "S-A02",
    lat: 40.7126,
    lon: -93.5201,
    ph: 6.78,
    ec: 0.48,
    texture: "Loam",
  },
  {
    id: "S-A03",
    lat: 40.7108,
    lon: -93.5187,
    ph: 6.43,
    ec: 1.17,
    texture: "Sandy loam",
  },
  {
    id: "S-A04",
    lat: 40.7089,
    lon: -93.5219,
    ph: 7.62,
    ec: 1.85,
    texture: "Silt loam",
  },
  {
    id: "S-A05",
    lat: 40.7078,
    lon: -93.525,
    ph: 8.12,
    ec: 2.74,
    texture: "Clay loam",
  },
];
export function extractionWater(massG = 20, ratio = 2.5) {
  return massG * ratio;
}
export function nernstSlope(tempC = 25) {
  const R = 8.314462618,
    F = 96485.33212,
    T = tempC + 273.15;
  return ((Math.log(10) * R * T) / F) * 1000;
}
export function cellConstant(standardUs = 1413, measuredUs = 1410) {
  return standardUs / measuredUs;
}
export function stats(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length,
    sd = Math.sqrt(
      values.reduce((s, x) => s + (x - mean) ** 2, 0) / (values.length - 1),
    );
  return { mean, sd, rsd: (sd / mean) * 100 };
}
export function tdsFromEc(ecDsM, factor = 640) {
  return ecDsM * factor;
}
export function phClass(ph) {
  return ph < 5.5
    ? "Acidic"
    : ph <= 6.5
      ? "Slightly acidic"
      : ph <= 7.3
        ? "Neutral"
        : ph <= 8.5
          ? "Slightly alkaline"
          : "Alkaline";
}
export function salinityClass(ec) {
  return ec < 0.2
    ? "Non-saline"
    : ec < 0.8
      ? "Slightly saline"
      : ec <= 1.6
        ? "Moderately saline"
        : ec <= 3.2
          ? "Saline"
          : "Strongly saline";
}
export function sampleResult(ph = [6.42, 6.45, 6.43], ec = [1.18, 1.16, 1.17]) {
  const p = stats(ph),
    e = stats(ec);
  return {
    ph: p,
    ec: e,
    tds: tdsFromEc(e.mean),
    phClass: phClass(p.mean),
    salinityClass: salinityClass(e.mean),
  };
}
export function fieldSummary(samples = SAMPLES) {
  const ph = stats(samples.map((x) => x.ph)),
    ec = stats(samples.map((x) => x.ec)),
    tds = stats(samples.map((x) => tdsFromEc(x.ec)));
  return { ph, ec, tds };
}
