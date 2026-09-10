import {useState} from 'react';
export default function ProteinEnergy({time}){
 const [tip,setTip]=useState(null);
 const point=(r,angle)=>({x:205+145*r*Math.cos(angle),y:143-112*(1-Math.exp(-5*r*r))+18*r*Math.sin(angle)});
 const paths=Array.from({length:60},(_,i)=>Array.from({length:45},(_,j)=>{const r=j/44,a=i*Math.PI/30+.12*Math.sin(j/7);const p=point(r,a);return `${j?'L':'M'}${p.x.toFixed(2)} ${p.y.toFixed(2)}`;}).join(' '));
 const marker=point(1-time/200,1.5+time/70);
 return <div className="ps-energy-chart" onMouseLeave={()=>setTip(null)}>
  <svg viewBox="0 0 420 184" role="img" aria-label="Illustrative protein-folding free-energy funnel" onMouseMove={e=>setTip({x:e.nativeEvent.offsetX,y:e.nativeEvent.offsetY})}>
   <defs><linearGradient id="ps-energy-spectrum" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#b857ce"/><stop offset=".3" stopColor="#6e6aef"/><stop offset=".55" stopColor="#1ad2e6"/><stop offset=".8" stopColor="#92db68"/><stop offset="1" stopColor="#ff765c"/></linearGradient></defs>
   <path d="M48 18V153H393" stroke="#64819a" fill="none"/>
   {[20,0,-20,-40].map((v,i)=><g key={v}><text x="38" y={34+i*35} textAnchor="end">{v}</text><path d={`M45 ${30+i*35}h4`} stroke="#64819a"/></g>)}
   {paths.map((d,i)=><path key={i} d={d} fill="none" stroke="url(#ps-energy-spectrum)" strokeWidth=".65" opacity=".8"/>)}
   {Array.from({length:13},(_,i)=>{const r=(i+1)/13;return <ellipse key={i} cx="205" cy={143-112*(1-Math.exp(-5*r*r))} rx={145*r} ry={18*r} fill="none" stroke="url(#ps-energy-spectrum)" strokeWidth=".4" opacity=".55"/>;})}
   <circle data-energy-marker cx={marker.x} cy={marker.y} r="4" fill="#fff" stroke="#54cdff" strokeWidth="2"/>
   <text x="264" y="145">ΔGfold = −42.1 kcal/mol*</text><text x="155" y="177">Conformational space</text><text transform="translate(14 135) rotate(-90)">Free energy (kcal/mol)</text>
   <rect x="386" y="30" width="10" height="86" fill="url(#ps-energy-spectrum)" stroke="#628da3"/>
  </svg>
  {tip&&<div className="ps-chart-tooltip" style={{left:Math.min(tip.x,190),top:Math.max(0,tip.y-40)}}>Illustrative state: {time} / 200 ns<br/>Not measured free-energy data</div>}
 </div>;
}
