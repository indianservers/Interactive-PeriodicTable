import { useMemo, useState } from 'react';
import { Timer, Trophy } from 'lucide-react';
import { moleculeLibrary, pointGroups } from '../data/moleculeData.js';
import { recordQuizAttempt } from '../utils/localProgressStore.js';

export function ChallengeModePanel({ molecule, onRandomMolecule, onProgress }) {
  const [guess, setGuess] = useState('');
  const [timerOn, setTimerOn] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const pool = useMemo(() => moleculeLibrary.filter(item => item.difficulty === molecule.difficulty || molecule.difficulty === 'Advanced'), [molecule]);

  const randomize = () => {
    const next = pool[Math.floor(Math.random() * pool.length)] || moleculeLibrary[Math.floor(Math.random() * moleculeLibrary.length)];
    onRandomMolecule(next.id);
    setGuess('');
    setFeedback(null);
  };

  const submit = () => {
    const correct = guess === molecule.pointGroup;
    const progress = recordQuizAttempt({ correct, moleculeId: molecule.id, mode: 'challenge' });
    onProgress?.(progress);
    setFeedback(correct ? 'Correct. Now justify it from the elements visible in the viewer.' : `Not quite. The expected point group is ${molecule.pointGroup}.`);
  };

  return (
    <section className="glass rounded-xl p-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-white">Challenge Mode</h3>
        <button onClick={() => setTimerOn(value => !value)} className={`rounded-lg border px-2 py-1 text-xs ${timerOn ? 'border-amber-400/30 bg-amber-400/10 text-amber-100' : 'border-white/10 text-gray-400'}`}>
          <Timer size={13} className="mr-1 inline" />
          Timer optional
        </button>
      </div>
      <div className="mt-3 space-y-3">
        <button onClick={randomize} className="btn-secondary w-full">Random Molecule</button>
        <label className="block text-xs text-gray-300">
          Complete point group
          <select value={guess} onChange={event => setGuess(event.target.value)} className="input mt-1 text-xs">
            <option value="">Choose point group</option>
            {pointGroups.map(group => <option key={group} value={group}>{group}</option>)}
          </select>
        </label>
        <button onClick={submit} className="btn-primary w-full">
          <Trophy size={15} className="mr-2 inline" />
          Score Challenge
        </button>
        {feedback && (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-gray-300">
            {feedback}
          </div>
        )}
      </div>
    </section>
  );
}

export default ChallengeModePanel;
