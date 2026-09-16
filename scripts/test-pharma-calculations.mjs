import test from "node:test";
import assert from "node:assert/strict";
import {
  arrheniusActivationEnergy,
  atomEconomy,
  calculateEquivalents,
  calculateLiquidMoles,
  calculateMoles,
  compatibilityRisk,
  eFactor,
  findLimitingReagent,
  firstOrderShelfLifeMonths,
  hplcAssay,
  impurityPercent,
  linearRegression,
  massToGrams,
  percentageYield,
  percentRsd,
  theoreticalYield,
  trapezoidalAuc,
  volumeToMillilitres,
  weakAcidLogD,
  weakAcidSolubility,
} from "../src/modules/pharma-lab/calculations/scientificCalculations.js";
import {
  estimateParacetamolConversion,
  nextSynthesisStage,
} from "../src/modules/pharma-lab/simulation/synthesisModel.js";
import {
  defaultTabletFormula,
  formulaTotal,
  simulateTabletBatch,
  validateTabletFormula,
} from "../src/modules/pharma-lab/simulation/formulationModel.js";
import {
  dissolutionAcceptance,
  dissolutionProfile,
  sampleWithReplacement,
  vesselProfiles,
} from "../src/modules/pharma-lab/simulation/dissolutionModel.js";
import {
  calibrationPoints,
  simulateHplcMethod,
} from "../src/modules/pharma-lab/simulation/hplcModel.js";
import {
  packagingComparison,
  simulateStability,
} from "../src/modules/pharma-lab/simulation/stabilityModel.js";
import {
  massBalanceAt,
  simulateOralPk,
} from "../src/modules/pharma-lab/simulation/admeModel.js";
import {
  doseResponse,
  simulateToxicology,
} from "../src/modules/pharma-lab/simulation/toxicologyModel.js";

test("unit conversions preserve dimensions", () => {
  assert.equal(massToGrams(1250, "mg"), 1.25);
  assert.equal(volumeToMillilitres(0.012, "L"), 12);
  assert.throws(() => massToGrams(1, "mL"), /Unsupported mass unit/);
  assert.throws(() => massToGrams(-1, "g"), /negative/);
});

test("paracetamol synthesis stoichiometry finds the limiting reagent", () => {
  const aminophenol = calculateMoles({ mass: 5, molarMass: 109.13 });
  const anhydride = calculateLiquidMoles({
    volume: 5,
    density: 1.082,
    molarMass: 102.09,
  });
  assert.ok(Math.abs(aminophenol - 0.045817) < 0.00001);
  assert.ok(
    Math.abs(calculateEquivalents(anhydride, aminophenol) - 1.157) < 0.002,
  );
  assert.equal(
    findLimitingReagent([
      { name: "p-aminophenol", moles: aminophenol, coefficient: 1 },
      { name: "acetic anhydride", moles: anhydride, coefficient: 1 },
    ]).name,
    "p-aminophenol",
  );
});

test("yield and green metrics use the balanced 1:1 reaction", () => {
  const theoretical = theoreticalYield({
    limitingMoles: 5 / 109.13,
    productMolarMass: 151.16,
  });
  assert.ok(Math.abs(theoretical.grams - 6.925) < 0.002);
  assert.ok(Math.abs(percentageYield(5.75, theoretical.grams) - 83.03) < 0.05);
  assert.ok(Math.abs(atomEconomy(151.16, 109.13 + 102.09) - 71.56) < 0.02);
  assert.ok(
    eFactor({
      inputMassGrams: 5 + 5 * 1.082 + 20,
      isolatedProductGrams: 5.75,
    }) > 4,
  );
});

test("sample RSD and invalid boundaries", () => {
  assert.ok(
    Math.abs(percentRsd([99.2, 100.1, 100.4, 99.8, 100.0, 99.6]) - 0.419) <
      0.001,
  );
  assert.throws(() => percentageYield(1, 0), /greater than zero/);
  assert.throws(
    () => calculateLiquidMoles({ volume: 1, density: 0, molarMass: 10 }),
    /density/,
  );
});

