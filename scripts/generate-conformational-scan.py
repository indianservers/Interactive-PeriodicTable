"""Original MMFF94 rigid torsion scans and explicit-H reference geometries. No image inputs."""
import json,sys,math
from pathlib import Path
sys.path.insert(0,str(Path('.cache/isatin-chemistry').resolve()))
import numpy as np
from rdkit import Chem,rdBase
from rdkit.Chem import AllChem,rdMolTransforms,rdMolDescriptors

cases={'ethane':('[CH3:1][CH3:2]','Ethane'), 'propane':('[CH3:1][CH2:2][CH3:3]','Propane'), 'butane':('[CH3:3][CH2:1][CH2:2][CH3:4]','n-Butane'), 'dichloroethane':('[Cl:3][CH2:1][CH2:2][Cl:4]','1,2-Dichloroethane'), 'chloroethanol':('[Cl:3][CH2:1][CH2:2][OH:4]','2-Chloroethanol')}
def idx(m,id):return next(a.GetIdx() for a in m.GetAtoms() if a.GetAtomMapNum()==id)
def angle_diff(a,b):return (a-b+180)%360-180
data={}
for ci,(key,(smiles,label)) in enumerate(cases.items()):
 base=Chem.AddHs(Chem.MolFromSmiles(smiles));next_id=max(a.GetAtomMapNum() for a in base.GetAtoms())+1
 for atom in base.GetAtoms():
  if not atom.GetAtomMapNum():atom.SetAtomMapNum(next_id);next_id+=1
 C1,C2=idx(base,1),idx(base,2)
 A=idx(base,3) if key not in ['ethane','propane'] else min(a.GetIdx() for a in base.GetAtomWithIdx(C1).GetNeighbors() if a.GetSymbol()=='H')
 B=min(a.GetIdx() for a in base.GetAtomWithIdx(C2).GetNeighbors() if a.GetSymbol()=='H') if key=='ethane' else idx(base,3 if key=='propane' else 4)
 ohH=next((a.GetIdx() for a in base.GetAtoms() if a.GetSymbol()=='H' and a.GetNeighbors()[0].GetSymbol()=='O'),None)
 # Rear component found by removing the central bond, not a hard-coded atom list.
 rear=set();stack=[C2]
 while stack:
  i=stack.pop()
  if i in rear:continue
  rear.add(i);stack.extend(a.GetIdx() for a in base.GetAtomWithIdx(i).GetNeighbors() if not (i==C2 and a.GetIdx()==C1))
 rotamers={}
 for rotkey,chi in ([('minus60',-60),('plus60',60),('anti',180)] if ohH is not None else [('default',None)]):
  best=None;converged=0
  for trial in range(5):
   m=Chem.Mol(base);p=AllChem.ETKDGv3();p.randomSeed=42000+ci*100+trial
   assert AllChem.EmbedMolecule(m,p)==0
   if AllChem.MMFFOptimizeMolecule(m,mmffVariant='MMFF94',maxIters=3000)!=0:continue
   conf=m.GetConformer();rdMolTransforms.SetDihedralDeg(conf,A,C1,C2,B,180)
   if chi is not None:rdMolTransforms.SetDihedralDeg(conf,ohH,B,C2,C1,chi)
   props=AllChem.MMFFGetMoleculeProperties(m,mmffVariant='MMFF94');ff=AllChem.MMFFGetMoleculeForceField(m,props,nonBondedThresh=100,ignoreInterfragInteractions=False)
   ff.MMFFAddTorsionConstraint(A,C1,C2,B,False,180,180,100)
   if chi is not None:ff.MMFFAddTorsionConstraint(ohH,B,C2,C1,False,chi,chi,100)
   ff.Initialize();status=ff.Minimize(maxIts=5000,energyTol=1e-10,forceTol=1e-6)
   if status!=0:continue
   converged+=1
   # Remove finite constraint deviations, then evaluate an unconstrained force field.
   rdMolTransforms.SetDihedralDeg(conf,A,C1,C2,B,180)
   if chi is not None:rdMolTransforms.SetDihedralDeg(conf,ohH,B,C2,C1,chi)
   energy=AllChem.MMFFGetMoleculeForceField(m,props,nonBondedThresh=100,ignoreInterfragInteractions=False).CalcEnergy()
   if best is None or energy<best[0]:best=(energy,Chem.Mol(m))
  if best is None:raise RuntimeError('No converged constrained reference for '+key+rotkey)
  m=best[1];conf=m.GetConformer();p1=np.array(conf.GetAtomPosition(C1));p2=np.array(conf.GetAtomPosition(C2));mid=(p1+p2)/2;ez=(p2-p1)/np.linalg.norm(p2-p1);pa=np.array(conf.GetAtomPosition(A))-p1;ey=pa-ez*np.dot(pa,ez);ey/=np.linalg.norm(ey);ex=np.cross(ey,ez);basis=np.array([ex,ey,ez])
  xyz=[basis@(np.array(conf.GetAtomPosition(i))-mid) for i in range(m.GetNumAtoms())]
  for i,p in enumerate(xyz):conf.SetAtomPosition(i,tuple(float(x) for x in p))
  ref=np.array(xyz);energy=[];mid_energy=[]
  # Use the same rigid-rotor coordinates as the browser; all remaining internal coordinates stay fixed.
  for deg in [i/2 for i in range(721)]:
   rdMolTransforms.SetDihedralDeg(conf,A,C1,C2,B,deg)
   actual=rdMolTransforms.GetDihedralDeg(conf,A,C1,C2,B)
   assert abs(angle_diff(actual,deg))<1e-6
   e=AllChem.MMFFGetMoleculeForceField(m,AllChem.MMFFGetMoleculeProperties(m,mmffVariant='MMFF94'),nonBondedThresh=100,ignoreInterfragInteractions=False).CalcEnergy()*4.184
   (energy if deg.is_integer() else mid_energy).append(e)
  # Determine the rotation sign from a direct Cartesian +1degree probe in the exported basis.
  probe=Chem.Mol(m);pc=probe.GetConformer();phi=math.pi/180;c,s=math.cos(phi),math.sin(phi)
  for i,p in enumerate(ref):pc.SetAtomPosition(i,(float(c*p[0]-s*p[1]),float(s*p[0]+c*p[1]),float(p[2])) if i in rear else tuple(float(x) for x in p))
  rotation_sign=1 if angle_diff(rdMolTransforms.GetDihedralDeg(pc,A,C1,C2,B),180)>0 else -1
  max_error=max(abs(mid_energy[i]-(energy[i]+energy[i+1])/2) for i in range(360))
  relaxed_m=Chem.Mol(m);rc=relaxed_m.GetConformer();relaxed_energies=[];relaxed_positions=[];maximum_constraint_error=0
  for deg in range(360):
   rdMolTransforms.SetDihedralDeg(rc,A,C1,C2,B,deg)
   if chi is not None:rdMolTransforms.SetDihedralDeg(rc,ohH,B,C2,C1,chi)
   props=AllChem.MMFFGetMoleculeProperties(relaxed_m,mmffVariant='MMFF94');ff=AllChem.MMFFGetMoleculeForceField(relaxed_m,props,nonBondedThresh=100,ignoreInterfragInteractions=False)
   ff.MMFFAddTorsionConstraint(A,C1,C2,B,False,deg,deg,100)
   if chi is not None:ff.MMFFAddTorsionConstraint(ohH,B,C2,C1,False,chi,chi,100)
   ff.Initialize();status=ff.Minimize(maxIts=4000,energyTol=1e-10,forceTol=1e-5)
   if status!=0:raise RuntimeError('Relaxed scan failed '+key+rotkey+str(deg))
   maximum_constraint_error=max(maximum_constraint_error,abs(angle_diff(rdMolTransforms.GetDihedralDeg(rc,A,C1,C2,B),deg)))
   rdMolTransforms.SetDihedralDeg(rc,A,C1,C2,B,deg)
   if chi is not None:rdMolTransforms.SetDihedralDeg(rc,ohH,B,C2,C1,chi)
   e=AllChem.MMFFGetMoleculeForceField(relaxed_m,props,nonBondedThresh=100,ignoreInterfragInteractions=False).CalcEnergy()*4.184
   # Remove translation/overall rotation introduced by minimization; preserve all intrinsic geometry.
   p1=np.array(rc.GetAtomPosition(C1));p2=np.array(rc.GetAtomPosition(C2));mid=(p1+p2)/2;ez=(p2-p1)/np.linalg.norm(p2-p1);pa=np.array(rc.GetAtomPosition(A))-p1;ey=pa-ez*np.dot(pa,ez);ey/=np.linalg.norm(ey);basis=np.array([np.cross(ey,ez),ey,ez])
   coordinates=[basis@(np.array(rc.GetAtomPosition(i))-mid) for i in range(relaxed_m.GetNumAtoms())]
   for i,p in enumerate(coordinates):rc.SetAtomPosition(i,tuple(float(x) for x in p))
   relaxed_energies.append(e);relaxed_positions.append([[round(float(x),8) for x in p] for p in coordinates])
  relaxed_energies.append(relaxed_energies[0]);relaxed_positions.append(relaxed_positions[0])
  rotamers[rotkey]={'chi':chi,'positions':[[round(float(x),10) for x in p] for p in ref],'energiesKJ':energy,'referenceKJ':best[0]*4.184,'rotationSign':rotation_sign,'halfGridDiscrepancyKJ':max_error,'convergedStarts':converged,'attemptedStarts':5,'relaxedEnergiesKJ':relaxed_energies,'relaxedPositions':relaxed_positions,'maxConstraintDeviationDeg':maximum_constraint_error}
  print(key,rotkey,'rigid barrier',round(max(energy)-min(energy),4),'relaxed barrier',round(max(relaxed_energies)-min(relaxed_energies),4),'half-grid discrepancy',round(max_error,6),flush=True)
 atoms=[{'id':a.GetAtomMapNum(),'element':a.GetSymbol(),'charge':a.GetFormalCharge()} for a in base.GetAtoms()]
 bonds=[{'a':b.GetBeginAtomIdx(),'b':b.GetEndAtomIdx(),'order':1} for b in base.GetBonds()]
 min_all=min(min(r['energiesKJ']) for r in rotamers.values());min_relaxed=min(min(r['relaxedEnergiesKJ']) for r in rotamers.values())
 data[key]={'label':label,'smiles':Chem.MolToSmiles(base),'formula':rdMolDescriptors.CalcMolFormula(base),'atoms':atoms,'bonds':bonds,'axis':[C1,C2],'torsion':[A,C1,C2,B],'ohHydrogen':ohH,'rear':sorted(rear),'frontBranches':[a.GetIdx() for a in base.GetAtomWithIdx(C1).GetNeighbors() if a.GetIdx()!=C2],'rearBranches':[a.GetIdx() for a in base.GetAtomWithIdx(C2).GetNeighbors() if a.GetIdx()!=C1],'globalGridMinimumKJ':min_all,'globalRelaxedMinimumKJ':min_relaxed,'rotamers':rotamers}
Path('src/data/conformationalScans.json').write_text(json.dumps({'provenance':{'rdkit':rdBase.rdkitVersion,'forceField':'MMFF94','energyUnit':'kJ mol-1 (RDKit kcal mol-1 times4.184)','method':'Five fixed-seed ETKDG starts; converged torsion-constrained reference at180degrees (and fixed HOCC for chloroethanol). Rigid scan rotates the rear fragment without relaxation. Relaxed scan uses warm-started constrained local minimization at every integer degree; closure at360 copies0. Neither is a global conformer search, MD trajectory or experimental solution free energy. Fractional angles use linear energy interpolation and a small rigid rotation of the nearest relaxed geometry. Rigid half-grid discrepancy is an observed interpolation diagnostic,not a rigorous error bound.'},'molecules':data},separators=(',',':')))
