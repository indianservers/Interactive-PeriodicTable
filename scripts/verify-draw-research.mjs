import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import initRDKit from "@rdkit/rdkit";
import {
  canonicalSmiles,
  analyzeMolecule,
  batchAnalyze,
  compareMolecules,
  substructure,
  isotopeEnvelope,
  solutionAmounts,
  dilution,
  measureGeometry,
  tanimoto,
  parseSdf3D,
  validateNotebook,
  csvText,
} from "../src/utils/drawResearch.js";
import { validateDrawWorkspace } from "../src/utils/drawWorkspace.js";
import {
  addRing,
  emptyStructure,
  structureMolfile,
  parseMolfile,
} from "../src/utils/structureDrawing.js";
const rd = await initRDKit();
let checks = 0;
function check(fn) {
  fn();
  checks++;
}
const caffeine = analyzeMolecule(rd, "Cn1c(=O)c2c(ncn2C)n(C)c1=O");
check(() => assert.equal(caffeine.formula, "C8H10N4O2"));
check(() =>
  assert.ok(Math.abs(caffeine.descriptors.exactmw - 194.080375) < 0.00001),
);
check(() => assert.equal(caffeine.inchikey, "RYYVLZVUVIJVGH-UHFFFAOYSA-N"));
check(() => assert.equal(caffeine.charge, 0));
check(() =>
  assert.ok(caffeine.groups.some((g) => g.name === "Amide / lactam")),
);
const ethanol = analyzeMolecule(rd, "CCO");
check(() => assert.equal(ethanol.formula, "C2H6O"));
check(() => assert.ok(ethanol.groups.some((g) => g.name === "Alcohol")));
const ammonium = analyzeMolecule(rd, "[NH4+]");
check(() => assert.equal(ammonium.charge, 1));
check(() => assert.equal(ammonium.formula, "H4N+"));
check(() => assert.throws(() => analyzeMolecule(rd, "not_a_molecule")));
check(() =>
  assert.throws(() => analyzeMolecule(rd, structureMolfile(emptyStructure()))),
);
check(() =>
  assert.equal(substructure(rd, "CC(=O)O", "[CX3](=O)[OX2H1]").count, 1),
);
check(() => assert.equal(substructure(rd, "CCO", "C#N").count, 0));
check(() => assert.throws(() => substructure(rd, "CCO", "[")));
const same = compareMolecules(rd, "CCO", "OCC");
check(() => assert.equal(same.similarity, 1));
check(() => assert.equal(same.same, true));
const contains = compareMolecules(rd, "CCO", "CO");
check(() => assert.equal(contains.leftContainsRight, true));
check(() => assert.equal(contains.rightContainsLeft, false));
check(() => assert.equal(tanimoto("1010", "1100"), 1 / 3));
check(() => assert.throws(() => tanimoto("1", "11")));
const rows = batchAnalyze(
  rd,
  "CCO\tEthanol\ninvalid\tBad\nCC(=O)O\tAcetic acid",
);
check(() => assert.equal(rows.length, 3));
check(() => assert.equal(rows[0].status, "Valid"));
check(() => assert.equal(rows[1].status, "Invalid"));
check(() => assert.equal(rows[2].formula, "C2H4O2"));
check(() =>
  assert.throws(() => batchAnalyze(rd, Array(201).fill("O").join("\n"))),
);
check(() =>
  assert.ok(csvText([{ name: '=HYPERLINK("x")' }]).includes("'=HYPERLINK")),
);
const chlorine = isotopeEnvelope({ Cl: 1 });
check(() => assert.ok(Math.abs(chlorine[2].relative - 31.9958) < 0.001));
const bromine = isotopeEnvelope({ Br: 2 });
check(() =>
  assert.ok(
    bromine[2].relative > bromine[0].relative &&
      bromine[2].relative > bromine[4].relative,
  ),
);
check(() => assert.throws(() => isotopeEnvelope({ Xe: 1 })));
const concentration = solutionAmounts(100, 10, 100);
check(() => assert.equal(concentration.mmol, 0.1));
check(() => assert.equal(concentration.millimolar, 1));
check(() => assert.equal(concentration.molarity, 0.001));
check(() => assert.throws(() => solutionAmounts(100, 1, 0)));
check(() =>
  assert.deepEqual(dilution(100, 10, 25), { stockMl: 2.5, solventMl: 22.5 }),
);
check(() => assert.throws(() => dilution(10, 20, 25)));
const points = [
  { id: 1, x: 1, y: 0, z: 0 },
  { id: 2, x: 0, y: 0, z: 0 },
  { id: 3, x: 0, y: 1, z: 0 },
  { id: 4, x: 0, y: 1, z: 1 },
];
check(() => assert.equal(measureGeometry(points, [1, 2]).value, 1));
check(() => assert.equal(measureGeometry(points, [1, 2, 3]).value, 90));
check(() =>
  assert.equal(Math.abs(measureGeometry(points, [1, 2, 3, 4]).value), 90),
);
check(() => assert.throws(() => measureGeometry(points, [1, 1])));
check(() => assert.throws(() => measureGeometry(points, [1, 999])));
check(() => assert.throws(() => measureGeometry(points, [, 2, 3])));
const sdf = await readFile(
    "public/assets/research-toolkit/caffeine-2519.sdf",
    "utf8",
  ),
  graph = parseSdf3D(sdf);
