import { mkdir, writeFile } from "node:fs/promises";
import initRDKitModule from "@rdkit/rdkit";
import { UMAP } from "umap-js";
import { COMPOUNDS } from "../src/modules/drug-discovery/drugDiscoveryData.js";

let seed = 42;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const RDKit = await initRDKitModule();
const fingerprints = COMPOUNDS.map((compound) => {
  const molecule = RDKit.get_mol(compound.smiles);
  if (!molecule) throw new Error(`RDKit rejected ${compound.name}`);
  const bits = Array.from(molecule.get_morgan_fp_as_uint8array(JSON.stringify({ radius: 2, nBits: 2048 })));
  molecule.delete();
  return bits;
});

const umap = new UMAP({ nComponents: 2, nNeighbors: 4, minDist: 0.1, random });
const embedding = umap.fit(fingerprints);
const payload = {
  generatedAt: "2026-09-09",
  rdkitVersion: RDKit.version(),
  method: "UMAP",
  fingerprint: { type: "Morgan", radius: 2, bits: 2048 },
  umap: { nComponents: 2, nNeighbors: 4, minDist: 0.1, seed: 42 },
  points: COMPOUNDS.map((compound, index) => ({ cid: compound.cid, slug: compound.slug, coordinates: embedding[index] })),
};
await mkdir("public/assets/drug-discovery/data", { recursive: true });
await writeFile("public/assets/drug-discovery/data/analytics.json", JSON.stringify(payload, null, 2));
console.log(JSON.stringify(payload, null, 2));
