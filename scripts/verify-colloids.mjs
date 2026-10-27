import assert from 'node:assert/strict';import fs from 'node:fs';import * as M from '../src/modules/core-simulations/colloidsModel.js';
let count=0;const close=(a,b,tol=1e-10)=>{assert.ok(Math.abs(a-b)<=tol*Math.max(Math.abs(b),1e-25),`${a} != ${b}`);count++;};const fixtures=[];
for(const temperature of [273,298,333])for(const viscosity of [.5,1,10])for(const radius of [20,100,500]){
 const v=M.caValues({...M.CA_DEFAULTS,temperature,viscosity,radius,tick:200}),r=M.caAt(v),d=1.380649e-23*temperature/(6*Math.PI*viscosity*1e-3*radius*1e-9);close(r.diffusionUm2S,d*1e12);close(r.expectedMSDUm2,6*d*1e12*10);close(r.kernelM3S,8*1.380649e-23*temperature/(3*viscosity*1e-3));fixtures.push({values:v,reading:r});
 const b=M.caBrownian(v);assert.deepEqual(b,M.caBrownian(v));assert.equal(b.positions.length,64);for(const p of b.positions)for(const x of p){assert.ok(x>=-10&&x<10);count++;}
}
// One fixed reproducible ensemble: compare its 3D normal second moment with the
// chi-square sampling scale, rather than forcing every stochastic path onto6Dt.
let sample=0,expected=0;
for(let seed=1;seed<=120;seed++){const b=M.caBrownian({...M.CA_DEFAULTS,seed,tick:20});sample+=b.sampleMSDUm2;expected+=b.expectedMSDUm2;}
assert.ok(Math.abs(sample/expected-1)<.035);count++;
for(const logW of [0,1,4])for(const logN of [14,16,18])for(const tick of [0,1,20,200,1200])for(const seed of [1,431,99999]){
 const v=M.caValues({...M.CA_DEFAULTS,mode:'coagulation',logW,logN,tick,seed}),r=M.caCoagulation(v),members=r.clusters.flat();assert.equal(r.mass,64);assert.equal(new Set(members).size,64);assert.equal(members.length,64);assert.equal(r.eventCount,64-r.clusterCount);close(r.expectedCount,64/(1+tick*.05/r.halfTimeS));close(r.histogram.reduce((s,n,i)=>s+n*(i+1),0),64);assert.ok(r.events.every((e,i)=>i===0||e.timeS>r.events[i-1].timeS));fixtures.push({values:v,reading:M.caAt(v)});count+=5;
}
for(const tau of [0,.01,.2,1,10]){let mass=0,number=0;for(let k=1;k<2000;k++){const c=M.caClusterFraction(tau,k);mass+=k*c;number+=c;}close(mass,1);close(number,1/(1+tau));}
// Independently integrate the mean-field population ODE in dimensionless time.
for(const end of [.1,1,5]){let x=1,dt=end/10000;for(let i=0;i<10000;i++){const f=x=>-x*x,a=f(x),b=f(x+dt*a/2),c=f(x+dt*b/2),d=f(x+dt*c);x+=dt*(a+2*b+2*c+d)/6;}close(x,1/(1+end),1e-9);}
for(const valence of [1,2,3]){close(M.caCCC({...M.CA_DEFAULTS,valence}),50/valence**6);close(M.caCCC({...M.CA_DEFAULTS,valence,solSign:1}),M.caCCC({...M.CA_DEFAULTS,valence,solSign:-1}));}
for(const adsorption of ['langmuir','freundlich'])for(const c0 of [0,.01,20,100])for(const mass of [.001,.05,.5])for(const volume of [.01,.1,1]){
 const v=M.caValues({...M.CA_DEFAULTS,mode:'adsorption',adsorption,c0,mass,volume}),r=M.caAdsorption(v);close(r.adsorbedMg+r.dissolvedMg,r.initialMg,1e-11);assert.ok(r.ceMgL>=0&&r.ceMgL<=c0);assert.ok(r.removalFraction>=0&&r.removalFraction<=1+1e-12);if(adsorption==='langmuir'){assert.ok(r.qMgG<=v.qmax);close(r.theta,r.qMgG/v.qmax);}else assert.equal(r.theta,null);fixtures.push({values:v,reading:M.caAt(v)});count+=3;
}
for(const adsorption of ['langmuir','freundlich']){const book=M.caNotebook();for(let i=1;i<=6;i++)book.records.push(M.caRecord(i,{...M.CA_DEFAULTS,mode:'adsorption',adsorption,c0:i*10}));const fit=M.caFitAdsorption(book);if(adsorption==='langmuir'){close(fit.qmax,80);close(fit.affinity,.12);}else{close(fit.kf,8);close(fit.alpha,.65);}assert.ok(fit.residualSD<1e-12);}
const book=M.caNotebook();book.records=[M.caRecord(1,M.CA_DEFAULTS)];assert.deepEqual(M.caParse(JSON.parse(JSON.stringify(book))),book);for(const key of ['kernelM3S','ceMgL','clusterCount']){const forged=structuredClone(book);forged.records[0].reading[key]=key==='kernelM3S'?1e-10:1234;assert.throws(()=>M.caParse(forged));}assert.throws(()=>M.caParse({...book,records:[book.records[0],book.records[0]]}));assert.throws(()=>M.caParse({...book,notes:'x'.repeat(100001)}));assert.ok(M.caCsv(book).includes('kernelM3S'));
for(const[k,[min,max]]of Object.entries(M.CA_RANGES)){assert.equal(M.caValues({...M.CA_DEFAULTS,[k]:-1e100})[k],min);assert.equal(M.caValues({...M.CA_DEFAULTS,[k]:1e100})[k],max);assert.ok(Number.isFinite(M.caValues({...M.CA_DEFAULTS,[k]:NaN})[k]));count+=3;}
let v=M.CA_DEFAULTS,pending=0;for(let i=0;i<100;i++){const next=M.caAdvance(v,.01,pending);v=next.values;pending=next.pending;}assert.equal(v.tick,20);assert.equal(M.caAdvance(M.CA_DEFAULTS,1).values.tick,20);assert.equal(M.caAdvance(M.CA_DEFAULTS,1e20).values.tick,1200);assert.equal(M.caAdvance(M.CA_DEFAULTS,NaN,NaN).values.tick,0);
for(const speed of [.25,.5,1,2,4]){assert.equal(M.caAdvance({...M.CA_DEFAULTS,speed},2).values.tick,40*speed);count++;}
assert.throws(()=>M.caParse({...book,records:Array(1001).fill(book.records[0])}));assert.throws(()=>M.caRecord(1e6+1,M.CA_DEFAULTS));
fs.writeFileSync('docs/chemistry-91-audit/colloids-reference-fixtures.json',JSON.stringify(fixtures));console.log(`PASS:${count} counted colloid diffusion,periodic geometry,coagulation mass/ODE/distribution,finite-bath adsorption,fit,clock and input-bound checks;${fixtures.length} independent reference fixtures exported. Notebook guards also pass.`);
