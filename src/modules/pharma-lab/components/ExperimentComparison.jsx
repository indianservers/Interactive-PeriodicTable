import { useState } from 'react';
import { publishedDataRegistry } from '../data/publishedDataRegistry.js';
import identities from '../data/verifiedCompoundIdentities.json';
import { comparePublished, comparisonScopes } from '../simulation/publishedComparison.js';
import { downloadPharmaJson } from '../labReports.js';
import '../publishedExperiments.css';
import studyPresets from '../data/studyModelPresets.json';
import StudyPresetComparison from './StudyPresetComparison.jsx';
import ComparisonGraph from './ComparisonGraph.jsx';

export default function ExperimentComparison({ lab }) {
  return studyPresets[lab] ? <StudyPresetComparison key={lab} lab={lab}/> : <LegacyExperimentComparison lab={lab}/>;
}

function LegacyExperimentComparison({ lab }) {
  const dataset = publishedDataRegistry[lab];
  const [group, setGroup] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const scope = comparisonScopes[lab];
  const supported = ['stability','api-synthesis'].includes(lab);
  const sourceId = dataset.pmcid || dataset.sourceId;
  const calculate = () => comparePublished(lab, dataset, { groupIndex:group, identity:identities.compounds.find(compound=>compound.CID === 1983) });
  const run = () => { try { setResult(calculate()); setError(''); } catch (e) { setResult(null); setError(e.message); } };
  const clear = () => { setResult(null); setError(''); };
  const exportComparison = () => downloadPharmaJson(`comparison-${lab}-${sourceId}.json`, {
    createdAt:new Date().toISOString(),
    comparison:result || calculate(),
    publishedDataset:dataset,
    labels:{ experimental:'Published observations or summary statistics', calculated:'Calculated fit or consistency check; not new experimental measurements', independentValidation:false },
  });
  return <main className="published-experiment pharma-comparison" data-published-dataset={sourceId} data-comparison-kind={result?.kind || (supported ? 'pending-calculation' : 'unmatched')}>
    <header><span className="published-badge">PUBLISHED EVIDENCE / MODEL COMPARISON</span><h1>{dataset.displayTitle || ({hplc:'HPLC validation',dissolution:'Tablet dissolution',stability:'Formulation stability'})[lab]}</h1><p>Numerical comparisons require the same material, protocol, endpoint and units. A shared compound name or apparatus setting is insufficient.</p></header>
    <section className="published-source"><a href={dataset.sourceUrl} target="_blank" rel="noreferrer">{dataset.title} · source results ↗</a><p>{dataset.authors[0]} et al. · {dataset.year} · <a href={`https://doi.org/${dataset.doi}`} target="_blank" rel="noreferrer">DOI {dataset.doi}</a></p><p>{dataset.conditions}</p><p><a href={dataset.licenseUrl} target="_blank" rel="noreferrer">{dataset.license}</a> · Reported values and source limitations are retained.</p></section>
    <div className="comparison-pair">
      <section><span className="published-badge">PUBLISHED EXPERIMENTAL DATA</span><h2>Study scope</h2><p>{scope[0]}</p></section>
      <section><span className="comparison-calculated">MODEL / CALCULATION · NOT MEASURED</span><h2>{supported ? 'Supported comparison scope' : 'Workspace model scope'}</h2><p>{scope[1]}</p></section>
    </div>
    <p className="published-limits" role="status"><strong>{supported ? 'Limited comparison available. ' : 'Numerical comparison blocked. '}</strong>{scope[2]}</p>
    {lab === 'stability' && <section className="comparison-controls"><h2>Match one published storage group</h2><label>Study group<select aria-label="Comparison storage group" value={group} onChange={e => {setGroup(Number(e.target.value));clear();}}>{dataset.groups[0].rows.map((row,i)=><option key={i} value={i}>{row[0]} · {row[1]}</option>)}</select></label><p>Fit C(t) = C₀ exp(−kt) to this group’s monthly means. The shared baseline fixes C₀; months 1, 2 and 3 estimate k. The 2-week point is not converted to a fractional month or fitted. Reported SD remains experimental uncertainty; it is not a prediction interval.</p><button onClick={run}>Fit study-matched first-order model</button><button onClick={clear} disabled={!result && !error}>Clear comparison results</button></section>}
    {lab === 'api-synthesis' && <section className="comparison-controls"><h2>Match the amount-to-mass operation only</h2><p>Compare the paper’s isolated paracetamol amount with its isolated mass using the verified molecular identity. This does not match the full synthesis route or predict the isolated yield.</p><button onClick={run}>Calculate reported-amount mass check</button><button onClick={clear} disabled={!result && !error}>Clear comparison results</button></section>}
    {error && <p role="alert">Comparison unavailable: {error}</p>}
    {supported && !result && !error && <p>No calculated comparison has been run. Published measurements below remain unchanged.</p>}
    {result?.kind === 'calibrated-first-order-fit' && <section aria-label="Matched stability comparison results"><h2>Same study group · fitted results beside published means</h2><p>{result.group} · {result.temperatureC} °C / {result.rhPercent}% RH · {result.packaging}</p><p className="published-limits">CALIBRATED ON THESE DATA · NOT INDEPENDENT VALIDATION. This separate study-specific fit does not validate the tablet/blister teaching simulator.</p><p>Calculated k: {result.kPerMonth.toPrecision(5)} month⁻¹ · fixed C₀: {result.baseline}% · RMSE over the three fitted monthly means: {result.rmse.toFixed(4)} percentage points.</p><div className="published-table-scroll"><table><caption>Experimental observations and calculated fit at the same published monthly time points</caption><thead><tr><th scope="col">Study month</th><th scope="col">Published experiment (%), mean ± SD</th><th scope="col">Calculated first-order fit (%)</th><th scope="col">Calculated − published (percentage points)</th></tr></thead><tbody>{result.results.map(point=><tr key={point.month}><th scope="row">{point.month === 0 ? '0 · shared baseline' : point.month}</th><td>{point.reported}</td><td>{point.calculated.toFixed(4)}</td><td>{point.difference.toFixed(4)}</td></tr>)}</tbody></table></div><p>{result.method}</p></section>}
    {result?.kind === 'amount-mass-consistency' && <section aria-label="Synthesis mass consistency results"><h2>Same compound and isolated amount · consistency check</h2><p>{result.method}</p><p>Reference molar mass: {result.molarMass} g/mol · <a href={result.identitySource} target="_blank" rel="noreferrer">PubChem CID 1983</a></p><div className="published-table-scroll"><table><caption>Rounded published quantities compared with molecular-mass arithmetic; no reactor or yield prediction</caption><thead><tr><th scope="col">Published isolated amount (mmol)</th><th scope="col">Published isolated mass (g)</th><th scope="col">Calculated mass (g)</th><th scope="col">Calculated − published (g)</th></tr></thead><tbody><tr><td>{result.amountMmol}</td><td>{result.reportedText}</td><td>{result.calculatedGrams.toFixed(6)}</td><td>{result.differenceGrams.toFixed(6)}</td></tr></tbody></table></div><p>No measurement uncertainty was reported for these rounded amounts. The difference is not interpreted as an error or pass/fail result.</p></section>}
    {!supported && <section className="comparison-controls"><h2>What prevents a valid numerical pairing?</h2><p>{scope[2]}</p><p>No model value, difference, agreement score or pass/fail decision is generated for unmatched observations.</p></section>}
    {result?.kind==='calibrated-first-order-fit'&&<ComparisonGraph points={result.results.map(p=>({...p,x:p.month,y:p.mean}))} xLabel="Study time (calendar months)" yLabel="Reported content (%)" title={`${result.group} · published content and first-order fit`} sources={[dataset]} exportContext={{protocol:result.packaging+"; "+result.temperatureC+" °C / "+result.rhPercent+"% RH",method:result.method,limitations:scope[2]}}/>}
    {result?.kind==='amount-mass-consistency'&&<ComparisonGraph points={[{x:result.amountMmol,y:result.reportedGrams,reported:result.reportedText,calculated:result.calculatedGrams,sd:null,label:'Paracetamol (6)'}]} xLabel="Published isolated amount (mmol)" yLabel="Isolated mass (g)" title="Published isolated mass and calculated mass consistency check" modelLabel="Calculated mass · not a reactor simulation" sources={[dataset,{title:'PubChem molecular mass · CID 1983',sourceUrl:result.identitySource}]} exportContext={{protocol:dataset.conditions,method:result.method,limitations:scope[2]}} connect={false}/>}
    <button className="comparison-download" disabled={supported && !result} onClick={exportComparison}>Download comparison JSON</button>
    <section><h2>Published observations used or assessed</h2><p>{dataset.limitations}</p>{dataset.groups.map(g=><div className="published-table-scroll" key={g.title}><table><caption>{g.title} · <a href={dataset.sourceUrl} target="_blank" rel="noreferrer">Original source</a></caption><thead><tr>{g.headers.map(h=><th key={h} scope="col">{h}</th>)}</tr></thead><tbody>{g.rows.map((row,i)=><tr key={i}>{row.map((cell,j)=>j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>)}</section>
  </main>;
}
