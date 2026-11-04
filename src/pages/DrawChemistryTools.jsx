import { useEffect, useState } from 'react';
import { prepareReaction, calculateStoichiometry } from '../utils/drawCalculations.js';

export default function DrawChemistryTools({ smiles, descriptors, model, onHighlight, onStereoTool, onName }) {
  const [equation, setEquation] = useState('H2 + O2 -> H2O');
  const [amounts, setAmounts] = useState(['4', '32']);
  const [unit, setUnit] = useState('g');
  const [naming, setNaming] = useState({});
  useEffect(() => { setNaming({}); }, [smiles]);
  let reaction, result, error;
  try { reaction = prepareReaction(equation); result = calculateStoichiometry(reaction, amounts, unit); }
  catch (e) { error = e.message; }
  useEffect(() => {
    const controller = new AbortController();
    if (naming.loading && smiles) {
      let disposed = false;
      const timer = setTimeout(() => controller.abort(), 20000);
      fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/property/IUPACName/JSON`, { signal: controller.signal })
        .then(async response => {
          if (!response.ok) throw Error(response.status === 404 ? 'No PubChem name found for this structure.' : 'Name lookup unavailable. Try again.');
          const data = await response.json();
          const property = data.PropertyTable?.Properties?.[0];
          if (!property?.IUPACName) throw Error('No IUPAC name returned.');
          if (!controller.signal.aborted) { setNaming({ name: property.IUPACName, cid: property.CID }); onName(property.IUPACName); }
        })
        .catch(e => { if (disposed) return; if (!controller.signal.aborted) setNaming({ error: e.message }); else if (e.name === 'AbortError') setNaming({ error: 'Name lookup timed out. Try again.' }); })
        .finally(() => clearTimeout(timer));
      return () => { disposed = true; clearTimeout(timer); controller.abort(); };
    }
  }, [naming.loading, smiles]);
  const stereo = descriptors.stereo;
  return <section className="draw-chemistry-tools">
    <details open><summary>Built-in stoichiometric calculations</summary>
      <p>Balance neutral formulas, then enter available reactant amounts.</p>
      <label>Reaction<input aria-label="Reaction equation" value={equation} onChange={e => { setEquation(e.target.value); setAmounts([]); }}/></label>
      <label>Amount unit<select value={unit} onChange={e => { setUnit(e.target.value); setAmounts([]); }}><option value="g">grams (g)</option><option value="mol">moles (mol)</option></select></label>
      {reaction && <><p>{reaction.balanced}</p>{reaction.left.map((f, i) => <label key={i}>{f} ({unit})<input type="number" min="0" step="any" value={amounts[i] ?? ''} onChange={e => setAmounts(a => { const next = [...a]; next[i] = e.target.value; return next; })}/></label>)}</>}
      {error && <p role="status">{error}</p>}
      {result && <div aria-live="polite"><p>Limiting reactant: <b>{result.limiting.join(' + ')}</b></p>{result.products.map((p, i) => <p key={i}>Theoretical {p.formula}: <b>{p.grams.toPrecision(5)} g</b> ({p.mol.toPrecision(5)} mol)</p>)}{reaction.left.map((f, i) => <p key={i}>Remaining {f}: {result.remaining[i].toPrecision(4)} mol</p>)}</div>}
    </details>
    <details open><summary>Stereochemistry & chiral centers</summary>
      <p>Use wedge / dashed bonds to define orientation. Atom numbers refer to the canvas.</p>
      <button onClick={() => onStereoTool('Wedge bond')}>Solid wedge</button> <button onClick={() => onStereoTool('Dashed bond')}>Dashed wedge</button>
      {!stereo ? <p>Draw a valid molecule to analyze stereochemistry.</p> : <>
        {!stereo.CIP_atoms.length && <p>No tetrahedral chiral centers detected.</p>}
        {stereo.CIP_atoms.map(([index, tag]) => <button key={index} onClick={() => onHighlight([model.atoms[index].id])}>Atom {model.atoms[index]?.id}: {tag === '(?)' ? 'Unspecified configuration' : tag}</button>)}
        {stereo.CIP_bonds.map(([a, b, tag]) => <p key={`${a}-${b}`}>Atoms {model.atoms[a]?.id}–{model.atoms[b]?.id}: {tag}</p>)}
      </>}
    </details>
    <details open><summary>IUPAC name generation</summary>
      <p>Look up the current structure in PubChem. Internet required; unregistered structures may have no match.</p>
      <button disabled={!smiles || naming.loading} onClick={() => setNaming({ loading: true })}>{naming.loading ? 'Finding name…' : 'Generate IUPAC name'}</button>
      <p role="status">{naming.error || naming.name}</p>
      {naming.cid && <a href={`https://pubchem.ncbi.nlm.nih.gov/compound/${naming.cid}`} target="_blank" rel="noreferrer">PubChem source</a>}
    </details>
  </section>;
}
