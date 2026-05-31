export const learningContent = {
  safety: [
    'Use dilute acids and bases only in school-level simulations.',
    'Wear eye protection when acids, bases, heating, or gas tests are involved.',
    'Never smell gases directly; use wafting only when instructed by a teacher.',
    'Do not taste any chemical, including household substances in the lab.',
  ],
  builderTips: [
    'Start with apparatus, add chemicals, then connect action and observation blocks.',
    'Use measurement blocks to make the experiment scientific.',
    'Add safety notes before running a teacher demo.',
  ],
  assessmentLanguage: [
    'Identifies correct apparatus and chemicals.',
    'Sequences steps safely.',
    'Predicts observations and explains them using school-level concepts.',
    'Writes word or symbolic equations where appropriate.',
  ],
};

export const reactionLearningContent = {
  neutralization: {
    why: [
      'An acid releases hydrogen ions in water.',
      'A base releases hydroxide ions in water.',
      'Hydrogen ions and hydroxide ions join to form water.',
      'The remaining ions stay in solution as a salt.',
      'The temperature may rise a little because neutralization releases heat.',
    ],
    particles: ['H+ from acid', 'OH- from base', 'H2O forms', 'salt ions remain'],
    commonMistakes: ['Adding indicator after the endpoint', 'Adding acid too quickly', 'Assuming every colourless solution is neutral', 'Forgetting that salt and water are both products'],
    student: 'Acid particles and base particles cancel each other by forming water, so the solution moves toward neutral.',
    teacher: 'Frame this as H+ plus OH- giving H2O, with spectator ions forming the salt. Emphasize endpoint versus complete neutralization.',
  },
  'chloride-test': {
    why: ['Silver ions meet chloride ions in solution.', 'Silver chloride is insoluble in water.', 'Tiny solid particles appear as a white precipitate.'],
    particles: ['Ag+ ion', 'Cl- ion', 'AgCl solid'],
    commonMistakes: ['Confusing chloride test with sulphate test', 'Not using clean test tubes', 'Calling any white solid silver chloride without the correct reagent'],
    student: 'The white solid forms because silver chloride cannot stay dissolved in water.',
    teacher: 'Use this to introduce precipitation and selective ion tests at Grade 10 level.',
  },
  'sulphate-test': {
    why: ['Barium ions combine with sulphate ions.', 'Barium sulphate is insoluble.', 'A white precipitate appears.'],
    particles: ['Ba2+ ion', 'SO4 2- ion', 'BaSO4 solid'],
    commonMistakes: ['Using silver nitrate instead of barium chloride', 'Forgetting the white precipitate is barium sulphate', 'Skipping safety supervision'],
    student: 'The white solid forms because barium sulphate does not dissolve well.',
    teacher: 'Keep this as a controlled qualitative test and avoid overextending into solubility-product mathematics.',
  },
  'acid-carbonate': {
    why: ['Acid reacts with carbonate.', 'Carbon dioxide gas is released.', 'The gas can be tested with limewater.', 'Limewater turns milky when carbon dioxide is present.'],
    particles: ['acid particles', 'carbonate particles', 'CO2 bubbles', 'limewater milky solid'],
    commonMistakes: ['Not testing the gas', 'Calling the gas hydrogen', 'Forgetting water is also formed', 'Using limewater before generating carbon dioxide'],
    student: 'Fizzing happens because carbon dioxide gas is made during the reaction.',
    teacher: 'Connect effervescence to CO2 production and then to the confirmatory limewater test.',
  },
  'acid-metal': {
    why: ['Reactive metal atoms displace hydrogen from dilute acid.', 'Hydrogen gas forms as bubbles.', 'Hydrogen can give a pop sound with a flame.'],
    particles: ['metal atom', 'H+ ions', 'H2 gas bubbles', 'salt solution'],
    commonMistakes: ['Confusing hydrogen with carbon dioxide', 'Testing gas before it is generated', 'Using concentrated acid', 'Ignoring reactivity differences'],
    student: 'The metal pushes hydrogen out of the acid, so hydrogen gas bubbles are seen.',
    teacher: 'Link this to the reactivity series without requiring redox formalism.',
  },
  'indicator-colour': {
    why: ['Indicators have different colours in acidic and basic conditions.', 'The colour depends on the solution pH.', 'Litmus, universal indicator, phenolphthalein, and methyl orange each have different ranges.'],
    particles: ['indicator particle', 'acid/base condition', 'new colour form'],
    commonMistakes: ['Using the wrong indicator for the aim', 'Mixing indicators together', 'Reading colour without a comparison chart'],
    student: 'The indicator changes colour because the solution is acidic, neutral, or basic.',
    teacher: 'Use this as a visual bridge into pH and acid-base classification.',
  },
  'salt-solution-evaporation': {
    why: ['Heating gives water particles enough energy to escape.', 'Salt particles do not evaporate under this classroom condition.', 'Solid salt remains as residue.'],
    particles: ['water particles escape', 'salt ions stay', 'solid residue'],
    commonMistakes: ['Heating unsafe apparatus', 'Calling evaporation a chemical reaction', 'Forgetting that the salt was dissolved, not destroyed'],
    student: 'Water leaves as vapour and the dissolved salt is left behind.',
    teacher: 'Reinforce this as a physical separation technique.',
  },
  'copper-sulphate-crystallization': {
    why: ['A concentrated copper sulphate solution holds less solute as it cools.', 'Copper sulphate particles arrange into a regular crystal pattern.', 'The crystals appear blue.'],
    particles: ['Cu2+ ions', 'SO4 2- ions', 'ordered blue crystal'],
    commonMistakes: ['Boiling to dryness instead of concentrating', 'Cooling too quickly', 'Confusing crystallization with filtration'],
    student: 'Blue crystals appear when dissolved particles arrange neatly as the solution cools.',
    teacher: 'Focus on purification and crystal formation, not lattice energy.',
  },
  filtration: {
    why: ['Filter paper has tiny holes.', 'Liquid particles pass through.', 'Large insoluble solid particles are trapped.'],
    particles: ['insoluble solid trapped', 'liquid passes', 'filtrate collected'],
    commonMistakes: ['Not using filter paper', 'Pouring too fast', 'Trying to filter a fully dissolved salt solution'],
    student: 'Filtration works when one part of the mixture is insoluble.',
    teacher: 'Ask students to name residue and filtrate.',
  },
  conductivity: {
    why: ['Salt solution contains mobile ions.', 'Mobile ions carry charge through the liquid.', 'Pure water has very few ions, so it conducts poorly.'],
    particles: ['Na+ ion', 'Cl- ion', 'moving charges'],
    commonMistakes: ['Saying solid salt conducts well', 'Thinking electrons move freely through water like metal', 'Not comparing with pure water'],
    student: 'Salt solution conducts because charged ions can move.',
    teacher: 'Keep this conceptual unless electrolysis is being introduced.',
  },
};
