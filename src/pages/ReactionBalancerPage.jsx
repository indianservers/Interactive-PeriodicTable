import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle, FlaskConical, Scale, Sigma } from 'lucide-react';
import { balanceEquation, parseFormula } from '../utils/chemistryTools.js';

const countSide = (compounds, coeffs, offset = 0) => {
  const totals = {};
  compounds.forEach((compound, index) => {
    const counts = parseFormula(compound);
    Object.entries(counts).forEach(([symbol, count]) => {
      totals[symbol] = (totals[symbol] || 0) + count * (coeffs[offset + index] || 1);
    });
  });
  return totals;
};

const MoleculeCard = ({ formula, coefficient }) => (
  <div className="rounded-xl bg-white/[0.04] border border-white/10 p-3 min-w-28">
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-cyan-200">{coefficient}</span>
      <span className="font-mono text-white">{formula}</span>
    </div>
    <div className="mt-2 flex flex-wrap gap-1">
      {Object.entries(parseFormula(formula)).map(([symbol, count]) => (
        <span key={symbol} className="rounded-lg bg-black/20 border border-white/10 px-2 py-0.5 text-[10px] text-gray-300">
          {symbol}:{count * coefficient}
        </span>
      ))}
    </div>
  </div>
);

export const ReactionBalancerPage = () => {
  const [equation, setEquation] = useState('H2 + O2 -> H2O');
  const balanced = useMemo(() => balanceEquation(equation), [equation]);
  const leftTotals = balanced.ok ? countSide(balanced.left, balanced.coefficients, 0) : {};
  const rightTotals = balanced.ok ? countSide(balanced.right, balanced.coefficients, balanced.left.length) : {};
  const atoms = [...new Set([...Object.keys(leftTotals), ...Object.keys(rightTotals)])];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-4">
      <div className="periodic-hero rounded-2xl border border-white/10 p-5">
        <div className="flex items-center gap-3">
          <FlaskConical size={24} className="text-cyan-300" />
          <div>
            <h2 className="text-xl font-black text-white">Reaction Equation Balancer</h2>
            <p className="text-sm text-gray-400">Type an unbalanced equation and watch atom conservation step into view.</p>
          </div>
        </div>
        <div className="mt-4 grid lg:grid-cols-[1fr_auto] gap-3">
          <input
            value={equation}
            onChange={event => setEquation(event.target.value)}
            className="input text-sm font-mono"
            placeholder="CH4 + O2 -> CO2 + H2O"
          />
          <button onClick={() => setEquation('Fe + O2 -> Fe2O3')} className="btn-secondary text-sm">Try Fe + O2</button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-4">
        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Scale size={16} className="text-emerald-300" />
            <h3 className="text-sm font-bold text-white">Balanced Visual</h3>
          </div>
          {balanced.ok ? (
            <>
              <p className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 px-4 py-3 font-mono text-emerald-100">
                {balanced.balanced}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {balanced.left.map((formula, index) => (
                  <MoleculeCard key={`${formula}-${index}`} formula={formula} coefficient={balanced.coefficients[index]} />
                ))}
                <ArrowRight className="text-gray-500" />
                {balanced.right.map((formula, index) => (
                  <MoleculeCard
                    key={`${formula}-${index}-right`}
                    formula={formula}
                    coefficient={balanced.coefficients[balanced.left.length + index]}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-red-500/10 border border-red-400/20 p-4 text-sm text-red-200">{balanced.error}</div>
          )}
        </section>

        <section className="glass rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sigma size={16} className="text-violet-300" />
            <h3 className="text-sm font-bold text-white">Step Check</h3>
          </div>
          {balanced.ok ? (
            <div className="space-y-3">
              {[
                'Split reactants and products at the arrow.',
                'Parse each formula into element counts.',
                `Solve coefficient ratio: ${balanced.coefficients.join(' : ')}.`,
                'Verify every element count matches on both sides.',
              ].map(step => (
                <div key={step} className="flex gap-2 rounded-xl bg-white/[0.04] border border-white/10 p-3 text-xs text-gray-300">
                  <CheckCircle size={14} className="text-emerald-300 flex-shrink-0 mt-0.5" />
                  {step}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Use an arrow like <span className="font-mono">-&gt;</span> and valid formulas.</p>
          )}
        </section>
      </div>

      {balanced.ok && (
        <section className="glass rounded-2xl p-5">
          <h3 className="text-sm font-bold text-white mb-3">Element Conservation Table</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {atoms.map(atom => {
              const ok = leftTotals[atom] === rightTotals[atom];
              return (
                <div key={atom} className={`rounded-xl border p-3 ${ok ? 'bg-cyan-500/10 border-cyan-400/20' : 'bg-red-500/10 border-red-400/20'}`}>
                  <p className="text-lg font-black text-white">{atom}</p>
                  <p className="text-xs text-gray-400 mt-1">Reactants {leftTotals[atom] || 0} = Products {rightTotals[atom] || 0}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};

export default ReactionBalancerPage;
