const acidIds = new Set(['hydrochloric-acid', 'vinegar-acetic-acid', 'dilute-sulphuric-acid']);
const baseIds = new Set(['sodium-hydroxide', 'limewater']);
const carbonateIds = new Set(['calcium-carbonate']);
const metalIds = new Set(['zinc', 'magnesium', 'iron-filings']);
const chlorideIds = new Set(['sodium-chloride', 'simple-salt-solution', 'hydrochloric-acid']);
const sulphateIds = new Set(['dilute-sulphuric-acid', 'copper-sulphate']);
const saltSolutionIds = new Set(['simple-salt-solution', 'sodium-chloride']);
const waterIds = new Set(['water']);
const indicatorIds = new Set(['litmus-paper', 'red-litmus', 'blue-litmus', 'universal-indicator', 'phenolphthalein', 'methyl-orange', 'ph-strip']);

const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const includesAny = (ids, candidates) => candidates.some(id => ids.has(id));
const displayList = items => items.map(item => item.displayName || item.name || item.sourceId).join(', ');

function getObjectId(object) {
  return object.sourceId || normalize(object.displayName || object.id);
}

function getSubstances(canvasObjects) {
  const direct = canvasObjects
    .filter(object => object.componentType === 'chemical' || object.componentType === 'indicator')
    .map(object => ({
      id: getObjectId(object),
      name: object.displayName,
      type: object.componentType,
      state: object.state,
      quantity: object.quantity,
      unit: object.unit,
      supportedReactions: object.supportedReactions || [],
    }));

  const contained = canvasObjects
    .filter(object => object.componentType === 'apparatus' && Array.isArray(object.containedChemicals))
    .flatMap(container => container.containedChemicals.map(name => ({
      id: normalize(name),
      name,
      type: 'contained-chemical',
      state: 'unknown',
      containerId: container.id,
    })));

  return [...direct, ...contained];
}

function getContext(canvasObjects) {
  const substances = getSubstances(canvasObjects);
  const substanceIds = new Set(substances.map(item => item.id));
  return {
    canvasObjects,
    substances,
    substanceIds,
    containers: canvasObjects.filter(object => object.componentType === 'apparatus'),
    indicators: canvasObjects.filter(object => object.componentType === 'indicator' || indicatorIds.has(getObjectId(object))),
    measurements: canvasObjects.filter(object => object.componentType === 'measurement'),
    actions: canvasObjects.filter(object => object.componentType === 'action'),
  };
}

function has(ctx, ids) {
  return [...ids].some(id => ctx.substanceIds.has(id));
}

function hasAction(ctx, actionId) {
  return ctx.actions.some(action => getObjectId(action) === actionId);
}

export function validateSetup(canvasObjects, requestedAction = 'simulate') {
  const ctx = getContext(canvasObjects);
  const messages = [];
  const hasChemicals = ctx.substances.some(item => item.type !== 'indicator');
  const hasContainer = ctx.containers.some(container => Array.isArray(container.containedChemicals) || ['beaker', 'test-tube', 'conical-flask'].includes(getObjectId(container)));
  const hasLiquidChemical = ctx.substances.some(item => ['liquid', 'aqueous'].includes(item.state) || acidIds.has(item.id) || baseIds.has(item.id));

  if (hasChemicals && !hasContainer) messages.push('Place the chemical inside a container before mixing.');
  if (hasLiquidChemical && !ctx.containers.some(container => ['measuring-cylinder', 'dropper'].includes(getObjectId(container)))) {
    messages.push('Use a measuring cylinder or dropper for measured liquid addition.');
  }
  if (hasAction(ctx, 'heat') || hasAction(ctx, 'evaporate')) {
    const unsafeHeatTarget = ctx.containers.some(container => !container.heatingAllowed && !container.canHeat && ['measuring-cylinder', 'watch-glass', 'funnel', 'gas-jar'].includes(getObjectId(container)));
    if (unsafeHeatTarget) messages.push('This apparatus should not be heated directly.');
  }
  if ((requestedAction.includes('indicator') || ctx.indicators.length > 0) && !ctx.indicators.length) {
    messages.push('Add indicator to the solution before checking color change.');
  }
  if ((requestedAction.includes('gas') || has(ctx, new Set(['hydrogen', 'oxygen', 'carbon-dioxide']))) && !ctx.containers.some(container => ['gas-jar', 'test-tube'].includes(getObjectId(container)))) {
    messages.push('Gas test requires a generated gas and a testing apparatus.');
  }
  if (!canvasObjects.length) messages.push('Drag apparatus, chemicals, indicators, and actions into the canvas before running the simulator.');

  return messages;
}

