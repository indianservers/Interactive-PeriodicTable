import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Maximize2,RotateCcw} from 'lucide-react';
import {fitApparatusCamera} from './fitApparatusCamera.js';
import useApparatusFullscreen from './useApparatusFullscreen.js';

export default function OrganicAnalysisApparatus({tubes,selected,onSelect,children}){
 const host=useRef(),live=useRef(),api=useRef();live.current={tubes,selected,onSelect};
 const [error,setError]=useState(''),{fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('3D unavailable. All assay controls and observations remain usable.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f5fafc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Original 3D organic-analysis hood: sample, positive-control and blank tubes, reagent dropper, heated bath and ammonia indicator paper. Drag to orbit, scroll to zoom; right-drag to pan.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,50),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=22;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room);scene.environment=environment.texture;
  scene.add(new T.HemisphereLight('#ffffff','#94adbc',1.1));const sun=new T.DirectionalLight('#fff8ee',1.7);sun.position.set(-3,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.4,...extra}),steel=material('#adbdc4',{metalness:.6}),navy=material('#314e64'),wood=material('#af8256'),white=material('#f1f5f5'),glass=new T.MeshPhysicalMaterial({color:'#aecedb',transparent:true,opacity:.35,roughness:.06,depthWrite:false,side:T.DoubleSide});
  const mesh=(geo,mat,x,y,z,parent=scene)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=mat!==glass;o.receiveShadow=true;parent.add(o);return o;};
  const box=(w,h,d,m,x,y,z,p=scene)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p),cyl=(r,h,m,x,y,z,p=scene)=>mesh(new T.CylinderGeometry(r,r,h,40),m,x,y,z,p);
  const label=(text,x,y,z,w=1.6)=>{const canvas=document.createElement('canvas');canvas.width=640;canvas.height=130;const c=canvas.getContext('2d');c.fillStyle='#355c73';c.font='bold 36px system-ui';c.textAlign='center';c.fillText(text,320,80);const s=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true,depthTest:false}));s.position.set(x,y,z);s.scale.set(w,w*130/640,1);s.renderOrder=10;scene.add(s);return s;};
  box(7.2,.17,3.5,white,0,.1,0);box(7.2,.18,.25,navy,0,3.7,-1.45);box(.13,3.5,.25,navy,-3.5,1.9,-1.45);box(.13,3.5,.25,navy,3.5,1.9,-1.45);
  box(7,.06,1.1,steel,0,3.8,-1);box(6.8,2.7,.03,glass,0,2.1,-1.5);for(let i=0;i<17;i++)box(.02,.18,.35,navy,-3.1+i*.39,3.64,-1.35);
  label('VIRTUAL QUALITATIVE ANALYSIS',0,4.1,-1.2,4.7);
  box(3.2,.2,1.2,wood,-.1,.35,.45);box(.13,1.65,.95,wood,-1.65,1.25,.45);box(.13,1.65,.95,wood,1.45,1.25,.45);
  // Open rack rail with circular tube collars rather than a solid shelf through glass.
  box(3.1,.13,.13,wood,-.1,1.95,.04);box(3.1,.13,.13,wood,-.1,1.95,.88);
  const tubeMeshes=[],pickable=[];
  for(let i=0;i<3;i++){
   const x=(i-1)*.94-.1,group=new T.Group();group.position.set(x,.47,.46);scene.add(group);
   const body=mesh(new T.LatheGeometry([[0,0],[.14,.02],[.22,.1],[.245,.23],[.245,2.3],[.27,2.32]].map(([r,y])=>new T.Vector2(r,y)),48),glass,0,0,0,group);body.userData.index=i;pickable.push(body);
   const collar=mesh(new T.TorusGeometry(.29,.045,12,40),steel,0,1.47,0,group);collar.rotation.x=Math.PI/2;
   const rim=mesh(new T.TorusGeometry(.25,.022,8,48),glass,0,2.31,0,group);rim.rotation.x=Math.PI/2;
   const liquid=cyl(.224,1,material('#ddeaf0',{transparent:true,opacity:.72}),0,.6,0,group);
   const meniscus=cyl(.228,.018,liquid.material,0,1.1,0,group);
   const silver=mesh(new T.CylinderGeometry(.235,.235,1,48,1,true),material('#d1d6d8',{metalness:1,roughness:.16,side:T.DoubleSide,transparent:true,opacity:0}),0,.8,0,group);
   const grains=Array.from({length:24},(_,j)=>mesh(new T.OctahedronGeometry(.045,0),material('#df9f2d',{roughness:.95}),0,.3,0,group));
   const bubbles=Array.from({length:8},()=>mesh(new T.SphereGeometry(.033,10,8),new T.MeshPhysicalMaterial({color:'#e4f3f7',transparent:true,opacity:.7,roughness:.05}),0,.4,0,group));
   const detector=box(.25,.45,.012,material('#d7a0a7'),.04,2.6,.08,group);box(.035,.45,.035,steel,.18,2.64,.03,group);
   const halo=mesh(new T.TorusGeometry(.35,.026,8,40),material('#7762d9',{emissive:'#2d1765',emissiveIntensity:.2}),0,.03,0,group);halo.rotation.x=Math.PI/2;
   label(['UNKNOWN','POSITIVE','BLANK'][i],x,.2,1.16,1.08);tubeMeshes.push({group,x,liquid,meniscus,silver,grains,bubbles,detector,halo});
  }
  // Separate reagent station and a thermal bath for warm-reference assays.
  const bottle=mesh(new T.LatheGeometry([[0,0],[.3,0],[.32,.06],[.32,.9],[.15,1.04],[.15,1.3]].map(([r,y])=>new T.Vector2(r,y)),40),material('#a96329',{transparent:true,opacity:.8}),-2.6,.2,.05);cyl(.17,.16,navy,-2.6,1.55,.05);label('REAGENT',-2.6,1.93,.05,1.1);
  const dropper=new T.Group();scene.add(dropper);cyl(.055,.66,glass,0,3.35,.46,dropper);mesh(new T.SphereGeometry(.12,16,12),navy,0,3.74,.46,dropper);const drop=mesh(new T.SphereGeometry(.045,12,8),material('#e5c87c',{transparent:true,opacity:.8}),0,3,.46,dropper);
  box(1.35,.36,1.35,navy,2.47,.37,-.16);mesh(new T.LatheGeometry([[0,0],[.5,0],[.58,.05],[.58,2],[.6,2.04],[.55,2.04],[.55,.09],[0,.09]].map(([r,y])=>new T.Vector2(r,y)),48),glass,2.47,.47,-.16);cyl(.53,1.45,material('#b1d2dd',{transparent:true,opacity:.3}),2.47,1.28,-.16);label('WARM REFERENCE BATH',2.47,2.9,-.16,1.9);box(.05,2.7,.05,steel,3.2,1.72,-.2);box(.8,.05,.05,steel,2.83,2.82,-.2);
  const dial=mesh(new T.CylinderGeometry(.1,.1,.08,24),steel,2.47,.4,.55);dial.rotation.x=Math.PI/2;
  let frame,dirty=true,previous=null,visible=true,down;
  const ray=new T.Raycaster(),pointer=new T.Vector2();const pointerDown=e=>{down=[e.clientX,e.clientY];};const pointerUp=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickable)[0];if(hit)live.current.onSelect(hit.object.userData.index);};
  renderer.domElement.addEventListener('pointerdown',pointerDown);renderer.domElement.addEventListener('pointerup',pointerUp);controls.addEventListener('change',()=>{dirty=true;});
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(r.height,1);camera.zoom=1;camera.updateProjectionMatrix();fitApparatusCamera(scene,camera,controls,new T.Vector3(2,1.35,8),.97);dirty=true;});resize.observe(node);
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});observer.observe(node);
  const draw=()=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden)return;controls.update();if(previous!==live.current){previous=live.current;dirty=true;const {tubes,selected}=live.current;
   tubeMeshes.forEach((m,i)=>{const tube=tubes[i],a=tube?.assay,p=a?Math.min(1,tube.elapsed/a.seconds):0,h=tube?(a?1.05:.84):0;
    const warm=selected===i&&a?.valid&&['tollens','hydrolysis'].includes(a.test);m.group.position.set(warm?2.47:m.x,.47,warm?-.16:.46);m.halo.visible=selected===i;
    m.liquid.visible=m.meniscus.visible=!!tube;m.liquid.scale.y=Math.max(.001,h);m.liquid.position.y=.2+h/2;m.meniscus.position.y=.2+h;
    const base=new T.Color('#ddeaf0'),endpoint=new T.Color(a?.color||'#ddeaf0');m.liquid.material.color.copy(base.lerp(endpoint,p));
    m.silver.visible=a?.effect==='silver'&&p>0;m.silver.material.opacity=p*.92;m.silver.scale.y=.85;m.silver.position.y=.72;
    m.grains.forEach((g,j)=>{g.visible=a?.effect==='precipitate'&&p>(j+1)/30;const angle=j*2.39996,r=.16*Math.sqrt((j+.5)/24);g.position.set(Math.cos(angle)*r,tube?.settled ? .25+(j%3)*.025 : .28+((j*7)%23)/23*.8,Math.sin(angle)*r);});
    m.bubbles.forEach((b,j)=>{b.visible=a?.effect==='gas'&&p>0&&p<1;b.position.set(Math.sin(j*2.4)*.12,.24+((p*3+j/8)%1)*h,Math.cos(j*2.4)*.12);});
    m.detector.visible=a?.effect==='ammonia';m.detector.material.color.copy(new T.Color('#d7a0a7').lerp(new T.Color('#5283d5'),p));m.halo.visible=selected===i;
   });dropper.position.x=tubeMeshes[selected].group.position.x;dropper.position.z=tubeMeshes[selected].group.position.z-.46;const active=tubes[selected],p=active?.assay?active.elapsed/active.assay.seconds:0;drop.visible=!!active?.assay&&active.assay.valid&&p>0&&p<.12;drop.position.y=3.1-(p/.12)*.32;
  }if(dirty){renderer.render(scene,camera);dirty=false;}};draw();
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',pointerDown);renderer.domElement.removeEventListener('pointerup',pointerUp);const geos=new Set(),mats=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){mats.add(m);if(m.map)textures.add(m.map);}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="oa-scene"><div className="oa-scene-host" ref={host}/>{children}<div className="oa-camera"><small>Original 3D · qualitative response morphology</small><button aria-label="Reset organic-analysis camera" onClick={()=>api.current?.reset()}><RotateCcw size={14}/></button><button aria-label={fullscreen?'Exit organic-analysis fullscreen':'Fullscreen organic-analysis apparatus'} onClick={toggle}><Maximize2 size={14}/></button></div>{error&&<p role="status">{error}</p>}</div>;
}
