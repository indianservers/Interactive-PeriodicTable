/** Local RDKit analysis. All returned predictions are explicitly labelled as calculated. */
export const FUNCTIONAL_GROUPS = [
  ["Carboxylic acid", "[CX3](=O)[OX2H1]"],
  ["Ester", "[CX3](=O)[OX2H0][#6]"],
  ["Amide / lactam", "[#7X3][#6X3](=[OX1])"],
  ["Ketone", "[#6][CX3](=O)[#6]"],
  ["Aldehyde", "[CX3H1](=O)[#6]"],
  ["Alcohol", "[OX2H][CX4]"],
  ["Phenol", "[OX2H][c]"],
  ["Ether", "[OD2]([#6])[#6]"],
  ["Amine (non-amide)", "[NX3;!$(N-C=O);!$(N-S=O);!$(N=O)]"],
  ["Nitrile", "[CX2]#N"],
  ["Nitro", "[N+](=O)[O-]"],
  ["Alkene", "[CX3]=[CX3]"],
  ["Alkyne", "[CX2]#[CX2]"],
  ["Six-membered aromatic ring", "a1aaaaa1"],
  ["Five-membered aromatic ring", "a1aaaa1"],
  ["Thiol", "[SX2H]"],
  ["Sulfone", "[SX4](=O)(=O)"],
  ["Phosphate", "P(=O)(O)(O)O"],
  ["Halogen", "[F,Cl,Br,I]"],
];
const symbols =
  " H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og".split(
    " ",
  );
