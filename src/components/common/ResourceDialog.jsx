import { useEffect, useRef } from 'react';

export default function ResourceDialog({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} aria-label={title} onCancel={onClose} onClose={onClose} style={{width:'min(760px, 94vw)',maxHeight:'85vh',padding:24,border:'1px solid #426779',borderRadius:16,background:'#0b2034',color:'#eefaff'}}>
    <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,marginBottom:20}}><h2 style={{fontSize:22,fontWeight:700}}>{title}</h2><button autoFocus onClick={onClose} aria-label={`Close ${title}`} style={{padding:8}}>Close ×</button></header>
    {children}
  </dialog>;
}
