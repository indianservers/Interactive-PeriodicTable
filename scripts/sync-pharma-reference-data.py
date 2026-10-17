import json,urllib.request,math,pathlib,hashlib
base=pathlib.Path('src/modules/pharma-lab/data')
statins=[]
for name,cid in [('Atorvastatin',60823),('Rosuvastatin',446157),('Simvastatin',54454),('Pravastatin',54687)]:
 url=f'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/property/MolecularFormula,MolecularWeight,XLogP,TPSA,HBondDonorCount,HBondAcceptorCount,RotatableBondCount/JSON'
 with urllib.request.urlopen(url,timeout=40) as r:d=json.load(r)['PropertyTable']['Properties'][0]
 statins.append(dict(name=name,sourceUrl=f'https://pubchem.ncbi.nlm.nih.gov/compound/{cid}',apiUrl=url,**d))
pdb=pathlib.Path('public/assets/pharma/1HWK.pdb').read_bytes();atoms=[]
for line in pdb.decode().splitlines():
 if line.startswith(('ATOM  ','HETATM')) and line[16] in ' A':
  atoms.append(dict(record=line[:6].strip(),atom=line[12:16].strip(),residue=line[17:20].strip(),chain=line[21],number=int(line[22:26]),xyz=[float(line[30:38]),float(line[38:46]),float(line[46:54])],element=line[76:78].strip()))
ligands={}
for a in atoms:
 if a['residue']=='117':ligands.setdefault((a['chain'],a['number']),[]).append(a)
contacts=[]
for (chain,number),ligand in ligands.items():
 if chain!='A':continue
 seen={}
 for a in atoms:
  if a['record']!='ATOM' or a['element']=='H':continue
  for l in ligand:
   if l['element']=='H':continue
   distance=math.dist(a['xyz'],l['xyz'])
   key=(a['chain'],a['number'])
   if distance<=4.5 and (key not in seen or distance<seen[key]['distance']):seen[key]=dict(chain=a['chain'],number=a['number'],residue=a['residue'],proteinAtom=a['atom'],ligandAtom=l['atom'],distance=round(distance,3))
 contacts=sorted(seen.values(),key=lambda x:x['distance'])
 break
out=dict(verifiedOn='2026-10-17',statins=statins,pdb=dict(id='1HWK',source='https://www.rcsb.org/structure/1HWK',sha256=hashlib.sha256(pdb).hexdigest(),ligandChain='A',ligandId='117',cutoffAngstrom=4.5,contacts=contacts))
(base/'verifiedReferences.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
print(json.dumps(out)[:1200]);print('Contacts:',len(contacts))
