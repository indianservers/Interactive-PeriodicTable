import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Box, FlaskConical, Home, Search, Settings, Move, RotateCcw, Network, Activity, BookOpen, Download, FolderOpen, CircleHelp, Wrench, Table2 } from "lucide-react";
import "./advancedVisualChemistryTarget.css";
import AdvancedGalleryPreview from "./AdvancedGalleryPreview.jsx";
import {exportChart} from './advancedVisualExport.js';

const AdvancedOrbitalScene = lazy(() => import('./AdvancedOrbitalScene.jsx'));
const AdvancedChartExperiment = lazy(() => import('./AdvancedChartExperiment.jsx'));
const AdvancedLatticeExperiment = lazy(() => import('./AdvancedLatticeExperiment.jsx'));
const AdvancedSurfaceExperiment = lazy(() => import('./AdvancedSurfaceExperiment.jsx'));
const AdvancedDynamicsExperiment = lazy(() => import('./AdvancedDynamicsExperiment.jsx'));
const AdvancedVisualLegacyLibrary = lazy(() => import('./AdvancedVisualLegacyLibrary.jsx'));
const gallery = [
  [
    "orbital",
    "Ethene π molecular orbital",
    "Molecular orbital • Electron density",
  ],
  ["surface", "Potential energy surface", "Reaction dynamics"],
  ["rdf", "Radial distribution function", "Structure in condensed phase"],
  ["reaction", "Reaction coordinate", "Energy profile • Transition state"],
  ["lattice", "Crystal reciprocal lattice", "Brillouin zone • k-space"],
  ["nmr", "NMR coupling tree", "Spin-spin splitting"],
  ["dynamics", "Molecular dynamics", "Time evolution • Trajectories"],
];
export const AdvancedVisualChemistryPage = ({ onNavigate }) => {
  const [selected, setSelected] = useState("orbital"),
    [iso, setIso] = useState(0.03),
    [orbital, setOrbital] = useState("HOMO (π)"),
    [nodal, setNodal] = useState(true),
    [atoms, setAtoms] = useState(true),
    [surface, setSurface] = useState(true),
    [density, setDensity] = useState(false),
    [playing, setPlaying] = useState(false),
    [tab, setTab] = useState("Molecular orbital"),
    [preset, setPreset] = useState("Default"),
    [speed, setSpeed] = useState(1),
    [clipping, setClipping] = useState("None"),
    [library, setLibrary] = useState(false),
    [query, setQuery] = useState("");
  const sceneRef = useRef();
  const pageRef = useRef();
  const compactMenuRef = useRef();
  function compactAction(action) {
    if (compactMenuRef.current) compactMenuRef.current.open = false;
    action();
  }
  function exportCurrentView() {
    if (selected === 'orbital') return sceneRef.current?.exportImage();
    const workspace = pageRef.current?.querySelector('.avc-chart-workspace');
    const canvas = workspace?.querySelector('canvas');
    if (canvas) canvas.dispatchEvent(new Event('avc-export'));
    else {
      const chart = workspace?.querySelector('svg');
      if (chart) exportChart(chart, `chemistry-${selected}.svg`);
    }
  }
  const dialogRef = useRef();
  useEffect(()=>{
    if(!library) return;
    const opener=document.activeElement;
    const dialog=dialogRef.current;
    const background=Array.from(pageRef.current.children).filter(node=>node!==dialog);
    const previousInert=background.map(node=>node.inert);
    background.forEach(node=>{node.inert=true;});
    dialog.querySelector('button')?.focus();
    const handleKey=e=>{
      if(e.key==='Escape'){e.preventDefault();setLibrary(false);}
      if(e.key==='Tab'){
        const controls=Array.from(dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex="0"]')).filter(el=>!el.disabled&&el.getClientRects().length);
        const first=controls[0],last=controls.at(-1);
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
    };
    dialog.addEventListener('keydown',handleKey);
    return ()=>{dialog.removeEventListener('keydown',handleKey);background.forEach((node,i)=>{node.inert=previousInert[i];});opener?.focus();};
  },[library]);
  function reset() {
    setIso(.03); setOrbital("HOMO (π)"); setNodal(true); setAtoms(true);
    setSurface(true); setDensity(false); setPlaying(false); setTab("Molecular orbital");
    setPreset("Default"); setSpeed(1); setClipping("None"); sceneRef.current?.reset();
  }
  return (
    <div className="avc-app" ref={pageRef}>
      <header>
        <svg viewBox="0 0 48 56" aria-hidden="true"><g stroke="currentColor" strokeWidth="1.5" fill="none"><path d="M24 9L39 18V36L24 45L9 36V18Z M24 9V1M9 18L2 14M39 18L46 14M9 36L2 42M39 36L46 42M24 45V54"/>{[[24,9],[39,18],[39,36],[24,45],[9,36],[9,18]].map(([x,y])=><circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor"/>)}</g></svg>
        <div>
          <h1>Advanced Chemistry Visuals</h1>
          <p>
            Explore molecular structure, reactivity and dynamics through
            interactive visualizations
          </p>
        </div>
        <label>
          <Search />
          <input aria-label="Search visualizations" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search molecules, properties, or topics..." />
        </label>
        <button onClick={()=>onNavigate?.("table")}><Table2/> Periodic Table</button>
        <button onClick={()=>setLibrary(true)}><Wrench/> Tools</button>
        <button onClick={()=>onNavigate?.("settings")}>
          <Settings /> Settings
        </button>
        <b>AC</b>
        <i>
          Science
          <br />
          Visualized
          <br />
          Further
        </i>
      </header>
      <aside>
        {[
          [Home, "Home"],
          [Box, "Visualizations"],
          [Network, "Molecules"],
          [FlaskConical, "Reactions"],
          [Activity, "Spectroscopy"],
          [Box, "Materials"],
          [BookOpen, "Learn"],
        ].map(([I, n], i) => (
          <button className={i === 1 ? "active" : ""} key={n} onClick={()=>i===0?onNavigate?.("dashboard"):i===2?onNavigate?.("molecule"):setLibrary(true)}>
            <I />
            {n}
          </button>
        ))}
        <footer>
          <button onClick={()=>setLibrary(true)}><FolderOpen/> Projects</button><button onClick={exportCurrentView}><Download/> Export</button><button onClick={()=>setLibrary(true)}><CircleHelp/> Help</button>
          <small>
            Compute
            <br />
            Visualize
            <br />
            Understand
            <br />A Brighter Chemical World
          </small>
        </footer>
      </aside>
      <nav className="avc-compact-actions" aria-label="Visualization navigation" onKeyDown={e=>{
        if(e.key==='Escape'&&compactMenuRef.current?.open){compactMenuRef.current.open=false;compactMenuRef.current.querySelector('summary')?.focus();}
      }}>
        <details ref={compactMenuRef}>
          <summary>Navigate</summary>
          <div>
            {[["Home","dashboard"],["Molecules","molecule"],["Periodic Table","table"],["Settings","settings"]].map(([label,route])=>
              <button key={route} onClick={()=>compactAction(()=>onNavigate?.(route))}>{label}</button>
            )}
            <button onClick={()=>compactAction(()=>setLibrary(true))}>Lessons and tools</button>
          </div>
        </details>
        <button onClick={()=>setLibrary(true)}>Library</button>
        <button onClick={exportCurrentView}>Export</button>
        <input aria-label="Search visualization gallery" placeholder="Search gallery…" value={query} onChange={e=>setQuery(e.target.value)}/>
      </nav>
      <main>
        <section className="avc-gallery">
          <header>
            <h2>Visualization Gallery</h2>
            <p>Select a system to explore</p>
          </header>
          {gallery.filter(g=>g.join(" ").toLowerCase().includes(query.toLowerCase())).map((g, i) => (
            <button
              className={`${g[0]} ${selected === g[0] ? "active" : ""}`}
              onClick={() => {setSelected(g[0]); setPlaying(false);}}
              key={g[0]}
            >
              <AdvancedGalleryPreview kind={g[0]} />
              <span>
                <b>{g[1]}</b>
                <small>{g[2]}</small>
              </span>
            </button>
          ))}
          {!gallery.some(g=>g.join(' ').toLowerCase().includes(query.toLowerCase()))&&<p role="status" className="avc-no-results">No visualizations match “{query}”. Try a molecule or topic, or clear the search.</p>}
        </section>
        {selected==='dynamics'?<Suspense fallback={<p>Loading molecular dynamics…</p>}><AdvancedDynamicsExperiment/></Suspense>:selected==='surface'?<Suspense fallback={<p>Loading energy surface…</p>}><AdvancedSurfaceExperiment/></Suspense>:selected==='lattice'?<Suspense fallback={<p>Loading reciprocal lattice…</p>}><AdvancedLatticeExperiment/></Suspense>:['reaction','rdf','nmr'].includes(selected) ? <Suspense fallback={<p>Loading experiment…</p>}><AdvancedChartExperiment key={selected} kind={selected}/></Suspense> : <>
        <section className="avc-stage">
          <header>
            <div>
              <h2>Ethene π molecular orbital</h2>
              <p>
                C₂H₄　|　{orbital.split(" ")[0]}　|　Isosurface of molecular
                orbital (± phase)
              </p>
            </div>
            <button onClick={() => sceneRef.current?.rotate()}>
              <Move aria-hidden="true"/><small>Rotate</small>
            </button>
            <button onClick={() => sceneRef.current?.zoom()}>
              <Search aria-hidden="true"/><small>Zoom</small>
            </button>
            <button
              onClick={reset}
            >
              <RotateCcw aria-hidden="true"/><small>Reset</small>
            </button>
          </header>
          <div className="avc-scene-slot">
            <Suspense fallback={<p>Loading molecular orbital…</p>}>
              <AdvancedOrbitalScene ref={sceneRef} {...{iso,orbital,nodal,atoms,surface,density,playing,speed,clipping,tab,preset}} />
            </Suspense>
            {nodal && !orbital.startsWith('σ') && <span className="avc-plane-label">Nodal plane<br />(π node)</span>}
          </div>
          <nav>
            {["Molecular orbital", "Electron density (|ψ|²)", "Both"].map(
              (x) => (
                <button
                  className={tab === x ? "active" : ""}
                  onClick={() => setTab(x)}
                  key={x}
                >
                  {x}
                </button>
              ),
            )}
          </nav>
        </section>
        <section className="avc-energy">
          <h2>Energy levels (ethene)</h2>
          <svg viewBox="0 0 200 355" role="img" aria-label="Schematic orbital energy ordering: occupied sigma levels below HOMO, LUMO above HOMO. Energies are illustrative.">
            <path d="M30 20V327" stroke="#9eb6d2"/>
            {[4,0,-4,-8,-12,-16].map((e,i)=><g key={e}><text x="22" y={27+i*57} textAnchor="end" fill="#b9cce5" fontSize="12">{e}</text><path d={`M27 ${23+i*57}h9`} stroke="#9eb6d2"/></g>)}
            {[[2.2,'LUMO (π*)'],[-3.8,'HOMO (π)'],[-9.6,'σ (C–H)'],[-14.6,'σ (C–C)']].map(([e,label])=><g key={label} fill={orbital===label?'#b083ff':'#c9dbec'}><path d={`M50 ${23+(4-e)*14.25}h65`} stroke="currentColor" style={{color:orbital===label?'#b083ff':'#c9dbec'}} strokeWidth="2"/><text x="121" y={27+(4-e)*14.25} fontSize="11">{label}</text></g>)}
            <text x="12" y="216" transform="rotate(-90 12 216)" fill="#a0b4ce" fontSize="11">Energy (eV, schematic)</text>
            <text x="69" y="132" fill="#b083ff" fontSize="22">↑↓</text>
          </svg>
        </section>
        <aside className="avc-controls">
          <h2>Visualization Controls</h2>
          <label>
            Orbital
            <select
              value={orbital}
              onChange={(e) => setOrbital(e.target.value)}
            >
              <option>HOMO (π)</option>
              <option>LUMO (π*)</option>
              <option>σ (C–C)</option>
            </select>
          </label>
          <label>
            Isovalue<output>{iso.toFixed(2)}</output>
            <input
              aria-label="Isovalue"
              type="range"
              min=".01"
              max=".08"
              step=".01"
              value={iso}
              onChange={(e) => setIso(+e.target.value)}
            />
          </label>
          <h3>Phase colors</h3>
          <p>
            <i className="red" />
            Positive phase (+)
          </p>
          <p>
            <i className="blue" />
            Negative phase (−)
          </p>
          {[
            ["Show nodal plane", nodal, setNodal],
            ["Show atoms", atoms, setAtoms],
            ["Show isosurface", surface, setSurface],
            ["Compare electron density", density, setDensity],
          ].map(([n, v, f]) => (
            <button aria-pressed={v} className={v ? "on" : ""} onClick={() => f(!v)} key={n}>
              {n}
              <i />
            </button>
          ))}
          <label>
            Clipping plane
            <select value={clipping} onChange={e=>setClipping(e.target.value)}>
              <option>None</option>
              <option>XY</option>
              <option>XZ</option>
            </select>
          </label>
          <label>
            Animation speed<output>{speed.toFixed(1)}×</output>
            <input aria-label="Animation speed" type="range" min=".1" max="2" step=".1" value={speed} onChange={e=>setSpeed(+e.target.value)}/>
          </label>
          <button className="play" onClick={() => setPlaying(!playing)}>
            {playing ? "Ⅱ Pause animation" : "▶ Play animation"}
          </button>
          <h3>Presets</h3>
          <nav>
            {["Default", "High detail", "Transparent", "Publication"].map(
              (x) => (
                <button
                  className={preset === x ? "active" : ""}
                  onClick={() => setPreset(x)}
                  key={x}
                >
                  {x}
                </button>
              ),
            )}
          </nav>
        </aside>
        <section className="avc-about">
          <article>
            <h2>About this visualization</h2>
            <p>
              This qualitative LCAO model of ethene arises from side-on
              overlap of the carbon p<sub>z</sub> orbitals, giving bonding π
              electron density above and below the molecular plane. The nodal
              plane lies in the plane of the molecule, where a π wavefunction
              changes sign (red/blue indicates phase). LUMO adds a node between the carbons. Isovalues are in arbitrary amplitude units; this is not a calculated ab initio density.
            </p>
          </article>
          <div className="formula">
            <svg viewBox="0 0 120 100" role="img" aria-label="Planar ethene: two carbons joined by a double bond, each bonded to two hydrogens.">
              <g stroke="currentColor" strokeWidth="1.5" fill="none">
                <path d="M47 46H73 M47 51H73 M35 39L22 20 M35 57L22 77 M85 39L98 20 M85 57L98 77"/>
              </g>
              <g fill="currentColor" fontSize="18" textAnchor="middle">
                <text x="38" y="55">C</text><text x="82" y="55">C</text>
                <text x="17" y="18">H</text><text x="103" y="18">H</text>
                <text x="17" y="94">H</text><text x="103" y="94">H</text>
              </g>
            </svg>
            <small>C₂H₄ · Planar (D₂h)</small>
          </div>
          <ul>
            {[
              "Interactive 3D orbital isosurface",
              "Phase and nodal plane visualization",
              "Energy level diagram",
              "Compare with electron density",
              "Multiple related chemical systems",
            ].map((x) => (
              <li key={x}>✓　{x}</li>
            ))}
          </ul>
        </section>
        </>}
      </main>
      {library && <div ref={dialogRef} className="avc-library-overlay" role="dialog" aria-modal="true" aria-label="Advanced chemistry lesson library">
        <button onClick={()=>setLibrary(false)}>Close lesson library ×</button>
        <Suspense fallback={<p>Loading lessons…</p>}><AdvancedVisualLegacyLibrary onNavigate={onNavigate}/></Suspense>
      </div>}
    </div>
  );
};
export default AdvancedVisualChemistryPage;
