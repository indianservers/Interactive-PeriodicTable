import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, X } from 'lucide-react';
import { searchGlobal } from '../data/globalSearch.js';
import './globalSearch.css';

export default function GlobalSearch({ onNavigate, onSelectElement, inlineOnMobile = false }) {
  const [open,setOpen]=useState(false), [query,setQuery]=useState(''), [active,setActive]=useState(0);
  const trigger=useRef(null), input=useRef(null);
  const results=searchGlobal(query);
  const close=()=>{setOpen(false);trigger.current?.focus();};
  useEffect(()=>{
    const show=()=>{setQuery('');setActive(0);setOpen(true);};
    const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();show();}};
    window.addEventListener('chemistry:search',show);window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('chemistry:search',show);window.removeEventListener('keydown',key);};
  },[]);
  const choose=item=>{if(item.element)onSelectElement?.(item.element);else onNavigate?.(item.id);close();};
  return <>
    <button ref={trigger} className={`global-search-trigger${inlineOnMobile?' global-search-trigger--lab':''}`} aria-label="Search all chemistry" onClick={()=>{setOpen(true);setQuery('');setActive(0);}}><Search size={18}/><span>Search</span><kbd>Ctrl K</kbd></button>
    {open&&createPortal(<div className="global-search-backdrop" onMouseDown={close}>
      <section role="dialog" aria-modal="true" aria-label="Search all chemistry" className="global-search-dialog" onMouseDown={e=>e.stopPropagation()} onKeyDown={e=>{
        if(e.key==='Escape'){e.preventDefault();close();}
        if(e.key==='ArrowDown'){e.preventDefault();setActive(i=>Math.min(i+1,results.length-1));}
        if(e.key==='ArrowUp'){e.preventDefault();setActive(i=>Math.max(0,i-1));}
        if(e.key==='Enter'&&results[active]){e.preventDefault();choose(results[active]);}
        if(e.key==='Tab'){const nodes=[...e.currentTarget.querySelectorAll('input,button')];const first=nodes[0],last=nodes.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
      }}>
        <header><Search size={20}/><input ref={input} autoFocus aria-label="Search pages, studios, labs, elements and molecules" placeholder="Search everything in chemistry…" value={query} onChange={e=>{setQuery(e.target.value);setActive(0);}}/><button aria-label="Close global search" onClick={close}><X size={20}/></button></header>
        <p role="status">{results.length} results · Pages, studios, labs, tools, elements and molecules</p>
        <div className="global-search-results">{results.map((item,i)=><button key={`${item.type}-${item.id}-${item.label}-${i}`} className={i===active?'active':''} onClick={()=>choose(item)}><small>{item.type}</small><strong>{item.label}</strong><span>{item.detail}</span></button>)}{!results.length&&<p>No matches. Try symmetry, benzoylation, ADME, oxygen or H2O.</p>}</div>
      </section>
    </div>,document.body)}
  </>;
}
