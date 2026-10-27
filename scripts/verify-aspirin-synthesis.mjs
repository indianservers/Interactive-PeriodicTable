import assert from 'node:assert/strict';
import {ASPIRIN_MW as M,ASPIRIN_DEFAULTS as D,aspirinInitial,aspirinExtent,aspirinRateConstant,aspirinResult,advanceAspirin,quenchAspirin,filterAspirin} from '../src/modules/core-simulations/aspirinSynthesisModel.js';
let checks=0;const near=(a,b,t=1e-10)=>{assert.ok(Math.abs(a-b)<=t,`${a} != ${b}`);checks++;};
const finite=v=>typeof v==='number'?Number.isFinite(v):v&&typeof v==='object'?Object.values(v).every(finite):true;
const balance=(state,v)=>{const r=aspirinResult(state,v);assert.ok(finite(r));checks++;near(Object.values(r.ledger).reduce((a,b)=>a+b,0),r.initialMass);assert.ok(r.collected<=r.productMass+1e-12&&r.productMass<=r.theoreticalMass+1e-12);checks++;return r;};
near(M.salicylic+M.anhydride,M.aspirin+M.acetic);near(M.anhydride+M.water,2*M.acetic);
near(aspirinExtent(.01,.01,100),.005);near(aspirinExtent(.01,.02,0),0);near(aspirinExtent(.01,.02,1e10),.01);
near(aspirinExtent(.01,.02,100),aspirinExtent(.02,.01,100));near(aspirinRateConstant(55,D),.2);
let state={...aspirinInitial(),phase:'reaction',heater:true};const r0=balance(state,D);near(r0.theoreticalMass,2/138.122*180.159);assert.equal(r0.limiting,'Salicylic acid');checks++;
const hot=advanceAspirin(state,D,20);assert.ok(hot.temperature>54.99&&hot.temperature<=55);checks++;
const hotResult=balance(hot,D);assert.ok(hotResult.productMass>0&&hotResult.conversion<1);checks++;
const cooler=advanceAspirin(state,{...D,setpoint:35},20);assert.ok(aspirinResult(cooler,D).extent<hotResult.extent);checks++;
const many=Array.from({length:200}).reduce(s=>advanceAspirin(s,D,.1),state);near(many.exposure,hot.exposure,1e-7);near(many.temperature,hot.temperature,1e-10);
const quenched=quenchAspirin(hot,D);balance(quenched,D);const cold=advanceAspirin(quenched,D,10);const coldResult=balance(cold,D);near(cold.exposure,hot.exposure);assert.ok(coldResult.crystals>aspirinResult(quenched,D).crystals);checks++;
const filtered=filterAspirin(cold,D),fr=balance(filtered,D);near(fr.collected,coldResult.crystals*D.recovery);assert.ok(fr.balanceMass>fr.collected);checks++;
const dry=advanceAspirin(filtered,D,30),dr=balance(dry,D);near(dr.collected,fr.collected);near(dr.wetWater,fr.wetWater*Math.exp(-10));near(dr.crystals,fr.crystals);
near(dr.productMass,fr.productMass);assert.ok(dr.yieldPercent<=100);checks++;
const limited={...D,anhydrideMass:.1};assert.equal(aspirinResult(state,limited).limiting,'Acetic anhydride');checks++;near(aspirinResult(state,limited).theoreticalMass,.1/102.089*180.159);
for(const salicylicMass of [.1,5])for(const anhydrideMass of [.1,8])for(const setpoint of [25,80])for(const solubility of [.1,20]){
 const v={...D,salicylicMass,anhydrideMass,setpoint,solubility};
 let s=advanceAspirin(state,v,60);balance(s,v);s=quenchAspirin(s,v);s=advanceAspirin(s,v,15);const r=balance(s,v);
 if(r.crystals>0){s=filterAspirin(s,v);balance(s,v);balance(advanceAspirin(s,v,60),v);}else{assert.throws(()=>filterAspirin(s,v));checks++;}
}
for(const [key,bad] of [['salicylicMass',0],['anhydrideMass',NaN],['volume',0],['setpoint',101],['recovery',1.1],['solubility',Infinity],['quenchWater',0]]){assert.throws(()=>aspirinResult(state,{...D,[key]:bad}),RangeError);checks++;}
for(const dt of [-1,NaN,Infinity,121]){assert.throws(()=>advanceAspirin(state,D,dt),RangeError);checks++;}
assert.throws(()=>quenchAspirin(aspirinInitial(),D));assert.throws(()=>filterAspirin(state,D));checks+=2;
assert.deepEqual(aspirinInitial(),aspirinInitial());checks++;
console.log(`PASS: aspirin reaction/hydrolysis mass balance, limiting reagent, thermal integration, cooling, filtration, drying and boundaries; ${checks} assertions.`);
