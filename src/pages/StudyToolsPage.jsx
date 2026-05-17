import { useMemo, useState } from 'react';
import { BookOpen, CheckCircle, Clock3, RadioTower, Repeat, Ruler, Trophy } from 'lucide-react';
import { elements } from '../data/elements.js';
import { getCategoryInfo } from '../data/categories.js';
import { ElementDetailsDrawer } from '../components/elements/ElementDetailsDrawer.jsx';
import { molarMass } from '../utils/chemistryTools.js';

const namedReactions = [
  { name: 'Haber Process', reagents: 'N2 + 3H2', conditions: 'Fe catalyst, 400-500 C, high pressure', product: 'NH3', steps: ['Adsorption on iron', 'N-H bond formation', 'Ammonia desorption'] },
  { name: 'Ostwald Process', reagents: 'NH3 + O2', conditions: 'Pt-Rh catalyst, 800-900 C', product: 'HNO3', steps: ['NH3 oxidizes to NO', 'NO forms NO2', 'NO2 absorbs in water'] },
  { name: 'Contact Process', reagents: 'SO2 + O2', conditions: 'V2O5 catalyst, about 450 C', product: 'H2SO4 via SO3', steps: ['SO2 oxidation', 'SO3 absorption in oleum', 'Dilution to sulfuric acid'] },
  { name: 'Sandmeyer Reaction', reagents: 'Aryl diazonium salt + CuX', conditions: 'CuCl, CuBr, or CuCN', product: 'Aryl halide or nitrile', steps: ['Diazotization', 'Copper-assisted substitution', 'N2 leaves'] },
  { name: 'Cannizzaro Reaction', reagents: 'Aldehyde without alpha-H', conditions: 'Concentrated base', product: 'Alcohol + carboxylate', steps: ['Hydride transfer', 'Disproportionation', 'Acid workup if needed'] },
];

const metrics = [
  ['electronegativity', 'higher electronegativity'],
  ['ionizationEnergy', 'higher ionization energy'],
  ['atomicRadius', 'larger atomic radius'],
];

const randomElementWith = metric => {
  const pool = elements.filter(el => typeof el[metric] === 'number');
  return pool[Math.floor(Math.random() * pool.length)];
};

const makeQuestion = metric => {
  let a = randomElementWith(metric);
  let b = randomElementWith(metric);
  while (a.atomicNumber === b.atomicNumber || a[metric] === b[metric]) b = randomElementWith(metric);
  return { a, b, metric };
};

const convert = ({ type, value, formula }) => {
  const n = Number(value) || 0;
  const mass = Math.max(0.0001, molarMass(formula || 'H2O'));
  if (type === 'mol-g') return `${(n * mass).toFixed(4)} g`;
  if (type === 'g-mol') return `${(n / mass).toFixed(4)} mol`;
  if (type === 'L-mL') return `${(n * 1000).toFixed(2)} mL`;
  if (type === 'mL-L') return `${(n / 1000).toFixed(4)} L`;
  if (type === 'atm-kPa') return `${(n * 101.325).toFixed(3)} kPa`;
  if (type === 'kPa-atm') return `${(n / 101.325).toFixed(5)} atm`;
  if (type === 'atm-torr') return `${(n * 760).toFixed(2)} torr`;
  if (type === 'torr-atm') return `${(n / 760).toFixed(5)} atm`;
  if (type === 'C-K') return `${(n + 273.15).toFixed(2)} K`;
  return `${(n - 273.15).toFixed(2)} C`;
};

