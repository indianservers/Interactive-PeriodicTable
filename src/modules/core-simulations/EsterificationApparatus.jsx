import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RotateCcw,Maximize2} from 'lucide-react';
import useApparatusFullscreen from './useApparatusFullscreen.js';
import {fitApparatusCamera} from './fitApparatusCamera.js';

export default function EsterificationApparatus({state,values,result,running}){
 const host=useRef(),live=useRef(),api=useRef();live.current={state,values,result,running};const [error,setError]=useState(''),{fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable; reaction and partition calculations remain available.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f5f9fc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Original 3D esterification reflux vessel, upright condenser, pear-shaped separatory funnel with two phases, stopcock and separate aqueous and organic receivers. Drag to orbit and scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,50),controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,2,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=20;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;scene.add(new T.HemisphereLight('#fff','#8394a6',1));const sun=new T.DirectionalLight('#fff',2);sun.position.set(-4,8,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.4,envMapIntensity:.6,...extra}),steel=mat('#91a6b4',{metalness:.65}),navy=mat('#334e66'),white=mat('#edf1ef'),glass=new T.MeshPhysicalMaterial({color:'#b9deea',transparent:true,opacity:.3,roughness:.08,depthWrite:false,side:T.DoubleSide}),organic=mat('#f0e7bb',{transparent:true,opacity:.72}),aqueous=mat('#c3e7ed',{transparent:true,opacity:.7});
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=m!==glass&&m!==organic&&m!==aqueous;o.receiveShadow=true;scene.add(o);return o;},cyl=(r,h,m,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,48),m,x,y,z),box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
  const label=(value,x,y,z,w=2)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d');ctx.fillStyle='#36536a';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.fillText(value,256,60);const tex=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true}));o.position.set(x,y,z);o.scale.set(w,w*96/512,1);scene.add(o);return o;};
  box(7.5,.12,3.2,white,0,.1,0);box(1.6,.3,1.4,navy,-2,.35,0);
  const flaskProfile=[[0,0],[.5,0],[.63,.15],[.18,1.25],[.16,1.55]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(flaskProfile,48),glass,-2,.55,0);
  const refluxLiquid=mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.48,0),new T.Vector2(.5,.33),new T.Vector2(0,.33)],48),organic,-2,.58,0);
  const rotor=box(.4,.04,.1,white,-2,.65,0);cyl(.17,1.65,glass,-2,2.9,0);cyl(.065,1.85,glass,-2,2.9,0);
  cyl(.22,.07,steel,-2,2.1,0);cyl(.22,.07,steel,-2,3.72,0);cyl(.03,3.6,steel,-2.9,2,0);box(.8,.06,.1,steel,-2.5,3.1,0);
  for(const y of [2.3,3.5])mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-1.8,y,0),new T.Vector3(-1.3,y,.25),new T.Vector3(-1.1,.5,.3)]),32,.03,8,false),aqueous);
  label('REFLUX',-2,4.05,0,1.6);
  const profile=[[.06,0],[.08,.35],[.35,.65],[.7,1.05],[.82,1.35],[.7,1.7],[.2,2.1],[.15,2.35]];
  mesh(new T.LatheGeometry(profile.map(([r,y])=>new T.Vector2(r,y)),64),glass,.8,.85,0);cyl(.19,.12,navy,.8,3.24,0);
  cyl(.06,.24,glass,.8,.73,0);const valve=box(.42,.08,.12,navy,.8,.84,0);cyl(.025,2.6,steel,1.9,2.1,-.15);box(1,.05,.1,steel,1.4,2.8,-.15);label('SEPARATORY FUNNEL',.8,3.65,0,2.7);
  const radius=y=>{let i=1;while(i<profile.length-1&&profile[i][1]<y)i++;const [r0,y0]=profile[i-1],[r1,y1]=profile[i];return .94*(r0+(r1-r0)*(y-y0)/(y1-y0));};
  const samples=Array.from({length:471},(_,i)=>{const y=i*.005;return {y,r:radius(y),vol:0};});for(let i=1;i<samples.length;i++)samples[i].vol=samples[i-1].vol+Math.PI*(samples[i].r**2+samples[i-1].r**2)*.005/2;
  const ymax=ml=>{const target=Math.min(.98,Math.max(0,ml/250))*samples.at(-1).vol;let i=1;while(i<samples.length-1&&samples[i].vol<target)i++;const a=samples[i-1],b=samples[i];return a.y+(b.y-a.y)*(target-a.vol)/(b.vol-a.vol);};
  const fill=(low,high)=>new T.LatheGeometry([new T.Vector2(0,low),new T.Vector2(radius(low),low),...profile.filter(([,y])=>y>low&&y<high).map(([,y])=>new T.Vector2(radius(y),y)),new T.Vector2(radius(high),high),new T.Vector2(0,high)],48);
  const lower=mesh(fill(0,.1),aqueous,.8,.85,0),upper=mesh(fill(.1,.2),organic,.8,.85,0);
  const waste=cyl(.42,.8,glass,.8,.58,0),product=cyl(.42,.8,glass,2.5,.58,.8),wasteLiquid=cyl(.37,.5,aqueous,.8,.48,0),productLiquid=cyl(.37,.5,organic,2.5,.48,.8);
  const wasteLabel=label('LOWER → WASTE',.8,.3,.72,1.9),productLabel=label('UPPER → PRODUCT',2.5,.3,1.5,2.2);const drop=mesh(new T.SphereGeometry(.045,16,12),aqueous,.8,.5,0);
  let frame,last=0,prior,dirty=true,visible=true,lastLevels='',lastVolume=-1;
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);fitApparatusCamera(scene,camera,controls);dirty=true;});resize.observe(node);
  const obs=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});obs.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==live.current){prior=live.current;dirty=true;const {state:s,values:v,result:r,running:run}=prior,reactive=['reaction','cooling'].includes(s.phase),collecting=['collecting','collected'].includes(s.phase);
    refluxLiquid.visible=rotor.visible=reactive;rotor.rotation.y=s.time*8;
    if(lastVolume!==v.volume){lastVolume=v.volume;const b=.6,m=.45/1.1,H=1.06,volume=h=>Math.PI*(b*b*h-b*m*h*h+m*m*h*h*h/3),target=volume(H)*v.volume/150;let a=0,z=H;for(let i=0;i<35;i++){const mid=(a+z)/2;if(volume(mid)<target)a=mid;else z=mid;}const h=(a+z)/2;refluxLiquid.geometry.dispose();refluxLiquid.geometry=new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.48,0),new T.Vector2(.6,.14),new T.Vector2(b-m*h,.14+h),new T.Vector2(0,.14+h)],48);}

    const lo=v.wash*(1-s.drained),hi=lo+v.organicVolume*(1-s.collected),levels=`${lo}/${hi}`;
    if(levels!==lastLevels){lastLevels=levels;for(const o of [lower,upper])o.geometry.dispose();const y0=ymax(lo),y1=ymax(hi);lower.geometry=fill(0,Math.max(.001,y0));upper.geometry=fill(y0,Math.max(y0+.001,y1));}
    lower.visible=r.separated&&lo>.001;upper.visible=r.separated&&v.organicVolume*(1-s.collected)>.001;
    waste.position.x=wasteLiquid.position.x=collecting?2.5:.8;waste.position.z=wasteLiquid.position.z=collecting?.8:0;product.position.x=productLiquid.position.x=collecting?.8:2.5;product.position.z=productLiquid.position.z=collecting?0:.8;
    wasteLiquid.visible=s.drained>0;productLiquid.visible=s.collected>0;const wh=Math.min(.7,v.wash*s.drained/100*.7),ph=Math.min(.7,v.organicVolume*s.collected/100*.7);wasteLiquid.scale.y=Math.max(.001,wh/.5);productLiquid.scale.y=Math.max(.001,ph/.5);wasteLiquid.position.y=.2+wh/2;productLiquid.position.y=.2+ph/2;
    wasteLabel.position.set(collecting?2.5:.8,.3,collecting?1.5:.72);productLabel.position.set(collecting?.8:2.5,.3,collecting?.72:1.5);drop.visible=['draining','collecting'].includes(s.phase);drop.material=s.phase==='collecting'?organic:aqueous;drop.position.y=.65-(s.time*8%1)*.3;valve.rotation.y=drop.visible?Math.PI/2:0;
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();obs.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="ester-scene"><div ref={host} className="ester-scene-host"/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · phase tints identify layers · orbit / zoom</span><button aria-label="Reset esterification camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?'Exit esterification fullscreen':'Fullscreen esterification apparatus'} onClick={toggle}><Maximize2 size={15}/></button></div></div>;
}
