import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {fitApparatusCamera} from './fitApparatusCamera.js';
import useApparatusFullscreen from './useApparatusFullscreen.js';
import {potSpecies,potObservation,potInventory} from './potentiometryIronModel.js';

export default function PotentiometryIronApparatus({state,values,quiet}){
 const host=useRef(),live=useRef(),api=useRef(),[error,setError]=useState(''),[pan,setPan]=useState(false);
 live.current={state,values,quiet};const {fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{if(api.current){api.current.mouseButtons.LEFT=pan?T.MOUSE.PAN:T.MOUSE.ROTATE;api.current.touches.ONE=pan?T.TOUCH.PAN:T.TOUCH.ROTATE;}},[pan]);
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('3D unavailable; potential, composition and notebook controls remain usable.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f5fafc');renderer.outputColorSpace=T.SRGBColorSpace;node.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Original redox titration station with graduated dichromate burette, platinum wire electrode, separate Ag/AgCl reference electrode and porous junction, stirred sample, finite reagent bottles and live millivolt meter.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,60),controls=new OrbitControls(camera,renderer.domElement);api.current=controls;controls.minDistance=4;controls.maxDistance=28;
  scene.add(new T.HemisphereLight('#ffffff','#91a6b8',1.7));const sun=new T.DirectionalLight('#fff7e9',2);sun.position.set(-4,7,5);scene.add(sun);
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;
  const material=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.35,...extra});
  const navy=material('#244a63'),steel=material('#a6b6c2',{metalness:.8}),white=material('#eaf2f5'),blue=material('#287bd1'),orange=material('#df8f24',{transparent:true,opacity:.75}),solution=material('#b8d6a9',{transparent:true,opacity:.6}),glass=new T.MeshPhysicalMaterial({color:'#a3cbd6',transparent:true,opacity:.23,roughness:.07,depthWrite:false,side:T.DoubleSide});
  const mesh=(geometry,mat,x,y,z,parent=scene)=>{const o=new T.Mesh(geometry,mat);o.position.set(x,y,z);parent.add(o);return o;},box=(w,h,d,m,x,y,z,p)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p),cyl=(r,h,m,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,48),m,x,y,z,p),tube=(r,h,m,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,48,1,true),m,x,y,z,p);
  const label=(initial,x,y,z,w=1.5)=>{const c=document.createElement('canvas');c.width=840;c.height=120;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const sprite=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false}));sprite.position.set(x,y,z);sprite.scale.set(w,w/7,1);sprite.renderOrder=10;scene.add(sprite);let old;const write=text=>{if(text===old)return;old=text;ctx.clearRect(0,0,840,120);ctx.fillStyle='#36596d';ctx.textAlign='center';ctx.font=`bold ${Math.min(65,790/(Math.max(1,text.length)*.6))}px system-ui`;ctx.fillText(text,420,85);tex.needsUpdate=true;};write(initial);return write;};
  box(7.5,.12,3.1,white,0,.06,0);box(2,.22,1.55,navy,.8,.23,.3);cyl(.048,4.25,steel,2.15,2.35,-.35);box(1.65,.07,.07,steel,1.32,4.1,-.35);
  // All liquid capacities share the beaker's world-volume/mL scale. Vessel aspect ratios are illustrative.
  tube(.25,2.75,glass,.8,3.12,.1);const burette=cyl(Math.sqrt(.68**2*1.25/4/2.7),2.7,orange,.8,3.1,.1);tube(.035,.3,glass,.8,1.55,.1);box(.4,.07,.08,blue,.8,1.72,.1);cyl(.025,.15,glass,.8,1.33,.1);
  for(let i=0;i<=50;i++){box(i%5===0?.14:.07,.008,.012,navy,1.08,4.45-i*.054,.14);if(i%10===0)label(String(i),1.34,4.45-i*.054,.14,.33);}label('50mL · K₂Cr₂O₇',.8,4.76,.1,2.1);
  tube(.72,1.25,glass,.8,1.005,.3);cyl(.72,.035,glass,.8,.38,.3);const liquid=cyl(.68,1.25,solution,.8,1.025,.3),stir=box(.45,.04,.085,white,.8,.43,.3);
  for(let i=1;i<=4;i++){box(.14,.009,.012,navy,1.53,.4+i*.3125,.4);label(String(i*50),1.76,.4+i*.3125,.4,.33);}const vesselLabel=label('EMPTY ·200mL',.8,.15,1.3,2.2);
  const pair=new T.Group();scene.add(pair);cyl(.07,.35,navy,-.19,.45,0,pair);cyl(.018,.98,steel,-.19,-.15,0,pair);cyl(.045,.18,steel,-.19,-.65,0,pair);tube(.10,1.25,glass,.19,-.05,0,pair);cyl(.032,.85,steel,.19,.05,0,pair);cyl(.10,.24,blue,.19,.65,0,pair);cyl(.095,.06,white,.19,-.69,0,pair);cyl(.065,.95,material('#d1e3e7',{transparent:true,opacity:.38}),.19,-.13,0,pair);
  label('Pt WIRE / Ag–AgCl',.05,2.15,.7,2.25);label('POROUS Ag/AgCl JUNCTION',2.6,.4,1.2,1.9);
  box(2.6,1.7,.34,material('#bdd1de'),-1.75,2.95,-.6);box(2.38,1.48,.05,navy,-1.75,2.95,-.405);
  const display=document.createElement('canvas');display.width=1000;display.height=610;const ctx=display.getContext('2d'),texture=new T.CanvasTexture(display);texture.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(2.22,1.35),new T.MeshBasicMaterial({map:texture}),-1.75,2.95,-.37);label('HIGH-IMPEDANCE mV METER',-1.75,4,-.6,2.8);
  const cables=[-.19,.19].map((dx,i)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.5,3.1-i*.18,-.6),new T.Vector3(-.3,3.6,0),new T.Vector3(dx,2.4,.5)]),32,.018,8,false),i?blue:navy,0,0,0));
  const stock=(x,z,name,color,r=.63)=>{tube(r,.94,glass,x,.6,z);cyl(r,.03,glass,x,.145,z);cyl(r*.7,.13,blue,x,1.12,z);const fill=cyl(Math.sqrt(.68**2*1.25/2/.8),.8,material(color,{transparent:true,opacity:.6}),x,.56,z);const write=label(name,x,.16,z+.4,1.5);return {fill,write,x};};
  const ironStock=stock(-3,1.0,'Fe(II) ·100mL','#b5c8b1'),crStock=stock(-1.6,1.1,'Cr(VI) ·100mL','#df8f24');label('DEFINED ELECTRONIC INPUTS: 0 / 500 / 800mV',-1.9,1.45,1.1,2.8);
  const drop=mesh(new T.SphereGeometry(.024,16,12),orange,.8,1.27,.1);drop.scale.y=1.5;drop.visible=false;
  let frame,last=0,lastState,lastValues,lastQuiet,lastPosition='',dirty=true,visible=true,pending=true,lastScreen=-Infinity,dropping=0,lastVolume=0;const target=new T.Vector3(.1,2.6,.6);pair.position.copy(target);
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();fitApparatusCamera(scene,camera,controls,new T.Vector3(1.5,1,9),1.03);dirty=true;});resize.observe(node);
  const visibility=new IntersectionObserver(([e])=>visible=e.isIntersecting);visibility.observe(node);controls.addEventListener('change',()=>dirty=true);
  const draw=now=>{frame=requestAnimationFrame(draw);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!visible||document.hidden)return;const {state:s,values:v,quiet}=live.current;controls.enableDamping=!quiet;controls.update();
   if(s!==lastState||v!==lastValues||quiet!==lastQuiet){if(lastState&&s.delivered>lastVolume)dropping=.6;lastVolume=s.delivered;lastState=s;lastValues=v;lastQuiet=quiet;const z=potSpecies(v,s.delivered),inv=potInventory(s,v);
    burette.visible=s.filled&&s.delivered<50;burette.scale.y=Math.max(.001,(50-s.delivered)/50);burette.position.y=1.75+2.7*burette.scale.y/2;
    const h=s.loaded?z.volume/200*1.25:0;liquid.visible=s.loaded;liquid.scale.y=Math.max(.001,h/1.25);liquid.position.y=.4+h/2;stir.visible=s.loaded;stir.rotation.y=s.stir&&!quiet?s.time*3:0;
    // Qualitative color composition, not a calibrated absorption spectrum.
    const green=z.CrIII/(z.CrIII+z.CrVI*2+.015),excess=z.CrVI/(z.CrVI+.002);solution.color.set('#cbdcb4').lerp(new T.Color('#5a966e'),Math.min(.7,green)).lerp(new T.Color('#d99722'),excess);
    vesselLabel(s.loaded?`Fe/Cr ·${z.volume.toFixed(1)}mL`:'EMPTY ·200mL');for(const [o,key]of [[ironStock,'iron'],[crStock,'titrant']]){const h=.8*inv.stock[key]/100;o.fill.scale.y=h/.8;o.fill.position.y=.16+h/2;o.write(`${key==='iron'?'Fe(II)':'Cr(VI)'} ·${inv.stock[key].toFixed(0)}mL`);}
    target.set(s.probe==='sample'?.28:.1,s.probe==='sample'?1.19:2.6,s.probe==='sample'?.64:.6);pending=true;dirty=true;
   }
   if(pair.position.distanceTo(target)>.001){pair.position.lerp(target,quiet?1:1-Math.exp(-10*dt));dirty=true;}
   const pos=pair.position.toArray().map(n=>n.toFixed(3)).join(',');if(pos!==lastPosition){lastPosition=pos;cables.forEach((o,i)=>{o.geometry.dispose();o.geometry=new T.TubeGeometry(new T.CatmullRomCurve3([new T.Vector3(-.5,3.1-i*.18,-.6),new T.Vector3(-.3,3.7-i*.15,0),pair.position.clone().add(new T.Vector3(i?.19:-.19,.7,0))]),32,.018,8,false);});dirty=true;}
   if(pending&&now-lastScreen>100){const r=potObservation(s,v);ctx.fillStyle='#f5fafc';ctx.fillRect(0,0,1000,610);ctx.fillStyle='#345a70';ctx.font='bold 43px system-ui';ctx.fillText('OPEN-CIRCUIT CELL ·25°C',35,70);ctx.fillStyle='#287bd1';ctx.font='bold 110px system-ui';ctx.fillText(r.cell===undefined?'— —':r.cell.toFixed(2)+'mV',35,220);ctx.fillStyle='#345a70';ctx.font='40px system-ui';ctx.fillText(r.ready?'STABLE':s.probe==='sample'?'SETTLING':'ELECTRODES RAISED',35,310);ctx.fillText(`Eref nominal +197mV vs SHE`,35,390);ctx.fillText(`RAW ${r.raw===undefined?'—':r.raw.toFixed(2)}mV`,35,465);ctx.font='34px system-ui';ctx.fillText(`V=${s.delivered.toFixed(2)}mL · t=${s.time.toFixed(1)}s`,35,545);texture.needsUpdate=true;pending=false;lastScreen=now;dirty=true;}
   if(dropping>0&&!quiet){dropping-=dt;drop.visible=true;drop.position.y=1.27-(1-(dropping%.3)/.3)*.35;dirty=true;}else if(drop.visible){drop.visible=false;dirty=true;}
   if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();controls.dispose();const gs=new Set(),ms=new Set(),ts=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){ms.add(m);if(m.map)ts.add(m.map);}});gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());ts.forEach(t=>t.dispose());env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="pti-scene"><div className="pti-scene-host" ref={host}/><div className="pti-camera"><small>Original 3D · Pt / reference pair · qualitative solution color</small><button aria-label="Pan redox camera" aria-pressed={pan} onClick={()=>setPan(x=>!x)}>Pan</button><button aria-label="Reset redox camera" onClick={()=>{api.current?.reset();setPan(false);}}>Reset view</button><button aria-label={fullscreen?'Exit redox fullscreen':'Fullscreen redox bench'} onClick={toggle}>{fullscreen?'Exit':'Fullscreen'}</button></div>{error&&<p role="status">{error}</p>}</div>;
}
