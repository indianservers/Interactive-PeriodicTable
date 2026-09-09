import { useEffect, useMemo, useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  FlaskConical,
  Home,
  Lightbulb,
  NotebookPen,
  Play,
  RotateCcw,
  Settings,
} from "lucide-react";
import "./ReactionLeftoversPage.css";

const colors = {
  H: "#eef5ff",
  O: "#ee303d",
  N: "#258cff",
  Cl: "#42d872",
  C: "#596779",
};
const recipes = {
  water: {
    equation: (
      <>
        <b>
          2H<sub>2</sub>
        </b>{" "}
        +{" "}
        <b>
          O<sub>2</sub>
        </b>{" "}
        →{" "}
        <b>
          2H<sub>2</sub>O
        </b>
      </>
    ),
    aName: "H₂",
    bName: "O₂",
    product: "H₂O",
    a: 2,
    b: 1,
    p: 2,
    aAtoms: ["H", "H"],
    bAtoms: ["O", "O"],
    pAtoms: ["H", "O", "H"],
  },
  ammonia: {
    equation: <>N₂ + 3H₂ → 2NH₃</>,
    aName: "N₂",
    bName: "H₂",
    product: "NH₃",
    a: 1,
    b: 3,
    p: 2,
    aAtoms: ["N", "N"],
    bAtoms: ["H", "H"],
    pAtoms: ["H", "N", "H", "H"],
  },
};
const molarMass = { 'H₂': 2.02, 'O₂': 32.00, 'H₂O': 18.02, 'N₂': 28.02, 'NH₃': 17.03 };
const particleMole = 1 / 600;
function Molecule({ atoms, small = false }) {
  return (
    <span className={`rl-molecule ${small ? "small" : ""}`}>
      {atoms.map((a, i) => (
        <i
          key={i}
          style={{
            "--atom": colors[a],
            left: `${i * 15}px`,
            top: a === "O" ? 0 : (i % 2) * 8,
          }}
        />
      ))}
    </span>
  );
}
function Count({ value, onChange }) {
  return (
    <div className="rl-count">
      <button onClick={() => onChange(Math.max(0, value - 1))}>−</button>
      <b>{value} molecules</b>
      <button onClick={() => onChange(Math.min(14, value + 1))}>+</button>
    </div>
  );
}
export default function ReactionLeftoversPage() {
  const [id, setId] = useState("water"),
    [a, setA] = useState(8),
    [b, setB] = useState(5),
    [status, setStatus] = useState("after"),
    [section, setSection] = useState("Reactions");
  const r = recipes[id];
  const result = useMemo(() => {
    const batches = Math.min(Math.floor(a / r.a), Math.floor(b / r.b));
    return {
      products: batches * r.p,
      aLeft: a - batches * r.a,
      bLeft: b - batches * r.b,
      limiting: a / r.a <= b / r.b ? r.aName : r.bName,
    };
  }, [a, b, r]);
  const excessSpecies = result.aLeft ? r.aName : result.bLeft ? r.bName : "none";
  const tableRows = useMemo(() => {
    const reactedA = a - result.aLeft;
    const reactedB = b - result.bLeft;
    return [
      [r.aName, reactedA, molarMass[r.aName] || 1],
      [r.bName, result.bLeft, molarMass[r.bName] || 1],
      [r.product, result.products, molarMass[r.product] || 1],
    ].map(([species, count, mass]) => { const moles = count * particleMole; return { species, count, moles, mass, grams: moles * mass }; });
  }, [a, result, r]);
  useEffect(() => {
    if (status !== "running") return;
    const t = setTimeout(() => setStatus("after"), 900);
    return () => clearTimeout(t);
  }, [status]);
  const setAmount = (which, v) => {
    which === "a" ? setA(v) : setB(v);
    setStatus("before");
  };
  const reset = () => {
    setA(8);
    setB(5);
    setStatus("before");
  };
  return (
    <div className="rl-app">
      <header>
        <FlaskConical />
        <div>
          <b>ChemLab</b>
          <small>Explore · Balance · Understand</small>
        </div>
        <h1>
          Reactants, Products &amp; Leftovers
          <small>
            Build a mixture, run the reaction, and see which reactant limits how
            much product can form.
          </small>
        </h1>
        <span>
          ⚗ Chemistry Explorer<small>Make molecules make sense.</small>
        </span>
        <i>CE</i>
      </header>
      <aside>
        {[
          [Home, "Home"],
          [FlaskConical, "Reactions"],
          [Atom, "Molecular Models"],
          [BarChart3, "Stoichiometry"],
          [FlaskConical, "Lab Tools"],
          [NotebookPen, "Reference"],
          [Settings, "Settings"],
        ].map(([I, n], i) => (
          <button className={section === n || (i === 1 && section === "Reactions") ? "active" : ""} key={n} onClick={() => setSection(n)}>
            <I />
            {n}
          </button>
        ))}
        <p>
          Small
          <br />
          Particles.
          <br />
          Big Answers.
        </p>
      </aside>
      <main>
        <section className="rl-choose">
          <h2>1. Choose reactant amounts</h2>
          <p>Add or remove molecules (batches are draggable).</p>
          <div className="rl-recipe-switcher" aria-label="Reaction recipe">
            <span>Reaction:</span>
            {Object.entries(recipes).map(([recipeId, recipe]) => <button key={recipeId} className={id === recipeId ? "active" : ""} onClick={() => { setId(recipeId); setStatus("before"); }}>{recipeId === "water" ? "Water formation" : "Ammonia synthesis"}</button>)}
          </div>
          <div className="rl-jars">
            {[
              [r.aName, r.aAtoms, a, "a"],
              [r.bName, r.bAtoms, b, "b"],
            ].map(([name, atoms, n, k]) => (
              <article key={k}>
                <h3>
                  {k === "a" ? "Hydrogen" : "Oxygen"} ({name})
                </h3>
                <Molecule atoms={atoms} />
                <Count value={n} onChange={(v) => setAmount(k, v)} />
                <div className="rl-jar">
                  {Array.from({ length: n }, (_, i) => (
                    <Molecule key={i} atoms={atoms} small />
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rl-center">
          <div className="rl-equation">
            {r.equation}
            <small>
              Build, react, analyze
              <br />
              At the particle level.
            </small>
          </div>
          <article className={`rl-tray ${status}`}>
            <h2>
              2. Reaction tray <small>(drag molecules, then run)</small>
            </h2>
            <div className="rl-tray-inner">
              <div>
                <b>Reactants</b>
                <div className="rl-particles">
                  {Array.from({ length: a }, (_, i) => (
                    <Molecule key={"a" + i} atoms={r.aAtoms} />
                  ))}
                </div>
                <div className="rl-particles oxygen">
                  {Array.from({ length: b }, (_, i) => (
                    <Molecule key={"b" + i} atoms={r.bAtoms} />
                  ))}
                </div>
              </div>
              <strong>{r.equation}</strong>
              <div>
                <b>Products (after reaction)</b>
                <div className="rl-particles products">
                  {status === "after" &&
                    Array.from({ length: result.products }, (_, i) => (
                      <Molecule key={i} atoms={r.pAtoms} />
                    ))}
                </div>
                {status === "after" && (
                  <em>
                    {result.products} {r.product} molecules
                  </em>
                )}
                <div className="rl-leftover">
                  {status === "after" &&
                    Array.from({ length: result.bLeft }, (_, i) => (
                      <Molecule key={i} atoms={r.bAtoms} />
                    ))}
                  <small>
                    {status === "after" && result.bLeft
                      ? `${result.bLeft} ${r.bName} leftover`
                      : ""}
                  </small>
                </div>
              </div>
            </div>
          </article>
          <div className="rl-actions">
            <button onClick={() => setStatus("running")}>
              <Play />
              Run reaction
            </button>
            <button onClick={reset}>
              <RotateCcw />
              Reset mixture
            </button>
          </div>
        </section>
        <section className="rl-analysis">
          <h2>3. Limiting reactant analysis</h2>
          <div className="rl-limit">
            <FlaskConical />
            <b>Limiting reactant: {result.limiting}</b>
            <span>
              {result.limiting} is used up first and limits the amount of
              product.
            </span>
          </div>
          {[
            [
              "Stoichiometric ratio (particles)",
              `${r.a} ${r.aName} : ${r.b} ${r.bName} : ${r.p} ${r.product}`,
            ],
            [
              "Given amounts",
              `${a} ${r.aName} molecules · ${b} ${r.bName} molecules`,
            ],
            [
              "Theoretical yield (from limiting reactant)",
              `${result.products} ${r.product} molecules`,
            ],
            [
              "Excess reactant remaining",
              excessSpecies === "none" ? "None — reactants exactly balanced" : `${result.aLeft || result.bLeft} ${excessSpecies} molecule leftover`,
            ],
          ].map(([l, v]) => (
            <div className="rl-analysis-row" key={l}>
              <small>{l}</small>
              <b>{v}</b>
            </div>
          ))}
          <div className="rl-view">
            View
            <button
              onClick={() => setStatus("before")}
              className={status === "before" ? "active" : ""}
            >
              Before reaction
            </button>
            <button
              onClick={() => setStatus("after")}
              className={status === "after" ? "active" : ""}
            >
              After reaction
            </button>
          </div>
        </section>
        <section className="rl-bottom">
          <h2>
            4. Connect particles, moles and grams{" "}
            <small>(after reaction)</small>
          </h2>
          <p>See how the molecular picture relates to moles and mass.</p>
          <table>
            <thead>
              <tr>
                <th>Species</th>
                <th>Molecules (particles)</th>
                <th>Moles (mol)</th>
                <th>Molar mass (g/mol)</th>
                <th>Mass (g)</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, index) => <tr key={row.species}>
                <td>
                  <Molecule atoms={index === 0 ? r.aAtoms : index === 1 ? r.bAtoms : r.pAtoms} small />
                  {row.species} ({index === 0 ? "reacted" : index === 1 ? "leftover" : "produced"})
                </td>
                <td>{row.count}</td>
                <td>{row.moles.toFixed(5)}</td>
                <td>{row.mass.toFixed(2)}</td>
                <td>{row.grams.toFixed(4)}</td>
              </tr>
              )}
            </tbody>
          </table>
          <div className="rl-chart">
            <b>Number of molecules (after reaction)</b>
            <i style={{ height: `${result.aLeft * 18}px` }} />
            <i style={{ height: `${result.bLeft * 18}px` }} />
            <i style={{ height: `${result.products * 18}px` }} />
            <span>
              {r.aName} &nbsp;&nbsp;&nbsp;&nbsp; {r.bName} &nbsp;&nbsp;&nbsp;&nbsp; {r.product}
            </span>
          </div>
          <div className="rl-take">
            <Lightbulb />
            <b>Key takeaway</b>
            <p>
              The amount of product is limited by the reactant that is used up
              first.
            </p>
            <p>In this mixture, {result.limiting} limits the reaction.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
