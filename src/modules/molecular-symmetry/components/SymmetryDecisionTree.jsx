import { decisionTreeQuestions } from '../utils/pointGroupRules.js';

export function SymmetryDecisionTree({ molecule }) {
  return (
    <section className="glass rounded-xl p-3">
      <h3 className="text-sm font-bold text-white">Decision Tree</h3>
      <div className="mt-3 space-y-2">
        {decisionTreeQuestions.map((question, index) => {
          const active = index < molecule.pointGroupReasoning.length;
          return (
            <div key={question} className={`rounded-lg border p-2 ${active ? 'border-cyan-400/25 bg-cyan-400/10' : 'border-white/10 bg-white/[0.025]'}`}>
              <p className="text-[11px] font-semibold text-gray-200">{question}</p>
              {active && <p className="mt-1 text-[11px] text-gray-400">{molecule.pointGroupReasoning[index]}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SymmetryDecisionTree;
