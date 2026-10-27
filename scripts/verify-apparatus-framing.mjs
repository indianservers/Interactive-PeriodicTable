import assert from 'node:assert/strict';
import {Scene,PerspectiveCamera,Vector3,Mesh,BoxGeometry,MeshBasicMaterial,Box3} from 'three';
import {fitApparatusCamera} from '../src/modules/core-simulations/fitApparatusCamera.js';
const scene=new Scene();
// Tall condenser, low broad bench and two separated receivers exercise the
// disjoint-object geometry that a single center-distance guess clipped.
for(const [size,pos] of [[[7.5,.12,3.2],[0,.1,0]],[[.4,3.5,.4],[-2,2,0]],[[1,2.5,1],[.8,2,0]],[[1,.8,1],[2.5,.6,.8]]]){const m=new Mesh(new BoxGeometry(...size),new MeshBasicMaterial());m.position.set(...pos);scene.add(m);}
let checks=0;
for(const [w,h] of [[816,368],[340,310],[450,350],[1600,1000],[280,310]]){
 const camera=new PerspectiveCamera(37,w/h,.1,50),controls={target:new Vector3(),update(){},saveState(){}};
 fitApparatusCamera(scene,camera,controls);
 scene.traverse(o=>{if(!o.isMesh)return;const b=new Box3().setFromObject(o);for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const p=new Vector3(x,y,z).project(camera);assert.ok(Math.abs(p.x)<=.880001&&Math.abs(p.y)<=.880001&&p.z<1&&p.z> -1);checks++;}});
}
scene.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
console.log(`PASS: ${checks} apparatus-corner projections within viewport margin across desktop/mobile/tablet/fullscreen sizes. Actual rendered labels and UI still require browser review.`);
