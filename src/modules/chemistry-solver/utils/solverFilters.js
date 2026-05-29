import { chemistrySolverQuestions, solverCategories } from '../data/questionBank.js';

export const difficultyOptions = ['All', 'Easy', 'Medium', 'Hard'];
export const examLevelOptions = ['All', 'Senior secondary', 'JEE Mains', 'JEE Advanced', 'NEET', 'IB', 'AP'];

export function getSubCategories(categoryId) {
  return solverCategories.find(category => category.id === categoryId)?.subCategories || [];
}

export function getQuestionCountsByCategory() {
  return Object.fromEntries(
    solverCategories.map(category => [
      category.id,
      chemistrySolverQuestions.filter(question => question.category === category.id).length,
    ]),
  );
}

export function getQuestionCountsBySubCategory(categoryId) {
  const subCategories = getSubCategories(categoryId);
  return Object.fromEntries(
    subCategories.map(subCategory => [
      subCategory,
      chemistrySolverQuestions.filter(question => question.category === categoryId && question.subCategory === subCategory).length,
    ]),
  );
}

export function filterQuestions({ categoryId, subCategory, query, difficulty, bookmarkedIds = [], showBookmarkedOnly = false, examLevel = 'All' }) {
  const q = query.trim().toLowerCase();
  const globalSearch = q.length > 0;
  return chemistrySolverQuestions.filter(question => {
    const matchesCategory = globalSearch || !categoryId || question.category === categoryId;
    const matchesSubCategory = globalSearch || !subCategory || question.subCategory === subCategory;
    const matchesDifficulty = !difficulty || difficulty === 'All' || question.difficulty === difficulty;
    const matchesBookmarks = !showBookmarkedOnly || bookmarkedIds.includes(question.id);
    const matchesExamLevel = !examLevel || examLevel === 'All' || question.examLevel === examLevel;
    const haystack = [
      question.title,
      question.question,
      question.category,
      question.subCategory,
      question.difficulty,
      question.examLevel,
      question.concept,
      question.finalAnswer,
      question.explanation,
      ...(question.tags || []),
      ...(question.relatedConcepts || []),
      ...(question.steps || []),
      ...(question.formulae || []),
      ...(question.commonMistakes || []),
    ].join(' ').toLowerCase();
    return matchesCategory && matchesSubCategory && matchesDifficulty && matchesBookmarks && matchesExamLevel && (!q || haystack.includes(q));
  });
}

export function buildPrintableSolution(question) {
  return `
    <html>
      <head>
        <title>${question.title}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 32px; line-height: 1.5; }
          h1 { margin-bottom: 4px; }
          h2 { margin-top: 24px; border-bottom: 1px solid #d1d5db; padding-bottom: 6px; }
          li { margin: 6px 0; }
          .meta { color: #4b5563; }
          .answer { border: 1px solid #c7d2fe; background: #eef2ff; padding: 12px; border-radius: 10px; font-weight: 700; }
        </style>
      </head>
      <body>
        <h1>${question.title}</h1>
        <p class="meta">${question.category} | ${question.subCategory} | ${question.difficulty} | ${question.estimatedTime}</p>
        <h2>Question</h2>
        <p>${question.question}</p>
        <h2>Concept</h2>
        <p>${question.concept}</p>
        <h2>Given Data</h2>
        <ul>${question.givenData.map(item => `<li>${item}</li>`).join('')}</ul>
        <h2>Formula Used</h2>
        <ul>${question.formulae.map(item => `<li>${item}</li>`).join('')}</ul>
        <h2>Step-by-step Solution</h2>
        <ol>${question.steps.map(item => `<li>${item}</li>`).join('')}</ol>
        <h2>Final Answer</h2>
        <p class="answer">${question.finalAnswer}</p>
        <h2>Explanation</h2>
        <p>${question.explanation}</p>
        <h2>Common Mistakes</h2>
        <ul>${question.commonMistakes.map(item => `<li>${item}</li>`).join('')}</ul>
        <h2>Practice Extensions</h2>
        <ul>${question.practiceExtensions.map(item => `<li>${item}</li>`).join('')}</ul>
      </body>
    </html>
  `;
}
