export const PEROXIDE_DEFAULTS={c0:.2,volume:25,temperature:25,kRef:.023,activation:45,multiplier:1,gasTemperature:25,pressure:101.325,wet:true,efficiency:1,capacity:100,offset:0,resolution:.1};
export const PEROXIDE_BOUNDS={c0:[.05,.4],volume:[10,40],temperature:[20,45],kRef:[.002,.08],activation:[0,80],multiplier:[0,3],gasTemperature:[20,35],pressure:[80,110],efficiency:[0,1],capacity:[20,100],offset:[-3,3]};
export const PEROXIDE_R=8.31446261815324; // J/(mol K) = kPa L/(mol K).
export const PEROXIDE_MASS={peroxide:34.014,water:18.015,oxygen:31.998};
export const PEROXIDE_SOURCES=[['OpenStax: integrated rate laws','https://openstax.org/books/chemistry-2e/pages/12-4-integrated-rate-laws'],['NIST: water vapor-pressure correlation','https://webbook.nist.gov/cgi/cbook.cgi?ID=C7732185&Type=ANTOINE']];
export function validatePeroxideValues(v){
 if(!v||typeof v!=='object')throw new RangeError('Invalid kinetic setup.');
 for(const [key,[lo,hi]] of Object.entries(PEROXIDE_BOUNDS))if(!Number.isFinite(v[key])||v[key]<lo||v[key]>hi)throw new RangeError(`${key} must be ${lo}–${hi}.`);
 if(typeof v.wet!=='boolean'||![.05,.1,.2,.5].includes(v.resolution))throw new RangeError('Invalid gas state or volume resolution.');
 return Object.fromEntries(Object.keys(PEROXIDE_DEFAULTS).map(key=>[key,v[key]]));
}
export function peroxideWaterPressure(temperature){
 if(!Number.isFinite(temperature)||temperature<20||temperature>35)throw new RangeError('Collector temperature must be 20–35 °C.');
 // NIST/Bridgeman & Aldrich: log10(P/bar)=A-B/(T/K+C).
 // A 1 K linear pressure bridge avoids extending either fitted range.
 const T=temperature+273.15,low=t=>100*10**(5.40221-1838.675/(t-31.737)),high=t=>100*10**(5.20389-1733.926/(t-39.485));
 return T<=303?low(T):T>=304?high(T):low(303)+(T-303)*(high(304)-low(303));
}
export function peroxideRate(v){validatePeroxideValues(v);return v.kRef*v.multiplier*Math.exp(-v.activation*1000/PEROXIDE_R*(1/(v.temperature+273.15)-1/298.15));}
export function peroxideGasFactor(v){validatePeroxideValues(v);const vapor=v.wet?peroxideWaterPressure(v.gasTemperature):0;return 1000*PEROXIDE_R*(v.gasTemperature+273.15)/(v.pressure-vapor);}
const quantize=(x,res)=>Math.round(x/res)*res;
export function peroxideInitial(){return {phase:'empty',time:0,zeroReading:null};}
export function validatePeroxideState(s,v){
 validatePeroxideValues(v);
 if(!s||!['empty','loaded'].includes(s.phase)||!Number.isFinite(s.time)||s.time<0||s.time>240||(s.phase==='empty'&&s.time!==0))throw new RangeError('Invalid experiment time/state.');
 if(s.zeroReading!==null&&(!Number.isFinite(s.zeroReading)||Math.abs(s.zeroReading-quantize(v.offset,v.resolution))>1e-9))throw new RangeError('Zero reading does not match the configured empty instrument.');
 return {phase:s.phase,time:s.time,zeroReading:s.zeroReading};
}
export function tarePeroxide(s,v){validatePeroxideState(s,v);if(s.phase!=='empty')throw new RangeError('Tare the empty syringe before charging.');return {...s,zeroReading:quantize(v.offset,v.resolution)};}
export function chargePeroxide(s,v){validatePeroxideState(s,v);if(s.phase!=='empty')throw new RangeError('Start a new run before charging again.');return {...s,phase:'loaded'};}
export function advancePeroxide(s,v,minutes){validatePeroxideState(s,v);if(s.phase!=='loaded')throw new RangeError('Charge the vessel first.');if(!Number.isFinite(minutes)||minutes<0||minutes>240)throw new RangeError('Advance must be 0–240 min.');return {...s,time:Math.min(240,s.time+minutes)};}
export function peroxideResult(s,v){
 validatePeroxideState(s,v);const loaded=s.phase==='loaded',k=peroxideRate(v),initial=loaded?v.c0*v.volume/1000:0,remaining=initial*Math.exp(-k*s.time),consumed=initial*(-Math.expm1(-k*s.time)),oxygen=consumed/2,factor=peroxideGasFactor(v),collected=Math.min(oxygen*v.efficiency,v.capacity/factor),vented=Math.max(0,oxygen-collected),physicalVolume=collected*factor,rawVolume=quantize(physicalVolume+v.offset,v.resolution),measuredVolume=rawVolume-(s.zeroReading??0),apparentConcentration=loaded?v.c0-2*(measuredVolume/factor)/(v.volume/1000):null;
 return {k,halfLife:k>0?Math.log(2)/k:null,initial,remaining,waterFormed:consumed,oxygen,collected,vented,physicalVolume,rawVolume,measuredVolume,apparentConcentration,concentration:loaded?remaining/(v.volume/1000):null,conversion:initial?consumed/initial:0,vaporPressure:v.wet?peroxideWaterPressure(v.gasTemperature):0,factor,theoreticalVolume:initial/2*factor,flow:loaded?k*remaining/2*factor:0,atCapacity:loaded&&oxygen*v.efficiency>=v.capacity/factor-1e-12,reactiveMass:remaining*PEROXIDE_MASS.peroxide+consumed*PEROXIDE_MASS.water+oxygen*PEROXIDE_MASS.oxygen,initialReactiveMass:initial*PEROXIDE_MASS.peroxide,quantizationBound:v.resolution*(s.zeroReading===null?.5:1)};
}
function validateRun(run){if(!Number.isInteger(run)||run<1||run>1_000_000)throw new RangeError('Invalid run number.');}
export function nextPeroxideRun(records,current){
 validateRun(current);if(!Array.isArray(records)||records.length>2000)throw new RangeError('Invalid notebook size.');
 const used=new Set([current]);for(const r of records){validateRun(r.run);used.add(r.run);}
 const next=Math.max(...used)+1;if(next<=1_000_000)return next;
 // Imported high IDs must not permanently prevent starting an experiment.
 for(let id=1;id<=used.size+1;id++)if(!used.has(id))return id;
 throw new RangeError('No free run identifier.');
}
export function recordPeroxide(run,values,state){validateRun(run);const v=validatePeroxideValues(values),s=validatePeroxideState(state,v);if(s.phase!=='loaded')throw new RangeError('Record only a charged experiment.');return {run,values:v,state:s};}
export function peroxideObservation(record){const r=recordPeroxide(record.run,record.values,record.state),result=peroxideResult(r.state,r.values),usable=!result.atCapacity&&result.apparentConcentration>0;return {...r,result,usable,logRatio:usable?Math.log(result.apparentConcentration/r.values.c0):null};}
export function fitPeroxide(records,run){
 validateRun(run);const rows=records.filter(r=>r.run===run).map(peroxideObservation).sort((a,b)=>a.state.time-b.state.time);
 if(rows.length){const signature=r=>JSON.stringify([r.values,r.state.zeroReading]);if(rows.some(r=>signature(r)!==signature(rows[0]))||new Set(rows.map(r=>r.state.time)).size!==rows.length)throw new RangeError('A run must have consistent setup, calibration and unique observation times.');}
 const points=rows.filter(r=>r.usable),warnings=[];
 if(rows.some(r=>r.result.atCapacity))warnings.push('Capacity-limited readings excluded; overflow gas is not measured.');
 if(rows.some(r=>r.result.apparentConcentration<=0))warnings.push('Nonpositive apparent concentration excluded; no logarithm is taken.');
 if(rows.some(r=>r.values.efficiency<1))warnings.push('Undercollection configured: fitted k is apparent and may be biased.');
 if(rows.some(r=>r.state.zeroReading===null))warnings.push('Empty-instrument zero was not checked; offsets can bias the fit.');
 if(points.length<3)return {points,rows,warnings,fit:null,reason:'Record at least three usable, distinct times in one run.'};
 const n=points.length,mx=points.reduce((a,r)=>a+r.state.time,0)/n,my=points.reduce((a,r)=>a+r.logRatio,0)/n,sxx=points.reduce((a,r)=>a+(r.state.time-mx)**2,0),sxy=points.reduce((a,r)=>a+(r.state.time-mx)*(r.logRatio-my),0);
 if(sxx<1e-12)return {points,rows,warnings,fit:null,reason:'Observation times have insufficient spread.'};
 const slope=sxy/sxx,intercept=my-slope*mx,sse=points.reduce((a,r)=>a+(r.logRatio-intercept-slope*r.state.time)**2,0),sst=points.reduce((a,r)=>a+(r.logRatio-my)**2,0),k=-slope,se=Math.sqrt(sse/(n-2)/sxx),r2=sst>1e-20?1-sse/sst:null;
 if(k<=0)warnings.push('No positive decay constant is resolved by these readings.');
 return {points,rows,warnings,fit:{k,intercept,se,r2,halfLife:k>0?Math.log(2)/k:null,n,reference:peroxideRate(points[0].values),suitable:warnings.length===0},reason:null};
}
export function parsePeroxideNotebook(input){
 const data=typeof input==='string'?JSON.parse(input):input;
 if(!data||data.schema!==1||data.lab!=='h2o2-kinetics'||!Array.isArray(data.records)||data.records.length>2000||typeof data.notes!=='string'||data.notes.length>100000)throw new RangeError('Invalid peroxide notebook.');
 const records=data.records.map(r=>{if(!r||typeof r!=='object')throw new RangeError('Invalid observation.');return recordPeroxide(r.run,r.values,r.state);});
 for(const run of new Set(records.map(r=>r.run)))fitPeroxide(records,run);
 return {schema:1,lab:'h2o2-kinetics',records,notes:data.notes};
}
export function parsePeroxideWorkspace(input){
 const data=typeof input==='string'?JSON.parse(input):input;
 if(!data||data.schema!==1||![.25,.5,1,2,4].includes(data.speed))throw new RangeError('Invalid peroxide workspace.');
 validateRun(data.run);validateRun(data.selectedRun);const values=validatePeroxideValues(data.values),state=validatePeroxideState(data.state,values),notebook=parsePeroxideNotebook(data.notebook);
 const matching=notebook.records.filter(r=>r.run===data.run);if(matching.some(r=>JSON.stringify([r.values,r.state.zeroReading])!==JSON.stringify([values,state.zeroReading])||r.state.time>state.time+1e-9)||(matching.length&&state.phase!=='loaded'))throw new RangeError('Active run conflicts with recorded setup or time.');
 if(data.selectedRun!==data.run&&!notebook.records.some(r=>r.run===data.selectedRun))throw new RangeError('Selected analysis run is missing.');
 return {schema:1,run:data.run,selectedRun:data.selectedRun,values,state,speed:data.speed,notebook};
}
export function peroxideCsv(records){const q=v=>`"${String(v??'').replaceAll('"','""')}"`;return [['run','time_min','reaction_C','gas_C','pressure_kPa','raw_mL','zero_reading_mL','corrected_mL','model_H2O2_M','apparent_H2O2_M','oxygen_generated_mol','oxygen_equivalent_measured_mol','oxygen_equivalent_unmeasured_mol','capacity_limited'],...records.map(r=>{const a=peroxideObservation(r),x=a.result;return [r.run,r.state.time,r.values.temperature,r.values.gasTemperature,r.values.pressure,x.rawVolume.toFixed(r.values.resolution===.05?2:1),r.state.zeroReading===null?null:r.state.zeroReading.toFixed(r.values.resolution===.05?2:1),x.measuredVolume.toFixed(r.values.resolution===.05?2:1),x.concentration,x.apparentConcentration,x.oxygen,x.collected,x.vented,x.atCapacity];})].map(row=>row.map(q).join(',')).join('\n');}
// Body is an ideal conical frustum (50 mL at y=1.4 model units).
export function peroxideLiquidHeight(volume){if(!Number.isFinite(volume)||volume<0||volume>50)throw new RangeError('Flask fill must be 0–50 mL.');const a=.72,b=(.24-.72)/1.4,total=Math.PI*(a*a*1.4+a*b*1.4**2+b*b*1.4**3/3);let lo=0,hi=1.4;for(let i=0;i<60;i++){const y=(lo+hi)/2,v=Math.PI*(a*a*y+a*b*y*y+b*b*y*y*y/3);if(v/total<volume/50)lo=y;else hi=y;}return (lo+hi)/2;}
