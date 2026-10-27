"""Original mapped EAS Lewis graphs and fixed-seed teaching conformers; no image assets."""
import sys,json,math
from pathlib import Path
sys.path.insert(0,str(Path('.cache/isatin-chemistry').resolve()))
from rdkit import Chem,rdBase
from rdkit.Chem import AllChem,rdMolDescriptors

groups={'oh':'[OH:7]','nh2':'[NH2:7]','ome':'[O:7][CH3:8]','me':'[CH3:7]',
 'no2':'[N+:7](=[O:8])[O-:9]','cn':'[C:7]#[N:8]','cho':'[CH:7]=[O:8]',
 'cooh':'[C:7](=[O:8])[OH:9]','cf3':'[C:7]([F:8])([F:9])[F:10]',
 'cl':'[Cl:7]','br':'[Br:7]','nh3':'[NH3+:7]'}
donors={'oh','nh2','ome','cl','br'}
def ix(m,n):return next(a.GetIdx() for a in m.GetAtoms() if a.GetAtomMapNum()==n)
def clean(m):
 # Preserve the deliberately selected Kekulé form; rounding aromatic 1.5 bonds would invent six double bonds.
 Chem.SanitizeMol(m,sanitizeOps=Chem.SanitizeFlags.SANITIZE_ALL^Chem.SanitizeFlags.SANITIZE_SETAROMATICITY)
 # Br+ and H+ below are formal electrophile/acid bookkeeping, not isolated spin-state predictions.
 for a in m.GetAtoms():a.SetNumRadicalElectrons(0)
 return m
def geometry(m,seed):
 h=Chem.AddHs(m)
 p=AllChem.ETKDGv3();p.randomSeed=seed
 if AllChem.EmbedMolecule(h,p)!=0:raise ValueError('Embedding failed')
 return h
def serial(m,three,title,charge_at=None,kind='sigma'):
 Chem.rdDepictor.Compute2DCoords(m)
 conf=m.GetConformer();atoms=[]
 for a in m.GetAtoms():
  p=conf.GetAtomPosition(a.GetIdx());atoms.append({'id':a.GetAtomMapNum(),'element':a.GetSymbol(),'charge':a.GetFormalCharge(),'radicals':0,'h':a.GetTotalNumHs(),'xy':[round(p.x,5),round(p.y,5)]})
 bonds=[{'a':b.GetBeginAtom().GetAtomMapNum(),'b':b.GetEndAtom().GetAtomMapNum(),'order':round(b.GetBondTypeAsDouble())} for b in m.GetBonds()]
 counts={};q=sum(a.GetFormalCharge() for a in m.GetAtoms());ta=[];tc=three.GetConformer()
 frags=Chem.GetMolFrags(three);which={i:k for k,part in enumerate(frags) for i in part}
 # Separate disconnected formal ions for legibility; no ion-pair distance is implied.
 centers={k:[sum(tc.GetAtomPosition(i)[j] for i in part)/len(part) for j in range(3)] for k,part in enumerate(frags)}
 for a in three.GetAtoms():
  e=a.GetSymbol();counts[e]=counts.get(e,0)+1;p=tc.GetAtomPosition(a.GetIdx());part=which[a.GetIdx()];center=centers[part]
  ta.append({'id':a.GetAtomMapNum(),'parent':next((n.GetAtomMapNum() for n in a.GetNeighbors()),0),'element':e,'charge':a.GetFormalCharge(),'radicals':0,'component':part,'p':[round(p[j]-center[j]+(part*6 if j==0 else 0),5) for j in range(3)]})
 components=[]
 for part in Chem.GetMolFrags(m):
  cc={};ids=[]
  for i in part:
   a=m.GetAtomWithIdx(i);ids.append(a.GetAtomMapNum());cc[a.GetSymbol()]=cc.get(a.GetSymbol(),0)+1
   if a.GetTotalNumHs():cc['H']=cc.get('H',0)+a.GetTotalNumHs()
  formula=''.join(e+(str(cc[e]) if cc[e]!=1 else '') for e in sorted(cc,key=lambda e:(e!='C',e!='H',e)))
  components.append({'formula':formula,'ids':ids})
 return {'title':title,'kind':kind,'chargeAt':charge_at,'smiles':Chem.MolToSmiles(m),'atoms':atoms,'bonds':bonds,'components':components,'ledger':{'counts':counts,'charge':q,'radicals':0},'three':{'atoms':ta,'bonds':[{'a':b.GetBeginAtomIdx(),'b':b.GetEndAtomIdx(),'order':round(b.GetBondTypeAsDouble())} for b in three.GetBonds()]}}

