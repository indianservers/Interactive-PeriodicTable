import { publishedDataRegistry } from '../data/publishedDataRegistry.js';
import '../publishedExperiments.css';

export default function PublishedEvidenceIndex() {
  return <section className="published-evidence-index" aria-label="Published pharmaceutical evidence library"><h2>Published experimental evidence</h2><p>Open a laboratory’s read-only study data. Formulations, methods and source limitations are retained; simulations are separate.</p><div>{Object.entries(publishedDataRegistry).map(([route, dataset]) => <a key={route} href={`#/visuals/pharma/${route}`}><strong>{dataset.displayTitle || ({hplc:'HPLC validation',dissolution:'Tablet dissolution',stability:'Formulation stability'})[route]}</strong><span>{dataset.authors[0]} et al. · {dataset.year}</span></a>)}</div></section>;
}
