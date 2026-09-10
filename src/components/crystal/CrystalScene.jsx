import {useEffect,useRef,useState} from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {ConvexGeometry} from 'three/examples/jsm/geometries/ConvexGeometry.js';
import {cartesian,latticeAtoms,planeData} from './crystalStructures.js';

function label(text,color='#deefff'){
 const c=document.createElement('canvas');c.width=512;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='rgba(4,18,30,.83)';ctx.fillRect(0,0,512,80);ctx.font='32px sans-serif';ctx.textAlign='center';ctx.fillStyle=color;ctx.fillText(text,256,51);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return new T.Sprite(new T.SpriteMaterial({map,transparent:true,depthTest:false}));
}
export function crystalWorld(s,o={}){
 const group=new T.Group(),resources=new Set(),own=x=>(resources.add(x),x),mini=!!o.mini;
 const sphere=own(new T.SphereGeometry(1,mini?16:28,mini?12:20)),cylinder=own(new T.CylinderGeometry(1,1,1,8));
 const atoms=latticeAtoms(s,o.repeat||1),plane=planeData(s,o.hkl||[1,1,1]);
 const clipping=o.clip&&plane?[new T.Plane(new T.Vector3(...plane.normal),plane.constant)]:[];
 const central=a=>a.f.every(v=>v>=-1e-5&&v<=1.00001);
 const vacancyCount=o.vacancy?Math.max(1,Math.floor(atoms.length*(o.defect||0)/100)):0;
 const ranked=[...atoms].sort((a,b)=>Math.hypot(...a.position)-Math.hypot(...b.position));const removed=new Set(ranked.slice(0,vacancyCount).map(a=>a.id));
 // A disclosed foreground cutaway exposes the selected cell without altering
 // any site coordinates. Disable it to inspect the complete periodic supercell.
 const active=atoms.filter(a=>!removed.has(a.id)&&(mini||!o.cutaway||central(a)||a.position[0]*.6+a.position[1]*.42+a.position[2]*.67<s.a*.15));
 const nearPlane=a=>plane&&Math.abs(a.position.reduce((v,x,i)=>v+x*plane.normal[i],plane.constant))<s.a*.025;
 function material(color,opacity=1){return own(new T.MeshPhysicalMaterial({color,roughness:.23,metalness:.08,clearcoat:.8,envMapIntensity:.55,transparent:opacity<1,opacity,clippingPlanes:clipping}));}
 const scale=o.mode==='Ball & stick'?.35:o.mode==='Space-filling'?1:.8;
 for(let species=0;species<s.species.length;species++)for(const core of [true,false]){
  const list=active.filter(a=>a.species===species&&central(a)===core);if(!list.length)continue;
  const mat=material(s.species[species].color);const mesh=new T.InstancedMesh(sphere,mat,list.length),dummy=new T.Object3D();
  list.forEach((a,i)=>{dummy.position.set(...a.position);dummy.scale.setScalar(s.species[species].radius*scale);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);let color=new T.Color(s.species[species].color);if(o.atomsInPlane&&nearPlane(a))color.set('#ffe995');else if(o.shade&&plane&&a.position.reduce((v,x,j)=>v+x*plane.normal[j],plane.constant)<0)color.multiplyScalar(.38);mesh.setColorAt(i,color);});mesh.castShadow=true;mesh.userData.atoms=list;group.add(mesh);
 }
 function line(a,b,color='#b7ebff'){const geo=own(new T.BufferGeometry().setFromPoints([a,b]));const l=new T.Line(geo,own(new T.LineBasicMaterial({color,transparent:true,opacity:.95,depthTest:false})));l.renderOrder=20;group.add(l);return l;}
 function bond(a,b){const delta=b.clone().sub(a),m=new T.Mesh(cylinder,material('#aec9d5'));m.position.copy(a).add(b).multiplyScalar(.5);m.scale.set(.055,delta.length(),.055);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());group.add(m);}
 if(o.mode==='Ball & stick'||mini){for(let i=0;i<active.length;i++)for(let j=i+1;j<active.length;j++){const a=active[i],b=active[j];if(!central(a)&&!central(b))continue;const d=Math.hypot(...a.position.map((v,k)=>v-b.position[k]));if(d<s.bond*1.01&&d>.1)bond(new T.Vector3(...a.position),new T.Vector3(...b.position));}}
 const corners=Array.from({length:8},(_,i)=>new T.Vector3(...cartesian(s,[i&1? .5:-.5,i&2?.5:-.5,i&4?.5:-.5])));
 const edges=[];for(let i=0;i<8;i++)for(const bit of [1,2,4])if(!(i&bit))edges.push([i,i|bit]);
 if(o.cell!==false){for(const [a,b] of edges)line(corners[a],corners[b]);for(const p of corners){const m=new T.Mesh(sphere,material('#d2faff'));m.position.copy(p);m.scale.setScalar(s.a*.022);m.material.depthTest=false;m.renderOrder=21;group.add(m);}
  if(!mini){const a=corners[0].clone().add(new T.Vector3(0,-s.a*.17,0)),b=corners[1].clone().add(new T.Vector3(0,-s.a*.17,0));line(a,b);for(const [from,to] of [[a,b],[b,a]]){const arrow=new T.ArrowHelper(to.clone().sub(from).normalize(),from,s.a*.12,'#d5f5ff',s.a*.07,s.a*.04);group.add(arrow);own(arrow.line.geometry);own(arrow.line.material);own(arrow.cone.geometry);own(arrow.cone.material);}const text=label('a = '+s.a.toFixed(2)+' Å');text.position.copy(a).add(b).multiplyScalar(.5).add(new T.Vector3(0,-s.a*.11,0));text.scale.set(s.a*1.2,s.a*.2,1);group.add(text);own(text.material.map);own(text.material);}
 }
 if(o.poly){const centers=s.species.map((_,i)=>ranked.find(a=>a.species===i&&!removed.has(a.id)));for(const center of centers){if(!center)continue;const neighbors=atoms.filter(a=>a.id!==center.id).map(a=>({a,d:Math.hypot(...a.position.map((v,i)=>v-center.position[i]))})).sort((a,b)=>a.d-b.d);const points=neighbors.filter(n=>n.d<=neighbors[0].d*1.02).map(n=>new T.Vector3(...n.a.position));if(points.length>=4){const geo=own(new ConvexGeometry(points)),mat=material(s.species[center.species].color,.2);mat.side=T.DoubleSide;mat.depthWrite=false;const mesh=new T.Mesh(geo,mat);group.add(mesh);const edges=new T.LineSegments(own(new T.EdgesGeometry(geo)),own(new T.LineBasicMaterial({color:s.species[center.species].color})));group.add(edges);}else if(points.length===3){const geo=own(new T.BufferGeometry().setFromPoints([...points,points[0]]));group.add(new T.Line(geo,own(new T.LineBasicMaterial({color:'#99deff'}))));}}}
 if(o.labels){s.species.forEach((sp,i)=>{const a=ranked.find(a=>a.species===i&&!removed.has(a.id));if(!a)return;const text=label(sp.label);text.position.set(...a.position).add(new T.Vector3(0,sp.radius*scale+.3,0));text.scale.set(s.a*.7,s.a*.11,1);group.add(text);own(text.material);own(text.material.map);});}
 if(vacancyCount){const p=ranked[0];const hole=new T.Mesh(own(new T.IcosahedronGeometry(s.species[p.species].radius*scale,1)),own(new T.MeshBasicMaterial({color:'#ffb663',wireframe:true,transparent:true,opacity:.7})));hole.position.set(...p.position);group.add(hole);}
 if(o.interstitial){const m=new T.Mesh(sphere,material('#ffac5b'));m.position.set(...cartesian(s,[.125,.125,.125]));m.scale.setScalar(s.a*.07);group.add(m);}
 if(o.showPlane&&plane){
  const pl=new T.Plane(new T.Vector3(...plane.normal),plane.constant),points=[];
  for(const [i,j] of edges){const a=corners[i],b=corners[j],da=pl.distanceToPoint(a),db=pl.distanceToPoint(b);if(Math.abs(da)<1e-6)points.push(a.clone());if(da*db<0)points.push(a.clone().lerp(b,da/(da-db)));}
  const unique=points.filter((p,i)=>points.findIndex(q=>p.distanceTo(q)<1e-5)===i);
  if(unique.length>=3){const center=unique.reduce((v,p)=>v.add(p),new T.Vector3()).divideScalar(unique.length),u=unique[0].clone().sub(center).normalize(),v=new T.Vector3().crossVectors(pl.normal,u);unique.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)));const pos=[];for(let i=1;i<unique.length-1;i++)pos.push(...unique[0].toArray(),...unique[i].toArray(),...unique[i+1].toArray());const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.computeVertexNormals();group.add(new T.Mesh(geo,own(new T.MeshPhysicalMaterial({color:'#73a9ff',transparent:true,opacity:.4,side:T.DoubleSide,depthWrite:false}))));}
 }
 return {group,atomCount:active.length,removed:vacancyCount,dispose:()=>resources.forEach(x=>x.dispose?.())};
}