check(() => assert.equal(graph.atoms.length, 24));
check(() => assert.equal(graph.bonds.length, 25));
check(() => assert.ok(graph.atoms.some((a) => Math.abs(a.z) > 0.01)));
check(() => assert.throws(() => parseSdf3D("bad")));
for (let size = 3; size <= 8; size++) {
  const ring = addRing(emptyStructure(), 400, 300, false, size);
  check(() => assert.equal(ring.atoms.length, size));
  const mol = rd.get_mol(structureMolfile(ring));
  check(() => assert.ok(mol));
  mol?.delete();
}
check(() => assert.throws(() => addRing(emptyStructure(), 0, 0, false, 9)));
const project = {
  version: 1,
  activeDocumentId: 1,
  documents: [
    {
      id: 1,
      title: "Test",
      name: "Ring",
      model: addRing(emptyStructure(), 400, 300),
    },
  ],
};
check(() => assert.equal(validateDrawWorkspace(project).documents.length, 1));
check(() =>
  assert.throws(() =>
    validateDrawWorkspace({ ...project, activeDocumentId: 99 }),
  ),
);
check(() =>
  assert.throws(() =>
    validateDrawWorkspace({
      ...project,
      documents: [...project.documents, ...project.documents],
    }),
  ),
);
const entry = {
  id: "1",
  title: "Ethanol",
  smiles: "CCO",
  notes: "Observation",
  createdAt: new Date().toISOString(),
};
check(() => assert.equal(validateNotebook([entry])[0].notes, "Observation"));
check(() => assert.throws(() => validateNotebook([{ title: "bad" }])));
// New wedge bonds survive serialization, so stereochemistry can be retained by exports.
const chiral = rd.get_mol("C[C@H](N)C(=O)O");
chiral.set_new_coords();
const roundtrip = rd.get_mol(
  structureMolfile(parseMolfile(chiral.get_molblock())),
);
check(() => assert.equal(roundtrip.get_smiles(), chiral.get_smiles()));
chiral.delete();
roundtrip.delete();
const explicitCaffeine = analyzeMolecule(rd, sdf);
check(() => assert.equal(explicitCaffeine.smiles, caffeine.smiles));
check(() =>
  assert.equal(
    explicitCaffeine.descriptors.NumRotatableBonds,
    caffeine.descriptors.NumRotatableBonds,
  ),
);
check(() => assert.equal(explicitCaffeine.fingerprint, caffeine.fingerprint));
check(() =>
  assert.equal(compareMolecules(rd, sdf, caffeine.smiles).same, true),
);
check(() => assert.equal(canonicalSmiles(rd, "[H]O[H]"), "O"));
check(() => assert.equal(canonicalSmiles(rd, sdf), caffeine.smiles));
check(() => assert.throws(() => canonicalSmiles(rd, "invalid")));
console.log(
  `PASS: ${checks} research checks: descriptors, functional groups, SMARTS, fingerprints, batch errors, isotope chemistry, concentration units, 3D geometry, ring sizes, workspace validation and stereo export.`,
);
