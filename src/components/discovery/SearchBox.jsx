import { useId, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { discoveryEntries } from '../../data/discoveryCatalog.js';
import { chemistryCategories } from '../../data/homeLibrary.js';
import { searchExperiences, suggestQuery } from '../../utils/searchExperiences.js';

export function Highlight({text,query}) {
  const words=query.trim().split(/\s+/).filter(Boolean);
  if(!words.length)return text;
  const pattern=new RegExp(`(${words.map(word=>word.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')})`,'ig');
  return String(text).split(pattern).map((part,index)=>words.some(word=>word.toLowerCase()===part.toLowerCase())?<mark key={index}>{part}</mark>:part);
}
export default function SearchBox({query,onChange,onSubmit,onCategory,inputRef,label='Search all chemistry experiences'}) {
  const id=useId();
  const [open,setOpen]=useState(false),[active,setActive]=useState(-1);
  const matches=query.trim()?searchExperiences(discoveryEntries,{query}).slice(0,5):[];
  const correction=query.length>3?suggestQuery(discoveryEntries,query):'';
  const categories=query.trim().length>1?chemistryCategories.filter(category=>category.title.toLowerCase().startsWith(query.trim().toLowerCase())).slice(0,2).map(category=>({title:category.title,categoryId:category.id,description:'Subject guide'})):[];
  const options=[...(correction?[{title:correction,description:'Suggested spelling'}]:[]),...categories,...matches];
  const choose=index=>{const option=options[index];if(option){if(option.categoryId&&onCategory){onChange('');onCategory(option.categoryId);}else onChange(option.title);setOpen(false);setActive(-1);onSubmit();}};
  return <div className="dx-search-wrap" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);}}>
    <form className="cl-search" role="search" onSubmit={event=>{event.preventDefault();if(open&&active>=0)choose(active);else{setOpen(false);onSubmit();}}}>
      <Search size={20}/><input ref={inputRef} role="combobox" aria-label={label} aria-expanded={open&&options.length>0} aria-controls={`${id}-suggestions`} aria-autocomplete="list" aria-activedescendant={open&&active>=0?`${id}-${active}`:undefined} autoComplete="off" value={query} placeholder="Search atoms, reactions, NaCl…" onFocus={()=>setOpen(true)} onChange={event=>{onChange(event.target.value);setOpen(true);setActive(-1);}} onKeyDown={event=>{if(event.key==='Escape'){setOpen(false);setActive(-1);}if(event.key==='ArrowDown'){event.preventDefault();setOpen(true);setActive(index=>Math.min(index+1,options.length-1));}if(event.key==='ArrowUp'){event.preventDefault();setActive(index=>Math.max(0,index-1));}}}/>
      {query&&<button type="button" aria-label="Clear search" onClick={()=>{onChange('');inputRef?.current?.focus();}}><X size={18}/></button>}
      <button type="submit" className="cl-search-go" aria-label="Show search results"><ArrowRight size={20}/></button>
    </form>
    {open&&options.length>0&&<ul id={`${id}-suggestions`} role="listbox" className="dx-autocomplete" aria-label="Search suggestions">{options.map((option,index)=><li key={`${option.id||'suggestion'}-${index}`} id={`${id}-${index}`} role="option" aria-selected={active===index} onMouseDown={event=>event.preventDefault()} onClick={()=>choose(index)}><strong><Highlight text={option.title} query={query}/></strong><small>{option.categoryTitle||option.description}</small></li>)}</ul>}
  </div>;
}
