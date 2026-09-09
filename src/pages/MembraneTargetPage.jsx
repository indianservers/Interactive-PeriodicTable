import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Droplets,
  Home,
  Play,
  RotateCcw,
  Settings2,
  Maximize2,
  Database,
  Waves,
} from "lucide-react";
import "./biochemistryPages.css";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";

const PUMP_SOURCE={url:"/assets/membranes/structures/4HQJ.cif",format:"mmcif",label:"4HQJ Na+,K+-ATPase"};

function MolecularMembraneScene({viewerRef,style,setStyle,showPlane,setShowPlane,ready,setReady,selectedAtom,setSelectedAtom,focusChain,focusLigand}) {
  return <div className="relative h-[520px] overflow-hidden rounded bg-[#06131f]" data-membrane-view="molecular">
    <ViewerErrorBoundary label="Membrane protein viewer"><MolstarViewer ref={viewerRef} source={PUMP_SOURCE} sourceType="mmcif" pdbId="4HQJ" label="Na+,K+-ATPase in the Na+-bound state" representation={{Cartoon:style==="Cartoon",Surface:style==="Surface",BallAndStick:style==="Atoms",Ligand:true,Ion:true}} colorScheme="chain" showLabels={false} onReady={()=>{setReady(true);requestAnimationFrame(()=>viewerRef.current?.zoom(1.8));}} onLoadError={()=>setReady(false)} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary>
    <div className="pointer-events-none absolute left-3 top-3 z-10 rounded border border-white/10 bg-[#06131fdd] px-2 py-1 text-[10px] text-slate-300"><b className="text-cyan-200">PDB 4HQJ</b> · Na⁺-bound Na⁺/K⁺-ATPase · X-ray diffraction · 4.30 Å · <i>Sus scrofa</i></div>
    {showPlane&&<div className="pointer-events-none absolute inset-x-0 top-1/2 z-[5] h-36 -translate-y-1/2 border-y border-cyan-300/65 bg-cyan-400/[.055]" data-membrane-plane="approximate"><span className="absolute left-3 top-2 rounded bg-[#06131fd9] px-2 py-1 text-[10px] text-cyan-100">Hydrophilic headgroup region</span><span className="absolute bottom-2 left-3 rounded bg-[#06131fd9] px-2 py-1 text-[10px] text-amber-100">Hydrophobic membrane core · schematic orientation guide</span></div>}
    <div className="absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1 rounded border border-white/10 bg-[#06131fdd] p-2 text-[10px]">
      <span className={`mr-1 self-center ${ready?"text-emerald-300":"text-slate-400"}`}>{ready?"Mol* ready":"Loading 4HQJ…"}</span>
      {["Cartoon","Surface","Atoms"].map(item=><button key={item} aria-pressed={style===item} onClick={()=>setStyle(item)} className={`rounded border px-2 py-1 ${style===item?"border-cyan-300 bg-cyan-300/15":"border-white/15"}`}>{item}</button>)}
      <button aria-pressed={showPlane} onClick={()=>setShowPlane(value=>!value)} className="rounded border border-white/15 px-2 py-1">Membrane plane</button>
      <button onClick={()=>viewerRef.current?.reset()} className="rounded border border-white/15 px-2 py-1">Reset</button><button aria-label="Full screen molecular structure" onClick={()=>viewerRef.current?.fullscreen()} className="rounded border border-white/15 px-2 py-1"><Maximize2 size={13}/></button>
    </div>
    <div className="absolute bottom-12 left-3 z-10 flex flex-wrap gap-1 rounded border border-white/10 bg-[#06131fdd] p-2 text-[10px]"><span className="self-center text-slate-400">Chains</span>{[["A","α transporter"],["B","β subunit"],["G","FXYD"]].map(([chain,label])=><button key={chain} onClick={()=>focusChain(chain)} className="rounded border border-white/15 px-2 py-1">{chain} · {label}</button>)}<span className="ml-1 self-center text-slate-400">Ligands</span>{[["NA","Na⁺"],["ADP","ADP"],["CLR","cholesterol"]].map(([id,label])=><button key={id} onClick={()=>focusLigand(id)} className="rounded border border-white/15 px-2 py-1">{label}</button>)}</div>
    <div className="absolute bottom-2 right-3 z-10 max-w-[70%] rounded bg-[#06131fd9] px-2 py-1 text-right text-[10px] text-slate-300">{selectedAtom?`${selectedAtom.element} · ${selectedAtom.residueName} ${selectedAtom.atom} · chain ${selectedAtom.chain} · [${selectedAtom.coordinates.map(value=>value.toFixed(2)).join(", ")}] Å`:"Click an atom to inspect chain, ligand, and Cartesian coordinates"}</div>
  </div>;
}

