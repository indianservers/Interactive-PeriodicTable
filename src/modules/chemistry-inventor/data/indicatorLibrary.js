export const indicatorLibrary = [
  ['litmus-paper', 'Litmus Paper', 'paper', 'red', 'blue', 'purple', '5-8', 7, 'Dip paper into solution and compare colour.'],
  ['red-litmus', 'Red Litmus', 'paper', 'red', 'blue', 'red/purple', '5-8', 7, 'Turns blue in basic solution.'],
  ['blue-litmus', 'Blue Litmus', 'paper', 'red', 'blue', 'blue/purple', '5-8', 7, 'Turns red in acidic solution.'],
  ['universal-indicator', 'Universal Indicator', 'solution', 'red/orange', 'blue/purple', 'green', '1-14', 8, 'Use a colour chart for approximate pH.'],
  ['phenolphthalein', 'Phenolphthalein', 'solution', 'colourless', 'pink', 'colourless', '8.2-10', 10, 'Useful for base and neutralization demonstrations.'],
  ['methyl-orange', 'Methyl Orange', 'solution', 'red', 'yellow', 'orange', '3.1-4.4', 10, 'Shows acid to base transition from red to yellow.'],
].map(([id, name, indicatorType, acidColor, baseColor, neutralColor, pHRange, gradeLevel, usageNote]) => ({
  id, name, indicatorType, acidColor, baseColor, neutralColor, pHRange, gradeLevel, usageNote,
}));
