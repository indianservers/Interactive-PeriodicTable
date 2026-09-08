import { useState } from "react";
import {
  Activity,
  Beaker,
  CheckCircle2,
  Play,
  FlaskConical,
  FileText,
} from "lucide-react";

const nav = [
  "Dashboard",
  "Samples",
  "HPLC",
  "UV-Vis",
  "Dissolution",
  "Karl Fischer",
  "Content Uniformity",
  "Reports",
  "Audit Trail",
  "Settings",
];
const rows = [
  ["Resolution (API/Imp B)", "2.4", "≥ 2.0"],
  ["Tailing factor (API)", "1.08", "≤ 2.0"],
  ["Theoretical plates (API)", "8400", "≥ 2000"],
  ["Assay (Paracetamol)", "99.3%", "98.0–102.0%"],
  ["Total impurities", "0.18%", "≤ 0.5%"],
];
const methodContext = {
  HPLC: {
    title: "HPLC assay",
    detail:
      "Paracetamol Tablets 500 mg | Method: QCL-HPLC-001 | Column: C18 (250 × 4.6 mm, 5 µm)",
    detector: "Detector: 254 nm | Flow: 1.000 mL/min | Column: 30.0 °C",
  },
  "UV-Vis": {
    title: "UV-Vis assay",
    detail: "Paracetamol Tablets 500 mg | Method: QCL-UV-002 | λmax: 243 nm",
    detector: "Detector: 243 nm | Cuvette: 1 cm | Blank corrected",
  },
  Dissolution: {
    title: "Dissolution profile",
    detail: "Paracetamol Tablets 500 mg | Apparatus II | 900 mL medium",
    detector: "Sampling: 5–60 min | Paddle: 50 rpm | 37 °C",
  },
  "Karl Fischer": {
    title: "Karl Fischer water",
    detail: "Paracetamol Tablets 500 mg | Volumetric moisture determination",
    detector: "Endpoint: electrochemical | Drift corrected",
  },
  "Content Uniformity": {
    title: "Content uniformity",
    detail: "Paracetamol Tablets 500 mg | Ten-unit dosage analysis",
    detector: "Acceptance value | Individual assay results",
  },
};

