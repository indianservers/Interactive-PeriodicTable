const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const fmt = (n, d = 3) => (Number.isFinite(n) ? n.toFixed(d) : "—");

const control = (key, label, min, max, step, unit, value) => ({ key, label, min, max, step, unit, value });

const quiz = (prompt, correct, options) => ({ prompt, correct, options });

const lab = (partial) => ({
  screens: 6,
  kind: "lab",
  controls: [],
  apparatus: [],
  steps: [],
  quiz: [],
  ...partial,
});

export const syllabusInteractives = [
  lab({
    id: "washing-soda-carbonate",
    title: "Estimation of Carbonate in Washing Soda",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Standardise HCl and estimate Na₂CO₃ in washing soda with methyl orange.",
    kicker: "Acid–base titration",
    lead: "Determine % Na₂CO₃ in a household washing-soda sample using standardised hydrochloric acid.",
    equation: "Na₂CO₃ + 2 HCl → 2 NaCl + H₂O + CO₂",
    hazard: "HCl is corrosive. Keep the burette vertical and never pipette by mouth.",
    theory: "Methyl orange changes at the complete conversion of carbonate to carbonic acid. Two moles of HCl are required per mole of Na₂CO₃.",
    apparatus: ["Burette (HCl)", "Pipette 25 mL", "Conical flask", "Methyl orange", "Washing soda solution"],
    controls: [control("mass", "Sample mass in 250 mL", 0.8, 3, 0.01, "g", 1.325), control("hcl", "HCl concentration", 0.05, 0.2, 0.001, "M", 0.102), control("volume", "Titre volume", 5, 40, 0.05, "mL", 24.5)],
    compute: (v) => {
      const moles = (v.hcl * v.volume) / 1000 / 2;
      const aliquotFrac = 25 / 250;
      const sampleMoles = moles / aliquotFrac;
      const percent = (sampleMoles * 105.99 / v.mass) * 100;
      return { primary: `${fmt(percent, 2)} % Na₂CO₃`, detail: `n(Na₂CO₃) in aliquot ${fmt(moles, 4)} mol`, observation: v.volume > 18 ? "Permanent orange end-point with methyl orange." : "Still yellow: continue dropwise.", quality: percent > 30 && percent < 110 ? "Plausible washing-soda assay" : "Check sample mass and titre", chart: titreCurve(v.volume, 24.6) };
    },
    steps: ["Weigh washing soda and dissolve to 250 mL.", "Pipette 25 mL into a flask.", "Add methyl orange and titrate with HCl to orange.", "Calculate % Na₂CO₃ using 2:1 stoichiometry."],
    quiz: [quiz("Why is methyl orange used rather than phenolphthalein for total carbonate?", "full", ["Only methyl orange captures the second protonation to H₂CO₃", "Phenolphthalein is not an acid–base indicator", "Methyl orange is required by the sodium ions"])],
  }),
  lab({
    id: "baking-soda-bicarbonate",
    title: "Estimation of Bicarbonate in Baking Soda",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Titrate NaHCO₃ with standardised HCl to a methyl-orange end-point.",
    kicker: "Acid–base titration",
    lead: "Assay sodium bicarbonate in baking soda. One mole of HCl is required per mole of HCO₃⁻.",
    equation: "NaHCO₃ + HCl → NaCl + H₂O + CO₂",
    hazard: "Avoid inhaling CO₂ evolved near the end-point; swirl in a well-ventilated space.",
    theory: "Bicarbonate is a weak base. Methyl orange detects complete conversion to carbonic acid.",
    apparatus: ["Burette", "Pipette", "Baking soda solution", "Methyl orange"],
    controls: [control("mass", "Sample mass in 250 mL", 0.8, 3, 0.01, "g", 1.05), control("hcl", "HCl concentration", 0.05, 0.2, 0.001, "M", 0.1), control("volume", "Titre volume", 5, 40, 0.05, "mL", 25.0)],
    compute: (v) => {
      const moles = (v.hcl * v.volume) / 1000;
      const percent = (moles / (25 / 250) * 84.01 / v.mass) * 100;
      return { primary: `${fmt(percent, 2)} % NaHCO₃`, detail: `Aliquot moles ${fmt(moles, 4)}`, observation: "CO₂ fizz near the end-point; orange colour persists.", quality: percent > 70 && percent < 105 ? "Typical baking-soda assay" : "Review drying and titre", chart: titreCurve(v.volume, 25) };
    },
    steps: ["Prepare a 250 mL sample solution.", "Titrate 25 mL aliquots with HCl / methyl orange.", "Report mean titre and % NaHCO₃."],
    quiz: [quiz("What is the mole ratio HCl : NaHCO₃?", "one", ["1 : 1", "2 : 1", "1 : 2"])],
  }),
  lab({
    id: "carbonate-bicarbonate-mixture",
    title: "Carbonate and Bicarbonate in a Mixture",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Use phenolphthalein then methyl orange to resolve Na₂CO₃ and NaHCO₃ in one sample.",
    kicker: "Two-indicator titration",
    lead: "Phenolphthalein titre (V₁) measures CO₃²⁻ → HCO₃⁻. Methyl orange titre (V₂) completes both carbonate and bicarbonate.",
    equation: "V₁ ∝ n(CO₃²⁻); V₂ − V₁ ∝ n(HCO₃⁻) + n(HCO₃⁻ from CO₃²⁻)",
    hazard: "Do not overshoot the first end-point; it is used in the second calculation.",
    theory: "n(CO₃²⁻) = C_HCl V₁. Remaining titre (V₂ − V₁) includes the second proton of carbonate plus any original bicarbonate.",
    apparatus: ["Burette", "Phenolphthalein", "Methyl orange", "Mixture flask"],
    controls: [control("hcl", "HCl concentration", 0.05, 0.2, 0.001, "M", 0.1), control("v1", "Phenolphthalein titre V₁", 4, 25, 0.05, "mL", 12.4), control("v2", "Methyl orange titre V₂", 8, 45, 0.05, "mL", 28.6)],
    compute: (v) => {
      const nCO3 = v.hcl * v.v1 / 1000;
      const nHCO3 = v.hcl * (v.v2 - 2 * v.v1) / 1000;
      return { primary: `CO₃²⁻ ${fmt(nCO3 * 1000, 2)} mmol · HCO₃⁻ ${fmt(nHCO3 * 1000, 2)} mmol`, detail: nHCO3 > 0 ? "Mixture contains both ions" : "V₂ < 2V₁: first end-point overshot or no bicarbonate", observation: "Colourless after V₁; orange after V₂.", quality: v.v2 > v.v1 ? "Titres in the expected order" : "V₂ must exceed V₁", chart: titreCurve(v.v2, v.v2) };
    },
    steps: ["Titrate to phenolphthalein colourless (V₁).", "Add methyl orange to the same flask and continue to orange (V₂).", "Compute both ions from V₁ and V₂."],
    quiz: [quiz("If V₂ = 2V₁, what does the mixture contain?", "only-carb", ["Only carbonate", "Only bicarbonate", "Equal moles of acid"])],
  }),
  lab({
    id: "antacid-alkali",
    title: "Alkali Content in an Antacid",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Back-titrate leftover HCl after dissolving an antacid tablet.",
    kicker: "Back titration",
    lead: "Dissolve the tablet in excess standard HCl, then titrate unused acid with NaOH to find milliequivalents of alkali.",
    equation: "Antacid + HCl(excess) → salt + leftover HCl; leftover HCl + NaOH → NaCl + H₂O",
    hazard: "Tablets may contain flavourings; this is a chemical assay, not a medical dose calculator.",
    theory: "n(alkali) = n(HCl added) − n(NaOH titre).",
    apparatus: ["Tablet", "Excess HCl", "NaOH burette", "Phenolphthalein"],
    controls: [control("hclVol", "HCl added", 20, 50, 0.1, "mL", 50), control("hcl", "HCl molarity", 0.05, 0.2, 0.001, "M", 0.1), control("naoh", "NaOH molarity", 0.05, 0.2, 0.001, "M", 0.1), control("titre", "NaOH titre", 5, 40, 0.05, "mL", 18.4)],
    compute: (v) => {
      const leftover = v.naoh * v.titre / 1000;
      const added = v.hcl * v.hclVol / 1000;
      const alkali = (added - leftover) * 1000;
      return { primary: `${fmt(alkali, 2)} mmol alkali / tablet`, detail: `Leftover acid ${fmt(leftover * 1000, 2)} mmol`, observation: "First permanent pink of phenolphthalein.", quality: alkali > 0 ? "Excess acid was sufficient" : "Increase HCl volume", chart: titreCurve(v.titre, 18.4) };
    },
    steps: ["Crush and dissolve the tablet in a known excess of HCl.", "Back-titrate with NaOH / phenolphthalein.", "Report mmol alkali per tablet."],
    quiz: [quiz("Why is a back titration used?", "insoluble", ["The antacid is not fully soluble/slow in a direct titration", "NaOH cannot be standardised", "Indicators do not work in HCl"])],
  }),
  lab({
    id: "iron-dichromate",
    title: "Fe(II) with Potassium Dichromate",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Redox titration of Fe(II) against K₂Cr₂O₇ using an internal indicator.",
    kicker: "Redox titration",
    lead: "Dichromate oxidises Fe(II) in acid. Diphenylamine or N-phenylanthranilic acid marks the end-point.",
    equation: "Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O",
    hazard: "Dichromate is toxic and a suspected carcinogen. Use micro-scale teaching volumes and collect waste.",
    theory: "1 mol Cr₂O₇²⁻ ≡ 6 mol Fe²⁺. Phosphoric acid complexes Fe(III) and sharpens the end-point.",
    apparatus: ["K₂Cr₂O₇ burette", "Fe(II) flask", "H₂SO₄ / H₃PO₄", "Diphenylamine"],
    controls: [control("cr", "K₂Cr₂O₇ molarity", 0.01, 0.05, 0.0005, "M", 0.0167), control("volume", "Titre volume", 8, 35, 0.05, "mL", 23.8), control("aliquot", "Fe aliquot", 10, 50, 1, "mL", 25)],
    compute: (v) => {
      const nFe = 6 * v.cr * v.volume / 1000;
      const conc = nFe / (v.aliquot / 1000);
      return { primary: `${fmt(conc, 4)} M Fe(II)`, detail: `${fmt(nFe * 1000, 3)} mmol Fe in aliquot`, observation: "Violet-blue of diphenylamine at the end-point; solution is green from Cr(III).", quality: "Report three concordant titres", chart: titreCurve(v.volume, 23.8) };
    },
    steps: ["Pipette Fe(II), acidify, add H₃PO₄ and indicator.", "Titrate with K₂Cr₂O₇ to a persistent violet-blue.", "Calculate molarity using the 1:6 ratio."],
    quiz: [quiz("How many moles of Fe²⁺ are oxidised by 1 mol Cr₂O₇²⁻?", "six", ["6", "1", "2"])],
  }),
  lab({
    id: "iron-permanganate",
    title: "Fe(II) with KMnO₄ (oxalate standard)",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Standardise KMnO₄ against sodium oxalate, then estimate Fe(II).",
    kicker: "Self-indicator redox",
    lead: "Permanganate is its own indicator. Standardise on sodium oxalate at ~60 °C, then titrate Fe(II).",
    equation: "MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O",
    hazard: "Hot oxalate/acid solutions can spatter. Permanganate stains and is an oxidiser.",
    theory: "1 mol MnO₄⁻ ≡ 5 mol Fe²⁺. The first permanent pink is the end-point.",
    apparatus: ["KMnO₄ burette", "Oxalate standard", "Fe(II) flask", "Dilute H₂SO₄"],
    controls: [control("mn", "KMnO₄ molarity", 0.01, 0.04, 0.0005, "M", 0.02), control("volume", "Fe titre", 8, 35, 0.05, "mL", 22.5), control("aliquot", "Fe aliquot", 10, 50, 1, "mL", 25)],
    compute: (v) => {
      const conc = (5 * v.mn * v.volume / 1000) / (v.aliquot / 1000);
      return { primary: `${fmt(conc, 4)} M Fe(II)`, detail: "Self-indicator: first lasting pink", observation: "Pink persists ~30 s after swirling.", quality: "Discard the first oxalate titre if it ran cold", chart: titreCurve(v.volume, 22.5) };
    },
    steps: ["Standardise KMnO₄ on Na₂C₂O₄ at 55–60 °C.", "Titrate acidified Fe(II) to lasting pink.", "Use 1:5 stoichiometry for Fe."],
    quiz: [quiz("Why is no extra indicator needed?", "self", ["MnO₄⁻ is intensely coloured until it is reduced to colourless Mn²⁺", "Fe(II) is already pink", "Sulfuric acid is the indicator"])],
  }),
  lab({
    id: "copper-iodometry",
    title: "Cu(II) Iodometric Titration",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Liberate iodine from iodide with Cu(II) and titrate with Na₂S₂O₃.",
    kicker: "Iodometry",
    lead: "Cu²⁺ oxidises iodide to iodine, which is titrated with thiosulfate using starch near the end-point.",
    equation: "2 Cu²⁺ + 4 I⁻ → 2 CuI + I₂;  I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻",
    hazard: "Iodine stains and vapours irritate. Starch is added only near the end-point.",
    theory: "1 mol Cu²⁺ ≡ 1 mol S₂O₃²⁻ after the iodine stoichiometry is applied.",
    apparatus: ["Cu(II) flask", "KI", "Na₂S₂O₃ burette", "Starch"],
    controls: [control("thio", "Na₂S₂O₃ molarity", 0.02, 0.12, 0.001, "M", 0.05), control("volume", "Titre volume", 8, 35, 0.05, "mL", 24.2), control("aliquot", "Cu aliquot", 10, 50, 1, "mL", 25)],
    compute: (v) => {
      const conc = (v.thio * v.volume / 1000) / (v.aliquot / 1000);
      return { primary: `${fmt(conc, 4)} M Cu(II)`, detail: "Starch complex is blue until iodine is consumed", observation: "Blue → milky white CuI suspension at the end-point.", quality: "Add starch only when the solution is pale straw", chart: titreCurve(v.volume, 24.2) };
    },
    steps: ["Add excess KI to acidified Cu(II).", "Titrate liberated I₂ with thiosulfate.", "Add starch near the end-point."],
    quiz: [quiz("When should starch be added?", "late", ["When the iodine colour is already pale straw", "At the beginning with KI", "After the titre is finished"])],
  }),
  lab({
    id: "edta-magnesium",
    title: "Estimation of Mg²⁺ by EDTA",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Complexometric titration of magnesium at pH 10 with Eriochrome Black T.",
    kicker: "Complexometry",
    lead: "EDTA (H₂Y²⁻) forms a 1:1 complex with Mg²⁺. EBT is wine-red with Mg and sky-blue when free.",
    equation: "Mg²⁺ + H₂Y²⁻ → MgY²⁻ + 2 H⁺",
    hazard: "Buffer ammonia is pungent. Work in ventilation and avoid skin contact with EBT.",
    theory: "pH 10 ammonia buffer keeps Mg in solution and matches the EBT colour change.",
    apparatus: ["EDTA burette", "pH 10 buffer", "EBT", "Mg sample"],
    controls: [control("edta", "EDTA molarity", 0.005, 0.05, 0.0005, "M", 0.01), control("volume", "Titre volume", 8, 35, 0.05, "mL", 21.6), control("aliquot", "Aliquot", 10, 50, 1, "mL", 25)],
    compute: (v) => {
      const conc = (v.edta * v.volume / 1000) / (v.aliquot / 1000);
      return { primary: `${fmt(conc, 4)} M Mg²⁺`, detail: "1:1 complex", observation: "Wine-red → sky-blue end-point.", quality: "If the colour is dull, refresh buffer and indicator", chart: titreCurve(v.volume, 21.6) };
    },
    steps: ["Buffer the aliquot to pH 10.", "Add EBT and titrate with EDTA to sky blue.", "Calculate using 1:1 stoichiometry."],
    quiz: [quiz("Why is pH 10 required?", "ebt", ["EBT and Mg–EDTA equilibria are reliable in ammoniacal buffer", "EDTA only dissolves at pH 10", "Magnesium precipitates only at pH 10"])],
  }),
  lab({
    id: "edta-copper",
    title: "Estimation of Cu²⁺ by EDTA",
    subject: "Analytical",
    paper: "BSCH-102",
    description: "Titrate copper with EDTA using murexide or Fast Sulphon Black as indicator.",
    kicker: "Complexometry",
    lead: "Copper forms a stable EDTA complex. Murexide changes from yellow/orange to purple-violet.",
    equation: "Cu²⁺ + H₂Y²⁻ → CuY²⁻ + 2 H⁺",
    hazard: "Ammonia buffer is used with murexide. Avoid inhaling vapour.",
    theory: "pH control prevents hydroxide precipitation and keeps the indicator working.",
    apparatus: ["EDTA", "Murexide", "Ammonia", "Cu sample"],
    controls: [control("edta", "EDTA molarity", 0.005, 0.05, 0.0005, "M", 0.01), control("volume", "Titre volume", 8, 35, 0.05, "mL", 19.8), control("aliquot", "Aliquot", 10, 50, 1, "mL", 25)],
    compute: (v) => {
      const conc = (v.edta * v.volume / 1000) / (v.aliquot / 1000);
      return { primary: `${fmt(conc, 4)} M Cu²⁺`, detail: "1:1 Cu–EDTA", observation: "Indicator colour change at the 1:1 end-point.", quality: "Concordant titres within 0.1 mL", chart: titreCurve(v.volume, 19.8) };
    },
    steps: ["Adjust pH as specified for the chosen indicator.", "Titrate to the Cu–EDTA end-point.", "Calculate molarity 1:1."],
    quiz: [quiz("What is the Cu : EDTA mole ratio at the end-point?", "one", ["1 : 1", "2 : 1", "1 : 2"])],
  }),
  lab({
    id: "semi-micro-salt-analysis",
    title: "Semi-micro Salt Analysis",
    subject: "Inorganic",
    paper: "BSCH-202",
    description: "Identify two anions and two cations with group reagents and confirmatory tests.",
    kicker: "Qualitative inorganic analysis",
    lead: "Run the systematic scheme: preliminary tests, anion confirmations, then cation groups.",
    equation: "Group reagent + ion → characteristic precipitate / colour / gas",
    hazard: "H₂S, acids and concentrated ammonia are hazardous. This is a teaching simulation.",
    theory: "Interfering anions (F⁻, BO₃³⁻, PO₄³⁻) are removed before cation groups. Confirm every ion with a specific test.",
    apparatus: ["Unknown mixture", "Group reagents", "Confirmatory reagents", "Flame wire"],
    controls: [control("anion", "Anion case (1=CO₃,2=Cl,3=SO₄,4=NO₃)", 1, 4, 1, "", 1), control("cation", "Cation case (1=Cu,2=Fe,3=Ni,4=Ba)", 1, 4, 1, "", 1), control("ph", "Working pH", 1, 12, 0.5, "", 2)],
    compute: (v) => {
      const anions = { 1: "CO₃²⁻: acid + limewater milky", 2: "Cl⁻: white AgCl soluble in NH₃", 3: "SO₄²⁻: acid-insoluble BaSO₄", 4: "NO₃⁻: brown-ring test" };
      const cations = { 1: "Cu²⁺: black CuS; deep-blue ammine", 2: "Fe³⁺: blood-red thiocyanate", 3: "Ni²⁺: scarlet DMG complex", 4: "Ba²⁺: yellow BaCrO₄; apple-green flame" };
      const a = anions[Math.round(v.anion)] || anions[1];
      const c = cations[Math.round(v.cation)] || cations[1];
      return { primary: `${a.split(":")[0]} + ${c.split(":")[0]}`, detail: `${a} · ${c}`, observation: "Record only after the confirmatory test, not the preliminary colour.", quality: v.ph < 7 || Math.round(v.cation) === 3 ? "pH matched to the group reagent" : "Check group pH", chart: titreCurve(10, 10) };
    },
    steps: ["Preliminary: colour, flame, dilute acid.", "Identify and confirm two anions.", "Remove interferents; follow cation groups.", "Write ionic equations for confirmations."],
    quiz: [quiz("Why are phosphate and borate interfering anions?", "ppt", ["They precipitate several cation groups unless removed", "They destroy all indicators", "They are radioactive"])],
  }),
  lab({
    id: "aspirin-acetylation",
    title: "Acetylation of Salicylic Acid (Aspirin)",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Prepare acetylsalicylic acid with acetic anhydride and a sulfuric-acid catalyst.",
    kicker: "O-acetylation",
    lead: "Acetylate the phenolic OH of salicylic acid. Recrystallise and check melting point near 136 °C.",
    equation: "C₆H₄(OH)COOH + (CH₃CO)₂O → C₆H₄(OCOCH₃)COOH + CH₃COOH",
    hazard: "Acetic anhydride is corrosive. Control the exotherm; never stopper the flask tightly.",
    theory: "The phenol is a nucleophile toward acetic anhydride. Acid catalysis accelerates acyl transfer.",
    apparatus: ["Salicylic acid", "Acetic anhydride", "H₂SO₄ catalyst", "Ice", "Büchner"],
    controls: [control("mass", "Salicylic acid", 0.5, 5, 0.1, "g", 2), control("anhy", "Acetic anhydride", 2, 8, 0.1, "mL", 5), control("temp", "Reaction temperature", 20, 90, 1, "°C", 55)],
    compute: (v) => {
      const n = v.mass / 138.12;
      const theory = n * 180.16;
      const conv = clamp(100 * (v.anhy > 3 ? 1 : 0.6) * (v.temp > 45 && v.temp < 70 ? 1 : 0.7), 40, 96);
      return { primary: `${fmt(theory * conv / 100, 2)} g aspirin · ${fmt(conv, 0)}%`, detail: `Theoretical ${fmt(theory, 2)} g`, observation: "White crystals after ice quench and suction filtration.", quality: "MP 135–137 °C supports identity", chart: titreCurve(conv, 90) };
    },
    steps: ["Charge salicylic acid and acetic anhydride.", "Add 2–3 drops conc. H₂SO₄; warm 10–15 min.", "Pour onto ice, filter, recrystallise, dry, weigh."],
    quiz: [quiz("Which functional group is acetylated?", "phenol", ["The phenolic OH", "The carboxylic acid carbon", "The benzene ring para position"])],
  }),
  lab({
    id: "nitrobenzene-nitration",
    title: "Preparation of Nitrobenzene",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Nitrate benzene with mixed acid under temperature control.",
    kicker: "Electrophilic aromatic substitution",
    lead: "Generate NO₂⁺ from mixed acid and nitrate benzene below 55 °C, then steam-distil.",
    equation: "C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O",
    hazard: "Mixed acid is extremely corrosive. Nitrobenzene is toxic; use a hood and temperature control.",
    theory: "H₂SO₄ protonates nitric acid to give the nitronium ion. Excess heat gives dinitrobenzene.",
    apparatus: ["Benzene", "Mixed acid", "Thermometer", "Steam distillation"],
    controls: [control("temp", "Temperature", 20, 80, 1, "°C", 45), control("time", "Reaction time", 5, 40, 1, "min", 20), control("acid", "Mixed-acid volume", 8, 25, 0.5, "mL", 14)],
    compute: (v) => {
      const conv = clamp(90 * (v.temp < 55 ? 1 : 0.55) * (v.time / 20) * (v.acid > 10 ? 1 : 0.7), 25, 92);
      return { primary: `${fmt(conv, 0)}% nitrobenzene (model)`, detail: v.temp > 55 ? "Risk of dinitration" : "Temperature in the mono-nitro window", observation: "Pale yellow oil after washing and steam distillation.", quality: v.temp <= 55 ? "Mono-nitration favoured" : "Cool the bath", chart: titreCurve(v.temp, 45) };
    },
    steps: ["Add mixed acid to benzene with stirring below 50 °C.", "Keep 40–50 °C, then pour onto water.", "Wash, steam-distil and dry the oil."],
    quiz: [quiz("What is the electrophile?", "no2", ["NO₂⁺", "NO₃⁻", "HSO₄⁻"])],
  }),
  lab({
    id: "benzoic-from-benzyl-chloride",
    title: "Benzoic Acid from Benzyl Chloride",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Oxidise benzyl chloride to benzoic acid and recrystallise.",
    kicker: "Side-chain oxidation",
    lead: "Alkaline permanganate (or alkaline hydrolysis then oxidation) converts the benzylic carbon to a carboxylic acid.",
    equation: "C₆H₅CH₂Cl → C₆H₅COOH",
    hazard: "Benzyl chloride is a lachrymator. Permanganate is an oxidiser. Use a hood.",
    theory: "Any benzylic carbon with at least one hydrogen oxidises to –COOH.",
    apparatus: ["Benzyl chloride", "KMnO₄ / alkali", "HCl acidification", "Büchner"],
    controls: [control("mass", "Benzyl chloride", 1, 6, 0.1, "g", 2.5), control("kmno4", "KMnO₄", 2, 10, 0.1, "g", 5), control("time", "Reflux time", 20, 90, 5, "min", 45)],
    compute: (v) => {
      const n = v.mass / 126.58;
      const theory = n * 122.12;
      const conv = clamp(88 * (v.time / 45) * (v.kmno4 > 4 ? 1 : 0.6), 30, 94);
      return { primary: `${fmt(theory * conv / 100, 2)} g · ${fmt(conv, 0)}%`, detail: "White crystals, MP ~122 °C", observation: "MnO₂ filtered off; acidification precipitates benzoic acid.", quality: "Recrystallise from hot water", chart: titreCurve(conv, 85) };
    },
    steps: ["Reflux benzyl chloride with alkaline KMnO₄.", "Filter MnO₂, acidify the filtrate.", "Collect, wash, dry and take MP."],
    quiz: [quiz("Why does the benzylic carbon oxidise so readily?", "benzyl", ["The benzylic position is activated toward oxidation", "Chlorine is a leaving group only in SN2 on benzene", "KMnO₄ always attacks the ring first"])],
  }),
  lab({
    id: "butyl-acetate-esterification",
    title: "n-Butyl Acetate from Acetic Acid",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Fischer esterification of acetic acid with n-butanol.",
    kicker: "Esterification",
    lead: "Acid-catalysed equilibrium esterification. Remove water or use excess alcohol to drive conversion.",
    equation: "CH₃COOH + CH₃(CH₂)₃OH ⇌ CH₃COO(CH₂)₃CH₃ + H₂O",
    hazard: "Flammable alcohol and ester. Concentrated sulfuric acid is corrosive.",
    theory: "The mechanism is nucleophilic addition–elimination at the protonated carboxyl.",
    apparatus: ["Acetic acid", "n-Butanol", "H₂SO₄", "Reflux", "Separatory funnel"],
    controls: [control("acid", "Acetic acid", 5, 20, 0.5, "mL", 10), control("alc", "n-Butanol", 8, 25, 0.5, "mL", 12), control("hours", "Reflux time", 0.3, 3, 0.1, "h", 1.2)],
    compute: (v) => {
      const conv = clamp(72 * (v.alc / v.acid) * (v.hours / 1.2), 25, 88);
      return { primary: `${fmt(conv, 0)}% ester (model)`, detail: "Fruity odour after washing and drying", observation: "Organic layer after Na₂CO₃ wash and drying.", quality: conv > 60 ? "Good conversion with excess alcohol" : "Extend reflux or add more butanol", chart: titreCurve(conv, 75) };
    },
    steps: ["Reflux acid, alcohol and catalyst.", "Wash with water then carbonate.", "Dry and distil the ester."],
    quiz: [quiz("How is the equilibrium driven toward ester?", "excess", ["Use excess alcohol and/or remove water", "Add more sulfuric acid only", "Cool the mixture immediately"])],
  }),
  lab({
    id: "naphthyl-methyl-ether",
    title: "Methylation: Naphthyl Methyl Ether",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Williamson-type methylation of β-naphthol.",
    kicker: "Williamson methylation",
    lead: "Generate the naphthoxide and methylate with dimethyl sulfate or methyl iodide (teaching model).",
    equation: "ArO⁻ + CH₃–X → ArOCH₃ + X⁻",
    hazard: "Dimethyl sulfate is extremely toxic. Use a hood and gloves; many labs now use safer methylating agents.",
    theory: "The phenoxide (naphthoxide) is the nucleophile in an SN2 methylation.",
    apparatus: ["β-Naphthol", "Alkali", "Methylating agent", "Ice"],
    controls: [control("mass", "β-Naphthol", 0.5, 4, 0.1, "g", 2), control("alkali", "NaOH", 5, 20, 0.5, "mL", 10), control("time", "Stirring time", 5, 40, 1, "min", 20)],
    compute: (v) => {
      const theory = (v.mass / 144.17) * 158.2;
      const conv = clamp(80 * (v.alkali > 8 ? 1 : 0.55) * (v.time / 20), 30, 92);
      return { primary: `${fmt(theory * conv / 100, 2)} g ether · ${fmt(conv, 0)}%`, detail: "Solid after ice precipitation", observation: "Naphthyl methyl ether separates on cooling.", quality: "Alkali must fully generate ArO⁻", chart: titreCurve(conv, 80) };
    },
    steps: ["Dissolve β-naphthol in alkali.", "Add methylating agent with stirring.", "Precipitate, filter and recrystallise."],
    quiz: [quiz("Which species is the nucleophile?", "aroxide", ["The naphthoxide ion", "Neutral naphthol", "Sulfate ion"])],
  }),
  lab({
    id: "benzylidene-aniline",
    title: "Benzylidene Aniline (Schiff Base)",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Condense benzaldehyde with aniline to the imine.",
    kicker: "Condensation",
    lead: "The carbonyl of benzaldehyde condenses with aniline. Water is eliminated to give the Schiff base.",
    equation: "C₆H₅CHO + C₆H₅NH₂ → C₆H₅CH=NC₆H₅ + H₂O",
    hazard: "Aniline and benzaldehyde are toxic. Recrystallise in a hood.",
    theory: "Nucleophilic addition of the amine followed by dehydration yields the imine.",
    apparatus: ["Benzaldehyde", "Aniline", "Ethanol", "Ice"],
    controls: [control("ald", "Benzaldehyde", 1, 8, 0.1, "mL", 2.5), control("aniline", "Aniline", 1, 8, 0.1, "mL", 2.3), control("time", "Standing time", 2, 30, 1, "min", 10)],
    compute: (v) => {
      const conv = clamp(85 * Math.min(v.ald, v.aniline) / 2.4 * (v.time / 10), 35, 95);
      return { primary: `${fmt(conv, 0)}% Schiff base`, detail: "Yellow crystals, MP ~52 °C", observation: "Crystals appear on standing or scratching.", quality: "Stoichiometry close to 1:1", chart: titreCurve(conv, 85) };
    },
    steps: ["Mix equimolar aldehyde and aniline.", "Allow to stand; scratch if needed.", "Filter and recrystallise from ethanol."],
    quiz: [quiz("What small molecule is eliminated?", "water", ["Water", "Hydrogen", "Carbon dioxide"])],
  }),
  lab({
    id: "azo-coupling-naphthol",
    title: "Azo Coupling of β-Naphthol",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Diazotise an aromatic amine at 0–5 °C and couple with β-naphthol.",
    kicker: "Diazotisation + coupling",
    lead: "Keep the diazonium ion cold, then pour into alkaline β-naphthol to obtain a brightly coloured azo dye.",
    equation: "ArNH₂ → ArN₂⁺;  ArN₂⁺ + β-naphthol → Ar–N=N–naphthol",
    hazard: "Nitrous acid and diazonium salts can decompose; keep 0–5 °C. Azo dyes stain strongly.",
    theory: "Diazonium ions are weak electrophiles and couple at the electron-rich naphthol ring (usually position 1 of β-naphthol).",
    apparatus: ["Aniline", "NaNO₂ / HCl", "Ice", "Alkaline β-naphthol"],
    controls: [control("temp", "Diazotisation temperature", -2, 25, 0.5, "°C", 3), control("time", "Coupling time", 2, 20, 1, "min", 8), control("alkali", "Naphthol alkali", 5, 25, 0.5, "mL", 12)],
    compute: (v) => {
      const conv = clamp(90 * (v.temp <= 5 ? 1 : 0.4) * (v.alkali > 8 ? 1 : 0.6) * (v.time / 8), 20, 96);
      return { primary: `${fmt(conv, 0)}% azo dye`, detail: v.temp > 8 ? "Diazonium decomposed" : "Cold diazonium survived", observation: "Intense orange-red precipitate.", quality: v.temp <= 5 ? "Temperature control is correct" : "More ice", chart: titreCurve(v.temp + 10, 5) };
    },
    steps: ["Diazotise the amine at 0–5 °C.", "Prepare alkaline β-naphthol.", "Add diazonium slowly, filter the dye."],
    quiz: [quiz("Why must diazotisation stay near 0 °C?", "decomp", ["The diazonium ion decomposes if warmed", "Ice is a catalyst", "β-Naphthol only dissolves in ice"])],
  }),
  lab({
    id: "microwave-aspirin",
    title: "Microwave-Assisted Aspirin / Benzamide Hydrolysis",
    subject: "Organic",
    paper: "BSCH-302",
    description: "Compare conventional and microwave heating for aspirin or benzamide hydrolysis (demonstration).",
    kicker: "Microwave demonstration",
    lead: "Microwave dielectric heating shortens reaction time. Compare conversion versus a hot-plate control.",
    equation: "Aspirin synthesis as before, or PhCONH₂ + H₂O → PhCOOH + NH₃",
    hazard: "Use only microwave-safe open or designed vessels. Never seal a household microwave with flammables.",
    theory: "Microwave heating is volumetric. Polar solvents couple strongly, often giving faster conversion.",
    apparatus: ["Microwave reactor (teaching)", "Hot plate control", "Same reagents as aspirin or benzamide"],
    controls: [control("power", "Microwave power", 100, 800, 10, "W", 300), control("time", "Microwave time", 0.5, 10, 0.5, "min", 3), control("mode", "Mode (1=MW,2=hotplate)", 1, 2, 1, "", 1)],
    compute: (v) => {
      const mw = v.mode < 1.5;
      const conv = clamp((mw ? 1.35 : 0.7) * (v.power / 300) * (v.time / 3) * 55, 15, 96);
      return { primary: `${fmt(conv, 0)}% conversion (${mw ? "microwave" : "hot plate"})`, detail: mw ? "Shorter time, similar isolated yield if work-up is the same" : "Classical heating is slower", observation: mw ? "Mixture reaches temperature rapidly." : "Longer reflux needed.", quality: "Do not compare energy without calorimetry", chart: titreCurve(conv, 80) };
    },
    steps: ["Run identical charges in MW and on a hot plate.", "Work up both the same way.", "Compare time, conversion and MP."],
    quiz: [quiz("What is the demonstration meant to show?", "time", ["Microwave heating can reach similar conversion in less time", "Microwaves change the mechanism to radical", "Yield must always be 100%"])],
  }),
  lab({
    id: "organic-qualitative-analysis",
    title: "Qualitative Analysis of Organic Compounds",
    subject: "Organic",
    paper: "BSCH-402",
    description: "Identify unknowns by ignition, MP/BP, solubility and functional-group tests, then make a derivative.",
    kicker: "Organic qualitative analysis",
    lead: "Follow the college scheme: preliminary tests, solubility class, functional tests, derivative.",
    equation: "Observation + control → functional class → derivative MP",
    hazard: "Do not taste samples. Brady’s, Tollens, ceric ammonium nitrate and sodium fusion need a hood.",
    theory: "Solubility in water, NaOH, NaHCO₃ and HCl classifies the compound before specific tests.",
    apparatus: ["Unknown", "Ignition tube", "Solubility set", "Functional reagents", "Derivative kit"],
    controls: [control("unknown", "Unknown (1=acid,2=phenol,3=amine,4=aldehyde,5=ketone,6=amide)", 1, 6, 1, "", 1), control("nahco3", "NaHCO₃ fizz (0/1)", 0, 1, 1, "", 1), control("mp", "Observed MP", 40, 220, 0.5, "°C", 122)],
    compute: (v) => {
      const map = {
        1: { name: "Carboxylic acid", tests: "NaHCO₃ fizz; litmus red", deriv: "Amide derivative" },
        2: { name: "Phenol", tests: "FeCl₃ colour; no strong NaHCO₃ fizz", deriv: "Bromo derivative" },
        3: { name: "Amine", tests: "HCl soluble; azo dye or carbylamine", deriv: "Acetyl / benzoyl" },
        4: { name: "Aldehyde", tests: "2,4-DNP + Tollens", deriv: "2,4-DNP hydrazone" },
        5: { name: "Ketone", tests: "2,4-DNP; Tollens negative", deriv: "2,4-DNP hydrazone" },
        6: { name: "Amide", tests: "Biuret/hydrolysis to acid + NH₃", deriv: "Hydrolysis product" },
      };
      const u = map[Math.round(v.unknown)] || map[1];
      const fizzOk = (Math.round(v.unknown) === 1 && v.nahco3 > 0.5) || (Math.round(v.unknown) !== 1 && v.nahco3 < 0.5);
      return { primary: u.name, detail: u.tests, observation: `Suggested derivative: ${u.deriv}. Recorded MP ${fmt(v.mp, 1)} °C.`, quality: fizzOk ? "Solubility/fizz matches the class" : "Revisit the NaHCO₃ test", chart: titreCurve(v.mp, 122) };
    },
    steps: ["Ignition and MP/BP.", "Solubility classification.", "Functional-group tests with controls.", "Prepare a derivative and compare MP."],
    quiz: [quiz("Which test distinguishes a carboxylic acid from a phenol?", "bicarb", ["Strong NaHCO₃ effervescence for the acid", "FeCl₃ is positive only for acids", "Both are equally strong acids"])],
  }),
  lab({
    id: "h2o2-kinetics",
    title: "Kinetics: Decomposition of H₂O₂",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Follow first-order decomposition of hydrogen peroxide and extract k and t½.",
    kicker: "First-order kinetics",
    lead: "Measure volume of O₂ or remaining H₂O₂ versus time. A linear ln(c) plot confirms first order.",
    equation: "2 H₂O₂ → 2 H₂O + O₂",
    hazard: "H₂O₂ is an oxidiser. Catalysts (MnO₂, Fe³⁺, I⁻) can evolve oxygen rapidly.",
    theory: "ln([H₂O₂]₀/[H₂O₂]) = kt. Half-life is independent of initial concentration.",
    apparatus: ["H₂O₂", "Catalyst", "Gas burette or titration", "Stopwatch"],
    controls: [control("kobs", "Rate constant k", 0.002, 0.08, 0.001, "min⁻¹", 0.023), control("c0", "Initial H₂O₂", 0.05, 0.4, 0.01, "M", 0.2), control("time", "Elapsed time", 0, 80, 1, "min", 30)],
    compute: (v) => {
      const c = v.c0 * Math.exp(-v.kobs * v.time);
      const tHalf = Math.log(2) / v.kobs;
      return { primary: `[H₂O₂] = ${fmt(c, 4)} M · t½ ${fmt(tHalf, 1)} min`, detail: "First-order integrated rate law", observation: "Oxygen evolution slows as concentration falls.", quality: "Plot ln c vs t should be linear", chart: decayChart(v.c0, v.kobs) };
    },
    steps: ["Mix H₂O₂ with catalyst at constant T.", "Record titre or gas volume vs time.", "Plot ln c vs t and obtain k."],
    quiz: [quiz("For a first-order reaction, t½ equals", "ln2k", ["ln 2 / k", "1 / k[A]₀", "[A]₀ / 2k"])],
  }),
  lab({
    id: "methyl-acetate-hydrolysis",
    title: "Kinetics: Hydrolysis of Methyl Acetate",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Acid-catalysed ester hydrolysis treated as pseudo-first order.",
    kicker: "Pseudo-first order",
    lead: "Water is in large excess. Follow [ester] by titrating acetic acid produced.",
    equation: "CH₃COOCH₃ + H₂O → CH₃COOH + CH₃OH",
    hazard: "HCl catalyst is corrosive. Keep the thermostat temperature constant.",
    theory: "Rate = k[ester] when [H₂O] and [H⁺] are effectively constant. Titre ∞ acid formed.",
    apparatus: ["Methyl acetate", "HCl", "Thermostat", "NaOH burette"],
    controls: [control("kobs", "k (pseudo-first)", 0.01, 0.2, 0.001, "h⁻¹", 0.045), control("time", "Time", 0, 8, 0.1, "h", 2), control("tinf", "Infinity titre", 20, 45, 0.1, "mL", 32)],
    compute: (v) => {
      const t0 = 8;
      const vt = t0 + (v.tinf - t0) * (1 - Math.exp(-v.kobs * v.time));
      return { primary: `Vₜ = ${fmt(vt, 2)} mL · k = ${fmt(v.kobs, 3)} h⁻¹`, detail: "k = (2.303/t) log((V∞−V₀)/(V∞−Vₜ))", observation: "Titre rises toward V∞ as ester is consumed.", quality: "Use the same NaOH for all titres", chart: titreCurve(vt, v.tinf) };
    },
    steps: ["Start the clock on mixing ester with acid.", "Withdraw aliquots, quench, titrate.", "Calculate k from V₀, Vₜ, V∞."],
    quiz: [quiz("Why is the reaction called pseudo-first order?", "water", ["Water concentration is effectively constant", "The ester is zero order", "Acid is consumed completely"])],
  }),
  lab({
    id: "conductometry-hcl-naoh",
    title: "Conductometric Titration: HCl vs NaOH",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Locate the end-point from the break in a conductivity plot.",
    kicker: "Conductometry",
    lead: "H⁺ is replaced by Na⁺. Conductivity falls to the equivalence point then rises with excess OH⁻.",
    equation: "H⁺ + OH⁻ → H₂O",
    hazard: "Electrodes are fragile. Rinse with conductivity water.",
    theory: "H⁺ and OH⁻ have very high molar conductivity, so the plot is V-shaped.",
    apparatus: ["Conductivity cell", "HCl", "NaOH", "Magnetic stirrer"],
    controls: [control("hcl", "HCl taken", 5, 25, 0.5, "mL", 10), control("hclM", "HCl molarity", 0.05, 0.2, 0.001, "M", 0.1), control("naohM", "NaOH molarity", 0.05, 0.2, 0.001, "M", 0.1), control("added", "NaOH added", 0, 30, 0.1, "mL", 9.2)],
    compute: (v) => {
      const eq = v.hcl * v.hclM / v.naohM;
      const kappa = Math.abs(v.added - eq) * 0.8 + 0.4;
      return { primary: `Equivalence ${fmt(eq, 2)} mL · κ model ${fmt(kappa, 2)}`, detail: v.added < eq ? "Before end-point: κ falling" : "After end-point: κ rising", observation: "Plot two lines; intersection is the end-point.", quality: Math.abs(v.added - eq) < 0.4 ? "Near the break" : "Add more points around equivalence", chart: vCurve(eq) };
    },
    steps: ["Measure κ after each NaOH increment.", "Plot κ vs volume.", "Read the intersection as the titre."],
    quiz: [quiz("Why does conductivity fall before equivalence?", "hplus", ["High-mobility H⁺ is replaced by Na⁺", "The solution is becoming non-electrolyte", "NaOH is a non-conductor"])],
  }),
  lab({
    id: "conductometry-acetic-naoh",
    title: "Conductometric Titration: Acetic Acid vs NaOH",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Weak acid–strong base conductivity curve and Ka from dilute solutions.",
    kicker: "Conductometry",
    lead: "A weak acid starts with low κ. Neutralisation produces acetate, then excess OH⁻ raises κ sharply.",
    equation: "CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O",
    hazard: "Rinse the cell between runs.",
    theory: "The first branch rises slowly; the second is steep due to OH⁻. Intersection is the end-point.",
    apparatus: ["Conductivity cell", "Acetic acid", "NaOH"],
    controls: [control("acid", "Acetic acid molarity", 0.02, 0.2, 0.001, "M", 0.08), control("added", "NaOH added", 0, 30, 0.1, "mL", 12), control("eq", "Expected equivalence", 8, 25, 0.1, "mL", 20)],
    compute: (v) => {
      const kappa = v.added < v.eq ? 0.3 + v.added * 0.04 : 0.3 + v.eq * 0.04 + (v.added - v.eq) * 0.12;
      return { primary: `κ ≈ ${fmt(kappa, 2)} (relative) · end-point ${fmt(v.eq, 1)} mL`, detail: "Use the intersection of the two linear branches", observation: "Shallow then steep branches.", quality: "More points after equivalence define the OH⁻ branch", chart: vCurve(v.eq) };
    },
    steps: ["Titrate acetic acid conductometrically.", "Locate the break.", "Optionally compute Ka from dilute conductance."],
    quiz: [quiz("Which ion causes the steep rise after equivalence?", "oh", ["OH⁻", "H⁺", "CH₃COOH"])],
  }),
  lab({
    id: "ka-acetic-conductometry",
    title: "Ka of Acetic Acid by Conductometry",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Use molar conductivity and Ostwald’s dilution law for Ka.",
    kicker: "Ostwald dilution",
    lead: "Λₘ / Λ° = α and Ka = α²c / (1−α) for a weak acid.",
    equation: "Ka = c α² / (1 − α); α = Λₘ / Λₘ°",
    hazard: "Use conductivity water and a cell of known constant.",
    theory: "Kohlrausch’s law gives Λₘ°(HAc) = λ°(H⁺) + λ°(Ac⁻).",
    apparatus: ["Conductivity meter", "Acetic acid dilutions", "Cell constant"],
    controls: [control("c", "Concentration", 0.005, 0.1, 0.001, "M", 0.02), control("lambda", "Λₘ", 5, 80, 0.5, "S cm² mol⁻¹", 18), control("lambda0", "Λₘ°", 300, 420, 1, "S cm² mol⁻¹", 390)],
    compute: (v) => {
      const a = clamp(v.lambda / v.lambda0, 0.01, 0.95);
      const ka = v.c * a * a / (1 - a);
      return { primary: `α = ${fmt(a, 3)} · Ka = ${fmt(ka, 6)}`, detail: "Ostwald dilution law", observation: "Ka should be near 1.8×10⁻⁵ at 25 °C for a good run.", quality: Math.abs(Math.log10(ka) + 4.74) < 0.6 ? "Close to literature Ka" : "Check cell constant and Λ°", chart: titreCurve(a * 100, 20) };
    },
    steps: ["Measure κ at several dilutions.", "Compute Λₘ and α.", "Apply Ostwald’s law."],
    quiz: [quiz("α is estimated as", "ratio", ["Λₘ / Λₘ°", "κ / c", "pH / 14"])],
  }),
  lab({
    id: "colorimetry-kmno4-cuso4",
    title: "Colorimetry: KMnO₄, CuSO₄, K₂Cr₂O₇",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Verify Beer–Lambert’s law and determine an unknown concentration.",
    kicker: "Colorimetry",
    lead: "A = εcl. Build a calibration at λmax, then read the unknown.",
    equation: "A = ε c l",
    hazard: "KMnO₄ and dichromate stain and oxidise. Dispose as heavy-metal/oxidiser waste.",
    theory: "Use the linear portion of the calibration. Deviations appear at high concentration.",
    apparatus: ["Colorimeter", "Cuvettes", "Standards", "Unknown"],
    controls: [control("eps", "ε (relative)", 0.5, 5, 0.1, "", 2.1), control("c", "Unknown concentration", 0.0005, 0.02, 0.0001, "M", 0.006), control("path", "Path length", 0.5, 2, 0.1, "cm", 1)],
    compute: (v) => {
      const A = v.eps * v.c * v.path * 80;
      return { primary: `A = ${fmt(A, 3)} · c = ${fmt(v.c, 4)} M`, detail: "Unknown read from the calibration slope", observation: "Match λmax: KMnO₄ ~525 nm, Cu²⁺ ~630 nm, Cr(VI) ~440 nm.", quality: A < 1.2 ? "In the linear Beer–Lambert region" : "Dilute the unknown", chart: titreCurve(A * 20, 50) };
    },
    steps: ["Record A for standards.", "Plot A vs c.", "Read the unknown."],
    quiz: [quiz("Beer–Lambert’s law relates absorbance to", "conc", ["Concentration (and path length)", "Only temperature", "Only refractive index"])],
  }),
  lab({
    id: "surface-tension-density-viscosity",
    title: "Surface Tension, Density and Viscosity",
    subject: "Physical",
    paper: "BSCH-502",
    description: "Measure γ (stalagmometer), ρ (pyknometer) and η (Ostwald viscometer).",
    kicker: "Physical constants",
    lead: "Compare water and an organic liquid. Viscosity uses flow time and density.",
    equation: "η₂/η₁ = (t₂ ρ₂) / (t₁ ρ₁);  γ₂/γ₁ = (n₁ ρ₂) / (n₂ ρ₁) (drop-weight form)",
    hazard: "Organic liquids are flammable. Keep viscometers vertical and dust-free.",
    theory: "Poiseuille flow: t ∝ η/ρ for the same viscometer.",
    apparatus: ["Stalagmometer", "Pyknometer", "Ostwald viscometer", "Water bath"],
    controls: [control("tliq", "Flow time liquid", 40, 180, 1, "s", 92), control("twater", "Flow time water", 40, 120, 1, "s", 62), control("rho", "Density liquid", 0.7, 1.4, 0.001, "g mL⁻¹", 0.789)],
    compute: (v) => {
      const eta = 0.89 * (v.tliq / v.twater) * v.rho;
      return { primary: `η ≈ ${fmt(eta, 3)} mPa s`, detail: `ρ = ${fmt(v.rho, 3)} g mL⁻¹`, observation: "Report temperature with every physical constant.", quality: "Water calibration must be at the same T", chart: titreCurve(v.tliq, 90) };
    },
    steps: ["Determine density vs water.", "Count drops or drop weight for γ.", "Measure viscometer times."],
    quiz: [quiz("Ostwald viscosity relative to water uses", "times", ["Flow times and densities", "Only boiling points", "Only refractive index"])],
  }),
  lab({
    id: "persulfate-iodide-kinetics",
    title: "Kinetics: Persulfate–Iodide Reaction",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Clock or titre method for the second-order persulfate–iodide reaction.",
    kicker: "Second-order kinetics",
    lead: "S₂O₈²⁻ oxidises I⁻ to I₂. Follow iodine or use a thiosulfate clock.",
    equation: "S₂O₈²⁻ + 2 I⁻ → 2 SO₄²⁻ + I₂",
    hazard: "Iodine stains. Keep concentrations in the teaching range.",
    theory: "Rate = k[S₂O₈²⁻][I⁻]. With equal concentrations, 1/[A] vs t is linear.",
    apparatus: ["K₂S₂O₈", "KI", "Na₂S₂O₃ clock", "Starch"],
    controls: [control("k", "k", 0.02, 0.4, 0.005, "L mol⁻¹ min⁻¹", 0.12), control("c0", "Equal initial conc.", 0.01, 0.08, 0.001, "M", 0.04), control("time", "Time", 0, 40, 1, "min", 12)],
    compute: (v) => {
      const c = v.c0 / (1 + v.k * v.c0 * v.time);
      return { primary: `[A] = ${fmt(c, 4)} M`, detail: "Second-order equal-concentration integrated law", observation: "Clock blue appears when iodine exceeds thiosulfate.", quality: "1/c vs t should be linear", chart: decayChart(v.c0, v.k * v.c0) };
    },
    steps: ["Mix persulfate and iodide at t = 0.", "Follow iodine or clock time.", "Determine k and overall order."],
    quiz: [quiz("If both reactants start equal, a linear plot is", "inv", ["1/[A] versus t", "ln[A] versus t", "[A] versus t"])],
  }),
  lab({
    id: "saponification-order",
    title: "Overall Order of Ester Saponification",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Follow alkaline hydrolysis of ethyl acetate; confirm second order.",
    kicker: "Second-order saponification",
    lead: "Titrate remaining NaOH vs time. For equal concentrations, 1/[OH⁻] vs t is linear.",
    equation: "CH₃COOC₂H₅ + OH⁻ → CH₃COO⁻ + C₂H₅OH",
    hazard: "NaOH is corrosive. Thermostat the mixture.",
    theory: "Rate = k[ester][OH⁻]. Overall order is two.",
    apparatus: ["Ethyl acetate", "NaOH", "HCl titre", "Thermostat"],
    controls: [control("k", "k", 0.02, 0.5, 0.005, "L mol⁻¹ min⁻¹", 0.11), control("c0", "Initial [NaOH]=[ester]", 0.02, 0.1, 0.001, "M", 0.05), control("time", "Time", 0, 50, 1, "min", 15)],
    compute: (v) => {
      const c = v.c0 / (1 + v.k * v.c0 * v.time);
      return { primary: `[OH⁻] = ${fmt(c, 4)} M · order 2`, detail: "Titre of remaining alkali falls with time", observation: "Phenolphthalein titre decreases as ester is saponified.", quality: "Keep ionic strength and T constant", chart: decayChart(v.c0, v.k * v.c0) };
    },
    steps: ["Mix ester and NaOH at t = 0.", "Withdraw, quench, titrate leftover alkali.", "Test 1/c vs t for linearity."],
    quiz: [quiz("Saponification of ethyl acetate is typically", "second", ["Second order overall", "Zero order", "Third order in water"])],
  }),
  lab({
    id: "ph-metry-hcl",
    title: "pH-metry: HCl vs NaOH",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Record a strong acid–strong base pH curve and locate the end-point.",
    kicker: "pH-metry",
    lead: "Calibrate the glass electrode, then titrate. The steep jump marks equivalence.",
    equation: "HCl + NaOH → NaCl + H₂O",
    hazard: "Keep the electrode hydrated. Do not wipe the membrane dry.",
    theory: "At equivalence pH ≈ 7. Derivative d pH / dV peaks at the end-point.",
    apparatus: ["pH meter", "Glass electrode", "HCl", "NaOH"],
    controls: [control("eq", "Equivalence volume", 15, 30, 0.1, "mL", 24.8), control("added", "NaOH added", 0, 40, 0.1, "mL", 18)],
    compute: (v) => {
      const pH = v.added < v.eq ? 1.3 + (v.added / v.eq) * 2.2 : 7 + Math.min(6, (v.added - v.eq) * 0.9);
      return { primary: `pH ≈ ${fmt(pH, 2)}`, detail: `Equivalence at ${fmt(v.eq, 1)} mL`, observation: v.added > v.eq - 0.3 && v.added < v.eq + 0.3 ? "Steep jump: near end-point" : "Buffer-like slope away from equivalence", quality: "Calibrate at pH 4 and 7 before the run", chart: pHCurve(v.eq) };
    },
    steps: ["Calibrate the meter.", "Add NaOH in small increments near 24–26 mL.", "Plot pH vs V."],
    quiz: [quiz("The end-point is best read from", "jump", ["The steep pH jump / first derivative peak", "The first pH 3 reading", "The colour of NaOH"])],
  }),
  lab({
    id: "ph-metry-acetic",
    title: "pH-metry: Acetic Acid vs NaOH",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Weak acid–strong base curve; equivalence is alkaline.",
    kicker: "pH-metry",
    lead: "The buffer region appears before equivalence. Equivalence pH is > 7 because of acetate hydrolysis.",
    equation: "CH₃COOH + OH⁻ → CH₃COO⁻ + H₂O",
    hazard: "Rinse the electrode with distilled water, blot, do not rub.",
    theory: "Half-equivalence pH = pKa. Equivalence is not pH 7.",
    apparatus: ["pH meter", "Acetic acid", "NaOH"],
    controls: [control("eq", "Equivalence volume", 15, 30, 0.1, "mL", 22), control("added", "NaOH added", 0, 40, 0.1, "mL", 11), control("pka", "pKa", 4.4, 5, 0.01, "", 4.76)],
    compute: (v) => {
      const f = v.added / v.eq;
      const pH = f < 0.98 ? v.pka + Math.log10(Math.max(f, 0.02) / Math.max(1 - f, 0.02)) : 8.4 + (v.added - v.eq) * 0.4;
      return { primary: `pH ≈ ${fmt(pH, 2)}`, detail: f < 0.55 && f > 0.45 ? "Near half-equivalence: pH ≈ pKa" : "See buffer vs jump", observation: "Choose phenolphthalein, not methyl orange, in a visual check.", quality: "Half-equivalence is the pKa checkpoint", chart: pHCurve(v.eq) };
    },
    steps: ["Calibrate, titrate acetic acid.", "Note buffer region, half-equivalence, jump.", "Equivalence pH is alkaline."],
    quiz: [quiz("At half-equivalence, pH equals", "pka", ["pKa of acetic acid", "7.00 exactly", "pKb of acetate"])],
  }),
  lab({
    id: "ksp-baso4-conductometry",
    title: "Ksp of BaSO₄ by Conductometry",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Saturated BaSO₄ has a tiny conductivity used to estimate solubility and Ksp.",
    kicker: "Solubility product",
    lead: "κ_saturated − κ_water gives the ionic contribution of Ba²⁺ and SO₄²⁻.",
    equation: "Ksp = s² for BaSO₄; s ≈ 1000 κ / (λ°₊ + λ°₋)",
    hazard: "Barium salts are toxic. Do not ingest; wash hands.",
    theory: "For a sparingly soluble 1:1 salt, molar conductivity at infinite dilution estimates s from κ.",
    apparatus: ["Conductivity meter", "Saturated BaSO₄", "Conductivity water"],
    controls: [control("kappa", "κ(saturated) − κ(blank)", 1, 40, 0.1, "µS cm⁻¹", 4.2), control("lambda0", "Λₘ° (BaSO₄)", 200, 320, 1, "S cm² mol⁻¹", 280)],
    compute: (v) => {
      const s = (v.kappa * 1e-6 * 1000) / (v.lambda0 / 1000) / 1000;
      const ksp = s * s;
      return { primary: `s ≈ ${s.toExponential(2)} M · Ksp ≈ ${ksp.toExponential(2)}`, detail: "Teaching estimate from conductance", observation: "Saturated solution must be clear and thermostatted.", quality: "Order of 10⁻¹⁰ is the literature target", chart: titreCurve(v.kappa, 4) };
    },
    steps: ["Prepare a saturated BaSO₄ solution at known T.", "Measure κ vs a water blank.", "Convert to s and Ksp."],
    quiz: [quiz("For BaSO₄, Ksp equals", "s2", ["s²", "4s³", "s"])],
  }),
  lab({
    id: "potentiometry-iron-dichromate",
    title: "Potentiometric Titration: Fe²⁺ vs K₂Cr₂O₇",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Follow cell potential while oxidising Fe(II); the steep jump is the end-point.",
    kicker: "Potentiometry",
    lead: "A Pt indicator electrode tracks the Fe³⁺/Fe²⁺ ratio. Dichromate is the titrant.",
    equation: "E = E° − (RT/nF) ln Q  (Nernst)",
    hazard: "Dichromate waste is hazardous. Calomel/AgCl reference electrodes contain toxic internals—do not break.",
    theory: "Potential changes slowly in the Fe(II) buffer, then jumps at equivalence.",
    apparatus: ["Pt electrode", "Reference electrode", "Fe(II)", "K₂Cr₂O₇", "Potentiometer"],
    controls: [control("eq", "Equivalence volume", 15, 30, 0.1, "mL", 21.4), control("added", "Titrant added", 0, 35, 0.1, "mL", 16)],
    compute: (v) => {
      const E = v.added < v.eq ? 0.68 + 0.06 * Math.log10((v.added + 0.2) / (v.eq - v.added + 0.2)) : 1.05 + 0.02 * (v.added - v.eq);
      return { primary: `E ≈ ${fmt(E, 3)} V`, detail: `End-point ${fmt(v.eq, 1)} mL`, observation: v.added > v.eq - 0.4 && v.added < v.eq + 0.4 ? "ΔE/ΔV is largest here" : "Still on a plateau", quality: "Plot E and ΔE/ΔV", chart: pHCurve(v.eq) };
    },
    steps: ["Assemble Pt and reference electrodes.", "Add dichromate, record E.", "Locate the first-derivative peak."],
    quiz: [quiz("The indicator electrode for Fe²⁺/Fe³⁺ is typically", "pt", ["Platinum", "Glass pH electrode only", "A zinc rod"])],
  }),
  lab({
    id: "distribution-benzoic-acid",
    title: "Distribution Law: Benzoic Acid in Toluene/Water",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Determine the partition coefficient and infer dimerisation in the organic layer.",
    kicker: "Nernst distribution",
    lead: "Shake benzoic acid between water and toluene. Dimerisation in toluene makes D concentration-dependent.",
    equation: "K_d = [HA]org / [HA]aq  (simple); dimerisation: 2 HA_org ⇌ (HA)₂",
    hazard: "Toluene is flammable and toxic. Use a separatory funnel in a hood.",
    theory: "If dimerisation occurs, a plot of c_org vs c_aq² (or related forms) diagnoses association.",
    apparatus: ["Separatory funnel", "Toluene", "Benzoic acid", "NaOH titre"],
    controls: [control("caq", "c(aq)", 0.002, 0.05, 0.001, "M", 0.012), control("kd", "True Kd (monomer)", 0.5, 8, 0.1, "", 3.2), control("kdim", "Dimer K", 0, 40, 0.5, "", 12)],
    compute: (v) => {
      const corg = v.kd * v.caq + 2 * v.kdim * (v.kd * v.caq) ** 2;
      const D = corg / v.caq;
      return { primary: `D_app = ${fmt(D, 2)} · c_org ${fmt(corg, 4)} M`, detail: v.kdim > 1 ? "Apparent D rises with concentration: dimerisation" : "Simple Nernst partition", observation: "Titrate each layer after settling.", quality: "Always state T and which layer was titrated", chart: titreCurve(D, 8) };
    },
    steps: ["Shake known benzoic acid between equal volumes.", "Separate and titrate both layers.", "Compute D and test for association."],
    quiz: [quiz("If benzoic acid dimerises in toluene, D_app", "rises", ["Increases with concentration", "Is always exactly Kd", "Becomes zero"])],
  }),
  lab({
    id: "distribution-acetic-butanol",
    title: "Distribution of Acetic Acid (n-Butanol/Water)",
    subject: "Physical",
    paper: "BSCH-602",
    description: "Measure the partition coefficient of acetic acid between n-butanol and water.",
    kicker: "Nernst distribution",
    lead: "After shaking, titrate each layer. Report Kd at the stated temperature.",
    equation: "K_d = [HA]butanol / [HA]water",
    hazard: "n-Butanol is flammable. Avoid emulsions by gentle inversion.",
    theory: "For a solute in the same molecular form in both layers, Kd is constant.",
    apparatus: ["Separatory funnel", "n-Butanol", "Acetic acid", "NaOH"],
    controls: [control("caq", "c(water)", 0.02, 0.3, 0.005, "M", 0.1), control("kd", "Kd", 0.3, 4, 0.05, "", 1.15)],
    compute: (v) => {
      const corg = v.kd * v.caq;
      return { primary: `K_d = ${fmt(v.kd, 2)} · c_org ${fmt(corg, 3)} M`, detail: "Assume monomer in both layers", observation: "Layers must be clear before sampling.", quality: "Report volumes and T", chart: titreCurve(v.kd * 10, 12) };
    },
    steps: ["Prepare the two-phase system.", "Shake, settle, sample each layer.", "Titrate and compute Kd."],
    quiz: [quiz("Nernst distribution law assumes", "same-form", ["The solute has the same molecular form in both phases", "The solute always dimerises", "Volumes must be unequal"])],
  }),
  lab({
    id: "solvent-extraction-iron",
    title: "Solvent Extraction of Iron(III)",
    subject: "Analytical",
    paper: "BSCH-501A",
    description: "Extract Fe(III) into an organic solvent and estimate the fraction extracted.",
    kicker: "Solvent extraction",
    lead: "Distribution ratio D = [Fe]org / [Fe]aq. Percent extracted depends on D and volume ratio.",
    equation: "%E = 100 D / (D + V_aq/V_org)",
    hazard: "Organic extractants (ether, MIBK) are flammable. Use a hood.",
    theory: "Multiple small extractions beat one large extraction with the same total organic volume.",
    apparatus: ["Separatory funnel", "Fe(III) solution", "Organic solvent", "Colorimetry"],
    controls: [control("D", "Distribution ratio D", 0.5, 40, 0.1, "", 8), control("vr", "Vaq/Vorg", 0.5, 5, 0.1, "", 1), control("n", "Number of extractions", 1, 4, 1, "", 2)],
    compute: (v) => {
      const remain = (v.vr / (v.D + v.vr)) ** v.n;
      const pct = (1 - remain) * 100;
      return { primary: `${fmt(pct, 1)}% Fe extracted`, detail: `${v.n} extraction(s), D = ${fmt(v.D, 1)}`, observation: "Organic layer coloured by the Fe complex.", quality: v.n > 1 ? "Multiple contacts improve recovery" : "Consider a second extraction", chart: titreCurve(pct, 90) };
    },
    steps: ["Adjust pH/ligand as specified.", "Shake with the organic solvent.", "Analyse both layers; compute %E."],
    quiz: [quiz("For the same total organic volume, extraction is more complete with", "multi", ["Several small portions", "One huge portion only", "No shaking"])],
  }),
  lab({
    id: "electrogravimetric-metals",
    title: "Electrogravimetric Estimation of Metals",
    subject: "Analytical",
    paper: "BSCH-501A",
    description: "Deposit a metal quantitatively at a cathode and weigh the cathode gain.",
    kicker: "Electroanalytical",
    lead: "Faraday’s laws: mass deposited ∝ charge passed, provided current efficiency is 100%.",
    equation: "m = (I t M) / (n F)  (current efficiency 100%)",
    hazard: "Use low voltage DC. Avoid H₂ evolution that lowers current efficiency.",
    theory: "The analyte is reduced at a weighed Pt gauze cathode. After washing and drying, the mass increase is the metal. Stirring and controlled potential reduce co-deposition.",
    apparatus: ["Platinum gauze cathode", "Pt anode", "DC source", "Analytical balance"],
    controls: [
      control("I", "Current", 0.05, 1.5, 0.01, "A", 0.4),
      control("t", "Time", 10, 90, 1, "min", 40),
      control("n", "Electrons per metal atom", 1, 3, 1, "", 2),
      control("M", "Molar mass", 55, 120, 0.1, "g mol⁻¹", 63.55),
      control("eff", "Current efficiency", 70, 100, 1, "%", 96),
    ],
    compute: (v) => {
      const m = (v.I * v.t * 60 * v.M * (v.eff / 100)) / (v.n * 96485);
      return {
        primary: `${fmt(m * 1000, 1)} mg deposited`,
        detail: `I = ${fmt(v.I, 2)} A for ${v.t} min`,
        observation: v.eff < 90 ? "Gas evolution: current efficiency below 90%." : "Smooth metallic deposit on the cathode.",
        quality: v.eff >= 95 ? "Weigh to constant mass after drying." : "Lower current or stir to raise efficiency.",
        chart: titreCurve(v.t, 50),
      };
    },
    steps: ["Weigh the clean dry cathode.", "Electrolyse until the analyte test is negative.", "Wash, dry, reweigh; compute % metal."],
    quiz: [quiz("Electrogravimetry reports the metal from", "mass", ["The increase in cathode mass after electrolysis", "The colour of the electrolyte only", "The anode gas volume only"])],
  }),
  lab({
    id: "isatin-allylation",
    title: "Organic Preparation: Allylation of Isatin",
    subject: "Organic",
    paper: "BSCH-302",
    description: "N-Allylation of isatin under basic conditions and isolation of N-allylisatin.",
    kicker: "Heterocyclic preparation",
    lead: "Isatin nitrogen is alkylated by allyl bromide in the presence of a base (K₂CO₃ / DMF or acetone).",
    equation: "Isatin + CH₂=CHCH₂Br + base → N-allylisatin",
    hazard: "Allyl bromide is a lachrymator. Use a fume hood and gloves.",
    theory: "The lactam NH of isatin is deprotonated and SN2-attacks allyl bromide. Yield depends on dryness, base strength and avoiding O-alkylation / over-heating.",
    apparatus: ["Round-bottom flask", "Isatin", "Allyl bromide", "K₂CO₃", "Recrystallisation solvent"],
    controls: [
      control("isatin", "Isatin", 1, 8, 0.1, "g", 2.5),
      control("allyl", "Allyl bromide equivalents", 0.8, 2.5, 0.05, "eq", 1.2),
      control("temp", "Temperature", 25, 80, 1, "°C", 55),
      control("time", "Time", 20, 180, 5, "min", 90),
    ],
    compute: (v) => {
      const mmol = v.isatin / 0.147;
      const yieldPct = clamp(78 * Math.min(1, v.allyl / 1.1) * (v.temp > 40 && v.temp < 70 ? 1 : 0.82) * Math.min(1, v.time / 80), 20, 92);
      const mass = mmol * 0.187 * yieldPct / 100;
      return {
        primary: `${fmt(yieldPct, 0)}% · ${fmt(mass, 2)} g N-allylisatin`,
        detail: `${fmt(mmol, 1)} mmol isatin`,
        observation: v.allyl < 1 ? "Incomplete conversion: TLC still shows isatin." : "Product spot grows; recrystallise from ethanol.",
        quality: "Report melting point and TLC Rf vs authentic isatin.",
        chart: titreCurve(v.time / 4, 40),
      };
    },
    steps: ["Charge isatin, base and solvent.", "Add allyl bromide and stir at the set temperature.", "Quench, extract, recrystallise and weigh."],
    quiz: [quiz("Allylation of isatin typically occurs at", "N", ["The lactam nitrogen", "The ketone carbon only", "The benzene ring para position only"])],
  }),
];

