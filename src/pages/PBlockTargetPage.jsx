import { useEffect, useMemo, useRef, useState } from "react";
import { Atom, BarChart3, FlaskConical, Search, Settings2, Maximize2, RotateCcw, Upload } from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./pBlockTarget.css";
const halogens = [
  ["F₂", "Fluorine", "Gas (pale yellow)", "+2.87", "Cl⁻"],
  ["Cl₂", "Chlorine", "Gas (greenish yellow)", "+1.36", "Br⁻"],
  ["Br₂", "Bromine", "Liquid (red-brown)", "+1.07", "I⁻"],
  ["I₂", "Iodine", "Solid (grey-black)", "+0.54", null],
];
const structureSamples=[
  ["Molecular compound","SF₆","Octahedral sulfur hexafluoride molecule"],
  ["Cluster","B₁₂","Idealized icosahedral boron cluster"],
  ["Cage","P₄O₁₀","Phosphorus oxide molecular cage"],
  ["Allotrope","C₆₀","Idealized fullerene cage sample"],
  ["Solid","Si","Diamond-cubic silicon conventional cell"],
];
function pBlockSdf(kind){
 const atoms=[],bonds=[];const add=(symbol,x,y,z)=>(atoms.push({symbol,x,y,z}),atoms.length),bond=(a,b,o=1)=>bonds.push([a,b,o]);
 if(kind===0){const s=add("S",0,0,0);[[1.58,0,0],[-1.58,0,0],[0,1.58,0],[0,-1.58,0],[0,0,1.58],[0,0,-1.58]].forEach(v=>bond(s,add("F",...v)));}
 if(kind===1){const phi=(1+Math.sqrt(5))/2,verts=[[0,1,phi],[0,-1,phi],[0,1,-phi],[0,-1,-phi],[1,phi,0],[-1,phi,0],[1,-phi,0],[-1,-phi,0],[phi,0,1],[-phi,0,1],[phi,0,-1],[-phi,0,-1]];verts.forEach(v=>add("B",...v));for(let i=0;i<12;i++)for(let j=i+1;j<12;j++){const d=Math.hypot(...verts[i].map((x,k)=>x-verts[j][k]));if(d<2.05)bond(i+1,j+1);}}
 if(kind===2){const p=[[1.4,1.4,1.4],[-1.4,-1.4,1.4],[-1.4,1.4,-1.4],[1.4,-1.4,-1.4]],pids=p.map(v=>add("P",...v));for(let i=0;i<4;i++)for(let j=i+1;j<4;j++){const o=add("O",...(p[i].map((x,k)=>(x+p[j][k])/2)));bond(pids[i],o);bond(pids[j],o);}p.forEach((v,i)=>{const l=Math.hypot(...v),o=add("O",...v.map(x=>x*2.55/l));bond(pids[i],o,2);});}
 if(kind===3){const points=[];for(let i=0;i<60;i++){const y=1-(i/59)*2,r=Math.sqrt(1-y*y),theta=Math.PI*(3-Math.sqrt(5))*i;points.push([3.55*r*Math.cos(theta),3.55*y,3.55*r*Math.sin(theta)]);}points.forEach(v=>add("C",...v));const used=new Set();points.forEach((v,i)=>points.map((w,j)=>[j,Math.hypot(...v.map((x,k)=>x-w[k]))]).filter(([j])=>j!==i).sort((a,b)=>a[1]-b[1]).slice(0,3).forEach(([j])=>{const key=[i,j].sort((a,b)=>a-b).join("-");if(!used.has(key)){used.add(key);bond(i+1,j+1);}}));}
 const atomLines=atoms.map(a=>`${a.x.toFixed(4).padStart(10)}${a.y.toFixed(4).padStart(10)}${a.z.toFixed(4).padStart(10)} ${a.symbol.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join("\n"),bondLines=bonds.map(([a,b,o])=>`${String(a).padStart(3)}${String(b).padStart(3)}${String(o).padStart(3)}  0  0  0  0`).join("\n");return `P-block coordinate sample\nChemistry Universe\n${structureSamples[kind][2]}\n${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\nM  END\n$$$$\n`;
}
export default function PBlockTargetPage() {
  const [h, setH] = useState(1);
  const [running, setRunning] = useState(false);
  const [t, setT] = useState(0);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("Molecular");
  const [notice, setNotice] = useState("");
  const [structureIndex,setStructureIndex]=useState(0);
  const [structureStyle,setStructureStyle]=useState("Ball & stick");
  const [structureReady,setStructureReady]=useState(false);
  const [structureAtom,setStructureAtom]=useState(null);
  const [importedSource,setImportedSource]=useState(null);
  const structureRef=useRef(null),fileRef=useRef(null);
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setT((value) => (value >= 100 ? 0 : value + 2)),
      120,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  const groupLabels = [
    "B",
    "Al",
    "Ga",
    "In",
    "Tl",
    "Nh",
    "C",
    "Si",
    "Ge",
    "Sn",
    "Pb",
    "Fl",
    "N",
    "P",
    "As",
    "Sb",
    "Bi",
    "Mc",
    "O",
    "S",
    "Se",
    "Te",
    "Po",
    "Lv",
    "F",
    "Cl",
    "Br",
    "I",
    "At",
    "Ts",
  ];
  const tileMatches = (index) =>
    !query.trim() ||
    groupLabels[index % groupLabels.length]
      .toLowerCase()
      .includes(query.trim().toLowerCase());
  const [
    halogenFormula,
    halogenName,
    halogenState,
    halogenPotential,
    displacementIon,
  ] = halogens[h];
  const halogenSymbol = halogenFormula.replace("₂", "");
  const displacementSymbol = displacementIon?.replace("⁻", "");
  const displacementText = displacementIon
    ? `${halogenFormula} + 2${displacementIon} → 2${halogenSymbol}⁻ + ${displacementSymbol}₂`
    : "Iodine is the weakest halogen oxidant in this series.";
  const builtSource=useMemo(()=>structureIndex===4?{url:"/assets/p-block/silicon-diamond.cif",format:"cifCore",label:structureSamples[4][2]}:{data:pBlockSdf(structureIndex),format:"sdf",label:structureSamples[structureIndex][2]},[structureIndex]);
  const structureSource=importedSource||builtSource;
  const importStructure=event=>{const file=event.target.files?.[0];if(!file)return;const format=file.name.split(".").pop()?.toLowerCase();if(!["pdb","cif","mmcif","mol","sdf"].includes(format))return;setImportedSource({url:URL.createObjectURL(file),format,label:file.name});setStructureReady(false);event.target.value="";};
  return (
    <div
      className="pblock-app min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[65px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Atom size={35} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">p-Block Chemistry Explorer</h1>
          <p className="text-xs text-slate-400">
            Explore trends. Visualize structures. Understand reactivity.
          </p>
        </div>
        <label className="ml-auto flex items-center gap-2 rounded border border-white/20 px-3 py-2 text-xs">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-72 bg-transparent outline-none"
            placeholder="Search elements, compounds, or reactions..."
          />
        </label>
        <button onClick={() => announce("Visuals selected")}>Visuals</button>
        <button onClick={() => announce("Data selected")}>Data</button>
        <Settings2 size={18} />
      </header>
      <div className="pblock-workspace grid h-[calc(100vh-65px)] grid-cols-[1fr_1.1fr_340px] grid-rows-[1fr_390px] gap-2 p-2">
        <main className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="text-xl font-bold">The p-Block (Groups 13–18)</h2>
          <div className="mt-4 grid h-64 grid-cols-6 items-end gap-1">
            {Array.from({ length: 42 }, (_, i) => (
              <button
                key={i}
                onClick={() => announce(`Element tile ${i + 1} selected`)}
                style={{
                  height: `${[32, 42, 52, 62, 72, 82][i % 6]}%`,
                  opacity: tileMatches(i) ? 1 : 0.2,
                }}
                className="rounded border border-slate-500/60 bg-gradient-to-t from-slate-700 to-slate-500 text-[10px] hover:border-cyan-300"
              >
                {groupLabels[i % groupLabels.length]}
              </button>
            ))}
          </div>
          <div className="mt-3 space-y-2 text-xs">
            <p className="text-blue-300">
              Atomic radius (↓)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-blue-300 to-blue-700" />
            </p>
            <p className="text-yellow-300">
              Ionization energy (↑)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-yellow-300 to-yellow-700" />
            </p>
            <p className="text-emerald-300">
              Reactivity (non-metals) (↓)　
              <span className="inline-block h-2 w-3/4 bg-gradient-to-r from-emerald-300 to-emerald-700" />
            </p>
          </div>
        </main>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="text-xl font-bold">Group 17 · Halogens</h2>
          <p className="text-cyan-300">
            {halogenName} · E° = {halogenPotential} V · {halogenState}
          </p>
          <div className="pblock-halogen-picks mt-3 grid grid-cols-4 gap-2">
            {halogens.map(([f, n, d], i) => (
              <button
                key={f}
                onClick={() => setH(i)}
                className={`rounded border p-3 text-center ${h === i ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
              >
                <div className="mx-auto h-14 w-10 rounded-t-full bg-gradient-to-b from-slate-300/70 to-slate-600/60" />
                <b>{f}</b>
                <br />
                <span className="text-xs">{n}</span>
                <br />
                <span className="text-[10px] text-slate-400">{d}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded border border-white/10 p-3 text-xs">
            ↓ Reactivity decreases down the group
            <br />
            Common oxidation states: −1, +1, +3, +5, +7
          </div>
          <div className="pblock-structure mt-3" data-ready={structureReady}>
            <ViewerErrorBoundary label="P-block structure viewer"><MolstarViewer ref={structureRef} source={structureSource} sourceType={structureSource.format} label={structureSource.label} representation={{BallAndStick:structureStyle==="Ball & stick",Spacefill:structureStyle==="Space filling",Sticks:structureStyle==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" showUnitCell={!importedSource&&structureIndex===4} showLabels={false} onReady={()=>{setStructureReady(true);requestAnimationFrame(()=>structureRef.current?.zoom(structureIndex===3?1.15:1.3));}} onLoadError={()=>setStructureReady(false)} onSelectionChange={setStructureAtom}/></ViewerErrorBoundary>
            <div className="pblock-structure-meta"><b>{structureReady?"Mol* structure ready":"Loading coordinates…"}</b><span>{structureSource.label}</span><span>{structureAtom?`${structureAtom.element} atom ${structureAtom.sourceIndex+1} · [${structureAtom.coordinates.map(v=>v.toFixed(2)).join(", ")}] Å`:structureIndex===4?"Conventional cell · a = 5.431 Å · idealized coordinates":"Finite coordinate model · rotate, zoom, or select an atom"}</span></div>
            <div className="pblock-structure-tools">{structureSamples.map(([type,formula],index)=><button key={type} aria-pressed={!importedSource&&structureIndex===index} onClick={()=>{setStructureIndex(index);setImportedSource(null);setStructureReady(false);setStructureAtom(null);}}>{type}<small>{formula}</small></button>)}{["Ball & stick","Space filling","Sticks"].map(style=><button key={style} aria-pressed={structureStyle===style} onClick={()=>setStructureStyle(style)}>{style}</button>)}<button onClick={()=>fileRef.current?.click()} title="Import p-block structure"><Upload size={14}/></button><button onClick={()=>structureRef.current?.reset()} title="Reset p-block view"><RotateCcw size={14}/></button><button onClick={()=>structureRef.current?.fullscreen()} title="Full screen p-block view"><Maximize2 size={14}/></button><input ref={fileRef} type="file" hidden accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importStructure}/></div>
          </div>
        </section>
        <aside className="row-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Key Features</h2>
          {[
            ["↓", "Reactivity decreases down the group"],
            ["⚗", "Common oxidation states: −1, +1, +3, +5, +7"],
            ["△", "Form acidic oxides and oxyacids"],
            ["⇄", "Displacement reactions"],
          ].map(([a, b]) => (
            <div key={b} className="mt-5 flex gap-3 text-xs">
              <span className="text-2xl text-emerald-300">{a}</span>
              <span>
                {b}
                <br />
                <span className="text-slate-400">
                  Weaker X–X bonds, larger atoms, lower oxidizing power.
                </span>
              </span>
            </div>
          ))}
          <div className="mt-5 rounded border border-cyan-300/30 p-3 text-sm italic">
            Halogens are powerful oxidizing agents that form salts,
            interhalogens and oxyacids.
          </div>
          <h2 className="mt-6 font-bold">Compare Oxidation States</h2>
          {[
            "+7 HClO₄",
            "+5 HClO₃",
            "+3 HClO₂",
            "+1 HOCl",
            "0 Cl₂",
            "−1 Cl⁻",
          ].map((x) => (
            <div key={x} className="border-b border-white/10 py-2 text-xs">
              {x}
            </div>
          ))}
        </aside>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">Redox Perspective</h3>
          <p className="mt-3 text-lg">
            {halogenFormula} + 2e⁻ → 2{halogenSymbol}⁻　 E° ={" "}
            {halogenPotential} V
          </p>
          <p className="mt-2 text-lg">Selected oxidant: {halogenName}</p>
          <div className="mt-4 rounded border border-cyan-300/30 p-3 text-xs">
            {displacementText}
          </div>
        </section>
        <section className="rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex justify-between">
            <h3 className="font-bold">Displacement Reaction</h3>
            <button
              onClick={() => {
                setRunning((v) => !v);
                announce(running ? "Reaction paused" : "Reaction running");
              }}
              className="rounded bg-blue-500 px-3 py-2 text-xs"
            >
              {running ? "Pause" : "Run displacement reaction"}
            </button>
          </div>
          <p className="mt-2 text-cyan-300">
            {displacementIon
              ? `${halogenName} displaces ${displacementIon} from solution`
              : "No weaker halogen remains to displace."}
          </p>
          <div className="mt-8 text-center text-5xl text-lime-300">
            ● ●　→　● ●
          </div>
          <p className="mt-2 text-center text-xs text-cyan-200">
            {view === "Equation"
              ? displacementText
              : view === "Ionic"
                ? "Ions exchange in aqueous solution"
                : "Molecular collision view"}
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={t}
            onChange={(e) => setT(+e.target.value)}
            className="mt-5 w-full accent-cyan-300"
          />
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setView("Molecular")}
              className={`flex-1 rounded p-2 text-xs ${view === "Molecular" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Molecular view
            </button>
            <button
              onClick={() => setView("Ionic")}
              className={`flex-1 rounded p-2 text-xs ${view === "Ionic" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Ionic view
            </button>
            <button
              onClick={() => setView("Equation")}
              className={`flex-1 rounded p-2 text-xs ${view === "Equation" ? "bg-indigo-500" : "border border-white/20"}`}
            >
              Σ Show equation
            </button>
          </div>
        </section>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/40 bg-slate-950 px-4 py-2 text-xs"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
