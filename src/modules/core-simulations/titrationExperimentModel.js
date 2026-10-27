// Deterministic stoichiometric teaching models; concentrations in mol/L, volumes in mL.
export const TITRATION_EXPERIMENTS = {
  'washing-soda-carbonate': { name:'Estimation of Carbonate in Washing Soda', type:'carbonate', titrant:'HCl', indicator:'Methyl orange', ratio:2, concentration:0.1, analyte:0.04, color:'#e6bb27', equation:'CO₃²⁻ + 2 H⁺ → H₂CO₃ ⇌ CO₂ + H₂O', assumption:'Closed carbonate equilibrium at 25 °C, ideal activities; no CO₂ loss. Assay reported as anhydrous Na₂CO₃ equivalent, not hydrate purity.' },
  'baking-soda-bicarbonate': { name:'Estimation of Bicarbonate in Baking Soda', type:'bicarbonate', titrant:'HCl', indicator:'Methyl orange', ratio:1, concentration:0.1, analyte:0.1, color:'#e6bb27', equation:'HCO₃⁻ + H⁺ → H₂CO₃ ⇌ CO₂ + H₂O', assumption:'Closed carbonate equilibrium at 25 °C, ideal activities. Methyl-orange endpoint differs slightly from exact equivalence.' },
  'carbonate-bicarbonate-mixture': { name:'Carbonate and Bicarbonate in a Mixture', type:'mixture', titrant:'HCl', indicator:'Phenolphthalein → methyl orange', ratio:2, concentration:0.1, analyte:0.04, color:'#df4a99', equation:'CO₃²⁻ + H⁺ → HCO₃⁻; HCO₃⁻ + H⁺ → H₂CO₃', assumption:'Sequential endpoints on one aliquot; V₂ is the cumulative titre. n(CO₃²⁻)=CV₁; n(HCO₃⁻)=C(V₂−2V₁). No other bases.' },
  'antacid-alkali': { name:'Alkali Content in an Antacid', type:'back', titrant:'NaOH', indicator:'Phenolphthalein', ratio:1, concentration:0.1, analyte:0.0736, color:'#e5f0f3', equation:'H⁺(remaining) + OH⁻ → H₂O', assumption:'Known 5.000 mmol HCl initially added to one tablet; model neutralising capacity 3.160 mmol H⁺. CO₂ expelled before back-titration. Not a dose recommendation.' },
  'iron-dichromate': { name:'Fe(II) with Potassium Dichromate', type:'redox', titrant:'K₂Cr₂O₇', indicator:'Diphenylamine sulfonate', ratio:6, concentration:0.016667, analyte:0.1, color:'#a8c77a', equation:'Cr₂O₇²⁻ + 6 Fe²⁺ + 14 H⁺ → 2 Cr³⁺ + 6 Fe³⁺ + 7 H₂O', assumption:'Sufficient sulfuric acid; Fe(III) complexation by phosphoric acid. Quantitative 1:6 reaction; indicator transition schematic. Cr(VI) simulation only.' },
  'iron-permanganate': { name:'Fe(II) with KMnO₄ (Oxalate Standard)', type:'permanganate', titrant:'KMnO₄', indicator:'Self-indicator', ratio:5, concentration:0.02, analyte:0.1, color:'#f4e59b', equation:'MnO₄⁻ + 5 Fe²⁺ + 8 H⁺ → Mn²⁺ + 5 Fe³⁺ + 4 H₂O', assumption:'Acidic medium; quantitative 1:5 stoichiometry. Standardise using 2 MnO₄⁻ per 5 C₂O₄²⁻. Color schematic, no kinetic prediction.' },
  'copper-iodometry': { name:'Cu(II) Iodometric Titration', type:'iodometry', titrant:'Na₂S₂O₃', indicator:'Starch added near endpoint', ratio:1, concentration:0.05, analyte:0.05, color:'#b17a22', equation:'2 Cu²⁺ + 4 I⁻ → 2 CuI + I₂; I₂ + 2 S₂O₃²⁻ → 2 I⁻ + S₄O₆²⁻', assumption:'Excess iodide; no iodine loss or side reactions. One mole Cu²⁺ corresponds to one mole thiosulfate. CuI remains as a white suspension.' },
  'edta-magnesium': { name:'Estimation of Mg²⁺ by EDTA', type:'magnesium', titrant:'EDTA', indicator:'Eriochrome Black T · pH 10', ratio:1, concentration:0.01, analyte:0.01, color:'#963d63', equation:'Mg²⁺ + H₂Y²⁻ → MgY²⁻ + 2 H⁺', assumption:'Ammoniacal pH 10 buffer, no interfering metals. Quantitative 1:1 complexation. Color transition schematic; conditional formation constants not fitted.' },
  'edta-copper': { name:'Estimation of Cu²⁺ by EDTA', type:'copper', titrant:'EDTA', indicator:'Murexide · ammoniacal buffer', ratio:1, concentration:0.01, analyte:0.01, color:'#dcb347', equation:'Cu²⁺ + H₂Y²⁻ → CuY²⁻ + 2 H⁺', assumption:'Ammoniacal medium with controlled pH and no interfering metals. Quantitative 1:1 complexation; murexide endpoint color schematic.' },
};

