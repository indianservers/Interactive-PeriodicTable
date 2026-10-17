export const emptyStructure = () => ({ atoms: [], bonds: [] });
export function structureMolfile(model) {
  const atoms = model.atoms.map(
    (a) =>
      `${((a.x - 400) / 40).toFixed(4).padStart(10)}${((300 - a.y) / 40).toFixed(4).padStart(10)}    0.0000 ${a.element.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`,
  );
  const bonds = model.bonds.map(
    (b) =>
      `${String(model.atoms.findIndex((a) => a.id === b.a) + 1).padStart(3)}${String(model.atoms.findIndex((a) => a.id === b.b) + 1).padStart(3)}${String(b.order).padStart(3)}${String(b.stereo || 0).padStart(3)}  0  0  0`,
  );
  return [
    "Chemistry Structure",
    "  Chemistry Universe",
    "",
    `${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0            999 V2000`,
    ...atoms,
    ...bonds,
    ...model.atoms
      .filter((a) => a.charge)
      .map(
        (a) =>
          `M  CHG  1${String(model.atoms.findIndex((v) => v.id === a.id) + 1).padStart(4)}${String(a.charge).padStart(4)}`,
      ),
    ...model.atoms
      .filter((a) => a.isotope)
      .map(
        (a) =>
          `M  ISO  1${String(model.atoms.findIndex((v) => v.id === a.id) + 1).padStart(4)}${String(a.isotope).padStart(4)}`,
      ),
    "M  END",
  ].join("\n");
}
export function parseMolfile(text) {
  const lines = text.replaceAll("\r", "").split("\n");
  if (!lines[3]?.includes("V2000"))
    throw new Error("Use a V2000 MOL file or SMILES.");
  const count = Number(lines[3].slice(0, 3)),
    bondCount = Number(lines[3].slice(3, 6));
  if (
    !Number.isInteger(count) ||
    count < 0 ||
    count > 500 ||
    !Number.isInteger(bondCount) ||
    bondCount < 0 ||
    bondCount > 1000
  )
    throw new Error("Invalid structure size.");
  const atoms = lines.slice(4, 4 + count).map((l, i) => ({
    id: i + 1,
    x: 400 + Number(l.slice(0, 10)) * 40,
    y: 300 - Number(l.slice(10, 20)) * 40,
    element: l.slice(31, 34).trim(),
  }));
  const bonds = lines.slice(4 + count, 4 + count + bondCount).map((l) => ({
    a: Number(l.slice(0, 3)),
    b: Number(l.slice(3, 6)),
    order: Number(l.slice(6, 9)),
    stereo: Number(l.slice(9, 12)) || 0,
  }));
  if (
    atoms.length !== count ||
    bonds.length !== bondCount ||
    atoms.some(
      (a) => !Number.isFinite(a.x) || !Number.isFinite(a.y) || !a.element,
    ) ||
    bonds.some(
      (b) =>
        !atoms.some((a) => a.id === b.a) ||
        !atoms.some((a) => a.id === b.b) ||
        ![1, 2, 3, 4].includes(b.order),
    )
  )
    throw new Error("Invalid atom or bond data.");
  const chargeCodes = { 1: 3, 2: 2, 3: 1, 5: -1, 6: -2, 7: -3 };
  atoms.forEach((a, i) => {
    const code = Number(lines[4 + i].slice(36, 39));
    if (chargeCodes[code]) a.charge = chargeCodes[code];
  });
  lines
    .filter((l) => l.startsWith("M  CHG"))
    .forEach((l) => {
      const parts = l.trim().split(/\s+/);
      for (let i = 3; i < parts.length; i += 2) {
        const atom = atoms[Number(parts[i]) - 1];
        if (atom) atom.charge = Number(parts[i + 1]);
      }
    });
  lines
    .filter((l) => l.startsWith("M  ISO"))
    .forEach((l) => {
      const parts = l.trim().split(/\s+/);
      for (let i = 3; i < parts.length; i += 2) {
        const atom = atoms[Number(parts[i]) - 1];
        if (atom) atom.isotope = Number(parts[i + 1]);
      }
    });
  return { atoms, bonds };
}
export function addRing(model, x, y, aromatic = false, size = 6) {
  if (!Number.isInteger(size) || size < 3 || size > 8)
    throw Error("Choose a ring size between 3 and 8.");
  if (aromatic) size = 6;
  const first = Math.max(0, ...model.atoms.map((a) => a.id)) + 1;
  const atoms = Array.from({ length: size }, (_, i) => ({
    id: first + i,
    element: "C",
    x: x + 65 * Math.cos((i * 2 * Math.PI) / size),
    y: y + 65 * Math.sin((i * 2 * Math.PI) / size),
  }));
  const bonds = atoms.map((a, i) => ({
    a: a.id,
    b: atoms[(i + 1) % size].id,
    order: aromatic && i % 2 === 0 ? 2 : 1,
  }));
  return {
    atoms: [...model.atoms, ...atoms],
    bonds: [...model.bonds, ...bonds],
  };
}
export function bondSegments(a, b, order) {
  const count = order === 4 ? 2 : order;
  const dx = b.x - a.x,
    dy = b.y - a.y,
    length = Math.hypot(dx, dy) || 1;
  return Array.from({ length: count }, (_, i) => {
    const offset = (i - (count - 1) / 2) * 6,
      nx = (-dy / length) * offset,
      ny = (dx / length) * offset;
    return { x1: a.x + nx, y1: a.y + ny, x2: b.x + nx, y2: b.y + ny };
  });
}
