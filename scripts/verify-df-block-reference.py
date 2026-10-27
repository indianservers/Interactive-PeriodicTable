"""Independent full-matrix NumPy reference; does not execute the JS model."""
from pathlib import Path
import json,itertools,math,sys,csv
import numpy as np

C={'h':6.62607015e-34,'c':299792458,'k':1.380649e-23,'muB':9.2740100657e-24,'mu0':1.25663706127e-6,'NA':6.02214076e23}
cmj=C['h']*C['c']*100;kcm=C['k']/cmj;bcm=C['muB']/cmj
checks=0
def check(actual,expected,label):
 global checks
 if expected is None:assert actual is None,label
 else:assert math.isfinite(actual) and math.isclose(actual,float(expected),rel_tol=2e-8,abs_tol=2e-11 if abs(expected)>1e-7 else 1e-18),(label,actual,expected)
 checks+=1
def angular(j):
 ms=np.arange(-j,j+1);plus=np.zeros((len(ms),len(ms)),complex)
 for i,m in enumerate(ms[:-1]):plus[i+1,i]=math.sqrt(j*(j+1)-m*(m+1))
 return (plus+plus.T)/2,(plus-plus.T)/(2j),np.diag(ms)
def magnetic(L,S,lam,T,B):
 lx,ly,lz=angular(L);sx,sy,sz=angular(S);il=np.eye(int(2*L+1));is_=np.eye(int(2*S+1))
 q=np.kron(lz,is_)+2*np.kron(il,sz);h=lam*(np.kron(lx,sx)+np.kron(ly,sy)+np.kron(lz,sz))
 def states(field):
  e,u=np.linalg.eigh(h+bcm*field*q);p=np.exp(-(e-e.min())/(kcm*T));p/=p.sum();return e,u,p
 e,u,p=states(B);mag=-np.dot(p,np.diag(u.conj().T@q@u).real)
 e,u,p=states(0);qj=u.conj().T@q@u;response=0
 for i in range(len(e)):
  for j in range(len(e)):
   gap=e[j]-e[i]
   factor=p[i]/(kcm*T) if abs(gap)<1e-8 else (p[i]-p[j])/gap
   response+=factor*abs(qj[i,j])**2
 response-=np.dot(p,np.diag(qj).real)**2/(kcm*T)
 slope=bcm*response;return mag,C['mu0']*C['NA']*C['muB']*slope,math.sqrt(max(0,3*C['k']*T/C['muB']*slope))
r6=[1.032,1.010,.990,.983,.970,.958,.947,.938,.923,.912,.901,.890,.880,.868,.861]
r8=[1.160,1.143,1.126,1.109,1.093,1.079,1.066,1.053,1.040,1.027,1.015,1.004,.994,.985,.977]
symbols=['La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu']
ions={'Sc3':(21,3,0),'Ti3':(22,3,1),'Ti4':(22,4,0),'V3':(23,3,2),'Cr2':(24,2,4),'Cr3':(24,3,3),'Mn2':(25,2,5),'Mn3':(25,3,4),'Fe2':(26,2,6),'Fe3':(26,3,5),'Co2':(27,2,7),'Co3':(27,3,6),'Ni2':(28,2,8),'Cu1':(29,1,10),'Cu2':(29,2,9),'Zn2':(30,2,10),'Zr4':(40,4,0),'Mo3':(42,3,3),'Ru2':(44,2,6),'Rh3':(45,3,6),'Pd2':(46,2,8),'Hf4':(72,4,0),'W6':(74,6,0),'Pt2':(78,2,8),'Au3':(79,3,8)}
fixtures=json.loads(Path('docs/chemistry-91-audit/df-block-reference-fixtures.json').read_text(encoding='utf8'))
ui_count=0
if '--ui' in sys.argv:
 book=json.loads(Path('docs/chemistry-91-audit/df-block-ui-notebook.json').read_text(encoding='utf8'));ui_count=len(book['records']);fixtures+=book['records']