test("synthesis workflow blocks unsafe and premature actions", () => {
  assert.match(
    nextSynthesisStage({ stage: 1, equivalents: 0.7, rpm: 350, conversion: 0 })
      .validation,
    /1.0–2.5 equivalents/,
  );
  assert.match(
    nextSynthesisStage({ stage: 2, equivalents: 1.2, rpm: 100, conversion: 0 })
      .validation,
    /at least 250 rpm/,
  );
  assert.match(
    nextSynthesisStage({ stage: 3, equivalents: 1.2, rpm: 350, conversion: 60 })
      .validation,
    /below 85%/,
  );
  assert.equal(
    nextSynthesisStage({ stage: 3, equivalents: 1.2, rpm: 350, conversion: 90 })
      .stage,
    4,
  );
  assert.ok(
    estimateParacetamolConversion({
      elapsedMinutes: 45,
      temperatureCelsius: 85,
    }) >= 95,
  );
  assert.ok(
    estimateParacetamolConversion({
      elapsedMinutes: 45,
      temperatureCelsius: 40,
    }) < 40,
  );
  assert.throws(
    () =>
      estimateParacetamolConversion({
        elapsedMinutes: -1,
        temperatureCelsius: 85,
      }),
    /cannot be negative/,
  );
});

test("pH-solubility and logD respond to ionization and temperature", () => {
  const acidic = weakAcidSolubility({
    intrinsicSolubility: 14,
    pH: 5,
    pKa: 9.38,
    temperatureCelsius: 25,
  });
  const basic = weakAcidSolubility({
    intrinsicSolubility: 14,
    pH: 10,
    pKa: 9.38,
    temperatureCelsius: 25,
  });
  const warm = weakAcidSolubility({
    intrinsicSolubility: 14,
    pH: 5,
    pKa: 9.38,
    temperatureCelsius: 40,
  });
  assert.ok(basic > acidic * 5);
  assert.ok(warm > acidic);
  assert.ok(
    weakAcidLogD({ logP: 0.5, pH: 10, pKa: 9.38 }) <
      weakAcidLogD({ logP: 0.5, pH: 5, pKa: 9.38 }),
  );
  assert.throws(
    () => weakAcidSolubility({ intrinsicSolubility: 14, pH: 15, pKa: 9.38 }),
    /between 0 and 14/,
  );
});

test("compatibility risk handles storage boundaries", () => {
  assert.equal(
    compatibilityRisk({ humidityPercent: 75, temperatureCelsius: 40, days: 0 }),
    0,
  );
  assert.ok(
    compatibilityRisk({
      humidityPercent: 75,
      temperatureCelsius: 40,
      days: 180,
      excipientFactor: 1.2,
    }) >
      compatibilityRisk({
        humidityPercent: 40,
        temperatureCelsius: 25,
        days: 30,
        excipientFactor: 0.7,
      }),
  );
  assert.throws(
    () =>
      compatibilityRisk({
        humidityPercent: 120,
        temperatureCelsius: 25,
        days: 30,
      }),
    /between 0 and 100/,
  );
});

test("tablet formula and CQAs remain coupled to process settings", () => {
  assert.equal(formulaTotal(defaultTabletFormula), 650);
  assert.equal(validateTabletFormula(defaultTabletFormula, 650).valid, true);
  assert.equal(validateTabletFormula(defaultTabletFormula, 640).valid, false);
  const nominal = simulateTabletBatch({ formula: defaultTabletFormula });
  const highForce = simulateTabletBatch({
    formula: defaultTabletFormula,
    force: 25,
  });
  assert.ok(nominal.weightRsd < 5);
  assert.ok(nominal.hardnessMean >= 80 && nominal.hardnessMean <= 110);
  assert.ok(highForce.hardnessMean > nominal.hardnessMean);
  assert.ok(highForce.friability < nominal.friability);
  assert.equal(Object.values(nominal.passes).every(Boolean), true);
});

test("dissolution kinetics, six-vessel rules, and sampling are bounded", () => {
  const baseline = dissolutionProfile();
  const faster = dissolutionProfile({ rpm: 75, temperature: 37 });
  assert.equal(vesselProfiles().length, 6);
  assert.ok(faster[3].y > baseline[3].y);
  assert.equal(
    dissolutionAcceptance([86, 88, 90, 91, 87, 89], { q: 80, stage: "S1" })
      .pass,
    true,
  );
  assert.equal(
    dissolutionAcceptance([84, 88, 90, 91, 87, 89], { q: 80, stage: "S1" })
      .pass,
    false,
  );
  assert.equal(
    dissolutionAcceptance([68, 82, 84, 85, 83, 82], { q: 80, stage: "S2" })
      .pass,
    true,
  );
  assert.equal(
    sampleWithReplacement({
      concentrationMgPerMl: 0.5,
      sampleVolumeMl: 10,
      mediumVolumeMl: 900,
    }).remainingVolumeMl,
    900,
  );
  assert.throws(() => dissolutionAcceptance([90, 90], { q: 80 }), /six vessel/);
  assert.throws(
    () =>
      sampleWithReplacement({
        concentrationMgPerMl: 0.5,
        sampleVolumeMl: 900,
        mediumVolumeMl: 900,
      }),
    /below medium volume/,
  );
});

