import {Vector3} from 'three';

// Camera state is separate from the intrinsic molecular coordinates.
export function pblockCameraPose(camera,controls,fitDistance){
 return {position:camera.position.toArray(),target:controls.target.toArray(),zoom:camera.zoom,fitDistance};
}

export function fitPblockCamera(camera,controls,extent,pose){
 const half=Math.min(camera.fov*Math.PI/360,Math.atan(Math.tan(camera.fov*Math.PI/360)*camera.aspect));
 const distance=extent/Math.sin(half*.9);
 controls.target.set(0,0,0);camera.position.set(0,0,distance);camera.zoom=1;
 camera.updateProjectionMatrix();controls.update();controls.saveState();
 if(pose?.fitDistance>0){
  const ratio=distance/pose.fitDistance;
  controls.target.fromArray(pose.target).multiplyScalar(ratio);
  camera.position.fromArray(pose.position).multiplyScalar(ratio);
  const offset=camera.position.clone().sub(controls.target);
  const length=Math.max(controls.minDistance,Math.min(controls.maxDistance,offset.length()));
  if(offset.length()>0)camera.position.copy(controls.target).add(offset.setLength(length));
  else camera.position.copy(controls.target).add(new Vector3(0,0,length));
  camera.zoom=pose.zoom;camera.updateProjectionMatrix();controls.update();
 }
 return distance;
}
