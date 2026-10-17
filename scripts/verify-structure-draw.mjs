import { readFile } from "node:fs/promises";
import { templates, conformers } from "../src/utils/structureDrawLibrary.js";
import assert from "node:assert/strict";
import initRDKit from "@rdkit/rdkit";
import {
  parseMolfile,
  structureMolfile,
  addRing,
  emptyStructure,
  bondSegments,
} from "../src/utils/structureDrawing.js";
const rd = await initRDKit();
const checks = [
  ["caffeine", "Cn1c(=O)c2c(ncn2C)n(C)c1=O", 194.194],
  ["water", "O", 18.015],
  ["ethanol", "CCO", 46.069],
  ["ammonium", "[NH4+]", 18.039],
  ["nitrobenzene", "[O-][N+](=O)c1ccccc1", 123.111],
  ["alanine", "C[C@H](N)C(=O)O", 89.094],
];
for (const [name, smiles, weight] of checks) {
  const original = rd.get_mol(smiles);
  assert.ok(original, name);
  original.set_new_coords();
  const model = parseMolfile(original.get_molblock());
  const roundtrip = rd.get_mol(structureMolfile(model));
  assert.ok(roundtrip, `${name} round trip valid`);
  assert.equal(
    roundtrip.get_smiles(),
    original.get_smiles(),
    `${name} retains chemical identity and stereochemistry`,
  );
  assert.ok(
    Math.abs(JSON.parse(roundtrip.get_descriptors()).amw - weight) < 0.02,
    `${name} molecular weight`,
  );
  original.delete();
  roundtrip.delete();
}
const ring = addRing(emptyStructure(), 400, 300, true);
const benzene = rd.get_mol(structureMolfile(ring));
assert.equal(benzene.get_smiles(), "c1ccccc1");
benzene.delete();
assert.equal(bondSegments({ x: 0, y: 0 }, { x: 50, y: 0 }, 3).length, 3);
assert.throws(() => parseMolfile("invalid"));
console.log(
  "Draw chemistry: 6 molecular identity / valence / charge / stereo round trips, aromatic ring, triple bond, and invalid import passed.",
);

for (const [name, smiles] of templates) {
  const source = rd.get_mol(
    await readFile(`public${conformers[name]}`, "utf8"),
  );
  assert.ok(source, `${name}: bundled conformer parses`);
  const withoutH = rd.get_mol(source.remove_hs());
  const template = rd.get_mol(smiles);
  assert.equal(
    withoutH.get_smiles(),
    template.get_smiles(),
    `${name}: 2D template and 3D conformer must describe the same stereoisomer`,
  );
  source.delete();
  withoutH.delete();
  template.delete();
}
console.log(
  "All 10 template graphs match their bundled 3D conformers, including stereochemistry.",
);
