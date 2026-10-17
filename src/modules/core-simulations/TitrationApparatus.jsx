import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Maximize2, RotateCcw } from 'lucide-react';

export default function TitrationApparatus({ state, values, spec }) {
  const host=useRef(), api=useRef(), live=useRef({state,values});
  const [ready,setReady]=useState(false),[error,setError]=useState('');
  live.current={state,values};
  useEffect(()=>{
    const node=host.current;
    let renderer;
    try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});}catch{setError('WebGL unavailable. Volume, chemistry and recording controls still work.');return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,1.5)); renderer.setClearColor('#f4f9fb',1);
    renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.shadowMap.enabled=true;
    renderer.domElement.setAttribute('aria-label','Original 3D burette, stopcock, pipette and conical flask. Drag to orbit, scroll to zoom.');
    renderer.domElement.tabIndex=0;node.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,60);
    camera.position.set(4.6,3.4,8);const controls=new OrbitControls(camera,renderer.domElement);
    controls.target.set(0,2.5,0);controls.enableDamping=true;controls.minDistance=5;controls.maxDistance=15;controls.saveState();
    scene.add(new THREE.HemisphereLight('#ffffff','#8599a9',2.8));
    const light=new THREE.DirectionalLight('#ffffff',3);light.position.set(-4,7,6);light.castShadow=true;scene.add(light);
    const metal=new THREE.MeshStandardMaterial({color:'#859aa7',metalness:.7,roughness:.3});
    const glass=new THREE.MeshPhysicalMaterial({color:'#e1f4fa',transparent:true,opacity:.23,roughness:.08,metalness:0,depthWrite:false,side:THREE.DoubleSide});
    const white=new THREE.MeshStandardMaterial({color:'#e8eef1',roughness:.6});
    const blue=new THREE.MeshStandardMaterial({color:'#1d839d',roughness:.38});
    const liquid=new THREE.MeshPhysicalMaterial({color:'#e6bb27',transparent:true,opacity:.83,roughness:.22});
    const titrant=new THREE.MeshPhysicalMaterial({color:spec.type==='permanganate'?'#802a9a':spec.type==='redox'?'#e2a62f':'#8bc7d7',transparent:true,opacity:.68,roughness:.2});
    const add=(geometry,material,x,y,z)=>{const o=new THREE.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o;};
    const cylinder=(r,h,m,x,y,z)=>add(new THREE.CylinderGeometry(r,r,h,32),m,x,y,z);
    const box=(w,h,d,m,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
    const text=(value,x,y,z,size=.14)=>{
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;
      const c=canvas.getContext('2d');c.fillStyle='#173746';c.font='500 44px sans-serif';c.textAlign='center';c.fillText(value,256,65);
      const texture=new THREE.CanvasTexture(canvas),m=new THREE.SpriteMaterial({map:texture,depthTest:false,transparent:true});
      const sprite=new THREE.Sprite(m);sprite.position.set(x,y,z);sprite.scale.set(size*5.33,size,1);scene.add(sprite);return sprite;
    };
    box(5.5,.12,3.2,white,0,.12,0);
    box(1.4,.13,.9,metal,-.75,.25,-.05);cylinder(.045,4.65,metal,-1.22,2.6,-.13);
    for(const y of [2.8,4.8]){const bar=cylinder(.035,1.5,metal,-.52,y,-.13);bar.rotation.z=Math.PI/2;}
    const burette=cylinder(.105,2.8,glass,0,3.65,0);
    cylinder(.13,.06,blue,0,5.08,0);
    const column=cylinder(.075,2.65,titrant,0,3.65,0);
    cylinder(.036,.5,glass,0,1.96,0);box(.4,.08,.1,blue,0,2.22,0);
    for(let i=0;i<=50;i++){
      const y=4.99-i/50*2.65;box(i%5===0?.12:.06,.008,.012,metal,.12,y,.07);
      if(i%10===0)text(String(i),.36,y,.1,.12);
    }
    text('50 mL · Class A',.1,5.35,0,.16);
    const profile=[[.0,.02],[.58,.02],[.65,.08],[.63,.18],[.18,1.05],[.15,1.35],[.2,1.38]].map(([r,y])=>new THREE.Vector2(r,y));
    add(new THREE.LatheGeometry(profile,64),glass,0,.3,0);
    const flaskLiquid=add(new THREE.CylinderGeometry(.39,.57,.38,48),liquid,0,.55,0);
    const meniscus=cylinder(.39,.012,liquid,0,.74,0);
    text('250 mL',.5,.93,.42,.13);
    const drop=add(new THREE.SphereGeometry(.04,16,12),titrant,0,1.6,0);drop.visible=false;
    // A separate volumetric pipette represents the transferred aliquot.
    cylinder(.045,2.5,glass,1.3,1.65,0);add(new THREE.SphereGeometry(.13,24,16),glass,1.3,1.8,0);
    const pipetteLiquid=cylinder(.022,1.6,titrant,1.3,1.7,0);text('25 mL pipette',1.4,3.15,0,.14);
    const ring=add(new THREE.TorusGeometry(.35,.015,8,48),white,0,.61,0);ring.rotation.x=Math.PI/2;ring.visible=false;
    api.current={reset:()=>controls.reset()};
    let frame,previous=0,lastVolume=0,dropUntil=0,visible=true,dirty=true,lastValues=null;
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;dirty=true;});observer.observe(node);
    const resize=new ResizeObserver(()=>{const {width,height}=node.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/Math.max(height,1);camera.updateProjectionMatrix();dirty=true;});resize.observe(node);
    controls.addEventListener('change',()=>{dirty=true;});
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick=now=>{
      frame=requestAnimationFrame(tick);if(!visible||document.hidden||now-previous<33)return;previous=now;
      const current=live.current,{state:s,values:v}=current;
      if(v!==lastValues){dirty=true;lastValues=v;}
      if(v.delivered!==lastVolume){if(v.delivered>lastVolume)dropUntil=now+350;lastVolume=v.delivered;dirty=true;}
      const fraction=Math.max(.001,(50-v.delivered)/50);column.scale.y=fraction;column.position.y=2.325+2.65*fraction/2;
      const height=v.prepared ? .28+v.delivered/50*.23 : .001;
      flaskLiquid.visible=v.prepared;meniscus.visible=v.prepared;
      flaskLiquid.scale.y=height/.38;flaskLiquid.position.y=.32+height/2;meniscus.position.y=.32+height;
      liquid.color.set(s.color);pipetteLiquid.visible=!v.prepared;
      drop.visible=v.prepared&&!reduced&&now<dropUntil;
      if(drop.visible)drop.position.y=1.7-(1-(dropUntil-now)/350)*.6;
      ring.visible=v.prepared&&drop.visible;ring.scale.setScalar(1+(1-(dropUntil-now)/350)*.3);
      if(controls.update())dirty=true;
      if(dirty||drop.visible){renderer.render(scene,camera);dirty=false;}
    };
    frame=requestAnimationFrame(tick);setReady(true);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();resize.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});renderer.dispose();renderer.forceContextLoss();node.replaceChildren();api.current=null;};
  },[spec.type]);
  return <div className="titration-3d" data-ready={ready}>
    <div ref={host} className="titration-3d-host" />
    {error&&<p role="alert">{error}</p>}
    <div className="titration-camera"><span>Real 3D · drag to orbit · scroll to zoom</span><button aria-label="Reset apparatus camera" onClick={()=>api.current?.reset()}><RotateCcw size={15}/></button><button aria-label="Fullscreen apparatus" onClick={()=>host.current?.parentElement.requestFullscreen?.()}><Maximize2 size={15}/></button></div>
  </div>;
}
