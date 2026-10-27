import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import * as M from '../src/modules/core-simulations/dfBlockModel.js';
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++;},eq=(a,b)=>{assert.deepEqual(a,b);checks++;},close=(a,b,t=1e-9)=>ok(Math.abs(a-b)<=t,`${a} != ${b}`),fixtures=[];
const C=M.DF_CONSTANTS,Bcm=C.muB/(C.h*C.c*100);
for(const [id,ion] of Object.entries(M.DF_D_IONS))for(const delta of [5000,24000,35000])for(const pairing of [5000,24000,40000]){
 const v={...M.DF_DEFAULTS,dIon:id,delta,pairing},r=M.dfAt(v),f=M.dfFilling(v),p=M.dfPromotions(v);
 eq(ion.electrons,ion.Z-ion.charge);eq(ion.electrons,ion.coreElectrons+ion.d);eq(f.lower+f.upper,ion.d);eq(f.occupancy.flat().reduce((a,b)=>a+b,0),ion.d);
 eq(f.occupancy.filter(a=>a[0]&&a[1]).length,f.pairs);eq(f.unpaired,ion.d-2*f.pairs);close(f.muSpin,Math.sqrt(f.unpaired*(f.unpaired+2)));
 for(const row of p.rows){ok(row.gapCM>=0);const occ=f.occupancy.map(a=>[...a]);occ[row.from][row.spin]=0;occ[row.to][row.spin]=1;const pairs=occ.filter(a=>a[0]&&a[1]).length,lower=occ.slice(0,3).flat().reduce((a,b)=>a+b,0);close(delta*(-.4*lower+.6*(ion.d-lower))+pairing*pairs-f.energyCM,row.gapCM,1e-7);}
 if(p.rows.length)close(p.bands.reduce((s,b)=>s+b.weight,0),1);else eq(M.dfSpectrum(v).absorbance,0);
 ok(Object.values(r).every(n=>n===null||Number.isFinite(n)));fixtures.push({values:v,reading:r});
}
for(const [ion,uHS,uLS] of [['Cr2',4,2],['Mn2',5,1],['Fe2',4,0],['Co2',3,1]]){eq(M.dfFilling({...M.DF_DEFAULTS,dIon:ion,delta:5000,pairing:40000}).unpaired,uHS);eq(M.dfFilling({...M.DF_DEFAULTS,dIon:ion,delta:35000,pairing:5000}).unpaired,uLS);ok(M.dfFilling({...M.DF_DEFAULTS,dIon:ion,delta:24000,pairing:24000}).spinDegenerate);}
const terms=['1S0','2F5/2','3H4','4I9/2','5I4','6H5/2','7F0','8S7/2','7F6','6H15/2','5I8','4I15/2','3H6','2F7/2','1S0'];
for(const [symbol,ion] of Object.entries(M.DF_LANTHANIDES)){
 const t=M.dfHund(ion.f);eq(t.term,terms[ion.f]);eq(ion.electrons,ion.Z-3);eq(ion.electrons,54+ion.f);if(!t.J)eq(t.g,null);
 for(const temperature of [2,298,600])for(const lambda of [100,350,2000]){
  const v={...M.DF_DEFAULTS,mode:'f',lanthanide:symbol,temperature,lambda},r=M.dfAt(v),multi=M.dfMultiplets(v);close(multi.reduce((s,a)=>s+a.population,0),1);ok(r.chiM>=0);close(M.dfMagnetization(v,0),0);close(M.dfMagnetization(v,-1),-r.magnetizationMuB,1e-9);ok(Math.abs(r.magnetizationMuB)<=t.L+2*t.S+1e-8);
  const blocks=M.dfHamiltonian(M.dfTerm(v),0);eq(blocks.reduce((s,b)=>s+b.basis.length,0),(2*t.L+1)*(2*t.S+1));const expected=multi.flatMap(a=>Array(a.degeneracy).fill(a.energyCM)).sort((a,b)=>a-b),actual=blocks.flatMap(b=>b.states.map(a=>a.energy)).sort((a,b)=>a-b),min=actual[0];actual.forEach((e,i)=>close(e-min,expected[i],1e-7));
  for(const b of blocks)for(const s of b.states){close(s.vector.reduce((a,x)=>a+x*x,0),1,1e-10);b.matrix.forEach((row,i)=>close(row.reduce((sum,x,j)=>sum+x*s.vector[j],0),s.energy*s.vector[i],1e-7));}
  const slope=(M.dfMagnetization(v,.001)-M.dfMagnetization(v,-.001))/.002;close(slope,M.dfSusceptibility(v).slopePerT,1e-5*Math.max(1,slope));fixtures.push({values:v,reading:r});
 }
}
const eu={...M.DF_DEFAULTS,mode:'f',lanthanide:'Eu',temperature:2,lambda:350};close(M.dfSusceptibility(eu).slopePerT,8*Bcm/350,1e-10);eq(M.dfAt(eu).muGround,0);ok(M.dfAt(eu).muApp>0);
for(const B of [-10,-1,.001,1,10])close(M.dfMagnetization(M.DF_DEFAULTS,B),Math.tanh(C.muB*B/(C.kB*298)),1e-12);
const peak=M.dfSpectrum(M.DF_DEFAULTS,500);close(peak.absorbance,.2);close(peak.transmittance,10**(-.2));close(M.dfSpectrum(M.DF_DEFAULTS,1e7/(20000+900)).epsilon,5);
eq(M.dfColour({...M.DF_DEFAULTS,concentration:0}).hex,'#ffffff');eq(M.dfColour({...M.DF_DEFAULTS,mode:'f'}),null);
for(const family of ['d','f'])for(const orb of family==='d'?M.DF_D_ORBITALS:M.DF_F_ORBITALS){let integral=0;const nt=180,np=240;for(let i=0;i<nt;i++){const theta=(i+.5)*Math.PI/nt;for(let j=0;j<np;j++){const phi=(j+.5)*2*Math.PI/np,y=M.dfPsi(family,orb,Math.sin(theta)*Math.cos(phi),Math.sin(theta)*Math.sin(phi),Math.cos(theta));integral+=y*y*Math.E**2*Math.sin(theta)*Math.PI/nt*2*Math.PI/np;}}close(integral,1,3e-4);}
close(M.dfPsi('d','xy',1,0,1),0);close(M.dfPsi('d','xy',0,1,1),0);close(M.dfPsi('d','z2',Math.sqrt(2),0,1),0,1e-15);
close(M.dfPsi('d','xy',3/Math.sqrt(2),3/Math.sqrt(2),0,4),0,1e-14);for(const r of [(14-Math.sqrt(28))/4,(14+Math.sqrt(28))/4])close(M.dfPsi('d','xy',r/Math.sqrt(2),r/Math.sqrt(2),0,5),0,1e-14);
for(const cn of [6,8]){const radii=Object.values(M.DF_LANTHANIDES).map(i=>i.radii[cn]);for(let i=1;i<radii.length;i++)ok(radii[i]<radii[i-1]);close(M.dfAt({...M.DF_DEFAULTS,cn}).totalContractionPercent,100*(radii[0]-radii.at(-1))/radii[0]);close(M.DF_CONGENERS[cn].Zr4-M.DF_CONGENERS[cn].Hf4,.01);}
for(const speed of [.25,.5,1,2,4])for(const mode of ['d','f','trend']){const v={...M.DF_DEFAULTS,mode,speed};let split=v;for(let i=0;i<10;i++)split=M.dfAdvance(split,.1);const whole=M.dfAdvance(v,1);close(split.wavelength,whole.wavelength,1e-9);close(split.field,whole.field,1e-12);}
const book={...M.dfNotebook(),notes:'Quote" and,\nnotes',records:[M.dfRecord(1,M.DF_DEFAULTS)]};eq(M.dfParse(book),book);assert.throws(()=>M.dfParse({...book,records:[...book.records,...book.records]}));assert.throws(()=>M.dfParse({...book,records:[{...book.records[0],reading:{...book.records[0].reading,muApp:999}}]}));ok(M.dfCsv(book).includes('"chiM"'));eq(M.dfCurveCsv(M.DF_DEFAULTS).split('\n').length,382);
await mkdir('docs/chemistry-91-audit',{recursive:true});await writeFile('docs/chemistry-91-audit/df-block-reference-fixtures.json',JSON.stringify(fixtures));console.log(`PASS:${checks} counted d/f occupancy,LS Hamiltonian,Kubo/VanVleck,spin,Beer-Lambert,orbital normalization,nodes,radii,clock and notebook checks;${fixtures.length} independent fixtures.`);
