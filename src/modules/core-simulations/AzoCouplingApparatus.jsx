import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {Maximize2,RotateCcw} from 'lucide-react';
import {AZO_MW} from './azoCouplingModel.js';
import {fitApparatusCamera} from './fitApparatusCamera.js';
import useApparatusFullscreen from './useApparatusFullscreen.js';
export default function AzoCouplingApparatus({state,values,result}){
 const host=useRef(),api=useRef(),live=useRef();live.current={state,values,result};const [error,setError]=useState(''),{fullscreen,toggle}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({antialias:true});}catch{setError('WebGL unavailable. The chemical inventory and experiment controls remain available.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f6fafc');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;renderer.shadowMap.enabled=true;node.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Original 3D cooled diazonium vessel, transfer pump, stirred coupling beaker, pH electrode and finite base reservoir, dye filter and cake dish. Drag to orbit; scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(36,1,.1,60),controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=4;controls.maxDistance=25;api.current=controls;
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room);scene.environment=env.texture;scene.add(new T.HemisphereLight('#ffffff','#94a5b3',1.2));const sun=new T.DirectionalLight('#fff9eb',2.2);sun.position.set(-4,7,5);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
  const mat=(color,extra={})=>new T.MeshStandardMaterial({color,roughness:.38,...extra}),navy=mat('#334b62'),metal=mat('#9aadb8',{metalness:.65}),white=mat('#f3f3eb'),glass=new T.MeshPhysicalMaterial({color:'#99bccb',transparent:true,opacity:.4,roughness:.1,side:T.DoubleSide,depthWrite:false}),liquid=new T.MeshStandardMaterial({color:'#dce8d9',transparent:true,opacity:.65,roughness:.18}),jacket=mat('#b8d8e2',{transparent:true,opacity:.32,side:T.DoubleSide}),orange=mat('#d94e20'),ivory=mat('#e5e2cd');
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=m!==glass&&m!==liquid&&m!==jacket;o.receiveShadow=true;scene.add(o);return o;},box=(w,h,d,m,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z),cyl=(r,h,m,x,y,z,open=false)=>mesh(new T.CylinderGeometry(r,r,h,48,1,open),m,x,y,z);
  const pipe=(points,m=navy,r=.035)=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),48,r,8,false),m);
  const label=(text,x,y,z,w=2,color='#395a70',font=31)=>{const c=document.createElement('canvas');c.width=640;c.height=110;const ctx=c.getContext('2d'),texture=new T.CanvasTexture(c),o=new T.Sprite(new T.SpriteMaterial({map:texture,transparent:true}));const update=t=>{ctx.clearRect(0,0,640,110);ctx.fillStyle=color;ctx.font=`bold ${font}px system-ui`;ctx.textAlign='center';ctx.fillText(t,320,70);texture.needsUpdate=true;};update(text);o.position.set(x,y,z);o.scale.set(w,w*110/640,1);scene.add(o);return update;};
  box(7.5,.12,3.4,white,0,.15,0);
  // Separate cooling jackets: no decorative ice or reflux apparatus.
  cyl(.7,1.5,jacket,-2,1.13,0,true);cyl(.51,1.65,glass,-2,1.25,0,true);cyl(.53,.07,glass,-2,.45,0);const src=cyl(.47,1,liquid,-2,.95,0);label('DIAZONIUM · 60 mL',-2,2.45,0,2.5);
  box(.8,.6,.65,navy,-.75,.55,-.65);const rotor=cyl(.23,.08,metal,-.75,.58,-.28);rotor.rotation.x=Math.PI/2;pipe([[-2,.65,.1],[-1.65,.47,.7],[-.75,.55,-.25],[0,2.4,.15],[.35,2.25,.1]]);label('TRANSFER PUMP',-.75,1.35,-.65,1.8);
  box(1.65,.22,1.65,navy,.5,.4,0);cyl(.82,1.55,jacket,.5,1.3,0,true);cyl(.65,1.65,glass,.5,1.3,0,true);cyl(.67,.07,glass,.5,.51,0);const receiver=cyl(.6,1,liquid.clone(),.5,1,0),stir=box(.45,.05,.1,white,.5,.59,0);label('COUPLING · 200 mL',.5,2.8,0,2.5);
  for(let i=1;i<=4;i++){const y=.55+i*.34;pipe([[1.07,y,.26],[1.16,y,.26]],metal,.009);label(`${i*50}`,1.27,y,.3,.45);}
  cyl(.035,1.55,metal,.1,1.65,.15);cyl(.06,.15,navy,.1,.8,.15);box(.9,.5,.18,navy,.1,2.65,-.2);const phLabel=label('pH —',.1,2.65,-.08,.85,'#dcfff4',64);
  cyl(.3,1.4,glass,2.1,1.4,-.7);cyl(.33,.14,navy,2.1,2.15,-.7);const base=cyl(.25,1,liquid,2.1,1.2,-.7);pipe([[2.1,2.1,-.7],[1.8,2.6,-.3],[.7,2.3,.1]]);label('0.5 M BASE · FINITE',2.1,2.85,-.7,2.5);
  const profile=[[0,0],[.44,0],[.5,.12],[.15,.95],[.13,1.15]].map(([r,y])=>new T.Vector2(r,y));mesh(new T.LatheGeometry(profile,48),glass,2.65,.3,.65);mesh(new T.CylinderGeometry(.46,.11,.35,48),white,2.65,1.75,.65);cyl(.12,.25,glass,2.65,1.45,.65);cyl(.46,.07,glass,2.65,.33,1.65);label('DYE / PRECURSOR CAKE',2.65,.88,1.75,2.7);
  box(.9,.6,.8,navy,-3.15,.65,-.65);const tempLabel=label('20.0 °C',-3.15,1.15,-.45,1.1,'#395a70',64);pipe([[-3.15,.55,-.65],[-2.65,.5,-.8],[-2.6,.8,0]],navy);label('COOLING LOOP',-3.15,1.65,-.65,1.8);
  const particles=(m,count)=>Array.from({length:count},(_,i)=>{const o=mesh(new T.OctahedronGeometry(.035,0),m);o.scale.set(1,1.5,.6);o.rotation.set(i*.3,i*.7,0);return o;}),dyeInVessel=particles(orange,65),napInVessel=particles(ivory,30),dyeCake=particles(orange,65),napCake=particles(ivory,30);
  let frame,prior,last=0,dirty=true,visible=true;const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);fitApparatusCamera(scene,camera,controls,new T.Vector3(1.6,1.65,6.8));dirty=true;});resize.observe(node);const observer=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});observer.observe(node);controls.addEventListener('change',()=>{dirty=true;});
  const draw=now=>{frame=requestAnimationFrame(draw);if(!visible||document.hidden||now-last<33)return;last=now;
   if(prior!==live.current){prior=live.current;dirty=true;const {state:s,values:v,result:r}=prior,charged=s.phase!=='empty',active=s.phase!=='collected';src.visible=charged&&s.source.volume>1e-12;receiver.visible=charged;base.visible=charged&&r.baseRemaining>1e-12;stir.visible=charged&&active;
    const fill=(o,h,bottom)=>{o.scale.y=Math.max(.001,h);o.position.y=bottom+h/2;};fill(src,s.source.volume/.06*1.45,.49);fill(receiver,s.receiver.volume/.2*1.45,.56);fill(base,r.baseRemaining/.5/.065*1.2,.73);rotor.rotation.z=s.transferred*Math.PI*50;stir.rotation.y=s.time*10;
    const dyeColor=new T.Color('#e1e9d6').lerp(new T.Color('#dc6727'),Math.min(1,(r.receiver.amounts.dyeAnion||0)/Math.max(s.receiver.volume,1e-9)*200));receiver.material.color.copy(dyeColor);phLabel(charged&&r.receiver.pH!==null?`pH ${r.receiver.pH.toFixed(2)}`:'pH —');tempLabel(`${s.temperature.toFixed(1)} °C`);
    for(const [list,mass,isCake] of [[dyeInVessel,r.receiver.dyeSolid*AZO_MW.dye,false],[napInVessel,r.receiver.napSolid*AZO_MW.naphthol,false],[dyeCake,r.collected,true],[napCake,r.impurity,true]]){const count=Math.min(list.length,Math.round(mass*55));list.forEach((o,i)=>{o.visible=charged&&i<count;const a=i*2.39996+(!isCake&&active?s.time*2:0),rad=(isCake?.34:.42)*Math.sqrt((i+.5)/list.length);o.position.set((isCake?2.65:.5)+Math.cos(a)*rad,(isCake?.4:.65)+(i%3)*.025,(isCake?1.65:0)+Math.sin(a)*rad);});}
   }
   if(controls.update())dirty=true;if(dirty){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(draw);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
 },[]);
 return <div className="azo-scene"><div className="azo-scene-host" ref={host}/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Original 3D · cold vessels · finite pH-stat · model precipitate</span><button aria-label="Reset azo apparatus camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?'Exit azo apparatus fullscreen':'Fullscreen azo apparatus'} onClick={toggle}><Maximize2 size={15}/></button></div></div>;
}
