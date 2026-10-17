import './apparatusIllustration.css';
import LabApparatusScene from './LabApparatusScene.jsx';
export default function ApparatusIllustration({kind,alt}){return <figure className="lab-apparatus-illustration"><LabApparatusScene kind={kind==='soil-analysis-bench'?'soil-bench':kind} label={alt}/><figcaption>Interactive procedural 3D apparatus.</figcaption></figure>}
