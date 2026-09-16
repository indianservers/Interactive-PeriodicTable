import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolveStructureSource } from "../src/components/molecular-viewer/StructureLoader.js";

const structureDir = new URL("../public/assets/nucleic-acid/structures/", import.meta.url);
const nucleotideDir = new URL("../public/assets/nucleic-acid/nucleotides/", import.meta.url);
const cached = ["1ANA", "1BNA", "1EHZ", "1EYG", "1LMB", "2HNH", "2KOC", "2OWO", "3B39", "3BEP", "4ESV", "4OCB", "6ALH"];
for (const id of cached) {
  const text = await readFile(new URL(id + ".cif", structureDir), "utf8");
  assert.match(text.slice(0, 80), new RegExp("^data_" + id, "i"), id + " cache must identify its PDB entry");
  assert.match(text, /_atom_site\./, id + " cache must contain atom coordinates");
}

for (const code of ["A", "C", "G", "U", "DA", "DC", "DG", "DT"]) {
  const sdf = await readFile(new URL(code + "_ideal.sdf", nucleotideDir), "utf8");
  assert.match(sdf, /V2000|V3000/, code + " must be a valid SDF connection table");
  await access(new URL(code + "_2d.png", nucleotideDir));
}

const page = await readFile(new URL("../src/modules/nucleic-acid-explorer/NucleicAcidExplorer.jsx", import.meta.url), "utf8");
for (const sequence of ["CGCGAATTCGCG", "CCGG", "CGCGCGCGCGCG", "GGCACUUCGGUGCC"]) {
  assert(page.includes(sequence), "missing coordinate-backed sequence " + sequence);
}
const wrapper = await readFile(new URL("../src/modules/nucleic-acid-explorer/MolecularViewer.jsx", import.meta.url), "utf8");
assert(wrapper.includes('from "../../components/molecular-viewer/index.js"'));
assert(!wrapper.includes("createPluginUI"), "page-specific Mol* initialization must not return");

assert.equal(resolveStructureSource({ data: "ATOM", label: "sample.pdb" }, "pdb").format, "pdb");
assert.equal(resolveStructureSource({ url: "/sample.cif" }, "mmcif").format, "mmcif");
assert.throws(() => resolveStructureSource({ data: "x" }, "xyz"), /Unsupported structure format/);

console.log("NUCLEIC-ACID DATA AND SHARED-VIEWER CHECKS PASSED");
