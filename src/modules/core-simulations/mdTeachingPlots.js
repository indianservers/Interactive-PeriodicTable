import { ARGON, lennardJones } from "./molecularDynamicsModel.js";
export function mdTeachingPlot(
  kind,
  {
    temperature = 120,
    pressure = 0.81,
    energies = { kinetic: 150.3, potential: -804.1, total: -653.8 },
    diffusion = 0.061,
  } = {},
) {
  const specs = {
      lj: [0.8, 3, -1.2, 2, "r / σ", "U / ε"],
      rdf: [0, 5, 0, 4, "r / σ", "g(r)"],
      msd: [0, 100, 0, 40, "Reduced time t*", "MSD / σ²"],
      vacf: [0, 100, -0.5, 1.1, "Reduced time t*", "Normalized VACF"],
      maxwell: [0, 800, 0, 0.006, "Speed / m s⁻¹", "Probability density"],
      temperature: [0, 250, 80, 160, "Time / ps", "Temperature / K"],
      pressure: [0, 250, 0, 1.5, "Time / ps", "Reduced pressure"],
      energy: [0, 250, -1000, 300, "Time / ps", "Energy / ε"],
    },
    bounds = specs[kind] || specs.temperature,
    [xmin, xmax] = bounds;
  const points = Array.from({ length: 180 }, (_, i) => {
    const x = xmin + ((xmax - xmin) * i) / 179;
    let y;
    if (kind === "lj") y = lennardJones(x);
    else if (kind === "rdf")
      y =
        x < 0.75
          ? 0
          : 1 +
            2.2 * Math.exp(-(((x - 1.08) / 0.12) ** 2)) -
            0.55 * Math.exp(-(((x - 1.55) / 0.22) ** 2)) +
            0.28 * Math.exp(-(((x - 2.2) / 0.28) ** 2));
    else if (kind === "msd") y = 6 * diffusion * x;
    else if (kind === "vacf") y = Math.exp(-x / 20) * Math.cos(x / 9);
    else if (kind === "maxwell") {
      const a = ARGON.molarMassKg / (2 * 8.314462618 * temperature);
      y = 4 * Math.PI * (a / Math.PI) ** 1.5 * x * x * Math.exp(-a * x * x);
    } else if (kind === "pressure") y = pressure + 0.06 * Math.sin(i * 1.7);
    else if (kind === "energy") y = energies.kinetic + energies.potential + 6 * Math.sin(i * 0.63);
    else y = temperature + 3 * Math.sin(i * 1.4) * Math.exp(-i / 70);
    return { x, y };
  });
  const series = [
    { label: kind === "energy" ? "Total" : kind, points, color: "#40cfe5" },
  ];
  if (kind === "energy")
    for (const [key, color] of [
      ["kinetic", "#ffd16b"],
      ["potential", "#4fe699"],
    ])
      series.push({
        label: key,
        color,
        points: points.map(({ x }, i) => ({
          x,
          y: energies[key] + 3 * Math.sin(i * 0.63),
        })),
      });
  return { bounds, series };
}