function setup(host,mini){const renderer=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,mini?1:1.5));renderer.setClearColor('#081725',0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.9;renderer.localClippingEnabled=true;host.appendChild(renderer.domElement);const scene=new T.Scene();scene.add(new T.HemisphereLight('#c4e6ff','#05111b',.9));const key=new T.DirectionalLight('#ffffff',2);key.position.set(10,18,12);scene.add(key);const rim=new T.DirectionalLight('#90c5ff',1.2);rim.position.set(-10,3,-6);scene.add(rim);const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.02);scene.environment=env.texture;scene.environmentIntensity=.35;return {renderer,scene,dispose:()=>{env.dispose();room.dispose();pmrem.dispose();renderer.dispose();renderer.forceContextLoss();}};}

export default function CrystalScene({structure,options,mini=false,apiRef}){
 const host=useRef(null),context=useRef(null),latest=useRef(options),[ready,setReady]=useState(false),[error,setError]=useState('');latest.current=options;
 useEffect(()=>{let frame,observer,world;const container=host.current;let state,controls;
  try{state=setup(container,mini);const {scene,renderer}=state,camera=new T.PerspectiveCamera(mini?38:42,1,.1,500);controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.autoRotateSpeed=.3;controls.minDistance=2;controls.maxDistance=90;const resize=()=>{const w=container.clientWidth,h=container.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(h,1);camera.updateProjectionMatrix();};observer=new ResizeObserver(resize);observer.observe(container);resize();
   context.current={...state,camera,controls,setWorld:w=>{if(world){scene.remove(world.group);world.dispose();}world=w;scene.add(w.group);}};
   if(apiRef)apiRef.current={reset:()=>{const a=context.current?.a||structure.a;camera.position.set(a*2.7,a*1.9,a*3.0);controls.target.set(0,0,0);controls.update();},png:()=>renderer.domElement.toDataURL('image/png')};
   const reduced=matchMedia('(prefers-reduced-motion: reduce)');let last=performance.now();
   const draw=now=>{frame=requestAnimationFrame(draw);if(document.hidden)return;const dt=Math.min(.1,(now-last)/1000);last=now;controls.autoRotate=!!latest.current.rotate&&!mini&&!reduced.matches&&latest.current.view!=='2D';controls.update(dt);renderer.render(scene,camera);};frame=requestAnimationFrame(draw);setReady(true);
  }catch(e){setError('WebGL unavailable: '+e.message);}
  return()=>{cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose();world?.dispose();state?.dispose();context.current=null;if(apiRef)apiRef.current=null;container.replaceChildren();};
 },[mini]);
 useEffect(()=>{if(!ready||!context.current)return;const {scene,camera,controls,setWorld}=context.current;const world=crystalWorld(structure,{...options,mini,repeat:mini?1:options.repeat});setWorld(world);host.current.dataset.renderedAtoms=String(world.atomCount);host.current.dataset.vacancies=String(world.removed);scene.fog=mini?null:new T.Fog('#071724',structure.a*3,structure.a*10);
  if(context.current.structureId!==structure.id||context.current.view!==options.view){camera.position.set(...(options.view==='2D'?[0,0,structure.a*3.8]:mini?[structure.a*1.6,structure.a*1.15,structure.a*1.9]:[structure.a*2.7,structure.a*1.9,structure.a*3.0]));controls.target.set(0,0,0);camera.lookAt(controls.target);context.current.structureId=structure.id;context.current.view=options.view;}controls.enableRotate=options.view!=='2D';context.current.a=structure.a;host.current.dataset.ready='true';host.current.dataset.atoms=String(latticeAtoms(structure,mini?1:options.repeat||1).length);host.current.dataset.state=JSON.stringify(options);
 },[ready,structure,JSON.stringify(options),mini]);
 return <div className="crystal-canvas" ref={host} aria-label={mini?'Interactive Miller plane unit cell':'Interactive '+structure.name+' lattice'}>{error&&<p role="alert">{error}</p>}</div>;
}

export function makeThumbnails(structures){const host=document.createElement('div'),state=setup(host,true),result={};state.renderer.setSize(160,130,false);const camera=new T.PerspectiveCamera(38,160/130,.1,100);for(const s of structures){const world=crystalWorld(s,{mini:true,repeat:1,cell:true,mode:'Ball & stick'});state.scene.add(world.group);camera.position.set(s.a*1.6,s.a*1.15,s.a*1.9);camera.lookAt(0,0,0);state.renderer.render(state.scene,camera);result[s.id]=state.renderer.domElement.toDataURL('image/png');state.scene.remove(world.group);world.dispose();}state.dispose();return result;}
