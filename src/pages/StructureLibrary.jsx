import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Star,
  ArrowLeft,
  ArrowRight,
  Box,
  Plus,
  Download,
  Upload,
  Info,
  X,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { getRDKit } from "../modules/drug-discovery/rdkitService.js";
import {
  loadStructureLibrary,
  featuredLibrary,
  filterLibrary,
  mergePersonalLibrary,
  personalLibraryEntry,
  readPersonalLibrary,
  parseLibraryImport,
  PERSONAL_LIBRARY_KEY,
  LIBRARY_FAVORITES_KEY,
} from "../utils/expandedStructureLibrary.js";
import { csvText } from "../utils/drawResearch.js";
import { downloadBlob } from "../utils/labExports.js";
import "./structureLibrary.css";
const svgCache = new Map(),
  PAGE_SIZE = 24;
function readFavorites() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem(LIBRARY_FAVORITES_KEY) || "[]"),
    );
  } catch {
    return new Set();
  }
}
const exportFile = (data, name, type) =>
  downloadBlob(new Blob([data], { type }), name);
export default function StructureLibrary({
  currentName,
  currentMolfile,
  onLoad,
  onDatabase,
}) {
  const [catalogue, setCatalogue] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("All"),
    [favoritesOnly, setFavoritesOnly] = useState(false),
    [favorites, setFavorites] = useState(readFavorites),
    [personal, setPersonal] = useState(readPersonalLibrary),
    [minMw, setMinMw] = useState(""),
    [maxMw, setMaxMw] = useState(""),
    [sort, setSort] = useState("featured"),
    [page, setPage] = useState(1),
    [svgs, setSvgs] = useState({}),
    [detail, setDetail] = useState(null),
    [opening, setOpening] = useState(""),
    [adding, setAdding] = useState(false),
    [entryName, setEntryName] = useState(currentName || ""),
    [message, setMessage] = useState("");
  const importRef = useRef(),
    gridRef = useRef();
  const refresh = () => {
    setLoading(true);
    setError("");
    loadStructureLibrary()
      .then(setCatalogue)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, []);
  const entries = useMemo(
    () => mergePersonalLibrary(catalogue?.entries || featuredLibrary, personal),
    [catalogue, personal],
  );
  const filtered = useMemo(
    () =>
      filterLibrary(entries, {
        query,
        category,
        favoritesOnly,
        favorites,
        minMw,
        maxMw,
        sort,
      }),
    [entries, query, category, favoritesOnly, favorites, minMw, maxMw, sort],
  );
  const categories = useMemo(() => {
    const counts = { All: entries.length };
    for (const e of entries)
      for (const tag of e.tags) counts[tag] = (counts[tag] || 0) + 1;
    return counts;
  }, [entries]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)),
    safePage = Math.min(page, totalPages),
    visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    visibleKey = visible.map((e) => e.id).join("|");
  useEffect(() => {
    setPage(1);
  }, [query, category, favoritesOnly, minMw, maxMw, sort]);
  useEffect(() => {
    gridRef.current?.scrollTo(0, 0);
  }, [safePage, query, category, favoritesOnly]);
  useEffect(() => {
    let active = true;
    getRDKit()
      .then(async (rd) => {
        const next = {};
        for (let i = 0; i < visible.length; i++) {
          if (!active) return;
          const e = visible[i];
          let svg = svgCache.get(e.smiles);
          if (!svg) {
            let mol;
            try {
              mol = rd.get_mol(e.smiles);
              if (mol) svg = mol.get_svg(250, 150);
            } finally {
              mol?.delete();
            }
            if (svg) {
              svgCache.set(e.smiles, svg);
              if (svgCache.size > 256)
                svgCache.delete(svgCache.keys().next().value);
            }
          }
          next[e.id] = svg || "";
          if (i % 8 === 7)
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }
        if (active) setSvgs(next);
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [visibleKey]);
  function favorite(entry) {
    try {
      const next = new Set(favorites);
      next.has(entry.smiles)
        ? next.delete(entry.smiles)
        : next.add(entry.smiles);
      localStorage.setItem(LIBRARY_FAVORITES_KEY, JSON.stringify([...next]));
      setFavorites(next);
    } catch {
      setError(
        "Favorites could not be saved. Your browser storage may be full.",
      );
    }
  }
  function savePersonal(next) {
    if (next.length > 3000)
      throw Error(
        "Your collection supports up to 3,000 entries. Export a backup before adding another collection.",
      );
    localStorage.setItem(PERSONAL_LIBRARY_KEY, JSON.stringify(next));
    setPersonal(next);
    window.dispatchEvent(new Event("chemistry-library-changed"));
  }
  async function addCurrent() {
    setError("");
    try {
      const rd = await getRDKit(),
        entry = personalLibraryEntry(rd, {
          name: entryName,
          smiles: currentMolfile,
        }),
        next = personal.filter((e) => e.smiles !== entry.smiles);
      savePersonal([entry, ...next]);
      setAdding(false);
      setFavoritesOnly(false);
      setCategory("My collection");
      setQuery("");
      setMessage("Current molecule saved to your collection.");
    } catch (e) {
      setError(e.message);
    }
  }
  async function importFile(file) {
    setError("");
    setOpening("import");
    try {
      const fileText = await file.text();
      const records = parseLibraryImport(fileText, file.name),
        rd = await getRDKit(),
        valid = [],
        invalid = [];
      for (let i = 0; i < records.length; i++) {
        try {
          valid.push(personalLibraryEntry(rd, records[i]));
        } catch (e) {
          invalid.push({ row: i + 1, name: records[i].name, error: e.message });
        }
        if (i % 20 === 19)
          await new Promise((resolve) => requestAnimationFrame(resolve));
      }
      const map = new Map(personal.map((e) => [e.smiles, e]));
      valid.forEach((e) => map.set(e.smiles, e));
      savePersonal([...map.values()]);
      if (file.name.toLowerCase().endsWith(".json")) {
        const backup = JSON.parse(fileText);
        if (Array.isArray(backup.favoriteSmiles)) {
          const known = new Set([...entries, ...valid].map((e) => e.smiles));
          const restored = new Set([
            ...favorites,
            ...backup.favoriteSmiles.filter((s) => known.has(s)),
          ]);
          localStorage.setItem(
            LIBRARY_FAVORITES_KEY,
            JSON.stringify([...restored]),
          );
          setFavorites(restored);
        }
      }
      setCategory("My collection");
      setFavoritesOnly(false);
      setQuery("");
      setMessage(
        `${valid.length} valid records imported; ${invalid.length} rejected${invalid.length ? ` (first error: row ${invalid[0].row}: ${invalid[0].error})` : ""}.`,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening("");
    }
  }
  async function open(entry, threeD = false) {
    setOpening(entry.id);
    setError("");
    try {
      const success = await onLoad(entry, threeD);
      if (success === false)
        throw Error(
          "Could not load this structure. Check its chemical representation.",
        );
    } catch (e) {
      setError(e.message);
    } finally {
      setOpening("");
    }
  }
  const clear = () => {
    setQuery("");
    setCategory("All");
    setFavoritesOnly(false);
    setMinMw("");
    setMaxMw("");
  };
  return (
    <div className="dl-app">
      <div className="dl-summary">
        <div>
          <strong>{entries.length.toLocaleString()} molecules</strong>
          <span>
            {Object.keys(categories).filter(k=>!["All","My collection"].includes(k)).length} chemistry categories ·
            validated structures · source-linked records
          </span>
        </div>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          aria-pressed={favoritesOnly}
        >
          <Star size={16} />
          {favorites.size} favorites
        </button>
        <button onClick={() => setAdding((v) => !v)}>
          <Plus size={16} />
          Add current molecule
        </button>
        <button onClick={() => importRef.current?.click()}>
          <Upload size={16} />
          Import collection
        </button>
        <input
          ref={importRef}
          type="file"
          accept=".json,.smi,.smiles,.tsv,.txt"
          hidden
          aria-label="Import compound collection"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) importFile(file);
            e.target.value = "";
          }}
        />
      </div>
      <div className="dl-toolbar">
        <div className="dl-search">
          <Search size={19} />
          <input
            autoFocus
            aria-label="Search structure library"
            placeholder="Search name, synonym, formula, CID or SMILES…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              aria-label="Clear library search"
              onClick={() => setQuery("")}
            >
              <X size={15} />
            </button>
          )}
        </div>
        <label>
          MW min
          <input
            aria-label="Minimum molecular weight"
            type="number"
            min="0"
            value={minMw}
            onChange={(e) => setMinMw(e.target.value)}
            placeholder="Any"
          />
        </label>
        <label>
          MW max
          <input
            aria-label="Maximum molecular weight"
            type="number"
            min="0"
            value={maxMw}
            onChange={(e) => setMaxMw(e.target.value)}
            placeholder="Any"
          />
        </label>
        <select
          aria-label="Sort library"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Best match / featured</option>
          <option value="name">Name A–Z</option>
          <option value="mw-asc">Molecular weight ↑</option>
          <option value="mw-desc">Molecular weight ↓</option>
        </select>
      </div>
      {adding && (
        <div className="dl-add">
          <label>
            Collection entry name
            <input
              aria-label="New collection entry name"
              value={entryName}
              onChange={(e) => setEntryName(e.target.value)}
            />
          </label>
          <button onClick={addCurrent}>Save current structure</button>
          <button onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}
      {loading && (
        <div className="dl-message" role="status">
          Loading the complete reference catalogue… Featured structures are
          ready below.
        </div>
      )}
      {error && (
        <div className="dl-error" role="alert">
          {error}
          {!catalogue && (
            <button onClick={refresh}>
              <RefreshCw size={14} />
              Retry loading
            </button>
          )}
        </div>
      )}
      {message && (
        <div className="dl-message" role="status">
          {message}
        </div>
      )}
      <div className={`dl-layout ${detail ? "has-detail" : ""}`}>
        <aside
          className="dl-categories"
          aria-label="Library chemistry categories"
        >
          {[
            "All",
            "Featured",
            "My collection",
            ...Object.keys(categories)
              .filter((k) => !["All", "Featured", "My collection"].includes(k))
              .sort(),
          ].map((tag) => (
            <button
              key={tag}
              aria-pressed={category === tag}
              onClick={() => setCategory(tag)}
            >
              <span>{tag}</span>
              <b>{categories[tag] || 0}</b>
            </button>
          ))}
        </aside>
        <main className="dl-main">
          <div className="dl-result-bar">
            <span>
              {filtered.length.toLocaleString()} matches
              {favoritesOnly ? " · favorites" : ""}
              {category !== "All" ? ` · ${category}` : ""}
            </span>
            <button onClick={clear}>Reset filters</button>
            <button
              disabled={!filtered.length}
              onClick={() =>
                exportFile(
                  csvText(
                    filtered.map((e) => ({
                      name: e.name,
                      formula: e.formula,
                      molecularWeight: e.mw,
                      smiles: e.smiles,
                      categories: e.tags.join("; "),
                      pubchemCID: e.cid || "",
                      source: e.source,
                    })),
                  ),
                  "compound-library-results.csv",
                  "text/csv",
                )
              }
            >
              <Download size={14} />
              Export results CSV
            </button>
          </div>
          <div className="dl-grid" ref={gridRef}>
            {visible.map((entry) => (
              <article className="dl-card" key={entry.id}>
                <button
                  className="dl-favorite"
                  aria-label={`${favorites.has(entry.smiles) ? "Unfavorite" : "Favorite"} ${entry.name}`}
                  aria-pressed={favorites.has(entry.smiles)}
                  onClick={() => favorite(entry)}
                >
                  <Star
                    size={17}
                    fill={favorites.has(entry.smiles) ? "currentColor" : "none"}
                  />
                </button>
                <button
                  className="dl-image"
                  aria-label={`Preview ${entry.name}`}
                  onClick={() => setDetail(entry)}
                >
                  {svgs[entry.id] ? (
                    <span
                      dangerouslySetInnerHTML={{ __html: svgs[entry.id] }}
                    />
                  ) : (
                    <BookOpen size={25} />
                  )}
                </button>
                <h3 title={entry.name}>{entry.name}</h3>
                <div className="dl-properties">
                  <code>{entry.formula || "Reference structure"}</code>
                  <span>{entry.mw ? `${entry.mw.toFixed(2)} g/mol` : ""}</span>
                </div>
                <div className="dl-source">
                  {entry.personal
                    ? "My collection"
                    : entry.tags.includes("Featured")
                      ? "Featured"
                      : entry.cid
                        ? `PubChem CID ${entry.cid}`
                        : entry.source}
                </div>
                <div className="dl-card-actions">
                  <button
                    disabled={Boolean(opening)}
                    onClick={() => open(entry)}
                    aria-label={`Load ${entry.name}`}
                  >
                    {opening === entry.id ? "Loading…" : "Open 2D"}
                  </button>
                  <button
                    disabled={Boolean(opening) || (!entry.cid && !entry.sdf)}
                    title={
                      entry.sdf
                        ? "Bundled calculated conformer"
                        : "Fetch a calculated conformer from PubChem (internet required)"
                    }
                    aria-label={`Load 3D ${entry.name}`}
                    onClick={() => open(entry, true)}
                  >
                    <Box size={14} />
                    3D
                  </button>
                  <button
                    aria-label={`Details ${entry.name}`}
                    onClick={() => setDetail(entry)}
                  >
                    <Info size={15} />
                  </button>
                </div>
              </article>
            ))}
            {!visible.length && (
              <div className="dl-empty">
                <Search size={30} />
                <h3>No matching structures</h3>
                <p>
                  Try a synonym, formula, CID, another category, or wider mass
                  limits.
                </p>
                <button onClick={clear}>Clear filters</button>
                <button onClick={() => onDatabase(query)}>
                  Search PubChem online
                </button>
              </div>
            )}
          </div>
          <footer className="dl-pagination">
            <span>
              {filtered.length
                ? `${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length.toLocaleString()}`
                : "0 results"}
            </span>
            <button
              disabled={safePage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous library page"
            >
              <ArrowLeft size={16} />
            </button>
            <label>
              Page
              <input
                aria-label="Library page"
                type="number"
                min="1"
                max={totalPages}
                value={safePage}
                onChange={(e) =>
                  setPage(
                    Math.max(
                      1,
                      Math.min(totalPages, Number(e.target.value) || 1),
                    ),
                  )
                }
              />
            </label>
            <span>of {totalPages}</span>
            <button
              disabled={safePage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next library page"
            >
              <ArrowRight size={16} />
            </button>
          </footer>
        </main>
        {detail && (
          <aside className="dl-detail">
            <button
              className="dl-detail-close"
              aria-label="Close compound details"
              onClick={() => setDetail(null)}
            >
              <X size={17} />
            </button>
            <h3>{detail.name}</h3>
            {svgs[detail.id] && (
              <div
                className="dl-detail-svg"
                dangerouslySetInnerHTML={{ __html: svgs[detail.id] }}
              />
            )}
            <dl>
              <dt>Formula</dt>
              <dd>{detail.formula}</dd>
              <dt>Molecular weight</dt>
              <dd>{detail.mw?.toFixed(3)} g/mol</dd>
              <dt>Calculated logP</dt>
              <dd>{detail.logP ?? "—"}</dd>
              <dt>TPSA</dt>
              <dd>{detail.tpsa ?? "—"} Å²</dd>
              <dt>H-bond donors / acceptors</dt>
              <dd>
                {detail.hbd ?? "—"} / {detail.hba ?? "—"}
              </dd>
              <dt>Canonical isomeric SMILES</dt>
              <dd>
                <code>{detail.smiles}</code>
              </dd>
              {detail.iupac && (
                <>
                  <dt>IUPAC name</dt>
                  <dd>{detail.iupac}</dd>
                </>
              )}
              <dt>Categories</dt>
              <dd>{detail.tags.join(" · ")}</dd>
              {detail.aliases?.length > 0 && (
                <>
                  <dt>Synonyms</dt>
                  <dd>{detail.aliases.slice(0, 6).join("; ")}</dd>
                </>
              )}
            </dl>
            {detail.cid && (
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${detail.cid}`}
                target="_blank"
                rel="noreferrer"
              >
                PubChem CID {detail.cid} ↗
              </a>
            )}
            <button
              className="dl-primary"
              disabled={Boolean(opening)}
              onClick={() => open(detail)}
            >
              Open structure
            </button>
            <p>
              Descriptors are calculated by RDKit. The library validates
              molecular identity through the editor’s import/export path.
            </p>
          </aside>
        )}
      </div>
      <footer className="dl-footer">
        <span>
          Reference catalogue stored with the app · {personal.length} personal
          entries
        </span>
        <button
          onClick={() =>
            exportFile(
              JSON.stringify(
                {
                  version: 1,
                  entries: personal,
                  favoriteSmiles: [...favorites],
                },
                null,
                2,
              ),
              "my-compound-library.json",
              "application/json",
            )
          }
        >
          <Download size={14} />
          Back up my collection
        </button>
        <button onClick={() => onDatabase(query)}>
          Search beyond this library ↗
        </button>
      </footer>
    </div>
  );
}
