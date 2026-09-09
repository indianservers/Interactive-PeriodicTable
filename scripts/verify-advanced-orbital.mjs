import { writeFile } from 'node:fs/promises';
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown'&&!m.params.exceptionDetails.url?.startsWith('chrome-extension:')) errors.push(m.params.exceptionDetails.text);};
function command(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function evaluate(expression){const r=await command('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const delay=ms=>new Promise(r=>setTimeout(r,ms));
await command('Runtime.enable'); errors.length=0;
const checks=[];
async function check(name,action){const before=await evaluate('document.querySelector(".avc-webgl canvas").toDataURL()');await evaluate(action);await delay(300);const after=await evaluate('document.querySelector(".avc-webgl canvas").toDataURL()');checks.push({name,renderChanged:before!==after});}
const click=text=>`Array.from(document.querySelectorAll('.avc-app button')).find(b=>b.textContent.includes(${JSON.stringify(text)})).click()`;
await check('Isovalue changes geometry',`(()=>{const e=document.querySelector('input[aria-label="Isovalue"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'.06');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await check('HOMO to LUMO changes nodes',`(()=>{const e=document.querySelector('.avc-controls select');e.value='LUMO (π*)';e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await check('Atoms toggle',click('Show atoms'));
await check('Density representation',click('Compare electron density'));
await check('Publication scene style',click('Publication'));
await check('Transparent surface preset',click('Transparent'));
await check('Clipping section',`(()=>{const e=document.querySelectorAll('.avc-controls select')[1];e.value='XY';e.dispatchEvent(new Event('change',{bubbles:true}));})()`);
await check('Density-only representation',click('Electron density (|ψ|²)'));
await check('Rotate camera/model',click('Rotate'));
await check('Zoom camera',click('Zoom'));
await check('Play advances model',click('Play animation'));
await evaluate(click('Pause animation'));await delay(100);
const a=await evaluate('document.querySelector(".avc-webgl canvas").toDataURL()');await delay(250);checks.push({name:'Pause freezes render',pass:a===await evaluate('document.querySelector(".avc-webgl canvas").toDataURL()')});
await evaluate(click('Reset'));await delay(250);
checks.push({name:'Reset initial state',pass:await evaluate(`document.querySelector('input[aria-label="Isovalue"]').value==='0.03'&&document.querySelector('.avc-controls select').value==='HOMO (π)'`)});
await evaluate(`Array.from(document.querySelectorAll('.avc-app button')).find(b=>b.textContent.includes('Tools')).focus()`);
await evaluate(click('Tools'));await delay(400);
checks.push({name:'Lesson drawer receives focus',pass:await evaluate(`document.querySelector('.avc-library-overlay').contains(document.activeElement)`)});
await command('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
await delay(200);
checks.push({name:'Escape closes drawer and restores focus',pass:await evaluate(`!document.querySelector('.avc-library-overlay')&&document.activeElement.textContent.includes('Tools')`)});
const result={checks,errors};await writeFile('docs/target-ui-verification/032-orbital-functional-audit.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));ws.close();
