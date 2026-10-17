import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import initRDKit from "@rdkit/rdkit";
import {
  filterLibrary,
  mergePersonalLibrary,
  personalLibraryEntry,
  parseLibraryImport,
} from "../src/utils/expandedStructureLibrary.js";
import {
  parseMolfile,
  structureMolfile,
} from "../src/utils/structureDrawing.js";
const rd = await initRDKit(),
  data = JSON.parse(
    await readFile("public/assets/structure-library/catalogue.json", "utf8"),
  ),
  entries = data.entries;
assert.ok(entries.length >= 12000);
assert.equal(new Set(entries.map((e) => e.id)).size, entries.length);
assert.equal(new Set(entries.map((e) => e.smiles)).size, entries.length);
for (const entry of entries) {
  let mol = rd.get_mol(entry.smiles);
  assert.ok(mol, entry.name);
  assert.equal(mol.get_smiles(), entry.smiles);
  mol.set_new_coords();
  const block = structureMolfile(parseMolfile(mol.get_molblock()));
  let restored = rd.get_mol(block);
  assert.equal(restored?.get_smiles(), entry.smiles, entry.name);
  assert.ok(entry.formula && Number.isFinite(entry.mw) && entry.mw > 0);
  restored?.delete();
  mol.delete();
}
assert.equal(filterLibrary(entries, { query: "CID 2244" })[0].name, "Aspirin");
assert.equal(
  filterLibrary(entries, { query: "C₈H₁₀N₄O₂" })[0].name,
  "Caffeine",
);
assert.ok(filterLibrary(entries, { query: "acetaminophen" }).length);
assert.ok(filterLibrary(entries, { category: "Ions & salts" }).length > 1000);
const caffeine = filterLibrary(entries, { query: "caffeine" })[0];
assert.equal(
  filterLibrary(entries, {
    favoritesOnly: true,
    favorites: new Set([caffeine.smiles]),
  }).length,
  1,
);
assert.ok(
  filterLibrary(entries, { minMw: 100, maxMw: 110 }).every(
    (e) => e.mw >= 100 && e.mw <= 110,
  ),
);
const custom = personalLibraryEntry(rd, {
  name: "Test labelled ethanol",
  smiles: "[13CH3]CO",
});
assert.ok(custom.smiles.includes("13"));
assert.throws(() =>
  personalLibraryEntry(rd, { name: "Bad", smiles: "invalid" }),
);
assert.throws(() =>
  personalLibraryEntry(rd, { name: "Radical", smiles: "[CH3]" }),
);
const personal = personalLibraryEntry(rd, {
  name: "My caffeine",
  smiles: caffeine.smiles,
});
const merged = mergePersonalLibrary(entries, [personal]);
assert.equal(merged.length, entries.length);
assert.ok(
  merged
    .find((e) => e.smiles === caffeine.smiles)
    .tags.includes("My collection"),
);
assert.equal(
  parseLibraryImport("CCO\tEthanol\nO Water\n# comment", "m.smi").length,
  2,
);
assert.equal(
  parseLibraryImport(JSON.stringify({ entries: [personal] }), "m.json")[0].name,
  "My caffeine",
);
console.log(
  `PASS: ${entries.length} library structures preserve identity through the editor; CID/formula/synonym/category/favorites/mass filters, personal collection, isotope support, invalid import and radical rejection passed.`,
);
