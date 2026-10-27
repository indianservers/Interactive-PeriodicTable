import assert from 'node:assert/strict';
import {PEROXIDE_DEFAULTS as D,PEROXIDE_R as R,validatePeroxideValues,peroxideWaterPressure,peroxideRate,peroxideGasFactor,peroxideInitial,tarePeroxide,chargePeroxide,advancePeroxide,peroxideResult,recordPeroxide,peroxideObservation,fitPeroxide,parsePeroxideNotebook,parsePeroxideWorkspace,peroxideCsv,peroxideLiquidHeight,nextPeroxideRun} from '../src/modules/core-simulations/peroxideKineticsModel.js';
let count=0;const near=(a,b,tol=1e-10)=>{assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);count++;},ok=(x,msg)=>{assert.ok(x,msg);count++;},eq=(a,b)=>{assert.deepEqual(a,b);count++;},reject=fn=>{assert.throws(fn);count++;};
const charged=v=>chargePeroxide(tarePeroxide(peroxideInitial(),v),v),at=(v,t)=>peroxideResult(advancePeroxide(charged(v),v,t),v),series=(v,times,run=1,tared=true)=>times.map(time=>recordPeroxide(run,v,{phase:'loaded',time,zeroReading:tared?tarePeroxide(peroxideInitial(),v).zeroReading:null}));
near(peroxideRate(D),.023);near(peroxideWaterPressure(25),3.17,.03);near(peroxideWaterPressure(20),2.34,.03);near(peroxideWaterPressure(35),5.63,.04);
near(peroxideWaterPressure(29.85),100*10**(5.40221-1838.675/(303-31.737)));near(peroxideWaterPressure(30.85),100*10**(5.20389-1733.926/(304-39.485)));near(peroxideWaterPressure(30.35),(peroxideWaterPressure(29.85)+peroxideWaterPressure(30.85))/2);
for(const t of [29.84999,29.85,30.35,30.84999,30.85])ok(peroxideWaterPressure(t+.000001)>peroxideWaterPressure(t));
near(peroxideGasFactor({...D,wet:false}),24465.40369703813,1e-8);near(peroxideGasFactor(D)/peroxideGasFactor({...D,wet:false}),D.pressure/(D.pressure-peroxideWaterPressure(25)));
near(at(D,Math.log(2)/.023).concentration,.1);near(at(D,2*Math.log(2)/.023).concentration,.05);near(at(D,0).initial,.005);near(at(D,0).physicalVolume,0);
for(const concentration of [.05,.2,.4]){const a=at({...D,c0:concentration},20);near(a.halfLife,Math.log(2)/.023);near(a.concentration/concentration,Math.exp(-.46));}
near(peroxideRate({...D,temperature:35})/.023,Math.exp(45000/R*(1/298.15-1/308.15)));near(peroxideRate({...D,temperature:45,activation:0}),.023);near(peroxideRate({...D,multiplier:2}),.046);near(at({...D,multiplier:0},240).conversion,0);
const flow=at(D,20),dt=1e-4;near((at(D,20+dt).concentration-at(D,20-dt).concentration)/(2*dt),-.023*flow.concentration,1e-10);
// Independent species/element, reactive mass and gas-equivalent ledgers across
// contrasting composition, temperature, capacity, dry/wet and collection cases.
for(const c0 of [.05,.4])for(const volume of [10,40])for(const temperature of [20,45])for(const efficiency of [0,.65,1])for(const capacity of [20,100])for(const wet of [false,true])for(const time of [0,10,100,240]){
 const v={...D,c0,volume,temperature,efficiency,capacity,wet},a=at(v,time),n0=c0*volume/1000;
 near(a.remaining+a.waterFormed,n0);near(a.oxygen,a.waterFormed/2);near(a.collected+a.vented,a.oxygen);near(2*a.remaining+2*a.waterFormed,2*n0);near(2*a.remaining+a.waterFormed+2*a.oxygen,2*n0);
 near(a.remaining*34.014+a.waterFormed*18.015+a.oxygen*31.998,n0*34.014,1e-12);near(a.reactiveMass,a.initialReactiveMass,1e-12);ok(a.physicalVolume<=capacity+1e-9);ok(a.physicalVolume>=0);ok(a.remaining>=0);near(a.physicalVolume,a.collected*1000*R*298.15/(101.325-(wet?peroxideWaterPressure(25):0)));
}
const low=at({...D,capacity:20},50),high=at({...D,capacity:100},50);ok(low.atCapacity);near(low.physicalVolume,20);ok(low.vented>0);near(low.remaining,high.remaining);near(low.oxygen,high.oxygen);near(high.vented,0);
let many=charged(D);for(let i=0;i<100;i++)many=advancePeroxide(many,D,.5);const once=advancePeroxide(charged(D),D,50);near(many.time,once.time);near(peroxideResult(many,D).remaining,peroxideResult(once,D).remaining);near(advancePeroxide(once,D,240).time,240);
for(const offset of [-3,-.13,0,.13,3])for(const resolution of [.05,.1,.2,.5])for(const time of [0,10,30,90]){
 const v={...D,offset,resolution},a=at(v,time);ok(Math.abs(a.measuredVolume-a.physicalVolume)<=a.quantizationBound+1e-10);near(a.rawVolume-a.measuredVolume,tarePeroxide(peroxideInitial(),v).zeroReading);
 if(offset===0)ok(Math.abs(a.apparentConcentration-a.concentration)<=2*a.quantizationBound/a.factor/(v.volume/1000)+1e-10);
}
const times=[0,5,10,15,20,25,30,35,40],ideal=series({...D,resolution:.05},times),analysis=fitPeroxide(ideal,1),fit=analysis.fit;ok(fit.suitable);near(fit.k,.023,.0001);near(fit.halfLife,Math.log(2)/.023,.12);ok(fit.r2>.9999);ok(fit.se>=0);
// Independent uncentered normal-equation reference for the fitted slope.
const xs=analysis.points.map(p=>p.state.time),ys=analysis.points.map(p=>p.logRatio),n=xs.length,sx=xs.reduce((a,b)=>a+b),sy=ys.reduce((a,b)=>a+b),sxy=xs.reduce((a,x,i)=>a+x*ys[i],0),sxx=xs.reduce((a,x)=>a+x*x,0),slope=(n*sxy-sx*sy)/(n*sxx-sx*sx);near(fit.k,-slope,1e-12);near(fit.intercept,(sy-slope*sx)/n,1e-12);
const lost=fitPeroxide(series({...D,efficiency:.65},times),1);ok(lost.fit.k<fit.k);ok(!lost.fit.suitable);ok(lost.warnings.some(x=>x.includes('Undercollection')));
const biased=fitPeroxide(series({...D,offset:3},times,1,false),1);ok(biased.fit.k>fit.k);ok(!biased.fit.suitable);ok(biased.warnings.some(x=>x.includes('zero')));
const capped=fitPeroxide(series({...D,capacity:20},times),1);ok(capped.points.length<times.length);ok(capped.warnings.some(x=>x.includes('Capacity')));near(capped.fit.k,.023,.001);
const negative=fitPeroxide(series({...D,offset:3},[0,120,240],1,false),1);ok(negative.warnings.some(x=>x.includes('Nonpositive')));eq(negative.fit,null);
const zero=fitPeroxide(series({...D,multiplier:0},times),1);near(zero.fit.k,0);eq(zero.fit.r2,null);eq(zero.fit.halfLife,null);ok(!zero.fit.suitable);
eq(fitPeroxide([],1).fit,null);eq(fitPeroxide(ideal.slice(0,2),1).fit,null);reject(()=>fitPeroxide([ideal[0],ideal[0],ideal[1]],1));reject(()=>fitPeroxide([ideal[0],{...ideal[1],values:{...ideal[1].values,gasTemperature:30}},ideal[2]],1));
for(const bad of [{...D,c0:0},{...D,volume:NaN},{...D,temperature:100},{...D,wet:'true'},{...D,resolution:0},{...D,efficiency:1.1},{...D,pressure:0}])reject(()=>validatePeroxideValues(bad));
for(const bad of [-1,Infinity,241,NaN])reject(()=>advancePeroxide(charged(D),D,bad));reject(()=>advancePeroxide(peroxideInitial(),D,1));reject(()=>chargePeroxide(charged(D),D));reject(()=>tarePeroxide(charged(D),D));reject(()=>recordPeroxide(1,D,peroxideInitial()));
const notebook={schema:1,lab:'h2o2-kinetics',records:ideal,notes:'Gas-derived rate; check collection validity.\nNo arbitrary Gaussian spectrum.'};eq(parsePeroxideNotebook(JSON.stringify(notebook)),notebook);
for(const bad of [{...notebook,schema:2},{...notebook,lab:'other'},{...notebook,records:[{}]},{...notebook,records:[{...ideal[0],state:{...ideal[0].state,zeroReading:1}}]},{...notebook,records:[ideal[0],ideal[0]]},{...notebook,notes:'a'.repeat(100001)}])reject(()=>parsePeroxideNotebook(bad));
const workspace={schema:1,run:1,selectedRun:1,values:ideal[0].values,state:ideal.at(-1).state,speed:1,notebook};eq(parsePeroxideWorkspace(JSON.stringify(workspace)),workspace);
for(const bad of [{...workspace,speed:3},{...workspace,selectedRun:7},{...workspace,state:{...workspace.state,time:0}},{...workspace,state:peroxideInitial()},{...workspace,values:{...workspace.values,c0:.3}}])reject(()=>parsePeroxideWorkspace(bad));
const forged=structuredClone(notebook);forged.records[0].result={measuredVolume:999};ok(!('result' in parsePeroxideNotebook(forged).records[0]));const csv=peroxideCsv(ideal);eq(csv.split('\n').length,ideal.length+1);ok(csv.includes('"oxygen_equivalent_measured_mol"'));
let prior=-1;for(const volume of [0,1,10,25,40,50]){const h=peroxideLiquidHeight(volume),a=.72,b=(.24-.72)/1.4,V=y=>Math.PI*(a*a*y+a*b*y*y+b*b*y*y*y/3);near(V(h)/V(1.4)*50,volume,1e-10);ok(h>prior);prior=h;}
reject(()=>peroxideLiquidHeight(51));reject(()=>peroxideWaterPressure(36));
eq(nextPeroxideRun([],1),2);eq(nextPeroxideRun([{run:1_000_000}],1_000_000),1);eq(nextPeroxideRun([{run:1},{run:1_000_000}],1_000_000),2);reject(()=>nextPeroxideRun([{run:0}],1));reject(()=>nextPeroxideRun(Array(2001).fill({run:1}),1));
console.log(`PASS: ${count} peroxide exact-rate, half-life, temperature, H/O/mass, gas-law, collection/capacity, calibration, OLS, timing, input/notebook/workspace and flask-volume assertions. Unfitted effective kinetics and ideal gas collection are explicit model assumptions.`);
