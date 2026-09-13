export const COMPONENTS=Object.freeze([
  {id:'A',name:'Yellow component',color:'#f5b400',baseRf:.25,retention:3.2,width:.9,mass:23.7,purity:97.9,recovery:94.8,fractions:[6,8]},
  {id:'B',name:'Red component',color:'#ef2026',baseRf:.53,retention:6.1,width:1.862,mass:48.2,purity:98.6,recovery:96.4,fractions:[16,19]},
  {id:'C',name:'Blue component',color:'#0768e8',baseRf:.75,retention:9.8,width:1.221,mass:23.9,purity:98.1,recovery:95.6,fractions:[22,24]},
]);
export const clamp=(v,min,max)=>Math.min(max,Math.max(min,Number(v)||0));
export function rfValues(ethylAcetatePercent=30,frontDistance=8){const polarity=clamp(ethylAcetatePercent,10,40);return COMPONENTS.map((c,i)=>{const slopes=[.0105,.0107,.011][i];const rf=clamp(c.baseRf+(polarity-30)*slopes,.02,.95);return{...c,rf,distance:rf*frontDistance}})}
export function retentionFactor(retentionTime,deadTime=1.5){return(Math.max(deadTime,retentionTime)-deadTime)/deadTime}
export function resolution(first,second){return 2*(second.retention-first.retention)/(first.width+second.width)}
export function chromatogram(time,components=COMPONENTS){return components.reduce((sum,c)=>sum+(200*c.mass/100)*Math.exp(-.5*((time-c.retention)/(c.width/2.355))**2),8)}
export function bedVolume(diameterMm=20,heightMm=180,porosity=.5){const radiusCm=diameterMm/20,heightCm=heightMm/10;return Math.PI*radiusCm**2*heightCm*(1-porosity)}
export function fractionAt(volumeMl,fractionSize=5){return Math.max(1,Math.ceil(volumeMl/fractionSize))}
export function separationSummary(feedMass=100){const recovered=COMPONENTS.reduce((s,c)=>s+c.mass,0);return{feedMass,recovered,recoveryPercent:recovered/feedMass*100,resolutionAB:resolution(COMPONENTS[0],COMPONENTS[1]),resolutionBC:resolution(COMPONENTS[1],COMPONENTS[2])}}
