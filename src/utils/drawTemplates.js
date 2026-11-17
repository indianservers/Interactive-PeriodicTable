// Expanded reusable groups retain their chemical graph in MOL/SMILES exports.
export const GROUP_TEMPLATES = {
  Me: { atoms: [{element:'C',x:0,y:0}], bonds:[] },
  Et: { atoms: [{element:'C',x:0,y:0},{element:'C',x:52,y:-30}], bonds:[{a:0,b:1,order:1}] },
  COOH: { atoms:[{element:'C',x:0,y:0},{element:'O',x:30,y:-52},{element:'O',x:30,y:52}],bonds:[{a:0,b:1,order:2},{a:0,b:2,order:1}] },
  Ph: { atoms:Array.from({length:6},(_,i)=>({element:'C',x:60-60*Math.cos(i*Math.PI/3),y:60*Math.sin(i*Math.PI/3)})),bonds:Array.from({length:6},(_,i)=>({a:i,b:(i+1)%6,order:i%2?1:2})) },
};
function direction(model, atom) {
  const neighbors=model.bonds.filter(b=>b.a===atom.id||b.b===atom.id).map(b=>model.atoms.find(a=>a.id===(b.a===atom.id?b.b:b.a)));
  if(!neighbors.length)return 0;
  const x=neighbors.reduce((n,a)=>n+a.x-atom.x,0),y=neighbors.reduce((n,a)=>n+a.y-atom.y,0);
  return Math.hypot(x,y)>1e-6?Math.atan2(-y,-x):Math.atan2(atom.y-neighbors[0].y,atom.x-neighbors[0].x)+Math.PI/3;
}
function append(model,template,position,angle,anchorId) {
  let id=Math.max(0,...model.atoms.map(a=>a.id));
  const atoms=template.atoms.map(a=>({...a,id:++id,x:position.x+a.x*Math.cos(angle)-a.y*Math.sin(angle),y:position.y+a.x*Math.sin(angle)+a.y*Math.cos(angle)}));
  const bonds=template.bonds.map(b=>({...b,a:atoms[b.a].id,b:atoms[b.b].id}));
  if(anchorId!=null)bonds.push({a:anchorId,b:atoms[0].id,order:1});
  return {...model,atoms:[...model.atoms,...atoms],bonds:[...model.bonds,...bonds]};
}
export function placeGroup(model,key,anchorId,point={x:400,y:300}) {
  const template=GROUP_TEMPLATES[key];if(!template)throw Error('Choose a supported group template.');
  const atom=model.atoms.find(a=>a.id===anchorId);if(anchorId!=null&&!atom)throw Error('Attachment atom is missing.');
  const angle=atom?direction(model,atom):0;
  return append(model,template,atom?{x:atom.x+60*Math.cos(angle),y:atom.y+60*Math.sin(angle)}:point,angle,atom?.id);
}
export function attachRing(model,anchorId,size=6,aromatic=false) {
  if(aromatic)size=6;if(!Number.isInteger(size)||size<3||size>8)throw Error('Ring size must be 3–8.');
  const atom=model.atoms.find(a=>a.id===anchorId);if(!atom)throw Error('Choose an attachment atom.');
  const angle=direction(model,atom),radius=60/(2*Math.sin(Math.PI/size));
  const template={atoms:Array.from({length:size},(_,i)=>({element:'C',x:radius-radius*Math.cos(i*2*Math.PI/size),y:radius*Math.sin(i*2*Math.PI/size)})),bonds:Array.from({length:size},(_,i)=>({a:i,b:(i+1)%size,order:aromatic&&i%2===0?2:1}))};
  return append(model,template,{x:atom.x+60*Math.cos(angle),y:atom.y+60*Math.sin(angle)},angle,atom.id);
}
export function fuseRing(model,bondIndex,size=6,aromatic=false,side='auto') {
  if(aromatic)size=6;if(!Number.isInteger(size)||size<3||size>8)throw Error('Ring size must be 3–8.');
  const bond=model.bonds[bondIndex];if(!bond)throw Error('Choose a bond to fuse onto.');
  if(bond.order===3||bond.stereo)throw Error('Fuse onto a plain single or double bond.');
  const a=model.atoms.find(a=>a.id===bond.a),b=model.atoms.find(a=>a.id===bond.b);
  const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy);if(length<1)throw Error('Separate overlapping bond endpoints before fusing.');
  const nx=-dy/length,ny=dx/length,mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
  const sign=side==='left'?1:side==='right'?-1:(model.atoms.filter(p=>p.id!==a.id&&p.id!==b.id).reduce((sum,p)=>sum+(p.x-mx)*nx+(p.y-my)*ny,0)>0?-1:1);
  let id=Math.max(0,...model.atoms.map(a=>a.id));
  const created=[];let current={x:b.x,y:b.y},angle=Math.atan2(dy,dx),turn=sign*2*Math.PI/size;
  for(let i=0;i<size-2;i++){angle+=turn;current={x:current.x+length*Math.cos(angle),y:current.y+length*Math.sin(angle)};created.push({id:++id,element:'C',...current});}
  const path=[b,...created,a];
  // The shared bond is retained once; new aromatic edges alternate against it.
  const edges=path.slice(0,-1).map((p,i)=>({a:p.id,b:path[i+1].id,order:aromatic?(bond.order===2?(i%2?2:1):(i%2?1:2)):1}));
  return {...model,atoms:[...model.atoms,...created],bonds:[...model.bonds,...edges]};
}