test("HPLC regression, assay, impurity, and method effects are coupled", () => {
  const regression = linearRegression(calibrationPoints);
  assert.ok(regression.slope > 42000 && regression.slope < 44000);
  assert.ok(regression.rSquared > 0.9999);
  assert.ok(
    Math.abs(
      hplcAssay({
        sampleArea: 17964000,
        standardArea: 17964000,
        sampleConcentration: 100,
        standardConcentration: 100,
      }) - 100,
    ) < 0.001,
  );
  assert.ok(
    Math.abs(impurityPercent({ impurityArea: 1000, totalArea: 100000 }) - 1) <
      0.001,
  );
  const nominal = simulateHplcMethod();
  const fast = simulateHplcMethod({ flow: 1.5, organicPercent: 45 });
  assert.ok(nominal.assay > 98 && nominal.assay < 102);
  assert.ok(fast.pressure > nominal.pressure);
  assert.ok(
    fast.peaks.find((peak) => peak.name === "Paracetamol").rt <
      nominal.peaks.find((peak) => peak.name === "Paracetamol").rt,
  );
  assert.throws(
    () =>
      hplcAssay({
        sampleArea: 1,
        standardArea: 0,
        sampleConcentration: 1,
        standardConcentration: 1,
      }),
    /standard area/i,
  );
});

test("stability packaging, Arrhenius, and shelf-life models are bounded", () => {
  const accelerated = simulateStability({
    condition: "accelerated",
    packageType: "pvc",
    months: 6,
  });
  const protectedPack = simulateStability({
    condition: "accelerated",
    packageType: "alu",
    months: 6,
  });
  assert.equal(packagingComparison.length, 3);
  assert.ok(accelerated.current.assay < protectedPack.current.assay);
  assert.ok(accelerated.current.impurities > protectedPack.current.impurities);
  assert.ok(accelerated.arrhenius.rSquared > 0.99);
  assert.ok(accelerated.arrhenius.activationEnergyKjPerMol > 40);
  assert.ok(firstOrderShelfLifeMonths({ ratePerMonth: 0.004 }) > 20);
  assert.throws(
    () => arrheniusActivationEnergy([{ temperatureCelsius: 25, rate: 0 }]),
    /at least two|greater than zero/,
  );
  assert.throws(() => simulateStability({ months: 5 }), /scheduled month/);
});

test("oral PK exposure responds to dose, food, and organ function", () => {
  const nominal = simulateOralPk();
  const doubleDose = simulateOralPk({ doseMg: 1000 });
  const fed = simulateOralPk({ fed: true });
  const impaired = simulateOralPk({ hepatic: 0.5, renal: 0.6 });
  assert.ok(Math.abs(doubleDose.cmax / nominal.cmax - 2) < 0.02);
  assert.ok(fed.tmax > nominal.tmax);
  assert.ok(impaired.halfLife > nominal.halfLife);
  assert.ok(nominal.auc > 20 && nominal.auc < 50);
  assert.ok(
    trapezoidalAuc([
      { x: 0, y: 0 },
      { x: 1, y: 2 },
    ]) === 1,
  );
  const balance = massBalanceAt(24, nominal);
  assert.ok(
    Math.abs(
      Object.values(balance).reduce((sum, value) => sum + value, 0) - 100,
    ) < 0.001,
  );
  assert.throws(() => simulateOralPk({ doseMg: 0 }), /greater than zero/);
});

test("toxicology risk rises with exposure and vulnerable patient factors", () => {
  const therapeutic = simulateToxicology();
  const overdose = simulateToxicology({ doseMg: 8000 });
  const vulnerable = simulateToxicology({
    doseMg: 8000,
    liver: "impaired",
    alcohol: "chronic",
    repeated: true,
  });
  assert.equal(therapeutic.risk, "Low");
  assert.ok(overdose.napqiBurden > therapeutic.napqiBurden);
  assert.ok(overdose.gshReserve < therapeutic.gshReserve);
  assert.ok(vulnerable.injuryProbability > overdose.injuryProbability);
  assert.ok(vulnerable.alt > therapeutic.alt);
  assert.equal(doseResponse.length, 20);
  assert.ok(doseResponse.at(-1).injury > doseResponse[0].injury);
  assert.throws(() => simulateToxicology({ weightKg: 0 }), /greater than zero/);
});
