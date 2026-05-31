import { simulateAction } from './chemistryRuleEngine.js';

const objectName = object => object?.displayName || object?.name || 'selected item';
const objectId = object => object?.sourceId || object?.id || '';

export const createInitialExperimentState = () => ({
  selectedApparatusId: '',
  containerContents: {},
  generatedGases: [],
  observations: [],
  equationsShown: false,
  reportGenerated: false,
  paused: false,
});

const findById = (objects, id) => objects.find(object => object.id === id);
const findChemical = (objects, id) => objects.find(object => object.id === id && object.componentType === 'chemical');
const findIndicator = (objects, id) => objects.find(object => object.id === id && object.componentType === 'indicator');
const findContainer = (objects, id) => objects.find(object => object.id === id && object.componentType === 'apparatus');

function buildSimulationObjects(canvasObjects, state, targetId, extraActionType = '') {
  return canvasObjects.map(object => {
    if (object.componentType !== 'apparatus') return object;
    const contained = state.containerContents[object.id] || object.containedChemicals || [];
    return { ...object, containedChemicals: contained };
  }).concat(extraActionType ? [{
    id: `virtual-${extraActionType}`,
    sourceId: extraActionType,
    displayName: extraActionType,
    componentType: 'action',
    targetId,
  }] : []);
}

function entry({ stepNumber, block, valid, action, observation, warning = '', explanation = '', result = null, nextState }) {
  return {
    id: `${Date.now()}-${Math.round(Math.random() * 1000)}`,
    stepNumber,
    blockId: block.id,
    blockType: block.type,
    action,
    valid,
    observation,
    warning,
    explanation,
    result,
    nextState,
  };
}

