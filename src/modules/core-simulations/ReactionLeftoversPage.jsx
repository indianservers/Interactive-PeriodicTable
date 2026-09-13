import { useMemo, useState } from "react";
import {
  BarChart3,
  Beaker,
  BookOpen,
  Check,
  CircleHelp,
  FileText,
  FlaskConical,
  Home,
  Lightbulb,
  Play,
  RefreshCw,
  Settings,
  ShieldCheck,
  Target,
  Trophy,
} from "lucide-react";
import {
  ammoniaYield,
  atomInventory,
  reactionOutcome,
} from "./reactionLeftoversModel.js";
import "./ReactionLeftoversPage.css";

const screenMap = ["home", "build", "outcome", "yield", "challenge", "report"];
const labels = [
  "Intro",
  "Explore",
  "Predict",
  "Experiment",
  "Challenges",
  "Report",
];
const atoms = { H: "white", O: "red", N: "blue", C: "black" };
const formulas = {
  "H₂": ["H", "H"],
  "O₂": ["O", "O"],
  "H₂O": ["H", "O", "H"],
  "N₂": ["N", "N"],
  "NH₃": ["H", "N", "H", "H"],
  "CH₄": ["H", "C", "H", "H", "H"],
  "CO₂": ["O", "C", "O"],
};

