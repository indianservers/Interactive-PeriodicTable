// Normalized reactor demonstration, NOT a scale-up model or physical recipe.
// One initial benzene equivalent. Kinetics, heat release and interlock are
// illustrative training parameters; no acid mixture composition is specified.
export const NITRATION_DEFAULTS={acid:1.1,feed:.12,cooling:.5,bath:20,activity:1,k40:.4,activation:45,adiabaticRise:80};
export const NITRATION_MW={benzene:78.114,nitric:63.012,nitrobenzene:123.111,water:18.015};
export const nitrationInitial=()=>({phase:'empty',time:0,temperature:20,fed:0,extent:0,heat:0,removed:0,feeding:false,tripped:false,peak:20});
export function validateNitration(v,s){
 const bounds={acid:[.1,2],feed:[.01,.5],cooling:[0,2],bath:[5,40],activity:[.2,2],k40:[.01,1],activation:[0,80],adiabaticRise:[10,150]};
 for(const [k,[a,b]] of Object.entries(bounds))if(!Number.isFinite(v[k])||v[k]<a||v[k]>b)throw new RangeError(`Invalid ${k}: ${a}–${b}`);
 if(s){
  if(!['empty','reaction','stopped'].includes(s.phase))throw new RangeError('Invalid reactor phase');
  for(const k of ['time','fed','extent','heat','peak'])if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError(`Invalid ${k}`);
  if(!Number.isFinite(s.temperature)||s.temperature<0||s.temperature>400||!Number.isFinite(s.removed))throw new RangeError('Invalid thermal state');
  if(s.fed>v.acid+1e-9||s.extent>Math.min(1,s.fed)+1e-9)throw new RangeError('Material inventory exceeded');
 }
}
export function nitrationRate(t,v){return v.k40*v.activity*Math.exp(-v.activation*1000/8.314462618*(1/(t+273.15)-1/313.15));}
function reaction(a,b,kdt){
 const low=Math.min(a,b),high=Math.max(a,b),d=high-low;
 if(low<=0)return 0;
 if(d<1e-8)return low*low*kdt/(1+low*kdt);
 const loss=-Math.expm1(-d*kdt);return low*high*loss/(d+low*loss);
}
export function advanceNitration(state,v,dt){
 validateNitration(v,state);if(!Number.isFinite(dt)||dt<0||dt>60)throw new RangeError('Step must be 0–60 simulation minutes');
 const s={...state};if(s.phase!=='reaction'||dt===0)return s;
 const n=Math.ceil(dt/.002),h=dt/n;
 const cool=()=>{const t=v.bath+(s.temperature-v.bath)*Math.exp(-v.cooling*h/2);s.removed+=s.temperature-t;s.temperature=t;};
 for(let i=0;i<n;i++){
  if(s.temperature>=60){s.feeding=false;s.tripped=true;}
  cool();
  if(s.feeding&&!s.tripped)s.fed=Math.min(v.acid,s.fed+v.feed*h);
  const dx=reaction(Math.max(0,1-s.extent),Math.max(0,s.fed-s.extent),nitrationRate(s.temperature,v)*h);
  s.extent+=dx;const heat=v.adiabaticRise*dx;s.heat+=heat;s.temperature+=heat;
  s.peak=Math.max(s.peak,s.temperature);
  if(s.temperature>=60){s.feeding=false;s.tripped=true;}
  cool();s.peak=Math.max(s.peak,s.temperature);s.time+=h;
  if(s.fed>=v.acid-1e-10)s.feeding=false;
 }
 return s;
}
export function nitrationFeed(state,v){
 validateNitration(v,state);
 if(state.phase!=='reaction')throw new Error('Initialize the virtual reactor first');
 if(state.tripped)throw new Error('Interlock is latched. Reset for another trial.');
 if(state.temperature>=60)throw new Error('Feed blocked by the illustrative thermal interlock');
 if(state.fed>=v.acid-1e-10)throw new Error('Feed reservoir is empty');
 return {...state,feeding:!state.feeding};
}
export function nitrationResult(s,v){
 validateNitration(v,s);const active=s.phase!=='empty',x=active?s.extent:0,m=NITRATION_MW;
 const amount={benzene:active?1-x:0,nitricReactor:active?s.fed-x:0,nitricReservoir:active?v.acid-s.fed:0,nitrobenzene:x,water:x};
 const mass={benzene:amount.benzene*m.benzene,nitric:(amount.nitricReactor+amount.nitricReservoir)*m.nitric,nitrobenzene:x*m.nitrobenzene,water:x*m.water};
 const theoretical=Math.min(1,v.acid);
 return {amount,mass,initialMass:active?m.benzene+v.acid*m.nitric:0,theoretical,yieldPercent:x/theoretical*100,rate:active?nitrationRate(s.temperature,v)*(1-x)*Math.max(0,s.fed-x):0,energyResidual:s.temperature-20-s.heat+s.removed,warning:s.tripped?'Feed interlock latched':s.temperature>=50?'Temperature rising — inspect cooling':'Within illustrative training envelope'};
}
