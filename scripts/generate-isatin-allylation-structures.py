import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('.cache/isatin-chemistry').resolve()))
from rdkit import Chem,rdBase
from rdkit.Chem import AllChem,rdMolDescriptors,Descriptors,rdMolTransforms
from rdkit.Chem.Draw import rdMolDraw2D
out={};folder=Path('public/assets/lab-structures');folder.mkdir(parents=True,exist_ok=True)
for key,smiles in [('isatin','O=C1Nc2ccccc2C1=O'),('anion','O=C1[N-]c2ccccc2C1=O'),('product','C=CCN1C(=O)C(=O)c2ccccc21'),('allyl','C=CCBr')]:
 mol=Chem.MolFromSmiles(smiles);assert mol is not None
 drawmol=Chem.Mol(mol)
 if key=='isatin':
  n=next(a.GetIdx() for a in mol.GetAtoms() if a.GetSymbol()=='N');drawmol=Chem.AddHs(drawmol,onlyOnAtoms=[n])
 AllChem.Compute2DCoords(drawmol)
 drawer=rdMolDraw2D.MolDraw2DSVG(480 if key!='allyl' else 260,280);drawer.drawOptions().clearBackground=False;drawer.drawOptions().padding=.10;drawer.DrawMolecule(drawmol);drawer.FinishDrawing();svg=drawer.GetDrawingText();svg=svg[svg.index('<svg'):];(folder/f'isatin-allylation-{key}.svg').write_text(svg,encoding='utf8')
 coords2=[{'element':a.GetSymbol(),'charge':a.GetFormalCharge(),'x':drawer.GetDrawCoords(a.GetIdx()).x,'y':drawer.GetDrawCoords(a.GetIdx()).y} for a in drawmol.GetAtoms()]
 item={'smiles':smiles,'formula':rdMolDescriptors.CalcMolFormula(mol),'MW':Descriptors.MolWt(mol),'coordinates2D':coords2,'bonds2D':[[b.GetBeginAtomIdx(),b.GetEndAtomIdx(),b.GetBondTypeAsDouble()]for b in drawmol.GetBonds()]}
 if key in ['isatin','product']:
  mh=Chem.AddHs(mol);p=AllChem.ETKDGv3();p.randomSeed=37;assert AllChem.EmbedMolecule(mh,p)==0;status=AllChem.MMFFOptimizeMolecule(mh,maxIters=2000);assert status==0
  rdMolTransforms.CanonicalizeConformer(mh.GetConformer());Chem.Kekulize(mh,clearAromaticFlags=True);conf=mh.GetConformer();item['atoms']=[{'element':a.GetSymbol(),'charge':a.GetFormalCharge(),'position':[round(x,7)for x in conf.GetAtomPosition(a.GetIdx())]} for a in mh.GetAtoms()];item['bonds']=[[b.GetBeginAtomIdx(),b.GetEndAtomIdx(),int(b.GetBondTypeAsDouble())]for b in mh.GetBonds()]
  assert sum(a.GetSymbol()=='O' for a in mh.GetAtoms())==2
 out[key]=item
out['provenance']={'generator':f'RDKit {rdBase.rdkitVersion}','conformer':'ETKDGv3 seed37, converged MMFF94; computed conformer, not deposited experimental coordinates','depiction':'RDKit original chemical-graph SVG; no mockup pixels'}
Path('src/data/isatinAllylationStructures.json').write_text(json.dumps(out,indent=2),encoding='utf8')
print({k:(v['formula'],v['MW']) for k,v in out.items()if k!='provenance'})
