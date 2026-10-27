import {useEffect,useRef,useState} from 'react';
import {CF_MOLECULES,cfCoordinates} from './conformationalModel.js';

// Reuse one container: 3Dmol 2.x has no public viewer destructor. This bounds
// WebGL contexts and global mouse/resize handlers across section remounts.
let pooledViewer;
async function acquireViewer(){
 if(pooledViewer)return pooledViewer;
 const lib=await import('3dmol'),mol=lib.createViewer?lib:lib.default;
 if(pooledViewer)return pooledViewer;
 const container=document.createElement('div');container.className='cfm-mol-engine';
 const viewer=mol.createViewer(container,{backgroundColor:'#f7fafc',antialias:true,orthographic:true,disableFog:true});
 viewer.setViewStyle({style:'none'});
 pooledViewer={container,viewer};return pooledViewer;
}
export default function ConformationalMolViewer({values,selected,onSelect,onAlign}){
 const host=useRef(),outer=useRef(),api=useRef(),live=useRef();live.current={values,selected,onSelect};
 const[full,setFull]=useState(false),[ready,setReady]=useState(false),[attempt,setAttempt]=useState(0),[status,setStatus]=useState('Loading molecular renderer…');
 useEffect(()=>{
  let cancelled=false,resize,session;setReady(false);setStatus('Loading molecular renderer…');
  acquireViewer().then(({viewer,container})=>{
   if(cancelled)return;
   session={viewer,container,model:null,molecule:null,azimuth:0,fitScale:1};api.current=session;
   host.current.appendChild(container);viewer.resize();
   const draw=()=>{
    if(cancelled)return;
    const {values:v,selected:id}=live.current,m=CF_MOLECULES[v.molecule],positions=cfCoordinates(v),changed=session.molecule!==v.molecule;
    if(changed){
     viewer.clear();session.model=viewer.addModel();session.molecule=v.molecule;
     session.model.addAtoms(m.atoms.map((a,i)=>({serial:a.id,elem:a.element,x:positions[i][0],y:positions[i][1],z:positions[i][2],bonds:m.bonds.flatMap(b=>b.a===i?[b.b]:b.b===i?[b.a]:[]),bondOrder:m.bonds.filter(b=>b.a===i||b.b===i).map(()=>1)})));
    }
    // Explicit topology and force-field coordinates, with no bond guessing or spin.
    session.model.setCoordinates([positions],'array');session.model.setFrame(0);
    const styleKey=[v.style,v.showHydrogens].join(':');
    if(changed||session.styleKey!==styleKey){session.styleKey=styleKey;session.model.setStyle({},v.style==='space'?{sphere:{scale:1,colorscheme:'Jmol'}}:v.style==='sticks'?{stick:{radius:.17,colorscheme:'Jmol'}}:{sphere:{scale:.29,colorscheme:'Jmol'},stick:{radius:.12,colorscheme:'Jmol'}});
    session.model.setColorByElement({},{C:'#414852',H:'#eef0f3',O:'#e33439',Cl:'#32a15a'});
    if(!v.showHydrogens)session.model.setStyle({elem:'H'},{sphere:{hidden:true},stick:{hidden:true}});
    session.model.setClickable({},true,atom=>live.current.onSelect(atom.serial));}
    viewer.removeAllLabels();
    m.atoms.forEach((atom,i)=>{
     if((v.showHydrogens||atom.element!=='H')&&(v.showLabels||atom.id===id))viewer.addLabel(`${atom.element}${atom.id===id?' · ':''}${atom.id}`,{position:{x:positions[i][0],y:positions[i][1],z:positions[i][2]},fontSize:atom.id===id?12:10,fontColor:atom.id===id?'#ffffff':'#334a5a',backgroundColor:atom.id===id?'#24465b':'#f7fafc',showBackground:true,backgroundOpacity:.9,inFront:true,borderRadius:4},undefined,true);
    });
    if(changed){viewer.setView([0,0,0,0,0,0,0,1]);viewer.zoomTo();const fitted=viewer.getView();fitted[0]=fitted[1]=fitted[2]=0;viewer.setView(fitted);session.fitScale=live.current.values.style==='space'?1:1.35;viewer.zoom(session.fitScale);viewer.rotate(55,'y');viewer.rotate(-18,'x');session.azimuth=0;}
    if(!changed){const scale=v.style==='space'?1:1.35;if(scale!==session.fitScale){viewer.zoom(scale/session.fitScale);session.fitScale=scale;}}
    if(session.azimuth!==v.azimuth){viewer.rotate(v.azimuth-session.azimuth,'y');session.azimuth=v.azimuth;}
    viewer.render();
   };
   session.draw=()=>{try{draw();setReady(true);setStatus('');}catch{setReady(false);setStatus('Molecular rendering failed. Retry the renderer or use the Newman projection and geometry ledger.');}};
   session.reset=()=>{viewer.setView([0,0,0,0,0,0,0,1]);viewer.zoomTo();const fitted=viewer.getView();fitted[0]=fitted[1]=fitted[2]=0;viewer.setView(fitted);session.fitScale=live.current.values.style==='space'?1:1.35;viewer.zoom(session.fitScale);viewer.rotate(55,'y');viewer.rotate(-18,'x');viewer.rotate(live.current.values.azimuth,'y');session.azimuth=live.current.values.azimuth;viewer.render();};
   session.align=()=>{const view=viewer.getView();viewer.setView([0,0,0,view[3],0,1,0,0]);session.azimuth=0;viewer.render();};
   resize=new ResizeObserver(()=>{if(!cancelled&&container.isConnected)viewer.resize();});resize.observe(host.current);session.draw();
  }).catch(()=>{if(!cancelled){setReady(false);setStatus('Molecular renderer unavailable. Retry the renderer or use the Newman projection and geometry ledger.');}});
  return()=>{cancelled=true;resize?.disconnect();if(session){session.viewer.spin(false);session.viewer.setViewChangeCallback(null);session.viewer.clear();session.container.remove();}api.current=null;};
 },[attempt]);
 useEffect(()=>{api.current?.draw();},[values,selected]);
 useEffect(()=>{const listener=()=>{setFull(document.fullscreenElement===outer.current);api.current?.viewer.resize();};document.addEventListener('fullscreenchange',listener);return()=>document.removeEventListener('fullscreenchange',listener);},[]);
 return <div className="cfm-scene" ref={outer} data-renderer="3Dmol.js"><div className="cfm-scene-host" ref={host} aria-busy={!ready} role="img" aria-label="3Dmol.js interactive MMFF conformer: drag to rotate, right-drag to pan, scroll to zoom, click to inspect atoms"/>{status&&<div className="cfm-render-status" role="status">{status}{!status.startsWith('Loading')&&<button onClick={()=>setAttempt(n=>n+1)}>Retry molecular renderer</button>}</div>}<div className="cfm-camera"><small><b>3Dmol.js</b> · MMFF94 coordinates · CPK elements · drag to rotate · right-drag to pan · scroll to zoom</small><button disabled={!ready} onClick={()=>{api.current?.viewer.zoom(1.2);api.current?.viewer.render();}}>Zoom 3D in</button><button disabled={!ready} onClick={()=>{api.current?.viewer.zoom(1/1.2);api.current?.viewer.render();}}>Zoom 3D out</button><button disabled={!ready} onClick={()=>api.current?.viewer.translate(-25,0)}>Pan left</button><button disabled={!ready} onClick={()=>api.current?.viewer.translate(25,0)}>Pan right</button><button disabled={!ready} onClick={()=>{onAlign();api.current?.align();}}>Align C1 → C2</button><button disabled={!ready} onClick={()=>api.current?.reset()}>Reset 3D camera</button><button disabled={!ready} onClick={()=>{(full?document.exitFullscreen():outer.current.requestFullscreen())?.catch(()=>setStatus('Fullscreen unavailable.'));}}>{full?'Exit 3D fullscreen':'3D fullscreen'}</button></div></div>;
}
