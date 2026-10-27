import useApparatusFullscreen from './useApparatusFullscreen.js';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RotateCcw,Maximize2} from 'lucide-react';

export default function NitrationReactor({state,values,running}){
 const host=useRef(),current=useRef(),api=useRef();current.current={state,values,running};const [error,setError]=useState('');
 const {fullscreen,toggle:toggleFullscreen}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable. Thermal model and controls remain available.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f4f9fc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive jacketed reactor with metered feed reservoir, stirrer, temperature probe and cooling circulator. Drag to orbit; scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,50),controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.6,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=18;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;
  scene.add(new T.HemisphereLight('#ffffff','#718499',1));const sun=new T.DirectionalLight('#ffffff',2);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const solid=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.4,envMapIntensity:.6,...extra});
  const steel=solid('#7b8d9e',{metalness:.65}),navy=solid('#29465c'),white=solid('#e9eef0'),blue=solid('#3795b4'),glass=new T.MeshPhysicalMaterial({color:'#b6deec',transparent:true,opacity:.2,roughness:.08,depthWrite:false,side:T.DoubleSide}),liquidMat=new T.MeshPhysicalMaterial({color:'#eadb91',transparent:true,opacity:.78,roughness:.2});
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=m!==glass&&m!==liquidMat;o.receiveShadow=true;scene.add(o);return o;};
  const box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z),cyl=(r,h,m,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,48),m,x,y,z);
  const label=(value,x,y,z,width=1.8)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true}));o.position.set(x,y,z);o.scale.set(width,width*96/512,1);scene.add(o);const write=t=>{ctx.clearRect(0,0,512,96);ctx.font='bold 32px monospace';ctx.textAlign='center';ctx.fillStyle='#29465c';ctx.fillText(t,256,60);tex.needsUpdate=true;};write(value);return write;};
  box(6.5,.12,3.2,white,0,.1,0);box(2.1,.3,1.7,navy,-.65,.32,0);
  // Concentric cylindrical walls form the jacket; they are not a distillation head.
  cyl(.9,1.8,glass,-.65,1.45,0);cyl(.74,1.9,glass,-.65,1.45,0);cyl(.92,.1,steel,-.65,2.4,0);cyl(.78,.06,steel,-.65,.5,0);
  const liquid=cyl(.69,.6,liquidMat,-.65,.85,0);cyl(.035,2.25,steel,-.65,2.2,0);const rotor=box(.85,.05,.12,white,-.65,.65,0);box(.55,.5,.55,navy,-.65,3.5,0);label('STIRRED REACTOR',-.65,3.98,0,2.3);
  cyl(.04,1.1,steel,-.12,2.45,.25);const readT=label('20.0 °C',-.65,.34,.88,1.5);
  // Metering reservoir with a stop valve and delivery line.
  cyl(.38,1,glass,-2.35,3.1,0);const feed=cyl(.34,.85,solid('#dce7c6',{transparent:true,opacity:.7}),-2.35,3.1,0);cyl(.09,.35,navy,-2.35,2.45,0);
  const feedPath=new T.CatmullRomCurve3([new T.Vector3(-2.35,2.3,0),new T.Vector3(-2.35,2,0),new T.Vector3(-1,2,0),new T.Vector3(-1,2.75,0)]);
  mesh(new T.TubeGeometry(feedPath,36,.045,10,false),glass);label('METERED FEED',-2.35,3.85,0,1.8);
  const drop=mesh(new T.SphereGeometry(.065,16,12),solid('#c7d98e'),-1,2.65,0);
  box(.9,1.3,1,navy,2,1,0);box(.72,.45,.04,white,2,1.25,.52);const readBath=label('COOLANT',2,1.24,.56,1.1);
  for(const [y,endY] of [[.8,.65],[1.5,2.2]]){const points=[new T.Vector3(1.55,y,0),new T.Vector3(.8,y,.3),new T.Vector3(.3,endY,.2),new T.Vector3(.16,endY,0)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.055,10,false),blue);}
  label('COOLING CIRCULATOR',2,2.05,0,2.3);
  const lamp=mesh(new T.SphereGeometry(.06,16,12),solid('#2bb8a7'),2.2,.75,.55);label('NORMALIZED MODEL',0,.48,1.85,3);
  let frame,prior,last=0,dirty=true,visible=true;
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(r.height,1);const fit=Math.max(1,1.7/camera.aspect);camera.position.set(5,4.2,8).sub(controls.target).multiplyScalar(fit).add(controls.target);camera.updateProjectionMatrix();controls.update();controls.saveState();dirty=true;});resize.observe(node);
  const obs=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});obs.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==current.current){prior=current.current;dirty=true;const {state:s,values:v,running:run}=prior,charged=s.phase!=='empty';
    liquid.visible=charged;const height=.6+.45*s.fed;liquid.scale.y=height/.6;liquid.position.y=.53+height/2;liquid.material.color.set('#eadb91').lerp(new T.Color('#d8bb5e'),s.extent);
    feed.scale.y=Math.max(.001,(v.acid-s.fed)/v.acid);feed.position.y=2.68+.425*feed.scale.y;
    rotor.rotation.y=s.time*8;drop.visible=run&&s.feeding&&!s.tripped;drop.position.y=2.8-(s.time*5%1)*.7;
    readT(`${s.temperature.toFixed(1)} °C`);readBath(`${v.bath.toFixed(0)} °C`);lamp.material.color.set(s.tripped?'#d7523b':'#2bb8a7');
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();obs.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="nitration-scene"><div ref={host} className="nitration-scene-host"/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · normalized reactor · orbit / zoom</span><button aria-label="Reset reactor camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?"Exit reactor fullscreen":"Fullscreen reactor"} onClick={toggleFullscreen}><Maximize2 size={15}/></button></div></div>;
}
