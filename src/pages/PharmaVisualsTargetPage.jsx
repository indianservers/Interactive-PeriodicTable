/* Pharmaceutical Chemistry Lab page 1 is composed in the shared pharma-lab module. */
import LabHomePage from "../modules/pharma-lab/LabHomePage.jsx";
import {
  Activity,
  Beaker,
  CheckCircle2,
  FlaskConical,
  Home,
  Play,
  Settings2,
  Maximize2,
  RotateCcw,
  Upload,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./pharmaVisualsTarget.css";
const journey = [
  "Target & Discovery",
  "Formulation",
  "Absorption",
  "Distribution",
  "Metabolism",
  "Quality Control",
  "Toxicology",
  "Patient",
];
const pharmaStructures={
  acetaminophen:{label:"Paracetamol",kind:"Ligand",className:"Analgesic · antipyretic",source:{url:"/assets/toxicology/structures/acetaminophen.sdf",format:"sdf"},formula:"C₈H₉NO₂",mass:"151.16 g/mol",provenance:"PubChem computed 3D conformer"},
  ibuprofen:{label:"Ibuprofen",kind:"Drug gallery",className:"NSAID",source:{url:"/assets/drug-discovery/compounds/ibuprofen.sdf",format:"sdf"},formula:"C₁₃H₁₈O₂",mass:"206.28 g/mol",provenance:"PubChem computed 3D conformer"},
  diclofenac:{label:"Diclofenac",kind:"Drug gallery",className:"NSAID",source:{url:"/assets/drug-discovery/compounds/diclofenac.sdf",format:"sdf"},formula:"C₁₄H₁₁Cl₂NO₂",mass:"296.15 g/mol",provenance:"PubChem computed 3D conformer"},
  celecoxib:{label:"Celecoxib",kind:"Drug gallery",className:"COX-2 selective NSAID",source:{url:"/assets/drug-discovery/compounds/celecoxib.sdf",format:"sdf"},formula:"C₁₇H₁₄F₃N₃O₂S",mass:"381.37 g/mol",provenance:"PubChem computed 3D conformer"},
  mefenamic:{label:"Mefenamic acid",kind:"Drug gallery",className:"Fenamate NSAID",source:{url:"/assets/drug-discovery/compounds/mefenamic-acid.sdf",format:"sdf"},formula:"C₁₅H₁₅NO₂",mass:"241.29 g/mol",provenance:"PubChem computed 3D conformer"},
  target:{label:"Lactoperoxidase",kind:"Target",className:"Oxidoreductase structural reference",source:{url:"/assets/toxicology/structures/3PY4.cif",format:"mmcif"},formula:"PDB 3PY4",mass:"2.42 Å resolution",provenance:"Experimental X-ray structure · Bos taurus",pdbId:"3PY4"},
  complex:{label:"LPO–paracetamol",kind:"Complex",className:"Ligand–target complex",source:{url:"/assets/toxicology/structures/3PY4.cif",format:"mmcif"},formula:"PDB 3PY4 · TYL",mass:"2.42 Å resolution",provenance:"Experimental X-ray complex · Bos taurus",pdbId:"3PY4",ligand:"TYL"},
};
export function LegacyPharmaVisualsTargetPage({ onNavigate }) {
  const [running, setRunning] = useState(false);
  const [dissolve, setDissolve] = useState(0);
  const [step, setStep] = useState(1);
  const [notice, setNotice] = useState("");
  const [query,setQuery]=useState("");
  const [structureKey,setStructureKey]=useState("acetaminophen");
  const [structureStyle,setStructureStyle]=useState("Ball & stick");
  const [structureReady,setStructureReady]=useState(false);
  const [selectedAtom,setSelectedAtom]=useState(null);
  const [importedSource,setImportedSource]=useState(null);
  const viewerRef=useRef(null),fileRef=useRef(null);
  const announce = (x) => setNotice(x);
  const structure=pharmaStructures[structureKey];
  const filteredStructures=Object.entries(pharmaStructures).filter(([,item])=>!query.trim()||`${item.label} ${item.kind} ${item.className} ${item.formula}`.toLowerCase().includes(query.trim().toLowerCase()));
  const activeSource=importedSource||{...structure.source,label:`${structure.label} · ${structure.provenance}`};
  const isMacromolecule=!importedSource&&(structureKey==="target"||structureKey==="complex");
  const representation=isMacromolecule?{Cartoon:structureStyle==="Cartoon",Surface:structureStyle==="Surface",BallAndStick:structureStyle==="Atoms",Ligand:structureKey==="complex",Ion:true}:{BallAndStick:structureStyle==="Ball & stick",Spacefill:structureStyle==="Space filling",Sticks:structureStyle==="Sticks",Ligand:false,Branched:false,Ion:false};
  const selectStructure=key=>{setStructureKey(key);setImportedSource(null);setStructureStyle(key==="target"||key==="complex"?"Cartoon":"Ball & stick");setStructureReady(false);setSelectedAtom(null);};
  const importStructure=event=>{const file=event.target.files?.[0];if(!file)return;const format=file.name.split(".").pop()?.toLowerCase();if(!["pdb","cif","mmcif","mol","sdf"].includes(format))return;setImportedSource({url:URL.createObjectURL(file),format,label:file.name});setStructureStyle(format==="pdb"||format==="cif"||format==="mmcif"?"Cartoon":"Ball & stick");setStructureReady(false);event.target.value="";};
  useEffect(() => {
    if (!running) return undefined;
    const timer = window.setInterval(
      () => setDissolve((value) => (value >= 100 ? 0 : value + 2)),
      120,
    );
    return () => window.clearInterval(timer);
  }, [running]);
  return (
    <div
      className="pharma-app min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-6">
        <FlaskConical size={38} className="text-cyan-300" />
        <div>
          <h1 className="text-2xl font-black">Pharmaceutical Chemistry Lab</h1>
          <p className="text-sm text-slate-400">From molecule to medicine</p>
        </div>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          className="ml-auto w-[380px] rounded border border-white/15 bg-slate-900/60 p-2 text-xs"
          placeholder="Search compounds, targets, formulations..."
        />
        <button onClick={() => announce("Notifications opened")}>◉</button>
        <span className="rounded-full bg-blue-500 px-3 py-2">SL</span>
        <Settings2 size={18} />
      </header>
      <div className="pharma-workspace grid h-[calc(100vh-70px)] grid-cols-[1fr_310px] grid-rows-[225px_1fr_185px] gap-2 p-2">
        <main className="col-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-lg font-bold">The medicine journey</h2>
          <p className="text-xs text-slate-400">
            An integrated view from target to patient
          </p>
          <div className="mt-4 flex items-center justify-between">
            {journey.map((x, i) => (
              <button
                key={x}
                onClick={() => {
                  setStep(i + 1);
                  announce(x + " selected");
                }}
                className={`text-center ${step === i + 1 ? "text-cyan-200" : "text-slate-400"}`}
              >
                <div
                  className={`mx-auto grid h-16 w-16 place-items-center rounded-full border-2 ${step === i + 1 ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
                >
                  {i + 1}
                </div>
                <b className="mt-2 block text-[11px]">{x}</b>
              </button>
            ))}
          </div>
        </main>
        <section className="pharma-formulation rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="text-xl font-bold">Tablet formulation</h2>
          <p className="text-xs text-slate-400">
            Explore composition and behavior of a real-world medicine
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="rounded border border-white/10 p-3 text-xs">
              <b>Paracetamol 500 mg Tablet</b>
              <p className="mt-3 text-cyan-200">
                ● Paracetamol (API)　500 mg (50.0%)
              </p>
              <p className="text-slate-300">
                ● Microcrystalline cellulose　20.0%
              </p>
              <p className="text-violet-300">● Povidone (PVP)　5.0%</p>
              <p className="text-amber-300">● Croscarmellose sodium　4.0%</p>
              <p className="text-emerald-300">● Magnesium stearate　1.0%</p>
            </div>
            <div className="pharma-structure-panel" data-ready={structureReady}>
              <ViewerErrorBoundary label="Pharmaceutical molecular structure"><MolstarViewer ref={viewerRef} source={activeSource} sourceType={activeSource.format} label={activeSource.label} pdbId={!importedSource?structure.pdbId:undefined} representation={representation} colorScheme={isMacromolecule?"chain":"element"} focusLigandId={!importedSource?structure.ligand:undefined} focusLigandChain="A" showLabels={false} onReady={()=>{setStructureReady(true);requestAnimationFrame(()=>structure.ligand&&!importedSource?viewerRef.current?.focusLigandId(structure.ligand,"A"):viewerRef.current?.zoom(isMacromolecule?1.25:1.5));}} onLoadError={()=>setStructureReady(false)} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary>
              <div className="pharma-structure-meta"><b>{structureReady?"Mol* structure ready":"Loading coordinates…"}</b><span>{importedSource?importedSource.label:`${structure.kind} · ${structure.label} · ${structure.formula} · ${structure.mass}`}</span><span>{selectedAtom?`${selectedAtom.element} ${selectedAtom.atom} · ${selectedAtom.residueName||"molecule"} · [${selectedAtom.coordinates.map(v=>v.toFixed(2)).join(", ")}] Å`:importedSource?"Imported coordinate structure":structure.provenance}</span></div>
              <div className="pharma-structure-tools">{(isMacromolecule?["Cartoon","Surface","Atoms"]:["Ball & stick","Space filling","Sticks"]).map(style=><button key={style} aria-pressed={structureStyle===style} onClick={()=>setStructureStyle(style)}>{style}</button>)}{structure.ligand&&!importedSource&&<button onClick={()=>viewerRef.current?.focusLigandId("TYL","A")}>Focus TYL</button>}<button onClick={()=>fileRef.current?.click()} title="Import pharmaceutical structure"><Upload size={13}/></button><button onClick={()=>viewerRef.current?.reset()} title="Reset pharmaceutical view"><RotateCcw size={13}/></button><button onClick={()=>viewerRef.current?.fullscreen()} title="Full screen pharmaceutical view"><Maximize2 size={13}/></button><input ref={fileRef} type="file" hidden accept=".pdb,.cif,.mmcif,.mol,.sdf" onChange={importStructure}/></div>
            </div>
          </div>
          <div className="pharma-gallery mt-2">{filteredStructures.length?filteredStructures.map(([key,item])=><button key={key} aria-pressed={!importedSource&&structureKey===key} onClick={()=>selectStructure(key)}><b>{item.label}</b><small>{item.kind} · {item.className}</small></button>):<p>No structures match “{query}”.</p>}</div>
          <div className="mt-4 rounded border border-cyan-300/30 p-3">
            <div className="flex items-center justify-between">
              <b>Dissolution test (USP II)</b>
              <button
                onClick={() => setRunning((v) => !v)}
                className="rounded bg-blue-500 px-3 py-2 text-xs"
              >
                <Play size={14} className="mr-1 inline" />
                {running ? "Pause" : "Simulate dissolution"}
              </button>
            </div>
            <div className="mt-3 h-20 rounded bg-gradient-to-t from-cyan-400/50 to-transparent" />
            <input
              type="range"
              min="0"
              max="100"
              value={dissolve}
              onChange={(e) => setDissolve(+e.target.value)}
              className="w-full accent-cyan-300"
            />
            <p className="text-xs">
              Dissolved: {dissolve}%　T₅₀ 12.4 min　T₉₀ 28.6 min
            </p>
          </div>
        </section>
        <aside className="row-span-2 rounded-lg border border-white/10 bg-[#0a1e31] p-4">
          <h2 className="font-bold">Formulation metrics</h2>
          {[
            ["Tablet weight", "1,000 mg"],
            ["API content", "500 mg (50.0%)"],
            ["Hardness", "8.2 kP"],
            ["Friability", "0.18%"],
            ["Disintegration time", "4.6 min"],
            ["Dissolution (Q,45 min)", "92%"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="flex justify-between border-b border-white/10 py-3 text-xs"
            >
              <span>{a}</span>
              <b>{b}</b>
            </div>
          ))}
          <h2 className="mt-5 font-bold">Safety & quality checks</h2>
          {[
            "Identity (HPLC)",
            "Assay",
            "Related substances",
            "Uniformity of dosage units",
            "Microbial limits",
            "Residual solvents",
            "Heavy metals",
            "Stability (accelerated)",
          ].map((x) => (
            <div key={x} className="flex justify-between py-2 text-xs">
              <span>{x}</span>
              <span className="text-emerald-300">✓ Pass</span>
            </div>
          ))}
        </aside>
        <section className="pharma-links grid grid-cols-5 gap-2">
          {[
            ["Explore ADME", "Absorption, distribution, metabolism and excretion", "visuals/pharma/adme"],
            ["Dosage Forms", "Solid, liquid, semi-solid and novel delivery systems", "visuals/pharma/dosage"],
            ["Quality Control", "Analytical methods and specifications", "visuals/pharma/qc"],
            ["Buffers", "pH 7.4 · Design and calculate buffer solutions", "visuals/pharma/buffers"],
            ["Toxicology", "Safety evaluation and risk assessment", "visuals/pharma/toxicology"],
          ].map(([x, d, route]) => (
            <a
              key={x}
              href={`#${route}`}
              onClick={() => {
                announce(x + " opened");
              }}
              className="rounded-lg border border-white/10 bg-[#0a1e31] p-4 text-left"
            >
              <b className="text-cyan-200">{x}</b>
              <p className="mt-3 text-xs text-slate-400">{d}</p>
              <ChevronRightIcon />
            </a>
          ))}
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
function ChevronRightIcon() {
  return <span className="float-right text-cyan-300">→</span>;
}

export { LabHomePage as PharmaVisualsTargetPage };
export default LabHomePage;
