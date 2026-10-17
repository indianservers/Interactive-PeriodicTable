from pathlib import Path
from PIL import Image
import numpy as np,json,re
root=Path(r'C:\Indian Servers\temp\Chemistry web\TargetUI');out=Path('docs/studio-routing-qa')
familyPaths={'carbohydrate':'Carbohydrate Structure Studio','nucleic':'Neucliec Acid','drug':'Drug Discovery','physical':'Physical Chemistry','pharma':'PharmaChemistry'}
orders={
'carbohydrate':{'Reactions':1,'Structure':2,'Biology':3,'Quizzes':4,'Properties':5},
'nucleic':{'Home':1,'Molecules':2,'Sequences':3,'Nucleotide Builder':4,'Replication':5,'Transcription':6,'Comparative View':7,'Learn':8,'3D Gallery':9,'Quizzes':10},
'drug':{'Home':1,'Drug Discovery':2,'Targets':3,'Screening':4,'Molecular Design':5,'ADME & PK':6,'Team':7,'Safety & Toxicity':8,'Notebooks':9,'Data & Analytics':10},
'physical':dict(zip(['Molecular Dynamics','Real Gas Laws','Thermodynamics','Statistical Thermodynamics','Chemical Kinetics','Chemical Equilibrium','Phase Equilibrium','Solutions & Colligative','Electrochemistry','Quantum Chemistry','Molecular Spectroscopy','Surface Chemistry','Photochemistry','Transport Phenomena'],range(1,15))),
'pharma':dict(zip(['Lab Home','Medicinal Chemistry','API Synthesis','Preformulation','Tablet Formulation','Dissolution','HPLC','Stability','ADME','Toxicology'],range(1,11)))}
def mean(a,w=11):
 s=np.pad(a,((1,0),(1,0))).cumsum(0).cumsum(1)
 return (s[w:,w:]-s[:-w,w:]-s[w:,:-w]+s[:-w,:-w])/(w*w)
def ssim(a,b):
 a=np.asarray(Image.open(a).convert('L').resize((836,470),Image.Resampling.LANCZOS),dtype=float);b=np.asarray(Image.open(b).convert('L').resize((836,470),Image.Resampling.LANCZOS),dtype=float)
 ua,ub=mean(a),mean(b);va=np.maximum(0,mean(a*a)-ua*ua);vb=np.maximum(0,mean(b*b)-ub*ub);cov=mean(a*b)-ua*ub
 return round(float(np.mean(((2*ua*ub+2.55**2)*(2*cov+7.65**2))/((ua*ua+ub*ub+2.55**2)*(va+vb+7.65**2))))*100,1)
assert ssim(out/'current/physical-quantum-chemistry.jpg',out/'current/physical-quantum-chemistry.jpg')==100
rows=json.loads((out/'visual-captures.json').read_text(encoding='utf-8'));latest={'Dissolution':'dissolution-after.jpg','Tablet Formulation':'tablet-after.jpg','Stability':'stability-after.jpg','Lab Home':'pharma-lab-home-after.jpg'}
for row in rows:
 family=row['family'];number=orders[family][row['tab']];files=list((root/familyPaths[family]).glob('*.png'));ref=next(p for p in files if (int(re.search(r'\((\d+)\)',p.stem).group(1)) if '(' in p.stem else int(p.stem.split('_')[0]))==number)
 row['target']=str(ref);row['initialCaptureSSIMPercent']=ssim(ref,out/'current'/row['screenshot']);row['latestCaptureSSIMPercent']=None
 after=out/latest.get(row['tab'],'missing') if family=='pharma' else out/('after-'+row['screenshot'])
 if after.exists() and after.stat().st_size>1000:row['latestCaptureSSIMPercent']=ssim(ref,after);row['latestScreenshot']=after.name