export function titrationDefaults(id) {
  const spec=TITRATION_EXPERIMENTS[id];
  return { concentration:spec.concentration, analyte:spec.analyte, sampleMass:id==='washing-soda-carbonate'?2.8614:2.100165, sampleAssay:id==='washing-soda-carbonate'?105.99/286.14*100:100, aliquot:25, bicarbonate:0.02, capacity:3.16, delivered:0, indicator:id==='carbonate-bicarbonate-mixture'?'phenolphthalein':'default', starch:false, prepared:false, conditioned:false, standardised:id!=='iron-permanganate', oxalate:0.05, oxalateVolume:25, standardTitre:25 };
}

const positive=(n,name)=>{if(!Number.isFinite(n)||n<=0)throw new RangeError(`${name} must be positive and finite`);return n;};
export function sampleConcentration(id,values) {
  if(!['washing-soda-carbonate','baking-soda-bicarbonate'].includes(id))return positive(values.analyte,'Sample concentration');
  const mass=positive(values.sampleMass,'Sample mass'),assay=positive(values.sampleAssay,'Sample assay');
  if(assay>100)throw new RangeError('Mass percentage cannot exceed 100');
  return mass*assay/100/(id==='washing-soda-carbonate'?105.99:84.0066)/.25;
}

export function carbonateSpecies(totalMoles,ph) {
  if(!Number.isFinite(totalMoles)||totalMoles<0||!Number.isFinite(ph))throw new RangeError('Invalid carbonate state');
  const h=10**-ph,k1=10**-6.35,k2=10**-10.33,d=h*h+k1*h+k1*k2;
  return {'CO₂(aq) + H₂CO₃':totalMoles*h*h/d,'HCO₃⁻':totalMoles*k1*h/d,'CO₃²⁻':totalMoles*k1*k2/d};
}
export function standardisePermanganate(oxalate,volume,titre) {
  return 2/5*positive(oxalate,'Oxalate concentration')*positive(volume,'Oxalate volume')/positive(titre,'Standard titre');
}

export function carbonatePH(carbonateMoles,bicarbonateMoles,acidMoles,volumeL) {
  const total=(carbonateMoles+bicarbonateMoles)/positive(volumeL,'Total volume');
  const sodium=(2*carbonateMoles+bicarbonateMoles)/volumeL, chloride=acidMoles/volumeL;
  const k1=10**-6.35,k2=10**-10.33,kw=1e-14;
  let lo=-14,hi=0;
  for(let i=0;i<90;i++){
    const mid=(lo+hi)/2,h=10**mid,d=h*h+k1*h+k1*k2;
    const charge=h+sodium-kw/h-total*(k1*h+2*k1*k2)/d-chloride;
    if(charge>0)hi=mid;else lo=mid;
  }
  return -(lo+hi)/2;
}

