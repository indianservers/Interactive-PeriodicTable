import { useState } from 'react';
import { documentStamp } from '../utils/drawDocuments.js';
export default function DrawDocumentTabs({ documents, activeId, saved, onSelect, onNew, onRename, onDuplicate, onClose, onReorder }) {
  const [editing,setEditing]=useState(null),[title,setTitle]=useState('');
  const current=documents.find(d=>d.id===activeId),index=documents.findIndex(d=>d.id===activeId);
  return <div className="draw-document-manager">
    <div className="draw-document-list" role="tablist" aria-label="Drawing documents">{documents.map(d=>{const dirty=saved[d.id]!==documentStamp(d);return <div className="draw-document-item" key={d.id} role="presentation"><button role="tab" aria-selected={d.id===activeId} title={dirty?'Unsaved edits (local recovery autosave is enabled)':'Saved locally'} onClick={()=>onSelect(d.id)} onDoubleClick={()=>{setEditing(d.id);setTitle(d.title);}}>{d.title}{dirty?' *':''}</button><button aria-label={`Close ${d.title}`} title={`Close ${d.title}`} onClick={()=>onClose(d.id)}>×</button></div>;})}<button aria-label="New document" onClick={onNew}>＋</button></div>
    <div className="draw-document-actions"><button onClick={()=>{setEditing(activeId);setTitle(current.title);}}>Rename tab</button><button disabled={documents.length>=30} onClick={()=>onDuplicate(activeId)}>Duplicate tab</button><button disabled={index===0} onClick={()=>onReorder(activeId,-1)}>Move tab left</button><button disabled={index===documents.length-1} onClick={()=>onReorder(activeId,1)}>Move tab right</button><span role="status">{saved[activeId]===documentStamp(current)?'Saved locally':'Unsaved edits · recovery autosave enabled'}</span></div>
    {editing!==null&&<form className="draw-document-rename" onSubmit={e=>{e.preventDefault();if(title.trim()){onRename(editing,title.trim());setEditing(null);}}}><label>Document title<input aria-label="Document title" maxLength="200" value={title} onChange={e=>setTitle(e.target.value)} autoFocus/></label><button type="submit" disabled={!title.trim()}>Apply document name</button><button type="button" onClick={()=>setEditing(null)}>Cancel rename</button></form>}
  </div>;
}
