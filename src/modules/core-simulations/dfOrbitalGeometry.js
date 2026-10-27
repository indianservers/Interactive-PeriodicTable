import {BufferGeometry,Float32BufferAttribute,MeshBasicMaterial} from 'three';
import {MarchingCubes} from 'three/examples/jsm/objects/MarchingCubes.js';
import {dfPsi} from './dfBlockModel.js';
// Dimensionless hydrogenic basis: r=Zeff R/(n a0). Surface colours encode sign.
// These are original mathematical meshes, not electron paths or complex density.
export function dfOrbitalGeometry(family,orbital,principal,iso=.18,resolution=56){
 if(!Number.isFinite(iso)||iso<.05||iso>.45||!Number.isInteger(resolution)||resolution<24||resolution>96)throw Error('Invalid orbital surface sampling.');
 const extent=principal===5?16:principal===4?12:10,n=resolution,field=new Float32Array(n**3);let maximum=0;
 for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const value=dfPsi(family,orbital,(2*x/n-1)*extent,(2*y/n-1)*extent,(2*z/n-1)*extent,principal);field[x+n*y+n*n*z]=value;maximum=Math.max(maximum,Math.abs(value));}
 const dummy=new MeshBasicMaterial(),mc=new MarchingCubes(n,dummy,false,false,80000),surfaces=[];
 try{for(const sign of [1,-1]){for(let i=0;i<field.length;i++)mc.field[i]=sign*field[i];mc.normal_cache.fill(0);mc.isolation=maximum*iso;mc.update();const count=mc.geometry.drawRange.count;if(!Number.isFinite(count)||count<=0||count>=240000)throw Error('Orbital surface exceeds sampling capacity.');const geometry=new BufferGeometry();for(const name of ['position','normal']){const attribute=mc.geometry.getAttribute(name),array=attribute.array.slice(0,count*3);if(name==='position')for(let i=0;i<array.length;i++)array[i]*=extent;geometry.setAttribute(name,new Float32BufferAttribute(array,3));}geometry.computeBoundingSphere();surfaces.push({sign,geometry,vertices:count});}}catch(error){surfaces.forEach(s=>s.geometry.dispose());throw error;}finally{mc.geometry.dispose();dummy.dispose();}
 return{extent,maximum,resolution,level:iso*maximum,surfaces};
}
