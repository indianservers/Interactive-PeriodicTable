import { linearRegression } from '../calculations/scientificCalculations.js';
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
export const dissolutionTimes=[0,5,10,15,20,30,45];

export function dissolutionProfile({rpm=50,temperature=37,pH=5.8,hardness=92,mediumFactor=1}={}){
 const rate=.071*Math.sqrt(rpm/50)*Math.exp(.025*(temperature-37))*clamp(1+(pH-5.8)*.035,.75,1.3)*mediumFactor*clamp(1-(hardness-92)*.002,.72,1.22);
 return dissolutionTimes.map(time=>({x:time,y:clamp(100*(1-Math.exp(-rate*time)),0,99.6)}));
}

export function vesselProfiles(settings={}){
 const factors=[.982,.997,1.015,1.004,.974,1.026];
 return factors.map((factor,vessel)=>dissolutionProfile({...settings,mediumFactor:(settings.mediumFactor||1)*factor}).map(point=>({...point,vessel:vessel+1})));
}

export function sampleWithReplacement({concentrationMgPerMl,sampleVolumeMl,mediumVolumeMl,replacement=true}){
 const concentration=Number(concentrationMgPerMl),sample=Number(sampleVolumeMl),volume=Number(mediumVolumeMl);
 if(!Number.isFinite(concentration)||concentration<0)throw new RangeError("concentration must be non-negative");
 if(!Number.isFinite(sample)||sample<=0||sample>=volume)throw new RangeError("sample volume must be greater than zero and below medium volume");
 return{removedMg:concentration*sample,remainingVolumeMl:replacement?volume:volume-sample,correctionFactor:replacement?volume/(volume-sample):1};
}

export function dissolutionAcceptance(values,{q=80,stage="S1"}={}){
 if(!Number.isFinite(q)||q<0||q>95)throw new RangeError("Q must be between 0 and 95 percent");
 const required=stage==='S1'?6:stage==='S2'?12:0;
 if(!required)throw new RangeError('Supported stages are S1 and S2');
 if(!Array.isArray(values)||values.length!==required)throw new TypeError(`${required} vessel values are required for ${stage}`);
 if(values.some(value=>!Number.isFinite(value)||value<0||value>100))throw new RangeError('Vessel percentages must lie between 0 and 100');
 const mean=values.reduce((sum,value)=>sum+value,0)/required;
 const threshold=stage==='S1'?q+5:q;
 const pass=stage==='S1'?values.every(value=>value>=threshold):mean>=q&&values.every(value=>value>=q-15);
 return{threshold,pass,mean};
}

export function kineticFits(profile){
 const usable=profile.filter(p=>p.x>0&&p.y>0&&p.y<100);
 if(usable.length<3)throw new RangeError('At least three non-zero release observations are required');
 const models=[
  ['Zero-order',p=>p.x,p=>p.y,(t,m,b)=>m*t+b,'k₀'],
  ['First-order',p=>p.x,p=>Math.log(1-p.y/100),(t,m,b)=>100*(1-Math.exp(m*t+b)),'k'],
  ['Higuchi',p=>Math.sqrt(p.x),p=>p.y,(t,m,b)=>m*Math.sqrt(t)+b,'kH'],
  ['Hixson–Crowell',p=>p.x,p=>Math.cbrt(1-p.y/100),(t,m,b)=>100*(1-(m*t+b)**3),'kHC'],
  ['Korsmeyer–Peppas',p=>Math.log(p.x),p=>Math.log(p.y/100),(t,m,b)=>100*Math.exp(b)*t**m,'n'],
  ['Weibull',p=>Math.log(p.x),p=>Math.log(-Math.log(1-p.y/100)),(t,m,b)=>100*(1-Math.exp(-Math.exp(b)*t**m)),'β'],
 ];
 return models.map(([name,tx,ty,predict,label])=>{
  const fit=linearRegression(usable.map(p=>({x:tx(p),y:ty(p)})));
  const mean=usable.reduce((sum,p)=>sum+p.y,0)/usable.length;
  const sse=usable.reduce((sum,p)=>sum+(p.y-predict(p.x,fit.slope,fit.intercept))**2,0);
  const sst=usable.reduce((sum,p)=>sum+(p.y-mean)**2,0);
  return{name,r2:sst?1-sse/sst:1,aic:usable.length*Math.log(Math.max(sse/usable.length,1e-20))+4,parameter:`${label} = ${Math.abs(fit.slope).toPrecision(4)}; intercept = ${fit.intercept.toPrecision(3)}`};
 });
}
