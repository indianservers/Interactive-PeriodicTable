// Idealized coordination geometries; educational, not crystallographic coordinates.
export const octahedral=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
export const tetrahedral=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v=>v.map(x=>x/Math.sqrt(3)));
export const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
// Conditional two-species teaching model. K is illustrative, not an experimental constant.
export function equilibrium(chloride,temperature){
 const k=.6*Math.exp(32000/8.314*(1/298.15-1/(temperature+273.15)));
 const ratio=k*chloride**4;
 return {k,blue:ratio/(1+ratio),pink:1/(1+ratio)};
}
export function absorbance(wavelength,blue){
 const pink=.5*Math.exp(-.5*((wavelength-510)/39)**2);
 const chloride=.85*Math.exp(-.5*((wavelength-685)/37)**2)+.15*Math.exp(-.5*((wavelength-630)/19)**2);
 return {pink,chloride,mixture:(1-blue)*pink+blue*chloride};
}
