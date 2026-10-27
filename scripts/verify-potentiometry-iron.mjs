import assert from 'node:assert/strict';
import * as M from '../src/modules/core-simulations/potentiometryIronModel.js';
let checks=0;const near=(a,b,t=1e-10)=>{assert.ok(Number.isFinite(a)&&Math.abs(a-b)<=t,`${a} != ${b}`);checks++;};
// Independently evaluate both half reactions and whole-reaction log K across compositions.
for(const iron of [.05,.1,.15])for(const aliquot of [20,25,30])for(const titrant of [.0125,.02,.03])for(const acidity of [.5,1.5]){
 const v={...M.POT_DEFAULTS,iron,aliquot,titrant,acidity};if(iron*aliquot/(6*titrant)>45)continue;
 for(const ml of [0,.01,3,10,iron*aliquot/(6*titrant)-.001,iron*aliquot/(6*titrant),iron*aliquot/(6*titrant)+.001,40,50]){
  const z=M.potSpecies(v,ml),nFe=iron*aliquot/1000,nD=titrant*ml/1000,nH=acidity*(aliquot+v.water)/1000;
  near((z.FeII+z.FeIII)*z.V,nFe*(1+v.seed),1e-14);near((z.CrIII+2*z.CrVI)*z.V,2*nD,1e-14);near(z.FeIII*z.V-nFe*v.seed,3*z.CrIII*z.V,1e-14);near(z.H*z.V+7*z.CrIII*z.V,nH,1e-14);near(z.charge,0,2e-15);near(z.electronResidual,0,1e-14);near(z.E,771+M.POT_S*Math.log10(z.FeIII/z.FeII),1e-9);near(z.cell,z.E-197,1e-9);
  assert.ok(z.FeII>0&&z.FeIII>0&&z.H>0&&z.CrIII>=0&&z.CrVI>=0);checks++;
  if(ml){const cr=1330+M.POT_S/6*Math.log10(z.CrVI*z.H**14/z.CrIII**2),logQ=2*Math.log10(z.CrIII)+6*Math.log10(z.FeIII)-Math.log10(z.CrVI)-14*Math.log10(z.H)-6*Math.log10(z.FeII);near(z.E,cr,1e-8);near(logQ,6*(1330-771)/M.POT_S,1e-9);}
 }
}
const v=M.POT_DEFAULTS,atHalf=M.potSpecies(v,12.5);near(atHalf.E,771+M.POT_S*Math.log10(1.02),1e-7);
const pre=M.potSpecies(v,24.9),eq=M.potSpecies(v,25),post=M.potSpecies(v,25.1);assert.ok(pre.E<eq.E&&eq.E<post.E);near(eq.E,1234.8970984987368,1e-7);
assert.ok(M.potSpecies({...v,acidity:.5},30).E<M.potSpecies({...v,acidity:1.5},30).E);
// Formal reaction masses/atoms/charge: dichromate +14H +6Fe ->2Cr+6Fe+7water.
const Fe=55.845,Cr=51.9961,O=15.999,H=1.008;near(2*Cr+7*O+14*H+6*Fe,2*Cr+6*Fe+7*(2*H+O),1e-10);near(-2+14+6*2,2*3+6*3,0);
function setup(values=v){let s=M.potBegin(M.potInitial());for(const x of [0,500,800])s=M.potReference(s,values,x);s=M.potLoad(s);s=M.potFill(s);s=M.potProbe(s,values,'sample');return s;}
let s=setup();near(M.potInventory(s,v).total,500);assert.throws(()=>M.potRecord(1,v,s));const a=M.potAdvance(s,v,12),b=M.potAdvance(M.potAdvance(s,v,4),v,8);near(a.sensor,b.sensor,1e-10);
s=M.potAdvance(s,v,30);assert.ok(M.potObservation(s,v).ready);const records=[];
for(const ml of [0,5,10,12.5,20,24,24.8,24.9,25,25.1,25.2,26,30]){if(ml>s.delivered)s=M.potDose(s,ml-s.delivered);s=M.potAdvance(s,v,30);near(M.potInventory(s,v).total,500);records.push(M.potRecord(1,v,s));const r=M.potObservation(s,v),ideal=M.potSpecies(v,ml).cell;assert.ok(r.range[0]<=ideal&&ideal<=r.range[1]);checks++;}
const fit=M.potAnalyze(records,1);assert.ok(fit.valid);near(fit.endpoint,24.95,1e-8);near(fit.concentration,.11976,1e-10);near(fit.interval[0],24.9,1e-8);near(fit.interval[1],25,1e-8);
const changed=records.map(r=>({...r,values:{...r.values,iron:.05},reading:{...r.reading,cell:r.reading.cell+17}}));near(M.potAnalyze(changed,1).endpoint,fit.endpoint);near(M.potAnalyze(changed,1).concentration,fit.concentration);assert.equal(M.potAnalyze(records.slice(0,8),1).valid,false);
const excluded=records.map(r=>({...r,included:r.reading.volume!==25}));near(M.potAnalyze(excluded,1).endpoint,25,1e-8);
const n={...M.potNotebook(),records};assert.equal(M.parsePotNotebook(JSON.stringify(n)).records.length,13);assert.equal(M.potCsv(n).split('\n').length,14);
for(const mutate of [x=>x.records.push(x.records[0]),x=>x.records[0].reading.raw+=.1,x=>x.records[0].values.iron=.07,x=>x.records[0].state.calibration[0].raw+=1,x=>x.records[0].state.delivered=51,x=>x.lab='ph-metry-hcl']){const forged=structuredClone(n);mutate(forged);assert.throws(()=>M.parsePotNotebook(forged));}
for(const [key,value]of [['iron',NaN],['titrant',0],['acidity',0],['seed',0],['resolution',0],['volumeScale',2]])assert.throws(()=>M.potValues({...v,[key]:value}));
const slow={...v,refError:4,junction:2,drift:.15,tau:8,volumeScale:1.004,resolution:1};let q=setup(slow);q=M.potAdvance(q,slow,90);const r=M.potObservation(q,slow),target=M.potSpecies(slow,0).cell-2;assert.ok(r.ready&&r.warnings.length>=3);assert.ok(Math.abs(r.cell-target)>.01);q=M.potStir(q,false);q=M.potDose(q,1);q=M.potAdvance(q,slow,100);assert.equal(M.potObservation(q,slow).ready,false);q=M.potStir(q,true);q=M.potAdvance(q,slow,100);assert.ok(M.potObservation(q,slow).ready);q=M.potProbe(q,slow,'raised');near(M.potInventory(q,slow).total,500);near(q.rinseUsed,5);q=M.potAdvance(q,slow,3600);near(q.time,3600);near(M.potAdvance(q,slow,1).time,3600);
// Geometry capacity relationships are independent of delivered quantity.
const beaker=.68**2*1.25,burette=(Math.sqrt(beaker/4/2.7))**2*2.7,stock=(Math.sqrt(beaker/2/.8))**2*.8;near(beaker/burette,4);near(beaker/stock,2);
console.log(`PASS: ${checks} counted coupled-Nernst, reference, stoichiometry, charge, inventory, timing, quantization and measured-endpoint checks; invalid histories and boundary guards pass.`);
