import argparse, json
from pathlib import Path
import cv2
import numpy as np

def ssim_map(a, b):
    a=a.astype(np.float64); b=b.astype(np.float64)
    c1=(.01*255)**2; c2=(.03*255)**2
    mu_a=cv2.GaussianBlur(a,(11,11),1.5); mu_b=cv2.GaussianBlur(b,(11,11),1.5)
    var_a=cv2.GaussianBlur(a*a,(11,11),1.5)-mu_a*mu_a
    var_b=cv2.GaussianBlur(b*b,(11,11),1.5)-mu_b*mu_b
    cov=cv2.GaussianBlur(a*b,(11,11),1.5)-mu_a*mu_b
    return ((2*mu_a*mu_b+c1)*(2*cov+c2))/((mu_a*mu_a+mu_b*mu_b+c1)*(var_a+var_b+c2))

def regions_for(screen,w,h):
    if screen=='home': return {
      'header':(0,0,w,50),'title-and-intro':(0,50,int(.49*w),220),
      'theory-and-chart':(0,220,int(.49*w),720),'main-apparatus':(int(.49*w),50,w,720),
      'activity-cards':(0,720,w,h)}
    if screen=='tlc-method-development': return {
      'header-and-breadcrumb':(0,0,w,50),'title-and-controls':(0,50,443,857),
      'main-apparatus':(443,50,1253,668),'instructional-cards':(443,668,1253,857),
      'analysis-panel':(1253,50,w,857),'bottom-navigation':(0,857,w,h)}
    return {'full-screen':(0,0,w,h)}

ap=argparse.ArgumentParser();ap.add_argument('reference');ap.add_argument('actual');ap.add_argument('output_base');ap.add_argument('--screen',required=True);args=ap.parse_args()
ref=cv2.imread(args.reference,cv2.IMREAD_COLOR);act=cv2.imread(args.actual,cv2.IMREAD_COLOR)
if ref is None or act is None: raise SystemExit('Unable to read an input image')
if ref.shape!=act.shape: raise SystemExit(f'Image dimensions differ: {ref.shape} != {act.shape}')
maps=[ssim_map(ref[:,:,i],act[:,:,i]) for i in range(3)]; score_map=np.mean(maps,axis=0); h,w=score_map.shape
regions={name:round(float(np.clip(score_map[y1:y2,x1:x2].mean(),0,1))*100,2) for name,(x1,y1,x2,y2) in regions_for(args.screen,w,h).items()}
overall=round(float(np.clip(score_map.mean(),0,1))*100,2); mae=round(float(np.abs(ref.astype(float)-act.astype(float)).mean()),3)
heat=(np.clip(1-score_map,0,1)*255).astype(np.uint8);heat=cv2.applyColorMap(heat,cv2.COLORMAP_TURBO);overlay=cv2.addWeighted(act,.68,heat,.32,0)
base=Path(args.output_base);base.parent.mkdir(parents=True,exist_ok=True);cv2.imwrite(str(base)+'-heatmap.png',heat);cv2.imwrite(str(base)+'-overlay.png',overlay)
result={'metric':'windowed RGB SSIM (11×11 Gaussian, σ=1.5)','width':w,'height':h,'overallSimilarity':overall,'regionScores':regions,'meanAbsoluteChannelError':mae,'passesOverall':overall>=95,'passesRegions':all(v>=90 for v in regions.values()),'status':'verified' if overall>=95 and all(v>=90 for v in regions.values()) else 'visual-failed'}
Path(str(base)+'-metrics.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result))
