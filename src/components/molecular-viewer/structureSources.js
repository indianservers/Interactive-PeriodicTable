const FORMAT_ALIASES = {
  ent: 'pdb',
  pdb: 'pdb',
  cif: 'mmcif',
  mmcif: 'mmcif',
  cifcore: 'cifCore',
  'cif-core': 'cifCore',
  mol: 'mol',
  sdf: 'sdf',
};

export function normalizeStructureFormat(value = '') {
  const key = value.toLowerCase().replace(/^\./, '');
  return FORMAT_ALIASES[key] || key;
}

export function inferStructureFormat(name = '') {
  const extension = name.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  return normalizeStructureFormat(extension || '');
}

export function rcsbStructureUrl(pdbId, format = 'pdb') {
  const id = String(pdbId || '').trim().toUpperCase();
  if (!/^[0-9][A-Z0-9]{3}$/.test(id)) throw new Error('Enter a valid four-character PDB ID.');
  const normalized = normalizeStructureFormat(format);
  return `https://files.rcsb.org/download/${id}.${normalized === 'mmcif' ? 'cif' : 'pdb'}`;
}

export function structureSourceKey(source, sourceType, label) {
  if (typeof source === 'string') return `${sourceType}:${label || ''}:${source.length}:${source.slice(0, 64)}`;
  if (source?.data) return `${sourceType}:${label || source.label || ''}:${source.data.length}:${source.data.slice(0, 64)}`;
  if (source?.url) return `${sourceType}:${label || source.label || ''}:${source.url}`;
  return `${sourceType}:${label || ''}:empty`;
}
