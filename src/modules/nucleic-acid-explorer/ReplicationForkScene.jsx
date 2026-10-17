import {useEffect,useRef} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
export default function ReplicationForkScene({position=0,playing=false}) {
 const host=useRef(null),live=useRef({position,playing});live.current={position,playing};
 useEffect(()=>{
  const node=host.current;let renderer;try{renderer=new T.WebGLRenderer({alpha:true,antialias:true});}catch{return;}
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x061725,0);renderer.outputColorSpace=T.SRGBColorSpace;node.appendChild(renderer.domElement);
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,100);camera.position.set(0,1.5,18);const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=10;controls.maxDistance=30;
  scene.add(new T.HemisphereLight(0xd9efff,0x112941,2));const light=new T.DirectionalLight(0xffffff,2);light.position.set(0,5,8);scene.add(light);
  const group=new T.Group();scene.add(group);const materials=new Map(),geometry=new T.SphereGeometry(1,12,10),tubeGeometry=new T.CylinderGeometry(1,1,1,8);
  const material=color=>{if(!materials.has(color))materials.set(color,new T.MeshStandardMaterial({color,roughness:.35,metalness:.05}));return materials.get(color);};
  const sphere=(point,r,color,parent=group)=>{const atom=new T.Mesh(geometry,material(color));atom.position.copy(point);atom.scale.setScalar(r);parent.add(atom);return atom;};
  const bond=(a,b,color,r=.025,parent=group)=>{const delta=b.clone().sub(a),mesh=new T.Mesh(tubeGeometry,material(color));mesh.position.copy(a).add(b).multiplyScalar(.5);mesh.scale.set(r,delta.length(),r);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(mesh);};
  const daughter=[];
  const helix=(start,end,count,branch)=>{
   const axis=end.clone().sub(start).normalize(),cross=new T.Vector3(0,0,1),side=new T.Vector3().crossVectors(axis,cross).normalize();let prev=[];
   for(let i=0;i<count;i++){
    const centre=start.clone().lerp(end,i/(count-1)),angle=i*.62;
    const pair=[];
    for(let strand=0;strand<2;strand++){
     const phase=angle+strand*Math.PI,point=centre.clone().addScaledVector(side,Math.cos(phase)*.34).addScaledVector(cross,Math.sin(phase)*.34);
     const polymer=branch&&strand===1?new T.Group():group;if(polymer!==group){group.add(polymer);daughter.push({group:polymer,offset:i/count});}
     sphere(point,.085,strand?0xdb688e:0x6b7ebc,polymer);
     sphere(point.clone().addScaledVector(axis,.07),.042,0xef4f55,polymer);
     sphere(point.clone().addScaledVector(side,.06),.045,0xe9d0a4,polymer);
     if(prev[strand])bond(prev[strand],point,0xd1b9c7,.035,polymer);
     const inner=centre.clone().lerp(point,.35);sphere(inner,.052,(i+strand)%2?0x428fd1:0xcba35c,polymer);bond(point,inner,0xa4b3ca,.018,polymer);pair.push(inner);prev[strand]=point;
    }
    bond(pair[0],pair[1],0xb2b8c5,.012);
   }
  };
  helix(new T.Vector3(-6,0,0),new T.Vector3(-1,0,0),36,false);
  helix(new T.Vector3(-1,0,0),new T.Vector3(6,2,0),48,true);
  helix(new T.Vector3(-1,0,0),new T.Vector3(6,-2,0),48,true);
  const enzyme=(x,y,z,color,scale)=>{const enzymeGroup=new T.Group();enzymeGroup.position.set(x,y,z);group.add(enzymeGroup);for(let i=0;i<80;i++){const a=i*2.399,b=Math.acos(1-2*(i+.5)/80),r=.58+.12*Math.sin(i*4.1);sphere(new T.Vector3(Math.cos(a)*Math.sin(b)*r,Math.cos(b)*r,Math.sin(a)*Math.sin(b)*r),.16,color,enzymeGroup);}enzymeGroup.scale.setScalar(scale);return enzymeGroup;};
  const helicase=enzyme(-1,0,0,0x4c9b6c,1.5);enzyme(2.6,1.1,0,0x9b6ba6,1.2);enzyme(1.4,-.9,0,0xb88b4d,.8);enzyme(4.3,-1.6,0,0x609b95,1.1);
  const clamp=new T.Mesh(new T.TorusGeometry(.43,.15,14,30),material(0x9a84cf));clamp.position.set(4.2,1.5,0);clamp.rotation.y=Math.PI/2;group.add(clamp);
  const resize=new ResizeObserver(()=>{const rect=node.getBoundingClientRect();renderer.setSize(rect.width,rect.height,false);camera.aspect=rect.width/Math.max(1,rect.height);camera.updateProjectionMatrix();});resize.observe(node);
  let raf,last=0;const draw=now=>{raf=requestAnimationFrame(draw);if(now-last<60||document.hidden)return;last=now;controls.update();daughter.forEach(item=>item.group.visible=item.offset<.35+live.current.position/150);if(live.current.playing)helicase.rotation.x=live.current.position*.015;renderer.render(scene,camera);};draw(0);
  return()=>{cancelAnimationFrame(raf);resize.disconnect();controls.dispose();geometry.dispose();tubeGeometry.dispose();scene.traverse(o=>{if(o.geometry!==geometry&&o.geometry!==tubeGeometry)o.geometry?.dispose();});materials.forEach(m=>m.dispose());renderer.dispose();renderer.forceContextLoss();node.replaceChildren();};
 },[]);
 return <div className="nae-molecular-fork" ref={host} role="img" aria-label="Illustrative molecular replication fork with parental DNA, leading and lagging daughter strands, and enzyme complexes"/>;
}
