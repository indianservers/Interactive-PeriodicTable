// Educational models for B.Sc organic preparations (BSCH-302).
// Yields and melting ranges are representative teaching values, not literature measurements.

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const aromaticPrepExperiments = {
  bromination: {
    id: "bromination-phenol-aniline",
    title: "Bromination of Phenol and Aniline",
    kicker: "Electrophilic aromatic substitution",
    lead: "Compare how strongly activated rings brominate in water, and why aniline is often protected first.",
    equation: "Ar–H + 3 Br₂ → 2,4,6-tribromo-Ar + 3 HBr",
    hazard: "Bromine water is corrosive and toxic. Use a fume hood, gloves and eye protection.",
    substrates: {
      phenol: {
        label: "Phenol",
        product: "2,4,6-Tribromophenol",
        formula: "C₆H₃Br₃O",
        molarMass: 330.8,
        mp: "94–96 °C",
        appearance: "White crystalline precipitate",
        directing: "–OH is strongly activating and ortho/para-directing; aqueous Br₂ gives the tribromo product immediately.",
        limitingName: "phenol",
      },
      aniline: {
        label: "Aniline",
        product: "2,4,6-Tribromoaniline",
        formula: "C₆H₄Br₃N",
        molarMass: 329.83,
        mp: "118–122 °C",
        appearance: "White to pale-brown precipitate",
        directing: "–NH₂ is even more activating than –OH; uncontrolled bromination also gives the tribromo product.",
        limitingName: "aniline",
      },
      acetanilide: {
        label: "Acetanilide (protected aniline)",
        product: "p-Bromoacetanilide",
        formula: "C₈H₈BrNO",
        molarMass: 214.06,
        mp: "166–169 °C",
        appearance: "Colourless needles after recrystallisation",
        directing: "The acetamido group is milder; glacial acetic acid / Br₂ favours the para isomer used in college practicals.",
        limitingName: "acetanilide",
      },
    },
    quiz: {
      q1: { prompt: "Why does phenol give 2,4,6-tribromophenol with bromine water at room temperature?", correct: "activating", options: [
        { id: "activating", label: "The OH group strongly activates the ring, so all ortho/para sites react" },
        { id: "meta", label: "OH is a meta director, so three meta bromines enter" },
        { id: "addition", label: "Bromine adds across the aromatic ring like an alkene" },
      ] },
      q2: { prompt: "Why is aniline often acetylated before bromination in the prescribed preparation?", correct: "control", options: [
        { id: "control", label: "Protection lowers reactivity and favours p-bromoacetanilide" },
        { id: "colour", label: "Acetylation is only used to change the colour of the product" },
        { id: "mass", label: "Acetylation increases the molar mass so weighing is easier" },
      ] },
      q3: { prompt: "What observation confirms bromination of phenol in water?", correct: "white", options: [
        { id: "white", label: "A white precipitate of 2,4,6-tribromophenol appears at once" },
        { id: "pink", label: "The solution turns phenolphthalein pink" },
        { id: "gas", label: "Hydrogen gas is evolved vigorously" },
      ] },
    },
  },
  benzoylation: {
    id: "benzoylation-aniline-phenol",
    title: "Benzoylation of Aniline and Phenol",
    kicker: "Schotten–Baumann reaction",
    lead: "Acylate aniline and phenol with benzoyl chloride in aqueous alkali, then isolate benzanilide or phenyl benzoate.",
    equation: "Ar–XH + PhCOCl + NaOH → Ar–XCOPh + NaCl + H₂O",
    hazard: "Benzoyl chloride is lachrymatory and corrosive. Keep aqueous alkali present and work in a fume hood.",
    substrates: {
      aniline: {
        label: "Aniline",
        product: "Benzanilide",
        formula: "C₁₃H₁₁NO",
        molarMass: 197.23,
        mp: "161–163 °C",
        appearance: "Colourless crystals from ethanol",
        directing: "The amine is benzoylated on nitrogen (N-acylation), not on the ring, under Schotten–Baumann conditions.",
        limitingName: "aniline",
      },
      phenol: {
        label: "Phenol",
        product: "Phenyl benzoate",
        formula: "C₁₃H₁₀O₂",
        molarMass: 198.22,
        mp: "68–71 °C",
        appearance: "Colourless crystals after recrystallisation",
        directing: "Phenoxide is a better nucleophile than phenol; alkali is essential for O-benzoylation.",
        limitingName: "phenol",
      },
    },
    quiz: {
      q1: { prompt: "What is the role of aqueous NaOH in Schotten–Baumann benzoylation?", correct: "scavenge", options: [
        { id: "scavenge", label: "It generates the nucleophile and neutralises HCl as it forms" },
        { id: "oxidise", label: "It oxidises benzoyl chloride to benzoic acid first" },
        { id: "catalyst", label: "It is only a Friedel–Crafts Lewis-acid catalyst" },
      ] },
      q2: { prompt: "Which product is obtained from aniline and benzoyl chloride?", correct: "amide", options: [
        { id: "amide", label: "Benzanilide (an N-benzoyl amide)" },
        { id: "ester", label: "Phenyl benzoate" },
        { id: "azo", label: "An azo dye" },
      ] },
      q3: { prompt: "Why must benzoyl chloride be added slowly with shaking?", correct: "exotherm", options: [
        { id: "exotherm", label: "The reaction is exothermic and hydrolysis competes if mixing is poor" },
        { id: "light", label: "Benzoyl chloride is photolabile and must not see light" },
        { id: "vacuum", label: "The flask must remain under vacuum throughout" },
      ] },
    },
  },
};

