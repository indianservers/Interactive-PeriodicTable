import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {bindSceneExport} from './advancedVisualExport.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {surfaceEnergy,surfaceGradient} from './advancedSurfaceModel.js';
import './advancedChartExperiment.css';

function SurfaceScene({barrier,confinement,x,y,wire,resetToken,onProbe}){
  const host=useRef(null),live=useRef(null),callback=useRef(onProbe);callback.current=onProbe;
  useEffect(()=>{
    const el=host.current,renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Potential energy surface: drag to rotate, scroll to zoom, click to probe energy; arrow keys rotate.');el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(40,1,.05,100);camera.position.set(4.8,4,5);camera.lookAt(0,.6,0);const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,.6,0);controls.minDistance=3;controls.maxDistance=20;controls.saveState();
    scene.add(new THREE.HemisphereLight(0xffffff,0x173048,2));const lamp=new THREE.DirectionalLight(0xffffff,2);lamp.position.set(2,6,4);scene.add(lamp);
    const root=new THREE.Group();scene.add(root);const geometry=new THREE.PlaneGeometry(2.8,2.4,72,72);geometry.rotateX(-Math.PI/2);geometry.setAttribute('color',new THREE.BufferAttribute(new Float32Array(geometry.attributes.position.count*3),3));
    const mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.65,metalness:0,side:THREE.DoubleSide}));root.add(mesh);
    const probe=new THREE.Mesh(new THREE.SphereGeometry(.055,24,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x777777}));root.add(probe);
    const grid=new THREE.GridHelper(3.2,16,0x6d91b5,0x203b56);grid.position.y=-.025;root.add(grid);
    const line=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xffffff}));root.add(line);
    const draw=()=>renderer.render(scene,camera);controls.addEventListener('change',draw);
    const unbindExport=bindSceneExport(renderer.domElement,draw,'chemistry-surface.png');
    const resize=new ResizeObserver(()=>{const r=el.getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/Math.max(1,r.height);camera.updateProjectionMatrix();draw();});resize.observe(el);
    const ray=new THREE.Raycaster();let downAt;
    const down=e=>{downAt=[e.clientX,e.clientY];};const up=e=>{if(!downAt||Math.hypot(e.clientX-downAt[0],e.clientY-downAt[1])>5)return;const r=renderer.domElement.getBoundingClientRect();ray.setFromCamera(new THREE.Vector2(2*(e.clientX-r.left)/r.width-1,1-2*(e.clientY-r.top)/r.height),camera);const hit=ray.intersectObject(mesh)[0];if(hit){const p=root.worldToLocal(hit.point.clone());callback.current([Math.max(-1.4,Math.min(1.4,p.x)),Math.max(-1.2,Math.min(1.2,p.z))]);}};
    const key=e=>{if(e.key.startsWith('Arrow')){e.preventDefault();root.rotation.y+=(e.key==='ArrowLeft'||e.key==='ArrowUp'?1:-1)*.12;draw();}};
    renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('keydown',key);
    live.current={mesh,probe,line,root,controls,draw};
    return()=>{unbindExport();resize.disconnect();controls.dispose();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('keydown',key);root.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose();});renderer.dispose();el.replaceChildren();live.current=null;};
  },[]);
  useEffect(()=>{const s=live.current;if(!s)return;const pos=s.mesh.geometry.attributes.position,col=s.mesh.geometry.attributes.color,color=new THREE.Color();for(let i=0;i<pos.count;i++){const e=surfaceEnergy(pos.getX(i),pos.getZ(i),barrier,confinement);pos.setY(i,e*.025);color.setHSL((1-Math.min(1,e/130))*.67,.85,.53);col.setXYZ(i,color.r,color.g,color.b);}pos.needsUpdate=col.needsUpdate=true;s.mesh.geometry.computeVertexNormals();s.mesh.geometry.computeBoundingSphere();s.mesh.material.wireframe=wire;const points=Array.from({length:81},(_,i)=>{const q=-1+i/40;return new THREE.Vector3(q,surfaceEnergy(q,0,barrier,confinement)*.025+.015,0);});s.line.geometry.dispose();s.line.geometry=new THREE.BufferGeometry().setFromPoints(points);s.draw();},[barrier,confinement,wire]);
  useEffect(()=>{const s=live.current;if(s){s.probe.position.set(x,surfaceEnergy(x,y,barrier,confinement)*.025+.065,y);s.draw();}},[x,y,barrier,confinement]);
  useEffect(()=>{const s=live.current;if(s){s.root.rotation.set(0,0,0);s.controls.reset();s.draw();}},[resetToken]);
  return <div className="avc-lattice-canvas" ref={host}/>;
}
export default function AdvancedSurfaceExperiment(){
  const [barrier,setBarrier]=useState(40),[confinement,setConfinement]=useState(25),[x,setX]=useState(-1),[y,setY]=useState(0),[wire,setWire]=useState(false),[resetToken,setResetToken]=useState(0);
  const energy=surfaceEnergy(x,y,barrier,confinement),gradient=surfaceGradient(x,y,barrier,confinement);
  function reset(){setBarrier(40);setConfinement(25);setX(-1);setY(0);setWire(false);setResetToken(t=>t+1);}
  function range(label,value,set,min,max,step){return <label>{label}<output>{value.toFixed(2)}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)}/></label>;}
  return <section className="avc-chart-experiment" aria-label="Potential energy surface"><header><div><h2>Potential energy surface</h2><p>Two-coordinate model · E(x,y) = A(x²−1)² + Ky² · click the surface to place the energy probe.</p></div><button onClick={reset}>↻ Reset surface</button></header><div className="avc-chart-workspace"><article><SurfaceScene {...{barrier,confinement,x,y,wire,resetToken}} onProbe={([u,v])=>{setX(u);setY(v);}}/><div className="avc-surface-legend"><span>0 kJ mol⁻¹</span><i/><span>130 kJ mol⁻¹</span></div><div className="avc-chart-readouts"><output>E = {energy.toFixed(2)} kJ mol⁻¹</output><output>∇E = ({gradient.map(v=>v.toFixed(2)).join(', ')})</output><output>Saddle energy: {barrier} kJ mol⁻¹</output></div></article><aside><h3>Surface controls</h3>{range('Barrier A (kJ/mol)',barrier,setBarrier,10,80,1)}{range('Transverse stiffness K',confinement,setConfinement,5,40,1)}{range('Probe coordinate x',x,setX,-1.4,1.4,.01)}{range('Probe coordinate y',y,setY,-1.2,1.2,.01)}<button aria-pressed={wire} onClick={()=>setWire(v=>!v)}>{wire?'Show shaded surface':'Show wireframe'}</button><button onClick={()=>{setX(0);setY(0);}}>Inspect saddle (0, 0)</button></aside></div><footer><h3>Minima and transition state</h3><p>The minima at (−1,0) and (+1,0) have E=0. The saddle at (0,0) has E=A: energy decreases along x toward either minimum but rises along y. The white curve is the minimum-energy path y=0. Coordinates are dimensionless reaction coordinates; this analytic teaching surface is not a calculated potential for a particular molecule. Gradient units are kJ mol⁻¹ per coordinate unit; height scale is fixed at 0.025 scene units per kJ mol⁻¹.</p></footer></section>;
}
