"""Independent Decimal equilibrium/kinetic calculations and seeded-path reconstruction."""
from pathlib import Path
from decimal import Decimal as D,getcontext
import json,math,sys,csv,statistics
getcontext().prec=70
ROOT=Path('docs/chemistry-91-audit');fixtures=json.loads((ROOT/'colloids-reference-fixtures.json').read_text());KB=D('1.380649e-23');PI=D('3.141592653589793238462643383279502884197169399375105820974944592307816')
reference_count=len(fixtures)
if '--ui' in sys.argv:
 book=json.loads((ROOT/'colloids-ui-notebook.json').read_text(encoding='utf8'));fixtures+=book['records']
def dec(x):return D(str(x))
def rng(seed):
 state=seed&0xffffffff
 while True:
  state=(state+0x6d2b79f5)&0xffffffff;t=((state^(state>>15))*(1|state))&0xffffffff;t=(t^(t+((t^(t>>7))*(61|t)&0xffffffff)))&0xffffffff
  yield ((t^(t>>14))&0xffffffff)/4294967296
noise={}
def brownian(seed,tick,diffusion):
 key=(seed,tick)
 if key not in noise:
  random=rng(seed);p=[0.]*192
  for step in range(tick):
   for i in range(0,192,2):
    radius=math.sqrt(-2*math.log(next(random)));angle=2*math.pi*next(random);p[i]+=math.sqrt(.1)*radius*math.cos(angle);p[i+1]+=math.sqrt(.1)*radius*math.sin(angle)
  noise[key]=sum(x*x for x in p)/64
 return noise[key]*float(diffusion)
coag={}
def event_clocks(seed):
 if seed not in coag:
  random=rng(seed^0x21a63f);clock=0;times=[]
  for n in range(64,1,-1):
   clock+=-math.log(next(random))/(n*(n-1)/2);next(random);next(random);times.append(clock)
  coag[seed]=times
 return coag[seed]
checks=0
for case in fixtures:
 v=case['values'];r=case['reading'];temperature=dec(v['temperature']);eta=dec(v['viscosity'])*D('.001');radius=dec(v['radius'])*D('1e-9');time=dec(v['tick'])*D('.05');diffusion=KB*temperature/(6*PI*eta*radius)*D('1e12');kernel=8*KB*temperature/(3*eta);n0=D(10)**dec(v['logN']);w=D(10)**dec(v['logW']);half=2*w/(kernel*n0);volume=dec(v['volume']);mass=dec(v['mass']);c0=dec(v['c0']);qmax=dec(v['qmax']);k=dec(v['affinity']);initial=volume*c0
 if v['adsorption']=='langmuir':
  b=volume+mass*qmax*k-volume*c0*k;ce=(-b+(b*b+4*volume*k*initial).sqrt())/(2*volume*k);q=qmax*k*ce/(1+k*ce);theta=k*ce/(1+k*ce)
 else:
  lo=D(0);hi=c0
  for _ in range(240):
   mid=(lo+hi)/2;q=dec(v['kf'])*mid**dec(v['alpha'])
   if volume*mid+mass*q>initial:hi=mid
   else:lo=mid
  ce=(lo+hi)/2;q=dec(v['kf'])*ce**dec(v['alpha']);theta=None
 clocks=event_clocks(v['seed']);scale=D(64)/n0*w/kernel;clusters=64-sum(dec(clock)*scale<=time for clock in clocks)
 expected={'timeS':time,'diffusionUm2S':diffusion,'expectedMSDUm2':6*diffusion*time,'sampleMSDUm2':brownian(v['seed'],v['tick'],diffusion),'kernelM3S':kernel,'halfTimeS':half,'expectedCount':64/(1+time/half),'clusterCount':clusters,'conservedMonomers':64,'meanClusterMass':D(64)/clusters,'illustrativeCCCMm':dec(v['ccc1'])/dec(v['valence'])**6,'ceMgL':ce,'qMgG':q,'initialMg':initial,'adsorbedMg':mass*q,'dissolvedMg':volume*ce,'removalFraction':mass*q/initial if initial else D(0),'theta':theta}
 for field,value in expected.items():
  actual=r[field]
  if value is None:assert actual is None
  else:assert abs(float(value)-actual)<=2e-10*max(abs(float(value)),1e-20),(field,actual,value,v)
  checks+=1
 assert abs(r['balanceResidualMg'])<1e-11
