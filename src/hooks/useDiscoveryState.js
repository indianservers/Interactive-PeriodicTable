import { useEffect, useRef, useState } from 'react';
import { chemistryCategories } from '../data/homeLibrary.js';

const defaults = {query:'',category:'all',subgroup:'all',availability:'available',type:'all',level:'all',saved:false,sort:'relevance',page:1,browsing:false,expanded:false};
const key='cu-discovery-session';
function sanitize(value) {
  const next={...defaults};
  if(!value||typeof value!=='object')return next;
  next.query=typeof value.query==='string'?value.query.slice(0,200):'';
  const category=chemistryCategories.find(item=>item.id===value.category);
  next.category=category?.id||'all';
  next.subgroup=category?.groups.some(group=>group.name===value.subgroup)?value.subgroup:'all';
  for(const [field,options] of Object.entries({availability:['available','all'],type:['all','Simulation','Reference','Visualization','Practice'],level:['all','Beginner','Intermediate','Advanced'],sort:['relevance','newest']}))if(options.includes(value[field]))next[field]=value[field];
  for(const field of ['saved','browsing','expanded'])next[field]=value[field]===true;
  next.page=Math.max(1,Math.min(10000,Math.floor(Number(value.page))||1));
  return next;
}
function readLocation() {
  const params=new URLSearchParams(location.hash.split('?')[1] || '');
  if(params.has('discover')) {
    const next={...defaults};
    Object.keys(defaults).forEach(field=>{if(params.has(field)) next[field]=typeof defaults[field]==='boolean'?params.get(field)==='true':field==='page'?Math.max(1,Number(params.get(field))||1):params.get(field).slice(0,200);});
    let scroll=0;
    try { const stored=JSON.parse(sessionStorage.getItem(key)); if(stored && JSON.stringify(stored.state)===JSON.stringify(next))scroll=stored.scroll||0; } catch {}
    return {state:sanitize(next),scroll};
  }
  try { const stored=JSON.parse(sessionStorage.getItem(key)); if(stored?.state) return {state:sanitize(stored.state),scroll:Math.max(0,Number(stored.scroll)||0)}; } catch {}
  return {state:{...defaults},scroll:0};
}
export function useDiscoveryState() {
  const initial=useRef(null); if(!initial.current) initial.current=readLocation();
  const [state,setState]=useState(initial.current.state);
  const stateRef=useRef(state); stateRef.current=state;
  const setField=(field,value)=>setState(previous=>({...previous,[field]:typeof value==='function'?value(previous[field]):value,...(field!=='page'?{page:1}:{})}));
  useEffect(()=>{
    const params=new URLSearchParams({discover:'1'});
    Object.entries(state).forEach(([field,value])=>{if(value!==defaults[field])params.set(field,String(value));});
    const hash=`#/dashboard?${params}`;
    history.replaceState(history.state,'',`${location.pathname}${location.search}${hash}`);
    try { sessionStorage.setItem(key,JSON.stringify({state,scroll:window.scrollY})); } catch {}
  },[state]);
  useEffect(()=>{
    let frame=requestAnimationFrame(()=>{if(initial.current.scroll)window.scrollTo({top:initial.current.scroll,behavior:'instant'});});
    const save=()=>{try{sessionStorage.setItem(key,JSON.stringify({state:stateRef.current,scroll:window.scrollY}));}catch{}};
    const pop=()=>{if(/^(#\/?dashboard)?(\?|$)/.test(location.hash))setState(readLocation().state);};
    window.addEventListener('scroll',save,{passive:true}); window.addEventListener('popstate',pop);
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('scroll',save);window.removeEventListener('popstate',pop);};
  },[]);
  return {state,setField,setState,reset:()=>setState({...defaults,browsing:true}),defaults};
}
