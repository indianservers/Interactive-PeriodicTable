"""Reproduce study presets from archived primary tables and explicit factual transcriptions.

No simulated measurements, imputation or digitized curves are generated.
"""
import json, re, hashlib, importlib.util
from pathlib import Path
from bs4 import BeautifulSoup

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / 'src/modules/pharma-lab/data'
ARCHIVE = BASE / 'scripts/fixtures/pharma-published-sources'
spec = importlib.util.spec_from_file_location('extractor', BASE/'scripts/extract-pharma-published-data.py')
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)

def read(path): return json.loads(path.read_text(encoding='utf8'))
def point(x, cell, label=None):
    numbers = re.findall(r'-?\d+(?:\.\d+)?', str(cell))
    return dict(x=float(x), y=float(numbers[0]), reported=str(cell), sd=float(numbers[1]) if '±' in str(cell) else None, label=label or str(x))

def extract():
    old=read(DATA/'remainingPublishedExperiments.json'); result={}
    def add(lab,name,model,x,y,points,protocol,sources,limitations,excluded=None):
        result.setdefault(lab,[]).append(dict(id=f'{lab}-{len(result.get(lab,[]))+1}',name=name,model=model,xLabel=x,yLabel=y,observations=points,protocol=protocol,sources=sources,limitations=limitations,excluded=excluded or [], independentValidation=False,retrievedOn='2026-10-17',transcriptionMethod='Reported table values; no imputation or curve digitization. Source archive hashes are supplied where available.'))
    def source(lab):
        d=old[lab]
        return [{k:d[k] for k in ['title','sourceUrl','doi','license','licenseUrl','sourceSha256'] if k in d}]
    for i,family in enumerate(['AET','PVP','ABP']):
        rows=old['preformulation']['groups'][0]['rows'][i*4:i*4+4]
        add('preformulation',family+' granule flow','linear','Binder (% w/w)','Flow rate (g/s)',[point(2*(j+1),r[1],r[0]) for j,r in enumerate(rows)],old['preformulation']['conditions']+' Binder levels 2, 4, 6, 8% (Table 1: 8, 16, 24, 32 mg per 400 mg tablet).',source('preformulation'),'Four formulation means per binder; empirical interpolation only, not a general powder-flow law.')
    for starch in ['PGTBIS','Starch 1500®']:
        rows=[r for r in old['tablet-formulation']['groups'][0]['rows'] if r[1]==starch]
        add('tablet-formulation',starch+' breaking force','linear','Drug loading (%)','Breaking force (N)',[point(r[0],r[3],r[0]+'% '+starch) for r in rows],old['tablet-formulation']['conditions']+' Compression force fixed at 17 kN.',source('tablet-formulation'),'Four published formulation means; linear empirical fit may poorly describe loss of compactibility. No force or excipient substitution is supported.')
    rows=old['toxicology']['groups'][0]['rows']
    add('toxicology','Repeated-dose rat ALT','linear','Exposure duration (weeks)','ALT (U/L)',[point(w,r[1],r[0]) for w,r in zip([4,6,8,10,12],rows[1:])],old['toxicology']['conditions'],source('toxicology'),'Animal group means, not longitudinal individual trajectories or human risk predictions. Significance letters remain in reported cells; they are not model uncertainty.',[{'label':rows[0][0],'reported':rows[0][1],'reason':'Control is not a treated week-zero observation.'}])
    refs=read(DATA/'verifiedReferences.json')['statins']
    acid=read(ARCHIVE/'simvastatin-acid-pubchem.json')['PropertyTable']['Properties'][0]
    descriptors={r['name'].lower():r for r in refs}; descriptors['simvastatin acid']=acid
    ps=[]; sources=source('medicinal-chemistry')
    for r in old['medicinal-chemistry']['groups'][0]['rows']:
        d=descriptors[r[0].lower()]; p=point(d['TPSA'],r[1],r[0]); p['CID']=d['CID']; ps.append(p)
        sources.append(dict(title=r[0]+' acid-form descriptor · PubChem CID '+str(d['CID']),sourceUrl=f"https://pubchem.ncbi.nlm.nih.gov/compound/{d['CID']}"))
    add('medicinal-chemistry','Four statin acids · exploratory descriptor association','log-linear','TPSA (Å²)','HMG-CoA reductase IC50 (nM)',ps,old['medicinal-chemistry']['conditions'],sources,'Only four chemically different statin acids. Exploratory log(IC50)-TPSA association, not a validated QSAR, docking score or dose-response curve. Simvastatin acid CID 64718 is used, not lactone CID 54454.')
    meta,table=helper.source('PMC8076289','Tab3')
    tables=table.findall('.//table')
    protocol='Paracetamol / Eudragit E100 study; 500 mg paracetamol equivalent; 500 mL 0.1 N HCl; paddle 50 rpm; 37 °C; 2, 5, 10, 20, 30 min; triplicate mean ± SD. Table 1 fixes each trial composition; Table 3 contains release measurements.'
    for block,labels in zip(tables,[['PCT','T1','TS1','TS2','TS3','TS4'],['PCT','T1','TP1','TP2','TP3','TP4']]):
        rows=[[helper.text(c) for c in tr] for tr in block.findall('.//tbody/tr')]
        rows=[r for r in rows if r and re.fullmatch(r'\d+',r[0])]
        for j,label in enumerate(labels):
            if block is tables[1] and j<2: continue
            lab='dissolution' if label=='PCT' else 'dosage'
            composition='Pure paracetamol (no polymer).' if label=='PCT' else ('T1: paracetamol 1.25 g, EuE 1.2 g, no SLS or PEG.' if label=='T1' else f"Preparation trial: paracetamol {[1.25,2.50,3.00,4.00][int(label[-1])-1]} g, EuE 1.2 g, "+('SLS 2.5 g, no PEG.' if label.startswith('TS') else 'PEG 400 4.0 g, no SLS.'))
            add(lab,'PMC8076289 · '+label,'release','Time (min)','Paracetamol released (%)',[point(r[0],r[j+1],label+' · '+r[0]+' min') for r in rows],protocol+' '+composition,[meta],'Bounded first-order fit Q=100(1−exp(−kt)), no burst term. Observations above 100% remain unchanged. Poor fit is retained; SD describes the triplicate experiment, not prediction uncertainty.')
    manual=read(ARCHIVE/'study-preset-transcriptions.json')
    for lab in ['hplc','qc','adme']:
        m=manual[lab]
        add(lab,m['name'],m['model'],m['xLabel'],m['yLabel'],[point(r[0],r[1],r[2] if len(r)>2 else None) for r in m['rows']],m['protocol'],m['sources'],m['limitations'],m.get('excluded'))
        result[lab][-1]['transcriptionMethod']=manual['transcriptionMethod']
        result[lab][-1]['transcriptionSha256']=hashlib.sha256((ARCHIVE/'study-preset-transcriptions.json').read_bytes()).hexdigest()
    html=(ARCHIVE/'citrate-cerda.html').read_bytes(); soup=BeautifulSoup(html,'html.parser')
    candidates=[]
    for table in soup.find_all('table'):
        rows=[[c.get_text(' ',strip=True) for c in tr.find_all(['td','th'])] for tr in table.find_all('tr')]
        if any('3.020' in c for r in rows for c in r): candidates=rows
    ps=[]
    for r in candidates:
        nums=[float(c) for c in r] if len(r)==8 and all(re.fullmatch(r'-?\d+\.\d+',c) for c in r) else []
        if len(nums)==8:
            # Table 2: target, measured, difference, HCl, citrate, sum, water, beta.
            if nums[0] in [3,3.8,4.2,4.6,5,5.4,6,6.8]:
                p=point(nums[0],r[1]); p['mixtureVolumesMl']={'hcl':nums[3],'citrate':nums[4],'water':nums[6]}; ps.append(p)
    assert len(ps)==8, candidates
    add('buffers','Citrate / HCl · experimental pH calibration','linear','Published theoretical target pH','Measured pH',ps,'Cerdà & Phansi (2023), Table 2; 100 mL citrate/HCl mixtures; ionic strength 0.1 M; 0.2 M HCl and 0.07 M trisodium citrate stocks. Input is the published theoretical target pH, not a newly computed speciation result.',[dict(title='Buffer Solutions of known Ionic Strength · Table 2',sourceUrl='https://www.advancechemjournal.com/journals/aac/aac-aid1043.php',doi='10.29328/journal.aac.1001043',license='CC BY',sourceSha256=hashlib.sha256(html).hexdigest())],'Empirical target-to-measured pH calibration only. No SD is reported; none is generated. Not a validation of the acetate-buffer teaching calculator. Published mixture volumes are retained in JSON.')
    assert len(result)==10
    return result

if __name__=='__main__':
    (DATA/'studyModelPresets.json').write_text(json.dumps(extract(),ensure_ascii=False,indent=2)+'\n',encoding='utf8')
