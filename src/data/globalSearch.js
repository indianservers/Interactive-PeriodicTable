import { libraryEntries } from './homeLibrary.js';
import { studioEntries, labEntries } from './experienceDirectory.js';
import { elements } from './elements.js';
import { ALL_MOLECULES } from './molecules.js';
import { labToolCatalog } from './syllabus.js';

const records = [...libraryEntries.filter(x=>!x.upcoming), ...studioEntries, ...labEntries];
const pageIndex = new Map();
for (const entry of records) {
  const id=entry.path || entry.id, previous=pageIndex.get(id);
  pageIndex.set(id,{type:entry.type || (entry.kind==='Workspace'?'Workspace':labEntries.some(lab=>lab.id===entry.id)?'Lab':'Page'),label:entry.title,detail:entry.description || entry.categoryTitle || 'Open page',id,keywords:[previous?.keywords,previous?.label,entry.title,entry.id,entry.subject,entry.subgroup].filter(Boolean).join(' ')});
}
export const globalPageEntries = [...pageIndex.values()];
// Only offer tools that have an implemented destination; never send a tool result to a generic catalogue.
const toolRoutes = {titration:'lab/titration',distillation:'simulations/distillation-crystallisation',chromatography:'simulations/chromatography-separation',spectroscopy:'modules/spectroscopy','ph-meter':'simulations/ph-metry-hcl','electrochemical-cell':'modules/physical/electrochemistry',equilibrium:'modules/physical/chemical-equilibrium',osmosis:'modules/physical/solutions-colligative-properties'};
const normalize = value => String(value).normalize('NFKD').toLowerCase().replace(/[₀-₉]/g,c=>String('₀₁₂₃₄₅₆₇₈₉'.indexOf(c))).replace(/[^a-z0-9]+/g,' ').trim();
export function searchGlobal(query, extraPages = []) {
  const q=normalize(query), words=q.split(' ').filter(Boolean);
  const entries=[...new Map([...extraPages.map(x=>({type:'Page',label:x.label,id:x.id,detail:'Open page'})),...globalPageEntries].map(x=>[x.id,x])).values()];
  if(q) {
    entries.push(...elements.map(el=>({type:'Element',label:`${el.name} (${el.symbol})`,detail:`#${el.atomicNumber} ${el.category}`,keywords:`${el.symbol} ${el.atomicNumber}`,element:el})));
    entries.push(...ALL_MOLECULES.map(m=>({type:'Molecule',label:m.name,detail:m.formula,keywords:m.iupacName,id:`molecule?compound=${encodeURIComponent(m.name)}`})));
    entries.push(...labToolCatalog.filter(t=>toolRoutes[t.id]).map(t=>({type:'Tool',label:t.title,detail:t.type,keywords:t.id,id:toolRoutes[t.id]})));
  }
  return entries.filter(x=>words.every(w=>normalize(`${x.label} ${x.detail} ${x.id || ''} ${x.keywords || ''}`).includes(w))).sort((a,b)=>{
    const score=x=>normalize(x.label)===q?100:normalize(x.label).includes(q)?20:0;
    return score(b)-score(a);
  });
}
