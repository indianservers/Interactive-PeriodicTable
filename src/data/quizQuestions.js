export const quizTypes = [
  { id: "symbol-to-name", label: "Name from Symbol", description: "Given a symbol, identify the element name" },
  { id: "name-to-symbol", label: "Symbol from Name", description: "Given a name, identify the element symbol" },
  { id: "guess-category", label: "Guess Category", description: "Identify the category of an element" },
  { id: "guess-atomic-number", label: "Atomic Number", description: "Guess the atomic number of an element" },
  { id: "identify-from-shells", label: "Identify from Shells", description: "Identify element from its electron shell distribution" },
  { id: "compare-trend", label: "Compare Trends", description: "Which element has higher electronegativity/radius/ionization?" },
];

export const trendQuizProperties = [
  { id: "electronegativity", label: "electronegativity", unit: "Pauling" },
  { id: "atomicRadius", label: "atomic radius", unit: "pm" },
  { id: "ionizationEnergy", label: "ionization energy", unit: "kJ/mol" },
  { id: "atomicMass", label: "atomic mass", unit: "u" },
];

export default quizTypes;
