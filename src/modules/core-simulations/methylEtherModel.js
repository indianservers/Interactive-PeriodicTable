// Virtual aqueous, well-mixed Williamson model. Example coefficients are not
// fitted data or a physical methylation protocol. Only the CH3I pathway is used.
export const ETHER_ATOMS={naphthol:{C:10,H:8,O:1},naphthoxide:{C:10,H:7,O:1},ether:{C:11,H:10,O:1},methylIodide:{C:1,H:3,I:1},methanol:{C:1,H:4,O:1},iodide:{I:1},sodium:{Na:1},hydroxide:{O:1,H:1},hydrogen:{H:1},water:{H:2,O:1}};
const AW={C:12.011,H:1.008,O:15.999,I:126.90447,Na:22.98976928};
export const ETHER_MW=Object.fromEntries(Object.entries(ETHER_ATOMS).map(([k,a])=>[k,Object.entries(a).reduce((sum,[e,n])=>sum+AW[e]*n,0)]));
export const ETHER_CHARGE={naphthoxide:-1,iodide:-1,sodium:1,hydroxide:-1,hydrogen:1};
export const ETHER_DEFAULTS={mass:2,base:1.1,electrophile:1.1,volume:40,setpoint:40,kEther:.25,kHydrolysis:.05,activation:35,pKa:9.5,dilution:40,coolTo:10,etherSolubility:.001,naphtholSolubility:.006,recovery:.95};
export const etherInitial=()=>({phase:'empty',time:0,temperature:20,ether:0,hydrolysis:0,heater:false,collectionTemperature:20,collectedEther:0,collectedNaphthol:0,retainedWater:0,dryingTime:0});
export function validateEther(v,s){
 const bounds={mass:[.5,4],base:[0,3],electrophile:[.1,2],volume:[20,100],setpoint:[20,70],kEther:[.01,1],kHydrolysis:[0,.5],activation:[0,70],pKa:[8,11],dilution:[20,100],coolTo:[5,25],etherSolubility:[.0001,.02],naphtholSolubility:[.001,.03],recovery:[.5,1]};
 for(const [k,[a,b]] of Object.entries(bounds))if(!Number.isFinite(v[k])||v[k]<a||v[k]>b)throw new RangeError(`Invalid ${k}: ${a}–${b}`);
 if(s){
  if(!['empty','activated','reaction','workup','collected'].includes(s.phase))throw new RangeError('Invalid methylation stage');
  for(const k of ['time','ether','hydrolysis','collectedEther','collectedNaphthol','retainedWater','dryingTime'])if(!Number.isFinite(s[k])||s[k]<0)throw new RangeError(`Invalid ${k}`);
  if(!Number.isFinite(s.temperature)||s.temperature<0||s.temperature>100)throw new RangeError('Invalid temperature');
  const n=v.mass/ETHER_MW.naphthol;
  if(s.ether>n+1e-10||s.ether+s.hydrolysis>n*v.electrophile+1e-10)throw new RangeError('Reaction exceeds available precursor/electrophile');
  if(['empty','activated'].includes(s.phase)&&(s.ether!==0||s.hydrolysis!==0))throw new RangeError('Methylation before electrophile addition');
  if(s.phase!=='collected'&&(s.collectedEther!==0||s.collectedNaphthol!==0||s.retainedWater!==0||s.dryingTime!==0))throw new RangeError('Collection before filtration');
  if(s.collectedEther>s.ether*ETHER_MW.ether+1e-9||s.collectedNaphthol>(n-s.ether)*ETHER_MW.naphthol+1e-9)throw new RangeError('Collected solid exceeds available material');
  if(s.retainedWater>v.volume*.9982+v.dilution+v.base*n*ETHER_MW.water+1e-8)throw new RangeError('Cake water exceeds inventory');
  if(s.phase==='collected'&&(!Number.isFinite(s.collectionTemperature)||s.collectionTemperature<0||s.collectionTemperature>100))throw new RangeError('Invalid collection temperature');
 }
}
// Charge balance: [H]+[Na]=[I]+[OH]+[ArO]. Neutral solubility is
// capped by its example solubility; excess neutral naphthol becomes solid.
export function etherSpeciation(total,strongDifference,pKa,solubility=Infinity){
 if(!Number.isFinite(total)||total<0||!Number.isFinite(strongDifference)||!Number.isFinite(pKa)||!(solubility>0))throw new RangeError('Invalid acid–base input');
 const Ka=10**-pKa,Kw=1e-14;
 const spec=l=>{const H=10**l,OH=Kw/H,neutral=Math.min(total*H/(H+Ka),solubility),ion=Ka*neutral/H;return {H,OH,neutral,ion,residual:H+strongDifference-OH-ion};};
 let lo=-16,hi=1;if(spec(lo).residual>0||spec(hi).residual<0)throw new RangeError('Speciation outside supported pH interval');
 for(let i=0;i<70;i++){const m=(lo+hi)/2;if(spec(m).residual>0)hi=m;else lo=m;}
 const q=spec((lo+hi)/2);return {...q,pH:-(lo+hi)/2,solid:Math.max(0,total-q.neutral-q.ion)};
}
function amountsAt(s,v){
 const n=v.mass/ETHER_MW.naphthol,workup=['workup','collected'].includes(s.phase),V=(v.volume+(workup?v.dilution:0))/1000,t=s.phase==='collected'?s.collectionTemperature:s.temperature;
 const naphSol=v.naphtholSolubility*Math.exp(-18000/8.314462618*(1/(t+273.15)-1/293.15));
 const eq=etherSpeciation((n-s.ether)/V,(v.base*n-s.ether-s.hydrolysis)/V,v.pKa,naphSol);
 const etherSol=v.etherSolubility*Math.exp(-18000/8.314462618*(1/(t+273.15)-1/293.15));
 const water0=(v.volume*.9982+(workup?v.dilution:0))/ETHER_MW.water;
 const amounts={naphthol:(eq.neutral+eq.solid)*V,naphthoxide:eq.ion*V,ether:s.ether,methylIodide:n*v.electrophile-s.ether-s.hydrolysis,methanol:s.hydrolysis,iodide:s.ether+s.hydrolysis,sodium:v.base*n,hydroxide:eq.OH*V,hydrogen:eq.H*V,water:water0+v.base*n-eq.OH*V-s.hydrolysis};
 return {n,V,eq,amounts,etherSol,workup,etherCrystals:Math.max(0,s.ether-etherSol*V)*ETHER_MW.ether,naphtholCrystals:eq.solid*V*ETHER_MW.naphthol};
}
export function advanceEther(state,v,dt){
 validateEther(v,state);if(!Number.isFinite(dt)||dt<0||dt>120)throw new RangeError('Step must be 0–120 simulation minutes');const s={...state};
 if(!['activated','reaction','workup','collected'].includes(s.phase)||dt===0)return s;
 const steps=Math.ceil(dt/.02),h=dt/steps;
 for(let i=0;i<steps;i++){
  const target=['activated','reaction'].includes(s.phase)&&s.heater?v.setpoint:s.phase==='workup'?v.coolTo:20;
  const tm=target+(s.temperature-target)*Math.exp(-h/4);s.temperature=target+(s.temperature-target)*Math.exp(-h/2);
  if(['reaction','workup'].includes(s.phase)){
   const q=amountsAt({...s,temperature:tm},v),factor=Math.exp(-v.activation*1000/8.314462618*(1/(tm+273.15)-1/313.15));
   const a=v.kEther*factor*q.amounts.naphthoxide/q.V,b=v.kHydrolysis*factor*q.amounts.hydroxide/q.V,lambda=a+b;
   if(lambda>0){const consumed=Math.max(0,q.amounts.methylIodide)*-Math.expm1(-lambda*h);s.ether+=Math.min(q.n-s.ether,consumed*a/lambda);s.hydrolysis+=consumed*b/lambda;}
  }
  if(s.phase==='collected')s.dryingTime+=h;s.time+=h;
 }
 return s;
}
export function etherResult(s,v){
 validateEther(v,s);const q=amountsAt(s,v),charged=s.phase!=='empty';
 if(!charged)for(const k of Object.keys(q.amounts))q.amounts[k]=0;
 const masses=Object.fromEntries(Object.entries(q.amounts).map(([k,n])=>[k,Math.max(0,n)*ETHER_MW[k]])),theoretical=Math.min(q.n,q.n*v.electrophile)*ETHER_MW.ether;
 const wetWater=s.retainedWater*Math.exp(-s.dryingTime/3),collected=s.collectedEther+s.collectedNaphthol;
 return {...q,masses,charge:Object.entries(q.amounts).reduce((a,[k,n])=>a+n*(ETHER_CHARGE[k]||0),0),initialMass:charged?v.mass+q.n*v.electrophile*ETHER_MW.methylIodide+q.n*v.base*(ETHER_MW.sodium+ETHER_MW.hydroxide)+v.volume*.9982+(q.workup?v.dilution:0):0,theoretical,formed:s.ether*ETHER_MW.ether,collected,wetWater,balanceMass:collected+wetWater,yieldPercent:s.collectedEther/theoretical*100,selectivity:s.ether+s.hydrolysis>0?s.ether/(s.ether+s.hydrolysis):0,etherMassFraction:collected>0?s.collectedEther/collected:0};
}
export function addEtherElectrophile(s,v){validateEther(v,s);if(s.phase!=='activated')throw new Error('Activate the virtual precursor first');return {...s,phase:'reaction'};}
export function workupEther(s,v){validateEther(v,s);if(s.phase!=='reaction')throw new Error('Run the reaction before workup');return {...s,phase:'workup',heater:false};}
export function collectEther(s,v){validateEther(v,s);if(s.phase!=='workup')throw new Error('Dilute and cool before collecting solids');const r=etherResult(s,v);if(r.etherCrystals+r.naphtholCrystals<1e-9)throw new Error('No solids available; inspect the composition, solubility and temperature.');const e=r.etherCrystals*v.recovery,n=r.naphtholCrystals*v.recovery;return {...s,phase:'collected',collectionTemperature:s.temperature,collectedEther:e,collectedNaphthol:n,retainedWater:Math.min(r.amounts.water*ETHER_MW.water,.3*(e+n)),dryingTime:0};}
