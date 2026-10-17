import { templates, conformers } from "./structureDrawLibrary.js";
import { canonicalSmiles, formulaCounts, hillFormula } from "./drawResearch.js";
import { parseMolfile, structureMolfile } from "./structureDrawing.js";
let libraryPromise;
export const PERSONAL_LIBRARY_KEY = "chemistry-draw-personal-library-v1";
export const LIBRARY_FAVORITES_KEY = "chemistry-draw-library-favorites-v1";
export const featuredLibrary = templates.map(([name, smiles]) => ({
  id: `featured-${name.toLowerCase().replaceAll(" ", "-")}`,
  name,
  smiles,
  aliases: [],
  tags: ["Featured"],
  source: "Bundled reference",
  sdf: conformers[name],
  formula: "",
  mw: null,
}));
export function loadStructureLibrary() {
  if (!libraryPromise)
    libraryPromise = fetch("/assets/structure-library/catalogue.json")
      .then(async (response) => {
        if (!response.ok)
          throw Error("The reference library could not be loaded.");
        const data = await response.json();
        if (data.version !== 1 || !Array.isArray(data.entries))
          throw Error("Invalid reference catalogue.");
        return data;
      })
      .catch((error) => {
        libraryPromise = undefined;
        throw error;
      });
  return libraryPromise;
}
export function normalizeLibrarySearch(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[₀-₉]/g, (c) => String("₀₁₂₃₄₅₆₇₈₉".indexOf(c)))
    .trim();
}
const searchCache = new WeakMap();
function searchText(entry) {
  if (!searchCache.has(entry))
    searchCache.set(
      entry,
      normalizeLibrarySearch(
        [
          entry.name,
          entry.iupac,
          entry.formula,
          entry.smiles,
          ...(entry.aliases || []),
        ].join(" "),
      ),
    );
  return searchCache.get(entry);
}
export function filterLibrary(
  entries,
  {
    query = "",
    category = "All",
    favoritesOnly = false,
    favorites = new Set(),
    minMw = "",
    maxMw = "",
    sort = "featured",
  } = {},
) {
  const q = normalizeLibrarySearch(query),
    cid = q.match(/^(?:(?:pubchem\s*)?cid\s*[:#]?\s*)?(\d+)$/)?.[1],
    lower = minMw === "" ? null : Number(minMw),
    upper = maxMw === "" ? null : Number(maxMw);
  const filtered = entries.filter(
    (e) =>
      (category === "All" || e.tags.includes(category)) &&
      (!favoritesOnly || favorites.has(e.smiles)) &&
      (lower === null || (Number.isFinite(e.mw) && e.mw >= lower)) &&
      (upper === null || (Number.isFinite(e.mw) && e.mw <= upper)) &&
      (!q || (cid ? e.cid === Number(cid) : searchText(e).includes(q))),
  );
  const rank = (e) =>
    q
      ? normalizeLibrarySearch(e.name) === q
        ? 0
        : normalizeLibrarySearch(e.formula) === q
          ? 1
          : normalizeLibrarySearch(e.smiles) === q
            ? 1
            : normalizeLibrarySearch(e.name).startsWith(q)
              ? 2
              : 3
      : e.tags.includes("Featured")
        ? 0
        : 1;
  return filtered.sort((a, b) =>
    sort === "mw-asc"
      ? (a.mw ?? Infinity) - (b.mw ?? Infinity) || a.name.localeCompare(b.name)
      : sort === "mw-desc"
        ? (b.mw ?? -Infinity) - (a.mw ?? -Infinity) ||
          a.name.localeCompare(b.name)
        : sort === "name"
          ? a.name.localeCompare(b.name)
          : rank(a) - rank(b) || a.name.localeCompare(b.name),
  );
}
export function mergePersonalLibrary(reference, personal) {
  const map = new Map(reference.map((e) => [e.smiles, e]));
  for (const entry of personal) {
    const prior = map.get(entry.smiles);
    map.set(
      entry.smiles,
      prior
        ? {
            ...prior,
            name: entry.name,
            aliases: [
              ...new Set([
                prior.name,
                ...(prior.aliases || []),
                ...(entry.aliases || []),
              ]),
            ],
            personal: true,
            tags: [...new Set([...prior.tags, "My collection"])],
          }
        : {
            ...entry,
            personal: true,
            tags: [...new Set([...(entry.tags || []), "My collection"])],
          },
    );
  }
  return [...map.values()];
}
export function personalLibraryEntry(rd, { name, smiles }) {
  if (typeof name !== "string" || !name.trim() || name.length > 200)
    throw Error("Use a molecule name of 1–200 characters.");
  if (typeof smiles !== "string" || !smiles.trim() || smiles.length > 20000)
    throw Error("Provide a valid SMILES structure (up to 20,000 characters).");
  let mol, clean, roundtrip, canonicalInput, canonicalRoundtrip;
  try {
    mol = rd.get_mol(smiles);
    if (!mol)
      throw Error("Invalid molecule. Check the SMILES and atom valences.");
    clean = rd.get_mol(mol.remove_hs());
    if (!clean) throw Error("Cannot normalize this structure.");
    const identity = clean.get_smiles();
    clean.set_new_coords();
    const block = clean.get_molblock();
    if (block.includes("M  RAD"))
      throw Error("Radical structures cannot be edited by this editor.");
    const model = parseMolfile(block);
    if (!model.atoms.length) throw Error("A library entry must contain atoms.");
    roundtrip = rd.get_mol(structureMolfile(model));
    if (!roundtrip || roundtrip.get_smiles() !== identity)
      throw Error(
        "This structure cannot retain its chemical identity in the editor.",
      );
    canonicalInput = rd.get_mol(identity);
    canonicalInput.set_new_coords();
    canonicalRoundtrip = rd.get_mol(
      structureMolfile(parseMolfile(canonicalInput.get_molblock())),
    );
    if (!canonicalRoundtrip || canonicalRoundtrip.get_smiles() !== identity)
      throw Error(
        "Canonical SMILES cannot retain its stereochemistry in the editor.",
      );
    const d = JSON.parse(clean.get_descriptors()),
      { counts, charge } = formulaCounts(JSON.parse(clean.get_json()));
    return {
      id: `personal-${crypto.randomUUID()}`,
      name: name.trim(),
      smiles: identity,
      formula: hillFormula(counts, charge),
      mw: Number(d.amw.toFixed(3)),
      logP: Number(d.CrippenClogP.toFixed(3)),
      tpsa: Number(d.tpsa.toFixed(2)),
      hbd: d.NumHBD,
      hba: d.NumHBA,
      aliases: [],
      tags: ["My collection"],
      source: "Personal collection",
      cid: null,
      sdf: null,
    };
  } finally {
    canonicalInput?.delete();
    canonicalRoundtrip?.delete();
    roundtrip?.delete();
    clean?.delete();
    mol?.delete();
  }
}
export function readPersonalLibrary() {
  try {
    const data = JSON.parse(localStorage.getItem(PERSONAL_LIBRARY_KEY) || "[]");
    if (!Array.isArray(data) || data.length > 3000) return [];
    return data.filter(
      (e) =>
        e &&
        typeof e.name === "string" &&
        typeof e.smiles === "string" &&
        Array.isArray(e.tags),
    );
  } catch {
    return [];
  }
}
export function parseLibraryImport(text, filename) {
  if (text.length > 5e6) throw Error("Import a file smaller than 5 MB.");
  if (filename.toLowerCase().endsWith(".json")) {
    const data = JSON.parse(text),
      entries = Array.isArray(data) ? data : data.entries;
    if (!Array.isArray(entries) || entries.length > 3000)
      throw Error("Import up to 3,000 JSON entries at a time.");
    return entries.map((e) => ({ name: e.name, smiles: e.smiles }));
  }
  const lines = text
    .split(/\r?\n/)
    .filter((l) => l.trim() && !l.trim().startsWith("#"));
  if (lines.length > 1000)
    throw Error("Import up to 1,000 SMILES records at a time.");
  return lines.map((l, i) => {
    const [smiles, ...label] = l.trim().split(/\t|\s+/);
    return { smiles, name: label.join(" ") || `Imported molecule ${i + 1}` };
  });
}
