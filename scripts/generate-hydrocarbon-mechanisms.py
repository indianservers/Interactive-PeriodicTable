"""Original mapped chemical graphs; no reference-image pixels or source diagrams."""
import json, sys, math
from pathlib import Path
sys.path.insert(0, str(Path('.cache/isatin-chemistry').resolve()))
from rdkit import Chem, rdBase
from rdkit.Chem import AllChem, rdMolDescriptors, rdMolTransforms

# Only the hydrogen transferred by the illustrated step is explicitly mapped.
# Other hydrogens remain attached to their mapped parent in the Lewis graphs.
cases = {
 'ionic': [
  '[CH2:1]=[CH:2][CH3:3].[H:4][Br:5]',
  '[CH2:1]([H:4])[CH+:2][CH3:3].[Br-:5]',
  '[CH2:1]([H:4])[CH:2]([Br:5])[CH3:3]'],
 'radical': [
  '[CH2:1]=[CH:2][CH3:3].[Br:5].[H:4][Br:6]',
  '[CH2:1]([Br:5])[CH:2][CH3:3].[H:4][Br:6]',
  '[CH2:1]([Br:5])[CH:2]([H:4])[CH3:3].[Br:6]'],
 'e2': [
  '[CH3:1][CH:2]([Br:5])[CH:3]([H:8])[CH3:4].[CH3:6][CH2:7][O-:9]',
  '[CH3:1]/[CH:2]=[CH:3]/[CH3:4].[CH3:6][CH2:7][O:9][H:8].[Br-:5]'],
 'e2terminal': [
  '[CH2:1]([H:8])[CH:2]([Br:5])[CH2:3][CH3:4].[CH3:6][CH2:7][O-:9]',
  '[CH2:1]=[CH:2][CH2:3][CH3:4].[CH3:6][CH2:7][O:9][H:8].[Br-:5]'],
 'ozone': [
  '[CH3:1][C:2]([CH3:3])=[CH:4][CH3:5].[O-:6][O+:7]=[O:8].[Zn:9]',
  '[CH3:1][C:2]1([CH3:3])[CH:4]([CH3:5])[O:8][O:7][O:6]1.[Zn:9]',
  '[CH3:1][C:2]([CH3:3])=[O+:6][O-:7].[CH:4](=[O:8])[CH3:5].[Zn:9]',
  '[CH3:1][C:2]1([CH3:3])[O:6][O:7][CH:4]([CH3:5])[O:8]1.[Zn:9]',
  '[CH3:1][C:2]([CH3:3])=[O:6].[CH:4](=[O:8])[CH3:5].[Zn+2:9].[O-2:7]'],
 'alkyne1': [
  '[CH:1]#[C:2][CH2:3][CH3:4].[H:5][Br:6]',
  '[CH:1]([H:5])=[C:2]([Br:6])[CH2:3][CH3:4]'],
 'alkyne2': [
  '[CH:1]#[C:2][CH2:3][CH3:4].[H:5][Br:6].[H:7][Br:8]',
  '[CH:1]([H:5])=[C:2]([Br:6])[CH2:3][CH3:4].[H:7][Br:8]',
  '[CH:1]([H:5])([H:7])[C:2]([Br:6])([Br:8])[CH2:3][CH3:4]'],
}

# Balanced, alkaline net comparison only; not an elementary Mn mechanism.
# Oxygen-isotope transfer is not predicted by this bookkeeping map.
alkenes=[];diols=[]
for j in range(3):
 c=10*j+1;o=101+2*j;h=201+2*j
 alkenes.append(f'[CH2:{c}]=[CH:{c+1}][CH3:{c+2}]')
 diols.append(f'[CH2:{c}]([O:{o}][H:{h}])[CH:{c+1}]([O:{o+1}][H:{h+1}])[CH3:{c+2}]')
perm=['[O-:101][Mn:301](=[O:102])(=[O:103])=[O:104]', '[O-:105][Mn:302](=[O:106])(=[O:107])=[O:108]']
water=[f'[O:{111+j}]([H:{201+2*j}])[H:{202+2*j}]' for j in range(4)]
oxide=['[Mn+4:301]','[Mn+4:302]']+[f'[O-2:{i}]'for i in [107,108,111,112]]
hydroxide=['[O-:113][H:207]','[O-:114][H:208]']
cases['diol']=['.'.join(alkenes+perm+water),'.'.join(diols+oxide+hydroxide)]

