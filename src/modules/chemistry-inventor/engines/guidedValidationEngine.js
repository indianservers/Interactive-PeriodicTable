const normalize = value => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const preferredApparatus = {
  'acid-base-neutralization': {
    alternatives: { beaker: 'This can work for demonstration, but conical flask is preferred for controlled mixing.' },
  },
  'neutralization-with-temperature-change': {
    alternatives: { beaker: 'A beaker is acceptable here because temperature measurement is easier to read during a demo.' },
  },
};

export function getExpectedIndicatorIds(template) {
  if (!template) return [];
  const text = [template.title, template.aim, ...template.steps].join(' ').toLowerCase();
  const ids = [];
  const explicitIndicators = ['litmus-paper', 'red-litmus', 'blue-litmus', 'universal-indicator', 'phenolphthalein', 'methyl-orange'];
  template.requiredChemicals?.forEach(id => {
    if (explicitIndicators.includes(id)) ids.push(id);
  });
  if (/phenolphthalein/.test(text)) ids.push('phenolphthalein');
  if (/universal indicator|ph comparison|ph /.test(text)) ids.push('universal-indicator');
  if (/litmus/.test(text)) ids.push('litmus-paper');
  if (/methyl orange/.test(text)) ids.push('methyl-orange');
  return [...new Set(ids)];
}

export const challengeGoals = [
  { id: 'unknown-acid-base', grade: 7, title: 'Identify whether the unknown solution is acidic or basic', templateHint: 'Litmus Acid/Base Test' },
  { id: 'separate-mixture', grade: 7, title: 'Separate an insoluble solid from a liquid', templateHint: 'Separation Using Funnel and Filter Paper' },
  { id: 'generate-co2', grade: 10, title: 'Generate and test carbon dioxide gas', templateHint: 'Carbonate Test Using Acid' },
  { id: 'confirm-chloride', grade: 10, title: 'Confirm a chloride solution by precipitation', templateHint: 'Chloride Test Using Silver Nitrate' },
  { id: 'recover-salt', grade: 8, title: 'Recover salt from a salt solution', templateHint: 'Evaporation of Salt Solution' },
];

export function getTemplateHints(template, mode = 'guided') {
  if (!template) return [];
  const hints = [
    ...template.requiredApparatus.map(id => `Drag ${id.replace(/-/g, ' ')} to the canvas.`),
    ...template.requiredChemicals.map(id => `Add ${id.replace(/-/g, ' ')} to the workspace.`),
  ];
  if (template.requiredApparatus.includes('beaker')) hints.push('Add water or solution into the beaker before mixing.');
  if (template.requiredChemicals.includes('sodium-chloride')) hints.push('Add sodium chloride, then use a glass rod to stir if the aim is solution preparation.');
  if (template.requiredApparatus.includes('evaporating-dish')) hints.push('Use evaporating dish for evaporation rather than heating a measuring cylinder.');
  if (template.steps.some(step => /indicator|litmus|phenolphthalein/i.test(step))) hints.push('Add the indicator before checking colour change.');
  getExpectedIndicatorIds(template).forEach(id => hints.push(`Use ${id.replace(/-/g, ' ')} for a clearer colour-change observation.`));
  if (template.steps.some(step => /gas|limewater|splint/i.test(step))) hints.push('Generate the gas before adding a gas test block.');
  if (mode === 'challenge') return hints.slice(0, 2);
  return hints;
}

function hasSource(objects, sourceId) {
  return objects.some(object => (object.sourceId || normalize(object.displayName)) === sourceId);
}

function hasBlock(blocks, type) {
  return blocks.some(block => block.type === type);
}

function expectedBlockTypes(template) {
  const text = [...template.steps, template.title, template.aim].join(' ').toLowerCase();
  const types = ['start', 'select-apparatus'];
  if (template.requiredChemicals.length) types.push('add-chemical');
  if (/indicator|litmus|phenolphthalein|methyl|universal/.test(text)) types.push('add-indicator');
  if (/mix|neutral|reaction|add acid|add base|precipitate/.test(text)) types.push('mix-contents');
  if (/heat/.test(text)) types.push('heat-container');
  if (/cool|crystal/.test(text)) types.push('cool-container');
  if (/filter/.test(text)) types.push('filter-mixture');
  if (/evaporat/.test(text)) types.push('evaporate-solution');
  if (/ph/.test(text)) types.push('measure-ph');
  if (/temperature/.test(text)) types.push('measure-temperature');
  if (/gas|limewater|splint|pop/.test(text)) types.push('test-gas');
  types.push('record-observation');
  types.push('show-equation');
  return [...new Set(types)];
}

function sequenceScore(blocks, expected) {
  const blockTypes = blocks.map(block => block.type);
  const found = expected.filter(type => blockTypes.includes(type));
  let orderHits = 0;
  let cursor = -1;
  expected.forEach(type => {
    const index = blockTypes.indexOf(type);
    if (index > cursor) {
      orderHits += 1;
      cursor = index;
    }
  });
  return {
    found,
    missing: expected.filter(type => !blockTypes.includes(type)),
    score: expected.length ? Math.round(((found.length + orderHits) / (expected.length * 2)) * 100) : 100,
  };
}

