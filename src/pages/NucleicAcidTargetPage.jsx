import { useEffect, useMemo, useState } from "react";
import { Dna, Play, RotateCcw, Settings2 } from "lucide-react";

const nav = [
  "Home",
  "Molecules",
  "Nucleotide Builder",
  "Sequences",
  "Replication",
  "Transcription",
  "Comparative View",
  "3D Gallery",
  "Learn",
  "Quizzes",
];
const DNA = "ATGCCCTAACGTTAGCCTGAACTGATCCGTA";

function Helix({ playing, compact = false }) {
  const rows = Array.from({ length: compact ? 8 : 15 }, (_, index) => index);
  return (
    <svg
      viewBox="0 0 420 570"
      className={`h-full w-full ${playing ? "animate-pulse" : ""}`}
      aria-label="Interactive molecular double helix"
    >
      <defs>
        <linearGradient id="strandA" x1="0" x2="1">
          <stop stopColor="#527aff" />
          <stop offset="1" stopColor="#b46cff" />
        </linearGradient>
        <linearGradient id="strandB" x1="0" x2="1">
          <stop stopColor="#58a7ff" />
          <stop offset="1" stopColor="#42e698" />
        </linearGradient>
      </defs>
      <path
        d="M120 20 C300 80 300 160 120 220 S-60 360 120 420 S300 500 120 560"
        fill="none"
        stroke="url(#strandA)"
        strokeWidth="18"
        strokeLinecap="round"
        opacity=".9"
      />
      <path
        d="M300 20 C120 80 120 160 300 220 S480 360 300 420 S120 500 300 560"
        fill="none"
        stroke="url(#strandB)"
        strokeWidth="18"
        strokeLinecap="round"
        opacity=".9"
      />
      {rows.map((i) => {
        const y = 32 + i * (compact ? 50 : 36);
        const left = 150 + Math.sin(i * 0.8) * 48;
        const right = 270 - Math.sin(i * 0.8) * 48;
        const colors = ["#42e698", "#ffc83d", "#ff6d6d", "#8d72ff"];
        return (
          <g key={i}>
            <line
              x1={left}
              y1={y}
              x2={right}
              y2={y}
              stroke={colors[i % 4]}
              strokeWidth="11"
              strokeLinecap="round"
            />
            <circle cx={left} cy={y} r="8" fill="#d6e8ff" />
            <circle cx={right} cy={y} r="8" fill="#d6e8ff" />
          </g>
        );
      })}
      <text x="18" y="35" fill="#e9f4ff" fontSize="18">
        5′
      </text>
      <text x="370" y="35" fill="#e9f4ff" fontSize="18">
        3′
      </text>
      <text x="18" y="550" fill="#e9f4ff" fontSize="18">
        3′
      </text>
      <text x="370" y="550" fill="#e9f4ff" fontSize="18">
        5′
      </text>
    </svg>
  );
}
function BasePair({ type }) {
  const rna = type === "A=U";
  return (
    <svg
      viewBox="0 0 300 150"
      className="h-[125px] w-full"
      aria-label={`${type} base pair`}
    >
      <path
        d="M70 75 L118 38 L160 64 L142 112 L90 116 Z M230 75 L182 38 L140 64 L158 112 L210 116 Z"
        fill="none"
        stroke={rna ? "#4de49d" : "#4d91ff"}
        strokeWidth="7"
      />
      <path
        d="M142 58 L158 58 M140 75 L160 75 M142 92 L158 92"
        stroke="#f1f7ff"
        strokeDasharray="4 5"
        strokeWidth="3"
      />
      <text
        x="50"
        y="80"
        fill={rna ? "#57ef9f" : "#4b8eff"}
        fontSize="25"
        fontWeight="700"
      >
        {type[0]}
      </text>
      <text x="240" y="80" fill="#ffc63c" fontSize="25" fontWeight="700">
        {type.at(-1)}
      </text>
      <text x="150" y="143" fill="#9db8d3" fontSize="12" textAnchor="middle">
        {rna
          ? "2 hydrogen bonds · 2.8 Å"
          : type.startsWith("G")
            ? "3 hydrogen bonds · 2.9 Å"
            : "2 hydrogen bonds · 2.8 Å"}
      </text>
    </svg>
  );
}
function Nucleotide({ acid, base }) {
  return (
    <svg
      viewBox="0 0 330 190"
      className="h-[155px] w-full"
      aria-label="Nucleotide model"
    >
      <circle
        cx="78"
        cy="95"
        r="34"
        fill="#efb532"
        stroke="#ffe7a0"
        strokeWidth="4"
      />
      <circle
        cx="174"
        cy="95"
        r="39"
        fill="#4e83ff"
        stroke="#c6d7ff"
        strokeWidth="4"
      />
      <path d="M110 95 H135" stroke="#d8eeff" strokeWidth="8" />
      <path
        d="M208 95 L270 63 L298 95 L270 127 Z"
        fill="#43cd92"
        stroke="#b0ffdc"
        strokeWidth="4"
      />
      <text x="78" y="100" textAnchor="middle" fontSize="11" fill="#152236">
        PO₄
      </text>
      <text x="174" y="100" textAnchor="middle" fontSize="11" fill="#132147">
        {acid === "RNA" ? "Ribose" : "dRibose"}
      </text>
      <text
        x="270"
        y="100"
        textAnchor="middle"
        fontSize="14"
        fill="#06241b"
        fontWeight="700"
      >
        {base.match(/\(([A-Z])\)/)?.[1] || "A"}
      </text>
    </svg>
  );
}