export const StudyToolsPage = ({ favorites = [], onFavoriteToggle = () => {}, onViewAtom = () => {}, onCompare = () => {}, reducedMotion }) => {
  const [metric, setMetric] = useState('electronegativity');
  const [question, setQuestion] = useState(() => makeQuestion('electronegativity'));
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('Pick the element with the stronger trend value.');
  const [reactionIndex, setReactionIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [converter, setConverter] = useState({ type: 'mol-g', value: 1, formula: 'H2O' });
  const [selectedElement, setSelectedElement] = useState(null);

  const timeline = useMemo(() => elements.filter(el => el.yearDiscovered).sort((a, b) => a.yearDiscovered - b.yearDiscovered), []);
  const currentReaction = namedReactions[reactionIndex];
  const metricLabel = metrics.find(item => item[0] === question.metric)?.[1] || 'higher value';

  const answer = choice => {
    const other = choice.atomicNumber === question.a.atomicNumber ? question.b : question.a;
    const correct = choice[question.metric] > other[question.metric];
    setScore(points => Math.max(0, points + (correct ? 10 : -5)));
    setStreak(run => correct ? run + 1 : 0);
    setFeedback(correct ? `Correct: ${choice.symbol} has ${choice[question.metric]}.` : `Not this one: ${other.symbol} has ${other[question.metric]}.`);
    setQuestion(makeQuestion(question.metric));
  };

  const changeMetric = next => {
    setMetric(next);
    setQuestion(makeQuestion(next));
    setFeedback('New trend loaded.');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-4">
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <Trophy size={24} className="text-amber-300" />
          <div>
            <h2 className="text-xl font-black text-white">Exam Prep and Chemistry Utilities</h2>
            <p className="text-sm text-gray-400">Trend race, named reactions, unit conversion, and discovery timeline in one focused workspace.</p>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1fr_0.9fr] gap-4">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2"><Clock3 size={16} className="text-cyan-300" /><h3 className="text-sm font-bold text-white">Periodic Trends Race</h3></div>
            <div className="text-xs text-gray-400">Score {score} - Streak {streak}</div>
          </div>
          <select value={metric} onChange={event => changeMetric(event.target.value)} className="input text-sm mb-4">
            {metrics.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
          </select>
          <p className="text-sm text-gray-300 mb-3">Which has {metricLabel}?</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[question.a, question.b].map(el => {
              const cat = getCategoryInfo(el.category);
              return (
                <button key={el.atomicNumber} onClick={() => answer(el)} className="rounded-2xl bg-white/[0.04] border border-white/10 p-4 text-left hover:bg-white/[0.08] transition-colors">
                  <span className="inline-flex w-14 h-14 rounded-xl border items-center justify-center text-2xl font-black" style={{ color: cat.color, borderColor: `${cat.color}55`, background: `${cat.color}18` }}>{el.symbol}</span>
                  <p className="mt-3 font-bold text-white">{el.name}</p>
                  <p className="text-xs text-gray-500">{el.category}</p>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-cyan-200">{feedback}</p>
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2"><BookOpen size={16} className="text-violet-300" /><h3 className="text-sm font-bold text-white">Named Reactions Flashcards</h3></div>
            <button onClick={() => setShowBack(v => !v)} className="btn-secondary text-xs"><Repeat size={13} /> Flip</button>
          </div>
          <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 min-h-56">
            <p className="text-2xl font-black text-white">{currentReaction.name}</p>
            {showBack ? (
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <p><span className="text-cyan-300 font-semibold">Reagents:</span> {currentReaction.reagents}</p>
                <p><span className="text-emerald-300 font-semibold">Conditions:</span> {currentReaction.conditions}</p>
                <p><span className="text-amber-300 font-semibold">Product:</span> {currentReaction.product}</p>
                <div className="space-y-1">{currentReaction.steps.map(step => <p key={step} className="flex gap-2 text-xs"><CheckCircle size={13} className="text-violet-300 flex-shrink-0" />{step}</p>)}</div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-400">Recall reagents, conditions, product, and mechanism outline before flipping.</p>
            )}
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {namedReactions.map((reaction, index) => (
              <button key={reaction.name} onClick={() => { setReactionIndex(index); setShowBack(false); }} className={`rounded-lg px-2 py-2 text-[10px] ${index === reactionIndex ? 'bg-violet-500/20 text-violet-200' : 'bg-white/[0.04] text-gray-500'}`}>
                {index + 1}
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="grid xl:grid-cols-[0.75fr_1.25fr] gap-4">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4"><Ruler size={16} className="text-emerald-300" /><h3 className="text-sm font-bold text-white">Chemistry Unit Converter</h3></div>
          <div className="grid gap-3">
            <select value={converter.type} onChange={event => setConverter(v => ({ ...v, type: event.target.value }))} className="input text-sm">
              {['mol-g', 'g-mol', 'L-mL', 'mL-L', 'atm-kPa', 'kPa-atm', 'atm-torr', 'torr-atm', 'C-K', 'K-C'].map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <input type="number" value={converter.value} onChange={event => setConverter(v => ({ ...v, value: event.target.value }))} className="input text-sm" />
            {(converter.type === 'mol-g' || converter.type === 'g-mol') && (
              <input value={converter.formula} onChange={event => setConverter(v => ({ ...v, formula: event.target.value }))} className="input text-sm font-mono" />
            )}
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-4">
              <p className="text-[10px] uppercase tracking-widest text-emerald-300">Converted value</p>
              <p className="text-2xl font-black text-white mt-1">{convert(converter)}</p>
            </div>
          </div>
        </section>

        <section className="glass rounded-2xl p-5 overflow-hidden">
          <div className="flex items-center gap-2 mb-4"><RadioTower size={16} className="text-cyan-300" /><h3 className="text-sm font-bold text-white">Element Discovery Timeline</h3></div>
          <div className="overflow-x-auto pb-3 scrollbar-thin">
            <div className="flex gap-3 min-w-max">
              {timeline.map(el => {
                const cat = getCategoryInfo(el.category);
                return (
                  <button key={el.atomicNumber} onClick={() => setSelectedElement(el)} className="w-36 rounded-xl bg-white/[0.04] border border-white/10 p-3 text-left hover:bg-white/[0.08] transition-colors">
                    <span className="text-[10px] font-mono text-gray-500">{el.yearDiscovered}</span>
                    <p className="mt-1 text-lg font-black" style={{ color: cat.color }}>{el.symbol}</p>
                    <p className="text-xs text-white truncate">{el.name}</p>
                    <div className="mt-2 h-1 rounded-full" style={{ background: cat.color }} />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {selectedElement && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelectedElement(null)} />
          <div className="relative w-full max-w-md h-full bg-gray-950 border-l border-white/10 drawer-slide-in">
            <ElementDetailsDrawer
              element={selectedElement}
              onClose={() => setSelectedElement(null)}
              onFavoriteToggle={onFavoriteToggle}
              isFavorite={favorites.some(item => item.atomicNumber === selectedElement.atomicNumber)}
              onViewAtom={onViewAtom}
              onCompare={onCompare}
              reducedMotion={reducedMotion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyToolsPage;
