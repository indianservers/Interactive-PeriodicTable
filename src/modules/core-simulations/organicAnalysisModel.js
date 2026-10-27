// Restricted reference panel: qualitative outcomes, not a general mixture solver.
export const ORGANIC_CASES = [
 {id:'A',name:'Benzoic acid',group:'Carboxylic acid',formula:'C7H6O2',smiles:'O=C(O)c1ccccc1',required:['bicarbonate','dnph']},
 {id:'B',name:'Phenol',group:'Phenol',formula:'C6H6O',smiles:'Oc1ccccc1',required:['ferric','bicarbonate']},
 {id:'C',name:'Aniline',group:'Primary aromatic amine',formula:'C6H7N',smiles:'Nc1ccccc1',required:['acid','dnph']},
 {id:'D',name:'Benzaldehyde',group:'Aldehyde',formula:'C7H6O',smiles:'O=Cc1ccccc1',required:['dnph','tollens']},
 {id:'E',name:'Acetophenone',group:'Ketone',formula:'C8H8O',smiles:'CC(=O)c1ccccc1',required:['dnph','tollens']},
 {id:'F',name:'Benzamide',group:'Primary carboxamide',formula:'C7H7NO',smiles:'NC(=O)c1ccccc1',required:['hydrolysis','dnph']},
];
export const ORGANIC_TESTS = {
 bicarbonate:{name:'Bicarbonate response',control:'A',min:20,max:30,seconds:15,color:'#ddeaf0',effect:'gas',positive:['A'],positiveText:'CO₂ effervescence supports a carboxylic acid in this panel.',negativeText:'No diagnostic bicarbonate effervescence.',equations:{A:'C₇H₆O₂ + HCO₃⁻ → C₇H₅O₂⁻ + CO₂ + H₂O'}},
 base:{name:'NaOH acid/base classification',control:'B',min:20,max:30,seconds:15,color:'#ddeaf0',effect:'salt',positive:['A','B'],positiveText:'An ionic sodium salt is expected in excess aqueous base. This supports an acidic functional group; it does not distinguish acid from phenol.',negativeText:'No diagnostic acidic-group salt response in this restricted panel.',equations:{A:'C₇H₆O₂ + OH⁻ → C₇H₅O₂⁻ + H₂O',B:'C₆H₆O + OH⁻ → C₆H₅O⁻ + H₂O'}},
 acid:{name:'HCl amine-salt classification',control:'C',min:20,max:30,seconds:15,color:'#ddeaf0',effect:'salt',positive:['C'],positiveText:'Anilinium salt forms in aqueous acid, consistent with a basic amine. Solubility is a categorical screening reference, not a partition calculation.',negativeText:'No diagnostic amine-salt response in this panel; amide basicity is not treated as amine basicity.',equations:{C:'C₆H₇N + H⁺ → C₆H₈N⁺'}},
 dnph:{name:'2,4-DNPH carbonyl test',control:'E',min:20,max:30,seconds:20,color:'#e5aa37',effect:'precipitate',positive:['D','E'],positiveText:'Yellow–orange hydrazone precipitate supports an aldehyde or ketone. It does not identify the carbonyl compound by itself.',negativeText:'No hydrazone precipitate. The yellow reagent background is not a positive result.',equations:{D:'C₇H₆O + C₆H₆N₄O₄ → C₁₃H₁₀N₄O₄ + H₂O',E:'C₈H₈O + C₆H₆N₄O₄ → C₁₄H₁₂N₄O₄ + H₂O'}},
 tollens:{name:'Tollens aldehyde test · virtual',control:'D',min:35,max:50,seconds:25,color:'#d8e5ed',effect:'silver',positive:['D'],positiveText:'A silver deposit forms, consistent with oxidation of the aldehyde. This response is not unique to aldehydes outside the curated panel.',negativeText:'No silver deposit with the working positive control. The curated ketone does not reduce this reagent.',equations:{D:'C₇H₆O + 2[Ag(NH₃)₂]⁺ + 3OH⁻ → C₇H₅O₂⁻ + 2Ag + 4NH₃ + 2H₂O'}},
 ferric:{name:'Ferric chloride phenol screen',control:'B',min:20,max:30,seconds:15,color:'#784ba5',effect:'complex',positive:['B'],positiveText:'Violet ferric–phenolate coloration supports phenol in this panel. Other ligands can also give colors; the test is not universally specific.',negativeText:'No diagnostic violet phenol complex. Reagent background or incidental turbidity is not scored as positive.',equations:{}},
 hydrolysis:{name:'Primary-amide hydrolysis · virtual',control:'F',min:80,max:90,seconds:30,color:'#dcebf0',effect:'ammonia',positive:['F'],positiveText:'Ammonia indication during alkaline hydrolysis supports this primary carboxamide. Carboxylate remains in the liquid; acidification is a separate work-up.',negativeText:'No primary-amide ammonia response in this restricted panel. This is not a general nitrogen-element test.',equations:{F:'C₇H₇NO + OH⁻ → C₇H₅O₂⁻ + NH₃'}},
};
export const ORGANIC_SOURCES = [
 ['Nichols: qualitative chemical tests','https://chem.libretexts.org/Bookshelves/Organic_Chemistry/Organic_Chemistry_Lab_Techniques_%28Nichols%29/06%3A_Miscellaneous_Techniques/6.04%3A_Chemical_Tests/6.4D%3A_Individual_Tests'],
 ['OpenStax: amide hydrolysis','https://openstax.org/books/organic-chemistry/pages/21-7-chemistry-of-amides'],
 ['OpenStax: amines and amides','https://openstax.org/books/chemistry-2e/pages/20-4-amines-and-amides'],
];
export function organicCase(id){const item=ORGANIC_CASES.find(c=>c.id===id);if(!item)throw new RangeError('Choose unknown A–F.');return item;}
export function organicTest(id){if(!Object.hasOwn(ORGANIC_TESTS,id))throw new RangeError('Unknown assay.');return ORGANIC_TESTS[id];}
export function organicAssay({caseId='A',role='unknown',test='bicarbonate',temperature=25,fresh=true}){
 organicCase(caseId);const spec=organicTest(test);
 if(!['unknown','control','blank'].includes(role))throw new RangeError('Unknown aliquot role.');
 if(!Number.isFinite(temperature)||temperature<20||temperature>90||typeof fresh!=='boolean')throw new RangeError('Invalid assay conditions.');
 const actual=role==='control'?spec.control:role==='blank'?null:caseId;
 const valid=temperature>=spec.min&&temperature<=spec.max&&(test!=='tollens'||fresh);
 const positive=valid&&actual!==null&&spec.positive.includes(actual);
 const observation=!valid?`No inference: reference assay requires ${spec.min}–${spec.max} °C${test==='tollens'?' and fresh virtual reagent':''}. Repeat on a fresh portion.`:role==='blank'?`Reagent blank: no diagnostic response. ${test==='dnph'?'Yellow reagent color remains.':test==='ferric'?'Pale yellow reagent background remains.':''}`:positive?spec.positiveText:spec.negativeText;
 return {caseId,role,test,temperature,fresh,valid,positive,observation,effect:positive?spec.effect:'none',color:positive?spec.color:test==='dnph'?'#e6c66c':test==='ferric'?'#e3d6a0':'#dceaf0',equation:positive?spec.equations[actual]||'Fe(III)–phenolate coordination; species and stoichiometry depend on medium.':'No diagnostic reaction assigned.',seconds:spec.seconds};
}
export function prepareOrganicTube(caseId,role){organicCase(caseId);if(!['unknown','control','blank'].includes(role))throw new RangeError('Unknown aliquot role.');return {caseId,role,assay:null,elapsed:0,settled:false};}
export function startOrganicAssay(tube,conditions){
 if(!tube||tube.assay)throw new RangeError('Prepare a fresh aliquot before applying one assay.');
 return {...tube,assay:organicAssay({...conditions,caseId:tube.caseId,role:tube.role}),elapsed:0};
}
export function advanceOrganicTube(tube,seconds){
 if(!Number.isFinite(seconds)||seconds<0||seconds>3600)throw new RangeError('Advance must be 0–3600 illustration seconds.');
 return tube?.assay?{...tube,elapsed:Math.min(tube.assay.seconds,tube.elapsed+seconds)}:tube;
}
export function organicTubeComplete(tube){return !!tube?.assay&&tube.elapsed>=tube.assay.seconds;}
export function recordOrganicTube(tube){if(!organicTubeComplete(tube))throw new RangeError('Finish the assay illustration before recording.');return {caseId:tube.caseId,role:tube.role,test:tube.assay.test,temperature:tube.assay.temperature,fresh:tube.assay.fresh};}
export function controlledOrganicEvidence(records,caseId){
 organicCase(caseId);
 return records.filter(r=>r.caseId===caseId&&r.role==='unknown').map(r=>organicAssay(r)).filter(r=>r.valid&&['control','blank'].every(role=>records.some(c=>c.caseId===caseId&&c.role===role&&c.test===r.test&&(()=>{const result=organicAssay(c);return result.valid&&(role==='control'?result.positive:!result.positive);})())));
}
export function organicCandidates(records,caseId){const evidence=controlledOrganicEvidence(records,caseId);return ORGANIC_CASES.filter(c=>evidence.every(r=>organicTest(r.test).positive.includes(c.id)===r.positive));}
export function evaluateOrganicIdentification(caseId,claim,records){
 const expected=organicCase(caseId);organicCase(claim);
 const evidence=controlledOrganicEvidence(records,caseId),tested=new Set(evidence.map(r=>r.test)),missing=expected.required.filter(t=>!tested.has(t));
 return {correct:claim===caseId,complete:claim===caseId&&!missing.length,missing,candidates:organicCandidates(records,caseId).map(c=>c.id),controlledTests:[...tested]};
}
function validateRecord(r){if(!r||typeof r!=='object'||typeof r.caseId!=='string'||typeof r.role!=='string'||typeof r.test!=='string'||typeof r.temperature!=='number'||typeof r.fresh!=='boolean')throw new RangeError('Invalid notebook record.');organicAssay(r);return {caseId:r.caseId,role:r.role,test:r.test,temperature:r.temperature,fresh:r.fresh};}
export function parseOrganicNotebook(input){
 const data=typeof input==='string'?JSON.parse(input):input;
 if(!data||data.schema!==1||data.lab!=='organic-qualitative-analysis'||!Array.isArray(data.records)||data.records.length>2000||typeof data.notes!=='string'||data.notes.length>100000)throw new RangeError('Invalid organic-analysis notebook.');
 return {schema:1,lab:'organic-qualitative-analysis',records:data.records.map(validateRecord),notes:data.notes};
}
export function organicNotebookCsv(records){
 const quote=v=>`"${String(v).replaceAll('"','""')}"`;
 return [['unknown','aliquot','test','temperature_C','fresh_reagent','valid','positive','observation'],...records.map(r=>{const a=organicAssay(r);return [r.caseId,r.role,organicTest(r.test).name,r.temperature,r.fresh,a.valid,a.positive,a.observation];})].map(row=>row.map(quote).join(',')).join('\n');
}
export const ORGANIC_ROLES=['unknown','control','blank'];
export function parseOrganicWorkspace(input){
 const data=typeof input==='string'?JSON.parse(input):input;
 if(!data||data.schema!==1||!Array.isArray(data.tubes)||data.tubes.length!==3||!Number.isInteger(data.selected)||data.selected<0||data.selected>2||!Number.isFinite(data.speed)||![.25,.5,1,2,4].includes(data.speed))throw new RangeError('Invalid assay workspace.');
 organicCase(data.caseId);organicTest(data.test);
 if(!Number.isFinite(data.temperature)||data.temperature<20||data.temperature>90||typeof data.fresh!=='boolean')throw new RangeError('Invalid workspace conditions.');
 const notebook=parseOrganicNotebook(data.notebook);
 const tubes=data.tubes.map((t,i)=>{
  if(t===null)return null;
  if(!t||t.caseId!==data.caseId||t.role!==ORGANIC_ROLES[i]||!Number.isFinite(t.elapsed)||t.elapsed<0||typeof t.settled!=='boolean')throw new RangeError('Invalid tube.');
  let tube=prepareOrganicTube(t.caseId,t.role);
  if(t.assay){validateRecord(t.assay);if(t.assay.caseId!==t.caseId||t.assay.role!==t.role)throw new RangeError('Assay belongs to a different sample.');tube=startOrganicAssay(tube,t.assay);if(t.elapsed>tube.assay.seconds)throw new RangeError('Assay illustration exceeds its duration.');}
  else if(t.elapsed!==0||t.settled)throw new RangeError('An untested aliquot cannot have an assay history.');
  if(t.settled&&(!organicTubeComplete({...tube,elapsed:t.elapsed})||tube.assay?.effect!=='precipitate'))throw new RangeError('Only a completed precipitate can be settled.');
  return {...tube,elapsed:t.elapsed,settled:t.settled};
 });
 return {schema:1,caseId:data.caseId,tubes,selected:data.selected,test:data.test,temperature:data.temperature,fresh:data.fresh,speed:data.speed,notebook};
}
