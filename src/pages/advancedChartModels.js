export function reactionEnergy(t, barrier, delta) {
  // Smooth double-well profile: flat endpoints at 0 and delta.
  return 16 * barrier * t * t * (1-t) * (1-t) + delta * t * t * (3-2*t);
}
export function reactionSummary(barrier,delta) {
  let peak=-Infinity, coordinate=0;
  for(let i=0;i<=1000;i++){const t=i/1000,e=reactionEnergy(t,barrier,delta);if(e>peak){peak=e;coordinate=t;}}
  return {peak,coordinate,forward:peak,reverse:peak-delta};
}
export function radialDistribution(r, spacing, disorder) {
  if(r<.72*spacing) return 0;
  const width=.07+.18*disorder;
  const shells=[1,1.8,2.6];
  const envelope=1-Math.exp(-Math.pow((r-.72*spacing)/(.16*spacing),2));
  return envelope*(1+shells.reduce((sum,s,i)=>sum+(2.3/(i+1))*Math.exp(-Math.pow((r-s*spacing)/(width*spacing*(1+i*.5)),2)),0));
}
export function nmrMultiplet(neighbours,coupling,shift,frequency=400) {
  const lines=[];let coefficient=1;
  for(let k=0;k<=neighbours;k++){
    if(k>0)coefficient=coefficient*(neighbours-k+1)/k;
    lines.push({ppm:shift+(k-neighbours/2)*coupling/frequency,intensity:coefficient});
  }
  return lines;
}

// Each additional equivalent spin contributes a ±J/2 shift. Coincident
// branches add, giving Pascal-triangle multiplicities at successive levels.
export function nmrCouplingTree(neighbours,coupling,shift,frequency=400) {
  return Array.from({length:neighbours+1},(_,level)=>({
    level,
    nodes:nmrMultiplet(level,coupling,shift,frequency),
    edges:level===0?[]:Array.from({length:level},(_,parent)=>[
      {parent,child:parent}, {parent,child:parent+1},
    ]).flat(),
  }));
}
