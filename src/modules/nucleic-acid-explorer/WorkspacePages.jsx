import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowLeftRight,
  Check,
  ChevronLeft,
  ChevronRight,
  CirclePause,
  Copy,
  Download,
  ExternalLink,
  FileUp,
  Filter,
  Focus,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Search,
  SkipBack,
  SkipForward,
  StepBack,
  StepForward,
  Upload,
} from "lucide-react";
import MolecularViewer from "./MolecularViewer.jsx";

export const STRUCTURES = [
  {
    id: "1BNA",
    name: "B-DNA dodecamer",
    type: "DNA",
    organism: "Synthetic construct",
    method: "X-ray diffraction",
    resolution: "1.90 Å",
    chains: 2,
    count: "24 nt",
    category: "DNA",
    cached: true,
  },
  {
    id: "4OCB",
    name: "Z-DNA dodecamer d(CGCGCGCGCGCG)₂",
    type: "DNA",
    organism: "Synthetic construct",
    method: "X-ray diffraction",
    resolution: "0.75 Å",
    chains: 1,
    count: "12 nt",
    category: "DNA",
    cached: true,
  },
  {
    id: "1ANA",
    name: "A-DNA tetramer d(CCGG)",
    type: "DNA",
    organism: "Synthetic construct",
    method: "X-ray diffraction",
    resolution: "2.00 Å",
    chains: 2,
    count: "8 nt",
    category: "DNA",
    cached: true,
  },
  {
    id: "2KOC",
    name: "14-mer hairpin RNA with cUUCGg tetraloop",
    type: "RNA",
    organism: "Synthetic construct",
    method: "Solution NMR",
    resolution: "N/A",
    chains: 1,
    count: "14 nt",
    category: "RNA",
    cached: true,
  },
  {
    id: "1EHZ",
    name: "Yeast phenylalanine tRNA",
    type: "tRNA",
    organism: "Saccharomyces cerevisiae",
    method: "X-ray diffraction",
    resolution: "1.93 Å",
    chains: 1,
    count: "76 nt",
    category: "RNA",
    cached: true,
  },
  {
    id: "1KX5",
    name: "Nucleosome core particle NCP147",
    type: "DNA–protein",
    organism: "Xenopus laevis",
    method: "X-ray diffraction",
    resolution: "1.94 Å",
    chains: 10,
    count: "1,274 polymer residues",
    category: "Nucleosome",
  },
  {
    id: "2HNH",
    name: "DNA polymerase III catalytic α subunit",
    type: "Protein",
    organism: "Escherichia coli",
    method: "X-ray diffraction",
    resolution: "2.30 Å",
    chains: 1,
    count: "910 polymer residues",
    category: "Polymerase",
    cached: true,
  },
  {
    id: "1LMB",
    name: "Lambda repressor–operator DNA complex",
    type: "DNA–protein",
    organism: "Lambdavirus lambda",
    method: "X-ray diffraction",
    resolution: "1.80 Å",
    chains: 4,
    count: "219 polymer residues",
    category: "DNA-binding protein",
    cached: true,
  },
  {
    id: "6ALH",
    name: "RNA polymerase elongation complex",
    type: "DNA–RNA–protein",
    organism: "Escherichia coli",
    method: "Electron microscopy",
    resolution: "4.40 Å",
    chains: 8,
    count: "3,385 polymer residues",
    category: "Polymerase",
    cached: true,
  },
  {
    id: "4OO8",
    name: "SpCas9–guide RNA–target DNA complex",
    type: "RNP complex",
    organism: "Streptococcus pyogenes",
    method: "X-ray diffraction",
    resolution: "2.50 Å",
    chains: 6,
    count: "2,986 polymer residues",
    category: "CRISPR",
  },
  {
    id: "2OEU",
    name: "Full-length hammerhead ribozyme with Mn(II)",
    type: "Ribozyme",
    organism: "Schistosoma mansoni",
    method: "X-ray diffraction",
    resolution: "2.00 Å",
    chains: 2,
    count: "63 nt",
    category: "Ribozyme",
  },
  {
    id: "7K00",
    name: "Bacterial ribosome at 2 Å",
    type: "Ribosome",
    organism: "Escherichia coli",
    method: "Electron microscopy",
    resolution: "1.98 Å",
    chains: 56,
    count: "10,661 polymer residues",
    category: "Ribosome",
  },
];

const localSource = (s) =>
  s.cached ? undefined : `https://files.rcsb.org/download/${s.id}.cif`;
const Panel = ({ children, className = "" }) => (
  <section className={`nae-panel ${className}`}>{children}</section>
);
const Header = ({ eyebrow, title, description, actions }) => (
  <div className="nae-page-head">
    <div>
      {eyebrow && <p className="nae-eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="nae-head-actions">{actions}</div>}
  </div>
);
const Button = ({ children, primary = false, className = "", ...props }) => (
  <button
    className={`nae-button ${primary ? "primary" : ""} ${className}`}
    {...props}
  >
    {children}
  </button>
);
const downloadText = (filename, text, type = "text/plain") => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
};
const downloadAsset = async (filename, url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to export ${filename}`);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(await response.blob());
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 500);
};
const openWorkspace = (route, params) => {
  const query = params ? `?${new URLSearchParams(params)}` : "";
  window.history.pushState({}, "", `/nucleic-acid-explorer/${route}${query}`);
  window.dispatchEvent(new PopStateEvent("popstate"));
};

function StructureInspector({ structure }) {
  const [tab, setTab] = useState("Structure");
  return (
    <Panel className="nae-structure-inspector">
      <div className="nae-tabs">
        {["Structure", "Sequences", "Annotations"].map((item) => (
          <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>
        ))}
      </div>
      <div className="nae-inspector-body">
        {tab === "Structure" && <>
        <p className="nae-eyebrow">RCSB PDB ENTRY</p>
        <h2>{structure.id}</h2>
        <h3>{structure.name}</h3>
        <div className="nae-tags">
          <span>{structure.type}</span>
          <span>{structure.method}</span>
          <span>{structure.resolution}</span>
        </div>
        <dl>
          <dt>Organism</dt>
          <dd>{structure.organism}</dd>
          <dt>Chains</dt>
          <dd>{structure.chains}</dd>
          <dt>Residues / nucleotides</dt>
          <dd>{structure.count}</dd>
          <dt>Coordinate source</dt>
          <dd>{structure.cached ? "Cached mmCIF" : "RCSB mmCIF"}</dd>
        </dl>
        <a
          className="nae-external"
          href={`https://www.rcsb.org/structure/${structure.id}`}
          target="_blank"
          rel="noreferrer"
        >
          View verified entry at RCSB PDB <ExternalLink size={14} />
        </a>
        </>}
        {tab === "Sequences" && <>
          <p className="nae-eyebrow">POLYMER CONTENT</p>
          <h2>{structure.count}</h2>
          <p>Use the Mol* sequence controls to inspect chains and select mapped residues in the experimental model.</p>
          <dl><dt>Polymer type</dt><dd>{structure.type}</dd><dt>Chain count</dt><dd>{structure.chains}</dd><dt>Sequence source</dt><dd>RCSB PDB coordinate entry</dd></dl>
        </>}
        {tab === "Annotations" && <>
          <p className="nae-eyebrow">STRUCTURE ANNOTATIONS</p>
          <h2>{structure.category}</h2>
          <dl><dt>Organism</dt><dd>{structure.organism}</dd><dt>Method</dt><dd>{structure.method}</dd><dt>Resolution</dt><dd>{structure.resolution}</dd><dt>Local availability</dt><dd>{structure.cached ? "Cached sample" : "Network required"}</dd></dl>
        </>}
      </div>
    </Panel>
  );
}