export function detectReaction(canvasObjects) {
  const ctx = getContext(canvasObjects);
  const ids = ctx.substanceIds;

  if (has(ctx, acidIds) && has(ctx, baseIds)) return { id: 'neutralization', ctx };
  if (has(ctx, acidIds) && has(ctx, carbonateIds)) return { id: 'acid-carbonate', ctx };
  if (has(ctx, acidIds) && has(ctx, metalIds)) return { id: 'acid-metal', ctx };
  if (ids.has('silver-nitrate') && includesAny(ids, [...chlorideIds])) return { id: 'chloride-test', ctx };
  if (ids.has('barium-chloride') && includesAny(ids, [...sulphateIds])) return { id: 'sulphate-test', ctx };
  if (ids.has('carbon-dioxide') && ids.has('limewater')) return { id: 'co2-limewater-test', ctx };
  if (ids.has('hydrogen')) return { id: 'hydrogen-pop-test', ctx };
  if (ids.has('oxygen')) return { id: 'oxygen-glowing-splint-test', ctx };
  if (ctx.indicators.length && (has(ctx, acidIds) || has(ctx, baseIds) || ids.has('water') || saltSolutionIds.has([...ids].find(id => saltSolutionIds.has(id))))) return { id: 'indicator-colour', ctx };
  if ((hasAction(ctx, 'heat') || hasAction(ctx, 'evaporate')) && (ids.has('simple-salt-solution') || ids.has('sodium-chloride'))) return { id: 'salt-solution-evaporation', ctx };
  if ((hasAction(ctx, 'crystallize') || hasAction(ctx, 'evaporate')) && ids.has('copper-sulphate')) return { id: 'copper-sulphate-crystallization', ctx };
  if (hasAction(ctx, 'filter')) return { id: 'filtration', ctx };
  if (ctx.measurements.some(item => getObjectId(item) === 'conductivity-measurement') && (ids.has('simple-salt-solution') || ids.has('water'))) return { id: 'conductivity', ctx };

  return { id: 'unsupported', ctx };
}

function indicatorObservation(ctx) {
  const medium = has(ctx, acidIds) ? 'acid' : has(ctx, baseIds) ? 'base' : 'neutral';
  const indicator = ctx.indicators[0];
  const id = indicator ? getObjectId(indicator) : 'indicator';
  const map = {
    'universal-indicator': { acid: 'red/orange', neutral: 'green', base: 'blue/purple' },
    'red-litmus': { acid: 'stays red', neutral: 'stays red/purple', base: 'turns blue' },
    'blue-litmus': { acid: 'turns red', neutral: 'stays blue/purple', base: 'stays blue' },
    'litmus-paper': { acid: 'blue litmus turns red', neutral: 'little or no change', base: 'red litmus turns blue' },
    phenolphthalein: { acid: 'colourless', neutral: 'colourless', base: 'pink' },
    'methyl-orange': { acid: 'red', neutral: 'orange', base: 'yellow/orange' },
    'ph-strip': { acid: 'low pH colour', neutral: 'near pH 7 colour', base: 'high pH colour' },
  };
  return `${indicator?.displayName || 'Indicator'} shows ${map[id]?.[medium] || 'a colour change'} in this ${medium} solution.`;
}

