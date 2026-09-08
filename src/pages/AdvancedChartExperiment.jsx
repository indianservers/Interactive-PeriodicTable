import { useEffect, useMemo, useState } from 'react';
import { reactionEnergy, reactionSummary, radialDistribution, nmrMultiplet, nmrCouplingTree } from './advancedChartModels.js';
import AdvancedNmrTree from './AdvancedNmrTree.jsx';
import './advancedChartExperiment.css';

const descriptions={
  reaction:['Reaction coordinate','Explore how the barrier and reaction energy affect forward and reverse activation energies.','This smooth model energy profile illustrates an elementary reaction. The horizontal axis is reaction progress, not elapsed time. Adjusting the reaction energy also shifts the transition-state position.'],
  rdf:['Radial distribution function','Explore neighbour shells and structural disorder.','g(r) compares local particle density with bulk density. This illustrative shell model excludes particles inside a hard core and tends to 1 at large separation. Peak broadening represents increasing structural disorder; it is not a measured material dataset.'],
  nmr:['NMR coupling tree','Explore first-order splitting by equivalent spin-½ neighbours.','For n equivalent neighbouring protons, a first-order signal has n+1 lines with binomial intensities. J remains constant in Hz; line spacing in ppm equals J divided by the spectrometer frequency in MHz. Strong coupling and nonequivalent neighbours require a different model.'],
};
export default function AdvancedChartExperiment({kind}) {
  const [barrier,setBarrier]=useState(60),[delta,setDelta]=useState(-20),[progress,setProgress]=useState(.25),[playing,setPlaying]=useState(false);
  const [spacing,setSpacing]=useState(2.5),[disorder,setDisorder]=useState(.25),[neighbours,setNeighbours]=useState(2),[coupling,setCoupling]=useState(7),[shift,setShift]=useState(3),[frequency,setFrequency]=useState(400);
  const [comparison,setComparison]=useState(false);
  const summary=useMemo(()=>reactionSummary(barrier,delta),[barrier,delta]);
  const lines=useMemo(()=>nmrMultiplet(neighbours,coupling,shift,frequency),[neighbours,coupling,shift,frequency]);
  const tree=useMemo(()=>nmrCouplingTree(neighbours,coupling,shift,frequency),[neighbours,coupling,shift,frequency]);
  useEffect(()=>{
    if(!playing)return;let frame,last=0;
    function tick(now){if(!last)last=now;const dt=Math.min((now-last)/1000,.05);last=now;if(!document.hidden)setProgress(p=>(p+dt*.12)%1);frame=requestAnimationFrame(tick);}
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[playing]);
  function reset(){setBarrier(60);setDelta(-20);setProgress(.25);setPlaying(false);setSpacing(2.5);setDisorder(.25);setNeighbours(2);setCoupling(7);setShift(3);setFrequency(400);setComparison(false);}
  const title=descriptions[kind];
  const nmrHalfWidth=Math.max(.15,neighbours*coupling/frequency*.6);
  const xMin=kind==='nmr'?shift-nmrHalfWidth:0,xMax=kind==='reaction'?1:kind==='rdf'?10:shift+nmrHalfWidth;
  const yMin=kind==='reaction'?-100:0,yMax=kind==='reaction'?Math.max(150,summary.peak+10):kind==='rdf'?4:Math.max(...lines.map(l=>l.intensity))*1.2;
  const px=x=>70+(kind==='nmr'?(xMax-x):(x-xMin))/(xMax-xMin)*700;
  const chartBottom=kind==='nmr'?260:360;
  const py=y=>chartBottom-(y-yMin)/(yMax-yMin)*(chartBottom-65);
  function path(fn){return Array.from({length:301},(_,i)=>{const x=xMin+(xMax-xMin)*i/300;return `${i?'L':'M'}${px(x).toFixed(2)} ${py(fn(x)).toFixed(2)}`;}).join(' ');}
  const curve=kind==='reaction'?path(t=>reactionEnergy(t,barrier,delta)):kind==='rdf'?path(r=>radialDistribution(r,spacing,disorder)):'';
  function range(label,value,set,min,max,step,unit=''){return <label>{label}<output>{value}{unit}</output><input aria-label={label} type="range" min={min} max={max} step={step} value={value} onChange={e=>set(+e.target.value)}/></label>;}
  return <section className="avc-chart-experiment" aria-label={title[0]}>
    <header><div><h2>{title[0]}</h2><p>{title[1]}</p></div><button onClick={reset}>↻ Reset experiment</button></header>
    <div className="avc-chart-workspace">
      <article>
        <svg viewBox={`0 0 820 ${kind==='nmr'?500:420}`} role="img" aria-label={`${title[0]} interactive calculated plot`}>
          {kind==='nmr'&&<AdvancedNmrTree levels={tree} px={ppm=>420+(shift-ppm)/(coupling/frequency)*65}/>}
          <g transform={kind==='nmr'?'translate(0 180)':undefined}>
          {Array.from({length:6},(_,i)=>{const y=yMin+(yMax-yMin)*i/5;return <g key={i}><path d={`M70 ${py(y)}H770`} stroke="#203a50"/><text x="60" y={py(y)+4} textAnchor="end">{y.toFixed(kind==='reaction'?0:1)}</text></g>;})}
          {Array.from({length:6},(_,i)=>{const x=xMin+(xMax-xMin)*i/5;return <g key={i}><path d={`M${px(x)} 65V${chartBottom}`} stroke="#203a50"/><text x={px(x)} y={chartBottom+20} textAnchor="middle">{x.toFixed(kind==='nmr'?2:1)}</text></g>;})}
          <path d={`M70 65V${chartBottom}H770`} stroke="#9bb6cf" fill="none"/>
          {kind==='nmr'?lines.map((l,i)=><path key={i} d={`M${px(l.ppm)} ${py(0)}V${py(l.intensity)}`} stroke="#5fdcff" strokeWidth="3"/>):<path d={curve} fill="none" stroke="#5fdcff" strokeWidth="3"/>}
          {comparison&&kind==='reaction'&&<path d={path(t=>reactionEnergy(t,Math.max(5,barrier*.6),delta))} fill="none" stroke="#b784fa" strokeWidth="2" strokeDasharray="7 5"/>}
          {comparison&&kind==='rdf'&&<path d={path(r=>radialDistribution(r,spacing,.05))} fill="none" stroke="#b784fa" strokeWidth="2" strokeDasharray="7 5"/>}
          {kind==='reaction'&&<><circle cx={px(summary.coordinate)} cy={py(summary.peak)} r="6" fill="#fc6888"/><text x={px(summary.coordinate)+12} y={py(summary.peak)-10}>Transition state</text><circle cx={px(progress)} cy={py(reactionEnergy(progress,barrier,delta))} r="7" fill="#ffdb78"/></>}
          {kind==='rdf'&&<path d={`M70 ${py(1)}H770`} stroke="#dac885" strokeDasharray="5 5"/>}
          <text x="420" y={chartBottom+50} textAnchor="middle">{kind==='reaction'?'Reaction coordinate':kind==='rdf'?'Separation r (Å)':'Chemical shift δ (ppm; decreases to the right)'}</text>
          <text x="18" y={(chartBottom+65)/2} transform={`rotate(-90 18 ${(chartBottom+65)/2})`} textAnchor="middle">{kind==='reaction'?'Potential energy (kJ mol⁻¹)':kind==='rdf'?'g(r)':'Relative intensity'}</text>
          </g>
        </svg>
        {kind==='reaction'&&<div className="avc-chart-readouts"><output>Forward Eₐ: {summary.forward.toFixed(1)} kJ mol⁻¹</output><output>Reverse Eₐ: {summary.reverse.toFixed(1)} kJ mol⁻¹</output><output>ΔE: {delta} kJ mol⁻¹</output></div>}
        {kind==='rdf'&&<div className="avc-chart-readouts"><output>First-shell spacing: {spacing.toFixed(1)} Å</output><output>Large-r limit: g(r) → 1</output></div>}
        {kind==='nmr'&&<div className="avc-chart-readouts"><output>{neighbours+1} lines</output><output>Intensity ratio {lines.map(l=>l.intensity).join(':')}</output><output>Spacing {(coupling/frequency).toFixed(4)} ppm</output></div>}
      </article>
      <aside><h3>Experiment controls</h3>
        {kind==='reaction'&&<>{range('Barrier parameter',barrier,setBarrier,10,120,1,' kJ mol⁻¹')}{range('Reaction energy',delta,setDelta,-80,80,1,' kJ mol⁻¹')}{range('Reaction progress',progress.toFixed(2),setProgress,0,1,.01)}<button onClick={()=>setPlaying(p=>!p)}>{playing?'Pause progress':'Animate progress'}</button><button aria-pressed={comparison} onClick={()=>setComparison(v=>!v)}>{comparison?'Hide':'Compare'} lower-barrier pathway</button></>}
        {kind==='rdf'&&<>{range('Neighbour spacing',spacing,setSpacing,1.5,3.5,.1,' Å')}{range('Structural disorder',disorder,setDisorder,.05,1,.05)}<button aria-pressed={comparison} onClick={()=>setComparison(v=>!v)}>{comparison?'Hide':'Compare'} ordered structure</button></>}
        {kind==='nmr'&&<>{range('Equivalent neighbours',neighbours,setNeighbours,0,6,1)}{range('Coupling J',coupling,setCoupling,1,15,.5,' Hz')}{range('Chemical shift',shift,setShift,.5,8,.1,' ppm')}{range('Spectrometer frequency',frequency,setFrequency,200,800,100,' MHz')}</>}
        <p className="avc-chart-note">{comparison?'Dashed purple curve: comparison model. ':''}{kind==='reaction'?'The progress marker shows position on the profile; it is not a molecular trajectory or reaction rate.':''}</p>
      </aside>
    </div>
    <footer><h3>What this model shows</h3><p>{title[2]}</p></footer>
  </section>;
}
