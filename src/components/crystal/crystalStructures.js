const fcc=[[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]];
const shifted=(points,shift,species)=>points.map(p=>({f:p.map((v,i)=>(v+shift[i])%1),species}));
const cubic=a=>[[a,0,0],[0,a,0],[0,0,a]];
const ion=(label,color,radius,electrons)=>({label,color,radius,electrons});
export const crystalStructures=[
 {id:'nacl',formula:'NaCl',name:'Rock salt',title:'Sodium chloride',system:'Cubic',group:'Fm-3m (No. 225)',unit:'Face-centered cubic (FCC)',coordination:'6:6',z:4,a:5.64,molar:58.44,vectors:cubic(5.64),species:[ion('Na⁺ (sodium)','#a443de',1.02,10),ion('Cl⁻ (chloride)','#65d92c',1.81,18)],basis:[...shifted(fcc,[0,0,0],1),...shifted(fcc,[.5,0,0],0)],bond:2.83,radiusNote:'Ionic radii, CN=6'},
 {id:'cscl',formula:'CsCl',name:'Cesium chloride',title:'Cesium chloride',system:'Cubic',group:'Pm-3m (No. 221)',unit:'Primitive cubic + two-ion basis',coordination:'8:8',z:1,a:4.123,molar:168.36,vectors:cubic(4.123),species:[ion('Cs⁺ (cesium)','#35c5e8',1.74,54),ion('Cl⁻ (chloride)','#6bcc35',1.81,18)],basis:[{f:[0,0,0],species:1},{f:[.5,.5,.5],species:0}],bond:3.58,radiusNote:'Illustrative ionic radii'},
 {id:'zns',formula:'ZnS',name:'Zinc blende',title:'Zinc sulfide',system:'Cubic',group:'F-43m (No. 216)',unit:'Face-centered cubic (FCC)',coordination:'4:4',z:4,a:5.409,molar:97.44,vectors:cubic(5.409),species:[ion('Zn²⁺ (zinc)','#aacdd5',.6,28),ion('S²⁻ (sulfide)','#e9d345',1.84,18)],basis:[...shifted(fcc,[0,0,0],1),...shifted(fcc,[.25,.25,.25],0)],bond:2.35,radiusNote:'Illustrative ionic radii; overlap possible'},
 {id:'caf2',formula:'CaF₂',name:'Fluorite',title:'Calcium fluoride',system:'Cubic',group:'Fm-3m (No. 225)',unit:'Face-centered cubic (FCC)',coordination:'8:4',z:4,a:5.462,molar:78.074,vectors:cubic(5.462),species:[ion('Ca²⁺ (calcium)','#a576e4',1.12,18),ion('F⁻ (fluoride)','#69d743',1.31,10)],basis:[...shifted(fcc,[0,0,0],0),...[.25,.75].flatMap(x=>[.25,.75].flatMap(y=>[.25,.75].map(z=>({f:[x,y,z],species:1}))))],bond:2.37,radiusNote:'Illustrative ionic radii'},
 {id:'diamond',formula:'C',name:'Diamond',title:'Carbon',system:'Cubic',group:'Fd-3m (No. 227)',unit:'Diamond cubic · FCC basis',coordination:'4 (tetrahedral)',z:8,a:3.567,molar:12.011,vectors:cubic(3.567),species:[ion('C (carbon)','#cad5df',.772,6)],basis:[...shifted(fcc,[0,0,0],0),...shifted(fcc,[.25,.25,.25],0)],bond:1.56,radiusNote:'Bond-derived hard-sphere radius'},
 {id:'graphite',formula:'C',name:'Graphite',title:'Carbon',system:'Hexagonal',group:'P6₃/mmc (No. 194)',unit:'Hexagonal · AB-stacked layers',coordination:'3 (in-plane)',z:4,a:2.46,c:6.708,molar:12.011,vectors:[[2.46,0,0],[-1.23,Math.sqrt(3)*1.23,0],[0,0,6.708]],species:[ion('C (carbon)','#adbfcf',.71,6)],basis:[[0,0,0],[1/3,2/3,0],[0,0,.5],[2/3,1/3,.5]].map(f=>({f,species:0})),bond:1.44,radiusNote:'In-plane covalent hard-sphere radius'},
];
export const dot=(a,b)=>a.reduce((n,x,i)=>n+x*b[i],0);
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export const cartesian=(s,f)=>[0,1,2].map(i=>f.reduce((n,x,j)=>n+x*s.vectors[j][i],0));
export const volume=s=>Math.abs(dot(s.vectors[0],cross(s.vectors[1],s.vectors[2])));
export function reciprocal(s,hkl){const [a,b,c]=s.vectors,v=dot(a,cross(b,c));return [0,1,2].map(i=>(hkl[0]*cross(b,c)[i]+hkl[1]*cross(c,a)[i]+hkl[2]*cross(a,b)[i])/v);}
export function planeData(s,hkl){const normal=reciprocal(s,hkl),norm=Math.hypot(...normal);if(!norm)return null;return {normal:normal.map(x=>x/norm),constant:(dot(normal,cartesian(s,[.5,.5,.5]))-1)/norm,d:1/norm};}
export function derived(s){const v=volume(s);return {volume:v,perFormula:v/s.z,density:s.z*s.molar/(6.02214076e23*v*1e-24),packing:s.basis.reduce((n,a)=>n+4*Math.PI/3*s.species[a.species].radius**3,0)/v};}
export function latticeAtoms(s,repeat=1){
 const low=-Math.floor((repeat-1)/2),high=low+repeat,atoms=[];
 for(let i=low;i<=high;i++)for(let j=low;j<=high;j++)for(let k=low;k<=high;k++)for(const atom of s.basis){const f=atom.f.map((v,n)=>v+[i,j,k][n]);if(f.some(v=>v>high+1e-6))continue;atoms.push({f,species:atom.species,position:cartesian(s,f.map(v=>v-.5)),id:f.map(v=>v.toFixed(4)).join(',')+':'+atom.species});}
 return atoms;
}
export function diffraction(s,wavelength=1.5406){
 const groups=new Map();
 for(let h=-5;h<=5;h++)for(let k=-5;k<=5;k++)for(let l=-5;l<=5;l++){
  if(!h&&!k&&!l)continue;const p=planeData(s,[h,k,l]),sin=wavelength/(2*p.d);if(sin>=1)continue;
  const angle=2*Math.asin(sin)*180/Math.PI;if(angle<20||angle>100)continue;
  let re=0,im=0;for(const a of s.basis){const phase=2*Math.PI*(h*a.f[0]+k*a.f[1]+l*a.f[2]),f=s.species[a.species].electrons;re+=f*Math.cos(phase);im+=f*Math.sin(phase);}
  const intensity=re*re+im*im;if(intensity<1e-6)continue;
  const key=angle.toFixed(4);const theta=angle*Math.PI/360;
  const weighted=intensity*(1+Math.cos(2*theta)**2)/(Math.sin(theta)**2*Math.cos(theta));
  if(groups.has(key))groups.get(key).intensity+=weighted;else groups.set(key,{angle,d:p.d,hkl:s.system==='Cubic'?[Math.abs(h),Math.abs(k),Math.abs(l)].sort((a,b)=>b-a):[h,k,l],intensity:weighted});
 }
 const peaks=[...groups.values()].sort((a,b)=>a.angle-b.angle),max=Math.max(...peaks.map(p=>p.intensity));return peaks.map(p=>({...p,intensity:p.intensity/max}));
}
