// Lumped sensible-heat and homogeneous formal-component teaching model.
// Efficiencies, heat losses, heat capacities and kinetics are examples, not
// measured reactor performance. Reaction enthalpy and phase changes are omitted.
export const MW_ATOMS={salicylic:{C:7,H:6,O:3},anhydride:{C:4,H:6,O:3},aspirin:{C:9,H:8,O:4},acetic:{C:2,H:4,O:2},water:{H:2,O:1},benzamide:{C:7,H:7,N:1,O:1},base:{Na:1,O:1,H:1},benzoate:{C:7,H:5,O:2,Na:1},ammonia:{N:1,H:3}};
const AW={C:12.011,H:1.008,N:14.007,O:15.999,Na:22.98976928};
export const MW_MASS=Object.fromEntries(Object.entries(MW_ATOMS).map(([k,a])=>[k,Object.entries(a).reduce((m,[z,n])=>m+AW[z]*n,0)]));
export const MW_DEFAULTS={kind:'aspirin',salicylic:2,anhydride:3,benzamide:1.2,base:.8,water:.2,volume:10,power:300,target:68,minutes:3,ambient:20,vesselCapacity:60,otherCp:2,etaMW:.45,etaPlate:.2,lossMW:.4,lossPlate:.7,sensorBias:0,kRef:.25,kAnhydride:.08,kAspirin:.03,activation:45,catalyst:1};
export const MW_BOUNDS={salicylic:[.5,5],anhydride:[.1,8],benzamide:[.5,3],base:[.1,2],water:[0,30],volume:[5,80],power:[0,800],target:[25,90],minutes:[.5,20],ambient:[10,30],vesselCapacity:[20,200],otherCp:[1,3],etaMW:[.05,1],etaPlate:[.05,1],lossMW:[0,5],lossPlate:[0,5],sensorBias:[-15,15],kRef:[.005,1],kAnhydride:[0,.5],kAspirin:[0,.2],activation:[0,100],catalyst:[0,3]};
export function microwavePreset(kind){if(!['aspirin','benzamide'].includes(kind))throw RangeError('Unknown reaction preset');return kind==='benzamide'?{...MW_DEFAULTS,kind,water:20,volume:25,kRef:.15,activation:65}:{...MW_DEFAULTS};}
const instrument=(temperature=20)=>({temperature,acetyl:0,anhydrolysis:0,aspHydrolysis:0,hydrolysis:0,electric:0,absorbed:0,loss:0,tripped:false});
export const microwaveInitial=()=>({phase:'empty',time:0,elapsed:0,heating:false,doorClosed:true,mw:instrument(),plate:instrument()});
export function microwaveChargeMass(v){return v.kind==='aspirin'?v.salicylic+v.anhydride+v.water:v.benzamide+v.base+v.water;}
export function microwaveHeatCapacity(v){return v.vesselCapacity+4.18*v.water+v.otherCp*(microwaveChargeMass(v)-v.water);}
export function microwaveAmounts(s,v){if(v.kind==='aspirin')return {salicylic:v.salicylic/MW_MASS.salicylic-s.acetyl+s.aspHydrolysis,anhydride:v.anhydride/MW_MASS.anhydride-s.acetyl-s.anhydrolysis,aspirin:s.acetyl-s.aspHydrolysis,acetic:s.acetyl+2*s.anhydrolysis+s.aspHydrolysis,water:v.water/MW_MASS.water-s.anhydrolysis-s.aspHydrolysis};return {benzamide:v.benzamide/MW_MASS.benzamide-s.hydrolysis,base:v.base/MW_MASS.base-s.hydrolysis,benzoate:s.hydrolysis,ammonia:s.hydrolysis,water:v.water/MW_MASS.water};}
export function validateMicrowave(v,s){
 if(!['aspirin','benzamide'].includes(v?.kind))throw RangeError('Unknown reaction case');for(const [k,[lo,hi]] of Object.entries(MW_BOUNDS))if(!Number.isFinite(v[k])||v[k]<lo||v[k]>hi)throw RangeError(`Invalid ${k}: ${lo}–${hi}`);
 if(v.kind==='benzamide'&&v.water<5)throw RangeError('Aqueous benzamide model requires at least 5 g initial water');
 if(v.volume<v.water+1)throw RangeError('Effective reaction volume must exceed initial water volume by at least 1 mL');
 if(!s)return;if(!['empty','loaded'].includes(s.phase)||typeof s.heating!=='boolean'||typeof s.doorClosed!=='boolean'||!Number.isFinite(s.time)||s.time<0||!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>v.minutes*60+1e-7||s.elapsed>s.time+1e-7)throw RangeError('Invalid stage, switches or program clock');
 if(s.heating&&s.elapsed>=v.minutes*60)throw RangeError('Completed timer cannot remain armed');
 const C=microwaveHeatCapacity(v);for(const key of ['mw','plate']){const q=s[key];if(!q||typeof q.tripped!=='boolean'||!Number.isFinite(q.temperature)||q.temperature<(s.phase==='empty'?0:v.ambient-1e-7)||q.temperature>95+1e-7)throw RangeError('Temperature outside sensible-heat model');for(const k of ['acetyl','anhydrolysis','aspHydrolysis','hydrolysis','electric','absorbed','loss'])if(!Number.isFinite(q[k])||q[k]< -1e-10)throw RangeError(`Invalid ${key} ${k}`);
  if(Object.values(microwaveAmounts(q,v)).some(n=>n< -1e-10))throw RangeError('Reaction inventory exceeded');
  if(v.kind==='aspirin'&&q.hydrolysis!==0||v.kind==='benzamide'&&(q.acetyl!==0||q.anhydrolysis!==0||q.aspHydrolysis!==0))throw RangeError('Extent belongs to another reaction');
  if(Math.abs(q.absorbed-q.electric*(key==='mw'?v.etaMW:v.etaPlate))>1e-5||q.absorbed>q.electric+1e-6||s.phase!=='empty'&&Math.abs(q.absorbed-q.loss-C*(q.temperature-v.ambient))>1e-5)throw RangeError('Thermal energy ledger does not close');
  if(s.phase==='empty'&&(s.heating||s.time!==0||s.elapsed!==0||q.tripped||['acetyl','anhydrolysis','aspHydrolysis','hydrolysis','electric','absorbed','loss'].some(k=>q[k]!==0)))throw RangeError('Process state before loading');
 }
}
export function chargeMicrowave(s,v){validateMicrowave(v,s);if(s.phase!=='empty')throw Error('Reset before loading');return {...s,phase:'loaded',mw:instrument(v.ambient),plate:instrument(v.ambient)};}
export function armMicrowave(s,v){validateMicrowave(v,s);if(s.phase!=='loaded')throw Error('Load the matched charges first');return {...s,heating:true,elapsed:s.elapsed>=v.minutes*60-1e-8?0:s.elapsed};}
export function clearMicrowaveCutoffs(s,v){validateMicrowave(v,s);if(Math.max(s.mw.temperature,s.plate.temperature)>40.05)throw Error('Cool both model samples to 40 °C or below before clearing cutoffs');return {...s,mw:{...s.mw,tripped:false},plate:{...s.plate,tripped:false}};}
// Exact lumped linear heat flow, with event handling for ideal thermostat and
// independent 95 C hard cutoff. Returns the integrated sample temperature for
// the kinetic step. Input power is electrical, not automatically absorbed power.
export function microwaveThermalStep(q,v,key,dt,enabled){
 if(!['mw','plate'].includes(key)||!Number.isFinite(dt)||dt<0||dt>7200||typeof enabled!=='boolean')throw RangeError('Invalid thermal step');
 const C=microwaveHeatCapacity(v),eta=key==='mw'?v.etaMW:v.etaPlate,UA=key==='mw'?v.lossMW:v.lossPlate,Ta=v.ambient,target=v.target-v.sensorBias,P=eta*v.power;let remaining=dt,area=0;
 const segment=(absorbed,t)=>{if(t<=0)return;const before=q.temperature;let after,integral;if(UA===0){after=before+absorbed*t/C;integral=(before+after)*t/2;}else{const loss=-Math.expm1(-UA*t/C),eq=Ta+absorbed/UA;after=before+(eq-before)*loss;integral=eq*t+(before-eq)*C/UA*loss;}q.temperature=after;q.absorbed+=absorbed*t;q.electric+=absorbed*t/eta;q.loss+=UA===0?0:absorbed*t-C*(after-before);area+=integral;remaining-=t;};
 for(let event=0;remaining>1e-10&&event<8;event++){
  if(!enabled||q.tripped||P===0||target<=Ta){segment(0,remaining);break;}
  if(q.temperature>=95-1e-9&&target>=95){q.temperature=95;q.tripped=true;continue;}
  if(q.temperature>target+1e-9){const hit=UA>0&&target>Ta?C/UA*Math.log((q.temperature-Ta)/(target-Ta)):Infinity;segment(0,Math.min(remaining,hit));continue;}
  if(Math.abs(q.temperature-target)<=1e-9&&P>=UA*(target-Ta)){const t=remaining,needed=UA*(target-Ta);q.absorbed+=needed*t;q.electric+=needed*t/eta;q.loss+=needed*t;area+=q.temperature*t;remaining=0;break;}
  const limit=Math.min(target,95),eq=UA>0?Ta+P/UA:Infinity,hit=eq>limit?(UA>0?C/UA*Math.log((eq-q.temperature)/(eq-limit)):C*(limit-q.temperature)/P):Infinity;
  if(hit>=0&&hit<remaining){segment(P,hit);q.temperature=limit;if(limit===95)q.tripped=true;}else segment(P,remaining);
 }
 if(remaining>1e-8)throw Error('Thermostat event solver did not finish');return {temperatureIntegral:area};
}
const bimolecular=(a,b,exposure)=>{const low=Math.min(a,b),high=Math.max(a,b),d=high-low;if(low<=0||exposure===0)return 0;if(d<1e-14)return low*low*exposure/(1+low*exposure);const loss=-Math.expm1(-d*exposure);return low*high*loss/(d+low*loss);};
export function microwaveRate(temperature,v){return v.catalyst*Math.exp(-v.activation*1000/8.314462618*(1/(temperature+273.15)-1/333.15));}
function chemistry(q,v,temperature,seconds){const exposure=microwaveRate(temperature,v)*seconds/60/(v.volume/1000),amounts=()=>microwaveAmounts(q,v);if(v.kind==='benzamide'){const a=amounts();q.hydrolysis+=bimolecular(a.benzamide,a.base,v.kRef*exposure);return;}
 const anhHyd=h=>{const a=amounts();q.anhydrolysis+=bimolecular(a.anhydride,a.water,v.kAnhydride*exposure*h);},aspHyd=h=>{const a=amounts();q.aspHydrolysis+=bimolecular(a.aspirin,a.water,v.kAspirin*exposure*h);};
 anhHyd(.5);aspHyd(.5);const a=amounts();q.acetyl+=bimolecular(a.salicylic,a.anhydride,v.kRef*exposure);aspHyd(.5);anhHyd(.5);
}
export function advanceMicrowave(state,v,dt){validateMicrowave(v,state);if(!Number.isFinite(dt)||dt<0||dt>7200)throw RangeError('Step must be 0–7200 simulation seconds');const s={...state,mw:{...state.mw},plate:{...state.plate}};if(s.phase==='empty'||dt===0)return s;const n=Math.ceil(dt/.25),h=dt/n;
 for(let i=0;i<n;i++){const active=s.heating?Math.min(h,Math.max(0,v.minutes*60-s.elapsed)):0;for(const key of ['mw','plate']){let area=0;if(active>0)area+=microwaveThermalStep(s[key],v,key,active,key==='plate'||s.doorClosed).temperatureIntegral;if(h>active)area+=microwaveThermalStep(s[key],v,key,h-active,false).temperatureIntegral;chemistry(s[key],v,area/h,h);}if(active>0){s.elapsed+=active;if(s.elapsed>=v.minutes*60-1e-8){s.elapsed=v.minutes*60;s.heating=false;}}s.time+=h;}
 validateMicrowave(v,s);return s;
}
export function microwavePower(s,v,key){if(s.phase==='empty'||!s.heating||s[key].tripped||key==='mw'&&!s.doorClosed)return 0;const q=s[key],eta=key==='mw'?v.etaMW:v.etaPlate,UA=key==='mw'?v.lossMW:v.lossPlate,target=v.target-v.sensorBias;if(q.temperature>target+1e-7||target<=v.ambient)return 0;if(Math.abs(q.temperature-target)<=1e-7)return Math.min(v.power,Math.max(0,UA*(q.temperature-v.ambient)/eta));return v.power;}
export function microwaveResult(s,v){validateMicrowave(v,s);const C=microwaveHeatCapacity(v),product=v.kind==='aspirin'?'aspirin':'benzoate',theoretical=(v.kind==='aspirin'?Math.min(v.salicylic/MW_MASS.salicylic,v.anhydride/MW_MASS.anhydride):Math.min(v.benzamide/MW_MASS.benzamide,v.base/MW_MASS.base))*MW_MASS[product],result={capacity:C,theoretical,product};
 for(const key of ['mw','plate']){const q=s[key],amounts=s.phase==='empty'?Object.fromEntries(Object.keys(microwaveAmounts(q,v)).map(k=>[k,0])):microwaveAmounts(q,v),mass=Object.entries(amounts).reduce((m,[k,n])=>m+n*MW_MASS[k],0),productMass=amounts[product]*MW_MASS[product];result[key]={amounts,mass,expectedMass:s.phase==='empty'?0:microwaveChargeMass(v),productMass,yieldPercent:productMass/theoretical*100,sensible:s.phase==='empty'?0:C*(q.temperature-v.ambient),rejected:q.electric-q.absorbed,energyResidual:s.phase==='empty'?0:q.absorbed-q.loss-C*(q.temperature-v.ambient),power:microwavePower(s,v,key),energyPerGram:productMass>0?q.electric/1000/productMass:null};}return result;
}
export function parseMicrowaveNotebook(x){if(x?.schema!==1||typeof x.notes!=='string'||x.notes.length>100000||!Array.isArray(x.records)||x.records.length>2000)throw Error('Expected a version 1 notebook, at most 2000 records and 100000 note characters');for(const r of x.records){if(!r?.state||!r?.values)throw Error('Snapshot needs state and settings');validateMicrowave(r.values,r.state);}return {notes:x.notes,records:x.records};}
