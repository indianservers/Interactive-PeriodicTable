import { useId } from 'react';

const P = { left: 44, right: 390, top: 18, bottom: 172 };
const extent = (series, key) => {
  const values = series.flatMap(s => s.data.map(d => d[key])).filter(Number.isFinite);
  if (!values.length) return [0, 1];
  const min = Math.min(...values), max = Math.max(...values);
  return min === max ? [min - 1, max + 1] : [min, max];
};

export function Plot({ title, series = [], xLabel, yLabel, xDomain, yDomain, children, legend = true, logX = false, logY = false }) {
  const id = useId().replace(/:/g, '');
  const [xmin, xmax] = xDomain || extent(series, 'x');
  const [ymin, ymax] = yDomain || extent(series, 'y');
  const tx = x => P.left + ((logX ? Math.log10(Math.max(x, 1e-30)) - Math.log10(Math.max(xmin, 1e-30)) : x - xmin) / (logX ? Math.log10(xmax) - Math.log10(Math.max(xmin, 1e-30)) : xmax - xmin || 1)) * (P.right - P.left);
  const ty = y => P.bottom - ((logY ? Math.log10(Math.max(y, 1e-30)) - Math.log10(Math.max(ymin, 1e-30)) : y - ymin) / (logY ? Math.log10(ymax) - Math.log10(Math.max(ymin, 1e-30)) : ymax - ymin || 1)) * (P.bottom - P.top);
  return <article className="pcs-card pcs-plot" aria-label={title}>
    <h3>{title}</h3>
    <svg viewBox="0 0 410 212" role="img" aria-label={`${title}. ${xLabel} by ${yLabel}.`}>
      <defs><clipPath id={id}><rect x={P.left} y={P.top} width={P.right-P.left} height={P.bottom-P.top}/></clipPath></defs>
      {Array.from({length:6},(_,i)=><g key={`g${i}`}><path d={`M${P.left} ${P.top+i*(P.bottom-P.top)/5}H${P.right}`} className="grid"/><path d={`M${P.left+i*(P.right-P.left)/5} ${P.top}V${P.bottom}`} className="grid"/></g>)}
      <path d={`M${P.left} ${P.top}V${P.bottom}H${P.right}`} className="axis"/>
      {[0,.25,.5,.75,1].map((t,i)=><g key={`t${i}`}><text x={P.left+t*(P.right-P.left)} y="190" textAnchor="middle">{(xmin+t*(xmax-xmin)).toPrecision(2)}</text><text x="39" y={P.bottom-t*(P.bottom-P.top)+4} textAnchor="end">{(ymin+t*(ymax-ymin)).toPrecision(2)}</text></g>)}
      <g clipPath={`url(#${id})`}>{series.map((s,i)=>{const pts=s.data.filter(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)).map(d=>`${tx(d.x)},${ty(d.y)}`).join(' ');return <g key={s.label||i}><polyline points={pts} fill="none" stroke={s.color||'#34b7ff'} strokeWidth={s.width||2} strokeDasharray={s.dash||undefined}/>{s.points&&s.data.map((d,j)=><circle key={j} cx={tx(d.x)} cy={ty(d.y)} r="2.2" fill={s.color||'#34b7ff'}/>)}</g>})}{typeof children==='function'&&children({tx,ty,P})}</g>
      <text x={(P.left+P.right)/2} y="209" textAnchor="middle">{xLabel}</text><text transform="translate(12 96) rotate(-90)" textAnchor="middle">{yLabel}</text>
      {legend&&<g className="legend">{series.slice(0,3).map((s,i)=><g key={s.label} transform={`translate(${230+(i%2)*86} ${29+Math.floor(i/2)*17})`}><path d="M0 0h17" stroke={s.color||'#34b7ff'} strokeWidth="2" strokeDasharray={s.dash||undefined}/><text x="22" y="4">{s.label}</text></g>)}</g>}
    </svg>
  </article>;
}

