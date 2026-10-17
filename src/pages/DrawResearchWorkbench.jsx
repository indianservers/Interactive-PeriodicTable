import { useEffect, useRef, useState } from "react";
import {
  Search,
  Download,
  Plus,
  ArrowRight,
  Check,
  AlertCircle,
  FlaskConical,
  BookOpen,
  Trash2,
  FolderOpen,
} from "lucide-react";
import { getRDKit } from "../modules/drug-discovery/rdkitService.js";
import {
  analyzeMolecule,
  batchAnalyze,
  compareMolecules,
  csvText,
  substructure,
  isotopeEnvelope,
  solutionAmounts,
  dilution,
  measureGeometry,
  validateNotebook,
} from "../utils/drawResearch.js";
import { templates } from "../utils/structureDrawLibrary.js";
import { downloadBlob } from "../utils/labExports.js";
import DrawMoleculePreview from "./DrawMoleculePreview.jsx";
import "./drawResearch.css";
const exportText = (text, file, type = "text/plain") =>
  downloadBlob(new Blob([text], { type }), file);
const format = (v, n = 3) =>
  typeof v === "number" ? v.toFixed(n) : (v ?? "—");
function Metric({ label, value, detail }) {
  return (
    <div className="dr-metric">
      <small>{label}</small>
      <strong>{value}</strong>
      {detail && <span>{detail}</span>}
    </div>
  );
}
function StructureCard({ data, title }) {
  return (
    <div className="dr-structure">
      <h3>{title}</h3>
      <div dangerouslySetInnerHTML={{ __html: data.svg }} />
      <strong>{data.formula}</strong>
      <code>{data.smiles}</code>
    </div>
  );
}
export default function DrawResearchWorkbench({
  active,
  model,
  molfile,
  name,
  smiles,
  onLoad,
  onHighlight,
  onResolve,
  sdfText,
  onNotice,
  databaseSearch,
}) {
  const [analysis, setAnalysis] = useState(null),
    [error, setError] = useState(""),
    [working, setWorking] = useState(false),
    [smarts, setSmarts] = useState("[CX3](=O)[OX2H1]"),
    [matches, setMatches] = useState(null),
    [candidate, setCandidate] = useState(templates[3][1]),
    [comparison, setComparison] = useState(null),
    [batch, setBatch] = useState(
      "CCO\tEthanol\nCC(=O)O\tAcetic acid\ninvalid\tInvalid example",
    ),
    [rows, setRows] = useState([]),
    [mass, setMass] = useState("10"),
    [volume, setVolume] = useState("100"),
    [stock, setStock] = useState("100"),
    [target, setTarget] = useState("10"),
    [finalVolume, setFinalVolume] = useState("25"),
    [title, setTitle] = useState(""),
    [notes, setNotes] = useState(""),
    [notebook, setNotebook] = useState(() => {
      try {
        return validateNotebook(
          JSON.parse(localStorage.getItem("chemistry-draw-notebook") || "[]"),
        );
      } catch {
        return [];
      }
    }),
    [databaseQuery, setDatabaseQuery] = useState("aspirin"),
    [databaseType, setDatabaseType] = useState("name"),
    [databaseResult, setDatabaseResult] = useState(null),
    [measureCount, setMeasureCount] = useState(2),
    [measureIds, setMeasureIds] = useState([]),
    [geometry, setGeometry] = useState(null),
    [labStyle, setLabStyle] = useState("Ball & Stick"),
    [labSpin, setLabSpin] = useState(false),
    [labLabels, setLabLabels] = useState(false),
    [background, setBackground] = useState("light");
  useEffect(() => {
    if (databaseSearch) {
      setDatabaseQuery(databaseSearch.query);
      setDatabaseType("name");
    }
  }, [databaseSearch]);
  const workbenchRef = useRef();
  useEffect(() => {
    workbenchRef.current?.scrollTo(0, 0);
  }, [active]);
  const fileRef = useRef(),
    labRef = useRef(),
    request = useRef(0),
    pending = useRef(0);
  useEffect(() => {
    setMatches(null);
    setComparison(null);
  }, [molfile]);
  useEffect(() => {
    setComparison(null);
  }, [candidate]);
  useEffect(() => {
    setRows([]);
  }, [batch]);
  useEffect(() => {
    ++request.current;
    setDatabaseResult(null);
  }, [databaseQuery, databaseType]);
  useEffect(() => {
    if (active === "Draw") return;
    let current = true;
    setError("");
    getRDKit().then((rd) => {
      try {
        const value = analyzeMolecule(rd, molfile);
        if (current) setAnalysis(value);
      } catch (e) {
        if (current) {
          setAnalysis(null);
          setError(e.message);
        }
      }
    });
    return () => {
      current = false;
    };
  }, [molfile, active]);
  useEffect(() => {
    setMeasureIds([]);
    setGeometry(null);
  }, [molfile, name, sdfText]);
  const run = async (fn) => {
    pending.current++;
    setWorking(true);
    setError("");
    try {
      await fn(await getRDKit());
    } catch (e) {
      setError(e.message || "The operation failed.");
    } finally {
      pending.current--;
      setWorking(pending.current > 0);
    }
  };
  const saveNotebook = (next) => {
    try {
      localStorage.setItem("chemistry-draw-notebook", JSON.stringify(next));
      setNotebook(next);
    } catch {
      throw Error(
        "Notebook storage is full or unavailable. Export your notebook to keep a backup.",
      );
    }
  };
  let amounts,
    amountError,
    mixture,
    mixError,
    envelope,
    envelopeError,
    measurement,
    measurementError;
  try {
    if (analysis)
      amounts = solutionAmounts(
        analysis.descriptors.amw,
        Number(mass),
        Number(volume),
      );
  } catch (e) {
    amountError = e.message;
  }
  try {
    mixture = dilution(Number(stock), Number(target), Number(finalVolume));
  } catch (e) {
    mixError = e.message;
  }
  try {
    if (analysis) envelope = isotopeEnvelope(analysis.counts);
  } catch (e) {
    envelopeError = e.message;
  }
  try {
    if (geometry && measureIds.length === measureCount)
      measurement = measureGeometry(geometry.atoms, measureIds);
  } catch (e) {
    measurementError = e.message;
  }
  const requestDatabase = () =>
    run(async (rd) => {
      const sequence = ++request.current;
      setDatabaseResult(null);
      const query = databaseQuery.trim();
      if (!query) throw Error("Enter a name, CID or SMILES.");
      if (databaseType === "cid" && !/^\d+$/.test(query))
        throw Error("A CID contains digits only.");
      const ns =
        databaseType === "smiles"
          ? "smiles"
          : databaseType === "cid"
            ? "cid"
            : "name";
      const base = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/${ns}/${encodeURIComponent(query)}`;
      const response = await fetch(
        `${base}/property/IUPACName,MolecularFormula,MolecularWeight,CanonicalSMILES/JSON`,
        { signal: AbortSignal.timeout(20000) },
      );
      if (!response.ok)
        throw Error(
          response.status === 404
            ? "No PubChem match. Try another name or identifier."
            : `PubChem lookup failed (${response.status}).`,
        );
      const json = await response.json(),
        property = json.PropertyTable?.Properties?.[0];
      if (!property) throw Error("No compound data returned.");
      const cid = property.CID;
      const flat = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=2d`,
        { signal: AbortSignal.timeout(20000) },
      );
      if (!flat.ok) throw Error("The 2D structure is unavailable.");
      const molblock = await flat.text(),
        mol = rd.get_mol(molblock);
      if (!mol) throw Error("The database returned an invalid structure.");
      const clean = rd.get_mol(mol.remove_hs());
      if (!clean) {
        mol.delete();
        throw Error("Cannot normalize the database structure.");
      }
      const canonical = clean.get_smiles(),
        svg = clean.get_svg(450, 230);
      clean.delete();
      mol.delete();
      let conformer = "",
        conformerError = "";
      try {
        const spatial = await fetch(
          `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/SDF?record_type=3d`,
          { signal: AbortSignal.timeout(20000) },
        );
        if (spatial.ok) {
          const block = await spatial.text(),
            m3 = rd.get_mol(block);
          if (m3) {
            let bare;
            try {
              bare = rd.get_mol(m3.remove_hs());
              if (bare?.get_smiles() === canonical) conformer = block;
              else
                conformerError =
                  "3D record differs in stereochemistry; only the validated 2D structure will load.";
            } finally {
              bare?.delete();
              m3.delete();
            }
          }
        } else conformerError = "No 3D conformer is available for this record.";
      } catch {
        conformerError = "3D lookup unavailable; the 2D structure is ready.";
      }
      if (sequence === request.current)
        setDatabaseResult({
          ...property,
          canonical,
          molblock,
          conformer,
          conformerError,
          svg,
        });
    });
  if (active === "Draw") return null;
  return (
    <section
      ref={workbenchRef}
      className="draw-research"
      aria-label={`${active} workspace`}
    >
      <header className="dr-header">
        <div>
          <small>CHEMISTRY UNIVERSE · RESEARCH TOOLS</small>
          <h2>
            {active === "Analysis"
              ? "Molecular intelligence"
              : active === "Compare"
                ? "Compare molecular structures"
                : active === "Batch"
                  ? "Batch structure screening"
                  : active === "Mass Lab"
                    ? "Mass, isotopes & solutions"
                    : active === "3D Lab"
                      ? "Explore & measure in 3D"
                      : active === "Notebook"
                        ? "Your chemistry notebook"
                        : "Search chemical databases"}
          </h2>
          <p>
            {active === "Analysis"
              ? "Validated descriptors, functional groups and searchable chemistry."
              : active === "Compare"
                ? "Compare fingerprints, properties, identity and substructure containment."
                : active === "Batch"
                  ? "Screen up to 200 SMILES records locally. One SMILES per line; optional tab-separated name."
                  : active === "Mass Lab"
                    ? "Calculate from the active molecule. Isotope envelopes use approximate natural abundances."
                    : active === "3D Lab"
                      ? "Pick atoms in the model or use the atom selectors to measure a calculated conformer."
                      : active === "Notebook"
                        ? "Save structures with notes, restore them to the canvas, and keep a portable backup."
                        : "Look up public compounds by name, PubChem CID or SMILES. Searches are sent to PubChem only when you press Search."}
          </p>
        </div>
        <span className="dr-active-name">{name}</span>
      </header>
      {error && (
        <div role="alert" className="dr-error">
          <AlertCircle size={17} />
          {error}
        </div>
      )}
      {working && (
        <p role="status" className="dr-working">
          Working…
        </p>
      )}
      {active === "Analysis" && analysis && (
        <>
          <div className="dr-metrics">
            <Metric label="Formula" value={analysis.formula} />
            <Metric
              label="Molecular weight"
              value={`${format(analysis.descriptors.amw, 2)} g/mol`}
            />
            <Metric
              label="Exact mass"
              value={`${format(analysis.descriptors.exactmw, 5)} Da`}
            />
            <Metric label="Formal charge" value={analysis.charge} />
            <Metric
              label="Topological polar surface"
              value={`${format(analysis.descriptors.tpsa, 2)} Å²`}
            />
            <Metric
              label="Calculated logP"
              value={format(analysis.descriptors.CrippenClogP, 2)}
            />
          </div>
          <div className="dr-columns">
            <section className="dr-card">
              <h3>
                Functional groups <span>{analysis.groups.length} types</span>
              </h3>
              <p>Overlapping substructures may match more than one group.</p>
              <div className="dr-groups">
                {analysis.groups.length ? (
                  analysis.groups.map((g) => (
                    <button
                      key={g.name}
                      onClick={() =>
                        onHighlight(g.atoms, `${g.name}: ${g.count} matches`)
                      }
                    >
                      <span>{g.name}</span>
                      <b>{g.count}</b>
                      <ArrowRight size={14} />
                    </button>
                  ))
                ) : (
                  <p>No groups in this local SMARTS set were detected.</p>
                )}
              </div>
            </section>
            <section className="dr-card">
              <h3>SMARTS substructure search</h3>
              <label>
                SMARTS query
                <input
                  aria-label="SMARTS query"
                  value={smarts}
                  onChange={(e) => {
                    setSmarts(e.target.value);
                    setMatches(null);
                  }}
                />
              </label>
              <div className="dr-inline">
                <button
                  className="dr-primary"
                  disabled={working}
                  onClick={() =>
                    run((rd) => {
                      const match = substructure(rd, molfile, smarts);
                      setMatches(match);
                    })
                  }
                >
                  <Search size={16} />
                  Find substructure
                </button>
                {matches?.count > 0 && (
                  <button
                    onClick={() =>
                      onHighlight(
                        matches.atoms,
                        `${matches.count} SMARTS matches`,
                      )
                    }
                  >
                    Highlight on canvas
                  </button>
                )}
              </div>
              {matches && (
                <p role="status">
                  {matches.count} matches · {matches.atoms.length} unique atoms
                </p>
              )}
              <h3>Lipinski rule-of-five profile</h3>
              <ul className="dr-rules">
                {analysis.rules.map((r) => (
                  <li key={r.label}>
                    <span className={r.pass ? "dr-pass" : "dr-warn"}>
                      {r.pass ? <Check size={16} /> : <AlertCircle size={16} />}
                    </span>
                    {r.label}
                    <b>{format(r.value, 2)}</b>
                  </li>
                ))}
              </ul>
              <p className="dr-footnote">
                A screening heuristic; passing does not establish efficacy,
                safety or bioavailability.
              </p>
            </section>
          </div>
          <section className="dr-card">
            <h3>Identifiers & structure report</h3>
            <dl className="dr-identifiers">
              <dt>Canonical isomeric SMILES</dt>
              <dd>{analysis.smiles}</dd>
              <dt>InChI</dt>
              <dd>{analysis.inchi || "Unavailable"}</dd>
              <dt>InChIKey</dt>
              <dd>{analysis.inchikey || "Unavailable"}</dd>
              <dt>Graph</dt>
              <dd>
                {analysis.atomCount} explicit atoms · {analysis.bondCount} bonds
                · {analysis.descriptors.NumRings ?? "—"} rings ·{" "}
                {analysis.descriptors.NumRotatableBonds ?? "—"} rotatable bonds
              </dd>
            </dl>
            <button
              onClick={() =>
                exportText(
                  JSON.stringify(
                    { ...analysis, fingerprint: undefined, svg: undefined },
                    null,
                    2,
                  ),
                  `${name}-analysis.json`,
                  "application/json",
                )
              }
            >
              <Download size={16} />
              Export analysis JSON
            </button>
          </section>
        </>
      )}
      {active === "Compare" && (
        <>
          <section className="dr-card">
            <label>
              Comparison molecule (SMILES)
              <input
                aria-label="Comparison SMILES"
                value={candidate}
                onChange={(e) => setCandidate(e.target.value)}
              />
            </label>
            <div className="dr-inline">
              <select
                aria-label="Comparison template"
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value) setCandidate(e.target.value);
                }}
              >
                <option value="">Choose a template</option>
                {templates.map(([n, v]) => (
                  <option key={n} value={v}>
                    {n}
                  </option>
                ))}
              </select>
              <button
                className="dr-primary"
                disabled={working}
                onClick={() =>
                  run((rd) =>
                    setComparison(compareMolecules(rd, molfile, candidate)),
                  )
                }
              >
                Compare molecules
              </button>
            </div>
          </section>
          {comparison && (
            <>
              <div className="dr-metrics">
                <Metric
                  label="Morgan fingerprint similarity"
                  value={`${(comparison.similarity * 100).toFixed(1)}%`}
                  detail="Tanimoto · default RDKit Morgan fingerprint"
                />
                <Metric
                  label="Canonical identity"
                  value={comparison.same ? "Identical" : "Different"}
                />
                <Metric
                  label="Active contains comparison"
                  value={comparison.leftContainsRight ? "Yes" : "No"}
                />
                <Metric
                  label="Comparison contains active"
                  value={comparison.rightContainsLeft ? "Yes" : "No"}
                />
              </div>
              <div className="dr-columns">
                <StructureCard data={comparison.left} title="Active molecule" />
                <StructureCard
                  data={comparison.right}
                  title="Comparison molecule"
                />
              </div>
              <section className="dr-card">
                <h3>Property differences</h3>
                <p>
                  Fingerprint and substructure comparisons ignore
                  stereochemistry; canonical identity includes it.
                </p>
                <table>
                  <thead>
                    <tr>
                      <th>Property</th>
                      <th>Active</th>
                      <th>Comparison</th>
                      <th>Δ comparison − active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Molecular weight", "amw"],
                      ["Calculated logP", "CrippenClogP"],
                      ["TPSA", "tpsa"],
                      ["H-bond donors", "NumHBD"],
                      ["H-bond acceptors", "NumHBA"],
                      ["Rotatable bonds", "NumRotatableBonds"],
                    ].map(([label, k]) => (
                      <tr key={k}>
                        <td>{label}</td>
                        <td>{format(comparison.left.descriptors[k])}</td>
                        <td>{format(comparison.right.descriptors[k])}</td>
                        <td>
                          {format(
                            comparison.right.descriptors[k] -
                              comparison.left.descriptors[k],
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  onClick={() =>
                    exportText(
                      JSON.stringify(comparison, null, 2),
                      "molecule-comparison.json",
                      "application/json",
                    )
                  }
                >
                  <Download size={16} />
                  Export comparison
                </button>
              </section>
            </>
          )}
        </>
      )}
      {active === "Batch" && (
        <>
          <section className="dr-card">
            <label>
              SMILES batch
              <textarea
                aria-label="Batch SMILES"
                rows={6}
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                spellCheck={false}
              />
            </label>
            <div className="dr-inline">
              <button
                className="dr-primary"
                disabled={working || !batch.trim()}
                onClick={() => run((rd) => setRows(batchAnalyze(rd, batch)))}
              >
                Analyze batch
              </button>
              <button
                disabled={!rows.length}
                onClick={() =>
                  exportText(csvText(rows), "batch-analysis.csv", "text/csv")
                }
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </section>
          {rows.length > 0 && (
            <section className="dr-card">
              <h3>
                {rows.filter((r) => r.status === "Valid").length} valid ·{" "}
                {rows.filter((r) => r.status === "Invalid").length} invalid
              </h3>
              <div className="dr-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {[
                        "Name",
                        "Formula",
                        "MW",
                        "cLogP",
                        "TPSA",
                        "HBD",
                        "HBA",
                        "RO5 violations",
                        "Status",
                        "Open",
                      ].map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={i}>
                        <td title={r.input}>{r.name}</td>
                        <td>{r.formula || "—"}</td>
                        <td>{format(r.mw, 2)}</td>
                        <td>{format(r.logP, 2)}</td>
                        <td>{format(r.tpsa, 2)}</td>
                        <td>{r.hbd ?? "—"}</td>
                        <td>{r.hba ?? "—"}</td>
                        <td>{r.violations ?? "—"}</td>
                        <td
                          title={r.error}
                          className={
                            r.status === "Valid"
                              ? "dr-pass-text"
                              : "dr-error-text"
                          }
                        >
                          {r.status}
                        </td>
                        <td>
                          <button
                            disabled={r.status !== "Valid"}
                            onClick={() => onLoad(r.smiles, r.name)}
                          >
                            Open drawing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
      {active === "Mass Lab" && analysis && (
        <>
          <div className="dr-columns">
            <section className="dr-card">
              <h3>Mass → amount → concentration</h3>
              <p>
                Using {analysis.formula}, MW{" "}
                {format(analysis.descriptors.amw, 3)} g/mol.
              </p>
              <label>
                Solute mass (mg)
                <input
                  type="number"
                  min="0"
                  aria-label="Solute mass mg"
                  value={mass}
                  onChange={(e) => setMass(e.target.value)}
                />
              </label>
              <label>
                Final solution volume (mL)
                <input
                  type="number"
                  min="0"
                  aria-label="Solution volume mL"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </label>
              {amountError ? (
                <p role="alert">{amountError}</p>
              ) : (
                amounts && (
                  <div className="dr-metrics">
                    <Metric
                      label="Amount"
                      value={`${format(amounts.mmol, 5)} mmol`}
                    />
                    <Metric
                      label="Concentration"
                      value={`${format(amounts.millimolar, 5)} mM`}
                    />
                  </div>
                )
              )}
              <p className="dr-footnote">
                Use final solution volume, not the volume of solvent added.
              </p>
            </section>
            <section className="dr-card">
              <h3>Dilution calculator</h3>
              <p>C₁V₁ = C₂V₂</p>
              <label>
                Stock concentration (mM)
                <input
                  type="number"
                  aria-label="Stock concentration mM"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </label>
              <label>
                Target concentration (mM)
                <input
                  type="number"
                  aria-label="Target concentration mM"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                />
              </label>
              <label>
                Final volume (mL)
                <input
                  type="number"
                  aria-label="Dilution final volume mL"
                  value={finalVolume}
                  onChange={(e) => setFinalVolume(e.target.value)}
                />
              </label>
              {mixError ? (
                <p role="alert">{mixError}</p>
              ) : (
                mixture && (
                  <p className="dr-result">
                    Use <b>{format(mixture.stockMl, 4)} mL</b> of stock; bring
                    to <b>{finalVolume} mL</b> final volume. Approximate diluent
                    volume: {format(mixture.solventMl, 4)} mL.
                  </p>
                )
              )}
            </section>
          </div>
          <section className="dr-card">
            <h3>Natural isotope envelope · {analysis.formula}</h3>
            <p>
              Nominal M+n distribution. Relative intensity is normalized to the
              largest displayed peak. This is a calculated abundance pattern,
              not an experimental or fragmentation mass spectrum.
            </p>
            {envelopeError ? (
              <p role="alert">{envelopeError}</p>
            ) : (
              envelope && (
                <>
                  <div
                    className="dr-isotopes"
                    role="img"
                    aria-label={`Calculated isotope pattern for ${analysis.formula}`}
                  >
                    {envelope.map((p) => (
                      <div key={p.offset}>
                        <span>{p.relative.toFixed(2)}%</span>
                        <i
                          style={{ height: `${Math.max(0.5, p.relative)}%` }}
                        />
                        <b>{p.offset ? `M+${p.offset}` : "M"}</b>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      exportText(
                        csvText(envelope),
                        "isotope-envelope.csv",
                        "text/csv",
                      )
                    }
                  >
                    <Download size={16} />
                    Export isotope CSV
                  </button>
                </>
              )
            )}
          </section>
        </>
      )}
      {active === "3D Lab" && (
        <>
          <div className="dr-columns dr-lab-grid">
            <section className="dr-lab-view">
              <DrawMoleculePreview
                ref={labRef}
                model={model}
                name={name}
                sdfText={sdfText}
                representation={labStyle}
                spin={labSpin}
                atomLabels={labLabels}
                background={background}
                selectedAtomIds={measureIds}
                onGeometry={setGeometry}
                onAtomPick={(id) =>
                  setMeasureIds((ids) =>
                    ids.length >= measureCount
                      ? [id]
                      : ids.includes(id)
                        ? ids
                        : [...ids, id],
                  )
                }
              />
              <div className="dr-lab-view-tools">
                <button onClick={() => labRef.current?.reset()}>Reset</button>
                <button
                  aria-pressed={labSpin}
                  onClick={() => setLabSpin((v) => !v)}
                >
                  Spin
                </button>
                <button
                  disabled={!geometry}
                  onClick={async () => {
                    try {
                      const png = labRef.current?.snapshot();
                      if (!png) throw Error("The 3D viewer is still loading.");
                      const blob = await (await fetch(png)).blob();
                      downloadBlob(blob, `${name}-3d.png`);
                    } catch (e) {
                      setError(e.message);
                    }
                  }}
                >
                  Export 3D PNG
                </button>
              </div>
            </section>
            <section className="dr-card">
              <h3>Conformer measurements</h3>
              <p>
                {geometry?.is3D
                  ? "Coordinates from a calculated conformer. Values describe this conformer, not an experimental measurement."
                  : "Planar drawing coordinates are available only for viewing. Load a bundled molecule or a validated PubChem conformer for physical measurements."}
              </p>
              <label>
                Measurement
                <select
                  aria-label="Measurement type"
                  value={measureCount}
                  onChange={(e) => {
                    setMeasureCount(Number(e.target.value));
                    setMeasureIds([]);
                  }}
                >
                  <option value={2}>Distance · 2 atoms</option>
                  <option value={3}>Angle · 3 atoms</option>
                  <option value={4}>Dihedral · 4 atoms</option>
                </select>
              </label>
              {Array.from({ length: measureCount }, (_, i) => (
                <label key={i}>
                  Atom {i + 1}
                  <select
                    aria-label={`Measurement atom ${i + 1}`}
                    value={measureIds[i] || ""}
                    onChange={(e) =>
                      setMeasureIds((ids) => {
                        const next = [...ids];
                        next[i] = Number(e.target.value);
                        return next;
                      })
                    }
                  >
                    <option value="">Select atom</option>
                    {geometry?.atoms.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.id} · {a.element}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              {geometry?.is3D && measurement ? (
                <output className="dr-measure-output">
                  {measurement.label}: {measurement.value.toFixed(3)}{" "}
                  {measurement.unit}
                </output>
              ) : measurementError ? (
                <p role="alert">{measurementError}</p>
              ) : (
                <p>Choose {measureCount} distinct atoms.</p>
              )}
              <button onClick={() => setMeasureIds([])}>Clear selection</button>
              <label>
                Representation
                <select
                  aria-label="Lab representation"
                  value={labStyle}
                  onChange={(e) => setLabStyle(e.target.value)}
                >
                  {["Ball & Stick", "Space Fill", "Sticks", "Wireframe"].map(
                    (r) => (
                      <option key={r}>{r}</option>
                    ),
                  )}
                </select>
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={labLabels}
                  onChange={(e) => setLabLabels(e.target.checked)}
                />
                Atom numbers and elements
              </label>
              <label>
                Background
                <select
                  value={background}
                  onChange={(e) => setBackground(e.target.value)}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </label>
            </section>
          </div>
        </>
      )}
      {active === "Notebook" && (
        <>
          <section className="dr-card">
            <h3>Save the active molecule</h3>
            <label>
              Entry title
              <input
                aria-label="Notebook title"
                placeholder={name}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label>
              Notes
              <textarea
                aria-label="Notebook notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Record observations, assumptions, or next steps…"
              />
            </label>
            <div className="dr-inline">
              <button
                className="dr-primary"
                disabled={!smiles || notebook.length >= 100}
                onClick={() =>
                  run(() => {
                    const entry = {
                      id: crypto.randomUUID(),
                      title: title.trim() || name,
                      smiles,
                      notes,
                      createdAt: new Date().toISOString(),
                    };
                    saveNotebook([entry, ...notebook]);
                    setTitle("");
                    setNotes("");
                    onNotice("Structure and notes saved to notebook.");
                  })
                }
              >
                <Plus size={16} />
                Save notebook entry
              </button>
              <button
                disabled={!notebook.length}
                onClick={() =>
                  exportText(
                    JSON.stringify(notebook, null, 2),
                    "chemistry-notebook.json",
                    "application/json",
                  )
                }
              >
                <Download size={16} />
                Export notebook
              </button>
              <button onClick={() => fileRef.current?.click()}>
                <FolderOpen size={16} />
                Import notebook
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json,application/json"
                hidden
                aria-label="Notebook import file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  run(async (rd) => {
                    if (file.size > 2e6)
                      throw Error("Notebook file must be smaller than 2 MB.");
                    const imported = validateNotebook(
                      JSON.parse(await file.text()),
                    );
                    for (const entry of imported) {
                      const mol = rd.get_mol(entry.smiles);
                      if (!mol)
                        throw Error(`Invalid structure in ${entry.title}`);
                      mol.delete();
                    }
                    saveNotebook(
                      validateNotebook([
                        ...imported.map((e) => ({
                          ...e,
                          id: crypto.randomUUID(),
                        })),
                        ...notebook,
                      ]),
                    );
                  });
                  e.target.value = "";
                }}
              />
            </div>
          </section>
          <div className="dr-notebook">
            {notebook.map((entry) => (
              <article className="dr-card" key={entry.id}>
                <div className="dr-entry-heading">
                  <h3>{entry.title}</h3>
                  <time>{new Date(entry.createdAt).toLocaleDateString()}</time>
                </div>
                <code>{entry.smiles}</code>
                <p className="dr-note-text">{entry.notes || "No notes."}</p>
                <div className="dr-inline">
                  <button onClick={() => onLoad(entry.smiles, entry.title)}>
                    Restore to drawing
                  </button>
                  <button
                    aria-label={`Delete notebook entry ${entry.title}`}
                    onClick={() =>
                      run(() =>
                        saveNotebook(notebook.filter((e) => e.id !== entry.id)),
                      )
                    }
                  >
                    <Trash2 size={15} />
                    Delete entry
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!notebook.length && (
            <div className="dr-empty">
              <BookOpen size={35} />
              <p>No entries yet. Save the active molecule with a note.</p>
            </div>
          )}
        </>
      )}
      {active === "Database" && (
        <>
          <section className="dr-card">
            <div className="dr-database-search">
              <select
                aria-label="Database search type"
                value={databaseType}
                onChange={(e) => setDatabaseType(e.target.value)}
              >
                <option value="name">Name / IUPAC name</option>
                <option value="cid">PubChem CID</option>
                <option value="smiles">SMILES</option>
              </select>
              <input
                aria-label="Database query"
                value={databaseQuery}
                onChange={(e) => setDatabaseQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !working) requestDatabase();
                }}
              />
              <button
                className="dr-primary"
                disabled={working}
                onClick={requestDatabase}
              >
                <Search size={17} />
                Search PubChem
              </button>
            </div>
            <p>
              Requires internet access. The search term is sent to the public
              PubChem service. Local analysis, comparison, batch processing and
              notebooks work without this lookup.
            </p>
          </section>
          {databaseResult && (
            <section className="dr-card">
              <div className="dr-columns">
                <div
                  className="dr-structure"
                  dangerouslySetInnerHTML={{ __html: databaseResult.svg }}
                />
                <div>
                  <h3>PubChem CID {databaseResult.CID}</h3>
                  <p>{databaseResult.IUPACName}</p>
                  <p>
                    <strong>{databaseResult.MolecularFormula}</strong> ·{" "}
                    {databaseResult.MolecularWeight} g/mol
                  </p>
                  <code>{databaseResult.canonical}</code>
                  <p>
                    {databaseResult.conformer
                      ? "Validated 3D conformer available."
                      : databaseResult.conformerError}
                  </p>
                  <div className="dr-inline">
                    <button
                      className="dr-primary"
                      onClick={() => onResolve(databaseResult)}
                    >
                      Load validated structure
                    </button>
                    <a
                      href={`https://pubchem.ncbi.nlm.nih.gov/compound/${databaseResult.CID}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View PubChem source ↗
                    </a>
                  </div>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </section>
  );
}