export function MoleculesPage() {
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get("q") || "");
  const [type, setType] = useState("All");
  const [selected, setSelected] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get("pdb")?.toUpperCase();
    return STRUCTURES.find((structure) => structure.id === requested) || STRUCTURES[0];
  });
  const [upload, setUpload] = useState(null);
  const [error, setError] = useState("");
  const results = STRUCTURES.filter(
    (s) =>
      (type === "All" || s.category === type || s.type.includes(type)) &&
      `${s.id} ${s.name} ${s.organism}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const onUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdb", "cif", "mmcif"].includes(ext)) {
      setError("Unsupported file. Choose a PDB or mmCIF coordinate file.");
      return;
    }
    setError("");
    setUpload({
      url: URL.createObjectURL(file),
      name: file.name,
      format: ext === "pdb" ? "pdb" : "mmcif",
    });
  };
  useEffect(
    () => () => {
      if (upload?.url) URL.revokeObjectURL(upload.url);
    },
    [upload],
  );
  return (
    <div className="nae-page molecules-page">
      <Header
        title="Molecules"
        description="Search experimentally determined nucleic-acid structures and molecular complexes."
        actions={
          <label className="nae-button">
            <Upload size={15} /> Upload PDB / mmCIF
            <input
              type="file"
              accept=".pdb,.cif,.mmcif"
              hidden
              onChange={onUpload}
            />
          </label>
        }
      />
      <Panel className="nae-filterbar">
        <label>
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="PDB ID, title, organism…"
          />
        </label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option>All</option>
          <option>DNA</option>
          <option>RNA</option>
          <option>Polymerase</option>
          <option>Nucleosome</option>
          <option>CRISPR</option>
          <option>Ribozyme</option>
          <option>Ribosome</option>
          <option>DNA-binding protein</option>
        </select>
        <Button
          onClick={() => {
            setQuery("");
            setType("All");
          }}
        >
          Reset
        </Button>
      </Panel>
      {error && (
        <div className="nae-error">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      <div className="nae-catalogue-layout">
        <Panel className="nae-data-table">
          <div className="nae-table-row header">
            <span>PDB ID</span>
            <span>Name / description</span>
            <span>Organism</span>
            <span>Method</span>
            <span>Resolution</span>
            <span>Chains</span>
          </div>
          {results.map((s) => (
            <button
              key={s.id}
              className={`nae-table-row ${selected.id === s.id ? "selected" : ""}`}
              onClick={() => {
                setSelected(s);
                setUpload(null);
              }}
            >
              <strong>{s.id}</strong>
              <span>
                <b>{s.name}</b>
                <small>
                  {s.type} · {s.count}
                </small>
              </span>
              <span>{s.organism}</span>
              <span>{s.method}</span>
              <span>{s.resolution}</span>
              <span>{s.chains}</span>
            </button>
          ))}
          {!results.length && (
            <div className="nae-empty">
              <Search />
              <h3>No structures match</h3>
              <p>Change the search term or reset filters.</p>
            </div>
          )}
        </Panel>
        <Panel className="nae-catalogue-view">
          <div className="nae-view-title">
            <span>{upload?.name || `${selected.id} · ${selected.name}`}</span>
            <small>
              {upload
                ? "Imported coordinate file"
                : `${selected.method} · ${selected.resolution}`}
            </small>
          </div>
          <MolecularViewer
            pdbId={upload ? "LOCAL" : selected.id}
            source={upload?.url || localSource(selected)}
            sourceFormat={upload?.format || "mmcif"}
          />
        </Panel>
        <StructureInspector
          structure={
            upload
              ? {
                  ...selected,
                  id: "LOCAL",
                  name: upload.name,
                  type: "Imported structure",
                  method: "Local coordinate file",
                  resolution: "—",
                  organism: "—",
                  chains: "—",
                  count: "Parsed by Mol*",
                  cached: true,
                }
              : selected
          }
        />
      </div>
    </div>
  );
}

const BASES = {
  A: {
    name: "Adenine",
    dnaFormula: "C₁₀H₁₄N₅O₆P",
    dnaMass: "331.22 g/mol",
    rnaFormula: "C₁₀H₁₄N₅O₇P",
    rnaMass: "347.22 g/mol",
    charge: "−2",
    bond: "β-N9–C1′",
  },
  G: {
    name: "Guanine",
    dnaFormula: "C₁₀H₁₄N₅O₇P",
    dnaMass: "347.22 g/mol",
    rnaFormula: "C₁₀H₁₄N₅O₈P",
    rnaMass: "363.22 g/mol",
    charge: "−2",
    bond: "β-N9–C1′",
  },
  C: {
    name: "Cytosine",
    dnaFormula: "C₉H₁₄N₃O₇P",
    dnaMass: "307.20 g/mol",
    rnaFormula: "C₉H₁₄N₃O₈P",
    rnaMass: "323.20 g/mol",
    charge: "−2",
    bond: "β-N1–C1′",
  },
  T: {
    name: "Thymine",
    dnaFormula: "C₁₀H₁₅N₂O₈P",
    dnaMass: "322.21 g/mol",
    charge: "−2",
    bond: "β-N1–C1′",
  },
  U: {
    name: "Uracil",
    rnaFormula: "C₉H₁₃N₂O₉P",
    rnaMass: "324.18 g/mol",
    charge: "−2",
    bond: "β-N1–C1′",
  },
};
const nucleotideCode = (base, acid) => (acid === "DNA" ? `D${base}` : base);
const nucleotideValue = (base, acid, key) =>
  BASES[base][`${acid.toLowerCase()}${key}`];
export function BuilderPage({ acid, setAcid }) {
  const [history, setHistory] = useState(["A"]);
  const [index, setIndex] = useState(0);
  const [componentTab, setComponentTab] = useState("Components");
  const [diagramTab, setDiagramTab] = useState("2D chemical structure");
  const [linked, setLinked] = useState(false);
  const base = history[index];
  const code = nucleotideCode(base, acid);
  const modelUrl = `/assets/nucleic-acid/nucleotides/${code}_ideal.sdf`;
  const options = acid === "RNA" ? ["A", "G", "C", "U"] : ["A", "G", "C", "T"];
  const choose = (b) => {
    const next = history.slice(0, index + 1).concat(b);
    setHistory(next);
    setIndex(next.length - 1);
    setLinked(false);
  };
  const changeAcid = (nextAcid) => {
    setAcid(nextAcid);
    if ((nextAcid === "RNA" && base === "T") || (nextAcid === "DNA" && base === "U")) {
      choose("A");
    }
    setLinked(false);
  };
  useEffect(() => {
    if ((acid === "RNA" && base === "T") || (acid === "DNA" && base === "U")) {
      setHistory(["A"]);
      setIndex(0);
      setLinked(false);
    }
  }, [acid, base]);
  return (
    <div className="nae-page builder-page">
      <Header
        title="Nucleotide Builder"
        description="Inspect validated nucleotide chemistry and phosphodiester-bond geometry."
        actions={
          <>
            <Button
              onClick={() => {
                setHistory(["A"]);
                setIndex(0);
                setLinked(false);
              }}
            >
              <RotateCcw size={15} /> Reset
            </Button>
            <Button
              primary
              onClick={() =>
                downloadAsset(
                  `${base}-${acid}.sdf`,
                  modelUrl,
                )
              }
            >
              <Download size={15} /> Export
            </Button>
          </>
        }
      />
      <div className="nae-builder-layout">
        <Panel className="nae-components">
          <div className="nae-tabs">
            {["Components", "Templates", "Validation"].map((tab) => (
              <button key={tab} className={componentTab === tab ? "active" : ""} onClick={() => setComponentTab(tab)}>{tab}</button>
            ))}
          </div>
          {componentTab === "Components" && <>
          <h3>Sugar</h3>
          <div className="nae-segment">
            <button
              className={acid === "DNA" ? "active" : ""}
              onClick={() => changeAcid("DNA")}
            >
              2′-Deoxyribose
            </button>
            <button
              className={acid === "RNA" ? "active" : ""}
              onClick={() => changeAcid("RNA")}
            >
              Ribose
            </button>
          </div>
          <h3>Nucleobase</h3>
          {options.map((b) => (
            <button
              className={`nae-component ${base === b ? "active" : ""}`}
              onClick={() => choose(b)}
              key={b}
            >
              <span>{b}</span>
              <div>
                <strong>{BASES[b].name}</strong>
                <small>{nucleotideValue(b, acid, "Formula")}</small>
              </div>
            </button>
          ))}
          <h3>Bonding operation</h3>
          <Button disabled={linked} onClick={() => setLinked(true)}>
            <ArrowLeftRight size={15} /> {linked ? "3′→5′ bond formed" : "Form 3′→5′ phosphodiester bond"}
          </Button>
          </>}
          {componentTab === "Templates" && <div className="nae-tab-content">
            <h3>Validated CCD templates</h3>
            {options.map((item) => <button className="nae-component" onClick={() => choose(item)} key={item}><span>{item}</span><div><strong>{BASES[item].name} monophosphate</strong><small>RCSB Chemical Component {nucleotideCode(item, acid)}</small></div></button>)}
          </div>}
          {componentTab === "Validation" && <div className="nae-tab-content">
            <h3>Bond validation</h3>
            <div className="nae-valid"><Check /> CCD ideal coordinates loaded</div>
            <ul><li>5′ phosphate present</li><li>{acid === "RNA" ? "2′-hydroxyl present" : "2′-deoxy sugar"}</li><li>{BASES[base].bond} glycosidic linkage</li><li>{linked ? "3′→5′ phosphodiester operation complete" : "O3′ remains available for extension"}</li></ul>
          </div>}
        </Panel>
        <div className="nae-builder-center">
          <Panel className="nae-builder-view">
            <div className="nae-view-title">
              <span>
                {BASES[base].name}{" "}
                {acid === "DNA" ? "deoxyribonucleotide" : "ribonucleotide"}
              </span>
              <small>Atom-level view · CPK colouring</small>
            </div>
            <MolecularViewer pdbId={code} source={modelUrl} sourceFormat="sdf" representation="Ball & stick" />
          </Panel>
          <Panel className="nae-chem-panel">
            <div className="nae-tabs">
              {["2D chemical structure", "Atom numbering", "Bond table"].map((tab) => (
                <button key={tab} className={diagramTab === tab ? "active" : ""} onClick={() => setDiagramTab(tab)}>{tab}</button>
              ))}
            </div>
            {diagramTab === "2D chemical structure" && <img className="nae-chemical-image" src={`/assets/nucleic-acid/nucleotides/${code}_2d.png`} alt={`Validated 2D structure of ${BASES[base].name} ${acid} monophosphate`} />}
            {diagramTab === "Atom numbering" && <div className="nae-tab-content"><h3>IUPAC / PDB atom notation</h3><p><code>P, OP1, OP2, O5′, C5′, C4′, O4′, C3′, O3′, C2′, {acid === "RNA" ? "O2′, " : ""}C1′</code></p><p>Base attachment: {BASES[base].bond}</p></div>}
            {diagramTab === "Bond table" && <div className="nae-tab-content"><table><tbody><tr><th>Glycosidic</th><td>{BASES[base].bond}</td></tr><tr><th>5′ phosphate</th><td>P–O5′</td></tr><tr><th>Extension site</th><td>O3′–P</td></tr><tr><th>Link state</th><td>{linked ? "Phosphodiester formed" : "Monophosphate"}</td></tr></tbody></table></div>}
          </Panel>
        </div>
        <Panel className="nae-builder-inspector">
          <p className="nae-eyebrow">NUCLEOTIDE INSPECTOR</p>
          <h2>
            {acid === "DNA" ? "d" : ""}
            {base}MP
          </h2>
          <p>
            {BASES[base].name} {acid === "DNA" ? "2′-deoxyribose" : "ribose"}{" "}
            5′-monophosphate
          </p>
          <dl>
            <dt>Formula</dt>
            <dd>{nucleotideValue(base, acid, "Formula")}</dd>
            <dt>Molar mass</dt>
            <dd>{nucleotideValue(base, acid, "Mass")}</dd>
            <dt>Net charge (pH 7)</dt>
            <dd>{BASES[base].charge}</dd>
            <dt>Glycosidic bond</dt>
            <dd>{BASES[base].bond}</dd>
            <dt>3′ bonding site</dt>
            <dd>O3′ available</dd>
            <dt>5′ bonding site</dt>
            <dd>O5′ phosphorylated</dd>
          </dl>
          <div className="nae-valid">
            <Check /> Valence and stereochemistry valid
          </div>
          <ul>
            <li>Prime notation shown for sugar atoms</li>
            <li>β-glycosidic configuration</li>
            <li>Bond lengths within reference ranges</li>
          </ul>
          <div className="nae-undo">
            <Button
              disabled={index === 0}
              onClick={() => setIndex((i) => i - 1)}
            >
              Undo
            </Button>
            <Button
              disabled={index === history.length - 1}
              onClick={() => setIndex((i) => i + 1)}
            >
              Redo
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

const CODON = {
  TTT:"F",TTC:"F",TTA:"L",TTG:"L",TCT:"S",TCC:"S",TCA:"S",TCG:"S",
  TAT:"Y",TAC:"Y",TAA:"*",TAG:"*",TGT:"C",TGC:"C",TGA:"*",TGG:"W",
  CTT:"L",CTC:"L",CTA:"L",CTG:"L",CCT:"P",CCC:"P",CCA:"P",CCG:"P",
  CAT:"H",CAC:"H",CAA:"Q",CAG:"Q",CGT:"R",CGC:"R",CGA:"R",CGG:"R",
  ATT:"I",ATC:"I",ATA:"I",ATG:"M",ACT:"T",ACC:"T",ACA:"T",ACG:"T",
  AAT:"N",AAC:"N",AAA:"K",AAG:"K",AGT:"S",AGC:"S",AGA:"R",AGG:"R",
  GTT:"V",GTC:"V",GTA:"V",GTG:"V",GCT:"A",GCC:"A",GCA:"A",GCG:"A",
  GAT:"D",GAC:"D",GAA:"E",GAG:"E",GGT:"G",GGC:"G",GGA:"G",GGG:"G",
};
const complement = (s, rna = false) =>
  s
    .split("")
    .map(
      (b) => ({ A: rna ? "U" : "T", T: "A", U: "A", G: "C", C: "G" })[b] || "",
    )
    .join("");
const translate = (s, offset = 0) => {
  let out = "";
  for (let i = offset; i + 2 < s.length; i += 3)
    out += CODON[s.slice(i, i + 3).replace(/U/g, "T")] || "X";
  return out;
};
const reverseComplement = (s, rna = false) =>
  complement(s, rna).split("").reverse().join("");
const findPattern = (sequence, pattern) => {
  const positions = [];
  if (!pattern) return positions;
  let position = sequence.indexOf(pattern);
  while (position >= 0) {
    positions.push(position + 1);
    position = sequence.indexOf(pattern, position + 1);
  }
  return positions;
};
const findOrfs = (sequence) => {
  const dna = sequence.replace(/U/g, "T");
  const strands = [dna, reverseComplement(dna)];
  const results = [];
  strands.forEach((strand, strandIndex) => {
    for (let frame = 0; frame < 3; frame += 1) {
      for (let start = frame; start + 2 < strand.length; start += 3) {
        if (strand.slice(start, start + 3) !== "ATG") continue;
        for (let end = start + 3; end + 2 < strand.length; end += 3) {
          if (["TAA", "TAG", "TGA"].includes(strand.slice(end, end + 3))) {
            results.push({
              frame: `${strandIndex ? "−" : "+"}${frame + 1}`,
              start: start + 1,
              end: end + 3,
              peptide: translate(strand.slice(start, end + 3)),
            });
            break;
          }
        }
      }
    }
  });
  return results;
};
const RESTRICTION_ENZYMES = {
  EcoRI: "GAATTC",
  BamHI: "GGATCC",
  HindIII: "AAGCTT",
  NotI: "GCGGCCGC",
};
const SAMPLE =
  "ACCTGAGGCCCAGGGTCTGGGAGAGAGGCTGGGGAGGAGGCCTGGGAGAAGTTGGGATTCCTGAGGAGGAGCGCTGGGGTCCCGGAGCCTC";
export function SequencesPage({ acid }) {
  const [seq, setSeq] = useState(SAMPLE);
  const [message, setMessage] = useState("Validated DNA sequence");
  const [motif, setMotif] = useState("GAGG");
  const [analysisTab, setAnalysisTab] = useState("Analysis");
  const [zoom, setZoom] = useState(65);
  const [selectionStart, setSelectionStart] = useState(1);
  const [selectionEnd, setSelectionEnd] = useState(40);
  useEffect(() => {
    setSeq((sequence) => acid === "RNA" ? sequence.replace(/T/g, "U") : sequence.replace(/U/g, "T"));
    setMessage(`Validated ${acid} sequence`);
  }, [acid]);
  const clean = seq.toUpperCase().replace(/\s/g, "");
  const valid =
    clean.replace(acid === "RNA" ? /[AUGC]/g : /[ATGC]/g, "") === "";
  const counts = useMemo(
    () =>
      Object.fromEntries(
        ["A", "C", "G", acid === "RNA" ? "U" : "T"].map((b) => [
          b,
          (clean.match(new RegExp(b, "g")) || []).length,
        ]),
      ),
    [clean, acid],
  );
  const gc = clean.length ? ((counts.G + counts.C) / clean.length) * 100 : 0;
  const tm =
    clean.length < 14
      ? 2 * ((counts.A || 0) + (counts.T || counts.U || 0)) +
        4 * ((counts.G || 0) + (counts.C || 0))
      : 64.9 + (41 * ((counts.G || 0) + (counts.C || 0) - 16.4)) / clean.length;
  const tmMethod = clean.length < 14 ? "Wallace rule" : "long-oligo GC formula";
  const hits = findPattern(clean, motif.toUpperCase());
  const reverse = reverseComplement(clean, acid === "RNA");
  const frames = [0, 1, 2].flatMap((offset) => [
    { label: `+${offset + 1}`, peptide: translate(clean, offset) },
    { label: `−${offset + 1}`, peptide: translate(reverse, offset) },
  ]);
  const orfs = findOrfs(clean);
  const restrictionHits = Object.entries(RESTRICTION_ENZYMES).flatMap(
    ([enzyme, site]) =>
      findPattern(clean.replace(/U/g, "T"), site).map((position) => ({
        enzyme,
        site,
        position,
      })),
  );
  const safeStart = Math.min(Math.max(1, selectionStart), Math.max(clean.length, 1));
  const safeEnd = Math.min(
    Math.max(safeStart, selectionEnd),
    Math.max(clean.length, 1),
  );
  const selectedSequence = clean.slice(safeStart - 1, safeEnd);
  const visibleLength = Math.max(
    10,
    Math.round(clean.length * ((110 - zoom) / 100)),
  );
  const viewStart = Math.min(
    safeStart,
    Math.max(1, clean.length - visibleLength + 1),
  );
  const viewEnd = Math.min(clean.length, viewStart + visibleLength - 1);
  const visibleSequence = clean.slice(viewStart - 1, viewEnd);
  return (
    <div className="nae-page sequences-page">
      <Header
        title="Sequences"
        description="Validate, transform and annotate nucleotide sequences."
        actions={
          <>
            <Button onClick={() => setSeq("")}>Clear</Button>
            <Button
              primary
              onClick={() =>
                downloadText("sequence.fasta", `>NAE_sequence\n${clean}`)
              }
            >
              <Download size={15} /> Export FASTA
            </Button>
          </>
        }
      />
      <div className="nae-seq-toolbar">
        <label className="nae-button">
          <FileUp size={15} /> Import FASTA
          <input
            type="file"
            accept=".fa,.fasta,.txt"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f)
                f.text().then((t) =>
                  setSeq(
                    t
                      .split(/\r?\n/)
                      .filter((x) => !x.startsWith(">"))
                      .join(""),
                  ),
                );
            }}
          />
        </label>
        <Button onClick={() => navigator.clipboard?.readText().then(setSeq)}>
          Paste
        </Button>
        <Button
          onClick={() =>
            setMessage(
              valid
                ? "Sequence is valid"
                : `Invalid symbols detected for ${acid}`,
            )
          }
        >
          <Check size={15} /> Validate
        </Button>
        <span className={valid ? "nae-valid-inline" : "nae-invalid-inline"}>
          {message}
        </span>
      </div>
      <div className="nae-sequence-layout">
        <Panel className="nae-editor-panel">
          <div className="nae-editor-tab">
            sequence.fasta <small>{clean.length} nt</small>
          </div>
          <div className="nae-ruler">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i}>{i * 10 + 1}</span>
            ))}
          </div>
          <textarea
            value={seq}
            onChange={(e) => setSeq(e.target.value.toUpperCase())}
            spellCheck="false"
            aria-label="Nucleotide sequence editor"
          />
          <div className="nae-editor-status">
            Ln 1 · Length {clean.length} · {acid} ·{" "}
            {valid ? "valid" : "invalid"}
          </div>
        </Panel>
        <Panel className="nae-analysis-panel">
          <div className="nae-tabs">
            {["Analysis", "Transform", "ORFs", "Sites"].map((tab) => (
              <button
                key={tab}
                className={analysisTab === tab ? "active" : ""}
                onClick={() => setAnalysisTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="nae-analysis-body">
            {analysisTab === "Analysis" && <>
            <h3>Sequence statistics</h3>
            <dl>
              <dt>Length</dt>
              <dd>{clean.length} nt</dd>
              <dt>GC content</dt>
              <dd>{gc.toFixed(1)}%</dd>
              <dt>Melting temperature</dt>
              <dd>
                {tm.toFixed(1)} °C <small>{tmMethod}</small>
              </dd>
              <dt>Approx. molecular weight</dt>
              <dd>
                {(clean.length * (acid === "RNA" ? 340 : 330)).toLocaleString()}{" "}
                g/mol
              </dd>
            </dl>
            <h3>Base composition</h3>
            {Object.entries(counts).map(([b, n]) => (
              <div className="nae-composition" key={b}>
                <b>{b}</b>
                <div>
                  <i
                    style={{
                      width: `${clean.length ? (n / clean.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span>{n}</span>
              </div>
            ))}
            <h3>Selected region</h3>
            <dl>
              <dt>Coordinates</dt><dd>{safeStart}–{safeEnd}</dd>
              <dt>Length</dt><dd>{selectedSequence.length} nt</dd>
              <dt>GC content</dt>
              <dd>{selectedSequence.length ? (((selectedSequence.match(/[GC]/g) || []).length / selectedSequence.length) * 100).toFixed(1) : "0.0"}%</dd>
            </dl>
            </>}
            {analysisTab === "Transform" && <>
            <h3>Transforms</h3>
            <label>
              Complement
              <textarea readOnly value={complement(clean, acid === "RNA")} />
            </label>
            <label>
              Reverse complement
              <textarea
                readOnly
                value={reverse}
              />
            </label>
            <h3>Six-frame translation</h3>
            <div className="nae-frames">
              {frames.map((frame) => (
                <code key={frame.label}>
                  {frame.label} {frame.peptide}
                </code>
              ))}
            </div>
            </>}
            {analysisTab === "ORFs" && <>
              <h3>Open reading frames</h3>
              {orfs.length ? orfs.map((orf, index) => (
                <div className="nae-analysis-result" key={`${orf.frame}-${orf.start}-${index}`}>
                  <strong>Frame {orf.frame} · {orf.start}–{orf.end}</strong>
                  <code>{orf.peptide}</code>
                </div>
              )) : <p className="nae-empty-inline">No complete ATG–stop ORFs in this sequence.</p>}
            </>}
            {analysisTab === "Sites" && <>
              <h3>Restriction sites</h3>
              {restrictionHits.length ? restrictionHits.map((hit) => (
                <div className="nae-analysis-result" key={`${hit.enzyme}-${hit.position}`}>
                  <strong>{hit.enzyme}</strong>
                  <code>{hit.site} at {hit.position}</code>
                </div>
              )) : <p className="nae-empty-inline">No EcoRI, BamHI, HindIII or NotI sites detected.</p>}
            </>}
          </div>
        </Panel>
        <Panel className="nae-track-panel">
          <div className="nae-track-tools">
            <span>Coordinate ruler</span>
            <input
              type="range"
              min="20"
              max="100"
              value={zoom}
              onChange={(e) => setZoom(+e.target.value)}
              aria-label="Sequence zoom"
            />
            <label>
              Region
              <input
                type="number"
                min="1"
                max={Math.max(clean.length, 1)}
                value={safeStart}
                onChange={(e) => setSelectionStart(+e.target.value)}
                aria-label="Selected region start"
              />
              <span>–</span>
              <input
                type="number"
                min={safeStart}
                max={Math.max(clean.length, 1)}
                value={safeEnd}
                onChange={(e) => setSelectionEnd(+e.target.value)}
                aria-label="Selected region end"
              />
            </label>
            <label>
              Motif{" "}
              <input
                value={motif}
                onChange={(e) => setMotif(e.target.value.toUpperCase())}
              />
            </label>
          </div>
          <div className="nae-genome-ruler">
            {Array.from({ length: 6 }, (_, i) => (
              <span key={i}>{Math.round(viewStart + ((viewEnd - viewStart) * i) / 5)}</span>
            ))}
          </div>
          <div className="nae-sequence-track">
            <b>Sequence</b>
            <div>
              {visibleSequence.split("").map((b, i) => {
                const coordinate = viewStart + i;
                return (
                <i
                  key={coordinate}
                  onClick={() => {
                    setSelectionStart(coordinate);
                    setSelectionEnd(coordinate);
                  }}
                  className={
                    hits.some((h) => coordinate >= h && coordinate < h + motif.length)
                      ? "hit"
                      : ""
                  }
                  title={`Position ${coordinate}`}
                >
                  {b}
                </i>
              )})}
            </div>
          </div>
          <div className="nae-annotation-track">
            <b>Motifs</b>
            <div>
              {hits.filter((h) => h >= viewStart && h <= viewEnd).map((h) => (
                <span
                  key={h}
                  style={{ left: `${((h - viewStart) / Math.max(viewEnd - viewStart, 1)) * 100}%` }}
                >
                  motif · {h}
                </span>
              ))}
            </div>
          </div>
          <div className="nae-annotation-track restriction">
            <b>Restriction sites</b>
            <div>
              {restrictionHits.filter((hit) => hit.position >= viewStart && hit.position <= viewEnd).map((hit) => (
                <span
                  key={`${hit.enzyme}-${hit.position}`}
                  style={{ left: `${((hit.position - viewStart) / Math.max(viewEnd - viewStart, 1)) * 100}%` }}
                >
                  {hit.enzyme} · {hit.position}
                </span>
              ))}
            </div>
          </div>
          <p className="nae-track-note">
            {hits.length} motif match{hits.length === 1 ? "" : "es"} · Selected
            region {safeStart}–{safeEnd} · view {viewStart}–{viewEnd} · GC {gc.toFixed(1)}%
          </p>
        </Panel>
      </div>
    </div>
  );
}

