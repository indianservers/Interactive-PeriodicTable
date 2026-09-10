import { useEffect, useRef } from "react";
import * as THREE from "three";

const glass = () => new THREE.MeshPhysicalMaterial({ color: 0xbcecff, transparent: true, opacity: .28, roughness: .08, transmission: .58, thickness: .3, side: THREE.DoubleSide });
const metal = new THREE.MeshStandardMaterial({ color: 0x748a99, metalness: .82, roughness: .28 });
const liquidMaterial = new THREE.MeshPhysicalMaterial({ color: 0x34d5ef, transparent: true, opacity: .58, roughness: .12 });
const addMesh = (scene, geometry, material, position, rotation = [0,0,0]) => { const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...position); mesh.rotation.set(...rotation); mesh.castShadow = true; mesh.receiveShadow = true; scene.add(mesh); return mesh; };

export default function SynthesisApparatus({ stage, running, rpm, temperature, conversion, reducedMotion }) {
  const host = useRef(null); const state = useRef({}); const motionState = useRef({ running, rpm, reducedMotion });
  useEffect(() => { motionState.current = { running, rpm, reducedMotion }; }, [running, rpm, reducedMotion]);
  useEffect(() => {
    const el = host.current; if (!el) return;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x061522); scene.fog = new THREE.Fog(0x061522, 11, 25);
    const camera = new THREE.PerspectiveCamera(34, 1, .1, 100); camera.position.set(0, 2.2, 14); camera.lookAt(0, 1.7, 0);
    const renderer = new THREE.WebGLRenderer({ antialias: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6)); renderer.shadowMap.enabled = true; el.appendChild(renderer.domElement);
    scene.add(new THREE.HemisphereLight(0xbcefff, 0x07111a, 2.1)); const key = new THREE.DirectionalLight(0xffffff, 3); key.position.set(-5,8,7); key.castShadow=true; scene.add(key); const cyan = new THREE.PointLight(0x28d9ff, 18, 10); cyan.position.set(4,2,3); scene.add(cyan);
    addMesh(scene,new THREE.BoxGeometry(15,.25,7),new THREE.MeshStandardMaterial({color:0x132b38,metalness:.78,roughness:.24}),[0,-2,0]);
    const stand=addMesh(scene,new THREE.CylinderGeometry(.08,.08,7,18),metal,[-4,1,0]); addMesh(scene,new THREE.BoxGeometry(3.3,.14,.45),metal,[-2.4,2.8,0]); addMesh(scene,new THREE.BoxGeometry(3,.18,2),metal,[4,-1.25,0]);
    const reactionGroup=new THREE.Group(); scene.add(reactionGroup);
    const flask=addMesh(reactionGroup,new THREE.SphereGeometry(1.5,48,32),glass(),[0,-.25,0]); flask.scale.y=.9;
    [-.72,0,.72].forEach((x,i)=>addMesh(reactionGroup,new THREE.CylinderGeometry(.24,.34,1.7,24,1,true),glass(),[x,1.35,0],[0,0,(i-1)*-.36]));
    addMesh(reactionGroup,new THREE.TorusGeometry(1.62,.34,18,48,Math.PI),new THREE.MeshStandardMaterial({color:0x313b44,metalness:.55,roughness:.45}),[0,-.38,0],[Math.PI,0,0]);
    const fluid=addMesh(reactionGroup,new THREE.SphereGeometry(1.37,48,20,0,Math.PI*2,Math.PI/2,Math.PI/2),liquidMaterial,[0,-.32,0]); fluid.scale.y=.72;
    const stir=addMesh(reactionGroup,new THREE.CapsuleGeometry(.1,.7,6,12),new THREE.MeshStandardMaterial({color:0xf0f5f8}),[0,-1.18,0],[0,0,Math.PI/2]);
    const condenser=addMesh(reactionGroup,new THREE.CylinderGeometry(.42,.42,4.4,32,1,true),glass(),[0,4.15,0]); addMesh(reactionGroup,new THREE.CylinderGeometry(.14,.14,4.2,18),new THREE.MeshPhysicalMaterial({color:0x65d9ff,transparent:true,opacity:.5}),[0,4.15,0]);
    addMesh(reactionGroup,new THREE.TorusGeometry(.53,.055,10,26),new THREE.MeshStandardMaterial({color:0x22bfe6}),[0,3.1,0],[Math.PI/2,0,0]); addMesh(reactionGroup,new THREE.TorusGeometry(.53,.055,10,26),new THREE.MeshStandardMaterial({color:0x22bfe6}),[0,5.15,0],[Math.PI/2,0,0]);
    const funnel=addMesh(reactionGroup,new THREE.ConeGeometry(.58,1.3,32,1,true),glass(),[2.3,2.9,0],[0,0,-.4]); addMesh(reactionGroup,new THREE.CylinderGeometry(.1,.12,2.1,18),glass(),[1.72,1.45,0],[0,0,-.4]);
    const probe=addMesh(reactionGroup,new THREE.CylinderGeometry(.045,.045,3.8,12),new THREE.MeshStandardMaterial({color:0xd2dce2,metalness:.7}),[-1.14,1.05,.1],[0,0,.36]);
    const clamp=addMesh(scene,new THREE.BoxGeometry(2.6,.12,.18),metal,[-2.75,.3,0]);
    const ice=addMesh(scene,new THREE.CylinderGeometry(2.1,1.9,1.5,40,1,true),new THREE.MeshPhysicalMaterial({color:0x6adfff,transparent:true,opacity:.25,transmission:.4}),[0,-.85,0]); ice.visible=false;
    const filtration=new THREE.Group(); scene.add(filtration); filtration.visible=false;
    const filterFlask=addMesh(filtration,new THREE.CylinderGeometry(.75,1.25,2.2,36),glass(),[0,-.45,0]); const buchner=addMesh(filtration,new THREE.CylinderGeometry(1.15,.42,1.3,36),new THREE.MeshStandardMaterial({color:0xe8f1f3,roughness:.2}),[0,1.25,0]); addMesh(filtration,new THREE.CylinderGeometry(.08,.08,2.3,14),metal,[2.6,-.6,0],[0,0,Math.PI/2]); addMesh(filtration,new THREE.BoxGeometry(1.8,1.1,1.2),new THREE.MeshStandardMaterial({color:0x263a46,metalness:.5}),[4,-.6,0]);
    const drying=new THREE.Group();scene.add(drying);drying.visible=false; addMesh(drying,new THREE.BoxGeometry(5,3.7,3),new THREE.MeshPhysicalMaterial({color:0x253844,transparent:true,opacity:.7}),[0,.1,0]); addMesh(drying,new THREE.BoxGeometry(3.8,.12,2.2),metal,[0,-.55,0]); const powder=addMesh(drying,new THREE.CylinderGeometry(1.2,1.2,.12,36),new THREE.MeshStandardMaterial({color:0xf3f1e4,roughness:.9}),[0,-.42,0]);
    state.current={renderer,scene,camera,fluid,stir,reactionGroup,ice,filtration,drying,powder};
    const resize=()=>{const w=el.clientWidth,h=el.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}; resize(); const observer=new ResizeObserver(resize);observer.observe(el);
    let frame; const animate=(time)=>{frame=requestAnimationFrame(animate); const motion=motionState.current; if(motion.running&&!motion.reducedMotion){stir.rotation.y=time*.002*Math.max(1,motion.rpm/100); fluid.rotation.y=Math.sin(time*.003)*.04;} renderer.render(scene,camera)};animate(0);
    return()=>{cancelAnimationFrame(frame);observer.disconnect();renderer.dispose();scene.traverse(o=>{o.geometry?.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material?.dispose()});renderer.domElement.remove()};
  },[]);
  useEffect(()=>{const s=state.current;if(!s.renderer)return;s.reactionGroup.visible=stage<6;s.ice.visible=stage>=4&&stage<6;s.filtration.visible=stage===6;s.drying.visible=stage>=7;s.fluid.material.color.set(stage<2?0x617b87:temperature>70?0xf5b54b:0x37d9ed);s.fluid.scale.y=.42+Math.min(1,conversion/100)*.32;s.powder.scale.y=.3+conversion/140},[stage,temperature,conversion]);
  return <div className="plab-three-apparatus" ref={host} role="img" aria-label="Interactive three-neck reaction flask with heating mantle, condenser, dropping funnel, probe, ice bath, Büchner filtration, and drying equipment"/>;
}
