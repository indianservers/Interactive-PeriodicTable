// Ideal dilute-solution teaching model. Rates and activation energy are illustrative.
export const HYDROLYSIS_DEFAULTS = {c0:.1,acid:.05,volume:100,aliquot:5,quench:20,temperature:25,cold:5,base:.1,kRef:.45,activation:50,multiplier:1};
const limits={c0:[.05,.2],acid:[.01,.1],volume:[50,150],aliquot:[2,5],quench:[10,30],temperature:[20,40],cold:[5,15],base:[.05,.2],kRef:[.05,1],activation:[0,80],multiplier:[0,2]};
const stages=['pipetted','transferred','quenched','titrating','recorded','discarded'];
const kinds=['reaction','blank','standard'];
const finite=(n,a,b,label)=>{if(!Number.isFinite(n)||n<a||n>b)throw new RangeError(`${label} must be between ${a} and ${b}.`);return n;};
export function hydrolysisValues(input){const v={};for(const [key,[a,b]]of Object.entries(limits))v[key]=finite(input?.[key],a,b,key);return v;}
export const hydrolysisInitial=()=>({loaded:false,time:0,samples:[]});
export const activeHydrolysis=s=>s.samples.at(-1)||null;
export const hydrolysisRate=(v,temp=v.temperature,dilution=1)=>v.kRef*v.multiplier*v.acid/.05*dilution*Math.exp(-v.activation*1000/8.314462618*(1/(temp+273.15)-1/298.15));
export const hydrolysisExtent=(time,v)=>v.c0*-Math.expm1(-hydrolysisRate(v)*time);
export const hydrolysisRemaining=(s,v)=>s.loaded?Math.max(0,v.volume-s.samples.filter(p=>p.kind==='reaction').length*v.aliquot):0;
export function hydrolysisLoad(s){if(s.loaded)throw new Error('Reaction already loaded.');return {...s,loaded:true};}
export function hydrolysisAdvance(s,v,hours){finite(hours,0,8,'Time step');if(!s.loaded)throw new Error('Load reaction first.');const dt=Math.min(hours,8-s.time),p=activeHydrolysis(s);return {...s,time:s.time+dt,samples:s.samples.map(x=>x!==p||!['pipetted','transferred','quenched'].includes(x.stage)?x:{...x,[x.stage==='quenched'?'coldHours':'warmHours']:x[x.stage==='quenched'?'coldHours':'warmHours']+dt})};}
export function hydrolysisSample(s,v,kind){if(!s.loaded)throw new Error('Load reaction first.');if(!kinds.includes(kind))throw new Error('Unknown sample.');const p=activeHydrolysis(s);if(p&&!['recorded','discarded'].includes(p.stage))throw new Error('Record or discard the current portion first.');if(s.samples.length>=100)throw new Error('100-portion run limit reached.');if(kind==='reaction'&&hydrolysisRemaining(s,v)+1e-9<v.aliquot)throw new Error('Insufficient reactor liquid for a complete aliquot.');return {...s,samples:[...s.samples,{id:s.samples.length+1,kind,at:s.time,warmHours:0,coldHours:0,stage:'pipetted',quenched:false,used:0,refills:0}]};}
function change(s,fn){const p=activeHydrolysis(s);if(!p)throw new Error('Draw a portion first.');return {...s,samples:[...s.samples.slice(0,-1),fn(p)]};}
export function hydrolysisTransfer(s){return change(s,p=>{if(p.stage!=='pipetted')throw new Error('Portion must be in the pipette.');return {...p,stage:'transferred'};});}
export function hydrolysisQuench(s){return change(s,p=>{if(p.stage!=='transferred')throw new Error('Transfer to the assay flask first.');return {...p,stage:'quenched',quenched:true};});}
export function hydrolysisStartAssay(s){return change(s,p=>{if(p.stage!=='quenched')throw new Error('Add cold dilution water first.');return {...p,stage:'titrating'};});}
export const hydrolysisTitre=p=>p?25*p.refills+p.used:0;
export function hydrolysisDose(s,ml){finite(ml,0,60,'Dose');return change(s,p=>{if(p.stage!=='titrating')throw new Error('Start titration first.');const dose=Math.min(ml,25-p.used,60-hydrolysisTitre(p));return {...p,used:Math.min(25,Math.round((p.used+dose)*100)/100)};});}
export function hydrolysisRefill(s){return change(s,p=>{if(p.stage!=='titrating'||p.used<25-1e-9||p.refills>=2)throw new Error('Refill only an empty burette during titration.');return {...p,used:0,refills:p.refills+1};});}
export function hydrolysisDiscard(s){return change(s,p=>{if(['recorded','discarded'].includes(p.stage))throw new Error('Portion already archived.');return {...p,stage:'discarded'};});}
export function hydrolysisComposition(p,v){
 const va=v.aliquot/1000,n0=p.kind==='reaction'?v.c0*va:0;
 let product=p.kind==='standard'?v.c0*va:p.kind==='reaction'?hydrolysisExtent(p.at+p.warmHours,v)*va:0;
 if(p.kind==='reaction'&&p.quenched)product=n0-(n0-product)*Math.exp(-hydrolysisRate(v,v.cold,v.aliquot/(v.aliquot+v.quench))*p.coldHours);
 return {ester:p.kind==='reaction'?n0-product:0,acid:product,methanol:p.kind==='reaction'?product:0,catalyst:v.acid*va,water:(55.5*va+(p.quenched?55.5*v.quench/1000:0))-(p.kind==='reaction'?product:0),initialEster:n0};
}
const KA=1.75e-5,KW=1e-14;
export function hydrolysisAssay(p,v){
 if(!p)return null;const c=hydrolysisComposition(p,v),titre=hydrolysisTitre(p),vol=(v.aliquot+(p.quenched?v.quench:0)+titre)/1000,cl=c.catalyst/vol,ca=c.acid/vol,na=titre/1000*v.base/vol;
 let lo=-16,hi=0;for(let i=0;i<100;i++){const mid=(lo+hi)/2,h=10**mid,res=h+na-KW/h-cl-ca*KA/(KA+h);if(res>0)hi=mid;else lo=mid;}
 const h=10**((lo+hi)/2),pH=-Math.log10(h),charge=h+na-KW/h-cl-ca*KA/(KA+h),targetH=10**-8.3,d=KW/targetH-targetH;
 const endpoint=1000*(c.catalyst+c.acid*KA/(KA+targetH)+(v.aliquot+v.quench)/1000*d)/(v.base-d),guided=Math.ceil((endpoint-1e-10)*100)/100;
 return {composition:c,titre,volume:vol*1000,pH,charge,endpoint,guided,indicator:1/(1+10**(9.4-pH)),acceptable:p.quenched&&pH>=8.2&&pH<=10.3&&Math.abs(titre-endpoint)<=.021};
}
export function hydrolysisGuided(s,v){const p=activeHydrolysis(s);if(!p||p.stage!=='titrating')throw new Error('Start titration first.');return hydrolysisDose(s,Math.max(0,hydrolysisAssay(p,v).guided-hydrolysisTitre(p)));}
export function hydrolysisRecord(s){return change(s,p=>{if(p.stage!=='titrating')throw new Error('Titrate the portion before recording.');return {...p,stage:'recorded'};});}
export function hydrolysisLedger(s,v){
 const vol=hydrolysisRemaining(s,v)/1000,x=hydrolysisExtent(s.time,v),tot={ester:(v.c0-x)*vol,acid:x*vol,methanol:x*vol,water:(55.5-x)*vol,catalyst:v.acid*vol};let addedWater=0;
 for(const p of s.samples.filter(p=>p.kind==='reaction')){const c=hydrolysisComposition(p,v);for(const k of Object.keys(tot))tot[k]+=c[k];if(p.quenched)addedWater+=55.5*v.quench/1000;}
 const mass=tot.ester*74.079+tot.acid*60.052+tot.methanol*32.042+tot.water*18.015+tot.catalyst*36.458;
 return {...tot,mass,initialMass:s.loaded?v.volume/1000*(v.c0*74.079+55.5*18.015+v.acid*36.458)+addedWater*18.015:0,acyl:tot.ester+tot.acid,remaining:vol*1000,addedWater};
}
export function validateHydrolysisSample(input,v,time=8){
 const p={id:finite(input?.id,1,100,'Sample ID'),kind:input?.kind,at:finite(input?.at,0,time,'Withdrawal time'),warmHours:finite(input?.warmHours,0,8,'Warm hold'),coldHours:finite(input?.coldHours,0,8,'Cold hold'),stage:input?.stage,quenched:input?.quenched,used:finite(input?.used,0,25,'Burette use'),refills:finite(input?.refills,0,2,'Refills')};
 if(!Number.isInteger(p.id)||!Number.isInteger(p.refills)||!kinds.includes(p.kind)||!stages.includes(p.stage)||typeof p.quenched!=='boolean'||p.at+p.warmHours+p.coldHours>time+1e-8||hydrolysisTitre(p)>60+1e-8)throw new Error('Invalid sample history.');
 if((['quenched','titrating','recorded'].includes(p.stage)&&!p.quenched)||(['pipetted','transferred'].includes(p.stage)&&p.quenched)||(!p.quenched&&p.coldHours!==0)||(!['titrating','recorded','discarded'].includes(p.stage)&&(p.used!==0||p.refills!==0)))throw new Error('Inconsistent assay stage.');
 if(Math.abs(p.used*100-Math.round(p.used*100))>1e-7)throw new Error('Burette reading must resolve 0.01 mL.');return p;
}
export function validateHydrolysisState(input,v){
 if(typeof input?.loaded!=='boolean'||!Array.isArray(input.samples)||input.samples.length>100)throw new Error('Invalid reaction state.');const time=finite(input.time,0,8,'Reaction time'),samples=input.samples.map(p=>validateHydrolysisSample(p,v,time));
 if(!input.loaded&&(time!==0||samples.length))throw new Error('Empty reactor has a history.');samples.forEach((p,i)=>{const previous=samples[i-1];if(p.id!==i+1||(i<samples.length-1&&!['recorded','discarded'].includes(p.stage))||(previous&&p.at+1e-8<previous.at+previous.warmHours+previous.coldHours))throw new Error('Invalid portion sequence.');});
 if(samples.filter(p=>p.kind==='reaction').length*v.aliquot>v.volume+1e-8)throw new Error('Withdrawals exceed reactor volume.');return {loaded:input.loaded,time,samples};
}
export function parseHydrolysisNotebook(input){
 const data=typeof input==='string'?JSON.parse(input):input;if(data?.schema!==1||data.lab!=='methyl-acetate-hydrolysis'||!Array.isArray(data.records)||data.records.length>2000||typeof data.notes!=='string'||data.notes.length>100000)throw new Error('Invalid hydrolysis notebook.');const seen=new Set(),configs=new Map();
 const records=data.records.map(r=>{const run=finite(r?.run,1,1e6,'Run ID');if(!Number.isInteger(run))throw new Error('Run ID must be an integer.');const values=hydrolysisValues(r.values),sample=validateHydrolysisSample(r.sample,values);if(sample.stage!=='recorded')throw new Error('Only recorded assays can be imported.');const key=`${run}:${sample.id}`,config=JSON.stringify(values);if(seen.has(key)||configs.has(run)&&configs.get(run)!==config)throw new Error('Duplicate sample or inconsistent run setup.');seen.add(key);configs.set(run,config);return {run,values,sample};});
 for(const run of configs.keys()){const rows=records.filter(r=>r.run===run).sort((a,b)=>a.sample.id-b.sample.id);if(rows.filter(r=>r.sample.kind==='reaction').length*rows[0].values.aliquot>rows[0].values.volume+1e-8)throw new Error('Recorded withdrawals exceed reactor stock.');rows.forEach((r,i)=>{const previous=rows[i-1]?.sample;if(previous&&r.sample.at+1e-8<previous.at+previous.warmHours+previous.coldHours)throw new Error('Overlapping portion histories.');});}
 return {schema:1,lab:'methyl-acetate-hydrolysis',records,notes:data.notes};
}
export const hydrolysisNotebook=()=>({schema:1,lab:'methyl-acetate-hydrolysis',records:[],notes:''});
export function fitHydrolysis(records,run){
 const rows=records.filter(r=>r.run===run).map(r=>({...r,assay:hydrolysisAssay(r.sample,r.values)})),blank=rows.filter(r=>r.sample.kind==='blank'&&r.assay.acceptable).at(-1),standard=rows.filter(r=>r.sample.kind==='standard'&&r.assay.acceptable).at(-1),warnings=[];
 if(!blank||!standard)return {points:[],warnings:['Record acceptable acid-blank and full-acid standard titres before fitting.'],k:null};const v0=blank.assay.titre,vl=standard.assay.titre;if(vl<=v0)return {points:[],warnings:['Standard titre must exceed the blank.'],k:null};
 const groups=new Map();let excluded=0;for(const r of rows.filter(r=>r.sample.kind==='reaction')){if(!r.assay.acceptable){excluded++;continue;}const key=r.sample.at,group=groups.get(key)||[];group.push(r);groups.set(key,group);if(r.sample.warmHours+r.sample.coldHours>1e-8&&!warnings.includes('Post-withdrawal reaction biases the inferred concentration.'))warnings.push('Post-withdrawal reaction biases the inferred concentration.');}
 const points=[...groups].sort((a,b)=>a[0]-b[0]).map(([x,g])=>{const titre=g.reduce((a,r)=>a+r.assay.titre,0)/g.length,ratio=(vl-titre)/(vl-v0);return {x,y:ratio>0?Math.log(ratio):null,titre,concentration:ratio*g[0].values.c0,replicates:g.length};}).filter(p=>{if(p.y===null){excluded++;return false;}return true;});if(excluded)warnings.push(`${excluded} invalid endpoint or nonpositive-gap reading(s) excluded.`);
 if(points.length<3)return {points,warnings:[...warnings,'At least three distinct withdrawal times are needed.'],k:null,v0,vl};const n=points.length,mx=points.reduce((a,p)=>a+p.x,0)/n,my=points.reduce((a,p)=>a+p.y,0)/n,xx=points.reduce((a,p)=>a+(p.x-mx)**2,0),slope=points.reduce((a,p)=>a+(p.x-mx)*(p.y-my),0)/xx,intercept=my-slope*mx,sse=points.reduce((a,p)=>a+(p.y-intercept-slope*p.x)**2,0),sst=points.reduce((a,p)=>a+(p.y-my)**2,0);if(slope>=-1e-12)warnings.push('No positive decay rate can be inferred.');return {points,warnings,k:-slope,halfLife:slope<-1e-12?Math.log(2)/-slope:null,intercept,se:Math.sqrt(sse/(n-2)/xx),r2:sst>1e-20?1-sse/sst:null,v0,vl};
}
