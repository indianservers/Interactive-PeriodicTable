import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {bindSceneExport} from './advancedVisualExport.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import './advancedChartExperiment.css';
import {reciprocalVector} from './advancedLatticeModel.js';

function LatticeScene({a,h,k,l,zone,onSelect,resetToken}) {
  const host=useRef(null),live=useRef(null),callback=useRef(onSelect);callback.current=onSelect;
  useEffect(()=>{
    const el=host.current,renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Reciprocal lattice. Drag to rotate, scroll to zoom, click a point to select Miller indices. Arrow keys rotate.');el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.1,100);camera.position.set(11,8,13);camera.lookAt(0,0,0);
    const controls=new OrbitControls(camera,renderer.domElement);controls.minDistance=5;controls.maxDistance=45;controls.saveState();
    scene.add(new THREE.HemisphereLight(0xf0f8ff,0x183344,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-4,8,6);scene.add(light);
    const root=new THREE.Group();scene.add(root);const indices=[];for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)for(let n=-2;n<=2;n++)indices.push([i,j,n]);
    const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,16,12),new THREE.MeshStandardMaterial({color:0xd6b978,roughness:.3,metalness:.25}),indices.length);root.add(dots);
    const cube=new THREE.BoxGeometry(1,1,1),boundary=new THREE.LineSegments(new THREE.EdgesGeometry(cube),new THREE.LineBasicMaterial({color:0x62d9fc}));cube.dispose();root.add(boundary);
    const shell=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial({color:0x309df2,transparent:true,opacity:.1,depthWrite:false}));root.add(shell);
    const arrow=new THREE.ArrowHelper(new THREE.Vector3(1,0,0),new THREE.Vector3(),1,0x58f1b0,.3,.15);root.add(arrow);
    const selected=new THREE.Mesh(new THREE.SphereGeometry(.14,20,16),new THREE.MeshStandardMaterial({color:0x60ffd3,emissive:0x12634b}));root.add(selected);
    const axes=new THREE.AxesHelper(5);root.add(axes);
    const draw=()=>renderer.render(scene,camera);controls.addEventListener('change',draw);
    const unbindExport=bindSceneExport(renderer.domElement,draw,'chemistry-lattice.png');
    const resize=new ResizeObserver(()=>{const r=el.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();draw();});resize.observe(el);
    const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let start;
    const down=e=>{start=[e.clientX,e.clientY];};
    const up=e=>{if(!start||Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)return;const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hit=ray.intersectObject(dots)[0];if(hit&&hit.instanceId!==undefined)callback.current(indices[hit.instanceId]);};
    const key=e=>{if(e.key.startsWith('Arrow')){e.preventDefault();root.rotation[e.key==='ArrowLeft'||e.key==='ArrowRight'?'y':'x']+=(e.key==='ArrowLeft'||e.key==='ArrowUp'?1:-1)*.1;draw();}};
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('keydown',key);
    live.current={dots,indices,boundary,shell,arrow,selected,draw,controls,root};draw();
    return()=>{unbindExport();resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('keydown',key);root.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});dots.dispose();renderer.dispose();el.replaceChildren();live.current=null;};
  },[]);
  useEffect(()=>{const s=live.current;if(!s)return;const v=reciprocalVector(a,h,k,l),m=new THREE.Matrix4();s.indices.forEach((p,i)=>{m.makeTranslation(...p.map(x=>x*v.spacing));s.dots.setMatrixAt(i,m);});s.dots.instanceMatrix.needsUpdate=true;s.dots.computeBoundingSphere();s.boundary.scale.setScalar(v.spacing);s.shell.scale.setScalar(v.spacing);s.boundary.visible=s.shell.visible=zone;s.selected.position.set(...v.components);s.arrow.visible=v.magnitude>0;if(v.magnitude){s.arrow.setDirection(new THREE.Vector3(...v.components).normalize());s.arrow.setLength(v.magnitude,.3,.15);}s.draw();},[a,h,k,l,zone]);
  useEffect(()=>{const s=live.current;if(s){s.root.rotation.set(0,0,0);s.controls.reset();s.draw();}},[resetToken]);
  return <div className="avc-lattice-canvas" ref={host}/>;
}
export default function AdvancedLatticeExperiment(){
  const [a,setA]=useState(4),[h,setH]=useState(1),[k,setK]=useState(1),[l,setL]=useState(0),[zone,setZone]=useState(true),[resetToken,setResetToken]=useState(0);
  const v=reciprocalVector(a,h,k,l);function reset(){setA(4);setH(1);setK(1);setL(0);setZone(true);setResetToken(x=>x+1);}
  return <section className="avc-chart-experiment" aria-label="Crystal reciprocal lattice"><header><div><h2>Crystal reciprocal lattice</h2><p>Simple cubic lattice · physics convention b = 2π/a · click a reciprocal point to inspect (h k l).</p></div><button onClick={reset}>↻ Reset lattice</button></header><div className="avc-chart-workspace"><article><LatticeScene {...{a,h,k,l,zone,resetToken}} onSelect={([x,y,z])=>{setH(x);setK(y);setL(z);}}/><div className="avc-chart-readouts"><output>b = {v.spacing.toFixed(3)} Å⁻¹</output><output>G = ({h} {k} {l})</output><output>|G| = {v.magnitude.toFixed(3)} Å⁻¹</output><output>dₕₖₗ = {v.magnitude?(2*Math.PI/v.magnitude).toFixed(3)+' Å':'undefined at origin'}</output></div></article><aside><h3>Lattice controls</h3><label>Direct lattice constant a<output>{a.toFixed(1)} Å</output><input aria-label="Direct lattice constant" type="range" min="2" max="8" step=".1" value={a} onChange={e=>setA(+e.target.value)}/></label>{[['h',h,setH],['k',k,setK],['l',l,setL]].map(([n,value,set])=><label key={n}>Miller index {n}<output>{value}</output><input aria-label={`Miller index ${n}`} type="range" min="-2" max="2" step="1" value={value} onChange={e=>set(+e.target.value)}/></label>)}<button aria-pressed={zone} onClick={()=>setZone(z=>!z)}>{zone?'Hide':'Show'} first Brillouin zone</button><p>Cyan cube: first Brillouin zone. Green arrow: selected reciprocal vector. Axes: red x*, green y*, blue z*.</p></aside></div><footer><h3>Direct and reciprocal distances</h3><p>Increasing the real-space lattice constant contracts reciprocal-space spacing. For a simple cubic lattice, G = (2π/a)(h, k, l) and dₕₖₗ = a/√(h²+k²+l²). The first Brillouin zone spans −π/a to +π/a on each reciprocal axis. This scene shows reciprocal points, not physical atoms or chemical bonds.</p></footer></section>;
}
