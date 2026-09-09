export const rcsbEntryUrl = (pdbId) => `https://data.rcsb.org/rest/v1/core/entry/${encodeURIComponent(pdbId)}`;
export const rcsbStructureUrl = (pdbId) => `https://files.rcsb.org/download/${encodeURIComponent(pdbId)}.cif`;

