import { useMemo, useRef, useState } from "react";
import { Activity, Database, Maximize2, ShieldCheck, RotateCcw } from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./biochemistryPages.css";

const STRUCTURES = {
  complex: { label:"Bound complex", title:"Lactoperoxidase–acetaminophen", source:{url:"/assets/toxicology/structures/3PY4.cif",format:"mmcif",label:"3PY4 lactoperoxidase paracetamol complex"}, type:"mmcif", pdbId:"3PY4", ligand:"TYL", metadata:"Experimental X-ray complex · 2.42 Å · Bos taurus", note:"A real paracetamol-bound structural reference; it is not a CYP2E1 metabolism model." },
  acetaminophen: { label:"Acetaminophen", title:"Acetaminophen", source:{url:"/assets/toxicology/structures/acetaminophen.sdf",format:"sdf",label:"Acetaminophen PubChem conformer"}, type:"sdf", metadata:"PubChem CID 1983 · C₈H₉NO₂ · 151.16 g/mol", small:true },
  napqi: { label:"NAPQI metabolite", title:"NAPQI", source:{url:"/assets/toxicology/structures/napqi.sdf",format:"sdf",label:"NAPQI PubChem conformer"}, type:"sdf", metadata:"PubChem CID 39763 · C₈H₇NO₂ · reactive metabolite", small:true },
};
export default function ToxicologyTargetPage() {
  const viewerRef = useRef(null);
  const [dose, setDose] = useState(10);
  const [tab, setTab] = useState("Pathways");
  const [notice, setNotice] = useState("");
  const [nac, setNac] = useState(false);
  const [structureKey, setStructureKey] = useState("complex");
  const [structureStyle, setStructureStyle] = useState("Cartoon");
  const [structureReady, setStructureReady] = useState(false);
  const [selectedResidue, setSelectedResidue] = useState(null);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const announce = (x) => setNotice(x);
  const risk = nac ? "Low" : dose > 12 ? "High" : dose > 7 ? "Moderate" : "Low";
  const cypFraction = nac ? 12 : dose > 12 ? 32 : dose > 7 ? 24 : 16;
  const glucuronidation = 56 - Math.round(cypFraction / 4);
  const sulfation = 100 - cypFraction - glucuronidation;
  const alt = nac ? 105 : Math.round(380 + dose * 87);
  const ast = nac ? 92 : Math.round(300 + dose * 68);
  const tabSummary = {
    Pathways: "Biotransformation routes and reactive metabolite formation",
    "Cellular View": "Glutathione depletion, oxidative stress, and hepatocyte injury",
    "Molecular Structures": "Acetaminophen, NAPQI, and glutathione interaction",
    "Clinical Timeline": "Dose → metabolism → biomarkers → intervention",
  }[tab];
  const structure = STRUCTURES[structureKey];
  const representations = useMemo(() => ({ Cartoon:structureStyle==="Cartoon", Surface:structureStyle==="Surface", BallAndStick:structureStyle==="Atoms"||structureStyle==="Ball & stick", Spacefill:structureStyle==="Space filling", Ligand:!structure.small, Branched:!structure.small, Ion:!structure.small }), [structure.small, structureStyle]);
  const selectStructure = key => { setStructureKey(key); setStructureStyle(STRUCTURES[key].small?"Ball & stick":"Cartoon"); setStructureReady(false); setSelectedResidue(null); setSelectedAtom(null); };
  return (
    <div data-bio-page="toxicology"
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[68px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <Activity className="text-blue-300" size={34} />
        <div>
          <h1 className="text-2xl font-black">Molecular Toxicology Studio</h1>
          <p className="text-sm text-slate-400">
            Explore molecular mechanisms. Build understanding. Safer decisions.
          </p>
        </div>
        <div className="ml-auto flex gap-6 text-xs text-slate-400">
          <button onClick={() => announce("Model mode selected")}>
            ⚙ Model
          </button>
          <button onClick={() => announce("Compound library opened")}>
            Library
          </button>
          <span className="text-emerald-300">● Hepatotoxicity Module</span>
        </div>
      </header>
      <div className="toxicology-layout grid h-[calc(100vh-68px)] grid-cols-[230px_275px_1fr_400px] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0a1e31] p-3">
          {[
            "Toxicology Studio",
            "Compounds",
            "Organs & Systems",
            "Simulations",
            "Case Explorer",
            "Molecular Viewer",
            "Learning Center",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => announce(`${x} selected`)}
              className={`mb-2 w-full rounded px-3 py-3 text-left text-sm ${i === 0 ? "border-l-2 border-cyan-300 bg-blue-500/15 text-cyan-200" : "text-slate-300"}`}
            >
              {x}
            </button>
          ))}
          <div className="mt-16 rounded border border-white/10 p-3 text-xs text-slate-400">
            Hepatotoxicity
            <br />
            <span className="text-cyan-200">● Active model</span>
          </div>
        </aside>
        <aside className="rounded border border-white/10 bg-[#0b2135] p-4">
          <h2 className="font-bold text-cyan-200">Simulate dose response</h2>
          <label className="mt-5 block text-sm">
            Acetaminophen dose{" "}
            <output className="float-right rounded border px-2">
              {dose} g
            </output>
            <input
              type="range"
              min="0"
              max="15"
              step=".5"
              value={dose}
              onChange={(e) => setDose(+e.target.value)}
              className="mt-3 w-full accent-blue-400"
            />
          </label>
          <h3 className="mt-6 font-bold">Body factors</h3>
          {[
            ["Body weight", "70 kg"],
            ["Age", "30 years"],
            ["Alcohol use", "None"],
            ["Enzyme activity", "Normal"],
            ["Nutritional status", "Normal"],
          ].map(([a, b]) => (
            <div
              key={a}
              className="mt-3 rounded border border-white/10 p-2 text-xs"
            >
              {a}
              <span className="float-right text-cyan-200">{b}</span>
            </div>
          ))}
          <button
            onClick={() => {
              setDose(10);
              setNac(false);
              setTab("Pathways");
              announce("Dose reset to default");
            }}
            className="mt-5 text-xs text-cyan-300"
          >
            <RotateCcw size={14} className="mr-1 inline" />
            Reset to default
          </button>
        </aside>
        <main className="toxicology-main rounded border border-white/10 bg-gradient-to-br from-[#17384b] to-[#071522] p-3">
          <div className="flex rounded border border-white/10">
            {[
              "Pathways",
              "Cellular View",
              "Molecular Structures",
              "Clinical Timeline",
            ].map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={`flex-1 px-3 py-3 text-sm ${tab === x ? "border-b-2 border-cyan-300 bg-blue-500/20" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          {tab === "Molecular Structures" ? <div className="relative mt-3 h-[580px] overflow-hidden rounded border border-white/10 bg-[#06131f]" data-toxicology-view="molecular">
            <ViewerErrorBoundary label="Toxicology molecular structure"><MolstarViewer ref={viewerRef} source={structure.source} sourceType={structure.type} pdbId={structure.pdbId} label={structure.title} representation={representations} colorScheme={structure.small?"element":"chain"} selectedChain="A" selectedResidue={selectedResidue} focusOnSelection={Number.isFinite(selectedResidue)} showLabels={false} onReady={()=>{setStructureReady(true);requestAnimationFrame(()=>structure.ligand?viewerRef.current?.focusLigandId(structure.ligand,"A"):viewerRef.current?.zoom(1.45));}} onLoadError={()=>setStructureReady(false)} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary>
            <div className="toxicology-structure-metadata pointer-events-none absolute left-3 top-3 z-10 max-w-[58%] rounded border border-white/10 bg-[#06131fe8] px-3 py-2 text-[10px] text-slate-300"><b className="text-cyan-200">{structure.pdbId?`PDB ${structure.pdbId}`:structure.label}</b> · {structure.metadata}<br/><span className="text-amber-200">{structure.note}</span></div>
            <div className="toxicology-structure-tools absolute right-3 top-3 z-10 flex flex-wrap justify-end gap-1 rounded border border-white/10 bg-[#06131fe8] p-2 text-[10px]"><span className={structureReady?"mr-1 self-center text-emerald-300":"mr-1 self-center text-slate-400"}>{structureReady?"Mol* ready":"Loading…"}</span>{(structure.small?["Ball & stick","Space filling"]:["Cartoon","Surface","Atoms"]).map(item=><button key={item} aria-pressed={structureStyle===item} onClick={()=>setStructureStyle(item)} className={`rounded border px-2 py-1 ${structureStyle===item?"border-cyan-300 bg-cyan-300/15":"border-white/15"}`}>{item}</button>)}<button onClick={()=>viewerRef.current?.reset()} className="rounded border border-white/15 px-2 py-1">Reset</button><button aria-label="Full screen toxicology structure" onClick={()=>viewerRef.current?.fullscreen()} className="rounded border border-white/15 p-1"><Maximize2 size={13}/></button></div>
            <div className="toxicology-structure-selectors absolute bottom-3 left-3 z-10 max-w-[72%] rounded border border-white/10 bg-[#06131fe8] p-2 text-[10px]"><div className="flex flex-wrap gap-1">{Object.entries(STRUCTURES).map(([key,item])=><button key={key} aria-pressed={structureKey===key} onClick={()=>selectStructure(key)} className={`rounded border px-2 py-1 ${structureKey===key?"border-cyan-300 bg-cyan-300/15":"border-white/15"}`}>{item.label}</button>)}</div>{structureKey==="complex"&&<div className="mt-2 flex flex-wrap items-center gap-1"><span className="text-slate-400">Nearest heavy-atom contacts</span>{[[109,"His109 · 2.71 Å"],[258,"Glu258 · 2.89 Å"],[255,"Arg255 · 3.35 Å"],[381,"Phe381 · 3.36 Å"]].map(([residue,label])=><button key={residue} onClick={()=>setSelectedResidue(residue)} className="rounded border border-white/15 px-2 py-1">{label}</button>)}<button onClick={()=>viewerRef.current?.focusLigandId("TYL","A")} className="rounded border border-white/15 px-2 py-1">Focus TYL</button></div>}</div>
            <div className="toxicology-structure-readout pointer-events-none absolute bottom-3 right-3 z-10 max-w-[28%] rounded bg-[#06131fe8] px-2 py-1 text-right text-[9px] text-slate-300">{selectedAtom?`${selectedAtom.element} · ${selectedAtom.residueName} ${selectedAtom.atom} · [${selectedAtom.coordinates.map(value=>value.toFixed(2)).join(", ")}] Å`:"Click an atom for coordinate inspection"}</div>
          </div> : <div className="relative mt-3 h-[580px] overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_50%_45%,rgba(157,78,90,.55),transparent_55%),linear-gradient(135deg,#253c48,#14202f)]">
            <div className="absolute left-4 right-4 top-4 rounded border border-cyan-300/20 bg-slate-950/45 px-3 py-2 text-center text-xs text-cyan-100">
              {tabSummary}
            </div>
            <div className="absolute left-[38%] top-[13%] rounded border border-cyan-300/50 bg-slate-900/80 p-3 text-center">
              Acetaminophen
              <br />
              <span className="text-xs text-cyan-200">C₈H₉NO₂</span>
            </div>
            <div className="absolute left-[22%] top-[44%] rounded border border-blue-300 bg-blue-500/20 p-3 text-center">
              Glucuronidation
              <br />
              <small>~50–60%</small>
            </div>
            <div className="absolute left-[67%] top-[44%] rounded border border-amber-300 bg-amber-500/20 p-3 text-center">
              CYP450 → NAPQI
              <br />
              <small>reactive metabolite</small>
            </div>
            <div className="absolute left-[42%] top-[70%] rounded border border-red-300 bg-red-500/20 p-3 text-center">
              Protein binding
              <br />
              <small>oxidative stress → injury</small>
            </div>
            <div className="absolute left-[13%] top-[33%] text-5xl text-blue-300">
              ↓
            </div>
            <div className="absolute left-[62%] top-[33%] text-5xl text-amber-300">
              ↓
            </div>
            <div className="absolute left-[49%] top-[61%] text-5xl text-red-300">
              ↓
            </div>
          </div>}
        </main>
        <aside className="space-y-3 overflow-auto">
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold text-cyan-200">Dose metabolism flow</h2>
            <div className="mt-4 h-48 rounded bg-gradient-to-r from-blue-400/50 via-green-400/40 to-amber-300/50 p-5 text-center text-sm">
              Acetaminophen dose ({dose} g)
              <br />
              <span className="text-cyan-200">
                Glucuronidation {glucuronidation}%
              </span>
              <br />
              <span className="text-green-300">Sulfation {sulfation}%</span>
              <br />
              <span className="text-amber-300">
                CYP450 → NAPQI {cypFraction}%
              </span>
            </div>
          </section>
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold">Biomarkers & risk</h2>
            {[
              ["Plasma acetaminophen", "12 µg/mL"],
              ["ALT (liver enzyme)", `${alt.toLocaleString()} U/L`],
              ["AST", `${ast.toLocaleString()} U/L`],
              ["Bilirubin", "2.1 mg/dL"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="mt-2 flex justify-between border-b border-white/10 py-2 text-xs"
              >
                <span>{a}</span>
                <b>{b}</b>
              </div>
            ))}
            <div
              className={`mt-4 rounded border p-3 text-center ${risk === "High" ? "border-red-400 bg-red-500/10 text-red-300" : risk === "Moderate" ? "border-amber-300/40 text-amber-200" : "border-emerald-300/40 bg-emerald-500/10 text-emerald-200"}`}
            >
              Liver injury risk
              <br />
              <strong className="text-2xl">{risk}</strong>
            </div>
          </section>
          <section className="rounded border border-white/10 bg-[#0b2135] p-4">
            <h2 className="font-bold text-emerald-300">
              <ShieldCheck className="mr-1 inline" size={17} />
              Antidote: N-acetylcysteine
            </h2>
            <button
              onClick={() => {
                setNac((v) => !v);
                announce(nac ? "Antidote removed" : "NAC mechanism shown");
              }}
              className="mt-3 w-full rounded bg-emerald-500/20 px-3 py-2 text-sm text-emerald-200"
            >
              {nac ? "Hide mechanism" : "Show mechanism"}
            </button>
            {nac && (
              <p className="mt-3 text-xs text-slate-300">
                Replenishes glutathione and directly conjugates NAPQI.
              </p>
            )}
          </section>
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
