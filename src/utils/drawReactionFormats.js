import { parseMolfile, structureMolfile } from './structureDrawing.js';
const escapeXml=text=>String(text).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
export function mappedMolfile(model,maps={}) {
  if(Object.keys(maps).some(id=>!model.atoms.some(a=>String(a.id)===id)))throw Error('An atom map refers to a deleted atom. Clear or reassign stale maps before exporting.');
  const lines=structureMolfile(model).split('\n');
  model.atoms.forEach((atom,i)=>{
    const label=maps[atom.id]||0;
    if(!Number.isInteger(label)||label<0||label>999)throw Error('Atom map numbers must be 1–999.');
    const line=lines[i+4].padEnd(69,' ');
    lines[i+4]=line.slice(0,60)+String(label).padStart(3)+line.slice(63);
  });
  return lines.join('\n');
}
function participantsInOrder(reaction) {
  const list=['reactant','product','agent'].flatMap(role=>reaction.participants.filter(p=>p.role===role));
  if(!list.some(p=>p.role==='reactant')||!list.some(p=>p.role==='product'))throw Error('Add a reactant and a product before exporting.');
  return list;
}
function documentFor(documents,p) {
  const doc=documents.find(d=>d.id===p.documentId);
  if(!doc?.model?.atoms.length)throw Error('Each reaction participant needs a nonempty drawing.');
  return doc;
}
export function reactionRxn(reaction,documents) {
  const list=participantsInOrder(reaction),count=role=>list.filter(p=>p.role===role).length;
  return ['$RXN','Chemistry Universe','  Chemistry Universe',String(reaction.conditions||'').replace(/[\r\n]/g,' ').slice(0,2000),[count('reactant'),count('product'),count('agent')].map(n=>String(n).padStart(3)).join(''),...list.flatMap(p=>['$MOL',mappedMolfile(documentFor(documents,p).model,p.maps)])].join('\n')+'\n';
}
export function reactionSmiles(rd,reaction,documents) {
  participantsInOrder(reaction);
  return ['reactant','agent','product'].map(role=>reaction.participants.filter(p=>p.role===role).map(p=>{
    const mol=rd.get_mol(mappedMolfile(documentFor(documents,p).model,p.maps),JSON.stringify({removeHs:false}));
    if(!mol)throw Error('Correct invalid participant structures before exporting.');
    try{return mol.get_smiles();}finally{mol.delete();}
  }).join('.')).join('>');
}
function readMolecule(rd,input,role,index) {
  let mol,roundtrip;
  try {
    mol=rd.get_mol(input,JSON.stringify({removeHs:false}));if(!mol)throw Error('Invalid molecule in reaction.');
    if(!String(input).includes('V2000'))mol.set_new_coords();
    const block=mol.get_molblock(),model=parseMolfile(block),lines=block.split('\n'),maps={};
    if(!model.atoms.length)throw Error('Reaction components cannot be empty.');
    model.atoms.forEach((a,i)=>{const n=Number(lines[i+4].slice(60,63));if(n)maps[a.id]=n;});
    roundtrip=rd.get_mol(mappedMolfile(model,maps),JSON.stringify({removeHs:false}));
    if(!roundtrip||roundtrip.get_smiles()!==mol.get_smiles())throw Error('A component uses atom properties that this editor cannot retain.');
    return {role,name:`Imported ${role} ${index+1}`,model,maps};
  } finally {roundtrip?.delete();mol?.delete();}
}
export function importReaction(rd,text) {
  if(typeof text!=='string'||text.length>2e6)throw Error('Use a reaction file smaller than 2 MB.');
  text=text.replace(/^\uFEFF/,'').replaceAll('\r','').trim();
  let components=[],conditions='';
  if(text.startsWith('$RXN')) {
    const sections=text.split(/^\$MOL[ \t]*$/m),header=sections.shift().split('\n');
    if(header[0].trim()!=='$RXN'||header[4]?.includes('V3000'))throw Error('Import an RXN V2000 file or reaction SMILES.');
    const line=header[4]||'',counts=[Number(line.slice(0,3)),Number(line.slice(3,6)),Number(line.slice(6,9)||0)];
    if(counts.some(n=>!Number.isInteger(n)||n<0)||counts[0]<1||counts[1]<1||counts.reduce((a,b)=>a+b,0)!==sections.length||sections.length>30)throw Error('Invalid RXN participant counts (maximum 30).');
    conditions=(header[3]||'').slice(0,2000);
    sections.forEach((section,i)=>{
      // $MOL is followed by exactly one line break, then the three MOL header lines.
      const block=section.replace(/^\n/,'');
      components.push(readMolecule(rd,block,i<counts[0]?'reactant':i<counts[0]+counts[1]?'product':'agent',i));
    });
  } else {
    const parts=text.split('>');if(parts.length!==3||!parts[0].trim()||!parts[2].trim())throw Error('Use reactants>agents>products reaction SMILES (or reactants>>products).');
    // Standard reaction SMILES uses dots to separate components; bracketed atoms cannot contain dots.
    parts.forEach((side,i)=>{if(side.trim())for(const input of side.split('.'))components.push(readMolecule(rd,input.trim(),['reactant','agent','product'][i],components.length));});
    if(components.length>30)throw Error('A reaction may contain up to 30 components.');
  }
  return {components,conditions,arrow:'forward'};
}
export function reactionSchemeSvg(rd,reaction,documents,coefficients={}) {
  participantsInOrder(reaction);
  const left=reaction.participants.filter(p=>p.role==='reactant'),right=reaction.participants.filter(p=>p.role==='product'),agents=reaction.participants.filter(p=>p.role==='agent');
  const cell=260,arrow=300,width=Math.max(900,(left.length+right.length)*cell+arrow+60);
  const agentNames=agents.map(p=>documentFor(documents,p).name).join(', '),conditions=[reaction.conditions,agentNames].filter(Boolean).join(' · ');
  const wrapped=conditions.match(/.{1,34}(?:\s|$)|.{1,34}/g)||[];
  const arrowY=Math.max(205,120+wrapped.length*18),height=arrowY+185;
  const draw=(p,x)=>{
    const doc=documentFor(documents,p);let mol;
    try {
      mol=rd.get_mol(mappedMolfile(doc.model,p.maps),JSON.stringify({removeHs:false}));if(!mol)throw Error('Correct invalid participant structures before image export.');
      const svg=mol.get_svg(220,190).replace(/<\?xml[^>]*\?>/g,'').replace(/<!DOCTYPE[^>]*>/g,'');
      return `<g transform="translate(${x},${arrowY-105})"><text x="10" y="-15" font-size="15">${escapeXml(doc.title.length>30?doc.title.slice(0,29)+"…":doc.title)}</text><title>${escapeXml(doc.title)}</title><text x="0" y="100" font-size="24" font-weight="bold">${coefficients[p.id]||p.coefficient||1}</text><g transform="translate(25,0)">${svg}</g></g>`;
    }finally{mol?.delete();}
  };
  const arrowX=30+left.length*cell;
  let body=left.map((p,i)=>draw(p,30+i*cell)+(i<left.length-1?`<text x="${270+i*cell}" y="${arrowY}" font-size="28">+</text>`:'')).join('');
  body+=wrapped.map((line,i)=>`<text x="${arrowX+arrow/2}" y="${105+i*18}" text-anchor="middle" font-size="13">${escapeXml(line.trim())}</text>`).join('');
  body+=reaction.arrow==='equilibrium'?`<path fill="none" stroke="#173553" stroke-width="2" d="M${arrowX+20} ${arrowY-10} h250 l-14 -7 m14 7 l-14 7 M${arrowX+270} ${arrowY+10} h-250 l14 -7 m-14 7 l14 7"/>`:`<path fill="none" stroke="#173553" stroke-width="2" d="M${arrowX+20} ${arrowY} h250 l-14 -8 m14 8 l-14 8"/>`;
  body+=right.map((p,i)=>draw(p,arrowX+arrow+i*cell)+(i<right.length-1?`<text x="${arrowX+arrow+240+i*cell}" y="${arrowY}" font-size="28">+</text>`:'')).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><g fill="#173553" font-family="Arial,sans-serif"><text x="30" y="35" font-size="22" font-weight="bold">Reaction scheme</text></g><g fill="#173553" font-family="Arial,sans-serif" stroke="none">${body}</g></svg>`;
}
