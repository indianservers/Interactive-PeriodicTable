import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {fitApparatusCamera} from './fitApparatusCamera.js';
import useApparatusFullscreen from './useApparatusFullscreen.js';
import {activeHydrolysis,hydrolysisAssay,hydrolysisRemaining} from './methylHydrolysisModel.js';

export default function MethylHydrolysisApparatus({state,values,reducedMotion=false}){
 const host=useRef(),live=useRef(),cameraApi=useRef(),[error,setError]=useState(''),[pan,setPan]=useState(false),[osQuiet,setOsQuiet]=useState(false);live.current={state,values,quiet:reducedMotion||osQuiet};
 const {fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{const q=matchMedia('(prefers-reduced-motion: reduce)'),sync=()=>setOsQuiet(q.matches);sync();q.addEventListener('change',sync);return()=>q.removeEventListener('change',sync);},[]);
 useEffect(()=>{if(cameraApi.current){cameraApi.current.mouseButtons.LEFT=pan?T.MOUSE.PAN:T.MOUSE.ROTATE;cameraApi.current.touches.ONE=pan?T.TOUCH.PAN:T.TOUCH.ROTATE;}},[pan]);
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('3D unavailable; experiment controls, readings and analysis remain usable.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f5fafc');renderer.outputColorSpace=T.SRGBColorSpace;node.appendChild(renderer.domElement);renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label','Original 3D methyl-acetate kinetics station: covered reactor in a thermostatic bath, sampling pipette, cold dilution water, graduated 25 mL burette and indicator assay flask. Liquid volumes follow experiment state.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.1,70),controls=new OrbitControls(camera,renderer.domElement);cameraApi.current=controls;controls.minDistance=4;controls.maxDistance=25;const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;scene.add(new T.HemisphereLight('#ffffff','#8cabbf',1.6));const sun=new T.DirectionalLight('#fff8f0',2);sun.position.set(-3,7,5);scene.add(sun);
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.38,...extra}),steel=mat('#94adb9',{metalness:.7}),navy=mat('#355569'),white=mat('#ecf2f5'),glass=new T.MeshPhysicalMaterial({color:'#85b0c3',transparent:true,opacity:.42,roughness:.07,side:T.DoubleSide,depthWrite:false}),fluid=mat('#c5dfe8',{transparent:true,opacity:.65}),assayMat=mat('#c5dfe8',{transparent:true,opacity:.7});
  const mesh=(g,m,x,y,z,parent=scene)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);parent.add(o);return o;},box=(w,h,d,m,x,y,z,p)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p),cyl=(r,h,m,x,y,z,p)=>mesh(new T.CylinderGeometry(r,r,h,48),m,x,y,z,p);
  const label=(text,x,y,z,w=1.8)=>{const c=document.createElement('canvas');c.width=640;c.height=112;const ctx=c.getContext('2d'),tex=new T.CanvasTexture(c),sprite=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,transparent:true}));sprite.position.set(x,y,z);sprite.scale.set(w,w*112/640,1);sprite.renderOrder=10;scene.add(sprite);let prior='';return value=>{if(value===prior)return;prior=value;ctx.clearRect(0,0,640,112);ctx.fillStyle='#365e74';ctx.font=`bold ${Math.min(90,Math.floor(580/(Math.max(1,String(value??text).length)*.62)))}px system-ui`;ctx.textAlign='center';ctx.fillText(value??text,320,72);tex.needsUpdate=true;};};
  const fixed=(text,...args)=>{const fn=label(text,...args);fn(text);return fn;};
  box(7.5,.15,3.5,white,0,.05,0);
  // Covered constant-volume-rate reactor; liquid withdrawal changes its volume.
  box(2.2,.3,2,navy,-2.2,.25,0);box(1.95,1.25,1.75,glass,-2.2,1,0);box(1.75,.7,1.55,mat('#c3e2ed',{transparent:true,opacity:.23}),-2.2,.75,0);
  mesh(new T.CylinderGeometry(.48,.48,1.8,64,1,true),glass,-2.2,1.4,0);cyl(.49,.09,white,-2.2,.51,0);cyl(.5,.12,navy,-2.2,2.33,0);const reactor=cyl(.45,1,fluid,-2.2,.6,0);const probe=cyl(.022,1.4,steel,-2.91,1.55,.5);cyl(.075,.23,navy,-2.91,2.34,.5);
  for(let i=0;i<=6;i++){box(.1,.012,.012,navy,-1.75,.61+i*.25,.12);if(i%2===0)fixed(String(i*25),-1.48,.62+i*.25,.12,.43);}
  fixed('150 mL REACTOR',-2.2,2.75,0,2);const bathText=fixed('25 °C BATH',-2.2,.23,1.1,1.8);
  // Metered pipette with a moving portion, rather than decorative particles.
  const pipette=new T.Group();scene.add(pipette);mesh(new T.CylinderGeometry(.055,.055,1,32,1,true),glass,0,0,0,pipette);mesh(new T.SphereGeometry(.15,32,24),glass,0,.1,0,pipette);mesh(new T.ConeGeometry(.055,.3,24),glass,0,-.65,0,pipette);cyl(.11,.18,mat('#6f59d2'),0,.66,0,pipette);const pipetteLiquid=cyl(.048,.8,fluid,0,-.08,0,pipette);const pipetteBulb=mesh(new T.SphereGeometry(.125,24,16),fluid,0,.1,0,pipette);
  fixed('SAMPLING PIPETTE',-1.25,3.65,.2,1.9);
  for(const [x,text]of [[-.65,'HCl BLANK'],[.05,'FULL ACID']]){cyl(.24,.7,glass,x,.7,-.75);cyl(.2,.45,fluid,x,.55,-.75);cyl(.12,.18,glass,x,1.12,-.75);cyl(.14,.08,navy,x,1.24,-.75);fixed(text,x,1.48,-.75,.9);}
  // Dedicated cold-water reservoir; its inventory supplies the quench flask.
  mesh(new T.CylinderGeometry(.42,.42,1.1,48,1,true),glass,-.6,.78,.9);cyl(.43,.06,white,-.6,.25,.9);const water=cyl(.38,.8,fluid,-.6,.68,.9);const coldText=fixed('COLD DILUTION WATER',-.6,.13,1.25,1.8);
  // 25 mL burette, real scale and stopcock above an independent assay receiver.
  box(1.5,.13,1.7,navy,1.7,.2,0);cyl(.045,3.8,steel,2.5,2.15,-.25);box(1,.08,.09,steel,2.1,3.8,-.25);mesh(new T.CylinderGeometry(.1,.1,2.2,48,1,true),glass,1.7,2.94,0);cyl(.105,.04,white,1.7,1.83,0);const base=cyl(.075,2,fluid,1.7,2.87,0);
  for(let i=0;i<=25;i++){box(i%5===0?.12:.065,.009,.012,navy,1.83,3.95-i*.08,.055);if(i%5===0)fixed(String(i),2.08,3.95-i*.08,.05,.35);}
  cyl(.035,.3,glass,1.7,1.66,0);box(.34,.065,.065,mat('#755bce'),1.7,1.74,.08);mesh(new T.ConeGeometry(.035,.17,24),glass,1.7,1.44,0);fixed('25 mL NaOH BURETTE',1.6,4.25,0,2.2);
  const flask=new T.Group();flask.position.set(1.7,.31,0);scene.add(flask);const profile=[[0,0],[.51,0],[.6,.1],[.6,.17],[.19,.9],[.18,1.06],[.2,1.08]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(profile,64),glass,0,0,0,flask);const receiving=mesh(new T.LatheGeometry([[0,0],[.55,0],[.3,.5],[0,.5]].map(([r,y])=>new T.Vector2(r,y)),48),assayMat,0,.1,0,flask);
  const drop=mesh(new T.SphereGeometry(.026,12,10),fluid,1.7,1.36,0);drop.scale.y=1.6;drop.visible=false;const readout=fixed('DRAW A PORTION',1.65,.17,1.12,2.5);
  let frame,last=0,dirty=true,visible=true,previousState=null,previousValues=null,present={reactor:0,pipette:0,assay:0,water:0,base:25,x:-2.2,z:0},target={...present},lastDose=0,doseAnimation=0,lastAssayHeight=-1;
  controls.addEventListener('change',()=>{dirty=true;});const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();fitApparatusCamera(scene,camera,controls,new T.Vector3(2.1,1.3,8),.92);dirty=true;});resize.observe(node);const observer=new IntersectionObserver(([e])=>visible=e.isIntersecting);observer.observe(node);
  const draw=now=>{frame=requestAnimationFrame(draw);const dt=Math.min(.05,(now-last)/1000||0);last=now;if(!visible||document.hidden)return;const {state:s,values:v,quiet}=live.current,p=activeHydrolysis(s),a=hydrolysisAssay(p,v);controls.enableDamping=!quiet;controls.update();
   if(s!==previousState||v!==previousValues){const initialPresentation=previousState===null;const held=p?.stage==='pipetted',titre=a?.titre||0;target={reactor:hydrolysisRemaining(s,v),pipette:held?v.aliquot:0,assay:p&&!held?a.volume:0,water:p?.quenched?0:v.quench,base:25-(p?.used||0),x:held?(p.kind==='reaction'?-2.2:p.kind==='blank'?-.65:.05):1.7,z:held&&p.kind!=='reaction'?-.75:0};if(initialPresentation)present={...target};if(p&&p.id===activeHydrolysis(previousState||{samples:[]})?.id&&titre>lastDose)doseAnimation=.65;lastDose=titre;previousState=s;previousValues=v;assayMat.color.set('#c5dfe8').lerp(new T.Color('#ed4aa6'),a?.indicator||0);bathText(`${v.temperature.toFixed(0)} °C · IDEAL BATH`);coldText(`${v.cold} °C · ${v.quench} mL WATER`);readout(a?`${a.titre.toFixed(2)} mL · pH ${a.pH.toFixed(2)}`:'DRAW A PORTION');dirty=true;}
   let moving=false;const alpha=quiet?1:1-Math.exp(-9*dt);for(const k of Object.keys(target)){const d=target[k]-present[k];if(Math.abs(d)>.001){present[k]+=d*alpha;moving=true;}else present[k]=target[k];}
   reactor.scale.y=Math.max(.001,present.reactor/150*1.6);reactor.position.y=.55+reactor.scale.y/2;reactor.visible=present.reactor>.01;
   pipette.position.set(present.x,3,present.z);pipetteLiquid.scale.y=Math.max(.001,present.pipette/5);pipetteLiquid.visible=present.pipette>.005;pipetteBulb.scale.setScalar(Math.max(.001,Math.cbrt(present.pipette/5)));pipetteBulb.visible=present.pipette>.005;
   water.scale.y=Math.max(.001,present.water/30);water.position.y=.3+.4*water.scale.y;water.visible=present.water>.01;base.scale.y=Math.max(.001,present.base/25);base.position.y=1.88+base.scale.y;
   // Inverse conical-frustum volume: V(h)=pi*(r0²h+r0*a*h²+a²h³/3).
   let lo=0,hi=.72;const volumeTarget=present.assay/100*(Math.PI*(.55*.55*.72+.55*(-.5)*.72**2+.25*.72**3/3));for(let i=0;i<24;i++){const h=(lo+hi)/2,V=Math.PI*(.55*.55*h-.275*h*h+.25*h*h*h/3);if(V<volumeTarget)lo=h;else hi=h;}const h=(lo+hi)/2;if(Math.abs(h-lastAssayHeight)>.0002){lastAssayHeight=h;receiving.geometry.dispose();receiving.geometry=new T.LatheGeometry([[0,0],[.55,0],[.55-.5*h,h],[0,h]].map(([r,y])=>new T.Vector2(r,y)),40);}receiving.visible=present.assay>.01;
   if(doseAnimation>0&&!quiet){doseAnimation-=dt;drop.visible=true;drop.position.y=1.4-(1-(doseAnimation% .2)/.2)*.33;dirty=true;}else drop.visible=false;
   if(moving||dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();const geos=new Set(),mats=new Set(),textures=new Set();scene.traverse(o=>{if(o.geometry)geos.add(o.geometry);for(const m of [o.material].flat().filter(Boolean)){mats.add(m);if(m.map)textures.add(m.map);}});geos.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className="mh-scene"><div className="mh-scene-host" ref={host}/><div className="mh-camera"><small>Original 3D · bath → pipette → cold assay → burette</small><button aria-label="Pan hydrolysis camera" aria-pressed={pan} onClick={()=>setPan(x=>!x)}>Pan</button><button aria-label="Reset hydrolysis camera" onClick={()=>{cameraApi.current?.reset();setPan(false);}}>Reset view</button><button aria-label={fullscreen?'Exit hydrolysis fullscreen':'Fullscreen hydrolysis apparatus'} onClick={toggle}>{fullscreen?'Exit':'Fullscreen'}</button></div>{error&&<p role="status">{error}</p>}</div>;
}
