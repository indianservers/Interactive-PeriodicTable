export const actionBlockLibrary = [
  ['mix', 'Mix', 'Combine selected chemicals or contents.', ['chemical', 'apparatus'], 7],
  ['pour', 'Pour', 'Transfer liquid from one apparatus to another.', ['liquid', 'apparatus'], 7],
  ['heat', 'Heat', 'Apply conceptual heat to allowed apparatus.', ['apparatus'], 8],
  ['filter', 'Filter', 'Separate insoluble solid from liquid.', ['mixture', 'funnel', 'filter-paper'], 7],
  ['evaporate', 'Evaporate', 'Remove solvent by heating conceptually.', ['solution'], 8],
  ['crystallize', 'Crystallize', 'Form crystals from concentrated solution.', ['solution'], 8],
  ['collect-gas', 'Collect Gas', 'Collect gas in a jar for testing.', ['gas'], 8],
  ['test-with-indicator', 'Test With Indicator', 'Use indicator to infer acidic/basic/neutral nature.', ['indicator', 'solution'], 7],
  ['record-observation', 'Record Observation', 'Add colour, gas, precipitate, or temperature note.', ['observation'], 7],
].map(([id, name, description, compatibleWith, gradeLevel]) => ({
  id, name, description, compatibleWith, gradeLevel,
  defaultProperties: { quantity: 1, unit: 'none', state: 'block' },
}));
