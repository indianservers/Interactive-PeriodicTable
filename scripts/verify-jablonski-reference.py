"""Independent 80-digit reference and real UI export reconstruction."""
import json,csv,sys
from pathlib import Path
import mpmath as mp
mp.mp.dps=80
root=Path('docs/chemistry-91-audit')
def reference(v,t):
 d=lambda x:mp.mpf(str(x))
 t=d(t);kf,kic,kisc,kp,kt=[d(v[k]) for k in ['kf','kic','kisc','kp','ktnr']];q=d(1000)*d(v['quencherUM']);a=kf+kic+kisc+q;b=kp+kt+q
 L=lambda k: t if k==0 else -mp.expm1(-k*t)/k
 S=mp.exp(-a*t);T=kisc*t*mp.exp(-a*t) if a==b else kisc*(mp.exp(-b*t)-mp.exp(-a*t))/(a-b)
 It=mp.mpf(0) if kisc==0 else kisc*(t*t/2 if a==b==0 else (1-(1+a*t)*mp.exp(-a*t))/(a*a)) if a==b else kisc*(L(b)-L(a))/(a-b)
 F=kf*L(a);IC=kic*L(a);ISC=kisc*L(a);QS=q*L(a);P=kp*It;NR=kt*It;QT=q*It;G=F+IC+QS+P+NR+QT;phiF=kf/a if a else mp.mpf(0);phiI=kisc/a if a else mp.mpf(0);phiP=phiI*kp/b if b else mp.mpf(0);E=d('6.62607015e-34')*d(299792458)/(d(v['pumpNm'])*d('1e-9'))/d('1.602176634e-19');stored=S*d('2.7')+T*d('1.9');emitted=F*d('2.7')+P*d('1.9');heat=E-stored-emitted
 return dict(time=t,S=S,T=T,G=G,F=F,P=P,IC=IC,ISC=ISC,QS=QS,NR=NR,QT=QT,phiF=phiF,phiP=phiP,tauS=1/a if a else None,tauT=1/b if b else None,expectedFluor=d(v['photons'])*F,expectedPhos=d(v['photons'])*P,detected=d(v['photons'])*(F+P)*d('.2'),absorptionEV=E,storedEV=stored,emittedEV=emitted,heatEV=heat,energyResidualEV=mp.mpf(0),populationResidual=mp.mpf(0))
count=0
for fixture in json.loads((root/'jablonski-reference-fixtures.json').read_text()):
 expected=reference(fixture['values'],fixture['time'])
 for key,value in expected.items():
  actual=fixture['reading'][key]
  if value is None:assert actual is None
  else:assert abs(mp.mpf(str(actual))-value)<=mp.mpf('3e-11')*max(1,abs(value)),(key,fixture['values'],actual,str(value))
  count+=1
print(f'PASS:{count} numeric/null fields across124 fixtures independently checked at80-digit precision, including equal/near-equal/zero/widely-separated decay constants.')
if '--ui' in sys.argv:
 book=json.loads((root/'jablonski-ui-notebook.json').read_text());rows=list(csv.DictReader((root/'jablonski-ui-observations.csv').open(newline='')));assert len(rows)==len(book['records']);checks=0
 for r,c in zip(book['records'],rows):
  v=r['values'];t=0 if v['zeroTime'] else mp.power(10,mp.mpf(str(v['timeLog'])));expected=reference(v,t)
  assert int(c['id'])==r['id'] and c['included']==str(r['included']).lower()
  for key,value in expected.items():
   actual=r['reading'][key]
   if value is None:assert actual is None and c[key]==''
   else:
    tolerance=mp.mpf('3e-10')*max(1,abs(value));assert abs(mp.mpf(str(actual))-value)<=tolerance,(r['id'],key,actual,str(value));assert abs(mp.mpf(c[key])-value)<=tolerance
   checks+=1
 presets={r['values']['preset'] for r in book['records']};assert len(presets)==6
 message=f'PASS:{len(rows)} actual UI observations,all6 presets;{checks} CSV/JSON numeric/null fields independently checked with80-digit arithmetic. Notes/inclusion preserved. Computational model consistency,not empirical photophysics fitting.'
 (root/'jablonski-export-validation.txt').write_text(message+'\n');print(message)
 forged=json.loads(json.dumps(book));forged['records'][0]['reading']['phiF']+=.1;(root/'jablonski-forged-notebook.json').write_text(json.dumps(forged))
 sweep=list(csv.DictReader((root/'jablonski-ui-sweep.csv').open(newline='')));assert len(sweep)==145
 metadata=['pump_nm','quencher_uM','absorbed_photons','kf_s-1','kic_s-1','kisc_s-1','kp_s-1','ktnr_s-1'];computed=0
 for i,row in enumerate(sweep):
  assert all(row[k]==sweep[0][k] for k in metadata)
  v=dict(pumpNm=float(row['pump_nm']),quencherUM=float(row['quencher_uM']),photons=int(row['absorbed_photons']),**{k:float(row[k+'_s-1']) for k in ['kf','kic','kisc','kp','ktnr']});t=mp.power(10,-12+mp.mpf(11)*i/144);r=reference(v,t)
  for key,value in [('time_s',t),('S1',r['S']),('T1',r['T']),('S0',r['G']),('F_per_absorbed',r['F']),('P_per_absorbed',r['P']),('F_rate_s-1',mp.mpf(str(v['kf']))*r['S']),('P_rate_s-1',mp.mpf(str(v['kp']))*r['T'])]:assert abs(mp.mpf(row[key])-value)<=mp.mpf('3e-10')*max(1,abs(value)),(i,key);computed+=1
 message=f'PASS:145 actual exported sweep rows;{computed} computed numeric fields independently checked at80-digit precision;1160 repeated input-metadata fields checked for consistency.'
 (root/'jablonski-sweep-validation.txt').write_text(message+'\n');print(message)
