"""Validate actual browser downloads without importing the JS calculation model."""
import csv,json,math,re
from pathlib import Path
root=Path('docs/chemistry-91-audit')
book=json.loads((root/'hydrocarbon-ui-notebook.json').read_text(encoding='utf8'))
data=json.loads(Path('src/data/hydrocarbonMechanismStructures.json').read_text(encoding='utf8'))
with (root/'hydrocarbon-ui-observations.csv').open(encoding='utf-8-sig',newline='')as f:rows=list(csv.DictReader(f))
assert len(rows)==len(book['records'])==24
assert len({r['reaction']for r in rows})==8
assert book['notes'].startswith('UI audit:22 stable stages')
atomic={'H':1,'C':6,'O':8,'Br':35,'Mn':25,'Zn':30}
expected={'ionic':('C3H7Br',0,0),'radical':('C3H7Br2',0,1),'e2':('C6H14BrO',-1,0),'e2terminal':('C6H14BrO',-1,0),'ozone':('C5H10O3Zn',0,0),'alkyne1':('C4H7Br',0,0),'alkyne2':('C4H8Br2',0,0),'diol':('C9H26Mn2O12',-2,0)}
numeric=0
for row,record in zip(rows,book['records']):
 v=record['values'];reading=record['reading'];key=v['reaction'];formula,q,rad=expected[key]
 counts={e:int(n or 1)for e,n in re.findall(r'([A-Z][a-z]?)(\d*)',formula)}
 assert counts==reading['counts']
 electrons=sum(atomic[e]*n for e,n in counts.items())-q
 stage=min(len(data[key])-1,math.floor(v['timeline']+1e-8));phase=0 if stage==len(data[key])-1 else round(v['timeline']-stage,2)
 a,b=data[key][stage],data[key][min(stage+1,len(data[key])-1)]
 bonds=lambda f:{tuple(sorted((x['a'],x['b']))):x['order']for x in f['bonds']}
 A,B=bonds(a),bonds(b)
 changes={pair:(A.get(pair,0),B.get(pair,0))for pair in A.keys()|B.keys()if A.get(pair,0)!=B.get(pair,0)}
 assert {tuple(sorted((d['a'],d['b']))):(d['before'],d['after'])for d in reading['changes']}==changes
 assert reading['formula']==row['total_formula']==formula
 assert reading['charge']==q and reading['electrons']==electrons and reading['radicals']==rad
 checks={'id':record['id'],'stage_index':stage,'presentation_phase':phase,'charge_e':q,'total_electrons':electrons,'nonmetal_Lewis_radicals':rad,'changed_bonds':len(changes)}
 for name,value in checks.items():assert abs(float(row[name])-value)<1e-9;numeric+=1
 assert(row['included']=='true')==record['included']
 assert row['stage_title']==reading['stageTitle']
assert rows[0]['included']=='false'
assert float(rows[-1]['presentation_phase'])==float(rows[-2]['presentation_phase'])==.5
assert all(float(r['presentation_phase'])==0 for r in rows[:-2])
for key in expected:
 stages={int(r['stage_index'])for r in rows[:-2]if r['reaction']==key}
 assert stages==set(range(len(data[key])))
bad=json.loads(json.dumps(book));bad['records'][0]['reading']['electrons']+=1
(root/'hydrocarbon-forged-notebook.json').write_text(json.dumps(bad),encoding='utf8')
result=f'PASS:24 actual UI observations,all22 stable stages/eight pathways,{numeric} numeric CSV fields,independent formula/atomic-electron/charge/radical and bond-difference reconstruction; notes/inclusion and fractional presentation snapshot checked. Not experimental validation.'
(root/'hydrocarbon-export-validation.txt').write_text(result+'\n',encoding='utf8')
print(result)
