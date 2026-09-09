const memoryCache = new Map();

export async function fetchJson(url, { signal, retries = 1, cache = true } = {}) {
  if (cache && memoryCache.has(url)) return memoryCache.get(url);
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { signal });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      const data = await response.json();
      if (cache) memoryCache.set(url, data);
      return data;
    } catch (error) {
      if (error.name === "AbortError") throw error;
      lastError = error;
    }
  }
  throw new Error(`Unable to load ${url}: ${lastError?.message || "unknown error"}`);
}

export function clearDataCache() {
  memoryCache.clear();
}

export function normalizeActivity(record, citation) {
  const value = Number(record.standard_value ?? record.standardValue);
  return {
    moleculeId: record.molecule_chembl_id ?? record.moleculeId,
    assayId: record.assay_chembl_id ?? record.assayId,
    activityType: record.standard_type ?? record.activityType,
    standardValue: Number.isFinite(value) ? value : null,
    unit: record.standard_units ?? record.unit ?? null,
    relation: record.standard_relation ?? record.relation ?? null,
    pchembl: Number(record.pchembl_value ?? record.pchembl) || null,
    provenance: citation,
  };
}

export function convertConcentrationToNm(value, unit) {
  const factors = { nM: 1, uM: 1_000, µM: 1_000, mM: 1_000_000 };
  if (!(unit in factors)) throw new Error(`Unsupported concentration unit: ${unit}`);
  return Number(value) * factors[unit];
}

