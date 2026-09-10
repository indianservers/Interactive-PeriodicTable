export default function DissolutionApparatus({running,elapsed,rpm,temperature,loaded,paddlesRaised}){
 return <div className={`plab-dissolution-rig ${running?"running":""} ${paddlesRaised?"raised":""}`}>
  <div className="plab-rig-head"><b>USP II</b><span>Paddle speed <strong>{rpm} rpm</strong></span><span>Temperature <strong>{temperature.toFixed(1)} °C</strong></span><span>Elapsed <strong>{elapsed.toFixed(1)} / 45 min</strong></span></div>
  <div className="plab-rig-shaftbar"/>
  <div className="plab-vessels">{Array.from({length:6},(_,i)=><div className="plab-vessel" key={i}><b>{i+1}</b><i className="shaft"/><i className="paddle"/><span className="medium">{running&&Array.from({length:7},(_,j)=><em key={j}/>)}</span>{loaded&&<span className="tablet"/>}</div>)}</div>
  <div className="plab-rig-base"><b>{temperature.toFixed(1)} °C WATER BATH</b></div><div className="plab-autosampler"><b>AUTOSAMPLER</b>{Array.from({length:6},(_,i)=><i key={i}/>)}</div>
 </div>
}