export function validateGuidedExperiment({ template, canvasObjects, procedureBlocks, procedureTimeline, vivaAnswers = {} }) {
  if (!template) {
    return {
      score: 0,
      categories: {},
      messages: ['Select a guided experiment to receive checklist feedback.'],
      checklist: [],
      hints: [],
    };
  }

  const messages = [];
  const apparatusHits = template.requiredApparatus.filter(id => hasSource(canvasObjects, id));
  const expectedIndicators = getExpectedIndicatorIds(template);
  const templateChemicals = template.requiredChemicals.filter(id => !expectedIndicators.includes(id));
  const chemicalHits = templateChemicals.filter(id => hasSource(canvasObjects, id));
  const indicatorHits = expectedIndicators.filter(id => hasSource(canvasObjects, id));
  const missingApparatus = template.requiredApparatus.filter(id => !apparatusHits.includes(id));
  const missingChemicals = templateChemicals.filter(id => !chemicalHits.includes(id));
  const missingIndicators = expectedIndicators.filter(id => !indicatorHits.includes(id));
  const expectedBlocks = expectedBlockTypes(template);
  const sequence = sequenceScore(procedureBlocks, expectedBlocks);
  const validTimeline = procedureTimeline.filter(entry => entry.valid);
  const hasObservation = procedureTimeline.some(entry => /observ|record|turn|forms|bubbles|milky|precipitate|crystal/i.test(`${entry.action} ${entry.observation}`));
  const safetyWarnings = procedureTimeline.filter(entry => entry.warning).length;
  const vivaTotal = template.vivaQuestions?.length || 0;
  const vivaDone = Object.values(vivaAnswers).filter(Boolean).length;

  missingApparatus.forEach(id => messages.push(`Try adding ${id.replace(/-/g, ' ')}. It supports the intended setup.`));
  missingChemicals.forEach(id => messages.push(`Try adding ${id.replace(/-/g, ' ')} so the expected reaction can happen.`));
  missingIndicators.forEach(id => messages.push(`Try adding ${id.replace(/-/g, ' ')} because it is well suited for this experiment.`));
  sequence.missing.forEach(type => messages.push(`Add a ${type.replace(/-/g, ' ')} block to complete the procedure.`));

  const preference = preferredApparatus[template.id];
  if (preference) {
    Object.entries(preference.alternatives).forEach(([id, message]) => {
      if (hasSource(canvasObjects, id) && !template.requiredApparatus.includes(id)) messages.push(message);
    });
  }

  const wrongIndicator = canvasObjects.some(object => object.componentType === 'indicator')
    && expectedIndicators.includes('phenolphthalein')
    && !hasSource(canvasObjects, 'phenolphthalein');
  if (wrongIndicator) messages.push('This indicator may show a colour change, but phenolphthalein is more suitable for this neutralization demonstration.');

  const categories = {
    correctApparatus: template.requiredApparatus.length ? Math.round((apparatusHits.length / template.requiredApparatus.length) * 100) : 100,
    correctChemicals: Math.round(((chemicalHits.length + indicatorHits.length) / Math.max(1, templateChemicals.length + expectedIndicators.length)) * 100),
    correctSequence: sequence.score,
    correctObservations: hasObservation ? 100 : Math.min(70, validTimeline.length * 18),
    safetyAwareness: Math.max(40, 100 - safetyWarnings * 20),
    vivaQuestions: vivaTotal ? Math.round((vivaDone / vivaTotal) * 100) : 100,
  };
  const score = Math.round(Object.values(categories).reduce((sum, value) => sum + value, 0) / Object.keys(categories).length);

  const checklist = [
    ...template.requiredApparatus.map(id => ({ id: `apparatus-${id}`, label: `Add ${id.replace(/-/g, ' ')}`, done: hasSource(canvasObjects, id) })),
    ...templateChemicals.map(id => ({ id: `chemical-${id}`, label: `Add ${id.replace(/-/g, ' ')}`, done: hasSource(canvasObjects, id) })),
    ...expectedIndicators.map(id => ({ id: `indicator-${id}`, label: `Add ${id.replace(/-/g, ' ')}`, done: hasSource(canvasObjects, id) })),
    ...expectedBlocks.map(type => ({ id: `block-${type}`, label: `Use ${type.replace(/-/g, ' ')} block`, done: hasBlock(procedureBlocks, type) })),
    { id: 'run-simulation', label: 'Run steps and record observation', done: procedureTimeline.length > 0 && hasObservation },
  ];

  return {
    score,
    categories,
    messages: messages.length ? messages : ['Good progress. Now run the sequence and explain the observation in your own words.'],
    checklist,
    hints: getTemplateHints(template),
  };
}
