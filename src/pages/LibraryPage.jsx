import { useState } from "react";
import { Atom, BarChart3, BookOpen, Clock3, FlaskConical, Play, Search, Sparkles } from "lucide-react";
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
        <section className="library-page-intro library-hero">
          <div>
            <span className="hub-eyebrow">CHEMISTRY UNIVERSE · DISCOVER MODE</span>
            <h1>Explore Chemistry <em>without limits.</em></h1>
            <p>Pick a discipline, open an interactive experience, and keep building your scientific intuition.</p>
          </div>
          <button type="button" onClick={() => onNavigate?.("molecule")}>
            <Play size={15} /> Open 3D Molecule Studio
          </button>
        </section>
        <HomeStatistics />
        <section className="library-quick-launch" aria-label="Quick launch">
          <span><Sparkles size={15} /> QUICK LAUNCH</span>
          {[['Periodic Table','table'],['Molecular Viewer','molecule'],['Reaction Lab','lab'],['Spectroscopy','spectroscopy-interpreter']].map(([label,id]) => <button key={id} onClick={() => onNavigate?.(id)}><span>{label}</span><Play size={13} /></button>)}
        </section>
        <section className="library-progress-strip" aria-label="Learning progress">
          <div className="library-progress-copy"><BarChart3 size={18} /><span><b>Continue learning</b><small>Organic Chemistry · Aromatic compounds · Lesson 6 of 8</small></span></div>
          <div className="library-progress-meter"><i /><strong>72%</strong></div>
          <button onClick={() => onNavigate?.("organic-visuals")}>Resume lesson <Play size={13} /></button>
        </section>
        <div className="library-section-label"><span>YOUR CHEMISTRY UNIVERSE</span><b>Choose a path</b><small>Every card opens a focused workspace</small></div>
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
