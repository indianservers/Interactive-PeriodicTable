from pathlib import Path
import json,numpy as np
from PIL import Image,ImageDraw
root=Path('docs/studio-lab-audit-current')
def avg(a,w=11):
 s=np.pad(a,((1,0),(1,0))).cumsum(0).cumsum(1)
 return (s[w:,w:]-s[:-w,w:]-s[w:,:-w]+s[:-w,:-w])/(w*w)
def similarity(a,b):
 a=np.asarray(Image.open(a).convert('L').resize((836,470)),dtype=float);b=np.asarray(Image.open(b).convert('L').resize((836,470)),dtype=float)
 x,y=avg(a),avg(b);v=np.maximum(0,avg(a*a)-x*x);w=np.maximum(0,avg(b*b)-y*y);c=avg(a*b)-x*y
 return round(float(np.mean(((2*x*y+2.55**2)*(2*c+7.65**2))/((x*x+y*y+2.55**2)*(v+w+7.65**2))))*100,1)
phase=__import__('sys').argv[1] if len(__import__('sys').argv)>1 else 'before'
rows=list({r['key']:r for r in json.loads((root/(phase+'-captures.json')).read_text(encoding='utf-8'))}.values())
cache_path=root/(phase+'-scores.json')
cache={r['key']:r for r in json.loads(cache_path.read_text(encoding='utf-8'))} if cache_path.exists() else {}
for r in rows:
 if Path(r.get('capture','')).is_file():
  stamp=Path(r['capture']).stat().st_mtime_ns;prior=cache.get(r['key'],{})
  r['ssimPercent']=prior['ssimPercent'] if prior.get('captureMtimeNs')==stamp else similarity(r['reference'],r['capture'])
  r['captureMtimeNs']=stamp
(root/(phase+'-scores.json')).write_text(json.dumps(rows,indent=2),encoding='utf-8')
groups={}
for r in rows:
 group=r['family'] if r['family']!='virtual-labs' else __import__('urllib.parse',fromlist=['urlsplit']).urlsplit(r['route']).fragment.split('?')[0].strip('/')
 groups.setdefault(group,[]).append(r)
summary=[]
for family,items in groups.items():
 scores=[r['ssimPercent'] for r in items if 'ssimPercent' in r];summary.append({'group':family,'screens':len(scores),'meanSSIMPercent':round(sum(scores)/len(scores),1) if scores else None});print(family,len(scores),round(sum(scores)/len(scores),1) if scores else 'ERROR')
for family in ['carbohydrate','nucleic','drug','physical','pharma']:
 items=[r for r in rows if r['family']==family]
 if not items:continue
 sheet=Image.new('RGB',(1672,len(items)*250),'#eef2f7');d=ImageDraw.Draw(sheet)
 for i,r in enumerate(items):
  d.text((10,i*250+5),r['title']+'  target / current  '+str(r.get('ssimPercent'))+'%',fill='black')
  for x,file in [(0,r['reference']),(836,r['capture'])]:
   im=Image.open(file).convert('RGB');im.thumbnail((836,220));sheet.paste(im,(x,i*250+25))
 sheet.save(root/(phase+'-'+family+'.jpg'),quality=90)

(root/(phase+'-summary.json')).write_text(json.dumps(summary,indent=2),encoding='utf-8')
