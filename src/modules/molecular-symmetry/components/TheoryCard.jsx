import { symmetryTheoryCards } from '../data/moleculeData.js';

export function TheoryCard({ type = 'E' }) {
  const card = symmetryTheoryCards[type] || symmetryTheoryCards.E;
  return (
    <section className="glass rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Theory Card</p>
      <h3 className="mt-1 text-sm font-bold text-white">{card.title}</h3>
      <p className="mt-2 text-xs leading-5 text-gray-300">{card.body}</p>
      {card.test && (
        <p className="mt-2 rounded-lg border border-cyan-400/20 bg-cyan-400/10 p-2 text-[11px] leading-5 text-cyan-50">
          {card.test}
        </p>
      )}
      {card.example && (
        <p className="mt-2 text-[11px] leading-5 text-gray-400">{card.example}</p>
      )}
    </section>
  );
}

export default TheoryCard;
