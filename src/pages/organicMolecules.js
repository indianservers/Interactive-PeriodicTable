// One chemical graph drives the 2D structures and the 3D teaching models.
// Atom tuple: element, x, y, z, attached H count, formal charge (optional).
// Coordinates are schematic, not a calculated conformer or measured geometry.
const atom = (element, x, y, h=0, charge=0) => [element,x,y,0,h,charge];
const chain = (end, h) => [atom('C',-.7,-.2,3),atom('C',.7,.2,2),atom(end,1.8,1,h)];
const carbonyl = end => [atom('C',-1,-.5,3),atom('C',.3,.2,end?0:1),atom('O',.3,1.5),...(end?[atom('O',1.6,-.5,end==='acid'?1:0,end==='ion'?-1:0)]:[])];
const ring = () => Array.from({length:6},(_,i)=>atom('C',1.4*Math.cos(i*Math.PI/3),1.4*Math.sin(i*Math.PI/3),1));
const ringBonds = [[0,1,2],[1,2,1],[2,3,2],[3,4,1],[4,5,2],[5,0,1]];
const define = (name, formula, molecular, group, atoms, bonds, extra={}) => ({name,formula,molecular,group,atoms,bonds,...extra});
export const molecules = {
 methane:define('Methane','CH₄','CH4','Alkane',[atom('C',0,0,4)],[]),
 chloromethane:define('Chloromethane','CH₃Cl','CH3Cl','Haloalkane',[atom('C',-.7,0,3),atom('Cl',.9,0)],[[0,1,1]]),
 ethane:define('Ethane','CH₃CH₃','C2H6','Alkane',[atom('C',-.7,0,3),atom('C',.7,0,3)],[[0,1,1]]),
 ethene:define('Ethene','H₂C=CH₂','C2H4','Alkene',[atom('C',-.7,0,2),atom('C',.7,0,2)],[[0,1,2]]),
 ethanol:define('Ethanol','CH₃CH₂OH','C2H6O','Alcohol',chain('O',1),[[0,1,1],[1,2,1]]),
 bromoethane:define('Bromoethane','CH₃CH₂Br','C2H5Br','Haloalkane',chain('Br',0),[[0,1,1],[1,2,1]]),
 ethanamine:define('Ethanamine','CH₃CH₂NH₂','C2H7N','Primary amine',chain('N',2),[[0,1,1],[1,2,1]]),
 ethanal:define('Ethanal','CH₃CHO','C2H4O','Aldehyde',carbonyl(),[[0,1,1],[1,2,2]]),
 ethanoic:define('Ethanoic acid','CH₃COOH','C2H4O2','Carboxylic acid',carbonyl('acid'),[[0,1,1],[1,2,2],[1,3,1]]),
 ester:define('Ethyl ethanoate','CH₃COOCH₂CH₃','C4H8O2','Ester',[...carbonyl('ester'),atom('C',2.8,.2,2),atom('C',4.1,-.5,3)],[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[4,5,1]]),
 ethanoate:define('Ethanoate ion','CH₃COO⁻','C2H3O2','Carboxylate',carbonyl('ion'),[[0,1,1],[1,2,2],[1,3,1]],{charge:-1,note:'One resonance contributor; the negative charge is delocalised over both oxygens.'}),
 ethylammonium:define('Ethylammonium ion','CH₃CH₂NH₃⁺','C2H8N','Ammonium ion',[...chain('N',3).slice(0,2),atom('N',1.8,1,3,1)],[[0,1,1],[1,2,1]],{charge:1}),
 benzene:define('Benzene','C₆H₆','C6H6','Aromatic',ring(),ringBonds,{aromatic:true,note:'Benzene is planar with delocalised π bonding. Alternating bonds show one Kekulé contributor, not localised bond lengths.'}),
 nitrobenzene:define('Nitrobenzene','C₆H₅NO₂','C6H5NO2','Nitroaromatic',[...ring().map((a,i)=>i===0?[...a.slice(0,4),0,0]:a),atom('N',2.8,0,0,1),atom('O',3.5,1.1),atom('O',3.5,-1.1,0,-1)],[...ringBonds,[0,6,1],[6,7,2],[6,8,1]],{aromatic:true,note:'One resonance contributor: nitro N is positive and singly bonded O is negative.'}),
};
export const atomStyles = {
 C:{color:0x33373e,radius:.34,label:'Carbon',number:6}, O:{color:0xeb202f,radius:.32,label:'Oxygen',number:8},
 H:{color:0xf4f6f7,radius:.235,label:'Hydrogen',number:1}, N:{color:0x3168e7,radius:.33,label:'Nitrogen',number:7},
 Br:{color:0x9d3325,radius:.4,label:'Bromine',number:35}, Cl:{color:0x37a851,radius:.38,label:'Chlorine',number:17},
};
export const subscript = value => String(value).replace(/\d/g,d=>'₀₁₂₃₄₅₆₇₈₉'[d]);
export function expandMolecule(molecule) {
 const atoms=molecule.atoms.map(a=>a.slice(0,4));
 const bonds=molecule.bonds.map(b=>[...b]);
 const normal=v=>{const n=Math.hypot(...v)||1;return v.map(x=>x/n);};
 molecule.atoms.forEach(([element,x,y,z,h],i)=>{
  const adjacent=molecule.bonds.filter(b=>b[0]===i||b[1]===i);
  const dirs=adjacent.map(b=>{const a=atoms[b[0]===i?b[1]:b[0]];return normal([a[1]-x,a[2]-y,a[3]-z]);});
  const planar=adjacent.some(b=>b[2]===2);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  let hydrogenDirections=[];
  if(!dirs.length){
   hydrogenDirections=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(normal);
  }else if(planar){
   if(dirs.length===1){const angle=Math.atan2(dirs[0][1],dirs[0][0]);hydrogenDirections=[2*Math.PI/3,-2*Math.PI/3].map(t=>[Math.cos(angle+t),Math.sin(angle+t),0]);}
   else hydrogenDirections=[normal(dirs[0].map((v,j)=>-v-dirs[1][j]))];
  }else if(dirs.length===1){
   const axis=dirs[0],u=normal(cross(axis,Math.abs(axis[2])<.9?[0,0,1]:[0,1,0])),v=cross(axis,u);
   const cos=element==='O'?Math.cos(104.5*Math.PI/180):-1/3,sin=Math.sqrt(1-cos*cos);
   hydrogenDirections=[0,2*Math.PI/3,4*Math.PI/3].map(t=>axis.map((a,j)=>a*cos+sin*(u[j]*Math.cos(t)+v[j]*Math.sin(t))));
  }else if(dirs.length===2){
   const away=normal(dirs[0].map((v,j)=>-v-dirs[1][j])),side=normal(cross(...dirs));
   hydrogenDirections=[1,-1].map(sign=>away.map((a,j)=>a/Math.sqrt(3)+sign*side[j]*Math.sqrt(2/3)));
  }
  for(let n=0;n<h;n++){
   if(hydrogenDirections[n]){
    const d=hydrogenDirections[n];bonds.push([i,atoms.length,1]);atoms.push(['H',x+d[0],y+d[1],z+d[2]]);continue;
   }
   let best,score=-Infinity;
   for(let k=0;k<240;k++){
    const t=k*Math.PI*(3-Math.sqrt(5)),v=1-2*(k+.5)/240;
    const d=planar?[Math.cos(k*Math.PI/120),Math.sin(k*Math.PI/120),0]:[Math.sqrt(1-v*v)*Math.cos(t),Math.sqrt(1-v*v)*Math.sin(t),v];
    const s=dirs.length?Math.min(...dirs.map(a=>1-a.reduce((sum,c,j)=>sum+c*d[j],0))):1;
    if(s>score){score=s;best=d;}
   }
   dirs.push(best);bonds.push([i,atoms.length,1]);atoms.push(['H',x+best[0],y+best[1],z+best[2]]);
  }
 });
 return {atoms,bonds};
}
