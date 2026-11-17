// Small periodic Lennard–Jones setup preview, in reduced units.
// The requested system size is capped for the interactive preparation preview.
export function createSetup(requested=108,density=.8,seed=1) {
  const n=Math.min(108,Math.max(32,Math.round(requested))),length=Math.cbrt(n/density),side=Math.ceil(Math.cbrt(n));
  let randomState=seed>>>0;
  const random=()=>((randomState=(1664525*randomState+1013904223)>>>0)+.5)/4294967296;
  const positions=Array.from({length:n},(_,i)=>[(i%side+.5)*length/side,(Math.floor(i/side)%side+.5)*length/side,(Math.floor(i/(side*side))+.5)*length/side]);
  positions.forEach(p=>p.forEach((v,k)=>{p[k]=(v+(random()-.5)*.025*length/side+length)%length;}));
  return {n,length,positions,velocities:positions.map(()=>[0,0,0]),seed,steps:0};
}
export function setupEnergy(state) {
  const forces=state.positions.map(()=>[0,0,0]);let energy=0;
  for(let i=0;i<state.n;i++)for(let j=i+1;j<state.n;j++){
    const d=state.positions[i].map((v,k)=>{const x=v-state.positions[j][k];return x-state.length*Math.round(x/state.length);});
    const r2=d.reduce((n,x)=>n+x*x,0);if(r2>6.25)continue;
    const inverse=1/Math.max(r2,.04),r6=inverse**3;
    energy+=4*(r6*r6-r6);
    const f=24*inverse*r6*(2*r6-1);
    for(let k=0;k<3;k++){forces[i][k]+=f*d[k];forces[j][k]-=f*d[k];}
  }
  return {energy,forces};
}
export function randomizeSetup(state,temperature=120,seed=state.seed) {
  let value=seed>>>0;const random=()=>((value=(1664525*value+1013904223)>>>0)+.5)/4294967296;
  const velocities=state.positions.map(()=>Array.from({length:3},()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random())));
  for(let k=0;k<3;k++){const mean=velocities.reduce((n,v)=>n+v[k],0)/state.n;velocities.forEach(v=>v[k]-=mean);}
  const sum=velocities.flat().reduce((n,v)=>n+v*v,0),scale=Math.sqrt((3*state.n-3)*(temperature/119.8)/sum);
  return {...state,velocities:velocities.map(v=>v.map(x=>x*scale)),seed};
}
export function minimizeSetup(state,iterations=40) {
  let next={...state,positions:state.positions.map(p=>[...p])},result=setupEnergy(next);
  for(let i=0;i<iterations;i++){
    const largest=Math.max(1,...result.forces.flat().map(Math.abs));let step=.025/largest,accepted=false;
    for(let attempt=0;attempt<12;attempt++){
      const trial={...next,positions:next.positions.map((p,j)=>p.map((v,k)=>(v+step*result.forces[j][k]+next.length)%next.length))},value=setupEnergy(trial);
      if(value.energy<=result.energy){next=trial;result=value;accepted=true;break;}step/=2;
    }
    if(!accepted)break;
  }
  return next;
}
export function equilibrateSetup(state,temperature=120,steps=100) {
  let next={...state,positions:state.positions.map(p=>[...p]),velocities:state.velocities.map(v=>[...v])},forces=setupEnergy(next).forces;
  const dt=.001;
  for(let s=0;s<steps;s++){
    next.positions=next.positions.map((p,i)=>p.map((v,k)=>(v+dt*next.velocities[i][k]+.5*dt*dt*forces[i][k]+next.length)%next.length));
    const following=setupEnergy(next).forces;
    next.velocities=next.velocities.map((v,i)=>v.map((x,k)=>x+.5*dt*(forces[i][k]+following[i][k])));forces=following;
    // Simple velocity-rescaling thermostat for this setup demonstration.
    const sum=next.velocities.flat().reduce((n,v)=>n+v*v,0),scale=Math.sqrt((3*next.n-3)*temperature/119.8/Math.max(sum,1e-12));
    next.velocities=next.velocities.map(v=>v.map(x=>x*scale));
  }
  return {...next,steps:state.steps+steps};
}
export function setupTemperature(state){return state.velocities.flat().reduce((n,v)=>n+v*v,0)/(3*state.n-3)*119.8;}
export function setupParticles(state){return state.positions.map((p,i)=>({id:i,x:8+84*p[0]/state.length,y:8+84*p[1]/state.length,z:p[2]/state.length,vx:state.velocities[i][0],vy:state.velocities[i][1]}));}
