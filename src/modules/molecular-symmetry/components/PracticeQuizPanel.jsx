import { useMemo, useState } from 'react';
import { Check, X } from 'lucide-react';
import { getPointGroupOptions } from '../utils/pointGroupRules.js';
import { recordQuizAttempt } from '../utils/localProgressStore.js';

export function PracticeQuizPanel({ molecule, selectedElement, validationResult, onProgress }) {
  const [answers, setAnswers] = useState({ pointGroup: '', inversion: '', improper: '' });
  const [feedback, setFeedback] = useState(null);
  const options = useMemo(() => getPointGroupOptions(molecule.pointGroup), [molecule]);
  const hasInversion = molecule.symmetryElements.some(element => element.type === 'i');
  const hasImproper = molecule.symmetryElements.some(element => element.type === 'Sn');

  const submit = () => {
    const checks = [
      answers.pointGroup === molecule.pointGroup,
      answers.inversion === String(hasInversion),
      answers.improper === String(hasImproper),
    ];
    const correct = checks.filter(Boolean).length;
    const result = recordQuizAttempt({ correct: correct === checks.length, moleculeId: molecule.id, mode: 'practice' });
    setFeedback({ correct, total: checks.length });
    onProgress?.(result);
  };

  return (
    <section className="glass rounded-xl p-3">
      <h3 className="text-sm font-bold text-white">Practice Mode</h3>
      <div className="mt-3 space-y-3">
        <label className="block text-xs text-gray-300">
          Determine the point group
          <select value={answers.pointGroup} onChange={event => setAnswers(prev => ({ ...prev, pointGroup: event.target.value }))} className="input mt-1 text-xs">
            <option value="">Choose point group</option>
            {options.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <label className="block text-xs text-gray-300">
          Does the molecule have an inversion centre?
          <select value={answers.inversion} onChange={event => setAnswers(prev => ({ ...prev, inversion: event.target.value }))} className="input mt-1 text-xs">
            <option value="">Choose</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        <label className="block text-xs text-gray-300">
          Does it have an improper rotation axis?
          <select value={answers.improper} onChange={event => setAnswers(prev => ({ ...prev, improper: event.target.value }))} className="input mt-1 text-xs">
            <option value="">Choose</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </label>
        {selectedElement && validationResult && (
          <div className={`rounded-lg border p-2 text-xs ${validationResult.valid ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-100' : 'border-rose-400/25 bg-rose-400/10 text-rose-100'}`}>
            Operation check for {selectedElement.label}: {validationResult.valid ? 'valid' : 'not valid'}
          </div>
        )}
        <button onClick={submit} className="btn-primary w-full">Submit Answers</button>
        {feedback && (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs text-gray-200">
            <div className="flex items-center gap-2">
              {feedback.correct === feedback.total ? <Check size={15} className="text-emerald-300" /> : <X size={15} className="text-rose-300" />}
              Score: {feedback.correct}/{feedback.total}
            </div>
            <p className="mt-1 text-gray-400">Correct point group: {molecule.pointGroup}. {molecule.notes}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default PracticeQuizPanel;
