import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {reciprocalVector} from '../src/pages/advancedLatticeModel.js';
assert.equal(reciprocalVector(8,1,0,0).spacing,reciprocalVector(4,1,0,0).spacing/2);
assert.ok(Math.abs(2*Math.PI/reciprocalVector(4,1,1,0).magnitude-4/Math.sqrt(2))<1e-10);
assert.equal(reciprocalVector(4,0,0,0).magnitude,0);
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown'&&!m.params.exceptionDetails.url?.startsWith('chrome-extension:'))errors.push(m.params.exceptionDetails.text);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));await cmd('Runtime.enable');errors.length=0;
await ev(`document.querySelector('.avc-gallery button.lattice').click()`);await wait(850);
const initial=await cmd('Page.captureScreenshot',{format:'png'});
await ev(`(()=>{const e=document.querySelector('input[aria-label="Direct lattice constant"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'8');e.dispatchEvent(new Event('input',{bubbles:true}));})()`);await wait(200);
const expanded=await cmd('Page.captureScreenshot',{format:'png'});
const values=await ev(`document.querySelector('.avc-chart-readouts').textContent`);
await ev(`document.querySelector('.avc-chart-workspace>aside button').click()`);await wait(100);
const hidden=await cmd('Page.captureScreenshot',{format:'png'});
await ev(`document.querySelector('.avc-lattice-canvas canvas').focus()`);await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowLeft',code:'ArrowLeft',windowsVirtualKeyCode:37});await wait(100);
const rotated=await cmd('Page.captureScreenshot',{format:'png'});
await ev(`document.querySelector('.avc-chart-experiment>header button').click()`);await wait(200);
const reset=await cmd('Page.captureScreenshot',{format:'png'});await writeFile('docs/target-ui-verification/032-lattice-experiment.png',Buffer.from(reset.data,'base64'));
const result={calculationChecks:true,spacingChangesScene:initial.data!==expanded.data,values,zoneChangesScene:expanded.data!==hidden.data,keyboardRotates:hidden.data!==rotated.data,resetReadout:await ev(`document.querySelector('input[aria-label="Direct lattice constant"]').value==='4'`),noUnrelatedDrawer:await ev(`!document.querySelector('.avc-library-overlay')`),errors};
console.log(JSON.stringify(result));await writeFile('docs/target-ui-verification/032-lattice-functional-audit.json',JSON.stringify(result,null,2));ws.close();
