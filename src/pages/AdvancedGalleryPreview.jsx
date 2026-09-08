import { useId } from 'react';
import {radialDistribution,reactionEnergy} from './advancedChartModels.js';

// Small procedural previews navigate to the corresponding learning content.
// These are not used as the interactive stage.
export default function AdvancedGalleryPreview({kind}) {
  const id=useId().replaceAll(':','');
  return <svg viewBox="0 0 132 96" aria-hidden="true" className="avc-gallery-preview">
    <defs>
      <radialGradient id={`${id}red`}><stop stopColor="#fb8295"/><stop offset="1" stopColor="#7f1d43"/></radialGradient>
      <radialGradient id={`${id}blue`}><stop stopColor="#667bff"/><stop offset="1" stopColor="#222187"/></radialGradient>
      <radialGradient id={`${id}atom`} cx="35%" cy="25%"><stop stopColor="#fff"/><stop offset="1" stopColor="#8c9baa"/></radialGradient>
    </defs>
    <rect width="132" height="96" rx="5" fill="#06111e"/>
    {kind==='orbital'&&<>
      <ellipse cx="66" cy="28" rx="37" ry="23" fill={`url(#${id}red)`}/>
      <ellipse cx="66" cy="69" rx="37" ry="22" fill={`url(#${id}blue)`}/>
      <path d="M22 37h88l15 24H8Z" fill="#a9c8f02a" stroke="#7493b6"/>
      <path d="M33 34L53 50H80L100 34M33 65L53 50M80 50L100 65" stroke="#bdc8de" strokeWidth="5"/>
      {[[53,50,9],[80,50,9],[33,34,6],[100,34,6],[33,65,6],[100,65,6]].map(([x,y,r],i)=><circle key={i} cx={x} cy={y} r={r} fill={i<2?'#394354':`url(#${id}atom)`}/>)}
    </>}
    {kind==='surface'&&Array.from({length:20},(_,j)=><path key={j} d={Array.from({length:40},(_,i)=>{const x=(i-20)/9,y=(j-10)/6,z=36*Math.exp(-(x*x+y*y)*.65);return `${i?'L':'M'}${66+x*22+y*10},${66+y*13-z}`;}).join(' ')} fill="none" stroke={`hsl(${240-j*11} 85% 55%)`} strokeWidth="2"/>)}
    {kind==='nmr'&&<>
      <path d="M66 8V16M66 16L48 31M66 16L84 31M48 31L30 46M48 31L66 46M84 31L66 46M84 31L102 46" fill="none" stroke="#b8d2e9" strokeWidth="1.2"/>
      <path d="M18 81H117M30 81V65M66 81V50M102 81V65" fill="none" stroke="#70e7ef" strokeWidth="1.6"/>
      <text x="66" y="94" textAnchor="middle" fill="#b2c9df" fontSize="8">1 : 2 : 1 triplet</text>
    </>}
    {(kind==='rdf'||kind==='reaction')&&<>
      <path d="M18 10V78H122" fill="none" stroke="#7599b8"/>
      <path d={Array.from({length:160},(_,i)=>{const t=i/159;const y=kind==='rdf'?78-17*radialDistribution(t*10,2.5,.25):62-.7*reactionEnergy(t,60,-20);return `${i?'L':'M'}${18+t*104},${y}`;}).join(' ')} fill="none" stroke={kind==='reaction'?'#f26c82':'#45dce9'} strokeWidth="1.6"/>
      {kind==='reaction'?<><text x="63" y="17" fill="#d6e7f8" fontSize="8">TS</text><circle cx="18" cy="62" r="3" fill="#4cdbef"/><circle cx="122" cy="76" r="3" fill="#ef667f"/><text x="13" y="91" fill="#b2c9df" fontSize="7">Reactants　　Products</text></>:<>
        <path d="M18 61H122" stroke="#8d9b7377" strokeDasharray="3 3"/>
        {[0,2,4,6,8,10].map(n=><text key={n} x={18+n*10.4} y="88" fill="#b2c9df" fontSize="7" textAnchor="middle">{n}</text>)}
        {[1,2,3].map(n=><text key={n} x="13" y={81-n*17} fill="#b2c9df" fontSize="7" textAnchor="end">{n}</text>)}
        <text x="55" y="96" fill="#b2c9df" fontSize="7">r (Å)</text>
      </>}
    </>}
    {kind==='lattice'&&<>
      {[0,1,2].map(z=><g key={z} transform={`translate(${z*13},${-z*9})`}><path d="M24 40L65 26L89 45L49 60Z M24 40V82L49 94L89 78V45M49 60V94" fill="none" stroke="#4a9bdf"/>{[[24,40],[65,26],[89,45],[49,60],[24,82],[49,94],[89,78]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="2.4" fill="#efcd82"/>)}</g>)}
    </>}
    {kind==='dynamics'&&<>
      <path d="M18 26L93 8L118 27V79L43 91L18 72Z M18 26L43 43L118 27M43 43V91" fill="#102d4933" stroke="#4384b6"/>
      {Array.from({length:32},(_,i)=>{const x=25+((i*.61803398875)%1)*84,y=18+((i*.41421356237)%1)*62;return <g key={i}><path d={`M${x-6} ${y+3}Q${x-2} ${y+4} ${x} ${y}`} fill="none" stroke="#57cbe46b"/><circle cx={x} cy={y} r="3.5" fill={`url(#${id}atom)`}/></g>;})}
    </>}
  </svg>;
}
