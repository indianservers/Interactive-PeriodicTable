import { useEffect, useMemo, useRef, useState } from "react";
import {
  Beaker,
  CheckCircle2,
  FileUp,
  FlaskConical,
  Home,
  Maximize2,
  Play,
  Search,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./retrosynthesisTarget.css";
const transforms = [
  "Ester Hydrolysis",
  "Fischer Esterification",
  "Nitro Reduction",
  "Amine Protection (Boc)",
  "Amide to Amine (Reduction)",
  "Diazotization",
  "Nucleophilic Aromatic Substitution",
  "Functional Group Interconversion",
];
const structureOptions={target:{label:"Benzocaine",file:"benzocaine.sdf",cid:"PubChem CID 2337"},paba:{label:"4-aminobenzoic acid",file:"paba.sdf",cid:"PubChem CID 978"},ethanol:{label:"Ethanol",file:"ethanol.sdf",cid:"PubChem CID 702"}};
function BenzocaineSvg({ compact = false }) {
  return (
    <svg
      viewBox="0 0 360 150"
      className={compact ? "h-20 w-48" : "h-36 w-full"}
      role="img"
      aria-label="Benzocaine molecular structure"
    >
      <path
        d="M44 75L78 40L120 40L154 75L120 110L78 110Z"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="3"
      />
      <path
        d="M61 75L87 50M95 40L130 65M130 85L103 106"
        stroke="#60a5fa"
        strokeWidth="3"
      />
      <text x="3" y="80" fill="#60a5fa" fontSize="16">
        H₂N
      </text>
      <line x1="34" y1="75" x2="44" y2="75" stroke="#60a5fa" strokeWidth="3" />
      <line
        x1="154"
        y1="75"
        x2="188"
        y2="75"
        stroke="#cbd5e1"
        strokeWidth="3"
      />
      <text x="184" y="70" fill="#f87171" fontSize="14">
        C=O
      </text>
      <line
        x1="220"
        y1="75"
        x2="250"
        y2="75"
        stroke="#f87171"
        strokeWidth="3"
      />
      <text x="246" y="70" fill="#f87171" fontSize="14">
        O
      </text>
      <line
        x1="260"
        y1="75"
        x2="290"
        y2="75"
        stroke="#cbd5e1"
        strokeWidth="3"
      />
      <text x="286" y="70" fill="#e2e8f0" fontSize="14">
        CH₂CH₃
      </text>
    </svg>
  );
}
export default function RetrosynthesisTargetPage({ onNavigate }) {
  const viewerRef=useRef(null);
  const [route, setRoute] = useState("A"),
    [selectedTransform, setSelectedTransform] = useState(transforms[0]),
    [extraRoute, setExtraRoute] = useState(false),
    [progress, setProgress] = useState(0),
    [tab, setTab] = useState("3D"),
    [bond, setBond] = useState(false),
    [running, setRunning] = useState(false),
    [query, setQuery] = useState(""),
    [notice, setNotice] = useState("");
  const [structureKey,setStructureKey]=useState("target"),[structureStyle,setStructureStyle]=useState("Ball & stick"),[viewerReady,setViewerReady]=useState(false),[selectedAtom,setSelectedAtom]=useState(null),[importedSource,setImportedSource]=useState(null);
  const structure=structureOptions[structureKey];
  const viewerSource=useMemo(()=>importedSource||{url:`/assets/retrosynthesis/${structure.file}`,format:"sdf",label:`${structure.label} · ${structure.cid}`},[importedSource,structure]);
  const importCoordinates=event=>{const file=event.target.files?.[0];if(!file)return;const ext=file.name.split('.').pop()?.toLowerCase(),format=ext==='cif'||ext==='mmcif'?'mmcif':ext;if(!['pdb','mmcif','mol','sdf'].includes(format)){msg('Use PDB, CIF, MOL, or SDF coordinates');return;}const reader=new FileReader();reader.onload=()=>{setImportedSource({data:String(reader.result),format,label:file.name});setTab('3D');setViewerReady(false);};reader.readAsText(file);};
  const routeOptions = extraRoute ? ["A", "B", "C"] : ["A", "B"];
  const visibleTransforms = transforms.filter((item) =>
    item.toLowerCase().includes(query.toLowerCase()),
  );
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setProgress((value) => (value >= 100 ? 0 : value + 5)),
      180,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  const msg = (x) => setNotice(x);
  return (
    <div
      className="retro-app min-h-screen overflow-hidden bg-[#071827] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[62px] items-center gap-4 border-b border-white/10 bg-[#0a1c2c] px-5">
        <Beaker className="text-cyan-300" />
        <div>
          <h1 className="text-xl font-black">Retrosynthesis Planner</h1>
          <p className="text-xs text-slate-400">
            Plan. Learn. Explore. Safer Chemistry.
          </p>
        </div>
        <label className="ml-auto flex w-72 gap-2 rounded border border-white/15 px-3 py-2 text-xs text-slate-400">
          <Search size={14} />
          <input
            placeholder="Search reactions, reagents, or topics..."
            className="w-full bg-transparent outline-none"
          />
        </label>
        <span className="text-xs">? Help</span>
        <span className="text-xs">▣ Projects</span>
        <span className="rounded-full bg-blue-500 px-3 py-2 text-xs">DL</span>
      </header>
      <div className="retro-shell grid h-[calc(100vh-62px)] grid-cols-[175px_1fr_355px] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0b2033] p-3">
          {[
            "Home",
            "Retrosynthesis",
            "Reaction Library",
            "Forward Simulator",
            "Molecule Editor",
            "Literature Search",
            "Green Chemistry",
            "My Projects",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => (x === "Home" ? onNavigate?.("dashboard") : msg(`${x} selected`))}
              className={`mb-1 flex w-full gap-2 rounded px-3 py-3 text-left text-xs ${i === 1 ? "border-l-2 border-blue-400 bg-blue-500/15 text-blue-200" : "text-slate-300"}`}
            >
              <Home size={15} />
              {x}
            </button>
          ))}
          <div className="mt-10 rounded border border-amber-300/20 p-3 text-[10px] text-amber-100">
            🎓 Educational Use Only
            <br />
            <span className="text-slate-400">
              Not for laboratory use. Results are predictions.
            </span>
          </div>
        </aside>
        <main className="min-w-0 overflow-auto">
          <section className="rounded border border-white/10 bg-[#0b2134] p-4">
            <div className="flex justify-between">
              <div>
                <h2 className="text-2xl font-black">Target · Benzocaine</h2>
                <p className="text-sm text-slate-400">
                  Ethyl 4-aminobenzoate　 C₉H₁₁NO₂　 MW 165.19
                </p>
                <div className="mt-3 flex gap-2">
                  <span className="rounded-full border px-3 py-1 text-xs">
                    Anesthetic
                  </span>
                  <span className="rounded-full border px-3 py-1 text-xs">
                    API (historical)
                  </span>
                  <span className="rounded-full border border-emerald-400 px-3 py-1 text-xs text-emerald-300">
                    Simple target
                  </span>
                </div>
              </div>
              <div className="retro-preview">
                <button
                  onClick={() => setTab("2D")}
                  className={`px-4 py-2 text-xs ${tab === "2D" ? "bg-blue-500" : "border"}`}
                >
                  2D
                </button>
                <button
                  onClick={() => setTab("3D")}
                  className={`px-4 py-2 text-xs ${tab === "3D" ? "bg-blue-500" : "border"}`}
                >
                  3D
                </button>
                <div className="retro-structure-tabs">{Object.entries(structureOptions).map(([key,item])=><button key={key} className={structureKey===key&&!importedSource?"active":""} onClick={()=>{setStructureKey(key);setImportedSource(null);setTab("3D");setViewerReady(false);setSelectedAtom(null);}}>{key==="target"?"Target":item.label}</button>)}</div>
                <div className="retro-target-view">{tab==="2D"?<BenzocaineSvg compact/>:<><ViewerErrorBoundary label="Retrosynthesis structure preview"><MolstarViewer ref={viewerRef} source={viewerSource} sourceType={viewerSource.format} label={viewerSource.label} representation={{BallAndStick:structureStyle==="Ball & stick",Spacefill:structureStyle==="Space filling",Sticks:structureStyle==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" onReady={()=>{setViewerReady(true);requestAnimationFrame(()=>viewerRef.current?.zoom(1.25));}} onLoadError={()=>setViewerReady(false)} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary><span>{viewerReady?"Mol* ready":"Loading…"} · {importedSource?importedSource.label:structure.cid}</span></>}</div>
                <div className="retro-view-tools"><select value={structureStyle} onChange={event=>setStructureStyle(event.target.value)}><option>Ball &amp; stick</option><option>Space filling</option><option>Sticks</option></select><label><FileUp size={13}/>Import<input type="file" accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importCoordinates}/></label><button aria-label="Full screen retrosynthesis structure" onClick={()=>viewerRef.current?.fullscreen()}><Maximize2 size={13}/></button></div>
                <p className="retro-atom">{selectedAtom?`${selectedAtom.element} atom ${selectedAtom.sourceIndex+1} · [${selectedAtom.coordinates.map(value=>value.toFixed(2)).join(", ")}] Å`:"Click an atom to inspect coordinates"}</p>
              </div>
            </div>
          </section>
          <div className="mt-3 grid grid-cols-[280px_1fr] gap-3">
            <section className="rounded border border-white/10 bg-[#0b2134] p-3">
              <h3 className="font-bold">Reaction Transform Library</h3>
              <input
                placeholder="Search transformations..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="mt-3 w-full rounded border border-white/15 bg-slate-950 p-2 text-xs"
              />
              {visibleTransforms.map((x, i) => (
                <button
                  key={x}
                  onClick={() => {
                    setSelectedTransform(x);
                    msg(`${x} selected`);
                  }}
                  className={`mt-2 flex w-full items-center justify-between rounded border p-2 text-left text-xs ${selectedTransform === x ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
                >
                  <span>{x}</span>
                  <small className="text-emerald-300">
                    {i < 4 ? "Common" : "Situational"}
                  </small>
                </button>
              ))}
              {visibleTransforms.length === 0 && (
                <p className="mt-3 rounded border border-amber-300/20 bg-amber-300/10 p-2 text-xs text-amber-100">
                  No matching transformations.
                </p>
              )}
            </section>
            <section className="rounded border border-white/10 bg-[#0b2134] p-4">
              <h3 className="font-bold">1. Choose a strategic bond</h3>
              <p className="mt-1 text-xs text-slate-400">
                Click a bond on the target molecule to disconnect.
              </p>
              <div className="my-6 grid place-items-center rounded border border-white/10 bg-slate-950/30 p-2">
                <BenzocaineSvg />
              </div>
              <div className="rounded border border-blue-400/40 bg-blue-500/10 p-3 text-xs">
                <b>Suggested disconnection</b>
                <p className="mt-2 text-cyan-100">
                  Selected transform: {selectedTransform}
                </p>
                <p className="mt-2 text-slate-300">
                  Break the acyl–oxygen bond (ester disconnection). Leads to
                  carboxylic acid + alcohol.
                </p>
              </div>
              <button
                onClick={() => {
                  setBond(true);
                  msg("Disconnection confirmed");
                }}
                className="mt-4 rounded bg-indigo-500 px-4 py-2 text-xs font-bold"
              >
                {bond ? "Disconnection confirmed ✓" : "Confirm disconnection →"}
              </button>
              <div className="mt-5 rounded border border-white/10 p-3">
                <h4 className="font-bold">Retrosynthetic step 1</h4>
                <div className="mt-4 flex justify-around text-center text-xs">
                  <button onClick={()=>{setStructureKey("paba");setImportedSource(null);setTab("3D");setViewerReady(false);}}>
                    p-Aminobenzoic acid
                    <br />
                    <small>C₇H₇NO₂</small>
                  </button>
                  <b className="text-2xl">+</b>
                  <button onClick={()=>{setStructureKey("ethanol");setImportedSource(null);setTab("3D");setViewerReady(false);}}>
                    Ethanol
                    <br />
                    <small>C₂H₆O</small>
                  </button>
                </div>
              </div>
            </section>
          </div>
          <section className="mt-3 rounded border border-white/10 bg-[#0b2134] p-3">
            <div className="flex items-center gap-3">
              <FlaskConical className="text-purple-300" />
              <div>
                <h3 className="font-bold text-purple-200">
                  Validate forward synthesis
                </h3>
                <p className="text-xs text-slate-400">
                  Simulate the forward reaction for the selected step.
                </p>
              </div>
              <button
                onClick={() => {
                  setRunning(!running);
                  msg(running ? "Simulation paused" : "Simulation running");
                }}
                className="ml-auto rounded bg-indigo-500 px-4 py-2 text-xs"
              >
                <Play size={14} className="mr-1 inline" />
                {running ? "Pause" : "Run Simulation"}
              </button>
              <span className="rounded border px-3 py-2 text-xs">
                Predicted yield {running ? `${progress}%` : "85%"}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full rounded bg-cyan-300 transition-all"
                style={{ width: `${running ? progress : bond ? 100 : 0}%` }}
              />
            </div>
          </section>
        </main>
        <aside className="overflow-auto rounded border border-white/10 bg-[#0b2033] p-4">
          <h2 className="text-lg font-bold">Target Properties</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <span>
              Formula <b className="float-right">C₉H₁₁NO₂</b>
            </span>
            <span>
              cLogP <b className="float-right">2.1</b>
            </span>
            <span>
              Molecular Weight <b className="float-right">165.19</b>
            </span>
            <span>
              Melting Point <b className="float-right">88–90°C</b>
            </span>
            <span>
              H-bond Donors <b className="float-right">1</b>
            </span>
            <span>
              H-bond Acceptors <b className="float-right">3</b>
            </span>
          </div>
          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Route Comparison</h2>
            <button
              onClick={() => {
                setExtraRoute(true);
                setRoute("C");
                msg("New route added");
              }}
              className="rounded border border-blue-400 px-3 py-1 text-xs"
            >
              + Add route
            </button>
          </div>
          {routeOptions.map((r) => (
            <button
              key={r}
              onClick={() => setRoute(r)}
              className={`mt-3 w-full rounded border p-3 text-left ${route === r ? "border-cyan-300" : "border-white/10"}`}
            >
              <b>
                Route {r} · {r === "A" ? 3 : 4} steps
              </b>
              <p className="mt-2 text-xs text-slate-400">
                {r === "A"
                  ? "Nitration → Reduction → Esterification"
                  : r === "B"
                    ? "Protection → Nitration → Reduction → Deprotection → Esterification"
                    : "Direct amidation → Reduction → Esterification"}
              </p>
              {[1, 2, 3].slice(0, r === "A" ? 3 : 2).map((i) => (
                <div key={i} className="mt-3 text-xs">
                  <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                    {i}
                  </span>
                  {["Nitration", "Reduction", "Esterification"][i - 1]}{" "}
                  <span className="float-right text-emerald-300">
                    {78 + i * 5}%
                  </span>
                </div>
              ))}
              <div className="mt-4 flex justify-between text-xs">
                <span>Overall yield</span>
                <b>{r === "A" ? "61%" : r === "B" ? "48%" : "67%"}</b>
              </div>
            </button>
          ))}
          <div className="mt-4 rounded border border-emerald-400/40 bg-emerald-400/10 p-3 text-xs text-emerald-200">
            <CheckCircle2 size={15} className="mr-1 inline" />
            Simulation complete
            <br />
            <span className="text-slate-300">
              This reaction is predicted to proceed well under the selected
              conditions.
            </span>
          </div>
        </aside>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/30 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
