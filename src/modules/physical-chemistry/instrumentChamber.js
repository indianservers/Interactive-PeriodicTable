import * as T from 'three';
export function instrumentChamber({radius=1.55,height=3,piston=false}={}) {
 const group=new T.Group(),metal=new T.MeshStandardMaterial({color:0xa4b2c3,metalness:.87,roughness:.24});
 const glassMaterial=new T.MeshPhysicalMaterial({color:0xaddaff,transparent:true,opacity:.11,roughness:.08,metalness:.04,side:T.DoubleSide,depthWrite:false});
 const glass=new T.Mesh(new T.CylinderGeometry(radius,radius,height,80,1,true),glassMaterial);group.add(glass);
 const rings=[];for(const y of [-height/2,height/2]){const rim=new T.Mesh(new T.TorusGeometry(radius,.035,12,96),metal);rim.rotation.x=Math.PI/2;rim.position.y=y;group.add(rim);rings.push(rim);const inset=new T.Mesh(new T.TorusGeometry(radius-.04,.012,8,96),new T.MeshBasicMaterial({color:0xb6e4ff}));inset.rotation.x=Math.PI/2;inset.position.y=y+.04;group.add(inset);}
 const base=new T.Mesh(new T.CylinderGeometry(radius+.12,radius+.12,.12,80),metal);base.position.y=-height/2-.1;group.add(base);
 const platform=new T.Mesh(new T.CylinderGeometry(radius+.27,radius+.27,.12,80),new T.MeshStandardMaterial({color:0x283c50,metalness:.6,roughness:.3}));platform.position.y=-height/2-.2;group.add(platform);
 let cap,rod;if(piston){cap=new T.Mesh(new T.CylinderGeometry(radius-.04,radius-.04,.18,80),metal);cap.position.y=height/2-.1;group.add(cap);rod=new T.Mesh(new T.CylinderGeometry(.18,.18,2.6,32),metal);rod.position.y=height/2+1.1;group.add(rod);}
 return {group,glass,cap,rod};
}
