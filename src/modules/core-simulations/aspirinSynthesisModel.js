// Idealized teaching model. Kinetic/thermal/solubility parameters are user-defined
// examples, not measured aspirin synthesis data or a physical laboratory recipe.
export const ASPIRIN_MW={salicylic:138.122,anhydride:102.089,aspirin:180.159,acetic:60.052,water:18.015};
export const ASPIRIN_DEFAULTS={salicylicMass:2,anhydrideMass:5,volume:10,setpoint:55,kRef:.2,activationEnergy:45,solubility:3.3,recovery:.95,quenchWater:30};
export const aspirinInitial=()=>({time:0,temperature:20,exposure:0,phase:'empty',heater:false,dryingTime:0,tared:false,onBalance:false});
export function validateAspirin(v){
 const bounds={salicylicMass:[.1,5],anhydrideMass:[.1,8],volume:[8,60],setpoint:[25,80],kRef:[.001,2],activationEnergy:[0,100],solubility:[.1,20],recovery:[.5,1],quenchWater:[10,100]};
 for(const [key,[lo,hi]] of Object.entries(bounds))if(!Number.isFinite(v[key])||v[key]<lo||v[key]>hi)throw new RangeError(`${key} must be ${lo}–${hi}`);
 return v;
}
export function validateAspirinState(state){
 if(!['empty','reaction','quenched','filtered'].includes(state.phase))throw new RangeError('Unknown synthesis phase');
 for(const key of ['time','exposure','dryingTime'])if(!Number.isFinite(state[key])||state[key]<0)throw new RangeError(`Invalid ${key}`);
 if(!Number.isFinite(state.temperature)||state.temperature<0||state.temperature>100)throw new RangeError('Temperature must be 0–100 °C');
 if(state.phase==='filtered'){
  for(const key of ['collectedMass','retainedWater','filtrationTemperature'])if(!Number.isFinite(state[key])||state[key]<0)throw new RangeError(`Invalid ${key}`);
 }
 return state;
}
export function aspirinExtent(a,b,exposure){
 if(![a,b,exposure].every(Number.isFinite)||a<0||b<0||exposure<0)throw new RangeError('Invalid reaction amount or exposure');
 const low=Math.min(a,b),high=Math.max(a,b),delta=high-low;if(!low)return 0;
 if(delta<low*1e-8)return low*low*exposure/(1+low*exposure);
 const loss=-Math.expm1(-delta*exposure);
 return low*high*loss/(delta+low*loss);
}
export function aspirinRateConstant(temperature,v){
 if(!Number.isFinite(temperature)||temperature<0||temperature>100)throw new RangeError('Temperature must be 0–100 °C');
 return v.kRef*Math.exp(-v.activationEnergy*1000/8.314462618*(1/(temperature+273.15)-1/328.15));
}
export function advanceAspirin(state,v,dt){
 validateAspirin(v);validateAspirinState(state);if(!Number.isFinite(dt)||dt<0||dt>120)throw new RangeError('Step must be 0–120 minutes');
 const next={...state};if(!['reaction','quenched','filtered'].includes(state.phase))return next;
 const steps=Math.max(1,Math.ceil(dt/.01)),h=dt/steps;
 for(let i=0;i<steps;i++){
  const target=next.phase==='reaction'?(next.heater?v.setpoint:20):next.phase==='quenched'?5:20;
  const tau=next.phase==='quenched'?1.5:2;
  const t0=next.temperature,tm=target+(t0-target)*Math.exp(-h/(2*tau));
  next.temperature=target+(t0-target)*Math.exp(-h/tau);
  if(next.phase==='reaction')next.exposure+=aspirinRateConstant(tm,v)/(v.volume/1000)*h;
  if(next.phase==='filtered')next.dryingTime+=h;
  next.time+=h;
 }
 return next;
}
export function aspirinResult(state,v){
 validateAspirin(v);validateAspirinState(state);
 const mw=ASPIRIN_MW,a=v.salicylicMass/mw.salicylic,b=v.anhydrideMass/mw.anhydride;
 const charged=state.phase!=='empty',extent=charged?aspirinExtent(a,b,state.exposure):0;
 const quenched=['quenched','filtered'].includes(state.phase);
 const acidMoles=extent+(quenched?2*(b-extent):0),waterConsumed=quenched?(b-extent)*mw.water:0;
 const productMass=extent*mw.aspirin;
 const solubility=v.solubility*Math.exp(-12000/8.314462618*(1/((state.phase==='filtered'?state.filtrationTemperature:state.temperature)+273.15)-1/293.15));
 const solutionVolume=(v.volume+(quenched?v.quenchWater:0))/1000;
 const dissolved=quenched?Math.min(productMass,solubility*solutionVolume):productMass;
 const crystals=quenched?productMass-dissolved:0;
 // Freeze the collected mass at filtration; reheating/drying cannot create product.
 const collected=state.phase==='filtered'?state.collectedMass:0;
 const wetWater=state.phase==='filtered'?state.retainedWater*Math.exp(-state.dryingTime/3):0;
 const theoreticalMass=Math.min(a,b)*mw.aspirin;
 const ledger={salicylic:(charged?a-extent:0)*mw.salicylic,anhydride:charged&&!quenched?(b-extent)*mw.anhydride:0,aspirin:productMass,aceticAcid:charged?acidMoles*mw.acetic:0,water:quenched?v.quenchWater-waterConsumed:0};
 return {a,b,extent,theoreticalMass,limiting:a<=b?'Salicylic acid':'Acetic anhydride',conversion:charged?extent/Math.min(a,b):0,productMass,dissolved,crystals,collected,wetWater,balanceMass:collected+wetWater,yieldPercent:collected/theoreticalMass*100,waterConsumed,ledger,initialMass:charged?v.salicylicMass+v.anhydrideMass+(quenched?v.quenchWater:0):0,solubility};
}
export function quenchAspirin(state,v){
 if(state.phase!=='reaction')throw new Error('Charge and run the reaction before quenching');
 const result=aspirinResult(state,v);
 if(v.quenchWater<result.b*ASPIRIN_MW.water)throw new RangeError('Insufficient quench water');
 return {...state,phase:'quenched',heater:false};
}
export function filterAspirin(state,v){
 if(state.phase!=='quenched')throw new Error('Quench and crystallise before filtration');
 const result=aspirinResult(state,v);if(result.crystals<=0)throw new Error('No crystals available. Cool the quenched mixture first.');
 return {...state,phase:'filtered',heater:false,filtrationTemperature:state.temperature,collectedMass:result.crystals*v.recovery,retainedWater:Math.min(v.quenchWater-result.waterConsumed,result.crystals*.5),dryingTime:0};
}
