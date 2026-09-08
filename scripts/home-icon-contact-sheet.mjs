import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.env.HOME_ICON_SHARP || 'sharp');
const names = fs.readdirSync('public/assets/home-icons').filter(n=>n.endsWith('.png')).sort();
const size=148, cols=8, rows=Math.ceil(names.length/cols), layers=[];
for(let i=0;i<names.length;i++) {
 const x=(i%cols)*size, y=Math.floor(i/cols)*size;
 layers.push({input:await sharp(`public/assets/home-icons/${names[i]}`).resize(116,116).toBuffer(),left:x+16,top:y+3});
 const label=names[i].replace('.png','');
 layers.push({input:Buffer.from(`<svg width="148" height="24"><text x="74" y="16" text-anchor="middle" fill="#cde1f5" font-family="sans-serif" font-size="11">${label}</text></svg>`),left:x,top:y+120});
}
await sharp({create:{width:cols*size,height:rows*size,channels:4,background:'#09182b'}}).composite(layers).png().toFile('docs/home-png-icon-sheet.png');
console.log(`Contact sheet: ${names.length} icons`);