export function formulaCounts(graph) {
  const counts = {};
  const defaults = graph.defaults?.atom || {};
  let charge = 0;
  for (const atom of graph.molecules[0].atoms) {
    const symbol = symbols[atom.z ?? defaults.z];
    if (!symbol) throw Error("Element outside supported formula range.");
    counts[symbol] = (counts[symbol] || 0) + 1;
    counts.H = (counts.H || 0) + (atom.impHs ?? defaults.impHs ?? 0);
    charge += atom.chg ?? defaults.chg ?? 0;
  }
  return { counts, charge };
}
export function hillFormula(counts, charge = 0) {
  const keys = Object.keys(counts)
    .filter((k) => counts[k] > 0)
    .sort((a, b) =>
      counts.C
        ? a === "C"
          ? -1
          : b === "C"
            ? 1
            : a === "H"
              ? -1
              : b === "H"
                ? 1
                : a.localeCompare(b)
        : a.localeCompare(b),
    );
  return (
    keys.map((k) => k + (counts[k] === 1 ? "" : counts[k])).join("") +
    (charge
      ? `${Math.abs(charge) === 1 ? "" : Math.abs(charge)}${charge > 0 ? "+" : "−"}`
      : "")
  );
}
export function substructure(rd, input, smarts) {
  const mol = rd.get_mol(input);
  let q;
  try {
    if (!mol) throw Error("Invalid molecule.");
    q = rd.get_qmol(smarts);
    if (!q) throw Error("Invalid SMARTS query.");
    const matches = JSON.parse(mol.get_substruct_matches(q));
    const list = Array.isArray(matches) ? matches : [];
    return {
      count: list.length,
      atoms: [...new Set(list.flatMap((m) => m.atoms || []))],
      bonds: [...new Set(list.flatMap((m) => m.bonds || []))],
    };
  } finally {
    mol?.delete();
    q?.delete();
  }
}
export function canonicalSmiles(rd, input) {
  let mol, normalized;
  try {
    mol = rd.get_mol(input);
    if (!mol) throw Error("Invalid molecular structure.");
    normalized = rd.get_mol(mol.remove_hs());
    if (!normalized) throw Error("Cannot normalize molecular hydrogens.");
    return normalized.get_smiles();
  } finally {
    normalized?.delete();
    mol?.delete();
  }
}
export function analyzeMolecule(rd, input) {
  const mol = rd.get_mol(input);
  if (!mol)
    throw Error("Invalid molecule: check atom valences and input syntax.");
  let normalized;
  try {
    normalized = rd.get_mol(mol.remove_hs());
    if (!normalized) throw Error("Cannot normalize molecular hydrogens.");
    const descriptors = JSON.parse(normalized.get_descriptors()),
      graph = JSON.parse(mol.get_json());
    if (!graph.molecules[0].atoms.length)
      throw Error("Draw or load a molecule first.");
    const { counts, charge } = formulaCounts(graph),
      smiles = normalized.get_smiles();
    const groups = [];
    for (const [name, smarts] of FUNCTIONAL_GROUPS) {
      const q = rd.get_qmol(smarts);
      if (!q) continue;
      try {
        const matches = JSON.parse(mol.get_substruct_matches(q));
        if (Array.isArray(matches) && matches.length)
          groups.push({
            name,
            smarts,
            count: matches.length,
            atoms: [...new Set(matches.flatMap((m) => m.atoms))],
          });
      } finally {
        q.delete();
      }
    }
    const rules = [
      ["Molecular weight ≤ 500", descriptors.amw, 500],
      ["Calculated logP ≤ 5", descriptors.CrippenClogP, 5],
      ["H-bond donors ≤ 5", descriptors.NumHBD, 5],
      ["H-bond acceptors ≤ 10", descriptors.NumHBA, 10],
    ].map(([label, value, limit]) => ({
      label,
      value,
      limit,
      pass: value <= limit,
    }));
    const inchi = normalized.get_inchi();
    return {
      smiles,
      formula: hillFormula(counts, charge),
      counts,
      charge,
      descriptors,
      groups,
      rules,
      inchi,
      inchikey: inchi ? rd.get_inchikey_for_inchi(inchi) : "",
      stereo: JSON.parse(mol.get_stereo_tags()),
      atomCount: graph.molecules[0].atoms.length,
      bondCount: graph.molecules[0].bonds.length,
      svg: mol.get_svg(480, 280),
      fingerprint: normalized.get_morgan_fp(),
    };
  } finally {
    normalized?.delete();
    mol.delete();
  }
}
export function tanimoto(a, b) {
  if (a.length !== b.length || !/^[01]+$/.test(a + b))
    throw Error("Matching binary fingerprints are required.");
  let intersection = 0,
    union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "1" || b[i] === "1") union++;
    if (a[i] === "1" && b[i] === "1") intersection++;
  }
  return union ? intersection / union : 1;
}
export function compareMolecules(rd, a, b) {
  const left = analyzeMolecule(rd, a),
    right = analyzeMolecule(rd, b);
  let x = rd.get_mol(left.smiles),
    y = rd.get_mol(right.smiles);
  try {
    return {
      left,
      right,
      similarity: tanimoto(left.fingerprint, right.fingerprint),
      same: left.smiles === right.smiles,
      leftContainsRight:
        Object.keys(JSON.parse(x.get_substruct_match(y))).length > 0,
      rightContainsLeft:
        Object.keys(JSON.parse(y.get_substruct_match(x))).length > 0,
    };
  } finally {
    x?.delete();
    y?.delete();
  }
}
export function batchAnalyze(rd, text) {
  const lines = text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (lines.length > 200) throw Error("Use up to 200 structures per batch.");
  return lines.map((line, i) => {
    const parts = line.split(/\t/),
      input = parts[0].trim(),
      name = parts.slice(1).join(" ").trim() || `Molecule ${i + 1}`;
    try {
      const a = analyzeMolecule(rd, input);
      return {
        name,
        input,
        smiles: a.smiles,
        formula: a.formula,
        mw: a.descriptors.amw,
        logP: a.descriptors.CrippenClogP,
        tpsa: a.descriptors.tpsa,
        hbd: a.descriptors.NumHBD,
        hba: a.descriptors.NumHBA,
        violations: a.rules.filter((r) => !r.pass).length,
        status: "Valid",
      };
    } catch (e) {
      return { name, input, status: "Invalid", error: e.message };
    }
  });
}
export function csvText(rows) {
  if (!rows.length) return "";
  const keys = [...new Set(rows.flatMap(Object.keys))];
  const cell = (v) =>
    `"${(typeof v === "string" && /^[=+@-]/.test(v) ? "'" + v : String(v ?? "")).replaceAll('"', '""')}"`;
  return [
    keys.map(cell).join(","),
    ...rows.map((r) => keys.map((k) => cell(r[k])).join(",")),
  ].join("\r\n");
}
// Natural isotope abundances are approximate terrestrial averages; nominal M+n envelope, not a measured mass spectrum.
const isotopes = {
  C: [
    [0, 0.9893],
    [1, 0.0107],
  ],
  H: [
    [0, 0.999885],
    [1, 0.000115],
  ],
  N: [
    [0, 0.99636],
    [1, 0.00364],
  ],
  O: [
    [0, 0.99757],
    [1, 0.00038],
    [2, 0.00205],
  ],
  S: [
    [0, 0.9499],
    [1, 0.0075],
    [2, 0.0425],
    [4, 0.0001],
  ],
  P: [[0, 1]],
  F: [[0, 1]],
  Cl: [
    [0, 0.7576],
    [2, 0.2424],
  ],
  Br: [
    [0, 0.5069],
    [2, 0.4931],
  ],
  I: [[0, 1]],
  Na: [[0, 1]],
};
export function isotopeEnvelope(counts, peaks = 8) {
  let distribution = [1, ...Array(peaks - 1).fill(0)];
  for (const [element, count] of Object.entries(counts)) {
    if (!count) continue;
    if (!isotopes[element])
      throw Error(`Isotope model does not include ${element}.`);
    if (!Number.isInteger(count) || count < 0 || count > 1000)
      throw Error("Invalid atom count for isotope envelope.");
    for (let n = 0; n < count; n++) {
      const next = Array(peaks).fill(0);
      for (let i = 0; i < peaks; i++)
        for (const [offset, p] of isotopes[element])
          if (i + offset < peaks) next[i + offset] += distribution[i] * p;
      distribution = next;
    }
  }
  const max = Math.max(...distribution);
  return distribution.map((p, i) => ({
    offset: i,
    probability: p,
    relative: max ? (p / max) * 100 : 0,
  }));
}
export function solutionAmounts(mw, massMg, volumeMl) {
  if (
    !Number.isFinite(mw) ||
    mw <= 0 ||
    !Number.isFinite(massMg) ||
    massMg < 0 ||
    !Number.isFinite(volumeMl) ||
    volumeMl <= 0
  )
    throw Error(
      "Use a positive molecular weight and volume, and a nonnegative mass.",
    );
  const mmol = massMg / mw;
  return {
    mmol,
    moles: mmol / 1000,
    molarity: mmol / volumeMl,
    millimolar: (mmol / volumeMl) * 1000,
  };
}
export function dilution(stockMm, targetMm, finalMl) {
  if (
    ![stockMm, targetMm, finalMl].every(Number.isFinite) ||
    stockMm <= 0 ||
    targetMm < 0 ||
    finalMl <= 0 ||
    targetMm > stockMm
  )
    throw Error(
      "Target concentration must be between zero and the positive stock concentration.",
    );
  const stockMl = (targetMm * finalMl) / stockMm;
  return { stockMl, solventMl: finalMl - stockMl };
}
export function parseSdf3D(text) {
  const lines = text.replaceAll("\r", "").split("\n");
  if (!lines[3]?.includes("V2000")) throw Error("A V2000 3D SDF is required.");
  const n = Number(lines[3].slice(0, 3)),
    m = Number(lines[3].slice(3, 6));
  if (
    !Number.isInteger(n) ||
    n < 1 ||
    n > 1000 ||
    !Number.isInteger(m) ||
    m < 0
  )
    throw Error("Invalid conformer counts.");
  const atoms = lines.slice(4, 4 + n).map((l, i) => ({
    id: i + 1,
    x: Number(l.slice(0, 10)),
    y: Number(l.slice(10, 20)),
    z: Number(l.slice(20, 30)),
    element: l.slice(31, 34).trim(),
  }));
  const bonds = lines.slice(4 + n, 4 + n + m).map((l) => ({
    a: Number(l.slice(0, 3)),
    b: Number(l.slice(3, 6)),
    order: Number(l.slice(6, 9)),
  }));
  if (
    atoms.length !== n ||
    bonds.length !== m ||
    atoms.some((a) => ![a.x, a.y, a.z].every(Number.isFinite)) ||
    bonds.some((b) => !atoms[b.a - 1] || !atoms[b.b - 1])
  )
    throw Error("Invalid conformer coordinates or bonds.");
  return { atoms, bonds };
}
const sub = (a, b) => [a.x - b.x, a.y - b.y, a.z - b.z],
  dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0),
  cross = (a, b) => [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ],
  norm = (a) => Math.hypot(...a),
  unit = (a) => {
    const n = norm(a);
    if (n < 1e-9)
      throw Error(
        "Coincident or collinear atoms cannot define this measurement.",
      );
    return a.map((v) => v / n);
  };
