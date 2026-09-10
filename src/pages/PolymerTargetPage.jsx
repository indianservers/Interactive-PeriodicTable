import { useMemo, useRef, useState } from "react";
import {
  BarChart3,
  Beaker,
  Boxes,
  ChevronRight,
  CircleHelp,
  GitCompare,
  Library,
  Moon,
  Settings2,
  Sun,
  Maximize2,
  RotateCcw,
  Upload,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./polymerTarget.css";

const monomers = [
  [
    "Ethene",
    "C₂H₄",
    "Vinyl group",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Propene",
    "C₃H₆",
    "Alkene",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Styrene",
    "C₈H₈",
    "Aromatic vinyl",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Vinyl chloride",
    "C₂H₃Cl",
    "Chloroalkene",
    "Addition",
    "Radical chain-growth",
    "No small molecule",
  ],
  [
    "Lactic acid",
    "C₃H₆O₃",
    "Hydroxy acid",
    "Condensation",
    "Step-growth polyesterification",
    "Water released",
  ],
];

function oligomerSdf(index, repeatCount) {
  const atoms=[],bonds=[];
  const add=(symbol,x,y,z)=>(atoms.push({symbol,x,y,z}),atoms.length), bond=(a,b,order=1)=>bonds.push([a,b,order]);
  const backbone=[];
  for(let i=0;i<repeatCount*2;i++){const id=add("C",i*1.48,(i%2?-.34:.34),((i%3)-1)*.16);backbone.push(id);if(i)bond(backbone[i-1],id);}
  for(let repeat=0;repeat<repeatCount;repeat++){
    const anchor=backbone[repeat*2+1],a=atoms[anchor-1],side=repeat%2?1:-1;
    if(index===1){const methyl=add("C",a.x,a.y+side*1.45,a.z+.2);bond(anchor,methyl);}
    if(index===2){let previous=anchor;for(let k=0;k<6;k++){const angle=2*Math.PI*k/6,x=a.x+Math.cos(angle)*1.35,y=a.y+side*(1.55+Math.sin(angle)*1.35),id=add("C",x,y,a.z+.3);if(k===0)bond(anchor,id);if(k)bond(previous,id,k%2?2:1);previous=id;}bond(previous,atoms.length-5,1);}
    if(index===3){const chlorine=add("Cl",a.x,a.y+side*1.62,a.z);bond(anchor,chlorine);}
    if(index===4){const carbonyl=add("C",a.x+.7,a.y+side*1.38,a.z),oxygen=add("O",a.x+.35,a.y+side*2.45,a.z),ether=add("O",a.x+1.45,a.y+side*1.55,a.z+.2),methyl=add("C",a.x-.55,a.y-side*1.25,a.z);bond(anchor,carbonyl);bond(carbonyl,oxygen,2);bond(carbonyl,ether);bond(anchor,methyl);}
  }
  const atomLines=atoms.map(a=>`${a.x.toFixed(4).padStart(10)}${a.y.toFixed(4).padStart(10)}${a.z.toFixed(4).padStart(10)} ${a.symbol.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join("\n");
  const bondLines=bonds.map(([a,b,o])=>`${String(a).padStart(3)}${String(b).padStart(3)}${String(o).padStart(3)}  0  0  0  0`).join("\n");
  return `Finite oligomer preview\nChemistry Universe\n${monomers[index][0]} · ${repeatCount} repeat units\n${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\nM  END\n$$$$\n`;
}
export default function PolymerTargetPage() {
  const [selected, setSelected] = useState(0);
  const [n, setN] = useState(120);
  const [branch, setBranch] = useState(0);
  const [cross, setCross] = useState(0);
  const [tacticity, setTacticity] = useState("Atactic");
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("Molecular");
  const [notice, setNotice] = useState("");
  const [renderStyle, setRenderStyle] = useState("Ball & stick");
  const [structureReady, setStructureReady] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [biopolymer, setBiopolymer] = useState("Cellulose");
  const [importedSource, setImportedSource] = useState(null);
  const viewerRef=useRef(null),fileRef=useRef(null);
  const announce = (x) => setNotice(x);
  const name =
    selected === 0 ? "Polyethylene" : `${monomers[selected][0]} polymer`;
  const polymerization = monomers[selected][3];
  const mechanismLabel = monomers[selected][4];
  const byproduct = monomers[selected][5];
  const visibleMonomers = monomers
    .map((item, index) => ({ item, index }))
    .filter(
      ({ item }) =>
        !query.trim() ||
        item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    );
  const density = Math.max(
    0.72,
    0.92 +
      branch * 0.003 +
      cross * 0.008 +
      (tacticity === "Isotactic"
        ? 0.04
        : tacticity === "Syndiotactic"
          ? 0.02
          : 0),
  );
  const flexibility = Math.max(5, Math.round(100 - branch * 0.8 - cross * 2));
  const glassTransition =
    selected === 2 ? 100 : selected === 3 ? 80 : selected === 4 ? 75 : -125;
  const sampleUnits=Math.min(10,Math.max(2,Math.round(n/12)));
  const biopolymerSources={Cellulose:"cellulose.sdf",Chitin:"chitin.sdf",Starch:"starch.sdf",Glycogen:"glycogen.sdf"};
  const generatedSource=useMemo(()=>({data:oligomerSdf(selected,viewMode==="Polymer"?1:sampleUnits),format:"sdf",label:viewMode==="Polymer"?`${monomers[selected][0]} repeat-unit teaching model`:`${monomers[selected][0]} finite ${sampleUnits}-unit oligomer preview`}),[selected,viewMode,sampleUnits]);
  const activeSource=importedSource||(viewMode==="Material"?{url:`/assets/carbohydrate-studio/structures/${biopolymerSources[biopolymer]}`,format:"sdf",label:`${biopolymer} coordinate-backed chain sample`}:generatedSource);
  const importStructure=event=>{const file=event.target.files?.[0];if(!file)return;const format=file.name.split(".").pop()?.toLowerCase();if(!["pdb","cif","mmcif","mol","sdf"].includes(format))return;setImportedSource({url:URL.createObjectURL(file),format,label:file.name});setStructureReady(false);event.target.value="";};
  return (
    <div
      className="poly-app min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091a2b] px-5">
        <Boxes className="text-cyan-300" size={34} />
        <div>
          <h1 className="text-[24px] font-black">Polymer Builder</h1>
          <p className="text-xs text-slate-400">From monomer to material</p>
        </div>
        <nav className="ml-auto flex items-center gap-6 text-xs">
          <button className="border-b-2 border-cyan-300 py-4 text-cyan-200">
            Simulation
          </button>
          <button onClick={() => announce("Properties selected")}>
            Properties
          </button>
          <button onClick={() => announce("Compare selected")}>Compare</button>
          <button onClick={() => announce("Export started")}>Export</button>
          <select
            value={selected}
            onChange={(e) => {
              const next = Number(e.target.value);
              setSelected(next);
              announce(`${monomers[next][0]} selected`);
            }}
            className="rounded border border-white/20 bg-[#0c2237] p-2"
          >
            {monomers.map(([m], index) => (
              <option key={m} value={index}>
                {m}
              </option>
            ))}
          </select>
          <Sun size={16} />
          <Moon size={16} />
          <span className="rounded-full bg-indigo-400 px-3 py-2 font-bold">
            LS
          </span>
        </nav>
      </header>
      <div className="poly-workspace grid h-[calc(100vh-64px)] grid-cols-[72px_245px_1fr_345px] grid-rows-[1fr_205px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col items-center gap-5 border-r border-white/10 bg-[#081c2e] py-5 text-[10px]">
          {[
            [Boxes, "Builder"],
            [Beaker, "Monomers"],
            [BarChart3, "Simulations"],
            [GitCompare, "Properties"],
            [Library, "Compare"],
            [Library, "Library"],
          ].map(([I, x], i) => (
            <button
              key={x}
              onClick={() => announce(x + " opened")}
              className={`flex w-full flex-col items-center gap-1 py-2 ${i === 0 ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300"}`}
            >
              <I size={20} />
              {x}
            </button>
          ))}
        </aside>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Monomer Library</h2>
          <input
            value={query}
            placeholder="Search monomers..."
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
            onChange={(e) => setQuery(e.target.value)}
          />
          {visibleMonomers.map(({ item: [m, f, d], index: i }) => (
            <button
              key={m}
              onClick={() => {
                setSelected(i);
                announce(m + " loaded");
              }}
              className={`mt-2 w-full rounded-lg border p-3 text-left ${i === selected ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-slate-700">
                  {i === 0 ? "C=C" : "●"}
                </span>
                <span>
                  <b className="text-sm">{m}</b>
                  <br />
                  <span className="text-xs text-slate-400">
                    {f}
                    <br />
                    {d}
                  </span>
                </span>
              </div>
            </button>
          ))}
        </aside>
        <section className="rounded-lg border border-white/10 bg-[#091c2d] p-3">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <p className="text-sm text-slate-400">
                {mechanismLabel} polymerization of{" "}
                {monomers[selected][0].toLowerCase()}
              </p>
            </div>
            <div className="flex rounded border border-white/20 text-xs">
              {["Molecular", "Polymer", "Material"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => {setViewMode(mode);setImportedSource(null);setStructureReady(false);setSelectedAtom(null);}}
                  className={`px-4 py-2 ${viewMode === mode ? "bg-cyan-300/15 text-cyan-200" : ""}`}
                >
                  {mode === "Molecular" ? "⚙" : mode === "Polymer" ? "♧" : "◈"}{" "}
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="poly-mechanism mt-2 grid h-56 grid-cols-3 rounded-lg bg-black/25 p-4">
            <div>
              <h3 className="font-bold text-amber-300">
                1.{" "}
                {polymerization === "Addition"
                  ? "Initiator"
                  : "Functional-group activation"}
              </h3>
              <p className="text-xs text-slate-400">
                {polymerization === "Addition"
                  ? "Radical initiates chain"
                  : "Reactive end groups couple"}
              </p>
              <div className="mt-12 text-center text-4xl text-orange-300">
                ●→●
              </div>
            </div>
            <div className="border-x border-white/10 px-5">
              <h3 className="font-bold text-emerald-300">
                2.{" "}
                {polymerization === "Addition" ? "Propagation" : "Step growth"}
              </h3>
              <p className="text-xs text-emerald-300">
                {polymerization === "Addition"
                  ? "Propagate chain"
                  : "Build polyester links"}
              </p>
              <div className="mt-12 text-center text-4xl text-emerald-300">
                ●—●—●—●
              </div>
            </div>
            <div className="px-5">
              <h3 className="font-bold text-fuchsia-300">
                3. {polymerization === "Addition" ? "Termination" : "Byproduct"}
              </h3>
              <p className="text-xs text-fuchsia-300">
                {polymerization === "Addition"
                  ? "Two radicals combine"
                  : byproduct}
              </p>
              <div className="mt-12 text-center text-4xl text-slate-300">
                ●—●—●
              </div>
            </div>
          </div>
          <div className="poly-structure mt-2 text-xs" data-ready={structureReady}>
            <ViewerErrorBoundary label="Polymer structure viewer"><MolstarViewer ref={viewerRef} source={activeSource} sourceType={activeSource.format} label={activeSource.label} representation={{BallAndStick:renderStyle==="Ball & stick",Spacefill:renderStyle==="Space filling",Sticks:renderStyle==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" showLabels={false} onReady={()=>{setStructureReady(true);requestAnimationFrame(()=>viewerRef.current?.zoom(viewMode==="Material"?1.18:1.32));}} onLoadError={()=>setStructureReady(false)} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary>
            <div className="poly-structure-meta"><b>{structureReady?"Mol* structure ready":"Loading coordinates…"}</b><span>{activeSource.label}</span><span>{selectedAtom?`${selectedAtom.element} atom ${selectedAtom.sourceIndex+1} · [${selectedAtom.coordinates.map(v=>v.toFixed(2)).join(", ")}] Å`:viewMode==="Molecular"?`Finite ${sampleUnits}-unit sample · requested bulk n = ${n}`:viewMode==="Polymer"?"Repeat unit only · hydrogen-suppressed teaching geometry":"Coordinate-backed biopolymer sample; not a bulk-material morphology model"}</span></div>
            <div className="poly-structure-tools">{["Ball & stick","Space filling","Sticks"].map(style=><button key={style} aria-pressed={renderStyle===style} onClick={()=>setRenderStyle(style)}>{style}</button>)}{viewMode==="Material"&&<select aria-label="Biopolymer sample" value={biopolymer} onChange={e=>{setBiopolymer(e.target.value);setImportedSource(null);setStructureReady(false);}}>{Object.keys(biopolymerSources).map(item=><option key={item}>{item}</option>)}</select>}<button onClick={()=>fileRef.current?.click()} title="Import polymer structure"><Upload size={14}/></button><button onClick={()=>viewerRef.current?.reset()} title="Reset polymer view"><RotateCcw size={14}/></button><button onClick={()=>viewerRef.current?.fullscreen()} title="Full screen polymer view"><Maximize2 size={14}/></button><input ref={fileRef} type="file" hidden accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importStructure}/></div>
          </div>
        </section>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Polymerization Controls</h2>
          <label className="mt-4 block text-xs">
            Degree of polymerization (n)
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {n}
            </output>
          </label>
          <input
            type="range"
            min="10"
            max="1000"
            value={n}
            onChange={(e) => setN(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">
            Branching (long-chain)
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {branch}%
            </output>
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={branch}
            onChange={(e) => setBranch(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">
            Cross-link density
            <output className="float-right rounded border border-white/20 px-3 py-1">
              {cross}%
            </output>
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={cross}
            onChange={(e) => setCross(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <label className="mt-5 block text-xs">Tacticity</label>
          <select
            aria-label="Tacticity"
            value={tacticity}
            onChange={(e) => setTacticity(e.target.value)}
            className="mt-2 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Atactic</option>
            <option>Isotactic</option>
            <option>Syndiotactic</option>
          </select>
          <h2 className="mt-6 font-bold">Predicted Properties</h2>
          {[
            ["Density", `${density.toFixed(2)} g/cm³`],
            ["Flexibility", `${flexibility}%`],
            ["Tg (glass transition)", `${glassTransition} °C`],
            ["Recyclability", cross > 12 ? "Moderate" : "High"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span className="text-slate-400">{a}</span>
              <b className="text-emerald-300">{b}</b>
            </div>
          ))}
          <div className="mt-4 rounded border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs">
            ♧ Sustainable by design
            <br />
            <span className="text-slate-400">
              Adjust structure to explore how molecular design affects
              performance and end-of-life.
            </span>
          </div>
        </aside>
        <section className="poly-comparison rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h3 className="font-bold">
            Addition vs Condensation Polymerization{" "}
            <CircleHelp size={14} className="inline text-slate-400" />
          </h3>
          <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
            <div className="rounded border border-white/10 p-3">
              <b className="text-cyan-300">Addition Polymerization</b>
              <div className="my-3 text-center text-lg">C=C → [—C—C—]ₙ</div>
              <p>
                • No small molecule byproduct
                <br />• Fast chain-growth
                <br />• Common for vinyl monomers
              </p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b className="text-fuchsia-300">Condensation Polymerization</b>
              <div className="my-3 text-center text-lg">
                ●—● → [—●—●—]ₙ + H₂O
              </div>
              <p>
                • Releases small molecule
                <br />• Step-growth mechanism
                <br />• Common for polyesters
              </p>
            </div>
            <div className="rounded border border-white/10 p-3">
              <b>Key Differences</b>
              <p className="mt-3 leading-6">
                Monomers: vinyl vs bifunctional
                <br />
                Mechanism: chain-growth vs step-growth
                <br />
                Byproduct: none vs small molecule
              </p>
            </div>
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