const reactionOutputs = {
  neutralization: {
    observation: 'Acid and base neutralize. Indicator colour moves toward neutral and a slight temperature rise may be observed.',
    wordEquation: 'acid + base -> salt + water',
    balancedEquation: 'HCl + NaOH -> NaCl + H2O',
    ionicExplanation: 'H+ ions from the acid combine with OH- ions from the base to form water.',
    particleExplanation: 'Acid particles provide hydrogen ions and base particles provide hydroxide ions; these pair up to make water while remaining ions form a salt.',
    learningTakeaway: 'Neutralization forms salt and water and is often slightly exothermic.',
  },
  'acid-carbonate': {
    observation: 'Effervescence occurs. Carbon dioxide gas is produced and can turn limewater milky.',
    wordEquation: 'acid + carbonate -> salt + water + carbon dioxide',
    balancedEquation: 'CaCO3 + 2HCl -> CaCl2 + H2O + CO2',
    ionicExplanation: 'Carbonate ions react with acid hydrogen ions to form carbon dioxide and water.',
    particleExplanation: 'Acid particles attack carbonate particles, releasing carbon dioxide gas bubbles.',
    learningTakeaway: 'Carbonates are tested by adding acid and then testing the gas with limewater.',
  },
  'acid-metal': {
    observation: 'Bubbles form as hydrogen gas is produced. A pop sound is expected in the hydrogen test.',
    wordEquation: 'metal + acid -> salt + hydrogen',
    balancedEquation: 'Zn + 2HCl -> ZnCl2 + H2',
    ionicExplanation: 'Metal atoms displace hydrogen ions from the acid to form hydrogen gas.',
    particleExplanation: 'Metal particles lose electrons; hydrogen ions gain electrons and join as H2 gas.',
    learningTakeaway: 'Reactive metals produce hydrogen when added to dilute acids.',
  },
  'chloride-test': {
    observation: 'A white precipitate of silver chloride forms.',
    wordEquation: 'silver nitrate + chloride solution -> silver chloride + nitrate salt',
    balancedEquation: 'AgNO3 + NaCl -> AgCl + NaNO3',
    ionicExplanation: 'Ag+ ions combine with Cl- ions to make insoluble AgCl.',
    particleExplanation: 'Silver ions and chloride ions meet in solution and cluster as a white solid.',
    learningTakeaway: 'Silver nitrate is used as a school-level test for chloride ions.',
  },
  'sulphate-test': {
    observation: 'A white precipitate of barium sulphate forms.',
    wordEquation: 'barium chloride + sulphate solution -> barium sulphate + chloride salt',
    balancedEquation: 'BaCl2 + H2SO4 -> BaSO4 + 2HCl',
    ionicExplanation: 'Ba2+ ions combine with SO4 2- ions to make insoluble BaSO4.',
    particleExplanation: 'Barium ions and sulphate ions form tiny insoluble solid particles suspended in the liquid.',
    learningTakeaway: 'Barium chloride gives a white precipitate with sulphate ions.',
  },
  'co2-limewater-test': {
    observation: 'Limewater turns milky, showing carbon dioxide is present.',
    wordEquation: 'carbon dioxide + limewater -> calcium carbonate + water',
    balancedEquation: 'CO2 + Ca(OH)2 -> CaCO3 + H2O',
    ionicExplanation: 'Carbon dioxide forms carbonate species that produce insoluble calcium carbonate.',
    particleExplanation: 'Carbon dioxide particles react in limewater to form fine white calcium carbonate particles.',
    learningTakeaway: 'Milky limewater is the standard school test for carbon dioxide.',
  },
  'hydrogen-pop-test': {
    observation: 'Hydrogen gives a squeaky pop with a burning splint.',
    wordEquation: 'hydrogen + oxygen -> water',
    balancedEquation: '2H2 + O2 -> 2H2O',
    ionicExplanation: '',
    particleExplanation: 'Hydrogen molecules react rapidly with oxygen molecules, releasing energy as sound and heat.',
    learningTakeaway: 'The pop test identifies hydrogen gas conceptually.',
  },
  'oxygen-glowing-splint-test': {
    observation: 'A glowing splint relights in oxygen.',
    wordEquation: 'oxygen supports combustion',
    balancedEquation: '',
    ionicExplanation: '',
    particleExplanation: 'Oxygen molecules help fuel particles burn more strongly.',
    learningTakeaway: 'Oxygen is identified because it supports burning.',
  },
  'salt-solution-evaporation': {
    observation: 'Water evaporates and salt residue remains.',
    wordEquation: 'salt solution -> salt + water vapour',
    balancedEquation: '',
    ionicExplanation: 'Dissolved sodium and chloride ions remain when water leaves as vapour.',
    particleExplanation: 'Water particles escape into the air; salt particles stay behind as solid residue.',
    learningTakeaway: 'Evaporation separates a dissolved solid from its solvent.',
  },
  'copper-sulphate-crystallization': {
    observation: 'Blue copper sulphate crystals appear after concentration and cooling.',
    wordEquation: 'copper sulphate solution -> copper sulphate crystals',
    balancedEquation: '',
    ionicExplanation: 'Copper and sulphate ions arrange into a crystal lattice as the solution cools.',
    particleExplanation: 'As water decreases and cooling occurs, dissolved particles pack into blue crystals.',
    learningTakeaway: 'Crystallization can purify a soluble solid.',
  },
  filtration: {
    observation: 'Insoluble solid stays on the filter paper and liquid passes through as filtrate.',
    wordEquation: 'mixture -> residue + filtrate',
    balancedEquation: '',
    ionicExplanation: '',
    particleExplanation: 'Large insoluble particles are trapped by filter paper; smaller liquid particles pass through.',
    learningTakeaway: 'Filtration separates insoluble solids from liquids.',
  },
  conductivity: {
    observation: 'Salt solution conducts electricity conceptually; pure water shows low conductivity.',
    wordEquation: 'ionic solution conducts electricity',
    balancedEquation: '',
    ionicExplanation: 'Mobile ions in salt solution carry charge through the liquid.',
    particleExplanation: 'Dissolved ions move toward electrodes and allow current to flow.',
    learningTakeaway: 'Ionic solutions conduct because they contain mobile charged particles.',
  },
};

