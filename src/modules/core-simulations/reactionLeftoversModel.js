export const REACTIONS = {
  water: {
    name: "Water Formation",
    equation: "2H₂ + O₂ → 2H₂O",
    reactants: ["H₂", "O₂"],
    products: ["H₂O"],
    coefficients: { "H₂": 2, "O₂": 1, "H₂O": 2 },
    atoms: { "H₂": { H: 2 }, "O₂": { O: 2 }, "H₂O": { H: 2, O: 1 } },
  },
  ammonia: {
    name: "Ammonia Synthesis",
    equation: "N₂ + 3H₂ → 2NH₃",
    reactants: ["N₂", "H₂"],
    products: ["NH₃"],
    coefficients: { "N₂": 1, "H₂": 3, "NH₃": 2 },
    atoms: { "N₂": { N: 2 }, "H₂": { H: 2 }, "NH₃": { N: 1, H: 3 } },
  },
  methane: {
    name: "Methane Combustion",
    equation: "CH₄ + 2O₂ → CO₂ + 2H₂O",
    reactants: ["CH₄", "O₂"],
    products: ["CO₂", "H₂O"],
    coefficients: { "CH₄": 1, "O₂": 2, "CO₂": 1, "H₂O": 2 },
    atoms: {
      "CH₄": { C: 1, H: 4 },
      "O₂": { O: 2 },
      "CO₂": { C: 1, O: 2 },
      "H₂O": { H: 2, O: 1 },
    },
  },
};

export const MOLAR_MASS = {
  "H₂": 2.016,
  "O₂": 32,
  "H₂O": 18.015,
  "N₂": 28.02,
  "NH₃": 17.034,
  "CH₄": 16.04,
  "CO₂": 44.01,
};

export function reactionOutcome(reactionKey, amounts) {
  const reaction = REACTIONS[reactionKey];
  const extent = Math.min(
    ...reaction.reactants.map((species) =>
      Math.floor(
        (Number(amounts[species]) || 0) / reaction.coefficients[species],
      ),
    ),
  );
  const consumed = Object.fromEntries(
    reaction.reactants.map((species) => [
      species,
      extent * reaction.coefficients[species],
    ]),
  );
  const leftovers = Object.fromEntries(
    reaction.reactants.map((species) => [
      species,
      (Number(amounts[species]) || 0) - consumed[species],
    ]),
  );
  const products = Object.fromEntries(
    reaction.products.map((species) => [
      species,
      extent * reaction.coefficients[species],
    ]),
  );
  const ratios = reaction.reactants.map(
    (species) =>
      (Number(amounts[species]) || 0) / reaction.coefficients[species],
  );
  const minRatio = Math.min(...ratios);
  const limiting = reaction.reactants.filter(
    (_, index) => Math.abs(ratios[index] - minRatio) < 1e-9,
  );
  return {
    extent,
    consumed,
    leftovers,
    products,
    limiting:
      limiting.length === reaction.reactants.length
        ? "Neither"
        : limiting.join(" and "),
  };
}

export function atomInventory(
  reactionKey,
  amounts,
  outcome = reactionOutcome(reactionKey, amounts),
) {
  const reaction = REACTIONS[reactionKey];
  const before = {};
  const after = {};
  for (const [species, count] of Object.entries(amounts)) {
    for (const [element, atoms] of Object.entries(
      reaction.atoms[species] || {},
    ))
      before[element] = (before[element] || 0) + count * atoms;
  }
  for (const [species, count] of Object.entries({
    ...outcome.leftovers,
    ...outcome.products,
  })) {
    for (const [element, atoms] of Object.entries(
      reaction.atoms[species] || {},
    ))
      after[element] = (after[element] || 0) + count * atoms;
  }
  return {
    before,
    after,
    conserved: Object.keys(before).every((key) => before[key] === after[key]),
  };
}

export function ammoniaYield(
  nitrogenMol = 5,
  hydrogenMol = 12,
  actualGrams = 126.6,
) {
  const extent = Math.min(nitrogenMol, hydrogenMol / 3);
  const ammoniaMol = extent * 2;
  const theoreticalGrams = ammoniaMol * MOLAR_MASS["NH₃"];
  return {
    extent,
    limiting:
      nitrogenMol < hydrogenMol / 3
        ? "N₂"
        : nitrogenMol > hydrogenMol / 3
          ? "H₂"
          : "Neither",
    nitrogenLeft: nitrogenMol - extent,
    hydrogenLeft: hydrogenMol - extent * 3,
    ammoniaMol,
    theoreticalGrams,
    percentYield: (actualGrams / theoreticalGrams) * 100,
    massBefore: nitrogenMol * MOLAR_MASS["N₂"] + hydrogenMol * MOLAR_MASS["H₂"],
  };
}
