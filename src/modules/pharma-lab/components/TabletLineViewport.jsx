export default function TabletLineViewport({stage,running,progress}){
 const pills=Array.from({length:9},(_,i)=>i);
 return <div className={`plab-tablet-line ${running?"running":""}`}>
  <div className="plab-granulator"><i/><b>HIGH-SHEAR<br/>GRANULATOR</b><span className="granules"/></div>
  <div className="plab-transfer"><span/></div>
  <div className="plab-press"><div className="plab-press-hopper"/><div className="plab-press-body"><i/><i/><i/><b>ROTARY TABLET PRESS</b></div></div>
  <div className="plab-process-insets"><span>POWDER BLENDING</span><span>WET GRANULES</span><span>DRIED GRANULES</span></div>
  <div className="plab-punch-insets"><span>UPPER PUNCH</span><span>TABLET COMPRESSION</span><span>LOWER DIE</span></div>
  <div className="plab-tablets">{pills.map(i=><i key={i}/>)}</div>
  <div className="plab-line-status"><b>{stage.toUpperCase()}</b><span style={{width:`${progress}%`}}/></div>
 </div>
}