rows.sort(key=lambda r:(list(familyPaths).index(r['family']),orders[r['family']][r['tab']]))
(out/'visual-scores.json').write_text(json.dumps(rows,indent=2)+'\n')
text=['# Studio and lab visual audit — 17 October 2026','', '49 studio target references were mapped to their actual workspace routes. Screenshots are in `current/`. No target image was used as a runtime asset.','', 'The percentages below are reproducible grayscale SSIM screenshot similarity, not completion percentages or a certification of perceptual fidelity. Images are normalized to 836 × 470 for comparison (references are 1672 × 941; browser captures were 1672 × 940 or 1667 × 937). SSIM rewards matching dark backgrounds and can overrate sparse screens, so inspect the paired images as well. An audit-capture score is not an original pre-session baseline. A dash means no newer verified capture. Captures with loading viewers are provisional.','', '| Studio | Workspace | Audit capture similarity | Updated similarity | Capture status |','|---|---|---:|---:|---|']
for r in rows:text.append(f"| {familyPaths[r['family']]} | {r['tab']} | {r['initialCaptureSSIMPercent']}% | {str(r['latestCaptureSSIMPercent'])+'%' if r['latestCaptureSSIMPercent'] is not None else '—'} | {'Updated capture saved' if r['latestCaptureSSIMPercent'] is not None else 'Viewer loading in audit capture; retake required' if r['loadingViewers'] else 'Captured'} |")
text+=['','## Functional verification','', '178 route assertions passed; 49 workspace navigation smoke checks were recorded before the separate pharmaceutical home-page rewrite; 50 physical analysis tab selections were checked. This does not establish that every control on every page is correct. Legacy studio exit and Back were verified in the browser. All eight titration workflow subtabs were checked. Titration numerical tests cover 4001 volume states and a descending acid-into-base curve. Dissolution Start, tablet loading and single-step were verified: a step advanced elapsed time from 0 to 5 minutes.','', '## Current implementation','', 'Shared studio routing handles canonical hashes, legacy pathname deep links and exits. Physical model workspaces use real orbitable Three.js scenes; the pressure and speed controls now reach the MD worker. Dissolution, tablet formulation and stability use procedural Three.js apparatus. Hydrogenic radial/angle plots and CO2 selection rules were corrected. Carbohydrate ring numbering and glycoside constituents were corrected; the water SDF format was fixed.','', '## Outstanding','', 'The full target match remains unfinished. The pharmaceutical overview (#visuals/pharma) and detailed studio home (#visuals/pharma/lab) are now separate routes because they have different target references. The existing overview was preserved; the dedicated lab home uses the shared laboratory shell. Major gaps include detailed replication-fork geometry, biological and anatomical models, target-specific apparatus detail, inspector density, molecular framing and several loading-state retakes. The 69 top-level routes have also been captured and compared in PRIMARY_VISUAL_STATUS.md. Their full control-by-control verification remains outstanding.','', 'Scientific references: [NIST hydrogen atom wavefunctions](https://dlmf.nist.gov/18.39), [OpenStax disaccharides](https://openstax.org/books/organic-chemistry/pages/25-8-disaccharides), [OpenStax cyclic monosaccharides](https://openstax.org/books/organic-chemistry/pages/25-5-cyclic-structures-of-monosaccharides-anomers), [Purdue CO2 vibrations](https://www.chem.purdue.edu/gchelp/vibs/co2.html).']
(out/'VISUAL_STATUS.md').write_text('\n'.join(text)+'\n',encoding='utf-8')
for f in familyPaths:
 r=[x for x in rows if x['family']==f];print(f, 'mean',round(sum(x['initialCaptureSSIMPercent'] for x in r)/len(r),1),'range',min(x['initialCaptureSSIMPercent'] for x in r),max(x['initialCaptureSSIMPercent'] for x in r))

primary_file=out/'primary-captures.json'
if primary_file.exists():
 primary=sorted({r['index']:r for r in json.loads(primary_file.read_text(encoding='utf-8'))}.values(),key=lambda r:r['index'])
 primary_file.write_text(json.dumps(primary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 lines=['# Top-level target audit — 17 October 2026','','69 target experiences were opened and screenshots saved. Reference 007 is compared against #lab/titration, the dedicated bench; #lab now owns the laboratory catalogue. These are route/render smoke checks, not a claim that all their controls work. Percentages are grayscale SSIM screenshot similarity at 836 × 470, as described in VISUAL_STATUS.md. Molecular loading states are flagged; their visual scores are provisional.','','| # | Route | Audit similarity | Updated similarity | Route rendering | Molecular viewers loading |','|---:|---|---:|---:|---|---:|']
 for r in primary:
  r['screenshotSimilarityPercent']=ssim(root/r['target'],out/'primary'/r['screenshot'])
  updated=ssim(root/r['target'],out/'titration-after.jpg') if r['index']==7 and (out/'titration-after.jpg').exists() else None
  r['updatedScreenshotSimilarityPercent']=updated
  updated_text=f'{updated}%' if updated is not None else '—'
  lines.append(f"| {r['index']} | `{r['route']}` | {r['screenshotSimilarityPercent']}% | {updated_text} | {'Error' if r['failed'] else 'Pending' if r['pending'] else 'Opened'} | {r['loadingViewers']} |")
 (out/'primary-scores.json').write_text(json.dumps(primary,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
 (out/'PRIMARY_VISUAL_STATUS.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print('Primary target captures:',len(primary),'route errors:',sum(r['failed'] for r in primary))
