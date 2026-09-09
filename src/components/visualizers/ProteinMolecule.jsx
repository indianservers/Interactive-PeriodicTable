import {forwardRef,useEffect,useImperativeHandle,useRef,useState} from 'react';
import {displayPosition,interactionTypes} from '../../pages/proteinStudioData.js';
import {Color,Quaternion,Vector3} from 'three';
const chainColor=a=>new Color().setHSL((1-(a.resi-1)/152)*.66,.85,.5).getHex();

export default forwardRef(function ProteinMolecule({data,time=200,modes={Cartoon:true},interactions={},selected=null,hovered=null,onSelect,onHover,mutation=null,mini=false},ref){
 const host=useRef(null),scene=useRef(null),latest=useRef({onSelect,onHover}),[ready,setReady]=useState(false),[error,setError]=useState('');
 latest.current={onSelect,onHover};
 useImperativeHandle(ref,()=>({reset(){const v=scene.current?.viewer;if(v){v.setView(scene.current.home);v.render();}},rotate(axis,angle){scene.current?.viewer.rotate(angle,axis);scene.current?.viewer.render();},zoom(factor){scene.current?.viewer.zoom(factor);scene.current?.viewer.render();},pan(x,y){scene.current?.viewer.translate(x,y);scene.current?.viewer.render();},png(){return scene.current?.viewer.pngURI();}}),[]);
 useEffect(()=>{
  let cancelled=false,observer;
  setReady(false);setError('');
  import('3dmol').then(lib=>{
   if(cancelled)return;
   const mol=lib.createViewer?lib:lib.default;
   mol.setSyncSurface(true);
   const viewer=mol.createViewer(host.current,{backgroundColor:'#06131f',backgroundAlpha:0,antialias:true,disableFog:true,cartoonQuality:15});
   const model=viewer.addModel(data.pdb,'pdb',{keepH:true});
   if(!mini)viewer.setViewStyle({style:'ambientOcclusion',strength:.4,radius:2});
   const atoms=model.selectedAtoms({});
   const originals=atoms.map(a=>({x:a.x,y:a.y,z:a.z,ss:a.ss,resi:a.resi,hetflag:a.hetflag}));
   viewer.setStyle({hetflag:false},{cartoon:{color:'spectrum',thickness:.4}});
   viewer.setStyle({resn:'HEM'},{stick:{radius:.17},sphere:{scale:.2}});
   viewer.setStyle({elem:'Fe'},{sphere:{radius:.7,color:'#ff7d25'}});
   const nitrogen=name=>atoms.find(a=>a.resn==='HEM'&&a.atom===name);
   const na=nitrogen('NA'),nb=nitrogen('NB'),nc=nitrogen('NC'),iron=atoms.find(a=>a.elem.toUpperCase()==='FE');
   const normal=new Vector3(nb.x-na.x,nb.y-na.y,nb.z-na.z).cross(new Vector3(nc.x-na.x,nc.y-na.y,nc.z-na.z)).normalize();
   const center=data.residues.reduce((v,a)=>v.add(new Vector3(a.x,a.y,a.z)),new Vector3()).divideScalar(data.residues.length);
   if(normal.dot(new Vector3(iron.x,iron.y,iron.z).sub(center))<0)normal.negate();
   const q=new Quaternion().setFromUnitVectors(normal,new Vector3(0,0,1));
   viewer.zoomTo({hetflag:false});const orientation=viewer.getView();orientation.splice(4,4,q.x,q.y,q.z,q.w);viewer.setView(orientation);viewer.rotate(105,'z');viewer.zoom(mini?1.3:1.12);
   if(!mini)viewer.setViewChangeCallback(view=>{
    const quaternion=new Quaternion(...view.slice(4,8));
    ['x','y','z'].forEach((axis,i)=>{const v=new Vector3(i===0?1:0,i===1?1:0,i===2?1:0).applyQuaternion(quaternion);const line=host.current?.closest('.ps-viewport')?.querySelector('[data-axis="'+axis+'"]');line?.setAttribute('x2',String(30+v.x*27));line?.setAttribute('y2',String(40-v.y*27));const label=host.current?.closest('.ps-viewport')?.querySelector('[data-axis-label="'+axis+'"]');label?.setAttribute('x',String(30+v.x*32));label?.setAttribute('y',String(40-v.y*32));});
   });
   if(!mini){
    viewer.setClickable({hetflag:false},true,a=>latest.current.onSelect?.(a.resi));
    viewer.setHoverable({hetflag:false},true,a=>latest.current.onHover?.(a.resi),()=>latest.current.onHover?.(null));
    viewer.setHoverDuration(80);
   }
   scene.current={viewer,model,mol,atoms,originals,home:viewer.getView(),surfaceKey:''};
   observer=new ResizeObserver(()=>{viewer.resize();viewer.render();});observer.observe(host.current);
   viewer.render();setReady(true);
  }).catch(e=>{if(!cancelled)setError('WebGL could not start. The sequence and analyses remain available. '+e.message);});
  return()=>{cancelled=true;observer?.disconnect();if(scene.current){scene.current.viewer.clear();scene.current=null;}host.current?.replaceChildren();};
 },[data,mini]);
 useEffect(()=>{
  if(!ready||!scene.current)return;
  const {viewer,model,atoms,originals,mol}=scene.current;
  atoms.forEach((a,i)=>{const pos=displayPosition(originals[i],time,data);Object.assign(a,pos);a.ss=time<45?'c':originals[i].ss;});
  viewer.setStyle({},{});
  if(modes.Cartoon)viewer.setStyle({hetflag:false},{cartoon:{...(time<45?{color:'#a1b4c9'}:{colorfunc:chainColor}),style:'oval',thickness:.35,opacity:1}});
  if(modes.Sticks)viewer.addStyle({hetflag:false},{stick:{radius:.09},sphere:{scale:.13}});
  viewer.setStyle({resn:'HEM'},{stick:{radius:mini?.15:.2},sphere:{scale:.23}});
  viewer.setStyle({elem:'Fe'},{sphere:{radius:.8,color:'#ff792e'}});
  if(selected)viewer.addStyle({resi:selected,hetflag:false},{stick:{radius:.2,color:'#ffd477'},sphere:{scale:.24,color:'#ffd477'}});
  if(hovered)viewer.addStyle({resi:hovered,hetflag:false},{stick:{radius:.22,color:'#f5fbff'}});
  viewer.removeAllShapes();viewer.removeAllLabels();
  const find=a=>atoms.find(b=>b.serial===a.serial)||displayPosition(a,time,data);
  if(!mini){
   // Real, finite-width dashed connectors remain readable at desktop resolution.
   // WebGL line widths are commonly clamped to one pixel by the driver.
   for(const [key,,color] of interactionTypes)if(interactions[key])for(const p of data.interactions[key])viewer.addCylinder({start:find(p.a),end:find(p.b),color,dashed:true,dashLength:.3,gapLength:.18,radius:.09,fromCap:1,toCap:1});
   if(modes.Labels){
    const iron=atoms.find(a=>a.elem.toUpperCase()==='FE');
    viewer.addLabel('Heme group · Fe',{position:iron,fontSize:12,fontColor:'#e4f4ff',backgroundColor:'#0a2338',backgroundOpacity:.8,borderThickness:0,inFront:true});
    const core=atoms.find(a=>a.resi===29&&a.atom==='CB');
    viewer.addLabel('Hydrophobic core',{position:core,fontSize:11,fontColor:'#ffe0a4',backgroundColor:'#402c1b',backgroundOpacity:.8,borderThickness:0,inFront:true});
    for(const resi of selected?[selected]:[]){const a=atoms.find(a=>a.resi===resi&&a.atom==='CA');if(a)viewer.addLabel(a.resn+' '+resi,{position:a,fontSize:11,backgroundColor:'#142639',backgroundOpacity:.8,inFront:true});}
   }else if(selected){const a=atoms.find(a=>a.resi===selected&&a.atom==='CA');if(a)viewer.addLabel(a.resn+' '+selected,{position:a,fontSize:12,backgroundColor:'#24344a',backgroundOpacity:.8,inFront:true});}
   if(mutation){
    const ca=atoms.find(a=>a.resi===mutation.pos&&a.atom==='CA'),cb=atoms.find(a=>a.resi===mutation.pos&&a.atom==='CB')||ca;
    viewer.addStyle({resi:mutation.pos,hetflag:false},{stick:{radius:.22,color:'#ffba56',opacity:.45}});
    // Ala has only CB beyond CA. Other replacements show an explicitly schematic envelope.
    viewer.addSphere({center:cb,radius:mutation.to==='A'?1.0:1.6,color:'#c38aff',opacity:.36});
    viewer.addLabel(mutation.from+mutation.pos+mutation.to+' · schematic comparison',{position:ca,fontSize:11,fontColor:'#ddc3ff',backgroundOpacity:.75,backgroundColor:'#201933',inFront:true});
   }
  }
  const surfaceKey=`${modes.Surface&&time===200}-${interactions.hydrophobic&&time===200&&!mini}`;
  if(surfaceKey!==scene.current.surfaceKey){
   viewer.removeAllSurfaces();scene.current.surfaceKey=surfaceKey;
   if(modes.Surface&&time===200)viewer.addSurface(mol.SurfaceType.SAS,{opacity:.3,color:'#4f86ab'},{hetflag:false}).then(()=>{if(scene.current?.viewer===viewer){viewer.render();host.current.dataset.surface='ready';}});
   if(interactions.hydrophobic&&time===200&&!mini)viewer.addSurface(mol.SurfaceType.VDW,{opacity:.38,color:'#e5a23c'},{resi:[29,32,68,69,72,104],hetflag:false}).then(()=>{if(scene.current?.viewer===viewer)viewer.render();});
  }
  model.setStyle({}, {}, true); // invalidate cached atom geometry after coordinate updates
  if(mini){viewer.zoomTo({hetflag:false});viewer.zoom(1.45);}
  else if(scene.current.lastTime!==undefined&&scene.current.lastTime!==time){viewer.zoomTo({hetflag:false});viewer.zoom(1.12);}
  scene.current.lastTime=time;
  viewer.render();
 },[ready,data,time,modes,interactions,selected,hovered,mutation,mini]);
 return <div className="ps-molecule" data-ready={ready} data-time={time} data-selected={selected||''} data-modes={Object.keys(modes).filter(k=>modes[k]).join(',')} data-overlays={Object.keys(interactions).filter(k=>interactions[k]).join(',')}>
  <div ref={host} className="ps-webgl" role="img" aria-label={mini?'Molecular folding stage preview':'Interactive PDB 1MBN myoglobin with heme and iron'}/>
  {!ready&&!error&&<div className="ps-view-state" role="status">Loading molecular renderer…</div>}
  {error&&<div className="ps-view-state" role="alert">{error}</div>}
 </div>;
});
