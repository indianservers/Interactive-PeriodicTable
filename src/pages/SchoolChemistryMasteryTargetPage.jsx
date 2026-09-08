import { useState } from "react";
import {
  BarChart3,
  Beaker,
  BookOpen,
  CheckCircle,
  ClipboardCheck,
  FileText,
  FlaskConical,
  Lightbulb,
  Search,
  UserCircle,
} from "lucide-react";
import "./schoolChemistryMasteryTarget.css";

const concepts = [
  ["H", "Matter", 92, "mastered"],
  ["C", "Atoms", 88, "progress"],
  ["N", "Bonding", 76, "learn"],
  ["O", "Chemical Reactions", 82, "selected"],
  ["F", "Thermodynamics", 68, "purple"],
  ["Ne", "Equilibrium", 62, "purple"],
  ["Al", "Acids & Bases", 79, "progress"],
  ["Si", "Metals", 73, "learn"],
  ["P", "Organic Chemistry", 58, "purple"],
  ["C", "Carbon", 85, "mastered"],
];
export function SchoolChemistryMasteryTargetPage() {
  const [selected, setSelected] = useState(3),
    [tab, setTab] = useState("Overview"),
    [reviewed, setReviewed] = useState(false),
    [navItem, setNavItem] = useState("Learning Map"),
    [curriculum, setCurriculum] = useState("CBSE · Class 10"),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState("");
  const c = concepts[selected];
  const visibleConcepts = concepts.filter((x) => `${x[0]} ${x[1]}`.toLowerCase().includes(query.toLowerCase()));
  const announce = (message) => setNotice(message);
  return (
    <div className="scm-app">
      <header>
        <FlaskConical />
        <div>
          <h1>School Chemistry Mastery</h1>
          <p>Build Concepts. Make Connections. Master Chemistry.</p>
        </div>
        <select value={curriculum} onChange={(e) => { setCurriculum(e.target.value); announce(`${e.target.value} curriculum selected`); }}>
          <option>CBSE · Class 10</option>
          <option>ICSE · Class 10</option>
        </select>
        <label>
          <Search />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, reactions, elements..." />
        </label>
        <UserCircle />
        <b>
          Aarav<small>Student</small>
        </b>
        <i>
          “A little progress each day
          <br />
          adds up to big results.”
        </i>
        <span>♦❯</span>
      </header>
      <aside>
        {[
          [BookOpen, "Learning Map"],
          [FileText, "Lessons"],
          [Beaker, "Simulations"],
          [ClipboardCheck, "Practice"],
          [CheckCircle, "Revision"],
          [BarChart3, "Progress"],
          [BookOpen, "Notebook"],
          [FileText, "Formula Sheet"],
        ].map(([I, n]) => (
          <button className={navItem === n ? "active" : ""} key={n} onClick={() => { setNavItem(n); announce(`${n} selected`); }}>
            <I />
            {n}
          </button>
        ))}
        <article>
          <p>
            Curious minds
            <br />
            <b>change the world.</b>
          </p>
          <hr />
          <small>
            Chemistry today.
            <br />A brighter tomorrow.
          </small>
        </article>
      </aside>
      <main>
        <section className="scm-map">
          <header>
            <h2>Concept Mastery Map</h2>
            <small>
              Topics from Class 9–12 · Click a concept to explore lessons,
              practice and resources.
            </small>
            <nav>● Mastered　 ● In Progress　 ● To Learn　 ● Locked</nav>
          </header>
          <div className="scm-grid">
            {visibleConcepts.map((x) => {
              const i = concepts.indexOf(x);
              return (
              <button
                key={`${x[0]}-${i}`}
                className={`${x[3]} ${selected === i ? "active" : ""}`}
                onClick={() => setSelected(i)}
              >
                <sup>{i + 1}</sup>
                <strong>{x[0]}</strong>
                <span>{x[1]}</span>
                <b>{x[2]}%</b>
              </button>
              );
            })}
          </div>
          <p>
            →　→ Arrows show prerequisite relationships between concepts.
            <span>
              Click any element to see topic details, key questions and
              resources.
            </span>
          </p>
        </section>
        <section className="scm-detail">
          <header>
            <span>
              <sup>8</sup>
              <b>O</b>
            </span>
            <div>
              <h2>{c[1]}</h2>
              <p>Class 10 · Chapter 1</p>
            </div>
            <aside>
              Mastery <strong>{c[2]}%</strong>
              <i style={{ "--score": `${c[2] * 3.6}deg` }} />
            </aside>
          </header>
          <nav>
            {[
              "Overview",
              "Key Concepts",
              "Examples",
              "Practice",
              "Resources",
            ].map((n) => (
              <button
                className={tab === n ? "active" : ""}
                onClick={() => setTab(n)}
                key={n}
              >
                {n}
              </button>
            ))}
          </nav>
          <div className="scm-copy">
            <p>
              Chemical reactions involve the rearrangement of atoms to form new
              substances with different properties. Learn to identify different
              types of reactions, write and balance chemical equations, and
              apply the concept in real-life contexts.
            </p>
            <ul>
              <li>
                Types of reactions: combination, decomposition, displacement
              </li>
              <li>Balancing chemical equations</li>
              <li>Everyday applications and thermal decomposition</li>
            </ul>
            <button onClick={() => { setTab("Key Concepts"); announce(`Continuing ${c[1]} learning`); }}>Continue Learning　→</button>
          </div>
          <div className="scm-demo">
            <div>AgNO₃ (aq) + NaCl (aq)　→　AgCl (s) + NaNO₃ (aq)</div>
            <p>
              Formation of a precipitate (AgCl) – a double displacement
              reaction.
            </p>
          </div>
          <footer>
            <button onClick={() => { setSelected((selected + 1) % concepts.length); announce("Next best lesson loaded"); }}>Next best lesson　→</button>
            <button onClick={() => { setTab("Practice"); announce("Weak-link practice opened"); }}>▥ Practice weak link</button>
          </footer>
        </section>
        <aside className="scm-right">
          <article className="scm-mission">
            <header>
              <h2>This Week’s Learning Mission</h2>
              <a onClick={() => announce("All weekly missions displayed")}>View All →</a>
            </header>
            {[
              [
                "Simulation",
                "Balance the Equation",
                "Adjust coefficients and see atoms conserved in real time.",
              ],
              [
                "Visual Proof",
                "Why Precipitation Reactions Happen?",
                "Watch and analyse ionic equations with animations.",
              ],
              [
                "Quiz",
                "Types of Chemical Reactions",
                "10 questions · CBSE style",
              ],
            ].map((m, i) => (
              <button key={m[1]} onClick={() => { setTab(i === 2 ? "Practice" : "Examples"); announce(`${m[1]} opened`); }}>
                <i>{i === 0 ? "⚗" : i === 1 ? "▶" : "▤"}</i>
                <b>
                  <small>{m[0]}</small>
                  {m[1]}
                  <span>{m[2]}</span>
                </b>
                <strong>→</strong>
              </button>
            ))}
          </article>
          <article className="scm-mis">
            <header>
              <h2>
                <Lightbulb /> Common Misconceptions
              </h2>
              <a onClick={() => announce("Misconception review expanded")}>See All →</a>
            </header>
            {[
              "Mass is not conserved in a chemical reaction.",
              "All displacement reactions are redox reactions.",
              "Precipitation always means a gas is formed.",
            ].map((t) => (
              <p key={t}>
                ✕　<b>{t}</b>
                <small>
                  {t.startsWith("Mass")
                    ? "Mass is always conserved. Atoms are rearranged, not created or destroyed."
                    : "Review the definition and look for the observable evidence."}
                </small>
              </p>
            ))}
          </article>
          <article className="scm-review">
            <h2>▦　Spaced Review</h2>
            <div>
              {[11, 12, 13, 14, 16, 16, 17].map((d, i) => (
                <span key={i}>
                  <small>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                  </small>
                  {d}
                  <i
                    className={
                      i < 2 ? "done" : i === 2 ? "due" : i === 4 ? "next" : ""
                    }
                  />
                </span>
              ))}
            </div>
            <p>
              3 concepts due for revision{" "}
              <button
                className={reviewed ? "done" : ""}
                onClick={() => { setReviewed(true); announce("Spaced review marked complete"); }}
              >
                {reviewed ? "Reviewed" : "Review Now　→"}
              </button>
            </p>
          </article>
        </aside>
      </main>
      {notice && <div className="scm-notice" role="status">{notice}</div>}
    </div>
  );
}
