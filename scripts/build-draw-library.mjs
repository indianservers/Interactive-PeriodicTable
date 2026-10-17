import initRDKit from "@rdkit/rdkit";
import { readFile, writeFile, readdir } from "node:fs/promises";
import { join, basename } from "node:path";
import { templates, conformers } from "../src/utils/structureDrawLibrary.js";
import {
  canonicalSmiles,
  formulaCounts,
  hillFormula,
} from "../src/utils/drawResearch.js";
import {
  parseMolfile,
  structureMolfile,
} from "../src/utils/structureDrawing.js";
const rd = await initRDKit();
const raw = JSON.parse(
  await readFile("docs/draw-library-qa/pubchem-raw.json", "utf8"),
);
const groups = [
  ["Hydrocarbons", "[#6]"],
  ["Alcohols & phenols", "[OX2H][#6]"],
  ["Carboxylic acids", "[CX3](=O)[OX2H1,OX1-]"],
  ["Esters", "[CX3](=O)[OX2H0][#6]"],
  ["Amides & lactams", "[#7X3][#6X3](=[OX1])"],
  ["Amines", "[NX3;!$(N-C=O);!$(N-S=O);!$(N=O)]"],
  ["Carbonyl compounds", "[#6X3]=O"],
  ["Nitriles", "C#N"],
  ["Organohalogens", "[#6][F,Cl,Br,I]"],
  ["Sulfur compounds", "[#16]"],
  ["Phosphorus compounds", "[#15]"],
  ["Amino acids & peptides", "[NX3,NX4+][CX4][CX3](=O)[OX2H,OX1-]"],
  ["Polyols & carbohydrates", "[OX2H][CX4][CX4][OX2H]"],
];
const queries = groups.map(([name, smarts]) => ({
  name,
  q: rd.get_qmol(smarts),
}));
const identities = new Map(),
  rejected = [];
let validSources = 0;
let totalSources = 0,
  duplicates = 0;
