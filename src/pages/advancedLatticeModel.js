// Physics convention for a simple cubic lattice: a · b = 2π.
export function reciprocalVector(a,h,k,l){
  const b=2*Math.PI/a;
  return {spacing:b,components:[h*b,k*b,l*b],magnitude:b*Math.hypot(h,k,l)};
}