export default function QCTargetPage() {
  const [section, setSection] = useState("HPLC");
  const [step, setStep] = useState(4);
  const [running, setRunning] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const announce = (message) => setNotice(message);
  const activeMethod = methodContext[section] || methodContext.HPLC;
  return (
    <div
      className="min-h-screen overflow-hidden bg-[#061522] text-slate-100"
      style={{ fontFamily: "Inter,ui-sans-serif,system-ui" }}
    >
      <header className="flex h-[64px] items-center gap-4 border-b border-white/10 bg-[#091c2e] px-6">
        <FlaskConical className="text-blue-300" size={31} />
        <div>
          <h1 className="text-xl font-black">
            Pharmaceutical Quality Control Lab
          </h1>
          <p className="text-[10px] tracking-[.16em] text-blue-300">
            QUALITY SCIENCE. SAFER MEDICINES.
          </p>
        </div>
        <div className="ml-auto flex items-center gap-5 text-xs">
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-emerald-300">
            ● QC Analyst · Online
          </span>
          <span className="text-slate-400">Mar 24, 2024　14:27</span>
        </div>
      </header>
      <div className="grid h-[calc(100vh-64px)] grid-cols-[228px_1fr]">
        <aside className="border-r border-white/10 bg-[#081b2c] p-3">
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => {
                setSection(item);
                announce(`${item} workspace selected`);
              }}
              className={`mb-1 flex w-full items-center gap-3 rounded px-4 py-3 text-left text-sm ${section === item ? "border-l-2 border-cyan-300 bg-blue-500/20 text-cyan-200" : "text-slate-300 hover:bg-white/5"}`}
            >
              <Activity size={16} />
              {item}
            </button>
          ))}
          <div className="mt-10 px-4 text-[10px] uppercase tracking-[.25em] text-slate-500">
            Better analytics
            <br />
            Healthier tomorrow
          </div>
        </aside>
        <main className="min-w-0 overflow-auto p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-black">
                {activeMethod.title} · Batch B24-071
              </h2>
              <p className="text-sm text-slate-400">{activeMethod.detail}</p>
            </div>
            <div className="rounded border border-emerald-400 px-6 py-3 text-center text-xl font-black text-emerald-300">
              ✓ Assay 99.3% · Pass
            </div>
          </div>
          <div className="mt-3 grid h-[270px] place-items-center rounded border border-white/10 bg-gradient-to-br from-[#233a50] via-[#14283a] to-[#091a2b]">
            <div className="relative flex items-end gap-3 opacity-90">
              <div className="h-24 w-44 rounded-t border-4 border-slate-400 bg-slate-300/40" />
              <div className="h-40 w-52 rounded border-4 border-slate-300 bg-slate-300/30" />
              <div className="h-32 w-28 rounded border-4 border-slate-300 bg-slate-300/20" />
              <div className="h-36 w-5 rounded bg-blue-500/70" />
              <div className="h-20 w-5 rounded bg-blue-500/70" />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-[230px_1fr_390px] gap-2">
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold text-cyan-200">Sample Workflow</h3>
              {["Weigh", "Dissolve", "Filter", "Inject"].map((x, i) => (
                <button
                  key={x}
                  onClick={() => {
                    setStep(i + 1);
                    announce(`${x} step selected`);
                  }}
                  className={`mt-3 flex w-full items-center gap-3 text-left text-sm ${step === i + 1 ? "text-cyan-200" : "text-slate-300"}`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full ${step === i + 1 ? "bg-blue-500" : "bg-emerald-500/70"}`}
                  >
                    {i + 1}
                  </span>
                  <span>
                    {x}
                    <small className="block text-[10px] text-slate-500">
                      {i === 0
                        ? "500.2 mg (target 500 mg)"
                        : i === 1
                          ? "In mobile phase (100 mL)"
                          : i === 2
                            ? "0.45 µm PTFE"
                            : "Ready for injection"}
                    </small>
                  </span>
                </button>
              ))}
              <button
                onClick={() => {
                  setRunning((v) => !v);
                  announce(running ? "Injection paused" : "Sample injected");
                }}
                className="mt-5 w-full rounded bg-blue-500 px-3 py-3 font-bold"
              >
                <Play size={15} className="mr-1 inline" />
                {running ? "Pause injection" : "Inject sample"}
              </button>
            </section>
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-cyan-200">Chromatogram</h3>
                <span className="text-[10px] text-slate-400">
                  {activeMethod.detector}
                </span>
              </div>
              <div className="relative mt-3 h-52 border-b border-l border-slate-500 bg-[linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] bg-[size:44px_44px]">
                <div className="absolute bottom-0 left-[17%] h-10 w-2 rotate-[8deg] bg-red-400" />
                <div className="absolute bottom-0 left-[48%] h-44 w-3 rotate-[4deg] rounded-t bg-cyan-300 shadow-[0_0_18px_#67e8f9]" />
                <div className="absolute bottom-0 left-[73%] h-7 w-2 rotate-[12deg] bg-red-400" />
                <span className="absolute left-[44%] top-2 text-xs text-cyan-200">
                  Paracetamol (API)
                  <br />
                  RT 6.842 min
                </span>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Time (min)
              </p>
            </section>
            <section className="rounded border border-white/10 bg-[#0b2135] p-4">
              <h3 className="font-bold text-cyan-200">
                System Suitability & Results
              </h3>
              <div className="mt-3 overflow-hidden rounded border border-white/10">
                {rows.map(([a, b, c]) => (
                  <div
                    key={a}
                    className="grid grid-cols-[1fr_80px_100px] border-b border-white/10 px-2 py-2 text-xs"
                  >
                    <span>{a}</span>
                    <b className="text-cyan-200">{b}</b>
                    <span>
                      {c}{" "}
                      <CheckCircle2
                        size={13}
                        className="inline text-emerald-300"
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded border border-emerald-400/40 bg-emerald-400/10 p-3 font-bold text-emerald-300">
                ✓ Assay 99.3% · Pass
              </div>
              <button
                onClick={() => {
                  setReviewOpen((value) => !value);
                  announce(reviewOpen ? "Integration review closed" : "Integration review opened");
                }}
                className="mt-3 w-full rounded bg-blue-500 px-3 py-3 font-bold"
              >
                <FileText size={15} className="mr-1 inline" />
                {reviewOpen ? "Close integration review" : "Review integration"}
              </button>
              {reviewOpen && (
                <div className="mt-3 rounded border border-cyan-300/30 bg-cyan-300/10 p-3 text-xs text-slate-200">
                  <b className="text-cyan-200">{activeMethod.title} review</b>
                  <p className="mt-2 text-slate-300">
                    {section === "HPLC"
                      ? "API peak is resolved from impurity B; tailing and plate count meet system-suitability limits."
                      : section === "UV-Vis"
                        ? "Blank-corrected absorbance at λmax is within the assay acceptance range."
                        : "The selected release-test method is configured and ready for analyst sign-off."}
                  </p>
                  <span className="mt-2 block text-emerald-300">✓ Ready for approval</span>
                </div>
              )}
            </section>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[
              "HPLC",
              "UV-Vis",
              "Dissolution",
              "Karl Fischer",
              "Content Uniformity",
            ].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setSection(x);
                  announce(`${x} method selected`);
                }}
                className={`rounded border p-3 text-left ${section === x ? "border-blue-300 bg-blue-500/15" : "border-white/10 bg-[#0b2135]"}`}
              >
                <Beaker size={17} className="text-cyan-300" />
                <b className="mt-2 block text-sm">{x}</b>
                <small className="text-slate-500">Release testing</small>
              </button>
            ))}
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
