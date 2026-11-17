// Idealized connectivity states, not optimized transition structures.
export function mechanismState(id, stage) {
  const travel=[3.2,2.15,1.75,1.43][stage], depart=[1.94,2.15,2.65,3.5][stage];
  if(id==='sn2') {
    // Three distinct spectator groups: methyl, ethyl and hydrogen.
    // Their displacement through the equatorial plane shows umbrella inversion.
    const umbrella=[-.55,0,.3,.55][stage];
    return {atoms:[['C',0,0,0],['Br',depart,0,0],['O',-travel,0,0],['C',umbrella,1.4,.65],['C',umbrella,-1.4,.65],['H',umbrella,0,-1.1],['H',-travel-.65,.5,0],['C',umbrella,-2.6,1.35]],bonds:[[0,3],[0,4],[0,5],[4,7],[2,6],...(stage<3?[[0,1]]:[]),...(stage>0?[[0,2]]:[])],partial:stage===1||stage===2};
  }
  if(id==='e2')return {atoms:[['C',-.75,0,0],['C',.75,0,0],['H',-1.25,stage===3?2.5:1.1,0],['Br',stage===3?3.5:1.5,-1.2,0],['O',-2.1,stage===3?2.5:1.65,0],['H',-2.8,stage===3?2.7:1.85,0]],bonds:[[0,1,stage===3?2:1],[4,5],...(stage<3?[[0,2],[1,3]]:[[2,4]])],partial:stage===1||stage===2};
  return {atoms:[['C',0,0,0],['Br',depart,0,0],['O',-travel,0,0],['C',.45,1.4,.7],['C',.45,-1.4,.7],['C',.45,0,-1.4],['H',-travel-.65,.5,0],['H',-travel-.65,-.5,0]],bonds:[[0,3],[0,4],[0,5],[2,6],...(stage===0?[[0,1]]:[]),...(stage>=2?[[0,2]]:[]),...(stage<3?[[2,7]]:[])],partial:false};
}
export function mechanismMol(id,stage) {
  const {atoms,bonds,partial}=mechanismState(id,stage);
  const atomLines=atoms.map(([e,x,y,z])=>`${x.toFixed(4).padStart(10)}${y.toFixed(4).padStart(10)}${z.toFixed(4).padStart(10)} ${e.padEnd(3)} 0  0  0  0  0  0  0  0  0  0  0  0`).join('\n');
  const bondLines=bonds.map(([a,b,order=1])=>`${String(a+1).padStart(3)}${String(b+1).padStart(3)}${String(order).padStart(3)}  0  0  0  0`).join('\n');
  const charges = stage===0 && id!=="sn1" ? "M  CHG  1   3  -1\n" : stage===3 && id!=="sn1" ? "M  CHG  1   2  -1\n" : "";
  return {data:`${id.toUpperCase()} stage ${stage+1}\n  Chemistry Universe 3D\n  Schematic ${partial?'partial bonds shown as connectivity only':'endpoint'}\n${String(atoms.length).padStart(3)}${String(bonds.length).padStart(3)}  0  0  0  0            999 V2000\n${atomLines}\n${bondLines}\n${charges}M  END\n`,format:'mol',label:`${id.toUpperCase()} · ${stage+1}`};
}
