import assert from 'node:assert/strict';
import {PerspectiveCamera,Vector3} from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {fitPblockCamera,pblockCameraPose} from '../src/modules/core-simulations/pblockCamera.js';
let checks=0;
const close=(a,b,tol=1e-9)=>{assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);checks++;};
for(const aspect of [.35,.75,1,2.5])for(const extent of [1,3,7]){
 const camera=new PerspectiveCamera(34,aspect,.1,150),controls=new OrbitControls(camera);
 controls.minDistance=2;controls.maxDistance=100;
 const fit=fitPblockCamera(camera,controls,extent);
 // The enclosing sphere lies within both horizontal and vertical field of view.
 assert.ok(Math.asin(extent/fit)<Math.min(camera.fov*Math.PI/360,Math.atan(Math.tan(camera.fov*Math.PI/360)*aspect)));checks++;
 const originRay=new Vector3(0,0,0).project(camera);close(originRay.x,0);close(originRay.y,0);
 controls.target.set(.2,-.3,.1);camera.position.set(4,3,5).normalize().multiplyScalar(fit*.8).add(controls.target);controls.update();
 const before=pblockCameraPose(camera,controls,fit),direction=camera.position.clone().sub(controls.target).normalize();
 const next=fitPblockCamera(camera,controls,extent*1.1,before);
 close(camera.position.clone().sub(controls.target).normalize().dot(direction),1);
 close(camera.position.distanceTo(controls.target)/next,.8);
 before.target.forEach((x,i)=>close(controls.target.getComponent(i)/next,x/fit));
 controls.reset();close(camera.position.x,0);close(camera.position.y,0);close(camera.position.z,next);close(controls.target.length(),0);
 // No DOM element was connected, so there are no native listeners to dispose.
}
console.log(`PASS: ${checks} camera sphere-fit, orientation/zoom/pan preservation and fitted-reset checks across twelve viewport/extent cases.`);
