import useApparatusFullscreen from './useApparatusFullscreen.js';
import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {Maximize2,RotateCcw} from 'lucide-react';

export default function SaltRackScene({tubes,selected,onSelect}){
 const host=useRef(),live=useRef({tubes,selected,onSelect}),cameraApi=useRef();
 const [error,setError]=useState('');live.current={tubes,selected,onSelect};
 const {fullscreen,toggle:toggleFullscreen}=useApparatusFullscreen(host,setError);
 useEffect(()=>{
  const node=host.current;let renderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false});}catch{setError('3D is unavailable. Tube selection and chemistry remain available below.');return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor('#f5fafc');renderer.outputColorSpace=T.SRGBColorSpace;
  node.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Five original 3D test tubes. Click a tube to inspect; drag to orbit and scroll to zoom.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,40);camera.position.set(2.2,3.4,9);
  const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,1.5,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=14;controls.saveState();cameraApi.current=controls;
  scene.add(new T.HemisphereLight('#ffffff','#9ab6c5',3));const key=new T.DirectionalLight('#ffffff',2);key.position.set(-3,5,4);scene.add(key);
  const rack=new T.MeshStandardMaterial({color:'#a6bec9',roughness:.45,metalness:.25});
  const glass=new T.MeshPhysicalMaterial({color:'#c5e5ee',transparent:true,opacity:.22,roughness:.07,side:T.DoubleSide,depthWrite:false});
  const base=new T.Mesh(new T.BoxGeometry(5,.13,1.2),rack);base.position.y=.12;scene.add(base);
  const meshes=[],pickable=[];
  const text=(label,x)=>{const canvas=document.createElement('canvas');canvas.width=128;canvas.height=64;const c=canvas.getContext('2d');c.fillStyle='#366379';c.font='bold 36px sans-serif';c.textAlign='center';c.fillText(label,64,43);const sprite=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(canvas),transparent:true}));sprite.position.set(x,.06,.7);sprite.scale.set(.42,.21,1);scene.add(sprite);};
  for(let i=0;i<5;i++){
   const x=(i-2)*.86;
   const profile=[[0,0],[.16,0],[.23,.08],[.25,.2],[.25,2.28],[.28,2.3]].map(([r,y])=>new T.Vector2(r,y));
   const tube=new T.Mesh(new T.LatheGeometry(profile,40),glass);tube.position.set(x,.25,0);scene.add(tube);tube.userData.index=i;pickable.push(tube);
   const rim=new T.Mesh(new T.TorusGeometry(.26,.025,8,40),rack);rim.rotation.x=Math.PI/2;rim.position.set(x,2.55,0);scene.add(rim);
   const liquidMaterial=new T.MeshPhysicalMaterial({color:'#dcecf1',transparent:true,opacity:.8,roughness:.28});
   const fluid=new T.Mesh(new T.CylinderGeometry(.228,.228,1,40),liquidMaterial);fluid.position.set(x,.6,0);scene.add(fluid);
   const sedimentMaterial=new T.MeshStandardMaterial({color:'#efeee6',roughness:.9});
   const sediment=new T.Mesh(new T.CylinderGeometry(.225,.19,.16,32),sedimentMaterial);sediment.position.set(x,.4,0);scene.add(sediment);
   const cloud=new T.Mesh(new T.CylinderGeometry(.225,.225,1,32),sedimentMaterial.clone());cloud.material.transparent=true;cloud.material.opacity=.3;cloud.position.set(x,1.0,0);scene.add(cloud);
   const halo=new T.Mesh(new T.TorusGeometry(.34,.025,8,40),new T.MeshBasicMaterial({color:'#15bcb3'}));halo.rotation.x=Math.PI/2;halo.position.set(x,.27,0);scene.add(halo);
   const ring=new T.Mesh(new T.TorusGeometry(.225,.028,8,40),new T.MeshStandardMaterial({color:'#88603f'}));ring.rotation.x=Math.PI/2;ring.position.set(x,1.1,0);scene.add(ring);
   text(String(i+1),x);meshes.push({fluid,sediment,cloud,halo,ring,height:0});
  }
  // Flame tests take place at a separate burner, never by recoloring liquid.
  const burner=new T.Mesh(new T.CylinderGeometry(.13,.2,.8,24),rack);burner.position.set(2.7,.65,.1);scene.add(burner);
  const flame=new T.Mesh(new T.ConeGeometry(.13,.55,24),new T.MeshBasicMaterial({color:'#f4be35',transparent:true,opacity:.85}));flame.position.set(2.7,1.3,.1);scene.add(flame);
  const loop=new T.Mesh(new T.TorusGeometry(.08,.012,8,24),rack);loop.position.set(2.7,1.26,.1);scene.add(loop);
  const filter=new T.Mesh(new T.PlaneGeometry(.5,.8),new T.MeshPhysicalMaterial({color:'#244dcc',transparent:true,opacity:.28,side:T.DoubleSide}));filter.position.set(2.7,1.35,.45);scene.add(filter);
  const ray=new T.Raycaster(),pointer=new T.Vector2();let down=null;
  const start=e=>{down=[e.clientX,e.clientY];};
  const pick=e=>{if(!down||Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObjects(pickable)[0];if(hit)live.current.onSelect(hit.object.userData.index);};
  renderer.domElement.addEventListener('pointerdown',start);renderer.domElement.addEventListener('pointerup',pick);
  let dirty=true,frame,last=0,visible=true,prior=null;
  controls.addEventListener('change',()=>{dirty=true;});
  const resize=new ResizeObserver(()=>{const r=node.getBoundingClientRect();renderer.setSize(r.width,r.height);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();dirty=true;});resize.observe(node);
  const visibility=new IntersectionObserver(([e])=>{visible=e.isIntersecting;dirty=true;});visibility.observe(node);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const render=now=>{frame=requestAnimationFrame(render);const dt=Math.min(.1,(now-last)/1000);last=now;if(!visible||document.hidden)return;
   if(prior!==live.current){prior=live.current;dirty=true;}
   let moving=false;
   meshes.forEach((m,i)=>{const tube=live.current.tubes[i],r=tube?.result,target=tube?Math.min(1.9,(r?.volume??tube.volume)/5*1.9):0;
    m.height=reduced?target:m.height+(target-m.height)*(1-Math.exp(-dt*10));if(Math.abs(m.height-target)>.001)moving=true;
    m.fluid.visible=m.height>.001;m.fluid.scale.y=Math.max(.001,m.height);m.fluid.position.y=.42+m.height/2;m.fluid.material.color.set(r?.color??tube?.color??'#dcecf1');
    const precip=!!r?.precipitate;m.sediment.visible=precip&&tube.settled;m.cloud.visible=precip&&!tube.settled;m.cloud.scale.y=Math.max(.001,m.height);m.cloud.position.y=.42+m.height/2;
    const pelletHeight=Math.min(.2,.018+(r?.precipitateMassMg??0)*.015);m.sediment.scale.y=pelletHeight/.16;m.sediment.position.y=.42+pelletHeight/2;m.cloud.material.opacity=Math.min(.55,.12+(r?.precipitateMassMg??0)*.025);
    m.sediment.material.color.set(r?.color??'#efeee6');m.cloud.material.color.set(r?.color??'#efeee6');m.halo.visible=live.current.selected===i;m.ring.visible=r?.positive&&r.test==='nitrate';m.ring.position.y=.42+m.height*.65;
   });
   const active=live.current.tubes[live.current.selected]?.result;flame.visible=!!active?.emissionColor;loop.visible=flame.visible;filter.visible=flame.visible&&active.test==='potassium';if(flame.visible)flame.material.color.set(active.emissionColor);
   if(controls.update())dirty=true;if(dirty||moving){renderer.render(scene,camera);dirty=false;}
  };frame=requestAnimationFrame(render);
  return()=>{cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',start);renderer.domElement.removeEventListener('pointerup',pick);scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}});renderer.dispose();renderer.forceContextLoss();node.replaceChildren();cameraApi.current=null;};
 },[]);
 return <div className="salt-rack"><div className="salt-rack-host" ref={host}/>{error&&<p role="alert">{error}</p>}<div className="titration-camera"><span>Real 3D · fluid levels track volume · precipitates magnified for visibility</span><button aria-label="Reset rack camera" onClick={()=>cameraApi.current?.reset()}><RotateCcw size={15}/></button><button aria-label={fullscreen?"Exit rack fullscreen":"Fullscreen test tube rack"} onClick={toggleFullscreen}><Maximize2 size={15}/></button></div></div>;
}
