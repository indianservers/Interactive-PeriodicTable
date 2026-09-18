import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileText,
  Maximize2,
  Ruler,
  Search,
  Sun,
  Waves,
} from "lucide-react";
import MolstarViewer from "../components/molecular-viewer/MolstarViewer.jsx";
import ViewerErrorBoundary from "../components/molecular-viewer/ViewerErrorBoundary.jsx";
import { SciencePlot } from "../components/science/SciencePlot.jsx";
import "./spectroscopyTarget.css";
const peaks = [
  {
    shift: "4.12",
    mult: "quartet",
    integration: "2H",
    assignment: "O–CH₂–",
    color: "#22d3ee",
  },
  {
    shift: "2.05",
    mult: "singlet",
    integration: "3H",
    assignment: "CO–CH₃",
    color: "#a78bfa",
  },
  {
    shift: "1.26",
    mult: "triplet",
    integration: "3H",
    assignment: "–CH₃",
    color: "#fbbf24",
  },
];
const modeMeta = {
  "¹H NMR": { title: "¹H NMR · 400 MHz · CDCl₃", axis: "δ (ppm)", suffix: "ppm", instrument: "400 MHz · 16 scans · TMS" },
  "¹³C NMR": { title: "¹³C NMR · 100 MHz · CDCl₃", axis: "δ (ppm)", suffix: "ppm", instrument: "100 MHz · ¹H decoupled" },
  IR: { title: "FT-IR · ATR", axis: "Wavenumber (cm⁻¹)", suffix: "cm⁻¹", instrument: "ATR diamond · 4 cm⁻¹" },
  "Mass Spectrum": { title: "EI Mass Spectrum", axis: "m/z", suffix: "m/z", instrument: "EI · 70 eV" },
  "UV-Vis": { title: "UV–Vis · Absorbance", axis: "Wavelength (nm)", suffix: "nm", instrument: "MeOH · 1.00 cm" },
};
const assignmentAtoms={"C=O":[1,4],"O–CH₂–":[0,2,6,7],"CO–CH₃":[4,5,11,12,13],"–CH₃":[3,8,9,10],"C–H stretch":[3,5,8,9,10,11,12,13],"C–O ester":[0,2],"Molecular ion":[0,1,2,3,4,5],"CH₃CO⁺":[4,5,11,12,13],"C₂H₅⁺":[0,2,3,6,7,8,9,10],"Ester π→π*":[1,4],"Carbonyl n→π*":[1,4],"Weak tail":[1]};
const lorentz = (x, center, width, height) => height * (width * width) / ((x - center) ** 2 + width * width);
const pascal = { 1: [1], 2: [1, 1], 3: [1, 2, 1], 4: [1, 3, 3, 1] };
function splitLines(center, n, jppm, height, width) {
  const weights = pascal[n] || [1];
  const max = Math.max(...weights);
  return weights.map((weight, index) => ({
    center: center - ((n - 1) * jppm) / 2 + index * jppm,
    height: height * (weight / max),
    width,
  }));
}
function buildSpectrum(mode, modePeaks, selected, zoom) {
  const selectedShift = Number(selected?.shift);
  if (mode === "Mass Spectrum") {
    const ions = [
      { x: 29, y: 42, label: "29" },
      { x: 43, y: 100, label: "43" },
      { x: 61, y: 18, label: "61" },
      { x: 73, y: 28, label: "73" },
      { x: 88, y: 62, label: "88" },
    ];
    return {
      series: [{
        label: "Relative intensity",
        data: ions.flatMap((ion) => [{ x: ion.x, y: 0 }, { x: ion.x, y: ion.y }, { x: ion.x, y: null }]),
        color: "#7ee8ff",
        width: 2.4,
        hover: "m/z %{x:.0f}<br>%{y:.0f} %<extra></extra>",
      }],
      xDomain: [10, 110],
      yDomain: [0, 118],
      reverseX: false,
      yLabel: "Relative intensity (%)",
      annotations: ions.map((ion) => ({ x: ion.x, y: ion.y, text: ion.label, showarrow: false, yshift: 12 })),
      shapes: selectedShift ? [{ type: "rect", x0: selectedShift - 1.2, x1: selectedShift + 1.2, y0: 0, y1: 1, yref: "paper", fillcolor: "rgba(125,232,255,0.08)", line: { width: 0 } }] : [],
    };
  }
  if (mode === "IR") {
    const xs = Array.from({ length: 721 }, (_, i) => 400 + i * 5);
    const bands = [
      { center: 2980, width: 42, height: 28 },
      { center: 1740, width: 16, height: 74 },
      { center: 1370, width: 18, height: 22 },
      { center: 1240, width: 22, height: 48 },
      { center: 1050, width: 20, height: 36 },
    ];
    return {
      series: [{
        label: "%T",
        data: xs.map((x) => ({ x, y: Math.max(8, 96 - bands.reduce((sum, band) => sum + lorentz(x, band.center, band.width, band.height), 0)) })),
        color: "#7ee8ff",
        smooth: true,
        hover: "%{x:.0f} cm⁻¹<br>%T = %{y:.1f}<extra></extra>",
      }],
      xDomain: [400, 4000],
      yDomain: [0, 105],
      reverseX: true,
      yLabel: "Transmittance (%)",
      annotations: modePeaks.map((peak) => ({ x: Number(peak.shift), y: 18, text: peak.assignment, showarrow: false })),
      shapes: [
        { type: "rect", x0: 1500, x1: 400, y0: 0, y1: 1, yref: "paper", fillcolor: "rgba(255,210,120,0.05)", line: { width: 0 } },
        selectedShift ? { type: "line", x0: selectedShift, x1: selectedShift, y0: 0, y1: 1, yref: "paper", line: { color: selected.color, width: 1.4, dash: "dot" } } : null,
      ].filter(Boolean),
    };
  }
  if (mode === "UV-Vis") {
    const xs = Array.from({ length: 171 }, (_, i) => 190 + i);
    return {
      series: [{
        label: "Absorbance",
        data: xs.map((x) => ({ x, y: modePeaks.reduce((sum, peak, index) => sum + lorentz(x, Number(peak.shift), [7, 16, 12][index], [0.92, 0.28, 0.16][index]), 0) })),
        color: "#7ee8ff",
        fill: true,
        fillcolor: "rgba(126,232,255,0.16)",
        smooth: true,
        hover: "λ = %{x:.0f} nm<br>A = %{y:.3f}<extra></extra>",
      }],
      xDomain: [190, 360],
      yDomain: [0, 1.15],
      reverseX: false,
      yLabel: "Absorbance",
      annotations: [{ x: 205, y: 0.92, text: "λmax 205 nm", showarrow: true, arrowhead: 0, ay: -22 }],
      shapes: selectedShift ? [{ type: "line", x0: selectedShift, x1: selectedShift, y0: 0, y1: 1, yref: "paper", line: { color: selected.color, width: 1.4, dash: "dot" } }] : [],
    };
  }
  const isCarbon = mode === "¹³C NMR";
  const domain = isCarbon ? [200, 0] : zoom === "full" ? [10, 0] : [6, 0];
  const xs = Array.from({ length: 701 }, (_, i) => domain[0] + (domain[1] - domain[0]) * i / 700);
  const lines = isCarbon
    ? modePeaks.map((peak) => ({ center: Number(peak.shift), height: 1, width: 0.22 }))
    : modePeaks.flatMap((peak) => {
        const n = peak.mult === "quartet" ? 4 : peak.mult === "triplet" ? 3 : 1;
        const height = peak.integration === "2H" ? 2 : 3;
        return splitLines(Number(peak.shift), n, 7.1 / 400, height, 0.012);
      });
  const ymax = isCarbon ? 1.25 : 3.6;
  return {
    series: [{
      label: "Intensity",
      data: xs.map((x) => ({ x, y: lines.reduce((sum, line) => sum + lorentz(x, line.center, line.width, line.height), 0) })),
      color: "#7ee8ff",
      hover: "δ = %{x:.2f} ppm<extra></extra>",
    }],
    xDomain: domain,
    yDomain: [0, ymax],
    reverseX: true,
    yLabel: "Intensity",
    annotations: modePeaks.map((peak) => ({
      x: Number(peak.shift),
      y: isCarbon ? 1.08 : peak.integration === "2H" ? 2.35 : 3.25,
      text: `${peak.shift}`,
      showarrow: false,
      font: { color: peak.color, size: 11 },
    })),
    shapes: selectedShift
      ? [{ type: "rect", x0: selectedShift - (isCarbon ? 3 : 0.18), x1: selectedShift + (isCarbon ? 3 : 0.18), y0: 0, y1: 1, yref: "paper", fillcolor: `${selected.color}22`, line: { width: 0 } }]
      : [],
  };
}
export default function SpectroscopyTargetPage({ onNavigate }) {
  const viewerRef=useRef(null);
  const [mode, setMode] = useState("¹H NMR");
  const [peak, setPeak] = useState(peaks[0]);
  const [representation, setRepresentation] = useState("Ball & Stick");
  const [zoom, setZoom] = useState("1H");
  const [peakPicking, setPeakPicking] = useState(false);
  const [candidate, setCandidate] = useState("Ethyl acetate");
  const [checked, setChecked] = useState(false);
  const [notebookAdded, setNotebookAdded] = useState(false);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [viewerReady,setViewerReady]=useState(false);
  const [pickedAtoms,setPickedAtoms]=useState([]);
  const announce = (x) => setNotice(x);
  const modePeaks = useMemo(
    () =>
      mode === "¹H NMR"
        ? peaks
        : mode === "¹³C NMR"
          ? [
              { shift: "171.0", mult: "singlet", integration: "1C", assignment: "C=O", color: "#fb7185" },
              { shift: "60.4", mult: "singlet", integration: "1C", assignment: "O–CH₂–", color: "#22d3ee" },
              { shift: "21.0", mult: "singlet", integration: "1C", assignment: "CO–CH₃", color: "#a78bfa" },
              { shift: "14.2", mult: "singlet", integration: "1C", assignment: "–CH₃", color: "#fbbf24" },
            ]
          : mode === "IR"
            ? [
                { shift: "1740", mult: "strong", integration: "C=O", assignment: "C=O", color: "#fb7185" },
                { shift: "2980", mult: "medium", integration: "C–H", assignment: "C–H stretch", color: "#fbbf24" },
                { shift: "1240", mult: "strong", integration: "C–O", assignment: "C–O ester", color: "#22d3ee" },
              ]
            : mode === "Mass Spectrum"
              ? [
                  { shift: "88", mult: "M⁺", integration: "m/z", assignment: "Molecular ion", color: "#7ee8ff" },
                  { shift: "43", mult: "base", integration: "m/z", assignment: "CH₃CO⁺", color: "#a78bfa" },
                  { shift: "29", mult: "ion", integration: "m/z", assignment: "C₂H₅⁺", color: "#fbbf24" },
                ]
              : [
                  { shift: "205", mult: "λmax", integration: "π→π*", assignment: "Ester π→π*", color: "#22d3ee" },
                  { shift: "260", mult: "shoulder", integration: "n→π*", assignment: "Carbonyl n→π*", color: "#a78bfa" },
                  { shift: "280", mult: "weak", integration: "n→π*", assignment: "Weak tail", color: "#fbbf24" },
                ],
    [mode],
  );
  const metadata = modeMeta[mode];
  const plotSpec = useMemo(() => buildSpectrum(mode, modePeaks, peak, zoom), [mode, modePeaks, peak, zoom]);
  useEffect(()=>{setPeak(modePeaks[0]);},[mode,modePeaks]);
  const selectedAtomIndices=assignmentAtoms[peak.assignment]||[];
  const measuredDistance=pickedAtoms.length===2?Math.hypot(...pickedAtoms[0].coordinates.map((value,index)=>value-pickedAtoms[1].coordinates[index])).toFixed(2):null;
  const inspectAtom=atom=>setPickedAtoms(current=>current.some(item=>item.sourceIndex===atom.sourceIndex)?current:(current.length>=2?[atom]:[...current,atom]));
  return (
    <div
      className="spectro-app min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <Waves className="text-cyan-300" size={33} />
        <div>
          <h1 className="text-xl font-black">Spectroscopy Interpreter</h1>
          <p className="text-xs text-slate-400">
            From spectra to structure. Understand. Assign. Verify.
          </p>
        </div>
        <label className="ml-auto flex w-96 items-center gap-2 rounded border border-white/15 bg-slate-950/40 px-3 py-2 text-xs text-slate-400">
          <Search size={15} />
          <input
            className="w-full bg-transparent outline-none"
            placeholder="Search compounds, formulas, or paste SMILES..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <button onClick={() => announce("Projects opened")} className="text-xs">
          Projects
        </button>
        <button onClick={() => announce("Help opened")} className="text-xs">
          Help
        </button>
        <Sun size={17} />
        <span className="rounded-full bg-blue-500/20 px-3 py-2 text-xs">
          LC　Lab Chemist
        </span>
      </header>
      <div className="spectro-shell grid h-[calc(100vh-64px)] grid-cols-[185px_1fr] gap-3 p-3">
        <aside className="rounded border border-white/10 bg-[#0a1e31] p-3">
          {[
            "Home",
            "Spectroscopy",
            "My Library",
            "Structure Search",
            "Elimination Lab",
            "Learning Hub",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => (x === "Home" ? onNavigate?.("dashboard") : announce(`${x} selected`))}
              className={`mb-1 w-full rounded px-3 py-3 text-left text-sm ${i === 1 ? "border-l-2 border-cyan-300 bg-blue-500/15 text-cyan-200" : "text-slate-300"}`}
            >
              {x}
            </button>
          ))}
          <h3 className="mt-7 border-t border-white/10 pt-4 text-[10px] uppercase tracking-[.2em] text-slate-500">
            Recent Samples
          </h3>
          {[
            "Ethyl acetate",
            "Unknown A",
            "Ibuprofen",
            "Aspirin",
            "Unknown B",
          ].map((x, i) => (
            <button
              key={x}
              onClick={() => announce(`${x} sample selected`)}
              className="mt-2 block w-full rounded px-2 py-2 text-left text-xs text-slate-400"
            >
              {x}
              <small className="block text-slate-600">
                {i === 0 ? "C₄H₈O₂" : "sample"}
              </small>
            </button>
          ))}
        </aside>
        <main className="min-w-0 overflow-auto">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black">Ethyl acetate</h2>
              <p className="text-sm text-slate-400">
                C₄H₈O₂　MW 88.11 g/mol　IHD: 1　
                <span className="rounded bg-blue-500/20 px-2 py-1 text-cyan-200">
                  Ester
                </span>
              </p>
            </div>
            {query && (
              <p className="mt-2 rounded border border-cyan-300/20 bg-cyan-300/10 p-2 text-xs text-cyan-100">
                Search filter: {query} · interpreting the current sample.
              </p>
            )}
            <button
              onClick={() => {
                setChecked(true);
                announce("Structure consistency checked");
              }}
              className="rounded bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-200"
            >
              Check structure consistency　→
            </button>
          </div>
          <div className="mt-3 flex rounded border border-white/10 bg-[#0b2135]">
            {["¹H NMR", "¹³C NMR", "IR", "Mass Spectrum", "UV-Vis"].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setMode(x);
                  announce(`${x} spectrum selected`);
                }}
                className={`px-6 py-3 text-sm ${mode === x ? "border-b-2 border-cyan-300 text-cyan-200" : "text-slate-400"}`}
              >
                {x}
              </button>
            ))}
          </div>
          <div className="spectro-workspace mt-2 grid grid-cols-[1.35fr_.75fr_1fr] gap-2">
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{metadata.title}</h3>
                  <p className="text-[11px] text-slate-400">{metadata.instrument}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2 text-xs text-slate-400">
                  {mode.includes("NMR") && (
                    <>
                      <button
                        onClick={() => setZoom("1H")}
                        className={`rounded border px-2 py-1 ${zoom === "1H" ? "border-cyan-300 text-cyan-200" : "border-white/15"}`}
                      >
                        Assigned
                      </button>
                      <button
                        onClick={() => setZoom("full")}
                        className={`rounded border px-2 py-1 ${zoom === "full" ? "border-cyan-300 text-cyan-200" : "border-white/15"}`}
                      >
                        Full
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setPeakPicking((value) => !value);
                      announce(peakPicking ? "Peak picker off" : "Peak picker on");
                    }}
                    className={`rounded border px-2 py-1 ${peakPicking ? "border-cyan-300 text-cyan-200" : "border-white/15"}`}
                  >
                    Peak pick
                  </button>
                </div>
              </div>
              <div className="spectro-scope relative mt-3">
                <div className="spectro-scope-bar">
                  <span>{peakPicking ? "Click a peak to assign" : "Interactive spectrum"}</span>
                  <b>{peak.assignment} · {peak.shift} {metadata.suffix}</b>
                </div>
                <SciencePlot
                  series={plotSpec.series}
                  xLabel={metadata.axis}
                  yLabel={plotSpec.yLabel}
                  xDomain={plotSpec.xDomain}
                  yDomain={plotSpec.yDomain}
                  reverseX={plotSpec.reverseX}
                  height={320}
                  legend={false}
                  annotations={plotSpec.annotations}
                  shapes={plotSpec.shapes}
                  onPointClick={(event) => {
                    const x = event?.points?.[0]?.x;
                    if (x == null) return;
                    const nearest = modePeaks.reduce((best, item) => {
                      const distance = Math.abs(Number(item.shift) - Number(x));
                      return distance < best.distance ? { item, distance } : best;
                    }, { item: modePeaks[0], distance: Infinity });
                    setPeak(nearest.item);
                    setPeakPicking(true);
                    announce(`Selected ${nearest.item.assignment}`);
                  }}
                />
              </div>
              <div className={`mt-3 grid gap-2 ${modePeaks.length > 3 ? "grid-cols-4" : "grid-cols-3"}`}>
                {modePeaks.map((x) => (
                  <button
                    key={`${x.assignment}-${x.shift}`}
                    onClick={() => setPeak(x)}
                    className={`rounded border p-2 text-left text-xs ${peak.shift === x.shift ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
                  >
                    <b style={{ color: x.color }}>{x.shift} {metadata.suffix}</b>
                    <br />
                    {x.mult} · {x.integration}
                    <span className="mt-1 block text-[10px] text-slate-400">{x.assignment}</span>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <div className="flex items-center justify-between gap-2"><h3 className="font-bold">3D Structure (Ethyl acetate)</h3><button aria-label="Full screen ethyl acetate" onClick={()=>viewerRef.current?.fullscreen()} className="rounded border border-white/15 p-1.5 text-slate-300"><Maximize2 size={14}/></button></div>
              <div className="relative mt-3 h-60 overflow-hidden rounded border border-white/10 bg-[#071521]">
                <ViewerErrorBoundary label="Ethyl acetate structure viewer"><MolstarViewer ref={viewerRef} source={{url:"/assets/spectroscopy/ethyl-acetate.sdf",format:"sdf",label:"Ethyl acetate · PubChem CID 8857"}} sourceType="sdf" label="Ethyl acetate · PubChem CID 8857" representation={{BallAndStick:representation==="Ball & Stick",Spacefill:representation==="Spacefill",Ligand:false,Branched:false,Ion:false}} colorScheme="element" selectedAtomIndices={selectedAtomIndices} onReady={()=>{setViewerReady(true);requestAnimationFrame(()=>viewerRef.current?.zoom(1.25));}} onLoadError={()=>setViewerReady(false)} onSelectionChange={inspectAtom}/></ViewerErrorBoundary>
                <span className="absolute left-2 top-2 rounded border border-cyan-300/20 bg-slate-950/80 px-2 py-1 font-mono text-[9px] text-cyan-100">{viewerReady?"Mol* ready":"Loading…"} · CID 8857</span>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => setRepresentation("Ball & Stick")}
                  className={`flex-1 rounded border p-2 text-xs ${representation === "Ball & Stick" ? "border-cyan-300" : "border-white/10"}`}
                >
                  Ball & Stick
                </button>
                <button
                  onClick={() => setRepresentation("Spacefill")}
                  className={`flex-1 rounded border p-2 text-xs ${representation === "Spacefill" ? "border-cyan-300" : "border-white/10"}`}
                >
                  Spacefill
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Selected:{" "}
                <span className="text-cyan-200">{peak.assignment}</span> (
                {peak.integration})
              </p>
              <div className="mt-2 rounded border border-white/10 bg-slate-950/35 p-2 font-mono text-[10px] text-slate-400"><div className="flex items-center gap-1 text-slate-200"><Ruler size={12}/>Atom distance</div>{measuredDistance?`${pickedAtoms[0].element}${pickedAtoms[0].sourceIndex+1}–${pickedAtoms[1].element}${pickedAtoms[1].sourceIndex+1}: ${measuredDistance} Å`:pickedAtoms.length===1?"Select one more atom in Mol*":"Select two atoms in Mol*"}{pickedAtoms.length>0&&<button onClick={()=>setPickedAtoms([])} className="ml-2 text-cyan-300">Clear</button>}<br/>Highlighted group: atoms {selectedAtomIndices.map(index=>index+1).join(", ")}</div>
              <p className="mt-2 text-[10px] leading-4 text-slate-500">PubChem computed 3D conformer · CID 8857 · C₄H₈O₂ · 88.11 g/mol. Peak assignments are synchronized teaching data.</p>
            </section>
            <aside className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold">Peak Table ({mode})</h3>
              <div className="mt-3 overflow-hidden rounded border border-white/10 text-xs">
                <div className="grid grid-cols-4 border-b border-white/10 p-2 font-bold">
                  <span>{metadata.axis}</span>
                  <span>Multiplicity</span>
                  <span>Integral</span>
                  <span>Assignment</span>
                </div>
                {modePeaks.map((item) => (
                  <button
                    key={item.shift}
                    onClick={() => setPeak(item)}
                    className={`grid w-full grid-cols-4 border-b border-white/10 p-2 text-left ${peak.shift === item.shift ? "bg-cyan-300/10 text-cyan-100" : "text-slate-300"}`}
                  >
                    <span>{item.shift}</span>
                    <span>{item.mult}</span>
                    <span>{item.integration}</span>
                    <span>{item.assignment}</span>
                  </button>
                ))}
              </div>
              <h3 className="mt-4 font-bold">Assignment Notes</h3>
              <ul className="mt-2 space-y-2 text-xs text-slate-300">
                <li>
                  • 4.12 ppm quartet and 1.26 ppm triplet show ethyl coupling.
                </li>
                <li>• Integrations (2:3:3) match ethyl acetate.</li>
                <li>• Chemical shifts are consistent with an ester.</li>
              </ul>
            </aside>
          </div>
          <div className="spectro-reasoning mt-2 grid grid-cols-[1fr_360px] gap-2">
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold">Structure Elimination & Reasoning</h3>
              <div className="spectro-candidates mt-3 grid grid-cols-5 gap-2">
                {[
                  ["Ethyl acetate", "C₄H₈O₂", "Most consistent"],
                  ["Methyl propanoate", "C₄H₈O₂", "Would give OCH₃ singlet"],
                  ["n-Butyl acetate", "C₆H₁₂O₂", "More signals expected"],
                  ["Acetic acid", "C₂H₄O₂", "Broad OH signal missing"],
                  ["Ethanol", "C₂H₆O", "Wrong formula"],
                ].map(([x, formula, reason], i) => (
                  <button
                    key={x}
                    onClick={() => {
                      setCandidate(x);
                      announce(`${x} candidate selected`);
                    }}
                    className={`min-h-[142px] rounded border p-3 text-left text-xs ${candidate === x ? (i === 0 ? "border-emerald-300 bg-emerald-400/10" : "border-cyan-300 bg-cyan-300/10") : "border-white/10"}`}
                  >
                    <b>{i + 1}. {x}</b>
                    <span className="mt-3 block text-slate-400">{formula}</span>
                    <small className={i === 0 ? "mt-5 block text-emerald-300" : "mt-5 block text-red-300"}>
                      {i === 0 ? "✓ " : "× "}{reason}
                    </small>
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded border border-emerald-400/30 bg-emerald-400/10 p-4">
              <h3 className="font-bold text-emerald-200">
                <CheckCircle2 className="mr-1 inline" size={17} />
                Ethyl acetate is the best match.
              </h3>
              <p className="mt-2 text-xs text-slate-300">
                {checked
                  ? `${candidate} checked against the selected ${mode} peaks.`
                  : "All spectral data are consistent with the proposed structure."}
              </p>
              <button
                onClick={() => {
                  setNotebookAdded(true);
                  announce("Assignment added to notebook");
                }}
                className="mt-4 rounded border border-white/20 px-3 py-2 text-xs"
              >
                <FileText size={14} className="mr-1 inline" />
                {notebookAdded ? "Added to notebook" : "Add to notebook"}
              </button>
              <h3 className="mt-5 border-t border-emerald-300/20 pt-4 font-bold">Key Evidence</h3>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                <li>◉ ¹H NMR: 3 signals; 3:2:3 integration <CheckCircle2 className="float-right text-emerald-300" size={14} /></li>
                <li>◉ ¹³C NMR: 4 carbons (C=O ~170 ppm) <CheckCircle2 className="float-right text-emerald-300" size={14} /></li>
                <li>◉ IR: strong C=O at 1740 cm⁻¹ <CheckCircle2 className="float-right text-emerald-300" size={14} /></li>
                <li>◉ MS: M⁺ = 88 (consistent) <CheckCircle2 className="float-right text-emerald-300" size={14} /></li>
                <li>◉ UV–Vis: no significant absorption &gt; 220 nm <CheckCircle2 className="float-right text-emerald-300" size={14} /></li>
              </ul>
            </section>
          </div>
        </main>
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
