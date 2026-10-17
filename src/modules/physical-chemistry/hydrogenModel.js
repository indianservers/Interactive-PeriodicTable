// Hydrogenic orbitals in atomic units, m = 0. NIST DLMF §18.39(ii).
export function laguerre(k, alpha, x) {
  if (k === 0) return 1;
  let a=1,b=1+alpha-x;
  for(let j=2;j<=k;j++){const next=((2*j-1+alpha-x)*b-(j-1+alpha)*a)/j;a=b;b=next;}
  return b;
}
const factorial=n=>{let v=1;for(let k=2;k<=n;k++)v*=k;return v;};
export function quantumNumbers(n,l){n=Math.max(1,Math.min(6,Math.round(n)));return {n,l:Math.max(0,Math.min(n-1,Math.round(l)))};}
export function radialWave(n,l,r){const q=quantumNumbers(n,l);n=q.n;l=q.l;const rho=2*Math.max(0,r)/n;return Math.sqrt((2/n)**3*factorial(n-l-1)/(2*n*factorial(n+l)))*Math.exp(-rho/2)*rho**l*laguerre(n-l-1,2*l+1,rho);}
export function angularWave(l,cosTheta){return Math.sqrt((2*l+1)/(4*Math.PI))*(l===0?1:l===1?cosTheta:(3*cosTheta*cosTheta-1)/2);}
export function hydrogenPlots(n,l){({n,l}=quantumNumbers(n,l));const radial=Array.from({length:400},(_,i)=>{const r=i*5*n*n/399;const w=radialWave(n,l,r);return {x:r,y:r*r*w*w}});const angular=Array.from({length:181},(_,i)=>({x:i,y:angularWave(l,Math.cos(i*Math.PI/180))**2}));const slice=Array.from({length:241},(_,i)=>{const z=(i/120-1)*3*n*n;return {x:z,y:(radialWave(n,l,Math.abs(z))*angularWave(l,Math.sign(z)))**2}});return {radial,angular,slice};}