print(f'PASS:{checks} independent Decimal/seeded-process fields across{len(fixtures)} fixtures. Adsorption mass balance,70-digit equilibrium,Stokes–Einstein,pair-kernel half time,finite aggregation count and Brownian sample MSD reconstructed.')
(ROOT/'colloids-reference-validation.json').write_text(json.dumps({'fixtures':len(fixtures),'fields':checks,'decimalPrecision':70,'toleranceRelative':2e-10,'scope':'Computational consistency, not empirical material/CCC calibration.'},indent=2))
if '--ui' in sys.argv:
 rows=list(csv.DictReader((ROOT/'colloids-ui-observations.csv').open(newline='',encoding='utf8')));assert len(rows)==len(book['records']);computed=0;metadata=0
 for record,row in zip(book['records'],rows):
  assert int(row['id'])==record['id'] and row['included']==str(record['included']).lower()
  for key,value in record['values'].items():
   if isinstance(value,(float,int)):assert abs(float(row[key])-value)<=1e-12*max(abs(value),1)
   else:assert row[key]==value
   metadata+=1
  for key,value in record['reading'].items():
   if value is None:assert row[key]==''
   else:assert abs(float(row[key])-value)<=1e-12*max(abs(value),1e-25)
   computed+=1
 assert len({r['values']['mode'] for r in book['records']})==3
 message=f'PASS:{len(rows)} actual UI records across three modes;{computed} CSV/JSON computed fields and{metadata} input metadata fields checked. Independent Decimal/seeded-process reconstruction also checked every UI record above.'
 print(message);(ROOT/'colloids-export-validation.txt').write_text(message+'\n',encoding='utf8');forged=json.loads(json.dumps(book));forged['records'][0]['reading']['kernelM3S']=1e-10;(ROOT/'colloids-forged-notebook.json').write_text(json.dumps(forged))
 fits=[]
 for model,ids in [('langmuir',range(40,46)),('freundlich',range(46,52))]:
  group=[r for r in book['records'] if r['id'] in ids];assert len(group)==6 and all(r['values']['adsorption']==model for r in group)
  ce=[r['reading']['ceMgL'] for r in group];q=[r['reading']['qMgG'] for r in group]
  if model=='langmuir':
   slope,intercept=statistics.linear_regression(ce,[x/y for x,y in zip(ce,q)]);fit={'model':model,'qmax':1/slope,'affinity':slope/intercept};assert abs(fit['qmax']-80)<1e-8 and abs(fit['affinity']-.12)<1e-10
  else:
   slope,intercept=statistics.linear_regression([math.log(x) for x in ce],[math.log(y) for y in q]);fit={'model':model,'kf':math.exp(intercept),'alpha':slope};assert abs(fit['kf']-8)<1e-8 and abs(fit['alpha']-.65)<1e-10
  fits.append(fit)
 (ROOT/'colloids-fit-validation.json').write_text(json.dumps(fits,indent=2));print('PASS:two independent isotherm fits recover assigned parameters from12 actual UI observations.')
 states=[r['values'] for r in book['records']]
 coag_matrix={(v['logN'],v['logW'],v['tick']) for v in states if v['mode']=='coagulation'}
 assert all((n,w,t) in coag_matrix for n in [14,16,18] for w in [0,2,4] for t in [0,200,1200])
 signs={(v['solSign'],v['valence']) for v in states if v['mode']=='coagulation'};assert all((s,z) in signs for s in [-1,1] for z in [1,2,3])
 brown={(v['temperature'],v['radius'],v['viscosity'],v['seed'],v['tick']) for v in states if v['mode']=='brownian'}
 assert (273,20,.5,1,200) in brown and (333,500,10,99999,200) in brown
 assert all((298,100,1,431,tick) in brown for tick in [0,1,200,1200])
 assert all(any(v['mode']=='adsorption' and v['adsorption']==model and v['c0']==c0 for v in states) for model in ['langmuir','freundlich'] for c0 in [0,1,5,10,20,50,100])
 print('PASS:actual export contains the full27-case coagulation matrix,six counter-ion sign/valence cases,Brownian parameter/time boundaries and both adsorption concentration series including zero.')