function MembraneScene({
  composition,
  showWater,
  showLabels,
  running,
  speed,
  water,
}) {
  const lipids = Array.from({ length: 24 }, (_, index) => 18 + index * 24);
  const waters = Array.from({ length: 30 }, (_, index) => ({
    x: 20 + ((index * 73) % 560),
    y: 35 + ((index * 47) % 430),
  }));
  return (
    <svg
      viewBox="0 0 620 520"
      preserveAspectRatio="none"
      className={running ? "animate-pulse" : ""}
      style={{ width: "100%", height: "100%" }}
      aria-label="Procedural membrane and transport scene"
    >
      <defs>
        <marker
          id="memArrow"
          markerWidth="8"
          markerHeight="8"
          refX="6"
          refY="3"
          orient="auto"
        >
          <path d="M0 0 L0 6 L7 3Z" fill="#ff8abd" />
        </marker>
        <linearGradient id="bilayer" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#559ee8" />
          <stop offset=".18" stopColor="#c4d2de" />
          <stop offset=".5" stopColor="#263747" />
          <stop offset=".82" stopColor="#c4d2de" />
          <stop offset="1" stopColor="#559ee8" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <rect width="620" height="520" fill="#0b2a42" />
      {showWater &&
        waters.map((p, i) => (
          <g key={i} opacity={Math.max(0.18, water / 100)}>
            <circle cx={p.x} cy={p.y} r="3" fill="#d8f4ff" />
            <circle cx={p.x + 5} cy={p.y + 4} r="2" fill="#d8f4ff" />
            <line
              x1={p.x}
              y1={p.y}
              x2={p.x + 5}
              y2={p.y + 4}
              stroke="#d8f4ff"
              strokeWidth="1"
            />
          </g>
        ))}
      <rect
        y="195"
        width="620"
        height="130"
        fill="url(#bilayer)"
        opacity=".9"
      />
      {lipids.map((x) => (
        <g key={x}>
          <circle cx={x} cy="201" r="6" fill="#5d9eed" />
          <circle cx={x} cy="319" r="6" fill="#5d9eed" />
          <path
            d={`M${x - 3} 210 V290 M${x + 3} 210 V290`}
            stroke="#dce6eb"
            strokeWidth="3"
            opacity=".65"
          />
        </g>
      ))}
      <path
        d="M128 210 C105 230 105 290 128 310 C151 290 151 230 128 210Z"
        fill="#704be9"
        stroke="#bda9ff"
        strokeWidth="3"
      />
      <path
        d="M292 210 C268 230 268 290 292 310 C316 290 316 230 292 210Z"
        fill="#42c99a"
        stroke="#baffdf"
        strokeWidth="3"
      />
      <path
        d="M470 205 C442 226 442 294 470 315 C500 295 500 225 470 205Z"
        fill="#e85a82"
        stroke="#ffb0c8"
        strokeWidth="3"
      />
      <g fill="#efb532">
        {Array.from(
          { length: Math.max(2, Math.round(composition.cholesterol / 4)) },
          (_, i) => (
            <circle
              key={i}
              cx={190 + ((i * 31) % 250)}
              cy={220 + (i % 3) * 30}
              r="5"
            />
          ),
        )}
      </g>
      <g fill="#62a5ff">
        <circle cx="116" cy="160" r="8" />
        <circle cx="149" cy="155" r="8" />
        <circle cx="505" cy="150" r="8" />
      </g>
      <g fill="#f4a92e">
        <circle cx="440" cy="370" r="8" />
        <circle cx="480" cy="385" r="8" />
        <circle cx="525" cy="360" r="8" />
      </g>
      {showLabels && (
        <>
          <text x="15" y="30" fill="#e8f6ff" fontSize="16" fontWeight="700">
            Extracellular Fluid
          </text>
          <text x="15" y="48" fill="#b5d1e7" fontSize="11">
            (outside cell)
          </text>
          <text x="15" y="490" fill="#e8f6ff" fontSize="16" fontWeight="700">
            Cytoplasm
          </text>
          <text x="15" y="507" fill="#b5d1e7" fontSize="11">
            (inside cell)
          </text>
          <text x="96" y="188" fill="#d4c4ff" fontSize="11">
            Channel protein
          </text>
          <text x="263" y="188" fill="#baffdf" fontSize="11">
            Carrier protein
          </text>
          <text x="446" y="188" fill="#ffc3d5" fontSize="11">
            Na⁺/K⁺ pump
          </text>
          <text x="505" y="130" fill="#9edcff" fontSize="14">
            3 Na⁺ out ↑
          </text>
          <text x="500" y="345" fill="#ffc55a" fontSize="14">
            2 K⁺ in ↓
          </text>
        </>
      )}
      <text x="245" y="185" fill="#ffc53d" fontSize="16" fontWeight="700">
        ATP
      </text>
      <path d="M245 195 V170" stroke="#ffc53d" strokeWidth="3" />
      <path
        d="M470 180 V130 M470 340 V380"
        stroke="#ff8abd"
        strokeWidth="3"
        markerEnd="url(#memArrow)"
      />
    </svg>
  );
}
export default function MembraneTargetPage() {
  const [speed, setSpeed] = useState(1);
  const [temp, setTemp] = useState(37);
  const [pumpStep, setPumpStep] = useState(1);
  const [potential, setPotential] = useState(-70);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState("Active Transport");
  const [water, setWater] = useState(85);
  const [outsideSolution, setOutsideSolution] = useState("Physiological (Na⁺ high)");
  const [insideSolution, setInsideSolution] = useState("Physiological (K⁺ high)");
  const [showWater, setShowWater] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [composition, setComposition] = useState({
    phospholipids: 70,
    cholesterol: 20,
    channels: 5,
    carriers: 3,
    pumps: 2,
  });
  const [notice, setNotice] = useState("");
  const [displayMode,setDisplayMode]=useState("schematic");
  const [structureStyle,setStructureStyle]=useState("Cartoon");
  const [showPlane,setShowPlane]=useState(true);
  const [structureReady,setStructureReady]=useState(false);
  const [selectedAtom,setSelectedAtom]=useState(null);
  const viewerRef=useRef(null);
  const announce = (x) => setNotice(x);
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setPumpStep((value) => (value >= 6 ? 1 : value + 1)),
      Math.max(180, 900 / Number(speed)),
    );
    return () => window.clearInterval(timer);
  }, [running, speed]);
  useEffect(()=>{if(displayMode!=="molecular"||!structureReady)return;const ligand={2:"ADP",3:"NA",4:"CLR",5:"ADP"}[pumpStep];if(ligand)viewerRef.current?.focusLigandId(ligand,"A");else viewerRef.current?.reset();},[pumpStep,displayMode,structureReady]);
  const flux = Math.round(
    (water / 100) * Math.max(0, 100 - Math.abs(temp - 37) * 1.8),
  );
  const resetLab = () => {
    setSpeed(1);
    setTemp(37);
    setPumpStep(1);
    setPotential(-70);
    setRunning(false);
    setMode("Active Transport");
    setWater(85);
    setOutsideSolution("Physiological (Na⁺ high)");
    setInsideSolution("Physiological (K⁺ high)");
    setShowWater(true);
    setShowLabels(true);
    setComposition({
      phospholipids: 70,
      cholesterol: 20,
      channels: 5,
      carriers: 3,
      pumps: 2,
    });
    announce("Membrane lab reset");
  };
  return (
    <div data-bio-page="membrane"
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="membrane-header flex h-[70px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-5">
        <Waves size={36} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Membrane Dynamics Lab</h1>
          <p className="text-xs text-slate-400">
            Explore. Visualize. Understand Life at the Cellular Interface.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-4 text-xs">
          <div className="membrane-mode-toggle flex rounded border border-white/15 p-1" aria-label="Membrane display mode"><button aria-pressed={displayMode==="schematic"} onClick={()=>setDisplayMode("schematic")} className={`rounded px-2 py-1 ${displayMode==="schematic"?"bg-cyan-300/15 text-cyan-200":""}`}>Teaching schematic</button><button aria-pressed={displayMode==="molecular"} onClick={()=>setDisplayMode("molecular")} className={`rounded px-2 py-1 ${displayMode==="molecular"?"bg-cyan-300/15 text-cyan-200":""}`}><Database size={13} className="mr-1 inline"/>Molecular structure</button></div>
          <label>
            Simulation Speed{" "}
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="mx-2 accent-cyan-300"
            />{" "}
            {speed}×
          </label>
          <button
            onClick={() => setRunning((v) => !v)}
            className="rounded border border-cyan-300/50 px-3 py-2"
          >
            {running ? "Ⅱ" : "▶"}
          </button>
          <button onClick={resetLab} aria-label="Reset membrane lab">
            <RotateCcw size={16} />
          </button>
          <button onClick={() => announce("Snapshot captured")}>
            Snapshot
          </button>
          <Settings2 size={18} />
        </div>
      </header>
      <div className="membrane-layout grid h-[calc(100vh-70px)] grid-cols-[255px_1fr_350px] gap-2 p-2">
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Membrane Composition</h2>
          {[
            ["Phospholipids (bilayer)", "phospholipids"],
            ["Cholesterol", "cholesterol"],
            ["Channel proteins", "channels"],
            ["Carrier proteins", "carriers"],
            ["Na⁺/K⁺ pumps", "pumps"],
          ].map(([x, key]) => (
            <label key={x} className="mt-4 block text-xs">
              {x}
              <output className="float-right">{composition[key]} %</output>
              <input
                type="range"
                min="0"
                max="100"
                value={composition[key]}
                onChange={(e) =>
                  setComposition((current) => ({
                    ...current,
                    [key]: Number(e.target.value),
                  }))
                }
                className="mt-2 w-full accent-cyan-300"
              />
            </label>
          ))}
          <h2 className="mt-6 border-t border-white/10 pt-4 font-bold">
            Environment
          </h2>
          <label className="mt-3 block text-xs">
            Temperature <output className="float-right">{temp} °C</output>
            <input
              type="range"
              min="0"
              max="50"
              value={temp}
              onChange={(e) => setTemp(+e.target.value)}
              className="mt-2 w-full accent-cyan-300"
            />
          </label>
          <select
            aria-label="Outside solution"
            value={outsideSolution}
            onChange={(e) => {
              setOutsideSolution(e.target.value);
              announce(`Outside solution: ${e.target.value}`);
            }}
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Physiological (Na⁺ high)</option>
            <option>Custom solution</option>
          </select>
          <select
            aria-label="Inside solution"
            value={insideSolution}
            onChange={(e) => {
              setInsideSolution(e.target.value);
              announce(`Inside solution: ${e.target.value}`);
            }}
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          >
            <option>Physiological (K⁺ high)</option>
            <option>Custom solution</option>
          </select>
          <label className="mt-4 block text-xs">
            Water permeability{" "}
            <input
              type="range"
              min="0"
              max="100"
              value={water}
              onChange={(e) => setWater(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-300"
            />
          </label>
          <label className="mt-4 flex gap-2 text-xs">
            <input
              type="checkbox"
              checked={showWater}
              onChange={(e) => setShowWater(e.target.checked)}
            />{" "}
            Show water molecules
          </label>
          <label className="mt-3 flex gap-2 text-xs">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
            />{" "}
            Show ion labels
          </label>
        </aside>
        <main className="rounded-lg border border-white/10 bg-gradient-to-b from-[#1c4a65] via-[#092538] to-[#0b1826] p-3">
          {displayMode==="molecular"?<MolecularMembraneScene viewerRef={viewerRef} style={structureStyle} setStyle={setStructureStyle} showPlane={showPlane} setShowPlane={setShowPlane} ready={structureReady} setReady={setStructureReady} selectedAtom={selectedAtom} setSelectedAtom={setSelectedAtom} focusChain={chain=>viewerRef.current?.focusChain(chain)} focusLigand={id=>viewerRef.current?.focusLigandId(id,"A")}/>:<>
          <div className="relative h-[520px] overflow-hidden rounded bg-blue-900/20">
            <div className="pointer-events-none absolute inset-0 z-10">
              <MembraneScene
                composition={composition}
                showWater={showWater}
                showLabels={showLabels}
                running={running}
                speed={speed}
                water={water}
              />
            </div>
            {showWater && (
              <div
                className="pointer-events-none absolute inset-x-10 top-24 grid grid-cols-8 gap-3 text-center text-sm text-cyan-100/80"
                aria-label="Water molecules"
              >
                {Array.from({ length: 24 }, (_, index) => (
                  <span
                    key={index}
                    style={{ opacity: Math.max(0.18, water / 100) }}
                  >
                    •
                  </span>
                ))}
              </div>
            )}
            <div className="absolute left-5 top-5 text-lg font-bold">
              Extracellular Fluid
              <br />
              <span className="text-xs text-slate-400">(outside cell)</span>
            </div>
            <div className="absolute bottom-5 left-5 text-lg font-bold">
              Cytoplasm
              <br />
              <span className="text-xs text-slate-400">(inside cell)</span>
            </div>
            <div
              className={`absolute right-5 top-16 text-sm text-cyan-200 ${showLabels ? "" : "invisible"}`}
            >
              <span className="text-[10px] text-slate-300">
                Outside: {outsideSolution}
                <br />
                Inside: {insideSolution}
              </span>
              <br />
              <br />
              3 Na⁺ out ↑<br />
              <br />
              Na⁺/K⁺ pump
              <br />
              <br />2 K⁺ in ↓
            </div>
            <div
              className={`absolute bottom-4 left-1/2 -translate-x-1/2 rounded border border-cyan-300/50 bg-slate-950/80 px-5 py-2 text-xs ${showLabels ? "" : "invisible"}`}
            >
              Na⁺/K⁺ pump · ATP
            </div>
          </div>
          </>}
          <div className="mt-3 flex items-center gap-2">
            {[
              "Simple Diffusion",
              "Facilitated Diffusion",
              "Osmosis",
              "Active Transport",
            ].map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setMode(x);
                  announce(x + " selected");
                }}
                className={`flex-1 rounded border p-3 text-xs ${mode === x ? "border-orange-300 bg-orange-300/10" : "border-white/10"}`}
              >
                {x}
              </button>
            ))}
          </div>
        </main>
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Concentration Gradients (mM)</h2>
          {[
            ["Na⁺", "145", "12"],
            ["K⁺", "4", "140"],
            ["Cl⁻", "110", "7"],
            ["Ca²⁺", "2", "0.0001"],
            ["Glucose", "5", "1"],
            ["H₂O", "~55,500", "~55,500"],
          ].map(([a, b, c]) => (
            <div
              key={a}
              className="grid grid-cols-3 border-b border-white/10 py-2 text-xs"
            >
              <span>{a}</span>
              <span>{b}</span>
              <span>{c}</span>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Membrane Potential</h2>
          <div className="mt-2 grid h-36 place-items-center rounded border border-white/10 text-4xl font-black">
            {potential} <span className="text-lg">mV</span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={potential}
            onChange={(e) => setPotential(+e.target.value)}
            className="mt-3 w-full accent-cyan-300"
          />
          <h2 className="mt-5 font-bold">Na⁺/K⁺ pump cycle</h2>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <button
                key={i}
                onClick={() => setPumpStep(i)}
                className={`grid h-8 w-8 place-items-center rounded-full text-xs ${pumpStep === i ? "bg-cyan-300 text-slate-900" : "border border-white/20"}`}
              >
                {i}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Step {pumpStep} of 6 ·{" "}
            {pumpStep === 1
              ? "Bind 3 Na⁺ (from inside)"
              : "ATP phosphorylation and ion translocation"}
          </p>
          <h2 className="mt-5 font-bold">Molecular Flux</h2>
          <div className="mt-2 rounded border border-cyan-300/30 bg-gradient-to-t from-cyan-300/20 to-transparent p-3">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span>{mode}</span>
              <strong className="text-cyan-200">{flux}%</strong>
            </div>
            <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-900/80">
              <div
                className="h-full rounded-full bg-cyan-300 transition-all"
                style={{ width: `${flux}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Flux responds to water permeability and temperature.
            </p>
          </div>
        </aside>
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
