import { RANKING, SUBSTANCES } from "../src/modules/core-simulations/statesMatterModel.js";
import assert from "node:assert/strict";
import { writeFile, mkdir } from "node:fs/promises";
import { shuffleOptions } from "../src/utils/shuffleOptions.js";
import {
  addRing,
  bondSegments,
  emptyStructure,
  parseMolfile,
  structureMolfile,
} from "../src/utils/structureDrawing.js";
import { csvText, reportPdf } from "../src/utils/labExports.js";

const source = [
  { id: "correct", label: "Correct" },
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];
const shuffled = shuffleOptions(source, () => 0);
assert.deepEqual(
  source.map((o) => o.id),
  ["correct", "a", "b"],
);
assert.deepEqual(
  shuffled.map((o) => o.id),
  ["a", "b", "correct"],
);
assert.equal(shuffled.find((o) => o.id === "correct").label, "Correct");
assert.deepEqual(
  shuffleOptions([], () => 0),
  [],
);
const ring = addRing(emptyStructure(), 400, 300, true);
assert.equal(ring.atoms.length, 6);
assert.equal(ring.bonds.length, 6);
assert.equal(ring.bonds.filter((b) => b.order === 2).length, 3);
const restored = parseMolfile(structureMolfile(ring));
assert.deepEqual(restored.bonds, ring.bonds);
assert.deepEqual(
  restored.atoms.map((a) => a.element),
  ring.atoms.map((a) => a.element),
);
const sparse = {
  atoms: [
    { id: 3, element: "C", x: 400, y: 300 },
    { id: 9, element: "O", x: 440, y: 300 },
  ],
  bonds: [{ a: 3, b: 9, order: 2 }],
};
assert.deepEqual(parseMolfile(structureMolfile(sparse)).bonds, [
  { a: 1, b: 2, order: 2 },
]);
assert.throws(() => parseMolfile("invalid"));
const vertical = bondSegments({ x: 10, y: 10 }, { x: 10, y: 60 }, 2);
assert.notEqual(vertical[0].x1, vertical[1].x1);
assert.equal(vertical[0].y1, vertical[1].y1);
assert.equal(bondSegments({ x: 0, y: 0 }, { x: 40, y: 0 }, 3).length, 3);
assert.equal(
  csvText([
    ["Name", "Note"],
    ["a,b", '"quoted"\nline'],
  ]),
  '"Name","Note"\r\n"a,b","""quoted""\nline"',
);
const pdf = reportPdf(
  "Report (test)",
  Array.from({ length: 100 }, (_, i) => `Measurement ${i}: CO₂, 25 °C`),
);
assert.equal(pdf.type, "application/pdf");
const text = await pdf.text();
assert.match(text, /\/Count 3/);
const start = Number(text.match(/startxref\n(\d+)/)[1]);
assert.equal(text.slice(start, start + 4), "xref");
const offsets = text
  .slice(start)
  .match(/\d{10} 00000 n/g)
  .map((line) => Number(line.slice(0, 10)));
offsets.forEach((offset, i) =>
  assert.equal(
    text.slice(offset, offset + `${i + 1} 0 obj`.length),
    `${i + 1} 0 obj`,
  ),
);
await mkdir("docs/bugfix-qa", { recursive: true });
await writeFile(
  "docs/bugfix-qa/export-validation.pdf",
  new Uint8Array(await pdf.arrayBuffer()),
);
console.log(
  "PASS: stable option identities and unbiased shuffle mechanics, ring connectivity and MOL round-trip, sparse IDs, invalid import, CSV escaping, paginated PDF and cross-reference offsets.",
);

assert.deepEqual(RANKING,Object.keys(SUBSTANCES).sort((a,b)=>SUBSTANCES[b].bp-SUBSTANCES[a].bp));
