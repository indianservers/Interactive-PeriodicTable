import { useState } from 'react';
import { publishedDataRegistry as datasets } from '../data/publishedDataRegistry.js';
import { downloadPharmaJson } from '../labReports.js';
import '../publishedExperiments.css';

export function ExperimentDataMode({ value, onChange, workspaceLabel = 'Teaching simulation · calculated results' }) {
  return <div className="pharma-data-mode" role="group" aria-label="Data mode">
    <button aria-pressed={value === 'published'} onClick={() => onChange('published')}>Published experimental data</button>
    <button aria-pressed={value === 'simulation'} onClick={() => onChange('simulation')}>{workspaceLabel}</button>
    <button aria-pressed={value === 'comparison'} onClick={() => onChange('comparison')}>Compare evidence &amp; model</button>
  </div>;
}

function Observations({ dataset, selection }) {
  if (!['PMC10865243', 'PMC8950020'].includes(dataset.pmcid) || dataset.tableId === 'tbl2') return null;
  const rows = dataset.groups[0].rows;
  const stability = dataset.pmcid === 'PMC8950020';
  const points = (stability ? rows[selection].slice(2) : rows.map(row => row[selection + 1])).map((cell, index) => {
    const values = cell.split('±').map(Number);
    return { mean: values[0], sd: values[1], label: stability ? ['Baseline', '2 weeks', '1 month', '2 months', '3 months'][index] : rows[index][0] };
  }).filter(p => Number.isFinite(p.mean));
  const max = Math.max(110, ...points.map(p => p.mean + p.sd));
  const y = value => 190 - value / max * 155;
  const x = index => 65 + index * 670 / Math.max(1, points.length - 1);
  return <figure className="published-plot"><svg viewBox="0 0 800 245" role="img" aria-label={`${stability ? 'Storage content' : '45-minute release'}: published means with standard deviation error bars`}>
    {[0, 25, 50, 75, 100].map(value => <g key={value}><path d={`M55 ${y(value)}H755`} stroke="#294759"/><text x="45" y={y(value) + 4} textAnchor="end">{value}</text></g>)}
    {points.map((point, i) => <g key={point.label}><title>{point.label}: {point.mean} ± {point.sd}</title><path d={`M${x(i)} ${y(point.mean - point.sd)}V${y(point.mean + point.sd)}m-5 0h10M${x(i)-5} ${y(point.mean - point.sd)}h10`} stroke="#68e1f5" strokeWidth="2"/><circle cx={x(i)} cy={y(point.mean)} r="4" fill="#68e1f5"/><text x={x(i)} y="213" textAnchor="middle">{point.label}</text></g>)}
    <text x="405" y="237" textAnchor="middle">{stability ? 'Published sampling points (categorical spacing)' : 'Study sample identifiers · each point is at 45 minutes'}</text>
  </svg><figcaption>Reported percentage means ± SD. Discrete observations; no fitted curve or inferred intermediate values.</figcaption></figure>;
}

export default function PublishedExperiment({ lab }) {
  const dataset = datasets[lab];
  const [selection, setSelection] = useState(0);
  const sourceId = dataset.pmcid || dataset.sourceId;
  return <main className="published-experiment" data-published-dataset={sourceId}>
    <header><span className="published-badge">PUBLISHED EXPERIMENTAL DATA · READ ONLY</span><h1>{dataset.displayTitle || (lab === 'hplc' ? 'HPLC method validation' : lab === 'dissolution' ? 'Measured tablet dissolution' : 'Measured formulation stability')}</h1><p>{dataset.formulation}</p></header>
    <section className="published-source"><h2>Study and method</h2><a href={dataset.sourceUrl} target="_blank" rel="noreferrer">{dataset.title} ↗</a><p>{dataset.authors[0]} et al. · {dataset.year} · DOI: <a href={`https://doi.org/${dataset.doi}`} target="_blank" rel="noreferrer">{dataset.doi}</a></p><p>{dataset.conditions}</p><p className="published-limits">{dataset.limitations}</p><p>Source location: {dataset.tableId} · recorded {dataset.retrievedOn}. <a href={dataset.licenseUrl} target="_blank" rel="noreferrer">{dataset.license}</a>{dataset.xmlUrl && <> · <a href={dataset.xmlUrl} target="_blank" rel="noreferrer">Source XML</a></>}</p>{dataset.transcriptionMethod && <p>{dataset.transcriptionMethod}</p>}<button onClick={() => downloadPharmaJson(`published-${lab}-${sourceId}.json`, dataset)}>Download published dataset JSON</button></section>
    {lab === 'hplc' ? <p className="published-limits">These method-specific validation results do not calibrate the separate teaching simulator. Slope and intercept retain the source’s ×10³ scale. k = 3 experiment series; n = 3 replicates. Raw injection records are not available in this dataset.</p> : ['stability', 'dissolution'].includes(lab) ? <label className="published-select">{lab === 'stability' ? 'Published storage group' : 'Published dissolution stage'}<select value={selection} onChange={e => setSelection(Number(e.target.value))}>{(lab === 'stability' ? dataset.groups[0].rows.map(r => `${r[0]} · ${r[1]}`) : ['S1 · six tablets', 'S2 · twelve tablets where reported']).map((label, index) => <option key={label} value={index}>{label}</option>)}</select></label> : null}
    <Observations dataset={dataset} selection={selection}/>
    {dataset.groups.map(group => <section key={group.title}><h2>{group.title}</h2><div className="published-table-scroll"><table><caption>Published summary values · {sourceId} · {dataset.tableId}</caption><thead><tr>{group.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{group.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th key={j} scope="row">{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div></section>)}
  </main>;
}
