export const ARGON = { epsilonOverKb: 119.8, sigmaAngstrom: 3.405, molarMassKg: 0.039948 };

export function boxLength(atoms = 256, reducedDensity = 0.8) {
  return Math.cbrt(Number(atoms) / Number(reducedDensity));
}

export function lennardJones(rReduced) {
  const r = Math.max(0.55, Number(rReduced));
  return 4 * (r ** -12 - r ** -6);
}

export function simulationState({ temperature = 120, density = 0.8, progress = 50 } = {}) {
  const p = Math.max(0, Math.min(100, Number(progress)));
  const equilibrium = 1 - Math.exp(-p / 13);
  const currentTemperature = temperature - 0.2 + 1.2 * Math.sin(p * 0.72) * (1 - equilibrium * 0.75);
  const pressure = density * (temperature / 120) * 1.0125;
  const kinetic = 1.5 * temperature / ARGON.epsilonOverKb * 100;
  const potential = -804.1 + (temperature - 120) * 0.65 + (density - 0.8) * 240;
  const total = kinetic + potential;
  return { temperature: currentTemperature, pressure, kinetic, potential, total, step: Math.round(p / 100 * 250000), timePs: p * 5, equilibrated: p >= 20 };
}

export function analysisAt(temperature = 120, density = 0.8) {
  const t = Number(temperature), rho = Number(density);
  const diffusion = 0.061 * (t / 120) ** 1.55 * (0.8 / rho) ** 1.8;
  const rdfPeak = 1.08 + (0.8 - rho) * 0.22;
  const coordination = 11.8 * rho / 0.8;
  return { diffusion, rdfPeak, coordination, temperatureMean: t - 0.1, temperatureSd: 1.7, pressureMean: rho * t / 120 * 1.0125, pressureSd: 0.09, energyDrift: 0.003 };
}

export const PARAMETER_STATES = [
  { temperature: 0.6, density: 0.8, energy: -6.38, pressure: 0.12, diffusion: 0.00012, rdfPeak: 3.6, phase: 'Solid-like' },
  { temperature: 0.9, density: 0.8, energy: -5.72, pressure: 1.35, diffusion: 0.038, rdfPeak: 3.25, phase: 'Dense liquid' },
  { temperature: 1.2, density: 0.8, energy: -4.21, pressure: 2.86, diffusion: 0.11, rdfPeak: 2.85, phase: 'Liquid' },
  { temperature: 2.0, density: 0.8, energy: -1.12, pressure: 6.21, diffusion: 1.85, rdfPeak: 1.45, phase: 'Gas-like' },
];

export function seededParticles(count = 108, seed = 8675309) {
  let s = seed >>> 0;
  const random = () => ((s = (1664525 * s + 1013904223) >>> 0) / 4294967296);
  return Array.from({ length: count }, (_, i) => ({ id: i, x: 7 + random() * 86, y: 7 + random() * 86, z: random(), vx: random() * 2 - 1, vy: random() * 2 - 1 }));
}
