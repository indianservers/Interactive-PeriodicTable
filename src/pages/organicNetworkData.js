import { molecules } from './organicMolecules.js';
export const topics = ['Alkanes','Alkenes','Haloalkanes','Alcohols','Carbonyl compounds','Carboxylic acids','Esters','Amines','Aromatic compounds'];
export const reactionTypes = ['Oxidation','Reduction','Substitution','Addition','Elimination','Esterification','Hydrolysis','Acid–base'];
export const networks = {
 Alkanes:{source:'methane',title:'Alkane Reaction Network'}, Alkenes:{source:'ethene',title:'Alkene Reaction Network'},
 Haloalkanes:{source:'bromoethane',title:'Haloalkane Reaction Network'}, Alcohols:{source:'ethanol',title:'Alcohol Reaction Network'},
 'Carbonyl compounds':{source:'ethanal',title:'Carbonyl Reaction Network'}, 'Carboxylic acids':{source:'ethanoic',title:'Carboxylic Acid Reaction Network'},
 Esters:{source:'ester',title:'Ester Reaction Network'}, Amines:{source:'ethanamine',title:'Amine Reaction Network'},
 'Aromatic compounds':{source:'benzene',title:'Aromatic Reaction Network'},
};
export const references = {
 aqa:{label:'AQA: organic chemistry specification',url:'https://www.aqa.org.uk/subjects/chemistry/a-level/chemistry-7405/specification/subject-content/organic-chemistry'},
 alcohol:{label:'RSC: oxidation of ethanol',url:'https://edu.rsc.org/experiments/oxidation-of-ethanol/1757.article'},
 amines:{label:'OpenStax: basicity of amines',url:'https://openstax.org/books/organic-chemistry/pages/24-3-basicity-of-amines'},
 esters:{label:'OpenStax: chemistry of esters',url:'https://openstax.org/books/organic-chemistry/pages/21-6-chemistry-of-esters'},
 alkene:{label:'OpenStax: hydration of alkenes',url:'https://openstax.org/books/organic-chemistry/pages/8-4-hydration-of-alkenes-addition-of-h2o-by-oxymercuration'},
 hydrogenation:{label:'OpenStax: reduction of alkenes',url:'https://openstax.org/books/organic-chemistry/pages/8-6-reduction-of-alkenes-hydrogenation'},
 halogen:{label:'OpenStax: radical halogenation',url:'https://openstax.org/books/organic-chemistry/pages/10-2-preparing-alkyl-halides-from-alkanes-radical-halogenation'},
 aromatic:{label:'OpenStax: aromatic substitution',url:'https://openstax.org/books/organic-chemistry/pages/16-2-other-aromatic-substitutions'},
};
const slots = [
 {x:50,y:15,label:[80,12],path:'M50 40 C53 33 50 29 50 26'},
 {x:14,y:48,label:[24,27],path:'M40 49 C33 53 24 52 23 49'},
 {x:86,y:48,label:[80,27],path:'M60 49 C68 53 75 52 77 49'},
 {x:65,y:82,label:[86,68],path:'M56 60 C64 67 63 70 65 72'},
];
// Overall transformations, not elementary mechanisms. Inventories include coproducts.
const rows = [
 ['chlorination','Alkanes','chloromethane',['Substitution'],'Chlorination of Methane','CH₄ + Cl₂ → CH₃Cl + HCl','Cl₂','UV light','Free-radical substitution replaces C–H with C–Cl. Further substitution can occur; this is the monosubstitution equation.',['CH4','Cl2'],['CH3Cl','HCl'],'halogen'],
 ['hydration','Alkenes','ethanol',['Addition'],'Hydration to Ethanol','H₂C=CH₂ + H₂O ⇌ CH₃CH₂OH','Steam / H₃PO₄','High temperature and pressure','Acid-catalysed hydration adds H and OH across C=C. Industrial hydration is reversible.',['C2H4','H2O'],['C2H6O'],'alkene'],
 ['hydrogenation','Alkenes','ethane',['Addition','Reduction'],'Hydrogenation to Ethane','H₂C=CH₂ + H₂ → CH₃CH₃','H₂ / Ni','Heat with nickel catalyst','Hydrogen adds across C=C; the C–C bond becomes single. This is both addition and reduction.',['C2H4','H2'],['C2H6'],'hydrogenation'],
 ['hydrobromination','Alkenes','bromoethane',['Addition'],'Addition of HBr','H₂C=CH₂ + HBr → CH₃CH₂Br','HBr','Room temperature','Electrophilic addition adds hydrogen and bromine across the double bond of symmetrical ethene.',['C2H4','HBr'],['C2H5Br'],'aqa'],
 ['halo-hydrolysis','Haloalkanes','ethanol',['Substitution','Hydrolysis'],'Hydrolysis to Ethanol','CH₃CH₂Br + OH⁻ → CH₃CH₂OH + Br⁻','Aqueous NaOH','Warm under reflux','Hydroxide substitutes for bromide. Sodium ions are spectators in this net ionic equation.',['C2H5Br','OH-'],['C2H6O','Br-'],'aqa'],
 ['halo-elimination','Haloalkanes','ethene',['Elimination'],'Elimination to Ethene','CH₃CH₂Br + KOH → H₂C=CH₂ + KBr + H₂O','Ethanolic KOH','Heat under reflux','Hot ethanolic base favours elimination over substitution. H and Br are removed overall, forming C=C.',['C2H5Br','KOH'],['C2H4','KBr','H2O'],'aqa'],
 ['ammonolysis','Haloalkanes','ethanamine',['Substitution'],'Substitution to Ethanamine','CH₃CH₂Br + 2NH₃ → CH₃CH₂NH₂ + NH₄Br','Excess ethanolic NH₃','Heat in a sealed vessel','Ammonia acts as a nucleophile. Excess ammonia favours the primary amine, but further alkylation remains possible.',['C2H5Br','NH3','NH3'],['C2H7N','NH4Br'],'aqa'],
 ['oxidation','Alcohols','ethanal',['Oxidation'],'Oxidation to Ethanal','CH₃CH₂OH + [O] → CH₃CHO + H₂O','K₂Cr₂O₇ / H⁺','Gentle heat; distil','Acidified dichromate(VI) oxidises the primary alcohol. Remove ethanal as it forms to limit further oxidation; 78 °C is not a prescribed distillation temperature.',['C2H6O','O'],['C2H4O','H2O'],'alcohol'],
 ['elimination','Alcohols','ethene',['Elimination'],'Dehydration to Ethene','CH₃CH₂OH → H₂C=CH₂ + H₂O','conc. H₂SO₄','Heat, approximately 170 °C','Acid-catalysed dehydration removes water overall and forms C=C.',['C2H6O'],['C2H4','H2O'],'aqa'],
 ['acid','Alcohols','ethanoic',['Oxidation'],'Further Oxidation to Ethanoic Acid','CH₃CH₂OH + 2[O] → CH₃COOH + H₂O','Excess K₂Cr₂O₇ / H⁺','Heat under reflux','Excess acidified dichromate(VI) and reflux allow oxidation through the aldehyde to the carboxylic acid.',['C2H6O','O','O'],['C2H4O2','H2O'],'alcohol'],
 ['ester','Alcohols','ester',['Esterification'],'Esterification to Ethyl Ethanoate','CH₃CH₂OH + CH₃COOH ⇌ CH₃COOCH₂CH₃ + H₂O','CH₃COOH / H⁺','Heat under reflux','Ethanoic acid reacts with ethanol using an acid catalyst, commonly concentrated sulfuric acid. The reaction is reversible.',['C2H6O','C2H4O2'],['C4H8O2','H2O'],'esters'],
 ['carbonyl-reduction','Carbonyl compounds','ethanol',['Reduction','Addition'],'Reduction to Ethanol','CH₃CHO + 2[H] → CH₃CH₂OH','NaBH₄','Aqueous solution','Hydride addition followed by protonation converts C=O to a primary alcohol. [H] represents reducing equivalents, not hydrogen gas.',['C2H4O','H','H'],['C2H6O'],'aqa'],
 ['carbonyl-oxidation','Carbonyl compounds','ethanoic',['Oxidation'],'Oxidation of Ethanal','CH₃CHO + [O] → CH₃COOH','K₂Cr₂O₇ / H⁺','Warm under reflux','The aldehyde is oxidised to a carboxylic acid. Ketones do not undergo this same mild oxidation.',['C2H4O','O'],['C2H4O2'],'alcohol'],
 ['acid-esterification','Carboxylic acids','ester',['Esterification'],'Esterification with Ethanol','CH₃COOH + CH₃CH₂OH ⇌ CH₃COOCH₂CH₃ + H₂O','Ethanol / H⁺','Heat under reflux','The acid and alcohol form an ester and water in an acid-catalysed equilibrium.',['C2H4O2','C2H6O'],['C4H8O2','H2O'],'esters'],
 ['ester-acid-hydrolysis','Esters','ethanoic',['Hydrolysis'],'Acid Hydrolysis of the Ester','CH₃COOCH₂CH₃ + H₂O ⇌ CH₃COOH + CH₃CH₂OH','Water / dilute H⁺','Heat under reflux','Acid-catalysed hydrolysis produces ethanoic acid AND ethanol. The reverse reaction is esterification.',['C4H8O2','H2O'],['C2H4O2','C2H6O'],'esters'],
 ['ester-base-hydrolysis','Esters','ethanoate',['Hydrolysis'],'Alkaline Hydrolysis of the Ester','CH₃COOCH₂CH₃ + OH⁻ → CH₃COO⁻ + CH₃CH₂OH','Aqueous NaOH','Heat under reflux','Alkaline hydrolysis produces ethanoate AND ethanol, not the free acid. Sodium is omitted from this net ionic equation.',['C4H8O2','OH-'],['C2H3O2-','C2H6O'],'esters'],
 ['amine-protonation','Amines','ethylammonium',['Acid–base'],'Protonation of Ethanamine','CH₃CH₂NH₂ + H⁺ → CH₃CH₂NH₃⁺','Dilute HCl','Aqueous; room temperature','The nitrogen lone pair accepts a proton. The product is an ethylammonium ion; chloride is a spectator in this net ionic equation.',['C2H7N','H+'],['C2H8N+'],'amines'],
 ['nitration','Aromatic compounds','nitrobenzene',['Substitution'],'Nitration of Benzene','C₆H₆ + HNO₃ → C₆H₅NO₂ + H₂O','conc. HNO₃ / H₂SO₄','Warm; controlled temperature','Electrophilic aromatic substitution replaces a ring H with NO₂. Aromaticity is restored, rather than permanently adding across the ring.',['C6H6','HNO3'],['C6H5NO2','H2O'],'aromatic'],
];
const counters={};
export const pathways=rows.map(([id,topic,product,types,title,equation,reagent,conditions,note,reactants,products,reference])=>{
 const index=counters[topic]||0;counters[topic]=index+1;
 const source=networks[topic].source;
 return {...molecules[product],id,topic,source,product,types,type:types.join(' / '),title,equation,reagent,conditions,note,reactants,products,reference,slot:index,...slots[index],
  steps:[reagent,conditions,molecules[product].name],
  descriptions:['Start with '+molecules[source].name.toLowerCase()+'. Reagent: '+reagent+'.',conditions+'. '+note,'The highlighted organic product is '+molecules[product].name.toLowerCase()+'. The full equation includes all coproducts. '+(molecules[product].note||'')],
 };
});
export const normalizeSearch=value=>value.normalize('NFKC').toLowerCase().replace(/[⁺+−–—·/()[\]]/g,' ').replace(/\s+/g,' ').trim();
const reagentNames={K2Cr2O7:'potassium dichromate chromium VI oxidising agent',H2SO4:'sulfuric sulphuric acid',H3PO4:'phosphoric acid',HBr:'hydrogen bromide hydrobromic acid',NaOH:'sodium hydroxide',KOH:'potassium hydroxide',NH3:'ammonia',NaBH4:'sodium borohydride reducing agent',HNO3:'nitric acid',HCl:'hydrochloric acid',Cl2:'chlorine',H2:'hydrogen',Ni:'nickel'};
const moleculeAliases={ethanal:'acetaldehyde',ethanoic:'acetic acid',ester:'ethyl acetate',ethanamine:'ethylamine',ethene:'ethylene',ethylammonium:'ethanaminium',ethanoate:'acetate'};
export function reagentDescription(path){
 const tokens=normalizeSearch(path.reagent).split(' ');
 return Object.entries(reagentNames).filter(([formula])=>tokens.includes(formula.toLowerCase())).map(([,name])=>name).join('; ');
}
export function matchingPathways(search, topic, types=[]) {
 const words=normalizeSearch(search).split(' ').filter(w=>w&&!['of','to','the','with'].includes(w));
 return pathways.filter(p=>{
  const source=molecules[p.source];
  const haystack=normalizeSearch([source.name,source.formula,source.molecular,source.group,moleculeAliases[p.source]||'',p.name,p.formula,p.molecular,p.group,moleculeAliases[p.product]||'',p.topic,p.type,p.title,p.reagent,reagentDescription(p),p.conditions,p.equation].join(' '));
  return p.topic===topic && (!types.length||p.types.some(t=>types.includes(t))) && words.every(w=>haystack.includes(w));
 });
}