export const syllabusConcepts = [
  lab({
    id: "pblock-structures",
    title: "P-Block Structures: Diborane to Xenon",
    subject: "Inorganic",
    paper: "BSCH-101",
    kind: "sim",
    description: "Interactive structures and bonding for diborane, borazine, interhalogens, silicones and xenon compounds.",
    kicker: "Semester I inorganic",
    lead: "Switch compounds to inspect 3c–2e bonds, ABₙ geometries and hydrolysis behaviour.",
    equation: "Examples: B₂H₆, B₃N₃H₆, ClF₃, XeF₄, XeO₃",
    hazard: "These are structural teaching models, not laboratory preparations of xenon fluorides.",
    theory: "Diborane uses banana bonds. Interhalogens follow VSEPR (T-shape, square planar, pentagonal bipyramid). Xenon fluorides expand the octet using d-orbitals in the simple teaching picture (or 3c–4e in modern MOT).",
    controls: [control("cmpd", "Compound (1=B2H6,2=borazine,3=ClF3,4=XeF4,5=silicone)", 1, 5, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Diborane", "3c–2e B–H–B bridges", "Lewis acid; hydrolyses to boric acid"],
        2: ["Borazine", "Isoelectronic with benzene", "Polar B–N; more reactive than benzene"],
        3: ["ClF₃", "T-shape (AB₃E₂)", "Powerful fluorinating agent"],
        4: ["XeF₄", "Square planar (AB₄E₂)", "Hydrolyses toward XeO₃"],
        5: ["Silicones", "–(R₂SiO)ₙ–", "Straight, cyclic or cross-linked"],
      };
      const r = rows[Math.round(v.cmpd)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Match geometry with VSEPR electron groups", chart: titreCurve(v.cmpd * 15, 50) };
    },
    steps: ["Select a syllabus compound.", "Read bonding and geometry.", "Predict hydrolysis/reactivity."],
    quiz: [quiz("Diborane contains", "bridge", ["3-centre–2-electron B–H–B bonds", "Only 2c–2e B–B bonds", "Ionic H⁻ only"])],
  }),
  lab({
    id: "hydrocarbon-mechanisms",
    title: "Alkenes & Alkynes: Markovnikov, Zaitsev, Ozonolysis",
    subject: "Organic",
    paper: "BSCH-101",
    kind: "sim",
    description: "Toggle reagents to predict addition, elimination and oxidative cleavage products.",
    kicker: "Acyclic hydrocarbons",
    lead: "See how HX, HOX, KMnO₄, peracids and ozone map onto the syllabus outcomes.",
    equation: "RCH=CH₂ + HX → Markovnikov alkyl halide (no peroxide)",
    hazard: "Teaching predictor only.",
    theory: "Zaitsev: more substituted alkene. Peroxide + HBr: anti-Markovnikov. Ozonolysis locates the double bond.",
    controls: [control("rxn", "Reaction (1=HX,2=HBr/ROOR,3=Zaitsev,4=ozone,5=KMnO4 cis)", 1, 5, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["HX addition", "Markovnikov", "H adds to the carbon with more hydrogens"],
        2: ["HBr / peroxide", "Anti-Markovnikov", "Radical chain; Br at the less substituted carbon"],
        3: ["Dehydrohalogenation", "Zaitsev alkene", "More substituted C=C predominates"],
        4: ["Ozonolysis", "Carbonyls from each C of C=C", "Used to locate the double bond"],
        5: ["Cold KMnO₄ / OsO₄", "Syn diol", "Anti diol via epoxide/peracid then hydrolysis"],
      };
      const r = rows[Math.round(v.rxn)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Write the mechanism arrow pattern next", chart: titreCurve(v.rxn * 15, 50) };
    },
    steps: ["Pick the reagent set.", "State regiochemistry.", "Write the organic product."],
    quiz: [quiz("HBr with peroxides gives", "anti", ["Anti-Markovnikov addition", "Zaitsev elimination", "Syn dihydroxylation"])],
  }),
  lab({
    id: "eas-directing-groups",
    title: "EAS Orientation: Activating and Deactivating Groups",
    subject: "Organic",
    paper: "BSCH-101",
    kind: "sim",
    description: "See why –OH/–NH₂ are o/p directors and –NO₂ is a meta director.",
    kicker: "Aromatic substitution",
    lead: "The first substituent controls where NO₂⁺, SO₃, X⁺ or R⁺ enter.",
    equation: "Ar–G + E⁺ → o/p or m product depending on G",
    hazard: "Teaching model.",
    theory: "Donors raise HOMO density at o/p. Strong acceptors leave meta relatively less deactivated.",
    controls: [control("g", "Group (1=OH,2=NH2,3=CH3,4=NO2,5=Cl)", 1, 5, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["–OH", "Strongly activating, o/p", "Phenol brominates to 2,4,6-tribromophenol in water"],
        2: ["–NH₂", "Strongly activating, o/p", "Often protected before nitration/bromination"],
        3: ["–CH₃", "Activating, o/p", "Toluene nitrates faster than benzene"],
        4: ["–NO₂", "Deactivating, meta", "Nitrobenzene is meta to a second electrophile"],
        5: ["–Cl", "Deactivating yet o/p", "Inductive withdrawal, resonance donation"],
      };
      const r = rows[Math.round(v.g)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "o/p vs meta is a syllabus definition item", chart: titreCurve(v.g * 16, 50) };
    },
    steps: ["Choose G.", "Predict o/p vs meta.", "State activating vs deactivating."],
    quiz: [quiz("Halo substituents are", "deact-op", ["Deactivating but o/p directing", "Activating and meta", "Like nitro groups"])],
  }),
  lab({
    id: "jablonski-photochemistry",
    title: "Jablonski Diagram and Quantum Yield",
    subject: "Physical",
    paper: "BSCH-101",
    kind: "sim",
    description: "Map absorption, IC, ISC, fluorescence and phosphorescence, including H₂–Cl₂ vs H₂–Br₂.",
    kicker: "Photochemistry",
    lead: "Φ = molecules transformed / photons absorbed. Chain reactions can give Φ ≫ 1.",
    equation: "Φ = rate of process / photon absorption rate",
    hazard: "Teaching model of excited states.",
    theory: "H₂–Cl₂ has a high quantum yield (chain). H₂–Br₂ is much less efficient. Phosphorescence is T₁ → S₀.",
    controls: [control("path", "Process (1=fluor,2=phos,3=H2Cl2,4=H2Br2)", 1, 4, 1, "", 1), control("photons", "Photons absorbed (relative)", 1, 20, 1, "", 4)],
    compute: (v) => {
      const phi = { 1: 0.7, 2: 0.05, 3: 1e5, 4: 0.01 }[Math.round(v.path)] || 0.7;
      const prod = phi * v.photons;
      return { primary: `Φ model ${phi > 10 ? phi.toExponential(1) : fmt(phi, 2)} · product ~ ${fmt(prod, 1)}`, detail: Math.round(v.path) === 3 ? "Chain reaction: Φ ≫ 1" : "Unimolecular photophysics or inefficient chain", observation: "ISC populates T₁; phosphorescence is longer-lived.", quality: "Abnormal Φ needs a chain explanation", chart: titreCurve(Math.min(100, Math.log10(phi + 1) * 40), 50) };
    },
    steps: ["Trace S₀→S₁ absorption.", "Choose fluorescence vs ISC/phosphorescence.", "Contrast H₂–Cl₂ and H₂–Br₂ yields."],
    quiz: [quiz("A quantum yield much greater than 1 usually means", "chain", ["A chain reaction", "A forbidden transition", "A singlet only"])],
  }),
  lab({
    id: "conformational-analysis",
    title: "Conformational Analysis: Ethane to 2-Chloroethanol",
    subject: "Organic",
    paper: "BSCH-101",
    kind: "sim",
    description: "Rotate Newman projections and compare staggered, eclipsed, gauche and anti energies.",
    kicker: "Stereochemistry",
    lead: "Staggered ethane is lower than eclipsed. n-Butane anti is below gauche.",
    equation: "E(θ) teaching model: V₃/2 (1 − cos 3θ) plus gauche terms",
    hazard: "Teaching energy profile.",
    theory: "Configurational isomers cannot be interconverted by rotation; conformational isomers can.",
    controls: [control("theta", "Dihedral angle", 0, 180, 5, "°", 60), control("mol", "Molecule (1=ethane,2=butane,3=1,2-dichloroethane)", 1, 3, 1, "", 2)],
    compute: (v) => {
      const ecl = Math.cos((v.theta * Math.PI) / 60);
      const E = (1 - ecl) * (Math.round(v.mol) === 1 ? 12 : 16) + (Math.abs(v.theta - 60) < 20 ? 3.3 : 0);
      return { primary: `θ = ${v.theta}° · E rel. ${fmt(E, 1)} kJ mol⁻¹`, detail: v.theta % 60 === 0 && v.theta % 120 !== 0 ? "Staggered" : "Toward eclipsed", observation: v.theta === 180 ? "Anti (butane/dichloroethane)" : v.theta === 60 ? "Gauche" : "Scan the profile", quality: "Anti n-butane is the global minimum", chart: titreCurve(v.theta, 180) };
    },
    steps: ["Set the dihedral.", "Identify staggered/eclipsed/gauche/anti.", "Rank energies."],
    quiz: [quiz("The most stable n-butane conformer is", "anti", ["Anti (180°)", "Fully eclipsed", "Gauche only"])],
  }),
  lab({
    id: "colloids-adsorption",
    title: "Colloids, Hardy–Schulze and Adsorption Isotherms",
    subject: "Physical",
    paper: "BSCH-101",
    kind: "sim",
    description: "Coagulating power vs ion charge; Freundlich vs Langmuir coverage.",
    kicker: "Surface chemistry",
    lead: "Hardy–Schulze: coagulating power rises sharply with counter-ion charge. Langmuir saturates; Freundlich is empirical.",
    equation: "θ = KP/(1+KP);  x/m = k P^{1/n}",
    hazard: "Teaching model.",
    theory: "Gold number measures protective power of lyophilic colloids.",
    controls: [control("charge", "Coagulating ion charge", 1, 3, 1, "", 2), control("P", "Pressure / conc. (relative)", 0.1, 10, 0.1, "", 2), control("K", "Langmuir K", 0.1, 8, 0.1, "", 1.4)],
    compute: (v) => {
      const coag = 10 ** (v.charge - 1);
      const theta = (v.K * v.P) / (1 + v.K * v.P);
      return { primary: `Relative coagulating power ~ ${fmt(coag, 0)} · θ = ${fmt(theta, 3)}`, detail: "Al³⁺ ≫ Ca²⁺ ≫ Na⁺ for a negative sol", observation: "Langmuir θ → 1 at high P; Freundlich has no strict monolayer cap in the simple form.", quality: "State sol charge before quoting Hardy–Schulze", chart: titreCurve(theta * 100, 80) };
    },
    steps: ["Change ion charge and see coagulating power.", "Slide P to fill a Langmuir monolayer.", "Contrast Freundlich’s log plot."],
    quiz: [quiz("For a negative As₂S₃ sol, the best coagulant among these is", "al", ["Al³⁺", "Na⁺", "Ca²⁺ equally with Na⁺"])],
  }),
  lab({
    id: "df-block-properties",
    title: "d- and f-Block: Colour, Magnetism, Lanthanide Contraction",
    subject: "Inorganic",
    paper: "BSCH-201",
    kind: "sim",
    description: "Spin-only moments, d–d colour, and consequences of lanthanide contraction.",
    kicker: "Transition metals",
    lead: "μ_so = √[n(n+2)] BM. Lanthanide contraction makes 4d/5d sizes similar.",
    equation: "μ_s.o. = √[n(n+2)] B.M.",
    hazard: "Teaching calculation.",
    theory: "Variable oxidation states, catalytic behaviour and complexation are syllabus themes.",
    controls: [control("unpaired", "Unpaired electrons n", 0, 5, 1, "", 3), control("series", "Series (1=3d,2=4d/5d,3=Ln)", 1, 3, 1, "", 1)],
    compute: (v) => {
      const mu = Math.sqrt(v.unpaired * (v.unpaired + 2));
      const note = { 1: "3d: stronger pairing energy variation; colours often d–d", 2: "4d/5d: more pairing, lower spin common", 3: "Ln: sharp f–f bands; contraction along the series" }[Math.round(v.series)];
      return { primary: `μ_s.o. = ${fmt(mu, 2)} BM`, detail: note, observation: "Colour needs a partly filled d (or f) set and allowed/partially allowed transitions.", quality: "Spin-only ignores orbital contribution", chart: titreCurve(mu * 15, 50) };
    },
    steps: ["Set n unpaired.", "Compute μ.", "Compare 3d vs 4d/5d vs Ln."],
    quiz: [quiz("Lanthanide contraction causes", "similar", ["Similar radii of 4d and 5d congeners", "All lanthanides to be +2 only", "No complex formation"])],
  }),
  lab({
    id: "mot-diatomics",
    title: "MOT of Homonuclear and Heteronuclear Diatomics",
    subject: "Physical",
    paper: "BSCH-201",
    kind: "sim",
    description: "Bond order, magnetism and MO filling for N₂, O₂, CO, NO and related ions.",
    kicker: "Chemical bonding",
    lead: "Fill MOs, compute bond order = (bonding − antibonding)/2, and predict paramagnetism.",
    equation: "Bond order = (N_b − N_a)/2",
    hazard: "Teaching MO diagrams (unhybridized as in the syllabus).",
    theory: "O₂ has two unpaired electrons in π*. CO and NO are heteronuclear with polar MOs.",
    controls: [control("mol", "Species (1=N2,2=O2,3=O2-,4=CO,5=NO)", 1, 5, 1, "", 2)],
    compute: (v) => {
      const rows = {
        1: ["N₂", 3, "diamagnetic", "KK (σ2s)²(σ*2s)²(π2p)⁴(σ2p)²"],
        2: ["O₂", 2, "paramagnetic", "two electrons in π*"],
        3: ["O₂⁻", 1.5, "paramagnetic", "superoxide"],
        4: ["CO", 3, "diamagnetic", "C-end nucleophile in metal carbonyls"],
        5: ["NO", 2.5, "paramagnetic", "odd electron in π*"],
      };
      const r = rows[Math.round(v.mol)] || rows[2];
      return { primary: `${r[0]} bond order ${r[1]} · ${r[2]}`, detail: r[3], observation: "O₂ is the classic MOT paramagnetism example.", quality: "Count electrons after removing inner KK if the syllabus does", chart: titreCurve(r[1] * 25, 75) };
    },
    steps: ["Select the molecule/ion.", "Read bond order and magnetism.", "Connect CO to metal carbonyls."],
    quiz: [quiz("Which is paramagnetic?", "o2", ["O₂", "N₂", "CO"])],
  }),
  lab({
    id: "coordination-vbt-cft",
    title: "Coordination: VBT, CFT, CFSE and Job’s Method",
    subject: "Inorganic",
    paper: "BSCH-301/401",
    kind: "sim",
    description: "Assign hybridisation, high/low spin, CFSE and a Job’s-plot composition.",
    kicker: "Coordination chemistry",
    lead: "VBT explains geometry; CFT explains colour and spin. Job’s method finds complex stoichiometry.",
    equation: "CFSE(oct) = (−0.4 n_t + 0.6 n_e) Δₒ + pairing corrections as taught",
    hazard: "Teaching crystal-field model.",
    theory: "[Fe(CN)₆]⁴⁻ is low-spin d⁶; [FeF₆]⁴⁻ is high-spin. Job’s plot maximum mole fraction gives M:L.",
    controls: [control("dn", "dⁿ count", 0, 10, 1, "", 6), control("delta", "Δₒ vs P (1=low spin,2=high spin)", 1, 2, 1, "", 1), control("job", "Mole fraction ligand at Job max", 0.2, 0.8, 0.05, "", 0.67)],
    compute: (v) => {
      const low = v.delta < 1.5;
      const ratio = v.job > 0.7 ? "1:3" : v.job > 0.55 ? "1:2" : "1:1";
      const cfse = v.dn === 6 && low ? "−2.4 Δₒ + 2P (low-spin t₂g⁶)" : `high/low spin teaching case for d${v.dn}`;
      return { primary: `d${v.dn} ${low ? "low" : "high"}-spin · Job ≈ ${ratio}`, detail: cfse, observation: "Colour arises from d–d (and sometimes CT) transitions.", quality: "HSAB: CN⁻ is a strong-field ligand", chart: titreCurve(v.job * 100, 67) };
    },
    steps: ["Set dⁿ and field strength.", "State geometry/hybridisation (VBT).", "Read Job maximum as composition."],
    quiz: [quiz("A Job’s plot peak at ligand mole fraction 0.67 suggests", "12", ["ML₂ (or 1:2)", "Only ML₆", "No complex"])],
  }),
  lab({
    id: "metal-carbonyls-organometallic",
    title: "Metal Carbonyls and Organometallic Li/Mg",
    subject: "Inorganic",
    paper: "BSCH-301",
    kind: "sim",
    description: "18-electron count for Ni(CO)₄, Fe(CO)₅, Cr(CO)₆ and Grignard/alkyl lithium uses.",
    kicker: "Organometallics",
    lead: "CO is a strong-field σ-donor/π-acceptor ligand. Grignard reagents are carbon nucleophiles.",
    equation: "18e rule: Ni(CO)₄, Fe(CO)₅, Cr(CO)₆",
    hazard: "Ni(CO)₄ is extremely toxic in real life; this is a counting exercise.",
    theory: "Alkyl/aryl Li and Mg compounds: preparation, polarity of C–M, and synthetic use.",
    controls: [control("cmpd", "Compound (1=Ni(CO)4,2=Fe(CO)5,3=Cr(CO)6,4=RMgX)", 1, 4, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Ni(CO)₄", "18e, tetrahedral", "Ni(0) + 4 CO"],
        2: ["Fe(CO)₅", "18e, trigonal bipyramidal", "Also Fe₂(CO)₉, Fe₃(CO)₁₂ on the syllabus"],
        3: ["Cr(CO)₆", "18e, octahedral", "Classic hexacarbonyl"],
        4: ["RMgX", "Cδ⁻–Mgδ⁺", "Carbonation → carboxylic acids after work-up"],
      };
      const r = rows[Math.round(v.cmpd)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Count metal d electrons + 2e per CO", chart: titreCurve(v.cmpd * 20, 50) };
    },
    steps: ["Apply the 18e rule.", "State geometry.", "Recall one synthetic use of RMgX."],
    quiz: [quiz("Ni(CO)₄ electron count is", "18", ["18", "16", "14"])],
  }),
  lab({
    id: "heterocycles-pyrrole-pyridine",
    title: "Heterocycles: Pyrrole, Furan, Thiophene, Pyridine",
    subject: "Organic",
    paper: "BSCH-301",
    kind: "sim",
    description: "Aromaticity, basicity, Paal–Knorr, Hantzsch and Chichibabin reactivity.",
    kicker: "Heterocyclic chemistry",
    lead: "Pyrrole is a weak acid (N–H) and not basic at nitrogen. Pyridine is basic and undergoes Chichibabin amination.",
    equation: "Paal–Knorr: 1,4-dicarbonyl → pyrrole/furan/thiophene",
    hazard: "Teaching reactivity map.",
    theory: "Five-membered heterocycles are π-excessive (EAS). Pyridine is π-deficient (NAS, Chichibabin).",
    controls: [control("het", "Ring (1=pyrrole,2=furan,3=thiophene,4=pyridine)", 1, 4, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Pyrrole", "Aromatic 6π; N–H acidic", "EAS (halogenation/nitration) at C-2; not protonated on N in dilute acid easily"],
        2: ["Furan", "Least aromatic of the trio", "Paal–Knorr with P₄O₁₀ / acid"],
        3: ["Thiophene", "Most aromatic of the 5-membered trio", "EAS similar to benzene but faster"],
        4: ["Pyridine", "Basic; Chichibabin at C-2", "Hantzsch synthesis; NAS rather than EAS"],
      };
      const r = rows[Math.round(v.het)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Compare pyrrole vs pyridine basicity in one sentence", chart: titreCurve(v.het * 20, 50) };
    },
    steps: ["Select the heterocycle.", "State aromaticity and preferred reaction.", "Name the syllabus synthesis."],
    quiz: [quiz("Chichibabin reaction is typical of", "py", ["Pyridine", "Pyrrole", "Furan"])],
  }),
  lab({
    id: "phase-rule-water-pbag",
    title: "Phase Rule: Water and Pb–Ag Eutectic",
    subject: "Physical",
    paper: "BSCH-301",
    kind: "sim",
    description: "F = C − P + 2. Water one-component system and desilverisation of lead.",
    kicker: "Phase equilibria",
    lead: "At the water triple point F = 0. The Pb–Ag eutectic explains Pattinson’s desilverisation.",
    equation: "F = C − P + 2",
    hazard: "Teaching phase diagrams.",
    theory: "Along a univariant curve F = 1. At a eutectic, three phases coexist (F = 0 for a two-component condensed system with P = 1 atm convention F′ = C − P + 1).",
    controls: [control("sys", "System (1=water,2=Pb-Ag)", 1, 2, 1, "", 1), control("phases", "Number of phases P", 1, 3, 1, "", 2)],
    compute: (v) => {
      const C = Math.round(v.sys) === 1 ? 1 : 2;
      const F = C - v.phases + 2;
      return { primary: `C=${C}, P=${v.phases} → F=${F}`, detail: C === 1 ? "Water: ice–water–vapour triple point is invariant" : "Pb–Ag: eutectic used in desilverisation of lead", observation: "Cooling a Ag-rich melt deposits Pb until the eutectic.", quality: "State whether the condensed-phase 1-atm convention is used", chart: titreCurve(F * 20 + 20, 50) };
    },
    steps: ["Choose water or Pb–Ag.", "Count components and phases.", "Compute F and interpret."],
    quiz: [quiz("At the water triple point, F is", "zero", ["0", "1", "2"])],
  }),
  lab({
    id: "carbanion-named-reactions",
    title: "Carbanions: Aldol, Perkin, Benzoin, Knoevenagel, AAE",
    subject: "Organic",
    paper: "BSCH-401",
    kind: "sim",
    description: "α-Hydrogen acidity, tautomerism and carbon–carbon bond forming syllabus reactions.",
    kicker: "Carbanion chemistry",
    lead: "Stabilised carbanions add to carbonyls. Acetoacetic ester is a 1,3-dicarbonyl with highly acidic α-H.",
    equation: "Examples: aldol, Perkin, benzoin, haloform, Mannich, Michael, Knoevenagel",
    hazard: "Teaching mechanisms.",
    theory: "Ketonic vs acid hydrolysis of AAE gives ketones or acids.",
    controls: [control("rxn", "Reaction (1=aldol,2=Perkin,3=benzoin,4=haloform,5=AAE ketone)", 1, 5, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Aldol", "Enolate + carbonyl", "β-Hydroxy carbonyl, may dehydrate"],
        2: ["Perkin", "Aromatic aldehyde + acid anhydride", "Cinnamic acids"],
        3: ["Benzoin", "Two PhCHO, CN⁻", "α-Hydroxy ketone"],
        4: ["Haloform", "Methyl ketone + X₂/OH⁻", "CHI₃ yellow test for CH₃CO–"],
        5: ["AAE ketonic hydrolysis", "Dilute acid / ketone path", "Substituted acetone derivatives"],
      };
      const r = rows[Math.round(v.rxn)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Identify the nucleophilic carbon in each", chart: titreCurve(v.rxn * 16, 50) };
    },
    steps: ["Pick the named reaction.", "Identify the carbanion/enolate.", "State the product class."],
    quiz: [quiz("The haloform test is given by", "methylk", ["Methyl ketones (and ethanol/acetaldehyde)", "Only benzophenone", "Only carboxylic acids"])],
  }),
  lab({
    id: "carbohydrates-glucose-fructose",
    title: "Glucose and Fructose: Open Chain to Haworth",
    subject: "Organic",
    paper: "BSCH-401",
    kind: "sim",
    description: "Anomers, osazone identity, Kiliani–Fischer and Ruff relationships.",
    kicker: "Carbohydrates",
    lead: "Glucose is an aldohexose; fructose a ketohexose. Both give the same osazone.",
    equation: "Kiliani–Fischer lengthens the chain; Ruff shortens it.",
    hazard: "Teaching structures.",
    theory: "Cyclic pyranose (glucose) and furanose (fructose) explain mutarotation via the anomeric carbon.",
    controls: [control("topic", "Focus (1=open chain,2=anomer,3=osazone,4=Kiliani,5=Ruff)", 1, 5, 1, "", 2)],
    compute: (v) => {
      const rows = {
        1: ["Open chain", "Glucose = penta-hydroxy aldehyde", "Fructose = 2-ketohexose"],
        2: ["Anomers", "α/β at C-1 (glucose)", "Mutarotation via open chain"],
        3: ["Osazone", "Same osazone from glucose and fructose", "C-1 and C-2 become equivalent in the osazone"],
        4: ["Kiliani–Fischer", "Arabinose → glucose + mannose", "Chain lengthening"],
        5: ["Ruff", "Glucose → arabinose", "Chain shortening"],
      };
      const r = rows[Math.round(v.topic)] || rows[2];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Haworth and chair are both on the syllabus", chart: titreCurve(v.topic * 16, 50) };
    },
    steps: ["Toggle each structural argument.", "Connect osazone to C-1/C-2.", "State one interconversion."],
    quiz: [quiz("Glucose and fructose give the same osazone because", "c12", ["The reaction involves C-1 and C-2, which become identical", "They are identical molecules", "Osazones ignore stereochemistry always"])],
  }),
  lab({
    id: "analytical-errors-stats",
    title: "Evaluation of Analytical Data",
    subject: "Analytical",
    paper: "BSCH-401",
    kind: "sim",
    description: "Significant figures, mean, median, range, standard deviation, determinate vs indeterminate error.",
    kicker: "Analytical data",
    lead: "Precision is scatter; accuracy is closeness to the true value.",
    equation: "s = √[Σ(xᵢ − x̄)² / (n − 1)]",
    hazard: "Teaching statistics.",
    theory: "Determinate errors are systematic (bias). Indeterminate errors are random.",
    controls: [control("x1", "Reading 1", 10, 30, 0.01, "", 24.12), control("x2", "Reading 2", 10, 30, 0.01, "", 24.18), control("x3", "Reading 3", 10, 30, 0.01, "", 24.09), control("true", "True value", 10, 30, 0.01, "", 24.2)],
    compute: (v) => {
      const xs = [v.x1, v.x2, v.x3];
      const mean = xs.reduce((a, b) => a + b, 0) / 3;
      const s = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / 2);
      const acc = Math.abs(mean - v.true);
      return { primary: `mean ${fmt(mean, 3)} · s ${fmt(s, 3)} · |bias| ${fmt(acc, 3)}`, detail: "Range = max − min", observation: s < 0.1 ? "Good precision" : "Recheck technique", quality: acc < 0.15 ? "Accurate enough for teaching" : "Look for systematic error", chart: titreCurve(mean, v.true) };
    },
    steps: ["Enter three titres.", "Compute mean, s, range.", "Compare with the true value."],
    quiz: [quiz("A consistently high burette reading is", "det", ["Determinate (systematic) error", "Indeterminate only", "Not an error"])],
  }),
  lab({
    id: "ai-chemistry-tools",
    title: "AI Tools in Chemistry",
    subject: "Analytical",
    paper: "BSCH-401",
    kind: "sim",
    description: "SMILES/InChI, descriptors, PubChem-style lookup, and ethics/limitations of chemical AI.",
    kicker: "AI applications",
    lead: "Machine learning predicts properties from molecular descriptors. Always check a measured value.",
    equation: "SMILES → descriptors → model → pKa / solubility / toxicity (estimated)",
    hazard: "Model output is not a substitute for experiment or a safety data sheet.",
    theory: "Supervised models need labelled data. Bias and out-of-domain molecules fail silently.",
    controls: [control("mol", "Example (1=ethanol,2=caffeine,3=aspirin,4=unknown-like)", 1, 4, 1, "", 1), control("trust", "Human review (0=none,1=checked)", 0, 1, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Ethanol CCO", "bp ~78 °C, miscible", "Simple alcohol; models usually interpolate well"],
        2: ["Caffeine", "pKa (conjugate acid) ~0.6, logP ~0", "Alkaloid; check ChEMBL/PubChem"],
        3: ["Aspirin", "pKa ~3.5, hydrolyses", "Labile ester: models may miss instability"],
        4: ["Out-of-domain structure", "Prediction unreliable", "Do not trust without experiment"],
      };
      const r = rows[Math.round(v.mol)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2] + (v.trust < 0.5 ? " · Unreviewed output." : " · Reviewed against a database."), quality: v.trust > 0.5 ? "Ethical use: cite data and uncertainty" : "Unreviewed AI is not a result", chart: titreCurve(v.mol * 20, 50) };
    },
    steps: ["Encode a molecule as SMILES.", "Inspect descriptors.", "Compare a prediction with PubChem and state limits."],
    quiz: [quiz("A responsible use of chemical AI is", "check", ["Cite the model, report uncertainty, verify with experiment/database", "Submit model pKa as an analytical result with no check", "Train on unpublished student data without consent"])],
  }),
  lab({
    id: "pericyclic-fmo",
    title: "Pericyclic Reactions: FMO Snapshot",
    subject: "Organic",
    paper: "BSAC-603",
    kind: "sim",
    description: "HOMO/LUMO control for electrocyclic, cycloaddition and sigmatropic examples.",
    kicker: "Advanced organic",
    lead: "Thermal vs photochemical selection rules come from which MO is the HOMO.",
    equation: "Example: butadiene electrocyclisation; Diels–Alder; [1,5]-H shift",
    hazard: "Teaching FMO, not a full Woodward–Hoffmann course.",
    theory: "Photochemical excitation changes the HOMO, reversing allowed stereochemistry for electrocyclic reactions.",
    controls: [control("type", "Type (1=electrocyclic,2=cycloaddition,3=sigmatropic)", 1, 3, 1, "", 2), control("mode", "Mode (1=thermal,2=photo)", 1, 2, 1, "", 1)],
    compute: (v) => {
      const photo = v.mode > 1.5;
      const msg = {
        1: photo ? "Photo electrocyclic: opposite stereochemistry to thermal" : "Thermal electrocyclic: disrotatory for 4n+2 electrons (butadiene 4π is conrotatory thermally)",
        2: photo ? "[2+2] photochemical cycloadditions are the teaching contrast" : "Thermal Diels–Alder: diene HOMO + dienophile LUMO",
        3: photo ? "Photo can open other pathways" : "Thermal [1,5]-H shift is suprafacial in the 6e teaching example",
      }[Math.round(v.type)];
      return { primary: photo ? "Photochemical HOMO" : "Thermal HOMO", detail: msg, observation: "Sketch HOMO/LUMO phases before predicting stereochemistry.", quality: "One example of each type is what the syllabus asks", chart: titreCurve(v.type * 25, 50) };
    },
    steps: ["Choose reaction class.", "Toggle thermal/photo.", "State the allowed mode."],
    quiz: [quiz("Thermal Diels–Alder is classified as", "cyclo", ["A cycloaddition", "A sigmatropic shift only", "An electrocyclic ring opening only"])],
  }),
  lab({
    id: "dyes-congo-malachite",
    title: "Natural and Synthetic Dyes",
    subject: "Organic",
    paper: "BSCH-601B",
    kind: "sim",
    description: "Classify dyes and inspect Congo red, malachite green, indigo and alizarin.",
    kicker: "Dye chemistry",
    lead: "Chromophore + auxochrome. Binding to fabric is ionic, covalent (reactive) or mechanical (vat).",
    equation: "Azo dyes from diazonium + coupler; triarylmethane dyes from aryl condensations",
    hazard: "Some azo dyes have restricted aromatic amine metabolites. Teaching structures only.",
    theory: "Congo red is a bis-azo indicator/dye. Malachite green is triarylmethane. Indigo is a vat dye.",
    controls: [control("dye", "Dye (1=Congo red,2=malachite,3=indigo,4=alizarin,5=phenolphthalein)", 1, 5, 1, "", 1)],
    compute: (v) => {
      const rows = {
        1: ["Congo red", "Bis-azo", "Direct dye; pH indicator"],
        2: ["Malachite green", "Triarylmethane", "Cationic dye for fabrics/biology"],
        3: ["Indigo / indigotin", "Vat dye", "Reduced to soluble leuco form, then oxidised on fibre"],
        4: ["Alizarin", "Natural anthraquinone", "Mordant dye with metal ions"],
        5: ["Phenolphthalein", "Phthalein", "Colourless acid / pink base — also a dye-related structure"],
      };
      const r = rows[Math.round(v.dye)] || rows[1];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "State chromophore class in the exam answer", chart: titreCurve(v.dye * 16, 50) };
    },
    steps: ["Select a syllabus dye.", "Name the chromophore class.", "State how it binds to fabric."],
    quiz: [quiz("Indigo is applied as a", "vat", ["Vat dye (reduced then oxidised on the fibre)", "Direct azo dye only", "Food pH indicator only"])],
  }),
  lab({
    id: "nmr-mass-ir-uv-practice",
    title: "Spectroscopy Interpreter Drill: IR, UV, NMR, MS",
    subject: "Analytical",
    paper: "BSCH-501A",
    kind: "sim",
    description: "Assign IR bands, UV transitions, ¹H NMR splitting and mass-spec peaks for syllabus molecules.",
    kicker: "Molecular spectroscopy",
    lead: "Work ethyl bromide, acetaldehyde, ethyl acetate and acetophenone as in the syllabus.",
    equation: "Beer–Lambert for UV; δ and J for NMR; M⁺· and fragments for MS",
    hazard: "Teaching spectra.",
    theory: "Equivalent protons, n+1 splitting, nitrogen rule, fingerprint IR.",
    controls: [control("mol", "Molecule (1=EtBr,2=MeCHO,3=EtOAc,4=PhCOMe)", 1, 4, 1, "", 2)],
    compute: (v) => {
      const rows = {
        1: ["Ethyl bromide", "NMR: 3H t + 2H q; MS: M and M+2 (Br)", "IR: C–Br fingerprint"],
        2: ["Acetaldehyde", "NMR: CHO ~9.8 ppm, CH₃ d; UV n→π*", "MS: m/z 44 M⁺·, 43 CH₃CO⁺"],
        3: ["Ethyl acetate", "NMR: 2H q, 3H t, 3H s", "IR: ester C=O ~1740 cm⁻¹"],
        4: ["Acetophenone", "NMR: 5H aromatic + 3H s; MS: 105 PhCO⁺", "IR: conjugated C=O ~1685 cm⁻¹"],
      };
      const r = rows[Math.round(v.mol)] || rows[2];
      return { primary: r[0], detail: r[1], observation: r[2], quality: "Always combine IR + NMR + MS, not one spectrum", chart: titreCurve(v.mol * 20, 50) };
    },
    steps: ["Pick the syllabus molecule.", "List key IR, NMR and MS features.", "State one UV transition type if conjugated/carbonyl."],
    quiz: [quiz("A 2H quartet + 3H triplet commonly indicates", "ethyl", ["An ethyl group", "A tert-butyl group", "A phenyl ring only"])],
  }),
];

function titreCurve(current, end) {
  return Array.from({ length: 21 }, (_, i) => {
    const x = i * 2;
    const y = 20 + Math.abs(x - end) * 0.4 + (x < current ? 8 : 0);
    return { x, y };
  });
}

function decayChart(c0, k) {
  return Array.from({ length: 21 }, (_, i) => ({ x: i, y: c0 * Math.exp(-k * i) * 80 }));
}

function vCurve(eq) {
  return Array.from({ length: 21 }, (_, i) => {
    const x = i * 2;
    return { x, y: 12 + Math.abs(x - eq) * 0.7 };
  });
}

function pHCurve(eq) {
  return Array.from({ length: 21 }, (_, i) => {
    const x = i * 2;
    const y = x < eq ? 2 + x * 0.15 : 7 + Math.min(6, (x - eq) * 0.5);
    return { x, y: y * 8 };
  });
}

export const syllabusInteractiveById = Object.fromEntries(
  [...syllabusInteractives, ...syllabusConcepts].map((item) => [item.id, item]),
);

export const syllabusInteractiveIds = Object.keys(syllabusInteractiveById);

export const syllabusCompletedLabs = [...syllabusInteractives, ...syllabusConcepts].map((item) => ({
  id: item.id,
  title: item.title,
  subject: item.subject,
  route: item.id,
  description: item.description,
  screens: 6,
}));
