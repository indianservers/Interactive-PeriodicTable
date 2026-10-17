// Only reported measurements and already calculated results enter graph traces.
export function comparisonGraphData(points) {
  if (!points.length || points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))) throw new Error('Finite published observations required.');
  const sorted=points.map(p=>({...p})).sort((a,b)=>a.x-b.x);
  if(sorted.some(p=>p.sd!=null&&(!Number.isFinite(p.sd)||p.sd<0))) throw new Error('Reported SD must be nonnegative.');
  const xs=sorted.map(p=>p.x),ys=sorted.flatMap(p=>[p.y-(p.sd??0),p.y+(p.sd??0),p.calculated].filter(Number.isFinite));
  const pad=(min,max)=>{const d=max-min||Math.abs(max)*.1||1;return [min-d*.08,max+d*.08];};
  return {points:sorted,xDomain:pad(Math.min(...xs),Math.max(...xs)),yDomain:pad(Math.min(...ys),Math.max(...ys)),hasSd:sorted.some(p=>p.sd!=null),hasModel:sorted.some(p=>Number.isFinite(p.calculated))};
}
