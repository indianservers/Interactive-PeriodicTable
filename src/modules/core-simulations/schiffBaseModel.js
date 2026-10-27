// Ideal, fixed nominal liquid-volume model. Coefficients are educational examples,
// not fitted benzylideneaniline kinetics, activities or solubility measurements.
export const SCHIFF_ATOMS={aldehyde:{C:7,H:6,O:1},amine:{C:6,H:7,N:1},imine:{C:13,H:11,N:1},water:{H:2,O:1},ethanol:{C:2,H:6,O:1}};
const AW={C:12.011,H:1.008,N:14.007,O:15.999};
export const SCHIFF_MW=Object.fromEntries(Object.entries(SCHIFF_ATOMS).map(([k,a])=>[k,Object.entries(a).reduce((m,[z,n])=>m+AW[z]*n,0)]));
// Conservative crystallisation-domain cutoff below supplier/NIST fusion data.
// Above it all product is treated as homogeneous liquid-phase material; no
// claim of liquid-liquid phase stability or melting-point prediction is made.
export const SCHIFF_SOLID_MAX_T=50;
export const SCHIFF_DEFAULTS={aldehyde:2.12,amine:1.86,imine:0,water:.05,ethanol:12,volume:20,setpoint:68,catalyst:1,kRef:.08,K:4,activation:35,enthalpy:-5,solubility:.02,dissolutionEnthalpy:20,coolTo:10,removal:.08,recovery:.95};
export const schiffInitial=()=>({phase:'empty',time:0,temperature:20,extent:0,removedWater:0,heater:false,trap:false,collected:0,wetSolvent:0,evaporated:0});
export const SCHIFF_BOUNDS={aldehyde:[.5,5],amine:[.5,5],imine:[0,3],water:[0,2],ethanol:[5,30],volume:[10,80],setpoint:[25,75],catalyst:[0,3],kRef:[.005,.3],K:[.2,20],activation:[0,70],enthalpy:[-25,25],solubility:[.001,.2],dissolutionEnthalpy:[0,40],coolTo:[5,25],removal:[0,.3],recovery:[.5,1]};
export function validateSchiff(v,s){
 for(const [k,[a,b]] of Object.entries(SCHIFF_BOUNDS))if(!Number.isFinite(v[k])||v[k]<a||v[k]>b)throw RangeError(`Invalid ${k}: ${a}–${b}`);
 if(!s)return;
 if(!['empty','reaction','cooling','collected'].includes(s.phase))throw RangeError('Unknown condensation phase');
 for(const k of ['time','temperature','extent','removedWater','collected','wetSolvent','evaporated'])if(!Number.isFinite(s[k]))throw RangeError(`Non-finite ${k}`);
 if(typeof s.heater!=='boolean'||typeof s.trap!=='boolean'||s.time<0||s.temperature<0||s.temperature>80)throw RangeError('Invalid clock, temperature or switches');
 const A=v.aldehyde/SCHIFF_MW.aldehyde,B=v.amine/SCHIFF_MW.amine,P=v.imine/SCHIFF_MW.imine,W=v.water/SCHIFF_MW.water;
 if(s.extent< -P-1e-12||s.extent>Math.min(A,B)+1e-12||s.removedWater<0||W+s.extent-s.removedWater< -1e-12||s.collected<0||s.collected>P+s.extent+1e-12||s.wetSolvent<0||s.evaporated<0||s.wetSolvent+s.evaporated>v.ethanol+1e-12)throw RangeError('Inventory exceeded');
 if(s.phase==='empty'&&['time','extent','removedWater','collected','wetSolvent','evaporated'].some(k=>s[k]!==0))throw RangeError('Uncharged vessel has process state');
 if(s.phase!=='collected'&&(s.collected!==0||s.wetSolvent!==0||s.evaporated!==0))throw RangeError('Isolation occurred before collection');
 if(s.phase!=='reaction'&&(s.heater||s.trap))throw RangeError('Heating or water capture outside reaction stage');
}
export function schiffConstants(t,v){
 if(!Number.isFinite(t)||t<0||t>80)throw RangeError('Unsupported temperature');
 const d=1/(t+273.15)-1/313.15,ds=1/(t+273.15)-1/293.15,R=8.314462618;
 return {k:v.kRef*v.catalyst*Math.exp(-v.activation*1000/R*d),K:v.K*Math.exp(-v.enthalpy*1000/R*d),solubility:v.solubility*Math.exp(-v.dissolutionEnthalpy*1000/R*ds),solidAllowed:t<=SCHIFF_SOLID_MAX_T};
}
function contents(s,v){return {aldehyde:v.aldehyde/SCHIFF_MW.aldehyde-s.extent,amine:v.amine/SCHIFF_MW.amine-s.extent,imine:v.imine/SCHIFF_MW.imine+s.extent-s.collected,water:v.water/SCHIFF_MW.water+s.extent-s.removedWater,ethanol:(v.ethanol-s.wetSolvent-s.evaporated)/SCHIFF_MW.ethanol};}
export function schiffResult(s,v){
 validateSchiff(v,s);const charged=s.phase!=='empty',q=charged?contents(s,v):Object.fromEntries(Object.keys(SCHIFF_MW).map(k=>[k,0])),c=schiffConstants(s.temperature,v),V=v.volume/1000,dissolved=c.solidAllowed?Math.min(q.imine,c.solubility*V):q.imine,solid=Math.max(0,q.imine-dissolved),formed=charged?(v.imine/SCHIFF_MW.imine+s.extent)*SCHIFF_MW.imine:0;
 const mass=a=>Object.entries(a).reduce((sum,[k,n])=>sum+n*SCHIFF_MW[k],0),totalMass=mass(q)+s.removedWater*SCHIFF_MW.water+s.collected*SCHIFF_MW.imine+s.wetSolvent+s.evaporated,initialMass=charged?v.aldehyde+v.amine+v.imine+v.water+v.ethanol:0;
 const theoretical=(Math.min(v.aldehyde/SCHIFF_MW.aldehyde,v.amine/SCHIFF_MW.amine)+v.imine/SCHIFF_MW.imine)*SCHIFF_MW.imine;
 return {amounts:q,...c,dissolved,solid,formed,theoretical,collected:s.collected*SCHIFF_MW.imine,wetCake:s.collected*SCHIFF_MW.imine+s.wetSolvent,yieldPercent:s.collected*SCHIFF_MW.imine/theoretical*100,totalMass,initialMass,rate:charged&&s.phase!=='collected'?c.k/V*(q.aldehyde*q.amine-dissolved*q.water/c.K):0,waterGenerated:s.extent*SCHIFF_MW.water,waterCaptured:s.removedWater*SCHIFF_MW.water};
}
// Monotone backward-Euler reaction solve. Equilibrium precipitation is imposed
// inside the solve, so only dissolved imine participates in hydrolysis. Both
// reaction directions respect limiting inventories without arbitrary yield caps.
export function advanceSchiff(state,v,dt){
 validateSchiff(v,state);if(!Number.isFinite(dt)||dt<0||dt>120)throw RangeError('Step must be 0–120 simulation minutes');
 const s={...state};if(s.phase==='empty'||dt===0)return s;
 const count=Math.ceil(dt/.02),h=dt/count,V=v.volume/1000;
 for(let j=0;j<count;j++){
  const target=s.phase==='reaction'&&s.heater?v.setpoint:s.phase==='cooling'?v.coolTo:20;
  const mid=target+(s.temperature-target)*Math.exp(-h/6);s.temperature=target+(s.temperature-target)*Math.exp(-h/3);
  if(s.phase==='collected'){const before=s.wetSolvent;s.wetSolvent*=Math.exp(-h/3);s.evaporated+=before-s.wetSolvent;}
  else{
   const q=contents(s,v),c=schiffConstants(mid,v),capture=s.phase==='reaction'&&s.trap;
   // Symmetric removal split; ideal selective capture, no implied azeotropic data.
   const first=capture?q.water*(-Math.expm1(-v.removal*h/2)):0;s.removedWater+=first;q.water-=first;
   if(c.k>0){let lo=-Math.min(q.imine,q.water),hi=Math.min(q.aldehyde,q.amine);
    for(let i=0;i<42;i++){const z=(lo+hi)/2,product=c.solidAllowed?Math.min(q.imine+z,c.solubility*V):q.imine+z,f=z-h*c.k/V*((q.aldehyde-z)*(q.amine-z)-product*(q.water+z)/c.K);if(f>0)hi=z;else lo=z;}
    s.extent+=(lo+hi)/2;
   }
   if(capture){const water=v.water/SCHIFF_MW.water+s.extent-s.removedWater;s.removedWater+=water*(-Math.expm1(-v.removal*h/2));}
  }
  s.time+=h;
 }
 validateSchiff(v,s);return s;
}
export function chargeSchiff(s,v){validateSchiff(v,s);if(s.phase!=='empty')throw Error('Reset before charging');return {...s,phase:'reaction'};}
export function coolSchiff(s,v){validateSchiff(v,s);if(s.phase!=='reaction')throw Error('Charge the condensation vessel first');return {...s,phase:'cooling',heater:false,trap:false};}
export function collectSchiff(s,v){validateSchiff(v,s);const r=schiffResult(s,v);if(s.phase!=='cooling'||s.temperature>25.05||r.solid<1e-12)throw Error('Cool to 25 °C (±0.05 °C) or below with model solids present');const collected=r.solid*v.recovery;return {...s,phase:'collected',collected,wetSolvent:Math.min(v.ethanol,collected*SCHIFF_MW.imine*.2)};}
export function parseSchiffNotebook(x){
 if(x?.schema!==1||!Array.isArray(x.records)||x.records.length>2000||typeof x.notes!=='string'||x.notes.length>100000)throw Error('Expected a version 1 notebook with at most 2000 snapshots and 100000 note characters.');
 for(const r of x.records){if(!r||typeof r!=='object'||!r.state||typeof r.state!=='object'||!r.values||typeof r.values!=='object')throw Error('Each snapshot needs a complete model state and parameter set.');validateSchiff(r.values,r.state);}
 return {records:x.records,notes:x.notes};
}
