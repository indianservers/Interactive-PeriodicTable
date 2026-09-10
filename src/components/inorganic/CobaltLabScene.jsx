import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {octahedral,tetrahedral,clamp} from './cobaltModel.js';

export default function CobaltLabScene({kind='pink',fraction=0,progress=0,motion=true,onCapture}){
 const host=useRef(null),latest=useRef({fraction,progress,motion,onCapture});latest.current={fraction,progress,motion,onCapture};
 const [error,setError]=useState('');
 useEffect(()=>{
  const container=host.current;let renderer,frame,observer,controls,environment,pmrem;const resources=new Set();
  const own=value=>{resources.add(value);return value;};
  const scene=new T.Scene();let visible=true;const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  try{
   renderer=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.setClearColor('#071523',0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.85;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.appendChild(renderer.domElement);
   pmrem=new T.PMREMGenerator(renderer);environment=new RoomEnvironment();const env=own(pmrem.fromScene(environment,.05));scene.environment=env.texture;
   scene.environmentIntensity=.3;
   const live=kind==='live';const camera=new T.PerspectiveCamera(live?37:34,1,.1,80);camera.position.set(live?4.4:3,live?2.8:3.4,live?7:8.5);camera.lookAt(0,live?0:2.25,0);
   controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,live?0:2.25,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=live?4:8;controls.maxDistance=live?13:17;controls.maxPolarAngle=Math.PI*.68;
   scene.add(new T.HemisphereLight('#cfe9ff','#07101b',.8));
   const key=new T.DirectionalLight('#fff1e6',2.4);key.position.set(-3,8,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);scene.add(key);
   const rim=new T.DirectionalLight('#7dbaff',1.5);rim.position.set(4,3,-5);scene.add(rim);
   const sphere=own(new T.SphereGeometry(1,24,16)),cylinder=own(new T.CylinderGeometry(1,1,1,14));
   const material=color=>own(new T.MeshPhysicalMaterial({color,roughness:.23,metalness:.08,clearcoat:.7}));
   const mats={Co:material('#9909df'),O:material('#eb1739'),H:material('#f8faff'),Cl:material('#04c33d'),bond:material('#c7d1ea')};
   function atom(parent,element,position,radius){const mesh=new T.Mesh(sphere,mats[element]);mesh.position.copy(position);mesh.scale.setScalar(radius);mesh.castShadow=true;parent.add(mesh);return mesh;}
   function bond(parent,a,b,radius=.055){const mesh=new T.Mesh(cylinder,mats.bond);const delta=b.clone().sub(a);mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(radius,delta.length(),radius);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh;}
   function water(parent,direction){const group=new T.Group();parent.add(group);const p=new T.Vector3(...direction);group.position.copy(p);atom(group,'O',new T.Vector3(),.18);const out=p.clone().normalize(),side=new T.Vector3(0,1,0);if(Math.abs(out.dot(side))>.8)side.set(1,0,0);side.cross(out).normalize();for(const sign of [-1,1]){const h=out.clone().multiplyScalar(.22).addScaledVector(side,sign*.285);atom(group,'H',h,.105);bond(group,new T.Vector3(),h,.035);}return group;}
   const molecule=new T.Group();scene.add(molecule);molecule.position.y=live?0:3.75;molecule.rotation.set(.2,.5,.2);if(!live)molecule.scale.setScalar(.74);atom(molecule,'Co',new T.Vector3(),.31);
   const waters=[],chlorides=[],waterBonds=[],clBonds=[];
   octahedral.forEach(v=>{const pos=new T.Vector3(...v).multiplyScalar(.97);waters.push(water(molecule,pos.toArray()));waterBonds.push(bond(molecule,new T.Vector3(),pos));});
   tetrahedral.forEach(v=>{const pos=new T.Vector3(...v).multiplyScalar(1.05);chlorides.push(atom(molecule,'Cl',pos,.24));clBonds.push(bond(molecule,new T.Vector3(),pos));});
   let liquid,meniscus,bubbles,shine,shown=latest.current.fraction;
   if(!live){
    scene.fog=new T.FogExp2('#071522',.035);
    const stone=document.createElement('canvas');stone.width=stone.height=256;const stoneContext=stone.getContext('2d');stoneContext.fillStyle='#1a2c3e';stoneContext.fillRect(0,0,256,256);
    for(let i=0;i<12000;i++){const n=(Math.sin(i*127.1)*43758.5453)%1;stoneContext.fillStyle=i%2?'rgba(110,150,180,.10)':'rgba(0,8,20,.16)';stoneContext.fillRect(Math.abs(n)*256,(i*73)%256,1+(i%3),1);}
    const stoneMap=own(new T.CanvasTexture(stone));stoneMap.colorSpace=T.SRGBColorSpace;stoneMap.wrapS=stoneMap.wrapT=T.RepeatWrapping;stoneMap.repeat.set(90,90);
    const bench=new T.Mesh(own(new T.PlaneGeometry(200,200)),own(new T.MeshStandardMaterial({map:stoneMap,color:'#527596',metalness:.3,roughness:.3,envMapIntensity:.02})));bench.rotation.x=-Math.PI/2;bench.receiveShadow=true;scene.add(bench);
    // Continuous lathed wall includes the glass base and inner wall thickness.
    const profile=[[0,.06],[.9,.06],[1.03,.1],[1.07,.2],[1.07,2.35],[1.03,2.39],[.99,2.35],[.99,.2],[.9,.15],[0,.15]].map(([x,y])=>new T.Vector2(x,y));
    const glass=own(new T.MeshPhysicalMaterial({color:'#e3f1ff',roughness:.045,metalness:0,transmission:.98,thickness:.08,ior:1.47,transparent:true,opacity:.23,side:T.DoubleSide,depthWrite:false,envMapIntensity:.7}));
    scene.add(new T.Mesh(own(new T.LatheGeometry(profile,72)),glass));
    for(const y of [.12,2.37]){const lip=new T.Mesh(own(new T.TorusGeometry(1.035,.038,12,80)),glass);lip.rotation.x=Math.PI/2;lip.position.y=y;scene.add(lip);}
    const fluid=own(new T.MeshPhysicalMaterial({color:'#e75498',roughness:.15,metalness:0,transparent:true,opacity:.84,transmission:.08,thickness:1.6,ior:1.333,depthWrite:false,clearcoat:.6,envMapIntensity:.35}));
    liquid=new T.Mesh(own(new T.CylinderGeometry(.98,.98,1.53,64)),fluid);liquid.position.y=.96;scene.add(liquid);
    meniscus=new T.Mesh(own(new T.CircleGeometry(.985,64)),own(new T.MeshPhysicalMaterial({color:'#ff85bb',roughness:.14,metalness:.03,transparent:true,opacity:.73,envMapIntensity:.2,side:T.DoubleSide})));meniscus.rotation.x=-Math.PI/2;meniscus.position.y=1.735;scene.add(meniscus);
    const ring=new T.Mesh(own(new T.TorusGeometry(.965,.015,8,70)),meniscus.material);ring.rotation.x=Math.PI/2;ring.position.y=1.74;scene.add(ring);
    const marks=document.createElement('canvas');marks.width=256;marks.height=512;const ctx=marks.getContext('2d');ctx.strokeStyle='rgba(239,247,255,.85)';ctx.fillStyle='#f2f8ff';ctx.lineWidth=2;ctx.font='24px sans-serif';
    for(let i=1;i<=5;i++){const y=450-i*67;ctx.beginPath();ctx.moveTo(130,y);ctx.lineTo(166,y);ctx.stroke();ctx.fillText(String(i*10),175,y+8);}ctx.beginPath();ctx.moveTo(130,115);ctx.lineTo(130,430);ctx.stroke();
    const texture=own(new T.CanvasTexture(marks));texture.colorSpace=T.SRGBColorSpace;const decal=new T.Mesh(own(new T.CylinderGeometry(1.079,1.079,2.25,48,1,true,-.2,1.15)),own(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:T.DoubleSide})));decal.position.y=1.2;scene.add(decal);
    bubbles=new T.InstancedMesh(own(new T.SphereGeometry(.018,6,4)),own(new T.MeshStandardMaterial({color:'#f2d7ff',transparent:true,opacity:.4,roughness:.1})),64);scene.add(bubbles);
    shine=new T.PointLight('#ed3e92',1.3,3);shine.position.set(0,.6,.4);scene.add(shine);
   }else{
    const dots=new T.InstancedMesh(sphere,own(new T.MeshStandardMaterial({color:'#6491b0',transparent:true,opacity:.3})),32);const dummy=new T.Object3D();for(let i=0;i<32;i++){dummy.position.set(Math.sin(i*13)*3.8,Math.cos(i*7)*2.5,Math.sin(i*17)*3);dummy.scale.setScalar(.07);dummy.updateMatrix();dots.setMatrixAt(i,dummy.matrix);}scene.add(dots);
   }
   let dirty=true,lastProgress=-1;controls.addEventListener('change',()=>{dirty=true;});
   const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix();dirty=true;};observer=new ResizeObserver(resize);observer.observe(container);resize();
   let last=0,captured=false;const dummy=new T.Object3D();
   const tick=now=>{frame=requestAnimationFrame(tick);if(document.hidden||!visible)return;const dt=Math.min(.25,(now-last)/1000||.016);last=now;const moving=latest.current.motion&&!reduced.matches;
    const p=live?clamp(latest.current.progress):kind==='blue'?1:0;
    shown=T.MathUtils.damp(shown,latest.current.fraction,4,dt);
    if(moving)molecule.rotation.y+=dt*.15;
    waters.forEach((w,i)=>{const v=new T.Vector3(...octahedral[i]);w.position.copy(v).multiplyScalar(.97+p*1.65);w.scale.setScalar(1-.15*p);waterBonds[i].visible=p<.58;waterBonds[i].scale.x=waterBonds[i].scale.z=.055*(1-p);});
    chlorides.forEach((c,i)=>{const v=new T.Vector3(...tetrahedral[i]);c.position.copy(v).multiplyScalar(1.05+(1-p)*2.4);c.visible=p>.02;clBonds[i].visible=p>.55;});
    if(!live){waters.forEach(w=>w.visible=kind!=='blue');const color=new T.Color('#df4e93').lerp(new T.Color('#063dff'),shown);liquid.material.color.copy(color);meniscus.material.color.copy(color).lerp(new T.Color('#b5d6ff'),.18);shine.color.copy(color);if(moving)meniscus.rotation.x=-Math.PI/2+Math.sin(now*.0017)*.008;
     for(let i=0;i<64;i++){const angle=i*2.399,r=.86*Math.sqrt((i+.5)/64);dummy.position.set(Math.cos(angle)*r,.23+((i*.077+(moving?now*.000035:0))%1.4),Math.sin(angle)*r);dummy.updateMatrix();bubbles.setMatrixAt(i,dummy.matrix);}bubbles.instanceMatrix.needsUpdate=true;
    }
    controls.update();if(moving||dirty||Math.abs(shown-latest.current.fraction)>.0001||lastProgress!==p){renderer.render(scene,camera);dirty=false;lastProgress=p;}container.dataset.ready='true';container.dataset.fraction=shown.toFixed(3);container.dataset.progress=p.toFixed(3);
    if(!captured&&latest.current.onCapture){captured=true;latest.current.onCapture(renderer.domElement.toDataURL('image/png'));}
   };frame=requestAnimationFrame(tick);
   const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;});intersection.observe(container);own({dispose:()=>intersection.disconnect()});
  }catch(e){setError('3D rendering unavailable. Try a WebGL-enabled browser. '+e.message);}
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();resources.forEach(r=>r.dispose?.());environment?.dispose();pmrem?.dispose();renderer?.dispose();renderer?.forceContextLoss();container.replaceChildren();};
 },[kind]);
 return <div className="cobalt-scene" ref={host} aria-label={kind==='live'?'Interactive cobalt ligand substitution':`${kind==='blue'?'Tetrahedral chloride':'Octahedral aqua'} cobalt complex and glass beaker`}>{error&&<p role="alert">{error}</p>}</div>;
}
