import { trendQuizProperties } from '../data/quizQuestions.js';

const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const getWrongOptions = (correct, all, key, count = 3) => {
  const pool = all.filter(e => e[key] !== correct[key] && e[key] !== null && e[key] !== undefined);
  return shuffle(pool).slice(0, count).map(e => e[key]);
};

export const generateQuizQuestion = (elements, quizType) => {
  const validElements = elements.filter(e =>
    e.atomicNumber <= 112 &&
    e.name && e.symbol && e.category
  );

  const el = shuffle(validElements)[0];

  switch (quizType) {
    case 'symbol-to-name': {
      const wrongs = shuffle(validElements.filter(e => e.name !== el.name)).slice(0, 3).map(e => e.name);
      return {
        question: `What element has the symbol "${el.symbol}"?`,
        options: shuffle([el.name, ...wrongs]),
        answer: el.name,
        element: el,
      };
    }
    case 'name-to-symbol': {
      const wrongs = shuffle(validElements.filter(e => e.symbol !== el.symbol)).slice(0, 3).map(e => e.symbol);
      return {
        question: `What is the chemical symbol for ${el.name}?`,
        options: shuffle([el.symbol, ...wrongs]),
        answer: el.symbol,
        element: el,
      };
    }
    case 'guess-category': {
      const allCategories = [...new Set(validElements.map(e => e.category))];
      const wrongs = shuffle(allCategories.filter(c => c !== el.category)).slice(0, 3);
      return {
        question: `What category does ${el.name} (${el.symbol}) belong to?`,
        options: shuffle([el.category, ...wrongs]),
        answer: el.category,
        element: el,
      };
    }
    case 'guess-atomic-number': {
      const correct = el.atomicNumber;
      const wrongs = shuffle(validElements.filter(e => e.atomicNumber !== correct))
        .slice(0, 3).map(e => e.atomicNumber);
      return {
        question: `What is the atomic number of ${el.name} (${el.symbol})?`,
        options: shuffle([correct, ...wrongs]).map(String),
        answer: String(correct),
        element: el,
      };
    }
    case 'identify-from-shells': {
      if (!el.shells || el.shells.length === 0) return generateQuizQuestion(elements, 'symbol-to-name');
      const shellStr = el.shells.join(', ');
      const wrongs = shuffle(validElements.filter(e => e.name !== el.name && e.shells && e.shells.join(',') !== el.shells.join(','))).slice(0, 3).map(e => e.name);
      return {
        question: `Which element has shell distribution [${shellStr}]?`,
        options: shuffle([el.name, ...wrongs]),
        answer: el.name,
        element: el,
      };
    }
    case 'compare-trend': {
      const prop = shuffle(trendQuizProperties)[0];
      const validPair = shuffle(validElements.filter(e => e[prop.id] !== null && e[prop.id] !== undefined));
      if (validPair.length < 2) return generateQuizQuestion(elements, 'symbol-to-name');
      const [a, b] = validPair.slice(0, 2);
      const winner = a[prop.id] > b[prop.id] ? a.name : b.name;
      return {
        question: `Which element has higher ${prop.label}?`,
        options: [a.name, b.name],
        answer: winner,
        element: a,
        context: `${a.name}: ${a[prop.id]} ${prop.unit} | ${b.name}: ${b[prop.id]} ${prop.unit}`,
      };
    }
    default:
      return generateQuizQuestion(elements, 'symbol-to-name');
  }
};

export const generateQuiz = (elements, count = 10) => {
  const types = ['symbol-to-name','name-to-symbol','guess-category','guess-atomic-number','identify-from-shells','compare-trend'];
  return Array.from({ length: count }, (_, i) => generateQuizQuestion(elements, types[i % types.length]));
};
