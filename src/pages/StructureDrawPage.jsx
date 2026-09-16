import { useCallback, useMemo, useRef, useState } from "react";
import { Check, Copy, Eraser, Home, PenTool, Upload } from "lucide-react";
import { Editor } from "ketcher-react";
import { StandaloneStructServiceProvider } from "ketcher-standalone";
import "ketcher-react/dist/index.css";
import "./structureDraw.css";

const TEMPLATES = [
  { id: "benzene", label: "Benzene", smiles: "c1ccccc1" },
  { id: "water", label: "Water", smiles: "O" },
  { id: "ethanol", label: "Ethanol", smiles: "CCO" },
  { id: "ethyl-acetate", label: "Ethyl acetate", smiles: "CCOC(C)=O" },
  { id: "aspirin", label: "Aspirin", smiles: "CC(=O)Oc1ccccc1C(=O)O" },
  { id: "glucose", label: "D-Glucose", smiles: "OC[C@H]1O[C@H](O)[C@H](O)[C@@H](O)[C@@H]1O" },
  { id: "caffeine", label: "Caffeine", smiles: "Cn1c(=O)c2c(ncn2C)n(C)c1=O" },
  { id: "alanine", label: "L-Alanine", smiles: "C[C@H](N)C(=O)O" },
];

const structServiceProvider = new StandaloneStructServiceProvider();

export default function StructureDrawPage({ onNavigate }) {
  const ketcherRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [smiles, setSmiles] = useState("");
  const [molfile, setMolfile] = useState("");
  const [notice, setNotice] = useState("Draw a structure, or load a template.");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const refreshExports = useCallback(async (ketcher = ketcherRef.current) => {
    if (!ketcher) return;
    try {
      const [nextSmiles, nextMol] = await Promise.all([ketcher.getSmiles(), ketcher.getMolfile()]);
      setSmiles(nextSmiles || "");
      setMolfile(nextMol || "");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not read the structure.");
    }
  }, []);

  const handleInit = useCallback((ketcher) => {
    ketcherRef.current = ketcher;
    window.ketcher = ketcher;
    setReady(true);
    setNotice("Ketcher is ready. Draw bonds, atoms, and reactions.");
    try {
      ketcher.editor?.subscribe?.("change", () => {
        refreshExports(ketcher);
      });
    } catch {
      refreshExports(ketcher);
    }
  }, [refreshExports]);

  const loadStructure = useCallback(async (value, label = "structure") => {
    const ketcher = ketcherRef.current;
    if (!ketcher || !value.trim()) return;
    setError("");
    try {
      await ketcher.setMolecule(value.trim());
      await refreshExports(ketcher);
      setNotice(`Loaded ${label}.`);
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Ketcher could not load that structure.");
    }
  }, [refreshExports]);

  const clearCanvas = useCallback(async () => {
    const ketcher = ketcherRef.current;
    if (!ketcher) return;
    await ketcher.setMolecule("");
    setSmiles("");
    setMolfile("");
    setNotice("Canvas cleared.");
  }, []);

  const copyText = useCallback(async (value, kind) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(""), 1400);
  }, []);

  const status = useMemo(() => {
    if (error) return error;
    if (!ready) return "Loading the Ketcher editor…";
    return notice;
  }, [error, notice, ready]);

  return (
    <div className="draw-app">
      <header className="draw-head">
        <button type="button" onClick={() => onNavigate?.("dashboard")} aria-label="Home">
          <Home size={16} /> Home
        </button>
        <PenTool size={22} />
        <div>
          <h1>Structure Draw</h1>
          <p>Ketcher editor for molecules and reactions</p>
        </div>
        <em>{status}</em>
      </header>
      <div className="draw-body">
        <aside className="draw-rail">
          <h2>Templates</h2>
          <div className="draw-templates">
            {TEMPLATES.map((item) => (
              <button key={item.id} type="button" disabled={!ready} onClick={() => loadStructure(item.smiles, item.label)}>
                {item.label}
              </button>
            ))}
          </div>
          <label>
            Load SMILES or MOL
            <textarea
              rows={5}
              value={smiles}
              onChange={(event) => setSmiles(event.target.value)}
              placeholder="Paste SMILES or a MOL file"
            />
          </label>
          <div className="draw-actions">
            <button type="button" disabled={!ready} onClick={() => loadStructure(smiles, "pasted structure")}>
              <Upload size={14} /> Load
            </button>
            <button type="button" disabled={!ready} onClick={() => refreshExports()}>
              Update
            </button>
            <button type="button" disabled={!ready} onClick={clearCanvas}>
              <Eraser size={14} /> Clear
            </button>
          </div>
          <label>
            SMILES
            <textarea rows={3} readOnly value={smiles} />
          </label>
          <button type="button" disabled={!smiles} onClick={() => copyText(smiles, "smiles")}>
            {copied === "smiles" ? <Check size={14} /> : <Copy size={14} />} Copy SMILES
          </button>
          <label>
            MOL file
            <textarea rows={8} readOnly value={molfile} />
          </label>
          <button type="button" disabled={!molfile} onClick={() => copyText(molfile, "mol")}>
            {copied === "mol" ? <Check size={14} /> : <Copy size={14} />} Copy MOL
          </button>
        </aside>
        <section className="draw-canvas" aria-label="Ketcher structure editor">
          <Editor
            staticResourcesUrl={import.meta.env.BASE_URL}
            structServiceProvider={structServiceProvider}
            disableMacromoleculesEditor
            errorHandler={(message) => setError(String(message))}
            onInit={handleInit}
          />
        </section>
      </div>
    </div>
  );
}
