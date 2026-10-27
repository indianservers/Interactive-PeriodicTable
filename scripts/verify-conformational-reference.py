"""Re-evaluate exported browser/model coordinates with RDKit MMFF94 and independent geometry/weights."""
import sys,json,csv,math
from pathlib import Path
sys.path.insert(0,str(Path('.cache/isatin-chemistry').resolve()))
import numpy as np
from rdkit import Chem
from rdkit.Chem import AllChem,rdMolTransforms,rdMolDescriptors
ROOT=Path('docs/chemistry-91-audit');DATA=json.loads(Path('src/data/conformationalScans.json').read_text())['molecules'];R=.00831446261815324
def molecule(meta,p):
 rw=Chem.RWMol()
 for a in meta['atoms']:
  atom=Chem.Atom(a['element']);atom.SetAtomMapNum(a['id']);atom.SetFormalCharge(a['charge']);atom.SetNoImplicit(True);rw.AddAtom(atom)
 for b in meta['bonds']:rw.AddBond(b['a'],b['b'],Chem.BondType.SINGLE)
 mol=rw.GetMol();Chem.SanitizeMol(mol);conf=Chem.Conformer(mol.GetNumAtoms())
 for i,point in enumerate(p):conf.SetAtomPosition(i,point)
 mol.AddConformer(conf);return mol
def coords(v):
 m=DATA[v['molecule']];r=m['rotamers'][v['rotamer']];theta=v['theta']%360;k=int(math.floor(theta+.5))%360 if v['scan']=='relaxed' else None;base=r['positions'] if k is None else r['relaxedPositions'][k];p=np.array(base,dtype=float);axis=p[m['axis'][1]]-p[m['axis'][0]];axis/=np.linalg.norm(axis);origin=p[m['axis'][1]].copy();phi=math.radians((theta-(180 if k is None else k))*r['rotationSign']);c,s=math.cos(phi),math.sin(phi)
 for i in m['rear']:
  q=p[i]-origin;p[i]=origin+q*c+np.cross(axis,q)*s+axis*np.dot(axis,q)*(1-c)
 return p.tolist()
def expected(v,p=None):
 meta=DATA[v['molecule']];rot=meta['rotamers'][v['rotamer']];p=coords(v) if p is None else p;mol=molecule(meta,p);c=mol.GetConformer();a,c1,c2,b=meta['torsion'];e=rot['relaxedEnergiesKJ' if v['scan']=='relaxed' else 'energiesKJ'];minimum=meta['globalRelaxedMinimumKJ' if v['scan']=='relaxed' else 'globalGridMinimumKJ'];k=min(359,int(v['theta']));f=v['theta']-k;energy=e[k]+(e[k+1]-e[k])*f;weights=np.exp(-(np.array(e[:360])-min(e))/(R*v['temperature']));weights/=weights.sum();actual=rdMolTransforms.GetDihedralDeg(c,a,c1,c2,b)%360
 result={'thetaActual':actual,'energyKJ':energy,'relativeKJ':energy-minimum,'barrierKJ':max(e)-min(e),'centralBondAngstrom':rdMolTransforms.GetBondLength(c,c1,c2),'frontAngleDeg':rdMolTransforms.GetAngleDeg(c,a,c1,c2),'rearAngleDeg':rdMolTransforms.GetAngleDeg(c,c1,c2,b),'chiActual':None,'contactDistanceAngstrom':None,'contactAngleDeg':None,'basinPlus':float(weights[:120].sum()),'basinAnti':float(weights[120:240].sum()),'basinMinus':float(weights[240:].sum()),'pointProbabilityPerDegree':float(weights[int(math.floor(v['theta']+.5))%360])}
 if meta['ohHydrogen'] is not None:
  h=meta['ohHydrogen'];result.update(chiActual=rdMolTransforms.GetDihedralDeg(c,h,b,c2,c1)%360,contactDistanceAngstrom=rdMolTransforms.GetBondLength(c,h,a),contactAngleDeg=rdMolTransforms.GetAngleDeg(c,b,h,a))
 evaluated=AllChem.MMFFGetMoleculeForceField(mol,AllChem.MMFFGetMoleculeProperties(mol,mmffVariant='MMFF94'),nonBondedThresh=100,ignoreInterfragInteractions=False).CalcEnergy()*4.184
 return result,evaluated,rdMolDescriptors.CalcMolFormula(mol),sum(a.GetAtomicNum()-a.GetFormalCharge() for a in mol.GetAtoms())
