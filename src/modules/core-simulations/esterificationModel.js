// Ideal concentration model and prescribed two-phase extraction. Parameters are
// illustrative, not fitted kinetics, phase-equilibrium data or a preparation recipe.
export const ESTER_MW={acid:60.052,alcohol:74.123,ester:116.16,water:18.015};
export const ESTER_DEFAULTS={acid:6,alcohol:7.4,water:.2,ester:0,volume:25,setpoint:75,catalyst:1,kRef:.06,Keq:4,activation:40,enthalpy:-5,wash:25,organicVolume:25,partition:50};
export const esterInitial=()=>({phase:'empty',time:0,temperature:20,extent:0,heater:false,drained:0,collected:0});
export const ESTER_PHASES=['empty','reaction','cooling','settled','draining','upperReady','collecting','collected'];
export function validateEster(v,s){
 const bounds={acid:[1,15],alcohol:[1,25],water:[0,8],ester:[0,10],volume:[15,100],setpoint:[25,95],catalyst:[0,3],kRef:[.005,.3],Keq:[.5,10],activation:[0,80],enthalpy:[-30,30],wash:[10,100],organicVolume:[10,100],partition:[1,200]};
 for(const [k,[lo,hi]] of Object.entries(bounds))if(!Number.isFinite(v[k])||v[k]<lo||v[k]>hi)throw new RangeError(`Invalid ${k}: ${lo}–${hi}`);
 if(s){
  if(!ESTER_PHASES.includes(s.phase))throw new RangeError('Unknown esterification stage');
  if(!Number.isFinite(s.time)||s.time<0||!Number.isFinite(s.temperature)||s.temperature<0||s.temperature>100||!Number.isFinite(s.extent))throw new RangeError('Invalid clock, temperature or reaction extent');
  if(s.extent< -Math.min(v.ester/ESTER_MW.ester,v.water/ESTER_MW.water)-1e-10||s.extent>Math.min(v.acid/ESTER_MW.acid,v.alcohol/ESTER_MW.alcohol)+1e-10)throw new RangeError('Reaction exceeds material inventory');
  for(const k of ['drained','collected'])if(!Number.isFinite(s[k])||s[k]<0||s[k]>1)throw new RangeError(`Invalid ${k} fraction`);
  if(s.phase==='empty'&&s.extent!==0||!['draining','upperReady','collecting','collected'].includes(s.phase)&&s.drained!==0||!['collecting','collected'].includes(s.phase)&&s.collected!==0)throw new RangeError('Material moved before the corresponding stage');
  if(['upperReady','collecting','collected'].includes(s.phase)&&s.drained!==1||s.phase==='collected'&&s.collected!==1)throw new RangeError('Incomplete phase transfer');
 }
}
export function esterConstants(t,v){
 if(!Number.isFinite(t)||t<0||t>100)throw new RangeError('Unsupported temperature');
 const d=1/(t+273.15)-1/343.15;
 return {k:v.kRef*v.catalyst*Math.exp(-v.activation*1000/8.314462618*d),K:v.Keq*Math.exp(-v.enthalpy*1000/8.314462618*d)};
}
// Exact isothermal flow of dz/dt=k/V[(a-z)(b-z)-(e+z)(w+z)/K].
export function reversibleEsterStep(a,b,e,w,K,exposure){
 if(![a,b,e,w,K,exposure].every(Number.isFinite)||Math.min(a,b,e,w,exposure)<0||K<=0)throw new RangeError('Invalid reversible reaction inputs');
 const A=1-1/K,B=-(a+b)-(e+w)/K,C=a*b-e*w/K,D=Math.sqrt(Math.max(0,B*B-4*A*C));
 if(D===0||C===0)return 0;
 const loss=-Math.expm1(-D*exposure),decay=1-loss;
 const z=2*C*loss/((D-B)+(D+B)*decay);
 return Math.max(-Math.min(e,w),Math.min(Math.min(a,b),z));
}
function vesselAmounts(s,v){return {acid:v.acid/ESTER_MW.acid-s.extent,alcohol:v.alcohol/ESTER_MW.alcohol-s.extent,ester:v.ester/ESTER_MW.ester+s.extent,water:v.water/ESTER_MW.water+s.extent};}
export function advanceEster(state,v,dt){
 validateEster(v,state);if(!Number.isFinite(dt)||dt<0||dt>120)throw new RangeError('Step must be 0–120 simulation minutes');
 const s={...state};if(!['reaction','cooling','draining','collecting'].includes(s.phase)||dt===0)return s;
 if(s.phase==='draining'||s.phase==='collecting'){
  const key=s.phase==='draining'?'drained':'collected',remaining=(1-s[key])*2,elapsed=Math.min(dt,remaining);
  s[key]=Math.min(1,s[key]+dt/2);s.time+=elapsed;if(s[key]===1)s.phase=key==='drained'?'upperReady':'collected';return s;
 }
 const n=Math.ceil(dt/.02),h=dt/n;
 for(let i=0;i<n;i++){
  const target=s.phase==='reaction'&&s.heater?v.setpoint:20,tm=target+(s.temperature-target)*Math.exp(-h/4);
  s.temperature=target+(s.temperature-target)*Math.exp(-h/2);
  {
   const q=vesselAmounts(s,v),{k,K}=esterConstants(tm,v);
   s.extent+=reversibleEsterStep(q.acid,q.alcohol,q.ester,q.water,K,k*h/(v.volume/1000));
  }
  s.time+=h;
 }
 return s;
}
export function esterResult(s,v){
 validateEster(v,s);const charged=s.phase!=='empty',separated=['settled','draining','upperReady','collecting','collected'].includes(s.phase),amounts=charged?vesselAmounts(s,v):{acid:0,alcohol:0,ester:0,water:0};
 if(separated)amounts.water+=v.wash/ESTER_MW.water;
 const {k,K}=esterConstants(s.temperature,v),Vo=v.organicVolume,Va=v.wash;
 // Effective distribution ratios are prescribed; phase existence is assumed.
 const ratios={acid:.2,alcohol:1.5,ester:v.partition,water:.01},upper={},lower={},waste={},product={},funnel={};
 for(const name of Object.keys(ESTER_MW)){
  const f=ratios[name]*Vo/(ratios[name]*Vo+Va);
  upper[name]=separated?amounts[name]*f:0;lower[name]=separated?amounts[name]-upper[name]:0;
  waste[name]=lower[name]*s.drained;product[name]=upper[name]*s.collected;funnel[name]=upper[name]*(1-s.collected)+lower[name]*(1-s.drained);
 }
 const mass=obj=>Object.entries(obj).reduce((sum,[name,n])=>sum+n*ESTER_MW[name],0);
 const expected=charged?v.acid+v.alcohol+v.water+v.ester+(separated?v.wash:0):0;
 const maxNew=Math.min(v.acid/ESTER_MW.acid,v.alcohol/ESTER_MW.alcohol),collectedEster=product.ester*ESTER_MW.ester;
 const equilibriumShift=reversibleEsterStep(amounts.acid,amounts.alcohol,amounts.ester,amounts.water,K,1e12);
 return {amounts,upper,lower,waste,product,funnel,mass:mass(amounts),expectedMass:expected,productMass:mass(product),wasteMass:mass(waste),funnelMass:mass(funnel),formed:charged?amounts.ester*ESTER_MW.ester:0,newEster:s.extent*ESTER_MW.ester,theoretical:(maxNew+v.ester/ESTER_MW.ester)*ESTER_MW.ester,collectedEster,recoveryPercent:charged?collectedEster/((maxNew+v.ester/ESTER_MW.ester)*ESTER_MW.ester)*100:0,organicEsterMassFraction:mass(product)>0?collectedEster/mass(product):0,K,rate:k/(v.volume/1000)*(amounts.acid*amounts.alcohol-amounts.ester*amounts.water/K),equilibriumEster:(amounts.ester+equilibriumShift)*ESTER_MW.ester,separated};
}
export function coolEster(s,v){validateEster(v,s);if(s.phase!=='reaction')throw new Error('Run the reaction before workup');return {...s,phase:'cooling',heater:false};}
export function settleEster(s,v){validateEster(v,s);if(s.phase!=='cooling'||s.temperature>30)throw new Error('Cool the virtual mixture below 30 °C before the prescribed separation');return {...s,phase:'settled'};}
export function drainEster(s,v){validateEster(v,s);if(s.phase!=='settled')throw new Error('Settle the prescribed phases first');return {...s,phase:'draining'};}
export function collectEster(s,v){validateEster(v,s);if(s.phase!=='upperReady')throw new Error('Drain the lower phase before changing receivers');return {...s,phase:'collecting'};}
