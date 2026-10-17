import {trapezoidalAuc} from '../calculations/scientificCalculations.js';
export function simulateOralPk({doseMg=500,weightKg=70,gastric=1,hepatic=1,renal=1,fed=false,model='one',intervalHours=8}={}){
 if([doseMg,weightKg,gastric,hepatic,renal,intervalHours].some(v=>!Number.isFinite(v)||v<=0))throw new RangeError('dose, weight, rates and interval must be finite and greater than zero');
 if(!['one','two'].includes(model))throw new RangeError('Unknown compartment model');
 // Explicit exploratory assumptions, not a clinical parameter fit.
 const bioavailability=.8*(fed?.94:1),ka=2.8*gastric*(fed?.62:1),ke=Math.log(2)/(2.3/(.58*hepatic+.42*renal)),volume=.9*weightKg;
 const k12=model==='two'?.35:0,k21=model==='two'?.2:0;
 const terminal=model==='two'?((ke+k12+k21)-Math.sqrt((ke+k12+k21)**2-4*ke*k21))/2:ke;
 const halfLife=Math.log(2)/terminal;
 let state=[doseMg,0,0,0];const profile=[],massProfile=[];const dt=.01;
 const rates=([gut,central,peripheral])=>[-ka*gut,bioavailability*ka*gut-(ke+k12)*central+k21*peripheral,k12*central-k21*peripheral,ke*central];
 const plus=(a,b,scale)=>a.map((v,i)=>v+b[i]*scale);
 for(let i=0;i<=2400;i++){
  if(i%25===0){profile.push({x:i*dt,y:state[1]/volume});massProfile.push({x:i*dt,gut:state[0],central:state[1],peripheral:state[2],eliminated:state[3],nonSystemic:(doseMg-state[0])*(1-bioavailability)})}
  const a=rates(state),b=rates(plus(state,a,dt/2)),c=rates(plus(state,b,dt/2)),d=rates(plus(state,c,dt));state=state.map((v,j)=>v+dt*(a[j]+2*b[j]+2*c[j]+d[j])/6);
 }
 const peak=profile.reduce((best,p)=>p.y>best.y?p:best,profile[0]);
 return{profile,massProfile,doseMg,bioavailability,ka,ke,volume,halfLife,cmax:peak.y,tmax:peak.x,auc:trapezoidalAuc(profile),clearance:ke*volume,accumulation:1/(1-Math.exp(-terminal*intervalHours)),pathways:{glucuronidation:55*hepatic,sulfation:30*hepatic,unchanged:5*renal,cyp:10*hepatic},model};
}
export function massBalanceAt(timeHours,result){
 if(!Number.isFinite(timeHours)||timeHours<0)throw new RangeError('Nonnegative time required');
 const row=result.massProfile.reduce((best,p)=>Math.abs(p.x-timeHours)<Math.abs(best.x-timeHours)?p:best,result.massProfile[0]);
 const fraction=row.eliminated/result.doseMg*100,weights=result.pathways,total=Object.values(weights).reduce((a,b)=>a+b,0);
 return{glucuronide:fraction*weights.glucuronidation/total,sulfate:fraction*weights.sulfation/total,unchanged:fraction*weights.unchanged/total,other:fraction*weights.cyp/total,notSystemicallyAvailable:row.nonSystemic/result.doseMg*100,remaining:(row.gut+row.central+row.peripheral)/result.doseMg*100};
}