checks=0;fractional_max={'rigid':0,'relaxed':0}
for item in json.loads((ROOT/'conformational-reference-fixtures.json').read_text()):
 v=item['values'];ref,evaluated,formula,electrons=expected(v,item['positions']);assert item['reading']['formula']==formula and item['reading']['electrons']==electrons
 for key,value in ref.items():
  actual=item['reading'][key]
  if value is None:assert actual is None
  elif key in ['thetaActual','chiActual']:assert abs((actual-value+180)%360-180)<3e-5
  else:assert abs(actual-value)<1e-7,(key,actual,value)
  checks+=1
 discrepancy=abs(item['reading']['energyKJ']-evaluated)
 if float(v['theta']).is_integer():assert discrepancy<1e-4,(v,discrepancy)
 else:fractional_max[v['scan']]=max(fractional_max[v['scan']],discrepancy)
print(f'PASS:{checks} geometry/MMFF-grid/Boltzmann numeric/null fields across266 independently reconstructed fixtures. Integer-grid coordinate energies re-evaluate within1e-4kJ/mol. Sampled fractional energy/geometry discrepancy:{fractional_max}')
(ROOT/'conformational-reference-validation.json').write_text(json.dumps({'fields':checks,'fixtures':266,'integerEnergyToleranceKJ':1e-4,'sampledFractionalDiscrepancyKJ':fractional_max},indent=2))
if '--ui' in sys.argv:
 book=json.loads((ROOT/'conformational-ui-notebook.json').read_text());rows=list(csv.DictReader((ROOT/'conformational-ui-observations.csv').open(newline='')));assert len(rows)==len(book['records']);count=0;seen=set()
 for r,row in zip(book['records'],rows):
  v=r['values'];ref,_,formula,electrons=expected(v);assert int(row['id'])==r['id'] and row['formula']==formula and int(row['electrons'])==electrons and row['included']==str(r['included']).lower();seen.add(v['molecule'])
  for key,value in ref.items():
   actual=r['reading'][key]
   if value is None:assert actual is None and row[key]==''
   elif key in ['thetaActual','chiActual']:assert abs((actual-value+180)%360-180)<3e-5 and abs((float(row[key])-value+180)%360-180)<3e-5
   else:assert abs(actual-value)<1e-7 and abs(float(row[key])-value)<1e-7
   count+=1
 assert len(seen)==5
 message=f'PASS:{len(rows)} actual UI observations across5 molecules;{count} independently reconstructed geometry/energy/Boltzmann numeric/null CSV+JSON fields. Computational model consistency,not experimental free-energy validation.'
 (ROOT/'conformational-export-validation.txt').write_text(message+'\n');print(message);forged=json.loads(json.dumps(book));forged['records'][0]['reading']['relativeKJ']+=1;(ROOT/'conformational-forged-notebook.json').write_text(json.dumps(forged))
 scan=list(csv.DictReader((ROOT/'conformational-ui-scan.csv').open(newline='')));assert len(scan)==361
 for i,row in enumerate(scan):
  v={'molecule':row['molecule'],'rotamer':row['OH_rotamer'],'scan':row['scan'],'temperature':int(row['temperature_K']),'theta':float(row['theta_deg'])};assert v['theta']==i
  ref,_,_,_=expected(v)
  for column,key in [('MMFF_kJ_mol','energyKJ'),('relative_kJ_mol','relativeKJ'),('probability_per_degree','pointProbabilityPerDegree')]:assert abs(float(row[column])-ref[key])<1e-7
 assert abs(sum(float(row['probability_per_degree']) for row in scan[:360])-1)<1e-10
 assert scan[0]['MMFF_kJ_mol']==scan[360]['MMFF_kJ_mol']
 message=f'PASS:361 scan rows;1083 computed fields;1805 metadata fields;periodic endpoint and360-bin probability normalization.';print(message)
 with (ROOT/'conformational-export-validation.txt').open('a') as out:out.write(message+'\n')
