import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { libraryEntries } from '../src/data/homeLibrary.js';

// First Git commit adding each identifier to the catalog (or syllabus model).
// These are catalog history dates, not guessed module launch dates.
const dates = {};
for (const entry of libraryEntries.filter(entry => !entry.upcoming)) {
  const source = entry.category === 'bsc-cbcs' ? 'src/modules/core-simulations/syllabusInteractiveModel.js' : 'src/data/homeLibrary.js';
  const date = execFileSync('git', ['log', '--reverse', '--format=%aI', '-S', entry.id, '--', source], { encoding: 'utf8' }).trim().split('\n')[0];
  // Uncommitted catalog additions first become discoverable today.
  dates[entry.id] = date ? date.slice(0,10) : new Date().toISOString().slice(0,10);
}
writeFileSync(new URL('../src/data/catalogDates.js', import.meta.url), `// First catalog appearance recorded in Git. Regenerate with scripts/update-catalog-dates.mjs.\nexport const catalogDates = ${JSON.stringify(dates,null,2)};\n`);
console.log(`Recorded ${Object.keys(dates).length} catalog dates.`);