out={}
for gi,(key,sub) in enumerate(groups.items()):
 out[key]={}
 for attack in (2,3,4):
  m=Chem.MolFromSmiles('[c:1]1('+sub+')[cH:2][cH:3][cH:4][cH:5][cH:6]1')
  Chem.Kekulize(m,clearAromaticFlags=True)
  rw=Chem.RWMol(m);a=rw.GetAtomWithIdx(ix(rw,attack));a.SetNumExplicitHs(0);a.SetNoImplicit(True)
  h=Chem.Atom('H');h.SetAtomMapNum(31);h.SetNoImplicit(True);hi=rw.AddAtom(h);rw.AddBond(ix(rw,attack),hi,Chem.BondType.SINGLE)
  e=Chem.Atom('Br');e.SetFormalCharge(1);e.SetAtomMapNum(30);e.SetNoImplicit(True);rw.AddAtom(e);react=clean(rw.GetMol())
  walk=[(attack-1+j)%6+1 for j in range(1,6)]
  rr=Chem.RWMol(react)
  for j in range(1,7):rr.GetBondBetweenAtoms(ix(rr,j),ix(rr,j%6+1)).SetBondType(Chem.BondType.SINGLE)
  for x,y in [(attack,walk[0]),(walk[1],walk[2]),(walk[3],walk[4])]:rr.GetBondBetweenAtoms(ix(rr,x),ix(rr,y)).SetBondType(Chem.BondType.DOUBLE)
  react=clean(rr.GetMol())
  seed=40000+gi*100+attack*10
  frames=[serial(react,geometry(react,seed),'Aromatic substrate + formal Br+ electrophile',kind='reactant')]
  sigma=[]
  for k in range(3):
   r=Chem.RWMol(react)
   for j in range(1,7):r.GetBondBetweenAtoms(ix(r,j),ix(r,j%6+1)).SetBondType(Chem.BondType.SINGLE)
   for x,y in ({0:[(1,2),(3,4)],1:[(0,1),(3,4)],2:[(0,1),(2,3)]}[k]):r.GetBondBetweenAtoms(ix(r,walk[x]),ix(r,walk[y])).SetBondType(Chem.BondType.DOUBLE)
   cat=walk[2*k];r.GetAtomWithIdx(ix(r,cat)).SetFormalCharge(1);r.GetAtomWithIdx(ix(r,30)).SetFormalCharge(0);r.AddBond(ix(r,attack),ix(r,30),Chem.BondType.SINGLE)
   sigma.append((clean(r.GetMol()),cat))
  geo=geometry(sigma[0][0],seed+1)
  for k,(s,cat) in enumerate(sigma):
   # Same atom coordinates for resonance contributors: nuclei do not move between drawings.
   g=Chem.AddHs(s);g.RemoveAllConformers();g.AddConformer(Chem.Conformer(geo.GetConformer()),assignId=True)
   frames.append(serial(s,g,f'σ-complex contributor {k+1}: ring charge at C{cat}',cat))
  if key in donors and any(cat==1 for _,cat in sigma):
   original=next(s for s,cat in sigma if cat==1);r=Chem.RWMol(original);r.GetAtomWithIdx(ix(r,1)).SetFormalCharge(0);r.GetAtomWithIdx(ix(r,7)).SetFormalCharge(1);r.GetBondBetweenAtoms(ix(r,1),ix(r,7)).SetBondType(Chem.BondType.DOUBLE);s=clean(r.GetMol());g=Chem.AddHs(s);g.RemoveAllConformers();g.AddConformer(Chem.Conformer(geo.GetConformer()),assignId=True)
   frames.append(serial(s,g,'Lone-pair donation contributor: positive charge on substituent',7))
  r=Chem.RWMol(react);r.RemoveBond(ix(r,attack),ix(r,31));r.GetAtomWithIdx(ix(r,31)).SetFormalCharge(1);r.GetAtomWithIdx(ix(r,30)).SetFormalCharge(0);r.AddBond(ix(r,attack),ix(r,30),Chem.BondType.SINGLE);product=clean(r.GetMol());frames.append(serial(product,geometry(product,seed+2),'Aromatic monosubstitution product + formal H+',kind='product'))
  assert all(f['ledger']==frames[0]['ledger'] for f in frames)
  assert all(sorted(a['id'] for a in f['atoms'])==sorted(a['id'] for a in frames[0]['atoms']) for f in frames)
  out[key][str(attack)]=frames
Path('src/data/easStructures.json').write_text(json.dumps({'provenance':{'generator':'RDKit '+rdBase.rdkitVersion,'geometry':'Fixed-seed ETKDGv3 organic teaching conformers; no energy optimization. Same nuclear coordinates for sigma-complex resonance drawings. Disconnected formal ions separated for display. No reaction trajectory, catalyst/solvent speciation, spin state or selectivity/rate prediction.'},'structures':out},separators=(',',':')))
print('Generated',sum(len(v) for v in out.values()),'channels;',sum(len(fs) for v in out.values() for fs in v.values()),'conserved Lewis graphs.')
