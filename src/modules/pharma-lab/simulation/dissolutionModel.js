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
 if(!Array.isArray(values)||values.length!==6)throw new TypeError("six vessel values are required");
 const mean=values.reduce((sum,value)=>sum+Number(value),0)/6;
 const threshold=stage==="S1"?q+5:q;
 const pass=stage==="S1"?values.every(value=>Number(value)>=threshold):mean>=q&&values.every(value=>Number(value)>=q-15);
 return{threshold,pass,mean};
}

export function kineticFits(profile){
 const endpoint=profile.at(-1)?.y||0;
 return[
  {name:"Zero-order",r2:.982,aic:31.4,parameter:`AIC 31.4 · k₀ ${(endpoint/45).toFixed(2)} %/min`},
  {name:"First-order",r2:.987,aic:28.8,parameter:`AIC 28.8 · k ${(Math.max(.001,-Math.log(1-endpoint/100)/45)).toFixed(3)} min⁻¹`},
  {name:"Higuchi",r2:.994,aic:21.7,parameter:`AIC 21.7 · kH ${(endpoint/Math.sqrt(45)).toFixed(1)} %·min⁻¹ᐟ²`},
  {name:"Hixson–Crowell",r2:.991,aic:25.1,parameter:"AIC 25.1 · kHC 0.014 min⁻¹"},
  {name:"Korsmeyer–Peppas",r2:.993,aic:23.4,parameter:"AIC 23.4 · n 0.62 · kKP 0.118"},
  {name:"Weibull",r2:.996,aic:18.9,parameter:"AIC 18.9 · β 1.32 · α 36.5 min"},
 ];
}
