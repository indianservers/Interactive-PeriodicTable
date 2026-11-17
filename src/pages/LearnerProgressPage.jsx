import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { learningUnits } from './LearningLesson.jsx';

export default function LearnerProgressPage({ onNavigate }) {
  const [stored] = useLocalStorage('chemistry-lessons-completed', []);
  const done = Array.isArray(stored) ? stored : [];
  const units = Object.entries(learningUnits).map(([name, unit]) => ({name, total:unit.lessons.length, complete:unit.lessons.filter((_,i)=>done.includes(`${name}:${i}`)).length}));
  const total = units.reduce((n,u)=>n+u.total,0), complete=units.reduce((n,u)=>n+u.complete,0);
  return <section className="mx-auto max-w-5xl space-y-6 p-5 text-slate-100"><h1 className="text-3xl font-bold">Your learning progress</h1><p>Saved on this device. Complete lesson assessments to update these results.</p><div className="rounded-xl border border-white/15 bg-slate-900 p-5"><strong className="text-3xl">{complete} / {total}</strong><p>Lessons completed · {Math.round(100*complete/total)}%</p><progress aria-label="Overall lesson completion" className="mt-3 w-full" max={total} value={complete}/></div><div className="grid gap-4 sm:grid-cols-2">{units.map(u=><article key={u.name} className="rounded-xl border border-white/15 bg-slate-900 p-4"><h2 className="font-bold">{u.name}</h2><p>{u.complete} of {u.total} lessons completed</p><progress className="my-3 w-full" aria-label={`${u.name} completion`} max={u.total} value={u.complete}/><button className="rounded border border-cyan-300 px-3 py-2" onClick={()=>onNavigate('syllabus')}>Continue learning</button></article>)}</div></section>;
}
