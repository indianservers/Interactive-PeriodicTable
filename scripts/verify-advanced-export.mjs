import {writeFile} from 'node:fs/promises';
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();
const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));
let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));
await cmd('Runtime.enable');
errors.length=0;
await ev(`window.originalAnchorClick=HTMLAnchorElement.prototype.click;window.exports=[];HTMLAnchorElement.prototype.click=function(){if(!this.download)return window.originalAnchorClick.call(this);const href=this.href,filename=this.download;window.exports.push((async()=>{const blob=await(await fetch(href)).blob();if(blob.type==='image/svg+xml'){const text=await blob.text();const doc=new DOMParser().parseFromString(text,'image/svg+xml');return {filename,mime:blob.type,bytes:blob.size,valid:!doc.querySelector('parsererror')&&!!doc.querySelector('text[style]')&&doc.documentElement.getAttribute('width')==='820'};}const bitmap=await createImageBitmap(blob),c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;let painted=0;for(let i=3;i<data.length;i+=4)if(data[i])painted++;bitmap.close();return {filename,mime:blob.type,bytes:blob.size,width:c.width,height:c.height,paintedPixels:painted,valid:painted>1000};})());};`);
let results;
try {
  for(const kind of ['orbital','surface','rdf','reaction','lattice','nmr','dynamics']){
    await ev(`document.querySelector('.avc-gallery button.${kind}').click()`);await wait(700);
    await ev(`Array.from(document.querySelectorAll('.avc-app>aside button')).find(b=>b.textContent.includes('Export')).click()`);
  }
  results=await ev('Promise.all(window.exports)');
} finally {
  await ev('HTMLAnchorElement.prototype.click=window.originalAnchorClick;delete window.originalAnchorClick');
  await ev(`document.querySelector('.avc-gallery button.orbital').click()`);
  ws.close();
}
const audit={results,errors,passed:results.length===7&&results.every(r=>r.valid)&&errors.length===0};
await writeFile('docs/target-ui-verification/032-export-functional-audit.json',JSON.stringify(audit,null,2));
console.log(JSON.stringify(audit,null,2));
if(!audit.passed)process.exitCode=1;
