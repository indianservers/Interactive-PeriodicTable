import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {initialMotion,actMotion,stepMotion} from '../src/modules/core-simulations/chromatographyMotion.js';
const out='docs/chemistry-vl-mockup-rebuild/motion-verification/chromatography';await mkdir(out,{recursive:true});
const results=[];
for(const fps of [30,60,120]){
 let s=initialMotion();const advance=seconds=>{for(let i=0;i<seconds*fps;i++){stepMotion(s,1/fps);assert(Math.abs(s.tubeVolume+s.pipetteVolume+s.plateVolume-1000)<1e-8);}};
 actMotion(s,'dispense');assert.equal(s.phase,'idle');
 actMotion(s,'shake');advance(1);assert(Math.abs(s.angle)>.001);assert(Math.abs(s.slosh)>.001);const early={...s};
 advance(2.1);assert.equal(s.phase,'settling');const amplitude=Math.abs(s.slosh)+Math.abs(s.sloshVelocity);advance(4);assert.equal(s.phase,'mixed');assert(Math.abs(s.slosh)+Math.abs(s.sloshVelocity)<amplitude);
 actMotion(s,'aspirate');advance(3);assert.equal(s.phase,'aspirated');assert(Math.abs(s.pipetteVolume-2)<1e-8);
 actMotion(s,'dispense');advance(3);assert.equal(s.phase,'spotted');assert(Math.abs(s.plateVolume-2)<1e-8);
 actMotion(s,'place');advance(2);actMotion(s,'develop');advance(4);assert(s.front>.45&&s.front<.55);
 const frozen=JSON.stringify(s);actMotion(s,'pause');advance(1);actMotion(s,'pause');assert.equal(JSON.stringify(s),frozen);
 advance(5);assert.equal(s.phase,'developed');actMotion(s,'inspect');advance(2);actMotion(s,'uv');assert(s.uv);assert.equal(s.phase,'inspected');
 results.push({fps,early:{angle:early.angle,slosh:early.slosh},final:{phase:s.phase,volume:s.tubeVolume+s.pipetteVolume+s.plateVolume,front:s.front}});
 s=actMotion(s,'reset');assert.deepEqual(s,initialMotion());
}
await writeFile(`${out}/model-verification.json`,JSON.stringify({passed:true,checks:['invalid transition','independent liquid inertia','settling','capacity','volume conservation every frame','TLC front','pause','UV','exact reset'],results},null,2));console.log('Chromatography motion model checks passed at 30, 60, 120 FPS');
