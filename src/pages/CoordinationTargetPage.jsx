import { useMemo, useRef, useState } from "react";
import {
  Atom,
  BarChart3,
  BookOpen,
  Boxes,
  FlaskConical,
  Library,
  Settings,
  Maximize2,
  RotateCcw,
  Ruler,
  Upload,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./coordinationTarget.css";
const ligands = [
  ["NH₃", "ammine", "neutral, σ-donor"],
  ["H₂O", "aqua", "neutral, σ-donor"],
  ["CN⁻", "cyano", "strong field, σ/π-acceptor"],
  ["Cl⁻", "chloro", "weak field, σ-donor"],
  ["en", "ethylenediamine", "bidentate, σ-donor"],
];

const geometryVectors = {
  Octahedral: [[2.05,0,0],[-2.05,0,0],[0,2.05,0],[0,-2.05,0],[0,0,2.05],[0,0,-2.05]],
  Tetrahedral: [[1.18,1.18,1.18],[-1.18,-1.18,1.18],[-1.18,1.18,-1.18],[1.18,-1.18,-1.18]],
  "Square Planar": [[2.0,0,0],[-2.0,0,0],[0,2.0,0],[0,-2.0,0]],
  "Trigonal Bipyramidal": [[2.0,0,0],[-1,1.732,0],[-1,-1.732,0],[0,0,2.15],[0,0,-2.15]],
  Distorted: [[2.2,.15,0],[-1.9,-.12,.1],[.08,2.12,.2],[-.1,-1.85,-.18],[.15,.08,2.35],[-.12,.05,-1.78]],
  Chelate: [[2.0,0,0],[-2.0,0,0],[0,2.0,0],[0,-2.0,0],[0,0,2.0],[0,0,-2.0]],
};

function coordinationSdf(metal, ligandCode, geometry, isomer) {
  const atoms = [], bonds = [];
  const add = (symbol, x, y, z) => (atoms.push({ symbol, x, y, z }), atoms.length);
  const bond = (a, b, order = 1) => bonds.push([a, b, order]);
  if (geometry === "Bridging Ligands") {
    const m1 = add(metal, -1.75, 0, 0), m2 = add(metal, 1.75, 0, 0);
    [[0,1.45,0],[0,-1.45,0]].forEach(([x,y,z]) => { const cl=add("Cl",x,y,z); bond(m1,cl); bond(m2,cl); });
    const l1=add("Cl",-3.75,0,0), l2=add("Cl",3.75,0,0); bond(m1,l1); bond(m2,l2);
  } else {
    const center = add(metal, 0, 0, 0);
    const vectors = geometryVectors[geometry] || geometryVectors.Octahedral;
    const donorIds = [];
    vectors.forEach(([x,y,z], index) => {
      const length = Math.hypot(x,y,z), ux=x/length, uy=y/length, uz=z/length;
      const substitutedSites = isomer === "cis" ? [0,2] : isomer === "trans" ? [0,1] : isomer === "fac" ? [0,2,4] : isomer === "mer" ? [0,1,2] : [];
      const code = substitutedSites.includes(index) ? "Cl⁻" : geometry === "Chelate" ? "en" : ligandCode;
      if (code === "Cl⁻") { const id=add("Cl",x,y,z); bond(center,id); donorIds.push(id); return; }
      if (code === "CN⁻") { const c=add("C",x,y,z), n=add("N",x+ux*1.16,y+uy*1.16,z+uz*1.16); bond(center,c); bond(c,n,3); donorIds.push(c); return; }
      const donor = code === "H₂O" ? "O" : "N";
      const id=add(donor,x,y,z); bond(center,id); donorIds.push(id);
      if (code !== "en") {
        const count = donor === "O" ? 2 : 3;
        for (let h=0;h<count;h++) { const angle=(index*1.7)+(h*2*Math.PI/count), hid=add("H",x+ux*.58+Math.cos(angle)*.42,y+uy*.58+Math.sin(angle)*.42,z+uz*.58+(h-count/2)*.16); bond(id,hid); }
      }
    });
    if ((geometry === "Chelate" || ligandCode === "en") && donorIds.length >= 4) {
      for (let i=0;i+1<donorIds.length;i+=2) {
        const a=atoms[donorIds[i]-1], b=atoms[donorIds[i+1]-1];
        const hand = isomer === "Λ" ? -.4 : .4;
        const c1=add("C",a.x*.72+b.x*.18+hand,a.y*.72+b.y*.18+hand,a.z*.72+b.z*.18+hand);
        const c2=add("C",a.x*.18+b.x*.72+hand,a.y*.18+b.y*.72+hand,a.z*.18+b.z*.72+hand);
        bond(donorIds[i],c1); bond(c1,c2); bond(c2,donorIds[i+1]);
      }
    }
  }
  const atomLines = atoms.map(a => `${a.x.toFixed(4).padStart(10)}${a.y.toFixed(4).padStart(10)}${a.z.toFixed(4).padStart(10)} ${a.symbol.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join("\n");
  const bondLines = bonds.map(([a,b,o]) => `${String(a).padStart(3)}${String(b).padStart(3)}${String(o).padStart(3)}  0  0  0  0`).join("\n");
  return `Coordination teaching model\nChemistry Universe\nIdealized ${geometry}\n${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\nM  END\n$$$$\n`;
}
export default function CoordinationTargetPage() {
  const [ligand, setLigand] = useState(0);
  const [geometry, setGeometry] = useState("Octahedral");
  const [spin, setSpin] = useState("Low-spin");
  const [tab, setTab] = useState("Isomers & Stereochemistry");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [metal, setMetal] = useState("Co");
  const [renderStyle, setRenderStyle] = useState("Ball & stick");
  const [ready, setReady] = useState(false);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [measuring, setMeasuring] = useState(false);
  const [measureAtoms, setMeasureAtoms] = useState([]);
  const [importedSource, setImportedSource] = useState(null);
  const [isomer, setIsomer] = useState("parent");
  const viewerRef = useRef(null), fileRef = useRef(null);
  const announce = (x) => setNotice(x);
  const visibleLigands = ligands
    .map((item, index) => ({ item, index }))
    .filter(({ item }) =>
      item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
    );
  const selectedLigand = ligands[ligand];
  const coordinationNumber = geometry === "Trigonal Bipyramidal" ? 5 : geometry === "Square Planar" || geometry === "Tetrahedral" || geometry === "Bridging Ligands" ? 4 : 6;
  const ligandCount =
    selectedLigand[0] === "en"
      ? Math.ceil(coordinationNumber / 2)
      : coordinationNumber;
  const magneticMoment = spin === "Low-spin" ? "0.0" : "4.90";
  const dCount = ({ Co: 6, Ni: 7, Pt: 7, Fe: 5 })[metal];
  const solutionColor =
    selectedLigand[0] === "CN⁻"
      ? "Pale yellow"
      : selectedLigand[0] === "Cl⁻"
        ? "Green-yellow"
        : selectedLigand[0] === "NH₃"
          ? "Yellow-orange"
          : "Violet";
  const generatedSource = useMemo(() => ({ data: coordinationSdf(metal, selectedLigand[0], geometry, isomer), format: "sdf", label: `${metal} · ${geometry} · ${isomer === "parent" ? selectedLigand[0] : `${isomer} isomer`} · idealized model` }), [metal, selectedLigand, geometry, isomer]);
  const activeSource = importedSource || generatedSource;
  const distance = measureAtoms.length === 2 ? Math.hypot(...measureAtoms[0].coordinates.map((value, index) => value - measureAtoms[1].coordinates[index])).toFixed(3) : null;
  const onAtom = atom => { setSelectedAtom(atom); if (measuring) setMeasureAtoms(items => [...items.slice(-1), atom]); };
  const importStructure = event => { const file=event.target.files?.[0]; if(!file)return; const format=file.name.split(".").pop()?.toLowerCase(); if(!["pdb","cif","mmcif","mol","sdf"].includes(format))return; setImportedSource({url:URL.createObjectURL(file),format,label:file.name}); setReady(false); event.target.value=""; };
  return (
    <div
      className="coord-app min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[62px] items-center gap-4 border-b border-white/10 bg-[#0a1b2b] px-5">
        <Atom size={38} className="text-cyan-300" />
        <div>
          <h1 className="text-xl font-black">Coordination Chemistry Studio</h1>
          <p className="text-xs text-slate-400">
            Build 1.0　•　Explore　•　Visualize　•　Learn
          </p>
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto w-80 rounded border border-white/20 bg-slate-950 p-2 text-xs"
          placeholder="Search complexes, ligands, or concepts..."
        />
        {["Models", "Settings", "Help"].map((x) => (
          <button
            key={x}
            onClick={() => announce(x + " opened")}
            className="text-xs"
          >
            {x}
          </button>
        ))}
      </header>
      <div className="coord-workspace grid h-[calc(100vh-62px)] grid-cols-[170px_330px_1fr_380px] grid-rows-[1fr_205px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col gap-2 border-r border-white/10 bg-[#081b2c] p-3">
          {[
            [FlaskConical, "Builder"],
            [Boxes, "Visualize"],
            [Atom, "Ligands"],
            [BarChart3, "Electronic Structure"],
            [Atom, "Isomers"],
            [BarChart3, "Thermodynamics"],
            [BarChart3, "Spectroscopy"],
            [BookOpen, "Library"],
          ].map(([I, x], i) => (
            <button
              key={x}
              onClick={() => announce(x + " selected")}
              className={`flex items-center gap-3 rounded px-2 py-3 text-xs ${i === 0 ? "bg-cyan-300/15 text-cyan-200" : "text-slate-300"}`}
            >
              <I size={19} />
              {x}
            </button>
          ))}
        </aside>
        <aside className="overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Ligand Library</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ligands..."
            className="mt-3 w-full rounded border border-white/20 bg-slate-950 p-2 text-xs"
          />
          {visibleLigands.map(({ item: [a, b, c], index: i }) => (
            <button
              key={a}
              onClick={() => {
                setLigand(i);
                announce(a + " placed");
              }}
              className={`mt-2 flex w-full gap-3 rounded border p-3 text-left ${i === ligand ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600">
                ●
              </span>
              <span>
                <b>{a}</b>
                <br />
                <span className="text-xs text-slate-400">
                  {b}
                  <br />
                  {c}
                </span>
              </span>
            </button>
          ))}
        </aside>
        <section className="coord-stage relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#102d48] to-[#071522] p-3">
          <h2 className="text-center text-3xl font-black">
            [{metal}({selectedLigand[0]})<sub>{ligandCount}</sub>]<sup>3+</sup>
          </h2>
          <p className="text-center text-cyan-300">
            {geometry} · d{dCount} · {selectedLigand[1]}
          </p>
          <div className="coord-molstar mt-3 h-[410px]">
            <ViewerErrorBoundary label="Coordination complex viewer"><MolstarViewer ref={viewerRef} source={activeSource} sourceType={activeSource.format} label={activeSource.label} representation={{BallAndStick:renderStyle==="Ball & stick",Spacefill:renderStyle==="Space filling",Sticks:renderStyle==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" showLabels={false} onReady={()=>{setReady(true);requestAnimationFrame(()=>viewerRef.current?.zoom(1.22));}} onLoadError={()=>setReady(false)} onSelectionChange={onAtom}/></ViewerErrorBoundary>
            <div className="coord-status"><b>{ready?"Mol* coordinates ready":"Loading coordinates…"}</b><span>{activeSource.label}</span><span>{distance?`Measured distance: ${distance} Å`:selectedAtom?`${selectedAtom.element} atom ${selectedAtom.sourceIndex+1} · [${selectedAtom.coordinates.map(v=>v.toFixed(2)).join(", ")}] Å`:measuring?"Select two atoms to measure a bond or distance":"Click an atom for coordinates"}</span></div>
          </div>
          <div className="coord-tools absolute bottom-3 left-3 right-3 flex gap-2">
            {["Octahedral", "Tetrahedral", "Square Planar", "Trigonal Bipyramidal", "Distorted", "Chelate", "Bridging Ligands"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setGeometry(x);
                  setImportedSource(null); setReady(false); setMeasureAtoms([]); setIsomer("parent");
                  announce(x + " geometry selected");
                }}
                className={`flex-1 rounded border px-3 py-2 text-xs ${geometry === x ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
              >
                {x}
              </button>
            ))}
            {["Ball & stick","Space filling","Sticks"].map(style=><button key={style} onClick={()=>setRenderStyle(style)} aria-pressed={renderStyle===style} className="rounded border border-white/20 px-3 py-2 text-xs">{style}</button>)}
            <button aria-pressed={measuring} onClick={()=>{setMeasuring(v=>!v);setMeasureAtoms([]);}} title="Measure atom distance"><Ruler size={14}/></button>
            <button onClick={()=>fileRef.current?.click()} title="Import structure"><Upload size={14}/></button>
            <button onClick={()=>viewerRef.current?.reset()} title="Reset view"><RotateCcw size={14}/></button>
            <button onClick={()=>viewerRef.current?.fullscreen()} title="Full screen"><Maximize2 size={14}/></button>
            <input ref={fileRef} type="file" hidden accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importStructure}/>
          </div>
        </section>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Complex Properties</h2>
          {[
            ["Metal", `${metal} (${({Co:"Cobalt",Ni:"Nickel",Pt:"Platinum",Fe:"Iron"})[metal]})`],
            ["Oxidation state", "+3"],
            ["Coordination number", "6"],
            ["d-electron count", `d${dCount}`],
            ["Selected ligand", selectedLigand[0]],
            ["Coordination number", String(coordinationNumber)],
          ].map(([a, b], index) => (
            <label key={`${a}-${index}`} className="mt-3 block text-xs">
              {a}
              <input
                readOnly
                value={b}
                className="mt-1 w-full rounded border border-white/20 bg-slate-950 p-2"
              />
            </label>
          ))}
          <label className="mt-3 block text-xs">Metal selection<select aria-label="Metal selection" value={metal} onChange={e=>{setMetal(e.target.value);setImportedSource(null);setReady(false);}} className="mt-1 w-full rounded border border-white/20 bg-slate-950 p-2">{["Co","Ni","Pt","Fe"].map(value=><option key={value}>{value}</option>)}</select></label>
          <h3 className="mt-5 font-bold">
            Spin state ({geometry.toLowerCase()})
          </h3>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => setSpin("Low-spin")}
              className={`flex-1 rounded border p-2 text-xs ${spin === "Low-spin" ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
            >
              Low-spin
            </button>
            <button
              onClick={() => setSpin("High-spin")}
              className={`flex-1 rounded border p-2 text-xs ${spin === "High-spin" ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
            >
              High-spin
            </button>
          </div>
          <div className="mt-4 h-36 rounded border border-white/10 p-3 text-center text-sm">
            e<sub>g</sub>　────　────
            <br />
            <br />t<sub>2g</sub>　↑↓　↑↓　↑↓
            <p className="mt-3 text-xs text-slate-400">
              Magnetic moment　{magneticMoment} μ<sub>B</sub>
            </p>
          </div>
          <p className="mt-4 text-xs text-cyan-200">
            Predicted color (solution): {solutionColor}
          </p>
        </aside>
        <section className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex border-b border-white/10">
            {[
              "Isomers & Stereochemistry",
              "Formation & Stability",
              "Spectral Properties",
              "Notes",
            ].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`px-4 py-2 text-xs ${tab === x ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
            {[
              ["cis", "cis-MA₄B₂"], ["trans", "trans-MA₄B₂"], ["fac", "fac-MA₃B₃"], ["mer", "mer-MA₃B₃"], ["Δ", "Δ-[M(en)₃]"], ["Λ", "Λ-[M(en)₃]"],
            ].map(([x,label]) => (
              <button key={x} onClick={()=>{setIsomer(x);setImportedSource(null);setGeometry(x==="Δ"||x==="Λ"?"Chelate":"Octahedral");setReady(false);announce(`${label} loaded in the coordinate viewer`);}} className={`rounded border p-4 text-left ${isomer===x?"border-cyan-300 bg-cyan-300/10":"border-white/10"}`}>
                <b>{label}</b>
                <div className="my-4 text-center text-2xl text-blue-300">
                  ✣　✣
                </div>
                <p className="text-slate-400">Inspect coordinate model</p>
              </button>
            ))}
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