const drugNames = new Set([
  "aspirin",
  "ibuprofen",
  "paracetamol",
  "acetaminophen",
  "amoxicillin",
  "atorvastatin",
  "metformin",
  "celecoxib",
  "diclofenac",
  "etoricoxib",
  "meclofenamic acid",
  "mefenamic acid",
  "valdecoxib",
  "rofecoxib",
  "meloxicam",
  "benzocaine",
  "lidocaine",
  "naproxen",
  "ketoprofen",
  "warfarin",
  "caffeine",
  "theophylline",
  "theobromine",
  "morphine",
  "codeine",
  "epinephrine",
  "adrenaline",
  "dopamine",
  "serotonin",
  "histamine",
  "nicotine",
  "quinine",
  "penicillin",
  "ampicillin",
  "benzocaine",
  "sulfamethoxazole",
]);
function add(source) {
  totalSources++;
  let mol, clean, roundtrip, canonicalInput, canonicalRoundtrip;
  try {
    mol = rd.get_mol(source.smiles);
    if (!mol) throw Error("Invalid RDKit structure");
    clean = rd.get_mol(mol.remove_hs());
    if (!clean) throw Error("Hydrogen normalization failed");
    const smiles = clean.get_smiles();
    if (identities.has(smiles)) {
      duplicates++;
      const e = identities.get(smiles);
      e.aliases = [
        ...new Set([...e.aliases, source.name, ...(source.aliases || [])]),
      ]
        .filter((n) => n !== e.name)
        .slice(0, 20);
      if (source.cid && !e.cid) e.cid = source.cid;
      if (source.sdf && !e.sdf) e.sdf = source.sdf;
      if (source.tags) e.tags = [...new Set([...e.tags, ...source.tags])];
      return;
    }
    const graph = JSON.parse(clean.get_json()),
      atoms = graph.molecules[0].atoms,
      defaults = graph.defaults.atom;
    if (!atoms.length || atoms.length > 500)
      throw Error("Unsupported editor atom count");
    if (atoms.some((a) => (a.z ?? defaults.z) === 0))
      throw Error("Unspecified atom");
    clean.set_new_coords();
    const block = clean.get_molblock();
    if (block.includes("M  RAD"))
      throw Error("Radical editing is not supported");
    const model = parseMolfile(block);
    roundtrip = rd.get_mol(structureMolfile(model));
    if (!roundtrip || roundtrip.get_smiles() !== smiles)
      throw Error("Editor round trip changed chemical identity");
    canonicalInput = rd.get_mol(smiles);
    canonicalInput.set_new_coords();
    canonicalRoundtrip = rd.get_mol(
      structureMolfile(parseMolfile(canonicalInput.get_molblock())),
    );
    if (!canonicalRoundtrip || canonicalRoundtrip.get_smiles() !== smiles)
      throw Error("Canonical SMILES editor round trip changed stereochemistry");
    const d = JSON.parse(clean.get_descriptors());
    if (!Number.isFinite(d.amw) || d.amw <= 0)
      throw Error("Missing molecular weight");
    const { counts, charge } = formulaCounts(graph),
      tags = [...(source.tags || [])];
    if (!counts.C) tags.push("Inorganic compounds");
    if (smiles.includes(".") || charge) tags.push("Ions & salts");
    if (
      counts.C &&
      Object.keys(counts).every((e) => !counts[e] || ["C", "H"].includes(e))
    )
      tags.push("Hydrocarbons");
    if (d.NumAromaticRings > 0) tags.push("Aromatic compounds");
    if (
      (d.NumAromaticHeterocycles || 0) +
        (d.NumSaturatedHeterocycles || 0) +
        (d.NumAliphaticHeterocycles || 0) >
      0
    )
      tags.push("Heterocycles");
    for (const { name, q } of queries) {
      if (!q || name === "Hydrocarbons") continue;
      const match = JSON.parse(clean.get_substruct_match(q));
      if (match.atoms?.length) tags.push(name);
    }
    if (atoms.some((a) => a.isotope)) tags.push("Isotope-labelled");
    if (
      [source.name, ...(source.aliases || [])].some((n) =>
        drugNames.has(n.toLowerCase()),
      )
    )
      tags.push("Medicines & bioactives");
    if (!tags.length) tags.push("Other organic compounds");
    const entry = {
      id: source.cid ? `pubchem-${source.cid}` : source.id,
      name: source.name,
      aliases: [...new Set(source.aliases || [])]
        .filter((n) => n !== source.name)
        .slice(0, 20),
      smiles,
      formula: hillFormula(counts, charge),
      mw: Number(d.amw.toFixed(3)),
      logP: Number.isFinite(d.CrippenClogP)
        ? Number(d.CrippenClogP.toFixed(3))
        : null,
      tpsa: Number.isFinite(d.tpsa) ? Number(d.tpsa.toFixed(2)) : null,
      hbd: d.NumHBD,
      hba: d.NumHBA,
      tags: [...new Set(tags)].sort(),
      source: source.source,
      cid: source.cid || null,
      sdf: source.sdf || null,
      iupac: source.iupac || "",
    };
    identities.set(smiles, entry);
    validSources++;
  } catch (e) {
    rejected.push({
      name: source.name,
      cid: source.cid || null,
      reason: e.message || String(e),
    });
  } finally {
    canonicalInput?.delete();
    canonicalRoundtrip?.delete();
    roundtrip?.delete();
    clean?.delete();
    mol?.delete();
  }
}
for (const [name, smiles] of templates)
  add({
    id: `featured-${name.toLowerCase().replaceAll(" ", "-")}`,
    name,
    smiles,
    sdf: conformers[name],
    source: "Bundled reference",
    tags: ["Featured"],
  });
