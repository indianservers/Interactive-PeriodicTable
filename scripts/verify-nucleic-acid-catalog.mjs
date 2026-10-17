import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
const base = new URL('../', import.meta.url);
const rows = JSON.parse(await readFile(new URL('src/modules/nucleic-acid-explorer/structureCatalog.json', base), 'utf8'));
assert.equal(rows.length, 48);
assert.equal(new Set(rows.map(s => s.id)).size, rows.length);
for (const s of rows) {
 assert.match(s.id, /^[0-9][A-Z0-9]{3}$/);
 assert.equal(s.sourceUrl, `https://www.rcsb.org/structure/${s.id}`);
 assert(s.name && s.method && s.organism && s.verifiedOn);
 assert(s.resolution === 'N/A' || /^\d+\.\d{2} Å$/.test(s.resolution));
 if (s.cached) {
  const cif = await readFile(new URL(`public/assets/nucleic-acid/structures/${s.id}.cif`,base),'utf8');
  assert.match(cif.slice(0,80),new RegExp(`^data_${s.id}`, 'i'));
  assert(cif.includes('_atom_site.Cartn_x') && cif.includes('_atom_site.Cartn_y') && cif.includes('_atom_site.Cartn_z'));
 }
 const preview = await readFile(new URL(`public/assets/nucleic-acid/previews/${s.id}.jpeg`,base));
 assert(preview.length > 1000, `${s.id}: missing preview pixels`);
 assert.equal(preview[0], 0xff);
 assert.equal(preview[1], 0xd8);
}
console.log(`Verified ${rows.length} unique experimental structures, provenance, previews, and cached coordinates.`);
