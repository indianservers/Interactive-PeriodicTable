const KEY = 'cu-molecular-symmetry-progress';

export function loadSymmetryProgress() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { score: 0, attempts: 0, completed: [], challengeBest: 0 };
  } catch {
    return { score: 0, attempts: 0, completed: [], challengeBest: 0 };
  }
}

export function saveSymmetryProgress(progress) {
  localStorage.setItem(KEY, JSON.stringify(progress));
  return progress;
}

export function recordQuizAttempt({ correct, moleculeId, mode = 'practice' }) {
  const current = loadSymmetryProgress();
  const nextScore = current.score + (correct ? 1 : 0);
  const next = {
    ...current,
    score: nextScore,
    attempts: current.attempts + 1,
    completed: Array.from(new Set([...(current.completed || []), moleculeId].filter(Boolean))),
    challengeBest: mode === 'challenge' ? Math.max(current.challengeBest || 0, nextScore) : current.challengeBest || 0,
    updatedAt: new Date().toISOString(),
  };
  return saveSymmetryProgress(next);
}

export function resetSymmetryProgress() {
  const empty = { score: 0, attempts: 0, completed: [], challengeBest: 0 };
  return saveSymmetryProgress(empty);
}