export default function NucleicAcidTargetPage() {
  const [acid, setAcid] = useState("DNA");
  const [pair, setPair] = useState("G≡C");
  const [playing, setPlaying] = useState(false);
  const [seq, setSeq] = useState(DNA);
  const [builderPart, setBuilderPart] = useState("Base");
  const [selectedBase, setSelectedBase] = useState("Adenine (A)");
  const [forkProgress, setForkProgress] = useState(35);
  const [notice, setNotice] = useState("");
  const announce = (value) => setNotice(value);
  const bases =
    acid === "RNA"
      ? ["Adenine (A)", "Guanine (G)", "Cytosine (C)", "Uracil (U)"]
      : ["Adenine (A)", "Guanine (G)", "Cytosine (C)", "Thymine (T)"];
  const pairOptions =
    acid === "RNA"
      ? [
          ["G≡C", "Three hydrogen bonds"],
          ["A=U", "Two hydrogen bonds"],
        ]
      : [
          ["G≡C", "Three hydrogen bonds"],
          ["A=T", "Two hydrogen bonds"],
        ];
  const gc = seq.length
    ? Math.round(((seq.match(/[GC]/gi) || []).length / seq.length) * 100)
    : 0;
  const at = seq.length
    ? Math.round(((seq.match(/[ATU]/gi) || []).length / seq.length) * 100)
    : 0;
  const tm =
    2 * (seq.match(/[ATU]/gi) || []).length +
    4 * (seq.match(/[GC]/gi) || []).length;
  const comp = useMemo(
    () => ({
      A: (seq.match(/A/g) || []).length,
      T: (seq.match(acid === "RNA" ? /U/g : /T/g) || []).length,
      G: (seq.match(/G/g) || []).length,
      C: (seq.match(/C/g) || []).length,
    }),
    [acid, seq],
  );
  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(
      () => setForkProgress((value) => (value >= 100 ? 0 : value + 1)),
      100,
    );
    return () => window.clearInterval(timer);
  }, [playing]);
  const switchAcid = (next) => {
    setAcid(next);
    setPair(next === "RNA" ? "A=U" : "A=T");
    setSelectedBase("Adenine (A)");
    setSeq((value) =>
      next === "RNA" ? value.replace(/T/g, "U") : value.replace(/U/g, "T"),
    );
    announce(`${next} selected`);
  };
  const reset = () => {
    setPlaying(false);
    setForkProgress(35);
    setSeq(acid === "DNA" ? DNA : DNA.replace(/T/g, "U"));
    announce("View reset");
  };
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#071522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[65px] items-center gap-4 border-b border-white/10 bg-[#091b2b] px-6">
        <Dna size={38} className="text-blue-300" />
        <div>
          <h1 className="text-2xl font-black">Nucleic Acid Explorer</h1>
          <p className="text-xs text-slate-400">
            Explore · Build · Visualize · Understand
          </p>
        </div>
        <input
          className="ml-auto w-[420px] rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs"
          placeholder="Search genes, sequences, or topics..."
        />
        <div className="flex rounded-full border border-white/20 text-xs">
          <button
            onClick={() => switchAcid("DNA")}
            className={`rounded-full px-5 py-2 ${acid === "DNA" ? "bg-blue-500" : ""}`}
          >
            DNA
          </button>
          <button
            onClick={() => switchAcid("RNA")}
            className={`rounded-full px-5 py-2 ${acid === "RNA" ? "bg-blue-500" : ""}`}
          >
            RNA
          </button>
        </div>
        <Settings2 size={18} />
      </header>
      <div
        className="grid h-[calc(100vh-65px)] gap-2 p-2"
        style={{
          gridTemplateColumns: "190px minmax(0, 1fr) 355px",
          gridTemplateRows: "minmax(0, 1fr) 250px",
        }}
      >
        <aside className="row-span-2 overflow-y-auto border-r border-white/10 bg-[#081c2d] p-3">
          {nav.map((item, i) => (
            <button
              key={item}
              onClick={() => announce(`${item} selected`)}
              className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left text-xs ${i === 0 ? "bg-blue-500/25 text-blue-200" : "text-slate-300 hover:bg-white/10"}`}
            >
              <span className="w-4 text-center text-blue-300">
                {i === 0 ? "⌂" : i === 2 ? "♧" : i === 4 ? "▶" : "◌"}
              </span>
              {item}
            </button>
          ))}
        </aside>
        <main className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#102d48] to-[#081522] p-3">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-serif font-bold">
                {acid} · Double helix
              </h2>
              <p className="text-lg text-blue-200">Antiparallel strands</p>
              <p className="mt-2 max-w-[395px] text-xs text-slate-300">
                A right-handed {acid} helix of two antiparallel polynucleotide
                strands held together by complementary base pairs and stacking
                interactions.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setPlaying(true);
                    announce("3D exploration started");
                  }}
                  className="rounded bg-blue-500 px-4 py-2 text-xs"
                >
                  ◉ Explore in 3D
                </button>
                <button
                  onClick={reset}
                  className="rounded border border-white/20 px-4 py-2 text-xs"
                >
                  <RotateCcw size={13} className="mr-1 inline" />
                  Reset view
                </button>
              </div>
            </div>
            <div className="h-[485px] w-[360px] -translate-y-4">
              <Helix playing={playing} />
            </div>
          </div>
          <div className="absolute bottom-3 left-3 w-[390px] rounded border border-white/10 bg-slate-950/85 p-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">Nucleotide Builder</h3>
              <span className="text-[10px] text-slate-400">
                {acid} · {selectedBase}
              </span>
            </div>
            <div className="mt-2 flex gap-1">
              {[
                "Phosphate",
                acid === "RNA" ? "Ribose" : "Deoxyribose",
                "Base",
              ].map((part, i) => (
                <button
                  key={part}
                  onClick={() => {
                    setBuilderPart(part);
                    announce(`${part} selected`);
                  }}
                  className={`flex-1 rounded p-2 text-xs ${builderPart === part ? "bg-cyan-400/35 ring-1 ring-cyan-300" : i === 0 ? "bg-amber-400/20" : i === 1 ? "bg-blue-400/20" : "bg-emerald-400/20"}`}
                >
                  {part}
                </button>
              ))}
            </div>
            <Nucleotide acid={acid} base={selectedBase} />
            <select
              value={selectedBase}
              onChange={(event) => {
                setSelectedBase(event.target.value);
                announce(`${event.target.value} added to nucleotide`);
              }}
              className="w-full rounded bg-slate-900 p-2 text-xs"
            >
              {bases.map((base) => (
                <option key={base}>{base}</option>
              ))}
            </select>
          </div>
        </main>
        <aside className="row-span-2 overflow-y-auto rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <h2 className="font-bold">Base pair close-up</h2>
          {pairOptions.map(([value, desc]) => (
            <button
              key={value}
              onClick={() => setPair(value)}
              className={`mt-3 w-full rounded border p-3 text-left ${pair === value ? "border-cyan-300 bg-cyan-300/10" : "border-white/10"}`}
            >
              <b className="text-lg">{value} base pair</b>
              <p className="text-xs text-slate-400">{desc}</p>
              <BasePair type={value} />
            </button>
          ))}
          <h2 className="mt-4 font-bold">
            Sequence Viewer{" "}
            <span className="float-right text-xs text-blue-200">FASTA⌄</span>
          </h2>
          <textarea
            aria-label="DNA or RNA sequence"
            value={seq}
            onChange={(event) =>
              setSeq(
                event.target.value
                  .toUpperCase()
                  .replace(acid === "RNA" ? /[^AUGC]/g : /[^ATGC]/g, ""),
              )
            }
            className="mt-2 h-20 w-full rounded border border-white/20 bg-slate-950 p-2 font-mono text-xs"
          />
          <p className="mt-2 text-xs">
            Length: {seq.length} bp　|　GC content: {gc}%　|　Tₘ: {tm} °C
          </p>
          <h2 className="mt-4 font-bold">Base Composition</h2>
          <div className="mt-2 flex items-center gap-4 rounded border border-white/10 p-3">
            <div
              className="grid h-24 w-24 place-items-center rounded-full"
              style={{
                background: `conic-gradient(#45d99a 0 ${(comp.A / Math.max(seq.length, 1)) * 360}deg,#ec5b61 0 ${((comp.A + comp.T) / Math.max(seq.length, 1)) * 360}deg,#4c8bff 0 ${((comp.A + comp.T + comp.G) / Math.max(seq.length, 1)) * 360}deg,#ffc23d 0 360deg)`,
              }}
            >
              <span className="grid h-14 w-14 place-items-center rounded-full bg-[#0a1e31] text-sm">
                {seq.length}
                <small>bp</small>
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <p className="text-emerald-300">
                ■ Adenine {Math.round((comp.A / Math.max(seq.length, 1)) * 100)}
                %
              </p>
              <p className="text-red-300">
                ■ {acid === "RNA" ? "Uracil" : "Thymine"}{" "}
                {Math.round((comp.T / Math.max(seq.length, 1)) * 100)}%
              </p>
              <p className="text-blue-300">
                ■ Guanine {Math.round((comp.G / Math.max(seq.length, 1)) * 100)}
                %
              </p>
              <p className="text-amber-300">
                ■ Cytosine{" "}
                {Math.round((comp.C / Math.max(seq.length, 1)) * 100)}%
              </p>
            </div>
          </div>
          <h2 className="mt-4 font-bold">Strand Properties</h2>
          <div className="mt-2 rounded border border-white/10 p-3 text-xs leading-6">
            Antiparallel:　5′ → 3′ / 3′ → 5′
            <br />
            GC content:　{gc}%<br />
            Melting temperature (Tₘ):　{tm} °C
            <br />
            Molecular weight:　
            {(seq.length * (acid === "RNA" ? 340 : 330)).toLocaleString()} g/mol
          </div>
        </aside>
        <section className="overflow-hidden rounded-lg border border-white/10 bg-[#0a1e31] p-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">Open replication fork</h3>
            <button
              onClick={() => setPlaying((value) => !value)}
              className="rounded bg-blue-500 px-4 py-2 text-xs"
            >
              <Play size={14} className="mr-1 inline" />
              {playing ? "Pause" : "Play"}
            </button>
          </div>
          <div
            className="mt-1 flex items-center gap-3 overflow-hidden"
            style={{ height: 125 }}
          >
            <div style={{ height: 125, width: 180, flex: "0 0 180px" }}>
              <Helix playing={playing} compact />
            </div>
            <div className="relative h-20 flex-1">
              <div className="absolute left-1/4 right-0 top-8 h-2 rounded bg-blue-400" />
              <div className="absolute left-1/4 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-emerald-500/70 shadow-[0_0_20px_#42e698]" />
              <span className="absolute left-1/4 top-0 text-[10px] text-emerald-200">
                Helicase
              </span>
              <span className="absolute right-0 top-0 text-[10px] text-blue-200">
                {acid} polymerase
              </span>
            </div>
          </div>
          <input
            aria-label="Replication progress"
            type="range"
            min="0"
            max="100"
            value={forkProgress}
            onChange={(event) => setForkProgress(+event.target.value)}
            className="w-full accent-cyan-300"
          />
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>5′　3′</span>
            <span>Leading strand · {forkProgress}%</span>
            <span>Lagging strand · Okazaki fragments</span>
            <span>3′　5′</span>
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
