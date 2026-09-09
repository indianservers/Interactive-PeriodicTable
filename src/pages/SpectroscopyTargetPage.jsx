import { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  FileText,
  Search,
  Sun,
  Waves,
} from "lucide-react";
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
  "¹H NMR": { title: "¹H NMR · 400 MHz", axis: "δ (ppm)", suffix: "ppm" },
  "¹³C NMR": { title: "¹³C NMR · 100 MHz", axis: "δ (ppm)", suffix: "ppm" },
  IR: { title: "IR · ATR", axis: "Wavenumber (cm⁻¹)", suffix: "cm⁻¹" },
  "Mass Spectrum": { title: "Mass Spectrum · EI", axis: "m/z", suffix: "m/z" },
  "UV-Vis": { title: "UV–Vis · Absorbance", axis: "Wavelength (nm)", suffix: "nm" },
};
export default function SpectroscopyTargetPage({ onNavigate }) {
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
  const announce = (x) => setNotice(x);
  const modePeaks = useMemo(
    () =>
      mode === "¹H NMR"
        ? peaks
        : mode === "¹³C NMR"
          ? peaks.map((item, i) => ({
              ...item,
              shift: [60.2, 20.7, 14.3][i],
              mult: "singlet",
              integration: "1C",
            }))
          : mode === "IR"
            ? peaks.map((item, i) => ({
                ...item,
                shift: [1740, 2980, 1050][i],
                mult: "band",
                integration: "—",
              }))
            : mode === "Mass Spectrum"
              ? peaks.map((item, i) => ({
                  ...item,
                  shift: [88, 43, 29][i],
                  mult: "ion",
                  integration: "m/z",
                }))
              : peaks.map((item, i) => ({
                  ...item,
                  shift: [205, 260, 280][i],
                  mult: "band",
                  integration: "λmax",
                })),
    [mode],
  );
  const metadata = modeMeta[mode];
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
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
      <div className="grid h-[calc(100vh-64px)] grid-cols-[185px_1fr] gap-3 p-3">
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
          <div className="mt-2 grid grid-cols-[1.35fr_.75fr_1fr] gap-2">
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{metadata.title}</h3>
                <div className="text-xs text-slate-400">
                  Zoom:{" "}
                  <button
                    onClick={() => setZoom("1H")}
                    className={`rounded border px-2 py-1 ${zoom === "1H" ? "border-cyan-300 text-cyan-200" : "border-white/15"}`}
                  >
                    1H
                  </button>{" "}
                  <button
                    onClick={() => {
                      setPeakPicking((value) => !value);
                      announce(
                        peakPicking ? "Peak picker off" : "Peak picker on",
                      );
                    }}
                    className={`ml-2 rounded border px-2 py-1 ${peakPicking ? "border-cyan-300 text-cyan-200" : "border-white/15"}`}
                  >
                    Peak pick
                  </button>
                </div>
              </div>
              <div className="relative mt-3 h-64 border-b border-l border-slate-500">
                <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(90deg,transparent_10%,rgba(34,211,238,.25)_10.2%,transparent_10.4%,transparent_45%,rgba(167,139,250,.3)_45.2%,transparent_45.4%,transparent_72%,rgba(251,191,36,.25)_72.2%,transparent_72.4%)]" />
                <svg
                  viewBox="0 0 800 250"
                  className="absolute inset-0 h-full w-full"
                >
                  <path
                    d="M0 230 L165 230 L170 210 L175 230 L180 180 L185 230 L190 205 L195 230 L405 230 L410 90 L415 230 L565 230 L570 205 L575 160 L580 205 L585 230 L590 175 L595 230 L800 230"
                    fill="none"
                    stroke="#43d7ff"
                    strokeWidth="3"
                  />
                </svg>
                {modePeaks.map((x, i) => (
                  <button
                    key={x.shift}
                    onClick={() => setPeak(x)}
                    className="absolute bottom-[74%] rounded border px-2 py-1 text-xs"
                    style={{
                      left: `${[18, 50, 73][i]}%`,
                      borderColor: x.color,
                      color: x.color,
                    }}
                  >
                    {x.shift}
                  </button>
                ))}
                {peakPicking && (
                  <span className="absolute right-2 top-2 rounded bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-200">
                    Click a peak to inspect assignment
                  </span>
                )}
                <span className="absolute bottom-1 left-1/2 text-xs text-slate-400">
                  {metadata.axis}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {modePeaks.map((x) => (
                  <button
                    key={x.shift}
                    onClick={() => setPeak(x)}
                    className={`rounded border p-2 text-left text-xs ${peak.shift === x.shift ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
                  >
                    <b style={{ color: x.color }}>{x.shift} {metadata.suffix}</b>
                    <br />
                    {x.mult} · {x.integration}
                  </button>
                ))}
              </div>
            </section>
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold">3D Structure (Ethyl acetate)</h3>
              <div className="mt-3 grid h-60 place-items-center rounded border border-white/10 bg-gradient-to-br from-[#1a3450] to-[#0a1725]">
                <div
                  className={`relative h-28 w-44 transition-transform ${representation === "Spacefill" ? "scale-125" : ""}`}
                  aria-label={`${representation} representation`}
                >
                  <span className="absolute left-12 top-8 h-16 w-16 rounded-full bg-slate-500 shadow-[0_0_20px_#38bdf8]" />
                  <span className="absolute right-8 top-10 h-12 w-12 rounded-full bg-red-400" />
                  <span className="absolute left-2 top-16 h-10 w-10 rounded-full bg-red-300" />
                  <span className="absolute right-0 top-4 h-8 w-8 rounded-full bg-blue-300" />
                </div>
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
          <div className="mt-2 grid grid-cols-[1fr_360px] gap-2">
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold">Structure Elimination & Reasoning</h3>
              <div className="mt-3 grid grid-cols-5 gap-2">
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
