import { useId, useRef, useState } from 'react';
import { comparisonGraphData } from '../simulation/comparisonGraph.js';
import { comparisonCsv, comparisonSvg, comparisonPng, downloadComparisonBlob, exportFilename } from '../simulation/comparisonExports.js';

const fmt=n=>Number(n).toLocaleString(undefined,{maximumSignificantDigits:4});
export default function ComparisonGraph({points,xLabel,yLabel,title,sources=[],modelLabel='Fitted simulation · calculated',connect=true,exportContext={}}) {
  const svgRef=useRef(null),[busy,setBusy]=useState(false),[status,setStatus]=useState('');
  const id=useId(),g=comparisonGraphData(points),W=900,H=390,L=100,R=30,T=30,B=75;
  const x=v=>L+(v-g.xDomain[0])/(g.xDomain[1]-g.xDomain[0])*(W-L-R);
  const y=v=>H-B-(v-g.yDomain[0])/(g.yDomain[1]-g.yDomain[0])*(H-T-B);
  const ticks=domain=>Array.from({length:6},(_,i)=>domain[0]+(domain[1]-domain[0])*i/5);
  const calculated=g.points.filter(p=>Number.isFinite(p.calculated));
  const download=async format=>{
    setBusy(true);setStatus('');
    try {
      const metadata={points:g.points,xLabel,yLabel,title,sources,modelLabel,context:exportContext};
      let blob;
      if(format==='csv')blob=new Blob([comparisonCsv(metadata)],{type:'text/csv;charset=utf-8'});
      else {const image=comparisonSvg({...metadata,plotMarkup:svgRef.current.innerHTML,hasModel:g.hasModel,hasSd:g.hasSd});blob=format==='png'?await comparisonPng(image):new Blob([image.svg],{type:'image/svg+xml;charset=utf-8'});}
      downloadComparisonBlob(blob,`${exportFilename(title)}.${format}`);setStatus(`${format.toUpperCase()} download requested. Includes source links and experimental/calculated labels.`);
    } catch(e){setStatus(`Export failed: ${e.message}`);}finally{setBusy(false);}
  };
  return <figure className="comparison-graph" aria-labelledby={`${id}-caption`}>
    <figcaption id={`${id}-caption`}><strong>{title}</strong></figcaption>
    <div className="comparison-graph-legend"><span><i className="graph-observed"/>Published experiment{g.hasSd?' · ±1 reported SD':''}</span>{g.hasModel&&<span><i className="graph-model"/>{modelLabel}</span>}</div>
    <div className="comparison-export-controls" aria-label="Comparison export options"><button disabled={busy} onClick={()=>download('png')}>Download graph PNG</button><button disabled={busy} onClick={()=>download('svg')}>Download graph SVG</button><button disabled={busy} onClick={()=>download('csv')}>Download comparison CSV</button><p role="status">{status}</p></div>
    <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{title}</title><desc id={`${id}-desc`}>Published measurements and {g.hasModel?'calculated results at the same published inputs':'no calculated results yet'}. {g.hasSd?'Vertical error bars show one reported standard deviation on experimental points only.':'No experimental uncertainty was reported; no error bars are generated.'} Exact values are in the comparison table below.</desc>
      {ticks(g.yDomain).map((v,i)=><g key={i}><line x1={L} x2={W-R} y1={y(v)} y2={y(v)} className="graph-grid"/><text x={L-12} y={y(v)+4} textAnchor="end">{fmt(v)}</text></g>)}
      {ticks(g.xDomain).map((v,i)=><g key={i}><line x1={x(v)} x2={x(v)} y1={H-B} y2={H-B+5} className="graph-axis"/><text x={x(v)} y={H-B+25} textAnchor="middle">{fmt(v)}</text></g>)}
      <line x1={L} x2={L} y1={T} y2={H-B} className="graph-axis"/><line x1={L} x2={W-R} y1={H-B} y2={H-B} className="graph-axis"/>
      <text x={(L+W-R)/2} y={H-15} textAnchor="middle">{xLabel}</text><text transform={`translate(20 ${(T+H-B)/2}) rotate(-90)`} textAnchor="middle">{yLabel}</text>
      {connect&&calculated.length>1&&<polyline className="graph-model-line" points={calculated.map(p=>`${x(p.x)},${y(p.calculated)}`).join(' ')}/>}
      {g.points.map((p,i)=><g key={i}>
        {p.sd!=null&&<g className="graph-error-bar" data-reported-sd={p.sd}><line x1={x(p.x)} x2={x(p.x)} y1={y(p.y-p.sd)} y2={y(p.y+p.sd)}/><line x1={x(p.x)-6} x2={x(p.x)+6} y1={y(p.y-p.sd)} y2={y(p.y-p.sd)}/><line x1={x(p.x)-6} x2={x(p.x)+6} y1={y(p.y+p.sd)} y2={y(p.y+p.sd)}/></g>}
        <circle cx={x(p.x)} cy={y(p.y)} r="5" className="graph-observed-point"><title>{p.label||p.x}: published {p.reported??p.y}{p.sd!=null?' (±1 SD)':''}</title></circle>
        {Number.isFinite(p.calculated)&&<path d={`M ${x(p.x)} ${y(p.calculated)-6} l 6 6 l -6 6 l -6 -6 Z`} className="graph-model-point"><title>{p.label||p.x}: {modelLabel} {fmt(p.calculated)}</title></path>}
      </g>)}
    </svg>
    <p>{g.hasSd?'Error bars: ±1 published SD, not confidence or prediction intervals. Points without reported SD have no error bars.':'No reported SD for these observations; no uncertainty bars are invented.'} {g.hasModel?`Diamonds are calculated results.${connect&&calculated.length>1?' Dashed segments connect calculations at the published inputs.':''}`:'Run the comparison to overlay calculated results.'}</p>
    <p>{sources.map((s,i)=><span key={s.sourceUrl}>{i>0?' · ':''}<a href={s.sourceUrl} target="_blank" rel="noreferrer">{s.title||'Published source'} ↗</a></span>)}</p>
  </figure>;
}
