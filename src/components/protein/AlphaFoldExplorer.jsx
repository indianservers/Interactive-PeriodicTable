import {useEffect,useRef,useState} from 'react';
import {MolstarViewer,ViewerErrorBoundary} from '../molecular-viewer/index.js';
import './alphaFoldExplorer.css';

const accession='P02185';

export default function AlphaFoldExplorer(){
 const viewer=useRef(null);
 const [entry,setEntry]=useState(null),[pdb,setPdb]=useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
 const [color,setColor]=useState('bfactor'),[sticks,setSticks]=useState(false),[selection,setSelection]=useState(null);
 useEffect(()=>{
  const controller=new AbortController();let disposed=false;
  setError('');setEntry(null);setPdb('');
  (async()=>{
   try{
    const response=await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`,{signal:controller.signal});
    if(!response.ok)throw new Error(`AlphaFold metadata unavailable (${response.status}).`);
    const entries=await response.json(),record=entries.find(item=>item.uniprotAccession===accession&&item.pdbUrl);
    if(!record)throw new Error('No downloadable prediction found for sperm-whale myoglobin.');
    const url=new URL(record.pdbUrl);
    if(url.protocol!=='https:'||url.hostname!=='alphafold.ebi.ac.uk')throw new Error('Unexpected AlphaFold coordinate source.');
    const pdbResponse=await fetch(url,{signal:controller.signal});
    if(!pdbResponse.ok)throw new Error(`AlphaFold coordinates unavailable (${pdbResponse.status}).`);
    const text=await pdbResponse.text();
    const residueCount=new Set(text.split(/\r?\n/).filter(line=>line.startsWith('ATOM')&&line.slice(12,16).trim()==='CA').map(line=>`${line[21]}:${line.slice(22,26).trim()}`)).size;
    if(residueCount!==record.sequenceEnd-record.sequenceStart+1)throw new Error('Prediction sequence and coordinates do not agree.');
    if(!disposed){setEntry({...record,residueCount});setPdb(text);}
   }catch(e){if(!disposed&&e.name!=='AbortError')setError(e.message);}
  })();
  return()=>{disposed=true;controller.abort();};
 },[retry]);
 return <section className="ps-af-explorer">
  <p>Real AlphaFold DB coordinates · sperm-whale myoglobin · UniProt {accession}</p>
  <div className="ps-af-controls"><label>Color <select aria-label="AlphaFold coloring" value={color} onChange={e=>setColor(e.target.value)}><option value="bfactor">Model confidence (pLDDT)</option><option value="spectrum">Sequence rainbow</option></select></label><button disabled={!pdb} aria-pressed={sticks} onClick={()=>setSticks(value=>!value)}>Atomic sticks</button><button disabled={!pdb} onClick={()=>viewer.current?.reset()}>Fit prediction</button></div>
  <div className="ps-af-view" aria-label="Interactive AlphaFold prediction">{pdb&&<ViewerErrorBoundary><MolstarViewer ref={viewer} source={pdb} sourceType="pdb" label="AlphaFold P02185 prediction" representation={{Cartoon:true,Surface:false,Sticks:sticks}} colorScheme={color} selectedResidue={selection?.residue} onSelectionChange={setSelection}/></ViewerErrorBoundary>}{!pdb&&!error&&<p className="ps-af-state" role="status">Loading prediction from AlphaFold DB…</p>}{error&&<p className="ps-af-state" role="alert">{error} <button onClick={()=>setRetry(value=>value+1)}>Retry AlphaFold</button></p>}</div>
  <p className="ps-af-hover">{selection?`${selection.residueName} ${selection.residue} · atom ${selection.atom}`:'Drag to rotate · scroll to zoom · click an atom to inspect its residue'}</p>
  <div className="ps-af-legend">{[['#0053d6','Very high ≥90'],['#65cbf3','Confident 70–90'],['#ffdb13','Low 50–70'],['#ff7d45','Very low <50']].map(([c,label])=><span key={label}><i style={{background:c}}/>{label}</span>)}</div>
  {entry&&<p>{entry.residueCount} residues · mean pLDDT {entry.globalMetricValue} · model version {entry.latestVersion}<br/>Prediction, not an experimental structure. Includes the initiator methionine: 1MBN residue 29 corresponds to prediction residue 30. No heme is present in this model.</p>}
  <div className="ps-af-links"><a href="https://alphafold.ebi.ac.uk/entry/P02185" target="_blank" rel="noreferrer">AlphaFold record ↗</a>{entry&&<a href={entry.pdbUrl} target="_blank" rel="noreferrer">Download predicted PDB ↗</a>}<a href="https://www.rcsb.org/structure/1MBN" target="_blank" rel="noreferrer">Experimental 1MBN ↗</a></div>
  <h3>Open-source tools</h3>
  <p>This coordinate-backed prediction is inspected with Mol*. Prediction coordinates come from AlphaFold DB (CC BY 4.0).</p>
  <div className="ps-af-links"><a href="https://github.com/sokrypton/ColabFold" target="_blank" rel="noreferrer">ColabFold — sequence-to-structure workflow ↗</a><a href="https://github.com/openmm/openmm" target="_blank" rel="noreferrer">OpenMM — molecular dynamics toolkit ↗</a></div>
  <p>ColabFold and OpenMM are external workflows, not running in this browser. AlphaFold confidence is not folding energy or mutation ΔΔG. The studio timeline and mutation estimates remain illustrative, not outputs of these tools.</p>
 </section>;
}
