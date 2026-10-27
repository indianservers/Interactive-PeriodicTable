import useApparatusFullscreen from './useApparatusFullscreen.js';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Maximize2,RotateCcw} from 'lucide-react';

export default function AspirinApparatus({state,result,values}){
 const host=useRef(),live=useRef({state,result,values}),api=useRef();live.current={state,result,values};
 const [error,setError]=useState('');
 const {fullscreen,toggle:toggleFullscreen}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable; experiment controls and calculations remain usable.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f3f9fb');renderer.outputColorSpace=T.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Original 3D water bath, reaction flask, Büchner filtration, collection dish and balance. Drag to orbit and scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(37,1,.1,50);camera.position.set(4.2,3.5,7.1);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.3,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=18;controls.saveState();api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room);scene.environment=environment.texture;
  scene.add(new T.HemisphereLight('#ffffff','#9bafbb',.75));const light=new T.DirectionalLight('#ffffff',2);light.position.set(-4,6,4);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-5;light.shadow.camera.right=5;light.shadow.camera.top=5;light.shadow.camera.bottom=-5;light.shadow.bias=-.00015;scene.add(light);
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.45,envMapIntensity:.65,...extra});
  const steel=mat('#a0b3bd',{metalness:.5}),white=mat('#f7f6ef'),dark=mat('#526a7a');
  const glass=new T.MeshPhysicalMaterial({color:'#d8edf2',transparent:true,opacity:.36,roughness:.09,depthWrite:false,side:T.DoubleSide});
  const water=new T.MeshPhysicalMaterial({color:'#9bcddd',transparent:true,opacity:.42,roughness:.13});
  const solution=new T.MeshPhysicalMaterial({color:'#dbe4d5',transparent:true,opacity:.7,roughness:.18});
  const mesh=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=m!==glass&&m!==water&&m!==solution;scene.add(o);return o;};
  const box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
  const cyl=(r,h,m,x,y,z)=>mesh(new T.CylinderGeometry(r,r,h,40),m,x,y,z);
  const sphere=(r,m,x,y,z)=>mesh(new T.SphereGeometry(r,32,20),m,x,y,z);
  const text=(label,x,y,z,width=1.5)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');const texture=new T.CanvasTexture(canvas);const sprite=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(width,width*96/512,1);scene.add(sprite);const update=value=>{ctx.clearRect(0,0,512,96);ctx.fillStyle='#294d60';ctx.font='bold 36px monospace';ctx.textAlign='center';ctx.fillText(value,256,61);texture.needsUpdate=true;};update(label);return update;};
  box(7,.12,3.5,white,0,.1,0);
  box(2.5,.35,2,dark,-1.65,.4,0);box(2.35,.9,1.85,glass,-1.65,1,0);box(2.2,.65,1.7,water,-1.65,.95,0);
  sphere(.5,glass,-1.65,1.6,0);const liquid=sphere(.46,solution,-1.65,1.6,0);const meniscus=cyl(.2,.005,solution,-1.65,1.3,0);cyl(.13,.8,glass,-1.65,2.15,0);
  cyl(.04,1.4,steel,-1.2,1.6,.35);const tempText=text('20.0 °C',-1.65,.47,1.04,1.35);
  const heaterLamp=sphere(.045,mat('#40b4ac'),-.77,.44,1.03);
  const flaskProfile=[[0,.0],[.52,.0],[.58,.13],[.16,1.1],[.14,1.4]].map(([r,y])=>new T.Vector2(r,y));
  mesh(new T.LatheGeometry(flaskProfile,48),glass,1,.25,0);cyl(.14,.4,glass,1,1.9,0);
  mesh(new T.CylinderGeometry(.5,.15,.45,40),white,1,2.2,0);cyl(.48,.06,white,1,2.44,0);
  const cake=cyl(.42,.04,white,1,2.49,0);const filtrate=cyl(.38,.5,solution,1,.55,0);
  const hosePoints=[new T.Vector3(1.15,1.4,.1),new T.Vector3(1.7,1.4,.1),new T.Vector3(2,.5,-.6),new T.Vector3(3,.3,-.8)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(hosePoints),40,.035,8,false),dark,0,0,0);
  box(.9,.6,.75,dark,2.8,.48,-.9);cyl(.12,.3,steel,3,.84,-.9);text('VACUUM PUMP',2.8,1.05,-.9,1.5);
  box(1.7,.3,1.4,dark,2.7,.35,.7);cyl(.58,.07,steel,2.7,.55,.7);
  mesh(new T.CylinderGeometry(.4,.35,.08,40),glass,2.7,.63,.7);const scaleText=text('25.000 g',2.7,.38,1.46,1.4);
  const crystals=[];for(let i=0;i<48;i++){const a=i*2.399963,r=.32*Math.sqrt((i+.5)/48);const o=mesh(new T.OctahedronGeometry(.035,0),white,-1.65+Math.cos(a)*r,1.35+(i%5)*.035,Math.sin(a)*r);o.rotation.set(i*.4,i*.8,i*.13);crystals.push(o);}
  text('WATER BATH',-1.65,2.9,0,1.8);text('VACUUM FILTRATION',1,2.9,0,2.1);text('BALANCE',2.7,1.6,.7,1.3);
  let frame,last=0,dirty=true,visible=true,prior=null,lastVolume=-1;
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(r.height,1);const fit=Math.max(1,1.7/camera.aspect);camera.position.set(4.2,3.5,7.1).sub(controls.target).multiplyScalar(fit).add(controls.target);camera.updateProjectionMatrix();controls.update();controls.saveState();dirty=true;});resize.observe(node);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;dirty=true;});observer.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==live.current){prior=live.current;dirty=true;const {state:s,result:r,values:v}=prior;
    liquid.visible=s.phase==='reaction'||s.phase==='quenched';meniscus.visible=liquid.visible;
    const volume=v.volume+(s.phase==='quenched'?v.quenchWater:0);
    if(volume!==lastVolume){lastVolume=volume;const radius=.46,target=Math.min(.95,volume/250)*4/3*Math.PI*radius**3;let lo=0,hi=2*radius;for(let i=0;i<35;i++){const h=(lo+hi)/2;if(Math.PI*h*h*(radius-h/3)>target)hi=h;else lo=h;}const h=(lo+hi)/2,y=-radius+h,theta=Math.acos(y/radius),r=Math.sqrt(Math.max(0,radius*radius-y*y));liquid.geometry.dispose();liquid.geometry=new T.SphereGeometry(radius,40,24,0,Math.PI*2,theta,Math.PI-theta);meniscus.scale.set(r/.2,1,r/.2);meniscus.position.y=1.6+y;}
    tempText(`${s.temperature.toFixed(1)} °C`);heaterLamp.material.color.set(s.heater?'#e59349':'#40b4ac');
    const count=Math.min(48,Math.round((s.phase==='filtered'?r.collected:r.crystals)*15));crystals.forEach((o,i)=>{o.visible=i<count&&s.phase!=='empty';if(s.phase==='filtered'){const x=s.onBalance?2.7:1,y=s.onBalance ? .74 : 2.5,z=s.onBalance ? .7 : 0;o.position.set(x+Math.cos(i*2.399963)*.3*Math.sqrt((i+.5)/48),y+(i%3)*.025,z+Math.sin(i*2.399963)*.3*Math.sqrt((i+.5)/48));}else o.position.set(-1.65+Math.cos(i*2.399963)*.32*Math.sqrt((i+.5)/48),1.3+(i%5)*.025,Math.sin(i*2.399963)*.32*Math.sqrt((i+.5)/48));});
    cake.visible=s.phase==='filtered'&&!s.onBalance;cake.scale.y=Math.max(.05,r.collected/2);filtrate.visible=s.phase==='filtered';filtrate.scale.y=Math.min(2,(v.volume+v.quenchWater)/40);
    scaleText(`${((s.tared?0:25)+(s.phase==='filtered'&&s.onBalance?r.balanceMass:0)).toFixed(3)} g`);
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});environment.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="aspirin-scene"><div className="aspirin-scene-host" ref={host}/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · orbit / zoom · representative crystal count</span><button aria-label="Reset synthesis camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?"Exit synthesis fullscreen":"Fullscreen synthesis apparatus"} onClick={toggleFullscreen}><Maximize2 size={15}/></button></div></div>;
}