export function measureGeometry(atoms, ids) {
  if ([...ids].some((id) => !Number.isInteger(Number(id)) || Number(id) <= 0))
    throw Error("Choose valid atom indices.");
  if (new Set(ids.map(Number)).size !== ids.length)
    throw Error("Choose distinct atoms.");
  const points = ids.map((id) => atoms.find((a) => a.id === Number(id)));
  if (points.some((p) => !p)) throw Error("Choose valid atom indices.");
  if (points.length === 2)
    return {
      value: norm(sub(points[0], points[1])),
      unit: "Å",
      label: "Distance",
    };
  if (points.length === 3) {
    const a = unit(sub(points[0], points[1])),
      b = unit(sub(points[2], points[1]));
    return {
      value: (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI,
      unit: "°",
      label: "Angle",
    };
  }
  if (points.length === 4) {
    const b0 = sub(points[0], points[1]),
      b1 = unit(sub(points[2], points[1])),
      b2 = sub(points[3], points[2]),
      v = b0.map((x, i) => x - dot(b0, b1) * b1[i]),
      w = b2.map((x, i) => x - dot(b2, b1) * b1[i]);
    unit(v);
    unit(w);
    return {
      value: (Math.atan2(dot(cross(b1, v), w), dot(v, w)) * 180) / Math.PI,
      unit: "°",
      label: "Signed dihedral",
    };
  }
  throw Error("Choose 2, 3 or 4 atoms.");
}
export function validateNotebook(data) {
  if (!Array.isArray(data) || data.length > 100)
    throw Error("Notebook must contain up to 100 entries.");
  return data.map((e) => {
    if (
      !e ||
      typeof e.smiles !== "string" ||
      e.smiles.length > 20000 ||
      typeof e.title !== "string" ||
      typeof e.notes !== "string"
    )
      throw Error("Invalid notebook entry.");
    return {
      id: String(e.id),
      title: e.title.slice(0, 200),
      smiles: e.smiles,
      notes: e.notes.slice(0, 10000),
      createdAt: String(e.createdAt),
    };
  });
}
