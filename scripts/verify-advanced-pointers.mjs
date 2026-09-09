import * as THREE from 'three';
import {writeFile} from 'node:fs/promises';
import {surfaceEnergy} from '../src/pages/advancedSurfaceModel.js';
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await cmd('Runtime.enable');errors.length=0;
const results=[];
try {
  for(const kind of ['surface','lattice']){
    await ev(`document.querySelector('.avc-gallery button.${kind}').click()`);await wait(750);
    const r=await ev(`(()=>{const r=document.querySelector('.avc-lattice-canvas canvas').getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};})()`);
    const camera=new THREE.PerspectiveCamera(40,r.width/r.height,.05,100);
    camera.position.set(...(kind==='surface'?[4.8,4,5]:[11,8,13]));camera.lookAt(0,kind==='surface'?.6:0,0);camera.updateMatrixWorld();
    const point=kind==='surface'?new THREE.Vector3(-.5,surfaceEnergy(-.5,.4,40,25)*.025,.4):new THREE.Vector3(Math.PI,Math.PI/2,0);
    point.project(camera);const x=r.x+(point.x+1)*r.width/2,y=r.y+(1-point.y)*r.height/2;
    const read=()=>ev(`Array.from(document.querySelectorAll('.avc-chart-workspace input')).map(e=>Number(e.value))`);
    const before=await read();
    await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});
    await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});await wait(150);
    const after=await read();
    const correct=kind==='surface'?Math.abs(after[2]+.5)<.03&&Math.abs(after[3]-.4)<.03:after[1]===2&&after[2]===1&&after[3]===0;
    await cmd('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
    await cmd('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+40,y:y+20,button:'left',buttons:1});
    await cmd('Input.dispatchMouseEvent',{type:'mouseReleased',x:x+40,y:y+20,button:'left',clickCount:1});await wait(150);
    const dragDoesNotSelect=JSON.stringify(after)===JSON.stringify(await read());
    results.push({kind,before,after,correct,dragDoesNotSelect});
  }
} finally {
  await ev(`document.querySelector('.avc-gallery button.orbital').click()`);ws.close();
}
const audit={results,errors,passed:results.length===2&&results.every(r=>r.correct&&r.dragDoesNotSelect)&&errors.length===0};
await writeFile('docs/target-ui-verification/032-pointer-functional-audit.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit,null,2));if(!audit.passed)process.exitCode=1;
