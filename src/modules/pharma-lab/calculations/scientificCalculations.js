const finite = (value, label) => {
  const number = Number(value);
  if (!Number.isFinite(number))
    throw new TypeError(`${label} must be a finite number`);
  return number;
};

const nonNegative = (value, label) => {
  const number = finite(value, label);
  if (number < 0) throw new RangeError(`${label} cannot be negative`);
  return number;
};

export const massToGrams = (value, unit = "g") => {
  const amount = nonNegative(value, "mass");
  const factors = { kg: 1000, g: 1, mg: 0.001, µg: 0.000001 };
  if (!(unit in factors))
    throw new RangeError(`Unsupported mass unit: ${unit}`);
  return amount * factors[unit];
};

export const volumeToMillilitres = (value, unit = "mL") => {
  const amount = nonNegative(value, "volume");
  const factors = { L: 1000, mL: 1, µL: 0.001 };
  if (!(unit in factors))
    throw new RangeError(`Unsupported volume unit: ${unit}`);
  return amount * factors[unit];
};

export const calculateMoles = ({ mass, massUnit = "g", molarMass }) => {
  const mw = finite(molarMass, "molar mass");
  if (mw <= 0) throw new RangeError("molar mass must be greater than zero");
  return massToGrams(mass, massUnit) / mw;
};

export const calculateLiquidMoles = ({
  volume,
  volumeUnit = "mL",
  density,
  molarMass,
}) => {
  const rho = finite(density, "density");
  if (rho <= 0) throw new RangeError("density must be greater than zero");
  return calculateMoles({
    mass: volumeToMillilitres(volume, volumeUnit) * rho,
    molarMass,
  });
};

export const calculateEquivalents = (moles, referenceMoles) => {
  const reference = finite(referenceMoles, "reference moles");
  if (reference <= 0)
    throw new RangeError("reference moles must be greater than zero");
  return nonNegative(moles, "moles") / reference;
};

export function findLimitingReagent(reagents) {
  if (!Array.isArray(reagents) || !reagents.length)
    throw new TypeError("reagents are required");
  const normalized = reagents.map((reagent) => {
    const coefficient = finite(
      reagent.coefficient,
      `${reagent.name} coefficient`,
    );
    if (coefficient <= 0)
      throw new RangeError(
        "stoichiometric coefficients must be greater than zero",
      );
    return {
      ...reagent,
      moles: nonNegative(reagent.moles, `${reagent.name} moles`),
      reactionExtent: reagent.moles / coefficient,
    };
  });
  return normalized.reduce((smallest, reagent) =>
    reagent.reactionExtent < smallest.reactionExtent ? reagent : smallest,
  );
}

export const theoreticalYield = ({
  limitingMoles,
  productCoefficient = 1,
  limitingCoefficient = 1,
  productMolarMass,
}) => {
  const productMoles =
    (nonNegative(limitingMoles, "limiting moles") *
      finite(productCoefficient, "product coefficient")) /
    finite(limitingCoefficient, "limiting coefficient");
  return {
    moles: productMoles,
    grams: productMoles * finite(productMolarMass, "product molar mass"),
  };
};

export const percentageYield = (actualGrams, theoreticalGrams) => {
  const theoretical = finite(theoreticalGrams, "theoretical yield");
  if (theoretical <= 0)
    throw new RangeError("theoretical yield must be greater than zero");
  return (nonNegative(actualGrams, "actual yield") / theoretical) * 100;
};

export const atomEconomy = (
  desiredProductMolarMass,
  sumReactantMolarMasses,
) => {
  const reactants = finite(sumReactantMolarMasses, "reactant molar masses");
  if (reactants <= 0)
    throw new RangeError("reactant molar masses must be greater than zero");
  return (
    (nonNegative(desiredProductMolarMass, "desired product molar mass") /
      reactants) *
    100
  );
};

export const eFactor = ({ inputMassGrams, isolatedProductGrams }) => {
  const product = finite(isolatedProductGrams, "isolated product mass");
  if (product <= 0)
    throw new RangeError("isolated product mass must be greater than zero");
  return (
    Math.max(0, nonNegative(inputMassGrams, "input mass") - product) / product
  );
};

export const percentRsd = (values) => {
  if (!Array.isArray(values) || values.length < 2)
    throw new TypeError("at least two values are required");
  const nums = values.map((value) => finite(value, "RSD value"));
  const mean = nums.reduce((sum, value) => sum + value, 0) / nums.length;
  if (mean === 0) throw new RangeError("RSD mean cannot be zero");
  const variance =
    nums.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    (nums.length - 1);
  return (Math.sqrt(variance) / Math.abs(mean)) * 100;
};

export const weakAcidSolubility = ({
  intrinsicSolubility,
  pH,
  pKa,
  temperatureCelsius = 25,
  temperatureCoefficient = 0.025,
}) => {
  const s0 = finite(intrinsicSolubility, "intrinsic solubility");
  if (s0 <= 0)
    throw new RangeError("intrinsic solubility must be greater than zero");
  const acidity = finite(pH, "pH");
  const dissociation = finite(pKa, "pKa");
  const temperature = finite(temperatureCelsius, "temperature");
  if (acidity < 0 || acidity > 14)
    throw new RangeError("pH must be between 0 and 14");
  const ionizationFactor = 1 + 10 ** (acidity - dissociation);
  return (
    s0 *
    ionizationFactor *
    Math.exp(
      finite(temperatureCoefficient, "temperature coefficient") *
        (temperature - 25),
    )
  );
};

