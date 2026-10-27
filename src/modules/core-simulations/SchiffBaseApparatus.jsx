import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Maximize2,RotateCcw} from 'lucide-react';
import {fitApparatusCamera} from './fitApparatusCamera.js';
import useApparatusFullscreen from './useApparatusFullscreen.js';
import {SCHIFF_MW} from './schiffBaseModel.js';
export default function SchiffBaseApparatus({state,values,result}){
 const host=useRef(),api=useRef(),live=useRef();live.current={state,values,result};const [error,setError]=useState(''),{fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable. The numerical inventory and experiment controls remain available.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f6fafc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Original 3D condensation flask, sloping condenser, ideal selective water receiver, cooling cradle, filter and isolated crystal dish. Drag to orbit; scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,60),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=24;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;scene.add(new T.HemisphereLight('#ffffff','#90a7b7',1.4));const light=new T.DirectionalLight('#fff5e5',2.2);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
  const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.36,...extra}),steel=material('#8b9faa',{metalness:.65}),navy=material('#34485e'),porcelain=material('#f7f5ed'),yellow=material('#dfcf82',{transparent:true,opacity:.7}),water=material('#c8e4ed',{transparent:true,opacity:.7}),crystal=material('#e8d99b'),glass=new T.MeshPhysicalMaterial({color:'#9cbdcb',transparent:true,opacity:.38,roughness:.08,depthWrite:false,side:T.DoubleSide});
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=m!==glass&&m!==water&&m!==yellow;o.receiveShadow=true;scene.add(o);return o;};
  const box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z),cyl=(r,h,m,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,48),m,x,y,z);
  const tube=(a,b,r,m)=>{const p=new T.Vector3(...a),q=new T.Vector3(...b),o=mesh(new T.CylinderGeometry(r,r,p.distanceTo(q),32,1,m===glass),m);o.position.copy(p).add(q).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),q.sub(p).normalize());return o;};
  const label=(text,x,y,z,w=2)=>{const c=document.createElement('canvas');c.width=640;c.height=96;const ctx=c.getContext('2d');ctx.font='bold 29px system-ui';ctx.textAlign='center';ctx.fillStyle='#446175';ctx.fillText(text,320,58);const o=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c),transparent:true}));o.position.set(x,y,z);o.scale.set(w,w*.15,1);scene.add(o);};
  box(7.6,.13,3.1,porcelain,0,.13,0);box(1.7,.15,1.8,steel,-2.1,.29,0);cyl(.045,3.9,steel,-2.8,2.25,-.45);tube([-2.8,2.2,-.45],[-1.7,2.2,0],.035,steel);box(1.65,.38,1.45,navy,-1.65,.5,0);cyl(.64,.12,steel,-1.65,.75,0);
  mesh(new T.SphereGeometry(.67,48,32),glass,-1.65,1.4,0);cyl(.19,.8,glass,-1.65,2.2,0);cyl(.22,.08,steel,-1.65,2.6,0);tube([-1.65,2.62,0],[-1.65,3,0],.12,glass);tube([-1.65,3,0],[.8,2.3,0],.11,glass);tube([-1.3,2.9,0],[.55,2.37,0],.22,glass);tube([.8,2.3,0],[.8,1.85,0],.1,glass);
  // Coolant is in the condenser annulus; inner reaction pathway stays open.
  const sleeve=tube([-1.3,2.9,0],[.55,2.37,0],.2,new T.MeshStandardMaterial({color:'#b6dce7',transparent:true,opacity:.18,side:T.DoubleSide}));
  tube([-.95,2.8,0],[-.95,3.1,-.45],.045,glass);tube([.3,2.44,0],[.3,2.7,.45],.045,glass);label('CONDENSATION / COOLANT',-.8,3.65,0,3);
  const reactor=mesh(new T.SphereGeometry(.6,48,32,0,Math.PI*2,Math.PI*.49,Math.PI*.51),yellow,-1.65,1.4,0),surface=cyl(.6,.012,yellow,-1.65,1.42,0),stir=box(.38,.06,.12,porcelain,-1.65,.87,0);
  cyl(.34,1.4,glass,.8,1.12,0);cyl(.38,.12,navy,.8,.37,0);const receiver=cyl(.3,1,water,.8,.95,0);label('SELECTIVE H₂O RECEIVER',.8,2.06,.6,2.9);
  for(let i=0;i<=4;i++){const y=.48+i*.29;tube([.49,y,.1],[.61,y,.1],.012,steel);label(`${i*25}%`,.35,y,.3,.55);}
  // A distinct isolation station: shallow cooling cradle and folded filter.
  box(1.8,.32,1.5,steel,2.55,.38,0);cyl(.6,.09,glass,2.55,.6,0);mesh(new T.ConeGeometry(.5,.7,48,1,true),porcelain,2.55,1.3,0).rotation.z=Math.PI;cyl(.1,.25,glass,2.55,.82,0);cyl(.6,.08,porcelain,2.55,.38,1);label('FILTER / DRY CAKE',2.55,2,0,2.3);
  const makeCrystals=()=>Array.from({length:70},(_,i)=>{const o=mesh(new T.OctahedronGeometry(.045,0),crystal);o.rotation.set(i*.3,i*.7,0);o.scale.set(1,1.8,.5);return o;}),crystals=makeCrystals(),cake=makeCrystals();let lastVolume=-1,liquidBottom=1.01;
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);fitApparatusCamera(scene,camera,controls,new T.Vector3(1.7,1.5,6.5));dirty=true;});let dirty=true,visible=true,last=0,prior,frame;resize.observe(node);const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});observer.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==live.current){prior=live.current;dirty=true;const {state:s,values:v,result:r}=prior,charged=s.phase!=='empty',isolated=s.phase==='collected';reactor.visible=surface.visible=charged;stir.visible=charged&&!isolated;const fraction=Math.min(1,Math.max(0,r.waterCaptured/(v.water+Math.min(v.aldehyde/SCHIFF_MW.aldehyde,v.amine/SCHIFF_MW.amine)*SCHIFF_MW.water)));receiver.visible=charged&&fraction>1e-8;receiver.scale.y=Math.max(.001,fraction*1.15);receiver.position.y=.46+fraction*1.15/2;stir.rotation.y=s.time*9;
    if(lastVolume!==v.volume){lastVolume=v.volume;const radius=.6,target=4/3*Math.PI*radius**3*v.volume/100;let lo=0,hi=2*radius;for(let i=0;i<35;i++){const h=(lo+hi)/2;if(Math.PI*h*h*(radius-h/3)<target)lo=h;else hi=h;}const h=(lo+hi)/2,theta=Math.acos((h-radius)/radius),sr=Math.sqrt(2*radius*h-h*h);reactor.geometry.dispose();reactor.geometry=new T.SphereGeometry(radius,48,32,0,Math.PI*2,theta,Math.PI-theta);surface.scale.set(sr/.6,1,sr/.6);surface.position.y=1.4-radius+h;liquidBottom=1.4-radius+.12;}
    for(const [list,mass,inDish] of [[crystals,r.solid*SCHIFF_MW.imine,false],[cake,r.collected,true]]){const n=Math.min(70,Math.round(mass*22));list.forEach((o,i)=>{o.visible=charged&&i<n&&(!inDish||isolated);const a=i*2.39996+(!inDish&&s.phase==='reaction'?s.time*1.5:0),rad=.33*Math.sqrt((i+.5)/70);o.position.set((inDish?2.55:-1.65)+Math.cos(a)*rad,(inDish?.45:liquidBottom)+(i%4)*.025,(inDish?1:0)+Math.sin(a)*rad);});}
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="schiff-scene"><div className="schiff-scene-host" ref={host}/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · ideal selective water capture · representative crystals</span><button aria-label="Reset condensation camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?'Exit condensation fullscreen':'Fullscreen condensation apparatus'} onClick={toggle}><Maximize2 size={15}/></button></div></div>;
}
