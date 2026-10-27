// Qualitative teaching cases, each constructed from two soluble salts.
export const SALT_CASES = [
  {id:'A',salts:'CuSO₄ + NaCl',ions:{Cu:1,SO4:1,Na:1,Cl:1},color:'#8fc9df'},
  {id:'B',salts:'FeCl₃ + NaNO₃',ions:{Fe:1,Cl:3,Na:1,NO3:1},color:'#e2c788'},
  {id:'C',salts:'NiCl₂ + Na₂SO₄',ions:{Ni:1,Cl:2,Na:2,SO4:1},color:'#8dc3a1'},
  {id:'D',salts:'BaCl₂ + NaNO₃',ions:{Ba:1,Cl:2,Na:1,NO3:1},color:'#dcecf1'},
  {id:'E',salts:'Na₂CO₃ + KNO₃',ions:{Na:2,CO3:1,K:1,NO3:1},color:'#dcecf1'},
];
export const SALT_IONS={Cu:{label:'Cu²⁺',charge:2},Fe:{label:'Fe³⁺',charge:3},Ni:{label:'Ni²⁺',charge:2},Ba:{label:'Ba²⁺',charge:2},Na:{label:'Na⁺',charge:1},K:{label:'K⁺',charge:1},Cl:{label:'Cl⁻',charge:-1},SO4:{label:'SO₄²⁻',charge:-2},NO3:{label:'NO₃⁻',charge:-1},CO3:{label:'CO₃²⁻',charge:-2}};
export const SALT_TESTS={
  chloride:{name:'Silver nitrate · chloride',ion:'Cl',condition:'acidic',color:'#eeece1',precipitate:'AgCl',molarMass:143.32,reagentM:.1,ratio:1,equation:'Ag⁺ + Cl⁻ → AgCl(s)',positive:'White AgCl precipitate. Confirm by dissolution in ammonia.',negative:'No silver chloride precipitate; chloride not detected.'},
  sulfate:{name:'Barium nitrate · sulfate',ion:'SO4',condition:'acidic',color:'#f2eee5',precipitate:'BaSO₄',molarMass:233.39,reagentM:.1,ratio:1,equation:'Ba²⁺ + SO₄²⁻ → BaSO₄(s)',positive:'White BaSO₄ remains in acidic conditions.',negative:'No barium sulfate precipitate; sulfate not detected.'},
  carbonate:{name:'Acid response · carbonate',ion:'CO3',condition:'untreated',color:'#dcecf1',reagentM:.1,ratio:2,equation:'CO₃²⁻ + 2 H⁺ → CO₂ + H₂O',positive:'Gas evolution consistent with carbonate. Limewater confirmation is required.',negative:'No carbonate gas response.'},
  copper:{name:'Excess ammonia · copper',ion:'Cu',condition:'ammoniacal',color:'#234cb7',reagentM:2,ratio:4,equation:'Cu²⁺ + 4 NH₃ ⇌ [Cu(NH₃)₄]²⁺',positive:'Deep blue tetraamminecopper(II) complex.',negative:'No deep blue copper complex. Other metal reactions may still occur.'},
  iron:{name:'Thiocyanate · iron(III)',ion:'Fe',condition:'acidic',color:'#aa342e',reagentM:.1,ratio:1,equation:'Fe³⁺ + SCN⁻ ⇌ [FeSCN]²⁺',positive:'Blood-red Fe(III)–thiocyanate coloration.',negative:'No Fe(III) thiocyanate red coloration.'},
  nickel:{name:'Dimethylglyoxime · nickel',ion:'Ni',condition:'ammoniacal',color:'#d45572',precipitate:'Ni(HDMG)₂',molarMass:288.91,reagentM:.05,ratio:2,equation:'Ni²⁺ + 2 H₂DMG + 2 OH⁻ → Ni(HDMG)₂(s) + 2 H₂O',positive:'Rose-red nickel dimethylglyoximate precipitate.',negative:'No rose-red nickel precipitate.'},
  barium:{name:'Sulfate response · barium',ion:'Ba',condition:'acidic',color:'#f2eee5',precipitate:'BaSO₄',molarMass:233.39,reagentM:.1,ratio:1,equation:'Ba²⁺ + SO₄²⁻ → BaSO₄(s)',positive:'White acid-resistant barium sulfate precipitate.',negative:'No barium sulfate precipitate from the sample cation.'},
  nitrate:{name:'Brown-ring demonstration · nitrate',ion:'NO3',condition:'acidic',color:'#94613c',reagentM:.3,ratio:3,equation:'NO₃⁻ + 3 Fe²⁺ + 4 H⁺ → NO + 3 Fe³⁺ + 2 H₂O',positive:'Brown nitrosyl–iron interfacial ring in this virtual demonstration.',negative:'No nitrate brown-ring response.'},
  sodium:{name:'Sodium flame · emission',ion:'Na',condition:'untreated',color:'#f4be35',reagentM:0,ratio:1,equation:'Na* → Na + hν (near 589 nm)',positive:'Strong yellow sodium emission.',negative:'No sodium yellow emission in the curated case.'},
  potassium:{name:'Potassium flame · cobalt-filtered',ion:'K',condition:'untreated',color:'#b685e2',reagentM:0,ratio:1,equation:'K* → K + hν',positive:'Lilac potassium response through a virtual cobalt-glass filter; sodium masking is suppressed.',negative:'No potassium response through the virtual filter.'},
};
export function saltCase(seed=1){if(!Number.isInteger(seed)||seed<1||seed>9999)throw new RangeError('Seed must be an integer from 1 to 9999');return SALT_CASES[(seed-1)%SALT_CASES.length];}
export function saltInventory(seed,concentration,volume){
  if(!Number.isFinite(concentration)||concentration<.002||concentration>.025)throw new RangeError('Salt concentration must be 0.002–0.025 M');
  if(!Number.isFinite(volume)||volume<.5||volume>2.5)throw new RangeError('Aliquot must be 0.5–2.5 mL');
  return Object.fromEntries(Object.entries(saltCase(seed).ions).map(([ion,n])=>[ion,n*concentration*volume/1000]));
}
export function saltReaction({seed,concentration,volume,test,condition,reagentVolume=.5}){
  const spec=SALT_TESTS[test];if(!spec)throw new RangeError('Unknown reagent test');
  const inventory=saltInventory(seed,concentration,volume);
  if(!Number.isFinite(reagentVolume)||reagentVolume<.05||reagentVolume>1)throw new RangeError('Reagent volume must be 0.05–1 mL');
  if(condition!==spec.condition)return {valid:false,observation:`Use a fresh aliquot under ${spec.condition} test conditions. No inference can be made from this invalid test.`,color:saltCase(seed).color,positive:false,test,inventory};
  const analyteMoles=inventory[spec.ion]||0,reagentMoles=spec.reagentM*reagentVolume/1000;
  if(test==='copper'&&inventory.Cu&&reagentMoles<=4*inventory.Cu)return {valid:false,positive:false,test,inventory,color:saltCase(seed).color,observation:'Ammonia is not in excess of the 4:1 ligand requirement. Increase the virtual reagent dose or use a smaller aliquot.'};
  const reactedMoles=spec.reagentM?Math.min(analyteMoles,reagentMoles/spec.ratio):0;
  const positive=analyteMoles>0;
  let observation=positive?spec.positive:spec.negative;
  const flame=['sodium','potassium'].includes(test);
  let color=positive?spec.color:saltCase(seed).color;
  if(test==='copper'&&!positive&&inventory.Fe){observation+=' Brown Fe(OH)₃ can form in ammoniacal conditions.';color='#a47a56';}
  if(test==='copper'&&!positive&&inventory.Ni){observation+=' Nickel ammine may color the solution violet; that is not a positive copper result.';color='#a7a0c7';}
  return {valid:true,test,positive,color:flame?saltCase(seed).color:color,emissionColor:flame?(positive?spec.color:'#4e9bf4'):null,observation,inventory,analyteMoles,reagentMoles,reactedMoles,precipitate:positive?spec.precipitate:test==='copper'&&inventory.Fe?'Fe(OH)₃ (interference)':null,precipitateMassMg:positive&&spec.precipitate?reactedMoles*spec.molarMass*1000:0,gasMoles:test==='carbonate'?reactedMoles:0,equation:spec.equation,volume:volume+(spec.reagentM?reagentVolume:0),condition,confirmed:positive&&['iron','nickel','sulfate','barium','nitrate','sodium','potassium'].includes(test)};
}
export function confirmSaltTest(result,confirmation){
  if(!result?.valid||!result.positive)throw new RangeError('A positive valid initial test is required');
  if(result.test==='chloride'&&confirmation==='ammonia')return {...result,confirmed:true,precipitate:null,precipitateMassMg:0,color:'#dcecf1',observation:'AgCl dissolves as [Ag(NH₃)₂]⁺. Chloride confirmed in the curated cases.',confirmationEquation:'AgCl(s) + 2 NH₃ ⇌ [Ag(NH₃)₂]⁺ + Cl⁻'};
  if(result.test==='carbonate'&&confirmation==='limewater')return {...result,confirmed:true,observation:'Evolved CO₂ makes limewater milky from CaCO₃. Carbonate confirmed in the curated cases.',confirmationEquation:'CO₂ + Ca(OH)₂ → CaCO₃(s) + H₂O'};
  if(result.test==='copper'&&confirmation==='complex')return {...result,confirmed:true,observation:result.observation+' The blue complex supports Cu²⁺ in this restricted case set; real samples require separation of interfering ions.'};
  throw new RangeError('Confirmation does not match this test');
}
export function evaluateSaltIdentification(seed,selected,evidence){
  const expected=Object.keys(saltCase(seed).ions),correct=expected.length===selected.length&&expected.every(ion=>selected.includes(ion));
  const supported=selected.filter(ion=>evidence.some(r=>r.valid&&r.confirmed&&SALT_TESTS[r.test]?.ion===ion));
  return {correct,supported,complete:correct&&supported.length===expected.length,missingEvidence:selected.filter(ion=>!supported.includes(ion))};
}
