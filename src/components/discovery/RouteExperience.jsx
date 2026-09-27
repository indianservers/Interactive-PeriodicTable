import { Component, useRef, useState } from 'react';
import { Home, HelpCircle, RotateCcw, Check, X, Accessibility } from 'lucide-react';
import { findExperience, discoveryEntries } from '../../data/discoveryCatalog.js';
import { useLocalStorage } from '../../hooks/useLocalStorage.js';
import './discovery.css';

export class ExperienceErrorBoundary extends Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  render(){return this.state.error?<section className="dx-load-error" role="alert"><h1>This experience couldn't load.</h1><p>Your saved learning activity is still available. Retry the page to fetch the experience again.</p><button onClick={()=>location.reload()}>Retry loading</button><button onClick={()=>this.props.onHome?.()}>Return home</button></section>:this.props.children;}
}
export function ExperienceLoading({title='Loading chemistry experience',detail='Preparing the interactive tools…'}) {
  return <section className="dx-loading" role="status" aria-live="polite" aria-busy="true"><div className="dx-loading-orbit"/><h2>{title}</h2><p>{detail}</p><p>Large molecular viewers may take longer on the first visit.</p><button onClick={()=>location.reload()}>Retry loading</button></section>;
}
export function ExperienceToolbar({page,onNavigate,onReset,motionEnabled,onMotionToggle,highContrast,onContrastToggle}) {
  const entry=findExperience(page);
  const [panel,setPanel]=useState(null);
  const [completed,setCompleted]=useLocalStorage('cu-discovery-completed',[]);
  const dialog=useRef(null);
  const show=value=>{setPanel(value);dialog.current.showModal();};
  const related=entry?discoveryEntries.filter(item=>item.category===entry.category&&item.id!==entry.id&&!item.upcoming).slice(0,3):[];
  return <>
    <nav className="dx-experience-toolbar" aria-label="Experience navigation"><button onClick={()=>onNavigate('dashboard')}><Home size={17}/> Home</button><button onClick={()=>show('help')}><HelpCircle size={17}/> Help</button><button onClick={()=>show('reset')}><RotateCcw size={17}/> Reset</button><button onClick={()=>show('accessibility')}><Accessibility size={17}/> Display</button>{entry&&<button aria-pressed={completed.includes(entry.id)} onClick={()=>setCompleted(previous=>previous.includes(entry.id)?previous.filter(id=>id!==entry.id):[...previous,entry.id])}><Check size={17}/>{completed.includes(entry.id)?'Completed':'Mark done'}</button>}</nav>
    <dialog ref={dialog} className="dx-dialog" aria-label={panel==='reset'?'Restart experience':panel==='help'?'Experience help':'Display preferences'}><button className="dx-close" aria-label="Close" onClick={()=>dialog.current.close()}><X size={20}/></button>
      {panel==='help'?<><h2>{entry?.title||'Explore chemistry'}</h2><p>{entry?.objective||'Use the page controls to explore this chemistry experience.'}</p><h3>Getting started</h3><p>Change one control at a time, compare the result, and use the page's explanations to interpret it. Reset restarts the current activity; saved bookmarks and marked learning steps remain.</p>{related.length>0&&<><h3>Related activities</h3>{related.map(item=><button className="dx-related" key={item.id} onClick={()=>{dialog.current.close();onNavigate(item.id);}}>{item.title}</button>)}</>}</>:panel==='reset'?<><h2>Restart this experience?</h2><p>This resets unsaved controls by reopening the activity. Bookmarks, completed steps and any activity data saved to your device are retained.</p><button className="dx-primary" onClick={()=>{dialog.current.close();onReset();}}>Restart activity</button></>:<><h2>Make yourself comfortable</h2><button className="dx-related" aria-pressed={!motionEnabled} onClick={onMotionToggle}>{motionEnabled?'Reduce motion':'Enable motion'}</button><button className="dx-related" aria-pressed={highContrast} onClick={onContrastToggle}>{highContrast?'Use standard contrast':'Increase contrast'}</button><p>Use Tab to move between controls and Enter or Space to activate them.</p></>}
    </dialog>
  </>;
}