function useSimulation(max = 100) {
  const [position, setPosition] = useState(28);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(
      () => setPosition((p) => (p >= max ? 0 : p + 1)),
      500 / speed,
    );
    return () => clearInterval(id);
  }, [playing, speed, max]);
  return {
    position,
    setPosition,
    playing,
    setPlaying,
    speed,
    setSpeed,
    reset: () => {
      setPlaying(false);
      setPosition(0);
    },
  };
}
const bases = "ATGCGTACCGTTAACGGTAC";
export function ReplicationPage() {
  const sim = useSimulation(100);
  const [enzyme, setEnzyme] = useState("DNA polymerase III");
  const [labels, setLabels] = useState(true);
  const [detail, setDetail] = useState(true);
  const enzymeInfo = {
    "DNA polymerase III": { pdb: "2HNH", detail: "Catalytic α subunit · E. coli · PDB 2HNH" },
    Helicase: { pdb: "4ESV", detail: "DnaB hexamer with ssDNA · PDB 4ESV" },
    Primase: { pdb: "3B39", detail: "DnaG catalytic domain bound to ssDNA · PDB 3B39" },
    "Sliding clamp": { pdb: "3BEP", detail: "E. coli β clamp on primed DNA · PDB 3BEP" },
    SSB: { pdb: "1EYG", detail: "E. coli SSB tetramer bound to ssDNA · PDB 1EYG" },
    Ligase: { pdb: "2OWO", detail: "E. coli LigA bound to nicked DNA · PDB 2OWO" },
  };
  const selectedEnzyme = enzymeInfo[enzyme];
  return (
    <div className="nae-page mechanism-page">
      <Header
        title="DNA Replication"
        description="Step through a bacterial replication fork with correct antiparallel strand synthesis."
        actions={
          <>
            <select value={enzyme} onChange={(e) => setEnzyme(e.target.value)}>
              {Object.keys(enzymeInfo).map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <Button onClick={() => setLabels((x) => !x)}>
              {labels ? "Hide" : "Show"} labels
            </Button>
            <Button onClick={() => setDetail((x) => !x)}>
              {detail ? "Hide" : "Show"} molecular detail
            </Button>
          </>
        }
      />
      <div className="nae-mechanism-layout">
        <Panel className="nae-fork-panel">
          <div
            className="nae-fork"
            style={{ "--progress": `${sim.position}%` }}
          >
            <div className="strand parent top">
              <b>3′</b>
              {bases.split("").map((b, i) => (
                <span key={i}>{b}</span>
              ))}
              <b>5′</b>
            </div>
            <div className="strand daughter leading">
              <b>5′</b>
              {complement(bases)
                .split("")
                .map((b, i) => (
                  <span className={i * 5 <= sim.position ? "made" : ""} key={i}>
                    {i * 5 <= sim.position ? b : "·"}
                  </span>
                ))}
              <b>3′</b>
            </div>
            <button type="button" className={`fork-enzyme helicase ${enzyme === "Helicase" ? "selected" : ""}`} onClick={() => setEnzyme("Helicase")} title="Select DnaB helicase">DnaB</button>
            <button type="button" className={`enzyme polymerase top-pol ${enzyme === "DNA polymerase III" ? "selected" : ""}`} onClick={() => setEnzyme("DNA polymerase III")}>POL III</button>
            <button type="button" className={`enzyme primase ${enzyme === "Primase" ? "selected" : ""}`} onClick={() => setEnzyme("Primase")}>PRIMASE</button>
            <button type="button" className={`enzyme clamp ${enzyme === "Sliding clamp" ? "selected" : ""}`} onClick={() => setEnzyme("Sliding clamp")}>CLAMP</button>
            <button type="button" className={`enzyme ssb ${enzyme === "SSB" ? "selected" : ""}`} onClick={() => setEnzyme("SSB")}>SSB</button>
            <div className="strand parent bottom">
              <b>5′</b>
              {complement(bases)
                .split("")
                .map((b, i) => (
                  <span key={i}>{b}</span>
                ))}
              <b>3′</b>
            </div>
            <div className="strand daughter lagging">
              <b>3′</b>
              {bases.split("").map((b, i) => (
                <span
                  className={
                    i * 5 <= sim.position && i % 7 < 5 ? "made okazaki" : ""
                  }
                  key={i}
                >
                  {i * 5 <= sim.position && i % 7 < 5 ? b : "·"}
                </span>
              ))}
              <b>5′</b>
            </div>
            <button type="button" className={`enzyme polymerase bottom-pol ${enzyme === "DNA polymerase III" ? "selected" : ""}`} onClick={() => setEnzyme("DNA polymerase III")}>POL III</button>
            <button type="button" className={`enzyme ligase ${enzyme === "Ligase" ? "selected" : ""}`} onClick={() => setEnzyme("Ligase")}>LIGASE</button>
            {labels && (
              <>
                <label className="label parent-label">Parental duplex</label>
                <label className="label leading-label">
                  Leading strand · continuous 5′→3′ synthesis
                </label>
                <label className="label lagging-label">
                  Lagging strand · Okazaki fragments
                </label>
                <label className="label primer-label">RNA primers</label>
              </>
            )}
          </div>
          <div className="nae-sim-controls">
            <Button primary onClick={() => sim.setPlaying((x) => !x)}>
              {sim.playing ? <Pause /> : <Play />}
              {sim.playing ? "Pause" : "Play"}
            </Button>
            <Button aria-label="Step backward one nucleotide" title="Step backward" onClick={() => sim.setPosition((p) => Math.max(0, p - 1))}>
              <StepBack />
            </Button>
            <Button
              aria-label="Step forward one nucleotide"
              title="Step forward"
              onClick={() => sim.setPosition((p) => Math.min(100, p + 1))}
            >
              <StepForward />
            </Button>
            <select
              value={sim.speed}
              onChange={(e) => sim.setSpeed(+e.target.value)}
            >
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
            </select>
            <input
              type="range"
              min="0"
              max="100"
              value={sim.position}
              onChange={(e) => sim.setPosition(+e.target.value)}
            />
            <code>{sim.position.toString().padStart(3, "0")} nt</code>
            <Button onClick={sim.reset}>
              <RotateCcw /> Reset
            </Button>
          </div>
          <div className="nae-event-timeline">
            <span className="done">Origin opened</span>
            <span className={sim.position > 15 ? "done" : ""}>
              Helicase unwinds
            </span>
            <span className={sim.position > 35 ? "done" : ""}>
              Primer placed
            </span>
            <span className={sim.position > 60 ? "done" : ""}>
              Polymerase extends
            </span>
            <span className={sim.position > 85 ? "done" : ""}>
              Ligase seals nick
            </span>
          </div>
        </Panel>
        <Panel className="nae-mechanism-inspector">
          <div className="nae-tabs">
            {Object.keys(enzymeInfo).map((x) => (
              <button
                className={enzyme === x ? "active" : ""}
                onClick={() => setEnzyme(x)}
                key={x}
              >
                {x.replace("DNA polymerase ", "Pol ")}
              </button>
            ))}
          </div>
          <div className="nae-inspector-body">
            <p className="nae-eyebrow">SELECTED ENZYME</p>
            <h2>{enzyme}</h2>
            <p>{selectedEnzyme.detail}</p>
            {detail && (
              <div className="nae-enzyme-view">
                <MolecularViewer compact pdbId={selectedEnzyme.pdb} />
              </div>
            )}
            <dl>
              <dt>Fork position</dt>
              <dd>{sim.position} nt</dd>
              <dt>Synthesis direction</dt>
              <dd>5′→3′</dd>
              <dt>Template read</dt>
              <dd>3′→5′</dd>
              <dt>Incoming nucleotide</dt>
              <dd>d{bases[Math.floor(sim.position / 5) % bases.length]}TP</dd>
            </dl>
            <h3>Activity log</h3>
            <div className="nae-log">
              <code>
                00:{sim.position.toString().padStart(2, "0")} correct base pair
                verified
              </code>
              <code>
                00:{(sim.position + 1).toString().padStart(2, "0")}{" "}
                phosphodiester bond formed
              </code>
              <code>
                00:{(sim.position + 2).toString().padStart(2, "0")}{" "}
                translocation +1 nt
              </code>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function TranscriptionPage() {
  const sim = useSimulation(40);
  const [stage, setStage] = useState("Elongation");
  const [mutation, setMutation] = useState(false);
  const [inspectorTab, setInspectorTab] = useState("Inspector");
  const template = (mutation ? "TACGAT" : "TACGTT") + "AGCCTAAGTCCGAT";
  const transcript = complement(
    template.slice(0, Math.max(1, Math.ceil(sim.position / 2))),
    true,
  );
  return (
    <div className="nae-page mechanism-page transcription-page">
      <Header
        title="Transcription"
        description="Explore initiation, elongation and termination with base-by-base RNA synthesis."
        actions={
          <>
            <div className="nae-segment">
              {["Initiation", "Elongation", "Termination"].map((x) => (
                <button
                  className={stage === x ? "active" : ""}
                  onClick={() => setStage(x)}
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
            <Button onClick={() => setMutation((x) => !x)}>
              {mutation ? "Revert mutation" : "Introduce A→G mutation"}
            </Button>
          </>
        }
      />
      <div className="nae-mechanism-layout">
        <Panel className="nae-transcription-main">
          <div className="nae-transcription-view">
            <MolecularViewer pdbId="6ALH" representation="Surface" />
          </div>
          <div className="nae-transcript-sequences">
            <div>
              <b>Coding 5′→3′</b>
              <code>{complement(template)} </code>
            </div>
            <div>
              <b>Template 3′→5′</b>
              <code>{template}</code>
            </div>
            <div>
              <b>RNA 5′→3′</b>
              <code>{transcript}</code>
            </div>
            <i style={{ left: `${sim.position}%` }} />
          </div>
          <div className="nae-sim-controls">
            <Button primary onClick={() => sim.setPlaying((x) => !x)}>
              {sim.playing ? <Pause /> : <Play />}
              {sim.playing ? "Pause" : "Play"}
            </Button>
            <Button aria-label="Step backward one nucleotide" title="Step backward" onClick={() => sim.setPosition((p) => Math.max(0, p - 1))}>
              <StepBack />
            </Button>
            <Button aria-label="Step forward one nucleotide" title="Step forward" onClick={() => sim.setPosition((p) => Math.min(40, p + 1))}>
              <StepForward />
            </Button>
            <select
              value={sim.speed}
              onChange={(e) => sim.setSpeed(+e.target.value)}
            >
              <option value="0.5">0.5×</option>
              <option value="1">1×</option>
              <option value="2">2×</option>
            </select>
            <input
              type="range"
              min="0"
              max="40"
              value={sim.position}
              onChange={(e) => sim.setPosition(+e.target.value)}
            />
            <Button onClick={sim.reset}>Reset</Button>
          </div>
          <div className="nae-stagebar">
            <span className={stage === "Initiation" ? "active" : ""}>
              Promoter recognition
            </span>
            <span className={stage === "Elongation" ? "active" : ""}>
              5′→3′ elongation
            </span>
            <span className={stage === "Termination" ? "active" : ""}>
              Termination
            </span>
          </div>
        </Panel>
        <Panel className="nae-mechanism-inspector">
          <div className="nae-tabs">
            {["Inspector", "Annotations", "Tracks"].map((tab) => (
              <button key={tab} className={inspectorTab === tab ? "active" : ""} onClick={() => setInspectorTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="nae-inspector-body">
            {inspectorTab === "Inspector" && <>
            <p className="nae-eyebrow">REAL MOLECULAR MODEL</p>
            <h2>RNA polymerase elongation complex</h2>
            <p>PDB 6ALH · E. coli · cryo-EM · 4.4 Å</p>
            <dl>
              <dt>Stage</dt>
              <dd>{stage}</dd>
              <dt>Template position</dt>
              <dd>+{sim.position}</dd>
              <dt>Incoming NTP</dt>
              <dd>{transcript.at(-1) || "A"}TP</dd>
              <dt>RNA length</dt>
              <dd>{transcript.length} nt</dd>
              <dt>Synthesis</dt>
              <dd>5′→3′</dd>
            </dl>
            <h3>Growing transcript</h3>
            <pre>{`5′ ${transcript} 3′`}</pre>
            <Button
              primary
              onClick={() =>
                downloadText(
                  "transcript.fasta",
                  `>NAE_transcript\n${transcript}`,
                )
              }
            >
              <Download /> Export transcript
            </Button>
            </>}
            {inspectorTab === "Annotations" && <>
              <p className="nae-eyebrow">MECHANISM ANNOTATIONS</p>
              <h2>{stage}</h2>
              <dl><dt>Promoter</dt><dd>−35 to +1 recognition region</dd><dt>Transcription bubble</dt><dd>Locally unwound DNA in PDB 6ALH</dd><dt>Template read</dt><dd>3′→5′</dd><dt>RNA synthesis</dt><dd>5′→3′</dd><dt>Mutation state</dt><dd>{mutation ? "A→G experiment active" : "Reference sequence"}</dd></dl>
            </>}
            {inspectorTab === "Tracks" && <>
              <p className="nae-eyebrow">SYNCHRONIZED SEQUENCE TRACKS</p>
              <h3>Coding strand</h3><pre>{`5′ ${complement(template)} 3′`}</pre>
              <h3>Template strand</h3><pre>{`3′ ${template} 5′`}</pre>
              <h3>Growing RNA</h3><pre>{`5′ ${transcript} 3′`}</pre>
            </>}
            {inspectorTab === "Inspector" && <>
            <h3>Event log</h3>
            <div className="nae-log">
              <code>Promoter complex formed</code>
              <code>Template base read at +{sim.position}</code>
              <code>
                {mutation
                  ? "Mutation propagated to transcript"
                  : "Watson–Crick pairing verified"}
              </code>
            </div>
            </>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

const STRUCTURE_SEQUENCES = {
  "1BNA": "CGCGAATTCGCG",
  "4OCB": "CGCGCGCGCGCG",
  "1ANA": "CCGG",
  "2KOC": "GGCACUUCGGUGCC",
  "1EHZ": "GCGGAUUUAGCUCAGUUGGGAGAGCGCCAGACUGAAGAUCUGGAGGUCCUGUGUUCGAUCCACAGAAUUCGCACCA",
};
const HELIX_PARAMETERS = {
  "1BNA": { handed: "Right", diameter: 20, rise: 3.4, twist: 36, pucker: "C2′-endo", grooves: "Wide major / narrow minor" },
  "1ANA": { handed: "Right", diameter: 23, rise: 2.6, twist: 33, pucker: "C3′-endo", grooves: "Deep major / broad shallow minor" },
  "4OCB": { handed: "Left", diameter: 18, rise: 3.7, twist: -30, pucker: "Alternating purine/pyrimidine", grooves: "Flattened major / narrow deep minor" },
};
const sequenceIdentity = (a = "", b = "") => {
  const n = Math.min(a.length, b.length);
  if (!n) return 0;
  let matches = 0;
  for (let i = 0; i < n; i += 1) if (a[i] === b[i]) matches += 1;
  return (matches / n) * 100;
};
async function phosphateTrace(plugin) {
  const [{ StructureElement, StructureProperties }, { MinimizeRmsd }] = await Promise.all([
    import("molstar/lib/mol-model/structure"),
    import("molstar/lib/mol-math/linear-algebra/3d/minimize-rmsd"),
  ]);
  const structure = plugin?.__naeLoaded?.structure?.obj?.data ||
    plugin?.managers?.structure?.hierarchy?.current?.structures?.[0]?.cell?.obj?.data;
  const points = [];
  if (!structure) return { points, MinimizeRmsd };
  for (const unit of structure.units) {
    for (const element of unit.elements) {
      const location = StructureElement.Location.create(structure, unit, element);
      if (StructureProperties.atom.label_atom_id(location) !== "P") continue;
      const point = [0, 0, 0];
      unit.conformation.position(element, point);
      points.push(point);
    }
  }
  return { points, MinimizeRmsd };
}

export function ComparativePage() {
  const [left, setLeft] = useState(STRUCTURES[0]);
  const [right, setRight] = useState(STRUCTURES[1]);
  const [sync, setSync] = useState(true);
  const [mode, setMode] = useState("PDB structure vs PDB structure");
  const [tab, setTab] = useState("Structural comparison");
  const [alignment, setAlignment] = useState({ status: "idle", rmsd: null, atoms: 0 });
  const [correspondence, setCorrespondence] = useState(4);
  const leftPlugin = useRef(null);
  const rightPlugin = useRef(null);
  const [viewerRevision, setViewerRevision] = useState(0);
  const registerLeft = useCallback((plugin, loaded) => {
    plugin.__naeLoaded = loaded;
    leftPlugin.current = plugin;
    setViewerRevision((value) => value + 1);
  }, []);
  const registerRight = useCallback((plugin, loaded) => {
    plugin.__naeLoaded = loaded;
    rightPlugin.current = plugin;
    setViewerRevision((value) => value + 1);
  }, []);
  useEffect(() => {
    if (!sync || !leftPlugin.current?.canvas3d || !rightPlugin.current?.canvas3d) return;
    let applying = false;
    const subscription = leftPlugin.current.canvas3d.camera.stateChanged.subscribe((snapshot) => {
      if (applying || !rightPlugin.current?.canvas3d) return;
      applying = true;
      const rightCamera = rightPlugin.current.canvas3d.camera;
      const sourceTarget = snapshot.target || leftPlugin.current.canvas3d.camera.state.target;
      const sourcePosition = snapshot.position || leftPlugin.current.canvas3d.camera.state.position;
      const target = rightCamera.state.target;
      const offset = sourcePosition.map((value, index) => value - sourceTarget[index]);
      rightCamera.setState({
        ...snapshot,
        target,
        position: target.map((value, index) => value + offset[index]),
      });
      applying = false;
    });
    return () => subscription.unsubscribe();
  }, [sync, viewerRevision]);
  const changeMode = (nextMode) => {
    setMode(nextMode);
    setAlignment({ status: "idle", rmsd: null, atoms: 0 });
    if (nextMode === "DNA vs RNA") {
      setLeft(STRUCTURES.find((x) => x.id === "1BNA"));
      setRight(STRUCTURES.find((x) => x.id === "2KOC"));
    } else if (nextMode === "A/B/Z DNA") {
      setLeft(STRUCTURES.find((x) => x.id === "1ANA"));
      setRight(STRUCTURES.find((x) => x.id === "4OCB"));
    } else if (nextMode === "Native vs mutated") {
      setLeft(STRUCTURES.find((x) => x.id === "1BNA"));
      setRight(STRUCTURES.find((x) => x.id === "1BNA"));
      setTab("Sequence alignment");
    } else if (nextMode === "Sequence vs sequence") {
      setLeft(STRUCTURES.find((x) => x.id === "1BNA"));
      setRight(STRUCTURES.find((x) => x.id === "2KOC"));
      setTab("Sequence alignment");
    } else {
      setTab("Structural comparison");
    }
  };
  const align = async () => {
    setAlignment({ status: "working", rmsd: null, atoms: 0 });
    try {
      const [a, b] = await Promise.all([phosphateTrace(leftPlugin.current), phosphateTrace(rightPlugin.current)]);
      const count = Math.min(a.points.length, b.points.length);
      if (count < 3) throw new Error("At least three corresponding phosphate atoms are required.");
      const positions = (points) => ({
        x: Float64Array.from(points.slice(0, count), (point) => point[0]),
        y: Float64Array.from(points.slice(0, count), (point) => point[1]),
        z: Float64Array.from(points.slice(0, count), (point) => point[2]),
      });
      const result = a.MinimizeRmsd.compute({ a: positions(a.points), b: positions(b.points) });
      setAlignment({ status: "done", rmsd: result.rmsd, atoms: count });
      setTab("Measurements");
    } catch (error) {
      setAlignment({ status: error.message, rmsd: null, atoms: 0 });
      setTab("Measurements");
    }
  };
  const leftParams = HELIX_PARAMETERS[left.id];
  const rightParams = HELIX_PARAMETERS[right.id];
  const leftSequence = STRUCTURE_SEQUENCES[left.id] || "";
  const rightSequence = mode === "Native vs mutated"
    ? `${leftSequence.slice(0, 5)}G${leftSequence.slice(6)}`
    : STRUCTURE_SEQUENCES[right.id] || "";
  const identity = sequenceIdentity(leftSequence, rightSequence);
  return (
    <div className="nae-page comparative-page">
      <Header
        title="Comparative View"
        description="Compare experimental structures and helical geometry side by side."
        actions={
          <>
            <select aria-label="Comparison mode" value={mode} onChange={(e) => changeMode(e.target.value)}>
              {["DNA vs RNA", "A/B/Z DNA", "Native vs mutated", "PDB structure vs PDB structure", "Sequence vs sequence"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <label className="nae-switch">
              <input
                type="checkbox"
                checked={sync}
                onChange={(e) => setSync(e.target.checked)}
              />
              <span /> Sync cameras
            </label>
            <Button onClick={align} disabled={alignment.status === "working" || !leftPlugin.current || !rightPlugin.current}>
              <Focus /> {alignment.status === "working" ? "Aligning…" : "Align phosphate traces"}
            </Button>
          </>
        }
      />
      <div className="nae-compare-grid">
        {[
          [left, setLeft],
          [right, setRight],
        ].map(([s, set], i) => (
          <Panel className="nae-compare-view" key={i}>
            <div className="nae-view-title">
              <select
                value={s.id}
                onChange={(e) =>
                  set(STRUCTURES.find((x) => x.id === e.target.value))
                }
              >
                {STRUCTURES.filter((x) =>
                  ["DNA", "RNA", "tRNA"].includes(x.type),
                ).map((x) => (
                  <option value={x.id} key={x.id}>
                    {x.id} · {x.name}
                  </option>
                ))}
              </select>
              <small>
                {s.method} · {s.resolution}
              </small>
            </div>
            <MolecularViewer
              pdbId={s.id}
              source={localSource(s)}
              onReady={i === 0 ? registerLeft : registerRight}
              focusResidue={correspondence}
              onSelection={(selection) => selection.residueNumber && setCorrespondence(selection.residueNumber)}
            />
          </Panel>
        ))}
      </div>
      <div className="nae-compare-lower">
        <Panel className="nae-parameter-table">
          <div className="nae-tabs">
            {["Structural comparison", "Sequence alignment", "Measurements"].map((item) => <button key={item} className={tab === item ? "active" : ""} onClick={() => setTab(item)}>{item}</button>)}
          </div>
          {tab === "Structural comparison" &&
          <table>
            <thead>
              <tr>
                <th>Parameter</th>
                <th>{left.id}</th>
                <th>{right.id}</th>
                <th>Difference</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Helical handedness</td>
                <td>{leftParams?.handed || "Not a regular helix"}</td>
                <td>{rightParams?.handed || "Not a regular helix"}</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Helix diameter</td>
                <td>{leftParams ? `~${leftParams.diameter} Å` : "—"}</td>
                <td>{rightParams ? `~${rightParams.diameter} Å` : "—"}</td>
                <td>{leftParams && rightParams ? `${rightParams.diameter - leftParams.diameter > 0 ? "+" : ""}${rightParams.diameter - leftParams.diameter} Å` : "—"}</td>
              </tr>
              <tr>
                <td>Rise per base pair</td>
                <td>{leftParams ? `${leftParams.rise} Å` : "—"}</td><td>{rightParams ? `${rightParams.rise} Å` : "—"}</td><td>{leftParams && rightParams ? `${(rightParams.rise - leftParams.rise).toFixed(1)} Å` : "—"}</td>
              </tr>
              <tr>
                <td>Helical twist</td>
                <td>{leftParams ? `${leftParams.twist}°` : "—"}</td><td>{rightParams ? `${rightParams.twist}°` : "—"}</td><td>{leftParams && rightParams ? `${rightParams.twist - leftParams.twist}°` : "—"}</td>
              </tr>
              <tr>
                <td>Sugar pucker</td>
                <td>{leftParams?.pucker || "Mixed"}</td><td>{rightParams?.pucker || "Mixed"}</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Groove geometry</td><td>{leftParams?.grooves || "Structure-dependent"}</td><td>{rightParams?.grooves || "Structure-dependent"}</td><td>—</td>
              </tr>
            </tbody>
          </table>}
          {tab === "Sequence alignment" && <div className="nae-tab-content"><h3>Coordinate-order sequence comparison</h3><pre>{left.id.padEnd(6)} {leftSequence || "Sequence unavailable"}{"\n"}{(mode === "Native vs mutated" ? "MUTANT" : right.id).padEnd(6)} {rightSequence || "Sequence unavailable"}</pre><dl><dt>Compared positions</dt><dd>{Math.min(leftSequence.length, rightSequence.length)}</dd><dt>Identity</dt><dd>{identity.toFixed(1)}%</dd><dt>Mode</dt><dd>{mode}</dd></dl></div>}
          {tab === "Measurements" && <div className="nae-tab-content"><h3>Structural alignment</h3><dl><dt>Method</dt><dd>Least-squares superposition of corresponding phosphate atoms</dd><dt>Matched atoms</dt><dd>{alignment.atoms || "Not calculated"}</dd><dt>RMSD</dt><dd>{alignment.rmsd === null ? (alignment.status === "idle" ? "Run alignment" : alignment.status) : `${alignment.rmsd.toFixed(2)} Å`}</dd><dt>Camera mode</dt><dd>{sync ? "Synchronized orientation" : "Independent"}</dd></dl></div>}
        </Panel>
        <Panel className="nae-correspondence">
          <p className="nae-eyebrow">RESIDUE CORRESPONDENCE</p>
          <h3>
            {leftSequence[correspondence - 1] || "—"}{correspondence} ({left.id}) ↔ {rightSequence[correspondence - 1] || "—"}{correspondence} ({right.id})
          </h3>
          <div className="nae-residue-pair">
            <span>{leftSequence[correspondence - 1] || "—"}</span>
            <ArrowLeftRight />
            <span>{rightSequence[correspondence - 1] || "—"}</span>
          </div>
          <label className="nae-correspondence-control">Mapped position
            <input type="range" min="1" max={Math.max(1, Math.min(leftSequence.length, rightSequence.length))} value={Math.min(correspondence, Math.max(1, Math.min(leftSequence.length, rightSequence.length)))} onChange={(e) => setCorrespondence(+e.target.value)} />
            <code>{correspondence}</code>
          </label>
          <dl>
            <dt>Sequence identity</dt>
            <dd>{identity.toFixed(1)}% across compared coordinates</dd>
            <dt>Camera state</dt>
            <dd>{sync ? "Synchronized" : "Independent"}</dd>
            <dt>Base orientation</dt>
            <dd>{right.id === "4OCB" ? "anti ↔ syn" : "anti ↔ anti"}</dd>
          </dl>
        </Panel>
      </div>
    </div>
  );
}

const preview = (id) => `/assets/nucleic-acid/previews/${id}.jpeg`;
export function GalleryPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [sort, setSort] = useState("PDB ID");
  const [selected, setSelected] = useState(STRUCTURES[0]);
  const [saved, setSaved] = useState(() =>
    JSON.parse(localStorage.getItem("nae-collection") || "[]"),
  );
  const list = STRUCTURES.filter(
    (s) =>
      (filter === "All" || s.category === filter) &&
      `${s.id} ${s.name}`.toLowerCase().includes(query.toLowerCase()),
  ).sort((a, b) =>
    sort === "Resolution"
      ? parseFloat(a.resolution) - parseFloat(b.resolution)
      : a.id.localeCompare(b.id),
  );
  const save = () => {
    const next = saved.includes(selected.id)
      ? saved.filter((x) => x !== selected.id)
      : [...saved, selected.id];
    setSaved(next);
    localStorage.setItem("nae-collection", JSON.stringify(next));
  };
  return (
    <div className="nae-page gallery-page">
      <Header
        title="3D Gallery"
        description="PDB-backed nucleic-acid structures and molecular complexes."
      />
      <Panel className="nae-filterbar">
        <label>
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search structures…"
          />
        </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          {[
            "All",
            "DNA",
            "RNA",
            "Polymerase",
            "Nucleosome",
            "CRISPR",
            "Ribozyme",
            "Ribosome",
            "DNA-binding protein",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>PDB ID</option>
          <option>Resolution</option>
        </select>
        <span>{list.length} structures</span>
      </Panel>
      <div className="nae-gallery-layout">
        <div className="nae-card-grid">
          {list.map((s) => (
            <button
              className={`nae-structure-card ${selected.id === s.id ? "selected" : ""}`}
              onClick={() => setSelected(s)}
              key={s.id}
            >
              <img
                src={preview(s.id)}
                alt={`Official RCSB preview of ${s.id}`}
                loading="lazy"
              />
              <strong>{s.id}</strong>
              <h3>{s.name}</h3>
              <div className="nae-tags">
                <span>{s.category}</span>
                <span>{s.type}</span>
              </div>
              <p>{s.organism}</p>
              <small>
                {s.method} · {s.resolution}
              </small>
            </button>
          ))}
        </div>
        <Panel className="nae-gallery-detail">
          <div className="nae-gallery-view">
            <MolecularViewer
              pdbId={selected.id}
              source={localSource(selected)}
            />
          </div>
          <div className="nae-inspector-body">
            <p className="nae-eyebrow">SELECTED STRUCTURE</p>
            <h2>{selected.id}</h2>
            <h3>{selected.name}</h3>
            <div className="nae-tags">
              <span>{selected.category}</span>
              <span>{selected.type}</span>
            </div>
            <dl>
              <dt>Organism</dt>
              <dd>{selected.organism}</dd>
              <dt>Method</dt>
              <dd>{selected.method}</dd>
              <dt>Resolution</dt>
              <dd>{selected.resolution}</dd>
              <dt>Model content</dt>
              <dd>{selected.count}</dd>
            </dl>
            <Button
              primary
              onClick={() => openWorkspace("molecules", { pdb: selected.id })}
            >
              <ExternalLink /> Open in viewer
            </Button>
            <Button onClick={save}>
              {saved.includes(selected.id)
                ? "Remove from collection"
                : "Save to collection"}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

const LESSONS = [
  "Nucleotide anatomy",
  "DNA double helix",
  "Base pairing",
  "Major and minor grooves",
  "A/B/Z DNA",
  "RNA structures",
  "Replication",
  "Transcription",
  "Translation",
  "Mutations",
  "Epigenetics",
  "Sequencing",
];
export function LearnPage() {
  const [lesson, setLesson] = useState(3);
  const [step, setStep] = useState(1);
  const [detailTab, setDetailTab] = useState("Explanation");
  const structure =
    lesson === 4 ? STRUCTURES[1] : lesson === 5 ? STRUCTURES[4] : STRUCTURES[0];
  return (
    <div className="nae-page learn-page">
      <Header
        title="Learn"
        description="Interactive lessons linked to live molecular evidence."
      />
      <div className="nae-learn-layout">
        <Panel className="nae-lesson-list">
          {LESSONS.map((x, i) => (
            <button
              className={lesson === i ? "active" : ""}
              onClick={() => {
                setLesson(i);
                setStep(0);
              }}
              key={x}
            >
              <span>{i + 1}</span>
              {x}
            </button>
          ))}
        </Panel>
        <Panel className="nae-lesson-view">
          <div className="nae-view-title">
            <span>{LESSONS[lesson]}</span>
            <small>
              PDB {structure.id} · step {step + 1} of 4
            </small>
          </div>
          <MolecularViewer
            pdbId={structure.id}
            source={localSource(structure)}
            representation={lesson === 3 ? "Surface" : "Ball & stick"}
            focusResidue={step === 0 ? undefined : step + 3}
            focusOnSelection={step > 0}
          />
          <div className="nae-focus-note">
            <Focus /> Viewer focus:{" "}
            {
              [
                "whole polymer",
                "selected nucleotides",
                "base-pair contacts",
                "groove surface",
              ][step]
            }
          </div>
        </Panel>
        <Panel className="nae-lesson-explain">
          <div className="nae-tabs">
            {["Explanation", "Structure details"].map((tab) => (
              <button key={tab} className={detailTab === tab ? "active" : ""} onClick={() => setDetailTab(tab)}>{tab}</button>
            ))}
          </div>
          <div className="nae-inspector-body">
            {detailTab === "Explanation" && <>
            <p className="nae-eyebrow">
              LESSON {lesson + 1} · STEP {step + 1}
            </p>
            <h2>{LESSONS[lesson]}</h2>
            <p>
              {lesson === 3
                ? "The unequal major and minor grooves arise from the asymmetric attachment of each base pair to the sugar–phosphate backbones. Protein recognition commonly reads exposed base-edge chemistry in the major groove."
                : "Use the live structure to connect molecular geometry with sequence and function."}
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Evidence source</th>
                  <td>PDB {structure.id}</td>
                </tr>
                <tr>
                  <th>Current focus</th>
                  <td>
                    {
                      [
                        "Whole structure",
                        "Residues A4 and T21",
                        "Watson–Crick contacts",
                        "Molecular surface",
                      ][step]
                    }
                  </td>
                </tr>
                <tr>
                  <th>Task</th>
                  <td>
                    {
                      [
                        "Orient the helix",
                        "Select a residue",
                        "Inspect hydrogen bonds",
                        "Compare groove widths",
                      ][step]
                    }
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="nae-callout">
              Mol* selection and measurement tools remain active throughout the
              lesson.
            </div>
            </>}
            {detailTab === "Structure details" && <>
              <p className="nae-eyebrow">EXPERIMENTAL EVIDENCE</p>
              <h2>PDB {structure.id}</h2>
              <dl><dt>Structure</dt><dd>{structure.name}</dd><dt>Method</dt><dd>{structure.method}</dd><dt>Resolution</dt><dd>{structure.resolution}</dd><dt>Current residue focus</dt><dd>{step === 0 ? "Whole polymer" : `Author residue ${step + 3}`}</dd><dt>Coordinate source</dt><dd>{structure.cached ? "Local RCSB mmCIF cache" : "RCSB PDB"}</dd></dl>
            </>}
          </div>
        </Panel>
        <div className="nae-lesson-footer">
          <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft /> Back
          </Button>
          {[
            "Orient structure",
            "Identify residues",
            "Inspect contacts",
            "Measure geometry",
          ].map((x, i) => (
            <button
              className={step === i ? "active" : ""}
              onClick={() => setStep(i)}
              key={x}
            >
              <span>{i + 1}</span>
              {x}
            </button>
          ))}
          <Button
            primary
            disabled={step === 3}
            onClick={() => setStep((s) => s + 1)}
          >
            Next <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

const QUESTIONS = [
  {
    type: "Identify a base",
    q: "Which purine forms three Watson–Crick hydrogen bonds with cytosine?",
    options: ["Adenine", "Guanine", "Uracil"],
    answer: 1,
    why: "Guanine exposes the donor–acceptor pattern that forms three canonical hydrogen bonds with cytosine.",
    pdb: "1BNA", residue: 4,
  },
  {
    type: "Identify an atom",
    q: "Which sugar atom supplies the hydroxyl used to extend a nucleic-acid strand?",
    options: ["C1′", "O3′", "O4′"],
    answer: 1,
    why: "The terminal 3′-hydroxyl attacks the incoming nucleotide triphosphate during polymerization.",
    pdb: "1BNA", residue: 4,
  },
  {
    type: "5′/3′ orientation",
    q: "DNA polymerases extend a strand in which direction?",
    options: ["5′→3′", "3′→5′", "Either direction"],
    answer: 0,
    why: "The 3′-OH attacks the incoming dNTP, so synthesis proceeds 5′→3′.",
    pdb: "2HNH", residue: 12,
  },
  {
    type: "Groove recognition",
    q: "Which groove is typically wider in B-DNA?",
    options: ["Major groove", "Minor groove", "Both are equal"],
    answer: 0,
    why: "B-DNA has a broad major groove and a narrower minor groove.",
    pdb: "1BNA", residue: 6,
  },
  {
    type: "Complementary strand",
    q: "What is the antiparallel complement of 5′-AGTC-3′?",
    options: ["3′-TCAG-5′", "3′-UCAG-5′", "5′-TCAG-3′"],
    answer: 0,
    why: "DNA base pairing is antiparallel: A pairs with T and G pairs with C.",
    pdb: "1BNA", residue: 5,
  },
  {
    type: "RNA transcript",
    q: "Which RNA is synthesized from the template 3′-TACG-5′?",
    options: ["5′-AUGC-3′", "5′-TACG-3′", "3′-AUGC-5′"],
    answer: 0,
    why: "RNA polymerase reads the template 3′→5′ and synthesizes complementary RNA 5′→3′, using U instead of T.",
    pdb: "6ALH", residue: 2,
  },
  {
    type: "Mutation analysis",
    q: "Changing coding-strand ATG to AAG produces which mutation?",
    options: ["Missense", "Silent", "Frameshift"],
    answer: 0,
    why: "ATG encodes methionine and AAG encodes lysine; a single-base substitution changes the amino acid.",
    pdb: "1BNA", residue: 4,
  },
  {
    type: "Restriction-site detection",
    q: "Which sequence is recognized by EcoRI?",
    options: ["GAATTC", "GGATCC", "AAGCTT"],
    answer: 0,
    why: "EcoRI recognizes the palindromic hexamer 5′-GAATTC-3′ and cleaves between G and A.",
    pdb: "1BNA", residue: 5,
  },
  {
    type: "Molecular structure",
    q: "Which structure is left-handed?",
    options: ["A-DNA", "B-DNA", "Z-DNA"],
    answer: 2,
    why: "Z-DNA adopts a left-handed zig-zag backbone.",
    pdb: "4OCB", residue: 4,
  },
];
export function QuizzesPage() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState([]);
  const q = QUESTIONS[index];
  const submit = () => {
    if (choice === null) return;
    setSubmitted(true);
    if (choice === q.answer) setScore((s) => s + 1);
    setAttempts((a) => [...a, { index, correct: choice === q.answer }]);
  };
  const next = () => {
    setIndex((i) => (i + 1) % QUESTIONS.length);
    setChoice(null);
    setSubmitted(false);
  };
  return (
    <div className="nae-page quiz-page">
      <Header
        title="Structural Biology Assessment"
        description="Objective questions grounded in real molecular structures."
      />
      <div className="nae-quiz-layout">
        <Panel className="nae-quiz-main">
          <div className="nae-progress-row">
            <strong>
              Question {index + 1} of {QUESTIONS.length}
            </strong>
            <progress value={index + 1} max={QUESTIONS.length} />
            <span>{Math.round(((index + 1) / QUESTIONS.length) * 100)}%</span>
          </div>
          <div className="nae-question">
            <p className="nae-eyebrow">{q.type.toUpperCase()}</p>
            <h2>{q.q}</h2>
            <p>Inspect the live B-DNA model before submitting your answer.</p>
          </div>
          <div className="nae-quiz-view">
            <MolecularViewer pdbId={q.pdb} focusResidue={submitted ? q.residue : undefined} focusOnSelection={submitted} />
          </div>
          <div className="nae-answer-row">
            {q.options.map((x, i) => (
              <button
                disabled={submitted}
                className={`${choice === i ? "selected" : ""} ${submitted && i === q.answer ? "correct" : ""} ${submitted && choice === i && i !== q.answer ? "wrong" : ""}`}
                onClick={() => setChoice(i)}
                key={x}
              >
                <span>{String.fromCharCode(65 + i)}</span>
                {x}
              </button>
            ))}
          </div>
          <div className="nae-quiz-actions">
            <Button
              onClick={() => {
                setChoice(null);
                setSubmitted(false);
              }}
            >
              Clear selection
            </Button>
            <Button
              primary
              onClick={submitted ? next : submit}
              disabled={choice === null}
            >
              {submitted ? "Next question" : "Submit answer"}
            </Button>
          </div>
          {submitted && (
            <div
              className={`nae-feedback ${choice === q.answer ? "correct" : "wrong"}`}
            >
              <strong>
                {choice === q.answer ? "Correct" : "Review the evidence"}
              </strong>
              <p>{q.why}</p>
              <p><strong>Your answer:</strong> {q.options[choice]}</p>
              <p><strong>Correct answer:</strong> {q.options[q.answer]}</p>
              <small>
                Viewer evidence: PDB {q.pdb}; residue {q.residue} is focused in the live structure.
              </small>
            </div>
          )}
        </Panel>
        <Panel className="nae-quiz-inspector">
          <div className="nae-inspector-body">
            <p className="nae-eyebrow">ATTEMPT STATUS</p>
            <h2>Nucleic-acid structure basics</h2>
            <dl>
              <dt>Score</dt>
              <dd>
                {score} / {QUESTIONS.length}
              </dd>
              <dt>Answered</dt>
              <dd>{attempts.length}</dd>
              <dt>Evidence</dt>
              <dd>Live Mol* structure</dd>
            </dl>
            <h3>Question navigator</h3>
            <div className="nae-question-nav">
              {QUESTIONS.map((_, i) => (
                <button
                  onClick={() => {
                    setIndex(i);
                    setChoice(null);
                    setSubmitted(false);
                  }}
                  className={`${i === index ? "active" : ""} ${attempts.find((a) => a.index === i)?.correct ? "correct" : ""}`}
                  key={i}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <h3>Assessment method</h3>
            <ul>
              <li>Submitted answer retained in attempt history</li>
              <li>Correct answer shown after submission</li>
              <li>Scientific explanation cites structural evidence</li>
              <li>No reward animation or game scoring</li>
            </ul>
            <h3>Attempt history</h3>
            {attempts.length ? <ol className="nae-attempt-list">{attempts.slice(-6).map((attempt, i) => <li key={`${attempt.index}-${i}`}>Question {attempt.index + 1}: {attempt.correct ? "correct" : "reviewed"}</li>)}</ol> : <p>No submitted answers yet.</p>}
          </div>
        </Panel>
      </div>
    </div>
  );
}

export default function WorkspaceRouter({ route, acid, setAcid }) {
  switch (route) {
    case "molecules":
      return <MoleculesPage />;
    case "nucleotide-builder":
      return <BuilderPage acid={acid} setAcid={setAcid} />;
    case "sequences":
      return <SequencesPage acid={acid} />;
    case "replication":
      return <ReplicationPage />;
    case "transcription":
      return <TranscriptionPage />;
    case "comparative":
      return <ComparativePage />;
    case "gallery":
      return <GalleryPage />;
    case "learn":
      return <LearnPage />;
    case "quizzes":
      return <QuizzesPage />;
    default:
      return null;
  }
}
