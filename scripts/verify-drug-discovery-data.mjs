import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import initRDKit from "@rdkit/rdkit";
import { ACTIVITIES, COMPOUNDS, COX2_STRUCTURE, COX2_TARGET } from "../src/modules/drug-discovery/drugDiscoveryData.js";
import { clearDataCache, convertConcentrationToNm, fetchJson, normalizeActivity } from "../src/services/drugDiscoveryDataService.js";

const cif = await readFile("public/assets/drug-discovery/structures/5IKR.cif", "utf8");
const ligand = await readFile("public/assets/drug-discovery/structures/ID8_ideal.sdf", "utf8");
const analytics = JSON.parse(await readFile("public/assets/drug-discovery/data/analytics.json", "utf8"));

assert.equal(COX2_TARGET.uniprot, "P35354");
assert.equal(COX2_STRUCTURE.id, "5IKR");
assert.equal(COX2_STRUCTURE.ligandCode, "ID8");
assert.match(cif, /^data_5IKR/m);
assert.match(cif, /_exptl\.method\s+'X-RAY DIFFRACTION'/);
assert.match(cif, /_refine\.ls_d_res_high\s+2\.34/);
assert.match(cif, /ID8/);
assert.match(ligand, /^ID8/m);
assert.match(ligand, /V2000/);

assert.equal(COMPOUNDS.length, 8);
assert.equal(ACTIVITIES.length, 8);
assert.equal(new Set(COMPOUNDS.map((compound) => compound.cid)).size, 8);
assert(COMPOUNDS.every((compound) => compound.provenance.some((source) => source.sourceDatabase === "PubChem")));
assert(ACTIVITIES.every((record) => record.assayId && record.provenance.sourceDatabase === "ChEMBL"));
assert.equal(convertConcentrationToNm(0.12, "uM"), 120);
assert.equal(normalizeActivity({ molecule_chembl_id: "CHEMBL118", standard_value: "120", standard_units: "nM", standard_type: "IC50", pchembl_value: "6.92" }, { sourceDatabase: "ChEMBL" }).standardValue, 120);

const RDKit = await initRDKit();
for (const compound of COMPOUNDS) {
  const molecule = RDKit.get_mol(compound.smiles);
  assert(molecule?.is_valid(), `${compound.name} must have a valid molecular graph`);
  assert(molecule.get_smiles().length > 0);
  molecule.delete();
}

assert.equal(analytics.rdkitVersion, "2025.03.4");
assert.equal(analytics.fingerprint.radius, 2);
assert.equal(analytics.fingerprint.bits, 2048);
assert.equal(analytics.umap.seed, 42);
assert.deepEqual(new Set(analytics.points.map((point) => point.cid)), new Set(COMPOUNDS.map((compound) => compound.cid)));
assert(analytics.points.every((point) => point.coordinates.length === 2 && point.coordinates.every(Number.isFinite)));

const originalFetch = globalThis.fetch;
try {
  let calls = 0;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: true, json: async () => ({ verified: true }) };
  };
  clearDataCache();
  assert.deepEqual(await fetchJson("https://example.test/cached"), { verified: true });
  assert.deepEqual(await fetchJson("https://example.test/cached"), { verified: true });
  assert.equal(calls, 1, "successful data should be cached");

  globalThis.fetch = async () => { throw new Error("simulated network failure"); };
  await assert.rejects(fetchJson("https://example.test/failure", { retries: 1, cache: false }), /simulated network failure/);
} finally {
  globalThis.fetch = originalFetch;
}

console.log("DRUG DISCOVERY DATA, PROVENANCE, RDKIT, AND FAILURE-PATH CHECKS PASSED");
