import {writeFile} from 'node:fs/promises';
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();
const pageTarget=targets.find(t=>t.type==='page'&&/(127\.0\.0\.1:(5173|5198|5176))/.test(t.url)&&t.url.includes('#molecule'))||targets.find(t=>t.type==='page'&&/(127\.0\.0\.1:(5173|5198|5176))/.test(t.url))||targets.find(t=>t.type==='page');
if(!pageTarget) throw Error('No Molecule Studio page target found');
const ws=new WebSocket(pageTarget.webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails.text);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await cmd('Runtime.enable');await cmd('Page.enable');errors.length=0;
for(let i=0;i<40;i++){if(await ev('!!document.querySelector(".ms-canvas canvas")'))break;await wait(250);}
if(!await ev('!!document.querySelector(".ms-canvas canvas")')) throw Error('Molecule canvas did not render');
const results=[];
const text=()=>ev(`document.body.innerText`);
const click=(selector)=>ev(`document.querySelector(${JSON.stringify(selector)}).click()`);
await click('.ms-palette button:nth-child(1)');await wait(120);
const initialAtom=await ev('document.querySelector(".ms-selected").textContent.trim()');
results.push({route:await ev('location.hash'),canvas:await ev('!!document.querySelector(".ms-canvas canvas")'),initial:await ev('document.querySelector(".ms-selected").textContent.trim()')});
await click('.ms-palette button:nth-child(3)');await wait(120);results.push({oxygenPalette:await ev('document.querySelector(".ms-selected").textContent.includes("O")'),selectionChanged:initialAtom!==await ev('document.querySelector(".ms-selected").textContent.trim()')});
await click('.ms-inspector-tabs button:nth-child(3)');results.push({notes:await ev('!!document.querySelector(".ms-notes textarea")')});
await click('.ms-inspector-tabs button:nth-child(2)');results.push({properties:await ev('document.querySelector(".ms-properties")?.innerText.includes("Calculated properties")'),tabsDistinct:await ev('!document.querySelector(".ms-properties")?.innerText.includes("Selected Atom")')});
await click('.ms-tools button:nth-child(2)');await wait(100);results.push({dragNotice:await ev('document.querySelector(".ms-notice")?.textContent.includes("Drag atom mode")')});
await click('.ms-tools button:nth-child(3)');results.push({bondNotice:await ev('document.querySelector(".ms-notice")?.textContent.includes("Bond tool")')});
await click('.ms-tools button:nth-child(7)');await wait(100);const fillOn=await ev('document.querySelector(".ms-tools button:nth-child(7)").classList.contains("active")');await click('.ms-tools button:nth-child(7)');const fillOff=await ev('!document.querySelector(".ms-tools button:nth-child(7)").classList.contains("active")');results.push({spacefillToggles:fillOn&&fillOff});
await click('.ms-title button:nth-child(1)');results.push({save:await ev('document.querySelector(".ms-notice")?.textContent.includes("saved")')});
await click('.ms-title button:nth-child(2)');results.push({load:await ev('document.querySelector(".ms-notice")?.textContent.includes("loaded")')});
await click('.ms-build .ms-tabs button:nth-child(3)');await wait(80);results.push({expandedPresets:await ev('document.querySelector(".ms-preset-list")?.innerText.includes("Hydrogen cyanide")&&document.querySelector(".ms-preset-list")?.innerText.includes("Ethylene glycol")')});
const audit={results,errors,passed:results.every(r=>Object.values(r).every(v=>v===true||typeof v==='string'&&v.length>0))&&errors.length===0};
await writeFile('docs/target-ui-verification/molecule-studio-functional-audit.json',JSON.stringify(audit,null,2));console.log(JSON.stringify(audit,null,2));ws.close();if(!audit.passed)process.exitCode=1;
