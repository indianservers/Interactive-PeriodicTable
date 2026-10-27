import {Box3,Vector3} from 'three';

// Fit each object's bounds independently so disjoint tall/low instruments do not
// create unnecessarily distant framing. Include labels and parked receivers.
export function fitApparatusCamera(scene,camera,controls,direction=new Vector3(3.5,1.8,6.5),margin=.88){
 scene.updateMatrixWorld(true);
 const boxes=[];scene.traverse(o=>{if(o.isMesh||o.isSprite){const b=new Box3().setFromObject(o);if(!b.isEmpty())boxes.push(b);}});
 if(!boxes.length)return;
 const total=boxes.reduce((a,b)=>a.union(b),new Box3()),center=total.getCenter(new Vector3()),z=direction.clone().normalize(),x=new Vector3().crossVectors(camera.up,z).normalize(),y=new Vector3().crossVectors(z,x).normalize();
 const tan=Math.tan(camera.fov*Math.PI/360);let distance=camera.near*2;
 for(const b of boxes)for(const a of [b.min.x,b.max.x])for(const c of [b.min.y,b.max.y])for(const d of [b.min.z,b.max.z]){
  const p=new Vector3(a,c,d).sub(center),depth=p.dot(z);
  distance=Math.max(distance,depth+Math.abs(p.dot(x))/(tan*camera.aspect*margin),depth+Math.abs(p.dot(y))/(tan*margin));
 }
 controls.target.copy(center);camera.position.copy(center).addScaledVector(z,distance);camera.lookAt(center);camera.updateProjectionMatrix();camera.updateMatrixWorld();controls.update();controls.saveState();
}
