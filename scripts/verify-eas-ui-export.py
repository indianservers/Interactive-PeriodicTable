"""Independent RDKit reconstruction of actual UI JSON/CSV downloads (not a model export fixture)."""
import json,csv,sys
from pathlib import Path
sys.path.insert(0,str(Path('.cache/isatin-chemistry').resolve()))
from rdkit import Chem
root=Path('docs/chemistry-91-audit')
book=json.loads((root/'eas-ui-notebook.json').read_text(encoding='utf8'))
rows=list(csv.DictReader((root/'eas-ui-observations.csv').open(encoding='utf8',newline='')))
structures=json.loads(Path('src/data/easStructures.json').read_text())['structures'];seen=set();numeric=0
assert len(rows)==len(book['records']) and len(rows)>=190
assert book['notes'] and not book['records'][0]['included']
meta={'no2','cn','cho','cooh','cf3','nh3'}
for r,c in zip(book['records'],rows):
 v=r['values'];s=r['reading'];fs=structures[v['group']][str(v['attack'])];i=0 if s['stage']==0 else len(fs)-1 if s['stage']==2 else 1+s['contributor'];frame=fs[i]
 params=Chem.SmilesParserParams();params.removeHs=False;m=Chem.MolFromSmiles(frame['smiles'],params)
 full=Chem.AddHs(m);counts={}
 for a in full.GetAtoms():counts[a.GetSymbol()]=counts.get(a.GetSymbol(),0)+1
 formula=''.join(e+(str(counts[e]) if counts[e]!=1 else '') for e in sorted(counts,key=lambda e:(e!='C',e!='H',e)))
 charge=sum(a.GetFormalCharge() for a in full.GetAtoms());electrons=sum(a.GetAtomicNum() for a in full.GetAtoms())-charge
 assert s['formula']==formula==c['total_formula']
 for col,value in [('id',r['id']),('stage',s['stage']),('charge_e',charge),('total_electrons',electrons),('total_atoms',full.GetNumAtoms())]:assert float(c[col])==value;numeric+=1
 for col,value in [('presentation_timeline',v['timeline']),('presentation_phase',round(v['timeline']-s['stage'],9))]:assert abs(float(c[col])-value)<1e-8;numeric+=1
 assert s['charge']==charge and s['electrons']==electrons and s['atoms']==full.GetNumAtoms()
 if s['stage']==1:assert int(c['contributor'])==s['contributor'];numeric+=1
 else:assert c['contributor']=='' and s['contributor'] is None
 favored=v['attack']==3 if v['group'] in meta else v['attack']!=3
 assert s['favored']==favored and c['favored_class']==str(favored).lower()
 assert c['included']==str(r['included']).lower() and c['group']==v['group']
 assert s['ringCharges']==[(v['attack']-1+j)%6+1 for j in (1,3,5)]
 seen.add((v['group'],v['attack'],i))
assert len(seen)==190,len(seen)
message=f'PASS:{len(rows)} actual UI observations;all190 unique Lewis graphs/36 channels/12 substrates;{numeric} numeric CSV fields independently reconstructed with RDKit formula/atomic numbers/charge. Inclusion,notes,qualitative direction and ring-charge topology checked. Not empirical rate/yield validation.'
(root/'eas-export-validation.txt').write_text(message+'\n');print(message)
forged=json.loads(json.dumps(book));forged['records'][0]['reading']['electrons']+=1;(root/'eas-forged-notebook.json').write_text(json.dumps(forged))
