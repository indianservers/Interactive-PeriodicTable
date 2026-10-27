// Ideal aqueous/solid teaching model: coefficients and pKas are explicit
// examples, not calibrated synthesis, stability, buffer or spectral data.
export const AZO_DEFAULTS={aniline:5,nitrite:1.05,acid:2.2,naphthol:5,base:1.8,sourceVolume:25,receiverVolume:35,target:3,pH:10,feedMinutes:8,kDiaz:4,kCouple:30,kLoss:.003,activation:25,lossActivation:65,naphtholSolubility:.005,dyeSolubility:.00001,recovery:.95};
export const AZO_BOUNDS={aniline:[1,10],nitrite:[.5,1.5],acid:[1,3],naphthol:[1,10],base:[0,3],sourceVolume:[15,60],receiverVolume:[20,80],target:[0,25],pH:[8,11],feedMinutes:[1,20],kDiaz:[.1,10],kCouple:[1,80],kLoss:[0,.02],activation:[0,60],lossActivation:[0,90],naphtholSolubility:[.001,.02],dyeSolubility:[.000001,.0001],recovery:[.5,1]};
export const AZO_PKAS={anilinium:4.6,nitrous:3.3,naphthol:9.5,phenol:10,dye:11};
export const AZO_ATOMS={aniline:{C:6,H:7,N:1},anilinium:{C:6,H:8,N:1},nitrite:{N:1,O:2},nitrous:{H:1,N:1,O:2},diazonium:{C:6,H:5,N:2},naphthol:{C:10,H:8,O:1},naphthoxide:{C:10,H:7,O:1},dye:{C:16,H:12,N:2,O:1},dyeAnion:{C:16,H:11,N:2,O:1},phenol:{C:6,H:6,O:1},phenoxide:{C:6,H:5,O:1},sodium:{Na:1},chloride:{Cl:1},hydrogen:{H:1},hydroxide:{H:1,O:1},water:{H:2,O:1},nitrogen:{N:2}};
export const AZO_CHARGES={anilinium:1,nitrite:-1,diazonium:1,naphthoxide:-1,dyeAnion:-1,phenoxide:-1,sodium:1,chloride:-1,hydrogen:1,hydroxide:-1};
const AW={C:12.011,H:1.008,N:14.007,O:15.999,Na:22.98976928,Cl:35.45};
export const AZO_MW=Object.fromEntries(Object.entries(AZO_ATOMS).map(([k,a])=>[k,Object.entries(a).reduce((sum,[z,n])=>sum+AW[z]*n,0)]));
const FIELDS=['amine','nitrite','diazonium','naphthol','dye','phenol','sodium','chloride','oxygen','hydrogen','volume'];
const blank=()=>Object.fromEntries(FIELDS.map(k=>[k,0]));
export const azoInitial=()=>({phase:'empty',time:0,temperature:20,source:blank(),receiver:blank(),transferred:0,baseDelivered:0,gas:0,pump:false,pHStat:true,cakeDye:0,cakeNaphthol:0,cakeWater:0,evaporated:0});
export function azoChargeBasis(v){const a=v.aniline/1000,n=a*v.nitrite,h=a*v.acid,b=v.naphthol/1000*v.base,wA=v.sourceVolume/AZO_MW.water,wB=v.receiverVolume/AZO_MW.water,wBase=b/.5*1000/AZO_MW.water;
 return {a,n,h,b,wBase,source:{...blank(),amine:a,nitrite:n,sodium:n,chloride:h,oxygen:wA+2*n,hydrogen:2*wA+7*a+h,volume:v.sourceVolume/1000},receiver:{...blank(),naphthol:v.naphthol/1000,oxygen:wB+v.naphthol/1000,hydrogen:2*wB+8*v.naphthol/1000,volume:v.receiverVolume/1000}};
}
export function validateAzo(v,s){
 for(const [k,[lo,hi]] of Object.entries(AZO_BOUNDS))if(!Number.isFinite(v?.[k])||v[k]<lo||v[k]>hi)throw RangeError(`Invalid ${k}: ${lo}–${hi}`);
 if(!s)return;if(!['empty','preparing','coupling','holding','collected'].includes(s.phase))throw RangeError('Unknown azo stage');
 for(const k of ['time','temperature','transferred','baseDelivered','gas','cakeDye','cakeNaphthol','cakeWater','evaporated'])if(!Number.isFinite(s[k])||s[k]<0)throw RangeError(`Invalid ${k}`);
 if(s.temperature>30||s.transferred>1||typeof s.pump!=='boolean'||typeof s.pHStat!=='boolean')throw RangeError('Invalid thermal or pump state');
 const basis=azoChargeBasis(v);if(s.baseDelivered>basis.b+1e-12||s.cakeDye>Math.min(basis.a,basis.n,v.naphthol/1000)+1e-12||s.cakeNaphthol>v.naphthol/1000+1e-12)throw RangeError('Reservoir inventory exceeded');
 for(const vessel of [s.source,s.receiver])for(const k of FIELDS)if(!Number.isFinite(vessel?.[k])||vessel[k]< -1e-12)throw RangeError(`Invalid vessel ${k}`);
 if(s.phase==='empty'&&(FIELDS.some(k=>s.source[k]!==0||s.receiver[k]!==0)||['time','transferred','baseDelivered','gas','cakeDye','cakeNaphthol','cakeWater','evaporated'].some(k=>s[k]!==0)||s.pump))throw RangeError('Process state before charge');
 if(s.phase==='preparing'&&(s.transferred!==0||s.pump)||s.phase==='holding'&&s.transferred!==1||s.phase==='collected'&&(s.transferred!==1||s.pump))throw RangeError('Invalid transfer stage');
 if(s.phase!=='collected'&&['cakeDye','cakeNaphthol','cakeWater','evaporated'].some(k=>s[k]!==0))throw RangeError('Collection before isolation');
 if(s.phase!=='empty'){
  const carbon=6*(s.source.amine+s.source.diazonium+s.source.phenol+s.receiver.amine+s.receiver.diazonium+s.receiver.phenol)+10*(s.source.naphthol+s.receiver.naphthol+s.cakeNaphthol)+16*(s.source.dye+s.receiver.dye+s.cakeDye),nitrogen=s.source.amine+s.receiver.amine+s.source.nitrite+s.receiver.nitrite+2*(s.source.diazonium+s.receiver.diazonium+s.source.dye+s.receiver.dye+s.cakeDye+s.gas);
  if(Math.abs(carbon-(6*basis.a+10*v.naphthol/1000))>1e-9||Math.abs(nitrogen-(basis.a+basis.n))>1e-9)throw RangeError('Carbon or nitrogen ledger does not close');
  for(const [key,expected] of [['oxygen',basis.source.oxygen+basis.receiver.oxygen+basis.b+basis.wBase],['hydrogen',basis.source.hydrogen+basis.receiver.hydrogen+basis.b+2*basis.wBase]]){const left=basis.b-s.baseDelivered,unusedWater=basis.b?basis.wBase*left/basis.b:0,actual=s.source[key]+s.receiver[key]+left+(key==='oxygen'?unusedWater+s.cakeDye+s.cakeNaphthol+s.cakeWater+s.evaporated:2*(unusedWater+s.cakeWater+s.evaporated)+12*s.cakeDye+8*s.cakeNaphthol);if(Math.abs(actual-expected)>1e-8)throw RangeError(`${key} ledger does not close`);}
  if(Math.abs(s.source.sodium+s.receiver.sodium+basis.b-s.baseDelivered-(basis.n+basis.b))>1e-10||Math.abs(s.source.chloride+s.receiver.chloride-basis.h)>1e-10)throw RangeError('Spectator ledger does not close');
  if(Math.abs(s.source.volume-v.sourceVolume/1000*(1-s.transferred))>1e-10||Math.abs(s.receiver.volume-(v.receiverVolume/1000+v.sourceVolume/1000*s.transferred+s.baseDelivered/.5))>1e-10)throw RangeError('Nominal transfer volume does not close');
  for(const vessel of [s.source,s.receiver]){
   if(vessel.volume<1e-14&&FIELDS.some(k=>Math.abs(vessel[k])>1e-10))throw RangeError('Material in a zero-volume vessel');
   const eq=azoSpeciation(vessel,v),hydrogen=Object.entries(eq.amounts).reduce((n,[k,a])=>n+a*(AZO_ATOMS[k].H||0),0);
   if(Math.abs(eq.charge)>1e-9||Math.abs(hydrogen-vessel.hydrogen)>1e-8)throw RangeError('Vessel hydrogen or charge ledger does not close');
  }
 }
}
// Acid/base species at a trial [H+], including instantaneous neutral-solid caps.
function atH(q,v,H){const V=q.volume,OH=1e-14/H,ka=k=>10**-AZO_PKAS[k],anilinium=q.amine*H/(H+ka('anilinium')),nitrous=q.nitrite*H/(H+ka('nitrous'));
 const acid=(n,pKa,sol=Infinity)=>{const K=10**-pKa,neutral=Math.min(n*H/(H+K),sol*V),ion=Math.min(n*K/(H+K),sol*V*K/H);return {neutral,ion,solid:Math.max(0,n-neutral-ion)};};
 const nap=acid(q.naphthol,AZO_PKAS.naphthol,v.naphtholSolubility),dye=acid(q.dye,AZO_PKAS.dye,v.dyeSolubility),phenol=acid(q.phenol,AZO_PKAS.phenol);
 const charge=(H-OH)*V+q.sodium+q.diazonium+anilinium-q.chloride-(q.nitrite-nitrous)-nap.ion-dye.ion-phenol.ion;
 return {charge,nap,dye,phenol,anilinium,nitrous,H,OH};
}
export function azoSpeciation(q,v){
 if(q.volume<1e-14)return {pH:null,charge:0,napSolid:0,dyeSolid:0,napAnion:0,nitrous:0,amounts:Object.fromEntries(Object.keys(AZO_ATOMS).filter(k=>k!=='nitrogen').map(k=>[k,0]))};
 let lo=-16,hi=1;for(let i=0;i<58;i++){const mid=(lo+hi)/2;if(atH(q,v,10**mid).charge>0)hi=mid;else lo=mid;}
 const r=atH(q,v,10**((lo+hi)/2)),a={aniline:q.amine-r.anilinium,anilinium:r.anilinium,nitrite:q.nitrite-r.nitrous,nitrous:r.nitrous,diazonium:q.diazonium,naphthol:r.nap.neutral+r.nap.solid,naphthoxide:r.nap.ion,dye:r.dye.neutral+r.dye.solid,dyeAnion:r.dye.ion,phenol:r.phenol.neutral,phenoxide:r.phenol.ion,sodium:q.sodium,chloride:q.chloride,hydrogen:r.H*q.volume,hydroxide:r.OH*q.volume};
 a.water=q.oxygen-(2*q.nitrite+q.naphthol+q.dye+q.phenol+a.hydroxide);if(a.water< -1e-10)throw RangeError('Insufficient solvent water');
 return {pH:-Math.log10(r.H),charge:r.charge,napSolid:r.nap.solid,dyeSolid:r.dye.solid,napAnion:r.nap.ion,nitrous:r.nitrous,amounts:a};
}
function doseBase(s,v){if(!s.pHStat)return;const basis=azoChargeBasis(v),left=basis.b-s.baseDelivered;if(left<=1e-14)return;const H=10**-v.pH,q=s.receiver;
 const trial=n=>({...q,sodium:q.sodium+n,oxygen:q.oxygen+n+n/.5*1000/AZO_MW.water,hydrogen:q.hydrogen+n+2*n/.5*1000/AZO_MW.water,volume:q.volume+n/.5});
 if(atH(q,v,H).charge>=0)return;let lo=0,hi=left;if(atH(trial(left),v,H).charge>0){for(let i=0;i<38;i++){const mid=(lo+hi)/2;if(atH(trial(mid),v,H).charge>0)hi=mid;else lo=mid;}}const n=(lo+hi)/2;
 // When capacity is exhausted, deliver all remaining base rather than half.
 const delivered=atH(trial(left),v,H).charge<=0?left:n;s.receiver=trial(delivered);s.baseDelivered+=delivered;
}
export function chargeAzo(state,v){validateAzo(v,state);if(state.phase!=='empty')throw Error('Reset before charging');const b=azoChargeBasis(v),s={...state,phase:'preparing',source:{...b.source},receiver:{...b.receiver}};doseBase(s,v);validateAzo(v,s);return s;}
export function startAzoTransfer(state,v){validateAzo(v,state);if(!['preparing','coupling'].includes(state.phase)||state.temperature>5.05||state.transferred>=1)throw Error('Cool the virtual diazonium vessel to 5 °C or below before transfer');return {...state,phase:'coupling',pump:true};}
const bimolecular=(a,b,e)=>{const l=Math.min(a,b),m=Math.max(a,b),d=m-l;if(l<=0||e===0)return 0;if(d<1e-14)return l*l*e/(1+l*e);const f=-Math.expm1(-d*e);return m*l*f/(d+l*f);};
export function azoRates(t,v){const d=1/(t+273.15)-1/276.15;return {diaz:v.kDiaz*Math.exp(-v.activation*1000/8.314462618*d),couple:v.kCouple*Math.exp(-v.activation*1000/8.314462618*d),loss:v.kLoss*Math.exp(-v.lossActivation*1000/8.314462618*d)};}
function transfer(s,v,dt){if(!s.pump||s.temperature>5.05||s.transferred>=1)return;const delta=Math.min(1-s.transferred,dt/v.feedMinutes),fraction=delta/(1-s.transferred);for(const k of FIELDS){const n=s.source[k]*fraction;s.source[k]-=n;s.receiver[k]+=n;}s.transferred+=delta;if(s.transferred>=1-1e-13){for(const k of FIELDS){s.receiver[k]+=s.source[k];s.source[k]=0;}s.transferred=1;s.pump=false;s.phase='holding';}}
function react(q,v,t,h){if(q.volume<1e-14)return 0;const rate=azoRates(t,v),eq=azoSpeciation(q,v),H=10**-eq.pH,acid=H/(H+.001),nitrous=q.nitrite>0?eq.nitrous/q.nitrite:0,x=bimolecular(q.amine,q.nitrite,rate.diaz*acid*nitrous*h/q.volume);q.amine-=x;q.nitrite-=x;q.diazonium+=x;
 const loss1=q.diazonium*(-Math.expm1(-rate.loss*h/2));q.diazonium-=loss1;q.phenol+=loss1;
 const np=azoSpeciation(q,v),active=q.naphthol>0?np.napAnion/q.naphthol:0,c=bimolecular(q.diazonium,q.naphthol,rate.couple*active*h/q.volume);q.diazonium-=c;q.naphthol-=c;q.dye+=c;
 const loss2=q.diazonium*(-Math.expm1(-rate.loss*h/2));q.diazonium-=loss2;q.phenol+=loss2;return loss1+loss2;
}
export function advanceAzo(state,v,dt){validateAzo(v,state);if(!Number.isFinite(dt)||dt<0||dt>120)throw RangeError('Step must be 0–120 simulation minutes');const s={...state,source:{...state.source},receiver:{...state.receiver}};if(s.phase==='empty'||dt===0)return s;
 const n=Math.ceil(dt/.025),h=dt/n;for(let i=0;i<n;i++){
  const tm=v.target+(s.temperature-v.target)*Math.exp(-h/4);s.temperature=v.target+(s.temperature-v.target)*Math.exp(-h/2);
  if(s.phase==='collected'){const lost=s.cakeWater*(-Math.expm1(-h/3));s.cakeWater-=lost;s.evaporated+=lost;}
  else{transfer(s,v,h/2);doseBase(s,v);s.gas+=react(s.source,v,tm,h)+react(s.receiver,v,tm,h);doseBase(s,v);transfer(s,v,h/2);doseBase(s,v);}
  s.time+=h;
 }validateAzo(v,s);return s;
}
export function azoResult(s,v){validateAzo(v,s);const charged=s.phase!=='empty',source=azoSpeciation(s.source,v),receiver=azoSpeciation(s.receiver,v),basis=azoChargeBasis(v),amounts=Object.fromEntries(Object.keys(AZO_ATOMS).map(k=>[k,(source.amounts[k]||0)+(receiver.amounts[k]||0)]));
 if(charged){const left=basis.b-s.baseDelivered;amounts.sodium+=left;amounts.hydroxide+=left;amounts.water+=(basis.b?basis.wBase*left/basis.b:0)+s.cakeWater+s.evaporated;amounts.dye+=s.cakeDye;amounts.naphthol+=s.cakeNaphthol;amounts.nitrogen+=s.gas;}
 const totalMass=Object.entries(amounts).reduce((m,[k,n])=>m+n*AZO_MW[k],0),initialMass=charged?basis.a*AZO_MW.aniline+basis.n*(AZO_MW.nitrite+AZO_MW.sodium)+basis.h*(AZO_MW.hydrogen+AZO_MW.chloride)+v.naphthol/1000*AZO_MW.naphthol+basis.b*(AZO_MW.sodium+AZO_MW.hydroxide)+v.sourceVolume+v.receiverVolume+basis.wBase*AZO_MW.water:0,theoretical=Math.min(basis.a,basis.n,v.naphthol/1000)*AZO_MW.dye,formed=(s.source.dye+s.receiver.dye+s.cakeDye)*AZO_MW.dye,collected=s.cakeDye*AZO_MW.dye,impurity=s.cakeNaphthol*AZO_MW.naphthol;
 return {source,receiver,amounts,totalMass,initialMass,theoretical,formed,collected,impurity,wetCake:collected+impurity+s.cakeWater*AZO_MW.water,yieldPercent:collected/theoretical*100,diazonium:s.source.diazonium+s.receiver.diazonium,gas:s.gas,baseRemaining:charged?basis.b-s.baseDelivered:0};
}
export function collectAzo(state,v){const r=azoResult(state,v);if(state.phase!=='holding'||r.diazonium>v.aniline/1000*.01||r.receiver.dyeSolid+r.receiver.napSolid<1e-12)throw Error('Finish transfer and reduce residual model diazonium below 1% before isolation');const s={...state,receiver:{...state.receiver},phase:'collected',pump:false},d=r.receiver.dyeSolid*v.recovery,n=r.receiver.napSolid*v.recovery,water=Math.min(r.receiver.amounts.water,(d*AZO_MW.dye+n*AZO_MW.naphthol)*.2/AZO_MW.water);s.receiver.dye-=d;s.receiver.naphthol-=n;s.receiver.oxygen-=d+n+water;s.receiver.hydrogen-=12*d+8*n+2*water;s.cakeDye=d;s.cakeNaphthol=n;s.cakeWater=water;validateAzo(v,s);return s;}
export function parseAzoNotebook(x){if(x?.schema!==1||typeof x.notes!=='string'||x.notes.length>100000||!Array.isArray(x.records)||x.records.length>2000)throw Error('Expected a version 1 notebook, at most 2000 snapshots and 100000 note characters');for(const r of x.records){if(!r?.state||!r?.values)throw Error('Snapshot needs state and parameters');validateAzo(r.values,r.state);if(r.optics){for(const key of ['wavelength','dilution','path','epsilon'])if(!Number.isFinite(r.optics[key]))throw Error('Incomplete optical snapshot');azoAbsorbance(0,r.optics);}}return {notes:x.notes,records:x.records};}
export function azoAbsorbance(dyeMoles,{wavelength=480,dilution=10000,path=1,epsilon=20000}={}){if(!Number.isFinite(dyeMoles)||dyeMoles<0||!Number.isFinite(wavelength)||wavelength<350||wavelength>750||!Number.isFinite(dilution)||dilution<1000||dilution>100000||!Number.isFinite(path)||path<.1||path>2||!Number.isFinite(epsilon)||epsilon<0||epsilon>100000)throw RangeError('Invalid virtual optical input');return epsilon*Math.exp(-.5*((wavelength-480)/38)**2)*path*dyeMoles/(.1*dilution);}
