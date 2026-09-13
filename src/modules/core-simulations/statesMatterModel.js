export const SUBSTANCES = {
  water: { name: "Water", formula: "H₂O", molarMass: 18.015, mp: 0, bp: 100, criticalT: 374, criticalP: 218, tripleT: 0.01, tripleP: 0.00604, force: "Hydrogen bonding", color: "#ef4444" },
  carbonDioxide: { name: "Carbon Dioxide", formula: "CO₂", molarMass: 44.01, mp: -56.6, bp: -78.5, criticalT: 31.1, criticalP: 72.8, tripleT: -56.6, tripleP: 5.18, force: "London dispersion", color: "#ef4444", sublimes: true },
  argon: { name: "Argon", formula: "Ar", molarMass: 39.948, mp: -189.3, bp: -185.8, criticalT: -122.3, criticalP: 48.7, tripleT: -189.3, tripleP: 0.68, force: "London dispersion", color: "#8b5cf6" },
  ethanol: { name: "Ethanol", formula: "C₂H₅OH", molarMass: 46.07, mp: -114.1, bp: 78.4, criticalT: 241, criticalP: 61.4, tripleT: -123, tripleP: 0.0000043, force: "Hydrogen bonding", color: "#111827" },
};

export const WATER_HEATING = {
  mass: 1,
  initialTemperature: -20,
  cIce: 2.1,
  fusion: 334,
  cLiquid: 4.18,
  vaporization: 2257,
  cSteam: 2.0,
  qIce: 42,
  qMeltEnd: 376,
  qLiquidEnd: 794,
  qVaporEnd: 3051,
  qMax: 3500,
};

export function heatingState(q) {
  const e = Math.max(0, Math.min(WATER_HEATING.qMax, Number(q)));
  if (e < 42) return { energy: e, temperature: -20 + e / 2.1, phase: "Ice warming", solid: 1, liquid: 0, gas: 0 };
  if (e < 376) { const liquid = (e - 42) / 334; return { energy: e, temperature: 0, phase: "Melting (solid + liquid)", solid: 1 - liquid, liquid, gas: 0 }; }
  if (e < 794) return { energy: e, temperature: (e - 376) / 4.18, phase: "Liquid water warming", solid: 0, liquid: 1, gas: 0 };
  if (e < 3051) { const gas = (e - 794) / 2257; return { energy: e, temperature: 100, phase: "Vaporizing (liquid + gas)", solid: 0, liquid: 1 - gas, gas }; }
  return { energy: e, temperature: 100 + (e - 3051) / 2, phase: "Steam warming", solid: 0, liquid: 0, gas: 1 };
}

export function phaseAt(substanceId, temperature, pressure = 1) {
  const s = SUBSTANCES[substanceId] || SUBSTANCES.water;
  const p = Math.max(0.001, pressure);
  if (temperature >= s.criticalT && p >= s.criticalP) return "Supercritical fluid";
  if (s.sublimes && p < s.tripleP) return temperature < s.bp ? "Solid" : "Gas";
  const pressureShift = 18 * Math.log(p);
  const meltingShift = substanceId === "water" ? -0.0074 * (p - 1) : 0.02 * (p - 1);
  if (temperature < s.mp + meltingShift) return "Solid";
  if (temperature < s.bp + pressureShift) return "Liquid";
  return "Gas";
}

export function meanKineticEnergy(temperatureC) {
  const k = 1.380649e-23;
  return 1.5 * k * (Number(temperatureC) + 273.15) * 1e21;
}

export const RANKING = ["ethanol", "water", "carbonDioxide", "argon"];
