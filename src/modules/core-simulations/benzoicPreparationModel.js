// Idealized virtual pathway, not a physical preparation protocol.
// Normalized extents use one initial benzyl-chloride equivalent. Actual amounts
// in the inventory are mol. Kinetics/solubility are explicitly unfitted examples.
export const BENZOIC_DEFAULTS={mass:2.5,permanganate:5,base:1.5,volume:100,setpoint:80,coolTo:10,hydrolysisK:.12,oxidationK:.3,activation:40,acid:3,solubility20:.028,recovery:.95};
export const BENZOIC_ATOMS={
 benzylChloride:{C:7,H:7,Cl:1},benzylAlcohol:{C:7,H:8,O:1},benzoate:{C:7,H:5,O:2},benzoicAcid:{C:7,H:6,O:2},
 permanganate:{Mn:1,O:4},manganeseDioxide:{Mn:1,O:2},hydroxide:{O:1,H:1},hydrogen:{H:1},chloride:{Cl:1},potassium:{K:1},sodium:{Na:1},sulfate:{S:1,O:4},water:{H:2,O:1},
};
export const BENZOIC_CHARGES={benzoate:-1,permanganate:-1,hydroxide:-1,hydrogen:1,chloride:-1,potassium:1,sodium:1,sulfate:-2};
const AW={C:12.011,H:1.008,Cl:35.45,O:15.999,Mn:54.938044,K:39.0983,Na:22.98976928,S:32.06};
export const BENZOIC_MW=Object.fromEntries(Object.entries(BENZOIC_ATOMS).map(([name,atoms])=>[name,Object.entries(atoms).reduce((a,[e,n])=>a+AW[e]*n,0)]));
export const BENZOIC_PHASES=['empty','hydrolysis','oxidation','quenched','clarified','acidified','collected'];
export const benzoicInitial=()=>({phase:'empty',time:0,temperature:20,hydrolysis:0,oxidation:0,heater:false,quench:0,acidAdded:0,dryingTime:0,collectedMass:0,retainedWater:0,collectionTemperature:20});
export function validateBenzoic(v,s){
 const bounds={mass:[.5,5],permanganate:[.2,10],base:[.2,3],volume:[50,250],setpoint:[20,95],coolTo:[5,30],hydrolysisK:[.01,1],oxidationK:[.01,1],activation:[0,80],acid:[.1,6],solubility20:[.005,.1],recovery:[.5,1]};
 for(const [k,[lo,hi]] of Object.entries(bounds))if(!Number.isFinite(v[k])||v[k]<lo||v[k]>hi)throw new RangeError(`Invalid ${k}: ${lo}–${hi}`);
 if(s){
  if(!BENZOIC_PHASES.includes(s.phase))throw new RangeError('Invalid preparation phase');
  for(const k of ['time','hydrolysis','oxidation','quench','acidAdded','dryingTime','collectedMass','retainedWater'])if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError(`Invalid ${k}`);
  if(!Number.isFinite(s.temperature)||s.temperature<0||s.temperature>100)throw new RangeError('Invalid temperature');
  const n=v.mass/BENZOIC_MW.benzylChloride,r=v.permanganate/(BENZOIC_MW.permanganate+AW.K)/n;
  if(s.hydrolysis>1+1e-9||s.oxidation>s.hydrolysis+1e-9||4/3*s.oxidation>r+1e-9||v.base-s.hydrolysis+s.oxidation/3< -1e-9)throw new RangeError('Reaction extent exceeds available material');
  const postQuench=['quenched','clarified','acidified','collected'].includes(s.phase);
  if(s.quench>r-4/3*s.oxidation+1e-9||postQuench&&Math.abs(s.quench-(r-4/3*s.oxidation))>1e-8)throw new RangeError('Invalid scavenged oxidant amount');
  if(!postQuench&&s.quench!==0||s.acidAdded>6||!['acidified','collected'].includes(s.phase)&&s.acidAdded!==0)throw new RangeError('Invalid workup additions');
  if(s.phase==='collected'&&(!Number.isFinite(s.collectionTemperature)||s.collectionTemperature<0||s.collectionTemperature>100))throw new RangeError('Invalid collection temperature');
  if(s.phase==='empty'&&(s.hydrolysis!==0||s.oxidation!==0)||s.phase==='hydrolysis'&&s.oxidation!==0)throw new RangeError('Reaction extent is incompatible with the stage');
  if(s.phase!=='collected'&&(s.collectedMass!==0||s.retainedWater!==0||s.dryingTime!==0))throw new RangeError('Product cannot be collected before filtration');
  if(s.collectedMass>s.oxidation*n*BENZOIC_MW.benzoicAcid+1e-9)throw new RangeError('Collected product exceeds formed product');
  if(s.retainedWater>v.volume*.9982+4/3*s.oxidation*n*BENZOIC_MW.water+1e-9)throw new RangeError('Cake water exceeds the water inventory');
 }
}
function extent(a,b,kdt){
 const lo=Math.max(0,Math.min(a,b)),hi=Math.max(a,b),d=hi-lo;if(!lo)return 0;
 if(d<1e-8)return lo*lo*kdt/(1+lo*kdt);
 const loss=-Math.expm1(-d*kdt);return lo*hi*loss/(d+lo*loss);
}
function ratios(v){const n=v.mass/BENZOIC_MW.benzylChloride;return {n,r:v.permanganate/(BENZOIC_MW.permanganate+AW.K)/n};}
export function advanceBenzoic(state,v,dt){
 validateBenzoic(v,state);if(!Number.isFinite(dt)||dt<0||dt>120)throw new RangeError('Step must be 0–120 min');
 const s={...state};if(s.phase==='empty'||dt===0)return s;
 const {r}=ratios(v),steps=Math.ceil(dt/.01),h=dt/steps;
 for(let i=0;i<steps;i++){
  const reactive=['hydrolysis','oxidation'].includes(s.phase),target=reactive?(s.heater?v.setpoint:20):s.phase==='acidified'?v.coolTo:20;
  const tm=target+(s.temperature-target)*Math.exp(-h/6);
  s.temperature=target+(s.temperature-target)*Math.exp(-h/3);
  if(reactive){
   const factor=Math.exp(-v.activation*1000/8.314462618*(1/(tm+273.15)-1/333.15));
   const hydro=()=>{const oh=Math.max(0,v.base-s.hydrolysis+s.oxidation/3);s.hydrolysis+=extent(1-s.hydrolysis,oh,v.hydrolysisK*factor*h/2);};
   hydro();
   if(s.phase==='oxidation')s.oxidation+=extent(s.hydrolysis-s.oxidation,Math.max(0,.75*r-s.oxidation),v.oxidationK*factor*4/3*h);
   hydro();
  }
  if(s.phase==='collected')s.dryingTime+=h;
  s.time+=h;
 }
 return s;
}
// Solve charge balance with an ideal neutral-acid solubility cap. A = benzoate.
// HA(aq) = min(Ctotal H/(Ka+H), S0(T)); [A] = Ka[HA]/H.
export function benzoicEquilibrium(total,strongDifference,solubility){
 if(![total,strongDifference,solubility].every(Number.isFinite)||total<0||solubility<=0)throw new RangeError('Invalid acid equilibrium inputs');
 const Ka=6.3e-5,Kw=1e-14;
 const spec=logH=>{const H=10**logH,OH=Kw/H,ha=Math.min(total*H/(Ka+H),solubility),a=ha*Ka/H;return {H,OH,ha,a,residual:H-OH+strongDifference-a};};
 if(spec(-16).residual>0||spec(1).residual<0)throw new RangeError('Equilibrium exceeds supported pH interval');
 let lo=-16,hi=1;
 for(let i=0;i<100;i++){const m=(lo+hi)/2;if(spec(m).residual>0)hi=m;else lo=m;}
 const q=spec((lo+hi)/2);return {...q,pH:-(lo+hi)/2,solid:Math.max(0,total-q.ha-q.a)};
}
export function benzoicResult(s,v){
 validateBenzoic(v,s);const {n,r}=ratios(v),V=v.volume/1000,C=n/V,active=s.phase!=='empty',x=s.hydrolysis,y=s.oxidation,q=s.quench,A=s.acidAdded;
 const acidified=['acidified','collected'].includes(s.phase),temperature=s.phase==='collected'?s.collectionTemperature:s.temperature;
 const S=v.solubility20*Math.exp(-25000/8.314462618*(1/(temperature+273.15)-1/293.15));
 const oh0=v.base-x+y/3+q;
 const eq=acidified?benzoicEquilibrium(y*C,(v.base+r-x-A)*C,S):null;
 const acidAmount=eq?(eq.ha+eq.solid)*V:0,benzoate=eq?eq.a*V:y*n,OH=eq?eq.OH*V:oh0*n,H=eq?eq.H*V:0;
 const amounts=Object.fromEntries(Object.keys(BENZOIC_ATOMS).map(k=>[k,0]));
 if(active)Object.assign(amounts,{
  benzylChloride:(1-x)*n,benzylAlcohol:(x-y)*n,benzoate,benzoicAcid:acidAmount,
  permanganate:Math.max(0,r-4/3*y-q)*n,manganeseDioxide:(4/3*y+q)*n,
  hydroxide:OH,hydrogen:H,chloride:(x+A)*n,potassium:(v.base+r)*n,sodium:3*q*n,sulfate:1.5*q*n,
  water:v.volume*.9982/BENZOIC_MW.water+(4/3*y-.5*q)*n+(acidified?oh0*n-OH:0),
 });
 const masses=Object.fromEntries(Object.entries(amounts).map(([name,mol])=>[name,mol*BENZOIC_MW[name]]));
 const charge=Object.entries(amounts).reduce((sum,[name,mol])=>sum+mol*(BENZOIC_CHARGES[name]||0),0);
 const initialMass=active?v.mass+v.permanganate+v.base*n*(AW.K+BENZOIC_MW.hydroxide)+v.volume*.9982+1.5*q*n*(2*AW.Na+AW.S+3*AW.O)+A*n*(AW.H+AW.Cl):0;
 const crystals=eq?eq.solid*V*BENZOIC_MW.benzoicAcid:0;
 const theoretical=Math.min(1,.75*r,1.5*v.base)*n*BENZOIC_MW.benzoicAcid;
 const wetWater=s.retainedWater*Math.exp(-s.dryingTime/3);
 return {n,r,C,amounts,masses,charge,initialMass,equilibrium:eq,solubility:S,crystals,theoretical,formed:y*n*BENZOIC_MW.benzoicAcid,collected:s.collectedMass,wetWater,balanceMass:s.collectedMass+wetWater,yieldPercent:s.collectedMass/theoretical*100,unreactedOxidant:Math.max(0,r-4/3*y),manganeseWaste:(4/3*y+q)*n*BENZOIC_MW.manganeseDioxide};
}
export function addBenzoicOxidant(s,v){validateBenzoic(v,s);if(s.phase!=='hydrolysis')throw new Error('Initialize hydrolysis before adding the virtual oxidant');return {...s,phase:'oxidation'};}
export function quenchBenzoicOxidant(s,v){
 validateBenzoic(v,s);if(s.phase!=='oxidation')throw new Error('Complete the virtual oxidation stage first');
 return {...s,phase:'quenched',heater:false,quench:benzoicResult(s,v).unreactedOxidant};
}
export function clarifyBenzoic(s,v){validateBenzoic(v,s);if(s.phase!=='quenched')throw new Error('Scavenge remaining oxidant before separating MnO₂');return {...s,phase:'clarified'};}
export function acidifyBenzoic(s,v){validateBenzoic(v,s);if(s.phase!=='clarified')throw new Error('Separate manganese solids before acidification');return {...s,phase:'acidified',acidAdded:v.acid};}
export function collectBenzoic(s,v){
 validateBenzoic(v,s);if(s.phase!=='acidified')throw new Error('Acidify and crystallise before collecting product');const r=benzoicResult(s,v);
 if(r.crystals<1e-9)throw new Error('No crystals available. Inspect acidification, solubility and cooling.');
 return {...s,phase:'collected',collectionTemperature:s.temperature,collectedMass:r.crystals*v.recovery,retainedWater:Math.min(r.amounts.water*BENZOIC_MW.water,r.crystals*v.recovery*.3),dryingTime:0};
}
