export function acetateBuffer({pH=4.76,volumeMl=500,concentrationMm=100,challengeMmol=0}={}){
 if(![pH,volumeMl,concentrationMm,challengeMmol].every(Number.isFinite)||volumeMl<=0||concentrationMm<=0)throw new RangeError('Finite positive volume and concentration required');
 const pKa=4.76,ratio=10**(pH-pKa),total=concentrationMm/1000*volumeMl/1000;
 const base=total*ratio/(1+ratio),acid=total-base,added=challengeMmol/1000;
 const afterBase=base-added,afterAcid=acid+added,litres=volumeMl/1000;
 const ka=10**(-pKa),kw=1e-14,ct=total/litres;
 const sodium=base/litres+Math.max(0,-added)/litres,chloride=Math.max(0,added)/litres;
 let lower=1e-14,upper=10;
 for(let i=0;i<100;i++){const h=Math.sqrt(lower*upper);const charge=h+sodium-ct*ka/(ka+h)-kw/h-chloride;if(charge>0)upper=h;else lower=h}
 const finalPH=-Math.log10(Math.sqrt(lower*upper));
 const h=10**(-finalPH),c=concentrationMm/1000;
 return{ratio,acidStockMl:acid*1000,baseStockMl:base*1000,waterMl:volumeMl-total*1000,finalPH,capacityMm:2.303*c*ka*h/(ka+h)**2*1000,ionicStrengthMm:base/litres*1000,acidPercent:100/(1+ratio),basePercent:100*ratio/(1+ratio),bufferRemaining:afterBase>0&&afterAcid>0};
}
export function dosageRelease({form='Tablet',timeHours=0,polymer=35,particle=120,force=12,coat=80}={}){
 if(![timeHours,polymer,particle,force,coat].every(Number.isFinite)||timeHours<0||particle<=0)throw new RangeError('Invalid release-model inputs');
 const diffusionFactor=(120/particle)/((1+polymer/50)*(1+coat/100)*(1+force/30));
 if(form==='Transdermal Patch')return Math.min(100,Math.max(0,timeHours-.5)*4*diffusionFactor);
 if(form==='Tablet')return Math.min(100,38*Math.sqrt(timeHours*diffusionFactor));
 const k=(form==='Capsule'?1.2:form==='Suspension'?1.8:1)*120/particle;
 return Math.min(100,100*(1-Math.exp(-k*timeHours)));
}
