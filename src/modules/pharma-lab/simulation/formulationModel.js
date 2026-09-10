import { percentRsd } from "../calculations/scientificCalculations.js";

export const defaultTabletFormula = Object.freeze([
  { id:"api", component:"Paracetamol (API)", role:"Active ingredient", mg:500 },
  { id:"mcc", component:"Microcrystalline cellulose", role:"Diluent", mg:90 },
  { id:"starch", component:"Pregelatinized starch", role:"Binder", mg:30 },
  { id:"pvp", component:"PVP K30", role:"Binder", mg:15 },
  { id:"ccs", component:"Croscarmellose sodium", role:"Disintegrant", mg:10 },
  { id:"silica", component:"Colloidal silicon dioxide", role:"Glidant", mg:2 },
  { id:"stearate", component:"Magnesium stearate", role:"Lubricant", mg:3 },
]);

export const formulaTotal = formula => formula.reduce((sum,item)=>sum+Number(item.mg||0),0);

export function validateTabletFormula(formula,targetWeight){
  if(!Array.isArray(formula)||!formula.length)return{valid:false,message:"Add at least one formulation component."};
  if(formula.some(item=>!Number.isFinite(Number(item.mg))||Number(item.mg)<0))return{valid:false,message:"Component amounts must be finite, non-negative values."};
  const total=formulaTotal(formula),difference=total-Number(targetWeight);
  return{valid:Math.abs(difference)<0.01,total,difference,message:Math.abs(difference)<0.01?"Formula totals exactly 100% of target weight.":`Formula is ${Math.abs(difference).toFixed(1)} mg ${difference>0?"over":"under"} target.`};
}

export function simulateTabletBatch({targetWeight=650,turretSpeed=35,force=12.5,fillDepth=8.2,formula=defaultTabletFormula}){
  const validation=validateTabletFormula(formula,targetWeight);
  if(!validation.valid)throw new RangeError(validation.message);
  const weights=Array.from({length:30},(_,i)=>targetWeight+(Math.sin(i*1.87)+Math.cos(i*.71))*(1.6+turretSpeed/32));
  const hardnessMean=55+force*3.05+(fillDepth-8)*2.2;
  const hardness=Array.from({length:30},(_,i)=>hardnessMean+(Math.sin(i*1.31)+Math.cos(i*.53))*3.1);
  const api=formula.find(item=>item.id==="api")?.mg||0;
  const assay=api/targetWeight*100;
  const blend=Array.from({length:15},(_,i)=>99.2+Math.sin(i*1.8)*.65+Math.cos(i*.4)*.2);
  const friability=Math.max(.16,.76-force*.035+turretSpeed*.0012);
  const disintegration=Math.max(2.1,7.6+force*.16-(formula.find(item=>item.id==="ccs")?.mg||0)*.46);
  const thickness=3.25+fillDepth*.14;
  return{weights,hardness,blend,weightMean:weights.reduce((a,b)=>a+b,0)/weights.length,weightRsd:percentRsd(weights),hardnessMean,hardnessRsd:percentRsd(hardness),assay,friability,disintegration,thickness,passes:{weight:percentRsd(weights)<=5,hardness:hardnessMean>=80&&hardnessMean<=110,blend:percentRsd(blend)<=5,friability:friability<=1,disintegration:disintegration<=15,thickness:thickness>=4&&thickness<=4.8}};
}

