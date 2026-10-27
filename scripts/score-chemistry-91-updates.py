"""Same grayscale SSIM sampling as the baseline; never a feature-completion score."""
from pathlib import Path
import json
import numpy as np
from PIL import Image

ROOT=Path('docs/chemistry-91-audit')
def mean(a,w=11):
    s=np.pad(a,((1,0),(1,0))).cumsum(0).cumsum(1)
    return (s[w:,w:]-s[:-w,w:]-s[w:,:-w]+s[:-w,:-w])/(w*w)
def similarity(a,b):
    a=np.asarray(Image.open(a).convert('L').resize((836,470)),dtype=float)
    b=np.asarray(Image.open(b).convert('L').resize((836,470)),dtype=float)
    x,y=mean(a),mean(b)
    v,w=np.maximum(0,mean(a*a)-x*x),np.maximum(0,mean(b*b)-y*y)
    c=mean(a*b)-x*y
    return round(float(np.mean(((2*x*y+2.55**2)*(2*c+7.65**2))/((x*x+y*y+2.55**2)*(v+w+7.65**2))))*100,1)

rows=json.loads(Path('docs/chemistry-91-route-manifest.json').read_text(encoding='utf8'))
captures=json.loads((ROOT/'after-captures.json').read_text(encoding='utf8'))
for c in captures:
    row=next(r for r in rows if r['id']==c['id'])
    if c['viewport']=='desktop':
        if (c['width'],c['height'])!=(1600,1000):raise ValueError('Desktop comparison requires the reference viewport')
        if Image.open(c['capture']).size!=(c['bitmapWidth'],c['bitmapHeight']):raise ValueError('Bitmap metadata mismatch')
        c['ssimPercent']=similarity(row['targetImage'],c['capture'])
        c['baselineSSIMPercent']=row['baselineSSIMPercent']
        row['afterSSIMPercent']=c['ssimPercent']
        row['afterCapture']=c['capture']
        print(f"Lab {row['id']}: {row['baselineSSIMPercent']}% -> {c['ssimPercent']}% SSIM")
(ROOT/'after-captures.json').write_text(json.dumps(captures,indent=2),encoding='utf8')
Path('docs/chemistry-91-route-manifest.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding='utf8')
report=['# Chemistry visual comparison','', 'SSIM uses the same full-viewport grayscale 836 × 470 resampling and 11-pixel window as baseline. Scores measure image similarity, not scientific or functional completion. All 91 entries remain In Progress. Latest captured scores are tied to the linked evidence; shared UI changes can make older captures stale. See chemistry-studio-lab-status.md for dates and recapture scope.','', '| ID | Laboratory | Baseline SSIM % | Latest captured SSIM % | Evidence |','|---|---|---:|---:|---|']
for r in rows:
    report.append(f"| {r['id']} | {r['name']} | {r['baselineSSIMPercent']} | {r.get('afterSSIMPercent','Pending')} | {r.get('afterCapture','Baseline screenshots only')} |")
Path('docs/chemistry-visual-comparison.md').write_text('\n'.join(report)+'\n',encoding='utf8')