export function titrationState(id,values) {
  const spec=TITRATION_EXPERIMENTS[id];if(!spec)throw new Error('Unknown titration');
  const c=positive(values.concentration,'Titrant concentration'),ca=sampleConcentration(id,values),v=positive(values.aliquot,'Aliquot');
  if(!Number.isFinite(values.delivered)||values.delivered<0||values.delivered>50)throw new RangeError('Burette delivery must be 0–50 mL');
  if(!Number.isFinite(values.bicarbonate)||values.bicarbonate<0)throw new RangeError('Bicarbonate must be nonnegative');
  const n=ca*v/1000, nb=spec.type==='mixture'?values.bicarbonate*v/1000:0;
  const first=spec.type==='mixture'?n/c*1000:null;
  const redox=['redox','permanganate'].includes(spec.type);
  const equivalents=spec.type==='mixture'?2*n+nb:redox?n/spec.ratio:spec.ratio*n;
  if(spec.type==='back'&&(!Number.isFinite(values.capacity)||values.capacity<0||values.capacity>=5))throw new RangeError('Capacity must be below the 5 mmol acid excess');
  const acidRemaining=(5-values.capacity)/1000;
  const endpoint=spec.type==='back'?acidRemaining/c*1000:equivalents/c*1000;
  const delivered=values.delivered,nt=c*delivered/1000;
  const consumed=spec.type==='back'?Math.min(nt,acidRemaining):Math.min(n,nt*(redox?spec.ratio:spec.type==='mixture'?0.5:1/spec.ratio));
  const extent=Math.min(1,delivered/endpoint),remaining=Math.max(0,(spec.type==='back'?acidRemaining:n)-consumed),totalVolume=(spec.type==='back'?50:v)+delivered;
  let ph=null,color=spec.color,observation='Reaction in progress';
  if(['carbonate','bicarbonate','mixture'].includes(spec.type)){
    ph=carbonatePH(spec.type==='bicarbonate'?0:n,spec.type==='bicarbonate'?n:nb,nt,totalVolume/1000);
    const phen=spec.type==='mixture'&&values.indicator==='phenolphthalein';
    color=phen?(ph>9.5?'#e84a9c':ph>8.2?'#f1b6d2':'#e3eff1'):(ph>4.4?'#edcb32':ph>3.1?'#ec8c35':'#d84e46');
    observation=phen?(ph>8.2?'Pink phenolphthalein; first endpoint not yet reached.':'Phenolphthalein is colourless. Record V₁ before changing indicator.'):(ph>4.4?'Methyl orange is yellow.':ph>3.1?'Methyl orange transition: orange.':'Red indicator: acid excess.');
  }else if(spec.type==='back'){
    const delta=(nt-acidRemaining)/(totalVolume/1000),root=Math.sqrt(delta*delta+4e-14),oh=delta>=0?(delta+root)/2:2e-14/(root-delta);
    ph=14+Math.log10(Math.max(1e-14,oh));
    color=ph>8.2?'#ef9cc9':'#e4f1f3';observation=ph>8.2?'Phenolphthalein pink: NaOH excess.':'Residual acid is being neutralised.';
  }else if(spec.type==='iodometry'){
    color=extent>=1?'#e7e4cf':values.starch?'#263675':extent>.9?'#dfc982':'#a97923';
    observation=extent>=1?'Iodine consumed; milky CuI suspension remains.':values.starch?'Blue starch–iodine complex remains.':'Iodine is being reduced to iodide; add starch near the endpoint.';
  }else if(spec.type==='permanganate'){
    color=extent>=1?'#e8a6c7':'#f3e6ac';observation=extent>=1?'Unconsumed permanganate gives a persistent pale pink.':'Permanganate is reduced; Fe²⁺ is oxidised to Fe³⁺.';
  }else if(spec.type==='redox'){
    color=extent>=1?'#66558d':'#a1ba6d';observation=extent>=1?'Oxidised indicator is violet over green Cr³⁺.':'Fe²⁺ reduces dichromate; Cr³⁺ forms.';
  }else{
    color=extent>=1?(spec.type==='magnesium'?'#63b5e8':'#9272c6'):spec.color;
    observation=extent>=1?(spec.type==='magnesium'?'Free EBT is sky blue.':'Free murexide is purple-violet.'):'Metal–indicator color persists; EDTA is binding free metal.';
  }
  const found=spec.type==='back'?(5-c*delivered):c*delivered*(redox?spec.ratio:1/spec.ratio)/v;
  const species=['carbonate','bicarbonate','mixture'].includes(spec.type)?carbonateSpecies(n+nb,ph):redox?{'Fe²⁺':remaining,'Fe³⁺':consumed}:['magnesium','copper'].includes(spec.type)?{'Uncomplexed metal (stoichiometric)':remaining,'Metal–EDTA':consumed}:{};
  return { endpoint,first,extent,remaining,consumed,nt,ph,color,observation,totalVolume,found,sampleConcentration:ca,species,iodineMoles:spec.type==='iodometry'?Math.max(0,(n-nt)/2):0,assay:spec.type==='carbonate'?found*0.25*105.99/values.sampleMass*100:spec.type==='bicarbonate'?found*0.25*84.0066/values.sampleMass*100:null };
}

export function mixtureFromTitres(c,v1,v2) {
  positive(c,'HCl concentration');
  if(![v1,v2].every(Number.isFinite)||v1<0||v2<2*v1)throw new RangeError('Cumulative V₂ must be at least 2V₁');
  return {carbonate:c*v1,bicarbonate:c*(v2-2*v1)}; // mmol
}