export function executeLogicBlock({ block, canvasObjects, state, stepNumber }) {
  const nextState = {
    ...state,
    containerContents: { ...state.containerContents },
    generatedGases: [...state.generatedGases],
    observations: [...state.observations],
  };
  const target = findContainer(canvasObjects, block.targetId || state.selectedApparatusId);
  const selected = findById(canvasObjects, block.apparatusId || block.targetId || state.selectedApparatusId);

  if (block.type === 'start') {
    return entry({ stepNumber, block, valid: true, action: 'Experiment started.', observation: 'Workspace initialized.', explanation: 'The procedure will run from top to bottom.', nextState });
  }

  if (block.type === 'select-apparatus') {
    if (!selected || selected.componentType !== 'apparatus') {
      return entry({ stepNumber, block, valid: false, action: 'Select apparatus', observation: '', warning: 'Choose an apparatus from the canvas before continuing.', explanation: 'Later blocks need a target container.', nextState });
    }
    nextState.selectedApparatusId = selected.id;
    return entry({ stepNumber, block, valid: true, action: `Selected ${objectName(selected)}.`, observation: `${objectName(selected)} is ready.`, explanation: 'This apparatus becomes the default target for later blocks.', nextState });
  }

  if (block.type === 'add-chemical') {
    const chemical = findChemical(canvasObjects, block.chemicalId);
    if (!target) {
      return entry({ stepNumber, block, valid: false, action: 'Add chemical', observation: '', warning: 'Place/select a container before adding chemicals.', explanation: 'A chemical needs a target apparatus such as a beaker or test tube.', nextState });
    }
    if (!chemical) {
      return entry({ stepNumber, block, valid: false, action: 'Add chemical', observation: '', warning: 'Choose a chemical from the canvas.', explanation: 'The block menu is populated from dropped canvas chemicals.', nextState });
    }
    nextState.containerContents[target.id] = [...(nextState.containerContents[target.id] || []), objectName(chemical)];
    return entry({ stepNumber, block, valid: true, action: `Added ${block.quantity} ${block.unit} ${objectName(chemical)} to ${objectName(target)}.`, observation: `${objectName(chemical)} is now in ${objectName(target)}.`, explanation: 'The experiment state now remembers this chemical inside the selected container.', nextState });
  }

  if (block.type === 'add-indicator') {
    const indicator = findIndicator(canvasObjects, block.indicatorId);
    if (!target || !(nextState.containerContents[target.id] || []).length) {
      return entry({ stepNumber, block, valid: false, action: 'Add indicator', observation: '', warning: 'Add solution before checking color change.', explanation: 'Indicators need a solution in a container.', nextState });
    }
    if (!indicator) {
      return entry({ stepNumber, block, valid: false, action: 'Add indicator', observation: '', warning: 'Choose an indicator from the canvas.', explanation: 'Drop litmus, universal indicator, phenolphthalein, or methyl orange first.', nextState });
    }
    nextState.containerContents[target.id] = [...(nextState.containerContents[target.id] || []), objectName(indicator)];
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target.id), 'indicator');
    return entry({ stepNumber, block, valid: true, action: `Added ${objectName(indicator)} to ${objectName(target)}.`, observation: result.observation, explanation: result.particleExplanation, result, nextState });
  }

  if (block.type === 'mix-contents') {
    if (!target || (nextState.containerContents[target.id] || []).length < 2) {
      return entry({ stepNumber, block, valid: false, action: 'Mix contents', observation: '', warning: 'Add at least two contents before mixing.', explanation: 'Mixing needs chemicals or indicators in a container.', nextState });
    }
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target.id), 'mix');
    if (result.reactionId === 'acid-carbonate') nextState.generatedGases.push('carbon-dioxide');
    if (result.reactionId === 'acid-metal') nextState.generatedGases.push('hydrogen');
    nextState.observations.push(result.observation);
    return entry({ stepNumber, block, valid: result.supported, action: `Mixed contents of ${objectName(target)}.`, observation: result.observation, warning: result.validationMessages[0] || '', explanation: result.learningTakeaway, result, nextState });
  }

  if (block.type === 'heat-container' || block.type === 'evaporate-solution') {
    if (!target) {
      return entry({ stepNumber, block, valid: false, action: 'Heat container', observation: '', warning: 'Select a container before heating.', explanation: 'Heating requires a target apparatus.', nextState });
    }
    if (!(nextState.containerContents[target.id] || []).length) {
      return entry({ stepNumber, block, valid: false, action: 'Heat container', observation: '', warning: 'You are trying to heat an empty container.', explanation: 'Add a solution or sample before heating.', nextState });
    }
    if (!target.heatingAllowed) {
      return entry({ stepNumber, block, valid: false, action: `Heat ${objectName(target)}`, observation: '', warning: 'This apparatus should not be heated directly.', explanation: 'Use a heat-safe beaker, test tube, or evaporating dish.', nextState });
    }
    const action = block.type === 'evaporate-solution' ? 'evaporate' : 'heat';
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target.id, action), action);
    return entry({ stepNumber, block, valid: true, action: `${block.type === 'evaporate-solution' ? 'Evaporated' : 'Heated'} ${objectName(target)}.`, observation: result.observation, warning: result.safetyWarnings[0], explanation: result.learningTakeaway, result, nextState });
  }

  if (block.type === 'cool-container') {
    if (!target) return entry({ stepNumber, block, valid: false, action: 'Cool container', observation: '', warning: 'Select a container before cooling.', explanation: 'Cooling acts on a heated solution or container.', nextState });
    return entry({ stepNumber, block, valid: true, action: `Cooled ${objectName(target)}.`, observation: 'Container is allowed to cool; crystals may form if a concentrated solution is present.', explanation: 'Cooling lowers particle motion and may allow crystal formation.', nextState });
  }

  if (block.type === 'filter-mixture') {
    if (!target || !(nextState.containerContents[target.id] || []).length) {
      return entry({ stepNumber, block, valid: false, action: 'Filter mixture', observation: '', warning: 'Add a mixture before filtering.', explanation: 'Filtration separates insoluble solid from liquid.', nextState });
    }
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target.id, 'filter'), 'filter');
    return entry({ stepNumber, block, valid: true, action: `Filtered contents of ${objectName(target)}.`, observation: result.observation, explanation: result.learningTakeaway, result, nextState });
  }

  if (block.type === 'measure-volume' || block.type === 'measure-ph' || block.type === 'measure-temperature') {
    if (!target || !(nextState.containerContents[target.id] || []).length) {
      const warning = block.type === 'measure-ph' ? 'Add solution before measuring pH.' : 'Add material before measuring.';
      return entry({ stepNumber, block, valid: false, action: block.label, observation: '', warning, explanation: 'Measurements are meaningful only after a sample exists.', nextState });
    }
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target.id), block.type);
    const observation = block.type === 'measure-ph' ? result.observation : `${block.label.replace('Measure ', '')} reading recorded conceptually.`;
    return entry({ stepNumber, block, valid: true, action: `${block.label} of ${objectName(target)}.`, observation, explanation: 'Measurement data supports scientific conclusions.', result, nextState });
  }

  if (block.type === 'test-gas') {
    const gas = block.gasType || nextState.generatedGases[0];
    if (!gas || !nextState.generatedGases.includes(gas)) {
      return entry({ stepNumber, block, valid: false, action: 'Test gas', observation: '', warning: 'No gas has been generated yet for gas testing.', explanation: 'Generate hydrogen, oxygen, or carbon dioxide before testing it.', nextState });
    }
    const gasObject = { id: `virtual-${gas}`, sourceId: gas, displayName: gas, componentType: 'chemical', state: 'gas' };
    const result = simulateAction([...buildSimulationObjects(canvasObjects, nextState, target?.id || ''), gasObject], 'gas-test');
    return entry({ stepNumber, block, valid: true, action: `Tested ${gas}.`, observation: result.observation, warning: result.safetyWarnings[0], explanation: result.learningTakeaway, result, nextState });
  }

  if (block.type === 'record-observation') {
    nextState.observations.push(block.note || 'Observation recorded.');
    return entry({ stepNumber, block, valid: true, action: 'Recorded observation.', observation: block.note || 'Observation recorded.', explanation: 'Observations are evidence for the conclusion.', nextState });
  }

  if (block.type === 'show-equation') {
    const result = simulateAction(buildSimulationObjects(canvasObjects, nextState, target?.id || ''), 'equation');
    nextState.equationsShown = true;
    return entry({ stepNumber, block, valid: result.supported, action: 'Show equation.', observation: result.wordEquation, warning: result.supported ? '' : result.validationMessages[0], explanation: result.balancedEquation || result.learningTakeaway, result, nextState });
  }

  if (block.type === 'ask-question') {
    return entry({ stepNumber, block, valid: true, action: 'Asked question.', observation: block.question, explanation: 'Questions help connect procedure, observation, and concept.', nextState });
  }

  if (block.type === 'generate-report') {
    nextState.reportGenerated = true;
    return entry({ stepNumber, block, valid: true, action: 'Generated report.', observation: `${nextState.observations.length} observations included.`, explanation: 'The report summarizes setup, steps, observations, equations, safety, and learning.', nextState });
  }

  return entry({ stepNumber, block, valid: false, action: block.label, observation: '', warning: 'This block is not supported yet.', explanation: 'Choose a Grade 7-10 chemistry logic block.', nextState });
}

export function runLogicSequence({ blocks, canvasObjects, initialState = createInitialExperimentState(), startIndex = 0, maxSteps = Infinity }) {
  let state = initialState;
  const entries = [];
  const limit = Math.min(blocks.length, startIndex + maxSteps);
  for (let index = startIndex; index < limit; index += 1) {
    const result = executeLogicBlock({ block: blocks[index], canvasObjects, state, stepNumber: index + 1 });
    state = result.nextState;
    entries.push(result);
    if (!result.valid) break;
  }
  return { state, entries, nextIndex: startIndex + entries.length };
}