export function aromaticPrepYield({ experiment, substrate, equivalents, temperature, minutes, alkali }) {
  const spec = aromaticPrepExperiments[experiment];
  const sub = spec.substrates[substrate];
  const eq = clamp(equivalents, 0.5, 5);
  const t = clamp(temperature, 0, 80);
  const time = clamp(minutes, 0, 40);
  const base = clamp(alkali, 0, 20);

  const requiredEq = experiment === "bromination" ? (substrate === "acetanilide" ? 1 : 3) : 1.1;
  const eqScore = 1 - Math.min(0.55, Math.abs(eq - requiredEq) / requiredEq);
  const tempScore = experiment === "bromination"
    ? (substrate === "acetanilide" ? (t >= 15 && t <= 40 ? 1 : 0.72) : (t <= 35 ? 1 : 0.8))
    : (t >= 5 && t <= 25 ? 1 : 0.75);
  const timeScore = time >= 8 ? Math.min(1, time / 12) : 0.45;
  const alkaliScore = experiment === "benzoylation" ? (base >= 4 && base <= 12 ? 1 : 0.55) : 1;
  const conversion = clamp(100 * eqScore * tempScore * timeScore * alkaliScore, 8, 98);

  const chargeG = 2.0;
  const moles = chargeG / (substrate === "phenol" ? 94.11 : substrate === "aniline" ? 93.13 : 135.16);
  const theoretical = moles * sub.molarMass;
  const recovered = theoretical * conversion / 100 * 0.92;
  const mpSpread = conversion > 85 ? 1.2 : conversion > 60 ? 2.8 : 6;

  return {
    conversion,
    theoretical,
    recovered,
    yieldPct: recovered / theoretical * 100,
    mpSpread,
    colour: experiment === "bromination"
      ? (conversion > 40 ? "White / cream precipitate" : "Pale yellow solution")
    : (conversion > 40 ? "Solid separates on shaking" : "Oily droplets, incomplete"),
    observation: experiment === "bromination"
      ? (substrate === "phenol"
        ? "Bromine colour discharges and a bulky white ppt of 2,4,6-tribromophenol forms."
        : substrate === "aniline"
          ? "Bromine is consumed and solid 2,4,6-tribromoaniline separates."
          : "Bromine is consumed; p-bromoacetanilide separates from acetic acid.")
      : (substrate === "aniline"
        ? "The odour of benzoyl chloride fades as benzanilide precipitates."
        : "Phenyl benzoate separates after shaking with alkali."),
  };
}

export function aromaticPrepReport(experiment, substrate, run) {
  const spec = aromaticPrepExperiments[experiment];
  const sub = spec.substrates[substrate];
  return {
    title: spec.title,
    substrate: sub.label,
    product: sub.product,
    formula: sub.formula,
    ...run,
  };
}
