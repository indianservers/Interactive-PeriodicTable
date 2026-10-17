// 25 °C ideal strong-acid/strong-base model, including water autoionization.
export function titrationState(acidMl,{acidM=.1,baseMl=25,baseM=.0936}={}){
 const volume=Math.max(0,Number(acidMl)||0),totalL=(baseMl+volume)/1000;
 const excess=(acidM*volume/1000-baseM*baseMl/1000)/totalL;
 const root=Math.hypot(excess,2e-7);
 const hydrogen=excess>=0?(excess+root)/2:2e-14/(root-excess);
 const ph=-Math.log10(hydrogen),pinkFraction=Math.max(0,Math.min(1,(ph-8.2)/1.8));
 return {ph,pinkFraction,indicator:ph>8.2?'Pink':'Colourless',equivalenceMl:baseM*baseMl/acidM,estimatedBaseM:acidM*volume/baseMl};
}
