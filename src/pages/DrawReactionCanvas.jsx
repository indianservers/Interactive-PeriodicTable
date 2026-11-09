import { useEffect, useMemo, useState } from 'react';
import { getRDKit } from '../modules/drug-discovery/rdkitService.js';
import { analyzeReactionMolecule, mappingIssues, reactionBalance, reactionYields } from '../utils/drawReaction.js';
import { bondSegments } from '../utils/structureDrawing.js';

function ReactionDrawing({ model, maps, onMap, label }) {
  const xs = model.atoms.map(a => a.x), ys = model.atoms.map(a => a.y);
  const x = Math.min(...xs)-30, y = Math.min(...ys)-30, width = Math.max(100,Math.max(...xs)-x+30), height = Math.max(100,Math.max(...ys)-y+30);
  return <svg className="reaction-molecule" viewBox={`${x} ${y} ${width} ${height}`} aria-label={`${label} reaction structure`}>
    {model.bonds.map((b,i) => { const a = model.atoms.find(a => a.id === b.a), c = model.atoms.find(a => a.id === b.b); if (!a || !c) return null; const dx=c.x-a.x,dy=c.y-a.y,length=Math.hypot(dx,dy)||1,nx=-dy/length,ny=dx/length;
      return <g key={i}>{b.stereo===1 ? <polygon points={`${a.x},${a.y} ${c.x+nx*6},${c.y+ny*6} ${c.x-nx*6},${c.y-ny*6}`} fill="#172b46"/> : b.stereo===6 ? Array.from({length:7},(_,j)=>{const t=(j+1)/8,x=a.x+dx*t,y=a.y+dy*t,w=t*6;return <line key={j} x1={x-nx*w} y1={y-ny*w} x2={x+nx*w} y2={y+ny*w} stroke="#172b46" strokeWidth="2"/>;}) : bondSegments(a,c,b.order).map((line,j) => <line key={j} {...line} stroke="#172b46" strokeWidth="2"/>)}</g>; })}
    {model.atoms.map(a => <g key={a.id} role="button" tabIndex="0" aria-label={`${label} atom ${a.id}: ${a.element}${maps[a.id] ? ` map ${maps[a.id]}` : ''}`} onClick={() => onMap(a.id)} onKeyDown={e => {if (['Enter',' '].includes(e.key)) {e.preventDefault();onMap(a.id);}}}><circle cx={a.x} cy={a.y} r="14" fill={maps[a.id] ? '#bfdbfe' : 'white'}/><text x={a.x} y={a.y+5} textAnchor="middle" fontSize="16" fill={a.element === 'O' ? '#d82436' : '#172b46'}>{a.isotope || ""}{a.element}{a.charge ? `${Math.abs(a.charge)>1?Math.abs(a.charge):""}${a.charge>0?"+":"−"}` : ""}</text><text x={a.x+10} y={a.y-14} fontSize="12" fill="#0755bd">{maps[a.id] || a.id}</text></g>)}
  </svg>;
}
export default function DrawReactionCanvas({ documents, currentId, value, onChange, onEdit }) {
  const [analyses, setAnalyses] = useState({}), [mapNumber, setMapNumber] = useState(1), [past,setPast] = useState([]), [future,setFuture] = useState([]);
  const mode = value.balancing || 'auto';
  const [source,setSource] = useState(currentId), [role,setRole] = useState('reactant');
  const usedDocuments = [...new Set(value.participants.map(p => p.documentId))];
  const signature = usedDocuments.map(id => {const d = documents.find(d => d.id === id);return JSON.stringify([id,d?.model]);}).join('|');
  useEffect(() => {let active=true; setAnalyses({}); getRDKit().then(rd => {
    const next = {};
    for (const id of usedDocuments) {try {next[id] = analyzeReactionMolecule(rd,documents.find(d => d.id === id)?.model);} catch(e) {next[id]={error:e.message};}}
    if(active)setAnalyses(next);
  }).catch(e=>{if(active)setAnalyses(Object.fromEntries(usedDocuments.map(id=>[id,{error:e.message}])));}); return()=>{active=false;};},[signature]);
  const change = next => {setPast(p=>[...p,value].slice(-60));setFuture([]);onChange(next);};
  const update = (id, changes) => change({...value,participants:value.participants.map(p=>p.id===id?{...p,...changes}:p)});
  const info = useMemo(() => {
    try {const coefficients = reactionBalance(value.participants,analyses,mode==='auto');let yields,amountError;try{yields=reactionYields(value.participants,analyses,coefficients);}catch(e){amountError=e.message;}return{coefficients,yields,amountError};}catch(e){return{error:e.message};}
  },[value.participants,analyses,mode]);
  const mapIssues = mappingIssues(value.participants,documents);
  const mappedCount = value.participants.reduce((n,p)=>n+Object.keys(p.maps).length,0);
  const add = () => {
    if(value.participants.length>=30)return;
    const doc = documents.find(d=>d.id===Number(source));if(!doc?.model?.atoms.length)return;
    change({...value,participants:[...value.participants,{id:Math.max(0,...value.participants.map(p=>p.id))+1,documentId:doc.id,role,coefficient:1,amount:'',unit:'g',maps:{}}]});
  };
  const card = p => {
    const doc=documents.find(d=>d.id===p.documentId), data=analyses[p.documentId], label=`${p.role} ${p.id}`;
    return <article className="reaction-card" key={p.id} aria-label={label}>
      <h4>{doc?.name || 'Missing document'}</h4><small>{doc?.title} · {data?.formula || data?.error || 'Analyzing…'}{data?.mass ? ` · ${data.mass.toFixed(3)} g/mol` : ''}</small>
      {doc?.model?.atoms.length > 0 && <ReactionDrawing label={label} model={doc.model} maps={p.maps} onMap={atomId=>{const maps={...p.maps}; if(maps[atomId]===mapNumber)delete maps[atomId];else maps[atomId]=mapNumber;update(p.id,{maps});}}/>}
      <label>Coefficient<input aria-label={`${label} coefficient`} type="number" min="1" max="1000000" value={mode==='auto'?(info.coefficients?.[p.id]??p.coefficient):p.coefficient} disabled={mode==='auto'} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=1000000)update(p.id,{coefficient:n});}}/></label>
      {p.role==='reactant' && <div className="reaction-amount"><label>Available amount<input aria-label={`${label} amount`} type="number" min="0" step="any" value={p.amount} onChange={e=>update(p.id,{amount:e.target.value})}/></label><label>Unit<select aria-label={`${label} unit`} value={p.unit} onChange={e=>update(p.id,{unit:e.target.value,amount:''})}><option value="g">g</option><option value="mol">mol</option></select></label></div>}
      <button onClick={()=>onEdit(p.documentId)}>Edit source drawing</button><button onClick={()=>change({...value,participants:value.participants.filter(x=>x.id!==p.id)})}>Remove {label}</button>
    </article>;
  };
  return <section className="draw-reaction-workspace" aria-label="Connected reaction canvas">
    <h2>Reaction canvas & stoichiometry</h2><p>Add document drawings to each side. Structures, formulas and molar masses stay linked when you edit the source document.</p>
    <div className="reaction-controls"><label>Source drawing<select aria-label="Reaction source drawing" value={source} onChange={e=>setSource(Number(e.target.value))}>{documents.map(d=><option key={d.id} value={d.id}>{d.title} · {d.name}</option>)}</select></label><label>Side<select aria-label="Reaction side" value={role} onChange={e=>setRole(e.target.value)}><option value="reactant">Reactant</option><option value="product">Product</option></select></label><button onClick={add} disabled={!documents.find(d=>d.id===Number(source))?.model?.atoms.length || value.participants.length>=30}>Add drawing to reaction</button>
    <button disabled={!past.length} onClick={()=>{setFuture(f=>[...f,value]);onChange(past.at(-1));setPast(p=>p.slice(0,-1));}}>Undo reaction</button><button disabled={!future.length} onClick={()=>{setPast(p=>[...p,value]);onChange(future.at(-1));setFuture(f=>f.slice(0,-1));}}>Redo reaction</button></div>
    <div className="reaction-controls"><label>Conditions / catalysts<input aria-label="Reaction conditions" maxLength="2000" placeholder="e.g. H2SO4, heat, 80 °C" value={value.conditions} onChange={e=>change({...value,conditions:e.target.value})}/></label><label>Arrow<select aria-label="Reaction arrow" value={value.arrow} onChange={e=>change({...value,arrow:e.target.value})}><option value="forward">Forward →</option><option value="equilibrium">Equilibrium ⇌</option></select></label><label>Balancing<select aria-label="Reaction balancing mode" value={mode} onChange={e=>change({...value,balancing:e.target.value})}><option value="auto">Auto balance drawn formulas</option><option value="manual">Check entered coefficients</option></select></label></div>
    <div className="reaction-scheme"><div>{value.participants.filter(p=>p.role==='reactant').map((p,i)=><div key={p.id}>{i>0&&<span className="reaction-plus">+</span>}{card(p)}</div>)}</div><div className="reaction-arrow"><span>{value.conditions}</span><b>{value.arrow==='equilibrium'?'⇌':'→'}</b></div><div>{value.participants.filter(p=>p.role==='product').map((p,i)=><div key={p.id}>{i>0&&<span className="reaction-plus">+</span>}{card(p)}</div>)}</div></div>
    {info.coefficients && <p className="reaction-equation" aria-label="Balanced drawn equation">{['reactant','product'].map(side=>value.participants.filter(p=>p.role===side).map(p=>`${info.coefficients[p.id]===1?'':info.coefficients[p.id]}${analyses[p.documentId].formula}`).join(' + ')).join(value.arrow==='equilibrium'?' ⇌ ':' → ')}</p>}
    <div role="status" className="reaction-results">{info.error || info.amountError || 'Balanced: atoms and formal charge are conserved.'}{info.yields && <><p>Limiting reactant(s): {info.yields.limiting.map(id=>{const p=value.participants.find(p=>p.id===id);return analyses[p.documentId].formula;}).join(', ')}</p>{info.yields.rows.map(row=>{const p=value.participants.find(p=>p.id===row.id);return <p key={row.id}>{p.role==='product'?'Theoretical yield':'Remaining'} {analyses[p.documentId].formula}: <b>{(row.mol*row.mass).toPrecision(5)} g</b> ({row.mol.toPrecision(5)} mol)</p>;})}</>}</div>
    <details open><summary>Manual atom mapping</summary><p>Choose a map number, then click the corresponding atom on each side. Click again with the same number to remove it. Blue labels are map numbers; other labels are atom IDs. Mapping applies to the displayed molecules; coefficients do not expand atom copies.</p><label>Map number<input aria-label="Atom map number" type="number" min="1" max="999" value={mapNumber} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=999)setMapNumber(n);}}/></label><button onClick={()=>change({...value,participants:value.participants.map(p=>({...p,maps:{}}))})}>Clear atom maps</button><div role="status">{mapIssues.length?mapIssues.map((message,i)=><p key={i}>{message}</p>):mappedCount?'Assigned map pairs match elements and isotopes.':'No atom maps assigned.'}</div></details>
  </section>;
}
