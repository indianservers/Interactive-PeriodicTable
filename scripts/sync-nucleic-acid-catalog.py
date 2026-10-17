import json, urllib.request, concurrent.futures, pathlib
root=pathlib.Path('.')
existing=['1BNA','4OCB','1ANA','2KOC','1EHZ','1KX5','2HNH','1LMB','6ALH','4OO8','2OEU','7K00']
groups={'DNA':['1ZNA','1D66','1DCW','1KF1','143D','1IHA','1F84','1GQU'], 'RNA':['1URN','1TRA','1F7U','1A9N','1GID','1Y26','1EYG','2GDI','3IRW','3IVK','4TNA','1S72'], 'Ribozyme':['1HR2','1M5K','2OWO','3BEP'], 'CRISPR':['4UN3','5F9R','5B2O','6O0X'], 'DNA-binding protein':['1AAY','1TUP','1HCR','3B39'], 'Polymerase':['1TAQ','1RTD','1T7P','4ESV']}
category={i:g for g,ids in groups.items() for i in ids}
category.update({'1IHA':'DNA–RNA hybrid','1F84':'RNA','1EYG':'DNA-binding protein','2OWO':'DNA repair','4ESV':'Helicase','3B39':'Polymerase','1D66':'DNA-binding protein','1S72':'Ribosome','3BEP':'DNA-binding protein','1GID':'Ribozyme','3IVK':'Ribozyme'})
category.update(dict(zip(existing,['DNA','DNA','DNA','RNA','RNA','Nucleosome','Polymerase','DNA-binding protein','Polymerase','CRISPR','Ribozyme','Ribosome'])))
def get(url):
 for attempt in range(3):
  try:
   with urllib.request.urlopen(url,timeout=20) as r:return r.read()
  except Exception:
   if attempt==2:raise
def load(id):
 d=json.loads(get('https://data.rcsb.org/rest/v1/core/entry/'+id)); info=d['rcsb_entry_info']; entities=[json.loads(get(f'https://data.rcsb.org/rest/v1/core/polymer_entity/{id}/{e}')) for e in d['rcsb_entry_container_identifiers']['polymer_entity_ids']]
 organisms=sorted({o.get('ncbi_scientific_name', 'Synthetic construct') for e in entities for o in e.get('rcsb_entity_source_organism',[])})
 types={e['entity_poly']['rcsb_entity_polymer_type'] for e in entities}; typ='DNA–RNA–protein' if {'DNA','RNA','Protein'}<=types else 'DNA–protein' if {'DNA','Protein'}<=types else 'RNA–protein' if {'RNA','Protein'}<=types else ' / '.join(sorted(types))
 assert types & {'DNA', 'RNA', 'NA-hybrid'} or id in {'2HNH', '1TAQ'}, f'{id}: no nucleic acid: {types}'
 if category[id]=='DNA' and 'Protein' in types: category[id]='DNA-binding protein'
 res=info.get('resolution_combined',[])
 row=dict(id=id,name=d['struct']['title'],type=typ,organism='; '.join(organisms) or 'Synthetic construct',method='; '.join(x['method'] for x in d['exptl']),resolution=f'{min(res):.2f} Å' if res else 'N/A',chains=sum(len(e['rcsb_polymer_entity_container_identifiers']['asym_ids']) for e in entities),count=f"{info['deposited_polymer_monomer_count']:,} polymer residues",category=category[id],sourceUrl=f'https://www.rcsb.org/structure/{id}',metadataUrl=f'https://data.rcsb.org/rest/v1/core/entry/{id}',verifiedOn='2026-10-17',experimentalTitle=d['struct']['title'])
 p=root/'public/assets/nucleic-acid/structures'/f'{id}.cif'
 if p.exists():row['cached']=True
 preview=root/'public/assets/nucleic-acid/previews'/f'{id}.jpeg'
 if not preview.exists() or preview.stat().st_size == 0:
  try:preview.write_bytes(get(f'https://cdn.rcsb.org/images/structures/{id[1:3].lower()}/{id.lower()}/{id.lower()}_assembly-1.jpeg'))
  except Exception: pass
 print(id,row['name'],flush=True)
 return row
with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool: rows=list(pool.map(load,existing+[i for ids in groups.values() for i in ids]))
(root/'src/modules/nucleic-acid-explorer/structureCatalog.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n',encoding='utf8')



