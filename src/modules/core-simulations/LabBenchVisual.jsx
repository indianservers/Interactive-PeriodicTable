import LabApparatusScene from './LabApparatusScene.jsx';
export default function LabBenchVisual({kind="titration",running=false,fill="#4ea3ff",label="Sample",apparatus=[]}){return <div className="lab-bench-3d"><LabApparatusScene kind={kind} running={running} fill={fill} label={label}/>{apparatus.length>0&&<p>{apparatus.join(' · ')}</p>}</div>}
