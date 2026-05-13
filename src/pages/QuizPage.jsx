import { QuizMode } from '../components/quiz/QuizMode.jsx';

export const QuizPage = () => (
  <div className="p-4 md:p-6 max-w-2xl mx-auto">
    <div className="mb-4">
      <h2 className="text-lg font-bold text-white mb-1">Quiz Mode</h2>
      <p className="text-sm text-gray-400">10-question multiple choice — test your periodic table knowledge.</p>
    </div>
    <QuizMode />
  </div>
);
export default QuizPage;