params=Chem.SmilesParserParams();params.removeHs=False
out={}
for key, smiles_list in cases.items():
 frames=[];reference=None
 for stage, smiles in enumerate(smiles_list):
  mol=Chem.MolFromSmiles(smiles,params)
  assert mol is not None,(key,stage)
  ids=[a.GetAtomMapNum()for a in mol.GetAtoms()]
  assert len(set(ids))==len(ids) and min(ids)>0
  mh=Chem.AddHs(mol)
  counts={e:sum(a.GetSymbol()==e for a in mh.GetAtoms())for e in sorted({a.GetSymbol()for a in mh.GetAtoms()})}
  ledger={'counts':counts,'charge':sum(a.GetFormalCharge()for a in mol.GetAtoms()),'radicals':sum(a.GetNumRadicalElectrons()for a in mol.GetAtoms()if a.GetSymbol()not in ['Mn','Zn'])}
  identity=sorted((a.GetAtomMapNum(),a.GetSymbol())for a in mol.GetAtoms())
  if reference is None:reference=(ledger,identity)
  assert (ledger,identity)==reference,(key,stage,ledger,reference)
  AllChem.Compute2DCoords(mol)
  conf=mol.GetConformer()
  atoms=[{'id':a.GetAtomMapNum(),'element':a.GetSymbol(),'charge':a.GetFormalCharge(),'radicals':a.GetNumRadicalElectrons()if a.GetSymbol()not in ['Mn','Zn']else 0,'h':a.GetTotalNumHs(),'xy':[round(conf.GetAtomPosition(a.GetIdx()).x,7),round(conf.GetAtomPosition(a.GetIdx()).y,7)]}for a in mol.GetAtoms()]
  bonds=[{'a':b.GetBeginAtom().GetAtomMapNum(),'b':b.GetEndAtom().GetAtomMapNum(),'order':int(b.GetBondTypeAsDouble()),'stereo':str(b.GetStereo())}for b in mol.GetBonds()]
  components=[];three_atoms=[];three_bonds=[];cursor=0
  parts=Chem.GetMolFrags(mol,asMols=True,sanitizeFrags=True)
  for part_index, part in enumerate(parts):
   formula=rdMolDescriptors.CalcMolFormula(part)
   components.append({'ids':[a.GetAtomMapNum()for a in part.GetAtoms()],'formula':formula,'charge':Chem.GetFormalCharge(part)})
   explicit=Chem.AddHs(part)
   if any(a.GetSymbol()=='Mn'for a in explicit.GetAtoms())and explicit.GetNumAtoms()>1:
    # Ideal tetrahedron for the resonance-drawn permanganate ion; no metal force-field claim.
    dirs=iter([[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]])
    positions=[[0,0,0]if a.GetSymbol()=='Mn'else[x*1.63/math.sqrt(3)for x in next(dirs)]for a in explicit.GetAtoms()]
   elif explicit.GetNumAtoms()>1:
    setup=AllChem.ETKDGv3();setup.randomSeed=3900+stage*20+part_index
    status=AllChem.EmbedMolecule(explicit,setup)
    if status!=0:
     setup.useRandomCoords=True;status=AllChem.EmbedMolecule(explicit,setup)
    assert status==0,(key,stage,part_index)
    if key in ['e2','e2terminal']and stage==0 and part_index==0:
     idx={a.GetAtomMapNum():a.GetIdx()for a in explicit.GetAtoms()if a.GetAtomMapNum()}
     beta=3 if key=='e2'else 1
     for trial in range(64):
      if trial:
       setup.randomSeed=39000+trial;assert AllChem.EmbedMolecule(explicit,setup)==0
      c=explicit.GetConformer();rdMolTransforms.SetDihedralDeg(c,idx[8],idx[beta],idx[2],idx[5],180)
      if key=='e2terminal'or abs(rdMolTransforms.GetDihedralDeg(c,idx[1],idx[2],idx[3],idx[4]))>120:break
     else:raise AssertionError('No E-compatible anti conformer found')
     assert abs(abs(rdMolTransforms.GetDihedralDeg(c,idx[8],idx[beta],idx[2],idx[5]))-180)<1e-7
    conf3=explicit.GetConformer();positions=[list(conf3.GetAtomPosition(i))for i in range(explicit.GetNumAtoms())]
   else:positions=[[0,0,0]]
   xmin=min(p[0]for p in positions);xmax=max(p[0]for p in positions)
   cy=sum(p[1]for p in positions)/len(positions);cz=sum(p[2]for p in positions)/len(positions)
   offset=len(three_atoms)
   for i,a in enumerate(explicit.GetAtoms()):
    pos=positions[i]
    px=pos[0]-xmin+cursor;py=pos[1]-cy
    if len(parts)>4:px=pos[0]-(xmin+xmax)/2+(part_index%4)*7.5;py+=(part_index//4)*5
    parent=next((n.GetAtomMapNum()for n in a.GetNeighbors()if n.GetAtomMapNum()),0)
    three_atoms.append({'id':a.GetAtomMapNum(),'parent':parent,'element':a.GetSymbol(),'charge':a.GetFormalCharge(),'radicals':a.GetNumRadicalElectrons()if a.GetSymbol()not in ['Mn','Zn']else 0,'component':part_index,'p':[round(px,7),round(py,7),round(pos[2]-cz,7)]})
   three_bonds +=[{'a':b.GetBeginAtomIdx()+offset,'b':b.GetEndAtomIdx()+offset,'order':int(b.GetBondTypeAsDouble())}for b in explicit.GetBonds()]
   cursor+=max(1,xmax-xmin)+2.4
  # Solid products are grouped as neutral bookkeeping formula units, never
  # offered as separate free aqueous metal/oxide "species" in the 3D selector.
  if key=='ozone'and stage==4:
   components=components[:2]+[{'ids':[9,7],'formula':'ZnO formal net unit','charge':0,'netSink':True}]
   for atom in three_atoms:
    if atom['id']in [9,7]:atom['component']=2;atom['p']=[10+(1.9 if atom['id']==7 else 0),0,0]
  if key=='diol'and stage==1:
   components=components[:3]+[{'ids':[301,107,108],'formula':'MnO2(s) formula unit','charge':0,'bulk':True},{'ids':[302,111,112],'formula':'MnO2(s) formula unit','charge':0,'bulk':True}]+components[9:]
   for atom in three_atoms:
    if atom['id']in [301,107,108]:atom['component']=3;atom['p']=[(atom['id']!=301)*(-1.8 if atom['id']==107 else 1.8),5,0]
    elif atom['id']in [302,111,112]:atom['component']=4;atom['p']=[7.5+(atom['id']!=302)*(-1.8 if atom['id']==111 else 1.8),5,0]
    elif atom['component']>=9:atom['component']-=4
  center=[(min(a['p'][i]for a in three_atoms)+max(a['p'][i]for a in three_atoms))/2 for i in range(3)]
  for a in three_atoms:a['p']=[round(a['p'][i]-center[i],7)for i in range(3)]
  frames.append({'smiles':smiles,'atoms':atoms,'bonds':bonds,'components':components,'ledger':ledger,'three':{'atoms':three_atoms,'bonds':three_bonds}})
 out[key]=frames
out['provenance']={'generator':f'RDKit {rdBase.rdkitVersion}','twoD':'Original RDKit coordinate graphs; drawn as live SVG, no source-image pixels','threeD':'ETKDGv3 fixed seeds per nonmetal fragment; computed illustrative conformers without force-field energy optimization. E2 reactants are reoriented to tracked anti H-C-C-Br180degrees; internal branch chooses an E-compatible chain conformation. Permanganate assigned tetrahedral1.63Angstrom coordinates. Not experimental coordinates, transition states or a reaction trajectory. Separated fragments arranged for viewing. Mapped H explicit; other H attached to parent. ZnO is a grouped formal net oxygen-sink icon, not a prediction of oxide precipitation/final zinc speciation; MnO2 is a grouped solid formula-unit icon. Their spacing is assigned bookkeeping, not molecular/lattice geometry or free aqueous ions. Metal spin/magnetism not modeled; radical count includes only nonmetal Lewis radicals.'}
Path('src/data/hydrocarbonMechanismStructures.json').write_text(json.dumps(out,indent=2),encoding='utf8')
print({k:len(v)for k,v in out.items()if k!='provenance'})
