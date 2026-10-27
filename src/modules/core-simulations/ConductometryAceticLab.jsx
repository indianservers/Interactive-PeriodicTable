import ConductometryWorkbench,{validateConductometryWorkspace as validate} from './ConductometryWorkbench.jsx';
import * as Weak from './conductometryAceticModel.js';
export const validateAceticConductometryWorkspace=input=>validate(input,Weak);
export default function ConductometryAceticLab(props){return <ConductometryWorkbench {...props} variant="acetate"/>;}
