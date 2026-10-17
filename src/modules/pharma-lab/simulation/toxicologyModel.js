export const exposureScenarios={single:{label:'Single arithmetic example',doseMg:500},higher:{label:'Higher hypothetical exposure',doseMg:2000},total:{label:'Hypothetical total exposure',doseMg:4000}};
export function simulateToxicology({doseMg=500,weightKg=70,liver='normal',alcohol='none',repeated=false}={}){
 if(![doseMg,weightKg].every(Number.isFinite)||doseMg<=0||weightKg<=0)throw new RangeError('Dose and weight must be finite and greater than zero');
 return{doseMg,weightKg,mgPerKg:doseMg/weightKg,grams:doseMg/1000,context:[liver==='impaired'?'Liver disease requires case-specific evaluation.':null,alcohol!=='none'?'Alcohol exposure can change metabolism; no numeric adjustment is established by this calculator.':null,repeated?'Repeated exposures cannot be assessed with a single-dose concentration-time interpretation.':null].filter(Boolean)};
}
