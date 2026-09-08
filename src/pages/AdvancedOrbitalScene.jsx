import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { MarchingCubes } from 'three/examples/jsm/objects/MarchingCubes.js';
import { etheneAtoms, orbitalAmplitude } from './advancedOrbitalModel.js';
import {createOrientationAxes, orbitalSurfaceMaterial} from './advancedOrbitalRendering.js';

const AdvancedOrbitalScene = forwardRef(function AdvancedOrbitalScene(props, ref) {
  const host = useRef(null), live = useRef(null), latest = useRef(props);
  latest.current = props;
  useImperativeHandle(ref, () => ({
    rotate() { const s = live.current; if (s) { s.root.rotation.y += Math.PI / 6; s.draw(); } },
    zoom() { const s = live.current; if (s) { s.camera.position.multiplyScalar(.85); s.draw(); } },
    reset() { const s = live.current; if (s) { s.root.rotation.set(0,0,0); s.controls.reset(); s.draw(); } },
    exportImage() { const s = live.current; if (s) { s.draw(); const a=document.createElement('a'); a.download='ethene-orbital.png'; a.href=s.renderer.domElement.toDataURL('image/png'); a.click(); } },
  }), []);

  useEffect(() => {
    const node = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .85;
    renderer.localClippingEnabled = true;
    renderer.domElement.setAttribute('aria-label','Interactive ethene molecular orbital. Drag to rotate; scroll to zoom; arrow keys to rotate.');
    renderer.domElement.tabIndex = 0;
    node.appendChild(renderer.domElement);
    const scene = new THREE.Scene(), root = new THREE.Group(); scene.add(root);
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 50);
    camera.up.set(0,0,1); camera.position.set(.2,-7,2.8); camera.lookAt(0,0,0);
    const controls = new OrbitControls(camera,renderer.domElement);
    controls.enableDamping = false; controls.minDistance = 3; controls.maxDistance = 18; controls.saveState();
    scene.add(new THREE.HemisphereLight(0xd9ecff,0x091528,1.2));
    for(const [x,y,z,intensity] of [[-3,-4,6,3],[3,1,4,2],[0,-5,-3,1.3]]) {
      const light=new THREE.DirectionalLight(0xffffff,intensity); light.position.set(x,y,z); scene.add(light);
    }
    const molecule = new THREE.Group(); root.add(molecule);
    const carbon = new THREE.MeshPhysicalMaterial({color:0x30353e, roughness:.35, metalness:.05,clearcoat:.3});
    const hydrogen = new THREE.MeshPhysicalMaterial({color:0xeaf1fa, roughness:.24, metalness:.05});
    const bondMaterial = new THREE.MeshStandardMaterial({color:0xacb8d0,metalness:.5,roughness:.27});
    for(const [symbol,x,y,z] of etheneAtoms) {
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(symbol==='C'?.34:.23,32,24),symbol==='C'?carbon:hydrogen);
      mesh.position.set(x,y,z); molecule.add(mesh);
    }
    function bond(a,b,r=.05) {
      const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),diff=end.clone().sub(start);
      const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,diff.length(),20),bondMaterial);
      mesh.position.copy(start.add(end).multiplyScalar(.5)); mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize()); molecule.add(mesh);
    }
    for(const y of [-.055,.055]) bond([-.67,y,0],[.67,y,0],.035);
    for(const [i,j] of [[0,2],[0,3],[1,4],[1,5]]) bond(etheneAtoms[i].slice(1),etheneAtoms[j].slice(1));
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(5.4,2.7),new THREE.MeshBasicMaterial({color:0x79a8ed,transparent:true,opacity:.19,side:THREE.DoubleSide,depthWrite:false}));
    root.add(plane);
    const outline=new THREE.LineSegments(new THREE.EdgesGeometry(plane.geometry),new THREE.LineBasicMaterial({color:0xa3c5f5,transparent:true,opacity:.75})); root.add(outline);
    const surfaces=new THREE.Group(); root.add(surfaces);
    const orientationAxes = createOrientationAxes();
    let frame=0,last=0;
    function draw() { renderer.render(scene,camera); orientationAxes.draw(renderer,camera,controls,root); }
    function tick(now) {
      frame=0;
      if(!latest.current.playing || document.hidden) return;
      const dt=Math.min((now-last)/1000,.05); last=now;
      root.rotation.z += dt*.22*latest.current.speed; draw();
      frame=requestAnimationFrame(tick);
    }
    function syncPlayback() {
      cancelAnimationFrame(frame); frame=0;
      if(latest.current.playing && !document.hidden) {last=performance.now();frame=requestAnimationFrame(tick);}
    }
    document.addEventListener('visibilitychange',syncPlayback);
    const resize=new ResizeObserver(()=>{const {width,height}=node.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/Math.max(1,height);camera.updateProjectionMatrix();draw();}); resize.observe(node);
    controls.addEventListener('change',draw);
    const keyboard=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();root.rotation[e.key==='ArrowLeft'||e.key==='ArrowRight'?'z':'x']+=(e.key==='ArrowLeft'||e.key==='ArrowUp'?1:-1)*.12;draw();}};
    renderer.domElement.addEventListener('keydown',keyboard);
    live.current={renderer,camera,controls,root,molecule,plane,outline,surfaces,draw,syncPlayback};
    syncPlayback();
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',syncPlayback);resize.disconnect();controls.dispose();orientationAxes.dispose();renderer.domElement.removeEventListener('keydown',keyboard);const materials=new Set();scene.traverse(o=>{o.geometry?.dispose();if(o.material)materials.add(o.material);});materials.forEach(m=>m.dispose());renderer.dispose();node.replaceChildren();live.current=null;};
  }, []);

  useEffect(()=>{live.current?.syncPlayback();},[props.playing]);

  useEffect(()=>{
    const s=live.current;if(!s)return;
    const {orbital,iso,nodal,atoms,surface,density,preset,clipping,tab}=props;
    s.renderer.setClearColor(preset==='Publication'?0xf4f7fb:0x071726,preset==='Publication'?1:0);
    s.renderer.toneMappingExposure=preset==='Publication'?1:.85;
    s.molecule.visible=atoms;s.plane.visible=s.outline.visible=nodal&&!orbital.startsWith('σ');
    while(s.surfaces.children.length){const o=s.surfaces.children[0];s.surfaces.remove(o);o.geometry.dispose();o.material.dispose();}
    const resolution=preset==='High detail'?64:44, extent=3.4;
    const onlyDensity=tab==='Electron density (|ψ|²)',compare=density||tab==='Both';
    const phases=onlyDensity?[0]:compare?[1,-1,0]:[1,-1];
    if(surface) for(const sign of phases){
      const material=orbitalSurfaceMaterial(sign===1?0xef4768:sign===-1?0x3845f8:0x35dbcf,sign===0&&!onlyDensity?.22:preset==='Transparent'?.38:.8);
      material.clippingPlanes=clipping==='None'?[]:[new THREE.Plane(clipping==='XY'?new THREE.Vector3(0,0,-1):new THREE.Vector3(0,-1,0),0)];
      const mesh=new MarchingCubes(resolution,material,false,false,50000);mesh.isolation=sign===0?iso*iso:iso;
      for(let k=0;k<resolution;k++)for(let j=0;j<resolution;j++)for(let i=0;i<resolution;i++){
        const amplitude=orbitalAmplitude((i/resolution*2-1)*extent,(j/resolution*2-1)*extent,(k/resolution*2-1)*extent,orbital);
        mesh.field[i+j*resolution+k*resolution*resolution]=sign===0?amplitude*amplitude:sign*amplitude;
      }
      mesh.scale.setScalar(extent);mesh.update();s.surfaces.add(mesh);
    }
    s.draw();
  },[props.orbital,props.iso,props.nodal,props.atoms,props.surface,props.density,props.preset,props.clipping,props.tab]);
  return <div className="avc-webgl" ref={host}/>;
});
export default AdvancedOrbitalScene;