for index,fixture in enumerate(fixtures):
 v=fixture['values'];r=fixture['reading'];expected={}
 if v['mode']=='d':
  Z,q,n=ions[v['dIon']];candidates=[]
  for occupied in itertools.combinations(range(10),n):
   o=np.zeros((5,2),int)
   for spinorb in occupied:o[spinorb//2,spinorb%2]=1
   lower=o[:3].sum();pairs=np.sum(o.sum(axis=1)==2);unpaired=n-2*pairs;polar=o[:,0].sum()-o[:,1].sum()
   if abs(polar)!=unpaired:continue
   energy=v['delta']*(-.4*lower+.6*(n-lower))+v['pairing']*pairs
   candidates.append((energy,-unpaired,-polar,o,lower,pairs))
  best=min(candidates,key=lambda a:(round(a[0],7),a[1],a[2]));energy,negU,_,o,lower,pairs=best;S=-negU/2;L=0;J=S;g=2 if J else None;lam=0
  expected.update(pairs=int(pairs),lower=int(lower),upper=int(n-lower),energyCM=energy,cfseCM=v['delta']*(-.4*lower+.6*(n-lower)),orbitalGapEV=cmj*v['delta']/1.602176634e-19)
  gaps=[]
  for a in range(3):
   for b in range(3,5):
    for spin in range(2):
     if o[a,spin] and not o[b,spin]:gaps.append(v['delta']+v['pairing']*(o[b,1-spin]-o[a,1-spin]))
  profile=sum(math.exp(-4*math.log(2)*((1e7/v['wavelength']-gap)/v['width'])**2) for gap in gaps)/len(gaps) if gaps else 0
  A=v['epsilon']*profile*v['concentration']*v['path'];expected.update(promotionSlots=len(gaps),absorbance=A,transmittance=10**(-A))
  if gaps:
   unique=sorted(set(gaps));dominant=max(unique,key=lambda gap:gaps.count(gap));expected['peakNm']=1e7/dominant if dominant>0 else None
  else:expected['peakNm']=None
 else:
  n=symbols.index(v['lanthanide']);Z=57+n;q=3;u=min(n,14-n);S=u/2;L=sum(sorted(range(-3,4),reverse=True)[:u]);J=abs(L-S) if n<=7 else L+S;g=1+(J*(J+1)+S*(S+1)-L*(L+1))/(2*J*(J+1)) if J else None;lam=v['lambda']*(1 if n<=7 else -1)
 expected.update(electrons=Z-q,charge=q,subshellElectrons=n,unpaired=int(2*S),S=S,L=L,J=J,g=g,muSpin=math.sqrt(4*S*(S+1)),muGround=(g*math.sqrt(J*(J+1)) if g else 0))
 mag,chi,app=magnetic(L,S,lam,v['temperature'],v['field']);expected.update(magnetizationMuB=mag,chiM=chi,muApp=app)
 radii=r6 if v['cn']==6 else r8;radius=radii[symbols.index(v['lanthanide'])];expected.update(radiusAngstrom=radius,selectedContractionPercent=100*(radii[0]-radius)/radii[0],totalContractionPercent=100*(radii[0]-radii[-1])/radii[0],zrHfDifferenceAngstrom=.01)
 for name,value in expected.items():check(r[name],value,f'{index}:{name}')
reference_checks=checks
csv_fields=0
if '--ui' in sys.argv:
 with Path('docs/chemistry-91-audit/df-block-ui-observations.csv').open(encoding='utf8',newline='') as f:exported=list(csv.DictReader(f))
 assert len(exported)==ui_count
 for row,record in zip(exported,book['records']):
  assert int(row['id'])==record['id'] and row['included']==str(record['included']).lower()
  for name,value in {**record['values'],**record['reading']}.items():
   if value is None:assert row[name]==''
   elif isinstance(value,(float,int)):check(float(row[name]),value,'CSV:'+name)
   else:assert row[name]==str(value)
   csv_fields+=1
report={'csvFields':csv_fields,'fixtures':len(fixtures),'independentFields':reference_checks,'csvNumericChecks':checks-reference_checks,'method':'Full complex Kronecker LS Hamiltonian with NumPy eigh; complete spin-orbital combination filling; Gaussian configuration gaps; fixed-CN Shannon table','status':'PASS','uiRecords':ui_count}
Path('docs/chemistry-91-audit/df-block-reference-validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report))
