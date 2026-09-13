import { useMemo, useState } from "react";
import {
  Award,
  Beaker,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FlaskConical,
  Gauge,
  GraduationCap,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

const num = (value) => Number(value) || 0;
const fmt = (value, digits = 2) =>
  Number.isFinite(value) ? value.toFixed(digits) : "—";

const field = (key, label, min, max, step, unit, value) => ({
  key,
  label,
  min,
  max,
  step,
  unit,
  value,
});

const variant = ({
  label,
  principle,
  equation,
  expected,
  inputs,
  calculate,
  steps = [],
  observationChoices,
  diagnosis,
}) => ({
  label,
  principle,
  equation,
  expected,
  inputs,
  calculate,
  steps,
  observationChoices: observationChoices || [
    expected,
    "No visible or measurable change at any stage",
    "An unrelated endpoint appears before reagent addition",
  ],
  diagnosis: diagnosis || {
    prompt: "Replicate results drift steadily in one direction. What should be checked first?",
    choices: [
      "Conditioning, temperature, blank and systematic technique",
      "Average every reading without investigation",
      "Discard only the lowest reading",
    ],
    answer: 0,
    feedback:
      "Directional drift is systematic evidence; check conditioning, temperature, timing, blank and calibration before averaging.",
  },
});

const standardViva = [
  {
    q: "Why are replicate observations required?",
    choices: [
      "To assess precision and reveal anomalous technique",
      "To guarantee the accepted value",
      "Only to increase the record length",
    ],
    answer: 0,
  },
  {
    q: "Which record is scientifically defensible?",
    choices: [
      "Contemporaneous observations with units, corrections and anomalies",
      "A fair copy reconstructed after the session",
      "Only the final numerical answer",
    ],
    answer: 0,
  },
];

const ionCases = [
  ["NH₄⁺", "Warm with NaOH", "NH₃ evolved; moist red litmus turns blue", "NH₄⁺ + OH⁻ → NH₃ + H₂O"],
  ["Pb²⁺", "Dilute HCl, then KI confirmation", "White PbCl₂; yellow PbI₂ confirmation", "Pb²⁺ + 2I⁻ → PbI₂(s)"],
  ["Cu²⁺", "H₂S in acidic medium; NH₃ confirmation", "Black CuS; deep-blue ammine solution", "Cu²⁺ + 4NH₃ ⇌ [Cu(NH₃)₄]²⁺"],
  ["Al³⁺", "NH₄Cl/NH₄OH; NaOH confirmation", "White gelatinous Al(OH)₃ soluble in excess NaOH", "Al(OH)₃ + OH⁻ → [Al(OH)₄]⁻"],
  ["Fe³⁺", "NH₄Cl/NH₄OH; thiocyanate confirmation", "Reddish-brown hydroxide; blood-red complex", "Fe³⁺ + SCN⁻ ⇌ [FeSCN]²⁺"],
  ["Mn²⁺", "H₂S in ammoniacal medium; oxidation confirmation", "Flesh-coloured MnS; permanganate colour on oxidation", "Mn²⁺ → MnO₄⁻ (oxidation)"],
  ["Ni²⁺", "H₂S in ammoniacal medium; DMG confirmation", "Black NiS; rose-red Ni(DMG)₂", "Ni²⁺ + 2DMG⁻ → Ni(DMG)₂(s)"],
  ["Co²⁺", "H₂S in ammoniacal medium; thiocyanate confirmation", "Black CoS; deep-blue thiocyanate complex", "Co²⁺ + 4SCN⁻ ⇌ [Co(SCN)₄]²⁻"],
  ["Zn²⁺", "H₂S in ammoniacal medium; NaOH confirmation", "White ZnS; Zn(OH)₂ soluble in excess NaOH", "Zn(OH)₂ + 2OH⁻ → [Zn(OH)₄]²⁻"],
  ["Ba²⁺", "(NH₄)₂CO₃ group reagent; chromate confirmation", "Pale-yellow BaCrO₄", "Ba²⁺ + CrO₄²⁻ → BaCrO₄(s)"],
  ["Sr²⁺", "(NH₄)₂CO₃ group reagent; sulfate/flame confirmation", "White SrSO₄; crimson flame", "Sr²⁺ + SO₄²⁻ → SrSO₄(s)"],
  ["Ca²⁺", "(NH₄)₂CO₃ group reagent; oxalate confirmation", "White calcium oxalate; brick-red flame", "Ca²⁺ + C₂O₄²⁻ → CaC₂O₄(s)"],
  ["Mg²⁺", "After group separation; phosphate confirmation", "White crystalline MgNH₄PO₄", "Mg²⁺ + NH₄⁺ + PO₄³⁻ → MgNH₄PO₄(s)"],
  ["CO₃²⁻", "Dilute acid; limewater confirmation", "Brisk CO₂ effervescence; limewater turns milky", "CO₃²⁻ + 2H⁺ → CO₂ + H₂O"],
  ["S²⁻", "Dilute acid; lead acetate confirmation", "H₂S odour; black PbS", "S²⁻ + Pb²⁺ → PbS(s)"],
  ["SO₃²⁻", "Dilute acid; acidified dichromate confirmation", "SO₂ evolved; dichromate changes orange to green", "3SO₃²⁻ + Cr₂O₇²⁻ + 8H⁺ → 3SO₄²⁻ + 2Cr³⁺ + 4H₂O"],
  ["NO₂⁻", "Dilute acid; KI-starch confirmation", "Brown fumes; iodide liberates blue starch–iodine colour", "2NO₂⁻ + 2I⁻ + 4H⁺ → 2NO + I₂ + 2H₂O"],
  ["CH₃COO⁻", "Warm with ethanol and conc. H₂SO₄", "Fruity ester odour", "CH₃COOH + C₂H₅OH ⇌ CH₃COOC₂H₅ + H₂O"],
  ["Cl⁻", "Dilute HNO₃ then AgNO₃", "White AgCl soluble in dilute NH₃", "Ag⁺ + Cl⁻ → AgCl(s)"],
  ["Br⁻", "Dilute HNO₃ then AgNO₃", "Cream AgBr partly soluble in concentrated NH₃", "Ag⁺ + Br⁻ → AgBr(s)"],
  ["I⁻", "Dilute HNO₃ then AgNO₃", "Yellow AgI insoluble in NH₃", "Ag⁺ + I⁻ → AgI(s)"],
  ["NO₃⁻", "Brown-ring test", "Brown ring at acid–aqueous interface", "NO + [Fe(H₂O)₆]²⁺ → [Fe(H₂O)₅NO]²⁺"],
  ["C₂O₄²⁻", "Acidified KMnO₄ on warming", "Permanganate decolourises with CO₂ evolution", "5C₂O₄²⁻ + 2MnO₄⁻ + 16H⁺ → 10CO₂ + 2Mn²⁺ + 8H₂O"],
  ["SO₄²⁻", "BaCl₂ after acidification", "Dense white BaSO₄ insoluble in mineral acid", "Ba²⁺ + SO₄²⁻ → BaSO₄(s)"],
  ["PO₄³⁻", "Ammonium molybdate in nitric acid; warm", "Canary-yellow phosphomolybdate precipitate", "PO₄³⁻ + molybdate → yellow phosphomolybdate"],
].map(([label, principle, expected, equation]) =>
  variant({
    label,
    principle,
    expected,
    equation,
    inputs: [
      field("sample", "Sample portion", 0.1, 2, 0.1, "mL", 0.5),
      field("reagent", "Group reagent", 1, 10, 0.5, "drops", 4),
      field("ph", "Working pH", 1, 12, 0.5, "", label === "NH₄⁺" ? 11 : 7),
    ],
    calculate: (v) => ({
      primary: `${label} case evidence recorded`,
      detail: `${num(v.sample).toFixed(1)} mL sample · ${num(v.reagent)} reagent drops · pH ${num(v.ph).toFixed(1)}`,
      quality:
        num(v.sample) <= 1 && num(v.reagent) <= 6
          ? "Controlled micro-scale test"
          : "Review reagent excess and sample economy",
    }),
    steps: [
      "Record preliminary colour, odour and solubility without drawing a conclusion.",
      "Follow the group-separation order before applying the confirmatory test.",
      "Run a blank or known control where the colour change is ambiguous.",
      "Write ionic evidence and rule out interfering ions.",
    ],
  }),
);

const practicalConfigs = [
  {
    id: "glass-working-assessment",
    title: "Glass Working & Cork Boring",
    topic: "Laboratory Technique",
    icon: Sparkles,
    objective:
      "Demonstrate safe cutting, fire-polishing, bending, jet drawing and cork boring with dimensional and safety checks.",
    safety:
      "Wear eye protection. Use freshly cut glass only after fire-polishing, keep hot glass on a heatproof mat, and lubricate the borer—never push toward the palm.",
    commonSteps: [
      "Inspect tubing and select the correct diameter and wall thickness.",
      "Mark, score once, protect hands and snap away from the body.",
      "Rotate uniformly in the non-luminous flame until the glass softens.",
      "Cool on a heatproof surface and inspect for sharp edges, constriction and strain.",
    ],
    variants: [
      variant({ label: "Cut & fire-polish", principle: "A single scratch localises fracture; gentle rotation rounds sharp edges without closing the bore.", equation: "Quality = clean fracture + open bore + rounded rim", expected: "Square cut, smooth rim and unobstructed bore", inputs: [field("angle", "Cut deviation", 0, 20, 1, "°", 3), field("bore", "Bore retained", 50, 100, 1, "%", 96)], calculate: (v) => ({ primary: `${Math.max(0, 100 - num(v.angle) * 3 - (100 - num(v.bore))).toFixed(0)}% specimen quality`, detail: "Target: deviation ≤5° and bore retained ≥90%", quality: num(v.angle) <= 5 && num(v.bore) >= 90 ? "Pass" : "Repeat with gentler, uniform heating" }) }),
      variant({ label: "Bend tubing", principle: "A broad, uniformly heated zone bends without flattening or kinking.", equation: "Bend quality depends on uniform heat and symmetric pull", expected: "Smooth bend with constant bore and no kink", inputs: [field("angle", "Target bend", 30, 120, 5, "°", 90), field("flatten", "Bore flattening", 0, 40, 1, "%", 7)], calculate: (v) => ({ primary: `${fmt(num(v.angle), 0)}° bend`, detail: `${fmt(num(v.flatten), 0)}% flattening`, quality: num(v.flatten) <= 10 ? "Pass" : "Heat a wider zone and bend more slowly" }) }),
      variant({ label: "Draw a jet", principle: "A softened narrow zone is removed from the flame and pulled axially to form a uniform capillary tip.", equation: "Jet taper = parent OD / tip OD", expected: "Straight, even taper with a clean open jet", inputs: [field("parent", "Parent diameter", 4, 12, 0.5, "mm", 8), field("tip", "Jet tip diameter", 0.5, 4, 0.1, "mm", 1.2)], calculate: (v) => ({ primary: `${fmt(num(v.parent) / num(v.tip), 1)}:1 draw ratio`, detail: `Tip ${fmt(num(v.tip), 1)} mm`, quality: num(v.tip) >= 0.8 && num(v.tip) <= 1.5 ? "Pass" : "Adjust pull rate and reheating" }) }),
      variant({ label: "Bore a cork", principle: "The lubricated borer is rotated from both faces so the hole is axial and the cork does not split.", equation: "Borer OD ≈ tubing OD − slight compression allowance", expected: "Axial hole, snug tubing fit and intact cork", inputs: [field("tube", "Tube outside diameter", 4, 12, 0.5, "mm", 8), field("borer", "Borer diameter", 3, 12, 0.5, "mm", 7.5)], calculate: (v) => ({ primary: `${fmt(num(v.tube) - num(v.borer), 1)} mm interference`, detail: "Target clearance: 0–1 mm", quality: num(v.tube) - num(v.borer) >= 0 && num(v.tube) - num(v.borer) <= 1 ? "Pass" : "Choose the next appropriate borer size" }) }),
    ],
  },
  {
    id: "physical-constant-assessment",
    title: "Melting & Boiling Point Determination",
    topic: "Physical Constants",
    icon: Gauge,
    objective:
      "Determine corrected physical constants, recognise purity from range, and diagnose heating-rate and thermometer errors.",
    safety:
      "Use a controlled bath, secure capillaries, keep ignition sources away from volatile liquids, and never heat a sealed system.",
    commonSteps: ["Calibrate or check the thermometer.", "Load the sample correctly without air gaps.", "Heat rapidly at first, then 1–2 °C min⁻¹ near the expected point.", "Record onset and completion/steady boiling, pressure and replicate range."],
    variants: [
      variant({ label: "Melting point", principle: "A pure crystalline solid melts over a narrow range; impurity usually depresses and broadens it.", equation: "Range = T_clear − T_onset", expected: "Sharp, reproducible onset-to-clear range", inputs: [field("onset", "First liquid observed", 40, 250, 0.1, "°C", 113.6), field("clear", "Completely liquid", 40, 255, 0.1, "°C", 114.8), field("correction", "Thermometer correction", -3, 3, 0.1, "°C", 0.4)], calculate: (v) => ({ primary: `${fmt(num(v.onset) + num(v.correction), 1)}–${fmt(num(v.clear) + num(v.correction), 1)} °C`, detail: `Range ${fmt(num(v.clear) - num(v.onset), 1)} °C`, quality: num(v.clear) - num(v.onset) <= 2 ? "Sharp range: purity supported" : "Broad range: review purity, packing and heating rate" }) }),
      variant({ label: "Boiling point", principle: "At boiling, vapour pressure equals external pressure; the observed point must be reported with pressure.", equation: "Approx. correction = 0.00012(760−P)(273+T)", expected: "Steady bubble stream reverses to liquid entry on cooling", inputs: [field("observed", "Observed boiling point", 20, 220, 0.1, "°C", 78.0), field("pressure", "Atmospheric pressure", 650, 780, 1, "mmHg", 742), field("replicate", "Second determination", 20, 220, 0.1, "°C", 78.2)], calculate: (v) => { const mean=(num(v.observed)+num(v.replicate))/2; const corrected=mean+0.00012*(760-num(v.pressure))*(273+mean); return {primary:`${fmt(corrected,1)} °C corrected to 760 mmHg`,detail:`Observed mean ${fmt(mean,1)} °C`,quality:Math.abs(num(v.observed)-num(v.replicate))<=0.5?"Replicates agree":"Repeat: replicate spread exceeds 0.5 °C"}; } }),
    ],
  },
  {
    id: "quantitative-technique-assessment",
    title: "Balance, Weighing & Standard Solutions",
    topic: "Quantitative Technique",
    icon: Gauge,
    objective:
      "Use an analytical balance correctly, obtain mass by difference and prepare a traceable standard solution quantitatively.",
    safety:
      "Never place chemicals directly on the balance pan. Use clean, dry vessels and appropriate PPE for the chosen solute.",
    commonSteps: ["Check level, cleanliness and zero; close balance doors.", "Use a labelled vessel and record every displayed digit.", "Transfer quantitatively and rinse into the receiving flask.", "Dissolve, make to the mark at eye level, mix and label with identity, concentration, date and hazard."],
    variants: [
      variant({ label: "Balance use", principle: "Stable mass requires a level, draft-free balance and room-temperature sample.", equation: "Repeatability = max reading − min reading", expected: "Stable zero and replicate readings within balance tolerance", inputs: [field("r1", "Reading 1", 0, 200, 0.0001, "g", 12.4382), field("r2", "Reading 2", 0, 200, 0.0001, "g", 12.4384), field("r3", "Reading 3", 0, 200, 0.0001, "g", 12.4383)], calculate: (v) => { const a=[num(v.r1),num(v.r2),num(v.r3)]; const spread=Math.max(...a)-Math.min(...a); return {primary:`${fmt(a.reduce((x,y)=>x+y,0)/3,4)} g mean`,detail:`Spread ${fmt(spread*1000,1)} mg`,quality:spread<=0.0003?"Repeatability pass":"Check drafts, temperature and vessel stability"}; } }),
      variant({ label: "Weighing by difference", principle: "Mass delivered equals container-before minus container-after, avoiding loss from direct transfer.", equation: "m_delivered = m_before − m_after", expected: "Positive transferred mass with both container readings recorded", inputs: [field("before", "Bottle before transfer", 0, 200, 0.0001, "g", 48.2637), field("after", "Bottle after transfer", 0, 200, 0.0001, "g", 47.7941)], calculate: (v) => ({primary:`${fmt(num(v.before)-num(v.after),4)} g delivered`,detail:"Use unrounded balance readings",quality:num(v.before)>num(v.after)?"Valid mass difference":"Reading order is invalid"}) }),
      variant({ label: "Standard solution", principle: "A primary standard is pure, stable and weighed accurately; amount concentration follows m/(MV).", equation: "c = m /(Mᵣ × V in L)", expected: "Clear homogeneous solution at the calibration mark", inputs: [field("mass", "Solute mass", 0.05, 10, 0.0001, "g", 1.325), field("molarMass", "Molar mass", 40, 400, 0.01, "g mol⁻¹", 106), field("volume", "Flask volume", 50, 1000, 1, "mL", 250)], calculate: (v) => ({primary:`${fmt(num(v.mass)/(num(v.molarMass)*num(v.volume)/1000),4)} mol L⁻¹`,detail:`${fmt(num(v.mass)/num(v.molarMass)*1000,2)} mmol solute`,quality:"Label concentration, preparation date and standardisation status"}) }),
    ],
  },
  {
    id: "common-ion-assessment",
    title: "Common-Ion Effect Experiments",
    topic: "Ionic Equilibrium",
    icon: Beaker,
    objective:
      "Observe suppression of ionisation or solubility when a solution receives an ion already present in its equilibrium.",
    safety: "Use micro-scale quantities. Avoid inhaling ammonia or hydrogen chloride and collect heavy-metal precipitates separately.",
    commonSteps: ["Prepare matched control and common-ion tubes.", "Add equal indicator or precipitating reagent volumes.", "Change only the common-ion concentration.", "Compare colour, pH or precipitation and write the equilibrium shift."],
    variants: [
      variant({ label: "CH₃COOH + CH₃COONa", principle: "Acetate suppresses weak-acid ionisation and raises pH.", equation: "CH₃COOH ⇌ H⁺ + CH₃COO⁻", expected: "Indicator shows lower [H⁺] after acetate addition", inputs: [field("acid", "Acid concentration", 0.01, 1, 0.01, "M", 0.1), field("salt", "Acetate concentration", 0.01, 1, 0.01, "M", 0.2), field("pKa", "pKₐ", 3, 6, 0.01, "", 4.76)], calculate: (v) => ({primary:`pH ${fmt(num(v.pKa)+Math.log10(num(v.salt)/num(v.acid)),2)}`,detail:"Henderson–Hasselbalch approximation",quality:"Common acetate shifts ionisation to the left"}) }),
      variant({ label: "NH₄OH + NH₄Cl", principle: "Ammonium suppresses weak-base ionisation and lowers [OH⁻].", equation: "NH₃ + H₂O ⇌ NH₄⁺ + OH⁻", expected: "Phenolphthalein colour fades after ammonium chloride addition", inputs: [field("base", "Base concentration", 0.01, 1, 0.01, "M", 0.1), field("salt", "Ammonium concentration", 0.01, 1, 0.01, "M", 0.2), field("pKb", "pKᵦ", 3, 6, 0.01, "", 4.75)], calculate: (v) => { const poh=num(v.pKb)+Math.log10(num(v.salt)/num(v.base)); return {primary:`pH ${fmt(14-poh,2)}`,detail:`pOH ${fmt(poh,2)}`,quality:"Common ammonium shifts base ionisation to the left"}; } }),
      variant({ label: "CaF₂ + NaF", principle: "Added fluoride lowers the molar solubility of CaF₂.", equation: "Ksp = [Ca²⁺][F⁻]²", expected: "Less solid dissolves in fluoride solution than in water", inputs: [field("ksp", "Ksp ×10⁻¹¹", 0.1, 20, 0.1, "", 3.9), field("common", "Added fluoride", 0.001, 0.2, 0.001, "M", 0.05)], calculate: (v) => { const s=num(v.ksp)*1e-11/(num(v.common)**2); return {primary:`${s.toExponential(2)} mol L⁻¹ CaF₂`,detail:"Assumes added [F⁻] dominates 2s",quality:"Solubility is strongly suppressed"}; } }),
    ],
  },
  {
    id: "titration-mastery-assessment",
    title: "Concordant Titration Mastery",
    topic: "Volumetric Analysis",
    icon: FlaskConical,
    objective:
      "Complete prescribed acid–base, redox, iodometric and complexometric titrations; obtain concordant titres and diagnose technique errors.",
    safety:
      "Rinse spills immediately, use a white tile, remove the funnel from a filled burette, and handle permanganate, dichromate and acids with appropriate PPE.",
    commonSteps: ["Condition pipette and burette with the solutions they will contain.", "Remove the burette-tip air bubble and record initial reading at eye level.", "Run one rough titre, then approach the endpoint dropwise in replicate trials.", "Accept concordance only when the prescribed spread is met; calculate from concordant titres."],
    variants: [
      ["HCl vs Na₂CO₃", "Methyl orange endpoint; primary-standard carbonate", "Na₂CO₃ + 2HCl → 2NaCl + CO₂ + H₂O", "Yellow to first permanent orange", 0.5],
      ["NaOH vs oxalic acid", "Phenolphthalein endpoint; diprotic acid stoichiometry", "H₂C₂O₄ + 2NaOH → Na₂C₂O₄ + 2H₂O", "Pink just discharged / faint pink by direction", 0.5],
      ["KMnO₄ vs oxalate/FAS", "Self-indicating permanganate in warm acidic medium", "MnO₄⁻ + 5Fe²⁺ + 8H⁺ → Mn²⁺ + 5Fe³⁺ + 4H₂O", "First permanent pale pink", 5],
      ["K₂Cr₂O₇ vs FAS", "External/internal redox indicator after acidification", "Cr₂O₇²⁻ + 6Fe²⁺ + 14H⁺ → 2Cr³⁺ + 6Fe³⁺ + 7H₂O", "Indicator endpoint without overshoot", 6],
      ["Cu²⁺ iodometry", "Liberated iodine is titrated with thiosulfate; starch near endpoint", "I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻", "Blue starch colour just disappears", 1],
      ["Ca²⁺/Mg²⁺ vs EDTA", "1:1 complexation at controlled pH", "M²⁺ + Y⁴⁻ → MY²⁻", "Wine red to clear blue with EBT", 1],
    ].map(([label, principle, equation, expected, stoichiometricFactor]) => variant({ label, principle, equation, expected, inputs: [field("t1", "Concordant titre 1", 1, 50, 0.05, "mL", 24.6), field("t2", "Concordant titre 2", 1, 50, 0.05, "mL", 24.7), field("t3", "Concordant titre 3", 1, 50, 0.05, "mL", 24.65), field("known", "Standard concentration", 0.01, 0.5, 0.005, "M", 0.1), field("aliquot", "Unknown aliquot", 5, 50, 1, "mL", 25)], calculate: (v) => { const a=[num(v.t1),num(v.t2),num(v.t3)]; const mean=a.reduce((x,y)=>x+y,0)/3; const spread=Math.max(...a)-Math.min(...a); return {primary:`Mean titre ${fmt(mean,2)} mL`,detail:`Stoichiometry-corrected unknown ${fmt(num(v.known)*mean*stoichiometricFactor/num(v.aliquot),4)} M · spread ${fmt(spread,2)} mL`,quality:spread<=0.10?"Concordant: accept all three":"Not concordant: obtain another careful titre"}; }, diagnosis:{prompt:"Every titre is too high but mutually concordant. Which error best explains this?",choices:["A tip air bubble was expelled during titration","The conical flask was rinsed with distilled water","The pipette drained without blowing out"],answer:0,feedback:"An air bubble that fills during the run consumes apparent burette volume without reaching the flask, giving systematically high titres."} }))
  },
  {
    id: "qualitative-ion-case-assessment",
    title: "Complete Cation & Anion Case Analysis",
    topic: "Qualitative Analysis",
    icon: Beaker,
    objective:
      "Work through preliminary evidence, group separation, confirmatory testing, ionic equations and interference checks for every prescribed ion case.",
    safety:
      "Use micro-scale tests in a hood where gases may evolve. Never smell directly; waft only when the procedure permits. Treat lead, nickel, cobalt and chromate waste as hazardous.",
    commonSteps: ["Record preliminary dry and solution observations.", "Test anions on separate fresh portions before adding group reagents.", "Separate cations in the prescribed analytical-group order.", "Confirm on a clean separated fraction and document a balanced ionic equation."],
    variants: ionCases,
  },
  {
    id: "organic-element-detection-assessment",
    title: "Organic Detection of N, S & Halogens",
    topic: "Organic Analysis",
    icon: Beaker,
    objective:
      "Prepare Lassaigne’s extract correctly and complete confirmatory workflows for nitrogen, sulfur and halogens, including interference removal.",
    safety:
      "Sodium fusion is high risk: dry apparatus and sample completely, use a safety screen and forceps, point the tube away, and quench only as instructed by a trained supervisor.",
    commonSteps: ["Dry the fusion tube, sodium and organic sample completely.", "Fuse strongly so covalent elements become water-soluble ionic salts.", "Quench safely, boil with water and filter the Lassaigne extract.", "Use fresh portions for N, S and halogen tests; remove CN⁻/S²⁻ before silver nitrate."],
    variants: [
      ["Nitrogen", "Fusion forms NaCN; Fe²⁺ treatment and oxidation produce Prussian blue", "6CN⁻ + Fe²⁺ → [Fe(CN)₆]⁴⁻", "Prussian-blue colour or precipitate"],
      ["Sulfur", "Fusion forms Na₂S; nitroprusside or lead acetate confirms sulfide", "S²⁻ + Pb²⁺ → PbS(s)", "Violet nitroprusside colour or black PbS"],
      ["Nitrogen + sulfur", "Both may form thiocyanate during fusion", "Fe³⁺ + SCN⁻ ⇌ [FeSCN]²⁺", "Blood-red ferric thiocyanate complex"],
      ["Chlorine", "After boiling with HNO₃, Ag⁺ precipitates chloride", "Ag⁺ + Cl⁻ → AgCl(s)", "White AgCl soluble in dilute NH₃"],
      ["Bromine", "After interference removal, Ag⁺ precipitates bromide", "Ag⁺ + Br⁻ → AgBr(s)", "Cream AgBr partly soluble in concentrated NH₃"],
      ["Iodine", "After interference removal, Ag⁺ precipitates iodide", "Ag⁺ + I⁻ → AgI(s)", "Yellow AgI insoluble in NH₃"],
    ].map(([label, principle, equation, expected]) => variant({ label, principle, equation, expected, inputs:[field("sample","Organic sample",10,100,5,"mg",40),field("sodium","Sodium portion",10,100,5,"mg",30),field("extract","Extract volume",2,20,1,"mL",10)],calculate:(v)=>({primary:`${label} workflow ready`,detail:`Sample:sodium ratio ${fmt(num(v.sample)/num(v.sodium),2)} · ${num(v.extract)} mL extract`,quality:num(v.sodium)>=20?"Fusion charge adequate for simulation":"Increase sodium portion under supervised conditions"}) }))
  },
  {
    id: "colloid-techniques-assessment",
    title: "Sols, Dialysis & Emulsion Stabilisation",
    topic: "Surface Chemistry",
    icon: Beaker,
    objective:
      "Prepare lyophilic and lyophobic sols, purify by dialysis, and compare emulsion stability with and without an emulsifier.",
    safety:
      "Use hot plates rather than open flames where possible. Arsenic sulfide preparation is demonstration-only in a hood with dedicated toxic waste.",
    commonSteps: ["Use clean glassware and deionised water.", "Control addition rate, temperature and stirring.", "Retain a control and record Tyndall effect or settling.", "Test purification/stability at fixed time intervals."],
    variants: [
      variant({label:"Ferric hydroxide sol",principle:"Hydrolysis of FeCl₃ in boiling water forms a positively charged lyophobic sol.",equation:"FeCl₃ + 3H₂O → Fe(OH)₃(sol) + 3HCl",expected:"Deep reddish-brown sol showing the Tyndall effect",inputs:[field("fecl3","FeCl₃ added",0.2,5,0.1,"mL",1),field("water","Boiling water",20,200,5,"mL",100),field("time","Heating time",1,20,1,"min",5)],calculate:(v)=>({primary:`${fmt(num(v.fecl3)/num(v.water)*100,2)}% v/v precursor`,detail:`Heated ${num(v.time)} min`,quality:num(v.fecl3)/num(v.water)<=0.02?"Controlled hydrolysis":"Excess electrolyte may coagulate the sol"})}),
      variant({label:"Arsenious sulfide sol",principle:"Controlled double decomposition produces a negatively charged As₂S₃ lyophobic sol.",equation:"As₂O₃ + 3H₂S → As₂S₃(sol) + 3H₂O",expected:"Yellow arsenious sulfide sol showing the Tyndall effect",inputs:[field("arsenite","Arsenite solution",0.2,5,0.1,"mL",1),field("water","Water",20,200,5,"mL",100),field("time","Gas/contact time",1,20,1,"min",4)],calculate:(v)=>({primary:`${fmt(num(v.arsenite)/num(v.water)*100,2)}% v/v precursor`,detail:`${num(v.time)} min controlled contact`,quality:"Demonstration-only toxic preparation; preserve a blank"})}),
      variant({label:"Starch sol",principle:"Hydrated macromolecules form a stable lyophilic sol on heating.",equation:"Starch + hot water → hydrated colloidal dispersion",expected:"Translucent stable sol without lumps",inputs:[field("mass","Starch",0.1,5,0.1,"g",1),field("water","Water",20,250,5,"mL",100),field("time","Boil",1,15,1,"min",4)],calculate:(v)=>({primary:`${fmt(num(v.mass)/num(v.water)*100,2)}% w/v starch sol`,detail:`${num(v.time)} min heating`,quality:"Prepare a cold paste before adding to boiling water"})}),
      variant({label:"Dialysis",principle:"Small ions diffuse through a semipermeable membrane while colloidal particles are retained.",equation:"Flux ∝ concentration gradient / membrane thickness",expected:"Outside water tests positive for ions initially, then weakens after water changes",inputs:[field("initial","Initial outside conductivity",0,5000,10,"µS cm⁻¹",820),field("final","Final conductivity",0,5000,10,"µS cm⁻¹",95),field("changes","Water changes",0,8,1,"",3)],calculate:(v)=>({primary:`${fmt((1-num(v.final)/num(v.initial))*100,1)}% ion removal`,detail:`${num(v.changes)} water changes`,quality:num(v.final)/num(v.initial)<=0.2?"Dialysis endpoint supported":"Continue dialysis with fresh water"})}),
      variant({label:"Oil–water emulsion",principle:"An emulsifier lowers interfacial tension and creates a protective film around droplets.",equation:"Stability index = 100 × dispersed height / total height",expected:"Emulsifier-treated tube separates more slowly than the control",inputs:[field("dispersed","Emulsion layer",0,10,0.1,"cm",7.8),field("total","Total column",1,10,0.1,"cm",8),field("time","Standing time",1,60,1,"min",20)],calculate:(v)=>({primary:`${fmt(num(v.dispersed)/num(v.total)*100,1)}% stability index`,detail:`After ${num(v.time)} min`,quality:num(v.dispersed)/num(v.total)>=0.9?"Well stabilised":"Compare emulsifier type and concentration"})}),
    ],
  },
  {
    id: "kinetics-clock-assessment",
    title: "Kinetics & Clock-Reaction Practicals",
    topic: "Chemical Kinetics",
    icon: Gauge,
    objective:
      "Determine relative rate, reaction order or activation behaviour from prescribed timing experiments with controlled variables.",
    safety:
      "Use small quantities, eye protection and ventilation. Acidified oxidants and iodine solutions require compatible waste handling.",
    commonSteps: ["Prepare labelled solutions and equilibrate them to the target temperature.", "Mix rapidly and start timing at the same event.", "Use one defined visual endpoint and keep total volume constant.", "Repeat timings and compare 1/t or derive order from concentration ratios."],
    variants: [
      ["Na₂S₂O₃ + HCl disappearing cross", "Sulfur formation obscures a marked cross; 1/t is proportional to initial rate.", "S₂O₃²⁻ + 2H⁺ → SO₂ + S + H₂O", "Cross disappears as sulfur turbidity develops"],
      ["I⁻ + S₂O₈²⁻", "Iodine formation is followed by timed thiosulfate consumption or colour.", "S₂O₈²⁻ + 2I⁻ → I₂ + 2SO₄²⁻", "Blue starch–iodine colour appears at the clock endpoint"],
      ["Iodine clock", "A fixed scavenger amount delays the sudden appearance of starch–iodine colour.", "I₂ + 2S₂O₃²⁻ → 2I⁻ + S₄O₆²⁻", "Sudden permanent blue-black colour"],
      ["Temperature effect", "Rate rises with temperature according to Arrhenius behaviour.", "ln(k₂/k₁) = −Eₐ/R(1/T₂−1/T₁)", "Warm mixture reaches the same endpoint sooner"],
    ].map(([label,principle,equation,expected])=>variant({label,principle,equation,expected,inputs:[field("c1","Run 1 concentration",0.01,1,0.01,"M",0.1),field("t1","Run 1 time",1,300,1,"s",72),field("c2","Run 2 concentration",0.01,1,0.01,"M",0.2),field("t2","Run 2 time",1,300,1,"s",38)],calculate:(v)=>{const order=Math.log(num(v.t1)/num(v.t2))/Math.log(num(v.c2)/num(v.c1));return{primary:`Apparent order ${fmt(order,2)}`,detail:`Relative rates ${fmt(1/num(v.t1),4)} and ${fmt(1/num(v.t2),4)} s⁻¹`,quality:Math.abs(num(v.c2)-num(v.c1))>0.001?"Concentration contrast adequate":"Use different concentrations"};}}))
  },
  {
    id: "enthalpy-practicals-assessment",
    title: "Enthalpy Practical Workflows",
    topic: "Thermochemistry",
    icon: Gauge,
    objective:
      "Measure enthalpy of dissolution, neutralisation and acetone–chloroform interaction with calorimeter and heat-capacity corrections.",
    safety:
      "Acetone and chloroform are volatile; use sealed small-scale apparatus in a hood and avoid flames. Acids and bases are corrosive.",
    commonSteps:["Measure reagent masses/volumes and initial temperatures.","Combine rapidly in an insulated calorimeter and stir reproducibly.","Extrapolate or record the maximum temperature change.","Apply solution plus calorimeter heat capacity and state sign convention."],
    variants:[
      variant({label:"Enthalpy of dissolution",principle:"Heat exchanged by solution and calorimeter is opposite to heat of dissolution.",equation:"ΔH_sol = −(m c + C_cal)ΔT / n",expected:"Temperature rises for exothermic or falls for endothermic dissolution",inputs:[field("mass","Solution mass",20,250,1,"g",100),field("deltaT","Temperature change",-15,15,0.1,"°C",-3.4),field("moles","Solute amount",0.01,0.5,0.01,"mol",0.1),field("cal","Calorimeter constant",0,200,1,"J K⁻¹",45)],calculate:(v)=>{const dh=-(num(v.mass)*4.18+num(v.cal))*num(v.deltaT)/num(v.moles)/1000;return{primary:`ΔH = ${fmt(dh,2)} kJ mol⁻¹`,detail:dh>0?"Endothermic":"Exothermic",quality:"Include calorimeter constant and signed ΔT"};}}),
      variant({label:"Enthalpy of neutralisation",principle:"Strong acid–base neutralisation measures heat for H⁺ + OH⁻ → H₂O.",equation:"ΔH_neut = −(m c + C_cal)ΔT / n(H₂O)",expected:"Temperature rises after acid and base are mixed",inputs:[field("mass","Mixed solution mass",20,250,1,"g",100),field("deltaT","Temperature rise",0.1,20,0.1,"°C",6.2),field("moles","Water formed",0.01,0.5,0.01,"mol",0.05),field("cal","Calorimeter constant",0,200,1,"J K⁻¹",45)],calculate:(v)=>{const dh=-(num(v.mass)*4.18+num(v.cal))*num(v.deltaT)/num(v.moles)/1000;return{primary:`ΔH = ${fmt(dh,2)} kJ mol⁻¹`,detail:"Per mole of water formed",quality:dh<0?"Exothermic sign correct":"Review ΔT sign"};}}),
      variant({label:"Acetone–chloroform interaction",principle:"Specific hydrogen-bonded association makes mixing non-ideal and produces an enthalpy change.",equation:"q_mix = (m c + C_cal)ΔT; ΔH_mix = −q_mix/n_total",expected:"A measurable temperature rise supports exothermic association",inputs:[field("mass","Mixture mass",10,100,1,"g",40),field("deltaT","Temperature rise",0,10,0.1,"°C",2.6),field("moles","Total amount",0.05,2,0.01,"mol",0.55),field("cal","Calorimeter constant",0,150,1,"J K⁻¹",30)],calculate:(v)=>{const dh=-(num(v.mass)*2.5+num(v.cal))*num(v.deltaT)/num(v.moles)/1000;return{primary:`ΔH_mix ≈ ${fmt(dh,3)} kJ mol⁻¹`,detail:"Teaching estimate using effective mixture heat capacity",quality:num(v.deltaT)>0?"Exothermic interaction observed":"No exothermic signal; check insulation and mixing"};}}),
    ],
  },
  {
    id:"paper-chromatography-assessment",title:"Paper Chromatography with Rf",topic:"Separation Science",icon:BookOpenCheck,objective:"Develop a paper chromatogram, document solvent-front and spot distances, calculate Rf values, and judge separation quality.",safety:"Use a covered chamber in ventilation appropriate to the solvent. Keep flammable mobile phases away from ignition sources and mark spots with pencil only.",commonSteps:["Draw a pencil baseline and apply small concentrated spots.","Equilibrate the covered chamber with the mobile phase.","Develop without submerging the origin; remove before the front reaches the edge.","Mark the solvent front immediately, visualise spots, measure from origin and calculate Rf."],variants:[
      ["Ink dyes","Dyes partition differently between water bound to cellulose and the mobile phase.","Separated coloured spots at distinct heights"],
      ["Leaf pigments","Pigment polarity controls migration in an organic mobile phase.","Carotene travels farther than more polar chlorophyll pigments"],
      ["Amino acids","Ninhydrin reveals separated amino-acid spots after development.","Purple/violet spots after ninhydrin visualisation"],
    ].map(([label,principle,expected])=>variant({label,principle,equation:"Rf = distance travelled by solute / distance travelled by solvent front",expected,inputs:[field("spot1","Spot 1 distance",0.1,15,0.1,"cm",4.2),field("spot2","Spot 2 distance",0.1,15,0.1,"cm",6.8),field("front","Solvent-front distance",1,20,0.1,"cm",9.5)],calculate:(v)=>({primary:`Rf₁ ${fmt(num(v.spot1)/num(v.front),2)} · Rf₂ ${fmt(num(v.spot2)/num(v.front),2)}`,detail:`ΔRf ${fmt(Math.abs(num(v.spot2)-num(v.spot1))/num(v.front),2)}`,quality:num(v.spot1)<num(v.front)&&num(v.spot2)<num(v.front)?"Valid distances from common origin":"Spot distance cannot exceed solvent front"})}))},
  {
    id:"inorganic-preparation-assessment",title:"Inorganic Salt Preparations",topic:"Preparative Chemistry",icon:FlaskConical,objective:"Prepare, crystallise, isolate and assess yield for ferrous ammonium sulfate, potash alum and potassium ferric oxalate.",safety:"Wear eye protection and gloves. Potassium ferric oxalate is light sensitive; oxalate is harmful. Acids and hot solutions require careful handling.",commonSteps:["Calculate the limiting reagent and theoretical yield.","Dissolve/react under the specified acidity and temperature.","Concentrate without evaporating to dryness, then cool for crystallisation.","Filter, wash appropriately, dry, weigh and record appearance and yield."],variants:[
      ["Ferrous ammonium sulfate (Mohr’s salt)","FeSO₄ and (NH₄)₂SO₄ crystallise as a stable double salt in acid solution.","FeSO₄ + (NH₄)₂SO₄ + 6H₂O → (NH₄)₂Fe(SO₄)₂·6H₂O","Pale-green crystals protected from oxidation",392.14],
      ["Potash alum","K₂SO₄ and Al₂(SO₄)₃ form hydrated double-salt crystals.","K₂SO₄ + Al₂(SO₄)₃ + 24H₂O → 2KAl(SO₄)₂·12H₂O","Colourless octahedral crystals",474.39],
      ["Potassium ferric oxalate","Ferric oxalate complexes with potassium oxalate and crystallises as a photosensitive salt.","Fe³⁺ + 3C₂O₄²⁻ → [Fe(C₂O₄)₃]³⁻","Emerald-green crystals stored away from light",491.24],
    ].map(([label,principle,equation,expected,molarMass])=>variant({label,principle,equation,expected,inputs:[field("limiting","Limiting reagent",0.001,0.1,0.001,"mol",0.02),field("product","Dry product mass",0.1,30,0.01,"g",6.8),field("purity","Reagent purity",80,100,0.1,"%",98)],calculate:(v)=>{const theoretical=num(v.limiting)*molarMass*num(v.purity)/100;return{primary:`${fmt(num(v.product)/theoretical*100,1)}% yield`,detail:`Corrected theoretical mass ${fmt(theoretical,2)} g`,quality:num(v.product)<=theoretical*1.03?"Plausible dry yield":"Yield above theory: product may be wet or contaminated"};}}))},
  {
    id:"organic-preparation-assessment",title:"Prescribed Organic Preparations",topic:"Organic Preparative Chemistry",icon:FlaskConical,objective:"Complete reaction setup, isolation, purification, melting-point check and yield assessment for prescribed preparations.",safety:"Use a fume hood for volatile, corrosive or nitrating reagents. Control exotherms, never stopper a gas-evolving system, and segregate organic waste.",commonSteps:["Identify limiting reagent and assemble the correct reaction setup.","Control addition, temperature and reaction time.","Quench/isolate only after the specified endpoint or completion check.","Purify, dry, weigh, check appearance/physical constant and calculate yield."],variants:[
      ["Acetanilide","Acylation of aniline followed by crystallisation.","C₆H₅NH₂ + (CH₃CO)₂O → C₆H₅NHCOCH₃ + CH₃COOH","Colourless crystals; melting point near 114 °C",135.16],
      ["2,4,6-Tribromophenol","Aqueous bromination of phenol is immediate at the three activated ortho/para sites.","C₆H₅OH + 3 Br₂ → C₆H₂Br₃OH + 3 HBr","White precipitate; melting point near 94–96 °C",330.8],
      ["2,4,6-Tribromoaniline","Unprotected aniline is highly activated and gives the tribromo product.","C₆H₅NH₂ + 3 Br₂ → C₆H₂Br₃NH₂ + 3 HBr","White to pale-brown solid; melting point near 118–122 °C",329.83],
      ["Benzanilide","Schotten–Baumann N-benzoylation of aniline with benzoyl chloride.","C₆H₅NH₂ + C₆H₅COCl → C₆H₅NHCOC₆H₅ + HCl","Colourless crystals; melting point near 161–163 °C",197.23],
      ["Phenyl benzoate","Schotten–Baumann O-benzoylation of phenol in aqueous alkali.","C₆H₅OH + C₆H₅COCl → C₆H₅OCOC₆H₅ + HCl","Colourless crystals; melting point near 68–71 °C",198.22],
      ["Dibenzalacetone","Base-catalysed double aldol condensation of benzaldehyde with acetone.","2C₆H₅CHO + CH₃COCH₃ → C₁₇H₁₄O + 2H₂O","Yellow crystals; melting point near 110–112 °C",234.29],
      ["p-Nitroacetanilide","Controlled electrophilic nitration of acetanilide favours para substitution.","Acetanilide + HNO₃ → p-nitroacetanilide + H₂O","Pale-yellow crystals; melting point near 210–214 °C",180.16],
      ["Azo dye","Diazotisation at 0–5 °C followed by coupling with an activated aromatic compound.","ArNH₂ → ArN₂⁺; ArN₂⁺ + activated Ar′ → Ar–N=N–Ar′","Intensely coloured azo-dye precipitate",197.24],
    ].map(([label,principle,equation,expected,molarMass])=>variant({label,principle,equation,expected,inputs:[field("moles","Limiting reagent",0.001,0.1,0.001,"mol",0.02),field("mass","Dry product",0.05,20,0.01,"g",2.25),field("mp","Observed melting point",20,250,0.5,"°C",114)],calculate:(v)=>{const theory=num(v.moles)*molarMass;return{primary:`${fmt(num(v.mass)/theory*100,1)}% yield`,detail:`Theoretical mass ${fmt(theory,2)} g · observed ${num(v.mp)} °C`,quality:num(v.mass)<=theory*1.03?"Yield is physically plausible":"Dry/purify again before accepting mass"};}}))},
  {
    id:"food-biochemical-tests-assessment",title:"Carbohydrate, Fat & Protein Tests",topic:"Biochemical Analysis",icon:Beaker,objective:"Perform the complete prescribed food-test panel with positive/negative controls, observations and inference rules.",safety:"Do not taste laboratory samples. Heat using a water bath, point tubes away, and handle concentrated acids and organic solvents in a hood.",commonSteps:["Prepare sample extract plus known positive and negative controls.","Add reagents in the stated order and equal quantities.","Apply the specified heating or layering step.","Record colour/interface/precipitate before inferring the biomolecule class."],variants:[
      ["Molisch — carbohydrate","α-Naphthol plus concentrated acid forms a violet condensation product.","Violet ring at the liquid interface"],
      ["Benedict — reducing sugar","Cu²⁺ is reduced to Cu₂O on heating.","Green/yellow/orange to brick-red precipitate"],
      ["Fehling — reducing sugar","Alkaline Cu²⁺ complex is reduced by an aldose.","Brick-red Cu₂O precipitate"],
      ["Iodine — starch","Iodine forms a coloured inclusion complex with amylose helices.","Blue-black colour that fades on heating"],
      ["Seliwanoff — ketose","Ketoses dehydrate rapidly and condense with resorcinol.","Rapid cherry-red colour"],
      ["Biuret — protein","Peptide bonds complex Cu²⁺ in alkaline solution.","Violet colour"],
      ["Ninhydrin — amino acids","Oxidative deamination yields Ruhemann’s purple for most α-amino acids.","Purple/blue colour on heating"],
      ["Xanthoproteic — aromatic amino acids","Nitration of aromatic residues gives yellow/orange products.","Yellow, becoming orange with alkali"],
      ["Sudan III/IV — fat","Non-polar dye partitions into the lipid phase.","Red-stained oil layer or droplets"],
      ["Ethanol emulsion — fat","Diluted ethanolic lipid forms light-scattering droplets.","Persistent milky-white emulsion"],
    ].map(([label,principle,expected])=>variant({label,principle,equation:"Observation + control agreement → supported biochemical inference",expected,inputs:[field("sample","Sample extract",0.5,5,0.5,"mL",2),field("reagent","Test reagent",0.5,5,0.5,"mL",2),field("heat","Heating time",0,10,0.5,"min",2)],calculate:(v)=>({primary:`${label} evidence set`,detail:`${num(v.sample)} mL sample · ${num(v.reagent)} mL reagent`,quality:"Accept only when positive and negative controls behave correctly"})}))},
  {
    id:"project-record-viva-assessment",title:"Project, Lab Record & Viva Assessment",topic:"Practical Assessment",icon:Award,objective:"Score investigation design, execution, data quality, analysis, laboratory record, safety and oral understanding with transparent evidence.",safety:"Projects require a documented risk assessment, supervision level, waste route and ethical/data-integrity check before work begins.",commonSteps:["Define a testable question, variables, controls and risk assessment.","Collect sufficient raw data with units, uncertainty and contemporaneous notes.","Process data transparently with sample calculation, graph/table and error analysis.","Conclude within evidence limits, evaluate improvements, complete record and answer viva questions."],variants:[
      variant({label:"Experimental investigation",principle:"A valid project links a controlled method to reproducible evidence and a limited conclusion.",equation:"Project score = planning + execution + data + analysis + evaluation",expected:"Traceable raw data, justified method, uncertainty and evidence-based conclusion",inputs:[field("planning","Planning",0,20,1,"marks",16),field("execution","Execution & safety",0,20,1,"marks",17),field("data","Data quality",0,20,1,"marks",15),field("analysis","Analysis",0,20,1,"marks",16),field("evaluation","Evaluation",0,20,1,"marks",14)],calculate:(v)=>{const s=num(v.planning)+num(v.execution)+num(v.data)+num(v.analysis)+num(v.evaluation);return{primary:`${s}/100 project score`,detail:s>=75?"Distinction evidence":"Development priorities shown in rubric",quality:"Retain assessor comments against each criterion"};}}),
      variant({label:"Laboratory record",principle:"A defensible record is contemporaneous, complete, traceable and includes raw observations—not only polished results.",equation:"Record score = completeness + observations + calculations + discussion",expected:"Dated index, aim, method, raw data, calculations, result, precautions and signature",inputs:[field("completeness","Completeness",0,25,1,"marks",21),field("observations","Observations",0,25,1,"marks",20),field("calculations","Calculations",0,25,1,"marks",19),field("discussion","Result & precautions",0,25,1,"marks",20)],calculate:(v)=>{const s=num(v.completeness)+num(v.observations)+num(v.calculations)+num(v.discussion);return{primary:`${s}/100 record score`,detail:"Criterion-referenced laboratory evidence",quality:s>=70?"Record standard met":"Complete missing raw evidence before submission"};}}),
      variant({label:"Viva voce",principle:"Oral assessment tests understanding of purpose, chemistry, technique, safety, errors and interpretation.",equation:"Viva score = concept + method + observation + safety + error reasoning",expected:"Concise answers that connect observation to chemical principle",inputs:[field("concept","Concept",0,20,1,"marks",16),field("method","Method",0,20,1,"marks",17),field("observation","Observation inference",0,20,1,"marks",15),field("safety","Safety",0,20,1,"marks",18),field("error","Error reasoning",0,20,1,"marks",14)],calculate:(v)=>{const s=num(v.concept)+num(v.method)+num(v.observation)+num(v.safety)+num(v.error);return{primary:`${s}/100 viva score`,detail:"Five-domain oral assessment",quality:s>=70?"Viva standard met":"Review weak domains and reassess"};}}),
    ],
  },
];

export const ASSESSED_PRACTICAL_EXPERIMENTS = practicalConfigs.map((config) => ({
  id: config.id,
  title: config.title,
  tab: "Advanced",
  type: "Practice",
  difficulty: config.id === "glass-working-assessment" ? "Intermediate" : "Advanced",
  icon: config.icon,
  topic: config.topic,
  teaches: `${config.objective} Cases: ${config.variants.map((item) => item.label).join(", ")}.`,
  steps: config.commonSteps,
  tryThis: "Complete the procedure, select the correct observation, diagnose the technique error and answer the viva.",
  result: "A scored practical record with method, measurement, observation, diagnosis and viva evidence.",
  safety: config.safety,
  realWorld: "Supports prescribed school practicals, college laboratory technique and competency-based assessment.",
}));

const valuesFor = (activeVariant) =>
  Object.fromEntries(activeVariant.inputs.map((item) => [item.key, item.value]));

export default function AssessedPracticalLab({ experimentId }) {
  const config =
    practicalConfigs.find((item) => item.id === experimentId) ||
    practicalConfigs[0];
  const [variantIndex, setVariantIndex] = useState(0);
  const activeVariant = config.variants[variantIndex];
  const [values, setValues] = useState(() => valuesFor(activeVariant));
  const [completedSteps, setCompletedSteps] = useState([]);
  const [observation, setObservation] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [vivaAnswers, setVivaAnswers] = useState({});
  const [recordNote, setRecordNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const steps = [...config.commonSteps, ...activeVariant.steps];
  const result = useMemo(
    () => activeVariant.calculate(values),
    [activeVariant, values],
  );
  const observationCorrect = observation === activeVariant.expected;
  const diagnosisCorrect =
    diagnosis !== "" && Number(diagnosis) === activeVariant.diagnosis.answer;
  const vivaCorrect = standardViva.filter(
    (item, index) => Number(vivaAnswers[index]) === item.answer,
  ).length;
  const score = Math.round(
    (completedSteps.length / steps.length) * 35 +
      15 +
      (observationCorrect ? 15 : 0) +
      (diagnosisCorrect ? 15 : 0) +
      vivaCorrect * 10,
  );

  const resetAssessment = (nextIndex = variantIndex) => {
    const nextVariant = config.variants[nextIndex];
    setValues(valuesFor(nextVariant));
    setCompletedSteps([]);
    setObservation("");
    setDiagnosis("");
    setVivaAnswers({});
    setRecordNote("");
    setSubmitted(false);
  };

  const changeVariant = (event) => {
    const next = Number(event.target.value);
    setVariantIndex(next);
    resetAssessment(next);
  };

  const downloadRecord = () => {
    const lines = [
      config.title,
      activeVariant.label,
      "=".repeat(activeVariant.label.length),
      `Objective: ${config.objective}`,
      `Principle: ${activeVariant.principle}`,
      `Equation: ${activeVariant.equation}`,
      "",
      "Measurements:",
      ...activeVariant.inputs.map(
        (item) => `- ${item.label}: ${values[item.key]} ${item.unit}`,
      ),
      `Result: ${result.primary}`,
      `Quality decision: ${result.quality}`,
      `Expected observation: ${activeVariant.expected}`,
      `Record note: ${recordNote || "Not entered"}`,
      `Assessment score: ${score}/100`,
      `Safety: ${config.safety}`,
    ];
    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${config.id}-${variantIndex + 1}-record.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const Icon = config.icon;
  return (
    <div data-assessed-practical={config.id} className="space-y-4">
      <section className="rounded-2xl border border-fuchsia-400/20 bg-gradient-to-br from-fuchsia-500/15 via-slate-950/30 to-cyan-500/10 p-4">
        <div className="flex flex-wrap items-start gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl border border-fuchsia-300/20 bg-black/20 text-fuchsia-200">
            <Icon size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fuchsia-200/75">
              Assessed practical workflow
            </p>
            <h4 className="mt-1 text-xl font-black text-white">
              {config.title}
            </h4>
            <p className="mt-1 max-w-4xl text-sm leading-6 text-gray-300">
              {config.objective}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => resetAssessment()}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-gray-200 hover:bg-white/10"
            >
              <RotateCcw size={14} /> Reset
            </button>
            <button
              type="button"
              onClick={downloadRecord}
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs text-white hover:bg-white/15"
            >
              <Download size={14} /> Record
            </button>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-[280px_1fr]">
          <label>
            <span className="mb-1 block text-xs font-semibold text-gray-400">
              Prescribed case
            </span>
            <select
              value={variantIndex}
              onChange={changeVariant}
              className="input text-sm"
            >
              {config.variants.map((item, index) => (
                <option key={item.label} value={index}>
                  {index + 1}. {item.label}
                </option>
              ))}
            </select>
          </label>
          <div className="rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-sm leading-6 text-gray-300">
              {activeVariant.principle}
            </p>
            <p className="mt-2 font-mono text-xs text-cyan-100">
              {activeVariant.equation}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <ClipboardCheck size={16} className="text-emerald-300" />
            <h5 className="text-base font-bold text-white">Procedure evidence</h5>
            <span className="ml-auto text-xs text-gray-400">
              {completedSteps.length}/{steps.length}
            </span>
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => {
              const done = completedSteps.includes(index);
              return (
                <button
                  type="button"
                  key={`${activeVariant.label}-${step}`}
                  onClick={() =>
                    setCompletedSteps((current) =>
                      done
                        ? current.filter((item) => item !== index)
                        : [...current, index],
                    )
                  }
                  className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-sm leading-5 ${
                    done
                      ? "border-emerald-400/25 bg-emerald-500/10 text-emerald-100"
                      : "border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.06]"
                  }`}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current/30 text-xs">
                    {done ? "✓" : index + 1}
                  </span>
                  <span>{step}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Gauge size={16} className="text-cyan-300" />
            <h5 className="text-base font-bold text-white">Measurements</h5>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {activeVariant.inputs.map((item) => (
              <label
                key={`${activeVariant.label}-${item.key}`}
                className="rounded-xl border border-white/10 bg-white/[0.035] p-3"
              >
                <span className="text-xs font-semibold text-gray-300">
                  {item.label}
                </span>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={item.min}
                    max={item.max}
                    step={item.step}
                    value={values[item.key]}
                    onChange={(event) =>
                      setValues((current) => ({
                        ...current,
                        [item.key]: Number(event.target.value),
                      }))
                    }
                    className="input min-w-0 flex-1 text-sm"
                  />
                  <span className="text-xs text-gray-400">{item.unit}</span>
                </div>
              </label>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/[0.08] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Calculated result
            </p>
            <p className="mt-2 text-xl font-black text-white">{result.primary}</p>
            <p className="mt-1 text-sm text-gray-300">{result.detail}</p>
            <p className="mt-3 rounded-lg bg-black/20 p-2 text-sm text-cyan-100">
              {result.quality}
            </p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h5 className="flex items-center gap-2 text-base font-bold text-white">
            <CheckCircle2 size={16} className="text-emerald-300" /> Observation & inference
          </h5>
          <div className="mt-3 space-y-2">
            {activeVariant.observationChoices.map((choice) => (
              <label key={choice} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300">
                <input type="radio" name={`${config.id}-observation`} checked={observation === choice} onChange={() => setObservation(choice)} className="mt-1 accent-emerald-400" />
                <span>{choice}</span>
              </label>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-semibold text-gray-400">Contemporaneous record note</span>
            <textarea value={recordNote} onChange={(event) => setRecordNote(event.target.value)} rows={3} placeholder="Record colour, endpoint, time, replicate spread, anomaly and corrective action…" className="input mt-1 resize-y text-sm" />
          </label>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <h5 className="flex items-center gap-2 text-base font-bold text-white">
            <ShieldAlert size={16} className="text-amber-300" /> Technique-error diagnosis
          </h5>
          <p className="mt-3 text-sm leading-6 text-gray-300">{activeVariant.diagnosis.prompt}</p>
          <div className="mt-3 space-y-2">
            {activeVariant.diagnosis.choices.map((choice, index) => (
              <label key={choice} className="flex cursor-pointer gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-300">
                <input type="radio" name={`${config.id}-diagnosis`} checked={Number(diagnosis) === index} onChange={() => setDiagnosis(String(index))} className="mt-1 accent-amber-400" />
                <span>{choice}</span>
              </label>
            ))}
          </div>
          {submitted && <p className={`mt-3 rounded-xl border p-3 text-sm ${diagnosisCorrect ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-100" : "border-amber-400/20 bg-amber-500/10 text-amber-100"}`}>{activeVariant.diagnosis.feedback}</p>}
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <h5 className="flex items-center gap-2 text-base font-bold text-white"><GraduationCap size={17} className="text-violet-300" /> Viva voce</h5>
        <div className="mt-3 grid gap-3 lg:grid-cols-2">
          {standardViva.map((item, qIndex) => (
            <div key={item.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm font-semibold text-white">{qIndex + 1}. {item.q}</p>
              <div className="mt-2 space-y-1">
                {item.choices.map((choice, answerIndex) => (
                  <label key={choice} className="flex cursor-pointer gap-2 py-1 text-sm text-gray-300"><input type="radio" name={`${config.id}-viva-${qIndex}`} checked={Number(vivaAnswers[qIndex]) === answerIndex} onChange={() => setVivaAnswers((current) => ({ ...current, [qIndex]: String(answerIndex) }))} className="mt-1 accent-violet-400" /><span>{choice}</span></label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/[0.07] p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Award size={22} className="text-fuchsia-200" />
          <div className="flex-1"><h5 className="text-base font-bold text-white">Practical assessment</h5><p className="text-xs text-gray-400">Procedure 35 · measurement 15 · observation 15 · diagnosis 15 · viva 20</p></div>
          <button type="button" onClick={() => setSubmitted(true)} className="rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-bold text-white hover:bg-fuchsia-400">Submit assessment</button>
        </div>
        {submitted && <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr]"><div className="grid place-items-center rounded-xl border border-fuchsia-300/20 bg-black/20 p-4"><span className="text-3xl font-black text-fuchsia-200">{score}</span><span className="text-xs text-gray-400">out of 100</span></div><div className="rounded-xl border border-white/10 bg-black/15 p-4 text-sm leading-6 text-gray-300"><p className="font-bold text-white">{score >= 80 ? "Mastery demonstrated" : score >= 60 ? "Competent with corrections" : "Further evidence required"}</p><p className="mt-1">Complete every procedure checkpoint, select the evidence-based observation, diagnose the technique error and answer both viva questions. Download the record after corrections.</p></div></div>}
        <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.07] p-3 text-sm leading-6 text-amber-50/80"><strong className="text-amber-200">Safety:</strong> {config.safety}</div>
      </section>
    </div>
  );
}
