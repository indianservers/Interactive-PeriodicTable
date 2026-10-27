import assert from 'node:assert/strict';
import * as M from '../src/modules/core-simulations/kaConductometryModel.js';
let checks=0;const near=(a,b,t=1e-10)=>{assert.ok(Math.abs(a-b)<=t,`${a} differs from ${b}`);checks++;};
function workflow(values){const v=M.kaValues(values);let s=M.kaInitial(v);const check=()=>{s=M.validateKaState(s,v);const l=M.kaLedger(s,v);near(l.volume,600);near(l.acid,l.initialAcid);near(l.salt,l.initialSalt);near(l.mass,l.initialMass,1e-8);};
assert.throws(()=>M.kaRecord(1,v,s));assert.throws(()=>M.kaDrawAliquot(s,v,0));
s=M.kaProbe(s,'reference');s=M.kaCalibrate(s,v);s=M.kaProbe(s,'raised');s=M.kaStart(s);check();
for(let i=0;i<3;i++){s=M.kaDrawAliquot(s,v,i);check();s=M.kaDeliver(s);check();s=M.kaFill(s,v,i);check();assert.throws(()=>M.kaLoadCell(s,v,i+1));s=M.kaAdvance(s,5);check();near(s.flasks[i].acid/(s.flasks[i].volume/1000),M.kaConcentration(v,i+1));}
const records=[];for(const level of ['blank',0,1,2,3]){s=M.kaLoadCell(s,v,level);check();assert.throws(()=>M.kaRecord(1,v,s));s=M.kaProbe(s,'cell');assert.throws(()=>M.kaDrain(s));s=M.kaAdvance(s,5);check();const r=M.kaCellResult(s,v);near(r.charge,0,1e-11);if(level!=='blank')near(r.H*r.Ac/r.HA,M.KA_REFERENCE,1e-10);records.push(M.kaRecord(1,v,s));s=M.kaProbe(s,'raised');s=M.kaDrain(s);check();}
const notebook={...M.kaNotebook(),records};assert.equal(M.parseKaNotebook(JSON.stringify(notebook)).records.length,5);assert.throws(()=>M.parseKaNotebook({...notebook,records:[...records,records[0]]}));assert.throws(()=>M.parseKaNotebook({...notebook,lab:'other'}));assert.throws(()=>M.validateKaState({...s,water:{...s.water,volume:s.water.volume+1}},v));checks+=20;return records;}
const defaults=M.KA_CONDUCTOMETRY_DEFAULTS,records=workflow(defaults),corrected=M.analyseKa(records,1),classical=M.analyseKa(records,1,'classic'),uncorrected=M.analyseKa(records,1,'water',false);
near(corrected.median,M.KA_REFERENCE,3e-8);assert.notEqual(corrected.median,classical.median);assert.notEqual(corrected.median,uncorrected.median);assert.equal(M.kaEstimate(records[1],null).valid,false);assert.equal(M.fitKaOstwald(records.slice(0,3),1).ka,null);
assert.equal(M.kaEstimate(records[1],{...records[0],run:2}).valid,false);assert.equal(M.kaEstimate(records[1],records[2]).valid,false);
const impossible={...records[4],values:{...records[4].values,cellSetting:2,offset:.0005},state:{...records[4].state,calibrated:false}};assert.equal(M.kaEstimate(impossible,null,'classic',false).valid,false);
for(const stock of [.005,.02,.05])for(const transfer of [5,10,25])for(const background of [0,5e-6]){const rows=workflow({...defaults,stock,transfer,background,resolution:1e-6});for(const p of M.analyseKa(rows,1).points){assert.ok(p.valid);near(p.ka,M.KA_REFERENCE,3e-7);}}
for(let ml=0;ml<=50;ml++){const z=M.kaFlaskLiquid(ml);near(M.kaFlaskVolume(z.height)/M.kaFlaskVolume(1)*50,ml,1e-7);}
console.log(`PASS: ${checks} Ka dilution, inventory, charge/equilibrium, recorded inversion, notebook and volumetric-geometry assertions. Browser fidelity remains separate.`);
