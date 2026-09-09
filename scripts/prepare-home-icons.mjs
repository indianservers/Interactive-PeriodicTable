import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.HOME_ICON_SHARP || 'sharp');
const sources = JSON.parse(fs.readFileSync('docs/home-icon-sources.json', 'utf8').replace(/^\uFEFF/,''));
fs.mkdirSync('public/assets/home-icons', {recursive:true});
for(const [name, source] of Object.entries(sources)) {
 await sharp(source).resize(192,192,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png({compressionLevel:9,palette:true,quality:90}).toFile(path.join('public/assets/home-icons',`${name}.png`));
}
console.log(`Prepared ${Object.keys(sources).length} optimized PNG icons.`);
