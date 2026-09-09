// Reduced Lennard-Jones units: sigma=epsilon=m=kB=1. Force-shifted cutoff.
export function dynamicsStats(s){const kinetic=s.v.reduce((sum,v)=>sum+v*v,0)/2;return {kinetic,potential:s.potential,total:kinetic+s.potential,temperature:2*kinetic/(3*(s.count-1)),time:s.time};}
export function setDynamicsTemperature(s,temperature){const current=dynamicsStats(s).temperature;const scale=Math.sqrt(temperature/current);s.v.forEach((v,i)=>{s.v[i]=v*scale;});}
export function computeDynamicsForces(s){
  s.f.fill(0);let potential=0;const rc=Math.min(2.5,s.box/2),uc=4*(rc**-12-rc**-6),fc=24*(2*rc**-13-rc**-7);
  for(let i=0;i<s.count;i++)for(let j=i+1;j<s.count;j++){
    const d=[0,1,2].map(k=>{const x=s.p[3*i+k]-s.p[3*j+k];return x-s.box*Math.round(x/s.box);});const r2=d.reduce((sum,x)=>sum+x*x,0);if(r2>=rc*rc)continue;
    const r=Math.sqrt(r2),r6=r2**-3,r12=r6*r6,factor=(24*(2*r12-r6)/r-fc)/r;
    potential+=4*(r12-r6)-uc+(r-rc)*fc;
    for(let k=0;k<3;k++){const f=factor*d[k];s.f[3*i+k]+=f;s.f[3*j+k]-=f;}
  }s.potential=potential;
}
export function createDynamics(density=.4,temperature=1){
  const count=32,box=Math.cbrt(count/density),p=new Float64Array(count*3),v=new Float64Array(count*3),f=new Float64Array(count*3);let n=0,seed=9173;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  for(let x=0;x<2;x++)for(let y=0;y<2;y++)for(let z=0;z<2;z++)for(const b of [[0,0,0],[0,.5,.5],[.5,0,.5],[.5,.5,0]]){[x,y,z].forEach((q,k)=>{p[n*3+k]=(q+b[k]+.25)*box/2;v[n*3+k]=random()-.5;});n++;}
  for(let k=0;k<3;k++){let mean=0;for(let i=0;i<count;i++)mean+=v[3*i+k]/count;for(let i=0;i<count;i++)v[3*i+k]-=mean;}
  const s={count,box,p,v,f,potential:0,time:0};setDynamicsTemperature(s,temperature);computeDynamicsForces(s);return s;
}
export function stepDynamics(s,dt=.002){
  for(let i=0;i<s.p.length;i++){s.v[i]+=.5*dt*s.f[i];s.p[i]=((s.p[i]+dt*s.v[i])%s.box+s.box)%s.box;}
  computeDynamicsForces(s);
  for(let i=0;i<s.v.length;i++)s.v[i]+=.5*dt*s.f[i];s.time+=dt;return s;
}