function Molecule({ species, small = false }) {
  return (
    <span
      className={`rx-molecule ${small ? "small" : ""}`}
      aria-label={`${species} molecule`}
    >
      {(formulas[species] || []).map((atom, index) => (
        <i key={index} className={atoms[atom]} style={{ "--i": index }} />
      ))}
    </span>
  );
}
function MoleculeSet({ species, count }) {
  return (
    <div className="rx-molecule-set">
      {Array.from({ length: Math.max(0, Math.round(count)) }, (_, i) => (
        <Molecule key={i} species={species} />
      ))}
    </div>
  );
}
function Header({ step, go }) {
  const progress = Math.round((step / 5) * 100);
  return (
    <header className="rx-header">
      <div className="rx-brand">
        <FlaskConical />
        <span>
          <b>Chemistry Virtual Lab</b>
          <small>Explore · Experiment · Understand.</small>
        </span>
      </div>
      <nav aria-label="Lab navigation">
        {[
          [Home, "Home", 0],
          [Beaker, "Experiment", 1],
          [BarChart3, "Data", 3],
          [Trophy, "Challenges", 4],
          [FileText, "Report", 5],
          [CircleHelp, "Help", 0],
        ].map(([Icon, name, index]) => (
          <button
            key={name}
            className={step === index ? "active" : ""}
            onClick={() => go(index)}
          >
            <Icon />
            {name}
          </button>
        ))}
      </nav>
      <div className="rx-progress">
        <span>Progress: {progress}%</span>
        <i>
          <b style={{ width: `${progress}%` }} />
        </i>
        <small>{step + 1} of 6</small>
      </div>
    </header>
  );
}
function Stepper({ step }) {
  return (
    <div className="rx-stepper">
      {labels.map((label, index) => (
        <div key={label} className={index <= step ? "done" : ""}>
          <i>{index < step ? <Check /> : index + 1}</i>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}
function Card({ title, icon: Icon, children, className = "" }) {
  return (
    <section className={`rx-card ${className}`}>
      <h2>
        {Icon && <Icon />}
        {title}
      </h2>
      {children}
    </section>
  );
}

function HomeScreen({ go }) {
  return (
    <main className="rx-page rx-home">
      <div className="rx-title">
        <div>
          <h1>Reactants, Products &amp; Leftovers</h1>
          <p>
            Build reactions, identify the limiting reactant, and see exactly
            what remains.
          </p>
        </div>
        <aside>
          <Target />
          <i>
            Same atoms. New arrangements.
            <br />
            Real understanding.
          </i>
        </aside>
      </div>
      <div className="rx-home-grid">
        <Card title="Reaction Tray" icon={RefreshCw} className="rx-demo">
          <p>
            Drag molecules from the bins into the reaction chamber. Run the
            reaction to see products and leftovers.
          </p>
          <div className="rx-demo-grid">
            <div className="rx-bin">
              <b>Reactant Bins</b>
              <div>
                <Molecule species="H₂" />
                <Molecule species="O₂" />
              </div>
              <small>Hydrogen (H₂) &nbsp; Oxygen (O₂)</small>
            </div>
            <div className="rx-chamber">
              <b>Reaction Chamber</b>
              <MoleculeSet species="H₂" count={3} />
              <MoleculeSet species="O₂" count={2} />
            </div>
            <div className="rx-bin product">
              <b>Products (Water)</b>
              <MoleculeSet species="H₂O" count={2} />
            </div>
          </div>
          <strong className="rx-equation">
            2H₂ &nbsp; + &nbsp; O₂ &nbsp; → &nbsp; 2H₂O
          </strong>
        </Card>
        <div className="rx-home-side">
          <Card title="Balanced Equation" icon={ShieldCheck}>
            <strong className="rx-equation boxed">2H₂ + O₂ → 2H₂O</strong>
            <p>
              Stoichiometric ratio <b>2 : 1 : 2</b>
            </p>
            <p>
              Difficulty <b>Beginner – Intermediate</b>
            </p>
          </Card>
          <Card title="Safety & Legend" icon={ShieldCheck}>
            <p>This is a virtual lab. No real chemicals are used.</p>
            {["H₂", "O₂", "H₂O"].map((x) => (
              <span className="rx-legend" key={x}>
                <Molecule species={x} small /> {x}
              </span>
            ))}
          </Card>
          <button className="rx-primary" onClick={() => go(1)}>
            <Play /> Start Simulation →
          </button>
        </div>
        <Card
          title="Learning Objectives"
          icon={Target}
          className="rx-objectives"
        >
          <ol>
            <li>Balance particle ratios in chemical reactions.</li>
            <li>Determine the limiting reactant.</li>
            <li>Predict product yield and identify leftovers.</li>
          </ol>
        </Card>
        <Card title="Choose a Simulation Mode" className="rx-modes">
          {[
            ["Water Formation", "H₂O"],
            ["Ammonia Synthesis", "NH₃"],
            ["Methane Combustion", "CH₄"],
          ].map(([name, species], index) => (
            <button
              className={index === 0 ? "active" : ""}
              key={name}
              onClick={() => go(index ? 3 : 1)}
            >
              <Molecule species={species} />
              <b>{name}</b>
              <small>
                {index === 0
                  ? "2H₂ + O₂ → 2H₂O"
                  : index === 1
                    ? "N₂ + 3H₂ → 2NH₃"
                    : "CH₄ + 2O₂ → CO₂ + 2H₂O"}
              </small>
            </button>
          ))}
        </Card>
      </div>
    </main>
  );
}

function BuildScreen({ amounts, setAmounts, outcome, go }) {
  const inventory = atomInventory("water", amounts, outcome);
  return (
    <main className="rx-page">
      <div className="rx-work-title">
        <div>
          <h1>Reactants, Products &amp; Leftovers</h1>
          <p>
            Investigate how the number of particles affects a chemical reaction.
          </p>
        </div>
        <Stepper step={1} />
      </div>
      <div className="rx-build-grid">
        <div>
          <Card title="Reactant Controls" icon={FileText}>
            <p>Use the + / − buttons to set the chamber.</p>
            {["H₂", "O₂"].map((species) => (
              <div className="rx-control" key={species}>
                <Molecule species={species} />
                <b>
                  {species}
                  <small>{species === "H₂" ? "hydrogen" : "oxygen"}</small>
                </b>
                <label>
                  Molecules:
                  <input
                    aria-label={`${species} molecules`}
                    value={amounts[species]}
                    readOnly
                  />
                </label>
                <button
                  onClick={() =>
                    setAmounts((v) => ({
                      ...v,
                      [species]: Math.max(0, v[species] - 1),
                    }))
                  }
                >
                  −
                </button>
                <button
                  onClick={() =>
                    setAmounts((v) => ({ ...v, [species]: v[species] + 1 }))
                  }
                >
                  +
                </button>
              </div>
            ))}
            <button className="rx-primary">Fill Chamber</button>
          </Card>
          <Card title="Particle Legend">
            {["H₂", "O₂", "H₂O"].map((x) => (
              <span className="rx-legend" key={x}>
                <Molecule species={x} /> = {x} molecule
              </span>
            ))}
          </Card>
        </div>
        <div>
          <Card
            title="Reaction Chamber"
            icon={Beaker}
            className="rx-large-chamber"
          >
            <div className="rx-glass">
              <MoleculeSet species="H₂" count={amounts["H₂"]} />
              <MoleculeSet species="O₂" count={amounts["O₂"]} />
            </div>
          </Card>
          <div className="rx-equation-line">
            <ShieldCheck />
            <b>Balanced Equation</b>
            <strong>2 H₂ + O₂ → 2 H₂O</strong>
          </div>
        </div>
        <div>
          <Card title="Prediction — Before You Run" icon={Lightbulb}>
            <p>Use the reactant amounts to predict the outcome.</p>
            <label>
              1. What is the limiting reactant?
              <select defaultValue="H₂">
                <option>H₂</option>
                <option>O₂</option>
                <option>Neither</option>
              </select>
            </label>
            <label>
              2. How many H₂O molecules form?
              <input defaultValue="6" />
            </label>
            <label>
              3. Expected leftovers?
              <input defaultValue="1 H₂ and 1 O₂" />
            </label>
          </Card>
          <Card title="Stoichiometric Recipe" icon={FileText}>
            <strong className="rx-equation boxed">
              2 H₂ &nbsp; : &nbsp; 1 O₂ &nbsp; : &nbsp; 2 H₂O
            </strong>
          </Card>
          <Card title="Atom Inventory (in chamber)">
            <table>
              <tbody>
                {Object.keys(inventory.before).map((e) => (
                  <tr key={e}>
                    <th>{e}</th>
                    <td>{inventory.before[e]}</td>
                    <td>{inventory.after[e]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>Conservation of atoms: pending</p>
          </Card>
          <button className="rx-primary" onClick={() => go(2)}>
            <Play /> Run Reaction
          </button>
        </div>
      </div>
    </main>
  );
}

function OutcomeScreen({ amounts, outcome, go }) {
  const inventory = atomInventory("water", amounts, outcome);
  return (
    <main className="rx-page rx-with-rail">
      <aside className="rx-rail">
        <h2>Reactants, Products &amp; Leftovers</h2>
        {labels.map((label, i) => (
          <span className={i <= 2 ? "active" : ""} key={label}>
            <i>{i < 2 ? <Check /> : i + 1}</i>
            {label}
          </span>
        ))}
      </aside>
      <div className="rx-outcome">
        <div className="rx-work-title">
          <div>
            <h1>Reaction Complete — Count the Leftovers</h1>
            <p>
              The reaction has finished. Examine the products and leftover
              reactants.
            </p>
          </div>
          <Stepper step={2} />
        </div>
        <div className="rx-result-grid">
          <div>
            <div className="rx-summary">
              <b>
                Balanced equation:<strong>2H₂ + O₂ → 2H₂O</strong>
              </b>
              <b>
                Starting amounts:
                <strong>
                  {amounts["H₂"]} H₂ molecules
                  <br />
                  {amounts["O₂"]} O₂ molecules
                </strong>
              </b>
            </div>
            <div className="rx-glass rx-after">
              <section>
                <h2>Products</h2>
                <MoleculeSet species="H₂O" count={outcome.products["H₂O"]} />
                <b>{outcome.products["H₂O"]} H₂O molecules</b>
              </section>
              <section>
                <h2>Leftover Reactants</h2>
                {Object.entries(outcome.leftovers).map(
                  ([s, n]) =>
                    n > 0 && (
                      <div key={s}>
                        <MoleculeSet species={s} count={n} />
                        <b>
                          {n} {s} molecule
                        </b>
                      </div>
                    ),
                )}
              </section>
            </div>
            <div className="rx-yieldbar">
              <b>Yield: H₂O formed</b>
              <i>
                <b style={{ width: "100%" }} />
              </i>
              <strong>
                {outcome.products["H₂O"]} of {outcome.products["H₂O"]} molecules
                (100%)
              </strong>
            </div>
            <button className="rx-primary" onClick={() => go(3)}>
              Analyse Results
            </button>
          </div>
          <div>
            <Card title="Results">
              <table>
                <tbody>
                  <tr>
                    <th>Limiting reactant</th>
                    <td>{outcome.limiting}</td>
                  </tr>
                  <tr>
                    <th>Reaction batches</th>
                    <td>{outcome.extent}</td>
                  </tr>
                  <tr>
                    <th>H₂ consumed</th>
                    <td>{outcome.consumed["H₂"]}</td>
                  </tr>
                  <tr>
                    <th>O₂ consumed</th>
                    <td>{outcome.consumed["O₂"]}</td>
                  </tr>
                  <tr>
                    <th>H₂O formed</th>
                    <td>{outcome.products["H₂O"]}</td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card title="Your Prediction">
              <div className="rx-success">
                <Check />
                <b>Correct!</b>
                <p>
                  {outcome.extent} batches occur. The limiting reactant sets the
                  maximum product.
                </p>
              </div>
            </Card>
            <Card title="Atom Inventory">
              <table>
                <tbody>
                  {Object.keys(inventory.before).map((e) => (
                    <tr key={e}>
                      <th>{e}</th>
                      <td>{inventory.before[e]}</td>
                      <td>{inventory.after[e]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="rx-success">
                <Check /> Atoms conserved!
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

function YieldScreen({ go }) {
  const [n2, setN2] = useState(5),
    [h2, setH2] = useState(12),
    [actual, setActual] = useState(126.6),
    y = ammoniaYield(n2, h2, actual);
  return (
    <main className="rx-page">
      <div className="rx-work-title">
        <div>
          <h1>Macroscopic Stoichiometry &amp; Yield</h1>
          <p>
            Use the balanced equation, mole ratios and measured yield to
            determine the limiting reactant.
          </p>
        </div>
        <Stepper step={3} />
      </div>
      <div className="rx-macro-top">
        <Card title="Balanced Chemical Equation">
          <strong className="rx-equation boxed">N₂ + 3H₂ → 2NH₃</strong>
        </Card>
        <Card title="Initial Amounts (Inputs)">
          <label>
            N₂:{" "}
            <input
              aria-label="Nitrogen moles"
              type="number"
              value={n2}
              onChange={(e) => setN2(+e.target.value)}
            />{" "}
            mol
          </label>
          <label>
            H₂:{" "}
            <input
              aria-label="Hydrogen moles"
              type="number"
              value={h2}
              onChange={(e) => setH2(+e.target.value)}
            />{" "}
            mol
          </label>
        </Card>
      </div>
      <Card title="Before and After Reaction" className="rx-beakers">
        <div>
          {[
            ["N₂", n2],
            ["H₂", h2],
            ["NH₃", 0],
            ["N₂", y.nitrogenLeft],
            ["H₂", y.hydrogenLeft],
            ["NH₃", y.ammoniaMol],
          ].map(([s, n], i) => (
            <section key={i}>
              <b>
                {s} {i < 3 ? "initial" : "after"}
              </b>
              <div className="rx-vessel">
                <MoleculeSet species={s} count={Math.min(12, Math.round(n))} />
              </div>
              <strong>{n.toFixed(2)} mol</strong>
            </section>
          ))}
        </div>
      </Card>
      <div className="rx-macro-bottom">
        <Card title="Calculation Steps (Dimensional Analysis)">
          <ol>
            <li>
              Extent = min({n2.toFixed(2)} / 1, {h2.toFixed(2)} / 3) ={" "}
              <b>{y.extent.toFixed(2)} mol batches</b>
            </li>
            <li>
              Limiting reactant: <b>{y.limiting}</b>
            </li>
            <li>
              Theoretical NH₃ = {y.ammoniaMol.toFixed(2)} mol × 17.03 g/mol ={" "}
              <b>{y.theoreticalGrams.toFixed(1)} g</b>
            </li>
            <li>
              Leftover N₂ = {y.nitrogenLeft.toFixed(2)} mol; H₂ ={" "}
              {y.hydrogenLeft.toFixed(2)} mol
            </li>
          </ol>
        </Card>
        <Card title="Actual Yield & Percent Yield">
          <label>
            Actual yield{" "}
            <input
              aria-label="Actual yield"
              type="number"
              value={actual}
              onChange={(e) => setActual(+e.target.value)}
            />{" "}
            g NH₃
          </label>
          <p>
            Theoretical yield <b>{y.theoreticalGrams.toFixed(1)} g NH₃</b>
          </p>
          <strong className="rx-percent">{y.percentYield.toFixed(1)}%</strong>
        </Card>
        <Card title="Mass Conservation Check" icon={Check}>
          <p>
            Total mass before: <b>{y.massBefore.toFixed(2)} g</b>
          </p>
          <p>Mass conserved for the balanced reaction.</p>
        </Card>
      </div>
      <button className="rx-primary rx-next" onClick={() => go(4)}>
        <Trophy /> Start Challenge
      </button>
    </main>
  );
}

function ChallengeScreen({ go }) {
  const expected = reactionOutcome("methane", { "CH₄": 5, "O₂": 8 }),
    [answer, setAnswer] = useState({
      limiting: "O₂",
      co2: 4,
      water: 8,
      left: 1,
    }),
    [checked, setChecked] = useState(false),
    correct =
      answer.limiting === expected.limiting &&
      +answer.co2 === expected.products["CO₂"] &&
      +answer.water === expected.products["H₂O"] &&
      +answer.left === expected.leftovers["CH₄"];
  return (
    <main className="rx-page rx-challenge">
      <div className="rx-work-title">
        <div>
          <small>Challenge 4 of 6</small>
          <h1>Limiting Reactant Challenge</h1>
          <p>
            Use the particle model and balanced equation to determine products
            and leftovers.
          </p>
        </div>
        <Stepper step={4} />
      </div>
      <div className="rx-challenge-grid">
        <div>
          <Card title="Balanced Equation">
            <strong className="rx-equation boxed">
              CH₄ + 2O₂ → CO₂ + 2H₂O
            </strong>
          </Card>
          <Card
            title="Initial Particle Chamber (Before Reaction)"
            icon={FlaskConical}
          >
            <div className="rx-glass">
              <MoleculeSet species="CH₄" count={5} />
              <MoleculeSet species="O₂" count={8} />
            </div>
          </Card>
        </div>
        <div>
          <Card
            title={
              checked && correct
                ? "Your Answer (Revealed Correct)"
                : "Your Workspace"
            }
            icon={checked && correct ? Check : FileText}
            className={checked && correct ? "correct" : ""}
          >
            <div className="rx-answer">
              <label>
                Limiting Reactant
                <select
                  value={answer.limiting}
                  onChange={(e) =>
                    setAnswer({ ...answer, limiting: e.target.value })
                  }
                >
                  <option>CH₄</option>
                  <option>O₂</option>
                  <option>Neither</option>
                </select>
              </label>
              <label>
                CO₂ Formed
                <input
                  value={answer.co2}
                  onChange={(e) =>
                    setAnswer({ ...answer, co2: e.target.value })
                  }
                />
              </label>
              <label>
                H₂O Formed
                <input
                  value={answer.water}
                  onChange={(e) =>
                    setAnswer({ ...answer, water: e.target.value })
                  }
                />
              </label>
              <label>
                CH₄ Leftover
                <input
                  value={answer.left}
                  onChange={(e) =>
                    setAnswer({ ...answer, left: e.target.value })
                  }
                />
              </label>
            </div>
            <button className="rx-primary" onClick={() => setChecked(true)}>
              Check Answer
            </button>
            {checked && (
              <div className={correct ? "rx-success" : "rx-error"}>
                {correct
                  ? "Correct! Oxygen is limiting; four reaction batches form 4 CO₂ and 8 H₂O, leaving 1 CH₄."
                  : "Not quite—recheck the 1:2 methane-to-oxygen ratio."}
              </div>
            )}
          </Card>
          {checked && correct && (
            <Card title="Explanation" icon={Lightbulb}>
              <p>
                Each reaction set uses 1 CH₄ and 2 O₂. Eight O₂ molecules permit
                8 ÷ 2 = 4 complete batches.
              </p>
              <div className="rx-batches">
                {Array.from({ length: 4 }, (_, i) => (
                  <span key={i}>
                    Batch {i + 1}
                    <Molecule species="CH₄" small /> +{" "}
                    <Molecule species="O₂" small /> →{" "}
                    <Molecule species="CO₂" small /> + 2
                    <Molecule species="H₂O" small />
                  </span>
                ))}
              </div>
              <button className="rx-primary" onClick={() => go(5)}>
                View Report →
              </button>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}

function ReportScreen({ go }) {
  const [answers, setAnswers] = useState({}),
    questions = [
      {
        q: "Which reactant is limiting for 7H₂ + 4O₂?",
        a: "H₂",
        opts: ["H₂", "O₂", "Neither"],
      },
      {
        q: "Which leftovers remain?",
        a: "1 H₂ and 1 O₂",
        opts: ["None", "1 H₂ and 1 O₂", "2 O₂"],
      },
      {
        q: "Which law explains equal atom totals?",
        a: "Conservation of mass",
        opts: ["Boyle's law", "Conservation of mass", "Charles's law"],
      },
    ],
    score = questions.filter((x, i) => answers[i] === x.a).length;
  return (
    <main className="rx-page rx-with-rail">
      <aside className="rx-rail">
        {[
          [Home, "Home"],
          [Beaker, "Experiment"],
          [BarChart3, "Data"],
          [FileText, "Report"],
          [BookOpen, "Learn"],
          [Settings, "Settings"],
        ].map(([I, n]) => (
          <button className={n === "Report" ? "active" : ""} key={n}>
            <I />
            {n}
          </button>
        ))}
      </aside>
      <div className="rx-report">
        <div className="rx-work-title">
          <div>
            <h1>Reactants, Products &amp; Leftovers</h1>
            <p>Screen 6 of 6: Lab Report &amp; Skill Assessment</p>
          </div>
          <Stepper step={5} />
        </div>
        <div className="rx-complete">
          <Check />
          <b>Experiment Complete!</b>
          <span>
            Well done! You explored reactants, products and leftovers.
          </span>
        </div>
        <div className="rx-stats">
          {[
            [FlaskConical, "Reactions Explored", "4"],
            [FileText, "Challenges Completed", "6 / 6"],
            [Trophy, "Best Streak", "5"],
            [Target, "Accuracy", "92%"],
            [Trophy, "Total Score", "940 / 1000"],
          ].map(([I, l, v]) => (
            <Card key={l}>
              <I />
              <span>
                {l}
                <b>{v}</b>
              </span>
            </Card>
          ))}
        </div>
        <div className="rx-report-grid">
          <Card title="Experimental Results">
            <table>
              <thead>
                <tr>
                  <th>Scenario</th>
                  <th>Reactants</th>
                  <th>Products</th>
                  <th>Leftovers</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th>Water Formation</th>
                  <td>7 H₂, 4 O₂</td>
                  <td>6 H₂O</td>
                  <td>1 H₂, 1 O₂</td>
                </tr>
                <tr>
                  <th>Ammonia Synthesis</th>
                  <td>5 N₂, 12 H₂</td>
                  <td>8 NH₃</td>
                  <td>1 N₂</td>
                </tr>
                <tr>
                  <th>Methane Combustion</th>
                  <td>5 CH₄, 8 O₂</td>
                  <td>4 CO₂, 8 H₂O</td>
                  <td>1 CH₄</td>
                </tr>
              </tbody>
            </table>
          </Card>
          <Card title="Your Lab Report">
            <label>
              Aim
              <textarea defaultValue="To investigate how reactant amounts affect the products formed and identify limiting reactants and leftovers." />
            </label>
            <label>
              Conclusion
              <textarea defaultValue="The limiting reactant determines how much product forms. Excess reactant remains, while total atoms are conserved." />
            </label>
          </Card>
        </div>
        <div className="rx-report-grid lower">
          <Card title="Particle Model Snapshots">
            <div className="rx-snapshots">
              {[
                ["H₂", 7, "H₂O", 6],
                ["N₂", 5, "NH₃", 8],
                ["CH₄", 5, "CO₂", 4],
              ].map(([a, n, p, m]) => (
                <span key={a}>
                  <b>
                    {a} → {p}
                  </b>
                  <MoleculeSet species={a} count={Math.min(n, 5)} />
                  <MoleculeSet species={p} count={Math.min(m, 5)} />
                </span>
              ))}
            </div>
          </Card>
          <Card title={`Knowledge Check — Score: ${score} / 3`}>
            {questions.map((x, i) => (
              <fieldset key={x.q}>
                <legend>
                  {i + 1}. {x.q}
                </legend>
                {x.opts.map((o) => (
                  <button
                    className={answers[i] === o ? "active" : ""}
                    key={o}
                    onClick={() => setAnswers({ ...answers, [i]: o })}
                  >
                    {o}
                  </button>
                ))}
              </fieldset>
            ))}
          </Card>
        </div>
        <button className="rx-primary rx-next" onClick={() => go(0)}>
          <RefreshCw /> Restart Lab
        </button>
      </div>
    </main>
  );
}

export default function ReactionLeftoversPage() {
  const initial = new URLSearchParams(location.search).get("screen") || "home";
  const [screen, setScreen] = useState(
      screenMap.includes(initial) ? initial : "home",
    ),
    [amounts, setAmounts] = useState({ "H₂": 7, "O₂": 4 });
  const step = screenMap.indexOf(screen),
    outcome = useMemo(() => reactionOutcome("water", amounts), [amounts]);
  const go = (index) => {
    const next = screenMap[index];
    setScreen(next);
    const url = new URL(location.href);
    url.searchParams.set("screen", next);
    history.replaceState(null, "", url);
    scrollTo(0, 0);
  };
  return (
    <div className="rx-app">
      <Header step={step} go={go} />
      {step === 0 ? (
        <HomeScreen go={go} />
      ) : step === 1 ? (
        <BuildScreen
          amounts={amounts}
          setAmounts={setAmounts}
          outcome={outcome}
          go={go}
        />
      ) : step === 2 ? (
        <OutcomeScreen amounts={amounts} outcome={outcome} go={go} />
      ) : step === 3 ? (
        <YieldScreen go={go} />
      ) : step === 4 ? (
        <ChallengeScreen go={go} />
      ) : (
        <ReportScreen go={go} />
      )}
    </div>
  );
}
