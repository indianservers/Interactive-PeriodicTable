"""Refresh the public PubChem reference catalogue, politely throttled and resumable.
Fetched fields: common synonyms, IUPAC name, isomeric SMILES, formula and mass.
RDKit validation and editor round-trip checks are performed by build-draw-library.mjs.
"""
import argparse,json,time,threading,urllib.request,urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
parser=argparse.ArgumentParser();parser.add_argument('--max-cid',type=int,default=12500);parser.add_argument('--batch-size',type=int,default=250);args=parser.parse_args()
cache=Path('docs/draw-library-qa/pubchem-cache');cache.mkdir(parents=True,exist_ok=True)
lock=threading.Lock();last=[0.0]
def retrieve(url):
 for attempt in range(4):
  with lock:
   pause=.35-(time.monotonic()-last[0])
   if pause>0:time.sleep(pause)
   last[0]=time.monotonic()
  try:
   req=urllib.request.Request(url,headers={'User-Agent':'ChemistryUniverse-library/1.0 (public chemical reference download)'})
   with urllib.request.urlopen(req,timeout=45) as response:return json.load(response)
  except urllib.error.HTTPError as e:
   if e.code not in (429,500,502,503,504):raise
   time.sleep(2**attempt)
  except (TimeoutError,urllib.error.URLError):
   if attempt==3:raise
   time.sleep(2**attempt)
 raise RuntimeError('PubChem request failed after retries')
def batch(start):
 path=cache/f'{start:05d}.json'
 if path.exists():return start,len(json.loads(path.read_text(encoding='utf-8'))),True
 ids=','.join(map(str,range(start,min(start+args.batch_size,args.max_cid+1))))
 base=f'https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{ids}'
 properties=retrieve(base+'/property/IUPACName,MolecularFormula,MolecularWeight,IsomericSMILES/JSON')['PropertyTable']['Properties']
 aliases={}
 try:
  for record in retrieve(base+'/synonyms/JSON').get('InformationList',{}).get('Information',[]):
   names=record.get('Synonym',[]);aliases[record['CID']]=[n for n in names if len(n)<=160][:12]
 except Exception as e:print(f'Name lookup unavailable for batch {start}: {e}',flush=True)
 for record in properties:record['names']=aliases.get(record['CID'],[])
 path.write_text(json.dumps(properties,ensure_ascii=False),encoding='utf-8')
 return start,len(properties),False
failed=[]
with ThreadPoolExecutor(max_workers=2) as pool:
 futures={pool.submit(batch,start):start for start in range(1,args.max_cid+1,args.batch_size)}
 for future in as_completed(futures):
  try:
   start,count,cached=future.result();print(f'{start:05d}: {count} records'+(' (cached)' if cached else ''),flush=True)
  except Exception as e:failed.append({'start':futures[future],'error':str(e)});print(f'FAILED {futures[future]}: {e}',flush=True)
records=[]
for start in range(1,args.max_cid+1,args.batch_size):
 path=cache/f'{start:05d}.json'
 if path.exists():records.extend(json.loads(path.read_text(encoding='utf-8')))
Path('docs/draw-library-qa/pubchem-raw.json').write_text(json.dumps({'records':records,'failed':failed,'requestedMaxCID':args.max_cid},ensure_ascii=False),encoding='utf-8')
print(f'Completed: {len(records)} source records, {len(failed)} failed batches.',flush=True)
