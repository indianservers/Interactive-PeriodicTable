export const R = 0.008314462618; // MPa L mol⁻¹ K⁻¹
export const CO2 = {
  name: "Carbon dioxide",
  Tc: 304.1282,
  Pc: 7.3773,
  omega: 0.22394,
  molarMass: 44.0095,
};

export function idealPressure(T, Vm) {
  return (R * T) / Vm;
}

export function vanDerWaalsPressure(T, Vm, gas = CO2) {
  const a = (27 * R ** 2 * gas.Tc ** 2) / (64 * gas.Pc);
  const b = (R * gas.Tc) / (8 * gas.Pc);
  return (R * T) / (Vm - b) - a / Vm ** 2;
}

export function pengRobinsonPressure(T, Vm, gas = CO2) {
  const a = (0.45724 * R ** 2 * gas.Tc ** 2) / gas.Pc;
  const b = (0.0778 * R * gas.Tc) / gas.Pc;
  const kappa = 0.37464 + 1.54226 * gas.omega - 0.26992 * gas.omega ** 2;
  const alpha = (1 + kappa * (1 - Math.sqrt(T / gas.Tc))) ** 2;
  return (R * T) / (Vm - b) - (a * alpha) / (Vm * (Vm + b) + b * (Vm - b));
}

export function compressibility(P, Vm, T) {
  return (P * Vm) / (R * T);
}

export function stateAt(T = 300, Vm = 0.5) {
  const ideal = idealPressure(T, Vm);
  const vdw = vanDerWaalsPressure(T, Vm);
  const pr = pengRobinsonPressure(T, Vm);
  return {
    T,
    Vm,
    ideal,
    vdw,
    pr,
    Z: compressibility(pr, Vm, T),
    density: CO2.molarMass / Vm,
  };
}

export function reducedState(T, P, Vm) {
  return { Tr: T / CO2.Tc, Pr: P / CO2.Pc, Vr: Vm / 0.094 };
}

export function jouleThomson(T1 = 300, P1 = 10, P2 = 1, mu = 2.83) {
  const deltaP = P2 - P1;
  const deltaT = mu * deltaP;
  return { T1, P1, P2, mu, deltaP, deltaT, T2: T1 + deltaT };
}
