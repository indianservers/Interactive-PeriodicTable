export const logicBlockTypes = [
  { type: 'start', label: 'When Experiment Starts', tone: 'cyan', fields: [] },
  { type: 'select-apparatus', label: 'Select Apparatus', tone: 'slate', fields: ['apparatusId'] },
  { type: 'add-chemical', label: 'Add Chemical', tone: 'purple', fields: ['chemicalId', 'quantity', 'unit', 'targetId'] },
  { type: 'measure-volume', label: 'Measure Volume', tone: 'emerald', fields: ['targetId'] },
  { type: 'add-indicator', label: 'Add Indicator', tone: 'pink', fields: ['indicatorId', 'targetId'] },
  { type: 'mix-contents', label: 'Mix Contents', tone: 'amber', fields: ['targetId'] },
  { type: 'heat-container', label: 'Heat Container', tone: 'orange', fields: ['targetId'] },
  { type: 'cool-container', label: 'Cool Container', tone: 'sky', fields: ['targetId'] },
  { type: 'filter-mixture', label: 'Filter Mixture', tone: 'teal', fields: ['targetId'] },
  { type: 'evaporate-solution', label: 'Evaporate Solution', tone: 'orange', fields: ['targetId'] },
  { type: 'measure-ph', label: 'Measure pH', tone: 'emerald', fields: ['targetId'] },
  { type: 'measure-temperature', label: 'Measure Temperature', tone: 'emerald', fields: ['targetId'] },
  { type: 'test-gas', label: 'Test Gas', tone: 'rose', fields: ['gasType', 'targetId'] },
  { type: 'record-observation', label: 'Record Observation', tone: 'blue', fields: ['note'] },
  { type: 'show-equation', label: 'Show Equation', tone: 'indigo', fields: [] },
  { type: 'ask-question', label: 'Ask Question', tone: 'violet', fields: ['question'] },
  { type: 'generate-report', label: 'Generate Report', tone: 'green', fields: [] },
];

export const defaultLogicBlockType = 'start';

export function createLogicBlock(type = defaultLogicBlockType, defaults = {}) {
  const definition = logicBlockTypes.find(block => block.type === type) || logicBlockTypes[0];
  return {
    id: `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
    type,
    label: definition.label,
    apparatusId: '',
    targetId: '',
    chemicalId: '',
    indicatorId: '',
    gasType: 'hydrogen',
    quantity: 10,
    unit: 'mL',
    note: '',
    question: 'What did you observe?',
    ...defaults,
  };
}

export function createRecommendedBlocksForTemplate(template, components = []) {
  const firstContainer = components.find(item => item.componentType === 'apparatus')?.id || '';
  const firstChemical = components.find(item => item.componentType === 'chemical')?.id || '';
  const secondChemical = components.find(item => item.componentType === 'chemical' && item.id !== firstChemical)?.id || '';
  const firstIndicator = components.find(item => item.componentType === 'indicator')?.id || '';
  const hasGasStep = template.steps.some(step => /gas|limewater|splint|pop/i.test(step));
  const hasHeatStep = template.steps.some(step => /heat|evaporat|crystal/i.test(step));
  const hasFilterStep = template.steps.some(step => /filter/i.test(step));
  const blocks = [createLogicBlock('start')];

  if (firstContainer) blocks.push(createLogicBlock('select-apparatus', { apparatusId: firstContainer, targetId: firstContainer }));
  if (firstChemical) blocks.push(createLogicBlock('add-chemical', { chemicalId: firstChemical, targetId: firstContainer }));
  if (secondChemical) blocks.push(createLogicBlock('add-chemical', { chemicalId: secondChemical, targetId: firstContainer }));
  if (firstIndicator) blocks.push(createLogicBlock('add-indicator', { indicatorId: firstIndicator, targetId: firstContainer }));
  blocks.push(createLogicBlock('mix-contents', { targetId: firstContainer }));
  if (hasHeatStep) blocks.push(createLogicBlock('heat-container', { targetId: firstContainer }));
  if (hasFilterStep) blocks.push(createLogicBlock('filter-mixture', { targetId: firstContainer }));
  if (hasGasStep) blocks.push(createLogicBlock('test-gas', { targetId: firstContainer }));
  blocks.push(createLogicBlock('record-observation', { note: template.expectedObservations[0] || '' }));
  blocks.push(createLogicBlock('show-equation'));
  blocks.push(createLogicBlock('generate-report'));
  return blocks;
}
