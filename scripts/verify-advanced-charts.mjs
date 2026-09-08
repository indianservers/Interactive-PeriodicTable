import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {nmrCouplingTree,nmrMultiplet} from '../src/pages/advancedChartModels.js';
for(let n=0;n<=6;n++)for(const [j,f] of [[1,800],[7,400],[15,200]]){
  const tree=nmrCouplingTree(n,j,3,f);
  assert.equal(tree.length,n+1);
  assert.deepEqual(tree.at(-1).nodes,nmrMultiplet(n,j,3,f));
  for(const {level,nodes,edges} of tree){
    assert.equal(nodes.reduce((sum,p)=>sum+p.intensity,0),2**level);
    assert.equal(edges.length,2*level);
    for(const edge of edges)assert.ok(Math.abs(Math.abs(nodes[edge.child].ppm-tree[level-1].nodes[edge.parent].ppm)-j/(2*f))<1e-12);
  }
}
const targets=await(await fetch('http://127.0.0.1:9224/json/list')).json();const ws=new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
await new Promise(r=>ws.addEventListener('open',r,{once:true}));let id=0;const pending=new Map(),errors=[];
ws.onmessage=({data})=>{const m=JSON.parse(data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p.reject(m.error):p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown'&&!m.params.exceptionDetails.url?.startsWith('chrome-extension:'))errors.push(m.params.exceptionDetails.text);};
function cmd(method,params={}){return new Promise((resolve,reject)=>{const n=++id;pending.set(n,{resolve,reject});ws.send(JSON.stringify({id:n,method,params}));});}
async function ev(expression){const r=await cmd('Runtime.evaluate',{expression,returnByValue:true});if(r.exceptionDetails)throw Error(r.exceptionDetails.text);return r.result.value;}
const wait=ms=>new Promise(r=>setTimeout(r,ms));await cmd('Runtime.enable');errors.length=0;
const results=[];
for(const [kind,label,value] of [['reaction','Barrier parameter','90'],['rdf','Structural disorder','.8'],['nmr','Equivalent neighbours','3']]){
  await ev(`document.querySelector('.avc-gallery button.${kind}').click()`);await wait(750);
  const initial=await ev(`document.querySelector('.avc-chart-workspace svg').innerHTML`);
  await ev(`(()=>{const e=document.querySelector('input[aria-label="${label}"]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,'${value}');e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));})()`);await wait(200);
  const changed=await ev(`document.querySelector('.avc-chart-workspace svg').innerHTML`);
  const values=await ev(`document.querySelector('.avc-chart-readouts').textContent`);
  const cap=await cmd('Page.captureScreenshot',{format:'png'});await writeFile(`docs/target-ui-verification/032-${kind}-experiment.png`,Buffer.from(cap.data,'base64'));
  await ev(`document.querySelector('.avc-chart-experiment>header button').click()`);await wait(100);
  results.push({kind,curveChanged:initial!==changed,values,resetRestored:initial===await ev(`document.querySelector('.avc-chart-workspace svg').innerHTML`),noUnrelatedDrawer:await ev(`!document.querySelector('.avc-library-overlay')`)});
}
await ev(`document.querySelector('.avc-gallery button.orbital').click()`);await wait(400);
const result={results,errors,orbitalRestored:await ev(`!!document.querySelector('.avc-webgl canvas')`)};console.log(JSON.stringify(result));await writeFile('docs/target-ui-verification/032-chart-functional-audit.json',JSON.stringify(result,null,2));ws.close();
