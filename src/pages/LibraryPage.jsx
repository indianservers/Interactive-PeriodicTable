import { useState } from "react";
import { Atom, BookOpen, FlaskConical, Search } from "lucide-react";
import HomeLibrary from "./HomeLibrary.jsx";
import HomeStatistics from "./HomeStatistics.jsx";
import "./homeLibrary.css";

export default function LibraryPage({ onNavigate }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [subgroup, setSubgroup] = useState("all");

  return (
    <div className="library-page">
      <header className="library-page-header">
        <div className="library-page-brand">
          <div className="library-page-mark"><Atom size={22} /></div>
          <div>
            <b>Chemistry Library</b>
            <span>Explore. Simulate. Understand.</span>
          </div>
        </div>
        <label className="library-page-search">
          <Search size={16} />
          <input
            aria-label="Search chemistry library"
            placeholder="Search simulators, molecules, reactions, or concepts…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setCategory("all");
              setSubgroup("all");
            }}
          />
        </label>
        <button type="button" onClick={() => onNavigate?.("lab")}>
          <FlaskConical size={16} /> Virtual lab
        </button>
        <button type="button" onClick={() => onNavigate?.("syllabus")}>
          <BookOpen size={16} /> Learn
        </button>
      </header>
      <main className="library-page-main">
        <section className="library-page-intro">
          <div>
            <span className="hub-eyebrow">CHEMISTRY UNIVERSE</span>
            <h1>One library for every chemistry journey</h1>
            <p>Pick a subject, open a simulation, and keep learning from the same workspace.</p>
          </div>
          <button type="button" onClick={() => onNavigate?.("molecule")}>
            Open 3D Molecule Studio →
          </button>
        </section>
        <HomeStatistics />
        <HomeLibrary
          query={query}
          setQuery={setQuery}
          category={category}
          setCategory={setCategory}
          subgroup={subgroup}
          setSubgroup={setSubgroup}
          onNavigate={onNavigate}
        />
      </main>
    </div>
  );
}
