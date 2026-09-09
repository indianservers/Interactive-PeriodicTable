import {writeFile} from 'node:fs/promises';
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const click=text=>ev(`Array.from(document.querySelectorAll('.avc-compact-actions button')).find(b=>b.textContent===${JSON.stringify(text)}).click()`);
const search=value=>ev(`(()=>{const e=document.querySelector('.avc-compact-actions input');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(value)});e.dispatchEvent(new Event('input',{bubbles:true}));})()`);
await cmd('Runtime.enable');errors.length=0;
const results=[];
try {
  for(const [width,height] of [[1366,768],[820,1180],[390,844]]) {
    await cmd('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(300);
    await ev(`document.querySelector('.avc-app').scrollTop=0`);
    const visible=await ev(`(()=>{const r=document.querySelector('.avc-compact-actions').getBoundingClientRect();return r.height>0&&r.right<=innerWidth&&document.documentElement.scrollWidth===innerWidth;})()`);
    await search('no-such-topic');await wait(100);
    const emptyState=await ev(`!!document.querySelector('.avc-no-results')&&document.querySelectorAll('.avc-gallery>button').length===0`);
    await search('lattice');await wait(100);
    const filtered=await ev(`document.querySelectorAll('.avc-gallery>button').length===1&&!!document.querySelector('.avc-gallery>button.lattice')`);
    await search('');await wait(100);
    await ev(`document.querySelector('.avc-compact-actions summary').click();document.querySelector('.avc-compact-actions summary').focus()`);
    await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
    const escapeMenu=await ev(`!document.querySelector('.avc-compact-actions details').open`);
    await ev(`Array.from(document.querySelectorAll('.avc-compact-actions button')).find(b=>b.textContent==='Library').focus()`);
    await click('Library');await wait(300);
    const modalInert=await ev(`document.querySelector('.avc-app>main').inert&&document.querySelector('.avc-library-overlay').contains(document.activeElement)`);
    await cmd('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await wait(100);
    const restored=await ev(`!document.querySelector('.avc-app>main').inert&&document.activeElement.textContent==='Library'`);
    await ev(`window.exportCount=0;window.savedClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('data:image/png'))window.exportCount++;else window.savedClick.call(this);}`);
    try {await click('Export');} finally {await ev(`HTMLAnchorElement.prototype.click=window.savedClick;delete window.savedClick`);}
    const exported=await ev('window.exportCount===1');
    const screenshot=await cmd('Page.captureScreenshot',{format:'png'});
    await writeFile(`docs/target-ui-verification/032-responsive-${width}.png`,Buffer.from(screenshot.data,'base64'));
    results.push({width,height,visible,emptyState,filtered,escapeMenu,modalInert,restored,exported});
  }
  await ev(`document.querySelector('.avc-compact-actions summary').click()`);await click('Home');await wait(400);
  results.push({homeNavigates:await ev(`location.hash==='#dashboard'&&!document.querySelector('.avc-app')`)});
} finally {
  await ev(`location.hash='#advanced-visuals'`);await wait(400);
  await cmd('Emulation.setDeviceMetricsOverride',{width:1672,height:941,deviceScaleFactor:1,mobile:false});ws.close();
}
const audit={results,errors,passed:results.every(r=>Object.entries(r).every(([k,v])=>['width','height'].includes(k)||v===true))&&errors.length===0};
await writeFile('docs/target-ui-verification/032-responsive-functional-audit.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit,null,2));if(!audit.passed)process.exitCode=1;
