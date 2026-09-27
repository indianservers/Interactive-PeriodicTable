import { useEffect, useRef, useState } from 'react';
import { X, ArrowUpRight } from 'lucide-react';
import { findExperience } from '../../data/discoveryCatalog.js';
export default function ExperiencePreview({entry,onClose,onLaunch}) {
  const dialog=useRef(null);
  const [amount,setAmount]=useState(0.5);
  useEffect(()=>{const previous=document.activeElement;dialog.current.showModal();return()=>previous?.focus();},[]);
  const absorbance=amount*1.5;
  const demo=entry.id==='beer-lambert-law'?'absorbance':entry.id==='gas-properties'?'gas':entry.id==='atom-builder'?'atom':null;
  return <dialog ref={dialog} className="dx-dialog" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===dialog.current)onClose();}} aria-labelledby="dx-preview-title">
    <button className="dx-close" aria-label="Close preview" onClick={onClose}><X size={20}/></button><span className="cl-eyebrow">{entry.categoryTitle} / {entry.type}</span><h2 id="dx-preview-title">{entry.title}</h2><p>{entry.description}</p>
    <div className="dx-preview-tags"><span>{entry.level}</span><span>{entry.upcoming?'Upcoming':'Ready to explore'}</span></div>
    <h3>What you'll explore</h3><p>{entry.objective}</p>
    <h3>Before you begin</h3>{entry.prerequisites.length?<><p>Suggested preparation:</p><div className="dx-prerequisites">{entry.prerequisites.map(id=>{const item=findExperience(id);return item&&<button key={id} onClick={()=>onLaunch(item)}>{item.title}<ArrowUpRight size={15}/></button>;})}</div></>:<p>No prior chemistry knowledge needed. Start with the controls and explore.</p>}
    <details><summary>How difficulty is assigned</summary><p>Beginner activities introduce foundational concepts. Intermediate activities assume a related topic. Advanced activities combine theory, modelling or research workflows. These are suggested starting levels, not an assessment of your ability.</p></details>
    {demo?<section className="dx-mini-demo"><h3>Try a small experiment</h3>{demo==='absorbance'?<><div className="dx-beaker" style={{background:`rgba(43,174,226,${amount})`}}/><label>Concentration (mmol/L)<input type="range" min="0.1" max="1" step="0.1" value={amount} onChange={event=>setAmount(Number(event.target.value))}/></label><output>c = {amount.toFixed(1)} mmol/L · A = {absorbance.toFixed(2)}</output><p>Beer–Lambert model: A = εbc; ε = 1.5 L mmol⁻¹ cm⁻¹, b = 1 cm.</p></>:demo==='gas'?<><label>Relative volume V/V₀<input type="range" min="0.5" max="2" step="0.1" value={amount} onChange={event=>setAmount(Number(event.target.value))}/></label><output>Relative pressure P/P₀ = {(1/amount).toFixed(2)}</output><p>Boyle's law for an ideal gas at fixed temperature and amount: P/P₀ = V₀/V.</p></>:<><label>Protons in a neutral atom<input type="range" min="1" max="10" step="1" value={Math.max(1,Math.round(amount))} onChange={event=>setAmount(Number(event.target.value))}/></label><output>{Math.max(1,Math.round(amount))} protons and {Math.max(1,Math.round(amount))} electrons</output><p>Changing the proton count changes the element. Neutrons determine the isotope.</p></>}</section>:<section className="dx-mini-demo"><h3>Your first exploration</h3><ol><li>Open the experience and read the introductory controls.</li><li>{entry.objective}</li><li>Compare two examples and explain what changed.</li></ol></section>}
    {entry.addedAt&&<small>Added to the catalog {entry.addedAt} · recorded in project history</small>}
    {!entry.upcoming&&<button className="dx-primary" onClick={()=>onLaunch(entry)}>Launch experience <ArrowUpRight size={17}/></button>}
  </dialog>;
}
