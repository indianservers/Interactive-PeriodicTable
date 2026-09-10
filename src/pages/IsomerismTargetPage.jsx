import { useRef, useState } from "react";
import {
  Beaker,
  ChevronDown,
  CircleHelp,
  Eye,
  FlaskConical,
  Home,
  Info,
  Maximize2,
  Play,
  RotateCcw,
  Settings,
  Shapes,
  Sparkles,
  StopCircle,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import "./isomerismTarget.css";

const molecules = [
  {
    name: "Lactic acid",
    formula: "C₃H₆O₃",
    tag: "Optical isomerism",
    kind: "optical",
    molarMass: "90.08 g mol⁻¹",
    meltingPoint: "52–54 °C",
    density: "1.206 g mL⁻¹",
    solubility: "Miscible",
    rotation: "+3.8°",
    groups: ["–COOH", "–OH", "–CH₃", "–H"],
    leftLabel:"(R)-lactic acid",rightLabel:"(S)-lactic acid",leftSource:"r-lactic.sdf",rightSource:"s-lactic.sdf",centers:[3],provenance:"PubChem CIDs 61503 / 107689",
  },
  {
    name: "2-butanol",
    formula: "C₄H₁₀O",
    tag: "Optical isomerism",
    kind: "optical",
    molarMass: "74.12 g mol⁻¹",
    meltingPoint: "−115 °C",
    density: "0.81 g mL⁻¹",
    solubility: "Slightly soluble",
    rotation: "+2.4°",
    groups: ["–OH", "–CH₂CH₃", "–CH₃", "–H"],
    leftLabel:"(R)-2-butanol",rightLabel:"(S)-2-butanol",leftSource:"r-2-butanol.sdf",rightSource:"s-2-butanol.sdf",centers:[1],provenance:"PubChem stereospecific 3D conformers",
  },
  {
    name: "2-butene",
    formula: "C₄H₈",
    tag: "E / Z isomerism",
    kind: "geometric",
    molarMass: "56.11 g mol⁻¹",
    meltingPoint: "Isomer dependent",
    density: "Isomer dependent",
    solubility: "Low",
    rotation: null,
    groups: ["–Cl", "–CH₃", "–CH₂CH₃", "–H"],
    leftLabel:"(E)-2-butene",rightLabel:"(Z)-2-butene",leftSource:"e-2-butene.sdf",rightSource:"z-2-butene.sdf",centers:[],provenance:"PubChem trans/cis 2-butene 3D conformers",
  },
  {name:"Butane / isobutane",formula:"C₄H₁₀",tag:"Structural isomerism",kind:"structural",molarMass:"58.12 g mol⁻¹",meltingPoint:"Different",density:"Different",solubility:"Low",rotation:null,groups:["Connectivity","Chain skeleton","Same formula","Different name"],leftLabel:"n-Butane",rightLabel:"Isobutane",leftSource:"butane.sdf",rightSource:"isobutane.sdf",centers:[],provenance:"PubChem CIDs 7843 / 6360"},
  {name:"Tartaric acid",formula:"C₄H₆O₆",tag:"Diastereomerism",kind:"diastereomer",molarMass:"150.09 g mol⁻¹",meltingPoint:"Stereoisomer dependent",density:"Stereoisomer dependent",solubility:"Soluble",rotation:null,groups:["–OH","–COOH","C2 centre","C3 centre"],leftLabel:"(2R,3R)-tartaric acid",rightLabel:"meso-(2R,3S)-tartaric acid",leftSource:"rr-tartaric.sdf",rightSource:"meso-tartaric.sdf",centers:[6,7],provenance:"PubChem CIDs 444305 / 439655"},
  {name:"Butane conformers",formula:"C₄H₁₀",tag:"Conformational isomerism",kind:"conformer",molarMass:"58.12 g mol⁻¹",meltingPoint:"Same compound",density:"Same compound",solubility:"Low",rotation:null,groups:["C1","C2","C3","C4"],leftLabel:"Anti butane",rightLabel:"Gauche butane",leftSource:"butane.sdf",rightSource:"gauche-butane.sdf",centers:[],provenance:"PubChem CID 7843; gauche model derived by a 120° central-bond rotation"},
];

function Molecule({
  mirror = false,
  spinning = false,
  superimposed = false,
  configuration = "R",
}) {
  return (
    <div
      className={`relative h-64 w-64 transition-transform duration-700 ${spinning ? "animate-[spin_8s_linear_infinite]" : ""} ${superimposed ? "opacity-80" : ""}`}
      style={{
        transform: `${mirror ? "scaleX(-1)" : ""} ${superimposed ? "translateX(-8px)" : ""}`,
      }}
      aria-label={`${configuration} isomer`}
    >
      <svg viewBox="0 0 260 260" className="h-full w-full overflow-visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <line
          x1="130"
          y1="130"
          x2="130"
          y2="48"
          stroke="#788da8"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="130"
          y1="130"
          x2="57"
          y2="180"
          stroke="#2aa6eb"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="130"
          y1="130"
          x2="203"
          y2="180"
          stroke="#25bd77"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <line
          x1="130"
          y1="130"
          x2="60"
          y2="104"
          stroke="#d8dfea"
          strokeWidth="10"
          strokeDasharray="6 9"
          strokeLinecap="round"
        />
        <circle
          cx="130"
          cy="130"
          r="29"
          fill="#26384c"
          stroke="#6b8ca8"
          strokeWidth="3"
        />
        <text
          x="130"
          y="137"
          fill="#baf4ff"
          textAnchor="middle"
          fontSize="17"
          fontWeight="700"
        >
          C*
        </text>
        <circle
          cx="130"
          cy="42"
          r="26"
          fill="#f0443e"
          stroke="#ff716b"
          strokeWidth="3"
          filter="url(#glow)"
        />
        <text
          x="130"
          y="49"
          fill="white"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
        >
          1
        </text>
        <circle
          cx="54"
          cy="184"
          r="25"
          fill="#147ad7"
          stroke="#43b5ff"
          strokeWidth="3"
        />
        <text
          x="54"
          y="191"
          fill="white"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
        >
          2
        </text>
        <circle
          cx="206"
          cy="184"
          r="25"
          fill="#35a957"
          stroke="#65e087"
          strokeWidth="3"
        />
        <text
          x="206"
          y="191"
          fill="white"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
        >
          3
        </text>
        <circle
          cx="55"
          cy="99"
          r="23"
          fill="#dce3ea"
          stroke="#fff"
          strokeWidth="3"
        />
        <text
          x="55"
          y="106"
          fill="#233042"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
        >
          4
        </text>
        <path
          d="M82 117 Q63 78 92 65"
          fill="none"
          stroke="#45d8ff"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />
        <path
          d="M176 161 Q202 130 181 102"
          fill="none"
          stroke="#45d8ff"
          strokeWidth="3"
          markerEnd="url(#arrow)"
        />
      </svg>
    </div>
  );
}

export default function IsomerismTargetPage() {
  const leftViewerRef=useRef(null),rightViewerRef=useRef(null);
  const [moleculeIndex, setMoleculeIndex] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [superimpose, setSuperimpose] = useState(false);
  const [tested, setTested] = useState(false);
  const [projection, setProjection] = useState("Newman projection");
  const [priority, setPriority] = useState(1);
  const [notice, setNotice] = useState("");
  const [representation,setRepresentation]=useState("Ball & stick");
  const [selectedAtom,setSelectedAtom]=useState(null);
  const [mirrorMode,setMirrorMode]=useState(false);
  const molecule = molecules[moleculeIndex];
  const rotation = molecule.rotation;
  const optical = molecule.kind === "optical";
  const configurations={optical:["R","S"],geometric:["E","Z"],structural:["n","iso"],diastereomer:["2R,3R","2R,3S"],conformer:["anti","gauche"]};
  const [leftConfiguration,rightConfiguration]=configurations[molecule.kind]||["A","B"];
  const relationshipLabels={optical:["R configuration","S configuration"],geometric:["E configuration","Z configuration"],structural:["straight chain","branched chain"],diastereomer:["(2R,3R)","meso (2R,3S)"],conformer:["anti conformer","gauche conformer"]};
  const [leftRelation,rightRelation]=relationshipLabels[molecule.kind];
  const announce = (message) => setNotice(message);
  return (
    <div
      className="iso-app min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui" }}
    >
      <header className="flex h-[70px] items-center gap-4 border-b border-cyan-100/10 bg-[#0a1a29] px-5">
        <div className="grid h-10 w-10 place-items-center rounded-lg border border-cyan-300/70 bg-cyan-300/10 text-cyan-300">
          <Shapes size={24} />
        </div>
        <div>
          <h1 className="text-[21px] font-black tracking-tight">
            Isomerism Studio
          </h1>
          <p className="text-xs text-slate-400">
            Explore · Visualize · Understand Stereochemistry
          </p>
        </div>
        <nav className="ml-auto flex items-center gap-5 text-xs text-slate-300">
          <button onClick={() => announce("Molecular tools opened")}>
            <Sparkles size={15} className="mr-1 inline text-cyan-300" />
            Molecular Tools
          </button>
          <button onClick={() => announce("View options opened")}>
            <Eye size={15} className="mr-1 inline" />
            View
          </button>
          <button onClick={() => announce("Settings opened")}>
            <Settings size={15} className="mr-1 inline" />
            Settings
          </button>
          <button onClick={() => announce("Help opened")}>
            <CircleHelp size={15} className="mr-1 inline" />
            Help
          </button>
        </nav>
      </header>
      <div className="iso-layout grid h-[calc(100vh-70px)] grid-cols-[228px_1fr_385px] grid-rows-[1fr_355px] gap-2 p-2">
        <aside className="row-span-2 flex flex-col border-r border-white/10 bg-[#0a1c2c] p-3">
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-cyan-400/15 px-3 py-3 text-sm font-bold text-cyan-200">
            <Home size={17} /> Isomerism Studio
          </div>
          <p className="mb-2 mt-3 px-2 text-[10px] uppercase tracking-[.2em] text-slate-500">
            Isomerism
          </p>
          {[["Structural Isomerism",3],["Geometrical Isomerism (E / Z)",2],["Optical Isomerism (R / S)",0],["Diastereomers",4],["Conformational Isomerism",5]].map(([x,target]) => (
            <button
              key={x}
              onClick={() => {setMoleculeIndex(target);setSelectedAtom(null);announce(x + " selected");}}
              className={`mb-1 rounded-lg px-3 py-3 text-left text-xs ${moleculeIndex === target ? "border border-cyan-300/70 bg-cyan-400/20 text-cyan-100" : "text-slate-300 hover:bg-white/5"}`}
            >
              {x}
            </button>
          ))}
          <p className="mb-2 mt-5 px-2 text-[10px] uppercase tracking-[.2em] text-slate-500">
            Tools
          </p>
          {["Molecules Library", "Simulations", "Quizzes", "Notes"].map((x) => (
            <button
              key={x}
              onClick={() => announce(x + " opened")}
              className="rounded-lg px-3 py-3 text-left text-xs text-slate-300 hover:bg-white/5"
            >
              <FlaskConical size={15} className="mr-2 inline text-slate-400" />
              {x}
            </button>
          ))}
          <div className="mt-auto border-t border-white/10 pt-4 text-[11px] italic text-slate-500">
            “Stereochemistry connects structure to the real world.”
          </div>
        </aside>
        <section className="iso-main-stage relative overflow-hidden rounded-lg border border-cyan-100/15 bg-gradient-to-br from-[#0b1e30] to-[#081522] p-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">{molecule.leftLabel} / {molecule.rightLabel}</h2>
              <p className="text-sm text-slate-400">{molecule.formula}</p>
            </div>
            <p className="text-sm font-semibold italic text-cyan-300">
              {{optical:"Mirror images · not superimposable",geometric:"Geometric isomers · different alkene arrangement",structural:"Same formula · different connectivity",diastereomer:"Stereoisomers · not mirror images",conformer:"Same connectivity · rotation about a σ bond"}[molecule.kind]}
            </p>
          </div>
          <div className="absolute right-3 top-3 mt-9 rounded-lg border border-white/15 bg-[#0e2538] p-2 text-[11px]">
            ● &nbsp; C&nbsp; Carbon
            <br />
            <span className="text-red-400">●</span>&nbsp; O&nbsp; Oxygen
            <br />
            <span className="text-slate-200">●</span>&nbsp; H&nbsp; Hydrogen
          </div>
          <div className={`iso-dual-viewers ${superimpose?"is-superimposed":""} ${mirrorMode?"is-mirror-mode":""}`}>
            {[{side:"left",ref:leftViewerRef,source:molecule.leftSource,label:molecule.leftLabel},{side:"right",ref:rightViewerRef,source:molecule.rightSource,label:molecule.rightLabel}].map(item=><div className={`iso-viewer ${item.side}`} key={item.side}><ViewerErrorBoundary label={`${item.label} viewer`}><MolstarViewer ref={item.ref} source={{url:`/assets/isomerism/${item.source}`,format:"sdf",label:item.label}} sourceType="sdf" label={item.label} representation={{BallAndStick:representation==="Ball & stick",Spacefill:representation==="Space filling",Sticks:representation==="Sticks",Ligand:false,Branched:false,Ion:false}} colorScheme="element" selectedAtomIndex={selectedAtom?.sourceIndex} selectedAtomIndices={molecule.centers} onReady={()=>requestAnimationFrame(()=>item.ref.current?.zoom(1.25))} onSelectionChange={setSelectedAtom}/></ViewerErrorBoundary><b>{item.label}</b></div>)}
            <div className="iso-pair-note">{superimpose?"Qualitative overlay — compare atom correspondence; no fitted RMSD is claimed":mirrorMode?"Mirror comparison mode — stereospecific coordinates retained":"Synchronized selection · click an atom in either viewer"}</div>
          </div>
          <div className="iso-controls absolute bottom-3 left-3 right-3 flex gap-2">
            <button
              onClick={() => {leftViewerRef.current?.rotate("y",25);rightViewerRef.current?.rotate("y",25);setSpinning(true);setTimeout(()=>setSpinning(false),300);}}
              className="rounded-lg border border-cyan-300/70 bg-cyan-300/10 px-4 py-2 text-xs text-cyan-200"
            >
              <RotateCcw size={14} className="mr-1 inline" /> Rotate both
            </button>
            <button
              onClick={() => setSuperimpose((v) => !v)}
              className={`rounded-lg border px-4 py-2 text-xs ${superimpose ? "border-cyan-300 bg-cyan-300/15" : "border-white/20"}`}
            >
              ♧ Superimpose
            </button>
            <button onClick={()=>setMirrorMode(value=>!value)} className={`rounded-lg border px-4 py-2 text-xs ${mirrorMode?"border-cyan-300 bg-cyan-300/15":"border-white/20"}`}>Mirror mode</button>
            <button
              onClick={() => {
                setTested(true);
                announce("Superposition test complete");
              }}
              className="rounded-lg border border-white/20 px-4 py-2 text-xs"
            >
              <Info size={14} className="mr-1 inline" /> Test superposition
            </button>
            <select
              value={representation}
              onChange={(e) => {
                setRepresentation(e.target.value);
                announce(e.target.value + " selected");
              }}
              className="ml-auto rounded-lg border border-white/20 bg-[#0d2033] px-3 py-2 text-xs"
            >
              <option>Ball &amp; stick</option>
              <option>Space filling</option>
              <option>Sticks</option>
            </select>
            <button
              onClick={() => {
                setSpinning(false);
                setSuperimpose(false);
                setMirrorMode(false);
                setSelectedAtom(null);
                leftViewerRef.current?.reset();rightViewerRef.current?.reset();
                setTested(false);
                announce("View reset");
              }}
              className="rounded-lg border border-white/20 px-3 py-2 text-xs"
            >
              <RotateCcw size={14} className="inline" /> Reset view
            </button>
          </div>
          {tested && (
            <div className="absolute bottom-14 left-1/2 -translate-x-1/2 rounded-full bg-emerald-400 px-4 py-1 text-xs font-bold text-slate-950">
              {{optical:"Not superimposable ✓",geometric:"Distinct E/Z arrangement ✓",structural:"Connectivity differs ✓",diastereomer:"Not mirror-related ✓",conformer:"Interconverted by bond rotation ✓"}[molecule.kind]}
            </div>
          )}
        </section>
        <aside className="iso-guide row-span-2 overflow-y-auto rounded-lg border border-cyan-100/15 bg-[#0a1c2c] p-3">
          <h2 className="text-base font-bold">
            {molecule.kind==="optical"?`Assign CIP priorities — ${molecule.leftLabel}`:molecule.kind==="geometric"?`Assign alkene priorities — ${molecule.name}`:`Compare ${molecule.tag.toLowerCase()}`}
          </h2>
          <div className="mt-3 space-y-3">
            {[
              [
                "Identify the chiral center",
                "Tetrahedral carbon attached to four different groups.",
              ],
              [
                "Assign priorities (CIP rules)",
                "Rank attached atoms by atomic number.",
              ],
              [
                "Determine the configuration",
                "View from the side opposite the lowest priority group (4). Trace 1 → 2 → 3.",
              ],
            ].map(([title, body], i) => (
              <div key={title} className="flex gap-3">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-300 font-black text-slate-900">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-bold">
                    {title} <span className="text-emerald-400">✓</span>
                  </h3>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    {body}
                  </p>
                  {i === 1 && (
                    <div className="mt-2 space-y-1">
                      {molecule.groups.map((g, j) => (
                        <button
                          key={g}
                          onClick={() => {
                            setPriority(j + 1);
                            announce(`Priority ${j + 1} selected`);
                          }}
                          className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs ${priority === j + 1 ? "bg-cyan-300/15 text-cyan-100" : "text-slate-300"}`}
                        >
                          <span
                            className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold ${["bg-red-500", "bg-blue-500", "bg-emerald-500", "bg-slate-200 text-slate-800"][j]}`}
                          >
                            {j + 1}
                          </span>
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-emerald-400/70 bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200">
            ✓ Result: {molecule.leftLabel} / {molecule.rightLabel}
          </div>
          <div className="mt-4 rounded-lg border border-amber-300/60 bg-amber-300/10 p-3 text-xs text-amber-100">
            <Info size={14} className="mr-1 inline" /> {optical?"Enantiomers have identical physical properties in an achiral environment except the direction of plane-polarized light.":molecule.kind==="conformer"?"Conformers interconvert by rotation about a single bond without changing connectivity.":"Use connectivity and stereochemical descriptors—not visual resemblance alone—to classify the pair."}
          </div>
        </aside>
        <section className="rounded-lg border border-cyan-100/15 bg-[#0a1c2c] p-3">
          <h3 className="font-bold">
            {optical
              ? "Optical Activity – Plane-Polarized Light"
              : molecule.kind==="geometric"?"Geometric Configuration – E / Z":"Coordinate-backed relationship summary"}
          </h3>
          <div className="mt-2 grid grid-cols-[130px_1fr_80px] items-center gap-3 text-xs">
            <div>
              <b>
                {molecule.leftLabel}
              </b>
              <br />
              <span className="text-cyan-300">
                {optical ? "dextrorotatory" : leftRelation}
              </span>
            </div>
            <div className="relative h-16 rounded bg-gradient-to-r from-yellow-500/10 via-yellow-300/30 to-yellow-500/10">
              <div className="absolute inset-x-4 top-7 h-0.5 bg-yellow-300" />
              <div className="absolute left-1/2 top-1/2 h-11 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/50 bg-cyan-200/10" />
              <div className="absolute right-3 top-3 text-yellow-300">↗</div>
            </div>
            <div className="text-right text-yellow-300">
              Rotated
              <br />
              <b>{optical ? rotation : "not applicable"}</b>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-[130px_1fr_80px] items-center gap-3 text-xs">
            <div>
              <b>
                {molecule.rightLabel}
              </b>
              <br />
              <span className="text-fuchsia-300">
                {optical ? "levorotatory" : rightRelation}
              </span>
            </div>
            <div className="relative h-16 rounded bg-gradient-to-r from-fuchsia-500/10 via-fuchsia-300/20 to-fuchsia-500/10">
              <div className="absolute inset-x-4 top-7 h-0.5 bg-fuchsia-300" />
              <div className="absolute left-1/2 top-1/2 h-11 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-200/50 bg-fuchsia-200/10" />
              <div className="absolute right-3 top-3 text-fuchsia-300">↙</div>
            </div>
            <div className="text-right text-fuchsia-300">
              Rotated
              <br />
              <b>
                {optical ? "−" + rotation.replace("+", "") : "not applicable"}
              </b>
            </div>
          </div>
          <p className="mt-2 text-xs italic text-slate-400">
            {optical?"Equal magnitude, opposite direction — a hallmark of enantiomers.":molecule.kind==="geometric"?"E/Z isomers differ in substituent arrangement around the double bond.":`${molecule.tag}: ${molecule.provenance}.`}
          </p>
        </section>
        <section className="rounded-lg border border-cyan-100/15 bg-[#0a1c2c] p-3">
          <h3 className="font-bold">Physical Property Comparison</h3>
          <table className="mt-2 w-full text-[11px]">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="p-2">Property</th>
                <th className="p-2">{molecule.leftLabel}</th>
                <th className="p-2">{molecule.rightLabel}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Molecular formula", molecule.formula, molecule.formula],
                ["Molar mass", molecule.molarMass, molecule.molarMass],
                ["Melting point", molecule.meltingPoint, molecule.meltingPoint],
                ...(optical
                  ? [
                      [
                        "Specific rotation [α]²⁰",
                        rotation,
                        "−" + rotation.replace("+", ""),
                      ],
                    ]
                  : [["Relationship", leftRelation, rightRelation]]),
                ["Density (20 °C)", molecule.density, molecule.density],
                [
                  "Solubility in water",
                  molecule.solubility,
                  molecule.solubility,
                ],
              ].map((row) => (
                <tr key={row[0]} className="border-b border-white/10">
                  <td className="p-2 text-slate-400">{row[0]}</td>
                  <td className="p-2">{row[1]}</td>
                  <td className="p-2">{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex items-center justify-between rounded border border-cyan-300/30 bg-cyan-300/5 p-2 text-xs">
            <span>Load molecule</span>
            <div className="flex gap-1">
              {molecules.map((m, i) => (
                <button
                  key={m.name}
                  onClick={() => {
                    setMoleculeIndex(i);
                    setPriority(1);
                    setTested(false);
                    setSuperimpose(false);
                    announce(`${m.name} loaded`);
                  }}
                  className={`rounded px-2 py-1 ${i === moleculeIndex ? "bg-cyan-300 text-slate-900" : "border border-white/20"}`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
      {notice && (
        <div
          role="status"
          className="fixed bottom-4 right-5 rounded-full border border-cyan-300/40 bg-slate-950/95 px-4 py-2 text-xs text-cyan-100"
        >
          {notice}
        </div>
      )}
    </div>
  );
}
