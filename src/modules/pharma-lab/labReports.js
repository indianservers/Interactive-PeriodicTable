export const pharmaReferences = [
  ['PubChem: acetaminophen identity and properties', 'https://pubchem.ncbi.nlm.nih.gov/compound/1983'],
  ['PubChem: atorvastatin descriptors', 'https://pubchem.ncbi.nlm.nih.gov/compound/60823'],
  ['RCSB PDB 1HWK: experimental atorvastatin complex', 'https://www.rcsb.org/structure/1HWK'],
  ['ICH Q1A(R2): stability study framework', 'https://www.ich.org/page/quality-guidelines'],
  ['USP: dissolution harmonization', 'https://www.usp.org/harmonization-standards/pdg/general-methods/dissolution'],
];
export function downloadPharmaJson(filename, data) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], {type:'application/json'}));
  const anchor = document.createElement('a'); anchor.href=url; anchor.download=filename; anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export function savePharmaReport() {
  const root=document.querySelector('.plab main') || document.querySelector('main');
  const report={title:root?.querySelector('h1')?.textContent || 'Pharmaceutical laboratory report',page:location.hash,createdAt:new Date().toISOString(),
    provenance:'Published experimental summaries retain study citations and reported units. Compound identities and molecular coordinates are sourced reference data. Generated simulation traces are teaching calculations, not instrument measurements or validated clinical predictions.',
    publishedDataset:root?.getAttribute?.('data-published-dataset') || null,
    comparisonKind:root?.getAttribute?.('data-comparison-kind') || null,
    controls:[...(root?.querySelectorAll('input,select,textarea')||[])].map((el,index)=>({index,label:el.getAttribute('aria-label')||el.closest('label')?.textContent?.trim()||el.name||el.type,value:el.type==='checkbox'?el.checked:el.value})),
    tables:[...(root?.querySelectorAll('table')||[])].map(table=>[...table.rows].map(row=>[...row.cells].map(cell=>cell.textContent.trim()))),
    displayedResults:root?.innerText || '',sources:[...pharmaReferences,...[...(root?.querySelectorAll('a[href^="https://"]')||[])].filter(a=>a.href).map(a=>[a.textContent.trim(),a.href])]};
  localStorage.setItem(`pharma-report:${location.hash}`,JSON.stringify(report));
  downloadPharmaJson(`pharma-${location.hash.split('/').at(-1)||'home'}-report.json`,report);
  return report;
}
