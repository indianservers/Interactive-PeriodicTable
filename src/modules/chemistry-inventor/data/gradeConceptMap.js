export const gradeConceptMap = {
  6: {
    title: 'Grade 6 Materials and Separation Foundations',
    concepts: ['Materials and properties', 'Soluble and insoluble substances', 'Mixtures', 'Handpicking', 'Sieving', 'Sedimentation', 'Decantation', 'Filtration', 'Evaporation', 'Air and water basics', 'Safe observation'],
  },
  7: {
    title: 'Grade 7 Chemistry Foundations',
    concepts: ['Mixtures', 'Solutions', 'Separation techniques', 'Physical and chemical changes', 'Acids and bases using indicators', 'Basic lab safety'],
  },
  8: {
    title: 'Grade 8 Reactions and Separation',
    concepts: ['Metals and non-metals', 'Combustion', 'Crystallization', 'Filtration', 'Evaporation', 'Gas tests', 'Simple reactions'],
  },
  9: {
    title: 'Grade 9 Atoms and Equations',
    concepts: ['Atoms', 'Molecules', 'Compounds', 'Chemical symbols', 'Chemical equations', 'Balancing', 'Laws of chemical combination', 'Simple pH'],
  },
  10: {
    title: 'Grade 10 Acids, Bases, Salts and Reactions',
    concepts: ['Acids, bases and salts', 'Neutralization', 'Precipitation', 'Carbonates', 'Metals reacting with acids', 'Reactivity series basics', 'Electrolysis basics', 'Chemical equation reasoning'],
  },
};

export const getGradeLevel = value => Number(String(value).replace(/\D/g, '')) || 6;
