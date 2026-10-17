import { parseMolfile, structureMolfile } from "./structureDrawing.js";
export function validateDrawWorkspace(data) {
  if (
    !data ||
    data.version !== 1 ||
    !Array.isArray(data.documents) ||
    !data.documents.length ||
    data.documents.length > 30
  )
    throw Error(
      "Choose a Chemistry Universe workspace file (version 1, up to 30 documents).",
    );
  const ids = new Set();
  const documents = data.documents.map((d) => {
    if (
      !Number.isInteger(d.id) ||
      ids.has(d.id) ||
      typeof d.title !== "string" ||
      typeof d.name !== "string"
    )
      throw Error("Invalid document metadata.");
    ids.add(d.id);
    const m = d.model;
    if (
      !m ||
      !Array.isArray(m.atoms) ||
      !Array.isArray(m.bonds) ||
      m.atoms.length > 500 ||
      m.bonds.length > 1000
    )
      throw Error("Invalid document graph.");
    const atomIds = new Set();
    for (const a of m.atoms) {
      if (
        !Number.isInteger(a.id) ||
        atomIds.has(a.id) ||
        ![a.x, a.y].every(Number.isFinite) ||
        Math.abs(a.x) > 1e6 ||
        Math.abs(a.y) > 1e6 ||
        !/^([A-Z][a-z]?)$/.test(a.element) ||
        (a.charge !== undefined &&
          (!Number.isInteger(a.charge) || Math.abs(a.charge) > 8))
      )
        throw Error("Invalid atom in workspace.");
      atomIds.add(a.id);
    }
    for (const b of m.bonds)
      if (
        !atomIds.has(b.a) ||
        !atomIds.has(b.b) ||
        b.a === b.b ||
        ![1, 2, 3, 4].includes(b.order) ||
        (b.stereo !== undefined && ![0, 1, 6].includes(b.stereo))
      )
        throw Error("Invalid bond in workspace.");
    parseMolfile(structureMolfile(m));
    if (d.sdfText && (typeof d.sdfText !== "string" || d.sdfText.length > 2e6))
      throw Error("Invalid conformer size.");
    return {
      id: d.id,
      title: d.title.slice(0, 200),
      name: d.name.slice(0, 200),
      model: m,
      sdfText: d.sdfText || "",
    };
  });
  if (!ids.has(data.activeDocumentId))
    throw Error("Active document is missing.");
  return {
    version: 1,
    documents,
    activeDocumentId: data.activeDocumentId,
    annotation: String(data.annotation || "").slice(0, 10000),
    settings: {
      grid: Boolean(data.settings?.grid),
      labels: data.settings?.labels !== false,
    },
  };
}