export const weakAcidLogD = ({ logP, pH, pKa }) => {
  const acidity = finite(pH, "pH");
  if (acidity < 0 || acidity > 14)
    throw new RangeError("pH must be between 0 and 14");
  return (
    finite(logP, "logP") - Math.log10(1 + 10 ** (acidity - finite(pKa, "pKa")))
  );
};

export const compatibilityRisk = ({
  humidityPercent,
  temperatureCelsius,
  days,
  excipientFactor = 1,
}) => {
  const humidity = finite(humidityPercent, "relative humidity");
  if (humidity < 0 || humidity > 100)
    throw new RangeError("relative humidity must be between 0 and 100");
  const time = nonNegative(days, "storage duration");
  const factor = nonNegative(excipientFactor, "excipient factor");
  return Math.min(
    100,
    Math.max(
      0,
      factor *
        (humidity / 75) *
        ((finite(temperatureCelsius, "temperature") + 273.15) / 313.15) *
        Math.sqrt(time / 30 || 0) *
        42,
    ),
  );
};

export function linearRegression(points) {
  if (!Array.isArray(points) || points.length < 2)
    throw new TypeError("at least two calibration points are required");
  const pairs = points.map((point) => ({
    x: finite(point.x, "calibration x"),
    y: finite(point.y, "calibration y"),
  }));
  const n = pairs.length,
    meanX = pairs.reduce((sum, p) => sum + p.x, 0) / n,
    meanY = pairs.reduce((sum, p) => sum + p.y, 0) / n;
  const denominator = pairs.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  if (denominator === 0)
    throw new RangeError("calibration concentrations must not all be equal");
  const slope =
    pairs.reduce((sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0) /
    denominator;
  const intercept = meanY - slope * meanX;
  const ssTotal = pairs.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0),
    ssResidual = pairs.reduce(
      (sum, p) => sum + (p.y - (slope * p.x + intercept)) ** 2,
      0,
    );
  return {
    slope,
    intercept,
    rSquared: ssTotal === 0 ? 1 : 1 - ssResidual / ssTotal,
  };
}

export const hplcAssay = ({
  sampleArea,
  standardArea,
  sampleConcentration,
  standardConcentration,
  potencyFraction = 1,
}) => {
  const stdArea = finite(standardArea, "standard area"),
    sampleConc = finite(sampleConcentration, "sample concentration");
  if (stdArea <= 0 || sampleConc <= 0)
    throw new RangeError(
      "standard area and sample concentration must be greater than zero",
    );
  return (
    (((nonNegative(sampleArea, "sample area") / stdArea) *
      finite(standardConcentration, "standard concentration")) /
      sampleConc) *
    finite(potencyFraction, "potency fraction") *
    100
  );
};

export const impurityPercent = ({
  impurityArea,
  totalArea,
  responseFactor = 1,
}) => {
  const total = finite(totalArea, "total peak area"),
    factor = finite(responseFactor, "response factor");
  if (total <= 0 || factor <= 0)
    throw new RangeError(
      "total area and response factor must be greater than zero",
    );
  return (nonNegative(impurityArea, "impurity area") / total / factor) * 100;
};

export function arrheniusActivationEnergy(points) {
  if (!Array.isArray(points) || points.length < 2)
    throw new TypeError("at least two temperature-rate points are required");
  const transformed = points.map(({ temperatureCelsius, rate }) => {
    const kelvin = finite(temperatureCelsius, "temperature") + 273.15;
    const k = finite(rate, "degradation rate");
    if (kelvin <= 0 || k <= 0)
      throw new RangeError(
        "absolute temperature and degradation rate must be greater than zero",
      );
    return { x: 1 / kelvin, y: Math.log(k) };
  });
  const regression = linearRegression(transformed);
  return {
    ...regression,
    activationEnergyKjPerMol: (-regression.slope * 8.314462618) / 1000,
  };
}

export function firstOrderShelfLifeMonths({
  ratePerMonth,
  lowerAssayPercent = 90,
  initialAssayPercent = 100,
}) {
  const rate = finite(ratePerMonth, "degradation rate");
  const lower = finite(lowerAssayPercent, "lower assay limit");
  const initial = finite(initialAssayPercent, "initial assay");
  if (rate <= 0 || lower <= 0 || initial <= lower)
    throw new RangeError(
      "rate must be positive and initial assay must exceed the lower limit",
    );
  return Math.log(initial / lower) / rate;
}

export function trapezoidalAuc(points) {
  if (!Array.isArray(points) || points.length < 2)
    throw new TypeError("at least two concentration-time points are required");
  const pairs = points
    .map(({ x, y }) => ({
      x: nonNegative(x, "time"),
      y: nonNegative(y, "concentration"),
    }))
    .sort((a, b) => a.x - b.x);
  for (let i = 1; i < pairs.length; i += 1)
    if (pairs[i].x === pairs[i - 1].x)
      throw new RangeError("concentration-time points must have unique times");
  return pairs
    .slice(1)
    .reduce(
      (sum, point, index) =>
        sum + ((point.x - pairs[index].x) * (point.y + pairs[index].y)) / 2,
      0,
    );
}
