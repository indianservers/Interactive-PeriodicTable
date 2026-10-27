import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RotateCcw,Maximize2} from 'lucide-react';
import useApparatusFullscreen from './useApparatusFullscreen.js';

export default function BenzoicApparatus({state,values,result}){
 const host=useRef(),live=useRef(),api=useRef();live.current={state,values,result};const [error,setError]=useState(''),{fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable; chemical inventories and controls remain available.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f4f9fc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Original 3D reflux condenser and flask, manganese-dioxide gravity filter, crystallisation beaker, separate product filter and drying dish. Drag to orbit; scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,50),controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.9,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=20;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;scene.add(new T.HemisphereLight('#ffffff','#8b9baa',1));const light=new T.DirectionalLight('#ffffff',2);light.position.set(-4,7,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.4,envMapIntensity:.65,...extra}),steel=mat('#9cabb6',{metalness:.65}),navy=mat('#344d63'),white=mat('#f0efe9'),brown=mat('#73513b'),blue=mat('#64b9d0'),glass=new T.MeshPhysicalMaterial({color:'#c8e5ef',transparent:true,opacity:.25,roughness:.08,depthWrite:false,side:T.DoubleSide}),solution=new T.MeshPhysicalMaterial({color:'#e5e4cf',transparent:true,opacity:.65,roughness:.2});
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=m!==glass&&m!==solution;o.receiveShadow=true;scene.add(o);return o;};
  const cyl=(r,h,m,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,40),m,x,y,z),box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z),sphere=(r,m,x,y,z)=>mesh(new T.SphereGeometry(r,36,24),m,x,y,z);
  const label=(value,x,y,z,width=1.8)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c),sprite=new T.Sprite(new T.SpriteMaterial({map:tex,transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(width,width*96/512,1);scene.add(sprite);const write=t=>{ctx.clearRect(0,0,512,96);ctx.font='bold 31px monospace';ctx.textAlign='center';ctx.fillStyle='#365367';ctx.fillText(t,256,60);tex.needsUpdate=true;};write(value);return write;};
  box(7.6,.12,3.3,white,0,.1,0);box(1.7,.3,1.5,navy,-2,.33,0);sphere(.61,glass,-2,1.15,0);cyl(.15,.65,glass,-2,1.92,0);
  const fluid=sphere(.56,solution,-2,1.15,0),surface=cyl(.2,.004,solution,-2,1,0),stirrer=box(.4,.04,.1,white,-2,.66,0);
  // An upright, open-ended condenser returns condensed vapour to the same flask.
  cyl(.19,1.7,glass,-2,3,0);cyl(.075,1.9,glass,-2,3,0);cyl(.23,.06,steel,-2,2.18,0);cyl(.23,.06,steel,-2,3.82,0);
  cyl(.035,3.6,steel,-3,2,0);box(.8,.04,.1,steel,-2.6,3.2,0);box(.7,.08,.6,steel,-3,.27,0);
  for(const [y,z] of [[2.3,.6],[3.6,-.4]]){const pts=[new T.Vector3(-1.85,y,0),new T.Vector3(-1.4,y,z),new T.Vector3(-1.2,.5,z)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),30,.035,8,false),blue);}
  const temperature=label('20.0 °C',-2,.35,.83,1.25);label('REFLUX / OXIDATION',-2,4.18,0,2.5);
  // Independent paper gravity filter and receiving beaker for manganese solids.
  cyl(.57,1.15,glass,.2,.93,0);const workLiquid=cyl(.52,.75,solution,.2,.76,0);
  mesh(new T.CylinderGeometry(.5,.08,.55,40),glass,.2,2.1,0);mesh(new T.CylinderGeometry(.46,.075,.5,40),white,.2,2.1,0);cyl(.07,.5,glass,.2,1.65,0);
  const mnCake=cyl(.4,.06,brown,.2,2.38,0),mnSuspension=cyl(.35,.04,brown,-2,.72,0);
  label('MnO₂ SEPARATION',.2,2.85,0,2.2);
  // Product filtration is separate from the used manganese filter.
  const profile=[[.15,1.25],[.15,.95],[.55,.1],[.5,0],[0,0]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(profile,40),glass,2.1,.26,0);
  const productFiltrate=mesh(new T.LatheGeometry([new T.Vector2(0,0),new T.Vector2(.46,0),new T.Vector2(.3,.48),new T.Vector2(0,.48)],40),solution,2.1,.31,0);
  mesh(new T.CylinderGeometry(.46,.13,.35,40),white,2.1,1.7,0);cyl(.14,.28,glass,2.1,1.42,0);
  const hose=[new T.Vector3(2.3,1.2,0),new T.Vector3(2.7,1.2,.2),new T.Vector3(3.1,.4,.2)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(hose),30,.035,8,false),navy);label('PRODUCT FILTER',2.1,2.5,0,2.1);
  cyl(.48,.06,glass,2.8,.3,1);label('DRYING DISH',2.8,.65,1.4,1.7);
  const crystals=Array.from({length:50},(_,i)=>{const o=mesh(new T.OctahedronGeometry(.035,0),white);o.rotation.set(i*.7,i*.2,i*.4);return o;});
  let frame,last=0,prior,dirty=true,visible=true,lastVolume=-1;
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.position.set(5,4.8,9).sub(controls.target).multiplyScalar(Math.max(1,1.8/camera.aspect)).add(controls.target);camera.updateProjectionMatrix();controls.update();controls.saveState();dirty=true;});resize.observe(node);
  const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});observer.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==live.current){prior=live.current;dirty=true;const {state:s,values:v,result:r}=prior,reactive=['hydrolysis','oxidation','quenched'].includes(s.phase),workup=['clarified','acidified','collected'].includes(s.phase);
    fluid.visible=surface.visible=stirrer.visible=reactive;stirrer.rotation.y=s.time*8;mnSuspension.scale.y=Math.max(.05,Math.min(4,r.manganeseWaste));workLiquid.visible=['clarified','acidified'].includes(s.phase);productFiltrate.visible=s.phase==='collected';mnSuspension.visible=['oxidation','quenched'].includes(s.phase)&&r.manganeseWaste>1e-8;mnCake.visible=workup;
    const permanganateFraction=s.phase==='oxidation'?Math.max(0,1-4/3*s.oxidation/r.r):0;solution.color.set('#e5e4cf').lerp(new T.Color('#73428d'),permanganateFraction);
    if(lastVolume!==v.volume){lastVolume=v.volume;const R=.56,target=Math.min(.93,v.volume/300)*4/3*Math.PI*R**3;let lo=0,hi=2*R;for(let i=0;i<35;i++){const h=(lo+hi)/2;if(Math.PI*h*h*(R-h/3)>target)hi=h;else lo=h;}const y=-R+(lo+hi)/2,theta=Math.acos(y/R),rad=Math.sqrt(Math.max(0,R*R-y*y));fluid.geometry.dispose();fluid.geometry=new T.SphereGeometry(R,40,24,0,Math.PI*2,theta,Math.PI-theta);surface.scale.set(rad/.2,1,rad/.2);surface.position.y=1.15+y;workLiquid.scale.y=v.volume/187.5;workLiquid.position.y=.39+.5*v.volume/250;}
    const quantity=s.phase==='collected'?r.collected:r.crystals,count=Math.min(50,Math.round(quantity*18));crystals.forEach((o,i)=>{o.visible=i<count&&workup;const a=i*2.39996,rad=.4*Math.sqrt((i+.5)/50);o.position.set((s.phase==='collected'?2.8:.2)+Math.cos(a)*rad,(s.phase==='collected'?.38:.43)+(i%3)*.02,(s.phase==='collected'?1:0)+Math.sin(a)*rad);});temperature(`${s.temperature.toFixed(1)} °C`);
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="benzoic-scene"><div ref={host} className="benzoic-scene-host"/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · reflux → separation → crystallisation</span><button aria-label="Reset benzoic apparatus camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?'Exit benzoic fullscreen':'Fullscreen benzoic apparatus'} onClick={toggle}><Maximize2 size={15}/></button></div></div>;
}
