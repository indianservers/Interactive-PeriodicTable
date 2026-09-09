import { useMemo, useState } from "react";
import {
  Atom,
  Beaker,
  Check,
  ChevronDown,
  ChevronUp,
  Droplets,
  Flame,
  Lightbulb,
  Network,
  Play,
  RotateCcw,
} from "lucide-react";
import "./reactionBalancerTarget.css";
const types = [
  ["Combustion", "Hydrocarbon + O₂ → CO₂ + H₂O", Flame],
  ["Redox", "Electron transfer reactions", Beaker],
  ["Acid–base", "Proton transfer reactions", Droplets],
  ["Ionic", "Spectator ions and net ionic", Network],
];
const examples = [
  "Methane combustion",
  "Propane combustion",
  "Ethanol combustion",
  "Iron + oxygen (rust)",
  "Zinc + hydrochloric acid",
  "Acetic acid + sodium hydroxide",
  "Silver nitrate + sodium chloride",
];
const species = [
  ["CH₄", "Methane", "mol-ch4"],
  ["O₂", "Oxygen", "mol-o2"],
  ["CO₂", "Carbon dioxide", "mol-co2"],
  ["H₂O", "Water", "mol-h2o"],
];
export const ReactionBalancerTargetPage = () => {
  const [coef, setCoef] = useState([1, 2, 1, 2]),
    [playing, setPlaying] = useState(false),
    [slow, setSlow] = useState(false),
    [hint, setHint] = useState(0);
  const counts = useMemo(
    () => ({
      C: [coef[0], coef[2]],
      H: [4 * coef[0], 2 * coef[3]],
      O: [2 * coef[1], 2 * coef[2] + coef[3]],
    }),
    [coef],
  );
  const balanced = Object.values(counts).every(([a, b]) => a === b);
  const change = (i, d) =>
    setCoef((c) =>
      c.map((x, j) => (j === i ? Math.max(1, Math.min(9, x + d)) : x)),
    );
  return (
    <div className="rbal">
      <header>
        <Atom />
        <h1>Reaction Balancer</h1>
        <span>│　Conservation of atoms</span>
        <i>Same atoms. A cleaner tomorrow.</i>
      </header>
      <aside className="rb-left">
        <h2>Reaction Presets</h2>
        {types.map(([name, sub, Icon], i) => (
          <button className={i === 0 ? "active" : ""} key={name}>
            <Icon />
            <span>
              <b>{name}</b>
              <small>{sub}</small>
            </span>
          </button>
        ))}
        <hr />
        <p>Examples</p>
        {examples.map((x, i) => (
          <button className={`rb-example ${i === 0 ? "active" : ""}`} key={x}>
            {x}
          </button>
        ))}
        <blockquote>
          “In a chemical reaction, nothing is lost, nothing is created,
          everything is transformed.”
          <br />— Antoine Lavoisier
        </blockquote>
      </aside>
      <main>
        <section className="rb-equation">
          {species.map(([formula, name, kind], i) => (
            <div className="rb-species" key={formula}>
              <div className={`rb-molecule ${kind}`}>
                {Array.from({ length: kind === 'mol-ch4' ? 5 : kind === 'mol-o2' ? 2 : 3 }, (_, atom) => <i key={atom} />)}
              </div>
              <div className="rb-coef">
                <b>{coef[i]}</b>
                <span>
                  <button onClick={() => change(i, 1)}>
                    <ChevronUp />
                  </button>
                  <button onClick={() => change(i, -1)}>
                    <ChevronDown />
                  </button>
                </span>
              </div>
              <h2>{formula}</h2>
              <p>
                {name}
                <small>(g)</small>
              </p>
              {i === 0 || i === 2 ? (
                <strong>+</strong>
              ) : i === 1 ? (
                <strong className="arrow">➜</strong>
              ) : null}
            </div>
          ))}
        </section>
        <section className="rb-count">
          <h2>
            Atom count <span>(conservation of atoms)</span>
          </h2>
          <div className="rb-table">
            <b>Element</b>
            <b>Reactants (total)</b>
            <b>Products (total)</b>
            <b>Balanced?</b>
            {Object.entries(counts).flatMap(([el, [r, p]]) => [
              <span key={`${el}e`}>{el}</span>,
              <span key={`${el}r`}>{r}</span>,
              <span key={`${el}p`}>{p}</span>,
              <span key={`${el}b`}>{r === p ? "✓" : "×"}</span>,
            ])}
          </div>
          <div className={`rb-status ${balanced ? "ok" : ""}`}>
            <Check />
            <b>{balanced ? "Balanced" : "Not balanced"}</b>
            <span>
              {balanced
                ? "Conservation of atoms satisfied."
                : "Adjust coefficients."}
              <br />
              Total atoms (each side):{" "}
              {Object.values(counts).reduce((s, x) => s + x[0], 0)}
            </span>
          </div>
        </section>
        <section
          className={`rb-visual ${playing ? "playing" : ""} ${slow ? "slow" : ""}`}
        >
          <h2>Visualize reaction</h2>
          <div className="rb-chamber">
            {Array.from({ length: 14 }, (_, i) => (
              <i
                style={{
                  "--x": `${8 + ((i * 17) % 88)}%`,
                  "--y": `${15 + ((i * 29) % 70)}%`,
                  "--d": `${i * 0.07}s`,
                }}
                key={i}
              />
            ))}
          </div>
          <footer>
            <button onClick={() => setPlaying((v) => !v)}>
              <Play />
            </button>
            <button
              className={slow ? "on" : ""}
              onClick={() => setSlow((v) => !v)}
            >
              <i />
              Slow motion
            </button>
            <input type="range" min="0" max="30" defaultValue="12" />
            <span>0.8 / 3.0 s</span>
            <button onClick={() => setPlaying(false)}>
              <RotateCcw />
              Reset
            </button>
          </footer>
        </section>
      </main>
      <aside className="rb-right">
        <h2>Mass and other checks</h2>
        <dl>
          <dt>
            Reactants total mass<small>(1 CH₄ + 2 O₂)</small>
          </dt>
          <dd>80.04 g</dd>
          <dt>
            Products total mass<small>(1 CO₂ + 2 H₂O)</small>
          </dt>
          <dd>80.04 g</dd>
        </dl>
        <p className="rb-green">
          <Check />
          Mass conserved
        </p>
        <hr />
        <h3>
          Limiting reagent <small>(optional)</small>
        </h3>
        <button className="rb-toggle">
          <i />
          Find limiting reagent
        </button>
        <p>Enter amounts to determine which reactant is consumed first.</p>
        <hr />
        <h3>Charge check</h3>
        <dl>
          <dt>Total charge (reactants)</dt>
          <dd>0</dd>
          <dt>Total charge (products)</dt>
          <dd>0</dd>
        </dl>
        <p className="rb-green">
          <Check />
          Charge conserved
        </p>
        <hr />
        <h2>Step-by-step hints</h2>
        <button
          className="rb-hint"
          onClick={() => setHint((h) => Math.min(5, h + 1))}
        >
          <Lightbulb />
          Show one hint
        </button>
        {[
          "Identify the elements (C, H, O).",
          "Balance carbon (1 CO₂).",
          "Balance hydrogen (2 H₂O).",
          "Balance oxygen (2 O₂).",
          "Check atom counts and masses.",
        ].map((x, i) => (
          <p className={i < hint ? "shown" : ""} key={x}>
            <b>{i + 1}</b>
            {x}
          </p>
        ))}
      </aside>
    </div>
  );
};
export default ReactionBalancerTargetPage;
