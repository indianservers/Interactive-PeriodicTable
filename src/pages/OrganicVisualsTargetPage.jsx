import { useEffect, useRef, useState } from "react";
import { Atom, BookOpen, ChartNoAxesColumn, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Crosshair, FlaskConical, Home, Minus, Plus, Search, RotateCcw, Pause, Play, X, SlidersHorizontal, ArrowRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import OrganicMoleculeScene from "../components/visualizers/OrganicMoleculeScene.jsx";
import { pathways, topics, reactionTypes, matchingPathways, networks, references, reagentDescription } from "./organicNetworkData.js";
import "./organicVisualsTarget.css";
import StructureGlyph from "../components/visualizers/OrganicStructure.jsx";
import { molecules, atomStyles, subscript } from "./organicMolecules.js";

function IconButton({label, children, ...props}) {
 return <button type="button" title={label} aria-label={label} {...props}>{children}</button>;
}
function EnergyProfile({path, detailed=false}) {
 const end = 108;
 const curve = "M36 108 C90 108 112 99 144 62 S179 39 205 83 S243 "+end+" 313 "+end;
 return <figure className="on-energy"><figcaption>Schematic activation barrier</figcaption>
 <svg viewBox="0 0 350 168" role="img" aria-label={"Unquantified activation barrier for "+path.title}>
 <title>Qualitative reaction coordinate — not measured energy data</title>
 <path d="M27 142V30 M27 142H333" fill="none" stroke="#92a5c2" strokeWidth="1.4"/>
 <path d="M23 35L27 28L31 35 M327 138L334 142L327 146" fill="#92a5c2"/>
 <path d={curve} fill="none" stroke="#2365ff" strokeWidth="2"/>
 <path d="M162 45V108" stroke="#8ea7d0" strokeDasharray="4 3"/>
 <text x="169" y="39">Transition state</text><text x="39" y="124">Reactants</text><text x="254" y={end+14}>Products</text>
 <text x="161" y="161">Reaction progress</text><text transform="translate(13 95) rotate(-90)">Energy</text>
 {detailed && <><path d="M118 107V53" stroke="#eb7e1d"/><text x="81" y="76">Eₐ</text><text x="271" y="69">ΔE unknown</text><path d={"M290 108V"+end} stroke="#eb7e1d"/></>}
 </svg><p>Conceptual barrier only, not a measured profile or elementary mechanism. Product energy and reaction enthalpy are unspecified.</p>
 </figure>;
}
function PathwayStepper({path,step,setStep,playing,setPlaying,reset}) {
 return <div className="on-stepper" aria-label="Pathway stepper">
  <IconButton label="Previous step" onClick={()=>{setPlaying(false);setStep(Math.max(0,step-1));}} disabled={step===0}><ChevronLeft size={17}/></IconButton>
  {["Reagent","Conditions","Product"].map((name,i)=><button type="button" className={"on-step "+(step===i?"active":"")} key={name} aria-current={step===i?"step":undefined} onClick={()=>{setPlaying(false);setStep(i);}}><span>{i+1}</span><div><b>{name}</b><small>{path.steps[i]}</small></div>{i<2&&<ChevronRight size={16}/>}</button>)}
  <IconButton label="Next step" disabled={step===2} onClick={()=>{setPlaying(false);setStep(v=>Math.min(2,v+1));}}><ChevronRight size={17}/></IconButton>
  <IconButton label={playing?"Pause pathway":"Play pathway"} className="on-play" onClick={()=>{if(step===2)setStep(0);setPlaying(!playing);}}>{playing?<Pause size={20}/>:<Play size={20}/>}</IconButton>
  <IconButton label="Reset pathway" className="on-step-reset" onClick={reset}><RotateCcw size={16}/></IconButton>
 </div>;
}

export default function OrganicVisualsTargetPage({onNavigate}) {
 const [selected,setSelected]=useState("oxidation");
 const [search,setSearch]=useState("");
 const [topicSearch,setTopicSearch]=useState("");
 const [topic,setTopic]=useState("Alcohols");
 const [types,setTypes]=useState([]);

 const [filtersOpen,setFiltersOpen]=useState(()=>window.innerWidth>1150);
 const [inspectorOpen,setInspectorOpen]=useState(()=>window.innerWidth>1150);
 const [inspectorWidth,setInspectorWidth]=useState(410);
 const [mode,setMode]=useState("3D");
 const [labels,setLabels]=useState(false);
 const [zoom,setZoom]=useState(1);
 const [cameraReset,setCameraReset]=useState(0);
 const [step,setStep]=useState(0);
 const [playing,setPlaying]=useState(false);
 const [reduced,setReduced]=useState(()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches);
 const [motion,setMotion]=useState(true);
 const [tab,setTab]=useState("Overview");
 const [atom,setAtom]=useState(null);
 const [pan,setPan]=useState({x:0,y:0});
 const drag=useRef(null);
 const searchRef=useRef(null);
 const network=networks[topic], source=molecules[network.source];
 const visible=matchingPathways(search,topic,types);
 const path=visible.find(p=>p.id===selected)||visible[0]||null;
 const selectedId=path?.id;
 useEffect(()=>{setSelected(selectedId||null);setStep(0);setPlaying(false);setAtom(null);setTab("Overview");},[selectedId,topic]);
 const selectTopic=value=>{setTopic(value);setSearch("");setTypes([]);setAtom(null);setStep(0);setPlaying(false);setZoom(1);setPan({x:0,y:0});};
 const typeCounts=Object.fromEntries(reactionTypes.map(t=>[t,matchingPathways(search,topic,[t]).length]));
 const reset=()=>{setStep(0);setPlaying(false);};
 const clearFilters=()=>{setSearch("");setTopicSearch("");setTypes([]);};
 const fit=()=>{setZoom(1);setPan({x:0,y:0});setCameraReset(v=>v+1);};
 const choose=id=>{setSelected(id);reset();setAtom(null);setTab("Overview");};
 useEffect(()=>{
  const media=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=()=>setReduced(media.matches);
  media.addEventListener("change",update);
  const compact=window.matchMedia("(max-width:1150px)");
  const resize=()=>{setFiltersOpen(!compact.matches);setInspectorOpen(!compact.matches);};
  compact.addEventListener("change",resize);
  const shortcut=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();searchRef.current?.focus();}if(e.key==="Escape"){setFiltersOpen(false);setInspectorOpen(false);}};
  window.addEventListener("keydown",shortcut);
  return()=>{media.removeEventListener("change",update);compact.removeEventListener("change",resize);window.removeEventListener("keydown",shortcut);};
 },[]);
 useEffect(()=>{
  if(!playing)return;
  const timer=setTimeout(()=>{if(step<2)setStep(v=>v+1);else setPlaying(false);},2400);
  return()=>clearTimeout(timer);
 },[playing,step]);
 const toggle=(item,list,set)=>set(list.includes(item)?list.filter(v=>v!==item):[...list,item]);
 const change=path?source.group+" → "+path.group:"";
 const descriptions=path?.descriptions||[];
 return <div className={"on-lab "+((!motion||reduced)?"on-still":"")} style={{"--inspector-width":inspectorWidth+"px"}}>
  <header className="on-header"><FlaskConical className="on-logo"/><div className="on-brand"><h1>Organic Chemistry Visual Lab</h1><p>Navigate reactions by structure</p></div>
   <label className="on-search"><Search size={18}/><input ref={searchRef} aria-label="Search molecules, reactions, reagents" placeholder={"Search within "+topic.toLowerCase()+"…"} value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></label>
   <nav aria-label="Learning navigation">{[["Learn","syllabus"],["Practice","practice-tutor"],["Resources","library"],["My Lab","favorites"]].map(([label,dest])=><button type="button" key={label} onClick={()=>onNavigate?.(dest)}>{label}</button>)}</nav><span className="on-avatar" aria-label="User profile">JS</span>
  </header>
  <div className={"on-workspace "+(!filtersOpen?"on-filters-closed ":"")+(!inspectorOpen?"on-inspector-closed":"")}>
   <nav className="on-rail" aria-label="Workspace navigation">{[[Home,"Home",()=>onNavigate?.("dashboard")],[BookOpen,"Syllabus",()=>onNavigate?.("syllabus")],[FlaskConical,"Reactions",()=>{clearFilters();fit();}],[Atom,"Mechanisms",()=>{setTab("Mechanism");setInspectorOpen(true);}],[ChartNoAxesColumn,"Progress",()=>onNavigate?.("learning-command")]].map(([Icon,label,action])=><button type="button" key={label} title={label} onClick={action} className={label==="Home"?"active":""}><Icon size={25}/><span>{label}</span></button>)}
   {!filtersOpen&&<IconButton label="Open filters" onClick={()=>{setFiltersOpen(true);if(window.innerWidth<=1150)setInspectorOpen(false);}}><ChevronsRight/></IconButton>}
   </nav>
   {filtersOpen&&<aside className="on-filters" aria-label="Filters"><div className="on-panel-title"><h2>Filters</h2><IconButton label="Collapse filters" onClick={()=>setFiltersOpen(false)}><ChevronsLeft size={20}/></IconButton></div><div className="on-filter-body" tabIndex={0} role="region" aria-label="Scrollable filters">
    <label className="on-field"><b>Topic network</b><span className="on-filter-help">Choose one starting family. Representative reactions, not a complete syllabus.</span></label>
    <label className="on-search"><Search size={16}/><input aria-label="Search topics" value={topicSearch} onChange={e=>setTopicSearch(e.target.value)} placeholder="Search topics…"/></label>
    <div className="on-topics" role="radiogroup" aria-label="Topic network">{topics.filter(t=>t.toLowerCase().includes(topicSearch.toLowerCase())).map(t=><label key={t}><input type="radio" aria-label={t} name="organic-topic" checked={topic===t} onChange={()=>selectTopic(t)}/><span>{t}</span><small>{pathways.filter(p=>p.topic===t).length}</small></label>)}{!topics.some(t=>t.toLowerCase().includes(topicSearch.toLowerCase()))&&<p>No topics match your search.</p>}</div>
    <h3>Reaction type</h3><p className="on-filter-help">Select any combination. Counts apply to this topic and search.</p><div className="on-type-chips">{reactionTypes.map((t,i)=><button type="button" key={t} aria-label={t} disabled={!typeCounts[t]&&!types.includes(t)} aria-pressed={types.includes(t)} className={types.includes(t)?"active":""} onClick={()=>toggle(t,types,setTypes)}><span className={"on-type-icon color-"+i}><ArrowUpRight size={14}/></span>{t}<small>{typeCounts[t]}</small></button>)}</div>
    <button type="button" className="on-clear" onClick={clearFilters}><RotateCcw size={18}/>Clear filters</button>
   </div></aside>}
   <section className="on-canvas" tabIndex={0} aria-label={network.title}>
    <div className="on-canvas-heading"><div><h2>{network.title}</h2><p>Start with {source.name.toLowerCase()} · {visible.length} of {pathways.filter(p=>p.topic===topic).length} pathways</p></div><div className="on-toolbar">
     <div className="on-segment">{["2D","3D"].map(m=><button type="button" key={m} aria-pressed={mode===m} onClick={()=>setMode(m)}>{m}</button>)}</div>
     <div className="on-segment"><IconButton label="Zoom out network" onClick={()=>setZoom(v=>Math.max(.75,v-.1))}><Minus size={16}/></IconButton><IconButton label="Zoom in network" onClick={()=>setZoom(v=>Math.min(1.35,v+.1))}><Plus size={16}/></IconButton></div>
     <IconButton label="Fit molecule and network" onClick={fit}><Crosshair size={18}/><span>Fit</span></IconButton>
     <IconButton label="Reset view" onClick={()=>{fit();reset();}}><RotateCcw size={17}/><span>Reset</span></IconButton>
     <button type="button" className="on-label-toggle" aria-pressed={labels} onClick={()=>setLabels(v=>!v)}><i/>Labels</button>
    </div></div>
    <div className="on-mobile-tools"><button type="button" onClick={()=>{setFiltersOpen(true);setInspectorOpen(false);}}><SlidersHorizontal size={16}/>Filters</button><button type="button" onClick={()=>{setInspectorOpen(true);setFiltersOpen(false);}}>Reaction details<ChevronRight size={16}/></button></div>
    <div className="on-network" onPointerDown={e=>{if(e.pointerType!=="touch"&&e.target===e.currentTarget){drag.current={x:e.clientX,y:e.clientY,origin:pan};e.currentTarget.setPointerCapture(e.pointerId);}}} onPointerMove={e=>{if(drag.current)setPan({x:drag.current.origin.x+e.clientX-drag.current.x,y:drag.current.origin.y+e.clientY-drag.current.y});}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
    <div className="on-network-transform" style={{transform:"translate("+pan.x+"px,"+pan.y+"px) scale("+zoom+")"}}>
     <svg className="on-edges" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Directional reaction pathways"><title>{source.name} reactions and their products</title><defs>{["selected","other"].map((name,i)=><marker key={name} id={"on-arrow-"+name} markerUnits="userSpaceOnUse" markerWidth="3.5" markerHeight="3.5" refX="2.8" refY="1.75" orient="auto-start-reverse"><path d="M0 0 L3.5 1.75 L0 3.5 L.8 1.75Z" fill={i?"#79a8de":"#ff8a1e"}/></marker>)}</defs>
      {visible.map(p=><g key={p.id}><path d={p.path} fill="none" stroke={p.id===selectedId?"#ff982c":"#bdd8f7"} strokeWidth={p.id===selectedId?0.7:0.6} markerStart={p.equation.includes("⇌")?"url(#on-arrow-"+(p.id===selectedId?"selected":"other")+")":undefined} markerEnd={"url(#on-arrow-"+(p.id===selectedId?"selected":"other")+")"}/>{p.id===selectedId&&playing&&motion&&!reduced&&<circle r=".6" fill="#f58a20"><animateMotion path={p.path} dur="1.8s" repeatCount="indefinite"/></circle>}</g>)}
     </svg>
     {visible.map(p=><div key={p.id}><button type="button" data-pathway={p.id} data-long-formula={p.formula.length>10} className={"on-node on-node-"+p.id+(selectedId===p.id?" selected":"")} aria-pressed={selectedId===p.id} aria-label={"Select "+p.name+" pathway"} style={{left:p.x+"%",top:p.y+"%"}} onClick={()=>choose(p.id)}><StructureGlyph moleculeId={p.product}/><b>{p.formula}</b><span>{p.name}</span><small>{p.group}</small></button>
      <button type="button" data-slot={p.slot} className={"on-edge-label "+(selectedId===p.id?"selected":"")} style={{left:p.label[0]+"%",top:p.label[1]+"%"}} onClick={()=>choose(p.id)} aria-label={"Select "+p.title}><b>{p.reagent}</b><span>{p.conditions}</span></button>
     </div>)}
     <div className={"on-molecule "+(step===1?"on-heating":"")} aria-label={source.name+" model"}>
      {mode==="3D"?<OrganicMoleculeScene moleculeId={network.source} animationEnabled={motion&&!reduced} showLabels={labels} cameraResetKey={cameraReset} onAtomSelect={setAtom}/>:<StructureGlyph moleculeId={network.source}/>}
     </div>
     <div className="on-source-card"><b>{source.formula}</b><span>{source.name}</span><small>{source.group}</small></div>
     {atom&&<button type="button" className="on-atom-info" onClick={()=>setAtom(null)}>{atom.label} ({atom.type}) · atomic number {atom.number} <X size={12}/></button>}
    </div>
    {!visible.length&&<div className="on-empty"><b>No pathways match these filters.</b><p>No reaction in the {topic.toLowerCase()} example matches this combination. Clear filters or choose another topic.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
    <div className="on-legend">{[...new Set([...source.atoms.map(a=>a[0]),...visible.flatMap(p=>molecules[p.product].atoms.map(a=>a[0])),"H"])].map(symbol=><span key={symbol}><i style={{background:"#"+atomStyles[symbol].color.toString(16).padStart(6,"0")}}/>{atomStyles[symbol].label} ({symbol})</span>)}<span><i className="path-selected"/>Selected pathway</span><span><i className="path-other"/>Other pathway</span></div>
    </div>
    {path&&<PathwayStepper path={path} step={step} setStep={setStep} playing={playing} setPlaying={setPlaying} reset={reset}/>}
    <div className="on-canvas-foot"><span>Schematic model · rotate by dragging · scroll on model to zoom</span><button type="button" onClick={()=>setMotion(v=>!v)} aria-pressed={!motion}>{motion?<Pause size={13}/>:<Play size={13}/>} {motion?"Pause motion":"Resume motion"}</button></div>
   </section>
   {inspectorOpen?<aside className="on-inspector" aria-label="Reaction inspector">
    <div className="on-resizer" role="separator" aria-label="Resize inspector" aria-orientation="vertical" tabIndex={0} onKeyDown={e=>{if(e.key==="ArrowLeft")setInspectorWidth(v=>Math.min(470,v+10));if(e.key==="ArrowRight")setInspectorWidth(v=>Math.max(340,v-10));}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);e.currentTarget.dataset.resizing="true";}} onPointerMove={e=>{if(e.currentTarget.dataset.resizing==="true")setInspectorWidth(Math.max(340,Math.min(470,window.innerWidth-e.clientX-8)));}} onPointerUp={e=>{delete e.currentTarget.dataset.resizing;}}/>
    <div className="on-inspector-scroll" tabIndex={0} role="region" aria-label="Scrollable reaction details">{path?<><div className="on-inspector-heading"><h2>{path.title}</h2><span className="on-selected-badge">● Selected</span><IconButton label="Close inspector" onClick={()=>setInspectorOpen(false)}><X size={19}/></IconButton></div>
     <p className="on-inspector-subtitle">{source.name} <span className="on-formula">({subscript(source.molecular)})</span> → {path.name} <span className="on-formula">({subscript(path.molecular)}{path.charge>0?"⁺":path.charge<0?"⁻":""})</span></p>
     <div className="on-equation">{path.equation}</div>
     <div className="on-summary"><div><b>Reagent</b><strong>{path.reagent}</strong><p>{reagentDescription(path)}</p></div><div><b>Conditions</b><strong>{path.conditions}</strong><p>{path.note}</p></div></div>
     <div className="on-tabs" role="tablist" aria-label="Reaction information">{["Overview","Mechanism","Energy","Safety"].map((t,i)=><button type="button" role="tab" aria-selected={tab===t} tabIndex={tab===t?0:-1} key={t} onClick={()=>setTab(t)} onKeyDown={e=>{const tabs=["Overview","Mechanism","Energy","Safety"];const next=e.key==="ArrowRight"?(i+1)%4:e.key==="ArrowLeft"?(i+3)%4:e.key==="Home"?0:e.key==="End"?3:null;if(next!==null){e.preventDefault();setTab(tabs[next]);e.currentTarget.parentElement.children[next].focus();}}}>{t}</button>)}</div>
     <div role="tabpanel" aria-label={tab}>
      {tab==="Overview"&&<><dl className="on-properties">{[["Reaction type",path.type],["Starting molecule",source.name],["Highlighted product",path.name+" ("+path.formula+")"],["Functional group change",change],["Topic",topic]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><EnergyProfile path={path}/></>}
      {tab==="Energy"&&<EnergyProfile path={path} detailed/>}
      {tab==="Mechanism"&&<div className="on-mechanism"><h3>Overall reaction steps</h3><p>An overall transformation, not a complete elementary mechanism.</p><div className="on-mechanism-structures"><StructureGlyph moleculeId={network.source}/><ArrowRight/><StructureGlyph moleculeId={path.product}/></div><h4>{["Reagent","Conditions","Product"][step]} · {step+1} of 3</h4><p>{descriptions[step]}</p><div className="on-mechanism-controls"><button type="button" disabled={step===0} onClick={()=>{setPlaying(false);setStep(v=>v-1);}}>Previous</button><button type="button" disabled={step===2} onClick={()=>{setPlaying(false);setStep(v=>v+1);}}>Next</button></div></div>}
      {tab==="Safety"&&<div className="on-safety"><h3><ShieldAlert/>Laboratory safety</h3><ul>{[
 "Educational simulation only. Do not use these summaries as laboratory instructions; consult the reagent SDS and a supervised risk assessment.",
 ...(path.reagent.includes("Cr₂")?["Chromium(VI) compounds are carcinogenic, toxic oxidants; segregate chromium waste."]:[]),
 ...(path.reagent.includes("H₂SO₄")||path.reagent.includes("HNO₃")?["Concentrated acids are corrosive; nitrating mixtures are strongly oxidising and can react violently."]:[]),
 ...(path.reagent.includes("NaOH")||path.reagent.includes("KOH")?["Hydroxide solutions are corrosive."]:[]),
 ...(path.source==="benzene"?["Benzene is carcinogenic and flammable."]:[]),
 ...(path.id==="chlorination"?["Chlorine is a toxic gas; ultraviolet light also requires protection."]:[]),
 ...(path.id==="hydrogenation"?["Hydrogen is flammable; metal catalysts and heated gas systems require specialist controls."]:[]),
 ...(path.id==="ammonolysis"?["Ammonia is irritating; heating a sealed vessel presents a pressure hazard."]:[]),
 "Organic reagents may be volatile, toxic or flammable. Use trained supervision and appropriate ventilation, PPE and waste procedures."
 ].map(s=><li key={s}>{s}</li>)}</ul></div>}
     </div>
     <button type="button" className="on-explore" onClick={()=>{setTab("Mechanism");reset();}}><Atom size={25}/>Explore mechanism<ArrowRight size={19}/></button><p className="on-explore-note">{source.note||"Models show connectivity; positions and bond lengths are schematic."}</p><a className="on-reference" href={references[path.reference].url} target="_blank" rel="noreferrer">{references[path.reference].label} ↗</a></>:<div className="on-no-selection"><h2>No matching reaction</h2><p>Change the filters to select a pathway. No previous reaction is displayed.</p><button type="button" onClick={clearFilters}>Clear filters</button><IconButton label="Close inspector" onClick={()=>setInspectorOpen(false)}><X size={19}/></IconButton></div>}
    </div>
   </aside>:<div className="on-inspector-restore"><IconButton label="Open inspector" onClick={()=>setInspectorOpen(true)}><ChevronsLeft size={20}/></IconButton></div>}
  </div>
  <span className="on-sr" role="status">{path?path.title+". Step "+(step+1)+": "+path.steps[step]+".":"No matching reaction."} {visible.length} pathways visible for {topic}.</span>
 </div>;
}