export function getObservation(reaction, canvasObjects = []) {
  if (reaction.id === 'indicator-colour') return indicatorObservation(reaction.ctx || getContext(canvasObjects));
  return reactionOutputs[reaction.id]?.observation || 'This combination is not yet supported in the Grade 7-10 simulator.';
}

export function getEquation(reaction) {
  const output = reactionOutputs[reaction.id] || {};
  return {
    wordEquation: output.wordEquation || 'No supported school-level equation for this setup yet.',
    balancedEquation: output.balancedEquation || '',
  };
}

export function getParticleExplanation(reaction) {
  if (reaction.id === 'indicator-colour') {
    return 'Indicator particles change structure in acidic or basic conditions, so the visible colour changes.';
  }
  return reactionOutputs[reaction.id]?.particleExplanation || 'The simulator has no safe Grade 7-10 particle model for this combination yet.';
}

export function getSafetyWarnings(canvasObjects) {
  const ctx = getContext(canvasObjects);
  const warnings = [];
  if (has(ctx, acidIds)) warnings.push('Use dilute acids only and wear eye protection.');
  if (has(ctx, baseIds)) warnings.push('Use dilute bases only and avoid skin contact.');
  if (hasAction(ctx, 'heat') || hasAction(ctx, 'evaporate')) warnings.push('Heating must be supervised by a teacher.');
  if (has(ctx, new Set(['hydrogen']))) warnings.push('Hydrogen is flammable; use the pop test only as a supervised demonstration.');
  if (has(ctx, new Set(['oxygen']))) warnings.push('Oxygen supports combustion; keep flames controlled.');
  if (ctx.substanceIds.has('silver-nitrate')) warnings.push('Silver nitrate may stain skin and clothing.');
  if (ctx.substanceIds.has('barium-chloride')) warnings.push('Barium chloride demonstrations require teacher supervision.');
  return warnings.length ? warnings : ['Use small quantities, labelled containers, and normal classroom lab safety.'];
}

export function generateLearningFeedback(reaction, canvasObjects = []) {
  const ctx = reaction.ctx || getContext(canvasObjects);
  if (reaction.id === 'unsupported') {
    return 'This combination is not yet supported in the Grade 7-10 simulator. Try acid + base, acid + carbonate, acid + metal, indicator tests, filtration, evaporation, precipitation tests, gas tests, or conductivity.';
  }
  const base = reactionOutputs[reaction.id]?.learningTakeaway || 'Connect the observation to the reaction type and safety rule.';
  const measurementHint = ctx.measurements.length ? ` Measurement tools added: ${displayList(ctx.measurements)}.` : ' Add a measurement tool to strengthen the investigation.';
  return `${base}${measurementHint}`;
}

export function simulateAction(canvasObjects, action = 'run-simulation') {
  const validationMessages = validateSetup(canvasObjects, action);
  const reaction = detectReaction(canvasObjects);
  const equations = getEquation(reaction);
  const supported = reaction.id !== 'unsupported';
  const output = reactionOutputs[reaction.id] || {};
  const learning = reactionLearningContent[reaction.id] || {};
  const observation = getObservation(reaction, canvasObjects);

  return {
    supported,
    reactionId: reaction.id,
    title: supported ? reaction.id.replace(/-/g, ' ') : 'Unsupported setup',
    observation,
    wordEquation: equations.wordEquation,
    balancedEquation: equations.balancedEquation,
    ionicExplanation: reaction.id === 'indicator-colour'
      ? 'Indicator colour depends on whether the solution provides acidic, neutral, or basic conditions.'
      : output.ionicExplanation || '',
    particleExplanation: getParticleExplanation(reaction),
    particleCards: learning.particles || [],
    whyItHappened: learning.why || [output.learningTakeaway || 'This result follows from the interaction of the selected substances.'],
    commonMistakes: learning.commonMistakes || ['Wrong sequence', 'Wrong indicator', 'Heating unsafe apparatus', 'Confusing gas tests', 'Assuming all mixtures react'],
    studentExplanation: learning.student || output.learningTakeaway || '',
    teacherExplanation: learning.teacher || 'Guide students from visible evidence to the school-level reaction model.',
    safetyWarnings: getSafetyWarnings(canvasObjects),
    safetyNote: getSafetyWarnings(canvasObjects).join(' '),
    learningTakeaway: generateLearningFeedback(reaction, canvasObjects),
    validationMessages: supported ? validationMessages : [...validationMessages, 'This combination is not yet supported in the Grade 7-10 simulator.'],
  };
}
import { reactionLearningContent } from '../data/learningContent.js';
