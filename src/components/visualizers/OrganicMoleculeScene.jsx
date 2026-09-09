import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { molecules, expandMolecule, atomStyles as styles } from '../../pages/organicMolecules.js';

export default function OrganicMoleculeScene({moleculeId='ethanol',animationEnabled=true,showLabels=false,cameraResetKey=0,onAtomSelect,className=""}){
 const host=useRef(null),sceneRef=useRef(null),callback=useRef(onAtomSelect),labelState=useRef(showLabels);
 const [hover,setHover]=useState(null),[fallback,setFallback]=useState(false);
 useEffect(()=>{callback.current=onAtomSelect;},[onAtomSelect]);
 useEffect(()=>{labelState.current=showLabels;},[showLabels]);
 useEffect(()=>{sceneRef.current?.controls.reset();sceneRef.current?.group.rotation.set(0,0,.12);},[cameraResetKey]);
 useEffect(()=>{
  const element=host.current;if(!element)return;
  const molecule=molecules[moleculeId],{atoms,bonds}=expandMolecule(molecule);
  setHover(null);setFallback(false);
  let renderer;
  try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{setFallback(true);return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute("aria-label",`3D ${molecule.name}: schematic ball-and-stick model. Drag to rotate; scroll to zoom.`);
  renderer.domElement.dataset.molecule=moleculeId;
  renderer.domElement.dataset.atomCount=atoms.length;
  renderer.domElement.dataset.bondOrders=JSON.stringify(bonds.map(b=>b[2]));
  element.appendChild(renderer.domElement);
  const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(32,1,.1,100);
  const bounds=new THREE.Box3().setFromPoints(atoms.map(a=>new THREE.Vector3(...a.slice(1))));
  const center=bounds.getCenter(new THREE.Vector3());
  const distance=Math.max(8,bounds.getSize(new THREE.Vector3()).length()*1.7);
  camera.position.copy(center).add(new THREE.Vector3(.1,1.2,distance));camera.lookAt(center);
  const controls=new OrbitControls(camera,renderer.domElement);
  controls.target.copy(center);controls.enablePan=false;controls.enableDamping=animationEnabled;controls.minDistance=4;controls.maxDistance=20;controls.update();controls.saveState();
  const group=new THREE.Group();scene.add(group);group.rotation.z=.12;
  const meshes=[],labels=[];
  atoms.forEach(([type,x,y,z])=>{
   const style=styles[type],mesh=new THREE.Mesh(new THREE.SphereGeometry(style.radius,32,24),new THREE.MeshStandardMaterial({color:style.color,roughness:.33,metalness:.06}));
   mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.userData={type,label:style.label,number:style.number};group.add(mesh);meshes.push(mesh);
   const label=document.createElement("span");label.className="organic-atom-label";label.textContent=type;label.setAttribute("aria-hidden","true");element.appendChild(label);labels.push(label);
  });
  bonds.forEach(([a,b,order=1])=>{
   const start=meshes[a].position,end=meshes[b].position,delta=new THREE.Vector3().subVectors(end,start);
   const offset=new THREE.Vector3(-delta.y,delta.x,0).normalize();
   for(let j=0;j<order;j++){
   const bond=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,delta.length(),16),new THREE.MeshStandardMaterial({color:0x919ca8,roughness:.45}));
   bond.position.copy(start).add(end).multiplyScalar(.5).addScaledVector(offset,(j-(order-1)/2)*.19);bond.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());bond.castShadow=true;group.add(bond);
   }
  });
  scene.add(new THREE.HemisphereLight(0xffffff,0x899caf,2));
  const light=new THREE.DirectionalLight(0xffffff,2.5);light.position.set(-3,5,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);scene.add(light);
  const fill=new THREE.DirectionalLight(0xe6f5ff,1);fill.position.set(4,1,-3);scene.add(fill);
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const hit=e=>{const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);return ray.intersectObjects(meshes)[0]?.object;};
  const move=e=>{const atom=hit(e);setHover(atom?atom.userData.label:null);renderer.domElement.style.cursor=atom?"pointer":"grab";};
  let down=null;
  const pointerDown=e=>{down=[e.clientX,e.clientY];};
  const click=e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>5)return;const atom=hit(e);if(atom)callback.current?.(atom.userData);};
  const leave=()=>setHover(null);
  const key=e=>{const keys=["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-"];if(!keys.includes(e.key))return;e.preventDefault();if(e.key==="ArrowLeft")group.rotation.y-=.12;if(e.key==="ArrowRight")group.rotation.y+=.12;if(e.key==="ArrowUp")group.rotation.x-=.12;if(e.key==="ArrowDown")group.rotation.x+=.12;if(["+","=","-"].includes(e.key)){camera.position.sub(controls.target).multiplyScalar(e.key==="-"?1.1:.9).add(controls.target);}};
  renderer.domElement.addEventListener("pointermove",move);renderer.domElement.addEventListener("pointerdown",pointerDown);renderer.domElement.addEventListener("click",click);renderer.domElement.addEventListener("pointerleave",leave);renderer.domElement.addEventListener("keydown",key);
  const resize=()=>{const w=element.clientWidth,h=element.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();};
  const observer=new ResizeObserver(resize);observer.observe(element);resize();
  sceneRef.current={controls,group};let frame;
  const tick=()=>{controls.update();renderer.render(scene,camera);meshes.forEach((mesh,i)=>{const label=labels[i];label.style.display=labelState.current?"block":"none";if(labelState.current){const point=mesh.getWorldPosition(new THREE.Vector3()).project(camera);label.style.left=(point.x*.5+.5)*element.clientWidth+"px";label.style.top=(-point.y*.5+.5)*element.clientHeight+"px";}});frame=requestAnimationFrame(tick);};tick();
  return()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});renderer.dispose();renderer.domElement.remove();labels.forEach(l=>l.remove());sceneRef.current=null;};
 },[moleculeId]);
 useEffect(()=>{if(sceneRef.current)sceneRef.current.controls.enableDamping=animationEnabled;},[animationEnabled]);
 return <div className={"organic-three-scene "+className}><div ref={host} style={{position:"absolute",inset:0}}/>{hover&&<span className="on-hover-atom">{hover}</span>}{fallback&&<span>3D requires WebGL. Use the 2D view to explore the structure.</span>}</div>;
}