async function files(root) {
  const found = [];
  for (const e of await readdir(root, { withFileTypes: true })) {
    const path = join(root, e.name);
    if (e.isDirectory()) found.push(...(await files(path)));
    else if (e.name.endsWith(".sdf")) found.push(path);
  }
  return found;
}
const roots = [
  "public/assets/pharma",
  "public/assets/drug-discovery/compounds",
  "public/assets/carbohydrate-studio/structures",
  "public/assets/isomerism",
  "public/assets/retrosynthesis",
  "public/assets/toxicology/structures",
  "public/assets/spectroscopy",
  "public/assets/chemistry-inventor",
];
for (const root of roots) {
  for (const file of await files(root)) {
    const text = await readFile(file, "utf8"),
      slug = basename(file, ".sdf");
    let name = slug
      .replaceAll("-", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    if (["starch", "glycogen", "cellulose", "chitin"].includes(slug))
      name += " (representative fragment)";
    const cid = text.match(/<PUBCHEM_COMPOUND_CID>\s*\n(\d+)/)?.[1];
    add({
      id: `bundled-${slug}`,
      name,
      smiles: text,
      sdf: "/" + file.replaceAll("\\", "/").replace(/^public\//, ""),
      cid: cid ? Number(cid) : null,
      source: "Bundled reference",
      tags: [
        file.includes("carbohydrate")
          ? "Polyols & carbohydrates"
          : file.includes("pharma") || file.includes("drug-discovery")
            ? "Medicines & bioactives"
            : "Reference structures",
      ],
    });
  }
}
for (let i = 0; i < raw.records.length; i++) {
  const r = raw.records[i],
    name = r.names?.[0] || r.IUPACName || `PubChem CID ${r.CID}`;
  add({
    name,
    smiles: r.SMILES || r.IsomericSMILES,
    aliases: r.names?.slice(1) || [],
    iupac: r.IUPACName,
    cid: r.CID,
    source: "PubChem",
  });
  if (i % 1000 === 0) console.log(`Validated ${i}/${raw.records.length}`);
}
queries.forEach(({ q }) => q?.delete());
const entries = [...identities.values()];
const ids = new Set();
for (const entry of entries) {
  if (ids.has(entry.id)) entry.id += `-${ids.size}`;
  ids.add(entry.id);
}
const categories = {};
for (const e of entries)
  for (const tag of e.tags) categories[tag] = (categories[tag] || 0) + 1;
const catalogue = {
  version: 1,
  builtAt: new Date().toISOString(),
  provenance: {
    database: "PubChem",
    url: "https://pubchem.ncbi.nlm.nih.gov/",
    api: "https://pubchem.ncbi.nlm.nih.gov/rest/pug/",
    requestedCIDRange: [1, raw.requestedMaxCID],
    localReferences: roots,
    validation:
      "RDKit canonical isomeric SMILES; sanitized valence; complete V2000 editor round-trip preserving identity, stereochemistry, charge and isotopes. Duplicate identities merged.",
  },
  count: entries.length,
  categories,
  entries,
};
await writeFile(
  "public/assets/structure-library/catalogue.json",
  JSON.stringify(catalogue),
);
await writeFile(
  "src/data/drawLibraryConformers.js",
  "// Generated by scripts/build-draw-library.mjs. Validated local conformers.\nexport const libraryConformers = " +
    JSON.stringify(
      entries
        .filter((e) => e.sdf)
        .map((e) => ({ smiles: e.smiles, sdf: e.sdf })),
      null,
      2,
    ) +
    ";\n",
);
await writeFile(
  "docs/draw-library-qa/validation.json",
  JSON.stringify(
    {
      count: entries.length,
      sourceRecords: raw.records.length,
      validatedSources: validSources,
      totalSources,
      merged: duplicates,
      rejected: rejected.length,
      rejections: rejected,
      categories,
      bytes: Buffer.byteLength(JSON.stringify(catalogue)),
    },
    null,
    2,
  ),
);
console.log(
  `Library ready: ${entries.length} unique validated structures, ${Object.keys(categories).length} categories, ${rejected.length} rejected source records.`,
);
