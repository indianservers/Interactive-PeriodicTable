import {useCallback,useEffect,useState} from 'react';

// The scene wrapper, rather than its canvas, owns the toolbar in fullscreen.
export default function useApparatusFullscreen(host,onError){
 const [fullscreen,setFullscreen]=useState(false);
 useEffect(()=>{
  const sync=()=>setFullscreen(document.fullscreenElement===host.current?.parentElement);
  document.addEventListener('fullscreenchange',sync);sync();
  return()=>document.removeEventListener('fullscreenchange',sync);
 },[host]);
 const toggle=useCallback(()=>{
  const node=host.current?.parentElement;
  if(!node)return;
  const operation=document.fullscreenElement===node?document.exitFullscreen?.():node.requestFullscreen?.();
  if(!operation){onError('Fullscreen is unavailable in this browser.');return;}
  operation.catch(()=>onError('Fullscreen could not be opened. The apparatus remains usable in its card.'));
 },[host,onError]);
 return {fullscreen,toggle};
}
