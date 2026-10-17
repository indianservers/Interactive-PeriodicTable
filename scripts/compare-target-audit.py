from pathlib import Path
from PIL import Image,ImageDraw
import json,numpy as np,sys
root=Path('docs/target-mockup-audit');phase=sys.argv[1] if len(sys.argv)>1 else 'before'
inventory=json.loads((root/'inventory.json').read_text())
rows=[]
for item in inventory:
 actual=root/phase/(item['key']+'.png')
 if not actual.exists():continue
 ref=Image.open(item['reference']).convert('RGB').resize((836,470));cur=Image.open(actual).convert('RGB').resize((836,470))
 a=np.asarray(ref,dtype=float);b=np.asarray(cur,dtype=float)
 rows.append({**item,'capture':str(actual),'meanAbsoluteChannelError':round(float(np.abs(a-b).mean()),2)})
(root/phase/'metrics.json').write_text(json.dumps(rows,indent=2))
groups={}
for r in rows:groups.setdefault(r['family'],[]).append(r)
for family,items in groups.items():
 for batch in range(0,len(items),8):
  canvas=Image.new('RGB',(1672,1080),'#eef1f5');d=ImageDraw.Draw(canvas)
  for j,r in enumerate(items[batch:batch+8]):
   x=(j%2)*836;y=(j//2)*270
   d.text((x+8,y+5),r['key']+' | TARGET / CURRENT | MAE '+str(r['meanAbsoluteChannelError']),fill='#152943')
   for offset,file in [(0,r['reference']),(418,r['capture'])]:
    im=Image.open(file).convert('RGB');im.thumbnail((418,235));canvas.paste(im,(x+offset,y+26))
  canvas.save(root/phase/f'sheet-{family}-{batch//8+1:02}.jpg',quality=90)
print(f'{phase}: scored {len(rows)} screens; contact sheets saved')
