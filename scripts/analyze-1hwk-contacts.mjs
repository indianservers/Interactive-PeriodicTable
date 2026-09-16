import fs from "node:fs";

const lines = fs.readFileSync(new URL("../public/assets/pharma/1HWK.pdb", import.meta.url), "utf8").split(/\r?\n/);
const atoms = lines.filter((line) => line.startsWith("ATOM  ") || line.startsWith("HETATM")).map((line) => ({
  record: line.slice(0, 6).trim(), atom: line.slice(12, 16).trim(), residue: line.slice(17, 20).trim(), chain: line.slice(21, 22), residueNumber: Number(line.slice(22, 26)),
  x: Number(line.slice(30, 38)), y: Number(line.slice(38, 46)), z: Number(line.slice(46, 54)), element: line.slice(76, 78).trim(),
}));
const ligand = atoms.filter((atom) => atom.record === "HETATM" && atom.residue === "117" && atom.chain === "A" && atom.residueNumber === 2);
if (!ligand.length) throw new Error("Atorvastatin ligand 117 in chain A residue 2 was not found");
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
const contacts = new Map();
for (const proteinAtom of atoms.filter((atom) => atom.record === "ATOM" && atom.chain === "A")) {
  let minimum = Infinity;
  for (const ligandAtom of ligand) minimum = Math.min(minimum, distance(proteinAtom, ligandAtom));
  if (minimum <= 4.5) {
    const key = `${proteinAtom.residue}${proteinAtom.residueNumber}`;
    const prior = contacts.get(key);
    if (!prior || minimum < prior.distance) contacts.set(key, { residue: key, distance: minimum, atom: proteinAtom.atom });
  }
}
const sorted = [...contacts.values()].sort((a, b) => a.distance - b.distance);
console.log(JSON.stringify({ ligandAtoms: ligand.length, contactsWithin4_5Angstrom: sorted }, null, 2));
