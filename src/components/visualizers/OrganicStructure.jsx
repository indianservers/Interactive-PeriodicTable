import { molecules, atomStyles, subscript } from '../../pages/organicMolecules.js';

export default function OrganicStructure({moleculeId}) {
 const molecule=molecules[moleculeId];
 const points=molecule.atoms.map(([element,x,y,z,h,charge])=>({x:x*40,y:-y*40,label:element+(h?'H'+(h>1?subscript(h):''):'')+(charge>0?'⁺':charge<0?'⁻':''),element}));
 const xs=points.map(a=>a.x),ys=points.map(a=>a.y);
 const left=Math.min(...xs)-27,top=Math.min(...ys)-16,width=Math.max(...xs)-left+27,height=Math.max(...ys)-top+16;
 return <svg className="on-structure" viewBox={`${left} ${top} ${width} ${height}`} role="img" aria-label={`${molecule.name} molecular structure`} data-molecule={moleculeId}>
  <title>{molecule.name}: {molecule.formula}. {molecule.note||'Explicit atom groups and bond orders.'}</title>
  {molecule.bonds.flatMap(([a,b,order],i)=>{
   const p=points[a],q=points[b],length=Math.hypot(q.x-p.x,q.y-p.y),dx=(q.x-p.x)/length,dy=(q.y-p.y)/length;
   const insetP=p.label.length>2?17:11,insetQ=q.label.length>2?17:11;
   return Array.from({length:order},(_,j)=>{const offset=(j-(order-1)/2)*5;return <line key={`${i}-${j}`} data-bond-order={order} x1={p.x+dx*insetP-dy*offset} y1={p.y+dy*insetP+dx*offset} x2={q.x-dx*insetQ-dy*offset} y2={q.y-dy*insetQ+dx*offset} stroke="#263550" strokeWidth="2"/>;});
  })}
  {points.map((a,i)=><text key={i} x={a.x} y={a.y} textAnchor="middle" dominantBaseline="central" fill={'#'+atomStyles[a.element].color.toString(16).padStart(6,'0')} style={{fontSize:17,fontWeight:600}}>{a.label}</text>)}
 </svg>;
}
