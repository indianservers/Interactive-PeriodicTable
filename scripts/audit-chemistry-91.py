"""Build the explicit 91-route evidence register. Screenshots are captured via CUA."""
from pathlib import Path
import json, sys
import numpy as np
from PIL import Image, ImageDraw

ROOT = Path('docs/chemistry-91-audit')
TARGET = Path(r'C:\Indian Servers\temp\Chemistry web\TargetUI\Chemistry_Virtual_Labs_91_Target_Mockups\Chemistry_Virtual_Labs')
ROOT.mkdir(parents=True, exist_ok=True)

def ssim(a, b):
    def mean(x, w=11):
        s = np.pad(x, ((1, 0), (1, 0))).cumsum(0).cumsum(1)
        return (s[w:, w:] - s[:-w, w:] - s[w:, :-w] + s[:-w, :-w]) / w**2
    a = np.asarray(Image.open(a).convert('L').resize((836, 470)), dtype=float)
    b = np.asarray(Image.open(b).convert('L').resize((836, 470)), dtype=float)
    x, y = mean(a), mean(b)
    v, w = np.maximum(0, mean(a*a)-x*x), np.maximum(0, mean(b*b)-y*y)
    c = mean(a*b)-x*y
    return round(float(np.mean(((2*x*y+2.55**2)*(2*c+7.65**2))/((x*x+y*y+2.55**2)*(v+w+7.65**2))))*100, 1)

rows = json.loads((TARGET/'manifest.json').read_text(encoding='utf-8-sig'))
assert len(rows) == 91
assert len({r['route'] for r in rows}) == 91
pages = {'virtual-labs': 'VirtualLabsHomePage.jsx', 'lab': 'VirtualLabsHomePage.jsx', 'draw': 'StructureDrawPage.jsx', 'library': 'LibraryPage.jsx'}
register_path = Path('docs/chemistry-91-route-manifest.json')
prior = {r['route']: r for r in json.loads(register_path.read_text(encoding='utf-8'))} if register_path.exists() else {}
for i, r in enumerate(rows, 1):
    # Preserve reviewed implementation/science evidence when recapturing baseline scores.
    current_reference = dict(r)
    r.update(prior.get(r['route'], {}))
    r.update(current_reference)
    r['id'] = i
    r['targetImage'] = str((TARGET/r['image']).resolve())
    r['referenceViewport'] = dict(zip(('width', 'height'), Image.open(r['targetImage']).size))
    slug = r['route'].split('/')[-1]
    r.setdefault('source', ('src/pages/BiochemistryTargetPage.jsx' if i >= 67 else
                   'src/modules/core-simulations/OrganicAromaticPrepLab.jsx' if i >= 65 else
                   'src/modules/core-simulations/SyllabusInteractiveLab.jsx' if i <= 56 else
                   'src/pages/'+pages.get(slug, 'ChemistrySubjectHomePage.jsx')))
    r['status'] = 'In Progress'
    r.setdefault('scientificValidation', 'Pending individual reference and boundary tests')
    r.setdefault('interactionValidation', 'Pending individual browser tests')

Path('docs/chemistry-91-route-manifest.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding='utf-8')

if '--sheets' in sys.argv:
    for start in range(0, 91, 12):
        subset = rows[start:start+12]
        sheet = Image.new('RGB', (1600, ((len(subset)+2)//3)*340), '#e8edf3')
        d = ImageDraw.Draw(sheet)
        for n, r in enumerate(subset):
            x, y = (n%3)*533, (n//3)*340
            im = Image.open(r['targetImage']).convert('RGB'); im.thumbnail((525, 296))
            sheet.paste(im, (x, y+36)); d.text((x+5,y+5), f"{r['id']:02} {r['slug']}", fill='black')
        sheet.save(ROOT/f'targets-{start+1:02}-{start+len(subset):02}.jpg', quality=92)

captures_path = ROOT/'baseline-captures.json'
captures = json.loads(captures_path.read_text(encoding='utf-8')) if captures_path.exists() else []
lookup = {(c['id'], c['viewport']): c for c in captures}
table = ['| ID | Laboratory | Route | Desktop SSIM % | Responsive evidence | Status |', '|---|---|---|---:|---|---|']
for r in rows:
    c = lookup.get((r['id'], 'desktop'), {})
    score = ssim(r['targetImage'], c['capture']) if c.get('capture') and Path(c['capture']).is_file() else None
    r['baselineSSIMPercent'] = score
    responsive = ', '.join(v for v in ['mobile', 'tablet'] if (r['id'],v) in lookup) or 'Pending'
    table.append(f"| {r['id']} | {r['name']} | `{r['route']}` | {score if score is not None else 'Pending'} | {responsive} | In Progress |")
note = ('# Chemistry UI audit — 91 routes\n\nReference images are never shipped as UI assets. '
        'Scores are grayscale SSIM at 836 × 470 with an 11-pixel window, comparing full viewport screenshots. '
        'They measure image similarity, not chemistry accuracy or percentage of implemented features. '
        'Global navigation is included. No entry is complete until individual visual, scientific, interaction and responsive gates pass.\n\n')
Path('docs/chemistry-ui-audit.md').write_text(note+'\n'.join(table)+'\n', encoding='utf-8')
Path('docs/chemistry-visual-comparison.md').write_text(note+'\n'.join(table)+'\n\nAfter-update scores: pending individual implementations and recapture.\n', encoding='utf-8')
Path('docs/chemistry-91-route-manifest.json').write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps({'routes':len(rows),'captures':len(captures),'scored':sum(r['baselineSSIMPercent'] is not None for r in rows),'referenceSizes':list({tuple(r['referenceViewport'].values()) for r in rows})}))
